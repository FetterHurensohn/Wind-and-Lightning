/**
 * KeyframeEditor.jsx - Keyframe Animation Editor
 * 
 * Features:
 * - Keyframes für alle animierbaren Eigenschaften
 * - Easing-Funktionen (Linear, Ease-In, Ease-Out, Ease-In-Out)
 * - Visuelles Keyframe-Timeline
 * - Interpolation zwischen Keyframes
 */

import React, { useState, useCallback, useMemo } from 'react';
import Icon from './Icon';

// Easing-Funktionen
const easingFunctions = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => t * (2 - t),
  easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => (--t) * t * t + 1,
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  bounce: (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
};

// Animierbare Eigenschaften
const animatableProperties = [
  { id: 'posX', label: 'Position X', icon: 'arrowRight', unit: 'px', min: -1000, max: 1000, default: 0 },
  { id: 'posY', label: 'Position Y', icon: 'arrowRight', unit: 'px', min: -1000, max: 1000, default: 0 },
  { id: 'scale', label: 'Skalierung', icon: 'expand', unit: '%', min: 0, max: 500, default: 100 },
  { id: 'rotation', label: 'Rotation', icon: 'refresh', unit: '°', min: -360, max: 360, default: 0 },
  { id: 'opacity', label: 'Deckkraft', icon: 'eye', unit: '%', min: 0, max: 100, default: 100 },
];

// Keyframe Punkt Komponente
const KeyframePoint = ({ keyframe, isSelected, onClick, property, pxPerSec = 50 }) => {
  const left = keyframe.time * pxPerSec;
  
  return (
    <div
      className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 cursor-pointer transition-all ${
        isSelected 
          ? 'bg-[var(--accent-turquoise)] scale-125' 
          : 'bg-yellow-400 hover:scale-110'
      }`}
      style={{ 
        left: `${left}px`,
        transform: 'translateY(-50%) rotate(45deg)',
        marginLeft: '-6px'
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(keyframe);
      }}
      title={`${property.label}: ${keyframe.value}${property.unit} @ ${keyframe.time.toFixed(2)}s`}
    />
  );
};

// Keyframe Row Komponente
const KeyframeRow = ({ 
  property, 
  keyframes = [], 
  clipDuration, 
  currentTime,
  pxPerSec,
  selectedKeyframe,
  onSelectKeyframe,
  onAddKeyframe,
  currentValue
}) => {
  const hasKeyframes = keyframes.length > 0;
  
  return (
    <div className="flex items-center h-8 border-b border-[var(--border-subtle)]">
      {/* Property Label */}
      <div className="w-32 px-3 flex items-center gap-2 flex-shrink-0 bg-[var(--bg-panel)]">
        <Icon name={property.icon} size={12} className="text-[var(--text-tertiary)]" />
        <span className="text-xs text-[var(--text-secondary)] truncate">{property.label}</span>
      </div>
      
      {/* Keyframe Toggle */}
      <button
        onClick={() => onAddKeyframe(property.id, currentTime, currentValue)}
        className={`w-6 h-6 flex items-center justify-center flex-shrink-0 ${
          hasKeyframes ? 'text-yellow-400' : 'text-[var(--text-tertiary)] hover:text-yellow-400'
        }`}
        title="Keyframe hinzufügen"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 0L12 6L6 12L0 6L6 0Z" />
        </svg>
      </button>
      
      {/* Keyframe Timeline */}
      <div 
        className="flex-1 h-full relative bg-[var(--bg-surface)] overflow-hidden"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const time = x / pxPerSec;
          if (time >= 0 && time <= clipDuration) {
            onAddKeyframe(property.id, time, currentValue);
          }
        }}
      >
        {/* Timeline Grid */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, var(--border-subtle) 0px, var(--border-subtle) 1px, transparent 1px, transparent ${pxPerSec}px)`
          }}
        />
        
        {/* Current Time Indicator */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
          style={{ left: `${currentTime * pxPerSec}px` }}
        />
        
        {/* Keyframes */}
        {keyframes.map((kf, idx) => (
          <KeyframePoint
            key={idx}
            keyframe={kf}
            isSelected={selectedKeyframe?.property === property.id && selectedKeyframe?.time === kf.time}
            onClick={() => onSelectKeyframe({ property: property.id, time: kf.time, ...kf })}
            property={property}
            pxPerSec={pxPerSec}
          />
        ))}
        
        {/* Interpolation Line */}
        {keyframes.length >= 2 && (
          <svg className="absolute inset-0 pointer-events-none" style={{ width: clipDuration * pxPerSec }}>
            <polyline
              points={keyframes.map(kf => `${kf.time * pxPerSec},16`).join(' ')}
              fill="none"
              stroke="rgba(250, 204, 21, 0.5)"
              strokeWidth="2"
            />
          </svg>
        )}
      </div>
    </div>
  );
};

