# workflow-constants.md — 全局硬约束与常量

此文档是所有工作流的"单一真相"来源。所有其他文档应引用此文档，而非复制规则。

---

## Codex MCP 调用规范（不可变）

### 必填参数（MANDATORY）

```javascript
{
  model: "gpt-5.3-codex",
  sandbox: "danger-full-access",
  "approval-policy": "on-failure",
  reasoning: "high" | "medium" | "low"  // 见下方 reasoning 选择规则
}
```

**规则**：
- 每次调用 Codex MCP 都必须包含这四个参数
- 参数值不得更改
- 参数名必须使用引号（JSON 对象语法）

**reasoning 选择规则：**
| 任务类型 | reasoning 值 | 说明 |
|---------|-------------|------|
| 代码审查 / Bug 根因分析 / 实施计划编写 | `high` | 需要深度推理，先分析再结论 |
| 复杂重构 / 跨模块改动 | `medium` | 需要理解上下文和依赖关系 |
| 直接编码 / 小改动（<50行）/ 并行执行子任务 | `low` | 直接执行，无需深度推理；只输出实现与结果 |

### 会话管理

**首次调用**：
```javascript
mcp__codex__codex({
  model: "gpt-5.3-codex",
  sandbox: "danger-full-access",
  "approval-policy": "on-failure",
  prompt: "<结构化 Prompt>"
})
// 保存返回的 threadId
```

**后续调用**：
```javascript
mcp__codex__codex_reply({
  threadId: "<保存的 ID>",
  prompt: "<下一步>"
})
```

**字段名**：统一使用 `threadId`（不用 conversationId）

---

## 文件操作边界与删除禁令（不可变）

### 风险原则

- `sandbox: "danger-full-access"` 是 MCP 调用所需权限，不等于允许无边界文件操作
- 每次调用必须通过 Prompt 约束 + Hook 拦截 + CC 验收三层防护

### CC 调用前（强制注入 Constraints）

在给 Codex 的 Prompt 中必须包含：

```text
Scope: Only modify files under [当前 worktree 绝对路径]
Forbidden: Do not modify, delete, or move files outside this directory
Forbidden: Do not run rm -rf, del, rd /s, Remove-Item -Recurse, git clean -f, git reset --hard
Forbidden: Do not modify .git/ or config files outside project root
```

### CC 验收时（强制检查）

```bash
git diff --name-only HEAD
```

规则：
- 改动文件必须全部在本次任务 Scope 内
- 发现任何范围外改动，立即中止，不得 commit
- Codex 如执行了删除类命令，立即中止并人工复核

### Hook 强制拦截（本机）

- 使用 `~/.claude/settings.json` 的 `PreToolUse` Hook 拦截删除类命令
- 拦截脚本路径：`C:/Users/Administrator/.claude/hooks/block-delete.py`
- 推荐 matcher：`Bash` + `Shell` + `PowerShell`（避免工具名差异导致漏拦截）
- 默认策略：`block` 删除类命令，除非用户显式批准并临时放开
- 脚本输入兼容：`stdin` 和 `CLAUDE_TOOL_INPUT`（避免不同客户端输入方式导致漏拦截）

验证方法（建议每次改 Hook 后执行）：

```bash
echo '{"command":"rm -rf C:/test"}' | python C:/Users/Administrator/.claude/hooks/block-delete.py
echo '{"command":"echo hello"}' | python C:/Users/Administrator/.claude/hooks/block-delete.py
```

预期：
- 第一条返回 `decision=block`
- 第二条返回 `decision=approve`

---

## Codex 推理强度规则（不可变）

默认继承本地配置 `model_reasoning_effort = "high"`，但在 Prompt 层按任务类型约束：

| 任务类型 | 推理强度 | Prompt 约束语句 |
|---|---|---|
| 代码审查 / 根因调试 / 架构分析 / 计划编写 | `high` | `需要深度推理，先分析再结论。` |
| 复杂重构 / 跨模块改动 | `medium` | `需要理解上下文和依赖关系。` |
| 直接写代码 / 单文件小改 / 并行执行子任务 | `low` | `直接执行，无需深度推理；只输出实现与结果。` |

