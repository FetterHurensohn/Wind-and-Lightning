/**
 * ProBadge-Komponente
 * 
 * Kleines "Pro"-Label für Premium-Features.
 * Wird typischerweise absolut positioniert auf einem Parent-Element.
 * 
 * Props:
 * @param {string} text - Badge-Text (default: "Pro")
 * @param {string} className - Zusätzliche CSS-Klassen
 */

import React from 'react';

export default function ProBadge({ 
  text = 'Pro',
  className = ''
}) {
  return (
    <span 
      className={`
        inline-flex items-center justify-center
        text-[10px] font-semibold
        px-1.5 py-0.5
        rounded-full
        bg-[var(--accent-2)] text-white
        shadow-sm
        ${className}
      `}
      aria-label="Premium-Feature"
    >
      {text}
    </span>
  );
}
