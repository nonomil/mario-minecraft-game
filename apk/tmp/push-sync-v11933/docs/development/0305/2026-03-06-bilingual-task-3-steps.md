# Task 3: 挑战系统与集成（双语学习模式）

> Worktree: task-3-integration  
> 分支: feat/bilingual-integration  
> 依赖: task-0（数据契约）+ task-2（词汇+UI）（串行）

## 任务目标
完成挑战系统的双语模式集成：按 `languageMode` 分离挑战进度键、支持中英文 TTS 切换、保障模式切换事务性（停止→清空→重建→刷新），并在首启引导与设置切换中给出清晰提示。

## 涉及文件
- `src/modules/12-challenges.js` - 修改，挑战进度分离 + 模式识别 + 朗读逻辑 + 事务性切换
- `src/modules/03-audio.js` - 修改，`speak(text, lang)` 能力与中文语音降级提示
- `Game.html` - 修改，首启模式选择引导 + 设置切换确认提示

## 实施步骤

### Step 1: 在 `12-challenges.js` 建立模式与进度键映射
**文件**: `src/modules/12-challenges.js`  
**操作**: 新增统一入口函数，确保挑战系统只通过映射函数读写进度键。

```javascript
function getLanguageModeSafe() {
  const mode = (window.gameSettings && window.gameSettings.languageMode) || localStorage.getItem('languageMode');
  return mode === 'chinese' ? 'chinese' : 'english';
}

function getChallengeProgressKeys() {
  const mode = getLanguageModeSafe();
  if (mode === 'chinese') {
    return {
      kg: 'chineseProgress_kg',
      game: 'chineseProgress_game'
    };
  }
  return {
    kg: 'englishProgress_kg',
    game: 'englishProgress_game'
  };
}

function readProgressByKey(storageKey) {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '{}');
  } catch (e) {
    console.warn('[Challenge] parse progress failed:', storageKey, e);
    return {};
  }
}

function writeProgressByKey(storageKey, value) {
  localStorage.setItem(storageKey, JSON.stringify(value || {}));
}
```

**验证清单**:
- [ ] `languageMode=english` 时映射到 `englishProgress_kg` / `englishProgress_game`
- [ ] `languageMode=chinese` 时映射到 `chineseProgress_kg` / `chineseProgress_game`
- [ ] `languageMode` 缺失或非法时回退英文模式
- [ ] 进度读写不再硬编码旧键名

---

### Step 2: 在 `12-challenges.js` 改造进度记录（主键固定 `wordObj.en`）
**文件**: `src/modules/12-challenges.js`  
**操作**: 记录挑战结果时，按模式写入对应键；内部唯一主键始终使用 `wordObj.en`。

```javascript
function getWordId(wordObj) {
  return String((wordObj && (wordObj.en || wordObj.word)) || '').trim();
}

function recordWordProgress(wordObj, challengeType, payload) {
  const wordId = getWordId(wordObj);
  if (!wordId) return false;

  const keys = getChallengeProgressKeys();
  const targetKey = challengeType === 'kg' ? keys.kg : keys.game;
  const store = readProgressByKey(targetKey);

  store[wordId] = {
    ...(store[wordId] || {}),
    ...(payload || {}),
    updatedAt: Date.now()
  };

  writeProgressByKey(targetKey, store);
  return true;
}
```

**验证清单**:
- [ ] 无论中英文模式，`store` 的 key 都是英文主键（如 `smile`）
- [ ] 英文模式写入 `englishProgress_*`
- [ ] 汉字模式写入 `chineseProgress_*`
- [ ] 切换模式后新成绩不会污染另一模式键

---

### Step 3: 在 `12-challenges.js` 接入按模式朗读文本
**文件**: `src/modules/12-challenges.js`  
**操作**: 新增朗读内容选择器；英文模式读英文，汉字模式读中文。

