/**
 * Export Module - Vollständige Export-Pipeline
 * Rendering, Encoding, Batch Export, Social Media Upload
 */

// Simple UUID generator function
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// === EXPORT PRESETS ===
export const EXPORT_PRESETS = {
  // Video Resolutions
  resolutions: [
    { id: '480p', name: '480p SD', width: 854, height: 480 },
    { id: '720p', name: '720p HD', width: 1280, height: 720 },
    { id: '1080p', name: '1080p Full HD', width: 1920, height: 1080, recommended: true },
    { id: '1440p', name: '1440p 2K', width: 2560, height: 1440 },
    { id: '2160p', name: '4K UHD', width: 3840, height: 2160, pro: true },
    { id: '4320p', name: '8K', width: 7680, height: 4320, pro: true }
  ],
  
  // Frame Rates
  frameRates: [
    { id: '23.976', name: '23.976 fps', value: 23.976, description: 'Film' },
    { id: '24', name: '24 fps', value: 24, description: 'Kino' },
    { id: '25', name: '25 fps', value: 25, description: 'PAL' },
    { id: '29.97', name: '29.97 fps', value: 29.97, description: 'NTSC' },
    { id: '30', name: '30 fps', value: 30, description: 'Standard', recommended: true },
    { id: '50', name: '50 fps', value: 50, description: 'PAL Smooth' },
    { id: '59.94', name: '59.94 fps', value: 59.94, description: 'NTSC Smooth' },
    { id: '60', name: '60 fps', value: 60, description: 'Smooth' }
  ],
  
  // Video Codecs
  videoCodecs: [
    { id: 'h264', name: 'H.264 (AVC)', extension: 'mp4', description: 'Beste Kompatibilität' },
    { id: 'h265', name: 'H.265 (HEVC)', extension: 'mp4', description: 'Bessere Kompression', pro: true },
    { id: 'vp9', name: 'VP9', extension: 'webm', description: 'Web-optimiert' },
    { id: 'av1', name: 'AV1', extension: 'mp4', description: 'Neueste Kompression', pro: true },
    { id: 'prores', name: 'ProRes 422', extension: 'mov', description: 'Professionell', pro: true },
    { id: 'prores-hq', name: 'ProRes 422 HQ', extension: 'mov', description: 'Höchste Qualität', pro: true },
    { id: 'dnxhd', name: 'DNxHD', extension: 'mxf', description: 'Avid kompatibel', pro: true }
  ],
  
  // Audio Codecs
  audioCodecs: [
    { id: 'aac', name: 'AAC', extension: 'm4a', description: 'Standard', bitrates: [128, 192, 256, 320] },
    { id: 'mp3', name: 'MP3', extension: 'mp3', description: 'Kompatibel', bitrates: [128, 192, 256, 320] },
    { id: 'opus', name: 'Opus', extension: 'opus', description: 'Effizient', bitrates: [64, 96, 128, 192] },
    { id: 'pcm', name: 'PCM (WAV)', extension: 'wav', description: 'Unkomprimiert', bitrates: [] },
    { id: 'flac', name: 'FLAC', extension: 'flac', description: 'Verlustfrei', bitrates: [] }
  ],
  
  // Bitrate Presets
  bitrates: {
    '480p': { low: 1000, medium: 2500, high: 5000 },
    '720p': { low: 2500, medium: 5000, high: 10000 },
    '1080p': { low: 5000, medium: 10000, high: 20000 },
    '1440p': { low: 10000, medium: 20000, high: 40000 },
    '2160p': { low: 20000, medium: 40000, high: 80000 },
    '4320p': { low: 40000, medium: 80000, high: 150000 }
  },
  
  // Containers
  containers: [
    { id: 'mp4', name: 'MP4', extension: '.mp4', description: 'Universal' },
    { id: 'mov', name: 'MOV', extension: '.mov', description: 'Apple QuickTime' },
    { id: 'webm', name: 'WebM', extension: '.webm', description: 'Web' },
    { id: 'mkv', name: 'MKV', extension: '.mkv', description: 'Matroska' },
    { id: 'avi', name: 'AVI', extension: '.avi', description: 'Legacy' },
    { id: 'gif', name: 'GIF', extension: '.gif', description: 'Animiert' },
    { id: 'apng', name: 'APNG', extension: '.png', description: 'Animiertes PNG' }
  ]
};

