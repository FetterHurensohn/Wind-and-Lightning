# 🪝 Hooks Dokumentation

> Alle Custom React Hooks in diesem Projekt.

---

## useProjects

**Datei:** `/app/src/hooks/useProjects.js`

**Zweck:** Projekt-CRUD-Operationen

### API
```javascript
const {
  projects,      // Array aller Projekte
  loading,       // Boolean - Lädt gerade
  create,        // (projectData) => Promise<projectId>
  update,        // (projectId, updates) => Promise<void>
  delete,        // (projectIds) => Promise<void>
  duplicate,     // (projectId) => Promise<newProjectId>
  getById        // (projectId) => Project | undefined
} = useProjects();
```

### Verwendung
```jsx
import { useProjects } from '../hooks/useProjects';

function MyComponent() {
  const { projects, create, loading } = useProjects();
  
  const handleCreate = async () => {
    const newId = await create({
      name: 'Neues Projekt',
      resolution: '1920x1080',
      fps: 30
    });
  };
  
  if (loading) return <div>Lädt...</div>;
  
  return (
    <div>
      {projects.map(p => <div key={p.id}>{p.name}</div>)}
    </div>
  );
}
```

---

## useModal

**Datei:** `/app/src/hooks/useModal.js`

**Zweck:** Modal-State-Management

### API
```javascript
const {
  activeModal,   // String | null - Aktuelles Modal
  isOpen,        // (modalName) => Boolean
  open,          // (modalName) => void
  close,         // () => void
  toggle         // (modalName) => void
} = useModal();
```

### Verwendung
```jsx
import { useModal } from '../hooks/useModal';

function MyComponent() {
  const modal = useModal();
  
  return (
    <>
      <button onClick={() => modal.open('settings')}>
        Einstellungen
      </button>
      
      {modal.isOpen('settings') && (
        <SettingsModal onClose={modal.close} />
      )}
    </>
  );
}
```

---

## useToast

**Datei:** `/app/src/hooks/useToast.js`

**Zweck:** Toast-Notifications

### API
```javascript
const {
  toasts,        // Array aktiver Toasts
  show,          // (message, type, duration) => void
  dismiss        // (toastId) => void
} = useToast();
```

### Types
- `'success'` - Grün, Erfolg
- `'error'` - Rot, Fehler
- `'info'` - Blau, Information
- `'warning'` - Gelb, Warnung

### Verwendung
```jsx
import { useToast } from '../hooks/useToast';

function MyComponent() {
  const toast = useToast();
  
  const handleSave = () => {
    try {
      // ... speichern
      toast.show('Erfolgreich gespeichert', 'success', 3000);
    } catch (error) {
      toast.show('Fehler beim Speichern', 'error', 5000);
    }
  };
}
```

---

## useUndoRedo

**Datei:** `/app/src/hooks/useUndoRedo.js`

**Zweck:** Undo/Redo History Management

### API
```javascript
const {
  state,         // Aktueller State
  setState,      // (newState) => void - Fügt zur History hinzu
  undo,          // () => void
  redo,          // () => void
  canUndo,       // Boolean
  canRedo,       // Boolean
  clear          // () => void - History leeren
} = useUndoRedo(initialState);
```

### Verwendung
```jsx
import { useUndoRedo } from '../hooks/useUndoRedo';

function MyComponent() {
  const { state, setState, undo, redo, canUndo, canRedo } = useUndoRedo({
    clips: [],
    selectedClip: null
  });
  
  const handleAddClip = (clip) => {
    setState({
      ...state,
      clips: [...state.clips, clip]
    });
  };
  
  return (
    <>
      <button onClick={undo} disabled={!canUndo}>Undo</button>
      <button onClick={redo} disabled={!canRedo}>Redo</button>
    </>
  );
}
```

---

## useTimelineZoom

**Datei:** `/app/src/hooks/useTimelineZoom.js`

**Zweck:** Timeline Zoom-Level Management

### API
```javascript
const {
  zoom,          // Number - Aktueller Zoom (0.1 - 10)
  setZoom,       // (level) => void
  zoomIn,        // () => void
  zoomOut,       // () => void
  fitToView      // () => void - Passt Zoom an Content an
} = useTimelineZoom();
```

---

## usePlayhead

**Datei:** `/app/src/hooks/usePlayhead.js`

**Zweck:** Playhead-Position und Playback-State

### API
```javascript
const {
  position,      // Number - Aktuelle Position in Sekunden
  isPlaying,     // Boolean
  setPosition,   // (seconds) => void
  play,          // () => void
  pause,         // () => void
  toggle,        // () => void
  seekForward,   // (seconds) => void
  seekBackward   // (seconds) => void
} = usePlayhead();
```

---

## useSnap

**Datei:** `/app/src/hooks/useSnap.js`

**Zweck:** Snapping für Timeline-Elemente

### API
```javascript
const {
  snapEnabled,   // Boolean
  snapPoints,    // Array von Snap-Positionen
  toggleSnap,    // () => void
  getSnapPoint,  // (position, threshold) => Number | null
  addSnapPoint,  // (position) => void
  removeSnapPoint // (position) => void
} = useSnap();
```

---

## useClipboard

**Datei:** `/app/src/hooks/useClipboard.js`

**Zweck:** Copy/Paste für Clips

### API
```javascript
const {
  clipboard,     // Kopierte Daten
  copy,          // (data) => void
  paste,         // () => data
  cut,           // (data) => void
  hasData        // Boolean
} = useClipboard();
```

---

## useMultiSelect

**Datei:** `/app/src/hooks/useMultiSelect.js`

**Zweck:** Mehrfachauswahl von Elementen

### API
```javascript
const {
  selected,      // Set von IDs
  isSelected,    // (id) => Boolean
  select,        // (id) => void
  deselect,      // (id) => void
  toggle,        // (id) => void
  selectAll,     // (ids) => void
  deselectAll,   // () => void
  selectRange    // (fromId, toId) => void
} = useMultiSelect();
```

---

## useDrag

**Datei:** `/app/src/hooks/useDrag.js`

**Zweck:** Drag & Drop Funktionalität

### API
```javascript
const {
  isDragging,    // Boolean
  dragData,      // Aktuell gedraggtes Element
  startDrag,     // (data) => void
  endDrag,       // () => void
  getDragProps   // () => Props für draggable Element
} = useDrag();
```

---

## Hook-Erstellung Pattern

```javascript
// /app/src/hooks/useNeuerHook.js

import { useState, useCallback, useEffect } from 'react';

export function useNeuerHook(initialValue) {
  const [value, setValue] = useState(initialValue);
  
  const doSomething = useCallback(() => {
    // Logik hier
  }, [/* dependencies */]);
  
  useEffect(() => {
    // Side effects hier
    return () => {
      // Cleanup
    };
  }, [/* dependencies */]);
  
  return {
    value,
    setValue,
    doSomething
  };
}

export default useNeuerHook;
```
