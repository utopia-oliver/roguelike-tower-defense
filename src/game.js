const DATA = window.GAME_DATA;

window.__TEST_ERRORS__ = window.__TEST_ERRORS__ || [];
window.addEventListener("error", (event) => {
  window.__TEST_ERRORS__.push(event.message || String(event.error));
});
window.addEventListener("unhandledrejection", (event) => {
  window.__TEST_ERRORS__.push(event.reason && event.reason.message ? event.reason.message : String(event.reason));
});

const titleView = document.querySelector("#titleView");
const mainHubView = document.querySelector("#mainHubView");
const featurePageView = document.querySelector("#featurePageView");
const lobbyView = document.querySelector("#lobbyView");
const loadoutView = document.querySelector("#loadoutView");
const battleView = document.querySelector("#battleView");
const settlementView = document.querySelector("#settlementView");
const titleStartButton = document.querySelector("#titleStartButton");
const titleContinueButton = document.querySelector("#titleContinueButton");
const titleLoadButton = document.querySelector("#titleLoadButton");
const titleGuestButton = document.querySelector("#titleGuestButton");
const titleLoginButton = document.querySelector("#titleLoginButton");
const titleCodexButton = document.querySelector("#titleCodexButton");
const titleRealmButton = document.querySelector("#titleRealmButton");
const titleNoticeButton = document.querySelector("#titleNoticeButton");
const titleNoticeButtonSecondary = document.querySelector("#titleNoticeButtonSecondary");
const titleSettingsButton = document.querySelector("#titleSettingsButton");
const titleSettingsButtonSecondary = document.querySelector("#titleSettingsButtonSecondary");
const titleNoticeModal = document.querySelector("#titleNoticeModal");
const titleNoticeCloseButton = document.querySelector("#titleNoticeCloseButton");
const titleLoginModal = document.querySelector("#titleLoginModal");
const titleLoginContinueButton = document.querySelector("#titleLoginContinueButton");
const titleLoginBackButton = document.querySelector("#titleLoginBackButton");
const hubResourceBar = document.querySelector("#hubResourceBar");
const hubRealmButton = document.querySelector("#hubRealmButton");
const hubNoticeButton = document.querySelector("#hubNoticeButton");
const hubSettingsButton = document.querySelector("#hubSettingsButton");
const hubAdventureButton = document.querySelector("#hubAdventureButton");
const hubNodeTitle = document.querySelector("#hubNodeTitle");
const hubBottomNav = document.querySelector("#hubBottomNav");
const featurePageTitle = document.querySelector("#featurePageTitle");
const featurePageSubtitle = document.querySelector("#featurePageSubtitle");
const featurePageContent = document.querySelector("#featurePageContent");
const featureBackButton = document.querySelector("#featureBackButton");
const featureBottomNav = document.querySelector("#featureBottomNav");
const goLoadoutButton = document.querySelector("#goLoadoutButton");
const enterDeployButton = document.querySelector("#enterDeployButton");
const returnLobbyButton = document.querySelector("#returnLobbyButton");
const settlementAdventureButton = document.querySelector("#settlementAdventureButton");
const settlementCodexButton = document.querySelector("#settlementCodexButton");
const settingsModal = document.querySelector("#settingsModal");
const settingsCloseButton = document.querySelector("#settingsCloseButton");
const settingsResetButton = document.querySelector("#settingsResetButton");
const settingsNotice = document.querySelector("#settingsNotice");
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
const settlementNodeInfo = document.querySelector("#settlementNodeInfo");
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
const ARTIFACT_SLOT_UNLOCKS = DATA.artifactSlotUnlocks || [];
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
  isEnemyAlive,
  isEnemyTargetable,
  updateEnemies: updateSystemEnemies,
} = window.XM.Enemies;
const {
  advanceWave: advanceSystemWave,
  jumpToWave: jumpToSystemWave,
  startWave: startSystemWave,
  updateWaveSpawns: updateSystemWaveSpawns,
} = window.XM.Waves;
const {
  getActiveArtifactBonds,
  getArtifactModifier: getSystemArtifactModifier,
  getArtifactRuntimeState: getSystemArtifactRuntimeState,
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
  getMaxArtifactSlots: getSystemMaxArtifactSlots,
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
const {
  renderFeaturePage: renderSystemFeaturePage,
  renderHud: renderSystemHud,
  renderLoadout: renderSystemLoadout,
  renderLobby: renderSystemLobby,
  renderMainHub: renderSystemMainHub,
  renderPerkChoiceCard: renderSystemPerkChoiceCard,
  renderSetupLists: renderSystemSetupLists,
  renderSettlement: renderSystemSettlement,
} = window.XM.Render;
const {
  draw: drawCanvas,
  drawBossBar: drawCanvasBossBar,
  drawEnemy: drawCanvasEnemy,
  drawFloater: drawCanvasFloater,
  drawFormationArea: drawCanvasFormationArea,
  drawGrid: drawCanvasGrid,
  drawProjectile: drawCanvasProjectile,
  drawRole: drawCanvasRole,
  drawZone: drawCanvasZone,
} = window.XM.CanvasRender;
let activeDebugTab = "状态";
let debugEditMode = false;
let debugExportOpen = false;
let debugContentDirty = true;
let debugTabsRenderKey = "";
let debugActionsRenderKey = "";
let debugNoticeText = "";
let debugValidationErrors = new Map();
let debugSelectedChapterId = "chapter_1";
let debugSelectedNodeId = "chapter1_1";
let debugSelectedRoleId = "";
let debugSelectedArtifactId = "";
let debugSelectedFormationId = "";
let debugSelectedEnemyId = "";
let debugPerkFilter = "all";
const DEBUG_UI_STATE = {
  targetWaveInput: null,
};
let featureReturnState = APP_STATE.MAIN_HUB;
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
    name: "玄河守势",
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
  ownedArtifacts: [...(DATA.initial.artifacts || [DATA.initial.artifact]).filter(Boolean)],
  artifactLevels: {},
  maxArtifactSlots: 1,
  unlockedFormations: DATA.initial.formations || [DATA.initial.formation],
  formationLevels: {},
  arrayCoreLevel: 1,
  arrayCoreBaseHpBonus: 0,
  arrayCoreDefenseBonus: 0,
  chapterProgress: createStoredDefaultPlayerProfile({ chapters: DATA.chapters }).chapterProgress,
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
    getMaxArtifactSlots,
  });
}

function getPlayerLevelExpRequirement(level) {
  return getSystemPlayerLevelExpRequirement(level);
}

function getMaxDeploySlots(level = playerMeta.playerLevel) {
  return getSystemMaxDeploySlots({ level, deploySlotUnlocks: DEPLOY_SLOT_UNLOCKS });
}

function getMaxArtifactSlots(level = playerMeta.playerLevel) {
  return getSystemMaxArtifactSlots({ level, artifactSlotUnlocks: ARTIFACT_SLOT_UNLOCKS });
}

