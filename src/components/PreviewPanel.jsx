/**
 * PreviewPanel.jsx - Video Preview mit echter Wiedergabe
 * 
 * Features:
 * - Zeigt aktive Clips basierend auf currentTime
 * - Unterstützt Video, Bild und Text-Clips
 * - Video-Wiedergabe mit autoPlay und Synchronisation
 * - Layer-System (höhere Tracks = Vordergrund)
 */

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { secondsToTimecode } from '../utils/timecode';

export default function PreviewPanel({
  currentTime = 0,
  playing = false,
  tracks = [],
  media = [],
  onSeek,
  fps = 30
}) {
  const videoRefs = useRef({});
  const [videoErrors, setVideoErrors] = useState({});

  // Finde alle Clips, die zur aktuellen Zeit aktiv sind
  const activeClips = useMemo(() => {
    const clips = [];
    
    tracks.forEach((track, trackIndex) => {
      // Überspringe Audio Tracks (nur Video/Bild anzeigen)
      if (track.type === 'audio') return;
      
      track.clips?.forEach(clip => {
        const clipStart = clip.start;
        const clipEnd = clip.start + clip.duration;
        
        if (currentTime >= clipStart && currentTime < clipEnd) {
          const mediaItem = media.find(m => m.id === clip.mediaId);
          
          clips.push({
            ...clip,
            trackIndex,
            trackId: track.id,
            mediaItem,
            zIndex: trackIndex,
            // Relative Zeit im Clip (für Video-Seek)
            clipTime: currentTime - clipStart
          });
        }
      });
    });
    
    return clips.sort((a, b) => a.trackIndex - b.trackIndex);
  }, [currentTime, tracks, media]);

  // Synchronisiere Video-Wiedergabe
  useEffect(() => {
    activeClips.forEach(clip => {
      const video = videoRefs.current[clip.id];
      if (!video) return;
      
      // Sync currentTime
      const expectedTime = clip.clipTime;
      if (Math.abs(video.currentTime - expectedTime) > 0.3) {
        video.currentTime = expectedTime;
      }
      
      // Play/Pause
      if (playing && video.paused) {
        video.play().catch(() => {});
      } else if (!playing && !video.paused) {
        video.pause();
      }
    });
  }, [activeClips, playing, currentTime]);

  // Calculate total duration
  const duration = useMemo(() => {
    return tracks.reduce((max, track) => {
      const trackDuration = track.clips?.reduce((sum, clip) => 
        Math.max(sum, clip.start + clip.duration), 0) || 0;
      return Math.max(max, trackDuration);
    }, 180);
  }, [tracks]);

  const handlePreviewClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = x / rect.width;
    const time = progress * duration;
    if (onSeek) onSeek(time);
  };

  // Convert effects array to CSS filter string
  const getEffectsFilter = (effects) => {
    if (!effects || effects.length === 0) return '';
    
    const filterMap = {
      'blur': 'blur(4px)',
      'sharpen': 'contrast(1.2)',
      'vignette': '', // Handled separately with pseudo-element
      'glitch': 'hue-rotate(90deg) saturate(1.5)',
      'vhs': 'sepia(0.3) contrast(1.1) brightness(0.9)',
      'film-grain': 'contrast(1.1) brightness(0.95)',
      'vintage': 'sepia(0.4) contrast(1.1) brightness(0.9)',
      'glow': 'brightness(1.2) contrast(1.1)',
      'neon': 'saturate(2) brightness(1.3) contrast(1.2)',
      'duotone': 'grayscale(1) sepia(1) hue-rotate(180deg)',
      'chromatic': 'saturate(1.8) hue-rotate(10deg)',
      'shake': '' // Handled with animation
    };
    
    return effects
      .map(effect => filterMap[effect.id] || '')
      .filter(f => f)
      .join(' ');
  };

  // Get effect classes for animations
  const getEffectClasses = (effects) => {
    if (!effects || effects.length === 0) return '';
    
    const classes = [];
    if (effects.some(e => e.id === 'shake')) classes.push('animate-shake');
    if (effects.some(e => e.id === 'vignette')) classes.push('vignette-effect');
    if (effects.some(e => e.id === 'glitch')) classes.push('glitch-effect');
    
    return classes.join(' ');
  };

  const renderClipContent = (clip) => {
    const { mediaItem, type, title, props = {}, id, clipTime, effects = [], transition } = clip;
    
    // Transformations
    const opacity = (props.opacity ?? 100) / 100;
    const scale = (props.scale ?? 100) / 100;
    const rotation = props.rotation ?? 0;
    const posX = props.posX ?? 0;
    const posY = props.posY ?? 0;
    const flipH = props.flipH ? -1 : 1;
    const flipV = props.flipV ? -1 : 1;
    
    // Color Corrections
    const brightness = props.brightness ?? 100;
    const contrast = props.contrast ?? 100;
    const saturation = props.saturation ?? 100;
    const hue = props.hue ?? 0;
    
    // Effects
    const effectsFilter = getEffectsFilter(effects);
    const effectClasses = getEffectClasses(effects);
    
    // Combine all filters
    const baseFilter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg)`;
    const combinedFilter = effectsFilter ? `${baseFilter} ${effectsFilter}` : baseFilter;
    
    const transformStyle = {
      opacity,
      transform: `translate(${posX}px, ${posY}px) scale(${scale * flipH}, ${scale * flipV}) rotate(${rotation}deg)`,
      filter: combinedFilter,
      mixBlendMode: props.blendMode || 'normal'
    };

    // Video Clip
    if (type === 'video' && mediaItem?.url) {
      if (videoErrors[id]) {
        return (
          <div className={`flex flex-col items-center justify-center text-[var(--text-tertiary)] ${effectClasses}`} style={transformStyle}>
            <span className="text-4xl mb-2">🎥</span>
            <span className="text-xs">{title}</span>
          </div>
        );
      }
      
      return (
        <video
          ref={el => { if (el) videoRefs.current[id] = el; }}
          src={mediaItem.url}
          className={`max-w-full max-h-full object-contain ${effectClasses}`}
          style={transformStyle}
          muted
          playsInline
          onError={() => setVideoErrors(prev => ({ ...prev, [id]: true }))}
        />
      );
    }

    // Image Clip
    if ((type === 'image' || type === 'video') && mediaItem?.thumbnail) {
      return (
        <img
          src={mediaItem.thumbnail}
          alt={title}
          className={`max-w-full max-h-full object-contain ${effectClasses}`}
          style={transformStyle}
        />
      );
    }

    // Demo/Placeholder Clip
    const iconColor = type === 'video' ? 'text-blue-400' : type === 'image' ? 'text-purple-400' : 'text-gray-400';
    const bgColor = mediaItem?.color || (type === 'video' ? '#3b82f6' : type === 'image' ? '#8b5cf6' : '#666');
    
    return (
      <div 
        className={`w-full h-full flex flex-col items-center justify-center ${effectClasses}`}
        style={{ ...transformStyle, backgroundColor: `${bgColor}20` }}
      >
        <div className={`text-5xl mb-3 ${iconColor}`}>
          {type === 'video' ? '🎬' : type === 'image' ? '🖼️' : '📄'}
        </div>
        <div className="text-sm text-white font-medium">{title}</div>
        <div className="text-xs text-white/60 mt-1">
          {clipTime.toFixed(1)}s / {clip.duration}s
        </div>
        {effects.length > 0 && (
          <div className="text-[10px] text-[var(--accent-turquoise)] mt-2">
            {effects.map(e => e.name).join(' • ')}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 bg-[var(--bg-main)] rounded border border-[var(--border-subtle)] relative overflow-hidden max-w-full">
      {/* Header */}
      <div className="h-7 border-b border-[var(--border-subtle)] px-3 flex items-center justify-between">
        <span className="text-[10px] text-[var(--text-tertiary)]">Preview</span>
        {playing && (
          <span className="text-[9px] text-red-400 animate-pulse">● PLAYING</span>
        )}
      </div>
      
      {/* Preview Area */}
      <div 
        className="absolute inset-x-0 top-7 bottom-7 bg-black flex items-center justify-center cursor-pointer overflow-hidden"
        onClick={handlePreviewClick}
      >
        {activeClips.length > 0 ? (
          activeClips.map(clip => (
            <div
              key={`${clip.trackId}-${clip.id}`}
              className="absolute inset-0 flex items-center justify-center"
              style={{ zIndex: clip.zIndex }}
            >
              {renderClipContent(clip)}
            </div>
          ))
        ) : (
          <div className="text-[var(--text-tertiary)] flex flex-col items-center">
            <span className="text-4xl mb-2">🎬</span>
            <span className="text-xs">Kein Clip an dieser Position</span>
          </div>
        )}
      </div>
      
      {/* Timecode Footer */}
      <div className="absolute bottom-0 left-0 right-0 h-7 bg-[var(--bg-panel)]/80 border-t border-[var(--border-subtle)] px-3 flex items-center justify-between">
        <span className="text-[10px] font-mono text-[var(--text-secondary)]">
          {secondsToTimecode(currentTime, fps)}
        </span>
        <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
          / {secondsToTimecode(duration, fps)}
        </span>
      </div>
    </div>
  );
}
