/**
 * PreviewPanel-Komponente (MINIMALISTISCH wie Screenshot)
 * 
 * Sehr reduziert:
 * - Header: klein, "Player" label (10px)
 * - Preview Area: Dunkel, zentriert, zeigt Video/Bild-Clips
 * - Timecode: Unten links, sehr klein (10px, mono)
 * - KEIN REC-Badge, KEINE Overlays, KEIN TransportControls hier
 * 
 * Layer-System:
 * - Main Track (Audio Track) im Hintergrund
 * - Video Tracks nach Reihenfolge übereinander (höhere Nummer = Vordergrund)
 * 
 * Props:
 * @param {number} currentTime - Aktuelle Zeit in Sekunden
 * @param {boolean} playing - Ist Wiedergabe aktiv
 * @param {Array} tracks - Alle Tracks mit Clips
 * @param {Array} media - Media-Bibliothek
 * @param {Function} onSeek - Callback zum Seek (time)
 * @param {number} fps - Frames per Second
 */

import React, { useMemo } from 'react';
import { secondsToTimecode } from '../utils/timecode';

export default function PreviewPanel({
  currentTime = 0,
  playing = false,
  tracks = [],
  media = [],
  onSeek,
  fps = 30
}) {
  // Finde alle Clips, die zur aktuellen Zeit aktiv sind
  const activeClips = useMemo(() => {
    const clips = [];
    
    tracks.forEach((track, trackIndex) => {
      // Überspringe Audio Tracks (nur Video/Bild anzeigen)
      if (track.type === 'audio') return;
      
      // Finde Clips, die zur currentTime aktiv sind
      track.clips?.forEach(clip => {
        const clipStart = clip.start;
        const clipEnd = clip.start + clip.duration;
        
        if (currentTime >= clipStart && currentTime < clipEnd) {
          // Finde Media-Item für Thumbnail/Source
          const mediaItem = media.find(m => m.id === clip.mediaId);
          
          clips.push({
            ...clip,
            trackIndex: trackIndex,
            trackId: track.id,
            mediaItem: mediaItem,
            zIndex: trackIndex // Höherer Index = Vordergrund
          });
        }
      });
    });
    
    // Sortiere nach trackIndex (niedriger = Hintergrund, höher = Vordergrund)
    return clips.sort((a, b) => a.trackIndex - b.trackIndex);
  }, [currentTime, tracks, media]);

  const handlePreviewClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = x / rect.width;
    
    // Calculate max duration from all tracks
    const maxDuration = tracks.reduce((max, track) => {
      const trackDuration = track.clips?.reduce((sum, clip) => 
        Math.max(sum, clip.start + clip.duration), 0) || 0;
      return Math.max(max, trackDuration);
    }, 180);
    
    const time = progress * maxDuration;
    if (onSeek) {
      onSeek(time);
    }
  };

  // Calculate total duration
  const duration = useMemo(() => {
    return tracks.reduce((max, track) => {
      const trackDuration = track.clips?.reduce((sum, clip) => 
        Math.max(sum, clip.start + clip.duration), 0) || 0;
      return Math.max(max, trackDuration);
    }, 180);
  }, [tracks]);

  return (
    <div className="flex-1 bg-[var(--bg-main)] rounded border border-[var(--border-subtle)] relative overflow-hidden">
      {/* Header - Sehr klein */}
      <div className="h-8 border-b border-[var(--border-subtle)] px-3 flex items-center">
        <span className="text-xs text-[var(--text-tertiary)]">Player</span>
      </div>
      
      {/* Preview Area - Absolut positioniert */}
      <div 
        className="absolute inset-x-0 top-8 bottom-10 bg-black flex items-center justify-center cursor-pointer overflow-hidden"
        onClick={handlePreviewClick}
      >
        {/* Render aktive Clips als Layer */}
        {activeClips.length > 0 ? (
          activeClips.map((clip, index) => (
            <div
              key={`${clip.trackId}-${clip.id}`}
              className="absolute inset-0 flex items-center justify-center"
              style={{
                zIndex: clip.zIndex
              }}
            >
              {/* Render Thumbnail oder Placeholder */}
              {clip.mediaItem?.thumbnail ? (
                <img
                  src={clip.mediaItem.thumbnail}
                  alt={clip.title}
                  className="max-w-full max-h-full object-contain"
                  style={{
                    opacity: clip.props?.opacity ? clip.props.opacity / 100 : 1,
                    transform: `scale(${clip.props?.scale ? clip.props.scale / 100 : 1}) rotate(${clip.props?.rotation || 0}deg)`
                  }}
                />
              ) : (
                <div className="text-[var(--text-tertiary)] text-sm">
                  {clip.type === 'video' ? '🎥' : '🖼️'} {clip.title}
                </div>
              )}
            </div>
          ))
        ) : (
          /* Placeholder wenn keine Clips aktiv */
          <div className="text-[var(--text-tertiary)] text-sm">🎬</div>
        )}
      </div>
      
      {/* Timecode - Unten links, sehr klein */}
      <div className="absolute bottom-3 left-3">
        <div className="text-xs font-mono text-[var(--text-secondary)]" style={{ fontSize: '10px' }}>
          {secondsToTimecode(currentTime, fps)} / {secondsToTimecode(duration, fps)}
        </div>
      </div>
    </div>
  );
}
