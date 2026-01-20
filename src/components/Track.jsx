/**
 * Track-Komponente
 * 
 * Zeigt eine einzelne Spur mit Clips.
 * 
 * Props:
 * @param {Object} track - Track-Daten
 * @param {number} trackIndex - Index des Tracks
 * @param {number} pxPerSec - Pixel pro Sekunde
 * @param {string} selectedClipId - ID des ausgewählten Clips
 * @param {boolean} snapping - Snap-to-Grid aktiv
 * @param {Function} onMoveClip - Callback beim Clip-Move
 * @param {Function} onTrimClip - Callback beim Trim
 * @param {Function} onSelectClip - Callback bei Clip-Auswahl
 * @param {Function} onOpenClipContext - Callback für Kontext-Menü
 */

import React from 'react';
import Clip from './Clip';
import TrackControls from './TrackControls';

export default function Track({
  track,
  trackIndex,
  pxPerSec,
  selectedClipId,
  snapping,
  onMoveClip,
  onTrimClip,
  onSelectClip,
  onOpenClipContext,
  onToggleMute,
  onToggleSolo,
  onToggleLock,
  trackControls = { muted: false, solo: false, locked: false }
}) {
  return (
    <div 
      className="flex border-b border-border"
      style={{ height: '80px' }}
    >
      {/* Track Controls (links) */}
      <TrackControls
        track={track}
        trackIndex={trackIndex}
        controls={trackControls}
        onToggleMute={onToggleMute}
        onToggleSolo={onToggleSolo}
        onToggleLock={onToggleLock}
      />

      {/* Clip Lane (rechts, scrollbar) */}
      <div className="flex-1 relative bg-surface overflow-x-auto">
        {track?.clips?.length > 0 ? (
          // Clips anzeigen
          track.clips.map((clip) => (
            <Clip
              key={clip.id}
              clip={clip}
              track={track}
              pxPerSec={pxPerSec}
              selected={selectedClipId === clip.id}
              snapping={snapping}
              onMove={onMoveClip}
              onTrim={onTrimClip}
              onSelect={onSelectClip}
              onContextMenu={onOpenClipContext}
            />
          ))
        ) : (
          // Empty State - Hellgrauer Streifen mit Text
          <div className="h-full flex items-center">
            <div 
              className="h-12 bg-[#3a3a3a] rounded flex items-center px-4 text-[var(--text-tertiary)] text-sm"
              style={{ 
                width: 'calc(100% - 32px)',
                marginLeft: '16px',
                border: '1px dashed var(--border-subtle)'
              }}
            >
              Ziehe Elemente hierher und beginne mit dem Erstellen
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
