# Task 2: 词汇系统 + UI 适配（双语学习模式）

> Worktree: task-2-vocab-ui  
> 分支: feat/bilingual-vocab-ui  
> 依赖: task-0-migration（配置与数据契约）+ task-1-tools（词库与拼音数据）

## 任务目标
在不改变内部主键（始终使用 `word` 英文键）的前提下，完成词汇显示层与 UI 适配：支持 `languageMode` 切换主次文字、支持 `mode` 字段筛词、支持拼音显示/隐藏与首启模式引导，并确保移动端响应式布局稳定。

## 涉及文件
- `src/modules/09-vocab.js` - 修改，词汇加载适配 + `getDisplayContent(wordObj)` + 模式切换队列清空
- `src/modules/10-ui.js` - 修改，单词卡片拼音显示 + 响应式字体 + 设置开关 + 首启引导页

## 实施步骤

### Step 1: 在 `09-vocab.js` 增加数据标准化入口（主键统一为 `word`）
**文件**: `src/modules/09-vocab.js`  
**操作**: 新增标准化函数，确保无论原始词条字段如何，内部统一落到 `word/chinese/pinyin/phonetic/mode`。

```javascript
function normalizeWordEntry(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const word = String(raw.word || raw.en || '').trim();
  if (!word) return null;

  return {
    // 内部稳定主键：只使用英文 word
    word,
    chinese: String(raw.chinese || raw.zh || '').trim(),
    pinyin: String(raw.pinyin || '').trim(),
    phonetic: String(raw.phonetic || raw.uk || raw.us || '').trim(),
    phrase: String(raw.phrase || '').trim(),
    phraseTranslation: String(raw.phraseTranslation || raw.phraseZh || '').trim(),
    difficulty: String(raw.difficulty || 'basic').trim(),
    stage: String(raw.stage || '').trim(),
    mode: String(raw.mode || 'bilingual').trim().toLowerCase()
  };
}

function normalizeWordList(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeWordEntry).filter(Boolean);
}
```

**验证清单**:
- [ ] 任意词条缺失 `word`/`en` 时被过滤，不进入运行态词库
- [ ] 内部对象始终含 `word` 字段（英文主键）
- [ ] 旧字段 `en/zh/phraseZh` 能正确映射到新结构
- [ ] 词条 `mode` 缺失时默认 `bilingual`

---

### Step 2: 在 `09-vocab.js` 增加词库 `mode` 筛选
**文件**: `src/modules/09-vocab.js`  
**操作**: 按当前 `languageMode` 做词条过滤，保留 `bilingual` 兼容项。

```javascript
function getCurrentLanguageMode() {
  const settings = window.gameSettings || {};
  return settings.languageMode === 'chinese' ? 'chinese' : 'english';
}

function shouldKeepByMode(wordObj, languageMode) {
  const mode = String(wordObj.mode || 'bilingual').toLowerCase();
  if (mode === 'bilingual') return true;
  if (languageMode === 'chinese') return mode === 'chinese';
  return mode === 'english';
}

function filterWordsByLanguageMode(words, languageMode) {
  return words.filter((item) => shouldKeepByMode(item, languageMode));
}

function buildRuntimeVocab(rawList) {
  const normalized = normalizeWordList(rawList);
  const languageMode = getCurrentLanguageMode();
  return filterWordsByLanguageMode(normalized, languageMode);
}
```

**验证清单**:
- [ ] `languageMode=english` 时仅保留 `english/bilingual`
- [ ] `languageMode=chinese` 时仅保留 `chinese/bilingual`
- [ ] `mode` 非法值不会抛错（按过滤后不可用处理）
- [ ] 过滤后数组为空时，调用方可收到空数组（不崩溃）

---

### Step 3: 实现 `getDisplayContent(wordObj)`（仅显示层转换）
**文件**: `src/modules/09-vocab.js`  
**操作**: 新增显示转换函数，按 `languageMode` 输出主次文本，不改变 `wordObj.word` 主键。

