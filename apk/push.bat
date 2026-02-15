@echo off
setlocal enabledextensions
chcp 65001 >nul
title Git 推送

echo.
echo ========================================
echo   推送代码到 GitHub
echo ========================================
echo.

cd /d "%~dp0"

for /f "delims=" %%A in ('git rev-parse --show-toplevel 2^>nul') do set "REPO_ROOT=%%A"
if not defined REPO_ROOT (
    echo [错误] 当前目录不是 Git 仓库，无法推送。
    echo.
    pause
    exit /b 1
)

for /f "delims=" %%A in ('git remote get-url origin 2^>nul') do set "ORIGIN_URL_RAW=%%A"
if not defined ORIGIN_URL_RAW (
    echo [修复] 未找到 origin 远程，正在设置为官方仓库地址...
    git remote add origin https://github.com/nonomil/mario-minecraft-game.git
    set "ORIGIN_URL_RAW=https://github.com/nonomil/mario-minecraft-game.git"
)

set "ORIGIN_URL=%ORIGIN_URL_RAW%"
set "ORIGIN_URL=%ORIGIN_URL:`=%"
set "ORIGIN_URL=%ORIGIN_URL:\"=%"

if not "%ORIGIN_URL%"=="%ORIGIN_URL_RAW%" (
    echo [修复] 检测到 origin URL 含有多余字符，已自动清理：
    echo   原始: %ORIGIN_URL_RAW%
    echo   修复: %ORIGIN_URL%
    git remote set-url origin "%ORIGIN_URL%"
) else (
    echo [信息] origin: %ORIGIN_URL%
)
echo.

echo [检查] 查看待推送的提交...
git log origin/main..HEAD --oneline
echo.

echo [推送] 正在推送到 GitHub...
git -c http.version=HTTP/1.1 push origin main
if %errorlevel% neq 0 (
    echo.
    echo [重试] 推送失败，使用备用方式重试一次...
    git -c http.version=HTTP/1.1 -c http.sslBackend=schannel push origin main
)

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   ✅ 推送成功！
    echo ========================================
    echo.
    echo GitHub Actions 将自动构建 APK
    echo 查看构建状态: https://github.com/nonomil/mario-minecraft-game/actions
    echo.
) else (
    echo.
    echo ========================================
    echo   ❌ 推送失败
    echo ========================================
    echo.
    echo 可能的原因：
    echo 1. 网络连接问题
    echo 2. GitHub 服务不可用
    echo 3. 认证失败
    echo.
    echo 建议排查：
    echo - 检查是否能打开 https://github.com
    echo - 如使用代理/VPN，尝试切换节点或暂时关闭后重试
    echo - 运行: git remote -v  确认远程地址无反引号或空格
    echo.
    echo 请检查网络后重试
    echo.
)

pause
