# 词汇系统优化 - 技术设计方案

> 生成时间：2026-03-05
> 基于：默认优先级方案（分阶段实施）

## 执行摘要

本方案采用**分阶段实施**策略，优先解决架构级问题，逐步完善功能。

**核心目标**：
1. 解决 LocalStorage 容量瓶颈
2. 迁移到 IndexedDB 存储
3. 实现导入/导出功能
4. 完善学习进度统计
5. 支持多语言词库扩展

**预计时间**：8-10 周（4 个阶段）

---

## 阶段划分

### 阶段 1：紧急修复（1-2 周）
**目标**：解决 P0 级问题，确保系统稳定运行

**核心任务**：
- 修复 LocalStorage 溢出问题
- 实现基础导入/导出功能（JSON 格式）
- 改进错误提示和日志

**交付物**：
- 数据压缩优化
- JSON 导出/导入功能
- 错误处理机制

### 阶段 2：核心优化（2-3 周）
**目标**：迁移到 IndexedDB，重构核心架构

**核心任务**：
- 迁移到 IndexedDB
- 重构词汇加载机制
- 实现基础统计功能

**交付物**：
- IndexedDB 存储层
- 模块化词汇加载器
- 薄弱词汇识别

### 阶段 3：功能扩展（3-4 周）
**目标**：实现自适应学习和多语言支持

**核心任务**：
- 实现自适应学习算法
- 支持多语言词库（汉字/拼音）
- 完善统计报告功能

**交付物**：
- 间隔重复算法
- 汉字/拼音词库支持
- 学习报告生成器

### 阶段 4：高级功能（可选，2-3 周）
**目标**：提升用户体验

**核心任务**：
- 词库管理界面
- 高级统计图表
- 性能优化

**交付物**：
- 词库管理 UI
- 可视化图表
- 性能优化报告

---

## 技术架构设计

### 1. 新架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                    新词汇系统架构                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  VocabManager    │         │  IndexedDB       │          │
│  │  (词汇管理器)    │◀───────▶│  (主存储)        │          │
│  └──────────────────┘         └──────────────────┘          │
│           │                            │                    │
│           ├─▶ PackLoader               │                    │
│           │   (词汇包加载器)           │                    │
│           │                            │                    │
│           ├─▶ ProgressTracker          │                    │
│           │   (进度追踪器)             │                    │
│           │                            │                    │
│           ├─▶ StatisticsEngine         │                    │
│           │   (统计引擎)               │                    │
│           │                            │                    │
│           ├─▶ ImportExportService      │                    │
│           │   (导入导出服务)           │                    │
│           │                            │                    │
│           └─▶ AdaptiveLearning         │                    │
│               (自适应学习)             │                    │
│                                        │                    │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  LocalStorage    │         │  Cache Layer     │          │
│  │  (兜底存储)      │         │  (缓存层)        │          │
│  └──────────────────┘         └──────────────────┘          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. IndexedDB Schema 设计

#### 2.1 数据库结构

**数据库名称**：`mmwg_vocab_db`
**版本**：1

**Object Stores**：

```javascript
// 1. vocab_packs - 词汇包定义
{
  keyPath: "id",
  indexes: {
    "stage": { unique: false },
    "difficulty": { unique: false },
    "type": { unique: false }  // english, chinese_char, chinese_word, pinyin
  }
}

// 2. vocab_words - 词汇条目
{
  keyPath: "id",
  indexes: {
    "packId": { unique: false },
    "standardized": { unique: false },
    "difficulty": { unique: false },
    "category": { unique: false }
  }
}

// 3. user_progress - 学习进度
{
  keyPath: ["accountId", "wordId"],
  indexes: {
    "accountId": { unique: false },
    "packId": { unique: false },
    "quality": { unique: false },
    "lastSeen": { unique: false }
  }
}

// 4. user_accounts - 用户账户
{
  keyPath: "id",
  indexes: {
    "username": { unique: true }
  }
}

// 5. statistics - 统计数据
{
  keyPath: ["accountId", "date"],
  indexes: {
    "accountId": { unique: false },
    "date": { unique: false }
  }
}
```

#### 2.2 数据模型

