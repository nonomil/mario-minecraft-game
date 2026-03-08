@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul
title Mario Minecraft Debug Server
color 0A

set "BASE_PORT=4173"
set "MAX_PORT=6"
set "FINAL_PORT="
set "DEBUG_URL="

echo ========================================
echo   Mario Minecraft 调试服务器
echo ========================================
echo.

cd /d "%~dp0..\.."

echo [1/4] 检查环境...
where python >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ 找到 Python
    set "USE_PYTHON=1"
) else (
    echo ✗ 未找到 Python
    set "USE_PYTHON=0"
)

where node >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ 找到 Node.js
    set "USE_NODE=1"
) else (
    echo ✗ 未找到 Node.js
    set "USE_NODE=0"
)
echo.

if "%USE_NODE%"=="0" if "%USE_PYTHON%"=="0" (
    echo [错误] 未找到 Python 或 Node.js
    echo.
    echo 请安装以下任一工具:
    echo   - Python 3.x: https://www.python.org/downloads/
    echo   - Node.js: https://nodejs.org/
    echo.
    pause
    goto :end
)

echo [2/4] 选择可用端口...
set /a END_PORT=BASE_PORT+MAX_PORT
for /L %%P in (%BASE_PORT%,1,%END_PORT%) do (
    call :prepare_port %%P
    if "!PORT_READY!"=="1" (
        set "FINAL_PORT=%%P"
        goto :port_ready
    )
)

echo [错误] 无法找到可用端口
echo 已尝试端口范围: %BASE_PORT%-%END_PORT%
echo.
pause
goto :end

:port_ready
set "DEBUG_URL=http://localhost:%FINAL_PORT%/tests/debug-pages/GameDebug.html?debug_page_ts=%RANDOM%%RANDOM%"
echo ✓ 使用端口: %FINAL_PORT%
echo.

if "%USE_NODE%"=="1" if exist "tools\serve-apk.mjs" (
    echo [3/4] 使用 Node.js 服务器 ^(tools/serve-apk.mjs^)
    echo [4/4] 启动服务器: http://localhost:%FINAL_PORT%
    echo.
    echo 按 Ctrl+C 停止服务器
    echo ========================================
    echo.
    echo Opening debug page with cache-busting URL...
    start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process '%DEBUG_URL%'"
    node tools\serve-apk.mjs --port %FINAL_PORT%
    goto :end
)

if "%USE_PYTHON%"=="1" (
    echo [3/4] 使用 Python 简易服务器
    echo [4/4] 启动服务器: http://localhost:%FINAL_PORT%
    echo.
    echo 按 Ctrl+C 停止服务器
    echo ========================================
    echo.
    echo Opening debug page with cache-busting URL...
    start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process '%DEBUG_URL%'"
    python -m http.server %FINAL_PORT%
    goto :end
)

echo [错误] 未找到可用的服务器脚本
echo.
pause
goto :end

:prepare_port
set "PORT_READY=0"
set "TARGET_PORT=%~1"
set "FOUND_PID="
call :find_port_pid %TARGET_PORT%
if not defined FOUND_PID (
    echo   - 端口 %TARGET_PORT% 空闲
    set "PORT_READY=1"
    goto :eof
)

echo   - 端口 %TARGET_PORT% 被 PID !FOUND_PID! 占用，尝试终止...
taskkill /PID !FOUND_PID! /F >nul 2>&1
timeout /t 1 /nobreak >nul

set "FOUND_PID="
call :find_port_pid %TARGET_PORT%
if not defined FOUND_PID (
    echo     已释放端口 %TARGET_PORT%
    set "PORT_READY=1"
    goto :eof
)

echo     无法释放端口 %TARGET_PORT%，改试下一个端口
goto :eof

:find_port_pid
set "FOUND_PID="
for /f "tokens=5" %%I in ('netstat -ano ^| findstr /r /c:":%~1 .*LISTENING"') do (
    set "FOUND_PID=%%I"
    goto :eof
)
for /f "tokens=5" %%I in ('netstat -ano ^| findstr /r /c:":%~1 "') do (
    set "FOUND_PID=%%I"
    goto :eof
)
goto :eof

:end
endlocal
