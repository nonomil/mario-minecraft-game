# Release Notes - v1.19.44

**发布日期**: 2026-03-18

## 📋 变更概述
本次发布聚焦“幼小衔接/桥接学习体验”与“战斗与学习流程稳定性”：完善登录阶段的年级/范围选择与桥接词库扩展，补齐词库审计与回归测试；同时修复 BOSS 竞技场与学习弹窗的稳定性问题，并对盾牌与拼音测验交互进行一致性调整。

## ✨ 新功能
- **年级/范围选择**: 登录阶段新增学习范围选择 UI，强化账号侧的学习范围控制。
- **桥接词库扩展与审计**: 扩充桥接词库与清单联动，新增词库审计脚本与阈值回归覆盖。

## 🐛 Bug 修复
- **BOSS 竞技场/弹窗稳定性**: 修复竞技场边界与学习弹窗交互导致的流程不稳定问题，恢复龙竞技场渲染基线。
- **词库加载**: 修复汉字词库在特定场景下的重载报错，提升切换稳定性。

## 🔧 优化改进
- **Shield Balance**: 调整盾牌表现与使用节奏，并对拼音测验/护盾交互做一致性修复。

## 🧪 测试更新
- 新增桥接词库/学习范围/复活与 BOSS roster 等回归用例。
- 强化 BOSS 调试控制与龙竞技场相关 E2E 覆盖，降低 UI 流程被随机弹窗打断的概率。

## 📦 版本元数据
- `version.json` -> `versionCode/buildNumber 96`, `versionName 1.19.44`
- `package.json` -> `1.19.44`
- `android-app/package.json` -> `1.19.44`
- `android-app/android/app/build.gradle` -> `versionCode 96`, `versionName 1.19.44`
- `android-app/web/build-info.json` -> `version 1.19.44`, `buildNumber 96`, `gitCommit 77cb316`
- `service-worker.js` -> cache `v1.19.44`
- `Game.html` -> cache busting query param `v=1.19.44`

---

**完整变更**: 1 commit since 77cb316 (release v1.19.43)
