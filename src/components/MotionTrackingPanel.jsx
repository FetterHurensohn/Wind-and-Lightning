/**
 * Motion Tracking Panel
 * AI-basiertes Motion Tracking für Masken und Effekte
 */

import React, { useState, useCallback } from 'react';
import Icon from './editor/Icon';

export const TRACKING_TYPES = [
  { id: 'point', name: 'Punkt-Tracking', icon: 'target', description: 'Einzelnen Punkt verfolgen' },
  { id: 'area', name: 'Flächen-Tracking', icon: 'square', description: 'Rechteckige Fläche verfolgen' },
  { id: 'object', name: 'Objekt-Tracking', icon: 'box', description: 'KI-basierte Objektverfolgung' },
  { id: 'face', name: 'Gesichts-Tracking', icon: 'user', description: 'Gesichter automatisch verfolgen' },
  { id: 'body', name: 'Körper-Tracking', icon: 'user', description: 'Körperbewegungen verfolgen' }
];

export default function MotionTrackingPanel({ clip, onTrackingComplete, onClose }) {
  const [trackingType, setTrackingType] = useState('point');
  const [isTracking, setIsTracking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trackingData, setTrackingData] = useState(null);
  const [roi, setRoi] = useState({ x: 45, y: 45, width: 10, height: 10 });
  const [settings, setSettings] = useState({
    searchArea: 50,
    accuracy: 'high',
    smoothing: 5,
    predictMotion: true
  });
  
  const handleStartTracking = useCallback(async () => {
    setIsTracking(true);
    setProgress(0);
    
    // Simulate tracking process
    for (let i = 0; i <= 100; i += 2) {
      await new Promise(r => setTimeout(r, 50));
      setProgress(i);
    }
    
    // Generate mock tracking data
    const frames = Math.ceil((clip?.duration || 5) * 30);
    const data = {
      type: trackingType,
      frames: Array.from({ length: frames }, (_, i) => ({
        frame: i,
        time: i / 30,
        position: {
          x: roi.x + Math.sin(i * 0.1) * 5,
          y: roi.y + Math.cos(i * 0.1) * 3
        },
        scale: 1 + Math.sin(i * 0.05) * 0.1,
        rotation: Math.sin(i * 0.02) * 5,
        confidence: 0.95 - Math.random() * 0.1
      })),
      quality: 'high',
      avgConfidence: 0.92
    };
    
    setTrackingData(data);
    setIsTracking(false);
    setProgress(100);
  }, [clip, trackingType, roi]);
  
  const handleApply = useCallback(() => {
    onTrackingComplete?.(trackingData);
  }, [trackingData, onTrackingComplete]);
  
  return (
    <div className="bg-[var(--bg-panel)] rounded-lg border border-[var(--border-subtle)] overflow-hidden w-[450px]">
      {/* Header */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Icon name="target" size={16} className="text-[var(--accent-turquoise)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">Motion Tracking</span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors"
        >
          <Icon name="close" size={14} />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Tracking Type Selection */}
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-2 block">Tracking-Typ</label>
          <div className="grid grid-cols-2 gap-2">
            {TRACKING_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setTrackingType(type.id)}
                disabled={isTracking}
                className={`p-3 rounded-lg border text-left transition-all ${
                  trackingType === type.id
                    ? 'border-[var(--accent-turquoise)] bg-[var(--accent-turquoise)]/10'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-normal)]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon name={type.icon} size={14} className={trackingType === type.id ? 'text-[var(--accent-turquoise)]' : 'text-[var(--text-tertiary)]'} />
                  <span className={`text-sm ${trackingType === type.id ? 'text-[var(--accent-turquoise)]' : 'text-[var(--text-primary)]'}`}>
                    {type.name}
                  </span>
                </div>
                <div className="text-xs text-[var(--text-tertiary)]">{type.description}</div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Preview */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          {clip?.thumbnail ? (
            <img src={clip.thumbnail} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[var(--bg-surface)]">
              <Icon name="video" size={32} className="text-[var(--text-tertiary)]" />
            </div>
          )}
          
          {/* ROI Overlay */}
          <div 
            className="absolute border-2 border-[var(--accent-turquoise)] bg-[var(--accent-turquoise)]/10"
            style={{
              left: `${roi.x}%`,
              top: `${roi.y}%`,
              width: `${roi.width}%`,
              height: `${roi.height}%`
            }}
          >
            {/* Corner handles */}
            {['tl', 'tr', 'bl', 'br'].map(corner => (
              <div 
                key={corner}
                className={`absolute w-3 h-3 bg-[var(--accent-turquoise)] rounded-full ${
                  corner.includes('t') ? '-top-1.5' : '-bottom-1.5'
                } ${
                  corner.includes('l') ? '-left-1.5' : '-right-1.5'
                }`}
              />
            ))}
          </div>
          
          {/* Instructions */}
          <div className="absolute bottom-2 left-2 right-2 text-center">
            <span className="px-2 py-1 bg-black/70 text-white text-xs rounded">
              Ziehe den Rahmen auf das zu verfolgende Objekt
            </span>
          </div>
        </div>
        
        {/* Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-secondary)]">Genauigkeit</span>
            <div className="flex gap-1">
              {['low', 'medium', 'high'].map(acc => (
                <button
                  key={acc}
                  onClick={() => setSettings(s => ({ ...s, accuracy: acc }))}
                  disabled={isTracking}
                  className={`px-3 h-7 rounded text-xs transition-colors ${
                    settings.accuracy === acc
                      ? 'bg-[var(--accent-turquoise)] text-white'
                      : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                  }`}
                >
                  {acc === 'low' ? 'Schnell' : acc === 'medium' ? 'Normal' : 'Hoch'}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[var(--text-secondary)]">Glättung</span>
              <span className="text-xs text-[var(--text-primary)]">{settings.smoothing}</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={settings.smoothing}
              onChange={(e) => setSettings(s => ({ ...s, smoothing: parseInt(e.target.value) }))}
              disabled={isTracking}
              className="w-full h-1.5 bg-[var(--bg-surface)] rounded appearance-none cursor-pointer"
            />
          </div>
        </div>
        
        {/* Progress */}
        {isTracking && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-secondary)]">Analysiere Frames...</span>
              <span className="text-[var(--text-primary)]">{progress}%</span>
            </div>
            <div className="h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--accent-turquoise)] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Results */}
        {trackingData && !isTracking && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="check" size={14} className="text-green-500" />
              <span className="text-sm text-green-400">Tracking abgeschlossen</span>
            </div>
            <div className="text-xs text-[var(--text-tertiary)] space-y-1">
              <div>{trackingData.frames.length} Frames analysiert</div>
              <div>Durchschnittliche Konfidenz: {(trackingData.avgConfidence * 100).toFixed(1)}%</div>
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-2">
          {!trackingData ? (
            <button
              onClick={handleStartTracking}
              disabled={isTracking}
              className="flex-1 h-10 bg-[var(--accent-turquoise)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isTracking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Tracking...
                </>
              ) : (
                <>
                  <Icon name="play" size={16} />
                  Tracking starten
                </>
              )}
            </button>
          ) : (
            <>
              <button
                onClick={() => { setTrackingData(null); setProgress(0); }}
                className="flex-1 h-10 bg-[var(--bg-surface)] text-[var(--text-secondary)] rounded-lg text-sm hover:text-[var(--text-primary)] transition-colors"
              >
                Neu analysieren
              </button>
              <button
                onClick={handleApply}
                className="flex-1 h-10 bg-[var(--accent-turquoise)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Icon name="check" size={16} />
                Anwenden
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
