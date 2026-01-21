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

### Advanced Track System (✅ Complete - 21.01.2026)
**Four Track Types:**
- **Video Track:** Blue background, blue clips
- **Audio Track:** Green background, green clips
- **Text Track:** Yellow background, yellow clips (text clips go here!)
- **Sticker Track:** Pink background, pink clips

**Track Control Buttons:**
- 🔊 Mute/Unmute (audio/video)
- 👁 Show/Hide (toggle opacity)
- 🔒 Lock/Unlock (prevent editing)
- 🗑 Delete (with confirmation)
- Volume/Opacity slider on hover

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
- [ ] Sticker library integration

### P2 - Medium Priority
- [ ] Keyframe animation system
- [ ] Real audio waveform generation

### P3 - Future/Backlog
- [ ] Motion tracking
- [ ] Green screen/chroma key
- [ ] Cloud sync & collaboration

---

## Changelog

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
- `/app/src/components/editor/TimelinePanel.jsx` - Track system, clip swapping
- `/app/src/components/editor/EditorLayout.jsx` - MOVE_CLIP with swap logic
- `/app/src/components/editor/MediaInputPanel.jsx` - Text to Text track

---

## Test Status
- **Last Test:** iteration_15.json (21.01.2026)
- **Frontend Success Rate:** 100% (9/9 features)
- **Verified:** Text track routing, clip swapping, vertical drag
