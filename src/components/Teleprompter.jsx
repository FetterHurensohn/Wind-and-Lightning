/**
 * Teleprompter Component
 * Script-Anzeige mit Auto-Scroll
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Icon from './editor/Icon';

export default function Teleprompter({ onClose }) {
  const [script, setScript] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(50);
  const [fontSize, setFontSize] = useState(32);
  const [mirrorX, setMirrorX] = useState(false);
  const [mirrorY, setMirrorY] = useState(false);
  const [position, setPosition] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  
  // Auto-scroll
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }
    
    const scroll = () => {
      setPosition(prev => prev + scrollSpeed / 1000);
      animationRef.current = requestAnimationFrame(scroll);
    };
    
    animationRef.current = requestAnimationFrame(scroll);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, scrollSpeed]);
  
  const handleReset = useCallback(() => {
    setPosition(0);
    setIsPlaying(false);
  }, []);
  
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => setScript(e.target.result);
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);
  
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className={`bg-[var(--bg-panel)] rounded-lg border border-[var(--border-subtle)] overflow-hidden ${
        fullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-[600px]'
      }`}
    >
      {/* Header */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Icon name="text" size={16} className="text-[var(--accent-turquoise)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">Teleprompter</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors"
            title="Vollbild"
          >
            <Icon name="expand" size={14} />
          </button>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      </div>
      
      {/* Script Display */}
      <div 
        className="h-[300px] bg-black overflow-hidden relative"
        style={{
          transform: `${mirrorX ? 'scaleX(-1)' : ''} ${mirrorY ? 'scaleY(-1)' : ''}`
        }}
      >
        {/* Center Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500/50 z-10" />
        <div className="absolute top-1/2 left-4 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-8 border-l-red-500 z-10" />
        
        {/* Text */}
        <div 
          className="p-8 text-white text-center leading-relaxed"
          style={{ 
            fontSize: `${fontSize}px`,
            transform: `translateY(calc(50% - ${position}px))`,
            transition: 'transform 0.1s linear'
          }}
        >
          {script || (
            <span className="text-white/30">Gib deinen Text ein oder importiere ein Skript...</span>
          )}
        </div>
      </div>
      
      {/* Controls */}
      <div className="p-4 space-y-4 border-t border-[var(--border-subtle)]">
        {/* Playback */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleReset}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Icon name="stop" size={18} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-[var(--accent-turquoise)] text-white hover:opacity-90 transition-all"
          >
            <Icon name={isPlaying ? 'pause' : 'play'} size={24} />
          </button>
        </div>
        
        {/* Speed */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--text-secondary)]">Geschwindigkeit</span>
            <span className="text-xs text-[var(--text-primary)]">{scrollSpeed}</span>
          </div>
          <input
            type="range"
            min="10"
            max="200"
            value={scrollSpeed}
            onChange={(e) => setScrollSpeed(parseInt(e.target.value))}
            className="w-full h-1.5 bg-[var(--bg-surface)] rounded appearance-none cursor-pointer"
          />
        </div>
        
        {/* Font Size */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--text-secondary)]">Schriftgröße</span>
            <span className="text-xs text-[var(--text-primary)]">{fontSize}px</span>
          </div>
          <input
            type="range"
            min="16"
            max="72"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="w-full h-1.5 bg-[var(--bg-surface)] rounded appearance-none cursor-pointer"
          />
        </div>
        
        {/* Mirror Options */}
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={mirrorX}
              onChange={(e) => setMirrorX(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-xs text-[var(--text-secondary)]">Horizontal spiegeln</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={mirrorY}
              onChange={(e) => setMirrorY(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-xs text-[var(--text-secondary)]">Vertikal spiegeln</span>
          </label>
        </div>
        
        {/* Script Input */}
        <div className="flex gap-2">
          <button
            onClick={handleImport}
            className="flex-1 h-9 bg-[var(--bg-surface)] rounded text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="import" size={14} />
            Skript importieren
          </button>
        </div>
        
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Skript hier eingeben..."
          className="w-full h-24 p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-turquoise)] resize-none"
        />
      </div>
    </div>
  );
}