// === SOCIAL MEDIA PRESETS ===
export const SOCIAL_PRESETS = {
  tiktok: {
    name: 'TikTok',
    icon: 'tiktok',
    presets: [
      { name: 'Feed', aspectRatio: '9:16', width: 1080, height: 1920, maxDuration: 180, fps: 30 },
      { name: 'Feed (60fps)', aspectRatio: '9:16', width: 1080, height: 1920, maxDuration: 180, fps: 60 }
    ],
    maxFileSize: 287, // MB
    formats: ['mp4'],
    directUpload: true
  },
  instagram: {
    name: 'Instagram',
    icon: 'instagram',
    presets: [
      { name: 'Reel', aspectRatio: '9:16', width: 1080, height: 1920, maxDuration: 90, fps: 30 },
      { name: 'Story', aspectRatio: '9:16', width: 1080, height: 1920, maxDuration: 60, fps: 30 },
      { name: 'Feed (Square)', aspectRatio: '1:1', width: 1080, height: 1080, maxDuration: 60, fps: 30 },
      { name: 'Feed (Portrait)', aspectRatio: '4:5', width: 1080, height: 1350, maxDuration: 60, fps: 30 },
      { name: 'Feed (Landscape)', aspectRatio: '16:9', width: 1920, height: 1080, maxDuration: 60, fps: 30 }
    ],
    maxFileSize: 650, // MB
    formats: ['mp4', 'mov'],
    directUpload: true
  },
  youtube: {
    name: 'YouTube',
    icon: 'youtube',
    presets: [
      { name: 'Standard', aspectRatio: '16:9', width: 1920, height: 1080, maxDuration: null, fps: 30 },
      { name: 'HD', aspectRatio: '16:9', width: 1920, height: 1080, maxDuration: null, fps: 60 },
      { name: '4K', aspectRatio: '16:9', width: 3840, height: 2160, maxDuration: null, fps: 30, pro: true },
      { name: '4K HDR', aspectRatio: '16:9', width: 3840, height: 2160, maxDuration: null, fps: 60, pro: true, hdr: true },
      { name: 'Shorts', aspectRatio: '9:16', width: 1080, height: 1920, maxDuration: 60, fps: 30 }
    ],
    maxFileSize: 256000, // MB (256GB)
    formats: ['mp4', 'mov', 'webm', 'mkv', 'avi'],
    directUpload: true
  },
  facebook: {
    name: 'Facebook',
    icon: 'facebook',
    presets: [
      { name: 'Feed', aspectRatio: '16:9', width: 1920, height: 1080, maxDuration: 240, fps: 30 },
      { name: 'Reel', aspectRatio: '9:16', width: 1080, height: 1920, maxDuration: 90, fps: 30 },
      { name: 'Story', aspectRatio: '9:16', width: 1080, height: 1920, maxDuration: 20, fps: 30 }
    ],
    maxFileSize: 10000, // MB (10GB)
    formats: ['mp4', 'mov'],
    directUpload: true
  },
  twitter: {
    name: 'Twitter/X',
    icon: 'twitter',
    presets: [
      { name: 'Standard', aspectRatio: '16:9', width: 1920, height: 1080, maxDuration: 140, fps: 30 },
      { name: 'Square', aspectRatio: '1:1', width: 1080, height: 1080, maxDuration: 140, fps: 30 }
    ],
    maxFileSize: 512, // MB
    formats: ['mp4'],
    directUpload: true
  },
  snapchat: {
    name: 'Snapchat',
    icon: 'snapchat',
    presets: [
      { name: 'Spotlight', aspectRatio: '9:16', width: 1080, height: 1920, maxDuration: 60, fps: 30 }
    ],
    maxFileSize: 256, // MB
    formats: ['mp4'],
    directUpload: false
  },
  linkedin: {
    name: 'LinkedIn',
    icon: 'linkedin',
    presets: [
      { name: 'Feed', aspectRatio: '16:9', width: 1920, height: 1080, maxDuration: 600, fps: 30 },
      { name: 'Square', aspectRatio: '1:1', width: 1080, height: 1080, maxDuration: 600, fps: 30 }
    ],
    maxFileSize: 5000, // MB (5GB)
    formats: ['mp4'],
    directUpload: false
  }
};

