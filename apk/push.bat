@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul 2>&1

set "REMOTE=origin"
set "BRANCH=main"

cd /d "%~dp0"

echo.
echo ========================================
echo   推送代码到 GitHub
echo ========================================
echo.

REM -----------------------------
REM 参数解析
REM 支持:
REM   --mode auto|proxy|direct
REM   --dry-run
REM   --yes
REM   --no-pause
REM -----------------------------
set "MODE="
set "DRY_RUN=0"
set "ASSUME_YES=0"
set "NO_PAUSE=0"
set "ACTION=auto"
set "MAIN_REPO="
set "SYNC_ONLY=0"
set "FORCE=0"

:parse_args
if "%~1"=="" goto :args_done
if /i "%~1"=="--dry-run" (
    set "DRY_RUN=1"
    shift
    goto :parse_args
)
if /i "%~1"=="--publish-main" (
    set "ACTION=publish-main"
    shift
    goto :parse_args
)
if /i "%~1"=="--push-current" (
    set "ACTION=push-current"
    shift
    goto :parse_args
)
if /i "%~1"=="--main-repo" (
    set "MAIN_REPO=%~2"
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="--sync-only" (
    set "SYNC_ONLY=1"
    shift
    goto :parse_args
)
if /i "%~1"=="--force" (
    set "FORCE=1"
    shift
    goto :parse_args
)
if /i "%~1"=="--yes" (
    set "ASSUME_YES=1"
    shift
    goto :parse_args
)
if /i "%~1"=="--mode" (
    set "MODE=%~2"
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="--no-pause" (
    set "NO_PAUSE=1"
    shift
    goto :parse_args
)
echo [警告] 未识别参数: %~1
shift
goto :parse_args

:args_done

if "%MMWG_PUSH_DEBUG%"=="1" (
    echo [调试] MODE=%MODE% DRY_RUN=%DRY_RUN% ASSUME_YES=%ASSUME_YES% ACTION=%ACTION% MAIN_REPO=%MAIN_REPO% SYNC_ONLY=%SYNC_ONLY% FORCE=%FORCE%
    echo.
)

for /f "delims=" %%A in ('git rev-parse --show-toplevel 2^>nul') do set "REPO_ROOT=%%A"
if not defined REPO_ROOT (
    echo [错误] 当前目录不是 Git 仓库。
    echo.
    call :exit_with_pause 1
    exit /b 1
)

if not defined MAIN_REPO (
    if defined MMWG_MAIN_REPO (
        set "MAIN_REPO=%MMWG_MAIN_REPO%"
    ) else (
        set "MAIN_REPO=G:\UserCode\Mario_Minecraft\mario-minecraft-game_V1"
    )
)

set "HAS_APK_LAYOUT=0"
if exist "%REPO_ROOT%\apk\android-app\package.json" set "HAS_APK_LAYOUT=1"
set "HAS_APK_ONLY_LAYOUT=0"
if exist "%REPO_ROOT%\android-app\package.json" if not exist "%REPO_ROOT%\apk\android-app\package.json" set "HAS_APK_ONLY_LAYOUT=1"

if /i "%ACTION%"=="auto" (
    if "%HAS_APK_ONLY_LAYOUT%"=="1" (
        set "ACTION=publish-main"
    ) else (
        set "ACTION=push-current"
    )
)

if /i "%ACTION%"=="publish-main" (
    call :publish_to_main_apk
    exit /b %errorlevel%
)

for /f "delims=" %%A in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set "CURRENT_BRANCH=%%A"
if not defined CURRENT_BRANCH set "CURRENT_BRANCH=?"
if /i not "%CURRENT_BRANCH%"=="%BRANCH%" (
    echo [信息] 当前分支: %CURRENT_BRANCH%
    echo [信息] 将自动执行以下步骤后推送到 %REMOTE%/%BRANCH%：
    echo   1^) git switch %BRANCH%
    echo   2^) git -c http.version=HTTP/1.1 pull --ff-only %REMOTE% %BRANCH%
    echo   3^) git merge --no-ff %CURRENT_BRANCH%
    echo   4^) git push %REMOTE% HEAD:%BRANCH%
    echo.
    if "%ASSUME_YES%"=="1" (
        echo [确认] 已指定 --yes，自动继续。
        echo.
    ) else (
        choice /c YN /n /m "是否继续自动流程？（Y/N）: "
        if errorlevel 2 (
            echo.
            echo [已取消] 未执行推送。
            echo.
            call :exit_with_pause 1
            exit /b 1
        )
        echo.
    )

    call :prepare_main_from_branch "%CURRENT_BRANCH%"
    if errorlevel 1 (
        echo.
        call :exit_with_pause 1
        exit /b 1
    )

    if "%DRY_RUN%"=="1" (
        set "CURRENT_BRANCH=%BRANCH%"
    ) else (
        for /f "delims=" %%A in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set "CURRENT_BRANCH=%%A"
    )
)

