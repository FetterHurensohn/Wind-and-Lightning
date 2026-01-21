/**
 * AI Client - Vereinheitlichter Client für KI-Anfragen
 * Unterstützt OpenAI, Anthropic Claude und Google Gemini via Emergent API
 */

import { loadAISettings, getModelForFunction, AI_PROVIDERS } from './AIModelSelector';

// Emergent LLM API Konfiguration
const EMERGENT_API_URL = 'https://api.emergentai.io/v1';
const DEFAULT_EMERGENT_KEY = 'sk-emergent-67b5f95099879B4541';

// Session-Speicher für Chat-Verläufe
const chatSessions = new Map();

/**
 * Generiere eine eindeutige Session-ID
 */
export function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * AI Chat Client Klasse
 */
export class AIChat {
  constructor(options = {}) {
    this.sessionId = options.sessionId || generateSessionId();
    this.systemMessage = options.systemMessage || 'Du bist ein hilfreicher KI-Assistent für Video-Editing.';
    this.functionType = options.functionType || 'chat';
    
    // Lade Benutzer-Einstellungen
    const settings = loadAISettings();
    
    // Setze Provider und Modell
    const modelConfig = options.provider && options.model 
      ? { provider: options.provider, model: options.model }
      : getModelForFunction(this.functionType);
    
    this.provider = modelConfig.provider;
    this.model = modelConfig.model;
    this.apiKey = options.apiKey || settings.apiKey || DEFAULT_EMERGENT_KEY;
    
    // Initialisiere Nachrichten-Verlauf
    if (!chatSessions.has(this.sessionId)) {
      chatSessions.set(this.sessionId, []);
    }
    
    this.messages = chatSessions.get(this.sessionId);
  }
  
  /**
   * Wechsle das Modell
   */
  withModel(provider, model) {
    if (AI_PROVIDERS[provider]) {
      this.provider = provider;
      this.model = model;
    }
    return this;
  }
  
  /**
   * Sende eine Nachricht und erhalte eine Antwort
   */
  async sendMessage(userMessage, options = {}) {
    try {
      // Füge Benutzer-Nachricht zum Verlauf hinzu
      const userMsg = {
        role: 'user',
        content: typeof userMessage === 'string' ? userMessage : userMessage.text
      };
      this.messages.push(userMsg);
      
      // Baue die Anfrage
      const requestBody = {
        provider: this.provider,
        model: this.model,
        messages: [
          { role: 'system', content: this.systemMessage },
          ...this.messages
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
        stream: options.stream || false
      };
      
      // Sende Anfrage
      const response = await fetch(`${EMERGENT_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API-Fehler: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extrahiere Antwort
      const assistantMessage = data.choices?.[0]?.message?.content || data.content || '';
      
      // Füge Antwort zum Verlauf hinzu
      this.messages.push({
        role: 'assistant',
        content: assistantMessage
      });
      
      return assistantMessage;
      
    } catch (error) {
      console.error('AI Chat Error:', error);
      
      // Entferne die letzte Benutzer-Nachricht bei Fehler
      this.messages.pop();
      
      throw error;
    }
  }
  
  /**
   * Streaming-Nachricht senden
   */
  async sendMessageStream(userMessage, onChunk, onComplete) {
    try {
      // Füge Benutzer-Nachricht zum Verlauf hinzu
      const userMsg = {
        role: 'user',
        content: typeof userMessage === 'string' ? userMessage : userMessage.text
      };
      this.messages.push(userMsg);
      
      // Baue die Anfrage
      const requestBody = {
        provider: this.provider,
        model: this.model,
        messages: [
          { role: 'system', content: this.systemMessage },
          ...this.messages
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: true
      };
      
      // Sende Anfrage
      const response = await fetch(`${EMERGENT_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`API-Fehler: ${response.status}`);
      }
      
      // Lese Stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'));
        
        for (const line of lines) {
          const data = line.replace('data:', '').trim();
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) {
              fullResponse += content;
              onChunk?.(content, fullResponse);
            }
          } catch {
            // Ignoriere Parse-Fehler bei SSE
          }
        }
      }
      
      // Füge vollständige Antwort zum Verlauf hinzu
      this.messages.push({
        role: 'assistant',
        content: fullResponse
      });
      
      onComplete?.(fullResponse);
      return fullResponse;
      
    } catch (error) {
      console.error('AI Stream Error:', error);
      this.messages.pop();
      throw error;
    }
  }
  
  /**
   * Lösche den Chat-Verlauf
   */
  clearHistory() {
    this.messages.length = 0;
  }
  
  /**
   * Hole den Chat-Verlauf
   */
  getHistory() {
    return [...this.messages];
  }
}

/**
 * Schnelle Einzelanfrage ohne Session
 */
export async function quickPrompt(prompt, options = {}) {
  const chat = new AIChat({
    systemMessage: options.systemMessage || 'Du bist ein hilfreicher Assistent.',
    provider: options.provider,
    model: options.model,
    functionType: options.functionType
  });
  
  return chat.sendMessage(prompt, options);
}

/**
 * Video-Editing spezifischer System-Prompt
 */
export const VIDEO_EDITOR_SYSTEM_PROMPT = `Du bist ein professioneller KI-Assistent für Video-Editing.
Du hilfst Benutzern bei:
- Video-Editing-Techniken und Best Practices
- Erstellung von Untertiteln und Captions
- Farbkorrektur und Grading-Tipps
- Audio-Bearbeitung und Mixing
- Export-Einstellungen für verschiedene Plattformen
- Kreative Vorschläge für Übergänge und Effekte
- Optimierung für Social Media (TikTok, Instagram, YouTube)

Antworte immer auf Deutsch, es sei denn, der Benutzer fragt explizit auf einer anderen Sprache.
Sei präzise, hilfreich und praxisorientiert.
Wenn du Code-Beispiele oder technische Details gibst, formatiere sie übersichtlich.`;

/**
 * Erstelle einen Video-Editor Chat
 */
export function createVideoEditorChat(sessionId) {
  return new AIChat({
    sessionId,
    systemMessage: VIDEO_EDITOR_SYSTEM_PROMPT,
    functionType: 'chat'
  });
}

export default {
  AIChat,
  generateSessionId,
  quickPrompt,
  createVideoEditorChat,
  VIDEO_EDITOR_SYSTEM_PROMPT
};
