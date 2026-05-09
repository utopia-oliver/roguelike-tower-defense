(() => {
  window.XM = window.XM || {};
  window.XM.Artifacts = window.XM.Artifacts || {};

  const ARTIFACT_BONDS = [
    {
      id: "flame_sword_rain",
      name: "青冥离火",
      effectName: "离火飞剑",
      artifactIds: ["qingming_sword_box", "lihuo_gourd"],
      cooldown: 8.0,
      damage: 20,
      projectileCount: 3,
      explosionRadius: 45,
      explosionDamageMultiplier: 0.6,
      type: "flame_sword",
    },
    {
      id: "soul_suppressing_sword",
      name: "青冥镇妖",
      effectName: "镇妖剑鸣",
      artifactIds: ["qingming_sword_box", "zhenyao_bell"],
      cooldown: 7.5,
      damage: 18,
      projectileCount: 2,
      slowMultiplier: 0.65,
      slowDuration: 1.2,
      type: "slow_sword",
    },
    {
      id: "ice_fire_burst",
      name: "冰火交炼",
      effectName: "冰火爆裂",
      artifactIds: ["lihuo_gourd", "xuanbing_mirror"],
      cooldown: 9.0,
      damage: 22,
      areaRadius: 90,
      slowMultiplier: 0.55,
      slowDuration: 1.8,
      type: "area_slow",
    },
    {
      id: "thunder_bell_shock",
      name: "雷铃镇魄",
      effectName: "雷音震魄",
      artifactIds: ["zhenyao_bell", "leiwen_seal"],
      cooldown: 8.5,
      damage: 18,
      areaRadius: 110,
      slowMultiplier: 0.6,
      slowDuration: 1.5,
      targetRule: "nearest_to_core",
      type: "area_slow",
    },
    {
      id: "frost_thunder_chain",
      name: "霜雷映照",
      effectName: "霜雷连锁",
      artifactIds: ["xuanbing_mirror", "leiwen_seal"],
      cooldown: 8.0,
      damage: 16,
      chainCount: 4,
      chainRadius: 100,
      bonusVsSlowed: 0.35,
      type: "frost_chain",
    },
  ];

  function call(callbacks, name, ...args) {
    const fn = callbacks?.[name];
    if (typeof fn !== "function") return undefined;
    return fn(...args);
  }

  function getSelectedArtifactIds(state) {
    if (Array.isArray(state.selectedArtifactIds)) return state.selectedArtifactIds.filter(Boolean);
    return state.selectedArtifactId ? [state.selectedArtifactId] : [];
  }

  function getScopedModifier({ state, bucket, id }) {
    state.modifiers = state.modifiers || { martialArt: {}, character: {}, artifact: {}, projectileType: {}, majorEvolution: {} };
    state.modifiers[bucket] = state.modifiers[bucket] || {};
    state.modifiers[bucket][id] = state.modifiers[bucket][id] || {};
    return state.modifiers[bucket][id];
  }

  function getArtifactConfig({ DATA, artifactId }) {
    return DATA.artifacts?.[artifactId] || null;
  }

  function getArtifactModifier({ state, artifactId }) {
    const modifier = getScopedModifier({ state, bucket: "artifact", id: artifactId });
    modifier.damageMultiplier = modifier.damageMultiplier || 1;
    modifier.cooldownMultiplier = modifier.cooldownMultiplier || 1;
    modifier.projectileCountAdd = modifier.projectileCountAdd || 0;
    modifier.pierceAdd = modifier.pierceAdd || 0;
    modifier.areaMultiplier = modifier.areaMultiplier || 1;
    modifier.volleyCountAdd = modifier.volleyCountAdd || 0;
    modifier.slowDurationAdd = modifier.slowDurationAdd || 0;
    modifier.chainCountAdd = modifier.chainCountAdd || 0;
    modifier.chainRadiusMultiplier = modifier.chainRadiusMultiplier || 1;
    modifier.freezeChanceAdd = modifier.freezeChanceAdd || 0;
    return modifier;
  }

  function getArtifactRuntimeState({ state, artifactId }) {
    if (!artifactId) return null;
    state.artifactRuntime = state.artifactRuntime || {};
    state.artifactCooldowns = state.artifactCooldowns || {};
    if (!state.artifactRuntime[artifactId]) {
      state.artifactRuntime[artifactId] = {
        artifactId,
        cooldownTimer: Number(state.artifactCooldowns[artifactId]) || 0,
      };
    }
    return state.artifactRuntime[artifactId];
  }

  function getBondRuntimeState({ state, bondId }) {
    state.artifactBondRuntime = state.artifactBondRuntime || {};
    if (!state.artifactBondRuntime[bondId]) {
      state.artifactBondRuntime[bondId] = { bondId, cooldownTimer: 0 };
    }
    return state.artifactBondRuntime[bondId];
  }

  function applyArtifactModifierToParams(params, modifier) {
    return {
      ...params,
      damage: (params.damage || 0) * (modifier.damageMultiplier || 1),
      cooldown: Math.max(1.2, (params.cooldown || 1) * (modifier.cooldownMultiplier || 1)),
      projectileCount: Math.max(1, (params.projectileCount || 1) + (modifier.projectileCountAdd || 0)),
      pierceCount: Math.max(0, (params.pierceCount || 0) + (modifier.pierceAdd || 0)),
      areaRadius: Math.max(1, (params.areaRadius || 0) * (modifier.areaMultiplier || 1)),
      volleyCount: Math.max(1, (params.volleyCount || 1) + (modifier.volleyCountAdd || 0)),
      slowDuration: Math.max(0, (params.slowDuration || 0) + (modifier.slowDurationAdd || 0)),
      chainCount: Math.max(1, (params.chainCount || 1) + (modifier.chainCountAdd || 0)),
      chainRadius: Math.max(1, (params.chainRadius || 0) * (modifier.chainRadiusMultiplier || 1)),
      freezeChance: Math.max(0, (params.freezeChance || 0) + (modifier.freezeChanceAdd || 0)),
    };
  }

  function liveEnemies(state) {
    return (state.enemies || []).filter((enemy) => !enemy.dead);
  }

  function nearestEnemy(state, origin = { x: 0, y: 0 }) {
    return liveEnemies(state).sort((a, b) => Math.hypot(a.x - origin.x, a.y - origin.y) - Math.hypot(b.x - origin.x, b.y - origin.y))[0] || null;
  }

  function highestHpOrNearestEnemy(state, origin) {
    return liveEnemies(state).sort((a, b) => b.hp - a.hp || Math.hypot(a.x - origin.x, a.y - origin.y) - Math.hypot(b.x - origin.x, b.y - origin.y))[0] || null;
  }

  function nearestToCoreEnemy(state) {
    return liveEnemies(state).sort((a, b) => b.progress - a.progress)[0] || null;
  }

  function enemiesInRadius(state, x, y, radius) {
    return liveEnemies(state).filter((enemy) => Math.hypot(enemy.x - x, enemy.y - y) <= radius);
  }

  function densestEnemy(state, radius) {
    const enemies = liveEnemies(state);
    if (!enemies.length) return null;
    return enemies
      .map((enemy) => ({
        enemy,
        count: enemiesInRadius(state, enemy.x, enemy.y, radius).length,
      }))
      .sort((a, b) => b.count - a.count || b.enemy.progress - a.enemy.progress)[0].enemy;
  }

  function selectTarget({ state, artifact, origin }) {
    if (artifact.targetRule === "densest_cluster") return densestEnemy(state, artifact.areaRadius || 80);
    if (artifact.targetRule === "nearest_to_core") return nearestToCoreEnemy(state);
    if (artifact.targetRule === "highest_hp_or_nearest") return highestHpOrNearestEnemy(state, origin);
    return nearestEnemy(state, origin);
  }

  function addStatus(enemy, type, duration, data = {}) {
    if (!enemy || typeof enemy.addStatus !== "function") return;
    const value = data.value ?? (type === "slow" ? Math.max(0, 1 - (data.multiplier ?? 0.65)) : 1);
    enemy.addStatus(type, duration, value, data.options || {});
  }

  function damageEnemiesInArea({ state, x, y, radius, damage, source, callbacks, status }) {
    enemiesInRadius(state, x, y, radius).forEach((enemy) => {
      call(callbacks, "damageEnemy", enemy, damage, source);
      if (status) addStatus(enemy, status.type, status.duration, status.data);
    });
  }

  function spawnArtifactProjectile({ state, artifact, params, target, origin, callbacks, bond }) {
    const count = params.projectileCount || 1;
    for (let i = 0; i < count; i += 1) {
      call(callbacks, "spawnArtifactProjectile", {
        artifact,
        bond,
        target,
        origin,
        damage: params.damage,
        projectileType: artifact.projectileType || "artifact_sword_projectile",
        projectileIndex: i,
        projectileCount: count,
        pierceCount: params.pierceCount || 0,
        speed: params.speed || 420,
        hitRadius: params.hitRadius || 14,
        color: bond ? "#ffb86b" : "#a7f3ff",
        splashRadius: params.explosionRadius || 0,
        splashDamageMultiplier: params.explosionDamageMultiplier || 0,
        slowMultiplier: params.slowMultiplier,
        slowDuration: params.slowDuration,
      });
    }
  }

  function triggerArtifact({ state, DATA, artifactId, callbacks }) {
    const artifact = getArtifactConfig({ DATA, artifactId });
    if (!artifact) return false;
    const modifier = getArtifactModifier({ state, artifactId });
    const params = applyArtifactModifierToParams(artifact, modifier);
    const origin = call(callbacks, "getArtifactOrigin") || { x: 0, y: 0 };
    const target = selectTarget({ state, artifact: params, origin });
    if (!target) return false;

    if (artifact.type === "projectile") {
      spawnArtifactProjectile({ state, artifact, params, target, origin, callbacks });
    } else if (artifact.type === "area") {
      for (let i = 0; i < (params.volleyCount || 1); i += 1) {
        call(callbacks, "areaDamage", target.x, target.y, params.areaRadius, params.damage, "artifact");
      }
    } else if (artifact.type === "control_area" || artifact.type === "frost_area") {
      damageEnemiesInArea({
        state,
        x: target.x,
        y: target.y,
        radius: params.areaRadius,
        damage: params.damage,
        source: "artifact",
        callbacks,
        status: {
          type: "slow",
          duration: params.slowDuration,
          data: { multiplier: params.slowMultiplier },
        },
      });
      if (artifact.type === "frost_area" && params.freezeChance > 0 && Math.random() < params.freezeChance) {
        addStatus(target, "slow", params.freezeDuration || 0.6, { multiplier: 0.25 });
      }
    } else if (artifact.type === "chain") {
      triggerChain({ state, target, params, callbacks, source: "artifact" });
    }

    call(callbacks, "addFloater", {
      x: target.x,
      y: target.y - 18,
      text: artifact.name.slice(0, 4),
      ttl: 0.7,
      color: "#f6d365",
    });
    return true;
  }

  function triggerChain({ state, target, params, callbacks, source, bonusVsSlowed = 0 }) {
    let current = target;
    let damage = params.damage;
    const hitIds = new Set();
    for (let i = 0; i < (params.chainCount || 1) && current; i += 1) {
      hitIds.add(current.id);
      const slowed = typeof current.hasStatus === "function" && current.hasStatus("slow");
      call(callbacks, "damageEnemy", current, damage * (slowed ? 1 + bonusVsSlowed : 1), source);
      current = liveEnemies(state)
        .filter((enemy) => !hitIds.has(enemy.id) && Math.hypot(enemy.x - current.x, enemy.y - current.y) <= (params.chainRadius || 90))
        .sort((a, b) => Math.hypot(a.x - current.x, a.y - current.y) - Math.hypot(b.x - current.x, b.y - current.y))[0];
      damage *= params.chainDamageMultiplier || 0.75;
    }
  }

  function updateArtifact({ state, DATA, dt, artifactId, callbacks }) {
    const artifact = getArtifactConfig({ DATA, artifactId });
    if (!artifact) return false;
    const runtime = getArtifactRuntimeState({ state, artifactId });
    runtime.cooldownTimer -= dt;
    state.artifactCooldowns[artifactId] = Math.max(0, runtime.cooldownTimer);
    if (runtime.cooldownTimer > 0) return false;
    if (!triggerArtifact({ state, DATA, artifactId, callbacks })) return false;
    const modifier = getArtifactModifier({ state, artifactId });
    runtime.cooldownTimer = applyArtifactModifierToParams(artifact, modifier).cooldown;
    state.artifactCooldowns[artifactId] = runtime.cooldownTimer;
    state.artifactCooldown = runtime.cooldownTimer;
    return true;
  }

  function getActiveArtifactBonds(selectedArtifactIds) {
    const selected = new Set((selectedArtifactIds || []).filter(Boolean));
    return ARTIFACT_BONDS.filter((bond) => bond.artifactIds.every((artifactId) => selected.has(artifactId)));
  }

  function triggerArtifactBond({ state, bond, callbacks }) {
    const origin = call(callbacks, "getArtifactOrigin") || { x: 0, y: 0 };
    const target = bond.targetRule === "nearest_to_core"
      ? nearestToCoreEnemy(state)
      : bond.type === "frost_chain"
        ? liveEnemies(state).filter((enemy) => typeof enemy.hasStatus === "function" && enemy.hasStatus("slow")).sort((a, b) => b.progress - a.progress)[0] || nearestEnemy(state, origin)
        : densestEnemy(state, bond.areaRadius || bond.explosionRadius || 80) || nearestEnemy(state, origin);
    if (!target) return false;

    if (bond.type === "flame_sword" || bond.type === "slow_sword") {
      spawnArtifactProjectile({
        state,
        artifact: { id: bond.id, name: bond.effectName, projectileType: "artifact_sword_projectile" },
        params: bond,
        target,
        origin,
        callbacks,
        bond,
      });
    } else if (bond.type === "area_slow") {
      damageEnemiesInArea({
        state,
        x: target.x,
        y: target.y,
        radius: bond.areaRadius,
        damage: bond.damage,
        source: "artifact_bond",
        callbacks,
        status: { type: "slow", duration: bond.slowDuration, data: { multiplier: bond.slowMultiplier } },
      });
    } else if (bond.type === "frost_chain") {
      triggerChain({ state, target, params: bond, callbacks, source: "artifact_bond", bonusVsSlowed: bond.bonusVsSlowed });
    }

    call(callbacks, "addFloater", {
      x: target.x,
      y: target.y - 34,
      text: bond.name,
      ttl: 0.8,
      color: "#c4b5fd",
    });
    return true;
  }

  function updateArtifactBonds({ state, selectedArtifactIds, dt, callbacks }) {
    const activeBonds = getActiveArtifactBonds(selectedArtifactIds);
    activeBonds.forEach((bond) => {
      const runtime = getBondRuntimeState({ state, bondId: bond.id });
      runtime.cooldownTimer -= dt;
      if (runtime.cooldownTimer > 0) return;
      if (triggerArtifactBond({ state, bond, callbacks })) {
        runtime.cooldownTimer = bond.cooldown;
      }
    });
    return activeBonds;
  }

  function updateArtifacts({ state, DATA, dt, callbacks }) {
    const selectedArtifactIds = getSelectedArtifactIds(state);
    selectedArtifactIds.forEach((artifactId) => updateArtifact({ state, DATA, dt, artifactId, callbacks }));
    updateArtifactBonds({ state, selectedArtifactIds, dt, callbacks });
  }

  Object.assign(window.XM.Artifacts, {
    ARTIFACT_BONDS,
    applyArtifactModifierToParams,
    getActiveArtifactBonds,
    getArtifactConfig,
    getArtifactModifier,
    getArtifactRuntimeState,
    getBondRuntimeState,
    triggerArtifact,
    triggerArtifactBond,
    updateArtifact,
    updateArtifactBonds,
    updateArtifacts,
  });
})();
