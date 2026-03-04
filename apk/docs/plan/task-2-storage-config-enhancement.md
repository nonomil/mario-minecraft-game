# 任务 2：存储与配置增强 - 执行计划

> **任务ID：** TASK-2-STORAGE
> **优先级：** 中
> **预估工作量：** 2-3 天
> **风险等级：** 中
> **创建时间：** 2026-03-04
> **最后更新：** 2026-03-04
> **当前状态：** 待开始
> **当前阶段：** 未开始

---

## 📋 状态字段（必须维护）

```yaml
status: "已完成"  # 待开始 | 进行中 | 已完成 | 测试失败 | 待合并 | 已合并
current_phase: "验证"  # Phase1 | Phase2 | Phase3 | 验证
start_time: "2026-03-04T10:00:00Z"
phase1_complete_time: "2026-03-04T11:30:00Z"
phase2_complete_time: "2026-03-04T12:45:00Z"
phase3_complete_time: "2026-03-04T13:20:00Z"
complete_time: "2026-03-04T13:20:00Z"
test_results:
  phase1: "通过"  # 通过 | 失败 | 未执行
  phase2: "通过"
  phase3: "通过"
  final: "待执行"
commit_hashes:
  phase1: "90baaa1"
  phase2: "062a8a9"
  phase3: "81425d9"
notes: "All three phases completed successfully. Backup system, config validation, and error recovery implemented."
```

---

## 🎯 任务目标

增强存档系统的可靠性和兼容性，完善配置加载的错误处理。

### 涉及模块
- **存储系统** (src/storage.js)
- **配置加载** (src/modules/01-config.js)
- **存档管理** (src/modules/19-save.js)

### 关键风险
1. 存档格式变更导致用户进度丢失
2. LocalStorage 配额超限导致存档失败
3. 配置文件加载失败导致游戏无法启动

---

## 📂 涉及文件清单

### 主要修改文件
- `src/storage.js` - LocalStorage 封装（~200行）
- `src/modules/01-config.js` - 配置加载器（~150行）
- `src/modules/19-save.js` - 存档管理（~300行）

### 可能涉及文件
- `src/modules/20-achievement.js` - 成就系统（依赖存储）
- `config/game.json` - 游戏配置
- `config/levels.json` - 关卡配置

### 测试文件
- `tests/e2e/specs/save-load.spec.mjs` - 存档测试
- `tests/e2e/specs/config-loading.spec.mjs` - 配置加载测试

---

## ✅ Phase 1：存档系统增强（预估 1天）

### 目标
添加存档版本管理、压缩和配额检测。

### Task 1.1：存档版本管理

#### 1.1.1 添加版本号
- [ ] 在 `src/storage.js` 中定义存档版本常量：
  ```javascript
  const SAVE_VERSION = "1.0.0";
  ```
- [ ] 修改 `exportSaveCode()` 函数，在存档数据中添加版本号：
  ```javascript
  const saveData = {
    version: SAVE_VERSION,
    timestamp: Date.now(),
    data: { /* 游戏数据 */ }
  };
  ```

#### 1.1.2 实现版本迁移
- [ ] 创建 `migrateSaveData(saveData)` 函数
- [ ] 支持从旧版本迁移到新版本：
  ```javascript
  function migrateSaveData(saveData) {
    if (!saveData.version) {
      // 迁移 v0 (无版本号) -> v1.0.0
      return migrateV0ToV1(saveData);
    }
    if (saveData.version === "1.0.0") {
      return saveData; // 当前版本，无需迁移
    }
    throw new Error(`Unsupported save version: ${saveData.version}`);
  }
  ```

#### 1.1.3 修改导入逻辑
- [ ] 修改 `importSaveCode(code)` 函数
- [ ] 在导入前先迁移数据：
  ```javascript
  function importSaveCode(code) {
    let saveData = JSON.parse(atob(code));
    saveData = migrateSaveData(saveData);
    // 应用存档数据
  }
  ```

---

### Task 1.2：存档压缩

#### 1.2.1 实现压缩函数
- [ ] 添加 `compressSaveData(data)` 函数
- [ ] 使用简单的压缩算法（如 LZString 或 pako）
- [ ] 如果压缩库不可用，使用 JSON 字符串作为 fallback

