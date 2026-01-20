# Projekt-Speicherungssystem - Test-Anleitung

## Implementierte Features

✅ **Vollständiges Projekt-Speicherungssystem** wurde erfolgreich implementiert!

### Was wurde implementiert:

1. **EditorLayout: Vollständiges Timeline-Laden**
   - Lädt alle Timeline-Felder beim Projekt-Öffnen
   - Felder: `tracks`, `projectDuration`, `selectedClipId`, `snapping`, `rippleMode`, `trackControls`, `zoom`, `scrollPosition`, `playheadPosition`

2. **EditorLayout: Vollständige State-Speicherung**
   - Speichert alle Timeline-Felder beim Klick auf "Speichern"
   - Verwendet `timelineAPI.save()` mit vollständigem State

3. **Media-Synchronisation**
   - Lädt Assets aus `assets/index.json`
   - Konvertiert Assets zu Media-Format für die Medienbibliothek
   - Synchronisiert Asset-UUIDs mit Clips

4. **Auto-Save**
   - Speichert automatisch alle 5 Minuten
   - Erstellt keine History-Snapshots bei Auto-Save (Performance)

5. **IPC-Handler**
   - `timeline:save` Handler in `electron/main.cjs` hinzugefügt
   - `timelineAPI.save()` in `electron/preload.js` exportiert

## Projektstruktur

Projekte werden erstellt unter:
```
C:\Users\jacqu\OneDrive\Desktop\Wind and Lightning Projekts\com.lveditor.draft\{Projektname}\
├── project.json              # Projekt-Manifest (Metadaten, IDs)
├── settings.json             # Projekt-Einstellungen
├── .lock                     # Lock-Datei (verhindert paralleles Öffnen)
├── assets/
│   ├── index.json           # Asset-Registry (UUID-basiert)
│   ├── media/               # Importierte Medien
│   │   ├── video/
│   │   ├── audio/
│   │   └── images/
│   └── proxies/             # Proxy-Dateien
├── timeline/
│   ├── timeline_v1.json     # Aktive Timeline
│   └── history/             # Timeline-Snapshots (Auto-Save)
├── cache/
│   ├── thumbnails/
│   ├── waveforms/
│   └── render_cache/
├── metadata/
│   ├── markers.json         # Timeline-Marker
│   └── color_grading/
└── logs/
    ├── autosave.log
    └── errors.log
```

## Test-Checkliste

### Test 1: Neues Projekt erstellen ✅

1. Starten Sie die Anwendung mit `npm start`
2. Klicken Sie auf "Neues Projekt erstellen"
3. Geben Sie einen Projektnamen ein (z.B. "Test Projekt 1")
4. Wählen Sie Resolution (z.B. "1080p") und FPS (z.B. "30")
5. Klicken Sie auf "Erstellen"

**Erwartetes Ergebnis:**
- Projektordner wird erstellt unter `Wind and Lightning Projekts\com.lveditor.draft\Test Projekt 1\`
- Alle Unterordner existieren (assets, timeline, cache, metadata, logs)
- Dateien existieren: `project.json`, `timeline_v1.json`, `assets/index.json`, `settings.json`
- Editor öffnet sich mit leerem Projekt

**Überprüfung:**
```powershell
# Im Terminal ausführen:
cd "C:\Users\jacqu\OneDrive\Desktop\Wind and Lightning Projekts\com.lveditor.draft\Test Projekt 1"
dir
dir assets
dir timeline
type project.json
```

---

### Test 2: Ressourcen importieren 📁

1. Öffnen Sie ein Projekt
2. Klicken Sie auf "Medien hinzufügen" in der linken Medienbibliothek
3. Wählen Sie eine Video-, Audio- oder Bilddatei aus
4. Warten Sie, bis der Import abgeschlossen ist

**Erwartetes Ergebnis:**
- Datei wird nach `assets/media/{type}/` kopiert (z.B. `assets/media/video/`)
- UUID wird in `assets/index.json` hinzugefügt
- Asset erscheint in der Medienbibliothek im Editor
- Thumbnail wird generiert (falls Video/Bild)

**Überprüfung:**
```powershell
# Prüfe ob Asset kopiert wurde:
dir "assets\media\video"
dir "assets\media\audio"
dir "assets\media\images"

