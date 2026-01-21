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

### Core UI (✅ Complete - Latest Update 21.01.2026)

#### Top Toolbar (CapCut-Style)
- 11 Category Icons: Medien, Audio, Text, Sticker, Effekte, Übergänge, Untertitel, Filter, Anpassung, Vorlagen, KI-Avatar
- Logo + Menu Dropdown
- Project Name (editable) + Player Button
- Clicking categories changes left sidebar navigation

#### Left Sidebar (CapCut-Style MediaInputPanel)
New two-column layout (180px navigation + content area):

**Medien:**
- Importieren, Deine, KI-Medien (KI-Bild, KI-Video, KI-Dialogszene), Speicher, Bibliothek, Dreamina

**Audio:**
- Importieren, Deine, Musik, Soundeffekte, KI-Musik [NEU], Text-zu-Sprache [AI]

**Text:**
- Text hinzufügen, Deine, Texteffekte, Textvorlage, Automatische UT [AI]

**Untertitel:**
- Automatische UT [AI], Manuell hinzufügen, Song-Lyrics [AI], Untertitel-Stile

**KI-Avatar:**
- Avatar erstellen [NEU], Bibliothek, Text-zu-Video [AI], Storyboard [AI]

### AI Features (✅ Complete)

#### 1. KI-Bild (Image Generation)
- Seedream 4.0 Model integration
- Prompt input field
- Aspect ratio selector (9:16, 16:9, 1:1)
- Generate button with Emergent API

#### 2. KI-Video (Video/Storyboard Generation)
- Bild-zu-Video / Text-zu-Video tabs
- Seedance 1.0 Fast Model
- Duration (5s/10s) and aspect ratio settings
- AI-powered storyboard generation

#### 3. Text-zu-Sprache (TTS)
- OpenAI TTS integration
- 5 voice options (Alloy, Echo, Nova, Onyx, Shimmer)
- Character count display
- Audio preview and download

#### 4. KI-Musik Generator
- Genre and mood based suggestions
- AI-powered music recommendations
- Integration with royalty-free platforms

#### 5. Auto-Untertitel (Whisper)
- OpenAI Whisper integration
- Audio/Video file upload
- Multi-language support (German, English, Spanish, etc.)
- Subtitle style options

#### 6. KI-Assistent (In-Editor Chat)
- Real-time AI chat assistant
- Model selection (GPT-5.2, Claude, Gemini)
- Quick suggestions for common tasks

### Editor Layout (✅ Complete)
- Top Toolbar with category navigation
- Left Panel (500px) with CapCut-style sidebar
- Preview Area with playback controls
- Timeline (45% height) with tracks
- Right Panel (280px) with Properties/KI-Assistent tabs

### Dashboard (✅ Complete)
- Feature tiles for all AI tools
- Project management (create, open, delete)
- Search and filter projects

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
│   │       ├── EditorLayout.jsx     # Main layout
│   │       ├── AIChat.jsx           # KI-Assistent
│   │       └── ...
│   ├── hooks/
│   ├── modules/
│   │   ├── ai/
│   │   │   ├── AIClient.js          # AI API integration
│   │   │   └── AIModelSelector.js
│   │   └── ...
│   └── ...
└── electron/
```

---

## P1/P2/P3 Features Remaining

### P1 - High Priority
- [ ] Timeline clip manipulation (trim, split, move)
- [ ] Media import drag-and-drop to timeline
- [ ] Audio waveform visualization
- [ ] Real video rendering/export

### P2 - Medium Priority
- [ ] Effects & Filters library implementation
- [ ] Transitions with presets
- [ ] Keyframe animation system
- [ ] Motion tracking
- [ ] Green screen/chroma key

### P3 - Future/Backlog
- [ ] Cloud sync & collaboration
- [ ] Direct social media upload
- [ ] Templates marketplace
- [ ] Mobile app version
- [ ] Real-time collaboration

---

## Test Status
- **Last Test:** iteration_4.json (21.01.2026)
- **Frontend Success Rate:** 100%
- **All AI panels loading correctly**
- **Category navigation working**
- **Project creation and navigation working**

---

## Known Limitations (Browser Mode)
- Electron APIs not available
- Projects stored in localStorage
- Export generates config JSON (not actual video)

---

## Changelog (Latest)
- **21.01.2026:** Rewrote TopToolbar.jsx and MediaInputPanel.jsx to match CapCut UI
  - Added 11-category top toolbar navigation
  - Implemented two-column left sidebar with dynamic navigation
  - Integrated all AI features into sidebar
  - Added KI-Bild, KI-Video, TTS, KI-Musik, Auto-Untertitel panels
