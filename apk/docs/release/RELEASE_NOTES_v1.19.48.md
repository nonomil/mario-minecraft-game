# Release Notes - v1.19.48

**发布日期**: 2026-03-26

## 📋 变更概述
本次版本继续把词库从“能跑”收口到“更适合幼儿园与小学低年级实际学习使用”：重点清理汉字包和幼小衔接词库中的生硬、抽象、教师视角或无意义词条，同时补回更具体、可操作、贴近课堂与生活的数学/语文/英语内容，并同步更新 README、缓存版本和 APK 构建元数据。

## ✨ 新功能

### 低年级数学词条继续扩充
- 为幼小衔接数学补回更适合学前到二年级的核心内容：
  - `十以内加法`
  - `十以内减法`
  - `二十以内加减`
  - `图形拼搭`
  - `图形拼图`
  - `看位置`
  - `看统计图`
- 同步补入 `加一加 / 减一减 / 合起来 / 分开算 / 一共多少 / 还剩多少 / 图形摆放 / 统计文具` 等更具体的词条。

### 新增词库净化回归测试
- 新增 `tests/unit/bridge-vocab-curation.test.mjs`
- 把汉字例词、桥接语文、桥接数学、桥接英语的重点净化规则固化为自动回归，避免后续再回退到“生成感强”“教师口吻”“包外字符例词”等问题。

## 🐛 Bug 修复

### 汉字包异常例词继续清理
- 修正 800 字汉字包内仍残留的异常例词组合。
- `操` 等条目统一改回更适合儿童识读、且只使用包内字符的自然组词。
- 同步强化回归测试，避免再次出现 `examples 应仅使用汉字包内字符` 的失败。

### 幼小衔接词库去噪
- 语文：继续过滤教师任务口吻、行政化栏目词和不自然课堂指令。
- 数学：继续过滤 `应用题 / 数量关系 / 看图题 / 口算题 / 规律卡片 / 整理图卡` 等抽象或机械生成词。
- 英语：继续阻断无意义自然拼读伪词，保留真实可发音、可学习的单词样本。
- manifest：确保 `vocab.bridge.english` 真实加载 `words/vocabs/08_幼小衔接/幼小衔接_英语.js`。

### 词卡/展示提示进一步精简
- 汉字模式与幼小衔接模式默认不再显示不必要的 stage/meta 提示。
- APK 单文件页同步展示整理后的 HUD / 卡片 / 档案按钮状态逻辑。

## 🔧 优化改进

### README 与项目对外说明同步
- 仓库首页 README 改为反映当前真实功能面：
  - 多学习线（英语 / 汉字 / 拼音 / 幼小衔接）
  - 学前到二年级词库结构
  - Boss / 群系 / 学习报告 / 档案系统
  - 近期 Git 演进摘要

### 版本元数据统一
- 版本号更新到 `v1.19.48`
- 构建号更新到 `build 99`
- 同步更新：
  - `package.json`
  - `android-app/package.json`
  - `version.json`
  - `android-app/android/app/build.gradle`
  - `android-app/web/build-info.json`
  - `build/build-info.json`
  - `Game.html`
  - `service-worker.js`
  - `android-app/web/index.html`
  - `build/index.html`

## 📝 文档更新
- `README.md`
- `CHANGELOG.md`
- `docs/release/release-notes.md`
- `docs/release/RELEASE_NOTES_v1.19.48.md`

## 🧪 验证记录
- `node tests/unit/kindergarten-hanzi-regression.test.mjs`
- `node tests/unit/bridge-vocab-curation.test.mjs`
- `node tests/unit/bridge-vocab-coverage.test.mjs`
- `node tests/unit/vocab-pack-switch-regression.test.mjs`
- `node tests/unit/bridge-language-ui-regression.test.mjs`
- `npx playwright test tests/e2e/specs/bridge-vocab-expansion.spec.mjs --config tests/e2e/playwright.config.mjs`

## 🎯 相关 Git 记录
- `ef3be18 feat: finalize child-friendly vocab curation and bridge polish`

---

**完整变更**: 1 个功能提交 + 1 个版本发布提交  
**主要文件**: `words/vocabs/06_汉字/幼儿园汉字.js`, `words/vocabs/08_幼小衔接/幼小衔接_语文.js`, `words/vocabs/08_幼小衔接/幼小衔接_数学.js`, `words/vocabs/08_幼小衔接/幼小衔接_英语.js`, `words/vocabs/08_幼小衔接/幼小衔接总词库.js`, `words/vocabs/manifest.js`, `src/modules/09-vocab.js`, `android-app/web/index.html`
