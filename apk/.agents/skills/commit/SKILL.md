---
name: commit
description: Use when 完成一个任务单元后需要更新任务文档 checkbox 并执行一次规范化提交。
---

# commit

## 执行步骤

1. 在 `docs/development/` 下定位当前任务文档（优先最近修改的 `*-steps.md`）。
2. 将已完成步骤从 `- [ ]` 更新为 `- [x]`。
3. 运行 `git status --short` 和 `git diff --stat` 确认改动范围。
4. 生成 Conventional Commits 提交信息（`feat/fix/refactor/docs/test/chore`）。
5. 执行 `git add -A` 与 `git commit -m "<message>"`。

## 约束

- 不执行 `git push`，除非用户明确要求。
- 若存在范围外改动、冲突或测试失败，先停下并报告。
