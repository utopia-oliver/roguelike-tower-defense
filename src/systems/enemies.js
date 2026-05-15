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
        Number.isFinite(enemy.x) &&
        Number.isFinite(enemy.y) &&
        Number.isFinite(enemy.hp) &&
        enemy.hp > 0 &&
        !enemy.dead &&
        !enemy.isDead &&
        enemy.state !== ENEMY_STATE.DEAD &&
        enemy.state !== "dead" &&
        enemy.state !== "DYING" &&
        !enemy.markedForRemoval,
    );
  }

  function isEnemyAlive(enemy) {
    return Boolean(
      enemy &&
        Number.isFinite(enemy.x) &&
        Number.isFinite(enemy.y) &&
        Number.isFinite(enemy.hp) &&
        enemy.hp > 0 &&
        !enemy.dead &&
        !enemy.isDead &&
        !enemy.markedForRemoval,
    );
  }

  function statusValue(enemy, type) {
    return enemy.statuses
      .filter((status) => status.type === type)
      .reduce((max, status) => Math.max(max, Number(status.value) || 0), 0);
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
      this.hp = Number(config.hp) || 1;
      this.maxHp = Number(config.maxHp) || this.hp;
      this.moveSpeed = Number(config.moveSpeed || config.speed) || 1;
      this.baseMoveSpeed = this.moveSpeed;
      this.attackDamage = Number(config.attackDamage || config.baseDamage) || 1;
      this.attackMode = config.attackMode || (config.isBoss ? "boss" : config.isElite ? "elite" : "melee");
      this.spiritQiReward = Number(config.spiritQiReward || config.lingqiReward) || 0;
      this.armor = Number(config.armor) || 0;
      this.defensePierceRatio = Number(config.defensePierceRatio) || 0;
      this.resistances = config.resistances || {};
      this.statusImmunities = config.statusImmunities || [];
      this.abilities = Array.isArray(config.abilities) ? config.abilities : [];
      this.isElite = Boolean(config.isElite);
      this.isBoss = Boolean(config.isBoss);
      this.dead = false;
      this.isDead = false;
      this.markedForRemoval = false;
      this.state = ENEMY_STATE.MOVING;
      this.attackTimer = 0;
      this.attackInterval = config.attackInterval || (this.config.isBoss ? 2.5 : 1.5);
      this.progress = 0;
      this.statuses = [];
      this.abilityTimer = 0;
      this.idleTimer = 0;
      this.noActionTimer = 0;
      this.lastActionAt = 0;
      this.lastDamageToCoreAt = 0;
      this.lastAbilityCastAt = 0;
      this.lastMoveAt = 0;
      this.watchdogRecoveries = 0;
      this.watchdogHardRecoveries = 0;
      this.elapsedTime = 0;
      this.lastX = this.x;
      this.lastY = this.y;
      this.failedCastCount = 0;
      this.phase = 1;
    }

    get radius() {
      if (this.config.drawRadius) return this.config.drawRadius;
      if (this.config.isBoss || this.config.isElite) return 24;
      if (this.config.type === "armored") return 20;
      if (this.config.type === "fast") return 12;
      return Math.max(13, Math.min(22, (this.config.hitRadius || 18) - 4));
    }

    get hitRadius() {
      if (this.config.hitRadius) return this.config.hitRadius;
      if (this.config.isBoss) return 32;
      return this.radius + 4;
    }

    hasStatus(type) {
      return this.statuses.some((status) => status.type === type);
    }

    addStatus(type, duration, value, options = {}) {
      if (type === "slow" && this.config.id === "boss_outer_demon") return;
      const normalizedType = type === "attack_down" ? "weaken_attack" : type;
      if (this.statusImmunities.includes(normalizedType)) return;
      const safeDuration = Number(duration);
      const safeValue = Number(value) || 0;
      if (!Number.isFinite(safeDuration) || safeDuration <= 0) return;
      const existing = this.statuses.find((status) => status.type === normalizedType);
      if (existing) {
        existing.duration = Math.max(existing.duration, safeDuration);
        if (options.stack) {
          existing.stacks = Math.min(options.maxStacks || 3, (existing.stacks || 1) + 1);
          existing.value = safeValue * existing.stacks;
        } else {
          existing.value = Math.max(existing.value, safeValue);
        }
        return;
      }
      this.statuses.push({ type: normalizedType, duration: safeDuration, value: safeValue, tick: 0, stacks: options.stack ? 1 : 0 });
    }

    takeDamage(rawAmount, source = "role", attacker = null) {
      const state = getState(this.context);
      if (!isEnemyTargetable(this)) return false;
      let amount = rawAmount;
      if (this.config.isBoss) amount *= state.bonuses.bossDamage;
      const vulnerable = statusValue(this, "vulnerable");
      if (vulnerable > 0) amount *= 1 + vulnerable;
      if (this.hasStatus("slow")) amount *= 1 + state.bonuses.slowVulnerability;
      if (this.armor > 0 && source !== "poison" && source !== "burn") amount = Math.max(1, amount - this.armor);
      const armorReduction = statusValue(this, "demon_armor");
      if (armorReduction > 0 && source !== "poison" && source !== "burn") amount *= Math.max(0.05, 1 - armorReduction);
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
      if (this.config.id === "miasma_mirage") {
        call(this.context, "addVisualEvent", {
          type: "poison_cloud",
          x: this.x,
          y: this.y,
          radius: this.config.miasmaRadius || 80,
          duration: this.config.miasmaDuration || 3,
          colorKey: "poison",
          sourceId: this.config.id,
        });
        call(this.context, "addFloater", {
          x: this.x,
          y: this.y - this.radius - 8,
          text: "腐瘴",
          ttl: 0.8,
          color: "#b9f06b",
        });
      }
      call(this.context, "gainLingqi", this.spiritQiReward);
    }

    enterAttackMode() {
      if (this.state !== ENEMY_STATE.MOVING) return;
      this.state = ENEMY_STATE.ATTACKING;
      this.moveSpeed = 0;
      this.progress = Math.max(this.progress, 0.95);
      this.attackTimer = 0;
      this.idleTimer = 0;
      this.noActionTimer = 0;
      this.lastX = this.x;
      this.lastY = this.y;
      if (this.attackMode === "ranged") {
        call(this.context, "setStatus", `${this.config.name}停在阵前，开始远程袭扰阵眼。`);
      } else if (this.attackMode === "caster") {
        call(this.context, "setStatus", `${this.config.name}停在阵前，开始施放妖术。`);
      } else {
        call(this.context, "setStatus", `${this.config.name} 抵达护山大阵前方，开始攻击阵眼血条。`);
      }
    }

    attackArrayCore(dt) {
      this.attackTimer += dt;
      const interval = this.attackMode === "ranged" ? this.config.rangedAttackInterval || this.attackInterval : this.attackInterval;
      if (this.attackTimer < interval) return false;
      this.attackTimer = 0;
      const weaken = statusValue(this, "weaken_attack");
      const damage = this.attackMode === "ranged" ? this.config.rangedAttackDamage || this.attackDamage : this.attackDamage;
      call(this.context, "damageArrayCore", damage * (1 - weaken), this);
      this.lastDamageToCoreAt = this.elapsedTime;
      if (this.attackMode === "ranged") {
        const base = call(this.context, "getArrayCorePosition") || { x: this.x, y: getAttackLineY(this.context) + 60 };
        call(this.context, "addVisualEvent", {
          type: "demon_projectile",
          fromX: this.x,
          fromY: this.y,
          toX: base.x,
          toY: base.y,
          x: base.x,
          y: base.y,
          radius: 34,
          duration: 0.45,
          colorKey: "demon",
          sourceId: this.config.id,
        });
      }
      this.recordAction();
      return true;
    }

    castCasterFallback() {
      const base = call(this.context, "getArrayCorePosition") || { x: this.x, y: getAttackLineY(this.context) + 60 };
      const damage = Math.max(1, Number(this.config.casterFallbackDamage || this.config.rangedAttackDamage || this.attackDamage * 0.75) || 1);
      call(this.context, "damageArrayCore", damage, this);
      this.lastDamageToCoreAt = this.elapsedTime;
      call(this.context, "addVisualEvent", {
        type: "curse_beam",
        fromX: this.x,
        fromY: this.y,
        toX: base.x,
        toY: base.y,
        x: base.x,
        y: base.y,
        radius: 40,
        duration: 0.45,
        colorKey: "curse",
        sourceId: this.config.id,
      });
      call(this.context, "setStatus", `${this.config.name}无妖可催，转而以幽符咒击阵眼。`);
      this.failedCastCount += 1;
      this.recordAction();
      if (this.failedCastCount >= 2) this.prepareNaturalAdvance();
    }

    recordAction() {
      this.idleTimer = 0;
      this.noActionTimer = 0;
      this.lastActionAt = this.elapsedTime;
      this.lastY = this.y;
      this.lastX = this.x;
    }

    recordAbilityAction() {
      this.lastAbilityCastAt = this.elapsedTime;
      this.recordAction();
    }

    prepareNaturalAdvance() {
      const lineY = getAttackLineY(this.context);
      if (!Number.isFinite(lineY) || this.y >= lineY) return;
      this.state = ENEMY_STATE.MOVING;
      this.moveSpeed = Math.max(20, Number(this.moveSpeed) || Number(this.baseMoveSpeed) || 20);
      this.baseMoveSpeed = Math.max(20, Number(this.baseMoveSpeed) || this.moveSpeed);
      this.lastMoveAt = this.elapsedTime;
    }

    forceMoveTowardArrayCore(dt) {
      const lineY = getAttackLineY(this.context);
      if (!Number.isFinite(lineY)) return false;
      if (this.y >= lineY) {
        this.state = ENEMY_STATE.ATTACKING;
        return false;
      }
      this.prepareNaturalAdvance();
      return true;
    }

    markInvalidForRemoval() {
      this.hp = 0;
      this.dead = true;
      this.isDead = true;
      this.markedForRemoval = true;
      this.state = ENEMY_STATE.DEAD;
    }

    update(dt) {
      dt = Math.min(Math.max(Number(dt) || 0, 0), 0.12);
      const prevX = this.x;
      const prevY = this.y;
      this.elapsedTime += dt;
      if (!Number.isFinite(this.x) || !Number.isFinite(this.y) || !Number.isFinite(this.hp)) {
        console.warn("[Enemy] invalid numeric state, remove enemy", {
          id: this.config?.id || this.id,
          name: this.config?.name,
          hp: this.hp,
          x: this.x,
          y: this.y,
          state: this.state,
          attackMode: this.attackMode,
        });
        this.markInvalidForRemoval();
        return;
      }
      if (this.hp <= 0) {
        this.markInvalidForRemoval();
        return;
      }
      const grid = getGrid(this.context);
      this.updateStatuses(dt);
      if (this.state === ENEMY_STATE.DEAD) return;
      if (this.hp <= 0 || this.dead || this.isDead || this.markedForRemoval) return;
      this.updateBehaviorTimers(dt);
      if (this.state === ENEMY_STATE.ATTACKING) {
        const abilityResult = this.useAbility(dt);
        if (this.attackMode === "caster") {
          if (abilityResult === false) this.castCasterFallback();
          else if (abilityResult === true) {
            this.failedCastCount = 0;
            this.recordAction();
          } else if (this.idleTimer >= (this.config.maxIdleTime || 10)) {
            this.castCasterFallback();
          }
          this.applyBehaviorWatchdog(dt);
          this.warnSuspiciousMovement(prevX, prevY);
          return;
        }
        const didAttack = this.attackArrayCore(dt);
        if (!didAttack && this.attackMode === "ranged" && this.idleTimer >= (this.config.maxIdleTime || 10)) {
          this.attackTimer = Math.max(this.attackTimer, this.config.rangedAttackInterval || this.attackInterval);
          this.attackArrayCore(0);
        }
        this.applyBehaviorWatchdog(dt);
        this.warnSuspiciousMovement(prevX, prevY);
        return;
      }
      this.useAbility(dt);
      const slow = statusValue(this, "slow");
      const haste = statusValue(this, "haste");
      const frozen = this.hasStatus("freeze");
      if (!frozen) {
        const lineY = getAttackLineY(this.context);
        const pathLength = lineY + grid.cellH * 0.35;
        const speedPerSecond = this.baseMoveSpeed > 10 ? this.baseMoveSpeed : (this.baseMoveSpeed * pathLength) / 6.1;
        const previousY = this.y;
        const nextProgress = this.progress + (speedPerSecond * Math.max(0.05, 1 - slow + haste) * dt) / pathLength;
        const proposedY = nextProgress * (lineY + grid.cellH * 0.35) - grid.cellH * 0.35;
        const maxStep = 80;
        const stepY = Math.max(-maxStep, Math.min(maxStep, proposedY - previousY));
        this.y = previousY + stepY;
        this.progress = Math.max(0, (this.y + grid.cellH * 0.35) / (lineY + grid.cellH * 0.35));
        this.x =
          this.lane * grid.cellW +
          grid.cellW / 2 +
          Math.sin(this.progress * Math.PI * 3) * 10;
      }
      const stopY = this.getStopY();
      if (this.y >= stopY) {
        this.y = stopY;
        this.enterAttackMode();
      }
      this.applyBehaviorWatchdog(dt);
      this.warnSuspiciousMovement(prevX, prevY);
    }

    updateBehaviorTimers(dt) {
      const moved = Math.hypot(this.x - this.lastX, this.y - this.lastY) > 1;
      if (moved) {
        this.idleTimer = 0;
        this.lastMoveAt = this.elapsedTime;
      } else {
        this.idleTimer += dt;
      }
      this.noActionTimer += dt;
      this.lastX = this.x;
      this.lastY = this.y;
    }

    applyBehaviorWatchdog(dt) {
      if (!isEnemyAlive(this) || !Number.isFinite(this.x) || !Number.isFinite(this.y)) return;
      const stuck = this.idleTimer > 6 && this.noActionTimer > 6;
      const skillStateStuck = ![ENEMY_STATE.MOVING, ENEMY_STATE.ATTACKING, ENEMY_STATE.DEAD].includes(this.state) && this.noActionTimer > 8;
      if (!stuck && !skillStateStuck) return;

      this.watchdogRecoveries += 1;
      const lineY = getAttackLineY(this.context);
      this.state = this.state === ENEMY_STATE.DEAD ? ENEMY_STATE.DEAD : Number.isFinite(lineY) && this.y >= lineY ? ENEMY_STATE.ATTACKING : ENEMY_STATE.MOVING;
      this.attackTimer = Math.max(this.attackTimer || 0, this.attackInterval || 1);
      this.abilityTimer = Math.max(this.abilityTimer || 0, this.config.abilityCooldown || 5);

      if (this.attackMode === "ranged") {
        this.attackTimer = Math.max(this.attackTimer, this.config.rangedAttackInterval || this.attackInterval || 1);
        if (!this.attackArrayCore(0)) this.prepareNaturalAdvance();
      } else if (this.attackMode === "caster") {
        const abilityResult = this.useAbility(0);
        if (abilityResult === true) {
          this.failedCastCount = 0;
          this.recordAction();
        } else {
          this.castCasterFallback();
        }
      } else {
        if (Number.isFinite(lineY) && this.y < lineY - 1) {
          this.prepareNaturalAdvance();
        } else {
          this.state = ENEMY_STATE.ATTACKING;
          this.attackTimer = Math.max(this.attackTimer || 0, this.attackInterval || 1);
          this.attackArrayCore(0);
        }
      }

      if (this.watchdogRecoveries >= 3 || this.noActionTimer > 15) {
        this.watchdogHardRecoveries += 1;
        this.state = ENEMY_STATE.MOVING;
        this.moveSpeed = Math.max(20, Number(this.moveSpeed) || Number(this.baseMoveSpeed) || 20);
        this.baseMoveSpeed = Math.max(20, Number(this.baseMoveSpeed) || this.moveSpeed);
        this.noActionTimer = 0;
        this.idleTimer = 0;
      }
    }

    getStopY() {
      const lineY = getAttackLineY(this.context);
      const grid = getGrid(this.context);
      const monsterLaneTop = grid?.cellH || 0;
      const minStopY = monsterLaneTop + 100;
      const maxStopY = lineY - 140;
      if (this.attackMode === "ranged") {
        const safeOffset = Math.min(Number(this.config.rangedStopOffset) || 200, 210);
        const stopY = lineY - safeOffset;
        return Math.max(minStopY, Math.min(maxStopY, stopY));
      }
      if (this.attackMode === "caster") {
        const safeOffset = Math.min(Number(this.config.casterStopOffset) || 210, 230);
        const stopY = lineY - safeOffset;
        return Math.max(minStopY, Math.min(maxStopY, stopY));
      }
      return lineY;
    }

    warnSuspiciousMovement(prevX, prevY) {
      if (!Number.isFinite(prevX) || !Number.isFinite(prevY) || !Number.isFinite(this.x) || !Number.isFinite(this.y)) return;
      const moveDelta = Math.hypot(this.x - prevX, this.y - prevY);
      if (moveDelta <= 100 || this.largeMoveWarned) return;
      this.largeMoveWarned = true;
      console.warn("[Enemy] suspicious large movement", {
        id: this.config?.id || this.id,
        name: this.config?.name,
        attackMode: this.attackMode,
        state: this.state,
        prevX,
        prevY,
        x: this.x,
        y: this.y,
        moveDelta,
        idleTimer: this.idleTimer,
        noActionTimer: this.noActionTimer,
      });
    }

    updateStatuses(dt) {
      this.statuses.forEach((status) => {
        if (!Number.isFinite(status.duration)) {
          status.duration = 0;
          return;
        }
        status.duration -= dt;
        if (status.type === "poison" || status.type === "burn") {
          status.tick += dt;
          if (status.tick >= 0.5) {
            const tickDamage = (Number(status.value) || 0) * status.tick;
            if (tickDamage > 0) this.takeDamage(tickDamage, status.type);
            status.tick = 0;
          }
        }
      });
      this.statuses = this.statuses.filter((status) => status.duration > 0);
    }

    useAbility(dt) {
      const state = getState(this.context);
      const grid = getGrid(this.context);
      if (this.dead) return null;
      this.abilityTimer += dt;
      this.updateBossPhase();
      if (this.config.id === "dark_talisman_shaman" && this.state === ENEMY_STATE.ATTACKING && this.abilityTimer >= (this.config.abilityCooldown || 5.5)) {
        this.abilityTimer = 0;
        const radius = this.config.supportRadius || grid.cellW * 1.5;
        let affected = 0;
        state.enemies.forEach((enemy) => {
          if (enemy !== this && isEnemyTargetable(enemy) && call(this.context, "distance", this, enemy) <= radius) {
            enemy.addStatus("haste", this.config.hasteDuration || 2.2, this.config.hasteMultiplier || 0.25);
            affected += 1;
          }
        });
        call(this.context, "addVisualEvent", {
          type: "shaman_buff",
          x: this.x,
          y: this.y,
          radius,
          duration: 0.65,
          colorKey: "talisman",
          sourceId: this.config.id,
        });
        if (affected > 0) {
          call(this.context, "setStatus", `${this.config.name}施放幽符，催动附近妖物。`);
          this.recordAbilityAction();
          return true;
        }
        return false;
      }
      if (this.config.id === "bone_talisman_witch" && this.state === ENEMY_STATE.ATTACKING && this.abilityTimer >= (this.config.abilityCooldown || 6)) {
        this.abilityTimer = 0;
        const base = call(this.context, "getArrayCorePosition") || { x: this.x, y: getAttackLineY(this.context) + 60 };
        call(this.context, "damageArrayCore", this.config.curseDamage || 8, this);
        call(this.context, "addVisualEvent", {
          type: "curse_beam",
          fromX: this.x,
          fromY: this.y,
          toX: base.x,
          toY: base.y,
          x: base.x,
          y: base.y,
          radius: 46,
          duration: 0.65,
          colorKey: "curse",
          sourceId: this.config.id,
        });
        call(this.context, "setStatus", `${this.config.name}施放骨符蚀阵，远程侵蚀阵眼。`);
        this.recordAbilityAction();
        return true;
      }
      if (this.config.id === "redmane_demon_general" && this.abilityTimer >= (this.config.abilityCooldown || 6)) {
        this.abilityTimer = 0;
        const armorAbility = (this.abilities || []).find((ability) => ability.type === "demon_armor");
        const duration = armorAbility?.duration || this.config.armorStateDuration || 2.5;
        const reduction = armorAbility?.params?.damageReduction || this.config.damageReductionDuringArmor || 0.35;
        this.addStatus("demon_armor", duration, reduction);
        call(this.context, "addVisualEvent", {
          type: "demon_armor",
          x: this.x,
          y: this.y,
          radius: this.hitRadius + 18,
          duration,
          colorKey: "armor",
          sourceId: this.config.id,
        });
        call(this.context, "setStatus", `${this.config.name}妖甲覆身，短暂减伤。`);
        this.recordAbilityAction();
        return true;
      }
      if (this.config.id === "black_gate_guardian" && this.abilityTimer >= (this.config.abilityCooldown || 6.5)) {
        this.abilityTimer = 0;
        const armorAbility = (this.abilities || []).find((ability) => ability.type === "demon_armor");
        const roarAbility = (this.abilities || []).find((ability) => ability.type === "battle_roar");
        const duration = armorAbility?.duration || this.config.armorStateDuration || 2.5;
        const reduction = armorAbility?.params?.damageReduction || this.config.damageReductionDuringArmor || 0.3;
        const radius = this.config.supportRadius || grid.cellW * 1.6;
        this.addStatus("demon_armor", duration, reduction);
        state.enemies.forEach((enemy) => {
          if (enemy !== this && isEnemyTargetable(enemy) && call(this.context, "distance", this, enemy) <= radius) {
            enemy.addStatus("haste", roarAbility?.duration || this.config.hasteDuration || 2.0, this.config.hasteMultiplier || 0.18);
          }
        });
        call(this.context, "addVisualEvent", {
          type: "demon_armor",
          x: this.x,
          y: this.y,
          radius: this.hitRadius + 24,
          duration,
          colorKey: "armor",
          sourceId: this.config.id,
        });
        call(this.context, "addVisualEvent", {
          type: "battle_roar",
          x: this.x,
          y: this.y,
          radius,
          duration: 0.75,
          colorKey: "demon",
          sourceId: this.config.id,
        });
        call(this.context, "setStatus", `${this.config.name}妖甲震吼，护体并催动附近妖物。`);
        this.recordAbilityAction();
        return true;
      }
      if (!this.config.isBoss) return null;
      if (this.config.id === "boss_blackwind" && this.abilityTimer >= 8) {
        this.abilityTimer = 0;
        for (let i = 0; i < 3; i += 1) {
          call(this.context, "spawnEnemy", "enemy_little_yao");
        }
        call(this.context, "setStatus", "黑风妖将召来山野小妖。");
        this.recordAbilityAction();
        return true;
      }
      if (this.config.id === "boss_bloodlotus" && this.abilityTimer >= 10) {
        this.abilityTimer = 0;
        state.enemies.forEach((enemy) => {
          if (isEnemyTargetable(enemy) && call(this.context, "distance", this, enemy) <= grid.cellW * 2) {
            enemy.hp = Math.min(enemy.maxHp, enemy.hp + 90);
          }
        });
        call(this.context, "setStatus", "血莲魔修治疗附近敌人。");
        this.recordAbilityAction();
        return true;
      }
      if (this.config.id === "boss_outer_demon" && this.abilityTimer >= 7) {
        this.abilityTimer = 0;
        call(this.context, "spawnEnemy", "enemy_swift_wolf");
        call(this.context, "spawnEnemy", "enemy_little_yao");
        this.addStatus("freeze_immune", 2, 1);
        call(this.context, "setStatus", "域外魔影召唤魔影小怪。");
        this.recordAbilityAction();
        return true;
      }
      return null;
    }

    updateBossPhase() {
      if (!this.config.isBoss || !Array.isArray(this.config.phaseThresholds)) return;
      const ratio = this.maxHp > 0 ? this.hp / this.maxHp : 1;
      const nextPhase = 1 + this.config.phaseThresholds.filter((threshold) => ratio <= threshold).length;
      if (nextPhase <= this.phase) return;
      this.phase = nextPhase;
      this.config.phase = nextPhase;
      call(this.context, "addVisualEvent", {
        type: "battle_roar",
        x: this.x,
        y: this.y,
        radius: this.hitRadius + 60,
        duration: 0.55,
        colorKey: "demon",
        sourceId: this.config.id,
      });
      call(this.context, "setStatus", `${this.config.bossBarName || this.config.name}进入第 ${nextPhase} 阶段。`);
    }
  }

  function createEnemy({ enemyId, context }) {
    return new Enemy(enemyId, context);
  }

  function updateEnemies({ enemies, deltaTime }) {
    const dt = Math.min(Math.max(Number(deltaTime) || 0, 0), 0.12);
    enemies.forEach((enemy) => enemy.update(dt));
  }

  Object.assign(window.XM.Enemies, {
    Enemy,
    createEnemy,
    isEnemyAlive,
    isEnemyTargetable,
    updateEnemies,
  });
})();
