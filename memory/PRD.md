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

### Media to Timeline (✅ Complete)
Three methods to add media:
1. **+ Button:** Hover over media tile, click large turquoise + button
2. **Double-Click:** Double-click on media tile
3. **Drag-and-Drop:** Drag tile to timeline track

### Text Overlay System (✅ Complete - 21.01.2026)
- **Text Creation Panel:** 5 text styles (Titel 72px, Untertitel 48px, Fließtext 32px, Bildunterschrift 24px, Label 18px)
- **Text Editing in Inspector:**
  - Textinhalt (textarea)
  - Schriftgröße (12-200px slider)
  - Schriftstärke (Normal, Mittel, Halbfett, Fett, Extra Fett)
  - Textfarbe (color picker)
  - Hintergrundfarbe (color picker + Transparent button)
  - Ausrichtung (Links, Mitte, Rechts)
- **Text Effects:** Shadow, Outline, Glow, Neon, Gradient

### Visual Effect Rendering (✅ Complete - 21.01.2026)
- **CSS Filter Effects:**
  - blur (Weichzeichner)
  - sharpen (Schärfen)
  - glitch (animated)
  - vhs, film-grain, vintage (Retro)
  - glow, neon, duotone, chromatic (Angesagt)
  - shake (animated)
- **Vignette Effect:** Dark corners overlay via ::after pseudo-element
- **Transition Animations:** fade, slide, zoom (CSS keyframes)

### Timeline (✅ Complete)
- 1-Hour Duration (3600 seconds)
- Fine tick marks
- Shift + Scroll = Horizontal scroll
- Ctrl + Scroll = Zoom
- Clip trim handles

### Inspector Panel (✅ Complete)
- Transformation (Opacity, Scale, Rotation, Position)
- Speed, Flip, Blend Mode, Audio
- Color Correction (Brightness, Contrast, Saturation, Hue)
- Effects section with X button
- Transitions section with X button
- **Full Text editing when text clip selected**

### Videoeffekte (✅ Complete)
- 12 effects in 3 categories (Basis, Retro, Angesagt)
- Click to apply to selected clip
- Visual rendering via CSS filters

### Übergänge (✅ Complete)
- 12 transitions (Fade, Dissolve, Wipe, Zoom, Slide, etc.)
- Click to apply to selected clip

### AI Features (✅ Complete)
- KI-Bild, KI-Video, TTS, KI-Musik
- Auto-Untertitel (Whisper)
- KI-Assistent

---

## P1/P2/P3 Features Remaining

### P1 - High Priority
- [ ] **Video export rendering (FFmpeg in Electron)**
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

### 21.01.2026 - Text Overlay & Visual Effects
- Implemented Text creation panel with 5 text styles
- Full text editing in Inspector (font, color, alignment, effects)
- Visual effect rendering via CSS filters
- CSS animations for shake, glitch effects
- Vignette effect via pseudo-element

### 21.01.2026 - Add to Timeline Button
- Large turquoise + button on hover over media tiles
- Three ways to add media: + Button, Double-click, Drag-and-Drop

### 21.01.2026 - Videoeffekte & Übergänge
- 12 video effects with CSS filter rendering
- 12 transitions stored on clips

---

## Key Files Reference
- `/app/src/components/editor/EditorLayout.jsx` - State management
- `/app/src/components/editor/TimelinePanel.jsx` - Timeline
- `/app/src/components/editor/MediaInputPanel.jsx` - Media panel, Text panel
- `/app/src/components/PreviewPanel.jsx` - Preview with effects
- `/app/src/components/editor/InspectorPanel.jsx` - Properties & Text editing
- `/app/src/index.css` - Effect CSS animations

---

## Test Status
- **Last Test:** iteration_13.json (21.01.2026)
- **Frontend Success Rate:** 100% (13/13 features)
- **Verified:** + button, Text creation, Text editing, Effects rendering

---

## Known Limitations
- Video export not implemented (requires FFmpeg)
- Demo media items are placeholders
- Effects rendered via CSS but not saved to video file