规则：
- 审查、调试、规划类任务保持 `high`
- 涉及依赖上下文的复杂改动降为 `medium`
- 直接交付代码的小型任务在 Prompt 中显式降为 `low`
- 当任务从"实现"升级为"疑难分析"时，立即切回 `high`

---

## Superpowers 调用规范（Windows，不可变）

> **重要区分**：以下规范仅适用于 **Codex MCP 场景**（在发给 Codex 的 prompt 中使用）。
>
> **Claude Code 本会话**：使用内置 `Skill` 工具（key 来自 `settings.json` → `enabledPlugins`，如 `code-review@claude-plugins-official`），详见 `claude.md` 「Skill 选择规则 A」。

### 固定命令（绝对路径）

```text
bootstrap:
node C:/Users/Administrator/.codex/superpowers/.codex/superpowers-codex bootstrap

use-skill:
node C:/Users/Administrator/.codex/superpowers/.codex/superpowers-codex use-skill <skill-name>
```

规则：
- Windows 场景统一使用绝对路径，不使用 `~/.codex/...`
- 需要使用 skill 时，必须先 `bootstrap`，再 `use-skill`
- **仅用于 Codex MCP 调用场景**，Claude Code 本会话使用 `Skill` 工具（不通过此 node 命令）
- 若任何提示词/插件输出出现 `~/.codex/superpowers/.codex/superpowers-codex ...`，必须先改写为 `node C:/Users/Administrator/.codex/superpowers/.codex/superpowers-codex ...` 再执行
- 禁止在 Windows PowerShell 里直接执行 `~/.codex/.../superpowers-codex`（会触发文件关联错误）

### Skill 选择规则（仅 Codex MCP 场景）

在发给 Codex 的 prompt 中，按任务类型选择 skill：

| 任务类型 | 必选 skill |
|---|---|
| 代码审查 | `superpowers:requesting-code-review` |
| 审查反馈处理 | `superpowers:receiving-code-review` |
| 新功能方案发散 | `superpowers:brainstorming` |
| Bug 根因分析 | `superpowers:systematic-debugging` |
| 实施计划编写 | `superpowers:writing-plans` |
| 多任务并行分发 | `superpowers:dispatching-parallel-agents` |
| 直接写代码（并行开发） | 不调用 skill，直接执行 |

规则：
- 禁止默认把所有分析任务路由到 `superpowers:brainstorming`
- 代码审查必须优先用 `superpowers:requesting-code-review`
- 任务目标是"直接改代码并交付"时，不注入 skill
- Claude Code 本会话使用 `Skill` 工具调用官方插件，不通过此规范

---

## Git 安全约束（不可变）

### 禁止操作（未获用户明确批准）

- ❌ `git stash`（丢失工作）
- ❌ `git reset --hard`（不可恢复）
- ❌ `git push --force`（覆盖远程）
- ❌ `git checkout .`（丢失改动）
- ❌ `git clean -f`（删除文件）

### 必须操作（强制门禁）

**创建 worktree 前**：
```bash
git status --short
# 如果有未提交改动，询问用户：
# A) 提交当前改动
# B) 暂存到 stash（需用户确认）
# C) 放弃改动（需用户确认）
```

**合并前**：
```bash
git diff --stat [base-branch]...HEAD
# 输出变更摘要，等用户确认后再合并
```

并行任务（worktree）额外门禁：
```bash
python .claude/scripts/verify_parallel_scope.py \
  --table docs/development/[feature]-impact-scope.md \
  --task [task-id] \
  --base main
```
影响范围表模板：`docs/templates/parallel-impact-scope-template.md`
注：若默认主分支不是 `main`，必须按仓库实际主分支替换 `--base`。
返回非 0 时，禁止合并。

### SCAN_SUMMARY 刷新规则（claude.md）

