/**
 * TimelinePanel.jsx - Timeline mit Toolbar und Zeitstrahl
 */

import React from 'react';
import { useEditor } from './EditorLayout';
import { secondsToTimecode } from '../../utils/timecode';
import Icon from './Icon';

// Timeline Toolbar
function TimelineToolbar() {
  const { playhead, state, undo, redo, canUndo, canRedo, dispatch, handleOpenKeyframes, handleOpenSpeed } = useEditor();

  // Split Clip at Playhead
  const handleSplit = () => {
    if (!state.selectedClipId) {
      // Finde alle Clips unter dem Playhead
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
    } else {
      // Splitte nur den ausgewählten Clip
      dispatch({
        type: 'SPLIT_CLIP',
        payload: { clipId: state.selectedClipId, splitTime: playhead.currentTime }
      });
    }
  };

  // Delete selected clips
  const handleDelete = () => {
    if (state.selectedClipId) {
      dispatch({ type: 'DELETE_CLIP', payload: { clipId: state.selectedClipId } });
    } else if (state.selectedClipIds?.length > 0) {
      state.selectedClipIds.forEach(clipId => {
        dispatch({ type: 'DELETE_CLIP', payload: { clipId } });
      });
    }
  };

  // Copy/Paste handlers
  const handleCopy = () => {
    if (state.selectedClipIds?.length > 0 || state.selectedClipId) {
      dispatch({ type: 'COPY_CLIPS' });
    }
  };

  const handlePaste = () => {
    dispatch({ type: 'PASTE_CLIPS', payload: { pasteTime: playhead.currentTime } });
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignoriere wenn in Input-Feld
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === ' ') {
        e.preventDefault();
        playhead.playing ? playhead.pause() : playhead.play();
      } else if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        // Save wird von TopToolbar gehandled
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) || (e.key === 'y' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        redo();
      } else if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleCopy();
      } else if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handlePaste();
      } else if (e.key === 'b' || e.key === 'B') {
        // Split at playhead (wie in CapCut)
        e.preventDefault();
        handleSplit();
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
      {/* Left: Timeline Tools */}
      <div className="flex items-center gap-1">
        <button 
          onClick={undo}
          disabled={!canUndo}
          className="w-9 h-9 flex items-center justify-center rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all disabled:opacity-30"
          title="Rückgängig (Strg+Z)"
        >
          <Icon name="undo" size={18} strokeWidth={1.5} />
        </button>
        <button 
          onClick={redo}
          disabled={!canRedo}
          className="w-9 h-9 flex items-center justify-center rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all disabled:opacity-30"
          title="Wiederherstellen (Strg+Y)"
        >
          <Icon name="redo" size={18} strokeWidth={1.5} />
        </button>
        <div className="w-px h-6 bg-[var(--border-subtle)] mx-1"></div>
        <button 
          onClick={handleSplit}
          className="w-9 h-9 flex items-center justify-center rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all" 
          title="Teilen (B)"
        >
          <Icon name="split" size={18} strokeWidth={1.5} />
        </button>
        <button 
          onClick={handleDelete}
          disabled={!state.selectedClipId && (!state.selectedClipIds || state.selectedClipIds.length === 0)}
          className="w-9 h-9 flex items-center justify-center rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all disabled:opacity-30" 
          title="Löschen (Entf)"
        >
          <Icon name="delete" size={18} strokeWidth={1.5} />
        </button>
        <button 
          onClick={() => dispatch({ type: 'TOGGLE_SNAP' })}
          className={`w-9 h-9 flex items-center justify-center rounded transition-all ${state.snapping ? 'text-[var(--accent-turquoise)] bg-[var(--bg-hover)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          title="Snap"
        >
          <Icon name="snap" size={18} strokeWidth={1.5} />
        </button>
        <button 
          onClick={handleCopy}
          disabled={!state.selectedClipId && (!state.selectedClipIds || state.selectedClipIds.length === 0)}
          className="w-9 h-9 flex items-center justify-center rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all disabled:opacity-30" 
          title="Kopieren (Strg+C)"
        >
          <Icon name="link" size={18} strokeWidth={1.5} />
        </button>
      </div>

      {/* Center: Transport Controls */}
      <div className="flex-1 flex items-center justify-center gap-2">
        <button 
          onClick={() => playhead.seek(Math.max(0, playhead.currentTime - 1 / state.fps))}
          className="w-7 h-7 flex items-center justify-center rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
          title="Frame zurück"
        >
          <Icon name="frameBack" size={16} strokeWidth={1.5} />
        </button>
        <button 
          onClick={playhead.playing ? playhead.pause : playhead.play}
          className="w-9 h-9 flex items-center justify-center rounded bg-[var(--accent-turquoise)] text-white hover:opacity-90 transition-all"
          title={playhead.playing ? 'Pause' : 'Play'}
        >
          <Icon name={playhead.playing ? 'pause' : 'play'} size={18} strokeWidth={1.5} />
        </button>
        <button 
          onClick={playhead.stop}
          className="w-7 h-7 flex items-center justify-center rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
          title="Stop"
        >
          <Icon name="stop" size={16} strokeWidth={1.5} />
        </button>
        <button 
          onClick={() => playhead.seek(playhead.currentTime + 1 / state.fps)}
          className="w-7 h-7 flex items-center justify-center rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
          title="Frame vorwärts"
        >
          <Icon name="frameForward" size={16} strokeWidth={1.5} />
        </button>
      </div>

      {/* Right: Zoom Tools + Timecode + FPS */}
      <div className="flex items-center gap-1.5">
        <button 
          onClick={() => dispatch({ type: 'TOGGLE_RIPPLE' })}
          className={`w-9 h-9 flex items-center justify-center rounded transition-all ${state.rippleMode ? 'text-[var(--accent-turquoise)] bg-[var(--bg-hover)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          title="Ripple"
        >
          <Icon name="ripple" size={18} strokeWidth={1.5} />
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all" title="Zoom Out">
          <Icon name="zoomOut" size={18} strokeWidth={1.5} />
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all" title="Zoom In">
          <Icon name="zoomIn" size={18} strokeWidth={1.5} />
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all" title="Fit">
          <Icon name="fit" size={18} strokeWidth={1.5} />
        </button>
        <div className="w-px h-6 bg-[var(--border-subtle)] mx-1"></div>
        <div className="text-sm text-[var(--text-secondary)] font-mono" style={{ fontSize: '11px' }}>
          {secondsToTimecode(playhead.currentTime, state.fps)}
        </div>
        <span className="text-sm text-[var(--text-tertiary)]" style={{ fontSize: '11px' }}>
          {state.fps}fps
        </span>
      </div>
    </div>
  );
}

// Gestrichelter Zeitstrahl - minimalistisch
function DashedTimeline({ duration, pxPerSec }) {
  const width = duration * pxPerSec + 2000; // Extra Breite
  return (
    <div 
      className="absolute top-0 left-[200px] border-t-2 border-dashed"
      style={{ 
        width: `${width}px`,
        borderColor: '#6b7280' // Hellere Farbe für bessere Sichtbarkeit
      }}
    />
  );
}

// Zeitstrahl mit Ticks (kurze Striche)
function TimeRuler({ duration, pxPerSec }) {
  const ticks = [];
  const totalSeconds = Math.max(duration, 60);
  
  for (let i = 0; i <= totalSeconds; i++) {
    const x = i * pxPerSec;
    const isMajor = i % 5 === 0; // Jede 5. Sekunde ist größer
    
    ticks.push(
      <div 
        key={i} 
        className="absolute" 
        style={{ left: `${x}px`, top: 0 }}
      >
        {/* Tick Mark - Major Ticks sind länger UND dicker */}
        <div 
          className={`${
            isMajor 
              ? 'w-[2px] h-4'  // Major: 2px breit, 16px hoch
              : 'w-px h-2'      // Normal: 1px breit, 8px hoch
          }`}
          style={{
            backgroundColor: isMajor ? '#9ca3af' : '#6b7280'
          }}
        />
        {/* Zeit-Label bei Major Ticks */}
        {isMajor && (
          <div 
            className="absolute text-[var(--text-tertiary)] font-mono"
            style={{ 
              fontSize: '9px', 
              top: '18px',
              left: '-8px',
              width: '30px',
              textAlign: 'center'
            }}
          >
            {Math.floor(i / 60)}:{String(i % 60).padStart(2, '0')}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div 
      className="relative bg-[var(--bg-panel)] border-b border-[var(--border-subtle)]"
      style={{ 
        height: '32px',
        marginLeft: '200px',
        overflow: 'hidden'
      }}
    >
      {ticks}
    </div>
  );
}

export default function TimelinePanel() {
  const { state, zoom, dispatch, playhead } = useEditor();
  const timelineRef = React.useRef(null);

  // Hilfsfunktion: Finde Track unter Maus-Position (Y-Koordinate)
  const findTrackAtPosition = (clientY) => {
    if (!timelineRef.current) {
      console.log('⚠️ timelineRef.current ist null');
      return null;
    }

    const timelineRect = timelineRef.current.getBoundingClientRect();
    
    // Relativ zum Timeline-Scroll-Container + Scroll-Offset
    const relativeY = clientY - timelineRect.top + timelineRef.current.scrollTop;
    
    // Berücksichtige DashedTimeline (2px) + TimeRuler (32px) = 34px Offset
    const trackStartY = 34;
    const trackHeight = 80; // Nur Track (80px), keine Drop-Zone mehr
    
    const trackIndex = Math.floor((relativeY - trackStartY) / trackHeight);
    
    console.log(`🔍 findTrackAtPosition: clientY=${clientY}, relativeY=${relativeY}, scrollTop=${timelineRef.current.scrollTop}, trackIndex=${trackIndex}, totalTracks=${state.tracks.length}`);
    
    if (trackIndex >= 0 && trackIndex < state.tracks.length) {
      console.log(`✅ Track gefunden: ${state.tracks[trackIndex].name}`);
      return state.tracks[trackIndex];
    }
    console.log('❌ Kein Track bei diesem Index');
    return null;
  };

  const handleDrop = (e, trackId) => {
    e.preventDefault();
    e.stopPropagation(); // Verhindere, dass handleTimelineDrop auch feuert
    
    const mediaId = e.dataTransfer.getData('mediaId');
    const clipId = e.dataTransfer.getData('clipId');
    const sourceTrackId = e.dataTransfer.getData('trackId');
    
    // Prüfe ob wir ÜBER oder UNTER dem Track sind (30% Zonen)
    if (mediaId && !clipId) {
      const trackRect = e.currentTarget.getBoundingClientRect();
      const relativeY = e.clientY - trackRect.top;
      const trackHeight = trackRect.height;
      const trackOffset = relativeY / trackHeight; // 0 bis 1
      
      const isAboveTrack = trackOffset < 0.3; // Obere 30%
      const isBelowTrack = trackOffset > 0.7; // Untere 30%
      
      // Wenn in ÜBER oder UNTER Zone, lass handleTimelineDrop die Arbeit machen
      if (isAboveTrack || isBelowTrack) {
        console.log(`⚠️ Drop in ÜBER/UNTER Zone erkannt, ignoriere Track-Drop`);
        return;
      }
    }
    
    // Finde den Ziel-Track
    const targetTrack = state.tracks.find(t => t.id === trackId);
    if (!targetTrack) return;

    const isMainTrack = targetTrack.type === 'audio' && targetTrack.id === 't2';

    // FALL 1: Clip von anderem Track verschieben
    if (clipId && sourceTrackId) {
      const sourceTrack = state.tracks.find(t => t.id === sourceTrackId);
      if (!sourceTrack) return;
      
      const clip = sourceTrack.clips.find(c => c.id === clipId);
      if (!clip) return;

      // Berechne neue Position
      let newStart = 0;
      
      if (isMainTrack) {
        // Main Track: Lückenlos
        if (targetTrack.clips && targetTrack.clips.length > 0) {
          const lastClip = targetTrack.clips.reduce((latest, c) => {
            const clipEnd = c.start + c.duration;
            return clipEnd > (latest.start + latest.duration) ? c : latest;
          });
          newStart = lastClip.start + lastClip.duration;
        }
      } else {
        // Andere Tracks: Position aus X-Koordinate
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - 200;
        newStart = Math.max(0, x / zoom.pxPerSec);
        
        if (state.snapping) {
          newStart = Math.round(newStart * 10) / 10;
        }
      }

      // Verschiebe Clip zwischen Tracks
      dispatch({
        type: 'MOVE_CLIP_BETWEEN_TRACKS',
        payload: {
          clipId: clipId,
          sourceTrackId: sourceTrackId,
          targetTrackId: trackId,
          newStart: newStart
        }
      });

      console.log(`🔄 Clip "${clip.title}" moved from "${sourceTrack.name}" to "${targetTrack.name}" at ${newStart.toFixed(1)}s`);
      return;
    }

    // FALL 2: Neues Media-Item hinzufügen
    if (!mediaId) return;

    const mediaItem = state.media.find(m => m.id === mediaId);
    if (!mediaItem) return;

    // Berechne Start-Position
    let startPosition = 0;
    
    if (isMainTrack) {
      // Main Track: Clips müssen lückenlos sein
      if (targetTrack.clips && targetTrack.clips.length > 0) {
        const lastClip = targetTrack.clips.reduce((latest, clip) => {
          const clipEnd = clip.start + clip.duration;
          return clipEnd > (latest.start + latest.duration) ? clip : latest;
        });
        startPosition = lastClip.start + lastClip.duration;
      }
    } else {
      // Andere Tracks: Position basierend auf Drop-Position (X-Koordinate)
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left - 200; // 200px für linken Rand
      startPosition = Math.max(0, x / zoom.pxPerSec);
      
      // Runde auf nächste 0.1 Sekunde für Snap
      if (state.snapping) {
        startPosition = Math.round(startPosition * 10) / 10;
      }
    }

    // Bestimme Duration basierend auf Media-Typ
    let duration = 2; // Default für Bilder
    if (mediaItem.type === 'video' || mediaItem.type === 'audio') {
      duration = mediaItem.duration || 5;
    }

    // Generiere eine eindeutige ID (UUID-ähnlich)
    const generateId = () => {
      return 'clip_' + crypto.randomUUID();
    };

    // Erstelle neuen Clip
    const newClip = {
      id: generateId(),
      mediaId: mediaItem.id,
      title: mediaItem.name,
      start: startPosition,
      duration: duration,
      type: mediaItem.type,
      thumbnail: mediaItem.thumbnail || 'placeholder',
      props: {
        opacity: 100,
        scale: 100,
        rotation: 0,
        volume: mediaItem.type === 'audio' ? 100 : 0
      }
    };

    // Füge Clip zum Track hinzu
    dispatch({
      type: 'ADD_CLIP_TO_TRACK',
      payload: {
        trackId: trackId,
        clip: newClip
      }
    });

    console.log(`✅ Clip "${newClip.title}" added to track "${targetTrack.name}" at ${startPosition.toFixed(1)}s`);
  };

  // Drop in der "Zwischen-Zone" über einem Track
  const handleDropBetweenTracks = (e, trackIndex) => {
    e.preventDefault();
    const mediaId = e.dataTransfer.getData('mediaId');
    
    if (!mediaId) return;

    // Finde das Media-Item
    const mediaItem = state.media.find(m => m.id === mediaId);
    if (!mediaItem) return;

    // Nur für Video/Bild - Audio nicht auf Video-Tracks
    if (mediaItem.type === 'audio') {
      console.log('⚠️ Audio-Dateien können nicht auf Video-Tracks gezogen werden');
      return;
    }

    // Erstelle neuen Video-Track
    const newTrackId = `vt${Date.now()}`;
    const videoTrackCount = state.tracks.filter(t => t.type === 'video').length + 1;
    
    // Bestimme Duration
    let duration = 2; // Default für Bilder
    if (mediaItem.type === 'video') {
      duration = mediaItem.duration || 5;
    }

    // Erstelle Clip für neuen Track
    const newClip = {
      id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      mediaId: mediaItem.id,
      title: mediaItem.name,
      start: 0, // Neuer Track startet bei 0
      duration: duration,
      type: mediaItem.type,
      thumbnail: mediaItem.thumbnail || 'placeholder',
      props: {
        opacity: 100,
        scale: 100,
        rotation: 0,
        volume: 0
      }
    };

    const newTrack = {
      id: newTrackId,
      name: `Video Track ${videoTrackCount}`,
      type: 'video',
      clips: [newClip]
    };

    // Füge Track über dem aktuellen Track hinzu
    dispatch({
      type: 'ADD_TRACK',
      payload: {
        track: newTrack,
        position: trackIndex // Position über dem aktuellen Track
      }
    });

    console.log(`✅ Neuer Track "${newTrack.name}" erstellt mit Clip "${newClip.title}"`);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Globaler Drop-Handler für die Timeline
  const handleTimelineDrop = (e) => {
    e.preventDefault();
    
    const mediaId = e.dataTransfer.getData('mediaId');
    const clipId = e.dataTransfer.getData('clipId');
    
    // Nur für neue Medien-Dateien (nicht für Clip-Verschiebungen)
    if (!mediaId || clipId) return;
    
    const mediaItem = state.media.find(m => m.id === mediaId);
    if (!mediaItem) return;
    
    // Nur für Video/Bild - Audio nicht auf Video-Tracks
    if (mediaItem.type === 'audio') {
      console.log('⚠️ Audio-Dateien können nicht auf Video-Tracks gezogen werden');
      return;
    }
    
    // Berechne Y-Position
    const timelineRect = timelineRef.current.getBoundingClientRect();
    const relativeY = e.clientY - timelineRect.top + timelineRef.current.scrollTop;
    const trackStartY = 34; // DashedTimeline (2px) + TimeRuler (32px)
    const trackHeight = 80;
    
    // Berechne Track-Index
    const floatTrackIndex = (relativeY - trackStartY) / trackHeight;
    const trackIndex = Math.floor(floatTrackIndex);
    
    // Prüfe ob Drop ÜBER oder UNTER einen Track ist
    const trackOffset = floatTrackIndex - trackIndex; // 0 bis 1
    const isAboveTrack = trackOffset < 0.3; // Obere 30% des Tracks
    const isBelowTrack = trackOffset > 0.7; // Untere 30% des Tracks
    
    console.log(`🎯 Timeline Drop: floatIndex=${floatTrackIndex.toFixed(2)}, trackIndex=${trackIndex}, offset=${trackOffset.toFixed(2)}, isAbove=${isAboveTrack}, isBelow=${isBelowTrack}`);
    
    // FALL 1: Drop ÜBER oder UNTER einem Track → Neuer Track erstellen
    if ((isAboveTrack || isBelowTrack) && trackIndex >= 0 && trackIndex < state.tracks.length) {
      // Berechne X-Position für den neuen Clip
      const x = e.clientX - timelineRect.left - 200;
      let startPosition = Math.max(0, x / zoom.pxPerSec);
      
      if (state.snapping) {
        startPosition = Math.round(startPosition * 10) / 10;
      }
      
      // Bestimme Duration
      let duration = 2; // Default für Bilder
      if (mediaItem.type === 'video') {
        duration = mediaItem.duration || 5;
      }
      
      // Erstelle neuen Video-Track
      const newTrackId = `vt${Date.now()}`;
      const videoTrackCount = state.tracks.filter(t => t.type === 'video').length + 1;
      
      const newClip = {
        id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        mediaId: mediaItem.id,
        title: mediaItem.name,
        start: startPosition,
        duration: duration,
        type: mediaItem.type,
        thumbnail: mediaItem.thumbnail || 'placeholder',
        props: {
          opacity: 100,
          scale: 100,
          rotation: 0,
          volume: 0
        }
      };
      
      const newTrack = {
        id: newTrackId,
        name: `Video Track ${videoTrackCount}`,
        type: 'video',
        clips: [newClip]
      };
      
      // Position: Wenn ÜBER Track, füge VOR trackIndex ein; wenn UNTER, füge NACH trackIndex ein
      const insertPosition = isAboveTrack ? trackIndex : trackIndex + 1;
      
      dispatch({
        type: 'ADD_TRACK',
        payload: {
          track: newTrack,
          position: insertPosition
        }
      });
      
      console.log(`✅ Neuer Track "${newTrack.name}" erstellt an Position ${insertPosition} mit Clip bei ${startPosition.toFixed(1)}s`);
      return;
    }
    
    // FALL 2: Normaler Drop in die Mitte eines Tracks → Weiterleiten an handleDrop
    // Dies wird bereits durch die Track-spezifischen onDrop Handler abgefangen
  };

  return (
    <section className="h-full bg-[var(--bg-main)] flex flex-col relative">
      {/* Timeline Toolbar OBEN */}
      <TimelineToolbar />

      {/* Scrollbarer Timeline-Bereich */}
      <div 
        ref={timelineRef} 
        className="flex-1 overflow-auto relative"
        onDrop={handleTimelineDrop}
        onDragOver={handleDragOver}
      >
        {/* Gestrichelter Zeitstrahl oben, beginnt bei 200px */}
        <DashedTimeline duration={state.projectDuration || 60} pxPerSec={zoom.pxPerSec} />

        {/* Zeitstrahl mit Ticks direkt darunter */}
        <TimeRuler duration={state.projectDuration || 60} pxPerSec={zoom.pxPerSec} />

        {/* Roter Playhead-Strich */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-50"
          style={{
            left: `${200 + playhead.currentTime * zoom.pxPerSec}px`,
            transition: playhead.playing ? 'none' : 'left 0.1s ease-out'
          }}
        >
          {/* Playhead-Kopf (Dreieck oben) */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-red-500"
          />
        </div>

        {/* Track Bereiche */}
        <div className="flex-1">
          {state.tracks.map((track, idx) => (
            <div key={track.id}>
              {/* Eigentlicher Track - Keine Hintergrundfarbe, keine Border */}
              <div 
                className="relative"
                style={{ height: '80px' }}
                onDrop={(e) => handleDrop(e, track.id)}
                onDragOver={handleDragOver}
              >
              {track?.clips?.length > 0 ? (
                // Clips rendern
                <div className="h-full relative" style={{ marginLeft: '200px' }}>
                  {track.clips.map(clip => {
                    const isMainTrack = track.type === 'audio' && track.id === 't2';
                    
                    return (
                      <div
                        key={clip.id}
                        className="absolute top-2 h-16 bg-gradient-to-br from-[var(--accent-turquoise)] to-[var(--accent-blue)] rounded border border-[var(--accent-turquoise)]/50 flex flex-col justify-between p-2 cursor-move shadow-lg"
                        style={{
                          left: `${clip.start * zoom.pxPerSec}px`,
                          width: `${clip.duration * zoom.pxPerSec}px`,
                          minWidth: '60px'
                        }}
                        draggable={true} // Alle Clips sind jetzt draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('clipId', clip.id);
                          e.dataTransfer.setData('trackId', track.id);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragEnd={(e) => {
                          const clipRect = e.currentTarget.getBoundingClientRect();
                          const clipCenterY = clipRect.top + clipRect.height / 2;
                          
                          // Prüfe: Ist der Clip ÜBER oder UNTER einem bestehenden Track?
                          const timelineRect = timelineRef.current.getBoundingClientRect();
                          const relativeY = clipCenterY - timelineRect.top + timelineRef.current.scrollTop;
                          const trackStartY = 34; // DashedTimeline (2px) + TimeRuler (32px)
                          const trackHeight = 80;
                          
                          // Berechne ungefähren Track-Index basierend auf Y-Position
                          const floatTrackIndex = (relativeY - trackStartY) / trackHeight;
                          const trackIndex = Math.floor(floatTrackIndex);
                          
                          // Prüfe ob Clip zwischen Tracks ist (über oder unter)
                          const trackOffset = floatTrackIndex - trackIndex; // 0 bis 1
                          const isAboveTrack = trackOffset < 0.3; // Obere 30% des Tracks
                          const isBelowTrack = trackOffset > 0.7; // Untere 30% des Tracks
                          
                          console.log(`🎯 DragEnd: floatIndex=${floatTrackIndex.toFixed(2)}, trackIndex=${trackIndex}, offset=${trackOffset.toFixed(2)}, isAbove=${isAboveTrack}, isBelow=${isBelowTrack}`);
                          
                          // FALL 1: Clip wird ÜBER oder UNTER einen Track gezogen → Neuer Track erstellen
                          if ((isAboveTrack || isBelowTrack) && trackIndex >= 0 && trackIndex < state.tracks.length) {
                            const mediaItem = state.media.find(m => m.id === clip.mediaId);
                            if (!mediaItem) return;
                            
                            // Nur Video/Bild - Audio nicht auf Video-Tracks
                            if (mediaItem.type === 'audio') {
                              console.log('⚠️ Audio-Dateien können nicht auf Video-Tracks gezogen werden');
                              return;
                            }
                            
                            // Berechne X-Position für den neuen Clip
                            const rect = timelineRect;
                            const x = e.clientX - rect.left - 200;
                            let startPosition = Math.max(0, x / zoom.pxPerSec);
                            
                            if (state.snapping) {
                              startPosition = Math.round(startPosition * 10) / 10;
                            }
                            
                            // Erstelle neuen Video-Track
                            const newTrackId = `vt${Date.now()}`;
                            const videoTrackCount = state.tracks.filter(t => t.type === 'video').length + 1;
                            
                            const newClip = {
                              id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                              mediaId: mediaItem.id,
                              title: mediaItem.name,
                              start: startPosition,
                              duration: clip.duration,
                              type: mediaItem.type,
                              thumbnail: mediaItem.thumbnail || 'placeholder',
                              props: { ...clip.props }
                            };
                            
                            const newTrack = {
                              id: newTrackId,
                              name: `Video Track ${videoTrackCount}`,
                              type: 'video',
                              clips: [newClip]
                            };
                            
                            // Position: Wenn ÜBER Track, füge VOR trackIndex ein; wenn UNTER, füge NACH trackIndex ein
                            const insertPosition = isAboveTrack ? trackIndex : trackIndex + 1;
                            
                            // Entferne Clip aus altem Track
                            dispatch({
                              type: 'DELETE_CLIP',
                              payload: { clipId: clip.id }
                            });
                            
                            // Füge neuen Track hinzu
                            dispatch({
                              type: 'ADD_TRACK',
                              payload: {
                                track: newTrack,
                                position: insertPosition
                              }
                            });
                            
                            console.log(`✅ Neuer Track "${newTrack.name}" erstellt an Position ${insertPosition} mit Clip bei ${startPosition.toFixed(1)}s`);
                            return;
                          }
                          
                          // FALL 2: Clip bleibt im normalen Track-Bereich
                          const targetTrack = findTrackAtPosition(clipCenterY);
                          
                          if (!targetTrack) {
                            console.log('⚠️ Kein Track unter Maus-Position gefunden');
                            return;
                          }
                          
                          const isDifferentTrack = targetTrack.id !== track.id;

                          // Berechne neue Position (X-Koordinate)
                          const rect = e.currentTarget.parentElement.getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          let newStart = Math.max(0, x / zoom.pxPerSec);
                          
                          // Snap to grid
                          if (state.snapping) {
                            newStart = Math.round(newStart * 10) / 10;
                          }

                          const isMainTrack = track.type === 'audio' && track.id === 't2';

                          // FALL 1: Main Track Neuordnung (bleibt im Main Track)
                          if (isMainTrack && !isDifferentTrack) {
                            // Finde die Ziel-Position basierend auf X-Koordinate
                            const sortedClips = [...track.clips].sort((a, b) => a.start - b.start);
                            
                            // Bestimme, vor/nach/zwischen welchem Clip der gezogene Clip landen soll
                            let targetPosition = 0;
                            let accumulatedTime = 0;
                            
                            for (let i = 0; i < sortedClips.length; i++) {
                              const midPoint = accumulatedTime + sortedClips[i].duration / 2;
                              
                              if (sortedClips[i].id === clip.id) {
                                // Skip den gezogenen Clip selbst
                                accumulatedTime += sortedClips[i].duration;
                                continue;
                              }
                              
                              if (newStart < midPoint) {
                                // Clip soll VOR diesem Clip platziert werden
                                break;
                              }
                              
                              targetPosition++;
                              accumulatedTime += sortedClips[i].duration;
                            }
                            
                            dispatch({
                              type: 'REORDER_CLIPS_IN_MAIN_TRACK',
                              payload: {
                                trackId: track.id,
                                clipId: clip.id,
                                targetPosition: targetPosition
                              }
                            });
                            
                            console.log(`🔄 Main-Track: Clip "${clip.title}" reordered to position ${targetPosition}`);
                            return;
                          }

                          // FALL 2: Zu anderem Track verschieben
                          if (isDifferentTrack) {
                            const isTargetMainTrack = targetTrack.type === 'audio' && targetTrack.id === 't2';
                            
                            if (isTargetMainTrack) {
                              // Main Track: Lückenlos am Ende
                              if (targetTrack.clips && targetTrack.clips.length > 0) {
                                const lastClip = targetTrack.clips.reduce((latest, c) => {
                                  const clipEnd = c.start + c.duration;
                                  return clipEnd > (latest.start + latest.duration) ? c : latest;
                                });
                                newStart = lastClip.start + lastClip.duration;
                              } else {
                                newStart = 0;
                              }
                            }

                            dispatch({
                              type: 'MOVE_CLIP_BETWEEN_TRACKS',
                              payload: {
                                clipId: clip.id,
                                sourceTrackId: track.id,
                                targetTrackId: targetTrack.id,
                                newStart: newStart
                              }
                            });
                            
                            console.log(`🔄 Clip "${clip.title}" moved from "${track.name}" to "${targetTrack.name}" at ${newStart.toFixed(1)}s`);
                          } else if (!isMainTrack) {
                            // FALL 3: Innerhalb Video-Track verschieben
                            dispatch({
                              type: 'MOVE_CLIP',
                              payload: {
                                clipId: clip.id,
                                trackId: track.id,
                                newStart: newStart
                              }
                            });
                            
                            console.log(`🔄 Clip "${clip.title}" moved to ${newStart.toFixed(1)}s within same track`);
                          }
                        }}
                      >
                        {/* Clip Title */}
                        <div className="text-xs font-medium text-white truncate">
                          {clip.title}
                        </div>
                        {/* Clip Duration */}
                        <div className="text-xs text-white/70">
                          {clip.duration.toFixed(1)}s
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                  // Empty State - Hellgrauer Streifen mit Text
                  <div className="h-full flex items-center justify-center">
                    <div 
                      className="h-12 bg-[#3a3a3a] rounded flex items-center px-4 text-[var(--text-tertiary)] text-sm"
                      style={{ 
                        width: 'calc(100% - 400px)',
                        marginLeft: '200px',
                        border: '1px dashed var(--border-subtle)'
                      }}
                    >
                      Ziehe Elemente hierher und beginne mit dem Erstellen
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
