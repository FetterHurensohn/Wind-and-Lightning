# 🔧 STRUKTUR WIEDERHERSTELLUNG SCRIPT
# Führe dieses Script aus, wenn die Struktur nach Neustart kaputt ist

Write-Host ""
Write-Host "🔧 STRUKTUR WIEDERHERSTELLUNG" -ForegroundColor Cyan
Write-Host ""

# Prüfe ob Backup existiert
if (Test-Path "src/components/editor/EditorLayout.BACKUP.jsx") {
    Write-Host "✅ Backup gefunden" -ForegroundColor Green
    
    # Erstelle Backup der aktuellen (kaputten) Datei
    Copy-Item "src/components/editor/EditorLayout.jsx" -Destination "src/components/editor/EditorLayout.BROKEN.jsx" -Force
    Write-Host "📁 Kaputte Version gesichert als: EditorLayout.BROKEN.jsx" -ForegroundColor Yellow
    
    # Stelle korrekte Version wieder her
    Copy-Item "src/components/editor/EditorLayout.BACKUP.jsx" -Destination "src/components/editor/EditorLayout.jsx" -Force
    Write-Host "✅ Korrekte Struktur wiederhergestellt!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔄 Bitte starte die App neu:" -ForegroundColor Yellow
    Write-Host "   npm run electron:dev" -ForegroundColor White
} else {
    Write-Host "❌ Backup nicht gefunden!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Manuelle Korrektur nötig in EditorLayout.jsx:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Zeile ~391-393 muss sein:" -ForegroundColor White
    Write-Host "  <div className='flex-1 bg-[var(--bg-main)] overflow-hidden'>" -ForegroundColor Gray
    Write-Host "    <TimelinePanel />" -ForegroundColor Gray
    Write-Host "  </div>" -ForegroundColor Gray
    Write-Host ""
    Write-Host "WICHTIG: Timeline MUSS 'flex-1' haben, NICHT 'h-[50vh]'!" -ForegroundColor Red
}

Write-Host ""