- SCAN_SUMMARY 写入位置：`claude.md` 的 `<!-- SCAN_SUMMARY_START -->` 与 `<!-- SCAN_SUMMARY_END -->` 之间
- 触发刷新条件：重大架构变更 / 核心模块新增或删除 / 距上次扫描超过 7 天
- 刷新命令：`python .claude/skills/largebase-structured-scan/scan.py export-to-claude-md --db [latest_scan_db] --claude-md claude.md`
- 责任人：触发 largebase 扫描的一方在交付前必须刷新并核对摘要时效

**合并冲突时**：
- 发现冲突必须立即停止自动流程并报告
- 禁止 AI 自动批量修改冲突块后直接提交
- 冲突解决后必须重新执行全量测试与关键 E2E

---

## 角色边界（不可变）

### CC（Claude Code）职责

✅ **必须做**：
- 规划、搜索、决策
- 需求讨论、复杂度判断
- 代码审查、安全检查
- 工作流路由

✅ **可以做**（例外）：
- 微小改动（<20 行，无逻辑）
- 纯文档改动（注释、README）
- 简单配置调整

❌ **禁止做**：
- 业务逻辑代码生成
- 复杂重构
- 跨文件改动

### Codex（GPT-5-Codex）职责

✅ **必须做**：
- 所有代码生成、修改、重构
- 代码审查（深度）
- 测试编写
- 大型代码库扫描

---

## 工作流路由优先级（不可变）

**从高到低**：
1. **Debug** — 用户描述 bug / 错误 / 测试失败
2. **研究调研** — 用户说"调研/对比/选型/搜索/研究"
3. **大型代码库** — 递归代码文件 > 20（含子目录）/ 跨 3+ 模块 / Markdown 与参考文档较多 / 命中"重构迁移、影响分析、先扫描"关键词 / 用户显式要求先扫描
4. **复杂开发** — 任意简单标准不满足
5. **简单开发** — 满足全部 4 条简单标准

**规则**：
- 优先级高的流程优先匹配
- 一旦匹配，不再检查低优先级
- 复杂开发不应吞掉专用流程

---

## 确认词与门禁（不可变）

### 用户确认词

| 词 | 含义 | 后续行动 |
|---|------|---------|
| "确认" / "开始" / "可以" | 同意当前方案 | 进入执行阶段 |
| "不用扫描，直接改" | 跳过 Phase 0 | 直接进入 Phase 1 |
| "先扫一下" / "先了解结构" | 触发 Phase 0 | 执行扫描 |
| "直接开始" | 跳过所有预检 | 直接改码（仅简单模式） |

### 强制门禁

| 门禁 | 触发条件 | 处理 |
|------|---------|------|
| 需求讨论 | 任何新任务 | 必须复述需求、列出歧义、等用户确认 |
| 复杂度判断 | 任何新任务 | 必须判断并说明走哪个流程 |
| 创建 worktree | 任何分支工作 | 必须先 git status，处理脏仓 |
| 合并前确认 | 任何 merge/PR | 必须输出变更摘要，等用户确认 |
| 扫描质量检查 | 大型库扫描完成 | 必须验证 00-06 文件完整性 |

---

## 数据格式标准（不可变）

### Codex 输出

**必须包含**：
- 结构化数据（JSON / 表格）
- 文件路径 + 行号引用
- 验证点 / 测试用例
- 信息缺口标注

**禁止**：
- 纯散文输出
- 无法追溯的结论
- 模糊的"可能"/"也许"

### 扫描包标准（largebase）

**必须文件**：
- `00-scan-meta.json` — 元数据
- `01-architecture.md` — 架构
- `02-dataflow.md` — 数据流
- `03-api-surface.md` — API
- `04-reference-constraints.md` — 约束
- `05-impact-matrix.md` — 影响矩阵
- `06-exec-brief.md` — 执行摘要

**可选文件**：
- `scan.db` — SQLite 数据库
- `scan-data.json` — 结构化数据

---

## 引用方式

所有工作流文档应这样引用本文档：

```markdown
> 参见 `workflows/claude-workflow-constants.md` 中的"Codex MCP 调用规范"
```

