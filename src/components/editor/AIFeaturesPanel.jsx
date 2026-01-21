/**
 * AI Features Panel - Zentrale Komponente für alle KI-Funktionen
 * 
 * Features:
 * - Text-zu-Video
 * - Drehbuch-Generator
 * - Titel-Generator
 * - Übersetzung
 * - Stil-Transfer
 */

import React, { useState, useCallback } from 'react';
import Icon from './Icon';
import { ModelSelector } from './AIModelSelectorUI';
import { quickPrompt, AIChat as AIChatClient } from '../../modules/ai/AIClient';
import { loadAISettings, AI_FUNCTION_MODELS, AI_PROVIDERS } from '../../modules/ai/AIModelSelector';

// AI Feature Tabs
const AI_FEATURES = [
  { id: 'script', name: 'Drehbuch', icon: 'text', description: 'Erstelle Video-Skripte' },
  { id: 'titles', name: 'Titel', icon: 'type', description: 'Generiere Titel & Beschreibungen' },
  { id: 'translate', name: 'Übersetzen', icon: 'globe', description: 'Übersetze Untertitel' },
  { id: 'ideas', name: 'Ideen', icon: 'effects', description: 'Video-Ideen generieren' },
];

export default function AIFeaturesPanel({ onClose, onApply }) {
  const settings = loadAISettings();
  
  const [activeFeature, setActiveFeature] = useState('script');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState(null);
  
  // Feature-spezifische States
  const [scriptTopic, setScriptTopic] = useState('');
  const [scriptLength, setScriptLength] = useState('short');
  const [scriptStyle, setScriptStyle] = useState('informativ');
  
  const [titleType, setTitleType] = useState('youtube');
  const [titleTopic, setTitleTopic] = useState('');
  
  const [translateText, setTranslateText] = useState('');
  const [translateFrom, setTranslateFrom] = useState('de');
  const [translateTo, setTranslateTo] = useState('en');
  
  const [ideaCategory, setIdeaCategory] = useState('tutorial');
  const [ideaNiche, setIdeaNiche] = useState('');
  
  // Model selection
  const getDefaultModel = (feature) => {
    const funcMap = {
      script: 'scriptWriting',
      titles: 'titleGeneration',
      translate: 'translation',
      ideas: 'chat'
    };
    const funcType = funcMap[feature] || 'chat';
    return settings.functionModels?.[funcType] || AI_FUNCTION_MODELS[funcType]?.recommended || {
      provider: settings.defaultProvider,
      model: settings.defaultModel
    };
  };
  
  const [selectedProvider, setSelectedProvider] = useState(() => getDefaultModel(activeFeature).provider);
  const [selectedModel, setSelectedModel] = useState(() => getDefaultModel(activeFeature).model);
  
  const handleFeatureChange = (feature) => {
    setActiveFeature(feature);
    const model = getDefaultModel(feature);
    setSelectedProvider(model.provider);
    setSelectedModel(model.model);
    setResult('');
    setError(null);
  };
  
  const handleModelChange = (provider, model) => {
    setSelectedProvider(provider);
    setSelectedModel(model);
  };
  
  // Generate content based on active feature
  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult('');
    
    try {
      let prompt = '';
      let systemMessage = 'Du bist ein professioneller Content-Creator und Experte für Video-Produktion.';
      
      switch (activeFeature) {
        case 'script':
          prompt = `Erstelle ein ${scriptLength === 'short' ? 'kurzes (30-60 Sekunden)' : scriptLength === 'medium' ? 'mittleres (2-3 Minuten)' : 'langes (5-10 Minuten)'} Video-Drehbuch zum Thema: "${scriptTopic}".

Stil: ${scriptStyle}

Strukturiere das Skript mit:
- Hook (Aufmerksamkeit erregen)
- Einleitung
- Hauptteil mit 2-3 Punkten
- Call-to-Action
- Outro

Schreibe in einem natürlichen, gesprochenen Stil.`;
          break;
          
        case 'titles':
          prompt = `Generiere 5 kreative ${titleType === 'youtube' ? 'YouTube' : titleType === 'tiktok' ? 'TikTok' : titleType === 'instagram' ? 'Instagram' : 'Social Media'} Titel und Beschreibungen für ein Video über: "${titleTopic}".

Für jeden Titel:
1. Titel (clickworthy, aber nicht clickbait)
2. Kurze Beschreibung (2-3 Sätze)
3. 3-5 relevante Hashtags

Formatiere übersichtlich.`;
          break;
          
        case 'translate':
          const langNames = {
            de: 'Deutsch', en: 'Englisch', es: 'Spanisch', fr: 'Französisch',
            it: 'Italienisch', pt: 'Portugiesisch', ja: 'Japanisch', zh: 'Chinesisch'
          };
          prompt = `Übersetze den folgenden Text von ${langNames[translateFrom]} nach ${langNames[translateTo]}:

"${translateText}"

Wichtig: Behalte den Ton und Stil bei. Bei Untertiteln halte die Zeilen kurz und lesbar.`;
          break;
          
        case 'ideas':
          prompt = `Generiere 5 kreative Video-Ideen für die Kategorie "${ideaCategory}" ${ideaNiche ? `in der Nische "${ideaNiche}"` : ''}.

Für jede Idee:
1. Titel-Vorschlag
2. Kurze Beschreibung (was wird gezeigt)
3. Zielgruppe
4. Geschätzte Länge
5. Benötigte Ressourcen/Equipment

Sei kreativ und aktuell!`;
          break;
      }
      
      const response = await quickPrompt(prompt, {
        provider: selectedProvider,
        model: selectedModel,
        systemMessage,
        temperature: 0.8
      });
      
      setResult(response);
      
    } catch (err) {
      console.error('AI Feature Error:', err);
      setError(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  }, [activeFeature, scriptTopic, scriptLength, scriptStyle, titleType, titleTopic, translateText, translateFrom, translateTo, ideaCategory, ideaNiche, selectedProvider, selectedModel]);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(result);
  };
  
  const handleApplyResult = () => {
    onApply?.({ feature: activeFeature, content: result });
    onClose?.();
  };
  
  const renderFeatureContent = () => {
    switch (activeFeature) {
      case 'script':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-2 block">Thema</label>
              <input
                type="text"
                value={scriptTopic}
                onChange={(e) => setScriptTopic(e.target.value)}
                placeholder="z.B. 5 Tipps für bessere Produktivität"
                className="w-full h-10 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-turquoise)]"
                data-testid="script-topic-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-2 block">Länge</label>
                <select
                  value={scriptLength}
                  onChange={(e) => setScriptLength(e.target.value)}
                  className="w-full h-10 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-turquoise)]"
                >
                  <option value="short">Kurz (30-60s)</option>
                  <option value="medium">Mittel (2-3 Min)</option>
                  <option value="long">Lang (5-10 Min)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-2 block">Stil</label>
                <select
                  value={scriptStyle}
                  onChange={(e) => setScriptStyle(e.target.value)}
                  className="w-full h-10 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-turquoise)]"
                >
                  <option value="informativ">Informativ</option>
                  <option value="unterhaltsam">Unterhaltsam</option>
                  <option value="inspirierend">Inspirierend</option>
                  <option value="lehrreich">Lehrreich</option>
                  <option value="storytelling">Storytelling</option>
                </select>
              </div>
            </div>
          </div>
        );
        
      case 'titles':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-2 block">Plattform</label>
              <div className="grid grid-cols-4 gap-2">
                {['youtube', 'tiktok', 'instagram', 'other'].map(platform => (
                  <button
                    key={platform}
                    onClick={() => setTitleType(platform)}
                    className={`h-10 rounded-lg border text-xs capitalize transition-all ${
                      titleType === platform
                        ? 'border-[var(--accent-turquoise)] bg-[var(--accent-turquoise)]/10 text-[var(--accent-turquoise)]'
                        : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-normal)]'
                    }`}
                  >
                    {platform === 'other' ? 'Andere' : platform}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-2 block">Video-Thema</label>
              <input
                type="text"
                value={titleTopic}
                onChange={(e) => setTitleTopic(e.target.value)}
                placeholder="Worum geht es in deinem Video?"
                className="w-full h-10 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-turquoise)]"
                data-testid="title-topic-input"
              />
            </div>
          </div>
        );
        
      case 'translate':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-2 block">Von</label>
                <select
                  value={translateFrom}
                  onChange={(e) => setTranslateFrom(e.target.value)}
                  className="w-full h-10 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-turquoise)]"
                >
                  <option value="de">Deutsch</option>
                  <option value="en">Englisch</option>
                  <option value="es">Spanisch</option>
                  <option value="fr">Französisch</option>
                  <option value="it">Italienisch</option>
                  <option value="pt">Portugiesisch</option>
                  <option value="ja">Japanisch</option>
                  <option value="zh">Chinesisch</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-2 block">Nach</label>
                <select
                  value={translateTo}
                  onChange={(e) => setTranslateTo(e.target.value)}
                  className="w-full h-10 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-turquoise)]"
                >
                  <option value="en">Englisch</option>
                  <option value="de">Deutsch</option>
                  <option value="es">Spanisch</option>
                  <option value="fr">Französisch</option>
                  <option value="it">Italienisch</option>
                  <option value="pt">Portugiesisch</option>
                  <option value="ja">Japanisch</option>
                  <option value="zh">Chinesisch</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-2 block">Text</label>
              <textarea
                value={translateText}
                onChange={(e) => setTranslateText(e.target.value)}
                placeholder="Text zum Übersetzen eingeben..."
                rows={4}
                className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-turquoise)] resize-none"
                data-testid="translate-text-input"
              />
            </div>
          </div>
        );
        
      case 'ideas':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-2 block">Kategorie</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'tutorial', name: 'Tutorial' },
                  { id: 'vlog', name: 'Vlog' },
                  { id: 'review', name: 'Review' },
                  { id: 'entertainment', name: 'Entertainment' },
                  { id: 'education', name: 'Bildung' },
                  { id: 'business', name: 'Business' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setIdeaCategory(cat.id)}
                    className={`h-10 rounded-lg border text-xs transition-all ${
                      ideaCategory === cat.id
                        ? 'border-[var(--accent-turquoise)] bg-[var(--accent-turquoise)]/10 text-[var(--accent-turquoise)]'
                        : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-normal)]'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-[var(--text-secondary)] mb-2 block">Nische (optional)</label>
              <input
                type="text"
                value={ideaNiche}
                onChange={(e) => setIdeaNiche(e.target.value)}
                placeholder="z.B. Fitness, Gaming, Kochen..."
                className="w-full h-10 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-turquoise)]"
                data-testid="idea-niche-input"
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  const canGenerate = () => {
    switch (activeFeature) {
      case 'script': return scriptTopic.trim().length > 0;
      case 'titles': return titleTopic.trim().length > 0;
      case 'translate': return translateText.trim().length > 0;
      case 'ideas': return true;
      default: return false;
    }
  };
  
  return (
    <div className="bg-[var(--bg-panel)] rounded-xl border border-[var(--border-subtle)] shadow-2xl w-[600px] max-h-[700px] overflow-hidden" data-testid="ai-features-panel">
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--accent-turquoise)] to-[var(--accent-purple)] flex items-center justify-center">
            <Icon name="ai" size={16} className="text-white" />
          </div>
          <span className="text-sm font-medium text-[var(--text-primary)]">KI-Funktionen</span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
          data-testid="close-ai-features"
        >
          <Icon name="close" size={16} />
        </button>
      </div>
      
      {/* Feature Tabs */}
      <div className="flex border-b border-[var(--border-subtle)]">
        {AI_FEATURES.map(feature => (
          <button
            key={feature.id}
            onClick={() => handleFeatureChange(feature.id)}
            className={`flex-1 h-11 flex items-center justify-center gap-2 text-xs transition-all border-b-2 ${
              activeFeature === feature.id
                ? 'border-[var(--accent-turquoise)] text-[var(--accent-turquoise)] bg-[var(--accent-turquoise)]/5'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            data-testid={`tab-${feature.id}`}
          >
            <Icon name={feature.icon} size={14} />
            {feature.name}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-4 max-h-[550px] overflow-y-auto">
        {/* Model Selector */}
        <div className="flex items-center justify-between p-3 bg-[var(--bg-surface)] rounded-lg">
          <span className="text-xs text-[var(--text-secondary)]">KI-Modell</span>
          <ModelSelector
            selectedProvider={selectedProvider}
            selectedModel={selectedModel}
            onChange={handleModelChange}
            compact={true}
          />
        </div>
        
        {/* Feature-specific inputs */}
        {renderFeatureContent()}
        
        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <Icon name="alertCircle" size={14} />
              {error}
            </div>
          </div>
        )}
        
        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!canGenerate() || loading}
          className="w-full h-12 bg-gradient-to-r from-[var(--accent-turquoise)] to-[var(--accent-purple)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="generate-btn"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generiere...
            </>
          ) : (
            <>
              <Icon name="effects" size={16} />
              Generieren
            </>
          )}
        </button>
        
        {/* Result */}
        {result && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-[var(--text-secondary)]">Ergebnis</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="text-xs text-[var(--accent-turquoise)] hover:underline flex items-center gap-1"
                  data-testid="copy-result"
                >
                  <Icon name="copy" size={12} />
                  Kopieren
                </button>
              </div>
            </div>
            <div className="p-4 bg-[var(--bg-surface)] rounded-lg max-h-[250px] overflow-y-auto">
              <pre className="text-sm text-[var(--text-primary)] whitespace-pre-wrap font-sans">
                {result}
              </pre>
            </div>
            <button
              onClick={handleApplyResult}
              className="w-full h-10 bg-[var(--accent-turquoise)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
              data-testid="apply-result"
            >
              <Icon name="check" size={14} />
              Übernehmen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
