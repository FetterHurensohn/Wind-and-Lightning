/**
 * Color Grading Panel
 * Professionelle Farbkorrektur mit Color Wheels
 */

import React, { useState, useCallback, useRef } from 'react';
import Icon from './editor/Icon';

// Color Wheel Component
const ColorWheel = ({ value = { r: 0, g: 0, b: 0, luminance: 0 }, onChange, label }) => {
  const wheelRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleMouseDown = (e) => {
    setIsDragging(true);
    handleMouseMove(e);
  };
  
  const handleMouseMove = useCallback((e) => {
    if (!wheelRef.current) return;
    
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;
    
    const maxRadius = rect.width / 2 - 10;
    const distance = Math.min(Math.sqrt(x * x + y * y), maxRadius);
    const angle = Math.atan2(y, x);
    
    const normalizedX = (Math.cos(angle) * distance) / maxRadius;
    const normalizedY = (Math.sin(angle) * distance) / maxRadius;
    
    // Convert to RGB offset (-100 to 100)
    const r = Math.round(normalizedX * 100);
    const g = Math.round(-normalizedY * 100);
    const b = Math.round((normalizedX + normalizedY) * -50);
    
    onChange?.({ ...value, r, g, b });
  }, [onChange, value]);
  
  const handleMouseUp = () => setIsDragging(false);
  
  // Calculate indicator position from RGB values
  const indicatorX = (value.r / 100) * 40;
  const indicatorY = (-value.g / 100) * 40;
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-xs text-[var(--text-secondary)]">{label}</div>
      
      {/* Wheel */}
      <div
        ref={wheelRef}
        className="w-24 h-24 rounded-full relative cursor-crosshair"
        style={{
          background: 'conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)',
          filter: 'blur(0px)'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={isDragging ? handleMouseMove : undefined}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Inner gradient for brightness */}
        <div 
          className="absolute inset-2 rounded-full"
          style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }}
        />
        
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-white/50 -translate-x-1/2 -translate-y-1/2" />
        
        {/* Indicator */}
        <div 
          className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            left: `calc(50% + ${indicatorX}px)`,
            top: `calc(50% + ${indicatorY}px)`,
            backgroundColor: `rgb(${128 + value.r}, ${128 + value.g}, ${128 + value.b})`
          }}
        />
      </div>
      
      {/* Luminance Slider */}
      <div className="w-24">
        <input
          type="range"
          min="-100"
          max="100"
          value={value.luminance}
          onChange={(e) => onChange?.({ ...value, luminance: parseInt(e.target.value) })}
          className="w-full h-1 bg-gradient-to-r from-black via-gray-500 to-white rounded appearance-none cursor-pointer"
        />
      </div>
      
      {/* Value display */}
      <div className="text-xs text-[var(--text-tertiary)] font-mono">
        {value.luminance > 0 ? '+' : ''}{value.luminance}
      </div>
    </div>
  );
};

