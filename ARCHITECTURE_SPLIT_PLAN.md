# 玄门镇妖录拆分前审计与计划

本文件只记录拆分前审计和拆分计划。当前步骤不拆分、不重构、不修改游戏逻辑。

## 一、当前文件结构

- `index.html`
  - 单页 HTML 入口。
  - 定义大厅、战前配置、战斗、结算、机缘弹窗、开发者调试面板的 DOM 结构。
  - 当前通过普通 `<script>` 顺序加载 `data/game-data.js` 和 `src/game.js`。

- `data/game-data.js`
  - 数据入口，向 `window.GAME_DATA` 写入配置、角色、怪物、波次、法宝、护山大阵、机缘、玩家等级解锁等静态数据。
  - 当前既是运行时数据源，也是调试覆盖恢复的基础数据源。

- `src/game.js`
  - 当前主游戏文件，承载状态机、局内/局外状态、角色、弹道、怪物、波次、法宝、护山大阵、先天武学、升级候选、UI 渲染、开发者调试面板、存档和浏览器测试接口。
  - 文件过大，多个系统共享同一作用域，修改任一系统都容易触及无关上下文。

- `src/styles.css`
  - 页面、战斗 HUD、卡片、选择列表、弹窗、开发者调试面板等全部样式。
  - 当前未拆分 CSS，仍适合暂时保持单文件。

- `scripts/browser_flow_test.js`
  - Node 脚本，启动无头浏览器，通过 Chrome DevTools Protocol 驱动游戏流程。
  - 验收内容包括进入战斗、灵气升级、机缘选择、动画继续、怪物攻击阵眼、控制台错误检查。

- `scripts/export_excel_data.py`
  - 从 Excel 工作簿读取并归一化配置数据，输出 `data/game-data.js`。
  - 属于离线数据生成脚本，不参与浏览器运行时。

- `PROJECT_CONTEXT.md`
  - 项目规则和阶段性任务约束。
  - 明确护山大阵/阵眼不可拆成两个区域、局内只产出灵气、基础攻击应以 projectile 为主、当前阶段只做小步骤。

- `ARCHITECTURE_SPLIT_PLAN.md`
  - 当前文件。记录拆分计划，不参与运行。

## 二、`src/game.js` 内部模块审计

### 1. 状态机相关

- 常量：`APP_STATE`、`ENEMY_STATE`
- 视图切换：`showView`
- 流程入口：`enterLoadout`、`enterDeploy`、`startRun`、`endGame`
- 主循环：`loop`、`update`、`draw`
- 战斗阶段状态：`state.appState`、`state.phase`、`state.running`、`state.paused`、`state.gameOver`

### 2. runState / playerProfile 初始化

- 局内状态容器：`state`
- 局外玩家档案：`playerMeta`
- 初始化和同步：`defaultRunBonuses`、`syncPlayerMetaAliases`、`resetGame`
- 阵眼初始状态：`baseArrayCoreMaxHp`、`baseArrayCoreDefense`、`initialArrayCoreState`、`initializeArrayCoreForRun`、`syncBaseHpAliases`
- 玩家等级/槽位：`getPlayerLevelExpRequirement`、`getMaxDeploySlots`、`getNextCharacterUnlock`、`getNextDeploySlotUnlock`、`applyPlayerLevelUnlocks`、`checkPlayerLevelUp`

### 3. localStorage 保存读取

- 当前显式调试存储：`DEBUG_STORAGE_KEY`、`DEBUG_OVERRIDES_KEY`、`loadDebugOverrides`、`saveDebugData`、`resetDebugData`、`resetLocalSaveWithConfirm`
- 数据覆盖与恢复：`createEmptyDebugOverrides`、`normalizeDebugOverrides`、`applyDebugOverridesToData`、`refreshRuntimeFromDebugData`
- 目前未看到完整玩家存档模块化边界，局外数据主要保存在内存 `playerMeta`，后续若补正式存档，应进入 `storage.js`。

### 4. 角色选择 / 部署

