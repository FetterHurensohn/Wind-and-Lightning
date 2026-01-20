# UUID-basierte Projektstruktur - Dokumentation

## Übersicht

Diese Implementierung bietet ein vollständiges, UUID-basiertes Projektmanagementsystem für den Video-Editor. Das System ist inspiriert von modernen NLEs (Non-Linear Editors) und bietet robuste Funktionen für Asset-Verwaltung, Timeline-Versionierung, Proxy-Generierung und Migration.

## Architektur

```
┌─────────────────────────────────────────────────────┐
│                  Electron Main Process              │
├─────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐│
│  │   Project    │  │    Asset     │  │  Timeline  ││
│  │   Manager    │  │   Registry   │  │  Manager   ││
│  └──────────────┘  └──────────────┘  └────────────┘│
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐│
│  │    Cache     │  │    Proxy     │  │ Migration  ││
│  │   Manager    │  │  Generator   │  │  Service   ││
│  └──────────────┘  └──────────────┘  └────────────┘│
├─────────────────────────────────────────────────────┤
│                    IPC Communication                │
├─────────────────────────────────────────────────────┤
│                  Renderer Process                   │
│              (React + Redux + Hooks)                │
└─────────────────────────────────────────────────────┘
```

## Projektstruktur

```
<ProjektName>/
├─ project.json                  # Haupt-Manifest mit Metadaten
├─ .lock                         # Lock-Datei (verhindert Konflikte)
├─ settings.json                 # Editor-Einstellungen
├─ assets/
│  ├─ index.json                 # Asset-Registry (UUID → Metadaten)
│  ├─ media/
│  │  ├─ video/                  # Importierte Videos
│  │  │  └─ {uuid}.mp4
│  │  ├─ audio/                  # Importierte Audio-Dateien
│  │  │  └─ {uuid}.mp3
│  │  └─ images/                 # Importierte Bilder
│  │     └─ {uuid}.png
│  └─ proxies/                   # Proxy-Versionen (niedrige Auflösung)
│     ├─ {uuid}_720p.mp4
│     └─ {uuid}_1080p.mp4
├─ timeline/
│  ├─ timeline_v1.json           # Aktive Timeline
│  └─ history/                   # Versionsverlauf
│     ├─ timeline_2026-01-19T10-00-00.json
│     └─ timeline_2026-01-19T10-30-00.json
├─ cache/
│  ├─ thumbnails/                # Vorschaubilder
│  │  └─ {uuid}/
│  │     ├─ frame_0000.jpg
│  │     └─ frame_0030.jpg
│  ├─ waveforms/                 # Audio-Wellenformen
│  │  └─ {uuid}.json
│  └─ render_cache/              # Render-Cache für Effekte
├─ metadata/
│  ├─ markers.json               # Marker, Chapters, Comments
│  └─ color_grading/             # Color Grading Presets
└─ logs/
   ├─ autosave.log               # Auto-Save Historie
   └─ errors.log                 # Fehlerprotokoll
```

## Schnellstart

### 1. Neues Projekt erstellen

**PowerShell:**
```powershell
.\scripts\init-project.ps1 -ProjectName "MeinProjekt"
```

**Mit benutzerdefinierten Einstellungen:**
```powershell
.\scripts\init-project.ps1 -ProjectName "4K_Projekt" -Width 3840 -Height 2160 -FPS 60
```

**Electron API (aus Renderer):**
```javascript
const result = await window.electronAPI.projectAPI.create('MeinProjekt', {
  fps: 30,
  resolution: { width: 1920, height: 1080 },
  sampleRate: 48000
});

if (result.success) {
  console.log('Projekt erstellt:', result.projectPath);
  console.log('Projekt ID:', result.projectId);
}
```

### 2. Projekt öffnen

```javascript
const result = await window.electronAPI.projectAPI.open(projectPath);

if (result.success) {
  console.log('Projekt geladen:', result.manifest);
  
  // Lade Timeline
  const timelineResult = await window.electronAPI.timelineAPI.load(projectPath);
  if (timelineResult.success) {
    console.log('Timeline:', timelineResult.timeline);
  }
}

// Wenn Projekt gesperrt ist:
if (result.locked) {
  console.log('Projekt bereits geöffnet von:', result.lockInfo.user);
  
  // Optionen: Schreibgeschützt öffnen oder Lock überschreiben
  const readOnlyResult = await window.electronAPI.projectAPI.open(projectPath, {
    readOnly: true
  });
}
```

