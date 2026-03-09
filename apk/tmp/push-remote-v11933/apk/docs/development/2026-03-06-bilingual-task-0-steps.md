# Task 0: 数据契约 + 存档迁移

> Worktree: task-0-migration
> 分支: feat/bilingual-migration
> 依赖: 无

## 任务目标
为双语学习模式建立稳定的数据契约，并在 `v2.1.0 -> v2.2.0` 中完成本地存档的无损迁移：新增语言模式配置字段、拆分英语/汉字学习进度键、确保迁移可重复执行且无副作用。

## 涉及文件
- js/data-migration.js - 存档迁移逻辑
- js/settings.js - 配置定义

## 实施步骤

### Step 1: 在 js/settings.js 添加新配置字段
**文件**: js/settings.js  
**操作**: 在设置读取与回填逻辑中加入 `languageMode`、`showPinyin`，并保留 `learningMode`

```javascript
function getSettings() {
  const KEYS = getStorageKeysSafe();
  let saved = {};
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (raw) saved = JSON.parse(raw) || {};
  } catch (e) {
    console.warn('parse settings failed:', e);
  }

  const defaults = {
    learningMode: true,
    languageMode: 'english',
    showPinyin: true
  };

  const base = { ...defaults, ...saved };

  return {
    // ... 现有字段
    learningMode: !!base.learningMode,
    languageMode: base.languageMode === 'chinese' ? 'chinese' : 'english',
    showPinyin: typeof base.showPinyin === 'boolean' ? base.showPinyin : true
  };
}
```

**验证**:
- [ ] `getSettings()` 返回值包含 `learningMode`、`languageMode`、`showPinyin`
- [ ] `languageMode` 非法值时回退为 `'english'`
- [ ] 旧存档无 `showPinyin` 时默认值为 `true`
- [ ] 原有 `learningMode` 行为不变

---

### Step 2: 在 js/data-migration.js 添加 v2.2.0 迁移入口
**文件**: js/data-migration.js  
**操作**: 更新迁移版本并新增 `migrateToV2_2_0()` 调用链

```javascript
const MIGRATION_CONFIG = {
  // ... 现有配置
  MIGRATION_VERSION: '2.2.0'
};

function executeMigrationSteps() {
  try {
    const migrated = migrateToV2_2_0();
    return migrated;
  } catch (error) {
    console.error('migration steps failed:', error);
    return false;
  }
}
```

**验证**:
- [ ] `MIGRATION_CONFIG.MIGRATION_VERSION` 已更新为 `'2.2.0'`
- [ ] `executeMigrationSteps()` 已接入 `migrateToV2_2_0()`
- [ ] 迁移失败时返回 `false` 并打印错误日志

---

### Step 3: 实现迁移矩阵（v2.1.0 -> v2.2.0）
**文件**: js/data-migration.js  
**操作**: 按矩阵复制旧键并补充新键默认值

```javascript
function copyStorageKey(fromKey, toKey, fallbackValue) {
  const raw = localStorage.getItem(fromKey);
  if (raw !== null) {
    localStorage.setItem(toKey, raw);
    return;
  }
  if (fallbackValue !== undefined && localStorage.getItem(toKey) === null) {
    localStorage.setItem(toKey, JSON.stringify(fallbackValue));
  }
}

function migrateToV2_2_0() {
  copyStorageKey('kgProgress', 'englishProgress_kg', {});
  copyStorageKey('wordGameProgress', 'englishProgress_game', {});

  if (localStorage.getItem('chineseProgress_kg') === null) {
    localStorage.setItem('chineseProgress_kg', JSON.stringify({}));
  }
  if (localStorage.getItem('chineseProgress_game') === null) {
    localStorage.setItem('chineseProgress_game', JSON.stringify({}));
  }
  if (localStorage.getItem('languageMode') === null) {
    localStorage.setItem('languageMode', 'english');
  }

  return true;
}
```

**验证**:
- [ ] `kgProgress` 已复制到 `englishProgress_kg`
- [ ] `wordGameProgress` 已复制到 `englishProgress_game`
- [ ] `chineseProgress_kg` 缺失时初始化为 `{}`
- [ ] `chineseProgress_game` 缺失时初始化为 `{}`
- [ ] `languageMode` 缺失时初始化为 `'english'`

---

### Step 4: 添加迁移幂等性检查
**文件**: js/data-migration.js  
**操作**: 使用 `dataVersion` 做版本门禁，已迁移直接跳过

