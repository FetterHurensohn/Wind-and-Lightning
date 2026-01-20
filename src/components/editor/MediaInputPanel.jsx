/**
 * MediaInputPanel.jsx - Zwei-Bereich Layout nach CapCut
 * 
 * Struktur:
 * - Linker Bereich (200px): Navigation mit Kategorien
 * - Vertikale Trennlinie
 * - Rechter Bereich (flex-1): Content der ausgewählten Kategorie
 */

import React, { useState } from 'react';
import { useEditor } from './EditorLayout';
import Icon from './Icon';
import electronAPI from '../../electron';

// Navigation Category Component
const NavCategory = ({ title, children, defaultOpen = false, onSelect, isActive }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const hasChildren = children && React.Children.count(children) > 0;

  return (
    <div className="mb-1">
      <button
        onClick={() => {
          if (hasChildren) {
            setIsOpen(!isOpen);
          }
          if (onSelect) onSelect();
        }}
        className={`
          w-full h-7 px-3 flex items-center gap-2 text-left rounded transition-colors text-sm
          ${isActive
            ? 'bg-[var(--capcut-nav-active)] text-[var(--text-primary)] font-medium'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}
        `}
        title={title}
      >
        {hasChildren && (
          <Icon name={isOpen ? 'chevronDown' : 'chevronRight'} size={12} />
        )}
        <span className="flex-1 truncate">{title}</span>
      </button>
      {isOpen && hasChildren && (
        <div className="ml-4 mt-1 space-y-0.5">
          {children}
        </div>
      )}
    </div>
  );
};

// Sub Navigation Item Component
const NavSubItem = ({ children, onClick, isActive }) => (
  <button
    onClick={onClick}
    className={`
      w-full h-6 px-3 text-left text-sm rounded transition-colors truncate
      ${isActive
        ? 'bg-[var(--capcut-nav-active)] text-[var(--text-primary)] font-medium'
        : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}
    `}
    title={children}
  >
    {children}
  </button>
);

// Empty State Component - Zentrale Nachricht mit Icon
const EmptyState = ({ icon, title, subtitle }) => (
  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
    <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-xl bg-[var(--bg-surface)]">
      <Icon name={icon} size={32} strokeWidth={1.5} className="text-[var(--text-tertiary)]" />
    </div>
    <div className="text-base font-medium text-[var(--text-primary)] mb-2">{title}</div>
    {subtitle && (
      <div className="text-sm text-[var(--text-tertiary)] max-w-md">{subtitle}</div>
    )}
  </div>
);

// Search Bar Component
const SearchBar = ({ placeholder, value, onChange }) => (
  <div className="relative">
    <Icon
      name="search"
      size={18}
      strokeWidth={1.5}
      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
    />
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full h-9 pl-10 pr-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-normal)] focus:outline-none transition-colors"
    />
  </div>
);

// Info Banner Component - Dismissable
const InfoBanner = ({ message, onDismiss }) => (
  <div className="flex items-start gap-3 p-3 bg-[var(--capcut-info-bg)] border border-[var(--capcut-info-border)] rounded-md">
    <Icon name="info" size={16} strokeWidth={1.5} className="text-[var(--capcut-accent-turquoise)] flex-shrink-0 mt-0.5" />
    <div className="flex-1 text-xs text-[var(--text-secondary)] leading-relaxed">{message}</div>
    <button
      onClick={onDismiss}
      className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors"
      title="Schließen"
    >
      <Icon name="close" size={14} strokeWidth={1.5} className="text-[var(--text-tertiary)]" />
    </button>
  </div>
);

// Video Thumbnail Component - mit Duration Badge und Download Button
const VideoThumbnail = ({ thumbnail, duration, title, onDownload }) => (
  <div className="group relative bg-[var(--bg-surface)] rounded-md overflow-hidden border border-[var(--border-subtle)] hover:border-[var(--border-normal)] transition-all cursor-pointer">
    {/* Thumbnail */}
    <div className="aspect-video bg-[var(--bg-panel)] flex items-center justify-center relative">
      {thumbnail ? (
        <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
      ) : (
        <Icon name="video" size={32} strokeWidth={1.5} className="text-[var(--text-tertiary)]" />
      )}

      {/* Duration Badge - unten links */}
      {duration && (
        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 rounded text-xs text-white font-medium">
          {duration}
        </div>
      )}

      {/* Play Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Icon name="play" size={20} strokeWidth={2} className="text-white ml-0.5" />
        </div>
      </div>

      {/* Download Button - unten rechts, nur bei Hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDownload?.();
        }}
        className="absolute bottom-2 right-2 w-7 h-7 rounded bg-black/60 hover:bg-[var(--capcut-accent-turquoise)] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
        title="Herunterladen"
      >
        <Icon name="export" size={16} strokeWidth={1.5} />
      </button>
    </div>
  </div>
);

// Tab Bar Component - Horizontale Tabs
const TabBar = ({ tabs, activeTab, onChange }) => (
  <div className="flex gap-2 mb-4">
    {tabs.map(tab => (
      <button
        key={tab}
        onClick={() => onChange(tab)}
        className={`
          px-4 py-2 rounded-md text-sm font-medium transition-colors
          ${activeTab === tab
            ? 'bg-[var(--capcut-nav-active)] text-[var(--text-primary)]'
            : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}
        `}
      >
        {tab}
      </button>
    ))}
  </div>
);

// Dropdown Field Component
const DropdownField = ({ label, value, options, onChange }) => (
  <div className="space-y-2">
    <div className="text-xs text-[var(--text-tertiary)]">{label}</div>
    <select
      value={value}
      onChange={onChange}
      className="w-full h-9 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm text-[var(--text-primary)] focus:border-[var(--border-normal)] focus:outline-none transition-colors cursor-pointer"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// Checkbox Field Component - Für Bilinguale Untertitel etc.
const CheckboxField = ({ label, checked, icon, onChange }) => (
  <div className="flex items-center gap-3 p-3 bg-[var(--bg-surface)] rounded-md border border-[var(--border-subtle)]">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4 rounded border-[var(--border-subtle)] text-[var(--capcut-accent-turquoise)] focus:ring-[var(--capcut-accent-turquoise)] cursor-pointer"
    />
    <span className="text-sm text-[var(--text-primary)]">{label}</span>
    {icon && <Icon name={icon} size={16} className="text-[var(--capcut-accent-turquoise)] ml-auto" />}
  </div>
);

// Generate Button Component - Türkis mit Badge
const GenerateButton = ({ onClick, usageCount }) => (
  <button
    onClick={onClick}
    className="w-full h-10 bg-[var(--capcut-accent-turquoise)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
  >
    <Icon name="wand" size={16} strokeWidth={1.5} />
    Generieren
    {usageCount !== undefined && (
      <span className="ml-auto px-2 py-0.5 bg-[var(--capcut-accent-purple)] rounded text-xs font-bold">
        {usageCount} Nutzung{usageCount !== 1 ? 'en' : ''}
      </span>
    )}
  </button>
);

// Upload Card Component - Große Upload-Card mit gestricheltem Border
const UploadCard = ({ icon, text, subtitle, onClick }) => (
  <button
    onClick={onClick}
    className="w-full p-6 bg-[var(--bg-surface)] border-2 border-dashed border-[var(--border-subtle)] rounded-md hover:border-[var(--border-normal)] transition-colors flex flex-col items-center justify-center gap-3"
  >
    <Icon name={icon} size={48} strokeWidth={1.5} className="text-[var(--text-tertiary)]" />
    <span className="text-sm text-[var(--text-secondary)]">{text}</span>
    {subtitle && <span className="text-xs text-[var(--text-tertiary)] mt-1">{subtitle}</span>}
  </button>
);

// Template Card Component - Template-Thumbnail mit Badge und Stats
const TemplateCard = ({ thumbnail, badge, likes, clipCount, title, onClick }) => (
  <div
    onClick={onClick}
    className="group cursor-pointer rounded-lg overflow-hidden bg-[var(--bg-surface)] hover:ring-2 hover:ring-[var(--accent-primary)] transition-all"
  >
    {/* Thumbnail Container */}
    <div className="relative aspect-[9/16] bg-[var(--bg-hover)]">
      {thumbnail ? (
        <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Icon name="video" size={48} className="text-[var(--text-tertiary)]" />
        </div>
      )}

      {/* Badge */}
      {badge && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-blue-900/90 rounded text-xs text-white font-medium">
          {badge}
        </div>
      )}
    </div>

    {/* Footer Stats */}
    <div className="p-2 space-y-1">
      <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
        <span className="flex items-center gap-1">
          <Icon name="heart" size={14} />
          {likes}
        </span>
        <span className="flex items-center gap-1">
          <Icon name="image" size={14} />
          {clipCount}
        </span>
        <Icon name="download" size={14} className="ml-auto" />
      </div>
      <div className="text-sm text-[var(--text-primary)] truncate">{title}</div>
    </div>
  </div>
);

// Voice Dropdown Component - Dropdown mit Chevron-Icon
const VoiceDropdown = ({ value, onChange, options }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      className="w-full h-10 pl-3 pr-10 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm text-[var(--text-primary)] appearance-none cursor-pointer focus:border-[var(--border-normal)] focus:outline-none transition-colors"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <Icon
      name="chevronDown"
      size={16}
      strokeWidth={1.5}
      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-tertiary)]"
    />
  </div>
);

// Required Label Component - Label mit rotem Stern
const RequiredLabel = ({ children }) => (
  <div className="text-xs text-[var(--text-tertiary)] mb-2">
    {children} <span className="text-red-500">*</span>
  </div>
);

// Section Header Component - Für KI-Kategorien
const SectionHeader = ({ children }) => (
  <div className="text-sm font-medium text-[var(--text-primary)] mb-3">
    {children}
  </div>
);

// Audio List Item Component - Für Musik und Soundeffekte
const AudioListItem = ({ thumbnail, title, artist, duration, onFavorite, onDownload }) => (
  <div className="flex items-center gap-3 p-3 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-normal)] transition-colors">
    {/* Thumbnail */}
    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded flex-shrink-0 flex items-center justify-center">
      <Icon name="music" size={24} strokeWidth={1.5} className="text-white" />
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium text-[var(--text-primary)] truncate">{title}</div>
      <div className="text-xs text-[var(--text-tertiary)]">{artist} · {duration}</div>
    </div>

    {/* Actions */}
    <div className="flex items-center gap-2">
      <button
        onClick={onFavorite}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors"
        title="Favorit"
      >
        <Icon name="star" size={18} strokeWidth={1.5} className="text-[var(--text-secondary)]" />
      </button>
      <button
        onClick={onDownload}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors"
        title="Herunterladen"
      >
        <Icon name="download" size={18} strokeWidth={1.5} className="text-[var(--text-secondary)]" />
      </button>
    </div>
  </div>
);

// Text Effect Tile Component - Für Texteffekte mit Hover-Icons
const TextEffectTile = ({ text, style, onFavorite, onDownload }) => (
  <div className="relative aspect-square bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-normal)] transition-colors overflow-hidden group cursor-pointer">
    {/* Preview */}
    <div className="absolute inset-0 flex items-center justify-center">
      <span className={`text-4xl font-bold ${style}`}>{text}</span>
    </div>

    {/* Favorite Icon (top left) */}
    <button
      onClick={(e) => { e.stopPropagation(); onFavorite(); }}
      className="absolute top-2 left-2 w-7 h-7 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      title="Favorit"
    >
      <Icon name="star" size={14} strokeWidth={1.5} className="text-white" />
    </button>

    {/* Download Icon (bottom center) */}
    <button
      onClick={(e) => { e.stopPropagation(); onDownload(); }}
      className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-[var(--capcut-accent-turquoise)] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      title="Herunterladen"
    >
      <Icon name="download" size={16} strokeWidth={1.5} className="text-white" />
    </button>
  </div>
);

// Text Template Tile Component - Für Textvorlagen mit Hover-Icons
const TextTemplateTile = ({ preview, title, style, onFavorite, onDownload }) => (
  <div className="relative aspect-square bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg overflow-hidden group cursor-pointer">
    {/* Preview Content */}
    <div className="absolute inset-0 flex items-center justify-center p-4 text-white">
      <div className={`text-center ${style || ''}`}>
        {typeof preview === 'string' ? <span className="text-lg font-medium">{preview}</span> : preview}
      </div>
    </div>

    {/* Favorite Icon */}
    <button
      onClick={(e) => { e.stopPropagation(); onFavorite(); }}
      className="absolute top-2 left-2 w-7 h-7 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      title="Favorit"
    >
      <Icon name="star" size={14} strokeWidth={1.5} className="text-white" />
    </button>

    {/* Download Icon */}
    <button
      onClick={(e) => { e.stopPropagation(); onDownload(); }}
      className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-[var(--capcut-accent-turquoise)] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      title="Herunterladen"
    >
      <Icon name="download" size={16} strokeWidth={1.5} className="text-white" />
    </button>
  </div>
);

// Sticker Tile Component - Für Sticker mit Hover-Icons
const StickerTile = ({ thumbnail, onFavorite, onDownload }) => (
  <div className="relative aspect-square bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-normal)] transition-colors overflow-hidden group cursor-pointer">
    {/* Thumbnail */}
    <div className="absolute inset-0 flex items-center justify-center p-4">
      {thumbnail}
    </div>

    {/* Favorite Icon (top left) */}
    <button
      onClick={(e) => { e.stopPropagation(); onFavorite(); }}
      className="absolute top-2 left-2 w-7 h-7 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      title="Favorit"
    >
      <Icon name="star" size={14} strokeWidth={1.5} className="text-white" />
    </button>

    {/* Download Icon (bottom center) */}
    <button
      onClick={(e) => { e.stopPropagation(); onDownload(); }}
      className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-[var(--bg-surface)] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      title="Herunterladen"
    >
      <Icon name="download" size={16} strokeWidth={1.5} />
    </button>
  </div>
);

// Form Tile Component - Für Formen
const FormTile = ({ icon, name, onClick }) => (
  <button
    onClick={onClick}
    className="aspect-square bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-normal)] transition-colors flex items-center justify-center p-6 group cursor-pointer"
    title={name}
  >
    <Icon name={icon} size={48} strokeWidth={1.5} className="text-[var(--capcut-accent-turquoise)] group-hover:scale-110 transition-transform" />
  </button>
);

// Effect Tile Component - Für Video- und Körpereffekte und Übergänge
const EffectTile = ({ thumbnail, title, onFavorite, onDownload, iconName = 'effects' }) => (
  <div className="relative group cursor-pointer">
    {/* Thumbnail mit aspect-video */}
    <div className="aspect-video bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-normal)] transition-colors overflow-hidden relative">
      {/* Thumbnail/Preview */}
      <div className="absolute inset-0">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Icon name={iconName} size={32} strokeWidth={1.5} className="text-white opacity-50" />
          </div>
        )}
      </div>

      {/* Favorite Icon (top left) */}
      <button
        onClick={(e) => { e.stopPropagation(); onFavorite(); }}
        className="absolute top-2 left-2 w-7 h-7 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        title="Favorit"
      >
        <Icon name="star" size={14} strokeWidth={1.5} className="text-white" />
      </button>

      {/* Download Icon (bottom center) */}
      <button
        onClick={(e) => { e.stopPropagation(); onDownload(); }}
        className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-[var(--bg-surface)] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        title="Herunterladen"
      >
        <Icon name="download" size={16} strokeWidth={1.5} />
      </button>
    </div>

    {/* Title unterhalb des Thumbnails */}
    <div className="mt-2 text-xs text-[var(--text-secondary)] truncate">
      {title}
    </div>
  </div>
);

