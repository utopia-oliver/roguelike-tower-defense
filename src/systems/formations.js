(() => {
  window.XM = window.XM || {};
  window.XM.Formations = window.XM.Formations || {};

  function call(callbacks, name, ...args) {
    const fn = callbacks?.[name];
    if (typeof fn !== "function") return undefined;
    return fn(...args);
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
    const finalDamage = Math.max(1, rawDamage - defense);
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
      if (!enemy.dead && distance({ x, y }, enemy) <= radius) {
        call(callbacks, "damageEnemy", enemy, damage, source);
      }
    });
    call(callbacks, "addZone", { x, y, radius, ttl: 0.28, color: "rgba(239, 123, 69, 0.2)" });
  }

  function updateFormation({ state, DATA, dt, callbacks, helpers = {} }) {
    state.formationCooldown -= dt;
    if (state.formationCooldown > 0) return false;

    const formation = DATA.formations[state.selectedFormationId];
    if (!formation) return false;

    const distance = helpers.distance;
    const grid = helpers.grid;
    const base = call(callbacks, "getFormationBase") || { x: 0, y: 0 };
    const radius = (formation.triggerRadius + state.bonuses.formationRadiusAdd) * grid.cellH;
    const targets = state.enemies
      .filter((enemy) => !enemy.dead && distance(enemy, base) <= radius)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, formation.maxTargets);
    if (!targets.length) return false;

    const formationBoost = state.deployedRoles.some(
      (role) => DATA.roles[role.roleId]?.passiveSkill === "global_formation_boost",
    )
      ? 1.1
      : 1;
    const damage = 34 * state.bonuses.formationDamage * formationBoost;

    targets.forEach((enemy) => {
      call(callbacks, "damageEnemy", enemy, damage, "formation");
      if (formation.effectType === "knockback_slow") {
        enemy.progress = Math.max(0, enemy.progress - 0.04);
        enemy.addStatus("slow", 2, 0.5);
      }
      if (formation.effectType === "freeze") enemy.addStatus("freeze", 0.8, 1);
      if (formation.effectType === "burning_area") enemy.addStatus("burn", 2, 8);
    });

    if (formation.effectType === "chain_lightning") {
      const chainedEnemies = call(callbacks, "nearestEnemies", targets[0], 3) || [];
      chainedEnemies.forEach((enemy) => call(callbacks, "damageEnemy", enemy, damage * 0.7, "formation"));
    }

    call(callbacks, "addZone", { x: base.x, y: base.y, radius, ttl: 0.45, color: "rgba(92, 219, 149, 0.22)" });
    state.formationCooldown = Math.max(3, formation.cooldown * state.bonuses.formationCooldown);
    call(callbacks, "setStatus", `${formation.name} \u88ab\u52a8\u89e6\u53d1\u3002`);
    return true;
  }

  Object.assign(window.XM.Formations, {
    areaDamage,
    baseArrayCoreDefense,
    baseArrayCoreMaxHp,
    damageArrayCore,
    healArrayCoreFull,
    initialArrayCoreState,
    initializeArrayCoreForRun,
    syncBaseHpAliases,
    updateFormation,
  });
})();
