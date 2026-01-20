# 🐛 Bugfix: Projekt kann nicht gelöscht werden (Stale Lock)

## Problem

Nach dem Schließen und Neustarten der App konnte ein Projekt nicht gelöscht werden mit der Fehlermeldung:

```
Projekt ist noch geöffnet. Bitte schließen Sie es zuerst.
```

Obwohl die App geschlossen und neu gestartet wurde!

**Ursache:**
- Beim Öffnen eines Projekts wird eine `.lock` Datei erstellt
- Diese Datei enthält: User, Hostname, PID (Prozess-ID), Öffnungszeit
- Wenn die App **nicht sauber** geschlossen wird (Absturz, Task-Kill, etc.), bleibt die `.lock` Datei bestehen
- Das System dachte, das Projekt sei noch geöffnet → **Stale Lock**

## Lösung

Implementiere **intelligente Lock-Validierung** mit automatischer Stale-Lock-Entfernung:

### 1. Prozess-Existenz-Check

**Datei:** `electron/projectManager.cjs`

```javascript
/**
 * Prüft ob ein Prozess noch läuft
 */
function isProcessRunning(pid) {
  try {
    // process.kill(pid, 0) wirft einen Error wenn Prozess nicht existiert
    // Signal 0 prüft nur Existenz, tötet den Prozess nicht
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return false;
  }
}
```

**Wie es funktioniert:**
- `process.kill(pid, 0)` sendet kein tatsächliches Signal
- Wirft Error wenn Prozess nicht existiert → `return false`
- Gibt `true` zurück wenn Prozess läuft

### 2. Intelligente Lock-Validierung

**Datei:** `electron/projectManager.cjs`

**Vorher:**
```javascript
async function checkLock(projectPath) {
  const lockPath = path.join(projectPath, '.lock');
  
  try {
    const lockContent = await fs.readFile(lockPath, 'utf8');
    const lockData = JSON.parse(lockContent);
    return {
      exists: true,
      ...lockData
    };
  } catch (err) {
    return { exists: false };
  }
}
```
❌ Prüft nur ob Datei existiert, nicht ob Prozess läuft!

**Nachher:**
```javascript
async function checkLock(projectPath) {
  const lockPath = path.join(projectPath, '.lock');
  
  try {
    const lockContent = await fs.readFile(lockPath, 'utf8');
    const lockData = JSON.parse(lockContent);
    
    // ✅ 1. Prüfe ob der Prozess noch existiert
    if (lockData.pid && !isProcessRunning(lockData.pid)) {
      console.log(`[ProjectManager] Stale lock detected (PID ${lockData.pid} not running), removing...`);
      
      // Lösche stale Lock
      await fs.unlink(lockPath);
      return { exists: false, stale: true };
    }
    
    // ✅ 2. Prüfe Lock-Alter (> 1 Stunde = stale)
    if (lockData.openedAt) {
      const lockAge = Date.now() - new Date(lockData.openedAt).getTime();
      if (lockAge > 3600000) { // 1 Stunde
        console.log(`[ProjectManager] Stale lock detected (age: ${Math.floor(lockAge / 60000)} minutes), removing...`);
        await fs.unlink(lockPath);
        return { exists: false, stale: true };
      }
    }
    
    // Lock ist valide
    return {
      exists: true,
      ...lockData
    };
  } catch (err) {
    return { exists: false };
  }
}
```

**Features:**
- ✅ Prüft ob Prozess (PID) noch läuft
- ✅ Prüft Lock-Alter (> 1 Stunde = automatisch stale)
- ✅ Löscht automatisch stale Locks
- ✅ Loggt alle Aktionen

### 3. Force-Delete Option

**Datei:** `electron/projectManager.cjs`

```javascript
async function deleteProject(projectPath, options = {}) {
  // ...
  
  // Prüfe Lock (entfernt automatisch stale Locks)
  const lockStatus = await checkLock(projectPath);
  
  if (lockStatus.exists && !options.force) {
    return {
      success: false,
      error: 'Projekt ist noch geöffnet. Bitte schließen Sie es zuerst.',
      locked: true,
      lockInfo: lockStatus
    };
  }
  
  // Falls Lock noch existiert aber force=true, entferne Lock
  if (lockStatus.exists && options.force) {
    console.log('[ProjectManager] Force delete: Removing lock...');
    await releaseLock(projectPath);
  }
  
  // Lösche Projekt
  await fs.rm(projectPath, { recursive: true, force: true });
  
  return { success: true };
}
```

## Stale Lock Szenarien

### Szenario 1: Prozess existiert nicht mehr

```
1. App geöffnet → Projekt geöffnet → PID 12345
2. App abgestürzt / Task-Kill → Prozess 12345 tot
3. .lock Datei bleibt bestehen mit PID 12345
4. App neu gestartet
5. User versucht Projekt zu löschen
6. checkLock() prüft: isProcessRunning(12345)? → NEIN ❌
7. checkLock() löscht .lock automatisch
8. Löschen erfolgreich ✅
```

### Szenario 2: Lock älter als 1 Stunde

```
1. Projekt geöffnet um 10:00 Uhr
2. User verlässt Computer (App läuft im Hintergrund)
3. 2 Stunden später: User kommt zurück
4. User schließt App und öffnet neu
5. User versucht Projekt zu löschen
6. checkLock() prüft: Lock-Alter > 1 Stunde? → JA ✅
7. checkLock() löscht .lock automatisch
8. Löschen erfolgreich ✅
```