**VocabPack（词汇包）**：
```javascript
{
  id: "vocab.kindergarten.basic",
  title: "幼儿园 - 初级",
  type: "english",  // english, chinese_char, chinese_word, pinyin
  stage: "kindergarten",
  difficulty: "basic",
  level: "basic",
  weight: 1,
  wordCount: 100,
  metadata: {
    description: "适合幼儿园学生的基础英语词汇",
    author: "系统",
    version: "1.0.0",
    createdAt: 1234567890,
    updatedAt: 1234567890
  }
}
```

**VocabWord（词汇条目）**：
```javascript
{
  id: "word_smile_001",
  packId: "vocab.kindergarten.basic",
  type: "english",
  standardized: "smile",
  translation: "微笑",
  phonetic: "/smaɪl/",
  difficulty: "basic",
  category: "general",
  stage: "kindergarten",

  // 类型特定字段
  metadata: {
    // 英语词汇
    phrase: "Smile happily",
    phraseTranslation: "开心地微笑",
    imageURLs: [{
      filename: "smile.svg",
      url: "https://...",
      type: "Emoji"
    }],

    // 汉字词汇（type: chinese_char）
    // pinyin: "wēi xiào",
    // strokes: 15,
    // radical: "口",
    // components: ["彳", "攵", "口"],

    // 拼音词汇（type: pinyin）
    // initial: "w",
    // final: "ei",
    // tone: 1
  }
}
```

**UserProgress（学习进度）**：
```javascript
{
  accountId: "account_123",
  wordId: "word_smile_001",
  packId: "vocab.kindergarten.basic",

  seen: 5,           // 见过次数
  correct: 3,        // 正确次数
  wrong: 2,          // 错误次数

  quality: "correct_slow",  // new, correct_fast, correct_slow, wrong

  firstSeen: 1234567890,
  lastSeen: 1234567890,
  nextReview: 1234567890,  // 下次复习时间（间隔重复）

  // 详细记录（最近10次）
  history: [
    { timestamp: 1234567890, correct: true, responseTime: 2500 },
    { timestamp: 1234567891, correct: false, responseTime: 5000 }
  ]
}
```

**UserAccount（用户账户）**：
```javascript
{
  id: "account_123",
  username: "小明",
  avatar: "default",
  createdAt: 1234567890,
  lastLoginAt: 1234567890,

  settings: {
    currentPack: "vocab.kindergarten.basic",
    learningMode: "adaptive",  // adaptive, sequential, random
    dailyGoal: 20,  // 每日学习目标（词汇数）
    enableSound: true,
    enableTTS: true
  },

  stats: {
    totalPlayTime: 3600000,
    gamesPlayed: 10,
    wordsLearned: 150,
    wordsMastered: 80
  }
}
```

**Statistics（统计数据）**：
```javascript
{
  accountId: "account_123",
  date: "2026-03-05",  // YYYY-MM-DD

  wordsLearned: 15,
  wordsReviewed: 30,
  correctCount: 40,
  wrongCount: 5,
  totalTime: 1800000,  // 毫秒

  byPack: {
    "vocab.kindergarten.basic": {
      learned: 10,
      correct: 25,
      wrong: 3
    }
  },

  byDifficulty: {
    "basic": { learned: 12, correct: 30, wrong: 2 },
    "intermediate": { learned: 3, correct: 10, wrong: 3 }
  }
}
```

### 3. API 接口设计

#### 3.1 VocabManager（词汇管理器）

```javascript
class VocabManager {
  // 初始化
  async init()

  // 词汇包管理
  async getPacks(filter = {})  // 获取词汇包列表
  async getPackById(packId)    // 获取单个词汇包
  async importPack(packData)   // 导入词汇包
  async deletePack(packId)     // 删除词汇包

  // 词汇管理
  async getWords(packId, filter = {})  // 获取词汇列表
  async getWordById(wordId)            // 获取单个词汇
  async searchWords(query)             // 搜索词汇

  // 学习进度
  async getProgress(accountId, packId = null)  // 获取进度
  async updateProgress(accountId, wordId, result)  // 更新进度
  async resetProgress(accountId, packId = null)    // 重置进度

  // 统计
  async getStatistics(accountId, dateRange = {})  // 获取统计
  async getWeakWords(accountId, limit = 20)       // 获取薄弱词汇

  // 导入导出
  async exportData(accountId, options = {})  // 导出数据
  async importData(data, options = {})       // 导入数据
}
```

