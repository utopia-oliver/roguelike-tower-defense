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

  function drawEnemy({ ctx, colors, enemy }) {
    ctx.fillStyle = colors[enemy.config.id] || "#a3a3a3";
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();
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
    ctx.lineWidth = projectile.width + 5;
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
    drawZone,
  });
})();
