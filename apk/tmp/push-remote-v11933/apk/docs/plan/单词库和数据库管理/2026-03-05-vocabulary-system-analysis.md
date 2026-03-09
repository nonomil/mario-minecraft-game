# 词汇系统架构深度分析报告

> 生成时间：2026-03-05
> 分析范围：词汇加载、数据存储、统计功能、问题识别

## 执行摘要

当前词汇系统是一个**功能完整但架构混乱**的系统。主要问题包括：
- 双重存储系统（LocalStorage + SQLite）未充分利用
- 全局变量污染，脚本加载顺序敏感
- LocalStorage 容量瓶颈（5-10MB 限制）
- 统计功能不完整，缺少自适应学习
- 缺少导入/导出、多语言支持等关键功能

---

## 1. 当前架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                    词汇系统架构                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  manifest.js     │         │  words/vocabs/   │          │
│  │  (词汇包清单)    │────────▶│  (词汇文件)      │          │
│  └──────────────────┘         └──────────────────┘          │
│           │                            │                    │
│           │                            ▼                    │
│           │                   ┌──────────────────┐          │
│           │                   │  09-vocab.js     │          │
│           │                   │  (词汇加载引擎)  │          │
│           │                   └──────────────────┘          │
│           │                            │                    │
│           ▼                            ▼                    │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  storage.js      │         │  wordDatabase    │          │
│  │  (LocalStorage)  │◀────────│  (内存词库)      │          │
│  └──────────────────┘         └──────────────────┘          │
│           │                            │                    │
│           │                            ▼                    │
│           │                   ┌──────────────────┐          │
│           │                   │  wordPicker      │          │
│           │                   │  (词汇选择器)    │          │
│           │                   └──────────────────┘          │
│           │                            │                    │
│           ▼                            ▼                    │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  progress.vocab  │         │  12-challenges   │          │
│  │  (学习进度)      │         │  (挑战系统)      │          │
│  └──────────────────┘         └──────────────────┘          │
│                                        │                    │
│                                        ▼                    │
│                               ┌──────────────────┐          │
│                               │  08-account.js   │          │
│                               │  (账户统计)      │          │
│                               └──────────────────┘          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 词汇加载机制详解

### 2.1 词汇包结构（manifest.js）

**包定义方式**：
```javascript
{
  id: "vocab.kindergarten.basic",
  title: "幼儿园 - 初级",
  stage: "kindergarten",
  difficulty: "basic",
  level: "basic|intermediate|advanced|full",
  weight: 1,
  files: ["path/to/vocab/file.js"],
  getRaw() { /* 返回词汇数组 */ }
}
```

**当前词汇包数量**：20+ 个预定义词汇包
- 幼儿园：4个包（初级/中级/高级/完整）
- 小学低年级：4个包
- 小学高年级：4个包
- 初中：4个包
- 我的世界主题：4个包
- 补充包：2个

### 2.2 词汇文件组织

**文件位置**：`words/vocabs/` 目录

**幼儿园词汇**（总计 1.7MB）：
- 6个主题分类文件（基础、学习、自然、沟通、日常、通用）
- 10个分卷文件（按难度递进）
- 2个完整词库文件
- 1个补充文件（外部来源）

**词汇数据库**：
- SQLite：`words/db/vocab.db`（7.8MB，6,544 条词汇）
- CSV 导出：`words/db/csv/entries.csv`

**词汇数据格式**：
```javascript
{
  word: "smile",
  standardized: "smile",
  chinese: "微笑",
  phonetic: "/smaɪl/",
  phrase: "Smile happily",
  phraseTranslation: "开心地微笑",
  difficulty: "basic",
  category: "general",
  stage: "kindergarten",
  imageURLs: [
    {
      filename: "smile.svg",
      url: "https://twemoji.maxcdn.com/v/latest/svg/1f60a.svg",
      type: "Emoji"
    }
  ]
}
```

### 2.3 词汇加载流程

```javascript
// 1. 初始化词汇引擎
ensureVocabEngine()
  ├─ 读取 vocabManifest（全局变量）
  ├─ 构建 vocabPacks 索引
  └─ 返回 vocabEngine { version, packIds }

// 2. 选择词汇包
setActiveVocabPack(selection)
  ├─ 自动选择：pickPackAuto()（基于权重和完成度）
  ├─ 加载文件：loadVocabPackFiles(pack.files)
  ├─ 获取原始数据：pack.getRaw()
  ├─ 规范化词汇：normalizeRawWord()
  ├─ 构建选择器：buildWordPicker()
  └─ 保存状态：saveVocabState()

// 3. 游戏循环中使用
wordPicker.pickWord()  // 获取下一个词汇
  ├─ 考虑学习质量（new/correct_fast/correct_slow/wrong）
  ├─ 应用重复窗口（wordRepeatWindow: 6）
  ├─ 应用重复偏差（reinforce_wrong/balanced）
  └─ 返回词汇对象
```

