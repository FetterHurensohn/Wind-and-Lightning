/**
 * Settings Module - User Settings, Preferences, Hotkeys
 */

// Simple UUID generator function (no external dependency)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// === DEFAULT SETTINGS ===
export const DEFAULT_SETTINGS = {
  // General
  general: {
    language: 'de',
    theme: 'dark',
    autoSave: true,
    autoSaveInterval: 60, // seconds
    showTips: true,
    sendAnalytics: false,
    checkUpdates: true
  },
  
  // Appearance
  appearance: {
    theme: 'dark', // 'dark', 'light', 'system'
    accentColor: '#00D4AA',
    fontSize: 'medium', // 'small', 'medium', 'large'
    compactMode: false,
    showLabels: true,
    animationsEnabled: true
  },
  
  // Timeline
  timeline: {
    defaultZoom: 1,
    snapToClips: true,
    snapToMarkers: true,
    snapToPlayhead: true,
    showWaveforms: true,
    showThumbnails: true,
    thumbnailQuality: 'medium',
    rippleEdit: false,
    scrollFollowsPlayhead: true,
    trackHeight: 80
  },
  
  // Preview
  preview: {
    quality: 'auto', // 'auto', 'full', 'half', 'quarter'
    backgroundColor: '#000000',
    showSafeZones: false,
    showGrid: false,
    gridSize: 10,
    fitToWindow: true
  },
  
  // Playback
  playback: {
    defaultSpeed: 1,
    loopPlayback: false,
    audioScrubbing: true,
    preRollFrames: 0,
    postRollFrames: 0
  },
  
  // Export
  export: {
    defaultFormat: 'mp4',
    defaultResolution: '1080p',
    defaultFps: 30,
    defaultCodec: 'h264',
    hardwareAcceleration: true,
    outputFolder: null,
    addDateToFilename: true,
    showNotification: true
  },
  
  // Audio
  audio: {
    masterVolume: 100,
    muteOnExport: false,
    sampleRate: 48000,
    audioDevice: 'default',
    latencyCompensation: 0
  },
  
  // Performance
  performance: {
    maxMemoryUsage: 4096, // MB
    cacheSize: 2048, // MB
    proxyGeneration: 'auto', // 'auto', 'always', 'never'
    proxyResolution: '360p',
    previewCaching: true,
    gpuAcceleration: true,
    maxUndoSteps: 100
  },
  
  // Project
  project: {
    defaultResolution: { width: 1920, height: 1080 },
    defaultFps: 30,
    defaultAspectRatio: '16:9',
    defaultDuration: 180,
    createBackups: true,
    backupInterval: 300 // seconds
  },
  
  // Privacy
  privacy: {
    shareUsageData: false,
    allowCrashReports: true,
    storeProjectHistory: true,
    rememberRecentFiles: true,
    maxRecentFiles: 20
  },
  
  // Accessibility
  accessibility: {
    highContrast: false,
    reduceMotion: false,
    screenReaderSupport: false,
    keyboardNavigation: true,
    focusHighlight: true
  }
};

// === KEYBOARD SHORTCUTS ===
export const DEFAULT_SHORTCUTS = {
  // File
  'file.new': { key: 'n', modifiers: ['ctrl'] },
  'file.open': { key: 'o', modifiers: ['ctrl'] },
  'file.save': { key: 's', modifiers: ['ctrl'] },
  'file.saveAs': { key: 's', modifiers: ['ctrl', 'shift'] },
  'file.export': { key: 'e', modifiers: ['ctrl'] },
  'file.import': { key: 'i', modifiers: ['ctrl'] },
  
  // Edit
  'edit.undo': { key: 'z', modifiers: ['ctrl'] },
  'edit.redo': { key: 'z', modifiers: ['ctrl', 'shift'] },
  'edit.cut': { key: 'x', modifiers: ['ctrl'] },
  'edit.copy': { key: 'c', modifiers: ['ctrl'] },
  'edit.paste': { key: 'v', modifiers: ['ctrl'] },
  'edit.delete': { key: 'Delete', modifiers: [] },
  'edit.selectAll': { key: 'a', modifiers: ['ctrl'] },
  'edit.deselectAll': { key: 'd', modifiers: ['ctrl', 'shift'] },
  
  // Timeline
  'timeline.split': { key: 'b', modifiers: [] },
  'timeline.rippleDelete': { key: 'Delete', modifiers: ['shift'] },
  'timeline.zoomIn': { key: '=', modifiers: ['ctrl'] },
  'timeline.zoomOut': { key: '-', modifiers: ['ctrl'] },
  'timeline.fitToWindow': { key: '0', modifiers: ['ctrl'] },
  'timeline.addMarker': { key: 'm', modifiers: [] },
  'timeline.nextMarker': { key: 'm', modifiers: ['shift'] },
  'timeline.prevMarker': { key: 'm', modifiers: ['ctrl'] },
  
  // Playback
  'playback.play': { key: ' ', modifiers: [] },
  'playback.stop': { key: 'k', modifiers: [] },
  'playback.forward': { key: 'l', modifiers: [] },
  'playback.backward': { key: 'j', modifiers: [] },
  'playback.nextFrame': { key: 'ArrowRight', modifiers: [] },
  'playback.prevFrame': { key: 'ArrowLeft', modifiers: [] },
  'playback.start': { key: 'Home', modifiers: [] },
  'playback.end': { key: 'End', modifiers: [] },
  'playback.setInPoint': { key: 'i', modifiers: [] },
  'playback.setOutPoint': { key: 'o', modifiers: [] },
  'playback.clearInOut': { key: 'x', modifiers: [] },
  
  // View
  'view.fullscreen': { key: 'F11', modifiers: [] },
  'view.toggleTimeline': { key: 't', modifiers: ['ctrl'] },
  'view.toggleInspector': { key: 'i', modifiers: ['ctrl', 'shift'] },
  'view.toggleMediaBrowser': { key: 'b', modifiers: ['ctrl', 'shift'] },
  
  // Tools
  'tool.select': { key: 'v', modifiers: [] },
  'tool.razor': { key: 'c', modifiers: [] },
  'tool.hand': { key: 'h', modifiers: [] },
  'tool.zoom': { key: 'z', modifiers: [] },
  'tool.text': { key: 't', modifiers: [] },
  
  // Clips
  'clip.duplicate': { key: 'd', modifiers: ['ctrl'] },
  'clip.group': { key: 'g', modifiers: ['ctrl'] },
  'clip.ungroup': { key: 'g', modifiers: ['ctrl', 'shift'] },
  'clip.lock': { key: 'l', modifiers: ['ctrl'] },
  'clip.disable': { key: 'd', modifiers: ['ctrl', 'shift'] }
};

