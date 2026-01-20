# UUID-basierte Projektstruktur - Initializer Script
#
# Erstellt eine vollständige Projektordner-Struktur für Video-Editor
# Verwendung: .\init-project.ps1 -ProjectName "MeinProjekt" [-BasePath "C:\Projects"]

param(
    [Parameter(Mandatory=$true, HelpMessage="Name des Projekts (ohne ungültige Zeichen)")]
    [string]$ProjectName,
    
    [Parameter(Mandatory=$false)]
    [string]$BasePath = "C:\Users\jacqu\OneDrive\Desktop\Wind and Lightning Projekts\com.lveditor.draft",
    
    [Parameter(Mandatory=$false)]
    [int]$FPS = 30,
    
    [Parameter(Mandatory=$false)]
    [int]$Width = 1920,
    
    [Parameter(Mandatory=$false)]
    [int]$Height = 1080
)

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                               ║" -ForegroundColor Cyan
Write-Host "║          UUID-basiertes Projekt Initializer Script           ║" -ForegroundColor White
Write-Host "║                                                               ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Validierung: Ungültige Zeichen
if ($ProjectName -match '[<>:"/\\|?*]') {
    Write-Error "❌ Ungültige Zeichen im Projektnamen: < > : `" / \ | ? *"
    exit 1
}

# Validierung: Länge
if ($ProjectName.Length -gt 255) {
    Write-Error "❌ Projektname zu lang (max. 255 Zeichen)"
    exit 1
}

# Validierung: Leerzeichen
if ($ProjectName.Trim() -ne $ProjectName) {
    Write-Error "❌ Projektname darf keine führenden/folgenden Leerzeichen haben"
    exit 1
}

$ProjectPath = Join-Path $BasePath $ProjectName

# Prüfe ob Projekt bereits existiert
if (Test-Path $ProjectPath) {
    Write-Error "❌ Projekt existiert bereits: $ProjectPath"
    exit 1
}

Write-Host "📁 Projekt-Pfad: $ProjectPath" -ForegroundColor Yellow
Write-Host ""

# Erstelle Ordnerstruktur
Write-Host "📂 Erstelle Ordnerstruktur..." -ForegroundColor Cyan

$Dirs = @(
    "assets\media\video",
    "assets\media\audio",
    "assets\media\images",
    "assets\proxies",
    "timeline\history",
    "cache\thumbnails",
    "cache\waveforms",
    "cache\render_cache",
    "metadata\color_grading",
    "logs"
)

foreach ($Dir in $Dirs) {
    $FullPath = Join-Path $ProjectPath $Dir
    New-Item -ItemType Directory -Path $FullPath -Force | Out-Null
    Write-Host "  ✅ $Dir" -ForegroundColor Green
}

Write-Host ""
Write-Host "📄 Erstelle Manifest-Dateien..." -ForegroundColor Cyan

# 1. project.json
$ProjectJson = @{
    project_id = [guid]::NewGuid().ToString()
    name = $ProjectName
    created_at = (Get-Date).ToUniversalTime().ToString("o")
    last_saved_at = (Get-Date).ToUniversalTime().ToString("o")
    version = "1.0.0"
    fps = $FPS
    resolution = @{ width = $Width; height = $Height }
    sample_rate = 48000
    active_timeline = "timeline/timeline_v1.json"
    assets_index = "assets/index.json"
    settings_file = "settings.json"
} | ConvertTo-Json -Depth 10

$ProjectJson | Out-File -FilePath (Join-Path $ProjectPath "project.json") -Encoding utf8
Write-Host "  ✅ project.json" -ForegroundColor Green

# 2. assets/index.json
$AssetsIndex = @{
    version = "1.0.0"
    assets = @{}
} | ConvertTo-Json

$AssetsIndex | Out-File -FilePath (Join-Path $ProjectPath "assets\index.json") -Encoding utf8
Write-Host "  ✅ assets/index.json" -ForegroundColor Green

# 3. timeline/timeline_v1.json
$Timeline = @{
    version = "1.0.0"
    saved_at = (Get-Date).ToUniversalTime().ToString("o")
    duration = 0
    tracks = @(
        @{
            id = "t2"
            name = "Main Track"
            type = "audio"
            clips = @()
            muted = $false
            locked = $false
            height = 80
        }
    )
} | ConvertTo-Json -Depth 10

