/**
 * TopBar-Komponente
 * 
 * Obere Toolbar mit Icons, editierbarem Projektnamen und Actions.
 * 
 * Props:
 * @param {string} projectName - Aktueller Projektname
 * @param {Function} onRename - Callback beim Umbenennen (newName)
 * @param {Function} onImport - Callback für Import
 * @param {Function} onExport - Callback für Export
 * @param {Function} onShare - Callback für Share
 * @param {Function} onZoomIn - Callback für Zoom In
 * @param {Function} onZoomOut - Callback für Zoom Out
 */

import React, { useState, useRef, useEffect } from 'react';

const TOOLBAR_ITEMS = [
  { id: 'medien', name: 'Medien', icon: '📁' },
  { id: 'audio', name: 'Audio', icon: '🎵' },
  { id: 'text', name: 'Text', icon: '📝' },
  { id: 'sticker', name: 'Sticker', icon: '🎨' },
  { id: 'effekte', name: 'Effekte', icon: '✨' },
  { id: 'uebergaenge', name: 'Übergänge', icon: '🔄' },
  { id: 'untertitel', name: 'Untertitel', icon: '💬' },
  { id: 'filter', name: 'Filter', icon: '🎭' },
  { id: 'anpassung', name: 'Anpassung', icon: '⚙️' },
  { id: 'vorlagen', name: 'Vorlagen', icon: '📋' },
  { id: 'ki-avatar', name: 'KI-Avatar', icon: '🤖' }
];

export default function TopBar({
  projectName = '0117',
  onRename,
  onImport,
  onExport,
  onShare,
  onZoomIn,
  onZoomOut
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(projectName);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleNameClick = () => {
    setIsEditing(true);
    setEditValue(projectName);
  };

  const handleNameBlur = () => {
    setIsEditing(false);
    if (editValue.trim() && editValue !== projectName && onRename) {
      onRename(editValue.trim());
    } else {
      setEditValue(projectName);
    }
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    } else if (e.key === 'Escape') {
      setEditValue(projectName);
      setIsEditing(false);
    }
  };

  return (
    <div className="h-14 bg-panel border-b border-muted/20 flex items-center justify-between px-4">
      {/* Left: Toolbar Icons */}
      <div className="flex items-center gap-1">
        {TOOLBAR_ITEMS.map(item => (
          <button
            key={item.id}
            className="px-3 py-2 rounded hover:bg-surface transition-colors text-muted hover:text-white text-xs flex flex-col items-center gap-0.5 min-w-[60px]"
            title={item.name}
            aria-label={item.name}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-[10px]">{item.name}</span>
          </button>
        ))}
      </div>

      {/* Center: Project Name */}
      <div className="flex-shrink-0">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            className="px-3 py-1 bg-surface border border-accent rounded text-white text-sm text-center focus:outline-none min-w-[100px]"
          />
        ) : (
          <button
            onClick={handleNameClick}
            className="px-3 py-1 rounded hover:bg-surface transition-colors text-white text-sm font-medium"
            aria-label="Projektname bearbeiten"
          >
            {projectName}
          </button>
        )}
      </div>

      {/* Right: Actions + Zoom */}
      <div className="flex items-center gap-2">
        {/* Zoom Controls */}
        <div className="flex items-center gap-1 border-r border-muted/20 pr-2 mr-2">
          <button
            onClick={onZoomOut}
            className="p-2 rounded hover:bg-surface transition-colors text-muted hover:text-white"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          <button
            onClick={onZoomIn}
            className="p-2 rounded hover:bg-surface transition-colors text-muted hover:text-white"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </button>
        </div>

        {/* Share Button */}
        <button
          onClick={onShare}
          className="px-4 py-2 rounded bg-surface hover:bg-surface/80 text-white text-sm font-medium transition-colors"
        >
          Teilen
        </button>

        {/* Export Button */}
        <button
          onClick={onExport}
          className="px-4 py-2 rounded bg-accent hover:bg-accent/80 text-white text-sm font-medium transition-colors"
        >
          Exportieren
        </button>
      </div>
    </div>
  );
}
