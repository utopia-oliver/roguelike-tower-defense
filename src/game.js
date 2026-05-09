const DATA = window.GAME_DATA;

window.__TEST_ERRORS__ = window.__TEST_ERRORS__ || [];
window.addEventListener("error", (event) => {
  window.__TEST_ERRORS__.push(event.message || String(event.error));
});
window.addEventListener("unhandledrejection", (event) => {
  window.__TEST_ERRORS__.push(event.reason && event.reason.message ? event.reason.message : String(event.reason));
});

const lobbyView = document.querySelector("#lobbyView");
const loadoutView = document.querySelector("#loadoutView");
const battleView = document.querySelector("#battleView");
const settlementView = document.querySelector("#settlementView");
const goLoadoutButton = document.querySelector("#goLoadoutButton");
const enterDeployButton = document.querySelector("#enterDeployButton");
const returnLobbyButton = document.querySelector("#returnLobbyButton");
const metaLevel = document.querySelector("#metaLevel");
const metaLingstone = document.querySelector("#metaLingstone");
const ownedRolesList = document.querySelector("#ownedRolesList");
const ownedArtifactsList = document.querySelector("#ownedArtifactsList");
const unlockedFormationsList = document.querySelector("#unlockedFormationsList");
const roleUpgradeButton = document.querySelector("#roleUpgradeButton");
const gachaButton = document.querySelector("#gachaButton");
const loadoutFormationList = document.querySelector("#loadoutFormationList");
const loadoutRoleList = document.querySelector("#loadoutRoleList");
const loadoutArtifactList = document.querySelector("#loadoutArtifactList");
const loadoutStatus = document.querySelector("#loadoutStatus");
const settlementTitle = document.querySelector("#settlementTitle");
const settlementWave = document.querySelector("#settlementWave");
const settlementKills = document.querySelector("#settlementKills");
const settlementLingstone = document.querySelector("#settlementLingstone");
const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
const waveText = document.querySelector("#waveText");
const hpText = document.querySelector("#hpText");
const lingqiText = document.querySelector("#lingqiText");
const startButton = document.querySelector("#startButton");
const formationList = document.querySelector("#formationList");
const roleList = document.querySelector("#roleList");
const artifactList = document.querySelector("#artifactList");
const deployHint = document.querySelector("#deployHint");
const runStatus = document.querySelector("#runStatus");
const perkModal = document.querySelector("#perkModal");
const perkGrid = document.querySelector("#perkGrid");
const debugPanel = document.querySelector("#debugPanel");
const debugToggle = document.querySelector("#debugToggle");
const debugClose = document.querySelector("#debugClose");
const debugTabs = document.querySelector("#debugTabs");
const debugActionsPanel = document.querySelector("#debugActions");
const debugContent = document.querySelector("#debugContent");

const {
  APP_STATE,
  ENEMY_STATE,
  colors,
  rarityWeight,
  CHARACTER_RARITY,
  GACHA_COST,
  DUPLICATE_GACHA_REFUND,
  DEBUG_TABS,
} = window.XM.Constants;

const PLAYER_LEVEL_UNLOCKS = DATA.playerLevelUnlocks || [];
const DEPLOY_SLOT_UNLOCKS = DATA.deploySlotUnlocks || [];
const { distance, distancePointToSegment } = window.XM.Math;
const {
  checkProjectileCollision: checkSystemProjectileCollision,
  checkProjectileHitEnemy: checkSystemProjectileHitEnemy,
  createRoleProjectiles: createSystemRoleProjectiles,
  fireProjectileAttack: fireSystemProjectileAttack,
  getPredictedTargetPosition,
  projectileDefaults,
  projectileSpreadAngles,
  updateProjectiles: updateSystemProjectiles,
} = window.XM.Projectiles;
const {
  applyQingyaBranchBonuses: applySystemQingyaBranchBonuses,
  getMartialArtLevelForRole: getSystemMartialArtLevelForRole,
  getMartialArtModifier: getSystemMartialArtModifier,
  getMartialBranchState: getSystemMartialBranchState,
  getScopedModifier: getSystemScopedModifier,
  hasMartialBranchUpgrade: hasSystemMartialBranchUpgrade,
  martialArtForCharacter: getSystemMartialArtForCharacter,
  martialBonuses: getSystemMartialBonuses,
  martialLevelEffects: getSystemMartialLevelEffects,
  qingyaAttackParamsFromBranches: getSystemQingyaAttackParamsFromBranches,
} = window.XM.MartialArts;
const {
  artifactPerksForRun: getSystemArtifactPerksForRun,
  createMartialArtPerk: createSystemMartialArtPerk,
  createQingyaBranchPerk: createSystemQingyaBranchPerk,
  createQingyaBranchPerks: createSystemQingyaBranchPerks,
  currentMartialArtUpgradePerks: getSystemCurrentMartialArtUpgradePerks,
  currentRunCharacters: getSystemCurrentRunCharacters,
  currentTargetedMartialPerks: getSystemCurrentTargetedMartialPerks,
  currentTrajectoryPerks: getSystemCurrentTrajectoryPerks,
  dedupePerks: dedupeSystemPerks,
  defensivePerksForRun: getSystemDefensivePerksForRun,
  drawPerks: drawSystemPerks,
  drawPerksFiltered: drawSystemPerksFiltered,
  fillWithGenericPerks: fillWithSystemGenericPerks,
  getDisabledPerkReason: getSystemDisabledPerkReason,
  getDisabledUpgradeReason: getSystemDisabledUpgradeReason,
  getPerkInvalidReason: getSystemPerkInvalidReason,
  getPerkTargetId: getSystemPerkTargetId,
  getQingyaUpgradeInvalidReason: getSystemQingyaUpgradeInvalidReason,
  hasExplicitPerkTarget: hasSystemExplicitPerkTarget,
  hasForbiddenGenericText: hasSystemForbiddenGenericText,
  isPerkValidForCurrentRun: isSystemPerkValidForCurrentRun,
  normalizePerk: normalizeSystemPerk,
  perkEffectKey: getSystemPerkEffectKey,
  perkSpecificity: getSystemPerkSpecificity,
  perkUpgradeWeight: getSystemPerkUpgradeWeight,
  qingyaBranchUpgradeAvailable: isSystemQingyaBranchUpgradeAvailable,
  selectedArtifactIds: getSystemSelectedArtifactIds,
} = window.XM.Upgrades;
const {
  createEnemy: createSystemEnemy,
  updateEnemies: updateSystemEnemies,
} = window.XM.Enemies;
const {
  advanceWave: advanceSystemWave,
  jumpToWave: jumpToSystemWave,
  startWave: startSystemWave,
  updateWaveSpawns: updateSystemWaveSpawns,
} = window.XM.Waves;
const {
  getArtifactModifier: getSystemArtifactModifier,
  updateArtifacts: updateSystemArtifacts,
} = window.XM.Artifacts;
const {
  areaDamage: areaDamageSystem,
  baseArrayCoreDefense: getSystemBaseArrayCoreDefense,
  baseArrayCoreMaxHp: getSystemBaseArrayCoreMaxHp,
  damageArrayCore: damageSystemArrayCore,
  healArrayCoreFull: healSystemArrayCoreFull,
  initialArrayCoreState: getSystemInitialArrayCoreState,
  initializeArrayCoreForRun: initializeSystemArrayCoreForRun,
  syncBaseHpAliases: syncSystemBaseHpAliases,
  updateFormation: updateSystemFormation,
} = window.XM.Formations;
const {
  applyPlayerLevelUnlocks: applySystemPlayerLevelUnlocks,
  cellCenter: getSystemCellCenter,
  checkPlayerLevelUp: checkSystemPlayerLevelUp,
  chooseTarget: chooseSystemTarget,
  deployRole: deploySystemRole,
  drawGachaRarity: drawSystemGachaRarity,
  fireRole: fireSystemRole,
  getCharacterBaseFinalDamage: getSystemCharacterBaseFinalDamage,
  getCharacterLevel: getSystemCharacterLevel,
  getCharacterUpgradeCost: getSystemCharacterUpgradeCost,
  getFlatDamageGrowthByRarity: getSystemFlatDamageGrowthByRarity,
  getMaxDeploySlots: getSystemMaxDeploySlots,
  getNextCharacterUnlock: getSystemNextCharacterUnlock,
  getNextDeploySlotUnlock: getSystemNextDeploySlotUnlock,
  getPercentGrowthByRarity: getSystemPercentGrowthByRarity,
  getPlayerLevelExpRequirement: getSystemPlayerLevelExpRequirement,
  grantCharacter: grantSystemCharacter,
  isDeployable: isSystemDeployable,
  performGacha: performSystemGacha,
  roleAt: getSystemRoleAt,
  roleStats: getSystemRoleStats,
  updateRole: updateSystemRole,
  upgradeCharacter: upgradeSystemCharacter,
} = window.XM.Characters;
const {
  createDefaultPlayerProfile: createStoredDefaultPlayerProfile,
  createEmptyDebugOverrides,
  deepClone,
  loadDebugOverrides,
  loadPlayerProfile: loadStoredPlayerProfile,
  mergeObject,
  normalizeDebugOverrides,
  normalizePlayerProfile: normalizeStoredPlayerProfile,
  resetDebugData: resetStoredDebugData,
  resetPlayerProfile: resetStoredPlayerProfile,
  saveDebugData: saveStoredDebugData,
  savePlayerProfile: saveStoredPlayerProfile,
} = window.XM.Storage;
const {
  createDefaultRunState: createSystemDefaultRunState,
  createInitialMartialBranchState,
  createInitialModifiers,
  createInitialRuntimeCollections,
  defaultRunBonuses: createSystemDefaultRunBonuses,
  resetRunStateForNewRun,
  syncPlayerMetaAliases: syncSystemPlayerMetaAliases,
} = window.XM.State;
let activeDebugTab = "状态";
let debugEditMode = false;
let debugExportOpen = false;
let debugContentDirty = true;
let debugTabsRenderKey = "";
let debugActionsRenderKey = "";
let debugNoticeText = "";
let debugValidationErrors = new Map();
const DEFAULT_GAME_DATA = deepClone(DATA);
let DEFAULT_QINGYA_BRANCH_UPGRADES = [];
let debugOverrides = loadDebugOverrides();

const GENERIC_PERKS = [
  {
    id: "generic_role_damage_15",
    name: "灵力灌注",
    rarity: "普通",
    scope: "global",
    description: "当前武学伤害提升。",
    valueText: "武学伤害提升",
    stackable: true,
    effect: { type: "role_damage_mult", value: 0.15 },
  },
  {
    id: "generic_attack_speed_10",
    name: "周天急转",
    rarity: "普通",
    scope: "global",
    description: "当前武学攻击间隔降低。",
    valueText: "武学攻速提升",
    stackable: true,
    effect: { type: "role_attack_speed", value: 0.1 },
  },
  {
    id: "generic_array_hp_30",
    name: "阵纹加固",
    rarity: "普通",
    scope: "array_core",
    description: "护山阵眼最大生命 +30，并恢复30生命。",
    valueText: "阵眼生命+30",
    stackable: true,
    effect: { type: "array_hp_bonus", value: 30 },
  },
  {
    id: "generic_array_defense_2",
    name: "玄岳守势",
    rarity: "普通",
    scope: "array_core",
    description: "护山阵眼防御 +2。",
    valueText: "防御+2",
    stackable: true,
    effect: { type: "array_defense_bonus", value: 2 },
  },
  {
    id: "generic_focus_lowest",
    name: "点化弟子",
    rarity: "普通",
    scope: "character",
    description: "当前最低等级角色伤害 +20%。",
    valueText: "最低等级角色伤害+20%",
    stackable: true,
    effect: { type: "lowest_character_damage", value: 0.2 },
  },
  {
    id: "qingya_giant_damage",
    name: "青崖巨阙·剑威",
    type: "major_enhance",
    requires: ["qingya_major_giant_sword"],
    description: "巨型飞剑伤害提升30%。",
    valueText: "巨剑伤害 +30%",
    effects: { giantSwordDamageMultAdd: 0.3 },
  },
  {
    id: "qingya_giant_elite",
    name: "青崖巨阙·破阵",
    type: "major_enhance",
    requires: ["qingya_major_giant_sword"],
    description: "巨型飞剑对精英和Boss的额外伤害提升30%。",
    valueText: "精英/Boss额外伤害 +30%",
    effects: { giantSwordEliteDamageMultAdd: 0.3 },
  },
  {
    id: "qingya_giant_splash",
    name: "青崖巨阙·裂山",
    type: "major_enhance",
    requires: ["qingya_major_giant_sword"],
    description: "巨型飞剑溅射范围提升25%。",
    valueText: "巨剑溅射范围 +25%",
    effects: { giantSwordSplashRadiusMult: 1.25 },
  },
  {
    id: "qingya_giant_speed",
    name: "青崖巨阙·御空",
    type: "major_enhance",
    requires: ["qingya_major_giant_sword"],
    description: "巨型飞剑飞行速度提升20%。",
    valueText: "巨剑速度 +20%",
    effects: { giantSwordSpeedMult: 1.2 },
  },
];

const grid = {
  columns: DATA.config.columns,
  rows: DATA.config.rows,
  get cellW() {
    return canvas.width / this.columns;
  },
  get cellH() {
    return canvas.height / this.rows;
  },
};

const state = {};

const DEFAULT_ARRAY_CORE_MAX_HP = 150;
const DEFAULT_ARRAY_CORE_DEFENSE = 0;

const playerMeta = {
  playerLevel: 1,
  playerExp: 0,
  spiritStones: 0,
  highestWave: 0,
  totalKills: 0,
  level: 1,
  lingstone: 0,
  ownedCharacters: [...DATA.initial.roles],
  unlockedCharacterIds: [...DATA.initial.roles],
  ownedRoles: [...DATA.initial.roles],
  characterLevels: Object.fromEntries(DATA.initial.roles.map((id) => [id, 1])),
  maxDeploySlots: 1,
  ownedArtifacts: [DATA.initial.artifact],
  artifactLevels: {},
  unlockedFormations: [DATA.initial.formation],
  formationLevels: {},
  arrayCoreLevel: 1,
  arrayCoreBaseHpBonus: 0,
  arrayCoreDefenseBonus: 0,
};
let playerProfileLoadedFromStorage = false;
let playerProfileSaveSuppressed = false;

function defaultRunBonuses() {
  return createSystemDefaultRunBonuses();
}

function syncPlayerMetaAliases() {
  return syncSystemPlayerMetaAliases({
    playerMeta,
    getMaxDeploySlots,
  });
}

function getPlayerLevelExpRequirement(level) {
  return getSystemPlayerLevelExpRequirement(level);
}

