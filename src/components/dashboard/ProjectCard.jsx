/**
 * ProjectCard.jsx - Individual Project Card
 * 
 * Thumbnail (16:9), Name, Size | Duration
 * Interactions: Click, Double-Click, Right-Click, Hover Actions
 * 
 * Annahme: Thumbnails sind Placeholders (gradient background)
 */

import React, { useState } from 'react';
import { StarIcon, StarFilledIcon, DuplicateIcon, PencilIcon, TrashIcon } from '../../icons';

export default function ProjectCard({ 
  project, 
  selected,
  viewMode = 'grid',
  onSelect,
  onOpen,
  onDuplicate,
  onRename,
  onDelete
}) {
  const [hovered, setHovered] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(project.name);

  const handleClick = (e) => {
    const multiSelect = e.ctrlKey || e.metaKey;
    onSelect(project.id, multiSelect);
  };

  const handleDoubleClick = () => {
    onOpen(project.id);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    // Show context menu (can be enhanced with actual context menu component)
    const action = confirm(`Projekt "${project.name}" - Aktionen:\n1. Öffnen\n2. Umbenennen\n3. Duplizieren\n4. Löschen\n\n(OK = Öffnen, Abbrechen = Abbruch)`);
    if (action) {
      onOpen(project.id);
    }
  };

  const handleRename = () => {
    setRenaming(true);
  };

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    if (newName.trim() && newName !== project.name) {
      onRename(project.id, newName.trim());
    }
    setRenaming(false);
  };

  const handleRenameCancel = () => {
    setNewName(project.name);
    setRenaming(false);
  };

  // Grid View
  if (viewMode === 'grid') {
    return (
      <div
        className={`
          group relative rounded-xl overflow-hidden cursor-pointer transition
          ${selected 
            ? 'ring-2 ring-[var(--accent-primary)] ring-offset-1 ring-offset-[var(--bg)]' 
            : 'hover:ring-1 hover:ring-[var(--border)]'
          }
        `}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Thumbnail */}
        <div className="relative aspect-[16/9] bg-gradient-to-br from-[var(--accent-pro)] to-[var(--accent-primary)] flex items-center justify-center">
          {/* Placeholder icon/image */}
          <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>

          {/* Hover Actions Overlay */}
          {hovered && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 animate-fadeIn">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Toggle favorite (would call onToggleFavorite if implemented)
                }}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
                aria-label="Favorit"
              >
                {project.favorited ? (
                  <StarFilledIcon className="w-4 h-4 text-yellow-400" />
                ) : (
                  <StarIcon className="w-4 h-4 text-white" />
                )}
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(project.id);
                }}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
                aria-label="Duplizieren"
              >
                <DuplicateIcon className="w-4 h-4 text-white" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRename();
                }}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
                aria-label="Umbenennen"
              >
                <PencilIcon className="w-4 h-4 text-white" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(project.id);
                }}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-red-500/80 flex items-center justify-center transition"
                aria-label="Löschen"
              >
                <TrashIcon className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-[var(--panel)] p-2">
          {renaming ? (
            <form onSubmit={handleRenameSubmit} className="flex gap-1">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRenameCancel}
                onKeyDown={(e) => e.key === 'Escape' && handleRenameCancel()}
                className="flex-1 px-2 py-1 text-xs bg-[var(--card)] border border-[var(--accent-primary)] rounded text-[var(--text)] focus:outline-none"
                autoFocus
                maxLength={30}
              />
            </form>
          ) : (
            <>
              <div className="text-sm font-medium text-[var(--text)] truncate" title={project.name}>
                {project.name}
              </div>
              <div className="text-xs text-[var(--muted)] mt-0.5">
                {project.size} | {project.duration}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // List View
  return (
    <div
      className={`
        flex items-center gap-4 p-3 rounded-lg cursor-pointer transition
        ${selected 
          ? 'bg-[var(--hover)] ring-1 ring-[var(--accent-primary)]' 
          : 'hover:bg-[var(--hover)]'
        }
      `}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      {/* Thumbnail */}
      <div className="w-24 h-14 rounded bg-gradient-to-br from-[var(--accent-pro)] to-[var(--accent-primary)] flex-shrink-0" />
      
      {/* Info */}
      <div className="flex-1">
        <div className="text-sm font-medium text-[var(--text)]">{project.name}</div>
        <div className="text-xs text-[var(--muted)] mt-1">
          {project.size} • {project.duration} • {project.resolution} • {project.fps}fps
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(project.id);
          }}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--panel)] transition"
          aria-label="Duplizieren"
        >
          <DuplicateIcon className="w-4 h-4 text-[var(--muted)]" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(project.id);
          }}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--panel)] hover:text-red-500 transition"
          aria-label="Löschen"
        >
          <TrashIcon className="w-4 h-4 text-[var(--muted)]" />
        </button>
      </div>
    </div>
  );
}
