# v1.17.0 版本状态

## 已完成

### 1) 版本号同步
- `apk/package.json`: `1.17.0`
- `build.gradle`: `versionName "1.17.0"`, `versionCode 100`

### 2) 群系难度分级（P1-1）
- `apk/src/modules/06-biome.js` - 新增 biomeVisitCount 轮次追踪、getBiomeVisitRound()、resetBiomeVisitCount()
- `apk/config/biomes.json` - 6 个群系新增 enemyTiers 分层表（cherry_grove/mushroom_island/ocean/volcano/nether/deep_dark）
- `apk/src/modules/11-game-init.js` - spawnEnemyByDifficulty() 读取 enemyTiers 覆盖敌人池

### 3) 群系时长调整（P1-2）
- `apk/config/biomes.json` - switch.minStay 配置 12 个群系的最小停留分数和时间
- `apk/src/modules/06-biome.js` - 新增 biomeEntryScore/biomeEntryTime 追踪、canLeaveBiome() 守卫
- updateCurrentBiome() 切换前检查 canLeaveBiome()

### 4) 海洋生态修正（P1-3）
- `apk/src/modules/15-entities-combat.js` - 海洋中 creeper 不爆炸直接消失
- `apk/src/modules/11-game-init.js` - 海洋群系排除 creeper 生成
- `apk/src/modules/15-entities-decorations.js` - 新增 LargeSeaweed、CoralDecor 类
- `apk/src/modules/14-renderer-decorations.js` - 新增 drawLargeSeaweed()、drawCoralDecor()
- `apk/config/biomes.json` - ocean 装饰新增 large_seaweed、coral

### 5) 火山贴地修正（P1-4）
- `apk/src/modules/21-decorations-new.js` - ObsidianPillar y = groundY - height

### 6) 单词挑战 UI 修正（P1-5）
- `apk/src/modules/12-challenges.js` - 选项按钮自适应字号
- `apk/src/styles.css` - word-break/overflow-wrap/min-height 优化

### 7) Playwright 测试（P1-T）
- `tests/p1-experience.spec.js` - 群系分级/停留/海洋/挑战UI 验证

---

更新时间：2026-02-17
状态：已完成