function getMaxDeploySlots(level = playerMeta.playerLevel) {
  return getSystemMaxDeploySlots({ level, deploySlotUnlocks: DEPLOY_SLOT_UNLOCKS });
}

function playerProfileStorageHelpers() {
  return {
    initialRoles: DATA.initial.roles,
    initialArtifact: DATA.initial.artifact,
    initialFormation: DATA.initial.formation,
    roles: DATA.roles,
    artifacts: DATA.artifacts,
    formations: DATA.formations,
    getMaxDeploySlots,
  };
}

function createDefaultPlayerProfile() {
  return createStoredDefaultPlayerProfile(playerProfileStorageHelpers());
}

function normalizePlayerProfile(profile) {
  return normalizeStoredPlayerProfile(profile, playerProfileStorageHelpers());
}

function loadPlayerProfile() {
  const result = loadStoredPlayerProfile(playerProfileStorageHelpers());
  playerProfileLoadedFromStorage = result.loadedFromStorage;
  return result.profile;
}

function applyPlayerProfile(profile) {
  Object.assign(playerMeta, normalizePlayerProfile(profile));
  syncPlayerMetaAliases();
}

function savePlayerProfile() {
  if (playerProfileSaveSuppressed) return false;
  const result = saveStoredPlayerProfile(playerMeta, playerProfileStorageHelpers());
  Object.assign(playerMeta, result.profile);
  syncPlayerMetaAliases();
  return result.saved;
}

function getNextCharacterUnlock() {
  return getSystemNextCharacterUnlock({
    playerProfile: playerMeta,
    playerLevelUnlocks: PLAYER_LEVEL_UNLOCKS,
  });
}

function getNextDeploySlotUnlock() {
  return getSystemNextDeploySlotUnlock({
    playerProfile: playerMeta,
    deploySlotUnlocks: DEPLOY_SLOT_UNLOCKS,
  });
}

function grantCharacter(characterId, source = "unlock") {
  const result = grantSystemCharacter({
    playerProfile: playerMeta,
    DATA,
    characterId,
    source,
    duplicateRefund: DUPLICATE_GACHA_REFUND,
    callbacks: {
      savePlayerProfile,
      syncPlayerMetaAliases,
    },
  });
  return Boolean(result.isNew);
}

function applyPlayerLevelUnlocks() {
  return applySystemPlayerLevelUnlocks({
    playerProfile: playerMeta,
    DATA,
    playerLevelUnlocks: PLAYER_LEVEL_UNLOCKS,
    deploySlotUnlocks: DEPLOY_SLOT_UNLOCKS,
    callbacks: {
      savePlayerProfile,
      syncPlayerMetaAliases,
    },
  });
}

function checkPlayerLevelUp() {
  return checkSystemPlayerLevelUp({
    playerProfile: playerMeta,
    DATA,
    playerLevelUnlocks: PLAYER_LEVEL_UNLOCKS,
    deploySlotUnlocks: DEPLOY_SLOT_UNLOCKS,
    callbacks: {
      savePlayerProfile,
      syncPlayerMetaAliases,
    },
  });
}

function getCharacterLevel(characterId) {
  return getSystemCharacterLevel({ playerProfile: playerMeta, characterId });
}

function getFlatDamageGrowthByRarity(rarity) {
  return getSystemFlatDamageGrowthByRarity({ rarity, characterRarity: CHARACTER_RARITY });
}

function getPercentGrowthByRarity(rarity) {
  return getSystemPercentGrowthByRarity({ rarity, characterRarity: CHARACTER_RARITY });
}

function getCharacterBaseFinalDamage(character) {
  return getSystemCharacterBaseFinalDamage({
    playerProfile: playerMeta,
    character,
    characterRarity: CHARACTER_RARITY,
  });
}

function getCharacterUpgradeCost(characterLevel, rarity) {
  return getSystemCharacterUpgradeCost({ characterLevel, rarity });
}

function upgradeCharacter(characterId) {
  const result = upgradeSystemCharacter({
    playerProfile: playerMeta,
    DATA,
    characterId,
    callbacks: {
      savePlayerProfile,
      syncPlayerMetaAliases,
    },
  });
  if (!result.ok) {
    if (result.reason === "not_enough_spirit_stones") {
      setStatus(`灵石不足，${result.character.name} 升级需要 ${result.cost} 灵石。`);
    }
    return false;
  }
  setStatus(`${result.character.name} 提升到 ${result.newLevel} 级，战斗伤害提高。`);
  renderLobby();
  return true;
}

function drawGachaRarity() {
  return drawSystemGachaRarity({ characterRarity: CHARACTER_RARITY });
}

function performGacha() {
  const result = performSystemGacha({
    playerProfile: playerMeta,
    DATA,
    gachaCost: GACHA_COST,
    duplicateRefund: DUPLICATE_GACHA_REFUND,
    characterRarity: CHARACTER_RARITY,
    callbacks: {
      savePlayerProfile,
      syncPlayerMetaAliases,
    },
  });
  if (!result.ok) {
    if (result.reason === "not_enough_spirit_stones") {
      setStatus(`灵石不足，抽卡需要 ${GACHA_COST} 灵石。`);
    }
    return;
  }
  syncPlayerMetaAliases();
  renderLobby();
  renderLoadout();
  setStatus(
    result.isNew
      ? `抽卡获得 ${result.character.rarity} ${result.character.name}。`
      : `抽到重复角色 ${result.character.rarity} ${result.character.name}，返还${DUPLICATE_GACHA_REFUND}灵石。`,
  );
}

function baseArrayCoreMaxHp() {
  return getSystemBaseArrayCoreMaxHp({
    DATA,
    defaults: { maxHp: DEFAULT_ARRAY_CORE_MAX_HP },
  });
}

function baseArrayCoreDefense() {
  return getSystemBaseArrayCoreDefense({
    DATA,
    defaults: { defense: DEFAULT_ARRAY_CORE_DEFENSE },
  });
}

function initialArrayCoreState() {
  return getSystemInitialArrayCoreState({
    DATA,
    playerProfile: playerMeta,
    defaults: {
      maxHp: DEFAULT_ARRAY_CORE_MAX_HP,
      defense: DEFAULT_ARRAY_CORE_DEFENSE,
    },
  });
}

function initializeArrayCoreForRun() {
  return initializeSystemArrayCoreForRun({
    state,
    DATA,
    playerProfile: playerMeta,
    defaults: {
      maxHp: DEFAULT_ARRAY_CORE_MAX_HP,
      defense: DEFAULT_ARRAY_CORE_DEFENSE,
    },
  });
}

function syncBaseHpAliases() {
  return syncSystemBaseHpAliases({ state });
}

function resetGame() {
  applyPlayerLevelUnlocks();
  syncPlayerMetaAliases();
  const arrayCore = initialArrayCoreState();
  Object.assign(state, {
    appState: APP_STATE.LOBBY,
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
    ...createInitialRuntimeCollections(),
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
    status: "山门待命。先在外部系统进入战前配置。",
    bonuses: defaultRunBonuses(),
    modifiers: createInitialModifiers(),
  });
  perkModal.classList.add("hidden");
  window.__SHOUSHANMEN_DEBUG__ = getDebugSnapshot;
  window.__SHOUSHANMEN_ACTIONS__ = getDebugActions();
  renderLobby();
  renderLoadout();
  renderSetupLists();
  updateUi();
}

function getDebugActions() {
  return {
    enterLoadout: () => enterLoadout(),
    selectLoadout: () => {
      state.loadoutFormationId = playerMeta.unlockedFormations[0];
      state.loadoutRoleIds = playerMeta.ownedCharacters.slice(0, playerMeta.maxDeploySlots);
      state.loadoutArtifactId = playerMeta.ownedArtifacts[0];
      renderLoadout();
      return getDebugSnapshot();
    },
    enterDeploy: () => enterDeploy(),
    deployRole: (roleIndex, col, row) => {
      const roleId = state.availableRoles[roleIndex] || state.loadoutRoleIds[roleIndex];
      if (roleId) state.selectedRoleId = roleId;
      deployRole(col, row);
      return getDebugSnapshot();
    },
    startBattle: () => {
      startRun();
      return getDebugSnapshot();
    },
    grantLingqi: (amount) => {
      gainLingqi(amount);
      updateUi();
      return getDebugSnapshot();
    },
    grantPlayerExp: (amount) => {
      playerMeta.playerExp += amount;
      const rewards = checkPlayerLevelUp();
      savePlayerProfile();
      renderLobby();
      updateUi();
      return { rewards, snapshot: getDebugSnapshot() };
    },
    grantSpiritStones: (amount) => {
      playerMeta.spiritStones += amount;
      syncPlayerMetaAliases();
      savePlayerProfile();
      renderLobby();
      updateUi();
      return getDebugSnapshot();
    },
    gachaOnce: () => {
      performGacha();
      return getDebugSnapshot();
    },
    upgradeFirstCharacter: () => {
      const first = playerMeta.ownedCharacters[0];
      if (first) upgradeCharacter(first);
      return getDebugSnapshot();
    },
    chooseFirstPerk: () => {
      const first = perkGrid.querySelector(".perk-card");
      if (first) first.click();
      return getDebugSnapshot();
    },
    forceEnemyAtAttackLine: () => {
      const enemy = createEnemy("enemy_armor_beast");
      enemy.hp = 9999;
      enemy.maxHp = 9999;
      state.enemies.unshift(enemy);
      enemy.y = attackLineY();
      enemy.progress = 0.95;
      enemy.enterAttackMode();
      updateUi();
      return getDebugSnapshot();
    },
    snapshot: () => getDebugSnapshot(),
  };
}

function showView(view) {
  [lobbyView, loadoutView, battleView, settlementView].forEach((item) => {
    item.classList.toggle("hidden", item !== view);
  });
}

function enterLoadout() {
  applyPlayerLevelUnlocks();
  state.loadoutRoleIds = state.loadoutRoleIds
    .filter((id) => playerMeta.ownedCharacters.includes(id))
    .slice(0, playerMeta.maxDeploySlots);
  state.appState = APP_STATE.LOADOUT;
  state.phase = "loadout";
  setStatus("选择本局阵法、出战角色和法宝。");
  renderLoadout();
  updateUi();
}

function loadoutReady() {
  return (
    Boolean(state.loadoutFormationId) &&
    state.loadoutRoleIds.length > 0 &&
    state.loadoutRoleIds.length <= playerMeta.maxDeploySlots &&
    Boolean(state.loadoutArtifactId)
  );
}

function enterDeploy() {
  if (!loadoutReady()) {
    setStatus("战前配置未完成：需要 1 个阵法、1-3 名角色、1 个法宝。");
    renderLoadout();
    return;
  }
  state.appState = APP_STATE.DEPLOY;
    state.phase = "deploy";
  initializeArrayCoreForRun();
  state.selectedFormationId = state.loadoutFormationId;
  state.selectedArtifactId = state.loadoutArtifactId;
  state.availableRoles = state.loadoutRoleIds
    .filter((id) => playerMeta.ownedCharacters.includes(id))
    .slice(0, playerMeta.maxDeploySlots);
  state.selectedRoleId = state.availableRoles[0] || "";
  state.deployedRoles = [];
  setStatus("布阵阶段：只能把已选择角色部署在最底部 5 个护山大阵 / 护山阵眼格。");
  renderSetupLists();
  updateUi();
}

function nextLevelRequirement(level = state.runLevel) {
  const next = DATA.levels.find((item) => item.level === level + 1);
  return next ? next.requiredLingqi : Infinity;
}

function isDeployable(col, row) {
  return isSystemDeployable({ grid, col, row });
}

function attackLineY() {
  return (grid.rows - 1) * grid.cellH - 8;
}

function cellCenter(col, row) {
  return getSystemCellCenter({ grid, col, row });
}

function roleAt(col, row) {
  return getSystemRoleAt({ state, col, row });
}

function deployRole(col, row) {
  return deploySystemRole({
    state,
    DATA,
    playerProfile: playerMeta,
    grid,
    col,
    row,
    appState: state.appState,
    deployState: APP_STATE.DEPLOY,
    lobbyState: APP_STATE.LOBBY,
    callbacks: {
      makeId,
      renderSetupLists,
      setStatus,
      updateUi,
    },
  });
}

function setStatus(text) {
  state.status = text;
  runStatus.textContent = text;
}

function startRun() {
  if (state.appState !== APP_STATE.DEPLOY) {
    setStatus("请先完成战前配置并进入布阵。");
    return;
  }
  if (state.deployedRoles.length !== state.availableRoles.length) {
    setStatus("请先部署所有出战宗门角色，再开始战斗。");
    return;
  }
  resetRunStateForNewRun(state, {
    phase: "combat",
    running: true,
  });
  state.appState = APP_STATE.BATTLE;
  startButton.disabled = true;
  setStatus("妖潮来袭，角色和法宝自动攻击；阵法会在敌人靠近阵眼时触发。");
  renderSetupLists();
  updateUi();
}

function startWave() {
  return startSystemWave({
    state,
    DATA,
    waveNumber: state.wave,
    callbacks: {
      setStatus,
    },
  });
}
function createEnemyContext() {
  return {
    DATA,
    state,
    grid,
    attackLineY,
    callbacks: {
      addFloater(floater) {
        state.floaters.push(floater);
      },
      damageArrayCore,
      gainLingqi,
      makeId,
      nearestEnemies,
      setStatus,
      spawnEnemy(enemyId) {
        state.enemies.push(createEnemy(enemyId));
      },
    },
    helpers: {
      distance,
    },
  };
}

function createEnemy(enemyId) {
  return createSystemEnemy({
    enemyId,
    context: createEnemyContext(),
  });
}

function updateEnemies(dt) {
  return updateSystemEnemies({
    enemies: state.enemies,
    deltaTime: dt,
  });
}

function updateWaveSpawns(dt) {
  return updateSystemWaveSpawns({
    state,
    DATA,
    dt,
    callbacks: {
      createEnemy,
      addEnemy(enemy) {
        state.enemies.push(enemy);
      },
    },
  });
}

function advanceWave() {
  return advanceSystemWave({
    state,
    DATA,
    callbacks: {
      endGame,
      setStatus,
    },
  });
}

function gainLingqi(amount) {
  state.lingqi += amount * state.bonuses.lingqiGain;
  let projectedLevel = state.runLevel + state.pendingLevelUps;
  while (state.lingqi >= nextLevelRequirement(projectedLevel) && nextLevelRequirement(projectedLevel) < Infinity) {
    state.pendingLevelUps += 1;
    projectedLevel += 1;
  }
  if (state.appState === APP_STATE.BATTLE && state.pendingLevelUps > 0) {
    enterLevelUpReward();
  }
}

