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

  function startWave({ state, DATA, waveNumber = state.wave, callbacks }) {
    const wave = getWaveConfig({ DATA, waveNumber });
    if (!wave) return false;
    state.wave = waveNumber;
    state.spawnJobs = wave.segments.map(createSpawnJob);
    state.waveActive = true;
    state.highestWave = Math.max(state.highestWave, state.wave);
    call(callbacks, "setStatus", `第 ${state.wave} 波：${wave.goal}`);
    return true;
  }

  function updateWaveSpawns({ state, dt, callbacks }) {
    state.spawnJobs.forEach((job) => {
      job.nextSpawn -= dt;
      while (job.remaining > 0 && job.nextSpawn <= 0) {
        const enemy = call(callbacks, "createEnemy", job.enemyId, job);
        if (enemy) call(callbacks, "addEnemy", enemy);
        job.remaining -= 1;
        job.nextSpawn += job.spawnInterval;
      }
    });
  }

  function isWaveComplete({ state }) {
    const allSpawned = state.spawnJobs.every((job) => job.remaining <= 0);
    return state.waveActive && allSpawned && state.enemies.length === 0;
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
