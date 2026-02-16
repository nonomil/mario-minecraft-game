# v1.15.4 版本状态

## 已完成

### 1) 版本号同步
- `apk/package.json`: `1.15.4`

### 2) 环境机制补齐（步骤1 / v1.6.6）
- `apk/src/modules/01-config.js`
  - 新增 `sculk_vein` / `echo_shard` 物品定义与背包分类
  - 新增 `silentBootsState`（静音鞋装备与耐久状态）
- `apk/src/modules/13-game-loop.js`
  - 新增配方：`silent_boots: { sculk_vein: 5 }`
  - 新增幽匿碎片使用入口（制作静音鞋）
  - 深暗噪音事件改为按动作类型上报（jump/attack/hurt/use_item）
- `apk/src/modules/20-enemies-new.js`
  - 新增静音鞋减噪与耐久消耗逻辑
  - `addDeepDarkNoise(amount, source, actionType)` 支持动作类型降噪
- `apk/src/modules/06-biome.js`
  - 新增天空群系风场系统（左风/右风/上升气流）
  - 新增风场区域粒子、边界可视化与循环回收
  - 新增上升气流奖励云平台与宝箱投放
- `apk/src/modules/14-renderer-main.js`
  - 接入 `renderSkyWindZones()` 渲染入口

### 3) 文档与版本记录同步
- `apk/docs/version/CHANGELOG.md`
  - 新增 `v1.15.4` 发布记录
- `apk/docs/version/Progress.md`
  - 新增 `v1.15.4` 进度条目（versionCode 95）
- `apk/docs/development/环境分析与优化/环境问题--分析.md`
  - 修正步骤状态：步骤1由“未实现”更新为“部分实现”

---

更新时间：2026-02-16  
状态：已完成