function enterLevelUpReward() {
  state.appState = APP_STATE.LEVEL_UP_REWARD;
  state.running = false;
  state.paused = true;
  state.runLevel += 1;
  state.pendingLevelUps = Math.max(0, state.pendingLevelUps - 1);
  showPerkChoices();
  updateUi();
}

function martialArtForCharacter(characterId) {
  return getSystemMartialArtForCharacter({ data: DATA, characterId });
}

function getScopedModifier(bucket, id) {
  return getSystemScopedModifier({ state, bucket, id });
}

function getMartialArtModifier(artId) {
  return getSystemMartialArtModifier({ state, martialArtId: artId });
}

function getArtifactModifier(artifactId) {
  return getSystemArtifactModifier({ state, artifactId });
}

function getPerkTargetId(perk) {
  return getSystemPerkTargetId(perk);
}

function hasExplicitPerkTarget(perk) {
  return hasSystemExplicitPerkTarget(perk);
}

function getDisabledUpgradeReason(upgrade) {
  return getSystemDisabledUpgradeReason(upgrade);
}

function getDisabledPerkReason(perk) {
  return getSystemDisabledPerkReason({ perk, upgrades: QINGYA_BRANCH_UPGRADES });
}

function getMartialArtLevelForRole(roleId) {
  return getSystemMartialArtLevelForRole({ state, data: DATA, roleId });
}

function martialLevelEffects(roleId) {
  return getSystemMartialLevelEffects({ state, data: DATA, roleId });
}

const QINGYA_BRANCH_UPGRADES = [
  {
    id: "qingya_projectile_1",
    name: "青崖剑诀·剑气分光 I",
    type: "normal",
    description: "每波剑气弹道数量+1。",
    valueText: "projectileCount +1",
    effects: { projectileAdd: 1 },
  },
  {
    id: "qingya_projectile_2",
    name: "青崖剑诀·剑气分光 II",
    type: "normal",
    requires: ["qingya_projectile_1"],
    description: "每波剑气弹道数量再+1。",
    valueText: "projectileCount +1",
    effects: { projectileAdd: 1 },
  },
  {
    id: "qingya_projectile_3",
    name: "青崖剑诀·剑气分光 III",
    type: "normal",
    requires: ["qingya_projectile_2"],
    description: "每波剑气弹道数量再+1，最多形成更宽的剑气覆盖。",
    valueText: "projectileCount +1",
    effects: { projectileAdd: 1 },
  },
  {
    id: "qingya_volley_1",
    name: "青崖剑诀·连潮剑势 I",
    type: "normal",
    description: "一次攻击连续多发射1波剑气。",
    valueText: "volleyCount +1",
    effects: { volleyAdd: 1 },
  },
  {
    id: "qingya_volley_2",
    name: "青崖剑诀·连潮剑势 II",
    type: "normal",
    requires: ["qingya_volley_1"],
    description: "一次攻击连续多发射1波剑气，波次间隔缩短。",
    valueText: "volleyCount +1 / volleyInterval -0.02",
    effects: { volleyAdd: 1, volleyIntervalAdd: -0.02 },
  },
  {
    id: "qingya_volley_3",
    name: "青崖剑诀·连潮剑势 III",
    type: "normal",
    requires: ["qingya_volley_2"],
    description: "一次攻击连续多发射1波剑气，波次间隔再次缩短。",
    valueText: "volleyCount +1 / volleyInterval -0.02",
    effects: { volleyAdd: 1, volleyIntervalAdd: -0.02 },
  },
  {
    id: "qingya_damage_1",
    name: "青崖剑诀·剑气凝练",
    type: "normal",
    description: "剑气单发伤害提升。",
    valueText: "damageMultiplier +30%",
    effects: { damageMult: 0.3 },
  },
  {
    id: "qingya_interval_1",
    name: "青崖剑诀·行剑如风",
    type: "normal",
    description: "陆青崖攻击间隔降低。",
    valueText: "attackIntervalMultiplier *0.85",
    effects: { attackIntervalMult: 0.85 },
  },
  {
    id: "qingya_pierce_1",
    name: "青崖剑诀·破妖剑痕",
    type: "normal",
    description: "剑气穿透数量+1。",
    valueText: "pierceCount +1",
    effects: { pierceAdd: 1 },
  },
  {
    id: "qingya_attack_line_1",
    name: "青崖剑诀·阵前破势",
    type: "normal",
    description: "对正在攻击阵眼的敌人造成额外伤害。",
    valueText: "阵前敌人伤害 +40%",
    effects: { attackLineDamageMult: 1.4 },
  },
  {
    id: "qingya_minor_projectile",
    name: "青崖剑诀·双锋并起",
    type: "minor",
    description: "小成：每波剑气弹道数量+1，伤害提升20%。",
    valueText: "projectileCount +1 / damage +20%",
    effects: { projectileAdd: 1, damageMult: 0.2 },
  },
  {
    id: "qingya_minor_volley",
    name: "青崖剑诀·剑潮初起",
    type: "minor",
    description: "小成：连续发射波数+1，波次间隔缩短，伤害提升20%。",
    valueText: "volleyCount +1 / volleyInterval -0.02 / damage +20%",
    effects: { volleyAdd: 1, volleyIntervalAdd: -0.02, damageMult: 0.2 },
  },
  {
    id: "qingya_minor_damage",
    name: "青崖剑诀·青锋小成",
    type: "minor",
    description: "小成：剑气伤害提升35%，穿透+1。",
    valueText: "damage +35% / pierceCount +1",
    effects: { damageMult: 0.35, pierceAdd: 1 },
  },
  {
    id: "qingya_major_giant_sword",
    name: "青崖剑诀·青崖巨阙",
    type: "major",
    description: "大成：剑气进化为巨型飞剑 projectile，高伤害、高穿透，并造成大范围震荡溅射。",
    valueText: "巨剑大成",
    effects: { giantSword: true },
  },
  {
    id: "qingya_giant_damage",
    name: "青崖巨阙·剑威",
    type: "major_enhance",
    requires: ["qingya_major_giant_sword"],
    description: "巨型飞剑伤害提升30%。",
    valueText: "巨剑伤害 +30%",
    effects: { giantSwordDamageMultAdd: 0.3 },
  },
  {
    id: "qingya_giant_elite",
    name: "青崖巨阙·破阵",
    type: "major_enhance",
    requires: ["qingya_major_giant_sword"],
    description: "巨型飞剑对精英和Boss的额外伤害提升30%。",
    valueText: "精英/Boss额外伤害 +30%",
    effects: { giantSwordEliteDamageMultAdd: 0.3 },
  },
  {
    id: "qingya_giant_splash",
    name: "青崖巨阙·裂山",
    type: "major_enhance",
    requires: ["qingya_major_giant_sword"],
    description: "巨型飞剑溅射范围提升25%。",
    valueText: "巨剑溅射范围 +25%",
    effects: { giantSwordSplashRadiusMult: 1.25 },
  },
  {
    id: "qingya_giant_speed",
    name: "青崖巨阙·御空",
    type: "major_enhance",
    requires: ["qingya_major_giant_sword"],
    description: "巨型飞剑飞行速度提升20%。",
    valueText: "巨剑速度 +20%",
    effects: { giantSwordSpeedMult: 1.2 },
  },
];

DEFAULT_QINGYA_BRANCH_UPGRADES = deepClone(QINGYA_BRANCH_UPGRADES);
applyDebugOverridesToData();

function getMartialBranchState(artId, createIfMissing = true) {
  return getSystemMartialBranchState({ state, martialArtId: artId, createIfMissing });
}

function hasMartialBranchUpgrade(artId, upgradeId) {
  return hasSystemMartialBranchUpgrade({ state, martialArtId: artId, upgradeId });
}

function qingyaAttackParamsFromBranches(extraUpgrade = null) {
  return getSystemQingyaAttackParamsFromBranches({ state, upgrades: QINGYA_BRANCH_UPGRADES, extraUpgrade });
}

function createUpgradeContext() {
  return {
    state,
    data: DATA,
    debugOverrides,
    rarityWeight,
    upgrades: QINGYA_BRANCH_UPGRADES,
    helpers: {
      deepClone,
      getMartialArtLevelForRole,
      getMartialBranchState,
      hasMartialBranchUpgrade,
      martialArtForCharacter,
      mergeObject,
      qingyaAttackParamsFromBranches,
    },
  };
}

function qingyaBranchUpgradeAvailable(upgrade) {
  return isSystemQingyaBranchUpgradeAvailable({ ...createUpgradeContext(), upgrade });
}

function applyQingyaBranchBonuses(bonuses) {
  return applySystemQingyaBranchBonuses({ state, upgrades: QINGYA_BRANCH_UPGRADES, bonuses });
}

function martialBonuses(roleId) {
  return getSystemMartialBonuses({ state, data: DATA, roleId, upgrades: QINGYA_BRANCH_UPGRADES, debugOverrides });
}

function roleStats(role) {
  return getSystemRoleStats({
    state,
    DATA,
    grid,
    role,
    helpers: {
      getCharacterBaseFinalDamage,
      martialBonuses,
    },
  });
}

function updateRole(role, dt) {
  return updateSystemRole({
    state,
    DATA,
    role,
    dt,
    callbacks: {
      fireRole,
    },
    helpers: {
      chooseTarget,
      roleStats,
    },
    timers: window,
  });
}

function fireRole(role, targetId) {
  return fireSystemRole({
    state,
    DATA,
    role,
    targetId,
    appState: state.appState,
    battleState: APP_STATE.BATTLE,
    callbacks: {
      fireProjectileAttack,
    },
    helpers: {
      martialBonuses,
      roleStats,
    },
  });
}

function fireProjectileAttack(role, target, attackParams) {
  return fireSystemProjectileAttack({
    state,
    data: DATA,
    role,
    target,
    attackParams,
    callbacks: {
      chooseTarget,
      martialBonuses,
      makeId,
      roleStats,
    },
    helpers: {
      battleState: APP_STATE.BATTLE,
      pathPixelDistance: attackLineY() + grid.cellH * 0.35,
    },
  });
}

function createRoleProjectiles(role, target, damage, projectileCount) {
  return createSystemRoleProjectiles({
    state,
    data: DATA,
    role,
    target,
    damage,
    projectileCount,
    callbacks: {
      martialBonuses,
      makeId,
    },
    helpers: {
      pathPixelDistance: attackLineY() + grid.cellH * 0.35,
    },
  });
}

function applyRoleHit(role, target, damage) {
  if (!target || target.dead) return;
  const config = DATA.roles[role.roleId];
  const art = martialBonuses(role.roleId);
  const projectile = config.trajectoryType || config.projectile;
  const killed = target.takeDamage(damage, "role", role);

  if (projectile === "splash") {
    areaDamage(target.x, target.y, grid.cellW * 0.65 * art.splashRadius, damage * 0.55, "role");
    if (art.splashShards > 0) {
      nearestEnemies(target, art.splashShards).forEach((enemy) => {
        enemy.takeDamage(damage * 0.25, "role", role);
        enemy.addStatus("burn", 1.2, Math.max(2, damage * 0.08));
      });
    }
  }
  if (projectile === "horizontal") {
    const count = art.fullRowSpear ? 99 : (config.passiveSkill === "horizontal_cleave" ? 4 : 2) + art.horizontalWidth + state.bonuses.horizontalBonus;
    horizontalTargets(target, count).forEach((enemy) => enemy.takeDamage(damage * 0.7, "role", role));
  }
  if (projectile === "vertical") {
    const count = 2 + state.bonuses.pierceAdd + art.pierceAdd + (config.passiveSkill === "pierce_bonus" ? 1 : 0);
    enemiesBehind(target, count).forEach((enemy) => enemy.takeDamage(damage * 0.65, "role", role));
    if (art.verticalColumns > 1) {
      state.enemies
        .filter((enemy) => !enemy.dead && enemy !== target && Math.abs(enemy.x - target.x) <= grid.cellW * 1.2)
        .slice(0, 6)
        .forEach((enemy) => enemy.takeDamage(damage * 0.45, "role", role));
    }
    if (art.swordTrail) {
      state.zones.push({ x: target.x, y: target.y, radius: grid.cellW * 0.45, ttl: 1.2, color: "rgba(215, 225, 236, 0.16)", dps: damage * 0.22, tick: 0 });
    }
  }
  if (projectile === "slow" || config.school === "冰") {
    target.addStatus("slow", 2 * state.bonuses.controlMultiplier, 0.3 + art.slowBonus);
    if (art.slowSplash > 0) {
      horizontalTargets(target, 2).forEach((enemy) => enemy.addStatus("slow", 1.5 * state.bonuses.controlMultiplier, art.slowSplash));
    }
    if (art.freezeAttackLine > 0 && target.progress >= 0.82 && Math.random() < art.freezeAttackLine) {
      target.addStatus("freeze", 0.55 * state.bonuses.controlMultiplier, 1);
    }
  }
  if (projectile === "poison" || config.school === "毒") {
    target.addStatus("poison", 3 + state.bonuses.poisonDurationAdd + art.poisonDuration, Math.max(2, damage * 0.22 * art.dotMult), {
      stack: config.passiveSkill === "poison_stack",
      maxStacks: 3,
    });
    if (art.chainAdd > 0) nearestEnemies(target, art.chainAdd).forEach((enemy) => {
      enemy.takeDamage(damage * 0.45, "role", role);
      enemy.addStatus("poison", 2 + art.poisonDuration, Math.max(1, damage * 0.1 * art.dotMult));
    });
  }
  if (projectile === "pierce" || (state.bonuses.pierceAdd > 0 && projectile !== "vertical")) {
    const count = (projectile === "pierce" ? 1 : 0) + state.bonuses.pierceAdd + art.pierceAdd;
    enemiesBehind(target, count).forEach((enemy) => enemy.takeDamage(damage * 0.65, "role", role));
  }
  if (projectile === "chain") {
    const count = (config.passiveSkill === "thunder_chain" ? 3 : 2) + art.chainAdd + state.bonuses.chainBonus;
    nearestEnemies(target, count).forEach((enemy) => enemy.takeDamage(damage * 0.55, "role", role));
    if (art.paralyze > 0) target.addStatus("slow", 0.8, art.paralyze);
    if (art.bossPriorityLightning) {
      const elite = state.enemies.find((enemy) => !enemy.dead && (enemy.config.isBoss || enemy.config.type === "绮捐嫳"));
      if (elite) elite.takeDamage(damage * 0.9, "role", role);
    }
  }
  if (art.burnOnHit > 0) target.addStatus("burn", 1.5, art.burnOnHit);
  if (art.meteorRain > 0) nearestEnemies(target, art.meteorRain).forEach((enemy) => enemy.takeDamage(damage * 0.35, "role", role));
  if (projectile === "execute" && target.hp / target.maxHp < 0.3) {
    target.takeDamage(damage * 0.35, "role", role);
  }
  if (config.passiveSkill === "weaken_enemy_attack") {
    target.addStatus("weaken_attack", 3, 0.2);
  }
  if (role.roleId === "role_chiyang_elder" || role.roleId === "role_han_jin") {
    target.addStatus("burn", 1.5, Math.max(4, damage * 0.16 * state.bonuses.burnMultiplier));
  }
  if (role.roleId === "role_xuanshuang_elder") {
    target.addStatus("freeze", 0.45 * state.bonuses.controlMultiplier, 1);
  }
  if (killed && role.roleId === "role_han_jin") {
    state.zones.push({ x: target.x, y: target.y, radius: grid.cellW * 0.8, ttl: 1.5, color: "rgba(239, 123, 69, 0.22)", dps: damage * 0.2, tick: 0 });
  }
  if (killed && art.poisonFogOnDeath) {
    state.zones.push({ x: target.x, y: target.y, radius: grid.cellW * 0.75, ttl: 2, color: "rgba(168, 85, 247, 0.18)", dps: damage * 0.25, tick: 0 });
  }
}

