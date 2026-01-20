@echo off
echo ============================================
echo   CapCut Video Editor - Desktop App
echo ============================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo Starting Electron app in development mode...
echo.
echo This will:
echo   1. Start Vite dev server on http://localhost:3000
echo   2. Open Electron desktop window
echo   3. Open DevTools for debugging
echo.

call npm run electron:dev

pause
