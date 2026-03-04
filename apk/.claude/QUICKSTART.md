# Claude Code + Codex MCP 快速上手指南

> 5 分钟掌握核心流程：项目初始化 → Git 配置 → Worktree 开发

---

## 📋 目录

1. [首次使用（一键初始化）](#首次使用一键初始化)
2. [日常开发三步走](#日常开发三步走)
3. [Worktree 分支管理](#worktree-分支管理)
4. [常用命令速查](#常用命令速查)
5. [遇到问题？](#遇到问题)

---

## 首次使用（一键初始化）

### Step 1：创建工程目录结构

```bash
# AI 会自动执行（无需手动）
mkdir -p docs/plan docs/memory docs/archive
```

### Step 2：选择 Git 分支管理模式

运行一次 `init` 流程，永久生效：

```bash
# 对 AI 说："初始化项目" 或 "配置 worktree"
```

**模式一：临时分支模式（推荐短期任务）**
- 适合几天内完成的功能开发、Bug 修复
- worktree 放在 `worktrees/feat-xxx`
- 合并后可删除，简单直接

**模式二：Bare Repo 模式（推荐长期维护）**
- 适合多版本并行（v1.x, v2.x）、大型重构
- 各分支平铺展示，如 `main/`、`feat-xxx/`
- 使用 `.bare/` 管理 git 数据

### Step 3：确认主分支名

```bash
# AI 自动检测并询问
git symbolic-ref --short HEAD  # master or main
```

完成后，配置写入 `workflows/claude-workflow-constants.md`，后续不再询问。

---

## 日常开发三步走

### 第 1 步：提出需求

告诉 AI 你要做什么，AI 会：
- 复述需求，确认理解一致
- 列出歧义点（如有）
- 判断复杂度，选择对应工作流

**关键**：用户说"确认"或"开始"之前，AI **不会**写代码。

### 第 2 步：复杂度判断 → 路由

| 条件 | 结果 |
|------|------|
| 文件 ≤ 3，diff ≤ 200 行，需求明确，单模块 | **简单模式** → 直接执行 |
| 任意一条不满足 | **复杂模式** → 读取对应工作流文档 |

**路由优先级**（从高到低）：
1. Bug/错误 → Debug 流程
2. "调研/对比/选型" → 研究流程
3. 文件 > 20 / 跨 3+ 模块 → 大型库扫描流程
4. 其他复杂情况 → 复杂开发流程

### 第 3 步：代码生成与审查

```
你提出要求
    ↓
CC 规划、搜索、决策
    ↓
Codex MCP 生成/修改代码（必填参数：model/sandbox/approval-policy）
    ↓
两轮 Review（CC + Codex 独立审查）
    ↓
验证通过 → 提交
```

---

## Worktree 分支管理

### 创建功能分支（隔离开发）

```bash
# 检查当前状态（必须干净）
git status --short

# 创建 worktree（临时分支模式示例）
git worktree add worktrees/feat-login -b feat/login

# 进入 worktree
cd worktrees/feat-login
```

### 查看所有 worktree

```bash
git worktree list

# 输出示例：
# D:/Project               abc1234 [master]
# D:/Project/worktrees/f1  def5678 [feat/login]
```

### 合并并清理

```bash
# 回到主分支
cd ..
git switch master

# 查看变更摘要（AI 会强制提示）
git diff --stat master...feat/login

# 用户确认后合并
git merge --no-ff feat/login

# 删除 worktree
git worktree remove worktrees/feat-login
git branch -d feat/login
```

---

## 常用命令速查

### Git 基础

```bash
git status              # 查看改动
git diff --stat         # 统计变更行数
git add -A              # 暂存所有改动
git commit -m "type: desc"   # 提交（类型：feat/fix/docs/refactor/chore）
```

### Worktree 操作

```bash
git worktree add <path> -b <branch>     # 创建
git worktree list                        # 列表
git worktree remove <path>               # 删除
git worktree prune                       # 清理残留
```

### 安全检查（AI 自动执行）

```bash
# 创建 worktree 前
git status --short

# 合并前
git diff --stat base...HEAD

# 提交前（确认 diff ≤ 200 行）
git diff --stat HEAD
```

---

## 遇到问题？

### Q: AI 不开始写代码
**A**: 检查是否说了"确认"或"开始"。这是强制门禁，不能跳过。

### Q: 如何跳过扫描直接改？
**A**: 对 AI 说"不用扫描，直接改"。但仅建议对非常熟悉的小型代码库使用。

### Q: 合并冲突怎么办？
**A**: AI 会立即停止并报告。**禁止** AI 自动批量解冲突后直接提交。你需要：
1. 手动解决冲突
2. 重新运行测试
3. 确认无误后继续

### Q: 修改了范围外的文件？
**A**: AI 会在验收时检查 `git diff --name-only HEAD`，发现范围外改动立即中止。

### Q: 想改配置常量？
**A**: 编辑 `workflows/claude-workflow-constants.md` 中的"项目配置"区块。

---

## 🔗 相关文档

| 文档 | 用途 |
|------|------|
| `workflows/claude-workflow-constants.md` | 全局硬约束（单一真相来源） |
| `workflows/claude-workflow-complex.md` | 复杂开发完整流程 |
| `workflows/claude-workflow-debug.md` | Bug 调试流程 |
| `workflows/claude-workflow-init.md` | 项目初始化详细步骤 |
| `README.md` | .claude 完整目录指南 |

---

## ✅ 自检清单

新项目首次使用，确认以下文件存在：

```bash
# 工作流文档
ls .claude/workflows/claude-workflow-*.md

# 工程目录
ls docs/plan docs/memory docs/archive

# 项目配置（init 后生成）
grep "项目配置" .claude/workflows/claude-workflow-constants.md
```

全部通过即可开始使用！
