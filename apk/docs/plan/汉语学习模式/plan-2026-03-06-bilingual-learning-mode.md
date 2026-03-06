# 双语学习模式（英语+汉字）实施计划

> 生成日期：2026-03-06
> 状态：草稿
> 需求文档：[plan-2026-03-06-bilingual-learning-mode-requirements.md](plan-2026-03-06-bilingual-learning-mode-requirements.md)

## 流程进度
- [x] Phase 0：扫描路由判断（结论：不需要大型代码库扫描）
- [ ] Phase 1：Plan 文档生成，用户确认内容
- [ ] Phase 2：Codex 工程审查完成，用户确认采纳意见
- [ ] Phase 3：交叉 Review 收敛，用户确认定稿
- [ ] Phase 4：各 worktree 独立 steps 文档生成，用户确认
- [ ] Phase 4.5：解耦审查通过，用户确认
- [ ] Phase 6：用户说"开始开发"，进入执行阶段

---

## Phase 0 结论：不需要大型代码库扫描

### 判断依据
- ✅ 源码文件数：32 个（未超过 20 的阈值，但接近）
- ✅ 涉及模块数：6-8 个（未达到"3个及以上"的严格标准，但需要跨模块）
- ❌ 无多份参考文档需求
- ❌ 非重构/迁移/整合类任务

### 结论
执行**轻量扫描**即可，无需调用 `largebase-structured-scan` skill。

---

## 需求理解

### 核心目标
在当前游戏版本中增加"汉字学习模式"，使游戏支持双语学习：
- **英语学习模式**（现有）：学习英文单词、短语
- **汉字学习模式**（新增）：学习汉字、拼音、词组

### 用户场景
- 幼儿园小朋友需要同时学习英语和汉字
- 家长/老师希望一个 App 解决所有学习需求
- 用户可以在两种模式间切换

### 边界条件
- ✅ 兼容现有英语学习功能（不破坏现有用户体验）
- ✅ 进度分别记录（英语和汉字独立统计）
- ✅ 游戏进度共享（关卡、金币、道具等）
- ❌ 不包含笔顺动画（后期扩展）
- ❌ 不包含手写识别（后期扩展）

---

## 技术方案

### 方案选择

#### 方案 A：双模式架构（选定 ✅）
**设计思路**：
- 增加全局配置 `learningMode: 'english' | 'chinese'`
- 词汇系统根据模式自动适配显示内容
- UI 组件根据模式调整主次文字
- TTS 根据模式选择朗读语言

**优势**：
- 架构清晰，易于扩展
- 现有代码改动最小
- 用户体验流畅（一键切换）

**劣势**：
- 需要修改多个模块
- 需要仔细处理模式切换时的状态同步

#### 方案 B：独立双系统（不采用 ❌）
**设计思路**：
- 完全独立的两套词汇系统
- 两套独立的 UI 组件
- 两套独立的进度记录

**优势**：
- 互不影响，隔离性好

**劣势**：
- 代码重复，维护成本高
- 用户体验割裂
- 违反 DRY 原则

---

### 选定方案详述

#### 架构设计

```
┌─────────────────────────────────────────┐
│         全局配置 (01-config.js)          │
│  learningMode: 'english' | 'chinese'    │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│  词汇系统      │   │  UI 系统       │
│  (09-vocab)   │   │  (10-ui)      │
│               │   │               │
│ • 加载词库     │   │ • 单词卡片     │
│ • 模式适配     │   │ • 拼音显示     │
│ • 数据转换     │   │ • 字体大小     │
└───────┬───────┘   └───────┬───────┘
        │                   │
        └─────────┬─────────┘
                  ▼
        ┌─────────────────┐
        │  挑战系统        │
        │  (12-challenges) │
        │                 │
        │ • 进度记录       │
        │ • 模式分离       │
        └─────────────────┘
                  │
                  ▼
        ┌─────────────────┐
        │  存档系统        │
        │  (storage.js)   │
        │                 │
        │ • 英语进度       │
        │ • 汉字进度       │
        │ • 共享数据       │
        └─────────────────┘
```

#### 关键设计决策

**1. 词库数据结构扩展**

现有结构：
```javascript
{
  word: "smile",
  chinese: "微笑",
  phonetic: "/smaɪl/",
  phrase: "Smile happily",
  phraseTranslation: "开心地微笑"
}
```

