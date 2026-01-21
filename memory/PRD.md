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

### Layout (✅ Complete)
- 50/50 vertical split: Media Panel + Preview (top), Timeline (bottom)
- Full-height right Inspector panel
- Top toolbar with 11 categories
- Dynamic left panel based on selected category

### Media Management (✅ Complete - 21.01.2026)
- **Double-Click:** Adds media to timeline at end of last clip
- **Drag-and-Drop:** Adds media at specific position on track
- Shows "DRAG" and "2× Klick" badges on hover
- Demo media buttons for testing without file uploads

### Timeline (✅ Complete - 21.01.2026)
- **1-Hour Duration:** Timeline extends to 3600 seconds
- **Fine Tick Marks:** Minor ticks between major markers
- **Dynamic Intervals:** Tick spacing adjusts based on zoom
- Shift + Scroll = Horizontal scrolling
- Ctrl + Scroll = Zoom in/out
- Clip trim handles (drag edges to resize)
- Track height: 48px, Track labels: 120px

### Video Preview (✅ Complete)
- Shows active clips based on currentTime
- Full transformation support:
  - Opacity, Scale, Rotation, Position X/Y
  - Horizontal/Vertical Flip
  - Brightness, Contrast, Saturation, Hue
  - Blend Modes (12 options)

### Inspector Panel (✅ Complete)
- **Transformation:** Opacity, Scale, Rotation, Position
- **Speed:** Speed multiplier, Reverse toggle
- **Flip:** Horizontal/Vertical buttons
- **Blend Mode:** 12 modes dropdown
- **Audio:** Volume, Fade In/Out
- **Color Correction:** Brightness, Contrast, Saturation, Hue
- **Effects:** Shows applied effects with X button to remove
- **Transitions:** Shows applied transition with X button to remove

### Videoeffekte (✅ Complete - 21.01.2026)
- 12 video effects with emoji icons:
  - Basis: Weichzeichner, Schärfen, Vignette, Wackeln
  - Retro: Glitch, VHS, Filmkörnung, Vintage
  - Angesagt: Glow, Neon, Duotone, Chromatisch
- Click to apply effect to selected clip
- Effects stored in clip.effects array
- **MOCKED:** Effects not visually rendered in preview

### Übergänge/Transitions (✅ Complete - 21.01.2026)
- 12 transitions with icons:
  - Überblendung, Auflösen
  - Wischen (Links, Rechts, Hoch, Runter)
  - Zoom (Rein, Raus)
  - Schieben (Links, Rechts)
  - Drehen, Umklappen
- Click to apply transition to selected clip
- Transitions stored in clip.transition object
- **MOCKED:** Transitions not visually rendered

### Editing Tools (✅ Complete)
- Split (B key) - splits clip at playhead
- Delete (Delete/Backspace) - removes selected clip
- Undo/Redo support
- Clip selection with white ring border

### AI Features (✅ Complete)
- KI-Bild (Image Generation) - Seedream 4.0
- KI-Video (Storyboard Generation) - Seedance 1.0
- Text-zu-Sprache (TTS) - OpenAI TTS
- KI-Musik Generator
- Auto-Untertitel (Whisper)
- KI-Assistent (In-Editor Chat)

---

## P0/P1/P2 Features Remaining

### P0 - Critical (Completed)
- [x] Drag-and-drop to timeline
- [x] Double-click to add media
- [x] 1-hour timeline duration
- [x] Fine tick marks
- [x] Inspector property editing
- [x] Videoeffekte panel
- [x] Übergänge panel

### P1 - High Priority
- [ ] **Video export rendering (FFmpeg in Electron)**
- [ ] Visual rendering of effects in preview
- [ ] Visual rendering of transitions between clips
- [ ] Text overlay editing with live preview

### P2 - Medium Priority
- [ ] Keyframe animation system
- [ ] Sticker library integration
- [ ] Real audio waveform generation

### P3 - Future/Backlog
- [ ] Motion tracking
- [ ] Green screen/chroma key
- [ ] Cloud sync & collaboration
- [ ] Direct social media upload

---

## Test Status
- **Last Test:** iteration_12.json (21.01.2026)
- **Frontend Success Rate:** 100%
- **Verified Features:**
  - Double-click adds clips to timeline
  - Effekte tab auto-shows Videoeffekte
  - Effects apply to selected clips
  - Inspector shows applied effects
  - Übergänge tab auto-shows transitions
  - Transitions apply to selected clips
  - Inspector shows applied transitions
  - X buttons remove effects/transitions

---

## Changelog

### 21.01.2026 - Videoeffekte & Übergänge
- Implemented Videoeffekte panel with 12 effects
- Implemented Übergänge panel with 12 transitions
- Added auto-section selection when tab changes
- Added Effects and Transitions sections to Inspector
- Added ADD_EFFECT_TO_CLIP, REMOVE_EFFECT_FROM_CLIP reducer actions
- Added ADD_TRANSITION_TO_CLIP, REMOVE_TRANSITION_FROM_CLIP reducer actions

### 21.01.2026 - Drag-Drop & Timeline Fixes
- Fixed drag-and-drop with HTML5 API
- Added double-click to add media
- Extended timeline to 3600 seconds (1 hour)
- Added minor tick marks between major markers

### 21.01.2026 - Video Preview & Audio Waveforms
- Full transformation support in PreviewPanel
- Audio waveform visualization

---

## Key Files Reference

### Editor Components
- `/app/src/components/editor/EditorLayout.jsx` - State management, reducer
- `/app/src/components/editor/TimelinePanel.jsx` - Timeline, tracks, clips
- `/app/src/components/editor/MediaInputPanel.jsx` - Media panel, effects, transitions
- `/app/src/components/PreviewPanel.jsx` - Preview with transformations
- `/app/src/components/editor/InspectorPanel.jsx` - Property editing
- `/app/src/components/editor/TopToolbar.jsx` - Top navigation

### Hooks
- `/app/src/hooks/usePlayhead.js` - Playhead management
- `/app/src/hooks/useTimelineZoom.js` - Zoom functionality
- `/app/src/hooks/useUndoRedo.js` - Undo/Redo support

### AI Integration
- `/app/src/modules/ai/AIClient.js` - AI API calls

---

## Known Limitations (MOCKED)
- Effects stored in state but NOT visually rendered in preview
- Transitions stored in state but NOT visually rendered between clips
- Demo media items are placeholders without real video files
- Export functionality not implemented (requires FFmpeg)
