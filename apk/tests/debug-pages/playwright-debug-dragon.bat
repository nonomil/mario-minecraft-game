@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul
title Mario Minecraft Dragon Debug (Playwright)
color 0A

set "BASE_PORT=4173"
set "MAX_PORT=6"
set "FINAL_PORT="
set "FORCE_PORT="
set "DEBUG_MODE=0"
set "AUTO_MODE=0"

:parse_args
if "%~1"=="" goto :parse_done
if /I "%~1"=="--debug" set "DEBUG_MODE=1"
if /I "%~1"=="--auto" set "AUTO_MODE=1"
if /I "%~1"=="--port" (
  set "FORCE_PORT=%~2"
  shift
)
shift
goto :parse_args

:parse_done

echo ========================================
echo   Playwright Dragon Arena Debug
echo ========================================
echo   Debug: %DEBUG_MODE%
echo   Auto: %AUTO_MODE%
echo ========================================
echo.

cd /d "%~dp0..\.."

echo [1/2] Select free port...
if defined FORCE_PORT (
  call :find_port_pid %FORCE_PORT%
  if defined FOUND_PID (
    echo [error] Port %FORCE_PORT% in use.
    goto :end
  )
  set "FINAL_PORT=%FORCE_PORT%"
  goto :port_ready
)

set /a END_PORT=BASE_PORT+MAX_PORT
for /L %%P in (%BASE_PORT%,1,%END_PORT%) do (
  call :find_port_pid %%P
  if not defined FOUND_PID (
    set "FINAL_PORT=%%P"
    goto :port_ready
  )
)

echo [error] No free port in range %BASE_PORT%-%END_PORT%
goto :end

:port_ready
echo Using port: %FINAL_PORT%

echo [2/2] Run Playwright tests...
set "MMWG_E2E_PORT=%FINAL_PORT%"
set "MMWG_E2E_CHANNEL=chrome"
if "%AUTO_MODE%"=="1" set "PWDEBUG="
if "%DEBUG_MODE%"=="1" (
  if "%AUTO_MODE%"=="0" set "PWDEBUG=1"
)

npm.cmd run test:e2e -- tests/e2e/specs/dragon-end-arena.spec.mjs -- --headed

goto :end

:find_port_pid
set "FOUND_PID="
for /f "tokens=5" %%I in ('netstat -ano ^| findstr /r /c":%~1 .*LISTENING"') do (
  set "FOUND_PID=%%I"
  goto :eof
)
goto :eof

:end
endlocal
