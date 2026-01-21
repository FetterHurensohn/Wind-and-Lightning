/**
 * MediaInputPanel.jsx - CapCut-Style Linkes Panel
 * 
 * Struktur nach CapCut Screenshots:
 * - Linker Bereich (200px): Navigation mit Kategorien (abhängig von TopToolbar)
 * - Rechter Bereich (flex-1): Content der ausgewählten Kategorie
 */

import React, { useState, useRef } from 'react';
import { useEditor } from './EditorLayout';
import Icon from './Icon';
import { quickPrompt, generateImage, textToSpeech, generateMusicSuggestion, generateStoryboard, transcribeAudio } from '../../modules/ai/AIClient';
import { ModelSelector } from './AIModelSelectorUI';
import { loadAISettings } from '../../modules/ai/AIModelSelector';

// ============================================
// SUB-KOMPONENTEN
// ============================================

// Navigation Item mit optionalem Chevron
const NavItem = ({ label, isActive, onClick, hasChildren, isExpanded, icon, badge }) => (
  <button
    onClick={onClick}
    className={`
      w-full h-8 px-3 flex items-center gap-2 text-left rounded-md transition-colors text-sm
      ${isActive 
        ? 'bg-[var(--accent-turquoise)]/20 text-[var(--accent-turquoise)] font-medium' 
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}
    `}
  >
    {hasChildren && (
      <Icon name={isExpanded ? 'chevronDown' : 'chevronRight'} size={12} className="flex-shrink-0" />
    )}
    {icon && <Icon name={icon} size={16} className="flex-shrink-0" />}
    <span className="flex-1 truncate">{label}</span>
    {badge && (
      <span className="px-1.5 py-0.5 bg-[var(--accent-purple)] text-white text-xs rounded">{badge}</span>
    )}
  </button>
);

// Sub-Navigation Item
const SubNavItem = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      w-full h-7 pl-6 pr-3 text-left text-sm rounded transition-colors truncate
      ${isActive 
        ? 'text-[var(--accent-turquoise)] font-medium' 
        : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}
    `}
  >
    {label}
  </button>
);

// Collapsible Navigation Group
const NavGroup = ({ label, children, defaultOpen = false, badge }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-8 px-3 flex items-center gap-2 text-left text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-md transition-colors"
      >
        <Icon name={isOpen ? 'chevronDown' : 'chevronRight'} size={12} />
        <span className="flex-1">{label}</span>
        {badge && (
          <span className="px-1.5 py-0.5 bg-[var(--accent-purple)] text-white text-xs rounded">{badge}</span>
        )}
      </button>
      {isOpen && <div className="mt-1 space-y-0.5">{children}</div>}
    </div>
  );
};

// Search Bar
const SearchBar = ({ placeholder, value, onChange }) => (
  <div className="relative mb-4">
    <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-9 pl-9 pr-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-turquoise)] focus:outline-none"
    />
  </div>
);

// Grid Tile für Medien/Effekte - MIT DRAG SUPPORT
const MediaTile = ({ id, thumbnail, title, duration, type, onDownload, onClick, draggable = false }) => {
  const handleDragStart = (e) => {
    if (!draggable || !id) return;
    e.dataTransfer.setData('mediaId', id);
    e.dataTransfer.effectAllowed = 'copy';
    // Visual feedback
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
  };

  return (
    <div 
      onClick={onClick}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`group relative bg-[var(--bg-surface)] rounded-lg overflow-hidden border border-[var(--border-subtle)] hover:border-[var(--accent-turquoise)] cursor-pointer transition-all ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <div className="aspect-video bg-[var(--bg-panel)] flex items-center justify-center relative">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover pointer-events-none" />
        ) : (
          <Icon name={type === 'audio' ? 'audio' : type === 'image' ? 'image' : 'video'} size={24} className="text-[var(--text-tertiary)]" />
        )}
        {duration && (
          <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/70 text-white text-[10px] rounded">
            {duration}
          </span>
        )}
        {draggable && (
          <div className="absolute top-1 left-1 px-1 py-0.5 bg-blue-500/80 text-white text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity">
            DRAG
          </div>
        )}
      </div>
      {title && (
        <div className="p-1.5 text-[10px] text-[var(--text-secondary)] truncate">{title}</div>
      )}
    </div>
  );
};

