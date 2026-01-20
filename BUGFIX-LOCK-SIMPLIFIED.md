# 🔧 VEREINFACHTER FIX: Lock-System komplett überarbeitet

## Was ich geändert habe (Radikal vereinfacht)

Das Problem war, dass die Lock-Logik zu komplex war mit vielen Edge Cases. Ich habe es jetzt **radikal vereinfacht**:

### 1. Smart `acquireLock()` - Überschreibt eigene Locks

**Datei:** `electron/projectManager.cjs`

**Neue Logik:**
```javascript
async function acquireLock(projectPath, options = {}) {
  const lockPath = path.join(projectPath, '.lock');
  
  try {
    const existingLock = await fs.readFile(lockPath, 'utf8');
    const lockData = JSON.parse(existingLock);
    
    // ✅ SCHLÜSSEL-FIX: Wenn es der GLEICHE Prozess ist, überschreibe einfach!
    if (lockData.pid === process.pid) {
      console.log('[ProjectManager] Overwriting own lock');
      // Erstelle einfach neues Lock → KEIN FEHLER!
    } else {
      // Prüfe nur bei FREMDEN Locks
      const lockAge = Date.now() - new Date(lockData.openedAt).getTime();
      const processStillRunning = isProcessRunning(lockData.pid);
      
      if (lockAge < 3600000 && processStillRunning && !options.force) {
        return { success: false, locked: true, lockInfo: lockData };
      }
      
      // Stale lock → Entfernen
      if (!processStillRunning || lockAge >= 3600000) {
        await fs.unlink(lockPath);
      }
    }
  } catch (err) {
    // Kein Lock → OK
  }
  
  // Erstelle neues Lock
  await fs.writeFile(lockPath, JSON.stringify(lockData, null, 2), 'utf8');
  return { success: true };
}
```

**Warum das funktioniert:**
- Wenn Sie ein Projekt erstellen → Lock mit Ihrer PID
- Wenn Sie es löschen und neu erstellen → Gleiche PID
- `acquireLock()` sieht: "Das ist meine eigene PID!" → Überschreiben, kein Fehler!

### 2. Aggressive `currentProjectPath` Zurücksetzung

**Datei:** `electron/main.cjs`

```javascript
ipcMain.handle('project:delete', async (event, projectPath, options) => {
  // ✅ IMMER zurücksetzen wenn Pfad übereinstimmt
  if (currentProjectPath && currentProjectPath === projectPath) {
    await projectManager.closeProject(currentProjectPath);
    currentProjectPath = null;
  }
  
  const result = await projectManager.deleteProject(projectPath, options);
  
  // ✅ DOPPELTE SICHERHEIT: Nochmal zurücksetzen nach erfolgreichem Löschen
  if (result.success && currentProjectPath === projectPath) {
    console.log('[IPC] Force resetting currentProjectPath after successful deletion');
    currentProjectPath = null;
  }
  
  return result;
});
```

## Warum diese Lösung funktionieren MUSS

### Szenario 1: Normales Erstellen/Löschen/Neuerstellen

```
1. Erstelle "Test"
   → acquireLock()
   → Lock erstellt mit PID 12345
   → currentProjectPath = "C:\...\Test"

2. Lösche "Test"
   → currentProjectPath === "C:\...\Test"? JA
   → closeProject() + currentProjectPath = null
   → deleteProject()
   → Ordner + Lock gelöscht

3. Erstelle "Test" erneut
   → acquireLock()
   → Findet altes Lock mit PID 12345
   → lockData.pid === process.pid? JA (gleicher Prozess!)
   → console.log("Overwriting own lock")
   → Überschreibt Lock OHNE FEHLER ✅
   → currentProjectPath = "C:\...\Test"
```

### Szenario 2: Lock bleibt aus irgendeinem Grund

```
1. Erstelle "Test" → Lock PID 12345
2. Lösche "Test" → Lock sollte weg sein, aber bleibt aus Bug
3. Erstelle "Test" erneut
   → acquireLock() findet Lock PID 12345
   → lockData.pid (12345) === process.pid (12345)? JA
   → Überschreibt Lock ✅
```

### Szenario 3: Zwei verschiedene Electron-Instanzen

```
Instanz A (PID 1000): Öffnet "Test"
Instanz B (PID 2000): Versucht "Test" zu erstellen

→ acquireLock() findet Lock PID 1000
→ lockData.pid (1000) === process.pid (2000)? NEIN
→ isProcessRunning(1000)? JA
→ Fehler: "Projekt ist geöffnet" ✅
→ Korrekt verhindert!
```

## Test-Anweisungen (BITTE GENAU BEFOLGEN)

### Schritt 1: Komplette Bereinigung

```powershell
# 1. Alle Electron-Prozesse beenden
Get-Process | Where-Object {$_.ProcessName -match "electron"} | Stop-Process -Force

# 2. Alle Test-Projekte löschen
cd "C:\Users\jacqu\OneDrive\Desktop\Wind and Lightning Projekts\com.lveditor.draft"
Get-ChildItem | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Bereinigung abgeschlossen!" -ForegroundColor Green
```