**关键代码位置**：
- 词汇包定义：[words/vocabs/manifest.js](../../words/vocabs/manifest.js) (1-500+行)
- 词汇加载引擎：[src/modules/09-vocab.js](../../src/modules/09-vocab.js) (198-579行)

---

## 3. 数据存储机制

### 3.1 LocalStorage Schema

```javascript
ACCOUNT_SCHEMA = {
  vocabulary: {
    learnedWords: [],           // 已学词汇列表
    masteredWords: [],          // 掌握词汇列表
    wordStats: {},              // 词汇统计（已弃用）
    completedPacks: [],         // 已完成词汇包
    currentPack: "",            // 当前词汇包ID
    packProgress: {}            // 各包进度
  }
}
```

### 3.2 进度存储结构

```javascript
progress = {
  vocab: {
    [packId]: {
      unique: {
        [word]: {
          seen: number,         // 见过次数
          correct: number,      // 正确次数
          wrong: number,        // 错误次数
          lastSeen: timestamp,  // 最后见到时间
          quality: string       // 质量标记
        }
      },
      uniqueCount: number,      // 不重复词汇数
      total: number,            // 总词汇数
      completed: boolean        // 是否完成
    }
  }
}
```

### 3.3 存储限制问题

**LocalStorage 容量**：
- 浏览器限制：通常 5-10MB
- 当前使用：
  - 单账户数据：~50-200KB
  - 单账户进度：~100-500KB
  - 多账户场景：容易超限

**备份机制**：
```javascript
// 自动备份（保留最近3个）
createBackup(accountId, accountData)
  ├─ 生成 checksum
  ├─ 保存到 mmwg_backup_${accountId}
  └─ 仅保留最新3个备份

// 导出/导入
exportSaveCode()  // 压缩 + Base64 编码
importSaveCode()  // 解码 + 解压 + 迁移
```

**关键代码位置**：
- 存储系统：[src/storage.js](../../src/storage.js) (1-408行)
- 账户系统：[src/modules/08-account.js](../../src/modules/08-account.js)

---

## 4. 词汇统计功能

### 4.1 当前统计维度

```javascript
// 按包统计
getPackProgress(packId)
  ├─ unique: 不重复词汇集合
  ├─ uniqueCount: 不重复词汇数
  ├─ total: 总词汇数
  └─ completed: 完成标记

// 按词汇统计
wordEntry = {
  seen: 见过次数,
  correct: 正确次数,
  wrong: 错误次数,
  lastSeen: 最后见到时间,
  quality: 质量标记
}

// 会话统计
sessionWordCounts = {}        // 本次会话词汇计数
sessionCollectedWords = []    // 本次会话收集的词汇
```

### 4.2 统计粒度不足

❌ **缺失的统计维度**：
- 无法按难度统计
- 无法按类别统计
- 无法按时间段统计
- 无法生成学习曲线
- 无法识别薄弱词汇
- 无法导出学习报告

**关键代码位置**：
- 进度追踪：[src/modules/12-challenges.js](../../src/modules/12-challenges.js) (63-93行)

---

## 5. 问题识别（按严重程度排序）

### 🔴 P0 - 架构级问题

#### 问题 1：双重存储系统混乱

**现象**：同时使用 LocalStorage + SQLite 数据库

**影响**：
- 数据不同步（SQLite 中有 6544 条词汇，但游戏只加载 manifest 中的包）
- 无法充分利用 SQLite 的查询能力
- 维护成本高（两套系统）

**根本原因**：历史遗留（SQLite 可能是后来添加的分析工具）

**代码位置**：
- LocalStorage：[src/storage.js](../../src/storage.js)
- SQLite：`words/db/vocab.db`（未被游戏代码使用）

---

#### 问题 2：词汇包加载机制脆弱

**现象**：依赖全局变量 + 动态脚本加载

**代码示例**：
```javascript
// 09-vocab.js:537-543
if (typeof pack.getRaw === "function") {
  rawList = pack.getRaw();
} else if (Array.isArray(pack.globals)) {
  rawList = pack.globals.flatMap(name => {
    const value = window[name];  // ⚠️ 全局变量污染
    return Array.isArray(value) ? value : [];
  });
}
```

