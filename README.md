# CapCut-Style Video-Editor - Professional Desktop Edition mit Dashboard

Ein pixelnaher, interaktiver Video-Editor im Stil von CapCut/Premiere Pro mit deutscher UI, professionellen Timeline-Features und vollständigem Dashboard-System. **Jetzt als native Desktop-Anwendung mit GPU-Acceleration und lokalem File-System!**

## 🏠 NEU: Dashboard-System

Die App startet jetzt mit einem vollständigen Dashboard (wie CapCut):

- ✅ **Projekt-Übersicht**: 6-Spalten Grid mit Thumbnails, Namen, Größe, Dauer
- ✅ **Türkiser Hero-CTA**: "Neues Projekt erstellen" & "Bestehendes Projekt bearbeiten"
- ✅ **Feature-Tiles**: KI-Model, Automatisch ausschneiden, Sprachausgabe, Qualität optimieren, KI-Dialogszene
- ✅ **Projekt-Verwaltung**: Create, Duplicate, Rename, Delete (mit Undo!)
- ✅ **Search & Filter**: Live-Suche über Projekt-Namen
- ✅ **Multi-Select**: Ctrl/Cmd+Click für mehrere Projekte
- ✅ **Keyboard Shortcuts**: Ctrl+N (Neu), Delete (Löschen), Enter (Öffnen), Escape (Deselect)
- ✅ **localStorage Persistence**: Alle Projekte werden lokal gespeichert
- ✅ **View Toggle**: Grid (6-Spalten) oder List-View
- ✅ **"Zurück zum Dashboard"**: Button im Editor