- 局外角色：`grantCharacter`、`getCharacterLevel`、`getFlatDamageGrowthByRarity`、`getPercentGrowthByRarity`、`getCharacterBaseFinalDamage`、`getCharacterUpgradeCost`、`upgradeCharacter`
- 抽卡：`drawGachaRarity`、`performGacha`
- 战前选择：`loadoutReady`、`enterLoadout`、`enterDeploy`
- 部署：`isDeployable`、`cellCenter`、`roleAt`、`deployRole`
- 战斗更新：`roleStats`、`updateRole`、`fireRole`、`chooseTarget`

### 5. projectile 弹道系统

- 弹道默认参数：`projectileDefaults`
- 发射：`fireProjectileAttack`、`createRoleProjectiles`、`projectileSpreadAngles`、`getPredictedTargetPosition`
- 命中和伤害：`applyRoleHit`、`checkProjectileCollision`、`checkProjectileHitEnemy`
- 目标辅助：`sideTargets`、`horizontalTargets`、`enemiesBehind`、`nearestEnemies`
- 更新：`updateProjectiles`
- 渲染：`drawProjectile`、`drawShot`
- 碰撞数学：`distancePointToSegment`、`distance`

### 6. 先天武学系统

- 绑定和等级：`martialArtForCharacter`、`getMartialArtLevelForRole`
- 通用加成：`getScopedModifier`、`getMartialArtModifier`、`martialLevelEffects`、`martialBonuses`
- 青崖剑诀分支数据：`QINGYA_BRANCH_UPGRADES`
- 分支状态和参数：`getMartialBranchState`、`hasMartialBranchUpgrade`、`qingyaAttackParamsFromBranches`
- 分支可用性和加成：`qingyaBranchUpgradeAvailable`、`applyQingyaBranchBonuses`
- 调试等级：`setQingyaDebugLevel`

### 7. 升级候选生成和过滤

- 候选入口：`showPerkChoices`、`enterLevelUpReward`、`drawPerks`、`drawPerksFiltered`
- 当前运行对象：`currentRunCharacters`、`selectedArtifactIds`
- 候选创建：`createMartialArtPerk`、`createQingyaBranchPerk`、`createQingyaBranchPerks`
- 候选来源：`currentMartialArtUpgradePerks`、`currentTargetedMartialPerks`、`currentTrajectoryPerks`、`artifactPerksForRun`、`defensivePerksForRun`
- 归一化和过滤：`normalizePerk`、`hasForbiddenGenericText`、`perkUpgradeWeight`、`isPerkValidForCurrentRun`、`fillWithGenericPerks`、`perkSpecificity`、`perkEffectKey`、`dedupePerks`
- 调试说明：`getDisabledUpgradeReason`、`getDisabledPerkReason`、`getQingyaUpgradeInvalidReason`、`getPerkInvalidReason`

### 8. applyPerk / applyUpgrade 类函数

- 选择入口：`chooseLevelUpPerk`
- 应用入口：`applyPerk`
- 兜底升级：`applyTargetedFallbackUpgrade`
- 相关辅助：`hasPassiveRole`、`getPerkTargetId`、`hasExplicitPerkTarget`
- 当前没有独立 `applyUpgrade` 命名函数，青崖分支升级通过 `applyPerk` 和 `state.martialArtBranches` 等状态完成。

### 9. 怪物系统

- 怪物类：`Enemy`
- 生成：`startWave` 中创建 spawnJobs，`update` 中按 spawnJobs 创建 `new Enemy`
- 移动/攻击：`Enemy.update`、`Enemy.enterAttackMode`、`Enemy.attackArrayCore`
- 受击/状态：`Enemy.takeDamage`、`Enemy.addStatus`、`Enemy.hasStatus`、`Enemy.updateStatuses`
- 特殊能力：`Enemy.useAbility`
- 阵眼伤害：`damageArrayCore`
- 渲染：`drawEnemy`

### 10. 波次系统

- 初始化：`startWave`
- 更新推进：`update`
- 跳波调试：`jumpToWave`
- 波次调试表：`getDebugWaveRows`
- 结算相关：`calculateSettlement`、`calculatePlayerExp`、`endGame`

