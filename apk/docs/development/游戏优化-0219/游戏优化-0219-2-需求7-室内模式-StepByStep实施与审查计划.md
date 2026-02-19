# 游戏优化-0219-2 需求7：室内模式 Step-by-Step 实施与审查计划

日期：2026-02-19  
状态：仅计划，不实施代码修改  
适用范围：`apk` 子项目

---

## 1. 目标与原则

### 1.1 目标
1. 村庄房屋支持“进入室内 / 退出室内”。
2. 室内期间暂停外部世界更新，避免并发状态错乱。
3. 保留现有交互能力（休息回血、词汇挑战、存档、特殊建筑）。

### 1.2 实施原则（防回归）
1. 先状态骨架，后交互，再渲染，不跨阶段混改。
2. 每一步必须有可验证输出（日志或测试断言），不能“改完再看”。
3. 每一步都提供可回滚点（最小提交粒度）。
4. 先兼容现有主循环与门禁 BOSS，再扩展室内玩法细节。

---

## 2. 现状基线（实施前必须复核）

### 2.1 关键入口与耦合点
1. 村庄更新入口：`apk/src/modules/18-village.js` 的 `updateVillages()`。
2. 建筑交互入口：`apk/src/modules/18-village.js` 的 `checkVillageBuildings()` / `handleVillageInteraction()`。
3. 主循环入口：`apk/src/modules/13-game-loop.js` 的 `update()`。
4. 交互按键入口：`apk/src/modules/13-game-loop.js` 的 `handleInteraction()`（调用村庄交互）。
5. 模态暂停机制：`paused` / `pausedByModal`。
6. 已存在门禁 BOSS 状态：`bossArena` 与 `06-biome.js` 中 `biomeGateState`。

### 2.2 风险热点
1. 室内模式与 `pausedByModal` 冲突，导致无法恢复。
2. 室内模式与 BOSS 战并发，导致视口锁定/状态残留。
3. 室内模式与群系切换并发，导致 `currentBiome`/门禁状态异常。
4. 室内退出位置恢复失败（卡进碰撞体、掉落、瞬移）。
5. 计时器类逻辑（自动存档、挑战倒计时）出现暂停/恢复不一致。

---

## 3. Step-by-Step 详细实施计划（含审查与验收）

## Step 0：冻结基线并记录快照（不改逻辑）

### 修改范围
1. 无功能修改，仅执行基线测试并记录结果。

### 审查清单
1. `p3-regression` 全通过。
2. `biomes-fullrun` 全通过。
3. `village-integration` / `debug-actions` 相关用例通过。

### 通过标准
1. 获得“室内模式改造前”的稳定基线报告。

### 失败处理
1. 若基线已失败，先修基线再进入 Step 1。

---

## Step 1：新增室内状态骨架（只加状态，不接入流程）

### 修改文件
1. `apk/src/modules/01-config.js`
2. `apk/src/modules/18-village.js`（仅函数声明与状态读写）

### 具体改动
1. 新增全局状态：
   - `interiorMode = false`
   - `interiorContext = null`
2. 新增状态函数（空壳）：
   - `isInteriorModeActive()`
   - `enterInteriorMode(village, building, opts)`
   - `exitInteriorMode(reason)`
   - `getInteriorStateSnapshot()`

### 审查重点
1. 不得改变现有行为路径（`handleVillageInteraction` 仍按旧逻辑执行）。
2. 新函数调用前需防御空值（`village/building/player`）。
3. `getInteriorStateSnapshot()` 必须只读，不修改状态。

### 验证
1. 单步调试调用新函数，不触发异常。
2. 现有测试结果与 Step 0 一致。

### 回滚点
1. 若任一现有测试回归，整步回滚（仅状态骨架变更）。

---

## Step 2：主循环短路框架（先“冻结外部”，不做室内玩法）

### 修改文件
1. `apk/src/modules/13-game-loop.js`

### 具体改动
1. 在 `update()` 中精确插入短路分支：
   - 插入位置：`if (paused) return;` 之后、`updateVillages()` 之前。
   - `if (interiorMode) { updateInteriorTick(); return; }`
