/**
 * KeyframeEditor.jsx - Keyframe Animation System (wie CapCut)
 * 
 * Ermöglicht Animation von:
 * - Position (X, Y)
 * - Scale
 * - Rotation
 * - Opacity
 * - Volume (für Audio)
 * 
 * Features:
 * - Timeline mit Keyframe-Punkten
 * - Easing-Kurven (Linear, Ease In/Out, Bezier)
 * - Keyframe hinzufügen/entfernen
 * - Werte interpolieren
 */

import React, { useState, useMemo, useCallback } from 'react';
import Icon from './Icon';

// Easing Functions
const easingFunctions = {
  linear: t => t,
  easeIn: t => t * t,
  easeOut: t => t * (2 - t),
  easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: t => t * t * t,
  easeOutCubic: t => (--t) * t * t + 1,
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
};

// Interpolate zwischen zwei Keyframes
export function interpolateValue(keyframes, time, property) {
  if (!keyframes || keyframes.length === 0) return null;
  
  // Sortiere Keyframes nach Zeit
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  
  // Finde umgebende Keyframes
  let before = null;
  let after = null;
  
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].time <= time) {
      before = sorted[i];
    }
    if (sorted[i].time >= time && !after) {
      after = sorted[i];
    }
  }
  
  // Edge Cases
  if (!before) return after?.values?.[property] ?? null;
  if (!after) return before?.values?.[property] ?? null;
  if (before === after) return before.values?.[property] ?? null;
  
  // Interpolation
  const t = (time - before.time) / (after.time - before.time);
  const easing = easingFunctions[before.easing || 'linear'];
  const easedT = easing(t);
  
  const startValue = before.values?.[property] ?? 0;
  const endValue = after.values?.[property] ?? 0;
  
  return startValue + (endValue - startValue) * easedT;
}

// Property Row Component
const PropertyRow = ({ 
  label, 
  property, 
  value, 
  keyframes, 
  currentTime, 
  clipStart,
  clipDuration,
  onValueChange, 
  onAddKeyframe, 
  onRemoveKeyframe,
  min = 0,
  max = 100,
  step = 1,
  unit = ''
}) => {
  const relativeTime = currentTime - clipStart;
  const hasKeyframeAtTime = keyframes?.some(kf => Math.abs(kf.time - relativeTime) < 0.1);
  
  return (
    <div className="flex items-center gap-2 h-8">
      {/* Label */}
      <div className="w-20 text-xs text-[var(--text-secondary)] truncate">{label}</div>
      
      {/* Value Input */}
      <div className="flex-1 flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onValueChange(property, parseFloat(e.target.value))}
          className="flex-1 h-1 bg-[var(--bg-surface)] rounded appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent-turquoise)]"
        />
        <input
          type="number"
          value={value}
          onChange={(e) => onValueChange(property, parseFloat(e.target.value))}
          className="w-14 h-6 px-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs text-center text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-turquoise)]"
        />
        <span className="text-xs text-[var(--text-tertiary)] w-4">{unit}</span>
      </div>
      
      {/* Keyframe Button */}
      <button
        onClick={() => hasKeyframeAtTime ? onRemoveKeyframe(property, relativeTime) : onAddKeyframe(property, relativeTime, value)}
        className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
          hasKeyframeAtTime 
            ? 'bg-[var(--accent-turquoise)] text-white' 
            : 'bg-[var(--bg-surface)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
        }`}
        title={hasKeyframeAtTime ? 'Keyframe entfernen' : 'Keyframe hinzufügen'}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 1L11 6L6 11L1 6L6 1Z" />
        </svg>
      </button>
    </div>
  );
};

// Keyframe Timeline Component
const KeyframeTimeline = ({ 
  keyframes, 
  duration, 
  currentTime, 
  clipStart,
  property,
  onSelectKeyframe,
  onMoveKeyframe,
  selectedKeyframe
}) => {
  const relativeTime = currentTime - clipStart;
  const pxPerSec = 100; // Pixel pro Sekunde
  
  return (
    <div className="relative h-6 bg-[var(--bg-surface)] rounded overflow-hidden">
      {/* Timeline Background */}
      <div className="absolute inset-0">
        {/* Time Markers */}
        {Array.from({ length: Math.ceil(duration) + 1 }).map((_, i) => (
          <div 
            key={i}
            className="absolute top-0 bottom-0 w-px bg-[var(--border-subtle)]"
            style={{ left: `${(i / duration) * 100}%` }}
          />
        ))}
      </div>
      
      {/* Keyframes */}
      {keyframes?.filter(kf => kf.values?.[property] !== undefined).map((kf, idx) => (
        <div
          key={idx}
          className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 cursor-pointer transform rotate-45 transition-colors ${
            selectedKeyframe === idx 
              ? 'bg-[var(--accent-turquoise)] ring-2 ring-white' 
              : 'bg-[var(--accent-purple)] hover:bg-[var(--accent-turquoise)]'
          }`}
          style={{ left: `${(kf.time / duration) * 100}%`, marginLeft: '-6px' }}
          onClick={() => onSelectKeyframe(idx)}
          title={`${kf.time.toFixed(2)}s: ${kf.values[property]}`}
        />
      ))}
      
      {/* Current Time Indicator */}
      <div 
        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
        style={{ left: `${(relativeTime / duration) * 100}%` }}
      />
    </div>
  );
};

