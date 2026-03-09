# UI 并行开发总合并计划（Master）

版本：Master-1.0  
日期：2026-03-04  
默认策略：以 V2（平衡）为主，吸收 V1 的稳态门禁和 V3 的预合并演练。

## 1. 总体原则

1. 先稳定测试口径，再推进样式迁移。
2. 先冻结 token 契约，再做大规模改造。
3. 先搭模块化架构，再做全面替换。
4. 合并必须走固定顺序。

## 2. Worktree 职责

| Worktree | 建议目录 | 分支 | 职责 | 依赖 |
|---|---|---|---|---|
| A-Foundation | `../wt-ui-a-foundation` | `feat/ui-foundation-v2` | token 系统与映射文档 | 无 |
| B-Components | `../wt-ui-b-components` | `feat/ui-components-v2` | 组件迁移与页面类名挂载 | 依赖 A |
| C-ModuleSplit | `../wt-ui-c-modules` | `feat/ui-module-split-v2` | CSS 模块化结构与迁移骨架 | 依赖 A |
| D-QualityGate | `../wt-ui-d-quality` | `feat/ui-quality-gate-v2` | E2E 稳定和质量门禁 | 无 |

## 3. Step-by-Step 执行计划

### Step 0：基线冻结（Day 0）

1. 记录 `BASE_COMMIT`。
2. 执行并归档基线测试：
- `npm run test:e2e -- deep-ui-analysis.spec.mjs`
- `npm run test:e2e -- ui-analysis.spec.mjs`
3. 记录通过率和测试产物清单。

### Step 1：初始化 worktree（Day 1 上午）

1. 创建 A/B/C/D 四个 worktree。
2. 每个分支建立 `WORKLOG.md`。
3. 首个 commit 仅做初始化和文档落地。

### Step 2：双冻结机制（Day 1 下午）

1. A 冻结 token 契约 v1。
2. D 冻结测试/报告 schema v1。
3. B/C 只允许基于冻结契约开发。

### Step 3：并行开发窗口（Day 2-Day 5）

A 分支：
1. 交付 token 文件。
2. 交付旧值映射文档。
3. 在 `A-CHANGELOG.md` 记录 token 变更。

B 分支：
1. 迁移按钮系统。
2. 迁移弹窗系统。
3. 迁移表单系统。
4. 在 `Game.html` 渐进式更新类名。

C 分支：
1. 建立 `src/styles/index.css`。
2. 建立模块化目录结构。
3. 按小批次迁移样式并保持可审查性。

D 分支：
1. 修复 `ui-analysis.spec.mjs` strict mode 选择器问题。
2. 修复 deep-ui 截图计数逻辑。
3. 修复重试场景下报告覆盖问题。
4. 在 `tests/TESTING.md` 输出门禁检查清单。

### Step 4：检查点

1. CP1（Day 2 结束）：token/schema 稳定。
2. CP2（Day 4 结束）：组件基础能力 + 模块骨架稳定。
3. CP3（Day 5 结束）：各分支最小回归通过。

### Step 5：预合并演练

1. 在集成分支执行预合并。
2. 固定顺序：D -> A -> C -> B。
3. 记录冲突点和解决方案。

### Step 6：正式合并列车

1. 合并 D。
2. 合并 A。
3. 合并 C。
4. 合并 B。

### Step 7：最终验收（Day 6-Day 8）

1. deep-ui 通过。
2. ui-analysis 通过。
3. 多次重复运行后统计结果一致。
4. 文档齐全且可追溯。

## 4. 强制门禁

1. 门禁未通过，禁止进入下一次合并。
2. token/schema 未冻结，禁止大规模迁移。
3. 过大 PR 必须拆分后再审查。

## 5. 回退策略

1. 关键失败时回退到上一个检查点。
2. 若冲突长期无法收敛，优先保留 D/A，暂缓 B/C。
3. 若并行流程失控，降级到 V1 执行。
