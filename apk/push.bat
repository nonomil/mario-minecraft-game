@echo off
chcp 65001 >nul
title Git 推送

echo.
echo ========================================
echo   推送代码到 GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo [检查] 查看待推送的提交...
git log origin/main..HEAD --oneline
echo.

echo [推送] 正在推送到 GitHub...
git push origin main

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
    echo 请检查网络后重试
    echo.
)

pause
