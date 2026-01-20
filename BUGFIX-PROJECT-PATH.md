# 🐛 Bugfix: Projekt konnte nicht geöffnet werden nach Erstellung

## Problem

Beim Erstellen eines neuen Projekts erschien die Fehlermeldung:

```
Projekt konnte nicht geöffnet werden: ENOENT: no such file or directory, access
'C:\Users\jacqu\OneDrive\Desktop\Wind and Lightning\4bfaac04-3677-493c-be29-f95ff239ff35'
```

**Ursache:**
- Das System versuchte, das Projekt im falschen Verzeichnis zu öffnen
- Es suchte in `Wind and Lightning\{UUID}` 
- Korrekt wäre: `Wind and Lightning Projekts\com.lveditor.draft\{Projektname}`

## Root Cause

Das Problem lag in der Timing-Logik im Dashboard:

1. **Alter Code** (`src/components/Dashboard.jsx` Zeile 104-109):
```javascript
// Handler: Projekt erstellen (aus Modal)
const handleCreateProject = async (projectData) => {
    const newId = await create(projectData);
    modal.close();
    
    // Versuche Projekt aus Liste zu laden
    const project = getById(newId);  // ❌ PROBLEM: Projekt noch nicht geladen!
    if (project && project.path) {
        onOpenProject(project.path);
    } else {
        onOpenProject(newId);
    }
};
```

**Warum war das ein Problem?**

In `useProjects.js` (Zeile 126):
```javascript
const create = async (projectData) => {
    // ... erstelle Projekt
    const updated = [newProject, ...projects];
    saveProjects(updated);
    
    // Reload von File System passiert erst nach 500ms
    setTimeout(() => reload(), 500);  // ⏰ VERZÖGERUNG!
    
    return newProject.id;
};
```

→ `getById(newId)` wurde aufgerufen **BEVOR** das Projekt geladen war!
→ Daher war `project.path` undefined
→ Fallback verwendete `newId` (UUID) statt des echten Pfads

## Lösung

**Neuer Code** (`src/components/Dashboard.jsx`):
```javascript
// Handler: Projekt erstellen (aus Modal)
const handleCreateProject = async (projectData) => {
    const newId = await create(projectData);
    modal.close();
    
    // Verwende projectData.path DIREKT (vom Modal übergeben)
    // Nicht getById() verwenden, da Projekt noch nicht in Liste geladen ist
    if (projectData.path || projectData.projectPath) {
        onOpenProject(projectData.path || projectData.projectPath);  // ✅ DIREKT
    } else {
        onOpenProject(newId);
    }
};
```

**Warum funktioniert das jetzt?**

1. `NewProjectModal.jsx` ruft `projectAPI.create()` auf
2. Electron erstellt Projektordner und gibt `projectPath` zurück
3. Modal ruft `onCreate({ path: result.projectPath })` auf
4. Dashboard verwendet **direkt** `projectData.path` → korrekt!

## Geänderte Dateien

- ✅ `src/components/Dashboard.jsx` (Zeile 87-110)

## Testing

**Vor dem Fix:**
```
❌ Fehler: ENOENT: no such file or directory
   Pfad: C:\...\Wind and Lightning\{UUID}
```

**Nach dem Fix:**
```
✅ Projekt wird korrekt geöffnet
   Pfad: C:\...\Wind and Lightning Projekts\com.lveditor.draft\{Projektname}
```

## Test-Schritte

1. Starten Sie die Anwendung: `npm start`
2. Klicken Sie auf "Neues Projekt erstellen"
3. Geben Sie einen Namen ein (z.B. "Mein Test Projekt")
4. Klicken Sie auf "Erstellen"
5. **Erwartetes Ergebnis:** Editor öffnet sich direkt mit dem neuen Projekt
6. **Keine Fehlermeldung mehr!**

## Zusätzliche Verbesserungen (optional)

Falls Sie weitere Timing-Probleme vermeiden möchten, können Sie in `useProjects.js` die Reload-Logik verbessern:

```javascript
const create = async (projectData) => {
    const newProject = {
        id: projectData.id || generateId('proj'),
        // ... rest
    };
    
    const updated = [newProject, ...projects];
    saveProjects(updated);
    
    // Option 1: Reload mit await (synchron)
    await reload();
    
    // Option 2: Keine Verzögerung
    // setTimeout(() => reload(), 500);  // ❌ Entfernen
    
    return newProject.id;
};
```

Aber für jetzt ist die aktuelle Lösung ausreichend und stabil! ✅

---

**Status:** ✅ FIXED
**Datum:** 2026-01-19
**Betrifft:** Projekt-Erstellung und -Öffnung