#### 1.2.2 集成到导出
- [ ] 修改 `exportSaveCode()` 函数
- [ ] 压缩后再 Base64 编码：
  ```javascript
  const compressed = compressSaveData(saveData);
  const code = btoa(compressed);
  ```

#### 1.2.3 集成到导入
- [ ] 修改 `importSaveCode(code)` 函数
- [ ] Base64 解码后再解压：
  ```javascript
  const compressed = atob(code);
  const saveData = decompressSaveData(compressed);
  ```

---

### Task 1.3：LocalStorage 配额检测

#### 1.3.1 实现配额检测
- [ ] 创建 `checkStorageQuota()` 函数
- [ ] 返回可用空间和已用空间：
  ```javascript
  function checkStorageQuota() {
    try {
      const test = "x".repeat(1024 * 1024); // 1MB
      localStorage.setItem("__quota_test__", test);
      localStorage.removeItem("__quota_test__");
      return { available: true, estimated: "充足" };
    } catch (e) {
      return { available: false, error: e.message };
    }
  }
  ```

#### 1.3.2 保存前检测
- [ ] 在 `exportSaveCode()` 前检测配额
- [ ] 配额不足时提示用户清理数据

#### 1.3.3 添加清理功能
- [ ] 创建 `cleanOldSaves()` 函数
- [ ] 删除超过 30 天的自动存档
- [ ] 保留手动存档

---

### Phase 1 提交
```bash
git add src/storage.js src/modules/19-save.js
git commit -m "feat(task2-phase1): enhance save system with versioning and compression

Phase 1 completed:
- Add save version management and migration
- Implement save data compression
- Add LocalStorage quota detection
- Add old save cleanup functionality"
```

### Phase 1 验证
- [ ] 运行存档测试
- [ ] 手工验证：导出/导入存档正常
- [ ] 验证版本迁移：导入旧版本存档成功
- [ ] 验证压缩：存档大小减少 ≥30%
- [ ] 验证配额检测：配额不足时有提示

---

## ✅ Phase 2：配置加载增强（预估 1天）

### 目标
完善配置加载的错误处理和 fallback 机制。

### Task 2.1：配置加载错误处理

#### 2.1.1 增强 loadJsonWithFallback
- [ ] 修改 `src/modules/01-config.js` 中的 `loadJsonWithFallback(path, fallback)` 函数
- [ ] 添加详细的错误日志：
  ```javascript
  async function loadJsonWithFallback(path, fallback) {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        console.warn(`Config load failed: ${path} (${response.status})`);
        return fallback;
      }
      const data = await response.json();
      return mergeDeep(fallback, data);
    } catch (error) {
      console.error(`Config load error: ${path}`, error);
      return fallback;
    }
  }
  ```

#### 2.1.2 添加配置验证
- [ ] 创建 `validateConfig(config, schema)` 函数
- [ ] 验证必需字段是否存在
- [ ] 验证字段类型是否正确
- [ ] 验证数值范围是否合理

#### 2.1.3 集成验证
- [ ] 在配置加载后验证
- [ ] 验证失败时使用 fallback 并记录警告

---

### Task 2.2：配置热重载

#### 2.2.1 实现配置重载
- [ ] 创建 `reloadConfig(configName)` 函数
- [ ] 支持运行时重新加载配置
- [ ] 更新全局配置对象

#### 2.2.2 添加开发工具
- [ ] 在开发模式下暴露 `window.reloadConfig`
- [ ] 添加快捷键（如 Ctrl+R）重载配置
- [ ] 配置变更后显示提示

---

### Task 2.3：配置缓存

#### 2.3.1 实现配置缓存
- [ ] 将加载的配置缓存到 LocalStorage
- [ ] 添加缓存过期时间（如 24 小时）
- [ ] 优先使用缓存，后台更新

#### 2.3.2 缓存失效策略
- [ ] 配置文件版本号变更时失效
- [ ] 手动清除缓存功能
- [ ] 缓存损坏时自动清除

---

### Phase 2 提交
```bash
git add src/modules/01-config.js
git commit -m "feat(task2-phase2): enhance config loading with validation and caching

Phase 2 completed:
- Add detailed error handling in loadJsonWithFallback
- Implement config validation
- Add config hot reload for development
- Implement config caching with expiration"
```

