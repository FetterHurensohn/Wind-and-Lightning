// Engine utilities for video processing

export interface VideoFrame {
  timestamp: number;
  data: ImageData;
}

export class VideoRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawFrame(video: HTMLVideoElement, effects: any[] = []) {
    this.clear();
    
    // Draw video frame
    this.ctx.save();
    
    // Apply transform effects
    const transformEffect = effects.find((e) => e.type === 'transform');
    if (transformEffect) {
      const { position, scale, rotation, opacity } = transformEffect.parameters;
      
      this.ctx.translate(this.width / 2 + position.x, this.height / 2 + position.y);
      this.ctx.rotate((rotation * Math.PI) / 180);
      this.ctx.scale(scale.x / 100, scale.y / 100);
      this.ctx.globalAlpha = opacity / 100;
      
      this.ctx.drawImage(
        video,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
    } else {
      this.ctx.drawImage(video, 0, 0, this.width, this.height);
    }
    
    this.ctx.restore();

    // Apply other effects
    this.applyEffects(effects);
  }

  private applyEffects(effects: any[]) {
    const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
    const data = imageData.data;

    effects.forEach((effect) => {
      switch (effect.type) {
        case 'brightness':
          this.applyBrightness(data, effect.parameters.brightness);
          break;
        case 'saturation':
          this.applySaturation(data, effect.parameters.saturation);
          break;
        case 'blur':
          // Blur is computationally expensive, better handled by CSS filter
          this.canvas.style.filter = `blur(${effect.parameters.amount}px)`;
          break;
      }
    });

    this.ctx.putImageData(imageData, 0, 0);
  }

  private applyBrightness(data: Uint8ClampedArray, brightness: number) {
    const factor = 1 + brightness / 100;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * factor);
      data[i + 1] = Math.min(255, data[i + 1] * factor);
      data[i + 2] = Math.min(255, data[i + 2] * factor);
    }
  }

  private applySaturation(data: Uint8ClampedArray, saturation: number) {
    const factor = saturation / 100;
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.2989 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = gray + factor * (data[i] - gray);
      data[i + 1] = gray + factor * (data[i + 1] - gray);
      data[i + 2] = gray + factor * (data[i + 2] - gray);
    }
  }

  drawText(textData: any) {
    this.ctx.save();
    
    this.ctx.font = `${textData.bold ? 'bold ' : ''}${textData.italic ? 'italic ' : ''}${
      textData.fontSize
    }px ${textData.fontFamily}`;
    this.ctx.fillStyle = textData.color;
    this.ctx.textAlign = textData.align;
    this.ctx.textBaseline = 'middle';

    if (textData.strokeWidth > 0) {
      this.ctx.strokeStyle = textData.strokeColor;
      this.ctx.lineWidth = textData.strokeWidth;
      this.ctx.strokeText(textData.text, textData.position.x, textData.position.y);
    }

    this.ctx.fillText(textData.text, textData.position.x, textData.position.y);
    
    this.ctx.restore();
  }
}

export class TimelineEngine {
  private clips: any[];
  private currentTime: number;

  constructor() {
    this.clips = [];
    this.currentTime = 0;
  }

  setClips(clips: any[]) {
    this.clips = clips;
  }

  setCurrentTime(time: number) {
    this.currentTime = time;
  }

  getActiveClips(): any[] {
    return this.clips.filter((clip) => {
      const start = clip.startTime;
      const end = clip.startTime + clip.duration;
      return this.currentTime >= start && this.currentTime < end;
    });
  }

  getClipAtTime(time: number, trackId?: string): any | null {
    return (
      this.clips.find((clip) => {
        const start = clip.startTime;
        const end = clip.startTime + clip.duration;
        const timeMatch = time >= start && time < end;
        const trackMatch = !trackId || clip.trackId === trackId;
        return timeMatch && trackMatch;
      }) || null
    );
  }
}

export class AudioEngine {
  private audioContext: AudioContext;
  private gainNode: GainNode;

  constructor() {
    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
  }

  setVolume(volume: number) {
    this.gainNode.gain.value = volume / 100;
  }

  async loadAudio(filePath: string): Promise<AudioBuffer> {
    // In electron, we would load the file and decode it
    // For now, this is a placeholder
    const response = await fetch(filePath);
    const arrayBuffer = await response.arrayBuffer();
    return await this.audioContext.decodeAudioData(arrayBuffer);
  }

  playAudio(buffer: AudioBuffer, startTime: number = 0) {
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.gainNode);
    source.start(0, startTime);
    return source;
  }
}
