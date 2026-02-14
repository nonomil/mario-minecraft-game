@echo off
chcp 65001 >nul
echo ========================================
echo   Mario Minecraft 单词游戏
echo ========================================
echo.
echo 正在启动本地服务器...
echo.

cd /d "%~dp0"

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到 Node.js！
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查端口 4173 是否被占用
netstat -ano | findstr ":4173" >nul
if %errorlevel% equ 0 (
    echo [提示] 端口 4173 已被占用，尝试关闭...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4173"') do (
        taskkill /F /PID %%a >nul 2>nul
    )
    timeout /t 2 >nul
)

REM 检查服务器文件是否存在
if not exist "tools\serve-apk.mjs" (
    echo [错误] 找不到服务器文件 tools\serve-apk.mjs
    pause
    exit /b 1
)

REM 启动服务器
echo 启动服务器在端口 4173...
start "Mario Minecraft Server" cmd /k "node tools/serve-apk.mjs --port 4173"

REM 等待服务器启动
echo 等待服务器启动...
timeout /t 3 >nul

REM 打开浏览器
echo 正在打开浏览器...
start http://localhost:4173/Game.html

echo.
echo ========================================
echo   服务器已启动！
echo   游戏地址: http://localhost:4173/Game.html
echo
echo   服务器窗口会保持打开状态
echo   关闭服务器窗口即可停止服务器
echo ========================================
echo.
echo 按任意键退出此窗口（服务器会继续运行）...
pause >nul