### 3. Asset importieren

```javascript
// Datei importieren mit Kopie
const result = await window.electronAPI.assetAPI.import(
  projectPath,
  'C:\\Videos\\clip.mp4',
  'copy',  // 'copy' | 'link' | 'move'
  {
    duration: 120.5,
    resolution: { w: 1920, h: 1080 },
    codec: 'H.264',
    fps: 30
  }
);

if (result.success) {
  console.log('Asset UUID:', result.uuid);
  console.log('Metadaten:', result.metadata);
  
  // Asset-Pfad auflösen
  const pathResult = await window.electronAPI.assetAPI.resolve(
    projectPath,
    result.uuid,
    false  // useProxy
  );
  
  console.log('Asset-Pfad:', pathResult.path);
}
```

### 4. Proxy generieren

```javascript
// Proxy-Generierung starten
const result = await window.electronAPI.proxyAPI.generate(
  projectPath,
  assetUuid,
  assetPath,
  '720p'  // '720p' | '1080p' | '480p'
);

if (result.success) {
  console.log('Proxy-Job gestartet:', result.jobId);
}

// Progress-Events lauschen
window.electronAPI.proxyAPI.onProgress((progress) => {
  console.log(`Progress: ${progress.progress}%`);
});

window.electronAPI.proxyAPI.onCompleted((job) => {
  console.log('Proxy fertig:', job.result.proxyPath);
});

window.electronAPI.proxyAPI.onFailed((job) => {
  console.error('Proxy-Fehler:', job.error);
});
```

### 5. Timeline speichern

```javascript
// Timeline-State aus Redux Store
const timelineState = {
  projectDuration: 120.5,
  tracks: [
    {
      id: 't2',
      name: 'Main Track',
      type: 'audio',
      clips: [
        {
          clip_id: 'clip_123',
          asset_uuid: 'abc-def-ghi',
          start: 0,
          duration: 10.5,
          in_point: 0,
          out_point: 10.5,
          transform: { x: 0, y: 0, scale: 1, rotation: 0 },
          opacity: 100,
          effects: [],
          transitions: {}
        }
      ],
      muted: false,
      locked: false,
      height: 80
    }
  ]
};

const result = await window.electronAPI.projectAPI.save(timelineState);

if (result.success) {
  console.log('Timeline gespeichert:', result.savedAt);
}
```

### 6. Timeline-Historie verwenden

```javascript
// Liste alle Versionen
const historyResult = await window.electronAPI.timelineAPI.listHistory(projectPath);

console.log('Verfügbare Versionen:', historyResult.history);
// [{ filename, timestamp, size, modifiedAt }, ...]

// Manuellen Snapshot erstellen
await window.electronAPI.timelineAPI.createSnapshot(
  projectPath,
  timelineState,
  'vor-großer-änderung'
);

// Rollback zu früherer Version
const rollbackResult = await window.electronAPI.timelineAPI.rollback(
  projectPath,
  'timeline_2026-01-19T10-30-00.json'
);

if (rollbackResult.success) {
  console.log('Rollback erfolgreich');
  // Lade neue Timeline
  const timeline = rollbackResult.timeline;
}
```

### 7. Cache-Verwaltung

```javascript
// Thumbnail holen (generiert automatisch wenn nicht im Cache)
const thumbResult = await window.electronAPI.cacheAPI.getThumbnail(
  projectPath,
  assetUuid,
  assetPath,
  5.0  // Zeit in Sekunden
);

if (thumbResult.success) {
  console.log('Thumbnail:', thumbResult.path);
  console.log('Aus Cache:', thumbResult.cached);
}

// Waveform holen
const waveResult = await window.electronAPI.cacheAPI.getWaveform(
  projectPath,
  assetUuid,
  assetPath
);

if (waveResult.success) {
  console.log('Waveform-Samples:', waveResult.data.samples);
}

// Cache-Größe prüfen
const sizeResult = await window.electronAPI.cacheAPI.calculateSize(projectPath);
console.log(`Cache-Größe: ${sizeResult.sizeMB} MB`);

// Cache leeren
await window.electronAPI.cacheAPI.clear(projectPath, 'thumbnails');  // oder 'waveforms', 'render', null (alles)
```