**风险**：
- 脚本加载顺序敏感（Game.html 中 12 必须在 11 之前）
- 全局命名空间污染
- 无法热更新词汇包
- 难以调试

**代码位置**：[src/modules/09-vocab.js](../../src/modules/09-vocab.js:537-543)

---

#### 问题 3：LocalStorage 容量瓶颈

**现象**：多账户 + 大量进度数据 → 容量溢出

**影响**：
- 新账户创建失败
- 进度保存失败（无错误提示）
- 备份系统失效

**当前缓解**：仅保留 3 个备份，但根本问题未解决

**代码位置**：[src/storage.js](../../src/storage.js:312-336)

---

### 🟠 P1 - 功能级问题

#### 问题 4：词汇选择算法过于简单

**现象**：`pickPackAuto()` 仅基于权重和完成度

**代码示例**：
```javascript
// 09-vocab.js:455-480
let w = baseW / (1 + count * 0.75);  // 简单线性衰减
if (last && p.id === last) w *= 0.2;  // 避免重复
```

**缺陷**：
- 无法根据学生学习进度调整
- 无法识别薄弱领域
- 无法实现自适应学习路径

**代码位置**：[src/modules/09-vocab.js](../../src/modules/09-vocab.js:455-480)

---

#### 问题 5：学习质量追踪不完整

**现象**：质量标记只有 4 种

**代码示例**：
```javascript
// 09-vocab.js:74-75
const WORD_QUALITY_DEFAULT = "new";
const WORD_QUALITY_SET = new Set([
  "new",
  "correct_fast",
  "correct_slow",
  "wrong"
]);
```

**缺陷**：
- 无法区分"快速正确"和"慢速正确"的实际差异
- 无法追踪遗忘曲线
- 无法实现间隔重复（Spaced Repetition）

**代码位置**：[src/modules/09-vocab.js](../../src/modules/09-vocab.js:74-75)

---

#### 问题 6：进度数据结构冗余

**现象**：同时存储 `learnedWords[]` 和 `packProgress.unique{}`

**问题**：
- 数据重复（两处都记录已学词汇）
- 同步困难
- 查询效率低

**代码位置**：[src/storage.js](../../src/storage.js:19-26)

---

### 🟡 P2 - 功能缺失

#### 问题 7：缺少导入/导出功能

**现象**：无法导出学习数据为标准格式（CSV/JSON）

**影响**：
- 无法跨设备迁移
- 无法与其他学习工具集成
- 无法进行数据分析

**当前状态**：
- 有 `exportSaveCode()` 但仅支持压缩的 Base64 格式
- 无法导出为人类可读的格式

---

#### 问题 8：缺少多语言支持

**现象**：词汇系统硬编码中文

**代码示例**：
```javascript
// 09-vocab.js:228-233
const cleanName = String(name || "自定义词库").trim() || "自定义词库";
const cleanWords = Array.isArray(words) ? words.filter(w => w?.en).map(w => ({
  standardized: String(w.en || "").trim(),
  chinese: String(w.zh || "").trim(),  // ⚠️ 硬编码中文
  phrase: String(w.phrase || "").trim(),
}))
```

**影响**：无法支持其他语言学习者（如学习日语、韩语等）

---

#### 问题 9：缺少统计和报告功能

**现象**：`startWeakWordsPractice()` 返回 `{ status: "not_implemented" }`

**缺失功能**：
- 薄弱词汇识别
- 学习进度报告
- 学习时间统计
- 掌握度分析

---

#### 问题 10：缺少词汇包管理界面

**现象**：无法在游戏中管理自定义词汇包

**影响**：
- 用户体验差
- 无法删除/编辑词汇包
- 无法查看包详情

---

## 6. 数据流图

