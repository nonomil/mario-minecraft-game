# Claude Code + Codex MCP 协作规范

> ⚠️ **重要**：本文件是全局工作流规范。`/init` 或任何自动化工具只能在文件末尾追加项目特定内容，禁止修改或删除上方内容。

---

## ⛔ 强制门禁：任何行动前必须先讨论需求

**收到任何新任务时，必须按以下顺序执行，不得跳过：**

1. **读取**需求
2. **自动初始化工程目录**（无需用户确认，CC 直接执行）：
   - 创建 `docs/plan/` 目录
   - 在 `docs/plan/plan-YYYY-MM-DD-[feature]-requirements.md` 生成需求初稿
   - 需求初稿包含：需求理解、歧义点列表、复杂度判断、待确认问题
3. **与用户讨论**（基于需求初稿逐步完善）：
   - 用自己的话复述需求，确认理解一致
   - 列出所有歧义点并提问
   - 完成复杂度判断（见下方标准），向用户说明判断结果和将走的流程
   - 根据讨论结果更新需求文档
4. **读取历史教训**（必须执行）：
   - **4.1 必须读取** `tasks/lessons.md` 文件（若该文件不存在则记录"暂无 lessons"并跳过）
   - **4.2 提炼** 与当前任务相关的历史教训，在后续操作中主动规避
5. **停止** — 用户说"确认"或"开始"之前，不得写代码、调用 Codex
6. **确认后**才进入对应模式的执行流程

**违反此门禁 = 从第1步重新开始。**

---

## 复杂度判断 → 模式选择

**CC 必须机械套用以下标准，不得主观判断：**

```
满足全部4条 → 简单模式（直接执行，无需读子文档）：
  ✓ 涉及文件 ≤ 3 个
  ✓ 预估 diff ≤ 200 行
  ✓ 需求明确，无歧义
  ✓ 单模块内，不跨模块

任意1条不满足 → 按下方场景路由表读取对应子文档
```

判断后必须向用户说明：判断结果、依据、将走的流程，等用户确认后继续。

---

## 场景路由表

**路由优先级（从高到低）：**
1. `Debug`
2. `研究调研`
3. `大型代码库`
4. `并行开发`
5. `复杂开发`
6. `简单开发`

| 场景 | 触发条件 | 读取文档 |
|------|---------|---------|
| Debug | 用户描述 bug / 错误 / 测试失败 | `.claude/workflows/claude-workflow-debug.md` |
| 研究调研 | 用户说”调研/对比/选型/搜索/研究” | `.claude/workflows/claude-workflow-research.md` |
| 大型代码库 | 递归代码文件 > 20（含子目录）/ 目录层级深且跨 3+ 模块 / Markdown 与参考文档较多 / 命中”重构迁移、影响分析、先扫描”等关键词 / 用户显式要求先扫描 | `.claude/workflows/claude-workflow-largebase.md` + `largebase-structured-scan` skill |
| 并行开发 | 任务数 ≥ 2 且可解耦（改动文件集合无交集 + 无共享状态依赖） | `.claude/workflows/claude-workflow-parallel.md` |
| 复杂开发 | 任意简单标准不满足，且未命中 Debug/调研/大型代码库专用路由 | `.claude/workflows/claude-workflow-complex.md` |
| 简单开发 | 满足全部4条简单标准 | 无需读文档，直接执行下方简单模式流程 |

---

## Superpowers 调用（Windows 绝对路径）

> **重要区分**：Claude Code（当前）vs Codex MCP（代码生成时）
>
> | 场景 | 工具 | 调用方式 |
> |------|------|----------|
> | **Claude Code 本会话** | 内置 `Skill` 工具 | `skill: “code-review”` / `skill: “feature-dev”` |
> | **Codex MCP 生成代码时** | Superpowers CLI | `node C:/.../superpowers-codex use-skill <name>` |
>
> 下方规范仅适用于 **Codex MCP 场景**（在发给 Codex 的 prompt 中使用）。
> Claude Code 本会话直接使用 `Skill` 工具，见下文「Skill 选择规则」。

