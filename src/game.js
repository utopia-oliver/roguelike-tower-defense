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

const APP_STATE = {
  LOBBY: "LOBBY",
  LOADOUT: "LOADOUT",
  DEPLOY: "DEPLOY",
  BATTLE: "BATTLE",
  LEVEL_UP_REWARD: "LEVEL_UP_REWARD",
  SETTLEMENT: "SETTLEMENT",
};

const ENEMY_STATE = {
  MOVING: "MOVING",
  ATTACKING: "ATTACKING",
  DEAD: "DEAD",
};

const colors = {
  "剑": "#d7e1ec",
  "火": "#ef7b45",
  "体": "#d6b36a",
  "冰": "#72c8ee",
  "毒": "#a97ad8",
  "雷": "#c4b5fd",
  enemy_little_yao: "#85a96e",
  enemy_swift_wolf: "#98d6cb",
  enemy_armor_beast: "#7b7d8d",
  enemy_blood_cultivator: "#c45252",
  boss_blackwind: "#555f6f",
  boss_bloodlotus: "#bb3d84",
  boss_outer_demon: "#6d28d9",
  剑修: "#d7e1ec",
  火修: "#ef7b45",
  冰修: "#72c8ee",
  毒修: "#a97ad8",
  雷修: "#c4b5fd",
  枪修: "#d6b36a",
  音修: "#f0abfc",
  暗修: "#a78bfa",
  万法: "#facc15",
};

const rarityWeight = {
  "普通": 70,
  "稀有": 24,
  "史诗": 8,
  "传说": 2,
};

const CHARACTER_RARITY = {
  SR: "SR",
  SSR: "SSR",
  UR: "UR",
  SP: "SP",
};

const PLAYER_LEVEL_UNLOCKS = DATA.playerLevelUnlocks || [];
const DEPLOY_SLOT_UNLOCKS = DATA.deploySlotUnlocks || [];
const GACHA_COST = 200;
const DUPLICATE_GACHA_REFUND = 50;