// === EXPORT JOB ===
export function createExportJob(project, settings) {
  return {
    id: generateUUID(),
    projectId: project.id,
    projectName: project.name,
    status: 'queued', // 'queued', 'preparing', 'rendering', 'encoding', 'uploading', 'completed', 'failed', 'cancelled'
    progress: 0,
    currentPhase: '',
    startTime: null,
    endTime: null,
    estimatedTime: null,
    
    // Settings
    settings: {
      // Video
      resolution: settings.resolution || '1080p',
      width: settings.width || 1920,
      height: settings.height || 1080,
      fps: settings.fps || 30,
      videoCodec: settings.videoCodec || 'h264',
      videoBitrate: settings.videoBitrate || 'auto',
      pixelFormat: settings.pixelFormat || 'yuv420p',
      
      // Audio
      audioCodec: settings.audioCodec || 'aac',
      audioBitrate: settings.audioBitrate || 256,
      audioSampleRate: settings.audioSampleRate || 48000,
      audioChannels: settings.audioChannels || 2,
      
      // Container
      container: settings.container || 'mp4',
      
      // Range
      startTime: settings.startTime || 0,
      endTime: settings.endTime || null, // null = full project
      
      // Options
      includeWatermark: settings.includeWatermark || false,
      watermarkImage: settings.watermarkImage || null,
      watermarkPosition: settings.watermarkPosition || 'bottom-right',
      watermarkOpacity: settings.watermarkOpacity || 50,
      
      // Advanced
      twoPass: settings.twoPass || false,
      hardwareAcceleration: settings.hardwareAcceleration !== false,
      deinterlace: settings.deinterlace || false,
      hdr: settings.hdr || false,
      colorSpace: settings.colorSpace || 'rec709'
    },
    
    // Output
    outputPath: settings.outputPath || null,
    outputSize: null,
    
    // Metadata
    metadata: {
      title: settings.title || project.name,
      author: settings.author || '',
      copyright: settings.copyright || '',
      description: settings.description || '',
      tags: settings.tags || []
    },
    
    // Upload settings
    upload: settings.upload || null, // { platform: 'youtube', ... }
    
    createdAt: Date.now()
  };
}

// === BATCH EXPORT ===
export function createBatchExport(project, presets) {
  return presets.map(preset => createExportJob(project, preset));
}

// === RENDER QUEUE ===
class RenderQueue {
  constructor() {
    this.jobs = [];
    this.currentJob = null;
    this.isRunning = false;
    this.maxConcurrent = 1;
    this.listeners = new Set();
  }
  
  addJob(job) {
    this.jobs.push(job);
    this.emit('jobAdded', job);
    
    if (!this.isRunning) {
      this.processQueue();
    }
    
    return job.id;
  }
  
  removeJob(jobId) {
    this.jobs = this.jobs.filter(j => j.id !== jobId);
    this.emit('jobRemoved', jobId);
  }
  
  cancelJob(jobId) {
    const job = this.jobs.find(j => j.id === jobId);
    if (job) {
      job.status = 'cancelled';
      this.emit('jobCancelled', job);
    }
  }
  
  async processQueue() {
    if (this.isRunning || this.jobs.length === 0) return;
    
    this.isRunning = true;
    
    while (this.jobs.length > 0) {
      const job = this.jobs.find(j => j.status === 'queued');
      if (!job) break;
      
      this.currentJob = job;
      await this.processJob(job);
    }
    
    this.isRunning = false;
    this.currentJob = null;
  }
  