而不是复制规则。

---

## 补充：工具生态与安全防护扩展（参考 reference/02、09、11）

### 1. 多模型工具角色矩阵

| 工具 | 角色 | 擅长 | 何时用 |
|------|------|------|--------|
| Antigravity + Opus + Plan Mode | 需求分析师 + 架构师 | 深度需求澄清、架构决策、发现歧义（1M token 上下文，SWE-bench 74.5%） | 仅用于最初 Plan 生成，质量最高 |
| Claude Code (CC) + Plan Mode | 日常规划者 | 单任务分析、文件搜索、改动预览 | 日常开发中每个任务前 |
| Codex (gpt-5-codex) 插件版 | 高级工程师 | step-by-step 计划、代码生成、长时间连续执行 | 代码生成、工程审查、MCP 自动调用 |
| Claude Sonnet (Kiro/Antigravity) | 快速编码 | 中等复杂度任务、快速迭代 | 并行开发分支二 |
| Trae + gpt-5-codex | 省 Token 编码 | 简单任务、节省成本 | 并行开发分支三（需频繁点继续） |

---

### 2. Skills 生态

#### 2.1 Skills 本质

每个 skill 是一个目录，核心入口是 `SKILL.md`，可包含脚本、模板、示例。

```
~/.claude/skills/
└── my-skill/
    ├── SKILL.md        ← 必须有，核心入口
    ├── templates/      ← 可选
    ├── examples/       ← 可选
    └── scripts/        ← 可选
```

**激活机制**：启动时只加载所有 skill 的 name + description（~100 token）；判断匹配当前任务时才加载完整内容（<5k token）。多个 skill 可同时激活组合使用。

#### 2.2 安装方式对比

| 方式 | 命令示例 | 特点 |
|------|---------|------|
| `/plugin`（原生，推荐） | `/plugin add levnikolaevich/claude-code-skills` | Claude Code 内直接安装，重启生效 |
| `npx skills`（Vercel） | `npx skills add owner/repo --skill name -a claude-code -g` | 跨 agent 通用，符号链接，支持 `update`/`list` |
| `npx add-skill`（零依赖） | `npx add-skill owner/repo --skill name` | 最快，无额外依赖 |

#### 2.3 superpowers 详细介绍

**仓库**：`obra/superpowers` — 20+ 生产级 skill，覆盖需求澄清到 TDD、调试、审查全链路。

| Skill | 自动触发时机 | 作用 |
|-------|------------|------|
| `brainstorming` | 开始写代码前 | 问答精炼需求，分段展示设计 |
| `writing-plans` | 设计确认后 | 生成 2-5 分钟粒度任务，含文件路径、验证命令 |
| `subagent-driven-development` | 有计划后 | 每任务派独立 subagent，两阶段 review |
| `test-driven-development` | 实现过程中 | 强制 RED→GREEN→REFACTOR |
| `systematic-debugging` | 调试时 | 四阶段：根因→模式→假设→实现，3 次失败触发架构审查 |
| `using-git-worktrees` | 设计确认后 | 隔离工作区，验证干净测试基线 |
| `writing-skills` | 创建新 skill 时 | 用 TDD 原则编写和测试新 skill |

安装：
```bash
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
# 重启 Claude Code 后生效
```

#### 2.4 引入优先级

```
阶段1（现在）：不装任何 Skills，用真实任务跑通基础流程
  ↓
阶段2（感受到明显痛点再装）：
  TDD/规划/调试想标准化        → superpowers（最推荐先装）
  文档查询慢、context 丢失     → NotebookLM Skill 或 MCP
  会话切换上下文丢失           → claude-code-tools
  ↓
阶段3（团队扩大，需要更严格流程）：
  标准化 Agile 审查流水线      → levnikolaevich/claude-code-skills
  大量重复 Codex 调用模板      → alirezarezvani/skill-factory
```

#### 2.5 何时引入 Skills 决策表

