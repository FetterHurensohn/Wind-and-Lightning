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

### Media to Timeline (✅ Complete - 21.01.2026)
Three methods to add media to timeline:
1. **+ Button (NEW):** Hover over media tile, click large turquoise + button
2. **Double-Click:** Double-click on media tile
3. **Drag-and-Drop:** Drag tile to timeline track

### Layout (✅ Complete)
- 50/50 vertical split: Media Panel + Preview (top), Timeline (bottom)
- Full-height right Inspector panel
- Top toolbar with 11 categories
- Dynamic left panel based on selected category

### Timeline (✅ Complete)
- 1-Hour Duration (3600 seconds)
- Fine tick marks between major markers
- Dynamic intervals based on zoom
- Shift + Scroll = Horizontal scrolling
- Ctrl + Scroll = Zoom in/out
- Clip trim handles (drag edges)

### Video Preview (✅ Complete)
- Shows active clips based on currentTime
- Full transformation support (opacity, scale, rotation, position, flip, color correction, blend modes)

### Inspector Panel (✅ Complete)
- Transformation, Speed, Flip, Blend Mode, Audio, Color Correction
- Effects section with X button to remove
- Transitions section with X button to remove

### Videoeffekte (✅ Complete)
- 12 effects: Weichzeichner, Schärfen, Vignette, Glitch, VHS, Filmkörnung, Vintage, Glow, Neon, Duotone, Chromatisch, Wackeln
- Click to apply to selected clip
- **MOCKED:** Not visually rendered in preview

### Übergänge (✅ Complete)
- 12 transitions: Überblendung, Auflösen, Wischen (4 directions), Zoom (in/out), Schieben (2 directions), Drehen, Umklappen
- Click to apply to selected clip
- **MOCKED:** Not visually rendered

### Editing Tools (✅ Complete)
- Split (B key), Delete (Delete/Backspace)
- Undo/Redo, Clip selection

### AI Features (✅ Complete)
- KI-Bild, KI-Video, TTS, KI-Musik, Auto-Untertitel, KI-Assistent

---

## P1/P2/P3 Features Remaining

### P1 - High Priority
- [ ] Video export rendering (FFmpeg in Electron)
- [ ] Visual rendering of effects in preview
- [ ] Visual rendering of transitions between clips

### P2 - Medium Priority
- [ ] Keyframe animation system
- [ ] Text overlay editing with live preview
- [ ] Sticker library integration

### P3 - Future/Backlog
- [ ] Real audio waveform generation
- [ ] Motion tracking
- [ ] Green screen/chroma key
- [ ] Cloud sync & collaboration

---

## Changelog

### 21.01.2026 - Add to Timeline Button
- Added large turquoise + button that appears on hover over media tiles
- Button provides reliable click-to-add functionality
- Three ways to add media: + Button, Double-click, Drag-and-Drop

### 21.01.2026 - Videoeffekte & Übergänge
- Implemented 12 video effects with emoji icons
- Implemented 12 transitions with icons
- Added Effects and Transitions sections to Inspector

### 21.01.2026 - Timeline & Drag-Drop
- Extended timeline to 3600 seconds (1 hour)
- Added minor tick marks between major markers
- Improved drag-and-drop with HTML5 API

---

## Key Files Reference
- `/app/src/components/editor/EditorLayout.jsx` - State management
- `/app/src/components/editor/TimelinePanel.jsx` - Timeline
- `/app/src/components/editor/MediaInputPanel.jsx` - Media panel with + button
- `/app/src/components/PreviewPanel.jsx` - Preview
- `/app/src/components/editor/InspectorPanel.jsx` - Properties

---

## Known Limitations (MOCKED)
- Effects and transitions stored but NOT visually rendered
- Demo media items are placeholders without real video files
- Export functionality not implemented
