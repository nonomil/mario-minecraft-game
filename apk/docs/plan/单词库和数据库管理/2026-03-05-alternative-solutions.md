# 词汇系统优化 - 轻量级方案头脑风暴

> 生成时间：2026-03-05
> 背景：用户反馈 IndexedDB 方案可能过重，词汇总量仅几千条

## 问题重新审视

### 实际数据规模
- SQLite 数据库：7.8MB，6,544 条词汇
- 单账户 LocalStorage 数据：50-200KB
- 单账户进度数据：100-500KB
- **结论**：这不是"大数据"场景

### 核心痛点（按优先级）
1. **P0 - LocalStorage 容量溢出**（多账户场景）
2. **P1 - 无法导入/导出词库**（用户体验）
3. **P1 - 无法迁移数据**（跨设备）
4. **P2 - 学习进度统计不足**
5. **P2 - 需要支持多语言词库**

### 原方案的问题
- IndexedDB 迁移：8-10 周，280 工时
- 5 个 Object Stores，复杂 Schema
- 缓存层、批量操作、懒加载等优化
- **过度设计**：为几千条数据引入了企业级数据库方案

---

## 方案 A：优化 LocalStorage（最简单）

### 核心思路
**不迁移数据库，只优化现有 LocalStorage 使用**

### 具体措施

#### 1. 数据压缩（立即见效）
```javascript
// 使用 LZString 压缩（已有依赖）
saveJson(key, value) {
  const jsonStr = JSON.stringify(value);
  const compressed = LZString.compress(jsonStr);
  localStorage.setItem(key, compressed);
}

loadJson(key) {
  const compressed = localStorage.getItem(key);
  const jsonStr = LZString.decompress(compressed);
  return JSON.parse(jsonStr);
}
```

**预期效果**：
- 压缩率 50-70%
- 单账户数据：200KB → 60-100KB
- 可支持 10+ 账户不溢出

#### 2. 清理冗余数据
```javascript
// 删除已弃用的 wordStats
delete account.vocabulary.wordStats;

// 合并 learnedWords 和 packProgress.unique
// learnedWords 可以从 packProgress 重建，不需要单独存储
```

**预期效果**：
- 减少 30-50% 数据量
- 简化数据结构

#### 3. 导出/导入功能（JSON 格式）
```javascript
// 导出为人类可读的 JSON
function exportAccount(accountId) {
  const account = getAccount(accountId);
  const data = {
    version: "2.0",
    account: account,
    exportDate: new Date().toISOString()
  };

  // 下载为文件
  const blob = new Blob([JSON.stringify(data, null, 2)],
    { type: 'application/json' });
  downloadFile(blob, `account-${accountId}.json`);
}

// 导入
function importAccount(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = JSON.parse(e.target.result);
    // 验证格式
    if (data.version !== "2.0") {
      throw new Error("版本不兼容");
    }
    // 导入账户
    saveAccount(data.account);
  };
  reader.readAsText(file);
}
```

### 优点
- ✅ **极简**：1-2 天即可完成
- ✅ **向后兼容**：不破坏现有数据
- ✅ **无学习成本**：用户熟悉的文件导入/导出
- ✅ **立即见效**：压缩后容量问题基本解决

### 缺点
- ❌ 仍有 5-10MB 硬限制（但优化后够用）
- ❌ 无法支持复杂查询（如"按难度统计"）
- ❌ 多账户场景仍可能溢出（但概率大幅降低）

### 适用场景
- 用户数量 < 20 个账户
- 不需要复杂统计分析
- 优先快速解决问题

---

## 方案 B：利用现有 SQLite 数据库

### 核心思路
**SQLite 数据库已有 6,544 条词汇，通过 sql.js 在浏览器中使用**

### 具体措施

#### 1. 引入 sql.js（WASM）
```html
<script src="https://cdn.jsdelivr.net/npm/sql.js@1.8.0/dist/sql-wasm.js"></script>
```

**大小**：~500KB（压缩后）

#### 2. 加载 SQLite 数据库
```javascript
async function initDB() {
  const SQL = await initSqlJs({
    locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1.8.0/dist/${file}`
  });

  // 加载现有数据库
  const response = await fetch('words/db/vocab.db');
  const buffer = await response.arrayBuffer();
  const db = new SQL.Database(new Uint8Array(buffer));

  return db;
}
```

#### 3. 查询词汇
```javascript
// 按难度查询
const results = db.exec(`
  SELECT * FROM words
  WHERE difficulty = 'basic'
  ORDER BY RANDOM()
  LIMIT 10
`);

