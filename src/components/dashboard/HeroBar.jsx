/**
 * HeroBar.jsx - Hero CTA Bar mit 2 großen, gleich-breiten Buttons
 * 
 * Türkiser Hintergrund, zentrierter Container
 * Buttons nehmen volle Höhe des Hero-Balkens ein
 */

import React from 'react';

export default function HeroBar({ onNewProject, onEditProject }) {
  return (
    <div className="w-full flex gap-3">
      <button 
        onClick={onNewProject}
        className="flex-1 h-[72px] rounded-xl bg-[var(--accent-hero)] text-white font-semibold hover:opacity-90 transition focus:ring-2 focus:ring-offset-1 focus:ring-[var(--accent-hero)] text-base"
        aria-label="Neues Projekt erstellen"
      >
        Neues Projekt erstellen
      </button>
      
      <button 
        onClick={onEditProject}
        className="flex-1 h-[72px] rounded-xl bg-[var(--panel)] border border-[var(--border)] text-[var(--text)] font-semibold hover:bg-[var(--hover)] transition focus:ring-2 focus:ring-offset-1 focus:ring-[var(--accent-primary)] text-base"
        aria-label="Bestehendes Projekt bearbeiten"
      >
        Bestehendes Projekt bearbeiten
      </button>
    </div>
  );
}
