# 🐛 Bugfix Update: Lock-Konflikt - Zusätzliche Maßnahmen

## Neue Erkenntnisse

Das Problem war komplexer als ursprünglich gedacht:

### Root Cause

1. **`project:create` setzt Lock, aber NICHT `currentProjectPath`**
   - `createProject()` → Lock wird gesetzt
   - `currentProjectPath` = null
   
2. **Frontend öffnet Projekt automatisch**
   - `project:open` wird aufgerufen
   - `currentProjectPath` wird gesetzt

3. **Race Condition beim Löschen**
   - User löscht Projekt
   - `currentProjectPath` könnte zwischen create und open noch null sein
   - Oder: `currentProjectPath` ist gesetzt, aber Lock-Check schlägt fehl

## Zusätzliche Fixes

### Fix 1: `currentProjectPath` beim Erstellen setzen

**Datei:** `electron/main.cjs`

```javascript
ipcMain.handle('project:create', async (event, name, options) => {
  console.log('[IPC] project:create', name, options);
  try {
    const result = await projectManager.createProject(name, options);
    
    // ✅ NEU: Setze currentProjectPath sofort beim Erstellen
    if (result.success && result.projectPath) {
      currentProjectPath = result.projectPath;
      console.log('[IPC] Set currentProjectPath after creation:', currentProjectPath);
    }
    
    return result;
  } catch (error) {
    console.error('[IPC] Error creating project:', error);
    return { success: false, error: error.message };
  }
});
```

**Warum?**
- Projekt wird erstellt → Lock wird gesetzt
- `currentProjectPath` wird **sofort** gesetzt
- Beim Löschen wird `currentProjectPath` erkannt
- Projekt wird automatisch geschlossen vor Löschen

### Fix 2: Erweiterte Debug-Logs

**Datei:** `electron/main.cjs`

```javascript
ipcMain.handle('project:delete', async (event, projectPath, options) => {
  console.log('[IPC] project:delete', projectPath, options);
  console.log('[IPC] currentProjectPath before delete:', currentProjectPath); // ✅ DEBUG
  
  try {
    if (currentProjectPath === projectPath) {
      console.log('[IPC] Closing currently open project before deletion');
      await projectManager.closeProject(currentProjectPath);
      currentProjectPath = null;
      console.log('[IPC] currentProjectPath reset to null'); // ✅ DEBUG
    }
    
    const result = await projectManager.deleteProject(projectPath, options);
    
    console.log('[IPC] Delete result:', result); // ✅ DEBUG
    return result;
  } catch (error) {
    console.error('[IPC] Error deleting project:', error);
    return { success: false, error: error.message };
  }
});
```

## Testing mit Debug-Logs

### Schritt 1: Terminal beobachten

Öffnen Sie das Terminal wo `npm start` läuft und beobachten Sie die Logs.

### Schritt 2: Projekt erstellen

1. Erstellen Sie "Test Projekt"
2. **Erwartete Logs:**
   ```
   [IPC] project:create Test Projekt { fps: 30, resolution: {...} }
   [ProjectManager] Creating project: "Test Projekt"
   [ProjectManager] Folder structure created
   [ProjectManager] Manifests initialized
   [ProjectManager] Lock acquired
   [IPC] Set currentProjectPath after creation: C:\...\Test Projekt
   ```
   ✅ `currentProjectPath` ist jetzt gesetzt!

### Schritt 3: Zurück zum Dashboard

Gehen Sie zurück zum Dashboard (ohne Projekt zu schließen).

### Schritt 4: Projekt löschen

1. Klicken Sie "Löschen" auf "Test Projekt"
2. **Erwartete Logs:**
   ```
   [IPC] project:delete C:\...\Test Projekt {}
   [IPC] currentProjectPath before delete: C:\...\Test Projekt
   [IPC] Closing currently open project before deletion
   [ProjectManager] Closing project: "C:\...\Test Projekt"
   [IPC] currentProjectPath reset to null
   [ProjectManager] Deleting project: "C:\...\Test Projekt"
   [ProjectManager] Removing lock before deletion...
   [ProjectManager] Project deleted successfully
   [IPC] Delete result: { success: true }
   ```
   ✅ Projekt wurde geschlossen vor Löschen!

### Schritt 5: Neues Projekt mit gleichem Namen

1. Erstellen Sie "Test Projekt" erneut
2. **Erwartete Logs:**
   ```
   [IPC] project:create Test Projekt { fps: 30, resolution: {...} }
   [ProjectManager] Creating project: "Test Projekt"
   [ProjectManager] Folder structure created
   [ProjectManager] Manifests initialized
   [ProjectManager] Lock acquired
   [IPC] Set currentProjectPath after creation: C:\...\Test Projekt
   ```
   ✅ Kein Fehler! Erfolgreich erstellt!

### Schritt 6: Neues Projekt löschen

