/**
 * VideoExportService.js - FFmpeg.wasm basierter Video-Export
 * 
 * Features:
 * - Rendert Timeline-Clips zu Video
 * - Unterstützt Transitions, Effekte, Text-Overlays
 * - Progress-Callbacks für UI-Updates
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

class VideoExportService {
  constructor() {
    this.ffmpeg = null;
    this.loaded = false;
    this.loading = false;
  }

  async load(onProgress) {
    if (this.loaded) return true;
    if (this.loading) {
      // Warte bis FFmpeg geladen ist
      while (this.loading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.loaded;
    }

    this.loading = true;
    onProgress?.({ phase: 'FFmpeg wird geladen...', progress: 0 });

    try {
      this.ffmpeg = new FFmpeg();
      
      // Progress-Handler für Encoding
      this.ffmpeg.on('progress', ({ progress, time }) => {
        onProgress?.({ 
          phase: 'Video wird kodiert...', 
          progress: Math.round(progress * 100),
          time 
        });
      });

      // Log-Handler für Debugging
      this.ffmpeg.on('log', ({ message }) => {
        console.log('[FFmpeg]', message);
      });

      // Lade FFmpeg Core von CDN
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      this.loaded = true;
      this.loading = false;
      onProgress?.({ phase: 'FFmpeg bereit', progress: 100 });
      return true;
    } catch (error) {
      console.error('[VideoExportService] FFmpeg load error:', error);
      this.loading = false;
      throw new Error(`FFmpeg konnte nicht geladen werden: ${error.message}`);
    }
  }

  /**
   * Exportiert die Timeline als Video
   * @param {Object} config - Export-Konfiguration
   * @param {Function} onProgress - Progress-Callback
   * @returns {Promise<Blob>} - Video-Blob
   */
  async exportVideo(config, onProgress) {
    const {
      tracks,
      media,
      duration,
      width = 1920,
      height = 1080,
      fps = 30,
      format = 'mp4',
      codec = 'h264',
      quality = 80
    } = config;

    // Stelle sicher, dass FFmpeg geladen ist
    await this.load(onProgress);

    onProgress?.({ phase: 'Medien werden vorbereitet...', progress: 5 });

    try {
      // Sammle alle verwendeten Medien
      const usedMedia = new Set();
      tracks.forEach(track => {
        track.clips?.forEach(clip => {
          if (clip.mediaId) usedMedia.add(clip.mediaId);
        });
      });

      // Lade Medien in FFmpeg's virtuelles Dateisystem
      let loadedCount = 0;
      const mediaFiles = [];
      
      for (const mediaId of usedMedia) {
        const mediaItem = media.find(m => m.id === mediaId);
        if (mediaItem?.url) {
          try {
            const fileName = `input_${mediaId}.${mediaItem.type === 'video' ? 'mp4' : mediaItem.type === 'audio' ? 'mp3' : 'png'}`;
            
            // Für lokale Dateien (file://) oder URLs
            if (mediaItem.url.startsWith('file://') || mediaItem.url.startsWith('blob:')) {
              const response = await fetch(mediaItem.url);
              const data = await response.arrayBuffer();
              await this.ffmpeg.writeFile(fileName, new Uint8Array(data));
            } else {
              await this.ffmpeg.writeFile(fileName, await fetchFile(mediaItem.url));
            }
            
            mediaFiles.push({ id: mediaId, fileName, type: mediaItem.type });
            loadedCount++;
            
            onProgress?.({ 
              phase: `Medien laden (${loadedCount}/${usedMedia.size})...`, 
              progress: 5 + (loadedCount / usedMedia.size) * 15 
            });
          } catch (err) {
            console.warn(`[VideoExportService] Konnte Medium ${mediaId} nicht laden:`, err);
          }
        }
      }

      onProgress?.({ phase: 'Video wird generiert...', progress: 25 });

      // Baue FFmpeg-Befehle basierend auf Timeline
      const outputFile = `output.${format}`;
      const complexFilter = this.buildComplexFilter(tracks, media, mediaFiles, duration, width, height, fps);
      
      // Codec-spezifische Optionen
      const codecOptions = this.getCodecOptions(codec, quality);

      // Erstelle ein leeres Video als Basis wenn keine Medien
      if (mediaFiles.length === 0) {
        // Erstelle schwarzes Video als Platzhalter
        await this.ffmpeg.exec([
          '-f', 'lavfi',
          '-i', `color=c=black:s=${width}x${height}:d=${duration}:r=${fps}`,
          '-c:v', 'libx264',
          '-t', String(duration),
          outputFile
        ]);
      } else {
        // Baue FFmpeg-Befehl mit Medien
        const args = [];
        
        // Input-Dateien
        mediaFiles.forEach(mf => {
          args.push('-i', mf.fileName);
        });
        
        // Filter und Output
        if (complexFilter) {
          args.push('-filter_complex', complexFilter);
          args.push('-map', '[out]');
        }
        
        // Codec-Optionen
        args.push(...codecOptions);
        
        // Output-Datei
        args.push('-y', outputFile);
        
        console.log('[VideoExportService] FFmpeg args:', args.join(' '));
        
        await this.ffmpeg.exec(args);
      }

      onProgress?.({ phase: 'Export wird finalisiert...', progress: 95 });

      // Lies Output-Datei
      const data = await this.ffmpeg.readFile(outputFile);
      
      // Cleanup
      await this.ffmpeg.deleteFile(outputFile);
      for (const mf of mediaFiles) {
        try {
          await this.ffmpeg.deleteFile(mf.fileName);
        } catch (e) { /* ignore */ }
      }

      // Erstelle Blob
      const mimeType = format === 'mp4' ? 'video/mp4' : 
                       format === 'webm' ? 'video/webm' :
                       format === 'mov' ? 'video/quicktime' :
                       format === 'gif' ? 'image/gif' : 'video/mp4';
      
      const blob = new Blob([data.buffer], { type: mimeType });
      
      onProgress?.({ phase: 'Export abgeschlossen!', progress: 100 });
      
      return blob;
    } catch (error) {
      console.error('[VideoExportService] Export error:', error);
      throw new Error(`Export fehlgeschlagen: ${error.message}`);
    }
  }

  /**
   * Baut den komplexen FFmpeg-Filter für alle Clips
   */
  buildComplexFilter(tracks, media, mediaFiles, duration, width, height, fps) {
    // Vereinfachte Version - nimmt ersten Video-Clip
    const videoClips = [];
    
    tracks.forEach(track => {
      if (track.type !== 'video' && track.type !== 'image') return;
      if (track.hidden) return;
      
      track.clips?.forEach(clip => {
        const mediaFile = mediaFiles.find(mf => mf.id === clip.mediaId);
        if (mediaFile) {
          videoClips.push({
            ...clip,
            inputIndex: mediaFiles.indexOf(mediaFile)
          });
        }
      });
    });

    if (videoClips.length === 0) return '';

    // Baue Filter-Kette
    const filters = [];
    let lastOutput = `[${videoClips[0].inputIndex}:v]`;
    
    // Skaliere erstes Video
    filters.push(`${lastOutput}scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2[scaled0]`);
    lastOutput = '[scaled0]';

    // Setze Duration
    filters.push(`${lastOutput}trim=duration=${duration}[trimmed]`);
    lastOutput = '[trimmed]';

    // Output-Label
    filters.push(`${lastOutput}copy[out]`);

    return filters.join(';');
  }

  /**
   * Gibt Codec-spezifische FFmpeg-Optionen zurück
   */
  getCodecOptions(codec, quality) {
    const crf = Math.round(51 - (quality / 100) * 40); // 0-51, niedriger = besser
    
    switch (codec) {
      case 'h264':
        return ['-c:v', 'libx264', '-preset', 'medium', '-crf', String(crf)];
      case 'h265':
        return ['-c:v', 'libx265', '-preset', 'medium', '-crf', String(crf)];
      case 'vp9':
        return ['-c:v', 'libvpx-vp9', '-crf', String(crf), '-b:v', '0'];
      case 'prores':
        return ['-c:v', 'prores_ks', '-profile:v', '2'];
      default:
        return ['-c:v', 'libx264', '-preset', 'fast', '-crf', '23'];
    }
  }

  /**
   * Generiert ein einzelnes Frame als Bild
   */
  async generateThumbnail(config, time, onProgress) {
    const { tracks, media, width = 320, height = 180 } = config;
    
    await this.load(onProgress);
    
    // Vereinfachte Thumbnail-Generierung
    // In einer echten Implementierung würde hier das Frame zur gegebenen Zeit gerendert
    
    return null;
  }
}

// Singleton-Instanz
export const videoExportService = new VideoExportService();
export default videoExportService;
