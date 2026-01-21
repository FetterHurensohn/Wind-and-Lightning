/**
 * FeatureTiles.jsx - Feature-Kacheln unter Hero
 * 
 * 5 Tiles: KI-Model, Automatisch ausschneiden, Sprachausgabe, Qualität optimieren, KI-Dialogszene
 * Mit echten Modal-Integrationen für KI-Funktionen
 */

import React, { useState } from 'react';
import { SparklesIcon, ScissorsIcon, MicIcon, WandIcon, DialogIcon } from '../../icons';
import AIFeaturesPanel from '../editor/AIFeaturesPanel';
import { AISettingsPanel } from '../editor/AIModelSelectorUI';

export default function FeatureTiles() {
  const [activeModal, setActiveModal] = useState(null);
  
  const tiles = [
    { 
      id: 'ki-model', 
      label: 'KI-Model', 
      icon: SparklesIcon, 
      color: 'var(--accent-pro)',
      badge: 'NEU',
      modal: 'ai-settings'
    },
    { 
      id: 'ausschneiden', 
      label: 'Automatisch ausschneiden', 
      icon: ScissorsIcon, 
      color: 'var(--accent-primary)',
      hasDropdown: true,
      modal: 'ai-features'
    },
    { 
      id: 'sprachausgabe', 
      label: 'Sprachausgabe', 
      icon: MicIcon, 
      color: '#f97316',
      badge: 'PRO',
      modal: 'ai-features'
    },
    { 
      id: 'qualitaet', 
      label: 'Qualität optimieren', 
      icon: WandIcon, 
      color: 'var(--accent-pro)',
      hasDropdown: true,
      modal: 'ai-features'
    },
    { 
      id: 'dialog', 
      label: 'KI-Dialogszene', 
      icon: DialogIcon, 
      color: '#f97316',
      modal: 'ai-features'
    }
  ];

  const handleClick = (tile) => {
    setActiveModal(tile.modal);
  };
  
  const handleCloseModal = () => {
    setActiveModal(null);
  };
  
  const handleApplyAI = (result) => {
    console.log('AI Result applied:', result);
    setActiveModal(null);
  };

  return (
    <>
      <div className="flex gap-3 overflow-x-auto" data-testid="feature-tiles">
        {tiles.map(tile => {
          const Icon = tile.icon;
          
          return (
            <button
              key={tile.id}
              onClick={() => handleClick(tile)}
              className="flex items-center gap-3 px-3 h-14 rounded-lg bg-[var(--panel)] border border-[var(--border)] hover:bg-[var(--hover)] transition focus:ring-2 focus:ring-offset-1 focus:ring-[var(--accent-primary)] flex-shrink-0"
              aria-label={tile.label}
              data-testid={`tile-${tile.id}`}
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
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  tile.badge === 'PRO' 
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                    : 'bg-[var(--accent-primary)] text-white'
                }`}>
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
      
      {/* AI Features Modal */}
      {activeModal === 'ai-features' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="animate-scaleIn">
            <AIFeaturesPanel 
              onClose={handleCloseModal}
              onApply={handleApplyAI}
            />
          </div>
        </div>
      )}
      
      {/* AI Settings Modal */}
      {activeModal === 'ai-settings' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="animate-scaleIn">
            <AISettingsPanel onClose={handleCloseModal} />
          </div>
        </div>
      )}
    </>
  );
}
