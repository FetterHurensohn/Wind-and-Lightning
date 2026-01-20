/**
 * FilterPanel.jsx - Filter & Effekte Panel (wie CapCut)
 * 
 * Features:
 * - LUT-Filter
 * - Farbkorrekturen
 * - Effekte
 * - AI-Verbesserungen
 */

import React, { useState, useCallback } from 'react';
import Icon from './Icon';

// Filter Kategorien
const FILTER_CATEGORIES = [
  { id: 'trending', name: 'Beliebt', icon: 'star' },
  { id: 'portrait', name: 'Portrait', icon: 'image' },
  { id: 'landscape', name: 'Landschaft', icon: 'image' },
  { id: 'film', name: 'Film', icon: 'video' },
  { id: 'vintage', name: 'Vintage', icon: 'effects' },
  { id: 'bw', name: 'S/W', icon: 'filter' },
  { id: 'food', name: 'Food', icon: 'effects' },
];

// Filter Presets
const FILTERS = {
  trending: [
    { id: 'original', name: 'Original', preview: '#333', adjustments: {} },
    { id: 'vivid', name: 'Vivid', preview: 'linear-gradient(45deg, #ff6b6b, #ffd93d)', adjustments: { saturation: 130, contrast: 110 } },
    { id: 'cool', name: 'Kühl', preview: 'linear-gradient(45deg, #4facfe, #00f2fe)', adjustments: { temperature: -20, tint: -10 } },
    { id: 'warm', name: 'Warm', preview: 'linear-gradient(45deg, #fa709a, #fee140)', adjustments: { temperature: 25, tint: 10 } },
    { id: 'dramatic', name: 'Dramatisch', preview: 'linear-gradient(45deg, #1a1a2e, #16213e)', adjustments: { contrast: 140, saturation: 80 } },
    { id: 'bright', name: 'Hell', preview: 'linear-gradient(45deg, #fff, #f0f0f0)', adjustments: { brightness: 120, contrast: 95 } },
  ],
  portrait: [
    { id: 'beauty', name: 'Beauty', preview: 'linear-gradient(45deg, #ffecd2, #fcb69f)', adjustments: { brightness: 105, warmth: 10 } },
    { id: 'soft', name: 'Soft', preview: 'linear-gradient(45deg, #e0c3fc, #8ec5fc)', adjustments: { contrast: 85, sharpness: -10 } },
    { id: 'glow', name: 'Glow', preview: 'linear-gradient(45deg, #fff5e6, #ffe6cc)', adjustments: { highlights: 20, warmth: 15 } },
  ],
  landscape: [
    { id: 'nature', name: 'Natur', preview: 'linear-gradient(45deg, #56ab2f, #a8e6cf)', adjustments: { saturation: 115, vibrance: 20 } },
    { id: 'golden', name: 'Golden Hour', preview: 'linear-gradient(45deg, #f093fb, #f5576c)', adjustments: { temperature: 35, contrast: 105 } },
    { id: 'blue-hour', name: 'Blaue Stunde', preview: 'linear-gradient(45deg, #667eea, #764ba2)', adjustments: { temperature: -30, saturation: 110 } },
  ],
  film: [
    { id: 'cinematic', name: 'Cinematic', preview: 'linear-gradient(45deg, #141e30, #243b55)', adjustments: { contrast: 120, blacks: -10, highlights: -20 } },
    { id: 'blockbuster', name: 'Blockbuster', preview: 'linear-gradient(45deg, #ff9a9e, #fecfef)', adjustments: { teal: 20, orange: 30 } },
    { id: 'noir', name: 'Film Noir', preview: 'linear-gradient(45deg, #232526, #414345)', adjustments: { saturation: 0, contrast: 130 } },
  ],
  vintage: [
    { id: 'retro', name: 'Retro', preview: 'linear-gradient(45deg, #c79081, #dfa579)', adjustments: { fade: 20, warmth: 15, saturation: 80 } },
    { id: 'faded', name: 'Verblasst', preview: 'linear-gradient(45deg, #d4d4d4, #e8e8e8)', adjustments: { contrast: 80, fade: 30 } },
    { id: 'sepia', name: 'Sepia', preview: 'linear-gradient(45deg, #d4a574, #c4956a)', adjustments: { sepia: 100 } },
  ],
  bw: [
    { id: 'mono', name: 'Mono', preview: '#888', adjustments: { saturation: 0 } },
    { id: 'high-contrast', name: 'High Contrast', preview: 'linear-gradient(45deg, #000, #fff)', adjustments: { saturation: 0, contrast: 150 } },
    { id: 'silvertone', name: 'Silvertone', preview: '#aaa', adjustments: { saturation: 0, brightness: 110 } },
  ],
  food: [
    { id: 'appetizing', name: 'Appetitlich', preview: 'linear-gradient(45deg, #ff9a9e, #fecfef)', adjustments: { saturation: 120, warmth: 10 } },
    { id: 'fresh', name: 'Frisch', preview: 'linear-gradient(45deg, #84fab0, #8fd3f4)', adjustments: { vibrance: 25, brightness: 105 } },
  ],
};

