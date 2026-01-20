/**
 * proxyGenerator.cjs
 * 
 * Proxy Generator - FFmpeg-based proxy generation
 * Creates lower-resolution versions for smooth playback
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const EventEmitter = require('events');

const execAsync = promisify(exec);

// Proxy-Profile
const PROXY_PROFILES = {
  '720p': {
    resolution: '1280:720',
    bitrate: '2M',
    codec: 'libx264',
    crf: 23,
    preset: 'medium',
    suffix: '_720p'
  },
  '1080p': {
    resolution: '1920:1080',
    bitrate: '4M',
    codec: 'libx265',
    crf: 26,
    preset: 'medium',
    suffix: '_1080p'
  },
  '480p': {
    resolution: '854:480',
    bitrate: '1M',
    codec: 'libx264',
    crf: 25,
    preset: 'fast',
    suffix: '_480p'
  }
};

class ProxyGenerator extends EventEmitter {
  constructor() {
    super();
    this.queue = [];
    this.currentJob = null;
    this.isProcessing = false;
  }
  
  /**
   * Fügt Proxy-Job zur Queue hinzu
   */
  async addToQueue(projectPath, assetUuid, assetPath, profile = '720p') {
    const job = {
      id: `${assetUuid}_${Date.now()}`,
      projectPath,
      assetUuid,
      assetPath,
      profile,
      status: 'queued',
      progress: 0
    };
    
    this.queue.push(job);
    this.emit('queue-updated', this.queue);
    
    // Starte Verarbeitung
    if (!this.isProcessing) {
      this.processQueue();
    }
    
    return {
      success: true,
      jobId: job.id
    };
  }
  
  /**
   * Verarbeitet Queue
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      const job = this.queue.shift();
      this.currentJob = job;
      
      job.status = 'processing';
      this.emit('job-started', job);
      
      try {
        const result = await this.generateProxy(job);
        job.status = 'completed';
        job.result = result;
        this.emit('job-completed', job);
      } catch (err) {
        job.status = 'failed';
        job.error = err.message;
        this.emit('job-failed', job);
      }
    }
    
    this.isProcessing = false;
    this.currentJob = null;
  }
  
  /**
   * Generiert Proxy für Asset
   */
  async generateProxy(job) {
    const { projectPath, assetUuid, assetPath, profile } = job;
    
    console.log(`[ProxyGenerator] Generating ${profile} proxy for ${assetUuid}`);
    
    const proxyConfig = PROXY_PROFILES[profile];
    if (!proxyConfig) {
      throw new Error(`Unknown proxy profile: ${profile}`);
    }
    
    // Proxy-Pfad
    const ext = path.extname(assetPath);
    const proxyFilename = `${assetUuid}${proxyConfig.suffix}.mp4`;
    const proxyPath = path.join(projectPath, 'assets/proxies', proxyFilename);
    
    // Prüfe ob Proxy bereits existiert
    try {
      await fs.access(proxyPath);
      console.log(`[ProxyGenerator] Proxy already exists: ${proxyPath}`);
      return {
        success: true,
        proxyPath: `assets/proxies/${proxyFilename}`,
        alreadyExists: true
      };
    } catch (err) {
      // Proxy nicht vorhanden, erstelle neu
    }
    
    // FFmpeg Command
    const ffmpegPath = 'ffmpeg';
    const cmd = `"${ffmpegPath}" -i "${assetPath}" ` +
      `-vf scale=${proxyConfig.resolution}:force_original_aspect_ratio=decrease ` +
      `-c:v ${proxyConfig.codec} -crf ${proxyConfig.crf} -preset ${proxyConfig.preset} ` +
      `-b:v ${proxyConfig.bitrate} ` +
      `-c:a aac -b:a 128k ` +
      `-movflags +faststart ` +
      `"${proxyPath}" -y`;
    
    console.log(`[ProxyGenerator] FFmpeg command: ${cmd}`);
    
    // Führe FFmpeg aus mit Progress-Tracking
    await this.execWithProgress(cmd, job);
    
    // Aktualisiere Asset-Registry
    const assetRegistry = require('./assetRegistry.cjs');
    await assetRegistry.updateAsset(projectPath, assetUuid, {
      proxy_available: true,
      proxy_path: `assets/proxies/${proxyFilename}`
    });
    
    console.log(`[ProxyGenerator] Proxy generated successfully: ${proxyPath}`);
    
    return {
      success: true,
      proxyPath: `assets/proxies/${proxyFilename}`
    };
  }
  
  /**
   * Führt FFmpeg-Command mit Progress-Tracking aus
   */
  async execWithProgress(cmd, job) {
    return new Promise((resolve, reject) => {
      const child = exec(cmd);
      
      let stderr = '';
      
      child.stderr.on('data', (data) => {
        stderr += data;
        
        // Parse FFmpeg progress
        const timeMatch = data.match(/time=(\d{2}):(\d{2}):(\d{2})/);
        if (timeMatch) {
          const hours = parseInt(timeMatch[1]);
          const minutes = parseInt(timeMatch[2]);
          const seconds = parseInt(timeMatch[3]);
          const totalSeconds = hours * 3600 + minutes * 60 + seconds;
          
          // Schätze Progress (simplified)
          // In production: compare with total duration
          job.progress = Math.min(99, Math.floor(totalSeconds / 10 * 100));
          this.emit('progress', { jobId: job.id, progress: job.progress });
        }
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          job.progress = 100;
          this.emit('progress', { jobId: job.id, progress: 100 });
          resolve();
        } else {
          reject(new Error(`FFmpeg exited with code ${code}: ${stderr}`));
        }
      });
      
      child.on('error', reject);
    });
  }
  
  /**
   * Prüft Proxy-Status für Asset
   */
  async checkProxyStatus(projectPath, assetUuid) {
    const assetRegistry = require('./assetRegistry.cjs');
    const index = await assetRegistry.loadIndex(projectPath);
    
    const asset = index.assets[assetUuid];
    if (!asset) {
      return {
        success: false,
        error: 'Asset nicht gefunden'
      };
    }
    
    return {
      success: true,
      available: asset.proxy_available,
      path: asset.proxy_path
    };
  }
  
  /**
   * Löscht Proxy
   */
  async deleteProxy(projectPath, assetUuid) {
    console.log(`[ProxyGenerator] Deleting proxy for ${assetUuid}`);
    
    try {
      const assetRegistry = require('./assetRegistry.cjs');
      const index = await assetRegistry.loadIndex(projectPath);
      
      const asset = index.assets[assetUuid];
      if (!asset || !asset.proxy_available) {
        return {
          success: false,
          error: 'Kein Proxy vorhanden'
        };
      }
      
      // Lösche Proxy-Datei
      const proxyPath = path.join(projectPath, asset.proxy_path);
      await fs.unlink(proxyPath);
      
      // Aktualisiere Asset-Registry
      await assetRegistry.updateAsset(projectPath, assetUuid, {
        proxy_available: false,
        proxy_path: null
      });
      
      return { success: true };
    } catch (err) {
      console.error('[ProxyGenerator] Error deleting proxy:', err);
      return {
        success: false,
        error: err.message
      };
    }
  }
}

// Singleton-Instanz
const proxyGenerator = new ProxyGenerator();

/**
 * Wrapper-Funktionen für einfache API
 */
async function generate(projectPath, assetUuid, assetPath, profile = '720p') {
  return await proxyGenerator.addToQueue(projectPath, assetUuid, assetPath, profile);
}

function onProgress(callback) {
  proxyGenerator.on('progress', callback);
}

function onJobCompleted(callback) {
  proxyGenerator.on('job-completed', callback);
}

function onJobFailed(callback) {
  proxyGenerator.on('job-failed', callback);
}

async function checkStatus(projectPath, assetUuid) {
  return await proxyGenerator.checkProxyStatus(projectPath, assetUuid);
}

async function deleteProxy(projectPath, assetUuid) {
  return await proxyGenerator.deleteProxy(projectPath, assetUuid);
}

function getQueue() {
  return proxyGenerator.queue;
}

function getCurrentJob() {
  return proxyGenerator.currentJob;
}

module.exports = {
  generate,
  onProgress,
  onJobCompleted,
  onJobFailed,
  checkStatus,
  deleteProxy,
  getQueue,
  getCurrentJob,
  PROXY_PROFILES
};