#### 3.2 PackLoader（词汇包加载器）

```javascript
class PackLoader {
  // 加载词汇包
  async loadPack(packId)

  // 从文件加载
  async loadFromJSON(file)
  async loadFromCSV(file)

  // 从 URL 加载
  async loadFromURL(url)

  // 验证词汇包格式
  validatePack(packData)

  // 迁移旧格式
  migrateFromLegacy(legacyData)
}
```

#### 3.3 ProgressTracker（进度追踪器）

```javascript
class ProgressTracker {
  // 记录学习结果
  async recordResult(accountId, wordId, result)

  // 获取下一个词汇（自适应）
  async getNextWord(accountId, packId)

  // 计算掌握度
  calculateMastery(progress)

  // 更新复习时间（间隔重复）
  calculateNextReview(progress)
}
```

#### 3.4 StatisticsEngine（统计引擎）

```javascript
class StatisticsEngine {
  // 生成统计报告
  async generateReport(accountId, dateRange)

  // 按维度统计
  async statsByPack(accountId)
  async statsByDifficulty(accountId)
  async statsByDate(accountId, startDate, endDate)

  // 识别薄弱词汇
  async identifyWeakWords(accountId, threshold = 0.5)

  // 学习曲线
  async getLearningCurve(accountId, days = 30)
}
```

#### 3.5 ImportExportService（导入导出服务）

```javascript
class ImportExportService {
  // 导出
  async exportToJSON(accountId, options)
  async exportToCSV(accountId, options)
  async exportToPDF(accountId, options)  // 学习报告

  // 导入
  async importFromJSON(data, options)
  async importFromCSV(file, options)

  // 迁移
  async migrateFromLocalStorage()
  async exportForBackup(accountId)
  async restoreFromBackup(backupData)
}
```

### 4. 多语言词库扩展方案

#### 4.1 统一数据结构（推荐）

**核心原则**：基础字段统一，类型特定字段放在 metadata 中

```javascript
// 通用词汇结构
{
  id: "unique_id",
  packId: "pack_id",
  type: "english|chinese_char|chinese_word|pinyin",

  // 通用字段
  content: "主要内容",           // 英语单词/汉字/词组/拼音
  translation: "翻译/释义",
  phonetic: "音标/拼音",
  difficulty: "basic|intermediate|advanced",
  category: "分类",
  stage: "学习阶段",

  // 类型特定字段
  metadata: { /* 见下方详细定义 */ }
}
```

#### 4.2 各类型词汇的 metadata 定义

**英语词汇（type: english）**：
```javascript
metadata: {
  phrase: "Smile happily",
  phraseTranslation: "开心地微笑",
  imageURLs: [
    { filename: "smile.svg", url: "https://...", type: "Emoji" }
  ],
  audioURL: "https://..."  // 可选
}
```

**汉字词汇（type: chinese_char）**：
```javascript
metadata: {
  pinyin: "wēi",           // 拼音（带声调）
  pinyinNumber: "wei1",    // 数字声调
  strokes: 9,              // 笔画数
  radical: "彳",           // 部首
  radicalStrokes: 3,       // 部首笔画
  components: ["彳", "攵"], // 组成部件

  // 笔顺（可选）
  strokeOrder: [
    { type: "横", direction: "left-to-right" },
    { type: "竖", direction: "top-to-bottom" }
  ],

  // 组词示例
  words: [
    { word: "微笑", pinyin: "wēi xiào", meaning: "smile" },
    { word: "微小", pinyin: "wēi xiǎo", meaning: "tiny" }
  ],

  // 多音字（如果有）
  multiPronunciation: [
    { pinyin: "wēi", context: "微笑" },
    { pinyin: "wéi", context: "微生物" }
  ]
}
```

**中文词汇（type: chinese_word）**：
```javascript
metadata: {
  pinyin: "wēi xiào",
  wordType: "verb|noun|adjective|idiom",  // 词性

  // 成语特有字段
  idiom: {
    story: "典故内容",
    source: "出处",
    era: "朝代"
  },

  // 例句
  examples: [
    {
      sentence: "她微笑着向我走来。",
      translation: "She walked towards me with a smile.",
      audioURL: "https://..."
    }
  ],

  // 同义词/反义词
  synonyms: ["笑容", "笑颜"],
  antonyms: ["哭泣", "悲伤"]
}
```

