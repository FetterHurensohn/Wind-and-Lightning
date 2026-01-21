# 📐 Codebase Architektur

## Verzeichnisstruktur

```
/app/
├── electron/                 # Electron Main Process
│   ├── main.cjs             # Electron Entry Point
│   └── projectManager.cjs   # Dateisystem-Zugriff
│
├── src/
│   ├── components/          # React UI Komponenten
│   │   ├── dashboard/       # Dashboard-spezifische Komponenten
│   │   │   ├── LeftSidebar.jsx
│   │   │   ├── FeatureTiles.jsx
│   │   │   ├── ProjectGrid.jsx
│   │   │   ├── NewProjectModal.jsx
│   │   │   └── ...
│   │   │
│   │   ├── editor/          # Editor-spezifische Komponenten
│   │   │   ├── EditorLayout.jsx    # Haupt-Editor Container
│   │   │   ├── TimelinePanel.jsx   # Timeline
│   │   │   ├── PreviewPanel.jsx    # Video-Vorschau
│   │   │   ├── MediaPanel.jsx      # Medien-Browser
│   │   │   ├── AIChat.jsx          # KI-Chat
│   │   │   ├── AIFeaturesPanel.jsx # KI-Funktionen
│   │   │   ├── AIModelSelectorUI.jsx
│   │   │   ├── AutoCaptionPanel.jsx
│   │   │   ├── ExportDialog.jsx
│   │   │   ├── Icon.jsx            # Alle Icons
│   │   │   └── ...
│   │   │
│   │   ├── ui/              # Shadcn UI Komponenten
│   │   │   ├── button.jsx
│   │   │   ├── dialog.jsx
│   │   │   ├── dropdown-menu.jsx
│   │   │   └── ...
│   │   │
│   │   ├── Dashboard.jsx    # Dashboard Container
│   │   ├── SettingsPanel.jsx
│   │   └── ...
│   │
│   ├── modules/             # Business Logic (getrennt von UI)
│   │   ├── ai/
│   │   │   ├── AIModelSelector.js  # Modell-Konfiguration
│   │   │   ├── AIClient.js         # API-Aufrufe
│   │   │   ├── AIService.js        # KI-Service Facade
│   │   │   └── index.js
│   │   │
│   │   ├── core/
│   │   │   ├── ProjectState.js     # Zentraler State
│   │   │   └── ProjectReducer.js   # State-Änderungen
│   │   │
│   │   ├── audio/
│   │   │   └── AudioEngine.js
│   │   │
│   │   ├── export/
│   │   │   └── ExportEngine.js
│   │   │
│   │   ├── effects/
│   │   │   └── EffectsLibrary.js
│   │   │
│   │   ├── settings/
│   │   │   └── SettingsManager.js
│   │   │
│   │   └── cloud/
│   │       └── CloudService.js
│   │
│   ├── hooks/               # Custom React Hooks
│   │   ├── useProjects.js   # Projekt-Management
│   │   ├── useUndoRedo.js   # Undo/Redo
│   │   ├── useModal.js      # Modal-Steuerung
│   │   ├── useToast.js      # Notifications
│   │   └── ...
│   │
│   ├── store/               # Redux Store (teilweise genutzt)
│   │   ├── store.ts
│   │   ├── timelineSlice.ts
│   │   └── ...
│   │
│   ├── utils/               # Hilfsfunktionen
│   │   ├── timecode.js
│   │   ├── snap.js
│   │   └── ...
│   │
│   ├── icons/               # Icon Definitionen
│   │   └── index.jsx
│   │
│   ├── App.jsx              # Root Component
│   ├── main.jsx             # React Entry Point
│   └── index.css            # Globale Styles + CSS Variables
│
├── memory/                  # AI Agent Dokumentation
│   ├── PRD.md
│   ├── AGENT_QUICKSTART.md
│   ├── ARCHITECTURE.md
│   └── ...
│
├── test_reports/            # Test-Ergebnisse
│   └── iteration_*.json
│
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## Datenfluss

```
┌─────────────────────────────────────────────────────────────┐
│                        App.jsx                               │
│  (view === 'dashboard' ? <Dashboard/> : <EditorLayout/>)    │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│      Dashboard.jsx       │     │     EditorLayout.jsx        │
│  - LeftSidebar          │     │  - TimelinePanel            │
│  - FeatureTiles         │     │  - PreviewPanel             │
│  - ProjectGrid          │     │  - MediaPanel               │
│  - NewProjectModal      │     │  - AIChat                   │
└─────────────────────────┘     │  - InspectorPanel           │
                                └─────────────────────────────┘
                                              │
                                              ▼
                                ┌─────────────────────────────┐
                                │    modules/ (Business Logic) │
                                │  - ai/AIClient.js           │
                                │  - core/ProjectState.js     │
                                │  - export/ExportEngine.js   │
                                └─────────────────────────────┘
```

## State Management

### Aktuell (Hybrid):
- **React Context** für Editor-State (`EditorContext`)
- **useReducer** in `EditorLayout.jsx`
- **localStorage** für Einstellungen
- **Redux** (teilweise, in `/store/`)

### Ziel-Architektur:
- Zentraler State in `/modules/core/ProjectState.js`
- Actions über `/modules/core/ProjectReducer.js`

## KI-Integration Architektur

```
┌────────────────────────────────────────────────────────────┐
│                    UI Komponenten                           │
│  AIChat.jsx │ AIFeaturesPanel.jsx │ AutoCaptionPanel.jsx   │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│              AIModelSelectorUI.jsx                          │
│  (Dropdown für Provider/Modell-Auswahl)                    │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│                  modules/ai/AIClient.js                     │
│  - AIChat Klasse (Session-basiert)                         │
│  - quickPrompt() für Einzelanfragen                        │
│  - Streaming-Support                                        │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│               modules/ai/AIModelSelector.js                 │
│  - AI_PROVIDERS (OpenAI, Anthropic, Gemini)                │
│  - AI_FUNCTION_MODELS (Empfehlungen pro Funktion)          │
│  - loadAISettings() / saveAISettings()                     │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│                 Emergent LLM API                            │
│  https://api.emergentai.io/v1/chat/completions             │
│  Key: sk-emergent-67b5f95099879B4541                       │
└────────────────────────────────────────────────────────────┘
```

## Wichtige Patterns

### 1. Komponenten-Struktur
```jsx
export default function KomponentenName({ prop1, onAction }) {
  const [state, setState] = useState(initialValue);
  
  return (
    <div className="bg-[var(--bg-panel)] rounded-lg border border-[var(--border-subtle)]">
      {/* Header */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <span className="text-sm font-medium text-[var(--text-primary)]">Titel</span>
        <button onClick={onClose}>
          <Icon name="close" size={14} />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* ... */}
      </div>
    </div>
  );
}
```

### 2. Modal-Pattern
```jsx
{showModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
    <div className="animate-scaleIn">
      <ModalContent onClose={() => setShowModal(false)} />
    </div>
  </div>
)}
```

### 3. Icon-Verwendung
```jsx
import Icon from './Icon';

<Icon name="settings" size={16} strokeWidth={1.5} className="text-[var(--text-secondary)]" />
```
