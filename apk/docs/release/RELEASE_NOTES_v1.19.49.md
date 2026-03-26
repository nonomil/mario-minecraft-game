# Release Notes - v1.19.49

**发布日期**: 2026-03-26

## 📋 变更概述
本次更新主要完成了桥接模式（Bridge Language）的词库净化和学习 UI 的回归覆盖，并同步了最新的 APK 构建版本（Build 100）。

## ✨ 新功能
- **桥接语言 UI 回归测试**: 新增 `tests/unit/bridge-language-ui-regression.test.mjs`，确保桥接模式下的词卡展示、元信息和挑战行逻辑稳定。

## 🐛 Bug 修复
- **桥接词库净化**: 继续 `fix: continue bridge language vocab curation`，清理桥接模式下的词库噪声。
- **挑战显示逻辑**: 修复 `src/modules/12-challenges.js` 中挑战显示的文本提取逻辑，统一使用 `getChallengeDisplayLines` 确保多模式兼容。

## 🔧 优化改进
- **版本同步**: 升级版本元数据到 `v1.19.49 / build 100`，同步 APK 构建信息、缓存版本和发布说明。

## 📝 文档更新
- **发布记录**: 更新 `CHANGELOG.md` 并生成 `RELEASE_NOTES_v1.19.49.md`。

## 🎯 下一步计划
- 继续深化桥接模式的学习体验和报告 UI。

---

**完整变更**: 2 commits + uncommitted changes