function chooseTarget(source, range) {
  return chooseSystemTarget({
    state,
    DATA,
    source,
    range,
    helpers: {
      distance,
    },
  });
}

function sideTargets(target, count) {
  if (count <= 0) return [];
  return state.enemies
    .filter((enemy) => !enemy.dead && enemy !== target && Math.abs(enemy.y - target.y) < grid.cellH * 0.8)
    .sort((a, b) => Math.abs(a.x - target.x) - Math.abs(b.x - target.x))
    .slice(0, count);
}

function horizontalTargets(target, count) {
  return state.enemies
    .filter(
      (enemy) =>
        !enemy.dead &&
        enemy !== target &&
        Math.abs(enemy.y - target.y) <= grid.cellH * 0.65,
    )
    .sort((a, b) => Math.abs(a.x - target.x) - Math.abs(b.x - target.x))
    .slice(0, count);
}

function enemiesBehind(target, count) {
  return state.enemies
    .filter(
      (enemy) =>
        !enemy.dead &&
        enemy !== target &&
        enemy.lane === target.lane &&
        enemy.progress < target.progress &&
        target.progress - enemy.progress < 0.18,
    )
    .sort((a, b) => b.progress - a.progress)
    .slice(0, count);
}

function nearestEnemies(target, count) {
  return state.enemies
    .filter((enemy) => !enemy.dead && enemy !== target)
    .sort((a, b) => distance(a, target) - distance(b, target))
    .slice(0, count);
}

function updateFormation(dt) {
  return updateSystemFormation({
    state,
    DATA,
    dt,
    callbacks: {
      addZone(zone) {
        state.zones.push(zone);
      },
      damageEnemy(enemy, damage, source) {
        enemy.takeDamage(damage, source);
      },
      getFormationBase() {
        return { x: canvas.width / 2, y: canvas.height - grid.cellH / 2 };
      },
      nearestEnemies,
      setStatus,
    },
    helpers: {
      distance,
      grid,
    },
  });
}

function areaDamage(x, y, radius, damage, source) {
  return areaDamageSystem({
    state,
    x,
    y,
    radius,
    damage,
    source,
    callbacks: {
      addZone(zone) {
        state.zones.push(zone);
      },
      damageEnemy(enemy, finalDamage, finalSource) {
        enemy.takeDamage(finalDamage, finalSource);
      },
    },
    helpers: {
      distance,
    },
  });
}

function drawShot(x, y, tx, ty, color) {
  state.projectiles.push({ x, y, tx, ty, color, ttl: 0.16, visualOnly: true });
}

function updateProjectiles(dt) {
  return updateSystemProjectiles({
    state,
    deltaTime: dt,
    callbacks: {
      applyRoleHit,
      areaDamage,
    },
    helpers: {
      attackingEnemyState: ENEMY_STATE.ATTACKING,
      canvasHeight: canvas.height,
      canvasWidth: canvas.width,
      distancePointToSegment,
    },
  });
}

function checkProjectileCollision(projectile) {
  return checkSystemProjectileCollision({
    state,
    projectile,
    callbacks: {
      applyRoleHit,
      areaDamage,
    },
    helpers: {
      attackingEnemyState: ENEMY_STATE.ATTACKING,
      distancePointToSegment,
    },
  });
}

function checkProjectileHitEnemy(projectile, enemy) {
  return checkSystemProjectileHitEnemy(projectile, enemy, {
    distancePointToSegment,
  });
}

function update(dt) {
  if (state.appState !== APP_STATE.BATTLE || state.gameOver) return;
  if (!state.waveActive) startWave();

  updateWaveSpawns(dt);

  updateEnemies(dt);
  state.enemies = state.enemies.filter((enemy) => !enemy.dead);
  state.deployedRoles.forEach((role) => updateRole(role, dt));
  updateProjectiles(dt);
  updateFormation(dt);
  updateArtifact(dt);
  updateEffects(dt);
  state.enemies = state.enemies.filter((enemy) => enemy.state !== ENEMY_STATE.DEAD);

  advanceWave();
  updateUi();
}

function updateArtifact(dt) {
  return updateSystemArtifacts({
    state,
    DATA,
    dt,
    callbacks: {
      addFloater(floater) {
        state.floaters.push(floater);
      },
      damageEnemy(enemy, damage, source) {
        enemy.takeDamage(damage, source);
      },
      drawShot,
      getArtifactOrigin() {
        return { x: canvas.width / 2, y: canvas.height - grid.cellH * 0.35 };
      },
    },
  });
}

function showDamageNumber(amount, target) {
  if (target !== "arrayCore") return;
  state.floaters.push({
    x: canvas.width / 2,
    y: canvas.height - grid.cellH * 0.65,
    text: `-${Math.ceil(amount)}`,
    ttl: 0.65,
    color: "#ff9a76",
  });
}

function damageArrayCore(rawDamage, enemy = null) {
  return damageSystemArrayCore({
    state,
    rawDamage,
    enemy,
    callbacks: {
      addFloater(floater) {
        state.floaters.push(floater);
      },
      endGame,
      getDamageNumberPosition() {
        return { x: canvas.width / 2, y: canvas.height - grid.cellH * 0.65 };
      },
      setStatus,
    },
  });
}

function updateEffects(dt) {
  state.floaters.forEach((floater) => {
    floater.ttl -= dt;
    floater.y -= dt * 24;
  });
  state.floaters = state.floaters.filter((floater) => floater.ttl > 0);
  state.zones.forEach((zone) => (zone.ttl -= dt));
  state.zones.forEach((zone) => {
    if (!zone.dps) return;
    zone.tick = (zone.tick || 0) + dt;
    if (zone.tick >= 0.5) {
      zone.tick = 0;
      areaDamage(zone.x, zone.y, zone.radius, zone.dps * 0.5, "role");
    }
  });
  state.zones = state.zones.filter((zone) => zone.ttl > 0);
}

function showPerkChoices() {
  const choices = drawPerksFiltered(3);
  perkGrid.innerHTML = "";
  choices.forEach((perk) => {
    const button = document.createElement("button");
    button.className = "perk-card";
    button.innerHTML = `<small>${perk.rarity} · ${perk.category}</small><strong>${perk.name}</strong><p>${perk.description}</p>`;
    button.addEventListener("click", () => {
      chooseLevelUpPerk(perk);
    });
    perkGrid.appendChild(button);
  });
  if (!choices.length) {
    const button = document.createElement("button");
    button.className = "perk-card";
    button.innerHTML = "<strong>武学稳固</strong><p>没有可用机缘时，当前武学伤害+5%。</p>";
    button.addEventListener("click", () => {
      const fallbackArt = martialArtForCharacter(currentRunCharacters()[0]?.id);
      chooseLevelUpPerk({
        id: `fallback_damage_${state.runLevel}_${Date.now()}`,
        name: fallbackArt ? `${fallbackArt.name}·武学稳固` : "护体圣光",
        scope: fallbackArt ? "martial_art" : "array_core",
        targetType: fallbackArt ? "martial_art" : "array_recover",
        targetId: fallbackArt ? fallbackArt.id : "array_core",
        targetName: fallbackArt ? fallbackArt.name : "护山阵眼",
        martialArtId: fallbackArt?.id || "",
        effect: fallbackArt ? { type: "martial_art_damage_bonus", martialArtId: fallbackArt.id, value: 0.05 } : { type: "array_heal", value: 50 },
      });
    });
    perkGrid.appendChild(button);
  }
  perkModal.classList.remove("hidden");
}

function currentRunCharacters() {
  return getSystemCurrentRunCharacters({ state, data: DATA });
}

function selectedArtifactIds() {
  return getSystemSelectedArtifactIds({ state });
}

function createMartialArtPerk(art) {
  return createSystemMartialArtPerk({ state, art });
}

function createQingyaBranchPerk(upgrade) {
  return createSystemQingyaBranchPerk({ state, upgrade });
}

function createQingyaBranchPerks() {
  return createSystemQingyaBranchPerks(createUpgradeContext());
}

function currentMartialArtUpgradePerks() {
  return getSystemCurrentMartialArtUpgradePerks(createUpgradeContext());
}

function currentTargetedMartialPerks() {
  return getSystemCurrentTargetedMartialPerks(createUpgradeContext());
}

function currentTrajectoryPerks() {
  return getSystemCurrentTrajectoryPerks(createUpgradeContext());
}

function artifactPerksForRun() {
  return getSystemArtifactPerksForRun(createUpgradeContext());
}

function defensivePerksForRun() {
  return getSystemDefensivePerksForRun(createUpgradeContext());
}

function normalizePerk(perk) {
  return normalizeSystemPerk({ perk, context: createUpgradeContext() });
}

function hasForbiddenGenericText(perk) {
  return hasSystemForbiddenGenericText(perk);
}

function perkUpgradeWeight(rawPerk) {
  return getSystemPerkUpgradeWeight({ perk: rawPerk, context: createUpgradeContext() });
}

function isPerkValidForCurrentRun(rawPerk) {
  return isSystemPerkValidForCurrentRun({ perk: rawPerk, context: createUpgradeContext() });
}

function fillWithGenericPerks(choices, count) {
  return fillWithSystemGenericPerks({ choices, count, context: createUpgradeContext() });
}

function perkSpecificity(perk) {
  return getSystemPerkSpecificity(perk);
}

function perkEffectKey(rawPerk) {
  return getSystemPerkEffectKey({ perk: rawPerk, context: createUpgradeContext() });
}

function dedupePerks(perks) {
  return dedupeSystemPerks({ perks, context: createUpgradeContext() });
}

function chooseLevelUpPerk(perk) {
  try {
    applyPerk(perk);
  } catch (error) {
    state.lastError = error && error.message ? error.message : String(error);
    console.error("Failed to apply perk", perk, error);
  } finally {
    perkGrid.innerHTML = "";
    perkModal.classList.add("hidden");
    setStatus(`获得机缘：${perk.name || "未知机缘"}`);
    if (state.pendingLevelUps > 0) {
      enterLevelUpReward();
    } else if (!state.gameOver && state.appState !== APP_STATE.SETTLEMENT) {
      state.appState = APP_STATE.BATTLE;
      state.running = true;
      state.paused = false;
      updateUi();
    }
  }
}

function drawPerksFiltered(count) {
  return drawSystemPerksFiltered({ context: createUpgradeContext(), count });
}

function drawPerks(count) {
  return drawSystemPerks({ context: createUpgradeContext(), count });
}

function hasPassiveRole(school) {
  return state.deployedRoles.some((role) => {
    const config = DATA.roles[role.roleId];
    return config.school === school && Boolean(config.passiveSkill);
  });
}

function applyTargetedFallbackUpgrade() {
  const character = currentRunCharacters()[0];
  const art = character ? martialArtForCharacter(character.id) : null;
  if (art) {
    getMartialArtModifier(art.id).damageMultiplier *= 1.05;
    return;
  }
  const role = state.deployedRoles[0];
  if (role) role.personalDamage *= 1.05;
}