function playerProfileStorageHelpers() {
  return {
    initialRoles: DATA.initial.roles,
    initialArtifact: DATA.initial.artifact,
    initialArtifacts: DATA.initial.artifacts || [DATA.initial.artifact].filter(Boolean),
    initialFormation: DATA.initial.formation,
    initialFormations: DATA.initial.formations || Object.keys(DATA.formations || {}),
    roles: DATA.roles,
    artifacts: DATA.artifacts,
    formations: DATA.formations,
    chapters: DATA.chapters,
    getMaxDeploySlots,
    getMaxArtifactSlots,
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
  (DATA.initial.formations || Object.keys(DATA.formations || {})).forEach((id) => {
    if (!playerMeta.unlockedFormations.includes(id)) playerMeta.unlockedFormations.push(id);
  });
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
    artifactSlotUnlocks: ARTIFACT_SLOT_UNLOCKS,
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
    artifactSlotUnlocks: ARTIFACT_SLOT_UNLOCKS,
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
      : `抽到重复角色 ${result.character.rarity} ${result.character.name}，返还 ${DUPLICATE_GACHA_REFUND} 灵石。`,
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

function resetGame(targetAppState = APP_STATE.TITLE) {
  applyPlayerLevelUnlocks();
  syncPlayerMetaAliases();
  const arrayCore = initialArrayCoreState();
  const targetPhase = targetAppState === APP_STATE.TITLE
    ? "title"
    : targetAppState === APP_STATE.MAIN_HUB
      ? "main_hub"
      : HUB_PAGE_STATES.has(targetAppState)
        ? "hub_page"
        : "lobby";
  featureReturnState = targetAppState === APP_STATE.CODEX && featureReturnState === APP_STATE.TITLE
    ? APP_STATE.TITLE
    : APP_STATE.MAIN_HUB;
  Object.assign(state, {
    appState: targetAppState,
    phase: targetPhase,
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
    loadoutArtifactIds: [],
    selectedFormationId: "",
    selectedRoleId: "",
    selectedArtifactId: "",
    selectedArtifactIds: [],
    waveActive: false,
    martialArtLevels: {},
    martialArtBranches: createInitialMartialBranchState(),
    formationCooldown: 0,
    formationRuntime: {},
    formationCoreDamageReduction: 0,
    formationSpiritQiGainMultiplier: 1,
    artifactCooldown: 0,
    artifactCooldowns: {},
    artifactRuntime: {},
    artifactBondRuntime: {},
    animationFrameRunning: false,
    frameCount: 0,
    lastError: "",
    lastTime: 0,
    status: "山门待命。先在宗门主界面整备，再从历练进入战前配置。",
    bonuses: defaultRunBonuses(),
    modifiers: createInitialModifiers(),
    selectedAdventureChapterId: playerMeta.chapterProgress?.chapter_1 ? "chapter_1" : "",
    selectedAdventureNodeId: getCurrentChapterNodeId("chapter_1"),
    currentChapterId: "",
    currentNodeId: "",
    currentBattleConfigId: "",
    lastChallengeChapterId: "",
    lastChallengeNodeId: "",
    lastBattleConfigId: "",
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
      state.loadoutArtifactIds = playerMeta.ownedArtifacts.slice(0, playerMeta.maxArtifactSlots);
      state.loadoutArtifactId = state.loadoutArtifactIds[0] || "";
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

const HUB_PAGE_STATES = new Set([
  APP_STATE.CHARACTERS,
  APP_STATE.ARTIFACTS,
  APP_STATE.FORMATIONS,
  APP_STATE.BAG,
  APP_STATE.GACHA,
  APP_STATE.CODEX,
  APP_STATE.ADVENTURE,
]);

function showView(view) {
  [titleView, mainHubView, featurePageView, lobbyView, loadoutView, battleView, settlementView].forEach((item) => {
    item.classList.toggle("hidden", item !== view);
  });
}

function enterTitle() {
  state.appState = APP_STATE.TITLE;
  state.phase = "title";
  updateUi();
}

function enterMainHub(notice = "") {
  applyPlayerLevelUnlocks();
  syncPlayerMetaAliases();
  state.appState = APP_STATE.MAIN_HUB;
  state.phase = "main_hub";
  if (notice) setStatus(notice);
  updateUi();
}

function enterHubPage(page, returnState = APP_STATE.MAIN_HUB) {
  if (!HUB_PAGE_STATES.has(page)) return;
  if (page === APP_STATE.ADVENTURE) state.adventureDetailOpen = false;
  featureReturnState = returnState;
  state.appState = page;
  state.phase = "hub_page";
  updateUi();
}

function openSettings(notice = "") {
  if (!settingsModal) return;
  settingsNotice.textContent = notice;
  settingsModal.classList.remove("hidden");
}

function closeSettings() {
  settingsModal?.classList.add("hidden");
}

function openTitleNotice() {
  titleNoticeModal?.classList.remove("hidden");
}

function closeTitleNotice() {
  titleNoticeModal?.classList.add("hidden");
}

function openTitleLogin() {
  titleLoginModal?.classList.remove("hidden");
}

function closeTitleLogin() {
  titleLoginModal?.classList.add("hidden");
}

function enterLocalTrial(notice = "") {
  closeTitleLogin();
  enterMainHub(notice);
}

function getChapter(chapterId = "chapter_1") {
  return DATA.chapters?.[chapterId] || null;
}

function getChapterProgress(chapterId = "chapter_1") {
  if (!playerMeta.chapterProgress) playerMeta.chapterProgress = normalizePlayerProfile(playerMeta).chapterProgress;
  const normalized = normalizePlayerProfile(playerMeta).chapterProgress;
  playerMeta.chapterProgress = normalized;
  return playerMeta.chapterProgress[chapterId];
}

function getChapterNode(chapterId, nodeId) {
  return getChapter(chapterId)?.nodes?.find((node) => node.nodeId === nodeId) || null;
}

function getCurrentChapterNodeId(chapterId = "chapter_1") {
  const chapter = getChapter(chapterId);
  const progress = getChapterProgress(chapterId);
  if (!chapter || !progress) return "";
  return progress.unlockedNodeIds.find((id) => !progress.clearedNodeIds.includes(id))
    || progress.currentNodeId
    || chapter.nodes?.[0]?.nodeId
    || "";
}

function getNextChapterNodeId(chapterId, nodeId) {
  const nodes = getChapter(chapterId)?.nodes || [];
  const index = nodes.findIndex((node) => node.nodeId === nodeId);
  return index >= 0 ? nodes[index + 1]?.nodeId || "" : "";
}

function getChapterNodeStatus(chapterId, nodeId) {
  const progress = getChapterProgress(chapterId);
  if (!progress) return "locked";
  if (progress.clearedNodeIds.includes(nodeId)) return "cleared";
  if (progress.unlockedNodeIds.includes(nodeId)) return "available";
  return "locked";
}

function selectAdventureNode(nodeId, chapterId = "chapter_1") {
  state.selectedAdventureChapterId = chapterId;
  state.selectedAdventureNodeId = nodeId;
  state.adventureDetailOpen = true;
  renderFeaturePage();
}

function startAdventureNode(nodeId, chapterId = "chapter_1") {
  const node = getChapterNode(chapterId, nodeId);
  if (!node) return false;
  const status = getChapterNodeStatus(chapterId, nodeId);
  state.selectedAdventureChapterId = chapterId;
  state.selectedAdventureNodeId = nodeId;
  if (status === "locked") {
    renderFeaturePage();
    return false;
  }
  state.currentChapterId = chapterId;
  state.currentNodeId = node.nodeId;
  state.currentBattleConfigId = node.battleConfigId || "";
  state.lastChallengeChapterId = chapterId;
  state.lastChallengeNodeId = node.nodeId;
  state.lastBattleConfigId = node.battleConfigId || "";
  enterLoadout();
  return true;
}

function markAdventureNodeCleared(chapterId, nodeId) {
  const progress = getChapterProgress(chapterId);
  const node = getChapterNode(chapterId, nodeId);
  if (!progress || !node) return null;
  if (!progress.clearedNodeIds.includes(nodeId)) progress.clearedNodeIds.push(nodeId);
  if (!progress.unlockedNodeIds.includes(nodeId)) progress.unlockedNodeIds.push(nodeId);
  const nextNodeId = getNextChapterNodeId(chapterId, nodeId);
  if (nextNodeId && !progress.unlockedNodeIds.includes(nextNodeId)) progress.unlockedNodeIds.push(nextNodeId);
  progress.currentNodeId = nextNodeId || nodeId;
  progress.lastClearedNodeId = nodeId;
  if (node.storyUnlock) progress.storyFlags[node.storyUnlock] = true;
  state.selectedAdventureChapterId = chapterId;
  state.selectedAdventureNodeId = progress.currentNodeId;
  savePlayerProfile();
  return { node, nextNodeId };
}

function enterLoadout() {
  applyPlayerLevelUnlocks();
  if (!state.loadoutFormationId || !playerMeta.unlockedFormations.includes(state.loadoutFormationId)) {
    state.loadoutFormationId = playerMeta.unlockedFormations[0] || DATA.initial.formation || "";
  }
  state.loadoutRoleIds = state.loadoutRoleIds
    .filter((id) => playerMeta.ownedCharacters.includes(id))
    .slice(0, playerMeta.maxDeploySlots);
  state.loadoutArtifactIds = (state.loadoutArtifactIds || [])
    .filter((id) => playerMeta.ownedArtifacts.includes(id))
    .slice(0, playerMeta.maxArtifactSlots);
  state.loadoutArtifactId = state.loadoutArtifactIds[0] || "";
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
    (state.loadoutArtifactIds || []).length <= playerMeta.maxArtifactSlots
  );
}

function enterDeploy() {
  if (!loadoutReady()) {
    setStatus("战前配置未完成：需要 1 个阵法、至少 1 名角色；法宝可以不携带。");
    renderLoadout();
    return;
  }
  state.appState = APP_STATE.DEPLOY;
    state.phase = "deploy";
  initializeArrayCoreForRun();
  state.selectedFormationId = state.loadoutFormationId;
  const selectedFormation = DATA.formations[state.selectedFormationId];
  state.formationCoreDamageReduction = Number(selectedFormation?.passiveCoreDamageReduction) || 0;
  state.formationSpiritQiGainMultiplier = Number(selectedFormation?.spiritQiGainMultiplier) || 1;
  state.selectedArtifactIds = [...(state.loadoutArtifactIds || [])];
  state.selectedArtifactId = state.selectedArtifactIds[0] || "";
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
  (state.selectedArtifactIds || []).forEach((artifactId) => {
    getSystemArtifactRuntimeState({ state, artifactId });
  });
  currentRunCharacters().forEach((character) => {
    const art = martialArtForCharacter(character.id);
    if (art) getMartialRunState(art.id);
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
      addVisualEvent,
      getArrayCorePosition() {
        return { x: canvas.width / 2, y: canvas.height - grid.cellH * 0.65 };
      },
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
  state.lingqi += amount * state.bonuses.lingqiGain * (state.formationSpiritQiGainMultiplier || 1);
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

function applyArtifactRunUpgrade(perk, effect) {
  const artifactId = effect.artifactId || perk.targetArtifactId || perk.targetId;
  if (!artifactId || !(state.selectedArtifactIds || []).includes(artifactId)) return;
  const runtime = getSystemArtifactRuntimeState({ state, artifactId });
  if (!runtime) return;

  const upgradeId = effect.upgradeId || perk.upgradeId || perk.id;
  if (upgradeId && !runtime.selectedUpgradeIds.includes(upgradeId)) {
    runtime.selectedUpgradeIds.push(upgradeId);
  }

  const upgradeType = effect.upgradeType || perk.upgradeType;
  runtime.evolvedUpgradeIds = Array.isArray(runtime.evolvedUpgradeIds) ? runtime.evolvedUpgradeIds : [];
  if (upgradeType === "minor_evolution") {
    runtime.minorEvolutionSelected = true;
  }
  if (upgradeType === "major_evolution") {
    runtime.majorEvolutionSelected = true;
    runtime.majorEvolutionId = upgradeId || runtime.majorEvolutionId || `${artifactId}_major_evolution`;
    runtime.level = 7;
    return;
  }
  if (upgradeType === "evolved_upgrade") {
    if (upgradeId && !runtime.evolvedUpgradeIds.includes(upgradeId)) runtime.evolvedUpgradeIds.push(upgradeId);
    return;
  }

  runtime.level = Math.min(7, Math.max(1, Number(runtime.level) || 1) + 1);
}

function getMartialRunState(artId) {
  const branchState = getMartialBranchState(artId);
  branchState.selectedUpgradeIds = Array.isArray(branchState.selectedUpgradeIds) ? branchState.selectedUpgradeIds : [];
  branchState.evolvedUpgradeIds = Array.isArray(branchState.evolvedUpgradeIds) ? branchState.evolvedUpgradeIds : [];
  branchState.minorEvolutionSelected = Boolean(branchState.minorEvolutionSelected);
  branchState.majorEvolutionSelected = Boolean(branchState.majorEvolutionSelected);
  branchState.majorEvolutionId = branchState.majorEvolutionId || null;
  state.martialArtLevels[artId] = Math.max(1, Number(state.martialArtLevels[artId]) || 1);
  branchState.level = state.martialArtLevels[artId];
  return branchState;
}

function recordMartialRunUpgrade(perk, effect, upgrade = null) {
  const artId = effect.martialArtId || perk.martialArtId || perk.targetMartialArtId || perk.targetId;
  if (!artId) return null;
  const runtime = getMartialRunState(artId);
  const upgradeId = effect.upgradeId || perk.upgradeId || perk.id;
  if (upgradeId && !runtime.selectedUpgradeIds.includes(upgradeId)) runtime.selectedUpgradeIds.push(upgradeId);
  const upgradeType = perk.upgradeType || perk.upgradeKind || effect.upgradeType
    || (upgrade?.type === "minor" ? "minor_evolution" : upgrade?.type === "major" ? "major_evolution" : upgrade?.type === "major_enhance" ? "evolved_upgrade" : "refine_upgrade");
  if (upgradeType === "minor_evolution") runtime.minorEvolutionSelected = true;
  if (upgradeType === "major_evolution") {
    runtime.majorEvolutionSelected = true;
    runtime.majorEvolutionId = upgradeId || runtime.majorEvolutionId;
  }
  if (upgradeType === "evolved_upgrade") {
    if (upgradeId && !runtime.evolvedUpgradeIds.includes(upgradeId)) runtime.evolvedUpgradeIds.push(upgradeId);
  } else if (upgradeType === "major_evolution") {
    state.martialArtLevels[artId] = 7;
  } else {
    state.martialArtLevels[artId] = Math.min(7, Math.max(1, Number(state.martialArtLevels[artId]) || 1) + 1);
  }
  runtime.level = state.martialArtLevels[artId];
  return runtime;
}

function applyMartialModifierEffect(effect) {
  const modifier = getMartialArtModifier(effect.martialArtId);
  switch (effect.type) {
    case "martial_art_damage_bonus":
    case "martial_art_damage_mult":
      modifier.damageMultiplier *= 1 + effect.value;
      break;
    case "martial_art_attack_interval_mult":
      modifier.attackIntervalMultiplier *= effect.value;
      break;
    case "martial_art_pierce_bonus":
    case "martial_art_pierce_add":
      modifier.pierceAdd += effect.value;
      break;
    case "martial_art_projectile_count_add":
      modifier.projectileCountAdd += effect.value;
      break;
    case "martial_art_volley_count_add":
      modifier.volleyCountAdd += effect.value;
      break;
    case "martial_art_area_mult":
      modifier.areaMultiplier *= 1 + effect.value;
      break;
    case "martial_art_slow_duration_add":
      modifier.slowDurationAdd += effect.value;
      break;
    case "martial_art_poison_duration_add":
      modifier.poisonDurationAdd += effect.value;
      break;
    case "martial_art_poison_damage_mult":
      modifier.poisonDamageMultiplier *= 1 + effect.value;
      break;
    case "martial_art_chain_count_add":
      modifier.chainCountAdd += effect.value;
      break;
    case "martial_art_chain_radius_mult":
      modifier.chainRadiusMultiplier *= 1 + effect.value;
      break;
    case "martial_art_vulnerable_mult":
      modifier.vulnerableMultiplier += effect.value;
      break;
    case "martial_art_debuff_duration_add":
      modifier.debuffDurationAdd += effect.value;
      break;
    case "martial_art_execute_threshold_add":
      modifier.executeThresholdAdd += effect.value;
      break;
    case "martial_art_width_mult":
      modifier.widthMultiplier *= 1 + effect.value;
      break;
    case "martial_art_team_damage_aura":
      modifier.teamDamageAura += effect.value;
      break;
    case "martial_art_chase_on_kill":
      modifier.chaseOnKillAdd += effect.value;
      break;
    default:
      return false;
  }
  return true;
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
    description: "每波剑气弹道数量再+1，形成更宽的剑气覆盖。",
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

function addVisualEvent(event) {
  state.visualEvents = state.visualEvents || [];
  state.visualEvents.push({
    id: event.id || makeId(),
    elapsed: 0,
    duration: event.duration || 0.35,
    ...event,
  });
}

function visualPoint(entity) {
  return entity ? { x: entity.x, y: entity.y, id: entity.id } : null;
}

function addRoleAttackVisual(role, target, visualType, extra = {}) {
  const config = DATA.roles[role.roleId];
  if (!target || !config) return;
  if (visualType === "chain_lightning") {
    const art = martialBonuses(role.roleId);
    const targets = [target, ...nearestEnemies(target, Math.max(0, (extra.projectileCount || 1) + art.chainAdd), grid.cellW * 2.6 * art.chainRadiusMult)];
    addVisualEvent({
      type: "chain_lightning",
      fromX: role.x,
      fromY: role.y,
      targets: targets.map(visualPoint),
      duration: 0.22,
      colorKey: "thunder",
      sourceId: role.roleId,
    });
    return;
  }
  if (visualType === "vertical_sweep") {
    addVisualEvent({
      type: "sweep",
      x: target.x,
      y: target.y,
      fromX: role.x,
      fromY: role.y,
      radius: grid.cellH * 2.6,
      orientation: "vertical",
      duration: 0.28,
      colorKey: "sword",
      sourceId: role.roleId,
    });
    return;
  }
  if (visualType === "horizontal_sweep") {
    addVisualEvent({
      type: "sweep",
      x: target.x,
      y: target.y,
      fromX: role.x,
      fromY: role.y,
      radius: grid.cellW * 2.8,
      orientation: "horizontal",
      duration: 0.26,
      colorKey: "spear",
      sourceId: role.roleId,
    });
    return;
  }
  if (visualType === "wave_debuff") {
    addVisualEvent({
      type: "wave",
      x: target.x,
      y: target.y,
      fromX: role.x,
      fromY: role.y,
      radius: grid.cellW * 1.5,
      duration: 0.42,
      colorKey: "sound",
      sourceId: role.roleId,
    });
  }
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
      resolveInstantRoleAttack(roleArg, target, damage, payload = {}) {
        applyRoleHit(roleArg, target, damage);
        addRoleAttackVisual(roleArg, target, payload.visualType, payload);
      },
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
  if (!isEnemyTargetable(target)) return;
  if (role?.sourceType === "artifact" || role?.sourceType === "formation") {
    const sourceLabel = role.sourceType === "formation" ? "formation" : role.bondId ? "artifact_bond" : "artifact";
    target.takeDamage(damage, sourceLabel, role);
    if (role.splashRadius > 0 && role.splashDamageMultiplier > 0) {
      areaDamage(target.x, target.y, role.splashRadius, damage * role.splashDamageMultiplier, sourceLabel);
    }
    if (role.slowDuration > 0 && role.slowMultiplier) {
      target.addStatus("slow", role.slowDuration, Math.max(0, 1 - role.slowMultiplier));
    }
    if (role.debuffDuration > 0 && role.vulnerableMultiplier) {
      target.addStatus("vulnerable", role.debuffDuration, Math.max(0, role.vulnerableMultiplier - 1));
    }
    if (role.debuffDuration > 0 && role.attackDamageMultiplier) {
      target.addStatus("weaken_attack", role.debuffDuration, Math.max(0, 1 - role.attackDamageMultiplier));
    }
    if (role.chainCount > 0 && role.chainRadius > 0) {
      let current = target;
      const hitIds = new Set([target.id]);
      const chainTargets = [visualPoint(target)];
      let chainDamage = damage * role.chainDamageMultiplier;
      for (let i = 0; i < role.chainCount; i += 1) {
        const next = state.enemies
          .filter((enemy) => isEnemyTargetable(enemy) && !hitIds.has(enemy.id) && distance(enemy, current) <= role.chainRadius)
          .sort((a, b) => distance(a, current) - distance(b, current))[0];
        if (!next) break;
        hitIds.add(next.id);
        next.takeDamage(chainDamage, sourceLabel, role);
        chainTargets.push(visualPoint(next));
        current = next;
        chainDamage *= role.chainDamageMultiplier;
      }
      addVisualEvent({
        type: "chain_lightning",
        fromX: target.x,
        fromY: target.y - 80,
        targets: chainTargets,
        duration: 0.24,
        colorKey: "thunder",
        sourceId: role.id,
      });
    }
    return;
  }
  const config = DATA.roles[role.roleId];
  const art = martialBonuses(role.roleId);
  const projectile = config.trajectoryType || config.projectile;
  const killed = target.takeDamage(damage, "role", role);

  if (config.visualType === "projectile" || config.projectileType === "flying_sword") {
    addVisualEvent({ type: "area_burst", x: target.x, y: target.y, radius: 22, duration: 0.18, colorKey: art.giantSword ? "debuff" : "sword", sourceId: role.roleId });
  }
  if (config.visualType === "shadow_dash") {
    addVisualEvent({ type: "sweep", x: target.x, y: target.y, fromX: role.x, fromY: role.y, radius: 42, orientation: "diagonal", duration: 0.2, colorKey: "thunder", sourceId: role.roleId });
  }
  if (config.visualType === "dao_light_aura") {
    addVisualEvent({ type: "wave", x: role.x, y: role.y, radius: grid.cellW * 0.9, duration: 0.38, colorKey: "debuff", sourceId: role.roleId });
  }

  if (projectile === "splash") {
    addVisualEvent({ type: "area_burst", x: target.x, y: target.y, radius: grid.cellW * 0.65 * art.splashRadius, duration: 0.34, colorKey: "fire", sourceId: role.roleId });
    areaDamage(target.x, target.y, grid.cellW * 0.65 * art.splashRadius, damage * 0.55, "role");
    if (art.burningZone) {
      state.zones.push({ x: target.x, y: target.y, radius: grid.cellW * 0.7 * art.splashRadius, ttl: 1.4, color: "rgba(239, 123, 69, 0.2)", dps: damage * 0.18, tick: 0 });
    }
    if (art.splashShards > 0) {
      nearestEnemies(target, art.splashShards).forEach((enemy) => {
        enemy.takeDamage(damage * 0.25, "role", role);
        enemy.addStatus("burn", 1.2, Math.max(2, damage * 0.08));
      });
    }
  }
  if (projectile === "horizontal") {
    if (config.visualType !== "horizontal_sweep" && config.visualType !== "wave_debuff") {
      addVisualEvent({ type: "sweep", x: target.x, y: target.y, fromX: role.x, fromY: role.y, radius: grid.cellW * 2.4, orientation: "horizontal", duration: 0.22, colorKey: "spear", sourceId: role.roleId });
    }
    const count = art.fullRowSpear ? 99 : (config.passiveSkill === "horizontal_cleave" ? 4 : 2) + art.horizontalWidth + state.bonuses.horizontalBonus;
    horizontalTargets(target, count).forEach((enemy) => enemy.takeDamage(damage * 0.7, "role", role));
    if (art.splashOnHit > 0) {
      horizontalTargets(target, Math.max(2, count)).forEach((enemy) => enemy.takeDamage(damage * art.splashOnHit, "role", role));
    }
  }
  if (projectile === "vertical") {
    if (config.visualType !== "vertical_sweep") {
      addVisualEvent({ type: "sweep", x: target.x, y: target.y, fromX: role.x, fromY: role.y, radius: grid.cellH * 2.4, orientation: "vertical", duration: 0.24, colorKey: "sword", sourceId: role.roleId });
    }
    const count = 2 + state.bonuses.pierceAdd + art.pierceAdd + (config.passiveSkill === "pierce_bonus" ? 1 : 0);
    enemiesBehind(target, count).forEach((enemy) => enemy.takeDamage(damage * 0.65, "role", role));
    if (art.verticalColumns > 1) {
      state.enemies
        .filter((enemy) => isEnemyTargetable(enemy) && enemy !== target && Math.abs(enemy.x - target.x) <= grid.cellW * 1.2)
        .slice(0, 6)
        .forEach((enemy) => enemy.takeDamage(damage * 0.45, "role", role));
    }
    if (art.swordTrail) {
      state.zones.push({ x: target.x, y: target.y, radius: grid.cellW * 0.45, ttl: 1.2, color: "rgba(215, 225, 236, 0.16)", dps: damage * 0.22, tick: 0 });
    }
  }
  if (projectile === "slow" || config.school === "冰") {
    addVisualEvent({ type: "area_burst", x: target.x, y: target.y, radius: grid.cellW * 0.55 * art.splashRadius, duration: 0.35, colorKey: "frost", sourceId: role.roleId });
    target.addStatus("slow", (2 + art.slowDurationAdd) * state.bonuses.controlMultiplier, 0.3 + art.slowBonus);
    if (art.slowSplash > 0) {
      horizontalTargets(target, 2).forEach((enemy) => enemy.addStatus("slow", (1.5 + art.slowDurationAdd) * state.bonuses.controlMultiplier, art.slowSplash));
    }
    if (art.freezeAttackLine > 0 && target.progress >= 0.82 && Math.random() < art.freezeAttackLine) {
      target.addStatus("freeze", 0.55 * state.bonuses.controlMultiplier, 1);
    }
  }
  if (projectile === "poison" || config.school === "毒") {
    addVisualEvent({ type: "poison_cloud", x: target.x, y: target.y, radius: grid.cellW * 0.42, duration: 0.6, colorKey: "poison", sourceId: role.roleId });
    target.addStatus("poison", 3 + state.bonuses.poisonDurationAdd + art.poisonDuration, Math.max(2, damage * 0.22 * art.dotMult), {
      stack: config.passiveSkill === "poison_stack",
      maxStacks: art.poisonStackBonus ? 5 : 3,
    });
    if (art.chainAdd > 0) nearestEnemies(target, art.chainAdd, grid.cellW * 2.2 * art.chainRadiusMult).forEach((enemy) => {
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
    const chainTargets = nearestEnemies(target, count, grid.cellW * 2.6 * art.chainRadiusMult);
    chainTargets.forEach((enemy) => enemy.takeDamage(damage * 0.55, "role", role));
    addVisualEvent({ type: "chain_lightning", fromX: role.x, fromY: role.y, targets: [target, ...chainTargets].map(visualPoint), duration: 0.24, colorKey: "thunder", sourceId: role.roleId });
    if (art.paralyze > 0) target.addStatus("slow", 0.8, art.paralyze);
    if (art.bossPriorityLightning) {
      const elite = state.enemies.find((enemy) => isEnemyTargetable(enemy) && (enemy.config.isBoss || enemy.config.type === "精英"));
      if (elite) elite.takeDamage(damage * 0.9, "role", role);
    }
  }
  if (art.burnOnHit > 0) target.addStatus("burn", 1.5, art.burnOnHit);
  if (art.meteorRain > 0) nearestEnemies(target, art.meteorRain).forEach((enemy) => enemy.takeDamage(damage * 0.35, "role", role));
  if (art.vulnerableMult > 0) target.addStatus("vulnerable", 2.4 + art.debuffDurationAdd, art.vulnerableMult);
  if (art.debuffDurationAdd > 0 || art.soundSplashDebuff) target.addStatus("weaken_attack", 2.2 + art.debuffDurationAdd, 0.18);
  if (art.soundSplashDebuff) horizontalTargets(target, 3).forEach((enemy) => {
    enemy.addStatus("vulnerable", 2.2 + art.debuffDurationAdd, 0.12 + art.vulnerableMult);
    enemy.addStatus("weaken_attack", 2.2 + art.debuffDurationAdd, 0.16);
  });
  if (projectile === "execute" && target.hp / target.maxHp < 0.3 + art.executeThresholdAdd) {
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
  if (killed && art.chaseOnKill > 0) {
    nearestEnemies(target, art.chaseOnKill).forEach((enemy) => enemy.takeDamage(damage * 0.45, "role", role));
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
    .filter((enemy) => isEnemyTargetable(enemy) && enemy !== target && Math.abs(enemy.y - target.y) < grid.cellH * 0.8)
    .sort((a, b) => Math.abs(a.x - target.x) - Math.abs(b.x - target.x))
    .slice(0, count);
}

function horizontalTargets(target, count) {
  return state.enemies
    .filter(
      (enemy) =>
        isEnemyTargetable(enemy) &&
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
        isEnemyTargetable(enemy) &&
        enemy !== target &&
        enemy.lane === target.lane &&
        enemy.progress < target.progress &&
        target.progress - enemy.progress < 0.18,
    )
    .sort((a, b) => b.progress - a.progress)
    .slice(0, count);
}

function nearestEnemies(target, count, maxDistance = Infinity) {
  return state.enemies
    .filter((enemy) => isEnemyTargetable(enemy) && enemy !== target && distance(enemy, target) <= maxDistance)
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
      addFloater(floater) {
        state.floaters.push(floater);
      },
      addVisualEvent,
      damageEnemy(enemy, damage, source) {
        enemy.takeDamage(damage, source);
      },
      gainLingqi,
      getFormationBase() {
        return { x: canvas.width / 2, y: canvas.height - grid.cellH / 2 };
      },
      healArrayCore(amount) {
        state.arrayCoreHp = Math.min(state.arrayCoreMaxHp, state.arrayCoreHp + amount);
        syncBaseHpAliases();
        state.floaters.push({
          x: canvas.width / 2,
          y: canvas.height - grid.cellH * 0.7,
          text: `+${Math.ceil(amount)}`,
          ttl: 0.75,
          color: "#86efac",
        });
      },
      nearestEnemies,
      setStatus,
      spawnFormationProjectile(payload) {
        spawnArtifactProjectile({
          artifact: { id: payload.formation.id, name: payload.formation.name },
          target: payload.target,
          origin: payload.origin,
          projectileIndex: payload.projectileIndex,
          projectileCount: payload.projectileCount,
          projectileType: payload.formation.projectileType || "formation_sword_projectile",
          sourceType: "formation",
          damage: payload.formation.damage,
          pierceCount: payload.formation.pierceCount,
          speed: 430,
          hitRadius: 16,
          color: "#e9ffff",
        });
      },
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

function spawnArtifactProjectile(payload) {
  const { artifact, bond, target, origin, projectileIndex = 0, projectileCount = 1 } = payload;
  if (!isEnemyTargetable(target)) return;
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const len = Math.hypot(dx, dy) || 1;
  const baseVx = dx / len;
  const baseVy = dy / len;
  const centered = projectileIndex - (projectileCount - 1) / 2;
  const normalX = -baseVy;
  const normalY = baseVx;
  const maxAimOffset = len > 420 ? 42 : 36;
  const aimStep = projectileCount <= 1 ? 0 : Math.min(14, maxAimOffset / Math.max(1, (projectileCount - 1) / 2));
  const aimOffset = Math.max(-maxAimOffset, Math.min(maxAimOffset, centered * aimStep));
  const aimX = target.x + normalX * aimOffset;
  const aimY = target.y + normalY * aimOffset;
  const aimDx = aimX - origin.x;
  const aimDy = aimY - origin.y;
  const aimLen = Math.hypot(aimDx, aimDy) || 1;
  const aimBaseVx = aimDx / aimLen;
  const aimBaseVy = aimDy / aimLen;
  const angleOffset = ((projectileSpreadAngles(projectileCount)[projectileIndex] || 0) * Math.PI) / 180;
  const vx = aimBaseVx * Math.cos(angleOffset) - aimBaseVy * Math.sin(angleOffset);
  const vy = aimBaseVx * Math.sin(angleOffset) + aimBaseVy * Math.cos(angleOffset);
  const offset = centered * 5;
  state.projectiles.push({
    id: makeId(),
    ownerCharacterId: artifact.id,
    ownerRoleId: artifact.id,
    type: payload.projectileType || "artifact_sword_projectile",
    trajectoryType: "artifact",
    x: origin.x + normalX * offset,
    y: origin.y + normalY * offset,
    lastX: origin.x + normalX * offset,
    lastY: origin.y + normalY * offset,
    vx,
    vy,
    speed: payload.speed || 420,
    damage: payload.damage || 0,
    width: 9,
    length: 30,
    radius: payload.hitRadius || 16,
    hitRadius: payload.hitRadius || 16,
    collisionPadding: 8,
    pierce: (payload.pierceCount || 0) > 0,
    remainingPierce: payload.pierceCount || 0,
    hitEnemyIds: new Set(),
    lifetime: 0,
    maxLifetime: 2.4,
    effectType: "artifact",
    color: payload.color || "#a7f3ff",
    trailColor: "rgba(167, 243, 255, 0.28)",
    sourceRole: {
      id: artifact.id,
      roleId: artifact.id,
      sourceType: payload.sourceType || "artifact",
      artifactId: artifact.id,
      bondId: bond?.id || "",
      splashRadius: payload.splashRadius || 0,
      splashDamageMultiplier: payload.splashDamageMultiplier || 0,
      slowMultiplier: payload.slowMultiplier,
      slowDuration: payload.slowDuration || 0,
      vulnerableMultiplier: payload.vulnerableMultiplier,
      attackDamageMultiplier: payload.attackDamageMultiplier,
      debuffDuration: payload.debuffDuration || 0,
      chainCount: payload.chainCount || 0,
      chainRadius: payload.chainRadius || 0,
      chainDamageMultiplier: payload.chainDamageMultiplier || 0.65,
    },
    sourceConfig: artifact,
    splashRadius: 0,
    splashDamageMultiplier: 0,
    eliteBossDamageMultiplier: 1,
    attackLineDamageMultiplier: 1,
  });
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

function runBattleModule(name, fn) {
  try {
    return fn();
  } catch (error) {
    const now = performance.now();
    state.__lastUpdateError = {
      module: name,
      message: error && error.message ? error.message : String(error),
      stack: error && error.stack ? error.stack : "",
      wave: state.wave,
      tick: state.__updateTick || 0,
    };
    state.__moduleErrorLogAt = state.__moduleErrorLogAt || {};
    if (!state.__moduleErrorLogAt[name] || now - state.__moduleErrorLogAt[name] > 3000) {
      state.__moduleErrorLogAt[name] = now;
      console.error(`[BattleUpdate] ${name} failed`, error);
    }
    return undefined;
  }
}

function cleanupDeadEnemies() {
  state.enemies = (state.enemies || []).filter((enemy) => {
    if (!enemy) return false;
    if (enemy.dead || enemy.isDead || enemy.markedForRemoval || enemy.state === ENEMY_STATE.DEAD) return false;
    if (!Number.isFinite(enemy.hp) || enemy.hp <= 0) return false;
    if (!Number.isFinite(enemy.x) || !Number.isFinite(enemy.y)) return false;
    return true;
  });
}

function diagnoseBattleLoop(dt) {
  state.__updateTick = (state.__updateTick || 0) + 1;
  state.__battleDiagElapsed = (state.__battleDiagElapsed || 0) + dt;
  if (state.__battleDiagElapsed < 5) return;
  state.__battleDiagElapsed = 0;
  const aliveEnemies = (state.enemies || []).filter((enemy) => (typeof isEnemyAlive === "function" ? isEnemyAlive(enemy) : isEnemyTargetable(enemy)));
  console.info("[BattleLoop] tick", {
    appState: state.appState,
    running: state.running,
    paused: state.paused,
    gameOver: state.gameOver,
    wave: state.wave,
    level: state.runLevel || state.level,
    pendingLevelUps: state.pendingLevelUps,
    enemies: state.enemies.length,
    aliveEnemies: aliveEnemies.length,
    projectiles: state.projectiles.length,
    visualEvents: state.visualEvents?.length || 0,
    lastUpdateAt: state.lastTime,
    dt,
    updateTick: state.__updateTick,
    lastError: state.__lastUpdateError || null,
  });

  const modalHidden = perkModal.classList.contains("hidden");
  if (state.appState === APP_STATE.LEVEL_UP_REWARD && modalHidden) {
    console.warn("[BattleLoop] level reward state has hidden modal; recovering battle state", {
      pendingLevelUps: state.pendingLevelUps,
      wave: state.wave,
    });
    state.appState = APP_STATE.BATTLE;
    state.running = true;
    state.paused = false;
  }

  const hasAliveEnemies = aliveEnemies.length > 0;
  const hasRoles = state.deployedRoles.length > 0;
  const totalAttacks = state.deployedRoles.reduce((sum, role) => sum + (role.attacks || 0), 0);
  if (state.wave === 10 && hasRoles && hasAliveEnemies && totalAttacks === (state.__lastRoleAttackDiagCount ?? totalAttacks)) {
    state.__roleNoAttackTime = (state.__roleNoAttackTime || 0) + 5;
    if (state.__roleNoAttackTime >= 5 && !state.__roleNoAttackWarned) {
      state.__roleNoAttackWarned = true;
      console.warn("[BattleLoop] roles have alive enemies but no recent attacks", {
        wave: state.wave,
        deployedRoles: state.deployedRoles.map((role) => ({
          id: role.id || role.characterId || role.roleId,
          cooldown: role.cooldown,
          x: role.x,
          y: role.y,
        })),
        aliveEnemies: aliveEnemies.slice(0, 8).map((enemy) => ({
          id: enemy.config?.id || enemy.id,
          name: enemy.config?.name,
          hp: enemy.hp,
          state: enemy.state,
          attackMode: enemy.attackMode,
          x: enemy.x,
          y: enemy.y,
          targetable: isEnemyTargetable(enemy),
        })),
      });
    }
  } else {
    state.__roleNoAttackTime = 0;
    state.__roleNoAttackWarned = false;
  }
  state.__lastRoleAttackDiagCount = totalAttacks;
}

function update(dt) {
  if (state.appState !== APP_STATE.BATTLE || state.gameOver) return;
  if (!state.waveActive) startWave();

  diagnoseBattleLoop(dt);
  runBattleModule("updateWaveSpawns", () => updateWaveSpawns(dt));
  runBattleModule("updateEnemies", () => updateEnemies(dt));
  runBattleModule("cleanupEnemiesAfterUpdate", cleanupDeadEnemies);
  runBattleModule("updateRoles", () => state.deployedRoles.forEach((role) => updateRole(role, dt)));
  runBattleModule("updateProjectiles", () => updateProjectiles(dt));
  runBattleModule("updateFormation", () => updateFormation(dt));
  runBattleModule("updateArtifacts", () => updateArtifact(dt));
  runBattleModule("updateEffects", () => updateEffects(dt));
  runBattleModule("cleanupEnemiesAfterEffects", cleanupDeadEnemies);
  runBattleModule("advanceWave", advanceWave);
  runBattleModule("updateUi", updateUi);
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
      addZone(zone) {
        state.zones = state.zones || [];
        state.zones.push(zone);
      },
      addVisualEvent,
      areaDamage,
      damageEnemy(enemy, damage, source) {
        enemy.takeDamage(damage, source);
      },
      drawShot,
      getArtifactOrigin() {
        return { x: canvas.width / 2, y: canvas.height - grid.cellH * 0.35 };
      },
      healArrayCore(amount) {
        state.arrayCoreHp = Math.min(state.arrayCoreMaxHp, state.arrayCoreHp + amount);
        syncBaseHpAliases();
        state.floaters.push({
          x: canvas.width / 2,
          y: canvas.height - grid.cellH * 0.7,
          text: `+${Math.ceil(amount)}`,
          ttl: 0.75,
          color: "#86efac",
        });
      },
      spawnArtifactProjectile,
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
  state.floaters = Array.isArray(state.floaters) ? state.floaters : [];
  state.floaters.forEach((floater) => {
    floater.ttl -= dt;
    floater.y -= dt * 24;
  });
  state.floaters = state.floaters.filter((floater) => floater.ttl > 0);
  state.visualEvents = Array.isArray(state.visualEvents) ? state.visualEvents : [];
  state.visualEvents.forEach((event) => {
    if (!event || !Number.isFinite(event.duration) || event.duration <= 0) {
      if (event) event.elapsed = Infinity;
      return;
    }
    event.elapsed = (Number(event.elapsed) || 0) + dt;
  });
  state.visualEvents = state.visualEvents.filter((event) => event && Number.isFinite(event.elapsed) && event.elapsed < event.duration);
  state.zones = Array.isArray(state.zones) ? state.zones : [];
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
    button.innerHTML = renderSystemPerkChoiceCard(perk);
    button.addEventListener("click", () => {
      chooseLevelUpPerk(perk);
    });
    perkGrid.appendChild(button);
  });
  if (!choices.length) {
    const button = document.createElement("button");
    button.className = "perk-card";
    button.innerHTML = renderSystemPerkChoiceCard({
      rarity: "",
      category: "",
      name: "武学稳固",
      description: "没有可用机缘时，当前武学伤害+5%。",
    });
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
  if (perk.scope === "artifact" || effect.artifactId) {
    applyArtifactRunUpgrade(perk, effect);
  }
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
    case "artifact_damage_mult":
      getArtifactModifier(effect.artifactId).damageMultiplier *= 1 + effect.value;
      break;
    case "artifact_cooldown_mult":
      getArtifactModifier(effect.artifactId).cooldownMultiplier *= effect.value;
      break;
    case "artifact_projectile_count_add":
      getArtifactModifier(effect.artifactId).projectileCountAdd += effect.value;
      break;
    case "artifact_pierce_add":
      getArtifactModifier(effect.artifactId).pierceAdd += effect.value;
      break;
    case "artifact_area_mult":
      getArtifactModifier(effect.artifactId).areaMultiplier *= effect.value;
      break;
    case "artifact_volley_count_add":
      getArtifactModifier(effect.artifactId).volleyCountAdd += effect.value;
      break;
    case "artifact_slow_duration_add":
      getArtifactModifier(effect.artifactId).slowDurationAdd += effect.value;
      break;
    case "artifact_chain_count_add":
      getArtifactModifier(effect.artifactId).chainCountAdd += effect.value;
      break;
    case "artifact_chain_radius_mult":
      getArtifactModifier(effect.artifactId).chainRadiusMultiplier *= effect.value;
      break;
    case "artifact_freeze_chance_add":
      getArtifactModifier(effect.artifactId).freezeChanceAdd += effect.value;
      break;
    case "artifact_poison_duration_add":
      getArtifactModifier(effect.artifactId).poisonDurationAdd += effect.value;
      break;
    case "artifact_poison_damage_mult":
      getArtifactModifier(effect.artifactId).poisonDamageMultiplier *= 1 + effect.value;
      break;
    case "artifact_heal_mult":
      getArtifactModifier(effect.artifactId).healMultiplier *= 1 + effect.value;
      break;
    case "artifact_debuff_duration_add":
      getArtifactModifier(effect.artifactId).debuffDurationAdd += effect.value;
      break;
    case "artifact_vulnerable_mult":
      getArtifactModifier(effect.artifactId).vulnerableMultiplier += effect.value;
      break;
    case "artifact_evolution":
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
      recordMartialRunUpgrade(perk, effect);
      if ((perk.upgradeType || perk.upgradeKind || effect.upgradeType) === "evolved_upgrade" && perk.levelEffectType) {
        applyMartialModifierEffect({
          ...effect,
          type: perk.levelEffectType,
          value: perk.value ?? effect.value,
          martialArtId: art.id,
        });
      }
      state.martialArtLevels[art.id] = Math.min(art.maxLevel, state.martialArtLevels[art.id]);
      break;
    }
    case "martial_art_branch_upgrade": {
      const art = (DATA.martialArts || []).find((item) => item.id === effect.martialArtId);
      const upgrade = QINGYA_BRANCH_UPGRADES.find((item) => item.id === effect.upgradeId);
      if (!art || !upgrade || !qingyaBranchUpgradeAvailable(upgrade)) {
        applyTargetedFallbackUpgrade();
        break;
      }
      const branchState = getMartialBranchState(art.id);
      branchState[upgrade.id] = true;
      recordMartialRunUpgrade(perk, effect, upgrade);
      state.martialArtLevels[art.id] = Math.min(art.maxLevel, state.martialArtLevels[art.id]);
      break;
    }
    case "martial_art_damage_bonus":
      recordMartialRunUpgrade(perk, effect);
      applyMartialModifierEffect(effect);
      break;
    case "martial_art_attack_interval_mult":
      recordMartialRunUpgrade(perk, effect);
      applyMartialModifierEffect(effect);
      break;
    case "martial_art_pierce_bonus":
    case "martial_art_pierce_add":
    case "martial_art_damage_mult":
    case "martial_art_projectile_count_add":
    case "martial_art_volley_count_add":
    case "martial_art_area_mult":
    case "martial_art_slow_duration_add":
    case "martial_art_poison_duration_add":
    case "martial_art_poison_damage_mult":
    case "martial_art_chain_count_add":
    case "martial_art_chain_radius_mult":
    case "martial_art_vulnerable_mult":
    case "martial_art_debuff_duration_add":
    case "martial_art_execute_threshold_add":
    case "martial_art_width_mult":
    case "martial_art_team_damage_aura":
    case "martial_art_chase_on_kill":
      recordMartialRunUpgrade(perk, effect);
      applyMartialModifierEffect(effect);
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
  const clearedAdventure = win && state.currentChapterId && state.currentNodeId
    ? markAdventureNodeCleared(state.currentChapterId, state.currentNodeId)
    : null;
  syncPlayerMetaAliases();
  savePlayerProfile();
  renderSystemSettlement({
    elements: {
      settlementTitle,
      settlementWave,
      settlementKills,
      settlementLingstone,
    },
    win,
    state,
    reward,
    playerExp,
    levelRewards,
  });
  if (settlementNodeInfo) {
    const node = getChapterNode(state.lastChallengeChapterId || state.currentChapterId, state.lastChallengeNodeId || state.currentNodeId);
    const unlockText = clearedAdventure?.node?.storyUnlock
      ? `剧情线索：${clearedAdventure.node.storyUnlock === "old_array_rubbing" ? "旧阵残拓" : "归门妖纹"}`
      : "";
    settlementNodeInfo.textContent = node
      ? `${win ? "已完成" : "未通关"}：${node.displayId} ${node.name}${clearedAdventure?.nextNodeId ? ` · 已解锁 ${getChapterNode(state.currentChapterId, clearedAdventure.nextNodeId)?.displayId || ""}` : ""}${unlockText ? ` · ${unlockText}` : ""}`
      : "";
  }
  showView(settlementView);
  updateDebugPanel();
}

function renderLobby() {
  renderSystemLobby({
    elements: {
      metaLevel,
      metaLingstone,
      ownedRolesList,
      ownedArtifactsList,
      unlockedFormationsList,
    },
    DATA,
    playerProfile: playerMeta,
    helpers: {
      getCharacterBaseFinalDamage,
      getCharacterLevel,
      getCharacterUpgradeCost,
      getNextCharacterUnlock,
      getNextDeploySlotUnlock,
      getPlayerLevelExpRequirement,
      syncPlayerMetaAliases,
    },
  });
  ownedRolesList.querySelectorAll("[data-role-upgrade-id]").forEach((button) => {
    button.addEventListener("click", () => upgradeCharacter(button.dataset.roleUpgradeId));
  });
}

function renderMainHub() {
  renderSystemMainHub({
    elements: {
      hubMainTitle: document.querySelector("#hubMainTitle"),
      hubNodeTitle,
      hubMainDescription: document.querySelector("#hubMainDescription"),
      hubResourceBar,
    },
    playerProfile: playerMeta,
    DATA,
    helpers: {
      getChapter,
      getChapterNode,
      getCurrentChapterNodeId,
    },
  });
}

function syncHubNavActive() {
  document.querySelectorAll("[data-hub-page]").forEach((button) => {
    button.classList.toggle("active", button.dataset.hubPage === state.appState);
  });
}

function renderFeaturePage() {
  if (!HUB_PAGE_STATES.has(state.appState)) return;
  featureBackButton.textContent = featureReturnState === APP_STATE.TITLE ? "返回啟卷" : "返回宗門";
  renderSystemFeaturePage({
    elements: {
      featurePageTitle,
      featurePageSubtitle,
      featurePageContent,
    },
    page: state.appState,
    DATA,
    playerProfile: playerMeta,
    state,
    helpers: {
      getChapterNodeStatus,
      getCurrentChapterNodeId,
      getCharacterLevel,
    },
  });
}

function renderLoadout() {
  renderSystemLoadout({
    elements: {
      loadoutFormationList,
      loadoutRoleList,
      loadoutArtifactList,
      loadoutStatus,
      enterDeployButton,
    },
    state,
    playerProfile: playerMeta,
    DATA,
    helpers: {
      getActiveArtifactBonds,
      getCharacterLevel,
      getNextDeploySlotUnlock,
      loadoutReady,
    },
  });
  loadoutFormationList.querySelectorAll("[data-loadout-formation-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.loadoutFormationId = button.dataset.loadoutFormationId;
      renderLoadout();
      updateUi();
    });
  });
  loadoutRoleList.querySelectorAll("[data-loadout-role-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.loadoutRoleId;
      const selected = state.loadoutRoleIds.includes(id);
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
  });
  loadoutArtifactList.querySelectorAll("[data-loadout-artifact-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.loadoutArtifactId;
      const selected = state.loadoutArtifactIds.includes(id);
      if (selected) {
        state.loadoutArtifactIds = state.loadoutArtifactIds.filter((artifactId) => artifactId !== id);
      } else if (state.loadoutArtifactIds.length < playerMeta.maxArtifactSlots) {
        state.loadoutArtifactIds.push(id);
      } else {
        setStatus(`当前最多可携带 ${playerMeta.maxArtifactSlots} 件法宝。`);
      }
      state.loadoutArtifactId = state.loadoutArtifactIds[0] || "";
      renderLoadout();
      updateUi();
    });
  });
}

function renderSetupLists() {
  renderSystemSetupLists({
    elements: {
      formationList,
      roleList,
      artifactList,
    },
    state,
    DATA,
    deployState: APP_STATE.DEPLOY,
  });
  roleList.querySelectorAll("[data-setup-role-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedRoleId = button.dataset.setupRoleId;
      renderSetupLists();
    });
  });
}

function updateUi() {
  if (state.appState === APP_STATE.TITLE) showView(titleView);
  if (state.appState === APP_STATE.MAIN_HUB) showView(mainHubView);
  if (HUB_PAGE_STATES.has(state.appState)) showView(featurePageView);
  if (state.appState === APP_STATE.LOBBY) showView(lobbyView);
  if (state.appState === APP_STATE.LOADOUT) showView(loadoutView);
  if (state.appState === APP_STATE.DEPLOY || state.appState === APP_STATE.BATTLE || state.appState === APP_STATE.LEVEL_UP_REWARD) {
    showView(battleView);
  }
  if (state.appState === APP_STATE.SETTLEMENT) showView(settlementView);
  renderLobby();
  renderMainHub();
  renderFeaturePage();
  syncHubNavActive();
  renderSystemHud({
    elements: {
      waveText,
      hpText,
      lingqiText,
      runStatus,
      startButton,
      deployHint,
      deployState: APP_STATE.DEPLOY,
    },
    state,
    DATA,
    nextLevelRequirement,
  });
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

function setDebugNotice(text) {
  debugNoticeText = text || "";
  if (text) setStatus(text);
}

function ensureDebugSelections() {
  const firstRoleId = Object.keys(DATA.roles || {})[0] || "";
  const firstArtifactId = Object.keys(DATA.artifacts || {})[0] || "";
  const firstFormationId = Object.keys(DATA.formations || {})[0] || "";
  const firstEnemyId = Object.keys(DATA.enemies || {})[0] || "";
  const firstChapterId = Object.keys(DATA.chapters || {})[0] || "chapter_1";
  debugSelectedChapterId = DATA.chapters?.[debugSelectedChapterId] ? debugSelectedChapterId : firstChapterId;
  debugSelectedNodeId = getChapterNode(debugSelectedChapterId, debugSelectedNodeId)?.nodeId
    || DATA.chapters?.[debugSelectedChapterId]?.nodes?.[0]?.nodeId
    || "chapter1_1";
  debugSelectedRoleId = DATA.roles?.[debugSelectedRoleId] ? debugSelectedRoleId : firstRoleId;
  debugSelectedArtifactId = DATA.artifacts?.[debugSelectedArtifactId] ? debugSelectedArtifactId : firstArtifactId;
  debugSelectedFormationId = DATA.formations?.[debugSelectedFormationId] ? debugSelectedFormationId : firstFormationId;
  debugSelectedEnemyId = DATA.enemies?.[debugSelectedEnemyId] ? debugSelectedEnemyId : firstEnemyId;
}

function debugSelectOptions(items, selectedId, labelOf = (item) => item.name || item.id) {
  return items
    .map((item) => `<option value="${safeText(item.id || item.chapterId || item.nodeId)}" ${String(item.id || item.chapterId || item.nodeId) === String(selectedId) ? "selected" : ""}>${safeText(labelOf(item))}</option>`)
    .join("");
}

function debugControlValue(name, fallback = "") {
  const field = debugContent.querySelector(`[data-debug-control="${name}"]`);
  if (!field) return fallback;
  if (field.type === "checkbox") return field.checked;
  return field.value;
}

function debugControlNumber(name, fallback = 0) {
  const value = Number(debugControlValue(name, fallback));
  return Number.isFinite(value) ? value : fallback;
}

function syncDebugUiStateFromDom() {
  const targetWaveInput = debugContent?.querySelector?.('[data-debug-input="target-wave"]');
  if (targetWaveInput) DEBUG_UI_STATE.targetWaveInput = targetWaveInput.value;
}

function getDebugTargetWaveInput() {
  syncDebugUiStateFromDom();
  if (DEBUG_UI_STATE.targetWaveInput == null) DEBUG_UI_STATE.targetWaveInput = String(state.wave || 1);
  return DEBUG_UI_STATE.targetWaveInput;
}

function clearRuntimeThreats() {
  state.enemies = [];
  state.projectiles = [];
  state.visualEvents = [];
  state.zones = [];
}

function debugJumpToWave(targetWave) {
  const rawWave = Number(targetWave);
  if (!Number.isInteger(rawWave) || rawWave < 1) {
    setDebugNotice("请输入有效波次");
    return false;
  }
  const waveConfig = (DATA.waves || []).find((wave) => Number(wave.wave) === rawWave);
  if (!waveConfig) {
    setDebugNotice("未找到该波配置");
    return false;
  }
  if (!state.loadoutFormationId) state.loadoutFormationId = playerMeta.unlockedFormations[0] || DATA.initial.formation || "";
  if (!state.selectedFormationId) state.selectedFormationId = state.loadoutFormationId;
  if (!Number.isFinite(state.arrayCoreMaxHp) || state.arrayCoreMaxHp <= 0) initializeArrayCoreForRun();
  clearRuntimeThreats();
  state.wave = rawWave;
  state.waveActive = false;
  state.spawnJobs = [];
  state.waveElapsed = 0;
  state.waveStallWarned = false;
  state.appState = APP_STATE.BATTLE;
  state.phase = "combat";
  state.running = true;
  state.paused = false;
  state.gameOver = false;
  if (startButton) startButton.disabled = true;
  if (!startWave()) {
    setDebugNotice("未找到该波配置");
    return false;
  }
  DEBUG_UI_STATE.targetWaveInput = String(rawWave);
  setDebugNotice(`已跳转到第 ${rawWave} 波。`);
  updateUi();
  return true;
}

function debugForceLoadout() {
  enterLoadout();
  setDebugNotice("已强制进入 LOADOUT。");
}

function debugForceDeploy() {
  enterLoadout();
  if (!state.loadoutRoleIds.length && playerMeta.ownedCharacters[0]) state.loadoutRoleIds = [playerMeta.ownedCharacters[0]];
  enterDeploy();
  setDebugNotice("已强制进入 DEPLOY。");
}

function debugForceBattle() {
  if (!state.loadoutFormationId) state.loadoutFormationId = playerMeta.unlockedFormations[0] || DATA.initial.formation || "";
  if (!state.loadoutRoleIds.length && playerMeta.ownedCharacters[0]) state.loadoutRoleIds = [playerMeta.ownedCharacters[0]];
  if (!state.loadoutArtifactIds?.length && playerMeta.ownedArtifacts[0]) {
    state.loadoutArtifactIds = [playerMeta.ownedArtifacts[0]];
    state.loadoutArtifactId = state.loadoutArtifactIds[0];
  }
  enterDeploy();
  if (!state.deployedRoles.length && state.availableRoles[0]) {
    state.selectedRoleId = state.availableRoles[0];
    deployRole(0, grid.rows - 1);
  }
  if (state.deployedRoles.length && state.deployedRoles.length === state.availableRoles.length) startRun();
  else {
    state.appState = APP_STATE.BATTLE;
    state.phase = "combat";
    state.running = true;
    state.paused = false;
  }
  setDebugNotice("已强制进入 BATTLE。");
}

function resetChapterProgress(chapterId = "chapter_1") {
  const chapter = getChapter(chapterId);
  if (!chapter) return false;
  const firstNodeId = chapter.nodes?.[0]?.nodeId || "";
  playerMeta.chapterProgress = playerMeta.chapterProgress || {};
  playerMeta.chapterProgress[chapterId] = {
    unlockedNodeIds: firstNodeId ? [firstNodeId] : [],
    clearedNodeIds: [],
    currentNodeId: firstNodeId,
    lastClearedNodeId: null,
    storyFlags: {},
  };
  savePlayerProfile();
  state.selectedAdventureChapterId = chapterId;
  state.selectedAdventureNodeId = firstNodeId;
  return true;
}

function unlockAllChapterNodes(chapterId = "chapter_1") {
  const chapter = getChapter(chapterId);
  const progress = getChapterProgress(chapterId);
  if (!chapter || !progress) return false;
  progress.unlockedNodeIds = chapter.nodes.map((node) => node.nodeId);
  progress.currentNodeId = progress.unlockedNodeIds.find((id) => !progress.clearedNodeIds.includes(id)) || progress.unlockedNodeIds[0] || "";
  savePlayerProfile();
  return true;
}

function debugEnterSelectedNode() {
  startAdventureNode(debugSelectedNodeId, debugSelectedChapterId);
  setDebugNotice(`已进入节点 ${debugSelectedNodeId} 的 LOADOUT。`);
}

function debugMarkSelectedNodeCleared() {
  const result = markAdventureNodeCleared(debugSelectedChapterId, debugSelectedNodeId);
  setDebugNotice(result ? `已标记通关：${result.node.displayId} ${result.node.name}` : "标记通关失败：节点不存在。");
}

function debugUnlockAllNodes() {
  setDebugNotice(unlockAllChapterNodes(debugSelectedChapterId) ? "已解锁当前章节全部节点。" : "解锁节点失败。");
}

function debugResetChapter() {
  setDebugNotice(resetChapterProgress(debugSelectedChapterId) ? "已重置当前章节进度。" : "重置章节进度失败。");
}

function debugUnlockCharacter(roleId = debugSelectedRoleId) {
  if (!DATA.roles?.[roleId]) return false;
  if (!playerMeta.ownedCharacters.includes(roleId)) playerMeta.ownedCharacters.push(roleId);
  if (!playerMeta.unlockedCharacterIds.includes(roleId)) playerMeta.unlockedCharacterIds.push(roleId);
  if (!playerMeta.ownedRoles.includes(roleId)) playerMeta.ownedRoles.push(roleId);
  playerMeta.characterLevels[roleId] = playerMeta.characterLevels[roleId] || 1;
  syncPlayerMetaAliases();
  savePlayerProfile();
  return true;
}

function debugDeployRole(roleId = debugSelectedRoleId) {
  const role = DATA.roles?.[roleId];
  if (!role) return false;
  debugUnlockCharacter(roleId);
  if (![APP_STATE.DEPLOY, APP_STATE.BATTLE].includes(state.appState)) debugForceDeploy();
  if (!state.availableRoles.includes(roleId)) state.availableRoles.push(roleId);
  if (!state.loadoutRoleIds.includes(roleId)) state.loadoutRoleIds.push(roleId);
  if (state.deployedRoles.some((item) => item.roleId === roleId)) return true;
  const row = grid.rows - 1;
  const col = Array.from({ length: grid.columns }, (_, index) => index).find((index) => !roleAt(index, row));
  if (col === undefined) {
    setDebugNotice("底部 5 格已满，无法继续上阵。");
    return false;
  }
  if (state.appState === APP_STATE.BATTLE) {
    const pos = cellCenter(col, row);
    state.deployedRoles.push({
      id: makeId(),
      roleId,
      col,
      row,
      x: pos.x,
      y: pos.y,
      cooldown: 0,
      attacks: 0,
      lastTargetId: null,
      sameTargetStacks: 0,
      personalDamage: 1,
      personalSpeed: 1,
    });
    const art = martialArtForCharacter(roleId);
    if (art) getMartialRunState(art.id);
    return true;
  }
  const originalMaxSlots = playerMeta.maxDeploySlots;
  playerMeta.maxDeploySlots = Math.max(originalMaxSlots, state.deployedRoles.length + 1);
  state.selectedRoleId = roleId;
  const result = deployRole(col, row);
  playerMeta.maxDeploySlots = originalMaxSlots;
  return Boolean(result?.ok || state.deployedRoles.some((item) => item.roleId === roleId));
}

function debugRemoveRole(roleId = debugSelectedRoleId) {
  state.deployedRoles = state.deployedRoles.filter((role) => role.roleId !== roleId);
  state.availableRoles = (state.availableRoles || []).filter((id) => id !== roleId);
  state.loadoutRoleIds = (state.loadoutRoleIds || []).filter((id) => id !== roleId);
  return true;
}

function setRoleMartialLevel(roleId, level) {
  const art = martialArtForCharacter(roleId);
  if (!art) {
    setDebugNotice("该角色没有绑定先天武学。");
    return false;
  }
  const safeLevel = Math.max(1, Math.min(Number(art.maxLevel) || 7, Math.floor(Number(level) || 1)));
  state.martialArtLevels[art.id] = safeLevel;
  const runtime = getMartialRunState(art.id);
  const activeLevels = (art.levels || []).filter((item) => Number(item.level) <= safeLevel);
  runtime.selectedUpgradeIds = activeLevels.map((item) => `${art.id}_lv${item.level}`);
  runtime.minorEvolutionSelected = activeLevels.some((item) => item.evolutionType === "minor_evolution");
  const major = activeLevels.find((item) => item.evolutionType === "major_evolution");
  runtime.majorEvolutionSelected = Boolean(major);
  runtime.majorEvolutionId = major ? `${art.id}_${major.effectType || "major"}` : null;
  runtime.level = safeLevel;
  setDebugNotice(`${DATA.roles[roleId]?.name || roleId} 武学已设为 Lv${safeLevel}。`);
  return true;
}

function debugTriggerMartialEvolution(roleId, type) {
  const art = martialArtForCharacter(roleId);
  if (!art) return false;
  const level = (art.levels || []).find((item) => item.evolutionType === type);
  return setRoleMartialLevel(roleId, level?.level || (type === "major_evolution" ? 7 : 3));
}

function debugAddMajorEnhance(roleId = debugSelectedRoleId) {
  const art = martialArtForCharacter(roleId);
  if (!art) return false;
  const runtime = getMartialRunState(art.id);
  const upgrade = (art.evolvedUpgrades || []).find((item) => !runtime.evolvedUpgradeIds.includes(item.id));
  if (!upgrade) {
    setDebugNotice("该武学没有可添加的大成强化，或已全部添加。");
    return false;
  }
  runtime.majorEvolutionSelected = true;
  runtime.majorEvolutionId = runtime.majorEvolutionId || `${art.id}_major`;
  runtime.evolvedUpgradeIds.push(upgrade.id);
  if (!runtime.selectedUpgradeIds.includes(upgrade.id)) runtime.selectedUpgradeIds.push(upgrade.id);
  applyMartialModifierEffect({
    type: upgrade.effectType,
    martialArtId: art.id,
    value: Number(upgrade.value) || 0,
  });
  setDebugNotice(`已添加大成强化：${upgrade.title || upgrade.name || upgrade.id}`);
  return true;
}

function debugSetCharacterLevel(roleId = debugSelectedRoleId) {
  const level = Math.max(1, Math.floor(debugControlNumber("role-level", 1)));
  debugUnlockCharacter(roleId);
  playerMeta.characterLevels[roleId] = level;
  savePlayerProfile();
  setDebugNotice(`${DATA.roles[roleId]?.name || roleId} 角色等级已设为 ${level}。`);
}

function debugSetRoleDamageMultiplier(roleId = debugSelectedRoleId) {
  const multiplier = debugControlNumber("role-damage-mult", 1);
  if (!Number.isFinite(multiplier) || multiplier <= 0) {
    setDebugNotice("基础伤害倍率必须大于 0。");
    return;
  }
  state.deployedRoles.filter((role) => role.roleId === roleId).forEach((role) => {
    role.personalDamage = multiplier;
  });
  setDebugNotice(`${DATA.roles[roleId]?.name || roleId} 本局伤害倍率已设为 ${multiplier}。`);
}

function debugUnlockArtifact(artifactId = debugSelectedArtifactId) {
  if (!DATA.artifacts?.[artifactId]) return false;
  if (!playerMeta.ownedArtifacts.includes(artifactId)) playerMeta.ownedArtifacts.push(artifactId);
  playerMeta.artifactLevels[artifactId] = playerMeta.artifactLevels[artifactId] || 1;
  savePlayerProfile();
  return true;
}

function debugCarryArtifact(artifactId = debugSelectedArtifactId) {
  if (!DATA.artifacts?.[artifactId]) return false;
  debugUnlockArtifact(artifactId);
  state.selectedArtifactIds = Array.isArray(state.selectedArtifactIds) ? state.selectedArtifactIds : [];
  state.loadoutArtifactIds = Array.isArray(state.loadoutArtifactIds) ? state.loadoutArtifactIds : [];
  if (!state.selectedArtifactIds.includes(artifactId)) state.selectedArtifactIds.push(artifactId);
  if (!state.loadoutArtifactIds.includes(artifactId)) state.loadoutArtifactIds.push(artifactId);
  state.selectedArtifactId = state.selectedArtifactIds[0] || artifactId;
  state.loadoutArtifactId = state.loadoutArtifactIds[0] || artifactId;
  getSystemArtifactRuntimeState({ state, artifactId });
  return true;
}

function debugRemoveArtifact(artifactId = debugSelectedArtifactId) {
  state.selectedArtifactIds = (state.selectedArtifactIds || []).filter((id) => id !== artifactId);
  state.loadoutArtifactIds = (state.loadoutArtifactIds || []).filter((id) => id !== artifactId);
  state.selectedArtifactId = state.selectedArtifactIds[0] || "";
  state.loadoutArtifactId = state.loadoutArtifactIds[0] || "";
}

function setArtifactDebugLevel(artifactId, level) {
  debugCarryArtifact(artifactId);
  const runtime = getSystemArtifactRuntimeState({ state, artifactId });
  runtime.level = Math.max(1, Math.min(7, Math.floor(Number(level) || 1)));
  runtime.minorEvolutionSelected = runtime.level >= 3 ? runtime.minorEvolutionSelected : false;
  runtime.majorEvolutionSelected = runtime.level >= 7 ? true : runtime.majorEvolutionSelected && runtime.level >= 7;
  if (runtime.majorEvolutionSelected) runtime.majorEvolutionId = runtime.majorEvolutionId || `${artifactId}_major_evolution`;
  setDebugNotice(`${DATA.artifacts[artifactId]?.name || artifactId} 已设为 Lv${runtime.level}。`);
}

function debugTriggerArtifactEvolution(artifactId, type) {
  debugCarryArtifact(artifactId);
  const runtime = getSystemArtifactRuntimeState({ state, artifactId });
  if (type === "minor") {
    runtime.level = Math.max(runtime.level, 3);
    runtime.minorEvolutionSelected = true;
  } else {
    runtime.level = 7;
    runtime.majorEvolutionSelected = true;
    runtime.majorEvolutionId = runtime.majorEvolutionId || `${artifactId}_major_evolution`;
  }
  setDebugNotice(`${DATA.artifacts[artifactId]?.name || artifactId} 已触发${type === "minor" ? "小进化" : "大成"}。`);
}

function artifactDebugCallbacks() {
  return {
    addFloater(floater) {
      state.floaters.push(floater);
    },
    addZone(zone) {
      state.zones = state.zones || [];
      state.zones.push(zone);
    },
    addVisualEvent,
    areaDamage,
    damageEnemy(enemy, damage, source) {
      enemy.takeDamage(damage, source);
    },
    drawShot,
    getArtifactOrigin() {
      return { x: canvas.width / 2, y: canvas.height - grid.cellH * 0.35 };
    },
    healArrayCore(amount) {
      state.arrayCoreHp = Math.min(state.arrayCoreMaxHp, state.arrayCoreHp + amount);
      syncBaseHpAliases();
    },
    spawnArtifactProjectile,
  };
}

function debugTriggerArtifactNow(artifactId = debugSelectedArtifactId) {
  debugCarryArtifact(artifactId);
  const triggered = window.XM.Artifacts.triggerArtifact({ state, DATA, artifactId, callbacks: artifactDebugCallbacks() });
  setDebugNotice(triggered ? `已立即触发法宝：${DATA.artifacts[artifactId]?.name || artifactId}` : "法宝未触发：当前没有可用目标或配置缺失。");
}

function debugResetArtifactCooldown(artifactId = debugSelectedArtifactId) {
  const runtime = getSystemArtifactRuntimeState({ state, artifactId });
  runtime.cooldownTimer = 0;
  state.artifactCooldowns[artifactId] = 0;
  setDebugNotice("法宝冷却已重置。");
}

function debugSwitchFormation(formationId = debugSelectedFormationId) {
  const formation = DATA.formations?.[formationId];
  if (!formation) return false;
  if (!playerMeta.unlockedFormations.includes(formationId)) playerMeta.unlockedFormations.push(formationId);
  state.selectedFormationId = formationId;
  state.loadoutFormationId = formationId;
  window.XM.Formations.applyFormationPassive({ state, formation });
  savePlayerProfile();
  return true;
}

function formationDebugCallbacks() {
  return {
    addZone(zone) {
      state.zones.push(zone);
    },
    addFloater(floater) {
      state.floaters.push(floater);
    },
    addVisualEvent,
    damageEnemy(enemy, damage, source) {
      enemy.takeDamage(damage, source);
    },
    gainLingqi,
    getFormationBase() {
      return { x: canvas.width / 2, y: canvas.height - grid.cellH / 2 };
    },
    healArrayCore(amount) {
      state.arrayCoreHp = Math.min(state.arrayCoreMaxHp, state.arrayCoreHp + amount);
      syncBaseHpAliases();
    },
    nearestEnemies,
    setStatus,
    spawnFormationProjectile(payload) {
      spawnArtifactProjectile({
        artifact: { id: payload.formation.id, name: payload.formation.name },
        target: payload.target,
        origin: payload.origin,
        projectileIndex: payload.projectileIndex,
        projectileCount: payload.projectileCount,
        projectileType: payload.formation.projectileType || "formation_sword_projectile",
        sourceType: "formation",
        damage: payload.formation.damage,
        pierceCount: payload.formation.pierceCount,
        speed: 430,
        hitRadius: 16,
        color: "#e9ffff",
      });
    },
  };
}

function debugTriggerFormationNow(formationId = debugSelectedFormationId) {
  debugSwitchFormation(formationId);
  const formation = DATA.formations?.[formationId];
  const triggered = formation && window.XM.Formations.triggerFormation({
    state,
    DATA,
    formation,
    callbacks: formationDebugCallbacks(),
    helpers: { distance, grid },
  });
  setDebugNotice(triggered ? `已立即触发阵法：${formation.name}` : "阵法未触发：当前没有可用目标或配置缺失。");
}

function debugResetFormationCooldown(formationId = debugSelectedFormationId) {
  const runtime = window.XM.Formations.getFormationRuntimeState({ state, formationId });
  runtime.cooldownTimer = 0;
  state.formationCooldown = 0;
  setDebugNotice("阵法冷却已重置。");
}

function debugSetArrayCoreHp(ratioOrValue) {
  const value = ratioOrValue <= 1 ? state.arrayCoreMaxHp * ratioOrValue : ratioOrValue;
  state.arrayCoreHp = Math.max(1, Math.min(state.arrayCoreMaxHp, Math.round(value)));
  syncBaseHpAliases();
}

function debugSpawnEnemy(enemyId = debugSelectedEnemyId, count = 1, position = "gate") {
  if (!DATA.enemies?.[enemyId]) {
    setDebugNotice("怪物配置不存在。");
    return false;
  }
  const safeCount = Math.max(1, Math.min(50, Math.floor(Number(count) || 1)));
  const lineY = attackLineY();
  const minX = grid.cellW * 0.35;
  const maxX = canvas.width - grid.cellW * 0.35;
  const yByPosition = {
    gate: grid.cellH * 0.25,
    upper: grid.cellH * 1.5,
    middle: grid.cellH * 3.2,
    front: Math.max(grid.cellH, lineY - grid.cellH * 0.35),
  };
  for (let i = 0; i < safeCount; i += 1) {
    const enemy = createEnemy(enemyId);
    const laneX = ((i % grid.columns) + 0.5) * grid.cellW;
    enemy.x = position === "random" ? minX + Math.random() * (maxX - minX) : Math.max(minX, Math.min(maxX, laneX));
    enemy.y = position === "random"
      ? grid.cellH * 0.4 + Math.random() * Math.max(1, lineY - grid.cellH * 0.9)
      : yByPosition[position] ?? yByPosition.gate;
    enemy.y = Math.max(-grid.cellH * 0.35, Math.min(lineY - 4, enemy.y));
    enemy.progress = Math.max(0, Math.min(0.94, (enemy.y + grid.cellH * 0.35) / (lineY + grid.cellH * 0.35)));
    enemy.lastX = enemy.x;
    enemy.lastY = enemy.y;
    state.enemies.push(enemy);
  }
  setDebugNotice(`已生成 ${safeCount} 只 ${DATA.enemies[enemyId].name || enemyId}。`);
  return true;
}

function debugSpawnBoss() {
  const boss = Object.values(DATA.enemies || {}).find((enemy) => enemy.id === "black_gate_guardian")
    || Object.values(DATA.enemies || {}).find((enemy) => enemy.isBoss);
  if (!boss) {
    setDebugNotice("没有找到 Boss 配置。");
    return;
  }
  debugSpawnEnemy(boss.id, 1, "upper");
}

function debugOpenPerkChoices() {
  state.appState = APP_STATE.LEVEL_UP_REWARD;
  state.running = false;
  state.paused = true;
  showPerkChoices();
  setDebugNotice("已打开当前三选一。");
}

function getFilteredDebugPerkRows() {
  const rows = getDebugPerkRows();
  const filter = debugPerkFilter;
  if (filter === "martial") return rows.filter((row) => row.targetType === "martial_art" || row.scope === "martial_art" || String(row.category).includes("武学"));
  if (filter === "artifact") return rows.filter((row) => row.targetType === "artifact" || row.scope === "artifact" || String(row.category).includes("法宝"));
  if (filter === "major") return rows.filter((row) => String(row.upgradeType || row.upgradeKind || row.category).includes("major") || String(row.category).includes("大成"));
  if (filter === "normal") return rows.filter((row) => !row.invalidReason && !String(row.category).includes("大成"));
  if (filter === "invalid") return rows.filter((row) => row.invalidReason);
  return rows;
}

function unlockAllArtifacts() {
  Object.keys(DATA.artifacts || {}).forEach((id) => debugUnlockArtifact(id));
  setDebugNotice("已解锁全部法宝。");
}

function getDebugSnapshot() {
  const chapterProgress = playerMeta.chapterProgress?.chapter_1 || {};
  return {
    APP_STATE: state.appState,
    currentView: state.phase || "",
    currentChapterId: state.currentChapterId || "",
    currentNodeId: state.currentNodeId || "",
    currentBattleConfigId: state.currentBattleConfigId || "",
    "player.level": state.runLevel,
    "profile.playerLevel": playerMeta.playerLevel,
    "profile.playerExp": playerMeta.playerExp,
    "profile.spiritStones": playerMeta.spiritStones,
    "profile.loadedFromLocalStorage": playerProfileLoadedFromStorage,
    "profile.highestWave": playerMeta.highestWave,
    "profile.totalKills": playerMeta.totalKills,
    "profile.maxDeploySlots": playerMeta.maxDeploySlots,
    "profile.maxArtifactSlots": playerMeta.maxArtifactSlots,
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
    "visualEvents.length": state.visualEvents?.length || 0,
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
    "artifacts.length": (state.selectedArtifactIds || []).length,
    selectedArtifact: (state.selectedArtifactIds || []).join(", "),
    selectedArtifacts: (state.selectedArtifactIds || []).join(", "),
    selectedFormation: state.selectedFormationId || state.loadoutFormationId || "",
    selectedCharacters: (state.availableRoles || state.loadoutRoleIds || []).join(", "),
    deployedCharacters: state.deployedRoles.map((role) => role.roleId).join(", "),
    chapterProgress: JSON.stringify({
      unlocked: chapterProgress.unlockedNodeIds?.length || 0,
      cleared: chapterProgress.clearedNodeIds?.length || 0,
      current: chapterProgress.currentNodeId || "",
      lastCleared: chapterProgress.lastClearedNodeId || "",
      storyFlags: Object.keys(chapterProgress.storyFlags || {}),
    }),
    artifactCooldown: JSON.stringify(state.artifactCooldowns || {}),
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
    ["currentView", snapshot.currentView],
    ["currentChapterId", snapshot.currentChapterId],
    ["currentNodeId", snapshot.currentNodeId],
    ["currentBattleConfigId", snapshot.currentBattleConfigId],
    ["wave", snapshot.wave],
    ["arrayCoreHp / arrayCoreMaxHp", `${snapshot.arrayCoreHp} / ${snapshot.arrayCoreMaxHp}`],
    ["arrayCoreDefense", snapshot.arrayCoreDefense],
    ["runState.level", snapshot["player.level"]],
    ["spiritQi / nextLevelSpiritQi", `${snapshot["player.spiritQi"]} / ${snapshot["player.nextLevelSpiritQi"]}`],
    ["enemies.length", snapshot["enemies.length"]],
    ["projectiles.length", snapshot["projectiles.length"]],
    ["visualEvents.length", snapshot["visualEvents.length"]],
    ["playerProfile.loadedFromLocalStorage", snapshot["profile.loadedFromLocalStorage"]],
    ["playerProfile.playerLevel", snapshot["profile.playerLevel"]],
    ["playerProfile.playerExp", snapshot["profile.playerExp"]],
    ["playerProfile.spiritStones", snapshot["profile.spiritStones"]],
    ["playerProfile.ownedCharacterCount", snapshot["profile.ownedCharacterCount"]],
    ["playerProfile.characterLevels", snapshot["profile.characterLevels"]],
    ["playerProfile.highestWave", snapshot["profile.highestWave"]],
    ["playerProfile.totalKills", snapshot["profile.totalKills"]],
    ["selected characters", snapshot.selectedCharacters],
    ["deployed characters", snapshot.deployedCharacters],
    ["selected artifacts", snapshot.selectedArtifacts],
    ["selected formation", snapshot.selectedFormation],
    ["chapterProgress", snapshot.chapterProgress],
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
  return Object.values(DATA.artifacts || {}).map((artifact) => {
    const runtime = state.artifactRuntime?.[artifact.id] || {};
    return {
      id: artifact.id,
      __scope: "artifacts",
      __id: artifact.id,
      name: artifact.name,
      rarity: artifact.rarity || "",
      role: artifact.role || artifact.type || "",
      owned: playerMeta.ownedArtifacts.includes(artifact.id),
      selected: (state.selectedArtifactIds || []).includes(artifact.id),
      runtimeLevel: runtime.level || 1,
      minorEvolutionSelected: Boolean(runtime.minorEvolutionSelected),
      majorEvolutionSelected: Boolean(runtime.majorEvolutionSelected),
      damage: artifact.damage,
      cooldown: artifact.cooldown,
      projectileType: artifact.projectileType || "",
      effectType: artifact.effectType || "",
      targetRule: artifact.targetRule || artifact.targeting || "",
      description: artifact.description || artifact.attackText || "",
      runtimeCooldown: state.artifactCooldowns?.[artifact.id] ?? runtime.cooldownTimer ?? "",
    };
  });
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
      scope: perk.scope || "",
      category: perk.category || "",
      upgradeType: perk.upgradeType || perk.upgradeKind || perk.effect?.upgradeType || "",
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
    selected: state.selectedFormationId === formation.id || state.loadoutFormationId === formation.id,
    triggerType: formation.triggerType || "cooldown",
    triggerInterval: formation.triggerInterval || formation.cooldown,
    effectType: formation.effectType,
    effectValue: formation.effectValue || formation.maxTargets || "",
    cooldown: formation.cooldown,
    unlockCondition: formation.unlockCondition || formation.rarity || "",
    description: formation.description || formation.effectText || "",
    runtime: JSON.stringify(state.formationRuntime?.[formation.id] || {}),
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
    ["export", "导出 JSON"],
  ];
  const renderKey = actions.map(([id, label]) => `${id}:${label}`).join("|");
  if (debugActionsRenderKey === renderKey) return;
  debugActionsRenderKey = renderKey;
  debugActionsPanel.innerHTML = actions.map(([id, label]) => `<button type="button" data-debug-action="${id}">${safeText(label)}</button>`).join("");
}

function renderDebugButtonGrid(buttons) {
  return `<div class="debug-button-grid">${buttons.map(([id, label]) => `<button type="button" data-debug-action="${safeText(id)}">${safeText(label)}</button>`).join("")}</div>`;
}

function renderDebugBattleTab() {
  return `
    <section class="debug-tool-section">
      <h3>战斗调试</h3>
      ${renderDebugButtonGrid([
        ["refresh", "刷新运行时数据"],
        ["levelUp", "本局升一级"],
        ["grantLingqi100", "+100 灵气"],
        ["grantSpiritStones1000", "+1000 灵石"],
        ["healCore", "阵眼回满血"],
        ["clearEnemies", "清空怪物"],
        ["clearProjectiles", "清空弹道"],
        ["clearVisualEvents", "清空 visualEvents"],
        ["pauseBattle", "暂停战斗"],
        ["resumeBattle", "恢复战斗"],
        ["forceBattle", "强制进入 BATTLE"],
        ["forceLoadout", "强制进入 LOADOUT"],
        ["forceDeploy", "强制进入 DEPLOY"],
        ["forceWin", "强制结算胜利"],
        ["forceLose", "强制结算失败"],
      ])}
    </section>
    ${debugTable([{ key: "key", label: "字段" }, { key: "value", label: "当前值" }], getDebugStateRows())}
  `;
}

function renderDebugChapterWaveTab() {
  ensureDebugSelections();
  const chapters = Object.values(DATA.chapters || {});
  const chapter = getChapter(debugSelectedChapterId) || chapters[0];
  const nodes = chapter?.nodes || [];
  if (DEBUG_UI_STATE.targetWaveInput == null) DEBUG_UI_STATE.targetWaveInput = String(state.wave || 1);
  return `
    <section class="debug-tool-section">
      <h3>自由跳波</h3>
      <div class="debug-control-row">
        <span>当前波次：${safeText(state.wave || 1)}</span>
        <label>目标波次 <input class="debug-field" data-debug-control="target-wave" data-debug-input="target-wave" type="number" min="1" step="1" value="${safeText(DEBUG_UI_STATE.targetWaveInput)}" /></label>
        <button type="button" data-debug-action="jumpWaveCustom">跳到指定波次</button>
      </div>
      ${renderDebugButtonGrid([
        ["jumpWave1", "跳到第1波"],
        ["jumpWave5", "跳到第5波"],
        ["jumpWave10", "跳到第10波"],
        ["jumpWave15", "跳到第15波"],
        ["nextWave", "下一波"],
      ])}
    </section>
    <section class="debug-tool-section">
      <h3>章节节点</h3>
      <div class="debug-control-row">
        <label>章节 <select class="debug-field" data-debug-control="chapter-select">${debugSelectOptions(chapters, debugSelectedChapterId, (item) => `${item.chapterId} · ${item.name}`)}</select></label>
        <label>节点 <select class="debug-field" data-debug-control="node-select">${debugSelectOptions(nodes, debugSelectedNodeId, (item) => `${item.displayId} ${item.name}`)}</select></label>
      </div>
      ${renderDebugButtonGrid([
        ["enterSelectedNode", "进入该节点"],
        ["markSelectedNodeCleared", "标记该节点通关"],
        ["unlockAllNodes", "解锁全部节点"],
        ["resetChapterProgress", "重置章节进度"],
      ])}
    </section>
    <h3>波次配置</h3>
    ${debugEditableTable([{ key: "wave", editable: true, type: "number" }, { key: "enemyId", editable: true }, { key: "count", editable: true, type: "number" }, { key: "spawnInterval", editable: true, type: "number" }, { key: "delay", editable: true, type: "number", field: "startDelay" }, { key: "goal", editable: true }, { key: "isBossWave", editable: true, type: "boolean" }, { key: "active" }], getDebugWaveRows())}
  `;
}

function renderDebugRoleMartialTab() {
  ensureDebugSelections();
  const role = DATA.roles?.[debugSelectedRoleId] || {};
  const art = martialArtForCharacter(debugSelectedRoleId);
  const deployed = state.deployedRoles.some((item) => item.roleId === debugSelectedRoleId);
  const unlocked = playerMeta.ownedCharacters.includes(debugSelectedRoleId);
  const martialLevel = art ? state.martialArtLevels?.[art.id] || 0 : 0;
  return `
    <section class="debug-tool-section">
      <h3>通用角色 / 先天武学调试</h3>
      <div class="debug-control-row">
        <label>角色 <select class="debug-field" data-debug-control="role-select">${debugSelectOptions(Object.values(DATA.roles || {}), debugSelectedRoleId, (item) => `${item.name} · ${item.id}`)}</select></label>
        <label>角色等级 <input class="debug-field" data-debug-control="role-level" type="number" min="1" step="1" value="${safeText(getCharacterLevel(debugSelectedRoleId) || 1)}" /></label>
        <label>本局伤害倍率 <input class="debug-field" data-debug-control="role-damage-mult" type="number" min="0.01" step="0.05" value="${safeText(state.deployedRoles.find((item) => item.roleId === debugSelectedRoleId)?.personalDamage || 1)}" /></label>
      </div>
      <div class="debug-info-grid">
        <span>角色：${safeText(role.name || "-")}</span>
        <span>rarity：${safeText(role.rarity || "-")}</span>
        <span>school：${safeText(role.school || "-")}</span>
        <span>martialArtName：${safeText(art?.name || role.martialArtName || "-")}</span>
        <span>本局武学等级：${safeText(martialLevel || "-")}</span>
        <span>已上阵：${deployed ? "是" : "否"}</span>
        <span>已解锁：${unlocked ? "是" : "否"}</span>
      </div>
      ${renderDebugButtonGrid([
        ["unlockSelectedRole", "解锁该角色"],
        ["deploySelectedRole", "上阵该角色"],
        ["removeSelectedRole", "移除该角色"],
        ["setRoleLevel", "设置角色等级"],
        ["setRoleDamageMult", "设置基础伤害倍率"],
        ["setRoleMartialLv1", "设置武学 Lv1"],
        ["setRoleMartialLv3", "设置武学 Lv3"],
        ["setRoleMartialLv6", "设置武学 Lv6"],
        ["setRoleMartialLv7", "设置武学 Lv7"],
        ["triggerRoleMinor", "触发小进化"],
        ["triggerRoleMajor", "触发大成"],
        ["addRoleMajorEnhance", "添加一次大成强化"],
      ])}
      <h4>陆青崖快捷</h4>
      ${renderDebugButtonGrid([
        ["qingyaLv3", "陆青崖武学 Lv3"],
        ["qingyaLv6", "陆青崖武学 Lv6"],
        ["qingyaLv7", "陆青崖武学 Lv7"],
      ])}
    </section>
    <h3>角色表</h3>
    ${debugEditableTable([{ key: "id" }, { key: "name", editable: true }, { key: "rarity", editable: true, options: ["SR", "SSR", "UR", "SP"] }, { key: "rankTitle", editable: true }, { key: "school", editable: true }, { key: "role", editable: true }, { key: "baseDamage", editable: true, type: "number" }, { key: "baseAttackSpeed", editable: true, type: "number" }, { key: "baseRange", editable: true, type: "number" }, { key: "projectileType", editable: true }, { key: "trajectoryType", editable: true }, { key: "owned" }, { key: "deployed" }, { key: "level" }], getDebugRoleRows())}
    <h3>先天武学表</h3>
    ${debugEditableTable([{ key: "martialArtId" }, { key: "name", editable: true }, { key: "ownerCharacterId", editable: true }, { key: "maxLevel", editable: true, type: "number" }, { key: "martialArtLevel" }, { key: "selectedUpgradeIds" }, { key: "minorEvolutionSelected" }, { key: "majorEvolutionSelected" }, { key: "projectileCount", editable: true, type: "number", field: "debugParams.projectileCount" }, { key: "volleyCount", editable: true, type: "number", field: "debugParams.volleyCount" }, { key: "damageMultiplier", editable: true, type: "number", field: "debugParams.damageMultiplier" }, { key: "attackIntervalMultiplier", editable: true, type: "number", field: "debugParams.attackIntervalMultiplier" }, { key: "pierceCount", editable: true, type: "number", field: "debugParams.pierceCount" }, { key: "majorEvolutionId" }], getDebugMartialRows())}
  `;
}

function renderDebugArtifactTab() {
  ensureDebugSelections();
  const artifact = DATA.artifacts?.[debugSelectedArtifactId] || {};
  const runtime = state.artifactRuntime?.[debugSelectedArtifactId] || {};
  return `
    <section class="debug-tool-section">
      <h3>法宝调试</h3>
      <div class="debug-control-row">
        <label>法宝 <select class="debug-field" data-debug-control="artifact-select">${debugSelectOptions(Object.values(DATA.artifacts || {}), debugSelectedArtifactId, (item) => `${item.name} · ${item.id}`)}</select></label>
      </div>
      <div class="debug-info-grid">
        <span>法宝名：${safeText(artifact.name || "-")}</span>
        <span>定位：${safeText(artifact.role || artifact.type || "-")}</span>
        <span>已拥有：${playerMeta.ownedArtifacts.includes(debugSelectedArtifactId) ? "是" : "否"}</span>
        <span>本局携带：${(state.selectedArtifactIds || []).includes(debugSelectedArtifactId) ? "是" : "否"}</span>
        <span>本局等级：${safeText(runtime.level || 1)}</span>
        <span>小进化：${runtime.minorEvolutionSelected ? "是" : "否"}</span>
        <span>大成：${runtime.majorEvolutionSelected ? "是" : "否"}</span>
      </div>
      ${renderDebugButtonGrid([
        ["unlockSelectedArtifact", "解锁该法宝"],
        ["carrySelectedArtifact", "本局携带该法宝"],
        ["removeSelectedArtifact", "从本局移除该法宝"],
        ["setArtifactLv1", "设置法宝 Lv1"],
        ["setArtifactLv3", "设置法宝 Lv3"],
        ["setArtifactLv6", "设置法宝 Lv6"],
        ["setArtifactLv7", "设置法宝 Lv7"],
        ["triggerArtifactMinor", "触发小进化"],
        ["triggerArtifactMajor", "触发大成"],
        ["triggerArtifactNow", "立即触发该法宝攻击"],
        ["resetArtifactCooldown", "重置该法宝冷却"],
      ])}
    </section>
    ${debugEditableTable([{ key: "id" }, { key: "name", editable: true }, { key: "rarity", editable: true }, { key: "role" }, { key: "runtimeLevel" }, { key: "owned" }, { key: "selected" }, { key: "minorEvolutionSelected" }, { key: "majorEvolutionSelected" }, { key: "damage", editable: true, type: "number" }, { key: "cooldown", editable: true, type: "number" }, { key: "projectileType", editable: true }, { key: "effectType", editable: true }, { key: "runtimeCooldown" }], getDebugArtifactRows())}
  `;
}

function renderDebugFormationTab() {
  ensureDebugSelections();
  const formation = DATA.formations?.[debugSelectedFormationId] || {};
  return `
    <section class="debug-tool-section">
      <h3>护山大阵调试</h3>
      <div class="debug-control-row">
        <label>阵法 <select class="debug-field" data-debug-control="formation-select">${debugSelectOptions(Object.values(DATA.formations || {}), debugSelectedFormationId, (item) => `${item.name} · ${item.id}`)}</select></label>
      </div>
      <div class="debug-info-grid">
        <span>阵法名：${safeText(formation.name || "-")}</span>
        <span>定位：${safeText(formation.role || formation.rarity || "-")}</span>
        <span>本局选择：${state.selectedFormationId === debugSelectedFormationId || state.loadoutFormationId === debugSelectedFormationId ? "是" : "否"}</span>
        <span>cooldown：${safeText(state.formationCooldown || 0)}</span>
        <span>runtime：${safeText(JSON.stringify(state.formationRuntime?.[debugSelectedFormationId] || {}))}</span>
      </div>
      <p>${safeText(formation.effectText || formation.description || "")}</p>
      ${renderDebugButtonGrid([
        ["switchSelectedFormation", "本局切换为该阵法"],
        ["triggerFormationNow", "立即触发阵法效果"],
        ["resetFormationCooldown", "重置阵法冷却"],
        ["healCore", "阵眼回满血"],
        ["coreHp30", "阵眼设为 30% 血量"],
        ["coreHp1", "阵眼设为 1 点血"],
      ])}
    </section>
    ${debugEditableTable([{ key: "id" }, { key: "name", editable: true }, { key: "selected" }, { key: "triggerType", editable: true }, { key: "triggerInterval", editable: true, type: "number" }, { key: "effectType", editable: true }, { key: "effectValue", editable: true, type: "number", field: "maxTargets" }, { key: "cooldown", editable: true, type: "number" }, { key: "description", editable: true, type: "textarea", field: "effectText" }, { key: "runtime" }], getDebugFormationRows())}
    ${debugTable([{ key: "key", label: "字段" }, { key: "value", label: "当前值" }], getDebugArrayCoreRows())}
  `;
}

function renderDebugEnemyTab() {
  ensureDebugSelections();
  const enemy = DATA.enemies?.[debugSelectedEnemyId] || {};
  const aliveCount = state.enemies.filter(isEnemyAlive).length;
  const bossExists = state.enemies.some((item) => item.config?.isBoss || item.isBoss);
  return `
    <section class="debug-tool-section">
      <h3>怪物生成器</h3>
      <div class="debug-control-row">
        <label>怪物 <select class="debug-field" data-debug-control="enemy-select">${debugSelectOptions(Object.values(DATA.enemies || {}), debugSelectedEnemyId, (item) => `${item.name} · ${item.id}`)}</select></label>
        <label>数量 <input class="debug-field" data-debug-control="enemy-count" type="number" min="1" max="50" step="1" value="1" /></label>
        <label>位置 <select class="debug-field" data-debug-control="enemy-position">
          <option value="gate">妖门区</option>
          <option value="upper">妖兽行进区上段</option>
          <option value="middle">妖兽行进区中段</option>
          <option value="front">阵眼前方</option>
          <option value="random">随机位置</option>
        </select></label>
      </div>
      <div class="debug-info-grid">
        <span>当前配置：${safeText(enemy.name || "-")}</span>
        <span>enemies.length：${state.enemies.length}</span>
        <span>alive enemies：${aliveCount}</span>
        <span>Boss 存在：${bossExists ? "是" : "否"}</span>
      </div>
      ${renderDebugButtonGrid([
        ["spawnSelectedEnemy", "生成怪物"],
        ["spawnEnemy1", "生成 1 只"],
        ["spawnEnemy5", "生成 5 只"],
        ["spawnEnemy10", "生成 10 只"],
        ["spawnBoss", "生成 Boss"],
        ["clearEnemies", "清空怪物"],
      ])}
    </section>
    ${debugEditableTable([{ key: "id" }, { key: "name", editable: true }, { key: "hp", editable: true, type: "number" }, { key: "moveSpeed", editable: true, type: "number" }, { key: "attackDamage", editable: true, type: "number" }, { key: "attackInterval", editable: true, type: "number" }, { key: "spiritQiReward", editable: true, type: "number" }, { key: "hitRadius", editable: true, type: "number" }, { key: "isElite", editable: true, type: "boolean" }, { key: "isBoss", editable: true, type: "boolean" }], getDebugEnemyRows())}
  `;
}

function renderDebugPerkTab() {
  const filterOptions = [
    ["all", "全部"],
    ["martial", "角色武学"],
    ["artifact", "法宝"],
    ["major", "大成"],
    ["normal", "普通"],
    ["invalid", "无效候选"],
  ];
  return `
    <section class="debug-tool-section">
      <h3>机缘 / 升级候选调试</h3>
      <div class="debug-control-row">
        <label>过滤 <select class="debug-field" data-debug-control="perk-filter">${filterOptions.map(([value, label]) => `<option value="${value}" ${debugPerkFilter === value ? "selected" : ""}>${label}</option>`).join("")}</select></label>
      </div>
      ${renderDebugButtonGrid([
        ["openPerkChoices", "立即打开三选一"],
        ["perkFilterMartial", "生成角色武学候选"],
        ["perkFilterArtifact", "生成法宝候选"],
        ["perkFilterMajor", "生成大成候选"],
        ["perkFilterNormal", "生成普通候选"],
        ["perkRefresh", "刷新候选池"],
        ["perkClear", "清空候选池"],
      ])}
    </section>
    ${debugEditableTable([{ key: "id" }, { key: "displayName", editable: true, field: "name" }, { key: "targetType", editable: true }, { key: "targetId", editable: true }, { key: "targetName", editable: true }, { key: "category", editable: true }, { key: "effectType", editable: true }, { key: "upgradeType" }, { key: "duplicateKey" }, { key: "invalidReason" }, { key: "isDuplicateThisRoll" }, { key: "actualEffectPreview" }, { key: "finalWeight" }], getFilteredDebugPerkRows())}
  `;
}

function renderDebugSaveTab() {
  return `
    <section class="debug-tool-section">
      <h3>存档调试</h3>
      ${renderDebugButtonGrid([
        ["savePlayerProfile", "保存玩家存档"],
        ["reloadPlayerProfile", "重新读取玩家存档"],
        ["clearPlayerProfile", "清空玩家存档"],
        ["reset", "清空调试数据"],
        ["export", "导出 JSON"],
        ["copyDebugExport", "复制 JSON 到剪贴板"],
        ["resetChapterProgress", "重置章节进度"],
        ["unlockAllCharacters", "解锁全部角色"],
        ["unlockAllArtifacts", "解锁全部法宝"],
        ["grantSpiritStones1000", "+1000 灵石"],
      ])}
    </section>
    <textarea class="debug-json" readonly>${safeText(JSON.stringify({
      playerProfile: playerMeta,
      chapterProgress: playerMeta.chapterProgress,
      debugOverrides,
    }, null, 2))}</textarea>
  `;
}

function renderDebugContent() {
  const rarityOptions = ["SR", "SSR", "UR", "SP", "初始", "普通", "稀有", "史诗", "传说"];
  if (activeDebugTab === "状态") {
    debugContent.innerHTML = debugTable([{ key: "key", label: "字段" }, { key: "value", label: "当前值" }], getDebugStateRows());
  } else if (activeDebugTab === "战斗") {
    debugContent.innerHTML = renderDebugBattleTab();
  } else if (activeDebugTab === "章节 / 波次") {
    debugContent.innerHTML = renderDebugChapterWaveTab();
  } else if (activeDebugTab === "角色 / 先天武学") {
    debugContent.innerHTML = renderDebugRoleMartialTab();
  } else if (activeDebugTab === "机缘 / 升级候选") {
    debugContent.innerHTML = renderDebugPerkTab();
  } else if (activeDebugTab === "怪物") {
    debugContent.innerHTML = renderDebugEnemyTab();
  } else if (activeDebugTab === "法宝") {
    debugContent.innerHTML = renderDebugArtifactTab();
  } else if (activeDebugTab === "护山大阵") {
    debugContent.innerHTML = renderDebugFormationTab();
  } else if (activeDebugTab === "存档") {
    debugContent.innerHTML = renderDebugSaveTab();
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
    snapshot: getDebugSnapshot(),
    playerProfile: playerMeta,
    chapterProgress: playerMeta.chapterProgress,
    mergedData: getMergedDebugData(),
  };
  debugContent.innerHTML = `<div class="debug-export"><button type="button" data-debug-copy-export="overrides">复制 debugOverrides</button><button type="button" data-debug-copy-export="merged">复制 mergedData</button><button type="button" data-debug-copy-export="profile">复制 playerProfile</button><textarea class="debug-json" readonly>${safeText(JSON.stringify(payload, null, 2))}</textarea></div>`;
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
  syncDebugUiStateFromDom();
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
    copyDebugExport: () => copyDebugText(JSON.stringify({ playerProfile: playerMeta, chapterProgress: playerMeta.chapterProgress, debugOverrides }, null, 2)),
    grantLingqi100: () => getDebugActions().grantLingqi(100),
    levelUp: () => getDebugActions().grantLingqi(Math.max(1, nextLevelRequirement() - state.lingqi)),
    qingyaLv3: () => setQingyaDebugLevel(3),
    qingyaLv6: () => setQingyaDebugLevel(6),
    qingyaLv7: () => setQingyaDebugLevel(7),
    jumpWave1: () => debugJumpToWave(1),
    jumpWave5: () => debugJumpToWave(5),
    jumpWave10: () => debugJumpToWave(10),
    jumpWave15: () => debugJumpToWave(15),
    jumpWaveCustom: () => debugJumpToWave(Number.parseInt(getDebugTargetWaveInput(), 10)),
    nextWave: () => debugJumpToWave((Number(state.wave) || 0) + 1),
    healCore: () => healArrayCoreFull(),
    clearEnemies: () => {
      state.enemies = [];
    },
    clearProjectiles: () => {
      state.projectiles = [];
    },
    clearVisualEvents: () => {
      state.visualEvents = [];
    },
    pauseBattle: () => {
      state.paused = true;
      state.running = false;
    },
    resumeBattle: () => {
      state.paused = false;
      state.running = true;
      if (state.appState === APP_STATE.LEVEL_UP_REWARD) state.appState = APP_STATE.BATTLE;
    },
    forceBattle: () => debugForceBattle(),
    forceLoadout: () => debugForceLoadout(),
    forceDeploy: () => debugForceDeploy(),
    forceWin: () => endGame(true),
    forceLose: () => endGame(false),
    enterSelectedNode: () => debugEnterSelectedNode(),
    markSelectedNodeCleared: () => debugMarkSelectedNodeCleared(),
    unlockAllNodes: () => debugUnlockAllNodes(),
    resetChapterProgress: () => debugResetChapter(),
    unlockSelectedRole: () => {
      debugUnlockCharacter(debugSelectedRoleId);
      setDebugNotice("角色已解锁。");
    },
    deploySelectedRole: () => {
      debugDeployRole(debugSelectedRoleId);
      setDebugNotice("角色已上阵。");
    },
    removeSelectedRole: () => {
      debugRemoveRole(debugSelectedRoleId);
      setDebugNotice("角色已从本局移除。");
    },
    setRoleLevel: () => debugSetCharacterLevel(debugSelectedRoleId),
    setRoleDamageMult: () => debugSetRoleDamageMultiplier(debugSelectedRoleId),
    setRoleMartialLv1: () => setRoleMartialLevel(debugSelectedRoleId, 1),
    setRoleMartialLv3: () => setRoleMartialLevel(debugSelectedRoleId, 3),
    setRoleMartialLv6: () => setRoleMartialLevel(debugSelectedRoleId, 6),
    setRoleMartialLv7: () => setRoleMartialLevel(debugSelectedRoleId, 7),
    triggerRoleMinor: () => debugTriggerMartialEvolution(debugSelectedRoleId, "minor_evolution"),
    triggerRoleMajor: () => debugTriggerMartialEvolution(debugSelectedRoleId, "major_evolution"),
    addRoleMajorEnhance: () => debugAddMajorEnhance(debugSelectedRoleId),
    unlockSelectedArtifact: () => {
      debugUnlockArtifact(debugSelectedArtifactId);
      setDebugNotice("法宝已解锁。");
    },
    carrySelectedArtifact: () => {
      debugCarryArtifact(debugSelectedArtifactId);
      setDebugNotice("法宝已加入本局携带。");
    },
    removeSelectedArtifact: () => {
      debugRemoveArtifact(debugSelectedArtifactId);
      setDebugNotice("法宝已从本局移除。");
    },
    setArtifactLv1: () => setArtifactDebugLevel(debugSelectedArtifactId, 1),
    setArtifactLv3: () => setArtifactDebugLevel(debugSelectedArtifactId, 3),
    setArtifactLv6: () => setArtifactDebugLevel(debugSelectedArtifactId, 6),
    setArtifactLv7: () => setArtifactDebugLevel(debugSelectedArtifactId, 7),
    triggerArtifactMinor: () => debugTriggerArtifactEvolution(debugSelectedArtifactId, "minor"),
    triggerArtifactMajor: () => debugTriggerArtifactEvolution(debugSelectedArtifactId, "major"),
    triggerArtifactNow: () => debugTriggerArtifactNow(debugSelectedArtifactId),
    resetArtifactCooldown: () => debugResetArtifactCooldown(debugSelectedArtifactId),
    switchSelectedFormation: () => {
      debugSwitchFormation(debugSelectedFormationId);
      setDebugNotice("已切换本局阵法。");
    },
    triggerFormationNow: () => debugTriggerFormationNow(debugSelectedFormationId),
    resetFormationCooldown: () => debugResetFormationCooldown(debugSelectedFormationId),
    coreHp30: () => {
      debugSetArrayCoreHp(0.3);
      setDebugNotice("阵眼血量已设为 30%。");
    },
    coreHp1: () => {
      debugSetArrayCoreHp(1);
      setDebugNotice("阵眼血量已设为 1。");
    },
    spawnSelectedEnemy: () => debugSpawnEnemy(debugSelectedEnemyId, debugControlNumber("enemy-count", 1), debugControlValue("enemy-position", "gate")),
    spawnEnemy1: () => debugSpawnEnemy(debugSelectedEnemyId, 1, debugControlValue("enemy-position", "gate")),
    spawnEnemy5: () => debugSpawnEnemy(debugSelectedEnemyId, 5, debugControlValue("enemy-position", "gate")),
    spawnEnemy10: () => debugSpawnEnemy(debugSelectedEnemyId, 10, debugControlValue("enemy-position", "gate")),
    spawnBoss: () => debugSpawnBoss(),
    openPerkChoices: () => debugOpenPerkChoices(),
    perkFilterMartial: () => {
      debugPerkFilter = "martial";
    },
    perkFilterArtifact: () => {
      debugPerkFilter = "artifact";
    },
    perkFilterMajor: () => {
      debugPerkFilter = "major";
    },
    perkFilterNormal: () => {
      debugPerkFilter = "normal";
    },
    perkRefresh: () => {
      setDebugNotice("候选池已刷新。");
    },
    perkClear: () => {
      perkGrid.innerHTML = "";
      setDebugNotice("正式三选一卡牌已清空。");
    },
    grantSpiritStones1000: () => getDebugActions().grantSpiritStones(1000),
    unlockAllCharacters: () => unlockAllCharacters(),
    unlockAllArtifacts: () => unlockAllArtifacts(),
    reloadPlayerProfile: () => {
      applyPlayerProfile(loadPlayerProfile());
      setDebugNotice("玩家存档已重新读取。");
    },
  };
  const handler = handlers[action];
  if (!handler) return;
  handler();
  if (action === "export") return;
  debugExportOpen = false;
  renderLobby();
  renderLoadout();
  updateUi();
  markDebugContentDirty();
  updateDebugPanel();
}

function draw() {
  return drawCanvas(createCanvasRenderContext());
}

function createCanvasRenderContext() {
  return {
    ctx,
    canvas,
    state,
    DATA,
    grid,
    colors,
    helpers: {
      attackLineY,
      isDeployable,
    },
  };
}

function drawGrid() {
  return drawCanvasGrid(createCanvasRenderContext());
}

function drawFormationArea() {
  return drawCanvasFormationArea(createCanvasRenderContext());
}

function drawRole(role) {
  return drawCanvasRole({ ...createCanvasRenderContext(), role });
}

function drawEnemy(enemy) {
  return drawCanvasEnemy({ ...createCanvasRenderContext(), enemy });
}

function drawProjectile(projectile) {
  return drawCanvasProjectile({ ...createCanvasRenderContext(), projectile });
}

function drawZone(zone) {
  return drawCanvasZone({ ...createCanvasRenderContext(), zone });
}

function drawFloater(floater) {
  return drawCanvasFloater({ ...createCanvasRenderContext(), floater });
}

function drawBossBar() {
  return drawCanvasBossBar(createCanvasRenderContext());
}
function makeId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loop(timestamp) {
  try {
    state.animationFrameRunning = true;
    state.frameCount = (state.frameCount || 0) + 1;
    const dt = Math.min(0.05, (timestamp - state.lastTime) / 1000 || 0);
    state.lastTime = timestamp;
    runBattleModule("update", () => update(dt));
    runBattleModule("draw", draw);
    runBattleModule("updateDebugPanel", updateDebugPanel);
  } catch (error) {
    console.error("[Loop] uncaught frame error", error);
    state.__lastUpdateError = {
      module: "loop",
      message: error && error.message ? error.message : String(error),
      stack: error && error.stack ? error.stack : "",
      wave: state.wave,
      tick: state.__updateTick || 0,
    };
  } finally {
    requestAnimationFrame(loop);
  }
}

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
  const col = Math.floor(x / grid.cellW);
  const row = Math.floor(y / grid.cellH);
  deployRole(col, row);
});

