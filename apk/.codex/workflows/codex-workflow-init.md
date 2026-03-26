# codex-workflow-init.md — 项目初始化配置

> 本文档在项目首次使用时执行一次，结果写入 `codex-workflow-constants.md` 的"项目配置"区块。
> 后续开发流程通过读取常量使用这些配置，无需重复询问。

---

## 触发条件

满足以下任一条件时，Codex 自动触发本流程：

- 用户说"初始化项目" / "整理目录" / "配置 worktree"
- 检测到根目录存在 `.git/` 但 `codex-workflow-constants.md` 中无"项目配置"区块
- 用户显式要求"运行 init 流程"

---

## Step 1：扫描根目录

Codex 执行：

```bash
ls -la [PROJECT_ROOT]
```

输出文件分类表：

| 文件/目录 | 类型 | 建议 |
|-----------|------|------|
| `.codex/` | 主工作流配置 | 保留根目录 |
| `CLAUDE.md` / `AGENTS.md` | 共享配置 | 保留根目录 |
| `docs/` | 共享文档 | 保留根目录 |
| `*.rar` / `*.zip` | 归档文件 | 只做提示，不自动处理 |
| `[项目代码目录]` | 项目代码 | 见 Step 2 |
| 其他文档/记录目录 | 参考资料 | 标记为历史资料，不自动移动 |

Codex 向用户展示分类表，并说明建议理由，等待用户确认或调整。

---

## Step 2：目录建议输出（可选）

询问用户：

```
检测到以下文件/目录可能属于历史资料：

  [列出具体文件/目录]

选项：
  A) 仅记录建议，不改动文件（推荐）
  B) 我来手动决定后续处理
  C) 跳过，保持现状

请选择 A / B / C：
```

**选 A**：Codex 只输出建议清单，写入 `docs/plans/` 或当前任务说明，不自动移动任何文件。

**选 B**：Codex 列出每个文件，等待用户明确决定后再继续；若涉及移动/重命名，当前仓库必须单独确认。

**选 C**：跳过，进入 Step 3。

---

## Step 3：分支管理模式选择

询问用户：

```
选择 Git 分支管理模式：

┌─────────────────────────────────────────────────────────────┐
│ 模式一：临时分支模式（推荐短期任务）                          │
│ • 适合几天内完成的功能开发、Bug 修复                          │
│ • worktree 作为子目录存在（如 worktrees/feat-xxx）            │
│ • 合并后可删除，简单直接                                      │
├─────────────────────────────────────────────────────────────┤
│ 模式二：固定分支模式/Bare Repo（推荐长期维护）                │
│ • 适合多版本并行（v1.x, v2.x）、大型重构                      │
│ • 各分支平铺展示，视觉最清爽                                  │
│ • 使用 .bare/ 管理 git 数据，各分支像独立项目                 │
└─────────────────────────────────────────────────────────────┘

参考：.claude/reference/20.Git分支管理模式.md

请选择 1 / 2：
```

---

## Step 4：Worktree 目录偏好

根据 Step 3 的选择，提供不同选项：

### 若选模式一（临时分支）：

```
新建功能分支 worktree 时，目录放在哪里？

  A) worktrees/feat-xxx    ← 根目录下，非隐藏，一眼可见（推荐）
  B) .worktree/feat-xxx    ← 根目录下，隐藏目录

请选择 A / B：
```

**选 A**：`WORKTREE_BASE = worktrees`
**选 B**：`WORKTREE_BASE = .worktree`

### 若选模式二（Bare Repo）：

```
当前目录结构将变为 Bare Repo 风格：

  [PROJECT_ROOT]/
  ├── .bare/               ← bare repo（隐藏）
  ├── .git                 ← 指向 .bare 的文件
  ├── main/                ← main 分支工作区
  └── [其他分支]/          ← 各分支平铺展示

是否继续？Y / N：
```

**选 Y**：
- `BRANCH_MODE = bare`
- `WORKTREE_BASE = .`（分支直接创建在根目录）
- Codex 执行 Bare Repo 初始化（见下方"Bare Repo 初始化"章节）

**选 N**：返回 Step 3 重新选择模式

---

## Step 5：主分支名确认

Codex 自动检测：

```bash
git symbolic-ref --short HEAD
```

若为 `master`，询问：

```
当前主分支为 master，是否重命名为 main？

  A) 保持 master
  B) 重命名为 main（git branch -m master main）

请选择 A / B：
```

结果写入 `MAIN_BRANCH` 常量。

---

## Step 6：Bare Repo 初始化（仅模式二执行）

若用户选择模式二（Bare Repo），只输出实施方案，不在当前仓库自动执行重构动作：

```bash
# 1. 记录目标结构和风险
# 2. 等待用户单独确认是否在新仓库或副本中实施
# 3. 当前仓库不自动移动 .git、不自动搬迁源码、不自动删除备份
```

完成后目录结构：

```
[PROJECT_ROOT]/
├── .bare/                 ← bare repo（仅方案示意）
├── .git                   ← gitdir 指向 .bare（仅方案示意）
├── [MAIN_BRANCH]/         ← 主分支工作区（仅方案示意）
└── tmp/                   ← 如需临时整理，仅允许移动到 tmp/
```

---

## Step 7：写入常量

将以上选择结果写入 `codex-workflow-constants.md` 的"项目配置"区块：

```markdown
## 项目配置（init 生成，可手动修改）

| 常量 | 值 | 说明 |
|------|----|------|
| `BRANCH_MODE` | `temporary` / `bare` | 分支管理模式 |
| `WORKTREE_BASE` | `worktrees` / `.` | worktree 目录前缀 |
| `MAIN_BRANCH` | `master` / `main` | 主分支名 |
| `PROJECT_ROOT` | `d:/Workplace/...` | 项目根目录绝对路径 |
| `INIT_DATE` | `2026-02-28` | 初始化日期 |
```

写入后提交：

```bash
git add .codex/workflows/codex-workflow-constants.md
git commit -m "chore: 写入项目初始化配置"
```

---

## 注意事项

- 本流程只执行一次；常量写入后，后续流程直接读取，不再询问
- 用户可随时手动编辑 `codex-workflow-constants.md` 中的"项目配置"区块修改偏好
- 当前仓库禁止自动移动、重命名、删除现有文件；init 流程只能输出建议与常量
- 若后续确实要整理目录，必须由用户单独确认，并遵守“只移动到 `tmp/`，不删除、不重命名”的规则