// Filter Tile Component - Für Filter mit aspect-square
const FilterTile = ({ thumbnail, title, onFavorite, onDownload }) => (
  <div className="relative group cursor-pointer">
    {/* Thumbnail mit aspect-square (WICHTIG für Filter!) */}
    <div className="aspect-square bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-normal)] transition-colors overflow-hidden relative">
      {/* Thumbnail/Preview */}
      <div className="absolute inset-0">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Icon name="filter" size={32} strokeWidth={1.5} className="text-white opacity-50" />
          </div>
        )}
      </div>

      {/* Favorite Icon (top left) - BLAUER Hintergrund für Filter */}
      <button
        onClick={(e) => { e.stopPropagation(); onFavorite(); }}
        className="absolute top-2 left-2 w-7 h-7 bg-blue-500/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        title="Favorit"
      >
        <Icon name="star" size={14} strokeWidth={1.5} className="text-white" />
      </button>

      {/* Download Icon (bottom center) */}
      <button
        onClick={(e) => { e.stopPropagation(); onDownload(); }}
        className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-[var(--bg-surface)] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        title="Herunterladen"
      >
        <Icon name="download" size={16} strokeWidth={1.5} />
      </button>
    </div>

    {/* Title unterhalb des Thumbnails */}
    <div className="mt-2 text-xs text-[var(--text-secondary)] truncate">
      {title}
    </div>
  </div>
);

// Input Prompt Card Component - Aktualisiert für CapCut-Design
const InputPromptCard = ({ onUpload, placeholder }) => (
  <div className="p-4 bg-[var(--bg-surface)] rounded-md border border-[var(--border-subtle)]">
    <div className="text-xs text-[var(--text-tertiary)] mb-3">Eingabeaufforderung</div>

    {onUpload && (
      <button
        onClick={onUpload}
        className="w-full mb-3 p-3 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded flex items-center justify-center gap-2 text-sm text-[var(--text-secondary)] hover:border-[var(--border-normal)] hover:text-[var(--text-primary)] transition-colors"
      >
        <Icon name="image" size={20} strokeWidth={1.5} />
        Bild importieren
      </button>
    )}

    <textarea
      placeholder={placeholder || "(Optional) Beschreibe das Video, das du generieren möchtest. Zum Beispiel: Wellen rauschen über den Strand."}
      className="w-full h-20 p-3 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-normal)] focus:outline-none resize-none transition-colors"
    />
  </div>
);

// Model Card Component - Aktualisiert für CapCut-Design
const ModelCard = ({ name, description, onGenerate, children }) => (
  <div className="p-4 bg-[var(--bg-surface)] rounded-md border border-[var(--border-subtle)]">
    <div className="text-xs text-[var(--text-tertiary)] mb-3">Model</div>
    <div className="flex items-start gap-3 mb-4">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded flex-shrink-0"></div>
      <div className="flex-1">
        <div className="text-sm font-medium text-[var(--text-primary)] mb-1">{name}</div>
        <div className="text-xs text-[var(--text-tertiary)] leading-relaxed">{description}</div>
      </div>
    </div>

    {/* Children für Dropdowns */}
    {children && (
      <div className="space-y-3 mb-4">
        {children}
      </div>
    )}

    <GenerateButton onClick={onGenerate} usageCount={1} />
  </div>
);

// Media Grid Component (Dashboard-Style)
const MediaGrid = ({ media, onDelete }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {media.map(item => (
        <div
          key={item.id}
          className="group relative bg-[var(--bg-surface)] rounded overflow-hidden border border-[var(--border-subtle)] hover:border-[var(--border-normal)] transition-all cursor-move"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('mediaId', item.id);
            e.dataTransfer.effectAllowed = 'copy';
          }}
        >
          {/* Thumbnail - aspect-video wie Dashboard */}
          <div className="aspect-video bg-[var(--bg-panel)] flex items-center justify-center">
            <Icon
              name={item.type === 'video' ? 'video' : item.type === 'audio' ? 'audio' : 'image'}
              size={32}
              strokeWidth={1.5}
              className="text-[var(--text-tertiary)]"
            />
          </div>

          {/* Info UNTER dem Thumbnail */}
          <div className="p-2">
            <div className="text-xs font-medium text-[var(--text-primary)] truncate mb-1">
              {item.name}
            </div>
            <div className="text-xs text-[var(--text-tertiary)] flex items-center gap-2">
              <span>{(item.size / 1024 / 1024).toFixed(1)}M</span>
              {item.duration && <span>| {Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, '0')}</span>}
            </div>
          </div>

          {/* Delete Button - NUR bei Hover sichtbar */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="absolute top-2 right-2 w-6 h-6 rounded bg-black/60 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            title="Löschen"
          >
            <Icon name="close" size={14} strokeWidth={1.5} />
          </button>
        </div>
      ))}
    </div>
  );
};