```javascript
function migrateToV2_2_0() {
  const currentDataVersion = localStorage.getItem('dataVersion');
  if (currentDataVersion === '2.2.0') {
    console.log('skip migration: already at dataVersion 2.2.0');
    return true;
  }

  copyStorageKey('kgProgress', 'englishProgress_kg', {});
  copyStorageKey('wordGameProgress', 'englishProgress_game', {});

  if (localStorage.getItem('chineseProgress_kg') === null) {
    localStorage.setItem('chineseProgress_kg', JSON.stringify({}));
  }
  if (localStorage.getItem('chineseProgress_game') === null) {
    localStorage.setItem('chineseProgress_game', JSON.stringify({}));
  }
  if (localStorage.getItem('languageMode') === null) {
    localStorage.setItem('languageMode', 'english');
  }

  localStorage.setItem('dataVersion', '2.2.0');
  return true;
}
```

**验证**:
- [ ] `dataVersion === '2.2.0'` 时直接跳过迁移
- [ ] 首次迁移后写入 `dataVersion = '2.2.0'`
- [ ] 第二次迁移执行后，目标键数据不变（无重复覆盖破坏）
- [ ] 迁移过程不删除旧键（`kgProgress`、`wordGameProgress`）

---

### Step 5: 测试迁移逻辑
**文件**: js/data-migration.js、js/settings.js  
**操作**: 在浏览器控制台执行三组场景验证

```javascript
// Case 1: 旧版本存档（v2.1.0）
localStorage.clear();
localStorage.setItem('dataVersion', '2.1.0');
localStorage.setItem('kgProgress', JSON.stringify({ level1: { done: 3 } }));
localStorage.setItem('wordGameProgress', JSON.stringify({ stars: 9 }));
window.DataMigration.performMigration();

console.log(localStorage.getItem('englishProgress_kg'));     // 应有旧数据
console.log(localStorage.getItem('englishProgress_game'));   // 应有旧数据
console.log(localStorage.getItem('chineseProgress_kg'));     // "{}"
console.log(localStorage.getItem('chineseProgress_game'));   // "{}"
console.log(localStorage.getItem('languageMode'));           // "english"
console.log(localStorage.getItem('dataVersion'));            // "2.2.0"

// Case 2: 已迁移存档（幂等性）
const snapshot = {
  englishKg: localStorage.getItem('englishProgress_kg'),
  englishGame: localStorage.getItem('englishProgress_game'),
  zhKg: localStorage.getItem('chineseProgress_kg'),
  zhGame: localStorage.getItem('chineseProgress_game')
};
window.DataMigration.performMigration();

console.assert(snapshot.englishKg === localStorage.getItem('englishProgress_kg'));
console.assert(snapshot.englishGame === localStorage.getItem('englishProgress_game'));
console.assert(snapshot.zhKg === localStorage.getItem('chineseProgress_kg'));
console.assert(snapshot.zhGame === localStorage.getItem('chineseProgress_game'));

// Case 3: 空存档
localStorage.clear();
window.DataMigration.performMigration();
console.log(localStorage.getItem('dataVersion'));   // "2.2.0"
console.log(localStorage.getItem('languageMode'));  // "english"
```

**验证**:
- [ ] Case 1: 旧进度完整复制，新增键初始化正确
- [ ] Case 2: 二次执行迁移后数据无变化
- [ ] Case 3: 空存档可正确初始化关键键
- [ ] `dataVersion` 最终为 `'2.2.0'`

**验证命令**:
```bash
# 语法检查
node -c js/data-migration.js
node -c js/settings.js

# 浏览器控制台快速检查
localStorage.getItem('dataVersion')    // '2.2.0'
localStorage.getItem('languageMode')   // 'english'
```

---

## 验收标准
- [ ] `js/settings.js` 已支持 `languageMode` 与 `showPinyin`，并保留 `learningMode`
- [ ] `js/data-migration.js` 完成 `v2.1.0 -> v2.2.0` 迁移矩阵
- [ ] 迁移逻辑具备幂等性，重复执行无副作用
- [ ] 旧版本存档迁移成功，无数据丢失
- [ ] `dataVersion` 正确写入 `'2.2.0'`
- [ ] 代码通过语法检查（`node -c js/data-migration.js`、`node -c js/settings.js`）

## 遗留问题
- 当前 `settings` 采用对象存储，而迁移矩阵要求新增独立键 `languageMode`；需确认后续是否要同步写入 `settings.languageMode`，以避免两套来源不一致。
- 若后续需要迁移 `kgProgress_phrase` / `wordGameProgress_phrase`，建议在 `v2.2.x` 增量迁移中补充，不在本 task-0 范围内扩展。
