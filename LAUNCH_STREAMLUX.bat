@echo off
TITLE StreamLux - Universal Video Magic
echo.
echo    🚀 Elevating StreamLux Experience...
echo    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

:: Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [❌] Error: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/ to run StreamLux.
    pause
    exit /b
)

echo [✓] System Check: Node.js detected.

:: Check for Python / yt-dlp (needed for Zero-Error Downloads)
where yt-dlp >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [!] yt-dlp not found. Checking Python for auto-install...
    where python >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo [!] Installing yt-dlp via pip...
        pip install -q yt-dlp
        echo [✓] yt-dlp installed!
    ) else (
        echo [⚠] yt-dlp not found. Downloads may show 403 errors.
        echo    To fix: Install yt-dlp from https://github.com/yt-dlp/yt-dlp#installation
    )
) else (
    echo [✓] yt-dlp detected - Zero-Error Downloads enabled!
)

echo [✓] Initializing Vision AI Backend...

:: Check if node_modules exists in root, if not, install once
if not exist "node_modules" (
    echo [!] First-time setup detected. Installing core dependencies...
    call npm install
)

:: Check if node_modules exists in backend, if not, install once
if not exist "backend\node_modules" (
    echo [!] Initializing AI Sniffer dependencies...
    cd backend && call npm install && cd ..
)

echo [✓] All systems ready!
echo [!] Launching StreamLux Website and AI Backend...
echo.
echo    Note: This window must stay open for the AI Sniffer to work.
echo    The website will open in your browser automatically.
echo.

:: Start concurrently (frontend + backend)
call npm start

pause
