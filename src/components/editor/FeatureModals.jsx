/**
 * FeatureModals.jsx - Zentrale Modals für alle Editor-Features
 * Enthält alle wichtigen Feature-Panels als Modals
 */

import React, { useState, useCallback } from 'react';
import Icon from './Icon';
import { ModelSelector } from './AIModelSelectorUI';
import { quickPrompt, generateImage, textToSpeech, generateMusicSuggestion, generateStoryboard } from '../../modules/ai/AIClient';
import { loadAISettings, AI_PROVIDERS } from '../../modules/ai/AIModelSelector';
import { EffectsManager, TransitionManager, ExportManager } from '../../modules/core/VideoEditorCore';

// ============================================
// AI TEXT-TO-VIDEO PANEL
// ============================================
export function TextToVideoPanel({ onClose, onGenerate }) {
  const settings = loadAISettings();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [duration, setDuration] = useState(30);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState(settings.defaultProvider);
  const [model, setModel] = useState(settings.defaultModel);

  const styles = [
    { id: 'cinematic', name: 'Filmisch' },
    { id: 'documentary', name: 'Dokumentation' },
    { id: 'social', name: 'Social Media' },
    { id: 'corporate', name: 'Business' },
    { id: 'artistic', name: 'Künstlerisch' },
    { id: 'anime', name: 'Anime' },
    { id: '3d', name: '3D Animation' }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await generateStoryboard({
        description: prompt,
        style: style,
        duration: duration,
        aspectRatio: aspectRatio
      });
      
      setResult(response);
      onGenerate?.({ storyboard: response, style, duration, aspectRatio });
    } catch (err) {
      console.error('Text-to-Video Error:', err);
      setError(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--bg-panel)] rounded-xl border border-[var(--border-subtle)] w-[600px] max-h-[80vh] overflow-hidden" data-testid="text-to-video-panel">
      <div className="h-11 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Icon name="video" size={16} className="text-[var(--accent-turquoise)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">AI Text-to-Video</span>
        </div>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-hover)]">
          <Icon name="close" size={14} />
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[calc(80vh-100px)] overflow-y-auto">
        <div className="flex items-center justify-between p-3 bg-[var(--bg-surface)] rounded-lg">
          <span className="text-xs text-[var(--text-secondary)]">KI-Modell</span>
          <ModelSelector selectedProvider={provider} selectedModel={model} onChange={(p, m) => { setProvider(p); setModel(m); }} compact />
        </div>

        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-2 block">Video-Beschreibung</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Beschreibe dein Video detailliert... z.B. 'Ein Produkt-Launch-Video für eine neue Smartphone-App mit dynamischen Übergängen'"
            rows={4}
            className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-turquoise)] resize-none"
            data-testid="video-prompt-input"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-2 block">Stil</label>
            <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full h-10 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)]">
              {styles.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-2 block">Dauer (Sek)</label>
            <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} min={5} max={180} className="w-full h-10 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)]" />
          </div>
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-2 block">Format</label>
            <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full h-10 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)]">
              <option value="16:9">16:9 (YouTube)</option>
              <option value="9:16">9:16 (TikTok)</option>
              <option value="1:1">1:1 (Instagram)</option>
              <option value="4:3">4:3</option>
            </select>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <Icon name="alertCircle" size={14} />
              {error}
            </div>
          </div>
        )}

        <button onClick={handleGenerate} disabled={!prompt.trim() || loading} className="w-full h-12 bg-gradient-to-r from-[var(--accent-turquoise)] to-[var(--accent-purple)] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2" data-testid="generate-video-btn">
          {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generiere Storyboard...</> : <><Icon name="effects" size={16} /> Storyboard generieren</>}
        </button>

        {result && (
          <div className="p-4 bg-[var(--bg-surface)] rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--text-secondary)]">Storyboard</span>
              <button onClick={() => navigator.clipboard.writeText(result)} className="text-xs text-[var(--accent-turquoise)] hover:underline">Kopieren</button>
            </div>
            <pre className="text-sm text-[var(--text-primary)] whitespace-pre-wrap font-sans max-h-[200px] overflow-y-auto" data-testid="storyboard-result">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// AI IMAGE GENERATOR PANEL
// ============================================
export function ImageGeneratorPanel({ onClose, onInsert }) {
  const settings = loadAISettings();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [size, setSize] = useState('1024x1024');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [provider, setProvider] = useState(settings.defaultProvider);
  const [model, setModel] = useState(settings.defaultModel);

  const styles = [
    { id: 'realistic', name: 'Realistisch' },
    { id: 'artistic', name: 'Künstlerisch' },
    { id: 'digital-art', name: 'Digital Art' },
    { id: 'anime', name: 'Anime' },
    { id: 'watercolor', name: 'Aquarell' },
    { id: 'oil-painting', name: 'Ölgemälde' },
    { id: '3d-render', name: '3D Render' },
    { id: 'sketch', name: 'Skizze' }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError(null);
    setGeneratedImage(null);
    
    try {
      const fullPrompt = style !== 'realistic' 
        ? `${prompt}, ${style} style, high quality`
        : prompt;
        
      const result = await generateImage(fullPrompt, {
        size: size,
        style: 'vivid'
      });
      
      setGeneratedImage(result.url || result.b64_json);
    } catch (err) {
      console.error('Image Generation Error:', err);
      setError(err.message || 'Bildgenerierung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = () => {
    if (generatedImage) {
      onInsert?.({ url: generatedImage, prompt });
      onClose?.();
    }
  };

  return (
    <div className="bg-[var(--bg-panel)] rounded-xl border border-[var(--border-subtle)] w-[500px]" data-testid="image-generator-panel">
      <div className="h-11 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Icon name="image" size={16} className="text-[var(--accent-purple)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">AI Bild-Generator</span>
        </div>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-hover)]"><Icon name="close" size={14} /></button>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between p-3 bg-[var(--bg-surface)] rounded-lg">
          <span className="text-xs text-[var(--text-secondary)]">KI-Modell</span>
          <ModelSelector selectedProvider={provider} selectedModel={model} onChange={(p, m) => { setProvider(p); setModel(m); }} compact />
        </div>

        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-2 block">Bild-Beschreibung</label>
          <textarea 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
            placeholder="Beschreibe das gewünschte Bild... z.B. 'Ein Sonnenuntergang über dem Meer mit Palmen'" 
            rows={3} 
            className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-turquoise)] resize-none" 
            data-testid="image-prompt-input"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-2 block">Stil</label>
            <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full h-10 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)]">
              {styles.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-2 block">Größe</label>
            <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full h-10 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)]">
              <option value="1024x1024">1024x1024</option>
              <option value="1024x1792">1024x1792 (Portrait)</option>
              <option value="1792x1024">1792x1024 (Landscape)</option>
            </select>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <Icon name="alertCircle" size={14} />
              {error}
            </div>
          </div>
        )}

        {/* Generated Image Preview */}
        {generatedImage && (
          <div className="space-y-2">
            <label className="text-xs text-[var(--text-secondary)]">Generiertes Bild</label>
            <div className="aspect-square bg-[var(--bg-surface)] rounded-lg overflow-hidden">
              <img src={generatedImage} alt="Generated" className="w-full h-full object-cover" />
            </div>
            <button
              onClick={handleInsert}
              className="w-full h-10 bg-[var(--accent-turquoise)] text-white rounded-lg text-sm font-medium hover:opacity-90 flex items-center justify-center gap-2"
              data-testid="insert-image-btn"
            >
              <Icon name="check" size={14} />
              In Projekt einfügen
            </button>
          </div>
        )}

        <button 
          onClick={handleGenerate}
          disabled={!prompt.trim() || loading} 
          className="w-full h-10 bg-[var(--accent-purple)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          data-testid="generate-image-btn"
        >
          {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generiere...</> : <><Icon name="effects" size={14} /> Bild generieren</>}
        </button>
      </div>
    </div>
  );
}

