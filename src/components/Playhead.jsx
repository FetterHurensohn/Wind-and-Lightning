/**
 * Playhead.jsx - Timeline Playhead
 * 
 * Separierte Playhead-Komponente mit Drag-Support.
 * 
 * Props:
 * @param {number} currentTime - Aktuelle Zeit in Sekunden
 * @param {number} pxPerSec - Pixel pro Sekunde
 * @param {Function} onSeek - Callback beim Seek (time)
 * @param {boolean} playing - Ist Wiedergabe aktiv
 */

import React from 'react';
import { useDrag } from '../hooks/useDrag';

export default function Playhead({ currentTime, pxPerSec, onSeek, playing }) {
  const leftPosition = currentTime * pxPerSec;

  const drag = useDrag({
    onDragStart: () => {
      // Optional: Pause während Drag
    },
    onDragMove: (event, delta) => {
      const newTime = Math.max(0, (leftPosition + delta.x) / pxPerSec);
      if (onSeek) {
        onSeek(newTime);
      }
    },
    onDragEnd: () => {
      // Optional: Resume
    }
  });

  return (
    <div
      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none"
      style={{
        left: `${leftPosition}px`,
        boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)'
      }}
    >
      {/* Playhead Handle */}
      <div
        {...drag.handlers}
        className="absolute -top-1 -left-2 w-4 h-4 bg-red-500 rounded-sm cursor-grab pointer-events-auto hover:scale-110 transition-transform"
        style={{ cursor: drag.isDragging ? 'grabbing' : 'grab' }}
        aria-label="Playhead"
        role="slider"
        aria-valuemin={0}
        aria-valuenow={currentTime}
        tabIndex={0}
      />

      {/* REC Indicator während Playback */}
      {playing && (
        <div className="absolute -top-6 -left-8 px-2 py-1 bg-red-600 text-white text-xs rounded flex items-center gap-1 pointer-events-none">
          <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
          REC
        </div>
      )}
    </div>
  );
}
