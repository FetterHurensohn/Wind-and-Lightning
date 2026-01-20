/**
 * FeatureTiles.jsx - Feature-Kacheln unter Hero
 * 
 * 5 Tiles: KI-Model, Automatisch ausschneiden, Sprachausgabe, Qualität optimieren, KI-Dialogszene
 * Annahme: Klick öffnet Info-Modal (simuliert)
 */

import React from 'react';
import { SparklesIcon, ScissorsIcon, MicIcon, WandIcon, DialogIcon } from '../../icons';

export default function FeatureTiles() {
  const tiles = [
    { 
      id: 'ki-model', 
      label: 'KI-Model', 
      icon: SparklesIcon, 
      color: 'var(--accent-pro)',
      badge: 'sterlibs ango'
    },
    { 
      id: 'ausschneiden', 
      label: 'Automatisch ausschneiden', 
      icon: ScissorsIcon, 
      color: 'var(--accent-primary)',
      hasDropdown: true
    },
    { 
      id: 'sprachausgabe', 
      label: 'Sprachausgabe', 
      icon: MicIcon, 
      color: '#f97316',
      badge: 'sterlibs ango'
    },
    { 
      id: 'qualitaet', 
      label: 'Qualität optimieren', 
      icon: WandIcon, 
      color: 'var(--accent-pro)',
      hasDropdown: true
    },
    { 
      id: 'dialog', 
      label: 'KI-Dialogszene', 
      icon: DialogIcon, 
      color: '#f97316'
    }
  ];

  const handleClick = (tileId) => {
    // Simuliert: Info-Modal oder Feature-Panel öffnen
    console.log(`Feature clicked: ${tileId}`);
    alert('Diese Funktion ist in Entwicklung');
  };

  return (
    <div className="flex gap-3 overflow-x-auto">
      {tiles.map(tile => {
        const Icon = tile.icon;
        
        return (
          <button
            key={tile.id}
            onClick={() => handleClick(tile.id)}
            className="flex items-center gap-3 px-3 h-14 rounded-lg bg-[var(--panel)] border border-[var(--border)] hover:bg-[var(--hover)] transition focus:ring-2 focus:ring-offset-1 focus:ring-[var(--accent-primary)] flex-shrink-0"
            aria-label={tile.label}
          >
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: tile.color }}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            
            <span className="text-sm font-medium text-[var(--text)] whitespace-nowrap">
              {tile.label}
            </span>
            
            {tile.badge && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-primary)] text-white font-medium">
                {tile.badge}
              </span>
            )}
            
            {tile.hasDropdown && (
              <svg className="w-4 h-4 text-[var(--muted)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}
