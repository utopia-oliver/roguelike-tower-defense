(() => {
  window.XM = window.XM || {};
  window.XM.State = window.XM.State || {};

  function defaultRunBonuses() {
    return {
      roleDamage: 1,
      roleAttackSpeed: 1,
      roleRangeAdd: 0,
      critChance: 0,
      critMult: 1.8,
      pierceAdd: 0,
      sideProjectiles: 0,
      multishot: 0,
      formationDamage: 1,
      formationCooldown: 1,
      formationRadiusAdd: 0,
      lingqiGain: 1,
      bossDamage: 1,
      slowVulnerability: 0,
      passiveMultiplier: 1,
      burnMultiplier: 1,
      controlMultiplier: 1,
      poisonDurationAdd: 0,
      poisonSpreadChanceAdd: 0,
      artifactDamage: 1,
      artifactCooldown: 1,
      horizontalBonus: 0,
      chainBonus: 0,
    };
  }

  function createInitialRuntimeCollections(options = {}) {
    const includeAvailableRoles = options.includeAvailableRoles !== false;
    const includeDeployedRoles = options.includeDeployedRoles !== false;
    const collections = {
      enemies: [],
      projectiles: [],
      visualEvents: [],
      floaters: [],
      zones: [],
      spawnJobs: [],
      bossKills: new Set(),
      acquiredPerks: new Set(),
      pendingLevelUps: 0,
    };
    if (includeAvailableRoles) collections.availableRoles = [];
    if (includeDeployedRoles) collections.deployedRoles = [];
    return collections;
  }

  function createInitialModifiers() {
    return {
      martialArt: {},
      character: {},
      artifact: {},
      projectileType: {},
      majorEvolution: {},
    };
  }

  function createInitialMartialBranchState() {
    return {};
  }

  function resetRunProgress(state, options = {}) {
    Object.assign(state, {
      wave: options.wave || 1,
      highestWave: options.highestWave || 1,
      runLevel: options.runLevel || 1,
      lingqi: options.lingqi || 0,
      kills: options.kills || 0,
      gameOver: false,
      running: Boolean(options.running),
      paused: false,
      waveActive: false,
    });
    return state;
  }

  function resetRunModifiers(state) {
    state.bonuses = defaultRunBonuses();
    state.modifiers = createInitialModifiers();
    return state;
  }

  function resetMartialBranchesForRun(state) {
    state.martialArtBranches = createInitialMartialBranchState();
    return state;
  }

  function createRunStatePatch(options = {}) {
    return {
      phase: options.phase || "combat",
      running: options.running !== false,
      paused: false,
      gameOver: false,
      wave: options.wave || 1,
      highestWave: options.highestWave || 1,
      runLevel: options.runLevel || 1,
      lingqi: options.lingqi || 0,
      kills: options.kills || 0,
      waveActive: false,
      formationCooldown: 0,
      artifactCooldown: 0,
      artifactCooldowns: {},
      artifactRuntime: {},
      artifactBondRuntime: {},
      martialArtBranches: createInitialMartialBranchState(),
      bonuses: defaultRunBonuses(),
      modifiers: createInitialModifiers(),
      ...createInitialRuntimeCollections({
        includeAvailableRoles: false,
        includeDeployedRoles: false,
      }),
    };
  }

  function resetRunStateForNewRun(state, options = {}) {
    Object.assign(state, createRunStatePatch(options));
    return state;
  }

  function createDefaultRunState(options = {}) {
    const arrayCore = options.arrayCore || {};
    return {
      appState: options.appState,
      phase: "lobby",
      running: false,
      paused: false,
      gameOver: false,
      wave: 1,
      highestWave: 1,
      arrayCoreMaxHp: arrayCore.arrayCoreMaxHp,
      arrayCoreHp: arrayCore.arrayCoreHp,
      arrayCoreDefense: arrayCore.arrayCoreDefense,
      arrayCoreDamageReduction: arrayCore.arrayCoreDamageReduction,
      baseHp: arrayCore.arrayCoreHp,
      maxBaseHp: arrayCore.arrayCoreMaxHp,
      runLevel: 1,
      lingqi: 0,
      kills: 0,
      loadoutFormationId: "",
      loadoutRoleIds: [],
      loadoutArtifactId: "",
      loadoutArtifactIds: [],
      selectedFormationId: "",
      selectedRoleId: "",
      selectedArtifactId: "",
      selectedArtifactIds: [],
      waveActive: false,
      martialArtLevels: {},
      martialArtBranches: createInitialMartialBranchState(),
      formationCooldown: 0,
      artifactCooldown: 0,
      artifactCooldowns: {},
      artifactRuntime: {},
      artifactBondRuntime: {},
      animationFrameRunning: false,
      frameCount: 0,
      lastError: "",
      lastTime: 0,
      status: options.status || "",
      bonuses: options.bonuses || defaultRunBonuses(),
      modifiers: createInitialModifiers(),
      ...createInitialRuntimeCollections(),
    };
  }

  function resetRuntimeCollections(state, options) {
    Object.assign(state, createInitialRuntimeCollections(options));
    return state;
  }

  function syncPlayerMetaAliases({ playerMeta, getMaxDeploySlots, getMaxArtifactSlots }) {
    if (!playerMeta) return playerMeta;
    playerMeta.level = playerMeta.playerLevel;
    playerMeta.lingstone = playerMeta.spiritStones;
    playerMeta.ownedRoles = playerMeta.ownedCharacters;
    playerMeta.unlockedCharacterIds = playerMeta.ownedCharacters;
    if (typeof getMaxDeploySlots === "function") {
      playerMeta.maxDeploySlots = getMaxDeploySlots(playerMeta.playerLevel);
    }
    if (typeof getMaxArtifactSlots === "function") {
      playerMeta.maxArtifactSlots = getMaxArtifactSlots(playerMeta.playerLevel);
    }
    return playerMeta;
  }

  Object.assign(window.XM.State, {
    createDefaultRunState,
    createInitialMartialBranchState,
    createInitialModifiers,
    createInitialRuntimeCollections,
    createRunStatePatch,
    defaultRunBonuses,
    resetMartialBranchesForRun,
    resetRunModifiers,
    resetRunProgress,
    resetRunStateForNewRun,
    resetRuntimeCollections,
    syncPlayerMetaAliases,
  });
})();
