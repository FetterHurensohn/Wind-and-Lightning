/**
 * TimelinePanel.jsx - CapCut-Style Timeline
 * 
 * Features:
 * - Kompakte Größe (passt auf Bildschirm)
 * - Shift + Scroll = Horizontal scrollen
 * - Ctrl + Scroll = Zoom (Sekunden vergrößern/verkleinern)
 * - Timeline expandiert nach rechts, versteckt sich unter rechtem Panel
 * - Drag-and-Drop, Trim-Handles
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useEditor } from './EditorLayout';
import { secondsToTimecode } from '../../utils/timecode';
import Icon from './Icon';

// ============================================
// TIMELINE TOOLBAR (Kompakt)
// ============================================
function TimelineToolbar() {
  const { playhead, state, undo, redo, canUndo, canRedo, dispatch, zoom } = useEditor();

  const handleSplit = () => {
    if (state.selectedClipId) {
      dispatch({ type: 'SPLIT_CLIP', payload: { clipId: state.selectedClipId, splitTime: playhead.currentTime } });
    }
  };

  const handleDelete = () => {
    if (state.selectedClipId) {
      dispatch({ type: 'DELETE_CLIP', payload: { clipId: state.selectedClipId } });
    }
  };

  return (
    <div className="h-9 bg-[var(--bg-panel)] border-b border-[var(--border-subtle)] px-2 flex items-center gap-1">
      {/* Tools */}
      <button onClick={undo} disabled={!canUndo} className="w-7 h-7 flex items-center justify-center rounded text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] disabled:opacity-30" title="Rückgängig (Ctrl+Z)">
        <Icon name="undo" size={16} />
      </button>
      <button onClick={redo} disabled={!canRedo} className="w-7 h-7 flex items-center justify-center rounded text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] disabled:opacity-30" title="Wiederherstellen (Ctrl+Y)">
        <Icon name="redo" size={16} />
      </button>
      <div className="w-px h-4 bg-[var(--border-subtle)] mx-0.5" />
      <button onClick={handleSplit} className="w-7 h-7 flex items-center justify-center rounded text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]" title="Teilen (B)">
        <Icon name="split" size={16} />
      </button>
      <button onClick={handleDelete} disabled={!state.selectedClipId} className="w-7 h-7 flex items-center justify-center rounded text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] disabled:opacity-30" title="Löschen">
        <Icon name="delete" size={16} />
      </button>
      <button onClick={() => dispatch({ type: 'TOGGLE_SNAP' })} className={`w-7 h-7 flex items-center justify-center rounded ${state.snapping ? 'text-[var(--accent-turquoise)] bg-[var(--accent-turquoise)]/10' : 'text-[var(--text-secondary)]'}`} title="Magnetisch">
        <Icon name="snap" size={16} />
      </button>

      {/* Transport */}
      <div className="flex-1 flex items-center justify-center gap-1">
        <button onClick={() => playhead.seek(0)} className="w-6 h-6 flex items-center justify-center rounded text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]">
          <Icon name="skipBack" size={14} />
        </button>
        <button onClick={playhead.playing ? playhead.pause : playhead.play} className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--accent-turquoise)] text-white hover:opacity-90">
          <Icon name={playhead.playing ? 'pause' : 'play'} size={16} />
        </button>
        <button onClick={playhead.stop} className="w-6 h-6 flex items-center justify-center rounded text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]">
          <Icon name="stop" size={14} />
        </button>
      </div>

      {/* Timecode + Zoom */}
      <span className="text-[10px] font-mono text-[var(--text-tertiary)] mr-2">
        {secondsToTimecode(playhead.currentTime, state.fps)}
      </span>
      <button onClick={zoom.zoomOut} className="w-6 h-6 flex items-center justify-center rounded text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]" title="Zoom Out (Ctrl+Scroll)">
        <Icon name="zoomOut" size={14} />
      </button>
      <span className="text-[10px] text-[var(--text-tertiary)] w-8 text-center">{Math.round(zoom.pxPerSec) || 50}</span>
      <button onClick={zoom.zoomIn} className="w-6 h-6 flex items-center justify-center rounded text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]" title="Zoom In (Ctrl+Scroll)">
        <Icon name="zoomIn" size={14} />
      </button>
    </div>
  );
}