const GENERIC_PERKS = [
  {
    id: "generic_role_damage_15",
    name: "灵力灌注",
    rarity: "普通",
    scope: "global",
    description: "全体角色伤害 +15%。",
    valueText: "+15%",
    stackable: true,
    effect: { type: "role_damage_mult", value: 0.15 },
  },
  {
    id: "generic_attack_speed_10",
    name: "周天急转",
    rarity: "普通",
    scope: "global",
    description: "全体角色攻速 +10%。",
    valueText: "+10%",
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
  level: 1,
  lingstone: 0,
  ownedCharacters: [...DATA.initial.roles],
  unlockedCharacterIds: [...DATA.initial.roles],
  ownedRoles: [...DATA.initial.roles],
  characterLevels: Object.fromEntries(DATA.initial.roles.map((id) => [id, 1])),
  maxDeploySlots: 1,
  ownedArtifacts: [DATA.initial.artifact],
  unlockedFormations: [DATA.initial.formation],
  arrayCoreLevel: 1,
  arrayCoreBaseHpBonus: 0,
  arrayCoreDefenseBonus: 0,
};

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

function syncPlayerMetaAliases() {
  playerMeta.level = playerMeta.playerLevel;
  playerMeta.lingstone = playerMeta.spiritStones;
  playerMeta.ownedRoles = playerMeta.ownedCharacters;
  playerMeta.unlockedCharacterIds = playerMeta.ownedCharacters;
  playerMeta.maxDeploySlots = getMaxDeploySlots(playerMeta.playerLevel);
}

function getPlayerLevelExpRequirement(level) {
  return Math.floor(100 + (level - 1) * 60 + Math.pow(level - 1, 1.35) * 25);
}

function getMaxDeploySlots(level = playerMeta.playerLevel) {
  return DEPLOY_SLOT_UNLOCKS.reduce(
    (slots, unlock) => (level >= unlock.level ? unlock.deploySlots : slots),
    1,
  );
}

function getNextCharacterUnlock() {
  return PLAYER_LEVEL_UNLOCKS.find(
    (unlock) => unlock.level > playerMeta.playerLevel && !playerMeta.ownedCharacters.includes(unlock.characterId),
  );
}

function getNextDeploySlotUnlock() {
  return DEPLOY_SLOT_UNLOCKS.find((unlock) => unlock.level > playerMeta.playerLevel);
}

function grantCharacter(characterId, source = "unlock") {
  if (!DATA.roles[characterId]) return false;
  if (playerMeta.ownedCharacters.includes(characterId)) {
    if (source === "gacha") playerMeta.spiritStones += DUPLICATE_GACHA_REFUND;
    syncPlayerMetaAliases();
    return false;
  }
  playerMeta.ownedCharacters.push(characterId);
  playerMeta.characterLevels[characterId] = playerMeta.characterLevels[characterId] || 1;
  syncPlayerMetaAliases();
  return true;
}

function applyPlayerLevelUnlocks() {
  const unlocked = [];
  PLAYER_LEVEL_UNLOCKS.forEach((unlock) => {
    if (unlock.type === "character" && playerMeta.playerLevel >= unlock.level) {
      if (grantCharacter(unlock.characterId, "level")) unlocked.push(unlock.description);
    }
  });
  playerMeta.maxDeploySlots = getMaxDeploySlots(playerMeta.playerLevel);
  syncPlayerMetaAliases();
  return unlocked;
}

function checkPlayerLevelUp() {
  const rewards = [];
  while (playerMeta.playerExp >= getPlayerLevelExpRequirement(playerMeta.playerLevel)) {
    playerMeta.playerExp -= getPlayerLevelExpRequirement(playerMeta.playerLevel);
    playerMeta.playerLevel += 1;
    rewards.push(`玩家等级提升到 ${playerMeta.playerLevel}`);
    rewards.push(...applyPlayerLevelUnlocks());
  }
  syncPlayerMetaAliases();
  return rewards;
}

function getCharacterLevel(characterId) {
  return playerMeta.characterLevels[characterId] || 1;
}

function getFlatDamageGrowthByRarity(rarity) {
  if (rarity === CHARACTER_RARITY.UR) return 5;
  if (rarity === CHARACTER_RARITY.SSR) return 4;
  return 3;
}

function getPercentGrowthByRarity(rarity) {
  if (rarity === CHARACTER_RARITY.UR) return 0.12;
  if (rarity === CHARACTER_RARITY.SSR) return 0.1;
  return 0.08;
}

function getCharacterBaseFinalDamage(character) {
  const level = getCharacterLevel(character.id);
  const levelDelta = level - 1;
  return (
    character.baseDamage +
    levelDelta * getFlatDamageGrowthByRarity(character.rarity) +
    character.baseDamage * levelDelta * getPercentGrowthByRarity(character.rarity)
  );
}

function getCharacterUpgradeCost(characterLevel, rarity) {
  const rarityBase = {
    SR: 80,
    SSR: 140,
    UR: 240,
    SP: 360,
  };
  const rarityGrowth = {
    SR: 1.5,
    SSR: 1.6,
    UR: 1.7,
    SP: 1.8,
  };
  return Math.floor((rarityBase[rarity] || rarityBase.SR) * Math.pow(rarityGrowth[rarity] || rarityGrowth.SR, characterLevel - 1));
}

function upgradeCharacter(characterId) {
  if (!playerMeta.ownedCharacters.includes(characterId)) return false;
  const character = DATA.roles[characterId];
  const level = getCharacterLevel(characterId);
  const cost = getCharacterUpgradeCost(level, character.rarity);
  if (playerMeta.spiritStones < cost) {
    setStatus(`灵石不足，${character.name} 升级需要 ${cost} 灵石。`);
    return false;
  }
  playerMeta.spiritStones -= cost;
  playerMeta.characterLevels[characterId] = level + 1;
  syncPlayerMetaAliases();
  setStatus(`${character.name} 提升到 ${level + 1} 级，战斗伤害提高。`);
  renderLobby();
  return true;
}

function drawGachaRarity() {
  const roll = Math.random();
  if (roll < 0.05) return CHARACTER_RARITY.UR;
  if (roll < 0.3) return CHARACTER_RARITY.SSR;
  return CHARACTER_RARITY.SR;
}

function performGacha() {
  if (playerMeta.spiritStones < GACHA_COST) {
    setStatus(`灵石不足，抽卡需要 ${GACHA_COST} 灵石。`);
    return;
  }
  playerMeta.spiritStones -= GACHA_COST;
  const pool = Object.values(DATA.roles).filter((role) => role.unlockType === "gacha");
  const rarity = drawGachaRarity();
  const rarityPool = pool.filter((role) => role.rarity === rarity);
  const candidates = rarityPool.length ? rarityPool : pool;
  const result = candidates[Math.floor(Math.random() * candidates.length)];
  const isNew = grantCharacter(result.id, "gacha");
  syncPlayerMetaAliases();
  renderLobby();
  renderLoadout();
  setStatus(
    isNew
      ? `抽卡获得 ${result.rarity} ${result.name}。`
      : `抽到重复角色 ${result.rarity} ${result.name}，返还${DUPLICATE_GACHA_REFUND}灵石。`,
  );
}

function baseArrayCoreMaxHp() {
  return DATA.config.arrayCore?.maxHp || DATA.config.baseHp || DEFAULT_ARRAY_CORE_MAX_HP;
}

function baseArrayCoreDefense() {
  return DATA.config.arrayCore?.defense || DEFAULT_ARRAY_CORE_DEFENSE;
}

function initialArrayCoreState() {
  const maxHp = baseArrayCoreMaxHp() + (playerMeta.arrayCoreBaseHpBonus || 0);
  const defense = baseArrayCoreDefense() + (playerMeta.arrayCoreDefenseBonus || 0);
  return {
    arrayCoreMaxHp: maxHp,
    arrayCoreHp: maxHp,
    arrayCoreDefense: defense,
    arrayCoreDamageReduction: DATA.config.arrayCore?.damageReductionRate || 0,
  };
}

function initializeArrayCoreForRun() {
  const core = initialArrayCoreState();
  state.arrayCoreMaxHp = core.arrayCoreMaxHp;
  state.arrayCoreHp = core.arrayCoreHp;
  state.arrayCoreDefense = core.arrayCoreDefense;
  state.arrayCoreDamageReduction = core.arrayCoreDamageReduction;
  syncBaseHpAliases();
}

function syncBaseHpAliases() {
  state.maxBaseHp = state.arrayCoreMaxHp;
  state.baseHp = state.arrayCoreHp;
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
    bossKills: new Set(),
    loadoutFormationId: "",
    loadoutRoleIds: [],
    loadoutArtifactId: "",
    selectedFormationId: "",
    selectedRoleId: "",
    selectedArtifactId: "",
    availableRoles: [],
    deployedRoles: [],
    enemies: [],
    projectiles: [],
    floaters: [],
    zones: [],
    spawnJobs: [],
    waveActive: false,
    martialArtLevels: {},
    martialArtBranches: {},
    formationCooldown: 0,
    artifactCooldown: 0,
    pendingLevelUps: 0,
    animationFrameRunning: false,
    frameCount: 0,
    lastError: "",
    lastTime: 0,
    status: "山门待命。先在外部系统进入战前配置。",
    bonuses: defaultRunBonuses(),
    acquiredPerks: new Set(),
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
      renderLobby();
      updateUi();
      return { rewards, snapshot: getDebugSnapshot() };
    },
    grantSpiritStones: (amount) => {
      playerMeta.spiritStones += amount;
      syncPlayerMetaAliases();
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
      const enemy = new Enemy("enemy_armor_beast");
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
  return row === grid.rows - 1 && col >= 0 && col < grid.columns;
}

function attackLineY() {
  return (grid.rows - 1) * grid.cellH - 8;
}

function cellCenter(col, row) {
  return {
    x: col * grid.cellW + grid.cellW / 2,
    y: row * grid.cellH + grid.cellH / 2,
  };
}

function roleAt(col, row) {
  return state.deployedRoles.find((role) => role.col === col && role.row === row);
}

function deployRole(col, row) {
  if (state.appState === APP_STATE.LOBBY) {
    setStatus("请先点击进入备战，再部署角色。");
    return;
  }
  if (state.appState !== APP_STATE.DEPLOY) {
    setStatus("战斗已经开始，本局不再中途部署角色。");
    return;
  }
  if (!isDeployable(col, row)) {
    setStatus("只能部署在最底部的护山大阵 / 护山阵眼区。");
    return;
  }
  if (roleAt(col, row)) {
    setStatus("该格已有宗门角色。");
    return;
  }
  if (state.deployedRoles.length >= playerMeta.maxDeploySlots) {
    setStatus(`上阵位已满，本局最多部署 ${playerMeta.maxDeploySlots} 名角色。`);
    return;
  }
  if (state.deployedRoles.some((role) => role.roleId === state.selectedRoleId)) {
    setStatus("每名角色本局只能部署一次。");
    return;
  }
  if (!state.availableRoles.includes(state.selectedRoleId)) {
    setStatus("只能部署战前配置中选择的宗门角色。");
    return;
  }
  const config = DATA.roles[state.selectedRoleId];
  const pos = cellCenter(col, row);
  state.deployedRoles.push({
    id: makeId(),
    roleId: config.id,
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
  setStatus(`${config.name} 已入阵。`);
  renderSetupLists();
  updateUi();
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
  state.appState = APP_STATE.BATTLE;
  state.phase = "combat";
  state.running = true;
  state.paused = false;
  startButton.disabled = true;
  setStatus("妖潮来袭，角色和法宝自动攻击；阵法会在敌人靠近阵眼时触发。");
  renderSetupLists();
  updateUi();
}

function startWave() {
  const wave = DATA.waves.find((item) => item.wave === state.wave);
  state.spawnJobs = wave.segments.map((segment) => ({
    ...segment,
    remaining: segment.count,
    nextSpawn: segment.startDelay,
  }));
  state.waveActive = true;
  state.highestWave = Math.max(state.highestWave, state.wave);
  setStatus(`第 ${state.wave} 波：${wave.goal}`);
}

class Enemy {
  constructor(enemyId) {
    const config = DATA.enemies[enemyId];
    this.id = makeId();
    this.config = config;
    this.lane = Math.floor(Math.random() * grid.columns);
    this.x = this.lane * grid.cellW + grid.cellW / 2;
    this.y = -grid.cellH * 0.35;
    this.hp = config.hp;
    this.maxHp = config.maxHp || config.hp;
    this.moveSpeed = config.moveSpeed || config.speed;
    this.attackDamage = config.attackDamage || config.baseDamage;
    this.spiritQiReward = config.spiritQiReward || config.lingqiReward;
    this.dead = false;
    this.state = ENEMY_STATE.MOVING;
    this.attackTimer = 0;
    this.attackInterval = config.attackInterval || (this.config.isBoss ? 2.5 : 1.5);
    this.progress = 0;
    this.statuses = [];
    this.abilityTimer = 0;
  }

  get radius() {
    if (this.config.isBoss) return 24;
    if (this.config.type === "坦克") return 18;
    return 13;
  }

  get hitRadius() {
    if (this.config.isBoss) return 32;
    if (this.config.id === "enemy_swift_wolf") return 13;
    if (this.config.id === "enemy_armor_beast") return 22;
    if (this.config.id === "enemy_blood_cultivator") return 18;
    return 14;
  }

  hasStatus(type) {
    return this.statuses.some((status) => status.type === type);
  }

  addStatus(type, duration, value, options = {}) {
    if (type === "slow" && this.config.id === "boss_outer_demon") return;
    const existing = this.statuses.find((status) => status.type === type);
    if (existing) {
      existing.duration = Math.max(existing.duration, duration);
      if (options.stack) {
        existing.stacks = Math.min(options.maxStacks || 3, (existing.stacks || 1) + 1);
        existing.value = value * existing.stacks;
      } else {
        existing.value = Math.max(existing.value, value);
      }
      return;
    }
    this.statuses.push({ type, duration, value, tick: 0, stacks: options.stack ? 1 : 0 });
  }

  takeDamage(rawAmount, source = "role", attacker = null) {
    if (this.state === ENEMY_STATE.DEAD) return false;
    let amount = rawAmount;
    if (this.config.isBoss) amount *= state.bonuses.bossDamage;
    if (this.hasStatus("slow")) amount *= 1 + state.bonuses.slowVulnerability;
    this.hp -= amount;
    state.floaters.push({
      x: this.x,
      y: this.y - this.radius,
      text: Math.ceil(amount).toString(),
      ttl: 0.55,
      color: source === "formation" ? "#88f0b1" : "#f7e6a7",
    });
    if (this.hp <= 0) {
      this.die(attacker);
      return true;
    }
    return false;
  }

  die(attacker = null) {
    if (this.state === ENEMY_STATE.DEAD) return;
    this.dead = true;
    this.state = ENEMY_STATE.DEAD;
    state.kills += 1;
    if (this.config.isBoss) {
      state.bossKills.add(state.wave);
    }
    if (this.hasStatus("poison")) {
      const poisonSpreadRole = state.deployedRoles.some((role) => DATA.roles[role.roleId]?.passiveSkill === "poison_stack");
      if (poisonSpreadRole && Math.random() < 0.3 + state.bonuses.poisonSpreadChanceAdd) {
        nearestEnemies(this, 3).forEach((enemy) => enemy.addStatus("poison", 3, 5));
      }
    }
    gainLingqi(this.spiritQiReward);
  }

  enterAttackMode() {
    if (this.state !== ENEMY_STATE.MOVING) return;
    this.state = ENEMY_STATE.ATTACKING;
    this.moveSpeed = 0;
    this.y = attackLineY();
    this.progress = Math.max(this.progress, 0.95);
    this.attackTimer = 0;
    setStatus(`${this.config.name} 抵达护山大阵前方，开始攻击阵眼血条。`);
  }

  update(dt) {
    this.updateStatuses(dt);
    this.updateBossAbility(dt);
    if (this.state === ENEMY_STATE.DEAD) return;
    if (this.state === ENEMY_STATE.ATTACKING) {
      this.attackTimer += dt;
      if (this.attackTimer >= this.attackInterval) {
        this.attackTimer = 0;
        const weaken = this.statuses
          .filter((status) => status.type === "weaken_attack")
          .reduce((max, status) => Math.max(max, status.value), 0);
        damageArrayCore(this.attackDamage * (1 - weaken), this);
      }
      return;
    }
    const slow = this.statuses
      .filter((status) => status.type === "slow")
      .reduce((max, status) => Math.max(max, status.value), 0);
    const frozen = this.hasStatus("freeze");
    if (!frozen) {
      this.progress += (this.moveSpeed * (1 - slow) * dt) / 6.1;
      this.y = this.progress * (attackLineY() + grid.cellH * 0.35) - grid.cellH * 0.35;
      this.x =
        this.lane * grid.cellW +
        grid.cellW / 2 +
        Math.sin(this.progress * Math.PI * 3) * 10;
    }
    if (this.y >= attackLineY()) this.enterAttackMode();
  }

  updateStatuses(dt) {
    this.statuses.forEach((status) => {
      status.duration -= dt;
      if (status.type === "poison" || status.type === "burn") {
        status.tick += dt;
        if (status.tick >= 0.5) {
          this.takeDamage(status.value * status.tick, status.type);
          status.tick = 0;
        }
      }
    });
    this.statuses = this.statuses.filter((status) => status.duration > 0);
  }

  updateBossAbility(dt) {
    if (!this.config.isBoss || this.dead) return;
    this.abilityTimer += dt;
    if (this.config.id === "boss_blackwind" && this.abilityTimer >= 8) {
      this.abilityTimer = 0;
      for (let i = 0; i < 3; i += 1) {
        state.enemies.push(new Enemy("enemy_little_yao"));
      }
      setStatus("黑风妖将召来山野小妖。");
    }
    if (this.config.id === "boss_bloodlotus" && this.abilityTimer >= 10) {
      this.abilityTimer = 0;
      state.enemies.forEach((enemy) => {
        if (!enemy.dead && distance(this, enemy) <= grid.cellW * 2) {
          enemy.hp = Math.min(enemy.maxHp, enemy.hp + 90);
        }
      });
      setStatus("血莲魔修治疗附近敌人。");
    }
    if (this.config.id === "boss_outer_demon" && this.abilityTimer >= 7) {
      this.abilityTimer = 0;
      state.enemies.push(new Enemy("enemy_swift_wolf"));
      state.enemies.push(new Enemy("enemy_little_yao"));
      this.addStatus("freeze_immune", 2, 1);
      setStatus("域外魔影召唤魔影小怪。");
    }
  }
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
  return (DATA.martialArts || []).find((art) => art.ownerCharacterId === characterId);
}

function getMartialArtLevelForRole(roleId) {
  const art = martialArtForCharacter(roleId);
  return art ? state.martialArtLevels[art.id] || 0 : 0;
}

function martialLevelEffects(roleId) {
  const art = martialArtForCharacter(roleId);
  if (art?.id === "ma_qingya_sword") return [];
  const level = art ? state.martialArtLevels[art.id] || 0 : 0;
  return art ? art.levels.filter((item) => item.level <= level) : [];
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

function getMartialBranchState(artId) {
  if (!state.martialArtBranches[artId]) state.martialArtBranches[artId] = {};
  return state.martialArtBranches[artId];
}

function hasMartialBranchUpgrade(artId, upgradeId) {
  return Boolean(getMartialBranchState(artId)[upgradeId]);
}

function qingyaAttackParamsFromBranches(extraUpgrade = null) {
  const artId = "ma_qingya_sword";
  const chosen = getMartialBranchState(artId);
  const params = {
    projectileCount: 1,
    volleyCount: 1,
    volleyInterval: 0.1,
  };
  QINGYA_BRANCH_UPGRADES.forEach((upgrade) => {
    if (!chosen[upgrade.id] && upgrade.id !== extraUpgrade?.id) return;
    const effects = upgrade.effects || {};
    params.projectileCount += effects.projectileAdd || 0;
    params.volleyCount += effects.volleyAdd || 0;
    params.volleyInterval += effects.volleyIntervalAdd || 0;
  });
  params.projectileCount = Math.min(5, params.projectileCount);
  params.volleyCount = Math.min(4, params.volleyCount);
  params.volleyInterval = Math.max(0.04, params.volleyInterval);
  return params;
}

function qingyaBranchUpgradeAvailable(upgrade) {
  const artId = "ma_qingya_sword";
  const currentLevel = state.martialArtLevels[artId] || 0;
  if (hasMartialBranchUpgrade(artId, upgrade.id)) return false;
  if ((upgrade.requires || []).some((id) => !hasMartialBranchUpgrade(artId, id))) return false;
  if (currentLevel >= 7) return upgrade.type === "major_enhance";
  if (currentLevel === 2) return upgrade.type === "minor";
  if (currentLevel === 6) return upgrade.type === "major";
  if (upgrade.type !== "normal") return false;

  const nextParams = qingyaAttackParamsFromBranches(upgrade);
  if (nextParams.projectileCount > 5 || nextParams.volleyCount > 4) return false;
  if (nextParams.projectileCount * nextParams.volleyCount > 16) return false;
  return true;
}

function applyQingyaBranchBonuses(bonuses) {
  const chosen = getMartialBranchState("ma_qingya_sword");
  QINGYA_BRANCH_UPGRADES.forEach((upgrade) => {
    if (!chosen[upgrade.id]) return;
    const effects = upgrade.effects || {};
    bonuses.projectileAdd += effects.projectileAdd || 0;
    bonuses.volleyCount += effects.volleyAdd || 0;
    bonuses.volleyInterval += effects.volleyIntervalAdd || 0;
    if (effects.damageMult) bonuses.damageMult *= 1 + effects.damageMult;
    if (effects.attackIntervalMult) bonuses.attackIntervalMult *= effects.attackIntervalMult;
    bonuses.pierceAdd += effects.pierceAdd || 0;
    if (effects.attackLineDamageMult) bonuses.attackLineDamageMult *= effects.attackLineDamageMult;
    if (effects.giantSword) {
      bonuses.giantSword = true;
      bonuses.giantSwordDamageMult = 10;
      bonuses.giantSwordIntervalMult = 1.15;
      bonuses.giantSwordSplashRadius = 75;
      bonuses.giantSwordSplashDamage = 0.75;
      bonuses.giantSwordEliteDamageMult = 1.35;
    }
    if (effects.giantSwordDamageMultAdd) bonuses.giantSwordDamageMult *= 1 + effects.giantSwordDamageMultAdd;
    if (effects.giantSwordEliteDamageMultAdd) bonuses.giantSwordEliteDamageMult *= 1 + effects.giantSwordEliteDamageMultAdd;
    if (effects.giantSwordSplashRadiusMult) bonuses.giantSwordSplashRadius *= effects.giantSwordSplashRadiusMult;
    if (effects.giantSwordSpeedMult) bonuses.giantSwordSpeedMult *= effects.giantSwordSpeedMult;
  });
  bonuses.projectileAdd = Math.min(4, bonuses.projectileAdd);
  bonuses.volleyCount = Math.min(4, bonuses.volleyCount);
  bonuses.volleyInterval = Math.max(0.04, bonuses.volleyInterval);
}

function martialBonuses(roleId) {
  const bonuses = {
    damageMult: 1,
    attackSpeed: 1,
    attackIntervalMult: 1,
    projectileAdd: 0,
    projectileSet: 0,
    volleyCount: 1,
    volleyInterval: 0.1,
    pierceAdd: 0,
    rangeAdd: 0,
    splashRadius: 1,
    splashShards: 0,
    burnOnHit: 0,
    slowBonus: 0,
    slowSplash: 0,
    poisonDuration: 0,
    dotMult: 1,
    chainAdd: 0,
    swordTrail: false,
    poisonFogOnDeath: false,
    verticalColumns: 1,
    horizontalWidth: 0,
    fullRowSpear: false,
    paralyze: 0,
    freezeAttackLine: 0,
    meteorRain: 0,
    bossPriorityLightning: false,
    speedMult: 1,
    widthAdd: 0,
    hitRadiusAdd: 0,
    collisionPaddingAdd: 0,
    sideDamageScale: 1,
    giantSword: false,
    giantSwordDamageMult: 1,
    giantSwordIntervalMult: 1,
    giantSwordSplashRadius: 0,
    giantSwordSplashDamage: 0,
    giantSwordEliteDamageMult: 1,
    giantSwordSpeedMult: 1,
    attackLineDamageMult: 1,
  };
  martialLevelEffects(roleId).forEach((effect) => {
    if (effect.effectType === "damage_mult") bonuses.damageMult *= 1 + effect.value;
    if (effect.effectType === "attack_speed") bonuses.attackSpeed *= 1 + effect.value;
    if (effect.effectType === "projectile_add") bonuses.projectileAdd += effect.value;
    if (effect.effectType === "projectile_set") bonuses.projectileSet = Math.max(bonuses.projectileSet, effect.value);
    if (effect.effectType === "pierce_add") bonuses.pierceAdd += effect.value;
    if (effect.effectType === "range_add") bonuses.rangeAdd += effect.value;
    if (effect.effectType === "splash_radius") bonuses.splashRadius *= 1 + effect.value;
    if (effect.effectType === "splash_shards") bonuses.splashShards += effect.value;
    if (effect.effectType === "burn_on_hit") bonuses.burnOnHit += effect.value;
    if (effect.effectType === "slow_bonus") bonuses.slowBonus += effect.value;
    if (effect.effectType === "slow_splash") bonuses.slowSplash = Math.max(bonuses.slowSplash, effect.value);
    if (effect.effectType === "poison_duration") bonuses.poisonDuration += effect.value;
    if (effect.effectType === "dot_mult") bonuses.dotMult *= 1 + effect.value;
    if (effect.effectType === "chain_add") bonuses.chainAdd += effect.value;
    if (effect.effectType === "sword_trail") bonuses.swordTrail = true;
    if (effect.effectType === "poison_fog_on_death") bonuses.poisonFogOnDeath = true;
    if (effect.effectType === "vertical_columns") bonuses.verticalColumns = Math.max(bonuses.verticalColumns, effect.value);
    if (effect.effectType === "horizontal_width") bonuses.horizontalWidth += effect.value;
    if (effect.effectType === "full_row_spear") bonuses.fullRowSpear = true;
    if (effect.effectType === "paralyze") bonuses.paralyze = Math.max(bonuses.paralyze, effect.value);
    if (effect.effectType === "freeze_attack_line") bonuses.freezeAttackLine = Math.max(bonuses.freezeAttackLine, effect.value);
    if (effect.effectType === "meteor_rain") bonuses.meteorRain += effect.value;
    if (effect.effectType === "boss_priority_lightning") bonuses.bossPriorityLightning = true;
    if (roleId === "lu_qingya" && effect.level === 1) bonuses.hitRadiusAdd += 4;
    if (effect.effectType === "sword_qi_refine") {
      bonuses.speedMult *= 1.15;
      bonuses.damageMult *= 1.1;
    }
    if (effect.effectType === "qingya_stage_4") {
      bonuses.projectileSet = Math.max(bonuses.projectileSet, 3);
      bonuses.damageMult *= 1.2;
      bonuses.attackSpeed *= 1.1;
      bonuses.pierceAdd += 1;
    }
    if (effect.effectType === "qingya_stage_5") {
      bonuses.projectileSet = Math.max(bonuses.projectileSet, 4);
      bonuses.attackSpeed *= 1.08;
    }
    if (effect.effectType === "qingya_stage_6") {
      bonuses.projectileSet = Math.max(bonuses.projectileSet, 5);
      bonuses.damageMult *= 1.4;
      bonuses.pierceAdd += 1;
    }
    if (effect.effectType === "qingya_giant_sword") {
      bonuses.giantSword = true;
      bonuses.giantSwordDamageMult = 10;
      bonuses.giantSwordIntervalMult = 1.15;
      bonuses.giantSwordSplashRadius = 75;
      bonuses.giantSwordSplashDamage = 0.75;
      bonuses.giantSwordEliteDamageMult = 1.35;
    }
  });
  if (roleId === "lu_qingya") applyQingyaBranchBonuses(bonuses);
  return bonuses;
}

function roleStats(role) {
  const config = DATA.roles[role.roleId];
  const art = martialBonuses(role.roleId);
  const characterLevel = getCharacterLevel(role.roleId);
  const hasGlobalBoost = state.deployedRoles.some(
    (item) => DATA.roles[item.roleId]?.passiveSkill === "global_formation_boost",
  );
  const arrayCoreRatio = state.arrayCoreMaxHp > 0 ? state.arrayCoreHp / state.arrayCoreMaxHp : 1;
  const sectLeaderBonus = hasGlobalBoost ? (arrayCoreRatio < 0.3 ? 1.1 : 1) : 1;
  const elderSwordCount =
    role.roleId === "role_yunhe_elder"
      ? 1 + state.deployedRoles.filter((item) => DATA.roles[item.roleId].school === "剑").length * 0.08
      : 1;
  return {
    damage:
      getCharacterBaseFinalDamage(config) *
      art.damageMult *
      state.bonuses.roleDamage *
      role.personalDamage *
      sectLeaderBonus *
      (hasGlobalBoost ? 1.1 : 1) *
      elderSwordCount,
    interval: ((config.attackInterval || 1 / (config.baseAttackSpeed || 1)) * art.attackIntervalMult * art.giantSwordIntervalMult) / (state.bonuses.roleAttackSpeed * role.personalSpeed * art.attackSpeed),
    range: ((config.range || config.baseRange) + state.bonuses.roleRangeAdd + art.rangeAdd) * grid.cellH,
    school: config.school,
    projectile: config.trajectoryType || config.projectile,
  };
}

function updateRole(role, dt) {
  role.cooldown -= dt;
  if (role.cooldown > 0) return;
  const stats = roleStats(role);
  const target = chooseTarget(role, stats.range);
  if (!target) return;

  const config = DATA.roles[role.roleId];
  let attacks = 1 + state.bonuses.multishot;
  if (config.passiveSkill === "thunder_chain" && role.attacks % 4 === 3) {
    attacks += 1;
  }
  if (state.acquiredPerks.has("perk_outer_disciple_breakthrough") && role.attacks % 5 === 4) {
    attacks += 1;
  }
  for (let i = 0; i < attacks; i += 1) {
    setTimeout(() => fireRole(role, target.id), i * 120);
  }
  role.attacks += 1;
  role.cooldown = Math.max(0.12, stats.interval);
  if ((config.talent || "").includes("连续攻击同一目标")) {
    if (role.lastTargetId === target.id) {
      role.sameTargetStacks = Math.min(5, role.sameTargetStacks + 1);
    } else {
      role.sameTargetStacks = 0;
    }
    role.lastTargetId = target.id;
  }
}

function fireRole(role, targetId) {
  if (state.appState !== APP_STATE.BATTLE) return;
  const target = state.enemies.find((enemy) => enemy.id === targetId && !enemy.dead);
  if (!target) return;
  const config = DATA.roles[role.roleId];
  const stats = roleStats(role);
  const art = martialBonuses(role.roleId);
  let damage = stats.damage;
  if ((config.passiveSkill || config.talent || "").includes("连续攻击同一目标")) {
    damage *= 1 + role.sameTargetStacks * 0.05 * state.bonuses.passiveMultiplier;
  }
  if (config.passiveSkill === "execute_low_hp" && target.hp / target.maxHp < 0.3) damage *= 1.8;
  if (Math.random() < state.bonuses.critChance) {
    damage *= state.bonuses.critMult;
  }

  const baseProjectileCount = config.trajectoryType === "multi" ? 3 : 1;
  const projectileCount = Math.min(
    art.giantSword ? 1 : 5,
    Math.max(art.projectileSet || 0, baseProjectileCount + state.bonuses.sideProjectiles + art.projectileAdd),
  );
  fireProjectileAttack(role, target, {
    projectileCount,
    volleyCount: art.giantSword ? 1 : art.volleyCount,
    volleyInterval: art.volleyInterval,
    damage,
  });
}

function projectileDefaults(config, art) {
  const type = config.projectileType || config.trajectoryType || "projectile";
  const defaults = {
    speed: 380,
    width: 7,
    length: 24,
    radius: 8,
    hitRadius: 10,
    collisionPadding: 4,
    color: colors[config.school] || "#dbeafe",
    trailColor: "rgba(255,255,255,0.22)",
    maxLifetime: 1.5,
  };
  if (type === "flying_sword") Object.assign(defaults, { speed: 360, width: 10, length: 34, radius: 14, hitRadius: 14, collisionPadding: 6, maxLifetime: 1.8, color: "#d9fbff", trailColor: "rgba(125, 211, 252, 0.28)" });
  if (type === "fire_talisman") Object.assign(defaults, { speed: 350, width: 10, length: 18, radius: 10, color: "#ffb15c", trailColor: "rgba(239, 123, 69, 0.28)" });
  if (type === "frost_bolt") Object.assign(defaults, { speed: 370, width: 8, length: 22, radius: 9, color: "#9eeaff", trailColor: "rgba(114, 200, 238, 0.28)" });
  if (type === "poison_needle") Object.assign(defaults, { speed: 430, width: 5, length: 24, radius: 7, color: "#d8b4fe", trailColor: "rgba(169, 122, 216, 0.28)" });
  if (type === "sword_wave") Object.assign(defaults, { speed: 400, width: 9, length: 34, radius: 9, color: "#e8eef8", trailColor: "rgba(215, 225, 236, 0.22)" });
  if (type === "spear_arc") Object.assign(defaults, { speed: 390, width: 12, length: 42, radius: 11, color: "#f4d47c", trailColor: "rgba(214, 179, 106, 0.26)" });
  if (type === "thunder_arc") Object.assign(defaults, { speed: 440, width: 8, length: 26, radius: 9, color: "#ddd6fe", trailColor: "rgba(196, 181, 253, 0.3)" });
  if (art?.giantSword) Object.assign(defaults, { speed: 430, width: 52, length: 160, radius: 54, hitRadius: 54, collisionPadding: 18, maxLifetime: 2.5, color: "#e9ffff", trailColor: "rgba(250, 204, 21, 0.34)" });
  defaults.speed *= art?.speedMult || 1;
  if (art?.giantSword) defaults.speed *= art.giantSwordSpeedMult || 1;
  defaults.width += art?.widthAdd || 0;
  defaults.radius += art?.hitRadiusAdd || 0;
  defaults.hitRadius = (defaults.hitRadius || defaults.radius) + (art?.hitRadiusAdd || 0);
  defaults.collisionPadding += art?.collisionPaddingAdd || 0;
  if (art && art.pierceAdd > 0) defaults.radius += 1;
  return defaults;
}

function fireProjectileAttack(role, target, attackParams) {
  const volleyCount = Math.max(1, attackParams.volleyCount || 1);
  const volleyInterval = Math.max(0.04, attackParams.volleyInterval || 0.1);
  const fireOneVolley = () => {
    if (state.appState !== APP_STATE.BATTLE) return;
    const stats = roleStats(role);
    const liveTarget =
      state.enemies.find((enemy) => enemy.id === target.id && !enemy.dead) ||
      chooseTarget(role, stats.range);
    if (!liveTarget) return;
    createRoleProjectiles(role, liveTarget, attackParams.damage, attackParams.projectileCount);
  };
  for (let volleyIndex = 0; volleyIndex < volleyCount; volleyIndex += 1) {
    if (volleyIndex === 0) {
      fireOneVolley();
    } else {
      setTimeout(fireOneVolley, volleyIndex * volleyInterval * 1000);
    }
  }
}

function createRoleProjectiles(role, target, damage, projectileCount) {
  const config = DATA.roles[role.roleId];
  const art = martialBonuses(role.roleId);
  const defaults = projectileDefaults(config, art);
  const predicted = getPredictedTargetPosition(role, target, defaults.speed);
  const dx = predicted.x - role.x;
  const dy = predicted.y - role.y;
  const len = Math.hypot(dx, dy) || 1;
  const baseVx = dx / len;
  const baseVy = dy / len;
  const normalX = -baseVy;
  const normalY = baseVx;
  const actualCount = art.giantSword ? 1 : projectileCount;
  const spreadAngles = projectileSpreadAngles(actualCount);
  for (let i = 0; i < actualCount; i += 1) {
    const centered = i - (actualCount - 1) / 2;
    const angle = (spreadAngles[i] || 0) * Math.PI / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const vx = baseVx * cos - baseVy * sin;
    const vy = baseVx * sin + baseVy * cos;
    const sideDamage = art.giantSword ? art.giantSwordDamageMult : centered === 0 ? 1 : art.sideDamageScale;
    const offset = art.giantSword ? 0 : centered * 4;
    const pierceCount = art.giantSword ? 6 + state.bonuses.pierceAdd : art.pierceAdd + state.bonuses.pierceAdd;
    state.projectiles.push({
      id: makeId(),
      ownerCharacterId: role.roleId,
      ownerRoleId: role.id,
      type: art.giantSword ? "giant_sword_projectile" : config.projectileType || config.trajectoryType || "projectile",
      trajectoryType: config.trajectoryType,
      x: role.x + normalX * offset,
      y: role.y + normalY * offset,
      lastX: role.x + normalX * offset,
      lastY: role.y + normalY * offset,
      vx,
      vy,
      speed: defaults.speed,
      damage: damage * sideDamage,
      width: defaults.width,
      length: defaults.length,
      radius: defaults.radius,
      hitRadius: defaults.hitRadius || defaults.radius,
      collisionPadding: defaults.collisionPadding || 0,
      pierce: pierceCount > 0,
      remainingPierce: pierceCount,
      hitEnemyIds: new Set(),
      lifetime: 0,
      maxLifetime: defaults.maxLifetime,
      effectType: config.trajectoryType,
      color: defaults.color,
      trailColor: defaults.trailColor,
      sourceRole: role,
      sourceConfig: config,
      splashRadius: art.giantSwordSplashRadius,
      splashDamageMultiplier: art.giantSwordSplashDamage,
      eliteBossDamageMultiplier: art.giantSwordEliteDamageMult,
      attackLineDamageMultiplier: art.attackLineDamageMult,
    });
  }
}

function projectileSpreadAngles(count) {
  if (count <= 1) return [0];
  if (count === 2) return [-5, 5];
  if (count === 3) return [-7, 0, 7];
  if (count === 4) return [-9, -3, 3, 9];
  if (count === 5) return [-12, -6, 0, 6, 12];
  const step = 24 / Math.max(1, count - 1);
  return Array.from({ length: count }, (_, index) => -12 + step * index);
}

function getPredictedTargetPosition(source, target, projectileSpeed) {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const travelTime = Math.hypot(dx, dy) / Math.max(1, projectileSpeed);
  const pathPixelSpeed =
    ((target.moveSpeed || 0) * (attackLineY() + grid.cellH * 0.35)) / 6.1;
  return {
    x: target.x + (target.vx || 0) * travelTime,
    y: target.y + (target.vy || pathPixelSpeed) * travelTime,
  };
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
  const config = DATA.roles[source.roleId] || {};
  const candidates = state.enemies.filter(
    (enemy) => !enemy.dead && distance(source, enemy) <= range,
  );
  if (!candidates.length) return null;
  if (config.trajectoryType === "execute") {
    return candidates.sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
  }
  return candidates.sort((a, b) => b.progress - a.progress)[0];
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
  state.formationCooldown -= dt;
  if (state.formationCooldown > 0) return;
  const formation = DATA.formations[state.selectedFormationId];
  const base = { x: canvas.width / 2, y: canvas.height - grid.cellH / 2 };
  const radius = (formation.triggerRadius + state.bonuses.formationRadiusAdd) * grid.cellH;
  const targets = state.enemies
    .filter((enemy) => !enemy.dead && distance(enemy, base) <= radius)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, formation.maxTargets);
  if (!targets.length) return;
  const formationBoost = state.deployedRoles.some(
    (role) => DATA.roles[role.roleId]?.passiveSkill === "global_formation_boost",
  )
    ? 1.1
    : 1;
  const damage = 34 * state.bonuses.formationDamage * formationBoost;
  targets.forEach((enemy) => {
    enemy.takeDamage(damage, "formation");
    if (formation.effectType === "knockback_slow") {
      enemy.progress = Math.max(0, enemy.progress - 0.04);
      enemy.addStatus("slow", 2, 0.5);
    }
    if (formation.effectType === "freeze") enemy.addStatus("freeze", 0.8, 1);
    if (formation.effectType === "burning_area") enemy.addStatus("burn", 2, 8);
  });
  if (formation.effectType === "chain_lightning") {
    nearestEnemies(targets[0], 3).forEach((enemy) => enemy.takeDamage(damage * 0.7, "formation"));
  }
  state.zones.push({ x: base.x, y: base.y, radius, ttl: 0.45, color: "rgba(92, 219, 149, 0.22)" });
  state.formationCooldown = Math.max(3, formation.cooldown * state.bonuses.formationCooldown);
  setStatus(`${formation.name} 被动触发。`);
}

function areaDamage(x, y, radius, damage, source) {
  state.enemies.forEach((enemy) => {
    if (!enemy.dead && distance({ x, y }, enemy) <= radius) {
      enemy.takeDamage(damage, source);
    }
  });
  state.zones.push({ x, y, radius, ttl: 0.28, color: "rgba(239, 123, 69, 0.2)" });
}

function drawShot(x, y, tx, ty, color) {
  state.projectiles.push({ x, y, tx, ty, color, ttl: 0.16, visualOnly: true });
}

function updateProjectiles(dt) {
  state.projectiles.forEach((projectile) => {
    if (projectile.visualOnly) {
      projectile.ttl -= dt;
      return;
    }
    projectile.lastX = projectile.x;
    projectile.lastY = projectile.y;
    projectile.x += projectile.vx * projectile.speed * dt;
    projectile.y += projectile.vy * projectile.speed * dt;
    projectile.lifetime += dt;
    checkProjectileCollision(projectile);
  });
  state.projectiles = state.projectiles.filter((projectile) => {
    if (projectile.visualOnly) return projectile.ttl > 0;
    const inBounds =
      projectile.x > -80 &&
      projectile.x < canvas.width + 80 &&
      projectile.y > -80 &&
      projectile.y < canvas.height + 80;
    return !projectile.dead && projectile.lifetime < projectile.maxLifetime && inBounds;
  });
}

function checkProjectileCollision(projectile) {
  for (const enemy of state.enemies) {
    if (enemy.dead || projectile.hitEnemyIds.has(enemy.id)) continue;
    if (!checkProjectileHitEnemy(projectile, enemy)) continue;
    projectile.hitEnemyIds.add(enemy.id);
    const eliteBossMultiplier = enemy.config.isBoss || enemy.config.type === "精英"
      ? projectile.eliteBossDamageMultiplier || 1
      : 1;
    const attackLineMultiplier = enemy.state === ENEMY_STATE.ATTACKING
      ? projectile.attackLineDamageMultiplier || 1
      : 1;
    const hitDamage = projectile.damage * eliteBossMultiplier * attackLineMultiplier;
    applyRoleHit(projectile.sourceRole, enemy, hitDamage);
    if (projectile.splashRadius > 0 && projectile.splashDamageMultiplier > 0) {
      areaDamage(enemy.x, enemy.y, projectile.splashRadius, hitDamage * projectile.splashDamageMultiplier, "role");
    }
    if (!projectile.pierce) {
      projectile.dead = true;
      return;
    }
    projectile.remainingPierce -= 1;
    if (projectile.remainingPierce < 0) {
      projectile.dead = true;
      return;
    }
  }
}

function checkProjectileHitEnemy(projectile, enemy) {
  const radius =
    (projectile.hitRadius || projectile.radius || 0) +
    (enemy.hitRadius || enemy.radius || 0) +
    (projectile.collisionPadding || 0);
  return (
    distancePointToSegment(
      enemy.x,
      enemy.y,
      projectile.lastX ?? projectile.x,
      projectile.lastY ?? projectile.y,
      projectile.x,
      projectile.y,
    ) <= radius
  );
}

function distancePointToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSq));
  const cx = x1 + t * dx;
  const cy = y1 + t * dy;
  return Math.hypot(px - cx, py - cy);
}

