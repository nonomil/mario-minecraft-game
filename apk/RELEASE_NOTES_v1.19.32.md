# Release Notes - v1.19.32

**发布日期**: 2026-03-09

## 📚 词库切换修复

### Legacy 词库 ID 自动迁移
- 修复旧设置和旧账号中仍保存 `vocab.kindergarten`、`vocab.junior_high`、`vocab.minecraft` 等旧词库 ID 时，当前 manifest 无法解析的问题
- 启动、账号恢复、设置保存统一走 canonical pack id 解析链路
- 默认词库改为 `vocab.kindergarten.full`，避免首启时出现“词库数据未就绪”

## 🧪 验证结果

- `node tests/unit/vocab-pack-switch-regression.test.mjs`
- `npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/specs/p0-vocab-pack-switch.spec.mjs`
  - 运行时使用临时端口 `4181`，避开本地已占用端口

## 🔁 版本号同步

- 版本号：`1.19.32`
- `versionCode/buildNumber`：`85`

同步文件：
- `version.json`
- `package.json`
- `android-app/package.json`
- `android-app/web/build-info.json`
- `android-app/android/app/build.gradle`
- `service-worker.js`
- `Game.html`

## 📝 相关 Git 记录

```text
2894e48 fix: resolve vocab pack switching legacy ids
82faa49 release: v1.19.31
```

## 📋 完整变更摘要

1. 修复 legacy 词库 ID 与当前 manifest 脱节导致的切换不生效问题。
2. 默认词库改为有效 canonical ID，并统一启动、账号恢复、设置保存三条链路的词库解析逻辑。
3. 补充词库切换单元与 E2E 回归验证，并同步发布版本元数据。
