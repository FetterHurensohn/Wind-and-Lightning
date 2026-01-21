# 🗺️ Roadmap

> Priorisierte Liste aller geplanten Features und Verbesserungen.

---

## 🔴 P0 - Kritisch (Nächste Schritte)

### Export-Engine aktivieren
- [ ] `ExportEngine.js` mit UI verbinden
- [ ] Video-Rendering implementieren
- [ ] Fortschrittsanzeige
- [ ] Export-Presets (YouTube, TikTok, Instagram)
- **Dateien:** `/app/src/modules/export/ExportEngine.js`, `/app/src/components/editor/ExportDialog.jsx`

### Audio-zu-Text Transkription
- [ ] Whisper API Integration
- [ ] Echtzeit-Transkription
- [ ] Timing-Synchronisation
- **Dateien:** `/app/src/components/editor/AutoCaptionPanel.jsx`

### Timeline-Integration
- [ ] `ProjectState.js` mit Timeline verbinden
- [ ] Clip-Operationen (Cut, Copy, Paste)
- [ ] Undo/Redo vollständig implementieren
- **Dateien:** `/app/src/modules/core/ProjectState.js`, `/app/src/components/editor/TimelinePanel.jsx`

---

## 🟡 P1 - Wichtig (Mittelfristig)

### Multi-Track Audio-Mixer
- [ ] Audio-Tracks mit Lautstärke-Kontrolle
- [ ] Waveform-Visualisierung
- [ ] Audio-Effekte (EQ, Kompressor)
- [ ] Auto-Ducking
- **Dateien:** `/app/src/modules/audio/AudioEngine.js`, `/app/src/components/AudioMixer.jsx`

### Multicam-Editor
- [ ] Mehrere Kamera-Winkel synchronisieren
- [ ] Schneller Winkel-Wechsel
- [ ] Audio-Sync
- **Dateien:** `/app/src/components/editor/MulticamEditor.jsx`

### Cloud-Sync
- [ ] Projekt-Synchronisation
- [ ] Asset-Upload
- [ ] Versionierung
- **Dateien:** `/app/src/modules/cloud/CloudService.js`

### Effekte-Bibliothek erweitern
- [ ] Mehr Filter-Presets
- [ ] LUT-Support
- [ ] Effekt-Favoriten
- **Dateien:** `/app/src/modules/effects/EffectsLibrary.js`

---

## 🔵 P2 - Nice-to-Have (Langfristig)

### Text-to-Video Generierung
- [ ] Gemini Nano Banana oder GPT Image 1 Integration
- [ ] Bild-zu-Video
- [ ] Storyboard-Generierung
- **Benötigt:** `integration_playbook_expert_v2` für Image Generation

### AI Background Removal
- [ ] Echtzeit-Hintergrund-Entfernung
- [ ] Green-Screen Alternative
- [ ] Hintergrund-Ersetzung

### Motion Tracking
- [ ] Objekt-Verfolgung
- [ ] Text/Grafiken an Bewegung binden
- [ ] Stabilisierung

### Kollaborative Bearbeitung
- [ ] Mehrere Benutzer gleichzeitig
- [ ] Kommentare und Annotationen
- [ ] Versions-Vergleich
- **Dateien:** `/app/src/modules/collaboration/`

### Monetarisierung
- [ ] Pro-Abo System
- [ ] Asset-Marketplace
- [ ] Premium-Templates

---

## 🧹 Technische Schulden

### State Management Refactoring
- [ ] Redux vollständig integrieren oder entfernen
- [ ] Zentraler State in `ProjectState.js`
- [ ] Performance-Optimierung

### Code-Cleanup
- [ ] Alte/unbenutzte Komponenten entfernen
- [ ] TypeScript-Migration (optional)
- [ ] Test-Coverage erhöhen

### Performance
- [ ] Lazy Loading für große Komponenten
- [ ] Video-Preview Optimierung
- [ ] Memory Management

---

## 📊 Feature-Matrix

| Feature | Status | Priorität | Aufwand |
|---------|--------|-----------|---------|
| KI-Modell-Auswahl | ✅ Fertig | - | - |
| KI-Funktionen Panel | ✅ Fertig | - | - |
| Export-Engine | 🔄 In Arbeit | P0 | Mittel |
| Audio Transkription | 📋 Geplant | P0 | Mittel |
| Timeline-Integration | 📋 Geplant | P0 | Hoch |
| Audio-Mixer | 📋 Geplant | P1 | Hoch |
| Multicam | 📋 Geplant | P1 | Hoch |
| Cloud-Sync | 📋 Geplant | P1 | Hoch |
| Text-to-Video | 📋 Geplant | P2 | Mittel |
| Background Removal | 📋 Geplant | P2 | Mittel |
| Motion Tracking | 📋 Geplant | P2 | Hoch |
| Kollaboration | 📋 Geplant | P2 | Sehr Hoch |

---

## 🎯 Nächste Agent-Session

**Empfohlene Reihenfolge:**
1. Export-Engine aktivieren
2. Timeline mit ProjectState verbinden
3. Audio-Transkription implementieren

**Benötigte Integrationen:**
- OpenAI Whisper für Audio-zu-Text
- FFmpeg für Video-Export (bereits in Electron verfügbar)
