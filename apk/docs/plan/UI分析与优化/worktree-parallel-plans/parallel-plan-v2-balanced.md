# 并行计划 V2（平衡，推荐）

版本：V2-Balanced  
目标：在保证质量的前提下提升并行效率。  
并行规模：4 个 worktree  
预估工期：8-11 个工作日

## Worktree 分工

| Worktree | 分支建议 | 核心目标 | 主要文件边界 |
|---|---|---|---|
| A-Foundation | `feat/ui-foundation-v2` | 设计令牌与基础规则 | token 文件 + 设计文档 |
| B-Components | `feat/ui-components-v2` | 按钮/弹窗/表单迁移 | 组件 CSS + `Game.html` 类名绑定 |
| C-ModuleSplit | `feat/ui-module-split-v2` | CSS 模块化架构 | `src/styles/index.css`、`src/styles/**` |
| D-QualityGate | `feat/ui-quality-gate-v2` | 测试稳定与质量门禁 | E2E 脚本 + 测试规范文档 |

## Step-by-Step

### Step 0：冻结基线

1. 记录 `BASE_COMMIT`。
2. 保存当前测试结果和产物清单。
3. 明确本轮范围：只改 UI 样式和 UI 测试。

### Step 1：创建 worktree

1. `git worktree add ../wt-ui-a-foundation -b feat/ui-foundation-v2`
2. `git worktree add ../wt-ui-b-components -b feat/ui-components-v2`
3. `git worktree add ../wt-ui-c-modules -b feat/ui-module-split-v2`
4. `git worktree add ../wt-ui-d-quality -b feat/ui-quality-gate-v2`

### Step 2：Day 1 契约冻结

1. A 发布并冻结 token v1 命名。
2. D 发布并冻结测试/报告 schema v1 字段。
3. B/C 仅允许依赖冻结契约开发。

### Step 3：Day 2-Day 5 并行交付

A 任务：
1. 建立颜色、字体、间距、圆角、阴影、层级 token。
2. 建立响应式 token。
3. 输出旧值到 token 的映射清单。

B 任务：
1. 完成按钮系统。
2. 完成弹窗系统。
3. 完成表单系统。
4. 在 `Game.html` 渐进式迁移类名并保留兼容过渡。

C 任务：
1. 建立模块化目录和 `index.css` 入口。
2. 先固定导入顺序。
3. 分批迁移样式，避免大批量一次改动。

D 任务：
1. 修复 `ui-analysis.spec.mjs` 设置面板 strict mode 问题。
2. 修复 deep-ui 截图统计逻辑。
3. 修复重试导致报告覆盖问题。
4. 在 `tests/TESTING.md` 增加 UI 门禁检查项。

### Step 4：检查点

1. CP1（Day 2 结束）：token/schema v1 稳定。
2. CP2（Day 4 结束）：组件基础能力和模块骨架稳定。
3. CP3（Day 5 结束）：各分支最小回归通过。

### Step 5：合并列车

1. D
2. A
3. C
4. B

### Step 6：冲突处理规则

1. `Game.html` 冲突由 B 主导；C 只保留样式入口相关改动。
2. token 冲突以 A 的冻结契约为准。
3. 测试 schema 冲突以 D 的冻结契约为准。

### Step 7：验收标准

1. deep-ui 通过。
2. ui-analysis 通过。
3. 重复运行后统计口径可复现。
4. 每个 worktree 都有变更日志可追踪。
