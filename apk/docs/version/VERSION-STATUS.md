# v1.18.0 版本状态

## 已完成

### 1) 版本号同步
- `apk/package.json`: `1.18.0`
- `apk/android-app/package.json`: `1.18.0`
- `apk/android-app/android/app/build.gradle`: `versionName "1.18.0"`, `versionCode 101`

### 2) 凋零视觉与攻击优化（P2-1）
- `apk/src/modules/15-entities-boss.js`
  - 凋零重绘为三头 T 形骨架，新增阶段配色和裂纹演出
  - 投射物渲染改为凋零之首风格（普通/追踪配色区分）
  - 冲撞攻击新增冲击波效果

### 3) 其他 BOSS 视觉优化（P2-2）
- `apk/src/modules/15-entities-boss.js`
  - 恶魂：方形主体 + 9 条触手 + 攻击/哭泣状态表情
  - 烈焰人：发光核心 + 12 根环绕烈焰棒 + 火焰粒子增强
  - 凋零骷髅：高瘦骨架 + 挥剑动作 + 蓝色护盾 + 煤灰粒子

### 4) 统一阶段反馈
- `apk/src/modules/15-entities-boss.js`
  - 阶段切换统一注入 30 帧短暂无敌
  - 新增阶段提示条和屏幕闪白反馈
  - bossArena 弹幕渲染支持 BOSS 自定义弹幕绘制

### 5) Playwright 测试（P2-T）
- `tests/p2-wither-boss.spec.js`
- `tests/p2-boss-visual.spec.js`
- 结果：`npm test -- tests/p2-wither-boss.spec.js tests/p2-boss-visual.spec.js` 通过（4/4）

---

更新时间：2026-02-17
状态：已完成
