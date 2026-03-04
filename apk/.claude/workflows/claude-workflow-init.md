# claude-workflow-init.md — 项目初始化配置

> 本文档在项目首次使用时执行一次，结果写入 `claude-workflow-constants.md` 的"项目配置"区块。
> 后续开发流程通过读取常量使用这些配置，无需重复询问。

---

## 触发条件

满足以下任一条件时，AI 自动触发本流程：

- 用户说"初始化项目" / "整理目录" / "配置 worktree"
- 检测到根目录存在 `.git/` 但 `claude-workflow-constants.md` 中无"项目配置"区块
- 用户显式要求"运行 init 流程"

---

## Step 1：扫描根目录

AI 执行：

```bash
ls -la [PROJECT_ROOT]
```

输出文件分类表：

| 文件/目录 | 类型 | 建议 |
|-----------|------|------|
| `.claude/` | 共享配置 | 保留根目录 |
| `CLAUDE.md` / `AGENTS.md` | 共享配置 | 保留根目录 |
| `docs/` | 共享文档 | 保留根目录 |
| `*.rar` / `*.zip` | 归档文件 | 建议移入 `archives/` |
| `[项目代码目录]` | 项目代码 | 见 Step 2 |
| 其他文档/记录目录 | 参考资料 | 建议移入 `archives/` |

AI 向用户展示分类表，并说明建议理由，等待用户确认或调整。

---

## Step 2：归档整理（可选）

询问用户：

```
检测到以下文件建议归档到 archives/ 目录：

  [列出具体文件/目录]

选项：
  A) 全部移入 archives/（推荐）
  B) 我来手动选择哪些移入
  C) 跳过，保持现状

请选择 A / B / C：
```

**选 A**：AI 执行：
```bash
mkdir -p [PROJECT_ROOT]/archives
mv [文件1] [PROJECT_ROOT]/archives/
mv [文件2] [PROJECT_ROOT]/archives/
# ...
git add -A && git commit -m "chore: 归档整理根目录"
```

**选 B**：AI 列出每个文件，逐一询问"移入 archives/ 还是保留？"，批量执行后统一提交。

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
- AI 执行 Bare Repo 初始化（见下方"Bare Repo 初始化"章节）

**选 N**：返回 Step 3 重新选择模式

---

## Step 5：主分支名确认

AI 自动检测：

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

若用户选择模式二（Bare Repo），执行以下步骤：

```bash
# 1. 备份当前 .git 目录
mv .git .git-backup

# 2. 转换为 bare repo
git clone --bare .git-backup .bare

# 3. 创建 .git 文件指向 .bare
echo "gitdir: ./.bare" > .git

# 4. 配置 fetch
# 编辑 .bare/config，确保有：fetch = +refs/heads/*:refs/remotes/origin/*

# 5. 创建主分支 worktree
git worktree add [MAIN_BRANCH]

# 6. 移动原项目代码到主分支 worktree
mv *.py *.md src/ tests/ docs/ [MAIN_BRANCH]/ 2>/dev/null || true

# 7. 提交整理
cd [MAIN_BRANCH]
git add -A
git commit -m "chore: 转换为 Bare Repo 格式"

# 8. 清理备份（注意：此操作可能会被系统 Hook 拦截，若被拦请手动确认清理）
Remove-Item -Recurse -Force ../.git-backup
```

完成后目录结构：

```
[PROJECT_ROOT]/
├── .bare/                 ← bare repo
├── .git                   ← gitdir 指向 .bare
├── [MAIN_BRANCH]/         ← 主分支工作区（包含原项目代码）
└── archives/              ← 如有归档
```

---

## Step 7：写入常量

将以上选择结果写入 `claude-workflow-constants.md` 的"项目配置"区块：

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
git add .claude/workflows/claude-workflow-constants.md
git commit -m "chore: 写入项目初始化配置"
```

---

## 注意事项

- 本流程只执行一次；常量写入后，后续流程直接读取，不再询问
- 用户可随时手动编辑 `claude-workflow-constants.md` 中的"项目配置"区块修改偏好
- Step 2 归档操作执行前必须确认 `git status` 干净，避免丢失未提交改动
