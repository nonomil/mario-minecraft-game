# 08｜社区 Skills 生态与 NotebookLM 集成指南

> **定位：** 本文档是增强项，不是必需项。
> 前置条件：已完成《02-环境配置》的基础流程（CLI + MCP + CLAUDE.md），并用真实任务跑通过至少一次完整协作循环。
> **最近验证：2026-02-26**

---

## 0. 先看这里：要不要引入 Skills？

| 你的现状 | 建议 |
|---------|------|
| 刚跑通基础流程，还在摸索习惯 | **不装**，先用真实任务积累经验 |
| 发现自己反复写类似的任务描述 | 考虑引入 superpowers 或 skill-factory 封装流程 |
| 会话切换频繁，上下文经常丢失 | 考虑引入 claude-code-tools |
| 有大量内部文档/设计文档需要 Claude 查阅 | 考虑引入 NotebookLM Skill 或 MCP |
| 多人协作，需要统一全链路审查流程 | 考虑引入 levnikolaevich/claude-code-skills |
| 想要完整的 TDD + 调试 + 规划一体化工作流 | 考虑引入 superpowers |

**Skills 不是 MCP 的替代品**，两者解决不同问题：
- MCP：Claude Code ↔ Codex 之间的**通信管道**（必须有，已装）
- Skills：特定任务流程的**封装和复用**（按需引入）

---

## 1. Skills 的本质

每个 skill 是一个目录，核心入口是 `SKILL.md`。目录内可包含脚本、模板和引用文档，用于固化一类任务流程。

```
~/.claude/skills/
└── my-skill/
    ├── SKILL.md        ← 必须有，核心入口
    ├── templates/      ← 可选，模板文件
    ├── examples/       ← 可选，示例输出
    └── scripts/        ← 可选，可执行脚本
```

**Skills 如何激活：** 启动时 Claude Code 只加载所有 skill 的 name 和 description（约 100 token），判断当前任务是否匹配，匹配时才加载完整 skill 内容（< 5k token）。多个 skill 可同时激活并组合使用。

**实践分工建议：**
- Claude Code：结构化项目、治理文件、流程编排与验收
- Codex CLI：代码细化、可读性优化、性能优化
- 组合：Claude 定义框架与边界，Codex 精修实现细节

---

## 2. Skills 安装方式总览

安装方式有三种，**优先推荐 `/plugin` 原生方式**：

### 方式 A：`/plugin`（Claude Code 原生，推荐）

直接在 Claude Code 会话中说出来，Claude 会自动帮你安装：

```bash
# 在 Claude Code 中输入：
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace

# 或直接 add（支持 GitHub shorthand）：
/plugin add levnikolaevich/claude-code-skills
```

重启 Claude Code 后生效。验证：
```bash
/help   # 应该能看到新增的 slash commands
```

### 方式 B：`npx skills`（Vercel，跨 agent 通用）

支持列出、选择性安装、跨 agent 安装，创建从各 agent 到 canonical 副本的符号链接。

```bash
# 查看仓库中有哪些 skill
npx skills add owner/repo --list

# 安装指定 skill 到 Claude Code
npx skills add owner/repo --skill skill-name -a claude-code

# 安装全部 skill
npx skills add owner/repo --all -a claude-code

# 全局安装（所有项目生效）
npx skills add owner/repo --skill skill-name -g -a claude-code

# 更新已安装 skill
npx skills update

# 查看已安装列表
npx skills list
```

### 方式 C：`npx add-skill`（零依赖，快速）

```bash
npx add-skill owner/repo --skill skill-name
```

---

## 3. superpowers（★ 重点推荐）

**仓库：** `obra/superpowers`
**定位：** 完整的软件开发工作流框架，20+ 生产级 skill，覆盖从需求澄清到 TDD 实现、调试、审查的全链路。

### 3.1 它能做什么？

Superpowers 包含以下核心 skill，技能会自动根据上下文触发：`brainstorming`（写代码前激活，通过问答精炼需求，探索替代方案，分段展示设计供确认）、`writing-plans`（设计确认后激活，将工作拆分为 2-5 分钟的精确任务，每个任务包含确切文件路径、完整代码和验证步骤）、`subagent-driven-development`（执行计划时激活，为每个任务派发独立 subagent，含两阶段 review：规范合规 + 代码质量）、`test-driven-development`（实现过程中激活，强制 RED-GREEN-REFACTOR：先写失败测试，看着它失败，再写最少代码，看着它通过，然后提交）。

