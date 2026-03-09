# APK 签名配置（GitHub Actions）

目标：让 `apk/.github/workflows/android.yml` 在 Actions 里构建 **可更新** 的 `assembleRelease`（稳定签名），并自动更新 Releases 里的 `apk-latest`。

## 1) 本地生成 keystore + base64

前置：本机可运行 `keytool`（安装 JDK / Android Studio 一般就有）。

在 `apk/` 目录运行：

```powershell
.\tools\create-release-keystore.ps1 -Alias "mario-minecraft-game"
```

脚本会生成：
- `apk/apks/release.keystore`
- `apk/apks/release.keystore.base64.txt`

## 2) 填到 GitHub（Secrets 优先，Variables 也兼容）

进入仓库：
`Settings -> Secrets and variables -> Actions`

推荐填在 **Secrets**（敏感信息）。如果你之前填在 **Variables**，当前工作流也会兼容读取，但仍建议迁移到 Secrets。

需要 4 个键：
- `ANDROID_KEYSTORE_BASE64`：把 `apk/apks/release.keystore.base64.txt` 的内容整段粘贴进去（不要带多余换行/空格也行）
- `ANDROID_KEYSTORE_PASSWORD`：生成时输入的 store password（你选的密码）
- `ANDROID_KEY_ALIAS`：上面脚本的 `-Alias`（例如 `mario-minecraft-game`）
- `ANDROID_KEY_PASSWORD`：生成时输入的 key password（可以与 store password 相同）

## 3) 触发并验证

推送一次 commit 到 `main`，或在 Actions 里手动 `Run workflow`。

成功后你应该能看到：
- Actions 日志里执行了 `assembleRelease`
- `Releases` 页面自动出现/更新 `apk-latest`，里面有 `app-release.apk`

## 常见问题

1) **必须卸载才能更新**
- 典型原因：之前安装过 debug 签名 APK、或每次用不同 keystore 签名。
- 结论：从现在开始只要一直用同一套 `release.keystore` 签名 + `versionCode` 递增，后续更新就不需要卸载。

2) **日志提示 Missing signing secrets**
- 说明 Actions 没读到 4 个值（Secrets 或 Variables 任一处）。
- `apk/.github/workflows/android.yml` 会在日志里打印“哪些字段缺失”（不打印具体值），按提示补齐即可。

