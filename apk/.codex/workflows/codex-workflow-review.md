# codex-workflow-review｜Code Review 流程

> 本文档中的所有规则遵循 `codex-workflow-constants.md` 中的全局约束
> 触发条件：用户说"review/审查/检查代码质量/走 review 流程"
> 入口：从 `CODEX.md` 场景路由跳转至此
> 当前模式：Codex 主导，Claude Code 辅助

---

## 核心原则（强制，全场景适用）

> **AI 时代 Code Review 的本质是 Spec/Plan Review**
> 代码是 AI 的"编译产物"，真正应该被 Review 的是驱动 AI 生成代码的 `plan.md`。

1. **P0/P1 问题 → 更新 `plan.md` 重新生成，禁止直接手改代码**
2. **P2/P3 问题 → 记录到 `debug/[feature].md`，作为后续迭代依据**
3. **任何 Review 结论 → 必须经用户确认后才执行修复，AI 不得绕过用户自动改代码**
4. **Review 不等于直接改代码** — Review 只输出问题报告，修复由用户确认后的独立任务完成

---

## 场景路由

```
当前处于哪个阶段？
│
├─ 代码生成之前（plan.md 草稿/审定阶段）
│    └─ → Scene 1: Spec/Plan Review
│
├─ 代码生成之后（AI 已输出代码，改动已在 worktree）
│    └─ → Scene 2: Code Review（P0-P3 分级）
│
└─ 准备合并 PR（feature 分支合并 main 前）
     └─ → Scene 3: PR Review
```

---

## Scene 1 — Spec/Plan Review（计划阶段，代码生成前）

> **目的**：在 AI 生成代码之前，确保 plan.md 自洽、无歧义、工程可行。
> **对应 complex.md Phase 2-3**（可与之联动）。

### 步骤

```
Step 1  定位 plan 文档
        - 读取 docs/plans/ 下最新的 YYYY-MM-DD-[feature].md
        - 若不存在，停下报告："未找到 plan.md，请先完成 Phase 1 (Plan 文档生成)"

Step 2  Codex 计划审查（高推理规划轮，速度优先）
        审查维度：
        - 逻辑自洽性：需求理解→方案→验收标准是否前后一致？
        - 歧义点：是否存在实现者需要猜测意图的地方？
        - 边界条件：是否覆盖了空输入、异常路径、并发场景？
        - 风险点：哪些决策最容易出错？是否有缓解措施？
        输出：问题列表（标注严重程度 高/中/低）

Step 3  Claude Code 独立审查（工程可行性，独立于 Step 2）
        Skill: superpowers:requesting-code-review
        审查维度：
        - 技术可行性：方案是否可实现？有无技术障碍？
        - 遗漏细节：实现时会用到但 plan 没提到的细节？
        - 步骤合理性：实现顺序是否正确？依赖关系是否正确？
        - 性能/安全：有无明显瓶颈或安全问题？
        输出：问题列表（标注严重程度 高/中/低）

Step 4  汇总 + 记录分歧
        - Codex 汇总两轮问题，合并去重
        - 分歧点记录到 plan.md 「已知权衡（Codex vs Claude Code 分歧）」表
        - 向用户展示汇总报告，等待用户确认采纳哪些意见

Step 5  更新 plan.md 并确认定稿
        - Codex 依据用户确认的意见更新 plan.md
        - plan.md 状态更新为"定稿"
        - 用户说"确认"后，才可进入代码生成（Phase 6）
```

---

## Scene 2 — Code Review（代码生成后，P0-P3 分级）

> **目的**：AI 生成代码后，系统化发现问题，按优先级分级处置。
> **对应 complex.md「多轮 Review 协议」**（本文件是入口，complex.md 是执行细节）。

### 问题分级定义

| 级别 | 名称 | 处置方式 |
|------|------|----------|
| **P0** | Critical | **必须阻塞**：回到 plan.md 修改后重新生成代码 |
| **P1** | High | **合并前修复**：更新 plan.md 重新生成，不得直接手改 |
| **P2** | Medium | 记录到 `debug/[feature].md`，下轮迭代处理 |
| **P3** | Low | 可选改进，记录到 `debug/[feature].md` |

### 步骤

