# Release Notes

## v1.19.29 (2026-03-09)

### 🐛 Bug Fixes
- **APK词汇库切换修复**: 修复Android APK版本中词汇库切换不生效的问题，现在切换词汇库后会立即应用到游戏中

### ✨ Improvements
- **移动端骑龙控制优化**: 
  - 地面时只显示左右移动按键，界面更简洁
  - 骑上末影龙后自动显示上下飞行按键
  - 下龙后上下按键自动隐藏
  - 提升移动端操作体验

### 📦 Technical Changes
- 新增 `13-game-loop-dragon-controls.js` 模块处理触摸控制动态更新
- 优化账号数据加载流程，确保词汇库设置正确同步

---

## v1.19.28 (2026-03-09)

### Fixed
- **BOSS Environment System**: 修复 BOSS 专属环境控制器相关问题
- **Debug Tools**: 改进 GameDebug.html 调试功能
- **E2E Tests**: 增强 BOSS 调试控制的 E2E 测试覆盖

### Changed
- **Release Pipeline**: 强化 publish-main 拉取逻辑，提升发布稳定性
- **Version Documentation**: 完善版本文档管理

---

查看完整更新历史请参考 [CHANGELOG.md](../version/CHANGELOG.md)