if /i not "%CURRENT_BRANCH%"=="%BRANCH%" (
    echo [错误] 当前分支仍为 %CURRENT_BRANCH%，未处于 %BRANCH%，已停止推送。
    echo.
    call :exit_with_pause 1
    exit /b 1
)

for /f "delims=" %%A in ('git remote get-url %REMOTE% 2^>nul') do set "ORIGIN_URL_RAW=%%A"
if not defined ORIGIN_URL_RAW (
    echo [修复] 未找到远端 %REMOTE% ，正在添加默认仓库地址...
    if "%DRY_RUN%"=="1" (
        echo [DRY-RUN] git remote add %REMOTE% https://github.com/nonomil/mario-minecraft-game.git
    ) else (
        git remote add %REMOTE% https://github.com/nonomil/mario-minecraft-game.git
    )
    if not "%DRY_RUN%"=="1" if errorlevel 1 (
        echo [错误] 添加远端失败。
        echo.
        call :exit_with_pause 1
        exit /b 1
    )
    set "ORIGIN_URL_RAW=https://github.com/nonomil/mario-minecraft-game.git"
)

set "ORIGIN_URL=%ORIGIN_URL_RAW%"
set "ORIGIN_URL=%ORIGIN_URL:`=%"

if not "%ORIGIN_URL%"=="%ORIGIN_URL_RAW%" (
    echo [修复] 正在清理远端 URL...
    echo   原始: %ORIGIN_URL_RAW%
    echo   修复: %ORIGIN_URL%
    if "%DRY_RUN%"=="1" (
        echo [DRY-RUN] git remote set-url %REMOTE% "%ORIGIN_URL%"
    ) else (
        git remote set-url %REMOTE% "%ORIGIN_URL%"
    )
    if not "%DRY_RUN%"=="1" if errorlevel 1 (
        echo [错误] 更新远端 URL 失败。
        echo.
        call :exit_with_pause 1
        exit /b 1
    )
)

echo [信息] %REMOTE%: %ORIGIN_URL%
echo.

REM -----------------------------
REM 模式选择 + 自动检测 127.0.0.1:1080
REM -----------------------------
if not defined MODE (
    echo [选择] 请选择推送模式：
    echo   1. 自动检测 推荐: 检测 127.0.0.1:1080，有代理则走代理，否则直连
    echo   2. 强制代理: 使用 127.0.0.1:1080
    echo   3. 强制直连: 不使用代理
    echo.
    choice /c 123 /n /t 5 /d 1 /m "请输入 1/2/3（5 秒后默认 1）: "
    if errorlevel 3 set "MODE=direct"
    if errorlevel 2 set "MODE=proxy"
    if errorlevel 1 set "MODE=auto"
    echo.
)

set "PROXY_OK=0"
for /f "delims=" %%P in ('powershell -NoProfile -Command "$ok=0; try { $c=New-Object System.Net.Sockets.TcpClient; $iar=$c.BeginConnect('127.0.0.1',1080,$null,$null); if ($iar.AsyncWaitHandle.WaitOne(200,$false) -and $c.Connected) { $ok=1 }; $c.Close() } catch {}; Write-Output $ok" 2^>nul') do set "PROXY_OK=%%P"
if not "%PROXY_OK%"=="1" set "PROXY_OK=0"

set "MODE=%MODE: =%"
if /i "%MODE%"=="auto" (
    echo [模式] 自动检测: 检测本地代理 127.0.0.1:1080...
    if "%PROXY_OK%"=="1" (
        echo [模式] 已检测到代理端口 1080 正在监听，将使用代理推送。
        set "PRIMARY=proxy"
    ) else (
        echo [模式] 未检测到代理端口 1080，将使用直连推送。
        set "PRIMARY=direct"
    )
) else if /i "%MODE%"=="proxy" (
    echo [模式] 强制代理: 127.0.0.1:1080
    set "PRIMARY=proxy"
) else if /i "%MODE%"=="direct" (
    echo [模式] 强制直连
    set "PRIMARY=direct"
) else (
    echo [错误] --mode 参数无效: %MODE%
    echo [提示] 允许值: auto / proxy / direct
    echo.
    call :exit_with_pause 1
    exit /b 1
)
echo.

