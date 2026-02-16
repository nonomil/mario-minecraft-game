# v1.15.3 版本状态

## 已完成

### 1) 版本号同步
- `apk/package.json`: `1.15.3`
- `apk/android-app/package.json`: `1.15.3`
- `apk/android-app/android/app/build.gradle`: `versionName "1.15.3"`, `versionCode 94`

### 2) 村庄功能补齐（v1.8.4）
- `apk/src/modules/18-village.js`
  - 存档石碑完整交互与检查点写入
  - 特色建筑完整交互（6 类）与一次性限制
  - 新增村庄 Buff 存储/判定/过期更新
- `apk/src/modules/18-village-render.js`
  - 存档石碑已存档状态高亮反馈
- `apk/src/modules/06-biome.js`
  - `fireResistance` 接入地狱入场与高温伤害豁免

### 3) 集成测试完善（v1.8.5）
- 新增 `tests/village-integration.spec.js`
  - `village save stone: persists checkpoint`
  - `village special building: one-time use`

### 4) 文档同步
- 更新村庄设计文档实施状态：
  - `apk/docs/development/村庄设计/v1.8.4-存档石碑与特色建筑.md`
  - `apk/docs/development/村庄设计/v1.8.5-集成测试与完善.md`

---

更新时间：2026-02-16  
状态：已完成并提交
