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
  let interval = 1;
  if (pxPerSec < 20) interval = 10;
  else if (pxPerSec < 40) interval = 5;
  else if (pxPerSec < 80) interval = 2;
  
  for (let i = 0; i <= totalSeconds; i += interval) {
    const x = i * pxPerSec;
    ticks.push(
      <div key={i} className="absolute flex flex-col items-center" style={{ left: `${x}px` }}>
        <div className="w-px h-2 bg-[var(--text-tertiary)]" />
        <span className="text-[8px] text-[var(--text-tertiary)] font-mono mt-0.5">
          {Math.floor(i / 60)}:{String(i % 60).padStart(2, '0')}
        </span>
      </div>
    );
  }
  
  return (
    <div className="h-5 bg-[var(--bg-panel)] border-b border-[var(--border-subtle)] relative overflow-hidden" style={{ marginLeft: '120px' }}>
      <div className="absolute top-0 h-full" style={{ transform: `translateX(-${scrollLeft}px)` }}>
        {ticks}
      </div>
    </div>
  );
}

// ============================================
// CLIP COMPONENT (Kompakt) mit Waveform
// ============================================
function Clip({ clip, track, pxPerSec, isSelected, onSelect, onTrim, onMove }) {
  const [action, setAction] = useState(null); // 'trimStart' | 'trimEnd' | 'move'
  const startRef = useRef({ x: 0, clipStart: 0, clipDuration: 0 });

  const clipWidth = Math.max(30, clip.duration * pxPerSec);
  const clipLeft = clip.start * pxPerSec;

  const getColor = () => {
    switch (clip.type) {
      case 'video': return 'from-blue-500/80 to-blue-600/80';
      case 'audio': return 'from-green-500/80 to-green-600/80';
      case 'image': return 'from-purple-500/80 to-purple-600/80';
      default: return 'from-cyan-500/80 to-cyan-600/80';
    }
  };

  const handleMouseDown = (e, type) => {
    e.stopPropagation();
    setAction(type);
    startRef.current = { x: e.clientX, clipStart: clip.start, clipDuration: clip.duration };
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
        onMove(clip.id, track.id, newStart);
      }
    };

    const handleMouseUp = () => setAction(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [action, clip, track, pxPerSec, onTrim, onMove]);

  return (
    <div
      className={`absolute top-1 bottom-1 rounded cursor-pointer bg-gradient-to-r ${getColor()} ${isSelected ? 'ring-1 ring-white' : ''}`}
      style={{ left: `${clipLeft}px`, width: `${clipWidth}px`, minWidth: '30px' }}
      onMouseDown={(e) => handleMouseDown(e, 'move')}
    >
      {/* Trim Left */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-white/30 rounded-l" onMouseDown={(e) => handleMouseDown(e, 'trimStart')} />
      
      {/* Content */}
      <div className="px-1.5 py-0.5 h-full flex items-center overflow-hidden pointer-events-none">
        <span className="text-[10px] text-white truncate">{clip.title}</span>
      </div>
      
      {/* Trim Right */}
      <div className="absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-white/30 rounded-r" onMouseDown={(e) => handleMouseDown(e, 'trimEnd')} />
    </div>
  );
}

// ============================================
// TRACK COMPONENT (Kompakt - 48px Höhe)
// ============================================
function Track({ track, pxPerSec, selectedClipId, onClipSelect, onClipTrim, onClipMove, onDrop }) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    onDrop(e, track.id, Math.max(0, x / pxPerSec));
  };

  return (
    <div className="flex border-b border-[var(--border-subtle)]" style={{ height: '48px' }}>
      {/* Track Label */}
      <div className="w-[120px] flex-shrink-0 bg-[var(--bg-panel)] border-r border-[var(--border-subtle)] flex items-center gap-1.5 px-2">
        <Icon name={track.type === 'audio' ? 'audio' : 'video'} size={12} className="text-[var(--text-tertiary)]" />
        <span className="text-[10px] text-[var(--text-secondary)] truncate flex-1">{track.name}</span>
        <button className="w-4 h-4 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)]">
          <Icon name="audio" size={10} />
        </button>
      </div>

      {/* Track Content */}
      <div
        className={`flex-1 relative ${dragOver ? 'bg-[var(--accent-turquoise)]/10' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
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
          />
        ))}
      </div>
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
  const getTimelineWidth = () => {
    let maxEnd = 30; // Minimum 30 Sekunden
    state.tracks.forEach(track => {
      track.clips?.forEach(clip => {
        const end = clip.start + clip.duration;
        if (end > maxEnd) maxEnd = end;
      });
    });
    return (maxEnd + 10) * zoom.pxPerSec; // +10s extra Platz
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
    const mediaId = e.dataTransfer.getData('mediaId');
    if (!mediaId) return;

    const mediaItem = state.media.find(m => m.id === mediaId);
    if (!mediaItem) return;

    const track = state.tracks.find(t => t.id === trackId);
    if (!track) return;

    // Type check
    if (track.type === 'audio' && mediaItem.type !== 'audio') return;
    if (track.type === 'video' && mediaItem.type === 'audio') return;

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

    dispatch({ type: 'ADD_CLIP_TO_TRACK', payload: { trackId, clip: newClip } });
  }, [state.media, state.tracks, state.snapping, dispatch]);

  const handleAddTrack = (type) => {
    const count = state.tracks.filter(t => t.type === type).length + 1;
    dispatch({
      type: 'ADD_TRACK',
      payload: {
        track: {
          id: `${type}_${Date.now()}`,
          name: `${type === 'video' ? 'Video' : 'Audio'} ${count}`,
          type,
          clips: []
        },
        position: type === 'video' ? 0 : state.tracks.length
      }
    });
  };

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
            left: `${120 + playhead.currentTime * zoom.pxPerSec - scrollLeft}px`,
            transition: playhead.playing ? 'none' : 'left 0.05s'
          }}
        >
          <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rotate-45" />
        </div>

        {/* Tracks */}
        <div style={{ width: `${120 + timelineWidth}px`, minWidth: '100%' }}>
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
              {state.tracks.map(track => (
                <Track
                  key={track.id}
                  track={track}
                  pxPerSec={zoom.pxPerSec}
                  selectedClipId={state.selectedClipId}
                  onClipSelect={handleClipSelect}
                  onClipTrim={handleClipTrim}
                  onClipMove={handleClipMove}
                  onDrop={handleDrop}
                />
              ))}
              
              {/* Add Track Row */}
              <div className="flex h-8 border-b border-[var(--border-subtle)]">
                <div className="w-[120px] flex-shrink-0 bg-[var(--bg-panel)] border-r border-[var(--border-subtle)] flex items-center justify-center gap-1 px-1">
                  <button onClick={() => handleAddTrack('video')} className="px-1.5 py-0.5 text-[10px] text-blue-400 hover:bg-blue-500/10 rounded">+Video</button>
                  <button onClick={() => handleAddTrack('audio')} className="px-1.5 py-0.5 text-[10px] text-green-400 hover:bg-green-500/10 rounded">+Audio</button>
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
