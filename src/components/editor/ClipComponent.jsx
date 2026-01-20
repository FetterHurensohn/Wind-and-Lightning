/**
 * ClipComponent.jsx - Verbesserte Clip-Komponente mit Trim-Handles
 * 
 * Features:
 * - Drag & Drop zum Verschieben
 * - Trim-Handles links/rechts zum Trimmen
 * - Selection State
 * - Typ-spezifische Darstellung (Video, Audio, Text, Image)
 * - Waveform für Audio
 * - Thumbnail für Video/Image
 * - Context Menu
 */

import React, { useState, useCallback, useRef } from 'react';
import Icon from './Icon';

export default function ClipComponent({
  clip,
  trackId,
  trackType,
  pxPerSec,
  isSelected,
  isLocked,
  snapping,
  onSelect,
  onMove,
  onTrim,
  onContextMenu,
  onDoubleClick,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isTrimming, setIsTrimming] = useState(null); // 'left' | 'right' | null
  const [dragOffset, setDragOffset] = useState(0);
  const clipRef = useRef(null);
  const startDataRef = useRef(null);
  
  // Clip Dimensionen
  const left = clip.start * pxPerSec;
  const width = Math.max(clip.duration * pxPerSec, 40); // Minimum 40px Breite
  
  // Farben basierend auf Typ
  const getClipColors = () => {
    switch (clip.type) {
      case 'video':
        return {
          bg: 'from-blue-600 to-blue-700',
          border: 'border-blue-500',
          icon: 'video'
        };
      case 'audio':
        return {
          bg: 'from-green-600 to-green-700',
          border: 'border-green-500',
          icon: 'audio'
        };
      case 'image':
        return {
          bg: 'from-purple-600 to-purple-700',
          border: 'border-purple-500',
          icon: 'image'
        };
      case 'text':
        return {
          bg: 'from-orange-600 to-orange-700',
          border: 'border-orange-500',
          icon: 'text'
        };
      default:
        return {
          bg: 'from-gray-600 to-gray-700',
          border: 'border-gray-500',
          icon: 'video'
        };
    }
  };
  
  const colors = getClipColors();
  
  // Handle Drag Start
  const handleDragStart = useCallback((e) => {
    if (isLocked || isTrimming) return;
    
    e.stopPropagation();
    setIsDragging(true);
    
    const rect = clipRef.current.getBoundingClientRect();
    setDragOffset(e.clientX - rect.left);
    
    startDataRef.current = {
      start: clip.start,
      clientX: e.clientX,
    };
    
    // Setze Drag-Daten
    e.dataTransfer.setData('clipId', clip.id);
    e.dataTransfer.setData('trackId', trackId);
    e.dataTransfer.effectAllowed = 'move';
    
    onSelect?.(clip.id);
  }, [clip, trackId, isLocked, isTrimming, onSelect]);
  
  // Handle Drag End
  const handleDragEnd = useCallback((e) => {
    setIsDragging(false);
    startDataRef.current = null;
  }, []);
  
  // Handle Trim Start
  const handleTrimStart = useCallback((e, side) => {
    e.stopPropagation();
    e.preventDefault();
    if (isLocked) return;
    
    setIsTrimming(side);
    startDataRef.current = {
      start: clip.start,
      duration: clip.duration,
      clientX: e.clientX,
    };
    
    const handleMouseMove = (moveEvent) => {
      if (!startDataRef.current) return;
      
      const deltaX = moveEvent.clientX - startDataRef.current.clientX;
      const deltaTime = deltaX / pxPerSec;
      
      if (side === 'left') {
        // Trimme Anfang
        let newStart = startDataRef.current.start + deltaTime;
        let newDuration = startDataRef.current.duration - deltaTime;
        
        // Begrenzungen
        newStart = Math.max(0, newStart);
        newDuration = Math.max(0.5, newDuration); // Minimum 0.5s
        
        // Snap
        if (snapping) {
          newStart = Math.round(newStart * 10) / 10;
        }
        
        onTrim?.(clip.id, newStart, startDataRef.current.start + startDataRef.current.duration - newStart);
      } else {
        // Trimme Ende
        let newDuration = startDataRef.current.duration + deltaTime;
        newDuration = Math.max(0.5, newDuration); // Minimum 0.5s
        
        // Snap
        if (snapping) {
          newDuration = Math.round(newDuration * 10) / 10;
        }
        
        onTrim?.(clip.id, clip.start, newDuration);
      }
    };
    
    const handleMouseUp = () => {
      setIsTrimming(null);
      startDataRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [clip, pxPerSec, snapping, isLocked, onTrim]);
  
  // Handle Click
  const handleClick = useCallback((e) => {
    e.stopPropagation();
    onSelect?.(clip.id, e.ctrlKey || e.metaKey);
  }, [clip.id, onSelect]);
  
  // Handle Context Menu
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu?.(e, clip);
  }, [clip, onContextMenu]);
  
  // Handle Double Click
  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation();
    onDoubleClick?.(clip);
  }, [clip, onDoubleClick]);
  
  return (
    <div
      ref={clipRef}
      className={`absolute top-1 bottom-1 rounded group transition-shadow ${
        isSelected ? 'ring-2 ring-white shadow-lg z-10' : 'hover:ring-1 hover:ring-white/50'
      } ${isDragging ? 'opacity-70 cursor-grabbing' : 'cursor-pointer'} ${
        isLocked ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      style={{
        left: `${left}px`,
        width: `${width}px`,
      }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
      draggable={!isLocked}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-testid={`clip-${clip.id}`}
    >
      {/* Clip Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} rounded border ${colors.border} overflow-hidden`}>
        {/* Thumbnail/Waveform */}
        {clip.thumbnail && clip.type !== 'audio' && (
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url(${clip.thumbnail})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        )}
        
        {/* Audio Waveform Placeholder */}
        {clip.type === 'audio' && (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <svg className="w-full h-3/4 opacity-30" preserveAspectRatio="none" viewBox="0 0 100 40">
              {Array.from({ length: 50 }).map((_, i) => {
                const height = Math.random() * 30 + 5;
                return (
                  <rect
                    key={i}
                    x={i * 2}
                    y={(40 - height) / 2}
                    width="1.5"
                    height={height}
                    fill="white"
                  />
                );
              })}
            </svg>
          </div>
        )}
        
        {/* Content */}
        <div className="absolute inset-0 p-2 flex flex-col justify-between">
          {/* Top: Title + Icon */}
          <div className="flex items-center gap-1.5">
            <Icon name={colors.icon} size={12} className="text-white/80 flex-shrink-0" />
            <span className="text-xs font-medium text-white truncate">
              {clip.title || clip.text || 'Unbenannt'}
            </span>
          </div>
          
          {/* Bottom: Duration */}
          <div className="text-xs text-white/60">
            {clip.duration.toFixed(1)}s
          </div>
        </div>
        
        {/* Selection Overlay */}
        {isSelected && (
          <div className="absolute inset-0 bg-white/10" />
        )}
        
        {/* Locked Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Icon name="lock" size={16} className="text-white/50" />
          </div>
        )}
      </div>
      
      {/* Trim Handle Left */}
      {!isLocked && (
        <div
          className={`absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize group-hover:bg-white/30 transition-colors ${
            isTrimming === 'left' ? 'bg-white/50' : ''
          }`}
          onMouseDown={(e) => handleTrimStart(e, 'left')}
        >
          <div className="absolute left-0.5 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
      
      {/* Trim Handle Right */}
      {!isLocked && (
        <div
          className={`absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize group-hover:bg-white/30 transition-colors ${
            isTrimming === 'right' ? 'bg-white/50' : ''
          }`}
          onMouseDown={(e) => handleTrimStart(e, 'right')}
        >
          <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
      
      {/* Transition Indicator (wenn vorhanden) */}
      {clip.transitionIn && (
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-yellow-500/50 to-transparent flex items-center justify-center">
          <Icon name="transitions" size={10} className="text-yellow-400" />
        </div>
      )}
      
      {clip.transitionOut && (
        <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-yellow-500/50 to-transparent flex items-center justify-center">
          <Icon name="transitions" size={10} className="text-yellow-400" />
        </div>
      )}
    </div>
  );
}