$Timeline | Out-File -FilePath (Join-Path $ProjectPath "timeline\timeline_v1.json") -Encoding utf8
Write-Host "  ✅ timeline/timeline_v1.json" -ForegroundColor Green

# 4. settings.json
$Settings = @{
    autosave_interval = 300
    proxy_quality = "720p"
    cache_limit_gb = 1
    use_proxy = $true
} | ConvertTo-Json

$Settings | Out-File -FilePath (Join-Path $ProjectPath "settings.json") -Encoding utf8
Write-Host "  ✅ settings.json" -ForegroundColor Green

# 5. metadata/markers.json
$Markers = @{
    markers = @()
    chapters = @()
    comments = @()
} | ConvertTo-Json

$Markers | Out-File -FilePath (Join-Path $ProjectPath "metadata\markers.json") -Encoding utf8
Write-Host "  ✅ metadata/markers.json" -ForegroundColor Green

# 6. Log-Dateien
"" | Out-File -FilePath (Join-Path $ProjectPath "logs\autosave.log") -Encoding utf8
"" | Out-File -FilePath (Join-Path $ProjectPath "logs\errors.log") -Encoding utf8
Write-Host "  ✅ Log-Dateien" -ForegroundColor Green

# 7. .lock Datei
$Lock = @{
    user = $env:USERNAME
    hostname = $env:COMPUTERNAME
    pid = $PID
    openedAt = (Get-Date).ToUniversalTime().ToString("o")
} | ConvertTo-Json

$Lock | Out-File -FilePath (Join-Path $ProjectPath ".lock") -Encoding utf8
Write-Host "  ✅ .lock" -ForegroundColor Green

Write-Host ""

# OneDrive-Warnung
if ($ProjectPath.ToLower().Contains("onedrive")) {
    Write-Host "⚠️  WARNUNG: Projekt liegt in OneDrive" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Empfehlung:" -ForegroundColor Yellow
    Write-Host "   • Schließe 'cache/' von der OneDrive-Synchronisation aus" -ForegroundColor Gray
    Write-Host "   • Große Media-Dateien extern verlinken statt kopieren" -ForegroundColor Gray
    Write-Host ""
}

# Zusammenfassung
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                               ║" -ForegroundColor Green
Write-Host "║                  ✅ Projekt erfolgreich erstellt! ✅          ║" -ForegroundColor White
Write-Host "║                                                               ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Projekt-Pfad:" -ForegroundColor Cyan
Write-Host "   $ProjectPath" -ForegroundColor White
Write-Host ""
Write-Host "🎬 Projekt-Details:" -ForegroundColor Cyan
Write-Host "   Name:       $ProjectName" -ForegroundColor White
Write-Host "   Auflösung:  ${Width}x${Height}" -ForegroundColor White
Write-Host "   FPS:        $FPS" -ForegroundColor White
Write-Host ""
Write-Host "📂 Ordner erstellt:" -ForegroundColor Cyan
Write-Host "   • assets/media/ (video, audio, images)" -ForegroundColor Gray
Write-Host "   • assets/proxies/" -ForegroundColor Gray
Write-Host "   • timeline/ (mit history)" -ForegroundColor Gray
Write-Host "   • cache/ (thumbnails, waveforms)" -ForegroundColor Gray
Write-Host "   • metadata/" -ForegroundColor Gray
Write-Host "   • logs/" -ForegroundColor Gray
Write-Host ""
Write-Host "📄 Dateien erstellt:" -ForegroundColor Cyan
Write-Host "   • project.json (Projekt-Manifest)" -ForegroundColor Gray
Write-Host "   • assets/index.json (Asset-Registry)" -ForegroundColor Gray
Write-Host "   • timeline/timeline_v1.json (Timeline)" -ForegroundColor Gray
Write-Host "   • settings.json (Einstellungen)" -ForegroundColor Gray
Write-Host "   • .lock (Lock-Datei)" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Nächste Schritte:" -ForegroundColor Cyan
Write-Host "   1. Öffne das Projekt im Video-Editor" -ForegroundColor White
Write-Host "   2. Importiere Media-Dateien" -ForegroundColor White
Write-Host "   3. Starte mit dem Editieren!" -ForegroundColor White
Write-Host ""
