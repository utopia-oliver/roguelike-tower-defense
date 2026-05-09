(() => {
  window.XM = window.XM || {};
  window.XM.Artifacts = window.XM.Artifacts || {};

  function call(callbacks, name, ...args) {
    const fn = callbacks?.[name];
    if (typeof fn !== "function") return undefined;
    return fn(...args);
  }

  function getScopedModifier({ state, bucket, id }) {
    state.modifiers = state.modifiers || { martialArt: {}, character: {}, artifact: {}, projectileType: {}, majorEvolution: {} };
    state.modifiers[bucket] = state.modifiers[bucket] || {};
    state.modifiers[bucket][id] = state.modifiers[bucket][id] || {};
    return state.modifiers[bucket][id];
  }

  function getArtifactConfig({ DATA, artifactId }) {
    return DATA.artifacts[artifactId];
  }

  function getArtifactModifier({ state, artifactId }) {
    const modifier = getScopedModifier({ state, bucket: "artifact", id: artifactId });
    modifier.damageMultiplier = modifier.damageMultiplier || 1;
    modifier.cooldownMultiplier = modifier.cooldownMultiplier || 1;
    modifier.extraCast = modifier.extraCast || 0;
    modifier.pierceAdd = modifier.pierceAdd || 0;
    return modifier;
  }

  function getArtifactRuntimeState({ state, artifactId }) {
    if (!artifactId) return null;
    return {
      artifactId,
      cooldown: state.artifactCooldown || 0,
      modifier: getArtifactModifier({ state, artifactId }),
    };
  }

  function applyArtifactModifierToParams(params, modifier) {
    return {
      ...params,
      damage: params.damage * (modifier.damageMultiplier || 1),
      cooldown: Math.max(2, params.cooldown * (modifier.cooldownMultiplier || 1)),
    };
  }

  function updateArtifact({ state, DATA, dt, artifactId = state.selectedArtifactId, callbacks, helpers = {} }) {
    const artifact = getArtifactConfig({ DATA, artifactId });
    if (!artifact) return false;
    const artifactModifier = getArtifactModifier({ state, artifactId });
    state.artifactCooldown -= dt;
    if (state.artifactCooldown > 0) return false;

    const targetLimit = helpers.targetLimit || 3;
    const targets = state.enemies
      .filter((enemy) => !enemy.dead)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, targetLimit);
    if (!targets.length) return false;

    const origin = call(callbacks, "getArtifactOrigin") || { x: 0, y: 0 };
    const params = applyArtifactModifierToParams(
      {
        damage: artifact.damage,
        cooldown: artifact.cooldown,
      },
      artifactModifier,
    );

    targets.forEach((enemy) => {
      call(callbacks, "damageEnemy", enemy, params.damage, "artifact");
      call(callbacks, "drawShot", origin.x, origin.y, enemy.x, enemy.y, "#f6d365");
    });
    call(callbacks, "addFloater", {
      x: origin.x,
      y: origin.y - 18,
      text: artifact.name.slice(0, 4),
      ttl: 0.7,
      color: "#f6d365",
    });
    state.artifactCooldown = params.cooldown;
    return true;
  }

  function updateArtifacts(options) {
    return updateArtifact(options);
  }

  Object.assign(window.XM.Artifacts, {
    applyArtifactModifierToParams,
    getArtifactConfig,
    getArtifactModifier,
    getArtifactRuntimeState,
    updateArtifact,
    updateArtifacts,
  });
})();
