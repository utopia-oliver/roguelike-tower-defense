(() => {
  window.XM = window.XM || {};
  window.XM.Projectiles = window.XM.Projectiles || {};

  const { colors } = window.XM.Constants;

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

  function projectileDefaults(config, art) {
    const type = config.projectileType || config.trajectoryType || "projectile";
    const defaults = {
      speed: 380,
      width: 7,
      length: 24,
      radius: 8,
      hitRadius: 14,
      collisionPadding: 8,
      color: colors[config.school] || "#dbeafe",
      trailColor: "rgba(255,255,255,0.22)",
      maxLifetime: 2.4,
    };
    if (type === "flying_sword") Object.assign(defaults, { speed: 360, width: 10, length: 34, radius: 16, hitRadius: 18, collisionPadding: 10, maxLifetime: 2.6, color: "#d9fbff", trailColor: "rgba(125, 211, 252, 0.28)" });
    if (type === "fire_talisman") Object.assign(defaults, { speed: 350, width: 10, length: 18, radius: 10, color: "#ffb15c", trailColor: "rgba(239, 123, 69, 0.28)" });
    if (type === "frost_bolt") Object.assign(defaults, { speed: 370, width: 8, length: 22, radius: 9, color: "#9eeaff", trailColor: "rgba(114, 200, 238, 0.28)" });
    if (type === "poison_needle") Object.assign(defaults, { speed: 430, width: 5, length: 24, radius: 7, color: "#d8b4fe", trailColor: "rgba(169, 122, 216, 0.28)" });
    if (type === "sword_wave") Object.assign(defaults, { speed: 400, width: 9, length: 34, radius: 12, hitRadius: 16, collisionPadding: 8, color: "#e8eef8", trailColor: "rgba(215, 225, 236, 0.22)" });
    if (type === "spear_arc") Object.assign(defaults, { speed: 390, width: 12, length: 42, radius: 11, color: "#f4d47c", trailColor: "rgba(214, 179, 106, 0.26)" });
    if (type === "thunder_arc") Object.assign(defaults, { speed: 440, width: 8, length: 26, radius: 9, color: "#ddd6fe", trailColor: "rgba(196, 181, 253, 0.3)" });
    if (type === "sound_wave") Object.assign(defaults, { speed: 330, width: 14, length: 46, radius: 15, color: "#f6d365", trailColor: "rgba(246, 211, 101, 0.22)" });
    if (type === "shadow_blade") Object.assign(defaults, { speed: 520, width: 7, length: 36, radius: 10, color: "#c4b5fd", trailColor: "rgba(76, 29, 149, 0.32)" });
    if (type === "dao_light") Object.assign(defaults, { speed: 390, width: 9, length: 38, radius: 12, color: "#fff1a8", trailColor: "rgba(250, 204, 21, 0.25)" });
    if (type === "artifact_sword_projectile") Object.assign(defaults, { speed: 430, width: 8, length: 40, radius: 13, hitRadius: 16, color: "#bff7ff", trailColor: "rgba(56, 189, 248, 0.25)" });
    if (type === "artifact_blade_projectile") Object.assign(defaults, { speed: 470, width: 5, length: 28, radius: 9, hitRadius: 12, color: "#fef3c7", trailColor: "rgba(245, 158, 11, 0.2)" });
    if (type === "formation_sword_projectile") Object.assign(defaults, { speed: 430, width: 8, length: 44, radius: 14, hitRadius: 17, color: "#e9ffff", trailColor: "rgba(222, 204, 147, 0.28)" });
    if (art?.giantSword) Object.assign(defaults, { speed: 430, width: 52, length: 160, radius: 54, hitRadius: 54, collisionPadding: 18, maxLifetime: 2.8, color: "#e9ffff", trailColor: "rgba(250, 204, 21, 0.34)" });
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
    if (count === 2) return [-3, 3];
    if (count === 3) return [-4, 0, 4];
    if (count === 4) return [-5, -2, 2, 5];
    if (count === 5) return [-7, -3.5, 0, 3.5, 7];
    const maxAngle = 8;
    const step = (maxAngle * 2) / Math.max(1, count - 1);
    return Array.from({ length: count }, (_, index) => -maxAngle + step * index);
  }

  function projectileAimOffsets(count, distanceToTarget = 0) {
    if (count <= 1) return [0];
    const scale = Math.min(1.18, Math.max(0.85, distanceToTarget / 360));
    const maxOffset = distanceToTarget > 420 ? 42 : 36;
    const presets = {
      2: [-10, 10],
      3: [-14, 0, 14],
      4: [-20, -7, 7, 20],
      5: [-26, -13, 0, 13, 26],
    };
    const offsets = presets[count] || Array.from({ length: count }, (_, index) => {
      const centered = index - (count - 1) / 2;
      return centered * Math.min(14, maxOffset / Math.max(1, (count - 1) / 2));
    });
    return offsets.map((offset) => Math.max(-maxOffset, Math.min(maxOffset, offset * scale)));
  }

  function getPredictedTargetPosition(source, target, projectileSpeed, options = {}) {
    if (!isEnemyTargetable(target)) return null;
    if (!Number.isFinite(source?.x) || !Number.isFinite(source?.y)) return null;
    if (!Number.isFinite(target?.x) || !Number.isFinite(target?.y)) return null;
    if (!isEnemyInFrontOfRole(target, source)) return null;
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const travelTime = Math.hypot(dx, dy) / Math.max(1, projectileSpeed);
    const pathPixelDistance = Number(options.pathPixelDistance) || 0;
    const moveSpeed = Number(target.baseMoveSpeed || target.moveSpeed || 0);
    const pathPixelSpeed = moveSpeed > 10 ? moveSpeed : (moveSpeed * pathPixelDistance) / 6.1;
    const predicted = {
      x: target.x + (target.vx || 0) * travelTime,
      y: target.y + (target.vy || pathPixelSpeed) * travelTime,
    };
    if (!Number.isFinite(predicted.x) || !Number.isFinite(predicted.y)) {
      return { x: target.x, y: target.y };
    }
    if (predicted.y >= source.y - 8) {
      return { x: target.x, y: target.y };
    }
    return predicted;
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
        (target && state.enemies.find((enemy) => enemy.id === target.id && isEnemyTargetable(enemy) && isEnemyInFrontOfRole(enemy, role))) ||
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
    if (!isEnemyTargetable(target) || !isEnemyInFrontOfRole(target, role)) return;
    const predicted = getPredictedTargetPosition(role, target, defaults.speed, {
      pathPixelDistance: helpers.pathPixelDistance,
    });
    if (!predicted) return;
    const dx = predicted.x - role.x;
    const dy = predicted.y - role.y;
    const len = Math.hypot(dx, dy);
    if (!Number.isFinite(len) || len <= 0 || predicted.y >= role.y - 8) {
      if (typeof console !== "undefined" && typeof console.warn === "function") {
        console.warn("[RoleAttack] invalid backward target", {
          roleId: role.id || role.roleId || role.characterId,
          startX: role.x,
          startY: role.y,
          targetId: target.id,
          targetX: target.x,
          targetY: target.y,
          targetPoint: predicted,
        });
      }
      return;
    }
    const baseVx = dx / len;
    const baseVy = dy / len;
    const normalX = -baseVy;
    const normalY = baseVx;
    const actualCount = art.giantSword ? 1 : projectileCount;
    const spreadAngles = projectileSpreadAngles(actualCount);
    const aimOffsets = projectileAimOffsets(actualCount, len);
    for (let i = 0; i < actualCount; i += 1) {
      const centered = i - (actualCount - 1) / 2;
      const aimX = predicted.x + normalX * (aimOffsets[i] || 0);
      let aimY = predicted.y + normalY * (aimOffsets[i] || 0);
      if (aimY >= role.y - 8) aimY = target.y;
      const aimDx = aimX - role.x;
      const aimDy = aimY - role.y;
      const aimLen = Math.hypot(aimDx, aimDy);
      if (!Number.isFinite(aimLen) || aimLen <= 0 || aimDy >= -1) {
        if (typeof console !== "undefined" && typeof console.warn === "function") {
          console.warn("[RoleAttack] invalid backward target", {
            roleId: role.id || role.roleId || role.characterId,
            startX: role.x,
            startY: role.y,
            targetId: target.id,
            targetX: target.x,
            targetY: target.y,
            targetPoint: { x: aimX, y: aimY },
          });
        }
        continue;
      }
      const aimBaseVx = aimDx / aimLen;
      const aimBaseVy = aimDy / aimLen;
      const angle = ((spreadAngles[i] || 0) * Math.PI) / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const vx = aimBaseVx * cos - aimBaseVy * sin;
      const vy = aimBaseVx * sin + aimBaseVy * cos;
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
      if (!isEnemyTargetable(enemy) || projectile.hitEnemyIds.has(enemy.id)) continue;
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
