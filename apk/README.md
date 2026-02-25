# 马里奥×我的世界 单词冒险（Android APK）

基于横版过关玩法，融合“我的世界”主题元素，把英语单词学习放进战斗与收集流程。项目使用 Capacitor 打包为 Android APK，并提供自动化构建与发布流程。

## 主要功能
- 横版闯关 + 单词学习卡片 + 词库轮换
- 触摸按键与键盘操作并存，支持手机/平板显示模式
- 本地构建与 GitHub Actions 在线构建

## 目录结构（仓库根：apk/）
- `Game.html`：游戏入口页面
- `src/`：核心逻辑与样式
- `config/`：关卡、词库与控制配置
- `scripts/sync-web.js`：生成离线单文件并同步到 `android-app/web/index.html`
- `android-app/`：Capacitor 与 Android 工程
- `.github/workflows/android.yml`：CI 构建与发布

## 环境要求
- Node.js 22+
- JDK 21（CI 使用 Temurin 21）
- Android SDK（本地构建需要，CI 会自动安装）

## 本地构建流程
1. 安装依赖
   - `cd android-app && npm ci`
2. 生成离线单文件并同步到 Android Web 目录
   - `cd .. && node scripts/sync-web.js`
3. 同步到 Android 工程
   - `cd android-app && npx cap sync android`
4. 构建 APK
   - 在 `android-app/android/local.properties` 配置 `sdk.dir=...`
   - `cd android-app/android && ./gradlew assembleDebug`

## 设备模式与触控
- 默认 `deviceMode` 为 `auto`
- 触控按键布局与 UI 缩放在 `src/styles.css` 与 `Game.html` 中配置
- 设置面板可切换手机/平板与横竖屏显示模式

## GitHub Actions（在线构建）
- workflow：`.github/workflows/android.yml`
- 构建产物：
  - Debug：`android-app/android/app/build/outputs/apk/debug/*.apk`
  - Release：`android-app/android/app/build/outputs/apk/release/*.apk`
- 发布位置：`apk-latest` Release（同名 tag 更新、资产替换）

## Release 签名（可选）
在仓库 Settings → Secrets 中添加：
- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

配置齐全后会发布可覆盖安装的 release APK；未配置时发布 debug APK。