### 11. 法宝系统

- 修正器：`getArtifactModifier`
- 运行更新：`updateArtifact`
- 候选：`artifactPerksForRun`
- 运行选择：`selectedArtifactIds`
- 调试表：`getDebugArtifactRows`
- UI：`renderLoadout`、`renderSetupLists`

### 12. 护山大阵系统

- 阵眼基础属性：`baseArrayCoreMaxHp`、`baseArrayCoreDefense`、`initialArrayCoreState`
- 攻击线和阵眼区域：`attackLineY`
- 阵法更新：`updateFormation`
- 范围伤害：`areaDamage`
- 阵眼受击：`damageArrayCore`
- 回满调试：`healArrayCoreFull`
- 渲染：`drawFormationArea`
- 调试表：`getDebugArrayCoreRows`、`getDebugFormationRows`

### 13. 开发者调试面板

- 状态：`activeDebugTab`、`debugEditMode`、`debugExportOpen`、`debugContentDirty`、`debugOverrides`、`debugValidationErrors`
- 数据覆盖：`deepClone`、`mergeObject`、`applyCollectionOverrides`、`applyDebugOverridesToData`、`refreshRuntimeFromDebugData`
- 表格渲染：`safeText`、`formatDebugValue`、`debugTable`、`debugEditableCell`、`debugEditableTable`
- 输入处理：`parseDebugValue`、`validateDebugValue`、`setDebugOverrideValue`、`handleDebugFieldChange`、`syncDebugFieldsFromDom`
- 面板渲染：`renderDebugTabs`、`renderDebugActions`、`renderDebugContent`、`renderDebugNotice`、`renderDebugValidation`、`updateDebugPanel`
- 动作：`runDebugAction`、`applyDebugOverridesForRun`、`exportDebugJson`、`copyDebugRow`、`copyDebugText`
- 调试行数据：`getDebugSnapshot`、`getDebugStateRows`、`getDebugRoleRows`、`getDebugMartialRows`、`getDebugUpgradeRows`、`getDebugPerkRows`、`getDebugEnemyRows`、`getDebugWaveRows`、`getDebugFormationRows`
- 浏览器测试接口：`getDebugActions`、`window.__SHOUSHANMEN_DEBUG__`、`window.__SHOUSHANMEN_ACTIONS__`

### 14. UI 渲染

- 大厅：`renderLobby`
- 战前配置：`renderLoadout`
- 布阵侧栏：`renderSetupLists`
- HUD 和整体视图：`updateUi`
- 机缘弹窗：`showPerkChoices`
- 结算：`endGame`
- Canvas：`draw`、`drawGrid`、`drawFormationArea`、`drawRole`、`drawEnemy`、`drawProjectile`、`drawZone`、`drawFloater`、`drawBossBar`
- DOM 事件：canvas 点击部署、按钮点击、调试面板事件委托

## 三、建议目标文件结构

保持无构建工具、普通 `<script>` 顺序加载、Live Server 可直接运行。

```text
src/
  game.js
  core/
    constants.js
    state.js
    storage.js
  systems/
    characters.js
    projectiles.js
    martial-arts.js
    upgrades.js
    enemies.js
    waves.js
    artifacts.js
    formations.js
  ui/
    render.js
    canvas-render.js
    debug-panel.js  # 暂缓拆分，不加载
  utils/
    math.js
```

- `src/game.js`
  - 保留启动入口、主循环、模块装配、事件入口。
  - 长期目标是从“大文件实现”变成“协调器”，但每一步只迁移一个低风险边界。

- `src/core/constants.js`
  - `APP_STATE`、`ENEMY_STATE`、稀有度、抽卡成本、调试 tab、颜色等常量。

- `src/core/state.js`
  - `state`、`playerMeta`、`defaultRunBonuses`、阵眼初始状态、玩家等级/槽位计算、`resetGame` 的可拆部分。
  - 初期不要急着完整迁出 `resetGame`，因为它会调用大量 UI 和测试接口。

- `src/core/storage.js`
  - localStorage key、读取、保存、归一化、清空。
  - 先从调试覆盖存储开始，后续再承接正式玩家存档。

