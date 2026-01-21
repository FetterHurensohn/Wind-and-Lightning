/**
 * Stabilization Panel
 * Video-Stabilisierung
 */

import React, { useState, useCallback } from 'react';
import Icon from './editor/Icon';

export const STABILIZATION_MODES = [
  { id: 'auto', name: 'Automatisch', description: 'KI wählt die beste Methode' },
  { id: 'smooth', name: 'Glätten', description: 'Weiche, fließende Bewegungen' },
  { id: 'lock', name: 'Fixieren', description: 'Kamera bleibt stabil' },
  { id: 'horizon', name: 'Horizont', description: 'Horizont gerade halten' }
];

export default function StabilizationPanel({ clip, onApply, onClose }) {
  const [mode, setMode] = useState('auto');
  const [strength, setStrength] = useState(50);
  const [smoothness, setSmoothness] = useState(50);
  const [cropAuto, setCropAuto] = useState(true);
  const [rollingShutter, setRollingShutter] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const handleAnalyze = useCallback(async () => {
    setAnalyzing(true);
    setProgress(0);
    
    for (let i = 0; i <= 100; i += 2) {
      await new Promise(r => setTimeout(r, 30));
      setProgress(i);
    }
    
    setAnalysisResult({
      shakiness: Math.random() * 100,
      rotation: Math.random() * 10,
      recommendedStrength: 50 + Math.random() * 30,
      cropRequired: 5 + Math.random() * 10
    });
    
    setAnalyzing(false);
    setAnalyzed(true);
  }, []);
  
  const handleApplyStabilization = useCallback(() => {
    onApply?.({
      mode,
      strength,
      smoothness,
      cropAuto,
      rollingShutter
    });
  }, [mode, strength, smoothness, cropAuto, rollingShutter, onApply]);
  
  return (
    <div className="bg-[var(--bg-panel)] rounded-lg border border-[var(--border-subtle)] overflow-hidden w-[400px]">
      {/* Header */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Icon name="video" size={16} className="text-[var(--accent-turquoise)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">Stabilisierung</span>
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
        {/* Mode Selection */}
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-2 block">Stabilisierungsmodus</label>
          <div className="grid grid-cols-2 gap-2">
            {STABILIZATION_MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  mode === m.id
                    ? 'border-[var(--accent-turquoise)] bg-[var(--accent-turquoise)]/10'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-normal)]'
                }`}
              >
                <div className={`text-sm font-medium ${
                  mode === m.id ? 'text-[var(--accent-turquoise)]' : 'text-[var(--text-primary)]'
                }`}>
                  {m.name}
                </div>
                <div className="text-xs text-[var(--text-tertiary)]">{m.description}</div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Analysis */}
        {!analyzed && (
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full h-12 bg-[var(--bg-surface)] border border-dashed border-[var(--border-subtle)] rounded-lg flex items-center justify-center gap-2 hover:border-[var(--accent-turquoise)] transition-colors"
          >
            {analyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-[var(--accent-turquoise)] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-[var(--text-secondary)]">Analysiere... {progress}%</span>
              </>
            ) : (
              <>
                <Icon name="search" size={16} className="text-[var(--text-tertiary)]" />
                <span className="text-sm text-[var(--text-secondary)]">Video analysieren</span>
              </>
            )}
          </button>
        )}
        
        {/* Analysis Result */}
        {analyzed && analysisResult && (
          <div className="p-3 bg-[var(--bg-surface)] rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-tertiary)]">Verwackelung erkannt:</span>
              <span className={`font-medium ${
                analysisResult.shakiness > 70 ? 'text-red-400' : 
                analysisResult.shakiness > 40 ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {analysisResult.shakiness.toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-tertiary)]">Empfohlene Stärke:</span>
              <span className="text-[var(--text-primary)]">{analysisResult.recommendedStrength.toFixed(0)}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-tertiary)]">Geschätzter Crop:</span>
              <span className="text-[var(--text-primary)]">{analysisResult.cropRequired.toFixed(1)}%</span>
            </div>
          </div>
        )}
        
        {/* Settings */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--text-secondary)]">Stärke</span>
              <span className="text-xs text-[var(--text-primary)]">{strength}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={strength}
              onChange={(e) => setStrength(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[var(--bg-surface)] rounded appearance-none cursor-pointer"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--text-secondary)]">Glättung</span>
              <span className="text-xs text-[var(--text-primary)]">{smoothness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={smoothness}
              onChange={(e) => setSmoothness(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[var(--bg-surface)] rounded appearance-none cursor-pointer"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--text-secondary)]">Rolling Shutter Korrektur</span>
              <span className="text-xs text-[var(--text-primary)]">{rollingShutter}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={rollingShutter}
              onChange={(e) => setRollingShutter(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[var(--bg-surface)] rounded appearance-none cursor-pointer"
            />
          </div>
          
          <label className="flex items-center gap-3 p-3 bg-[var(--bg-surface)] rounded cursor-pointer">
            <input
              type="checkbox"
              checked={cropAuto}
              onChange={(e) => setCropAuto(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <div>
              <div className="text-sm text-[var(--text-primary)]">Automatischer Crop</div>
              <div className="text-xs text-[var(--text-tertiary)]">Ränder automatisch zuschneiden</div>
            </div>
          </label>
        </div>
        
        {/* Apply Button */}
        <button
          onClick={handleApplyStabilization}
          className="w-full h-10 bg-[var(--accent-turquoise)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <Icon name="check" size={16} />
          Stabilisierung anwenden
        </button>
      </div>
    </div>
  );
}
