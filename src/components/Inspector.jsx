/**
 * Inspector-Komponente
 * 
 * Rechte Eigenschaften-Spalte für ausgewählte Clips.
 * Zeigt und editiert Clip-Properties (Name, Opacity, Scale, Rotation, etc.)
 * 
 * Props:
 * @param {Object} selectedClip - Ausgewählter Clip mit allen Properties
 * @param {Object} media - Media-Objekt des Clips (für Metadaten)
 * @param {Function} onChangeClip - Callback bei Property-Änderung (clipId, property, value)
 * @param {Function} onDeleteClip - Callback zum Löschen (clipId)
 */

import React, { useState } from 'react';
import { formatDuration, secondsToTimecode } from '../utils/timecode';

export default function Inspector({
  selectedClip = null,
  media = null,
  onChangeClip,
  onDeleteClip
}) {
  const [showTooltip, setShowTooltip] = useState(true);

  if (!selectedClip) {
    return (
      <div className="w-80 bg-panel border-l border-muted/20 flex items-center justify-center">
        <div className="text-center text-muted/50 px-4">
          <div className="text-4xl mb-2">📋</div>
          <div className="text-13">Wähle einen Clip aus,<br />um Details anzuzeigen</div>
        </div>
      </div>
    );
  }

  const handleChange = (property, value) => {
    if (onChangeClip) {
      onChangeClip(selectedClip.id, property, value);
    }
  };

  const props = selectedClip.props || {};

  return (
    <div className="w-80 bg-panel border-l border-muted/20 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b border-muted/20">
        <h2 className="text-sm font-semibold text-white">Einzelheiten</h2>
      </div>

      {/* Tooltip-Notiz (wie im Screenshot) */}
      {showTooltip && (
        <div className="m-4 p-3 bg-yellow-400/90 text-black text-12 rounded">
          <div className="mb-2">
            Ebenen können in jedem neuen Projekt standardmäßig angeordnet werden.
          </div>
          <button
            onClick={() => setShowTooltip(false)}
            className="px-3 py-1 bg-black/10 hover:bg-black/20 rounded text-[11px] font-medium"
          >
            Verstanden
          </button>
        </div>
      )}

      {/* Properties Form */}
      <div className="p-4 space-y-2">
        {/* Name */}
        <div>
          <label className="block text-12 text-muted mb-1">Name</label>
          <input
            type="text"
            value={selectedClip.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-1.5 bg-surface border border-muted/20 rounded text-white text-13 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Pfad (readonly) */}
        {media && (
          <div>
            <label className="block text-12 text-muted mb-1">Pfad</label>
            <div className="w-full px-3 py-1.5 bg-surface/50 border border-muted/10 rounded text-muted text-12 truncate">
              {media.name || 'N/A'}
            </div>
          </div>
        )}

        {/* Seitenverhältnis */}
        <div>
          <label className="block text-12 text-muted mb-1">Seitenverhältnis</label>
          <select
            value={props.aspectRatio || '16:9'}
            onChange={(e) => handleChange('aspectRatio', e.target.value)}
            className="w-full px-3 py-1.5 bg-surface border border-muted/20 rounded text-white text-13 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="16:9">16:9</option>
            <option value="9:16">9:16</option>
            <option value="1:1">1:1</option>
            <option value="4:3">4:3</option>
          </select>
        </div>

        {/* Auflösung */}
        <div>
          <label className="block text-12 text-muted mb-1">Auflösung</label>
          <select
            value={props.resolution || '1080p'}
            onChange={(e) => handleChange('resolution', e.target.value)}
            className="w-full px-3 py-1.5 bg-surface border border-muted/20 rounded text-white text-13 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="4K">4K (3840×2160)</option>
            <option value="1080p">1080p (1920×1080)</option>
            <option value="720p">720p (1280×720)</option>
            <option value="480p">480p (854×480)</option>
          </select>
        </div>

        {/* Bildfrequenz */}
        <div>
          <label className="block text-12 text-muted mb-1">Bildfrequenz</label>
          <input
            type="number"
            min="24"
            max="120"
            step="1"
            value={props.fps || 30}
            onChange={(e) => handleChange('fps', parseInt(e.target.value))}
            className="w-full px-3 py-1.5 bg-surface border border-muted/20 rounded text-white text-13 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="border-t border-muted/20 pt-2" />

        {/* Timing */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-12 text-muted mb-1">Startzeit</label>
            <div className="px-3 py-1.5 bg-surface/50 border border-muted/10 rounded text-white text-12 font-mono">
              {secondsToTimecode(selectedClip.start)}
            </div>
          </div>
          <div>
            <label className="block text-12 text-muted mb-1">Dauer</label>
            <div className="px-3 py-1.5 bg-surface/50 border border-muted/10 rounded text-white text-12 font-mono">
              {formatDuration(selectedClip.duration)}
            </div>
          </div>
        </div>

        {/* Opacity */}
        <div>
          <label className="block text-12 text-muted mb-1">
            Deckkraft: {props.opacity || 100}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={props.opacity || 100}
            onChange={(e) => handleChange('opacity', parseInt(e.target.value))}
            className="w-full h-1 accent-accent"
          />
        </div>

        {/* Scale */}
        <div>
          <label className="block text-12 text-muted mb-1">
            Skalierung: {props.scale || 100}%
          </label>
          <input
            type="range"
            min="50"
            max="200"
            step="1"
            value={props.scale || 100}
            onChange={(e) => handleChange('scale', parseInt(e.target.value))}
            className="w-full h-1 accent-accent"
          />
        </div>

        {/* Rotation */}
        <div>
          <label className="block text-12 text-muted mb-1">Rotation (Grad)</label>
          <input
            type="number"
            min="-360"
            max="360"
            step="1"
            value={props.rotation || 0}
            onChange={(e) => handleChange('rotation', parseInt(e.target.value))}
            className="w-full px-3 py-1.5 bg-surface border border-muted/20 rounded text-white text-13 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Layer Index */}
        <div>
          <label className="block text-12 text-muted mb-1">Ebenen-Index</label>
          <input
            type="number"
            min="0"
            max="999"
            step="1"
            value={props.layer || 0}
            onChange={(e) => handleChange('layer', parseInt(e.target.value))}
            className="w-full px-3 py-1.5 bg-surface border border-muted/20 rounded text-white text-13 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Proxy Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-12 text-muted">Proxy verwenden</label>
          <input
            type="checkbox"
            checked={props.useProxy || false}
            onChange={(e) => handleChange('useProxy', e.target.checked)}
            className="w-4 h-4 accent-accent"
          />
        </div>

        {/* Delete Button */}
        <div className="pt-2 border-t border-muted/20">
          <button
            onClick={() => onDeleteClip && onDeleteClip(selectedClip.id)}
            className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-13 font-medium transition-colors"
          >
            Clip löschen
          </button>
        </div>
      </div>
    </div>
  );
}
