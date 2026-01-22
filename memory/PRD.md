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
- [ ] Video export rendering (FFmpeg)
- [ ] Visual transitions rendering (cross-fade, wipe)

### P2 - Medium Priority
- [ ] Keyframe animation system
- [ ] Real audio waveform generation
- [ ] GIPHY API integration for stickers

### P3 - Future/Backlog
- [ ] Motion tracking
- [ ] Green screen/chroma key
- [ ] Cloud sync & collaboration

---

## Changelog

### 22.01.2026 - Sticker Library & Track Controls
- **Sticker Library:** 6 categories (Angesagt, Emojis, Tiere, Essen, Symbole, Formen)
- **Sticker Inspector:** Size slider (24-256px), animation dropdown, quick replace grid
- **Track Controls Connected:**
  - Mute: Muted tracks have no audio in preview
  - Hide: Hidden tracks not rendered in preview
  - Lock: Locked tracks show overlay, prevent editing
- **Sticker rendering in PreviewPanel** with animations (bounce, pulse, spin, shake, swing)

### 21.01.2026 - Clip Management Fixes
- Text clips now go to Text track instead of Video track
- Clips swap positions when overlapping (no more overlap!)
- Vertical drag (>30px) creates new track above/below
- Turquoise indicator during vertical drag

### 21.01.2026 - Advanced Track System
- 4 track types (Video, Audio, Text, Sticker)
- Track control buttons (Mute, Hide, Lock, Delete)
- Volume/Opacity slider on hover

---

## Key Files Reference
- `/app/src/components/editor/TimelinePanel.jsx` - Track system, clip swapping, track controls
- `/app/src/components/editor/EditorLayout.jsx` - MOVE_CLIP with swap logic, UPDATE_TRACK
- `/app/src/components/editor/MediaInputPanel.jsx` - Sticker library (lines 1269-1380)
- `/app/src/components/editor/InspectorPanel.jsx` - Sticker section (lines 443-520)
- `/app/src/components/PreviewPanel.jsx` - Track hide/mute logic (lines 26-55)

---

## Test Status
- **Last Test:** iteration_16.json (22.01.2026)
- **Frontend Success Rate:** 100% (7/7 features)
- **Verified:** Sticker library, track controls (mute/hide/lock), text/sticker track routing