```javascript
function getSpeakPayload(wordObj) {
  const mode = getLanguageModeSafe();
  if (mode === 'chinese') {
    return {
      text: String((wordObj && wordObj.chinese) || '').trim(),
      lang: 'zh-CN'
    };
  }
  return {
    text: String((wordObj && (wordObj.word || wordObj.en)) || '').trim(),
    lang: 'en-US'
  };
}

function speakChallengeWord(wordObj) {
  const payload = getSpeakPayload(wordObj);
  if (!payload.text) return;
  if (window.AudioModule && typeof window.AudioModule.speak === 'function') {
    window.AudioModule.speak(payload.text, payload.lang);
  }
}
```

**验证清单**:
- [ ] 英文模式调用 `speak(英文, 'en-US')`
- [ ] 汉字模式调用 `speak(中文, 'zh-CN')`
- [ ] 缺词条字段时不抛异常
- [ ] 挑战流程中朗读入口统一走 `speakChallengeWord`

---

### Step 4: 在 `12-challenges.js` 增加模式切换事务（停止→清空→重建→刷新）
**文件**: `src/modules/12-challenges.js`  
**操作**: 抽出事务函数并作为模式切换唯一入口。

```javascript
const challengeState = {
  isOpen: false,
  questionPool: [],
  currentQuestion: null
};

function stopTTSIfPlaying() {
  if (window.AudioModule && typeof window.AudioModule.stopSpeak === 'function') {
    window.AudioModule.stopSpeak();
  } else if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

function closeChallengeSession() {
  challengeState.isOpen = false;
  challengeState.currentQuestion = null;
}

function clearQuestionPool() {
  challengeState.questionPool = [];
}

function rebuildQuestionPool() {
  const list = (window.VocabModule && typeof window.VocabModule.getRuntimeWords === 'function')
    ? window.VocabModule.getRuntimeWords()
    : [];
  challengeState.questionPool = Array.isArray(list) ? list.slice() : [];
}

function refreshChallengeUI() {
  if (window.UIModule && typeof window.UIModule.renderChallengePanel === 'function') {
    window.UIModule.renderChallengePanel();
  }
}

function applyLanguageModeTransactional(nextMode) {
  const normalized = nextMode === 'chinese' ? 'chinese' : 'english';
  if (!window.gameSettings) window.gameSettings = {};
  window.gameSettings.languageMode = normalized;
  localStorage.setItem('languageMode', normalized);

  stopTTSIfPlaying();
  closeChallengeSession();
  clearQuestionPool();
  rebuildQuestionPool();
  refreshChallengeUI();
}
```

**验证清单**:
- [ ] 模式切换必执行 5 个阶段（停止→关闭→清空→重建→刷新）
- [ ] 切换时不会继续播放旧语音
- [ ] 切换后题池与 UI 均匹配新模式
- [ ] 中途重复切换不导致状态残留

---

### Step 5: 在 `03-audio.js` 实现 `speak(text, lang)` 与中文降级
**文件**: `src/modules/03-audio.js`  
**操作**: 扩展语音接口，支持 `en-US` 与 `zh-CN`，无中文语音时给出文本提示。

```javascript
function pickVoiceByLang(voices, lang) {
  const normalized = lang === 'zh-CN' ? 'zh' : 'en';
  const matched = voices.find((v) => String(v.lang || '').toLowerCase().startsWith(normalized));
  return matched || null;
}

function showTTSFallbackTip(text, lang) {
  const message = lang === 'zh-CN'
    ? `当前设备无中文语音，已改为文本提示：${text}`
    : `当前设备无可用语音：${text}`;
  if (window.UIModule && typeof window.UIModule.showToast === 'function') {
    window.UIModule.showToast(message);
  } else {
    alert(message);
  }
}

function speak(text, lang) {
  const content = String(text || '').trim();
  const targetLang = lang === 'zh-CN' ? 'zh-CN' : 'en-US';
  if (!content) return false;
  if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance !== 'function') {
    showTTSFallbackTip(content, targetLang);
    return false;
  }

  const voices = window.speechSynthesis.getVoices() || [];
  const voice = pickVoiceByLang(voices, targetLang);
  if (targetLang === 'zh-CN' && !voice) {
    showTTSFallbackTip(content, targetLang);
    return false;
  }

  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(content);
  utter.lang = targetLang;
  if (voice) utter.voice = voice;
  window.speechSynthesis.speak(utter);
  return true;
}

function stopSpeak() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

window.AudioModule = {
  ...(window.AudioModule || {}),
  speak,
  stopSpeak
};
```

