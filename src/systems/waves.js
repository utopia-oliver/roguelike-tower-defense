(() => {
  window.XM = window.XM || {};
  window.XM.Waves = window.XM.Waves || {};

  function call(callbacks, name, ...args) {
    const fn = callbacks?.[name];
    if (typeof fn !== "function") return undefined;
    return fn(...args);
  }

  function getWaveConfig({ DATA, waveNumber }) {
    return DATA.waves.find((item) => item.wave === waveNumber);
  }

  function createSpawnJob(segment) {
    return {
      ...segment,
      remaining: segment.count,
      nextSpawn: segment.startDelay,
    };
  }

  function isEnemyAlive(enemy) {
    const shared = window.XM.Enemies?.isEnemyTargetable;
    if (typeof shared === "function") return shared(enemy);
    return Boolean(
      enemy &&
        Number.isFinite(enemy.hp) &&
        enemy.hp > 0 &&
        !enemy.dead &&
        !enemy.isDead &&
        !enemy.markedForRemoval,
    );
  }

  function startWave({ state, DATA, waveNumber = state.wave, callbacks }) {
    const wave = getWaveConfig({ DATA, waveNumber });
    if (!wave) return false;
    state.wave = waveNumber;
    state.spawnJobs = wave.segments.map(createSpawnJob);
    state.waveActive = true;
    state.waveElapsed = 0;
    state.waveStallWarned = false;
    state.highestWave = Math.max(state.highestWave, state.wave);
    call(callbacks, "setStatus", `第 ${state.wave} 波：${wave.goal}`);
    return true;
  }

  function updateWaveSpawns({ state, dt, callbacks }) {
    state.waveElapsed = (state.waveElapsed || 0) + dt;
    state.spawnJobs.forEach((job) => {
      job.nextSpawn -= dt;
      while (job.remaining > 0 && job.nextSpawn <= 0) {
        const enemy = call(callbacks, "createEnemy", job.enemyId, job);
        if (enemy) call(callbacks, "addEnemy", enemy);
        job.remaining -= 1;
        job.nextSpawn += job.spawnInterval;
      }
    });
    maybeWarnStalledWave(state);
  }

  function isWaveComplete({ state }) {
    const allSpawned = state.spawnJobs.every((job) => job.remaining <= 0);
    return state.waveActive && allSpawned && !state.enemies.some(isEnemyAlive);
  }

  function maybeWarnStalledWave(state) {
    if (state.wave !== 6 || state.waveStallWarned || (state.waveElapsed || 0) < 60) return;
    const allSpawned = state.spawnJobs.every((job) => job.remaining <= 0);
    if (!state.waveActive || !allSpawned) return;
    state.waveStallWarned = true;
    console.warn("[Waves] wave 6 still active after 60s", {
      wave: state.wave,
      enemies: (state.enemies || []).map((enemy) => ({
        id: enemy.config?.id || enemy.id,
        name: enemy.config?.name || enemy.name,
        hp: enemy.hp,
        dead: enemy.dead,
        state: enemy.state,
        attackMode: enemy.attackMode,
        x: enemy.x,
        y: enemy.y,
        abilityTimer: enemy.abilityTimer,
        markedForRemoval: enemy.markedForRemoval,
      })),
      spawnJobs: state.spawnJobs,
    });
  }

  function advanceWave({ state, DATA, callbacks }) {
    if (!isWaveComplete({ state })) return false;
    if (state.wave >= DATA.config.maxWaves) {
      call(callbacks, "endGame", true);
      return true;
    }
    state.wave += 1;
    state.waveActive = false;
    call(callbacks, "setStatus", "本波已清除，下一波即将到来。");
    return true;
  }

  function jumpToWave({ state, waveNumber, callbacks }) {
    state.wave = waveNumber;
    state.waveActive = false;
    state.spawnJobs = [];
    call(callbacks, "clearEnemies");
    call(callbacks, "clearProjectiles");
    return true;
  }

  Object.assign(window.XM.Waves, {
    advanceWave,
    createSpawnJob,
    getWaveConfig,
    isWaveComplete,
    jumpToWave,
    startWave,
    updateWaveSpawns,
  });
})();