// 按包查询
const results = db.exec(`
  SELECT * FROM words
  WHERE packId = 'vocab.kindergarten.basic'
`);
```

#### 4. 进度数据仍用 LocalStorage
```javascript
// 词汇数据：SQLite（只读）
// 进度数据：LocalStorage（读写）
// 分离关注点
```

### 优点
- ✅ **数据已存在**：6,544 条词汇无需重新整理
- ✅ **强大查询能力**：SQL 支持复杂统计
- ✅ **标准格式**：SQLite 可用其他工具编辑
- ✅ **离线可用**：数据库文件本地加载

### 缺点
- ❌ 需要加载 WASM（~500KB，首次加载慢）
- ❌ 学习曲线（需要写 SQL）
- ❌ 数据库文件较大（7.8MB）
- ❌ 进度数据仍需 LocalStorage

### 适用场景
- 需要复杂统计分析
- 词汇数据不常变化
- 可接受首次加载时间

---

## 方案 C：纯文件系统方案

### 核心思路
**完全放弃 LocalStorage，所有数据存为文件**

### 具体措施

#### 1. 词库文件化
```
words/
  ├── kindergarten-basic.json
  ├── kindergarten-intermediate.json
  └── ...
```

#### 2. 进度文件化
```
user-data/
  ├── account-123.json
  ├── account-456.json
  └── ...
```

#### 3. 使用 File System Access API
```javascript
// 选择保存位置
const dirHandle = await window.showDirectoryPicker();

// 保存进度
const fileHandle = await dirHandle.getFileHandle('progress.json', { create: true });
const writable = await fileHandle.createWritable();
await writable.write(JSON.stringify(progressData));
await writable.close();

// 读取进度
const file = await fileHandle.getFile();
const text = await file.text();
const progressData = JSON.parse(text);
```

### 优点
- ✅ **无容量限制**：文件系统无限制
- ✅ **用户完全控制**：数据在用户硬盘上
- ✅ **易于备份**：直接复制文件夹
- ✅ **跨设备迁移**：复制文件即可

### 缺点
- ❌ **浏览器兼容性**：File System Access API 仅 Chrome/Edge 支持
- ❌ **用户体验**：每次启动需要选择文件夹
- ❌ **权限管理**：需要用户授权
- ❌ **移动端不支持**：Android/iOS 无法使用

### 适用场景
- 桌面端应用
- 高级用户
- 需要完全控制数据

---

## 方案 D：LocalStorage + IndexedDB 混合（轻量级）

### 核心思路
**只用 IndexedDB 存词汇和进度，不需要复杂 Schema**

### 具体措施

#### 1. 极简 Schema（仅 2 个 Object Store）
```javascript
// 1. words - 词汇数据（只读）
{
  keyPath: "id",
  indexes: { "packId": false }
}

