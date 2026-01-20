/**
 * Audio Mixer Component
 * Vollständiger Audiomixer mit Effekten und Metering
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Icon from './editor/Icon';

// VU Meter Component
const VUMeter = ({ level = 0, peak = 0 }) => {
  const dbLevel = Math.max(-60, Math.min(0, level));
  const dbPeak = Math.max(-60, Math.min(0, peak));
  const levelPercent = ((dbLevel + 60) / 60) * 100;
  const peakPercent = ((dbPeak + 60) / 60) * 100;
  
  return (
    <div className="w-4 h-full bg-[var(--bg-main)] rounded relative overflow-hidden">
      {/* Level */}
      <div 
        className="absolute bottom-0 left-0 right-0 transition-all"
        style={{ 
          height: `${levelPercent}%`,
          background: levelPercent > 85 
            ? 'linear-gradient(to top, #22c55e, #eab308, #ef4444)' 
            : 'linear-gradient(to top, #22c55e, #22c55e)'
        }}
      />
      
      {/* Peak indicator */}
      <div 
        className="absolute left-0 right-0 h-0.5 bg-red-500"
        style={{ bottom: `${peakPercent}%` }}
      />
      
      {/* Scale marks */}
      {[0, -6, -12, -24, -48].map(db => (
        <div 
          key={db}
          className="absolute left-0 right-0 h-px bg-white/20"
          style={{ bottom: `${((db + 60) / 60) * 100}%` }}
        />
      ))}
    </div>
  );
};

// Fader Component
const Fader = ({ value, onChange, muted }) => (
  <div className="relative h-32 w-6 flex items-center justify-center">
    <input
      type="range"
      min="0"
      max="100"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="absolute w-32 h-4 -rotate-90 origin-center appearance-none bg-transparent
        [&::-webkit-slider-track]:h-1 [&::-webkit-slider-track]:bg-[var(--bg-surface)] [&::-webkit-slider-track]:rounded
        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-6 
        [&::-webkit-slider-thumb]:bg-[var(--text-primary)] [&::-webkit-slider-thumb]:rounded
        [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
      style={{ opacity: muted ? 0.5 : 1 }}
    />
  </div>
);

// Pan Knob Component
const PanKnob = ({ value, onChange }) => {
  const rotation = (value / 100) * 270 - 135;
  
  return (
    <div 
      className="w-8 h-8 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] relative cursor-pointer"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const newValue = Math.round(((x / (rect.width / 2)) + 1) / 2 * 100);
        onChange(Math.max(0, Math.min(100, newValue)));
      }}
    >
      <div 
        className="absolute w-1 h-3 bg-[var(--accent-turquoise)] rounded left-1/2 -translate-x-1/2 origin-bottom"
        style={{ 
          transform: `translateX(-50%) rotate(${rotation}deg)`,
          transformOrigin: 'bottom center',
          top: '4px'
        }}
      />
    </div>
  );
};

// Channel Strip Component
const ChannelStrip = ({ track, onUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="flex flex-col items-center gap-2 p-2 bg-[var(--bg-surface)] rounded-lg w-16">
      {/* Track Name */}
      <div className="text-xs text-[var(--text-secondary)] truncate w-full text-center" title={track.name}>
        {track.name}
      </div>
      
      {/* Pan */}
      <PanKnob 
        value={track.pan + 50} 
        onChange={(v) => onUpdate(track.id, { pan: v - 50 })}
      />
      <div className="text-xs text-[var(--text-tertiary)]">
        {track.pan === 0 ? 'C' : track.pan < 0 ? `L${Math.abs(track.pan)}` : `R${track.pan}`}
      </div>
      
      {/* Meter + Fader */}
      <div className="flex gap-1 h-32">
        <VUMeter level={track.meter?.left || -60} peak={track.meter?.peak || -60} />
        <Fader 
          value={track.volume} 
          onChange={(v) => onUpdate(track.id, { volume: v })}
          muted={track.muted}
        />
        <VUMeter level={track.meter?.right || -60} peak={track.meter?.peak || -60} />
      </div>
      
      {/* Volume Display */}
      <div className="text-xs text-[var(--text-primary)] font-mono">
        {track.volume === 0 ? '-∞' : `${Math.round(20 * Math.log10(track.volume / 100))} dB`}
      </div>
      
      {/* Buttons */}
      <div className="flex gap-1">
        <button
          onClick={() => onUpdate(track.id, { muted: !track.muted })}
          className={`w-6 h-6 rounded text-xs font-bold transition-colors ${
            track.muted ? 'bg-red-500 text-white' : 'bg-[var(--bg-main)] text-[var(--text-tertiary)]'
          }`}
        >
          M
        </button>
        <button
          onClick={() => onUpdate(track.id, { solo: !track.solo })}
          className={`w-6 h-6 rounded text-xs font-bold transition-colors ${
            track.solo ? 'bg-yellow-500 text-black' : 'bg-[var(--bg-main)] text-[var(--text-tertiary)]'
          }`}
        >
          S
        </button>
      </div>
      
      {/* Record Arm */}
      {track.armed !== undefined && (
        <button
          onClick={() => onUpdate(track.id, { armed: !track.armed })}
          className={`w-10 h-6 rounded text-xs transition-colors ${
            track.armed ? 'bg-red-500 text-white animate-pulse' : 'bg-[var(--bg-main)] text-[var(--text-tertiary)]'
          }`}
        >
          REC
        </button>
      )}
    </div>
  );
};

