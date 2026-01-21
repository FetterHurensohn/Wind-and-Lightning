/**
 * FeatureTiles.jsx - Feature-Kacheln mit allen KI-Funktionen
 * 
 * Öffnet verschiedene Feature-Panels:
 * - KI-Model Einstellungen
 * - Text-to-Video
 * - Auto-Captions
 * - Musik Generator
 * - Voice Generator
 * - Background Remover
 * - Effects & Filters
 * - und mehr...
 */

import React, { useState } from 'react';
import { SparklesIcon, ScissorsIcon, MicIcon, WandIcon, DialogIcon } from '../../icons';
import AIFeaturesPanel from '../editor/AIFeaturesPanel';
import { AISettingsPanel } from '../editor/AIModelSelectorUI';
import AutoCaptionPanel from '../editor/AutoCaptionPanel';
import {
  TextToVideoPanel,
  ImageGeneratorPanel,
  MusicGeneratorPanel,
  VoiceGeneratorPanel,
  BackgroundRemoverPanel,
  EffectsPanel,
  TransitionsPanel,
  AudioMixerPanel
} from '../editor/FeatureModals';

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
      id: 'text-to-video', 
      label: 'Text-zu-Video', 
      icon: WandIcon, 
      color: '#8b5cf6',
      badge: 'AI',
      modal: 'text-to-video'
    },
    { 
      id: 'auto-captions', 
      label: 'Auto-Untertitel', 
      icon: DialogIcon, 
      color: 'var(--accent-primary)',
      modal: 'auto-captions'
    },
    { 
      id: 'voice-gen', 
      label: 'Sprachausgabe', 
      icon: MicIcon, 
      color: '#22c55e',
      badge: 'TTS',
      modal: 'voice-generator'
    },
    { 
      id: 'music-gen', 
      label: 'Musik-Generator', 
      icon: () => (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ), 
      color: '#f97316',
      badge: 'AI',
      modal: 'music-generator'
    },
    { 
      id: 'bg-remove', 
      label: 'Hintergrund entf.', 
      icon: ScissorsIcon, 
      color: '#ec4899',
      modal: 'bg-remover'
    },
    { 
      id: 'effects', 
      label: 'Effekte & Filter', 
      icon: () => (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ), 
      color: '#06b6d4',
      modal: 'effects'
    },
    { 
      id: 'transitions', 
      label: 'Übergänge', 
      icon: () => (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ), 
      color: '#a855f7',
      modal: 'transitions'
    },
    { 
      id: 'audio-mixer', 
      label: 'Audio Mixer', 
      icon: () => (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ), 
      color: '#14b8a6',
      modal: 'audio-mixer'
    },
    { 
      id: 'image-gen', 
      label: 'Bild-Generator', 
      icon: () => (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ), 
      color: '#8b5cf6',
      badge: 'AI',
      modal: 'image-generator'
    },
    { 
      id: 'ai-features', 
      label: 'Mehr KI-Tools', 
      icon: SparklesIcon, 
      color: 'linear-gradient(135deg, #00d4aa 0%, #a855f7 100%)',
      isGradient: true,
      modal: 'ai-features'
    }
  ];

  const handleClick = (tile) => {
    setActiveModal(tile.modal);
  };
  
  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const renderModal = () => {
    switch (activeModal) {
      case 'ai-settings':
        return <AISettingsPanel onClose={handleCloseModal} />;
      case 'ai-features':
        return <AIFeaturesPanel onClose={handleCloseModal} />;
      case 'auto-captions':
        return <AutoCaptionPanel onClose={handleCloseModal} />;
      case 'text-to-video':
        return <TextToVideoPanel onClose={handleCloseModal} />;
      case 'image-generator':
        return <ImageGeneratorPanel onClose={handleCloseModal} />;
      case 'music-generator':
        return <MusicGeneratorPanel onClose={handleCloseModal} />;
      case 'voice-generator':
        return <VoiceGeneratorPanel onClose={handleCloseModal} />;
      case 'bg-remover':
        return <BackgroundRemoverPanel onClose={handleCloseModal} />;
      case 'effects':
        return <EffectsPanel onClose={handleCloseModal} />;
      case 'transitions':
        return <TransitionsPanel onClose={handleCloseModal} />;
      case 'audio-mixer':
        return <AudioMixerPanel onClose={handleCloseModal} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2" data-testid="feature-tiles">
        {tiles.map(tile => {
          const Icon = tile.icon;
          
          return (
            <button
              key={tile.id}
              onClick={() => handleClick(tile)}
              className="flex items-center gap-3 px-3 h-14 rounded-lg bg-[var(--panel)] border border-[var(--border)] hover:bg-[var(--hover)] hover:border-[var(--accent-primary)] transition focus:ring-2 focus:ring-offset-1 focus:ring-[var(--accent-primary)] flex-shrink-0"
              aria-label={tile.label}
              data-testid={`tile-${tile.id}`}
            >
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: tile.isGradient ? tile.color : tile.color }}
              >
                {typeof Icon === 'function' ? <Icon className="w-5 h-5 text-white" /> : <Icon className="w-5 h-5 text-white" />}
              </div>
              
              <span className="text-sm font-medium text-[var(--text)] whitespace-nowrap">
                {tile.label}
              </span>
              
              {tile.badge && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  tile.badge === 'PRO' 
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                    : tile.badge === 'AI'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : tile.badge === 'TTS'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-[var(--accent-primary)] text-white'
                }`}>
                  {tile.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Modal Overlay */}
      {activeModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
          onClick={(e) => e.target === e.currentTarget && handleCloseModal()}
        >
          <div className="animate-scaleIn">
            {renderModal()}
          </div>
        </div>
      )}
    </>
  );
}
