@echo off
setlocal enabledelayedexpansion

REM ============================================
REM Dark Sticky Notes - Windows Source Runner
REM Clean start script with port management
REM ============================================

REM ============================================
REM PORT CONFIGURATION (Random High Ports)
REM ============================================
set ELECTRON_DEBUG_PORT=56532
set ELECTRON_INSPECT_PORT=60119
set ELECTRON_PORT=53715

REM ============================================
REM COLORS (Windows 10+ ANSI support)
REM ============================================
for /F %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"
set "RED=%ESC%[91m"
set "GREEN=%ESC%[92m"
set "YELLOW=%ESC%[93m"
set "BLUE=%ESC%[94m"
set "CYAN=%ESC%[96m"
set "MAGENTA=%ESC%[95m"
set "NC=%ESC%[0m"

REM ============================================
REM HEADER
REM ============================================
echo %CYAN%
echo ╔═══════════════════════════════════════════════════════════╗
echo ║        Dark Sticky Notes - Windows Source Runner               ║
echo ╚═══════════════════════════════════════════════════════════╝
echo %NC%

echo %BLUE%[INFO]%NC% Working directory: %CD%
echo %BLUE%[INFO]%NC% Configured ports:
echo   - Electron Debug:    %ELECTRON_DEBUG_PORT%
echo   - Electron Inspect:  %ELECTRON_INSPECT_PORT%
echo   - Electron Fallback: %ELECTRON_PORT%
echo.

REM ============================================
REM CLEANUP PHASE
REM ============================================
echo %CYAN%━━━ CLEANUP PHASE ━━━%NC%
echo %BLUE%[CLEANUP]%NC% Killing processes on configured ports...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%ELECTRON_DEBUG_PORT%" 2^>nul') do (
    echo %YELLOW%[CLEANUP]%NC% Killing PID %%a on port %ELECTRON_DEBUG_PORT%
    taskkill /F /PID %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%ELECTRON_INSPECT_PORT%" 2^>nul') do (
    echo %YELLOW%[CLEANUP]%NC% Killing PID %%a on port %ELECTRON_INSPECT_PORT%
    taskkill /F /PID %%a 2>nul
)
taskkill /F /IM electron.exe 2>nul
echo.

REM ============================================
REM VERIFICATION PHASE
REM ============================================
echo %CYAN%━━━ VERIFICATION PHASE ━━━%NC%
echo %BLUE%[CHECK]%NC% Verifying dependencies...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo %RED%[ERROR]%NC% Node.js is not installed!
    echo   Install from: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do echo %GREEN%[OK]%NC% Node.js %%i

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo %RED%[ERROR]%NC% npm is not installed!
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do echo %GREEN%[OK]%NC% npm %%i

if not exist "node_modules" (
    echo %YELLOW%[SETUP]%NC% Installing dependencies...
    call npm install
)
echo.

REM ============================================
REM LAUNCH PHASE
REM ============================================
echo %CYAN%━━━ LAUNCH PHASE ━━━%NC%
echo %GREEN%[START]%NC% Launching Dark Sticky Notes...
echo.

if "%1"=="--dev" goto devmode
if "%1"=="-d" goto devmode

echo %GREEN%[MODE]%NC% Standard mode
call npm run dev
goto end

:devmode
echo %MAGENTA%[MODE]%NC% Development mode with DevTools
set NODE_ENV=development
call npx electron . --remote-debugging-port=%ELECTRON_DEBUG_PORT% --inspect=%ELECTRON_INSPECT_PORT%

:end
endlocal