export default function AudioMixer({ tracks, masterVolume = 100, onTrackUpdate, onMasterUpdate, onClose }) {
  const [showEffects, setShowEffects] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  
  // Mock meter animation
  const [meters, setMeters] = useState({});
  
  useEffect(() => {
    const interval = setInterval(() => {
      const newMeters = {};
      tracks?.forEach(t => {
        if (!t.muted) {
          const base = -30 + Math.random() * 20;
          newMeters[t.id] = {
            left: base + Math.random() * 5,
            right: base + Math.random() * 5,
            peak: Math.max(meters[t.id]?.peak || -60, base + 5)
          };
        } else {
          newMeters[t.id] = { left: -60, right: -60, peak: -60 };
        }
      });
      setMeters(newMeters);
    }, 100);
    
    return () => clearInterval(interval);
  }, [tracks]);
  
  const tracksWithMeters = tracks?.map(t => ({
    ...t,
    meter: meters[t.id]
  })) || [];
  
  return (
    <div className="bg-[var(--bg-panel)] rounded-lg border border-[var(--border-subtle)] overflow-hidden">
      {/* Header */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Icon name="audio" size={16} className="text-[var(--accent-turquoise)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">Audio Mixer</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEffects(!showEffects)}
            className={`px-3 h-7 rounded text-xs transition-colors ${
              showEffects 
                ? 'bg-[var(--accent-turquoise)] text-white' 
                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'
            }`}
          >
            Effekte
          </button>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      </div>
      
      {/* Mixer */}
      <div className="p-4 flex gap-2 overflow-x-auto">
        {/* Input Channels */}
        {tracksWithMeters.map(track => (
          <ChannelStrip
            key={track.id}
            track={track}
            onUpdate={onTrackUpdate}
          />
        ))}
        
        {/* Separator */}
        <div className="w-px bg-[var(--border-subtle)] mx-2" />
        
        {/* Master Channel */}
        <div className="flex flex-col items-center gap-2 p-2 bg-gradient-to-b from-[var(--accent-turquoise)]/10 to-transparent rounded-lg w-20">
          <div className="text-xs text-[var(--text-primary)] font-medium">Master</div>
          
          {/* Master Pan (locked) */}
          <div className="w-8 h-8 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-[var(--accent-turquoise)]" />
          </div>
          <div className="text-xs text-[var(--text-tertiary)]">C</div>
          
          {/* Master Meter + Fader */}
          <div className="flex gap-1 h-32">
            <VUMeter level={-20} peak={-10} />
            <Fader 
              value={masterVolume} 
              onChange={onMasterUpdate}
              muted={false}
            />
            <VUMeter level={-20} peak={-10} />
          </div>
          
          {/* Master Volume */}
          <div className="text-xs text-[var(--text-primary)] font-mono">
            {masterVolume === 0 ? '-∞' : `${Math.round(20 * Math.log10(masterVolume / 100))} dB`}
          </div>
        </div>
      </div>
      
      {/* Effects Panel */}
      {showEffects && selectedTrack && (
        <div className="p-4 border-t border-[var(--border-subtle)]">
          <div className="text-sm text-[var(--text-secondary)] mb-2">Effekte für {selectedTrack.name}</div>
          {/* Effects would go here */}
        </div>
      )}
    </div>
  );
}
