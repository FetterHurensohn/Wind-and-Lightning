# 🤖 AI Agent Team - Master Index

> **Vollständige Dokumentation für AI-Agents.**
> Neue Agents sollten zuerst `AGENT_QUICKSTART.md` lesen!

---

## 📚 Dokumentations-Übersicht

### 🚀 Einstieg
| Dokument | Beschreibung |
|----------|--------------|
| **[AGENT_QUICKSTART.md](./AGENT_QUICKSTART.md)** | ⭐ **IMMER ZUERST LESEN** - 30-Sekunden Projekt-Übersicht |
| **[PRD.md](./PRD.md)** | Produkt-Anforderungen & aktueller Status |

### 🏗️ Architektur
| Dokument | Beschreibung |
|----------|--------------|
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Code-Struktur & Datenfluss-Diagramme |
| **[FILE_REFERENCE.md](./FILE_REFERENCE.md)** | Datei-Index mit Zeilennummern |
| **[HOOKS.md](./HOOKS.md)** | Custom React Hooks API-Referenz |

### 🎨 Design & Patterns
| Dokument | Beschreibung |
|----------|--------------|
| **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** | Farben, Typografie, Spacing, Komponenten |
| **[CODE_PATTERNS.md](./CODE_PATTERNS.md)** | UI-Patterns & Konventionen |
| **[COMMON_TASKS.md](./COMMON_TASKS.md)** | Copy-Paste Vorlagen für häufige Aufgaben |

### 🤖 KI-Integration
| Dokument | Beschreibung |
|----------|--------------|
| **[AI_API.md](./AI_API.md)** | Vollständige KI-Module API-Dokumentation |

### 🧪 Testing & Debugging
| Dokument | Beschreibung |
|----------|--------------|
| **[TESTING.md](./TESTING.md)** | Test-Methoden, Test-IDs, Szenarien |
| **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** | Häufige Probleme & Lösungen |

### 📊 Projekt-Management
| Dokument | Beschreibung |
|----------|--------------|
| **[CHANGELOG.md](./CHANGELOG.md)** | Alle Änderungen chronologisch |
| **[ROADMAP.md](./ROADMAP.md)** | Geplante Features (P0/P1/P2) |

---

## 🎯 Schnell-Navigation nach Aufgabe

### "Ich muss das Projekt verstehen"
```
1. AGENT_QUICKSTART.md  → 30-Sekunden Übersicht
2. PRD.md               → Was ist das Ziel?
3. ARCHITECTURE.md      → Wie ist es aufgebaut?
```

### "Ich muss eine UI-Komponente erstellen"
```
1. DESIGN_SYSTEM.md     → Farben, Spacing, etc.
2. CODE_PATTERNS.md     → Komponenten-Templates
3. COMMON_TASKS.md      → Copy-Paste Vorlagen
```

### "Ich muss ein KI-Feature hinzufügen"
```
1. AI_API.md            → API-Dokumentation
2. FILE_REFERENCE.md    → KI-Dateien finden
3. COMMON_TASKS.md      → KI-Vorlagen
```

### "Ich muss einen Bug fixen"
```
1. TROUBLESHOOTING.md   → Bekannte Probleme
2. FILE_REFERENCE.md    → Datei finden
3. TESTING.md           → Wie testen?
```

### "Ich muss verstehen was geplant ist"
```
1. ROADMAP.md           → P0/P1/P2 Features
2. CHANGELOG.md         → Was wurde schon gemacht?
```

---

## 💡 Credit-Spar-Tipps

1. **📖 Dokumentation zuerst** - Nicht blind Dateien erkunden
2. **⚡ Parallele Tool-Calls** - Mehrere Aktionen gleichzeitig
3. **🔄 Hot Reload nutzen** - Kein manueller Restart nötig
4. **📸 Ein Screenshot reicht** - Zur Verifizierung
5. **📝 Bulk-Edits** - Mehrere Änderungen auf einmal
6. **🎯 AGENT_QUICKSTART.md** - Spart 90% der Exploration

---

## 📊 Projekt-Übersicht

| Eigenschaft | Wert |
|-------------|------|
| **App-Typ** | Desktop Video-Editor |
| **Tech-Stack** | Electron + React + Vite + Tailwind |
| **Sprache** | Deutsch (UI & Code) |
| **Backend** | ❌ Keins (Frontend-only) |
| **KI-Provider** | OpenAI, Anthropic, Gemini |

### Status
```
✅ Dashboard mit Feature-Tiles
✅ KI-Integration (19 Modelle, 3 Provider)
✅ Einstellungen mit KI-Tab
✅ AI Agent Dokumentation
🔄 Export-Engine (in Arbeit)
📋 Cloud-Sync (geplant)
```

---

## 🔑 Wichtige Referenzen

### Credentials
```
Emergent LLM Key: sk-emergent-67b5f95099879B4541
API Endpoint: https://api.emergentai.io/v1/chat/completions
```

### Verzeichnisse
```
/app/src/components/editor/    → Editor-UI
/app/src/components/dashboard/ → Dashboard-UI
/app/src/modules/ai/           → KI-Logik
/app/src/modules/core/         → State Management
/app/src/hooks/                → Custom Hooks
/app/memory/                   → Diese Dokumentation
/app/test_reports/             → Test-Ergebnisse
```

### Befehle
```bash
# App läuft auf
http://localhost:3000

# Status
sudo supervisorctl status frontend

# Logs
tail -f /var/log/supervisor/frontend.out.log

# Neustart (nur bei .env/deps)
sudo supervisorctl restart frontend
```

---

## 📁 Alle Dokumentations-Dateien

```
/app/memory/
├── README.md           ← Du bist hier
├── AGENT_QUICKSTART.md ← Start hier!
├── PRD.md
├── ARCHITECTURE.md
├── FILE_REFERENCE.md
├── DESIGN_SYSTEM.md
├── CODE_PATTERNS.md
├── COMMON_TASKS.md
├── AI_API.md
├── HOOKS.md
├── TESTING.md
├── TROUBLESHOOTING.md
├── CHANGELOG.md
└── ROADMAP.md
```

**Gesamt: 13 Dokumentationsdateien**