// Import Button Component
const ImportButton = ({ icon, label, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full h-10 px-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded hover:border-[var(--border-normal)] hover:bg-[var(--bg-hover)] transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <Icon name={icon} size={20} strokeWidth={1.5} />
    <span className="text-sm text-[var(--text-primary)]">{label}</span>
  </button>
);

// Main Component
// Mock Audio Data für Demo
const mockMusicData = {
  'musik-angesagt': [
    { id: 1, title: 'Coconut Groove', artist: 'Hyperstring', duration: '03:23' },
    { id: 2, title: 'The Giraffe Comedy', artist: 'Stock Inventions', duration: '01:27' },
    { id: 3, title: 'Kids Happy', artist: 'SoundForYou', duration: '01:58' },
    { id: 4, title: 'Violin Inspiration', artist: 'Stanislav Barantsov', duration: '01:22' },
    { id: 5, title: 'Relaxed', artist: 'MC Mablo Dos Paredões', duration: '00:58' },
    { id: 6, title: "Let's go", artist: 'Official Sound Studio', duration: '00:20' }
  ],
  'musik-vlog': [
    { id: 7, title: 'Vlog Groove', artist: 'Ibnusta', duration: '03:07' }
  ]
};

const mockSoundEffectsData = {
  'soundeffekte-angesagt': [
    { id: 1, title: '按下悄悄快门2', artist: 'Hertz Box Music', duration: '00:01' },
    { id: 2, title: '鼠标单击1', artist: 'Hertz Box Music', duration: '00:01' },
    { id: 3, title: '理想的 Swoosh', artist: '火花音说', duration: '00:01' },
    { id: 4, title: 'Keyboard Typing 01', artist: '快名', duration: '00:03' },
    { id: 5, title: 'Yeah! (Shout Japanese style, Ninja, Karate, Judo) - 5 year old girl(1313146)', artist: 'kodomosize creation', duration: '00:01' },
    { id: 6, title: 'Short Whoosh 2', artist: '快名', duration: '00:01' }
  ]
};

// Mock Text Effects Data für Demo
const mockTextEffectsData = {
  'texteffekte-angesagt': [
    { id: 1, text: 'ART', style: 'bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent' },
    { id: 2, text: 'ART', style: 'bg-gradient-to-r from-yellow-400 to-green-400 bg-clip-text text-transparent' },
    { id: 3, text: 'ART', style: 'bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent' },
    { id: 4, text: 'ART', style: 'text-cyan-300' },
    { id: 5, text: 'ART', style: 'bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent' },
    { id: 6, text: 'ART', style: 'bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent border-2 border-yellow-500' },
    { id: 7, text: 'ART', style: 'bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent' },
    { id: 8, text: 'ART', style: 'bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent' },
    { id: 9, text: 'ART', style: 'bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent' },
    { id: 10, text: 'ART', style: 'text-cyan-400' }
  ]
};

// Mock Text Templates Data für Demo
const mockTextTemplatesData = {
  'textvorlage-angesagt': [
    { id: 1, preview: 'CINEMATIC', title: 'Cinematic', style: 'font-bold tracking-widest' },
    { id: 2, preview: 'The End', title: 'The End', style: 'font-serif italic text-2xl' },
    { id: 3, preview: 'Enjoy your life.', title: 'Enjoy', style: 'text-base' },
    { id: 4, preview: <><span className="text-green-400 text-xl">Modern</span><br /><span className="text-xs">minimalist title</span></>, title: 'Modern' },
    { id: 5, preview: 'Keep shining,\nthe world needs\nyour light.', title: 'Inspirational', style: 'text-sm leading-tight' },
    { id: 6, preview: 'becoming the\nbest version of\nmyself.', title: 'Motivation', style: 'text-xs leading-tight' },
    { id: 7, preview: 'CASUAL', title: 'Casual', style: 'font-bold text-2xl' },
    { id: 8, preview: 'Every story begins\nwith courage', title: 'Story', style: 'text-xs' },
    { id: 9, preview: <><span className="text-blue-400 font-bold">MINIMALIST TEXT</span></>, title: 'Minimalist' },
    { id: 10, preview: <><span className="text-yellow-400 font-black text-xl">DON&apos;T<br />MISS IT!</span></>, title: 'Bold' },
    { id: 11, preview: <><span className="text-yellow-300 font-bold text-2xl">2026</span><br /><span className="text-xs">COUNTDOWN</span></>, title: 'Countdown' },
    { id: 12, preview: <><span className="text-cyan-300 font-bold tracking-wider">EXCLUSIVE</span></>, title: 'Exclusive' },
  ]
};

// Mock Stickers Data für Demo
const mockStickersData = {
  'sticker-angesagt': [
    { id: 1, thumbnail: <div className="w-16 h-16 rounded-full border-4 border-cyan-400 animate-pulse" /> },
    { id: 2, thumbnail: <div className="flex gap-1">{[...Array(5)].map((_, i) => <div key={i} className="w-1 bg-cyan-400" style={{ height: `${(i + 1) * 8}px` }} />)}</div> },
    { id: 3, thumbnail: <div className="text-4xl text-cyan-400 font-bold">✕</div> },
    { id: 4, thumbnail: <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-lg font-bold text-white">REC</span></div> },
    { id: 5, thumbnail: <div className="text-cyan-400 text-2xl">💬</div> },
    { id: 6, thumbnail: <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600" /> },
    { id: 7, thumbnail: <div className="text-white text-3xl font-bold">2</div> },
    { id: 8, thumbnail: <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" /><span className="text-sm font-bold text-cyan-400">REC</span></div> },
    { id: 9, thumbnail: <div className="text-red-500 text-3xl">○</div> },
    { id: 10, thumbnail: <div className="w-8 h-8 rounded-full border-2 border-cyan-400" /> },
    { id: 11, thumbnail: <div className="text-cyan-400 text-2xl">★</div> },
    { id: 12, thumbnail: <div className="text-white text-2xl">◆</div> },
    { id: 13, thumbnail: <div className="text-cyan-400 text-2xl">♪</div> },
    { id: 14, thumbnail: <div className="text-white text-2xl">▶</div> },
    { id: 15, thumbnail: <div className="text-cyan-400 text-2xl">☁</div> }
  ]
};

// Forms Data
const formsData = [
  { id: 'square', icon: 'square', name: 'Quadrat' },
  { id: 'circle', icon: 'circle', name: 'Kreis' },
  { id: 'triangle', icon: 'triangle', name: 'Dreieck' },
  { id: 'diamond', icon: 'diamond', name: 'Parallelogramm' },
  { id: 'trapezoid', icon: 'trapezoid', name: 'Trapez' },
  { id: 'line', icon: 'minus', name: 'Linie' },
  { id: 'arrow', icon: 'arrowRight', name: 'Pfeil' },
  { id: 'cursor', icon: 'cursor', name: 'Mauszeiger' }
];

// Mock Video Effects Data für Demo
const mockVideoEffectsData = {
  'videoeffekte-angesagt': [
    { id: 1, thumbnail: null, title: 'Wasserbrand' },
    { id: 2, thumbnail: null, title: 'Heilige Schärfe' },
    { id: 3, thumbnail: null, title: 'Altes Material' },
    { id: 4, thumbnail: null, title: 'Verträumter Schimmer' },
    { id: 5, thumbnail: null, title: 'Leck 1' },
    { id: 6, thumbnail: null, title: 'Vignette' },
    { id: 7, thumbnail: null, title: 'Blitz 3' },
    { id: 8, thumbnail: null, title: 'Chromatisch' },
    { id: 9, thumbnail: null, title: 'Quadratische Schärfe' },
    { id: 10, thumbnail: null, title: 'Goldener Schnee' },
    { id: 11, thumbnail: null, title: 'Holzäh...' },
    { id: 12, thumbnail: null, title: 'Glänzender Schnee' },
    { id: 13, thumbnail: null, title: 'Hades Noël' },
    { id: 14, thumbnail: null, title: 'Fullt...n Bul' },
    { id: 15, thumbnail: null, title: 'Schnee...' }
  ]
};

// Mock Body Effects Data für Demo
const mockBodyEffectsData = {
  'koerpereffekte-angesagt': [
    { id: 1, thumbnail: null, title: 'Leuchtgänger' },
    { id: 2, thumbnail: null, title: 'Fragmentieren' },
    { id: 3, thumbnail: null, title: 'Glitzernde Kante' },
    { id: 4, thumbnail: null, title: 'Zusammengewickelt' },
    { id: 5, thumbnail: null, title: 'Optischer Scan' },
    { id: 6, thumbnail: null, title: 'Bewegungsbeleuchtung' },
    { id: 7, thumbnail: null, title: 'Blitzeinschlag' },
    { id: 8, thumbnail: null, title: 'Schmetterlingsflügel' },
    { id: 9, thumbnail: null, title: 'Totemflammen' },
    { id: 10, thumbnail: null, title: 'Lichtspuren' },
    { id: 11, thumbnail: null, title: 'Effekt 11' },
    { id: 12, thumbnail: null, title: 'Effekt 12' },
    { id: 13, thumbnail: null, title: 'Effekt 13' },
    { id: 14, thumbnail: null, title: 'Effekt 14' },
    { id: 15, thumbnail: null, title: 'Effekt 15' }
  ]
};

// Mock Transitions Data für Demo
const mockTransitionsData = {
  'uebergaenge-angesagt': [
    { id: 1, thumbnail: null, title: 'Vorbei...hatten' },
    { id: 2, thumbnail: null, title: 'Hereinziehen II' },
    { id: 3, thumbnail: null, title: 'Teleport-Strahl' },
    { id: 4, thumbnail: null, title: 'Schütt...litzen' },
    { id: 5, thumbnail: null, title: 'Schwar...lassen' },
    { id: 6, thumbnail: null, title: 'Blende II' },
    { id: 7, thumbnail: null, title: 'Verträ...Blasen' },
    { id: 8, thumbnail: null, title: 'Blitze...lassen' },
    { id: 9, thumbnail: null, title: 'Neon-Brand' },
    { id: 10, thumbnail: null, title: 'Abgele...r Film' },
    { id: 11, thumbnail: null, title: 'Übergang 11' },
    { id: 12, thumbnail: null, title: 'Übergang 12' },
    { id: 13, thumbnail: null, title: 'Übergang 13' },
    { id: 14, thumbnail: null, title: 'Übergang 14' },
    { id: 15, thumbnail: null, title: 'Übergang 15' }
  ],
  'uebergaenge-neujahr': [
    { id: 16, thumbnail: null, title: 'Neujahr 1' },
    { id: 17, thumbnail: null, title: 'Neujahr 2' },
    { id: 18, thumbnail: null, title: 'Neujahr 3' },
    { id: 19, thumbnail: null, title: 'Neujahr 4' },
    { id: 20, thumbnail: null, title: 'Neujahr 5' }
  ],
  'uebergaenge-klassik': [
    { id: 21, thumbnail: null, title: 'Klassik 1' },
    { id: 22, thumbnail: null, title: 'Klassik 2' },
    { id: 23, thumbnail: null, title: 'Klassik 3' },
    { id: 24, thumbnail: null, title: 'Klassik 4' },
    { id: 25, thumbnail: null, title: 'Klassik 5' }
  ],
  'uebergaenge-neu': [
    { id: 26, thumbnail: null, title: 'NEU 1' },
    { id: 27, thumbnail: null, title: 'NEU 2' },
    { id: 28, thumbnail: null, title: 'NEU 3' },
    { id: 29, thumbnail: null, title: 'NEU 4' },
    { id: 30, thumbnail: null, title: 'NEU 5' }
  ],
  'uebergaenge-hits': [
    { id: 31, thumbnail: null, title: 'Hits 1' },
    { id: 32, thumbnail: null, title: 'Hits 2' },
    { id: 33, thumbnail: null, title: 'Hits 3' },
    { id: 34, thumbnail: null, title: 'Hits 4' },
    { id: 35, thumbnail: null, title: 'Hits 5' }
  ],
  'uebergaenge-ueberlagerung': [
    { id: 36, thumbnail: null, title: 'Überlagerung 1' },
    { id: 37, thumbnail: null, title: 'Überlagerung 2' },
    { id: 38, thumbnail: null, title: 'Überlagerung 3' },
    { id: 39, thumbnail: null, title: 'Überlagerung 4' },
    { id: 40, thumbnail: null, title: 'Überlagerung 5' }
  ],
  'uebergaenge-leicht': [
    { id: 41, thumbnail: null, title: 'Leicht 1' },
    { id: 42, thumbnail: null, title: 'Leicht 2' },
    { id: 43, thumbnail: null, title: 'Leicht 3' },
    { id: 44, thumbnail: null, title: 'Leicht 4' },
    { id: 45, thumbnail: null, title: 'Leicht 5' }
  ],
  'uebergaenge-kamera': [
    { id: 46, thumbnail: null, title: 'Kamera 1' },
    { id: 47, thumbnail: null, title: 'Kamera 2' },
    { id: 48, thumbnail: null, title: 'Kamera 3' },
    { id: 49, thumbnail: null, title: 'Kamera 4' },
    { id: 50, thumbnail: null, title: 'Kamera 5' }
  ],
  'uebergaenge-verschwimmen': [
    { id: 51, thumbnail: null, title: 'Verschwimmen 1' },
    { id: 52, thumbnail: null, title: 'Verschwimmen 2' },
    { id: 53, thumbnail: null, title: 'Verschwimmen 3' },
    { id: 54, thumbnail: null, title: 'Verschwimmen 4' },
    { id: 55, thumbnail: null, title: 'Verschwimmen 5' }
  ],
  'uebergaenge-einfach': [
    { id: 56, thumbnail: null, title: 'Einfach 1' },
    { id: 57, thumbnail: null, title: 'Einfach 2' },
    { id: 58, thumbnail: null, title: 'Einfach 3' },
    { id: 59, thumbnail: null, title: 'Einfach 4' },
    { id: 60, thumbnail: null, title: 'Einfach 5' }
  ]
};

// Mock Filters Data für Demo
const mockFiltersData = {
  'filter-vorgestellt': [
    { id: 1, thumbnail: null, title: '4K' },
    { id: 2, thumbnail: null, title: 'Bokeh' },
    { id: 3, thumbnail: null, title: '8K' },
    { id: 4, thumbnail: null, title: 'Stimm...erbst' },
    { id: 5, thumbnail: null, title: 'Klar II' },
    { id: 6, thumbnail: null, title: 'Manga-Vision' },
    { id: 7, thumbnail: null, title: 'Sonne...rgang' },
    { id: 8, thumbnail: null, title: 'Schnellzug' },
    { id: 9, thumbnail: null, title: 'Unauffällig' },
    { id: 10, thumbnail: null, title: 'Sonn...ertag' },
    { id: 11, thumbnail: null, title: 'Filter 11' },
    { id: 12, thumbnail: null, title: 'Filter 12' },
    { id: 13, thumbnail: null, title: 'Filter 13' },
    { id: 14, thumbnail: null, title: 'Filter 14' },
    { id: 15, thumbnail: null, title: 'Filter 15' }
  ],
  'filter-neujahr': [
    { id: 16, thumbnail: null, title: 'Neujahr 1' },
    { id: 17, thumbnail: null, title: 'Neujahr 2' },
    { id: 18, thumbnail: null, title: 'Neujahr 3' },
    { id: 19, thumbnail: null, title: 'Neujahr 4' },
    { id: 20, thumbnail: null, title: 'Neujahr 5' }
  ],
  'filter-neu': [
    { id: 21, thumbnail: null, title: 'NEU 1' },
    { id: 22, thumbnail: null, title: 'NEU 2' },
    { id: 23, thumbnail: null, title: 'NEU 3' },
    { id: 24, thumbnail: null, title: 'NEU 4' },
    { id: 25, thumbnail: null, title: 'NEU 5' }
  ],
  'filter-hits': [
    { id: 26, thumbnail: null, title: 'Hits 1' },
    { id: 27, thumbnail: null, title: 'Hits 2' },
    { id: 28, thumbnail: null, title: 'Hits 3' },
    { id: 29, thumbnail: null, title: 'Hits 4' },
    { id: 30, thumbnail: null, title: 'Hits 5' }
  ],
  'filter-leben': [
    { id: 31, thumbnail: null, title: 'Leben 1' },
    { id: 32, thumbnail: null, title: 'Leben 2' },
    { id: 33, thumbnail: null, title: 'Leben 3' },
    { id: 34, thumbnail: null, title: 'Leben 4' },
    { id: 35, thumbnail: null, title: 'Leben 5' }
  ],
  'filter-fotoautomat': [
    { id: 36, thumbnail: null, title: 'Fotoautomat 1' },
    { id: 37, thumbnail: null, title: 'Fotoautomat 2' },
    { id: 38, thumbnail: null, title: 'Fotoautomat 3' },
    { id: 39, thumbnail: null, title: 'Fotoautomat 4' },
    { id: 40, thumbnail: null, title: 'Fotoautomat 5' }
  ],
  'filter-haustier': [
    { id: 41, thumbnail: null, title: 'Haustier 1' },
    { id: 42, thumbnail: null, title: 'Haustier 2' },
    { id: 43, thumbnail: null, title: 'Haustier 3' },
    { id: 44, thumbnail: null, title: 'Haustier 4' },
    { id: 45, thumbnail: null, title: 'Haustier 5' }
  ],
  'filter-querformat': [
    { id: 46, thumbnail: null, title: 'Querformat 1' },
    { id: 47, thumbnail: null, title: 'Querformat 2' },
    { id: 48, thumbnail: null, title: 'Querformat 3' },
    { id: 49, thumbnail: null, title: 'Querformat 4' },
    { id: 50, thumbnail: null, title: 'Querformat 5' }
  ],
  'filter-filme': [
    { id: 51, thumbnail: null, title: 'Filme 1' },
    { id: 52, thumbnail: null, title: 'Filme 2' },
    { id: 53, thumbnail: null, title: 'Filme 3' },
    { id: 54, thumbnail: null, title: 'Filme 4' },
    { id: 55, thumbnail: null, title: 'Filme 5' }
  ],
  'filter-mono': [
    { id: 56, thumbnail: null, title: 'Mono 1' },
    { id: 57, thumbnail: null, title: 'Mono 2' },
    { id: 58, thumbnail: null, title: 'Mono 3' },
    { id: 59, thumbnail: null, title: 'Mono 4' },
    { id: 60, thumbnail: null, title: 'Mono 5' }
  ]
};

// Mock Adjustment Data für Demo
const mockSavedAdjustments = [
  { id: 1, thumbnail: null, name: 'Blacky' }
];

// Mock Templates Data für Demo
const mockTemplatesData = {
  'vorlagen-fuer-dich': [
    {
      id: 1,
      thumbnail: null,
      title: 'nature',
      badge: 'Empfohlen',
      likes: '123.6K',
      clipCount: 24,
      featured: true
    },
    {
      id: 2,
      thumbnail: null,
      title: 'ai sway dance filter',
      badge: 'Empfohlen',
      likes: '11.8K',
      clipCount: 1,
      featured: true
    },
    {
      id: 3,
      thumbnail: null,
      title: 'New SMOKE EFFECT',
      badge: 'Empfohlen',
      likes: '104.5K',
      clipCount: 1,
      featured: true
    },
    {
      id: 4,
      thumbnail: null,
      title: 'PHOTO 1',
      badge: 'Empfohlen',
      likes: '89.2K',
      clipCount: 12,
      featured: true
    }
  ],
  'vorlagen-premium': [],
  'vorlagen-alltag': [],
  'vorlagen-selfie': [],
  'vorlagen-ueber-mich': [],
  'vorlagen-texte': [],
  'vorlagen-musik-festival': [],
  'vorlagen-beziehung': [],
  'vorlagen-freundschaft': [],
  'vorlagen-reisen': []
};

export default function MediaInputPanel() {
  const { state, dispatch, currentProjectPath, activeMainTab } = useEditor();
  const [activeCategory, setActiveCategory] = useState('medien');
  const [activeAudioCategory, setActiveAudioCategory] = useState('importieren');
  const [activeTextCategory, setActiveTextCategory] = useState('text-hinzufuegen');
  const [activeStickerCategory, setActiveStickerCategory] = useState('deine-gespeichert');
  const [activeEffectsCategory, setActiveEffectsCategory] = useState('gespeichert');
  const [activeTransitionsCategory, setActiveTransitionsCategory] = useState('gespeichert');
  const [activeSubtitlesCategory, setActiveSubtitlesCategory] = useState('automatische-untertitel');
  const [activeFiltersCategory, setActiveFiltersCategory] = useState('gespeichert');
  const [activeAdjustmentCategory, setActiveAdjustmentCategory] = useState('anpassung-hinzufuegen');
  const [activeVorlagenCategory, setActiveVorlagenCategory] = useState('gespeichert');
  const [importing, setImporting] = useState(false);

  // State für verschiedene Features
  const [searchQuery, setSearchQuery] = useState('');
  const [showInfoBanner, setShowInfoBanner] = useState(true);
  const [activeKIVideoTab, setActiveKIVideoTab] = useState('Bild-zu-Video');
  const [dialogTab, setDialogTab] = useState('Sprechen oder singen');
  const [voice, setVoice] = useState('reporter');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [duration, setDuration] = useState('5s');
  const [stickerPrompt, setStickerPrompt] = useState('');

  // Subtitles state
  const [spokenLanguage, setSpokenLanguage] = useState('Deutsch');
  const [bilingualSubtitles, setBilingualSubtitles] = useState(false);
  const [subtitleLanguage, setSubtitleLanguage] = useState('Keine');
  const [lyricLanguage, setLyricLanguage] = useState('Englisch');

  // Adjustment state
  const [adjustmentStorage, setAdjustmentStorage] = useState('editor52665090');

  // Templates state
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [templateFilterOrientation, setTemplateFilterOrientation] = useState('alle');
  const [templateFilterClips, setTemplateFilterClips] = useState('kein-limit');
  const [templateFilterDuration, setTemplateFilterDuration] = useState('kein-limit');

  // Language options for subtitles
  const languageOptions = [
    { value: 'Deutsch', label: 'Deutsch' },
    { value: 'Englisch', label: 'Englisch' },
    { value: 'Spanisch', label: 'Spanisch' },
    { value: 'Französisch', label: 'Französisch' },
    { value: 'Italienisch', label: 'Italienisch' },
    { value: 'Japanisch', label: 'Japanisch' },
    { value: 'Koreanisch', label: 'Koreanisch' },
    { value: 'Chinesisch', label: 'Chinesisch' }
  ];

  const subtitleLanguageOptions = [
    { value: 'Keine', label: 'Keine' },
    ...languageOptions
  ];

  const handleImport = async () => {
    try {
      setImporting(true);

      // Check if UUID project is loaded
      if (!currentProjectPath || !window.electronAPI?.assetAPI) {
        console.warn('[Import] No UUID project loaded, using fallback');
        // Fallback to old logic
        await handleImportFallback();
        return;
      }

      const files = await electronAPI.dialog.openFile({
        properties: ['openFile', 'multiSelections'],
        filters: [
          { name: 'Medien', extensions: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi', 'mp3', 'wav'] },
          { name: 'Bilder', extensions: ['jpg', 'jpeg', 'png', 'gif'] },
          { name: 'Videos', extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm'] },
          { name: 'Audio', extensions: ['mp3', 'wav', 'aac', 'ogg'] }
        ]
      });

      console.log('[Import] Selected files:', files);

      if (!files || files.length === 0) {
        console.log('[Import] No files selected');
        setImporting(false);
        return;
      }

      for (const filePath of files) {
        const fileName = filePath.split(/[/\\]/).pop();

        console.log(`[Import] Importing ${fileName} with UUID system...`);

        // Importiere mit UUID-System
        const result = await window.electronAPI.assetAPI.import(
          currentProjectPath,
          filePath,
          'copy',  // oder 'link' für externe Referenzen
          {}  // Metadaten werden automatisch extrahiert
        );

        if (!result.success) {
          console.error(`[Import] Failed to import ${fileName}:`, result.error);
          continue;
        }

        console.log(`[Import] Successfully imported ${fileName}, UUID: ${result.uuid}`);

        // Füge zur Media-Liste hinzu mit UUID
        dispatch({
          type: 'ADD_MEDIA',
          payload: {
            id: result.uuid,
            uuid: result.uuid,
            name: result.metadata.filename,
            type: result.metadata.type,
            duration: result.metadata.duration || 5,
            thumbnail: null,
            size: result.metadata.size || 0,
            dateAdded: new Date().toISOString(),
            ...result.metadata
          }
        });

        // Generiere Proxy automatisch für Videos
        if (result.metadata.type === 'video' && result.metadata.local_path) {
          console.log(`[Import] Generating proxy for ${fileName}...`);
          window.electronAPI.proxyAPI.generate(
            currentProjectPath,
            result.uuid,
            result.metadata.local_path,
            '720p'
          );
        }

        console.log(`[Import] Added ${fileName} to media list`);
      }

      setImporting(false);
      console.log('[Import] Import complete. Total media:', state.media.length + files.length);
    } catch (error) {
      console.error('[Import] Import error:', error);
      setImporting(false);
    }
  };

  // Fallback function for old system
  const handleImportFallback = async () => {
    const files = await electronAPI.dialog.openFile({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Medien', extensions: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi', 'mp3', 'wav'] }
      ]
    });

    if (!files || files.length === 0) {
      setImporting(false);
      return;
    }

    const projectName = state.projectName || 'Unnamed';
    const targetDir = `C:\\Users\\jacqu\\OneDrive\\Desktop\\Wind and Lightning Projekts\\com.lveditor.draft\\${projectName}\\Resources`;

    for (const filePath of files) {
      const fileName = filePath.split(/[/\\]/).pop();
      const fileExt = fileName.split('.').pop().toLowerCase();

      let mediaType = 'image';
      if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(fileExt)) {
        mediaType = 'video';
      } else if (['mp3', 'wav', 'aac', 'ogg'].includes(fileExt)) {
        mediaType = 'audio';
      }

      try {
        const targetPath = `${targetDir}\\${fileName}`;
        const result = await electronAPI.fs.copyFile(filePath, targetPath);

        if (!result.success) {
          console.error(`[Import] Failed to copy ${fileName}:`, result.error);
          continue;
        }

        dispatch({
          type: 'ADD_MEDIA',
          payload: {
            id: `m${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: fileName,
            type: mediaType,
            path: targetPath,
            originalPath: filePath,
            duration: 5,
            thumbnail: 'placeholder',
            size: result.size || 0,
            dateAdded: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error(`[Import] Error importing ${fileName}:`, error);
      }
    }

    setImporting(false);
  };

  const handleGenerate = () => {
    console.log('Generate AI video');
  };

  const handleDeleteMedia = (mediaId) => {
    dispatch({ type: 'REMOVE_MEDIA', payload: mediaId });
  };

  // Render content based on active category
  const renderContent = () => {
    switch (activeCategory) {
      case 'medien':
        // BEDINGTE ANZEIGE basierend auf state.media.length
        if (state.media.length === 0) {
          // URSPRÜNGLICHES DESIGN (keine Medien)
          return (
            <div className="space-y-3">
              <div className="text-sm font-medium text-[var(--text-primary)] mb-3">Medien</div>

              {/* Import Buttons - Original Design */}
              <div className="space-y-2">
                <ImportButton
                  icon="folder"
                  label={importing ? 'Importiere...' : 'Medien importieren'}
                  onClick={handleImport}
                  disabled={importing}
                />
                <ImportButton icon="image" label="Bild-zu-Video" onClick={() => { }} />
                <ImportButton icon="text" label="Text-zu-Video" onClick={() => { }} />
              </div>

              {/* Eingabeaufforderung Card */}
              <InputPromptCard />

              {/* Model Card */}
              <ModelCard
                name="Seedance 1.0 Fast"
                description="Gleichmäßige, stabile Bewegung und noch schnellere Generierung."
                onGenerate={handleGenerate}
              />
            </div>
          );
        } else {
          // GRID-LAYOUT (Medien vorhanden)
          return (
            <div className="space-y-4">
              {/* Header mit Toolbar */}
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-[var(--text-primary)]">
                  Medien ({state.media.length})
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors" title="Suchen">
                    <Icon name="search" size={18} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={handleImport}
                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors"
                    title="Weitere Medien importieren"
                  >
                    <Icon name="plus" size={18} strokeWidth={1.5} />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors" title="Grid-Ansicht">
                    <Icon name="grid" size={18} strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Importierte Medien Grid */}
              <MediaGrid media={state.media} onDelete={handleDeleteMedia} />
            </div>
          );
        }

      case 'untergeordnete-projekte':
        return (
          <EmptyState
            icon="folder"
            title="Importieren"
            subtitle="Untergeordnete Projekte importieren (Kombinationsclips). Mehr erfahren"
          />
        );

      case 'gespeichert':
        return (
          <EmptyState
            icon="folder"
            title="Wähle einen Kombinationsclip aus, um die Voreinstellungen zu speichern"
            subtitle=""
          />
        );

      case 'meine-voreinstellungen':
        return (
          <EmptyState
            icon="user"
            title="Meine Voreinstellungen"
            subtitle="Deine Lieblingselemente werden hier angezeigt. Zur Bibliothek wechseln"
          />
        );

      case 'markenassets':
        return (
          <div className="space-y-4">
            {/* Header mit Dropdown */}
            <div className="flex items-center justify-between">
              <select className="h-9 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm text-[var(--text-primary)] focus:border-[var(--border-normal)] focus:outline-none">
                <option>Speicher von editor52665090</option>
              </select>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors" title="Aktualisieren">
                  <Icon name="redo" size={18} strokeWidth={1.5} />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors" title="Einstellungen">
                  <Icon name="adjustment" size={18} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <EmptyState
              icon="storage"
              title="Deine Marken-Assets werden hier angezeigt. Lade Medien in das Markenkit hoch."
              subtitle=""
            />
          </div>
        );

      case 'ki-bilder':
        return (
          <div className="space-y-4">
            {/* Eingabeaufforderung Section */}
            <SectionHeader>Eingabeaufforderung</SectionHeader>

            <button
              onClick={() => console.log('Import image')}
              className="w-full p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md hover:border-[var(--border-normal)] transition-colors flex items-center gap-3 text-left"
            >
              <Icon name="image" size={24} strokeWidth={1.5} className="text-[var(--text-tertiary)]" />
              <span className="text-sm text-[var(--text-secondary)]">Bild importieren</span>
            </button>

            <textarea
              placeholder="(Optional) Beschreibe das Bild und gib an, wie viele Ergebnisse du generieren möchtest (1-10)"
              className="w-full h-24 p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-normal)] focus:outline-none resize-none transition-colors"
            />

            {/* Model Section */}
            <SectionHeader>Model</SectionHeader>

            <div className="p-4 bg-[var(--bg-surface)] rounded-md border border-[var(--border-subtle)]">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-[var(--text-primary)] mb-1">Seedream 4.0</div>
                  <div className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                    Erstelle eine Reihe zusammenhängender Bilder.
                  </div>
                </div>
              </div>

              <DropdownField
                label="Seitenverhältnis"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                options={[
                  { value: '9:16', label: '9:16' },
                  { value: '16:9', label: '16:9' },
                  { value: '1:1', label: '1:1' },
                  { value: 'Anpassen', label: 'Anpassen' }
                ]}
              />

              <div className="mt-4">
                <button
                  onClick={handleGenerate}
                  className="w-full h-10 bg-[var(--capcut-accent-turquoise)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <Icon name="wand" size={16} strokeWidth={1.5} />
                  Generieren
                  <span className="ml-auto px-2 py-0.5 bg-[var(--capcut-accent-purple)] rounded text-xs font-bold">
                    Pro
                  </span>
                </button>
              </div>
            </div>
          </div>
        );

      case 'ki-video':
        return (
          <div className="space-y-4">
            <TabBar
              tabs={['Bild-zu-Video', 'Text-zu-Video']}
              activeTab={activeKIVideoTab}
              onChange={setActiveKIVideoTab}
            />

            {/* Eingabeaufforderung Section */}
            <SectionHeader>Eingabeaufforderung</SectionHeader>

            {activeKIVideoTab === 'Bild-zu-Video' && (
              <button
                onClick={() => console.log('Import image')}
                className="w-full p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md hover:border-[var(--border-normal)] transition-colors flex items-center gap-3 text-left"
              >
                <Icon name="image" size={24} strokeWidth={1.5} className="text-[var(--text-tertiary)]" />
                <span className="text-sm text-[var(--text-secondary)]">Bild importieren</span>
              </button>
            )}

            <textarea
              placeholder="(Optional) Beschreibe das Video, das du generieren möchtest. Zum Beispiel so: Wellen rauschen über den Strand."
              className="w-full h-24 p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-normal)] focus:outline-none resize-none transition-colors"
            />

            {/* Model Section */}
            <SectionHeader>Model</SectionHeader>

            <div className="p-4 bg-[var(--bg-surface)] rounded-md border border-[var(--border-subtle)]">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-[var(--text-primary)] mb-1">Seedance 1.0 Fast</div>
                  <div className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                    Gleichmäßige, stabile Bewegung und noch schnellere Generierung.
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <DropdownField
                  label="Dauer"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  options={[
                    { value: '5s', label: '5s' },
                    { value: '10s', label: '10s' }
                  ]}
                />
                <DropdownField
                  label="Seitenverhältnis"
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  options={[
                    { value: '9:16', label: '9:16' },
                    { value: '16:9', label: '16:9' },
                    { value: '1:1', label: '1:1' }
                  ]}
                />
              </div>

              <div className="mt-4">
                <GenerateButton onClick={handleGenerate} usageCount={1} />
              </div>
            </div>

            <div className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
              <Icon name="info" size={14} strokeWidth={1.5} className="text-[var(--capcut-accent-turquoise)] flex-shrink-0 mt-0.5" />
              <span>1 kostenlose Nutzung übrig. Tritt der Pro-Version bei und verwende Credits, um mehr zu erhalten.</span>
            </div>
          </div>
        );

      case 'ki-dialogszenen':
        return (
          <div className="space-y-4">
            {/* Tabs */}
            <TabBar
              tabs={['Sprechen oder singen', 'Reagieren']}
              activeTab={dialogTab}
              onChange={setDialogTab}
            />

            {/* Upload Card */}
            <UploadCard
              icon="image"
              text="Foto der Figur hochladen"
              onClick={() => console.log('Upload photo')}
            />

            {/* Dialog Input */}
            <div>
              <RequiredLabel>Dialog eingeben</RequiredLabel>
              <textarea
                placeholder="Gib ein, was deine Figur sagen soll"
                className="w-full h-24 p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-normal)] focus:outline-none resize-none transition-colors"
              />
            </div>

            {/* Voice Dropdown */}
            <VoiceDropdown
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              options={[
                { value: 'reporter', label: 'Elfriger Reporter' },
                { value: 'other', label: 'Andere Stimme' }
              ]}
            />

            {/* Audio Upload Link */}
            <button className="text-sm text-[var(--capcut-accent-turquoise)] hover:underline">
              oder füge Audio hinzu
            </button>

            {/* Szene beschreiben */}
            <div>
              <div className="text-xs text-[var(--text-tertiary)] mb-2">Szene beschreiben</div>
              <textarea
                placeholder=""
                className="w-full h-20 p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-normal)] focus:outline-none resize-none transition-colors"
              />
            </div>
          </div>
        );

      case 'angesagt':
      case 'weihnachten':
      case 'greenscreen':
      case 'hintergrund':
      case 'intro-ende':
      case 'uebergaenge':
      case 'landschaft':
      case 'atmosphaere':
      case 'leben':
        return (
          <div className="space-y-4">
            {/* Search Bar */}
            <SearchBar
              placeholder="Finde Videos und Fotos"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Info Banner */}
            {showInfoBanner && (
              <InfoBanner
                message="Um keine Urheberrechtsverletzung zu vermeiden, exportiere keine Elemente, ohne sie vorher auf CapCut zu bearbeiten."
                onDismiss={() => setShowInfoBanner(false)}
              />
            )}

            {/* Beispiel-Videos Grid */}
            <div className="grid grid-cols-2 gap-3">
              <VideoThumbnail
                thumbnail={null}
                duration="00:11"
                title="Video 1"
                onDownload={() => console.log('Download video 1')}
              />
              <VideoThumbnail
                thumbnail={null}
                duration="00:22"
                title="Video 2"
                onDownload={() => console.log('Download video 2')}
              />
              <VideoThumbnail
                thumbnail={null}
                duration="00:15"
                title="Video 3"
                onDownload={() => console.log('Download video 3')}
              />
              <VideoThumbnail
                thumbnail={null}
                duration="00:06"
                title="Video 4"
                onDownload={() => console.log('Download video 4')}
              />
            </div>
          </div>
        );

      case 'speicher':
        return (
          <div className="space-y-4">
            {/* Search Bar + Dropdown */}
            <div className="flex gap-2">
              <div className="flex-1">
                <SearchBar
                  placeholder="Elementsuche"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="w-9 h-9 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors" title="Sortieren">
                <Icon name="adjustment" size={18} strokeWidth={1.5} className="text-[var(--text-secondary)]" />
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors" title="Grid-Ansicht">
                <Icon name="grid" size={18} strokeWidth={1.5} className="text-[var(--text-secondary)]" />
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors" title="Listen-Ansicht">
                <Icon name="text" size={18} strokeWidth={1.5} className="text-[var(--text-secondary)]" />
              </button>
            </div>

            {/* Dropdown */}
            <select className="w-full h-9 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm text-[var(--text-primary)] focus:border-[var(--border-normal)] focus:outline-none cursor-pointer transition-colors">
              <option>Speicher von editor52665090</option>
            </select>

            <EmptyState
              icon="storage"
              title="Von dir in diesen Speicher hochgeladene Medien werden hier angezeigt."
              subtitle=""
            />
          </div>
        );

      case 'dreamina':
        return (
          <EmptyState
            icon="wand"
            title="Aus Dreamina synchronisieren"
            subtitle="Du kannst Assets aus demselben Konto synchronisieren."
          />
        );

      default:
        return (
          <EmptyState
            icon="media"
            title="Kategorie auswählen"
            subtitle="Wähle eine Kategorie aus der linken Navigation"
          />
        );
    }
  };

  // Render Audio Content basierend auf activeAudioCategory
  const renderAudioContent = () => {
    switch (activeAudioCategory) {
      case 'importieren':
        return (
          <div className="space-y-4">
            <div className="p-6 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)]">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-base font-medium text-[var(--text-primary)]">
                  Audio extrahieren
                </div>
                <span className="px-2 py-0.5 bg-[var(--capcut-accent-turquoise)] text-white text-xs font-bold rounded">
                  kostenlose!!
                </span>
              </div>
              <div className="text-sm text-[var(--text-secondary)] mb-4">
                Video zum Extrahieren von Audio
              </div>
              <button className="w-full h-10 bg-[var(--capcut-accent-turquoise)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-all">
                Importieren
              </button>
            </div>
          </div>
        );

      case 'deine-gespeichert':
        return (
          <EmptyState
            icon="user"
            title="Wähle einen Kombinationsclip aus, um die Voreinstellungen zu speichern"
            subtitle=""
          />
        );

      case 'deine-markenmusik':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <select className="h-9 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm text-[var(--text-primary)] focus:border-[var(--border-normal)] focus:outline-none cursor-pointer transition-colors">
                <option>Speicher von editor52665090</option>
              </select>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors" title="Aktualisieren">
                  <Icon name="redo" size={18} strokeWidth={1.5} />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors" title="Einstellungen">
                  <Icon name="adjustment" size={18} strokeWidth={1.5} />
                </button>
              </div>
            </div>
            <EmptyState
              icon="storage"
              title="Deine Marken-Assets werden hier angezeigt. Lade Medien in das Markenkit hoch."
              subtitle=""
            />
          </div>
        );

      case 'musik-angesagt':
      case 'musik-vlog':
        const musicData = mockMusicData[activeAudioCategory] || [];
        return (
          <div className="space-y-4">
            <SearchBar
              placeholder="Lieder oder Interpreten suchen"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="text-sm font-medium text-[var(--text-primary)]">
              {activeAudioCategory === 'musik-angesagt' ? 'Angesagte Hintergrundmusik' : 'Vlog'}
            </div>
            <div className="space-y-2">
              {musicData.map(item => (
                <AudioListItem
                  key={item.id}
                  title={item.title}
                  artist={item.artist}
                  duration={item.duration}
                  onFavorite={() => console.log('favorite', item.id)}
                  onDownload={() => console.log('download', item.id)}
                />
              ))}
            </div>
          </div>
        );

      case 'soundeffekte-angesagt':
        const soundData = mockSoundEffectsData[activeAudioCategory] || [];
        return (
          <div className="space-y-4">
            <SearchBar
              placeholder="Soundeffekte suchen"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="text-sm font-medium text-[var(--text-primary)]">
              Angesagt
            </div>
            <div className="space-y-2">
              {soundData.map(item => (
                <AudioListItem
                  key={item.id}
                  title={item.title}
                  artist={item.artist}
                  duration={item.duration}
                  onFavorite={() => console.log('favorite', item.id)}
                  onDownload={() => console.log('download', item.id)}
                />
              ))}
            </div>
          </div>
        );

      case 'urheberrecht':
        return (
          <div className="p-6 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)]">
            <div className="text-base font-medium text-[var(--text-primary)] mb-4">
              Urheberrecht
            </div>
            <div className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
              Überprüfe, ob die Sounds in deinem Video urheberrechtliche Probleme aufweisen, bevor du es auf TikTok teilst. So vermeidest du, dass es stummgeschaltet wird.
            </div>
            <button className="w-full h-10 bg-[var(--capcut-accent-turquoise)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-all">
              Überprüfen
            </button>
          </div>
        );

      default:
        return (
          <EmptyState
            icon="music"
            title="Kategorie auswählen"
            subtitle="Wähle eine Audio-Kategorie aus der linken Navigation"
          />
        );
    }
  };

  // Render Text Content basierend auf activeTextCategory
  const renderTextContent = () => {
    switch (activeTextCategory) {
      case 'text-hinzufuegen':
        return (
          <div className="space-y-4">
            <div className="w-32 h-32 bg-[var(--capcut-accent-turquoise)] rounded-lg flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
              <span className="text-white text-lg font-medium">Standardtext</span>
            </div>
          </div>
        );

      case 'deine-gespeichert':
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-xl bg-[var(--bg-surface)]">
              <Icon name="folder" size={32} strokeWidth={1.5} className="text-[var(--text-tertiary)]" />
            </div>
            <div className="text-base font-medium text-[var(--text-primary)] mb-2">
              Deine Lieblingselemente werden hier angezeigt.
            </div>
            <a href="#" className="text-sm text-[var(--capcut-accent-turquoise)] hover:underline">
              Texteffekte anzeigen
            </a>
          </div>
        );

      case 'deine-voreinstellungen':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <select className="h-9 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm text-[var(--text-primary)] focus:border-[var(--border-normal)] focus:outline-none cursor-pointer transition-colors">
                <option>Speicher von editor52665090</option>
              </select>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors" title="Aktualisieren">
                  <Icon name="redo" size={18} strokeWidth={1.5} />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors" title="Einstellungen">
                  <Icon name="adjustment" size={18} strokeWidth={1.5} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="aspect-square bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] flex flex-col items-center justify-center p-4">
                <div className="text-sm text-[var(--text-secondary)] mb-2">brand_text_1</div>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg-hover)] hover:bg-[var(--border-subtle)] transition-colors">
                  <Icon name="download" size={16} strokeWidth={1.5} />
                </button>
              </div>
              <div className="aspect-square bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] flex flex-col items-center justify-center p-4">
                <div className="text-sm text-[var(--text-secondary)] mb-2">brand_text_2</div>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg-hover)] hover:bg-[var(--border-subtle)] transition-colors">
                  <Icon name="download" size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        );

      case 'texteffekte-angesagt':
        const textEffects = mockTextEffectsData[activeTextCategory] || [];
        return (
          <div className="space-y-4">
            {/* Filter Button oben rechts */}
            <div className="flex justify-end">
              <button className="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                <Icon name="adjustment" size={18} strokeWidth={1.5} />
                <Icon name="chevronDown" size={14} strokeWidth={1.5} />
              </button>
            </div>

            {/* Header */}
            <div className="text-sm font-medium text-[var(--text-primary)]">
              Angesagt
            </div>

            {/* Grid 5 Spalten */}
            <div className="grid grid-cols-5 gap-3">
              {textEffects.map(effect => (
                <TextEffectTile
                  key={effect.id}
                  text={effect.text}
                  style={effect.style}
                  onFavorite={() => console.log('favorite', effect.id)}
                  onDownload={() => console.log('download', effect.id)}
                />
              ))}
            </div>
          </div>
        );

      case 'textvorlage-angesagt':
        const templates = mockTextTemplatesData[activeTextCategory] || [];
        return (
          <div className="space-y-4">
            {/* Filter Button oben rechts */}
            <div className="flex justify-end">
              <button className="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                <Icon name="adjustment" size={18} strokeWidth={1.5} />
                <Icon name="chevronDown" size={14} strokeWidth={1.5} />
              </button>
            </div>

            {/* Header */}
            <div className="text-sm font-medium text-[var(--text-primary)]">
              Angesagt
            </div>

            {/* Grid 5 Spalten */}
            <div className="grid grid-cols-5 gap-3">
              {templates.map(template => (
                <TextTemplateTile
                  key={template.id}
                  preview={template.preview}
                  title={template.title}
                  style={template.style}
                  onFavorite={() => console.log('favorite', template.id)}
                  onDownload={() => console.log('download', template.id)}
                />
              ))}
            </div>
          </div>
        );

      case 'automatische-untertitel':
        return (
          <div className="space-y-4">
            {/* Gesprochene Sprache */}
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)] mb-2">
                Gesprochene Sprache
              </div>
              <select className="w-full h-10 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm text-[var(--text-primary)] focus:border-[var(--border-normal)] focus:outline-none cursor-pointer transition-colors">
                <option>Deutsch</option>
                <option>English</option>
                <option>Español</option>
                <option>Français</option>
              </select>
            </div>

            {/* Bilinguale Untertitel */}
            <div className="flex items-center justify-between p-3 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)]">
              <span className="text-sm text-[var(--text-primary)]">Bilinguale Untertitel</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--capcut-accent-turquoise)]"></div>
              </label>
            </div>

            {/* Dropdown Keine */}
            <div>
              <select className="w-full h-10 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm text-[var(--text-primary)] focus:border-[var(--border-normal)] focus:outline-none cursor-pointer transition-colors">
                <option>Keine</option>
              </select>
            </div>

            {/* Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="delete-subtitles"
                className="w-4 h-4 rounded border-[var(--border-subtle)] bg-[var(--bg-surface)] checked:bg-[var(--capcut-accent-turquoise)] cursor-pointer"
              />
              <label htmlFor="delete-subtitles" className="text-sm text-[var(--text-secondary)] cursor-pointer">
                Aktuelle Untertitel löschen
              </label>
            </div>

            {/* Generate Button */}
            <button className="w-full h-10 bg-[var(--capcut-accent-turquoise)] text-white rounded-md text-sm font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2">
              <span>Generieren</span>
              <span className="px-2 py-0.5 bg-[var(--capcut-accent-purple)] rounded text-xs font-bold">
                kostenlose Nutzung
              </span>
            </button>
          </div>
        );

      case 'lokale-untertitel':
        return (
          <EmptyState
            icon="subtitles"
            title="Lokale Untertitel"
            subtitle="Importiere lokale Untertitel-Dateien"
          />
        );

      default:
        return (
          <EmptyState
            icon="text"
            title="Kategorie auswählen"
            subtitle="Wähle eine Text-Kategorie aus der linken Navigation"
          />
        );
    }
  };

  // Render Sticker Content basierend auf activeStickerCategory
  const renderStickerContent = () => {
    switch (activeStickerCategory) {
      case 'deine-gespeichert':
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-xl bg-[var(--bg-surface)]">
              <Icon name="folder" size={32} strokeWidth={1.5} className="text-[var(--text-tertiary)]" />
            </div>
            <div className="text-base font-medium text-[var(--text-primary)] mb-2">
              Deine Lieblingselemente werden hier angezeigt.
            </div>
            <a href="#" className="text-sm text-[var(--capcut-accent-turquoise)] hover:underline">
              Sticker anzeigen
            </a>
          </div>
        );

      case 'deine-markensticker':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <select className="h-9 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm text-[var(--text-primary)] focus:border-[var(--border-normal)] focus:outline-none cursor-pointer transition-colors">
                <option>Speicher von editor52665090</option>
              </select>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors" title="Aktualisieren">
                  <Icon name="redo" size={18} strokeWidth={1.5} />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors" title="Einstellungen">
                  <Icon name="adjustment" size={18} strokeWidth={1.5} />
                </button>
              </div>
            </div>
            <EmptyState
              icon="storage"
              title="Deine Marken-Assets werden hier angezeigt. Lade Medien in das Markenkit hoch."
              subtitle=""
            />
          </div>
        );

      case 'sticker-ki-generiert':
        return (
          <div className="space-y-6">
            {/* Hero Section mit KI-Avatar */}
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-medium text-[var(--text-primary)] mb-6 leading-tight">
                  Hallo! Lass uns jetzt mit<br />
                  Eingabeaufforderungen<br />
                  Elemente erstellen.
                </h2>

                {/* Prompt Input */}
                <div className="space-y-3">
                  <div className="text-sm text-[var(--text-secondary)]">
                    Beschreibe den Sticker, den du generieren möchtest
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={stickerPrompt}
                      onChange={(e) => setStickerPrompt(e.target.value)}
                      placeholder="Geburtstagsgeschenk"
                      className="flex-1 h-12 px-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-normal)] focus:outline-none transition-colors"
                    />
                    <button className="w-12 h-12 flex items-center justify-center bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors">
                      <Icon name="redo" size={20} strokeWidth={1.5} />
                    </button>
                  </div>

                  <button className="flex items-center gap-2 text-sm text-[var(--capcut-accent-turquoise)] hover:underline">
                    <Icon name="wand" size={16} strokeWidth={1.5} />
                    Präsentieren
                    <Icon name="chevronRight" size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* KI Avatar Image */}
              <div className="w-64 h-64 rounded-2xl overflow-hidden flex-shrink-0">
                <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center">
                  {/* Placeholder für AI Avatar */}
                  <Icon name="wand" size={120} strokeWidth={1} className="text-white opacity-50" />
                </div>
              </div>
            </div>

            {/* Info & Actions */}
            <div className="flex items-center">
              <div className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                <Icon name="info" size={16} strokeWidth={1.5} className="text-[var(--capcut-accent-turquoise)]" />
                1 kostenlose Nutzung übrig. Tritt der Pro-Version bei und verwende Credits.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="px-6 h-10 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm font-medium hover:bg-[var(--bg-hover)] transition-colors flex items-center gap-2">
                <Icon name="adjustment" size={16} strokeWidth={1.5} />
                Anpassen
              </button>
              <button className="flex-1 h-10 bg-[var(--capcut-accent-turquoise)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                Generieren
              </button>
            </div>
          </div>
        );

      case 'sticker-angesagt':
      case 'sticker-2026':
      case 'sticker-klassik':
      case 'sticker-neu':
      case 'sticker-hits':
      case 'sticker-nailoong':
      case 'sticker-symbole':
      case 'sticker-emoji':
        const stickers = mockStickersData['sticker-angesagt'] || [];
        const categoryName = activeStickerCategory.replace('sticker-', '');
        const displayName = categoryName === 'angesagt' ? 'Angesagt' :
          categoryName === 'nailoong' ? 'Nailoong💚' :
            categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

        return (
          <div className="space-y-4">
            {/* Search Bar + Filter */}
            <div className="flex gap-2">
              <div className="flex-1">
                <SearchBar
                  placeholder="Sticker suchen"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="w-9 h-9 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors">
                <Icon name="adjustment" size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Header */}
            <div className="text-sm font-medium text-[var(--text-primary)]">
              {displayName}
            </div>

            {/* Grid 5 Spalten */}
            <div className="grid grid-cols-5 gap-3">
              {stickers.map(sticker => (
                <StickerTile
                  key={sticker.id}
                  thumbnail={sticker.thumbnail}
                  onFavorite={() => console.log('favorite', sticker.id)}
                  onDownload={() => console.log('download', sticker.id)}
                />
              ))}
            </div>
          </div>
        );

      case 'formen':
        return (
          <div className="space-y-4">
            {/* Grid 4 Spalten */}
            <div className="grid grid-cols-4 gap-3">
              {formsData.map(form => (
                <FormTile
                  key={form.id}
                  icon={form.icon}
                  name={form.name}
                  onClick={() => console.log('form clicked:', form.id)}
                />
              ))}
            </div>
          </div>
        );

      default:
        return (
          <EmptyState
            icon="image"
            title="Kategorie auswählen"
            subtitle="Wähle eine Sticker-Kategorie aus der linken Navigation"
          />
        );
    }
  };

  // Render Effects Content basierend auf activeEffectsCategory
  const renderEffectsContent = () => {
    switch (activeEffectsCategory) {
      case 'gespeichert':
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-xl bg-[var(--bg-surface)]">
              <Icon name="folder" size={32} strokeWidth={1.5} className="text-[var(--text-tertiary)]" />
            </div>
            <div className="text-base font-medium text-[var(--text-primary)] mb-2">
              Deine Lieblingselemente werden hier angezeigt.
            </div>
            <a href="#" className="text-sm text-[var(--capcut-accent-turquoise)] hover:underline">
              Videoeffekte anzeigen
            </a>
          </div>
        );

      case 'videoeffekte-angesagt':
      case 'videoeffekte-neujahr':
      case 'videoeffekte-klassik':
      case 'videoeffekte-neu':
      case 'videoeffekte-hits':
      case 'videoeffekte-intro-outro':
      case 'videoeffekte-zufaellige-frames':
      case 'videoeffekte-party':
      case 'videoeffekte-bewegung':
        const videoEffects = mockVideoEffectsData['videoeffekte-angesagt'] || [];
        const videoCategoryName = activeEffectsCategory.replace('videoeffekte-', '');
        const videoDisplayName = videoCategoryName === 'angesagt' ? 'Angesagt' :
          videoCategoryName === 'neujahr' ? 'Neujahr 🎉' :
            videoCategoryName === 'intro-outro' ? 'Intro und Outro' :
              videoCategoryName === 'zufaellige-frames' ? 'Zufällige Frames' :
                videoCategoryName.charAt(0).toUpperCase() + videoCategoryName.slice(1);

        return (
          <div className="space-y-4">
            {/* Search Bar */}
            <SearchBar
              placeholder="Effekte suchen"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Header */}
            <div className="text-sm font-medium text-[var(--text-primary)]">
              {videoDisplayName}
            </div>

            {/* Grid 5 Spalten */}
            <div className="grid grid-cols-5 gap-3">
              {videoEffects.map(effect => (
                <EffectTile
                  key={effect.id}
                  thumbnail={effect.thumbnail}
                  title={effect.title}
                  onFavorite={() => console.log('favorite', effect.id)}
                  onDownload={() => console.log('download', effect.id)}
                />
              ))}
            </div>
          </div>
        );

      case 'koerpereffekte-angesagt':
      case 'koerpereffekte-pro':
      case 'koerpereffekte-hits':
      case 'koerpereffekte-klon':
      case 'koerpereffekte-leuchtende-linien':
      case 'koerpereffekte-rahmen':
      case 'koerpereffekte-halluzination':
      case 'koerpereffekte-superkraefte':
      case 'koerpereffekte-rolle':
        const bodyEffects = mockBodyEffectsData['koerpereffekte-angesagt'] || [];
        const bodyCategoryName = activeEffectsCategory.replace('koerpereffekte-', '');
        const bodyDisplayName = bodyCategoryName === 'angesagt' ? 'Angesagt' :
          bodyCategoryName === 'leuchtende-linien' ? 'Leuchtende Linien' :
            bodyCategoryName === 'superkraefte' ? 'Superkräfte' :
              bodyCategoryName.charAt(0).toUpperCase() + bodyCategoryName.slice(1);

        return (
          <div className="space-y-4">
            {/* Search Bar */}
            <SearchBar
              placeholder="Effekte suchen"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Header */}
            <div className="text-sm font-medium text-[var(--text-primary)]">
              {bodyDisplayName}
            </div>

            {/* Grid 5 Spalten */}
            <div className="grid grid-cols-5 gap-3">
              {bodyEffects.map(effect => (
                <EffectTile
                  key={effect.id}
                  thumbnail={effect.thumbnail}
                  title={effect.title}
                  onFavorite={() => console.log('favorite', effect.id)}
                  onDownload={() => console.log('download', effect.id)}
                />
              ))}
            </div>
          </div>
        );

      default:
        return (
          <EmptyState
            icon="effects"
            title="Kategorie auswählen"
            subtitle="Wähle eine Effekte-Kategorie aus der linken Navigation"
          />
        );
    }
  };

  // Render Transitions Content basierend auf activeTransitionsCategory
  const renderTransitionsContent = () => {
    switch (activeTransitionsCategory) {
      case 'gespeichert':
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-xl bg-[var(--bg-surface)]">
              <Icon name="folder" size={32} strokeWidth={1.5} className="text-[var(--text-tertiary)]" />
            </div>
            <div className="text-base font-medium text-[var(--text-primary)] mb-2">
              Deine Lieblingselemente werden hier angezeigt.
            </div>
            <button
              onClick={() => setActiveTransitionsCategory('uebergaenge-angesagt')}
              className="text-sm text-[var(--capcut-accent-turquoise)] hover:underline"
            >
              Übergänge anzeigen
            </button>
          </div>
        );

      case 'uebergaenge-angesagt':
      case 'uebergaenge-neujahr':
      case 'uebergaenge-klassik':
      case 'uebergaenge-neu':
      case 'uebergaenge-hits':
      case 'uebergaenge-ueberlagerung':
      case 'uebergaenge-leicht':
      case 'uebergaenge-kamera':
      case 'uebergaenge-verschwimmen':
      case 'uebergaenge-einfach':
        const transitions = mockTransitionsData[activeTransitionsCategory] || [];
        const categoryName = activeTransitionsCategory.replace('uebergaenge-', '');
        const displayName = categoryName === 'angesagt' ? 'Angesagt' :
          categoryName === 'neujahr' ? 'Neujahr 🎉' :
            categoryName === 'klassik' ? 'Klassik' :
              categoryName === 'neu' ? 'NEU' :
                categoryName === 'hits' ? 'Hits' :
                  categoryName === 'ueberlagerung' ? 'Überlagerung' :
                    categoryName === 'leicht' ? 'Leicht' :
                      categoryName === 'kamera' ? 'Kamera' :
                        categoryName === 'verschwimmen' ? 'Verschwimmen' :
                          categoryName === 'einfach' ? 'Einfach' :
                            categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

        return (
          <div className="space-y-4">
            {/* Search Bar */}
            <SearchBar
              placeholder="Übergänge suchen"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Header */}
            <div className="text-sm font-medium text-[var(--text-primary)]">
              {displayName}
            </div>

            {/* Grid 5 Spalten */}
            <div className="grid grid-cols-5 gap-3">
              {transitions.map(transition => (
                <EffectTile
                  key={transition.id}
                  thumbnail={transition.thumbnail}
                  title={transition.title}
                  iconName="transitions"
                  onFavorite={() => console.log('favorite', transition.id)}
                  onDownload={() => console.log('download', transition.id)}
                />
              ))}
            </div>
          </div>
        );

      default:
        return (
          <EmptyState
            icon="transitions"
            title="Kategorie auswählen"
            subtitle="Wähle eine Übergänge-Kategorie aus der linken Navigation"
          />
        );
    }
  };

  // Render Subtitles Content basierend auf activeSubtitlesCategory
  const renderSubtitlesContent = () => {
    switch (activeSubtitlesCategory) {
      case 'automatische-untertitel':
        return (
          <div className="space-y-4 max-w-2xl">
            {/* Gesprochene Sprache */}
            <DropdownField
              label="Gesprochene Sprache"
              value={spokenLanguage}
              options={languageOptions}
              onChange={(e) => setSpokenLanguage(e.target.value)}
            />

            {/* Bilinguale Untertitel Checkbox */}
            <CheckboxField
              label="Bilinguale Untertitel"
              checked={bilingualSubtitles}
              icon="star"
              onChange={(checked) => setBilingualSubtitles(checked)}
            />

            {/* Untertitel-Dropdown (wenn bilingual aktiviert) */}
            {bilingualSubtitles && (
              <DropdownField
                label=""
                value={subtitleLanguage}
                options={subtitleLanguageOptions}
                onChange={(e) => setSubtitleLanguage(e.target.value)}
              />
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => console.log('Untertitel löschen')}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Aktuelle Untertitel löschen
              </button>
              <button
                onClick={() => console.log('Untertitel generieren')}
                className="px-6 h-10 bg-[var(--capcut-accent-turquoise)] text-white rounded-md hover:opacity-90 transition-opacity"
              >
                Generieren
              </button>
            </div>
          </div>
        );

      case 'vorlagen-angesagt':
      case 'vorlagen-klassik':
      case 'vorlagen-neu':
      case 'vorlagen-hits':
      case 'vorlagen-wort':
      case 'vorlagen-leuchten':
      case 'vorlagen-einfach':
      case 'vorlagen-aesthetik':
      case 'vorlagen-eine-linie':
        const templates = mockTextTemplatesData[activeSubtitlesCategory.replace('vorlagen-', 'textvorlage-')] ||
          mockTextTemplatesData['textvorlage-angesagt'] || [];
        const categoryName = activeSubtitlesCategory.replace('vorlagen-', '');
        const displayName = categoryName === 'angesagt' ? 'Angesagt' :
          categoryName === 'klassik' ? 'Klassik' :
            categoryName === 'neu' ? 'NEU' :
              categoryName === 'hits' ? 'Hits' :
                categoryName === 'wort' ? 'Wort' :
                  categoryName === 'leuchten' ? 'Leuchten' :
                    categoryName === 'einfach' ? 'Einfach' :
                      categoryName === 'aesthetik' ? 'Ästhetik' :
                        categoryName === 'eine-linie' ? 'Eine Linie' :
                          categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

        return (
          <div className="space-y-4">
            {/* Header */}
            <div className="text-sm font-medium text-[var(--text-primary)]">
              {displayName}
            </div>

            {/* Grid 5 Spalten - TextTemplateTile */}
            <div className="grid grid-cols-5 gap-3">
              {templates.map(template => (
                <TextTemplateTile
                  key={template.id}
                  preview={template.preview}
                  title={template.title}
                  style={template.style}
                  onFavorite={() => console.log('favorite', template.id)}
                  onDownload={() => console.log('download', template.id)}
                />
              ))}
            </div>
          </div>
        );

      case 'automatische-liedtexte':
        return (
          <div className="space-y-4 max-w-2xl">
            {/* Liedtextsprache */}
            <DropdownField
              label="Liedtextsprache"
              value={lyricLanguage}
              options={languageOptions}
              onChange={(e) => setLyricLanguage(e.target.value)}
            />

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => console.log('Liedtexte löschen')}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Aktuelle Liedtexte löschen
              </button>
              <button
                onClick={() => console.log('Liedtext generieren')}
                className="px-6 h-10 bg-[var(--capcut-accent-turquoise)] text-white rounded-md hover:opacity-90 transition-opacity"
              >
                Liedtext generieren
              </button>
            </div>
          </div>
        );

      case 'untertitel-hinzufuegen':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="max-w-md w-full">
              <UploadCard
                icon="subtitles"
                text="Datei importieren"
                subtitle="Unterstützte Dateiformate: SRT, LRC und ASS"
                onClick={() => console.log('Import subtitles')}
              />
            </div>
          </div>
        );

      default:
        return (
          <EmptyState
            icon="subtitles"
            title="Kategorie auswählen"
            subtitle="Wähle eine Untertitel-Kategorie aus der linken Navigation"
          />
        );
    }
  };

  // Render Filters Content basierend auf activeFiltersCategory
  const renderFiltersContent = () => {
    switch (activeFiltersCategory) {
      case 'gespeichert':
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-xl bg-[var(--bg-surface)]">
              <Icon name="folder" size={32} strokeWidth={1.5} className="text-[var(--text-tertiary)]" />
            </div>
            <div className="text-base font-medium text-[var(--text-primary)] mb-2">
              Deine Lieblingselemente werden hier angezeigt.
            </div>
            <button
              onClick={() => setActiveFiltersCategory('filter-vorgestellt')}
              className="text-sm text-[var(--capcut-accent-turquoise)] hover:underline"
            >
              Filter anzeigen
            </button>
          </div>
        );

      case 'filter-vorgestellt':
      case 'filter-neujahr':
      case 'filter-neu':
      case 'filter-hits':
      case 'filter-leben':
      case 'filter-fotoautomat':
      case 'filter-haustier':
      case 'filter-querformat':
      case 'filter-filme':
      case 'filter-mono':
        const filters = mockFiltersData[activeFiltersCategory] || [];
        const categoryName = activeFiltersCategory.replace('filter-', '');
        const displayName = categoryName === 'vorgestellt' ? 'Vorgestellt' :
          categoryName === 'neujahr' ? 'Neujahr 🎉' :
            categoryName === 'neu' ? 'NEU' :
              categoryName === 'hits' ? 'Hits' :
                categoryName === 'leben' ? 'Leben' :
                  categoryName === 'fotoautomat' ? 'Fotoautomat' :
                    categoryName === 'haustier' ? 'Haustier' :
                      categoryName === 'querformat' ? 'Querformat' :
                        categoryName === 'filme' ? 'Filme' :
                          categoryName === 'mono' ? 'Mono' :
                            categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

        return (
          <div className="space-y-4">
            {/* Search Bar */}
            <SearchBar
              placeholder="Nach Filtern suchen"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Header */}
            <div className="text-sm font-medium text-[var(--text-primary)]">
              {displayName}
            </div>

            {/* Grid 5 Spalten */}
            <div className="grid grid-cols-5 gap-3">
              {filters.map(filter => (
                <FilterTile
                  key={filter.id}
                  thumbnail={filter.thumbnail}
                  title={filter.title}
                  onFavorite={() => console.log('favorite', filter.id)}
                  onDownload={() => console.log('download', filter.id)}
                />
              ))}
            </div>
          </div>
        );

      default:
        return (
          <EmptyState
            icon="filter"
            title="Kategorie auswählen"
            subtitle="Wähle eine Filter-Kategorie aus der linken Navigation"
          />
        );
    }
  };

  // Render Adjustment Content basierend auf activeAdjustmentCategory
  const renderAdjustmentContent = () => {
    switch (activeAdjustmentCategory) {
      case 'anpassung-hinzufuegen':
        return (
          <div className="space-y-8">
            {/* Individuelle Anpassung Kachel */}
            <div className="grid grid-cols-2 gap-4 max-w-4xl">
              <button
                onClick={() => console.log('Individuelle Anpassung')}
                className="aspect-square bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white text-lg font-medium hover:opacity-90 transition-opacity shadow-lg"
              >
                Individuelle Anpassung
              </button>
            </div>

            {/* Import Section */}
            <div className="max-w-md">
              <UploadCard
                icon="adjustment"
                text="Importieren"
                subtitle="CUBE- und 3DL-Dateien"
                onClick={() => console.log('Import adjustment')}
              />
            </div>
          </div>
        );

      case 'deine-markenvoreinstellungen':
        return (
          <div className="space-y-4">
            {/* Dropdown für Speicher-Auswahl */}
            <div className="flex items-center gap-3">
              <select
                value={adjustmentStorage}
                onChange={(e) => setAdjustmentStorage(e.target.value)}
                className="flex-1 h-10 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm text-[var(--text-primary)] focus:border-[var(--border-normal)] focus:outline-none transition-colors cursor-pointer"
              >
                <option value="editor52665090">Speicher von editor52665090</option>
              </select>
              <button
                onClick={() => console.log('Settings')}
                className="w-10 h-10 flex items-center justify-center rounded-md border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <Icon name="settings" size={20} />
              </button>
              <button
                onClick={() => console.log('Info')}
                className="w-10 h-10 flex items-center justify-center rounded-md border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <Icon name="info" size={20} />
              </button>
            </div>

            {/* Grid mit gespeicherten Anpassungen */}
            <div className="grid grid-cols-5 gap-3">
              {mockSavedAdjustments.map(item => (
                <div key={item.id} className="relative group cursor-pointer">
                  <div className="aspect-square bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-normal)] transition-colors overflow-hidden">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="image" size={32} className="text-[var(--text-tertiary)]" />
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-[var(--text-secondary)] truncate">{item.name}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'lut':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="max-w-md w-full">
              <UploadCard
                icon="adjustment"
                text="LUT importieren"
                subtitle="CUBE- und 3DL-Dateien"
                onClick={() => console.log('Import LUT')}
              />
            </div>
          </div>
        );

      default:
        return (
          <EmptyState
            icon="adjustment"
            title="Kategorie auswählen"
            subtitle="Wähle eine Anpassungs-Kategorie aus der linken Navigation"
          />
        );
    }
  };

  // Render Vorlagen Content basierend auf activeVorlagenCategory
  const renderVorlagenContent = () => {
    // Empty States für Gespeichert/Gekauft
    if (activeVorlagenCategory === 'gespeichert') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <Icon name="folder" size={64} className="text-[var(--text-tertiary)] mb-4" />
          <p className="text-[var(--text-secondary)] mb-2">
            Deine Lieblingselemente werden hier angezeigt.
          </p>
          <button
            onClick={() => console.log('Show templates')}
            className="text-[var(--accent-primary)] hover:underline"
          >
            Vorlagen anzeigen
          </button>
        </div>
      );
    }

    if (activeVorlagenCategory === 'gekauft') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <Icon name="folder" size={64} className="text-[var(--text-tertiary)] mb-4" />
          <p className="text-[var(--text-secondary)] mb-2">
            Deine gekauften Vorlagen erscheinen hier.
          </p>
          <button
            onClick={() => console.log('Show templates')}
            className="text-[var(--accent-primary)] hover:underline"
          >
            Vorlagen anzeigen
          </button>
        </div>
      );
    }

    // Template Browse für alle Vorlagen-Kategorien
    if (activeVorlagenCategory.startsWith('vorlagen-')) {
      const categoryKey = activeVorlagenCategory;
      const templates = mockTemplatesData[categoryKey] || [];

      return (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nach Vorlagen suchen"
              value={templateSearchQuery}
              onChange={(e) => setTemplateSearchQuery(e.target.value)}
              className="w-full h-10 px-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-normal)] focus:outline-none transition-colors"
            />

            <div className="flex gap-3">
              <select
                value={templateFilterOrientation}
                onChange={(e) => setTemplateFilterOrientation(e.target.value)}
                className="flex-1 h-10 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm text-[var(--text-primary)] focus:border-[var(--border-normal)] focus:outline-none transition-colors cursor-pointer"
              >
                <option value="alle">Für dich... / AusrichtungAlle</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>

              <select
                value={templateFilterClips}
                onChange={(e) => setTemplateFilterClips(e.target.value)}
                className="flex-1 h-10 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm text-[var(--text-primary)] focus:border-[var(--border-normal)] focus:outline-none transition-colors cursor-pointer"
              >
                <option value="kein-limit">ClipsKein Limit</option>
                <option value="1">1 Clip</option>
                <option value="5">5 Clips</option>
              </select>

              <select
                value={templateFilterDuration}
                onChange={(e) => setTemplateFilterDuration(e.target.value)}
                className="flex-1 h-10 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm text-[var(--text-primary)] focus:border-[var(--border-normal)] focus:outline-none transition-colors cursor-pointer"
              >
                <option value="kein-limit">DauerKein Limit</option>
                <option value="15s">15s</option>
                <option value="30s">30s</option>
              </select>
            </div>
          </div>

          {/* Template Grid */}
          {templates.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {templates.map(template => (
                <TemplateCard
                  key={template.id}
                  thumbnail={template.thumbnail}
                  badge={template.badge}
                  likes={template.likes}
                  clipCount={template.clipCount}
                  title={template.title}
                  onClick={() => console.log('Template clicked:', template.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="video"
              title="Keine Vorlagen"
              subtitle="In dieser Kategorie sind noch keine Vorlagen verfügbar"
            />
          )}
        </div>
      );
    }

    return (
      <EmptyState
        icon="video"
        title="Kategorie auswählen"
        subtitle="Wähle eine Vorlagen-Kategorie aus der linken Navigation"
      />
    );
  };

  // Render Navigation basierend auf activeMainTab
  const renderNavigation = () => {
    if (activeMainTab === 'effekte') {
      return (
        <>
          {/* Effects Navigation */}
          <NavCategory
            title="Gespeichert"
            onSelect={() => setActiveEffectsCategory('gespeichert')}
            isActive={activeEffectsCategory === 'gespeichert'}
          />

          <NavCategory title="Videoeffekte" defaultOpen={false}>
            <NavSubItem onClick={() => setActiveEffectsCategory('videoeffekte-angesagt')} isActive={activeEffectsCategory === 'videoeffekte-angesagt'}>
              Angesagt
            </NavSubItem>
            <NavSubItem onClick={() => setActiveEffectsCategory('videoeffekte-neujahr')} isActive={activeEffectsCategory === 'videoeffekte-neujahr'}>
              Neujahr 🎉
            </NavSubItem>
            <NavSubItem onClick={() => setActiveEffectsCategory('videoeffekte-klassik')} isActive={activeEffectsCategory === 'videoeffekte-klassik'}>
              Klassik
            </NavSubItem>
            <NavSubItem onClick={() => setActiveEffectsCategory('videoeffekte-neu')} isActive={activeEffectsCategory === 'videoeffekte-neu'}>
              NEU
            </NavSubItem>
            <NavSubItem onClick={() => setActiveEffectsCategory('videoeffekte-hits')} isActive={activeEffectsCategory === 'videoeffekte-hits'}>
              Hits
            </NavSubItem>
            <NavSubItem onClick={() => setActiveEffectsCategory('videoeffekte-intro-outro')} isActive={activeEffectsCategory === 'videoeffekte-intro-outro'}>
              Intro und Outro
            </NavSubItem>
            <NavSubItem onClick={() => setActiveEffectsCategory('videoeffekte-zufaellige-frames')} isActive={activeEffectsCategory === 'videoeffekte-zufaellige-frames'}>
              Zufällige Frames
            </NavSubItem>
            <NavSubItem onClick={() => setActiveEffectsCategory('videoeffekte-party')} isActive={activeEffectsCategory === 'videoeffekte-party'}>
              Party
            </NavSubItem>
            <NavSubItem onClick={() => setActiveEffectsCategory('videoeffekte-bewegung')} isActive={activeEffectsCategory === 'videoeffekte-bewegung'}>
              Bewegung
            </NavSubItem>
          </NavCategory>

          <NavCategory title="Körpereffekte" defaultOpen={false}>
            <NavSubItem onClick={() => setActiveEffectsCategory('koerpereffekte-angesagt')} isActive={activeEffectsCategory === 'koerpereffekte-angesagt'}>
              Angesagt
            </NavSubItem>
            <NavSubItem onClick={() => setActiveEffectsCategory('koerpereffekte-pro')} isActive={activeEffectsCategory === 'koerpereffekte-pro'}>
              Pro
            </NavSubItem>
            <NavSubItem onClick={() => setActiveEffectsCategory('koerpereffekte-hits')} isActive={activeEffectsCategory === 'koerpereffekte-hits'}>
              Hits
            </NavSubItem>
            <NavSubItem onClick={() => setActiveEffectsCategory('koerpereffekte-klon')} isActive={activeEffectsCategory === 'koerpereffekte-klon'}>
              Klon
            </NavSubItem>
            <NavSubItem onClick={() => setActiveEffectsCategory('koerpereffekte-leuchtende-linien')} isActive={activeEffectsCategory === 'koerpereffekte-leuchtende-linien'}>
              Leuchtende Linien
            </NavSubItem>
            <NavSubItem onClick={() => setActiveEffectsCategory('koerpereffekte-rahmen')} isActive={activeEffectsCategory === 'koerpereffekte-rahmen'}>
              Rahmen
            </NavSubItem>
            <NavSubItem onClick={() => setActiveEffectsCategory('koerpereffekte-halluzination')} isActive={activeEffectsCategory === 'koerpereffekte-halluzination'}>
              Halluzination
            </NavSubItem>
            <NavSubItem onClick={() => setActiveEffectsCategory('koerpereffekte-superkraefte')} isActive={activeEffectsCategory === 'koerpereffekte-superkraefte'}>
              Superkräfte
            </NavSubItem>
            <NavSubItem onClick={() => setActiveEffectsCategory('koerpereffekte-rolle')} isActive={activeEffectsCategory === 'koerpereffekte-rolle'}>
              Rolle
            </NavSubItem>
          </NavCategory>
        </>
      );
    }

    if (activeMainTab === 'sticker') {
      return (
        <>
          {/* Sticker Navigation */}
          <NavCategory title="Deine" defaultOpen={true}>
            <NavSubItem
              onClick={() => setActiveStickerCategory('deine-gespeichert')}
              isActive={activeStickerCategory === 'deine-gespeichert'}
            >
              Gespeichert
            </NavSubItem>
            <NavSubItem
              onClick={() => setActiveStickerCategory('deine-markensticker')}
              isActive={activeStickerCategory === 'deine-markensticker'}
            >
              Markensticker
            </NavSubItem>
          </NavCategory>

          <NavCategory title="Sticker" defaultOpen={false}>
            <NavSubItem onClick={() => setActiveStickerCategory('sticker-ki-generiert')} isActive={activeStickerCategory === 'sticker-ki-generiert'}>
              KI-generiert
            </NavSubItem>
            <NavSubItem onClick={() => setActiveStickerCategory('sticker-angesagt')} isActive={activeStickerCategory === 'sticker-angesagt'}>
              Angesagt
            </NavSubItem>
            <NavSubItem onClick={() => setActiveStickerCategory('sticker-2026')} isActive={activeStickerCategory === 'sticker-2026'}>
              2026
            </NavSubItem>
            <NavSubItem onClick={() => setActiveStickerCategory('sticker-klassik')} isActive={activeStickerCategory === 'sticker-klassik'}>
              Klassik
            </NavSubItem>
            <NavSubItem onClick={() => setActiveStickerCategory('sticker-neu')} isActive={activeStickerCategory === 'sticker-neu'}>
              NEU
            </NavSubItem>
            <NavSubItem onClick={() => setActiveStickerCategory('sticker-hits')} isActive={activeStickerCategory === 'sticker-hits'}>
              Hits
            </NavSubItem>
            <NavSubItem onClick={() => setActiveStickerCategory('sticker-nailoong')} isActive={activeStickerCategory === 'sticker-nailoong'}>
              Nailoong💚
            </NavSubItem>
            <NavSubItem onClick={() => setActiveStickerCategory('sticker-symbole')} isActive={activeStickerCategory === 'sticker-symbole'}>
              Symbole
            </NavSubItem>
            <NavSubItem onClick={() => setActiveStickerCategory('sticker-emoji')} isActive={activeStickerCategory === 'sticker-emoji'}>
              Emoji
            </NavSubItem>
          </NavCategory>

          <NavCategory
            title="Formen"
            onSelect={() => setActiveStickerCategory('formen')}
            isActive={activeStickerCategory === 'formen'}
          />
        </>
      );
    }

    if (activeMainTab === 'text') {
      return (
        <>
          {/* Text Navigation */}
          <NavCategory
            title="Text hinzufügen"
            onSelect={() => setActiveTextCategory('text-hinzufuegen')}
            isActive={activeTextCategory === 'text-hinzufuegen'}
          />

          <NavCategory title="Deine" defaultOpen={false}>
            <NavSubItem
              onClick={() => setActiveTextCategory('deine-gespeichert')}
              isActive={activeTextCategory === 'deine-gespeichert'}
            >
              Gespeichert
            </NavSubItem>
            <NavSubItem
              onClick={() => setActiveTextCategory('deine-voreinstellungen')}
              isActive={activeTextCategory === 'deine-voreinstellungen'}
            >
              Voreinstellungen
            </NavSubItem>
          </NavCategory>

          <NavCategory title="Texteffekte" defaultOpen={false}>
            <NavSubItem onClick={() => setActiveTextCategory('texteffekte-angesagt')} isActive={activeTextCategory === 'texteffekte-angesagt'}>
              Angesagt
            </NavSubItem>
            <NavSubItem onClick={() => setActiveTextCategory('texteffekte-neujahr')} isActive={activeTextCategory === 'texteffekte-neujahr'}>
              Neujahr 🎉
            </NavSubItem>
            <NavSubItem onClick={() => setActiveTextCategory('texteffekte-klassik')} isActive={activeTextCategory === 'texteffekte-klassik'}>
              Klassik
            </NavSubItem>
            <NavSubItem onClick={() => setActiveTextCategory('texteffekte-neu')} isActive={activeTextCategory === 'texteffekte-neu'}>
              NEU
            </NavSubItem>
            <NavSubItem onClick={() => setActiveTextCategory('texteffekte-hits')} isActive={activeTextCategory === 'texteffekte-hits'}>
              Hits
            </NavSubItem>
            <NavSubItem onClick={() => setActiveTextCategory('texteffekte-manuskript')} isActive={activeTextCategory === 'texteffekte-manuskript'}>
              Manuskript
            </NavSubItem>
            <NavSubItem onClick={() => setActiveTextCategory('texteffekte-metall')} isActive={activeTextCategory === 'texteffekte-metall'}>
              Metall
            </NavSubItem>
            <NavSubItem onClick={() => setActiveTextCategory('texteffekte-leuchten')} isActive={activeTextCategory === 'texteffekte-leuchten'}>
              Leuchten
            </NavSubItem>
          </NavCategory>

          <NavCategory title="Textvorlage" defaultOpen={false}>
            <NavSubItem onClick={() => setActiveTextCategory('textvorlage-ki-generiert')} isActive={activeTextCategory === 'textvorlage-ki-generiert'}>
              KI-generiert
            </NavSubItem>
            <NavSubItem onClick={() => setActiveTextCategory('textvorlage-angesagt')} isActive={activeTextCategory === 'textvorlage-angesagt'}>
              Angesagt
            </NavSubItem>
            <NavSubItem onClick={() => setActiveTextCategory('textvorlage-neujahr')} isActive={activeTextCategory === 'textvorlage-neujahr'}>
              Neujahr 🎉
            </NavSubItem>
            <NavSubItem onClick={() => setActiveTextCategory('textvorlage-klassik')} isActive={activeTextCategory === 'textvorlage-klassik'}>
              Klassik
            </NavSubItem>
            <NavSubItem onClick={() => setActiveTextCategory('textvorlage-neu')} isActive={activeTextCategory === 'textvorlage-neu'}>
              NEU
            </NavSubItem>
            <NavSubItem onClick={() => setActiveTextCategory('textvorlage-hits')} isActive={activeTextCategory === 'textvorlage-hits'}>
              Hits
            </NavSubItem>
            <NavSubItem onClick={() => setActiveTextCategory('textvorlage-nailoong')} isActive={activeTextCategory === 'textvorlage-nailoong'}>
              Nailoong💚
            </NavSubItem>
          </NavCategory>

          <NavCategory
            title="Automatische ..."
            onSelect={() => setActiveTextCategory('automatische-untertitel')}
            isActive={activeTextCategory === 'automatische-untertitel'}
          />

          <NavCategory
            title="Lokale Untertitel"
            onSelect={() => setActiveTextCategory('lokale-untertitel')}
            isActive={activeTextCategory === 'lokale-untertitel'}
          />
        </>
      );
    }

    if (activeMainTab === 'audio') {
      return (
        <>
          {/* Audio Navigation */}
          <NavCategory
            title="Importieren"
            onSelect={() => setActiveAudioCategory('importieren')}
            isActive={activeAudioCategory === 'importieren'}
          />

          <NavCategory
            title="Deine"
            defaultOpen={false}
          >
            <NavSubItem
              onClick={() => setActiveAudioCategory('deine-gespeichert')}
              isActive={activeAudioCategory === 'deine-gespeichert'}
            >
              Gespeichert
            </NavSubItem>
            <NavSubItem
              onClick={() => setActiveAudioCategory('deine-markenmusik')}
              isActive={activeAudioCategory === 'deine-markenmusik'}
            >
              Markenmusik
            </NavSubItem>
          </NavCategory>

          <NavCategory title="Musik" defaultOpen={true}>
            <NavSubItem onClick={() => setActiveAudioCategory('musik-angesagt')} isActive={activeAudioCategory === 'musik-angesagt'}>
              Angesagte Hinte...
            </NavSubItem>
            <NavSubItem onClick={() => setActiveAudioCategory('musik-vlog')} isActive={activeAudioCategory === 'musik-vlog'}>
              Vlog
            </NavSubItem>
            <NavSubItem onClick={() => setActiveAudioCategory('musik-neujahr')} isActive={activeAudioCategory === 'musik-neujahr'}>
              Neujahr 🎉
            </NavSubItem>
            <NavSubItem onClick={() => setActiveAudioCategory('musik-marketing')} isActive={activeAudioCategory === 'musik-marketing'}>
              Marketing
            </NavSubItem>
            <NavSubItem onClick={() => setActiveAudioCategory('musik-cute')} isActive={activeAudioCategory === 'musik-cute'}>
              Cute
            </NavSubItem>
            <NavSubItem onClick={() => setActiveAudioCategory('musik-vertraeumt')} isActive={activeAudioCategory === 'musik-vertraeumt'}>
              Verträumt
            </NavSubItem>
            <NavSubItem onClick={() => setActiveAudioCategory('musik-hits')} isActive={activeAudioCategory === 'musik-hits'}>
              Hits
            </NavSubItem>
            <NavSubItem onClick={() => setActiveAudioCategory('musik-reisen')} isActive={activeAudioCategory === 'musik-reisen'}>
              Reisen
            </NavSubItem>
          </NavCategory>

          <NavCategory title="Soundeffekte" defaultOpen={false}>
            <NavSubItem onClick={() => setActiveAudioCategory('soundeffekte-angesagt')} isActive={activeAudioCategory === 'soundeffekte-angesagt'}>
              Angesagt
            </NavSubItem>
            <NavSubItem onClick={() => setActiveAudioCategory('soundeffekte-hits')} isActive={activeAudioCategory === 'soundeffekte-hits'}>
              Hits
            </NavSubItem>
            <NavSubItem onClick={() => setActiveAudioCategory('soundeffekte-tiktok')} isActive={activeAudioCategory === 'soundeffekte-tiktok'}>
              TikTok
            </NavSubItem>
            <NavSubItem onClick={() => setActiveAudioCategory('soundeffekte-neujahr')} isActive={activeAudioCategory === 'soundeffekte-neujahr'}>
              Neujahr 🎉
            </NavSubItem>
            <NavSubItem onClick={() => setActiveAudioCategory('soundeffekte-sale')} isActive={activeAudioCategory === 'soundeffekte-sale'}>
              Sale
            </NavSubItem>
            <NavSubItem onClick={() => setActiveAudioCategory('soundeffekte-schnelle-beweg')} isActive={activeAudioCategory === 'soundeffekte-schnelle-beweg'}>
              Schnelle Beweg...
            </NavSubItem>
            <NavSubItem onClick={() => setActiveAudioCategory('soundeffekte-asmr')} isActive={activeAudioCategory === 'soundeffekte-asmr'}>
              ASMR
            </NavSubItem>
          </NavCategory>

          <NavCategory
            title="Urheberrecht"
            onSelect={() => setActiveAudioCategory('urheberrecht')}
            isActive={activeAudioCategory === 'urheberrecht'}
          />
        </>
      );
    }

    if (activeMainTab === 'uebergaenge') {
      return (
        <>
          {/* Transitions Navigation */}
          <NavCategory
            title="Gespeichert"
            onSelect={() => setActiveTransitionsCategory('gespeichert')}
            isActive={activeTransitionsCategory === 'gespeichert'}
          />

          <NavCategory title="Übergänge" defaultOpen={false}>
            <NavSubItem onClick={() => setActiveTransitionsCategory('uebergaenge-angesagt')} isActive={activeTransitionsCategory === 'uebergaenge-angesagt'}>
              Angesagt
            </NavSubItem>
            <NavSubItem onClick={() => setActiveTransitionsCategory('uebergaenge-neujahr')} isActive={activeTransitionsCategory === 'uebergaenge-neujahr'}>
              Neujahr 🎉
            </NavSubItem>
            <NavSubItem onClick={() => setActiveTransitionsCategory('uebergaenge-klassik')} isActive={activeTransitionsCategory === 'uebergaenge-klassik'}>
              Klassik
            </NavSubItem>
            <NavSubItem onClick={() => setActiveTransitionsCategory('uebergaenge-neu')} isActive={activeTransitionsCategory === 'uebergaenge-neu'}>
              NEU
            </NavSubItem>
            <NavSubItem onClick={() => setActiveTransitionsCategory('uebergaenge-hits')} isActive={activeTransitionsCategory === 'uebergaenge-hits'}>
              Hits
            </NavSubItem>
            <NavSubItem onClick={() => setActiveTransitionsCategory('uebergaenge-ueberlagerung')} isActive={activeTransitionsCategory === 'uebergaenge-ueberlagerung'}>
              Überlagerung
            </NavSubItem>
            <NavSubItem onClick={() => setActiveTransitionsCategory('uebergaenge-leicht')} isActive={activeTransitionsCategory === 'uebergaenge-leicht'}>
              Leicht
            </NavSubItem>
            <NavSubItem onClick={() => setActiveTransitionsCategory('uebergaenge-kamera')} isActive={activeTransitionsCategory === 'uebergaenge-kamera'}>
              Kamera
            </NavSubItem>
            <NavSubItem onClick={() => setActiveTransitionsCategory('uebergaenge-verschwimmen')} isActive={activeTransitionsCategory === 'uebergaenge-verschwimmen'}>
              Verschwimmen
            </NavSubItem>
            <NavSubItem onClick={() => setActiveTransitionsCategory('uebergaenge-einfach')} isActive={activeTransitionsCategory === 'uebergaenge-einfach'}>
              Einfach
            </NavSubItem>
          </NavCategory>
        </>
      );
    }

    if (activeMainTab === 'untertitel') {
      return (
        <>
          {/* Subtitles Navigation */}
          <NavCategory
            title="Automatische ..."
            onSelect={() => setActiveSubtitlesCategory('automatische-untertitel')}
            isActive={activeSubtitlesCategory === 'automatische-untertitel'}
          />

          <NavCategory title="Vorlagen" defaultOpen={false}>
            <NavSubItem onClick={() => setActiveSubtitlesCategory('vorlagen-angesagt')} isActive={activeSubtitlesCategory === 'vorlagen-angesagt'}>
              Angesagt
            </NavSubItem>
            <NavSubItem onClick={() => setActiveSubtitlesCategory('vorlagen-klassik')} isActive={activeSubtitlesCategory === 'vorlagen-klassik'}>
              Klassik
            </NavSubItem>
            <NavSubItem onClick={() => setActiveSubtitlesCategory('vorlagen-neu')} isActive={activeSubtitlesCategory === 'vorlagen-neu'}>
              NEU
            </NavSubItem>
            <NavSubItem onClick={() => setActiveSubtitlesCategory('vorlagen-hits')} isActive={activeSubtitlesCategory === 'vorlagen-hits'}>
              Hits
            </NavSubItem>
            <NavSubItem onClick={() => setActiveSubtitlesCategory('vorlagen-wort')} isActive={activeSubtitlesCategory === 'vorlagen-wort'}>
              Wort
            </NavSubItem>
            <NavSubItem onClick={() => setActiveSubtitlesCategory('vorlagen-leuchten')} isActive={activeSubtitlesCategory === 'vorlagen-leuchten'}>
              Leuchten
            </NavSubItem>
            <NavSubItem onClick={() => setActiveSubtitlesCategory('vorlagen-einfach')} isActive={activeSubtitlesCategory === 'vorlagen-einfach'}>
              Einfach
            </NavSubItem>
            <NavSubItem onClick={() => setActiveSubtitlesCategory('vorlagen-aesthetik')} isActive={activeSubtitlesCategory === 'vorlagen-aesthetik'}>
              Ästhetik
            </NavSubItem>
            <NavSubItem onClick={() => setActiveSubtitlesCategory('vorlagen-eine-linie')} isActive={activeSubtitlesCategory === 'vorlagen-eine-linie'}>
              Eine Linie
            </NavSubItem>
          </NavCategory>

          <NavCategory
            title="Automatische ..."
            onSelect={() => setActiveSubtitlesCategory('automatische-liedtexte')}
            isActive={activeSubtitlesCategory === 'automatische-liedtexte'}
          />

          <NavCategory
            title="Untertitel hinz..."
            onSelect={() => setActiveSubtitlesCategory('untertitel-hinzufuegen')}
            isActive={activeSubtitlesCategory === 'untertitel-hinzufuegen'}
          />
        </>
      );
    }

    if (activeMainTab === 'filter') {
      return (
        <>
          {/* Filters Navigation */}
          <NavCategory
            title="Gespeichert"
            onSelect={() => setActiveFiltersCategory('gespeichert')}
            isActive={activeFiltersCategory === 'gespeichert'}
          />

          <NavCategory title="Filter" defaultOpen={false}>
            <NavSubItem onClick={() => setActiveFiltersCategory('filter-vorgestellt')} isActive={activeFiltersCategory === 'filter-vorgestellt'}>
              Vorgestellt
            </NavSubItem>
            <NavSubItem onClick={() => setActiveFiltersCategory('filter-neujahr')} isActive={activeFiltersCategory === 'filter-neujahr'}>
              Neujahr 🎉
            </NavSubItem>
            <NavSubItem onClick={() => setActiveFiltersCategory('filter-neu')} isActive={activeFiltersCategory === 'filter-neu'}>
              NEU
            </NavSubItem>
            <NavSubItem onClick={() => setActiveFiltersCategory('filter-hits')} isActive={activeFiltersCategory === 'filter-hits'}>
              Hits
            </NavSubItem>
            <NavSubItem onClick={() => setActiveFiltersCategory('filter-leben')} isActive={activeFiltersCategory === 'filter-leben'}>
              Leben
            </NavSubItem>
            <NavSubItem onClick={() => setActiveFiltersCategory('filter-fotoautomat')} isActive={activeFiltersCategory === 'filter-fotoautomat'}>
              Fotoautomat
            </NavSubItem>
            <NavSubItem onClick={() => setActiveFiltersCategory('filter-haustier')} isActive={activeFiltersCategory === 'filter-haustier'}>
              Haustier
            </NavSubItem>
            <NavSubItem onClick={() => setActiveFiltersCategory('filter-querformat')} isActive={activeFiltersCategory === 'filter-querformat'}>
              Querformat
            </NavSubItem>
            <NavSubItem onClick={() => setActiveFiltersCategory('filter-filme')} isActive={activeFiltersCategory === 'filter-filme'}>
              Filme
            </NavSubItem>
            <NavSubItem onClick={() => setActiveFiltersCategory('filter-mono')} isActive={activeFiltersCategory === 'filter-mono'}>
              Mono
            </NavSubItem>
          </NavCategory>
        </>
      );
    }

    if (activeMainTab === 'anpassung') {
      return (
        <>
          {/* Adjustment Navigation */}
          <NavCategory
            title="Anpassung hin..."
            onSelect={() => setActiveAdjustmentCategory('anpassung-hinzufuegen')}
            isActive={activeAdjustmentCategory === 'anpassung-hinzufuegen'}
          />

          <NavCategory title="Deine" defaultOpen={false}>
            <NavSubItem
              onClick={() => setActiveAdjustmentCategory('deine-markenvoreinstellungen')}
              isActive={activeAdjustmentCategory === 'deine-markenvoreinstellungen'}
            >
              Markenvoreinste...
            </NavSubItem>
          </NavCategory>

          <NavCategory
            title="LUT"
            onSelect={() => setActiveAdjustmentCategory('lut')}
            isActive={activeAdjustmentCategory === 'lut'}
          />
        </>
      );
    }

    if (activeMainTab === 'vorlagen') {
      return (
        <>
          {/* Vorlagen Navigation */}
          <NavCategory
            title="Deine"
            onSelect={() => setActiveVorlagenCategory('deine')}
            isActive={activeVorlagenCategory === 'deine'}
            closeable={true}
          />

          <NavCategory
            title="Gespeichert"
            onSelect={() => setActiveVorlagenCategory('gespeichert')}
            isActive={activeVorlagenCategory === 'gespeichert'}
          />

          <NavCategory
            title="Gekauft"
            onSelect={() => setActiveVorlagenCategory('gekauft')}
            isActive={activeVorlagenCategory === 'gekauft'}
          />

          <NavCategory title="Vorlagen" defaultOpen={true}>
            <NavSubItem
              onClick={() => setActiveVorlagenCategory('vorlagen-fuer-dich')}
              isActive={activeVorlagenCategory === 'vorlagen-fuer-dich'}
            >
              Für dich
            </NavSubItem>
            <NavSubItem
              onClick={() => setActiveVorlagenCategory('vorlagen-premium')}
              isActive={activeVorlagenCategory === 'vorlagen-premium'}
            >
              Premium ⭐
            </NavSubItem>
            <NavSubItem
              onClick={() => setActiveVorlagenCategory('vorlagen-alltag')}
              isActive={activeVorlagenCategory === 'vorlagen-alltag'}
            >
              Alltag
            </NavSubItem>
            <NavSubItem
              onClick={() => setActiveVorlagenCategory('vorlagen-selfie')}
              isActive={activeVorlagenCategory === 'vorlagen-selfie'}
            >
              Selfie
            </NavSubItem>
            <NavSubItem
              onClick={() => setActiveVorlagenCategory('vorlagen-ueber-mich')}
              isActive={activeVorlagenCategory === 'vorlagen-ueber-mich'}
            >
              über mich
            </NavSubItem>
            <NavSubItem
              onClick={() => setActiveVorlagenCategory('vorlagen-texte')}
              isActive={activeVorlagenCategory === 'vorlagen-texte'}
            >
              Texte
            </NavSubItem>
            <NavSubItem
              onClick={() => setActiveVorlagenCategory('vorlagen-musik-festival')}
              isActive={activeVorlagenCategory === 'vorlagen-musik-festival'}
            >
              Musik festival
            </NavSubItem>
            <NavSubItem
              onClick={() => setActiveVorlagenCategory('vorlagen-beziehung')}
              isActive={activeVorlagenCategory === 'vorlagen-beziehung'}
            >
              Beziehung
            </NavSubItem>
            <NavSubItem
              onClick={() => setActiveVorlagenCategory('vorlagen-freundschaft')}
              isActive={activeVorlagenCategory === 'vorlagen-freundschaft'}
            >
              Freundschaft
            </NavSubItem>
            <NavSubItem
              onClick={() => setActiveVorlagenCategory('vorlagen-reisen')}
              isActive={activeVorlagenCategory === 'vorlagen-reisen'}
            >
              Reisen
            </NavSubItem>
          </NavCategory>
        </>
      );
    }

    // Default: Media Navigation
    return null;
  };

  return (
    <div className="h-full flex bg-[var(--bg-panel)]">
      {/* Linker Bereich: Navigation - wie CapCut */}
      <div className="w-[180px] flex-shrink-0 overflow-y-auto p-3 border-r border-[var(--border-subtle)]">
        {(activeMainTab === 'effekte' || activeMainTab === 'sticker' || activeMainTab === 'text' || activeMainTab === 'audio' || activeMainTab === 'uebergaenge' || activeMainTab === 'untertitel' || activeMainTab === 'filter' || activeMainTab === 'anpassung' || activeMainTab === 'vorlagen') ? renderNavigation() : (
          <>
            {/* Importieren */}
            <NavCategory
              title="Importieren"
              defaultOpen={true}
              isActive={activeCategory.startsWith('medien') || activeCategory === 'untergeordnete-projekte'}
            >
              <NavSubItem
                onClick={() => setActiveCategory('medien')}
                isActive={activeCategory === 'medien'}
              >
                Medien
              </NavSubItem>
              <NavSubItem
                onClick={() => setActiveCategory('untergeordnete-projekte')}
                isActive={activeCategory === 'untergeordnete-projekte'}
              >
                Untergeordnete Projekte
              </NavSubItem>
            </NavCategory>

            {/* Deine */}
            <NavCategory
              title="Deine"
              isActive={['gespeichert', 'meine-voreinstellungen', 'markenassets'].includes(activeCategory)}
            >
              <NavSubItem
                onClick={() => setActiveCategory('gespeichert')}
                isActive={activeCategory === 'gespeichert'}
              >
                Gespeichert
              </NavSubItem>
              <NavSubItem
                onClick={() => setActiveCategory('meine-voreinstellungen')}
                isActive={activeCategory === 'meine-voreinstellungen'}
              >
                Meine Voreinstellungen
              </NavSubItem>
              <NavSubItem
                onClick={() => setActiveCategory('markenassets')}
                isActive={activeCategory === 'markenassets'}
              >
                Markenassets
              </NavSubItem>
            </NavCategory>

            {/* KI-Medien */}
            <NavCategory
              title="KI-Medien"
              isActive={['ki-bilder', 'ki-video', 'ki-dialogszenen'].includes(activeCategory)}
            >
              <NavSubItem
                onClick={() => setActiveCategory('ki-bilder')}
                isActive={activeCategory === 'ki-bilder'}
              >
                KI-Bilder
              </NavSubItem>
              <NavSubItem
                onClick={() => setActiveCategory('ki-video')}
                isActive={activeCategory === 'ki-video'}
              >
                KI-Video
              </NavSubItem>
              <NavSubItem
                onClick={() => setActiveCategory('ki-dialogszenen')}
                isActive={activeCategory === 'ki-dialogszenen'}
              >
                KI-Dialogszenen
              </NavSubItem>
            </NavCategory>

            {/* Bibliothek */}
            <NavCategory
              title="Bibliothek"
              isActive={['angesagt', 'weihnachten', 'greenscreen', 'hintergrund', 'intro-ende', 'uebergaenge', 'landschaft', 'atmosphaere', 'leben'].includes(activeCategory)}
            >
              <NavSubItem
                onClick={() => setActiveCategory('angesagt')}
                isActive={activeCategory === 'angesagt'}
              >
                Angesagt
              </NavSubItem>
              <NavSubItem
                onClick={() => setActiveCategory('weihnachten')}
                isActive={activeCategory === 'weihnachten'}
              >
                Weihnachten & Neujahr
              </NavSubItem>
              <NavSubItem
                onClick={() => setActiveCategory('greenscreen')}
                isActive={activeCategory === 'greenscreen'}
              >
                Greenscreen
              </NavSubItem>
              <NavSubItem
                onClick={() => setActiveCategory('hintergrund')}
                isActive={activeCategory === 'hintergrund'}
              >
                Hintergrund
              </NavSubItem>
              <NavSubItem
                onClick={() => setActiveCategory('intro-ende')}
                isActive={activeCategory === 'intro-ende'}
              >
                Intro & Ende
              </NavSubItem>
              <NavSubItem
                onClick={() => setActiveCategory('uebergaenge')}
                isActive={activeCategory === 'uebergaenge'}
              >
                Übergänge
              </NavSubItem>
              <NavSubItem
                onClick={() => setActiveCategory('landschaft')}
                isActive={activeCategory === 'landschaft'}
              >
                Landschaft
              </NavSubItem>
              <NavSubItem
                onClick={() => setActiveCategory('atmosphaere')}
                isActive={activeCategory === 'atmosphaere'}
              >
                Atmosphäre
              </NavSubItem>
              <NavSubItem
                onClick={() => setActiveCategory('leben')}
                isActive={activeCategory === 'leben'}
              >
                Leben
              </NavSubItem>
            </NavCategory>

            {/* Speicher */}
            <NavCategory
              title="Speicher"
              onSelect={() => setActiveCategory('speicher')}
              isActive={activeCategory === 'speicher'}
            />

            {/* Dreamina */}
            <NavCategory
              title="Dreamina"
              onSelect={() => setActiveCategory('dreamina')}
              isActive={activeCategory === 'dreamina'}
            />
          </>
        )}
      </div>

      {/* Rechter Bereich: Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeMainTab === 'effekte' ? renderEffectsContent() :
          activeMainTab === 'sticker' ? renderStickerContent() :
            activeMainTab === 'text' ? renderTextContent() :
              activeMainTab === 'audio' ? renderAudioContent() :
                activeMainTab === 'uebergaenge' ? renderTransitionsContent() :
                  activeMainTab === 'untertitel' ? renderSubtitlesContent() :
                    activeMainTab === 'filter' ? renderFiltersContent() :
                      activeMainTab === 'anpassung' ? renderAdjustmentContent() :
                        activeMainTab === 'vorlagen' ? renderVorlagenContent() :
                          renderContent()}
      </div>
    </div>
  );
}
