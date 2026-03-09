# SQLite 数据库分析报告

> 生成时间：2026-03-05
> 目的：评估是否应该使用现有 SQLite 数据库（方案 B）

## 数据库基本信息

- **文件**：`words/db/vocab.db`（7.8MB）
- **格式**：SQLite 3.x
- **记录数**：6,545 条（含表头）
- **CSV 导出**：`words/db/csv/entries.csv`

## 数据结构分析

### CSV 表结构
```csv
id,lemma_key,learn_type,word,standardized,chinese,phonetic,phrase,phraseTranslation,difficulty,category,status,primary_image_url,source_files
```

### 字段说明
- `id`: 唯一标识符
- `lemma_key`: 词根键
- `learn_type`: 学习类型（word/phrase）
- `word`: 原始单词
- `standardized`: 标准化形式
- `chinese`: 中文翻译
- `phonetic`: 音标
- `phrase`: 例句
- `phraseTranslation`: 例句翻译
- `difficulty`: 难度（basic/intermediate/advanced/expert）
- `category`: 分类（elementary_lower/junior_high/block/entity 等）
- `status`: 状态（active/inactive）
- `primary_image_url`: 图片 URL
- `source_files`: 来源文件（分号分隔）

## 数据质量评估

### ✅ 优点

1. **数据完整**
   - 包含所有必需字段（单词、中文、音标、例句、图片）
   - 与游戏当前使用的词汇格式**完全一致**
   - `source_files` 字段记录了词汇来源，可追溯

2. **数据丰富**
   - 6,544 条词汇（比 manifest.js 更全）
   - 包含多个来源：
     - 幼儿园词库（01_幼儿园）
     - 小学词库（02/03）
     - 我的世界主题（04）
     - 初中词库（05）
     - 外部词库（hermitdave-en50k 等）

3. **分类清晰**
   - `difficulty`: basic/intermediate/advanced/expert
   - `category`: 按年级和主题分类
   - `status`: active/inactive（可过滤无效词汇）

4. **已有 CSV 导出**
   - 说明数据库是被维护的
   - 可以直接使用 CSV 而不需要 sql.js

### ⚠️ 问题

1. **部分字段缺失**
   - 很多 `phonetic` 为空（如 id=19303-19777）
   - 部分 `phrase` 和 `phraseTranslation` 为空
   - 外部来源词汇（hermitdave-en50k）质量较低

2. **数据冗余**
   - 同一个词有多个条目（word 和 phrase 类型）
   - 例如：`zigzag` 有 2 条记录（id=91, 20794）

3. **未被游戏使用**
   - 当前游戏使用 `manifest.js` + JS 文件
   - SQLite 数据库是独立维护的

## 方案 B 重新评估

### 原方案 B：使用 sql.js（WASM）

**问题**：
- 需要加载 ~500KB WASM
- 需要学习 SQL
- 首次加载慢

### 🎯 改进方案 B：直接使用 CSV

**核心思路**：
- SQLite 已有 CSV 导出（`entries.csv`）
- 直接加载 CSV，解析为 JSON
- 不需要 sql.js，不需要 WASM

**实现方式**：

```javascript
// 1. 加载 CSV（一次性，启动时）
async function loadVocabFromCSV() {
  const response = await fetch('words/db/csv/entries.csv');
  const csvText = await response.text();

  // 解析 CSV
  const lines = csvText.split('\n');
  const headers = lines[0].split(',');

  const vocabDatabase = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) continue;

    const entry = {};
    headers.forEach((header, index) => {
      entry[header] = values[index];
    });

    // 只加载 active 状态的词汇
    if (entry.status === 'active') {
      vocabDatabase.push(entry);
    }
  }

  return vocabDatabase;
}

// 2. 构建索引（快速查询）
function buildVocabIndex(vocabDatabase) {
  const index = {
    byDifficulty: {},
    byCategory: {},
    bySourceFile: {}
  };

  vocabDatabase.forEach(entry => {
    // 按难度索引
    if (!index.byDifficulty[entry.difficulty]) {
      index.byDifficulty[entry.difficulty] = [];
    }
    index.byDifficulty[entry.difficulty].push(entry);

    // 按分类索引
    if (!index.byCategory[entry.category]) {
      index.byCategory[entry.category] = [];
    }
    index.byCategory[entry.category].push(entry);

    // 按来源文件索引
    const sources = entry.source_files.split(';');
    sources.forEach(source => {
      if (!index.bySourceFile[source]) {
        index.bySourceFile[source] = [];
      }
      index.bySourceFile[source].push(entry);
    });
  });

  return index;
}

// 3. 查询接口
const vocabAPI = {
  // 按难度查询
  getByDifficulty(difficulty) {
    return vocabIndex.byDifficulty[difficulty] || [];
  },

  // 按分类查询
  getByCategory(category) {
    return vocabIndex.byCategory[category] || [];
  },

  // 按来源文件查询（兼容现有 manifest.js）
  getBySourceFile(sourceFile) {
    return vocabIndex.bySourceFile[sourceFile] || [];
  },

  // 随机获取
  getRandom(count, filter = {}) {
    let pool = vocabDatabase;

    if (filter.difficulty) {
      pool = this.getByDifficulty(filter.difficulty);
    }
    if (filter.category) {
      pool = this.getByCategory(filter.category);
    }

    // 随机打乱
    const shuffled = pool.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
};
```

