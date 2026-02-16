# v1.15.5 版本状态

## 已完成

### 1) 版本号同步
- `apk/package.json`: `1.15.5`

### 2) 单词库难度分级
- `apk/words/vocabs/manifest.js`
  - 每个词库类别拆分为初级/中级/高级/完整四个 pack
  - 幼儿园：分卷01-03(初级) / 04-07(中级) / 08-10(高级) / 全部(完整)
  - 小学低年级：分卷01-03(初级) / 04-07(中级) / 08-10(高级) / 全部(完整)
  - 小学高年级：低年级基础(初级) / 高年级基础(中级) / 全阶段合并(高级) / 全部(完整)
  - 我的世界：basic+blocks+items(初级) / intermediate+entities+biomes(中级) / advanced+enchantments(高级) / 全部(完整)
  - 从 4 个 pack 扩展为 16 个 pack
- `apk/src/modules/09-vocab.js`
  - renderVocabSelect() 重构为 optgroup 分组渲染
  - 按 stage 分组，按 level 排序（初级→中级→高级→完整）

### 3) 文档与版本记录同步
- `apk/docs/version/CHANGELOG.md` - 新增 v1.15.5 发布记录
- `apk/docs/version/Progress.md` - 新增 v1.15.5 进度条目（versionCode 96）

---

更新时间：2026-02-16
状态：已完成
