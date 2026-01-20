/**
 * SpeedControl.jsx - Video Speed Control (wie CapCut)
 * 
 * Features:
 * - Speed Slider (0.1x - 100x)
 * - Speed Presets (0.5x, 1x, 1.5x, 2x)
 * - Speed Curve Editor (für variable Geschwindigkeit)
 * - Smooth Slow Motion (Optical Flow Simulation)
 * - Reverse Playback
 */

import React, { useState, useCallback } from 'react';
import Icon from './Icon';

// Speed Presets
const SPEED_PRESETS = [
  { value: 0.1, label: '0.1x' },
  { value: 0.25, label: '0.25x' },
  { value: 0.5, label: '0.5x' },
  { value: 0.75, label: '0.75x' },
  { value: 1, label: '1x' },
  { value: 1.5, label: '1.5x' },
  { value: 2, label: '2x' },
  { value: 4, label: '4x' },
  { value: 8, label: '8x' },
  { value: 16, label: '16x' },
];

// Speed Curve Presets
const CURVE_PRESETS = [
  { id: 'constant', name: 'Konstant', icon: 'minus' },
  { id: 'rampUp', name: 'Beschleunigen', icon: 'arrowRight' },
  { id: 'rampDown', name: 'Abbremsen', icon: 'arrowRight' },
  { id: 'flash', name: 'Flash', icon: 'effects' },
  { id: 'jump', name: 'Jump Cut', icon: 'split' },
  { id: 'montage', name: 'Montage', icon: 'transitions' },
];

// Speed Curve Editor
const SpeedCurveEditor = ({ curve, duration, onChange }) => {
  const [points, setPoints] = useState(curve?.points || [
    { time: 0, speed: 1 },
    { time: duration, speed: 1 }
  ]);
  
  const handlePointDrag = useCallback((index, newSpeed) => {
    const updated = [...points];
    updated[index] = { ...updated[index], speed: Math.max(0.1, Math.min(16, newSpeed)) };
    setPoints(updated);
    onChange?.({ points: updated });
  }, [points, onChange]);
  
  const addPoint = useCallback((time) => {
    // Interpoliere Speed an dieser Position
    const sorted = [...points].sort((a, b) => a.time - b.time);
    let speed = 1;
    
    for (let i = 0; i < sorted.length - 1; i++) {
      if (time >= sorted[i].time && time <= sorted[i + 1].time) {
        const t = (time - sorted[i].time) / (sorted[i + 1].time - sorted[i].time);
        speed = sorted[i].speed + (sorted[i + 1].speed - sorted[i].speed) * t;
        break;
      }
    }
    
    const updated = [...points, { time, speed }].sort((a, b) => a.time - b.time);
    setPoints(updated);
    onChange?.({ points: updated });
  }, [points, onChange]);
  
  return (
    <div className="relative h-32 bg-[var(--bg-surface)] rounded-lg overflow-hidden">
      {/* Grid Lines */}
      <div className="absolute inset-0">
        {[0.25, 0.5, 0.75, 1].map(y => (
          <div 
            key={y}
            className="absolute left-0 right-0 border-t border-[var(--border-subtle)]"
            style={{ top: `${(1 - y) * 100}%` }}
          />
        ))}
        {[0.25, 0.5, 0.75].map(x => (
          <div 
            key={x}
            className="absolute top-0 bottom-0 border-l border-[var(--border-subtle)]"
            style={{ left: `${x * 100}%` }}
          />
        ))}
      </div>
      
      {/* Y-Axis Labels */}
      <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-between py-2 text-xs text-[var(--text-tertiary)]">
        <span>16x</span>
        <span>8x</span>
        <span>4x</span>
        <span>1x</span>
        <span>0.1x</span>
      </div>
      
      {/* Curve Path */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="speedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-turquoise)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--accent-turquoise)" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Filled Area */}
        <path
          d={`M ${points.map((p, i) => 
            `${(p.time / duration) * 100}% ${(1 - Math.log10(p.speed * 10) / Math.log10(160)) * 100}%`
          ).join(' L ')} L 100% 100% L 0% 100% Z`}
          fill="url(#speedGradient)"
        />
        
        {/* Line */}
        <polyline
          points={points.map(p => 
            `${(p.time / duration) * 100}%,${(1 - Math.log10(p.speed * 10) / Math.log10(160)) * 100}%`
          ).join(' ')}
          fill="none"
          stroke="var(--accent-turquoise)"
          strokeWidth="2"
        />
      </svg>
      
      {/* Control Points */}
      {points.map((point, index) => (
        <div
          key={index}
          className="absolute w-3 h-3 rounded-full bg-[var(--accent-turquoise)] border-2 border-white cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform"
          style={{
            left: `${(point.time / duration) * 100}%`,
            top: `${(1 - Math.log10(point.speed * 10) / Math.log10(160)) * 100}%`
          }}
          title={`${point.time.toFixed(1)}s: ${point.speed.toFixed(2)}x`}
        />
      ))}
      
      {/* Click to Add Point */}
      <div 
        className="absolute inset-0 cursor-crosshair"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          addPoint(x * duration);
        }}
      />
    </div>
  );
};

