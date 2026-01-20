# Electron Desktop App - Build & Entwicklung

## 🖥️ Desktop App Features

Die Desktop-Version bietet folgende native Features:

### ✅ Implementiert:
- **Native File System** - Direkte Projektdateien ohne Upload
- **Hardware Acceleration** - GPU für Video-Rendering
- **Frame Cache System** - Lokaler Cache für schnelle Vorschau
- **Native Menüs** - Datei, Bearbeiten, Ansicht, Hilfe
- **IPC Communication** - Sichere Main ↔ Renderer Kommunikation
- **Auto-Save** - Projektdateien (.veproj)
- **Multi-Codec Support** - Vorbereitet für FFmpeg-Integration
- **Offline-First** - Keine Cloud-Abhängigkeit

## 🚀 Entwicklung

### Desktop App starten:
```bash
npm run electron:dev
```

Startet:
1. Vite Dev Server (http://localhost:3000)
2. Electron App (lädt automatisch nach Vite-Start)

### Nur Web-Version:
```bash
npm run dev
```

## 📦 Build

### Windows:
```bash
npm run electron:build:win
```

Erstellt:
- `.exe` Installer (NSIS)
- Portable `.exe`

Output: `dist-electron/`

### macOS:
```bash
npm run electron:build:mac
```

Erstellt:
- `.dmg` Installer
- `.app` Bundle
- `.zip` Archiv

### Linux:
```bash
npm run electron:build:linux
```

Erstellt:
- `.AppImage`
- `.deb` (Debian/Ubuntu)
- `.rpm` (Red Hat/Fedora)

## 🎯 Architektur

```
electron/
├── main.cjs          # Main Process (Node.js)
│   ├── Window Management
│   ├── Native Menus
│   ├── File System APIs
│   ├── Cache System
│   └── IPC Handlers
│
├── preload.js        # Preload Script (Bridge)
│   └── Expose APIs zu Renderer
│
src/
├── electron.js       # Electron API Wrapper
│   └── Browser-Fallbacks
│
└── App.jsx          # React App
    └── Electron Event Listeners
```

## 🔧 Native APIs

### Projekt speichern:
```javascript
import electronAPI from './electron';

const result = await electronAPI.project.save(projectData);
// { success: true, path: "C:/Users/.../projekt.veproj" }
```

### Frame cachen:
```javascript
await electronAPI.cache.saveFrame(clipId, frameNumber, dataURL);
const frame = await electronAPI.cache.loadFrame(clipId, frameNumber);
```

### System Info:
```javascript
const info = await electronAPI.system.getInfo();
// { platform, arch, version, cachePath, ... }
```

## ⚙️ Konfiguration

### Build-Einstellungen (`package.json`):

```json
{
  "build": {
    "appId": "com.videoeditor.capcut",
    "productName": "CapCut Video Editor",
    "win": {
      "target": ["nsis", "portable"]
    },
    "mac": {
      "target": ["dmg", "zip"],
      "category": "public.app-category.video"
    },
    "linux": {
      "target": ["AppImage", "deb", "rpm"],
      "category": "Video"
    }
  }
}
```

### Hardware Acceleration:

Main Process aktiviert automatisch:
- `enable-gpu-rasterization`
- `enable-zero-copy`
- WebGL, Accelerated Video

## 🎨 Icons

Platziere Icons in `build/`:
- `build/icon.ico` - Windows
- `build/icon.icns` - macOS
- `build/icons/` - Linux (verschiedene Größen)

## 🔐 Sicherheit

### Context Isolation:
- `nodeIntegration: false`
- `contextIsolation: true`
- `webSecurity: true`

Alle Node.js APIs sind nur im Main Process verfügbar.
Renderer erhält nur sichere, exponierte APIs via Preload.

## 📊 Performance

### Cache-Verzeichnis:
- Windows: `C:/Users/{user}/AppData/Roaming/capcut-video-editor/cache/frames/`
- macOS: `~/Library/Application Support/capcut-video-editor/cache/frames/`
- Linux: `~/.config/capcut-video-editor/cache/frames/`

### GPU Acceleration:
Automatisch aktiviert für:
- Video-Decoding
- Canvas-Rendering
- WebGL-Effekte

## 🐛 Debugging

### DevTools öffnen:
- Menü: `Ansicht > Entwicklertools`
- Shortcut: `Ctrl+Shift+I` (Windows/Linux), `Cmd+Option+I` (macOS)

### Console Logs:
Main Process logs: Terminal
Renderer Process logs: DevTools Console

## 📝 Entwickler-Notizen

### Browser vs. Desktop:

Die App funktioniert in beiden Modi:

**Browser-Modus** (`npm run dev`):
- localStorage für Cache
- Download für Export
- File Input für Import

**Desktop-Modus** (`npm run electron:dev`):
- Native File System
- Disk Cache
- Native Dialogs

### Environment Detection:
```javascript
import { envAPI } from './electron';

if (envAPI.isElectron) {
  // Desktop-specific code
} else {
  // Browser fallback
}
```

## 🚧 Geplante Features

- [ ] FFmpeg-Integration für Video-Encoding
- [ ] Hardware-Encoder (NVENC, QuickSync)
- [ ] Echtzeit-Waveform-Analyse
- [ ] Auto-Updates (electron-updater)
- [ ] Crash-Reporter

## 📄 Lizenz

MIT License
