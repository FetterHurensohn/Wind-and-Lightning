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

```
+------------------------------------------------------------------+
| Top Toolbar (44px) - Logo, 11 Categories, Project Name           |
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

### Drag and Drop (✅ Complete - 21.01.2026)
- MediaTile component with `draggable={true}` and `[data-media-id]`
- Shows "DRAG" badge (turquoise) on hover
- HTML5 drag API with `dataTransfer.setData('mediaId', id)`
- Track drop zones with `[data-track-type]` attribute
- Visual highlight (turquoise ring) when dragging over track
- Drop creates clip at mouse position

### Timeline Features (✅ Complete - 21.01.2026)
- **1-Hour Duration**: Timeline extends to 3600 seconds (1 hour)
- **Fine Tick Marks**: Minor ticks between major markers
- **Dynamic Intervals**: Tick spacing adjusts based on zoom level
- Shift + Scroll = Horizontal scrolling
- Ctrl + Scroll = Zoom in/out
- Track height: 48px
- Track labels: 120px left column
- +Video / +Audio buttons
- Keyboard shortcuts: Space (play/pause), B (split), Delete (remove)

### Video Preview (✅ Complete)
- PreviewPanel shows active clips based on currentTime
- **Full Transformation Support**:
  - Opacity, Scale, Rotation
  - Position X/Y
  - Horizontal/Vertical Flip
  - Brightness, Contrast, Saturation, Hue
  - Blend Modes (12 options)
- Displays clip title and progress
- Timecode updates in footer during playback

### Audio Waveforms (✅ Complete)
- Audio clips display waveform visualization
- Pseudo-random heights based on clip ID
- Green bars for audio tracks

### Inspector Panel (✅ Complete - 21.01.2026)
- **Transformation Section**: Opacity, Scale, Rotation, Position X/Y
- **Speed Section**: Speed multiplier, Reverse toggle
- **Flip Section**: Horizontal/Vertical flip buttons
- **Blend Mode**: 12 blend modes dropdown
- **Audio Section**: Volume, Fade In/Out
- **Color Correction**: Brightness, Contrast, Saturation, Hue
- **Actions**: Keyframes button, Delete clip button

### Editing Tools (✅ Complete)
- Split (B key) - splits clip at playhead position
- Delete (Delete/Backspace) - removes selected clip
- Undo/Redo support
- Clip selection with white ring border
- Clip trim handles (resize from edges)

### AI Features (✅ Complete)
- KI-Bild (Image Generation) - Seedream 4.0
- KI-Video (Storyboard Generation) - Seedance 1.0
- Text-zu-Sprache (TTS) - OpenAI TTS
- KI-Musik Generator
- Auto-Untertitel (Whisper)
- KI-Assistent (In-Editor Chat)

---

## P0/P1/P2 Features Remaining

### P0 - Critical (Next Sprint)
- [x] Drag-and-drop to timeline
- [x] 1-hour timeline duration
- [x] Fine tick marks
- [x] Inspector property editing
- [ ] Clip trim handles (drag edges to resize)

### P1 - High Priority
- [ ] Video export rendering (FFmpeg in Electron)
- [ ] Effects & Filters library
- [ ] Transitions between clips

### P2 - Medium Priority
- [ ] Keyframe animation system
- [ ] Text overlay editing
- [ ] Sticker library integration

### P3 - Future/Backlog
- [ ] Motion tracking
- [ ] Green screen/chroma key
- [ ] Cloud sync & collaboration
- [ ] Direct social media upload
- [ ] Real audio waveform generation (from actual files)

---

## Test Status
- **Last Test:** iteration_10.json (21.01.2026)
- **Frontend Success Rate:** 100%
- **Verified Features:**
  - Drag Demo Video to Video 1 track
  - Drag Demo Image to Video 1 track
  - Timeline shows 1 hour (60:00)
  - Minor tick marks between major markers
  - Inspector panel property sliders
  - Opacity, Scale, Rotation changes
  - Horizontal/Vertical flip toggles
  - Preview panel with all transformations

---

## Changelog

### 21.01.2026 - Drag-Drop & Timeline Fixes
- Fixed drag-and-drop with proper HTML5 API (dataTransfer, dropEffect)
- Extended timeline to 3600 seconds (1 hour) minimum
- Added minor tick marks between major time markers
- Dynamic tick intervals based on zoom level
- Added full transformation support in PreviewPanel

### 21.01.2026 - Video Preview & Audio Waveforms
- Verified PreviewPanel shows clip content
- Verified audio clips show waveform visualization
- Verified NaN zoom bug is fixed

### 21.01.2026 - Layout & Drag-Drop Foundation
- 50/50 vertical split layout
- Right panel spans full height
- Draggable MediaTile with DRAG badge
- Track drop handlers with visual feedback

---

## Key Files Reference

### Editor Components
- `/app/src/components/editor/EditorLayout.jsx` - Main state management
- `/app/src/components/editor/TimelinePanel.jsx` - Timeline, tracks, clips, waveforms
- `/app/src/components/editor/MediaInputPanel.jsx` - Media panel, draggable items
- `/app/src/components/PreviewPanel.jsx` - Preview with all transformations
- `/app/src/components/editor/InspectorPanel.jsx` - Property editing
- `/app/src/components/editor/TopToolbar.jsx` - Top navigation bar

### Hooks
- `/app/src/hooks/usePlayhead.js` - Playhead management
- `/app/src/hooks/useTimelineZoom.js` - Zoom functionality
- `/app/src/hooks/useUndoRedo.js` - Undo/Redo support

### AI Integration
- `/app/src/modules/ai/AIClient.js` - AI API calls