1. Löschen Sie "Test Projekt" wieder
2. **Erwartete Logs:**
   ```
   [IPC] project:delete C:\...\Test Projekt {}
   [IPC] currentProjectPath before delete: C:\...\Test Projekt
   [IPC] Closing currently open project before deletion
   [ProjectManager] Closing project: "C:\...\Test Projekt"
   [IPC] currentProjectPath reset to null
   [ProjectManager] Deleting project: "C:\...\Test Projekt"
   [ProjectManager] Removing lock before deletion...
   [ProjectManager] Project deleted successfully
   [IPC] Delete result: { success: true }
   ```
   ✅ Erfolgreich gelöscht!

## Was Sie sehen sollten

### ✅ Erfolgreicher Ablauf

```
Terminal-Logs zeigen:
1. "Set currentProjectPath after creation"
2. "Closing currently open project before deletion"
3. "currentProjectPath reset to null"
4. "Removing lock before deletion"
5. "Project deleted successfully"

→ Alles funktioniert!
```

### ❌ Wenn es immer noch fehlschlägt

**Szenario A: Lock wird nicht entfernt**

```
Logs zeigen:
[ProjectManager] Deleting project: "..."
[ProjectManager] Removing lock before deletion...
[ProjectManager] Error deleting project: ...

→ Problem mit Lock-Entfernung
```

**Lösung:** Manuell `.lock` Datei löschen:
```powershell
cd "C:\Users\jacqu\OneDrive\Desktop\Wind and Lightning Projekts\com.lveditor.draft\Test Projekt"
del .lock
```

**Szenario B: currentProjectPath wird nicht gesetzt**

```
Logs zeigen:
[IPC] project:create ...
# ABER KEIN: "Set currentProjectPath after creation"

→ result.projectPath ist undefined
```

**Lösung:** Prüfen Sie `projectManager.createProject` Return-Value.

**Szenario C: currentProjectPath stimmt nicht überein**

```
Logs zeigen:
[IPC] currentProjectPath before delete: C:\...\Test Projekt
# ABER: currentProjectPath === projectPath ist FALSE

→ Pfad-Vergleich schlägt fehl (möglicherweise Backslash vs Forward-Slash)
```

**Lösung:** Pfad-Normalisierung hinzufügen.

## Manuelle Bereinigung (Falls nötig)

Falls das Problem weiterhin besteht, können Sie manuell bereinigen:

### 1. Alle Locks entfernen

```powershell
# PowerShell-Script zum Entfernen aller .lock Dateien
cd "C:\Users\jacqu\OneDrive\Desktop\Wind and Lightning Projekts\com.lveditor.draft"

Get-ChildItem -Recurse -Filter ".lock" | Remove-Item -Force

Write-Host "Alle Locks entfernt" -ForegroundColor Green
```

### 2. App komplett neu starten

```powershell
# Alle Electron-Prozesse beenden
Get-Process | Where-Object {$_.ProcessName -match "electron"} | Stop-Process -Force

# Neu starten
npm start
```

### 3. Projekt-Ordner manuell löschen

```powershell
# Wenn Löschen fehlschlägt, manuell löschen:
Remove-Item -Path "C:\Users\jacqu\OneDrive\Desktop\Wind and Lightning Projekts\com.lveditor.draft\Test Projekt" -Recurse -Force
```

## Geänderte Dateien (Update)

1. ✅ `electron/main.cjs`
   - `project:create`: Setzt `currentProjectPath` sofort
   - `project:delete`: Erweiterte Debug-Logs

2. ✅ `electron/projectManager.cjs`
   - `deleteProject()`: Erkennt eigene Locks (bereits implementiert)
   - `checkLock()`: Intelligente Stale-Detection (bereits implementiert)

## Bitte testen Sie jetzt

1. **Terminal öffnen** und Logs beobachten
2. **App starten**: `npm start`
3. **Projekt erstellen** "Test Delete 123"
4. **Logs prüfen**: Sehen Sie "Set currentProjectPath"?
5. **Projekt löschen**
6. **Logs prüfen**: Sehen Sie "Closing currently open project"?
7. **Neues Projekt erstellen** "Test Delete 123"
8. **Funktioniert es?** ✅

## Wenn es IMMER NOCH nicht funktioniert

Bitte kopieren Sie die **kompletten Terminal-Logs** vom Erstellen bis zum Löschen und teilen Sie diese mit mir. Dann kann ich das exakte Problem identifizieren.

Besonders wichtig sind diese Zeilen:
- `[IPC] project:create ...`
- `[IPC] Set currentProjectPath after creation: ...`
- `[IPC] project:delete ...`
- `[IPC] currentProjectPath before delete: ...`
- `[ProjectManager] Deleting project: ...`
- `[IPC] Delete result: ...`

---

**Status:** ✅ ERWEITERTE FIXES IMPLEMENTIERT
**Datum:** 2026-01-19
**Next Step:** Testing mit Debug-Logs
