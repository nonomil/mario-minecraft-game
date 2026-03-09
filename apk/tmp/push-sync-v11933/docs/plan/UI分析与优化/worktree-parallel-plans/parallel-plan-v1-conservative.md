# 并行计划 V1（保守）

版本：V1-Conservative  
目标：以最小冲突风险完成 UI 基础改造。  
并行规模：3 个 worktree  
预估工期：10-13 个工作日

## Worktree 分工

| Worktree | 分支建议 | 职责 | 主要文件边界 |
|---|---|---|---|
| A | `feat/ui-foundation-v1` | 设计令牌与基础规范 | `src/design-tokens.css`、设计文档 |
| B | `feat/ui-components-v1` | 按钮/弹窗/表单统一 | 组件 CSS、`Game.html` 小范围类名挂载 |
| C | `feat/ui-tests-metrics-v1` | 测试稳定与口径统一 | `tests/e2e/specs/*.mjs`、测试文档 |

## Step-by-Step

### Step 0：冻结基线

1. 拉取主分支最新代码。
2. 记录基线 commit hash。
3. 执行基线测试：
- `npm run test:e2e -- deep-ui-analysis.spec.mjs`
- `npm run test:e2e -- ui-analysis.spec.mjs`
4. 记录基线指标（通过率、截图数量、报告产物）。

### Step 1：创建 worktree

1. `git worktree add ../wt-ui-a-foundation -b feat/ui-foundation-v1`
2. `git worktree add ../wt-ui-b-components -b feat/ui-components-v1`
3. `git worktree add ../wt-ui-c-tests -b feat/ui-tests-metrics-v1`

### Step 2：先定义契约，再开始编码

1. A 输出 token 命名表。
2. B 只能使用 A 已发布的 token 名称。
3. C 输出测试/报告 schema（字段与统计口径）。

### Step 3：并行实施

A 分支：
1. 创建 token 文件。
2. 定义字号层级与响应式变量。
3. 发布旧硬编码值到 token 的映射表。

B 分支：
1. 先做按钮系统（base/size/variant）。
2. 再做弹窗系统。
3. 最后做表单系统。
4. 每完成一批组件跑一次 deep-ui。

C 分支：
1. 修复 `ui-analysis.spec.mjs` 的 strict mode 失败。
2. 修复 deep-ui 截图统计与实际文件不一致问题。
3. 防止测试重试导致报告覆盖和数据丢失。

### Step 4：同步节奏

1. 每天 2 次同步（上午/下午）。
2. 同步重点仅包括契约变更和冲突风险。

### Step 5：合并顺序

1. C（先稳定测试）
2. A（再冻结设计基座）
3. B（最后合并组件迁移）

### Step 6：验收门禁

1. deep-ui 全通过。
2. ui-analysis 全通过。
3. 关键页面无明显视觉回退。
