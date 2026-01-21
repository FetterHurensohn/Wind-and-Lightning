/**
 * AIModelSelectorUI.jsx - UI-Komponente für die KI-Modell-Auswahl
 */

import React, { useState, useEffect } from 'react';
import { 
  AI_PROVIDERS, 
  loadAISettings, 
  saveAISettings,
  getModelInfo 
} from '../../modules/ai/AIModelSelector';
import Icon from './Icon';

/**
 * Kompakte Modell-Auswahl für die Chat-Oberfläche
 */
export function ModelSelector({ 
  selectedProvider, 
  selectedModel, 
  onChange,
  compact = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentProvider = AI_PROVIDERS[selectedProvider];
  const currentModel = currentProvider?.models.find(m => m.id === selectedModel);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 rounded-lg transition-all
          ${compact 
            ? 'px-2 py-1 text-xs bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)]' 
            : 'px-3 py-2 text-sm bg-[var(--bg-panel)] border border-[var(--border-subtle)] hover:border-[var(--accent-turquoise)]'
          }
        `}
        data-testid="model-selector-button"
      >
        <span 
          className="w-2 h-2 rounded-full" 
          style={{ backgroundColor: currentProvider?.color || '#666' }}
        />
        <span className="text-[var(--text-primary)]">
          {currentModel?.name || selectedModel}
        </span>
        <Icon name="chevronDown" size={12} strokeWidth={1.5} />
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div 
            className="absolute top-full left-0 mt-1 z-50 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg shadow-xl min-w-[280px] max-h-[400px] overflow-y-auto animate-slideDown"
            data-testid="model-selector-dropdown"
          >
            {Object.entries(AI_PROVIDERS).map(([providerId, provider]) => (
              <div key={providerId} className="p-2">
                {/* Provider Header */}
                <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: provider.color }}
                  />
                  {provider.name}
                </div>
                
                {/* Models */}
                {provider.models.map(model => (
                  <button
                    key={model.id}
                    onClick={() => {
                      onChange(providerId, model.id);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition-colors
                      ${selectedProvider === providerId && selectedModel === model.id
                        ? 'bg-[var(--accent-turquoise)]/10 text-[var(--accent-turquoise)]'
                        : 'hover:bg-[var(--bg-hover)] text-[var(--text-primary)]'
                      }
                    `}
                    data-testid={`model-option-${model.id}`}
                  >
                    <div>
                      <div className="text-sm font-medium">{model.name}</div>
                      <div className="text-xs text-[var(--text-tertiary)]">{model.description}</div>
                    </div>
                    {model.recommended && (
                      <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-[var(--accent-turquoise)]/20 text-[var(--accent-turquoise)] rounded">
                        Empfohlen
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Vollständige Einstellungs-Seite für AI-Modelle
 */
export function AISettingsPanel({ onClose }) {
  const [settings, setSettings] = useState(loadAISettings());
  const [saved, setSaved] = useState(false);
  
  const handleSave = () => {
    saveAISettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };
  
  return (
    <div className="bg-[var(--bg-panel)] rounded-xl border border-[var(--border-subtle)] shadow-2xl max-w-lg w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          KI-Modell Einstellungen
        </h2>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
          data-testid="close-ai-settings"
        >
          <Icon name="x" size={18} strokeWidth={1.5} />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Standard-Modell */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Standard-Modell für Chat
          </label>
          <ModelSelector
            selectedProvider={settings.defaultProvider}
            selectedModel={settings.defaultModel}
            onChange={(provider, model) => {
              updateSetting('defaultProvider', provider);
              updateSetting('defaultModel', model);
            }}
          />
          <p className="mt-1 text-xs text-[var(--text-tertiary)]">
            Wird für den KI-Assistenten verwendet
          </p>
        </div>
        
        {/* API Key (optional) */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Eigener API-Schlüssel (optional)
          </label>
          <input
            type="password"
            value={settings.apiKey || ''}
            onChange={(e) => updateSetting('apiKey', e.target.value || null)}
            placeholder="Emergent LLM Key wird verwendet"
            className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-turquoise)]"
            data-testid="api-key-input"
          />
          <p className="mt-1 text-xs text-[var(--text-tertiary)]">
            Leer lassen, um den Emergent Universal Key zu verwenden
          </p>
        </div>
        
        {/* Provider Info */}
        <div className="bg-[var(--bg-surface)] rounded-lg p-4">
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">
            Verfügbare Provider
          </h3>
          <div className="space-y-2">
            {Object.entries(AI_PROVIDERS).map(([id, provider]) => (
              <div key={id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: provider.color }}
                  />
                  <span className="text-sm text-[var(--text-primary)]">{provider.name}</span>
                </div>
                <span className="text-xs text-[var(--text-tertiary)]">
                  {provider.models.length} Modelle
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border-subtle)]">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          Abbrechen
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium bg-[var(--accent-turquoise)] text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
          data-testid="save-ai-settings"
        >
          {saved ? (
            <>
              <Icon name="check" size={16} strokeWidth={2} />
              Gespeichert
            </>
          ) : (
            'Speichern'
          )}
        </button>
      </div>
    </div>
  );
}

export default ModelSelector;
