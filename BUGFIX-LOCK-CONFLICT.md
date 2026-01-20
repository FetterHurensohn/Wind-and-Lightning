# 🐛 Bugfix: Lock-Konflikt beim Löschen und Neuerstellen

## Problem

Nach dem Löschen eines Projekts und dem Versuch, ein neues Projekt mit dem gleichen Namen zu erstellen:

1. **Beim Erstellen:** Fehlermeldung "Projekt wurde von mir geöffnet"
2. **Beim Löschen des neuen Projekts:** Fehlermeldung "Projekt ist geöffnet", obwohl es nicht geöffnet wurde

**Ursache:**
- Wenn ein Projekt erstellt und direkt geöffnet wird, setzt Electron `currentProjectPath`
- Wenn Sie zurück zum Dashboard gehen (ohne Projekt zu schließen) und löschen
- `currentProjectPath` bleibt gesetzt mit dem alten Pfad
- Lock-Datei wird erstellt mit der gleichen PID (Electron-Prozess)
- System denkt, das Projekt sei noch geöffnet

## Root Cause Analyse

### Szenario:

```
1. User erstellt Projekt "Test Projekt"
   → Pfad: C:\...\Test Projekt
   → Electron öffnet automatisch
   → currentProjectPath = "C:\...\Test Projekt"
   → Lock erstellt mit PID 12345

2. User geht zurück zum Dashboard (ohne zu schließen)
   → currentProjectPath = "C:\...\Test Projekt" (bleibt!)
   → Lock bleibt bestehen

3. User löscht Projekt
   → checkLock() findet Lock mit PID 12345
   → Aktueller Prozess = 12345
   → isProcessRunning(12345) = TRUE ✅
   → Fehler: "Projekt ist noch geöffnet" ❌

4. User erstellt neues Projekt "Test Projekt"
   → Pfad: C:\...\Test Projekt (gleicher Pfad!)
   → System versucht Lock zu erstellen
   → currentProjectPath zeigt noch auf alten (gelöschten) Pfad
   → Konflikt!
```

## Lösung

### 1. Automatisches Schließen vor Löschen

**Datei:** `electron/main.cjs`

```javascript
ipcMain.handle('project:delete', async (event, projectPath, options) => {
  console.log('[IPC] project:delete', projectPath, options);
  try {
    // ✅ Wenn das zu löschende Projekt aktuell geöffnet ist, schließe es zuerst
    if (currentProjectPath === projectPath) {
      console.log('[IPC] Closing currently open project before deletion');
      await projectManager.closeProject(currentProjectPath);
      currentProjectPath = null;  // ✅ WICHTIG: Zurücksetzen!
    }
    
    const result = await projectManager.deleteProject(projectPath, options);
    
    return result;
  } catch (error) {
    console.error('[IPC] Error deleting project:', error);
    return { success: false, error: error.message };
  }
});
```

**Änderungen:**
- ✅ Prüft ob `currentProjectPath === projectPath`
- ✅ Schließt Projekt automatisch vor Löschen
- ✅ Setzt `currentProjectPath = null` zurück

### 2. Eigene Locks erlauben beim Löschen

**Datei:** `electron/projectManager.cjs`

**Vorher:**
```javascript
// Prüfe Lock
const lockStatus = await checkLock(projectPath);
if (lockStatus.exists && !options.force) {
  return {
    success: false,
    error: 'Projekt ist noch geöffnet. Bitte schließen Sie es zuerst.',
    locked: true
  };
}
```
❌ Blockiert auch wenn Lock vom gleichen Prozess gesetzt wurde!

**Nachher:**
```javascript
// Prüfe Lock
const lockStatus = await checkLock(projectPath);

// ✅ Wenn Lock existiert und es der aktuelle Prozess ist, ist das OK
const isOwnLock = lockStatus.exists && lockStatus.pid === process.pid;

if (lockStatus.exists && !isOwnLock && !options.force) {
  return {
    success: false,
    error: 'Projekt ist noch geöffnet. Bitte schließen Sie es zuerst.',
    locked: true,
    lockInfo: lockStatus
  };
}

// ✅ Entferne Lock wenn vorhanden (eigenes Lock oder force)
if (lockStatus.exists) {
  console.log('[ProjectManager] Removing lock before deletion...');
  await releaseLock(projectPath);
}
```

**Features:**
- ✅ Erkennt eigene Locks (`lockStatus.pid === process.pid`)
- ✅ Erlaubt Löschen von eigenen Locks
- ✅ Blockiert nur Locks von anderen Prozessen
- ✅ Entfernt Lock automatisch vor Löschen

## Ablauf nach Fix

### Erfolgreicher Ablauf:

```
1. User erstellt "Test Projekt"
   → currentProjectPath = "C:\...\Test Projekt"
   → Lock: PID 12345

2. User geht zu Dashboard
   → currentProjectPath = "C:\...\Test Projekt" (bleibt)

3. User klickt "Löschen"
   → main.cjs prüft: currentProjectPath === projectPath? JA ✅
   → closeProject() wird aufgerufen
   → currentProjectPath = null ✅
   → Lock wird entfernt
   → deleteProject() wird aufgerufen
   → checkLock() findet kein Lock
   → Löschen erfolgreich ✅

4. User erstellt neues "Test Projekt"
   → Neuer Projektordner
   → Neues Lock (kein Konflikt)
   → Erfolgreich! ✅
```

