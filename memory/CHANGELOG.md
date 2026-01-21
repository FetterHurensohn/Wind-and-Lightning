# 📝 Changelog

> Alle Änderungen am Projekt, chronologisch sortiert.

---

## [2.1.0] - 2025-12-21

### ✨ Hinzugefügt
- **Multi-Provider KI-Auswahl**
  - OpenAI: GPT-5.2, GPT-5.1, GPT-5, GPT-5 Mini, GPT-4o, GPT-4.1, O3, O4 Mini
  - Anthropic: Claude 4 Sonnet, Claude Sonnet 4.5, Claude Opus 4.5, Claude Haiku 4.5, Claude 3.5 Haiku
  - Google Gemini: Gemini 2.5 Pro, Gemini 3 Flash/Pro, Gemini 2.5 Flash/Lite, Gemini 2.0 Flash

- **KI-Funktionen Panel** (`AIFeaturesPanel.jsx`)
  - Drehbuch-Generator mit Länge & Stil Auswahl
  - Titel-Generator für YouTube, TikTok, Instagram
  - Übersetzer (8 Sprachen)
  - Ideen-Generator (6 Kategorien)

- **KI-Modell-Auswahl UI** (`AIModelSelectorUI.jsx`)
  - Dropdown mit allen 19 Modellen
  - Provider-Farben (grün=OpenAI, orange=Anthropic, blau=Gemini)
  - Empfehlungs-Badges

- **Einstellungen KI-Tab**
  - Standard-Modell Auswahl
  - Funktion-spezifische Modell-Konfiguration
  - API-Key Eingabe (optional)

- **AI Agent Dokumentation**
  - 7 Dokumentationsdateien in `/app/memory/`
  - Schnellstart-Guide, Architektur, Patterns, Troubleshooting

### 🔧 Geändert
- `FeatureTiles.jsx`: Öffnet jetzt echte KI-Modals
- `LeftSidebar.jsx`: Zahnrad-Button öffnet SettingsPanel
- `AutoCaptionPanel.jsx`: Mit KI-Modell-Auswahl erweitert
- `AIChat.jsx`: Vollständig überarbeitet mit echter LLM-Integration

### 📁 Neue Dateien
```
/app/src/modules/ai/AIModelSelector.js
/app/src/modules/ai/AIClient.js
/app/src/components/editor/AIModelSelectorUI.jsx
/app/src/components/editor/AIFeaturesPanel.jsx
/app/memory/*.md (7 Dateien)
```

---

## [2.0.0] - 2025-12-20

### ✨ Hinzugefügt
- Modulare Architektur unter `/app/src/modules/`
- Placeholder-Komponenten für erweiterte Features
- Desktop-Build Scripts für Electron

### 🔧 Geändert
- Supervisor-Konfiguration für Root-Level Vite Projekt
- Navigation-Bug in NewProjectModal behoben

---

## [1.0.0] - Initial Release

### ✨ Features
- Dashboard mit Projektübersicht
- Editor mit Timeline, Preview, Media Panel
- Basic Video-Editing Funktionen
- CapCut-ähnliches Design