### 8. Migration alter Projekte

```javascript
// Scanne nach alten Projekten
const scanResult = await window.electronAPI.migrationAPI.scan();

console.log('Alte Projekte gefunden:', scanResult.projects);
// [{ name, path, modifiedAt, needsMigration }, ...]

// Einzelnes Projekt migrieren
const migrateResult = await window.electronAPI.migrationAPI.migrate(oldProjectPath);

if (migrateResult.success) {
  console.log('Migriert nach:', migrateResult.newProjectPath);
  console.log('Backup:', migrateResult.report.backupPath);
}

// Batch-Migration
window.electronAPI.migrationAPI.onProgress((progress) => {
  console.log(`${progress.current}/${progress.total}: ${progress.currentProject}`);
});

const batchResult = await window.electronAPI.migrationAPI.batchMigrate([
  'C:\\Projects\\OldProject1',
  'C:\\Projects\\OldProject2'
]);

console.log(`Erfolgreich: ${batchResult.successful}/${batchResult.total}`);
```

## API-Referenz

### projectAPI

| Methode | Parameter | Rückgabe | Beschreibung |
|---------|-----------|----------|--------------|
| `create(name, options)` | name: string, options: {fps, resolution, sampleRate} | {success, projectPath, projectId, manifest} | Erstellt neues Projekt |
| `open(projectPath, options)` | projectPath: string, options: {readOnly, force} | {success, manifest, readOnly, integrityIssues} | Öffnet Projekt |
| `close()` | - | {success} | Schließt aktuelles Projekt |
| `save(state)` | state: TimelineState | {success, savedAt} | Speichert Timeline |
| `listAll()` | - | {success, projects[]} | Listet alle Projekte |
| `checkLock(projectPath)` | projectPath: string | {exists, user, hostname, openedAt} | Prüft Lock-Status |

### assetAPI

| Methode | Parameter | Rückgabe | Beschreibung |
|---------|-----------|----------|--------------|
| `import(projectPath, filePath, copyMode, metadata)` | - | {success, uuid, metadata} | Importiert Asset |
| `update(projectPath, uuid, updates)` | - | {success, metadata} | Aktualisiert Asset-Metadaten |
| `remove(projectPath, uuid, deleteFile)` | - | {success} | Entfernt Asset |
| `resolve(projectPath, uuid, useProxy)` | - | {success, path, isProxy, metadata} | Löst Asset-Pfad auf |
| `list(projectPath, filter)` | filter: {type, storage, proxyAvailable} | {success, assets[]} | Listet Assets |
| `findOffline(projectPath)` | - | {success, offlineAssets[]} | Findet nicht erreichbare Assets |

### timelineAPI

| Methode | Parameter | Rückgabe | Beschreibung |
|---------|-----------|----------|--------------|
| `load(projectPath, version)` | version: string (optional) | {success, timeline} | Lädt Timeline |
| `createSnapshot(projectPath, data, label)` | label: string (optional) | {success, filename} | Erstellt Snapshot |
| `listHistory(projectPath)` | - | {success, history[]} | Listet Versionen |
| `rollback(projectPath, filename)` | filename: string | {success, timeline} | Rollback zu Version |

### cacheAPI

| Methode | Parameter | Rückgabe | Beschreibung |
|---------|-----------|----------|--------------|
| `getThumbnail(projectPath, uuid, path, time)` | time: number (seconds) | {success, path, cached} | Holt/Generiert Thumbnail |
| `getWaveform(projectPath, uuid, path)` | - | {success, path, data, cached} | Holt/Generiert Waveform |
| `calculateSize(projectPath)` | - | {success, size, sizeMB, sizeGB} | Berechnet Cache-Größe |
| `clear(projectPath, type)` | type: 'thumbnails' | 'waveforms' | 'render' | null | {success, deletedCount} | Löscht Cache |

### proxyAPI

| Methode | Parameter | Rückgabe | Beschreibung |
|---------|-----------|----------|--------------|
| `generate(projectPath, uuid, path, profile)` | profile: '720p' | '1080p' | '480p' | {success, jobId} | Startet Proxy-Generierung |
| `checkStatus(projectPath, uuid)` | - | {success, available, path} | Prüft Proxy-Status |
| `delete(projectPath, uuid)` | - | {success} | Löscht Proxy |
| `getQueue()` | - | {success, queue[]} | Holt Proxy-Queue |
| `onProgress(callback)` | callback: (progress) => void | - | Progress-Event |
| `onCompleted(callback)` | callback: (job) => void | - | Completion-Event |
| `onFailed(callback)` | callback: (job) => void | - | Failure-Event |