**验证清单**:
- [ ] `speak('apple', 'en-US')` 可正常播放英文
- [ ] `speak('苹果', 'zh-CN')` 有中文 voice 时播放中文
- [ ] 无中文 voice 时显示文本提示，不崩溃
- [ ] 连续调用 `speak` 会先取消上一段语音

---

### Step 6: 在 `Game.html` 增加首启学习模式引导页
**文件**: `Game.html`  
**操作**: 增加首启引导弹层与初始化脚本，完成模式选择与提示文案展示。

```html
<!-- 首启学习模式引导 -->
<div id="language-onboarding-modal" class="modal" style="display:none;">
  <div class="modal-card">
    <h2>选择学习模式</h2>
    <p>进度将分别记录</p>
    <div class="modal-actions">
      <button type="button" data-mode="english">🇬🇧 英语学习</button>
      <button type="button" data-mode="chinese">🇨🇳 汉字学习</button>
    </div>
  </div>
</div>

<script>
  (function bootstrapLanguageOnboarding() {
    var mode = localStorage.getItem('languageMode');
    var hasMode = mode === 'english' || mode === 'chinese';
    if (hasMode) return;

    var modal = document.getElementById('language-onboarding-modal');
    if (!modal) return;
    modal.style.display = 'flex';

    var onSelect = function(nextMode) {
      var normalized = nextMode === 'chinese' ? 'chinese' : 'english';
      localStorage.setItem('languageMode', normalized);
      window.gameSettings = window.gameSettings || {};
      window.gameSettings.languageMode = normalized;
      modal.style.display = 'none';
    };

    var enBtn = modal.querySelector('[data-mode="english"]');
    var zhBtn = modal.querySelector('[data-mode="chinese"]');
    if (enBtn) enBtn.onclick = function() { onSelect('english'); };
    if (zhBtn) zhBtn.onclick = function() { onSelect('chinese'); };
  })();
</script>
```

**验证清单**:
- [ ] 首次启动（无 `languageMode`）必弹引导
- [ ] 按钮文案准确：`🇬🇧 英语学习` / `🇨🇳 汉字学习`
- [ ] 选择后写入 `localStorage.languageMode`
- [ ] 引导页显示“进度将分别记录”

---

### Step 7: 在 `Game.html` 增加设置切换确认提示并对接事务切换
**文件**: `Game.html`  
**操作**: 绑定设置页语言模式控件，切换时先确认，再调用挑战模块事务入口。

```html
<script>
  (function bindLanguageModeSwitchConfirm() {
    var select = document.getElementById('setting-language-mode');
    if (!select) return;

    var current = localStorage.getItem('languageMode');
    if (current === 'english' || current === 'chinese') {
      select.value = current;
    }

    select.addEventListener('change', function() {
      var nextMode = select.value === 'chinese' ? 'chinese' : 'english';
      var prevMode = (window.gameSettings && window.gameSettings.languageMode) || 'english';
      if (nextMode === prevMode) return;

      var ok = window.confirm('切换学习模式后，进度将分别记录。是否继续？');
      if (!ok) {
        select.value = prevMode;
        return;
      }

      if (window.ChallengeModule && typeof window.ChallengeModule.applyLanguageModeTransactional === 'function') {
        window.ChallengeModule.applyLanguageModeTransactional(nextMode);
      } else {
        localStorage.setItem('languageMode', nextMode);
        window.gameSettings = window.gameSettings || {};
        window.gameSettings.languageMode = nextMode;
      }
    });
  })();
</script>
```

**验证清单**:
- [ ] 切换时弹出确认文案：`切换学习模式后，进度将分别记录。是否继续？`
- [ ] 点击取消时 UI 值回滚为原模式
- [ ] 点击确认时调用挑战模块事务切换
- [ ] 切换后 `languageMode` 与 UI 状态一致

---

