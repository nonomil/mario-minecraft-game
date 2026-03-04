# 技能文件指南

本目录包含 Claude Code + Codex MCP 协作中使用的自定义技能。

---

## 📚 技能文件列表

### 1. `commit/SKILL.md`
**用途**：规范化提交技能

**何时使用**：完成一个任务单元后需要执行规范化提交

**功能**：
- 更新任务文档 checkbox
- 执行规范化 git commit
- 生成符合 Conventional Commits 的提交信息

**调用方式**：
```bash
node C:/Users/Administrator/.codex/superpowers/.codex/superpowers-codex use-skill commit
```

**输入**：
- 任务描述
- 修改的文件列表

**输出**：
- 更新的任务文档
- git commit 日志

---

### 2. `git/SKILL.md`
**用途**：Git 版本管理技能

**何时使用**：在 git 仓库中完成代码修改、开始复杂任务前、需要查看历史或回退时调用

**功能**：
- `/git save` — 提交完成的修改
- `/git checkpoint` — 保存临时状态
- `/git history [文件/关键词]` — 查看历史
- `/git restore <hash> [file]` — 还原版本
- `/git status` — 查看当前状态

**调用方式**：
```bash
node C:/Users/Administrator/.codex/superpowers/.codex/superpowers-codex use-skill git
```

**特点**：
- 智能判断：无参数时根据对话上下文自动判断应该执行哪个操作
- 与脚本互补：`auto_checkpoint_commit.py` 自动触发，git 技能手动触发
- 安全提交：只提交代码文件，不提交配置文件或敏感文件

**与 auto_checkpoint_commit.py 的关系**：
- 脚本：自动检查点提交（会话结束时 Hook 触发）
- 技能：手动 git 操作（用户显式调用）
- 互补：自动 + 手动，满足不同场景

---

### 3. `changelog/SKILL.md`
**用途**：CHANGELOG 管理技能

**何时使用**：需要基于近期 git 提交生成或更新 CHANGELOG 文档

**功能**：
- 解析 git 提交历史
- 按类型分类（feat/fix/docs/refactor/perf/test/chore）
- 生成或更新 CHANGELOG.md

**调用方式**：
```bash
node C:/Users/Administrator/.codex/superpowers/.codex/superpowers-codex use-skill changelog
```

**输入**：
- 版本号（可选）
- 提交范围（可选）

**输出**：
- 更新的 CHANGELOG.md
- 版本摘要

---

### 4. `project-init/SKILL.md`
**用途**：项目初始化技能

**何时使用**：分析项目结构，生成项目和模块的 `claude-template.md` 文档

**功能**：
- 分析项目代码结构
- 识别项目类型和技术栈
- 识别独立模块
- 生成 `claude-template.md`（项目结构参考）
- 生成模块 `claude-template.md`（可选）

**调用方式**：
```bash
node C:/Users/Administrator/.codex/superpowers/.codex/superpowers-codex use-skill project-init
```

**输入**：
- 项目路径（可选，默认当前目录）

**输出**：
- `claude-template.md` — 项目结构文档
- 模块 `claude-template.md`（可选）

**重要**：
- 不会修改 `claude.md`（用户全局指令）
- 只生成 `claude-template.md` 作为项目结构参考
- 与 CC 的 `/init` 命令互补（`/init` 改进 `claude.md`，此技能生成 `claude-template.md`）

**适用场景**：
- 接手陌生项目时快速了解结构
- 新建项目时生成初始文档
- 项目结构变化时更新参考文档

---

### 5. `largebase-structured-scan/`
**用途**：大型代码库结构化扫描技能

**何时使用**：执行 `claude-workflow-largebase.md` 中的结构化扫描

**功能**：
- 递归扫描代码库结构
- 分析架构和依赖关系
- 生成 00-06 扫描包

**调用方式**：
```bash
node C:/Users/Administrator/.codex/superpowers/.codex/superpowers-codex use-skill largebase-structured-scan
```

