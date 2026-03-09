# Release Notes - v1.19.33

**发布日期**: 2026-03-09

## 📚 Vocabulary Switching Across Launcher / Offline / APK

- 修复 `启动游戏.bat`、`http://localhost:4173/Game.html`、离线 `android-app/web/index.html` 与 APK 单文件产物中“词库选择已变化，但真实词库数据未变化”的问题。
- `build-singlefile` 现支持从 single-quoted manifest 路径提取词库文件，并强制内联全部本地 `src/*.js` / `words/vocabs/*.js` 脚本。
- 为 `vocab.minecraft.intermediate`、`vocab.minecraft.full`、`vocab.kindergarten.hanzi` 补齐浏览器兼容导出，避免 manifest 命中空全局。
- 设置保存时立即同步 `currentAccount.vocabulary.currentPack`，避免切换后再次启动被旧账号数据覆盖。
- 新增 `dev-reset.html`，启动器会先清理旧 Service Worker / cache 再进入游戏。

## 🧪 Verification

- `node tests/unit/vocab-pack-switch-regression.test.mjs`
- `node tests/unit/offline-vocab-bundle-regression.test.mjs`
- `node tests/unit/launch-game-port-cleanup.test.mjs`
- `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/p0-vocab-pack-switch.spec.mjs tests/e2e/specs/p0-launcher-sw-reset.spec.mjs`
  - 运行时使用临时端口 `4174`
- `file:///.../android-app/web/index.html`
  - `vocab.minecraft.intermediate` => `60` 词，首词 `diamond`
  - `vocab.minecraft.full` => `1163` 词，首词 `air`
  - `vocab.kindergarten.hanzi` => `60` 词，首词 `smile`

## 🔁 版本号同步

- 版本号：`1.19.33`
- `versionCode/buildNumber`：`86`
- 产物构建提交：`55f4659`

同步文件：
- `version.json`
- `package.json`
- `android-app/package.json`
- `android-app/android/app/build.gradle`
- `android-app/web/build-info.json`
- `service-worker.js`
- `Game.html`

## 📝 相关 Git 记录

```text
55f4659 fix: resolve vocab switching in launcher and apk
d931d67 release: v1.19.32
2894e48 fix: resolve vocab pack switching legacy ids
```