- `src/utils/math.js`
  - `distance`、`distancePointToSegment`、角度/随机/范围判断等纯函数。
  - 只放无状态、无 DOM、无 DATA 依赖的函数。

- `src/systems/characters.js`
  - 角色解锁、升级、抽卡、部署合法性、角色属性、角色攻击更新。

- `src/systems/projectiles.js`
  - projectile 默认值、创建、发射、移动、碰撞检测、命中处理。
  - 初期可保留依赖注入参数，例如 `{ state, DATA, helpers }`，避免隐式全局太多。

- `src/systems/martial-arts.js`
  - 先天武学绑定、等级、青崖剑诀分支、attack params、martial bonuses。

- `src/systems/upgrades.js`
  - 机缘/升级候选生成、过滤、去重、权重、选择和 `applyPerk`。
  - 注意它和 `martial-arts.js` 依赖密切，拆分时必须先画清调用方向。

- `src/systems/enemies.js`
  - `Enemy` 类、移动、攻击阵眼、受击、状态、特殊能力。

- `src/systems/waves.js`
  - 波次启动、spawnJobs 推进、跳波、波次完成判断。

- `src/systems/artifacts.js`
  - 法宝冷却、攻击、法宝候选、法宝修正器。

- `src/systems/formations.js`
  - 护山大阵触发、范围效果、阵眼受击相关辅助。

- `src/ui/render.js`
  - DOM 渲染：大厅、战前配置、布阵列表、HUD、结算、机缘弹窗。
  - 最后拆，因为它依赖最多，也最容易和事件监听互相影响。

- `src/ui/canvas-render.js`
  - Canvas 绘制模块，负责地图区域、护山大阵、角色、怪物、弹道、浮动文字和 Boss 血条。

- `src/ui/debug-panel.js`
  - 暂缓拆分，不在 index.html 中加载；开发者调试面板继续保留在 src/game.js，稳定性优先。

## 四、低风险拆分顺序

1. `core/constants.js`
   - 只移动常量，不改逻辑。
   - 每个常量从 `window.XM.Constants` 读取或临时回写到旧全局名。

2. `core/storage.js`
   - 拆 localStorage key、调试覆盖读取/归一化/保存。
   - 不碰数据覆盖应用逻辑，先只拆纯存储边界。

3. `utils/math.js`
   - 拆 `distance`、`distancePointToSegment` 等纯函数。
   - 最适合建立 `window.XM.Math` 模式。

4. `systems/projectiles.js`
   - 拆 projectile 创建、移动、碰撞。
   - 风险开始上升，因为依赖 `state.enemies`、角色命中、武学参数和渲染。

5. `systems/martial-arts.js`
   - 拆先天武学计算、青崖分支、attack params。
   - 需要确保 projectileCount / volleyCount / 巨剑逻辑不变。

6. `systems/upgrades.js`
   - 拆升级候选生成、过滤、去重、`applyPerk`。
   - 拆之前要先固定浏览器验收脚本，因为这里最容易影响三选一。

7. `ui/debug-panel.js`
   - 拆开发者调试面板。
   - 需要保留事件委托和运行时快照接口。

8. `systems/enemies.js` / `systems/waves.js`
   - 拆怪物和波次。
   - 注意怪物类、spawnJobs、阵眼攻击线、结算之间的依赖。

9. `systems/artifacts.js` / `systems/formations.js`
   - 拆法宝和护山大阵。
   - 二者都依赖敌人选择、范围伤害、状态效果。

10. `ui/render.js`
   - 最后拆 UI 渲染。
   - UI 函数和事件监听、状态机、调试面板互相牵连，放最后风险最低。

## 五、浏览器加载方式评估

### 方案 A：普通 script + `window.XM` 命名空间

示例：

```js
window.XM = window.XM || {};
window.XM.Projectiles = {
  createProjectile,
  updateProjectiles,
};
```

加载顺序示例：

