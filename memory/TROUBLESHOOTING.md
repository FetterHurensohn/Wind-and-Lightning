# 🚨 Troubleshooting Guide

## Häufige Probleme & Lösungen

---

## 1. App zeigt leere Seite

### Symptom
Browser zeigt weiße/leere Seite

### Diagnose
```bash
# Logs prüfen
tail -n 50 /var/log/supervisor/frontend.out.log
tail -n 50 /var/log/supervisor/frontend.err.log
```

### Häufige Ursachen & Lösungen

**A) Vite Cache korrupt:**
```bash
cd /app && rm -rf node_modules/.vite && sudo supervisorctl restart frontend
```

**B) Import-Fehler:**
- Prüfe Console-Logs im Browser (F12)
- Suche nach "Failed to resolve import"
- Korrigiere den Import-Pfad

**C) Syntax-Fehler:**
- Prüfe Logs auf "SyntaxError"
- Nutze `yarn lint` für Fehlersuche

---

## 2. "Module not found" Fehler

### Lösung
```bash
# Dependency installieren
cd /app && yarn add paket-name

# Neustart
sudo supervisorctl restart frontend
```

---

## 3. Hot Reload funktioniert nicht

### Symptom
Änderungen werden nicht im Browser angezeigt

### Lösung
```bash
# Prüfe ob Server läuft
sudo supervisorctl status frontend

# Wenn RUNNING aber keine HMR Updates in Logs:
sudo supervisorctl restart frontend
```

---

## 4. Icon wird nicht angezeigt

### Symptom
Icon erscheint nicht oder zeigt Fallback

### Diagnose
```bash
grep "iconName" /app/src/components/editor/Icon.jsx
```

### Lösung
Icon zu `/app/src/components/editor/Icon.jsx` hinzufügen:
```javascript
iconName: <path d="M..." />,
```

---

## 5. Modal öffnet nicht

### Symptom
Klick auf Button → nichts passiert

### Diagnose
- Browser Console prüfen (F12)
- Prüfe ob `showModal` State existiert
- Prüfe ob `onClick` Handler korrekt ist

### Häufige Ursachen
```jsx
// FALSCH - onClick ruft Funktion sofort auf
onClick={setShowModal(true)}

// RICHTIG - onClick ist eine Funktion
onClick={() => setShowModal(true)}
```

---

## 6. CSS Variables funktionieren nicht

### Symptom
Farben sind falsch oder fehlen

### Diagnose
```bash
grep "var(--" /app/src/index.css | head -20
```

### Lösung
Stelle sicher, dass die Variable in `/app/src/index.css` definiert ist:
```css
:root {
  --bg-panel: #141416;
  /* ... */
}
```

---

## 7. KI-API gibt Fehler

### Symptom
"API-Fehler" oder "Verbindung fehlgeschlagen"

### Diagnose
```javascript
// In Browser Console prüfen:
fetch('https://api.emergentai.io/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sk-emergent-67b5f95099879B4541'
  },
  body: JSON.stringify({
    provider: 'openai',
    model: 'gpt-5.2',
    messages: [{ role: 'user', content: 'test' }]
  })
}).then(r => r.json()).then(console.log)
```

### Häufige Ursachen
- API Key ungültig/abgelaufen
- Rate Limit erreicht
- Netzwerk-Problem

---

## 8. State wird nicht aktualisiert

### Symptom
UI aktualisiert sich nicht nach State-Änderung

### Häufige Ursachen

**A) Direktes Mutieren:**
```jsx
// FALSCH
const handleClick = () => {
  items.push(newItem);  // Mutiert direkt
  setItems(items);       // React erkennt keine Änderung
};

// RICHTIG
const handleClick = () => {
  setItems([...items, newItem]);  // Neues Array
};
```

**B) Object Mutation:**
```jsx
// FALSCH
settings.value = newValue;
setSettings(settings);

// RICHTIG
setSettings({ ...settings, value: newValue });
```

---

## 9. Typescript Fehler

### Symptom
Rote Unterstriche in .ts/.tsx Dateien

### Lösung
```bash
# Types installieren falls fehlend
cd /app && yarn add -D @types/paket-name
```

**Hinweis:** Die App ist hauptsächlich JavaScript. TypeScript-Fehler in .jsx Dateien können ignoriert werden.

---

## 10. Test-IDs nicht gefunden

### Symptom
Testing Agent findet Elemente nicht

### Diagnose
```bash
grep -r "data-testid" /app/src/components/ | grep "gesuchte-id"
```

### Lösung
Test-ID zur Komponente hinzufügen:
```jsx
<button data-testid="button-name">
```

---

## Schnelle Befehle

```bash
# Status prüfen
sudo supervisorctl status frontend

# Logs anzeigen
tail -f /var/log/supervisor/frontend.out.log

# Neustart
sudo supervisorctl restart frontend

# Cache leeren + Neustart
cd /app && rm -rf node_modules/.vite && sudo supervisorctl restart frontend

# Dependencies neu installieren
cd /app && rm -rf node_modules && yarn install && sudo supervisorctl restart frontend
```

---

## Wann Neustart nötig?

| Änderung | Neustart nötig? |
|----------|-----------------|
| .jsx/.js Dateien | ❌ Nein (Hot Reload) |
| .css Dateien | ❌ Nein (Hot Reload) |
| .env Dateien | ✅ Ja |
| package.json | ✅ Ja (nach yarn install) |
| vite.config.ts | ✅ Ja |
| tailwind.config.js | ✅ Ja |
