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

  function artifactParams({ state, artifact }) {
    return applyArtifactModifierToParams(artifact, getArtifactModifier({ state, artifactId: artifact.id }));
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

  function triggerProjectileArtifact({ state, artifact, params, callbacks }) {
    const origin = call(callbacks, "getArtifactOrigin") || { x: 0, y: 0 };
    const count = params.projectileCount || 1;
    const targets = artifact.targetRule === "multiple_nearest"
      ? multipleNearestEnemies(state, origin, count)
      : [selectTarget({ state, artifact: params, origin })].filter(Boolean);
    if (!targets.length) return false;
    targets.forEach((target, index) => {
      spawnArtifactProjectile({
        state,
        artifact,
        params: { ...params, projectileCount: artifact.targetRule === "multiple_nearest" ? 1 : count },
        target,
        origin,
        callbacks,
      });
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
      const targets = randomEnemies(state, params.meteorCount || params.volleyCount || 3);
      if (!targets.length) return false;
      targets.forEach((enemy) => call(callbacks, "areaDamage", enemy.x, enemy.y, params.areaRadius, params.damage, "artifact"));
      showArtifactFloater(callbacks, artifact, targets[0]);
      return true;
    }
    if (!target) return false;
    if (artifact.type === "area") {
      for (let i = 0; i < (params.volleyCount || 1); i += 1) {
        call(callbacks, "areaDamage", target.x, target.y, params.areaRadius, params.damage, "artifact");
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
    }
    showArtifactFloater(callbacks, artifact, target);
    return true;
  }

  function triggerChainArtifact({ state, artifact, params, callbacks }) {
    const origin = call(callbacks, "getArtifactOrigin") || { x: 0, y: 0 };
    const target = selectTarget({ state, artifact: params, origin });
    if (!target) return false;
    triggerChain({ state, target, params, callbacks, source: "artifact" });
    showArtifactFloater(callbacks, artifact, target);
    return true;
  }

  function triggerSupportArtifact({ state, artifact, params, callbacks }) {
    if (artifact.type !== "support") return false;
    const hpRatio = state.arrayCoreMaxHp > 0 ? state.arrayCoreHp / state.arrayCoreMaxHp : 1;
    const lowHpBonus = hpRatio < 0.4 ? 1.35 : 1;
    const healCount = params.volleyCount || 1;
    for (let i = 0; i < healCount; i += 1) {
      call(callbacks, "healArrayCore", params.heal * (i === 0 ? lowHpBonus : 0.45));
    }
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
    const params = artifactParams({ state, artifact });
    if (artifact.type === "projectile") return triggerProjectileArtifact({ state, artifact, params, callbacks });
    if (artifact.type === "chain") return triggerChainArtifact({ state, artifact, params, callbacks });
    if (artifact.type === "support") return triggerSupportArtifact({ state, artifact, params, callbacks });
    return triggerAreaArtifact({ state, artifact, params, callbacks });
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
    } else if (bond.type === "frost_chain") {
      triggerChain({ state, target, params: bond, callbacks, source: "artifact_bond", bonusVsSlowed: bond.bonusVsSlowed });
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
