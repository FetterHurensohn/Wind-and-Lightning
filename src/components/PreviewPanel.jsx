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
  // Berücksichtigt Track-Kontrollen: hidden, muted
  // Erweitert um Transition-Informationen
  const activeClips = useMemo(() => {
    const clips = [];
    
    tracks.forEach((track, trackIndex) => {
      // Überspringe Audio Tracks (nur Video/Bild anzeigen)
      if (track.type === 'audio') return;
      
      // Überspringe versteckte Tracks (hidden = true)
      if (track.hidden) return;
      
      // Sortiere Clips nach Startzeit für Transition-Berechnung
      const sortedClips = [...(track.clips || [])].sort((a, b) => a.start - b.start);
      
      sortedClips.forEach((clip, clipIndex) => {
        const clipStart = clip.start;
        const clipEnd = clip.start + clip.duration;
        
        // Prüfe ob dieser Clip aktiv ist
        if (currentTime >= clipStart && currentTime < clipEnd) {
          const mediaItem = media.find(m => m.id === clip.mediaId);
          
          // Berechne Transition-Daten
          let transitionIn = null;
          let transitionOut = null;
          let transitionProgress = 0;
          
          // Transition vom vorherigen Clip (Einblendung)
          if (clipIndex > 0) {
            const prevClip = sortedClips[clipIndex - 1];
            const prevEnd = prevClip.start + prevClip.duration;
            const overlap = prevEnd - clipStart;
            
            if (overlap > 0 && clip.transition) {
              const transitionDuration = clip.transition.duration || 0.5;
              const timeIntoClip = currentTime - clipStart;
              
              if (timeIntoClip < transitionDuration) {
                transitionIn = clip.transition;
                transitionProgress = timeIntoClip / transitionDuration;
              }
            }
          }
          
          // Transition zum nächsten Clip (Ausblendung)
          if (clipIndex < sortedClips.length - 1) {
            const nextClip = sortedClips[clipIndex + 1];
            const overlap = clipEnd - nextClip.start;
            
            if (overlap > 0 && nextClip.transition) {
              const transitionDuration = nextClip.transition.duration || 0.5;
              const timeToEnd = clipEnd - currentTime;
              
              if (timeToEnd < transitionDuration) {
                transitionOut = nextClip.transition;
                transitionProgress = 1 - (timeToEnd / transitionDuration);
              }
            }
          }
          
          clips.push({
            ...clip,
            trackIndex,
            trackId: track.id,
            trackType: track.type,
            trackMuted: track.muted,
            trackGauge: track.gauge ?? 100,
            mediaItem,
            zIndex: trackIndex,
            clipTime: currentTime - clipStart,
            transitionIn,
            transitionOut,
            transitionProgress
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

  // Easing-Funktion für flüssige Übergänge (muss VOR getTransitionStyles definiert sein)
  const easeInOutCubic = (t) => {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  // Berechne Transition-Styles basierend auf Transition-Typ und Progress
  const getTransitionStyles = (clip) => {
    const { transitionIn, transitionOut, transitionProgress } = clip;
    
    if (!transitionIn && !transitionOut) return {};
    
    const transition = transitionIn || transitionOut;
    const progress = transitionIn ? transitionProgress : (1 - transitionProgress);
    const eased = easeInOutCubic(progress);
    
    const styles = {};
    
    switch (transition.id) {
      case 'fade':
      case 'dissolve':
        styles.opacity = eased;
        break;
        
      case 'wipe-left':
        styles.clipPath = `inset(0 ${(1 - eased) * 100}% 0 0)`;
        break;
        
      case 'wipe-right':
        styles.clipPath = `inset(0 0 0 ${(1 - eased) * 100}%)`;
        break;
        
      case 'wipe-up':
        styles.clipPath = `inset(0 0 ${(1 - eased) * 100}% 0)`;
        break;
        
      case 'wipe-down':
        styles.clipPath = `inset(${(1 - eased) * 100}% 0 0 0)`;
        break;
        
      case 'zoom-in':
        styles.transform = `scale(${0.5 + eased * 0.5})`;
        styles.opacity = eased;
        break;
        
      case 'zoom-out':
        styles.transform = `scale(${1.5 - eased * 0.5})`;
        styles.opacity = eased;
        break;
        
      case 'slide-left':
        styles.transform = `translateX(${(1 - eased) * 100}%)`;
        break;
        
      case 'slide-right':
        styles.transform = `translateX(${(eased - 1) * 100}%)`;
        break;
        
      case 'rotate':
        styles.transform = `rotate(${(1 - eased) * 90}deg)`;
        styles.opacity = eased;
        break;
        
      case 'flip':
        styles.transform = `perspective(1000px) rotateY(${(1 - eased) * 90}deg)`;
        styles.opacity = eased;
        break;
        
      default:
        styles.opacity = eased;
    }
    
    return styles;
  };

  // Audio Clips für Wiedergabe (berücksichtigt Mute)
  const activeAudioClips = useMemo(() => {
    const audioClips = [];
    
    tracks.forEach((track, trackIndex) => {
      // Nur Audio und Video Tracks mit Audio
      if (track.type !== 'audio' && track.type !== 'video') return;
      
      // Überspringe stumm geschaltete Tracks
      if (track.muted) return;
      
      track.clips?.forEach(clip => {
        const clipStart = clip.start;
        const clipEnd = clip.start + clip.duration;
        
        if (currentTime >= clipStart && currentTime < clipEnd) {
          const mediaItem = media.find(m => m.id === clip.mediaId);
          if (mediaItem && (mediaItem.type === 'audio' || mediaItem.type === 'video')) {
            audioClips.push({
              ...clip,
              trackId: track.id,
              trackGauge: track.gauge ?? 100,
              mediaItem,
              clipTime: currentTime - clipStart
            });
          }
        }
      });
    });
    
    return audioClips;
  }, [currentTime, tracks, media]);

  const renderClipContent = (clip) => {
    const { mediaItem, type, title, props = {}, id, clipTime, effects = [], transition, trackMuted, trackGauge, transitionIn, transitionOut, transitionProgress } = clip;
    
    // Transformations - Track Gauge beeinflusst Opacity
    const trackOpacityMultiplier = (trackGauge ?? 100) / 100;
    const opacity = ((props.opacity ?? 100) / 100) * trackOpacityMultiplier;
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
    
    // Base transform style
    let transformStyle = {
      opacity,
      transform: `translate(${posX}px, ${posY}px) scale(${scale * flipH}, ${scale * flipV}) rotate(${rotation}deg)`,
      filter: combinedFilter,
      mixBlendMode: props.blendMode || 'normal'
    };
    
    // Wende Transition-Styles an (überschreibt teilweise base styles)
    const transitionStyles = getTransitionStyles(clip);
    if (Object.keys(transitionStyles).length > 0) {
      // Kombiniere opacity
      if (transitionStyles.opacity !== undefined) {
        transformStyle.opacity = opacity * transitionStyles.opacity;
      }
      // Kombiniere transform
      if (transitionStyles.transform) {
        transformStyle.transform = `${transformStyle.transform} ${transitionStyles.transform}`;
      }
      // clipPath für Wipe-Effekte
      if (transitionStyles.clipPath) {
        transformStyle.clipPath = transitionStyles.clipPath;
      }
    }

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
      
      // Video-Audio wird über trackMuted gesteuert
      const videoVolume = trackMuted ? 0 : ((props.volume ?? 100) * (trackGauge ?? 100) / 10000);
      
      return (
        <video
          ref={el => { if (el) videoRefs.current[id] = el; }}
          src={mediaItem.url}
          className={`max-w-full max-h-full object-contain ${effectClasses}`}
          style={transformStyle}
          muted={trackMuted}
          playsInline
          onError={() => setVideoErrors(prev => ({ ...prev, [id]: true }))}
        />
      );
    }
    
    // Sticker Clip
    if (type === 'sticker') {
      const stickerStyle = {
        ...transformStyle,
        fontSize: `${(props.fontSize || 64)}px`,
        lineHeight: 1
      };
      
      return (
        <div 
          className={`flex items-center justify-center ${effectClasses}`}
          style={stickerStyle}
        >
          {props.emoji || props.text || '⭐'}
        </div>
      );
    }

    // Text Clip
    if (type === 'text') {
      const textProps = props;
      const textStyle = {
        ...transformStyle,
        fontSize: `${textProps.fontSize || 48}px`,
        fontWeight: textProps.fontWeight || 'bold',
        fontFamily: textProps.fontFamily || 'Inter, sans-serif',
        color: textProps.color || '#ffffff',
        textAlign: textProps.textAlign || 'center',
        backgroundColor: textProps.backgroundColor || 'transparent',
        padding: '0.5em',
        lineHeight: 1.2,
        // Text effects
        ...(textProps.textEffect === 'shadow' && {
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }),
        ...(textProps.textEffect === 'outline' && {
          WebkitTextStroke: '2px black',
          textShadow: 'none'
        }),
        ...(textProps.textEffect === 'glow' && {
          textShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6), 0 0 30px rgba(255,255,255,0.4)'
        }),
        ...(textProps.textEffect === 'neon' && {
          textShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0ff, 0 0 20px #0ff, 0 0 35px #0ff'
        }),
        ...(textProps.textEffect === 'gradient' && {
          background: 'linear-gradient(45deg, #ff00ff, #00ffff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        })
      };

      return (
        <div 
          className={`flex items-center justify-center ${effectClasses}`}
          style={textStyle}
        >
          {textProps.text || title}
        </div>
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
    const iconColor = type === 'video' ? 'text-blue-400' : type === 'image' ? 'text-purple-400' : type === 'text' ? 'text-yellow-400' : 'text-gray-400';
    const bgColor = mediaItem?.color || (type === 'video' ? '#3b82f6' : type === 'image' ? '#8b5cf6' : type === 'text' ? '#eab308' : '#666');
    
    return (
      <div 
        className={`w-full h-full flex flex-col items-center justify-center ${effectClasses}`}
        style={{ ...transformStyle, backgroundColor: `${bgColor}20` }}
      >
        <div className={`text-5xl mb-3 ${iconColor}`}>
          {type === 'video' ? '🎬' : type === 'image' ? '🖼️' : type === 'text' ? '📝' : '📄'}
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