2. 新增 `updateInteriorTick()` 最小实现：
   - 保持 UI 输入响应。
   - 不执行外部实体更新。
3. 外部冻结项（必须全部覆盖）：
   - 敌人更新与生成
   - 掉落/投射物更新
   - 粒子天气更新
   - BOSS `checkSpawn/update`
   - 群系动态切换更新
4. `handleInteraction()` 室内分流：
   - 室内模式下允许“室内交互”分支（休息/挑战/退出）。
   - 室内模式下屏蔽“外部交互”分支（开箱、场景互动、户外建筑触发）。
5. 双向互斥守卫：
   - `interiorMode=true` 时，主循环不得执行 `updateCurrentBiome` 与 `bossArena.checkSpawn`。
   - 避免室内奖励加分引发群系切换或分数 BOSS 触发。

### 审查重点
1. 不能影响 `paused/pausedByModal` 原优先级。
2. 室内状态不能让主循环“完全停死”（UI与退出按键仍可用）。
3. `gameFrame` 是否递增要统一定义：
   - 推荐：室内仍递增（便于动画/倒计时一致）。

### 验证
1. 手动将 `interiorMode=true`，确认外部实体位置与数量不变。
2. 退出后恢复正常更新，无瞬移/速度异常。

### 回滚点
1. 若出现“退出后世界不恢复”，回滚到 Step 1。

---

## Step 3：接入建筑交互（仅 bed_house / word_house）

### 修改文件
1. `apk/src/modules/18-village.js`
2. `apk/src/modules/13-game-loop.js`（交互分流）
3. `apk/src/modules/17-bootstrap.js`（Esc 键退出入口）
4. `apk/src/modules/12-village-challenges.js`（挑战完成回调接线）

### 具体改动
1. `handleVillageInteraction()` 分流：
   - `bed_house`：先 `enterInteriorMode`，室内交互触发 `performRest`
   - `word_house`：先 `enterInteriorMode`，室内交互触发 `startVillageChallenge`
2. `save_stone` 与 `SPECIAL_BUILDING_EFFECTS` 保持户外交互，不进室内。
3. 增加退出按键：
   - `Esc`（默认）
   - 可选 `Q`（保留后续配置化）
4. `word_house` 挑战回调：
   - 明确 `startVillageChallenge()` 完成/取消/失败三种出口都能回到 `exitInteriorMode()`。
   - 避免挑战 UI 关闭后 `interiorMode` 残留。

### 审查重点
1. 防重入：`interiorMode=true` 时禁止再次进入。
2. 防互斥冲突：
   - `bossArena.active` 时禁止进室内
   - `biomeGateState.gateActive` 时禁止进室内
   - `interiorMode=true` 时禁止门禁触发与分数 BOSS 触发（双向互斥）
3. 触发节流：沿用村庄已有 `_lastInteractAt` 防抖。

### 验证
1. 可进入、可退出、可重复进入。
2. `bed_house` 休息次数限制仍生效。
3. `word_house` 挑战结束后退出室内状态一致。

### 回滚点
1. 若出现“挑战退出后卡死”，回滚 Step 3 并保留 Step 2。

---

## Step 4：室内显示层最小版（功能优先）

### 修改文件
1. `apk/src/modules/18-village-render.js`
2. `apk/Game.html`（仅必要 UI）
3. `apk/src/modules/16-events.js`（退出按钮 UI 事件）
4. `apk/src/modules/17-bootstrap.js`（键盘 Esc 事件）

### 具体改动
1. 室内最小渲染：
   - 半透明遮罩
   - 房屋标题（bed_house/word_house）
   - 交互提示（休息/挑战/退出）
2. 新增退出按钮（UI层），与键盘退出共用 `exitInteriorMode()`。

### 审查重点
1. 不能影响现有 HUD 按钮层级点击。
2. 不引入重复渲染坐标偏移问题（避免重复 `cameraX` 处理）。

