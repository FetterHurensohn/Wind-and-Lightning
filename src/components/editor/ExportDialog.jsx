/**
 * ExportDialog.jsx - Export Dialog (wie CapCut)
 * 
 * Features:
 * - Auflösungsauswahl (480p, 720p, 1080p, 4K, 8K)
 * - FPS-Auswahl (24, 25, 30, 50, 60)
 * - Format-Auswahl (MP4, MOV, WebM, GIF)
 * - Qualitätseinstellung
 * - Echter Video-Export mit Canvas + MediaRecorder
 * - Vorschau
 */

import React, { useState, useCallback } from 'react';
import Icon from './Icon';
import { VideoExporter } from '../../utils/VideoExporter';

// Resolution Presets
const RESOLUTIONS = [
  { id: '480p', label: '480p', width: 854, height: 480, description: 'SD - Schneller Export' },
  { id: '720p', label: '720p HD', width: 1280, height: 720, description: 'HD - Gut für Social Media' },
  { id: '1080p', label: '1080p Full HD', width: 1920, height: 1080, description: 'Full HD - Standard-Qualität', recommended: true },
  { id: '1440p', label: '1440p 2K', width: 2560, height: 1440, description: '2K - Hohe Qualität' },
  { id: '4k', label: '4K Ultra HD', width: 3840, height: 2160, description: '4K - Beste Qualität', pro: true },
  { id: '8k', label: '8K', width: 7680, height: 4320, description: '8K - Maximale Auflösung', pro: true },
];

// FPS Options
const FPS_OPTIONS = [
  { value: 24, label: '24 fps', description: 'Kino-Look' },
  { value: 25, label: '25 fps', description: 'PAL Standard' },
  { value: 30, label: '30 fps', description: 'NTSC Standard', recommended: true },
  { value: 50, label: '50 fps', description: 'Flüssig (PAL)' },
  { value: 60, label: '60 fps', description: 'Flüssig (NTSC)' },
];

// Format Options
const FORMATS = [
  { id: 'mp4', label: 'MP4', extension: '.mp4', description: 'Beste Kompatibilität', recommended: true },
  { id: 'mov', label: 'MOV', extension: '.mov', description: 'Apple QuickTime' },
  { id: 'webm', label: 'WebM', extension: '.webm', description: 'Web-optimiert' },
  { id: 'gif', label: 'GIF', extension: '.gif', description: 'Animiertes Bild' },
];

// Codec Options
const CODECS = {
  mp4: [
    { id: 'h264', label: 'H.264', description: 'Universell kompatibel', recommended: true },
    { id: 'h265', label: 'H.265 (HEVC)', description: 'Bessere Kompression', pro: true },
  ],
  mov: [
    { id: 'prores', label: 'ProRes 422', description: 'Professionelle Qualität', pro: true },
    { id: 'h264', label: 'H.264', description: 'Kompatibel' },
  ],
  webm: [
    { id: 'vp9', label: 'VP9', description: 'Gute Qualität' },
  ],
  gif: [
    { id: 'gif', label: 'GIF', description: '256 Farben' },
  ],
};