| 你的现状 | 建议 |
|---------|------|
| 刚跑通基础流程，还在摸索 | **不装**，先积累经验 |
| 反复写类似任务描述 | 引入 superpowers 或 skill-factory |
| 会话切换频繁，上下文丢失 | 引入 claude-code-tools |
| 大量内部文档需 Claude 查阅 | 引入 NotebookLM Skill/MCP |
| 多人协作，需统一审查流程 | 引入 levnikolaevich/claude-code-skills |
| 想要完整 TDD+调试+规划一体化 | 引入 superpowers |

---

### 3. 安全防护工具

#### 3.1 dcg（destructive_command_guard）— 最推荐

- **实现**：Rust，<10μs 响应，AST 级分析
- **能力**：识别 heredoc/内嵌脚本中的危险命令，不误报（`git commit -m "Fix rm -rf"` 不触发）
- **覆盖**：`rm -rf`、`git reset --hard`、`git clean -f`、`git push --force`、`DROP TABLE`、`chmod 777`、`curl | bash`、Python/JS 内嵌 `os.remove`/`shutil.rmtree`

安装：
```bash
# Linux/macOS 一键安装（自动注册 PreToolUse hook）
curl -fsSL "https://raw.githubusercontent.com/Dicklesworthstone/destructive_command_guard/master/install.sh" | bash -s -- --easy-mode

# Windows：下载 release 二进制放到 C:/Users/Administrator/.claude/hooks/dcg.exe，手动注册 hook
```

验证：
```bash
echo '{"tool_name":"Bash","tool_input":{"command":"rm -rf /tmp/test"}}' | dcg
# 应输出 BLOCKED
```

#### 3.2 claude-code-damage-control（可定制 patterns）

- **实现**：Python/YAML，支持"直接拒绝"和"询问确认"两种模式
- **安装**：`/plugin add disler/claude-code-damage-control`
- **核心**：`patterns.yaml` 可自定义拦截规则 + `zeroAccessPaths` 禁止访问路径

#### 3.3 自动 Git 提交工具对比

| 工具 | 触发时机 | Message 质量 | 推荐场景 |
|------|---------|-------------|---------|
| **claudekit**（推荐） | 每次会话结束 | ⭐⭐⭐⭐ | 自动 checkpoint + 代码质量 hooks |
| CLAUDE.md 指令 | AI 自判断 | ⭐⭐⭐⭐⭐ | 首选，最简单 |
| Stop Hook（自写） | 每次响应结束 | ⭐⭐ | 保底防漏提交 |
| claude-auto-commit | 手动触发 | ⭐⭐⭐⭐⭐ | 批量整理 commit |
| GitButler | 每次文件修改 | ⭐⭐⭐⭐⭐ | 并行 worktree 场景 |

claudekit 安装：
```bash
npm install -g claudekit
claudekit setup  # 在项目目录运行，自动配置 hooks
```

**推荐组合**：CLAUDE.md 指令（主）+ claudekit checkpoint（保底）

---

### 4. Hooks 配置位置与合并规则

| 文件位置 | 生效范围 | 是否提交 git |
|---------|---------|-------------|
| `~/.claude/settings.json` | 全局，所有项目 | 否（个人机器） |
| `.claude/settings.json` | 仅当前项目 | 是（团队共享） |
| `.claude/settings.local.json` | 仅当前项目 | 否（个人配置） |

**合并规则**：多个文件的同类 hook 会合并执行，都会触发。安全防护建议放全局，项目质量检查放项目级。

---

### 5. 推荐配置组合

**最小配置（30 分钟）**：
1. 安装 dcg 安全防护（或 Windows 用官方最简 Hook）
2. CLAUDE.md 加 git 提交规范 + 文件操作限制指令
3. Stop Hook 保底自动 checkpoint

**进阶叠加**：
- 可定制安全 patterns → claude-code-damage-control
- 自动 checkpoint + 代码质量检查 → claudekit
- 并行 worktree 自动隔离提交 → GitButler
- TDD/调试/规划标准化 → superpowers

---

## 项目配置（init 生成，可手动修改）