### 优点对比

| 维度 | 原方案 B<br>（sql.js） | 改进方案 B<br>（CSV） | 方案 A<br>（优化 LocalStorage） |
|------|---------------------|-------------------|---------------------------|
| **开发时间** | 3-5 天 | **2-3 天** | 1-2 天 |
| **依赖** | sql.js (~500KB) | **无** | LZString (已有) |
| **首次加载** | 慢（WASM） | **快（纯 JS）** | 快 |
| **查询能力** | 强（SQL） | **中等（索引）** | 弱 |
| **数据来源** | SQLite | **CSV（已有）** | manifest.js |
| **数据完整性** | 高 | **高** | 中 |
| **学习成本** | SQL | **低（纯 JS）** | 无 |

## 最终推荐

### 🥇 新推荐：改进方案 B（CSV + 索引）

**理由**：
1. **数据已存在**：CSV 文件已有，6,544 条词汇
2. **数据质量好**：包含所有必需字段，与游戏格式一致
3. **无需新依赖**：纯 JavaScript，不需要 WASM
4. **查询能力强**：通过索引支持按难度/分类/来源查询
5. **开发时间短**：2-3 天即可完成

**实施步骤**：
1. 实现 CSV 加载和解析（4 小时）
2. 构建内存索引（2 小时）
3. 实现查询 API（4 小时）
4. 替换现有 manifest.js 加载逻辑（4 小时）
5. 测试和优化（4 小时）

**总计**：18 小时（2-3 天）

---

### 🥈 备选：方案 A（优化 LocalStorage）

**适用场景**：
- 如果不想改变现有词汇加载逻辑
- 如果只需要解决容量问题
- 如果需要最快速度（1-2 天）

---

## 方案 B vs 方案 A 对比

### 方案 B（CSV + 索引）的额外优势

1. **统一数据源**
   - 所有词汇在一个 CSV 文件中
   - 不需要维护 20+ 个 JS 文件
   - 更新词汇只需编辑 CSV

2. **更强的查询能力**
   - 按难度统计：`vocabAPI.getByDifficulty('basic').length`
   - 按分类统计：`vocabAPI.getByCategory('junior_high').length`
   - 复杂筛选：`vocabAPI.getRandom(10, { difficulty: 'basic', category: 'kindergarten' })`

3. **更好的扩展性**
   - 添加新字段只需修改 CSV
   - 支持多语言词库（CSV 可以有不同列）
   - 可以导出为其他格式（JSON/Excel）

4. **数据完整性**
   - CSV 包含 `source_files` 字段，可追溯来源
   - 可以过滤 `status=inactive` 的词汇
   - 数据质量更高（6,544 条 vs manifest.js 的部分词汇）

### 方案 A 的优势

1. **最简单**：不改变现有架构
2. **最快**：1-2 天即可完成
3. **风险最低**：向后兼容

---

## 决策建议

### 推荐：方案 B（CSV + 索引）

**原因**：
1. 数据已存在且质量好
2. 开发时间只比方案 A 多 1 天
3. 但带来更强的查询能力和扩展性
4. 统一数据源，后续维护更简单

### 实施路径

**Phase 1：基础功能（2 天）**
1. 实现 CSV 加载和索引
2. 替换现有词汇加载逻辑
3. 保持 API 兼容性

**Phase 2：优化和扩展（1 天）**
1. 添加 LocalStorage 压缩（复用方案 A）
2. 实现 JSON 导入/导出
3. 添加统计功能

**总计**：3 天

---

## 总结

**核心观点**：
- SQLite 数据库已存在且数据质量好
- 不需要 sql.js（WASM），直接用 CSV 更简单
- 方案 B（CSV + 索引）比方案 A 只多 1 天开发时间
- 但带来更强的查询能力和更好的扩展性

**下一步**：
1. 用户确认方案 B（CSV + 索引）
2. 生成详细实施计划
3. 开始开发

---

**相关文档**：
- [轻量级方案头脑风暴](2026-03-05-alternative-solutions.md)
- [现状分析](2026-03-05-vocabulary-system-analysis.md)