### 验证
1. 移动端与桌面端均能退出。
2. 室内提示文本与实际交互一致。

### 回滚点
1. 若 UI 层冲突严重，仅回滚 Step 4，保留功能层（Step 1-3）。

---

## Step 5：恢复策略与异常兜底

### 修改文件
1. `apk/src/modules/18-village.js`
2. `apk/src/modules/11-game-init.js`
3. `apk/src/modules/17-bootstrap.js`（测试状态导出）

### 具体改动
1. 退出室内恢复策略：
   - 恢复玩家到入室门口安全点。
   - 清理 `interiorContext`。
2. 兜底清理：
   - `initGame/startLevel` 强制重置室内状态，防止跨局残留。
3. 测试 API 导出：
   - `interiorMode`
   - `interiorContext`

### 审查重点
1. 不允许出现“进室内后死亡/重开仍卡室内”。
2. 退出时玩家坐标必须通过地面合法化校验。

### 验证
1. 重开新局后状态干净。

---

## Step 6：自动化回归补齐（必须）

### 新增/修改测试
1. `tests/` 新增室内专项：
   - 进入 `bed_house` 后外部冻结断言
   - 进入 `word_house` + 挑战 + 退出链路断言
   - BOSS/门禁激活时禁止进入室内
   - 连续进入退出 20 次无状态泄漏（自动化压力用例）
   - 挑战奖励加分后不触发群系切换/BOSS 生成（室内期间）
2. 复跑存量：
   - `tests/p3-regression.spec.js`
   - `tests/biomes-fullrun.spec.js`
   - `tests/village-integration.spec.js`
   - `tests/debug-actions.spec.js`

### 审查重点
1. 失败分类必须区分：
   - 功能回归
   - webServer 端口冲突（`EADDRINUSE`）
2. 端口冲突不算功能失败，但必须串行重跑确认。

### 通过标准
1. 室内专项全通过。
2. 存量核心回归全通过。

---

## 4. 代码审查清单（逐项打勾）

1. 只在单一入口判断室内状态（避免多处分支漂移）。
2. 室内模式与 `paused/pausedByModal` 优先级有明确注释。
3. BOSS/门禁/群系切换与室内模式互斥逻辑已覆盖。
4. `enterInteriorMode/exitInteriorMode` 对重复调用幂等。
5. 室内退出时玩家位置合法化，不穿模。
6. 所有新增全局状态都在 `initGame/startLevel` 清零。
7. `MMWG_TEST_API` 已暴露必要状态，便于回归。
8. 未改动无关模块（词库调度、BOSS 数值、群系参数）。

---

## 5. 风险矩阵（高风险先控）

1. 高风险：主循环短路误伤外部流程  
缓解：Step 2 单独提交，先跑全回归后再继续。

2. 高风险：与挑战 modal 冲突导致卡死  
缓解：Step 3 加互斥和重入保护，优先补自动化用例。

3. 中风险：退出室内后相机/速度异常  
缓解：Step 5 增加恢复与校验函数，写重复进出压测脚本。

4. 中风险：测试偶发端口占用误判  
缓解：强制 `--workers=1` 重跑关键套件确认。

5. 中风险：室内挑战奖励加分触发群系切换或 BOSS 生成  
缓解：Step 2 双向冻结 + Step 6 专项自动化断言。

---

## 6. 建议执行顺序与里程碑

1. 里程碑 A：Step 1 + Step 2 完成并回归通过（室内框架可控）。
2. 里程碑 B：Step 3 完成（可进可出 + 两类建筑功能接入）。
3. 里程碑 C：Step 4 + Step 5 完成（体验层 + 稳定性）。
4. 里程碑 D：Step 6 通过（可发布）。

---

## 7. 本文档使用说明

1. 本文档是“实施前审查计划”，不是开发记录。
2. 每完成一个 Step，需要在对应章节追加：
   - 实际改动文件
   - 测试结果
   - 偏差说明（与计划不一致项）
3. 若任一步出现高风险回归，按“回滚点”回退，不跨步硬推进。
