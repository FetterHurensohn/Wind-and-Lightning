/**
 * TimelinePanel.jsx - Vollständige Timeline mit Drag-and-Drop, Trim und Clip-Bearbeitung
 * 
 * Features:
 * - Drag-and-Drop von Medien auf Tracks
 * - Clip trimmen (linkes/rechtes Handle)
 * - Clip verschieben
 * - Track-Labels links
 * - Playhead mit rotem Streifen
 * - Keyboard shortcuts
 */

import React, { useState, useRef, useCallback } from 'react';
import { useEditor } from './EditorLayout';
import { secondsToTimecode } from '../../utils/timecode';
import Icon from './Icon';

// ============================================
// TIMELINE TOOLBAR
// ============================================
function TimelineToolbar() {
  const { playhead, state, undo, redo, canUndo, canRedo, dispatch, zoom } = useEditor();

  const handleSplit = () => {
    if (state.selectedClipId) {
      dispatch({
        type: 'SPLIT_CLIP',
        payload: { clipId: state.selectedClipId, splitTime: playhead.currentTime }
      });
    } else {
      // Split all clips at playhead
      state.tracks.forEach(track => {
        track.clips?.forEach(clip => {
          if (playhead.currentTime > clip.start && playhead.currentTime < clip.start + clip.duration) {
            dispatch({
              type: 'SPLIT_CLIP',
              payload: { clipId: clip.id, splitTime: playhead.currentTime }
            });
          }
        });
      });
    }
  };

  const handleDelete = () => {
    if (state.selectedClipId) {
      dispatch({ type: 'DELETE_CLIP', payload: { clipId: state.selectedClipId } });
    }
  };

  const handleCopy = () => {
    if (state.selectedClipId || state.selectedClipIds?.length > 0) {
      dispatch({ type: 'COPY_CLIPS' });
    }
  };

  const handlePaste = () => {
    dispatch({ type: 'PASTE_CLIPS', payload: { pasteTime: playhead.currentTime } });
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === ' ') {
        e.preventDefault();
        playhead.playing ? playhead.pause() : playhead.play();
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        handleSplit();
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key === 'z' && e.shiftKey && (e.ctrlKey || e.metaKey)) || (e.key === 'y' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        redo();
      } else if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleCopy();
      } else if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handlePaste();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        playhead.seek(Math.max(0, playhead.currentTime - 1 / state.fps));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        playhead.seek(playhead.currentTime + 1 / state.fps);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playhead, state, undo, redo, dispatch]);

  return (
    <div className="h-10 bg-[var(--bg-panel)] border-b border-[var(--border-subtle)] px-3 flex items-center">
      {/* Left: Tools */}
      <div className="flex items-center gap-1">
        <button onClick={undo} disabled={!canUndo} className="w-8 h-8 flex items-center justify-center rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-30" title="Rückgängig (Ctrl+Z)">
          <Icon name="undo" size={18} />
        </button>
        <button onClick={redo} disabled={!canRedo} className="w-8 h-8 flex items-center justify-center rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-30" title="Wiederherstellen (Ctrl+Y)">
          <Icon name="redo" size={18} />
        </button>
        <div className="w-px h-5 bg-[var(--border-subtle)] mx-1" />
        <button onClick={handleSplit} className="w-8 h-8 flex items-center justify-center rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]" title="Teilen (B)">
          <Icon name="split" size={18} />
        </button>
        <button onClick={handleDelete} disabled={!state.selectedClipId} className="w-8 h-8 flex items-center justify-center rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-30" title="Löschen (Entf)">
          <Icon name="delete" size={18} />
        </button>
        <button onClick={() => dispatch({ type: 'TOGGLE_SNAP' })} className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${state.snapping ? 'text-[var(--accent-turquoise)] bg-[var(--bg-hover)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`} title="Magnetisch">
          <Icon name="snap" size={18} />
        </button>
      </div>

      {/* Center: Transport */}
      <div className="flex-1 flex items-center justify-center gap-2">
        <button onClick={() => playhead.seek(0)} className="w-7 h-7 flex items-center justify-center rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]" title="Zum Anfang">
          <Icon name="skipBack" size={16} />
        </button>
        <button onClick={() => playhead.seek(Math.max(0, playhead.currentTime - 1))} className="w-7 h-7 flex items-center justify-center rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]" title="1s zurück">
          <Icon name="frameBack" size={16} />
        </button>
        <button onClick={playhead.playing ? playhead.pause : playhead.play} className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--accent-turquoise)] text-white hover:opacity-90" title={playhead.playing ? 'Pause' : 'Play'}>
          <Icon name={playhead.playing ? 'pause' : 'play'} size={20} />
        </button>
        <button onClick={playhead.stop} className="w-7 h-7 flex items-center justify-center rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]" title="Stop">
          <Icon name="stop" size={16} />
        </button>
        <button onClick={() => playhead.seek(playhead.currentTime + 1)} className="w-7 h-7 flex items-center justify-center rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]" title="1s vorwärts">
          <Icon name="frameForward" size={16} />
        </button>
      </div>

      {/* Right: Timecode + Zoom */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-[var(--text-secondary)]">
          {secondsToTimecode(playhead.currentTime, state.fps)} / {secondsToTimecode(state.projectDuration || 180, state.fps)}
        </span>
        <div className="w-px h-5 bg-[var(--border-subtle)] mx-1" />
        <button onClick={zoom.zoomOut} className="w-7 h-7 flex items-center justify-center rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]" title="Zoom Out">
          <Icon name="zoomOut" size={16} />
        </button>
        <span className="text-xs text-[var(--text-tertiary)] w-12 text-center">{zoom.pxPerSec}px/s</span>
        <button onClick={zoom.zoomIn} className="w-7 h-7 flex items-center justify-center rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]" title="Zoom In">
          <Icon name="zoomIn" size={16} />
        </button>
      </div>
    </div>
  );
}

