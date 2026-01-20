/**
 * KIPanel-Komponente
 * 
 * AI Model Selector und Generate-Button für KI-Features.
 * Simuliert KI-Generierung mit Progress (kein echtes Backend).
 * 
 * Props:
 * @param {Array} models - Verfügbare AI-Modelle
 * @param {Function} onGenerate - Callback beim Generate-Click (model, description)
 */

import React, { useState } from 'react';

const DEFAULT_MODELS = [
  { id: 'seedance-1.0-fast', name: 'Seedance 1.0 Fast', description: 'Gleichmäßige, stabile Bewegung und noch schnellere Generierung.' },
  { id: 'image-gen-2.0', name: 'Image Gen 2.0', description: 'Hochqualitative Bildgenerierung' },
  { id: 'video-gen-1.5', name: 'Video Gen 1.5', description: 'Kurze Video-Clips generieren' }
];

export default function KIPanel({
  models = DEFAULT_MODELS,
  onGenerate
}) {
  const [selectedModel, setSelectedModel] = useState(models[0]?.id || '');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const currentModel = models.find(m => m.id === selectedModel) || models[0];

  const handleGenerate = () => {
    if (!description.trim()) return;
    
    setIsGenerating(true);
    setProgress(0);
    
    // Simuliere Progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          
          if (onGenerate) {
            onGenerate(selectedModel, description);
          }
          
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="p-4 bg-panel rounded-lg border border-muted/20">
      <h3 className="text-sm font-semibold text-white mb-3">KI-Generierung</h3>
      
      {/* Model Selector */}
      <div className="mb-3">
        <label className="block text-xs text-muted mb-1">Modell</label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          disabled={isGenerating}
          className="w-full px-3 py-2 bg-surface border border-muted/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
        >
          {models.map(model => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
        
        {/* Model Description */}
        {currentModel && (
          <div className="mt-2 text-xs text-muted">
            {currentModel.description}
          </div>
        )}
      </div>

      {/* Description Input */}
      <div className="mb-3">
        <label className="block text-xs text-muted mb-1">
          Beschreibung
          <span className="text-muted/50 ml-1">(Optional: Beschreibe das Video, das du generieren möchtest. Zum Beispiel: Wellen rauschen über den Strand.)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isGenerating}
          placeholder="Wellen rauschen über den Strand..."
          rows="3"
          className="w-full px-3 py-2 bg-surface border border-muted/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none disabled:opacity-50"
        />
      </div>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="mb-3">
          <div className="h-2 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-muted mt-1 text-center">
            Generiere... {progress}%
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!description.trim() || isGenerating}
        className="w-full px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:from-violet-600/50 disabled:to-purple-600/50 text-white rounded text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
      >
        <span>🎬</span>
        <span>Generieren</span>
        <span className="px-1.5 py-0.5 bg-yellow-400 text-black text-xs font-bold rounded">Pro</span>
      </button>
    </div>
  );
}
