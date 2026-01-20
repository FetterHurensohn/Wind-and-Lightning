# 🎯 Desktop-App Manual Testing Guide

## So testest du alle neuen Desktop-Features:

---

## 1. 🖥️ **Native File Dialogs testen**

### Test A: Projekt öffnen
1. Drücke `Ctrl+O` (oder klicke auf "Datei" → "Projekt öffnen...")
2. **Erwartetes Ergebnis**: Native Windows File-Dialog öffnet sich
3. ✅ **PASS**: Wenn der Dialog erscheint
4. ❌ **FAIL**: Wenn nichts passiert oder Browser-Dialog erscheint

### Test B: Projekt speichern
1. Drücke `Ctrl+S` (oder klicke auf "Datei" → "Projekt speichern")
2. **Erwartetes Ergebnis**: Native Save-Dialog öffnet sich
3. Datei sollte als `.veproj` gespeichert werden
4. Überprüfe: Datei existiert im gewählten Ordner
5. ✅ **PASS**: Datei wurde erstellt

### Test C: Medien importieren
1. Drücke `Ctrl+I` (oder "Datei" → "Medien importieren...")
2. **Erwartetes Ergebnis**: Native Multi-File-Selector
3. Wähle eine Video/Bild/Audio-Datei
4. ✅ **PASS**: Datei erscheint in Media Library

---

## 2. 📋 **Native Menüs testen**

### Test D: Menüleiste
1. Schaue oben im Fenster
2. **Erwartetes Ergebnis**: Menüleiste mit "Datei", "Bearbeiten", "Ansicht", "Hilfe"
3. ✅ **PASS**: Menüs sind sichtbar und klickbar

### Test E: Keyboard Shortcuts
Teste diese Shortcuts:

| Shortcut | Aktion | Erwartetes Verhalten |
|----------|--------|---------------------|
| `Ctrl+N` | Neues Projekt | Bestätigungs-Dialog |
| `Ctrl+O` | Öffnen | File-Dialog öffnet |
| `Ctrl+S` | Speichern | Save-Dialog öffnet |
| `Ctrl+Z` | Undo | Letzte Aktion rückgängig |
| `Ctrl+Shift+Z` | Redo | Aktion wiederholen |
| `Ctrl+K` | Split | Clip an Playhead teilen |
| `Ctrl++` | Zoom In | Timeline vergrößern |
| `Ctrl+-` | Zoom Out | Timeline verkleinern |

---

## 3. 💾 **Frame Cache System testen**

### Test F: Cache öffnen
1. Öffne Windows Explorer
2. Gehe zu: `C:\Users\{DEIN_NAME}\AppData\Roaming\capcut-video-editor\cache\frames`
3. **Erwartetes Ergebnis**: Ordner existiert
4. ✅ **PASS**: Ordner ist da

### Test G: Cache Console-Test
1. Öffne DevTools (F12)
2. Gehe zur Console
3. Kopiere diesen Code:

```javascript
// Test Frame Cache
(async () => {
  const testData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  
  // Save Frame
  const saveResult = await window.electronAPI.cache.saveFrame('test-clip-1', 0, testData);
  console.log('💾 Save Result:', saveResult);
  
  // Load Frame
  const loadResult = await window.electronAPI.cache.loadFrame('test-clip-1', 0);
  console.log('📂 Load Result:', loadResult);
  
  // Check file system
  const cachePath = await window.electronAPI.system.getPath('cache');
  console.log('📁 Cache Path:', cachePath);
})();
```

4. **Erwartetes Ergebnis**:
   ```
   💾 Save Result: { success: true }
   📂 Load Result: { success: true, data: "..." }
   📁 Cache Path: "C:\Users\...\AppData\Roaming\capcut-video-editor\cache\frames"
   ```
5. ✅ **PASS**: Alle success: true

---

## 4. ⚡ **GPU Acceleration prüfen**

### Test H: Performance
1. Öffne DevTools (F12) → Performance Tab
2. Starte Recording
3. Bewege einige Clips auf der Timeline
4. Stoppe Recording
5. **Erwartetes Ergebnis**: 
   - FPS sollte 60fps sein
   - Keine "Long Tasks" Warnings
   - Smooth Animationen
6. ✅ **PASS**: Flüssige Performance

### Test I: GPU Status
1. In DevTools Console:

```javascript
// Check GPU Status
(async () => {
  const info = await window.electronAPI.system.getInfo();
  console.log('🖥️ System Info:', info);
  console.log('💻 Platform:', info.platform);
  console.log('🏗️ Arch:', info.arch);
})();
```

2. **Erwartetes Ergebnis**:
   ```
   Platform: win32
   Arch: x64 (oder arm64)
   ```

---

## 5. 🎬 **Edit Operations testen**

