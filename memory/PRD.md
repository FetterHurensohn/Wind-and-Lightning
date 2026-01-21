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

---

## What's Been Implemented

### Layout (✅ Complete - 21.01.2026)

```
+------------------------------------------------------------------+
| Top Toolbar (48px) - Logo, 11 Categories, Project Name           |
+------------------------------------------------------------------+
|          |                         |                              |
| Sidebar  | Media Panel  | Preview  |  Right Panel (280px)        |
| (130px)  | (360px)      | (flex)   |  - Eigenschaften            |
|          |              |          |  - KI-Assistent             |
|          | 50% Height   |          |                              |
|          |              |          |  FULL HEIGHT                 |
+----------+--------------+----------+                              |
| Timeline (50% Height)              |                              |
| [Toolbar] [Ruler] [Tracks]         |                              |
+------------------------------------+------------------------------+
```

**50/50 Split:**
- Upper half: Media Panel (360px) + Preview
- Lower half: Timeline with tracks
- Right panel: Full height (spans both sections)

### Drag and Drop (✅ Complete)
- MediaTile component has `draggable={true}`
- Shows "DRAG" badge on hover
- Timeline tracks have drop handlers
- Visual highlight when dragging over track (turquoise glow)
- Drop creates clip at mouse position

### Timeline Features
- Shift + Scroll = Horizontal scrolling
- Ctrl + Scroll = Zoom in/out
- Track height: 48px
- Track labels: 120px left column
- +Video / +Audio buttons
- Keyboard shortcuts shown in hint bar

### AI Features (✅ Complete)
- KI-Bild (Image Generation) - Seedream 4.0
- KI-Video (Storyboard Generation) - Seedance 1.0
- Text-zu-Sprache (TTS) - OpenAI TTS
- KI-Musik Generator
- Auto-Untertitel (Whisper)
- KI-Assistent (In-Editor Chat)

---

## P1/P2/P3 Features Remaining

### P1 - High Priority
- [ ] Real video/audio playback in preview
- [ ] Video export rendering (FFmpeg in Electron)
- [ ] Audio waveform visualization

### P2 - Medium Priority
- [ ] Effects & Filters library
- [ ] Transitions between clips
- [ ] Keyframe animation system

### P3 - Future/Backlog
- [ ] Motion tracking
- [ ] Green screen/chroma key
- [ ] Cloud sync & collaboration
- [ ] Direct social media upload

---

## Test Status
- **Last Test:** iteration_7.json (21.01.2026)
- **Frontend Success Rate:** 100%
- **Verified:** Layout 50/50 split, Drag-and-Drop, Track management

---

## Changelog

### 21.01.2026 - Layout & Drag-Drop
- Changed to 50/50 vertical split (Media+Preview / Timeline)
- Right panel now spans full height
- Reduced Media Panel width to 360px
- Reduced Sidebar to 130px
- Added draggable MediaTile with DRAG badge
- Added Track drop handlers with visual feedback

### 21.01.2026 - Compact Timeline
- Fixed timeline to 50% height
- Shift+Scroll for horizontal scrolling
- Ctrl+Scroll for zoom
- Track height 48px, compact UI

### 21.01.2026 - CapCut UI
- TopToolbar with 11 categories
- MediaInputPanel with two-column layout
- Integrated AI features
