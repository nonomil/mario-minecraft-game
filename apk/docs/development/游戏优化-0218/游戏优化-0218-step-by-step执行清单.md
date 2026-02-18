# 游戏优化-0218 Step-by-Step 执行清单

日期：2026-02-18
状态：Phase 0 已完成，Phase A 起执行中
关联文档：`游戏优化-0218-综述与执行计划.md`

## 0. 执行原则

1. 小步提交，每步可单独验证、可回滚。
2. 先触控布局，后村庄外观，再做室内交互闭环。
3. 每一步都附带验收标准，不通过不进入下一步。

## 0.5 Phase 0 - 紧急 Bug 修复（已完成 ✅）

### Step 0-1：修复蘑菇岛崩溃 Bug

- 问题：进入蘑菇岛后 `spawnEnemyByDifficulty` 抛出 `ReferenceError: take is not defined`，游戏崩溃。
- 根因：`11-game-init.js` 中 `if` 分支（enemyTiers 路径）fallback 时引用了仅在 `else` 分支定义的 `take` 变量；`biomePools` 缺少 `mushroom_island` 条目。
- 修复：
  - `if` 分支内新增 `tierTake` 就地计算，不再跨分支引用
  - `biomePools` 补充 `mushroom_island: ["spore_bug", "bee", "fox"]`
  - 同步修复 `apk/src/modules/11-game-init.js` 和 `src/modules/11-game-init.js`
- 验收：进入蘑菇岛不再崩溃，敌人正常生成。

## 1. Phase A - 需求冻结与技术准备

### Step A1：冻结需求文案

- 目标：把“村庄可进入 + 躺床回血 + 手机按钮上移”写成可测试条目。  
- 输出：确认版需求清单（DoD）。  
- 验收：
  - 每条需求有“触发条件 + 预期结果”。
  - 明确本期不做内容（如复杂室内装修、新NPC任务线）。

### Step A2：定义设备判定规则

- 目标：确定 `auto` 下 phone/tablet 判定阈值。  
- 建议规则：
  - `min(viewportWidth, viewportHeight) < 768` 判 phone。
  - 其余判 tablet（可后续微调）。
- 验收：
  - 给出 4 类测试机型（手机竖屏/横屏、平板竖屏/横屏）判定结果表。

### Step A3：确定村庄最小闭环

- 目标：锁定本期“可进入”的最小实现。  
- 建议最小闭环：
  - 进入房屋（状态切换）
  - 室内床交互回血
  - 退出房屋返回外部
- 验收：
  - 有状态图（outside -> entering -> indoor -> exiting -> outside）。

## 2. Phase B - 触控布局策略（先交付）

### Step B1：新增触控布局设置项设计

- 目标：新增设置字段设计，不改事件映射。  
- 建议字段：
  - `settings.deviceMode = "auto" | "phone" | "tablet"`（复用现有设置项）
- 预计涉及文件：
  - `apk/src/defaults.js`
  - `apk/src/modules/16-events.js`
  - `apk/src/styles.css`
- 验收：
  - 设置项可读写并持久化。

### Step B2：实现自动判定函数设计

- 目标：根据 `visualViewport`/`window` 计算设备类型。  
- 建议函数：
  - `resolveTouchDeviceMode(settings, viewport) -> "phone" | "tablet"`
- 预计涉及文件：
  - `apk/src/modules/16-events.js`
- 验收：
  - 机型矩阵下结果稳定，横竖屏切换可自动重算。

### Step B3：CSS变量化布局设计

- 目标：把固定 `bottom: 20px` 升级为变量驱动。  
- 建议变量：
  - `--touch-left-bottom`
  - `--touch-right-bottom`
  - `--touch-left-y-shift`
- 预计涉及文件：
  - `apk/src/styles.css`
- 验收：
  - phone-mid 时左右移动按钮明显上移。
  - tablet-bottom 时视觉与当前一致。

### Step B4：设置面板加入手动切换入口

- 目标：用户可覆盖 `auto` 判定。  
- 预计涉及文件：
  - `apk/Game.html`（如需新增控件）
  - `apk/src/modules/16-events.js`
  - `apk/src/styles.css`
- 验收：
  - 手动切换后立即生效、刷新后保持。

### Step B5：触控专项回归

- 目标：确认不破坏已有操作逻辑。  
- 验收清单：
  - 左右长按移动正常。
  - 跳跃、攻击、交互、切武器、用钻石正常。
  - Android WebView 下无明显“按键失灵/漂移”。

## 3. Phase C - 村庄外观升级（可见改进）

### Step C1：建筑模板池设计

- 目标：由固定4建筑升级为模板池组合。  
- 建议内容：
  - 至少 2 套基础民居模板（宽高、屋顶风格、门窗布局不同）
  - 保留功能建筑（床屋、学习屋、存档石）
- 预计涉及文件：
  - `apk/src/modules/18-village.js`
  - `apk/config/village.json`
