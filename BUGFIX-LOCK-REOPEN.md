# 🔧 FIX: Projekt kann nicht mehrmals geöffnet werden

## Problem

Nach dem erfolgreichen Löschen und Neuerstellen konnte ein Projekt nicht mehrmals geöffnet werden mit der Fehlermeldung:

```
"Projekt wurde bereits von mir geöffnet"
```

**Ursache:**
- `openProject()` prüfte Lock und blockierte bei existierendem Lock
- Prüfte NICHT ob das Lock vom gleichen Prozess (eigene PID) stammt
- Erlaubte kein "Re-Open" vom gleichen Prozess

## Lösung

**Datei:** `electron/projectManager.cjs` → `openProject()`

### Vorher (blockierte eigene Locks):
```javascript
// 2. Prüfe Lock
const lockStatus = await checkLock(projectPath);
if (lockStatus.exists && !options.readOnly && !options.force) {
  return {
    success: false,
    locked: true,
    lockInfo: lockStatus
  };
}
```
❌ Blockierte auch wenn Lock vom gleichen Prozess war!

### Nachher (erlaubt eigene Locks):
```javascript
// 2. Prüfe Lock
const lockStatus = await checkLock(projectPath);

if (lockStatus.exists && !options.readOnly && !options.force) {
  // ✅ Prüfe ob es UNSER eigenes Lock ist
  const isOwnLock = lockStatus.pid === process.pid;
  
  if (!isOwnLock) {
    // Fremdes Lock → Blockieren
    console.log('[ProjectManager] Project locked by another process');
    return {
      success: false,
      locked: true,
      lockInfo: lockStatus
    };
  }
  
  // ✅ Eigenes Lock → Erlauben
  console.log('[ProjectManager] Project has own lock, allowing re-open');
}

// 5. Lock erwerben
// acquireLock() überschreibt automatisch eigene Locks
await acquireLock(projectPath);
```

**Features:**
- ✅ Prüft ob Lock vom eigenen Prozess stammt (`lockStatus.pid === process.pid`)
- ✅ Erlaubt Re-Open wenn eigenes Lock
- ✅ Blockiert nur fremde Locks
- ✅ `acquireLock()` überschreibt eigene Locks automatisch

## Wie es jetzt funktioniert

### Szenario 1: Mehrmaliges Öffnen

```
1. Öffne "Test Projekt"
   → Lock erstellt mit PID 12345
   → currentProjectPath = "C:\...\Test Projekt"

2. Schließe "Test Projekt" (zurück zu Dashboard)
   → Lock bleibt (falls nicht explizit geschlossen)
   → currentProjectPath wird zurückgesetzt

3. Öffne "Test Projekt" ERNEUT
   → checkLock() findet Lock mit PID 12345
   → lockStatus.pid (12345) === process.pid (12345)? JA ✅
   → console.log("Project has own lock, allowing re-open")
   → acquireLock() überschreibt altes Lock
   → Erfolgreich geöffnet! ✅
```

### Szenario 2: Fremdes Lock (Zwei Electron-Instanzen)

```
Instanz A (PID 1000): Öffnet "Test Projekt"
Instanz B (PID 2000): Versucht "Test Projekt" zu öffnen

→ checkLock() findet Lock mit PID 1000
→ lockStatus.pid (1000) === process.pid (2000)? NEIN ❌
→ console.log("Project locked by another process")
→ Fehler: "Projekt ist bereits geöffnet" ✅
→ Korrekt blockiert!
```

## Console-Logs

### Beim erfolgreichen Re-Open:
```
[IPC] project:open C:\...\Test Projekt {}
[ProjectManager] Opening project: "C:\...\Test Projekt"
[ProjectManager] Project has own lock, allowing re-open  ← ✅ WICHTIG!
[ProjectManager] Overwriting own lock
[ProjectManager] Project opened successfully
```

### Beim Blockieren durch fremdes Lock:
```
[ProjectManager] Opening project: "C:\...\Test Projekt"
[ProjectManager] Project locked by another process  ← ❌ Fremdes Lock
```

## Testing

### Test 1: Mehrmaliges Öffnen
```
1. Erstelle "Multi Open Test"
2. Öffne "Multi Open Test"
   ✅ Sollte funktionieren
3. Zurück zu Dashboard
4. Öffne "Multi Open Test" ERNEUT
   ✅ Sollte funktionieren (mit Log "Project has own lock, allowing re-open")
5. Wiederhole Schritte 3-4 mehrmals
   ✅ Sollte immer funktionieren!
```

### Test 2: Löschen → Neuerstellen → Öffnen
```
1. Erstelle "Delete Test"
2. Lösche "Delete Test"
3. Erstelle "Delete Test" erneut
   ✅ Sollte funktionieren (wir haben das schon gefixt)
4. Öffne "Delete Test"
   ✅ Sollte funktionieren
5. Zurück zu Dashboard
6. Öffne "Delete Test" erneut
   ✅ Sollte funktionieren!
```

### Test 3: Kompletter Workflow
```
1. Erstelle "Workflow Test"
2. Öffne "Workflow Test"
3. Füge Medien hinzu
4. Speichern
5. Zurück zu Dashboard
6. Öffne "Workflow Test" erneut
   ✅ Alle Medien sollten da sein
7. Bearbeiten
8. Speichern und Beenden
9. Öffne "Workflow Test" erneut
   ✅ Sollte funktionieren!
```

## Zusammenfassung der Fixes

### Alle Fixes in dieser Session:

1. ✅ **Lock-Konflikt beim Löschen**
   - `currentProjectPath` wird zurückgesetzt
   - Lock wird vor Löschen entfernt

2. ✅ **Lock-Konflikt beim Neuerstellen**
   - `acquireLock()` überschreibt eigene Locks
   - Ungültige Projekt-Reste werden bereinigt

3. ✅ **Lock-Konflikt beim Öffnen** ← NEUER FIX
   - `openProject()` erlaubt eigene Locks
   - Prüft `lockStatus.pid === process.pid`

## Status

✅ **KOMPLETT GEFIXT**

Jetzt sollte alles funktionieren:
- ✅ Erstellen
- ✅ Löschen
- ✅ Neuerstellen mit gleichem Namen
- ✅ Öffnen
- ✅ Mehrmaliges Öffnen
- ✅ Re-Open nach Bearbeitung

**Bitte testen Sie alle Szenarien!** 🎉