function update(dt) {
  if (state.appState !== APP_STATE.BATTLE || state.gameOver) return;
  if (!state.waveActive) startWave();

  state.spawnJobs.forEach((job) => {
    job.nextSpawn -= dt;
    while (job.remaining > 0 && job.nextSpawn <= 0) {
      state.enemies.push(new Enemy(job.enemyId));
      job.remaining -= 1;
      job.nextSpawn += job.spawnInterval;
    }
  });

  state.enemies.forEach((enemy) => enemy.update(dt));
  state.enemies = state.enemies.filter((enemy) => !enemy.dead);
  state.deployedRoles.forEach((role) => updateRole(role, dt));
  updateProjectiles(dt);
  updateFormation(dt);
  updateArtifact(dt);
  updateEffects(dt);
  state.enemies = state.enemies.filter((enemy) => enemy.state !== ENEMY_STATE.DEAD);

  const allSpawned = state.spawnJobs.every((job) => job.remaining <= 0);
  if (state.waveActive && allSpawned && state.enemies.length === 0) {
    if (state.wave >= DATA.config.maxWaves) {
      endGame(true);
    } else {
      state.wave += 1;
      state.waveActive = false;
      setStatus("本波已清除，下一波即将到来。");
    }
  }
  updateUi();
}

function updateArtifact(dt) {
  const artifact = DATA.artifacts[state.selectedArtifactId];
  if (!artifact) return;
  state.artifactCooldown -= dt;
  if (state.artifactCooldown > 0) return;
  const targets = state.enemies
    .filter((enemy) => !enemy.dead)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);
  if (!targets.length) return;
  const origin = { x: canvas.width / 2, y: canvas.height - grid.cellH * 0.35 };
  targets.forEach((enemy) => {
    enemy.takeDamage(artifact.damage * state.bonuses.artifactDamage, "artifact");
    drawShot(origin.x, origin.y, enemy.x, enemy.y, "#f6d365");
  });
  state.floaters.push({
    x: origin.x,
    y: origin.y - 18,
    text: artifact.name.slice(0, 4),
    ttl: 0.7,
    color: "#f6d365",
  });
  state.artifactCooldown = Math.max(2, artifact.cooldown * state.bonuses.artifactCooldown);
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
  const defense = state.arrayCoreDefense || 0;
  const finalDamage = Math.max(1, rawDamage - defense);
  state.arrayCoreHp = Math.max(0, state.arrayCoreHp - finalDamage);
  syncBaseHpAliases();
  showDamageNumber(finalDamage, "arrayCore");
  const enemyName = enemy?.config?.name || "敌人";
  setStatus(`${enemyName} 正在攻击护山大阵 / 护山阵眼，阵眼HP -${Math.ceil(finalDamage)}。`);
  if (state.arrayCoreHp <= 0) {
    state.arrayCoreHp = 0;
    syncBaseHpAliases();
    endGame(false);
  }
  return finalDamage;
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
    button.innerHTML = `<small>${perk.rarity} · ${perk.category}</small><strong>${perk.name}</strong><p>${perk.description}</p><p>${perk.valueText}</p>`;
    button.addEventListener("click", () => {
      chooseLevelUpPerk(perk);
    });
    perkGrid.appendChild(button);
  });
  if (!choices.length) {
    const button = document.createElement("button");
    button.className = "perk-card";
    button.innerHTML = "<strong>灵气稳固</strong><p>没有可用机缘时，所有角色伤害+5%。</p>";
    button.addEventListener("click", () => {
      chooseLevelUpPerk({
        id: `fallback_damage_${state.runLevel}_${Date.now()}`,
        name: "灵气稳固",
        effect: { type: "role_damage_mult", value: 0.05 },
      });
    });
    perkGrid.appendChild(button);
  }
  perkModal.classList.remove("hidden");
}