### migrationAPI

| Methode | Parameter | Rückgabe | Beschreibung |
|---------|-----------|----------|--------------|
| `scan()` | - | {success, projects[]} | Scannt alte Projekte |
| `migrate(projectPath)` | projectPath: string | {success, newProjectPath, report} | Migriert Projekt |
| `batchMigrate(paths)` | paths: string[] | {success, total, successful, failed, results} | Batch-Migration |
| `onProgress(callback)` | callback: (progress) => void | - | Progress-Event |

## Best Practices

### 1. OneDrive Hinweise

Wenn Projekte in OneDrive liegen:
- ✅ `cache/` von Synchronisation ausschließen
- ✅ Große Media-Dateien extern verlinken (`copyMode: 'link'`)
- ✅ Regelmäßig Cache leeren
- ⚠️ Lock-Dateien können zu Konflikten führen

### 2. Asset-Verwaltung

```javascript
// Empfohlen: Externe Media verlinken
await assetAPI.import(projectPath, externalPath, 'link', metadata);

// Für kleine Projekte: Kopieren
await assetAPI.import(projectPath, filePath, 'copy', metadata);

// Prüfe regelmäßig auf Offline-Assets
const offline = await assetAPI.findOffline(projectPath);
if (offline.offlineAssets.length > 0) {
  // Zeige UI für Re-linking
}
```

### 3. Timeline-Versionierung

```javascript
// Vor großen Änderungen: Snapshot
await timelineAPI.createSnapshot(projectPath, timelineState, 'vor-effekt-chain');

// Auto-Save alle 5 Minuten
setInterval(async () => {
  await projectAPI.save(timelineState);
}, 5 * 60 * 1000);
```

### 4. Proxy-Workflow

```javascript
// Importiere Asset
const asset = await assetAPI.import(projectPath, videoPath, 'copy', metadata);

// Generiere Proxy automatisch
await proxyAPI.generate(projectPath, asset.uuid, asset.metadata.local_path, '720p');

// Bei Playback: Verwende Proxy
const path = await assetAPI.resolve(projectPath, asset.uuid, true);  // useProxy: true
```

## Troubleshooting

### Problem: Projekt kann nicht geöffnet werden (Lock-Fehler)

**Lösung:**
```javascript
// Prüfe Lock
const lockInfo = await projectAPI.checkLock(projectPath);
if (lockInfo.exists) {
  console.log(`Geöffnet von ${lockInfo.user} auf ${lockInfo.hostname}`);
  
  // Option 1: Schreibgeschützt öffnen
  await projectAPI.open(projectPath, { readOnly: true });
  
  // Option 2: Lock überschreiben (mit Warnung!)
  await projectAPI.open(projectPath, { force: true });
}
```

### Problem: Assets offline (Dateien nicht gefunden)

**Lösung:**
```javascript
const offline = await assetAPI.findOffline(projectPath);

for (const asset of offline.offlineAssets) {
  // Zeige UI für Re-linking
  const newPath = await showRelinkDialog(asset.original_path);
  
  if (newPath) {
    // Re-import
    const newAsset = await assetAPI.import(projectPath, newPath, 'link');
    
    // Update Timeline-Referenzen
    // ... (replace asset.uuid with newAsset.uuid)
  }
}
```

### Problem: Cache zu groß

**Lösung:**
```javascript
const size = await cacheAPI.calculateSize(projectPath);

if (parseFloat(size.sizeGB) > 5.0) {
  // Lösche alte Thumbnails
  await cacheAPI.clear(projectPath, 'thumbnails');
  
  // Oder: Alles löschen
  await cacheAPI.clear(projectPath, null);
}
```

## Migration Guide

Siehe separate Datei: [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)

## Entwicklung

### Tests ausführen

```bash
npm test
```

### Linter

```bash
npm run lint
```

### Build

```bash
npm run build
npm run electron:build
```

## Lizenz

MIT

## Support

Bei Fragen oder Problemen: Siehe [GitHub Issues](https://github.com/yourrepo/issues)
