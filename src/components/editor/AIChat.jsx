/**
 * AIChat.jsx - KI-Chat Bereich mit echter LLM-Integration
 * 
 * Unterstützt mehrere AI-Provider (OpenAI, Anthropic, Gemini)
 * Benutzer kann das Modell auswählen
 */

import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon';
import { ModelSelector, AISettingsPanel } from './AIModelSelectorUI';
import { createVideoEditorChat, generateSessionId } from '../../modules/ai/AIClient';
import { loadAISettings } from '../../modules/ai/AIModelSelector';

export default function AIChat() {
  // Lade gespeicherte Einstellungen
  const settings = loadAISettings();
  
  // State
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hallo! Ich bin dein KI-Assistent für Video-Editing. Wie kann ich dir helfen?\n\nIch kann dir bei folgenden Dingen helfen:\n• Tipps für Video-Schnitt und Effekte\n• Untertitel und Captions erstellen\n• Export-Einstellungen optimieren\n• Kreative Vorschläge geben',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(settings.defaultProvider || 'openai');
  const [selectedModel, setSelectedModel] = useState(settings.defaultModel || 'gpt-5.2');
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId] = useState(() => generateSessionId());
  
  // Refs
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const chatRef = useRef(null);

  // Initialisiere Chat-Client
  useEffect(() => {
    chatRef.current = createVideoEditorChat(sessionId);
    chatRef.current.withModel(selectedProvider, selectedModel);
  }, [sessionId]);

  // Update Chat-Client wenn Modell wechselt
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.withModel(selectedProvider, selectedModel);
    }
  }, [selectedProvider, selectedModel]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleModelChange = (provider, model) => {
    setSelectedProvider(provider);
    setSelectedModel(model);
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);
    setError(null);

    try {
      // Sende Nachricht an AI
      const response = await chatRef.current.sendMessage(userMessage.content);

      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        model: `${selectedProvider}/${selectedModel}`
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('AI Chat Error:', err);
      setError(err.message || 'Ein Fehler ist aufgetreten');
      
      // Zeige Fehler als System-Nachricht
      const errorMessage = {
        id: Date.now() + 1,
        role: 'system',
        content: `⚠️ Fehler: ${err.message || 'Verbindung zum AI-Service fehlgeschlagen'}`,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        role: 'assistant',
        content: 'Chat wurde zurückgesetzt. Wie kann ich dir helfen?',
        timestamp: new Date()
      }
    ]);
    if (chatRef.current) {
      chatRef.current.clearHistory();
    }
    setError(null);
  };

  // Vorschläge für häufige Fragen
  const suggestions = [
    'Wie exportiere ich für TikTok?',
    'Tipps für bessere Übergänge',
    'Untertitel automatisch erstellen'
  ];

  return (
    <div className="h-full flex flex-col bg-[var(--bg-panel)]" data-testid="ai-chat-panel">
      {/* Header */}
      <div className="h-11 px-3 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--accent-turquoise)] to-[var(--accent-purple)] flex items-center justify-center">
            <Icon name="ai" size={14} strokeWidth={1.5} className="text-white" />
          </div>
          <span className="text-sm font-medium text-[var(--text-primary)]">KI-Assistent</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowSettings(true)}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            title="Einstellungen"
            data-testid="ai-settings-button"
          >
            <Icon name="settings" size={14} strokeWidth={1.5} />
          </button>
          <button 
            onClick={handleClearChat}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            title="Chat löschen"
            data-testid="clear-chat-button"
          >
            <Icon name="trash" size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Model Selector */}
      <div className="px-3 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <ModelSelector
          selectedProvider={selectedProvider}
          selectedModel={selectedModel}
          onChange={handleModelChange}
          compact={true}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            data-testid={`message-${message.role}`}
          >
            {/* Avatar */}
            <div className={`
              w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
              ${message.role === 'user' 
                ? 'bg-[var(--accent-blue)]' 
                : message.isError 
                  ? 'bg-red-500/20'
                  : 'bg-gradient-to-br from-[var(--accent-turquoise)] to-[var(--accent-purple)]'}
            `}>
              {message.role === 'user' ? (
                <Icon name="user" size={14} strokeWidth={1.5} className="text-white" />
              ) : message.isError ? (
                <Icon name="alertCircle" size={14} strokeWidth={1.5} className="text-red-400" />
              ) : (
                <Icon name="ai" size={14} strokeWidth={1.5} className="text-white" />
              )}
            </div>

            {/* Message Bubble */}
            <div className={`
              flex-1 max-w-[90%] rounded-lg p-2.5
              ${message.role === 'user'
                ? 'bg-[var(--accent-blue)] text-white'
                : message.isError
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)]'}
            `}>
              <div className="text-xs leading-relaxed whitespace-pre-wrap">
                {message.content}
              </div>
              <div className={`
                flex items-center justify-between text-[10px] mt-1.5
                ${message.role === 'user' ? 'text-white/60' : 'text-[var(--text-tertiary)]'}
              `}>
                <span>
                  {message.timestamp.toLocaleTimeString('de-DE', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
                {message.model && (
                  <span className="opacity-60">{message.model}</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--accent-turquoise)] to-[var(--accent-purple)] flex items-center justify-center">
              <Icon name="ai" size={14} strokeWidth={1.5} className="text-white" />
            </div>
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2.5">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)] animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)] animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)] animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions (only show when chat is empty or has only welcome message) */}
      {messages.length <= 1 && !isProcessing && (
        <div className="px-3 pb-2">
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => setInput(suggestion)}
                className="px-2 py-1 text-[10px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-turquoise)] transition-all"
                data-testid={`suggestion-${idx}`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 border-t border-[var(--border-subtle)]">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Frag mich etwas..."
              className="w-full px-2.5 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-turquoise)] resize-none min-h-[36px] max-h-[100px]"
              rows={1}
              disabled={isProcessing}
              data-testid="chat-input"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-[var(--accent-turquoise)] text-white hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            title="Senden"
            data-testid="send-button"
          >
            <Icon name="send" size={16} strokeWidth={1.5} />
          </button>
        </div>
        <div className="mt-1.5 text-[10px] text-[var(--text-tertiary)] flex items-center gap-1">
          <Icon name="info" size={10} strokeWidth={1.5} />
          <span>Shift + Enter für neue Zeile</span>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="animate-scaleIn">
            <AISettingsPanel onClose={() => setShowSettings(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
