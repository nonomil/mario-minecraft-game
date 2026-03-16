# Release Notes - v1.19.43

**发布日期**: 2026-03-16

## 📋 变更概述
本次发布聚焦“学习效果可视化”与 UI 可用性：新增学习报告入口与本地统计基础，补齐档案/成就相关 UI；同时修复 BOSS 竞技场边界与唤魔者（Evoker）奥术环境的稳定性问题，并加固 E2E 用例，避免 UI 分析流程被随机学习弹窗打断。

## ✨ 新功能
- **学习报告（本地）**: 新增学习报告数据结构与播放时长累计，并在“档案/成就”中加入入口与相关 UI。

## 🐛 Bug 修复
- **BOSS 竞技场**: 进入/更新阶段对 BOSS 位置做边界钳制，避免跑出竞技场范围。
- **奥术环境（Evoker P3）**: 奥术封印帧持续覆盖整个节奏周期，避免出现“封印帧为 0 导致无法触发推离”的边界问题。
- **学习挑战弹窗可访问性**: 学习挑战显示/隐藏时同步 `aria-hidden` 状态。

## 🧪 测试更新
- 稳定短语跟读（follow-up phrase）E2E：将“挑词 + 下一次出词断言”放入同一段同步执行，避免被后台出词打断导致偶发失败。
- 深度 UI 流程测试：启动后主动关闭/禁用随机学习弹窗，避免遮挡 HUD 点击导致超时。

## 📝 文档更新
- 新增“激活码与收费机制”相关方案、案例调研与学习报告落地计划文档（见 `docs/plan/激活码和收费机制/`）。

## 📦 版本元数据
- `version.json` -> `versionCode/buildNumber 95`, `versionName 1.19.43`
- `package.json` -> `1.19.43`
- `android-app/package.json` -> `1.19.43`
- `android-app/android/app/build.gradle` -> `versionCode 95`, `versionName 1.19.43`
- `android-app/web/build-info.json` -> `version 1.19.43`, `buildNumber 95`, `gitCommit 9f5caea`
- `service-worker.js` -> cache `v1.19.43`

## 🎯 下一步计划
- 学习报告 UI：补齐“今日学了哪些词 / 正确率 / 连续天数”等展示与一键分享。
- 变现验证：先小红书导流收集反馈，再决定激活码/订阅/一次性词库包的最小可行收费路径。

---

**完整变更**: 4 commits

