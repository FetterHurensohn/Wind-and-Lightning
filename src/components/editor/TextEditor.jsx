/**
 * TextEditor.jsx - Text Overlay Editor (wie CapCut)
 * 
 * Features:
 * - Text hinzufügen zur Timeline
 * - Font-Auswahl
 * - Größe, Farbe, Stil (Bold, Italic, Underline)
 * - Animation (Fade In, Slide, Typewriter)
 * - Position und Ausrichtung
 * - Hintergrund und Outline
 */

import React, { useState, useCallback } from 'react';
import Icon from './Icon';

// Font Options
const FONTS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Oswald', label: 'Oswald' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Bebas Neue', label: 'Bebas Neue' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
];

// Animation Presets
const ANIMATIONS = [
  { id: 'none', name: 'Keine', icon: 'minus' },
  { id: 'fadeIn', name: 'Einblenden', icon: 'effects' },
  { id: 'fadeOut', name: 'Ausblenden', icon: 'effects' },
  { id: 'slideLeft', name: 'Von links', icon: 'arrowRight' },
  { id: 'slideRight', name: 'Von rechts', icon: 'arrowRight' },
  { id: 'slideUp', name: 'Von unten', icon: 'arrowRight' },
  { id: 'slideDown', name: 'Von oben', icon: 'arrowRight' },
  { id: 'scaleIn', name: 'Zoom rein', icon: 'zoomIn' },
  { id: 'scaleOut', name: 'Zoom raus', icon: 'zoomOut' },
  { id: 'typewriter', name: 'Schreibmaschine', icon: 'text' },
  { id: 'bounce', name: 'Bounce', icon: 'play' },
  { id: 'glitch', name: 'Glitch', icon: 'effects' },
];

// Color Presets
const COLOR_PRESETS = [
  '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FF6B6B', '#4ECDC4',
  '#45B7D1', '#96CEB4', '#FFEAA7', '#DFE6E9', '#636E72',
];

// Text Preview Component
const TextPreview = ({ text, style }) => (
  <div 
    className="w-full h-40 bg-black/50 rounded-lg flex items-center justify-center overflow-hidden"
    style={{ perspective: '1000px' }}
  >
    <div
      style={{
        fontFamily: style.fontFamily,
        fontSize: `${style.fontSize}px`,
        fontWeight: style.bold ? 'bold' : 'normal',
        fontStyle: style.italic ? 'italic' : 'normal',
        textDecoration: style.underline ? 'underline' : 'none',
        color: style.color,
        textShadow: style.shadow ? `2px 2px 4px ${style.shadowColor}` : 'none',
        WebkitTextStroke: style.outline ? `${style.outlineWidth}px ${style.outlineColor}` : 'none',
        backgroundColor: style.background ? style.backgroundColor : 'transparent',
        padding: style.background ? '8px 16px' : '0',
        borderRadius: style.background ? '4px' : '0',
        textAlign: style.align,
        letterSpacing: `${style.letterSpacing}px`,
        lineHeight: style.lineHeight,
      }}
    >
      {text || 'Beispieltext'}
    </div>
  </div>
);

