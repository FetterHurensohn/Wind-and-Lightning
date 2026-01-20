# 🔒 STRUKTUR LOCK - NICHT ÄNDERN!

## ⚠️ WICHTIG: Diese Struktur darf NICHT verändert werden!

### 📐 Layout-Spezifikation (PERMANENT):

```
┌─────────────────────────────────────────────────┐
│ TopToolbar (44px fest)                          │
├───────────────────┬───────────────┬─────────────┤
│                   │               │             │
│  Media Panel      │   Preview     │  AI Chat    │
│  (50% Höhe)       │   (50% Höhe)  │  (280px)    │
│                   │               │  (100% Höhe)│
├───────────────────┴───────────────┤             │
│                                   │             │
│  Timeline (Video Track)           │             │
│  (50% Höhe)                       │             │
│                                   │             │
└───────────────────────────────────┴─────────────┘
```

### 🎯 Technische Details:

**EditorLayout.jsx Struktur:**

1. **TopToolbar**: `44px` fest (nicht ändern!)
2. **Main Content Area**: `flex-1 flex` (horizontal split)
   - **Left + Center Column**: `flex-1 flex flex-col` (vertical split)
     - **Upper Row** (Media Panel + Preview): `flex-1 flex` ← WICHTIG: `flex-1` für 50% Höhe!
     - **Lower Row** (Timeline): `flex-1` ← WICHTIG: `flex-1` für 50% Höhe!
   - **Right Column** (AI Chat): `w-[280px]` (volle Höhe)

### ❌ NIEMALS ändern:

- ❌ NICHT `h-[50vh]` für Timeline verwenden (nimmt 50% des Viewports, nicht 50% des verbleibenden Platzes)
- ❌ NICHT die `flex-1` Klassen entfernen
- ❌ NICHT Grid-Layout verwenden
- ❌ NICHT fixed heights außer TopToolbar (44px) und AI Chat width (280px)

### ✅ Immer verwenden:

- ✅ `flex-1` für Upper Row (Media Panel + Preview)
- ✅ `flex-1` für Lower Row (Timeline)
- ✅ `flex flex-col` für den Container (Left + Center Column)
- ✅ `overflow-hidden` für alle Bereiche

### 🔄 Bei Problemen nach Neustart:

Wenn die Struktur nach Neustart kaputt ist:

1. Prüfe `src/components/editor/EditorLayout.jsx` Zeile 391-393:
   ```jsx
   {/* Lower Row: Timeline - GENAU 50% (gleich wie Upper Row mit flex-1) */}
   <div className="flex-1 bg-[var(--bg-main)] overflow-hidden">
     <TimelinePanel />
   </div>
   ```

2. Stelle sicher, dass die Timeline `flex-1` hat (NICHT `h-[50vh]`)

3. Prüfe Upper Row Zeile 371:
   ```jsx
   {/* Upper Row: Media Panel (left) + Preview (right) - GENAU 50% */}
   <div className="flex-1 flex overflow-hidden">
   ```

4. Stelle sicher, dass Upper Row auch `flex-1` hat

### 📝 Änderungshistorie:

- **18.01.2026**: Struktur finalisiert und gelockt
  - Timeline von `h-[50vh]` zu `flex-1` geändert
  - Upper Row behält `flex-1`
  - Beide Bereiche teilen sich jetzt exakt 50/50 des verbleibenden Platzes

---

**DIESE DATEI DIENT ALS REFERENZ UND DOKUMENTATION!**

Wenn die Struktur jemals wieder kaputt geht, lies diese Datei und stelle die oben beschriebene Struktur wieder her.
