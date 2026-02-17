# v1.15.7 版本状态

## 已完成

### 1) 版本号同步
- `apk/package.json`: `1.15.7`
- `build.gradle`: `versionName "1.15.7"`, `versionCode 98`

### 2) 樱花丛林/蘑菇岛卡死修复
- `apk/src/modules/21-decorations-new.js`
  - GiantMushroom.onCollision(): gravity 取值加完整类型检查（fallback 0.2）+ NaN 防护
  - incrementMushroomBounce 调用加 try-catch，防止交互链异常中断主循环
  - HotSpring.update(): steamParticles 防御性初始化
  - renderHotSpring(): steamParticles null 安全访问

### 3) 架构层护栏
- `apk/src/modules/14-renderer-main.js`
  - RAF 循环加顶层 try-catch：异常时 paused=true + setOverlay("error")
  - 不重试，避免持续异常刷爆日志

### 4) 全流程遍历测试
- `tests/biomes-fullrun.spec.js`
  - cherry_grove: 8 秒持续行走 + 切换到 snow 验证
  - mushroom_island: 8 秒持续行走 + 切换到 mountain 验证
  - 19/19 测试全部通过

---

更新时间：2026-02-17
状态：已完成
