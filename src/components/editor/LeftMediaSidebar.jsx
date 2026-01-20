/**
 * LeftMediaSidebar.jsx - Linke Sidebar mit Navigation (PIXELGENAU)
 * Breite: 200px (geändert von 220px)
 * Stil: Sehr dunkel, kompakte Navigation
 */

import React from 'react';
import Icon from './Icon';

export default function LeftMediaSidebar({ onBackToDashboard }) {
  return (
    <aside className="w-[200px] bg-[var(--bg-panel)] border-r border-[var(--border-subtle)] overflow-y-auto">
      <div className="p-3">
        {/* User Widget - Sehr kompakt */}
        <div className="mb-3 p-2.5 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-[var(--accent-purple)] flex items-center justify-center text-white text-xs font-medium">
              U
            </div>
            <div className="flex-1 text-sm text-[var(--text-secondary)]">User</div>
          </div>
          <button className="w-full h-6 px-2 bg-[var(--accent-purple)] text-white rounded text-xs font-medium hover:opacity-90 transition-all">
            Pro beitreten
          </button>
        </div>

        {/* Navigation - Kompakt */}
        <nav className="space-y-0.5">
          <button
            onClick={onBackToDashboard}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all"
          >
            <Icon name="home" size={16} strokeWidth={1.5} />
            <span>Startseite</span>
          </button>
          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all">
            <Icon name="templates" size={16} strokeWidth={1.5} />
            <span>Vorlagen</span>
          </button>
          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all">
            <Icon name="media" size={16} strokeWidth={1.5} />
            <span>Speicher</span>
          </button>
          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all">
            <Icon name="ai" size={16} strokeWidth={1.5} />
            <span>KI-Design</span>
          </button>
          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all">
            <Icon name="effects" size={16} strokeWidth={1.5} />
            <span>Mit KI erstellen</span>
          </button>
        </nav>
      </div>
    </aside>
  );
}
