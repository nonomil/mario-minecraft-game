# Phase 1 执行计划（兼容版，逐文件实施清单）

> 日期：2026-03-05  
> 范围：P0 稳定与门禁（不破坏现有 manifest/pack 运行时）  
> 预计：5-8 个工作日

---

## 0. 目标与边界

### 目标

1. 固化词库数据门禁（publish/validate/audit）  
2. 让校验结果可供老师直接理解和修复  
3. 优化 `storage.js` 的容量与兼容性  
4. 保持 `src/modules/09-vocab.js` 主链行为不变

### 明确不做

1. 不替换 `ensureVocabEngine()` 为纯 CSV 异步引擎  
2. 不引入 CDN 依赖作为核心运行路径  
3. 不迁移到 IndexedDB（留到后续 Phase）

---

## 1. 任务分解总览

1. Task 1.1：数据门禁固化（`package.json`, `tools/vocab-db/*`）  
2. Task 1.2：校验规则现实化（`tools/vocab-db/validate.mjs`, `tools/vocab-db/rules/*`）  
3. Task 1.3：老师可读校验输出（`tools/vocab-db/admin.html`, `tools/vocab-db/admin-server.mjs`）  
4. Task 1.4：存储容量与兼容增强（`src/storage.js`）  
5. Task 1.5：回归验证与发布闸门（`tests/e2e/*`, `docs/version/CHANGELOG.md`）

---

## 2. 逐任务执行清单

## Task 1.1：数据门禁固化

### 修改文件

1. `package.json`  
2. `tools/vocab-db/publish.mjs`（如需）  
3. `tools/vocab-db/README.md`

### 实施步骤

1. 确认 `build` 前执行 `vocab:db:publish`（失败阻断）  
2. 统一 publish 输出目录和命名  
3. 将门禁规则写入 README，明确“何种问题阻断发布”

### 验收命令

```bash
npm run vocab:db:publish
echo %errorlevel%
```

### 验收标准

1. publish 成功时返回码为 0  
2. 校验失败时返回码非 0，构建停止  
3. 报告文件落在统一目录（`words/db/reports`）

---

## Task 1.2：校验规则现实化

### 修改文件

1. `tools/vocab-db/validate.mjs`  
2. `tools/vocab-db/rules/audit-rules.json`（如需）  
3. `tools/vocab-db/README.md`

### 设计要求

1. `difficulty` 校验支持现状值（含 `external`）  
2. 空字段分级：`BLOCKER` 与 `WARNING` 分离  
3. 输出结构中必须包含：`field`, `severity`, `message`, `rowId/source`

### 实施步骤

1. 在 validate 中引入“可配置枚举 + 默认枚举”  
2. 将“缺失中文”从一刀切失败改为可配置策略  
3. 输出 JSON 报告时增加聚合统计（按 severity、按字段）

### 验收命令

```bash
npm run vocab:db:validate
```

### 验收标准

1. 报告可区分阻断错误与警告  
2. 报告可定位问题行（至少到 `id`）  
3. 与当前数据基线一致，不出现大面积误报

---

## Task 1.3：老师可读校验输出

### 修改文件

1. `tools/vocab-db/admin.html`  
2. `tools/vocab-db/admin-server.mjs`（若需要新增 API）

### 功能点

1. 在 UI 展示“错误类型说明”和“修复建议”  
2. 支持导出当前错误列表（CSV/JSON 至少一种）  
3. 搜索和筛选支持按 `severity`、`status`

### 实施步骤

1. 在 admin 页面新增“校验结果”卡片  
2. 新增后端接口（如 `/api/validate-report`）读取最新报告  
3. 前端渲染错误条目并提供导出按钮

### 验收命令

```bash
npm run vocab:db:admin
```

手工验收：

1. 打开 `http://127.0.0.1:4174`  
2. 能看到校验摘要和错误列表  
3. 导出文件可被 Excel 打开

---

## Task 1.4：storage 容量与兼容增强

### 修改文件

1. `src/storage.js`

### 涉及函数

1. `loadJson(key, fallback)`  
2. `saveJson(key, value)`  
3. `compressSaveData(str)`  
4. `decompressSaveData(str)`  
5. `exportSaveCode()` / `importSaveCode(code)`

### 实施步骤

1. `saveJson` 增加“压缩开关 + 异常日志上下文”  
2. `loadJson` 先判定普通 JSON，再尝试解压，最后 fallback  
3. 增加 `getStorageUsage()`（统计 `mmwg*` 占用）  
4. 增加容量阈值告警（例如 80% 警告）  
5. 保证旧存档可读，不触发迁移崩溃

### 验收步骤

1. 创建旧格式数据并验证读取  
2. 保存压缩数据并验证读取  
3. 执行导出后再导入，关键数据一致  
4. 本地存储接近阈值时出现告警信息

### 验收标准

1. 兼容旧数据与新数据  
2. 存档导入导出成功率 100%（正常输入）  
3. 出错时有明确日志，不静默失败

---

## Task 1.5：回归验证与发布闸门

### 修改文件

1. `tests/e2e/specs/*`（新增或更新）  
2. `docs/version/CHANGELOG.md`

### 回归范围

1. 词库选择与自动轮换  
2. 开局词卡加载  
3. 存档导出/导入  
4. 自定义词库导入（文本/文件）

### 验收命令

```bash
npm run test:e2e -- ui-analysis.spec.mjs
npm run vocab:db:publish
```

### 发布闸门（必须全满足）

1. e2e 回归通过  
2. vocab publish 通过  
3. CHANGLELOG 记录本次范围与已知限制

---

## 3. 交付物清单

1. 代码：`src/storage.js`, `tools/vocab-db/*`, `package.json`（按实际变更）  
2. 报告：`words/db/reports/*` 最新校验与审计产物  
3. 文档：本执行计划 + `docs/version/CHANGELOG.md`

---

## 4. 回滚策略

1. 运行时异常：保持 `src/modules/09-vocab.js` 现有路径，关闭新开关  
2. 校验误报：回退规则文件并保留报告样本  
3. 存档兼容异常：回退 `storage.js` 修改，使用导出码恢复数据

---

## 5. 每日执行节奏（建议）

1. Day 1：Task 1.1 + 1.2  
2. Day 2：Task 1.3  
3. Day 3：Task 1.4  
4. Day 4：Task 1.5 + 回归修复  
5. Day 5：缓冲与发布准备

---

## 6. 完成定义（DoD）

满足以下全部即视为 Phase 1 完成：

1. `npm run vocab:db:publish` 可稳定作为闸门  
2. 校验报告对老师可读可修复  
3. `storage.js` 兼容旧数据并具备容量告警  
4. 核心词库运行路径无行为回归  
5. 变更已写入版本文档