```javascript
function getDisplayContent(wordObj) {
  const languageMode = getCurrentLanguageMode();
  const primaryEnglish = String(wordObj.word || '').trim();
  const primaryChinese = String(wordObj.chinese || '').trim();

  if (languageMode === 'chinese') {
    return {
      id: primaryEnglish, // 内部 ID 仍然是英文主键
      primaryText: primaryChinese || primaryEnglish,
      secondaryText: primaryEnglish,
      phoneticText: String(wordObj.pinyin || '').trim(),
      phrasePrimary: String(wordObj.phraseTranslation || '').trim(),
      phraseSecondary: String(wordObj.phrase || '').trim()
    };
  }

  return {
    id: primaryEnglish,
    primaryText: primaryEnglish,
    secondaryText: primaryChinese,
    phoneticText: String(wordObj.phonetic || '').trim(),
    phrasePrimary: String(wordObj.phrase || '').trim(),
    phraseSecondary: String(wordObj.phraseTranslation || '').trim()
  };
}
```

**验证清单**:
- [ ] 中英文模式切换只改变显示字段，不改变 `id` / `word`
- [ ] `chinese` 缺失时中文模式回退显示英文 `word`
- [ ] 英文模式优先显示 `phonetic`，中文模式优先显示 `pinyin`
- [ ] 挑战/进度系统继续以 `word` 作为唯一键

---

### Step 4: 在 `09-vocab.js` 增加模式切换时队列清空机制
**文件**: `src/modules/09-vocab.js`  
**操作**: 监听模式变更并清空当前队列，重新按新模式加载词。

```javascript
const vocabState = {
  queue: [],
  current: null,
  languageModeSnapshot: null
};

function clearVocabQueueOnModeChange() {
  const latestMode = getCurrentLanguageMode();
  if (vocabState.languageModeSnapshot === null) {
    vocabState.languageModeSnapshot = latestMode;
    return;
  }

  if (vocabState.languageModeSnapshot !== latestMode) {
    vocabState.queue = [];
    vocabState.current = null;
    vocabState.languageModeSnapshot = latestMode;
  }
}

function rebuildQueueFromSource(allWords) {
  clearVocabQueueOnModeChange();
  if (vocabState.queue.length > 0) return;

  const filtered = filterWordsByLanguageMode(normalizeWordList(allWords), getCurrentLanguageMode());
  vocabState.queue = filtered.slice();
}
```

**验证清单**:
- [ ] `english -> chinese` 切换后旧队列被清空
- [ ] `chinese -> english` 切换后旧队列被清空
- [ ] 未切换模式时不重复清空队列
- [ ] 队列重建后词条集合符合当前 `languageMode`

---

### Step 5: 在 `10-ui.js` 适配单词卡片（拼音在汉字上方 + 响应式）
**文件**: `src/modules/10-ui.js`  
**操作**: 改造卡片渲染函数，按模式输出主次文本；中文模式展示“拼音在上、汉字在中、英文在下”。

```javascript
function renderWordCard(wordObj) {
  const display = window.VocabModule.getDisplayContent(wordObj);
  const mode = (window.gameSettings && window.gameSettings.languageMode) || 'english';
  const showPinyin = window.gameSettings ? window.gameSettings.showPinyin !== false : true;

  const card = document.getElementById('word-card');
  if (!card) return;

  card.classList.toggle('word-card--chinese', mode === 'chinese');
  card.classList.toggle('word-card--english', mode !== 'chinese');

  const pinyinEl = card.querySelector('[data-role="pinyin"]');
  const primaryEl = card.querySelector('[data-role="primary"]');
  const secondaryEl = card.querySelector('[data-role="secondary"]');

  if (pinyinEl) {
    pinyinEl.textContent = mode === 'chinese' ? display.phoneticText : display.phoneticText;
    pinyinEl.style.display = mode === 'chinese' && showPinyin && display.phoneticText ? 'block' : 'none';
  }

  if (primaryEl) primaryEl.textContent = display.primaryText;
  if (secondaryEl) secondaryEl.textContent = display.secondaryText;
}
```