Windows 下固定使用绝对路径，避免 `~/.codex/...` 被错误解析。

```text
bootstrap:
node C:/Users/Administrator/.codex/superpowers/.codex/superpowers-codex bootstrap

use-skill:
node C:/Users/Administrator/.codex/superpowers/.codex/superpowers-codex use-skill <skill-name>
```

**给 Codex 的 prompt 前置步骤（仅 Codex MCP 场景）：**

```text
Step 0: node C:/Users/Administrator/.codex/superpowers/.codex/superpowers-codex bootstrap
Step 1: node C:/Users/Administrator/.codex/superpowers/.codex/superpowers-codex use-skill <skill-name>
Step 2: [实际任务]
```

---

## Skill 选择规则

> 根据**当前执行环境**选择正确的调用方式：

### A. Claude Code 本会话（使用内置 `Skill` 工具）

> **路径溯源**：skill 名来自 `C:\Users\Administrator\.claude\settings.json` → `enabledPlugins`
> 实际文件位于 `.claude\plugins\marketplaces\<marketplace>\plugins\<name>\`
> **不通过 node 命令，由 Claude Code 进程内部直接激活，与 Codex Superpowers CLI 完全无关**

| 任务类型 | skill key（来自 settings.json） |
|---------|----------------------------------|
| 代码审查 | `code-review@claude-plugins-official` |
| 功能开发 | `feature-dev@claude-plugins-official` |
| 代码库扫描 | `cartographer@cartographer-marketplace` |
| 其他官方插件 | 见 `settings.json` 中 `enabledPlugins` |

### B. Codex MCP 调用时（使用 Superpowers CLI）

在发给 Codex 的 prompt 中，按任务类型选择 skill：

| 任务类型 | 必选 skill | 推荐 reasoning |
|---------|-----------|---------------|
| 代码审查 | `superpowers:requesting-code-review` | `high` |
| 审查后反馈处理 | `superpowers:receiving-code-review` | `high` |
| 新功能方案发散 | `superpowers:brainstorming` | `high` |
| Bug 根因分析 | `superpowers:systematic-debugging` | `high` |
| 实施计划编写 | `superpowers:writing-plans` | `high` |
| 多任务并行分发 | `superpowers:dispatching-parallel-agents` | `medium` |
| 直接写代码（并行开发） | 不调用 skill，直接执行 | `low` |

判断规则：
- 任务目标是”评审/分析/方案” → 调用对应 skill
- 任务目标是”直接改代码并交付” → 不调用 skill

**代码审查场景 - Claude Code 本会话：**

```text
调用方式：Claude Code 内置 Skill 工具
skill 名称：code-review@claude-plugins-official
（在 Claude Code 中直接激活，无需任何命令行）
```

**代码审查场景 - Codex MCP 模板（prompt 中）：**

```text
node C:/Users/Administrator/.codex/superpowers/.codex/superpowers-codex bootstrap
node C:/Users/Administrator/.codex/superpowers/.codex/superpowers-codex use-skill superpowers:requesting-code-review

