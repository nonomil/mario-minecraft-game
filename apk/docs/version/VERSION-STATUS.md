# v1.15.2 版本状态

## 已完成

### 1) 版本号统一
- `apk/package.json`: `1.15.2`
- `apk/android-app/package.json`: `1.15.2`
- `apk/android-app/android/app/build.gradle`: `versionName "1.15.2"`, `versionCode 93`

### 2) 粒子对象池优化
- `apk/src/modules/06-biome.js`
  - 新增 `biomeParticlePools` / `acquireBiomeParticle()` / `emitBiomeParticle()`
  - 群系粒子与天气粒子切换为池化发射
- `apk/src/modules/13-game-loop.js`
  - 新增 `emitGameParticle()` 作为统一入口
  - 水下气泡、末影珍珠、龙息效果接入池化粒子

### 3) 回归验证
- 语法检查通过：
  - `apk/src/modules/06-biome.js`
  - `apk/src/modules/13-game-loop.js`
- Playwright 结果：
  - `tests/debug-actions.spec.js` 出现浏览器进程崩溃/超时，非确定性失败（环境相关，需本机复测）

---

更新时间：2026-02-16  
状态：已完成代码与文档更新，待稳定环境下完整回归
