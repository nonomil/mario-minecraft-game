# 更新日志

## [1.2.15] - 2026-02-08

### 修复
- **单词库切换问题**：修复设置中切换单词库不生效的问题，现在切换单词库会立即生效
  - 将设置保存函数改为异步，确保词库文件完全加载后再关闭设置面板
  - 修复文件：`src/main.js`

- **横屏全屏适配问题**：修复横屏模式下物品栏和触控按钮被遮挡的问题
  - 物品栏添加安全区域（safe area）支持，避免被虚拟导航栏遮挡
  - 触控按钮（左右两侧）添加安全区域适配
  - Android 端添加刘海屏/挖孔屏支持（LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES）
  - 优化全屏模式，支持更多设备的屏幕适配
  - 修复文件：
    - `src/styles.css` - 物品栏和触控按钮 CSS
    - `apk/android-app/android/app/src/main/java/com/nonomil/mariominecraftgame/MainActivity.java` - 全屏和刘海屏支持
    - `apk/android-app/android/app/src/main/res/values/styles.xml` - 主题全屏配置
    - `apk/android-app/capacitor.config.json` - Capacitor 配置

### 技术改进
- 改进了不同手机型号的屏幕兼容性
- 优化了横屏模式下的 UI 布局

---

## [1.2.14] - 之前版本
- 之前的功能和修复
