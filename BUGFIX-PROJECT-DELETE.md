# 🐛 Bugfix: Gelöschte Projekte erscheinen nach Neustart wieder

## Problem

Wenn ein Projekt im Dashboard gelöscht wurde und die App geschlossen und wieder geöffnet wurde, erschien das Projekt wieder in der Liste.

**Ursache:**
- Die Delete-Funktion löschte Projekte nur aus der lokalen Liste (localStorage)
- Beim Neustart lädt die App alle Projekte aus dem **Dateisystem**
- Das "gelöschte" Projekt existierte noch im Dateisystem
- → Projekt erschien wieder in der Liste

## Lösung

Implementiere vollständiges Löschen mit Dateisystem-Integration:

### 1. ProjectManager: `deleteProject()` Funktion

**Datei:** `electron/projectManager.cjs`

```javascript
async function deleteProject(projectPath) {
  console.log(`[ProjectManager] Deleting project: "${projectPath}"`);
  
  try {
    // 1. Prüfe ob Projekt existiert
    await fs.access(projectPath);
    
    // 2. Prüfe Lock - Projekt darf nicht geöffnet sein
    const lockStatus = await checkLock(projectPath);
    if (lockStatus.exists) {
      return {
        success: false,
        error: 'Projekt ist noch geöffnet. Bitte schließen Sie es zuerst.',
        locked: true
      };
    }
    
    // 3. Lösche Projekt-Ordner rekursiv
    await fs.rm(projectPath, { recursive: true, force: true });
    
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
```

**Features:**
- ✅ Prüft ob Projekt existiert
- ✅ Verhindert Löschen von geöffneten Projekten (Lock-Check)
- ✅ Löscht vollständigen Projekt-Ordner rekursiv
- ✅ Fehlerbehandlung

### 2. Electron IPC-Handler

**Datei:** `electron/main.cjs`

```javascript
ipcMain.handle('project:delete', async (event, projectPath) => {
  console.log('[IPC] project:delete', projectPath);
  try {
    return await projectManager.deleteProject(projectPath);
  } catch (error) {
    console.error('[IPC] Error deleting project:', error);
    return { success: false, error: error.message };
  }
});
```

### 3. Preload API

**Datei:** `electron/preload.js`

```javascript
projectAPI: {
  // ... andere Methoden
  delete: (projectPath) => ipcRenderer.invoke('project:delete', projectPath)
}
```

### 4. React Hook Update

**Datei:** `src/hooks/useProjects.js`

**Vorher:**
```javascript
// Delete projects (only removes from localStorage, does NOT delete folders)
const deleteProjects = async (projectIds) => {
  const updated = projects.filter(p => !projectIds.includes(p.id));
  saveProjects(updated);
  // Note: Actual folder deletion would need to be implemented in Electron main process
};
```

**Nachher:**
```javascript
// Delete projects (löscht tatsächlich aus dem Dateisystem)
const deleteProjects = async (projectIds) => {
  // Wenn Electron verfügbar, lösche aus Dateisystem
  if (window.electronAPI?.projectAPI?.delete) {
    for (const projectId of projectIds) {
      const project = projects.find(p => p.id === projectId);
      
      if (project && project.path) {
        console.log('[useProjects] Deleting project from filesystem:', project.path);
        
        const result = await window.electronAPI.projectAPI.delete(project.path);
        
        if (!result.success) {
          console.error('[useProjects] Failed to delete project:', result.error);
          alert(`Fehler beim Löschen: ${result.error}`);
          return;
        }
      }
    }
    
    // Reload von Dateisystem nach Löschen
    await loadProjects();
  } else {
    // Fallback: nur aus localStorage löschen
    const updated = projects.filter(p => !projectIds.includes(p.id));
    saveProjects(updated);
  }
};
```

## Geänderte Dateien

1. ✅ `electron/projectManager.cjs`
   - Neue Funktion: `deleteProject(projectPath)`
   - Export hinzugefügt

2. ✅ `electron/main.cjs`
   - Neuer IPC-Handler: `project:delete`

3. ✅ `electron/preload.js`
   - Neue API-Methode: `projectAPI.delete(projectPath)`

4. ✅ `src/hooks/useProjects.js`
   - `deleteProjects()` verwendet jetzt Electron API
   - Lädt Projekt-Liste nach Löschen neu