// ============================================
// AI MUSIC GENERATOR PANEL  
// ============================================
export function MusicGeneratorPanel({ onClose, onInsert }) {
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('electronic');
  const [mood, setMood] = useState('upbeat');
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);

  const genres = ['electronic', 'pop', 'rock', 'classical', 'jazz', 'hip-hop', 'ambient', 'cinematic'];
  const moods = ['upbeat', 'calm', 'dramatic', 'happy', 'sad', 'energetic', 'mysterious', 'romantic'];

  return (
    <div className="bg-[var(--bg-panel)] rounded-xl border border-[var(--border-subtle)] w-[450px]" data-testid="music-generator-panel">
      <div className="h-11 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Icon name="music" size={16} className="text-orange-400" />
          <span className="text-sm font-medium text-[var(--text-primary)]">AI Musik-Generator</span>
        </div>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-hover)]"><Icon name="close" size={14} /></button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-2 block">Beschreibung (optional)</label>
          <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="z.B. Upbeat Intro für YouTube Video" className="w-full h-10 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)]" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-2 block">Genre</label>
            <select value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full h-10 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] capitalize">
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-2 block">Stimmung</label>
            <select value={mood} onChange={(e) => setMood(e.target.value)} className="w-full h-10 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] capitalize">
              {moods.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-2 block">Dauer: {duration}s</label>
          <input type="range" value={duration} onChange={(e) => setDuration(Number(e.target.value))} min={10} max={180} className="w-full" />
        </div>

        <button disabled={loading} className="w-full h-10 bg-orange-500 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
          <Icon name="music" size={14} /> Musik generieren
        </button>
      </div>
    </div>
  );
}