function currentRunCharacters() {
  return state.deployedRoles
    .map((role) => DATA.roles[role.roleId])
    .filter(Boolean);
}

function selectedArtifactIds() {
  return state.selectedArtifactId ? [state.selectedArtifactId] : [];
}

function createMartialArtPerk(art) {
  const currentLevel = state.martialArtLevels[art.id] || 0;
  const next = art.levels.find((level) => level.level === currentLevel + 1);
  if (!next) return null;
  return {
    id: `martial_${art.id}_${next.level}`,
    name: `${art.name} Lv${next.level}`,
    category: next.evolutionType === "minor_evolution" ? "先天武学·小进化" : next.evolutionType === "major_evolution" ? "先天武学·大进化" : "先天武学",
    rarity: next.evolutionType === "major_evolution" ? "史诗" : next.evolutionType === "minor_evolution" ? "稀有" : "普通",
    scope: "martial_art",
    martialArtId: art.id,
    effectType: "martial_art_upgrade",
    description: `${next.title}：${next.description}`,
    valueText: `当前Lv${currentLevel} → Lv${next.level}`,
    effect: { type: "martial_art_upgrade", martialArtId: art.id },
  };
}

function createQingyaBranchPerk(upgrade) {
  const currentLevel = state.martialArtLevels.ma_qingya_sword || 0;
  return {
    id: `martial_branch_${upgrade.id}`,
    name: upgrade.name,
    category: upgrade.type === "minor" ? "先天武学·小成" : upgrade.type === "major" || upgrade.type === "major_enhance" ? "先天武学·大成" : "先天武学·分支",
    rarity: upgrade.type === "major" || upgrade.type === "major_enhance" ? "史诗" : upgrade.type === "minor" ? "稀有" : "普通",
    scope: "martial_art_branch",
    martialArtId: "ma_qingya_sword",
    upgradeId: upgrade.id,
    effectType: "martial_art_branch_upgrade",
    description: upgrade.description,
    valueText: `当前Lv${currentLevel} → Lv${Math.min(7, currentLevel + 1)} · ${upgrade.valueText}`,
    effect: {
      type: "martial_art_branch_upgrade",
      martialArtId: "ma_qingya_sword",
      upgradeId: upgrade.id,
    },
  };
}

