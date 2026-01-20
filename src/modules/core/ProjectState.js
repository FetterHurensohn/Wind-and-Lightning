/**
 * ProjectState.js - Zentraler Projektzustand
 * Verwaltet alle Projekt-Daten, Tracks, Clips, Assets
 */

import { v4 as uuidv4 } from 'uuid';

// Track Types
export const TRACK_TYPES = {
  VIDEO: 'video',
  AUDIO: 'audio',
  OVERLAY: 'overlay',
  TEXT: 'text',
  STICKER: 'sticker',
  EFFECT: 'effect'
};

// Default Project Settings
export const DEFAULT_PROJECT_SETTINGS = {
  name: 'Untitled Project',
  resolution: { width: 1920, height: 1080 },
  fps: 30,
  aspectRatio: '16:9',
  sampleRate: 48000,
  bitDepth: 16,
  colorSpace: 'rec709',
  hdr: false,
  proxyEnabled: true,
  proxyResolution: { width: 640, height: 360 }
};

// Initial State Factory
export function createInitialState(settings = {}) {
  return {
    // Project Meta
    id: uuidv4(),
    name: settings.name || DEFAULT_PROJECT_SETTINGS.name,
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    version: '2.0.0',
    
    // Project Settings
    settings: {
      ...DEFAULT_PROJECT_SETTINGS,
      ...settings
    },
    
    // Timeline State
    timeline: {
      duration: 0,
      playhead: 0,
      inPoint: null,
      outPoint: null,
      zoom: 1,
      scrollX: 0,
      scrollY: 0,
      snapping: true,
      rippleMode: false,
      magneticSnap: true
    },
    
    // Tracks
    tracks: [
      { id: 'main-video', name: 'Video 1', type: TRACK_TYPES.VIDEO, locked: false, visible: true, muted: false, solo: false, height: 80, clips: [] },
      { id: 'main-audio', name: 'Audio 1', type: TRACK_TYPES.AUDIO, locked: false, visible: true, muted: false, solo: false, height: 60, clips: [] }
    ],
    
    // Media Assets
    assets: [],
    
    // Markers
    markers: [],
    
    // Selection State
    selection: {
      clips: [],
      tracks: [],
      markers: []
    },
    
    // Clipboard
    clipboard: {
      clips: [],
      effects: []
    },
    
    // History (Undo/Redo)
    history: {
      past: [],
      future: [],
      maxStates: 100
    },
    
    // Playback State
    playback: {
      playing: false,
      looping: false,
      loopIn: null,
      loopOut: null,
      speed: 1,
      volume: 1,
      muted: false
    },
    
    // View State
    view: {
      showWaveforms: true,
      showThumbnails: true,
      showKeyframes: true,
      showMarkers: true,
      showGuides: true,
      previewQuality: 'auto'
    },
    
    // Export Settings
    exportSettings: {
      format: 'mp4',
      codec: 'h264',
      resolution: '1080p',
      fps: 30,
      bitrate: 'auto',
      audioCodec: 'aac',
      audioBitrate: 320
    }
  };
}

// Clip Factory
export function createClip(type, props = {}) {
  const base = {
    id: uuidv4(),
    type,
    name: props.name || 'Untitled Clip',
    start: props.start || 0,
    duration: props.duration || 5,
    sourceIn: props.sourceIn || 0,
    sourceOut: props.sourceOut || props.duration || 5,
    assetId: props.assetId || null,
    locked: false,
    disabled: false,
    
    // Transform
    transform: {
      position: { x: 0, y: 0 },
      scale: { x: 100, y: 100 },
      rotation: 0,
      anchorPoint: { x: 50, y: 50 },
      opacity: 100
    },
    
    // Keyframes
    keyframes: {},
    
    // Effects
    effects: [],
    
    // Transitions
    transitionIn: null,
    transitionOut: null,
    
    // Audio Properties (if applicable)
    audio: {
      volume: 100,
      pan: 0,
      fadeIn: 0,
      fadeOut: 0,
      muted: false
    },
    
    // Speed
    speed: {
      rate: 1,
      reverse: false,
      curve: null,
      smoothSlowMo: false
    },
    
    // Metadata
    metadata: {},
    createdAt: Date.now(),
    modifiedAt: Date.now()
  };
  
  return { ...base, ...props, id: base.id };
}

// Asset Factory
export function createAsset(type, props = {}) {
  return {
    id: uuidv4(),
    type, // 'video', 'audio', 'image', 'text', 'sticker', 'template'
    name: props.name || 'Untitled',
    path: props.path || null,
    proxyPath: props.proxyPath || null,
    thumbnailPath: props.thumbnailPath || null,
    waveformPath: props.waveformPath || null,
    
    // Media Info
    duration: props.duration || 0,
    width: props.width || 0,
    height: props.height || 0,
    fps: props.fps || 0,
    codec: props.codec || null,
    bitrate: props.bitrate || 0,
    sampleRate: props.sampleRate || 0,
    channels: props.channels || 0,
    
    // Status
    status: 'ready', // 'importing', 'ready', 'offline', 'error'
    proxyStatus: 'none', // 'none', 'generating', 'ready'
    
    // Tags & Metadata
    tags: [],
    favorite: false,
    rating: 0,
    color: null,
    notes: '',
    
    // Usage tracking
    usageCount: 0,
    lastUsed: null,
    
    createdAt: Date.now(),
    modifiedAt: Date.now()
  };
}

// Marker Factory
export function createMarker(props = {}) {
  return {
    id: uuidv4(),
    time: props.time || 0,
    name: props.name || 'Marker',
    color: props.color || '#ff6b6b',
    type: props.type || 'standard', // 'standard', 'chapter', 'todo', 'comment'
    notes: props.notes || '',
    duration: props.duration || 0, // For range markers
    createdAt: Date.now()
  };
}

// Effect Factory
export function createEffect(type, props = {}) {
  return {
    id: uuidv4(),
    type, // 'filter', 'color', 'transform', 'audio', 'ai'
    name: props.name || type,
    enabled: true,
    expanded: false,
    
    // Parameters
    parameters: props.parameters || {},
    
    // Keyframes for parameters
    keyframes: {},
    
    // Blend
    blendMode: props.blendMode || 'normal',
    opacity: props.opacity || 100,
    
    // Mask
    mask: null,
    
    createdAt: Date.now()
  };
}

// Transition Factory
export function createTransition(type, props = {}) {
  return {
    id: uuidv4(),
    type, // 'dissolve', 'wipe', 'slide', 'zoom', 'glitch', etc.
    name: props.name || type,
    duration: props.duration || 0.5,
    easing: props.easing || 'easeInOut',
    parameters: props.parameters || {},
    reversed: false
  };
}

export default {
  TRACK_TYPES,
  DEFAULT_PROJECT_SETTINGS,
  createInitialState,
  createClip,
  createAsset,
  createMarker,
  createEffect,
  createTransition
};