export default function ExportDialog({ 
  project,
  duration,
  tracks = [],
  media = [],
  onExport,
  onClose 
}) {
  const [resolution, setResolution] = useState('1080p');
  const [fps, setFps] = useState(30);
  const [format, setFormat] = useState('mp4');
  const [codec, setCodec] = useState('h264');
  const [quality, setQuality] = useState(80);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportPhase, setExportPhase] = useState('');
  const [exportError, setExportError] = useState(null);
  const [exportComplete, setExportComplete] = useState(false);
  
  const selectedResolution = RESOLUTIONS.find(r => r.id === resolution);
  const availableCodecs = CODECS[format] || [];
  
  // Schätze Dateigröße
  const estimatedSize = useCallback(() => {
    const res = selectedResolution;
    if (!res) return '?';
    
    const pixels = res.width * res.height;
    const bitrateMbps = (quality / 100) * (pixels / 921600) * 8; // Basis: 1080p @ 8Mbps @ 100%
    const sizeGB = (bitrateMbps * duration) / 8 / 1024;
    
    if (sizeGB < 0.001) return `${(sizeGB * 1024 * 1024).toFixed(1)} KB`;
    if (sizeGB < 1) return `${(sizeGB * 1024).toFixed(1)} MB`;
    return `${sizeGB.toFixed(2)} GB`;
  }, [selectedResolution, quality, duration]);
  
  const handleExport = useCallback(async () => {
    setExporting(true);
    setProgress(0);
    setExportError(null);
    setExportPhase('Vorbereitung...');
    
    try {
      // Erstelle Video-Exporter
      const exporter = new VideoExporter({
        width: selectedResolution?.width || 1920,
        height: selectedResolution?.height || 1080,
        fps,
        duration: duration || 10,
        tracks,
        media,
        quality: quality / 100,
        onProgress: ({ phase, progress: p }) => {
          setExportPhase(phase);
          setProgress(p);
        }
      });
      
      // Exportiere Video
      const videoBlob = await exporter.export();
      
      setExportPhase('Download wird gestartet...');
      setProgress(98);
      
      // Download Video
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project?.name || 'video'}_export.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Cleanup nach kurzer Verzögerung
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      setExportPhase('Export abgeschlossen!');
      setProgress(100);
      setExporting(false);
      setExportComplete(true);
      
      onExport?.({
        resolution,
        width: selectedResolution?.width,
        height: selectedResolution?.height,
        fps,
        format: 'webm',
        quality
      });
      
    } catch (error) {
      console.error('Export error:', error);
      setExportError('Export fehlgeschlagen: ' + error.message);
      setExporting(false);
    }
  }, [resolution, selectedResolution, fps, format, codec, quality, project, onExport, tracks, media, duration]);
  
  // Erfolgs-Ansicht
  if (exportComplete) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn">
        <div className="bg-[var(--bg-panel)] rounded-xl w-[500px] overflow-hidden shadow-2xl border border-[var(--border-subtle)] animate-scaleIn">
          {/* Success Header */}
          <div className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Video exportiert!</h2>
            <p className="text-sm text-[var(--text-secondary)]">Dein Video wurde erfolgreich erstellt und heruntergeladen.</p>
          </div>
          
          {/* Downloaded File Info */}
          <div className="px-8 pb-4">
            <div className="bg-[var(--bg-surface)] rounded-lg p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--accent-turquoise)]/20 rounded-lg flex items-center justify-center">
                <Icon name="video" size={24} className="text-[var(--accent-turquoise)]" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-[var(--text-primary)]">{project?.name || 'video'}_export.webm</div>
                <div className="text-xs text-[var(--text-tertiary)]">WebM Video • Soeben heruntergeladen</div>
              </div>
            </div>
          </div>
          
          {/* Export Summary */}
          <div className="px-8 pb-6">
            <div className="text-xs text-[var(--text-tertiary)] mb-2">Export-Details:</div>
            <div className="bg-[var(--bg-surface)] rounded-lg p-4 grid grid-cols-2 gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-tertiary)]">Auflösung:</span>
                <span className="text-[var(--text-primary)]">{selectedResolution?.width}x{selectedResolution?.height}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-tertiary)]">Format:</span>
                <span className="text-[var(--text-primary)]">WebM</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-tertiary)]">Bildrate:</span>
                <span className="text-[var(--text-primary)]">{fps} fps</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-tertiary)]">Qualität:</span>
                <span className="text-[var(--text-primary)]">{quality}%</span>
              </div>
            </div>
          </div>
          
          {/* Tip */}
          <div className="px-8 pb-6">
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div>
                  <div className="text-sm font-medium text-blue-300">Tipp</div>
                  <div className="text-xs text-blue-200/80 mt-1">
                    Das WebM-Format ist kompatibel mit Chrome, Firefox und modernen Video-Playern. 
                    Du kannst es mit kostenlosen Tools wie HandBrake in MP4 konvertieren.
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="h-16 px-6 flex items-center justify-center border-t border-[var(--border-subtle)]">
            <button
              onClick={onClose}
              className="px-8 h-10 rounded-lg bg-[var(--accent-turquoise)] text-white text-sm font-medium hover:opacity-90 transition-all"
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-[var(--bg-panel)] rounded-xl w-[600px] max-h-[90vh] overflow-hidden shadow-2xl border border-[var(--border-subtle)] animate-scaleIn">
        {/* Header */}
        <div className="h-12 px-6 flex items-center justify-between border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <Icon name="export" size={20} className="text-[var(--accent-turquoise)]" />
            <span className="text-base font-medium text-[var(--text-primary)]">Video exportieren</span>
          </div>
          <button
            onClick={onClose}
            disabled={exporting}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Project Info */}
          <div className="flex items-center gap-4 p-4 bg-[var(--bg-surface)] rounded-lg">
            <div className="w-24 h-14 bg-[var(--bg-main)] rounded flex items-center justify-center">
              <Icon name="video" size={24} className="text-[var(--text-tertiary)]" />
            </div>
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)]">{project?.name || 'Mein Projekt'}</div>
              <div className="text-xs text-[var(--text-tertiary)]">
                Dauer: {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')} • 
                Geschätzte Größe: {estimatedSize()}
              </div>
            </div>
          </div>
          
          {/* Resolution */}
          <div>
            <label className="text-sm font-medium text-[var(--text-primary)] mb-3 block">Auflösung</label>
            <div className="grid grid-cols-3 gap-2">
              {RESOLUTIONS.map(res => (
                <button
                  key={res.id}
                  onClick={() => setResolution(res.id)}
                  disabled={res.pro && !project?.isPro}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    resolution === res.id
                      ? 'border-[var(--accent-turquoise)] bg-[var(--accent-turquoise)]/10'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-normal)]'
                  } ${res.pro && !project?.isPro ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${
                      resolution === res.id ? 'text-[var(--accent-turquoise)]' : 'text-[var(--text-primary)]'
                    }`}>
                      {res.label}
                    </span>
                    {res.recommended && (
                      <span className="px-1.5 py-0.5 bg-[var(--accent-turquoise)] text-white text-xs rounded">Empfohlen</span>
                    )}
                    {res.pro && (
                      <span className="px-1.5 py-0.5 bg-[var(--accent-purple)] text-white text-xs rounded">Pro</span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)]">
                    {res.width} × {res.height}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* FPS */}
          <div>
            <label className="text-sm font-medium text-[var(--text-primary)] mb-3 block">Bildrate</label>
            <div className="flex gap-2">
              {FPS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFps(opt.value)}
                  className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-all ${
                    fps === opt.value
                      ? 'border-[var(--accent-turquoise)] bg-[var(--accent-turquoise)]/10 text-[var(--accent-turquoise)]'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-normal)]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Format */}
          <div>
            <label className="text-sm font-medium text-[var(--text-primary)] mb-3 block">Format</label>
            <div className="flex gap-2">
              {FORMATS.map(fmt => (
                <button
                  key={fmt.id}
                  onClick={() => {
                    setFormat(fmt.id);
                    setCodec(CODECS[fmt.id]?.[0]?.id || 'h264');
                  }}
                  className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                    format === fmt.id
                      ? 'border-[var(--accent-turquoise)] bg-[var(--accent-turquoise)]/10'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-normal)]'
                  }`}
                >
                  <div className={`text-sm font-medium ${
                    format === fmt.id ? 'text-[var(--accent-turquoise)]' : 'text-[var(--text-primary)]'
                  }`}>
                    {fmt.label}
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)]">{fmt.description}</div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Codec */}
          {availableCodecs.length > 1 && (
            <div>
              <label className="text-sm font-medium text-[var(--text-primary)] mb-3 block">Codec</label>
              <div className="flex gap-2">
                {availableCodecs.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setCodec(c.id)}
                    disabled={c.pro && !project?.isPro}
                    className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                      codec === c.id
                        ? 'border-[var(--accent-turquoise)] bg-[var(--accent-turquoise)]/10'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-normal)]'
                    } ${c.pro && !project?.isPro ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className={`text-sm font-medium ${
                        codec === c.id ? 'text-[var(--accent-turquoise)]' : 'text-[var(--text-primary)]'
                      }`}>
                        {c.label}
                      </span>
                      {c.pro && <span className="px-1.5 py-0.5 bg-[var(--accent-purple)] text-white text-xs rounded">Pro</span>}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)]">{c.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Quality */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-[var(--text-primary)]">Qualität</label>
              <span className="text-sm text-[var(--accent-turquoise)]">{quality}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value))}
              className="w-full h-2 bg-[var(--bg-surface)] rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent-turquoise)]"
            />
            <div className="flex justify-between text-xs text-[var(--text-tertiary)] mt-1">
              <span>Kleiner</span>
              <span>Besser</span>
            </div>
          </div>
          
          {/* Browser Version Info */}
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <div className="text-sm font-medium text-yellow-300">Browser-Version</div>
                <div className="text-xs text-yellow-200/80 mt-1">
                  Echter Video-Export ist nur in der Desktop-App (Electron) verfügbar. 
                  In der Browser-Version wird eine Export-Vorschau angezeigt.
                </div>
              </div>
            </div>
          </div>
          
          {/* Export Error */}
          {exportError && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <Icon name="close" size={16} />
                <span className="text-sm font-medium">Export fehlgeschlagen</span>
              </div>
              <div className="text-xs text-red-300 mt-1">{exportError}</div>
            </div>
          )}
          
          {/* Export Progress */}
          {exporting && (
            <div className="p-4 bg-[var(--bg-surface)] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--text-primary)]">{exportPhase}</span>
                <span className="text-sm text-[var(--accent-turquoise)]">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-[var(--bg-main)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--accent-turquoise)] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="h-16 px-6 flex items-center justify-between border-t border-[var(--border-subtle)]">
          <button
            onClick={onClose}
            disabled={exporting}
            className="px-6 h-10 rounded-lg border border-[var(--border-subtle)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all disabled:opacity-50"
          >
            Abbrechen
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-8 h-10 rounded-lg bg-[var(--accent-turquoise)] text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {exporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Exportiere...
              </>
            ) : (
              <>
                <Icon name="export" size={16} />
                Exportieren
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
