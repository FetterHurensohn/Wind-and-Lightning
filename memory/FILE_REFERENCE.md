# 🗂️ Datei-Referenz

> Schnelle Referenz aller wichtigen Dateien mit Zeilennummern

## Root-Komponenten

### `/app/src/App.jsx`
- **Zeile 1-50**: Imports und State
- **Zeile ~60**: `view` State ('dashboard' | 'editor')
- **Zeile ~80**: `handleOpenProject()` - Wechsel zu Editor
- **Zeile ~100**: Render - Conditional Dashboard/Editor

### `/app/src/main.jsx`
- React DOM Root Entry Point
- Keine Änderungen nötig

---

## Dashboard-Komponenten

### `/app/src/components/Dashboard.jsx`
- **Zeile 28-45**: useProjects Hook
- **Zeile 57-60**: `handleNewProject()` - Modal öffnen
- **Zeile 69-85**: `handleOpenProject()` - Projekt öffnen

### `/app/src/components/dashboard/LeftSidebar.jsx`
- **Zeile 10-20**: Navigation Items Definition
- **Zeile 35-40**: Settings Gear Button → öffnet SettingsPanel
- **Zeile 45-52**: Pro Button

### `/app/src/components/dashboard/FeatureTiles.jsx`
- **Zeile 10-45**: Tile Definitionen (KI-Model, Ausschneiden, etc.)
- **Zeile 47-55**: `handleClick()` - Modal öffnen
- **Zeile 95-110**: AI Features Modal Render
- **Zeile 112-120**: AI Settings Modal Render

### `/app/src/components/dashboard/NewProjectModal.jsx`
- Projekt-Erstellung Dialog
- **Zeile ~50**: `handleCreate()` - Projekt erstellen

---

## Editor-Komponenten

### `/app/src/components/editor/EditorLayout.jsx`
- **Zeile 1-100**: State und Reducer Setup
- **Zeile ~150**: Timeline Panel
- **Zeile ~200**: Preview Panel
- **Zeile ~250**: Media Panel
- **Zeile ~300**: AI Chat Panel

### `/app/src/components/editor/TimelinePanel.jsx`
- **Zeile ~50**: Track-Rendering
- **Zeile ~150**: Clip-Rendering
- **Zeile ~250**: Playhead

### `/app/src/components/editor/PreviewPanel.jsx`
- Video-Player Komponente
- Transport-Controls

---

## KI-Komponenten

### `/app/src/components/editor/AIChat.jsx`
- **Zeile 1-30**: Imports und State
- **Zeile 35-45**: Model Selection State
- **Zeile 50-60**: Chat Client Initialisierung
- **Zeile 80-120**: `handleSend()` - Nachricht senden
- **Zeile 150-200**: Message Rendering
- **Zeile 220-250**: Input Area

### `/app/src/components/editor/AIFeaturesPanel.jsx`
- **Zeile 15-20**: Feature Tabs Definition
- **Zeile 40-60**: Feature-spezifische States
- **Zeile 80-150**: `handleGenerate()` - KI-Generierung
- **Zeile 160-280**: `renderFeatureContent()` - Tab-Inhalte
- **Zeile 300-350**: Tab Navigation
- **Zeile 360-400**: Result Display

### `/app/src/components/editor/AIModelSelectorUI.jsx`
- **Zeile 15-80**: `ModelSelector` Dropdown Komponente
- **Zeile 90-200**: `AISettingsPanel` Modal

### `/app/src/components/editor/AutoCaptionPanel.jsx`
- **Zeile 15-30**: Sprachen und Styles
- **Zeile 50-75**: `handleGenerate()` - Untertitel generieren
- **Zeile 100-150**: Caption List Rendering

---

## KI-Module

### `/app/src/modules/ai/AIModelSelector.js`
- **Zeile 8-50**: `AI_PROVIDERS` - Alle Provider und Modelle
- **Zeile 55-60**: `DEFAULT_MODEL`
- **Zeile 65-100**: `AI_FUNCTION_MODELS` - Empfehlungen pro Funktion
- **Zeile 110-130**: `loadAISettings()` / `saveAISettings()`
- **Zeile 140-160**: `getModelForFunction()`

### `/app/src/modules/ai/AIClient.js`
- **Zeile 10-15**: API-Konfiguration
- **Zeile 25-35**: `generateSessionId()`
- **Zeile 40-150**: `AIChat` Klasse
  - **Zeile 50-70**: Constructor
  - **Zeile 80-120**: `sendMessage()`
  - **Zeile 130-180**: `sendMessageStream()`
- **Zeile 200-220**: `quickPrompt()` Helper
- **Zeile 230-250**: `VIDEO_EDITOR_SYSTEM_PROMPT`

---

## Einstellungen

### `/app/src/components/SettingsPanel.jsx`
- **Zeile 10-25**: `SECTIONS` Definition (Allgemein, KI-Modelle, etc.)
- **Zeile 30-80**: Setting-Komponenten (Toggle, Select, Slider)
- **Zeile 95-130**: `renderSection()` - Abschnitt-Rendering
- **Zeile 140-200**: KI-Modelle Tab Content
- **Zeile 380-430**: Modal Layout

### `/app/src/modules/settings/SettingsManager.js`
- Settings Persistence
- Default Settings

---

## Icons

### `/app/src/components/editor/Icon.jsx`
- **Zeile 18-170**: `iconPaths` - Alle verfügbaren Icons
- Verfügbare Icons:
  ```
  media, audio, text, sticker, effects, transitions, subtitles, filter,
  adjustment, templates, ai, share, export, undo, redo, split, delete,
  link, unlink, snap, play, pause, stop, volume, mute, fullscreen,
  zoomIn, zoomOut, search, plus, close, chevronDown, chevronRight,
  folder, file, video, image, user, clock, trash, copy, edit, lock,
  unlock, star, heart, download, upload, refresh, cpu, keyboard,
  accessibility, palette, timeline, check, info, settings, x, send,
  alertCircle, save, globe, type
  ```

---

## Hooks

### `/app/src/hooks/useProjects.js`
- Projekt CRUD Operationen
- `create()`, `update()`, `delete()`, `duplicate()`

### `/app/src/hooks/useModal.js`
- Modal State Management
- `open()`, `close()`, `isOpen()`

### `/app/src/hooks/useToast.js`
- Toast Notifications
- `show(message, type, duration)`

### `/app/src/hooks/useUndoRedo.js`
- History Management
- `undo()`, `redo()`, `canUndo`, `canRedo`

---

## Styles

### `/app/src/index.css`
- **Zeile 1-3**: Tailwind Imports
- **Zeile 10-50**: CSS Variables (Farben)
- **Zeile 60-100**: Animations (fadeIn, scaleIn, slideDown)
- **Zeile 110-150**: Custom Scrollbar
- **Zeile 160-200**: Utility Classes