function applyPerk(perk) {
  perk = normalizePerk(perk);
  if (!isPerkValidForCurrentRun(perk)) {
    applyTargetedFallbackUpgrade();
    setStatus("当前无可用机缘目标，已转化为当前武学伤害+5%。");
    return;
  }
  state.acquiredPerks.add(perk.id);
  const effect = perk.effect || { type: "unimplemented", value: 0 };
  switch (effect.type) {
    case "role_damage_mult":
      state.bonuses.roleDamage *= 1 + effect.value;
      break;
    case "role_attack_speed":
      state.bonuses.roleAttackSpeed *= 1 + effect.value;
      break;
    case "role_range_add":
      state.bonuses.roleRangeAdd += effect.value;
      break;
    case "crit":
      state.bonuses.critChance += effect.chance;
      state.bonuses.critMult = effect.mult;
      break;
    case "pierce_add":
      state.bonuses.pierceAdd += effect.value;
      break;
    case "side_projectiles":
      state.bonuses.sideProjectiles += effect.value;
      break;
    case "multishot":
      state.bonuses.multishot += effect.value;
      break;
    case "formation_damage_mult":
      state.bonuses.formationDamage *= 1 + effect.value;
      break;
    case "formation_cooldown_mult":
      state.bonuses.formationCooldown *= effect.value;
      break;
    case "formation_radius_add":
      state.bonuses.formationRadiusAdd += effect.value;
      break;
    case "base_hp_add":
    case "array_hp_bonus":
      state.arrayCoreMaxHp += effect.value;
      state.arrayCoreHp = Math.min(state.arrayCoreMaxHp, state.arrayCoreHp + effect.value);
      syncBaseHpAliases();
      break;
    case "array_defense_bonus":
      state.arrayCoreDefense += effect.value;
      syncBaseHpAliases();
      break;
    case "array_heal":
      state.arrayCoreHp = Math.min(state.arrayCoreMaxHp, state.arrayCoreHp + effect.value);
      syncBaseHpAliases();
      break;
    case "array_damage_reduction_bonus":
      state.arrayCoreDamageReduction += effect.value;
      syncBaseHpAliases();
      break;
    case "lingqi_gain_mult":
      state.bonuses.lingqiGain *= 1 + effect.value;
      break;
    case "boss_damage_mult":
      state.bonuses.bossDamage *= 1 + effect.value;
      break;
    case "slow_vulnerability":
      state.bonuses.slowVulnerability += effect.value;
      break;
    case "control_bonus":
      state.bonuses.controlMultiplier *= 1 + effect.value;
      break;
    case "poison_duration_add":
      state.bonuses.poisonDurationAdd += effect.value;
      break;
    case "passive_skill_bonus":
      state.bonuses.passiveMultiplier *= 1 + effect.value;
      break;
    case "artifact_damage_bonus":
      getArtifactModifier(effect.artifactId).damageMultiplier *= 1 + effect.value;
      break;
    case "artifact_cooldown_mult":
      getArtifactModifier(effect.artifactId).cooldownMultiplier *= effect.value;
      break;
    case "horizontal_bonus":
      state.bonuses.horizontalBonus += effect.value;
      break;
    case "chain_bonus":
      state.bonuses.chainBonus += effect.value;
      break;
    case "lowest_character_damage": {
      const target = [...state.deployedRoles].sort(
        (a, b) => getCharacterLevel(a.roleId) - getCharacterLevel(b.roleId),
      )[0];
      if (target) target.personalDamage *= 1 + effect.value;
      else state.bonuses.roleDamage *= 1.05;
      break;
    }
    case "martial_art_upgrade": {
      const art = (DATA.martialArts || []).find((item) => item.id === effect.martialArtId);
      if (!art || !currentRunCharacters().some((character) => character.id === art.ownerCharacterId)) {
        applyTargetedFallbackUpgrade();
        break;
      }
      const current = state.martialArtLevels[art.id] || 0;
      state.martialArtLevels[art.id] = Math.min(art.maxLevel, current + 1);
      break;
    }
    case "martial_art_branch_upgrade": {
      const art = (DATA.martialArts || []).find((item) => item.id === effect.martialArtId);
      const upgrade = QINGYA_BRANCH_UPGRADES.find((item) => item.id === effect.upgradeId);
      if (!art || !upgrade || !qingyaBranchUpgradeAvailable(upgrade)) {
        applyTargetedFallbackUpgrade();
        break;
      }
      getMartialBranchState(art.id)[upgrade.id] = true;
      const current = state.martialArtLevels[art.id] || 0;
      state.martialArtLevels[art.id] = Math.min(art.maxLevel, current + 1);
      break;
    }
    case "martial_art_damage_bonus":
      getMartialArtModifier(effect.martialArtId).damageMultiplier *= 1 + effect.value;
      break;
    case "martial_art_attack_interval_mult":
      getMartialArtModifier(effect.martialArtId).attackIntervalMultiplier *= effect.value;
      break;
    case "martial_art_pierce_bonus":
      getMartialArtModifier(effect.martialArtId).pierceAdd += effect.value;
      break;
    default:
      if (perk.id === "perk_sword_passive_up") {
        state.bonuses.passiveMultiplier *= 1.5;
      }
      if (perk.id === "perk_fire_passive_up") {
        state.bonuses.burnMultiplier *= 1.4;
      }
      if (perk.id === "perk_ice_passive_up") {
        state.bonuses.controlMultiplier *= 1.25;
      }
      if (perk.id === "perk_poison_passive_up") {
        state.bonuses.poisonDurationAdd += 1;
        state.bonuses.poisonSpreadChanceAdd += 0.15;
      }
      if (perk.id === "perk_role_focus_random" && state.deployedRoles.length) {
        const role = state.deployedRoles[Math.floor(Math.random() * state.deployedRoles.length)];
        role.personalDamage *= 1.2;
        role.personalSpeed *= 1.1;
      }
      if (perk.id === "perk_outer_disciple_breakthrough") {
        state.acquiredPerks.add("perk_outer_disciple_breakthrough");
      }
  }
}

function calculateSettlement(win) {
  let reward = Math.floor(state.highestWave * DATA.settlement.basePerWave + state.kills * DATA.settlement.killFactor);
  state.bossKills.forEach((wave) => {
    reward += DATA.settlement.bossBonus[String(wave)] || 0;
  });
  if (win) reward += DATA.settlement.victoryBonus;
  return reward;
}

function calculatePlayerExp(win) {
  let exp = state.highestWave * 10 + state.kills;
  exp += state.bossKills.size * 50;
  if (win) exp += 100;
  return exp;
}

function endGame(win) {
  if (state.gameOver) return;
  state.gameOver = true;
  state.running = false;
  state.appState = APP_STATE.SETTLEMENT;
  state.paused = false;
  const reward = calculateSettlement(win);
  const playerExp = calculatePlayerExp(win);
  playerMeta.spiritStones += reward;
  playerMeta.playerExp += playerExp;
  const levelRewards = checkPlayerLevelUp();
  playerMeta.highestWave = Math.max(playerMeta.highestWave || 0, state.highestWave);
  playerMeta.totalKills = (playerMeta.totalKills || 0) + state.kills;
  syncPlayerMetaAliases();
  savePlayerProfile();
  settlementTitle.textContent = win ? "守山成功" : "阵眼破碎";
  settlementWave.textContent = state.highestWave;
  settlementKills.textContent = state.kills;
  settlementLingstone.textContent = `${reward}灵石 / ${playerExp}经验${levelRewards.length ? ` / ${levelRewards.join("，")}` : ""}`;
  showView(settlementView);
  updateDebugPanel();
}

function renderLobby() {
  syncPlayerMetaAliases();
  metaLevel.textContent = `${playerMeta.playerLevel}（${playerMeta.playerExp}/${getPlayerLevelExpRequirement(playerMeta.playerLevel)}）`;
  metaLingstone.textContent = playerMeta.spiritStones;
  ownedRolesList.innerHTML = "";
  Object.values(DATA.roles).forEach((role) => {
    const owned = playerMeta.ownedCharacters.includes(role.id);
    const level = getCharacterLevel(role.id);
    const damage = Math.round(getCharacterBaseFinalDamage(role) * 10) / 10;
    const item = document.createElement("div");
    item.className = `character-card ${owned ? "owned" : "locked"}`;
    const source = role.unlockType === "gacha" ? "抽卡获得" : `${role.unlockLevel}级解锁`;
    item.innerHTML = `
      <strong>${role.name} <small>${role.rarity}</small></strong>
      <span>${role.rankTitle || role.rank} · ${role.school} · ${role.role}</span>
      <span>等级 ${owned ? level : "-"} · 伤害 ${owned ? damage : role.baseDamage} · ${role.trajectoryType}</span>
      <span>${owned ? "已拥有" : source}</span>
      <p>${owned ? role.designValue : role.description}</p>
    `;
    if (owned) {
      const button = document.createElement("button");
      button.className = "secondary";
      button.textContent = `升级 ${getCharacterUpgradeCost(level, role.rarity)}灵石`;
      button.addEventListener("click", () => upgradeCharacter(role.id));
      item.appendChild(button);
    }
    ownedRolesList.appendChild(item);
  });
  const nextCharacter = getNextCharacterUnlock();
  const nextSlot = getNextDeploySlotUnlock();
  const tips = [];
  if (nextCharacter) tips.push(`${nextCharacter.level}级解锁：${DATA.roles[nextCharacter.characterId].name}`);
  if (nextSlot) tips.push(`${nextSlot.level}级解锁第${nextSlot.deploySlots}个上阵位`);
  if (tips.length) {
    const tip = document.createElement("span");
    tip.className = "unlock-tip";
    tip.textContent = tips.join(" · ");
    ownedRolesList.prepend(tip);
  }
  ownedArtifactsList.innerHTML = playerMeta.ownedArtifacts
    .map((id) => `<span>${DATA.artifacts[id].name}</span>`)
    .join("");
  unlockedFormationsList.innerHTML = playerMeta.unlockedFormations
    .map((id) => `<span>${DATA.formations[id].name}</span>`)
    .join("");
}

function renderLoadout() {
  loadoutFormationList.innerHTML = "";
  playerMeta.unlockedFormations.forEach((id) => {
    const formation = DATA.formations[id];
    const button = document.createElement("button");
    button.className = "choice";
    button.classList.toggle("selected", state.loadoutFormationId === id);
    button.innerHTML = `<strong>${formation.name}</strong><span>被动 · ${formation.triggerRadius}格 · ${formation.cooldown}秒</span>`;
    button.addEventListener("click", () => {
      state.loadoutFormationId = id;
      renderLoadout();
      updateUi();
    });
    loadoutFormationList.appendChild(button);
  });

  loadoutRoleList.innerHTML = "";
  playerMeta.ownedCharacters.forEach((id) => {
    const role = DATA.roles[id];
    const selected = state.loadoutRoleIds.includes(id);
    const button = document.createElement("button");
    button.className = "choice";
    button.classList.toggle("selected", selected);
    button.innerHTML = `<strong>${role.name}</strong><span>${role.rarity} · ${role.rankTitle || role.rank} · Lv${getCharacterLevel(id)} · ${role.trajectoryType}</span>`;
    button.addEventListener("click", () => {
      if (selected) {
        state.loadoutRoleIds = state.loadoutRoleIds.filter((roleId) => roleId !== id);
      } else if (state.loadoutRoleIds.length < playerMeta.maxDeploySlots) {
        state.loadoutRoleIds.push(id);
      } else {
        setStatus(`当前最多选择 ${playerMeta.maxDeploySlots} 名出战角色。`);
      }
      renderLoadout();
      updateUi();
    });
    loadoutRoleList.appendChild(button);
  });

  loadoutArtifactList.innerHTML = "";
  playerMeta.ownedArtifacts.forEach((id) => {
    const artifact = DATA.artifacts[id];
    const button = document.createElement("button");
    button.className = "choice";
    button.classList.toggle("selected", state.loadoutArtifactId === id);
    button.innerHTML = `<strong>${artifact.name}</strong><span>法宝 · ${artifact.damage}伤害 · ${artifact.cooldown}秒</span>`;
    button.addEventListener("click", () => {
      state.loadoutArtifactId = id;
      renderLoadout();
      updateUi();
    });
    loadoutArtifactList.appendChild(button);
  });

  const roleText = `${state.loadoutRoleIds.length}/${playerMeta.maxDeploySlots}`;
  const nextSlot = getNextDeploySlotUnlock();
  loadoutStatus.textContent = loadoutReady()
    ? `配置完成：1个阵法，${roleText} 名角色，1个法宝。`
    : `配置未完成：需要 1 个阵法、至少1名角色、1 个法宝。当前上阵位：${roleText}。`;
  if (nextSlot) {
    loadoutStatus.textContent += ` ${nextSlot.level}级解锁第${nextSlot.deploySlots}个上阵位。`;
  }
  enterDeployButton.disabled = !loadoutReady();
}

function renderSetupLists() {
  formationList.innerHTML = "";
  if (state.selectedFormationId) {
    const formation = DATA.formations[state.selectedFormationId];
    const item = document.createElement("div");
    item.className = "choice selected";
    item.innerHTML = `<strong>${formation.name}</strong><span>战斗中不可更换</span>`;
    formationList.appendChild(item);
  }

  roleList.innerHTML = "";
  state.availableRoles.forEach((roleId) => {
    const role = DATA.roles[roleId];
    const deployed = state.deployedRoles.some((item) => item.roleId === roleId);
    const button = document.createElement("button");
    button.className = "choice";
    button.classList.toggle("selected", roleId === state.selectedRoleId);
    button.classList.toggle("deployed", deployed);
    button.innerHTML = `<strong>${role.name}</strong><span>${role.rarity} · ${role.rankTitle || role.rank} · ${role.school} · ${role.trajectoryType}</span>`;
    button.disabled = state.appState !== APP_STATE.DEPLOY || deployed;
    button.addEventListener("click", () => {
      state.selectedRoleId = roleId;
      renderSetupLists();
    });
    roleList.appendChild(button);
  });

  artifactList.innerHTML = "";
  if (state.selectedArtifactId) {
    const artifact = DATA.artifacts[state.selectedArtifactId];
    const item = document.createElement("div");
    item.className = "choice selected";
    item.innerHTML = `<strong>${artifact.name}</strong><span>自动攻击 · 战斗中不可更换</span>`;
    artifactList.appendChild(item);
  }
}

function updateUi() {
  if (state.appState === APP_STATE.LOBBY) showView(lobbyView);
  if (state.appState === APP_STATE.LOADOUT) showView(loadoutView);
  if (state.appState === APP_STATE.DEPLOY || state.appState === APP_STATE.BATTLE || state.appState === APP_STATE.LEVEL_UP_REWARD) {
    showView(battleView);
  }
  if (state.appState === APP_STATE.SETTLEMENT) showView(settlementView);
  renderLobby();
  waveText.textContent = `${state.wave} / ${DATA.config.maxWaves}`;
  hpText.textContent = `${Math.max(0, Math.ceil(state.arrayCoreHp))} / ${state.arrayCoreMaxHp}${
    state.arrayCoreDefense > 0 ? `\n防御：${state.arrayCoreDefense}` : ""
  }`;
  const next = nextLevelRequirement();
  lingqiText.textContent =
    next < Infinity
      ? `Lv${state.runLevel} · ${Math.floor(state.lingqi)} / ${next}`
      : `Lv${state.runLevel} · 已满`;
  runStatus.textContent = state.status;
  startButton.textContent = state.appState === APP_STATE.DEPLOY ? "开始战斗" : "战斗中";
  startButton.disabled = state.appState !== APP_STATE.DEPLOY || state.deployedRoles.length !== state.availableRoles.length;
  deployHint.textContent =
    state.appState === APP_STATE.DEPLOY
      ? `已部署 ${state.deployedRoles.length}/${state.availableRoles.length}。只能放在最底部 5 个护山大阵 / 护山阵眼格。`
      : "战斗中角色会自动攻击，不能消耗灵石建造。";
  if (state.appState === APP_STATE.LOADOUT) renderLoadout();
  updateDebugPanel();
}

function applyCollectionOverrides(collection, overrides) {
  Object.entries(overrides || {}).forEach(([id, patch]) => {
    if (!collection[id]) return;
    mergeObject(collection[id], deepClone(patch));
  });
}

function applyDebugOverridesToData() {
  Object.keys(DEFAULT_GAME_DATA || {}).forEach((key) => {
    DATA[key] = deepClone(DEFAULT_GAME_DATA[key]);
  });
  applyCollectionOverrides(DATA.roles || {}, debugOverrides.characters);
  DATA.characters = DATA.roles;
  applyCollectionOverrides(DATA.enemies || {}, debugOverrides.enemies);
  applyCollectionOverrides(DATA.artifacts || {}, debugOverrides.artifacts);
  applyCollectionOverrides(DATA.formations || {}, debugOverrides.formations);
  applyCollectionOverrides(Object.fromEntries((DATA.martialArts || []).map((art) => [art.id, art])), debugOverrides.martialArts);
  if (DEFAULT_QINGYA_BRANCH_UPGRADES.length) {
    QINGYA_BRANCH_UPGRADES.splice(0, QINGYA_BRANCH_UPGRADES.length, ...deepClone(DEFAULT_QINGYA_BRANCH_UPGRADES));
    applyCollectionOverrides(Object.fromEntries(QINGYA_BRANCH_UPGRADES.map((upgrade) => [upgrade.id, upgrade])), debugOverrides.upgrades);
  }
  Object.entries(debugOverrides.perks || {}).forEach(([id, patch]) => {
    const perk = (DATA.perks || []).find((item) => item.id === id);
    if (perk) mergeObject(perk, deepClone(patch));
  });
  Object.entries(debugOverrides.waves || {}).forEach(([rowId, patch]) => {
    const [waveNumber, segmentIndex] = rowId.split(":").map((item) => Number(item));
    const wave = (DATA.waves || []).find((item) => item.wave === waveNumber);
    if (!wave) return;
    if (patch.goal !== undefined) wave.goal = patch.goal;
    if (patch.isBossWave !== undefined) wave.isBossWave = patch.isBossWave;
    if (wave.segments?.[segmentIndex]) mergeObject(wave.segments[segmentIndex], deepClone(patch));
  });
}

