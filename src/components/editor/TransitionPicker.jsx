/**
 * TransitionPicker.jsx - Übergänge zwischen Clips (wie CapCut)
 * 
 * Features:
 * - Verschiedene Übergangstypen
 * - Vorschau der Übergänge
 * - Dauer-Einstellung
 * - Favoriten
 */

import React, { useState, useCallback } from 'react';
import Icon from './Icon';

// Transition Categories
const CATEGORIES = [
  { id: 'basic', name: 'Basis', icon: 'transitions' },
  { id: 'zoom', name: 'Zoom', icon: 'zoomIn' },
  { id: 'slide', name: 'Schieben', icon: 'arrowRight' },
  { id: 'wipe', name: 'Wischen', icon: 'minus' },
  { id: 'blur', name: 'Unschärfe', icon: 'effects' },
  { id: 'glitch', name: 'Glitch', icon: 'effects' },
  { id: 'light', name: 'Licht', icon: 'effects' },
];

// Transitions
const TRANSITIONS = {
  basic: [
    { id: 'fade', name: 'Überblendung', preview: 'linear-gradient(to right, #333 0%, #333 45%, #666 50%, #999 55%, #999 100%)' },
    { id: 'crossfade', name: 'Kreuzblende', preview: 'linear-gradient(to right, #444, #888)' },
    { id: 'dip-black', name: 'Schwarzblende', preview: 'linear-gradient(to right, #333, #000, #666)' },
    { id: 'dip-white', name: 'Weißblende', preview: 'linear-gradient(to right, #333, #fff, #666)' },
  ],
  zoom: [
    { id: 'zoom-in', name: 'Reinzoomen', preview: 'radial-gradient(circle, #666, #333)' },
    { id: 'zoom-out', name: 'Rauszoomen', preview: 'radial-gradient(circle, #333, #666)' },
    { id: 'zoom-blur', name: 'Zoom Blur', preview: 'radial-gradient(circle, #888, #222)' },
    { id: 'zoom-rotate', name: 'Zoom & Drehen', preview: 'conic-gradient(#333, #666, #333)' },
  ],
  slide: [
    { id: 'slide-left', name: 'Nach links', preview: 'linear-gradient(to left, #666, #333)' },
    { id: 'slide-right', name: 'Nach rechts', preview: 'linear-gradient(to right, #666, #333)' },
    { id: 'slide-up', name: 'Nach oben', preview: 'linear-gradient(to top, #666, #333)' },
    { id: 'slide-down', name: 'Nach unten', preview: 'linear-gradient(to bottom, #666, #333)' },
    { id: 'push-left', name: 'Schieben links', preview: 'linear-gradient(90deg, #666 50%, #333 50%)' },
    { id: 'push-right', name: 'Schieben rechts', preview: 'linear-gradient(270deg, #666 50%, #333 50%)' },
  ],
  wipe: [
    { id: 'wipe-left', name: 'Wischen links', preview: 'linear-gradient(to left, #666 0%, #666 50%, #333 50%, #333 100%)' },
    { id: 'wipe-right', name: 'Wischen rechts', preview: 'linear-gradient(to right, #333 0%, #333 50%, #666 50%, #666 100%)' },
    { id: 'wipe-up', name: 'Wischen hoch', preview: 'linear-gradient(to top, #666 0%, #666 50%, #333 50%, #333 100%)' },
    { id: 'wipe-down', name: 'Wischen runter', preview: 'linear-gradient(to bottom, #333 0%, #333 50%, #666 50%, #666 100%)' },
    { id: 'clock', name: 'Uhr', preview: 'conic-gradient(from 0deg, #333 0%, #333 50%, #666 50%, #666 100%)' },
    { id: 'iris', name: 'Iris', preview: 'radial-gradient(circle, #666 0%, #666 50%, #333 50%, #333 100%)' },
  ],
  blur: [
    { id: 'blur-in', name: 'Blur rein', preview: 'linear-gradient(to right, #333, #555, #666)' },
    { id: 'blur-out', name: 'Blur raus', preview: 'linear-gradient(to right, #666, #555, #333)' },
    { id: 'motion-blur', name: 'Bewegungsunschärfe', preview: 'linear-gradient(to right, #333 20%, #666 50%, #333 80%)' },
  ],
  glitch: [
    { id: 'glitch-1', name: 'Glitch 1', preview: 'repeating-linear-gradient(0deg, #f00 0px, #0f0 2px, #00f 4px, #333 6px)' },
    { id: 'glitch-2', name: 'Glitch 2', preview: 'repeating-linear-gradient(90deg, #f00 0px, #0f0 2px, #00f 4px, #333 6px)' },
    { id: 'rgb-split', name: 'RGB Split', preview: 'linear-gradient(to right, #f00, #0f0, #00f)' },
    { id: 'digital', name: 'Digital', preview: 'repeating-linear-gradient(45deg, #333 0px, #666 10px, #333 20px)' },
  ],
  light: [
    { id: 'flash', name: 'Blitz', preview: 'radial-gradient(circle at center, #fff, #333)' },
    { id: 'lens-flare', name: 'Lens Flare', preview: 'radial-gradient(ellipse at 30% 30%, #ffa, #333)' },
    { id: 'light-leak', name: 'Lichteinfall', preview: 'linear-gradient(135deg, #f93 0%, transparent 50%, #333 100%)' },
    { id: 'sparkle', name: 'Funkeln', preview: 'radial-gradient(circle at 20% 20%, #fff 0%, transparent 10%, #333 100%)' },
  ],
};

