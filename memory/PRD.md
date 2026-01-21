# CapCut Video Editor - Product Requirements Document

## Original Problem Statement
Erstelle einen professionellen Video-Editor ähnlich CapCut mit umfassender KI-Integration. Der Benutzer soll verschiedene KI-Provider (OpenAI, Anthropic Claude, Google Gemini) für verschiedene Funktionen auswählen können.

## User Persona
- Video-Creator und Content-Ersteller
- Deutschsprachige Benutzer
- Benötigen professionelle Video-Editing-Tools mit KI-Unterstützung

## Core Requirements

### KI-Integration (IMPLEMENTIERT ✅)
1. **Multi-Provider KI-Auswahl**
   - OpenAI (8 Modelle): GPT-5.2, GPT-5.1, GPT-5, GPT-5 Mini, GPT-4o, GPT-4.1, O3, O4 Mini
   - Anthropic (5 Modelle): Claude 4 Sonnet, Claude Sonnet 4.5, Claude Opus 4.5, Claude Haiku 4.5, Claude 3.5 Haiku
   - Google Gemini (6 Modelle): Gemini 2.5 Pro, Gemini 3 Flash, Gemini 3 Pro, Gemini 2.5 Flash, Gemini 2.5 Flash Lite, Gemini 2.0 Flash

2. **Funktion-spezifische Modell-Auswahl**
   - Chat & Assistent
   - Auto-Untertitel
   - Drehbuch-Schreiben
   - Titel-Generierung
   - Übersetzung

3. **KI-Funktionen Panel**
   - Drehbuch-Generator (Thema, Länge, Stil)
   - Titel-Generator (YouTube, TikTok, Instagram, Andere)
   - Übersetzer (8 Sprachen)
   - Ideen-Generator (6 Kategorien)

### Editor-Funktionen (VORHANDEN)
- Multi-Track Timeline
- Video-Vorschau
- Medien-Import
- Effekte und Filter
- Text-Editor
- Export-Dialog

### Einstellungen (IMPLEMENTIERT ✅)
- Allgemein (Sprache, Auto-Save, etc.)
- KI-Modelle (Provider- und Modell-Auswahl)
- Darstellung, Timeline, Vorschau, etc.

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Desktop**: Electron
- **KI-API**: Emergent LLM Key (Universal Key)

## File Architecture
```
/app/src/
├── modules/
│   └── ai/
│       ├── AIModelSelector.js    # Modell-Konfiguration
│       ├── AIClient.js           # LLM API-Integration
│       └── index.js
├── components/
│   ├── editor/
│   │   ├── AIChat.jsx            # Chat mit Modell-Auswahl
│   │   ├── AIModelSelectorUI.jsx # Dropdown UI
│   │   ├── AIFeaturesPanel.jsx   # Drehbuch/Titel/etc.
│   │   ├── AutoCaptionPanel.jsx  # Untertitel-Generator
│   │   └── ...
│   ├── dashboard/
│   │   ├── FeatureTiles.jsx      # Feature-Kacheln mit Modal
│   │   └── LeftSidebar.jsx       # Sidebar mit Einstellungen
│   └── SettingsPanel.jsx         # Vollständige Einstellungen
```

## Implementation Status

### ✅ Completed (December 2025)
- [x] KI-Modell-Selector Modul mit Provider-Konfiguration
- [x] KI-Client für API-Aufrufe
- [x] AIChat-Komponente mit Modell-Auswahl
- [x] AIFeaturesPanel mit 4 Tabs (Drehbuch, Titel, Übersetzen, Ideen)
- [x] AutoCaptionPanel mit Modell-Auswahl
- [x] SettingsPanel mit KI-Modelle Tab
- [x] FeatureTiles mit Modal-Integration
- [x] LeftSidebar mit Einstellungen-Button

### 🔄 In Progress
- [ ] Echte Audio-zu-Text Transkription (aktuell simuliert)
- [ ] Export-Engine vollständig integrieren
- [ ] Cloud-Sync implementieren

### 📋 Upcoming (P1)
- [ ] Multi-Track Audio-Mixer
- [ ] Multicam-Editor
- [ ] Kollaborative Bearbeitung
- [ ] Marketplace für Premium-Assets

### 📋 Future (P2)
- [ ] Text-to-Video Generierung
- [ ] AI Background Removal
- [ ] Motion Tracking
- [ ] Monetarisierung (Pro-Abo)

## API Integration
- **Emergent LLM Key**: `sk-emergent-67b5f95099879B4541`
- **API Endpoint**: `https://api.emergentai.io/v1/chat/completions`
- **Unterstützte Provider**: OpenAI, Anthropic, Google Gemini

## Test Reports
- `/app/test_reports/iteration_1.json`
- `/app/test_reports/iteration_2.json` (95% Success Rate)

## Notes
- Die Anwendung ist eine Desktop-Electron-App
- Kein Backend-Server erforderlich
- API-Aufrufe erfolgen direkt vom Frontend
