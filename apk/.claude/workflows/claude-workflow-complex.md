# claude-workflow-complex｜复杂开发流程

> 本文档中的所有规则遵循 `claude-workflow-constants.md` 中的全局约束
> 触发条件：任意一条不满足简单模式标准（文件>3 / diff>200行 / 需求有歧义 / 跨模块）
> 入口：从 `claude.md` 场景路由跳转至此

---

## ⛔ 强制门禁：用户确认需求后，必须按顺序执行，不得跳过，不得在 Phase 6 前调用 Codex 写代码

```
Phase 0  （可选）扫描路由判断（largebase / 轻量扫描）
         - 命中大型代码库条件 → 跳转 `claude-workflow-largebase.md`
           并优先调用 `largebase-structured-scan` skill 产出 00-06 扫描包
         - 未命中大型代码库条件 → 执行本文件轻量扫描
         → CC 基于扫描结果生成 Plan（质量更高，省 token）

Phase 1  CC 生成 Plan 文档（docs/plan/YYYY-MM-DD-[feature].md）
         → 向用户展示 Plan，等待用户确认内容

Phase 2  CC 调用 Codex MCP 工程审查 Plan
         → CC 汇总审查意见，向用户展示
         → 等待用户确认采纳哪些意见，CC 更新 Plan 文档

Phase 3  交叉 Review（CC ↔ Codex，≥3轮）
         每轮：CC 审查 → Codex 审查 → 对比结论
         - 一致且无新问题 → 向用户汇报，等用户确认定稿
         - 有分歧 → 记录到 Plan 文档"已知权衡"表，继续下一轮
         - 连续2轮无新问题 → 收敛，等用户确认 Plan 定稿

Phase 4  CC 调用 Codex MCP 生成各 worktree 独立 Step-by-Step 开发计划
         每个 worktree 对应一个独立的 *-steps.md（docs/development/）
         → 向用户展示计划，等待用户确认

Phase 4.5 任务解耦审查（CC自查 → Codex审查 → 向用户汇报）
         → 等待用户说"开始开发"

Phase 5  （可选）Opus 审查开发计划（默认执行，以下情况可向用户建议跳过：
             - 架构简单且无跨模块依赖风险
             - Phase 3 连续2轮无新问题，方案极度收敛
             - 用户明确说"不需要 Opus 审查"）

Phase 6  用户明确说"开始开发"后，才可调用 Codex 执行代码任务
```

**违反此门禁 = 从 Phase 1 重新开始。**

---

## Phase 0：扫描路由判断（可选）

### 0A. 是否进入大型代码库流程

命中任意条件即跳转 `claude-workflow-largebase.md`：
- 源码文件数 > 20
- 需求涉及 3 个及以上模块
- 存在多份参考文档（README/API/config/架构）
- 关键词：重构 / 迁移 / 整合 / 全局替换 / 跨模块

跳转后要求：
- 优先触发 `largebase-structured-scan` skill
- 产出标准扫描包（`00-06`）
- Phase 1 仅使用扫描包结论，不再全库盲搜

### 0B. 未命中 largebase 时执行轻量扫描

```
mcp__codex__codex({
  model: "gpt-5.3-codex",
  sandbox: "danger-full-access",
  "approval-policy": "on-failure",
  prompt: "
    ## Context
    - 项目根目录：[DEV_DIR]
    - 用户需求：[需求描述]
    - 扫描范围：[用户指定范围 或 src/ 全部]

    ## Task
    扫描代码库，为 CC 生成轻量架构摘要，用于后续 Plan 制定。

    输出以下内容：
    1. 目录结构概览（2层深度）
    2. 核心模块列表 + 各模块职责（一句话）
    3. 与本次需求相关的文件列表 + 现有实现摘要
    4. 现有代码中的模式/约定（命名、错误处理、数据结构）
    5. 潜在影响点：本次需求可能影响哪些现有功能
  "
})
// 保存 threadId，Phase 2 工程审查可复用此 Session
```

### 0C. Phase 0 跳过条件

- 用户明确说"直接开始" / "不用扫描"
- 本次需求仅涉及新建文件，不修改现有代码
- 当前 Session 内已执行过有效扫描（轻量摘要或 00-06 扫描包）