function refreshRuntimeFromDebugData() {
  applyDebugOverridesToData();
  state.enemies.forEach((enemy) => {
    const config = DATA.enemies[enemy.config.id];
    if (!config) return;
    const hpRatio = enemy.maxHp > 0 ? enemy.hp / enemy.maxHp : 1;
    enemy.config = config;
    enemy.maxHp = config.hp || config.maxHp || enemy.maxHp;
    enemy.hp = Math.min(enemy.maxHp, Math.max(1, Math.round(enemy.maxHp * hpRatio)));
    enemy.moveSpeed = config.moveSpeed || config.speed || enemy.moveSpeed;
    enemy.attackDamage = config.attackDamage || config.baseDamage || enemy.attackDamage;
    enemy.attackInterval = config.attackInterval || enemy.attackInterval;
    enemy.hitRadius = config.hitRadius || (config.isBoss ? 32 : config.type === "精英" ? 18 : 14);
  });
  renderLobby();
  renderLoadout();
  updateUi();
}

function getDebugSnapshot() {
  return {
    APP_STATE: state.appState,
    "player.level": state.runLevel,
    "profile.playerLevel": playerMeta.playerLevel,
    "profile.playerExp": playerMeta.playerExp,
    "profile.spiritStones": playerMeta.spiritStones,
    "profile.loadedFromLocalStorage": playerProfileLoadedFromStorage,
    "profile.highestWave": playerMeta.highestWave,
    "profile.totalKills": playerMeta.totalKills,
    "profile.maxDeploySlots": playerMeta.maxDeploySlots,
    "profile.ownedCharacterCount": playerMeta.ownedCharacters.length,
    "profile.ownedCharacters": playerMeta.ownedCharacters.join(","),
    "profile.characterLevels": JSON.stringify(playerMeta.characterLevels),
    martialArtLevels: JSON.stringify(state.martialArtLevels || {}),
    "player.spiritQi": Math.floor(state.lingqi),
    "player.nextLevelSpiritQi": nextLevelRequirement(),
    pendingLevelUps: state.pendingLevelUps,
    activePerkModal: !perkModal.classList.contains("hidden"),
    "enemies.length": state.enemies.length,
    "characters.length": state.deployedRoles.length,
    animationFrame: state.animationFrameRunning ? `running (${state.frameCount})` : "stopped",
    battlePaused: state.paused,
    running: state.running,
    wave: state.wave,
    baseHp: Math.ceil(state.arrayCoreHp),
    arrayCoreMaxHp: state.arrayCoreMaxHp,
    arrayCoreHp: Math.ceil(state.arrayCoreHp),
    arrayCoreDefense: state.arrayCoreDefense,
    arrayCoreDamageReduction: state.arrayCoreDamageReduction,
    kills: state.kills,
    "projectiles.length": state.projectiles.length,
    firstProjectileType: state.projectiles.find((projectile) => !projectile.visualOnly)?.type || "none",
    roleAttackCount: state.deployedRoles.reduce((sum, role) => sum + role.attacks, 0),
    "artifacts.length": state.selectedArtifactId ? 1 : 0,
    selectedArtifact: state.selectedArtifactId || "",
    artifactCooldown: Number(state.artifactCooldown || 0).toFixed(2),
    firstEnemyProgress: state.enemies[0] ? Number(state.enemies[0].progress).toFixed(3) : "none",
    firstEnemyMode: state.enemies[0] ? state.enemies[0].state : "none",
    attackLineY: Number(attackLineY()).toFixed(1),
    lastError: state.lastError,
  };
}

function safeText(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatDebugValue(value) {
  if (value instanceof Set) return [...value].join(", ");
  if (Array.isArray(value)) return value.join(", ");
  if (value && typeof value === "object") return JSON.stringify(value);
  if (typeof value === "number") return Number.isInteger(value) ? value : Number(value.toFixed(3));
  return value ?? "";
}

function debugTable(columns, rows) {
  const head = columns.map((column) => `<th>${safeText(column.label || column.key)}</th>`).join("");
  const body = rows
    .map((row) => `<tr>${columns.map((column) => `<td>${safeText(formatDebugValue(row[column.key]))}</td>`).join("")}</tr>`)
    .join("");
  return `<table class="debug-table"><thead><tr>${head}</tr></thead><tbody>${body || `<tr><td colspan="${columns.length}">无数据</td></tr>`}</tbody></table>`;
}

function getDebugOverride(scope, id, field) {
  const target = debugOverrides[scope]?.[id];
  if (!target) return undefined;
  if (field.startsWith("debugParams.")) return target.debugParams?.[field.split(".")[1]];
  return target[field];
}

function isDebugFieldChanged(scope, id, field) {
  return getDebugOverride(scope, id, field) !== undefined;
}

function debugInputType(column) {
  if (column.type === "number") return "number";
  if (column.type === "boolean") return "checkbox";
  return "text";
}

function debugEditableCell(row, column) {
  const overrideValue = getDebugOverride(row.__scope, row.__id, column.field || column.key);
  const value = overrideValue !== undefined ? overrideValue : row[column.key] ?? "";
  if (!column.editable || !debugEditMode) return safeText(formatDebugValue(value));
  const changed = isDebugFieldChanged(row.__scope, row.__id, column.field || column.key);
  const common = `data-debug-field="1" data-scope="${safeText(row.__scope)}" data-id="${safeText(row.__id)}" data-field="${safeText(column.field || column.key)}" data-type="${safeText(column.type || "text")}"`;
  const className = changed ? "debug-field changed" : "debug-field";
  if (column.type === "boolean") {
    return `<input class="${className}" ${common} type="checkbox" ${value ? "checked" : ""} />`;
  }
  if (column.options) {
    const options = column.options.map((option) => `<option value="${safeText(option)}" ${String(option) === String(value) ? "selected" : ""}>${safeText(option)}</option>`).join("");
    return `<select class="${className}" ${common}>${options}</select>`;
  }
  if (column.type === "textarea") {
    return `<textarea class="${className}" ${common}>${safeText(value)}</textarea>`;
  }
  const step = column.type === "number" ? ` step="${column.step || "0.01"}"` : "";
  return `<input class="${className}" ${common} type="${debugInputType(column)}"${step} value="${safeText(value)}" />`;
}

function debugEditableTable(columns, rows) {
  const actionColumn = { key: "__actions", label: "操作" };
  const finalColumns = [...columns, actionColumn];
  const head = finalColumns.map((column) => `<th>${safeText(column.label || column.key)}</th>`).join("");
  const body = rows
    .map((row) => {
      const invalid = [...debugValidationErrors.keys()].some((key) => key.startsWith(`${row.__scope}:${row.__id}:`));
      const changed = Object.keys(debugOverrides[row.__scope]?.[row.__id] || {}).length > 0;
      const cells = columns.map((column) => `<td>${debugEditableCell(row, column)}</td>`).join("");
      const actions = `<td><button type="button" data-debug-apply-row="${safeText(row.__scope)}:${safeText(row.__id)}">应用该行</button><button type="button" data-debug-copy-row="${safeText(row.__scope)}:${safeText(row.__id)}">复制 JSON</button></td>`;
      return `<tr class="${invalid ? "invalid" : changed ? "changed" : ""}">${cells}${actions}</tr>`;
    })
    .join("");
  return `<div class="debug-table-wrap"><table class="debug-table editable"><thead><tr>${head}</tr></thead><tbody>${body || `<tr><td colspan="${finalColumns.length}">无数据</td></tr>`}</tbody></table></div>`;
}

function parseDebugValue(rawValue, type, checked = false) {
  if (type === "boolean") return Boolean(checked);
  if (type === "number") return String(rawValue).trim() === "" ? NaN : Number(rawValue);
  return rawValue;
}

function validateDebugValue(scope, field, value) {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "数值不能为空或 NaN";
    if (/hp|damage|cooldown|interval|count|level|range|speed|radius|reward|value|weight/i.test(field) && value < 0) return "数值不能小于 0";
    if (/attackInterval|cooldown|volleyInterval/i.test(field) && value <= 0) return "间隔 / 冷却必须大于 0";
    if (/projectileCount|volleyCount/i.test(field) && (value < 1 || value > 16)) return "弹道数量 / 波数必须在合理范围内";
  }
  if (field === "rarity" && value && !["SR", "SSR", "UR", "SP", "初始", "普通", "稀有", "史诗", "传说"].includes(value)) return "rarity 不合法";
  return "";
}

function setDebugOverrideValue(scope, id, field, value) {
  debugOverrides[scope] = debugOverrides[scope] || {};
  debugOverrides[scope][id] = debugOverrides[scope][id] || {};
  if (field.startsWith("debugParams.")) {
    const key = field.split(".")[1];
    debugOverrides[scope][id].debugParams = debugOverrides[scope][id].debugParams || {};
    debugOverrides[scope][id].debugParams[key] = value;
  } else {
    debugOverrides[scope][id][field] = value;
  }
}

function handleDebugFieldChange(input) {
  const scope = input.dataset.scope;
  const id = input.dataset.id;
  const field = input.dataset.field;
  const type = input.dataset.type || "text";
  const value = parseDebugValue(input.value, type, input.checked);
  const finalValue = field === "requires" && typeof value === "string" ? value.split(",").map((item) => item.trim()).filter(Boolean) : value;
  const errorKey = `${scope}:${id}:${field}`;
  const error = validateDebugValue(scope, field, finalValue);
  input.classList.toggle("invalid", Boolean(error));
  if (error) debugValidationErrors.set(errorKey, error);
  else debugValidationErrors.delete(errorKey);
  setDebugOverrideValue(scope, id, field, finalValue);
  input.classList.add("changed");
  renderDebugValidation();
}

function syncDebugFieldsFromDom() {
  debugContent.querySelectorAll("[data-debug-field].changed").forEach((input) => handleDebugFieldChange(input));
  if (document.activeElement?.matches?.("[data-debug-field]")) handleDebugFieldChange(document.activeElement);
}

function markDebugContentDirty() {
  debugContentDirty = true;
}

function renderDebugValidation() {
  const existing = debugContent.querySelector(".debug-errors");
  if (existing) existing.remove();
  if (!debugValidationErrors.size) return;
  const div = document.createElement("div");
  div.className = "debug-errors";
  div.textContent = [...debugValidationErrors.values()].join("；");
  debugContent.prepend(div);
}

function debugRowData(scope, id) {
  const sources = {
    characters: DATA.roles,
    enemies: DATA.enemies,
    artifacts: DATA.artifacts,
    formations: DATA.formations,
  };
  if (sources[scope]) return sources[scope][id] || {};
  if (scope === "martialArts") return (DATA.martialArts || []).find((item) => item.id === id) || {};
  if (scope === "upgrades") return QINGYA_BRANCH_UPGRADES.find((item) => item.id === id) || {};
  if (scope === "perks") return getDebugPerkRows().find((item) => item.id === id) || {};
  if (scope === "waves") return getDebugWaveRows().find((item) => item.__id === id) || {};
  return {};
}

function copyDebugRow(scope, id) {
  const payload = {
    id,
    overrides: debugOverrides[scope]?.[id] || {},
    merged: debugRowData(scope, id),
  };
  copyDebugText(JSON.stringify(payload, null, 2));
}

function copyDebugText(text) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function getRoleAttackDebug(roleId) {
  const deployed = state.deployedRoles.find((item) => item.roleId === roleId);
  const role = deployed || { roleId, personalDamage: 1, personalSpeed: 1 };
  const config = DATA.roles[roleId];
  if (!config) return {};
  const art = martialBonuses(roleId);
  const projectileConfig = projectileDefaults(config, art);
  const stats = deployed ? roleStats(role) : null;
  const baseProjectileCount = config.trajectoryType === "multi" ? 3 : 1;
  const projectileCount = Math.min(art.giantSword ? 1 : 5, Math.max(art.projectileSet || 0, baseProjectileCount + state.bonuses.sideProjectiles + art.projectileAdd));
  const baseDamage = stats ? stats.damage : getCharacterBaseFinalDamage(config) * art.damageMult * state.bonuses.roleDamage;
  const singleProjectileDamage = baseDamage * (art.giantSword ? art.giantSwordDamageMult : 1);
  const interval = stats ? stats.interval : ((config.attackInterval || 1 / (config.baseAttackSpeed || 1)) * art.attackIntervalMult * art.giantSwordIntervalMult) / (state.bonuses.roleAttackSpeed * art.attackSpeed);
  return {
    projectileCount,
    volleyCount: art.giantSword ? 1 : art.volleyCount,
    volleyInterval: art.volleyInterval,
    damageMultiplier: art.damageMult,
    attackIntervalMultiplier: art.attackIntervalMult * art.giantSwordIntervalMult,
    pierceCount: art.giantSword ? 6 + state.bonuses.pierceAdd : art.pierceAdd + state.bonuses.pierceAdd,
    projectileType: art.giantSword ? "giant_sword_projectile" : config.projectileType,
    projectileSpeed: projectileConfig.speed,
    hitRadius: projectileConfig.hitRadius || projectileConfig.radius,
    collisionPadding: projectileConfig.collisionPadding,
    singleProjectileDamage,
    attackInterval: interval,
    totalProjectiles: projectileCount * (art.giantSword ? 1 : art.volleyCount),
    isGiantSword: art.giantSword,
  };
}

