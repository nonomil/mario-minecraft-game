# 并行计划 V3（激进）

版本：V3-Aggressive  
目标：压缩总工期，最大化并行吞吐。  
并行规模：5 个 worktree  
预估工期：6-9 个工作日

## Worktree 分工

| Worktree | 分支建议 | 重点 |
|---|---|---|
| A | `feat/ui-token-system-v3` | 设计令牌与视觉规则 |
| B | `feat/ui-buttons-forms-v3` | 按钮与表单 |
| C | `feat/ui-modals-hud-v3` | 弹窗与 HUD |
| D | `feat/ui-css-architecture-v3` | CSS 模块化架构 |
| E | `feat/ui-test-regression-v3` | E2E 稳定性与回归产物 |

## Step-by-Step

### Step 0：前置条件

1. 至少 4 名开发者并行投入。
2. 每天 2 次固定同步。
3. 必须执行 token/schema 冻结机制。

### Step 1：创建 worktree

1. 创建 A/B/C/D/E 五个 worktree。
2. 每个 worktree 建立 `WORKLOG.md`。

### Step 2：Day 1 冻结

1. A 冻结 token 合同 v1。
2. E 冻结测试/报告 schema v1。
3. B/C/D 对冻结合同确认后再开始编码。

### Step 3：并行交付

1. B/C 先完成可用基础态，再补细节。
2. D 先搭架构，再持续接入 B/C 输出。
3. E 每天执行回归并在当天回流问题。

### Step 4：每日预合并演练

1. 从 Day 2 开始每天一次。
2. 演练顺序：E -> A -> D -> B -> C。
3. 演练失败必须在下一工作日中午前修复。

### Step 5：正式合并

1. 使用与演练一致的合并顺序。
2. 每次合并后执行 UI E2E。
3. 任一关键用例失败即暂停合并列车。

### Step 6：收口

1. 汇总所有 `WORKLOG.md`。
2. 发布最终样式系统说明。
3. 保留关键回退点（tag/commit）。
