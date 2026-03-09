@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul

set "GAME_PORT=4173"
set "MAX_PORT_OFFSET=6"
set "FINAL_PORT="
set "SERVER_SCRIPT=tools\serve-apk.mjs"
set "MMWG_TS="
set "MMWG_URL="

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
    goto :end
)

REM 检查服务器文件是否存在
if not exist "%SERVER_SCRIPT%" (
    echo [错误] 找不到服务器文件 %SERVER_SCRIPT%
    pause
    goto :end
)

REM 选择可用端口
echo 正在检查可用端口...
set /a END_PORT=GAME_PORT+MAX_PORT_OFFSET
for /L %%P in (%GAME_PORT%,1,%END_PORT%) do (
    call :prepare_port %%P
    if "!PORT_READY!"=="1" (
        set "FINAL_PORT=%%P"
        goto :port_ready
    )
)

echo [错误] 无法找到可用端口
echo 已尝试端口范围: %GAME_PORT%-%END_PORT%
pause
goto :end

:port_ready

REM 启动服务器
echo 启动服务器在端口 %FINAL_PORT%...
start "Mario Minecraft Server" cmd /k "node %SERVER_SCRIPT% --port %FINAL_PORT%"

REM 等待服务器启动
echo 等待服务器启动...
timeout /t 3 /nobreak >nul

set "FOUND_PID="
call :find_port_pid %FINAL_PORT%
if not defined FOUND_PID (
    echo [错误] 服务器未能成功监听端口 %FINAL_PORT%
    echo 请检查新打开的服务器窗口中的报错信息
    pause
    goto :end
)

REM 打开浏览器
set "MMWG_TS=%RANDOM%%RANDOM%%RANDOM%"
set "MMWG_URL=http://localhost:%FINAL_PORT%/dev-reset.html?target=%2FGame.html%3Flauncher%3Dbat%26t%3D%MMWG_TS%"
echo 正在打开浏览器...
start "" "%MMWG_URL%"

echo.
echo ========================================
echo   服务器已启动！
echo   游戏地址: %MMWG_URL%
echo.
echo   服务器窗口会保持打开状态
echo   关闭服务器窗口即可停止服务器
echo ========================================
echo.
echo 按任意键退出此窗口（服务器会继续运行）...
pause >nul
goto :end

:prepare_port
set "PORT_READY=0"
set "TARGET_PORT=%~1"
set "FOUND_PID="
call :find_port_pid %TARGET_PORT%
if not defined FOUND_PID (
    echo [提示] 端口 %TARGET_PORT% 空闲
    set "PORT_READY=1"
    goto :eof
)

echo [提示] 端口 %TARGET_PORT% 被 PID !FOUND_PID! 占用，尝试关闭...
taskkill /PID !FOUND_PID! /F >nul 2>&1
timeout /t 1 /nobreak >nul

set "FOUND_PID="
call :find_port_pid %TARGET_PORT%
if not defined FOUND_PID (
    echo [提示] 端口 %TARGET_PORT% 已释放
    set "PORT_READY=1"
    goto :eof
)

echo [提示] 无法释放端口 %TARGET_PORT%（仍被 PID !FOUND_PID! 占用），改试下一个端口
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