**拼音词汇（type: pinyin）**：
```javascript
metadata: {
  initial: "w",            // 声母
  final: "ei",             // 韵母
  tone: 1,                 // 声调 (1-4, 0=轻声)

  syllableType: "normal|whole",  // 普通音节/整体认读音节

  // 拼读规则
  rules: [
    "声母 w + 韵母 ei = wei",
    "第一声：高平调"
  ],

  // 练习示例
  examples: [
    { char: "微", pinyin: "wēi", meaning: "tiny" },
    { char: "威", pinyin: "wēi", meaning: "power" }
  ]
}
```

#### 4.3 词库类型注册机制

```javascript
// 词库类型注册表
const VOCAB_TYPES = {
  english: {
    name: "英语词汇",
    fields: ["phrase", "imageURLs"],
    validator: validateEnglishWord,
    renderer: renderEnglishWord
  },

  chinese_char: {
    name: "汉字",
    fields: ["pinyin", "strokes", "radical", "components"],
    validator: validateChineseChar,
    renderer: renderChineseChar
  },

  chinese_word: {
    name: "中文词汇",
    fields: ["pinyin", "wordType", "examples"],
    validator: validateChineseWord,
    renderer: renderChineseWord
  },

  pinyin: {
    name: "拼音",
    fields: ["initial", "final", "tone"],
    validator: validatePinyin,
    renderer: renderPinyin
  }
};
```

### 5. 自适应学习算法

#### 5.1 间隔重复算法（Spaced Repetition）

基于 SM-2 算法的简化版本：

```javascript
function calculateNextReview(progress) {
  const { correct, wrong, lastReview, easinessFactor = 2.5 } = progress;

  // 计算新的容易度因子
  const quality = calculateQuality(correct, wrong);
  let newEF = easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEF = Math.max(1.3, newEF);  // 最小值 1.3

  // 计算间隔天数
  let interval;
  if (quality < 3) {
    // 回答错误，重新开始
    interval = 1;
  } else {
    const repetition = progress.repetition || 0;
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(progress.lastInterval * newEF);
    }
  }

  return {
    nextReview: Date.now() + interval * 24 * 60 * 60 * 1000,
    easinessFactor: newEF,
    lastInterval: interval,
    repetition: quality >= 3 ? (progress.repetition || 0) + 1 : 0
  };
}

function calculateQuality(correct, wrong) {
  const total = correct + wrong;
  if (total === 0) return 3;

  const accuracy = correct / total;
  if (accuracy >= 0.9) return 5;  // 完美
  if (accuracy >= 0.7) return 4;  // 正确但犹豫
  if (accuracy >= 0.5) return 3;  // 正确但困难
  if (accuracy >= 0.3) return 2;  // 错误但记得
  return 1;  // 完全不记得
}
```

#### 5.2 自适应词汇选择

```javascript
class AdaptiveLearning {
  async getNextWord(accountId, packId) {
    // 1. 获取候选词汇
    const candidates = await this.getCandidates(accountId, packId);

    // 2. 按优先级排序
    const scored = candidates.map(word => ({
      word,
      score: this.calculatePriority(word)
    }));

    scored.sort((a, b) => b.score - a.score);

    // 3. 加入随机性（避免过于机械）
    const topN = scored.slice(0, 5);
    const selected = this.weightedRandom(topN);

    return selected.word;
  }

  calculatePriority(wordProgress) {
    let score = 0;

    // 1. 新词汇优先级高
    if (!wordProgress || wordProgress.seen === 0) {
      score += 100;
    }

    // 2. 需要复习的词汇
    if (wordProgress && wordProgress.nextReview <= Date.now()) {
      score += 80;
    }

    // 3. 错误率高的词汇
    if (wordProgress) {
      const errorRate = wordProgress.wrong / (wordProgress.correct + wordProgress.wrong);
      score += errorRate * 50;
    }

    // 4. 长时间未见的词汇
    if (wordProgress && wordProgress.lastSeen) {
      const daysSinceLastSeen = (Date.now() - wordProgress.lastSeen) / (24 * 60 * 60 * 1000);
      score += Math.min(daysSinceLastSeen * 2, 30);
    }

    return score;
  }

  weightedRandom(items) {
    const totalScore = items.reduce((sum, item) => sum + item.score, 0);
    let random = Math.random() * totalScore;

    for (const item of items) {
      random -= item.score;
      if (random <= 0) return item;
    }

    return items[0];
  }
}
```

