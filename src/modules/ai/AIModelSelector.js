/**
 * AI Model Selector - Ermöglicht dem Benutzer die Auswahl verschiedener KI-Modelle
 * Unterstützt OpenAI, Anthropic Claude und Google Gemini
 */

// Verfügbare AI-Modelle nach Provider
export const AI_PROVIDERS = {
  openai: {
    name: 'OpenAI',
    icon: 'openai',
    color: '#10a37f',
    models: [
      { id: 'gpt-5.2', name: 'GPT-5.2', description: 'Neuestes Modell', recommended: true },
      { id: 'gpt-5.1', name: 'GPT-5.1', description: 'Sehr leistungsfähig' },
      { id: 'gpt-5', name: 'GPT-5', description: 'Standard' },
      { id: 'gpt-5-mini', name: 'GPT-5 Mini', description: 'Schnell & günstig' },
      { id: 'gpt-4o', name: 'GPT-4o', description: 'Multimodal' },
      { id: 'gpt-4.1', name: 'GPT-4.1', description: 'Klassisch' },
      { id: 'o3', name: 'O3', description: 'Reasoning' },
      { id: 'o4-mini', name: 'O4 Mini', description: 'Schnelles Reasoning' }
    ]
  },
  anthropic: {
    name: 'Anthropic',
    icon: 'anthropic',
    color: '#d97706',
    models: [
      { id: 'claude-4-sonnet-20250514', name: 'Claude 4 Sonnet', description: 'Neuestes Modell', recommended: true },
      { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', description: 'Sehr leistungsfähig' },
      { id: 'claude-opus-4-5-20251101', name: 'Claude Opus 4.5', description: 'Höchste Qualität' },
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', description: 'Schnell & günstig' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: 'Klassisch schnell' }
    ]
  },
  gemini: {
    name: 'Google Gemini',
    icon: 'google',
    color: '#4285f4',
    models: [
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Höchste Qualität', recommended: true },
      { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', description: 'Preview - Sehr schnell' },
      { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', description: 'Preview - Leistungsfähig' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Schnell' },
      { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', description: 'Am schnellsten' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Stabil' }
    ]
  }
};

// Standard-Modell
export const DEFAULT_MODEL = {
  provider: 'openai',
  model: 'gpt-5.2'
};

// AI-Funktions-Typen und ihre empfohlenen Modelle
export const AI_FUNCTION_MODELS = {
  chat: {
    name: 'Chat & Assistent',
    description: 'Allgemeine Konversation und Hilfe',
    recommended: { provider: 'openai', model: 'gpt-5.2' },
    alternatives: [
      { provider: 'anthropic', model: 'claude-4-sonnet-20250514' },
      { provider: 'gemini', model: 'gemini-2.5-pro' }
    ]
  },
  captions: {
    name: 'Auto-Untertitel',
    description: 'Transkription und Untertitel-Generierung',
    recommended: { provider: 'openai', model: 'gpt-5.2' },
    alternatives: [
      { provider: 'gemini', model: 'gemini-2.5-flash' }
    ]
  },
  scriptWriting: {
    name: 'Drehbuch-Schreiben',
    description: 'Video-Skripte und Storyboards',
    recommended: { provider: 'anthropic', model: 'claude-4-sonnet-20250514' },
    alternatives: [
      { provider: 'openai', model: 'gpt-5.2' },
      { provider: 'gemini', model: 'gemini-2.5-pro' }
    ]
  },
  titleGeneration: {
    name: 'Titel-Generierung',
    description: 'Video-Titel und Beschreibungen',
    recommended: { provider: 'openai', model: 'gpt-5-mini' },
    alternatives: [
      { provider: 'anthropic', model: 'claude-haiku-4-5-20251001' },
      { provider: 'gemini', model: 'gemini-2.5-flash-lite' }
    ]
  },
  translation: {
    name: 'Übersetzung',
    description: 'Untertitel und Text übersetzen',
    recommended: { provider: 'openai', model: 'gpt-5.2' },
    alternatives: [
      { provider: 'anthropic', model: 'claude-4-sonnet-20250514' },
      { provider: 'gemini', model: 'gemini-2.5-pro' }
    ]
  }
};

// Speicher-Schlüssel für Benutzer-Einstellungen
const SETTINGS_KEY = 'videoeditor_ai_settings';

// Lade gespeicherte Einstellungen
export function loadAISettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Fehler beim Laden der AI-Einstellungen:', error);
  }
  
  return {
    defaultProvider: DEFAULT_MODEL.provider,
    defaultModel: DEFAULT_MODEL.model,
    functionModels: {}, // Überschreibungen pro Funktion
    apiKey: null // Benutzerdefinierter API-Key (optional)
  };
}

// Speichere Einstellungen
export function saveAISettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Fehler beim Speichern der AI-Einstellungen:', error);
    return false;
  }
}

// Hole das Modell für eine bestimmte Funktion
export function getModelForFunction(functionType) {
  const settings = loadAISettings();
  
  // Prüfe auf benutzerdefinierte Überschreibung
  if (settings.functionModels?.[functionType]) {
    return settings.functionModels[functionType];
  }
  
  // Fallback auf empfohlenes Modell für die Funktion
  if (AI_FUNCTION_MODELS[functionType]) {
    return AI_FUNCTION_MODELS[functionType].recommended;
  }
  
  // Standard-Modell
  return { provider: settings.defaultProvider, model: settings.defaultModel };
}

// Validiere ein Modell
export function validateModel(provider, modelId) {
  const providerData = AI_PROVIDERS[provider];
  if (!providerData) return false;
  
  return providerData.models.some(m => m.id === modelId);
}

// Hole Modell-Info
export function getModelInfo(provider, modelId) {
  const providerData = AI_PROVIDERS[provider];
  if (!providerData) return null;
  
  return providerData.models.find(m => m.id === modelId) || null;
}

export default {
  AI_PROVIDERS,
  DEFAULT_MODEL,
  AI_FUNCTION_MODELS,
  loadAISettings,
  saveAISettings,
  getModelForFunction,
  validateModel,
  getModelInfo
};