> 由 `claude-workflow-init.md` 流程写入，后续所有工作流读取此处常量，不再询问用户。
> 未运行 init 流程时，使用下方默认值。

| 常量 | 默认值 | 说明 |
|------|--------|------|
| `BRANCH_MODE` | `temporary` | 分支管理模式：`temporary`（临时分支）/ `bare`（Bare Repo）|
| `WORKTREE_BASE` | `worktrees` | worktree 目录前缀，可选：`worktrees` / `.worktree` / `.` |
| `MAIN_BRANCH` | `master` | 主分支名，可选：`master` / `main` |
| `PROJECT_ROOT` | _(运行时自动检测)_ | 项目根目录绝对路径 |
| `INIT_DATE` | _(未初始化)_ | 初始化日期 |

**使用方式**（在其他 workflow 文档中引用）：

```bash
# 创建 worktree 时，路径使用 WORKTREE_BASE 常量
git worktree add [PROJECT_ROOT]/[WORKTREE_BASE]/feat-xxx -b feat/xxx

# 合并时，目标分支使用 MAIN_BRANCH 常量
git switch [MAIN_BRANCH]
git merge --no-ff feat/xxx
```

---

## Self-Improvement 全局规则（不可变）

> 所有 workflow 文档应引用本区块，而非各自定义 lessons 规则。

### 文件路径

- 固定路径：`tasks/lessons.md`（项目根目录下）
- 首次使用时自动创建

### 格式

```markdown
- [YYYY-MM-DD] [场景/bug-id] → 错误根因 → 下次防范方式
```

### 写入时机（强制）

| 触发事件 | 写入内容 |
|----------|----------|
| 用户纠正 AI 错误 | 错误 pattern + 防范规则 |
| Bug 修复完成（debug Phase 5） | 根因 + 预防措施 |
| 任务执行中发现可复用经验 | 经验 pattern |
| Review 超过 3 轮仍未通过 | 记录"任务粒度判断失误"及原因 |
| 触发模式升级（简单变复杂） | 记录"初始判断为简单模式但实际需升级"的原因 |

### 读取时机（强制）

| 触发事件 | 读取目的 |
|----------|----------|
| 任何新任务开始（强制门禁 Step 3） | 规避历史错误 |
| 每个 Codex Session 开始 | 注入相关约束到 Prompt |

### 验证完成门禁（全 workflow 通用）

每个任务标记完成前，必须满足：
- ✓ 运行测试 / 实际调用，证明功能可用
- ✓ **质量自检清单（必须全过）**：
  - 问题真是存在吗？这是真实问题还是想象的？（拒绝过度工程）
  - 有没有更简单的方式？（始终寻求最简方案）
  - 这会破坏现有功能/向后兼容吗？（向后兼容是铁律）
  - Staff Engineer 会批准这个最终方案吗？
- ✓ 对非简单修复：主动思考「有没有更优雅的写法？」，若有则重构

---

## 全局排版约束

### 表格排版格式
所有工作流和 AI 输出中的 Markdown 表格必须统一排版格式，以提升可读性：
- 推荐统一使用**左对齐**（`|:---|`）或**居中对齐**（`|:---:|`）。
- 确保表格信息结构清晰，避免混用对齐引发歧义，方便复盘和阅读。

---

## 版本历史

- 2025-02-26：初版，统一全局硬约束
- 2026-02-27：新增 Superpowers 调用规范（Windows 绝对路径 + Skill 选择规则）
- 2026-02-27：新增删除命令 Hook 验证说明（PreToolUse + block-delete.py）
- 2026-02-27：移动到 `.claude/workflows/` 目录，更新引用方式
- 2026-02-27：新增"补充：工具生态与安全防护扩展"（多模型角色矩阵、Skills 生态、安全防护工具、Hooks 配置、推荐配置组合）
- 2026-02-28：新增"项目配置"区块，支持 WORKTREE_BASE / MAIN_BRANCH 常量
- 2026-03-01：新增"Self-Improvement 全局规则"（lessons.md 路径/格式/读写时机/验证门禁）
