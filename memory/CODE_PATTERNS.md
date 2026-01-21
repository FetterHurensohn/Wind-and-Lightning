# 🎨 Code-Patterns & Konventionen

## Naming Conventions

### Dateien
- **Komponenten**: `PascalCase.jsx` (z.B. `AIChat.jsx`)
- **Module**: `PascalCase.js` (z.B. `AIClient.js`)
- **Hooks**: `useCamelCase.js` (z.B. `useProjects.js`)
- **Utils**: `camelCase.js` (z.B. `timecode.js`)

### Variablen & Funktionen
```javascript
// Konstanten
const AI_PROVIDERS = {};
const DEFAULT_MODEL = {};

// Funktionen
function handleClick() {}
function loadAISettings() {}

// State
const [isOpen, setIsOpen] = useState(false);
const [selectedModel, setSelectedModel] = useState('gpt-5.2');
```

### CSS Classes
```jsx
// Tailwind mit CSS Variables
className="bg-[var(--bg-panel)] text-[var(--text-primary)]"

// Conditional Classes
className={`base-class ${isActive ? 'active-class' : 'inactive-class'}`}
```

---

## Komponenten-Patterns

### Standard-Komponente
```jsx
/**
 * KomponentenName.jsx - Kurze Beschreibung
 */

import React, { useState, useCallback } from 'react';
import Icon from './Icon';

export default function KomponentenName({ 
  onClose,
  onAction,
  initialValue = 'default'
}) {
  const [value, setValue] = useState(initialValue);
  
  const handleAction = useCallback(() => {
    onAction?.(value);
  }, [value, onAction]);
  
  return (
    <div 
      className="bg-[var(--bg-panel)] rounded-lg border border-[var(--border-subtle)]"
      data-testid="komponenten-name"
    >
      {/* Content */}
    </div>
  );
}
```

### Panel/Modal-Komponente
```jsx
export default function PanelName({ onClose }) {
  return (
    <div className="bg-[var(--bg-panel)] rounded-lg border border-[var(--border-subtle)] overflow-hidden w-[400px]">
      {/* Header - immer h-10 oder h-11 */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Icon name="iconName" size={16} className="text-[var(--accent-turquoise)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">Panel Titel</span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors"
          data-testid="close-panel"
        >
          <Icon name="close" size={14} />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-4">
        {/* ... */}
      </div>
      
      {/* Footer (optional) */}
      <div className="p-4 border-t border-[var(--border-subtle)]">
        <button className="w-full h-10 bg-[var(--accent-turquoise)] text-white rounded-lg">
          Aktion
        </button>
      </div>
    </div>
  );
}
```

### Modal-Wrapper
```jsx
{showModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
    <div className="animate-scaleIn">
      <ModalContent onClose={() => setShowModal(false)} />
    </div>
  </div>
)}
```

---

## Button-Patterns

### Primär-Button (Gradient)
```jsx
<button className="w-full h-12 bg-gradient-to-r from-[var(--accent-turquoise)] to-[var(--accent-purple)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all">
  Aktion
</button>
```

### Sekundär-Button
```jsx
<button className="px-4 h-10 bg-[var(--accent-turquoise)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all">
  Aktion
</button>
```

### Ghost-Button
```jsx
<button className="px-4 h-10 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-normal)] transition-colors">
  Aktion
</button>
```

### Icon-Button
```jsx
<button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
  <Icon name="settings" size={16} />
</button>
```

---

## Input-Patterns

### Text-Input
```jsx
<input
  type="text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Placeholder..."
  className="w-full h-10 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-turquoise)]"
  data-testid="input-name"
/>
```

### Select
```jsx
<select
  value={value}
  onChange={(e) => setValue(e.target.value)}
  className="w-full h-10 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-turquoise)]"
>
  <option value="opt1">Option 1</option>
  <option value="opt2">Option 2</option>
</select>
```

### Textarea
```jsx
<textarea
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Placeholder..."
  rows={4}
  className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-turquoise)] resize-none"
/>
```

---

## Tab-Pattern
```jsx
const [activeTab, setActiveTab] = useState('tab1');

const tabs = [
  { id: 'tab1', name: 'Tab 1', icon: 'icon1' },
  { id: 'tab2', name: 'Tab 2', icon: 'icon2' },
];

// Render
<div className="flex border-b border-[var(--border-subtle)]">
  {tabs.map(tab => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`flex-1 h-11 flex items-center justify-center gap-2 text-xs border-b-2 transition-all ${
        activeTab === tab.id
          ? 'border-[var(--accent-turquoise)] text-[var(--accent-turquoise)] bg-[var(--accent-turquoise)]/5'
          : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
      }`}
      data-testid={`tab-${tab.id}`}
    >
      <Icon name={tab.icon} size={14} />
      {tab.name}
    </button>
  ))}
</div>
```

---

## Loading-Pattern
```jsx
// Spinner
<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

// Dots
<div className="flex gap-1">
  <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)] animate-bounce" style={{ animationDelay: '0ms' }} />
  <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)] animate-bounce" style={{ animationDelay: '150ms' }} />
  <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)] animate-bounce" style={{ animationDelay: '300ms' }} />
</div>

// Progress Bar
<div className="h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
  <div 
    className="h-full bg-gradient-to-r from-[var(--accent-turquoise)] to-[var(--accent-purple)] transition-all"
    style={{ width: `${progress}%` }}
  />
</div>
```

---

## Error-Pattern
```jsx
{error && (
  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
    <div className="flex items-center gap-2 text-red-400 text-sm">
      <Icon name="alertCircle" size={14} />
      {error}
    </div>
  </div>
)}
```

---

## Info-Box Pattern
```jsx
<div className="p-4 bg-[var(--accent-turquoise)]/10 rounded-lg border border-[var(--accent-turquoise)]/20">
  <div className="flex items-start gap-3">
    <Icon name="info" size={18} className="text-[var(--accent-turquoise)] mt-0.5" />
    <div>
      <div className="text-sm font-medium text-[var(--accent-turquoise)]">
        Titel
      </div>
      <p className="text-xs text-[var(--text-secondary)] mt-1">
        Beschreibung...
      </p>
    </div>
  </div>
</div>
```

---

## data-testid Konvention

```jsx
// Buttons
data-testid="submit-button"
data-testid="close-panel"
data-testid="save-settings"

// Inputs
data-testid="search-input"
data-testid="title-input"

// Containers
data-testid="ai-chat-panel"
data-testid="settings-modal"

// Lists
data-testid="project-list"
data-testid="model-option-gpt-5.2"

// Tabs
data-testid="tab-script"
data-testid="tab-titles"
```