export default function TextEditor({ 
  clip,
  onTextChange,
  onAddText,
  onClose 
}) {
  const [text, setText] = useState(clip?.text || '');
  const [style, setStyle] = useState({
    fontFamily: clip?.style?.fontFamily || 'Inter',
    fontSize: clip?.style?.fontSize || 48,
    color: clip?.style?.color || '#FFFFFF',
    bold: clip?.style?.bold || false,
    italic: clip?.style?.italic || false,
    underline: clip?.style?.underline || false,
    align: clip?.style?.align || 'center',
    letterSpacing: clip?.style?.letterSpacing || 0,
    lineHeight: clip?.style?.lineHeight || 1.2,
    shadow: clip?.style?.shadow || false,
    shadowColor: clip?.style?.shadowColor || 'rgba(0,0,0,0.5)',
    outline: clip?.style?.outline || false,
    outlineWidth: clip?.style?.outlineWidth || 2,
    outlineColor: clip?.style?.outlineColor || '#000000',
    background: clip?.style?.background || false,
    backgroundColor: clip?.style?.backgroundColor || 'rgba(0,0,0,0.5)',
    animation: clip?.style?.animation || 'none',
    animationDuration: clip?.style?.animationDuration || 0.5,
  });
  
  const [activeTab, setActiveTab] = useState('style'); // 'style', 'animation', 'position'
  
  const updateStyle = useCallback((key, value) => {
    setStyle(prev => {
      const updated = { ...prev, [key]: value };
      onTextChange?.({ text, style: updated });
      return updated;
    });
  }, [text, onTextChange]);
  
  const handleTextChange = useCallback((newText) => {
    setText(newText);
    onTextChange?.({ text: newText, style });
  }, [style, onTextChange]);
  
  const handleAddToTimeline = useCallback(() => {
    onAddText?.({
      type: 'text',
      text,
      style,
      duration: 5, // Default 5 Sekunden
    });
  }, [text, style, onAddText]);
  
  return (
    <div className="bg-[var(--bg-panel)] rounded-lg border border-[var(--border-subtle)] overflow-hidden max-h-[600px] overflow-y-auto">
      {/* Header */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-[var(--border-subtle)] sticky top-0 bg-[var(--bg-panel)] z-10">
        <div className="flex items-center gap-2">
          <Icon name="text" size={16} className="text-[var(--accent-turquoise)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">Text Editor</span>
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
        {/* Text Preview */}
        <TextPreview text={text} style={style} />
        
        {/* Text Input */}
        <textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Text eingeben..."
          className="w-full h-20 p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-turquoise)] resize-none"
        />
        
        {/* Tabs */}
        <div className="flex gap-1 bg-[var(--bg-surface)] p-1 rounded-lg">
          {['style', 'animation', 'position'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 h-8 rounded text-xs font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-[var(--bg-panel)] text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab === 'style' ? 'Stil' : tab === 'animation' ? 'Animation' : 'Position'}
            </button>
          ))}
        </div>
        
        {/* Style Tab */}
        {activeTab === 'style' && (
          <div className="space-y-4">
            {/* Font Selection */}
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-2 block">Schriftart</label>
              <select
                value={style.fontFamily}
                onChange={(e) => updateStyle('fontFamily', e.target.value)}
                className="w-full h-9 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-turquoise)]"
              >
                {FONTS.map(font => (
                  <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Font Size */}
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-2 block">Schriftgröße: {style.fontSize}px</label>
              <input
                type="range"
                min="12"
                max="200"
                value={style.fontSize}
                onChange={(e) => updateStyle('fontSize', parseInt(e.target.value))}
                className="w-full h-2 bg-[var(--bg-surface)] rounded appearance-none cursor-pointer"
              />
            </div>
            
            {/* Text Style Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => updateStyle('bold', !style.bold)}
                className={`flex-1 h-9 rounded text-sm font-bold transition-colors ${
                  style.bold ? 'bg-[var(--accent-turquoise)] text-white' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                }`}
              >
                B
              </button>
              <button
                onClick={() => updateStyle('italic', !style.italic)}
                className={`flex-1 h-9 rounded text-sm italic transition-colors ${
                  style.italic ? 'bg-[var(--accent-turquoise)] text-white' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                }`}
              >
                I
              </button>
              <button
                onClick={() => updateStyle('underline', !style.underline)}
                className={`flex-1 h-9 rounded text-sm underline transition-colors ${
                  style.underline ? 'bg-[var(--accent-turquoise)] text-white' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                }`}
              >
                U
              </button>
            </div>
            
            {/* Text Alignment */}
            <div className="flex gap-2">
              {['left', 'center', 'right'].map(align => (
                <button
                  key={align}
                  onClick={() => updateStyle('align', align)}
                  className={`flex-1 h-9 rounded flex items-center justify-center transition-colors ${
                    style.align === align ? 'bg-[var(--accent-turquoise)] text-white' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                  }`}
                >
                  <Icon name="text" size={14} />
                </button>
              ))}
            </div>
            
            {/* Color */}
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-2 block">Textfarbe</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map(color => (
                  <button
                    key={color}
                    onClick={() => updateStyle('color', color)}
                    className={`w-8 h-8 rounded border-2 transition-transform hover:scale-110 ${
                      style.color === color ? 'border-[var(--accent-turquoise)]' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <input
                  type="color"
                  value={style.color}
                  onChange={(e) => updateStyle('color', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                />
              </div>
            </div>
            
            {/* Outline */}
            <label className="flex items-center gap-3 p-3 bg-[var(--bg-surface)] rounded cursor-pointer">
              <input
                type="checkbox"
                checked={style.outline}
                onChange={(e) => updateStyle('outline', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-[var(--text-primary)]">Umrandung</span>
              {style.outline && (
                <input
                  type="color"
                  value={style.outlineColor}
                  onChange={(e) => updateStyle('outlineColor', e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer ml-auto"
                />
              )}
            </label>
            
            {/* Shadow */}
            <label className="flex items-center gap-3 p-3 bg-[var(--bg-surface)] rounded cursor-pointer">
              <input
                type="checkbox"
                checked={style.shadow}
                onChange={(e) => updateStyle('shadow', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-[var(--text-primary)]">Schatten</span>
            </label>
            
            {/* Background */}
            <label className="flex items-center gap-3 p-3 bg-[var(--bg-surface)] rounded cursor-pointer">
              <input
                type="checkbox"
                checked={style.background}
                onChange={(e) => updateStyle('background', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-[var(--text-primary)]">Hintergrund</span>
              {style.background && (
                <input
                  type="color"
                  value={style.backgroundColor.replace('rgba(0,0,0,0.5)', '#000000')}
                  onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer ml-auto"
                />
              )}
            </label>
          </div>
        )}
        
        {/* Animation Tab */}
        {activeTab === 'animation' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {ANIMATIONS.map(anim => (
                <button
                  key={anim.id}
                  onClick={() => updateStyle('animation', anim.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded transition-colors ${
                    style.animation === anim.id
                      ? 'bg-[var(--accent-turquoise)] text-white'
                      : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon name={anim.icon} size={16} />
                  <span className="text-xs">{anim.name}</span>
                </button>
              ))}
            </div>
            
            {style.animation !== 'none' && (
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-2 block">
                  Dauer: {style.animationDuration}s
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={style.animationDuration}
                  onChange={(e) => updateStyle('animationDuration', parseFloat(e.target.value))}
                  className="w-full h-2 bg-[var(--bg-surface)] rounded appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>
        )}
        
        {/* Position Tab */}
        {activeTab === 'position' && (
          <div className="space-y-4">
            {/* Letter Spacing */}
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-2 block">
                Buchstabenabstand: {style.letterSpacing}px
              </label>
              <input
                type="range"
                min="-5"
                max="20"
                value={style.letterSpacing}
                onChange={(e) => updateStyle('letterSpacing', parseInt(e.target.value))}
                className="w-full h-2 bg-[var(--bg-surface)] rounded appearance-none cursor-pointer"
              />
            </div>
            
            {/* Line Height */}
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-2 block">
                Zeilenhöhe: {style.lineHeight}
              </label>
              <input
                type="range"
                min="0.8"
                max="3"
                step="0.1"
                value={style.lineHeight}
                onChange={(e) => updateStyle('lineHeight', parseFloat(e.target.value))}
                className="w-full h-2 bg-[var(--bg-surface)] rounded appearance-none cursor-pointer"
              />
            </div>
            
            {/* Position Presets */}
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-2 block">Position</label>
              <div className="grid grid-cols-3 gap-1">
                {['top-left', 'top-center', 'top-right', 'center-left', 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right'].map(pos => (
                  <button
                    key={pos}
                    className="h-8 bg-[var(--bg-surface)] rounded text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    {pos.split('-').map(p => p[0].toUpperCase()).join('')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Add Button */}
        <button
          onClick={handleAddToTimeline}
          disabled={!text.trim()}
          className="w-full h-10 bg-[var(--accent-turquoise)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Icon name="plus" size={16} />
          Zur Timeline hinzufügen
        </button>
      </div>
    </div>
  );
}