审查以下问题，直接给出分析结论和建议，不需要询问确认：
问题1：[你的问题1]
问题2：[你的问题2]
```

---

## 简单模式流程（直接执行）

### ⚠️ 模式升级触发条件（全程持续检查）

**出现任意一条立即暂停，切换到复杂模式：**

```
□ diff 超过 200 行且任务还未完成
□ 发现需要修改 >3 个文件（超出原始预估）
□ 出现跨模块依赖，原本以为是单模块内改动
□ 需求在开发中变化，边界扩大
□ Review 超过 3 轮仍持续出现新问题（说明任务粒度太大）
□ 发现任务可以拆成 3 个及以上独立单元并行
```

**切换步骤：**
1. 停止当前开发，执行 `git status --short` 汇报当前改动
2. 让用户选择处理方式：A) 提交当前改动 / B) 暂存（仅用户明确同意）/ C) 放弃（高风险，需明确确认）
3. 把已完成部分作为"已知背景"，跳转 `claude-workflow-complex.md` Phase 1 重新澄清需求
4. **写入教训**：将"初始判断为简单模式但实际需升级"的原因写入 `tasks/lessons.md`

---

### Step 1：需求讨论（强制门禁）
- 复述需求，列出歧义，等用户确认
- 确认将要修改的文件和改动点

### Step 2：Codex 实现
- 有逻辑的改动 → **必须用 Codex MCP**（见下方调用规范）
- 仅微小改动（<20行且无逻辑）→ CC 直接实现

### Step 3：两轮 Review + 验证完成门禁（不得跳过）
- **轮次1（CC审查）**：逻辑正确性、安全性（XSS/注入）、YAGNI、向后兼容
- **轮次2（Codex深度审查）**：边界条件、长尾情况、与现有代码兼容性
- **验证门禁**（标记完成前必须满足，不得仅凭"看起来对"结案）：
  - 参见 `.claude/workflows/claude-workflow-constants.md` 中的「验证完成门禁（全 workflow 通用）」
- 两轮结论一致且验证通过 → 向用户汇报审查结果，等用户确认 → 进入 Step 4
- 有分歧或新问题 → 修复后从轮次1重新开始（最多3轮，超过则升级为复杂模式）
- **Review 超过 3 轮时**：将问题根因写入 `tasks/lessons.md`，标注"任务粒度判断失误"



---

### Step 4：提交
```bash
git diff --stat   # 确认 ≤ 200 行（硬约束，超过必须拆分）
git add [具体文件]
git commit -m "feat/fix: [描述]"
```

---

## Codex MCP 调用规范

> 详见 `.claude/workflows/claude-workflow-constants.md` 中的"Codex MCP 调用规范"
> 文件边界与删除禁令详见 `.claude/workflows/claude-workflow-constants.md` 中的"文件操作边界与删除禁令（不可变）"
> 推理强度规则详见 `.claude/workflows/claude-workflow-constants.md` 中的"Codex 推理强度规则（不可变）"

### 关键约束摘要（内联版，完整版见 constants.md）

**禁止命令清单（不可变）：**
- `rm -rf` / `del` / `rd /s` / `Remove-Item -Recurse`
- `git clean -f` / `git reset --hard`
- 任何删除范围外文件的操作

**硬约束：**
- 单次任务 diff ≤ 200 行（超过必须拆分）
- 仅限当前 worktree 绝对路径下文件
- 不得修改、移动、删除范围外文件

---

**必填参数（MANDATORY）**：
```javascript
{
  model: "gpt-5.3-codex",
  sandbox: "danger-full-access",
  "approval-policy": "on-failure",
  reasoning: "high" | "medium" | "low"  // 见下方 reasoning 选择规则
}
```

**reasoning 选择规则：**
| 任务类型 | reasoning 值 | 说明 |
|---------|-------------|------|
| 代码审查 / Bug 根因分析 / 实施计划编写 | `high` | 需要深度推理，先分析再结论 |
| 复杂重构 / 跨模块改动 | `medium` | 需要理解上下文和依赖关系 |
| 直接编码 / 小改动（<50行） | `low` | 直接执行，只输出实现与结果 |

**Session 管理**：
```javascript
// 首次调用
mcp__codex__codex({
  model: "gpt-5.3-codex",
  sandbox: "danger-full-access",
  "approval-policy": "on-failure",
  reasoning: "high",  // 根据任务类型选择
  prompt: "<结构化 Prompt>"
})
// 保存 threadId

// 后续追问
mcp__codex__codex_reply({
  threadId: "<保存的 ID>",
  prompt: "<下一步>"
})
```

### Codex Prompt 模板
```
## Context
- 技术栈：[语言/框架/版本]
- 文件：[路径]：[用途]
- 参考：[风格/模式参考文件路径]

