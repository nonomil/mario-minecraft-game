# Version Status (2026-03-06)

## Current Baseline
- Local version file: `apk/version.json`
- versionName: **1.19.11**
- versionCode/buildNumber: **66**

## Git State
- Branch: `main`
- Includes font size optimization for overlays, scrollbars for long content, and 10s quiz hint delay.
- Previous (v1.19.10): Consumable Equipment System, Long-Press mechanism, and Debuff system integration.


## Records Check
- Updated: `apk/docs/version/CHANGELOG.md`
- Updated: `apk/docs/version/VERSION-STATUS.md`
- Updated: `apk/docs/version/Progress.md`
- Updated: `apk/docs/release/release-notes.md`
- Added/Updated: `apk/docs/release/发布说明-v1.19.9.md`

## Validation Snapshot
- 单文件构建链路通过（不残留 `src/modules/*` 外链脚本）。
- APK 构建与发布由 GitHub Actions 执行并产出 release apk。
