# 双语学习模式 - 跨任务接口契约

> 版本：1.0
> 生成日期：2026-03-06
> 用途：确保 4 个任务正确对接

## 0. Phase 4.5 关键问题与本契约结论

- 问题 1：`languageMode` 存在多真源写入（`settings` / `localStorage` / `window.gameSettings`）。
- 结论：统一为 `settings.languageMode` 单一写入点；`localStorage` 仅兼容读取；禁止直接写 `window.gameSettings.languageMode`。
- 问题 2：跨任务导出接口不完整，导致调用方无法稳定对接。
- 结论：task-0 ~ task-3 的必需导出 API / 文件 / DOM 在本契约第 2~5 章强制定义。
- 问题 3：task-2 与 task-3 在首启引导、模式切换处存在重复实现风险。
- 结论：首启引导与模式切换逻辑只归属 task-3；task-2 仅做词库与显示层适配。

## 1. 单一真源规范

### 1.1 languageMode（语言模式）

- **唯一写入点**：`settings.languageMode`
- **唯一允许写入入口**：`SettingsModule.updateSettings({ languageMode })`（或等效封装）
- **读取方式**：

```javascript
// ✅ 正确：统一从 settings 读取
const mode = settings.languageMode;

// ❌ 错误：localStorage 直读作为业务真源
const mode = localStorage.getItem('languageMode');

// ❌ 错误：直接写 window.gameSettings
window.gameSettings.languageMode = 'chinese';
```

- **兼容读取策略**（仅初始化阶段允许）：

```javascript
function hydrateLanguageMode(settings) {
  const v = localStorage.getItem('languageMode');
  if (settings.languageMode !== 'english' && settings.languageMode !== 'chinese') {
    settings.languageMode = v === 'chinese' ? 'chinese' : 'english';
  }
}
```

- **写入策略**：业务层只写 `settings.languageMode`；持久化由 task-0 的 settings 存储链路统一处理。

### 1.2 其他配置字段

- `settings.learningMode: boolean`（保留现有语义，不与 `languageMode` 混用）
- `settings.showPinyin: boolean`（仅在中文模式决定拼音显示）
- 配置变更必须通过同一更新入口（如 `updateSettings`），禁止散落写入。

## 2. task-0 输出契约

### 2.1 配置字段

- 必须提供并持久化：`languageMode`, `showPinyin`, `learningMode`
- 默认值：`languageMode='english'`, `showPinyin=true`, `learningMode=true`

### 2.2 存储键

- `dataVersion`
- `englishProgress_kg`
- `chineseProgress_kg`
- `englishProgress_game`
- `chineseProgress_game`

### 2.3 迁移函数

- 必须导出：`migrateToV2_2_0()`
- 契约要求：幂等、可重复执行、不会覆盖已存在新键有效数据。

```javascript
function migrateToV2_2_0() {
  if (localStorage.getItem('dataVersion') === '2.2.0') return false;

  // 仅迁移缺失目标键，避免覆盖
  if (localStorage.getItem('englishProgress_kg') === null) {
    localStorage.setItem('englishProgress_kg', localStorage.getItem('kgProgress') || '{}');
  }
  if (localStorage.getItem('englishProgress_game') === null) {
    localStorage.setItem('englishProgress_game', localStorage.getItem('wordGameProgress') || '{}');
  }
  if (localStorage.getItem('chineseProgress_kg') === null) localStorage.setItem('chineseProgress_kg', '{}');
  if (localStorage.getItem('chineseProgress_game') === null) localStorage.setItem('chineseProgress_game', '{}');
  if (localStorage.getItem('languageMode') === null) localStorage.setItem('languageMode', 'english');

  localStorage.setItem('dataVersion', '2.2.0');
  return true;
}
```

## 3. task-1 输出契约

- 词库文件：`words/vocabs/06_汉字/幼儿园汉字.js`
- manifest 注册：`mode: "chinese"`
- 拼音生成工具：`tools/add-pinyin.js`

### 3.1 数据结构最低要求

```javascript
{
  word: 'smile',
  chinese: '微笑',
  pinyin: 'wei xiao',
  mode: 'chinese'
}
```

## 4. task-2 输出契约

- `window.VocabModule.getRuntimeWords()`：返回当前模式运行时词条队列
- `window.VocabModule.getDisplayContent(wordObj)`：返回 UI 渲染所需主次内容
- `window.VocabModule.resetQueueForLanguageMode()`：模式变化后重建队列
- DOM 元素：`#word-card-pinyin`, `#setting-show-pinyin`

### 4.1 API 行为约束

```javascript
const runtimeWords = window.VocabModule.getRuntimeWords(); // Array<wordObj>
const display = window.VocabModule.getDisplayContent(runtimeWords[0]);
// display 至少包含：primaryText, secondaryText, phoneticText
window.VocabModule.resetQueueForLanguageMode();
```

