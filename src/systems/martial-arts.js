(() => {
  window.XM = window.XM || {};
  window.XM.MartialArts = window.XM.MartialArts || {};

  function martialArtForCharacter({ data, characterId }) {
    return (data.martialArts || []).find((art) => art.ownerCharacterId === characterId);
  }

  function getScopedModifier({ state, bucket, id }) {
    state.modifiers = state.modifiers || { martialArt: {}, character: {}, artifact: {}, projectileType: {}, majorEvolution: {} };
    state.modifiers[bucket] = state.modifiers[bucket] || {};
    state.modifiers[bucket][id] = state.modifiers[bucket][id] || {};
    return state.modifiers[bucket][id];
  }

  function getMartialArtModifier({ state, martialArtId }) {
    const modifier = getScopedModifier({ state, bucket: "martialArt", id: martialArtId });
    modifier.damageMultiplier = modifier.damageMultiplier || 1;
    modifier.attackIntervalMultiplier = modifier.attackIntervalMultiplier || 1;
    modifier.pierceAdd = modifier.pierceAdd || 0;
    return modifier;
  }

  function getMartialArtLevelForRole({ state, data, roleId }) {
    const art = martialArtForCharacter({ data, characterId: roleId });
    return art ? state.martialArtLevels[art.id] || 0 : 0;
  }

  function martialLevelEffects({ state, data, roleId }) {
    const art = martialArtForCharacter({ data, characterId: roleId });
    if (art?.id === "ma_qingya_sword") return [];
    const level = art ? state.martialArtLevels[art.id] || 0 : 0;
    return art ? art.levels.filter((item) => item.level <= level) : [];
  }

  function getMartialBranchState({ state, martialArtId, createIfMissing = true }) {
    state.martialArtBranches = state.martialArtBranches || {};
    if (!state.martialArtBranches[martialArtId] && createIfMissing) state.martialArtBranches[martialArtId] = {};
    return state.martialArtBranches[martialArtId] || {};
  }

  function hasMartialBranchUpgrade({ state, martialArtId, upgradeId }) {
    return Boolean(getMartialBranchState({ state, martialArtId })[upgradeId]);
  }

  function qingyaAttackParamsFromBranches({ state, upgrades, extraUpgrade = null }) {
    const artId = "ma_qingya_sword";
    const chosen = getMartialBranchState({ state, martialArtId: artId });
    const extraUpgradeId = typeof extraUpgrade === "string" ? extraUpgrade : extraUpgrade?.id;
    const params = {
      projectileCount: 1,
      volleyCount: 1,
      volleyInterval: 0.1,
    };
    upgrades.forEach((upgrade) => {
      if (!chosen[upgrade.id] && upgrade.id !== extraUpgradeId) return;
      const effects = upgrade.effects || {};
      params.projectileCount += effects.projectileAdd || 0;
      params.volleyCount += effects.volleyAdd || 0;
      params.volleyInterval += effects.volleyIntervalAdd || 0;
    });
    params.projectileCount = Math.min(5, params.projectileCount);
    params.volleyCount = Math.min(4, params.volleyCount);
    params.volleyInterval = Math.max(0.04, params.volleyInterval);
    return params;
  }

  function applyQingyaBranchBonuses({ state, upgrades, bonuses }) {
    const chosen = getMartialBranchState({ state, martialArtId: "ma_qingya_sword" });
    upgrades.forEach((upgrade) => {
      if (!chosen[upgrade.id]) return;
      const effects = upgrade.effects || {};
      bonuses.projectileAdd += effects.projectileAdd || 0;
      bonuses.volleyCount += effects.volleyAdd || 0;
      bonuses.volleyInterval += effects.volleyIntervalAdd || 0;
      if (effects.damageMult) bonuses.damageMult *= 1 + effects.damageMult;
      if (effects.attackIntervalMult) bonuses.attackIntervalMult *= effects.attackIntervalMult;
      bonuses.pierceAdd += effects.pierceAdd || 0;
      if (effects.attackLineDamageMult) bonuses.attackLineDamageMult *= effects.attackLineDamageMult;
      if (effects.giantSword) {
        bonuses.giantSword = true;
        bonuses.giantSwordDamageMult = 10;
        bonuses.giantSwordIntervalMult = 1.15;
        bonuses.giantSwordSplashRadius = 75;
        bonuses.giantSwordSplashDamage = 0.75;
        bonuses.giantSwordEliteDamageMult = 1.35;
      }
      if (effects.giantSwordDamageMultAdd) bonuses.giantSwordDamageMult *= 1 + effects.giantSwordDamageMultAdd;
      if (effects.giantSwordEliteDamageMultAdd) bonuses.giantSwordEliteDamageMult *= 1 + effects.giantSwordEliteDamageMultAdd;
      if (effects.giantSwordSplashRadiusMult) bonuses.giantSwordSplashRadius *= effects.giantSwordSplashRadiusMult;
      if (effects.giantSwordSpeedMult) bonuses.giantSwordSpeedMult *= effects.giantSwordSpeedMult;
    });
    bonuses.projectileAdd = Math.min(4, bonuses.projectileAdd);
    bonuses.volleyCount = Math.min(4, bonuses.volleyCount);
    bonuses.volleyInterval = Math.max(0.04, bonuses.volleyInterval);
    return bonuses;
  }

  function martialBonuses({ state, data, roleId, upgrades, debugOverrides = {} }) {
    const bonuses = {
      damageMult: 1,
      attackSpeed: 1,
      attackIntervalMult: 1,
      projectileAdd: 0,
      projectileSet: 0,
      volleyCount: 1,
      volleyInterval: 0.1,
      pierceAdd: 0,
      rangeAdd: 0,
      splashRadius: 1,
      splashShards: 0,
      burnOnHit: 0,
      slowBonus: 0,
      slowSplash: 0,
      poisonDuration: 0,
      dotMult: 1,
      chainAdd: 0,
      swordTrail: false,
      poisonFogOnDeath: false,
      verticalColumns: 1,
      horizontalWidth: 0,
      fullRowSpear: false,
      paralyze: 0,
      freezeAttackLine: 0,
      meteorRain: 0,
      bossPriorityLightning: false,
      speedMult: 1,
      widthAdd: 0,
      hitRadiusAdd: 0,
      collisionPaddingAdd: 0,
      sideDamageScale: 1,
      giantSword: false,
      giantSwordDamageMult: 1,
      giantSwordIntervalMult: 1,
      giantSwordSplashRadius: 0,
      giantSwordSplashDamage: 0,
      giantSwordEliteDamageMult: 1,
      giantSwordSpeedMult: 1,
      attackLineDamageMult: 1,
    };
    martialLevelEffects({ state, data, roleId }).forEach((effect) => {
      if (effect.effectType === "damage_mult") bonuses.damageMult *= 1 + effect.value;
      if (effect.effectType === "attack_speed") bonuses.attackSpeed *= 1 + effect.value;
      if (effect.effectType === "projectile_add") bonuses.projectileAdd += effect.value;
      if (effect.effectType === "projectile_set") bonuses.projectileSet = Math.max(bonuses.projectileSet, effect.value);
      if (effect.effectType === "pierce_add") bonuses.pierceAdd += effect.value;
      if (effect.effectType === "range_add") bonuses.rangeAdd += effect.value;
      if (effect.effectType === "splash_radius") bonuses.splashRadius *= 1 + effect.value;
      if (effect.effectType === "splash_shards") bonuses.splashShards += effect.value;
      if (effect.effectType === "burn_on_hit") bonuses.burnOnHit += effect.value;
      if (effect.effectType === "slow_bonus") bonuses.slowBonus += effect.value;
      if (effect.effectType === "slow_splash") bonuses.slowSplash = Math.max(bonuses.slowSplash, effect.value);
      if (effect.effectType === "poison_duration") bonuses.poisonDuration += effect.value;
      if (effect.effectType === "dot_mult") bonuses.dotMult *= 1 + effect.value;
      if (effect.effectType === "chain_add") bonuses.chainAdd += effect.value;
      if (effect.effectType === "sword_trail") bonuses.swordTrail = true;
      if (effect.effectType === "poison_fog_on_death") bonuses.poisonFogOnDeath = true;
      if (effect.effectType === "vertical_columns") bonuses.verticalColumns = Math.max(bonuses.verticalColumns, effect.value);
      if (effect.effectType === "horizontal_width") bonuses.horizontalWidth += effect.value;
      if (effect.effectType === "full_row_spear") bonuses.fullRowSpear = true;
      if (effect.effectType === "paralyze") bonuses.paralyze = Math.max(bonuses.paralyze, effect.value);
      if (effect.effectType === "freeze_attack_line") bonuses.freezeAttackLine = Math.max(bonuses.freezeAttackLine, effect.value);
      if (effect.effectType === "meteor_rain") bonuses.meteorRain += effect.value;
      if (effect.effectType === "boss_priority_lightning") bonuses.bossPriorityLightning = true;
      if (roleId === "lu_qingya" && effect.level === 1) bonuses.hitRadiusAdd += 4;
      if (effect.effectType === "sword_qi_refine") {
        bonuses.speedMult *= 1.15;
        bonuses.damageMult *= 1.1;
      }
      if (effect.effectType === "qingya_stage_4") {
        bonuses.projectileSet = Math.max(bonuses.projectileSet, 3);
        bonuses.damageMult *= 1.2;
        bonuses.attackSpeed *= 1.1;
        bonuses.pierceAdd += 1;
      }
      if (effect.effectType === "qingya_stage_5") {
        bonuses.projectileSet = Math.max(bonuses.projectileSet, 4);
        bonuses.attackSpeed *= 1.08;
      }
      if (effect.effectType === "qingya_stage_6") {
        bonuses.projectileSet = Math.max(bonuses.projectileSet, 5);
        bonuses.damageMult *= 1.4;
        bonuses.pierceAdd += 1;
      }
      if (effect.effectType === "qingya_giant_sword") {
        bonuses.giantSword = true;
        bonuses.giantSwordDamageMult = 10;
        bonuses.giantSwordIntervalMult = 1.15;
        bonuses.giantSwordSplashRadius = 75;
        bonuses.giantSwordSplashDamage = 0.75;
        bonuses.giantSwordEliteDamageMult = 1.35;
      }
    });
    if (roleId === "lu_qingya") applyQingyaBranchBonuses({ state, upgrades, bonuses });
    const art = martialArtForCharacter({ data, characterId: roleId });
    if (art) {
      const modifier = getMartialArtModifier({ state, martialArtId: art.id });
      bonuses.damageMult *= modifier.damageMultiplier;
      bonuses.attackIntervalMult *= modifier.attackIntervalMultiplier;
      bonuses.pierceAdd += modifier.pierceAdd;
      const debugParams = debugOverrides.martialArts?.[art.id]?.debugParams || {};
      if (Number.isFinite(debugParams.projectileCount)) bonuses.projectileSet = Math.max(1, Math.min(5, debugParams.projectileCount));
      if (Number.isFinite(debugParams.volleyCount)) bonuses.volleyCount = Math.max(1, Math.min(4, debugParams.volleyCount));
      if (Number.isFinite(debugParams.volleyInterval)) bonuses.volleyInterval = Math.max(0.04, debugParams.volleyInterval);
      if (Number.isFinite(debugParams.damageMultiplier)) bonuses.damageMult *= debugParams.damageMultiplier;
      if (Number.isFinite(debugParams.attackIntervalMultiplier)) bonuses.attackIntervalMult *= debugParams.attackIntervalMultiplier;
      if (Number.isFinite(debugParams.pierceCount)) bonuses.pierceAdd = Math.max(0, debugParams.pierceCount);
    }
    return bonuses;
  }

  Object.assign(window.XM.MartialArts, {
    applyQingyaBranchBonuses,
    getMartialArtLevelForRole,
    getMartialArtModifier,
    getMartialBranchState,
    getScopedModifier,
    hasMartialBranchUpgrade,
    martialArtForCharacter,
    martialBonuses,
    martialLevelEffects,
    qingyaAttackParamsFromBranches,
  });
})();
