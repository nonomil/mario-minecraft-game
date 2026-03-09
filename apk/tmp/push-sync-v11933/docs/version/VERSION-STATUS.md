# Version Status (2026-03-09)

## Current Baseline
- Local version file: `version.json`
- versionName: **1.19.33**
- versionCode/buildNumber: **86**

## Git State
- Branch: `main`
- Latest fix commit: `55f4659 fix: resolve vocab switching in launcher and apk`
- Previous release commit: `d931d67 release: v1.19.32`
- Previous vocab fix baseline: `2894e48 fix: resolve vocab pack switching legacy ids`

## Records Check
- Updated: `version.json`
- Updated: `package.json`
- Updated: `android-app/package.json`
- Updated: `android-app/android/app/build.gradle`
- Updated: `android-app/web/build-info.json`
- Updated: `docs/version/CHANGELOG.md`
- Updated: `docs/version/Progress.md`
- Updated: `docs/version/VERSION-STATUS.md`
- Updated: `docs/release/release-notes.md`
- Added: `RELEASE_NOTES_v1.19.33.md`
- Added: `docs/release/发布说明-v1.19.33.md`

## Validation Snapshot
- HTTP 启动链路验证通过：`启动游戏.bat` 对应的 reset 页面可清理旧 Service Worker / cache。
- 单文件构建验证通过：离线产物不再残留本地 `src/*.js` / `words/vocabs/*.js` 外链脚本。
- 离线 `file:///.../android-app/web/index.html` 连续切换 `vocab.minecraft.intermediate` / `vocab.minecraft.full` / `vocab.kindergarten.hanzi` 均成功。
- 自动化测试通过：
  - `node tests/unit/vocab-pack-switch-regression.test.mjs`
  - `node tests/unit/offline-vocab-bundle-regression.test.mjs`
  - `node tests/unit/launch-game-port-cleanup.test.mjs`
  - `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/p0-vocab-pack-switch.spec.mjs tests/e2e/specs/p0-launcher-sw-reset.spec.mjs`（临时端口 `4174`）
