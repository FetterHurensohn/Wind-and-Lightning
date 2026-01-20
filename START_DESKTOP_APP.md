# CapCut Video Editor - Desktop App starten

## Voraussetzungen

1. **Node.js** (v18 oder höher) installiert
2. **Git** installiert (optional)

## Schnellstart

### 1. Abhängigkeiten installieren (falls noch nicht geschehen)

```bash
cd /app
npm install
# oder
yarn install
```

### 2. Desktop App im Entwicklungsmodus starten

```bash
npm run electron:dev
# oder
yarn electron:dev
```

Dies startet:
- Vite Dev Server auf `http://localhost:3000`
- Electron Desktop-Fenster das den Dev Server lädt
- DevTools für Debugging

### 3. Produktions-Build erstellen

```bash
# Für Windows
npm run electron:build:win

# Für macOS
npm run electron:build:mac

# Für Linux
npm run electron:build:linux

# Für alle Plattformen
npm run electron:build
```

Die fertigen Installer findest du im `dist-electron/` Ordner:
- **Windows**: `.exe` Installer und portable `.exe`
- **macOS**: `.dmg` und `.zip`
- **Linux**: `.AppImage`, `.deb`, `.rpm`

## Tastenkürzel

| Aktion | Windows/Linux | macOS |
|--------|---------------|-------|
| Neues Projekt | Strg+N | Cmd+N |
| Projekt öffnen | Strg+O | Cmd+O |
| Speichern | Strg+S | Cmd+S |
| Medien importieren | Strg+I | Cmd+I |
| Exportieren | Strg+E | Cmd+E |
| Rückgängig | Strg+Z | Cmd+Z |
| Wiederholen | Strg+Shift+Z | Cmd+Shift+Z |
| Clip teilen | B | B |
| Löschen | Entf | Entf |
| Vollbild | F11 | F11 |

## Projektordner

Projekte werden standardmäßig gespeichert in:
- **Windows**: `Dokumente/CapCut Video Editor/Projects/`
- **macOS**: `~/Documents/CapCut Video Editor/Projects/`
- **Linux**: `~/Documents/CapCut Video Editor/Projects/`

Du kannst den Pfad in den Einstellungen ändern.

## Fehlerbehebung

### "Electron konnte nicht gestartet werden"
```bash
npm run postinstall
npm run electron:dev
```

### "Port 3000 bereits belegt"
Beende andere Prozesse auf Port 3000 oder ändere den Port in `vite.config.ts`.

### Build schlägt fehl
```bash
rm -rf node_modules
npm install
npm run electron:build
```
