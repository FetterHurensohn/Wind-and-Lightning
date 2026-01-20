# Stoppe alle laufenden Electron/Node Prozesse
Write-Host "Stoppe laufende Prozesse..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*electron*" -or $_.ProcessName -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Warte kurz
Start-Sleep -Seconds 2

# Lösche Vite Cache
Write-Host "Lösche Vite Cache..." -ForegroundColor Yellow
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite"
}

# Lösche dist
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}

# Starte Dev-Server neu
Write-Host "Starte Electron Dev-Server..." -ForegroundColor Green
npm run electron:dev