---

## Plan 文档标准结构

保存路径：`docs/plan/YYYY-MM-DD-[feature].md`

```markdown
# [FEATURE_NAME] Plan 方案

> 生成日期：YYYY-MM-DD
> 状态：草稿 / 审查中 / 定稿

## 流程进度
- [ ] Phase 1：Plan 文档生成，用户确认内容
- [ ] Phase 2：Codex 工程审查完成，用户确认采纳意见
- [ ] Phase 3：交叉 Review 收敛，用户确认定稿
- [ ] Phase 4：各 worktree 独立 steps 文档生成，用户确认
- [ ] Phase 4.5：解耦审查通过，用户确认
- [ ] Phase 6：用户说"开始开发"，进入执行阶段

## 需求理解
[对需求的完整理解，含边界条件和排除项]

## 技术方案
### 方案选择
[列出 2-3 个可选方案，说明选择理由]

### 选定方案详述
[架构图（文字描述）、关键设计决策、数据流]

### 涉及文件
| 文件 | 操作 | 说明 |
|------|------|------|
| `src/xxx.py` | 修改 | [用途] |
| `src/yyy.py` | 新建 | [用途] |

## Worktree 并行计划
| Worktree | 分支 | 任务 | 依赖 | Steps 文档 |
|----------|------|------|------|-----------|
| [DEV_DIR]/[WORKTREE_BASE]/task-1 | feat/xxx-task-1 | [任务描述] | 无 | docs/development/xxx-task-1-steps.md |
| [DEV_DIR]/[WORKTREE_BASE]/task-2 | feat/xxx-task-2 | [任务描述] | task-1 接口 | docs/development/xxx-task-2-steps.md |

## 风险点
| 风险 | 概率 | 影响 | 缓解方案 |
|------|------|------|----------|
| [风险描述] | 高/中/低 | 高/中/低 | [方案] |

## 待确认问题
- [ ] [问题1]
- [ ] [问题2]

## 验收标准
- [ ] [可验证的标准1]
- [ ] [可验证的标准2]

## 已知权衡（CC vs Codex 分歧）
| 分歧点 | CC 观点 | Codex 观点 | 决策 | 理由 |
|--------|---------|------------|------|------|
```

---

## Phase 2：Codex 工程审查 Plan Prompt

```
## Context
- Plan 文档：[PLAN_DIR]YYYY-MM-DD-[FEATURE_NAME].md

## Task
从工程实现角度审查此 Plan 文档。

审查维度：
1. 方案可行性：技术方案是否可实现？有无技术障碍？
2. 遗漏细节：有哪些实现细节 Plan 中没有提到？
3. 步骤合理性：实现顺序是否正确？有无依赖关系问题？
4. 边界条件：有哪些边界情况没有处理？
5. 性能/安全：有无明显性能瓶颈或安全问题？

## Acceptance
- [ ] 输出问题列表（按优先级排序）
- [ ] 标注每个问题严重程度（高/中/低）
```

---

## Phase 4：生成 Step-by-Step 开发计划 Prompt

```
## Context
- Plan 文档（已定稿）：[PLAN_DIR]YYYY-MM-DD-[FEATURE_NAME].md

## Task
根据 Worktree 并行计划，为每个 worktree 生成独立的开发计划文件：
- docs/development/YYYY-MM-DD-[FEATURE_NAME]-task-1-steps.md
- docs/development/YYYY-MM-DD-[FEATURE_NAME]-task-2-steps.md
（按 worktree 数量生成对应数量文件，每个文件只含该 worktree 的任务）

每个任务格式：
### 任务 N：[任务名]
**文件：** 修改/新建/测试文件路径
**步骤 1：** 编写失败测试（完整代码）
**步骤 2：** 运行测试确认 FAIL，命令：`pytest tests/xxx.py -v`
**步骤 3：** 实现最小代码（完整代码）
**步骤 4：** 运行测试确认 PASS
**步骤 5：** `git add [文件] && git commit -m "feat: [描述]"`

## Constraints
- 每个任务 diff ≤ 200 行（超过继续拆分）
- 代码必须完整，不能用模糊描述
- 任务间依赖关系必须明确标注
```

