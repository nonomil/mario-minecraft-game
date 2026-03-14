# Release Notes - v1.19.39

## 摘要
本次更新聚焦 BOSS 系统拆分与战斗节奏强化：烈焰人火焰环、凋零/凋零骷髅/恶魂/坚守者/唤魔者技能窗口完善，末影龙竞技场三阶段追击与水晶交互更稳定；同时修复拼音/桥接显示回退问题并补齐调试测试覆盖。

## 变更详情

### 核心功能 (Features)
- **烈焰人火焰环**：新增火焰环状态机、预警视觉、伤害窗口与惩罚阶段。
- **BOSS 战斗节奏强化**：凋零护盾窗口、凋零骷髅冲刺节奏、恶魂反弹窗口、坚守者音波预警、唤魔者护盾波动。
- **末影龙竞技场**：增加三阶段追击与技能节奏，强化水晶交互与投射物调试开关。

### 修复 (Bug Fixes)
- **拼音/桥接显示**：修复桥接模式回退到拼音的边界问题并统一模式命名。
- **BOSS 调试**：修复 BOSS 阶段调试与恶魂意图状态恢复。
- **坚守者暗脉冲**：稳定暗脉冲意图推进与状态一致性。

### 优化改进 (Improvements)
- **BOSS 模块拆分**：按 core/shared/单 BOSS 拆分，提高维护性与可测试性。
- **调试与测试覆盖**：补齐烈焰环调试流程与 Playwright 覆盖。
- **仓库清理**：更新忽略规则，减少 worktree 与测试产物污染。

### 文档更新 (Docs)
- **BOSS 战优化规划**：新增阶段优化方案与实现规划文档。
- **烈焰环设计与实现计划**：补齐设计说明与实现步骤。
- **文件拆分方案**：更新 BOSS 文件拆分设计与实施计划。

## Git 提交记录 (v1.19.38..HEAD)
- `830f621`: codex: merge boss split + boss optimizations
- `55422c2`: fix: stabilize warden dark pulse intent (docs/plans/2026-03-14-boss-optimization-rounds.md)
- `a8f5082`: feat: add evoker shield wave rhythm (docs/plans/2026-03-14-boss-optimization-rounds.md)
- `370217a`: fix: pinyin fallback from hanzi map (src/modules/09-vocab.js)
- `ed073b8`: feat: add warden sonic warning (docs/plans/2026-03-14-boss-optimization-rounds.md)
- `c36158b`: feat: tune ghast reflect window (docs/plans/2026-03-14-boss-optimization-rounds.md)
- `38ab175`: feat: add wither shield window (docs/plans/2026-03-14-boss-optimization-rounds.md)
- `115f164`: feat: add wither skeleton dash rhythm (docs/plans/2026-03-14-boss-optimization-rounds.md)
- `52d90f6`: codex: add boss optimization implementation plan (docs/plans/2026-03-14-boss-optimization-rounds.md)
- `06b0e34`: codex: add boss optimization design (docs/plans/2026-03-14-boss-optimization-rounds-design.md)
- `8c3eca8`: fix: bridge display fallback to pinyin (src/modules/09-vocab.js)
- `5df89f4`: fix: rename pinyin mode label to bridge (src/modules/08-account.js)
- `05df114`: fix: restore boss debug phase and ghast intent (docs/plans/2026-03-13-boss-file-split-implementation-plan.md)
- `cbcf913`: refactor: split boss classes into modules (docs/plans/2026-03-13-boss-file-split-implementation-plan.md)
- `5cca30c`: refactor: split boss core and shared modules (docs/plans/2026-03-13-boss-file-split-implementation-plan.md)
- `00efa6d`: chore: ignore worktrees (docs/plans/2026-03-13-boss-file-split-implementation-plan.md)
- `8849b28`: codex: bridge vocab rules + plans (docs/plan/幼小衔接设计/2026-03-13-幼小衔接玩法规则-implementation.md)
- `77eb828`: codex: prepare boss split scripts (docs/plans/2026-03-13-boss-file-split-implementation-plan.md)
- `aea7345`: docs: add boss file split implementation plan (docs/plans/2026-03-13-boss-file-split-implementation-plan.md)
- `53c003e`: docs: add boss file split design (docs/plans/2026-03-13-boss-file-split-design.md)
- `c4cf4e9`: docs: document blaze ring debug usage
- `b461c3a`: feat: add blaze ring telegraph visuals
- `1144d52`: feat: add blaze ring damage and punish window
- `5036641`: feat: add blaze ring state machine
- `4788130`: test: add blaze ring debug flow coverage
- `71f78cd`: docs: add blaze ring implementation plan (docs/plans/2026-03-13-blaze-rotating-ring-implementation-plan.md)
- `f56056a`: docs: add blaze rotating ring design (docs/plans/2026-03-13-blaze-rotating-ring-design.md)
- `47878f7`: fix: add ghast reflect-stun and windup (docs/plan/BOSS战优化/2026-03-13-ghast-step-plan.md)
- `ea8d29c`: docs: add boss battle optimization plans
- `4cdcf79`: chore: ignore playwright test results
- `9b51bd4`: chore: ignore tmp artifacts in worktree
- `91883e6`: fix: resolve ender dragon arena debug flow (docs/plans/2026-03-13-dragon-crystal-projectile-toggle-design.md)
- `f6ff2e1`: codex: initial implementation of pinyin mode design (docs/plans/2026-03-12-pinyin-mode-design.md)
- `fc10cec`: feat: add three-phase player pursuit to dragon arena
