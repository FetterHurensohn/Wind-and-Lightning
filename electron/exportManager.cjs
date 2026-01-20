/**
 * exportManager.cjs
 * 
 * Export Manager - Video Export mit FFmpeg
 * Handles timeline export, rendering, progress tracking
 */

const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;

const timelineManager = require('./timelineManager.cjs');
const assetRegistry = require('./assetRegistry.cjs');

/**
 * Exportiert Timeline als Video
 * 
 * @param {string} projectPath - Projektpfad
 * @param {string} outputPath - Ausgabe-Pfad
 * @param {object} options - Export-Optionen
 * @returns {Promise<{success: boolean, path?: string, error?: string}>}
 */
async function exportTimeline(projectPath, outputPath, options = {}) {
  console.log('[ExportManager] Starting export...');
  console.log('[ExportManager] Project:', projectPath);
  console.log('[ExportManager] Output:', outputPath);
  console.log('[ExportManager] Options:', options);
  
  try {
    // 1. Lade Timeline
    const timelineResult = await timelineManager.loadTimeline(projectPath);
    
    if (!timelineResult.success) {
      return {
        success: false,
        error: 'Timeline konnte nicht geladen werden'
      };
    }
    
    const timeline = timelineResult.timeline;
    
    // 2. Sammle alle Video/Audio-Clips
    const videoClips = [];
    const audioClips = [];
    
    for (const track of timeline.tracks) {
      for (const clip of track.clips || []) {
        const assetResult = await assetRegistry.resolveAssetPath(
          projectPath, 
          clip.asset_uuid, 
          true // useProxy
        );
        
        if (assetResult.success) {
          const clipData = {
            path: assetResult.path,
            start: clip.start,
            duration: clip.duration,
            inPoint: clip.inPoint || 0,
            trackType: track.type
          };
          
          if (track.type === 'video') {
            videoClips.push(clipData);
          } else if (track.type === 'audio') {
            audioClips.push(clipData);
          }
        }
      }
    }
    
    console.log(`[ExportManager] Found ${videoClips.length} video clips, ${audioClips.length} audio clips`);
    
    // 3. Erstelle FFmpeg-Befehl
    const command = ffmpeg();
    
    // Default-Optionen
    const exportOptions = {
      resolution: options.resolution || '1920x1080',
      fps: options.fps || 30,
      videoCodec: options.videoCodec || 'libx264',
      audioCodec: options.audioCodec || 'aac',
      bitrate: options.bitrate || '5000k',
      audioBitrate: options.audioBitrate || '192k',
      preset: options.preset || 'medium',
      crf: options.crf || 23
    };
    
    // 4. Füge Video-Inputs hinzu
    for (const clip of videoClips) {
      command.input(clip.path)
        .inputOptions([
          `-ss ${clip.inPoint}`,
          `-t ${clip.duration}`
        ]);
    }
    
    // 5. Füge Audio-Inputs hinzu
    for (const clip of audioClips) {
      command.input(clip.path)
        .inputOptions([
          `-ss ${clip.inPoint}`,
          `-t ${clip.duration}`
        ]);
    }
    
    // 6. Output-Optionen
    command
      .output(outputPath)
      .videoCodec(exportOptions.videoCodec)
      .audioCodec(exportOptions.audioCodec)
      .size(exportOptions.resolution)
      .fps(exportOptions.fps)
      .videoBitrate(exportOptions.bitrate)
      .audioBitrate(exportOptions.audioBitrate)
      .outputOptions([
        `-preset ${exportOptions.preset}`,
        `-crf ${exportOptions.crf}`,
        '-movflags +faststart' // Für Web-Streaming
      ]);
    
    // 7. Führe Export aus
    return new Promise((resolve, reject) => {
      command
        .on('start', (commandLine) => {
          console.log('[ExportManager] FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          console.log(`[ExportManager] Progress: ${progress.percent}%`);
          // TODO: Sende Progress-Event an Frontend
        })
        .on('end', () => {
          console.log('[ExportManager] Export completed successfully');
          resolve({
            success: true,
            path: outputPath
          });
        })
        .on('error', (err, stdout, stderr) => {
          console.error('[ExportManager] Export error:', err);
          console.error('[ExportManager] FFmpeg stderr:', stderr);
          reject({
            success: false,
            error: err.message
          });
        })
        .run();
    });
    
  } catch (err) {
    console.error('[ExportManager] Error:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Exportiert Timeline als Audio-Only
 */
async function exportAudio(projectPath, outputPath, options = {}) {
  console.log('[ExportManager] Exporting audio only...');
  
  try {
    const timelineResult = await timelineManager.loadTimeline(projectPath);
    
    if (!timelineResult.success) {
      return {
        success: false,
        error: 'Timeline konnte nicht geladen werden'
      };
    }
    
    const timeline = timelineResult.timeline;
    const command = ffmpeg();
    
    // Sammle Audio-Clips
    for (const track of timeline.tracks) {
      if (track.type !== 'audio') continue;
      
      for (const clip of track.clips || []) {
        const assetResult = await assetRegistry.resolveAssetPath(
          projectPath, 
          clip.asset_uuid
        );
        
        if (assetResult.success) {
          command.input(assetResult.path)
            .inputOptions([
              `-ss ${clip.inPoint || 0}`,
              `-t ${clip.duration}`
            ]);
        }
      }
    }
    
    // Output-Optionen
    command
      .output(outputPath)
      .audioCodec(options.audioCodec || 'aac')
      .audioBitrate(options.audioBitrate || '192k')
      .noVideo();
    
    return new Promise((resolve, reject) => {
      command
        .on('end', () => resolve({ success: true, path: outputPath }))
        .on('error', (err) => reject({ success: false, error: err.message }))
        .run();
    });
    
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Generiert Vorschau-Video (niedrigere Qualität, schneller)
 */
async function exportPreview(projectPath, outputPath) {
  return exportTimeline(projectPath, outputPath, {
    resolution: '1280x720',
    fps: 30,
    preset: 'ultrafast',
    crf: 28,
    bitrate: '2000k'
  });
}

module.exports = {
  exportTimeline,
  exportAudio,
  exportPreview
};