function getDebugStateRows() {
  const snapshot = getDebugSnapshot();
  return [
    ["APP_STATE", snapshot.APP_STATE],
    ["wave", snapshot.wave],
    ["arrayCoreHp / arrayCoreMaxHp", `${snapshot.arrayCoreHp} / ${snapshot.arrayCoreMaxHp}`],
    ["arrayCoreDefense", snapshot.arrayCoreDefense],
    ["runState.level", snapshot["player.level"]],
    ["spiritQi / nextLevelSpiritQi", `${snapshot["player.spiritQi"]} / ${snapshot["player.nextLevelSpiritQi"]}`],
    ["enemies.length", snapshot["enemies.length"]],
    ["projectiles.length", snapshot["projectiles.length"]],
    ["playerProfile.loadedFromLocalStorage", snapshot["profile.loadedFromLocalStorage"]],
    ["playerProfile.playerLevel", snapshot["profile.playerLevel"]],
    ["playerProfile.playerExp", snapshot["profile.playerExp"]],
    ["playerProfile.spiritStones", snapshot["profile.spiritStones"]],
    ["playerProfile.ownedCharacterCount", snapshot["profile.ownedCharacterCount"]],
    ["playerProfile.characterLevels", snapshot["profile.characterLevels"]],
    ["playerProfile.highestWave", snapshot["profile.highestWave"]],
    ["playerProfile.totalKills", snapshot["profile.totalKills"]],
    ["当前上阵角色", state.deployedRoles.map((role) => DATA.roles[role.roleId]?.name || role.roleId).join(", ")],
    ["当前携带法宝", DATA.artifacts[state.selectedArtifactId]?.name || state.selectedArtifactId || ""],
  ].map(([key, value]) => ({ key, value }));
}

function getDebugRoleRows() {
  return Object.values(DATA.roles).map((role) => {
    const attack = getRoleAttackDebug(role.id);
    return {
      id: role.id,
      __scope: "characters",
      __id: role.id,
      name: role.name,
      rarity: role.rarity,
      rankTitle: role.rankTitle || role.rank || "",
      school: role.school,
      role: role.role || "",
      baseDamage: role.baseDamage,
      baseAttackSpeed: role.baseAttackSpeed,
      baseRange: role.baseRange || role.range,
      owned: playerMeta.ownedCharacters.includes(role.id),
      deployed: state.deployedRoles.some((item) => item.roleId === role.id),
      level: getCharacterLevel(role.id),
      damage: attack.singleProjectileDamage || role.baseDamage,
      interval: attack.attackInterval || role.attackInterval,
      projectileType: role.projectileType,
      trajectoryType: role.trajectoryType,
      passiveSkill: role.passiveSkill || "",
      unlockType: role.unlockType || "",
      unlockLevel: role.unlockLevel ?? "",
    };
  });
}

function getDebugArtifactRows() {
  return Object.values(DATA.artifacts || {}).map((artifact) => ({
    id: artifact.id,
    __scope: "artifacts",
    __id: artifact.id,
    name: artifact.name,
    rarity: artifact.rarity || "",
    owned: playerMeta.ownedArtifacts.includes(artifact.id),
    selected: state.selectedArtifactId === artifact.id,
    damage: artifact.damage,
    cooldown: artifact.cooldown,
    projectileType: artifact.projectileType || "",
    effectType: artifact.effectType || "",
    targetRule: artifact.targetRule || artifact.targeting || "",
    description: artifact.description || artifact.attackText || "",
    runtimeCooldown: state.selectedArtifactId === artifact.id ? state.artifactCooldown : "",
  }));
}

function getDebugMartialRows() {
  return (DATA.martialArts || []).map((art) => {
    const selectedUpgradeIds = Object.keys(getMartialBranchState(art.id)).filter((id) => getMartialBranchState(art.id)[id]);
    const attack = getRoleAttackDebug(art.ownerCharacterId);
    return {
      martialArtId: art.id,
      id: art.id,
      __scope: "martialArts",
      __id: art.id,
      name: art.name,
      ownerCharacterId: art.ownerCharacterId,
      maxLevel: art.maxLevel,
      martialArtLevel: state.martialArtLevels[art.id] || 0,
      selectedUpgradeIds,
      minorEvolutionSelected: selectedUpgradeIds.some((id) => QINGYA_BRANCH_UPGRADES.find((upgrade) => upgrade.id === id)?.type === "minor"),
      majorEvolutionSelected: selectedUpgradeIds.some((id) => QINGYA_BRANCH_UPGRADES.find((upgrade) => upgrade.id === id)?.type === "major"),
      projectileCount: attack.projectileCount,
      volleyCount: attack.volleyCount,
      volleyInterval: attack.volleyInterval,
      damageMultiplier: attack.damageMultiplier,
      attackIntervalMultiplier: attack.attackIntervalMultiplier,
      pierceCount: attack.pierceCount,
      projectileType: attack.projectileType || art.projectileType,
      baseProjectileType: art.projectileType,
      majorEvolutionId: attack.isGiantSword ? "qingya_major_giant_sword" : "",
      projectileSpeed: attack.projectileSpeed,
      hitRadius: attack.hitRadius,
      collisionPadding: attack.collisionPadding,
      singleProjectileDamage: attack.singleProjectileDamage,
      attackInterval: attack.attackInterval,
      totalProjectiles: attack.totalProjectiles,
      isGiantSword: attack.isGiantSword,
    };
  });
}

function getQingyaUpgradeInvalidReason(upgrade) {
  return getSystemQingyaUpgradeInvalidReason({ state, upgrade, helpers: createUpgradeContext().helpers });
}

function getDebugUpgradeRows() {
  return QINGYA_BRANCH_UPGRADES.map((upgrade) => ({
    id: upgrade.id,
    __scope: "upgrades",
    __id: upgrade.id,
    displayName: upgrade.name,
    targetType: upgrade.type === "major" || upgrade.type === "major_enhance" ? "major_evolution" : "martial_art",
    targetId: upgrade.type === "major" || upgrade.type === "major_enhance" ? "qingya_major_giant_sword" : "ma_qingya_sword",
    targetName: upgrade.type === "major" || upgrade.type === "major_enhance" ? "青崖巨阙" : "青崖剑诀",
    category: upgrade.type === "major_enhance" ? "大成专属" : upgrade.type === "minor" ? "小成" : "先天武学",
    name: upgrade.name,
    type: upgrade.type,
    requires: upgrade.requires || [],
    effectType: Object.keys(upgrade.effects || {}).join(", "),
    value: upgrade.valueText,
    weight: perkUpgradeWeight(createQingyaBranchPerk(upgrade)),
    maxStacks: 1,
    description: upgrade.description,
    selected: hasMartialBranchUpgrade("ma_qingya_sword", upgrade.id),
    selectable: qingyaBranchUpgradeAvailable(upgrade),
    invalidReason: getQingyaUpgradeInvalidReason(upgrade),
  }));
}

function getPerkInvalidReason(perk) {
  return getSystemPerkInvalidReason({ perk, context: createUpgradeContext() });
}

function getDebugPerkRows() {
  const raw = [...currentMartialArtUpgradePerks(), ...currentTargetedMartialPerks(), ...artifactPerksForRun(), ...defensivePerksForRun()].map(normalizePerk);
  const seen = new Set();
  const duplicates = new Set();
  raw.forEach((perk) => {
    const key = perkEffectKey(perk);
    if (seen.has(key)) duplicates.add(key);
    seen.add(key);
  });
  return raw.map((perk) => {
    const valid = isPerkValidForCurrentRun(perk);
    return {
      id: perk.id,
      __scope: "perks",
      __id: perk.id,
      name: perk.name,
      isValidForCurrentRun: valid,
      invalidReason: valid ? "" : getPerkInvalidReason(perk),
      isDuplicateThisRoll: duplicates.has(perkEffectKey(perk)),
      duplicateKey: perkEffectKey(perk),
      displayName: perk.name,
      targetId: getPerkTargetId(perk),
      targetName: perk.targetName || "",
      targetType: perk.targetType || perk.scope,
      effectType: perk.effect?.type || perk.effectType,
      value: perk.effect?.value ?? "",
      weight: perkUpgradeWeight(perk),
      enabled: valid,
      finalWeight: valid ? perkUpgradeWeight(perk) : 0,
      actualEffectPreview: perk.actualEffectPreview || perk.valueText || perk.description || "效果将在本局生效",
    };
  });
}

function getDebugArrayCoreRows() {
  return [
    { key: "arrayCoreMaxHp", value: state.arrayCoreMaxHp },
    { key: "arrayCoreHp", value: state.arrayCoreHp },
    { key: "arrayCoreDefense", value: state.arrayCoreDefense },
    { key: "arrayCoreDamageReduction", value: state.arrayCoreDamageReduction },
    { key: "baseHpAlias", value: state.baseHp },
    { key: "maxBaseHpAlias", value: state.maxBaseHp },
  ];
}

function getDebugEnemyRows() {
  return Object.values(DATA.enemies || {}).map((enemy) => ({
    id: enemy.id,
    __scope: "enemies",
    __id: enemy.id,
    name: enemy.name,
    hp: enemy.hp || enemy.maxHp,
    moveSpeed: enemy.moveSpeed || enemy.speed,
    attackDamage: enemy.attackDamage || enemy.baseDamage,
    attackInterval: enemy.attackInterval,
    spiritQiReward: enemy.spiritQiReward || enemy.lingqiReward,
    hitRadius: enemy.hitRadius || (enemy.isBoss ? 32 : enemy.type === "精英" ? 18 : 14),
    isElite: enemy.isElite || enemy.type === "精英",
    isBoss: Boolean(enemy.isBoss),
  }));
}

function getDebugWaveRows() {
  return (DATA.waves || []).flatMap((wave) => (wave.segments || []).map((segment, index) => ({
    id: `${wave.wave}:${index}`,
    __scope: "waves",
    __id: `${wave.wave}:${index}`,
    wave: segment.wave || wave.wave,
    enemyId: segment.enemyId,
    count: segment.count,
    spawnInterval: segment.spawnInterval,
    delay: segment.startDelay || 0,
    goal: wave.goal,
    isBossWave: Boolean(wave.isBossWave),
    active: state.wave === wave.wave,
  })));
}

function getDebugFormationRows() {
  return Object.values(DATA.formations || {}).map((formation) => ({
    id: formation.id,
    __scope: "formations",
    __id: formation.id,
    name: formation.name,
    triggerType: formation.triggerType || "cooldown",
    triggerInterval: formation.triggerInterval || formation.cooldown,
    effectType: formation.effectType,
    effectValue: formation.effectValue || formation.maxTargets || "",
    cooldown: formation.cooldown,
    unlockCondition: formation.unlockCondition || formation.rarity || "",
    description: formation.description || formation.effectText || "",
  }));
}

function getDebugExportData() {
  return {
    generatedAt: new Date().toISOString(),
    snapshot: getDebugSnapshot(),
    martialArts: getDebugMartialRows(),
    upgrades: getDebugUpgradeRows(),
    perks: getDebugPerkRows(),
    roles: getDebugRoleRows(),
    artifacts: getDebugArtifactRows(),
    arrayCore: getDebugArrayCoreRows(),
    enemies: getDebugEnemyRows(),
    waves: getDebugWaveRows(),
    playerProfile: playerMeta,
  };
}

function getMergedDebugData() {
  return {
    characters: DATA.roles,
    martialArts: DATA.martialArts,
    upgrades: QINGYA_BRANCH_UPGRADES,
    perks: getDebugPerkRows(),
    enemies: DATA.enemies,
    waves: DATA.waves,
    artifacts: DATA.artifacts,
    formations: DATA.formations,
  };
}

function renderDebugTabs() {
  const renderKey = `${activeDebugTab}|${DEBUG_TABS.join("|")}`;
  if (debugTabsRenderKey === renderKey) return;
  debugTabsRenderKey = renderKey;
  debugTabs.innerHTML = DEBUG_TABS.map((tab) => `<button type="button" data-debug-tab="${safeText(tab)}" class="${tab === activeDebugTab ? "active" : ""}">${safeText(tab)}</button>`).join("");
}

function renderDebugActions() {
  const actions = [
    ["refresh", "刷新运行时数据"],
    ["toggleEdit", debugEditMode ? "编辑模式：开" : "编辑模式：关"],
    ["applyRun", "应用本局"],
    ["save", "保存到本地调试数据"],
    ["savePlayerProfile", "保存玩家存档"],
    ["reset", "重置调试数据"],
    ["clearPlayerProfile", "清空玩家存档"],
    ["export", "导出 JSON"],
    ["grantLingqi100", "+100 灵气"],
    ["levelUp", "本局升一级"],
    ["qingyaLv3", "陆青崖武学 Lv3"],
    ["qingyaLv6", "陆青崖武学 Lv6"],
    ["qingyaLv7", "陆青崖武学 Lv7"],
    ["jumpWave5", "跳到第5波"],
    ["jumpWave10", "跳到第10波"],
    ["healCore", "阵眼回满血"],
    ["clearEnemies", "清空怪物"],
    ["clearProjectiles", "清空弹道"],
    ["grantSpiritStones1000", "+1000 灵石"],
    ["unlockAllCharacters", "解锁全部角色"],
  ];
  const renderKey = actions.map(([id, label]) => `${id}:${label}`).join("|");
  if (debugActionsRenderKey === renderKey) return;
  debugActionsRenderKey = renderKey;
  debugActionsPanel.innerHTML = actions.map(([id, label]) => `<button type="button" data-debug-action="${id}">${safeText(label)}</button>`).join("");
}

