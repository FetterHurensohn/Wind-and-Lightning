/**
 * Settings Panel Component
 * Vollständige Einstellungen für die App
 */

import React, { useState, useCallback } from 'react';
import Icon from './editor/Icon';
import { DEFAULT_SETTINGS, DEFAULT_SHORTCUTS, THEMES, LANGUAGES, settingsManager } from '../modules/settings';

const SECTIONS = [
  { id: 'general', name: 'Allgemein', icon: 'settings' },
  { id: 'ai', name: 'KI-Modelle', icon: 'ai' },
  { id: 'appearance', name: 'Darstellung', icon: 'palette' },
  { id: 'timeline', name: 'Timeline', icon: 'timeline' },
  { id: 'preview', name: 'Vorschau', icon: 'video' },
  { id: 'playback', name: 'Wiedergabe', icon: 'play' },
  { id: 'export', name: 'Export', icon: 'export' },
  { id: 'audio', name: 'Audio', icon: 'audio' },
  { id: 'performance', name: 'Leistung', icon: 'cpu' },
  { id: 'shortcuts', name: 'Tastaturkürzel', icon: 'keyboard' },
  { id: 'privacy', name: 'Datenschutz', icon: 'lock' },
  { id: 'accessibility', name: 'Barrierefreiheit', icon: 'accessibility' },
  { id: 'about', name: 'Über', icon: 'info' }
];

// Setting Row Components
const ToggleSetting = ({ label, description, value, onChange }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <div className="text-sm text-[var(--text-primary)]">{label}</div>
      {description && <div className="text-xs text-[var(--text-tertiary)]">{description}</div>}
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition-colors ${
        value ? 'bg-[var(--accent-turquoise)]' : 'bg-[var(--bg-surface)]'
      }`}
    >
      <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
        value ? 'translate-x-5' : 'translate-x-0.5'
      }`} />
    </button>
  </div>
);

const SelectSetting = ({ label, description, value, options, onChange }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <div className="text-sm text-[var(--text-primary)]">{label}</div>
      {description && <div className="text-xs text-[var(--text-tertiary)]">{description}</div>}
    </div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-turquoise)]"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const SliderSetting = ({ label, description, value, min, max, step = 1, unit = '', onChange }) => (
  <div className="py-3">
    <div className="flex items-center justify-between mb-2">
      <div>
        <div className="text-sm text-[var(--text-primary)]">{label}</div>
        {description && <div className="text-xs text-[var(--text-tertiary)]">{description}</div>}
      </div>
      <span className="text-sm text-[var(--text-primary)]">{value}{unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-[var(--bg-surface)] rounded appearance-none cursor-pointer"
    />
  </div>
);