  async processJob(job) {
    job.status = 'preparing';
    job.startTime = Date.now();
    this.emit('jobStarted', job);
    
    try {
      // Phase 1: Prepare
      job.currentPhase = 'Vorbereitung...';
      job.progress = 5;
      this.emit('progress', job);
      
      // Phase 2: Render frames
      job.status = 'rendering';
      job.currentPhase = 'Frames rendern...';
      
      // Simulate rendering (würde echte FFmpeg-Befehle ausführen)
      for (let i = 10; i <= 70; i += 5) {
        if (job.status === 'cancelled') throw new Error('Cancelled');
        await this.delay(100);
        job.progress = i;
        this.emit('progress', job);
      }
      
      // Phase 3: Encode
      job.status = 'encoding';
      job.currentPhase = 'Video kodieren...';
      
      for (let i = 70; i <= 95; i += 5) {
        if (job.status === 'cancelled') throw new Error('Cancelled');
        await this.delay(100);
        job.progress = i;
        this.emit('progress', job);
      }
      
      // Phase 4: Finalize
      job.currentPhase = 'Finalisierung...';
      job.progress = 98;
      this.emit('progress', job);
      
      // Complete
      job.status = 'completed';
      job.progress = 100;
      job.endTime = Date.now();
      job.currentPhase = 'Abgeschlossen';
      this.emit('jobCompleted', job);
      
    } catch (error) {
      if (job.status !== 'cancelled') {
        job.status = 'failed';
        job.error = error.message;
        this.emit('jobFailed', job);
      }
    }
    
    // Remove from queue
    this.jobs = this.jobs.filter(j => j.id !== job.id);
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  on(event, callback) {
    this.listeners.add({ event, callback });
  }
  
  off(event, callback) {
    this.listeners.forEach(l => {
      if (l.event === event && l.callback === callback) {
        this.listeners.delete(l);
      }
    });
  }
  
  emit(event, data) {
    this.listeners.forEach(l => {
      if (l.event === event) {
        l.callback(data);
      }
    });
  }
  
  getStatus() {
    return {
      isRunning: this.isRunning,
      currentJob: this.currentJob,
      queueLength: this.jobs.length,
      jobs: this.jobs
    };
  }
}

// Singleton
export const renderQueue = new RenderQueue();

// === SUBTITLE EXPORT ===
export function exportSubtitles(captions, format = 'srt') {
  switch (format) {
    case 'srt':
      return exportSRT(captions);
    case 'vtt':
      return exportVTT(captions);
    case 'ass':
      return exportASS(captions);
    default:
      return exportSRT(captions);
  }
}

function exportSRT(captions) {
  return captions.map((caption, index) => {
    const startTime = formatSRTTime(caption.start);
    const endTime = formatSRTTime(caption.end);
    return `${index + 1}\n${startTime} --> ${endTime}\n${caption.text}\n`;
  }).join('\n');
}

function exportVTT(captions) {
  let output = 'WEBVTT\n\n';
  output += captions.map(caption => {
    const startTime = formatVTTTime(caption.start);
    const endTime = formatVTTTime(caption.end);
    return `${startTime} --> ${endTime}\n${caption.text}\n`;
  }).join('\n');
  return output;
}

function exportASS(captions) {
  let output = `[Script Info]
Title: Exported Subtitles
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,48,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,2,0,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;
  
  output += captions.map(caption => {
    const startTime = formatASSTime(caption.start);
    const endTime = formatASSTime(caption.end);
    return `Dialogue: 0,${startTime},${endTime},Default,,0,0,0,,${caption.text}`;
  }).join('\n');
  
  return output;
}

function formatSRTTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

function formatVTTTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

function formatASSTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds % 1) * 100);
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

export default {
  EXPORT_PRESETS,
  SOCIAL_PRESETS,
  createExportJob,
  createBatchExport,
  renderQueue,
  exportSubtitles
};
