/**
 * TopToolbar.jsx - CapCut-Style Obere Toolbar
 * 
 * Struktur nach CapCut Screenshots:
 * - Logo + Menü links
 * - Kategorien-Icons in der Mitte
 * - Projekt-Name und Actions rechts
 */

import React, { useState } from 'react';
import { useEditor } from './EditorLayout';
import Icon from './Icon';

// Kategorie-Konfiguration mit Icons
const CATEGORIES = [
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

export default function TopToolbar({ onBackToDashboard, onExport }) {
  const { state, dispatch, saveProject, handleSaveAndExit, activeMainTab, setActiveMainTab, setShowExportDialog } = useEditor();
  const [editingName, setEditingName] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveProject(true);
    } catch (error) {
      console.error('Save error:', error);
    }
    setSaving(false);
  };

  const handleExportClick = () => {
    if (onExport) {
      onExport();
    } else if (setShowExportDialog) {
      setShowExportDialog(true);
    }
  };

  return (
    <header className="h-12 bg-[var(--bg-panel)] border-b border-[var(--border-subtle)] flex items-center px-3">
      {/* Left: Logo + Menu */}
      <div className="flex items-center gap-2 mr-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[var(--accent-turquoise)] rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">✂</span>
          </div>
          <span className="text-sm font-semibold text-[var(--text-primary)]">CapCut</span>
        </div>
        
        {/* Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="h-7 px-2 flex items-center gap-1 text-sm text-[var(--accent-turquoise)] hover:bg-[var(--bg-hover)] rounded"
          >
            Menü
            <Icon name="chevronDown" size={12} />
          </button>
          
          {showMenu && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg shadow-xl z-50">
              <button 
                onClick={() => { handleSave(); setShowMenu(false); }}
                className="w-full h-9 px-3 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center gap-2"
              >
                <Icon name="save" size={16} /> Speichern
              </button>
              <button 
                onClick={() => { handleExportClick(); setShowMenu(false); }}
                className="w-full h-9 px-3 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center gap-2"
              >
                <Icon name="export" size={16} /> Exportieren
              </button>
              <div className="border-t border-[var(--border-subtle)] my-1" />
              <button 
                onClick={() => { onBackToDashboard?.(); setShowMenu(false); }}
                className="w-full h-9 px-3 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center gap-2"
              >
                <Icon name="home" size={16} /> Zum Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Center: Category Icons */}
      <div className="flex-1 flex items-center justify-center gap-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveMainTab(cat.id)}
            className={`
              flex flex-col items-center justify-center px-2 py-1 rounded transition-colors min-w-[52px]
              ${activeMainTab === cat.id
                ? 'text-[var(--accent-turquoise)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}
            `}
            title={cat.name}
          >
            <Icon name={cat.icon} size={20} strokeWidth={1.5} />
            <span className="text-[10px] mt-0.5">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Right: Project Name + Actions */}
      <div className="flex items-center gap-2">
        {/* Project Name */}
        {editingName ? (
          <input
            type="text"
            value={state.projectName}
            onChange={(e) => dispatch({ type: 'SET_PROJECT_NAME', payload: e.target.value })}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
            className="w-24 h-7 px-2 bg-[var(--bg-surface)] border border-[var(--accent-turquoise)] rounded text-sm text-center"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="h-7 px-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded"
          >
            {state.projectName} (1)
          </button>
        )}

        {/* Player Button */}
        <button className="h-7 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          Player
        </button>
        
        {/* Export Button - Prominent */}
        <button 
          onClick={handleExportClick}
          className="h-8 px-4 bg-[var(--accent-turquoise)] hover:bg-[var(--accent-turquoise-hover)] rounded-lg text-sm font-medium text-white flex items-center gap-2 transition-colors"
          data-testid="export-button"
        >
          <Icon name="export" size={16} />
          Exportieren
        </button>
      </div>
    </header>
  );
}
