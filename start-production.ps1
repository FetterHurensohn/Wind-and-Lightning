# Start Electron in Production Mode
# Loads from dist/index.html with vendor-react bundle

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                               ║" -ForegroundColor Green
Write-Host "║         🚀 STARTE ELECTRON IN PRODUCTION MODE                 ║" -ForegroundColor White -BackgroundColor DarkGreen
Write-Host "║                                                               ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Set environment variable for production
$env:NODE_ENV = "production"

Write-Host "✅ NODE_ENV = production" -ForegroundColor Green
Write-Host "✅ Lädt von: dist/index.html" -ForegroundColor Green
Write-Host "✅ vendor-react Bundle (keine Chunks)" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Starte Electron..." -ForegroundColor Cyan
Write-Host ""

# Start Electron using npx to ensure it's found
npx electron .