// ============================================
// TIME RULER (Kompakt)
// ============================================
function TimeRuler({ pxPerSec, scrollLeft, totalWidth }) {
  const ticks = [];
  const totalSeconds = Math.ceil(totalWidth / pxPerSec) + 10;
  
  // Dynamische Tick-Intervalle basierend auf Zoom
  // Major ticks (mit Label) und Minor ticks (ohne Label)
  let majorInterval = 1;
  let minorInterval = 0.5;
  
  if (pxPerSec < 5) {
    majorInterval = 60; // 1 Minute
    minorInterval = 10; // 10 Sekunden
  } else if (pxPerSec < 10) {
    majorInterval = 30;
    minorInterval = 5;
  } else if (pxPerSec < 20) {
    majorInterval = 10;
    minorInterval = 2;
  } else if (pxPerSec < 40) {
    majorInterval = 5;
    minorInterval = 1;
  } else if (pxPerSec < 80) {
    majorInterval = 2;
    minorInterval = 0.5;
  } else {
    majorInterval = 1;
    minorInterval = 0.25;
  }
  
  // Minor Ticks (kleine Striche ohne Label)
  for (let i = 0; i <= totalSeconds; i += minorInterval) {
    // Skip if this is a major tick position
    if (i % majorInterval === 0) continue;
    
    const x = i * pxPerSec;
    ticks.push(
      <div key={`minor-${i}`} className="absolute" style={{ left: `${x}px` }}>
        <div className="w-px h-1.5 bg-[var(--text-tertiary)] opacity-40" />
      </div>
    );
  }
  
  // Major Ticks (mit Label)
  for (let i = 0; i <= totalSeconds; i += majorInterval) {
    const x = i * pxPerSec;
    const minutes = Math.floor(i / 60);
    const seconds = Math.floor(i % 60);
    
    ticks.push(
      <div key={`major-${i}`} className="absolute flex flex-col items-center" style={{ left: `${x}px` }}>
        <div className="w-px h-2.5 bg-[var(--text-tertiary)]" />
        <span className="text-[8px] text-[var(--text-tertiary)] font-mono mt-0.5">
          {minutes}:{String(seconds).padStart(2, '0')}
        </span>
      </div>
    );
  }
  
  return (
    <div className="h-6 bg-[var(--bg-panel)] border-b border-[var(--border-subtle)] relative overflow-hidden" style={{ marginLeft: '160px' }}>
      <div className="absolute top-0 h-full" style={{ transform: `translateX(-${scrollLeft}px)` }}>
        {ticks}
      </div>
    </div>
  );
}

