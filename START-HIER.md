# 🚀 SO STARTEN SIE DIE APP

## ✅ RICHTIG (funktioniert ohne Fehler):

```bash
npm start
```

**ODER**

```bash
npm run electron:prod
```

**Das macht:**
- ✅ Baut Production Build (`vendor-react` als EIN Chunk)
- ✅ Startet Electron mit `NODE_ENV=production`
- ✅ Keine React-Duplikation
- ✅ Keine "Invalid hook call" Fehler

---

## ❌ FALSCH (verursacht Fehler):

```bash
npm run electron:dev
```

**Problem:**
- ❌ Startet Vite Dev-Server
- ❌ React wird in mehrere Chunks gesplittet
- ❌ "Invalid hook call" Fehler
- ❌ Schwarzer Bildschirm

---

## 🔧 Für Entwicklung:

Wenn Sie Änderungen am Code machen:

1. **Code ändern**
2. **Neu bauen und starten:**
   ```bash
   npm start
   ```

**Das ist der einzige funktionierende Weg!**

---

## 📝 Warum?

Vite's Dev-Server hat ein bekanntes Problem mit React + Electron:
- Dev-Mode splittet React in separate Chunks
- Das führt zu mehreren React-Instanzen
- React Hooks funktionieren nicht mit mehreren Instanzen

**Lösung:** Production Build verwenden (auch für Development)
- `manualChunks` erzwingt einen einzigen `vendor-react` Chunk
- Eine React-Instanz = Alles funktioniert

---

## 🎯 Zusammenfassung:

| Command | Status | Beschreibung |
|---------|--------|--------------|
| `npm start` | ✅ VERWENDEN | Production Build + Start |
| `npm run electron:prod` | ✅ VERWENDEN | Gleich wie oben |
| `npm run electron:dev` | ❌ NICHT VERWENDEN | Vite Dev-Server mit Fehlern |

---

**Bei Problemen:** Alle Prozesse beenden und neu starten:

```bash
# Windows PowerShell
Get-Process | Where-Object {$_.ProcessName -match "node|electron"} | Stop-Process -Force
npm start
```
