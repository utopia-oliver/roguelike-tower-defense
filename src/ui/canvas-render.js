(() => {
  window.XM = window.XM || {};
  window.XM.CanvasRender = window.XM.CanvasRender || {};

  function draw(context) {
    const { ctx, canvas, state } = context;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(context);
    drawFormationArea(context);
    state.zones.forEach((zone) => drawZone({ ...context, zone }));
    state.deployedRoles.forEach((role) => drawRole({ ...context, role }));
    state.enemies.forEach((enemy) => drawEnemy({ ...context, enemy }));
    state.projectiles.forEach((projectile) => drawProjectile({ ...context, projectile }));
    (state.visualEvents || []).filter(isDrawableVisualEvent).forEach((event) => drawVisualEvent({ ...context, event }));
    state.floaters.forEach((floater) => drawFloater({ ...context, floater }));
    drawBossBar(context);
  }

  function drawGrid({ ctx, canvas, grid, helpers }) {
    for (let row = 0; row < grid.rows; row += 1) {
      for (let col = 0; col < grid.columns; col += 1) {
        ctx.fillStyle =
          row === 0
            ? "#263a2b"
            : row === grid.rows - 1
            ? "#3b2f25"
            : "#20362a";
        ctx.fillRect(col * grid.cellW, row * grid.cellH, grid.cellW - 1, grid.cellH - 1);
        if (helpers.isDeployable(col, row)) {
          ctx.strokeStyle = "rgba(222, 204, 147, 0.34)";
          ctx.strokeRect(col * grid.cellW + 5, row * grid.cellH + 5, grid.cellW - 10, grid.cellH - 10);
        }
      }
    }
    ctx.fillStyle = "#e8d28b";
    ctx.font = "16px Microsoft YaHei";
    ctx.textAlign = "left";
    ctx.fillText("妖门区：怪物出生点", 18, 34);
    ctx.fillText("妖兽行进区", 18, grid.cellH + 28);
    ctx.fillText("护山大阵 / 护山阵眼区", 18, canvas.height - 28);
    for (let col = 0; col < grid.columns; col += 1) {
      ctx.strokeStyle = "rgba(216, 172, 82, 0.35)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(col * grid.cellW + grid.cellW / 2, 0);
      ctx.lineTo(col * grid.cellW + grid.cellW / 2, canvas.height);
      ctx.stroke();
    }
  }

  function drawFormationArea({ ctx, canvas, state, DATA, grid, helpers }) {
    const formation = DATA.formations[state.selectedFormationId];
    if (!formation) return;
    ctx.strokeStyle = "rgba(92, 219, 149, 0.75)";
    ctx.lineWidth = 3;
    ctx.strokeRect(2, (grid.rows - 1) * grid.cellH + 2, canvas.width - 4, grid.cellH - 4);
    ctx.strokeStyle = "rgba(255, 154, 118, 0.65)";
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(0, helpers.attackLineY());
    ctx.lineTo(canvas.width, helpers.attackLineY());
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawRole({ ctx, DATA, colors, role }) {
    const config = DATA.roles[role.roleId];
    ctx.fillStyle = colors[config.school] || "#e5e7eb";
    ctx.beginPath();
    ctx.arc(role.x, role.y, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#152018";
    ctx.font = "bold 14px Microsoft YaHei";
    ctx.textAlign = "center";
    ctx.fillText(config.name.slice(0, 2), role.x, role.y + 5);
    ctx.fillStyle = "#fff2cd";
    ctx.font = "12px Microsoft YaHei";
    ctx.fillText(config.school, role.x, role.y + 39);
  }

  function enemyColor({ colors, enemy }) {
    const typeColors = {
      normal: "#b2563c",
      fast: "#d0c56c",
      armored: "#7f8794",
      array_attacker: "#ef4444",
      support: "#b88cff",
      miasma: "#84cc16",
      array_breaker: "#fb7185",
      elite: "#dc6b38",
    };
    return colors[enemy.config.id] || typeColors[enemy.config.type] || "#a3a3a3";
  }

  function drawEnemy({ ctx, colors, enemy }) {
    ctx.fillStyle = enemyColor({ colors, enemy });
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();
    if (enemy.config.type === "fast") {
      ctx.strokeStyle = "rgba(250, 250, 210, 0.45)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(enemy.x, enemy.y + enemy.radius + 4);
      ctx.lineTo(enemy.x - 12, enemy.y + enemy.radius + 18);
      ctx.stroke();
    }
    if (enemy.config.type === "armored") {
      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    if (enemy.config.type === "array_breaker") {
      ctx.strokeStyle = "#ff5c7a";
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (enemy.config.type === "support") {
      ctx.strokeStyle = "#e9d5ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius + 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (enemy.config.isElite || enemy.config.isBoss) {
      ctx.strokeStyle = enemy.hasStatus("demon_armor") ? "#fde68a" : "#f97316";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius + 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (enemy.hasStatus("slow")) {
      ctx.strokeStyle = "#93ddf8";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    if (enemy.hasStatus("poison")) {
      ctx.strokeStyle = "#c084fc";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    if (enemy.hasStatus("vulnerable") || enemy.hasStatus("weaken_attack")) {
      ctx.strokeStyle = "#f8d66d";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (enemy.hasStatus("haste")) {
      ctx.strokeStyle = "#fef08a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius + 9, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (enemy.hasStatus("freeze")) {
      ctx.strokeStyle = "#d7f8ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius + 7, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "#271a17";
    ctx.fillRect(enemy.x - 22, enemy.y - enemy.radius - 11, 44, 5);
    ctx.fillStyle = enemy.config.isBoss ? "#d94668" : "#e45d4f";
    ctx.fillRect(enemy.x - 22, enemy.y - enemy.radius - 11, 44 * Math.max(0, enemy.hp / enemy.maxHp), 5);
  }

  function drawProjectile({ ctx, projectile }) {
    if (projectile.visualOnly) {
      ctx.strokeStyle = projectile.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(projectile.x, projectile.y);
      ctx.lineTo(projectile.tx, projectile.ty);
      ctx.stroke();
      return;
    }
    const angle = Math.atan2(projectile.vy, projectile.vx);
    ctx.save();
    ctx.translate(projectile.x, projectile.y);
    ctx.rotate(angle);
    ctx.lineCap = "round";
    ctx.strokeStyle = projectile.trailColor || "rgba(255,255,255,0.2)";
    ctx.lineWidth = projectile.type === "artifact_blade_projectile" ? projectile.width + 2 : projectile.width + 5;
    ctx.beginPath();
    ctx.moveTo(-projectile.length * 0.75, 0);
    ctx.lineTo(projectile.length * 0.35, 0);
    ctx.stroke();
    ctx.strokeStyle = projectile.color;
    ctx.lineWidth = projectile.width;
    ctx.beginPath();
    ctx.moveTo(-projectile.length / 2, 0);
    ctx.lineTo(projectile.length / 2, 0);
    ctx.stroke();
    if (projectile.type === "artifact_sword_projectile" || projectile.type === "giant_sword_projectile") {
      ctx.strokeStyle = "rgba(255, 244, 180, 0.7)";
      ctx.lineWidth = Math.max(2, projectile.width * 0.35);
      ctx.beginPath();
      ctx.moveTo(-projectile.length * 0.35, 0);
      ctx.lineTo(projectile.length * 0.45, 0);
      ctx.stroke();
    }
    if (projectile.type === "dao_light") {
      ctx.strokeStyle = "rgba(255, 241, 168, 0.75)";
      ctx.lineWidth = projectile.width + 8;
      ctx.beginPath();
      ctx.moveTo(-projectile.length * 0.2, 0);
      ctx.lineTo(projectile.length * 0.25, 0);
      ctx.stroke();
    }
    ctx.restore();
  }

  function eventColor(event, alpha = 1) {
    const key = event.colorKey || event.type;
    const palette = {
      fire: `rgba(249, 115, 22, ${alpha})`,
      frost: `rgba(147, 221, 248, ${alpha})`,
      poison: `rgba(168, 85, 247, ${alpha})`,
      thunder: `rgba(216, 180, 254, ${alpha})`,
      sound: `rgba(244, 214, 141, ${alpha})`,
      spear: `rgba(250, 204, 92, ${alpha})`,
      sword: `rgba(215, 225, 236, ${alpha})`,
      debuff: `rgba(248, 214, 109, ${alpha})`,
      earth: `rgba(180, 148, 93, ${alpha})`,
      heal: `rgba(134, 239, 172, ${alpha})`,
      projectile_sword: `rgba(125, 211, 252, ${alpha})`,
      multi_blade_projectile: `rgba(254, 243, 199, ${alpha})`,
      area_fire_burst: `rgba(249, 115, 22, ${alpha})`,
      area_frost: `rgba(147, 221, 248, ${alpha})`,
      aura_debuff: `rgba(248, 214, 109, ${alpha})`,
      chain_lightning: `rgba(216, 180, 254, ${alpha})`,
      poison_cloud: `rgba(168, 85, 247, ${alpha})`,
      impact_seal: `rgba(180, 148, 93, ${alpha})`,
      meteor_random: `rgba(251, 191, 36, ${alpha})`,
      heal_aura: `rgba(134, 239, 172, ${alpha})`,
      demon: `rgba(190, 24, 93, ${alpha})`,
      curse: `rgba(167, 139, 250, ${alpha})`,
      talisman: `rgba(232, 121, 249, ${alpha})`,
      armor: `rgba(253, 230, 138, ${alpha})`,
      demon_projectile: `rgba(190, 24, 93, ${alpha})`,
      curse_beam: `rgba(167, 139, 250, ${alpha})`,
      shaman_buff: `rgba(232, 121, 249, ${alpha})`,
      battle_roar: `rgba(248, 113, 113, ${alpha})`,
      demon_armor: `rgba(253, 230, 138, ${alpha})`,
    };
    return palette[key] || `rgba(255, 255, 255, ${alpha})`;
  }

  function eventProgress(event) {
    return Math.min(1, Math.max(0, (event.elapsed || 0) / Math.max(0.01, event.duration || 0.35)));
  }

  function isDrawableVisualEvent(event) {
    if (!event || !Number.isFinite(event.duration) || event.duration <= 0) return false;
    if (["chain_lightning"].includes(event.type)) return true;
    const x = event.x ?? event.fromX;
    const y = event.y ?? event.fromY;
    return Number.isFinite(x) && Number.isFinite(y);
  }

  function drawLightningPath(ctx, points, color) {
    if (points.length < 2) return;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    points.forEach((point, index) => {
      const wobble = index > 0 && index < points.length - 1 ? Math.sin((point.x + point.y + index * 17) * 0.08) * 5 : 0;
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x + wobble, point.y - wobble);
    });
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  function drawVisualEvent({ ctx, canvas, event }) {
    const t = eventProgress(event);
    const alpha = Math.max(0, 1 - t);
    const radius = (event.radius || 48) * (0.35 + t * 0.95);
    ctx.save();
    if (event.type === "chain_lightning") {
      const points = [];
      if (Number.isFinite(event.fromX) && Number.isFinite(event.fromY)) points.push({ x: event.fromX, y: event.fromY });
      (event.targets || []).filter(Boolean).forEach((target) => points.push({ x: target.x, y: target.y }));
      drawLightningPath(ctx, points, eventColor(event, alpha));
    } else if (event.type === "demon_projectile") {
      const toX = event.toX ?? event.x;
      const toY = event.toY ?? event.y;
      const fromX = event.fromX ?? event.x;
      const fromY = event.fromY ?? event.y;
      ctx.strokeStyle = eventColor(event, alpha);
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();
      ctx.strokeStyle = eventColor(event, alpha * 0.35);
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();
      ctx.fillStyle = eventColor(event, alpha * 0.2);
      ctx.beginPath();
      ctx.arc(toX, toY, radius * 0.35, 0, Math.PI * 2);
      ctx.fill();
    } else if (event.type === "curse_beam") {
      const toX = event.toX ?? event.x;
      const toY = event.toY ?? event.y;
      const fromX = event.fromX ?? event.x;
      const fromY = event.fromY ?? event.y;
      ctx.strokeStyle = eventColor(event, alpha * 0.8);
      ctx.lineWidth = 6;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = eventColor(event, alpha);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(toX, toY, radius * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(toX, toY, radius * 0.25, 0, Math.PI * 2);
      ctx.stroke();
    } else if (event.type === "shaman_buff") {
      ctx.strokeStyle = eventColor(event, alpha);
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(event.x, event.y, radius * (0.65 + t * 0.25), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = eventColor(event, alpha * 0.65);
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i += 1) {
        const angle = t * Math.PI * 2 + i * (Math.PI * 2 / 3);
        const markX = event.x + Math.cos(angle) * radius * 0.42;
        const markY = event.y + Math.sin(angle) * radius * 0.42;
        ctx.beginPath();
        ctx.arc(markX, markY, 5, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (event.type === "battle_roar") {
      ctx.strokeStyle = eventColor(event, alpha);
      ctx.lineWidth = 4;
      for (let i = 0; i < 2; i += 1) {
        ctx.beginPath();
        ctx.arc(event.x, event.y, radius * (0.75 + i * 0.28), 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (event.type === "demon_armor") {
      ctx.strokeStyle = eventColor(event, alpha);
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(event.x, event.y, radius * 0.72, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = eventColor(event, alpha * 0.12);
      ctx.beginPath();
      ctx.arc(event.x, event.y, radius * 0.55, 0, Math.PI * 2);
      ctx.fill();
    } else if (event.type === "area_burst") {
      ctx.strokeStyle = eventColor(event, alpha);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(event.x, event.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = eventColor(event, alpha * 0.16);
      ctx.beginPath();
      ctx.arc(event.x, event.y, radius * 0.82, 0, Math.PI * 2);
      ctx.fill();
    } else if (event.type === "wave") {
      ctx.strokeStyle = eventColor(event, alpha);
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.arc(event.x, event.y, radius * (0.55 + i * 0.25), 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (event.type === "sweep") {
      ctx.strokeStyle = eventColor(event, alpha);
      ctx.lineWidth = event.orientation === "vertical" ? 14 : 11;
      ctx.lineCap = "round";
      ctx.beginPath();
      if (event.orientation === "vertical") {
        ctx.moveTo(event.x, Math.max(0, event.y - radius));
        ctx.lineTo(event.x, Math.min(canvas.height, event.y + radius * 0.35));
      } else if (event.orientation === "diagonal") {
        ctx.moveTo(event.fromX || event.x - radius, event.fromY || event.y + radius * 0.4);
        ctx.lineTo(event.x, event.y);
      } else {
        ctx.moveTo(Math.max(0, event.x - radius), event.y);
        ctx.lineTo(Math.min(canvas.width, event.x + radius), event.y);
      }
      ctx.stroke();
    } else if (event.type === "poison_cloud") {
      ctx.fillStyle = eventColor(event, alpha * 0.22);
      ctx.beginPath();
      ctx.arc(event.x, event.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = eventColor(event, alpha * 0.65);
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (event.type === "heal_aura") {
      ctx.strokeStyle = eventColor(event, alpha);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(event.x, event.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = eventColor(event, alpha * 0.13);
      ctx.fill();
    } else if (event.type === "impact_seal") {
      ctx.fillStyle = eventColor(event, alpha * 0.18);
      ctx.fillRect(event.x - radius * 0.45, event.y - radius * 0.45, radius * 0.9, radius * 0.9);
      ctx.strokeStyle = eventColor(event, alpha);
      ctx.lineWidth = 4;
      ctx.strokeRect(event.x - radius * 0.45, event.y - radius * 0.45, radius * 0.9, radius * 0.9);
      ctx.beginPath();
      ctx.arc(event.x, event.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (event.type === "meteor") {
      ctx.strokeStyle = eventColor(event, alpha);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(event.x - 24, event.y - 42);
      ctx.lineTo(event.x, event.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(event.x, event.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawZone({ ctx, zone }) {
    ctx.fillStyle = zone.color;
    ctx.beginPath();
    ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawFloater({ ctx, floater }) {
    ctx.fillStyle = floater.color;
    ctx.font = "bold 16px Microsoft YaHei";
    ctx.textAlign = "center";
    ctx.fillText(floater.text, floater.x, floater.y);
  }

  function drawBossBar({ ctx, canvas, state }) {
    const boss = state.enemies.find((enemy) => enemy.config.isBoss && !enemy.dead);
    if (!boss) return;
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillRect(70, 16, canvas.width - 140, 18);
    ctx.fillStyle = "#c2410c";
    ctx.fillRect(70, 16, (canvas.width - 140) * Math.max(0, boss.hp / boss.maxHp), 18);
    ctx.fillStyle = "#fff7df";
    ctx.font = "13px Microsoft YaHei";
    ctx.textAlign = "center";
    ctx.fillText(boss.config.name, canvas.width / 2, 30);
  }

  Object.assign(window.XM.CanvasRender, {
    draw,
    drawBossBar,
    drawEnemy,
    drawFloater,
    drawFormationArea,
    drawGrid,
    drawProjectile,
    drawRole,
    drawVisualEvent,
    drawZone,
  });
})();
