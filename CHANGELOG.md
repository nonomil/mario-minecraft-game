# 更新日志

## [1.2.18] - 2026-02-08

### 修复
- **单词库加载问题**：修复 APK 构建时词库文件提取正则表达式错误
  - 更新 `build-singlefile.js` 中的正则表达式，正确匹配 `files` 数组中的文件路径
  - 修复文件：`apk/tools/build-singlefile.js`

- **全屏模式地面位置问题**：修复横屏全屏时地面超出屏幕的问题
  - 将地面高度设置为物品栏上边框位置，确保地面始终在可视区域内
  - 修复文件：`src/main.js`

### 技术改进
- 地面位置计算更加合理，适配不同屏幕尺寸
- 词库文件打包逻辑更加健壮

---

## [1.2.17] - 2026-02-08

### 修复
- **单词库文件路径问题**：解决 APK 中单词库无法加载的问题
  - 所有单词库文件夹和文件名改为英文（避免中文路径在 Android 中的编码问题）
  - 更新 `manifest.js` 中所有文件路径为英文路径
  - 修复文件：`words/vocabs/manifest.js`、所有词库文件

- **全屏显示超出屏幕问题**：修复横屏模式下内容超出屏幕边界的问题
  - 移除 `FLAG_LAYOUT_NO_LIMITS` 标志，避免布局延伸到屏幕外
  - 修复文件：`MainActivity.java`

### 文档
- 同步主项目文档到 `apk/docs` 目录
- 更新 `apk/docs/Progress.md` 版本记录

### 技术改进
- 词库文件命名规范化，提升跨平台兼容性
- 全屏模式更加稳定可靠

---

## [1.2.16] - 2026-02-08

### 修复
- **单词库切换问题深度修复**：彻底解决单词库切换不生效的问题
  - 修复 Manifest 加载时序问题，动态检查 `window.MMWG_VOCAB_MANIFEST`
  - 添加完整的调试日志系统（`[Vocab]`、`[Settings]`、`[Storage]` 标签）
  - 改进错误处理，提供详细的错误信息
  - 修复文件：`src/main.js`

### 新增
- **调试指南文档**：创建 `docs/VOCAB_DEBUG_GUIDE.md`
  - 详细的调试步骤和日志查看方法
  - 常见问题和解决方案
  - 手动测试命令
  - APK 远程调试方法

- **AI 绘图提示词文档**：创建 `docs/AI_ART_PROMPTS.md`
  - 所有游戏角色的 AI 绘图提示词（Steve、僵尸、苦力怕等）
  - 6 个生物群系环境的背景提示词
  - 方块、装饰物、道具的提示词
  - 适配 Google Imagen 3 的优化建议

### 技术改进
- 词库引擎初始化更加健壮
- 设置保存流程更加透明
- 添加详细的控制台日志便于问题排查

---

## [1.2.15] - 2026-02-08

### 修复
- **单词库切换问题深度修复**：彻底解决单词库切换不生效的问题
  - 修复 Manifest 加载时序问题，动态检查 `window.MMWG_VOCAB_MANIFEST`
  - 添加完整的调试日志系统（`[Vocab]`、`[Settings]`、`[Storage]` 标签）
  - 改进错误处理，提供详细的错误信息
  - 修复文件：`src/main.js`

### 新增
- **调试指南文档**：创建 `docs/VOCAB_DEBUG_GUIDE.md`
  - 详细的调试步骤和日志查看方法
  - 常见问题和解决方案
  - 手动测试命令
  - APK 远程调试方法

- **AI 绘图提示词文档**：创建 `docs/AI_ART_PROMPTS.md`
  - 所有游戏角色的 AI 绘图提示词（Steve、僵尸、苦力怕等）
  - 6 个生物群系环境的背景提示词
  - 方块、装饰物、道具的提示词
  - 适配 Google Imagen 3 的优化建议

### 技术改进
- 词库引擎初始化更加健壮
- 设置保存流程更加透明
- 添加详细的控制台日志便于问题排查

---

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