### Test J: Undo/Redo
1. Erstelle einen Clip auf Timeline (drag aus Media Library)
2. Drücke `Ctrl+Z`
3. **Erwartetes Ergebnis**: Clip verschwindet
4. Drücke `Ctrl+Shift+Z`
5. **Erwartetes Ergebnis**: Clip kommt zurück
6. ✅ **PASS**: Undo/Redo funktioniert

### Test K: Copy/Paste
1. Wähle einen Clip (klick darauf)
2. Drücke `Ctrl+C`
3. Bewege Playhead zu anderer Position
4. Drücke `Ctrl+V`
5. **Erwartetes Ergebnis**: Clip wird an neuer Position eingefügt
6. ✅ **PASS**: Copy/Paste funktioniert

### Test L: Split
1. Wähle einen Clip
2. Bewege Playhead in die Mitte des Clips
3. Drücke `Ctrl+K` (oder "Bearbeiten" → "An Playhead teilen")
4. **Erwartetes Ergebnis**: Clip wird in 2 Teile geteilt
5. ✅ **PASS**: Split funktioniert

---

## 6. 🔍 **System Information testen**

### Test M: System Info Console
```javascript
// Get all system info
(async () => {
  const info = await window.electronAPI.system.getInfo();
  console.log('🖥️ SYSTEM INFO:');
  console.log('================');
  console.log('Platform:', info.platform);
  console.log('Architecture:', info.arch);
  console.log('Home Dir:', info.homeDir);
  console.log('Temp Dir:', info.tempDir);
  console.log('================');
  
  // Get specific paths
  const paths = ['cache', 'userData', 'temp', 'downloads'];
  for (const pathName of paths) {
    const p = await window.electronAPI.system.getPath(pathName);
    console.log(`${pathName}:`, p);
  }
})();
```

**Erwartete Ausgabe:**
```
Platform: win32
Architecture: x64
Home Dir: C:\Users\{NAME}
Temp Dir: C:\Users\{NAME}\AppData\Local\Temp
cache: C:\Users\{NAME}\AppData\Roaming\capcut-video-editor\cache
userData: C:\Users\{NAME}\AppData\Roaming\capcut-video-editor
temp: C:\Users\{NAME}\AppData\Local\Temp
downloads: C:\Users\{NAME}\Downloads
```

---

## 7. 🎨 **UI Rendering testen**

### Test N: Alle UI-Elemente sichtbar
1. Öffne die App
2. **Erwartetes Ergebnis**:
   - ✅ VideoBar oben (mit Icons)
   - ✅ Media Library links
   - ✅ Preview Panel Mitte
   - ✅ Inspector rechts
   - ✅ Timeline unten
   - ✅ Keine grauen Bereiche
   - ✅ Keine JavaScript-Fehler in Console

---

## 📊 **Test-Checkliste**

Markiere jedes erfolgreiche Feature:

### File System:
- [ ] Projekt öffnen (Ctrl+O) funktioniert
- [ ] Projekt speichern (Ctrl+S) funktioniert
- [ ] Medien importieren (Ctrl+I) funktioniert
- [ ] .veproj Dateien werden erstellt

### Native Menüs:
- [ ] Menüleiste ist sichtbar
- [ ] "Datei" Menü funktioniert
- [ ] "Bearbeiten" Menü funktioniert
- [ ] "Ansicht" Menü funktioniert
- [ ] Keyboard Shortcuts funktionieren

### Frame Cache:
- [ ] Cache-Ordner existiert
- [ ] Frames können gespeichert werden
- [ ] Frames können geladen werden
- [ ] Console-Test erfolgreich

### Edit Operations:
- [ ] Undo (Ctrl+Z) funktioniert
- [ ] Redo (Ctrl+Shift+Z) funktioniert
- [ ] Copy/Paste (Ctrl+C/V) funktioniert
- [ ] Split (Ctrl+K) funktioniert
- [ ] Delete funktioniert

### Performance:
- [ ] UI ist flüssig (60fps)
- [ ] Keine Lags beim Drag&Drop
- [ ] GPU Acceleration aktiv

### System:
- [ ] System Info abrufbar
- [ ] Pfade korrekt
- [ ] Keine Fehler in Console

---

## ❌ **Wenn Tests fehlschlagen:**

1. **Öffne DevTools** (F12)
2. **Gehe zu Console Tab**
3. **Schaue nach Fehlern** (rote Texte)
4. **Kopiere die Fehlermeldung**
5. **Teile mir die Fehlermeldung mit**

---

## ✅ **Erfolgs-Kriterien**

Die Desktop-App ist vollständig funktionsfähig, wenn:

1. ✅ Alle Native Dialogs öffnen
2. ✅ Projekte können gespeichert und geladen werden
3. ✅ Menüs und Shortcuts funktionieren
4. ✅ Cache-System funktioniert
5. ✅ UI ist flüssig und ohne graue Bereiche
6. ✅ Keine kritischen Fehler in Console

---

**🚀 Viel Erfolg beim Testen!**

Falls irgendwas nicht funktioniert, lass es mich wissen und ich behebe es sofort!
