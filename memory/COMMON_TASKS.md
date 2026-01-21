# 🔧 Häufige Aufgaben - Copy-Paste Vorlagen

## 1. Neue Komponente erstellen

```jsx
/**
 * NeueName.jsx - Kurze Beschreibung
 */

import React, { useState, useCallback } from 'react';
import Icon from './Icon';

export default function NeueName({ onClose, onAction }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleAction = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Aktion ausführen
      onAction?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [onAction]);
  
  return (
    <div className="bg-[var(--bg-panel)] rounded-lg border border-[var(--border-subtle)] overflow-hidden w-[400px]">
      {/* Header */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Icon name="effects" size={16} className="text-[var(--accent-turquoise)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">Titel</span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors"
        >
          <Icon name="close" size={14} />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
        
        {/* Dein Content hier */}
        
        <button
          onClick={handleAction}
          disabled={loading}
          className="w-full h-10 bg-[var(--accent-turquoise)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
        >
          {loading ? 'Lädt...' : 'Aktion'}
        </button>
      </div>
    </div>
  );
}
```

---

## 2. Neues Icon hinzufügen

In `/app/src/components/editor/Icon.jsx`:

```javascript
// Unter iconPaths hinzufügen:
neuesIcon: <path d="M... SVG PATH ..." />,
```

Icons finden: https://heroicons.com (outline style, 24x24)

---

## 3. Neue KI-Funktion hinzufügen

### 3.1 In AIModelSelector.js:
```javascript
// Unter AI_FUNCTION_MODELS hinzufügen:
neueFunktion: {
  name: 'Neue Funktion',
  description: 'Was macht sie',
  recommended: { provider: 'openai', model: 'gpt-5.2' },
  alternatives: [
    { provider: 'anthropic', model: 'claude-4-sonnet-20250514' }
  ]
},
```

### 3.2 In AIFeaturesPanel.jsx Tab hinzufügen:
```javascript
// Unter AI_FEATURES hinzufügen:
{ id: 'neueFunktion', name: 'Neue Funktion', icon: 'effects', description: 'Beschreibung' },

// In renderFeatureContent() Case hinzufügen:
case 'neueFunktion':
  return (
    <div className="space-y-4">
      {/* Dein UI */}
    </div>
  );
```

---

## 4. Neues Modell hinzufügen

In `/app/src/modules/ai/AIModelSelector.js`:

```javascript
// Unter AI_PROVIDERS.openai.models (oder anthropic/gemini):
{ id: 'neues-modell-id', name: 'Neues Modell', description: 'Beschreibung', recommended: false },
```

---

## 5. Neue Einstellung hinzufügen

In `/app/src/components/SettingsPanel.jsx`:

### 5.1 Toggle-Setting:
```jsx
<ToggleSetting
  label="Neue Option"
  description="Was macht sie"
  value={settings.section?.newOption}
  onChange={(v) => updateSetting('section.newOption', v)}
/>
```

### 5.2 Select-Setting:
```jsx
<SelectSetting
  label="Neue Auswahl"
  value={settings.section?.newSelect}
  options={[
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2' },
  ]}
  onChange={(v) => updateSetting('section.newSelect', v)}
/>
```

### 5.3 Slider-Setting:
```jsx
<SliderSetting
  label="Neue Einstellung"
  value={settings.section?.newSlider || 50}
  min={0}
  max={100}
  step={10}
  unit="%"
  onChange={(v) => updateSetting('section.newSlider', v)}
/>
```

---

## 6. Modal öffnen/schließen

```jsx
const [showModal, setShowModal] = useState(false);

// Button zum Öffnen
<button onClick={() => setShowModal(true)}>
  Modal öffnen
</button>

// Modal rendern
{showModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
    <div className="animate-scaleIn">
      <ModalContent onClose={() => setShowModal(false)} />
    </div>
  </div>
)}
```

---

## 7. Toast-Notification zeigen

```jsx
import { useToast } from '../hooks/useToast';

const toast = useToast();

// Verwenden
toast.show('Erfolgreich gespeichert', 'success', 3000);
toast.show('Ein Fehler ist aufgetreten', 'error', 5000);
toast.show('Info-Nachricht', 'info', 3000);
```

---

## 8. KI-Anfrage senden

```javascript
import { quickPrompt } from '../../modules/ai/AIClient';

const response = await quickPrompt('Dein Prompt hier', {
  provider: 'openai',      // oder 'anthropic', 'gemini'
  model: 'gpt-5.2',
  temperature: 0.7,
  systemMessage: 'Du bist ein hilfreicher Assistent.'
});
```

---

## 9. Session-basierter Chat

```javascript
import { AIChat, generateSessionId } from '../../modules/ai/AIClient';

// Einmal initialisieren
const chat = new AIChat({
  sessionId: generateSessionId(),
  systemMessage: 'Du bist ein Video-Editor Assistent.',
  provider: 'openai',
  model: 'gpt-5.2'
});

// Nachrichten senden (behält Kontext)
const response1 = await chat.sendMessage('Erste Frage');
const response2 = await chat.sendMessage('Follow-up Frage');

// Historie löschen
chat.clearHistory();
```

---

## 10. Test-ID hinzufügen

```jsx
// Auf Container
<div data-testid="panel-name">

// Auf Buttons
<button data-testid="submit-btn">

// Auf Inputs
<input data-testid="search-input" />

// Auf dynamische Elemente
<div data-testid={`item-${item.id}`}>
```
