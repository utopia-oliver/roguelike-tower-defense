(() => {
  window.XM = window.XM || {};
  window.XM.Projectiles = window.XM.Projectiles || {};

  const { colors } = window.XM.Constants;

  function projectileDefaults(config, art) {
    const type = config.projectileType || config.trajectoryType || "projectile";
    const defaults = {
      speed: 380,
      width: 7,
      length: 24,
      radius: 8,
      hitRadius: 10,
      collisionPadding: 4,
      color: colors[config.school] || "#dbeafe",
      trailColor: "rgba(255,255,255,0.22)",
      maxLifetime: 1.5,
    };
    if (type === "flying_sword") Object.assign(defaults, { speed: 360, width: 10, length: 34, radius: 14, hitRadius: 14, collisionPadding: 6, maxLifetime: 1.8, color: "#d9fbff", trailColor: "rgba(125, 211, 252, 0.28)" });
    if (type === "fire_talisman") Object.assign(defaults, { speed: 350, width: 10, length: 18, radius: 10, color: "#ffb15c", trailColor: "rgba(239, 123, 69, 0.28)" });
    if (type === "frost_bolt") Object.assign(defaults, { speed: 370, width: 8, length: 22, radius: 9, color: "#9eeaff", trailColor: "rgba(114, 200, 238, 0.28)" });
    if (type === "poison_needle") Object.assign(defaults, { speed: 430, width: 5, length: 24, radius: 7, color: "#d8b4fe", trailColor: "rgba(169, 122, 216, 0.28)" });
    if (type === "sword_wave") Object.assign(defaults, { speed: 400, width: 9, length: 34, radius: 9, color: "#e8eef8", trailColor: "rgba(215, 225, 236, 0.22)" });
    if (type === "spear_arc") Object.assign(defaults, { speed: 390, width: 12, length: 42, radius: 11, color: "#f4d47c", trailColor: "rgba(214, 179, 106, 0.26)" });
    if (type === "thunder_arc") Object.assign(defaults, { speed: 440, width: 8, length: 26, radius: 9, color: "#ddd6fe", trailColor: "rgba(196, 181, 253, 0.3)" });
    if (art?.giantSword) Object.assign(defaults, { speed: 430, width: 52, length: 160, radius: 54, hitRadius: 54, collisionPadding: 18, maxLifetime: 2.5, color: "#e9ffff", trailColor: "rgba(250, 204, 21, 0.34)" });
    defaults.speed *= art?.speedMult || 1;
    if (art?.giantSword) defaults.speed *= art.giantSwordSpeedMult || 1;
    defaults.width += art?.widthAdd || 0;
    defaults.radius += art?.hitRadiusAdd || 0;
    defaults.hitRadius = (defaults.hitRadius || defaults.radius) + (art?.hitRadiusAdd || 0);
    defaults.collisionPadding += art?.collisionPaddingAdd || 0;
    if (art && art.pierceAdd > 0) defaults.radius += 1;
    return defaults;
  }

  function projectileSpreadAngles(count) {
    if (count <= 1) return [0];
    if (count === 2) return [-5, 5];
    if (count === 3) return [-7, 0, 7];
    if (count === 4) return [-9, -3, 3, 9];
    if (count === 5) return [-12, -6, 0, 6, 12];
    const step = 24 / Math.max(1, count - 1);
    return Array.from({ length: count }, (_, index) => -12 + step * index);
  }

  function getPredictedTargetPosition(source, target, projectileSpeed, options = {}) {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const travelTime = Math.hypot(dx, dy) / Math.max(1, projectileSpeed);
    const pathPixelDistance = Number(options.pathPixelDistance) || 0;
    const pathPixelSpeed = ((target.moveSpeed || 0) * pathPixelDistance) / 6.1;
    return {
      x: target.x + (target.vx || 0) * travelTime,
      y: target.y + (target.vy || pathPixelSpeed) * travelTime,
    };
  }

  function fireProjectileAttack({
    state,
    data,
    role,
    target,
    attackParams,
    callbacks = {},
    helpers = {},
  }) {
    const volleyCount = Math.max(1, attackParams.volleyCount || 1);
    const volleyInterval = Math.max(0.04, attackParams.volleyInterval || 0.1);
    const fireOneVolley = () => {
      if (state.appState !== helpers.battleState) return;
      const stats = callbacks.roleStats(role);
      const liveTarget =
        state.enemies.find((enemy) => enemy.id === target.id && !enemy.dead) ||
        callbacks.chooseTarget(role, stats.range);
      if (!liveTarget) return;
      createRoleProjectiles({
        state,
        data,
        role,
        target: liveTarget,
        damage: attackParams.damage,
        projectileCount: attackParams.projectileCount,
        callbacks,
        helpers,
      });
    };
    for (let volleyIndex = 0; volleyIndex < volleyCount; volleyIndex += 1) {
      if (volleyIndex === 0) {
        fireOneVolley();
      } else {
        setTimeout(fireOneVolley, volleyIndex * volleyInterval * 1000);
      }
    }
  }

  function createRoleProjectiles({
    state,
    data,
    role,
    target,
    damage,
    projectileCount,
    callbacks = {},
    helpers = {},
  }) {
    const config = data.roles[role.roleId];
    const art = callbacks.martialBonuses(role.roleId);
    const defaults = projectileDefaults(config, art);
    const predicted = getPredictedTargetPosition(role, target, defaults.speed, {
      pathPixelDistance: helpers.pathPixelDistance,
    });
    const dx = predicted.x - role.x;
    const dy = predicted.y - role.y;
    const len = Math.hypot(dx, dy) || 1;
    const baseVx = dx / len;
    const baseVy = dy / len;
    const normalX = -baseVy;
    const normalY = baseVx;
    const actualCount = art.giantSword ? 1 : projectileCount;
    const spreadAngles = projectileSpreadAngles(actualCount);
    for (let i = 0; i < actualCount; i += 1) {
      const centered = i - (actualCount - 1) / 2;
      const angle = ((spreadAngles[i] || 0) * Math.PI) / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const vx = baseVx * cos - baseVy * sin;
      const vy = baseVx * sin + baseVy * cos;
      const sideDamage = art.giantSword ? art.giantSwordDamageMult : centered === 0 ? 1 : art.sideDamageScale;
      const offset = art.giantSword ? 0 : centered * 4;
      const pierceCount = art.giantSword ? 6 + state.bonuses.pierceAdd : art.pierceAdd + state.bonuses.pierceAdd;
      state.projectiles.push({
        id: callbacks.makeId(),
        ownerCharacterId: role.roleId,
        ownerRoleId: role.id,
        type: art.giantSword ? "giant_sword_projectile" : config.projectileType || config.trajectoryType || "projectile",
        trajectoryType: config.trajectoryType,
        x: role.x + normalX * offset,
        y: role.y + normalY * offset,
        lastX: role.x + normalX * offset,
        lastY: role.y + normalY * offset,
        vx,
        vy,
        speed: defaults.speed,
        damage: damage * sideDamage,
        width: defaults.width,
        length: defaults.length,
        radius: defaults.radius,
        hitRadius: defaults.hitRadius || defaults.radius,
        collisionPadding: defaults.collisionPadding || 0,
        pierce: pierceCount > 0,
        remainingPierce: pierceCount,
        hitEnemyIds: new Set(),
        lifetime: 0,
        maxLifetime: defaults.maxLifetime,
        effectType: config.trajectoryType,
        color: defaults.color,
        trailColor: defaults.trailColor,
        sourceRole: role,
        sourceConfig: config,
        splashRadius: art.giantSwordSplashRadius,
        splashDamageMultiplier: art.giantSwordSplashDamage,
        eliteBossDamageMultiplier: art.giantSwordEliteDamageMult,
        attackLineDamageMultiplier: art.attackLineDamageMult,
      });
    }
  }

  function updateProjectiles({
    state,
    deltaTime,
    callbacks = {},
    helpers = {},
  }) {
    state.projectiles.forEach((projectile) => {
      if (projectile.visualOnly) {
        projectile.ttl -= deltaTime;
        return;
      }
      projectile.lastX = projectile.x;
      projectile.lastY = projectile.y;
      projectile.x += projectile.vx * projectile.speed * deltaTime;
      projectile.y += projectile.vy * projectile.speed * deltaTime;
      projectile.lifetime += deltaTime;
      checkProjectileCollision({
        state,
        projectile,
        callbacks,
        helpers,
      });
    });
    state.projectiles = state.projectiles.filter((projectile) => {
      if (projectile.visualOnly) return projectile.ttl > 0;
      const inBounds =
        projectile.x > -80 &&
        projectile.x < helpers.canvasWidth + 80 &&
        projectile.y > -80 &&
        projectile.y < helpers.canvasHeight + 80;
      return !projectile.dead && projectile.lifetime < projectile.maxLifetime && inBounds;
    });
  }

  function checkProjectileCollision({
    state,
    projectile,
    callbacks = {},
    helpers = {},
  }) {
    for (const enemy of state.enemies) {
      if (enemy.dead || projectile.hitEnemyIds.has(enemy.id)) continue;
      if (!checkProjectileHitEnemy(projectile, enemy, helpers)) continue;
      projectile.hitEnemyIds.add(enemy.id);
      const eliteBossMultiplier = enemy.config.isBoss || enemy.config.type === "精英"
        ? projectile.eliteBossDamageMultiplier || 1
        : 1;
      const attackLineMultiplier = enemy.state === helpers.attackingEnemyState
        ? projectile.attackLineDamageMultiplier || 1
        : 1;
      const hitDamage = projectile.damage * eliteBossMultiplier * attackLineMultiplier;
      callbacks.applyRoleHit(projectile.sourceRole, enemy, hitDamage);
      if (projectile.splashRadius > 0 && projectile.splashDamageMultiplier > 0) {
        callbacks.areaDamage(enemy.x, enemy.y, projectile.splashRadius, hitDamage * projectile.splashDamageMultiplier, "role");
      }
      if (!projectile.pierce) {
        projectile.dead = true;
        return;
      }
      projectile.remainingPierce -= 1;
      if (projectile.remainingPierce < 0) {
        projectile.dead = true;
        return;
      }
    }
  }

  function checkProjectileHitEnemy(projectile, enemy, helpers = {}) {
    const radius =
      (projectile.hitRadius || projectile.radius || 0) +
      (enemy.hitRadius || enemy.radius || 0) +
      (projectile.collisionPadding || 0);
    return (
      helpers.distancePointToSegment(
        enemy.x,
        enemy.y,
        projectile.lastX ?? projectile.x,
        projectile.lastY ?? projectile.y,
        projectile.x,
        projectile.y,
      ) <= radius
    );
  }

  Object.assign(window.XM.Projectiles, {
    checkProjectileCollision,
    checkProjectileHitEnemy,
    createRoleProjectiles,
    fireProjectileAttack,
    getPredictedTargetPosition,
    projectileDefaults,
    projectileSpreadAngles,
    updateProjectiles,
  });
})();
