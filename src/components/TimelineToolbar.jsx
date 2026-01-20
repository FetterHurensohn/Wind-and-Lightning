/**
 * TimelineToolbar.jsx - Timeline Toolbar mit allen Buttons
 * 
 * Toolbar für Timeline-Operationen: Undo/Redo, Split, Delete, Link, Snap, Ripple, Zoom.
 * 
 * Props:
 * @param {Function} onUndo - Undo Callback
 * @param {Function} onRedo - Redo Callback
 * @param {boolean} canUndo - Kann Undo
 * @param {boolean} canRedo - Kann Redo
 * @param {Function} onSplit - Split at Playhead
 * @param {Function} onDelete - Delete selected
 * @param {Function} onToggleLink - Toggle Link/Unlink
 * @param {boolean} isLinked - Sind selected Clips linked
 * @param {Function} onToggleSnap - Toggle Snap
 * @param {boolean} snapping - Snap Status
 * @param {Function} onToggleRipple - Toggle Ripple Mode
 * @param {boolean} rippleMode - Ripple Status
 * @param {Function} onAddTrack - Add Track
 * @param {Function} onZoomIn - Zoom In
 * @param {Function} onZoomOut - Zoom Out
 * @param {Function} onFitToView - Fit to View
 * @param {boolean} hasSelection - Sind Clips ausgewählt
 */

import React, { useState } from 'react';

export default function TimelineToolbar({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSplit,
  onDelete,
  onToggleLink,
  isLinked,
  onToggleSnap,
  snapping,
  onToggleRipple,
  rippleMode,
  onAddTrack,
  onZoomIn,
  onZoomOut,
  onFitToView,
  hasSelection
}) {
  const [showAddTrackMenu, setShowAddTrackMenu] = useState(false);

  return (
    <div className="h-10 bg-panel border-b border-muted/20 flex items-center px-2 gap-1 relative z-30">
      {/* Undo/Redo Group */}
      <ToolbarButton
        icon="↶"
        tooltip="Rückgängig (Strg+Z)"
        onClick={onUndo}
        disabled={!canUndo}
        ariaLabel="Rückgängig"
      />
      <ToolbarButton
        icon="↷"
        tooltip="Wiederholen (Strg+Umschalt+Z)"
        onClick={onRedo}
        disabled={!canRedo}
        ariaLabel="Wiederholen"
      />

      <Divider />

      {/* Edit Group */}
      <ToolbarButton
        icon="✂️"
        tooltip="An Playhead teilen (Strg+K)"
        onClick={onSplit}
        disabled={!hasSelection}
        ariaLabel="Teilen"
      />
      <ToolbarButton
        icon="🗑️"
        tooltip="Löschen (Entf)"
        onClick={onDelete}
        disabled={!hasSelection}
        ariaLabel="Löschen"
      />
      <ToolbarButton
        icon="🔗"
        tooltip="Verknüpfen/Trennen"
        onClick={onToggleLink}
        disabled={!hasSelection}
        pressed={isLinked}
        ariaLabel="Verknüpfen"
      />

      <Divider />

      {/* Mode Group */}
      <ToolbarButton
        icon="🧲"
        tooltip="Einrasten (S)"
        onClick={onToggleSnap}
        pressed={snapping}
        ariaLabel="Einrasten"
      />
      <ToolbarButton
        icon="↔️"
        tooltip="Ripple-Modus"
        onClick={onToggleRipple}
        pressed={rippleMode}
        ariaLabel="Ripple-Modus"
      />

      <Divider />

      {/* Add Track */}
      <div className="relative">
        <ToolbarButton
          icon="➕"
          tooltip="Spur hinzufügen"
          onClick={() => setShowAddTrackMenu(!showAddTrackMenu)}
          ariaLabel="Spur hinzufügen"
        />
        {showAddTrackMenu && (
          <div className="absolute top-full left-0 mt-1 bg-panel border border-muted/20 rounded shadow-lg z-50 min-w-[120px]">
            <button
              onClick={() => {
                onAddTrack('video');
                setShowAddTrackMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-13 hover:bg-surface text-white"
            >
              🎥 Video-Spur
            </button>
            <button
              onClick={() => {
                onAddTrack('audio');
                setShowAddTrackMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-13 hover:bg-surface text-white"
            >
              🎵 Audio-Spur
            </button>
          </div>
        )}
      </div>

      <Divider />

      {/* Zoom Group */}
      <ToolbarButton
        icon="🔍−"
        tooltip="Verkleinern (Strg+-)"
        onClick={onZoomOut}
        ariaLabel="Verkleinern"
      />
      <ToolbarButton
        icon="🔍+"
        tooltip="Vergrößern (Strg++)"
        onClick={onZoomIn}
        ariaLabel="Vergrößern"
      />
      <ToolbarButton
        icon="⬌"
        tooltip="An Ansicht anpassen"
        onClick={onFitToView}
        ariaLabel="An Ansicht anpassen"
      />

      {/* Ripple Mode Indicator */}
      {rippleMode && (
        <div className="ml-auto px-2 py-1 bg-yellow-500/20 text-yellow-500 text-12 rounded flex items-center gap-1">
          <span>↔️</span>
          <span>Ripple aktiv</span>
        </div>
      )}
    </div>
  );
}

/**
 * Toolbar Button Component
 */
function ToolbarButton({ icon, tooltip, onClick, disabled = false, pressed = false, ariaLabel }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || tooltip}
      aria-pressed={pressed}
      title={tooltip}
      className={`
        h-8 px-2 rounded text-[16px] transition-colors
        ${disabled 
          ? 'text-muted/30 cursor-not-allowed' 
          : pressed
          ? 'bg-accent text-white'
          : 'text-muted hover:text-white hover:bg-surface'
        }
        focus:outline-none focus:ring-2 focus:ring-accent
      `}
    >
      {icon}
    </button>
  );
}

/**
 * Divider Component
 */
function Divider() {
  return <div className="w-px h-6 bg-muted/20" />;
}
