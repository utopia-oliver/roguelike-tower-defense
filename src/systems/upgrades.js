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

  const MOJIBAKE_PATTERNS = [
    "\uFFFD",
    "\u00C3",
    "\u00C2",
    "\u00E6",
    "\u00E7",
    "\u00E5",
    "\u00E8",
    "\u00E9",
    "\u00E4",
    "\u00EF\u00BF\u00BD",
    "\u5BB8",
    "\u58A4",
    "\u6D7C",
    "\u5A67",
    "\u705E",
    "\u9350",
    "\u7EFE",
    "\u7ED7",
    "\u5A09",
    "\u6097",
    "\u940F",
    "\u741A",
    "\u9286",
    "\u95C8",
    "\u59E3",
    "\u8930",
    "\u7EC2",
    "\u6984",
    "\u7176",
  ];

  function detectMojibakeInPerks(choices = []) {
    const bad = new RegExp(MOJIBAKE_PATTERNS.join("|"));
    const badChoices = choices.filter((perk) => {
      try {
        return bad.test(JSON.stringify(perk));
      } catch (error) {
        return false;
      }
    });
    if (badChoices.length) {
      console.warn("[Mojibake] upgrade choices contain suspicious text:", badChoices);
    }
  }

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
      case "artifact_poison_duration_add":
        return `中毒时间 +${value ?? 1}秒`;
      case "artifact_poison_damage_mult":
        return `毒伤 +${Math.round((Number(value) || 0) * 100)}%`;
      case "artifact_heal_mult":
        return `治疗 +${Math.round((Number(value) || 0) * 100)}%`;
      case "artifact_debuff_duration_add":
        return `破魔时间 +${value ?? 1}秒`;
      case "artifact_vulnerable_mult":
        return "易伤提升";
      default:
        return perk.description || "效果将在本局生效";
    }
  }

  function createMartialArtPerk({ state, art }) {
    const currentLevel = Math.max(1, Number(state.martialArtLevels[art.id]) || 1);
    const runtime = state.martialArtBranches?.[art.id] || {};
    const selectedUpgradeIds = new Set([
      ...(Array.isArray(runtime.selectedUpgradeIds) ? runtime.selectedUpgradeIds : []),
      ...(Array.isArray(runtime.evolvedUpgradeIds) ? runtime.evolvedUpgradeIds : []),
    ]);
    const next = currentLevel >= art.maxLevel
      ? (art.evolvedUpgrades || []).find((upgrade) => !selectedUpgradeIds.has(upgrade.id))
      : art.levels.find((level) => level.level === currentLevel + 1);
    if (!next) return null;
    const isEvolvedUpgrade = currentLevel >= art.maxLevel;
    const upgradeType = isEvolvedUpgrade ? "evolved_upgrade" : next.upgradeType || (next.evolutionType === "minor_evolution"
      ? "minor_evolution"
      : next.evolutionType === "major_evolution"
        ? "major_evolution"
        : "refine_upgrade");
    const levelEffectType = next.effectType || "";
    return {
      id: `martial_${art.id}_${next.id || next.level}`,
      name: `${art.name}·${next.title}`,
      category: upgradeType === "minor_evolution" ? "先天武学·小进化" : upgradeType === "major_evolution" || upgradeType === "evolved_upgrade" ? "先天武学·大成" : "先天武学",
      rarity: upgradeType === "major_evolution" || upgradeType === "evolved_upgrade" ? "史诗" : upgradeType === "minor_evolution" ? "稀有" : "普通",
      scope: "martial_art",
      martialArtId: art.id,
      upgradeId: next.id || `level_${next.level}`,
      targetType: "martial_art",
      targetId: art.id,
      targetName: art.name,
      effectType: levelEffectType || "martial_art_upgrade",
      levelEffectType,
      categoryKey: martialCategoryKey(levelEffectType, upgradeType),
      effectField: martialEffectField(levelEffectType),
      upgradeType,
      upgradeKind: upgradeType,
      description: `${next.title}：${next.description}`,
      value: next.value,
      valueText: isEvolvedUpgrade ? "大成专属强化" : `当前Lv${currentLevel} → Lv${next.level}`,
      effect: {
        type: "martial_art_upgrade",
        martialArtId: art.id,
        upgradeId: next.id || `level_${next.level}`,
        upgradeType,
        value: next.value,
      },
    };
  }

  function createQingyaBranchPerk({ state, upgrade }) {
    const currentLevel = Math.max(1, Number(state.martialArtLevels.ma_qingya_sword) || 1);
    const art = { id: "ma_qingya_sword", name: "青崖剑诀" };
    const isMajorForm = upgrade.type === "major" || upgrade.type === "major_enhance";
    const effectInfo = qingyaUpgradeEffectInfo(upgrade);
    const upgradeType = upgrade.type === "minor"
      ? "minor_evolution"
      : upgrade.type === "major"
        ? "major_evolution"
        : upgrade.type === "major_enhance"
          ? "evolved_upgrade"
          : "branch_upgrade";
    return {
      id: `martial_branch_${upgrade.id}`,
      name: upgrade.name,
      category: upgrade.type === "minor" ? "先天武学·小成" : upgrade.type === "major" || upgrade.type === "major_enhance" ? "先天武学·大成" : "先天武学·分支",
      rarity: upgrade.type === "major" || upgrade.type === "major_enhance" ? "史诗" : upgrade.type === "minor" ? "稀有" : "普通",
      weight: upgrade.weight,
      scope: "martial_art_branch",
      upgradeKind: upgradeType,
      upgradeType,
      categoryKey: effectInfo.category,
      effectField: effectInfo.field,
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

  function qingyaUpgradeEffectInfo(upgrade = {}) {
    const effects = upgrade.effects || {};
    if (effects.giantSword) return { category: "major_evolution", field: "giantSword" };
    if (effects.giantSwordDamageMultAdd) return { category: "major_evolution_damage", field: "giantSwordDamageMult" };
    if (effects.giantSwordSplashRadiusMult) return { category: "major_evolution_splash", field: "giantSwordSplashRadius" };
    if (effects.giantSwordEliteDamageMultAdd) return { category: "major_evolution_elite", field: "giantSwordEliteDamageMult" };
    if (effects.giantSwordSpeedMult) return { category: "major_evolution_speed", field: "giantSwordSpeedMult" };
    if (effects.projectileAdd) return { category: "projectile_count", field: "projectileCount" };
    if (effects.volleyAdd) return { category: "volley_count", field: "volleyCount" };
    if (effects.pierceAdd) return { category: "pierce", field: "pierceCount" };
    if (effects.damageMult) return { category: "martial_art_damage", field: "damageMultiplier" };
    if (effects.attackIntervalMult) return { category: "attack_speed", field: "attackIntervalMultiplier" };
    return { category: upgrade.type || "martial_art_branch", field: upgrade.id || "branch" };
  }

  function martialEffectField(effectType) {
    if (effectType === "martial_art_damage_mult" || effectType === "damage_mult") return "damageMultiplier";
    if (effectType === "martial_art_projectile_count_add" || effectType === "projectile_add") return "projectileCount";
    if (effectType === "martial_art_volley_count_add") return "volleyCount";
    if (effectType === "martial_art_pierce_add" || effectType === "pierce_add") return "pierceCount";
    if (effectType === "martial_art_attack_interval_mult" || effectType === "attack_speed") return "attackIntervalMultiplier";
    if (effectType === "martial_art_area_mult" || effectType === "splash_radius") return "areaRadius";
    if (effectType === "martial_art_slow_duration_add") return "slowDuration";
    if (effectType === "martial_art_poison_duration_add" || effectType === "poison_duration") return "poisonDuration";
    if (effectType === "martial_art_poison_damage_mult" || effectType === "dot_mult") return "poisonDamage";
    if (effectType === "martial_art_chain_count_add" || effectType === "chain_add") return "chainCount";
    if (effectType === "martial_art_chain_radius_mult") return "chainRadius";
    if (effectType === "martial_art_vulnerable_mult") return "vulnerableMultiplier";
    if (effectType === "martial_art_debuff_duration_add") return "debuffDuration";
    if (effectType === "martial_art_execute_threshold_add") return "executeThreshold";
    if (effectType === "martial_art_width_mult" || effectType === "horizontal_width") return "width";
    if (effectType === "martial_art_team_damage_aura") return "teamDamageAura";
    if (effectType === "martial_art_chase_on_kill") return "chaseOnKill";
    if (effectType && (effectType.includes("major") || effectType.includes("minor"))) return "evolution";
    return effectType || "";
  }

  function martialCategoryKey(effectType, upgradeType) {
    if (upgradeType === "minor_evolution" || upgradeType === "major_evolution" || upgradeType === "evolved_upgrade") return upgradeType;
    const field = martialEffectField(effectType);
    if (field === "projectileCount") return "projectile_count";
    if (field === "volleyCount") return "volley_count";
    if (field === "pierceCount") return "pierce";
    if (field === "areaRadius") return "area";
    if (field === "chainCount") return "chain_count";
    if (field === "chainRadius") return "chain_radius";
    if (field === "width") return "width";
    if (field === "chaseOnKill") return "chase";
    if (field === "damageMultiplier" || field === "poisonDamage") return "martial_art_damage";
    if (field === "attackIntervalMultiplier") return "attack_speed";
    return field || "martial_art";
  }

  function isQingyaStructuralUpgrade(upgrade) {
    const effects = upgrade?.effects || {};
    if (upgrade?.type === "minor" || upgrade?.type === "major" || upgrade?.type === "major_enhance") return true;
    return Boolean(effects.projectileAdd || effects.volleyAdd || effects.pierceAdd);
  }

  function qingyaBranchUpgradeAvailable({ state, upgrade, helpers }) {
    const artId = "ma_qingya_sword";
    const currentLevel = Math.max(1, Number(state.martialArtLevels[artId]) || 1);
    if (getDisabledUpgradeReason(upgrade)) return false;
    if (helpers.hasMartialBranchUpgrade(artId, upgrade.id)) return false;
    if ((upgrade.requires || []).some((id) => !helpers.hasMartialBranchUpgrade(artId, id))) return false;
    if (currentLevel >= 7) return upgrade.type === "major_enhance";
    if (currentLevel === 2) return upgrade.type === "minor";
    if (currentLevel === 6) return upgrade.type === "major";
    if (upgrade.type !== "normal") return false;
    if (!isQingyaStructuralUpgrade(upgrade)) return false;

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
        const currentLevel = Math.max(1, Number(state.martialArtLevels[art.id]) || 1);
        const isMaxed = currentLevel >= art.maxLevel;
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
              upgradeKind: "evolved_upgrade",
              upgradeType: "evolved_upgrade",
              categoryKey: "major_evolution_damage",
              effectField: "giantSwordDamageMult",
              targetType: "major_evolution",
              targetId: "qingya_major_giant_sword",
              targetName: "青崖巨阙",
              effectType: "martial_art_branch_upgrade",
              description: "青崖巨阙伤害提升30%。",
              valueText: "巨剑伤害 +30%",
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
              upgradeKind: "evolved_upgrade",
              upgradeType: "evolved_upgrade",
              categoryKey: "major_evolution_splash",
              effectField: "giantSwordSplashRadius",
              targetType: "major_evolution",
              targetId: "qingya_major_giant_sword",
              targetName: "青崖巨阙",
              effectType: "martial_art_branch_upgrade",
              description: "青崖巨阙溅射范围提升25%。",
              valueText: "巨剑溅射 +25%",
              effect: { type: "martial_art_branch_upgrade", martialArtId: art.id, upgradeId: "qingya_giant_splash" },
            },
          ];
        }
        const refinePerks = [
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
            upgradeKind: "refine_upgrade",
            upgradeType: "refine_upgrade",
            categoryKey: "martial_art_damage",
            effectField: "damageMultiplier",
            description: `${art.name}伤害提升25%。`,
            valueText: "伤害 +25%",
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
            upgradeKind: "refine_upgrade",
            upgradeType: "refine_upgrade",
            categoryKey: "attack_speed",
            effectField: "attackIntervalMultiplier",
            description: `${art.name}攻击间隔降低12%。`,
            valueText: "攻击间隔 -12%",
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
            upgradeKind: "refine_upgrade",
            upgradeType: "refine_upgrade",
            categoryKey: "pierce",
            effectField: "pierceCount",
            description: `${art.name}穿透提升1。`,
            valueText: "穿透 +1",
            effect: { type: "martial_art_pierce_bonus", martialArtId: art.id, value: 1 },
          },
        ];
        return art.id === "ma_qingya_sword"
          ? refinePerks.filter((perk) => perk.effectField !== "pierceCount")
          : refinePerks;
      })
      .filter(Boolean);
  }

  function currentTrajectoryPerks() {
    return [];
  }

  const ARTIFACT_EVOLUTION_DEFS = {
    qingming_sword_box: {
      minor: ["剑匣初开", "每次触发额外释放一口副剑，副剑伤害为主剑50%。"],
      major: ["万剑归宗", "触发时释放一轮剑雨，向多个敌人发射大量飞剑。"],
      evolved: [
        ["evolved_damage", "万剑归宗·剑雨增锋", "剑雨伤害提升。", "artifact_damage_mult", 0.25],
        ["evolved_projectile", "万剑归宗·剑影无尽", "剑雨飞剑数量提升。", "artifact_projectile_count_add", 2],
        ["evolved_pierce", "万剑归宗·破妖万刃", "剑雨穿透提升。", "artifact_pierce_add", 1],
      ],
    },
    lihuo_gourd: {
      minor: ["余火不灭", "爆裂后留下短暂火焰区域，持续造成小额伤害。"],
      major: ["焚天火海", "在敌人密集区域连续降下多次大范围离火爆裂。"],
      evolved: [
        ["evolved_area", "焚天火海·火势滔天", "焚天火海范围提升。", "artifact_area_mult", 1.2],
        ["evolved_damage", "焚天火海·赤焰灼魂", "焚天火海伤害提升。", "artifact_damage_mult", 0.25],
        ["evolved_duration", "焚天火海·余火连绵", "持续火焰区域时间提升。", "artifact_slow_duration_add", 0.8],
      ],
    },
    zhenmo_bell: {
      minor: ["镇魂定魄", "被镇魔铃影响的敌人短时间内攻击阵眼伤害进一步降低。"],
      major: ["万魔失声", "周期性大范围震慑敌人，使敌人大幅易伤并降低攻击阵眼伤害。"],
      evolved: [
        ["evolved_damage", "万魔失声·破魔加深", "破魔易伤提升。", "artifact_vulnerable_mult", 0.08],
        ["evolved_duration", "万魔失声·镇魄延长", "破魔持续时间提升。", "artifact_debuff_duration_add", 0.8],
        ["evolved_area", "万魔失声·铃音万里", "镇魔铃范围提升。", "artifact_area_mult", 1.2],
      ],
    },
    xuanbing_mirror: {
      minor: ["镜中寒界", "被冰缓的敌人再次受到玄冰玉镜影响时，减速效果增强。"],
      major: ["万里冰封", "大范围冰封敌人，造成伤害并强力减速或短暂冻结。"],
      evolved: [
        ["evolved_area", "万里冰封·寒界扩张", "万里冰封范围提升。", "artifact_area_mult", 1.2],
        ["evolved_duration", "万里冰封·冰封延长", "冻结和强减速时间提升。", "artifact_slow_duration_add", 0.8],
        ["evolved_damage", "万里冰封·寒伤入骨", "万里冰封伤害提升。", "artifact_damage_mult", 0.25],
      ],
    },
    leiwen_seal: {
      minor: ["雷引残妖", "雷击优先跳向低血敌人，提升补刀能力。"],
      major: ["九霄雷狱", "连续释放多道雷击，在敌群中反复跳跃。"],
      evolved: [
        ["evolved_chain", "九霄雷狱·雷数增加", "雷击次数提升。", "artifact_chain_count_add", 2],
        ["evolved_damage", "九霄雷狱·雷威加深", "雷击伤害提升。", "artifact_damage_mult", 0.25],
        ["evolved_area", "九霄雷狱·雷域扩张", "雷击连锁范围提升。", "artifact_chain_radius_mult", 1.2],
      ],
    },
    wandu_orb: {
      minor: ["百毒侵身", "中毒敌人受到的持续伤害逐渐提高。"],
      major: ["万毒蚀界", "大范围释放毒域，持续使敌人中毒并叠加毒伤。"],
      evolved: [
        ["evolved_area", "万毒蚀界·毒域扩张", "毒域范围提升。", "artifact_area_mult", 1.2],
        ["evolved_damage", "万毒蚀界·毒息加深", "毒伤提升。", "artifact_poison_damage_mult", 0.25],
        ["evolved_duration", "万毒蚀界·毒留不散", "中毒持续时间提升。", "artifact_poison_duration_add", 1.2],
      ],
    },
    shanhe_seal: {
      minor: ["镇山余震", "山河印命中后产生一次小范围余震。"],
      major: ["山河镇世", "在阵眼前方落下巨大山河印，造成高额伤害并强力压制敌人。"],
      evolved: [
        ["evolved_duration", "山河镇世·镇压加深", "山河印控制时间提升。", "artifact_slow_duration_add", 0.7],
        ["evolved_damage", "山河镇世·山势加重", "山河印伤害提升。", "artifact_damage_mult", 0.25],
        ["evolved_area", "山河镇世·余震扩散", "山河印余震范围提升。", "artifact_area_mult", 1.2],
      ],
    },
    xingyun_board: {
      minor: ["星落成阵", "多颗星陨更倾向于落在敌人密集区域。"],
      major: ["周天星落", "连续召唤大量星陨覆盖战场。"],
      evolved: [
        ["evolved_chain", "周天星落·星数增加", "星陨数量提升。", "artifact_volley_count_add", 2],
        ["evolved_damage", "周天星落·星火增强", "星陨伤害提升。", "artifact_damage_mult", 0.25],
        ["evolved_area", "周天星落·星域扩张", "星陨爆裂范围提升。", "artifact_area_mult", 1.2],
      ],
    },
    guiyuan_banner: {
      minor: ["灵息护阵", "治疗阵眼时，短时间降低阵眼受到的伤害。"],
      major: ["归元大阵", "阵眼低血时自动触发一次大量恢复，并产生护阵效果。"],
      evolved: [
        ["evolved_damage", "归元大阵·回元增强", "归元灵幡治疗量提升。", "artifact_heal_mult", 0.25],
        ["evolved_duration", "归元大阵·护阵延长", "护阵时间提升。", "artifact_debuff_duration_add", 0.8],
        ["evolved_chain", "归元大阵·绝境回生", "低血时额外触发概率提升。", "artifact_volley_count_add", 1],
      ],
    },
    zhanyao_blades: {
      minor: ["追魂刃影", "飞刃击杀敌人后，额外追击附近低血敌人一次。"],
      major: ["千刃斩妖", "释放大量飞刃追击多个敌人，优先清理残血目标。"],
      evolved: [
        ["evolved_projectile", "千刃斩妖·刃数增加", "飞刃数量提升。", "artifact_projectile_count_add", 2],
        ["evolved_damage", "千刃斩妖·锋芒加深", "飞刃伤害提升。", "artifact_damage_mult", 0.25],
        ["evolved_chain", "千刃斩妖·追魂更疾", "追击次数提升。", "artifact_volley_count_add", 1],
      ],
    },
  };

  function getArtifactRunState(state, artifactId) {
    const runtime = state.artifactRuntime?.[artifactId] || {};
    return {
      artifactId,
      level: Math.max(1, Math.min(7, Number(runtime.level) || 1)),
      selectedUpgradeIds: Array.isArray(runtime.selectedUpgradeIds) ? runtime.selectedUpgradeIds : [],
      minorEvolutionSelected: Boolean(runtime.minorEvolutionSelected),
      majorEvolutionSelected: Boolean(runtime.majorEvolutionSelected),
    };
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
      zhenmo_bell: [
        ["vulnerable", "魔音破甲", "镇魔铃破魔易伤效果提升。", "易伤提升", "artifact_vulnerable_mult", 0.08],
        ["debuff_duration", "镇魄余响", "镇魔铃破魔持续时间增加0.8秒。", "破魔时间 +0.8秒", "artifact_debuff_duration_add", 0.8],
        ["area", "铃音扩散", "镇魔铃影响范围提升20%。", "范围 +20%", "artifact_area_mult", 1.2],
        ["cooldown", "灵响回环", "镇魔铃冷却降低15%。", "冷却 -15%", "artifact_cooldown_mult", 0.85],
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
      wandu_orb: [
        ["area", "毒雾弥散", "万毒珠毒雾范围提升20%。", "范围 +20%", "artifact_area_mult", 1.2],
        ["poison_damage", "蚀骨毒息", "万毒珠毒伤提升25%。", "毒伤 +25%", "artifact_poison_damage_mult", 0.25],
        ["poison_duration", "毒入经脉", "万毒珠中毒持续时间增加1秒。", "中毒时间 +1秒", "artifact_poison_duration_add", 1],
        ["cooldown", "毒珠自转", "万毒珠冷却降低15%。", "冷却 -15%", "artifact_cooldown_mult", 0.85],
      ],
      shanhe_seal: [
        ["damage", "重岳压顶", "山河印伤害提升25%。", "伤害 +25%", "artifact_damage_mult", 0.25],
        ["area", "山势扩张", "山河印范围提升20%。", "范围 +20%", "artifact_area_mult", 1.2],
        ["slow_duration", "镇地余威", "山河印停顿时间增加0.5秒。", "停顿时间 +0.5秒", "artifact_slow_duration_add", 0.5],
        ["cooldown", "灵印自鸣", "山河印冷却降低15%。", "冷却 -15%", "artifact_cooldown_mult", 0.85],
      ],
      xingyun_board: [
        ["damage", "星火增辉", "星陨棋盘伤害提升25%。", "伤害 +25%", "artifact_damage_mult", 0.25],
        ["volley", "群星落子", "星陨棋盘陨星数量 +1。", "陨星数量 +1", "artifact_volley_count_add", 1],
        ["area", "星域扩张", "星陨棋盘爆裂范围提升20%。", "范围 +20%", "artifact_area_mult", 1.2],
        ["cooldown", "星机轮转", "星陨棋盘冷却降低15%。", "冷却 -15%", "artifact_cooldown_mult", 0.85],
      ],
      guiyuan_banner: [
        ["heal", "灵息回流", "归元灵幡治疗量提升25%。", "治疗 +25%", "artifact_heal_mult", 0.25],
        ["volley", "幡影护阵", "归元灵幡额外回复一次小治疗。", "额外回复 +1", "artifact_volley_count_add", 1],
        ["cooldown", "灵机不绝", "归元灵幡冷却降低15%。", "冷却 -15%", "artifact_cooldown_mult", 0.85],
        ["low_hp", "回元生息", "阵眼低血时归元灵幡治疗量额外提升。", "低血治疗提升", "artifact_heal_mult", 0.35],
      ],
      zhanyao_blades: [
        ["projectile", "刃影连发", "斩妖飞刃飞刃数量 +1。", "飞刃数量 +1", "artifact_projectile_count_add", 1],
        ["damage", "斩妖锋芒", "斩妖飞刃伤害提升25%。", "伤害 +25%", "artifact_damage_mult", 0.25],
        ["cooldown", "飞刃疾走", "斩妖飞刃冷却降低15%。", "冷却 -15%", "artifact_cooldown_mult", 0.85],
        ["execute", "追妖寻隙", "斩妖飞刃优先攻击残血敌人。", "优先残血", "artifact_vulnerable_mult", 0],
      ],
    };
    return artifactIds.flatMap((artifactId) => {
      const artifact = data.artifacts[artifactId];
      if (!artifact) return [];
      const runtime = getArtifactRunState(state, artifactId);
      const evolution = ARTIFACT_EVOLUTION_DEFS[artifactId];
      if (runtime.level >= 7 && runtime.majorEvolutionSelected) {
        return (evolution?.evolved || []).map(([key, title, description, effectType, value]) => createArtifactPerk({
          artifact,
          artifactId,
          key,
          title,
          description,
          effectType,
          value,
          runtime,
          upgradeType: "evolved_upgrade",
          category: "法宝·大成",
        }));
      }
      if (runtime.level === 6 && !runtime.majorEvolutionSelected && evolution?.major) {
        return [createArtifactEvolutionPerk({ artifact, artifactId, runtime, evolution, upgradeType: "major_evolution" })];
      }
      if (runtime.level === 2 && !runtime.minorEvolutionSelected && evolution?.minor) {
        return [createArtifactEvolutionPerk({ artifact, artifactId, runtime, evolution, upgradeType: "minor_evolution" })];
      }
      if (runtime.level >= 7) return [];
      return (definitions[artifactId] || [
        ["damage", "灵机温养", `${artifact.name}伤害提升25%。`, "伤害 +25%", "artifact_damage_mult", 0.25],
        ["cooldown", "灵机回转", `${artifact.name}冷却降低15%。`, "冷却 -15%", "artifact_cooldown_mult", 0.85],
      ]).filter(([key]) => !runtime.selectedUpgradeIds.includes(`artifact_${artifactId}_${key}`)).map(([key, title, description, valueText, effectType, value]) => createArtifactPerk({
        artifact,
        artifactId,
        key,
        title,
        description,
        valueText,
        effectType,
        value,
        runtime,
        upgradeType: artifactNormalUpgradeType(effectType),
        category: "法宝·精修",
      }));
    });
  }

  function artifactNormalUpgradeType(effectType) {
    const field = artifactEffectField(effectType);
    if (["projectileCount", "pierceCount", "areaRadius", "volleyCount", "chainCount", "chainRadius"].includes(field)) {
      return "branch_upgrade";
    }
    return "refine_upgrade";
  }

  function createArtifactPerk({ artifact, artifactId, key, title, description, valueText, effectType, value, runtime, upgradeType, category }) {
    const upgradeId = `artifact_${artifactId}_${key}`;
    const effectField = artifactEffectField(effectType);
    return {
      id: upgradeId,
      upgradeId,
      name: title.includes("·") ? title : `${artifact.name}·${title}`,
      category,
      rarity: upgradeType === "major_evolution" ? "史诗" : upgradeType === "minor_evolution" ? "稀有" : "普通",
      scope: "artifact",
      targetArtifactId: artifactId,
      targetName: artifact.name,
      targetType: "artifact",
      targetId: artifactId,
      effectType,
      upgradeType,
      upgradeKind: upgradeType,
      artifactLevel: runtime.level,
      categoryKey: artifactCategoryKey(effectType, category),
      effectField,
      description,
      valueText,
      actualEffectPreview: valueText || description,
      effect: { type: effectType, artifactId, value, upgradeId, upgradeType },
    };
  }

  function artifactEffectField(effectType) {
    if (effectType === "artifact_damage_mult" || effectType === "artifact_damage_bonus") return "damageMultiplier";
    if (effectType === "artifact_cooldown_mult") return "cooldownMultiplier";
    if (effectType === "artifact_projectile_count_add") return "projectileCount";
    if (effectType === "artifact_pierce_add") return "pierceCount";
    if (effectType === "artifact_area_mult") return "areaRadius";
    if (effectType === "artifact_volley_count_add") return "volleyCount";
    if (effectType === "artifact_slow_duration_add") return "slowDuration";
    if (effectType === "artifact_chain_count_add") return "chainCount";
    if (effectType === "artifact_chain_radius_mult") return "chainRadius";
    if (effectType === "artifact_freeze_chance_add") return "freezeChance";
    if (effectType === "artifact_poison_duration_add") return "poisonDuration";
    if (effectType === "artifact_poison_damage_mult") return "poisonDamage";
    if (effectType === "artifact_heal_mult") return "heal";
    if (effectType === "artifact_debuff_duration_add") return "debuffDuration";
    if (effectType === "artifact_vulnerable_mult") return "vulnerableMultiplier";
    if (effectType === "artifact_evolution") return "evolution";
    return effectType || "";
  }

  function artifactCategoryKey(effectType, fallback) {
    const field = artifactEffectField(effectType);
    if (field === "damageMultiplier" || field === "poisonDamage") return "artifact_damage";
    if (field === "cooldownMultiplier") return "artifact_cooldown";
    if (["projectileCount", "pierceCount", "areaRadius", "volleyCount", "chainCount", "chainRadius"].includes(field)) return "artifact_structure";
    if (["slowDuration", "freezeChance", "debuffDuration", "vulnerableMultiplier", "poisonDuration"].includes(field)) return "artifact_control";
    if (field === "heal") return "artifact_support";
    if (field === "evolution") return "artifact_evolution";
    return fallback || "artifact";
  }

  function createArtifactEvolutionPerk({ artifact, artifactId, runtime, evolution, upgradeType }) {
    const [title, description] = upgradeType === "minor_evolution" ? evolution.minor : evolution.major;
    const key = upgradeType === "minor_evolution" ? "minor_evolution" : "major_evolution";
    return createArtifactPerk({
      artifact,
      artifactId,
      key,
      title,
      description,
      effectType: "artifact_evolution",
      value: 1,
      runtime,
      upgradeType,
      category: upgradeType === "minor_evolution" ? "法宝·小成" : "法宝·大成",
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
    if (perk.upgradeType === "major_evolution" || perk.upgradeKind === "major_evolution") return 80;
    if (perk.upgradeType === "minor_evolution" || perk.upgradeKind === "minor_evolution") return 70;
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
    const levelMatch = requirement.match(/局内等级\s*>=\s*(\d+)/);
    if (levelMatch) {
      const required = Number(levelMatch[1] || 1);
      if (state.runLevel < required) return false;
    }
    const waveMatch = requirement.match(/第\s*(\d+)\s*波后/);
    if (waveMatch) {
      const requiredWave = Number(waveMatch[1] || 1);
      if (state.wave <= requiredWave) return false;
    }
    if (perk.scope === "invalid") return false;
    if (perk.scope === "martial_art_branch") {
      if (!currentRunCharacters({ state, data }).some((character) => character.id === "lu_qingya")) return false;
      const upgrade = upgrades.find((item) => item.id === perk.upgradeId);
      return Boolean(upgrade && qingyaBranchUpgradeAvailable({ ...context, upgrade }));
    }
    if (perk.scope === "martial_art") {
      const art = (data.martialArts || []).find((item) => item.id === perk.martialArtId);
      const currentLevel = Math.max(1, Number(state.martialArtLevels[art?.id]) || 1);
      const upgradeType = perk.upgradeType || perk.upgradeKind || perk.effect?.upgradeType;
      if (!art || !currentRunCharacters({ state, data }).some((character) => character.id === art.ownerCharacterId)) return false;
      if (currentLevel >= art.maxLevel) return upgradeType === "evolved_upgrade";
      if (currentLevel === 2) return upgradeType === "minor_evolution";
      if (currentLevel === 6) return upgradeType === "major_evolution";
      if (["minor_evolution", "major_evolution", "evolved_upgrade"].includes(upgradeType)) return false;
      return true;
    }
    if (perk.scope === "array_core") return true;
    if (perk.scope === "formation") {
      if (!state.selectedFormationId) return false;
      return !perk.targetFormationId || perk.targetFormationId === state.selectedFormationId;
    }
    if (perk.scope === "artifact") {
      const artifacts = selectedArtifactIds({ state });
      if (!artifacts.length) return false;
      if (!perk.targetArtifactId || !artifacts.includes(perk.targetArtifactId)) return false;
      const runtime = getArtifactRunState(state, perk.targetArtifactId);
      const upgradeType = perk.upgradeType || perk.upgradeKind || perk.effect?.upgradeType;
      if (runtime.level === 2) return upgradeType === "minor_evolution";
      if (runtime.level === 6) return upgradeType === "major_evolution";
      if (runtime.level >= 7) return upgradeType === "evolved_upgrade";
      return upgradeType !== "minor_evolution" && upgradeType !== "major_evolution" && upgradeType !== "evolved_upgrade";
    }
    const deployed = currentRunCharacters({ state, data });
    if (!deployed.length) return false;
    if (perk.scope === "character") {
      if (perk.targetCharacterId) return deployed.some((character) => character.id === perk.targetCharacterId);
      if (perk.targetSchool) return deployed.some((character) => character.school === perk.targetSchool || (character.schoolTags || []).includes(perk.targetSchool));
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
    const priority = upgradeTypePriority(perk);
    if (priority) return 10 + priority;
    if (perk.targetType === "major_evolution") return 6;
    if (perk.scope === "martial_art_branch") return 5;
    if (perk.scope === "martial_art") return 4;
    if (perk.targetCharacterId || perk.targetMartialArtId || perk.martialArtId) return 3;
    if (perk.scope === "artifact") return 3;
    if (perk.scope === "character") return 2;
    if (perk.scope === "trajectory" || perk.targetTrajectoryType || perk.targetProjectileType) return 1;
    return 0;
  }

  function upgradeTypePriority(perk) {
    const type = perk.upgradeType || perk.upgradeKind || perk.effect?.upgradeType;
    if (type === "major_evolution") return 5;
    if (type === "minor_evolution") return 4;
    if (type === "branch_upgrade") return 3;
    if (type === "evolved_upgrade") return 3;
    if (type === "refine_upgrade") return 2;
    if (type === "fallback") return 1;
    return 0;
  }

  function perkEffectKey({ perk: rawPerk, context }) {
    const perk = normalizePerk({ perk: rawPerk, context });
    const effect = perk.effect || {};
    const effectType = effect.type || perk.effectType || "none";
    const targetType = perk.targetType || perk.scope || "";
    const targetId = getPerkTargetId(perk);
    const semanticEffect = perk.effectField || effectFieldForPerk({ perk, context });
    const semanticCategory = perk.categoryKey || categoryKeyForPerk({ perk, context });
    const isMartialSemanticKey = targetType === "martial_art" || targetType === "major_evolution" || perk.scope === "martial_art" || perk.scope === "martial_art_branch";
    const fields = [`targetType:${targetType}`, `targetId:${targetId}`, `category:${semanticCategory}`, `field:${semanticEffect}`];
    ["artifactId", "martialArtId"].forEach((key) => {
      if (effect[key] !== undefined) fields.push(`${key}:${effect[key]}`);
    });
    if (perk.upgradeId && perk.scope === "martial_art_branch" && !semanticEffect) {
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
    if (perk.targetCharacterId && !isMartialSemanticKey) fields.push(`character:${perk.targetCharacterId}`);
    const normalizedType = semanticEffect ? semanticEffect : effectType;
    return `${normalizedType}|${fields.join("|")}`;
  }

  function effectFieldForPerk({ perk, context }) {
    const effect = perk.effect || {};
    const effectType = effect.type || perk.effectType || "";
    if (perk.upgradeId && perk.scope === "martial_art_branch") {
      const upgrade = context.upgrades.find((item) => item.id === perk.upgradeId);
      return qingyaUpgradeEffectInfo(upgrade).field;
    }
    if (perk.scope === "martial_art" && perk.levelEffectType) return perk.effectField || martialEffectField(perk.levelEffectType);
    if (perk.scope === "artifact") return perk.effectField || artifactEffectField(effectType);
    if (effectType === "martial_art_damage_bonus" || effectType === "martial_art_damage_mult") return "damageMultiplier";
    if (effectType === "martial_art_attack_interval_mult") return "attackIntervalMultiplier";
    if (effectType === "martial_art_pierce_bonus") return "pierceCount";
    return effectType || "";
  }

  function categoryKeyForPerk({ perk, context }) {
    const effect = perk.effect || {};
    const effectType = effect.type || perk.effectType || "";
    if (perk.upgradeId && perk.scope === "martial_art_branch") {
      const upgrade = context.upgrades.find((item) => item.id === perk.upgradeId);
      return qingyaUpgradeEffectInfo(upgrade).category;
    }
    if (perk.scope === "martial_art" && perk.levelEffectType) return perk.categoryKey || martialCategoryKey(perk.levelEffectType, perk.upgradeType || perk.upgradeKind);
    if (perk.scope === "artifact") return perk.categoryKey || artifactCategoryKey(effectType, perk.category);
    if (effectType === "martial_art_damage_bonus" || effectType === "martial_art_damage_mult") return "martial_art_damage";
    if (effectType === "martial_art_attack_interval_mult") return "attack_speed";
    if (effectType === "martial_art_pierce_bonus") return "pierce";
    return perk.categoryKey || perk.category || perk.scope || "";
  }

  function dedupePerks({ perks, context }) {
    const byKey = new Map();
    perks.forEach((perk) => {
      const normalized = normalizePerk({ perk, context });
      const key = perkEffectKey({ perk: normalized, context });
      normalized.duplicateKey = key;
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
    const evolution = pool
      .filter((perk) => ["major_evolution", "minor_evolution"].includes(perk.upgradeType || perk.upgradeKind || perk.effect?.upgradeType))
      .sort((a, b) => upgradeTypePriority(b) - upgradeTypePriority(a))[0];
    if (evolution && choices.length < count && !choices.some((choice) => perkEffectKey({ perk: choice, context }) === perkEffectKey({ perk: evolution, context }))) {
      choices.push(evolution);
      pool.splice(pool.indexOf(evolution), 1);
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
    detectMojibakeInPerks(choices);
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
    if (perk.scope === "character" && perk.targetSchool && !currentRunCharacters({ state: context.state, data: context.data }).some((role) => role.school === perk.targetSchool || (role.schoolTags || []).includes(perk.targetSchool))) return "当前阵容没有对应流派";
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