// 2. progress - 学习进度（读写）
{
  keyPath: ["accountId", "wordId"],
  indexes: { "accountId": false }
}
```

#### 2. 配置仍用 LocalStorage
```javascript
// LocalStorage：账户信息、设置（<10KB）
// IndexedDB：词汇、进度（>100KB）
```

#### 3. 简化 API
```javascript
// 只需 3 个方法
async function getWords(packId) { ... }
async function getProgress(accountId) { ... }
async function saveProgress(accountId, wordId, data) { ... }
```

### 优点
- ✅ **容量充足**：IndexedDB 50MB+
- ✅ **简单**：只有 2 个表，3 个方法
- ✅ **性能好**：异步 API，不阻塞 UI
- ✅ **向后兼容**：可从 LocalStorage 迁移

### 缺点
- ❌ 仍需迁移逻辑（但简单很多）
- ❌ 需要测试兼容性
- ❌ 比方案 A 复杂

### 适用场景
- 需要扩展性（未来可能更多数据）
- 可接受 1-2 周开发时间
- 需要更好的性能

---

## 方案对比

| 维度 | 方案 A<br>优化 LocalStorage | 方案 B<br>SQLite + sql.js | 方案 C<br>纯文件系统 | 方案 D<br>轻量级 IndexedDB | 原方案<br>完整 IndexedDB |
|------|---------------------------|-------------------------|-------------------|-------------------------|---------------------|
| **开发时间** | 1-2 天 | 3-5 天 | 5-7 天 | 1-2 周 | 8-10 周 |
| **复杂度** | ⭐ 极简 | ⭐⭐ 简单 | ⭐⭐⭐ 中等 | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐⭐ 复杂 |
| **容量限制** | 5-10MB（优化后够用） | 无限制 | 无限制 | 50MB+ | 50MB+ |
| **查询能力** | ❌ 弱 | ✅ 强（SQL） | ❌ 弱 | ✅ 中等 | ✅ 强 |
| **导入/导出** | ✅ JSON 文件 | ✅ SQLite 文件 | ✅ 文件夹 | ✅ JSON 文件 | ✅ 多格式 |
| **跨设备迁移** | ✅ 复制文件 | ✅ 复制文件 | ✅ 复制文件夹 | ✅ 复制文件 | ✅ 云同步 |
| **浏览器兼容** | ✅ 全兼容 | ✅ 全兼容 | ❌ 仅 Chrome/Edge | ✅ 全兼容 | ✅ 全兼容 |
| **移动端支持** | ✅ 支持 | ✅ 支持 | ❌ 不支持 | ✅ 支持 | ✅ 支持 |
| **向后兼容** | ✅ 完全兼容 | ⚠️ 需适配 | ❌ 不兼容 | ⚠️ 需迁移 | ⚠️ 需迁移 |
| **学习成本** | ⭐ 无 | ⭐⭐ SQL | ⭐⭐⭐ File API | ⭐⭐ IndexedDB | ⭐⭐⭐⭐ 高 |
| **扩展性** | ⚠️ 有限 | ✅ 好 | ✅ 好 | ✅ 好 | ✅ 极好 |

---

## 推荐方案

### 🥇 推荐：方案 A（优化 LocalStorage）

**理由**：
1. **快速见效**：1-2 天即可完成，立即解决容量问题
2. **风险最低**：不破坏现有数据，向后兼容
3. **够用**：对于几千条词汇，优化后的 LocalStorage 完全够用
4. **用户体验好**：JSON 文件导入/导出，简单直观

**实施步骤**：
1. 实现 LZString 压缩（1 小时）
2. 清理冗余数据（2 小时）
3. 实现 JSON 导出（3 小时）
4. 实现 JSON 导入（3 小时）
5. 测试和优化（3 小时）

**总计**：12 小时（1.5 天）

---

### 🥈 备选：方案 D（轻量级 IndexedDB）

**理由**：
1. **平衡**：简单性和扩展性的平衡
2. **未来可扩展**：如果后续需要更多功能，容易扩展
3. **性能更好**：异步 API，不阻塞 UI

**适用场景**：
- 如果方案 A 实施后仍有容量问题
- 如果需要更复杂的统计功能
- 如果计划长期维护和扩展

**实施步骤**：
1. 设计极简 Schema（1 天）
2. 实现 IndexedDB 封装（2 天）
3. 实现迁移逻辑（2 天）
4. 测试和优化（2 天）

**总计**：7 天（1 周）

---

## 决策建议

### 立即执行（Phase 1）
**选择方案 A**，快速解决当前问题：
- LocalStorage 压缩和清理
- JSON 导入/导出功能
- 基础统计功能

### 观察和评估（Phase 2）
实施方案 A 后，观察 1-2 周：
- 容量是否仍有问题？
- 用户是否需要更复杂的统计？
- 是否需要更多词库类型？

### 按需升级（Phase 3）
如果方案 A 不够用，再考虑：
- 方案 D（轻量级 IndexedDB）
- 或方案 B（SQLite）

---

## 总结

**核心观点**：
- 对于几千条词汇，IndexedDB 完整方案确实过重
- 优化 LocalStorage + JSON 导入/导出是最简单有效的方案
- 可以先快速解决问题，再根据实际需求决定是否升级

**下一步**：
1. 用户选择方案（推荐方案 A）
2. 生成详细的实施计划
3. 开始开发

---

**相关文档**：
- [需求分析](2026-03-04-vocabulary-database-requirements.md)
- [现状分析](2026-03-05-vocabulary-system-analysis.md)
- [原技术设计](2026-03-05-technical-design.md)（IndexedDB 完整方案）
- [原实施计划](2026-03-05-implementation-plan.md)（8-10 周）
