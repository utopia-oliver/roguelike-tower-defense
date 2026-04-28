window.GAME_DATA = {
  "sourceWorkbook": "守山门_新版角色肉鸽塔防_Codex开发表.xlsx",
  "config": {
    "columns": 5,
    "rows": 6,
    "deployRows": [
      5
    ],
    "maxWaves": 15,
    "baseHp": 20,
    "rosterSlots": 3
  },
  "playerMeta": [
    {
      "字段ID": "player_id",
      "中文名": "玩家ID",
      "类型": "string",
      "初始值": "auto",
      "成长/解锁规则": "创建账号时生成",
      "用途": "保存局外数据",
      "存储Key": "meta.playerId"
    },
    {
      "字段ID": "account_level",
      "中文名": "玩家等级/修为",
      "类型": "int",
      "初始值": 1,
      "成长/解锁规则": "通过局外账号经验升级",
      "用途": "解锁角色、阵法、法宝、上阵槽",
      "存储Key": "meta.accountLevel"
    },
    {
      "字段ID": "account_exp",
      "中文名": "账号经验",
      "类型": "int",
      "初始值": 0,
      "成长/解锁规则": "每局结算根据最高波次和胜负获得",
      "用途": "推动玩家等级提升",
      "存储Key": "meta.accountExp"
    },
    {
      "字段ID": "lingstone",
      "中文名": "灵石",
      "类型": "int",
      "初始值": 0,
      "成长/解锁规则": "每局结算获得，不在局内产出/消费",
      "用途": "升级角色基础属性、抽卡",
      "存储Key": "meta.lingstone"
    },
    {
      "字段ID": "base_hp",
      "中文名": "阵眼基础生命",
      "类型": "int",
      "初始值": 20,
      "成长/解锁规则": "局外可用灵石升级，每级+1",
      "用途": "战斗血条",
      "存储Key": "meta.baseHp"
    },
    {
      "字段ID": "base_damage_bonus",
      "中文名": "全角色攻击加成",
      "类型": "float",
      "初始值": 0,
      "成长/解锁规则": "局外修为/建筑后续可提升，MVP可暂不开放",
      "用途": "影响所有角色基础伤害",
      "存储Key": "meta.baseDamageBonus"
    },
    {
      "字段ID": "base_attack_speed_bonus",
      "中文名": "全角色攻速加成",
      "类型": "float",
      "初始值": 0,
      "成长/解锁规则": "局外修为/法门后续可提升，MVP可暂不开放",
      "用途": "影响所有角色攻速",
      "存储Key": "meta.baseAtkSpeedBonus"
    },
    {
      "字段ID": "roster_slots",
      "中文名": "上阵角色槽位",
      "类型": "int",
      "初始值": 3,
      "成长/解锁规则": "账号等级1=3；5=4；10=5",
      "用途": "开局可选择参战角色数量",
      "存储Key": "meta.rosterSlots"
    },
    {
      "字段ID": "artifact_slots",
      "中文名": "法宝槽位",
      "类型": "int",
      "初始值": 1,
      "成长/解锁规则": "MVP固定1；后续账号等级15解锁2",
      "用途": "每局可装备法宝数量",
      "存储Key": "meta.artifactSlots"
    },
    {
      "字段ID": "owned_roles",
      "中文名": "已拥有角色",
      "类型": "array",
      "初始值": "初始3名",
      "成长/解锁规则": "抽卡/等级解锁获得",
      "用途": "参战选择池",
      "存储Key": "meta.ownedRoles"
    },
    {
      "字段ID": "role_levels",
      "中文名": "角色等级",
      "类型": "map",
      "初始值": "初始1",
      "成长/解锁规则": "消耗灵石升级角色基础属性",
      "用途": "提升角色基础伤害/攻速/射程",
      "存储Key": "meta.roleLevels"
    },
    {
      "字段ID": "unlocked_formations",
      "中文名": "已解锁阵法",
      "类型": "array",
      "初始值": "青莲护山阵",
      "成长/解锁规则": "账号等级或任务解锁",
      "用途": "开局选择护山大阵",
      "存储Key": "meta.unlockedFormations"
    },
    {
      "字段ID": "unlocked_artifacts",
      "中文名": "已解锁法宝",
      "类型": "array",
      "初始值": "青冥剑匣",
      "成长/解锁规则": "抽卡/等级解锁",
      "用途": "开局装备法宝",
      "存储Key": "meta.unlockedArtifacts"
    },
    {
      "字段ID": "selected_formation",
      "中文名": "本局选择阵法",
      "类型": "string",
      "初始值": "玩家选择",
      "成长/解锁规则": "战斗开始前确定",
      "用途": "决定护山被动",
      "存储Key": "run.selectedFormation"
    },
    {
      "字段ID": "selected_roles",
      "中文名": "本局上阵角色",
      "类型": "array",
      "初始值": "玩家选择",
      "成长/解锁规则": "战斗开始前确定",
      "用途": "可部署到格子",
      "存储Key": "run.selectedRoles"
    },
    {
      "字段ID": "selected_artifacts",
      "中文名": "本局装备法宝",
      "类型": "array",
      "初始值": "玩家选择",
      "成长/解锁规则": "战斗开始前确定",
      "用途": "自动攻击手段",
      "存储Key": "run.selectedArtifacts"
    }
  ],
  "initial": {
    "formation": "formation_qinglian",
    "roles": [
      "role_lu_qingzhu",
      "role_shen_xiaotang",
      "role_gu_shi",
      "role_ye_shuangning",
      "role_cheng_mozhu"
    ],
    "artifact": "artifact_qingming_swordcase"
  },
  "formations": {
    "formation_qinglian": {
      "id": "formation_qinglian",
      "name": "青莲护山阵",
      "rarity": "初始",
      "triggerRadius": 2.5,
      "cooldown": 6.0,
      "effectText": "绽放青莲剑气，对范围内最多6名敌人造成阵眼攻击系数伤害。",
      "maxTargets": 6,
      "effectType": "aoe_damage"
    },
    "formation_xuanwu": {
      "id": "formation_xuanwu",
      "name": "玄武覆山阵",
      "rarity": "稀有",
      "triggerRadius": 2.0,
      "cooldown": 8.0,
      "effectText": "玄武虚影震退近处敌人，并使其减速50%，持续2秒。",
      "maxTargets": 99,
      "effectType": "knockback_slow"
    },
    "formation_jiuxiao": {
      "id": "formation_jiuxiao",
      "name": "九霄引雷阵",
      "rarity": "稀有",
      "triggerRadius": 3.0,
      "cooldown": 7.0,
      "effectText": "降下天雷，优先命中距离阵眼最近的敌人，可弹射3次。",
      "maxTargets": 99,
      "effectType": "chain_lightning"
    },
    "formation_nanming": {
      "id": "formation_nanming",
      "name": "南明离火阵",
      "rarity": "史诗",
      "triggerRadius": 2.5,
      "cooldown": 6.0,
      "effectText": "释放离火焚域，对范围敌人造成伤害并附加燃烧。",
      "maxTargets": 99,
      "effectType": "burning_area"
    },
    "formation_taiyin": {
      "id": "formation_taiyin",
      "name": "太阴寒月阵",
      "rarity": "史诗",
      "triggerRadius": 3.0,
      "cooldown": 9.0,
      "effectText": "寒月辉光覆盖近阵眼区域，使敌人冻结0.8秒。",
      "maxTargets": 99,
      "effectType": "freeze"
    },
    "formation_liangyi": {
      "id": "formation_liangyi",
      "name": "两仪归元阵",
      "rarity": "传说",
      "triggerRadius": 2.5,
      "cooldown": 12.0,
      "effectText": "阵眼受击后触发阴阳反震，对附近敌人造成伤害并回复1点阵眼HP。",
      "maxTargets": 99,
      "effectType": "aoe_damage"
    }
  },
  "roles": {
    "role_lu_qingzhu": {
      "id": "role_lu_qingzhu",
      "name": "陆青竹",
      "rank": "外门弟子",
      "rarity": "普通",
      "unlock": "初始拥有",
      "unlockCondition": "初始拥有",
      "school": "剑",
      "projectileText": "单枚飞剑直线命中最近敌人",
      "projectile": "single",
      "projectileType": "single",
      "trajectoryType": "single",
      "baseDamage": 8.0,
      "attackInterval": 0.9,
      "baseAttackSpeed": 1.1111,
      "range": 3.0,
      "baseRange": 3.0,
      "talent": "无",
      "passiveSkill": "",
      "level": 1,
      "upgradeCost": 50,
      "note": "新手基础单体输出。"
    },
    "role_shen_xiaotang": {
      "id": "role_shen_xiaotang",
      "name": "沈小棠",
      "rank": "外门弟子",
      "rarity": "普通",
      "unlock": "初始拥有",
      "unlockCondition": "初始拥有",
      "school": "火",
      "projectileText": "火符弹，命中小范围溅射",
      "projectile": "splash",
      "projectileType": "splash",
      "trajectoryType": "splash",
      "baseDamage": 10.0,
      "attackInterval": 1.2,
      "baseAttackSpeed": 0.8333,
      "range": 3.0,
      "baseRange": 3.0,
      "talent": "无",
      "passiveSkill": "",
      "level": 1,
      "upgradeCost": 50,
      "note": "新手AOE。"
    },
    "role_gu_shi": {
      "id": "role_gu_shi",
      "name": "顾石",
      "rank": "外门弟子",
      "rarity": "普通",
      "unlock": "初始拥有",
      "unlockCondition": "初始拥有",
      "school": "体",
      "projectileText": "短程拳罡，攻击正前方最近敌人",
      "projectile": "single",
      "projectileType": "single",
      "trajectoryType": "single",
      "baseDamage": 12.0,
      "attackInterval": 1.0,
      "baseAttackSpeed": 1.0,
      "range": 2.0,
      "baseRange": 2.0,
      "talent": "无",
      "passiveSkill": "",
      "level": 1,
      "upgradeCost": 50,
      "note": "前排近程输出。"
    },
    "role_lin_wenzhou": {
      "id": "role_lin_wenzhou",
      "name": "林问舟",
      "rank": "内门弟子",
      "rarity": "优秀",
      "unlock": "账号等级2解锁/抽卡",
      "unlockCondition": "账号等级2解锁/抽卡",
      "school": "剑",
      "projectileText": "飞剑穿刺，默认可穿透1个敌人",
      "projectile": "pierce",
      "projectileType": "pierce",
      "trajectoryType": "pierce",
      "baseDamage": 11.0,
      "attackInterval": 1.0,
      "baseAttackSpeed": 1.0,
      "range": 3.5,
      "baseRange": 3.5,
      "talent": "无",
      "passiveSkill": "",
      "level": 1,
      "upgradeCost": 50,
      "note": "内门仍无被动，但弹道比外门更好。"
    },
    "role_ye_shuangning": {
      "id": "role_ye_shuangning",
      "name": "叶霜凝",
      "rank": "内门弟子",
      "rarity": "优秀",
      "unlock": "账号等级3解锁/抽卡",
      "unlockCondition": "账号等级3解锁/抽卡",
      "school": "冰",
      "projectileText": "冰针命中后附带20%减速1秒",
      "projectile": "slow",
      "projectileType": "slow",
      "trajectoryType": "slow",
      "baseDamage": 7.0,
      "attackInterval": 1.1,
      "baseAttackSpeed": 0.9091,
      "range": 3.0,
      "baseRange": 3.0,
      "talent": "无",
      "passiveSkill": "",
      "level": 1,
      "upgradeCost": 50,
      "note": "基础控制角色。"
    },
    "role_cheng_mozhu": {
      "id": "role_cheng_mozhu",
      "name": "程墨竹",
      "rank": "内门弟子",
      "rarity": "优秀",
      "unlock": "账号等级4解锁/抽卡",
      "unlockCondition": "账号等级4解锁/抽卡",
      "school": "毒",
      "projectileText": "毒符命中后造成3秒持续伤害",
      "projectile": "poison",
      "projectileType": "poison",
      "trajectoryType": "poison",
      "baseDamage": 6.0,
      "attackInterval": 1.2,
      "baseAttackSpeed": 0.8333,
      "range": 3.0,
      "baseRange": 3.0,
      "talent": "无",
      "passiveSkill": "",
      "level": 1,
      "upgradeCost": 50,
      "note": "DOT输出。"
    },
    "role_su_zhaoye": {
      "id": "role_su_zhaoye",
      "name": "苏照夜",
      "rank": "核心弟子",
      "rarity": "稀有",
      "unlock": "抽卡/账号等级5保底",
      "unlockCondition": "抽卡/账号等级5保底",
      "school": "剑",
      "projectileText": "剑虹直线攻击，可被纵向机缘强化",
      "projectile": "single",
      "projectileType": "single",
      "trajectoryType": "single",
      "baseDamage": 16.0,
      "attackInterval": 0.85,
      "baseAttackSpeed": 1.1765,
      "range": 4.0,
      "baseRange": 4.0,
      "talent": "剑势：连续攻击同一目标时伤害逐层+5%，最多5层。",
      "passiveSkill": "剑势：连续攻击同一目标时伤害逐层+5%，最多5层。",
      "level": 1,
      "upgradeCost": 50,
      "note": "核心弟子开始拥有被动。"
    },
    "role_bai_luoli": {
      "id": "role_bai_luoli",
      "name": "白洛璃",
      "rank": "核心弟子",
      "rarity": "稀有",
      "unlock": "抽卡",
      "unlockCondition": "抽卡",
      "school": "冰",
      "projectileText": "扇形冰刃，横向覆盖相邻列",
      "projectile": "horizontal",
      "projectileType": "horizontal",
      "trajectoryType": "horizontal",
      "baseDamage": 13.0,
      "attackInterval": 1.3,
      "baseAttackSpeed": 0.7692,
      "range": 3.5,
      "baseRange": 3.5,
      "talent": "寒息：被减速敌人受到白洛璃伤害+20%。",
      "passiveSkill": "寒息：被减速敌人受到白洛璃伤害+20%。",
      "level": 1,
      "upgradeCost": 50,
      "note": "适合演示横向弹道。"
    },
    "role_han_jin": {
      "id": "role_han_jin",
      "name": "韩烬",
      "rank": "核心弟子",
      "rarity": "稀有",
      "unlock": "抽卡",
      "unlockCondition": "抽卡",
      "school": "火",
      "projectileText": "火鸦弹道，命中后爆裂",
      "projectile": "splash",
      "projectileType": "splash",
      "trajectoryType": "splash",
      "baseDamage": 18.0,
      "attackInterval": 1.5,
      "baseAttackSpeed": 0.6667,
      "range": 3.5,
      "baseRange": 3.5,
      "talent": "余烬：击杀敌人后留下燃烧地面1.5秒。",
      "passiveSkill": "余烬：击杀敌人后留下燃烧地面1.5秒。",
      "level": 1,
      "upgradeCost": 50,
      "note": "火法核心。"
    },
    "role_zhao_xuance": {
      "id": "role_zhao_xuance",
      "name": "赵玄策",
      "rank": "执事",
      "rarity": "史诗",
      "unlock": "抽卡/账号等级8",
      "unlockCondition": "抽卡/账号等级8",
      "school": "雷",
      "projectileText": "雷符命中后弹射2个目标",
      "projectile": "chain",
      "projectileType": "chain",
      "trajectoryType": "chain",
      "baseDamage": 15.0,
      "attackInterval": 1.2,
      "baseAttackSpeed": 0.8333,
      "range": 4.0,
      "baseRange": 4.0,
      "talent": "雷引：每第4次攻击额外召一道小天雷。",
      "passiveSkill": "雷引：每第4次攻击额外召一道小天雷。",
      "level": 1,
      "upgradeCost": 50,
      "note": "中期强力清杂。"
    },
    "role_ning_caiwei": {
      "id": "role_ning_caiwei",
      "name": "宁采微",
      "rank": "执事",
      "rarity": "史诗",
      "unlock": "抽卡",
      "unlockCondition": "抽卡",
      "school": "毒",
      "projectileText": "毒蝶追踪弹，优先攻击未中毒敌人",
      "projectile": "poison",
      "projectileType": "poison",
      "trajectoryType": "poison",
      "baseDamage": 12.0,
      "attackInterval": 1.1,
      "baseAttackSpeed": 0.9091,
      "range": 4.0,
      "baseRange": 4.0,
      "talent": "瘟华：中毒敌人死亡时30%概率扩散毒。",
      "passiveSkill": "瘟华：中毒敌人死亡时30%概率扩散毒。",
      "level": 1,
      "upgradeCost": 50,
      "note": "毒流派核心。"
    },
    "role_yunhe_elder": {
      "id": "role_yunhe_elder",
      "name": "云鹤长老",
      "rank": "长老",
      "rarity": "传说",
      "unlock": "抽卡/活动",
      "unlockCondition": "抽卡/活动",
      "school": "剑",
      "projectileText": "剑雨，多枚纵向落剑",
      "projectile": "single",
      "projectileType": "single",
      "trajectoryType": "single",
      "baseDamage": 22.0,
      "attackInterval": 1.4,
      "baseAttackSpeed": 0.7143,
      "range": 4.5,
      "baseRange": 4.5,
      "talent": "云海剑域：场上每有1名剑系角色，云鹤长老伤害+8%。",
      "passiveSkill": "云海剑域：场上每有1名剑系角色，云鹤长老伤害+8%。",
      "level": 1,
      "upgradeCost": 50,
      "note": "长老高阶被动。"
    },
    "role_chiyang_elder": {
      "id": "role_chiyang_elder",
      "name": "赤阳长老",
      "rank": "长老",
      "rarity": "传说",
      "unlock": "抽卡/活动",
      "unlockCondition": "抽卡/活动",
      "school": "火",
      "projectileText": "陨火术，大范围爆裂",
      "projectile": "splash",
      "projectileType": "splash",
      "trajectoryType": "splash",
      "baseDamage": 30.0,
      "attackInterval": 2.0,
      "baseAttackSpeed": 0.5,
      "range": 4.0,
      "baseRange": 4.0,
      "talent": "赤阳真火：燃烧伤害可暴击。",
      "passiveSkill": "赤阳真火：燃烧伤害可暴击。",
      "level": 1,
      "upgradeCost": 50,
      "note": "高爆发AOE。"
    },
    "role_xuanshuang_elder": {
      "id": "role_xuanshuang_elder",
      "name": "玄霜长老",
      "rank": "长老",
      "rarity": "传说",
      "unlock": "抽卡/活动",
      "unlockCondition": "抽卡/活动",
      "school": "冰",
      "projectileText": "寒霜领域，周期性范围冰爆",
      "projectile": "slow",
      "projectileType": "slow",
      "trajectoryType": "slow",
      "baseDamage": 18.0,
      "attackInterval": 1.8,
      "baseAttackSpeed": 0.5556,
      "range": 4.0,
      "baseRange": 4.0,
      "talent": "霜天：冻结敌人被击碎时造成范围伤害。",
      "passiveSkill": "霜天：冻结敌人被击碎时造成范围伤害。",
      "level": 1,
      "upgradeCost": 50,
      "note": "高级控制。"
    },
    "role_shen_tianque": {
      "id": "role_shen_tianque",
      "name": "沈天阙",
      "rank": "宗主",
      "rarity": "神话",
      "unlock": "后续版本/高保底",
      "unlockCondition": "后续版本/高保底",
      "school": "全系/剑",
      "projectileText": "万剑归宗，锁定多个目标",
      "projectile": "single",
      "projectileType": "single",
      "trajectoryType": "single",
      "baseDamage": 35.0,
      "attackInterval": 1.6,
      "baseAttackSpeed": 0.625,
      "range": 5.0,
      "baseRange": 5.0,
      "talent": "宗主威压：全队攻击+10%，阵眼低血时效果翻倍。",
      "passiveSkill": "宗主威压：全队攻击+10%，阵眼低血时效果翻倍。",
      "level": 1,
      "upgradeCost": 50,
      "note": "MVP可做数据，后续实现。"
    }
  },
  "artifacts": {
    "artifact_qingming_swordcase": {
      "id": "artifact_qingming_swordcase",
      "name": "青冥剑匣",
      "rarity": "初始",
      "damage": 18.0,
      "cooldown": 6.0,
      "attackText": "每次释放3道飞剑攻击最近敌人",
      "targeting": "最近敌人优先"
    },
    "artifact_zidian_seal": {
      "id": "artifact_zidian_seal",
      "name": "紫电雷印",
      "rarity": "稀有",
      "damage": 22.0,
      "cooldown": 7.0,
      "attackText": "释放连锁雷击",
      "targeting": "高血量敌人优先"
    },
    "artifact_xuanhuo_gourd": {
      "id": "artifact_xuanhuo_gourd",
      "name": "玄火葫芦",
      "rarity": "稀有",
      "damage": 20.0,
      "cooldown": 8.0,
      "attackText": "喷出火焰扇形区域",
      "targeting": "前方区域"
    },
    "artifact_hanyu_bottle": {
      "id": "artifact_hanyu_bottle",
      "name": "寒玉净瓶",
      "rarity": "史诗",
      "damage": 14.0,
      "cooldown": 9.0,
      "attackText": "释放寒潮，伤害并减速",
      "targeting": "靠近阵眼敌人优先"
    },
    "artifact_zhenhun_bell": {
      "id": "artifact_zhenhun_bell",
      "name": "镇魂铃",
      "rarity": "史诗",
      "damage": 12.0,
      "cooldown": 11.0,
      "attackText": "震荡全场小范围，短暂眩晕",
      "targeting": "敌人最密集区域"
    },
    "artifact_shanhe_seal": {
      "id": "artifact_shanhe_seal",
      "name": "山河印",
      "rarity": "传说",
      "damage": 45.0,
      "cooldown": 12.0,
      "attackText": "砸击高血量目标，范围击退",
      "targeting": "血量最高敌人"
    }
  },
  "levels": [
    {
      "level": 1,
      "requiredLingqi": 0.0,
      "increment": 0.0
    },
    {
      "level": 2,
      "requiredLingqi": 40.0,
      "increment": 40.0
    },
    {
      "level": 3,
      "requiredLingqi": 95.0,
      "increment": 55.0
    },
    {
      "level": 4,
      "requiredLingqi": 165.0,
      "increment": 70.0
    },
    {
      "level": 5,
      "requiredLingqi": 250.0,
      "increment": 85.0
    },
    {
      "level": 6,
      "requiredLingqi": 350.0,
      "increment": 100.0
    },
    {
      "level": 7,
      "requiredLingqi": 470.0,
      "increment": 120.0
    },
    {
      "level": 8,
      "requiredLingqi": 610.0,
      "increment": 140.0
    },
    {
      "level": 9,
      "requiredLingqi": 770.0,
      "increment": 160.0
    },
    {
      "level": 10,
      "requiredLingqi": 950.0,
      "increment": 180.0
    },
    {
      "level": 11,
      "requiredLingqi": 1150.0,
      "increment": 200.0
    },
    {
      "level": 12,
      "requiredLingqi": 1370.0,
      "increment": 220.0
    },
    {
      "level": 13,
      "requiredLingqi": 1610.0,
      "increment": 240.0
    },
    {
      "level": 14,
      "requiredLingqi": 1870.0,
      "increment": 260.0
    },
    {
      "level": 15,
      "requiredLingqi": 2150.0,
      "increment": 280.0
    },
    {
      "level": 16,
      "requiredLingqi": 2450.0,
      "increment": 300.0
    },
    {
      "level": 17,
      "requiredLingqi": 2780.0,
      "increment": 330.0
    },
    {
      "level": 18,
      "requiredLingqi": 3140.0,
      "increment": 360.0
    },
    {
      "level": 19,
      "requiredLingqi": 3530.0,
      "increment": 390.0
    },
    {
      "level": 20,
      "requiredLingqi": 3950.0,
      "increment": 420.0
    }
  ],
  "perks": [
    {
      "id": "perk_parallel_sword_left_right",
      "name": "左右分光",
      "category": "横向弹道",
      "rarity": "普通",
      "target": "全部角色",
      "description": "角色普通攻击额外生成左右两侧弱化弹道。",
      "valueText": "侧弹道伤害=原伤害35%",
      "requirement": "无",
      "stackable": true,
      "note": "横向弹道：覆盖相邻列/扇形角度。",
      "effect": {
        "type": "side_projectiles",
        "value": 1
      }
    },
    {
      "id": "perk_wide_arc",
      "name": "横扫剑弧",
      "category": "横向弹道",
      "rarity": "稀有",
      "target": "剑系/体系",
      "description": "攻击宽度增加，可命中相邻横向敌人。",
      "valueText": "横向宽度+1格",
      "requirement": "无",
      "stackable": true,
      "note": "增加碰撞宽度。",
      "effect": {
        "type": "unimplemented",
        "value": 0
      }
    },
    {
      "id": "perk_fire_fan",
      "name": "火羽成扇",
      "category": "横向弹道",
      "rarity": "稀有",
      "target": "火系",
      "description": "火系攻击变为扇形散射。",
      "valueText": "额外2枚火羽，伤害40%",
      "requirement": "火系角色或法宝",
      "stackable": false,
      "note": "扇形弹道。",
      "effect": {
        "type": "unimplemented",
        "value": 0
      }
    },
    {
      "id": "perk_ice_lotus_spread",
      "name": "冰莲横生",
      "category": "横向弹道",
      "rarity": "稀有",
      "target": "冰系",
      "description": "冰系命中后向左右扩散寒气。",
      "valueText": "左右1格减速25%",
      "requirement": "冰系角色",
      "stackable": true,
      "note": "命中后范围扩散。",
      "effect": {
        "type": "unimplemented",
        "value": 0
      }
    },
    {
      "id": "perk_thunder_side_chain",
      "name": "旁支雷脉",
      "category": "横向弹道",
      "rarity": "稀有",
      "target": "雷系",
      "description": "雷系弹射优先横向跳转到邻近列敌人。",
      "valueText": "弹射+1",
      "requirement": "雷系角色/法宝",
      "stackable": true,
      "note": "弹射逻辑优先相邻列。",
      "effect": {
        "type": "unimplemented",
        "value": 0
      }
    },
    {
      "id": "perk_pierce_one",
      "name": "一线洞穿",
      "category": "纵向弹道",
      "rarity": "普通",
      "target": "全部角色",
      "description": "普通攻击可额外穿透1个敌人。",
      "valueText": "穿透+1",
      "requirement": "无",
      "stackable": true,
      "note": "纵向弹道：沿攻击方向继续命中。",
      "effect": {
        "type": "pierce_add",
        "value": 1
      }
    },
    {
      "id": "perk_double_cast",
      "name": "再起一诀",
      "category": "纵向弹道",
      "rarity": "普通",
      "target": "全部角色",
      "description": "每次攻击追加一次低伤害连发。",
      "valueText": "追加弹道伤害=40%",
      "requirement": "无",
      "stackable": true,
      "note": "同方向延迟0.1秒发射。",
      "effect": {
        "type": "unimplemented",
        "value": 0
      }
    },
    {
      "id": "perk_returning_sword",
      "name": "回风返剑",
      "category": "纵向弹道",
      "rarity": "稀有",
      "target": "剑系",
      "description": "飞剑到达最大距离后返程，再次命中路径敌人。",
      "valueText": "返程伤害50%",
      "requirement": "剑系角色",
      "stackable": false,
      "note": "需要 projectile return 状态。",
      "effect": {
        "type": "unimplemented",
        "value": 0
      }
    },
    {
      "id": "perk_flame_path",
      "name": "离火成径",
      "category": "纵向弹道",
      "rarity": "稀有",
      "target": "火系",
      "description": "火系弹道经过路径留下火痕。",
      "valueText": "每秒伤害=角色伤害20%，2秒",
      "requirement": "火系角色",
      "stackable": true,
      "note": "沿路径生成持续区域。",
      "effect": {
        "type": "unimplemented",
        "value": 0
      }
    },
    {
      "id": "perk_frost_line",
      "name": "霜线蔓延",
      "category": "纵向弹道",
      "rarity": "稀有",
      "target": "冰系",
      "description": "冰系攻击沿纵向路径附加减速区域。",
      "valueText": "减速30%，1.5秒",
      "requirement": "冰系角色",
      "stackable": true,
      "note": "路径区域减速。",
      "effect": {
        "type": "unimplemented",
        "value": 0
      }
    },
    {
      "id": "perk_damage_minor",
      "name": "灵力灌注",
      "category": "伤害",
      "rarity": "普通",
      "target": "全部角色",
      "description": "所有角色攻击伤害提升。",
      "valueText": "+12%",
      "requirement": "无",
      "stackable": true,
      "note": "全局乘区。",
      "effect": {
        "type": "role_damage_mult",
        "value": 0.12
      }
    },
    {
      "id": "perk_damage_major",
      "name": "道基稳固",
      "category": "伤害",
      "rarity": "稀有",
      "target": "全部角色",
      "description": "所有角色攻击伤害大幅提升。",
      "valueText": "+25%",
      "requirement": "局内等级>=5",
      "stackable": true,
      "note": "全局乘区。",
      "effect": {
        "type": "role_damage_mult",
        "value": 0.25
      }
    },
    {
      "id": "perk_attack_speed",
      "name": "周天急转",
      "category": "攻速",
      "rarity": "普通",
      "target": "全部角色",
      "description": "所有角色攻击间隔缩短。",
      "valueText": "攻速+10%",
      "requirement": "无",
      "stackable": true,
      "note": "attackInterval / (1+bonus)。",
      "effect": {
        "type": "role_attack_speed",
        "value": 0.1
      }
    },
    {
      "id": "perk_range",
      "name": "神识外放",
      "category": "射程",
      "rarity": "普通",
      "target": "全部角色",
      "description": "所有角色射程提升。",
      "valueText": "+0.5格",
      "requirement": "无",
      "stackable": true,
      "note": "更新目标搜索半径。",
      "effect": {
        "type": "role_range_add",
        "value": 0.5
      }
    },
    {
      "id": "perk_crit",
      "name": "一念破妄",
      "category": "暴击",
      "rarity": "稀有",
      "target": "全部角色",
      "description": "角色攻击有概率暴击。",
      "valueText": "暴击率+10%，暴伤180%",
      "requirement": "无",
      "stackable": true,
      "note": "若已有暴击则累加概率。",
      "effect": {
        "type": "crit",
        "chance": 0.1,
        "mult": 1.8
      }
    },
    {
      "id": "perk_execute",
      "name": "斩妖绝息",
      "category": "处决",
      "rarity": "史诗",
      "target": "全部角色",
      "description": "攻击生命低于阈值的普通敌人时直接斩杀。",
      "valueText": "阈值8%",
      "requirement": "局内等级>=8",
      "stackable": false,
      "note": "Boss不受处决影响。",
      "effect": {
        "type": "unimplemented",
        "value": 0
      }
    },
    {
      "id": "perk_sword_passive_up",
      "name": "剑心再明",
      "category": "被动强化",
      "rarity": "稀有",
      "target": "剑系核心及以上",
      "description": "剑系角色被动效果提升。",
      "valueText": "被动数值+50%",
      "requirement": "拥有剑系被动角色",
      "stackable": true,
      "note": "遍历角色talent tags。",
      "effect": {
        "type": "unimplemented",
        "value": 0
      }
    },
    {
      "id": "perk_fire_passive_up",
      "name": "赤阳添薪",
      "category": "被动强化",
      "rarity": "稀有",
      "target": "火系核心及以上",
      "description": "火系燃烧/爆裂类被动增强。",
      "valueText": "燃烧伤害+40%",
      "requirement": "火系被动角色",
      "stackable": true,
      "note": "强化burn modifier。",
      "effect": {
        "type": "unimplemented",
        "value": 0
      }
    },
    {
      "id": "perk_ice_passive_up",
      "name": "寒魄入骨",
      "category": "被动强化",
      "rarity": "稀有",
      "target": "冰系核心及以上",
      "description": "冰系减速和冻结效果增强。",
      "valueText": "控制时长+25%",
      "requirement": "冰系被动角色",
      "stackable": true,
      "note": "强化slow/freeze。",
      "effect": {
        "type": "unimplemented",
        "value": 0
      }
    },
    {
      "id": "perk_poison_passive_up",
      "name": "百毒归流",
      "category": "被动强化",
      "rarity": "稀有",
      "target": "毒系核心及以上",
      "description": "毒系扩散与持续伤害增强。",
      "valueText": "毒持续+1秒，扩散率+15%",
      "requirement": "毒系被动角色",
      "stackable": true,
      "note": "强化poison dot。",
      "effect": {
        "type": "unimplemented",
        "value": 0
      }
    },
    {
      "id": "perk_role_focus_random",
      "name": "点化弟子",
      "category": "角色强化",
      "rarity": "普通",
      "target": "随机已部署角色",
      "description": "随机一名已部署角色伤害和攻速提升。",
      "valueText": "伤害+20%，攻速+10%",
      "requirement": "至少部署1名角色",
      "stackable": true,
      "note": "选择时显示目标角色名。",
      "effect": {
        "type": "unimplemented",
        "value": 0
      }
    },
    {
      "id": "perk_outer_disciple_breakthrough",
      "name": "外门顿悟",
      "category": "角色强化",
      "rarity": "稀有",
      "target": "外门/内门角色",
      "description": "普通弟子本局临时获得简易被动。",
      "valueText": "每5次攻击额外连发1次",
      "requirement": "拥有外门/内门角色",
      "stackable": false,
      "note": "让低阶角色也有成长惊喜。",
      "effect": {
        "type": "unimplemented",
        "value": 0
      }
    },
    {
      "id": "perk_artifact_damage",
      "name": "法宝温养",
      "category": "法宝强化",
      "rarity": "普通",
      "target": "已装备法宝",
      "description": "法宝伤害提升。",
      "valueText": "+25%",
      "requirement": "装备法宝",
      "stackable": true,
      "note": "artifactDamageMultiplier。",
      "effect": {
        "type": "unimplemented",
        "value": 0
      }
    },
    {
      "id": "perk_artifact_cooldown",
      "name": "器灵苏醒",
      "category": "法宝强化",
      "rarity": "稀有",
      "target": "已装备法宝",
      "description": "法宝冷却缩短。",
      "valueText": "冷却-20%",
      "requirement": "装备法宝",
      "stackable": true,
      "note": "最短冷却下限2秒。",
      "effect": {
        "type": "unimplemented",
        "value": 0
      }
    },
    {
      "id": "perk_artifact_projectile",
      "name": "器灵分化",
      "category": "法宝强化",
      "rarity": "史诗",
      "target": "弹道型法宝",
      "description": "法宝释放额外弹道。",
      "valueText": "+1~2弹道",
      "requirement": "装备弹道法宝",
      "stackable": true,
      "note": "按artifact tags应用。",
      "effect": {
        "type": "unimplemented",
        "value": 0
      }
    },
    {
      "id": "perk_artifact_control",
      "name": "镇魂余响",
      "category": "法宝强化",
      "rarity": "稀有",
      "target": "控制型法宝",
      "description": "法宝命中后附加短暂减速或眩晕。",
      "valueText": "减速40%/1秒",
      "requirement": "装备控制法宝",
      "stackable": true,
      "note": "法宝命中回调。",
      "effect": {
        "type": "unimplemented",
        "value": 0
      }
    },
    {
      "id": "perk_formation_damage",
      "name": "阵纹复明",
      "category": "阵法强化",
      "rarity": "普通",
      "target": "当前阵法",
      "description": "护山阵法触发伤害提升。",
      "valueText": "+30%",
      "requirement": "选择阵法",
      "stackable": true,
      "note": "formationDamageMultiplier。",
      "effect": {
        "type": "formation_damage_mult",
        "value": 0.3
      }
    },
    {
      "id": "perk_formation_cooldown",
      "name": "阵眼归元",
      "category": "阵法强化",
      "rarity": "稀有",
      "target": "当前阵法",
      "description": "护山阵法冷却缩短。",
      "valueText": "-20%",
      "requirement": "选择阵法",
      "stackable": true,
      "note": "最短冷却下限3秒。",
      "effect": {
        "type": "formation_cooldown_mult",
        "value": 0.8
      }
    },
    {
      "id": "perk_formation_radius",
      "name": "大阵外扩",
      "category": "阵法强化",
      "rarity": "稀有",
      "target": "当前阵法",
      "description": "护山阵法触发范围扩大。",
      "valueText": "+0.5格",
      "requirement": "选择阵法",
      "stackable": true,
      "note": "增加triggerRadius。",
      "effect": {
        "type": "formation_radius_add",
        "value": 0.5
      }
    },
    {
      "id": "perk_base_hp",
      "name": "护山灵光",
      "category": "阵眼防御",
      "rarity": "普通",
      "target": "护山阵眼",
      "description": "立即恢复并增加阵眼最大生命。",
      "valueText": "最大HP+3，当前HP+3",
      "requirement": "无",
      "stackable": true,
      "note": "更新UI血条。",
      "effect": {
        "type": "base_hp_add",
        "value": 3
      }
    },
    {
      "id": "perk_last_stand",
      "name": "残阵不灭",
      "category": "阵眼防御",
      "rarity": "史诗",
      "target": "护山阵眼",
      "description": "阵眼生命低于30%时，所有角色伤害提升。",
      "valueText": "伤害+40%",
      "requirement": "无",
      "stackable": false,
      "note": "监听baseHP ratio。",
      "effect": {
        "type": "unimplemented",
        "value": 0
      }
    },
    {
      "id": "perk_lingqi_gain",
      "name": "聚灵成潮",
      "category": "经验成长",
      "rarity": "普通",
      "target": "灵气获取",
      "description": "击杀敌人获得灵气提升。",
      "valueText": "+20%",
      "requirement": "无",
      "stackable": true,
      "note": "仅影响局内经验。",
      "effect": {
        "type": "lingqi_gain_mult",
        "value": 0.2
      }
    },
    {
      "id": "perk_elite_lingqi",
      "name": "妖丹炼气",
      "category": "经验成长",
      "rarity": "稀有",
      "target": "精英/Boss",
      "description": "击杀精英和Boss额外获得灵气。",
      "valueText": "+50%",
      "requirement": "无",
      "stackable": true,
      "note": "按enemy tags。",
      "effect": {
        "type": "unimplemented",
        "value": 0
      }
    },
    {
      "id": "perk_boss_slayer",
      "name": "镇魔誓",
      "category": "Boss对策",
      "rarity": "稀有",
      "target": "Boss",
      "description": "所有角色对Boss伤害提升。",
      "valueText": "+30%",
      "requirement": "第5波后",
      "stackable": true,
      "note": "enemy.isBoss。",
      "effect": {
        "type": "boss_damage_mult",
        "value": 0.3
      }
    },
    {
      "id": "perk_slow_damage",
      "name": "困兽易斩",
      "category": "组合",
      "rarity": "稀有",
      "target": "被减速敌人",
      "description": "被减速敌人受到所有伤害提升。",
      "valueText": "+20%",
      "requirement": "存在冰系/控制来源",
      "stackable": true,
      "note": "debuff vulnerability。",
      "effect": {
        "type": "slow_vulnerability",
        "value": 0.2
      }
    },
    {
      "id": "perk_poison_fire",
      "name": "毒火相煎",
      "category": "组合",
      "rarity": "史诗",
      "target": "中毒+燃烧敌人",
      "description": "同时中毒和燃烧的敌人每秒受到额外伤害。",
      "valueText": "额外伤害=角色均伤15%",
      "requirement": "毒与火来源",
      "stackable": true,
      "note": "多debuff组合。",
      "effect": {
        "type": "unimplemented",
        "value": 0
      }
    },
    {
      "id": "perk_thunder_mark",
      "name": "雷痕入体",
      "category": "组合",
      "rarity": "稀有",
      "target": "被雷击敌人",
      "description": "被雷击敌人短时间内受到弹道伤害提升。",
      "valueText": "+18%，3秒",
      "requirement": "雷来源",
      "stackable": true,
      "note": "添加mark debuff。",
      "effect": {
        "type": "unimplemented",
        "value": 0
      }
    },
    {
      "id": "perk_high_risk_damage",
      "name": "燃寿御敌",
      "category": "风险",
      "rarity": "史诗",
      "target": "全局",
      "description": "阵眼最大生命降低，但所有输出大幅提升。",
      "valueText": "最大HP-4，伤害+45%",
      "requirement": "无",
      "stackable": false,
      "note": "选择前高亮风险。",
      "effect": {
        "type": "unimplemented",
        "value": 0
      }
    },
    {
      "id": "perk_high_risk_speed",
      "name": "开阵诱妖",
      "category": "风险",
      "rarity": "稀有",
      "target": "敌人与收益",
      "description": "敌人速度提升，但灵气收益提升。",
      "valueText": "敌速+12%，灵气+35%",
      "requirement": "无",
      "stackable": false,
      "note": "风险收益。",
      "effect": {
        "type": "unimplemented",
        "value": 0
      }
    },
    {
      "id": "perk_random_legend",
      "name": "前辈遗泽",
      "category": "传说",
      "rarity": "随机",
      "target": "随机获得一项史诗级强化。",
      "description": "从史诗池抽1",
      "valueText": "局内等级>=10",
      "requirement": false,
      "stackable": "可先简化为随机perk。",
      "note": "",
      "effect": {
        "type": "unimplemented",
        "value": 0
      }
    },
    {
      "id": "perk_all_projectiles",
      "name": "万法分流",
      "category": "传说",
      "rarity": "全部弹道",
      "target": "所有弹道类攻击额外+1弹道。",
      "description": 1,
      "valueText": "局内等级>=12",
      "requirement": false,
      "stackable": "横向/纵向都可受益，强力终局。",
      "note": "",
      "effect": {
        "type": "side_projectiles",
        "value": 1
      }
    }
  ],
  "enemies": {
    "enemy_little_yao": {
      "id": "enemy_little_yao",
      "name": "山野小妖",
      "type": "普通",
      "hp": 30.0,
      "maxHp": 30.0,
      "speed": 1.0,
      "moveSpeed": 1.0,
      "baseDamage": 1.0,
      "attackDamage": 1.0,
      "attackInterval": 1.5,
      "spiritQiReward": 6.0,
      "lingqiReward": 6.0,
      "trait": "无",
      "note": "基础怪",
      "isBoss": false
    },
    "enemy_swift_wolf": {
      "id": "enemy_swift_wolf",
      "name": "疾行妖狼",
      "type": "快速",
      "hp": 24.0,
      "maxHp": 24.0,
      "speed": 1.75,
      "moveSpeed": 1.75,
      "baseDamage": 1.0,
      "attackDamage": 1.0,
      "attackInterval": 1.2,
      "spiritQiReward": 7.0,
      "lingqiReward": 7.0,
      "trait": "速度快",
      "note": "测试漏怪压力",
      "isBoss": false
    },
    "enemy_armor_beast": {
      "id": "enemy_armor_beast",
      "name": "玄甲巨兽",
      "type": "坦克",
      "hp": 130.0,
      "maxHp": 130.0,
      "speed": 0.65,
      "moveSpeed": 0.65,
      "baseDamage": 2.0,
      "attackDamage": 2.0,
      "attackInterval": 2.0,
      "spiritQiReward": 14.0,
      "lingqiReward": 14.0,
      "trait": "高血量",
      "note": "测试持续输出",
      "isBoss": false
    },
    "enemy_blood_cultivator": {
      "id": "enemy_blood_cultivator",
      "name": "血煞邪修",
      "type": "精英",
      "hp": 200.0,
      "maxHp": 200.0,
      "speed": 0.9,
      "moveSpeed": 0.9,
      "baseDamage": 2.0,
      "attackDamage": 2.0,
      "attackInterval": 1.8,
      "spiritQiReward": 28.0,
      "lingqiReward": 28.0,
      "trait": "每6秒短暂加速",
      "note": "精英压力",
      "isBoss": false
    },
    "boss_blackwind": {
      "id": "boss_blackwind",
      "name": "黑风妖将",
      "type": "Boss",
      "hp": 850.0,
      "maxHp": 850.0,
      "speed": 0.55,
      "moveSpeed": 0.55,
      "baseDamage": 5.0,
      "attackDamage": 5.0,
      "attackInterval": 2.5,
      "spiritQiReward": 100.0,
      "lingqiReward": 100.0,
      "trait": "每8秒召唤3只山野小妖",
      "note": "第5波",
      "isBoss": true
    },
    "boss_bloodlotus": {
      "id": "boss_bloodlotus",
      "name": "血莲魔修",
      "type": "Boss",
      "hp": 1400.0,
      "maxHp": 1400.0,
      "speed": 0.5,
      "moveSpeed": 0.5,
      "baseDamage": 5.0,
      "attackDamage": 5.0,
      "attackInterval": 2.5,
      "spiritQiReward": 150.0,
      "lingqiReward": 150.0,
      "trait": "每10秒治疗附近敌人",
      "note": "第10波",
      "isBoss": true
    },
    "boss_outer_demon": {
      "id": "boss_outer_demon",
      "name": "域外魔影",
      "type": "Boss",
      "hp": 2400.0,
      "maxHp": 2400.0,
      "speed": 0.45,
      "moveSpeed": 0.45,
      "baseDamage": 10.0,
      "attackDamage": 10.0,
      "attackInterval": 2.5,
      "spiritQiReward": 250.0,
      "lingqiReward": 250.0,
      "trait": "周期性免疫减速并召唤魔影",
      "note": "第15波",
      "isBoss": true
    }
  },
  "waves": [
    {
      "wave": 1,
      "segments": [
        {
          "wave": 1,
          "enemyId": "enemy_little_yao",
          "count": 8,
          "startDelay": 0,
          "spawnInterval": 0.97
        }
      ],
      "goal": "教学波",
      "lingqiScale": 48.0,
      "isBossWave": false,
      "settlementLingstone": 10.0
    },
    {
      "wave": 2,
      "segments": [
        {
          "wave": 2,
          "enemyId": "enemy_little_yao",
          "count": 12,
          "startDelay": 0,
          "spawnInterval": 0.94
        }
      ],
      "goal": "部署与攻击反馈",
      "lingqiScale": 72.0,
      "isBossWave": false,
      "settlementLingstone": 15.0
    },
    {
      "wave": 3,
      "segments": [
        {
          "wave": 3,
          "enemyId": "enemy_little_yao",
          "count": 10,
          "startDelay": 0,
          "spawnInterval": 0.91
        },
        {
          "wave": 3,
          "enemyId": "enemy_swift_wolf",
          "count": 4,
          "startDelay": 2,
          "spawnInterval": 0.91
        }
      ],
      "goal": "引入快怪",
      "lingqiScale": 88.0,
      "isBossWave": false,
      "settlementLingstone": 20.0
    },
    {
      "wave": 4,
      "segments": [
        {
          "wave": 4,
          "enemyId": "enemy_little_yao",
          "count": 12,
          "startDelay": 0,
          "spawnInterval": 0.88
        },
        {
          "wave": 4,
          "enemyId": "enemy_armor_beast",
          "count": 2,
          "startDelay": 2,
          "spawnInterval": 0.88
        }
      ],
      "goal": "引入坦克",
      "lingqiScale": 100.0,
      "isBossWave": false,
      "settlementLingstone": 25.0
    },
    {
      "wave": 5,
      "segments": [
        {
          "wave": 5,
          "enemyId": "boss_blackwind",
          "count": 1,
          "startDelay": 0,
          "spawnInterval": 0.85
        },
        {
          "wave": 5,
          "enemyId": "enemy_little_yao",
          "count": 10,
          "startDelay": 2,
          "spawnInterval": 0.85
        }
      ],
      "goal": "第一个Boss",
      "lingqiScale": 160.0,
      "isBossWave": false,
      "settlementLingstone": 60.0
    },
    {
      "wave": 6,
      "segments": [
        {
          "wave": 6,
          "enemyId": "enemy_swift_wolf",
          "count": 14,
          "startDelay": 0,
          "spawnInterval": 0.8200000000000001
        },
        {
          "wave": 6,
          "enemyId": "enemy_little_yao",
          "count": 10,
          "startDelay": 2,
          "spawnInterval": 0.8200000000000001
        }
      ],
      "goal": "速度压力",
      "lingqiScale": 158.0,
      "isBossWave": false,
      "settlementLingstone": 35.0
    },
    {
      "wave": 7,
      "segments": [
        {
          "wave": 7,
          "enemyId": "enemy_armor_beast",
          "count": 6,
          "startDelay": 0,
          "spawnInterval": 0.79
        },
        {
          "wave": 7,
          "enemyId": "enemy_little_yao",
          "count": 12,
          "startDelay": 2,
          "spawnInterval": 0.79
        }
      ],
      "goal": "血量压力",
      "lingqiScale": 156.0,
      "isBossWave": false,
      "settlementLingstone": 40.0
    },
    {
      "wave": 8,
      "segments": [
        {
          "wave": 8,
          "enemyId": "enemy_blood_cultivator",
          "count": 2,
          "startDelay": 0,
          "spawnInterval": 0.76
        },
        {
          "wave": 8,
          "enemyId": "enemy_swift_wolf",
          "count": 10,
          "startDelay": 2,
          "spawnInterval": 0.76
        }
      ],
      "goal": "精英登场",
      "lingqiScale": 126.0,
      "isBossWave": false,
      "settlementLingstone": 45.0
    },
    {
      "wave": 9,
      "segments": [
        {
          "wave": 9,
          "enemyId": "enemy_little_yao",
          "count": 14,
          "startDelay": 0,
          "spawnInterval": 0.45
        },
        {
          "wave": 9,
          "enemyId": "enemy_swift_wolf",
          "count": 8,
          "startDelay": 2,
          "spawnInterval": 0.55
        },
        {
          "wave": 9,
          "enemyId": "enemy_armor_beast",
          "count": 6,
          "startDelay": 4,
          "spawnInterval": 1.2
        },
        {
          "wave": 9,
          "enemyId": "enemy_blood_cultivator",
          "count": 2,
          "startDelay": 6,
          "spawnInterval": 1.8
        }
      ],
      "goal": "综合压力",
      "lingqiScale": 210.0,
      "isBossWave": false,
      "settlementLingstone": 50.0
    },
    {
      "wave": 10,
      "segments": [
        {
          "wave": 10,
          "enemyId": "boss_bloodlotus",
          "count": 1,
          "startDelay": 0,
          "spawnInterval": 0.7
        },
        {
          "wave": 10,
          "enemyId": "enemy_armor_beast",
          "count": 6,
          "startDelay": 2,
          "spawnInterval": 0.7
        }
      ],
      "goal": "第二Boss",
      "lingqiScale": 234.0,
      "isBossWave": false,
      "settlementLingstone": 90.0
    },
    {
      "wave": 11,
      "segments": [
        {
          "wave": 11,
          "enemyId": "enemy_swift_wolf",
          "count": 20,
          "startDelay": 0,
          "spawnInterval": 0.67
        },
        {
          "wave": 11,
          "enemyId": "enemy_blood_cultivator",
          "count": 2,
          "startDelay": 2,
          "spawnInterval": 0.67
        }
      ],
      "goal": "漏怪压力",
      "lingqiScale": 196.0,
      "isBossWave": false,
      "settlementLingstone": 60.0
    },
    {
      "wave": 12,
      "segments": [
        {
          "wave": 12,
          "enemyId": "enemy_armor_beast",
          "count": 10,
          "startDelay": 0,
          "spawnInterval": 0.64
        },
        {
          "wave": 12,
          "enemyId": "enemy_little_yao",
          "count": 20,
          "startDelay": 2,
          "spawnInterval": 0.64
        }
      ],
      "goal": "AOE测试",
      "lingqiScale": 260.0,
      "isBossWave": false,
      "settlementLingstone": 70.0
    },
    {
      "wave": 13,
      "segments": [
        {
          "wave": 13,
          "enemyId": "enemy_blood_cultivator",
          "count": 5,
          "startDelay": 0,
          "spawnInterval": 0.61
        },
        {
          "wave": 13,
          "enemyId": "enemy_swift_wolf",
          "count": 12,
          "startDelay": 2,
          "spawnInterval": 0.61
        }
      ],
      "goal": "精英压力",
      "lingqiScale": 224.0,
      "isBossWave": false,
      "settlementLingstone": 80.0
    },
    {
      "wave": 14,
      "segments": [
        {
          "wave": 14,
          "enemyId": "enemy_little_yao",
          "count": 20,
          "startDelay": 0,
          "spawnInterval": 0.35
        },
        {
          "wave": 14,
          "enemyId": "enemy_swift_wolf",
          "count": 12,
          "startDelay": 2,
          "spawnInterval": 0.45
        },
        {
          "wave": 14,
          "enemyId": "enemy_armor_beast",
          "count": 8,
          "startDelay": 4,
          "spawnInterval": 1.0
        },
        {
          "wave": 14,
          "enemyId": "enemy_blood_cultivator",
          "count": 5,
          "startDelay": 7,
          "spawnInterval": 1.5
        }
      ],
      "goal": "最终前压迫",
      "lingqiScale": 330.0,
      "isBossWave": false,
      "settlementLingstone": 100.0
    },
    {
      "wave": 15,
      "segments": [
        {
          "wave": 15,
          "enemyId": "boss_outer_demon",
          "count": 1,
          "startDelay": 0,
          "spawnInterval": 1
        },
        {
          "wave": 15,
          "enemyId": "enemy_little_yao",
          "count": 18,
          "startDelay": 3,
          "spawnInterval": 0.35
        },
        {
          "wave": 15,
          "enemyId": "enemy_swift_wolf",
          "count": 10,
          "startDelay": 5,
          "spawnInterval": 0.45
        },
        {
          "wave": 15,
          "enemyId": "enemy_armor_beast",
          "count": 5,
          "startDelay": 7,
          "spawnInterval": 1.1
        },
        {
          "wave": 15,
          "enemyId": "enemy_blood_cultivator",
          "count": 3,
          "startDelay": 9,
          "spawnInterval": 1.6
        }
      ],
      "goal": "最终Boss",
      "lingqiScale": 500.0,
      "isBossWave": false,
      "settlementLingstone": 250.0
    }
  ],
  "settlement": {
    "basePerWave": 10,
    "killFactor": 0.5,
    "bossBonus": {
      "5": 50,
      "10": 80,
      "15": 150
    },
    "victoryBonus": 200
  }
};
