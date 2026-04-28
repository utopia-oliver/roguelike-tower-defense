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
};

const rarityWeight = {
  "普通": 70,
  "稀有": 24,
  "史诗": 8,
  "传说": 2,
};

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

const playerMeta = {
  level: 1,
  lingstone: 0,
  ownedRoles: [...DATA.initial.roles],
  ownedArtifacts: [DATA.initial.artifact],
  unlockedFormations: [DATA.initial.formation],
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
  };
}

function resetGame() {
  Object.assign(state, {
    appState: APP_STATE.LOBBY,
    phase: "lobby",
    running: false,
    paused: false,
    gameOver: false,
    wave: 1,
    highestWave: 1,
    baseHp: DATA.config.baseHp,
    maxBaseHp: DATA.config.baseHp,
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
      state.loadoutRoleIds = playerMeta.ownedRoles.slice(0, DATA.config.rosterSlots);
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
    state.loadoutRoleIds.length <= DATA.config.rosterSlots &&
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
  state.selectedFormationId = state.loadoutFormationId;
  state.selectedArtifactId = state.loadoutArtifactId;
  state.availableRoles = [...state.loadoutRoleIds];
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
  if (state.deployedRoles.length >= DATA.config.rosterSlots) {
    setStatus(`上阵槽已满，本局最多部署 ${DATA.config.rosterSlots} 名角色。`);
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

  hasStatus(type) {
    return this.statuses.some((status) => status.type === type);
  }

  addStatus(type, duration, value) {
    if (type === "slow" && this.config.id === "boss_outer_demon") return;
    const existing = this.statuses.find((status) => status.type === type);
    if (existing) {
      existing.duration = Math.max(existing.duration, duration);
      existing.value = Math.max(existing.value, value);
      return;
    }
    this.statuses.push({ type, duration, value, tick: 0 });
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
      const poisonSpreadRole = state.deployedRoles.some((role) => role.roleId === "role_ning_caiwei");
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
        damageArrayCore(this.attackDamage, this);
        state.floaters.push({
          x: canvas.width / 2,
          y: canvas.height - grid.cellH * 0.65,
          text: `-${this.attackDamage}`,
          ttl: 0.65,
          color: "#ff9a76",
        });
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

function roleStats(role) {
  const config = DATA.roles[role.roleId];
  const sectLeader = state.deployedRoles.some((item) => item.roleId === "role_shen_tianque");
  const sectLeaderBonus = sectLeader ? (state.baseHp / state.maxBaseHp < 0.3 ? 1.2 : 1.1) : 1;
  const elderSwordCount =
    role.roleId === "role_yunhe_elder"
      ? 1 + state.deployedRoles.filter((item) => DATA.roles[item.roleId].school === "剑").length * 0.08
      : 1;
  return {
    damage: config.baseDamage * state.bonuses.roleDamage * role.personalDamage * sectLeaderBonus * elderSwordCount,
    interval: config.attackInterval / (state.bonuses.roleAttackSpeed * role.personalSpeed),
    range: (config.range + state.bonuses.roleRangeAdd) * grid.cellH,
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
  if (role.roleId === "role_zhao_xuance" && role.attacks % 4 === 3) {
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
  if (config.talent.includes("连续攻击同一目标")) {
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
  let damage = stats.damage;
  if ((config.passiveSkill || config.talent || "").includes("连续攻击同一目标")) {
    damage *= 1 + role.sameTargetStacks * 0.05 * state.bonuses.passiveMultiplier;
  }
  if (role.roleId === "role_bai_luoli" && target.hasStatus("slow")) {
    damage *= 1 + 0.2 * state.bonuses.passiveMultiplier;
  }
  if (Math.random() < state.bonuses.critChance) {
    damage *= state.bonuses.critMult;
  }

  const projectileCount = 1 + state.bonuses.sideProjectiles;
  const targets = [target, ...sideTargets(target, projectileCount - 1)];
  targets.forEach((enemy) => applyRoleHit(role, enemy, damage));
  drawShot(role.x, role.y, target.x, target.y, colors[config.school] || "#eee");
}

function applyRoleHit(role, target, damage) {
  if (!target || target.dead) return;
  const config = DATA.roles[role.roleId];
  const projectile = config.trajectoryType || config.projectile;
  const killed = target.takeDamage(damage, "role", role);

  if (projectile === "splash") {
    areaDamage(target.x, target.y, grid.cellW * 0.65, damage * 0.55, "role");
  }
  if (projectile === "horizontal") {
    horizontalTargets(target, 2).forEach((enemy) => enemy.takeDamage(damage * 0.7, "role", role));
  }
  if (projectile === "slow" || config.school === "冰") {
    target.addStatus("slow", 1.2 * state.bonuses.controlMultiplier, 0.2);
  }
  if (projectile === "poison" || config.school === "毒") {
    target.addStatus("poison", 3 + state.bonuses.poisonDurationAdd, Math.max(2, damage * 0.22));
  }
  if (projectile === "pierce" || state.bonuses.pierceAdd > 0) {
    const count = (projectile === "pierce" ? 1 : 0) + state.bonuses.pierceAdd;
    enemiesBehind(target, count).forEach((enemy) => enemy.takeDamage(damage * 0.65, "role", role));
  }
  if (projectile === "chain") {
    nearestEnemies(target, 2).forEach((enemy) => enemy.takeDamage(damage * 0.55, "role", role));
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
}

function chooseTarget(source, range) {
  const candidates = state.enemies.filter(
    (enemy) => !enemy.dead && distance(source, enemy) <= range,
  );
  if (!candidates.length) return null;
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
  const damage = 34 * state.bonuses.formationDamage;
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
  state.projectiles.push({ x, y, tx, ty, color, ttl: 0.16 });
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
    enemy.takeDamage(artifact.damage, "artifact");
    drawShot(origin.x, origin.y, enemy.x, enemy.y, "#f6d365");
  });
  state.floaters.push({
    x: origin.x,
    y: origin.y - 18,
    text: artifact.name.slice(0, 4),
    ttl: 0.7,
    color: "#f6d365",
  });
  state.artifactCooldown = Math.max(2, artifact.cooldown);
}

function damageArrayCore(amount, enemy) {
  state.baseHp = Math.max(0, state.baseHp - amount);
  setStatus(`${enemy.config.name} 正在攻击护山大阵 / 护山阵眼，HP -${amount}。`);
  if (state.baseHp <= 0) {
    endGame(false);
  }
}

function updateEffects(dt) {
  state.projectiles.forEach((projectile) => (projectile.ttl -= dt));
  state.projectiles = state.projectiles.filter((projectile) => projectile.ttl > 0);
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
  const choices = drawPerks(3);
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
      state.maxBaseHp += effect.value;
      state.baseHp = Math.min(state.maxBaseHp, state.baseHp + effect.value);
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

function endGame(win) {
  if (state.gameOver) return;
  state.gameOver = true;
  state.running = false;
  state.appState = APP_STATE.SETTLEMENT;
  state.paused = false;
  const reward = calculateSettlement(win);
  playerMeta.lingstone += reward;
  settlementTitle.textContent = win ? "守山成功" : "阵眼破碎";
  settlementWave.textContent = state.highestWave;
  settlementKills.textContent = state.kills;
  settlementLingstone.textContent = reward;
  showView(settlementView);
  updateDebugPanel();
}

function renderLobby() {
  metaLevel.textContent = playerMeta.level;
  metaLingstone.textContent = playerMeta.lingstone;
  ownedRolesList.innerHTML = playerMeta.ownedRoles
    .map((id) => `<span>${DATA.roles[id].name}</span>`)
    .join("");
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
  playerMeta.ownedRoles.forEach((id) => {
    const role = DATA.roles[id];
    const selected = state.loadoutRoleIds.includes(id);
    const button = document.createElement("button");
    button.className = "choice";
    button.classList.toggle("selected", selected);
    button.innerHTML = `<strong>${role.name}</strong><span>${role.rank} · ${role.school} · ${role.projectile}</span>`;
    button.addEventListener("click", () => {
      if (selected) {
        state.loadoutRoleIds = state.loadoutRoleIds.filter((roleId) => roleId !== id);
      } else if (state.loadoutRoleIds.length < DATA.config.rosterSlots) {
        state.loadoutRoleIds.push(id);
      } else {
        setStatus(`最多选择 ${DATA.config.rosterSlots} 名出战角色。`);
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

  const roleText = `${state.loadoutRoleIds.length}/${DATA.config.rosterSlots}`;
  loadoutStatus.textContent = loadoutReady()
    ? `配置完成：1个阵法，${roleText} 名角色，1个法宝。`
    : `配置未完成：需要 1 个阵法、1-3 名角色、1 个法宝。当前角色 ${roleText}。`;
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
    button.innerHTML = `<strong>${role.name}</strong><span>${role.rank} · ${role.school} · ${role.projectile}</span>`;
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
  hpText.textContent = `${Math.max(0, Math.ceil(state.baseHp))} / ${state.maxBaseHp}`;
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
    baseHp: Math.ceil(state.baseHp),
    kills: state.kills,
    "projectiles.length": state.projectiles.length,
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
  ctx.strokeStyle = projectile.color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(projectile.x, projectile.y);
  ctx.lineTo(projectile.tx, projectile.ty);
  ctx.stroke();
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
  setStatus("角色升级入口已接入，后续消耗局外灵石提升角色基础属性。");
});
gachaButton.addEventListener("click", () => {
  setStatus("抽卡入口已接入，后续消耗局外灵石获取宗门角色。");
});

resetGame();
requestAnimationFrame(loop);
