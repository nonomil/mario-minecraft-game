# `apk/push.bat` 代理/直连推送 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 让 `apk/push.bat` 的输出全中文，并支持“自动检测 127.0.0.1:1080 + 可选择代理/直连”的推送模式，且在 fetch 失败时不误判“无需推送”。

**Architecture:** 在 batch 内新增参数解析与交互式菜单；通过 PowerShell 检测 1080 端口决定 auto 模式；加入 `--dry-run` 让脚本可以在不依赖网络时做确定性自检。

**Tech Stack:** Windows batch (`.bat`)、Git CLI、PowerShell（端口检测与输出捕获）。

---

### Task 1: 写一个会失败的自检脚本（TDD）

**Files:**
- Create: `apk/tools/push-bat-selftest.ps1`

**Step 1: Write the failing test**

`apk/tools/push-bat-selftest.ps1`（最小化版本，先写期望但现在会失败）：

```powershell
$ErrorActionPreference = "Stop"

function Run-Cmd($args) {
  $p = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $args -NoNewWindow -Wait -PassThru -RedirectStandardOutput "$env:TEMP\\pushbat.out" -RedirectStandardError "$env:TEMP\\pushbat.err"
  $out = Get-Content -Raw "$env:TEMP\\pushbat.out"
  $err = Get-Content -Raw "$env:TEMP\\pushbat.err"
  return @{ ExitCode = $p.ExitCode; Out = $out; Err = $err }
}

$r = Run-Cmd "apk\\push.bat --mode auto --dry-run"
if ($r.Out -notmatch "自动检测") { throw "expected Chinese mode output" }
if ($r.Out -notmatch "127\\.0\\.0\\.1:1080") { throw "expected proxy address in output" }
```

**Step 2: Run test to verify it fails**

Run: `powershell -ExecutionPolicy Bypass -File apk/tools/push-bat-selftest.ps1`
Expected: FAIL（因为当前 `apk/push.bat` 还不支持 `--mode/--dry-run`，也没有“自动检测”等中文提示）。

---

### Task 2: 在 `apk/push.bat` 增加参数解析 + 全中文输出

**Files:**
- Modify: `apk/push.bat`

**Step 1: Write the failing test**
- 已有：Task 1

**Step 2: Run test to verify it fails**
- 已有：Task 1

**Step 3: Write minimal implementation**
- 增加参数：
  - `--mode auto|proxy|direct`
  - `--dry-run`
- 输出文本全部中文化（保留 Actions URL 等）。
- `fetch` 失败时不要误判 “Nothing to push”。

**Step 4: Run test to verify it passes**
Run: `powershell -ExecutionPolicy Bypass -File apk/tools/push-bat-selftest.ps1`
Expected: PASS

**Step 5: Commit**
```bash
git add apk/push.bat apk/tools/push-bat-selftest.ps1
git commit -m "feat(apk): push.bat 支持代理/直连选择与自动检测"
```

---

### Task 3: 实现 1080 端口自动检测 + 模式选择菜单

**Files:**
- Modify: `apk/push.bat`
- Modify: `apk/tools/push-bat-selftest.ps1`

**Step 1: Write failing test**
- 在 `apk/tools/push-bat-selftest.ps1` 增加两个用例：
  1) 未监听 1080 时，`--mode auto --dry-run` 应选择直连路径
  2) 监听 1080 时，`--mode auto --dry-run` 应选择代理路径

**Step 2: Run test to verify it fails**
Run: `powershell -ExecutionPolicy Bypass -File apk/tools/push-bat-selftest.ps1`
Expected: FAIL

**Step 3: Write minimal implementation**
- 在 `apk/push.bat` 内实现端口检测（PowerShell TCP connect）。
- 在无 `--mode` 时，显示菜单（默认 auto）。
- 在 `--dry-run` 时不执行 git，仅打印将执行的命令序列。

**Step 4: Run test to verify it passes**
Run: `powershell -ExecutionPolicy Bypass -File apk/tools/push-bat-selftest.ps1`
Expected: PASS

**Step 5: Commit**
```bash
git add apk/push.bat apk/tools/push-bat-selftest.ps1
git commit -m "feat(apk): push.bat 自动检测 1080 并支持 dry-run 自检"
```

---

### Task 4: 手动验证（真实推送前）

**Files:**
- None

**Step 1: Verify dry-run output**
Run: `cmd /c apk\\push.bat --mode auto --dry-run`
Expected: 中文输出、模式正确、打印 git 命令但不执行。

**Step 2: Verify real push path (optional)**
Run: `cmd /c apk\\push.bat`
Expected: 能根据代理状态选择路径并推送（取决于网络/认证）。