function createQingyaBranchPerks() {
  return QINGYA_BRANCH_UPGRADES
    .filter(qingyaBranchUpgradeAvailable)
    .map(createQingyaBranchPerk);
}

function currentMartialArtUpgradePerks() {
  return currentRunCharacters().flatMap((character) => {
    const art = martialArtForCharacter(character.id);
    if (!art) return [];
    if (art.id === "ma_qingya_sword") return createQingyaBranchPerks();
    if ((state.martialArtLevels[art.id] || 0) >= art.maxLevel) return [];
    const perk = createMartialArtPerk(art);
    return perk ? [perk] : [];
  });
}

function currentTrajectoryPerks() {
  const trajectories = new Set(currentRunCharacters().map((character) => character.trajectoryType));
  const hasQingya = currentRunCharacters().some((character) => character.id === "lu_qingya");
  const perks = [];
  if (trajectories.has("single") && !hasQingya) {
    perks.push({
      id: "trajectory_single_extra",
      name: "弹道分影",
      category: "武学感悟",
      rarity: "普通",
      scope: "trajectory",
      targetTrajectoryType: "single",
      description: "单体弹道额外发射1道。",
      valueText: "弹道+1",
      effect: { type: "side_projectiles", value: 1 },
    });
  }
  if (trajectories.has("vertical")) {
    perks.push({
      id: "trajectory_vertical_pierce",
      name: "贯势入云",
      category: "武学感悟",
      rarity: "普通",
      scope: "trajectory",
      targetTrajectoryType: "vertical",
      description: "贯穿弹道额外穿透1名敌人。",
      valueText: "穿透+1",
      effect: { type: "pierce_add", value: 1 },
    });
  }
  if (trajectories.has("horizontal")) {
    perks.push({
      id: "trajectory_horizontal_cleave",
      name: "横势开阔",
      category: "武学感悟",
      rarity: "普通",
      scope: "trajectory",
      targetTrajectoryType: "horizontal",
      description: "横向弹道扫击范围提升。",
      valueText: "横扫+1",
      effect: { type: "horizontal_bonus", value: 1 },
    });
  }
  if (trajectories.has("chain")) {
    perks.push({
      id: "trajectory_chain_plus",
      name: "雷弧续跃",
      category: "武学感悟",
      rarity: "普通",
      scope: "trajectory",
      targetTrajectoryType: "chain",
      description: "弹射类攻击额外跳跃1次。",
      valueText: "弹射+1",
      effect: { type: "chain_bonus", value: 1 },
    });
  }
  return perks;
}

