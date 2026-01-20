/**
 * ProjectsHeader.jsx - Projects Section Header
 * 
 * Search, View Mode Toggle, Actions (Papierkorb, Sync)
 */

import React, { useState } from 'react';
import { SearchIcon, GridIcon, ListIcon, TrashIcon, SyncIcon } from '../../icons';

export default function ProjectsHeader({ 
  projectCount, 
  searchQuery, 
  onSearchChange, 
  viewMode, 
  onViewModeChange,
  selectedCount,
  onDeleteSelected
}) {
  const [searchFocused, setSearchFocused] = useState(false);

  // Debounced search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    // Simple immediate update (debouncing can be added if needed)
    onSearchChange(value);
  };

  return (
    <div className="flex items-center justify-between mb-4">
      {/* Title */}
      <h2 className="text-lg font-semibold text-[var(--text)]">
        Projekte ({projectCount})
      </h2>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className={`
          relative flex items-center
          ${searchFocused ? 'ring-2 ring-[var(--accent-primary)] ring-offset-1' : ''}
        `}>
          <SearchIcon className="w-4 h-4 text-[var(--muted)] absolute left-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Suchen..."
            className="
              w-64 h-9 pl-9 pr-3 rounded-lg 
              bg-[var(--panel)] border border-[var(--border)]
              text-sm text-[var(--text)] placeholder-[var(--muted)]
              focus:outline-none transition
            "
            aria-label="Projekte durchsuchen"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--panel)] border border-[var(--border)]">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`
              w-8 h-8 flex items-center justify-center rounded
              ${viewMode === 'grid' 
                ? 'bg-[var(--hover)] text-[var(--text)]' 
                : 'text-[var(--muted)] hover:text-[var(--text)]'
              }
            `}
            aria-label="Grid-Ansicht"
            aria-pressed={viewMode === 'grid'}
          >
            <GridIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`
              w-8 h-8 flex items-center justify-center rounded
              ${viewMode === 'list' 
                ? 'bg-[var(--hover)] text-[var(--text)]' 
                : 'text-[var(--muted)] hover:text-[var(--text)]'
              }
            `}
            aria-label="Listen-Ansicht"
            aria-pressed={viewMode === 'list'}
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Delete Selected (only show if items selected) */}
        {selectedCount > 0 && (
          <button
            onClick={onDeleteSelected}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-[var(--panel)] border border-[var(--border)] text-[var(--muted)] hover:text-red-500 hover:border-red-500/50 transition"
            aria-label={`${selectedCount} ausgewählte Projekte löschen`}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        )}

        {/* Papierkorb */}
        <button
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-[var(--panel)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] transition"
          aria-label="Papierkorb"
        >
          <TrashIcon className="w-4 h-4" />
        </button>

        {/* Projektsynchronisierung */}
        <button
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-[var(--panel)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] transition hover:rotate-180"
          aria-label="Projektsynchronisierung"
        >
          <SyncIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
