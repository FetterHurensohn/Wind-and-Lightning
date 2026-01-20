/**
 * ChromaKeyPanel.jsx - Green Screen / Hintergrundentfernung (wie CapCut)
 * 
 * Features:
 * - Chroma Key (Green/Blue Screen)
 * - AI Background Removal
 * - Hintergrund ersetzen
 * - Feinjustierung
 */

import React, { useState, useCallback } from 'react';
import Icon from './Icon';

// Hintergrund-Vorlagen
const BACKGROUNDS = [
  { id: 'transparent', name: 'Transparent', preview: 'repeating-conic-gradient(#808080 0% 25%, #fff 0% 50%) 50% / 20px 20px' },
  { id: 'blur', name: 'Unscharfer HG', preview: 'linear-gradient(45deg, #667eea40, #764ba240)' },
  { id: 'white', name: 'Weiß', preview: '#ffffff' },
  { id: 'black', name: 'Schwarz', preview: '#000000' },
  { id: 'gradient-1', name: 'Gradient 1', preview: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { id: 'gradient-2', name: 'Gradient 2', preview: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { id: 'gradient-3', name: 'Gradient 3', preview: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
  { id: 'office', name: 'Büro', preview: 'linear-gradient(180deg, #e0e5ec, #d0d5dc)' },
  { id: 'nature', name: 'Natur', preview: 'linear-gradient(180deg, #87ceeb, #228b22)' },
];

export default function ChromaKeyPanel({ 
  clip,
  onApply,
  onClose 
}) {
  const [mode, setMode] = useState('ai'); // 'ai' | 'chroma'
  const [chromaColor, setChromaColor] = useState('#00ff00'); // Green
  const [tolerance, setTolerance] = useState(30);
  const [softness, setSoftness] = useState(10);
  const [spillSuppression, setSpillSuppression] = useState(50);
  const [selectedBackground, setSelectedBackground] = useState('transparent');
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  
  const handleProcess = useCallback(async () => {
    setProcessing(true);
    // Simuliere Verarbeitung
    await new Promise(resolve => setTimeout(resolve, 2000));
    setProcessing(false);
    setProcessed(true);
  }, []);
  
  const handleApply = useCallback(() => {
    onApply?.({
      mode,
      chromaColor: mode === 'chroma' ? chromaColor : null,
      tolerance,
      softness,
      spillSuppression,
      background: selectedBackground,
    });
  }, [mode, chromaColor, tolerance, softness, spillSuppression, selectedBackground, onApply]);
  
  return (
    <div className="bg-[var(--bg-panel)] rounded-lg border border-[var(--border-subtle)] overflow-hidden w-[380px]">
      {/* Header */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Icon name="effects" size={16} className="text-[var(--accent-turquoise)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">Hintergrund entfernen</span>
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
        <div className="flex gap-2 p-1 bg-[var(--bg-surface)] rounded-lg">
          <button
            onClick={() => setMode('ai')}
            className={`flex-1 h-9 rounded text-xs font-medium transition-colors flex items-center justify-center gap-2 ${
              mode === 'ai'
                ? 'bg-[var(--bg-panel)] text-[var(--text-primary)] shadow'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Icon name="effects" size={14} />
            KI-Entfernung
          </button>
          <button
            onClick={() => setMode('chroma')}
            className={`flex-1 h-9 rounded text-xs font-medium transition-colors flex items-center justify-center gap-2 ${
              mode === 'chroma'
                ? 'bg-[var(--bg-panel)] text-[var(--text-primary)] shadow'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <div className="w-3 h-3 rounded-full bg-green-500" />
            Chroma Key
          </button>
        </div>
        
        {mode === 'ai' ? (
          /* AI Mode */
          <div className="space-y-4">
            {!processed ? (
              <button
                onClick={handleProcess}
                disabled={processing}
                className="w-full h-24 bg-gradient-to-br from-[var(--accent-purple)]/20 to-[var(--accent-turquoise)]/20 border border-dashed border-[var(--accent-turquoise)] rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-[var(--accent-turquoise)]/10 transition-colors disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <div className="w-8 h-8 border-2 border-[var(--accent-turquoise)] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-[var(--text-secondary)]">Hintergrund wird entfernt...</span>
                  </>
                ) : (
                  <>
                    <Icon name="effects" size={24} className="text-[var(--accent-turquoise)]" />
                    <span className="text-sm text-[var(--text-primary)]">Hintergrund automatisch entfernen</span>
                    <span className="text-xs text-[var(--text-tertiary)]">KI-basierte Erkennung</span>
                  </>
                )}
              </button>
            ) : (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
                <Icon name="check" size={16} className="text-green-500" />
                <span className="text-sm text-green-500">Hintergrund erfolgreich entfernt!</span>
              </div>
            )}
          </div>
        ) : (
          /* Chroma Key Mode */
          <div className="space-y-4">
            {/* Color Picker */}
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-2 block">Schlüsselfarbe</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setChromaColor('#00ff00')}
                  className={`w-10 h-10 rounded-lg bg-green-500 border-2 ${
                    chromaColor === '#00ff00' ? 'border-white' : 'border-transparent'
                  }`}
                  title="Grün"
                />
                <button
                  onClick={() => setChromaColor('#0000ff')}
                  className={`w-10 h-10 rounded-lg bg-blue-500 border-2 ${
                    chromaColor === '#0000ff' ? 'border-white' : 'border-transparent'
                  }`}
                  title="Blau"
                />
                <input
                  type="color"
                  value={chromaColor}
                  onChange={(e) => setChromaColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer"
                  title="Eigene Farbe"
                />
              </div>
            </div>
            
            {/* Tolerance */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[var(--text-secondary)]">Toleranz</span>
                <span className="text-xs text-[var(--text-primary)]">{tolerance}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={tolerance}
                onChange={(e) => setTolerance(parseInt(e.target.value))}
                className="w-full h-1.5 bg-[var(--bg-surface)] rounded appearance-none cursor-pointer"
              />
            </div>
            
            {/* Softness */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[var(--text-secondary)]">Kantenweichheit</span>
                <span className="text-xs text-[var(--text-primary)]">{softness}</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={softness}
                onChange={(e) => setSoftness(parseInt(e.target.value))}
                className="w-full h-1.5 bg-[var(--bg-surface)] rounded appearance-none cursor-pointer"
              />
            </div>
            
            {/* Spill Suppression */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[var(--text-secondary)]">Farbüberlauf-Korrektur</span>
                <span className="text-xs text-[var(--text-primary)]">{spillSuppression}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={spillSuppression}
                onChange={(e) => setSpillSuppression(parseInt(e.target.value))}
                className="w-full h-1.5 bg-[var(--bg-surface)] rounded appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}
        
        {/* Background Selection */}
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-2 block">Neuer Hintergrund</label>
          <div className="grid grid-cols-5 gap-2">
            {BACKGROUNDS.map(bg => (
              <button
                key={bg.id}
                onClick={() => setSelectedBackground(bg.id)}
                className={`aspect-square rounded-lg border-2 transition-all ${
                  selectedBackground === bg.id
                    ? 'border-[var(--accent-turquoise)] scale-95'
                    : 'border-transparent hover:scale-95'
                }`}
                style={{ background: bg.preview }}
                title={bg.name}
              />
            ))}
          </div>
        </div>
        
        {/* Apply Button */}
        <button
          onClick={handleApply}
          disabled={mode === 'ai' && !processed}
          className="w-full h-10 bg-[var(--accent-turquoise)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Icon name="check" size={14} />
          Anwenden
        </button>
      </div>
    </div>
  );
}