---

## Phase 4.5：解耦审查清单

```markdown
## 解耦确认清单

- [ ] 每个任务的修改文件列表互不重叠（或重叠已标注为串行）
- [ ] 任务依赖关系形成 DAG（无循环依赖）
- [ ] 每个任务的测试可以独立运行
- [ ] 并行任务组已确定，串行任务顺序已明确
```

---

## 开发执行（Phase 6 后）

读取并执行 `AI开发-PLan-Program-Debug-Claude和Codex协作/05-ClaudeCode+Codex+Git Worktree-功能分支开发流程模板.md`，从 **Phase 2（创建 worktree）** 开始。

关键节点：
- Phase 2：根据 `BRANCH_MODE` 创建 worktree
  - temporary：`git worktree add [WORKTREE_BASE]/[BRANCH_NAME] -b [BRANCH_NAME]`
  - bare：`git worktree add [BRANCH_NAME] -b [BRANCH_NAME]`（直接在根目录）
- Phase 3：TDD 逐任务实现，每个任务必须完成多轮 Review（见下方）
- Phase 7：合并前必须输出变更摘要，等用户确认

每个任务硬约束：diff ≤ 200 行，超过必须拆分。

---

## 多轮 Review 协议（Phase 6 执行阶段，每个任务必须执行）

> AI 首轮代码质量约 60-70 分，必须至少 2 轮 Review，连续 2 轮无新问题才可提交。

**Diff 上限检查（Review 前先检查）：**
```bash
git diff --stat   # 单次任务 diff 应 ≤ 200 行
# 超过 200 行 → 停止，回到 Phase 4.5 重新拆分任务
```

**Round 1：CC 快速审查（速度优先）**
- 逻辑正确性：实现是否符合任务？边界条件？
- 安全性：XSS、注入、敏感数据泄露？
- YAGNI：有无超出任务范围的额外实现？
- 向后兼容：是否改变了现有公共 API 或数据格式？

输出：问题列表（按严重程度排序），无问题则说"通过"。

**Round 2：Codex 深度审查（质量优先，独立于 Round 1）**
```javascript
mcp__codex__codex({
  model: "gpt-5.3-codex",
  sandbox: "danger-full-access",
  "approval-policy": "on-failure",
  reasoning: "high",
  prompt: "独立审查 [文件列表] 的修改，任务：[描述]
           重点：边界条件、长尾情况、与现有代码一致性及测试覆盖。
           输出候选问题列表，标注严重程度（高/中/低），无问题则说'通过'。"
})
```

**Round 3：Dev Agent 验证（CC 综合两轮发现）**
CC 结合需求 context 对 Round 1 + Round 2 的问题逐条判断真伪、严重程度及修复必要性。
输出：确认需修复的问题列表 → Codex MCP 修复 → 再验证。

**止损阈值（触发后强制拆分，不得继续 Review）：**

| 触发条件 | 动作 |
|---------|------|
| 单任务 Review 超过 5 轮仍有新问题 | 停止 → 回到 Phase 4.5 重新解耦 |
| 单任务 Review 累计超过 3 小时 | 停止 → 汇报改动 → 用户决定 |
| 单任务 Token 消耗超过 50k | 停止 → 汇报改动 → 用户决定 |

触发后流程：停止 Review -> `git status --short` 汇报 -> 用户选择提交/暂存/放弃 -> 回到 Phase 4.5 重新解耦。

---

## Context 刷新策略（防止降智）

- 单个 Codex Session 执行超过 3 个任务 → 开新 Session，重新提供 context
- 发现明显低质量输出（逻辑混乱、忽略约束）→ 立即重启 Session

---

## AI 执行安全约束（强制）

以下操作**未收到用户明确批准前禁止执行**：

```
1. git stash / git stash -u
2. merge main / push main
3. reset --hard / checkout -- . / clean -f
4. 删除任何文件
5. 修改 package.json 依赖 / 公开 API
```

合并前必须先输出变更摘要：
```
即将合并 [BRANCH_NAME] → main，变更摘要：
变更文件（N 个）：[列表]
Commit 列表（N 条）：[列表]
CI 状态：✅ 通过 / ❌ 未通过
请回复"确认合并"后执行。
```