function artifactPerksForRun() {
  if (!selectedArtifactIds().length) return [];
  return [
    {
      id: "artifact_resonance_run",
      name: "法宝共鸣",
      category: "武学感悟",
      rarity: "普通",
      scope: "artifact",
      description: "已携带法宝伤害提升。",
      valueText: "法宝伤害+20%",
      effect: { type: "artifact_damage_bonus", value: 0.2 },
    },
  ];
}

function defensivePerksForRun() {
  const hpRatio = state.arrayCoreMaxHp > 0 ? state.arrayCoreHp / state.arrayCoreMaxHp : 1;
  if (hpRatio > 0.6) return [];
  const heal = {
    id: "array_heal_holy_light",
    name: "灵泉回涌",
    category: "阵眼回复",
    rarity: hpRatio < 0.35 ? "稀有" : "普通",
    scope: "array_core",
    description: "立即恢复护山阵眼50点生命。",
    valueText: "阵眼恢复50",
    effect: { type: "array_heal", value: 50 },
    displayOverride: {
      name: "护体圣光",
      category: "阵眼回复",
      description: "圣光护持阵眼，立即恢复护山阵眼50点生命。",
      valueText: "阵眼恢复50",
    },
  };
  Object.assign(heal, heal.displayOverride);
  if (hpRatio < 0.2) return [heal, heal, heal];
  if (hpRatio < 0.35) return [heal, heal];
  return Math.random() < 0.25 ? [heal] : [];
}

