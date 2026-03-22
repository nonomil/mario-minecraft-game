# Release Notes - v1.19.47

**发布日期**: 2026-03-22

## 📋 变更概述
本次版本修复了 APK 构建中登录弹窗无法显示的严重问题。问题根因是 JavaScript 变量声明顺序错误导致的启动流程中断。

## 🐛 Bug 修复

### fix(events): 修复 optLanguageMode 变量声明顺序问题
- **问题**: `src/modules/16-events.js` 第 64-65 行在 `optLanguageMode` 变量声明（第 77 行）之前就访问了该变量，触发 JavaScript 暂时性死区错误 `Cannot access 'optLanguageMode' before initialization`，导致整个游戏启动流程中断
- **修复**: 将 `optLanguageMode` 的声明移到使用它的地方之前（第 57 行），与其他 DOM 元素查询放在一起
- **影响**: 修复后登录弹窗和开始覆盖层正常显示

### fix(apk): 同步最新构建到 android-app/web/index.html
- **问题**: `android-app/web/index.html` 文件未同步最新构建，比 `out/Game.offline.html` 少了约 400KB 代码
- **修复**: 运行 `scripts/sync-web.js` 重新同步文件
- **验证**: 文件大小一致（5,295,704 bytes），登录相关组件检查通过

## 🔧 优化改进
- 代码结构优化：将 DOM 元素查询集中在一起，避免变量声明顺序问题

## 📝 文档更新
- `docs/plan/plan-2026-03-22-apk-login-fix-requirements.md` - APK 登录问题修复需求文档

## 🎯 下一步计划
- 继续监控 APK 构建流程，确保同步脚本正常工作
- 考虑添加自动化测试验证单文件构建完整性

---

**完整变更**: 2 个有效提交（过滤 checkpoint）
**主要文件**: `src/modules/16-events.js`, `android-app/web/index.html`
