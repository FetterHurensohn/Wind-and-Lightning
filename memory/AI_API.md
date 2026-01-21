# 🤖 KI-Module API Referenz

> Vollständige API-Dokumentation für die KI-Integration.

---

## AIModelSelector.js

**Datei:** `/app/src/modules/ai/AIModelSelector.js`

### Konstanten

#### AI_PROVIDERS
```javascript
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
```

#### AI_FUNCTION_MODELS
```javascript
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
    alternatives: [{ provider: 'gemini', model: 'gemini-2.5-flash' }]
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
```

### Funktionen

#### loadAISettings()
```javascript
// Lädt gespeicherte KI-Einstellungen aus localStorage
const settings = loadAISettings();

// Rückgabe:
{
  defaultProvider: 'openai',
  defaultModel: 'gpt-5.2',
  functionModels: {},  // Überschreibungen pro Funktion
  apiKey: null         // Benutzerdefinierter API-Key
}
```

#### saveAISettings(settings)
```javascript
// Speichert KI-Einstellungen in localStorage
saveAISettings({
  defaultProvider: 'anthropic',
  defaultModel: 'claude-4-sonnet-20250514',
  functionModels: {
    captions: { provider: 'openai', model: 'gpt-5.2' }
  },
  apiKey: null
});
```

#### getModelForFunction(functionType)
```javascript
// Holt das konfigurierte Modell für eine Funktion
const model = getModelForFunction('scriptWriting');
// → { provider: 'anthropic', model: 'claude-4-sonnet-20250514' }
```

#### validateModel(provider, modelId)
```javascript
// Prüft ob ein Modell existiert
const isValid = validateModel('openai', 'gpt-5.2');  // true
const isInvalid = validateModel('openai', 'fake');   // false
```

#### getModelInfo(provider, modelId)
```javascript
// Holt Modell-Details
const info = getModelInfo('openai', 'gpt-5.2');
// → { id: 'gpt-5.2', name: 'GPT-5.2', description: 'Neuestes Modell', recommended: true }
```

---

## AIClient.js

**Datei:** `/app/src/modules/ai/AIClient.js`

### Konstanten

```javascript
const EMERGENT_API_URL = 'https://api.emergentai.io/v1';
const DEFAULT_EMERGENT_KEY = 'sk-emergent-67b5f95099879B4541';
```

### Klassen

#### AIChat
```javascript
import { AIChat, generateSessionId } from '../../modules/ai/AIClient';

// Erstellen
const chat = new AIChat({
  sessionId: generateSessionId(),           // Optional
  systemMessage: 'Du bist ein Assistent.',  // Optional
  functionType: 'chat',                     // Optional
  provider: 'openai',                       // Optional
  model: 'gpt-5.2',                        // Optional
  apiKey: 'sk-...'                         // Optional
});

// Modell wechseln
chat.withModel('anthropic', 'claude-4-sonnet-20250514');

// Nachricht senden
const response = await chat.sendMessage('Hallo!');
const response2 = await chat.sendMessage('Follow-up');

// Streaming
await chat.sendMessageStream(
  'Lange Anfrage...',
  (chunk, fullText) => console.log('Chunk:', chunk),
  (fullResponse) => console.log('Fertig:', fullResponse)
);

// History
const history = chat.getHistory();
chat.clearHistory();
```

### Funktionen

#### generateSessionId()
```javascript
const sessionId = generateSessionId();
// → 'session_1703152800000_abc123def'
```

#### quickPrompt(prompt, options)
```javascript
// Einzelne Anfrage ohne Session
const response = await quickPrompt('Was ist 2+2?', {
  provider: 'openai',
  model: 'gpt-5.2',
  systemMessage: 'Du bist ein Mathematiker.',
  temperature: 0.7,
  maxTokens: 1000
});
```

#### createVideoEditorChat(sessionId)
```javascript
// Erstellt Chat mit Video-Editor System-Prompt
const chat = createVideoEditorChat('meine-session');
```

### System-Prompts

#### VIDEO_EDITOR_SYSTEM_PROMPT
```javascript
import { VIDEO_EDITOR_SYSTEM_PROMPT } from '../../modules/ai/AIClient';

// Vordefinierter Prompt für Video-Editor Assistenten
// Enthält Anweisungen für:
// - Video-Editing-Techniken
// - Untertitel-Erstellung
// - Farbkorrektur
// - Audio-Bearbeitung
// - Export-Einstellungen
// - Social Media Optimierung
```

---

## Verwendungsbeispiele

### 1. Einfacher Chat
```jsx
import { useState } from 'react';
import { quickPrompt } from '../../modules/ai/AIClient';

function SimpleChat() {
  const [response, setResponse] = useState('');
  
  const handleAsk = async () => {
    const answer = await quickPrompt('Was ist ein J-Cut?', {
      provider: 'openai',
      model: 'gpt-5.2'
    });
    setResponse(answer);
  };
  
  return (
    <div>
      <button onClick={handleAsk}>Fragen</button>
      <p>{response}</p>
    </div>
  );
}
```

### 2. Session-basierter Chat
```jsx
import { useState, useRef, useEffect } from 'react';
import { createVideoEditorChat } from '../../modules/ai/AIClient';

function ChatPanel() {
  const [messages, setMessages] = useState([]);
  const chatRef = useRef(null);
  
  useEffect(() => {
    chatRef.current = createVideoEditorChat('my-session');
  }, []);
  
  const handleSend = async (text) => {
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    
    const response = await chatRef.current.sendMessage(text);
    
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
  };
  
  // ... render
}
```

### 3. Modell dynamisch wählen
```jsx
import { useState } from 'react';
import { AIChat } from '../../modules/ai/AIClient';
import { AI_PROVIDERS } from '../../modules/ai/AIModelSelector';

function ModelSwitcher() {
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('gpt-5.2');
  
  const chat = new AIChat({ provider, model });
  
  const handleProviderChange = (newProvider) => {
    setProvider(newProvider);
    setModel(AI_PROVIDERS[newProvider].models[0].id);
    chat.withModel(newProvider, AI_PROVIDERS[newProvider].models[0].id);
  };
  
  // ... render
}
```

---

## Error Handling

```javascript
try {
  const response = await quickPrompt('Test');
} catch (error) {
  if (error.message.includes('401')) {
    console.error('API Key ungültig');
  } else if (error.message.includes('429')) {
    console.error('Rate Limit erreicht');
  } else if (error.message.includes('500')) {
    console.error('Server-Fehler');
  } else {
    console.error('Unbekannter Fehler:', error.message);
  }
}
```

---

## API-Request Format

```javascript
// Request an Emergent API
{
  provider: 'openai',           // oder 'anthropic', 'gemini'
  model: 'gpt-5.2',
  messages: [
    { role: 'system', content: '...' },
    { role: 'user', content: '...' },
    { role: 'assistant', content: '...' }
  ],
  temperature: 0.7,
  max_tokens: 2000,
  stream: false
}

// Response
{
  choices: [
    {
      message: {
        content: 'Antwort...'
      }
    }
  ]
}
```