- 验收：
  - 同一村庄内建筑不再“全同形”。

### Step C2：村庄区域层次设计

- 目标：形成“区域感”而非线性点状。  
- 建议策略：
  - 建筑分两排或错位排布
  - 高度/间距轻微随机
- 预计涉及文件：
  - `apk/src/modules/18-village.js`
  - `apk/src/modules/18-village-render.js`
- 验收：
  - 玩家视觉上可识别为“村庄片区”。

### Step C3：渲染表现增强

- 目标：增强“建筑感”，提升村庄建筑辨识度与区域感。  
- 建议方向：
  - 增加门框、窗框、屋顶细节层
  - 加强村庄边界标识（地面/围栏/灯）
- 预计涉及文件：
  - `apk/src/modules/18-village-render.js`
- 验收：
  - 建筑在远中近景可快速识别为“村庄建筑”。

### Step C4：外观阶段回归

- 验收：
  - 村庄生成频率、数量上限逻辑不回归。
  - 村庄安全区不刷怪逻辑不回归。

## 4. Phase D - 室内与躺床回血闭环

### Step D1：室内状态模型

- 目标：新增“室内状态”而不破坏主循环。  
- 建议状态：
  - `isIndoor`
  - `indoorVillageId`
  - `indoorBuildingType`
- 预计涉及文件：
  - `apk/src/modules/18-village.js`
  - `apk/src/modules/13-game-loop.js`
  - `apk/src/modules/14-renderer-main.js`
  - `apk/src/modules/07-viewport.js`
- 验收：
  - 进入/退出状态切换稳定，无卡死。
  - 室内状态下摄像机策略稳定（固定或受控跟随）。

### Step D2：入口与退出交互

- 目标：实现门口进入、室内退出。  
- 建议交互：
  - 门口 `Y` 进入
  - 室内出口点 `Y` 退出
- 预计涉及文件：
  - `apk/src/modules/18-village.js`
  - `apk/src/modules/16-events.js`（若需额外交互按钮）
- 验收：
  - 交互优先级清晰，不与宝箱交互冲突。

### Step D3：床位交互改造

- 目标：回血触发由“房屋附近”改为“室内床位点”。  
- 预计涉及文件：
  - `apk/src/modules/18-village.js`
  - `apk/src/modules/18-village-render.js`
- 验收：
  - 仅在室内床位可触发。
  - 满血提示、已使用提示、成功提示均正确。

### Step D4：室内渲染最小实现

- 目标：先做最小室内可用，不追求复杂美术。  
- 预计涉及文件：
  - `apk/src/modules/18-village-render.js`
  - `apk/src/modules/14-renderer-main.js`
- 验收：
  - 能清晰识别床位、出口、交互提示。

### Step D5：闭环回归

- 验收：
  - 村庄挑战、存档、buff、外部战斗均不受破坏。
  - 室内外切换时输入、摄像机、碰撞无明显异常。
  - 室内状态时敌人生成与室外碰撞流程按设计被屏蔽/恢复。

## 5. Phase E - 发布前收口

### Step E1：回归清单固化

- 输出：
  - 手工测试清单（设备、分辨率、功能点）
  - 最小自动化冒烟点（如已有 Playwright 用例可补充）
- 验收：
  - 每条需求均有对应测试记录。

### Step E2：性能与稳定性复核

- 目标：避免新系统引发卡顿或输入延迟。  
- 验收建议：
  - 连续 10 分钟游玩无明显卡顿。
  - 触控响应无明显丢事件。

### Step E3：发布说明与回滚预案

- 输出：
  - 发布说明（新增能力、已知限制）
  - 回滚方案（按功能开关分级回退）
- 验收：
  - 出现线上问题可在一次发布窗口内回退。

## 6. 文件级任务映射（实施时用）

1. 触控布局与设置：
  - `apk/src/styles.css`
  - `apk/src/modules/16-events.js`
  - `apk/src/defaults.js`
  - `apk/Game.html`（如新增设置控件）

2. 村庄外观与结构：
   - `apk/src/modules/18-village.js`
   - `apk/src/modules/18-village-render.js`
   - `apk/config/village.json`

3. 室内状态与主循环衔接：
   - `apk/src/modules/13-game-loop.js`
   - `apk/src/modules/14-renderer-main.js`
   - `apk/src/modules/18-village.js`
   - `apk/src/modules/18-village-render.js`

## 7. 里程碑建议

1. M1（1天）：触控布局策略完成并验证手机/平板。  
2. M2（2~3天）：村庄外观升级完成并稳定。  
3. M3（4~5天）：室内+床交互闭环完成，回归通过。  

## 8. 完成定义（DoD）

1. 手机默认按钮布局符合单手操作；平板保持底部。  
2. 村庄明显区域化、多房屋化，不再与宝箱视觉混淆。  
3. 躺床回血仅在“室内床位”触发，流程完整。  
4. 关键系统（战斗、挑战、存档、村庄buff）无回归。  
