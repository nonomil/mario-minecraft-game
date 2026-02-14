@echo off
chcp 65001 >nul
title Mario Minecraft - 开发模式

echo.
echo ========================================
echo   Mario Minecraft 游戏 - 开发模式
echo ========================================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到 Node.js，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查端口占用
netstat -ano | findstr ":4173" >nul 2>nul
if %errorlevel% equ 0 (
    echo [提示] 端口 4173 已被占用，尝试关闭...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4173"') do (
        taskkill /F /PID %%a >nul 2>nul
    )
    timeout /t 1 >nul
)

REM 启动开发服务器
echo [启动] 开发服务器在端口 4173...
echo.
echo ========================================
echo   游戏地址: http://localhost:4173/Game.html
echo   调试页面: http://localhost:4173/debug-full.html
echo ========================================
echo.
echo [提示] 按 Ctrl+C 停止服务器
echo.

node tools/serve-apk.mjs --port 4173