REM -----------------------------
REM Dry-run: 不执行网络操作，仅打印将执行的命令
REM -----------------------------
if "%DRY_RUN%"=="1" (
    echo [DRY-RUN] 已启用 --dry-run，不会执行 git fetch / git push。
    echo   git -c http.version=HTTP/1.1 fetch %REMOTE% %BRANCH% --prune
    echo   git rev-list --left-right --count %REMOTE%/%BRANCH%...HEAD
    echo   git --no-pager log %REMOTE%/%BRANCH%..HEAD --oneline
    if /i "%PRIMARY%"=="proxy" (
        echo   git -c http.proxy=http://127.0.0.1:1080 -c https.proxy=http://127.0.0.1:1080 -c http.sslBackend=openssl push %REMOTE% HEAD:%BRANCH%
    ) else (
        echo   git -c http.version=HTTP/1.1 push %REMOTE% HEAD:%BRANCH%
    )
    echo.
    exit /b 0
)

echo [同步] 正在拉取最新的 %REMOTE%/%BRANCH%...
set "FETCH_OK=0"
git -c http.version=HTTP/1.1 fetch %REMOTE% %BRANCH% --prune
if errorlevel 1 (
    echo [警告] fetch 失败（可能是网络或认证问题）。
    echo [WARN] Continue with push to surface clearer failure cause.
) else (
    set "FETCH_OK=1"
    echo [同步] fetch 成功。
)
echo.

set "AHEAD=0"
set "BEHIND=0"
if "%FETCH_OK%"=="1" (
    for /f "tokens=1,2" %%A in ('git rev-list --left-right --count %REMOTE%/%BRANCH%...HEAD 2^>nul') do (
        set "BEHIND=%%A"
        set "AHEAD=%%B"
    )
)

echo [检查] 相对 %REMOTE%/%BRANCH% 的分支状态：
if "%FETCH_OK%"=="1" (
    echo   Ahead:  %AHEAD%
    echo   Behind: %BEHIND%
) else (
    echo   （fetch 失败，无法可靠计算 Ahead/Behind）
)
echo.

if "%FETCH_OK%"=="1" (
    if "%AHEAD%"=="0" if "%BEHIND%"=="0" (
        echo [信息] 没有需要推送的提交，本地已是最新。
        echo.
        call :exit_with_pause 0
        exit /b 0
    )
)

if not "%BEHIND%"=="0" (
    echo [阻止] 本地提交落后于 %REMOTE%/%BRANCH%，推送会被拒绝（non-fast-forward）。
    echo.
    echo 建议操作：
    echo   git fetch %REMOTE% %BRANCH%
    echo   git rebase %REMOTE%/%BRANCH%
    echo   git push %REMOTE% HEAD:%BRANCH%
    echo.
    echo 如果你确定要覆盖远端历史（不推荐）：
    echo   git push --force-with-lease %REMOTE% HEAD:%BRANCH%
    echo.
    call :exit_with_pause 1
    exit /b 1
)

echo [检查] 等待推送的提交：
git --no-pager log %REMOTE%/%BRANCH%..HEAD --oneline 2>nul
if errorlevel 1 (
    echo [信息] 无法对比 %REMOTE%/%BRANCH%（可能缺少远端引用）。
)
echo.

echo [推送] 正在推送到 GitHub...

if /i "%PRIMARY%"=="proxy" (
    goto :push_with_proxy
) else (
    goto :push_direct
)

:push_direct
git -c http.version=HTTP/1.1 push %REMOTE% HEAD:%BRANCH%
if not errorlevel 1 goto :push_success

echo.
echo [重试 1] 直连推送失败，尝试使用 schannel 后端重试...
git -c http.version=HTTP/1.1 -c http.sslBackend=schannel push %REMOTE% HEAD:%BRANCH%
if not errorlevel 1 goto :push_success

echo.
echo [重试 2] 直连推送失败，尝试使用 openssl 后端重试...
git -c http.version=HTTP/1.1 -c http.sslBackend=openssl push %REMOTE% HEAD:%BRANCH%
if not errorlevel 1 goto :push_success

