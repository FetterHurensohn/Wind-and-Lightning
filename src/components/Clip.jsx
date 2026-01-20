/**
 * Clip-Komponente
 * 
 * Ein Clip auf der Timeline mit Drag, Trim und Selection.
 * 
 * Props:
 * @param {Object} clip - Clip-Daten
 * @param {Object} track - Track-Daten
 * @param {number} pxPerSec - Pixel pro Sekunde
 * @param {boolean} selected - Ist ausgewählt
 * @param {boolean} snapping - Snap-to-Grid
 * @param {Function} onMove - Callback beim Move
 * @param {Function} onTrim - Callback beim Trim
 * @param {Function} onSelect - Callback bei Auswahl
 * @param {Function} onContextMenu - Callback für Kontext-Menü
 */

import React, { useState, useRef, useEffect } from 'react';
import { useDrag } from '../hooks/useDrag';

export default function Clip({
  clip,
  track,
  pxPerSec,
  selected,
  snapping,
  onMove,
  onTrim,
  onSelect,
  onContextMenu
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isTrimming, setIsTrimming] = useState(false);
  const clipRef = useRef(null);

  const left = clip.start * pxPerSec;
  const width = clip.duration * pxPerSec;

  const handleClick = (e) => {
    if (e.target === clipRef.current) {
      e.stopPropagation();
      onSelect?.(clip.id);
    }
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    // Could open clip properties
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu?.(clip, { x: e.clientX, y: e.clientY });
  };

  return (
    <div
      ref={clipRef}
      className={`
        absolute top-2 bottom-2 rounded overflow-hidden cursor-pointer
        bg-surface border transition-all
        ${selected 
          ? 'border-accent ring-2 ring-accent ring-offset-1 ring-offset-surface' 
          : 'border-muted/20 hover:border-muted/40'
        }
        ${isDragging || isTrimming ? 'cursor-grabbing' : ''}
      `}
      style={{ left: `${left}px`, width: `${width}px` }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      {/* Thumbnail */}
      <div className="absolute top-0 left-0 w-12 h-full bg-panel flex-shrink-0">
        <div className="w-full h-full flex items-center justify-center text-muted text-xs">
          🎬
        </div>
      </div>
      
      {/* Title */}
      <div className="absolute top-1 left-14 right-2 text-white text-sm truncate">
        {clip.title}
      </div>
      
      {/* Duration Badge */}
      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-white text-xs">
        {clip.duration.toFixed(1)}s
      </div>
      
      {/* Trim Handles */}
      {selected && (
        <>
          <div 
            className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent cursor-ew-resize hover:w-2"
            onMouseDown={(e) => {
              e.stopPropagation();
              setIsTrimming(true);
              // TODO: Implement trim left
            }}
          />
          <div 
            className="absolute right-0 top-0 bottom-0 w-1.5 bg-accent cursor-ew-resize hover:w-2"
            onMouseDown={(e) => {
              e.stopPropagation();
              setIsTrimming(true);
              // TODO: Implement trim right
            }}
          />
        </>
      )}
    </div>
  );
}
