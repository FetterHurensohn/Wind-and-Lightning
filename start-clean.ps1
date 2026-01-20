# start-clean.ps1
# Sauberer Start des Dev-Servers ohne Port-Konflikte

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Wind and Lightning - Sauberer Dev-Server Start       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Schritt 1: Alle Node/Electron Prozesse beenden
Write-Host "`n[1/4] Beende alle Node/Electron Prozesse..." -ForegroundColor Yellow
taskkill /F /IM node.exe /T 2>&1 | Out-Null
taskkill /F /IM electron.exe /T 2>&1 | Out-Null
Write-Host "      ✅ Prozesse beendet" -ForegroundColor Green

# Schritt 2: Warte auf System-Cleanup
Write-Host "`n[2/4] Warte 10 Sekunden auf System-Cleanup..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
Write-Host "      ✅ Cleanup abgeschlossen" -ForegroundColor Green

# Schritt 3: Prüfe Port 3000
Write-Host "`n[3/4] Prüfe Port 3000 Status..." -ForegroundColor Yellow
$portBusy = netstat -ano | Select-String ":3000.*ABHÖREN"
if ($portBusy) {
    Write-Host "      ⚠️  Port 3000 hat hängende Verbindungen (TIME_WAIT)" -ForegroundColor Yellow
    Write-Host "      ℹ️  Das ist normal - Vite wird trotzdem starten" -ForegroundColor Gray
} else {
    Write-Host "      ✅ Port 3000 ist frei" -ForegroundColor Green
}

# Schritt 4: Starte Dev-Server
Write-Host "`n[4/4] Starte Dev-Server..." -ForegroundColor Yellow
Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              🚀 SERVER WIRD GESTARTET 🚀               ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Starte Server
npm run electron:dev