扩展后（兼容两种模式）：
```javascript
{
  // 英语模式：word 为主，chinese 为辅
  // 汉字模式：chinese 为主，word 为辅
  word: "smile",
  chinese: "微笑",
  pinyin: "wēi xiào",  // 新增：拼音
  phonetic: "/smaɪl/",
  phrase: "Smile happily",
  phraseTranslation: "开心地微笑",

  // 元数据
  difficulty: "basic",
  stage: "kindergarten",
  mode: "bilingual"  // 新增：标识此条目支持双模式
}
```

**2. 模式切换逻辑**

```javascript
// 全局配置
window.gameSettings = {
  learningMode: 'english',  // 'english' | 'chinese'
  showPinyin: true,         // 汉字模式下是否显示拼音
  // ... 其他设置
}

// 获取显示内容的适配函数
function getDisplayContent(wordObj) {
  const mode = window.gameSettings.learningMode;

  if (mode === 'english') {
    return {
      primary: wordObj.word,        // 英文
      secondary: wordObj.chinese,   // 中文
      phonetic: wordObj.phonetic,   // 音标
      phrase: wordObj.phrase,
      phraseTranslation: wordObj.phraseTranslation
    };
  } else {
    return {
      primary: wordObj.chinese,     // 汉字
      secondary: wordObj.word,      // 英文
      phonetic: wordObj.pinyin,     // 拼音
      phrase: wordObj.phraseTranslation,
      phraseTranslation: wordObj.phrase
    };
  }
}
```

**3. 进度记录分离**

```javascript
// 存档结构扩展
{
  // 共享数据
  gameProgress: {
    level: 5,
    coins: 1000,
    items: {...}
  },

  // 英语学习进度
  englishProgress: {
    vocabPacks: {
      'vocab.kindergarten': {
        uniqueCount: 50,
        total: 100,
        unique: { 'smile': {...}, ... }
      }
    }
  },

  // 汉字学习进度（新增）
  chineseProgress: {
    vocabPacks: {
      'vocab.kindergarten': {
        uniqueCount: 30,
        total: 100,
        unique: { '微笑': {...}, ... }
      }
    }
  }
}
```

---

### 涉及文件

| 文件 | 操作 | 说明 | 预估行数 |
|------|------|------|---------|
| `tools/add-pinyin.js` | 新建 | 拼音批量生成工具（Codex 实现） | +150 |
| `words/vocabs/06_汉字/幼儿园汉字.js` | 新建 | 汉字专用词库示例（Codex 生成） | +200 |
| `src/modules/01-config.js` | 修改 | 添加 `learningMode` 和 `showPinyin` 配置项 | +30 |
| `src/modules/09-vocab.js` | 修改 | 词汇加载适配、模式转换逻辑 | +80 |
| `src/modules/10-ui.js` | 修改 | 单词卡片显示适配、拼音显示、设置开关 | +120 |
| `src/modules/12-challenges.js` | 修改 | 进度记录分离、模式识别 | +60 |
| `src/modules/03-audio.js` | 修改 | TTS 语言选择逻辑 | +30 |
| `src/storage.js` | 修改 | 存档结构扩展、进度分离 | +50 |
| `Game.html` | 修改 | 启动弹窗添加模式切换按钮 + 提示 | +50 |
| `words/vocabs/manifest.js` | 修改 | 词库元数据添加 `mode` 字段 | +10 |
| **总计** | | | **~780 行** |

---

## Worktree 并行计划

### 任务解耦分析

根据文件改动矩阵，可以拆分为 4 个独立任务：

| Worktree | 分支 | 任务 | 涉及文件 | 依赖 | Steps 文档 |
|----------|------|------|---------|------|-----------|
| task-0-tools | feat/bilingual-tools | 拼音生成工具 + 汉字词库 | tools/add-pinyin.js, words/vocabs/06_汉字/ | 无 | docs/development/2026-03-06-bilingual-task-0-steps.md |
| task-1-config | feat/bilingual-config | 配置与数据结构 | 01-config.js, storage.js, manifest.js | task-0 完成 | docs/development/2026-03-06-bilingual-task-1-steps.md |
| task-2-vocab-ui | feat/bilingual-vocab-ui | 词汇与UI适配 | 09-vocab.js, 10-ui.js | task-1 配置定义 | docs/development/2026-03-06-bilingual-task-2-steps.md |
| task-3-integration | feat/bilingual-integration | 挑战系统与集成 | 12-challenges.js, 03-audio.js, Game.html | task-1, task-2 | docs/development/2026-03-06-bilingual-task-3-steps.md |

### 文件改动矩阵