## Testing

### Test 1: Einzelnes Projekt löschen

1. Starten Sie die App: `npm start`
2. Erstellen Sie ein Test-Projekt: "Test Delete 1"
3. Klicken Sie auf das Projekt (rechte Maustaste oder Auswahl)
4. Klicken Sie auf "Löschen" oder drücken Sie `Delete`
5. Bestätigen Sie die Lösch-Bestätigung
6. **Erwartetes Ergebnis:** Projekt verschwindet aus der Liste
7. Schließen Sie die App
8. Öffnen Sie die App neu
9. **Erwartetes Ergebnis:** Projekt ist **nicht mehr** in der Liste ✅

### Test 2: Mehrere Projekte löschen

1. Erstellen Sie 3 Test-Projekte
2. Wählen Sie alle 3 aus (Ctrl+Click oder Shift+Click)
3. Drücken Sie `Delete`
4. Bestätigen Sie
5. **Erwartetes Ergebnis:** Alle 3 verschwinden
6. App neu starten
7. **Erwartetes Ergebnis:** Alle 3 sind weg ✅

### Test 3: Geöffnetes Projekt kann nicht gelöscht werden

1. Öffnen Sie ein Projekt im Editor
2. Gehen Sie zurück zum Dashboard (ohne zu schließen)
3. Versuchen Sie, dasselbe Projekt zu löschen
4. **Erwartetes Ergebnis:** 
   ```
   Fehler beim Löschen: Projekt ist noch geöffnet. 
   Bitte schließen Sie es zuerst.
   ```
5. Schließen Sie das Projekt
6. Löschen Sie es erneut
7. **Erwartetes Ergebnis:** Löschen erfolgreich ✅

### Test 4: Dateisystem-Überprüfung

**Vor dem Löschen:**
```powershell
# Projekt existiert
dir "C:\Users\jacqu\OneDrive\Desktop\Wind and Lightning Projekts\com.lveditor.draft\Test Delete 1"
# Zeigt Ordner-Inhalt
```

**Nach dem Löschen:**
```powershell
# Projekt existiert NICHT mehr
dir "C:\Users\jacqu\OneDrive\Desktop\Wind and Lightning Projekts\com.lveditor.draft\Test Delete 1"
# Fehler: Pfad nicht gefunden ✅
```

## Sicherheitsmaßnahmen

Die Implementierung enthält folgende Sicherheitsmaßnahmen:

1. **Lock-Check:** Verhindert Löschen von geöffneten Projekten
2. **Existenz-Check:** Prüft ob Projekt existiert vor dem Löschen
3. **Fehlerbehandlung:** Zeigt Fehlermeldungen bei Problemen
4. **Bestätigungs-Dialog:** User muss Löschen bestätigen (bereits im Dashboard implementiert)

## Bekannte Einschränkungen

- **Keine Papierkorb-Integration:** Gelöschte Projekte werden **permanent** gelöscht
- **Keine Rückgängig-Funktion:** Gelöschte Projekte können nicht wiederhergestellt werden

## Zukünftige Verbesserungen (Optional)

1. **Papierkorb-Integration:**
   ```javascript
   // Statt fs.rm() verwenden:
   const { shell } = require('electron');
   await shell.trashItem(projectPath);  // Verschiebt in Papierkorb
   ```

2. **Backup vor Löschen:**
   ```javascript
   // Erstelle Backup-Zip vor dem Löschen
   const backupPath = path.join(os.tmpdir(), `${projectName}_backup.zip`);
   await createZip(projectPath, backupPath);
   ```

3. **Async-Löschen mit Progress:**
   ```javascript
   // Zeige Progress-Bar beim Löschen großer Projekte
   mainWindow.webContents.send('delete-progress', { percent: 50 });
   ```

---

**Status:** ✅ FIXED
**Datum:** 2026-01-19
**Betrifft:** Projekt-Löschen und Persistenz

## Zusammenfassung

**Vorher:**
- ❌ Löschen nur aus localStorage
- ❌ Projekt erscheint nach Neustart wieder

**Nachher:**
- ✅ Löschen aus Dateisystem
- ✅ Projekt bleibt gelöscht nach Neustart
- ✅ Lock-Check verhindert Löschen geöffneter Projekte
- ✅ Fehlerbehandlung und User-Feedback
