window.GAME_DATA = {
  "sourceWorkbook": "守山门_新版角色肉鸽塔防_Codex开发表.xlsx",
  "config": {
    "displayName": "玄门镇妖录",
    "columns": 5,
    "rows": 6,
    "deployRows": [
      5
    ],
    "maxWaves": 15,
    "baseHp": 180,
    "arrayCore": {
      "maxHp": 180,
      "currentHp": 180,
      "defense": 2,
      "damageReductionRate": 0
    },
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
      "lu_qingya"
    ],
    "artifact": "qingming_sword_box",
    "artifacts": [
      "qingming_sword_box",
      "lihuo_gourd",
      "zhenmo_bell",
      "xuanbing_mirror",
      "leiwen_seal",
      "wandu_orb",
      "shanhe_seal",
      "xingyun_board",
      "guiyuan_banner",
      "zhanyao_blades"
    ]
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
    "qingming_sword_box": {
      "id": "qingming_sword_box",
      "name": "青冥剑匣",
      "rarity": "初始",
      "role": "飞剑弹道",
      "type": "projectile",
      "damage": 18.0,
      "cooldown": 3.5,
      "projectileType": "artifact_sword_projectile",
      "projectileCount": 1,
      "pierceCount": 1,
      "speed": 420,
      "hitRadius": 16,
      "targetRule": "nearest",
      "attackText": "每隔一段时间自动向最近敌人释放飞剑 projectile。",
      "description": "飞剑弹道型法宝，偏单体、穿透、补充弹道输出。"
    },
    "lihuo_gourd": {
      "id": "lihuo_gourd",
      "name": "离火葫芦",
      "rarity": "稀有",
      "role": "范围爆发",
      "type": "area",
      "damage": 14.0,
      "cooldown": 5.5,
      "areaRadius": 70,
      "targetRule": "densest_cluster",
      "attackText": "每隔一段时间向敌人密集区域释放离火爆裂，造成范围伤害。",
      "description": "范围爆发型法宝，偏群伤和清小怪。"
    },
    "zhenmo_bell": {
      "id": "zhenmo_bell",
      "name": "镇魔铃",
      "rarity": "稀有",
      "role": "削弱易伤",
      "type": "debuff_area",
      "damage": 6.0,
      "cooldown": 6.0,
      "areaRadius": 120,
      "vulnerableMultiplier": 1.18,
      "attackDamageMultiplier": 0.85,
      "debuffDuration": 3.0,
      "targetRule": "nearest_to_core",
      "attackText": "震慑靠近阵眼的敌人，使其进入破魔状态，受到伤害提高且攻击阵眼伤害降低。",
      "description": "削弱 / 易伤型法宝，不做减速主控场，专门压制阵前威胁。"
    },
    "xuanbing_mirror": {
      "id": "xuanbing_mirror",
      "name": "玄冰玉镜",
      "rarity": "史诗",
      "role": "冰霜控场",
      "type": "frost_area",
      "damage": 10.0,
      "cooldown": 6.0,
      "areaRadius": 85,
      "slowMultiplier": 0.55,
      "slowDuration": 1.6,
      "freezeChance": 0.15,
      "freezeDuration": 0.6,
      "targetRule": "densest_cluster",
      "attackText": "每隔一段时间向敌人密集区域释放寒霜镜光，对范围内敌人造成伤害并施加冰缓。",
      "description": "冰霜控场型法宝，偏减速、冻结、范围控制。"
    },
    "leiwen_seal": {
      "id": "leiwen_seal",
      "name": "雷纹法印",
      "rarity": "史诗",
      "role": "雷击连锁",
      "type": "chain",
      "damage": 16.0,
      "cooldown": 4.8,
      "chainCount": 3,
      "chainRadius": 90,
      "chainDamageMultiplier": 0.75,
      "targetRule": "highest_hp_or_nearest",
      "attackText": "每隔一段时间召下一道雷击命中一个敌人，并向附近敌人跳跃。",
      "description": "雷击连锁型法宝，偏跳跃伤害、打密集怪、补刀。"
    },
    "wandu_orb": {
      "id": "wandu_orb",
      "name": "万毒珠",
      "rarity": "史诗",
      "role": "持续伤害",
      "type": "poison_area",
      "damage": 6.0,
      "cooldown": 5.8,
      "areaRadius": 80,
      "poisonDamage": 4,
      "poisonDuration": 4.0,
      "poisonTickInterval": 1.0,
      "targetRule": "densest_cluster",
      "attackText": "向敌人密集区域释放毒雾，使范围内敌人中毒，持续扣血。",
      "description": "持续伤害型法宝，偏中毒、磨血、打高血量怪。"
    },
    "shanhe_seal": {
      "id": "shanhe_seal",
      "name": "山河印",
      "rarity": "史诗",
      "role": "重压控制",
      "type": "crush_area",
      "damage": 12.0,
      "cooldown": 7.0,
      "areaRadius": 95,
      "stunDuration": 0.4,
      "knockbackDistance": 20,
      "targetRule": "nearest_to_core",
      "attackText": "在敌人靠近阵眼时落下山河印，对范围内敌人造成伤害，并短暂停顿。",
      "description": "重压控制型法宝，偏压制、短暂停顿和范围打断。"
    },
    "xingyun_board": {
      "id": "xingyun_board",
      "name": "星陨棋盘",
      "rarity": "传说",
      "role": "随机落点",
      "type": "meteor",
      "damage": 10.0,
      "cooldown": 5.2,
      "meteorCount": 3,
      "areaRadius": 45,
      "targetRule": "random_enemies",
      "attackText": "每隔一段时间在多个敌人附近落下星陨，造成小范围伤害。",
      "description": "随机落点型法宝，偏持续覆盖、随机陨星和战场压制。"
    },
    "guiyuan_banner": {
      "id": "guiyuan_banner",
      "name": "归元灵幡",
      "rarity": "传说",
      "role": "回复增益",
      "type": "support",
      "heal": 18,
      "cooldown": 8.0,
      "targetRule": "array_core",
      "attackText": "周期性为护山阵眼回复生命。",
      "description": "回复 / 增益型法宝，偏阵眼续航和局内容错。"
    },
    "zhanyao_blades": {
      "id": "zhanyao_blades",
      "name": "斩妖飞刃",
      "rarity": "稀有",
      "role": "散射弹道",
      "type": "projectile",
      "damage": 9.0,
      "cooldown": 3.8,
      "projectileType": "artifact_blade_projectile",
      "projectileCount": 3,
      "pierceCount": 0,
      "speed": 460,
      "hitRadius": 12,
      "targetRule": "multiple_nearest",
      "attackText": "向多个不同敌人发射飞刃 projectile。",
      "description": "散射弹道型法宝，偏多目标、低伤高频、清残血。"
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
      "valueText": "最大HP+30，当前HP+30",
      "requirement": "无",
      "stackable": true,
      "note": "更新UI血条。",
      "effect": {
        "type": "array_hp_bonus",
        "value": 30
      }
    },
    {
      "id": "perk_array_defense",
      "name": "玄岳守势",
      "category": "阵眼防御",
      "rarity": "稀有",
      "target": "护山阵眼",
      "description": "护山阵眼防御提升。",
      "valueText": "防御+3",
      "requirement": "无",
      "stackable": true,
      "note": "用于验证阵眼防御成长。",
      "effect": {
        "type": "array_defense_bonus",
        "value": 3
      }
    },
    {
      "id": "perk_array_heal",
      "name": "灵泉回涌",
      "category": "阵眼防御",
      "rarity": "普通",
      "target": "护山阵眼",
      "description": "立即恢复护山阵眼生命。",
      "valueText": "恢复HP+50",
      "requirement": "无",
      "stackable": true,
      "note": "不超过阵眼最大生命。",
      "effect": {
        "type": "array_heal",
        "value": 50
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
      "hp": 28.0,
      "maxHp": 28.0,
      "speed": 1.0,
      "moveSpeed": 1.0,
      "baseDamage": 3.0,
      "attackDamage": 3.0,
      "attackInterval": 1.6,
      "spiritQiReward": 5.0,
      "lingqiReward": 5.0,
      "trait": "无",
      "note": "基础怪",
      "isBoss": false
    },
    "enemy_swift_wolf": {
      "id": "enemy_swift_wolf",
      "name": "疾行妖狼",
      "type": "快速",
      "hp": 22.0,
      "maxHp": 22.0,
      "speed": 1.6,
      "moveSpeed": 1.6,
      "baseDamage": 3.0,
      "attackDamage": 3.0,
      "attackInterval": 1.4,
      "spiritQiReward": 6.0,
      "lingqiReward": 6.0,
      "trait": "速度快",
      "note": "测试漏怪压力",
      "isBoss": false
    },
    "enemy_armor_beast": {
      "id": "enemy_armor_beast",
      "name": "玄甲巨兽",
      "type": "坦克",
      "hp": 90.0,
      "maxHp": 90.0,
      "speed": 0.65,
      "moveSpeed": 0.65,
      "baseDamage": 7.0,
      "attackDamage": 7.0,
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
      "hp": 120.0,
      "maxHp": 120.0,
      "speed": 0.85,
      "moveSpeed": 0.85,
      "baseDamage": 8.0,
      "attackDamage": 8.0,
      "attackInterval": 2.0,
      "spiritQiReward": 22.0,
      "lingqiReward": 22.0,
      "trait": "每6秒短暂加速",
      "note": "精英压力",
      "isBoss": false
    },
    "boss_blackwind": {
      "id": "boss_blackwind",
      "name": "黑风妖将",
      "type": "Boss",
      "hp": 450.0,
      "maxHp": 450.0,
      "speed": 0.5,
      "moveSpeed": 0.5,
      "baseDamage": 12.0,
      "attackDamage": 12.0,
      "attackInterval": 2.5,
      "spiritQiReward": 80.0,
      "lingqiReward": 80.0,
      "trait": "每8秒召唤3只山野小妖",
      "note": "第5波",
      "isBoss": true
    },
    "boss_bloodlotus": {
      "id": "boss_bloodlotus",
      "name": "血莲魔修",
      "type": "Boss",
      "hp": 900.0,
      "maxHp": 900.0,
      "speed": 0.5,
      "moveSpeed": 0.5,
      "baseDamage": 18.0,
      "attackDamage": 18.0,
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
      "baseDamage": 24.0,
      "attackDamage": 24.0,
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
          "startDelay": 4,
          "spawnInterval": 0.85
        },
        {
          "wave": 5,
          "enemyId": "enemy_little_yao",
          "count": 8,
          "startDelay": 0,
          "spawnInterval": 0.85
        },
        {
          "wave": 5,
          "enemyId": "enemy_swift_wolf",
          "count": 4,
          "startDelay": 1.5,
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

window.GAME_DATA.characterRarity = {
  SR: "SR",
  SSR: "SSR",
  UR: "UR",
  SP: "SP"
};

window.GAME_DATA.playerLevelUnlocks = [
  { level: 1, type: "character", characterId: "lu_qingya", description: "初始角色：陆青崖" },
  { level: 3, type: "character", characterId: "shen_lianxing", description: "解锁角色：沈炼星" },
  { level: 5, type: "character", characterId: "ye_hanyan", description: "解锁角色：叶寒烟" },
  { level: 10, type: "character", characterId: "wen_suyi", description: "解锁角色：温素衣" },
  { level: 15, type: "character", characterId: "gu_changfeng", description: "解锁角色：顾长风" },
  { level: 25, type: "character", characterId: "xiao_jingxuan", description: "解锁角色：萧景玄" }
];

window.GAME_DATA.deploySlotUnlocks = [
  { level: 1, deploySlots: 1, description: "初始可上阵1名角色" },
  { level: 10, deploySlots: 2, description: "玩家10级解锁第2个上阵位" },
  { level: 20, deploySlots: 3, description: "玩家20级解锁第3个上阵位" }
];

window.GAME_DATA.artifactSlotUnlocks = [
  { level: 1, artifactSlots: 1, description: "初始可携带1件法宝" },
  { level: 5, artifactSlots: 2, description: "玩家5级解锁第2个法宝位" },
  { level: 10, artifactSlots: 3, description: "玩家10级解锁第3个法宝位" },
  { level: 20, artifactSlots: 4, description: "玩家20级解锁第4个法宝位" },
  { level: 30, artifactSlots: 5, description: "玩家30级解锁第5个法宝位" }
];

window.GAME_DATA.roles = {
  lu_qingya: {
    id: "lu_qingya",
    name: "陆青崖",
    rarity: "SR",
    rankTitle: "外门弟子",
    rank: "外门弟子",
    school: "剑修",
    role: "单体输出",
    baseDamage: 12,
    baseAttackSpeed: 1.0,
    attackInterval: 1.0,
    baseRange: 4,
    range: 4,
    projectileType: "flying_sword",
    projectile: "single",
    trajectoryType: "single",
    passiveSkill: null,
    unlockType: "player_level",
    unlockLevel: 1,
    level: 1,
    upgradeCost: 150,
    description: "青衫负剑的外门弟子，攻击稳定，是玩家最初的守阵之人。",
    designValue: "基础单体输出，前期稳定，后期可通过剑修机缘变成低费高频组件。"
  },
  shen_lianxing: {
    id: "shen_lianxing",
    name: "沈炼星",
    rarity: "SR",
    rankTitle: "内门弟子",
    rank: "内门弟子",
    school: "火修",
    role: "小范围伤害",
    baseDamage: 10,
    baseAttackSpeed: 0.85,
    attackInterval: 1.176,
    baseRange: 4,
    range: 4,
    projectileType: "fire_talisman",
    projectile: "splash",
    trajectoryType: "splash",
    passiveSkill: null,
    unlockType: "player_level",
    unlockLevel: 3,
    level: 1,
    upgradeCost: 150,
    description: "擅使火符的内门弟子，攻击命中后造成小范围溅射。",
    designValue: "提供早期AOE能力，用来处理堆积在大阵前的小怪。"
  },
  ye_hanyan: {
    id: "ye_hanyan",
    name: "叶寒烟",
    rarity: "SR",
    rankTitle: "内门弟子",
    rank: "内门弟子",
    school: "冰修",
    role: "减速控制",
    baseDamage: 7,
    baseAttackSpeed: 0.9,
    attackInterval: 1.111,
    baseRange: 4,
    range: 4,
    projectileType: "frost_bolt",
    projectile: "slow",
    trajectoryType: "slow",
    passiveSkill: "frost_slow",
    unlockType: "player_level",
    unlockLevel: 5,
    level: 1,
    upgradeCost: 150,
    description: "修行寒霜术的内门弟子，攻击可减缓妖兽行动。",
    designValue: "伤害不高，但能延缓怪物抵达阵前，适合所有阵容。"
  },
  wen_suyi: {
    id: "wen_suyi",
    name: "温素衣",
    rarity: "SSR",
    rankTitle: "核心弟子",
    rank: "核心弟子",
    school: "毒修",
    role: "持续伤害",
    baseDamage: 6,
    baseAttackSpeed: 1.0,
    attackInterval: 1.0,
    baseRange: 4,
    range: 4,
    projectileType: "poison_needle",
    projectile: "poison",
    trajectoryType: "poison",
    passiveSkill: "poison_stack",
    unlockType: "player_level",
    unlockLevel: 10,
    level: 1,
    upgradeCost: 240,
    description: "性情冷淡的核心弟子，擅长以毒蚀敌。",
    designValue: "对高血量怪物和Boss有价值，靠持续伤害而不是爆发。"
  },
  gu_changfeng: {
    id: "gu_changfeng",
    name: "顾长风",
    rarity: "SSR",
    rankTitle: "执事",
    rank: "执事",
    school: "剑修",
    role: "纵向穿透",
    baseDamage: 16,
    baseAttackSpeed: 0.75,
    attackInterval: 1.333,
    baseRange: 5,
    range: 5,
    projectileType: "sword_wave",
    projectile: "vertical",
    trajectoryType: "vertical",
    passiveSkill: "pierce_bonus",
    unlockType: "player_level",
    unlockLevel: 15,
    level: 1,
    upgradeCost: 240,
    description: "宗门执事，剑气沉稳，一剑可贯穿前方妖潮。",
    designValue: "专门处理同一列压线怪物，适合怪物堆积到attackLineY的战斗结构。"
  },
  xiao_jingxuan: {
    id: "xiao_jingxuan",
    name: "萧景玄",
    rarity: "SSR",
    rankTitle: "长老",
    rank: "长老",
    school: "雷修",
    role: "连锁伤害",
    baseDamage: 14,
    baseAttackSpeed: 0.7,
    attackInterval: 1.429,
    baseRange: 5,
    range: 5,
    projectileType: "thunder_arc",
    projectile: "chain",
    trajectoryType: "chain",
    passiveSkill: "thunder_chain",
    unlockType: "player_level",
    unlockLevel: 25,
    level: 1,
    upgradeCost: 240,
    description: "掌雷法的宗门长老，雷弧可在妖兽之间跳跃。",
    designValue: "对密集敌人有强收益，是后期清潮核心。"
  },
  qin_bugui: {
    id: "qin_bugui",
    name: "秦不归",
    rarity: "SSR",
    rankTitle: "核心弟子",
    rank: "核心弟子",
    school: "枪修",
    role: "横向扫击",
    baseDamage: 13,
    baseAttackSpeed: 0.8,
    attackInterval: 1.25,
    baseRange: 4,
    range: 4,
    projectileType: "spear_arc",
    projectile: "horizontal",
    trajectoryType: "horizontal",
    passiveSkill: "horizontal_cleave",
    unlockType: "gacha",
    unlockLevel: null,
    level: 1,
    upgradeCost: 240,
    description: "白袍执枪的核心弟子，枪芒横扫，可压制横向妖潮。",
    designValue: "横向弹道角色，和纵向剑修形成不同站位价值。"
  },
  luo_shenyin: {
    id: "luo_shenyin",
    name: "洛神音",
    rarity: "SSR",
    rankTitle: "执事",
    rank: "执事",
    school: "音修",
    role: "群体削弱",
    baseDamage: 8,
    baseAttackSpeed: 0.65,
    attackInterval: 1.538,
    baseRange: 5,
    range: 5,
    projectileType: "sound_wave",
    projectile: "horizontal",
    trajectoryType: "horizontal",
    passiveSkill: "weaken_enemy_attack",
    unlockType: "gacha",
    unlockLevel: null,
    level: 1,
    upgradeCost: 240,
    description: "以琴音御敌的宗门执事，可削弱敌人攻击。",
    designValue: "不是纯输出，能降低怪物攻击阵眼的压力。"
  },
  chu_zhaoye: {
    id: "chu_zhaoye",
    name: "楚照夜",
    rarity: "UR",
    rankTitle: "长老",
    rank: "长老",
    school: "暗修",
    role: "斩杀收割",
    baseDamage: 22,
    baseAttackSpeed: 0.65,
    attackInterval: 1.538,
    baseRange: 5,
    range: 5,
    projectileType: "shadow_blade",
    projectile: "execute",
    trajectoryType: "execute",
    passiveSkill: "execute_low_hp",
    unlockType: "gacha",
    unlockLevel: null,
    level: 1,
    upgradeCost: 360,
    description: "行踪难测的宗门长老，擅斩将破阵。",
    designValue: "专门处理残血精英和Boss阶段，不负责清小怪。"
  },
  ning_jiuxiao: {
    id: "ning_jiuxiao",
    name: "宁九霄",
    rarity: "UR",
    rankTitle: "宗主",
    rank: "宗主",
    school: "万法",
    role: "全局增幅",
    baseDamage: 18,
    baseAttackSpeed: 0.6,
    attackInterval: 1.667,
    baseRange: 5,
    range: 5,
    projectileType: "dao_light",
    projectile: "multi",
    trajectoryType: "multi",
    passiveSkill: "global_formation_boost",
    unlockType: "gacha",
    unlockLevel: null,
    level: 1,
    upgradeCost: 360,
    description: "宗门之主，万法归一，可增强全队与护山大阵。",
    designValue: "机制型角色，不只是高伤害，能提升阵容整体强度。"
  }
};

window.GAME_DATA.characters = window.GAME_DATA.roles;

(() => {
  const formations = {
    taiyi_zhenyao_array: {
      id: "taiyi_zhenyao_array",
      name: "太乙镇妖阵",
      rarity: "初始",
      role: "通用压制 / 阵前伤害",
      triggerType: "interval",
      triggerInterval: 4.5,
      targetRule: "nearest_to_core",
      areaRadius: 120,
      damage: 16,
      effectType: "formation_area_damage",
      effectText: "每隔一段时间，对靠近护山大阵的敌人造成一次阵法伤害。",
      description: "适合新手，稳定减压。",
    },
    qinglian_huiyuan_array: {
      id: "qinglian_huiyuan_array",
      name: "青莲回元阵",
      rarity: "初始",
      role: "阵眼回复 / 容错",
      triggerType: "interval",
      triggerInterval: 6.0,
      heal: 14,
      lowHpThreshold: 0.35,
      lowHpHealMultiplier: 1.8,
      effectType: "formation_heal_core",
      effectText: "每隔一段时间回复阵眼生命，低血时回复量提升。",
      description: "防守型阵法，适合容错。",
    },
    xuanbing_chiyao_array: {
      id: "xuanbing_chiyao_array",
      name: "玄冰迟妖阵",
      rarity: "稀有",
      role: "减速控线",
      triggerType: "interval",
      triggerInterval: 5.5,
      areaRule: "lower_lane",
      areaRadius: 150,
      damage: 6,
      slowMultiplier: 0.65,
      slowDuration: 2.0,
      effectType: "formation_slow_area",
      effectText: "周期性对妖兽行进区下半段敌人施加冰缓。",
      description: "适合控制怪物推进节奏。",
    },
    lihuo_fenyao_array: {
      id: "lihuo_fenyao_array",
      name: "离火焚妖阵",
      rarity: "稀有",
      role: "范围灼烧 / 清小怪",
      triggerType: "interval",
      triggerInterval: 5.0,
      targetRule: "densest_cluster",
      areaRadius: 85,
      damage: 12,
      burnDamage: 4,
      burnDuration: 2.5,
      effectType: "formation_burn_area",
      effectText: "周期性在敌人密集区域生成离火阵纹，造成范围伤害并附加短暂灼烧。",
      description: "适合清理密集小怪。",
    },
    leigang_zhuxie_array: {
      id: "leigang_zhuxie_array",
      name: "雷罡诛邪阵",
      rarity: "史诗",
      role: "精英压制 / 高血目标",
      triggerType: "interval",
      triggerInterval: 5.8,
      targetRule: "highest_hp",
      damage: 18,
      chainCount: 2,
      chainRadius: 90,
      chainDamageMultiplier: 0.7,
      effectType: "formation_chain_lightning",
      effectText: "周期性对当前血量最高的敌人降下雷罡，并向附近敌人跳跃。",
      description: "适合打精英怪和高血量怪。",
    },
    shanhe_guyuan_array: {
      id: "shanhe_guyuan_array",
      name: "山河固元阵",
      rarity: "史诗",
      role: "阵眼减伤 / 阵前压制",
      passiveCoreDamageReduction: 0.12,
      triggerType: "interval",
      triggerInterval: 7.0,
      targetRule: "nearest_to_core",
      areaRadius: 110,
      damage: 10,
      slowMultiplier: 0.7,
      slowDuration: 1.5,
      effectType: "formation_core_damage_reduction",
      effectText: "阵眼受到伤害降低，并周期性对靠近阵眼的敌人产生山河压制。",
      description: "防守和阵前压制兼具。",
    },
    xingdou_juling_array: {
      id: "xingdou_juling_array",
      name: "星斗聚灵阵",
      rarity: "传说",
      role: "灵气获取 / 成长加速",
      spiritQiGainMultiplier: 1.12,
      triggerType: "interval",
      triggerInterval: 8.0,
      bonusSpiritQi: 8,
      effectType: "formation_spirit_qi_bonus",
      effectText: "击杀敌人获得的灵气提升，并周期性额外获得少量灵气。",
      description: "偏成长流，前期风险更高，但升级更快。",
    },
    wanjian_hushan_array: {
      id: "wanjian_hushan_array",
      name: "万剑护山阵",
      rarity: "传说",
      role: "阵眼反击 / 飞剑支援",
      triggerType: "interval",
      triggerInterval: 4.8,
      projectileType: "formation_sword_projectile",
      projectileCount: 3,
      damage: 10,
      pierceCount: 1,
      targetRule: "nearest_to_core",
      effectType: "formation_projectile_burst",
      effectText: "每隔一段时间，从护山大阵中释放数道阵法剑气，攻击靠近阵眼的敌人。",
      description: "表现上像护山大阵主动出剑，适合仙侠感。",
    },
  };
  window.GAME_DATA.formations = formations;
  window.GAME_DATA.initial.formation = "taiyi_zhenyao_array";
  window.GAME_DATA.initial.formations = Object.keys(formations);
})();

window.GAME_DATA.martialArts = [
  {
    id: "ma_qingya_sword",
    name: "青崖剑诀",
    ownerCharacterId: "lu_qingya",
    maxLevel: 7,
    projectileType: "flying_sword",
    trajectoryType: "single",
    levels: [
      { level: 1, title: "剑气初成", evolutionType: "growth", effectType: "damage_mult", value: 0.2, description: "陆青崖剑气伤害+20%。" },
      { level: 2, title: "剑气凝形", evolutionType: "growth", effectType: "sword_qi_refine", value: 1, description: "剑气速度+15%，伤害+10%。" },
      { level: 3, title: "双锋并起", evolutionType: "minor_evolution", effectType: "projectile_set", value: 2, description: "小成：每次攻击发射2道剑气，副剑气70%伤害。" },
      { level: 4, title: "三脉分光", evolutionType: "growth", effectType: "qingya_stage_4", value: 1, description: "每次攻击至少发射3道剑气，伤害+20%，攻击间隔-10%，并获得穿透+1。" },
      { level: 5, title: "剑雨连发", evolutionType: "growth", effectType: "qingya_stage_5", value: 1, description: "每次攻击发射4道剑气，攻击间隔总降幅更明显，新增剑气不降低单发伤害。" },
      { level: 6, title: "五剑成阵", evolutionType: "growth", effectType: "qingya_stage_6", value: 1, description: "每次攻击发射5道剑气，伤害额外+40%，剑气穿透再+1，新增剑气不降低单发伤害。" },
      { level: 7, title: "青崖巨阙", evolutionType: "major_evolution", effectType: "qingya_giant_sword", value: 1, description: "大成：多剑气进化为巨型飞剑，伤害*10，穿透6，命中大范围震荡溅射，对精英和Boss额外增伤。" }
    ]
  },
  {
    id: "ma_lianxing_fire",
    name: "炼星火符",
    ownerCharacterId: "shen_lianxing",
    maxLevel: 7,
    projectileType: "fire_talisman",
    trajectoryType: "splash",
    levels: [
      { level: 1, title: "符火温养", evolutionType: "growth", effectType: "damage_mult", value: 0.12, description: "火符伤害提升12%。" },
      { level: 2, title: "火势外扩", evolutionType: "growth", effectType: "splash_radius", value: 0.15, description: "溅射范围提升15%。" },
      { level: 3, title: "星火分裂", evolutionType: "minor_evolution", effectType: "splash_shards", value: 2, description: "小进化：命中后分裂小火星，灼伤附近敌人。" },
      { level: 4, title: "符速提升", evolutionType: "growth", effectType: "attack_speed", value: 0.1, description: "攻击频率提升10%。" },
      { level: 5, title: "烈火连环", evolutionType: "growth", effectType: "damage_mult", value: 0.18, description: "火符伤害再提升18%。" },
      { level: 6, title: "燃痕留阵", evolutionType: "growth", effectType: "burn_on_hit", value: 3, description: "命中附加短暂燃烧。" },
      { level: 7, title: "星陨符雨", evolutionType: "major_evolution", effectType: "meteor_rain", value: 3, description: "大进化：攻击时额外落下符雨打击附近敌人。" }
    ]
  },
  {
    id: "ma_hanyan_frost",
    name: "寒烟冰魄诀",
    ownerCharacterId: "ye_hanyan",
    maxLevel: 7,
    projectileType: "frost_bolt",
    trajectoryType: "slow",
    levels: [
      { level: 1, title: "寒意入刃", evolutionType: "growth", effectType: "damage_mult", value: 0.1, description: "冰魄伤害提升10%。" },
      { level: 2, title: "冰魄迟滞", evolutionType: "growth", effectType: "slow_bonus", value: 0.1, description: "减速效果提升。" },
      { level: 3, title: "霜爆微澜", evolutionType: "minor_evolution", effectType: "slow_splash", value: 0.45, description: "小进化：命中后对附近敌人造成减速溅射。" },
      { level: 4, title: "凝霜速发", evolutionType: "growth", effectType: "attack_speed", value: 0.12, description: "攻击频率提升12%。" },
      { level: 5, title: "寒线延展", evolutionType: "growth", effectType: "range_add", value: 0.5, description: "射程提升0.5格。" },
      { level: 6, title: "冰魄再凝", evolutionType: "growth", effectType: "damage_mult", value: 0.18, description: "冰魄伤害再提升18%。" },
      { level: 7, title: "阵前霜封", evolutionType: "major_evolution", effectType: "freeze_attack_line", value: 0.55, description: "大进化：攻击有概率冻结阵前敌人。" }
    ]
  },
  {
    id: "ma_suyi_poison",
    name: "素衣万毒经",
    ownerCharacterId: "wen_suyi",
    maxLevel: 7,
    projectileType: "poison_needle",
    trajectoryType: "poison",
    levels: [
      { level: 1, title: "毒针淬炼", evolutionType: "growth", effectType: "damage_mult", value: 0.12, description: "毒针伤害提升12%。" },
      { level: 2, title: "毒息绵长", evolutionType: "growth", effectType: "poison_duration", value: 1, description: "中毒持续时间提升1秒。" },
      { level: 3, title: "毒针弹射", evolutionType: "minor_evolution", effectType: "chain_add", value: 1, description: "小进化：毒针会弹射1次。" },
      { level: 4, title: "针影急行", evolutionType: "growth", effectType: "attack_speed", value: 0.12, description: "攻击频率提升12%。" },
      { level: 5, title: "蚀骨毒劲", evolutionType: "growth", effectType: "dot_mult", value: 0.25, description: "毒伤提升25%。" },
      { level: 6, title: "万毒穿心", evolutionType: "growth", effectType: "projectile_add", value: 1, description: "额外发射1枚毒针。" },
      { level: 7, title: "毒雾归墟", evolutionType: "major_evolution", effectType: "poison_fog_on_death", value: 1, description: "大进化：中毒敌人死亡时生成毒雾。" }
    ]
  },
  {
    id: "ma_changfeng_pierce",
    name: "长风贯云诀",
    ownerCharacterId: "gu_changfeng",
    maxLevel: 7,
    projectileType: "sword_wave",
    trajectoryType: "vertical",
    levels: [
      { level: 1, title: "贯云初式", evolutionType: "growth", effectType: "damage_mult", value: 0.12, description: "贯穿剑气伤害提升12%。" },
      { level: 2, title: "剑势更远", evolutionType: "growth", effectType: "pierce_add", value: 1, description: "额外穿透1名敌人。" },
      { level: 3, title: "剑痕留影", evolutionType: "minor_evolution", effectType: "sword_trail", value: 1, description: "小进化：剑气路径留下剑痕持续伤害。" },
      { level: 4, title: "长风疾行", evolutionType: "growth", effectType: "attack_speed", value: 0.1, description: "攻击频率提升10%。" },
      { level: 5, title: "贯穿再深", evolutionType: "growth", effectType: "pierce_add", value: 1, description: "再次提升穿透目标数。" },
      { level: 6, title: "剑浪加重", evolutionType: "growth", effectType: "damage_mult", value: 0.2, description: "贯穿剑气伤害再提升20%。" },
      { level: 7, title: "三列贯云", evolutionType: "major_evolution", effectType: "vertical_columns", value: 3, description: "大进化：三列贯穿剑气覆盖阵前。" }
    ]
  },
  {
    id: "ma_bugui_spear",
    name: "不归枪诀",
    ownerCharacterId: "qin_bugui",
    maxLevel: 7,
    projectileType: "spear_arc",
    trajectoryType: "horizontal",
    levels: [
      { level: 1, title: "枪芒初振", evolutionType: "growth", effectType: "damage_mult", value: 0.12, description: "枪芒伤害提升12%。" },
      { level: 2, title: "横扫更疾", evolutionType: "growth", effectType: "attack_speed", value: 0.1, description: "攻击频率提升10%。" },
      { level: 3, title: "枪围拓展", evolutionType: "minor_evolution", effectType: "horizontal_width", value: 2, description: "小进化：横向扫击范围扩大。" },
      { level: 4, title: "破阵枪势", evolutionType: "growth", effectType: "damage_mult", value: 0.18, description: "枪芒伤害再提升18%。" },
      { level: 5, title: "扫击加深", evolutionType: "growth", effectType: "horizontal_width", value: 1, description: "横向命中目标数提升。" },
      { level: 6, title: "枪影连发", evolutionType: "growth", effectType: "projectile_add", value: 1, description: "额外发射一道枪芒。" },
      { level: 7, title: "全横排枪芒", evolutionType: "major_evolution", effectType: "full_row_spear", value: 1, description: "大进化：横扫覆盖整排阵前敌人。" }
    ]
  },
  {
    id: "ma_jingxuan_thunder",
    name: "景玄引雷诀",
    ownerCharacterId: "xiao_jingxuan",
    maxLevel: 7,
    projectileType: "thunder_arc",
    trajectoryType: "chain",
    levels: [
      { level: 1, title: "雷弧淬体", evolutionType: "growth", effectType: "damage_mult", value: 0.12, description: "雷弧伤害提升12%。" },
      { level: 2, title: "雷弧再跃", evolutionType: "growth", effectType: "chain_add", value: 1, description: "额外弹射1次。" },
      { level: 3, title: "麻痹雷痕", evolutionType: "minor_evolution", effectType: "paralyze", value: 0.35, description: "小进化：雷弧命中可短暂麻痹敌人。" },
      { level: 4, title: "引雷更疾", evolutionType: "growth", effectType: "attack_speed", value: 0.1, description: "攻击频率提升10%。" },
      { level: 5, title: "雷势扩散", evolutionType: "growth", effectType: "chain_add", value: 1, description: "再次增加弹射次数。" },
      { level: 6, title: "雷霆加身", evolutionType: "growth", effectType: "damage_mult", value: 0.2, description: "雷弧伤害再提升20%。" },
      { level: 7, title: "天雷诛邪", evolutionType: "major_evolution", effectType: "boss_priority_lightning", value: 1, description: "大进化：天雷优先命中精英或Boss。" }
    ]
  }
];

(() => {
  const arts = window.GAME_DATA.martialArts;
  const replaceByOwner = (art) => {
    const index = arts.findIndex((item) => item.ownerCharacterId === art.ownerCharacterId);
    if (index >= 0) arts[index] = art;
    else arts.push(art);
  };
  const level = (n, title, upgradeType, effectType, value, description, effects = []) => ({
    level: n,
    title,
    upgradeType,
    evolutionType: upgradeType === "minor_evolution" || upgradeType === "major_evolution" ? upgradeType : "growth",
    effectType,
    value,
    description,
    effects,
  });
  replaceByOwner({
    id: "lianxing_fire_talisman",
    name: "炼星火符",
    ownerCharacterId: "shen_lianxing",
    maxLevel: 7,
    projectileType: "fire_talisman",
    trajectoryType: "splash",
    levels: [
      level(1, "符火初成", "baseline", "none", 0, "炼星火符初始形态。"),
      level(2, "符火增炽", "refine_upgrade", "martial_art_damage_mult", 0.25, "炼星火符伤害提升25%。"),
      level(3, "余焰不灭", "minor_evolution", "martial_art_burning_zone", 1, "火符爆裂后留下短暂余焰区域，对范围内敌人造成小额持续伤害。"),
      level(4, "连符并发", "branch_upgrade", "martial_art_projectile_count_add", 1, "每波额外发射1枚火符。"),
      level(5, "爆符扩散", "branch_upgrade", "martial_art_area_mult", 0.2, "火符爆裂范围提升20%。"),
      level(6, "符势连环", "branch_upgrade", "martial_art_volley_count_add", 1, "一次攻击连续多发射1波火符。"),
      level(7, "星火燎原", "major_evolution", "martial_art_major_firestorm", 1, "释放多枚大型火符，对敌人密集区域造成连续爆裂伤害。", [
        { effectType: "martial_art_damage_mult", value: 0.25 },
        { effectType: "martial_art_area_mult", value: 0.25 },
        { effectType: "martial_art_volley_count_add", value: 2 },
      ]),
    ],
  });
  replaceByOwner({
    id: "hanyan_frost_art",
    name: "寒烟冰诀",
    ownerCharacterId: "ye_hanyan",
    maxLevel: 7,
    projectileType: "frost_bolt",
    trajectoryType: "slow",
    levels: [
      level(1, "寒烟初凝", "baseline", "none", 0, "寒烟冰诀初始形态。"),
      level(2, "寒霜入骨", "refine_upgrade", "martial_art_damage_mult", 0.25, "寒烟冰诀伤害提升25%。"),
      level(3, "霜痕蔓延", "minor_evolution", "martial_art_slow_splash", 0.45, "被霜弹命中的敌人附近会受到一次轻微冰缓扩散。"),
      level(4, "霜弹并发", "branch_upgrade", "martial_art_projectile_count_add", 1, "每波额外发射1枚霜弹。"),
      level(5, "冰意绵长", "refine_upgrade", "martial_art_slow_duration_add", 0.8, "冰缓持续时间提升0.8秒。"),
      level(6, "寒域扩散", "branch_upgrade", "martial_art_area_mult", 0.2, "霜弹影响范围提升20%。"),
      level(7, "霜天封妖", "major_evolution", "martial_art_major_freeze", 1, "释放大范围霜寒冲击，对敌群造成伤害并强力减速或短暂冻结。", [
        { effectType: "martial_art_area_mult", value: 0.35 },
        { effectType: "martial_art_slow_duration_add", value: 1.2 },
        { effectType: "martial_art_damage_mult", value: 0.25 },
      ]),
    ],
  });
  replaceByOwner({
    id: "suyi_poison_art",
    name: "素衣毒经",
    ownerCharacterId: "wen_suyi",
    maxLevel: 7,
    projectileType: "poison_needle",
    trajectoryType: "poison",
    levels: [
      level(1, "毒经初识", "baseline", "none", 0, "素衣毒经初始形态。"),
      level(2, "毒息入骨", "refine_upgrade", "martial_art_damage_mult", 0.25, "素衣毒经伤害提升25%。"),
      level(3, "百毒侵身", "minor_evolution", "martial_art_poison_stack_bonus", 1, "中毒敌人再次被毒针命中时，会刷新中毒时间并小幅提高毒伤。"),
      level(4, "毒针连发", "branch_upgrade", "martial_art_projectile_count_add", 1, "每波额外发射1枚毒针。"),
      level(5, "毒入经脉", "refine_upgrade", "martial_art_poison_duration_add", 1, "中毒持续时间提升1秒。"),
      level(6, "蚀骨毒息", "refine_upgrade", "martial_art_poison_damage_mult", 0.25, "中毒伤害提升25%。"),
      level(7, "万毒归藏", "major_evolution", "martial_art_major_poison_fog", 1, "释放毒针雨，并在敌人密集区域形成毒雾，持续造成伤害。", [
        { effectType: "martial_art_projectile_count_add", value: 2 },
        { effectType: "martial_art_poison_damage_mult", value: 0.35 },
        { effectType: "martial_art_poison_duration_add", value: 2 },
      ]),
    ],
  });
  replaceByOwner({
    id: "changfeng_sword_wave",
    name: "长风剑诀",
    ownerCharacterId: "gu_changfeng",
    maxLevel: 7,
    projectileType: "sword_wave",
    trajectoryType: "vertical",
    levels: [
      level(1, "长风初起", "baseline", "none", 0, "长风剑诀初始形态。"),
      level(2, "剑势增锋", "refine_upgrade", "martial_art_damage_mult", 0.25, "长风剑诀伤害提升25%。"),
      level(3, "剑风回荡", "minor_evolution", "martial_art_sword_trail", 1, "剑波穿透敌人后伤害衰减降低，纵向清线能力提升。"),
      level(4, "剑波穿阵", "branch_upgrade", "martial_art_pierce_add", 1, "剑波穿透 +1。"),
      level(5, "纵剑成潮", "branch_upgrade", "martial_art_projectile_count_add", 1, "每波额外释放1道纵向剑波。"),
      level(6, "风起连斩", "branch_upgrade", "martial_art_volley_count_add", 1, "一次攻击连续多释放1波剑波。"),
      level(7, "长风万里", "major_evolution", "martial_art_major_vertical_wave", 1, "释放一道巨大的纵向剑潮，贯穿多名敌人并造成高额伤害。", [
        { effectType: "martial_art_damage_mult", value: 0.35 },
        { effectType: "martial_art_pierce_add", value: 2 },
        { effectType: "martial_art_width_mult", value: 0.25 },
      ]),
    ],
  });
  replaceByOwner({
    id: "jingxuan_thunder_art",
    name: "景玄雷法",
    ownerCharacterId: "xiao_jingxuan",
    maxLevel: 7,
    projectileType: "thunder_arc",
    trajectoryType: "chain",
    levels: [
      level(1, "雷法初鸣", "baseline", "none", 0, "景玄雷法初始形态。"),
      level(2, "雷威加深", "refine_upgrade", "martial_art_damage_mult", 0.25, "景玄雷法伤害提升25%。"),
      level(3, "雷引残妖", "minor_evolution", "martial_art_execute_threshold_add", 0.05, "雷击更容易跳向低血敌人，提高补刀能力。"),
      level(4, "雷走群妖", "branch_upgrade", "martial_art_chain_count_add", 1, "雷击连锁次数 +1。"),
      level(5, "引雷入阵", "branch_upgrade", "martial_art_chain_radius_mult", 0.2, "雷击连锁范围提升20%。"),
      level(6, "灵雷自转", "refine_upgrade", "martial_art_attack_interval_mult", 0.9, "景玄雷法攻击间隔降低10%。"),
      level(7, "九霄雷狱", "major_evolution", "martial_art_major_thunder_prison", 1, "连续释放多道雷击，在敌群中反复跳跃。", [
        { effectType: "martial_art_chain_count_add", value: 3 },
        { effectType: "martial_art_damage_mult", value: 0.3 },
        { effectType: "martial_art_chain_radius_mult", value: 0.3 },
      ]),
    ],
  });
  replaceByOwner({
    id: "bugui_spear_art",
    name: "不归枪诀",
    ownerCharacterId: "qin_bugui",
    maxLevel: 7,
    projectileType: "spear_arc",
    trajectoryType: "horizontal",
    levels: [
      level(1, "枪势初成", "baseline", "none", 0, "不归枪诀初始形态。"),
      level(2, "枪势加深", "refine_upgrade", "martial_art_damage_mult", 0.25, "不归枪诀伤害提升25%。"),
      level(3, "破阵枪势", "minor_evolution", "martial_art_splash_on_hit", 0.25, "枪影命中敌人时，对横向附近敌人造成少量溅射伤害。"),
      level(4, "横扫群妖", "branch_upgrade", "martial_art_width_mult", 0.2, "枪势横扫范围提升20%。"),
      level(5, "枪影并起", "branch_upgrade", "martial_art_projectile_count_add", 1, "每波额外释放1道枪影。"),
      level(6, "枪势连环", "branch_upgrade", "martial_art_volley_count_add", 1, "一次攻击连续多释放1波枪影。"),
      level(7, "横扫千军", "major_evolution", "martial_art_major_full_row", 1, "释放大范围横向枪芒，扫击一整片敌人。", [
        { effectType: "martial_art_width_mult", value: 0.4 },
        { effectType: "martial_art_damage_mult", value: 0.3 },
      ]),
    ],
  });
  replaceByOwner({
    id: "shenyin_sound_art",
    name: "洛神天音",
    ownerCharacterId: "luo_shenyin",
    maxLevel: 7,
    projectileType: "sound_wave",
    trajectoryType: "horizontal",
    levels: [
      level(1, "天音初起", "baseline", "none", 0, "洛神天音初始形态。"),
      level(2, "清音破妖", "refine_upgrade", "martial_art_damage_mult", 0.25, "洛神天音伤害提升25%。"),
      level(3, "余音绕阵", "minor_evolution", "martial_art_sound_splash_debuff", 1, "音波命中后，会对附近敌人附加短暂削弱。"),
      level(4, "余音扩散", "branch_upgrade", "martial_art_area_mult", 0.2, "音波影响范围提升20%。"),
      level(5, "摄魂清律", "refine_upgrade", "martial_art_vulnerable_mult", 0.15, "被音波影响的敌人受到伤害提升。"),
      level(6, "镇魄余响", "refine_upgrade", "martial_art_debuff_duration_add", 0.8, "音波削弱持续时间提升0.8秒。"),
      level(7, "万籁镇妖", "major_evolution", "martial_art_major_sound_domain", 1, "释放大范围镇妖天音，使敌人大幅易伤并降低攻击阵眼伤害。", [
        { effectType: "martial_art_area_mult", value: 0.35 },
        { effectType: "martial_art_vulnerable_mult", value: 0.2 },
        { effectType: "martial_art_debuff_duration_add", value: 1.2 },
      ]),
    ],
  });
  replaceByOwner({
    id: "zhaoye_shadow_art",
    name: "昭夜影诀",
    ownerCharacterId: "chu_zhaoye",
    maxLevel: 7,
    projectileType: "shadow_blade",
    trajectoryType: "execute",
    levels: [
      level(1, "影诀初现", "baseline", "none", 0, "昭夜影诀初始形态。"),
      level(2, "刃影加深", "refine_upgrade", "martial_art_damage_mult", 0.25, "昭夜影诀伤害提升25%。"),
      level(3, "追魂刃影", "minor_evolution", "martial_art_chase_on_kill", 1, "影刃击杀敌人后，额外追击附近低血敌人一次。"),
      level(4, "影刃连发", "branch_upgrade", "martial_art_projectile_count_add", 1, "每波额外释放1枚影刃。"),
      level(5, "追魂寻隙", "branch_upgrade", "martial_art_execute_threshold_add", 0.05, "影刃更容易斩杀低血敌人。"),
      level(6, "夜行无声", "refine_upgrade", "martial_art_attack_interval_mult", 0.9, "昭夜影诀攻击间隔降低10%。"),
      level(7, "夜尽千刃", "major_evolution", "martial_art_major_shadow_blades", 1, "释放大量影刃追击多个低血敌人，适合快速收割残血怪。", [
        { effectType: "martial_art_projectile_count_add", value: 4 },
        { effectType: "martial_art_damage_mult", value: 0.3 },
        { effectType: "martial_art_execute_threshold_add", value: 0.1 },
      ]),
    ],
  });
  replaceByOwner({
    id: "jiuxiao_dao_art",
    name: "九霄万法",
    ownerCharacterId: "ning_jiuxiao",
    maxLevel: 7,
    projectileType: "dao_light",
    trajectoryType: "multi",
    levels: [
      level(1, "万法初明", "baseline", "none", 0, "九霄万法初始形态。"),
      level(2, "道光增辉", "refine_upgrade", "martial_art_damage_mult", 0.25, "九霄万法伤害提升25%。"),
      level(3, "道域初成", "minor_evolution", "martial_art_team_damage_aura", 0.05, "宁九霄在场时，所有上阵角色获得轻微伤害加成。"),
      level(4, "万法并照", "branch_upgrade", "martial_art_projectile_count_add", 1, "每波额外释放1道道光。"),
      level(5, "道域加持", "refine_upgrade", "martial_art_team_damage_aura", 0.08, "宁九霄在场时，上阵角色伤害小幅提升。"),
      level(6, "灵机运转", "refine_upgrade", "martial_art_attack_interval_mult", 0.9, "九霄万法攻击间隔降低10%。"),
      level(7, "九霄道域", "major_evolution", "martial_art_major_dao_domain", 1, "展开九霄道域，周期性强化全体上阵角色，并释放多道道光攻击敌人。", [
        { effectType: "martial_art_team_damage_aura", value: 0.12 },
        { effectType: "martial_art_projectile_count_add", value: 3 },
        { effectType: "martial_art_debuff_duration_add", value: 1 },
      ]),
    ],
  });
  const evolved = (id, title, effectType, value, description) => ({
    id,
    title,
    upgradeType: "evolved_upgrade",
    effectType,
    value,
    description,
  });
  const addEvolvedUpgrades = (ownerCharacterId, upgrades) => {
    const art = arts.find((item) => item.ownerCharacterId === ownerCharacterId);
    if (art) art.evolvedUpgrades = upgrades;
  };
  addEvolvedUpgrades("shen_lianxing", [
    evolved("lianxing_major_area", "火势蔓延", "martial_art_area_mult", 0.2, "星火燎原爆裂范围提升。"),
    evolved("lianxing_major_damage", "赤焰加深", "martial_art_damage_mult", 0.25, "星火燎原伤害提升。"),
    evolved("lianxing_major_burn", "余火连绵", "martial_art_slow_duration_add", 0.6, "星火燎原余焰持续时间提升。"),
  ]);
  addEvolvedUpgrades("ye_hanyan", [
    evolved("hanyan_major_area", "寒域扩张", "martial_art_area_mult", 0.2, "霜天封妖范围提升。"),
    evolved("hanyan_major_freeze", "冰封延长", "martial_art_slow_duration_add", 0.8, "霜天封妖冻结或强减速时间提升。"),
    evolved("hanyan_major_damage", "寒伤加深", "martial_art_damage_mult", 0.25, "霜天封妖伤害提升。"),
  ]);
  addEvolvedUpgrades("wen_suyi", [
    evolved("suyi_major_area", "毒雾扩散", "martial_art_area_mult", 0.2, "万毒归藏毒雾范围提升。"),
    evolved("suyi_major_poison_damage", "毒伤加深", "martial_art_poison_damage_mult", 0.25, "万毒归藏毒伤提升。"),
    evolved("suyi_major_poison_duration", "毒留不散", "martial_art_poison_duration_add", 1.2, "万毒归藏毒雾持续时间提升。"),
  ]);
  addEvolvedUpgrades("gu_changfeng", [
    evolved("changfeng_major_damage", "剑潮加深", "martial_art_damage_mult", 0.25, "长风万里伤害提升。"),
    evolved("changfeng_major_pierce", "贯阵无阻", "martial_art_pierce_add", 1, "长风万里穿透提升。"),
    evolved("changfeng_major_width", "剑势延展", "martial_art_width_mult", 0.2, "长风万里剑潮宽度提升。"),
  ]);
  addEvolvedUpgrades("xiao_jingxuan", [
    evolved("jingxuan_major_chain_count", "雷数增加", "martial_art_chain_count_add", 1, "九霄雷狱雷击次数提升。"),
    evolved("jingxuan_major_damage", "雷威加深", "martial_art_damage_mult", 0.25, "九霄雷狱伤害提升。"),
    evolved("jingxuan_major_chain_radius", "雷域扩张", "martial_art_chain_radius_mult", 0.2, "九霄雷狱连锁范围提升。"),
  ]);
  addEvolvedUpgrades("qin_bugui", [
    evolved("bugui_major_width", "枪芒扩张", "martial_art_width_mult", 0.2, "横扫千军横扫范围提升。"),
    evolved("bugui_major_damage", "枪势加深", "martial_art_damage_mult", 0.25, "横扫千军伤害提升。"),
    evolved("bugui_major_splash", "破阵余威", "martial_art_area_mult", 0.2, "横扫千军溅射伤害范围提升。"),
  ]);
  addEvolvedUpgrades("luo_shenyin", [
    evolved("shenyin_major_area", "音域扩张", "martial_art_area_mult", 0.2, "万籁镇妖范围提升。"),
    evolved("shenyin_major_vulnerable", "破妖加深", "martial_art_vulnerable_mult", 0.12, "万籁镇妖易伤提升。"),
    evolved("shenyin_major_duration", "镇魄延长", "martial_art_debuff_duration_add", 0.8, "万籁镇妖持续时间提升。"),
  ]);
  addEvolvedUpgrades("chu_zhaoye", [
    evolved("zhaoye_major_blade_count", "刃数增加", "martial_art_projectile_count_add", 1, "夜尽千刃影刃数量提升。"),
    evolved("zhaoye_major_damage", "斩妖锋芒", "martial_art_damage_mult", 0.25, "夜尽千刃伤害提升。"),
    evolved("zhaoye_major_chase", "追魂更疾", "martial_art_chase_on_kill", 1, "夜尽千刃追击次数提升。"),
  ]);
  addEvolvedUpgrades("ning_jiuxiao", [
    evolved("jiuxiao_major_aura", "道域扩张", "martial_art_team_damage_aura", 0.05, "九霄道域增益强度提升。"),
    evolved("jiuxiao_major_light_count", "万法齐鸣", "martial_art_projectile_count_add", 1, "九霄道域道光数量提升。"),
    evolved("jiuxiao_major_duration", "灵机不绝", "martial_art_debuff_duration_add", 0.8, "九霄道域增益持续时间提升。"),
  ]);
  const roleVisualTypes = {
    lu_qingya: "projectile",
    shen_lianxing: "projectile_area_burst",
    ye_hanyan: "projectile_slow_area",
    wen_suyi: "projectile_poison_dot",
    gu_changfeng: "vertical_sweep",
    xiao_jingxuan: "chain_lightning",
    qin_bugui: "horizontal_sweep",
    luo_shenyin: "wave_debuff",
    chu_zhaoye: "shadow_dash",
    ning_jiuxiao: "dao_light_aura",
  };
  Object.entries(roleVisualTypes).forEach(([roleId, visualType]) => {
    if (window.GAME_DATA.roles?.[roleId]) window.GAME_DATA.roles[roleId].visualType = visualType;
  });
  const artifactVisualTypes = {
    qingming_sword_box: "projectile_sword",
    lihuo_gourd: "area_fire_burst",
    zhenmo_bell: "aura_debuff",
    xuanbing_mirror: "area_frost",
    leiwen_seal: "chain_lightning",
    wandu_orb: "poison_cloud",
    shanhe_seal: "impact_seal",
    xingyun_board: "meteor_random",
    guiyuan_banner: "heal_aura",
    zhanyao_blades: "multi_blade_projectile",
  };
  Object.entries(artifactVisualTypes).forEach(([artifactId, visualType]) => {
    if (window.GAME_DATA.artifacts?.[artifactId]) window.GAME_DATA.artifacts[artifactId].visualType = visualType;
  });
})();

(() => {
  const enemies = {
    redmane_fiend: {
      id: "redmane_fiend",
      name: "赤鬃獠",
      type: "normal",
      attackMode: "melee",
      hp: 32,
      maxHp: 32,
      moveSpeed: 42,
      attackDamage: 6,
      baseDamage: 6,
      attackInterval: 1.2,
      spiritQiReward: 8,
      lingqiReward: 8,
      hitRadius: 18,
      trait: "基础兽妖",
      note: "基础推进单位。",
      isBoss: false,
    },
    shadow_hound: {
      id: "shadow_hound",
      name: "掠影猲",
      type: "fast",
      attackMode: "melee",
      hp: 24,
      maxHp: 24,
      moveSpeed: 68,
      attackDamage: 5,
      baseDamage: 5,
      attackInterval: 1.1,
      spiritQiReward: 9,
      lingqiReward: 9,
      hitRadius: 16,
      trait: "高速突袭",
      note: "移动快，血量低。",
      isBoss: false,
    },
    gloom_arrow_hound: {
      id: "gloom_arrow_hound",
      name: "幽箭猲",
      type: "ranged",
      attackMode: "ranged",
      hp: 36,
      maxHp: 36,
      moveSpeed: 36,
      attackDamage: 5,
      baseDamage: 5,
      attackInterval: 1.5,
      rangedAttackDamage: 7,
      rangedAttackInterval: 2.0,
      rangedStopOffset: 150,
      rangedProjectileType: "demon_bolt",
      rangedProjectileSpeed: 320,
      spiritQiReward: 13,
      lingqiReward: 13,
      hitRadius: 17,
      trait: "远程幽箭",
      note: "停在阵眼前方一段距离，发射幽箭攻击阵眼。",
      isBoss: false,
    },
    ironhide_xiao: {
      id: "ironhide_xiao",
      name: "铁甲魈",
      type: "armored",
      attackMode: "melee",
      hp: 80,
      maxHp: 80,
      moveSpeed: 30,
      attackDamage: 8,
      baseDamage: 8,
      attackInterval: 1.4,
      spiritQiReward: 14,
      lingqiReward: 14,
      hitRadius: 22,
      armor: 3,
      trait: "厚甲肉盾",
      note: "高血、低速、少量护甲。",
      isBoss: false,
    },
    rending_claw: {
      id: "rending_claw",
      name: "裂爪獠",
      type: "array_attacker",
      attackMode: "melee",
      hp: 45,
      maxHp: 45,
      moveSpeed: 45,
      attackDamage: 11,
      baseDamage: 11,
      attackInterval: 1.0,
      spiritQiReward: 12,
      lingqiReward: 12,
      hitRadius: 18,
      trait: "阵眼攻击",
      note: "抵达阵前后阵眼压力更高。",
      isBoss: false,
    },
    dark_talisman_shaman: {
      id: "dark_talisman_shaman",
      name: "幽符巫",
      type: "support",
      attackMode: "caster",
      hp: 38,
      maxHp: 38,
      moveSpeed: 34,
      attackDamage: 4,
      baseDamage: 4,
      attackInterval: 1.4,
      spiritQiReward: 15,
      lingqiReward: 15,
      hitRadius: 18,
      abilityCooldown: 6.2,
      casterStopOffset: 170,
      supportRadius: 100,
      hasteMultiplier: 0.22,
      hasteDuration: 2.0,
      trait: "妖符辅助",
      note: "周期性为附近妖物施加加速。",
      isBoss: false,
    },
    miasma_mirage: {
      id: "miasma_mirage",
      name: "腐瘴蜃",
      type: "miasma",
      attackMode: "melee",
      hp: 42,
      maxHp: 42,
      moveSpeed: 38,
      attackDamage: 7,
      baseDamage: 7,
      attackInterval: 1.2,
      spiritQiReward: 13,
      lingqiReward: 13,
      hitRadius: 18,
      miasmaRadius: 80,
      miasmaDuration: 3.0,
      trait: "死亡腐瘴",
      note: "死亡后留下短暂腐瘴表现。",
      isBoss: false,
    },
    array_devouring_moth: {
      id: "array_devouring_moth",
      name: "噬阵螟",
      type: "array_breaker",
      attackMode: "melee",
      hp: 60,
      maxHp: 60,
      moveSpeed: 35,
      attackDamage: 13,
      baseDamage: 13,
      attackInterval: 1.3,
      spiritQiReward: 16,
      lingqiReward: 16,
      hitRadius: 20,
      defensePierceRatio: 0.32,
      trait: "啃噬阵纹",
      note: "攻击阵眼时部分无视阵眼防御。",
      isBoss: false,
    },
    redmane_demon_general: {
      id: "redmane_demon_general",
      name: "赤鬃妖将",
      type: "elite",
      attackMode: "elite",
      hp: 165,
      maxHp: 165,
      moveSpeed: 32,
      attackDamage: 16,
      baseDamage: 16,
      attackInterval: 1.4,
      spiritQiReward: 35,
      lingqiReward: 35,
      hitRadius: 26,
      isElite: true,
      isBoss: false,
      abilities: [
        {
          id: "redmane_demon_armor",
          type: "demon_armor",
          cooldown: 6.0,
          duration: 2.2,
          params: { damageReduction: 0.3 },
        },
      ],
      abilityCooldown: 6.0,
      armorStateDuration: 2.2,
      damageReductionDuringArmor: 0.3,
      trait: "精英妖甲",
      note: "周期性进入妖甲减伤状态，但不会无敌。",
    },
    bone_talisman_witch: {
      id: "bone_talisman_witch",
      name: "骨符祭巫",
      type: "caster",
      attackMode: "caster",
      hp: 52,
      maxHp: 52,
      moveSpeed: 30,
      attackDamage: 4,
      baseDamage: 4,
      attackInterval: 1.6,
      casterStopOffset: 180,
      abilityCooldown: 6.0,
      spiritQiReward: 18,
      lingqiReward: 18,
      hitRadius: 18,
      curseDamage: 8,
      arrayCoreDefenseDown: 0.15,
      curseDuration: 4.0,
      trait: "骨符蚀阵",
      note: "远程施放骨符，对阵眼造成轻压并短暂削弱阵眼防御。",
      isBoss: false,
    },
    black_gate_guardian: {
      id: "black_gate_guardian",
      name: "黑渊门将",
      type: "boss",
      attackMode: "boss",
      hp: 900,
      maxHp: 900,
      moveSpeed: 28,
      attackDamage: 20,
      baseDamage: 20,
      attackInterval: 1.8,
      spiritQiReward: 120,
      lingqiReward: 120,
      hitRadius: 30,
      isBoss: true,
      bossId: "black_gate_guardian",
      phase: 1,
      phaseThresholds: [0.7, 0.4],
      skills: [],
      skillCooldowns: {},
      bossBarName: "黑渊门将",
      trait: "妖门守卫",
      note: "Boss框架预留，第一关前10波不启用。",
    },
  };

  Object.assign(window.GAME_DATA.enemies, enemies, {
    enemy_little_yao: { ...enemies.redmane_fiend, id: "enemy_little_yao" },
    enemy_swift_wolf: { ...enemies.shadow_hound, id: "enemy_swift_wolf" },
    enemy_armor_beast: { ...enemies.ironhide_xiao, id: "enemy_armor_beast" },
    enemy_blood_cultivator: { ...enemies.dark_talisman_shaman, id: "enemy_blood_cultivator" },
    boss_blackwind: { ...enemies.redmane_demon_general, id: "boss_blackwind", isElite: true, isBoss: false },
  });

  const waveTemplates = {
    1: {
      goal: "赤鬃初潮",
      segments: [
        { enemyId: "redmane_fiend", count: 6, startDelay: 0, spawnInterval: 1.08 },
      ],
      lingqiScale: 48,
      settlementLingstone: 10,
    },
    2: {
      goal: "掠影试阵",
      segments: [
        { enemyId: "redmane_fiend", count: 6, startDelay: 0, spawnInterval: 1.05 },
        { enemyId: "shadow_hound", count: 2, startDelay: 2.4, spawnInterval: 1.2 },
      ],
      lingqiScale: 66,
      settlementLingstone: 15,
    },
    3: {
      goal: "铁甲压线",
      segments: [
        { enemyId: "redmane_fiend", count: 6, startDelay: 0, spawnInterval: 1.0 },
        { enemyId: "ironhide_xiao", count: 1, startDelay: 3.2, spawnInterval: 2.2 },
      ],
      lingqiScale: 62,
      settlementLingstone: 20,
    },
    4: {
      goal: "裂爪临阵",
      segments: [
        { enemyId: "shadow_hound", count: 4, startDelay: 0, spawnInterval: 1.05 },
        { enemyId: "rending_claw", count: 2, startDelay: 2.2, spawnInterval: 1.35 },
      ],
      lingqiScale: 60,
      settlementLingstone: 25,
    },
    5: {
      goal: "赤鬃妖将",
      segments: [
        { enemyId: "redmane_fiend", count: 6, startDelay: 0, spawnInterval: 1.0 },
        { enemyId: "ironhide_xiao", count: 1, startDelay: 2.8, spawnInterval: 2.0 },
        { enemyId: "redmane_demon_general", count: 1, startDelay: 5.2, spawnInterval: 1.0 },
      ],
      lingqiScale: 97,
      settlementLingstone: 60,
    },
    6: {
      goal: "幽符助妖",
      segments: [
        { enemyId: "redmane_fiend", count: 6, startDelay: 0, spawnInterval: 0.95 },
        { enemyId: "shadow_hound", count: 2, startDelay: 2.2, spawnInterval: 1.15 },
        { enemyId: "dark_talisman_shaman", count: 1, startDelay: 4.0, spawnInterval: 3.0 },
      ],
      lingqiScale: 81,
      settlementLingstone: 35,
    },
    7: {
      goal: "腐瘴留形",
      segments: [
        { enemyId: "redmane_fiend", count: 5, startDelay: 0, spawnInterval: 0.95 },
        { enemyId: "miasma_mirage", count: 2, startDelay: 2.2, spawnInterval: 1.7 },
        { enemyId: "shadow_hound", count: 2, startDelay: 4.8, spawnInterval: 1.05 },
      ],
      lingqiScale: 83,
      settlementLingstone: 40,
    },
    8: {
      goal: "噬阵初现",
      segments: [
        { enemyId: "redmane_fiend", count: 4, startDelay: 0, spawnInterval: 0.95 },
        { enemyId: "ironhide_xiao", count: 2, startDelay: 1.6, spawnInterval: 1.9 },
        { enemyId: "gloom_arrow_hound", count: 2, startDelay: 3.2, spawnInterval: 1.6 },
        { enemyId: "array_devouring_moth", count: 1, startDelay: 5.4, spawnInterval: 2.0 },
      ],
      lingqiScale: 108,
      settlementLingstone: 45,
    },
    9: {
      goal: "群妖混潮",
      segments: [
        { enemyId: "redmane_fiend", count: 4, startDelay: 0, spawnInterval: 0.9 },
        { enemyId: "shadow_hound", count: 2, startDelay: 1.0, spawnInterval: 0.9 },
        { enemyId: "gloom_arrow_hound", count: 2, startDelay: 1.8, spawnInterval: 1.4 },
        { enemyId: "rending_claw", count: 2, startDelay: 2.2, spawnInterval: 1.2 },
        { enemyId: "dark_talisman_shaman", count: 1, startDelay: 4.0, spawnInterval: 3.0 },
        { enemyId: "miasma_mirage", count: 1, startDelay: 5.0, spawnInterval: 1.5 },
      ],
      lingqiScale: 118,
      settlementLingstone: 50,
    },
    10: {
      goal: "破阵合围",
      segments: [
        { enemyId: "redmane_fiend", count: 4, startDelay: 0, spawnInterval: 0.85 },
        { enemyId: "redmane_demon_general", count: 1, startDelay: 1.8, spawnInterval: 1.0 },
        { enemyId: "ironhide_xiao", count: 2, startDelay: 2.8, spawnInterval: 1.8 },
        { enemyId: "array_devouring_moth", count: 2, startDelay: 4.8, spawnInterval: 2.1 },
        { enemyId: "bone_talisman_witch", count: 1, startDelay: 6.2, spawnInterval: 2.8 },
      ],
      lingqiScale: 149,
      settlementLingstone: 90,
    },
  };

  (window.GAME_DATA.waves || []).forEach((wave) => {
    const template = waveTemplates[wave.wave];
    if (!template) return;
    wave.goal = template.goal;
    wave.segments = template.segments.map((segment) => ({ wave: wave.wave, ...segment }));
    wave.lingqiScale = template.lingqiScale;
    wave.settlementLingstone = template.settlementLingstone;
    wave.isBossWave = false;
  });
})();

window.GAME_DATA.perks.push(
  {
    id: "perk_sword_school_damage",
    name: "剑意精进",
    rarity: "普通",
    scope: "character",
    effectType: "character_damage_bonus",
    targetSchool: "剑修",
    description: "剑修角色伤害提升。",
    valueText: "剑修伤害+25%",
    stackable: true,
    effect: { type: "role_damage_mult", value: 0.25 }
  },
  {
    id: "perk_frost_slow_bonus",
    name: "寒霜入骨",
    rarity: "普通",
    scope: "character",
    effectType: "slow_bonus",
    targetSchool: "冰修",
    description: "冰修控制效果增强。",
    valueText: "控制时间+20%",
    stackable: true,
    effect: { type: "control_bonus", value: 0.2 }
  },
  {
    id: "perk_poison_spread_bonus",
    name: "毒雾蔓延",
    rarity: "普通",
    scope: "character",
    effectType: "poison_spread",
    targetSchool: "毒修",
    description: "毒修持续伤害更容易扩散。",
    valueText: "毒持续+1秒",
    stackable: true,
    effect: { type: "poison_duration_add", value: 1 }
  },
  {
    id: "perk_artifact_resonance",
    name: "法宝共鸣",
    rarity: "普通",
    scope: "artifact",
    effectType: "artifact_damage_bonus",
    description: "已携带法宝伤害提升。",
    valueText: "法宝伤害+25%",
    stackable: true,
    effect: { type: "artifact_damage_bonus", value: 0.25 }
  },
  {
    id: "perk_vertical_projectile_plus",
    name: "剑气纵横",
    rarity: "稀有",
    scope: "trajectory",
    effectType: "projectile_vertical_plus",
    targetTrajectoryType: "vertical",
    description: "纵向弹道额外穿透。",
    valueText: "穿透+1",
    stackable: true,
    effect: { type: "pierce_add", value: 1 }
  },
  {
    id: "perk_passive_insight",
    name: "被动顿悟",
    rarity: "稀有",
    scope: "character",
    effectType: "passive_skill_bonus",
    requiresPassiveSkill: true,
    description: "拥有被动的出战角色效果增强。",
    valueText: "被动倍率+25%",
    stackable: true,
    effect: { type: "passive_skill_bonus", value: 0.25 }
  }
);
