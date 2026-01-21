# 🎨 Design System

> Vollständige Referenz aller Design-Tokens und UI-Elemente.

---

## Farben (CSS Variables)

### Hintergründe
```css
--bg-main: #0a0a0b        /* Haupt-Hintergrund */
--bg-panel: #141416       /* Panel-Hintergrund */
--bg-surface: #1a1a1d     /* Erhöhte Flächen, Inputs */
--bg-hover: #222225       /* Hover-Zustand */
```

### Akzentfarben
```css
--accent-turquoise: #00d4aa   /* Primär (Buttons, Links) */
--accent-purple: #a855f7      /* Sekundär (Gradient-Ende) */
--accent-blue: #3b82f6        /* Info, User-Messages */
--accent-pro: #f97316         /* Pro/Premium Features */
```

### Text
```css
--text-primary: #ffffff       /* Haupttext */
--text-secondary: #a1a1aa     /* Sekundärtext */
--text-tertiary: #71717a      /* Tertiärtext, Hints */
```

### Borders
```css
--border-subtle: #2a2a2d      /* Subtile Trennlinien */
--border-normal: #3a3a3d      /* Normale Borders */
```

### Status-Farben
```css
/* Erfolg */
bg-green-500/20, text-green-400

/* Fehler */
bg-red-500/10, border-red-500/20, text-red-400

/* Warnung */
bg-yellow-500/20, text-yellow-400

/* Info */
bg-blue-500/20, text-blue-400
```

---

## Typografie

### Schriftgrößen
```css
text-xs    /* 0.75rem / 12px - Hints, Labels */
text-sm    /* 0.875rem / 14px - Body, Buttons */
text-base  /* 1rem / 16px - Größerer Body */
text-lg    /* 1.125rem / 18px - Subheadings */
text-xl    /* 1.25rem / 20px - Headings */
text-2xl   /* 1.5rem / 24px - Große Headings */
```

### Font Weights
```css
font-normal   /* 400 - Body Text */
font-medium   /* 500 - Labels, Buttons */
font-semibold /* 600 - Headings */
font-bold     /* 700 - Wichtige Headings */
```

---

## Spacing

### Standard-Abstände
```css
p-1   /* 0.25rem / 4px */
p-2   /* 0.5rem / 8px */
p-3   /* 0.75rem / 12px */
p-4   /* 1rem / 16px */
p-6   /* 1.5rem / 24px */

gap-1, gap-2, gap-3, gap-4  /* Für Flex/Grid */
```

### Panel-Abstände
```css
/* Header */
h-10 px-4  /* 40px Höhe, 16px horizontal */
h-11 px-4  /* 44px Höhe, 16px horizontal */

/* Content */
p-4        /* 16px rundherum */
space-y-4  /* 16px zwischen Elementen */
```

---

## Border Radius

```css
rounded      /* 0.25rem / 4px - Kleine Elemente */
rounded-md   /* 0.375rem / 6px */
rounded-lg   /* 0.5rem / 8px - Buttons, Inputs */
rounded-xl   /* 0.75rem / 12px - Cards, Modals */
rounded-2xl  /* 1rem / 16px - Große Cards */
rounded-full /* 50% - Avatare, Badges */
```

---

## Schatten

```css
shadow-sm    /* Subtle shadow */
shadow       /* Default shadow */
shadow-lg    /* Dropdown shadows */
shadow-xl    /* Modal shadows */
shadow-2xl   /* Große Modals */
```

---

## Komponenten-Größen

### Buttons
```css
/* Small */
h-8 px-3 text-xs

/* Default */
h-10 px-4 text-sm

/* Large */
h-12 px-6 text-sm
```

### Inputs
```css
/* Default */
h-10 px-3 text-sm

/* Small */
h-8 px-2 text-xs
```

### Icons
```css
/* In Buttons/Small */
size={14}

/* Default */
size={16}

/* In Headers */
size={18}

/* Large/Standalone */
size={24}
```

---

## Animationen

### Verfügbare Animationen (in index.css)
```css
animate-fadeIn     /* Opacity 0 → 1, 150ms */
animate-scaleIn    /* Scale 0.95 → 1 + fadeIn, 150ms */
animate-slideDown  /* TranslateY -10px → 0, 150ms */
animate-spin       /* 360° Rotation, 1s linear */
animate-bounce     /* Bounce-Effekt */
animate-pulse      /* Pulse-Effekt */
```

### Transitions
```css
transition-all      /* Alle Properties */
transition-colors   /* Nur Farben */
transition-opacity  /* Nur Opacity */
transition-transform /* Nur Transform */

/* Dauer */
duration-150  /* 150ms - Schnell */
duration-200  /* 200ms - Default */
duration-300  /* 300ms - Langsam */
```

---

## Z-Index Hierarchie

```css
z-0    /* Base layer */
z-10   /* Erhöhte Elemente */
z-20   /* Dropdowns */
z-30   /* Sticky Headers */
z-40   /* Overlays */
z-50   /* Modals */
```

---

## Gradient-Patterns

### Primär-Gradient (Buttons)
```css
bg-gradient-to-r from-[var(--accent-turquoise)] to-[var(--accent-purple)]
```

### Pro-Gradient
```css
bg-gradient-to-r from-orange-500 to-pink-500
```

### Icon-Gradient
```css
bg-gradient-to-br from-[var(--accent-turquoise)] to-[var(--accent-purple)]
```

---

## Dark Mode

Die App ist **ausschließlich Dark Mode**. Alle Farben sind dafür optimiert.

Keine Light Mode Varianten nötig.

---

## Responsive Breakpoints

```css
sm:   /* 640px+ */
md:   /* 768px+ */
lg:   /* 1024px+ */
xl:   /* 1280px+ */
2xl:  /* 1536px+ */
```

**Hinweis:** Als Desktop-App sind Breakpoints selten nötig. Die App ist für ~1920x1080 optimiert.

---

## Provider-Farben (KI)

```css
/* OpenAI */
#10a37f (Grün)

/* Anthropic */
#d97706 (Orange)

/* Google Gemini */
#4285f4 (Blau)
```

Verwendung:
```jsx
<span 
  className="w-3 h-3 rounded-full" 
  style={{ backgroundColor: provider.color }}
/>
```
