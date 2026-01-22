/**
 * ServerExportService.js - Server-seitiger Video-Export via FFmpeg
 * 
 * Kommuniziert mit dem FastAPI-Backend für robusteren Export
 * Unterstützt: MP4, MOV, WebM mit verschiedenen Codecs
 */

// API Base URL - verwendet REACT_APP_BACKEND_URL oder Fallback
const getApiBaseUrl = () => {
  // In production, use the environment variable
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Fallback for development
  return window.location.origin;
};

const API_BASE = getApiBaseUrl();

/**
 * Export Status Types
 */
export const ExportStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

/**
 * Export Phases
 */
export const ExportPhase = {
  QUEUED: 'queued',
  PREPARING: 'preparing',
  RENDERING: 'rendering',
  ENCODING: 'encoding',
  FINALIZING: 'finalizing',
  DONE: 'done'
};

/**
 * Resolution Presets
 */
export const ResolutionPresets = {
  '480p': { width: 854, height: 480, label: '480p SD' },
  '720p': { width: 1280, height: 720, label: '720p HD' },
  '1080p': { width: 1920, height: 1080, label: '1080p Full HD' },
  '1440p': { width: 2560, height: 1440, label: '1440p 2K' },
  '4k': { width: 3840, height: 2160, label: '4K Ultra HD' }
};

/**
 * Codec Options
 */
export const CodecOptions = {
  h264: { label: 'H.264 (Standard)', description: 'Beste Kompatibilität' },
  h265: { label: 'H.265 (HEVC)', description: 'Bessere Kompression' },
  vp9: { label: 'VP9', description: 'Für WebM' }
};

/**
 * Format Options
 */
export const FormatOptions = {
  mp4: { label: 'MP4', extension: '.mp4', mime: 'video/mp4' },
  mov: { label: 'MOV', extension: '.mov', mime: 'video/quicktime' },
  webm: { label: 'WebM', extension: '.webm', mime: 'video/webm' }
};

/**
 * Check if server export is available
 */
export async function checkServerExportAvailable() {
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    if (response.ok) {
      const data = await response.json();
      return data.ffmpeg_available === true;
    }
    return false;
  } catch (error) {
    console.log('[ServerExport] Server not available:', error.message);
    return false;
  }
}

/**
 * Upload a media file for export
 */
export async function uploadMediaFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE}/api/export/upload`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Upload fehlgeschlagen');
  }
  
  return response.json();
}

/**
 * Start a server-side export job
 * 
 * @param {Object} params - Export parameters
 * @param {string} params.projectId - Project ID
 * @param {Array} params.tracks - Timeline tracks with clips
 * @param {Object} params.settings - Export settings
 * @param {Object} params.mediaFiles - Map of mediaId to file paths
 */
export async function startServerExport({ projectId, tracks, settings, mediaFiles = {} }) {
  const response = await fetch(`${API_BASE}/api/export/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      projectId,
      tracks,
      settings,
      mediaFiles
    })
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Export konnte nicht gestartet werden');
  }
  
  return response.json();
}

/**
 * Get export job status
 */
export async function getExportStatus(jobId) {
  const response = await fetch(`${API_BASE}/api/export/status/${jobId}`);
  
  if (!response.ok) {
    throw new Error('Status konnte nicht abgerufen werden');
  }
  
  return response.json();
}

/**
 * Poll export status until complete or failed
 * 
 * @param {string} jobId - Job ID
 * @param {Function} onProgress - Progress callback (status, progress, phase)
 * @param {number} interval - Polling interval in ms
 */
export async function pollExportStatus(jobId, onProgress, interval = 1000) {
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const status = await getExportStatus(jobId);
        
        onProgress?.(status.status, status.progress, status.phase);
        
        if (status.status === ExportStatus.COMPLETED) {
          resolve(status);
          return;
        }
        
        if (status.status === ExportStatus.FAILED) {
          reject(new Error(status.error || 'Export fehlgeschlagen'));
          return;
        }
        
        // Continue polling
        setTimeout(poll, interval);
      } catch (error) {
        reject(error);
      }
    };
    
    poll();
  });
}

/**
 * Download exported video
 */
export async function downloadExport(jobId, filename) {
  const response = await fetch(`${API_BASE}/api/export/download/${jobId}`);
  
  if (!response.ok) {
    throw new Error('Download fehlgeschlagen');
  }
  
  const blob = await response.blob();
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `export_${jobId.slice(0, 8)}.mp4`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  return true;
}

/**
 * Delete export job and files
 */
export async function deleteExport(jobId) {
  const response = await fetch(`${API_BASE}/api/export/${jobId}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error('Löschen fehlgeschlagen');
  }
  
  return response.json();
}

/**
 * Start a demo export (creates a simple test video)
 */
export async function startDemoExport() {
  const response = await fetch(`${API_BASE}/api/export/demo`, {
    method: 'POST'
  });
  
  if (!response.ok) {
    throw new Error('Demo-Export konnte nicht gestartet werden');
  }
  
  return response.json();
}

/**
 * Calculate estimated file size
 */
export function estimateFileSize(settings) {
  const { resolution, fps, duration, quality, format } = settings;
  const { width, height } = ResolutionPresets[resolution] || ResolutionPresets['1080p'];
  
  // Base bitrate calculation (rough estimate)
  const pixels = width * height;
  const basebitrate = pixels * fps * 0.1; // bits per second
  
  // Quality factor (1-100 maps to 0.2-1.0 of base bitrate)
  const qualityFactor = 0.2 + (quality / 100) * 0.8;
  
  // Codec efficiency
  const codecFactor = {
    h264: 1.0,
    h265: 0.6,
    vp9: 0.65
  }[settings.codec] || 1.0;
  
  // Calculate size in MB
  const bitrate = basebitrate * qualityFactor * codecFactor;
  const sizeBytes = (bitrate * duration) / 8;
  const sizeMB = sizeBytes / (1024 * 1024);
  
  return Math.round(sizeMB * 10) / 10;
}

/**
 * Get phase label in German
 */
export function getPhaseLabel(phase) {
  const labels = {
    queued: 'Warteschlange',
    preparing: 'Vorbereitung',
    rendering: 'Frames rendern',
    encoding: 'Video kodieren',
    finalizing: 'Finalisierung',
    done: 'Abgeschlossen'
  };
  return labels[phase] || phase;
}

export default {
  checkServerExportAvailable,
  uploadMediaFile,
  startServerExport,
  getExportStatus,
  pollExportStatus,
  downloadExport,
  deleteExport,
  startDemoExport,
  estimateFileSize,
  getPhaseLabel,
  ExportStatus,
  ExportPhase,
  ResolutionPresets,
  CodecOptions,
  FormatOptions
};