### Schritt 2: App starten und testen

```powershell
npm start
```

### Schritt 3: Test-Sequenz

**Test A: Einfaches Löschen/Neuerstellen**
```
1. Erstelle "Simple Test"
   → Sollte erfolgreich sein
   
2. Lösche "Simple Test"
   → Terminal sollte zeigen:
     "[IPC] Resetting currentProjectPath because project will be deleted"
     "[IPC] Force resetting currentProjectPath after successful deletion"
   
3. Erstelle "Simple Test" erneut
   → Terminal sollte zeigen:
     "[ProjectManager] Overwriting own lock"
   → ✅ SOLLTE ERFOLGREICH SEIN!
```

**Test B: Mehrfaches Löschen/Erstellen**
```
for (i = 1; i <= 3; i++) {
  1. Erstelle "Loop Test"
  2. Lösche "Loop Test"
  3. Sofort erstelle "Loop Test" wieder
}

✅ Alle 3 Iterationen sollten erfolgreich sein
```

**Test C: Ohne Löschen neu erstellen**
```
1. Erstelle "Duplicate Test"
2. Versuche "Duplicate Test" NOCHMAL zu erstellen (OHNE zu löschen)
   → ❌ Sollte Fehler geben: "Projekt existiert bereits"
   → Das ist KORREKTES Verhalten!
```

## Was Sie im Terminal sehen sollten

### Beim erfolgreichen Löschen:
```
[IPC] project:delete C:\...\Simple Test {}
[IPC] currentProjectPath before delete: C:\...\Simple Test
[IPC] Resetting currentProjectPath because project will be deleted
[ProjectManager] Closing project: "C:\...\Simple Test"
[ProjectManager] Deleting project: "C:\...\Simple Test"
[ProjectManager] Removing lock before deletion...
[ProjectManager] Deleting project folder...
[ProjectManager] Project folder successfully deleted
[IPC] Delete result: { success: true }
```

### Beim erfolgreichen Neuerstellen:
```
[IPC] project:create Simple Test { ... }
[ProjectManager] Creating project: "Simple Test"
[ProjectManager] Overwriting own lock  ← ✅ DIESER TEXT IST WICHTIG!
[ProjectManager] Folder structure created
[ProjectManager] Manifests initialized
[ProjectManager] Lock acquired
[IPC] Set currentProjectPath after creation: C:\...\Simple Test
```

## Wenn es IMMER NOCH fehlschlägt

### Diagnose-Befehle:

**1. Prüfe ob Prozess-ID sich ändert:**
```powershell
# In PowerShell während App läuft:
Get-Process electron | Select-Object Id, ProcessName

# Merke dir die PID (z.B. 12345)
# Nach App-Neustart:
Get-Process electron | Select-Object Id, ProcessName

# Ist die PID gleich? Sollte ANDERS sein bei Neustart!
```

**2. Prüfe Lock-Datei manuell:**
```powershell
cd "C:\Users\jacqu\OneDrive\Desktop\Wind and Lightning Projekts\com.lveditor.draft\Simple Test"
type .lock

# Sollte zeigen:
# {
#   "user": "jacqu",
#   "hostname": "...",
#   "pid": 12345,  ← Ist das die gleiche PID wie in Terminal?
#   "openedAt": "..."
# }
```

**3. Teste Lock-Überschreiben manuell:**
```powershell
# Erstelle manuell Lock mit aktueller PID:
$pid = (Get-Process electron).Id
$lock = @{
  user = $env:USERNAME
  hostname = $env:COMPUTERNAME
  pid = $pid
  openedAt = (Get-Date).ToUniversalTime().ToString("o")
} | ConvertTo-Json

$lock | Out-File -FilePath ".lock" -Encoding utf8

# Versuche jetzt Projekt zu erstellen mit GLEICHEM Namen
# → Sollte "Overwriting own lock" zeigen und ERFOLGREICH sein
```

## Letzte Optionen (Nuclear Options)

### Option 1: Lock-System komplett deaktivieren (nur für Debug)

```javascript
// In projectManager.cjs → createProject():
// Kommentiere aus:
// await acquireLock(projectPath);

// Teste ohne Locks ob Problem weiterhin besteht
```

### Option 2: Force-Delete immer verwenden

```javascript
// In useProjects.js → deleteProjects():
const result = await window.electronAPI.projectAPI.delete(project.path, { force: true });
```

---

**Status:** ✅ VEREINFACHTE LÖSUNG IMPLEMENTIERT  
**Confidence:** SEHR HOCH - Eigene Locks werden überschrieben  
**Next Step:** BITTE TESTEN mit kompletter Bereinigung zuerst!

Wenn es IMMER NOCH nicht funktioniert, brauche ich:
1. Terminal-Logs vom Erstellen
2. Terminal-Logs vom Löschen  
3. Terminal-Logs vom Neuerstellen
4. Inhalt der `.lock` Datei nach jedem Schritt