**Siehe `DASHBOARD-IMPLEMENTATION-COMPLETE.md` für Details!**

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![Electron](https://img.shields.io/badge/Electron-28.1-47848f)
![Vite](https://img.shields.io/badge/Vite-5.0-646cff)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06b6d4)

## 🖥️ Desktop vs. Web

Diese App läuft in **zwei Modi**:

### 🚀 **Desktop-App (Empfohlen)**

```bash
npm run electron:dev     # Entwicklung
npm run electron:build   # Production Build
```

**Vorteile:**

- ✅ **Native GPU-Nutzung** - Volle Hardware-Beschleunigung
- ✅ **Lokales File-System** - Keine Uploads nötig
- ✅ **Frame-Cache** - Schnelle Vorschau ohne Re-Render
- ✅ **Große Projekte** - Keine Browser-Limits
- ✅ **Offline-Arbeit** - Keine Internet-Verbindung nötig
- ✅ **Native Menüs** - Betriebssystem-Integration
- ✅ **Auto-Save** - Projekte automatisch speichern
- ✅ **Video-Codecs** - FFmpeg-Integration vorbereitet

### 🌐 **Web-Version (Prototyp)**

```bash
npm run dev              # Browser-Modus
```

**Einschränkungen:**

- ⚠️ localStorage-Limits
- ⚠️ Keine direkten Dateizugriffe
- ⚠️ Browser-Performance-Limits
- ⚠️ Kein Hardware-Encoding

---

### VideoBar (Top Toolbar)

- ✅ **Pixelgenaues Design** - 56px Höhe, professionelle Icon-Buttons
- ✅ **11 Kategorien-Buttons** - Medien, Audio, Text, Sticker, Effekte, Übergänge, Untertitel, Filter, Anpassung, Vorlagen, KI-Avatar
- ✅ **KI-Panel Dropdown** - Model-Auswahl (Seedance, Stable Diffusion) mit Pro-Badge
- ✅ **Editierbarer Projektname** - Inline-Edit mit Enter/Escape
- ✅ **Export-Modal** - Schnell-Export oder erweiterte Einstellungen (Resolution, FPS, Format, Qualität)
- ✅ **Drag & Drop Import** - Dateien direkt auf VideoBar ziehen
- ✅ **Mini Zoom-Controls** - Zoom In/Out direkt neben Projektnamen
- ✅ **Responsive Design** - Mobile Menu bei < 960px
- ✅ **Tooltips mit Shortcuts** - Alle Buttons zeigen Tooltips und Keyboard-Shortcuts
- ✅ **Vollständige Accessibility** - ARIA-Labels, Keyboard-Navigation, Focus-Management

### Professional Timeline

- ✅ **Timeline Toolbar** mit allen Buttons (Undo/Redo, Split, Delete, Link, Snap, Ripple, Zoom)
- ✅ **Multi-Track-Timeline** mit Video- und Audio-Spuren
- ✅ **Undo/Redo** Stack (bis zu 50 Operationen)
- ✅ **Ripple Edit Mode** - Automatisches Verschieben nachfolgender Clips
- ✅ **Snapping System** - Magnetisch zu Frames, Sekunden, Clip-Kanten, Playhead

### Clip-Operationen

- ✅ **Split at Playhead** (Strg+K) - Teilt Clips an Playhead-Position
- ✅ **Drag & Drop** mit Snap und Ripple-Support
- ✅ **Trim-Handles** mit präziser Frame-Kontrolle
- ✅ **Multi-Selection** (Ctrl+Click)
- ✅ **Copy/Cut/Paste** (Strg+C/X/V)
- ✅ **Context Menu** mit allen Clip-Operationen
- ✅ **Link/Unlink** Video+Audio Clips

### Track Controls

- ✅ **Mute (M)** - Audio-Spur stumm schalten
- ✅ **Solo (S)** - Nur diese Spur hören
- ✅ **Lock (L)** - Spur vor Bearbeitung schützen
- ✅ **Height Resize** - Track-Höhe anpassen (40-300px)
- ✅ **Rename** - Track umbenennen

### Audio Features

- ✅ **Waveform Visualisierung** (simuliert) für Audio-Clips
- ✅ **Detach Audio** - Audio von Video trennen
- ✅ **Audio-Track Management**

### Keyboard Shortcuts (erweitert)

| Shortcut | Aktion |
|----------|--------|
| `Space` | Play/Pause Toggle |
| `←` / `→` | Ein Frame zurück/vor |
| `Shift + ←/→` | 10 Frames zurück/vor |
| `Delete` / `Backspace` | Clip(s) löschen (Ripple wenn aktiv) |
| `Strg/Cmd + K` | An Playhead teilen |
| `Strg/Cmd + Z` | Rückgängig |
| `Strg/Cmd + Shift + Z` | Wiederholen |
| `Strg/Cmd + C` | Kopieren |
| `Strg/Cmd + X` | Ausschneiden |
| `Strg/Cmd + V` | Einfügen |
| `Strg/Cmd + S` | Projekt exportieren |
| `Strg/Cmd + E` | Export-Modal öffnen |
| `Strg/Cmd + +/-` | Zoom In/Out |
| `M` | Medien-Panel öffnen |
| `A` | Audio-Panel öffnen |
| `T` | Text-Panel öffnen |
| `S` | Snapping An/Aus |
| `Esc` | Auswahl aufheben |

### Preview & Playback

- ✅ **Preview-Panel** mit Timecode-Anzeige (HH:MM:SS:FF)
- ✅ **Transport Controls** (Play/Pause/Stop/Step)
- ✅ **Frame-genaue Navigation** mit Keyboard
- ✅ **Smooth Playback** via RequestAnimationFrame

### Eigenschaften & Inspector

- ✅ **Inspector-Panel** mit Live-Editing
- ✅ **Clip-Properties**: Opacity, Scale, Rotation
- ✅ **Metadaten**: Seitenverhältnis, Auflösung, FPS
- ✅ **Layer-Management** mit Z-Index
- ✅ **Proxy-Support** Toggle

### Media Library

- ✅ **Import** von Video/Audio/Bild-Dateien
- ✅ **Thumbnail-Ansicht** mit Dauer
- ✅ **Kategorien**: Medien, Audio, Text, KI-Features
- ✅ **KI-Panel** mit Model-Auswahl (UI-Demo)

### UI & UX

- ✅ **Dunkles, modernes Design** mit Tailwind
- ✅ **Responsive Grid-Layout** (Desktop-optimiert)
- ✅ **Keyboard Shortcuts** (siehe unten)
- ✅ **ARIA-Labels** für Accessibility
- ✅ **Tooltips** bei Drag/Trim-Operationen

## 🚀 Quick Start

### Desktop-App (Empfohlen)

#### Installation

```bash
npm install
```

#### Desktop-App starten

```bash
npm run electron:dev
```

Startet automatisch:

1. Vite Dev Server (<http://localhost:3000>)
2. Electron Desktop-Fenster (mit nativen Menüs)

Die App läuft jetzt **nativ auf deinem Computer** mit voller GPU-Unterstützung!

#### Desktop-App bauen

```bash
# Windows
npm run electron:build:win

# macOS
npm run electron:build:mac

# Linux
npm run electron:build:linux
```

Output: `dist-electron/`

### Web-Version (Nur zum Testen)

```bash
npm run dev
```

Öffnet `http://localhost:3000` im Browser (mit eingeschränkten Features).

### Build für Production (Web)

```bash
npm run build
```

Build-Output in `dist/` Ordner.

## 📁 Projektstruktur (Desktop)

| Shortcut | Aktion |
|----------|--------|
| `Space` | Play/Pause Toggle |
| `←` / `→` | Ein Frame zurück/vor |
| `Shift + ←/→` | 10 Frames zurück/vor |
| `Delete` / `Backspace` | Clip(s) löschen (Ripple wenn aktiv) |
| `Strg/Cmd + K` | An Playhead teilen |
| `Strg/Cmd + Z` | Rückgängig |
| `Strg/Cmd + Shift + Z` | Wiederholen |
| `Strg/Cmd + C` | Kopieren |
| `Strg/Cmd + X` | Ausschneiden |
| `Strg/Cmd + V` | Einfügen |
| `Strg/Cmd + S` | Projekt exportieren |
| `Strg/Cmd + +/-` | Zoom In/Out |
| `M` oder `S` | Snapping An/Aus |
| `Esc` | Auswahl aufheben |

## 🎯 Workflow

### 0. VideoBar nutzen

- **Kategorien-Buttons**: Schneller Zugriff auf Medien, Audio, Text, etc. mit Keyboard-Shortcuts (M, A, T)
- **KI-Panel**: Klick auf KI-Avatar öffnet Dropdown mit Model-Auswahl und Generieren-Button (Pro-Feature-Demo)
- **Projektname**: Klick zum Editieren, Enter speichert, Escape bricht ab (max. 30 Zeichen)
- **Export**: Klick öffnet Modal mit Schnell-Export oder erweiterten Einstellungen
- **Drag & Drop**: Ziehe Dateien direkt auf VideoBar zum Importieren

### 1. Timeline-Toolbar nutzen

- **Undo/Redo**: Alle Operationen sind rückgängig machbar
- **Split**: Teilt Clips präzise an Playhead-Position
- **Link/Unlink**: Verknüpft Video- und Audio-Clips für synchrone Bearbeitung
- **Ripple Mode**: Aktiviert automatisches Verschieben nachfolgender Clips
- **Snap**: Magnetisches Einrasten für präzise Positionierung

### 2. Clips bearbeiten

- **Verschieben**: Ziehe Clip-Body (mit Snap zu Frames/Sekunden/Clips)
- **Trimmen**: Ziehe linke/rechte Handles
- **Splitten**: Playhead positionieren → Strg+K
- **Multi-Select**: Strg+Click für mehrere Clips
- **Löschen**: Delete (normal) oder Ripple Delete (wenn Ripple aktiv)

### 3. Track Controls

- **M**: Mute - Track stumm schalten
- **S**: Solo - Nur diesen Track hören
- **L**: Lock - Track vor Bearbeitung schützen
- **Height**: Unteren Rand ziehen zum Anpassen

### 4. Context Menu

- **Rechtsklick auf Clip**: Vollständiges Menü mit allen Operationen
  - An Playhead teilen
  - Ausschneiden/Kopieren/Einfügen
  - Audio trennen (nur Video-Clips)
  - Eigenschaften

### 5. Copy/Paste Workflow

- Clips auswählen → Strg+C
- Playhead positionieren → Strg+V
- Relative Abstände werden beibehalten

### 6. Ripple Editing

- Ripple-Button in Toolbar aktivieren (gelbe Badge erscheint)
- Clips löschen → nachfolgende Clips rücken automatisch nach links
- Clips verschieben → spätere Clips werden mit verschoben

## 📁 Projektstruktur

```
/src
  /components
    VideoBar.jsx            - Neue pixelgenaue Top-Toolbar mit allen Features
    IconButton.jsx          - Wiederverwendbarer Icon-Button mit Tooltip
    Tooltip.jsx             - Accessible Tooltip-Komponente
    ProBadge.jsx            - "Pro" Label für Premium-Features
    DropdownPanel.jsx       - Generisches Dropdown mit Keyboard-Navigation
    ExportModal.jsx         - Export-Optionen Modal
    TopBar.old.jsx          - Alte TopBar (Backup)
    SidebarLeft.jsx         - Kategorien + Media Library
    KIPanel.jsx             - AI Model Selector + Generate Button (UI-Demo)
    PreviewPanel.jsx        - Video Preview + Timecode
    TransportControls.jsx   - Play/Pause/Stop/Step Controls
    Timeline.jsx            - Timeline mit Tracks, Ruler, Playhead
    TimelineToolbar.jsx     - Timeline-Controls (Undo/Redo/Split/etc.)
    Track.jsx               - Einzelne Timeline-Spur
    TrackControls.jsx       - Track Mute/Solo/Lock/Height
    Clip.jsx                - Draggable/Trimmable Clip
    Waveform.jsx            - Audio-Waveform-Visualisierung
    ContextMenuTimeline.jsx - Right-Click Context Menu
    Inspector.jsx           - Rechte Eigenschaften-Spalte
  /icons
    index.jsx               - Alle SVG-Icon-Komponenten
  /hooks
    usePlayhead.js          - Playback State + RAF Loop
    useDrag.js              - Generic Drag Handler
    useTimelineZoom.js      - Zoom px/sec Management
    useUndoRedo.js          - Undo/Redo Stack Management
    useSnap.js              - Snapping Logic
    useClipboard.js         - Copy/Paste State
    useMultiSelect.js       - Multi-Selection Logic
  /utils
    timecode.js             - Timecode Conversion (HH:MM:SS:FF)
    pxTime.js               - Pixel-to-Time Conversion
    split.js                - Clip-Splitting Logic
    ripple.js               - Ripple Edit Helpers
    link.js                 - Link/Unlink Audio/Video
    snap.js                 - Snap Calculations
    helpers.js              - ID-Gen, Find Clip, etc.
  App.jsx                   - Main Layout + State Management
  main.jsx                  - React Entry Point
  index.css                 - Tailwind + CSS Variables + Animations
```

## 🎨 Design System

### CSS-Variablen

```css
--bg: #0f172a          /* Hintergrund */
--panel: #0b1220        /* Panel-Hintergrund */
--surface: #020617      /* Oberflächen */
--accent: #06b6d4       /* Akzent Cyan (Export) */
--accent-2: #7c3aed     /* Akzent Violett (KI/Pro) */
--muted: #94a3b8        /* Gedämpfte Texte */
--text: #e6eef8         /* Primärer Text */
--hover: rgba(255,255,255,0.04)  /* Hover-Overlay */
--success: #10b981      /* Erfolg Grün */
```

### Farben

- **Clips**: Gradient von Violet zu Purple
- **Playhead**: Rot mit Glow
- **Selection**: Accent-Ring
- **Hover**: Surface-Highlight

## ✅ Akzeptanzkriterien

### VideoBar

- [x] VideoBar hat exakt 56px Höhe, colors matchen Spec
- [x] Alle 11 Kategorien-Icons vorhanden (professionelle SVGs, keine Emojis)
- [x] Tooltips erscheinen nach 300ms bei Hover/Focus mit Shortcuts
- [x] Projektname zentriert mit Grid, Edit-Mode funktioniert (Enter/Escape)
- [x] KI-Avatar Button öffnet Dropdown mit Model-Selector und Pro-Badge
- [x] "Generieren" zeigt Progress (2s) dann "Fertig"
- [x] Export-Button öffnet Modal mit Schnell-Export und erweiterten Optionen
- [x] Drag & Drop: Files auf Bar ziehen zeigt Border, Drop invoked onImport
- [x] Keyboard-Shortcuts funktionieren (M, A, T, Ctrl+E)
- [x] Alle Buttons keyboard-focusable, ARIA-Labels vorhanden
- [x] Focus-Ring sichtbar bei Tab-Navigation
- [x] Responsive: Bei < 960px kollabiert zu Menü-Button
- [x] Mini Zoom-Controls neben Projektname funktionieren

### Timeline Toolbar

- [x] Alle Buttons vorhanden (Undo, Redo, Split, Delete, Link, Snap, Ripple, Add Track, Zoom)
- [x] Tooltips auf Deutsch
- [x] ARIA-Labels und Keyboard-Fokus
- [x] Toggle-States visuell sichtbar (Snap, Ripple)
- [x] Ripple-Badge wenn aktiv

### Clip-Operationen

- [x] Split at Playhead funktioniert (Strg+K)
- [x] Clips können verschoben werden mit Snap
- [x] Trim-Handles ändern Dauer präzise
- [x] Multi-Selection (Strg+Click)
- [x] Copy/Cut/Paste funktioniert
- [x] Delete und Ripple Delete
- [x] Context Menu mit allen Optionen

### Track Controls

- [x] Mute/Solo/Lock funktionieren
- [x] Track-Höhe verstellbar
- [x] Track umbenennen möglich
- [x] Visuelle States (Mute=rot, Solo=gelb, Lock=violett)
- [x] Add Track erstellt neue Spur

### Waveform & Audio

- [x] Waveform wird für Audio-Clips angezeigt
- [x] Waveform skaliert mit Zoom
- [x] Detach Audio erstellt separaten Audio-Clip
- [x] Link/Unlink für Audio+Video

### Undo/Redo

- [x] Alle Operationen rückgängig machbar
- [x] Redo nach Undo funktioniert
- [x] Stack bis 50 Operationen
- [x] Keyboard Shortcuts (Strg+Z, Strg+Shift+Z)

### Snapping & Ripple

- [x] Snap zu Frames funktioniert
- [x] Snap zu Clip-Kanten funktioniert
- [x] Snap zu Playhead funktioniert
- [x] Ripple Delete verschiebt nachfolgende Clips
- [x] Ripple Mode visuell gekennzeichnet

### Keyboard Shortcuts

- [x] Alle Shortcuts aus Tabelle funktionieren
- [x] Shortcuts funktionieren nicht in Inputs
- [x] Space für Play/Pause
- [x] Pfeiltasten für Frame-Step
- [x] Delete für Clip löschen
- [x] Strg+K für Split
- [x] Strg+Z/Shift+Z für Undo/Redo
- [x] Strg+C/X/V für Copy/Cut/Paste
- [x] Strg+S für Export
- [x] Esc für Deselect

### Context Menu

- [x] Right-Click öffnet Context Menu
- [x] Alle Optionen funktional
- [x] Shortcuts angezeigt
- [x] Disabled-States korrekt
- [x] Click außerhalb schließt Menü

### Accessibility

- [x] Alle Buttons keyboard-focusable
- [x] ARIA-Labels vorhanden
- [x] Focus-Ring sichtbar
- [x] Tooltips beschreibend

## 🧪 Demo-Daten

Projekt startet mit:

- **Projektname**: "0117"
- **FPS**: 30
- **3 Demo-Medien**:
  - imatchan002.jpg (5s)
  - Video Clip 1.mp4 (10s)
  - Audio Track.mp3 (15s)
- **2 Tracks** mit 3 platzierten Clips

## 🔧 Technische Details

### State Management

- **useReducer** für zentrale State-Verwaltung
- Actions: `ADD_MEDIA`, `ADD_CLIP`, `MOVE_CLIP`, `TRIM_CLIP`, `UPDATE_CLIP_PROPS`, `DELETE_CLIP`, `SELECT_CLIP`, `TOGGLE_SNAP`

### Hooks

- **usePlayhead**: RAF-Loop für Playback mit Frame-Präzision
- **useDrag**: Generic Drag-Handler für Mouse/Touch
- **useTimelineZoom**: Zoom-Management mit px/sec

### Performance

- Keine schweren 3rd-party Libraries
- Optimierte Re-Renders via useCallback/useMemo
- RequestAnimationFrame für Playback
- CSS-Transformationen für smooth Animationen

## 🚧 Limitierungen

Dieser Prototyp ist ein **UI/UX-Demo** ohne echte Video-Rendering-Pipeline:

- ❌ Keine echte Video-Dekodierung/Playback
- ❌ Keine FFmpeg-Integration
- ❌ Keine GPU-Effekte
- ❌ Keine Echtzeit-Waveform-Analyse
- ❌ KI-Features nur UI-Simulation

Für echte Video-Bearbeitung müsste eine Backend-Integration mit FFmpeg/WebCodecs erfolgen.

## 📝 Lizenz

MIT License - frei verwendbar für Prototyping und Lernen.

## 🤝 Entwicklung

Gebaut mit:

- **React 18.2** - UI-Framework
- **Vite 5.0** - Build-Tool
- **Tailwind CSS 3.4** - Styling
- **JavaScript** (kein TypeScript für diesen Prototyp)

Erstellt als pixelnahe Umsetzung des CapCut/Premiere Pro UI-Designs mit Fokus auf Timeline-Interaktionen und responsive Layout.

---

**Made with ❤️ by Cursor AI**