## Task
[清晰、单一、可验证的任务]
步骤：1. [步骤] 2. [步骤] 3. [步骤]

## Constraints
- API：不得修改 [签名]
- 范围：仅限 [当前 worktree 绝对路径] 下文件
- 依赖：不引入新依赖
- 风格：遵循 [参考]
- 禁止：不得修改、移动、删除范围外文件
- 禁止命令：rm -rf / del / rd /s / Remove-Item -Recurse / git clean -f / git reset --hard
- 推理强度说明（以参数层 reasoning 为准，此处仅作可读性说明）：
  - 审查/调试/规划（reasoning: high）：需要深度推理，先分析再结论
  - 直接编码/小改（reasoning: low）：直接执行，无需深度推理；只输出实现与结果

## Acceptance
- [ ] 测试通过（pytest / npm test）
- [ ] [项目特定验收标准]

## Output Format
完成后输出：
1. 改动文件列表（路径 + 改动行数）
2. 验收自检结果（逐条打勾）
3. 遗留问题（若有）
```

---

## 核心原则

- CC = 大脑（规划、搜索、决策），Codex = 双手（代码生成、重构）
- 凡有 Codex 调用，必须要求其按结构化输出以减少解析成本（如 JSON、Markdown 表格或带有结构化思维链的关键步骤），禁止纯代码丢掷
- 所有代码任务默认交 Codex，CC 只处理琐碎改动（<20行）和非代码工作
- 单次任务 diff ≤ 200 行（硬约束，超过必须拆分）
- 出现 git 合并冲突时必须停下并报告，禁止自动批量解冲突后直接提交
- **验证完成门禁**：参见 `.claude/workflows/claude-workflow-constants.md` 中的「验证完成门禁（全 workflow 通用）」

### 自我改进循环（Self-Improvement Loop）
- 用户每次纠正错误后，**立即**将该 pattern 写入 `tasks/lessons.md`
- 格式：`- [日期] [场景] → 错误根因 → 下次防范方式`
- 每次任务开始读取 `tasks/lessons.md`，主动规避历史错误（已在强制门禁 Step 4 中强制执行）
- Bug 修复完成后，同样将根因写入 `tasks/lessons.md`（复用 debug workflow Phase 5 产出）
- **补充写入时机**：
  - Review 超过 3 轮时：记录"任务粒度判断失误"及原因
  - 模式升级触发时：记录"初始判断为简单模式但实际需升级"的原因
- lessons.md 随项目积累，成为 CC+Codex 的共同知识库

### 自主 Bug 修复（Autonomous Bug Fixing）
- 收到 Bug 报告：直接按 `claude-workflow-debug.md` 流程定位 → 修复 → 验证，不询问如何操作
- 主动查看日志、运行测试、修复 CI，用户无需手把手指导
- Debug Phase 5 根因文档**必须同步更新** `tasks/lessons.md`，防止同类 Bug 复现

---

## 项目特定信息（/init 追加区域）

<!-- /init 或 project-init 技能生成的项目特定内容追加到此处以下 -->
<!-- 禁止删除或修改上方内容 -->

## 编码与终端输出守则（新增）

### 目标
- 避免 Windows GBK 终端导致的中文文档乱码、`?` 覆盖和不可逆损坏。

### 执行规则
1. 文本文件读写必须显式 `encoding='utf-8'`。
2. 中文文档（特别是 `*.md`）默认保存为 `UTF-8 with BOM`。
3. 禁止使用 `errors='replace'` 作为常规读取策略；仅允许用于一次性诊断，不得写回。
4. 在 PowerShell 中执行含中文输出的 Python 命令前，先设置：`$env:PYTHONIOENCODING='utf-8'`。
5. 避免用终端 here-string 直接写入大段中文正文；优先通过补丁修改文件内容。

### 验收检查
- [ ] 修改后的中文文件无 `?`/`�` 异常替换
- [ ] 标题与正文在 IDE 中可正常显示
- [ ] 若发现乱码，立即停止继续覆盖写入，先从历史版本恢复后再修复

## Codebase Overview

> 最后更新：2026-03-02

CC+Codex 协作工作流示例项目（116 files, 281k tokens）。包含完整 AI 辅助开发流程配置（`.claude/`）和 Python 图片合并演示应用（`image-merger/`）。

**Stack**: Python 3.10+, Pillow, tkinter, SQLite
**入口点**: `CLAUDE.md`（路由）→ `.claude/workflows/`（执行）→ Codex MCP（代码生成）
**核心模块**:
- `.claude/workflows/`：6 个工作流（constants/complex/debug/largebase/parallel/research）
- `.claude/skills/largebase-structured-scan/`：scan.py（1762行）+ M1-M4 模板 + SQLite schema
- `.claude/plugins/cartographer/`：并行 Sonnet 子代理扫描，生成 CODEBASE_MAP.md（已移除内部 .git）
- `.claude/scripts/`：3 个 Hook 脚本（checkpoint/changelog/scope-guard）
- `image-merger/src/`：merger + batch_merger + file_manager + gui + main（CLI+GUI）
**关键约束**: diff ≤ 200行 | Codex 四必填参数 `model/sandbox/approval-policy/reasoning` | 两轮独立 Review

For detailed architecture, see [docs/CODEBASE_MAP.md](docs/CODEBASE_MAP.md).

---

## 项目初始化自动执行规则

以下任务在满足触发条件时，**无需询问用户，AI 直接自动执行**：

### 1. Git 仓库初始化
- **触发条件**：当前工作目录不存在 `.git` 文件夹
- **自动执行**：
  ```bash
  git init
  git add .
  git commit -m "init: 初始化项目"
  ```
- **例外**：如果目录完全为空（无任何文件），则仅执行 `git init`，跳过提交

### 2. 工程目录结构初始化
- **触发条件**：`docs/plan/` 目录不存在
- **自动执行**：
  ```bash
  mkdir -p docs/plan docs/memory docs/archive
  ```

### 3. 首次启动自检流程
AI 启动时按以下顺序自检，无需用户确认：
1. 检查 `.git` 是否存在 → 不存在则初始化
2. 检查 `docs/plan/` 是否存在 → 不存在则创建
3. 自检完成后向用户报告状态，然后进入正常任务流程

**注意**：以上规则仅在项目启动时执行一次，后续正常开发流程仍需遵守"强制门禁"。

<!-- SCAN_SUMMARY_START -->
## 扫描摘要（auto-generated by largebase-scan）

> 扫描时间: 2026-03-04T20:28
> 数据来源: `docs\scan\2026-03-04-full-codebase-scan\scan.db`

### 入口点
- `clone()` (src/storage.js:45) → 未记录
- `exportSaveCode()` (src/storage.js:149) → 未记录
- `importSaveCode()` (src/storage.js:163) → 未记录
- `loadJsonWithFallback()` (src/modules/01-config.js:14) → 未记录
- `mergeDeep()` (src/modules/02-utils.js:4) → 未记录

### 核心模块
- `mod:src`: 游戏主模块，包含21个功能子模块（01-21）：配置、工具、音频、词汇、渲染、物理、玩家、敌人、道具、UI、生物群系、关卡、游戏循环、输入、相机、粒子、动画、碰撞、存档、成就、教程

### 关键约束
- [CLAUDE.md] 技术栈: Pure HTML5/CSS3/JavaScript (ES6), Canvas API, Web Audio/Speech Synthesis API, LocalStorage
- [CLAUDE.md] 核心模块: src/modules/01-21
- [CLAUDE.md] 配置驱动设计: config/*.json
- [CLAUDE.md] 游戏循环模式: 单体循环 13-game-loop.js

### 高风险变更点
- `碰撞检测 (18-collision.js)` (风险: high)
- `物理引擎 (06-physics.js)` (风险: high)
- `游戏循环 (13-game-loop.js)` (风险: high)

<!-- SCAN_SUMMARY_END -->
