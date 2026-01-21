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

### Core Features (✅ Complete)

#### Dashboard
- Feature tiles for all AI tools
- Project management (create, open, delete, duplicate)
- Search and filter projects
- Grid/List view toggle

#### Editor Layout
- Professional timeline with tracks
- Preview area with playback controls
- Left sidebar: Importieren, Medien, KI-Medien, Bibliothek
- Right sidebar: Eigenschaften + KI-Assistent tabs
- Top toolbar with editing tools

### AI Features (✅ Complete)

#### 1. KI-Assistent (In-Editor Chat)
- Real-time AI chat assistant
- Model selection (GPT-5.2, Claude, Gemini)
- Quick suggestions for common tasks
- Context-aware help for video editing

#### 2. Text-to-Video
- Storyboard generation from text prompts
- Style selection (Filmisch, Dokumentation, Social, etc.)
- Duration and aspect ratio settings
- AI-powered scene breakdown

#### 3. Auto-Untertitel (Auto-Captions)
- OpenAI Whisper integration for transcription
- Audio/video file upload
- Multi-language support (12 languages)
- Subtitle styling options (Standard, YouTube, Netflix, etc.)
- Timing adjustments

#### 4. Sprachausgabe (Text-to-Speech)
- OpenAI TTS integration
- 6 voice options (Alloy, Echo, Fable, Onyx, Nova, Shimmer)
- Speed control (0.5x - 2x)
- Preview and insert to timeline

#### 5. Musik-Generator
- AI-powered music suggestions
- Genre selection (Electronic, Pop, Rock, etc.)
- Mood selection (Upbeat, Calm, Dramatic, etc.)
- Duration slider
- Royalty-free music recommendations

#### 6. Bild-Generator
- AI image generation via DALL-E/GPT Image
- Style presets (Realistic, Artistic, Anime, etc.)
- Size options (1024x1024, Portrait, Landscape)
- Direct insert to project

### Export System (✅ Complete)
- Resolution options: 480p to 8K
- FPS options: 24, 25, 30, 50, 60
- Formats: MP4, MOV, WebM, GIF
- Codec selection: H.264, H.265, ProRes
- Quality slider
- Estimated file size display

---

## Architecture

```
/app/
├── memory/                # Documentation System
├── src/
│   ├── components/        # React UI Components
│   │   ├── dashboard/     # Dashboard components
│   │   └── editor/        # Editor components
│   ├── hooks/             # Custom React hooks
│   ├── modules/           # Business Logic
│   │   ├── ai/           # AI integration (AIClient.js, AIService.js)
│   │   ├── audio/        # Audio processing
│   │   ├── core/         # Video editor core logic
│   │   ├── effects/      # Effects and filters
│   │   └── export/       # Export engine
│   ├── styles/           # CSS/Tailwind styles
│   └── utils/            # Helper functions
└── electron/             # Electron main process
```

---

## P0/P1/P2 Features Remaining

### P1 - High Priority
- [ ] Timeline clip manipulation (trim, split, move)
- [ ] Media import drag-and-drop
- [ ] Audio waveform visualization
- [ ] Keyframe animation system
- [ ] Real video rendering/export (currently config-only)

### P2 - Medium Priority
- [ ] Effects & Filters library implementation
- [ ] Transitions with presets
- [ ] Motion tracking
- [ ] Green screen/chroma key
- [ ] Multi-cam editing
- [ ] Speed ramping

### P3 - Future/Backlog
- [ ] Cloud sync & collaboration
- [ ] Direct social media upload (TikTok, YouTube, Instagram)
- [ ] Templates & presets marketplace
- [ ] Mobile app version
- [ ] Real-time collaboration
- [ ] AI scene detection
- [ ] Auto-color grading

---

## Test Status
- **Last Test:** iteration_3.json
- **Frontend Success Rate:** 100%
- **All AI panels loading correctly**
- **Project creation and navigation working**

---

## Known Limitations (Browser Mode)
- Electron APIs not available (file system access)
- Projects stored in localStorage
- Export generates config JSON (not actual video)
- Some features require Electron for full functionality

---

## Next Development Steps
1. Implement timeline clip manipulation
2. Add media import functionality
3. Connect effects library to UI
4. Implement basic video preview
5. Add actual export rendering (via FFmpeg in Electron)