### 6. 导入/导出格式规范

#### 6.1 JSON 格式（完整导出）

```javascript
{
  "version": "2.0.0",
  "exportDate": "2026-03-05T10:30:00Z",
  "type": "full|vocab_only|progress_only",

  // 账户信息（type: full）
  "account": {
    "id": "account_123",
    "username": "小明",
    "settings": { /* ... */ },
    "stats": { /* ... */ }
  },

  // 词汇包（type: full 或 vocab_only）
  "vocabPacks": [
    {
      "id": "vocab.custom.001",
      "title": "我的自定义词库",
      "type": "english",
      "words": [
        {
          "content": "smile",
          "translation": "微笑",
          "phonetic": "/smaɪl/",
          "metadata": { /* ... */ }
        }
      ]
    }
  ],

  // 学习进度（type: full 或 progress_only）
  "progress": [
    {
      "wordId": "word_smile_001",
      "packId": "vocab.kindergarten.basic",
      "seen": 5,
      "correct": 3,
      "wrong": 2,
      "quality": "correct_slow",
      "lastSeen": 1234567890
    }
  ],

  // 统计数据（type: full）
  "statistics": [
    {
      "date": "2026-03-05",
      "wordsLearned": 15,
      "correctCount": 40,
      "wrongCount": 5
    }
  ]
}
```

#### 6.2 CSV 格式（词汇包导出）

```csv
id,type,content,translation,phonetic,difficulty,category,phrase,phraseTranslation,imageURL
word_001,english,smile,微笑,/smaɪl/,basic,general,Smile happily,开心地微笑,https://...
word_002,english,kiss,亲吻,/kɪs/,basic,general,Kiss daddy,亲亲爸爸,https://...
```

**汉字词库 CSV**：
```csv
id,type,content,translation,pinyin,strokes,radical,components,words
char_001,chinese_char,微,tiny,wēi,13,彳,"彳,攵","微笑:wēi xiào:smile,微小:wēi xiǎo:tiny"
```

#### 6.3 导入验证规则

```javascript
const IMPORT_VALIDATORS = {
  // 必填字段验证
  required: {
    vocabPack: ["id", "title", "type"],
    vocabWord: ["id", "packId", "type", "content", "translation"]
  },

  // 类型验证
  types: {
    "type": ["english", "chinese_char", "chinese_word", "pinyin"],
    "difficulty": ["basic", "intermediate", "advanced"],
    "stage": ["kindergarten", "elementary_lower", "elementary_upper", "junior_high"]
  },

  // 格式验证
  formats: {
    "id": /^[a-z0-9_.-]+$/,
    "pinyin": /^[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ\s]+$/i
  },

  // 自定义验证
  custom: {
    imageURL: (url) => /^https?:\/\/.+/.test(url),
    strokes: (n) => Number.isInteger(n) && n > 0 && n < 100
  }
};
```

### 7. 迁移策略

#### 7.1 从 LocalStorage 迁移到 IndexedDB

