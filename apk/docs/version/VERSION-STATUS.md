# v1.18.2 版本状态

## 已完成

### 1) 版本号同步
- `apk/package.json`: `1.18.2`
- `apk/android-app/package.json`: `1.18.2`
- `apk/android-app/android/app/build.gradle`: `versionName "1.18.2"`, `versionCode 103`

### 2) Bug 修复与体验优化（游戏优化-0217-2）
- 草方块碰撞卡死修复：侧向碰撞仅阻挡朝平台方向移动（`13-game-loop.js`）
- 默认启用中文朗读：`defaults.js` + `09-vocab.js` fallback 改为 `true`
- 长词/短语选项自适应缩放：按文本长度动态缩小字体（`12-challenges.js`）
- 南瓜+雪块宝箱同出：掉出南瓜时自动补 2 个 snow_block（`15-entities-base.js`）
- 樱花低分禁止中毒：新增 `canApplyPoisonEffect()` 分数 < 600 禁止（`20-enemies-new.js`）
- 村庄交互重构：`getNearbyBuilding()` + 建筑交互提示（`18-village.js` / `18-village-render.js`）
- 词组打乱顺序保留空格 + 缩小字体（`12-challenges.js` / `styles.css`）

### 3) 测试
- `tests/requirements.spec.js` 扩展用例覆盖上述修复

### 4) 文档与杂项
- 修正 `02-总体执行计划.md` P0/P1/P3 Git Commit 列
- 清理 `GameDebug.html` 死代码

---

更新时间：2026-02-18
状态：已完成
