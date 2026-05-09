(() => {
  window.XM = window.XM || {};
  window.XM.Upgrades = window.XM.Upgrades || {};

  const IN_RUN_UPGRADE_WEIGHTS = {
    projectile_count: 28,
    volley_count: 28,
    pierce: 22,
    martial_art_damage: 28,
    attack_speed: 6,
    artifact: 8,
    major_evolution_upgrade: 25,
  };

  function currentRunCharacters({ state, data }) {
    return state.deployedRoles
      .map((role) => data.roles[role.roleId])
      .filter(Boolean);
  }

  function selectedArtifactIds({ state }) {
    if (Array.isArray(state.selectedArtifactIds)) return state.selectedArtifactIds.filter(Boolean);
    return state.selectedArtifactId ? [state.selectedArtifactId] : [];
  }

  function getPerkTargetId(perk) {
    return perk.targetId || perk.martialArtId || perk.targetMartialArtId || perk.targetCharacterId || perk.targetArtifactId || perk.majorEvolutionId || "";
  }

  function hasExplicitPerkTarget(perk) {
    return Boolean(perk.targetType && getPerkTargetId(perk) && perk.targetName);
  }

  function getDisabledUpgradeReason(upgrade) {
    const effects = upgrade?.effects || {};
    const text = [upgrade?.id, upgrade?.name, upgrade?.description, upgrade?.valueText].filter(Boolean).join(" ");
    if (effects.attackLineDamageMult || /attackLine|阵前破势|压线|正在攻击阵眼/.test(text)) {
      return "压线增伤暂时从局内升级池移除。";
    }
    if (effects.giantSwordSpeedMult || effects.speedMult || effects.projectileSpeed || /projectile_speed|弹道速度|飞行速度/.test(text)) {
      return "弹道速度属于底层手感配置，不作为局内升级选项。";
    }
    return "";
  }

  function getDisabledPerkReason({ perk, upgrades }) {
    const effect = perk.effect || {};
    const effectType = effect.type || perk.effectType || "";
    const text = [perk.id, perk.name, perk.description, perk.valueText, perk.category].filter(Boolean).join(" ");
    if (["pressure_damage"].includes(effectType) || /pressure_damage|attackLine|阵前破势|压线|正在攻击阵眼/.test(text)) {
      return "压线增伤暂时从局内升级池移除。";
    }
    if (["projectile_speed"].includes(effectType) || /projectile_speed|弹道速度|飞行速度/.test(text)) {
      return "弹道速度属于底层手感配置，不作为局内升级选项。";
    }
    if (perk.scope === "martial_art_branch") {
      const upgrade = upgrades.find((item) => item.id === perk.upgradeId);
      return getDisabledUpgradeReason(upgrade);
    }
    return "";
  }

  function buildEffectPreview(perk) {
    if (perk.valueText) return perk.valueText;
    if (perk.actualEffectPreview) return perk.actualEffectPreview;

    const effect = perk.effect || {};
    const effectType = perk.effectType || effect.type;
    const value = perk.value ?? effect.value;
    switch (effectType) {
      case "artifact_damage_bonus":
      case "artifact_damage_mult":
        return `伤害 +${Math.round((Number(value) || 0) * 100)}%`;
      case "artifact_cooldown_mult":
        if (typeof value === "number") return `冷却 -${Math.round((1 - value) * 100)}%`;
        return "冷却降低";
      case "artifact_projectile_count_add":
        return `飞剑数量 +${value ?? 1}`;
      case "artifact_pierce_add":
        return `穿透 +${value ?? 1}`;
      case "artifact_area_mult":
        return `范围 +${Math.round(((Number(value) || 1) - 1) * 100)}%`;
      case "artifact_volley_count_add":
        return `额外爆裂 +${value ?? 1}`;
      case "artifact_slow_duration_add":
        return `减速时间 +${value ?? 1}秒`;
      case "artifact_chain_count_add":
        return `连锁次数 +${value ?? 1}`;
      case "artifact_chain_radius_mult":
        return `连锁范围 +${Math.round(((Number(value) || 1) - 1) * 100)}%`;
      case "artifact_freeze_chance_add":
        return `冻结概率 +${Math.round((Number(value) || 0) * 100)}%`;
      default:
        return perk.description || "效果将在本局生效";
    }
  }

  function createMartialArtPerk({ state, art }) {
    const currentLevel = state.martialArtLevels[art.id] || 0;
    const next = art.levels.find((level) => level.level === currentLevel + 1);
    if (!next) return null;
    return {
      id: `martial_${art.id}_${next.level}`,
      name: `${art.name}·${next.title}`,
      category: next.evolutionType === "minor_evolution" ? "先天武学·小进化" : next.evolutionType === "major_evolution" ? "先天武学·大进化" : "先天武学",
      rarity: next.evolutionType === "major_evolution" ? "史诗" : next.evolutionType === "minor_evolution" ? "稀有" : "普通",
      scope: "martial_art",
      martialArtId: art.id,
      targetType: "martial_art",
      targetId: art.id,
      targetName: art.name,
      effectType: "martial_art_upgrade",
      description: `${next.title}：${next.description}`,
      valueText: `当前Lv${currentLevel} → Lv${next.level}`,
      effect: { type: "martial_art_upgrade", martialArtId: art.id },
    };
  }

  function createQingyaBranchPerk({ state, upgrade }) {
    const currentLevel = state.martialArtLevels.ma_qingya_sword || 0;
    const art = { id: "ma_qingya_sword", name: "青崖剑诀" };
    const isMajorForm = upgrade.type === "major" || upgrade.type === "major_enhance";
    return {
      id: `martial_branch_${upgrade.id}`,
      name: upgrade.name,
      category: upgrade.type === "minor" ? "先天武学·小成" : upgrade.type === "major" || upgrade.type === "major_enhance" ? "先天武学·大成" : "先天武学·分支",
      rarity: upgrade.type === "major" || upgrade.type === "major_enhance" ? "史诗" : upgrade.type === "minor" ? "稀有" : "普通",
      weight: upgrade.weight,
      scope: "martial_art_branch",
      martialArtId: "ma_qingya_sword",
      upgradeId: upgrade.id,
      effectType: "martial_art_branch_upgrade",
      targetType: isMajorForm ? "major_evolution" : "martial_art",
      targetId: isMajorForm ? "qingya_major_giant_sword" : "ma_qingya_sword",
      targetName: isMajorForm ? "青崖巨阙" : art.name,
      description: upgrade.description,
      valueText: `当前Lv${currentLevel} → Lv${Math.min(7, currentLevel + 1)} · ${upgrade.valueText}`,
      effect: {
        type: "martial_art_branch_upgrade",
        martialArtId: "ma_qingya_sword",
        upgradeId: upgrade.id,
      },
    };
  }

  function qingyaBranchUpgradeAvailable({ state, upgrade, helpers }) {
    const artId = "ma_qingya_sword";
    const currentLevel = state.martialArtLevels[artId] || 0;
    if (getDisabledUpgradeReason(upgrade)) return false;
    if (helpers.hasMartialBranchUpgrade(artId, upgrade.id)) return false;
    if ((upgrade.requires || []).some((id) => !helpers.hasMartialBranchUpgrade(artId, id))) return false;
    if (currentLevel >= 7) return upgrade.type === "major_enhance";
    if (currentLevel === 2) return upgrade.type === "minor";
    if (currentLevel === 6) return upgrade.type === "major";
    if (upgrade.type !== "normal") return false;

    const nextParams = helpers.qingyaAttackParamsFromBranches(upgrade);
    if (nextParams.projectileCount > 5 || nextParams.volleyCount > 4) return false;
    if (nextParams.projectileCount * nextParams.volleyCount > 16) return false;
    return true;
  }

  function createQingyaBranchPerks(context) {
    return context.upgrades
      .filter((upgrade) => qingyaBranchUpgradeAvailable({ ...context, upgrade }))
      .map((upgrade) => createQingyaBranchPerk({ state: context.state, upgrade }));
  }

  function currentMartialArtUpgradePerks(context) {
    const { state, data, helpers } = context;
    return currentRunCharacters({ state, data }).flatMap((character) => {
      const art = helpers.martialArtForCharacter(character.id);
      if (!art) return [];
      if (art.id === "ma_qingya_sword") return createQingyaBranchPerks(context);
      if ((state.martialArtLevels[art.id] || 0) >= art.maxLevel) return [];
      const perk = createMartialArtPerk({ state, art });
      return perk ? [perk] : [];
    });
  }

  function currentTargetedMartialPerks(context) {
    const { state, data, helpers } = context;
    return currentRunCharacters({ state, data })
      .flatMap((character) => {
        const art = helpers.martialArtForCharacter(character.id);
        if (!art) return [];
        const isMaxed = (state.martialArtLevels[art.id] || 0) >= art.maxLevel;
        const isQingyaGiant = art.id === "ma_qingya_sword" && helpers.hasMartialBranchUpgrade(art.id, "qingya_major_giant_sword");
        if (isMaxed && !isQingyaGiant) return [];
        if (isQingyaGiant) {
          return [
            {
              id: "targeted_qingya_giant_damage",
              name: "青崖巨阙·剑威",
              category: "先天武学·大成",
              rarity: "普通",
              scope: "martial_art_branch",
              martialArtId: art.id,
              upgradeId: "qingya_giant_damage",
              targetType: "major_evolution",
              targetId: "qingya_major_giant_sword",
              targetName: "青崖巨阙",
              effectType: "martial_art_branch_upgrade",
              description: "青崖巨阙伤害提升30%。",
              valueText: "宸ㄥ墤浼ゅ +30%",
              effect: { type: "martial_art_branch_upgrade", martialArtId: art.id, upgradeId: "qingya_giant_damage" },
            },
            {
              id: "targeted_qingya_giant_splash",
              name: "青崖巨阙·裂山",
              category: "先天武学·大成",
              rarity: "普通",
              scope: "martial_art_branch",
              martialArtId: art.id,
              upgradeId: "qingya_giant_splash",
              targetType: "major_evolution",
              targetId: "qingya_major_giant_sword",
              targetName: "青崖巨阙",
              effectType: "martial_art_branch_upgrade",
              description: "青崖巨阙溅射范围提升25%。",
              valueText: "宸ㄥ墤婧呭皠 +25%",
              effect: { type: "martial_art_branch_upgrade", martialArtId: art.id, upgradeId: "qingya_giant_splash" },
            },
          ];
        }
        return [
          {
            id: `targeted_${art.id}_damage`,
            name: `${art.name}·剑意凝练`,
            category: "先天武学·精修",
            rarity: "普通",
            scope: "martial_art",
            martialArtId: art.id,
            targetMartialArtId: art.id,
            targetCharacterId: character.id,
            targetType: "martial_art",
            targetId: art.id,
            targetName: art.name,
            effectType: "martial_art_damage_bonus",
            description: `${art.name}伤害提升25%。`,
            valueText: "浼ゅ +25%",
            effect: { type: "martial_art_damage_bonus", martialArtId: art.id, value: 0.25 },
          },
          {
            id: `targeted_${art.id}_speed`,
            name: `${art.name}·行气如风`,
            category: "先天武学·精修",
            rarity: "普通",
            scope: "martial_art",
            martialArtId: art.id,
            targetMartialArtId: art.id,
            targetCharacterId: character.id,
            targetType: "martial_art",
            targetId: art.id,
            targetName: art.name,
            effectType: "martial_art_attack_interval_mult",
            description: `${art.name}攻击间隔降低12%。`,
            valueText: "鏀诲嚮闂撮殧 -12%",
            effect: { type: "martial_art_attack_interval_mult", martialArtId: art.id, value: 0.88 },
          },
          {
            id: `targeted_${art.id}_pierce`,
            name: `${art.name}·破妖入骨`,
            category: "先天武学·精修",
            rarity: "普通",
            scope: "martial_art",
            martialArtId: art.id,
            targetMartialArtId: art.id,
            targetCharacterId: character.id,
            targetType: "martial_art",
            targetId: art.id,
            targetName: art.name,
            effectType: "martial_art_pierce_bonus",
            description: `${art.name}穿透提升1。`,
            valueText: "穿透 +1",
            effect: { type: "martial_art_pierce_bonus", martialArtId: art.id, value: 1 },
          },
        ];
      })
      .filter(Boolean);
  }

  function currentTrajectoryPerks() {
    return [];
  }

  function artifactPerksForRun({ state, data }) {
    const artifactIds = selectedArtifactIds({ state });
    if (!artifactIds.length) return [];
    const definitions = {
      qingming_sword_box: [
        ["damage", "开匣锋鸣", "青冥剑匣伤害提升25%。", "伤害 +25%", "artifact_damage_mult", 0.25],
        ["projectile", "剑影连发", "青冥剑匣每次触发额外释放1道飞剑。", "飞剑数量 +1", "artifact_projectile_count_add", 1],
        ["pierce", "剑势贯妖", "青冥剑匣飞剑穿透 +1。", "穿透 +1", "artifact_pierce_add", 1],
        ["cooldown", "灵机回转", "青冥剑匣冷却降低15%。", "冷却 -15%", "artifact_cooldown_mult", 0.85],
      ],
      lihuo_gourd: [
        ["damage", "离火增炽", "离火葫芦伤害提升25%。", "伤害 +25%", "artifact_damage_mult", 0.25],
        ["area", "火势蔓延", "离火葫芦爆裂范围提升20%。", "范围 +20%", "artifact_area_mult", 1.2],
        ["volley", "连珠火落", "离火葫芦额外爆裂1次。", "额外爆裂 +1", "artifact_volley_count_add", 1],
        ["cooldown", "灵火自生", "离火葫芦冷却降低15%。", "冷却 -15%", "artifact_cooldown_mult", 0.85],
      ],
      zhenyao_bell: [
        ["slow_duration", "镇魂余响", "镇妖铃减速持续时间增加0.8秒。", "减速时间 +0.8秒", "artifact_slow_duration_add", 0.8],
        ["damage", "铃音震魄", "镇妖铃伤害提升25%。", "伤害 +25%", "artifact_damage_mult", 0.25],
        ["area", "摄妖清音", "镇妖铃影响范围提升20%。", "范围 +20%", "artifact_area_mult", 1.2],
        ["cooldown", "灵响回环", "镇妖铃冷却降低15%。", "冷却 -15%", "artifact_cooldown_mult", 0.85],
      ],
      xuanbing_mirror: [
        ["damage", "寒镜凝霜", "玄冰玉镜伤害提升25%。", "伤害 +25%", "artifact_damage_mult", 0.25],
        ["area", "冰华扩散", "玄冰玉镜范围提升20%。", "范围 +20%", "artifact_area_mult", 1.2],
        ["slow_duration", "寒意入骨", "玄冰玉镜减速持续时间增加0.8秒。", "减速时间 +0.8秒", "artifact_slow_duration_add", 0.8],
        ["freeze", "霜封一瞬", "玄冰玉镜冻结概率提升10%。", "冻结概率 +10%", "artifact_freeze_chance_add", 0.1],
      ],
      leiwen_seal: [
        ["damage", "雷火增鸣", "雷纹法印伤害提升25%。", "伤害 +25%", "artifact_damage_mult", 0.25],
        ["chain", "雷走群妖", "雷纹法印连锁次数 +1。", "连锁次数 +1", "artifact_chain_count_add", 1],
        ["chain_radius", "引雷入阵", "雷纹法印连锁范围提升20%。", "连锁范围 +20%", "artifact_chain_radius_mult", 1.2],
        ["cooldown", "灵雷自转", "雷纹法印冷却降低15%。", "冷却 -15%", "artifact_cooldown_mult", 0.85],
      ],
    };
    return artifactIds.flatMap((artifactId) => {
      const artifact = data.artifacts[artifactId];
      if (!artifact) return [];
      return (definitions[artifactId] || [
        ["damage", "灵机温养", `${artifact.name}伤害提升25%。`, "伤害 +25%", "artifact_damage_mult", 0.25],
        ["cooldown", "灵机回转", `${artifact.name}冷却降低15%。`, "冷却 -15%", "artifact_cooldown_mult", 0.85],
      ]).map(([key, title, description, valueText, effectType, value]) => ({
        id: `artifact_${artifactId}_${key}`,
        name: `${artifact.name}·${title}`,
        category: "法宝·精修",
        rarity: "普通",
        scope: "artifact",
        targetArtifactId: artifactId,
        targetName: artifact.name,
        targetType: "artifact",
        targetId: artifactId,
        effectType,
        description,
        valueText,
        actualEffectPreview: valueText,
        effect: { type: effectType, artifactId, value },
      }));
    });
  }

  function defensivePerksForRun({ state }) {
    const hpRatio = state.arrayCoreMaxHp > 0 ? state.arrayCoreHp / state.arrayCoreMaxHp : 1;
    if (hpRatio > 0.6) return [];
    const heal = {
      id: "array_heal_holy_light",
      name: "灵泉回涌",
      category: "阵眼回复",
      rarity: hpRatio < 0.35 ? "稀有" : "普通",
      scope: "array_core",
      targetType: "array_recover",
      targetId: "array_core",
      targetName: "护山阵眼",
      effectType: "array_heal",
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

  function normalizePerk({ perk, context }) {
    if (!perk) return { scope: "invalid", effectType: "unimplemented" };
    const { state, debugOverrides, helpers } = context;
    const perkOverride = debugOverrides.perks?.[perk.id];
    if (perkOverride) perk = helpers.mergeObject({ ...perk }, helpers.deepClone(perkOverride));
    if (perk.scope) {
      const normalized = { ...perk, effectType: perk.effect?.type || perk.effectType || "unimplemented" };
      normalized.targetId = getPerkTargetId(normalized);
      if (!normalized.targetType) normalized.targetType = normalized.scope;
      normalized.actualEffectPreview = buildEffectPreview(normalized);
      return normalized;
    }
    let effectType = perk.effect?.type || perk.effectType || "unimplemented";
    const normalized = { ...perk, effectType };
    const id = perk.id || "";
    const target = `${perk.target || ""} ${perk.requirement || ""}`;
    if (id === "perk_artifact_damage" && effectType === "unimplemented") {
      const artifactId = selectedArtifactIds({ state })[0] || "";
      normalized.targetArtifactId = artifactId;
      normalized.effect = { type: "artifact_damage_bonus", artifactId, value: 0.25 };
      effectType = "artifact_damage_bonus";
      normalized.effectType = effectType;
    }
    if (id === "perk_artifact_cooldown" && effectType === "unimplemented") {
      const artifactId = selectedArtifactIds({ state })[0] || "";
      normalized.targetArtifactId = artifactId;
      normalized.effect = { type: "artifact_cooldown_mult", artifactId, value: 0.8 };
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
    } else if (effectType.startsWith("martial_art_")) {
      normalized.scope = "martial_art";
      normalized.martialArtId = normalized.effect?.martialArtId || normalized.martialArtId;
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
    normalized.actualEffectPreview = buildEffectPreview(normalized);
    return normalized;
  }

  function hasForbiddenGenericText(perk) {
    const text = [perk.name, perk.description, perk.valueText, perk.category].filter(Boolean).join(" ");
    return [
      "全体角色",
      "全体法宝",
      "所有角色",
      "所有法宝",
      "全体单位",
      "全局伤害",
      "全局攻速",
      "通用角色强化",
      "通用法宝强化",
      "当前主修武学",
      "单体弹道",
    ].some((word) => text.includes(word));
  }

  function perkUpgradeWeight({ perk: rawPerk, context }) {
    const perk = normalizePerk({ perk: rawPerk, context });
    if (Number.isFinite(Number(perk.weight))) return Number(perk.weight);
    if (perk.scope === "artifact") return IN_RUN_UPGRADE_WEIGHTS.artifact;
    if (perk.targetType === "major_evolution" || perk.scope === "martial_art_branch") {
      const upgrade = context.upgrades.find((item) => item.id === perk.upgradeId);
      const effects = upgrade?.effects || {};
      if (upgrade?.type === "major_enhance") return IN_RUN_UPGRADE_WEIGHTS.major_evolution_upgrade;
      if (effects.projectileAdd) return IN_RUN_UPGRADE_WEIGHTS.projectile_count;
      if (effects.volleyAdd) return IN_RUN_UPGRADE_WEIGHTS.volley_count;
      if (effects.pierceAdd) return IN_RUN_UPGRADE_WEIGHTS.pierce;
      if (effects.damageMult || effects.giantSwordDamageMultAdd) return IN_RUN_UPGRADE_WEIGHTS.martial_art_damage;
      if (effects.attackIntervalMult) return IN_RUN_UPGRADE_WEIGHTS.attack_speed;
    }
    const effectType = perk.effect?.type || perk.effectType;
    if (effectType === "martial_art_pierce_bonus") return IN_RUN_UPGRADE_WEIGHTS.pierce;
    if (effectType === "martial_art_attack_interval_mult") return IN_RUN_UPGRADE_WEIGHTS.attack_speed;
    if (effectType === "martial_art_damage_bonus") return IN_RUN_UPGRADE_WEIGHTS.martial_art_damage;
    return context.rarityWeight[perk.rarity] || 12;
  }

  function isPerkValidForCurrentRun({ perk: rawPerk, context }) {
    const { state, data, helpers, upgrades } = context;
    const perk = normalizePerk({ perk: rawPerk, context });
    const effectType = perk.effect?.type || perk.effectType;
    if (perk.enabled === false) return false;
    if (getDisabledPerkReason({ perk, upgrades })) return false;
    if (hasForbiddenGenericText(perk)) return false;
    if (["array_defense_bonus", "defense_bonus"].includes(effectType)) return false;
    if (perk.scope === "global") return false;
    if (!hasExplicitPerkTarget(perk)) return false;
    if (perk.stackable === false && state.acquiredPerks.has(perk.id)) return false;
    const requirement = String(perk.requirement || "");
    if (requirement.includes("灞€鍐呯瓑绾?=")) {
      const required = Number(requirement.match(/\d+/)?.[0] || 1);
      if (state.runLevel < required) return false;
    }
    if (requirement.includes("绗?娉㈠悗") && state.wave <= 5) return false;
    if (perk.scope === "invalid") return false;
    if (perk.scope === "martial_art_branch") {
      if (!currentRunCharacters({ state, data }).some((character) => character.id === "lu_qingya")) return false;
      const upgrade = upgrades.find((item) => item.id === perk.upgradeId);
      return Boolean(upgrade && qingyaBranchUpgradeAvailable({ ...context, upgrade }));
    }
    if (perk.scope === "martial_art") {
      const art = (data.martialArts || []).find((item) => item.id === perk.martialArtId);
      return Boolean(art && currentRunCharacters({ state, data }).some((character) => character.id === art.ownerCharacterId) && (state.martialArtLevels[art.id] || 0) < art.maxLevel);
    }
    if (perk.scope === "array_core") return true;
    if (perk.scope === "formation") {
      if (!state.selectedFormationId) return false;
      return !perk.targetFormationId || perk.targetFormationId === state.selectedFormationId;
    }
    if (perk.scope === "artifact") {
      const artifacts = selectedArtifactIds({ state });
      if (!artifacts.length) return false;
      return Boolean(perk.targetArtifactId && artifacts.includes(perk.targetArtifactId));
    }
    const deployed = currentRunCharacters({ state, data });
    if (!deployed.length) return false;
    if (perk.scope === "character") {
      if (perk.targetCharacterId) return deployed.some((character) => character.id === perk.targetCharacterId);
      if (perk.targetSchool) return deployed.some((character) => character.school === perk.targetSchool);
      if (perk.targetRarity) return deployed.some((character) => character.rarity === perk.targetRarity);
      if (perk.targetTrajectoryType) return deployed.some((character) => character.trajectoryType === perk.targetTrajectoryType);
      if (perk.requiresPassiveSkill) return deployed.some((character) => Boolean(character.passiveSkill));
      return Boolean(perk.targetCharacterId);
    }
    if (perk.scope === "trajectory") {
      return false;
    }
    return false;
  }

  function fillWithGenericPerks({ choices, count, context }) {
    currentTargetedMartialPerks(context).forEach((perk) => {
      if (choices.length >= count) return;
      if (!choices.some((choice) => choice.id === perk.id || perkEffectKey({ perk: choice, context }) === perkEffectKey({ perk, context })) && isPerkValidForCurrentRun({ perk, context })) {
        choices.push(perk);
      }
    });
  }

  function perkSpecificity(perk) {
    if (perk.targetType === "major_evolution") return 6;
    if (perk.scope === "martial_art_branch") return 5;
    if (perk.scope === "martial_art") return 4;
    if (perk.targetCharacterId || perk.targetMartialArtId || perk.martialArtId) return 3;
    if (perk.scope === "artifact") return 3;
    if (perk.scope === "character") return 2;
    if (perk.scope === "trajectory" || perk.targetTrajectoryType || perk.targetProjectileType) return 1;
    return 0;
  }

  function perkEffectKey({ perk: rawPerk, context }) {
    const perk = normalizePerk({ perk: rawPerk, context });
    const effect = perk.effect || {};
    const effectType = effect.type || perk.effectType || "none";
    const fields = [`targetType:${perk.targetType || perk.scope || ""}`, `targetId:${getPerkTargetId(perk)}`];
    ["value", "chance", "mult", "artifactId", "martialArtId"].forEach((key) => {
      if (effect[key] !== undefined) fields.push(`${key}:${effect[key]}`);
    });
    if (perk.upgradeId) {
      const upgrade = context.upgrades.find((item) => item.id === perk.upgradeId);
      const upgradeFields = Object.entries(upgrade?.effects || {})
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}:${value}`)
        .join(",");
      fields.push(`upgradeFields:${upgradeFields || perk.upgradeId}`);
    }
    if (perk.martialArtId || perk.targetMartialArtId) fields.push(`art:${perk.martialArtId || perk.targetMartialArtId}`);
    if (perk.targetProjectileType) fields.push(`projectile:${perk.targetProjectileType}`);
    if (perk.targetTrajectoryType) fields.push(`trajectory:${perk.targetTrajectoryType}`);
    if (perk.targetCharacterId) fields.push(`character:${perk.targetCharacterId}`);
    return `${effectType}|${fields.join("|")}`;
  }

  function dedupePerks({ perks, context }) {
    const byKey = new Map();
    perks.forEach((perk) => {
      const normalized = normalizePerk({ perk, context });
      const key = perkEffectKey({ perk: normalized, context });
      const existing = byKey.get(key);
      if (!existing || perkSpecificity(normalized) > perkSpecificity(existing)) {
        byKey.set(key, normalized);
      }
    });
    return [...byKey.values()];
  }

  function drawPerksFiltered({ context, count }) {
    const martialPool = dedupePerks({
      perks: currentMartialArtUpgradePerks(context)
        .map((perk) => normalizePerk({ perk, context }))
        .filter((perk) => isPerkValidForCurrentRun({ perk, context })),
      context,
    });
    const supportPool = [
      ...artifactPerksForRun(context),
      ...defensivePerksForRun(context),
      ...currentTargetedMartialPerks(context),
    ]
      .map((perk) => normalizePerk({ perk, context }))
      .filter((perk) => isPerkValidForCurrentRun({ perk, context }));
    const pool = dedupePerks({ perks: [...martialPool, ...martialPool, ...martialPool, ...supportPool], context });
    const choices = [];
    const forcedHeal = defensivePerksForRun(context)[0];
    const normalizedHeal = forcedHeal ? normalizePerk({ perk: forcedHeal, context }) : null;
    if (normalizedHeal && isPerkValidForCurrentRun({ perk: normalizedHeal, context }) && context.state.arrayCoreMaxHp > 0 && context.state.arrayCoreHp / context.state.arrayCoreMaxHp < 0.2) {
      choices.push(normalizedHeal);
    }
    while (choices.length < count && pool.length) {
      const total = pool.reduce((sum, perk) => sum + perkUpgradeWeight({ perk, context }), 0);
      let roll = Math.random() * total;
      const selected = pool.find((perk) => {
        roll -= perkUpgradeWeight({ perk, context });
        return roll <= 0;
      }) || pool[pool.length - 1];
      if (!choices.some((choice) => choice.id === selected.id || perkEffectKey({ perk: choice, context }) === perkEffectKey({ perk: selected, context }))) choices.push(selected);
      pool.splice(pool.indexOf(selected), 1);
    }
    if (choices.length < count) fillWithGenericPerks({ choices, count, context });
    return choices;
  }

  function drawPerks({ context, count }) {
    return drawPerksFiltered({ context, count });
  }

  function getQingyaUpgradeInvalidReason({ state, upgrade, helpers }) {
    const level = state.martialArtLevels.ma_qingya_sword || 0;
    const disabledReason = getDisabledUpgradeReason(upgrade);
    if (disabledReason) return disabledReason;
    if (helpers.hasMartialBranchUpgrade("ma_qingya_sword", upgrade.id)) return "已选择";
    const missing = (upgrade.requires || []).filter((id) => !helpers.hasMartialBranchUpgrade("ma_qingya_sword", id));
    if (missing.length) return `缺少前置：${missing.join(", ")}`;
    if (level >= 7 && upgrade.type !== "major_enhance") return "Lv7后只允许大成专属强化";
    if (level === 2 && upgrade.type !== "minor") return "Lv3小成时只显示小成候选";
    if (level === 6 && upgrade.type !== "major") return "Lv7大成时只显示大成候选";
    if (level < 7 && upgrade.type === "major_enhance") return "需要青崖巨阙大成";
    if (upgrade.type !== "normal" && ![2, 6].includes(level) && level < 7) return "当前等级不匹配";
    const params = helpers.qingyaAttackParamsFromBranches(upgrade);
    if (params.projectileCount * params.volleyCount > 16) return "totalProjectiles超过软上限";
    return qingyaBranchUpgradeAvailable({ state, upgrade, helpers }) ? "" : "不可选";
  }

  function getPerkInvalidReason({ perk, context }) {
    const effectType = perk.effect?.type || perk.effectType;
    if (perk.enabled === false) return "已在调试表禁用";
    const disabledReason = getDisabledPerkReason({ perk, upgrades: context.upgrades });
    if (disabledReason) return disabledReason;
    if (hasForbiddenGenericText(perk)) return "包含泛化升级文案";
    if (["array_defense_bonus", "defense_bonus"].includes(effectType)) return "局内防御机缘已禁用";
    if (perk.scope === "global") return "普通三选一禁用无目标全局强化";
    if (!hasExplicitPerkTarget(perk)) return "缺少明确targetType/targetId/targetName";
    if (perk.scope === "martial_art_branch") {
      const upgrade = context.upgrades.find((item) => item.id === perk.upgradeId);
      return upgrade ? getQingyaUpgradeInvalidReason({ state: context.state, upgrade, helpers: context.helpers }) : "找不到武学节点";
    }
    if (perk.scope === "artifact" && !selectedArtifactIds({ state: context.state }).length) return "本局未携带法宝";
    if (perk.scope === "artifact" && !selectedArtifactIds({ state: context.state }).includes(perk.targetArtifactId)) return "目标法宝未携带";
    if (perk.scope === "trajectory") return "泛化弹道升级已禁用";
    if (perk.scope === "character" && perk.targetSchool && !currentRunCharacters({ state: context.state, data: context.data }).some((role) => role.school === perk.targetSchool)) return "当前阵容没有对应流派";
    return "过滤条件不满足";
  }

  Object.assign(window.XM.Upgrades, {
    artifactPerksForRun,
    buildEffectPreview,
    createMartialArtPerk,
    createQingyaBranchPerk,
    createQingyaBranchPerks,
    currentMartialArtUpgradePerks,
    currentRunCharacters,
    currentTargetedMartialPerks,
    currentTrajectoryPerks,
    dedupePerks,
    defensivePerksForRun,
    drawPerks,
    drawPerksFiltered,
    fillWithGenericPerks,
    getDisabledPerkReason,
    getDisabledUpgradeReason,
    getPerkInvalidReason,
    getPerkTargetId,
    getQingyaUpgradeInvalidReason,
    hasExplicitPerkTarget,
    hasForbiddenGenericText,
    isPerkValidForCurrentRun,
    normalizePerk,
    perkEffectKey,
    perkSpecificity,
    perkUpgradeWeight,
    qingyaBranchUpgradeAvailable,
    selectedArtifactIds,
  });
})();