function normalizePerk(perk) {
  if (perk.scope) return perk;
  let effectType = perk.effect?.type || perk.effectType || "unimplemented";
  const normalized = { ...perk, effectType };
  const id = perk.id || "";
  const target = `${perk.target || ""} ${perk.requirement || ""}`;
  if (id === "perk_artifact_damage" && effectType === "unimplemented") {
    normalized.effect = { type: "artifact_damage_bonus", value: 0.25 };
    effectType = "artifact_damage_bonus";
    normalized.effectType = effectType;
  }
  if (id === "perk_artifact_cooldown" && effectType === "unimplemented") {
    normalized.effect = { type: "artifact_cooldown_mult", value: 0.8 };
    effectType = "artifact_cooldown_mult";
    normalized.effectType = effectType;
  }
  if (id === "perk_role_focus_random" && effectType === "unimplemented") {
    normalized.effect = { type: "lowest_character_damage", value: 0.2 };
    effectType = "lowest_character_damage";
    normalized.effectType = effectType;
  }
  if (["role_damage_mult", "role_attack_speed", "role_range_add", "crit", "lingqi_gain_mult", "boss_damage_mult", "lowest_character_damage"].includes(effectType)) {
    normalized.scope = "global";
  } else if (effectType.startsWith("array_") || effectType === "base_hp_add") {
    normalized.scope = "array_core";
  } else if (effectType.startsWith("formation_")) {
    normalized.scope = "formation";
  } else if (effectType.startsWith("artifact_") || id.includes("artifact")) {
    normalized.scope = "artifact";
  } else if (["pierce_add", "side_projectiles", "multishot"].includes(effectType)) {
    normalized.scope = "trajectory";
  } else if (id.includes("passive_up") || target.includes("被动")) {
    normalized.scope = "character";
    normalized.requiresPassiveSkill = true;
  } else if (id.includes("sword")) {
    normalized.scope = "character";
    normalized.targetSchool = "剑修";
  } else if (id.includes("fire")) {
    normalized.scope = "character";
    normalized.targetSchool = "火修";
  } else if (id.includes("ice") || id.includes("frost")) {
    normalized.scope = "character";
    normalized.targetSchool = "冰修";
  } else if (id.includes("poison")) {
    normalized.scope = "character";
    normalized.targetSchool = "毒修";
  } else {
    normalized.scope = effectType === "unimplemented" ? "invalid" : "global";
  }
  if (id.includes("vertical") || id.includes("pierce")) normalized.targetTrajectoryType = "vertical";
  if (id.includes("horizontal")) normalized.targetTrajectoryType = "horizontal";
  return normalized;
}

