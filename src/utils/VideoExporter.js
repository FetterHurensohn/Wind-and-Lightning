/**
 * VideoExporter.js - Browser-basierter Video-Export
 * 
 * Verwendet Canvas und MediaRecorder API um echte Videos zu erstellen
 */

export class VideoExporter {
  constructor(config) {
    this.width = config.width || 1920;
    this.height = config.height || 1080;
    this.fps = config.fps || 30;
    this.duration = config.duration || 10;
    this.tracks = config.tracks || [];
    this.media = config.media || [];
    this.quality = config.quality || 0.8;
    this.onProgress = config.onProgress || (() => {});
    
    this.canvas = null;
    this.ctx = null;
    this.mediaRecorder = null;
    this.chunks = [];
  }

  async export() {
    // Erstelle Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d');

    // Lade alle Media-Assets
    this.onProgress({ phase: 'Medien werden geladen...', progress: 5 });
    const loadedMedia = await this.loadAllMedia();
    
    // Starte Recording
    this.onProgress({ phase: 'Video wird aufgenommen...', progress: 10 });
    
    return new Promise((resolve, reject) => {
      try {
        // Erstelle MediaRecorder mit Canvas Stream
        const stream = this.canvas.captureStream(this.fps);
        
        // Versuche verschiedene Codecs
        const mimeTypes = [
          'video/webm;codecs=vp9',
          'video/webm;codecs=vp8',
          'video/webm',
          'video/mp4'
        ];
        
        let selectedMimeType = 'video/webm';
        for (const mimeType of mimeTypes) {
          if (MediaRecorder.isTypeSupported(mimeType)) {
            selectedMimeType = mimeType;
            break;
          }
        }
        
        this.mediaRecorder = new MediaRecorder(stream, {
          mimeType: selectedMimeType,
          videoBitsPerSecond: 5000000 // 5 Mbps
        });
        
        this.chunks = [];
        
        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            this.chunks.push(e.data);
          }
        };
        
        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.chunks, { type: selectedMimeType });
          resolve(blob);
        };
        
        this.mediaRecorder.onerror = (e) => {
          reject(new Error('MediaRecorder error: ' + e.error));
        };
        
        // Starte Recording
        this.mediaRecorder.start(100); // Chunk alle 100ms
        