function handleHubNavClick(event) {
  const button = event.target.closest("[data-hub-page]");
  if (!button) return;
  event.stopPropagation();
  enterHubPage(button.dataset.hubPage);
}

titleStartButton?.addEventListener("click", () => enterLocalTrial());
titleGuestButton?.addEventListener("click", () => enterLocalTrial("當前為本地試玩模式。"));
titleLoginButton?.addEventListener("click", openTitleLogin);
titleRealmButton?.addEventListener("click", () => openSettings("界域系統暫未開放。"));
titleNoticeButton?.addEventListener("click", openTitleNotice);
titleNoticeButtonSecondary?.addEventListener("click", openTitleNotice);
titleContinueButton?.addEventListener("click", () => {
  applyPlayerProfile(loadPlayerProfile());
  enterMainHub(playerProfileLoadedFromStorage ? "" : "未检测到旧存档，已创建新存档。");
});
titleLoadButton?.addEventListener("click", () => openSettings("读取存档功能暂未开放，当前使用本地自动存档。"));
titleCodexButton?.addEventListener("click", () => enterHubPage(APP_STATE.CODEX, APP_STATE.TITLE));
titleSettingsButton?.addEventListener("click", () => openSettings());
titleSettingsButtonSecondary?.addEventListener("click", () => openSettings());
titleNoticeCloseButton?.addEventListener("click", closeTitleNotice);
titleNoticeModal?.addEventListener("click", (event) => {
  if (event.target === titleNoticeModal) closeTitleNotice();
});
titleLoginContinueButton?.addEventListener("click", () => enterLocalTrial("當前為本地試玩模式。"));
titleLoginBackButton?.addEventListener("click", closeTitleLogin);
titleLoginModal?.addEventListener("click", (event) => {
  if (event.target === titleLoginModal) closeTitleLogin();
});
hubAdventureButton.addEventListener("click", () => enterHubPage(APP_STATE.ADVENTURE));
mainHubView.addEventListener("click", handleHubNavClick);
hubRealmButton?.addEventListener("click", () => openSettings("界域系統暫未開放。"));
hubNoticeButton?.addEventListener("click", openTitleNotice);
hubSettingsButton.addEventListener("click", () => openSettings());
hubBottomNav.addEventListener("click", handleHubNavClick);
featureBottomNav.addEventListener("click", handleHubNavClick);
featureBackButton.addEventListener("click", () => {
  if (featureReturnState === APP_STATE.TITLE) enterTitle();
  else enterMainHub();
});
featurePageContent.addEventListener("click", (event) => {
  const nodeButton = event.target.closest("[data-adventure-node-id]");
  if (nodeButton) {
    selectAdventureNode(nodeButton.dataset.adventureNodeId, nodeButton.dataset.adventureChapterId || "chapter_1");
    return;
  }
  const action = event.target.closest("[data-page-action]");
  if (action?.dataset.pageAction === "back-main") {
    enterMainHub();
    return;
  }
  if (action?.dataset.pageAction === "close-adventure-detail") {
    state.adventureDetailOpen = false;
    renderFeaturePage();
    return;
  }
  if (action?.dataset.pageAction === "start-adventure") {
    startAdventureNode(action.dataset.nodeId || state.selectedAdventureNodeId || getCurrentChapterNodeId("chapter_1"), action.dataset.chapterId || "chapter_1");
    return;
  }
  const gacha = event.target.closest("[data-hub-gacha]");
  if (gacha) {
    performGacha();
    renderFeaturePage();
    return;
  }
  const roleUpgrade = event.target.closest("[data-role-upgrade-id]");
  if (roleUpgrade) {
    upgradeCharacter(roleUpgrade.dataset.roleUpgradeId);
    renderFeaturePage();
    return;
  }
  const formation = event.target.closest("[data-hub-formation-id]");
  if (formation) {
    state.loadoutFormationId = formation.dataset.hubFormationId;
    setStatus(`已预选护山大阵：${DATA.formations[state.loadoutFormationId]?.name || state.loadoutFormationId}`);
    renderFeaturePage();
  }
});
settingsCloseButton.addEventListener("click", closeSettings);
settingsResetButton.addEventListener("click", () => {
  clearPlayerProfileWithConfirm();
  closeSettings();
});
settingsModal.addEventListener("click", (event) => {
  if (event.target === settingsModal) closeSettings();
});
goLoadoutButton.addEventListener("click", enterLoadout);
enterDeployButton.addEventListener("click", enterDeploy);
startButton.addEventListener("click", startRun);
returnLobbyButton.addEventListener("click", () => enterMainHub());
settlementAdventureButton.addEventListener("click", () => {
  enterHubPage(APP_STATE.ADVENTURE);
});
const settlementRetryButton = document.querySelector("#settlementRetryButton");
settlementRetryButton?.addEventListener("click", () => {
  startAdventureNode(state.lastChallengeNodeId || state.currentNodeId || getCurrentChapterNodeId("chapter_1"), state.lastChallengeChapterId || state.currentChapterId || "chapter_1");
});
settlementCodexButton.addEventListener("click", () => {
  resetGame(APP_STATE.CODEX);
});
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
  if (event.target.matches('[data-debug-input="target-wave"]')) {
    DEBUG_UI_STATE.targetWaveInput = event.target.value;
  }
  if (event.target.matches("[data-debug-field]")) handleDebugFieldChange(event.target);
});
debugContent.addEventListener("change", (event) => {
  if (event.target.matches('[data-debug-input="target-wave"]')) {
    DEBUG_UI_STATE.targetWaveInput = event.target.value;
  }
  if (event.target.matches("[data-debug-field]")) handleDebugFieldChange(event.target);
  const control = event.target.closest("[data-debug-control]");
  if (control) {
    const name = control.dataset.debugControl;
    if (name === "chapter-select") {
      debugSelectedChapterId = control.value;
      debugSelectedNodeId = getChapter(debugSelectedChapterId)?.nodes?.[0]?.nodeId || "";
    } else if (name === "node-select") {
      debugSelectedNodeId = control.value;
    } else if (name === "role-select") {
      debugSelectedRoleId = control.value;
    } else if (name === "artifact-select") {
      debugSelectedArtifactId = control.value;
    } else if (name === "formation-select") {
      debugSelectedFormationId = control.value;
    } else if (name === "enemy-select") {
      debugSelectedEnemyId = control.value;
    } else if (name === "perk-filter") {
      debugPerkFilter = control.value;
    }
    markDebugContentDirty();
    updateDebugPanel();
  }
});
debugContent.addEventListener("click", (event) => {
  const debugAction = event.target.closest("[data-debug-action]");
  if (debugAction) {
    runDebugAction(debugAction.dataset.debugAction);
    return;
  }
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
    const payload = exportButton.dataset.debugCopyExport === "merged"
      ? getMergedDebugData()
      : exportButton.dataset.debugCopyExport === "profile"
        ? playerMeta
        : debugOverrides;
    copyDebugText(JSON.stringify(payload, null, 2));
  }
});

applyPlayerProfile(loadPlayerProfile());
resetGame();
requestAnimationFrame(loop);