// ============================================
// AI VOICE GENERATOR PANEL
// ============================================
export function VoiceGeneratorPanel({ onClose, onInsert }) {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('female-1');
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [loading, setLoading] = useState(false);

  const voices = [
    { id: 'female-1', name: 'Anna (Weiblich)', lang: 'de' },
    { id: 'female-2', name: 'Maria (Weiblich)', lang: 'de' },
    { id: 'male-1', name: 'Thomas (Männlich)', lang: 'de' },
    { id: 'male-2', name: 'Michael (Männlich)', lang: 'de' },
    { id: 'en-female', name: 'Sarah (English)', lang: 'en' },
    { id: 'en-male', name: 'James (English)', lang: 'en' }
  ];

  return (
    <div className="bg-[var(--bg-panel)] rounded-xl border border-[var(--border-subtle)] w-[450px]" data-testid="voice-generator-panel">
      <div className="h-11 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Icon name="audio" size={16} className="text-green-400" />
          <span className="text-sm font-medium text-[var(--text-primary)]">AI Sprachausgabe (TTS)</span>
        </div>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-hover)]"><Icon name="close" size={14} /></button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-2 block">Text zum Vorlesen</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Gib deinen Text ein..." rows={4} className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-turquoise)] resize-none" />
          <div className="text-right text-xs text-[var(--text-tertiary)] mt-1">{text.length} Zeichen</div>
        </div>

        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-2 block">Stimme</label>
          <select value={voice} onChange={(e) => setVoice(e.target.value)} className="w-full h-10 px-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)]">
            {voices.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-2 block">Geschwindigkeit: {speed.toFixed(1)}x</label>
            <input type="range" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} min={0.5} max={2} step={0.1} className="w-full" />
          </div>
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-2 block">Tonhöhe: {pitch.toFixed(1)}</label>
            <input type="range" value={pitch} onChange={(e) => setPitch(Number(e.target.value))} min={0.5} max={2} step={0.1} className="w-full" />
          </div>
        </div>

        <div className="flex gap-2">
          <button className="flex-1 h-10 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center justify-center gap-2">
            <Icon name="play" size={14} /> Vorschau
          </button>
          <button disabled={!text.trim() || loading} className="flex-1 h-10 bg-green-500 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
            Audio einfügen
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// AI BACKGROUND REMOVER PANEL
// ============================================
export function BackgroundRemoverPanel({ onClose, clip }) {
  const [mode, setMode] = useState('auto');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <div className="bg-[var(--bg-panel)] rounded-xl border border-[var(--border-subtle)] w-[400px]" data-testid="bg-remover-panel">
      <div className="h-11 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Icon name="effects" size={16} className="text-pink-400" />
          <span className="text-sm font-medium text-[var(--text-primary)]">Hintergrund entfernen</span>
        </div>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-hover)]"><Icon name="close" size={14} /></button>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'auto', name: 'Automatisch', desc: 'KI erkennt Hintergrund' },
            { id: 'greenscreen', name: 'Green Screen', desc: 'Chroma Key' }
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)} className={`p-3 rounded-lg border text-left transition ${mode === m.id ? 'border-[var(--accent-turquoise)] bg-[var(--accent-turquoise)]/10' : 'border-[var(--border-subtle)]'}`}>
              <div className="text-sm text-[var(--text-primary)]">{m.name}</div>
              <div className="text-xs text-[var(--text-tertiary)]">{m.desc}</div>
            </button>
          ))}
        </div>

        {mode === 'greenscreen' && (
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-2 block">Key-Farbe</label>
            <div className="flex gap-2">
              {['#00FF00', '#0000FF', '#FF00FF'].map(color => (
                <button key={color} className="w-10 h-10 rounded-lg border-2 border-[var(--border-subtle)]" style={{ backgroundColor: color }} />
              ))}
              <input type="color" className="w-10 h-10 rounded-lg cursor-pointer" />
            </div>
          </div>
        )}

        {processing && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-secondary)]">Verarbeite...</span>
              <span className="text-[var(--text-primary)]">{progress}%</span>
            </div>
            <div className="h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
              <div className="h-full bg-pink-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <button disabled={processing} className="w-full h-10 bg-pink-500 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
          {processing ? 'Verarbeite...' : 'Hintergrund entfernen'}
        </button>
      </div>
    </div>
  );
}

