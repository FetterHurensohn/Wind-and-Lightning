# 🤖 AI Agent Schnellstart-Guide

> **Dieses Dokument zuerst lesen!** Es spart Credits und Zeit.

## Projekt-Übersicht (30 Sekunden)

**Was ist das?** CapCut-ähnlicher Video-Editor als Desktop-App (Electron + React + Vite)

**Sprache:** Deutsch (UI und Kommentare)

**Kein Backend!** Alle API-Aufrufe direkt vom Frontend.

---

## 🚀 Sofort-Start Checkliste

```bash
# App läuft auf:
http://localhost:3000

# Server-Status prüfen:
sudo supervisorctl status frontend

# Logs bei Fehlern:
tail -n 50 /var/log/supervisor/frontend.out.log
tail -n 50 /var/log/supervisor/frontend.err.log

# Neustart nur bei .env oder dependency Änderungen:
sudo supervisorctl restart frontend
```

---

## 📁 Wichtigste Dateien (nach Priorität)

### Wenn du UI änderst:
| Datei | Zweck |
|-------|-------|
| `/app/src/App.jsx` | Root-Komponente, Routing Dashboard↔Editor |
| `/app/src/components/Dashboard.jsx` | Startseite mit Projekten |
| `/app/src/components/editor/EditorLayout.jsx` | Haupt-Editor Layout |
| `/app/src/components/SettingsPanel.jsx` | Einstellungen Modal |

### Wenn du KI-Features änderst:
| Datei | Zweck |
|-------|-------|
| `/app/src/modules/ai/AIModelSelector.js` | Modell-Konfiguration |
| `/app/src/modules/ai/AIClient.js` | API-Aufrufe |
| `/app/src/components/editor/AIChat.jsx` | Chat UI |
| `/app/src/components/editor/AIFeaturesPanel.jsx` | Drehbuch/Titel/etc. |

### Wenn du Timeline/Editor änderst:
| Datei | Zweck |
|-------|-------|
| `/app/src/components/editor/TimelinePanel.jsx` | Timeline UI |
| `/app/src/modules/core/ProjectState.js` | State Management |
| `/app/src/modules/core/ProjectReducer.js` | Actions |

---

## ⚠️ Kritische Regeln

1. **KEIN Backend** - Electron-App ohne Server
2. **Hot Reload aktiv** - Kein Restart bei Code-Änderungen nötig
3. **Emergent LLM Key** für KI: `sk-emergent-67b5f95099879B4541`
4. **Icons** immer aus `/app/src/components/editor/Icon.jsx`
5. **UI-Komponenten** aus `/app/src/components/ui/` (Shadcn)

---

## 🎨 Design-System

```css
/* Farben (CSS Variables) */
--bg-main: #0a0a0b        /* Hintergrund */
--bg-panel: #141416       /* Panels */
--bg-surface: #1a1a1d     /* Erhöhte Flächen */
--accent-turquoise: #00d4aa /* Primär-Akzent */
--accent-purple: #a855f7   /* Sekundär-Akzent */
--text-primary: #ffffff
--text-secondary: #a1a1aa
--border-subtle: #2a2a2d
```

---

## 🔧 Häufige Aufgaben

### Neue Komponente erstellen:
```jsx
// /app/src/components/editor/NeueKomponente.jsx
import React from 'react';
import Icon from './Icon';

export default function NeueKomponente({ onClose }) {
  return (
    <div className="bg-[var(--bg-panel)] rounded-lg border border-[var(--border-subtle)]">
      {/* Content */}
    </div>
  );
}
```

### Icon hinzufügen:
```jsx
// In /app/src/components/editor/Icon.jsx unter iconPaths:
neuesIcon: <path d="M..." />,
```

### KI-Modell hinzufügen:
```javascript
// In /app/src/modules/ai/AIModelSelector.js unter AI_PROVIDERS:
openai: {
  models: [
    { id: 'neues-modell', name: 'Neues Modell', description: 'Beschreibung' },
  ]
}
```

---

## 📊 Aktueller Stand

### ✅ Fertig:
- KI-Modell-Auswahl (19 Modelle, 3 Provider)
- KI-Funktionen Panel (Drehbuch, Titel, Übersetzen, Ideen)
- Einstellungen mit KI-Tab
- Dashboard mit Feature-Tiles

### 🔄 In Arbeit:
- Export-Engine Integration
- Audio-zu-Text Transkription

### 📋 Todo:
- Cloud-Sync
- Multicam-Editor
- Text-to-Video

---

## 🧪 Testen

```bash
# Screenshot machen:
# → mcp_screenshot_tool mit http://localhost:3000

# Testing Agent aufrufen für größere Features:
# → testing_agent_v3_fork

# Test-Reports:
/app/test_reports/iteration_*.json
```

---

## 💡 Credit-Spar-Tipps

1. **Dieses Dokument zuerst lesen** statt Dateien erkunden
2. **Parallele Tool-Calls** nutzen
3. **Keine unnötigen Screenshots** - einer reicht zur Verifizierung
4. **Hot Reload vertrauen** - kein manueller Restart nötig
5. **Bulk-Edits** statt einzelne kleine Änderungen
