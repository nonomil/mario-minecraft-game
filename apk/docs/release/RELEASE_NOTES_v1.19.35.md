# Release Notes - v1.19.35

**发布日期**: 2026-03-10

## 📋 变更概述

本次发布完成 0309 多线玩法集成收口与版本链路同步，重点落地村庄商人双列卖材料、骑龙触控兼容、合成基础、地下矿洞照明，以及坚守者蛋的掉落 / 售卖 / 召唤。

## ✨ 新功能

- **合成基础台正式接入**：
  - 新增 HUD 合成入口与移动端触控入口
  - 支持材料多选、盾牌 / 火炬配方识别、合成结果预览
  - 盾牌具备减伤与耐久，火炬可放置并扩大矿洞照明范围
- **地下矿洞视觉层上线**：
  - 新增 `cave` 背景与暗区遮罩
  - 支持火炬照明扩圈、洞穴后处理效果与矿洞敌人氛围刷新
  - `cave` 已补入正式群系配置与调试切换链路，不再只停留在视觉模块
- **坚守者蛋玩法接入**：
  - 传奇宝箱掉落池新增 `warden_egg`
  - 商人出售坚守者蛋，价格锁定 `400` 钻石
  - 玩家可直接使用坚守者蛋召唤坚守者，骑龙时仍保持兼容

## 🐛 Bug 修复

- **商人交互回归修复**：
  - 商人屋短按即可进入，不再误判成长按
  - 卖材料第一页与下一页都恢复为双列动作布局
- **骑龙触控回归修复**：
  - 地面左右方向键恢复旧版底部横排双键布局
  - 骑龙后切换为紧凑四键飞行布局
  - 触屏骑龙移动、火球发射、跳跃下龙链路重新验证通过
  - 跳跃下龙后会把主角安全移出龙体碰撞范围，避免“提示已下龙但画面卡住”
- **版本缓存不一致修复**：
  - 统一 `version.json`、`package.json`、Android 版本元数据、`service-worker.js` 与 `Game.html` 资源缓存戳
- **敌人识别度补强**：
  - `drowned / guardian / pufferfish / piglin / bee / spore_bug / magma_cube / fire_spirit / sculk_worm / shadow_stalker` 改为专用像素剪影

## 🔧 优化改进

- 新增 `docs/release/WORKFLOW.md`，补齐发版流程说明。
- 整理 `docs/development/0309/` 下 A/B/C/D/E 各 lane 的实施文档与勾选状态。
- E2E 断言改为验证“火球生成且冷却进入有效区间”，避免卡死在单帧数值。

## 📝 文档更新

- 新增：
  - `docs/development/0309/0309-V2-A-村庄商人实施.md`
  - `docs/development/0309/0309-V2-B-骑龙控制实施.md`
  - `docs/development/0309/0309-V2-C-合成基础实施.md`
  - `docs/development/0309/0309-V2-D-地下矿洞实施.md`
  - `docs/development/0309/0309-V2-E-集成收口实施.md`
- 更新：
  - `docs/release/release-notes.md`
  - `docs/version/CHANGELOG.md`
  - `docs/version/Progress.md`
  - `docs/version/VERSION-STATUS.md`

## 🧪 验证结果

- `node tests/unit/village-ui-regression.test.mjs`
- `node tests/unit/dragon-summon-regression.test.mjs`
- `node tests/unit/crafting-foundation-regression.test.mjs`
- `node tests/unit/cave-biome-lighting-regression.test.mjs`
- `node tests/unit/warden-egg-regression.test.mjs`
- `node tests/unit/enemy-renderer-regression.test.mjs`
- `node tests/unit/dev-cache-busting-regression.test.mjs`
- `MMWG_E2E_PORT=4200 npx playwright test tests/e2e/specs/p0-village-trader-sell-grid.spec.mjs tests/e2e/specs/p0-village-wordhouse-trigger.spec.mjs --config=tests/e2e/playwright.config.mjs`
- `MMWG_E2E_PORT=4201 npx playwright test tests/e2e/specs/p1-summon-dragon-and-gunpowder.spec.mjs tests/e2e/specs/p1-crafting-foundation.spec.mjs --config=tests/e2e/playwright.config.mjs`
- `MMWG_E2E_PORT=4202 npx playwright test tests/e2e/specs/p1-cave-lighting.spec.mjs tests/e2e/specs/p1-warden-egg-integration.spec.mjs --config=tests/e2e/playwright.config.mjs`
- `MMWG_E2E_PORT=4205 npx playwright test tests/e2e/specs/p1-summon-dragon-and-gunpowder.spec.mjs tests/e2e/specs/p1-cave-lighting.spec.mjs --config=tests/e2e/playwright.config.mjs`

## 🎯 下一步计划

- 使用 `push.bat` 推送当前 `main`，触发后续同步与构建流程。
- 继续在主线上推进小学英语 MVP 与汉语模式的后续任务。

---

**完整变更（自 v1.19.34 以来）**:
- `d308f87 checkpoint: 00:28`
- `88f8b20 docs: add comprehensive release workflow guide`
- `fb28129 feat: integrate lane e release gate`
- `8fd8de0 feat: add release-and-push skill for automated version releases`
- `874800d docs: add release notes management guide`
- `142d733 chore: reorganize release notes to docs/release directory`
- `176bb90 checkpoint: 23:45`