export default function SpeedControl({ 
  clip, 
  onSpeedChange,
  onClose 
}) {
  const [speed, setSpeed] = useState(clip?.props?.speed || 1);
  const [reverse, setReverse] = useState(clip?.props?.reverse || false);
  const [smoothSlowMo, setSmoothSlowMo] = useState(clip?.props?.smoothSlowMo || false);
  const [showCurveEditor, setShowCurveEditor] = useState(false);
  const [speedCurve, setSpeedCurve] = useState(clip?.props?.speedCurve || null);
  
  const handleSpeedChange = useCallback((newSpeed) => {
    setSpeed(newSpeed);
    onSpeedChange?.({
      speed: newSpeed,
      reverse,
      smoothSlowMo,
      speedCurve
    });
  }, [reverse, smoothSlowMo, speedCurve, onSpeedChange]);
  
  const handlePresetClick = useCallback((presetValue) => {
    handleSpeedChange(presetValue);
  }, [handleSpeedChange]);
  
  const handleReverseToggle = useCallback(() => {
    setReverse(!reverse);
    onSpeedChange?.({
      speed,
      reverse: !reverse,
      smoothSlowMo,
      speedCurve
    });
  }, [speed, reverse, smoothSlowMo, speedCurve, onSpeedChange]);
  
  const handleSmoothSlowMoToggle = useCallback(() => {
    setSmoothSlowMo(!smoothSlowMo);
    onSpeedChange?.({
      speed,
      reverse,
      smoothSlowMo: !smoothSlowMo,
      speedCurve
    });
  }, [speed, reverse, smoothSlowMo, speedCurve, onSpeedChange]);
  
  // Berechne neue Clip-Dauer
  const originalDuration = clip?.originalDuration || clip?.duration || 5;
  const newDuration = originalDuration / speed;
  
  return (
    <div className="bg-[var(--bg-panel)] rounded-lg border border-[var(--border-subtle)] overflow-hidden">
      {/* Header */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Icon name="play" size={16} className="text-[var(--accent-turquoise)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">Geschwindigkeit</span>
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
        {/* Speed Display */}
        <div className="text-center">
          <div className="text-4xl font-bold text-[var(--text-primary)]">{speed.toFixed(2)}x</div>
          <div className="text-xs text-[var(--text-tertiary)] mt-1">
            {originalDuration.toFixed(1)}s → {newDuration.toFixed(1)}s
          </div>
        </div>
        
        {/* Speed Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min="0.1"
            max="16"
            step="0.1"
            value={speed}
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-[var(--bg-surface)] rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent-turquoise)]"
          />
          <div className="flex justify-between text-xs text-[var(--text-tertiary)]">
            <span>0.1x</span>
            <span>1x</span>
            <span>16x</span>
          </div>
        </div>
        
        {/* Speed Presets */}
        <div className="grid grid-cols-5 gap-2">
          {SPEED_PRESETS.slice(0, 10).map(preset => (
            <button
              key={preset.value}
              onClick={() => handlePresetClick(preset.value)}
              className={`h-8 rounded text-xs font-medium transition-colors ${
                Math.abs(speed - preset.value) < 0.05
                  ? 'bg-[var(--accent-turquoise)] text-white'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        
        {/* Options */}
        <div className="space-y-2">
          {/* Reverse */}
          <label className="flex items-center gap-3 p-3 bg-[var(--bg-surface)] rounded cursor-pointer hover:bg-[var(--bg-hover)] transition-colors">
            <input
              type="checkbox"
              checked={reverse}
              onChange={handleReverseToggle}
              className="w-4 h-4 rounded border-[var(--border-subtle)] text-[var(--accent-turquoise)] focus:ring-[var(--accent-turquoise)]"
            />
            <div className="flex-1">
              <div className="text-sm text-[var(--text-primary)]">Rückwärts abspielen</div>
              <div className="text-xs text-[var(--text-tertiary)]">Video wird rückwärts abgespielt</div>
            </div>
            <Icon name="undo" size={16} className="text-[var(--text-tertiary)]" />
          </label>
          
          {/* Smooth Slow Motion */}
          {speed < 1 && (
            <label className="flex items-center gap-3 p-3 bg-[var(--bg-surface)] rounded cursor-pointer hover:bg-[var(--bg-hover)] transition-colors">
              <input
                type="checkbox"
                checked={smoothSlowMo}
                onChange={handleSmoothSlowMoToggle}
                className="w-4 h-4 rounded border-[var(--border-subtle)] text-[var(--accent-turquoise)] focus:ring-[var(--accent-turquoise)]"
              />
              <div className="flex-1">
                <div className="text-sm text-[var(--text-primary)]">
                  Smooth Slow Motion
                  <span className="ml-2 px-1.5 py-0.5 bg-[var(--accent-purple)] text-white text-xs rounded">Pro</span>
                </div>
                <div className="text-xs text-[var(--text-tertiary)]">Optical Flow für flüssigere Zeitlupe</div>
              </div>
              <Icon name="effects" size={16} className="text-[var(--text-tertiary)]" />
            </label>
          )}
        </div>
        
        {/* Speed Curve Toggle */}
        <button
          onClick={() => setShowCurveEditor(!showCurveEditor)}
          className="w-full flex items-center justify-between p-3 bg-[var(--bg-surface)] rounded hover:bg-[var(--bg-hover)] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Icon name="adjustment" size={16} className="text-[var(--accent-turquoise)]" />
            <span className="text-sm text-[var(--text-primary)]">Geschwindigkeitskurve</span>
          </div>
          <Icon name={showCurveEditor ? 'chevronUp' : 'chevronDown'} size={16} className="text-[var(--text-tertiary)]" />
        </button>
        
        {/* Speed Curve Editor */}
        {showCurveEditor && (
          <div className="space-y-3">
            {/* Curve Presets */}
            <div className="grid grid-cols-3 gap-2">
              {CURVE_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  className="flex items-center gap-2 p-2 bg-[var(--bg-surface)] rounded text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <Icon name={preset.icon} size={14} />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
            
            {/* Curve Editor */}
            <SpeedCurveEditor
              curve={speedCurve}
              duration={originalDuration}
              onChange={setSpeedCurve}
            />
            
            <div className="text-xs text-[var(--text-tertiary)] text-center">
              Klicke auf die Kurve, um Punkte hinzuzufügen. Ziehe Punkte, um die Geschwindigkeit anzupassen.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
