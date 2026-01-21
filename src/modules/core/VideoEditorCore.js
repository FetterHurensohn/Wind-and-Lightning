/**
 * VideoEditorCore.js - Zentrale Engine für alle Video-Editor Funktionen
 * 
 * Module:
 * - Timeline Management
 * - Track Management  
 * - Clip Operations
 * - Effects & Filters
 * - Transform & Motion
 * - Audio Processing
 * - Export
 */

// ============================================
// TIMELINE MANAGEMENT
// ============================================

export const TimelineManager = {
  // Erstelle neue Timeline
  createTimeline(config = {}) {
    return {
      id: `timeline_${Date.now()}`,
      fps: config.fps || 30,
      duration: config.duration || 0,
      tracks: [],
      markers: [],
      inPoint: null,
      outPoint: null,
      zoom: 1,
      scrollPosition: 0,
      playheadPosition: 0,
      snapping: true,
      rippleMode: false
    };
  },

  // Berechne Timeline-Dauer basierend auf Clips
  calculateDuration(tracks) {
    let maxEnd = 0;
    tracks.forEach(track => {
      track.clips?.forEach(clip => {
        const clipEnd = clip.start + clip.duration;
        if (clipEnd > maxEnd) maxEnd = clipEnd;
      });
    });
    return maxEnd;
  },

  // Konvertiere Zeit zu Frames
  timeToFrames(time, fps = 30) {
    return Math.round(time * fps);
  },

  // Konvertiere Frames zu Zeit
  framesToTime(frames, fps = 30) {
    return frames / fps;
  },

  // Formatiere Timecode
  formatTimecode(seconds, fps = 30) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const f = Math.floor((seconds % 1) * fps);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${f.toString().padStart(2, '0')}`;
  },

  // Parse Timecode zu Sekunden
  parseTimecode(timecode, fps = 30) {
    const parts = timecode.split(':').map(Number);
    if (parts.length === 4) {
      const [h, m, s, f] = parts;
      return h * 3600 + m * 60 + s + f / fps;
    }
    return 0;
  }
};

// ============================================
// TRACK MANAGEMENT
// ============================================

export const TrackManager = {
  // Track-Typen
  TRACK_TYPES: {
    VIDEO: 'video',
    AUDIO: 'audio',
    TEXT: 'text',
    OVERLAY: 'overlay',
    STICKER: 'sticker'
  },

  // Erstelle neuen Track
  createTrack(type, name, options = {}) {
    return {
      id: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      name: name || `${type.charAt(0).toUpperCase() + type.slice(1)} Track`,
      clips: [],
      height: options.height || (type === 'audio' ? 60 : 80),
      muted: false,
      solo: false,
      locked: false,
      visible: true,
      volume: type === 'audio' ? 1 : undefined,
      pan: type === 'audio' ? 0 : undefined,
      blendMode: options.blendMode || 'normal',
      opacity: options.opacity || 100
    };
  },

  // Standard-Tracks für neues Projekt
  createDefaultTracks() {
    return [
      this.createTrack('video', 'Video Track 1', { height: 80 }),
      this.createTrack('audio', 'Audio Track 1', { height: 60 }),
      this.createTrack('text', 'Text Track', { height: 50 }),
      this.createTrack('overlay', 'Overlay Track', { height: 50 })
    ];
  },

  // Finde Clip in allen Tracks
  findClip(tracks, clipId) {
    for (const track of tracks) {
      const clip = track.clips?.find(c => c.id === clipId);
      if (clip) return { clip, track };
    }
    return null;
  },

  // Finde freien Slot für Clip
  findFreeSlot(track, duration, preferredStart = 0) {
    if (!track.clips?.length) return preferredStart;
    
    const sortedClips = [...track.clips].sort((a, b) => a.start - b.start);
    
    // Prüfe ob Platz am Anfang
    if (preferredStart + duration <= sortedClips[0].start) {
      return preferredStart;
    }
    
    // Suche Lücken zwischen Clips
    for (let i = 0; i < sortedClips.length - 1; i++) {
      const gapStart = sortedClips[i].start + sortedClips[i].duration;
      const gapEnd = sortedClips[i + 1].start;
      if (gapEnd - gapStart >= duration) {
        return gapStart;
      }
    }
    
    // Anhängen am Ende
    const lastClip = sortedClips[sortedClips.length - 1];
    return lastClip.start + lastClip.duration;
  }
};

// ============================================
// CLIP OPERATIONS
// ============================================

export const ClipManager = {
  // Erstelle Video-Clip
  createVideoClip(mediaItem, options = {}) {
    return {
      id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'video',
      mediaId: mediaItem.id,
      title: mediaItem.name || 'Video Clip',
      src: mediaItem.src || mediaItem.path,
      thumbnail: mediaItem.thumbnail,
      start: options.start || 0,
      duration: options.duration || mediaItem.duration || 5,
      originalDuration: mediaItem.duration || 5,
      inPoint: options.inPoint || 0,
      outPoint: options.outPoint || (mediaItem.duration || 5),
      props: {
        opacity: 100,
        scale: 100,
        rotation: 0,
        posX: 0,
        posY: 0,
        anchorX: 0.5,
        anchorY: 0.5,
        flipH: false,
        flipV: false,
        speed: 1,
        volume: 100,
        ...options.props
      },
      effects: options.effects || [],
      keyframes: options.keyframes || {},
      transitionIn: null,
      transitionOut: null
    };
  },

  // Erstelle Audio-Clip
  createAudioClip(mediaItem, options = {}) {
    return {
      id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'audio',
      mediaId: mediaItem.id,
      title: mediaItem.name || 'Audio Clip',
      src: mediaItem.src || mediaItem.path,
      waveform: mediaItem.waveform,
      start: options.start || 0,
      duration: options.duration || mediaItem.duration || 5,
      originalDuration: mediaItem.duration || 5,
      inPoint: options.inPoint || 0,
      outPoint: options.outPoint || (mediaItem.duration || 5),
      props: {
        volume: 100,
        pan: 0,
        speed: 1,
        fadeIn: 0,
        fadeOut: 0,
        ...options.props
      },
      effects: options.effects || [],
      keyframes: options.keyframes || {}
    };
  },

  // Erstelle Text-Clip
  createTextClip(text, style = {}, options = {}) {
    return {
      id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'text',
      title: text.substring(0, 20) + (text.length > 20 ? '...' : ''),
      text,
      start: options.start || 0,
      duration: options.duration || 5,
      style: {
        fontFamily: style.fontFamily || 'Arial',
        fontSize: style.fontSize || 48,
        fontWeight: style.fontWeight || 'bold',
        fontStyle: style.fontStyle || 'normal',
        color: style.color || '#FFFFFF',
        backgroundColor: style.backgroundColor || 'transparent',
        strokeColor: style.strokeColor || '#000000',
        strokeWidth: style.strokeWidth || 0,
        shadowColor: style.shadowColor || 'rgba(0,0,0,0.5)',
        shadowBlur: style.shadowBlur || 0,
        shadowOffsetX: style.shadowOffsetX || 0,
        shadowOffsetY: style.shadowOffsetY || 0,
        textAlign: style.textAlign || 'center',
        lineHeight: style.lineHeight || 1.2,
        letterSpacing: style.letterSpacing || 0,
        ...style
      },
      props: {
        opacity: 100,
        scale: 100,
        rotation: 0,
        posX: 0,
        posY: 0,
        ...options.props
      },
      animation: options.animation || null,
      keyframes: options.keyframes || {}
    };
  },

  // Split Clip an Position
  splitClip(clip, splitTime) {
    const relativeTime = splitTime - clip.start;
    
    if (relativeTime <= 0 || relativeTime >= clip.duration) {
      return null; // Kann nicht splitten
    }
    
    const clipA = {
      ...clip,
      id: `${clip.id}_a`,
      duration: relativeTime,
      outPoint: clip.inPoint + relativeTime
    };
    
    const clipB = {
      ...clip,
      id: `${clip.id}_b`,
      start: splitTime,
      duration: clip.duration - relativeTime,
      inPoint: clip.inPoint + relativeTime
    };
    
    return [clipA, clipB];
  },

  // Trim Clip
  trimClip(clip, trimStart, trimEnd) {
    const newDuration = trimEnd - trimStart;
    return {
      ...clip,
      inPoint: clip.inPoint + trimStart,
      outPoint: clip.inPoint + trimEnd,
      duration: newDuration
    };
  },

  // Kopiere Clip
  copyClip(clip) {
    return {
      ...clip,
      id: `${clip.id}_copy_${Date.now()}`,
      props: { ...clip.props },
      effects: clip.effects?.map(e => ({ ...e })) || [],
      keyframes: { ...clip.keyframes }
    };
  }
};

// ============================================
// EFFECTS & FILTERS
// ============================================

export const EffectsManager = {
  // Verfügbare Effekte
  EFFECTS: {
    // Color
    brightness: { name: 'Helligkeit', category: 'color', default: 0, min: -100, max: 100 },
    contrast: { name: 'Kontrast', category: 'color', default: 0, min: -100, max: 100 },
    saturation: { name: 'Sättigung', category: 'color', default: 0, min: -100, max: 100 },
    hue: { name: 'Farbton', category: 'color', default: 0, min: -180, max: 180 },
    temperature: { name: 'Temperatur', category: 'color', default: 0, min: -100, max: 100 },
    tint: { name: 'Tönung', category: 'color', default: 0, min: -100, max: 100 },
    exposure: { name: 'Belichtung', category: 'color', default: 0, min: -100, max: 100 },
    highlights: { name: 'Lichter', category: 'color', default: 0, min: -100, max: 100 },
    shadows: { name: 'Schatten', category: 'color', default: 0, min: -100, max: 100 },
    whites: { name: 'Weiß', category: 'color', default: 0, min: -100, max: 100 },
    blacks: { name: 'Schwarz', category: 'color', default: 0, min: -100, max: 100 },
    vibrance: { name: 'Vibrance', category: 'color', default: 0, min: -100, max: 100 },
    
    // Blur & Sharpen
    blur: { name: 'Weichzeichner', category: 'blur', default: 0, min: 0, max: 100 },
    gaussianBlur: { name: 'Gaußscher Weichzeichner', category: 'blur', default: 0, min: 0, max: 100 },
    motionBlur: { name: 'Bewegungsunschärfe', category: 'blur', default: 0, min: 0, max: 100 },
    sharpen: { name: 'Schärfen', category: 'blur', default: 0, min: 0, max: 100 },
    
    // Stylize
    vignette: { name: 'Vignette', category: 'stylize', default: 0, min: 0, max: 100 },
    grain: { name: 'Filmkorn', category: 'stylize', default: 0, min: 0, max: 100 },
    glow: { name: 'Leuchten', category: 'stylize', default: 0, min: 0, max: 100 },
    chromatic: { name: 'Chromatische Aberration', category: 'stylize', default: 0, min: 0, max: 100 },
    
    // Transform
    flipHorizontal: { name: 'Horizontal spiegeln', category: 'transform', default: false, type: 'boolean' },
    flipVertical: { name: 'Vertikal spiegeln', category: 'transform', default: false, type: 'boolean' },
    
    // Speed
    speed: { name: 'Geschwindigkeit', category: 'time', default: 1, min: 0.1, max: 10 },
    reverse: { name: 'Rückwärts', category: 'time', default: false, type: 'boolean' }
  },

  // Filter-Presets
  FILTER_PRESETS: [
    { id: 'none', name: 'Original', filters: {} },
    { id: 'warm', name: 'Warm', filters: { temperature: 30, saturation: 10 } },
    { id: 'cold', name: 'Kalt', filters: { temperature: -30, tint: 10 } },
    { id: 'vintage', name: 'Vintage', filters: { saturation: -20, contrast: 10, temperature: 20, vignette: 30, grain: 20 } },
    { id: 'bw', name: 'Schwarz-Weiß', filters: { saturation: -100 } },
    { id: 'sepia', name: 'Sepia', filters: { saturation: -50, temperature: 40, contrast: 10 } },
    { id: 'vivid', name: 'Lebendig', filters: { saturation: 30, vibrance: 20, contrast: 15 } },
    { id: 'muted', name: 'Gedämpft', filters: { saturation: -30, contrast: -10 } },
    { id: 'dramatic', name: 'Dramatisch', filters: { contrast: 30, shadows: -20, highlights: 20, vignette: 40 } },
    { id: 'cinematic', name: 'Filmisch', filters: { contrast: 15, saturation: -10, temperature: -5, vignette: 20 } },
    { id: 'neon', name: 'Neon', filters: { saturation: 50, vibrance: 30, contrast: 20, glow: 30 } },
    { id: 'fade', name: 'Verblasst', filters: { contrast: -20, blacks: 30, saturation: -20 } }
  ],

  // Erstelle Effekt-Instance
  createEffect(effectId, value = null) {
    const effectDef = this.EFFECTS[effectId];
    if (!effectDef) return null;
    
    return {
      id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: effectId,
      name: effectDef.name,
      value: value !== null ? value : effectDef.default,
      enabled: true
    };
  },

  // Wende Filter-Preset an
  applyPreset(presetId) {
    const preset = this.FILTER_PRESETS.find(p => p.id === presetId);
    if (!preset) return [];
    
    return Object.entries(preset.filters).map(([key, value]) => 
      this.createEffect(key, value)
    );
  }
};

// ============================================
// TRANSITIONS
// ============================================

export const TransitionManager = {
  // Verfügbare Übergänge
  TRANSITIONS: [
    // Basic
    { id: 'cut', name: 'Schnitt', category: 'basic', duration: 0 },
    { id: 'fade', name: 'Überblenden', category: 'basic', duration: 0.5 },
    { id: 'crossfade', name: 'Kreuzblende', category: 'basic', duration: 0.5 },
    
    // Wipes
    { id: 'wipe-left', name: 'Wischen Links', category: 'wipe', duration: 0.5 },
    { id: 'wipe-right', name: 'Wischen Rechts', category: 'wipe', duration: 0.5 },
    { id: 'wipe-up', name: 'Wischen Hoch', category: 'wipe', duration: 0.5 },
    { id: 'wipe-down', name: 'Wischen Runter', category: 'wipe', duration: 0.5 },
    { id: 'wipe-circle', name: 'Kreiswischen', category: 'wipe', duration: 0.5 },
    
    // Slides
    { id: 'slide-left', name: 'Schieben Links', category: 'slide', duration: 0.5 },
    { id: 'slide-right', name: 'Schieben Rechts', category: 'slide', duration: 0.5 },
    { id: 'slide-up', name: 'Schieben Hoch', category: 'slide', duration: 0.5 },
    { id: 'slide-down', name: 'Schieben Runter', category: 'slide', duration: 0.5 },
    
    // Zoom
    { id: 'zoom-in', name: 'Zoom Rein', category: 'zoom', duration: 0.5 },
    { id: 'zoom-out', name: 'Zoom Raus', category: 'zoom', duration: 0.5 },
    
    // Special
    { id: 'blur', name: 'Unschärfe', category: 'special', duration: 0.5 },
    { id: 'glitch', name: 'Glitch', category: 'special', duration: 0.3 },
    { id: 'spin', name: 'Drehen', category: 'special', duration: 0.5 },
    { id: 'flip', name: 'Umklappen', category: 'special', duration: 0.5 },
    
    // 3D
    { id: 'cube', name: 'Würfel', category: '3d', duration: 0.7 },
    { id: 'flip-3d', name: '3D Flip', category: '3d', duration: 0.5 },
    { id: 'rotate-3d', name: '3D Rotation', category: '3d', duration: 0.6 }
  ],

  // Erstelle Transition-Instance
  createTransition(transitionId, options = {}) {
    const transition = this.TRANSITIONS.find(t => t.id === transitionId);
    if (!transition) return null;
    
    return {
      id: `trans_${Date.now()}`,
      type: transitionId,
      name: transition.name,
      duration: options.duration || transition.duration,
      easing: options.easing || 'ease-in-out'
    };
  }
};

// ============================================
// KEYFRAME SYSTEM
// ============================================

export const KeyframeManager = {
  // Easing-Funktionen
  EASING_TYPES: [
    { id: 'linear', name: 'Linear' },
    { id: 'ease', name: 'Ease' },
    { id: 'ease-in', name: 'Ease In' },
    { id: 'ease-out', name: 'Ease Out' },
    { id: 'ease-in-out', name: 'Ease In Out' },
    { id: 'bounce', name: 'Bounce' },
    { id: 'elastic', name: 'Elastic' },
    { id: 'back', name: 'Back' }
  ],

  // Keyframe-fähige Properties
  ANIMATABLE_PROPS: [
    'opacity', 'scale', 'scaleX', 'scaleY', 'rotation',
    'posX', 'posY', 'anchorX', 'anchorY',
    'volume', 'pan', 'blur', 'brightness', 'contrast', 'saturation'
  ],

  // Erstelle Keyframe
  createKeyframe(time, property, value, easing = 'ease-in-out') {
    return {
      id: `kf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      time,
      property,
      value,
      easing
    };
  },

  // Interpoliere Wert zwischen Keyframes
  interpolate(keyframes, property, currentTime) {
    const propKeyframes = keyframes
      .filter(kf => kf.property === property)
      .sort((a, b) => a.time - b.time);
    
    if (propKeyframes.length === 0) return null;
    if (propKeyframes.length === 1) return propKeyframes[0].value;
    
    // Finde umgebende Keyframes
    let prevKf = propKeyframes[0];
    let nextKf = propKeyframes[propKeyframes.length - 1];
    
    for (let i = 0; i < propKeyframes.length - 1; i++) {
      if (propKeyframes[i].time <= currentTime && propKeyframes[i + 1].time >= currentTime) {
        prevKf = propKeyframes[i];
        nextKf = propKeyframes[i + 1];
        break;
      }
    }
    
    if (currentTime <= prevKf.time) return prevKf.value;
    if (currentTime >= nextKf.time) return nextKf.value;
    
    // Linear Interpolation (könnte mit Easing erweitert werden)
    const t = (currentTime - prevKf.time) / (nextKf.time - prevKf.time);
    return prevKf.value + (nextKf.value - prevKf.value) * t;
  }
};