调试方面，systematic methodology 引导你完成根因调查、模式分析、假设测试和实现，三次修复失败后自动触发架构审查。`writing-skills` 模块教你用 TDD 原则编写和测试新的 skill。

**与你的主流程高度契合：**
- 你用 Opus Plan Mode 做需求澄清 → superpowers 的 `brainstorming` 做同样的事，且自动触发
- 你手动写 step-by-step 计划 → `writing-plans` 自动生成，格式标准化
- 你用 worktree 并行开发 → `using-git-worktrees` skill 内置此流程
- 你做 3 轮 Review → `subagent-driven-development` 内置两阶段 review

### 3.2 安装

**推荐方式（在 Claude Code 中直接说）：**

```bash
# 1. 注册 superpowers marketplace
/plugin marketplace add obra/superpowers-marketplace

# 2. 安装 superpowers 插件
/plugin install superpowers@superpowers-marketplace

# 3. 退出并重启 Claude Code
# 重启后你会看到 session-start-hook 注入的提示，说明安装成功
```

**验证安装：**
```bash
/help
# 应该能看到：
# /superpowers:brainstorm  - Interactive design refinement
# /superpowers:write-plan  - Create implementation plan
# /superpowers:execute-plan - Execute plan in batches
```

**更新：**
```bash
/plugin update superpowers
```

### 3.3 核心 Skill 说明

| Skill | 自动触发时机 | 作用 |
|-------|------------|------|
| `brainstorming` | 开始写代码前 | 通过问答精炼需求，分段展示设计，保存设计文档 |
| `using-git-worktrees` | 设计确认后 | 在新分支创建隔离工作区，运行项目初始化，验证干净的测试基线 |
| `writing-plans` | 有确认的设计后 | 生成任务粒度 2-5 分钟的详细计划，含文件路径、验证命令 |
| `subagent-driven-development` | 有计划后 | 每个任务派独立 subagent，两阶段 review（规范合规 + 代码质量） |
| `test-driven-development` | 实现过程中 | 强制 RED→GREEN→REFACTOR 循环 |
| `systematic-debugging` | 调试时 | 四阶段方法：根因调查→模式分析→假设测试→实现，3 次失败触发架构审查 |
| `writing-skills` | 创建新 skill 时 | 用 TDD 原则编写和测试新 skill |

### 3.4 日常使用

Skills 会**自动触发**，无需手动调用。也可以显式调用：

```bash
# 在 Claude Code 中：
> 我想实现一个用户权限模块
# → brainstorming skill 自动激活，开始问答精炼需求

/superpowers:write-plan
# → 基于当前设计生成详细任务计划

/superpowers:execute-plan
# → 按批次执行计划，含 review 检查点
```

---

## 4. levnikolaevich/claude-code-skills（全链路 Agile 流水线）

**仓库：** `levnikolaevich/claude-code-skills`
**定位：** 102 个生产级 skill，覆盖完整敏捷开发生命周期，从项目引导、文档生成、Scope 分解到任务执行、质量门禁、代码审计。

### 4.1 它能做什么？

Claude Opus 是主模型。代码和 Story 审查时，skill 会委托给外部 agent（OpenAI Codex、Google Gemini）进行并行多模型审查，外部 agent 不可用时自动 fallback 到 Claude Opus。

核心流水线：
```
ln-700 项目引导（创建或改造为 Clean Architecture）
  ↓
ln-100 文档生成流水线
  ↓
ln-200 Scope → Epics → Stories 分解
  ↓
ln-400 Story 执行（任务→自动 Review→质量门禁→Done）
  ↓
ln-500 Story 质量门禁（PASS/CONCERNS/REWORK/FAIL 四级）
  ↓
ln-6XX 代码审计
```

**自动 Review 机制：** `ln-402` 检查每个任务输出 → `ln-403` 修复问题并重新提交审查 → `ln-500` 运行四级质量门禁，才能标记 Done。

