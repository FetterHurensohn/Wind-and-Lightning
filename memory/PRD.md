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

### Timeline Features (✅ Complete)
- Shift + Scroll = Horizontal scrolling
- Ctrl + Scroll = Zoom in/out (NaN bug fixed)
- Track height: 48px
- Track labels: 120px left column
- +Video / +Audio buttons
- Keyboard shortcuts shown in hint bar

### Video Preview (✅ Complete - 21.01.2026)
- PreviewPanel shows active clips based on currentTime
- Supports video, image, and text clips
- Displays clip title and progress (e.g., "1.0s / 10s")
- Timecode updates in footer during playback

### Audio Waveforms (✅ Complete - 21.01.2026)
- Audio clips display waveform visualization
- Pseudo-random heights based on clip ID
- Green bars for audio tracks

### Editing Tools (✅ Complete)
- Split (B key) - splits clip at playhead position
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

## P1/P2/P3 Features Remaining

### P0 - Critical (Next Sprint)
- [x] Real video/audio playback in preview
- [x] Audio waveform visualization
- [ ] Clip trim handles (resize from edges)
- [ ] Inspector panel property editing (opacity, scale, rotation)

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
- **Last Test:** iteration_9.json (21.01.2026)
- **Frontend Success Rate:** 100%
- **Verified Features:**
  - Project creation and editor navigation
  - Video Track addition
  - Demo media addition
  - Drag-drop to timeline
  - Clip display with titles
  - Audio waveform visualization (252 bars)
  - Playback with playhead movement
  - Preview panel clip content display
  - Timecode updates
  - Timeline zoom (Ctrl+Scroll) - NaN bug fixed
  - Horizontal scroll (Shift+Scroll)
  - Clip selection (white ring)
  - Split (B key)
  - Delete functionality

---

## Changelog

### 21.01.2026 - Video Preview & Audio Waveforms
- Verified PreviewPanel shows clip content when playhead is over clip
- Verified audio clips show waveform visualization (252 bars)
- Verified NaN zoom bug is fixed
- All 14 features tested and passed

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

---

## Key Files Reference

### Editor Components
- `/app/src/components/editor/EditorLayout.jsx` - Main state management
- `/app/src/components/editor/TimelinePanel.jsx` - Timeline with tracks, clips, waveforms
- `/app/src/components/editor/MediaInputPanel.jsx` - Media panel with draggable items
- `/app/src/components/PreviewPanel.jsx` - Video preview with playback sync
- `/app/src/components/editor/TopToolbar.jsx` - Top navigation bar

### Hooks
- `/app/src/hooks/usePlayhead.js` - Playhead management
- `/app/src/hooks/useTimelineZoom.js` - Zoom functionality
- `/app/src/hooks/useUndoRedo.js` - Undo/Redo support

### AI Integration
- `/app/src/modules/ai/AIClient.js` - AI API calls