// Transition Preview Card
const TransitionCard = ({ transition, isSelected, onSelect, onFavorite, isFavorite }) => (
  <div
    onClick={() => onSelect(transition)}
    className={`group relative aspect-video rounded-lg overflow-hidden cursor-pointer transition-all ${
      isSelected 
        ? 'ring-2 ring-[var(--accent-turquoise)]' 
        : 'hover:ring-1 hover:ring-[var(--border-normal)]'
    }`}
  >
    {/* Preview Background */}
    <div 
      className="absolute inset-0"
      style={{ background: transition.preview }}
    />
    
    {/* Overlay */}
    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
    
    {/* Name */}
    <div className="absolute bottom-1 left-1 right-1 text-xs text-white truncate text-center">
      {transition.name}
    </div>
    
    {/* Favorite Button */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        onFavorite(transition.id);
      }}
      className={`absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
        isFavorite ? 'bg-yellow-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
      }`}
    >
      <Icon name="star" size={12} />
    </button>
  </div>
);

export default function TransitionPicker({ 
  clipA,
  clipB,
  onApply,
  onClose 
}) {
  const [activeCategory, setActiveCategory] = useState('basic');
  const [selectedTransition, setSelectedTransition] = useState(null);
  const [duration, setDuration] = useState(0.5); // Sekunden
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleFavorite = useCallback((id) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(f => f !== id) 
        : [...prev, id]
    );
  }, []);
  
  const handleApply = useCallback(() => {
    if (selectedTransition) {
      onApply?.({
        type: selectedTransition.id,
        name: selectedTransition.name,
        duration,
        clipAId: clipA?.id,
        clipBId: clipB?.id,
      });
    }
  }, [selectedTransition, duration, clipA, clipB, onApply]);
  
  // Filtere Transitions nach Suche
  const filteredTransitions = TRANSITIONS[activeCategory]?.filter(t => 
    searchQuery ? t.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
  ) || [];
  
  // Favoriten-Liste
  const favoriteTransitions = Object.values(TRANSITIONS)
    .flat()
    .filter(t => favorites.includes(t.id));
  
  return (
    <div className="bg-[var(--bg-panel)] rounded-lg border border-[var(--border-subtle)] overflow-hidden w-[400px]">
      {/* Header */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Icon name="transitions" size={16} className="text-[var(--accent-turquoise)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">Übergänge</span>
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
          {/* Favorites Category */}
          {favorites.length > 0 && (
            <button
              onClick={() => setActiveCategory('favorites')}
              className={`w-full h-9 px-3 flex items-center gap-2 text-xs transition-colors ${
                activeCategory === 'favorites'
                  ? 'bg-[var(--bg-panel)] text-[var(--accent-turquoise)] font-medium'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <Icon name="star" size={14} />
              <span>Favoriten</span>
            </button>
          )}
          
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full h-9 px-3 flex items-center gap-2 text-xs transition-colors ${
                activeCategory === cat.id
                  ? 'bg-[var(--bg-panel)] text-[var(--accent-turquoise)] font-medium'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <Icon name={cat.icon} size={14} />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
        
        {/* Right: Transitions Grid */}
        <div className="flex-1 flex flex-col">
          {/* Search */}
          <div className="p-3 border-b border-[var(--border-subtle)]">
            <div className="relative">
              <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Suchen..."
                className="w-full h-8 pl-9 pr-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-turquoise)]"
              />
            </div>
          </div>
          
          {/* Grid */}
          <div className="flex-1 p-3 overflow-y-auto">
            <div className="grid grid-cols-3 gap-2">
              {(activeCategory === 'favorites' ? favoriteTransitions : filteredTransitions).map(transition => (
                <TransitionCard
                  key={transition.id}
                  transition={transition}
                  isSelected={selectedTransition?.id === transition.id}
                  onSelect={setSelectedTransition}
                  onFavorite={handleFavorite}
                  isFavorite={favorites.includes(transition.id)}
                />
              ))}
            </div>
            
            {filteredTransitions.length === 0 && activeCategory !== 'favorites' && (
              <div className="text-center text-xs text-[var(--text-tertiary)] py-8">
                Keine Übergänge gefunden
              </div>
            )}
          </div>
          
          {/* Duration & Apply */}
          <div className="p-3 border-t border-[var(--border-subtle)] space-y-3">
            {/* Duration Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[var(--text-secondary)]">Dauer</span>
                <span className="text-xs text-[var(--text-primary)]">{duration.toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={duration}
                onChange={(e) => setDuration(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[var(--bg-surface)] rounded appearance-none cursor-pointer"
              />
            </div>
            
            {/* Apply Button */}
            <button
              onClick={handleApply}
              disabled={!selectedTransition}
              className="w-full h-9 bg-[var(--accent-turquoise)] text-white rounded text-xs font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Icon name="check" size={14} />
              Übergang anwenden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