// Curves Component
const CurvesEditor = ({ curve = [], onChange }) => {
  const [activeCurve, setActiveCurve] = useState('rgb'); // 'rgb', 'r', 'g', 'b'
  const defaultCurve = [[0, 0], [64, 64], [128, 128], [192, 192], [255, 255]];
  const currentCurve = curve.length ? curve : defaultCurve;
  
  const curveColors = {
    rgb: '#ffffff',
    r: '#ff6b6b',
    g: '#69db7c',
    b: '#74c0fc'
  };
  
  return (
    <div className="space-y-2">
      {/* Channel Selector */}
      <div className="flex gap-1">
        {['rgb', 'r', 'g', 'b'].map(channel => (
          <button
            key={channel}
            onClick={() => setActiveCurve(channel)}
            className={`flex-1 h-7 rounded text-xs font-medium transition-colors ${
              activeCurve === channel
                ? 'text-white'
                : 'bg-[var(--bg-surface)] text-[var(--text-tertiary)]'
            }`}
            style={{
              backgroundColor: activeCurve === channel ? curveColors[channel] : undefined,
              color: activeCurve === channel ? (channel === 'rgb' ? '#000' : '#fff') : undefined
            }}
          >
            {channel.toUpperCase()}
          </button>
        ))}
      </div>
      
      {/* Curve Display */}
      <div className="relative w-full h-32 bg-[var(--bg-surface)] rounded-lg overflow-hidden">
        {/* Grid */}
        <svg className="absolute inset-0 w-full h-full">
          {[0.25, 0.5, 0.75].map(pos => (
            <g key={pos}>
              <line x1={`${pos * 100}%`} y1="0" x2={`${pos * 100}%`} y2="100%" stroke="var(--border-subtle)" strokeWidth="1" />
              <line x1="0" y1={`${pos * 100}%`} x2="100%" y2={`${pos * 100}%`} stroke="var(--border-subtle)" strokeWidth="1" />
            </g>
          ))}
          
          {/* Diagonal reference */}
          <line x1="0" y1="100%" x2="100%" y2="0" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="4 4" />
          
          {/* Curve */}
          <path
            d={`M ${currentCurve.map(([x, y]) => `${(x / 255) * 100}%,${100 - (y / 255) * 100}%`).join(' L ')}`}
            fill="none"
            stroke={curveColors[activeCurve]}
            strokeWidth="2"
          />
          
          {/* Control Points */}
          {currentCurve.map(([x, y], i) => (
            <circle
              key={i}
              cx={`${(x / 255) * 100}%`}
              cy={`${100 - (y / 255) * 100}%`}
              r="5"
              fill={curveColors[activeCurve]}
              stroke="white"
              strokeWidth="1"
              className="cursor-pointer"
            />
          ))}
        </svg>
      </div>
      
      {/* Presets */}
      <div className="flex gap-1">
        {['Linear', 'S-Kurve', 'Aufhellen', 'Abdunkeln'].map(preset => (
          <button
            key={preset}
            className="flex-1 h-6 bg-[var(--bg-surface)] rounded text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function ColorGradingPanel({ clip, onUpdate, onClose }) {
  const [activeTab, setActiveTab] = useState('wheels'); // 'wheels', 'curves', 'hsl'
  const [colorWheels, setColorWheels] = useState({
    lift: { r: 0, g: 0, b: 0, luminance: 0 },
    gamma: { r: 0, g: 0, b: 0, luminance: 0 },
    gain: { r: 0, g: 0, b: 0, luminance: 0 }
  });
  const [basic, setBasic] = useState({
    exposure: 0,
    contrast: 0,
    highlights: 0,
    shadows: 0,
    whites: 0,
    blacks: 0,
    temperature: 0,
    tint: 0,
    saturation: 0,
    vibrance: 0
  });
  
  const handleReset = useCallback(() => {
    setColorWheels({
      lift: { r: 0, g: 0, b: 0, luminance: 0 },
      gamma: { r: 0, g: 0, b: 0, luminance: 0 },
      gain: { r: 0, g: 0, b: 0, luminance: 0 }
    });
    setBasic({
      exposure: 0, contrast: 0, highlights: 0, shadows: 0,
      whites: 0, blacks: 0, temperature: 0, tint: 0,
      saturation: 0, vibrance: 0
    });
  }, []);
  
  const handleApply = useCallback(() => {
    onUpdate?.({
      colorWheels,
      basic
    });
  }, [colorWheels, basic, onUpdate]);
  
  return (
    <div className="bg-[var(--bg-panel)] rounded-lg border border-[var(--border-subtle)] overflow-hidden w-[420px]">
      {/* Header */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Icon name="palette" size={16} className="text-[var(--accent-turquoise)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">Farbkorrektur</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-2 h-6 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Zurücksetzen
          </button>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-[var(--border-subtle)]">
        {[
          { id: 'wheels', label: 'Color Wheels' },
          { id: 'curves', label: 'Kurven' },
          { id: 'hsl', label: 'HSL' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 h-9 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-[var(--accent-turquoise)] border-b-2 border-[var(--accent-turquoise)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div className="p-4 max-h-[400px] overflow-y-auto">
        {activeTab === 'wheels' && (
          <div className="space-y-6">
            {/* Color Wheels */}
            <div className="flex justify-between">
              <ColorWheel
                label="Lift (Schatten)"
                value={colorWheels.lift}
                onChange={(v) => setColorWheels(c => ({ ...c, lift: v }))}
              />
              <ColorWheel
                label="Gamma (Mitteltöne)"
                value={colorWheels.gamma}
                onChange={(v) => setColorWheels(c => ({ ...c, gamma: v }))}
              />
              <ColorWheel
                label="Gain (Lichter)"
                value={colorWheels.gain}
                onChange={(v) => setColorWheels(c => ({ ...c, gain: v }))}
              />
            </div>
            
            {/* Basic Adjustments */}
            <div className="space-y-3">
              {[
                { key: 'exposure', label: 'Belichtung', min: -3, max: 3, step: 0.1 },
                { key: 'contrast', label: 'Kontrast', min: -100, max: 100 },
                { key: 'highlights', label: 'Lichter', min: -100, max: 100 },
                { key: 'shadows', label: 'Schatten', min: -100, max: 100 },
                { key: 'temperature', label: 'Temperatur', min: -100, max: 100 },
                { key: 'saturation', label: 'Sättigung', min: -100, max: 100 }
              ].map(({ key, label, min, max, step = 1 }) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[var(--text-secondary)]">{label}</span>
                    <span className="text-xs text-[var(--text-primary)] font-mono w-12 text-right">
                      {basic[key] > 0 ? '+' : ''}{basic[key]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={basic[key]}
                    onChange={(e) => setBasic(b => ({ ...b, [key]: parseFloat(e.target.value) }))}
                    className="w-full h-1.5 bg-[var(--bg-surface)] rounded appearance-none cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'curves' && (
          <CurvesEditor />
        )}
        
        {activeTab === 'hsl' && (
          <div className="space-y-4">
            {['Rot', 'Orange', 'Gelb', 'Grün', 'Aqua', 'Blau', 'Lila', 'Magenta'].map((color, i) => (
              <div key={color} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: ['#ff6b6b', '#ff922b', '#ffd43b', '#69db7c', '#38d9a9', '#74c0fc', '#b197fc', '#f06595'][i] }}
                  />
                  <span className="text-xs text-[var(--text-primary)]">{color}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['Farbton', 'Sättigung', 'Helligkeit'].map(prop => (
                    <div key={prop}>
                      <div className="text-xs text-[var(--text-tertiary)] mb-1">{prop}</div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        defaultValue="0"
                        className="w-full h-1 bg-[var(--bg-surface)] rounded appearance-none cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-[var(--border-subtle)]">
        <button
          onClick={handleApply}
          className="w-full h-10 bg-[var(--accent-turquoise)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <Icon name="check" size={16} />
          Anwenden
        </button>
      </div>
    </div>
  );
}