### Step 8: 联调与语法检查
**文件**: `src/modules/12-challenges.js`、`src/modules/03-audio.js`、`Game.html`  
**操作**: 执行语法检查并按“首启→挑战→切换模式”流程联调。

```bash
# 语法检查
node -c src/modules/12-challenges.js
node -c src/modules/03-audio.js

# 本地启动（按项目现有方式）
# 例如: npx serve .
```

**联调清单**:
- [ ] 首启引导选择后进入对应模式
- [ ] 英文模式挑战进度写入 `englishProgress_*`
- [ ] 汉字模式挑战进度写入 `chineseProgress_*`
- [ ] 模式切换执行事务 5 步且挑战 UI 正常刷新
- [ ] 英文/中文朗读按模式切换
- [ ] 中文 voice 不可用时出现文本提示

---

## 集成测试用例（跨模块）

### Case 1: 首启引导 + 模式落盘 + 挑战初始化
- 前置: `localStorage.removeItem('languageMode')`
- 操作: 打开页面，选择 `🇨🇳 汉字学习`
- 预期:
- [ ] `localStorage.languageMode === 'chinese'`
- [ ] 挑战题池按中文模式重建
- [ ] 首屏提示“进度将分别记录”

### Case 2: 英语模式挑战进度分离
- 前置: `languageMode='english'`，清空四个进度键
- 操作: 完成一次 KG 与 Game 挑战记录
- 预期:
- [ ] `englishProgress_kg` 与 `englishProgress_game` 有新增记录
- [ ] `chineseProgress_kg` 与 `chineseProgress_game` 保持空
- [ ] 记录主键为 `wordObj.en`

### Case 3: 汉字模式挑战进度分离
- 前置: `languageMode='chinese'`，保留英语进度数据
- 操作: 再完成一次 KG 与 Game 挑战记录
- 预期:
- [ ] 仅 `chineseProgress_kg` / `chineseProgress_game` 更新
- [ ] 既有 `englishProgress_*` 数据不被覆盖
- [ ] 新写入记录主键仍为英文键

### Case 4: 模式切换事务完整性
- 前置: 挑战页面打开中，TTS 正在播放
- 操作: 在设置里切换模式并确认
- 预期:
- [ ] 语音立刻停止
- [ ] 当前挑战关闭
- [ ] 旧题池清空并按新模式重建
- [ ] 挑战 UI 刷新且不残留旧题

### Case 5: TTS 语言切换
- 前置: 分别准备含 `word/chinese` 的同一词条
- 操作: 在两种模式下触发挑战朗读
- 预期:
- [ ] 英文模式调用 `speak(word, 'en-US')`
- [ ] 汉字模式调用 `speak(chinese, 'zh-CN')`
- [ ] 文本为空时不触发异常

### Case 6: 中文语音降级
- 前置: 浏览器环境无 `zh-CN` voice
- 操作: 汉字模式触发朗读
- 预期:
- [ ] 不报错、不卡死
- [ ] 显示中文降级提示文本
- [ ] 用户可继续作答挑战

### Case 7: 切换确认取消路径
- 前置: 当前 `languageMode='english'`
- 操作: 设置切到 `chinese`，在确认框点“取消”
- 预期:
- [ ] `languageMode` 保持 `english`
- [ ] 设置控件值回滚到 `english`
- [ ] 不触发挑战事务切换

## 验收标准
- [ ] 挑战进度已按 `languageMode` 完整分离到四个键：`englishProgress_kg`、`englishProgress_game`、`chineseProgress_kg`、`chineseProgress_game`
- [ ] 挑战系统内部主键始终使用 `wordObj.en`（不因显示模式改变）
- [ ] TTS 接口已支持 `speak(text, lang)`，并支持 `en-US` / `zh-CN`
- [ ] 无中文语音时有明确文本降级提示，流程不中断
- [ ] 模式切换严格按事务流程执行：停止→关闭→清空→重建→刷新
- [ ] 首启引导页可完成模式选择，并显示“进度将分别记录”
- [ ] 设置切换包含确认提示：`切换学习模式后，进度将分别记录。是否继续？`
- [ ] 三处改动文件通过语法检查与联调流程