# Prüfe Asset-Registry:
type assets\index.json
```

---

### Test 3: Video-Track bearbeiten 🎬

1. Ziehen Sie ein Asset aus der Medienbibliothek auf den Timeline (Main Track)
2. Ziehen Sie weitere Assets hinzu
3. Verschieben Sie Clips innerhalb des Main Tracks
4. Erstellen Sie neue Tracks durch Ziehen über/unter den Main Track
5. Verschieben Sie Clips zwischen Tracks

**Erwartetes Ergebnis:**
- Clips erscheinen auf der Timeline
- Main Track ist gapless (keine Lücken)
- Andere Tracks erlauben freie Positionierung
- Clips können zwischen Tracks verschoben werden
- State wird im Reducer aktualisiert

**Überprüfung:**
- Öffnen Sie die Browser-Konsole (F12)
- State-Änderungen werden geloggt
- Clips haben korrekte Positionen und Track-IDs

---

### Test 4: Projekt speichern 💾

1. Bearbeiten Sie das Projekt (fügen Sie Clips hinzu, verschieben Sie sie)
2. Klicken Sie auf "Speichern" in der Top-Toolbar
3. Warten Sie auf Bestätigung

**Erwartetes Ergebnis:**
- Konsole zeigt: `[EditorLayout] Project saved successfully`
- `timeline_v1.json` wird aktualisiert
- `timeline/history/` enthält einen neuen Snapshot (Dateiname: `timeline_YYYY-MM-DDTHH-MM-SS.json`)
- `project.json` hat aktualisiertes `last_saved_at` Feld
- Keine Fehlermeldungen

**Überprüfung:**
```powershell
# Prüfe Timeline:
type timeline\timeline_v1.json

# Prüfe History:
dir timeline\history

# Prüfe letztes Speicherdatum:
type project.json | Select-String "last_saved_at"
```

**Inhalt von `timeline_v1.json` sollte enthalten:**
```json
{
  "version": "1.0.0",
  "saved_at": "2026-01-19T...",
  "duration": 123.45,
  "tracks": [
    {
      "id": "t2",
      "name": "Main Track",
      "type": "audio",
      "clips": [
        {
          "id": "clip_...",
          "assetId": "uuid-...",
          "start": 0,
          "duration": 10,
          ...
        }
      ]
    }
  ],
  "selectedClipId": null,
  "snapping": true,
  "rippleMode": false,
  "trackControls": {...},
  "zoom": 1,
  "scrollPosition": 0,
  "playheadPosition": 0
}
```

---

### Test 5: Projekt schließen und öffnen 🔄

1. Klicken Sie auf "Speichern und Beenden"
2. Sie gelangen zurück zum Dashboard
3. Klicken Sie auf das gespeicherte Projekt, um es zu öffnen

**Erwartetes Ergebnis:**
- Projekt öffnet sich mit allen vorherigen Inhalten
- **Alle Clips sind an der richtigen Position**
- **Alle importierten Medien sind in der Medienbibliothek vorhanden**
- **Zoom-Level ist wiederhergestellt**
- **Scroll-Position ist wiederhergestellt**
- **Playhead-Position ist wiederhergestellt**
- Track-Controls (Mute, Solo, Lock) sind wiederhergestellt
- Snapping und Ripple-Mode sind wiederhergestellt

**Überprüfung:**
- Öffnen Sie die Browser-Konsole (F12)
- Konsole sollte zeigen:
  ```
  [EditorLayout] Opening project: C:\...\Test Projekt 1
  [EditorLayout] Loaded X media items
  [EditorLayout] Auto-save enabled (5 minutes interval)
  ```
- Prüfen Sie visuell:
  - ✅ Clips sind sichtbar
  - ✅ Medienbibliothek enthält alle Assets
  - ✅ Playhead ist an der gespeicherten Position

---

### Test 6: Auto-Save 🕐

1. Öffnen Sie ein Projekt
2. Bearbeiten Sie die Timeline (fügen Sie Clips hinzu)
3. Warten Sie 5 Minuten (oder ändern Sie den Interval in `EditorLayout.jsx` zu 30 Sekunden für schnelleren Test)
4. Beobachten Sie die Konsole

**Erwartetes Ergebnis:**
- Nach 5 Minuten erscheint in der Konsole:
  ```
  [EditorLayout] Auto-saving...
  [TimelineManager] Saving timeline...
  [TimelineManager] Timeline saved (atomic)
  ```
- `logs/autosave.log` enthält Einträge:
  ```
  2026-01-19T15:30:00.000Z - Auto-save successful
  2026-01-19T15:35:00.000Z - Auto-save successful
  ```
- **KEINE** neuen Snapshots in `timeline/history/` (Auto-Save erstellt keine History)
- `timeline_v1.json` wird aktualisiert

**Überprüfung:**
```powershell
# Prüfe Auto-Save Log:
type logs\autosave.log

# Prüfe Anzahl der History-Snapshots (sollte nicht wachsen):
dir timeline\history | measure
```

**Für schnelleren Test:**
Ändern Sie in `src/components/editor/EditorLayout.jsx` Zeile ~565:
```javascript
// Von:
}, 5 * 60 * 1000); // 5 Minuten

// Zu:
}, 30 * 1000); // 30 Sekunden (NUR FÜR TEST!)
```

---

### Test 7: Lock-System 🔒

1. Öffnen Sie ein Projekt
2. Öffnen Sie eine zweite Instanz der Anwendung
3. Versuchen Sie, dasselbe Projekt zu öffnen

**Erwartetes Ergebnis:**
- Alert-Meldung erscheint:
  ```
  Projekt ist bereits geöffnet von {User} auf {Hostname}
  ```
- Projekt öffnet sich NICHT
- Sie werden zurück zum Dashboard weitergeleitet

**Überprüfung:**
```powershell
# Prüfe Lock-Datei:
type .lock

