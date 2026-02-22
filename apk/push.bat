@echo off
setlocal EnableExtensions
chcp 65001 >nul 2>&1

set "REMOTE=origin"
set "BRANCH=main"

cd /d "%~dp0"

echo.
echo ========================================
echo   Push Code To GitHub
echo ========================================
echo.

for /f "delims=" %%A in ('git rev-parse --show-toplevel 2^>nul') do set "REPO_ROOT=%%A"
if not defined REPO_ROOT (
    echo [ERROR] Current folder is not a git repository.
    echo.
    pause
    exit /b 1
)

for /f "delims=" %%A in ('git remote get-url %REMOTE% 2^>nul') do set "ORIGIN_URL_RAW=%%A"
if not defined ORIGIN_URL_RAW (
    echo [FIX] Missing %REMOTE% remote. Adding default repository URL...
    git remote add %REMOTE% https://github.com/nonomil/mario-minecraft-game.git
    if errorlevel 1 (
        echo [ERROR] Failed to add remote.
        echo.
        pause
        exit /b 1
    )
    set "ORIGIN_URL_RAW=https://github.com/nonomil/mario-minecraft-game.git"
)

set "ORIGIN_URL=%ORIGIN_URL_RAW%"
set "ORIGIN_URL=%ORIGIN_URL:`=%"

if not "%ORIGIN_URL%"=="%ORIGIN_URL_RAW%" (
    echo [FIX] Sanitizing remote URL...
    echo   Raw:   %ORIGIN_URL_RAW%
    echo   Fixed: %ORIGIN_URL%
    git remote set-url %REMOTE% "%ORIGIN_URL%"
    if errorlevel 1 (
        echo [ERROR] Failed to update remote URL.
        echo.
        pause
        exit /b 1
    )
)

echo [INFO] %REMOTE%: %ORIGIN_URL%
echo.

echo [SYNC] Fetching latest %REMOTE%/%BRANCH%...
git -c http.version=HTTP/1.1 fetch %REMOTE% %BRANCH% --prune
if errorlevel 1 (
    echo [WARN] Fetch failed via direct HTTPS.
    echo [WARN] Continuing with push retries to diagnose connectivity.
) else (
    echo [SYNC] Fetch succeeded.
)
echo.

set "AHEAD=0"
set "BEHIND=0"
for /f "tokens=1,2" %%A in ('git rev-list --left-right --count %REMOTE%/%BRANCH%...HEAD 2^>nul') do (
    set "BEHIND=%%A"
    set "AHEAD=%%B"
)

echo [CHECK] Branch status vs %REMOTE%/%BRANCH%:
echo   Ahead:  %AHEAD%
echo   Behind: %BEHIND%
echo.

if "%AHEAD%"=="0" if "%BEHIND%"=="0" (
    echo [INFO] Nothing to push. Local branch is up to date.
    echo.
    pause
    exit /b 0
)

if not "%BEHIND%"=="0" (
    echo [BLOCKED] Local branch is behind %REMOTE%/%BRANCH%.
    echo Push would be rejected as non-fast-forward.
    echo.
    echo Suggested fix:
    echo   git fetch %REMOTE% %BRANCH%
    echo   git rebase %REMOTE%/%BRANCH%
    echo   git push %REMOTE% %BRANCH%
    echo.
    echo If you intentionally want to overwrite remote history:
    echo   git push --force-with-lease %REMOTE% %BRANCH%
    echo.
    pause
    exit /b 1
)

echo [CHECK] Commits waiting to push:
git log %REMOTE%/%BRANCH%..HEAD --oneline 2>nul
if errorlevel 1 (
    echo [INFO] Unable to diff against %REMOTE%/%BRANCH%.
)
echo.

echo [PUSH] Pushing to GitHub...
git -c http.version=HTTP/1.1 push %REMOTE% %BRANCH%
if not errorlevel 1 goto :push_success

echo.
echo [RETRY 1] First push failed. Retrying with schannel backend...
git -c http.version=HTTP/1.1 -c http.sslBackend=schannel push %REMOTE% %BRANCH%
if not errorlevel 1 goto :push_success

echo.
echo [RETRY 2] Retrying with proxy (127.0.0.1:1080) and openssl...
git -c http.proxy=http://127.0.0.1:1080 -c https.proxy=http://127.0.0.1:1080 -c http.sslBackend=openssl push %REMOTE% %BRANCH%
if not errorlevel 1 goto :push_success

echo.
echo [RETRY 3] Retrying with socks5 proxy...
git -c http.proxy=socks5://127.0.0.1:1080 -c https.proxy=socks5://127.0.0.1:1080 push %REMOTE% %BRANCH%
if not errorlevel 1 goto :push_success

echo.
echo ========================================
echo   Push Failed
echo ========================================
echo.
echo All retry attempts failed.
echo.
echo Possible causes:
echo 1. Network cannot reach github.com:443
echo 2. Proxy/VPN not running (check port 1080)
echo 3. Authentication issue
echo.
echo Quick checks:
echo - Ensure v2ray is running on port 1080
echo - Test: curl -x http://127.0.0.1:1080 https://github.com
echo - Run: git remote -v
echo.
echo Successful proxy config that worked:
echo   git config http.proxy http://127.0.0.1:1080
echo   git config https.proxy http://127.0.0.1:1080
echo   git config http.sslBackend openssl
echo.
pause
exit /b 1

:push_success
echo.
echo ========================================
echo   Push Succeeded
echo ========================================
echo.
echo GitHub Actions should start automatically.
echo Actions URL: https://github.com/nonomil/mario-minecraft-game/actions
echo.
pause
exit /b 0