---

## 补充：复杂开发扩展（参考 reference/02、05、06）

### 1. AI 代码质量现实评估与审查预算

> AI 首轮代码质量约 60-70 分（2026Q1 实践数据），每轮 Review 只能召回部分问题。

**Review 预算规划表：**

| 任务规模 | 预期 Review 轮次 | 备注 |
|---------|----------------|------|
| diff ≤ 50 行（微小改动） | 2 轮（例外，需标注） | 短周期 |
| diff 50-200 行 | 3 轮 | 中等周期 |
| diff > 200 行 | 拆分！不要 Review | — |
| 大重构（5k+ 行） | 必须拆分，不要一次做 | — |

**Review 工具优先级：**

| 工具 | Review 质量 | 速度 | 推荐用途 |
|------|------------|------|---------|
| Codex 超高推理 | ⭐⭐⭐⭐⭐ | 慢 | 深度审查，找长尾问题 |
| Claude Code | ⭐⭐⭐⭐ | 中 | 快速审查，结合需求验证 |

### 2. Context 刷新策略（完整版，3 个触发条件）

现有文档仅包含前 2 条，补充第 3 条：

| # | 触发条件 | 动作 |
|---|---------|------|
| 1 | 单个 Codex Session 执行超过 3 个任务 | 开新 Session，重新提供 context |
| 2 | 发现明显低质量输出（逻辑混乱、忽略约束） | 立即重启 Session |
| 3 | **北京时间 21:00 后如发现质量下降** | **重启 Session 或改用 Claude Code 手动处理** |

---

### 3. Phase 4.5 解耦审查升级：三轮完整流程

现有 Phase 4.5 仅有 4 项清单，以下为完整三轮结构：

#### Round 1：CC 自检解耦（Plan Mode）

对每个任务验证 4 个维度：
1. **独立输入/输出**：输入是否只依赖已完成的前置任务？
2. **文件边界清晰**：修改文件列表是否与其他任务不重叠？（重叠 → 拆分或标注串行）
3. **验收标准独立**：测试是否可独立运行，不依赖其他任务代码？
4. **无隐式依赖**：是否有"假设任务X已完成某事"的隐式依赖？

输出：解耦问题列表、任务拆分建议、并行/串行分组。

#### Round 2：Codex 工程审查解耦

4 个关注领域：
1. **文件修改冲突**：列出所有被多个任务修改的文件
2. **函数/变量依赖**：任务A新增的函数，任务B是否依赖？依赖关系是否已标注？
3. **测试隔离**：各任务测试是否互相独立，可并行运行？
4. **并行安全性**：同时在多个 worktree 执行时，会产生哪些 git 冲突？

输出：**解耦评分（1-5）** + 具体问题列表。

#### Round 3：人工最终确认

**文件边界检查：**
- [ ] 每个任务的"修改文件列表"互不重叠（或重叠已标注为串行）
- [ ] 没有两个任务同时修改同一核心文件（如 index.js、config.js）

**依赖关系检查：**
- [ ] 依赖关系形成 DAG（无循环依赖）
- [ ] 所有依赖关系已在计划文档中明确标注
- [ ] 并行任务组已确定

**测试隔离检查：**
- [ ] 每个任务的测试可独立运行
- [ ] 测试不依赖其他任务产生的数据或状态

**并行执行计划表：**

| 批次 | 任务列表 | 分配 worktree |
|------|----------|--------------|
| 批次1（并行） | 任务1, 任务2, 任务3 | worktree-1, worktree-2, worktree-3 |
| 批次2（串行，依赖批次1） | 任务4, 任务5 | worktree-1, worktree-2 |

---

### 4. 验证完成门禁（全阶段通用）

参见 `.claude/workflows/claude-workflow-constants.md` 中的「验证完成门禁（全 workflow 通用）」。

### 6. 自我改进联动

> 参见 `claude-workflow-constants.md` 中的「Self-Improvement 全局规则」

- 任务执行中用户纠正错误 → 立即写入 `tasks/lessons.md`
- 任务完成后如有值得记录的模式/陷阱 → 写入 `tasks/lessons.md`
