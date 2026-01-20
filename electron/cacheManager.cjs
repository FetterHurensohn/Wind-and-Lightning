/**
 * cacheManager.cjs
 * 
 * Cache Manager - Thumbnail & Waveform Cache
 * Integrates with FFmpeg for media processing
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * Generiert Thumbnail für Asset
 */
async function generateThumbnail(projectPath, assetUuid, assetPath, time = 0) {
  console.log(`[CacheManager] Generating thumbnail for ${assetUuid} at ${time}s`);
  
  try {
    // Thumbnail-Ordner erstellen
    const thumbDir = path.join(projectPath, 'cache/thumbnails', assetUuid);
    await fs.mkdir(thumbDir, { recursive: true });
    
    // Output-Pfad
    const frameNumber = Math.floor(time * 10); // 0.1s precision
    const thumbPath = path.join(thumbDir, `frame_${String(frameNumber).padStart(4, '0')}.jpg`);
    
    // Prüfe ob Thumbnail bereits existiert
    try {
      await fs.access(thumbPath);
      return {
        success: true,
        path: thumbPath,
        cached: true
      };
    } catch (err) {
      // Thumbnail nicht im Cache
    }
    
    // FFmpeg Command: Extrahiere Frame
    const ffmpegPath = 'ffmpeg'; // Assume ffmpeg is in PATH
    const cmd = `"${ffmpegPath}" -ss ${time} -i "${assetPath}" -vframes 1 -vf scale=320:-1 -q:v 2 "${thumbPath}" -y`;
    
    await execAsync(cmd);
    
    console.log(`[CacheManager] Thumbnail generated: ${thumbPath}`);
    
    return {
      success: true,
      path: thumbPath,
      cached: false
    };
  } catch (err) {
    console.error('[CacheManager] Error generating thumbnail:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Holt Thumbnail aus Cache
 */
async function getCachedThumbnail(projectPath, assetUuid, time = 0) {
  try {
    const frameNumber = Math.floor(time * 10);
    const thumbPath = path.join(
      projectPath, 
      'cache/thumbnails', 
      assetUuid, 
      `frame_${String(frameNumber).padStart(4, '0')}.jpg`
    );
    
    await fs.access(thumbPath);
    
    return {
      success: true,
      path: thumbPath,
      exists: true
    };
  } catch (err) {
    return {
      success: false,
      exists: false
    };
  }
}

/**
 * Generiert Waveform für Audio/Video
 */
async function generateWaveform(projectPath, assetUuid, assetPath) {
  console.log(`[CacheManager] Generating waveform for ${assetUuid}`);
  
  try {
    // Waveform-Ordner erstellen
    const waveformDir = path.join(projectPath, 'cache/waveforms');
    await fs.mkdir(waveformDir, { recursive: true });
    
    const waveformPath = path.join(waveformDir, `${assetUuid}.json`);
    
    // Prüfe ob Waveform bereits existiert
    try {
      await fs.access(waveformPath);
      const waveformContent = await fs.readFile(waveformPath, 'utf8');
      return {
        success: true,
        path: waveformPath,
        data: JSON.parse(waveformContent),
        cached: true
      };
    } catch (err) {
      // Waveform nicht im Cache
    }
    
    // FFmpeg Command: Extrahiere Audio-Samples
    const ffmpegPath = 'ffmpeg';
    const tmpWavPath = path.join(waveformDir, `${assetUuid}_temp.wav`);
    
    // 1. Konvertiere zu Mono WAV
    const extractCmd = `"${ffmpegPath}" -i "${assetPath}" -ac 1 -ar 8000 "${tmpWavPath}" -y`;
    await execAsync(extractCmd);
    
    // 2. Lese WAV-Daten (simplified - nur Peak-Werte)
    const wavBuffer = await fs.readFile(tmpWavPath);
    
    // Simplified Waveform: Sample jeden 100. Wert
    const samples = [];
    const dataStart = 44; // WAV header size
    const step = 100;
    
    for (let i = dataStart; i < wavBuffer.length - 1; i += step) {
      const sample = wavBuffer.readInt16LE(i);
      const normalized = sample / 32768.0; // Normalize to -1...1
      samples.push(Math.abs(normalized)); // Absolute value for waveform
    }
    
    // Speichere Waveform-Daten
    const waveformData = {
      uuid: assetUuid,
      samples,
      sampleRate: 8000,
      generatedAt: new Date().toISOString()
    };
    
    await fs.writeFile(waveformPath, JSON.stringify(waveformData), 'utf8');
    
    // Lösche temporäre WAV
    await fs.unlink(tmpWavPath);
    
    console.log(`[CacheManager] Waveform generated: ${waveformPath}`);
    
    return {
      success: true,
      path: waveformPath,
      data: waveformData,
      cached: false
    };
  } catch (err) {
    console.error('[CacheManager] Error generating waveform:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Holt Waveform aus Cache
 */
async function getCachedWaveform(projectPath, assetUuid) {
  try {
    const waveformPath = path.join(projectPath, 'cache/waveforms', `${assetUuid}.json`);
    const waveformContent = await fs.readFile(waveformPath, 'utf8');
    
    return {
      success: true,
      path: waveformPath,
      data: JSON.parse(waveformContent),
      exists: true
    };
  } catch (err) {
    return {
      success: false,
      exists: false
    };
  }
}

/**
 * Berechnet Cache-Größe
 */
async function calculateCacheSize(projectPath) {
  try {
    const cacheDir = path.join(projectPath, 'cache');
    
    let totalSize = 0;
    
    async function calcDirSize(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const entryPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await calcDirSize(entryPath);
        } else {
          const stats = await fs.stat(entryPath);
          totalSize += stats.size;
        }
      }
    }
    
    await calcDirSize(cacheDir);
    
    return {
      success: true,
      size: totalSize,
      sizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      sizeGB: (totalSize / (1024 * 1024 * 1024)).toFixed(2)
    };
  } catch (err) {
    console.error('[CacheManager] Error calculating cache size:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Löscht Cache (vollständig oder nach Typ)
 */
async function clearCache(projectPath, type = null) {
  console.log(`[CacheManager] Clearing cache (type: ${type || 'all'})`);
  
  try {
    let deletedCount = 0;
    
    if (!type || type === 'thumbnails') {
      const thumbDir = path.join(projectPath, 'cache/thumbnails');
      try {
        await fs.rm(thumbDir, { recursive: true, force: true });
        await fs.mkdir(thumbDir, { recursive: true });
        deletedCount++;
      } catch (err) {
        console.warn('[CacheManager] Could not clear thumbnails:', err);
      }
    }
    
    if (!type || type === 'waveforms') {
      const waveDir = path.join(projectPath, 'cache/waveforms');
      try {
        await fs.rm(waveDir, { recursive: true, force: true });
        await fs.mkdir(waveDir, { recursive: true });
        deletedCount++;
      } catch (err) {
        console.warn('[CacheManager] Could not clear waveforms:', err);
      }
    }
    
    if (!type || type === 'render') {
      const renderDir = path.join(projectPath, 'cache/render_cache');
      try {
        await fs.rm(renderDir, { recursive: true, force: true });
        await fs.mkdir(renderDir, { recursive: true });
        deletedCount++;
      } catch (err) {
        console.warn('[CacheManager] Could not clear render cache:', err);
      }
    }
    
    return {
      success: true,
      deletedCount
    };
  } catch (err) {
    console.error('[CacheManager] Error clearing cache:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Cleanup: Löscht Cache-Dateien älter als X Tage
 */
async function cleanupOldCache(projectPath, maxAgeDays = 30) {
  console.log(`[CacheManager] Cleaning up cache older than ${maxAgeDays} days`);
  
  try {
    const cacheDir = path.join(projectPath, 'cache');
    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
    const now = Date.now();
    let deletedCount = 0;
    
    async function cleanDir(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const entryPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await cleanDir(entryPath);
        } else {
          const stats = await fs.stat(entryPath);
          const age = now - stats.mtimeMs;
          
          if (age > maxAgeMs) {
            await fs.unlink(entryPath);
            deletedCount++;
          }
        }
      }
    }
    
    await cleanDir(cacheDir);
    
    return {
      success: true,
      deletedCount
    };
  } catch (err) {
    console.error('[CacheManager] Error cleaning old cache:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

module.exports = {
  generateThumbnail,
  getCachedThumbnail,
  generateWaveform,
  getCachedWaveform,
  calculateCacheSize,
  clearCache,
  cleanupOldCache
};
