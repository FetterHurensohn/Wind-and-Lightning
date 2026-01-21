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
- Clicking categories changes left sidebar navigation

#### Left Sidebar (CapCut-Style MediaInputPanel)
Two-column layout (180px navigation + content area):

**Medien:** Importieren, Deine, KI-Medien (KI-Bild, KI-Video, KI-Dialogszene), Speicher, Bibliothek, Dreamina
**Audio:** Importieren, Deine, Musik, Soundeffekte, KI-Musik [NEU], Text-zu-Sprache [AI]
**Text:** Text hinzufügen, Deine, Texteffekte, Textvorlage, Automatische UT [AI]
**Untertitel:** Automatische UT [AI], Manuell hinzufügen, Song-Lyrics [AI], Untertitel-Stile
**KI-Avatar:** Avatar erstellen [NEU], Bibliothek, Text-zu-Video [AI], Storyboard [AI]

### Timeline (✅ Complete - 21.01.2026)

#### Timeline Toolbar
- Undo/Redo buttons
- Split, Delete, Snap buttons
- Transport controls: Skip back, Frame back, Play/Pause, Stop, Frame forward
- Timecode display (current / total duration)
- Zoom In/Out controls

#### Track System
- Video and Audio tracks with labels (150px left column)
- Mute/Lock icons per track
- "+Video" and "+Audio" buttons to add new tracks
- Empty state placeholder: "Medien hierher ziehen"

#### Clip Features
- Color-coded by type (Video=blue, Audio=green, Image=purple, Text=yellow)
- Trim handles (left/right edges)
- Drag-and-drop for repositioning
- Selection highlight with white ring

#### Playhead
- Red vertical line with diamond head indicator
- Updates position during playback

#### Keyboard Shortcuts
- Space: Play/Pause
- B: Split clip at playhead
- Delete/Backspace: Delete selected clip
- Ctrl+Z: Undo
- Ctrl+Y: Redo
- Ctrl+C/V: Copy/Paste
- Arrow Left/Right: Frame navigation

### AI Features (✅ Complete)

#### 1. KI-Bild (Image Generation)
- Seedream 4.0 Model integration
- Prompt input, aspect ratio selector
- Generate button with Emergent API

#### 2. KI-Video (Video/Storyboard Generation)
- Bild-zu-Video / Text-zu-Video tabs
- Seedance 1.0 Fast Model
- Duration and aspect ratio settings

#### 3. Text-zu-Sprache (TTS)
- OpenAI TTS integration
- 5 voice options (Alloy, Echo, Nova, Onyx, Shimmer)

#### 4. KI-Musik Generator
- Genre and mood based suggestions

#### 5. Auto-Untertitel (Whisper)
- OpenAI Whisper integration
- Multi-language support

#### 6. KI-Assistent (In-Editor Chat)
- Real-time AI chat assistant
- Model selection (GPT-5.2, Claude, Gemini)

---

## Architecture

```
/app/
├── memory/                # Documentation System
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   └── editor/
│   │       ├── TopToolbar.jsx       # Category navigation
│   │       ├── MediaInputPanel.jsx  # CapCut-style left panel
│   │       ├── TimelinePanel.jsx    # Complete timeline with tracks
│   │       ├── EditorLayout.jsx     # Main layout
│   │       └── AIChat.jsx           # KI-Assistent
│   ├── hooks/
│   │   ├── useTimelineZoom.js       # Zoom functionality
│   │   └── useProjects.js           # Project management
│   ├── modules/
│   │   └── ai/
│   │       └── AIClient.js          # AI API integration
│   └── ...
└── electron/
```

---

## P1/P2/P3 Features Remaining

### P1 - High Priority
- [ ] Real video/audio playback in preview
- [ ] Actual file import and processing
- [ ] Video export rendering (FFmpeg in Electron)

### P2 - Medium Priority
- [ ] Effects & Filters library with preview
- [ ] Transitions between clips
- [ ] Audio waveform visualization
- [ ] Keyframe animation system

### P3 - Future/Backlog
- [ ] Motion tracking
- [ ] Green screen/chroma key
- [ ] Cloud sync & collaboration
- [ ] Direct social media upload
- [ ] Templates marketplace
- [ ] Mobile app version

---

## Test Status
- **Last Test:** iteration_5.json (21.01.2026)
- **Frontend Success Rate:** 100%
- **All timeline features working**
- **All AI panels verified**
- **Track management working**

---

## Changelog

### 21.01.2026 - Timeline Implementation
- Completely rewrote TimelinePanel.jsx
- Added Track component with labels (150px column)
- Added Clip component with trim handles
- Added TimeRuler with tick marks
- Added Timeline Toolbar with transport controls
- Added +Video/+Audio buttons for track management
- Implemented keyboard shortcuts
- Added drag-and-drop support

### 21.01.2026 - CapCut UI Update
- Rewrote TopToolbar.jsx with 11 categories
- Rewrote MediaInputPanel.jsx with two-column layout
- Integrated all AI features into sidebar

---

## Known Limitations (Browser Mode)
- Electron APIs not available
- Projects stored in localStorage
- Export generates config JSON (not actual video)
- No real video playback (placeholder preview)