- task-2 仅负责显示适配，不负责首启引导流程决策。

## 5. task-3 输出契约

- `window.ChallengeModule.handleLanguageModeChange()`：模式切换事务入口
- DOM 元素：`#language-onboarding-modal`, `#setting-language-mode`

### 5.1 模式切换必须走事务入口

```javascript
// task-3 唯一模式切换入口
function handleLanguageModeChange(newMode) {
  const normalized = newMode === 'chinese' ? 'chinese' : 'english';

  AudioModule.stopSpeech();
  ChallengeModule.closeChallenge();
  SettingsModule.updateSettings({ languageMode: normalized }); // 唯一写入
  VocabModule.resetQueueForLanguageMode();
  UIModule.refreshDisplay();
}
```

## 6. 职责划分表

| 功能 | 归属任务 | 说明 |
|------|---------|------|
| 首启引导页 | task-3 | 唯一实现，task-2 不实现 |
| 模式切换逻辑 | task-3 | 唯一实现，必须通过 `handleLanguageModeChange` |
| 拼音显示开关 | task-2 | 唯一实现（UI 展示层） |
| 词库队列重建 | task-2 | 由 task-3 调用，不重复实现 |
| 进度键映射与迁移 | task-0 | 唯一实现 |

## 7. DOM id 约定

| DOM id | 归属任务 | 用途 |
|--------|---------|------|
| `#word-card-pinyin` | task-2 | 单词卡拼音显示容器 |
| `#setting-show-pinyin` | task-2 | 拼音显示开关（设置项） |
| `#language-onboarding-modal` | task-3 | 首启引导弹窗容器 |
| `#setting-language-mode` | task-3 | 语言模式切换控件 |

- 约束：DOM id 全局唯一，不允许 task-2 与 task-3 重复创建同名节点。

## 8. localStorage 键约定

| 键名 | 格式 | 用途 | 归属任务 |
|------|------|------|---------|
| `dataVersion` | string（如 `'2.2.0'`） | 数据迁移版本门禁 | task-0 |
| `englishProgress_kg` | JSON string object | 英语幼儿园阶段进度 | task-0/task-3 使用 |
| `chineseProgress_kg` | JSON string object | 汉字幼儿园阶段进度 | task-0/task-3 使用 |
| `englishProgress_game` | JSON string object | 英语游戏进度 | task-0/task-3 使用 |
| `chineseProgress_game` | JSON string object | 汉字游戏进度 | task-0/task-3 使用 |
| `languageMode` | `'english' \| 'chinese'` | **仅兼容读取**（初始化回填） | task-0 |

- 约束：业务读写使用 `settings.languageMode`；`localStorage.languageMode` 不得作为运行期真源。

## 9. 初始化顺序

```javascript
// 必须按此顺序初始化
1. 加载 settings（task-0）
2. 运行 migrateToV2_2_0（task-0）
3. 兼容读取 localStorage.languageMode 并回填 settings（task-0）
4. 加载词库与 manifest（task-1）
5. 初始化 VocabModule（task-2）
6. 初始化 ChallengeModule（task-3）
7. 首次启动时显示引导（task-3）
```

## 10. 模式切换事务流程

```javascript
// task-3 负责实现；禁止在 task-2 重复实现切换事务
function handleLanguageModeChange(newMode) {
  // 1. 停止当前朗读
  AudioModule.stopSpeech();

  // 2. 关闭挑战弹窗
  ChallengeModule.closeChallenge();

  // 3. 更新配置（唯一写入点）
  SettingsModule.updateSettings({
    languageMode: newMode === 'chinese' ? 'chinese' : 'english'
  });

  // 4. 重建词库队列（task-2 提供能力）
  VocabModule.resetQueueForLanguageMode();

  // 5. 刷新 UI
  UIModule.refreshDisplay();
}
```

## 11. 验证清单

开发完成后，验证以下契约是否遵守：

- [ ] `languageMode` 只通过 `settings` 写入，无 `window.gameSettings.languageMode = ...` 直接赋值
- [ ] `localStorage.languageMode` 仅在初始化兼容读取，不作为运行期真源
- [ ] task-0 已导出并接入 `migrateToV2_2_0()`
- [ ] task-1 已提供词库文件、manifest `mode: "chinese"`、拼音工具
- [ ] task-2 已导出 `getRuntimeWords` / `getDisplayContent` / `resetQueueForLanguageMode`
- [ ] task-3 已导出 `handleLanguageModeChange`
- [ ] 首启引导只由 task-3 实现（task-2 无首启引导流程代码）
- [ ] 模式切换事务只由 task-3 实现（task-2 无重复切换事务）
- [ ] 所有 DOM id 按约定创建且无重复
- [ ] 初始化顺序与第 9 章一致