// AI Enhancements
const AI_ENHANCEMENTS = [
  { id: 'auto-enhance', name: 'Auto-Verbesserung', icon: 'effects', description: 'KI optimiert automatisch' },
  { id: 'face-retouch', name: 'Gesichtsretusche', icon: 'image', description: 'Haut glätten, Augen betonen' },
  { id: 'hdr', name: 'HDR-Effekt', icon: 'adjustment', description: 'Mehr Dynamik' },
  { id: 'denoise', name: 'Rauschreduzierung', icon: 'effects', description: 'Bildrauschen entfernen' },
  { id: 'sharpen', name: 'Schärfen', icon: 'effects', description: 'Details hervorheben' },
  { id: 'upscale', name: 'Hochskalieren', icon: 'zoomIn', description: 'Auflösung erhöhen' },
];

export default function FilterPanel({ 
  clip,
  onFilterApply,
  onClose 
}) {
  const [activeCategory, setActiveCategory] = useState('trending');
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [intensity, setIntensity] = useState(100);
  const [showAI, setShowAI] = useState(false);
  
  const handleApplyFilter = useCallback(() => {
    if (selectedFilter) {
      onFilterApply?.({
        filter: selectedFilter,
        intensity,
      });
    }
  }, [selectedFilter, intensity, onFilterApply]);
  
  const currentFilters = FILTERS[activeCategory] || [];
  
  return (
    <div className="bg-[var(--bg-panel)] rounded-lg border border-[var(--border-subtle)] overflow-hidden w-[420px] max-h-[500px]">
      {/* Header */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Icon name="filter" size={16} className="text-[var(--accent-turquoise)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">Filter & Effekte</span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors"
        >
          <Icon name="close" size={14} />
        </button>
      </div>
      
      {/* Content */}
      <div className="flex h-[400px]">
        {/* Left: Categories */}
        <div className="w-28 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] overflow-y-auto">
          <button
            onClick={() => setShowAI(!showAI)}
            className={`w-full h-9 px-3 flex items-center gap-2 text-xs transition-colors ${
              showAI
                ? 'bg-[var(--accent-purple)]/20 text-[var(--accent-purple)] font-medium'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <Icon name="effects" size={14} />
            <span>KI</span>
            <span className="ml-auto px-1 py-0.5 bg-[var(--accent-purple)] text-white text-[10px] rounded">Neu</span>
          </button>
          
          {FILTER_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setShowAI(false);
              }}
              className={`w-full h-9 px-3 flex items-center gap-2 text-xs transition-colors ${
                activeCategory === cat.id && !showAI
                  ? 'bg-[var(--bg-panel)] text-[var(--accent-turquoise)] font-medium'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <Icon name={cat.icon} size={14} />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
        
        {/* Right: Filters/AI */}
        <div className="flex-1 flex flex-col">
          {showAI ? (
            /* AI Enhancements */
            <div className="p-3 space-y-2 overflow-y-auto">
              {AI_ENHANCEMENTS.map(ai => (
                <button
                  key={ai.id}
                  className="w-full flex items-center gap-3 p-3 bg-[var(--bg-surface)] rounded-lg text-left hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-turquoise)] flex items-center justify-center">
                    <Icon name={ai.icon} size={18} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[var(--text-primary)]">{ai.name}</div>
                    <div className="text-xs text-[var(--text-tertiary)]">{ai.description}</div>
                  </div>
                  <div className="px-2 py-1 bg-[var(--accent-purple)] text-white text-xs rounded">
                    Pro
                  </div>
                </button>
              ))}
            </div>
          ) : (
            /* Filter Grid */
            <>
              <div className="flex-1 p-3 overflow-y-auto">
                <div className="grid grid-cols-3 gap-2">
                  {currentFilters.map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setSelectedFilter(filter)}
                      className={`aspect-square rounded-lg overflow-hidden relative transition-all ${
                        selectedFilter?.id === filter.id
                          ? 'ring-2 ring-[var(--accent-turquoise)] scale-95'
                          : 'hover:scale-95'
                      }`}
                    >
                      <div 
                        className="absolute inset-0"
                        style={{ background: filter.preview }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 text-center">
                        {filter.name}
                      </div>
                      {selectedFilter?.id === filter.id && (
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[var(--accent-turquoise)] flex items-center justify-center">
                          <Icon name="check" size={12} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Intensity Slider */}
              {selectedFilter && selectedFilter.id !== 'original' && (
                <div className="p-3 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[var(--text-secondary)]">Intensität</span>
                    <span className="text-xs text-[var(--text-primary)]">{intensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={intensity}
                    onChange={(e) => setIntensity(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[var(--bg-surface)] rounded appearance-none cursor-pointer"
                  />
                </div>
              )}
            </>
          )}
          
          {/* Apply Button */}
          {selectedFilter && !showAI && (
            <div className="p-3 border-t border-[var(--border-subtle)]">
              <button
                onClick={handleApplyFilter}
                className="w-full h-9 bg-[var(--accent-turquoise)] text-white rounded text-xs font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Icon name="check" size={14} />
                Filter anwenden
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