```
┌─────────────────────────────────────────────────────────────┐
│                      游戏循环数据流                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  游戏启动                                                    │
│    │                                                         │
│    ▼                                                         │
│  加载 manifest.js                                            │
│    │                                                         │
│    ▼                                                         │
│  ensureVocabEngine()                                         │
│    │                                                         │
│    ▼                                                         │
│  setActiveVocabPack(selection)                               │
│    │                                                         │
│    ├─▶ loadVocabPackFiles()  ──▶ 动态加载 .js 文件          │
│    │                                                         │
│    ├─▶ pack.getRaw()  ──▶ 获取全局变量中的词汇数组          │
│    │                                                         │
│    ├─▶ normalizeRawWord()  ──▶ 规范化词汇格式              │
│    │                                                         │
│    ├─▶ buildWordPicker()  ──▶ 构建选择器                    │
│    │                                                         │
│    └─▶ saveVocabState()  ──▶ 保存到 LocalStorage            │
│                                                              │
│  游戏循环（每帧）                                            │
│    │                                                         │
│    ▼                                                         │
│  wordPicker.pickWord()  ──▶ 选择下一个词汇                  │
│    │                                                         │
│    ▼                                                         │
│  显示词汇卡片                                                │
│    │                                                         │
│    ▼                                                         │
│  玩家收集词汇                                                │
│    │                                                         │
│    ▼                                                         │
│  recordWordProgress()                                        │
│    │                                                         │
│    ├─▶ 更新 progress.vocab[packId].unique[word]             │
│    │                                                         │
│    ├─▶ 更新 wordPicker 质量标记                             │
│    │                                                         │
│    └─▶ saveProgress()  ──▶ 保存到 LocalStorage              │
│                                                              │
│  游戏结束                                                    │
│    │                                                         │
│    ▼                                                         │
│  生成会话统计                                                │
│    │                                                         │
│    └─▶ sessionWordCounts, sessionCollectedWords             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. 改进空间分析

### 7.1 短期改进（1-2 周）

1. **修复 LocalStorage 溢出**
   - 实现数据压缩（已有 LZString 支持）
   - 清理过期备份
   - 分离账户数据和全局数据

2. **增强词汇统计**
   - 添加按难度/类别的统计
   - 实现薄弱词汇识别
   - 生成简单的学习报告

3. **改进错误处理**
   - 添加存储失败提示
   - 实现自动恢复机制

### 7.2 中期改进（1 个月）

1. **迁移到 IndexedDB**
   - 容量 50MB+（相比 LocalStorage 5-10MB）
   - 支持复杂查询
   - 异步 API（不阻塞 UI）

2. **实现自适应学习**
   - 基于学习质量调整词汇选择
   - 实现间隔重复算法
   - 个性化学习路径

3. **完善词汇包管理**
   - 支持在线词汇包下载
   - 实现词汇包版本管理
   - 支持用户自定义词汇包编辑

### 7.3 长期改进（2-3 个月）

1. **后端集成**
   - 云端同步学习进度
   - 多设备同步
   - 学习数据分析

2. **多语言支持**
   - 支持多种目标语言（日语、韩语、法语等）
   - 支持多种界面语言

3. **高级功能**
   - 社交学习（排行榜、挑战）
   - AI 辅助学习路径推荐
   - 学习分析仪表板

---

## 8. 关键代码位置参考

| 功能 | 文件 | 行号 |
|------|------|------|
| 词汇包定义 | `words/vocabs/manifest.js` | 1-500+ |
| 词汇加载 | `src/modules/09-vocab.js` | 198-579 |
| 进度追踪 | `src/modules/12-challenges.js` | 63-93 |
| 存储系统 | `src/storage.js` | 1-408 |
| 账户系统 | `src/modules/08-account.js` | 1-150+ |
| 游戏循环集成 | `src/modules/13-game-loop.js` | 517-524 |

---

## 9. 总结

### ✅ 优点

- 支持多个词汇包（20+ 个）
- 有基本的进度追踪
- 支持自定义词汇
- 有备份机制
- 词汇数据结构完整（音标、例句、图片等）

### ❌ 缺点

- 双重存储系统（LocalStorage + SQLite）未充分利用
- 全局变量污染，脚本加载顺序敏感
- LocalStorage 容量瓶颈
- 统计功能不完整
- 缺少导入/导出、多语言、自适应学习等功能

### 🎯 建议优先级

1. **P0 - 立即解决**：LocalStorage 溢出问题
2. **P1 - 高优先级**：迁移到 IndexedDB + 实现自适应学习
3. **P2 - 中优先级**：完善统计和报告功能
4. **P3 - 低优先级**：多语言支持、云同步等高级功能

---

## 附录：SQLite 数据库分析

**数据库文件**：`words/db/vocab.db`（7.8MB）

**内容**：
- 6,544 条词汇条目
- 包含完整的词汇信息（单词、中文、音标、例句、图片URL等）

**问题**：
- 游戏代码未使用此数据库
- 与 manifest.js 中的词汇包不同步
- 可能是独立的词汇管理工具生成的

**建议**：
- 将 SQLite 作为词汇包的主数据源
- 废弃 manifest.js 中的硬编码词汇包
- 实现动态词汇包加载