// ============================================
// EFFECTS & FILTERS PANEL
// ============================================
export function EffectsPanel({ onClose, onApply, clip }) {
  const [activeTab, setActiveTab] = useState('filters');
  const [selectedPreset, setSelectedPreset] = useState('none');
  const [adjustments, setAdjustments] = useState({
    brightness: 0, contrast: 0, saturation: 0, temperature: 0,
    exposure: 0, highlights: 0, shadows: 0, vignette: 0, grain: 0
  });

  const tabs = [
    { id: 'filters', name: 'Filter' },
    { id: 'adjust', name: 'Anpassen' },
    { id: 'effects', name: 'Effekte' }
  ];

  return (
    <div className="bg-[var(--bg-panel)] rounded-xl border border-[var(--border-subtle)] w-[350px] max-h-[500px] overflow-hidden" data-testid="effects-panel">
      <div className="h-11 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <span className="text-sm font-medium text-[var(--text-primary)]">Effekte & Filter</span>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-hover)]"><Icon name="close" size={14} /></button>
      </div>

      <div className="flex border-b border-[var(--border-subtle)]">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 h-10 text-xs transition ${activeTab === tab.id ? 'text-[var(--accent-turquoise)] border-b-2 border-[var(--accent-turquoise)]' : 'text-[var(--text-secondary)]'}`}>
            {tab.name}
          </button>
        ))}
      </div>

      <div className="p-3 max-h-[380px] overflow-y-auto">
        {activeTab === 'filters' && (
          <div className="grid grid-cols-3 gap-2">
            {EffectsManager.FILTER_PRESETS.map(preset => (
              <button key={preset.id} onClick={() => setSelectedPreset(preset.id)} className={`p-2 rounded-lg border transition ${selectedPreset === preset.id ? 'border-[var(--accent-turquoise)] bg-[var(--accent-turquoise)]/10' : 'border-[var(--border-subtle)]'}`}>
                <div className="w-full h-12 bg-[var(--bg-surface)] rounded mb-1" />
                <span className="text-xs text-[var(--text-primary)]">{preset.name}</span>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'adjust' && (
          <div className="space-y-3">
            {Object.entries(adjustments).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-secondary)] capitalize">{key}</span>
                  <span className="text-[var(--text-primary)]">{value}</span>
                </div>
                <input type="range" value={value} onChange={(e) => setAdjustments({ ...adjustments, [key]: Number(e.target.value) })} min={-100} max={100} className="w-full" />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="grid grid-cols-2 gap-2">
            {['Weichzeichner', 'Schärfen', 'Rauschen', 'Glitch', 'VHS', 'Filmkorn', 'Vignette', 'Glow'].map(effect => (
              <button key={effect} className="p-3 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--accent-turquoise)] text-sm text-[var(--text-primary)]">
                {effect}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-[var(--border-subtle)]">
        <button onClick={() => onApply?.({ preset: selectedPreset, adjustments })} className="w-full h-10 bg-[var(--accent-turquoise)] text-white rounded-lg text-sm font-medium hover:opacity-90">
          Anwenden
        </button>
      </div>
    </div>
  );
}

// ============================================
// TRANSITIONS PANEL
// ============================================
export function TransitionsPanel({ onClose, onApply }) {
  const [selectedTransition, setSelectedTransition] = useState(null);
  const [duration, setDuration] = useState(0.5);

  const categories = [...new Set(TransitionManager.TRANSITIONS.map(t => t.category))];

  return (
    <div className="bg-[var(--bg-panel)] rounded-xl border border-[var(--border-subtle)] w-[350px] max-h-[450px] overflow-hidden" data-testid="transitions-panel">
      <div className="h-11 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <span className="text-sm font-medium text-[var(--text-primary)]">Übergänge</span>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-hover)]"><Icon name="close" size={14} /></button>
      </div>

      <div className="p-3 max-h-[350px] overflow-y-auto">
        {categories.map(category => (
          <div key={category} className="mb-4">
            <div className="text-xs text-[var(--text-tertiary)] uppercase mb-2">{category}</div>
            <div className="grid grid-cols-3 gap-2">
              {TransitionManager.TRANSITIONS.filter(t => t.category === category).map(transition => (
                <button key={transition.id} onClick={() => setSelectedTransition(transition)} className={`p-2 rounded-lg border transition ${selectedTransition?.id === transition.id ? 'border-[var(--accent-turquoise)] bg-[var(--accent-turquoise)]/10' : 'border-[var(--border-subtle)]'}`}>
                  <div className="w-full h-8 bg-[var(--bg-surface)] rounded mb-1 flex items-center justify-center">
                    <Icon name="transitions" size={14} className="text-[var(--text-tertiary)]" />
                  </div>
                  <span className="text-xs text-[var(--text-primary)]">{transition.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedTransition && (
        <div className="p-3 border-t border-[var(--border-subtle)] space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[var(--text-secondary)]">Dauer</span>
              <span className="text-[var(--text-primary)]">{duration.toFixed(1)}s</span>
            </div>
            <input type="range" value={duration} onChange={(e) => setDuration(Number(e.target.value))} min={0.1} max={2} step={0.1} className="w-full" />
          </div>
          <button onClick={() => onApply?.({ ...selectedTransition, duration })} className="w-full h-10 bg-[var(--accent-turquoise)] text-white rounded-lg text-sm font-medium hover:opacity-90">
            Anwenden
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// AUDIO MIXER PANEL
// ============================================
export function AudioMixerPanel({ onClose, tracks }) {
  const [trackVolumes, setTrackVolumes] = useState({});
  const [masterVolume, setMasterVolume] = useState(100);

  return (
    <div className="bg-[var(--bg-panel)] rounded-xl border border-[var(--border-subtle)] w-[500px]" data-testid="audio-mixer-panel">
      <div className="h-11 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Icon name="audio" size={16} className="text-[var(--accent-turquoise)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">Audio Mixer</span>
        </div>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-hover)]"><Icon name="close" size={14} /></button>
      </div>

      <div className="p-4">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {/* Track Channels */}
          {(tracks || [{ id: 'audio1', name: 'Audio 1' }, { id: 'audio2', name: 'Audio 2' }, { id: 'music', name: 'Musik' }]).map((track, i) => (
            <div key={track.id} className="flex flex-col items-center gap-2 min-w-[60px]">
              <div className="h-32 w-2 bg-[var(--bg-surface)] rounded-full relative">
                <div className="absolute bottom-0 w-full bg-green-500 rounded-full transition-all" style={{ height: `${trackVolumes[track.id] || 80}%` }} />
              </div>
              <input type="range" value={trackVolumes[track.id] || 80} onChange={(e) => setTrackVolumes({ ...trackVolumes, [track.id]: Number(e.target.value) })} min={0} max={100} className="w-20 -rotate-90 origin-center" style={{ marginTop: '2rem', marginBottom: '2rem' }} />
              <div className="flex gap-1">
                <button className="w-6 h-6 rounded bg-[var(--bg-surface)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]">M</button>
                <button className="w-6 h-6 rounded bg-[var(--bg-surface)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]">S</button>
              </div>
              <span className="text-xs text-[var(--text-secondary)] truncate max-w-[60px]">{track.name}</span>
            </div>
          ))}

          {/* Master */}
          <div className="flex flex-col items-center gap-2 min-w-[60px] border-l border-[var(--border-subtle)] pl-4">
            <div className="h-32 w-3 bg-[var(--bg-surface)] rounded-full relative">
              <div className="absolute bottom-0 w-full bg-[var(--accent-turquoise)] rounded-full transition-all" style={{ height: `${masterVolume}%` }} />
            </div>
            <input type="range" value={masterVolume} onChange={(e) => setMasterVolume(Number(e.target.value))} min={0} max={100} className="w-20 -rotate-90 origin-center" style={{ marginTop: '2rem', marginBottom: '2rem' }} />
            <span className="text-xs text-[var(--text-primary)] font-medium">Master</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-[var(--border-subtle)]">
          {['EQ', 'Compressor', 'Reverb', 'Noise Gate'].map(effect => (
            <button key={effect} className="p-2 rounded-lg border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:border-[var(--accent-turquoise)] hover:text-[var(--text-primary)]">
              {effect}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXPORT ALL
// ============================================
export default {
  TextToVideoPanel,
  ImageGeneratorPanel,
  MusicGeneratorPanel,
  VoiceGeneratorPanel,
  BackgroundRemoverPanel,
  EffectsPanel,
  TransitionsPanel,
  AudioMixerPanel
};