### 4.2 安装

```bash
# 方式 A：/plugin（推荐）
/plugin add levnikolaevich/claude-code-skills

# 方式 B：npx skills
npx skills add levnikolaevich/claude-code-skills --all -a claude-code -g
```

**注意：** 需要 Bun 运行时：
```bash
npm install -g bun
# 或 macOS/Linux：
curl -fsSL https://bun.sh/install | bash
```

验证：
```bash
/help  # 应该能看到 ln-xxx 系列命令
```

### 4.3 何时选它而不是 superpowers？

| 场景 | 推荐 |
|------|------|
| 个人项目，快速迭代，轻量工作流 | superpowers |
| 团队协作，需要标准化敏捷流程（Epics/Stories/质量门禁） | levnikolaevich |
| 需要多模型并行审查（Codex + Gemini + Claude）| levnikolaevich |
| 已有 MCP 协作流，只想强化 TDD 和调试 | superpowers |

---

## 5. claude-code-tools（跨会话上下文检索）

**仓库：** `pchalasani/claude-code-tools`
**定位：** 跨会话记忆和检索增强，解决长任务 context 丢失问题。

**解决的问题：** 切换会话后，Claude 忘记早期决策、约束或上下文，导致重复犯错或遗忘规范。

**安装：**
```bash
npx skills add pchalasani/claude-code-tools --all -a claude-code -g
# 或
/plugin add pchalasani/claude-code-tools
```

**使用场景：** 单个 Codex Session 执行超过 3 个任务后开新 Session，用此工具恢复之前的上下文。

---

## 6. alirezarezvani/claude-code-skill-factory（Claude ↔ Codex 互操作封装）

**仓库：** `alirezarezvani/claude-skills`
**定位：** 封装 Claude Code ↔ Codex CLI 互操作，减少重复手写 Codex 调用模板。内含工程团队各角色 skill（senior-architect、senior-frontend、senior-backend、code-reviewer 等）。

**安装：**

```bash
# 方式 A：Claude Code plugin（推荐）
/plugin marketplace add alirezarezvani/claude-skills
/plugin add alirezarezvani/claude-skills

# 方式 B：npx（通用）
npx agent-skills-cli add alirezarezvani/claude-skills

# 方式 C：只安装特定角色 skill
npx agent-skills-cli add alirezarezvani/claude-skills/engineering-team/senior-architect
npx agent-skills-cli add alirezarezvani/claude-skills/engineering-team/code-reviewer
```

**使用场景：** 你发现 CLAUDE.md 里的 Codex 调用模板每次都要重复写 → 装这个，Claude 会自动用封装好的模板调用。

---

## 7. NotebookLM 集成

### 7.1 为什么要集成？

NotebookLM 是 Google 的 RAG 知识库工具（Gemini 2.5 驱动），**只从你上传的文档中回答，带来源引用，几乎不幻觉**。

结合开发流程的价值：
- 把项目设计文档、API 规范、架构决策上传到 NotebookLM
- Claude Code 生成 Plan 或审查代码时，直接查询获取准确项目上下文
- 避免 Claude 因 context 压缩遗忘早期文档细节，不再需要手动复制粘贴

### 7.2 两种集成方式

| 方式 | 原理 | 适用场景 | 稳定性 |
|------|------|---------|--------|
| **Skill 方式** | 浏览器自动化 | 本地 Claude Code CLI，快速接入 | 中（依赖浏览器自动化，Google 可能改接口） |
| **MCP 方式** | MCP 协议 | 需要持久 session 或多工具联动 | 高 |

> **注意：** Skill 方式只在**本地 Claude Code CLI** 工作，Web UI 沙箱无网络权限不支持。

### 7.3 方式 A：NotebookLM Skill 安装

这个 skill 让 Claude Code 直接与 NotebookLM 对话，Gemini 从你上传的文档中返回带来源引用的智能答案。

**安装：**

```bash
# 推荐：npx 一键安装
npx skills add PleasePrompto/notebooklm-skill --all -a claude-code -g

# 或：/plugin 方式
/plugin add PleasePrompto/notebooklm-skill
```

**依赖安装：**

