---
name: changelog
description: Use when 需要基于近期 git 提交生成或更新 CHANGELOG 文档，通常在发布前或里程碑收尾阶段。
---

# changelog

## 执行步骤

1. 读取最近版本范围内的提交（优先 `last-tag..HEAD`，无 tag 时取最近提交）。
2. 按类型归类：`feat/fix/refactor/docs/perf/other`。
3. 生成面向用户的发布说明条目。
4. 更新 `CHANGELOG.md`（新版本内容放在顶部，保留历史）。
5. 需要时同步 `docs/changelog-draft.md` 草稿。

## 约束

- 版本号采用语义化版本（SemVer），不自行跳版本。
- 不删除历史 changelog 内容。