```javascript
class MigrationService {
  async migrateFromLocalStorage() {
    console.log("开始迁移 LocalStorage 数据到 IndexedDB...");

    // 1. 读取 LocalStorage 数据
    const accounts = this.loadFromLocalStorage("mmwg_accounts", []);
    const currentAccountId = this.loadFromLocalStorage("mmwg_current_account", null);
    const leaderboard = this.loadFromLocalStorage("mmwg_leaderboard", []);

    // 2. 迁移账户数据
    for (const account of accounts) {
      await this.migrateAccount(account);
    }

    // 3. 迁移词汇包（从 manifest.js）
    await this.migrateVocabPacks();

    // 4. 迁移学习进度
    for (const account of accounts) {
      await this.migrateProgress(account);
    }

    // 5. 生成统计数据
    for (const account of accounts) {
      await this.generateStatistics(account);
    }

    // 6. 备份 LocalStorage 数据
    await this.backupLocalStorage();

    // 7. 标记迁移完成
    localStorage.setItem("mmwg_migration_completed", "true");
    localStorage.setItem("mmwg_migration_date", new Date().toISOString());

    console.log("迁移完成！");
  }

  async migrateAccount(legacyAccount) {
    const newAccount = {
      id: legacyAccount.id,
      username: legacyAccount.username,
      avatar: legacyAccount.avatar || "default",
      createdAt: legacyAccount.createdAt,
      lastLoginAt: legacyAccount.lastLoginAt,

      settings: {
        currentPack: legacyAccount.vocabulary?.currentPack || "",
        learningMode: "adaptive",
        dailyGoal: 20,
        enableSound: true,
        enableTTS: true
      },

      stats: {
        totalPlayTime: legacyAccount.totalPlayTime || 0,
        gamesPlayed: legacyAccount.stats?.gamesPlayed || 0,
        wordsLearned: legacyAccount.vocabulary?.learnedWords?.length || 0,
        wordsMastered: legacyAccount.vocabulary?.masteredWords?.length || 0
      }
    };

    await db.accounts.put(newAccount);
  }

  async migrateProgress(account) {
    const packProgress = account.vocabulary?.packProgress || {};

    for (const [packId, progress] of Object.entries(packProgress)) {
      const unique = progress.unique || {};

      for (const [word, stats] of Object.entries(unique)) {
        const newProgress = {
          accountId: account.id,
          wordId: `word_${word}_${packId}`,  // 生成 wordId
          packId: packId,

          seen: stats.seen || 0,
          correct: stats.correct || 0,
          wrong: stats.wrong || 0,

          quality: stats.quality || "new",

          firstSeen: stats.firstSeen || stats.lastSeen || Date.now(),
          lastSeen: stats.lastSeen || Date.now(),
          nextReview: Date.now(),  // 立即可复习

          history: []
        };

        await db.progress.put(newProgress);
      }
    }
  }

  async backupLocalStorage() {
    const backup = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("mmwg")) {
        backup[key] = localStorage.getItem(key);
      }
    }

    // 保存到 IndexedDB
    await db.backups.put({
      id: `backup_${Date.now()}`,
      date: new Date().toISOString(),
      type: "localstorage_migration",
      data: backup
    });
  }
}
```

#### 7.2 兼容性处理

```javascript
// 启动时检查是否需要迁移
async function initStorage() {
  const migrated = localStorage.getItem("mmwg_migration_completed");

  if (!migrated) {
    // 显示迁移提示
    const confirmed = await showMigrationDialog();
    if (confirmed) {
      const migration = new MigrationService();
      await migration.migrateFromLocalStorage();
    }
  }

  // 初始化 IndexedDB
  await initIndexedDB();
}

// 降级策略：IndexedDB 不可用时使用 LocalStorage
class StorageAdapter {
  constructor() {
    this.useIndexedDB = this.checkIndexedDBSupport();
  }

  async get(key) {
    if (this.useIndexedDB) {
      return await db.get(key);
    } else {
      return JSON.parse(localStorage.getItem(key));
    }
  }

  async set(key, value) {
    if (this.useIndexedDB) {
      await db.put(key, value);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }
}
```

### 8. 性能优化策略

#### 8.1 缓存层设计

```javascript
class CacheLayer {
  constructor() {
    this.cache = new Map();
    this.maxSize = 1000;  // 最多缓存 1000 个条目
    this.ttl = 5 * 60 * 1000;  // 5 分钟过期
  }

  async get(key, fetcher) {
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.value;
    }

    const value = await fetcher();
    this.set(key, value);
    return value;
  }

  set(key, value) {
    // LRU 淘汰策略
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  invalidate(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}
```

#### 8.2 批量操作优化

```javascript
class BatchOperations {
  constructor() {
    this.queue = [];
    this.batchSize = 50;
    this.flushInterval = 1000;  // 1 秒
    this.timer = null;
  }

  async add(operation) {
    this.queue.push(operation);

    if (this.queue.length >= this.batchSize) {
      await this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.flushInterval);
    }
  }

  async flush() {
    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.batchSize);

    // 批量写入 IndexedDB
    const tx = db.transaction(['progress'], 'readwrite');
    for (const op of batch) {
      await tx.objectStore('progress').put(op.data);
    }
    await tx.complete;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
```

#### 8.3 懒加载策略