// ============================================
// EXPORT MANAGER
// ============================================

export const ExportManager = {
  // Export-Presets
  PRESETS: {
    'youtube-4k': { name: 'YouTube 4K', width: 3840, height: 2160, fps: 30, bitrate: 45000, codec: 'h264' },
    'youtube-1080': { name: 'YouTube 1080p', width: 1920, height: 1080, fps: 30, bitrate: 12000, codec: 'h264' },
    'youtube-720': { name: 'YouTube 720p', width: 1280, height: 720, fps: 30, bitrate: 7500, codec: 'h264' },
    'tiktok': { name: 'TikTok', width: 1080, height: 1920, fps: 30, bitrate: 8000, codec: 'h264' },
    'instagram-reel': { name: 'Instagram Reel', width: 1080, height: 1920, fps: 30, bitrate: 8000, codec: 'h264' },
    'instagram-post': { name: 'Instagram Post', width: 1080, height: 1080, fps: 30, bitrate: 6000, codec: 'h264' },
    'twitter': { name: 'Twitter', width: 1280, height: 720, fps: 30, bitrate: 5000, codec: 'h264' },
    'facebook': { name: 'Facebook', width: 1920, height: 1080, fps: 30, bitrate: 10000, codec: 'h264' },
    'gif': { name: 'GIF', width: 480, height: 480, fps: 15, format: 'gif' },
    'webm': { name: 'WebM', width: 1920, height: 1080, fps: 30, codec: 'vp9' }
  },

  // Erstelle Export-Config
  createExportConfig(presetId, overrides = {}) {
    const preset = this.PRESETS[presetId] || this.PRESETS['youtube-1080'];
    return {
      ...preset,
      ...overrides,
      format: overrides.format || 'mp4',
      audioCodec: overrides.audioCodec || 'aac',
      audioBitrate: overrides.audioBitrate || 192,
      quality: overrides.quality || 'high'
    };
  }
};

// Default Export
export default {
  TimelineManager,
  TrackManager,
  ClipManager,
  EffectsManager,
  TransitionManager,
  KeyframeManager,
  ExportManager
};
