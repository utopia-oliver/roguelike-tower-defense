(() => {
  window.XM = window.XM || {};
  window.XM.Enemies = window.XM.Enemies || {};

  const ENEMY_STATE = window.XM.Constants.ENEMY_STATE;

  function call(context, name, ...args) {
    const fn = context?.callbacks?.[name] || context?.helpers?.[name];
    if (typeof fn !== "function") return undefined;
    return fn(...args);
  }

  function getState(context) {
    return context.state;
  }

  function getData(context) {
    return context.DATA || context.data;
  }

  function getGrid(context) {
    return context.grid;
  }

  function getAttackLineY(context) {
    const value = context.attackLineY || context.helpers?.attackLineY;
    return typeof value === "function" ? value() : Number(value || 0);
  }

  function isEnemyTargetable(enemy) {
    return Boolean(
      enemy &&
        enemy.hp > 0 &&
        !enemy.dead &&
        !enemy.isDead &&
        enemy.state !== ENEMY_STATE.DEAD &&
        enemy.state !== "dead" &&
        enemy.state !== "DYING" &&
        !enemy.markedForRemoval,
    );
  }

  class Enemy {
    constructor(enemyId, context = {}) {
      const data = getData(context);
      const grid = getGrid(context);
      const config = data.enemies[enemyId];
      this.context = context;
      this.id = call(context, "makeId") || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
      this.isDead = false;
      this.markedForRemoval = false;
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
      const state = getState(this.context);
      if (!isEnemyTargetable(this)) return false;
      let amount = rawAmount;
      if (this.config.isBoss) amount *= state.bonuses.bossDamage;
      const vulnerable = this.statuses
        .filter((status) => status.type === "vulnerable")
        .reduce((max, status) => Math.max(max, status.value), 0);
      if (vulnerable > 0) amount *= 1 + vulnerable;
      if (this.hasStatus("slow")) amount *= 1 + state.bonuses.slowVulnerability;
      this.hp -= amount;
      call(this.context, "addFloater", {
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
      const state = getState(this.context);
      const data = getData(this.context);
      if (this.state === ENEMY_STATE.DEAD) return;
      this.dead = true;
      this.isDead = true;
      this.markedForRemoval = true;
      this.state = ENEMY_STATE.DEAD;
      state.kills += 1;
      if (this.config.isBoss) {
        state.bossKills.add(state.wave);
      }
      if (this.hasStatus("poison")) {
        const poisonSpreadRole = state.deployedRoles.some((role) => data.roles[role.roleId]?.passiveSkill === "poison_stack");
        if (poisonSpreadRole && Math.random() < 0.3 + state.bonuses.poisonSpreadChanceAdd) {
          const nearby = call(this.context, "nearestEnemies", this, 3) || [];
          nearby.forEach((enemy) => enemy.addStatus("poison", 3, 5));
        }
      }
      call(this.context, "gainLingqi", this.spiritQiReward);
    }

    enterAttackMode() {
      if (this.state !== ENEMY_STATE.MOVING) return;
      this.state = ENEMY_STATE.ATTACKING;
      this.moveSpeed = 0;
      this.y = getAttackLineY(this.context);
      this.progress = Math.max(this.progress, 0.95);
      this.attackTimer = 0;
      call(this.context, "setStatus", `${this.config.name} 抵达护山大阵前方，开始攻击阵眼血条。`);
    }

    attackArrayCore(dt) {
      this.attackTimer += dt;
      if (this.attackTimer < this.attackInterval) return;
      this.attackTimer = 0;
      const weaken = this.statuses
        .filter((status) => status.type === "weaken_attack")
        .reduce((max, status) => Math.max(max, status.value), 0);
      call(this.context, "damageArrayCore", this.attackDamage * (1 - weaken), this);
    }

    update(dt) {
      const state = getState(this.context);
      const grid = getGrid(this.context);
      this.updateStatuses(dt);
      this.updateBossAbility(dt);
      if (this.state === ENEMY_STATE.DEAD) return;
      if (this.state === ENEMY_STATE.ATTACKING) {
        this.attackArrayCore(dt);
        return;
      }
      const slow = this.statuses
        .filter((status) => status.type === "slow")
        .reduce((max, status) => Math.max(max, status.value), 0);
      const frozen = this.hasStatus("freeze");
      if (!frozen) {
        this.progress += (this.moveSpeed * (1 - slow) * dt) / 6.1;
        this.y = this.progress * (getAttackLineY(this.context) + grid.cellH * 0.35) - grid.cellH * 0.35;
        this.x =
          this.lane * grid.cellW +
          grid.cellW / 2 +
          Math.sin(this.progress * Math.PI * 3) * 10;
      }
      if (this.y >= getAttackLineY(this.context)) this.enterAttackMode();
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
      const state = getState(this.context);
      const grid = getGrid(this.context);
      if (!this.config.isBoss || this.dead) return;
      this.abilityTimer += dt;
      if (this.config.id === "boss_blackwind" && this.abilityTimer >= 8) {
        this.abilityTimer = 0;
        for (let i = 0; i < 3; i += 1) {
          call(this.context, "spawnEnemy", "enemy_little_yao");
        }
        call(this.context, "setStatus", "黑风妖将召来山野小妖。");
      }
      if (this.config.id === "boss_bloodlotus" && this.abilityTimer >= 10) {
        this.abilityTimer = 0;
        state.enemies.forEach((enemy) => {
          if (isEnemyTargetable(enemy) && call(this.context, "distance", this, enemy) <= grid.cellW * 2) {
            enemy.hp = Math.min(enemy.maxHp, enemy.hp + 90);
          }
        });
        call(this.context, "setStatus", "血莲魔修治疗附近敌人。");
      }
      if (this.config.id === "boss_outer_demon" && this.abilityTimer >= 7) {
        this.abilityTimer = 0;
        call(this.context, "spawnEnemy", "enemy_swift_wolf");
        call(this.context, "spawnEnemy", "enemy_little_yao");
        this.addStatus("freeze_immune", 2, 1);
        call(this.context, "setStatus", "域外魔影召唤魔影小怪。");
      }
    }
  }

  function createEnemy({ enemyId, context }) {
    return new Enemy(enemyId, context);
  }

  function updateEnemies({ enemies, deltaTime }) {
    enemies.forEach((enemy) => enemy.update(deltaTime));
  }

  Object.assign(window.XM.Enemies, {
    Enemy,
    createEnemy,
    isEnemyTargetable,
    updateEnemies,
  });
})();