## Geänderte Dateien

1. ✅ `electron/main.cjs`
   - `project:delete` Handler schließt Projekt automatisch
   - Setzt `currentProjectPath = null`

2. ✅ `electron/projectManager.cjs`
   - `deleteProject()` erkennt eigene Locks
   - Erlaubt Löschen von eigenen Locks

## Testing

### Test 1: Projekt löschen während es geöffnet ist

```
1. Erstelle Projekt "Test Delete"
   → Wird automatisch geöffnet
   
2. Gehe zurück zum Dashboard (ohne zu schließen)
   → Projekt ist noch intern geöffnet
   
3. Klicke "Löschen" auf "Test Delete"
   ✅ Erwartetes Ergebnis: Erfolgreich gelöscht (automatisch geschlossen)
   
4. Erstelle neues Projekt "Test Delete"
   ✅ Erwartetes Ergebnis: Erfolgreich erstellt (kein Lock-Konflikt)
```

### Test 2: Mehrfaches Erstellen/Löschen mit gleichem Namen

```
1. Erstelle "Duplicate Name"
2. Lösche "Duplicate Name"
3. Erstelle "Duplicate Name" erneut
4. Lösche "Duplicate Name" erneut
5. Erstelle "Duplicate Name" noch einmal

✅ Erwartetes Ergebnis: Alle Operationen erfolgreich
```

### Test 3: Projekt in externem Prozess geöffnet

```
# Simuliere Lock von anderem Prozess:
cd "C:\...\Test Projekt"
echo '{
  "user": "test",
  "hostname": "test",
  "pid": 99999,
  "openedAt": "2026-01-19T15:00:00.000Z"
}' > .lock

# Versuche zu löschen:
❌ Erwartetes Ergebnis: Fehler "Projekt ist noch geöffnet"
   (Weil PID 99999 ≠ aktueller Prozess)
```

## Console-Logs

Bei automatischem Schließen vor Löschen:

```
[IPC] project:delete C:\...\Test Projekt {}
[IPC] Closing currently open project before deletion
[ProjectManager] Closing project: "C:\...\Test Projekt"
[ProjectManager] Removing lock before deletion...
[ProjectManager] Deleting project: "C:\...\Test Projekt"
[ProjectManager] Project deleted successfully
```

## Edge Cases

### Edge Case 1: Zwei Electron-Instanzen

```
Instanz A: Öffnet Projekt (PID 1000)
Instanz B: Versucht zu löschen (PID 2000)

Ergebnis: 
❌ Fehler "Projekt ist noch geöffnet"
   (Weil PID 1000 ≠ PID 2000)
   ✅ Korrekt! Verhindert Datenverlust
```

### Edge Case 2: Projekt geöffnet in Editor

```
User öffnet Projekt im Editor
User geht zu Dashboard
User löscht Projekt

Ergebnis:
✅ Projekt wird automatisch geschlossen
✅ Lock wird entfernt
✅ Projekt wird gelöscht
```

### Edge Case 3: Schnelles Erstellen/Löschen

```
for (let i = 0; i < 10; i++) {
  createProject("Test");
  deleteProject("Test");
}

✅ Erwartetes Ergebnis: Alle Operationen erfolgreich
```

## Sicherheitsmaßnahmen

1. **Automatisches Schließen:** Verhindert Datenverlust
2. **PID-Check:** Nur eigene Locks werden automatisch entfernt
3. **Lock-Entfernung:** Lock wird vor Löschen sauber entfernt
4. **currentProjectPath Reset:** Verhindert Stale-Referenzen

## Bekannte Einschränkungen

- **Single-Instance:** Funktioniert nur innerhalb des gleichen Electron-Prozesses
- **Multi-User:** Locks von anderen Usern werden blockiert (erwünschtes Verhalten)

## Zukünftige Verbesserungen (Optional)

1. **Lock-Registry in Main Process:**
   ```javascript
   const openProjects = new Set();
   
   function openProject(path) {
     openProjects.add(path);
   }
   
   function closeProject(path) {
     openProjects.delete(path);
   }
   
   function isProjectOpen(path) {
     return openProjects.has(path);
   }
   ```

2. **Warnung vor Löschen geöffneter Projekte:**
   ```javascript
   if (isProjectOpen(projectPath)) {
     const confirm = await showDialog('Projekt ist geöffnet. Trotzdem löschen?');
     if (!confirm) return;
   }
   ```

---

**Status:** ✅ FIXED
**Datum:** 2026-01-19
**Betrifft:** Lock-Management und currentProjectPath-State

## Zusammenfassung

**Vorher:**
- ❌ currentProjectPath bleibt nach Löschen gesetzt
- ❌ Eigene Locks blockieren Löschen
- ❌ Konflikt beim Neuerstellen mit gleichem Namen

**Nachher:**
- ✅ currentProjectPath wird automatisch zurückgesetzt
- ✅ Eigene Locks werden erkannt und erlaubt
- ✅ Automatisches Schließen vor Löschen
- ✅ Kein Konflikt beim Neuerstellen

**Jetzt können Sie Projekte löschen und mit gleichem Namen neu erstellen!** 🎉