function renderDebugContent() {
  const rarityOptions = ["SR", "SSR", "UR", "SP", "初始", "普通", "稀有", "史诗", "传说"];
  if (activeDebugTab === "状态") {
    debugContent.innerHTML = debugTable([{ key: "key", label: "字段" }, { key: "value", label: "当前值" }], getDebugStateRows());
  } else if (activeDebugTab === "角色") {
    debugContent.innerHTML = debugEditableTable([{ key: "id" }, { key: "name", editable: true }, { key: "rarity", editable: true, options: ["SR", "SSR", "UR", "SP"] }, { key: "rankTitle", editable: true }, { key: "school", editable: true }, { key: "role", editable: true }, { key: "baseDamage", editable: true, type: "number" }, { key: "baseAttackSpeed", editable: true, type: "number" }, { key: "baseRange", editable: true, type: "number" }, { key: "projectileType", editable: true }, { key: "trajectoryType", editable: true }, { key: "passiveSkill", editable: true }, { key: "unlockType", editable: true }, { key: "unlockLevel", editable: true, type: "number" }, { key: "owned" }, { key: "deployed" }], getDebugRoleRows());
  } else if (activeDebugTab === "先天武学") {
    debugContent.innerHTML = debugEditableTable([{ key: "martialArtId" }, { key: "name", editable: true }, { key: "ownerCharacterId", editable: true }, { key: "maxLevel", editable: true, type: "number" }, { key: "baseProjectileType", label: "projectileType", editable: true, field: "projectileType" }, { key: "martialArtLevel" }, { key: "selectedUpgradeIds" }, { key: "minorEvolutionSelected" }, { key: "majorEvolutionSelected" }, { key: "projectileCount", editable: true, type: "number", field: "debugParams.projectileCount" }, { key: "volleyCount", editable: true, type: "number", field: "debugParams.volleyCount" }, { key: "volleyInterval", editable: true, type: "number", field: "debugParams.volleyInterval" }, { key: "damageMultiplier", editable: true, type: "number", field: "debugParams.damageMultiplier" }, { key: "attackIntervalMultiplier", editable: true, type: "number", field: "debugParams.attackIntervalMultiplier" }, { key: "pierceCount", editable: true, type: "number", field: "debugParams.pierceCount" }, { key: "projectileSpeed" }, { key: "majorEvolutionId" }, { key: "singleProjectileDamage" }, { key: "attackInterval" }, { key: "totalProjectiles" }, { key: "isGiantSword" }], getDebugMartialRows()) + "<h3>升级节点</h3>" + debugEditableTable([{ key: "id" }, { key: "displayName", editable: true, field: "name" }, { key: "targetType", editable: true }, { key: "targetId", editable: true }, { key: "targetName", editable: true }, { key: "category", editable: true }, { key: "effectType", editable: true }, { key: "value", editable: true, field: "valueText" }, { key: "weight", editable: true, type: "number" }, { key: "requires", editable: true }, { key: "maxStacks", editable: true, type: "number" }, { key: "description", editable: true, type: "textarea" }, { key: "selected" }, { key: "selectable" }, { key: "invalidReason" }], getDebugUpgradeRows());
  } else if (activeDebugTab === "机缘 / 升级候选") {
    debugContent.innerHTML = debugEditableTable([{ key: "id" }, { key: "displayName", editable: true, field: "name" }, { key: "targetType", editable: true }, { key: "targetId", editable: true }, { key: "targetName", editable: true }, { key: "category", editable: true }, { key: "effectType", editable: true }, { key: "value", editable: true, type: "number" }, { key: "weight", editable: true, type: "number" }, { key: "enabled", editable: true, type: "boolean" }, { key: "description", editable: true, type: "textarea" }, { key: "isValidForCurrentRun" }, { key: "invalidReason" }, { key: "isDuplicateThisRoll" }, { key: "duplicateKey" }, { key: "actualEffectPreview" }, { key: "finalWeight" }], getDebugPerkRows());
  } else if (activeDebugTab === "怪物") {
    debugContent.innerHTML = debugEditableTable([{ key: "id" }, { key: "name", editable: true }, { key: "hp", editable: true, type: "number" }, { key: "moveSpeed", editable: true, type: "number" }, { key: "attackDamage", editable: true, type: "number" }, { key: "attackInterval", editable: true, type: "number" }, { key: "spiritQiReward", editable: true, type: "number" }, { key: "hitRadius", editable: true, type: "number" }, { key: "isElite", editable: true, type: "boolean" }, { key: "isBoss", editable: true, type: "boolean" }], getDebugEnemyRows());
  } else if (activeDebugTab === "波次") {
    debugContent.innerHTML = debugEditableTable([{ key: "wave", editable: true, type: "number" }, { key: "enemyId", editable: true }, { key: "count", editable: true, type: "number" }, { key: "spawnInterval", editable: true, type: "number" }, { key: "delay", editable: true, type: "number", field: "startDelay" }, { key: "goal", editable: true }, { key: "isBossWave", editable: true, type: "boolean" }, { key: "active" }], getDebugWaveRows());
  } else if (activeDebugTab === "法宝") {
    debugContent.innerHTML = debugEditableTable([{ key: "id" }, { key: "name", editable: true }, { key: "rarity", editable: true, options: rarityOptions }, { key: "damage", editable: true, type: "number" }, { key: "cooldown", editable: true, type: "number" }, { key: "projectileType", editable: true }, { key: "effectType", editable: true }, { key: "targetRule", editable: true, field: "targeting" }, { key: "description", editable: true, type: "textarea", field: "attackText" }, { key: "owned" }, { key: "selected" }, { key: "runtimeCooldown" }], getDebugArtifactRows());
  } else if (activeDebugTab === "护山大阵") {
    debugContent.innerHTML = debugEditableTable([{ key: "id" }, { key: "name", editable: true }, { key: "triggerType", editable: true }, { key: "triggerInterval", editable: true, type: "number" }, { key: "effectType", editable: true }, { key: "effectValue", editable: true, type: "number", field: "maxTargets" }, { key: "cooldown", editable: true, type: "number" }, { key: "unlockCondition", editable: true, field: "rarity" }, { key: "description", editable: true, type: "textarea", field: "effectText" }], getDebugFormationRows()) + debugTable([{ key: "key", label: "字段" }, { key: "value", label: "当前值" }], getDebugArrayCoreRows());
  }
}

function renderDebugNotice() {
  const existing = debugContent.querySelector(".debug-notice");
  if (existing) existing.remove();
  if (!debugNoticeText) return;
  const div = document.createElement("div");
  div.className = "debug-notice";
  div.textContent = debugNoticeText;
  debugContent.prepend(div);
}

function saveDebugData() {
  if (debugValidationErrors.size) {
    setStatus("调试表存在非法输入，无法保存。");
    return;
  }
  saveStoredDebugData(debugOverrides, getDebugExportData());
}

function applyDebugOverridesForRun() {
  syncDebugFieldsFromDom();
  if (debugValidationErrors.size) {
    setStatus("调试表存在非法输入，无法应用。");
    return;
  }
  refreshRuntimeFromDebugData();
  debugNoticeText = "已应用";
  setStatus("已应用本局调试覆盖。");
  renderDebugNotice();
}

function resetDebugData() {
  if (!confirm("确认清空本地调试覆盖数据？")) return;
  debugOverrides = createEmptyDebugOverrides();
  debugValidationErrors = new Map();
  applyDebugOverridesToData();
  resetStoredDebugData();
  refreshRuntimeFromDebugData();
}

function exportDebugJson() {
  debugExportOpen = true;
  const payload = {
    debugOverrides,
    mergedData: getMergedDebugData(),
  };
  debugContent.innerHTML = `<div class="debug-export"><button type="button" data-debug-copy-export="overrides">复制 debugOverrides</button><button type="button" data-debug-copy-export="merged">复制 mergedData</button><textarea class="debug-json" readonly>${safeText(JSON.stringify(payload, null, 2))}</textarea></div>`;
}

function setQingyaDebugLevel(level) {
  const picks = {
    3: ["qingya_projectile_1", "qingya_volley_1", "qingya_minor_projectile"],
    6: ["qingya_projectile_1", "qingya_volley_1", "qingya_minor_projectile", "qingya_projectile_2", "qingya_volley_2", "qingya_damage_1"],
    7: ["qingya_projectile_1", "qingya_volley_1", "qingya_minor_projectile", "qingya_projectile_2", "qingya_volley_2", "qingya_damage_1", "qingya_major_giant_sword"],
  }[level] || [];
  state.martialArtLevels.ma_qingya_sword = level;
  state.martialArtBranches.ma_qingya_sword = {};
  picks.forEach((id) => {
    state.martialArtBranches.ma_qingya_sword[id] = true;
  });
}

function jumpToWave(wave) {
  return jumpToSystemWave({
    state,
    DATA,
    waveNumber: wave,
    callbacks: {
      clearEnemies() {
        state.enemies = [];
      },
      clearProjectiles() {
        state.projectiles = [];
      },
    },
  });
}

function healArrayCoreFull() {
  return healSystemArrayCoreFull({ state });
}

function unlockAllCharacters() {
  playerMeta.ownedCharacters = Object.keys(DATA.roles);
  Object.keys(DATA.roles).forEach((id) => {
    playerMeta.characterLevels[id] = playerMeta.characterLevels[id] || 1;
  });
  syncPlayerMetaAliases();
  savePlayerProfile();
}

function clearPlayerProfileWithConfirm() {
  if (!window.confirm("确定清空玩家存档？")) return;
  resetStoredPlayerProfile();
  playerProfileLoadedFromStorage = false;
  applyPlayerProfile(createDefaultPlayerProfile());
  playerProfileSaveSuppressed = true;
  resetGame();
  playerProfileSaveSuppressed = false;
  debugNoticeText = "玩家存档已清空";
  setStatus("玩家存档已清空");
}

function updateDebugPanel() {
  if (!debugPanel || debugPanel.classList.contains("hidden")) return;
  if (debugExportOpen) return;
  if (debugEditMode && document.activeElement?.matches?.("[data-debug-field]")) return;
  renderDebugTabs();
  renderDebugActions();
  if (activeDebugTab === "状态" || debugContentDirty) {
    renderDebugContent();
    debugContentDirty = false;
  }
  renderDebugNotice();
  renderDebugValidation();
}

function runDebugAction(action) {
  const handlers = {
    refresh: () => markDebugContentDirty(),
    toggleEdit: () => {
      debugEditMode = !debugEditMode;
      debugActionsRenderKey = "";
      markDebugContentDirty();
    },
    applyRun: () => applyDebugOverridesForRun(),
    save: () => saveDebugData(),
    savePlayerProfile: () => {
      if (savePlayerProfile()) {
        debugNoticeText = "玩家存档已保存";
        setStatus("玩家存档已保存");
      }
    },
    reset: () => resetDebugData(),
    clearPlayerProfile: () => clearPlayerProfileWithConfirm(),
    export: () => exportDebugJson(),
    grantLingqi100: () => getDebugActions().grantLingqi(100),
    levelUp: () => getDebugActions().grantLingqi(Math.max(1, nextLevelRequirement() - state.lingqi)),
    qingyaLv3: () => setQingyaDebugLevel(3),
    qingyaLv6: () => setQingyaDebugLevel(6),
    qingyaLv7: () => setQingyaDebugLevel(7),
    jumpWave5: () => jumpToWave(5),
    jumpWave10: () => jumpToWave(10),
    healCore: () => healArrayCoreFull(),
    clearEnemies: () => {
      state.enemies = [];
    },
    clearProjectiles: () => {
      state.projectiles = [];
    },
    grantSpiritStones1000: () => getDebugActions().grantSpiritStones(1000),
    unlockAllCharacters: () => unlockAllCharacters(),
  };
  const handler = handlers[action];
  if (!handler) return;
  handler();
  if (action === "export") return;
  debugExportOpen = false;
  if (!["applyRun", "savePlayerProfile", "clearPlayerProfile"].includes(action)) debugNoticeText = "";
  renderLobby();
  renderLoadout();
  updateUi();
  markDebugContentDirty();
  updateDebugPanel();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawFormationArea();
  state.zones.forEach(drawZone);
  state.deployedRoles.forEach(drawRole);
  state.enemies.forEach(drawEnemy);
  state.projectiles.forEach(drawProjectile);
  state.floaters.forEach(drawFloater);
  drawBossBar();
}

function drawGrid() {
  for (let row = 0; row < grid.rows; row += 1) {
    for (let col = 0; col < grid.columns; col += 1) {
      ctx.fillStyle =
        row === 0
          ? "#263a2b"
          : row === grid.rows - 1
          ? "#3b2f25"
          : "#20362a";
      ctx.fillRect(col * grid.cellW, row * grid.cellH, grid.cellW - 1, grid.cellH - 1);
      if (isDeployable(col, row)) {
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

function drawFormationArea() {
  const formation = DATA.formations[state.selectedFormationId];
  if (!formation) return;
  ctx.strokeStyle = "rgba(92, 219, 149, 0.75)";
  ctx.lineWidth = 3;
  ctx.strokeRect(2, (grid.rows - 1) * grid.cellH + 2, canvas.width - 4, grid.cellH - 4);
  ctx.strokeStyle = "rgba(255, 154, 118, 0.65)";
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(0, attackLineY());
  ctx.lineTo(canvas.width, attackLineY());
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawRole(role) {
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

function drawEnemy(enemy) {
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

function drawProjectile(projectile) {
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

function drawZone(zone) {
  ctx.fillStyle = zone.color;
  ctx.beginPath();
  ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawFloater(floater) {
  ctx.fillStyle = floater.color;
  ctx.font = "bold 16px Microsoft YaHei";
  ctx.textAlign = "center";
  ctx.fillText(floater.text, floater.x, floater.y);
}

function drawBossBar() {
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

function makeId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loop(timestamp) {
  state.animationFrameRunning = true;
  state.frameCount = (state.frameCount || 0) + 1;
  const dt = Math.min(0.05, (timestamp - state.lastTime) / 1000 || 0);
  state.lastTime = timestamp;
  update(dt);
  draw();
  updateDebugPanel();
  requestAnimationFrame(loop);
}

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
  const col = Math.floor(x / grid.cellW);
  const row = Math.floor(y / grid.cellH);
  deployRole(col, row);
});

goLoadoutButton.addEventListener("click", enterLoadout);
enterDeployButton.addEventListener("click", enterDeploy);
startButton.addEventListener("click", startRun);
returnLobbyButton.addEventListener("click", resetGame);
roleUpgradeButton.addEventListener("click", () => {
  const first = playerMeta.ownedCharacters[0];
  if (first) upgradeCharacter(first);
});
gachaButton.addEventListener("click", () => {
  performGacha();
});
debugToggle.addEventListener("click", () => {
  debugExportOpen = false;
  markDebugContentDirty();
  debugPanel.classList.remove("hidden");
  updateDebugPanel();
});
debugClose.addEventListener("click", () => {
  debugPanel.classList.add("hidden");
});
debugTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-debug-tab]");
  if (!button) return;
  debugExportOpen = false;
  activeDebugTab = button.dataset.debugTab;
  markDebugContentDirty();
  updateDebugPanel();
});
debugActionsPanel.addEventListener("click", (event) => {
  const button = event.target.closest("[data-debug-action]");
  if (!button) return;
  runDebugAction(button.dataset.debugAction);
});
debugContent.addEventListener("input", (event) => {
  if (event.target.matches("[data-debug-field]")) handleDebugFieldChange(event.target);
});
debugContent.addEventListener("change", (event) => {
  if (event.target.matches("[data-debug-field]")) handleDebugFieldChange(event.target);
});
debugContent.addEventListener("click", (event) => {
  const applyRow = event.target.closest("[data-debug-apply-row]");
  if (applyRow) {
    if (!debugValidationErrors.size) applyDebugOverridesForRun();
    markDebugContentDirty();
    updateDebugPanel();
    return;
  }
  const copyRow = event.target.closest("[data-debug-copy-row]");
  if (copyRow) {
    const [scope, ...idParts] = copyRow.dataset.debugCopyRow.split(":");
    copyDebugRow(scope, idParts.join(":"));
    return;
  }
  const exportButton = event.target.closest("[data-debug-copy-export]");
  if (exportButton) {
    const payload = exportButton.dataset.debugCopyExport === "merged" ? getMergedDebugData() : debugOverrides;
    copyDebugText(JSON.stringify(payload, null, 2));
  }
});

applyPlayerProfile(loadPlayerProfile());
resetGame();
requestAnimationFrame(loop);

