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

  function createInitialRuntimeCollections() {
    return {
      availableRoles: [],
      deployedRoles: [],
      enemies: [],
      projectiles: [],
      floaters: [],
      zones: [],
      spawnJobs: [],
      bossKills: new Set(),
      acquiredPerks: new Set(),
      pendingLevelUps: 0,
    };
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
      selectedFormationId: "",
      selectedRoleId: "",
      selectedArtifactId: "",
      waveActive: false,
      martialArtLevels: {},
      martialArtBranches: createInitialMartialBranchState(),
      formationCooldown: 0,
      artifactCooldown: 0,
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

  function resetRuntimeCollections(state) {
    Object.assign(state, createInitialRuntimeCollections());
    return state;
  }

  function syncPlayerMetaAliases({ playerMeta, getMaxDeploySlots }) {
    if (!playerMeta) return playerMeta;
    playerMeta.level = playerMeta.playerLevel;
    playerMeta.lingstone = playerMeta.spiritStones;
    playerMeta.ownedRoles = playerMeta.ownedCharacters;
    playerMeta.unlockedCharacterIds = playerMeta.ownedCharacters;
    if (typeof getMaxDeploySlots === "function") {
      playerMeta.maxDeploySlots = getMaxDeploySlots(playerMeta.playerLevel);
    }
    return playerMeta;
  }

  Object.assign(window.XM.State, {
    createDefaultRunState,
    createInitialMartialBranchState,
    createInitialModifiers,
    createInitialRuntimeCollections,
    defaultRunBonuses,
    resetRuntimeCollections,
    syncPlayerMetaAliases,
  });
})();
