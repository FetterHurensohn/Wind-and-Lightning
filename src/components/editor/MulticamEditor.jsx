/**
 * Multicam Editor Component
 * Synchronisierte Multi-Kamera Bearbeitung
 */

import React, { useState, useCallback, useMemo } from 'react';
import Icon from './editor/Icon';

export default function MulticamEditor({ clips, onSwitch, onClose }) {
  const [activeAngle, setActiveAngle] = useState(0);
  const [syncPoint, setSyncPoint] = useState(0);
  const [previewMode, setPreviewMode] = useState('grid'); // 'grid' | 'single' | 'pip'
  
  const handleSwitchAngle = useCallback((index, time) => {
    setActiveAngle(index);
    onSwitch?.({
      angleIndex: index,
      clip: clips[index],
      switchTime: time
    });
  }, [clips, onSwitch]);
  
  const syncedClips = useMemo(() => {
    if (!clips?.length) return [];
    
    return clips.map((clip, index) => ({
      ...clip,
      angle: index + 1,
      offset: clip.syncOffset || 0,
      isActive: index === activeAngle
    }));
  }, [clips, activeAngle]);
  
  return (
    <div className="bg-[var(--bg-panel)] rounded-lg border border-[var(--border-subtle)] overflow-hidden">
      {/* Header */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Icon name="video" size={16} className="text-[var(--accent-turquoise)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">Multicam Editor</span>
          <span className="text-xs text-[var(--text-tertiary)]">{clips?.length || 0} Kameras</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Preview Mode */}
          <div className="flex gap-1 bg-[var(--bg-surface)] p-1 rounded">
            {['grid', 'single', 'pip'].map(mode => (
              <button
                key={mode}
                onClick={() => setPreviewMode(mode)}
                className={`w-7 h-6 rounded text-xs transition-colors ${
                  previewMode === mode
                    ? 'bg-[var(--bg-panel)] text-[var(--text-primary)]'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {mode === 'grid' ? '▦' : mode === 'single' ? '□' : '▧'}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      </div>
      
      {/* Preview Grid */}
      <div className="p-4">
        <div className={`grid gap-2 ${
          previewMode === 'grid' 
            ? 'grid-cols-2' 
            : previewMode === 'pip'
            ? 'grid-cols-1'
            : 'grid-cols-1'
        }`}>
          {syncedClips.map((clip, index) => (
            <div
              key={clip.id}
              onClick={() => handleSwitchAngle(index, syncPoint)}
              className={`relative aspect-video bg-black rounded-lg overflow-hidden cursor-pointer transition-all ${
                clip.isActive
                  ? 'ring-2 ring-[var(--accent-turquoise)]'
                  : 'hover:ring-1 hover:ring-white/30'
              } ${
                previewMode === 'pip' && !clip.isActive
                  ? 'absolute top-4 right-4 w-1/4'
                  : ''
              }`}
            >
              {/* Thumbnail/Preview */}
              {clip.thumbnail ? (
                <img src={clip.thumbnail} alt={clip.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--bg-surface)]">
                  <Icon name="video" size={24} className="text-[var(--text-tertiary)]" />
                </div>
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Label */}
              <div className="absolute bottom-2 left-2 flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  clip.isActive
                    ? 'bg-[var(--accent-turquoise)] text-white'
                    : 'bg-white/20 text-white'
                }`}>
                  {clip.angle}
                </span>
                <span className="text-xs text-white">{clip.name}</span>
              </div>
              
              {/* Active Indicator */}
              {clip.isActive && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Sync Controls */}
      <div className="p-4 border-t border-[var(--border-subtle)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)]">Sync-Punkt</span>
          <input
            type="number"
            value={syncPoint.toFixed(2)}
            onChange={(e) => setSyncPoint(parseFloat(e.target.value) || 0)}
            className="w-24 h-7 px-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] text-right"
            step="0.1"
          />
        </div>
        
        <div className="flex gap-2">
          <button className="flex-1 h-8 bg-[var(--bg-surface)] rounded text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Audio synchronisieren
          </button>
          <button className="flex-1 h-8 bg-[var(--bg-surface)] rounded text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Timecode synchronisieren
          </button>
        </div>
      </div>
      
      {/* Keyboard Shortcuts Info */}
      <div className="px-4 pb-4">
        <div className="p-3 bg-[var(--bg-surface)] rounded-lg">
          <div className="text-xs text-[var(--text-tertiary)]">
            <strong className="text-[var(--text-secondary)]">Tastaturkürzel:</strong> 1-9 zum Wechseln der Kamera während der Wiedergabe
          </div>
        </div>
      </div>
    </div>
  );
}
