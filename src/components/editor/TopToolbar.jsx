/**
 * TopToolbar.jsx - Obere Icon-Leiste (PIXELGENAU nach Screenshot)
 * 
 * Zweck: Toolbar mit Kategorien und Projekt-Buttons nach CapCut-Screenshot
 * Höhe: 44px (h-11) - GEÄNDERT von 48px
 * Icons: 20px outline-style mit stroke-width 1.5
 * Spacing: Sehr kompakt (gap-1)
 * 
 * Buttons: Medien, Audio, Text, Sticker, Effekte, Übergänge, Untertitel, Filter, Anpassung, Vorlagen, KI-Avatar
 * Rechts: Projektname (editierbar, 11px, medium), "Teilen", "Pro", "Exportieren" (turquoise)
 */

import React, { useState } from 'react';
import { useEditor } from './EditorLayout';
import Icon from './Icon';
import SmallButton from './SmallButton';
import { projectAPI } from '../../electron';

const categories = [
  { id: 'media', name: 'Medien', icon: 'media' },
  { id: 'audio', name: 'Audio', icon: 'audio' },
  { id: 'text', name: 'Text', icon: 'text' },
  { id: 'sticker', name: 'Sticker', icon: 'sticker' },
  { id: 'effects', name: 'Effekte', icon: 'effects' },
  { id: 'transitions', name: 'Übergänge', icon: 'transitions' },
  { id: 'subtitles', name: 'Untertitel', icon: 'subtitles' },
  { id: 'filter', name: 'Filter', icon: 'filter' },
  { id: 'adjustment', name: 'Anpassung', icon: 'adjustment' },
  { id: 'templates', name: 'Vorlagen', icon: 'templates' },
  { id: 'ai', name: 'KI-Avatar', icon: 'ai' }
];

export default function TopToolbar({ onBackToDashboard }) {
  const { state, dispatch, saveProject, handleSaveAndExit: contextSaveAndExit, activeMainTab, setActiveMainTab } = useEditor();
  const [editingName, setEditingName] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await saveProject(true);
      if (success) {
        console.log('✅ Project saved successfully!');
      }
    } catch (error) {
      console.error('❌ Save error:', error);
      alert('Fehler beim Speichern: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndExit = async () => {
    setSaving(true);
    try {
      if (contextSaveAndExit) {
        await contextSaveAndExit();
      } else {
        await handleSave();
        if (onBackToDashboard) {
          onBackToDashboard();
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    console.log('Export clicked');
    // TODO: Implement export dialog
  };

  return (
    <header className="h-11 bg-[var(--bg-panel)] border-b border-[var(--border-subtle)] flex items-center px-3 gap-3">
      {/* Left: Category Icons - Sehr kompakt */}
      <div className="flex items-center gap-1">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveMainTab(cat.id)}
            className={`
              w-8 h-8 flex items-center justify-center rounded
              transition-colors
              ${activeMainTab === cat.id
                ? 'bg-[var(--bg-hover)] text-[var(--capcut-accent-turquoise)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}
              focus:outline-none
            `}
            title={cat.name}
            aria-label={cat.name}
          >
            <Icon name={cat.icon} size={20} strokeWidth={1.5} />
          </button>
        ))}
      </div>

      {/* Center: Project Name - 11px, Medium */}
      <div className="flex-1 flex justify-center">
        {editingName ? (
          <input
            type="text"
            value={state.projectName}
            onChange={(e) => dispatch({ type: 'SET_PROJECT_NAME', payload: e.target.value })}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
            className="px-2 py-0.5 bg-[var(--bg-surface)] border border-[var(--accent-blue)] rounded text-sm text-center focus:outline-none text-[var(--text-primary)]"
            style={{ fontSize: '11px' }}
            autoFocus
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="px-2 py-0.5 rounded hover:bg-[var(--bg-hover)] transition-colors font-medium text-[var(--text-primary)]"
            style={{ fontSize: '11px' }}
          >
            {state.projectName}
          </button>
        )}
      </div>

      {/* Right: Action Buttons - Kompakt */}
      <div className="flex items-center gap-1.5">
        <SmallButton
          label={saving ? "Speichert..." : "Speichern"}
          variant="default"
          size="sm"
          onClick={handleSave}
          disabled={saving}
        />
        <SmallButton
          label="Speichern und Beenden"
          variant="default"
          size="sm"
          onClick={handleSaveAndExit}
          disabled={saving}
        />
        <SmallButton
          label="Teilen"
          variant="default"
          size="sm"
        />
        <SmallButton
          label="Pro"
          variant="primary"
          size="sm"
        />
        <SmallButton
          label="Exportieren"
          variant="turquoise"
          size="sm"
          onClick={handleExport}
        />
      </div>
    </header>
  );
}