# Sollte enthalten:
# {
#   "user": "jacqu",
#   "hostname": "...",
#   "pid": 12345,
#   "openedAt": "2026-01-19T..."
# }
```

---

### Test 8: Mehrere Projekte 📊

1. Erstellen Sie 3-5 verschiedene Projekte
2. Fügen Sie in jedem Projekt unterschiedliche Medien hinzu
3. Bearbeiten Sie die Timelines unterschiedlich
4. Speichern Sie alle Projekte
5. Navigieren Sie zurück zum Dashboard

**Erwartetes Ergebnis:**
- Dashboard zeigt alle Projekte in einer Liste/Grid
- Jedes Projekt zeigt:
  - Name
  - Erstellungsdatum
  - Letztes Speicherdatum
  - Resolution (z.B. "1920x1080")
  - FPS (z.B. "30")
- Alle Projekte können geöffnet werden
- Jedes Projekt hat seine eigenen Inhalte

**Überprüfung:**
```powershell
# Liste alle Projekte:
dir "C:\Users\jacqu\OneDrive\Desktop\Wind and Lightning Projekts\com.lveditor.draft"
```

---

## Bekannte Probleme / Troubleshooting

### Problem: "Cannot read properties of null"

**Ursache:** React Hook-Fehler, Electron API nicht verfügbar

**Lösung:**
1. Stellen Sie sicher, dass `npm start` verwendet wird (nicht `npm run electron:dev`)
2. Prüfen Sie Browser-Konsole auf detaillierte Fehlermeldungen
3. Starten Sie die Anwendung neu

### Problem: Projekt-Ordner wird nicht erstellt

**Ursache:** Berechtigungen, Pfad existiert nicht

**Lösung:**
```powershell
# Erstellen Sie den Basis-Pfad manuell:
mkdir "C:\Users\jacqu\OneDrive\Desktop\Wind and Lightning Projekts\com.lveditor.draft"
```

### Problem: Medien erscheinen nicht nach Import

**Ursache:** Asset-Registry nicht synchronisiert

**Lösung:**
1. Prüfen Sie `assets/index.json` auf Einträge
2. Öffnen Sie Browser-Konsole auf Fehler
3. Prüfen Sie, ob `assetAPI.list()` aufgerufen wird

### Problem: Timeline ist leer nach Projekt-Öffnen

**Ursache:** `LOAD_PROJECT` Action lädt nicht alle Felder

**Lösung:**
1. Prüfen Sie `timeline_v1.json` auf `tracks` Array
2. Öffnen Sie Browser-Konsole:
   ```
   [EditorLayout] Loading project: ...
   [EditorLayout] Loaded X media items
   ```
3. Prüfen Sie, ob `dispatch({ type: 'LOAD_PROJECT' })` aufgerufen wird

### Problem: Auto-Save funktioniert nicht

**Ursache:** `currentProjectPath` ist nicht gesetzt

**Lösung:**
1. Öffnen Sie Browser-Konsole
2. Sollte zeigen:
   ```
   [EditorLayout] Auto-save enabled (5 minutes interval)
   ```
3. Falls nicht, prüfen Sie ob Projekt korrekt geöffnet wurde

---

## Nächste Schritte (Optional)

Nach erfolgreichem Testing können Sie folgende Features hinzufügen:

1. **Backup-System:**
   - Erstellen Sie automatische Backups vor jedem Save
   - Implementieren Sie "Projekt wiederherstellen" aus Backup

2. **Export:**
   - Implementieren Sie Video-Export aus Timeline
   - Nutzen Sie `exportManager.exportTimeline()`

3. **Cloud-Sync:**
   - Synchronisieren Sie Projekte mit Cloud-Speicher
   - OneDrive-Integration ist bereits vorbereitet

4. **Performance-Optimierung:**
   - Proxy-Generierung für große Videos
   - Cache-Management

5. **Collaboration:**
   - Multi-User-Support mit erweiterten Locks
   - Änderungs-History anzeigen

---

## Support

Bei Problemen:

1. **Browser-Konsole öffnen:** F12 → Console
2. **Electron-Logs prüfen:** Terminal-Output beobachten
3. **Logs-Ordner prüfen:**
   ```powershell
   type "C:\Users\jacqu\OneDrive\Desktop\Wind and Lightning Projekts\com.lveditor.draft\{Projektname}\logs\autosave.log"
   type "C:\Users\jacqu\OneDrive\Desktop\Wind and Lightning Projekts\com.lveditor.draft\{Projektname}\logs\errors.log"
   ```

---

**✅ Implementierung abgeschlossen!**

Alle Änderungen wurden erfolgreich implementiert:
- ✅ Timeline-Laden mit allen Feldern
- ✅ Vollständige State-Speicherung
- ✅ Media-Synchronisation
- ✅ Auto-Save
- ✅ IPC-Handler

**Bitte führen Sie nun die Tests durch und melden Sie Probleme!**
