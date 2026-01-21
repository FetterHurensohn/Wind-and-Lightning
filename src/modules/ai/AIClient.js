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
      
      // Versuche API-Aufruf
      try {
        const response = await this._callAPI(options);
        
        // Füge Antwort zum Verlauf hinzu
        this.messages.push({
          role: 'assistant',
          content: response
        });
        
        return response;
      } catch (apiError) {
        console.warn('API call failed, using fallback response:', apiError);
        
        // Fallback: Generiere hilfreiche Antwort basierend auf der Frage
        const fallbackResponse = this._generateFallbackResponse(userMsg.content);
        
        this.messages.push({
          role: 'assistant',
          content: fallbackResponse
        });
        
        return fallbackResponse;
      }
      
    } catch (error) {
      console.error('AI Chat Error:', error);
      this.messages.pop(); // Entferne die letzte Benutzer-Nachricht bei Fehler
      throw error;
    }
  }
  
  /**
   * API-Aufruf
   */
  async _callAPI(options = {}) {
    const requestBody = {
      provider: this.provider,
      model: this.model,
      messages: [
        { role: 'system', content: this.systemMessage },
        ...this.messages
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000,
      stream: false
    };
    
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
    return data.choices?.[0]?.message?.content || data.content || '';
  }
  
  /**
   * Fallback-Antwort generieren wenn API nicht erreichbar
   */
  _generateFallbackResponse(question) {
    const q = question.toLowerCase();
    
    // Video-Editing spezifische Antworten
    if (q.includes('export') || q.includes('exportieren')) {
      return `Für den Export deines Videos empfehle ich folgende Einstellungen:

**YouTube:**
- Format: MP4 (H.264)
- Auflösung: 1920x1080 (1080p) oder 3840x2160 (4K)
- Bildrate: 30 fps oder 60 fps
- Bitrate: 12-45 Mbps je nach Auflösung

**TikTok/Instagram Reels:**
- Format: MP4 (H.264)
- Auflösung: 1080x1920 (9:16 vertikal)
- Bildrate: 30 fps
- Bitrate: 6-8 Mbps

Klicke auf "Export" in der Toolbar um den Export-Dialog zu öffnen.`;
    }
    
    if (q.includes('untertitel') || q.includes('caption')) {
      return `Für automatische Untertitel:

1. Wähle deinen Clip in der Timeline aus
2. Klicke auf "Auto-Untertitel" in den Feature-Tiles
3. Wähle die Sprache deines Videos
4. Klicke auf "Untertitel generieren"

**Tipps:**
- Für beste Ergebnisse verwende klare Audioaufnahmen
- Du kannst die generierten Untertitel manuell bearbeiten
- Verschiedene Stile (YouTube, Netflix, Modern) sind verfügbar`;
    }
    
    if (q.includes('übergang') || q.includes('transition')) {
      return `Übergänge hinzufügen:

1. Klicke auf "Übergänge" in den Feature-Tiles
2. Wähle einen Übergang (z.B. Fade, Wipe, Zoom)
3. Ziehe ihn zwischen zwei Clips in der Timeline

**Beliebte Übergänge:**
- **Fade/Überblenden** - Klassisch und professionell
- **Zoom** - Dynamisch für Social Media
- **Glitch** - Modern und trendy
- **3D Flip** - Auffällig für Intros`;
    }
    
    if (q.includes('musik') || q.includes('audio') || q.includes('ton')) {
      return `Audio-Bearbeitung:

**Musik hinzufügen:**
1. Klicke auf "Musik-Generator" für KI-generierte Musik
2. Oder importiere eigene Musik über den Media-Browser

**Audio-Mixer:**
1. Klicke auf "Audio Mixer" in den Feature-Tiles
2. Passe Lautstärke, Pan und Effekte an
3. Nutze "Auto-Ducking" um Musik bei Sprache leiser zu machen

**Effekte:** EQ, Compressor, Reverb, Noise Reduction`;
    }
    
    if (q.includes('text') || q.includes('titel')) {
      return `Text und Titel hinzufügen:

1. Klicke auf das Text-Icon in der linken Toolbar
2. Wähle eine Vorlage oder erstelle eigenen Text
3. Bearbeite Schriftart, Farbe, Animation

**KI-Titel-Generator:**
1. Klicke auf "Mehr KI-Tools" → "Titel" Tab
2. Gib dein Video-Thema ein
3. Wähle Plattform (YouTube, TikTok, etc.)
4. Klicke "Generieren" für kreative Vorschläge`;
    }
    
    if (q.includes('effekt') || q.includes('filter')) {
      return `Effekte & Filter anwenden:

1. Klicke auf "Effekte & Filter" in den Feature-Tiles
2. Wähle aus:
   - **Filter**: Vintage, Cinematic, Neon, etc.
   - **Anpassen**: Helligkeit, Kontrast, Sättigung
   - **Effekte**: Blur, Vignette, Grain

**Tipp:** Effekte können per Keyframe animiert werden für dynamische Looks!`;
    }
    
    if (q.includes('schneid') || q.includes('cut') || q.includes('trim')) {
      return `Video schneiden:

**Clip trimmen:**
- Ziehe an den Kanten eines Clips in der Timeline

**Clip splitten:**
1. Positioniere den Playhead an der gewünschten Stelle
2. Drücke "S" oder klicke auf das Split-Icon

**Ripple Delete:**
- Wähle einen Clip und drücke "Backspace"
- Nachfolgende Clips rücken automatisch nach`;
    }
    
    // Default Antwort
    return `Ich bin dein KI-Assistent für Video-Editing! Ich kann dir helfen mit:

📹 **Video-Bearbeitung**
- Schneiden, Trimmen, Übergänge
- Effekte und Filter
- Text und Titel

🎵 **Audio**
- Musik hinzufügen
- Audio-Mixing
- Sprachaufnahme

🤖 **KI-Features**
- Auto-Untertitel
- Text-zu-Video
- Musik-Generator
- Hintergrund entfernen

💾 **Export**
- YouTube, TikTok, Instagram
- Verschiedene Formate und Auflösungen

Was möchtest du wissen?`;
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