// ============================================
// TIME RULER
// ============================================
function TimeRuler({ duration, pxPerSec, scrollLeft }) {
  const ticks = [];
  const totalSeconds = Math.max(duration, 60);
  
  for (let i = 0; i <= totalSeconds; i++) {
    const x = i * pxPerSec;
    const isMajor = i % 5 === 0;
    
    ticks.push(
      <div key={i} className="absolute" style={{ left: `${x}px` }}>
        <div className={isMajor ? 'w-0.5 h-3 bg-[var(--text-tertiary)]' : 'w-px h-2 bg-[var(--border-subtle)]'} />
        {isMajor && (
          <span className="absolute text-[9px] text-[var(--text-tertiary)] font-mono -translate-x-1/2" style={{ top: '14px', left: '0' }}>
            {Math.floor(i / 60)}:{String(i % 60).padStart(2, '0')}
          </span>
        )}
      </div>
    );
  }
  
  return (
    <div className="h-8 bg-[var(--bg-panel)] border-b border-[var(--border-subtle)] relative overflow-hidden" style={{ marginLeft: '150px' }}>
      <div className="absolute top-2" style={{ transform: `translateX(-${scrollLeft}px)` }}>
        {ticks}
      </div>
    </div>
  );
}

// ============================================
// CLIP COMPONENT
// ============================================
function Clip({ clip, track, pxPerSec, isSelected, onSelect, onTrim, onMove }) {
  const [trimming, setTrimming] = useState(null); // 'start' | 'end' | null
  const [dragging, setDragging] = useState(false);
  const clipRef = useRef(null);
  const startPosRef = useRef({ x: 0, clipStart: 0, clipDuration: 0 });

  const clipWidth = Math.max(40, clip.duration * pxPerSec);
  const clipLeft = clip.start * pxPerSec;

  const getClipColor = () => {
    switch (clip.type) {
      case 'video': return 'from-blue-500 to-blue-600';
      case 'audio': return 'from-green-500 to-green-600';
      case 'image': return 'from-purple-500 to-purple-600';
      case 'text': return 'from-yellow-500 to-yellow-600';
      default: return 'from-[var(--accent-turquoise)] to-[var(--accent-blue)]';
    }
  };

  const handleMouseDown = (e, action) => {
    e.stopPropagation();
    
    if (action === 'move') {
      setDragging(true);
      startPosRef.current = {
        x: e.clientX,
        clipStart: clip.start,
        clipDuration: clip.duration
      };
    } else if (action === 'trimStart' || action === 'trimEnd') {
      setTrimming(action === 'trimStart' ? 'start' : 'end');
      startPosRef.current = {
        x: e.clientX,
        clipStart: clip.start,
        clipDuration: clip.duration
      };
    }
    
    onSelect(clip.id);
  };

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (!trimming && !dragging) return;
      
      const deltaX = e.clientX - startPosRef.current.x;
      const deltaTime = deltaX / pxPerSec;

      if (trimming === 'start') {
        const newStart = Math.max(0, startPosRef.current.clipStart + deltaTime);
        const maxStart = startPosRef.current.clipStart + startPosRef.current.clipDuration - 0.5;
        const clampedStart = Math.min(newStart, maxStart);
        const newDuration = startPosRef.current.clipDuration - (clampedStart - startPosRef.current.clipStart);
        onTrim(clip.id, clampedStart, newDuration);
      } else if (trimming === 'end') {
        const newDuration = Math.max(0.5, startPosRef.current.clipDuration + deltaTime);
        onTrim(clip.id, clip.start, newDuration);
      } else if (dragging) {
        const newStart = Math.max(0, startPosRef.current.clipStart + deltaTime);
        onMove(clip.id, track.id, newStart);
      }
    };

    const handleMouseUp = () => {
      setTrimming(null);
      setDragging(false);
    };

    if (trimming || dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [trimming, dragging, clip, track, pxPerSec, onTrim, onMove]);

  return (
    <div
      ref={clipRef}
      className={`
        absolute top-1 bottom-1 rounded-md cursor-pointer transition-shadow
        bg-gradient-to-br ${getClipColor()}
        ${isSelected ? 'ring-2 ring-white shadow-lg' : 'hover:brightness-110'}
      `}
      style={{
        left: `${clipLeft}px`,
        width: `${clipWidth}px`,
        minWidth: '40px'
      }}
      onMouseDown={(e) => handleMouseDown(e, 'move')}
    >
      {/* Trim Handle Left */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 rounded-l-md"
        onMouseDown={(e) => handleMouseDown(e, 'trimStart')}
      />

      {/* Content */}
      <div className="px-2 py-1 h-full flex flex-col justify-between overflow-hidden pointer-events-none">
        <span className="text-xs font-medium text-white truncate">{clip.title}</span>
        <span className="text-[10px] text-white/70">{clip.duration.toFixed(1)}s</span>
      </div>

      {/* Trim Handle Right */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 rounded-r-md"
        onMouseDown={(e) => handleMouseDown(e, 'trimEnd')}
      />

      {/* Type Icon */}
      <div className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center pointer-events-none">
        <Icon name={clip.type === 'audio' ? 'audio' : clip.type === 'text' ? 'text' : 'video'} size={12} className="text-white/50" />
      </div>
    </div>
  );
}

// ============================================
// TRACK COMPONENT
// ============================================
function Track({ track, index, pxPerSec, selectedClipId, onClipSelect, onClipTrim, onClipMove, onDrop }) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const dropTime = Math.max(0, x / pxPerSec);
    
    onDrop(e, track.id, dropTime);
  };

  const getTrackIcon = () => {
    if (track.type === 'audio') return 'audio';
    if (track.type === 'video') return 'video';
    return 'layers';
  };

  return (
    <div className="flex border-b border-[var(--border-subtle)]" style={{ height: '64px' }}>
      {/* Track Label */}
      <div className="w-[150px] flex-shrink-0 bg-[var(--bg-panel)] border-r border-[var(--border-subtle)] flex items-center gap-2 px-3">
        <Icon name={getTrackIcon()} size={14} className="text-[var(--text-tertiary)]" />
        <span className="text-xs text-[var(--text-secondary)] truncate">{track.name}</span>
        <div className="ml-auto flex items-center gap-1">
          <button className="w-5 h-5 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)]" title="Mute">
            <Icon name="audio" size={12} />
          </button>
          <button className="w-5 h-5 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)]" title="Lock">
            <Icon name="lock" size={12} />
          </button>
        </div>
      </div>

      {/* Track Content */}
      <div
        className={`flex-1 relative ${dragOver ? 'bg-[var(--accent-turquoise)]/10' : 'bg-[var(--bg-main)]'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {track.clips?.length > 0 ? (
          track.clips.map(clip => (
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
          ))
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-xs text-[var(--text-tertiary)] border border-dashed border-[var(--border-subtle)] rounded px-4 py-2">
              Medien hierher ziehen
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function TimelinePanel() {
  const { state, dispatch, playhead, zoom } = useEditor();
  const timelineRef = useRef(null);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleScroll = (e) => {
    setScrollLeft(e.currentTarget.scrollLeft);
  };

  const handleClipSelect = useCallback((clipId) => {
    dispatch({ type: 'SELECT_CLIP', payload: clipId });
  }, [dispatch]);

  const handleClipTrim = useCallback((clipId, newStart, newDuration) => {
    dispatch({
      type: 'TRIM_CLIP',
      payload: { clipId, newStart, newDuration }
    });
  }, [dispatch]);

  const handleClipMove = useCallback((clipId, trackId, newStart) => {
    if (state.snapping) {
      newStart = Math.round(newStart * 2) / 2; // Snap to 0.5s
    }
    dispatch({
      type: 'MOVE_CLIP',
      payload: { clipId, trackId, newStart }
    });
  }, [dispatch, state.snapping]);

  const handleDrop = useCallback((e, trackId, dropTime) => {
    const mediaId = e.dataTransfer.getData('mediaId');
    if (!mediaId) return;

    const mediaItem = state.media.find(m => m.id === mediaId);
    if (!mediaItem) return;

    const track = state.tracks.find(t => t.id === trackId);
    if (!track) return;

    // Check type compatibility
    if (track.type === 'audio' && mediaItem.type !== 'audio') {
      console.warn('Only audio can be dropped on audio tracks');
      return;
    }
    if (track.type === 'video' && mediaItem.type === 'audio') {
      console.warn('Audio cannot be dropped on video tracks');
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
      props: {
        opacity: 100,
        scale: 100,
        volume: mediaItem.type === 'audio' ? 100 : 0
      }
    };

    dispatch({
      type: 'ADD_CLIP_TO_TRACK',
      payload: { trackId, clip: newClip }
    });

    console.log(`✅ Added clip "${newClip.title}" to track "${track.name}" at ${newClip.start.toFixed(1)}s`);
  }, [state.media, state.tracks, state.snapping, dispatch]);

  const handleAddTrack = (type) => {
    const trackCount = state.tracks.filter(t => t.type === type).length + 1;
    const newTrack = {
      id: `${type}_${Date.now()}`,
      name: `${type === 'video' ? 'Video' : 'Audio'} Track ${trackCount}`,
      type: type,
      clips: []
    };
    dispatch({
      type: 'ADD_TRACK',
      payload: { track: newTrack, position: type === 'video' ? 0 : state.tracks.length }
    });
  };

  const handleTimelineClick = (e) => {
    // Click on timeline ruler to seek
    if (e.target.closest('.time-ruler-clickable')) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left - 150 + scrollLeft;
      const time = Math.max(0, x / zoom.pxPerSec);
      playhead.seek(time);
    }
  };

  // Calculate timeline width
  const timelineWidth = Math.max(state.projectDuration || 180, 60) * zoom.pxPerSec + 500;

  return (
    <div className="h-full flex flex-col bg-[var(--bg-main)]">
      {/* Toolbar */}
      <TimelineToolbar />

      {/* Time Ruler */}
      <div className="time-ruler-clickable cursor-pointer" onClick={handleTimelineClick}>
        <TimeRuler duration={state.projectDuration || 180} pxPerSec={zoom.pxPerSec} scrollLeft={scrollLeft} />
      </div>

      {/* Tracks Container */}
      <div 
        ref={timelineRef}
        className="flex-1 overflow-auto relative"
        onScroll={handleScroll}
      >
        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-50"
          style={{
            left: `${150 + playhead.currentTime * zoom.pxPerSec}px`,
            transition: playhead.playing ? 'none' : 'left 0.1s'
          }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rotate-45" />
        </div>

        {/* Tracks */}
        <div style={{ width: `${timelineWidth}px`, minWidth: '100%' }}>
          {state.tracks.length === 0 ? (
            <div className="h-32 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-[var(--text-tertiary)] mb-3">Keine Tracks vorhanden</p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => handleAddTrack('video')}
                    className="px-3 py-1.5 bg-[var(--accent-turquoise)] text-white text-xs rounded hover:opacity-90"
                  >
                    + Video Track
                  </button>
                  <button
                    onClick={() => handleAddTrack('audio')}
                    className="px-3 py-1.5 bg-green-500 text-white text-xs rounded hover:opacity-90"
                  >
                    + Audio Track
                  </button>
                </div>
              </div>
            </div>
          ) : (
            state.tracks.map((track, index) => (
              <Track
                key={track.id}
                track={track}
                index={index}
                pxPerSec={zoom.pxPerSec}
                selectedClipId={state.selectedClipId}
                onClipSelect={handleClipSelect}
                onClipTrim={handleClipTrim}
                onClipMove={handleClipMove}
                onDrop={handleDrop}
              />
            ))
          )}

          {/* Add Track Button */}
          {state.tracks.length > 0 && (
            <div className="flex border-b border-[var(--border-subtle)]" style={{ height: '40px' }}>
              <div className="w-[150px] flex-shrink-0 bg-[var(--bg-panel)] border-r border-[var(--border-subtle)] flex items-center justify-center gap-2">
                <button
                  onClick={() => handleAddTrack('video')}
                  className="px-2 py-1 text-xs text-[var(--accent-turquoise)] hover:bg-[var(--bg-hover)] rounded"
                >
                  + Video
                </button>
                <button
                  onClick={() => handleAddTrack('audio')}
                  className="px-2 py-1 text-xs text-green-400 hover:bg-[var(--bg-hover)] rounded"
                >
                  + Audio
                </button>
              </div>
              <div className="flex-1 bg-[var(--bg-main)]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