```css
/* 可放在现有 UI 样式文件中，对应 10-ui.js 使用的类名 */
.word-card--english [data-role="primary"] {
  font-size: clamp(30px, 4.8vw, 52px);
  line-height: 1.1;
}

.word-card--chinese [data-role="pinyin"] {
  font-size: clamp(16px, 2.8vw, 24px);
  line-height: 1.2;
  margin-bottom: 6px;
}

.word-card--chinese [data-role="primary"] {
  font-size: clamp(40px, 6.2vw, 68px);
  line-height: 1.1;
}

.word-card--chinese [data-role="secondary"] {
  font-size: clamp(18px, 3.1vw, 28px);
  line-height: 1.2;
}
```

**验证清单**:
- [ ] 中文模式显示顺序：拼音（上）→ 汉字（主）→ 英文（次）
- [ ] 英文模式不显示拼音块
- [ ] 在 360px 宽移动端无文字重叠/溢出
- [ ] 在 1024px+ 桌面端字号不过小

---

### Step 6: 在 `10-ui.js` 加入拼音显示/隐藏开关（设置页）
**文件**: `src/modules/10-ui.js`  
**操作**: 绑定设置开关 `showPinyin`，并在切换后立即刷新当前卡片。

```javascript
function bindShowPinyinToggle() {
  const toggle = document.getElementById('setting-show-pinyin');
  if (!toggle) return;

  const current = window.gameSettings && window.gameSettings.showPinyin;
  toggle.checked = current !== false;

  toggle.addEventListener('change', function onChange() {
    if (!window.gameSettings) window.gameSettings = {};
    window.gameSettings.showPinyin = !!toggle.checked;

    if (window.SettingsModule && typeof window.SettingsModule.saveSettings === 'function') {
      window.SettingsModule.saveSettings(window.gameSettings);
    }

    if (window.GameState && window.GameState.currentWord) {
      renderWordCard(window.GameState.currentWord);
    }
  });
}
```

**验证清单**:
- [ ] 开关状态可持久化到设置存储
- [ ] 中文模式关闭开关后拼音立即隐藏
- [ ] 重新打开应用后开关状态保留
- [ ] 英文模式下开关变化不影响主流程稳定性

---

### Step 7: 在 `10-ui.js` 增加首启引导页（学习模式选择）
**文件**: `src/modules/10-ui.js`  
**操作**: 首次启动检测 `languageMode` 是否已设置；未设置时弹引导层选择模式并写入配置。

```javascript
function shouldShowLanguageOnboarding() {
  try {
    const raw = localStorage.getItem('settings');
    if (!raw) return true;
    const parsed = JSON.parse(raw);
    return !parsed || (parsed.languageMode !== 'english' && parsed.languageMode !== 'chinese');
  } catch (e) {
    return true;
  }
}

function openLanguageOnboarding() {
  const modal = document.getElementById('language-onboarding-modal');
  if (!modal) return;

  modal.style.display = 'flex';

  const btnEnglish = modal.querySelector('[data-mode="english"]');
  const btnChinese = modal.querySelector('[data-mode="chinese"]');

  function apply(mode) {
    if (!window.gameSettings) window.gameSettings = {};
    window.gameSettings.languageMode = mode === 'chinese' ? 'chinese' : 'english';

    if (window.SettingsModule && typeof window.SettingsModule.saveSettings === 'function') {
      window.SettingsModule.saveSettings(window.gameSettings);
    }

    modal.style.display = 'none';

    if (window.VocabModule && typeof window.VocabModule.resetQueueForLanguageMode === 'function') {
      window.VocabModule.resetQueueForLanguageMode();
    }
  }

  if (btnEnglish) btnEnglish.onclick = function () { apply('english'); };
  if (btnChinese) btnChinese.onclick = function () { apply('chinese'); };
}

function bootstrapLanguageOnboarding() {
  if (shouldShowLanguageOnboarding()) {
    openLanguageOnboarding();
  }
}
```