function isPerkValidForCurrentRun(rawPerk) {
  const perk = normalizePerk(rawPerk);
  const effectType = perk.effect?.type || perk.effectType;
  if (["array_defense_bonus", "defense_bonus"].includes(effectType)) return false;
  if (perk.stackable === false && state.acquiredPerks.has(perk.id)) return false;
  const requirement = String(perk.requirement || "");
  if (requirement.includes("局内等级>=")) {
    const required = Number(requirement.match(/\d+/)?.[0] || 1);
    if (state.runLevel < required) return false;
  }
  if (requirement.includes("第5波后") && state.wave <= 5) return false;
  if (perk.scope === "invalid") return false;
  if (perk.scope === "martial_art_branch") {
    if (!currentRunCharacters().some((character) => character.id === "lu_qingya")) return false;
    const upgrade = QINGYA_BRANCH_UPGRADES.find((item) => item.id === perk.upgradeId);
    return Boolean(upgrade && qingyaBranchUpgradeAvailable(upgrade));
  }
  if (perk.scope === "martial_art") {
    const art = (DATA.martialArts || []).find((item) => item.id === perk.martialArtId);
    return Boolean(art && currentRunCharacters().some((character) => character.id === art.ownerCharacterId) && (state.martialArtLevels[art.id] || 0) < art.maxLevel);
  }
  if (perk.scope === "global" || perk.scope === "array_core") return true;
  if (perk.scope === "formation") {
    if (!state.selectedFormationId) return false;
    return !perk.targetFormationId || perk.targetFormationId === state.selectedFormationId;
  }
  if (perk.scope === "artifact") {
    const artifacts = selectedArtifactIds();
    if (!artifacts.length) return false;
    return !perk.targetArtifactId || artifacts.includes(perk.targetArtifactId);
  }
  const deployed = currentRunCharacters();
  if (!deployed.length) return false;
  if (perk.scope === "character") {
    if (perk.targetCharacterId) return deployed.some((character) => character.id === perk.targetCharacterId);
    if (perk.targetSchool) return deployed.some((character) => character.school === perk.targetSchool);
    if (perk.targetRarity) return deployed.some((character) => character.rarity === perk.targetRarity);
    if (perk.targetTrajectoryType) return deployed.some((character) => character.trajectoryType === perk.targetTrajectoryType);
    if (perk.requiresPassiveSkill) return deployed.some((character) => Boolean(character.passiveSkill));
    return true;
  }
  if (perk.scope === "trajectory") {
    if (perk.targetTrajectoryType) return deployed.some((character) => character.trajectoryType === perk.targetTrajectoryType);
    return true;
  }
  return false;
}

function fillWithGenericPerks(choices, count) {
  GENERIC_PERKS.filter((perk) => perk.scope === "global" || perk.id === "generic_focus_lowest").forEach((perk) => {
    if (choices.length >= count) return;
    if (!choices.some((choice) => choice.id === perk.id || perkEffectKey(choice) === perkEffectKey(perk)) && isPerkValidForCurrentRun(perk)) {
      choices.push(perk);
    }
  });
}

function perkSpecificity(perk) {
  if (perk.scope === "martial_art_branch") return 5;
  if (perk.scope === "martial_art") return 4;
  if (perk.targetCharacterId || perk.targetMartialArtId || perk.martialArtId) return 3;
  if (perk.scope === "trajectory" || perk.targetTrajectoryType || perk.targetProjectileType) return 2;
  if (perk.scope === "artifact" || perk.scope === "character") return 1;
  return 0;
}

function perkEffectKey(rawPerk) {
  const perk = normalizePerk(rawPerk);
  const effect = perk.effect || {};
  const effectType = effect.type || perk.effectType || "none";
  const fields = [];
  ["value", "chance", "mult"].forEach((key) => {
    if (effect[key] !== undefined) fields.push(`${key}:${effect[key]}`);
  });
  if (perk.upgradeId) fields.push(`upgrade:${perk.upgradeId}`);
  if (perk.martialArtId || perk.targetMartialArtId) fields.push(`art:${perk.martialArtId || perk.targetMartialArtId}`);
  if (perk.targetProjectileType) fields.push(`projectile:${perk.targetProjectileType}`);
  if (perk.targetTrajectoryType) fields.push(`trajectory:${perk.targetTrajectoryType}`);
  if (perk.targetCharacterId) fields.push(`character:${perk.targetCharacterId}`);
  return `${effectType}|${fields.join("|")}`;
}

function dedupePerks(perks) {
  const byKey = new Map();
  perks.forEach((perk) => {
    const normalized = normalizePerk(perk);
    const key = perkEffectKey(normalized);
    const existing = byKey.get(key);
    if (!existing || perkSpecificity(normalized) > perkSpecificity(existing)) {
      byKey.set(key, normalized);
    }
  });
  return [...byKey.values()];
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
  const martialPool = dedupePerks(currentMartialArtUpgradePerks());
  const supportPool = [
    ...currentTrajectoryPerks(),
    ...artifactPerksForRun(),
    ...defensivePerksForRun(),
    ...GENERIC_PERKS.filter((perk) => perk.scope === "global"),
  ]
    .map(normalizePerk)
    .filter(isPerkValidForCurrentRun);
  const pool = dedupePerks([...martialPool, ...martialPool, ...martialPool, ...supportPool]);
  const choices = [];
  const forcedHeal = defensivePerksForRun()[0];
  if (forcedHeal && state.arrayCoreMaxHp > 0 && state.arrayCoreHp / state.arrayCoreMaxHp < 0.2) {
    choices.push(forcedHeal);
  }
  while (choices.length < count && pool.length) {
    const total = pool.reduce((sum, perk) => sum + (rarityWeight[perk.rarity] || 12), 0);
    let roll = Math.random() * total;
    const selected = pool.find((perk) => {
      roll -= rarityWeight[perk.rarity] || 12;
      return roll <= 0;
    }) || pool[pool.length - 1];
    if (!choices.some((choice) => choice.id === selected.id || perkEffectKey(choice) === perkEffectKey(selected))) choices.push(selected);
    pool.splice(pool.indexOf(selected), 1);
  }
  if (choices.length < count) fillWithGenericPerks(choices, count);
  return choices;
}

function drawPerks(count) {
  const pool = DATA.perks.filter((perk) => {
    const requirement = String(perk.requirement || "");
    if (perk.stackable === false && state.acquiredPerks.has(perk.id)) return false;
    if (perk.id === "perk_sword_passive_up" && !hasPassiveRole("剑")) return false;
    if (perk.id === "perk_fire_passive_up" && !hasPassiveRole("火")) return false;
    if (perk.id === "perk_ice_passive_up" && !hasPassiveRole("冰")) return false;
    if (perk.id === "perk_poison_passive_up" && !hasPassiveRole("毒")) return false;
    if (requirement.includes("局内等级>=")) {
      const required = Number(requirement.match(/\d+/)?.[0] || 1);
      return state.runLevel >= required;
    }
    if (requirement.includes("第5波后")) return state.wave > 5;
    return true;
  });
  const choices = [];
  while (choices.length < count && pool.length) {
    const total = pool.reduce((sum, perk) => sum + (rarityWeight[perk.rarity] || 12), 0);
    let roll = Math.random() * total;
    const selected = pool.find((perk) => {
      roll -= rarityWeight[perk.rarity] || 12;
      return roll <= 0;
    }) || pool[pool.length - 1];
    choices.push(selected);
    pool.splice(pool.indexOf(selected), 1);
  }
  return choices;
}

function hasPassiveRole(school) {
  return state.deployedRoles.some((role) => {
    const config = DATA.roles[role.roleId];
    return config.school === school && Boolean(config.passiveSkill);
  });
}

function applyPerk(perk) {
  perk = normalizePerk(perk);
  if (!isPerkValidForCurrentRun(perk)) {
    state.bonuses.roleDamage *= 1.05;
    setStatus("当前无可用机缘目标，已转化为全体角色伤害+5%。");
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
      state.bonuses.artifactDamage *= 1 + effect.value;
      break;
    case "artifact_cooldown_mult":
      state.bonuses.artifactCooldown *= effect.value;
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
        state.bonuses.roleDamage *= 1.05;
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
        state.bonuses.roleDamage *= 1.05;
        break;
      }
      getMartialBranchState(art.id)[upgrade.id] = true;
      const current = state.martialArtLevels[art.id] || 0;
      state.martialArtLevels[art.id] = Math.min(art.maxLevel, current + 1);
      break;
    }
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

function getDebugSnapshot() {
  return {
    APP_STATE: state.appState,
    "player.level": state.runLevel,
    "profile.playerLevel": playerMeta.playerLevel,
    "profile.playerExp": playerMeta.playerExp,
    "profile.spiritStones": playerMeta.spiritStones,
    "profile.maxDeploySlots": playerMeta.maxDeploySlots,
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

function updateDebugPanel() {
  const snapshot = getDebugSnapshot();
  debugPanel.textContent = Object.entries(snapshot)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
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

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
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

resetGame();
requestAnimationFrame(loop);
