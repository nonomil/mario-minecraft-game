---
name: finishing-a-development-branch
description: 当功能工作、Bug 修复或重构在隔离分支（通常在 worktree 中）完成并准备合并回 main 时使用
---

# 完成开发分支

## 概述

完成开发分支确保所有工作都经过验证、清理，并以整洁的状态合并回主线。

**核心原则：** 合并前的无瑕疵状态。

**开始时声明：** “我正在使用完成开发分支技能来完成此项工作。”

## 工作流程

### 1. 最终验证（必需）

调用 superpowers:verification-before-completion。确保：
- [ ] 所有测试通过。
- [ ] 所有要求已满足。
- [ ] 无回归。

### 2. 代码清理

- [ ] 运行 lint/格式化工具（`npm run lint`, `black .`, `rustfmt` 等）。
- [ ] 确保所有提交消息遵循常规提交（Conventional Commits）规范。
- [ ] 如果有多个乱七八糟的提交，考虑进行 squash。

### 3. 合并过程

1. 切换回主分支并拉取最新更改。
2. 将开发分支合并到主分支（或创建 PR）。
3. 解决任何冲突（如果存在）。
4. 在合并后的主分支上再次运行测试。

### 4. 清理 Worktree

如果你使用的是 git worktree：
1. 提交所有更改。
2. 切换回主项目目录。
3. 删除 worktree：`git worktree remove <path>`。

### 5. 删除分支（可选）

如果分支已合并且不再需要：
`git branch -d <branch-name>`

## 快速参考

| 任务 | 命令 |
|------|------|
| 格式化 | `npm run format` / `cargo fmt` |
| 合并 | `git checkout main && git pull && git merge feature-branch` |
| 删除 Worktree | `git worktree remove .worktrees/feature` |
| 删除分支 | `git branch -d feature-branch` |

## 常见错误

- **忘记拉取最新 main：** 导致在过时的代码上合并。
- **留下 Worktree：** 占用磁盘空间并导致以后命名冲突。
- **提交消息混乱：** `fix`, `fix again`, `asdf` 等无意义的消息。

## 危险信号

**切勿：**
- 在没有通过最终验证的情况下合并。
- 在未清理 worktree 的情况下结束任务。
- 忽略 lint 错误。
- 提交带有冲突标记的文件。
