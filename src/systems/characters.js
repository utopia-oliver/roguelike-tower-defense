(() => {
  window.XM = window.XM || {};
  window.XM.Characters = window.XM.Characters || {};

  function call(callbacks, name, ...args) {
    const fn = callbacks?.[name];
    if (typeof fn !== "function") return undefined;
    return fn(...args);
  }

  function isEnemyTargetable(enemy) {
    const shared = window.XM.Enemies?.isEnemyTargetable;
    if (typeof shared === "function") return shared(enemy);
    return Boolean(enemy && enemy.hp > 0 && !enemy.dead && !enemy.isDead && enemy.state !== "dead" && enemy.state !== "DYING" && !enemy.markedForRemoval);
  }

  function isEnemyInFrontOfRole(enemy, role) {
    return Boolean(
      enemy &&
        role &&
        Number.isFinite(enemy.x) &&
        Number.isFinite(enemy.y) &&
        Number.isFinite(role.x) &&
        Number.isFinite(role.y) &&
        enemy.y < role.y - 8,
    );
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

  function getMaxArtifactSlots({ level, artifactSlotUnlocks }) {
    return (artifactSlotUnlocks || []).reduce(
      (slots, unlock) => (level >= unlock.level ? unlock.artifactSlots : slots),
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

  function applyPlayerLevelUnlocks({ playerProfile, DATA, playerLevelUnlocks, deploySlotUnlocks, artifactSlotUnlocks, callbacks }) {
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
    playerProfile.maxArtifactSlots = getMaxArtifactSlots({
      level: playerProfile.playerLevel,
      artifactSlotUnlocks,
    });
    call(callbacks, "syncPlayerMetaAliases");
    call(callbacks, "savePlayerProfile");
    return unlocked;
  }

  function checkPlayerLevelUp({ playerProfile, DATA, playerLevelUnlocks, deploySlotUnlocks, artifactSlotUnlocks, callbacks }) {
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
          artifactSlotUnlocks,
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

  function isDeployable({ grid, col, row }) {
    return row === grid.rows - 1 && col >= 0 && col < grid.columns;
  }

  function cellCenter({ grid, col, row }) {
    return {
      x: col * grid.cellW + grid.cellW / 2,
      y: row * grid.cellH + grid.cellH / 2,
    };
  }

  function roleAt({ state, col, row }) {
    return state.deployedRoles.find((role) => role.col === col && role.row === row);
  }

  function deployRole({ state, DATA, playerProfile, grid, col, row, appState, deployState, lobbyState, callbacks }) {
    if (appState === lobbyState) {
      call(callbacks, "setStatus", "请先点击进入备战，再部署角色。");
      return { ok: false, reason: "not_in_loadout" };
    }
    if (appState !== deployState) {
      call(callbacks, "setStatus", "战斗已经开始，本局不再中途部署角色。");
      return { ok: false, reason: "not_in_deploy" };
    }
    if (!isDeployable({ grid, col, row })) {
      call(callbacks, "setStatus", "只能部署在最底部的护山大阵 / 护山阵眼区。");
      return { ok: false, reason: "not_deployable" };
    }
    if (roleAt({ state, col, row })) {
      call(callbacks, "setStatus", "该格已有宗门角色。");
      return { ok: false, reason: "occupied" };
    }
    if (state.deployedRoles.length >= playerProfile.maxDeploySlots) {
      call(callbacks, "setStatus", `上阵位已满，本局最多部署 ${playerProfile.maxDeploySlots} 名角色。`);
      return { ok: false, reason: "slots_full" };
    }
    if (state.deployedRoles.some((role) => role.roleId === state.selectedRoleId)) {
      call(callbacks, "setStatus", "每名角色本局只能部署一次。");
      return { ok: false, reason: "already_deployed" };
    }
    if (!state.availableRoles.includes(state.selectedRoleId)) {
      call(callbacks, "setStatus", "只能部署战前配置中选择的宗门角色。");
      return { ok: false, reason: "not_available" };
    }

    const config = DATA.roles[state.selectedRoleId];
    const pos = cellCenter({ grid, col, row });
    const role = {
      id: call(callbacks, "makeId"),
      roleId: config.id,
      col,
      row,
      x: pos.x,
      y: pos.y,
      cooldown: 0,
      attacks: 0,
      lastTargetId: null,
      sameTargetStacks: 0,
      personalDamage: 1,
      personalSpeed: 1,
    };
    state.deployedRoles.push(role);
    call(callbacks, "setStatus", `${config.name} 已入阵。`);
    call(callbacks, "renderSetupLists");
    call(callbacks, "updateUi");
    return { ok: true, role };
  }

  function roleStats({ state, DATA, grid, role, helpers }) {
    const config = DATA.roles[role.roleId];
    const art = helpers.martialBonuses(role.roleId);
    const hasGlobalBoost = state.deployedRoles.some(
      (item) => DATA.roles[item.roleId]?.passiveSkill === "global_formation_boost",
    );
    const arrayCoreRatio = state.arrayCoreMaxHp > 0 ? state.arrayCoreHp / state.arrayCoreMaxHp : 1;
    const sectLeaderBonus = hasGlobalBoost ? (arrayCoreRatio < 0.3 ? 1.1 : 1) : 1;
    const teamDamageAura = state.deployedRoles.reduce((bonus, item) => {
      if (item.id === role.id) return bonus;
      return bonus + (helpers.martialBonuses(item.roleId).teamDamageAura || 0);
    }, art.teamDamageAura || 0);
    const elderSwordCount =
      role.roleId === "role_yunhe_elder"
        ? 1 + state.deployedRoles.filter((item) => DATA.roles[item.roleId].school === "剑").length * 0.08
        : 1;
    return {
      damage:
        helpers.getCharacterBaseFinalDamage(config) *
        art.damageMult *
        state.bonuses.roleDamage *
        role.personalDamage *
        sectLeaderBonus *
        (1 + teamDamageAura) *
        (hasGlobalBoost ? 1.1 : 1) *
        elderSwordCount,
      interval: ((config.attackInterval || 1 / (config.baseAttackSpeed || 1)) * art.attackIntervalMult * art.giantSwordIntervalMult) / (state.bonuses.roleAttackSpeed * role.personalSpeed * art.attackSpeed),
      range: ((config.range || config.baseRange) + state.bonuses.roleRangeAdd + art.rangeAdd) * grid.cellH,
      school: config.school,
      projectile: config.trajectoryType || config.projectile,
    };
  }

  function updateRole({ state, DATA, role, dt, callbacks, helpers, timers = window }) {
    role.cooldown -= dt;
    if (role.cooldown > 0) return false;
    const stats = helpers.roleStats(role);
    const target = helpers.chooseTarget(role, stats.range);
    if (!target) return false;

    const config = DATA.roles[role.roleId];
    let attacks = 1 + state.bonuses.multishot;
    if (config.passiveSkill === "thunder_chain" && role.attacks % 4 === 3) {
      attacks += 1;
    }
    if (state.acquiredPerks.has("perk_outer_disciple_breakthrough") && role.attacks % 5 === 4) {
      attacks += 1;
    }
    for (let i = 0; i < attacks; i += 1) {
      timers.setTimeout(() => call(callbacks, "fireRole", role, target.id), i * 120);
    }
    role.attacks += 1;
    role.cooldown = Math.max(0.12, stats.interval);
    if ((config.talent || "").includes("连续攻击同一目标")) {
      if (role.lastTargetId === target.id) {
        role.sameTargetStacks = Math.min(5, role.sameTargetStacks + 1);
      } else {
        role.sameTargetStacks = 0;
      }
      role.lastTargetId = target.id;
    }
    return true;
  }

  function fireRole({ state, DATA, role, targetId, appState, battleState, callbacks, helpers, random = Math.random }) {
    if (appState !== battleState) return false;
    const target = state.enemies.find((enemy) => enemy.id === targetId && isEnemyTargetable(enemy) && isEnemyInFrontOfRole(enemy, role));
    if (!target) return false;
    const config = DATA.roles[role.roleId];
    const stats = helpers.roleStats(role);
    const art = helpers.martialBonuses(role.roleId);
    let damage = stats.damage;
    if ((config.passiveSkill || config.talent || "").includes("连续攻击同一目标")) {
      damage *= 1 + role.sameTargetStacks * 0.05 * state.bonuses.passiveMultiplier;
    }
    if (config.passiveSkill === "execute_low_hp" && target.hp / target.maxHp < 0.3) damage *= 1.8;
    if (random() < state.bonuses.critChance) {
      damage *= state.bonuses.critMult;
    }

    const visualType = config.visualType || "";
    const instantVisualTypes = new Set(["chain_lightning", "vertical_sweep", "horizontal_sweep", "wave_debuff"]);
    if (instantVisualTypes.has(visualType)) {
      call(callbacks, "resolveInstantRoleAttack", role, target, damage, {
        visualType,
        projectileCount: art.giantSword ? 1 : 1 + state.bonuses.sideProjectiles + art.projectileAdd,
      });
      return true;
    }

    const baseProjectileCount = config.trajectoryType === "multi" ? 3 : 1;
    const projectileCount = Math.min(
      art.giantSword ? 1 : 5,
      Math.max(art.projectileSet || 0, baseProjectileCount + state.bonuses.sideProjectiles + art.projectileAdd),
    );
    call(callbacks, "fireProjectileAttack", role, target, {
      projectileCount,
      volleyCount: art.giantSword ? 1 : art.volleyCount,
      volleyInterval: art.volleyInterval,
      damage,
    });
    return true;
  }

  function chooseTarget({ state, DATA, source, range, helpers }) {
    const config = DATA.roles[source.roleId] || {};
    const candidates = state.enemies.filter(
      (enemy) => isEnemyTargetable(enemy) && isEnemyInFrontOfRole(enemy, source) && helpers.distance(source, enemy) <= range,
    );
    if (!candidates.length) return null;
    if (config.trajectoryType === "execute") {
      return candidates.sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
    }
    return candidates.sort((a, b) => b.progress - a.progress)[0];
  }

  Object.assign(window.XM.Characters, {
    applyPlayerLevelUnlocks,
    cellCenter,
    checkPlayerLevelUp,
    chooseTarget,
    deployRole,
    drawGachaRarity,
    fireRole,
    getCharacterBaseFinalDamage,
    getCharacterLevel,
    getCharacterUpgradeCost,
    isEnemyInFrontOfRole,
    getFlatDamageGrowthByRarity,
    getMaxArtifactSlots,
    getMaxDeploySlots,
    getNextCharacterUnlock,
    getNextDeploySlotUnlock,
    getPercentGrowthByRarity,
    getPlayerLevelExpRequirement,
    grantCharacter,
    isDeployable,
    performGacha,
    roleAt,
    roleStats,
    updateRole,
    upgradeCharacter,
  });
})();
