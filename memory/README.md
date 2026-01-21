# 🤖 AI Agent Team - Master Index

> **Dieses Projekt hat eine vollständige AI-Agent-Dokumentation.**
> Neue Agents sollten zuerst `AGENT_QUICKSTART.md` lesen!

---

## 📚 Dokumentations-Übersicht

| Dokument | Zweck | Wann lesen? |
|----------|-------|-------------|
| **[AGENT_QUICKSTART.md](./AGENT_QUICKSTART.md)** | Schnellstart für neue Agents | **IMMER ZUERST** |
| **[PRD.md](./PRD.md)** | Produkt-Anforderungen & Status | Bei Feature-Planung |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Code-Architektur & Datenfluss | Bei strukturellen Änderungen |
| **[FILE_REFERENCE.md](./FILE_REFERENCE.md)** | Datei-Index mit Zeilennummern | Beim Navigieren im Code |
| **[CODE_PATTERNS.md](./CODE_PATTERNS.md)** | UI-Patterns & Konventionen | Beim Erstellen neuer Komponenten |
| **[COMMON_TASKS.md](./COMMON_TASKS.md)** | Copy-Paste Vorlagen | Für häufige Aufgaben |
| **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** | Problemlösungen | Bei Fehlern |

---

## 🎯 Schnell-Navigation nach Aufgabe

### "Ich muss eine UI-Komponente erstellen"
1. → [CODE_PATTERNS.md](./CODE_PATTERNS.md) - Komponenten-Patterns
2. → [COMMON_TASKS.md](./COMMON_TASKS.md) - Vorlagen

### "Ich muss ein KI-Feature hinzufügen"
1. → [ARCHITECTURE.md](./ARCHITECTURE.md) - KI-Integration Architektur
2. → [FILE_REFERENCE.md](./FILE_REFERENCE.md) - KI-Dateien
3. → [COMMON_TASKS.md](./COMMON_TASKS.md) - KI-Vorlagen

### "Ich muss einen Bug fixen"
1. → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Bekannte Probleme
2. → [FILE_REFERENCE.md](./FILE_REFERENCE.md) - Betroffene Dateien finden

### "Ich muss die App verstehen"
1. → [AGENT_QUICKSTART.md](./AGENT_QUICKSTART.md) - 30-Sekunden Übersicht
2. → [ARCHITECTURE.md](./ARCHITECTURE.md) - Vollständige Architektur

---

## 💡 Credit-Spar-Tipps

1. **Dokumentation zuerst** - Nicht blind Dateien erkunden
2. **Parallele Tool-Calls** - Mehrere Aktionen gleichzeitig
3. **Hot Reload nutzen** - Kein manueller Restart nötig
4. **Ein Screenshot reicht** - Zur Verifizierung
5. **Bulk-Edits** - Mehrere Änderungen auf einmal

---

## 📊 Projekt-Status

**App-Typ:** Desktop Video-Editor (Electron + React + Vite)

**Sprache:** Deutsch

**Aktueller Stand:**
- ✅ Dashboard mit Feature-Tiles
- ✅ KI-Integration (19 Modelle, 3 Provider)
- ✅ Einstellungen mit KI-Tab
- 🔄 Export-Engine (in Arbeit)
- 📋 Cloud-Sync (geplant)

---

## 🔑 Wichtige Credentials

```
Emergent LLM Key: sk-emergent-67b5f95099879B4541
API Endpoint: https://api.emergentai.io/v1/chat/completions
```

---

## 📁 Wichtigste Verzeichnisse

```
/app/src/components/editor/   → Editor-UI-Komponenten
/app/src/components/dashboard/ → Dashboard-Komponenten
/app/src/modules/ai/          → KI-Logik
/app/src/modules/core/        → State Management
/app/src/hooks/               → Custom Hooks
/app/memory/                  → Diese Dokumentation
/app/test_reports/            → Test-Ergebnisse
```

---

## ⚡ Sofort-Start Befehle

```bash
# App läuft auf
http://localhost:3000

# Status
sudo supervisorctl status frontend

# Logs
tail -f /var/log/supervisor/frontend.out.log

# Neustart (nur bei .env/dependency Änderungen)
sudo supervisorctl restart frontend
```
