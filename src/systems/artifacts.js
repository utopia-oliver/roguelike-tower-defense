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
      name: "青冥镇魔",
      effectName: "镇魔剑鸣",
      artifactIds: ["qingming_sword_box", "zhenmo_bell"],
      cooldown: 7.5,
      damage: 18,
      projectileCount: 2,
      vulnerableMultiplier: 1.15,
      debuffDuration: 2.0,
      type: "debuff_sword",
    },
    {
      id: "thunder_guided_sword",
      name: "雷引剑鸣",
      effectName: "雷引飞剑",
      artifactIds: ["qingming_sword_box", "leiwen_seal"],
      cooldown: 8.0,
      damage: 18,
      projectileCount: 2,
      chainCount: 2,
      chainRadius: 85,
      chainDamageMultiplier: 0.65,
      type: "chain_sword",
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
      artifactIds: ["zhenmo_bell", "leiwen_seal"],
      cooldown: 8.5,
      damage: 18,
      areaRadius: 110,
      vulnerableMultiplier: 1.15,
      attackDamageMultiplier: 0.85,
      debuffDuration: 2.0,
      targetRule: "nearest_to_core",
      type: "area_debuff",
    },
    {
      id: "demon_suppressing_mountain",
      name: "镇岳魔音",
      effectName: "镇岳魔音",
      artifactIds: ["zhenmo_bell", "shanhe_seal"],
      cooldown: 9.5,
      damage: 18,
      areaRadius: 105,
      vulnerableMultiplier: 1.18,
      attackDamageMultiplier: 0.85,
      debuffDuration: 2.2,
      slowMultiplier: 0.3,
      slowDuration: 0.5,
      targetRule: "nearest_to_core",
      type: "area_debuff_slow",
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
    {
      id: "poison_fire_field",
      name: "毒火焚身",
      effectName: "毒火焚身",
      artifactIds: ["lihuo_gourd", "wandu_orb"],
      cooldown: 9.5,
      damage: 18,
      areaRadius: 85,
      poisonDamage: 5,
      poisonDuration: 3.5,
      type: "poison_area",
    },
    {
      id: "poison_starfall",
      name: "毒星坠野",
      effectName: "毒星坠野",
      artifactIds: ["wandu_orb", "xingyun_board"],
      cooldown: 10.0,
      damage: 14,
      meteorCount: 3,
      areaRadius: 55,
      poisonDamage: 4,
      poisonDuration: 3,
      type: "meteor_poison",
    },
    {
      id: "mountain_return_origin",
      name: "山河归元",
      effectName: "山河归元",
      artifactIds: ["shanhe_seal", "guiyuan_banner"],
      cooldown: 11.0,
      damage: 16,
      areaRadius: 105,
      heal: 16,
      slowMultiplier: 0.35,
      slowDuration: 0.5,
      targetRule: "nearest_to_core",
      type: "area_heal",
    },
  ];

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
    modifier.poisonDurationAdd = modifier.poisonDurationAdd || 0;
    modifier.poisonDamageMultiplier = modifier.poisonDamageMultiplier || 1;
    modifier.healMultiplier = modifier.healMultiplier || 1;
    modifier.debuffDurationAdd = modifier.debuffDurationAdd || 0;
    modifier.vulnerableMultiplier = modifier.vulnerableMultiplier || 0;
    return modifier;
  }

  function getArtifactRuntimeState({ state, artifactId }) {
    if (!artifactId) return null;
    state.artifactRuntime = state.artifactRuntime || {};
    state.artifactCooldowns = state.artifactCooldowns || {};
    if (!state.artifactRuntime[artifactId]) {
      state.artifactRuntime[artifactId] = {
        artifactId,
        level: 1,
        selectedUpgradeIds: [],
        minorEvolutionSelected: false,
        majorEvolutionSelected: false,
        majorEvolutionId: "",
        evolvedUpgradeIds: [],
        modifiers: {},
        cooldownTimer: Number(state.artifactCooldowns[artifactId]) || 0,
      };
    }
    const runtime = state.artifactRuntime[artifactId];
    runtime.level = Math.max(1, Math.min(7, Number(runtime.level) || 1));
    runtime.selectedUpgradeIds = Array.isArray(runtime.selectedUpgradeIds) ? runtime.selectedUpgradeIds : [];
    runtime.modifiers = runtime.modifiers || {};
    runtime.minorEvolutionSelected = Boolean(runtime.minorEvolutionSelected);
    runtime.majorEvolutionSelected = Boolean(runtime.majorEvolutionSelected);
    runtime.majorEvolutionId = runtime.majorEvolutionId || "";
    runtime.evolvedUpgradeIds = Array.isArray(runtime.evolvedUpgradeIds) ? runtime.evolvedUpgradeIds : [];
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
      meteorCount: Math.max(1, (params.meteorCount || 1) + (modifier.volleyCountAdd || 0)),
      poisonDuration: Math.max(0, (params.poisonDuration || 0) + (modifier.poisonDurationAdd || 0)),
      poisonDamage: (params.poisonDamage || 0) * (modifier.poisonDamageMultiplier || 1),
      heal: (params.heal || 0) * (modifier.healMultiplier || 1),
      debuffDuration: Math.max(0, (params.debuffDuration || 0) + (modifier.debuffDurationAdd || 0)),
      vulnerableMultiplier: (params.vulnerableMultiplier || 1) + (modifier.vulnerableMultiplier || 0),
    };
  }

  function liveEnemies(state) {
    return (state.enemies || []).filter(isEnemyTargetable);
  }

  function nearestEnemy(state, origin = { x: 0, y: 0 }) {
    return liveEnemies(state).sort((a, b) => Math.hypot(a.x - origin.x, a.y - origin.y) - Math.hypot(b.x - origin.x, b.y - origin.y))[0] || null;
  }

  function highestHpOrNearestEnemy(state, origin) {
    return liveEnemies(state).sort((a, b) => b.hp - a.hp || Math.hypot(a.x - origin.x, a.y - origin.y) - Math.hypot(b.x - origin.x, b.y - origin.y))[0] || null;
  }

  function multipleNearestEnemies(state, origin, count) {
    return liveEnemies(state)
      .sort((a, b) => Math.hypot(a.x - origin.x, a.y - origin.y) - Math.hypot(b.x - origin.x, b.y - origin.y))
      .slice(0, count);
  }

  function randomEnemies(state, count) {
    return liveEnemies(state)
      .map((enemy) => ({ enemy, roll: Math.random() }))
      .sort((a, b) => a.roll - b.roll)
      .slice(0, count)
      .map((item) => item.enemy);
  }

  function lowestHpEnemy(state) {
    return liveEnemies(state).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0] || null;
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
    if (artifact.targetRule === "lowest_hp") return lowestHpEnemy(state);
    return nearestEnemy(state, origin);
  }

  function addStatus(enemy, type, duration, data = {}) {
    if (!enemy || typeof enemy.addStatus !== "function") return;
    const value = data.value ?? (type === "slow" ? Math.max(0, 1 - (data.multiplier ?? 0.65)) : 1);
    enemy.addStatus(type, duration, value, data.options || {});
  }

  function damageEnemiesInArea({ state, x, y, radius, damage, source, callbacks, status, statuses }) {
    enemiesInRadius(state, x, y, radius).forEach((enemy) => {
      call(callbacks, "damageEnemy", enemy, damage, source);
      if (status) addStatus(enemy, status.type, status.duration, status.data);
      (statuses || []).forEach((item) => addStatus(enemy, item.type, item.duration, item.data));
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
        vulnerableMultiplier: params.vulnerableMultiplier,
        attackDamageMultiplier: params.attackDamageMultiplier,
        debuffDuration: params.debuffDuration,
        chainCount: params.chainCount,
        chainRadius: params.chainRadius,
        chainDamageMultiplier: params.chainDamageMultiplier,
      });
    }
  }

  function applyArtifactLevelParams(params, artifact, callbacks) {
    const level = Math.max(1, Math.floor(Number(call(callbacks, "getArtifactLevel", artifact.id)) || 1));
    return {
      ...params,
      damage: (Number(params.damage) || 0) * (1 + (level - 1) * 0.1),
    };
  }

  function artifactParams({ state, artifact, callbacks }) {
    const runtime = getArtifactRuntimeState({ state, artifactId: artifact.id });
    return applyArtifactLevelParams(applyArtifactEvolutionParams(
      applyArtifactModifierToParams(artifact, getArtifactModifier({ state, artifactId: artifact.id })),
      artifact,
      runtime,
    ), artifact, callbacks);
  }

  function hasArtifactUpgrade(runtime, suffix) {
    return (runtime?.selectedUpgradeIds || []).some((id) => id.endsWith(suffix));
  }

  function applyArtifactEvolutionParams(params, artifact, runtime) {
    const next = { ...params };
    if (!runtime) return next;
    if (runtime.minorEvolutionSelected) {
      if (artifact.id === "qingming_sword_box") {
        next.secondaryProjectileCount = (next.secondaryProjectileCount || 0) + 1;
        next.secondaryDamageMultiplier = 0.5;
      } else if (artifact.id === "lihuo_gourd") {
        next.burningZone = true;
        next.burningZoneDps = Math.max(2, (next.damage || 0) * 0.22);
      } else if (artifact.id === "zhenmo_bell") {
        next.attackDamageMultiplier = Math.min(next.attackDamageMultiplier || 0.85, 0.72);
        next.debuffDuration = (next.debuffDuration || 0) + 0.8;
      } else if (artifact.id === "xuanbing_mirror") {
        next.slowMultiplier = Math.min(next.slowMultiplier || 0.55, 0.42);
        next.slowDuration = (next.slowDuration || 0) + 0.6;
      } else if (artifact.id === "leiwen_seal") {
        next.targetRule = "lowest_hp";
      } else if (artifact.id === "wandu_orb") {
        next.poisonDamage *= 1.25;
        next.poisonDuration = (next.poisonDuration || 0) + 0.8;
      } else if (artifact.id === "shanhe_seal") {
        next.aftershock = true;
      } else if (artifact.id === "xingyun_board") {
        next.preferDensest = true;
      } else if (artifact.id === "guiyuan_banner") {
        next.heal *= 1.2;
      } else if (artifact.id === "zhanyao_blades") {
        next.targetRule = "lowest_hp";
        next.projectileCount = (next.projectileCount || 1) + 1;
      }
    }
    if (runtime.majorEvolutionSelected) {
      if (artifact.id === "qingming_sword_box") {
        next.targetRule = "multiple_nearest";
        next.projectileCount = (next.projectileCount || 1) + 8;
        next.pierceCount = (next.pierceCount || 0) + 2;
        next.damage *= 1.15;
      } else if (artifact.id === "lihuo_gourd") {
        next.volleyCount = (next.volleyCount || 1) + 4;
        next.areaRadius *= 1.35;
        next.damage *= 1.3;
        next.burningZone = true;
        next.burningZoneDps = Math.max(3, next.damage * 0.25);
      } else if (artifact.id === "zhenmo_bell") {
        next.areaRadius *= 1.6;
        next.vulnerableMultiplier = (next.vulnerableMultiplier || 1.18) + 0.18;
        next.attackDamageMultiplier = Math.min(next.attackDamageMultiplier || 0.85, 0.65);
        next.debuffDuration = (next.debuffDuration || 0) + 2;
      } else if (artifact.id === "xuanbing_mirror") {
        next.areaRadius *= 1.65;
        next.damage *= 1.35;
        next.slowMultiplier = Math.min(next.slowMultiplier || 0.55, 0.32);
        next.slowDuration = (next.slowDuration || 0) + 1.5;
        next.freezeChance = (next.freezeChance || 0) + 0.3;
      } else if (artifact.id === "leiwen_seal") {
        next.chainCount = (next.chainCount || 1) + 5;
        next.chainRadius *= 1.35;
        next.damage *= 1.25;
      } else if (artifact.id === "wandu_orb") {
        next.areaRadius *= 1.65;
        next.poisonDamage *= 1.6;
        next.poisonDuration = (next.poisonDuration || 0) + 2.5;
        next.damage *= 1.2;
      } else if (artifact.id === "shanhe_seal") {
        next.areaRadius *= 1.65;
        next.damage *= 1.6;
        next.slowDuration = (next.slowDuration || next.stunDuration || 0.4) + 1;
        next.aftershock = true;
      } else if (artifact.id === "xingyun_board") {
        next.meteorCount = (next.meteorCount || 1) + 8;
        next.areaRadius *= 1.3;
        next.damage *= 1.35;
        next.preferDensest = true;
      } else if (artifact.id === "guiyuan_banner") {
        next.heal *= 2.2;
        next.lowHpMajorHeal = true;
      } else if (artifact.id === "zhanyao_blades") {
        next.targetRule = "multiple_nearest";
        next.projectileCount = (next.projectileCount || 1) + 9;
        next.damage *= 1.25;
      }
    }
    if (hasArtifactUpgrade(runtime, "_evolved_damage")) next.damage *= 1.25;
    if (hasArtifactUpgrade(runtime, "_evolved_projectile")) next.projectileCount = (next.projectileCount || 1) + 2;
    if (hasArtifactUpgrade(runtime, "_evolved_pierce")) next.pierceCount = (next.pierceCount || 0) + 1;
    if (hasArtifactUpgrade(runtime, "_evolved_area")) next.areaRadius *= 1.2;
    if (hasArtifactUpgrade(runtime, "_evolved_duration")) {
      next.slowDuration = (next.slowDuration || 0) + 0.8;
      next.poisonDuration = (next.poisonDuration || 0) + 1.2;
      next.debuffDuration = (next.debuffDuration || 0) + 0.8;
    }
    if (hasArtifactUpgrade(runtime, "_evolved_chain")) {
      next.chainCount = (next.chainCount || 1) + 2;
      next.meteorCount = (next.meteorCount || 1) + 2;
    }
    return next;
  }

  function showArtifactFloater(callbacks, artifact, target) {
    call(callbacks, "addFloater", {
      x: target.x,
      y: target.y - 18,
      text: artifact.name.slice(0, 4),
      ttl: 0.7,
      color: "#f6d365",
    });
  }

  function visualPoint(entity) {
    return entity ? { x: entity.x, y: entity.y, id: entity.id } : null;
  }

  function addArtifactVisualEvent(callbacks, artifact, event) {
    call(callbacks, "addVisualEvent", {
      sourceId: artifact.id,
      colorKey: artifact.visualType || artifact.type,
      ...event,
    });
  }

  function triggerProjectileArtifact({ state, artifact, params, callbacks }) {
    const origin = call(callbacks, "getArtifactOrigin") || { x: 0, y: 0 };
    const count = params.projectileCount || 1;
    const targets = params.targetRule === "multiple_nearest"
      ? multipleNearestEnemies(state, origin, count)
      : [selectTarget({ state, artifact: params, origin })].filter(Boolean);
    if (!targets.length) return false;
    targets.forEach((target, index) => {
      spawnArtifactProjectile({
        state,
        artifact,
        params: { ...params, projectileCount: params.targetRule === "multiple_nearest" ? 1 : count },
        target,
        origin,
        callbacks,
      });
      addArtifactVisualEvent(callbacks, artifact, {
        type: artifact.visualType === "multi_blade_projectile" ? "sweep" : "wave",
        x: target.x,
        y: target.y,
        fromX: origin.x,
        fromY: origin.y,
        radius: artifact.visualType === "multi_blade_projectile" ? 34 : 46,
        orientation: artifact.visualType === "multi_blade_projectile" ? "diagonal" : "projectile",
        duration: 0.18,
      });
      for (let i = 0; i < (params.secondaryProjectileCount || 0); i += 1) {
        spawnArtifactProjectile({
          state,
          artifact,
          params: { ...params, damage: params.damage * (params.secondaryDamageMultiplier || 0.5), projectileCount: 1 },
          target,
          origin,
          callbacks,
        });
      }
      if (index === 0) showArtifactFloater(callbacks, artifact, target);
    });
    return true;
  }

  function triggerAreaArtifact({ state, artifact, params, callbacks }) {
    const origin = call(callbacks, "getArtifactOrigin") || { x: 0, y: 0 };
    const target = artifact.targetRule === "random_enemies"
      ? null
      : selectTarget({ state, artifact: params, origin });
    if (artifact.type === "meteor") {
      const targets = params.preferDensest
        ? Array.from({ length: params.meteorCount || params.volleyCount || 3 }, () => densestEnemy(state, params.areaRadius || 45)).filter(Boolean)
        : randomEnemies(state, params.meteorCount || params.volleyCount || 3);
      if (!targets.length) return false;
      targets.forEach((enemy) => {
        call(callbacks, "areaDamage", enemy.x, enemy.y, params.areaRadius, params.damage, "artifact");
        addArtifactVisualEvent(callbacks, artifact, { type: "meteor", x: enemy.x, y: enemy.y, radius: params.areaRadius, duration: 0.45 });
      });
      showArtifactFloater(callbacks, artifact, targets[0]);
      return true;
    }
    if (!target) return false;
    if (artifact.type === "area") {
      for (let i = 0; i < (params.volleyCount || 1); i += 1) {
        call(callbacks, "areaDamage", target.x, target.y, params.areaRadius, params.damage, "artifact");
        addArtifactVisualEvent(callbacks, artifact, { type: "area_burst", x: target.x, y: target.y, radius: params.areaRadius, duration: 0.42, colorKey: "fire" });
      }
      if (params.burningZone) {
        call(callbacks, "addZone", { x: target.x, y: target.y, radius: params.areaRadius, ttl: 1.8, color: "rgba(239, 123, 69, 0.22)", dps: params.burningZoneDps || params.damage * 0.2, tick: 0 });
      }
    } else if (artifact.type === "frost_area") {
      damageEnemiesInArea({
        state,
        x: target.x,
        y: target.y,
        radius: params.areaRadius,
        damage: params.damage,
        source: "artifact",
        callbacks,
        status: { type: "slow", duration: params.slowDuration, data: { multiplier: params.slowMultiplier } },
      });
      addArtifactVisualEvent(callbacks, artifact, { type: "area_burst", x: target.x, y: target.y, radius: params.areaRadius, duration: 0.45, colorKey: "frost" });
      if (params.aftershock) {
        call(callbacks, "areaDamage", target.x, target.y, params.areaRadius * 0.65, params.damage * 0.45, "artifact");
      }
      if (params.freezeChance > 0 && Math.random() < params.freezeChance) {
        addStatus(target, "freeze", params.freezeDuration || 0.6, { value: 1 });
      }
    } else if (artifact.type === "debuff_area") {
      damageEnemiesInArea({
        state,
        x: target.x,
        y: target.y,
        radius: params.areaRadius,
        damage: params.damage,
        source: "artifact",
        callbacks,
        statuses: [
          { type: "vulnerable", duration: params.debuffDuration, data: { value: Math.max(0, params.vulnerableMultiplier - 1) } },
          { type: "weaken_attack", duration: params.debuffDuration, data: { value: Math.max(0, 1 - params.attackDamageMultiplier) } },
        ],
      });
      addArtifactVisualEvent(callbacks, artifact, { type: "wave", x: target.x, y: target.y, radius: params.areaRadius, duration: 0.5, colorKey: "debuff" });
    } else if (artifact.type === "poison_area") {
      damageEnemiesInArea({
        state,
        x: target.x,
        y: target.y,
        radius: params.areaRadius,
        damage: params.damage,
        source: "artifact",
        callbacks,
        status: { type: "poison", duration: params.poisonDuration, data: { value: params.poisonDamage } },
      });
      addArtifactVisualEvent(callbacks, artifact, { type: "poison_cloud", x: target.x, y: target.y, radius: params.areaRadius, duration: 0.8, colorKey: "poison" });
    } else if (artifact.type === "crush_area") {
      damageEnemiesInArea({
        state,
        x: target.x,
        y: target.y,
        radius: params.areaRadius,
        damage: params.damage,
        source: "artifact",
        callbacks,
        status: { type: "slow", duration: params.stunDuration || params.slowDuration || 0.4, data: { multiplier: 0.15 } },
      });
      addArtifactVisualEvent(callbacks, artifact, { type: "impact_seal", x: target.x, y: target.y, radius: params.areaRadius, duration: 0.52, colorKey: "earth" });
    }
    showArtifactFloater(callbacks, artifact, target);
    return true;
  }

  function triggerChainArtifact({ state, artifact, params, callbacks }) {
    const origin = call(callbacks, "getArtifactOrigin") || { x: 0, y: 0 };
    const target = selectTarget({ state, artifact: params, origin });
    if (!target) return false;
    const targets = triggerChain({ state, target, params, callbacks, source: "artifact" });
    addArtifactVisualEvent(callbacks, artifact, {
      type: "chain_lightning",
      fromX: origin.x,
      fromY: origin.y,
      targets: targets.map(visualPoint),
      duration: 0.28,
      colorKey: "thunder",
    });
    showArtifactFloater(callbacks, artifact, target);
    return true;
  }

  function triggerSupportArtifact({ state, artifact, params, callbacks }) {
    if (artifact.type !== "support") return false;
    const hpRatio = state.arrayCoreMaxHp > 0 ? state.arrayCoreHp / state.arrayCoreMaxHp : 1;
    const lowHpBonus = hpRatio < 0.4 ? (params.lowHpMajorHeal ? 2.0 : 1.35) : 1;
    const healCount = params.volleyCount || 1;
    for (let i = 0; i < healCount; i += 1) {
      call(callbacks, "healArrayCore", params.heal * (i === 0 ? lowHpBonus : 0.45));
    }
    addArtifactVisualEvent(callbacks, artifact, {
      type: "heal_aura",
      x: call(callbacks, "getArtifactOrigin")?.x || 0,
      y: call(callbacks, "getArtifactOrigin")?.y || 0,
      radius: 90,
      duration: 0.7,
      colorKey: "heal",
    });
    call(callbacks, "addFloater", {
      x: call(callbacks, "getArtifactOrigin")?.x || 0,
      y: call(callbacks, "getArtifactOrigin")?.y || 0,
      text: artifact.name.slice(0, 4),
      ttl: 0.7,
      color: "#86efac",
    });
    return true;
  }

  function triggerArtifact({ state, DATA, artifactId, callbacks }) {
    const artifact = getArtifactConfig({ DATA, artifactId });
    if (!artifact) return false;
    const params = artifactParams({ state, artifact, callbacks });
    if (artifact.type === "projectile") return triggerProjectileArtifact({ state, artifact, params, callbacks });
    if (artifact.type === "chain") return triggerChainArtifact({ state, artifact, params, callbacks });
    if (artifact.type === "support") return triggerSupportArtifact({ state, artifact, params, callbacks });
    return triggerAreaArtifact({ state, artifact, params, callbacks });
  }

  function triggerChain({ state, target, params, callbacks, source, bonusVsSlowed = 0 }) {
    let current = target;
    let damage = params.damage;
    const hitIds = new Set();
    const targets = [];
    for (let i = 0; i < (params.chainCount || 1) && current; i += 1) {
      hitIds.add(current.id);
      targets.push(current);
      const slowed = typeof current.hasStatus === "function" && current.hasStatus("slow");
      call(callbacks, "damageEnemy", current, damage * (slowed ? 1 + bonusVsSlowed : 1), source);
      current = liveEnemies(state)
        .filter((enemy) => !hitIds.has(enemy.id) && Math.hypot(enemy.x - current.x, enemy.y - current.y) <= (params.chainRadius || 90))
        .sort((a, b) => Math.hypot(a.x - current.x, a.y - current.y) - Math.hypot(b.x - current.x, b.y - current.y))[0];
      damage *= params.chainDamageMultiplier || 0.75;
    }
    return targets;
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

    if (["flame_sword", "debuff_sword", "chain_sword"].includes(bond.type)) {
      spawnArtifactProjectile({
        state,
        artifact: { id: bond.id, name: bond.effectName, projectileType: "artifact_sword_projectile" },
        params: bond,
        target,
        origin,
        callbacks,
        bond,
      });
      addArtifactVisualEvent(callbacks, { id: bond.id, visualType: bond.type === "chain_sword" ? "chain_lightning" : "projectile_sword" }, {
        type: bond.type === "chain_sword" ? "chain_lightning" : "wave",
        fromX: origin.x,
        fromY: origin.y,
        targets: [visualPoint(target)],
        x: target.x,
        y: target.y,
        radius: bond.explosionRadius || 48,
        duration: 0.3,
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
      addArtifactVisualEvent(callbacks, { id: bond.id, visualType: "area_frost" }, { type: "area_burst", x: target.x, y: target.y, radius: bond.areaRadius, duration: 0.48, colorKey: "frost" });
    } else if (bond.type === "area_debuff" || bond.type === "area_debuff_slow") {
      damageEnemiesInArea({
        state,
        x: target.x,
        y: target.y,
        radius: bond.areaRadius,
        damage: bond.damage,
        source: "artifact_bond",
        callbacks,
        statuses: [
          { type: "vulnerable", duration: bond.debuffDuration, data: { value: Math.max(0, (bond.vulnerableMultiplier || 1) - 1) } },
          { type: "weaken_attack", duration: bond.debuffDuration, data: { value: Math.max(0, 1 - (bond.attackDamageMultiplier || 1)) } },
          ...(bond.type === "area_debuff_slow" ? [{ type: "slow", duration: bond.slowDuration, data: { multiplier: bond.slowMultiplier } }] : []),
        ],
      });
      addArtifactVisualEvent(callbacks, { id: bond.id, visualType: "aura_debuff" }, { type: "wave", x: target.x, y: target.y, radius: bond.areaRadius, duration: 0.48, colorKey: "debuff" });
    } else if (bond.type === "frost_chain") {
      const targets = triggerChain({ state, target, params: bond, callbacks, source: "artifact_bond", bonusVsSlowed: bond.bonusVsSlowed });
      addArtifactVisualEvent(callbacks, { id: bond.id, visualType: "chain_lightning" }, { type: "chain_lightning", fromX: origin.x, fromY: origin.y, targets: targets.map(visualPoint), duration: 0.3, colorKey: "thunder" });
    } else if (bond.type === "poison_area") {
      damageEnemiesInArea({
        state,
        x: target.x,
        y: target.y,
        radius: bond.areaRadius,
        damage: bond.damage,
        source: "artifact_bond",
        callbacks,
        status: { type: "poison", duration: bond.poisonDuration, data: { value: bond.poisonDamage } },
      });
      addArtifactVisualEvent(callbacks, { id: bond.id, visualType: "poison_cloud" }, { type: "poison_cloud", x: target.x, y: target.y, radius: bond.areaRadius, duration: 0.8, colorKey: "poison" });
    } else if (bond.type === "meteor_poison") {
      const targets = randomEnemies(state, bond.meteorCount || 3);
      if (!targets.length) return false;
      targets.forEach((enemy) => {
        damageEnemiesInArea({
          state,
          x: enemy.x,
          y: enemy.y,
          radius: bond.areaRadius,
          damage: bond.damage,
          source: "artifact_bond",
          callbacks,
          status: { type: "poison", duration: bond.poisonDuration, data: { value: bond.poisonDamage } },
        });
        addArtifactVisualEvent(callbacks, { id: bond.id, visualType: "meteor_random" }, { type: "meteor", x: enemy.x, y: enemy.y, radius: bond.areaRadius, duration: 0.45, colorKey: "poison" });
      });
    } else if (bond.type === "area_heal") {
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
      const hpRatio = state.arrayCoreMaxHp > 0 ? state.arrayCoreHp / state.arrayCoreMaxHp : 1;
      if (hpRatio < 0.5) call(callbacks, "healArrayCore", bond.heal);
      addArtifactVisualEvent(callbacks, { id: bond.id, visualType: "heal_aura" }, { type: "heal_aura", x: origin.x, y: origin.y, radius: bond.areaRadius, duration: 0.65, colorKey: "heal" });
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
    triggerAreaArtifact,
    triggerChainArtifact,
    triggerProjectileArtifact,
    triggerSupportArtifact,
    updateArtifact,
    updateArtifactBonds,
    updateArtifacts,
  });
})();