        // Rendere Frames
        this.renderFrames(loadedMedia).then(() => {
          this.mediaRecorder.stop();
        }).catch(reject);
        
      } catch (error) {
        reject(error);
      }
    });
  }

  async loadAllMedia() {
    const loadedMedia = new Map();
    
    for (const track of this.tracks) {
      for (const clip of (track.clips || [])) {
        if (clip.mediaId && !loadedMedia.has(clip.mediaId)) {
          const mediaItem = this.media.find(m => m.id === clip.mediaId);
          if (mediaItem) {
            try {
              if (mediaItem.type === 'video') {
                const video = document.createElement('video');
                video.src = mediaItem.url;
                video.crossOrigin = 'anonymous';
                video.muted = true;
                await new Promise((resolve, reject) => {
                  video.onloadeddata = resolve;
                  video.onerror = reject;
                  video.load();
                });
                loadedMedia.set(clip.mediaId, { type: 'video', element: video });
              } else if (mediaItem.type === 'image') {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = mediaItem.url;
                await new Promise((resolve, reject) => {
                  img.onload = resolve;
                  img.onerror = reject;
                });
                loadedMedia.set(clip.mediaId, { type: 'image', element: img });
              }
            } catch (e) {
              console.warn('Could not load media:', mediaItem.id, e);
            }
          }
        }
      }
    }
    
    return loadedMedia;
  }

  async renderFrames(loadedMedia) {
    const totalFrames = Math.ceil(this.duration * this.fps);
    const frameDuration = 1000 / this.fps;
    
    for (let frame = 0; frame < totalFrames; frame++) {
      const currentTime = frame / this.fps;
      
      // Update Progress
      const progress = 10 + (frame / totalFrames) * 85;
      this.onProgress({ 
        phase: `Frame ${frame + 1}/${totalFrames} wird gerendert...`, 
        progress 
      });
      
      // Rendere Frame
      this.renderFrame(currentTime, loadedMedia);
      
      // Warte auf nächsten Frame
      await new Promise(resolve => setTimeout(resolve, frameDuration / 2));
    }
    
    this.onProgress({ phase: 'Finalisierung...', progress: 95 });
    
    // Warte kurz für letzten Frame
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  renderFrame(currentTime, loadedMedia) {
    // Schwarzer Hintergrund
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Rendere Tracks von unten nach oben (niedrigster Index zuerst)
    const sortedTracks = [...this.tracks].reverse();
    
    for (const track of sortedTracks) {
      if (track.hidden) continue;
      if (track.type === 'audio') continue; // Audio-Tracks nicht rendern
      
      for (const clip of (track.clips || [])) {
        const clipStart = clip.start || 0;
        const clipEnd = clipStart + (clip.duration || 5);
        
        if (currentTime >= clipStart && currentTime < clipEnd) {
          this.renderClip(clip, currentTime - clipStart, loadedMedia);
        }
      }
    }
  }

  renderClip(clip, clipTime, loadedMedia) {
    const props = clip.props || {};
    
    // Transformationen
    const opacity = (props.opacity ?? 100) / 100;
    const scale = (props.scale ?? 100) / 100;
    const rotation = props.rotation ?? 0;
    const posX = props.posX ?? 0;
    const posY = props.posY ?? 0;
    
    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.translate(this.width / 2 + posX, this.height / 2 + posY);
    this.ctx.rotate((rotation * Math.PI) / 180);
    this.ctx.scale(scale, scale);
    
    if (clip.type === 'video' || clip.type === 'image') {
      const media = loadedMedia.get(clip.mediaId);
      if (media) {
        if (media.type === 'video') {
          const video = media.element;
          video.currentTime = clipTime;
          
          // Berechne Skalierung um Canvas zu füllen
          const videoAspect = video.videoWidth / video.videoHeight;
          const canvasAspect = this.width / this.height;
          
          let drawWidth, drawHeight;
          if (videoAspect > canvasAspect) {
            drawHeight = this.height;
            drawWidth = drawHeight * videoAspect;
          } else {
            drawWidth = this.width;
            drawHeight = drawWidth / videoAspect;
          }
          
          this.ctx.drawImage(video, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        } else if (media.type === 'image') {
          const img = media.element;
          const imgAspect = img.width / img.height;
          const canvasAspect = this.width / this.height;
          
          let drawWidth, drawHeight;
          if (imgAspect > canvasAspect) {
            drawHeight = this.height;
            drawWidth = drawHeight * imgAspect;
          } else {
            drawWidth = this.width;
            drawHeight = drawWidth / imgAspect;
          }
          
          this.ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        }
      }
    } else if (clip.type === 'text') {
      // Text rendern
      const fontSize = props.fontSize || 48;
      const fontWeight = props.fontWeight || 'bold';
      const color = props.color || '#ffffff';
      const text = props.text || clip.title || 'Text';
      
      this.ctx.font = `${fontWeight} ${fontSize}px Arial, sans-serif`;
      this.ctx.fillStyle = color;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      
      // Text-Schatten für bessere Lesbarkeit
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      this.ctx.shadowBlur = 4;
      this.ctx.shadowOffsetX = 2;
      this.ctx.shadowOffsetY = 2;
      
      this.ctx.fillText(text, 0, 0);
    } else if (clip.type === 'sticker') {
      // Sticker/Emoji rendern
      const fontSize = props.fontSize || 64;
      const emoji = props.emoji || props.text || '⭐';
      
      this.ctx.font = `${fontSize}px Arial, sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(emoji, 0, 0);
    } else {
      // Platzhalter für unbekannte Clip-Typen
      this.ctx.fillStyle = '#333333';
      this.ctx.fillRect(-200, -100, 400, 200);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '24px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(clip.title || 'Clip', 0, 0);
    }
    
    this.ctx.restore();
  }
}

export default VideoExporter;
