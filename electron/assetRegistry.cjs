/**
 * assetRegistry.cjs
 * 
 * Asset Registry - UUID-based asset management
 * Handles import, metadata, checksums, external references
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Generiert SHA-256 Checksum für Datei
 */
async function calculateChecksum(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fsSync.createReadStream(filePath);
    
    stream.on('data', data => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

/**
 * Lädt Asset-Index
 */
async function loadIndex(projectPath) {
  const indexPath = path.join(projectPath, 'assets/index.json');
  
  try {
    const content = await fs.readFile(indexPath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('[AssetRegistry] Error loading index:', err);
    return { version: '1.0.0', assets: {} };
  }
}

/**
 * Speichert Asset-Index
 */
async function saveIndex(projectPath, index) {
  const indexPath = path.join(projectPath, 'assets/index.json');
  
  try {
    await fs.writeFile(indexPath, JSON.stringify(index, null, 2), 'utf8');
    return { success: true };
  } catch (err) {
    console.error('[AssetRegistry] Error saving index:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Bestimmt Asset-Typ basierend auf Dateiendung
 */
function determineAssetType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.m4v'];
  const audioExts = ['.mp3', '.wav', '.aac', '.m4a', '.ogg', '.flac', '.wma'];
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.svg'];
  
  if (videoExts.includes(ext)) return 'video';
  if (audioExts.includes(ext)) return 'audio';
  if (imageExts.includes(ext)) return 'image';
  
  return 'unknown';
}

/**
 * Extrahiert Metadaten aus Datei (basic info)
 */
async function extractBasicMetadata(filePath) {
  try {
    const stats = await fs.stat(filePath);
    const type = determineAssetType(filePath);
    
    return {
      size: stats.size,
      type,
      modifiedAt: stats.mtime.toISOString()
    };
  } catch (err) {
    console.error('[AssetRegistry] Error extracting metadata:', err);
    return null;
  }
}

/**
 * Importiert ein Asset
 * 
 * @param {string} projectPath - Projektpfad
 * @param {string} sourceFilePath - Quell-Datei
 * @param {string} copyMode - 'copy' | 'link' | 'move'
 * @param {object} additionalMetadata - Zusätzliche Metadaten (z.B. von FFmpeg)
 */
async function importAsset(projectPath, sourceFilePath, copyMode = 'copy', additionalMetadata = {}) {
  console.log(`[AssetRegistry] Importing asset: ${sourceFilePath} (mode: ${copyMode})`);
  
  try {
    // 1. Generiere UUID
    const assetUuid = crypto.randomUUID();
    
    // 2. Bestimme Typ
    const type = determineAssetType(sourceFilePath);
    if (type === 'unknown') {
      return {
        success: false,
        error: 'Unbekannter Dateityp'
      };
    }
    
    // 3. Extrahiere Basis-Metadaten
    const basicMeta = await extractBasicMetadata(sourceFilePath);
    if (!basicMeta) {
      return {
        success: false,
        error: 'Konnte Metadaten nicht extrahieren'
      };
    }
    
    // 3.5 Extrahiere erweiterte Metadaten mit FFmpeg für Video/Audio
    let extendedMeta = {};
    if (basicMeta.type === 'video' || basicMeta.type === 'audio') {
      try {
        const ffmpegHandler = require('./ffmpeg-handler.cjs');
        const mediaInfo = await ffmpegHandler.getVideoInfo(sourceFilePath);
        
        extendedMeta = {
          duration: mediaInfo.duration || additionalMetadata.duration || null,
          width: mediaInfo.width || additionalMetadata.width || null,
          height: mediaInfo.height || additionalMetadata.height || null,
          codec: mediaInfo.codec || additionalMetadata.codec || null,
          bitrate: mediaInfo.bitrate || additionalMetadata.bitrate || null,
          fps: mediaInfo.fps || additionalMetadata.fps || null,
          audio_codec: mediaInfo.audioCodec || null,
          channels: mediaInfo.channels || null,
          sample_rate: mediaInfo.sampleRate || null
        };
        
        console.log(`[AssetRegistry] Extracted FFmpeg metadata:`, extendedMeta);
      } catch (err) {
        console.warn('[AssetRegistry] Could not extract FFmpeg metadata:', err.message);
        // Fallback zu additionalMetadata
        extendedMeta = {
          duration: additionalMetadata.duration || 5,
          width: additionalMetadata.width || null,
          height: additionalMetadata.height || null,
          codec: additionalMetadata.codec || null,
          bitrate: additionalMetadata.bitrate || null,
          fps: additionalMetadata.fps || null
        };
      }
    }
    
    // 4. Bestimme Speicherort
    const filename = path.basename(sourceFilePath);
    const ext = path.extname(filename);
    const typeFolder = type === 'video' ? 'video' : type === 'audio' ? 'audio' : 'images';
    const localPath = `assets/media/${typeFolder}/${assetUuid}${ext}`;
    const fullLocalPath = path.join(projectPath, localPath);
    
    // 5. Kopiere/Verlinke Datei
    let storage = 'internal';
    
    if (copyMode === 'copy') {
      await fs.copyFile(sourceFilePath, fullLocalPath);
      storage = 'internal';
    } else if (copyMode === 'move') {
      await fs.rename(sourceFilePath, fullLocalPath);
      storage = 'internal';
    } else if (copyMode === 'link') {
      storage = 'external';
      // Keine Kopie, nur Referenz
    }
    
    // 6. Berechne Checksum (nur für interne Assets)
    let checksum = null;
    if (storage === 'internal') {
      checksum = await calculateChecksum(fullLocalPath);
    }
    
    // 7. Erstelle Asset-Metadaten
    const assetMetadata = {
      uuid: assetUuid,
      type,
      original_path: sourceFilePath,
      filename,
      imported_at: new Date().toISOString(),
      duration: extendedMeta.duration || additionalMetadata.duration || null,
      width: extendedMeta.width || additionalMetadata.width || null,
      height: extendedMeta.height || additionalMetadata.height || null,
      resolution: extendedMeta.width && extendedMeta.height 
        ? `${extendedMeta.width}x${extendedMeta.height}` 
        : (additionalMetadata.resolution || null),
      codec: extendedMeta.codec || additionalMetadata.codec || null,
      bitrate: extendedMeta.bitrate || additionalMetadata.bitrate || null,
      fps: extendedMeta.fps || additionalMetadata.fps || null,
      audio_codec: extendedMeta.audio_codec || null,
      channels: extendedMeta.channels || null,
      sample_rate: extendedMeta.sample_rate || null,
      storage,
      local_path: storage === 'internal' ? localPath : null,
      proxy_available: false,
      proxy_path: null,
      thumbnail_count: 0,
      checksum,
      size: basicMeta.size
    };
    
    // 8. Lade Index
    const index = await loadIndex(projectPath);
    
    // 9. Füge Asset hinzu
    index.assets[assetUuid] = assetMetadata;
    
    // 10. Speichere Index
    await saveIndex(projectPath, index);
    
    console.log(`[AssetRegistry] Asset imported successfully: ${assetUuid}`);
    
    return {
      success: true,
      uuid: assetUuid,
      metadata: assetMetadata
    };
  } catch (err) {
    console.error('[AssetRegistry] Error importing asset:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Aktualisiert Asset-Metadaten
 */
async function updateAsset(projectPath, assetUuid, updates) {
  try {
    const index = await loadIndex(projectPath);
    
    if (!index.assets[assetUuid]) {
      return {
        success: false,
        error: 'Asset nicht gefunden'
      };
    }
    
    // Merge updates
    index.assets[assetUuid] = {
      ...index.assets[assetUuid],
      ...updates
    };
    
    await saveIndex(projectPath, index);
    
    return {
      success: true,
      metadata: index.assets[assetUuid]
    };
  } catch (err) {
    console.error('[AssetRegistry] Error updating asset:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Entfernt ein Asset aus der Registry
 */
async function removeAsset(projectPath, assetUuid, deleteFile = false) {
  try {
    const index = await loadIndex(projectPath);
    
    if (!index.assets[assetUuid]) {
      return {
        success: false,
        error: 'Asset nicht gefunden'
      };
    }
    
    const asset = index.assets[assetUuid];
    
    // Lösche Datei (wenn gewünscht und internal)
    if (deleteFile && asset.storage === 'internal' && asset.local_path) {
      const fullPath = path.join(projectPath, asset.local_path);
      try {
        await fs.unlink(fullPath);
      } catch (err) {
        console.warn('[AssetRegistry] Could not delete file:', err);
      }
      
      // Lösche Proxy
      if (asset.proxy_available && asset.proxy_path) {
        const proxyPath = path.join(projectPath, asset.proxy_path);
        try {
          await fs.unlink(proxyPath);
        } catch (err) {
          console.warn('[AssetRegistry] Could not delete proxy:', err);
        }
      }
      
      // Lösche Thumbnails
      const thumbDir = path.join(projectPath, 'cache/thumbnails', assetUuid);
      try {
        await fs.rm(thumbDir, { recursive: true, force: true });
      } catch (err) {
        console.warn('[AssetRegistry] Could not delete thumbnails:', err);
      }
    }
    
    // Entferne aus Index
    delete index.assets[assetUuid];
    
    await saveIndex(projectPath, index);
    
    return { success: true };
  } catch (err) {
    console.error('[AssetRegistry] Error removing asset:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Löst Asset-Pfad auf
 */
async function resolveAssetPath(projectPath, assetUuid, useProxy = false) {
  try {
    const index = await loadIndex(projectPath);
    
    if (!index.assets[assetUuid]) {
      return {
        success: false,
        error: 'Asset nicht gefunden'
      };
    }
    
    const asset = index.assets[assetUuid];
    
    // Verwende Proxy wenn verfügbar und gewünscht
    if (useProxy && asset.proxy_available && asset.proxy_path) {
      const proxyPath = path.join(projectPath, asset.proxy_path);
      return {
        success: true,
        path: proxyPath,
        isProxy: true,
        metadata: asset
      };
    }
    
    // Verwende Original
    let assetPath;
    if (asset.storage === 'internal') {
      assetPath = path.join(projectPath, asset.local_path);
    } else if (asset.storage === 'external') {
      assetPath = asset.original_path;
    } else {
      return {
        success: false,
        error: 'Asset ist nur als Proxy verfügbar'
      };
    }
    
    // Prüfe ob Datei existiert
    try {
      await fs.access(assetPath);
    } catch (err) {
      return {
        success: false,
        error: 'Asset-Datei nicht gefunden (offline)',
        offline: true
      };
    }
    
    return {
      success: true,
      path: assetPath,
      isProxy: false,
      metadata: asset
    };
  } catch (err) {
    console.error('[AssetRegistry] Error resolving asset path:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Listet alle Assets
 */
async function listAssets(projectPath, filter = {}) {
  try {
    const index = await loadIndex(projectPath);
    let assets = Object.values(index.assets);
    
    // Filter nach Typ
    if (filter.type) {
      assets = assets.filter(a => a.type === filter.type);
    }
    
    // Filter nach Storage
    if (filter.storage) {
      assets = assets.filter(a => a.storage === filter.storage);
    }
    
    // Filter nach Proxy-Verfügbarkeit
    if (filter.proxyAvailable !== undefined) {
      assets = assets.filter(a => a.proxy_available === filter.proxyAvailable);
    }
    
    return {
      success: true,
      assets
    };
  } catch (err) {
    console.error('[AssetRegistry] Error listing assets:', err);
    return {
      success: false,
      error: err.message,
      assets: []
    };
  }
}

/**
 * Verlinkt externe Medien (ohne Kopie)
 */
async function linkExternalMedia(projectPath, externalPath, additionalMetadata = {}) {
  return importAsset(projectPath, externalPath, 'link', additionalMetadata);
}

/**
 * Findet Offline-Assets (nicht erreichbare Dateien)
 */
async function findOfflineAssets(projectPath) {
  try {
    const index = await loadIndex(projectPath);
    const offlineAssets = [];
    
    for (const [uuid, asset] of Object.entries(index.assets)) {
      let assetPath;
      
      if (asset.storage === 'internal') {
        assetPath = path.join(projectPath, asset.local_path);
      } else if (asset.storage === 'external') {
        assetPath = asset.original_path;
      } else {
        continue; // Proxy-only Assets überspringen
      }
      
      try {
        await fs.access(assetPath);
      } catch (err) {
        offlineAssets.push({
          uuid,
          ...asset
        });
      }
    }
    
    return {
      success: true,
      offlineAssets
    };
  } catch (err) {
    console.error('[AssetRegistry] Error finding offline assets:', err);
    return {
      success: false,
      error: err.message,
      offlineAssets: []
    };
  }
}

module.exports = {
  importAsset,
  updateAsset,
  removeAsset,
  resolveAssetPath,
  listAssets,
  linkExternalMedia,
  findOfflineAssets,
  loadIndex,
  saveIndex
};
