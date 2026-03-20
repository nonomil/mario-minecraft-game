# Release Notes - v1.19.46

**发布日期**: 2026-03-20

## 📋 变更概述
本次发布集中完成“汉字 / 拼音 / 幼小衔接学习线”的发布收口：继续提升词库入口与分层显示的清晰度，修复整套词库在 APK 场景下的发音回退、抽词重复、模式设置误导等核心问题，并进一步清理单词卡、挑战弹窗、HUD 与学习提示，让整体体验更贴近学前到二年级的课堂化学习流程。

## ✨ 新功能
- **汉字 / 拼音词库独立入口**: 将 `vocab.kindergarten.hanzi` 与 `vocab.kindergarten.pinyin` 固化为独立包，设置页按汉字 / 拼音 / 英语分组显示，避免继续混入桥接总包。
- **课堂化学习呈现**: 继续整理幼小衔接、汉字、拼音模式在词卡、挑战标题、上下文徽标和学习报告中的文案与展示顺序。

## 🐛 Bug 修复
- **TTS 回退恢复**: 修复 APK provider 不可用时所有词库都无法发音的问题，改为先判断原生可用性，再回退到 Web / 其他 provider。
- **抽词重复修复**: 抽词器、跟随短语和挑战候选统一改用稳定词条键，修复汉字模式切换后反复出现少数几个词的问题。
- **模式设置修复**: 修复英语 / 汉字模式仍显示幼小衔接层级选择，以及拼音模式默认露出拼音、不符合低龄学习节奏的问题。
- **挑战候选稳定性**: 修复挑战候选池仍按旧 `en` 字段排除自身，导致汉字 / 拼音包候选重复和干扰项质量不稳定的问题。

## 🔧 优化改进
- **提示降噪**: 清理幼小衔接单词卡和挑战中的无用提示、冗余副文案和不合适的拼音暴露。
- **词库名称清晰化**: 统一 manifest、设置下拉框、预览与切换提示中的词库显示名和分类标签，减少重复名称带来的误导。
- **缓存与版本同步**: 同步页面资源缓存戳、Service Worker 缓存版本和 Android/Web 构建元数据到 `v1.19.46 / build 98`。

## 🧪 测试更新
- `node --check src/modules/09-vocab.js`
- `node --check src/modules/10-ui.js`
- `node --check src/modules/11-game-init.js`
- `node --check src/modules/12-challenges.js`
- `node --check src/modules/13-game-loop.js`
- `node --check src/modules/14-renderer-main.js`
- `node --check src/modules/16-events.js`
- `node --check src/modules/17-bootstrap.js`
- `node --check words/vocabs/manifest.js`
- `node tests/unit/vocab-pack-switch-regression.test.mjs`
- `node tests/unit/bridge-language-ui-regression.test.mjs`
- `node tests/unit/bridge-grade-scope-regression.test.mjs`
- `node tests/unit/kindergarten-hanzi-regression.test.mjs`
- `node tests/unit/pinyin-pack-regression.test.mjs`
- `node tests/unit/bridge-play-display.test.mjs`

## 📦 版本元数据
- `version.json` -> `versionCode/buildNumber 98`, `versionName 1.19.46`
- `package.json` -> `1.19.46`
- `android-app/package.json` -> `1.19.46`
- `android-app/android/app/build.gradle` -> `versionCode 98`, `versionName 1.19.46`
- `android-app/web/build-info.json` -> `version 1.19.46`, `buildNumber 98`, `gitCommit 5599e8e`
- `service-worker.js` -> cache `v1.19.46`
- `Game.html` -> cache busting query param `v=1.19.46`

---

**相关 Git 记录**: `5599e8e feat: finalize bridge vocab curation and learning polish (docs/plans/2026-03-15-words-vocab-reorg-and-bridge-expansion-plan.md)`