// === THEMES ===
export const THEMES = {
  dark: {
    id: 'dark',
    name: 'Dunkel',
    colors: {
      bgMain: '#0A0A0F',
      bgPanel: '#12121A',
      bgSurface: '#1A1A24',
      bgHover: '#242430',
      textPrimary: '#FFFFFF',
      textSecondary: '#A0A0B0',
      textTertiary: '#606070',
      borderSubtle: '#2A2A3A',
      borderNormal: '#3A3A4A',
      accentPrimary: '#00D4AA',
      accentSecondary: '#7C3AED'
    }
  },
  light: {
    id: 'light',
    name: 'Hell',
    colors: {
      bgMain: '#F5F5F7',
      bgPanel: '#FFFFFF',
      bgSurface: '#EAEAEC',
      bgHover: '#E0E0E2',
      textPrimary: '#1A1A1F',
      textSecondary: '#606068',
      textTertiary: '#909098',
      borderSubtle: '#D0D0D8',
      borderNormal: '#C0C0C8',
      accentPrimary: '#00B090',
      accentSecondary: '#6B21A8'
    }
  },
  midnight: {
    id: 'midnight',
    name: 'Mitternacht',
    colors: {
      bgMain: '#0D1117',
      bgPanel: '#161B22',
      bgSurface: '#21262D',
      bgHover: '#30363D',
      textPrimary: '#F0F6FC',
      textSecondary: '#8B949E',
      textTertiary: '#6E7681',
      borderSubtle: '#30363D',
      borderNormal: '#484F58',
      accentPrimary: '#58A6FF',
      accentSecondary: '#A371F7'
    }
  }
};

// === LANGUAGES ===
export const LANGUAGES = [
  { code: 'de', name: 'Deutsch', native: 'Deutsch' },
  { code: 'en', name: 'English', native: 'English' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'pl', name: 'Polish', native: 'Polski' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' }
];

// === SETTINGS MANAGER ===
export class SettingsManager {
  constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.shortcuts = { ...DEFAULT_SHORTCUTS };
    this.listeners = new Set();
    this.load();
  }
  
  get(path) {
    const parts = path.split('.');
    let value = this.settings;
    for (const part of parts) {
      value = value?.[part];
    }
    return value;
  }
  
  set(path, value) {
    const parts = path.split('.');
    let obj = this.settings;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!obj[parts[i]]) obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    
    obj[parts[parts.length - 1]] = value;
    this.emit('change', { path, value });
    this.save();
  }
  
  reset(section = null) {
    if (section) {
      this.settings[section] = { ...DEFAULT_SETTINGS[section] };
    } else {
      this.settings = { ...DEFAULT_SETTINGS };
    }
    this.emit('reset', section);
    this.save();
  }
  
  getShortcut(action) {
    return this.shortcuts[action];
  }
  
  setShortcut(action, shortcut) {
    this.shortcuts[action] = shortcut;
    this.emit('shortcutChange', { action, shortcut });
    this.save();
  }
  
  resetShortcuts() {
    this.shortcuts = { ...DEFAULT_SHORTCUTS };
    this.emit('shortcutsReset');
    this.save();
  }
  
  save() {
    try {
      localStorage.setItem('editor_settings', JSON.stringify(this.settings));
      localStorage.setItem('editor_shortcuts', JSON.stringify(this.shortcuts));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  }
  
  load() {
    try {
      const settings = localStorage.getItem('editor_settings');
      const shortcuts = localStorage.getItem('editor_shortcuts');
      
      if (settings) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(settings) };
      }
      if (shortcuts) {
        this.shortcuts = { ...DEFAULT_SHORTCUTS, ...JSON.parse(shortcuts) };
      }
    } catch (e) {
      console.warn('Failed to load settings:', e);
    }
  }
  
  export() {
    return {
      settings: this.settings,
      shortcuts: this.shortcuts,
      exportedAt: Date.now()
    };
  }
  
  import(data) {
    if (data.settings) {
      this.settings = { ...DEFAULT_SETTINGS, ...data.settings };
    }
    if (data.shortcuts) {
      this.shortcuts = { ...DEFAULT_SHORTCUTS, ...data.shortcuts };
    }
    this.emit('import');
    this.save();
  }
  
  on(event, callback) {
    this.listeners.add({ event, callback });
  }
  
  emit(event, data) {
    this.listeners.forEach(l => {
      if (l.event === event) {
        l.callback(data);
      }
    });
  }
}

// Singleton
export const settingsManager = new SettingsManager();

export default {
  DEFAULT_SETTINGS,
  DEFAULT_SHORTCUTS,
  THEMES,
  LANGUAGES,
  SettingsManager,
  settingsManager
};
