# BOSS 优化分轮设计（除 Blaze）

**目标**  
在保持现有系统结构不变的前提下，按「每个 BOSS 单独完成一轮（实现 → 验证 → 提交）」的节奏，完成除 Blaze 之外的 BOSS 战斗节奏优化，并确保调试入口可稳定复现与 Playwright 验证通过。

---

## 范围与顺序
- **范围**：Wither Skeleton、Wither、Ghast、Warden、Evoker（Blaze 已完成）
- **顺序**：Wither Skeleton → Wither → Ghast → Warden → Evoker  
  先完成地面近战模板（Wither Skeleton），再迁移到远程与法术型 BOSS。

## 设计原则
1. **每个 BOSS 单独一轮**：单 BOSS 变更完成后，立即跑验证与提交。
2. **不跨模块重构**：保持 boss core/shared 与 bossArena 稳定，避免跨 BOSS 影响。
3. **节奏可读**：所有高伤害技能必须有明显预警；每场战斗提供至少一个惩罚窗口。
4. **调试可控**：所有新增机制必须可通过 debug 入口稳定复现。

## 变更落点
- 主要改动：
  - `src/modules/15-entities-boss-*.js`（对应 BOSS 文件）
  - `tests/debug-pages/GameDebug.html`（必要的调试接口或开关）
- **不动**：
  - `src/modules/15-entities-boss-core.js`
  - `src/modules/15-entities-boss-shared.js`
  - `bossArena` 与环境控制器（除非特定 BOSS 计划明确要求）

## 验证策略
每个 BOSS 的回合完成后立即执行：
1. Playwright：`tests/e2e/specs/boss-debug-controls.spec.mjs`
2. 必要时追加/强化特定断言（只围绕当次 BOSS 行为）
3. 若需要手动复现：使用 `tests/debug-pages/GameDebug.html` 调试入口

## 风险与控制
- **风险**：节奏改动过于频繁导致压迫感过强  
  **控制**：限制高伤害技能频率与持续时间，确保有安全窗口。
- **风险**：调试接口不一致导致回归测试不稳定  
  **控制**：每新增机制同时添加调试入口与 Playwright 断言。

## 交付标准
对每个 BOSS：
1. 变更完成并可通过调试入口复现
2. Playwright 验证通过
3. 单独 commit，便于回溯
