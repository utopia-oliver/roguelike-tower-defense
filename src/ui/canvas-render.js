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
        const x = col * grid.cellW;
        const y = row * grid.cellH;
        const isDeploySlot = helpers.isDeployable(col, row);
        ctx.fillStyle =
          row === 0
            ? "#1f3028"
            : row === grid.rows - 1
            ? "#23382f"
            : "#1d3028";
        ctx.fillRect(x, y, grid.cellW - 1, grid.cellH - 1);
        if (row === grid.rows - 1) {
          const gradient = ctx.createLinearGradient(x, y, x, y + grid.cellH);
          gradient.addColorStop(0, "rgba(77, 190, 151, 0.16)");
          gradient.addColorStop(0.55, "rgba(216, 172, 82, 0.08)");
          gradient.addColorStop(1, "rgba(10, 18, 14, 0.38)");
          ctx.fillStyle = gradient;
          ctx.fillRect(x + 1, y + 1, grid.cellW - 2, grid.cellH - 2);
        }
        if (helpers.isDeployable(col, row)) {
          drawFormationSlot({ ctx, x, y, w: grid.cellW, h: grid.cellH, active: isDeploySlot });
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

  function drawFormationSlot({ ctx, x, y, w, h }) {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const radius = Math.min(w, h) * 0.28;
    ctx.save();
    ctx.strokeStyle = "rgba(109, 226, 190, 0.46)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 7, y + 7, w - 14, h - 14);
    ctx.strokeStyle = "rgba(219, 188, 115, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.52, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(109, 226, 190, 0.28)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i += 1) {
      const angle = i * (Math.PI / 2) + Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * radius * 0.72, cy + Math.sin(angle) * radius * 0.72);
      ctx.lineTo(cx + Math.cos(angle) * radius * 1.18, cy + Math.sin(angle) * radius * 1.18);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(228, 241, 218, 0.64)";
    ctx.font = "12px Microsoft YaHei";
    ctx.textAlign = "center";
    ctx.fillText("阵", cx, cy + 4);
    ctx.restore();
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
      ctx.save();
      ctx.shadowColor = projectile.color;
      ctx.shadowBlur = 8;
      ctx.strokeStyle = projectile.color;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(projectile.x, projectile.y);
      ctx.lineTo(projectile.tx, projectile.ty);
      ctx.stroke();
      ctx.restore();
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
      ctx.shadowColor = eventColor(event, alpha);
      ctx.shadowBlur = 12;
      ctx.strokeStyle = eventColor(event, alpha);
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = eventColor(event, alpha * 0.35);
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();
      ctx.fillStyle = eventColor(event, alpha * 0.2);
      ctx.beginPath();
      ctx.arc(toX, toY, radius * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 154, 118, ${alpha * 0.65})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(toX, toY, radius * 0.48, 0, Math.PI * 2);
      ctx.stroke();
    } else if (event.type === "curse_beam") {
      const toX = event.toX ?? event.x;
      const toY = event.toY ?? event.y;
      const fromX = event.fromX ?? event.x;
      const fromY = event.fromY ?? event.y;
      ctx.strokeStyle = eventColor(event, alpha * 0.8);
      ctx.shadowColor = eventColor(event, alpha);
      ctx.shadowBlur = 10;
      ctx.lineWidth = 7;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();
      ctx.shadowBlur = 0;
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

  function roleAccent(config = {}) {
    const key = config.school || config.role || config.projectileType;
    const palette = {
      "剑修": "#dcebd6",
      "火修": "#f4a261",
      "冰修": "#93ddf8",
      "毒修": "#a7f3a1",
      "雷修": "#c4b5fd",
      "音修": "#f1d99a",
      "枪修": "#facc5c",
      "法修": "#c7f7df",
      "暗修": "#c084fc",
      flying_sword: "#dcebd6",
      fire_talisman: "#f4a261",
      frost_bolt: "#93ddf8",
      poison_needle: "#a7f3a1",
      thunder_arc: "#c4b5fd",
      sound_wave: "#f1d99a",
      spear_arc: "#facc5c",
      shadow_blade: "#c084fc",
      dao_light: "#fff1a8",
    };
    return palette[key] || "#dcebd6";
  }

  function drawBattleLabel(ctx, text, x, y) {
    ctx.save();
    ctx.font = "bold 15px Microsoft YaHei";
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255, 247, 219, 0.88)";
    ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
    ctx.shadowBlur = 8;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function drawGrid({ ctx, canvas, grid, helpers }) {
    const gateHeight = grid.cellH * 1.06;
    const arrayTop = (grid.rows - 1) * grid.cellH;
    const travelHeight = arrayTop - gateHeight;
    const base = ctx.createLinearGradient(0, 0, 0, canvas.height);
    base.addColorStop(0, "#120f19");
    base.addColorStop(0.18, "#1d1e24");
    base.addColorStop(0.52, "#1c3129");
    base.addColorStop(0.84, "#17352b");
    base.addColorStop(1, "#07110e");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const rift = ctx.createRadialGradient(canvas.width * 0.5, gateHeight * 0.35, 12, canvas.width * 0.5, gateHeight * 0.35, canvas.width * 0.72);
    rift.addColorStop(0, "rgba(150, 49, 136, 0.52)");
    rift.addColorStop(0.36, "rgba(75, 30, 84, 0.36)");
    rift.addColorStop(1, "rgba(4, 8, 8, 0)");
    ctx.fillStyle = rift;
    ctx.fillRect(0, 0, canvas.width, gateHeight);

    ctx.strokeStyle = "rgba(123, 44, 112, 0.42)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.ellipse(canvas.width * 0.5, gateHeight * 0.34, canvas.width * 0.18, gateHeight * 0.22, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(216, 172, 82, 0.08)";
    ctx.lineWidth = 1;
    for (let col = 1; col < grid.columns; col += 1) {
      const x = col * grid.cellW;
      ctx.beginPath();
      ctx.moveTo(x, gateHeight + 12);
      ctx.lineTo(x, arrayTop - 8);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(5, 12, 11, 0.16)";
    for (let i = 0; i < 9; i += 1) {
      const y = gateHeight + i * (travelHeight / 8);
      ctx.beginPath();
      ctx.ellipse(canvas.width * 0.5, y, canvas.width * (0.18 + i * 0.018), 7, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = "rgba(109, 226, 190, 0.1)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i += 1) {
      const offset = (i - 1.5) * grid.cellW * 0.72;
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.5 + offset, gateHeight + 22);
      ctx.bezierCurveTo(
        canvas.width * 0.5 + offset * 0.55,
        gateHeight + travelHeight * 0.35,
        canvas.width * 0.5 - offset * 0.35,
        gateHeight + travelHeight * 0.68,
        canvas.width * 0.5 - offset * 0.22,
        arrayTop - 18,
      );
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(109, 226, 190, 0.18)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, gateHeight);
    ctx.lineTo(canvas.width, gateHeight);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 154, 118, 0.5)";
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(0, helpers.attackLineY());
    ctx.lineTo(canvas.width, helpers.attackLineY());
    ctx.stroke();
    ctx.setLineDash([]);

    const arrayGradient = ctx.createLinearGradient(0, arrayTop, 0, canvas.height);
    arrayGradient.addColorStop(0, "rgba(88, 214, 174, 0.16)");
    arrayGradient.addColorStop(0.45, "rgba(216, 172, 82, 0.08)");
    arrayGradient.addColorStop(1, "rgba(7, 17, 14, 0.62)");
    ctx.fillStyle = arrayGradient;
    ctx.fillRect(0, arrayTop, canvas.width, canvas.height - arrayTop);

    drawBattleLabel(ctx, "妖门区", 18, 30);
    drawBattleLabel(ctx, "妖兽行进区", 18, gateHeight + 30);
    drawBattleLabel(ctx, "护山大阵", 18, canvas.height - 28);
  }

  function drawFormationArea({ ctx, canvas, state, DATA, grid, helpers }) {
    const formation = DATA.formations[state.selectedFormationId];
    if (!formation) return;
    const roles = state.deployedRoles || [];
    const arrayTop = (grid.rows - 1) * grid.cellH;
    const hp = Number.isFinite(state.arrayCoreHp) ? state.arrayCoreHp : Number.isFinite(state.baseHp) ? state.baseHp : 180;
    const maxHp = Number.isFinite(state.arrayCoreMaxHp)
      ? state.arrayCoreMaxHp
      : Number.isFinite(state.maxBaseHp)
      ? state.maxBaseHp
      : Math.max(hp, 180);
    const coreRatio = Math.max(0, Math.min(1, hp / Math.max(1, maxHp)));
    ctx.save();
    ctx.strokeStyle = coreRatio < 0.35 ? "rgba(255, 154, 118, 0.58)" : "rgba(109, 226, 190, 0.32)";
    ctx.lineWidth = 2;
    ctx.strokeRect(3, arrayTop + 3, canvas.width - 6, grid.cellH - 6);

    const coreX = canvas.width * 0.5;
    const coreY = arrayTop + grid.cellH * 0.62;
    const core = ctx.createRadialGradient(coreX, coreY, 12, coreX, coreY, grid.cellW * 1.85);
    core.addColorStop(0, "rgba(255, 247, 219, 0.22)");
    core.addColorStop(0.35, "rgba(109, 226, 190, 0.14)");
    core.addColorStop(1, "rgba(109, 226, 190, 0)");
    ctx.fillStyle = core;
    ctx.fillRect(0, arrayTop, canvas.width, grid.cellH);

    ctx.strokeStyle = "rgba(216, 172, 82, 0.16)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(coreX, coreY, grid.cellW * 1.15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(coreX, coreY, grid.cellW * 0.68, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = coreRatio < 0.35 ? "rgba(255, 154, 118, 0.4)" : "rgba(109, 226, 190, 0.2)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 8; i += 1) {
      const angle = i * (Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(coreX + Math.cos(angle) * grid.cellW * 0.38, coreY + Math.sin(angle) * grid.cellW * 0.38);
      ctx.lineTo(coreX + Math.cos(angle) * grid.cellW * 1.34, coreY + Math.sin(angle) * grid.cellW * 1.34);
      ctx.stroke();
    }

    roles.forEach((role, index) => {
      if (!Number.isFinite(role.x) || !Number.isFinite(role.y)) return;
      ctx.strokeStyle = "rgba(109, 226, 190, 0.2)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(coreX, coreY);
      ctx.lineTo(role.x, role.y);
      ctx.stroke();
      const r = 31 + (index % 2) * 2;
      ctx.strokeStyle = "rgba(109, 226, 190, 0.48)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(role.x, role.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(216, 172, 82, 0.32)";
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(role.x, role.y, r + 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    });
    ctx.restore();
  }

  function drawRole({ ctx, DATA, role }) {
    const config = DATA.roles[role.roleId] || {};
    const accent = roleAccent(config);
    const label = (config.name || role.roleId || "门人").slice(0, 2);
    ctx.save();
    ctx.strokeStyle = "rgba(216, 172, 82, 0.28)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.arc(role.x, role.y, 34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowColor = accent;
    ctx.shadowBlur = 12;
    ctx.fillStyle = "rgba(6, 22, 18, 0.9)";
    ctx.beginPath();
    ctx.arc(role.x, role.y, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(role.x, role.y, 25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(role.x, role.y - 23, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff7db";
    ctx.font = "bold 14px Microsoft YaHei";
    ctx.textAlign = "center";
    ctx.fillText(label, role.x, role.y + 5);
    ctx.fillStyle = "rgba(255, 247, 219, 0.86)";
    ctx.font = "12px Microsoft YaHei";
    ctx.fillText(config.school || "门人", role.x, role.y + 42);
    ctx.restore();
  }

  function enemyColor({ colors, enemy }) {
    const typeColors = {
      normal: "#b2563c",
      fast: "#d0c56c",
      armored: "#7f8794",
      array_attacker: "#ef4444",
      array_breaker: "#fb7185",
      support: "#b88cff",
      caster: "#b88cff",
      ranged: "#d97745",
      miasma: "#84cc16",
      elite: "#dc6b38",
      boss: "#9f1239",
    };
    return colors[enemy.config.id] || typeColors[enemy.config.type] || "#a3a3a3";
  }

  function drawEnemyShape(ctx, enemy, color) {
    const radius = enemy.config.drawRadius || enemy.radius;
    const type = enemy.config.type;
    ctx.fillStyle = color;
    ctx.beginPath();
    if (type === "fast") {
      ctx.moveTo(enemy.x, enemy.y - radius - 3);
      ctx.lineTo(enemy.x + radius + 6, enemy.y + radius * 0.65);
      ctx.lineTo(enemy.x - radius - 6, enemy.y + radius * 0.65);
      ctx.closePath();
    } else if (type === "armored") {
      ctx.rect(enemy.x - radius * 0.86, enemy.y - radius * 0.86, radius * 1.72, radius * 1.72);
    } else if (type === "ranged" || type === "caster" || type === "support") {
      for (let i = 0; i < 6; i += 1) {
        const a = -Math.PI / 2 + i * (Math.PI * 2 / 6);
        const r = i % 2 ? radius * 0.66 : radius * 1.05;
        const x = enemy.x + Math.cos(a) * r;
        const y = enemy.y + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    } else {
      ctx.arc(enemy.x, enemy.y, radius, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  function drawEnemy({ ctx, colors, enemy }) {
    const color = enemyColor({ colors, enemy });
    const radius = enemy.config.drawRadius || enemy.radius;
    ctx.save();
    ctx.shadowColor = enemy.config.isBoss ? "rgba(190, 24, 93, 0.7)" : color;
    ctx.shadowBlur = enemy.config.isElite || enemy.config.isBoss ? 14 : 5;
    drawEnemyShape(ctx, enemy, color);
    ctx.shadowBlur = 0;

    if (enemy.config.attackMode === "ranged") {
      ctx.strokeStyle = "rgba(252, 211, 77, 0.78)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(enemy.x - 8, enemy.y);
      ctx.lineTo(enemy.x + 8, enemy.y);
      ctx.moveTo(enemy.x, enemy.y - 8);
      ctx.lineTo(enemy.x, enemy.y + 8);
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 247, 219, 0.86)";
      ctx.font = "bold 11px Microsoft YaHei";
      ctx.textAlign = "center";
      ctx.fillText("符", enemy.x, enemy.y + 4);
    }
    if (enemy.config.attackMode === "caster" || enemy.config.type === "support" || enemy.config.type === "caster") {
      ctx.strokeStyle = "rgba(216, 180, 254, 0.78)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, radius + 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255, 247, 219, 0.86)";
      ctx.font = "bold 11px Microsoft YaHei";
      ctx.textAlign = "center";
      ctx.fillText("咒", enemy.x, enemy.y + 4);
    }
    if (enemy.config.type === "array_breaker" || enemy.config.type === "array_attacker") {
      ctx.strokeStyle = "#ff5c7a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(enemy.x - radius, enemy.y - radius);
      ctx.lineTo(enemy.x + radius, enemy.y + radius);
      ctx.moveTo(enemy.x + radius, enemy.y - radius);
      ctx.lineTo(enemy.x - radius, enemy.y + radius);
      ctx.stroke();
    }
    if (enemy.config.isElite || enemy.config.isBoss) {
      ctx.strokeStyle = enemy.config.isBoss ? "#f43f5e" : "#f59e0b";
      ctx.lineWidth = enemy.config.isBoss ? 5 : 4;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, radius + 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (enemy.hasStatus("slow") || enemy.hasStatus("freeze")) {
      ctx.strokeStyle = "#93ddf8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, radius + 9, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (enemy.hasStatus("poison")) {
      ctx.strokeStyle = "#a7f3a1";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, radius + 11, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (enemy.hasStatus("vulnerable") || enemy.hasStatus("weaken_attack")) {
      ctx.strokeStyle = "#f8d66d";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, radius + 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    const barWidth = enemy.config.isBoss ? 64 : 46;
    ctx.fillStyle = "rgba(39, 26, 23, 0.9)";
    ctx.fillRect(enemy.x - barWidth / 2, enemy.y - radius - 14, barWidth, 5);
    ctx.fillStyle = enemy.config.isBoss ? "#f43f5e" : enemy.config.isElite ? "#f97316" : "#e45d4f";
    ctx.fillRect(enemy.x - barWidth / 2, enemy.y - radius - 14, barWidth * Math.max(0, enemy.hp / enemy.maxHp), 5);
    ctx.restore();
  }

  function projectileStyle(projectile) {
    const styles = {
      flying_sword: { color: "#e7f6ef", glow: "rgba(220, 235, 214, 0.34)", width: 2 },
      sword_wave: { color: "#dcebd6", glow: "rgba(220, 235, 214, 0.3)", width: 4 },
      fire_talisman: { color: "#fb923c", glow: "rgba(249, 115, 22, 0.42)", width: 4 },
      frost_bolt: { color: "#93ddf8", glow: "rgba(147, 221, 248, 0.35)", width: 4 },
      poison_needle: { color: "#a7f3a1", glow: "rgba(132, 204, 22, 0.32)", width: 3 },
      thunder_arc: { color: "#d8b4fe", glow: "rgba(216, 180, 254, 0.44)", width: 4 },
      spear_arc: { color: "#facc5c", glow: "rgba(250, 204, 92, 0.32)", width: 4 },
      sound_wave: { color: "#f1d99a", glow: "rgba(244, 214, 141, 0.3)", width: 5 },
      shadow_blade: { color: "#c084fc", glow: "rgba(192, 132, 252, 0.38)", width: 4 },
      dao_light: { color: "#fff1a8", glow: "rgba(255, 241, 168, 0.36)", width: 6 },
      artifact_sword_projectile: { color: "#7dd3fc", glow: "rgba(125, 211, 252, 0.34)", width: 4 },
      artifact_blade_projectile: { color: "#fde68a", glow: "rgba(253, 230, 138, 0.32)", width: 4 },
      giant_sword_projectile: { color: "#fff7db", glow: "rgba(255, 247, 219, 0.46)", width: 7 },
    };
    return styles[projectile.type] || { color: projectile.color || "#ffffff", glow: projectile.trailColor || "rgba(255,255,255,0.24)", width: projectile.width || 3 };
  }

  function drawProjectile({ ctx, projectile }) {
    if (projectile.visualOnly) {
      ctx.save();
      ctx.shadowColor = projectile.color;
      ctx.shadowBlur = 8;
      ctx.strokeStyle = projectile.color;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(projectile.x, projectile.y);
      ctx.lineTo(projectile.tx, projectile.ty);
      ctx.stroke();
      ctx.restore();
      return;
    }
    const angle = Math.atan2(projectile.vy, projectile.vx);
    const style = projectileStyle(projectile);
    ctx.save();
    ctx.translate(projectile.x, projectile.y);
    ctx.rotate(angle);
    ctx.lineCap = "round";
    ctx.shadowColor = style.color;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = style.glow;
    ctx.lineWidth = Math.max(style.width + 6, projectile.width + 5);
    ctx.beginPath();
    ctx.moveTo(-projectile.length * 0.8, 0);
    ctx.lineTo(projectile.length * 0.35, 0);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.width;
    ctx.beginPath();
    ctx.moveTo(-projectile.length / 2, 0);
    ctx.lineTo(projectile.length / 2, 0);
    ctx.stroke();
    if (projectile.type === "fire_talisman") {
      ctx.fillStyle = "rgba(249, 115, 22, 0.65)";
      ctx.fillRect(-5, -5, 10, 10);
    } else if (projectile.type === "sound_wave") {
      ctx.strokeStyle = "rgba(244, 214, 141, 0.5)";
      for (let i = 0; i < 2; i += 1) {
        ctx.beginPath();
        ctx.arc(0, 0, 10 + i * 7, -0.8, 0.8);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawBossBar({ ctx, canvas, state }) {
    const boss = state.enemies.find((enemy) => enemy.config.isBoss && !enemy.dead);
    if (!boss) return;
    const x = 70;
    const y = 16;
    const w = canvas.width - 140;
    ctx.save();
    ctx.fillStyle = "rgba(8, 12, 14, 0.72)";
    ctx.fillRect(x, y, w, 24);
    ctx.strokeStyle = "rgba(216, 172, 82, 0.52)";
    ctx.strokeRect(x, y, w, 24);
    ctx.fillStyle = "#be123c";
    ctx.fillRect(x + 2, y + 15, (w - 4) * Math.max(0, boss.hp / boss.maxHp), 6);
    ctx.fillStyle = "#fff7df";
    ctx.font = "bold 14px Microsoft YaHei";
    ctx.textAlign = "center";
    ctx.fillText(boss.config.bossBarName || boss.config.name, canvas.width / 2, y + 13);
    ctx.restore();
  }

  Object.assign(window.XM.CanvasRender, {
    draw,
    drawBossBar,
    drawEnemy,
    drawFloater,
    drawFormationArea,
    drawFormationSlot,
    drawGrid,
    drawProjectile,
    drawRole,
    drawVisualEvent,
    drawZone,
  });
})();
