# 🔧 Quick Fix Guide - Video Editor

## ✅ Was wurde gefixt:

### 1. **Redux Store Debugging**
- Store ist jetzt über `window.store` in der Console zugänglich
- Bessere Error-Logs

### 2. **Timeline Funktionen**
- ✅ **Delete Key**: `Delete` oder `Backspace` löscht ausgewählte Clips
- ✅ **Space Key**: Play/Pause Toggle
- ✅ **Drag & Drop**: Medien von Library zu Timeline mit Logging
- ✅ **Clip Selection**: Klick zum Auswählen, Strg+Klick für Multi-Select
- ✅ **Razor Tool**: Clips an aktueller Position schneiden
- ✅ **Trim Handles**: An Clip-Rändern ziehen zum Trimmen

### 3. **Video Preview**
- ✅ Besseres Error Handling
- ✅ Console-Logging für Debugging
- ✅ Volume Control funktioniert
- ✅ Video lädt bei currentTime = 0

### 4. **UI Verbesserungen**
- ✅ Export Button im Header
- ✅ Save/Open Buttons (Platzhalter)
- ✅ Besseres Layout

### 5. **Media Library**
- ✅ Drag & Drop mit JSON Daten
- ✅ Double-Click zum Hinzufügen
- ✅ Success/Error Messages

## 🧪 Testing Checklist:

### Import Test:
1. ✅ Klicken Sie "Import Media"
2. ✅ Wählen Sie ein Video aus
3. ✅ Sehen Sie Success Message
4. ✅ Thumbnail wird generiert

### Timeline Test:
1. ✅ Double-Click auf Media Item → Clip erscheint
2. ✅ Drag Media Item auf Timeline → Clip an Position
3. ✅ Klick auf Clip → Auswahl (blau)
4. ✅ Delete drücken → Clip wird gelöscht

### Preview Test:
1. ✅ Clip auf Timeline → Video erscheint
2. ✅ Play Button → Video spielt
3. ✅ Space → Play/Pause Toggle
4. ✅ Timeline Scrubbing → Video folgt

### Effects Test:
1. ✅ Clip auswählen
2. ✅ Effects Panel rechts → Slider bewegen
3. ✅ Preview zeigt Effekt in Echtzeit

### Export Test:
1. ✅ Clips auf Timeline
2. ✅ Export Button → Dialog öffnet
3. ✅ Settings wählen → Export starten
4. ✅ Progress Bar → Download

## 🐛 Debugging in Browser Console:

```javascript
// Run this in Console (F12)
const state = window.store.getState();

// Check media
console.log('Media Items:', state.media.items);

// Check clips
console.log('Timeline Clips:', state.timeline.clips);

// Check current time
console.log('Current Time:', state.timeline.currentTime);

// Check if playing
console.log('Is Playing:', state.timeline.isPlaying);
```

## 🔥 Häufige Probleme & Lösungen:

### Problem: "No clips in timeline"
**Lösung**: 
1. Import ein Video zuerst
2. Double-Click oder Drag auf Timeline
3. Check Console für Errors

### Problem: "Video doesn't play"
**Lösung**:
1. Check: Ist Clip auf Timeline?
2. Check: Ist Playhead über Clip?
3. Check Console: `state.timeline.clips`
4. Check Console: Errors beim Video laden?

### Problem: "Effects don't work"
**Lösung**:
1. Clip auswählen (blau markiert)
2. Effects Panel sollte aktiv sein
3. Slider bewegen
4. Video sollte sofort reagieren

### Problem: "Can't delete clips"
**Lösung**:
1. Clip auswählen (Klick)
2. Delete oder Backspace drücken
3. Oder: Timeline deselektieren und nochmal versuchen

## 🎯 Keyboard Shortcuts:

| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `Delete` or `Backspace` | Delete selected clips |
| `Ctrl+Click` | Multi-select clips |

## 📝 Console Commands zum Testen:

```javascript
// Add a test clip programmatically
window.store.dispatch({
  type: 'timeline/addClip',
  payload: {
    id: 'test-clip-1',
    mediaId: window.store.getState().media.items[0]?.id,
    trackId: 'v1',
    startTime: 0,
    duration: 5,
    trimStart: 0,
    trimEnd: 0,
    effects: [],
    volume: 100,
    speed: 1
  }
});

// Play/Pause
window.store.dispatch({ type: 'timeline/togglePlay' });

// Set time
window.store.dispatch({ 
  type: 'timeline/setCurrentTime', 
  payload: 2.5 
});
```

## 🚀 Next Steps:

Wenn alles funktioniert:
1. ✅ Importieren Sie mehrere Videos
2. ✅ Erstellen Sie eine komplexe Timeline
3. ✅ Probieren Sie alle Effekte aus
4. ✅ Exportieren Sie ein Testvideo

Wenn Probleme auftreten:
1. 🔍 Check Browser Console (F12)
2. 🔍 Check `debug-test.js` Script
3. 🔍 Check Redux Store: `window.store.getState()`
4. 📸 Machen Sie Screenshot vom Error