export default function KeyframeEditor({ 
  clip, 
  currentTime,
  onUpdateKeyframes,
  onClose 
}) {
  const [activeProperty, setActiveProperty] = useState('opacity');
  const [selectedKeyframe, setSelectedKeyframe] = useState(null);
  const [keyframes, setKeyframes] = useState(clip?.keyframes || []);
  
  // Berechne aktuelle Werte basierend auf Keyframes
  const currentValues = useMemo(() => {
    const relativeTime = currentTime - (clip?.start || 0);
    return {
      opacity: interpolateValue(keyframes, relativeTime, 'opacity') ?? clip?.props?.opacity ?? 100,
      scale: interpolateValue(keyframes, relativeTime, 'scale') ?? clip?.props?.scale ?? 100,
      rotation: interpolateValue(keyframes, relativeTime, 'rotation') ?? clip?.props?.rotation ?? 0,
      posX: interpolateValue(keyframes, relativeTime, 'posX') ?? 0,
      posY: interpolateValue(keyframes, relativeTime, 'posY') ?? 0,
      volume: interpolateValue(keyframes, relativeTime, 'volume') ?? clip?.props?.volume ?? 100,
    };
  }, [keyframes, currentTime, clip]);
  
  const handleValueChange = useCallback((property, value) => {
    // Update lokaler State für Preview
    // In echtem Szenario würde dies den Clip-State updaten
  }, []);
  
  const handleAddKeyframe = useCallback((property, time, value) => {
    const newKeyframe = {
      time,
      easing: 'easeInOut',
      values: { [property]: value }
    };
    
    // Prüfe ob bereits ein Keyframe an dieser Zeit existiert
    const existingIndex = keyframes.findIndex(kf => Math.abs(kf.time - time) < 0.1);
    
    if (existingIndex >= 0) {
      // Update existierenden Keyframe
      const updated = [...keyframes];
      updated[existingIndex] = {
        ...updated[existingIndex],
        values: { ...updated[existingIndex].values, [property]: value }
      };
      setKeyframes(updated);
      onUpdateKeyframes?.(updated);
    } else {
      // Füge neuen Keyframe hinzu
      const updated = [...keyframes, newKeyframe].sort((a, b) => a.time - b.time);
      setKeyframes(updated);
      onUpdateKeyframes?.(updated);
    }
  }, [keyframes, onUpdateKeyframes]);
  
  const handleRemoveKeyframe = useCallback((property, time) => {
    const updated = keyframes.filter(kf => Math.abs(kf.time - time) >= 0.1);
    setKeyframes(updated);
    onUpdateKeyframes?.(updated);
  }, [keyframes, onUpdateKeyframes]);
  
  const properties = [
    { key: 'opacity', label: 'Deckkraft', min: 0, max: 100, unit: '%' },
    { key: 'scale', label: 'Skalierung', min: 10, max: 500, unit: '%' },
    { key: 'rotation', label: 'Rotation', min: -360, max: 360, unit: '°' },
    { key: 'posX', label: 'Position X', min: -1000, max: 1000, unit: 'px' },
    { key: 'posY', label: 'Position Y', min: -1000, max: 1000, unit: 'px' },
  ];
  
  if (clip?.type === 'audio') {
    properties.push({ key: 'volume', label: 'Lautstärke', min: 0, max: 200, unit: '%' });
  }
  
  return (
    <div className="bg-[var(--bg-panel)] rounded-lg border border-[var(--border-subtle)] overflow-hidden">
      {/* Header */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-[var(--accent-turquoise)]">
            <path d="M8 2L14 8L8 14L2 8L8 2Z" />
          </svg>
          <span className="text-sm font-medium text-[var(--text-primary)]">Keyframe Animation</span>
          <span className="text-xs text-[var(--text-tertiary)]">{clip?.title}</span>
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
        {/* Property Controls */}
        <div className="space-y-2">
          {properties.map(prop => (
            <PropertyRow
              key={prop.key}
              label={prop.label}
              property={prop.key}
              value={currentValues[prop.key]}
              keyframes={keyframes}
              currentTime={currentTime}
              clipStart={clip?.start || 0}
              clipDuration={clip?.duration || 5}
              onValueChange={handleValueChange}
              onAddKeyframe={handleAddKeyframe}
              onRemoveKeyframe={handleRemoveKeyframe}
              min={prop.min}
              max={prop.max}
              unit={prop.unit}
            />
          ))}
        </div>
        
        {/* Keyframe Timeline */}
        <div className="space-y-2">
          <div className="text-xs text-[var(--text-secondary)] font-medium">Keyframe Timeline</div>
          <div className="space-y-1">
            {properties.map(prop => (
              <div key={prop.key} className="flex items-center gap-2">
                <div className="w-20 text-xs text-[var(--text-tertiary)] truncate">{prop.label}</div>
                <div className="flex-1">
                  <KeyframeTimeline
                    keyframes={keyframes}
                    duration={clip?.duration || 5}
                    currentTime={currentTime}
                    clipStart={clip?.start || 0}
                    property={prop.key}
                    onSelectKeyframe={setSelectedKeyframe}
                    selectedKeyframe={selectedKeyframe}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Easing Selector */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-[var(--text-secondary)]">Easing:</span>
          <div className="flex gap-1">
            {['linear', 'easeIn', 'easeOut', 'easeInOut'].map(easing => (
              <button
                key={easing}
                className="px-2 py-1 text-xs rounded bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                {easing === 'linear' ? 'Linear' : 
                 easing === 'easeIn' ? 'Ease In' :
                 easing === 'easeOut' ? 'Ease Out' : 'Ease In/Out'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