// Audio List Item
const AudioItem = ({ title, artist, duration, onDownload }) => (
  <div className="flex items-center gap-3 p-3 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--accent-turquoise)] transition-colors cursor-pointer">
    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded flex items-center justify-center flex-shrink-0">
      <Icon name="music" size={20} className="text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-sm text-[var(--text-primary)] truncate">{title}</div>
      <div className="text-xs text-[var(--text-tertiary)]">{artist} · {duration}</div>
    </div>
    <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--bg-hover)]">
      <Icon name="star" size={16} className="text-[var(--text-tertiary)]" />
    </button>
    <button 
      onClick={onDownload}
      className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--bg-hover)]"
    >
      <Icon name="download" size={16} className="text-[var(--text-tertiary)]" />
    </button>
  </div>
);

// Text Template Tile
const TextTile = ({ preview, title, onDownload }) => (
  <div className="group relative aspect-square bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg overflow-hidden cursor-pointer">
    <div className="absolute inset-0 flex items-center justify-center p-3 text-white text-center">
      {typeof preview === 'string' ? (
        <span className="text-sm font-medium">{preview}</span>
      ) : preview}
    </div>
    <button
      onClick={(e) => { e.stopPropagation(); onDownload?.(); }}
      className="absolute bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 bg-[var(--accent-turquoise)] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <Icon name="download" size={14} className="text-white" />
    </button>
    <div className="absolute top-2 right-2 w-4 h-4">
      <Icon name="diamond" size={16} className="text-blue-400" />
    </div>
  </div>
);

// Generate Button
const GenerateButton = ({ onClick, loading, label = 'Generieren' }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="w-full h-10 bg-[var(--accent-turquoise)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
  >
    {loading ? (
      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    ) : (
      <Icon name="wand" size={16} />
    )}
    {label}
  </button>
);

// ============================================
// NAVIGATION KONFIGURATION
// ============================================

