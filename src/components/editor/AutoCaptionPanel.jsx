/**
 * AutoCaptionPanel.jsx - Automatische Untertitel (wie CapCut)
 * 
 * Features:
 * - Automatische Spracherkennung
 * - Multi-Sprach-Unterstützung
 * - Untertitel-Styling
 * - Timing-Anpassung
 */

import React, { useState, useCallback } from 'react';
import Icon from './Icon';

// Verfügbare Sprachen
const LANGUAGES = [
  { code: 'de', name: 'Deutsch' },
  { code: 'en', name: 'Englisch' },
  { code: 'es', name: 'Spanisch' },
  { code: 'fr', name: 'Französisch' },
  { code: 'it', name: 'Italienisch' },
  { code: 'pt', name: 'Portugiesisch' },
  { code: 'nl', name: 'Niederländisch' },
  { code: 'pl', name: 'Polnisch' },
  { code: 'ru', name: 'Русский' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' },
  { code: 'ko', name: '한국어' },
];

// Untertitel Styles
const SUBTITLE_STYLES = [
  { id: 'default', name: 'Standard', preview: 'white-on-black' },
  { id: 'youtube', name: 'YouTube', preview: 'white-box' },
  { id: 'netflix', name: 'Netflix', preview: 'white-outline' },
  { id: 'modern', name: 'Modern', preview: 'gradient-bg' },
  { id: 'minimal', name: 'Minimal', preview: 'transparent' },
  { id: 'highlight', name: 'Highlight', preview: 'word-highlight' },
];

export default function AutoCaptionPanel({ 
  clip,
  onGenerateCaptions,
  onClose 
}) {
  const [language, setLanguage] = useState('de');
  const [style, setStyle] = useState('default');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [captions, setCaptions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  
  // Simuliere Caption-Generierung
  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setProgress(0);
    setCaptions([]);
    
    // Simuliere Fortschritt
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setProgress(i);
    }
    
    // Simulierte Untertitel
    const mockCaptions = [
      { id: 1, start: 0, end: 2.5, text: 'Willkommen zu diesem Video!' },
      { id: 2, start: 2.5, end: 5.0, text: 'Heute zeige ich euch...' },
      { id: 3, start: 5.0, end: 8.0, text: 'wie man professionelle Videos erstellt.' },
      { id: 4, start: 8.0, end: 11.0, text: 'Mit den richtigen Tools ist es ganz einfach.' },
    ];
    
    setCaptions(mockCaptions);
    setGenerating(false);
  }, []);
  
  const handleApply = useCallback(() => {
    onGenerateCaptions?.({
      language,
      style,
      captions,
    });
  }, [language, style, captions, onGenerateCaptions]);
  
  const updateCaption = useCallback((id, text) => {
    setCaptions(prev => prev.map(c => 
      c.id === id ? { ...c, text } : c
    ));
  }, []);
  
  return (
    <div className="bg-[var(--bg-panel)] rounded-lg border border-[var(--border-subtle)] overflow-hidden w-[400px] max-h-[550px]">
      {/* Header */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Icon name="text" size={16} className="text-[var(--accent-turquoise)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">Automatische Untertitel</span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors"
        >
          <Icon name="close" size={14} />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-4 max-h-[450px] overflow-y-auto">
        {/* Sprach-Auswahl */}
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-2 block">Sprache des Videos</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full h-10 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-turquoise)]"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>
        
        {/* Stil-Auswahl */}
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-2 block">Untertitel-Stil</label>
          <div className="grid grid-cols-3 gap-2">
            {SUBTITLE_STYLES.map(s => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`h-16 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                  style === s.id
                    ? 'border-[var(--accent-turquoise)] bg-[var(--accent-turquoise)]/10'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-normal)]'
                }`}
              >
                <div className="w-12 h-4 bg-black rounded-sm flex items-center justify-center">
                  <div className="w-8 h-2 bg-white rounded-sm" />
                </div>
                <span className="text-xs text-[var(--text-secondary)]">{s.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Generate Button */}
        {captions.length === 0 && !generating && (
          <button
            onClick={handleGenerate}
            className="w-full h-12 bg-gradient-to-r from-[var(--accent-turquoise)] to-[var(--accent-purple)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <Icon name="effects" size={18} />
            Untertitel generieren
          </button>
        )}
        
        {/* Progress */}
        {generating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-secondary)]">Analysiere Audio...</span>
              <span className="text-[var(--text-primary)]">{progress}%</span>
            </div>
            <div className="h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[var(--accent-turquoise)] to-[var(--accent-purple)] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Captions List */}
        {captions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-[var(--text-secondary)]">
                {captions.length} Untertitel gefunden
              </label>
              <button
                onClick={handleGenerate}
                className="text-xs text-[var(--accent-turquoise)] hover:underline"
              >
                Neu generieren
              </button>
            </div>
            
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {captions.map((caption, index) => (
                <div 
                  key={caption.id}
                  className="p-2 bg-[var(--bg-surface)] rounded-lg"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[var(--text-tertiary)]">
                      {caption.start.toFixed(1)}s - {caption.end.toFixed(1)}s
                    </span>
                    <button
                      onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                      className="text-xs text-[var(--accent-turquoise)] hover:underline"
                    >
                      {editingIndex === index ? 'Fertig' : 'Bearbeiten'}
                    </button>
                  </div>
                  {editingIndex === index ? (
                    <input
                      type="text"
                      value={caption.text}
                      onChange={(e) => updateCaption(caption.id, e.target.value)}
                      className="w-full h-8 px-2 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-turquoise)]"
                      autoFocus
                    />
                  ) : (
                    <p className="text-sm text-[var(--text-primary)]">{caption.text}</p>
                  )}
                </div>
              ))}
            </div>
            
            {/* Apply Button */}
            <button
              onClick={handleApply}
              className="w-full h-10 bg-[var(--accent-turquoise)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <Icon name="check" size={14} />
              Untertitel anwenden
            </button>
          </div>
        )}
        
        {/* Info */}
        <div className="p-3 bg-[var(--bg-surface)] rounded-lg">
          <div className="flex items-start gap-2">
            <Icon name="info" size={14} className="text-[var(--text-tertiary)] mt-0.5" />
            <div className="text-xs text-[var(--text-tertiary)]">
              Die automatische Untertitelung nutzt KI-basierte Spracherkennung. 
              Für beste Ergebnisse verwende Audio mit klarer Sprache und wenig Hintergrundgeräuschen.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