export default function SettingsPanel({ onClose }) {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState(() => settingsManager.settings);
  const [shortcuts, setShortcuts] = useState(() => settingsManager.shortcuts);
  const [editingShortcut, setEditingShortcut] = useState(null);
  
  const updateSetting = useCallback((path, value) => {
    settingsManager.set(path, value);
    setSettings({ ...settingsManager.settings });
  }, []);
  
  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-1 divide-y divide-[var(--border-subtle)]">
            <SelectSetting
              label="Sprache"
              value={settings.general?.language}
              options={LANGUAGES.map(l => ({ value: l.code, label: l.native }))}
              onChange={(v) => updateSetting('general.language', v)}
            />
            <ToggleSetting
              label="Automatisch speichern"
              description="Projekt automatisch speichern"
              value={settings.general?.autoSave}
              onChange={(v) => updateSetting('general.autoSave', v)}
            />
            <SliderSetting
              label="Auto-Save Intervall"
              value={settings.general?.autoSaveInterval || 60}
              min={30}
              max={300}
              step={30}
              unit="s"
              onChange={(v) => updateSetting('general.autoSaveInterval', v)}
            />
            <ToggleSetting
              label="Tipps anzeigen"
              value={settings.general?.showTips}
              onChange={(v) => updateSetting('general.showTips', v)}
            />
            <ToggleSetting
              label="Updates prüfen"
              value={settings.general?.checkUpdates}
              onChange={(v) => updateSetting('general.checkUpdates', v)}
            />
          </div>
        );
        
      case 'appearance':
        return (
          <div className="space-y-4">
            {/* Theme Selection */}
            <div>
              <div className="text-sm text-[var(--text-primary)] mb-3">Design</div>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(THEMES).map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => updateSetting('appearance.theme', theme.id)}
                    className={`p-3 rounded-lg border transition-all ${
                      settings.appearance?.theme === theme.id
                        ? 'border-[var(--accent-turquoise)] bg-[var(--accent-turquoise)]/10'
                        : 'border-[var(--border-subtle)] hover:border-[var(--border-normal)]'
                    }`}
                  >
                    <div 
                      className="w-full h-8 rounded mb-2"
                      style={{ backgroundColor: theme.colors.bgMain }}
                    />
                    <div className="text-xs text-[var(--text-primary)]">{theme.name}</div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="divide-y divide-[var(--border-subtle)]">
              <SelectSetting
                label="Schriftgröße"
                value={settings.appearance?.fontSize || 'medium'}
                options={[
                  { value: 'small', label: 'Klein' },
                  { value: 'medium', label: 'Mittel' },
                  { value: 'large', label: 'Groß' }
                ]}
                onChange={(v) => updateSetting('appearance.fontSize', v)}
              />
              <ToggleSetting
                label="Kompakter Modus"
                value={settings.appearance?.compactMode}
                onChange={(v) => updateSetting('appearance.compactMode', v)}
              />
              <ToggleSetting
                label="Animationen"
                value={settings.appearance?.animationsEnabled}
                onChange={(v) => updateSetting('appearance.animationsEnabled', v)}
              />
            </div>
          </div>
        );
        
      case 'timeline':
        return (
          <div className="space-y-1 divide-y divide-[var(--border-subtle)]">
            <ToggleSetting
              label="An Clips einrasten"
              value={settings.timeline?.snapToClips}
              onChange={(v) => updateSetting('timeline.snapToClips', v)}
            />
            <ToggleSetting
              label="An Marker einrasten"
              value={settings.timeline?.snapToMarkers}
              onChange={(v) => updateSetting('timeline.snapToMarkers', v)}
            />
            <ToggleSetting
              label="Wellenformen anzeigen"
              value={settings.timeline?.showWaveforms}
              onChange={(v) => updateSetting('timeline.showWaveforms', v)}
            />
            <ToggleSetting
              label="Thumbnails anzeigen"
              value={settings.timeline?.showThumbnails}
              onChange={(v) => updateSetting('timeline.showThumbnails', v)}
            />
            <ToggleSetting
              label="Ripple Edit"
              description="Automatisch nachfolgende Clips verschieben"
              value={settings.timeline?.rippleEdit}
              onChange={(v) => updateSetting('timeline.rippleEdit', v)}
            />
            <SliderSetting
              label="Track-Höhe"
              value={settings.timeline?.trackHeight || 80}
              min={40}
              max={150}
              unit="px"
              onChange={(v) => updateSetting('timeline.trackHeight', v)}
            />
          </div>
        );
        
      case 'performance':
        return (
          <div className="space-y-1 divide-y divide-[var(--border-subtle)]">
            <ToggleSetting
              label="GPU-Beschleunigung"
              description="Hardware-Beschleunigung verwenden"
              value={settings.performance?.gpuAcceleration}
              onChange={(v) => updateSetting('performance.gpuAcceleration', v)}
            />
            <SliderSetting
              label="Max. Speichernutzung"
              value={settings.performance?.maxMemoryUsage || 4096}
              min={1024}
              max={16384}
              step={1024}
              unit=" MB"
              onChange={(v) => updateSetting('performance.maxMemoryUsage', v)}
            />
            <SliderSetting
              label="Cache-Größe"
              value={settings.performance?.cacheSize || 2048}
              min={512}
              max={8192}
              step={512}
              unit=" MB"
              onChange={(v) => updateSetting('performance.cacheSize', v)}
            />
            <SelectSetting
              label="Proxy-Generierung"
              value={settings.performance?.proxyGeneration || 'auto'}
              options={[
                { value: 'auto', label: 'Automatisch' },
                { value: 'always', label: 'Immer' },
                { value: 'never', label: 'Nie' }
              ]}
              onChange={(v) => updateSetting('performance.proxyGeneration', v)}
            />
            <SliderSetting
              label="Max. Undo-Schritte"
              value={settings.performance?.maxUndoSteps || 100}
              min={10}
              max={500}
              step={10}
              onChange={(v) => updateSetting('performance.maxUndoSteps', v)}
            />
            <div className="py-4">
              <button
                className="px-4 h-9 bg-[var(--bg-surface)] rounded text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Cache leeren
              </button>
            </div>
          </div>
        );
        
      case 'shortcuts':
        return (
          <div className="space-y-2">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  settingsManager.resetShortcuts();
                  setShortcuts({ ...DEFAULT_SHORTCUTS });
                }}
                className="px-3 h-8 bg-[var(--bg-surface)] rounded text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Zurücksetzen
              </button>
            </div>
            
            {Object.entries(shortcuts).slice(0, 20).map(([action, shortcut]) => (
              <div 
                key={action}
                className="flex items-center justify-between py-2 px-3 bg-[var(--bg-surface)] rounded"
              >
                <span className="text-sm text-[var(--text-primary)]">
                  {action.split('.').pop().replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <div
                  onClick={() => setEditingShortcut(action)}
                  className="px-3 py-1 bg-[var(--bg-main)] rounded text-xs text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]"
                >
                  {shortcut.modifiers?.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join('+')}
                  {shortcut.modifiers?.length > 0 && '+'}
                  {shortcut.key}
                </div>
              </div>
            ))}
          </div>
        );
        
      case 'privacy':
        return (
          <div className="space-y-1 divide-y divide-[var(--border-subtle)]">
            <ToggleSetting
              label="Nutzungsdaten senden"
              description="Anonyme Nutzungsstatistiken"
              value={settings.privacy?.shareUsageData}
              onChange={(v) => updateSetting('privacy.shareUsageData', v)}
            />
            <ToggleSetting
              label="Absturzberichte"
              description="Automatisch Fehlerberichte senden"
              value={settings.privacy?.allowCrashReports}
              onChange={(v) => updateSetting('privacy.allowCrashReports', v)}
            />
            <ToggleSetting
              label="Letzte Dateien merken"
              value={settings.privacy?.rememberRecentFiles}
              onChange={(v) => updateSetting('privacy.rememberRecentFiles', v)}
            />
            <div className="py-4">
              <button
                className="px-4 h-9 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30 transition-colors"
              >
                Alle Daten löschen
              </button>
            </div>
          </div>
        );
        
      case 'about':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[var(--accent-turquoise)] to-[var(--accent-purple)] rounded-2xl flex items-center justify-center">
                <Icon name="video" size={32} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">CapCut Video Editor</h2>
              <p className="text-sm text-[var(--text-tertiary)]">Version 2.0.0</p>
            </div>
            
            <div className="space-y-2">
              <a href="#" className="block p-3 bg-[var(--bg-surface)] rounded hover:bg-[var(--bg-hover)] transition-colors">
                <div className="text-sm text-[var(--text-primary)]">Hilfe & Support</div>
                <div className="text-xs text-[var(--text-tertiary)]">Dokumentation und FAQ</div>
              </a>
              <a href="#" className="block p-3 bg-[var(--bg-surface)] rounded hover:bg-[var(--bg-hover)] transition-colors">
                <div className="text-sm text-[var(--text-primary)]">Feedback geben</div>
                <div className="text-xs text-[var(--text-tertiary)]">Hilf uns besser zu werden</div>
              </a>
              <a href="#" className="block p-3 bg-[var(--bg-surface)] rounded hover:bg-[var(--bg-hover)] transition-colors">
                <div className="text-sm text-[var(--text-primary)]">Lizenzen</div>
                <div className="text-xs text-[var(--text-tertiary)]">Open-Source Lizenzen</div>
              </a>
            </div>
            
            <div className="text-center text-xs text-[var(--text-tertiary)]">
              © 2025 CapCut Video Editor
            </div>
          </div>
        );
        
      default:
        return <div className="text-[var(--text-tertiary)]">Bereich in Entwicklung...</div>;
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-[var(--bg-panel)] rounded-xl w-[800px] h-[600px] overflow-hidden shadow-2xl border border-[var(--border-subtle)] animate-scaleIn flex">
        {/* Sidebar */}
        <div className="w-56 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] overflow-y-auto">
          <div className="p-4 border-b border-[var(--border-subtle)]">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Einstellungen</h2>
          </div>
          <nav className="p-2">
            {SECTIONS.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === section.id
                    ? 'bg-[var(--accent-turquoise)]/10 text-[var(--accent-turquoise)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <Icon name={section.icon} size={16} />
                {section.name}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="h-14 px-6 flex items-center justify-between border-b border-[var(--border-subtle)]">
            <h3 className="text-base font-medium text-[var(--text-primary)]">
              {SECTIONS.find(s => s.id === activeSection)?.name}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
          
          {/* Section Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}