export default function KeyframeEditor({ 
  clip, 
  currentTime, 
  onUpdateKeyframes,
  onClose 
}) {
  const [selectedKeyframe, setSelectedKeyframe] = useState(null);
  const [pxPerSec, setPxPerSec] = useState(80);
  
  // Keyframes aus Clip extrahieren
  const keyframes = clip?.keyframes || {};
  const clipStart = clip?.start || 0;
  const clipDuration = clip?.duration || 5;
  const clipTime = Math.max(0, Math.min(currentTime - clipStart, clipDuration));
  
  // Aktuellen interpolierten Wert für eine Property berechnen
  const getInterpolatedValue = useCallback((propertyId) => {
    const propKeyframes = keyframes[propertyId] || [];
    const property = animatableProperties.find(p => p.id === propertyId);
    const defaultValue = property?.default || 0;
    
    if (propKeyframes.length === 0) {
      return clip?.props?.[propertyId] ?? defaultValue;
    }
    
    const sorted = [...propKeyframes].sort((a, b) => a.time - b.time);
    
    if (clipTime <= sorted[0].time) return sorted[0].value;
    if (clipTime >= sorted[sorted.length - 1].time) return sorted[sorted.length - 1].value;
    
    for (let i = 0; i < sorted.length - 1; i++) {
      const kf1 = sorted[i];
      const kf2 = sorted[i + 1];
      
      if (clipTime >= kf1.time && clipTime <= kf2.time) {
        const t = (clipTime - kf1.time) / (kf2.time - kf1.time);
        const easing = easingFunctions[kf1.easing || 'linear'];
        return kf1.value + (kf2.value - kf1.value) * easing(t);
      }
    }
    
    return defaultValue;
  }, [keyframes, clipTime, clip]);
  
  // Keyframe hinzufügen
  const handleAddKeyframe = useCallback((propertyId, time, value) => {
    const propKeyframes = [...(keyframes[propertyId] || [])];
    const existingIdx = propKeyframes.findIndex(kf => Math.abs(kf.time - time) < 0.05);
    
    if (existingIdx >= 0) {
      propKeyframes[existingIdx] = { ...propKeyframes[existingIdx], value };
    } else {
      propKeyframes.push({ time, value, easing: 'easeInOut' });
    }
    
    propKeyframes.sort((a, b) => a.time - b.time);
    onUpdateKeyframes({ ...keyframes, [propertyId]: propKeyframes });
  }, [keyframes, onUpdateKeyframes]);
  
  // Keyframe löschen
  const handleDeleteKeyframe = useCallback((propertyId, time) => {
    const propKeyframes = (keyframes[propertyId] || []).filter(kf => kf.time !== time);
    onUpdateKeyframes({ ...keyframes, [propertyId]: propKeyframes });
    setSelectedKeyframe(null);
  }, [keyframes, onUpdateKeyframes]);
  
  // Easing ändern
  const handleChangeEasing = useCallback((easing) => {
    if (!selectedKeyframe) return;
    
    const propKeyframes = [...(keyframes[selectedKeyframe.property] || [])];
    const idx = propKeyframes.findIndex(kf => kf.time === selectedKeyframe.time);
    
    if (idx >= 0) {
      propKeyframes[idx] = { ...propKeyframes[idx], easing };
      onUpdateKeyframes({ ...keyframes, [selectedKeyframe.property]: propKeyframes });
      setSelectedKeyframe({ ...selectedKeyframe, easing });
    }
  }, [selectedKeyframe, keyframes, onUpdateKeyframes]);
  
  if (!clip) return null;
  
  return (
    <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg overflow-hidden shadow-xl">
      {/* Header */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" className="text-yellow-400">
            <path d="M7 0L14 7L7 14L0 7L7 0Z" />
          </svg>
          <span className="text-sm font-medium text-[var(--text-primary)]">Keyframes</span>
          <span className="text-xs text-[var(--text-tertiary)]">- {clip.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setPxPerSec(Math.max(20, pxPerSec - 20))}
              className="w-6 h-6 flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded"
            >
              <Icon name="minus" size={12} />
            </button>
            <span className="text-xs text-[var(--text-tertiary)] w-12 text-center">{pxPerSec}px/s</span>
            <button 
              onClick={() => setPxPerSec(Math.min(200, pxPerSec + 20))}
              className="w-6 h-6 flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded"
            >
              <Icon name="plus" size={12} />
            </button>
          </div>
          <button 
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      </div>
      
      {/* Keyframe Rows */}
      <div className="max-h-64 overflow-y-auto">
        {animatableProperties.map(property => (
          <KeyframeRow
            key={property.id}
            property={property}
            keyframes={keyframes[property.id] || []}
            clipDuration={clipDuration}
            currentTime={clipTime}
            pxPerSec={pxPerSec}
            selectedKeyframe={selectedKeyframe}
            onSelectKeyframe={setSelectedKeyframe}
            onAddKeyframe={handleAddKeyframe}
            currentValue={getInterpolatedValue(property.id)}
          />
        ))}
      </div>
      
      {/* Selected Keyframe Details */}
      {selectedKeyframe && (
        <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--text-secondary)]">
              {animatableProperties.find(p => p.id === selectedKeyframe.property)?.label} 
              @ {selectedKeyframe.time.toFixed(2)}s
            </span>
            <button
              onClick={() => handleDeleteKeyframe(selectedKeyframe.property, selectedKeyframe.time)}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Löschen
            </button>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {Object.keys(easingFunctions).map(easing => (
              <button
                key={easing}
                onClick={() => handleChangeEasing(easing)}
                className={`px-2 py-1 text-[10px] rounded transition-colors ${
                  selectedKeyframe.easing === easing
                    ? 'bg-[var(--accent-turquoise)] text-white'
                    : 'bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                {easing}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Footer Hint */}
      <div className="px-3 py-2 bg-[var(--bg-main)] border-t border-[var(--border-subtle)]">
        <p className="text-[10px] text-[var(--text-tertiary)]">
          💡 Klicke auf die Timeline, um Keyframes hinzuzufügen. Wähle einen Keyframe, um das Easing zu ändern.
        </p>
      </div>
    </div>
  );
}

// Export Interpolation Helper
export { easingFunctions, animatableProperties };

export function interpolateKeyframes(keyframes, propertyId, time, defaultValue = 0) {
  const propKeyframes = keyframes?.[propertyId] || [];
  
  if (propKeyframes.length === 0) return defaultValue;
  
  const sorted = [...propKeyframes].sort((a, b) => a.time - b.time);
  
  if (time <= sorted[0].time) return sorted[0].value;
  if (time >= sorted[sorted.length - 1].time) return sorted[sorted.length - 1].value;
  
  for (let i = 0; i < sorted.length - 1; i++) {
    const kf1 = sorted[i];
    const kf2 = sorted[i + 1];
    
    if (time >= kf1.time && time <= kf2.time) {
      const t = (time - kf1.time) / (kf2.time - kf1.time);
      const easing = easingFunctions[kf1.easing || 'linear'];
      return kf1.value + (kf2.value - kf1.value) * easing(t);
    }
  }
  
  return defaultValue;
}
