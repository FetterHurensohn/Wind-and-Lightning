/**
 * VideoBar-Komponente
 * 
 * Pixelgenaue Top-Toolbar für Video-Editor mit Icon-Kategorien, KI-Panel, 
 * editierbarem Projektnamen und Export-Funktionen.
 * 
 * Layout: Grid [Left Icons | Center Project Name | Right Actions]
 * Höhe: 56px (h-14)
 * 
 * Props:
 * @param {string} projectName - Aktueller Projektname
 * @param {Function} onRename - Callback beim Umbenennen (newName)
 * @param {Function} onOpenPanel - Callback zum Öffnen einer Sidebar-Kategorie (panelKey)
 * @param {Function} onImport - Callback für Media-Import (files)
 * @param {Function} onExport - Callback für Export (options)
 * @param {Function} onShare - Callback für Share
 * @param {Array} models - KI-Models für Dropdown: [{ id, label, description }]
 */

import React, { useState, useRef, useEffect } from 'react';
import IconButton from './IconButton';
import DropdownPanel from './DropdownPanel';
import ExportModal from './ExportModal';
import ProBadge from './ProBadge';
import {
  FolderIcon,
  MusicNoteIcon,
  TextIcon,
  StickerIcon,
  SparkleIcon,
  ArrowsMergeIcon,
  CaptionIcon,
  FilterIcon,
  SlidersIcon,
  TemplateIcon,
  RobotIcon,
  ShareIcon,
  ExportIcon,
  ZoomInIcon,
  ZoomOutIcon,
  MenuIcon,
  ChevronDownIcon
} from '../icons';

const TOOLBAR_CATEGORIES = [
  { id: 'medien', name: 'Medien', icon: FolderIcon, shortcut: 'M' },
  { id: 'audio', name: 'Audio', icon: MusicNoteIcon, shortcut: 'A' },
  { id: 'text', name: 'Text', icon: TextIcon, shortcut: 'T' },
  { id: 'sticker', name: 'Sticker', icon: StickerIcon, shortcut: '' },
  { id: 'effekte', name: 'Effekte', icon: SparkleIcon, shortcut: '' },
  { id: 'uebergaenge', name: 'Übergänge', icon: ArrowsMergeIcon, shortcut: '' },
  { id: 'untertitel', name: 'Untertitel', icon: CaptionIcon, shortcut: '' },
  { id: 'filter', name: 'Filter', icon: FilterIcon, shortcut: '' },
  { id: 'anpassung', name: 'Anpassung', icon: SlidersIcon, shortcut: '' },
  { id: 'vorlagen', name: 'Vorlagen', icon: TemplateIcon, shortcut: '' }
];