```
                      task-0  task-1  task-2  task-3
tools/add-pinyin.js     ✓       -       -       -
06_汉字/幼儿园汉字.js    ✓       -       -       -
01-config.js            -       ✓       -       -
storage.js              -       ✓       -       -
manifest.js             -       ✓       -       -
09-vocab.js             -       -       ✓       -
10-ui.js                -       -       ✓       -
12-challenges.js        -       -       -       ✓
03-audio.js             -       -       -       ✓
Game.html               -       -       -       ✓
```

**结论**：4 个任务文件无交集，但存在逻辑依赖：
- task-0：独立任务（工具 + 数据准备）
- task-1：依赖 task-0 完成（需要拼音数据和汉字词库）
- task-2：依赖 task-1 的配置定义
- task-3：依赖 task-1 和 task-2 的接口

**建议执行顺序**：
1. task-0（工具 + 词库）→ 先完成
2. task-1（配置与数据结构）→ 第二
3. task-2 和 task-3 可以在 task-1 完成后并行

---

## 风险点

| 风险 | 概率 | 影响 | 缓解方案 |
|------|------|------|----------|
| 现有用户存档兼容性 | 中 | 高 | 添加存档迁移逻辑，自动补充缺失字段 |
| 拼音数据缺失 | 高 | 中 | 现有词库的 `chinese` 字段需要补充 `pinyin`，可以用工具批量生成 |
| UI 空间不足（汉字+拼音） | 中 | 中 | 调整单词卡片高度，使用响应式布局 |
| TTS 中文发音质量 | 低 | 中 | 使用浏览器原生 TTS，质量取决于系统 |
| 模式切换时状态混乱 | 中 | 中 | 切换时清空当前单词队列，重新加载 |
| 性能影响（词库数据量增加） | 低 | 低 | 现有架构已支持大词库，影响可忽略 |

---

## 待确认问题（已确认 ✅）

- [x] 拼音数据如何生成？→ **使用 Codex 编写工具批量生成**
- [x] 汉字专用词库是否在 Phase 1 实现？→ **是，使用 Codex 生成示例词库**
- [x] 是否需要在设置页面添加"拼音显示/隐藏"开关？→ **是，现在就加**
- [x] 模式切换时是否需要提示用户"进度将分别记录"？→ **是，弹窗提示**

---

## 验收标准

### 功能验收
- [ ] 用户可以在设置中切换学习模式（英语/汉字）
- [ ] 启动弹窗中有快速切换按钮
- [ ] 英语模式：显示英文单词（大）+ 中文翻译（小）
- [ ] 汉字模式：显示汉字（大）+ 拼音（上方）+ 英文（小）
- [ ] 汉字模式下，TTS 朗读中文
- [ ] 英语和汉字的学习进度分别记录
- [ ] 游戏进度（关卡、金币）在两种模式下共享
- [ ] 现有用户存档正常加载，无数据丢失

### 技术验收
- [ ] 所有改动文件通过语法检查（`node -c`）
- [ ] 完整测试套件通过
- [ ] 无 console 错误
- [ ] 代码符合现有风格
- [ ] 添加必要的注释

### 性能验收
- [ ] 模式切换响应时间 < 500ms
- [ ] 单词卡片显示无闪烁
- [ ] 内存占用无明显增加

---

## 已知权衡（CC vs Codex 分歧）

| 分歧点 | CC 观点 | Codex 观点 | 决策 | 理由 |
|--------|---------|------------|------|------|
| （待 Phase 2 审查后填写） | - | - | - | - |

---

## 下一步行动

1. **用户确认**：请确认上述计划是否符合预期
2. **Phase 2**：调用 Codex 进行工程审查
3. **Phase 3**：交叉 Review（CC ↔ Codex）
4. **Phase 4**：生成各 worktree 的详细开发步骤
5. **Phase 6**：用户说"开始开发"后，创建 worktree 并实施

---

## 附录：现有代码分析

### 词汇系统（09-vocab.js）
- 当前加载逻辑：从 manifest.js 读取词库列表
- 单词对象结构：`{ en, zh, phrase, phraseZh, ... }`
- 需要扩展：添加模式适配层

### UI 系统（10-ui.js）
- 单词卡片：`#word-card-en`, `#word-card-zh`, `#word-card-phrase`
- 需要扩展：添加拼音显示元素、调整布局

### 挑战系统（12-challenges.js）
- 进度记录：`recordWordProgress(wordObj)`
- 使用 `wordObj.en` 作为唯一标识
- 需要扩展：根据模式选择标识字段（`en` 或 `zh`）

### 存档系统（storage.js）
- 当前结构：单一进度对象
- 需要扩展：分离英语和汉字进度

---

**状态**：等待用户确认 Phase 1 计划
