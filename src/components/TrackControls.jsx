/**
 * TrackControls.jsx - Track Header Controls
 * 
 * Linke Track-Header mit Mute/Solo/Lock/Height Controls.
 * 
 * Props:
 * @param {Object} track - Track-Objekt
 * @param {Object} trackControls - Track Controls State { muted, solo, locked, height }
 * @param {Function} onToggleMute - Toggle Mute
 * @param {Function} onToggleSolo - Toggle Solo
 * @param {Function} onToggleLock - Toggle Lock
 * @param {Function} onSetHeight - Set Height
 * @param {Function} onRename - Rename Track
 */

import React, { useState, useRef } from 'react';

export default function TrackControls({
  track,
  trackControls = {},
  onToggleMute,
  onToggleSolo,
  onToggleLock,
  onSetHeight,
  onRename
}) {
  // Null safety - Falls track undefined ist, früh returnen
  if (!track) {
    return <div className="w-[140px] bg-panel border-r border-muted/20" />;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(track.name || 'Track');
  const [isResizing, setIsResizing] = useState(false);
  const inputRef = useRef(null);

  const handleNameClick = () => {
    setIsEditing(true);
    setEditValue(track?.name || 'Track');
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleNameBlur = () => {
    setIsEditing(false);
    if (editValue.trim() && editValue !== track?.name && onRename) {
      onRename(track.id, editValue.trim());
    }
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    } else if (e.key === 'Escape') {
      setEditValue(track?.name || 'Track');
      setIsEditing(false);
    }
  };

  const handleHeightResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startY = e.clientY;
    const startHeight = trackControls.height || 80;

    const handleMove = (moveEvent) => {
      const delta = moveEvent.clientY - startY;
      const newHeight = Math.max(40, Math.min(300, startHeight + delta));
      if (onSetHeight && track?.id) {
        onSetHeight(track.id, newHeight);
      }
    };

    const handleUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  };

  return (
    <div 
      className="flex flex-col bg-panel border-r border-muted/20"
      style={{ width: '140px' }}
    >
      {/* Track Name */}
      <div className="px-2 py-2 border-b border-muted/20">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            className="w-full text-13 px-1 py-0.5 bg-surface border border-accent rounded text-white focus:outline-none"
          />
        ) : (
          <button
            onClick={handleNameClick}
            className="w-full text-left text-13 text-white hover:bg-surface/50 px-1 py-0.5 rounded truncate"
          >
            {track?.name || 'Track'}
          </button>
        )}
      </div>

      {/* Controls Row */}
      <div className="flex items-center gap-1 px-2 py-1.5">
        {/* Mute Button */}
        <button
          onClick={() => onToggleMute && track?.id && onToggleMute(track.id)}
          aria-label="Stumm"
          aria-pressed={trackControls.muted}
          className={`
            w-7 h-7 rounded text-11 font-bold transition-colors
            ${trackControls.muted 
              ? 'bg-red-500 text-white' 
              : 'bg-surface text-muted hover:text-white'
            }
          `}
          title="Stumm (M)"
        >
          M
        </button>

        {/* Solo Button */}
        <button
          onClick={() => onToggleSolo && track?.id && onToggleSolo(track.id)}
          aria-label="Solo"
          aria-pressed={trackControls.solo}
          className={`
            w-7 h-7 rounded text-11 font-bold transition-colors
            ${trackControls.solo 
              ? 'bg-yellow-500 text-black' 
              : 'bg-surface text-muted hover:text-white'
            }
          `}
          title="Solo (S)"
        >
          S
        </button>

        {/* Lock Button */}
        <button
          onClick={() => onToggleLock && track?.id && onToggleLock(track.id)}
          aria-label="Sperren"
          aria-pressed={trackControls.locked}
          className={`
            w-7 h-7 rounded text-11 transition-colors flex items-center justify-center
            ${trackControls.locked 
              ? 'bg-accent text-white' 
              : 'bg-surface text-muted hover:text-white'
            }
          `}
          title="Sperren (L)"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            {trackControls.locked ? (
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z" />
            ) : (
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h2c0-1.66 1.34-3 3-3s3 1.34 3 3v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
            )}
          </svg>
        </button>
      </div>

      {/* Track Type Indicator */}
      <div className="px-2 py-1 text-12 text-muted">
        {track?.type === 'video' ? '🎥 Video' : '🎵 Audio'}
      </div>

      {/* Height Resize Handle */}
      <div
        onMouseDown={handleHeightResizeStart}
        className={`
          h-1.5 cursor-ns-resize hover:bg-accent transition-colors mt-auto
          ${isResizing ? 'bg-accent' : 'bg-transparent'}
        `}
        title="Höhe anpassen"
      />
    </div>
  );
}