export default function VideoBar({
  projectName = '0117',
  onRename,
  onOpenPanel,
  onImport,
  onExport,
  onShare,
  onZoomIn,
  onZoomOut,
  onBackToDashboard,
  models = [
    { id: 'seedance-1', label: 'Seedance 1.0 Fast', description: 'Schnelle Generierung' },
    { id: 'seedance-2', label: 'Seedance 2.0', description: 'Höhere Qualität' }
  ]
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(projectName);
  const [activePanel, setActivePanel] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showKIDropdown, setShowKIDropdown] = useState(false);
  const [selectedModel, setSelectedModel] = useState(models[0]?.id || '');
  const [kiPrompt, setKiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateComplete, setGenerateComplete] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const inputRef = useRef(null);
  const kiButtonRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const fileInputRef = useRef(null);

  // Responsive Detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 960);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Project Name Editing
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleNameClick = () => {
    setIsEditing(true);
    setEditValue(projectName);
  };

  const handleNameSave = () => {
    setIsEditing(false);
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== projectName) {
      if (trimmed.length <= 30) {
        onRename?.(trimmed);
      } else {
        // Validation error - zu lang
        setEditValue(projectName);
      }
    } else {
      setEditValue(projectName);
    }
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setEditValue(projectName);
      setIsEditing(false);
    }
  };

  // Category Click
  const handleCategoryClick = (categoryId) => {
    setActivePanel(categoryId);
    onOpenPanel?.(categoryId);
  };

  // KI Generate
  const handleKIGenerate = async () => {
    if (!kiPrompt.trim()) return;

    setIsGenerating(true);
    setGenerateComplete(false);

    // Simulate generation (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsGenerating(false);
    setGenerateComplete(true);

    // Reset after 1.5s
    setTimeout(() => {
      setGenerateComplete(false);
      setKiPrompt('');
      setShowKIDropdown(false);
    }, 1500);
  };

  // Drag & Drop Support
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onImport?.(files);
      // TODO: Show toast "X Dateien importiert"
    }
  };

  // File Import via Button
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onImport?.(files);
    }
  };

  return (
    <>
      <div
        className={`
          h-14 
          bg-[var(--panel)] 
          border-b border-white/[0.03]
          px-4
          grid grid-cols-[1fr_auto_1fr] items-center gap-4
          ${isDragging ? 'border-2 border-dashed border-[var(--accent)]' : ''}
          transition-all duration-150
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* LEFT: Icon Categories */}
        <div className="flex items-center gap-3 overflow-x-auto">
          {/* Back to Dashboard Button */}
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-2 px-3 h-9 rounded-lg hover:bg-[var(--hover)] transition text-[var(--muted)] hover:text-[var(--text)]"
              aria-label="Zurück zum Dashboard"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-13 font-medium">Dashboard</span>
            </button>
          )}

          {isMobile ? (
            // Mobile: Hamburger Menu
            <IconButton
              icon={<MenuIcon />}
              label="Menü"
              tooltip="Menü"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              active={showMobileMenu}
            />
          ) : (
            // Desktop: All Icons
            <>
              {TOOLBAR_CATEGORIES.map(category => (
                <IconButton
                  key={category.id}
                  icon={<category.icon />}
                  label={category.name}
                  tooltip={category.name}
                  shortcut={category.shortcut}
                  onClick={() => handleCategoryClick(category.id)}
                  active={activePanel === category.id}
                />
              ))}

              {/* KI-Avatar mit Dropdown */}
              <div className="relative">
                <IconButton
                  icon={<RobotIcon />}
                  label="KI-Avatar"
                  tooltip="KI-Avatar"
                  onClick={() => setShowKIDropdown(!showKIDropdown)}
                  active={showKIDropdown}
                />
                <span ref={kiButtonRef} className="absolute" />

                {showKIDropdown && (
                  <DropdownPanel
                    anchorRef={kiButtonRef}
                    open={showKIDropdown}
                    onClose={() => setShowKIDropdown(false)}
                    position="below"
                    className="w-80"
                  >
                    <div className="p-4 space-y-3">
                      <h3 className="text-13 font-semibold text-white">
                        KI-Medien generieren
                      </h3>

                      {/* Model Selection */}
                      <div>
                        <label className="block text-12 text-muted mb-1.5">
                          Model
                        </label>
                        <div className="relative">
                          <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            disabled={isGenerating}
                            className="w-full px-3 py-2 bg-surface border border-white/[0.06] rounded-lg text-white text-13 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] appearance-none disabled:opacity-50"
                          >
                            {models.map(model => (
                              <option key={model.id} value={model.id}>
                                {model.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDownIcon className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                        </div>
                      </div>

                      {/* Prompt Input */}
                      <div>
                        <label className="block text-12 text-muted mb-1.5">
                          Beschreibung
                        </label>
                        <textarea
                          value={kiPrompt}
                          onChange={(e) => setKiPrompt(e.target.value)}
                          disabled={isGenerating}
                          placeholder="Beschreibe was du generieren möchtest..."
                          className="w-full px-3 py-2 bg-surface border border-white/[0.06] rounded-lg text-white text-13 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none disabled:opacity-50"
                          rows={3}
                        />
                      </div>

                      {/* Generate Button */}
                      <div className="relative">
                        <button
                          onClick={handleKIGenerate}
                          disabled={isGenerating || !kiPrompt.trim()}
                          className="w-full px-4 py-2.5 bg-[var(--accent-2)] hover:bg-[var(--accent-2)]/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
                        >
                          {generateComplete ? (
                            <span className="flex items-center justify-center gap-2">
                              ✓ Fertig
                            </span>
                          ) : isGenerating ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Generiere...
                            </span>
                          ) : (
                            'Generieren'
                          )}
                        </button>
                        <ProBadge className="absolute -top-1 -right-1" />
                      </div>

                      {/* Progress Bar (during generation) */}
                      {isGenerating && (
                        <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--accent-2)] animate-progressBar" />
                        </div>
                      )}
                    </div>
                  </DropdownPanel>
                )}
              </div>
            </>
          )}
        </div>

        {/* CENTER: Project Name */}
        <div className={`flex items-center justify-center gap-2 ${isMobile ? 'justify-start' : ''}`}>
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={handleNameKeyDown}
              maxLength={30}
              className="px-3 py-1 bg-surface border border-[var(--accent)] rounded-md text-[var(--text)] text-13 text-center focus:outline-none min-w-[100px] max-w-[200px]"
              aria-label="Projektname bearbeiten"
            />
          ) : (
            <button
              onClick={handleNameClick}
              className="px-3 py-1 rounded-md hover:bg-[var(--hover)] transition-colors text-[var(--text)] text-13 font-semibold"
              aria-label="Projektname bearbeiten"
            >
              {projectName}
            </button>
          )}

          {/* Optional: Mini Zoom Controls */}
          {!isMobile && (
            <div className="flex items-center gap-1 ml-2">
              <IconButton
                icon={<ZoomOutIcon className="w-4 h-4" />}
                label="Zoom Out"
                tooltip="Zoom Out"
                shortcut="Ctrl+-"
                onClick={onZoomOut}
                size="sm"
              />
              <IconButton
                icon={<ZoomInIcon className="w-4 h-4" />}
                label="Zoom In"
                tooltip="Zoom In"
                shortcut="Ctrl++"
                onClick={onZoomIn}
                size="sm"
              />
            </div>
          )}
        </div>

        {/* RIGHT: Action Buttons */}
        <div className="flex items-center justify-end gap-2">
          {/* Share Button */}
          <button
            onClick={onShare}
            className="px-3 h-8 bg-surface hover:bg-surface/80 text-white text-13 font-medium rounded-lg transition-colors flex items-center gap-2"
            aria-label="Teilen"
          >
            <ShareIcon className="w-4 h-4" />
            {!isMobile && <span>Teilen</span>}
          </button>

          {/* Export Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="px-3 h-8 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white text-13 font-medium rounded-lg transition-colors flex items-center gap-2"
            aria-label="Exportieren"
          >
            <ExportIcon className="w-4 h-4" />
            {!isMobile && <span>Exportieren</span>}
          </button>
        </div>
      </div>

      {/* Hidden File Input for Import */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-hidden="true"
      />

      {/* Mobile Menu Dropdown */}
      {isMobile && showMobileMenu && (
        <DropdownPanel
          anchorRef={mobileMenuRef}
          open={showMobileMenu}
          onClose={() => setShowMobileMenu(false)}
          items={TOOLBAR_CATEGORIES.map(cat => ({
            label: cat.name,
            onClick: () => handleCategoryClick(cat.id),
            shortcut: cat.shortcut
          }))}
          position="below"
        />
      )}

      {/* Export Modal */}
      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={onExport}
        projectName={projectName}
      />
    </>
  );
}
