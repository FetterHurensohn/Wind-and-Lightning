/**
 * ExportModal-Komponente
 * 
 * Modal für Export-Optionen mit Schnell-Export und erweiterten Einstellungen.
 * 
 * Props:
 * @param {boolean} open - Sichtbarkeits-State
 * @param {Function} onClose - Callback beim Schließen
 * @param {Function} onExport - Callback beim Export (options)
 * @param {string} projectName - Projektname für Export-Dateiname
 */

import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon, CheckIcon } from '../icons';

export default function ExportModal({
  open,
  onClose,
  onExport,
  projectName = 'projekt'
}) {
  const [resolution, setResolution] = useState('1080p');
  const [fps, setFps] = useState(30);
  const [format, setFormat] = useState('mp4');
  const [quality, setQuality] = useState('high');
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const modalRef = useRef(null);

  // Focus Management
  useEffect(() => {
    if (open && modalRef.current) {
      const firstInput = modalRef.current.querySelector('button, select, input');
      firstInput?.focus();
    }
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isExporting) {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, isExporting, onClose]);

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setIsExporting(false);
      setExportComplete(false);
    }
  }, [open]);

  const handleQuickExport = async () => {
    await handleExport();
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    const options = {
      resolution,
      fps,
      format,
      quality,
      filename: `${projectName}_export.${format}`
    };

    try {
      await onExport?.(options);
      
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setExportComplete(true);
      
      // Auto-close after success
      setTimeout(() => {
        onClose?.();
      }, 1500);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-[200] animate-fadeIn"
        onClick={() => !isExporting && onClose?.()}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-md bg-[var(--panel)] border border-white/[0.06] rounded-xl shadow-2xl animate-scaleIn"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 id="export-modal-title" className="text-lg font-semibold text-white">
            Video exportieren
          </h2>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-1 rounded hover:bg-white/[0.04] text-muted hover:text-white transition-colors disabled:opacity-50"
            aria-label="Schließen"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {exportComplete ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-4">
                <CheckIcon className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Export abgeschlossen
              </h3>
              <p className="text-sm text-muted">
                Dein Video wurde erfolgreich exportiert.
              </p>
            </div>
          ) : (
            <>
              {/* Quick Export */}
              <div>
                <button
                  onClick={handleQuickExport}
                  disabled={isExporting}
                  className="w-full px-4 py-3 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Exportiere...
                    </span>
                  ) : (
                    'Schnell-Export (1080p, 30fps)'
                  )}
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.06]" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-[var(--panel)] text-muted">
                    oder erweiterte Einstellungen
                  </span>
                </div>
              </div>

              {/* Advanced Options */}
              <div className="space-y-3">
                {/* Resolution */}
                <div>
                  <label className="block text-sm font-medium text-white mb-1.5">
                    Auflösung
                  </label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    disabled={isExporting}
                    className="w-full px-3 py-2 bg-surface border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50"
                  >
                    <option value="720p">720p (1280×720)</option>
                    <option value="1080p">1080p (1920×1080)</option>
                    <option value="1440p">1440p (2560×1440)</option>
                    <option value="4k">4K (3840×2160)</option>
                  </select>
                </div>

                {/* FPS */}
                <div>
                  <label className="block text-sm font-medium text-white mb-1.5">
                    Bildfrequenz
                  </label>
                  <select
                    value={fps}
                    onChange={(e) => setFps(Number(e.target.value))}
                    disabled={isExporting}
                    className="w-full px-3 py-2 bg-surface border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50"
                  >
                    <option value={24}>24 fps</option>
                    <option value={30}>30 fps</option>
                    <option value={60}>60 fps</option>
                    <option value={120}>120 fps</option>
                  </select>
                </div>

                {/* Format */}
                <div>
                  <label className="block text-sm font-medium text-white mb-1.5">
                    Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    disabled={isExporting}
                    className="w-full px-3 py-2 bg-surface border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50"
                  >
                    <option value="mp4">MP4 (H.264)</option>
                    <option value="mov">MOV (ProRes)</option>
                    <option value="webm">WebM (VP9)</option>
                    <option value="gif">GIF</option>
                  </select>
                </div>

                {/* Quality */}
                <div>
                  <label className="block text-sm font-medium text-white mb-1.5">
                    Qualität
                  </label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    disabled={isExporting}
                    className="w-full px-3 py-2 bg-surface border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50"
                  >
                    <option value="low">Niedrig</option>
                    <option value="medium">Mittel</option>
                    <option value="high">Hoch</option>
                    <option value="best">Beste</option>
                  </select>
                </div>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full px-4 py-2.5 bg-surface hover:bg-surface/80 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? 'Exportiere...' : 'Mit Einstellungen exportieren'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
