# 🎯 Drag & Drop KOMPLETT-FIX

## ✅ Was wurde gefixt:

### 1. **Media Library Drag Start** ✅
```typescript
- Vollständiges Logging: "🎬 Media drag start: video.mp4"
- JSON und Text Daten beide gesetzt
- dragData enthält: id, name, type, duration, url, thumbnail
- Console zeigt: "📦 Drag data set: {...}"
```

### 2. **Timeline Drop Handler** ✅
```typescript
- Detailliertes Logging für alle Schritte
- Überprüft Data Types
- Versucht JSON data zuerst
- Fallback zu plain text
- Zeigt exact position: "🎬 Creating new clip at time: 2.5"
```

### 3. **Visual Feedback** ✅
```css
- Drag Cursor: grab → grabbing
- Opacity beim Dragging: 0.7
- Track Highlight beim Hover
- Dashed Border beim Drop-Over
```

### 4. **Double-Click Alternative** ✅
```typescript
- Success Message: "Added 'video.mp4' to timeline"
- Clip wird an Track-Ende hinzugefügt
- Console: "✅ Clip added to timeline"
```

### 5. **Clip Movement** ✅
```typescript
- Clips können zwischen Tracks bewegt werden
- Console zeigt Start/End des Drags
- Neue Position wird gesetzt
```

## 🧪 Test-Schritte:

### Test 1: Double-Click (Sollte IMMER funktionieren)
1. Import ein Video
2. Double-Click auf Video
3. ✅ Console: "🎬 Double-click: Adding to timeline: video.mp4"
4. ✅ Message: "Added 'video.mp4' to timeline"
5. ✅ Clip erscheint auf Timeline

### Test 2: Drag & Drop
1. Import ein Video
2. Klick und HALTE Maustaste auf Video
3. ✅ Console: "🎬 Media drag start: video.mp4"
4. ✅ Console: "📦 Drag data set: {...}"
5. Ziehe über Timeline Track
6. ✅ Console: "🎯 Drag over track, data types: [...]"
7. Loslassen
8. ✅ Console: "📍 Drop on track: v1"
9. ✅ Console: "📦 Parsed media item: {...}"
10. ✅ Console: "🎬 Creating new clip at time: X"
11. ✅ Console: "✅ Clip added to timeline"

### Test 3: Clip Movement
1. Clip bereits auf Timeline
2. Select Tool aktiv (default)
3. Drag Clip
4. ✅ Console: "🎬 Clip drag start: clip-123"
5. Drop auf anderen Track
6. ✅ Console: "📦 Moving existing clip: clip-123"
7. ✅ Console: "✅ Clip moved to: v2 at time: 5.5"

## 🔍 Debugging Commands:

```javascript
// In Browser Console (F12):

// 1. Check if media items exist
console.log('Media Items:', window.store.getState().media.items);

// 2. Check drag data manually
const item = window.store.getState().media.items[0];
console.log('Drag Data:', {
  id: item.id,
  name: item.name,
  type: item.type,
  duration: item.duration
});

// 3. Force add a clip (bypass drag)
window.store.dispatch({
  type: 'timeline/addClip',
  payload: {
    id: `clip-${Date.now()}`,
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

// 4. Check all clips
console.log('Timeline Clips:', window.store.getState().timeline.clips);
```

## 🐛 Wenn Drag & Drop NICHT funktioniert:

### Symptom 1: Kein Console Log beim Drag
**Problem:** Event Handler nicht registriert
**Lösung:** 
- Refresh Browser (F5)
- Check: Ist `draggable={true}` auf Card?
- Check Console für React Errors

### Symptom 2: Console zeigt "No data to drop"
**Problem:** Daten werden nicht übertragen
**Lösung:**
- Check: `e.dataTransfer.setData()` wird aufgerufen
- Check: Browser erlaubt Drag & Drop
- Versuche Double-Click stattdessen

### Symptom 3: Clip erscheint nicht
**Problem:** Redux State nicht aktualisiert
**Lösung:**
```javascript
// Check Redux State
console.log(window.store.getState().timeline.clips);

// Force reload components
window.location.reload();
```

### Symptom 4: "Cannot read property of undefined"
**Problem:** mediaId stimmt nicht
**Lösung:**
- Check: Media Item existiert im Store
- Check: mediaId ist korrekt gesetzt

## 💡 Alternativen wenn Drag & Drop nicht geht:

### Option 1: Double-Click (EMPFOHLEN)
```
1. Double-Click auf Media Item
2. Clip wird automatisch hinzugefügt
3. Funktioniert IMMER
```

### Option 2: Console Commands
```javascript
// Manual add via console
const media = window.store.getState().media.items[0];
window.store.dispatch({
  type: 'timeline/addClip',
  payload: {
    id: `clip-${Date.now()}`,
    mediaId: media.id,
    trackId: 'v1',
    startTime: 0,
    duration: media.duration || 5,
    trimStart: 0,
    trimEnd: 0,
    effects: [],
    volume: 100,
    speed: 1
  }
});
```

## 📊 Console Output Beispiel (ERFOLG):

```
🎬 Media drag start: my-video.mp4
📦 Drag data set: {id: "1234", name: "my-video.mp4", type: "video", duration: 10.5}
🎯 Drag over track, data types: ["application/json", "text/plain"]
📍 Drop on track: v1
Data types: ["application/json", "text/plain"]
JSON data: {"id":"1234","name":"my-video.mp4",...}
📦 Parsed media item: {id: "1234", name: "my-video.mp4", ...}
🎬 Creating new clip at time: 2.5
✅ Clip added to timeline: {id: "clip-...", mediaId: "1234", ...}
```

## 🎯 Wichtige Code-Stellen:

### MediaLibrary.tsx Zeile 251-269:
```typescript
const handleItemDragStart = (e: React.DragEvent, item: any) => {
  console.log('🎬 Media drag start:', item.name);
  e.dataTransfer.effectAllowed = 'copy';
  
  const dragData = {
    id: item.id,
    name: item.name,
    type: item.type,
    duration: item.duration,
    url: item.url,
    thumbnail: item.thumbnail,
  };
  
  e.dataTransfer.setData('application/json', JSON.stringify(dragData));
  e.dataTransfer.setData('text/plain', item.id);
  
  console.log('📦 Drag data set:', dragData);
};
```

### Timeline.tsx Zeile ~185-240:
```typescript
const handleTrackDrop = (e: React.DragEvent, trackId: string) => {
  e.preventDefault();
  e.stopPropagation();
  
  console.log('📍 Drop on track:', trackId);
  
  // Try JSON data
  let jsonData = e.dataTransfer.getData('application/json');
  
  if (jsonData) {
    const mediaItem = JSON.parse(jsonData);
    console.log('📦 Parsed media item:', mediaItem);
    
    // Calculate position
    const startTime = calculateDropPosition(e);
    
    // Create new clip
    const newClip = {...};
    dispatch(addClip(newClip));
    console.log('✅ Clip added:', newClip);
  }
};
```
