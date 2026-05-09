(() => {
  window.XM = window.XM || {};
  window.XM.Characters = window.XM.Characters || {};

  function call(callbacks, name, ...args) {
    const fn = callbacks?.[name];
    if (typeof fn !== "function") return undefined;
    return fn(...args);
  }

  function getPlayerLevelExpRequirement(level) {
    return Math.floor(100 + (level - 1) * 60 + Math.pow(level - 1, 1.35) * 25);
  }

  function getMaxDeploySlots({ level, deploySlotUnlocks }) {
    return deploySlotUnlocks.reduce(
      (slots, unlock) => (level >= unlock.level ? unlock.deploySlots : slots),
      1,
    );
  }

  function getNextCharacterUnlock({ playerProfile, playerLevelUnlocks }) {
    return playerLevelUnlocks.find(
      (unlock) => unlock.level > playerProfile.playerLevel && !playerProfile.ownedCharacters.includes(unlock.characterId),
    );
  }

  function getNextDeploySlotUnlock({ playerProfile, deploySlotUnlocks }) {
    return deploySlotUnlocks.find((unlock) => unlock.level > playerProfile.playerLevel);
  }

  function grantCharacter({ playerProfile, DATA, characterId, source = "unlock", duplicateRefund = 0, callbacks }) {
    if (!DATA.roles[characterId]) return { ok: false, reason: "missing_character", characterId, isNew: false };
    if (playerProfile.ownedCharacters.includes(characterId)) {
      if (source === "gacha") playerProfile.spiritStones += duplicateRefund;
      call(callbacks, "syncPlayerMetaAliases");
      call(callbacks, "savePlayerProfile");
      return { ok: true, reason: "duplicate", characterId, isNew: false, refunded: source === "gacha" ? duplicateRefund : 0 };
    }
    playerProfile.ownedCharacters.push(characterId);
    playerProfile.characterLevels[characterId] = playerProfile.characterLevels[characterId] || 1;
    call(callbacks, "syncPlayerMetaAliases");
    call(callbacks, "savePlayerProfile");
    return { ok: true, reason: "new", characterId, isNew: true, refunded: 0 };
  }

  function applyPlayerLevelUnlocks({ playerProfile, DATA, playerLevelUnlocks, deploySlotUnlocks, callbacks }) {
    const unlocked = [];
    playerLevelUnlocks.forEach((unlock) => {
      if (unlock.type === "character" && playerProfile.playerLevel >= unlock.level) {
        const result = grantCharacter({
          playerProfile,
          DATA,
          characterId: unlock.characterId,
          source: "level",
          callbacks,
        });
        if (result.isNew) unlocked.push(unlock.description);
      }
    });
    playerProfile.maxDeploySlots = getMaxDeploySlots({
      level: playerProfile.playerLevel,
      deploySlotUnlocks,
    });
    call(callbacks, "syncPlayerMetaAliases");
    call(callbacks, "savePlayerProfile");
    return unlocked;
  }

  function checkPlayerLevelUp({ playerProfile, DATA, playerLevelUnlocks, deploySlotUnlocks, callbacks }) {
    const rewards = [];
    while (playerProfile.playerExp >= getPlayerLevelExpRequirement(playerProfile.playerLevel)) {
      playerProfile.playerExp -= getPlayerLevelExpRequirement(playerProfile.playerLevel);
      playerProfile.playerLevel += 1;
      rewards.push(`玩家等级提升到${playerProfile.playerLevel}`);
      rewards.push(
        ...applyPlayerLevelUnlocks({
          playerProfile,
          DATA,
          playerLevelUnlocks,
          deploySlotUnlocks,
          callbacks,
        }),
      );
    }
    call(callbacks, "syncPlayerMetaAliases");
    return rewards;
  }

  function getCharacterLevel({ playerProfile, characterId }) {
    return playerProfile.characterLevels[characterId] || 1;
  }

  function getFlatDamageGrowthByRarity({ rarity, characterRarity }) {
    if (rarity === characterRarity.UR) return 5;
    if (rarity === characterRarity.SSR) return 4;
    return 3;
  }

  function getPercentGrowthByRarity({ rarity, characterRarity }) {
    if (rarity === characterRarity.UR) return 0.12;
    if (rarity === characterRarity.SSR) return 0.1;
    return 0.08;
  }

  function getCharacterBaseFinalDamage({ playerProfile, character, characterRarity }) {
    const level = getCharacterLevel({ playerProfile, characterId: character.id });
    const levelDelta = level - 1;
    return (
      character.baseDamage +
      levelDelta * getFlatDamageGrowthByRarity({ rarity: character.rarity, characterRarity }) +
      character.baseDamage * levelDelta * getPercentGrowthByRarity({ rarity: character.rarity, characterRarity })
    );
  }

  function getCharacterUpgradeCost({ characterLevel, rarity }) {
    const rarityBase = {
      SR: 80,
      SSR: 140,
      UR: 240,
      SP: 360,
    };
    const rarityGrowth = {
      SR: 1.5,
      SSR: 1.6,
      UR: 1.7,
      SP: 1.8,
    };
    return Math.floor((rarityBase[rarity] || rarityBase.SR) * Math.pow(rarityGrowth[rarity] || rarityGrowth.SR, characterLevel - 1));
  }

  function upgradeCharacter({ playerProfile, DATA, characterId, callbacks }) {
    if (!playerProfile.ownedCharacters.includes(characterId)) return { ok: false, reason: "not_owned", characterId };
    const character = DATA.roles[characterId];
    const level = getCharacterLevel({ playerProfile, characterId });
    const cost = getCharacterUpgradeCost({ characterLevel: level, rarity: character.rarity });
    if (playerProfile.spiritStones < cost) {
      return { ok: false, reason: "not_enough_spirit_stones", characterId, character, level, cost };
    }
    playerProfile.spiritStones -= cost;
    playerProfile.characterLevels[characterId] = level + 1;
    call(callbacks, "syncPlayerMetaAliases");
    call(callbacks, "savePlayerProfile");
    return { ok: true, reason: "upgraded", characterId, character, oldLevel: level, newLevel: level + 1, cost };
  }

  function drawGachaRarity({ characterRarity, random = Math.random }) {
    const roll = random();
    if (roll < 0.05) return characterRarity.UR;
    if (roll < 0.3) return characterRarity.SSR;
    return characterRarity.SR;
  }

  function performGacha({ playerProfile, DATA, gachaCost, duplicateRefund, characterRarity, callbacks, random = Math.random }) {
    if (playerProfile.spiritStones < gachaCost) {
      return { ok: false, reason: "not_enough_spirit_stones", cost: gachaCost };
    }
    playerProfile.spiritStones -= gachaCost;
    const pool = Object.values(DATA.roles).filter((role) => role.unlockType === "gacha");
    const rarity = drawGachaRarity({ characterRarity, random });
    const rarityPool = pool.filter((role) => role.rarity === rarity);
    const candidates = rarityPool.length ? rarityPool : pool;
    const result = candidates[Math.floor(random() * candidates.length)];
    if (!result) return { ok: false, reason: "empty_pool", rarity };
    const grantResult = grantCharacter({
      playerProfile,
      DATA,
      characterId: result.id,
      source: "gacha",
      duplicateRefund,
      callbacks,
    });
    call(callbacks, "syncPlayerMetaAliases");
    call(callbacks, "savePlayerProfile");
    return {
      ok: true,
      reason: grantResult.isNew ? "new" : "duplicate",
      character: result,
      rarity,
      isNew: grantResult.isNew,
      refunded: grantResult.refunded,
    };
  }

  Object.assign(window.XM.Characters, {
    applyPlayerLevelUnlocks,
    checkPlayerLevelUp,
    drawGachaRarity,
    getCharacterBaseFinalDamage,
    getCharacterLevel,
    getCharacterUpgradeCost,
    getFlatDamageGrowthByRarity,
    getMaxDeploySlots,
    getNextCharacterUnlock,
    getNextDeploySlotUnlock,
    getPercentGrowthByRarity,
    getPlayerLevelExpRequirement,
    grantCharacter,
    performGacha,
    upgradeCharacter,
  });
})();
