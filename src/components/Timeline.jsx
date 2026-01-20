/**
 * Timeline-Komponente
 * 
 * Haupttimeline mit Time Ruler, Tracks, Playhead und Drop Zone.
 * 
 * Props:
 * @param {Array} tracks - Array von Track-Objekten
 * @param {number} pxPerSec - Pixel pro Sekunde (Zoom)
 * @param {number} currentTime - Aktuelle Playhead-Position in Sekunden
 * @param {string} selectedClipId - ID des ausgewählten Clips
 * @param {Function} onSeek - Callback beim Playhead-Seek
 * @param {Function} onSelectClip - Callback bei Clip-Selection
 * @param {Function} onMoveClip - Callback bei Clip-Move (clipId, newStart)
 * @param {Function} onTrimClip - Callback bei Clip-Trim (clipId, newStart, newDuration, edge)
 * @param {Function} onDropMedia - Callback bei Media-Drop (mediaId, trackId, time)
 * @param {boolean} snapping - Snapping aktiviert
 */

import React, { useRef, useState } from 'react';
import Track from './Track';
import { secondsToTimecode } from '../utils/timecode';
import { useDrag } from '../hooks/useDrag';

export default function Timeline({
  tracks = [],
  pxPerSec = 50,
  currentTime = 0,
  selectedClipId = null,
  onSeek,
  onSelectClip,
  onMoveClip,
  onTrimClip,
  onDropMedia,
  snapping = true
}) {
  const timelineRef = useRef(null);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);

  // Berechne Gesamtdauer (max Clip-Ende über alle Tracks)
  const totalDuration = Math.max(
    60, // Minimum 60 Sekunden
    ...tracks.flatMap(track =>
      track.clips.map(clip => clip.start + clip.duration)
    )
  );

  const totalWidth = totalDuration * pxPerSec;

  // Playhead Drag
  const playheadDrag = useDrag({
    onDragStart: () => {
      setIsDraggingPlayhead(true);
    },
    onDragMove: (event) => {
      if (!timelineRef.current) return;
      
      const rect = timelineRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left + timelineRef.current.scrollLeft;
      const time = Math.max(0, x / pxPerSec);
      
      if (onSeek) {
        onSeek(time);
      }
    },
    onDragEnd: () => {
      setIsDraggingPlayhead(false);
    }
  });

  // Klick auf Ruler zum Seek
  const handleRulerClick = (e) => {
    if (isDraggingPlayhead) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
    const time = Math.max(0, x / pxPerSec);
    
    if (onSeek) {
      onSeek(time);
    }
  };

  // Drop Handler für Media
  const handleDrop = (e) => {
    e.preventDefault();
    
    const mediaId = e.dataTransfer.getData('mediaId');
    if (!mediaId || !onDropMedia) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
    const time = Math.max(0, x / pxPerSec);
    
    // Bestimme Track basierend auf Y-Position
    const y = e.clientY - rect.top;
    const rulerHeight = 32;
    const trackHeight = 80;
    const trackIndex = Math.floor((y - rulerHeight) / trackHeight);
    const track = tracks[Math.max(0, Math.min(trackIndex, tracks.length - 1))];
    
    if (track) {
      onDropMedia(mediaId, track.id, time);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Klick auf leeren Bereich deselektiert
  const handleTimelineClick = (e) => {
    if (e.target === e.currentTarget || e.target.closest('.track-container')) {
      if (onSelectClip) {
        onSelectClip(null);
      }
    }
  };

  // Render Time Ruler Ticks
  const renderTimeRuler = () => {
    const ticks = [];
    const numSeconds = Math.ceil(totalDuration);
    
    for (let i = 0; i <= numSeconds; i++) {
      const x = i * pxPerSec;
      const isMainTick = i % 5 === 0;
      
      ticks.push(
        <div
          key={`tick-${i}`}
          className="absolute top-0 bottom-0"
          style={{ left: `${x}px` }}
        >
          {/* Tick Line */}
          <div
            className={`h-full ${isMainTick ? 'w-px bg-muted/40' : 'w-px bg-muted/20'}`}
          />
          
          {/* Label */}
          {isMainTick && (
            <div className="absolute -top-1 -left-6 text-12 text-muted font-mono">
              {secondsToTimecode(i)}
            </div>
          )}
        </div>
      );
      
      // Sub-Tick bei 0.5s
      if (pxPerSec >= 40) {
        const subX = x + pxPerSec / 2;
        ticks.push(
          <div
            key={`subtick-${i}`}
            className="absolute top-0 h-2 w-px bg-muted/10"
            style={{ left: `${subX}px` }}
          />
        );
      }
    }
    
    return ticks;
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Timeline Container */}
      <div
        ref={timelineRef}
        className="flex-1 overflow-auto relative ml-0"
        style={{ paddingLeft: '0px' }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleTimelineClick}
        role="application"
        aria-label="Timeline Editor"
      >
        {/* Time Ruler */}
        <div
          className="sticky top-0 z-20 h-8 bg-panel border-b border-muted/20 cursor-pointer"
          style={{ width: `${totalWidth}px`, minWidth: '100%' }}
          onClick={handleRulerClick}
        >
          <div className="relative h-full">
            {renderTimeRuler()}
          </div>
        </div>

        {/* Tracks */}
        <div
          className="relative track-container"
          style={{ width: `${totalWidth}px`, minWidth: '100%' }}
        >
          {tracks.length > 0 ? (
            tracks.map(track => (
              <Track
                key={track.id}
                id={track.id}
                name={track.name}
                clips={track.clips}
                pxPerSec={pxPerSec}
                selectedClipId={selectedClipId}
                onSelectClip={onSelectClip}
                onMoveClip={onMoveClip}
                onTrimClip={onTrimClip}
                snapping={snapping}
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-40 text-muted/50">
              <div className="text-center">
                <div className="text-2xl mb-2">📹</div>
                <div>Ziehe Elemente hierher und beginne mit dem Erstellen</div>
              </div>
            </div>
          )}
        </div>

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-2px bg-red-500 z-30 pointer-events-none"
          style={{
            left: `${currentTime * pxPerSec}px`,
            boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)'
          }}
        >
          {/* Playhead Handle */}
          <div
            className="absolute -top-1 -left-2 w-4 h-4 bg-red-500 rounded-sm cursor-grab pointer-events-auto"
            {...playheadDrag.handlers}
            style={{ cursor: isDraggingPlayhead ? 'grabbing' : 'grab' }}
          />
        </div>
      </div>

      {/* Timeline Info Bar */}
      <div className="h-6 bg-panel border-t border-muted/20 px-2 flex items-center justify-between text-12 text-muted">
        <div className="flex items-center gap-4">
          <span>Zoom: {Math.round(pxPerSec)}px/s</span>
          <span>Dauer: {secondsToTimecode(totalDuration)}</span>
          <span>Snapping: {snapping ? 'An' : 'Aus'}</span>
        </div>
        <div>
          Playhead: {secondsToTimecode(currentTime)}
        </div>
      </div>
    </div>
  );
}