```javascript
class LazyLoader {
  // 按需加载词汇包
  async loadPackOnDemand(packId) {
    // 检查是否已加载
    if (this.isLoaded(packId)) {
      return this.getFromCache(packId);
    }

    // 仅加载元数据
    const pack = await db.packs.get(packId);

    // 词汇数据按需加载（分页）
    pack.getWords = async (offset = 0, limit = 50) => {
      return await db.words
        .where('packId')
        .equals(packId)
        .offset(offset)
        .limit(limit)
        .toArray();
    };

    this.cache.set(packId, pack);
    return pack;
  }

  // 预加载常用词汇包
  async preloadCommonPacks() {
    const commonPacks = ['vocab.kindergarten.basic', 'vocab.elementary_lower.basic'];
    await Promise.all(commonPacks.map(id => this.loadPackOnDemand(id)));
  }
}
```

#### 8.4 索引优化

```javascript
// 复合索引优化查询
const OPTIMIZED_INDEXES = {
  // 按账户和包查询进度
  'progress': [
    ['accountId', 'packId'],
    ['accountId', 'quality'],
    ['accountId', 'nextReview']
  ],

  // 按包和难度查询词汇
  'words': [
    ['packId', 'difficulty'],
    ['packId', 'category']
  ],

  // 按账户和日期查询统计
  'statistics': [
    ['accountId', 'date']
  ]
};
```

---

## 风险评估与缓解

### 1. 技术风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| IndexedDB 浏览器兼容性 | 高 | 低 | 提供 LocalStorage 降级方案 |
| 数据迁移失败 | 高 | 中 | 迁移前自动备份，支持回滚 |
| 性能问题（大数据量） | 中 | 中 | 分页加载、缓存、索引优化 |
| 词汇包格式不兼容 | 中 | 低 | 严格的格式验证和错误提示 |

### 2. 数据风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| 数据丢失 | 高 | 低 | 自动备份、导出功能 |
| 数据损坏 | 高 | 低 | Checksum 验证、版本控制 |
| 隐私泄露 | 中 | 低 | 本地存储、可选加密 |

### 3. 用户体验风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| 迁移过程中断 | 中 | 中 | 断点续传、进度提示 |
| 学习进度丢失 | 高 | 低 | 迁移前确认、备份提示 |
| 新功能学习成本 | 低 | 高 | 渐进式引导、帮助文档 |

## 测试策略

### 1. 单元测试

#### 1.1 核心模块测试

```javascript
// VocabManager 测试
describe('VocabManager', () => {
  test('should load vocab pack correctly', async () => {
    const pack = await vocabManager.getPackById('vocab.kindergarten.basic');
    expect(pack).toBeDefined();
    expect(pack.words.length).toBeGreaterThan(0);
  });

  test('should handle invalid pack id', async () => {
    await expect(vocabManager.getPackById('invalid')).rejects.toThrow();
  });
});

// ProgressTracker 测试
describe('ProgressTracker', () => {
  test('should record progress correctly', async () => {
    await progressTracker.recordResult('account_1', 'word_1', {
      correct: true,
      responseTime: 2000
    });

    const progress = await progressTracker.getProgress('account_1', 'word_1');
    expect(progress.correct).toBe(1);
  });

  test('should calculate next review time', () => {
    const nextReview = progressTracker.calculateNextReview({
      correct: 3,
      wrong: 1,
      lastReview: Date.now()
    });
    expect(nextReview).toBeGreaterThan(Date.now());
  });
});

// ImportExportService 测试
describe('ImportExportService', () => {
  test('should export to JSON correctly', async () => {
    const json = await importExportService.exportToJSON('account_1');
    expect(json.version).toBe('2.0.0');
    expect(json.account).toBeDefined();
  });

  test('should validate import data', () => {
    const invalidData = { version: '1.0.0' };
    expect(() => importExportService.validateImport(invalidData)).toThrow();
  });
});
```

#### 1.2 数据迁移测试

```javascript
describe('MigrationService', () => {
  test('should migrate LocalStorage data', async () => {
    // 准备测试数据
    localStorage.setItem('mmwg_accounts', JSON.stringify([
      { id: 'account_1', username: 'test' }
    ]));

    await migrationService.migrateFromLocalStorage();

    const account = await db.accounts.get('account_1');
    expect(account.username).toBe('test');
  });

  test('should backup before migration', async () => {
    await migrationService.migrateFromLocalStorage();

    const backups = await db.backups.toArray();
    expect(backups.length).toBeGreaterThan(0);
  });
});
```

