/**
 * AIChat.jsx - KI-Chat Bereich (Cursor-Style)
 * 
 * Ein Chat-Interface wo der User mit einem KI-Agenten kommunizieren kann,
 * um Anweisungen für Video-Editing zu geben.
 */

import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon';

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hallo! Ich bin dein KI-Assistent für Video-Editing. Wie kann ich dir helfen?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

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

    // Simuliere KI-Antwort (später durch echte API ersetzen)
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Ich verstehe deine Anfrage. Hier sind einige Vorschläge:\n\n1. Du kannst Clips zur Timeline hinzufügen\n2. Effekte auf Clips anwenden\n3. Audio-Spuren bearbeiten\n\nWas möchtest du als nächstes tun?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsProcessing(false);
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg-panel)] border-l border-[var(--border-subtle)]">
      {/* Header */}
      <div className="h-11 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Icon name="ai" size={18} strokeWidth={1.5} />
          <span className="text-sm font-medium text-[var(--text-primary)]">KI-Assistent</span>
        </div>
        <button 
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors"
          title="Chat löschen"
        >
          <Icon name="trash" size={16} strokeWidth={1.5} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              ${message.role === 'user' 
                ? 'bg-[var(--accent-turquoise)] text-white' 
                : 'bg-[var(--accent-purple)] text-white'}
            `}>
              {message.role === 'user' ? (
                <Icon name="user" size={16} strokeWidth={1.5} />
              ) : (
                <Icon name="ai" size={16} strokeWidth={1.5} />
              )}
            </div>

            {/* Message Bubble */}
            <div className={`
              flex-1 max-w-[85%] rounded-lg p-3 
              ${message.role === 'user'
                ? 'bg-[var(--accent-turquoise)] text-white'
                : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)]'}
            `}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </div>
              <div className={`
                text-xs mt-1 
                ${message.role === 'user' ? 'text-white/70' : 'text-[var(--text-tertiary)]'}
              `}>
                {message.timestamp.toLocaleTimeString('de-DE', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-purple)] text-white flex items-center justify-center">
              <Icon name="ai" size={16} strokeWidth={1.5} />
            </div>
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--text-tertiary)] animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-[var(--text-tertiary)] animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-[var(--text-tertiary)] animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[var(--border-subtle)]">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Was soll ich als nächstes tun? (Enter zum Senden)"
              className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-turquoise)] resize-none min-h-[40px] max-h-[120px]"
              rows={1}
              disabled={isProcessing}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--accent-turquoise)] text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            title="Senden"
          >
            <Icon name="play" size={18} strokeWidth={1.5} />
          </button>
        </div>
        <div className="mt-2 text-xs text-[var(--text-tertiary)] flex items-center gap-1">
          <Icon name="info" size={12} strokeWidth={1.5} />
          <span>Shift + Enter für neue Zeile</span>
        </div>
      </div>
    </div>
  );
}