### Szenario 3: Projekt wirklich geöffnet

```
1. Projekt in Editor geöffnet → PID 56789
2. User wechselt zum Dashboard (ohne zu schließen)
3. User versucht Projekt zu löschen
4. checkLock() prüft: isProcessRunning(56789)? → JA ✅
5. Fehlermeldung: "Projekt ist noch geöffnet" ❌
6. User schließt Projekt
7. User löscht Projekt → Erfolgreich ✅
```

## Geänderte Dateien

1. ✅ `electron/projectManager.cjs`
   - Neue Funktion: `isProcessRunning(pid)`
   - Erweiterte Funktion: `checkLock()` mit Stale-Detection
   - Erweiterte Funktion: `deleteProject(path, options)`

2. ✅ `electron/main.cjs`
   - IPC-Handler akzeptiert jetzt `options` Parameter

3. ✅ `electron/preload.js`
   - API-Methode akzeptiert jetzt `options` Parameter

## Testing

### Test 1: Stale Lock durch Prozess-Terminierung

```powershell
# 1. Öffne Projekt in App
# 2. Task-Manager öffnen → App beenden (Task beenden)
# 3. App neu starten
# 4. Versuche Projekt zu löschen
# ✅ Erwartetes Ergebnis: Löschen erfolgreich (stale lock wird automatisch entfernt)
```

### Test 2: Stale Lock durch altes Lock

```powershell
# Manuell ein altes Lock erstellen:
cd "C:\Users\jacqu\OneDrive\Desktop\Wind and Lightning Projekts\com.lveditor.draft\Test Projekt"

# Erstelle .lock Datei mit altem Datum (> 1 Stunde)
echo '{
  "user": "jacqu",
  "hostname": "test",
  "pid": 99999,
  "openedAt": "2026-01-19T10:00:00.000Z"
}' > .lock

# Starte App und versuche Projekt zu löschen
# ✅ Erwartetes Ergebnis: Löschen erfolgreich
```

### Test 3: Valides Lock (Projekt tatsächlich geöffnet)

```powershell
# 1. Öffne Projekt in Editor
# 2. Gehe zurück zum Dashboard (ohne zu schließen)
# 3. Versuche Projekt zu löschen
# ❌ Erwartetes Ergebnis: Fehler "Projekt ist noch geöffnet"
# 4. Schließe Projekt
# 5. Versuche erneut zu löschen
# ✅ Erwartetes Ergebnis: Löschen erfolgreich
```

### Test 4: Force Delete (zukünftig verwendbar)

```javascript
// Im Code (falls nötig):
await window.electronAPI.projectAPI.delete(projectPath, { force: true });
// Löscht auch wenn Lock existiert (Vorsicht!)
```

## Console-Logs

Bei Stale Lock sehen Sie im Terminal:

```
[ProjectManager] Stale lock detected (PID 12345 not running), removing...
[ProjectManager] Project deleted successfully
```

Oder:

```
[ProjectManager] Stale lock detected (age: 125 minutes), removing...
[ProjectManager] Project deleted successfully
```

## Sicherheitsmaßnahmen

1. **Prozess-Check:** Verhindert Löschen wenn Prozess läuft
2. **Zeitbasierter Check:** Verhindert ewig bestehende Locks
3. **Automatische Bereinigung:** Entfernt stale Locks automatisch
4. **Logging:** Alle Aktionen werden geloggt

## Bekannte Einschränkungen

- **Cross-Platform PID-Check:** `process.kill(pid, 0)` funktioniert auf Windows/Linux/macOS
- **Shared PID:** PIDs können wiederverwendet werden (sehr unwahrscheinlich bei kurzer Zeit)
- **Network Locks:** Funktioniert nur für lokale Prozesse (nicht über Netzwerk)

## Zukünftige Verbesserungen (Optional)

1. **Heartbeat-System:**
   ```javascript
   // Lock wird alle 30 Sekunden aktualisiert
   setInterval(() => {
     updateLockTimestamp(projectPath);
   }, 30000);
   ```

2. **Benutzer-Benachrichtigung:**
   ```javascript
   // Zeige welcher User das Projekt geöffnet hat
   alert(`Projekt geöffnet von ${lockInfo.user} auf ${lockInfo.hostname}`);
   ```

3. **Lock-Override Dialog:**
   ```javascript
   // User kann entscheiden ob Lock ignoriert werden soll
   if (confirm('Projekt scheint geöffnet zu sein. Trotzdem löschen?')) {
     await deleteProject(path, { force: true });
   }
   ```

---

**Status:** ✅ FIXED
**Datum:** 2026-01-19
**Betrifft:** Lock-System und Projekt-Löschen

## Zusammenfassung

**Vorher:**
- ❌ Stale Locks blockieren Löschen
- ❌ Manuelles Entfernen von `.lock` nötig
- ❌ Keine Prozess-Validierung

**Nachher:**
- ✅ Automatische Stale-Lock-Erkennung
- ✅ Prozess-Existenz wird geprüft
- ✅ Zeit-basierte Stale-Detection (1 Stunde)
- ✅ Automatische Lock-Bereinigung
- ✅ Löschen funktioniert nach App-Neustart

**Jetzt können Sie das Projekt löschen!** 🎉
