# CapCut-Style Video Editor - Product Requirements Document

## Original Problem Statement
Build a full-fledged, cross-platform video editing product (Desktop, Web, Mobile) inspired by CapCut with extensive AI features.

## User's Preferred Language
German (Deutsch)

## Tech Stack
- **Frontend:** React 18 + Vite + Electron
- **Styling:** Tailwind CSS
- **State Management:** React Context + useReducer
- **AI Integration:** Emergent LLM Key (OpenAI, Anthropic, Google Gemini)
- **Storage:** localStorage (browser) / File System (Electron)

---

## What's Been Implemented

### Core UI (✅ Complete - 21.01.2026)

#### Top Toolbar (CapCut-Style)
- 11 Category Icons: Medien, Audio, Text, Sticker, Effekte, Übergänge, Untertitel, Filter, Anpassung, Vorlagen, KI-Avatar
- Logo + Menu Dropdown
- Project Name (editable) + Player Button

#### Left Sidebar (CapCut-Style MediaInputPanel)
Two-column layout (180px navigation + content area):
- **Medien:** Importieren, Deine, KI-Medien, Speicher, Bibliothek
- **Audio:** Importieren, Musik, Soundeffekte, KI-Musik, Text-zu-Sprache
- **Text:** Text hinzufügen, Texteffekte, Textvorlage, Auto-Untertitel

### Timeline (✅ Complete - 21.01.2026)

#### Compact Design (200px fixed height)
- Fits on screen without scrolling
- Full width at bottom of editor
- Expands right, hides under right panel

#### Timeline Controls
- **Toolbar (36px):** Undo, Redo, Split, Delete, Snap, Play/Pause/Stop
- **Time Ruler (20px):** Dynamic tick marks based on zoom level
- **Track Area:** 48px per track with labels on left (120px)
- **Hint Bar (20px):** Shows keyboard shortcuts

#### Scroll & Zoom
- **Shift + Scroll:** Horizontal scrolling (left/right)
- **Ctrl + Scroll:** Zoom in/out (shrink/expand second length)
- **Zoom Buttons:** +/- in toolbar

#### Track Features
- Video and Audio tracks with labels
- "+Video" and "+Audio" buttons to add tracks
- Mute icons per track
- Clips with trim handles (left/right edges)
- Red playhead with diamond indicator

#### Keyboard Shortcuts
- Space: Play/Pause
- B: Split clip at playhead
- Delete: Delete selected clip
- Arrow keys: Frame navigation (when clips selected)

### AI Features (✅ Complete)
- KI-Bild (Image Generation)
- KI-Video (Storyboard Generation)
- Text-zu-Sprache (TTS)
- KI-Musik Generator
- Auto-Untertitel (Whisper)
- KI-Assistent (In-Editor Chat)

---

## Layout Structure

```
+----------------------------------------------------------+
| Top Toolbar (48px) - Logo, Categories, Project Name      |
+----------------------------------------------------------+
|          |                    |                          |
| Media    |    Preview         |  Right Panel (260px)     |
| Panel    |    Area            |  - Eigenschaften Tab     |
| (420px)  |    (flex)          |  - KI-Assistent Tab      |
|          |                    |                          |
+----------+--------------------+--------------------------+
| Timeline (200px fixed) - Full Width                      |
| [Toolbar] [Time Ruler] [Tracks] [Hint Bar]               |
+----------------------------------------------------------+
```

---

## P1/P2/P3 Features Remaining

### P1 - High Priority
- [ ] Real video/audio playback in preview
- [ ] Actual file import and processing
- [ ] Video export rendering (FFmpeg in Electron)

### P2 - Medium Priority
- [ ] Effects & Filters library
- [ ] Transitions between clips
- [ ] Audio waveform visualization
- [ ] Keyframe animation system

### P3 - Future/Backlog
- [ ] Motion tracking
- [ ] Green screen/chroma key
- [ ] Cloud sync & collaboration
- [ ] Direct social media upload

---

## Test Status
- **Last Test:** iteration_6.json (21.01.2026)
- **Frontend Success Rate:** 100%
- **All timeline features working**
- **Compact 200px height verified**
- **Shift+Scroll and Ctrl+Scroll implemented**

---

## Changelog

### 21.01.2026 - Compact Timeline
- Fixed timeline to 200px height (fits on screen)
- Changed layout so timeline spans full width at bottom
- Added Shift+Scroll for horizontal scrolling
- Added Ctrl+Scroll for zoom in/out
- Reduced track height to 48px
- Added hint bar showing keyboard shortcuts
- Fixed NaN display bug in zoom value

### 21.01.2026 - Timeline Implementation
- Completely rewrote TimelinePanel.jsx
- Added Track component with labels
- Added Clip component with trim handles
- Implemented keyboard shortcuts

### 21.01.2026 - CapCut UI Update
- Rewrote TopToolbar.jsx with 11 categories
- Rewrote MediaInputPanel.jsx with two-column layout
- Integrated all AI features into sidebar
