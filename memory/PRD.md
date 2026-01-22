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

### Visual Transitions (✅ Complete - 22.01.2026)
**12 Transition Types:**
- Überblendung (Fade)
- Auflösen (Dissolve)
- Wischen Links/Rechts/Hoch/Runter (Wipe)
- Zoom Rein/Raus
- Schieben Links/Rechts (Slide)
- Drehen (Rotate)
- Umklappen (Flip)

**Transition Features:**
- Applied via Übergänge tab to selected clip
- Visual rendering with easing in PreviewPanel
- Duration configurable

### Video Export (✅ Complete - 22.01.2026)
**Export Dialog:**
- Resolution: 480p, 720p HD, 1080p Full HD, 1440p 2K, 4K Ultra HD (Pro), 8K (Pro)
- FPS: 24, 25, 30, 50, 60 fps
- Format: MP4, MOV, WebM, GIF
- Codec: H.264, H.265 (HEVC), VP9, ProRes
- Quality slider (10-100%)
- Estimated file size display

**FFmpeg.wasm Integration:**
- Toggle between demo and real export
- Progress phases: Vorbereitung, Frames rendern, Audio mischen, Video kodieren, Finalisierung
- Downloads actual video file (in Electron app)

### Sticker Library (✅ Complete - 22.01.2026)
**6 Sticker Categories:**
- 🔥 Angesagt (Popular)
- 😀 Emojis
- 🐶 Tiere
- 🍔 Essen
- ❤️ Symbole
- 🔷 Formen

**Sticker Features:**
- Click to add to dedicated Sticker track (pink)
- Inspector panel: Size slider (24-256px), animations, quick replace
- 6 animations: bounce, pulse, spin, shake, swing

### Track Controls (✅ Complete - 22.01.2026)
**Functional Controls:**
- 🔊 **Mute:** Muted tracks have no audio in preview
- 👁 **Hide:** Hidden tracks not rendered in preview
- 🔒 **Lock:** Locked tracks show overlay, prevent editing
- 🗑 **Delete:** Remove track with confirmation
- 🎚 **Volume/Opacity slider:** Hover to adjust

### Advanced Track System (✅ Complete - 21.01.2026)
**Four Track Types:**
- **Video Track:** Blue background, blue clips
- **Audio Track:** Green background, green clips
- **Text Track:** Yellow background, yellow clips (text clips go here!)
- **Sticker Track:** Pink background, pink clips

**Clip Management (✅ Fixed - 21.01.2026):**
- **Text to Text Track:** Text clips now go to Text track, not Video track
- **Clip Swapping:** Clips swap positions when overlapping instead of overlapping
- **Vertical Drag:** Drag clip vertically (>30px) to create new track above/below
- **Visual Feedback:** Turquoise indicator shows during vertical drag

### Media to Timeline (✅ Complete)
- **+ Button:** Large turquoise button on hover
- **Double-Click:** Add to end of last clip
- **Drag-and-Drop:** Add at specific position

### Text Overlay System (✅ Complete)
- 5 text styles (Titel, Untertitel, Fließtext, etc.)
- Full text editing in Inspector
- Text effects (Shadow, Outline, Glow, Neon, Gradient)

### Visual Effect Rendering (✅ Complete)
- CSS filter effects
- Animated effects (shake, glitch)

### Timeline (✅ Complete)
- 1-Hour duration
- Fine tick marks
- Shift+Scroll / Ctrl+Scroll

### Videoeffekte & Übergänge (✅ Complete)
- 12 video effects, 12 transitions

### AI Features (✅ Complete)
- KI-Bild, KI-Video, TTS, KI-Musik
- Auto-Untertitel, KI-Assistent

---

## P1/P2/P3 Features Remaining

### P1 - High Priority
- [ ] Keyframe animation system
- [ ] Real audio waveform generation

### P2 - Medium Priority
- [ ] GIPHY API integration for stickers
- [ ] Cloud video processing for larger exports

### P3 - Future/Backlog
- [ ] Motion tracking
- [ ] Green screen/chroma key
- [ ] Cloud sync & collaboration

---

## Changelog

### 22.01.2026 - Visual Transitions & Video Export
- **Visual Transitions:** 12 transition types (fade, dissolve, wipe, zoom, slide, rotate, flip) with easing
- **Video Export Dialog:**
  - Resolution options (480p to 8K)
  - FPS options (24, 25, 30, 50, 60 fps)
  - Format options (MP4, MOV, WebM, GIF)
  - Codec selection (H.264, H.265, VP9, ProRes)
  - Quality slider
  - FFmpeg.wasm toggle (demo vs real export)
  - Progress phases display

### 22.01.2026 - Sticker Library & Track Controls
- **Sticker Library:** 6 categories (Angesagt, Emojis, Tiere, Essen, Symbole, Formen)
- **Sticker Inspector:** Size slider (24-256px), 6 animations, quick replace grid
- **Track Controls Connected:**
  - Mute: Muted tracks have no audio in preview
  - Hide: Hidden tracks not rendered in preview
  - Lock: Locked tracks show overlay, prevent editing

### 21.01.2026 - Clip Management Fixes
- Text clips now go to Text track instead of Video track
- Clips swap positions when overlapping (no more overlap!)
- Vertical drag (>30px) creates new track above/below

### 21.01.2026 - Advanced Track System
- 4 track types (Video, Audio, Text, Sticker)
- Track control buttons (Mute, Hide, Lock, Delete)
- Volume/Opacity slider on hover

---

## Key Files Reference
- `/app/src/components/editor/TimelinePanel.jsx` - Track system, clip management
- `/app/src/components/editor/EditorLayout.jsx` - Reducer, state management
- `/app/src/components/editor/MediaInputPanel.jsx` - Sticker library, Transitions
- `/app/src/components/editor/InspectorPanel.jsx` - Sticker section
- `/app/src/components/editor/ExportDialog.jsx` - Export dialog with FFmpeg toggle
- `/app/src/services/VideoExportService.js` - FFmpeg.wasm export service
- `/app/src/components/PreviewPanel.jsx` - Track hide/mute, transition rendering

---

## Test Status
- **Last Test:** iteration_17.json (22.01.2026)
- **Frontend Success Rate:** 100% (9/9 features)
- **Verified:** Visual transitions, Export dialog, Sticker library, Track controls
