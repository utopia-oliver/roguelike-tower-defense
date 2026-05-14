window.XM = window.XM || {};

window.XM.Constants = window.XM.Constants || {
  APP_STATE: Object.freeze({
    LOBBY: "LOBBY",
    LOADOUT: "LOADOUT",
    DEPLOY: "DEPLOY",
    BATTLE: "BATTLE",
    LEVEL_UP_REWARD: "LEVEL_UP_REWARD",
    SETTLEMENT: "SETTLEMENT",
  }),

  ENEMY_STATE: Object.freeze({
    MOVING: "MOVING",
    ATTACKING: "ATTACKING",
    DEAD: "DEAD",
  }),

  colors: Object.freeze({
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
    redmane_fiend: "#b2563c",
    shadow_hound: "#d0c56c",
    ironhide_xiao: "#7f8794",
    rending_claw: "#ef4444",
    dark_talisman_shaman: "#b88cff",
    miasma_mirage: "#84cc16",
    array_devouring_moth: "#fb7185",
    redmane_demon_general: "#dc6b38",
    剑修: "#d7e1ec",
    火修: "#ef7b45",
    冰修: "#72c8ee",
    毒修: "#a97ad8",
    雷修: "#c4b5fd",
    枪修: "#d6b36a",
    音修: "#f0abfc",
    暗修: "#a78bfa",
    万法: "#facc15",
  }),

  rarityWeight: Object.freeze({
    "普通": 70,
    "稀有": 24,
    "史诗": 8,
    "传说": 2,
  }),

  CHARACTER_RARITY: Object.freeze({
    SR: "SR",
    SSR: "SSR",
    UR: "UR",
    SP: "SP",
  }),

  GACHA_COST: 200,
  DUPLICATE_GACHA_REFUND: 50,
  PLAYER_PROFILE_STORAGE_KEY: "xuanmen_player_profile",
  DEBUG_STORAGE_KEY: "xuanmen_debug_runtime",
  DEBUG_OVERRIDES_KEY: "xuanmen_debug_overrides",
  DEBUG_TABS: Object.freeze(["状态", "角色", "先天武学", "机缘 / 升级候选", "怪物", "波次", "法宝", "护山大阵"]),
};
