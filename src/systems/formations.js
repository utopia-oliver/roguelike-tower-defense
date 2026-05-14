(() => {
  window.XM = window.XM || {};
  window.XM.Formations = window.XM.Formations || {};

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

  function baseArrayCoreMaxHp({ DATA, defaults = {} }) {
    return DATA.config.arrayCore?.maxHp || DATA.config.baseHp || defaults.maxHp;
  }

  function baseArrayCoreDefense({ DATA, defaults = {} }) {
    return DATA.config.arrayCore?.defense || defaults.defense || 0;
  }

  function initialArrayCoreState({ DATA, playerProfile = {}, defaults = {} }) {
    const maxHp = baseArrayCoreMaxHp({ DATA, defaults }) + (playerProfile.arrayCoreBaseHpBonus || 0);
    const defense = baseArrayCoreDefense({ DATA, defaults }) + (playerProfile.arrayCoreDefenseBonus || 0);
    return {
      arrayCoreMaxHp: maxHp,
      arrayCoreHp: maxHp,
      arrayCoreDefense: defense,
      arrayCoreDamageReduction: DATA.config.arrayCore?.damageReductionRate || 0,
    };
  }

  function syncBaseHpAliases({ state }) {
    state.maxBaseHp = state.arrayCoreMaxHp;
    state.baseHp = state.arrayCoreHp;
  }

  function initializeArrayCoreForRun({ state, DATA, playerProfile, defaults }) {
    const core = initialArrayCoreState({ DATA, playerProfile, defaults });
    state.arrayCoreMaxHp = core.arrayCoreMaxHp;
    state.arrayCoreHp = core.arrayCoreHp;
    state.arrayCoreDefense = core.arrayCoreDefense;
    state.arrayCoreDamageReduction = core.arrayCoreDamageReduction;
    syncBaseHpAliases({ state });
    return core;
  }

  function healArrayCoreFull({ state }) {
    state.arrayCoreHp = state.arrayCoreMaxHp;
    syncBaseHpAliases({ state });
    return state.arrayCoreHp;
  }

  function damageArrayCore({ state, rawDamage, enemy = null, callbacks }) {
    const defense = state.arrayCoreDefense || 0;
    const reduction = Math.max(0, Math.min(0.8, Number(state.formationCoreDamageReduction) || 0));
    const finalDamage = Math.max(1, (rawDamage - defense) * (1 - reduction));
    state.arrayCoreHp = Math.max(0, state.arrayCoreHp - finalDamage);
    syncBaseHpAliases({ state });

    const floaterPosition = call(callbacks, "getDamageNumberPosition") || { x: 0, y: 0 };
    call(callbacks, "addFloater", {
      x: floaterPosition.x,
      y: floaterPosition.y,
      text: `-${Math.ceil(finalDamage)}`,
      ttl: 0.65,
      color: "#ff9a76",
    });

    const enemyName = enemy?.config?.name || "\u654c\u4eba";
    call(
      callbacks,
      "setStatus",
      `${enemyName} \u6b63\u5728\u653b\u51fb\u62a4\u5c71\u5927\u9635 / \u62a4\u5c71\u9635\u773c\uff0c\u9635\u773cHP -${Math.ceil(finalDamage)}\u3002`,
    );

    if (state.arrayCoreHp <= 0) {
      state.arrayCoreHp = 0;
      syncBaseHpAliases({ state });
      call(callbacks, "endGame", false);
    }
    return finalDamage;
  }

  function areaDamage({ state, x, y, radius, damage, source, callbacks, helpers = {} }) {
    const distance = helpers.distance;
    state.enemies.forEach((enemy) => {
      if (isEnemyTargetable(enemy) && distance({ x, y }, enemy) <= radius) {
        call(callbacks, "damageEnemy", enemy, damage, source);
      }
    });
    call(callbacks, "addZone", { x, y, radius, ttl: 0.28, color: "rgba(239, 123, 69, 0.2)" });
  }

  function getFormationConfig({ DATA, formationId }) {
    return DATA.formations?.[formationId] || null;
  }

  function getFormationRuntimeState({ state, formationId }) {
    state.formationRuntime = state.formationRuntime || {};
    if (!state.formationRuntime[formationId]) {
      state.formationRuntime[formationId] = { cooldownTimer: 0, triggerCount: 0 };
    }
    return state.formationRuntime[formationId];
  }

  function getFormationModifier({ state }) {
    return {
      damageMultiplier: state.bonuses?.formationDamage || 1,
      cooldownMultiplier: state.bonuses?.formationCooldown || 1,
      radiusAdd: state.bonuses?.formationRadiusAdd || 0,
    };
  }

  function applyFormationPassive({ state, formation }) {
    state.formationCoreDamageReduction = Number(formation.passiveCoreDamageReduction) || 0;
    state.formationSpiritQiGainMultiplier = Number(formation.spiritQiGainMultiplier) || 1;
  }

  function liveEnemies(state) {
    return (state.enemies || []).filter(isEnemyTargetable);
  }

  function nearestToCoreEnemy({ state }) {
    return liveEnemies(state).sort((a, b) => b.progress - a.progress)[0] || null;
  }

  function highestHpEnemy({ state }) {
    return liveEnemies(state).sort((a, b) => b.hp - a.hp)[0] || null;
  }

  function densestEnemy({ state, radius, distance }) {
    return liveEnemies(state)
      .map((enemy) => ({
        enemy,
        count: liveEnemies(state).filter((item) => distance(item, enemy) <= radius).length,
      }))
      .sort((a, b) => b.count - a.count || b.enemy.progress - a.enemy.progress)[0]?.enemy || null;
  }

  function lowerLaneTarget({ state }) {
    return liveEnemies(state).filter((enemy) => enemy.progress >= 0.55).sort((a, b) => b.progress - a.progress)[0] || nearestToCoreEnemy({ state });
  }

  function selectFormationTarget({ state, formation, helpers }) {
    if (formation.targetRule === "highest_hp") return highestHpEnemy({ state });
    if (formation.targetRule === "densest_cluster") return densestEnemy({ state, radius: formation.areaRadius || 90, distance: helpers.distance });
    if (formation.areaRule === "lower_lane") return lowerLaneTarget({ state });
    return nearestToCoreEnemy({ state });
  }

  function damageEnemiesInArea({ state, x, y, radius, damage, source, callbacks, helpers, statuses = [] }) {
    liveEnemies(state).forEach((enemy) => {
      if (helpers.distance({ x, y }, enemy) > radius) return;
      call(callbacks, "damageEnemy", enemy, damage, source);
      statuses.forEach((status) => {
        if (typeof enemy.addStatus === "function") enemy.addStatus(status.type, status.duration, status.value);
      });
    });
  }

  function triggerFormation({ state, DATA, formation, callbacks, helpers }) {
    const modifier = getFormationModifier({ state });
    const base = call(callbacks, "getFormationBase") || { x: 0, y: 0 };
    const target = selectFormationTarget({ state, formation, helpers });
    const damage = (Number(formation.damage) || 0) * modifier.damageMultiplier;
    const radius = (Number(formation.areaRadius) || (Number(formation.triggerRadius) || 2.2) * helpers.grid.cellH) + modifier.radiusAdd * helpers.grid.cellH;

    if (formation.effectType === "formation_heal_core") {
      const hpRatio = state.arrayCoreMaxHp > 0 ? state.arrayCoreHp / state.arrayCoreMaxHp : 1;
      const heal = (Number(formation.heal) || 0) * (hpRatio < (formation.lowHpThreshold || 0) ? (formation.lowHpHealMultiplier || 1) : 1);
      call(callbacks, "healArrayCore", heal);
      call(callbacks, "addVisualEvent", { type: "heal_aura", x: base.x, y: base.y, radius: 95, duration: 0.7, colorKey: "heal" });
      return true;
    }

    if (formation.effectType === "formation_spirit_qi_bonus") {
      call(callbacks, "gainLingqi", Number(formation.bonusSpiritQi) || 0);
      call(callbacks, "addFloater", { x: base.x, y: base.y - 40, text: `+${formation.bonusSpiritQi || 0}灵气`, ttl: 0.75, color: "#facc15" });
      call(callbacks, "addVisualEvent", { type: "wave", x: base.x, y: base.y, radius: 110, duration: 0.65, colorKey: "debuff" });
      return true;
    }

    if (!target) return false;

    if (formation.effectType === "formation_area_damage") {
      damageEnemiesInArea({ state, x: target.x, y: target.y, radius, damage, source: "formation", callbacks, helpers });
      call(callbacks, "addVisualEvent", { type: "area_burst", x: target.x, y: target.y, radius, duration: 0.42, colorKey: "debuff" });
    } else if (formation.effectType === "formation_slow_area") {
      damageEnemiesInArea({
        state,
        x: target.x,
        y: target.y,
        radius,
        damage,
        source: "formation",
        callbacks,
        helpers,
        statuses: [{ type: "slow", duration: formation.slowDuration || 2, value: Math.max(0, 1 - (formation.slowMultiplier || 0.65)) }],
      });
      call(callbacks, "addVisualEvent", { type: "area_burst", x: target.x, y: target.y, radius, duration: 0.45, colorKey: "frost" });
    } else if (formation.effectType === "formation_burn_area") {
      damageEnemiesInArea({
        state,
        x: target.x,
        y: target.y,
        radius,
        damage,
        source: "formation",
        callbacks,
        helpers,
        statuses: [{ type: "burn", duration: formation.burnDuration || 2.5, value: formation.burnDamage || 4 }],
      });
      call(callbacks, "addZone", { x: target.x, y: target.y, radius, ttl: formation.burnDuration || 2.5, color: "rgba(239, 123, 69, 0.2)", dps: formation.burnDamage || 4, tick: 0 });
      call(callbacks, "addVisualEvent", { type: "area_burst", x: target.x, y: target.y, radius, duration: 0.45, colorKey: "fire" });
    } else if (formation.effectType === "formation_chain_lightning") {
      let current = target;
      let chainDamage = damage;
      const hitIds = new Set();
      const visualTargets = [];
      for (let i = 0; i < 1 + (formation.chainCount || 0) && current; i += 1) {
        hitIds.add(current.id);
        visualTargets.push({ x: current.x, y: current.y, id: current.id });
        call(callbacks, "damageEnemy", current, chainDamage, "formation");
        current = liveEnemies(state)
          .filter((enemy) => !hitIds.has(enemy.id) && helpers.distance(enemy, current) <= (formation.chainRadius || 90))
          .sort((a, b) => helpers.distance(a, current) - helpers.distance(b, current))[0];
        chainDamage *= formation.chainDamageMultiplier || 0.7;
      }
      call(callbacks, "addVisualEvent", { type: "chain_lightning", fromX: target.x, fromY: target.y - 80, targets: visualTargets, duration: 0.3, colorKey: "thunder" });
    } else if (formation.effectType === "formation_core_damage_reduction") {
      damageEnemiesInArea({
        state,
        x: target.x,
        y: target.y,
        radius,
        damage,
        source: "formation",
        callbacks,
        helpers,
        statuses: [{ type: "slow", duration: formation.slowDuration || 1.5, value: Math.max(0, 1 - (formation.slowMultiplier || 0.7)) }],
      });
      call(callbacks, "addVisualEvent", { type: "impact_seal", x: target.x, y: target.y, radius, duration: 0.52, colorKey: "earth" });
    } else if (formation.effectType === "formation_projectile_burst") {
      const count = Math.max(1, Number(formation.projectileCount) || 1);
      for (let i = 0; i < count; i += 1) {
        const enemy = liveEnemies(state).sort((a, b) => helpers.distance(a, base) - helpers.distance(b, base))[i] || target;
        call(callbacks, "spawnFormationProjectile", { formation, target: enemy, origin: base, projectileIndex: i, projectileCount: count });
      }
      call(callbacks, "addVisualEvent", { type: "wave", x: base.x, y: base.y, radius: 95, duration: 0.32, colorKey: "sword" });
    } else {
      damageEnemiesInArea({ state, x: target.x, y: target.y, radius, damage, source: "formation", callbacks, helpers });
    }
    return true;
  }

  function updateFormation({ state, DATA, dt, callbacks, helpers = {} }) {
    const formation = getFormationConfig({ DATA, formationId: state.selectedFormationId });
    if (!formation) return false;
    applyFormationPassive({ state, formation });
    const runtime = getFormationRuntimeState({ state, formationId: formation.id });
    runtime.cooldownTimer -= dt;
    state.formationCooldown = Math.max(0, runtime.cooldownTimer);
    if (runtime.cooldownTimer > 0) return false;
    if (!triggerFormation({ state, DATA, formation, callbacks, helpers })) return false;
    const modifier = getFormationModifier({ state });
    runtime.triggerCount += 1;
    runtime.cooldownTimer = Math.max(1, (formation.triggerInterval || formation.cooldown || 5) * modifier.cooldownMultiplier);
    state.formationCooldown = runtime.cooldownTimer;
    call(callbacks, "setStatus", `${formation.name} 被动触发。`);
    return true;
  }

  Object.assign(window.XM.Formations, {
    areaDamage,
    baseArrayCoreDefense,
    baseArrayCoreMaxHp,
    damageArrayCore,
    getFormationConfig,
    getFormationModifier,
    getFormationRuntimeState,
    healArrayCoreFull,
    initialArrayCoreState,
    initializeArrayCoreForRun,
    applyFormationPassive,
    syncBaseHpAliases,
    triggerFormation,
    updateFormation,
  });
})();