const NAVIGATION_CONFIG = {
  media: {
    title: 'Medien',
    sections: [
      { id: 'importieren', label: 'Importieren', icon: 'folder' },
      { id: 'deine', label: 'Deine', expandable: true, children: [
        { id: 'deine-gespeichert', label: 'Gespeichert' },
        { id: 'deine-projekte', label: 'Projekte' }
      ]},
      { id: 'ki-medien', label: 'KI-Medien', expandable: true, badge: '✦', children: [
        { id: 'ki-bild', label: 'KI-Bild' },
        { id: 'ki-video', label: 'KI-Video' },
        { id: 'ki-dialogszene', label: 'KI-Dialogszene' }
      ]},
      { id: 'speicher', label: 'Speicher', expandable: true, children: [
        { id: 'speicher-cloud', label: 'Cloud' },
        { id: 'speicher-lokal', label: 'Lokal' }
      ]},
      { id: 'bibliothek', label: 'Bibliothek', expandable: true, children: [
        { id: 'bibliothek-angesagt', label: 'Angesagt' },
        { id: 'bibliothek-weihnachten', label: 'Weihnachten' },
        { id: 'bibliothek-greenscreen', label: 'Greenscreen' },
        { id: 'bibliothek-hintergrund', label: 'Hintergrund' },
        { id: 'bibliothek-intro', label: 'Intro&Ende' },
        { id: 'bibliothek-uebergaenge', label: 'Übergänge' }
      ]},
      { id: 'dreamina', label: 'Dreamina' }
    ]
  },
  audio: {
    title: 'Audio',
    sections: [
      { id: 'audio-importieren', label: 'Importieren', icon: 'upload' },
      { id: 'audio-deine', label: 'Deine', expandable: true, children: [
        { id: 'audio-gespeichert', label: 'Gespeichert' }
      ]},
      { id: 'musik', label: 'Musik', expandable: true, children: [
        { id: 'musik-angesagt', label: 'Angesagt' },
        { id: 'musik-vlog', label: 'Vlog' },
        { id: 'musik-pop', label: 'Pop' },
        { id: 'musik-electronic', label: 'Electronic' }
      ]},
      { id: 'soundeffekte', label: 'Soundeffekte', expandable: true, children: [
        { id: 'sfx-angesagt', label: 'Angesagt' },
        { id: 'sfx-hits', label: 'Hits' },
        { id: 'sfx-tiktok', label: 'TikTok' },
        { id: 'sfx-asmr', label: 'ASMR' },
        { id: 'sfx-bewegung', label: 'Schnelle Beweg...' }
      ]},
      { id: 'ki-musik', label: 'KI-Musik', badge: 'NEU' },
      { id: 'ki-tts', label: 'Text-zu-Sprache', badge: 'AI' }
    ]
  },
  text: {
    title: 'Text',
    sections: [
      { id: 'text-hinzufuegen', label: 'Text hinzufügen', icon: 'plus' },
      { id: 'text-deine', label: 'Deine', expandable: true, children: [
        { id: 'text-gespeichert', label: 'Gespeichert' }
      ]},
      { id: 'texteffekte', label: 'Texteffekte', expandable: true, children: [
        { id: 'texteffekte-angesagt', label: 'Angesagt' },
        { id: 'texteffekte-klassik', label: 'Klassik' }
      ]},
      { id: 'textvorlage', label: 'Textvorlage', expandable: true, children: [
        { id: 'textvorlage-ki', label: 'KI-generiert' },
        { id: 'textvorlage-angesagt', label: 'Angesagt' },
        { id: 'textvorlage-neujahr', label: 'Neujahr' },
        { id: 'textvorlage-klassik', label: 'Klassik' },
        { id: 'textvorlage-neu', label: 'NEU' },
        { id: 'textvorlage-hits', label: 'Hits' }
      ]},
      { id: 'auto-untertitel', label: 'Automatische UT', badge: 'AI' }
    ]
  },
  sticker: {
    title: 'Sticker',
    sections: [
      { id: 'sticker-deine', label: 'Deine', expandable: true, children: [
        { id: 'sticker-gespeichert', label: 'Gespeichert' }
      ]},
      { id: 'sticker-angesagt', label: 'Angesagt' },
      { id: 'sticker-emojis', label: 'Emojis' },
      { id: 'sticker-giphy', label: 'GIPHY' },
      { id: 'sticker-formen', label: 'Formen' }
    ]
  },
  effects: {
    title: 'Effekte',
    sections: [
      { id: 'effekte-gespeichert', label: 'Gespeichert' },
      { id: 'videoeffekte', label: 'Videoeffekte', expandable: true, children: [
        { id: 'videoeffekte-angesagt', label: 'Angesagt' },
        { id: 'videoeffekte-basis', label: 'Basis' },
        { id: 'videoeffekte-retro', label: 'Retro' }
      ]},
      { id: 'koerpereffekte', label: 'Körpereffekte', expandable: true, children: [
        { id: 'koerpereffekte-angesagt', label: 'Angesagt' },
        { id: 'koerpereffekte-glow', label: 'Glow' }
      ]},
      { id: 'ki-effekte', label: 'KI-Effekte', badge: 'AI' }
    ]
  },
  transitions: {
    title: 'Übergänge',
    sections: [
      { id: 'uebergaenge-gespeichert', label: 'Gespeichert' },
      { id: 'uebergaenge-angesagt', label: 'Angesagt' },
      { id: 'uebergaenge-klassik', label: 'Klassik' },
      { id: 'uebergaenge-neu', label: 'NEU' },
      { id: 'uebergaenge-kamera', label: 'Kamera' },
      { id: 'uebergaenge-einfach', label: 'Einfach' }
    ]
  },
  subtitles: {
    title: 'Untertitel',
    sections: [
      { id: 'ut-automatisch', label: 'Automatische UT', badge: 'AI' },
      { id: 'ut-manuell', label: 'Manuell hinzufügen' },
      { id: 'ut-lyrics', label: 'Song-Lyrics', badge: 'AI' },
      { id: 'ut-stile', label: 'Untertitel-Stile' }
    ]
  },
  filter: {
    title: 'Filter',
    sections: [
      { id: 'filter-gespeichert', label: 'Gespeichert' },
      { id: 'filter-vorgestellt', label: 'Vorgestellt', expandable: true, children: [
        { id: 'filter-neujahr', label: 'Neujahr' },
        { id: 'filter-neu', label: 'NEU' },
        { id: 'filter-hits', label: 'Hits' }
      ]},
      { id: 'filter-leben', label: 'Leben' },
      { id: 'filter-filme', label: 'Filme' },
      { id: 'filter-mono', label: 'Mono' }
    ]
  },
  adjustment: {
    title: 'Anpassung',
    sections: [
      { id: 'anpassung-alle', label: 'Anpassung' },
      { id: 'anpassung-hintergrund', label: 'Hintergrund entf.', badge: 'AI' },
      { id: 'anpassung-gesicht', label: 'Gesicht optimieren', badge: 'AI' },
      { id: 'anpassung-stabilisierung', label: 'Stabilisierung' }
    ]
  },
  templates: {
    title: 'Vorlagen',
    sections: [
      { id: 'vorlagen-fuer-dich', label: 'Für dich' },
      { id: 'vorlagen-premium', label: 'Premium', badge: 'PRO' },
      { id: 'vorlagen-selfie', label: 'Selfie' },
      { id: 'vorlagen-reisen', label: 'Reisen' }
    ]
  },
  ai: {
    title: 'KI-Avatar',
    sections: [
      { id: 'ki-avatar-erstellen', label: 'Avatar erstellen', badge: 'NEU' },
      { id: 'ki-avatar-bibliothek', label: 'Bibliothek' },
      { id: 'ki-avatar-text-video', label: 'Text-zu-Video', badge: 'AI' },
      { id: 'ki-avatar-storyboard', label: 'Storyboard', badge: 'AI' }
    ]
  }
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function MediaInputPanel() {
  const { state, dispatch, activeMainTab } = useEditor();
  const [activeSection, setActiveSection] = useState('importieren');
  const [expandedGroups, setExpandedGroups] = useState(['ki-medien', 'bibliothek']);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const fileInputRef = useRef(null);
  
  // AI Settings
  const settings = loadAISettings();
  const [selectedModel, setSelectedModel] = useState(settings.defaultModel);
  
  // AI Form States
  const [aiPrompt, setAiPrompt] = useState('');
  const [ttsText, setTtsText] = useState('');
  const [ttsVoice, setTtsVoice] = useState('alloy');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [duration, setDuration] = useState('5s');

  const navConfig = NAVIGATION_CONFIG[activeMainTab] || NAVIGATION_CONFIG.media;

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  // ============================================
  // AI HANDLERS
  // ============================================

  const handleGenerateImage = async () => {
    if (!aiPrompt.trim()) return;
    setLoading(true);
    try {
      const result = await generateImage(aiPrompt, { size: '1024x1024' });
      setAiResult({ type: 'image', data: result });
    } catch (error) {
      console.error('Image generation error:', error);
    }
    setLoading(false);
  };

  const handleGenerateVideo = async () => {
    if (!aiPrompt.trim()) return;
    setLoading(true);
    try {
      const result = await generateStoryboard({ description: aiPrompt, duration: parseInt(duration) });
      setAiResult({ type: 'storyboard', data: result });
    } catch (error) {
      console.error('Video generation error:', error);
    }
    setLoading(false);
  };

  const handleGenerateTTS = async () => {
    if (!ttsText.trim()) return;
    setLoading(true);
    try {
      const audioBlob = await textToSpeech(ttsText, { voice: ttsVoice });
      const url = URL.createObjectURL(audioBlob);
      setAiResult({ type: 'audio', data: { url } });
    } catch (error) {
      console.error('TTS error:', error);
    }
    setLoading(false);
  };

  const handleGenerateMusic = async () => {
    setLoading(true);
    try {
      const result = await generateMusicSuggestion({ genre: 'electronic', mood: 'upbeat', duration: 30 });
      setAiResult({ type: 'music', data: result });
    } catch (error) {
      console.error('Music generation error:', error);
    }
    setLoading(false);
  };

  const handleImportMedia = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
      const mediaType = file.type.startsWith('video') ? 'video' 
        : file.type.startsWith('audio') ? 'audio' 
        : 'image';
      
      dispatch({
        type: 'ADD_MEDIA',
        payload: {
          id: `m${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: mediaType,
          size: file.size,
          duration: 5,
          thumbnail: null,
          file: file,
          url: URL.createObjectURL(file)
        }
      });
    });
  };

  // ============================================
  // RENDER NAVIGATION
  // ============================================

  const renderNavigation = () => (
    <div className="w-[180px] flex-shrink-0 border-r border-[var(--border-subtle)] p-2 overflow-y-auto">
      {navConfig.sections.map(section => {
        if (section.expandable) {
          return (
            <NavGroup 
              key={section.id} 
              label={section.label}
              badge={section.badge}
              defaultOpen={expandedGroups.includes(section.id)}
            >
              {section.children?.map(child => (
                <SubNavItem
                  key={child.id}
                  label={child.label}
                  isActive={activeSection === child.id}
                  onClick={() => setActiveSection(child.id)}
                />
              ))}
            </NavGroup>
          );
        }
        return (
          <NavItem
            key={section.id}
            label={section.label}
            icon={section.icon}
            badge={section.badge}
            isActive={activeSection === section.id}
            onClick={() => setActiveSection(section.id)}
          />
        );
      })}
    </div>
  );

  // ============================================
  // RENDER CONTENT
  // ============================================

  const renderContent = () => {
    // KI-Bild Content
    if (activeSection === 'ki-bild') {
      return (
        <div className="space-y-4">
          <div className="text-xs text-[var(--text-tertiary)] mb-2">Eingabeaufforderung</div>
          <button
            onClick={handleImportMedia}
            className="w-full p-4 bg-[var(--bg-surface)] border border-dashed border-[var(--border-subtle)] rounded-lg hover:border-[var(--accent-turquoise)] transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="plus" size={24} className="text-[var(--text-tertiary)]" />
          </button>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Beschreibe dein Bild und gib an, wie viele Ergebnisse du generieren möchtest (1-10)"
            className="w-full h-20 p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm resize-none focus:outline-none focus:border-[var(--accent-turquoise)]"
          />
          
          <div className="text-xs text-[var(--text-tertiary)] mb-2">Model</div>
          <div className="p-4 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)]">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded" />
              <div>
                <div className="text-sm font-medium text-[var(--text-primary)]">Seedream 4.0</div>
                <div className="text-xs text-[var(--text-tertiary)]">Erstelle eine Reihe zusammenhängender Bilder.</div>
              </div>
            </div>
            <div className="mb-4">
              <div className="text-xs text-[var(--text-tertiary)] mb-2">Seitenverhältnis</div>
              <select 
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full h-9 px-3 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded text-sm"
              >
                <option value="9:16">9:16</option>
                <option value="16:9">16:9</option>
                <option value="1:1">1:1</option>
              </select>
            </div>
            <GenerateButton onClick={handleGenerateImage} loading={loading} />
          </div>

          {aiResult?.type === 'image' && aiResult.data?.url && (
            <div className="mt-4">
              <img src={aiResult.data.url} alt="Generated" className="w-full rounded-lg" />
            </div>
          )}
        </div>
      );
    }

    // KI-Video Content
    if (activeSection === 'ki-video') {
      return (
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            <button className="flex-1 h-9 bg-[var(--accent-turquoise)]/20 text-[var(--accent-turquoise)] rounded-lg text-sm font-medium">
              Bild-zu-Video
            </button>
            <button className="flex-1 h-9 bg-[var(--bg-surface)] text-[var(--text-secondary)] rounded-lg text-sm">
              Text-zu-Video
            </button>
          </div>

          <div className="text-xs text-[var(--text-tertiary)] mb-2">Eingabeaufforderung</div>
          <button className="w-full p-4 bg-[var(--bg-surface)] border border-dashed border-[var(--border-subtle)] rounded-lg hover:border-[var(--accent-turquoise)] transition-colors flex items-center justify-center gap-2">
            <Icon name="image" size={20} className="text-[var(--text-tertiary)]" />
            <span className="text-sm text-[var(--text-secondary)]">Bild importieren</span>
          </button>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="(Optional) Beschreibe das Video, das du generieren möchtest."
            className="w-full h-20 p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm resize-none focus:outline-none focus:border-[var(--accent-turquoise)]"
          />

          <div className="text-xs text-[var(--text-tertiary)] mb-2">Model</div>
          <div className="p-4 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)]">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded" />
              <div>
                <div className="text-sm font-medium text-[var(--text-primary)]">Seedance 1.0 Fast</div>
                <div className="text-xs text-[var(--text-tertiary)]">Gleichmäßige, stabile Bewegung und schnellere Generierung.</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <div className="text-xs text-[var(--text-tertiary)] mb-2">Dauer</div>
                <select 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full h-9 px-3 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded text-sm"
                >
                  <option value="5s">5s</option>
                  <option value="10s">10s</option>
                </select>
              </div>
              <div>
                <div className="text-xs text-[var(--text-tertiary)] mb-2">Seitenverhältnis</div>
                <select 
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full h-9 px-3 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded text-sm"
                >
                  <option value="9:16">9:16</option>
                  <option value="16:9">16:9</option>
                  <option value="1:1">1:1</option>
                </select>
              </div>
            </div>
            <GenerateButton onClick={handleGenerateVideo} loading={loading} />
          </div>

          {aiResult?.type === 'storyboard' && (
            <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-lg">
              <div className="text-xs text-[var(--text-tertiary)] mb-2">Storyboard</div>
              <pre className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{aiResult.data}</pre>
            </div>
          )}
        </div>
      );
    }

    // Text-zu-Sprache (TTS) Content
    if (activeSection === 'ki-tts') {
      return (
        <div className="space-y-4">
          <div className="text-sm font-medium text-[var(--text-primary)] mb-3">Text-zu-Sprache</div>
          <textarea
            value={ttsText}
            onChange={(e) => setTtsText(e.target.value)}
            placeholder="Gib deinen Text ein..."
            className="w-full h-32 p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm resize-none focus:outline-none focus:border-[var(--accent-turquoise)]"
          />
          <div className="text-xs text-[var(--text-tertiary)]">{ttsText.length} Zeichen</div>
          
          <div>
            <div className="text-xs text-[var(--text-tertiary)] mb-2">Stimme</div>
            <select 
              value={ttsVoice}
              onChange={(e) => setTtsVoice(e.target.value)}
              className="w-full h-9 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-sm"
            >
              <option value="alloy">Alloy (Neutral)</option>
              <option value="echo">Echo (Männlich)</option>
              <option value="nova">Nova (Weiblich)</option>
              <option value="onyx">Onyx (Tief)</option>
              <option value="shimmer">Shimmer (Sanft)</option>
            </select>
          </div>
          
          <GenerateButton onClick={handleGenerateTTS} loading={loading} label="Audio erstellen" />

          {aiResult?.type === 'audio' && aiResult.data?.url && (
            <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-lg">
              <audio src={aiResult.data.url} controls className="w-full" />
            </div>
          )}
        </div>
      );
    }

    // KI-Musik Content
    if (activeSection === 'ki-musik') {
      return (
        <div className="space-y-4">
          <div className="text-sm font-medium text-[var(--text-primary)] mb-3">KI-Musik Generator</div>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Beschreibe die gewünschte Musik... z.B. 'Upbeat electronic für YouTube intro'"
            className="w-full h-20 p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm resize-none focus:outline-none focus:border-[var(--accent-turquoise)]"
          />
          <GenerateButton onClick={handleGenerateMusic} loading={loading} label="Musik-Vorschlag" />

          {aiResult?.type === 'music' && (
            <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-lg">
              <div className="text-xs text-[var(--text-tertiary)] mb-2">Musik-Vorschlag</div>
              <pre className="text-sm text-[var(--text-primary)] whitespace-pre-wrap max-h-[200px] overflow-y-auto">{aiResult.data}</pre>
            </div>
          )}
        </div>
      );
    }

    // Auto-Untertitel Content
    if (activeSection === 'ut-automatisch' || activeSection === 'auto-untertitel') {
      return (
        <div className="space-y-4">
          <div className="text-sm font-medium text-[var(--text-primary)] mb-3">Automatische Untertitel</div>
          <div className="p-4 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)]">
            <div className="flex items-center gap-3 mb-4">
              <Icon name="audio" size={24} className="text-[var(--accent-turquoise)]" />
              <div>
                <div className="text-sm font-medium">OpenAI Whisper</div>
                <div className="text-xs text-[var(--text-tertiary)]">Transkribiert Audio zu Text mit Timestamps</div>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={handleImportMedia}
              className="w-full h-10 mb-4 bg-[var(--bg-panel)] border border-dashed border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-secondary)] hover:border-[var(--accent-turquoise)]"
            >
              Audio/Video hochladen
            </button>
            <div>
              <div className="text-xs text-[var(--text-tertiary)] mb-2">Sprache</div>
              <select className="w-full h-9 px-3 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded text-sm">
                <option>Deutsch</option>
                <option>Englisch</option>
                <option>Spanisch</option>
              </select>
            </div>
          </div>
          <GenerateButton onClick={() => {}} loading={loading} label="Untertitel generieren" />
        </div>
      );
    }

    // Importieren Content
    if (activeSection === 'importieren' || activeSection === 'audio-importieren') {
      return (
        <div className="space-y-4">
          <div className="text-sm font-medium text-[var(--text-primary)] mb-3">Medien</div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={handleImportMedia}
            className="w-full p-6 bg-[var(--bg-surface)] border border-dashed border-[var(--border-subtle)] rounded-lg hover:border-[var(--accent-turquoise)] transition-colors flex flex-col items-center justify-center gap-3"
          >
            <Icon name="folder" size={48} className="text-[var(--text-tertiary)]" />
            <span className="text-sm text-[var(--text-secondary)]">Medien importieren</span>
          </button>
          <button className="w-full h-10 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm flex items-center justify-center gap-2 hover:border-[var(--accent-turquoise)]">
            <Icon name="image" size={16} />
            Bild-zu-Video
          </button>
          <button className="w-full h-10 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm flex items-center justify-center gap-2 hover:border-[var(--accent-turquoise)]">
            <Icon name="text" size={16} />
            Text-zu-Video
          </button>

          {/* Imported Media Grid */}
          {state.media.length > 0 && (
            <div className="mt-6">
              <div className="text-sm font-medium text-[var(--text-primary)] mb-3">
                Importiert ({state.media.length})
              </div>
              <div className="grid grid-cols-2 gap-2">
                {state.media.map(item => (
                  <MediaTile
                    key={item.id}
                    thumbnail={item.thumbnail || item.url}
                    title={item.name}
                    duration={item.duration ? `${Math.floor(item.duration / 60)}:${String(item.duration % 60).padStart(2, '0')}` : null}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Bibliothek Content
    if (activeSection.startsWith('bibliothek-')) {
      return (
        <div className="space-y-4">
          <SearchBar placeholder="Finde Videos und Fotos" value={searchQuery} onChange={setSearchQuery} />
          <div className="text-sm font-medium text-[var(--text-primary)] mb-3">Angesagt</div>
          <div className="grid grid-cols-3 gap-2">
            {[...Array(9)].map((_, i) => (
              <MediaTile
                key={i}
                duration={`00:${String(10 + i * 5).padStart(2, '0')}`}
                title={`Video ${i + 1}`}
              />
            ))}
          </div>
        </div>
      );
    }

    // Soundeffekte Content
    if (activeSection.startsWith('sfx-') || activeSection.startsWith('musik-')) {
      return (
        <div className="space-y-4">
          <SearchBar placeholder="Soundeffekte suchen" value={searchQuery} onChange={setSearchQuery} />
          <div className="text-sm font-medium text-[var(--text-primary)] mb-3">Angesagt</div>
          <div className="space-y-2">
            {['Klick Sound', 'Swoosh', 'Typing', 'Pop', 'Whoosh'].map((name, i) => (
              <AudioItem key={i} title={name} artist="Sound Studio" duration="00:01" />
            ))}
          </div>
        </div>
      );
    }

    // Textvorlage Content
    if (activeSection.startsWith('textvorlage-')) {
      return (
        <div className="space-y-4">
          <div className="text-sm font-medium text-[var(--text-primary)] mb-3">Angesagt</div>
          <div className="grid grid-cols-3 gap-2">
            {['CINEMATIC', 'The End', 'Modern', 'CASUAL', '2026', 'EXCLUSIVE'].map((text, i) => (
              <TextTile key={i} preview={text} title={text} />
            ))}
          </div>
        </div>
      );
    }

    // Default: Empty State
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Icon name="folder" size={48} className="text-[var(--text-tertiary)] mb-4" />
        <div className="text-sm text-[var(--text-secondary)]">
          Wähle eine Kategorie aus
        </div>
      </div>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="flex h-full bg-[var(--bg-panel)]">
      {/* Left Navigation */}
      {renderNavigation()}

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
}
