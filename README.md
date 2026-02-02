# Android APK（Capacitor）在线构建与发布

基于马里奥的横版过关游戏，融合我的世界主题元素，在游戏中学习英语单词。支持 Android 平台，可在线自动编译 APK。A side-scrolling platformer inspired by Super Mario, featuring Minecraft-themed graphics and integrated English vocabulary learning gameplay. Built for Android with automated APK compilation.

## 目标
- 将 `apk/` 下的 HTML + JS 游戏通过 Capacitor 打包为 Android APK
- 支持手机/平板显示模式切换（`deviceMode: auto/mobile/tablet`）
- GitHub Actions 在 `main` 变更或手动触发时自动构建 Debug/Release APK，并发布到 `apk-latest` Release

## 目录结构（仓库根即 apk/）
- `src/`、`config/`、`words/`：游戏源码与资源
- `tools/build-singlefile.js`：生成离线单文件到 `out/Game.offline.html`
- `scripts/sync-web.js`：生成离线单文件并同步到 `android-app/web/index.html`
- `android-app/`：Capacitor 项目与 Android 工程
- `.github/workflows/android.yml`：CI 构建与发布流程

## 环境要求
- Node.js 20+（Capacitor CLI 需要）
- JDK 21（CI 使用 Temurin 21；本地可用系统 JDK 21 或仓库内的 `.jdk/temurin21`）
- 本地构建需要 Android SDK（CI 会自动安装）

## 本地流程
1. 安装依赖
   - `cd android-app && npm ci`
2. 生成离线单文件并同步到 Capacitor webDir
   - `cd .. && node scripts/sync-web.js`
3. 同步到 Android 工程
   - `cd android-app && npx cap sync android`
4. 本地构建 APK（需要已安装 Android SDK）
   - 在 `android-app/android/local.properties` 配置 `sdk.dir=...`（该文件不提交）
   - `cd android-app/android && ./gradlew assembleDebug`

## 设备模式
- 默认 `deviceMode` 为 `auto`（见 `src/defaults.js`）
- UI 中可切换手机/平板模式，主要影响缩放与触控控件显示（见 `src/main.js`、`Game.html`）

## GitHub Actions（在线构建）
- workflow：`.github/workflows/android.yml`
- 构建产物：
  - Debug：`android-app/android/app/build/outputs/apk/debug/*.apk`
  - Release（未签名）：`android-app/android/app/build/outputs/apk/release/*.apk`
- 发布位置：`apk-latest` Release（同名 tag 会被更新）

## Release 签名（可选）
在仓库 Settings → Secrets 中添加：
- `ANDROID_KEYSTORE`（base64）
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

workflow 可通过 `-Pandroid.injected.signing.*` 参数注入签名信息进行 Release 构建与发布。