// ============================================
// CLIP COMPONENT (Kompakt) mit Waveform
// ============================================
function Clip({ clip, track, pxPerSec, isSelected, onSelect, onTrim, onMove, onMoveToNewTrack, trackMuted, trackHidden, waveformSize }) {
  const [action, setAction] = useState(null); // 'move', 'trimStart', 'trimEnd'
  const [dragY, setDragY] = useState(0);
  const startRef = useRef({ x: 0, y: 0, clipStart: 0, clipDuration: 0 });

  const clipWidth = Math.max(30, clip.duration * pxPerSec);
  const clipLeft = clip.start * pxPerSec;

  const getColor = () => {
    switch (clip.type) {
      case 'video': return 'from-blue-500/80 to-blue-600/80';
      case 'audio': return 'from-green-500/80 to-green-600/80';
      case 'image': return 'from-purple-500/80 to-purple-600/80';
      case 'text': return 'from-yellow-500/80 to-yellow-600/80';
      case 'sticker': return 'from-pink-500/80 to-pink-600/80';
      default: return 'from-cyan-500/80 to-cyan-600/80';
    }
  };

  const handleMouseDown = (e, type) => {
    e.stopPropagation();
    setAction(type);
    startRef.current = { x: e.clientX, y: e.clientY, clipStart: clip.start, clipDuration: clip.duration };
    setDragY(0);
    onSelect(clip.id);
  };

  // Generate pseudo-random waveform based on clip id
  const generateWaveform = () => {
    const bars = Math.floor(clipWidth / 3);
    const seed = clip.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Array.from({ length: Math.max(10, bars) }, (_, i) => {
      const noise = Math.sin(seed + i * 0.5) * 0.3 + Math.sin(i * 0.8) * 0.3;
      return 0.3 + Math.abs(noise) * 0.7;
    });
  };

  useEffect(() => {
    if (!action) return;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - startRef.current.x;
      const deltaY = e.clientY - startRef.current.y;
      const deltaTime = deltaX / pxPerSec;

      if (action === 'trimStart') {
        const newStart = Math.max(0, startRef.current.clipStart + deltaTime);
        const maxStart = startRef.current.clipStart + startRef.current.clipDuration - 0.5;
        const clampedStart = Math.min(newStart, maxStart);
        const newDuration = startRef.current.clipDuration - (clampedStart - startRef.current.clipStart);
        onTrim(clip.id, clampedStart, newDuration);
      } else if (action === 'trimEnd') {
        const newDuration = Math.max(0.5, startRef.current.clipDuration + deltaTime);
        onTrim(clip.id, clip.start, newDuration);
      } else if (action === 'move') {
        const newStart = Math.max(0, startRef.current.clipStart + deltaTime);
        setDragY(deltaY);
        onMove(clip.id, track.id, newStart);
      }
    };

    const handleMouseUp = (e) => {
      // Check if clip was dragged vertically enough to create new track
      if (action === 'move' && Math.abs(dragY) > 30) {
        const direction = dragY < 0 ? 'above' : 'below';
        onMoveToNewTrack?.(clip.id, track.id, direction, clip.start);
      }
      setAction(null);
      setDragY(0);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [action, clip, track, pxPerSec, onTrim, onMove, onMoveToNewTrack, dragY]);

  const waveform = clip.type === 'audio' ? generateWaveform() : null;

  // Visual feedback for vertical drag
  const dragIndicator = action === 'move' && Math.abs(dragY) > 30 ? (
    <div className={`absolute left-0 right-0 h-1 bg-[var(--accent-turquoise)] rounded ${dragY < 0 ? '-top-3' : '-bottom-3'}`} />
  ) : null;

  return (
    <div
      className={`absolute top-1 bottom-1 rounded cursor-pointer bg-gradient-to-r ${getColor()} ${isSelected ? 'ring-2 ring-white' : ''} ${trackHidden ? 'opacity-50' : ''}`}
      style={{ 
        left: `${clipLeft}px`, 
        width: `${clipWidth}px`, 
        minWidth: '30px',
        transform: action === 'move' ? `translateY(${Math.min(20, Math.max(-20, dragY * 0.3))}px)` : 'none',
        transition: action === 'move' ? 'none' : 'transform 0.1s'
      }}
      onMouseDown={(e) => handleMouseDown(e, 'move')}
    >
      {dragIndicator}
      
      {/* Trim Left */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-white/30 rounded-l z-10" onMouseDown={(e) => handleMouseDown(e, 'trimStart')} />
      
      {/* Audio Waveform */}
      {waveform && (
        <div className="absolute inset-x-1.5 top-2 bottom-2 flex items-end gap-px pointer-events-none overflow-hidden">
          {waveform.map((height, i) => (
            <div
              key={i}
              className="flex-1 min-w-[1px] bg-white/40 rounded-t"
              style={{ height: `${height * 100}%` }}
            />
          ))}
        </div>
      )}
      
      {/* Content - Title */}
      <div className="absolute inset-x-1.5 top-0 h-5 flex items-center overflow-hidden pointer-events-none">
        <span className="text-[10px] text-white truncate drop-shadow">{clip.title}</span>
      </div>
      
      {/* Thumbnail for video/image */}
      {(clip.type === 'video' || clip.type === 'image') && clip.thumbnail && (
        <div className="absolute left-1.5 top-5 bottom-1 w-8 overflow-hidden rounded pointer-events-none">
          <img src={clip.thumbnail} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      
      {/* Trim Right */}
      <div className="absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-white/30 rounded-r z-10" onMouseDown={(e) => handleMouseDown(e, 'trimEnd')} />
    </div>
  );
}

// ============================================
// TRACK COMPONENT (Kompakt - 48px Höhe)
// Mit Kontroll-Buttons: Löschen, Sperren, Ausblenden, Stumm, Gauge
// ============================================
function Track({ track, pxPerSec, selectedClipId, onClipSelect, onClipTrim, onClipMove, onMoveToNewTrack, onDrop, onTrackUpdate, onTrackDelete, isFirst }) {
  const [dragOver, setDragOver] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [waveformSize, setWaveformSize] = useState(track.waveformSize || 'medium'); // small, medium, large

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setDragOver(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    const mediaId = e.dataTransfer.getData('mediaId');
    if (!mediaId) {
      console.log('[Track] No mediaId in drop event');
      return;
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const dropTime = Math.max(0, x / pxPerSec);
    
    console.log('[Track] Drop:', { mediaId, trackId: track.id, dropTime, x });
    onDrop(e, track.id, dropTime);
  };

  // Track Icon basierend auf Typ
  const getTrackIcon = () => {
    switch (track.type) {
      case 'audio': return 'audio';
      case 'text': return 'text';
      case 'sticker': return 'sticker';
      default: return 'video';
    }
  };

  // Track-Farbe basierend auf Typ
  const getTrackColor = () => {
    switch (track.type) {
      case 'audio': return 'bg-green-500/20';
      case 'text': return 'bg-yellow-500/20';
      case 'sticker': return 'bg-pink-500/20';
      default: return 'bg-blue-500/20';
    }
  };

  // Toggle-Funktionen
  const toggleLock = () => onTrackUpdate?.(track.id, { locked: !track.locked });
  const toggleHide = () => onTrackUpdate?.(track.id, { hidden: !track.hidden });
  const toggleMute = () => onTrackUpdate?.(track.id, { muted: !track.muted });
  const setGauge = (value) => onTrackUpdate?.(track.id, { gauge: value });

  return (
    <div 
      className={`flex border-b border-[var(--border-subtle)] ${track.hidden ? 'opacity-40' : ''}`} 
      style={{ height: '48px' }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Track Controls Label */}
      <div className={`w-[160px] flex-shrink-0 ${getTrackColor()} border-r border-[var(--border-subtle)] flex items-center gap-1 px-1.5`}>
        {/* Track Icon & Name */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <Icon name={getTrackIcon()} size={12} className="text-[var(--text-tertiary)] flex-shrink-0" />
          <span className="text-[10px] text-[var(--text-secondary)] truncate">{track.name}</span>
        </div>
        
        {/* Control Buttons - Always visible now */}
        <div className="flex items-center gap-0.5">
          {/* Mute (nur für Audio/Video) */}
          {(track.type === 'audio' || track.type === 'video') && (
            <button 
              onClick={toggleMute}
              className={`w-5 h-5 flex items-center justify-center rounded text-[10px] transition-colors ${
                track.muted 
                  ? 'bg-red-500/30 text-red-400' 
                  : 'hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)]'
              }`}
              title={track.muted ? 'Ton aktivieren' : 'Stumm schalten'}
            >
              <Icon name={track.muted ? 'mute' : 'audio'} size={10} />
            </button>
          )}
          
          {/* Hide/Show */}
          <button 
            onClick={toggleHide}
            className={`w-5 h-5 flex items-center justify-center rounded text-[10px] transition-colors ${
              track.hidden 
                ? 'bg-orange-500/30 text-orange-400' 
                : 'hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)]'
            }`}
            title={track.hidden ? 'Einblenden' : 'Ausblenden'}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {track.hidden ? (
                <>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </>
              ) : (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              )}
            </svg>
          </button>
          
          {/* Lock */}
          <button 
            onClick={toggleLock}
            className={`w-5 h-5 flex items-center justify-center rounded text-[10px] transition-colors ${
              track.locked 
                ? 'bg-yellow-500/30 text-yellow-400' 
                : 'hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)]'
            }`}
            title={track.locked ? 'Entsperren' : 'Sperren'}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {track.locked ? (
                <>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </>
              ) : (
                <>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                </>
              )}
            </svg>
          </button>
          
          {/* Delete Track */}
          <button 
            onClick={() => onTrackDelete?.(track.id)}
            className="w-5 h-5 flex items-center justify-center rounded text-[10px] hover:bg-red-500/30 hover:text-red-400 text-[var(--text-tertiary)] transition-colors"
            title="Track löschen"
          >
            <Icon name="trash" size={10} />
          </button>
        </div>
      </div>

      {/* Track Gauge (Volume/Opacity Mini-Slider) - nur bei Hover sichtbar */}
      {showControls && (track.type === 'audio' || track.type === 'video') && (
        <div className="absolute left-[165px] top-1/2 -translate-y-1/2 z-20 bg-[var(--bg-panel)] rounded px-2 py-1 shadow-lg border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <span className="text-[8px] text-[var(--text-tertiary)]">{track.type === 'audio' ? 'Vol' : 'Op'}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={track.gauge ?? 100}
              onChange={(e) => setGauge(parseInt(e.target.value))}
              className="w-16 h-1 accent-[var(--accent-turquoise)]"
            />
            <span className="text-[8px] text-[var(--text-tertiary)] w-6">{track.gauge ?? 100}%</span>
          </div>
        </div>
      )}

      {/* Track Content - Drop Zone */}
      <div
        className={`flex-1 relative transition-colors ${dragOver ? 'bg-[var(--accent-turquoise)]/20 ring-2 ring-inset ring-[var(--accent-turquoise)]' : ''} ${track.locked ? 'pointer-events-none' : ''}`}
        onDragOver={!track.locked ? handleDragOver : undefined}
        onDragEnter={!track.locked ? handleDragEnter : undefined}
        onDragLeave={!track.locked ? handleDragLeave : undefined}
        onDrop={!track.locked ? handleDrop : undefined}
        data-track-id={track.id}
        data-track-type={track.type}
      >
        {/* Locked Overlay */}
        {track.locked && (
          <div className="absolute inset-0 bg-[var(--bg-main)]/50 flex items-center justify-center z-10">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        )}
        
        {track.clips?.map(clip => (
          <Clip
            key={clip.id}
            clip={clip}
            track={track}
            pxPerSec={pxPerSec}
            isSelected={selectedClipId === clip.id}
            onSelect={onClipSelect}
            onTrim={onClipTrim}
            onMove={onClipMove}
            onMoveToNewTrack={onMoveToNewTrack}
            trackMuted={track.muted}
            trackHidden={track.hidden}
            waveformSize={waveformSize}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// NEW TRACK DROP ZONE (Für neue Tracks über bestehenden)
// ============================================
function NewTrackDropZone({ type, onCreateTrack }) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    const mediaId = e.dataTransfer.getData('mediaId');
    if (mediaId) {
      onCreateTrack(type, mediaId, e);
    }
  };

  const getConfig = () => {
    switch (type) {
      case 'audio': return { label: '+Audio', color: 'text-green-400', bg: 'bg-green-500/10' };
      case 'text': return { label: '+Text', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
      case 'sticker': return { label: '+Sticker', color: 'text-pink-400', bg: 'bg-pink-500/10' };
      default: return { label: '+Video', color: 'text-blue-400', bg: 'bg-blue-500/10' };
    }
  };

  const config = getConfig();

  return (
    <div
      className={`flex-1 h-full flex items-center justify-center transition-colors cursor-pointer border-r border-dashed border-[var(--border-subtle)] last:border-r-0 ${
        dragOver ? 'bg-[var(--accent-turquoise)]/30' : `hover:${config.bg}`
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => onCreateTrack(type)}
    >
      <span className={`text-[9px] ${config.color}`}>{config.label}</span>
    </div>
  );
}

// ============================================
// MAIN TIMELINE COMPONENT
// ============================================
export default function TimelinePanel() {
  const { state, dispatch, playhead, zoom } = useEditor();
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Berechne Timeline-Breite basierend auf längsten Clip
  // Minimum 1 Stunde (3600 Sekunden) für professionelle Videobearbeitung
  const getTimelineWidth = () => {
    let maxEnd = 3600; // Minimum 1 Stunde
    state.tracks.forEach(track => {
      track.clips?.forEach(clip => {
        const end = clip.start + clip.duration;
        if (end > maxEnd) maxEnd = end;
      });
    });
    return (maxEnd + 60) * zoom.pxPerSec; // +60s extra Platz
  };

  // Scroll-Handler
  const handleScroll = (e) => {
    setScrollLeft(e.currentTarget.scrollLeft);
  };

  // Wheel-Handler für Shift+Scroll (horizontal) und Ctrl+Scroll (zoom)
  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      // Ctrl + Scroll = Zoom
      e.preventDefault();
      if (e.deltaY < 0) {
        zoom.zoomIn(1.15);
      } else {
        zoom.zoomOut(1.15);
      }
    } else if (e.shiftKey) {
      // Shift + Scroll = Horizontal scroll
      e.preventDefault();
      if (scrollRef.current) {
        scrollRef.current.scrollLeft += e.deltaY;
        setScrollLeft(scrollRef.current.scrollLeft);
      }
    }
  }, [zoom]);

  // Event Listener für Wheel
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === ' ') {
        e.preventDefault();
        playhead.playing ? playhead.pause() : playhead.play();
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        if (state.selectedClipId) {
          dispatch({ type: 'SPLIT_CLIP', payload: { clipId: state.selectedClipId, splitTime: playhead.currentTime } });
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (state.selectedClipId) {
          dispatch({ type: 'DELETE_CLIP', payload: { clipId: state.selectedClipId } });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playhead, state.selectedClipId, dispatch]);

  // Clip Handlers
  const handleClipSelect = useCallback((clipId) => {
    dispatch({ type: 'SELECT_CLIP', payload: clipId });
  }, [dispatch]);

  const handleClipTrim = useCallback((clipId, newStart, newDuration) => {
    dispatch({ type: 'TRIM_CLIP', payload: { clipId, newStart, newDuration } });
  }, [dispatch]);

  const handleClipMove = useCallback((clipId, trackId, newStart) => {
    if (state.snapping) newStart = Math.round(newStart * 2) / 2;
    dispatch({ type: 'MOVE_CLIP', payload: { clipId, trackId, newStart } });
  }, [dispatch, state.snapping]);

  const handleDrop = useCallback((e, trackId, dropTime) => {
    const mediaId = e.dataTransfer.getData('mediaId') || e.dataTransfer.getData('text/plain');
    
    console.log('[TimelinePanel] handleDrop called:', { mediaId, trackId, dropTime });
    
    if (!mediaId) {
      console.warn('[TimelinePanel] No mediaId found in drop event');
      return;
    }

    const mediaItem = state.media.find(m => m.id === mediaId);
    if (!mediaItem) {
      console.warn('[TimelinePanel] Media item not found:', mediaId);
      console.log('[TimelinePanel] Available media:', state.media.map(m => m.id));
      return;
    }

    const track = state.tracks.find(t => t.id === trackId);
    if (!track) {
      console.warn('[TimelinePanel] Track not found:', trackId);
      return;
    }

    // Type check - Video/Bild kann nur auf Video-Tracks, Audio nur auf Audio-Tracks
    if (track.type === 'audio' && mediaItem.type !== 'audio') {
      console.warn('[TimelinePanel] Cannot drop non-audio on audio track');
      return;
    }
    if (track.type === 'video' && mediaItem.type === 'audio') {
      console.warn('[TimelinePanel] Cannot drop audio on video track');
      return;
    }

    const newClip = {
      id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      mediaId: mediaItem.id,
      title: mediaItem.name,
      start: state.snapping ? Math.round(dropTime * 2) / 2 : dropTime,
      duration: mediaItem.duration || (mediaItem.type === 'image' ? 3 : 5),
      type: mediaItem.type,
      thumbnail: mediaItem.thumbnail,
      props: { opacity: 100, scale: 100, volume: mediaItem.type === 'audio' ? 100 : 0 }
    };

    console.log('[TimelinePanel] Creating clip:', newClip);
    dispatch({ type: 'ADD_CLIP_TO_TRACK', payload: { trackId, clip: newClip } });
  }, [state.media, state.tracks, state.snapping, dispatch]);

  const handleAddTrack = (type) => {
    const typeNames = {
      video: 'Video',
      audio: 'Audio',
      text: 'Text',
      sticker: 'Sticker'
    };
    const count = state.tracks.filter(t => t.type === type).length + 1;
    dispatch({
      type: 'ADD_TRACK',
      payload: {
        track: {
          id: `${type}_${Date.now()}`,
          name: `${typeNames[type]} ${count}`,
          type,
          clips: [],
          locked: false,
          hidden: false,
          muted: false,
          gauge: 100,
          waveformSize: 'medium'
        },
        position: type === 'video' || type === 'text' || type === 'sticker' ? 0 : state.tracks.length
      }
    });
  };

  // Track Update Handler
  const handleTrackUpdate = useCallback((trackId, updates) => {
    dispatch({ type: 'UPDATE_TRACK', payload: { trackId, updates } });
  }, [dispatch]);

  // Track Delete Handler
  const handleTrackDelete = useCallback((trackId) => {
    if (window.confirm('Track wirklich löschen? Alle Clips auf diesem Track werden entfernt.')) {
      dispatch({ type: 'DELETE_TRACK', payload: { trackId } });
    }
  }, [dispatch]);

  // Handle moving clip to new track
  const handleMoveToNewTrack = useCallback((clipId, currentTrackId, direction, clipStart) => {
    // Find the clip to move
    const currentTrack = state.tracks.find(t => t.id === currentTrackId);
    const clip = currentTrack?.clips?.find(c => c.id === clipId);
    
    if (!clip) return;

    // Determine track type based on clip type
    let trackType = clip.type;
    if (clip.type === 'image') trackType = 'video'; // Images go on video tracks

    // Create new track
    const typeNames = { video: 'Video', audio: 'Audio', text: 'Text', sticker: 'Sticker' };
    const count = state.tracks.filter(t => t.type === trackType).length + 1;
    const newTrackId = `${trackType}_${Date.now()}`;
    
    // Find position to insert new track
    const currentTrackIndex = state.tracks.findIndex(t => t.id === currentTrackId);
    const insertPosition = direction === 'above' ? currentTrackIndex : currentTrackIndex + 1;
    
    // Create new track
    dispatch({
      type: 'ADD_TRACK',
      payload: {
        track: {
          id: newTrackId,
          name: `${typeNames[trackType]} ${count}`,
          type: trackType,
          clips: [],
          locked: false,
          hidden: false,
          muted: false,
          gauge: 100
        },
        position: insertPosition
      }
    });

    // Move clip to new track
    setTimeout(() => {
      dispatch({ type: 'MOVE_CLIP', payload: { clipId, trackId: newTrackId, newStart: clipStart } });
    }, 10);
  }, [state.tracks, dispatch]);

  // Create New Track with Media (for drag above existing tracks)
  const handleCreateTrackWithMedia = useCallback((type, mediaId, e) => {
    const typeNames = { video: 'Video', audio: 'Audio', text: 'Text', sticker: 'Sticker' };
    const count = state.tracks.filter(t => t.type === type).length + 1;
    const newTrackId = `${type}_${Date.now()}`;
    
    // Create new track first
    dispatch({
      type: 'ADD_TRACK',
      payload: {
        track: {
          id: newTrackId,
          name: `${typeNames[type]} ${count}`,
          type,
          clips: [],
          locked: false,
          hidden: false,
          muted: false,
          gauge: 100
        },
        position: 0 // Insert at top
      }
    });

    // If mediaId provided, add clip to new track
    if (mediaId) {
      const mediaItem = state.media.find(m => m.id === mediaId);
      if (mediaItem) {
        const newClip = {
          id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          mediaId: mediaItem.id,
          title: mediaItem.name,
          start: 0,
          duration: mediaItem.duration || (mediaItem.type === 'image' ? 3 : 5),
          type: mediaItem.type,
          thumbnail: mediaItem.thumbnail,
          props: { opacity: 100, scale: 100, volume: mediaItem.type === 'audio' ? 100 : 0 }
        };
        
        // Delay to ensure track is created first
        setTimeout(() => {
          dispatch({ type: 'ADD_CLIP_TO_TRACK', payload: { trackId: newTrackId, clip: newClip } });
        }, 10);
      }
    }
  }, [state.media, state.tracks, dispatch]);

  const timelineWidth = getTimelineWidth();

  return (
    <div ref={containerRef} className="h-full flex flex-col bg-[var(--bg-main)] select-none">
      {/* Toolbar */}
      <TimelineToolbar />

      {/* Time Ruler */}
      <TimeRuler pxPerSec={zoom.pxPerSec} scrollLeft={scrollLeft} totalWidth={timelineWidth} />

      {/* Tracks Container mit horizontalem Scroll */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-x-auto overflow-y-auto relative"
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'thin' }}
      >
        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-50"
          style={{
            left: `${160 + playhead.currentTime * zoom.pxPerSec - scrollLeft}px`,
            transition: playhead.playing ? 'none' : 'left 0.05s'
          }}
        >
          <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rotate-45" />
        </div>

        {/* Tracks */}
        <div style={{ width: `${160 + timelineWidth}px`, minWidth: '100%' }}>
          {state.tracks.length === 0 ? (
            <div className="h-24 flex items-center justify-center">
              <div className="flex gap-2">
                <button onClick={() => handleAddTrack('video')} className="px-3 py-1.5 bg-blue-500/20 text-blue-400 text-xs rounded hover:bg-blue-500/30">
                  + Video Track
                </button>
                <button onClick={() => handleAddTrack('audio')} className="px-3 py-1.5 bg-green-500/20 text-green-400 text-xs rounded hover:bg-green-500/30">
                  + Audio Track
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* New Track Drop Zones (above tracks) */}
              <div className="flex border-b border-dashed border-[var(--border-subtle)]" style={{ height: '24px' }}>
                <div className="w-[160px] flex-shrink-0 bg-[var(--bg-panel)]/50 border-r border-[var(--border-subtle)] flex items-center justify-center">
                  <span className="text-[8px] text-[var(--text-tertiary)]">↑ Hierher ziehen für neuen Track</span>
                </div>
                <div className="flex-1 flex">
                  <NewTrackDropZone type="video" onCreateTrack={handleCreateTrackWithMedia} />
                  <NewTrackDropZone type="text" onCreateTrack={handleCreateTrackWithMedia} />
                  <NewTrackDropZone type="sticker" onCreateTrack={handleCreateTrackWithMedia} />
                  <NewTrackDropZone type="audio" onCreateTrack={handleCreateTrackWithMedia} />
                </div>
              </div>
              
              {state.tracks.map((track, index) => (
                <Track
                  key={track.id}
                  track={track}
                  pxPerSec={zoom.pxPerSec}
                  selectedClipId={state.selectedClipId}
                  onClipSelect={handleClipSelect}
                  onClipTrim={handleClipTrim}
                  onClipMove={handleClipMove}
                  onDrop={handleDrop}
                  onTrackUpdate={handleTrackUpdate}
                  onTrackDelete={handleTrackDelete}
                  isFirst={index === 0}
                />
              ))}
              
              {/* Add Track Row */}
              <div className="flex h-8 border-b border-[var(--border-subtle)]">
                <div className="w-[160px] flex-shrink-0 bg-[var(--bg-panel)] border-r border-[var(--border-subtle)] flex items-center justify-center gap-1 px-1">
                  <button onClick={() => handleAddTrack('video')} className="px-1.5 py-0.5 text-[9px] text-blue-400 hover:bg-blue-500/10 rounded">+Video</button>
                  <button onClick={() => handleAddTrack('audio')} className="px-1.5 py-0.5 text-[9px] text-green-400 hover:bg-green-500/10 rounded">+Audio</button>
                  <button onClick={() => handleAddTrack('text')} className="px-1.5 py-0.5 text-[9px] text-yellow-400 hover:bg-yellow-500/10 rounded">+Text</button>
                  <button onClick={() => handleAddTrack('sticker')} className="px-1.5 py-0.5 text-[9px] text-pink-400 hover:bg-pink-500/10 rounded">+Sticker</button>
                </div>
                <div className="flex-1" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Hint */}
      <div className="h-5 bg-[var(--bg-panel)] border-t border-[var(--border-subtle)] px-2 flex items-center">
        <span className="text-[9px] text-[var(--text-tertiary)]">
          Shift+Scroll: Horizontal scrollen | Ctrl+Scroll: Zoom | Leertaste: Play/Pause | B: Teilen | Entf: Löschen
        </span>
      </div>
    </div>
  );
}
