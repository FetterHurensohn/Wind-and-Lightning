@echo off
REM === NUCLEAR RESTART SCRIPT ===
REM This will completely clean and restart everything

echo ====================================
echo NUCLEAR RESTART - Cleaning everything
echo ====================================

cd /d "C:\Users\jacqu\OneDrive\Desktop\Wind and Lightning"

echo.
echo [1/5] Killing all Node and Electron processes...
taskkill /IM node.exe /F >nul 2>&1
taskkill /IM electron.exe /F >nul 2>&1
timeout /t 2 >nul

echo [2/5] Deleting dist folder...
if exist dist rmdir /s /q dist

echo [3/5] Deleting Vite cache...
if exist node_modules\.vite rmdir /s /q node_modules\.vite

echo [4/5] Deleting Electron app cache...
if exist "%APPDATA%\capcut-video-editor" rmdir /s /q "%APPDATA%\capcut-video-editor"

echo [5/5] Starting dev server...
echo.
echo ====================================
echo Starting npm run electron:dev...
echo ====================================
echo.

npm run electron:dev
