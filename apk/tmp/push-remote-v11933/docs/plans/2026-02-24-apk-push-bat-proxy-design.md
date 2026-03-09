# `apk/push.bat` 代理/直连推送脚本设计

**背景**
- 当前脚本 `apk/push.bat` 具备基础的 fetch + push + 重试逻辑，但输出多为英文、代理写死且缺少“自动检测 + 可选择模式”的交互。
- 另外在 `fetch` 失败的情况下，脚本可能误判 Ahead/Behind 为 0，从而错误提示“Nothing to push”并退出。
- 分支对比逻辑固定对比 `origin/main...HEAD`，但没有显式确认当前分支是否 `main`，提示可能误导。

**目标**
1. 命令行输出全部改为中文提示（保留必要的 URL/命令）。
2. 支持三种模式：自动检测（推荐）、强制代理、强制直连。
3. 自动检测：仅检测本地代理 `127.0.0.1:1080` 是否可用（用户选择 A）。
4. 逻辑更稳：`fetch` 失败时不做“Nothing to push”误判；在非 `main` 分支运行时给出明确提示。
5. 可验证：提供一个不依赖真实网络/认证的“自检/干跑(dry-run)”路径，用于回归验证脚本行为。

**非目标**
- 不做系统代理（WinHTTP）或 Git 全局代理配置的读取/写入。
- 不引入 SSH 推送或 GitHub Desktop 逻辑（仅保持 HTTPS 推送重试策略）。

**交互设计**
- 默认交互式菜单（可用 `choice`），选项：
  1) 自动检测（推荐）
  2) 强制代理（127.0.0.1:1080）
  3) 强制直连
- 支持参数覆盖（用于无交互/自检）：
  - `--mode auto|proxy|direct`
  - `--dry-run`（不执行 git 命令，仅打印将要执行的命令，便于测试）

**代理检测（A）**
- 通过 PowerShell 检测 `127.0.0.1:1080` 端口是否可连通（TCP connect）。
- 结果作为自动模式的默认推送路径选择依据：
  - 可用：走代理 push
  - 不可用：走直连 push

**推送策略**
- 若 `fetch` 成功：再做 Ahead/Behind 判断；Behind>0 阻止推送并给出中文建议（fetch/rebase/push）。
- 若 `fetch` 失败：跳过 Ahead/Behind 的“Nothing to push”判断，直接进入 push 尝试（避免误退出）。
- push 的重试矩阵按模式决定：
  - direct：先直连，再 schannel
  - proxy：先 http 代理 + openssl，再 socks5 代理
  - auto：按检测结果选 primary 路径；若失败再尝试另一条路径（仅当另一条路径在条件上“可用”）

**验证方式**
- 自检脚本/命令：`cmd /c apk\\push.bat --mode auto --dry-run` 应输出中文标题与所选模式，并打印将执行的 git 命令序列。
- 在“代理可用/不可用”两种情况下自检应选择不同路径（通过启动/关闭本地 1080 端口监听来模拟）。

