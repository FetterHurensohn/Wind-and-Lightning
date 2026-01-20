// Performance optimization utilities

export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  startMeasure(name: string) {
    performance.mark(`${name}-start`);
  }

  endMeasure(name: string) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name)[0];
    if (measure) {
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      this.metrics.get(name)!.push(measure.duration);
    }
  }

  getAverageDuration(name: string): number {
    const durations = this.metrics.get(name);
    if (!durations || durations.length === 0) return 0;
    
    const sum = durations.reduce((a, b) => a + b, 0);
    return sum / durations.length;
  }

  clearMetrics() {
    this.metrics.clear();
    performance.clearMarks();
    performance.clearMeasures();
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Frame cache for video preview
export class FrameCache {
  private cache: Map<string, ImageData> = new Map();
  private maxSize: number;
  private lruQueue: string[] = [];

  constructor(maxSizeMB: number = 100) {
    // Approximate: 1920x1080 RGBA = ~8MB per frame
    this.maxSize = maxSizeMB * 1024 * 1024;
  }

  getCacheKey(clipId: string, timestamp: number): string {
    return `${clipId}:${timestamp.toFixed(3)}`;
  }

  get(clipId: string, timestamp: number): ImageData | null {
    const key = this.getCacheKey(clipId, timestamp);
    const frame = this.cache.get(key);
    
    if (frame) {
      // Move to end of LRU queue
      const index = this.lruQueue.indexOf(key);
      if (index > -1) {
        this.lruQueue.splice(index, 1);
        this.lruQueue.push(key);
      }
    }
    
    return frame || null;
  }

  set(clipId: string, timestamp: number, frame: ImageData) {
    const key = this.getCacheKey(clipId, timestamp);
    
    // Estimate size: width * height * 4 bytes (RGBA)
    const frameSize = frame.width * frame.height * 4;
    
    // Remove old frames if cache is full
    while (this.getCurrentSize() + frameSize > this.maxSize && this.lruQueue.length > 0) {
      const oldestKey = this.lruQueue.shift();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    this.cache.set(key, frame);
    this.lruQueue.push(key);
  }

  private getCurrentSize(): number {
    let size = 0;
    this.cache.forEach((frame) => {
      size += frame.width * frame.height * 4;
    });
    return size;
  }

  clear() {
    this.cache.clear();
    this.lruQueue = [];
  }

  getSizeInfo() {
    return {
      currentSize: this.getCurrentSize(),
      maxSize: this.maxSize,
      frameCount: this.cache.size,
      utilizationPercent: (this.getCurrentSize() / this.maxSize) * 100,
    };
  }
}

export const frameCache = new FrameCache(100);

// Proxy file generator
export class ProxyManager {
  static async generateProxy(
    filePath: string,
    resolution: 'quarter' | 'half'
  ): Promise<string> {
    // This would use FFmpeg to create a lower resolution proxy file
    const scale = resolution === 'quarter' ? 0.25 : 0.5;
    const proxyPath = filePath.replace(/\.[^.]+$/, `_proxy_${resolution}$&`);
    
    // Check if proxy already exists
    const stats = await window.electronAPI.getFileStats(proxyPath);
    if (stats.success) {
      return proxyPath;
    }
    
    // Generate proxy using FFmpeg
    // This would be implemented via IPC to the main process
    console.log(`Generating proxy for ${filePath} at ${scale}x resolution`);
    
    return proxyPath;
  }

  static getProxyPath(filePath: string, resolution: 'quarter' | 'half'): string {
    return filePath.replace(/\.[^.]+$/, `_proxy_${resolution}$&`);
  }
}

// Memory monitoring
export class MemoryMonitor {
  checkMemoryUsage(): {[key: string]: number} | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize / 1048576, // MB
        totalJSHeapSize: memory.totalJSHeapSize / 1048576, // MB
        jsHeapSizeLimit: memory.jsHeapSizeLimit / 1048576, // MB
      };
    }
    return null;
  }

  getMemoryWarningLevel(): 'safe' | 'warning' | 'critical' {
    const memory = this.checkMemoryUsage();
    if (!memory) return 'safe';
    
    const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    
    if (usagePercent > 90) return 'critical';
    if (usagePercent > 75) return 'warning';
    return 'safe';
  }
}

export const memoryMonitor = new MemoryMonitor();
