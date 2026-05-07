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

  Object.assign(window.XM.Projectiles, {
    getPredictedTargetPosition,
    projectileDefaults,
    projectileSpreadAngles,
  });
})();