if /i "%MODE%"=="auto" if "%PROXY_OK%"=="1" (
    echo.
    echo [重试 3] 自动模式：检测到本地代理，尝试走代理推送...
    goto :push_with_proxy
)
goto :push_failed

:push_with_proxy
echo.
echo [代理] 使用代理 (http://127.0.0.1:1080) + openssl 推送...
git -c http.proxy=http://127.0.0.1:1080 -c https.proxy=http://127.0.0.1:1080 -c http.sslBackend=openssl push %REMOTE% HEAD:%BRANCH%
if not errorlevel 1 goto :push_success

echo.
echo [重试] 代理推送失败，尝试 socks5 代理...
git -c http.proxy=socks5://127.0.0.1:1080 -c https.proxy=socks5://127.0.0.1:1080 push %REMOTE% HEAD:%BRANCH%
if not errorlevel 1 goto :push_success

:push_failed
echo.
echo ========================================
echo   推送失败
echo ========================================
echo.
echo 所有尝试都失败了。
echo.
echo Possible causes:
echo 1. Network cannot reach github.com:443
echo 2. Proxy/VPN not running (127.0.0.1:1080)
echo 3. Auth issue (credentials/token)
echo.
echo Quick checks:
echo - Ensure proxy is running and listening on port 1080
echo - Test: curl -x http://127.0.0.1:1080 https://github.com
echo - Remote: git remote -v
echo.
echo Git proxy config examples:
echo   git config http.proxy http://127.0.0.1:1080
echo   git config https.proxy http://127.0.0.1:1080
echo   git config http.sslBackend openssl
echo.
call :exit_with_pause 1
exit /b 1

:push_success
echo.
echo ========================================
echo   推送成功
echo ========================================
echo.
echo GitHub Actions 将自动开始构建（如果本次提交影响 apk/ 或 workflow）。
echo.
call :exit_with_pause 0
exit /b 0

:prepare_main_from_branch
set "SOURCE_BRANCH=%~1"
if not defined SOURCE_BRANCH (
    echo [错误] 未提供来源分支，无法执行自动流程。
    exit /b 1
)

if "%DRY_RUN%"=="1" (
    echo [DRY-RUN] 自动流程预览：
    echo   git switch %BRANCH%
    echo   git -c http.version=HTTP/1.1 pull --ff-only %REMOTE% %BRANCH%
    echo   git merge --no-ff %SOURCE_BRANCH%
    echo.
    exit /b 0
)

set "DIRTY=0"
for /f "delims=" %%A in ('git status --porcelain 2^>nul') do set "DIRTY=1"
if "%DIRTY%"=="1" (
    echo [阻止] 检测到未提交改动，无法自动切换分支。
    echo [提示] 请先提交或暂存后重试：
    echo   git add -A ^&^& git commit -m "..."
    echo   或 git stash -u
    exit /b 1
)

echo [流程] 切换到 %BRANCH%...
git switch %BRANCH%
if errorlevel 1 (
    echo [错误] 切换到 %BRANCH% 失败。
    exit /b 1
)

echo [流程] 更新本地 %BRANCH%（ff-only）...
git -c http.version=HTTP/1.1 pull --ff-only %REMOTE% %BRANCH%
if errorlevel 1 (
    echo [错误] pull --ff-only 失败，请先手动处理本地 %BRANCH% 状态。
    exit /b 1
)

echo [流程] 合并 %SOURCE_BRANCH% -> %BRANCH%...
git merge --no-ff %SOURCE_BRANCH%
if errorlevel 1 (
    echo [错误] 合并失败，可能存在冲突。
    echo [提示] 请先解决冲突并提交，然后重新运行 push.bat。
    exit /b 1
)

echo [流程] 自动合并完成，继续推送。
echo.
exit /b 0

:publish_to_main_apk
echo [模式] 发布到主仓库 apk/ 并推送：%MAIN_REPO%
echo.

if not exist "%MAIN_REPO%\.git" (
    echo [错误] 主仓库路径不是 Git 仓库：%MAIN_REPO%
    echo [提示] 可用参数指定：--main-repo "G:\path\to\mario-minecraft-game_V1"
    echo.
    call :exit_with_pause 1
    exit /b 1
)

set "MAIN_APK_DIR=%MAIN_REPO%\apk"
if not exist "%MAIN_APK_DIR%" (
    echo [错误] 主仓库不存在 apk 目录：%MAIN_APK_DIR%
    echo.
    call :exit_with_pause 1
    exit /b 1
)

set "MAIN_APK_DIRTY=0"
for /f "delims=" %%L in ('git -C "%MAIN_REPO%" status --porcelain -- apk 2^>nul') do set "MAIN_APK_DIRTY=1"
if "%MAIN_APK_DIRTY%"=="1" if not "%FORCE%"=="1" (
    echo [阻止] 主仓库 apk/ 存在未提交改动，已停止同步以避免覆盖本地修改。
    echo [提示] 先在主仓库提交/暂存/清理 apk/ 的改动后再运行。
    echo [提示] 如你确定要继续，可加参数 --force
    echo.
    call :exit_with_pause 1
    exit /b 1
)

if not defined MODE set "MODE=auto"

set "PROXY_OK=0"
for /f "delims=" %%P in ('powershell -NoProfile -Command "$ok=0; try { $c=New-Object System.Net.Sockets.TcpClient; $iar=$c.BeginConnect('127.0.0.1',1080,$null,$null); if ($iar.AsyncWaitHandle.WaitOne(200,$false) -and $c.Connected) { $ok=1 }; $c.Close() } catch {}; Write-Output $ok" 2^>nul') do set "PROXY_OK=%%P"
if not "%PROXY_OK%"=="1" set "PROXY_OK=0"

set "MODE=%MODE: =%"
if /i "%MODE%"=="auto" (
    if "%PROXY_OK%"=="1" (
        set "PRIMARY=proxy"
    ) else (
        set "PRIMARY=direct"
    )
) else if /i "%MODE%"=="proxy" (
    set "PRIMARY=proxy"
) else if /i "%MODE%"=="direct" (
    set "PRIMARY=direct"
) else (
    echo [错误] --mode 参数无效: %MODE%
    echo [提示] 允许值: auto / proxy / direct
    echo.
    call :exit_with_pause 1
    exit /b 1
)

if "%DRY_RUN%"=="1" (
    echo [DRY-RUN] 将执行以下操作（不落地、不推送）：
    echo   git -C "%MAIN_REPO%" switch %BRANCH%
    echo   git -C "%MAIN_REPO%" -c http.version=HTTP/1.1 pull --ff-only %REMOTE% %BRANCH%
    echo   robocopy "%REPO_ROOT%" "%MAIN_APK_DIR%" /E /XD ".git" ".gradle" "node_modules" "build" "dist"
    echo   git -C "%MAIN_REPO%" add apk
    echo   git -C "%MAIN_REPO%" diff --cached --quiet ^(若无变化则跳过提交^)
    echo   git -C "%MAIN_REPO%" commit -m "sync(apk): publish from apk-only repo"
    if "%SYNC_ONLY%"=="1" (
        echo   ^(sync-only: 跳过 push^)
    ) else (
        if /i "%PRIMARY%"=="proxy" (
            echo   git -C "%MAIN_REPO%" -c http.proxy=http://127.0.0.1:1080 -c https.proxy=http://127.0.0.1:1080 -c http.sslBackend=openssl push %REMOTE% HEAD:%BRANCH%
        ) else (
            echo   git -C "%MAIN_REPO%" -c http.version=HTTP/1.1 push %REMOTE% HEAD:%BRANCH%
        )
    )
    echo.
    exit /b 0
)

echo [流程] 切换主仓库到 %BRANCH% 并更新（ff-only）...
git -C "%MAIN_REPO%" switch %BRANCH%
if errorlevel 1 (
    echo [错误] 主仓库切换分支失败：%BRANCH%
    echo.
    call :exit_with_pause 1
    exit /b 1
)

set "MAIN_PULL_TRIES=0"
:main_repo_pull_retry
set /a MAIN_PULL_TRIES+=1
if /i "%PRIMARY%"=="proxy" (
    git -C "%MAIN_REPO%" -c http.version=HTTP/1.1 -c http.proxy=http://127.0.0.1:1080 -c https.proxy=http://127.0.0.1:1080 -c http.sslBackend=openssl pull --ff-only %REMOTE% %BRANCH%
) else (
    git -C "%MAIN_REPO%" -c http.version=HTTP/1.1 pull --ff-only %REMOTE% %BRANCH%
)
if not errorlevel 1 goto main_repo_pull_ok
if %MAIN_PULL_TRIES% GEQ 3 goto main_repo_pull_fail
echo [警告] 主仓库 pull --ff-only 失败，准备重试（%MAIN_PULL_TRIES%/3）...
timeout /t 3 /nobreak >nul
goto main_repo_pull_retry

:main_repo_pull_fail
echo [错误] 主仓库 pull --ff-only 失败，请先手动处理主仓库 %BRANCH% 分支状态。
echo.
call :exit_with_pause 1
exit /b 1

:main_repo_pull_ok

echo [同步] 复制当前仓库内容 -> 主仓库 apk/...
robocopy "%REPO_ROOT%" "%MAIN_APK_DIR%" /E /XD ".git" ".gradle" "node_modules" "build" "dist" ".claude" ".trae" ".github" "docs\\plan" /XF "主仓库" >nul
set "RC=%ERRORLEVEL%"
if %RC% GEQ 8 (
    echo [错误] robocopy 失败，错误码=%RC%
    echo.
    call :exit_with_pause 1
    exit /b 1
)
echo [同步] 文件同步完成。
echo.

echo [提交] 在主仓库暂存 apk/...
git -C "%MAIN_REPO%" add apk
if errorlevel 1 (
    echo [错误] 主仓库 git add apk 失败。
    echo.
    call :exit_with_pause 1
    exit /b 1
)

git -C "%MAIN_REPO%" diff --cached --quiet
if not errorlevel 1 (
    echo [信息] apk/ 没有变化，跳过提交与推送。
    echo.
    call :exit_with_pause 0
    exit /b 0
)

echo [提交] 提交同步结果...
git -C "%MAIN_REPO%" commit -m "sync(apk): publish from apk-only repo"
if errorlevel 1 (
    echo [错误] 主仓库 commit 失败。
    echo.
    call :exit_with_pause 1
    exit /b 1
)
echo.

if "%SYNC_ONLY%"=="1" (
    echo [完成] 已完成同步与提交（sync-only：未推送）。
    echo.
    call :exit_with_pause 0
    exit /b 0
)

echo [推送] 推送主仓库到 %REMOTE%/%BRANCH%...
pushd "%MAIN_REPO%" >nul

if /i "%PRIMARY%"=="proxy" (
    goto :publish_push_with_proxy
) else (
    goto :publish_push_direct
)

:publish_push_direct
git -c http.version=HTTP/1.1 push %REMOTE% HEAD:%BRANCH%
if not errorlevel 1 goto :publish_push_success

echo.
echo [重试 1] 直连推送失败，尝试使用 schannel 后端重试...
git -c http.version=HTTP/1.1 -c http.sslBackend=schannel push %REMOTE% HEAD:%BRANCH%
if not errorlevel 1 goto :publish_push_success

echo.
echo [重试 2] 直连推送失败，尝试使用 openssl 后端重试...
git -c http.version=HTTP/1.1 -c http.sslBackend=openssl push %REMOTE% HEAD:%BRANCH%
if not errorlevel 1 goto :publish_push_success

if /i "%MODE%"=="auto" if "%PROXY_OK%"=="1" (
    echo.
    echo [重试 3] 自动模式：检测到本地代理，尝试走代理推送...
    goto :publish_push_with_proxy
)
goto :publish_push_failed

:publish_push_with_proxy
echo.
echo [代理] 使用代理 (http://127.0.0.1:1080) + openssl 推送...
git -c http.proxy=http://127.0.0.1:1080 -c https.proxy=http://127.0.0.1:1080 -c http.sslBackend=openssl push %REMOTE% HEAD:%BRANCH%
if not errorlevel 1 goto :publish_push_success

echo.
echo [重试] 代理推送失败，尝试 socks5 代理...
git -c http.proxy=socks5://127.0.0.1:1080 -c https.proxy=socks5://127.0.0.1:1080 push %REMOTE% HEAD:%BRANCH%
if not errorlevel 1 goto :publish_push_success

:publish_push_failed
popd >nul
echo.
echo ========================================
echo   推送失败（主仓库）
echo ========================================
echo.
call :exit_with_pause 1
exit /b 1

:publish_push_success
popd >nul
echo.
echo ========================================
echo   推送成功（主仓库）
echo ========================================
echo.
echo GitHub Actions 将自动开始构建（针对 main/apk）。
echo.
call :exit_with_pause 0
exit /b 0

:exit_with_pause
set "EXIT_CODE=%~1"
if "%NO_PAUSE%"=="1" exit /b %EXIT_CODE%
pause
exit /b %EXIT_CODE%