```bash
cd ~/.claude/skills/notebooklm
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

**首次认证（一次性）：**

```bash
python scripts/run.py auth_manager.py setup
# 打开浏览器，Google 账号登录
```

**验证：**
```bash
# 在 Claude Code 中：
> What are my skills?
# 应该能看到 notebooklm
```

**工作流程：**
```
你的问题
  → Claude Code 检查认证
  → 后台启动无头浏览器
  → 查询 NotebookLM（Gemini 从你的文档回答，带来源）
  → 返回答案，浏览器关闭
  → Claude Code 基于答案继续工作
```

### 7.4 方式 B：NotebookLM MCP Server（更稳定）

```bash
# 注册 MCP
claude mcp add notebooklm -s user -- notebooklm-mcp-server

# 首次认证
notebooklm-mcp-server auth

# 验证
claude mcp list
# 显示 notebooklm: ... ✓ Connected
```

通过 MCP 方式，你可以查询多个 NotebookLM notebook，结合 Claude 的推理和编码能力处理 NotebookLM 无法做到的事（比如获取 notebook 以外的外部信息）。

### 7.5 结合主流程使用

```bash
# 计划阶段（Step 1）— 给 Opus 补充准确上下文
> 查询 NotebookLM 中关于用户权限模块的设计文档
> 基于查到的内容，帮我澄清需求歧义，生成 Plan 文档

# 审查阶段（Step 7）— 对照规范审查
> 查询 NotebookLM 中的 API 规范，对照审查 feat/xxx 分支

# 调试阶段（Step 8）— 找历史决策背景
> 查询 NotebookLM，找当初为什么选择这个技术方案的记录
```

### 7.6 注意事项

| 事项 | 说明 |
|------|------|
| 仅本地 CLI | Web UI 沙箱无网络，Skill 方式不可用 |
| 依赖 Chrome | 需要本地已安装 Chrome |
| 接口稳定性 | Google 可能修改 NotebookLM 接口，更新后临时失效，关注仓库 Issues |
| 账号安全 | 凭证只在本地 Chrome，不上传；建议用独立 Google 账号 |
| 数据位置 | `~/.claude/skills/notebooklm/data/`，已有 `.gitignore` 保护，不要提交 |

---

## 8. 引入优先级建议

按你的目标（Claude Code + Codex MCP + 并行 worktree 流程），推荐的引入顺序：

```
阶段1（现在）：
  不装任何 Skills，用真实任务跑通基础流程
  ↓
阶段2（跑通后，感受到明显痛点再装）：
  TDD/规划/调试流程想标准化      → superpowers（最推荐先装）
  文档查询慢、context 丢失       → NotebookLM Skill 或 MCP
  会话切换上下文丢失             → claude-code-tools
  ↓
阶段3（团队扩大，需要更严格流程）：
  团队需要标准化 Agile 审查流水线 → levnikolaevich/claude-code-skills
  大量重复 Codex 调用模板        → alirezarezvani/skill-factory
```

---

## 9. 通用安装规范与维护

```bash
# Skills 统一存放位置（全局）
~/.claude/skills/

# 安装后验证
> What are my skills?    # 在 Claude Code 中

# 更新（npx skills 方式）
npx skills update

# 更新（/plugin 方式）
/plugin update <plugin-name>

# 查看已安装列表
npx skills list -g
```

**使用提醒（重要）：**
- 第三方 skills 属于可选生态，优先使用最小可用配置
- 仓库能力与命令可能变更，落地前以对应仓库最新 README 为准
- 记录验证日期，标注在团队文档中（本文档最近验证：2026-02-26）
- API Key 只放环境变量，不写入仓库，不提交 `data/` 目录
- Skills 可以执行任意代码，只从可信来源安装。

---

## 10. 相关文档

| 文档 | 用途 |
|------|------|
| `02-ClaudeCode+Codex-环境配置与协作规范.md` | 基础环境、MCP 配置、CLAUDE.md |
| `01-AI软件开发全流程.md` | 总览索引，Skills 在哪个阶段介入 |
| `~/.claude/skills/` | 本地 Skills 安装目录 |
| https://skills.sh | Vercel skills 市场，可搜索可用 skill |
| https://github.com/travisvn/awesome-claude-skills | 社区 skills 精选列表 |