```
Step 1  确定改动范围（Preflight）
        git diff --stat HEAD
        git diff --name-only HEAD
        → 若 diff > 200 行：停下，提示用户"改动超 200 行，建议回到 Phase 4.5 重新拆分"

Step 2  Codex Round 1 — 快速审查（速度优先）
        检查维度：
        ├─ SOLID 原则：SRP / OCP / LSP / ISP / DIP 违规？
        ├─ 安全扫描：XSS / 注入 / 敏感数据 / 竞态条件？
        ├─ 错误处理：吞掉的异常？缺失的 try-except？async 错误处理？
        ├─ 边界条件：Null / 空集合 / off-by-one / 溢出？
        ├─ YAGNI：有无超出当前任务范围的额外实现？
        └─ 向后兼容：是否改变了现有公共 API 或数据格式？
        输出：问题列表（标注 P0-P3）

Step 3  Claude Code Round 2 — 深度审查（质量优先，独立于 Round 1）
        Skill: superpowers:requesting-code-review
        Claude Code Prompt 模板：
        ──────────────────────────────────────────
        ## Context
        - 改动文件：[文件列表]
        - 任务描述：[本次任务简述]
        - plan 文件：[docs/plans/YYYY-MM-DD-feature.md 路径]

        ## Task
        独立审查上述改动，重点关注：
        1. 边界条件和长尾情况
        2. 与现有代码的一致性（命名/风格/模式）
        3. 测试覆盖是否充分（有无遗漏的测试路径）
        4. 废代码识别（找出死代码，给出安全删除计划）

        ## Acceptance
        - 按 P0-P3 输出问题列表（无问题则说"通过"）
        ──────────────────────────────────────────

Step 4  Codex 综合仲裁（Round 1 + Round 2 合并）
        - 逐条判断真伪（区分误报和真实问题）
        - 标注最终优先级（P0/P1/P2/P3）
        - 向用户展示最终 Review 报告，按分级展示

Step 5  用户确认 + 分级处置
        - 展示完整报告，等待用户确认
        - P0/P1：用户确认后，更新 plan.md → 让 AI 重新生成（禁止直接改代码）
        - P2/P3：记录到 debug/[feature].md，无需立即处理
        - 确认步骤（Step 5）保证 Codex 不绕过人工直接修复
```

### Review 止损阈值

| 触发条件 | 动作 |
|---------|------|
| 单任务 Review 超过 5 轮仍有 P0/P1 问题 | 停止 → 回到 Phase 4.5 重新解耦 |
| Review 累计超过 3 小时 | 停止 → 汇报改动 → 用户决定 |
| Token 消耗超过 50k | 停止 → 汇报改动 → 用户决定 |

---

## Scene 3 — PR Review（合并前）

> **目的**：feature 分支合并 main 前，提供人工确认环节，禁止 AI 自动 approve。

### 步骤

```
Step 1  展示变更摘要（必须先展示，再进行任何操作）
        ────────────────────────────────────────────
        即将合并 [BRANCH_NAME] → main，变更摘要：
        变更文件（N 个）：[列表]
        Commit 列表（N 条）：[列表]
        CI 状态：✅ 通过 / ❌ 未通过 / ⚠️ 未执行
        ────────────────────────────────────────────

Step 2  Codex 准备 Review 评论（PENDING 状态，不立即提交）
        - 分析 PR diff，准备评论列表（含代码建议块）
        - 每条评论标注 P0-P3 级别
        - 向用户展示评论列表，等待用户校对

Step 3  用户确认后执行
        - 用户说"确认合并" → 执行合并
        - 用户说"等修完再合" → 停止，记录待修问题
        - 禁止 AI 自动 approve，任何合并都需要用户明确指令
```

---

## 与 complex.md 的关系

| 场景 | 使用文档 |
|------|---------|
| Plan 阶段 Review（Phase 2-3） | **本文件 Scene 1**（新增，更系统化的入口） |
| 代码生成后 Review（Phase 6 执行阶段） | **本文件 Scene 2** + `complex.md` 多轮 Review 协议（执行细节） |
| PR 合并前 | **本文件 Scene 3**（新增） |

> **分工原则**：本文件是 Review 入口（场景识别 + 分级框架），`complex.md` 是执行细节（Codex 调用模板）。两者互补，不重复。

---

## Self-Improvement 联动

- P0/P1 问题根因 → 同步写入 `tasks/lessons.md`（防止同类问题复现）
- Review 超过 3 轮仍有新问题 → 写入 `tasks/lessons.md`，标注"任务粒度判断失误"

> 参见 `codex-workflow-constants.md` 中的「Self-Improvement 全局规则」
