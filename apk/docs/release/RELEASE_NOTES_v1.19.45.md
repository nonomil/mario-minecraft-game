# Release Notes - v1.19.45

**发布日期**: 2026-03-19

## 📋 变更概述
本次发布聚焦“幼小衔接/汉字/拼音学习线”的收口与可发布性：一方面继续清洗并扩充低年级语文词库，把内容补到更贴近学前到二年级的真实课堂与阅读场景；另一方面修复设置中词库选项重名、桥接学习层级过滤不精确等问题，并把词语配对、挑战弹窗、学习报告等界面继续调整得更贴近课堂化学习流程。

## ✨ 新功能
- **低年级语文词库继续扩充**: 新增查字典、音序表、部首表、阅读交流、课堂展示、快乐读书吧等更贴近统编语文一二年级的词语与拓展词。
- **分层课堂表达**: 新增并分层整理学前到一年级、一年级到二年级的口语交际短表达，如“请你先说”“我们齐读”“我先读一段”“请补充一句”“请完整表达”等。
- **课堂化 UI 提示**: 词语配对复活弹窗显示当前学习层级，挑战弹窗新增课堂上下文徽标，学习报告增加汉字/拼音模式主题。

## 🐛 Bug 修复
- **词库设置重名**: 修复设置里多个词库只显示 `初级/中级/高级/完整` 导致难以区分的问题，改为优先展示真实词库标题并做冲突兜底。
- **桥接年级边界**: 修复 `grade1` 学习范围误包含 `一年级-二年级` 词条的问题，改为按允许年级段精确过滤。
- **表达拼音回退**: 修复共享拼音映射未覆盖新字时，部分新增课堂表达因缺拼音而无法进入运行词库的问题。

## 🔧 优化改进
- **课堂风格一致性**: 强化汉字/拼音/幼小衔接模式在挑战标题、上下文提示、词卡展示、学习报告上的风格一致性。
- **词库质量门禁**: 补充词语/表达/层级/设置标签的回归覆盖，继续压制重复词条、怪词和年级标注漂移。

## 🧪 测试更新
- `node tests/unit/bridge-vocab-coverage.test.mjs`
- `node tests/unit/bridge-language-ui-regression.test.mjs`
- `node tests/unit/bridge-grade-scope-regression.test.mjs`
- `node tests/unit/vocab-pack-switch-regression.test.mjs`
- `node tests/unit/kindergarten-hanzi-regression.test.mjs`
- `node tests/unit/pinyin-pack-regression.test.mjs`
- `node tests/unit/bridge-play-display.test.mjs`

## 📦 版本元数据
- `version.json` -> `versionCode/buildNumber 97`, `versionName 1.19.45`
- `package.json` -> `1.19.45`
- `android-app/package.json` -> `1.19.45`
- `android-app/android/app/build.gradle` -> `versionCode 97`, `versionName 1.19.45`
- `android-app/web/build-info.json` -> `version 1.19.45`, `buildNumber 97`, `gitCommit 7905f41`
- `service-worker.js` -> cache `v1.19.45`
- `Game.html` -> cache busting query param `v=1.19.45`

---

**相关 Git 记录**: `7905f41 feat: expand bridge vocab content and learning ui`