```html
<script src="data/game-data.js"></script>
<script src="src/core/constants.js"></script>
<script src="src/core/state.js"></script>
<script src="src/utils/math.js"></script>
<script src="src/systems/projectiles.js"></script>
<script src="src/game.js"></script>
```

优点：

- 不需要构建工具。
- 对 Live Server 和直接脚本加载友好。
- 可以一小步一小步迁移。
- 当前 `data/game-data.js` 已使用 `window.GAME_DATA`，风格一致。
- 可以让 `game.js` 在过渡期继续使用旧全局变量，降低一次性改动。

缺点：

- 加载顺序必须严格维护。
- 命名空间约定需要自律。
- 循环依赖不会被工具阻止，只会在运行时报错。

### 方案 B：`type="module"` ES Module

优点：

- 依赖关系更清晰。
- 可以使用显式 `import` / `export`。
- 作用域隔离更好。

缺点：

- 需要改入口脚本类型和模块路径。
- 直接 `file://` 下可能遇到跨源或模块加载限制，Live Server 通常没问题但约束更强。
- 当前大量函数依赖同一闭包作用域，迁移到 module 会一次性暴露大量隐式依赖。
- `browser_flow_test.js` 当前用 `file:///.../index.html`，改 module 后可能需要同步调整运行方式。

当前推荐：优先方案 A。

原因：

- 与现有 `window.GAME_DATA` 和测试接口模式一致。
- 不引入构建工具和 npm 依赖。
- 单步拆分成本低，适合当前原型阶段。
- 可以保持 Live Server 直接运行，也更容易继续支持现有 CDP 浏览器测试。

## 六、拆分风险点

1. 函数作用域变化：大量函数当前共享 `state`、`DATA`、DOM 引用和 helper，拆出后容易找不到变量。
2. 全局变量找不到：普通 script 加载顺序错误会导致 `window.XM.*` 未定义。
3. 事件监听丢失：UI 和 debug panel 使用 `innerHTML` 重渲染，拆分时必须保留事件委托或重新绑定策略。
4. debug panel 调不到运行时数据：调试表横跨角色、武学、机缘、怪物、波次、法宝、阵法，拆分后需要明确快照接口。
5. projectile 拆出后访问不到 enemies：弹道移动和碰撞依赖 `state.projectiles`、`state.enemies`、`applyRoleHit`、`distancePointToSegment`。
6. martialArts 和 upgrades 循环依赖：候选生成需要武学状态，应用升级又会改武学分支。
7. index.html script 顺序错误：`constants.js`、`state.js`、`utils/math.js`、各 systems、`game.js` 必须按依赖顺序加载。
8. `browser_flow_test.js` 路径/加载方式风险：如果改为 module 或改变入口加载方式，当前 `file://` 测试可能失败。
9. `Enemy` 类拆出风险：类方法依赖 `grid`、`attackLineY`、`damageArrayCore`、`setStatus`、`state.enemies`。
10. Canvas 渲染拆分风险：`drawProjectile`、`drawEnemy`、`drawFormationArea` 共享 `ctx`、`grid`、colors、DATA。
11. 调试覆盖风险：`applyDebugOverridesToData` 会重置 `DATA` 并覆盖多类集合，拆分后要避免覆盖顺序改变。
12. 测试接口风险：`window.__SHOUSHANMEN_ACTIONS__` 和 `window.__SHOUSHANMEN_DEBUG__` 必须保持兼容，否则现有验收脚本失效。

## 七、建议下一步

最先应该拆：`src/core/constants.js`。

原因：

- 只移动常量，不涉及运行时状态变化。
- 可以先建立 `window.XM` 命名空间约定。
- 对玩法逻辑影响最低。

建议第一步拆分范围：

- `APP_STATE`
- `ENEMY_STATE`
- `CHARACTER_RARITY`
- `GACHA_COST`
- `DUPLICATE_GACHA_REFUND`
- `DEBUG_STORAGE_KEY`
- `DEBUG_OVERRIDES_KEY`
- `DEBUG_TABS`
- 可选：`colors`、`rarityWeight`

第一步验收方式：