**验证清单**:
- [ ] 首次启动必出现学习模式选择引导
- [ ] 选择后写入 `settings.languageMode`
- [ ] 非首次启动不重复弹出
- [ ] 选择模式后触发词汇队列重置

---

### Step 8: 联调验证（词汇层 + UI 层）
**文件**: `src/modules/09-vocab.js`、`src/modules/10-ui.js`  
**操作**: 按功能链路执行手动回归，覆盖模式切换、拼音开关、队列重建、响应式布局。

```bash
# 语法检查
node -c src/modules/09-vocab.js
node -c src/modules/10-ui.js

# 启动本地页面（任选项目现有方式）
# 示例：npx serve .
```

**联调清单**:
- [ ] 进入英语模式：主文=英文、次文=中文、ID 仍为 `word`
- [ ] 切换汉字模式：主文=汉字、上方拼音、次文=英文
- [ ] 切换模式后当前队列被清空并按新模式重建
- [ ] 关闭“显示拼音”后中文卡片不再显示拼音行
- [ ] 360x640、390x844、768x1024、1366x768 下布局均无重叠
- [ ] 进度记录键仍基于英文 `word`，无中文同名冲突

---

## 测试用例

### Case 1: 显示层转换不改主键
- 前置: 词条 `{ word: 'smile', chinese: '微笑', pinyin: 'wēi xiào', mode: 'bilingual' }`
- 操作: 分别在 `english/chinese` 下调用 `getDisplayContent()`
- 预期:
- [ ] 两种模式返回的 `id` 都是 `'smile'`
- [ ] 英文模式主文=`smile`，中文模式主文=`微笑`

### Case 2: 词库 mode 过滤
- 前置: 混合词库包含 `english/chinese/bilingual`
- 操作: 分别以两种语言模式调用 `filterWordsByLanguageMode`
- 预期:
- [ ] 英文模式结果不含 `mode='chinese'`
- [ ] 中文模式结果不含 `mode='english'`

### Case 3: 模式切换队列清空
- 前置: 当前队列有 20 个英语词
- 操作: `languageMode` 切换为 `chinese`
- 预期:
- [ ] 队列先清空再重建
- [ ] 新队列词条满足中文模式筛选条件

### Case 4: 拼音开关
- 前置: 中文模式 + 当前词含 `pinyin`
- 操作: 设置页关闭 `showPinyin`
- 预期:
- [ ] 当前卡片拼音行立刻隐藏
- [ ] 刷新页面后仍保持隐藏状态

### Case 5: 首启引导
- 前置: 清空 `settings`（无 `languageMode`）
- 操作: 启动页面
- 预期:
- [ ] 出现模式选择引导
- [ ] 选择后写入配置并关闭引导

### Case 6: 响应式布局
- 前置: 中文模式，长拼音词条（如 `zhōng huá rén mín gòng hé guó`）
- 操作: 在移动端和桌面端查看词卡
- 预期:
- [ ] 拼音/汉字/英文三层不重叠
- [ ] 文字不超出卡片边界

## 验收标准
- [ ] `src/modules/09-vocab.js` 已实现 `getDisplayContent(wordObj)`
- [ ] 内部主键始终使用 `word (en)`，显示层转换不改主键
- [ ] 词汇加载支持按 `mode` + `languageMode` 过滤
- [ ] 模式切换时会清空当前单词队列并重建
- [ ] `src/modules/10-ui.js` 已支持拼音显示（汉字上方）
- [ ] 设置页已支持 `showPinyin` 显示/隐藏开关
- [ ] 已实现首启学习模式引导页
- [ ] UI 在移动端与桌面端均满足响应式显示
- [ ] 两个模块通过语法检查（`node -c`）

## 备注
- 本任务只做“显示层与交互层适配”，不改挑战统计与存档主键策略。
- 若发现历史词条存在 `word` 重复，应在 task-1 词库治理范围处理，不在 task-2 内做数据去重逻辑扩展。
