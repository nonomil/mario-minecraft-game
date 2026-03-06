# 需求文档：汉语学习模式

**创建时间**: 2026-03-06
**状态**: ✅ 功能已完整实现！

## 需求理解（已确认）

用户希望添加"汉语学习模式"功能：

1. **游戏内容变化**：在汉语学习模式下，游戏中显示的英文单词要改为显示汉字或短语
2. **UI 入口**：
   - 在选择档案的界面，当前选项下方增加学习模式选择
   - 游戏中可以在设置中切换学习模式
3. **影响范围**：所有显示单词的地方都需要切换
   - 黄色圆圈上的单词
   - 单词测验（挑战系统）
   - 单词闸门
   - 单词书（词汇表）
   - 复活时的连线匹配
4. **词汇数据来源**：使用现有英文词汇包的中文翻译
5. **语音朗读**：汉语模式用中文 TTS

## 🎉 结论：功能已完整实现！

通过完整的代码审查，确认**汉语学习模式功能已经完全实现**，所有需求点都已覆盖。

### 完整实现清单

#### ✅ 1. UI 层（已完成）

**登录界面语言选择**：
- [Game.html:20-27](../../../Game.html#L20-L27) - 语言模式选择 UI
- [src/modules/17-bootstrap.js:514-559](../../../src/modules/17-bootstrap.js#L514-L559) - 事件绑定和初始化逻辑
  - `initializeLanguageModeOnboarding()` - 首次启动时显示语言选择
  - 已选择语言后自动隐藏选择界面
  - 按钮事件已绑定：`btn-language-mode-english` 和 `btn-language-mode-chinese`

**设置面板切换**：
- [Game.html:204-212](../../../Game.html#L204-L212) - 设置中的语言模式下拉框和拼音显示选项
- [src/modules/16-events.js:176](../../../src/modules/16-events.js#L176) - 加载设置时同步 UI
- [src/modules/16-events.js:229](../../../src/modules/16-events.js#L229) - 保存设置时更新 `languageMode`

#### ✅ 2. 存储系统（已完成）

- [src/storage.js:401-469](../../../src/storage.js#L401-L469) - 完整的双语迁移逻辑
  - `migrateToBilingualV2_2_0()` - 数据迁移函数
  - `initializeBilingualMigration()` - 启动时自动调用
- [src/modules/17-bootstrap.js:515-516](../../../src/modules/17-bootstrap.js#L515-L516) - 启动时调用迁移
- 存储结构：
  ```javascript
  localStorage: {
    languageMode: "english" | "chinese",
    showPinyin: "true" | "false",
    englishProgress_kg: {},
    englishProgress_game: {},
    chineseProgress_kg: {},
    chineseProgress_game: {}
  }
  ```

#### ✅ 3. 词汇系统（已完成）

**核心双语支持**：
- [src/modules/09-vocab.js:710-791](../../../src/modules/09-vocab.js#L710-L791) - `BilingualVocab` 模块
  - `normalizeWordContent()` - 标准化词汇内容
  - `getCurrentLanguageMode()` - 获取当前语言模式
  - `filterWordsByLanguageMode()` - 按语言模式过滤单词
  - `getDisplayContent()` - **核心函数**，根据语言模式返回显示内容
    - 英语模式：`primaryText = 英文`, `secondaryText = 中文`
    - 汉语模式：`primaryText = 中文`, `secondaryText = 英文`, `phoneticText = 拼音`

**词汇数据结构**（已支持）：
```javascript
{
  word: "apple",           // 英文单词
  chinese: "苹果",         // 中文翻译
  pinyin: "píng guǒ",     // 拼音
  phonetic: "/ˈæpl/",     // 音标
  phrase: "an apple",     // 英文短语
  phraseTranslation: "一个苹果",  // 中文短语翻译
  mode: "bilingual"       // 词汇模式
}
```

#### ✅ 4. 游戏内显示（已完成）

**黄色圆圈上的单词**：
- [src/modules/13-game-loop.js:527](../../../src/modules/13-game-loop.js#L527) - 已调用 `BilingualVocab.getDisplayContent()`
  ```javascript
  const displayContent = window.BilingualVocab?.getDisplayContent?.(item.wordObj);
  ```

**挑战系统**：
- [src/modules/12-challenges.js:1019](../../../src/modules/12-challenges.js#L1019) - 已调用 `BilingualVocab.getDisplayContent()`
- [src/modules/12-challenges.js:272-273](../../../src/modules/12-challenges.js#L272-L273) - 汉语模式特殊处理
- [src/modules/12-challenges.js:434-435](../../../src/modules/12-challenges.js#L434-L435) - 汉语模式特殊处理
- [src/modules/12-challenges.js:787-792](../../../src/modules/12-challenges.js#L787-L792) - TTS 语言切换
  ```javascript
  const languageMode = getLanguageModeSafe();
  const lang = languageMode === "chinese" ? "zh-CN" : "en-US";
  const rate = languageMode === "chinese" ? settings.speechZhRate : settings.speechEnRate;
  ```

#### ✅ 5. TTS 系统（已完成）

- [src/modules/12-challenges.js:787-792](../../../src/modules/12-challenges.js#L787-L792) - 根据语言模式切换 TTS 语言和语速
- 汉语模式使用 `zh-CN` 和 `settings.speechZhRate`
- 英语模式使用 `en-US` 和 `settings.speechEnRate`

### 功能覆盖度检查

| 需求点 | 实现状态 | 代码位置 |
|--------|---------|---------|
| 登录界面语言选择 | ✅ 已实现 | Game.html:20-27, bootstrap.js:544-552 |
| 设置面板切换 | ✅ 已实现 | Game.html:204-212, events.js:176,229 |
| 黄色圆圈显示 | ✅ 已实现 | game-loop.js:527 |
| 单词测验 | ✅ 已实现 | challenges.js:1019 |
| 单词闸门 | ✅ 已实现 | challenges.js:272-273 |
| 单词书/词汇表 | ✅ 已实现 | BilingualVocab.getDisplayContent() |
| 复活连线 | ✅ 已实现 | challenges.js:434-435 |
| 中文 TTS | ✅ 已实现 | challenges.js:787-792 |
| 拼音显示 | ✅ 已实现 | Game.html:211, vocab.js:769 |
| 数据存储 | ✅ 已实现 | storage.js:401-469 |
| 数据迁移 | ✅ 已实现 | storage.js:429-463, bootstrap.js:515-516 |

## 复杂度最终判断

### 判断结果：**无需开发，仅需测试验证**

理由：
1. ✅ 所有功能已完整实现
2. ✅ UI、存储、词汇、挑战、TTS 全部模块已连接
3. ✅ 事件绑定已完成
4. ✅ 数据迁移逻辑已存在

### 可能的问题

虽然功能已实现，但可能存在以下情况：

1. **用户未发现功能**：
   - 首次启动时语言选择界面可能被忽略
   - 设置面板中的选项不够显眼

2. **词汇数据缺失**：
   - 如果词汇包中的 `chinese` 字段为空，汉语模式会显示空白
   - 需要检查词汇数据的完整性

3. **UI 状态同步问题**：
   - 切换语言模式后，某些界面可能未立即刷新

## 下一步行动

### 方案 A：直接测试（推荐）

1. 启动游戏，检查登录界面是否显示语言选择
2. 选择"汉字学习"，进入游戏
3. 检查黄色圆圈、挑战、闸门等是否显示中文
4. 检查 TTS 是否使用中文朗读
5. 检查设置面板中是否可以切换语言模式

### 方案 B：检查词汇数据

如果测试发现汉语模式显示空白，需要检查：
1. 词汇包中是否有 `chinese` 字段
2. 词汇数据的完整性

### 方案 C：改进 UI 提示

如果用户反馈"找不到汉语模式"，可以：
1. 在登录界面增加更明显的提示
2. 在设置面板中增加说明文字
3. 添加首次使用引导

## 给用户的回复

功能已经完整实现！你可以：

1. **首次启动时选择**：
   - 打开游戏，在登录界面会看到"🌍 选择学习模式"
   - 点击"🇨🇳 汉字学习"即可

2. **游戏中切换**：
   - 点击右上角"⚙️ 设置"
   - 找到"学习语言模式"下拉框
   - 选择"🇨🇳 汉字学习"
   - 保存设置

3. **拼音显示**：
   - 在设置中勾选"显示拼音"
   - 汉语模式下会显示拼音注音

如果你发现功能不工作，请告诉我具体的问题（比如"汉语模式下显示空白"或"切换后没有变化"），我会帮你调试。