**输入**：
- 扫描范围（目录路径）
- 扫描深度（可选）

**输出**：
- `00-scan-meta.json` — 元数据
- `01-architecture.md` — 架构
- `02-dataflow.md` — 数据流
- `03-api-surface.md` — API
- `04-reference-constraints.md` — 约束
- `05-impact-matrix.md` — 影响矩阵
- `06-exec-brief.md` — 执行摘要

---

## 🔄 技能使用流程

### 第一步：Bootstrap（初始化）
```bash
node C:/Users/Administrator/.codex/superpowers/.codex/superpowers-codex bootstrap
```

### 第二步：使用技能
```bash
node C:/Users/Administrator/.codex/superpowers/.codex/superpowers-codex use-skill <skill-name>
```

### 第三步：按提示输入参数
技能会交互式地询问所需参数

---

## 📋 技能选择规则

| 任务类型 | 必选技能 | 说明 |
|---------|---------|------|
| 代码审查 | `superpowers:requesting-code-review` | 请求代码审查 |
| 审查反馈处理 | `superpowers:receiving-code-review` | 处理审查反馈 |
| 新功能方案发散 | `superpowers:brainstorming` | 头脑风暴 |
| Bug 根因分析 | `superpowers:systematic-debugging` | 系统化调试 |
| 实施计划编写 | `superpowers:writing-plans` | 编写计划 |
| 多任务并行分发 | `superpowers:dispatching-parallel-agents` | 并行分发 |
| 直接写代码 | 不调用技能 | 直接执行 |

**规则**：
- 任务目标是"评审/分析/方案" → 调用对应技能
- 任务目标是"直接改代码并交付" → 不调用技能

---

## 🛠️ 技能管理

### 添加新技能
1. 在本目录下创建新目录（命名规则：`[功能名]/`）
2. 创建 `SKILL.md` 文件，描述技能的用途和使用方式
3. 实现技能的核心逻辑
4. 在本文档中记录技能信息
5. 在工作流文档中引用新技能

### 修改现有技能
1. 编辑 `SKILL.md` 文件
2. 更新技能的实现
3. 测试修改
4. 更新本文档中的说明

### 测试技能
```bash
# 初始化
node C:/Users/Administrator/.codex/superpowers/.codex/superpowers-codex bootstrap

# 测试技能
node C:/Users/Administrator/.codex/superpowers/.codex/superpowers-codex use-skill <skill-name>
```

---

## 📝 技能开发最佳实践

### 1. 清晰的用途说明
在 `SKILL.md` 中明确说明：
- 何时使用
- 功能是什么
- 输入和输出

### 2. 交互式提示
技能应该交互式地询问用户所需参数，而不是要求用户提供复杂的命令行参数

### 3. 错误处理
技能应该优雅地处理错误，提供有用的错误信息

### 4. 文档完整
每个技能都应该有完整的文档，说明如何使用

---

## 🔗 相关文档

- `../workflows/claude-workflow-largebase.md` — 大型库工作流（使用 largebase-structured-scan 技能）
- `../workflows/claude-workflow-constants.md` — 全局约束（Superpowers 调用规范）
- `../README.md` — .claude 目录完整指南
- `../MIGRATION-GUIDE.md` — 迁移指南

---

## 💡 常见问题

### Q: 如何在工作流中调用技能？
A: 在工作流文档中添加以下步骤：
```
Step 0: node C:/Users/Administrator/.codex/superpowers/.codex/superpowers-codex bootstrap
Step 1: node C:/Users/Administrator/.codex/superpowers/.codex/superpowers-codex use-skill <skill-name>
Step 2: [实际任务]
```

### Q: 技能和脚本有什么区别？
A:
- **技能**：交互式，用于分析和规划，通过 Superpowers 调用
- **脚本**：自动化，用于执行重复任务，通过 Hook 触发

### Q: 如何禁用某个技能？
A: 在工作流文档中不调用该技能即可。技能是可选的，不会自动触发。