- 页面能打开，无控制台报错。
- 大厅、战前配置、布阵、开始战斗正常。
- 机缘三选一仍正常出现和选择。
- 调试面板仍能打开、切换 Tab、编辑模式可打开。
- `window.__SHOUSHANMEN_DEBUG__()` 和 `window.__SHOUSHANMEN_ACTIONS__` 仍存在。

需要改的 script 引用：

```html
<script src="data/game-data.js"></script>
<script src="src/core/constants.js"></script>
<script src="src/game.js"></script>
```

建议检查命令：

```powershell
git diff -- index.html src/game.js src/core/constants.js
node scripts\browser_flow_test.js
```

如果后续补专门调试面板验收脚本，也应增加：

```powershell
node scripts\debug_panel_acceptance_test.js
```

当前仓库没有 npm / vite / webpack，不建议引入新的检查链路。

## 八、本步骤验收结论

- 本步骤只完成拆分前审计和拆分计划。
- 本步骤没有拆分任何运行时代码。
- 本步骤不应修改 `src/game.js`、`data/game-data.js`、`index.html` 的功能代码。
- 本步骤不影响游戏运行。

## 当前模块职责 v2

- `src/core/constants.js`
  - 维护运行状态、敌人状态、颜色、稀有度、抽卡成本、调试 Tab、本地存储 key 等共享常量。
- `src/core/storage.js`
  - 维护玩家局外存档与调试覆盖数据的 localStorage 读写、默认值、归一化和基础对象合并工具。
- `src/core/state.js`
  - 维护局内默认状态、运行时集合、默认 modifiers、武学分支初始状态，以及新开一局时的运行时状态重置辅助。
- `src/utils/math.js`
  - 维护无状态数学工具，例如距离、线段碰撞距离等纯函数。
- `src/systems/projectiles.js`
  - 维护 projectile 默认配置、发射、移动、生命周期、碰撞检测、命中处理入口和弹道辅助函数。
- `src/systems/martial-arts.js`
  - 维护先天武学绑定、武学等级查询、青崖剑诀分支状态、分支加成和 attackParams 计算。
- `src/systems/upgrades.js`
  - 维护局内升级候选生成、过滤、权重、去重、有效性判断和机缘卡牌基础 HTML。
- `src/systems/enemies.js`
  - 维护 `Enemy` 类、怪物移动、攻击阵眼、受击、死亡、状态效果和特殊能力入口。
- `src/systems/waves.js`
  - 维护波次启动、出怪队列推进、波次完成判断、跳波和下一波推进辅助。
- `src/systems/artifacts.js`
  - 维护法宝配置读取、运行时状态、冷却、触发、伤害和 modifier 应用入口。
- `src/systems/formations.js`
  - 维护护山大阵 / 阵眼初始化、阵眼受击、防御计算、回满血、阵法触发和范围伤害辅助。
- `src/systems/characters.js`
  - 维护局外角色成长、解锁、升级、抽卡、部署判断、部署、局内角色属性、目标选择和角色开火入口。
- `src/ui/render.js`
  - 维护普通 DOM UI 渲染，包括大厅、战前配置、布阵列表、HUD、结算和玩家机缘卡牌显示。
- `src/ui/canvas-render.js`
  - 维护 Canvas 绘制，包括地图区域、护山大阵、角色、怪物、弹道、浮动文字和 Boss 血条。
- `src/game.js`
  - 保留 APP_STATE 流程协调、`startRun` / `enterLoadout` / `enterDeploy` / `endGame`、主 `update` / `loop`、模块 callbacks/helpers 装配、DOM 事件绑定、Canvas 点击部署、局内升级弹窗主流程、`applyPerk`、开发者调试面板、浏览器测试接口和玩家存档保存时机协调。

当前约定：

- `src/ui/debug-panel.js` 暂不拆分、不加载；开发者调试面板继续保留在 `src/game.js`。
- `src/game.js` 中允许保留薄包装函数，用于统一向模块传入 `state`、`DATA`、callbacks 和 helpers，避免大范围改调用点。
- 普通 `<script>` 加载和 `window.XM.*` 命名空间方案继续保留，不改为 `type="module"`。