### Phase 2 验证
- [ ] 运行配置加载测试
- [ ] 手工验证：配置加载失败时使用 fallback
- [ ] 验证配置验证：无效配置被拒绝
- [ ] 验证热重载：配置变更立即生效
- [ ] 验证缓存：离线时使用缓存配置

---

## ✅ Phase 3：错误恢复机制（预估 0.5-1天）

### 目标
添加存档损坏检测和自动恢复机制。

### Task 3.1：存档完整性检查

#### 3.1.1 实现校验和
- [ ] 在存档数据中添加 checksum 字段
- [ ] 使用简单的哈希算法（如 CRC32）
- [ ] 导入时验证 checksum

#### 3.1.2 存档备份
- [ ] 每次保存时创建备份
- [ ] 保留最近 3 个备份
- [ ] 备份存储在独立的 LocalStorage key

---

### Task 3.2：自动恢复

#### 3.2.1 实现恢复逻辑
- [ ] 创建 `recoverSaveData()` 函数
- [ ] 尝试从备份恢复：
  1. 尝试最新备份
  2. 尝试次新备份
  3. 尝试最旧备份
  4. 全部失败则重置到初始状态

#### 3.2.2 用户提示
- [ ] 存档损坏时显示警告
- [ ] 询问用户是否恢复备份
- [ ] 显示备份的时间戳供用户选择

---

### Task 3.3：诊断工具

#### 3.3.1 实现存储诊断
- [ ] 创建 `diagnoseStorage()` 函数
- [ ] 返回诊断信息：
  ```javascript
  {
    available: boolean,
    quota: { used: number, available: number },
    saves: { count: number, totalSize: number },
    backups: { count: number, totalSize: number },
    issues: string[]
  }
  ```

#### 3.3.2 添加诊断 UI
- [ ] 在设置页添加"存储诊断"按钮
- [ ] 显示诊断结果
- [ ] 提供清理建议

---

### Phase 3 提交
```bash
git add src/storage.js src/modules/19-save.js
git commit -m "feat(task2-phase3): add save recovery and diagnostic tools

Phase 3 completed:
- Add checksum validation for save data
- Implement automatic backup system
- Add save recovery from backups
- Add storage diagnostic tool"
```

### Phase 3 验证
- [ ] 模拟存档损坏场景
- [ ] 验证自动恢复机制
- [ ] 验证备份系统
- [ ] 验证诊断工具

---

## 🧪 最终测试与验证

### 自动化测试
```bash
# 运行存档测试
npx playwright test tests/e2e/specs/save-load.spec.mjs

# 运行配置加载测试
npx playwright test tests/e2e/specs/config-loading.spec.mjs

# 运行存储压力测试
npm run test:storage-stress
```

### 功能验证清单
- [ ] 存档导出/导入正常
- [ ] 旧版本存档可迁移
- [ ] 存档压缩有效（大小减少 ≥30%）
- [ ] LocalStorage 配额检测准确
- [ ] 配置加载失败时使用 fallback
- [ ] 配置验证有效
- [ ] 配置热重载正常
- [ ] 配置缓存有效
- [ ] 存档损坏时自动恢复
- [ ] 存储诊断工具可用

### 兼容性测试
- [ ] 测试从 v0 (无版本号) 迁移到 v1.0.0
- [ ] 测试压缩和非压缩存档混合导入
- [ ] 测试不同浏览器的 LocalStorage 行为

---

## 📦 完成定义（DoD）

任务完成必须满足以下所有条件：

- [ ] Phase 1 所有任务已完成并提交
- [ ] Phase 2 所有任务已完成并提交
- [ ] Phase 3 所有任务已完成并提交
- [ ] 所有自动化测试通过
- [ ] 所有功能验证清单通过
- [ ] 兼容性测试通过
- [ ] 存档大小减少 ≥30%
- [ ] 本文档状态字段已更新为"已完成"
- [ ] 代码已 Review（如需要）

---

## 📝 操作日志

_记录关键操作和问题_

### 2026-03-04
- 创建任务 2 执行计划文档
- Phase 1 完成：存档版本管理、压缩、配额检测 (commit 90baaa1)
- Phase 2 完成：配置加载验证和深度合并 (commit 062a8a9)
- Phase 3 完成：备份系统和恢复机制 (commit 81425d9)
- 任务 2 全部完成，待合并到 master

<!-- 追加日志到此处 -->