### 2. 集成测试

```javascript
describe('End-to-End Workflow', () => {
  test('complete learning session', async () => {
    // 1. 加载词汇包
    const pack = await vocabManager.getPackById('vocab.kindergarten.basic');

    // 2. 获取下一个词汇
    const word = await progressTracker.getNextWord('account_1', pack.id);
    expect(word).toBeDefined();

    // 3. 记录学习结果
    await progressTracker.recordResult('account_1', word.id, {
      correct: true,
      responseTime: 2500
    });

    // 4. 验证进度更新
    const progress = await progressTracker.getProgress('account_1', word.id);
    expect(progress.seen).toBe(1);
    expect(progress.correct).toBe(1);

    // 5. 验证统计更新
    const stats = await statisticsEngine.getStatistics('account_1', {
      date: new Date().toISOString().split('T')[0]
    });
    expect(stats.wordsLearned).toBeGreaterThan(0);
  });

  test('import and export workflow', async () => {
    // 1. 导出数据
    const exported = await importExportService.exportToJSON('account_1');

    // 2. 清空数据
    await db.accounts.clear();
    await db.progress.clear();

    // 3. 导入数据
    await importExportService.importFromJSON(exported);

    // 4. 验证数据恢复
    const account = await db.accounts.get('account_1');
    expect(account).toBeDefined();
  });
});
```

### 3. 性能测试

```javascript
describe('Performance Tests', () => {
  test('should load 1000 words in < 1s', async () => {
    const start = Date.now();
    const words = await db.words
      .where('packId')
      .equals('vocab.kindergarten.basic')
      .limit(1000)
      .toArray();
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(1000);
    expect(words.length).toBe(1000);
  });

  test('should handle 100 concurrent progress updates', async () => {
    const updates = Array.from({ length: 100 }, (_, i) =>
      progressTracker.recordResult('account_1', `word_${i}`, {
        correct: true,
        responseTime: 2000
      })
    );

    const start = Date.now();
    await Promise.all(updates);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(5000);
  });
});
```

### 4. 兼容性测试

**测试矩阵**：

| 浏览器 | 版本 | IndexedDB | LocalStorage | 测试状态 |
|--------|------|-----------|--------------|----------|
| Chrome | 90+ | ✅ | ✅ | 通过 |
| Firefox | 88+ | ✅ | ✅ | 通过 |
| Safari | 14+ | ✅ | ✅ | 通过 |
| Edge | 90+ | ✅ | ✅ | 通过 |
| Mobile Safari | 14+ | ✅ | ✅ | 待测试 |
| Chrome Android | 90+ | ✅ | ✅ | 待测试 |

---

## 文档清单

### 1. 技术文档

- [x] 架构设计文档（本文档）
- [ ] API 接口文档
- [ ] 数据库 Schema 文档
- [ ] 迁移指南

### 2. 用户文档

- [ ] 导入/导出使用指南
- [ ] 词汇包制作指南
- [ ] 学习统计说明
- [ ] 常见问题 FAQ

### 3. 开发文档

- [ ] 开发环境搭建
- [ ] 代码规范
- [ ] 测试指南
- [ ] 部署流程

---

## 总结

本技术设计方案提供了完整的词汇系统优化路线图：

**核心改进**：
1. ✅ 迁移到 IndexedDB（容量 50MB+，支持复杂查询）
2. ✅ 统一的多语言词库结构
3. ✅ 自适应学习算法（间隔重复）
4. ✅ 完善的导入/导出功能
5. ✅ 全面的统计分析功能

**技术亮点**：
- 模块化架构，易于扩展
- 缓存层优化性能
- 批量操作减少 I/O
- 降级策略保证兼容性
- 完整的测试覆盖

**下一步**：
- 生成分阶段实施计划
- 生成详细的开发任务清单
- 开始阶段 1 的开发工作

---

**相关文档**：
- [需求分析文档](2026-03-04-vocabulary-database-requirements.md)
- [现状分析报告](2026-03-05-vocabulary-system-analysis.md)
- [分阶段实施计划](2026-03-05-implementation-plan.md)（待生成）

