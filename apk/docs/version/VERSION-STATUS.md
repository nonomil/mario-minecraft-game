# v1.18.4 版本状态

## 已完成
### 1) 版本号同步
- `apk/package.json`: `1.18.4`
- `apk/android-app/package.json`: `1.18.4`
- `apk/android-app/android/app/build.gradle`: `versionName "1.18.4"`, `versionCode 105`

### 2) 本次重点变更
- 新增去重分析命令：`npm run vocab:db:dedup`
- 新增外部词库导入命令：`npm run vocab:db:import:external`
- 增强外部导入参数兼容性（支持 `npm run` 的位置参数兜底）
- 新增维护文档：`apk/docs/guide/词库数据库维护图文指南.md`

### 3) 已执行验证
- `npm run vocab:db:import`
- `npm run vocab:db:dedup`
- `npm run vocab:db:import:external`（2 次，分别导入 `hermitdave-en50k` 与 `arstgit-10k`）
- `npm run vocab:db:export`
- `npm run vocab:db:validate`
- `npm run vocab:db:publish`

### 4) 验证结果
- active entries: `2981`
- duplicate keys: `0`
- missing chinese: `0`
- publish pipeline: `passed`

---

更新时间：2026-02-18  
状态：已完成
