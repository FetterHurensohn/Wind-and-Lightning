/**
 * SidebarLeft-Komponente
 * 
 * Linke Seitenleiste mit Kategorien und Media Library.
 * Unterstützt Drag-Source für Media-Items.
 * 
 * Props:
 * @param {Array} mediaList - Array von Media-Objekten
 * @param {Function} onAddMedia - Callback beim Import
 * @param {Function} onDragStart - Callback beim Drag-Start (mediaId)
 */

import React, { useState, useRef } from 'react';
import KIPanel from './KIPanel';
import { formatDuration } from '../utils/timecode';

const CATEGORIES = [
  { id: 'medien', name: 'Medien', icon: '📁' },
  { id: 'audio', name: 'Audio', icon: '🎵' },
  { id: 'text', name: 'Text', icon: '📝' },
  { id: 'ki-medien', name: 'KI-Medien', icon: '🤖' },
  { id: 'ki-bild', name: 'KI-Bild', icon: '🖼️' },
  { id: 'ki-video', name: 'KI-Video', icon: '🎥' },
  { id: 'ki-dialog', name: 'KI-Dialogszene', icon: '💬' },
  { id: 'speicher', name: 'Speicher', icon: '💾' },
  { id: 'bibliothek', name: 'Bibliothek', icon: '📚' }
];

export default function SidebarLeft({
  mediaList = [],
  onAddMedia,
  onDragStart
}) {
  const [activeCategory, setActiveCategory] = useState('medien');
  const [view, setView] = useState('deine'); // 'importieren', 'deine', 'ki-medien'
  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0 && onAddMedia) {
      files.forEach(file => {
        const mediaType = file.type.startsWith('video/') ? 'video' :
                         file.type.startsWith('audio/') ? 'audio' : 'image';
        
        const reader = new FileReader();
        reader.onload = (event) => {
          onAddMedia({
            name: file.name,
            type: mediaType,
            duration: 5, // Default, echte Dauer würde Metadata laden erfordern
            thumbnail: mediaType === 'image' ? event.target.result : 'placeholder',
            file: file
          });
        };
        
        if (mediaType === 'image') {
          reader.readAsDataURL(file);
        } else {
          onAddMedia({
            name: file.name,
            type: mediaType,
            duration: 5,
            thumbnail: 'placeholder',
            file: file
          });
        }
      });
    }
    
    // Reset input
    e.target.value = '';
  };

  const handleMediaDragStart = (e, mediaId) => {
    e.dataTransfer.setData('mediaId', mediaId);
    e.dataTransfer.effectAllowed = 'copy';
    
    if (onDragStart) {
      onDragStart(mediaId);
    }
  };

  const getMediaIcon = (type) => {
    switch (type) {
      case 'video': return '🎬';
      case 'audio': return '🎵';
      case 'image': return '🖼️';
      default: return '📄';
    }
  };

  return (
    <div className="w-72 bg-panel border-r border-muted/20 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-muted/20">
        <h2 className="text-sm font-semibold text-white mb-2">Medien</h2>
        
        {/* View Selector */}
        <div className="flex gap-1 text-12">
          <button
            onClick={() => setView('importieren')}
            className={`flex-1 px-2 py-1 rounded ${
              view === 'importieren' 
                ? 'bg-accent text-white' 
                : 'bg-surface text-muted hover:text-white'
            }`}
          >
            Importieren
          </button>
          <button
            onClick={() => setView('deine')}
            className={`flex-1 px-2 py-1 rounded ${
              view === 'deine' 
                ? 'bg-accent text-white' 
                : 'bg-surface text-muted hover:text-white'
            }`}
          >
            Deine
          </button>
          <button
            onClick={() => setView('ki-medien')}
            className={`flex-1 px-2 py-1 rounded ${
              view === 'ki-medien' 
                ? 'bg-accent text-white' 
                : 'bg-surface text-muted hover:text-white'
            }`}
          >
            KI-Medien
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {view === 'ki-medien' ? (
          <div className="p-4">
            <KIPanel />
          </div>
        ) : (
          <>
            {/* Categories */}
            <div className="p-2 border-b border-muted/20">
              <div className="space-y-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded text-13 transition-colors ${
                      activeCategory === cat.id
                        ? 'bg-accent text-white'
                        : 'text-muted hover:bg-surface hover:text-white'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Media Grid */}
            <div className="p-4">
              {view === 'importieren' && (
                <div className="mb-4">
                  <button
                    onClick={handleImportClick}
                    className="w-full px-4 py-3 bg-accent hover:bg-accent/80 text-white rounded text-13 font-medium transition-colors"
                  >
                    + Dateien importieren
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="video/*,image/*,audio/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}

              {mediaList.length === 0 ? (
                <div className="text-center text-muted/50 py-8">
                  <div className="text-4xl mb-2">📦</div>
                  <div className="text-12">Keine Medien</div>
                  <div className="text-12">Importiere Dateien</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {mediaList.map(media => (
                    <div
                      key={media.id}
                      draggable
                      onDragStart={(e) => handleMediaDragStart(e, media.id)}
                      className="bg-surface rounded overflow-hidden cursor-move hover:ring-2 hover:ring-accent transition-all"
                    >
                      {/* Thumbnail */}
                      <div className="w-16 h-16 bg-surface flex items-center justify-center text-2xl">
                        {media.thumbnail === 'placeholder' ? getMediaIcon(media.type) : (
                          <img src={media.thumbnail} alt={media.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="p-2">
                        <div className="text-13 text-white truncate">{media.name}</div>
                        <div className="text-11 text-muted">{formatDuration(media.duration)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
