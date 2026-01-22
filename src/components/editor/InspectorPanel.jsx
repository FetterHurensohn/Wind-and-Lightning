/**
 * InspectorPanel.jsx - Rechtes Inspector Panel (wie CapCut)
 * 
 * Zeigt Eigenschaften des ausgewählten Clips:
 * - Basis: Position, Skalierung, Rotation, Deckkraft
 * - Video: Speed, Flip, Stabilisierung
 * - Audio: Lautstärke, Fade In/Out
 * - Text: Schriftart, Farbe, Animation
 * - Keyframes Button
 */

import React, { useState, useCallback } from 'react';
import { useEditor } from './EditorLayout';
import Icon from './Icon';

// Property Slider Component
const PropertySlider = ({ label, value, min, max, step = 1, unit = '', onChange }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between">
      <span className="text-xs text-[var(--text-secondary)]">{label}</span>
      <span className="text-xs text-[var(--text-primary)]">{value}{unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-[var(--bg-surface)] rounded appearance-none cursor-pointer
        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent-turquoise)]"
    />
  </div>
);

// Section Component
const Section = ({ title, icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-[var(--border-subtle)] last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-9 px-3 flex items-center justify-between hover:bg-[var(--bg-hover)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon name={icon} size={14} className="text-[var(--text-tertiary)]" />
          <span className="text-xs font-medium text-[var(--text-primary)]">{title}</span>
        </div>
        <Icon name={isOpen ? 'chevronUp' : 'chevronDown'} size={12} className="text-[var(--text-tertiary)]" />
      </button>
      {isOpen && (
        <div className="px-3 pb-3 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
};

// Toggle Switch Component
const ToggleSwitch = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between cursor-pointer">
    <span className="text-xs text-[var(--text-secondary)]">{label}</span>
    <div className={`w-9 h-5 rounded-full transition-colors ${
      checked ? 'bg-[var(--accent-turquoise)]' : 'bg-[var(--bg-surface)]'
    }`}>
      <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mt-0.5 ${
        checked ? 'ml-[18px]' : 'ml-0.5'
      }`} />
    </div>
  </label>
);

export default function InspectorPanel({ 
  onOpenKeyframes,
  onOpenSpeed,
  onOpenText
}) {
  const { state, dispatch } = useEditor();
  
  // Finde ausgewählten Clip
  const selectedClip = React.useMemo(() => {
    if (!state.selectedClipId) return null;
    for (const track of state.tracks) {
      const clip = track.clips?.find(c => c.id === state.selectedClipId);
      if (clip) return { ...clip, trackId: track.id, trackType: track.type };
    }
    return null;
  }, [state.selectedClipId, state.tracks]);
  
  const updateClipProperty = useCallback((property, value) => {
    if (!selectedClip) return;
    dispatch({
      type: 'UPDATE_CLIP_PROPS',
      payload: { clipId: selectedClip.id, property, value }
    });
  }, [selectedClip, dispatch]);
  
  // Keine Auswahl
  if (!selectedClip) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="h-10 px-3 flex items-center border-b border-[var(--border-subtle)]">
          <span className="text-sm font-medium text-[var(--text-primary)]">Eigenschaften</span>
        </div>
        
        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <Icon name="adjustment" size={32} className="text-[var(--text-tertiary)] mb-3" />
          <div className="text-sm text-[var(--text-secondary)] mb-1">Kein Clip ausgewählt</div>
          <div className="text-xs text-[var(--text-tertiary)]">
            Wähle einen Clip in der Timeline aus, um seine Eigenschaften zu bearbeiten.
          </div>
        </div>
      </div>
    );
  }
  
  const props = selectedClip.props || {};
  
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-10 px-3 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Icon 
            name={selectedClip.type === 'video' ? 'video' : selectedClip.type === 'audio' ? 'audio' : selectedClip.type === 'text' ? 'text' : selectedClip.type === 'sticker' ? 'sticker' : 'image'} 
            size={14} 
            className="text-[var(--accent-turquoise)]" 
          />
          <span className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[150px]">
            {selectedClip.title}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onOpenKeyframes?.(selectedClip)}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] transition-colors"
            title="Keyframes"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" className="text-[var(--text-secondary)]">
              <path d="M7 1L13 7L7 13L1 7L7 1Z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Clip Info */}
        <div className="px-3 py-2 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-tertiary)]">Start</span>
            <span className="text-[var(--text-primary)] font-mono">{selectedClip.start?.toFixed(2)}s</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-[var(--text-tertiary)]">Dauer</span>
            <span className="text-[var(--text-primary)] font-mono">{selectedClip.duration?.toFixed(2)}s</span>
          </div>
        </div>
        
        {/* Transform Section */}
        <Section title="Transformation" icon="adjustment">
          <PropertySlider
            label="Deckkraft"
            value={props.opacity ?? 100}
            min={0}
            max={100}
            unit="%"
            onChange={(v) => updateClipProperty('opacity', v)}
          />
          <PropertySlider
            label="Skalierung"
            value={props.scale ?? 100}
            min={10}
            max={500}
            unit="%"
            onChange={(v) => updateClipProperty('scale', v)}
          />
          <PropertySlider
            label="Rotation"
            value={props.rotation ?? 0}
            min={-360}
            max={360}
            unit="°"
            onChange={(v) => updateClipProperty('rotation', v)}
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-xs text-[var(--text-tertiary)] block mb-1">Position X</span>
              <input
                type="number"
                value={props.posX ?? 0}
                onChange={(e) => updateClipProperty('posX', parseInt(e.target.value))}
                className="w-full h-7 px-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-turquoise)]"
              />
            </div>
            <div>
              <span className="text-xs text-[var(--text-tertiary)] block mb-1">Position Y</span>
              <input
                type="number"
                value={props.posY ?? 0}
                onChange={(e) => updateClipProperty('posY', parseInt(e.target.value))}
                className="w-full h-7 px-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-turquoise)]"
              />
            </div>
          </div>
        </Section>
        
        {/* Video/Image Specific */}
        {(selectedClip.type === 'video' || selectedClip.type === 'image') && (
          <>
            {/* Speed Section (nur Video) */}
            {selectedClip.type === 'video' && (
              <Section title="Geschwindigkeit" icon="play">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">
                    {props.speed ? `${props.speed}x` : '1x'}
                  </span>
                  <button
                    onClick={() => onOpenSpeed?.(selectedClip)}
                    className="px-3 h-7 bg-[var(--bg-surface)] rounded text-xs text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    Bearbeiten
                  </button>
                </div>
                <ToggleSwitch
                  label="Rückwärts"
                  checked={props.reverse ?? false}
                  onChange={(v) => updateClipProperty('reverse', v)}
                />
              </Section>
            )}
            
            {/* Flip Section */}
            <Section title="Spiegeln" icon="transitions">
              <div className="flex gap-2">
                <button
                  onClick={() => updateClipProperty('flipH', !props.flipH)}
                  className={`flex-1 h-8 rounded text-xs transition-colors ${
                    props.flipH 
                      ? 'bg-[var(--accent-turquoise)] text-white' 
                      : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Horizontal
                </button>
                <button
                  onClick={() => updateClipProperty('flipV', !props.flipV)}
                  className={`flex-1 h-8 rounded text-xs transition-colors ${
                    props.flipV 
                      ? 'bg-[var(--accent-turquoise)] text-white' 
                      : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Vertikal
                </button>
              </div>
            </Section>
            
            {/* Blend Mode */}
            <Section title="Mischmodus" icon="effects" defaultOpen={false}>
              <select
                value={props.blendMode ?? 'normal'}
                onChange={(e) => updateClipProperty('blendMode', e.target.value)}
                className="w-full h-8 px-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] focus:outline-none"
              >
                <option value="normal">Normal</option>
                <option value="multiply">Multiplizieren</option>
                <option value="screen">Überlagerung</option>
                <option value="overlay">Ineinanderkopieren</option>
                <option value="darken">Abdunkeln</option>
                <option value="lighten">Aufhellen</option>
                <option value="color-dodge">Farbig abwedeln</option>
                <option value="color-burn">Farbig nachbelichten</option>
                <option value="hard-light">Hartes Licht</option>
                <option value="soft-light">Weiches Licht</option>
                <option value="difference">Differenz</option>
                <option value="exclusion">Ausschluss</option>
              </select>
            </Section>
          </>
        )}
        
        {/* Audio Specific */}
        {(selectedClip.type === 'audio' || selectedClip.type === 'video') && (
          <Section title="Audio" icon="audio">
            <PropertySlider
              label="Lautstärke"
              value={props.volume ?? 100}
              min={0}
              max={200}
              unit="%"
              onChange={(v) => updateClipProperty('volume', v)}
            />
            <PropertySlider
              label="Fade In"
              value={props.fadeIn ?? 0}
              min={0}
              max={5}
              step={0.1}
              unit="s"
              onChange={(v) => updateClipProperty('fadeIn', v)}
            />
            <PropertySlider
              label="Fade Out"
              value={props.fadeOut ?? 0}
              min={0}
              max={5}
              step={0.1}
              unit="s"
              onChange={(v) => updateClipProperty('fadeOut', v)}
            />
          </Section>
        )}
        
        {/* Text Specific */}
        {selectedClip.type === 'text' && (
          <>
            <Section title="Text" icon="text" defaultOpen={true}>
              <div className="space-y-3">
                {/* Text Content */}
                <div>
                  <div className="text-[10px] text-[var(--text-tertiary)] mb-1">Textinhalt</div>
                  <textarea
                    value={props.text || ''}
                    onChange={(e) => updateClipProperty('text', e.target.value)}
                    className="w-full h-20 px-2 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] resize-none focus:outline-none focus:border-[var(--accent-turquoise)]"
                    placeholder="Text eingeben..."
                  />
                </div>
                
                {/* Font Size */}
                <PropertySlider
                  label="Schriftgröße"
                  value={props.fontSize ?? 48}
                  min={12}
                  max={200}
                  unit="px"
                  onChange={(v) => updateClipProperty('fontSize', v)}
                />
                
                {/* Font Weight */}
                <div>
                  <div className="text-[10px] text-[var(--text-tertiary)] mb-1">Schriftstärke</div>
                  <select
                    value={props.fontWeight || 'bold'}
                    onChange={(e) => updateClipProperty('fontWeight', e.target.value)}
                    className="w-full h-8 px-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] focus:outline-none"
                  >
                    <option value="normal">Normal</option>
                    <option value="medium">Mittel</option>
                    <option value="semibold">Halbfett</option>
                    <option value="bold">Fett</option>
                    <option value="extrabold">Extra Fett</option>
                  </select>
                </div>
                
                {/* Text Color */}
                <div>
                  <div className="text-[10px] text-[var(--text-tertiary)] mb-1">Textfarbe</div>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={props.color || '#ffffff'}
                      onChange={(e) => updateClipProperty('color', e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={props.color || '#ffffff'}
                      onChange={(e) => updateClipProperty('color', e.target.value)}
                      className="flex-1 h-8 px-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] focus:outline-none"
                    />
                  </div>
                </div>
                
                {/* Background Color */}
                <div>
                  <div className="text-[10px] text-[var(--text-tertiary)] mb-1">Hintergrundfarbe</div>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={props.backgroundColor === 'transparent' ? '#000000' : (props.backgroundColor || '#000000')}
                      onChange={(e) => updateClipProperty('backgroundColor', e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent"
                    />
                    <button
                      onClick={() => updateClipProperty('backgroundColor', 'transparent')}
                      className={`flex-1 h-8 rounded text-xs transition-colors ${
                        props.backgroundColor === 'transparent' || !props.backgroundColor
                          ? 'bg-[var(--accent-turquoise)] text-white'
                          : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                      }`}
                    >
                      Transparent
                    </button>
                  </div>
                </div>
                
                {/* Text Align */}
                <div>
                  <div className="text-[10px] text-[var(--text-tertiary)] mb-1">Ausrichtung</div>
                  <div className="flex gap-1">
                    {['left', 'center', 'right'].map(align => (
                      <button
                        key={align}
                        onClick={() => updateClipProperty('textAlign', align)}
                        className={`flex-1 h-8 rounded text-xs transition-colors ${
                          (props.textAlign || 'center') === align
                            ? 'bg-[var(--accent-turquoise)] text-white'
                            : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {align === 'left' ? 'Links' : align === 'center' ? 'Mitte' : 'Rechts'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Section>
            
            {/* Text Effect */}
            <Section title="Texteffekt" icon="effects" defaultOpen={false}>
              <select
                value={props.textEffect || 'none'}
                onChange={(e) => updateClipProperty('textEffect', e.target.value)}
                className="w-full h-8 px-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] focus:outline-none"
              >
                <option value="none">Kein Effekt</option>
                <option value="shadow">Schatten</option>
                <option value="outline">Umriss</option>
                <option value="glow">Leuchten</option>
                <option value="neon">Neon</option>
                <option value="gradient">Farbverlauf</option>
              </select>
            </Section>
          </>
        )}
        
        {/* Sticker Specific */}
        {selectedClip.type === 'sticker' && (
          <Section title="Sticker" icon="image" defaultOpen={true}>
            <div className="space-y-3">
              {/* Current Sticker Preview */}
              <div className="flex items-center justify-center p-4 bg-[var(--bg-surface)] rounded-lg">
                <span className="text-6xl">{props.emoji || '⭐'}</span>
              </div>
              
              {/* Sticker Size */}
              <PropertySlider
                label="Sticker-Größe"
                value={props.fontSize ?? 64}
                min={24}
                max={256}
                unit="px"
                onChange={(v) => updateClipProperty('fontSize', v)}
              />
              
              {/* Animation */}
              <div>
                <div className="text-[10px] text-[var(--text-tertiary)] mb-1">Animation</div>
                <select
                  value={props.animation || 'none'}
                  onChange={(e) => updateClipProperty('animation', e.target.value)}
                  className="w-full h-8 px-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] focus:outline-none"
                >
                  <option value="none">Keine</option>
                  <option value="bounce">Hüpfen</option>
                  <option value="pulse">Pulsieren</option>
                  <option value="spin">Drehen</option>
                  <option value="shake">Schütteln</option>
                  <option value="swing">Schwingen</option>
                </select>
              </div>
              
              {/* Quick Replace */}
              <div>
                <div className="text-[10px] text-[var(--text-tertiary)] mb-2">Schnell ersetzen</div>
                <div className="grid grid-cols-6 gap-1">
                  {['⭐', '🔥', '❤️', '😂', '🎉', '✨', '💯', '🙌', '👏', '🤩', '💪', '🚀'].map((emoji, idx) => (
                    <button
                      key={idx}
                      onClick={() => updateClipProperty('emoji', emoji)}
                      className={`aspect-square rounded text-xl flex items-center justify-center transition-colors ${
                        props.emoji === emoji 
                          ? 'bg-[var(--accent-turquoise)] text-white' 
                          : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)]'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        )}
        
        {/* Color Correction */}
        <Section title="Farbkorrektur" icon="filter" defaultOpen={false}>
          <PropertySlider
            label="Helligkeit"
            value={props.brightness ?? 100}
            min={0}
            max={200}
            unit="%"
            onChange={(v) => updateClipProperty('brightness', v)}
          />
          <PropertySlider
            label="Kontrast"
            value={props.contrast ?? 100}
            min={0}
            max={200}
            unit="%"
            onChange={(v) => updateClipProperty('contrast', v)}
          />
          <PropertySlider
            label="Sättigung"
            value={props.saturation ?? 100}
            min={0}
            max={200}
            unit="%"
            onChange={(v) => updateClipProperty('saturation', v)}
          />
          <PropertySlider
            label="Farbton"
            value={props.hue ?? 0}
            min={-180}
            max={180}
            unit="°"
            onChange={(v) => updateClipProperty('hue', v)}
          />
        </Section>
        
        {/* Effects Section */}
        <Section title="Effekte" icon="effects" defaultOpen={true}>
          {selectedClip.effects && selectedClip.effects.length > 0 ? (
            <div className="space-y-2">
              {selectedClip.effects.map(effect => (
                <div key={effect.id} className="flex items-center justify-between p-2 bg-[var(--bg-panel)] rounded">
                  <span className="text-xs text-[var(--text-primary)]">{effect.name}</span>
                  <button
                    onClick={() => dispatch({ type: 'REMOVE_EFFECT_FROM_CLIP', payload: { clipId: selectedClip.id, effectId: effect.id } })}
                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/20 text-[var(--text-tertiary)] hover:text-red-400"
                  >
                    <Icon name="close" size={10} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-[var(--text-tertiary)] text-center py-2">
              Keine Effekte angewendet
            </div>
          )}
          <div className="text-[9px] text-[var(--text-tertiary)] mt-2">
            Wähle "Effekte" im oberen Menü, um Effekte hinzuzufügen.
          </div>
        </Section>
        
        {/* Transition Section */}
        <Section title="Übergang" icon="transitions" defaultOpen={true}>
          {selectedClip.transition ? (
            <div className="flex items-center justify-between p-2 bg-[var(--bg-panel)] rounded">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-primary)]">{selectedClip.transition.name}</span>
                <span className="text-[10px] text-[var(--text-tertiary)]">{selectedClip.transition.duration}s</span>
              </div>
              <button
                onClick={() => dispatch({ type: 'REMOVE_TRANSITION_FROM_CLIP', payload: { clipId: selectedClip.id } })}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/20 text-[var(--text-tertiary)] hover:text-red-400"
              >
                <Icon name="close" size={10} />
              </button>
            </div>
          ) : (
            <div className="text-xs text-[var(--text-tertiary)] text-center py-2">
              Kein Übergang hinzugefügt
            </div>
          )}
          <div className="text-[9px] text-[var(--text-tertiary)] mt-2">
            Wähle "Übergänge" im oberen Menü, um Übergänge hinzuzufügen.
          </div>
        </Section>
        
        {/* Actions */}
        <div className="p-3 space-y-2">
          <button
            onClick={() => onOpenKeyframes?.(selectedClip)}
            className="w-full h-9 bg-[var(--bg-surface)] rounded text-xs text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors flex items-center justify-center gap-2"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M6 1L11 6L6 11L1 6L6 1Z" />
            </svg>
            Keyframes bearbeiten
          </button>
          <button
            onClick={() => {
              if (selectedClip) {
                dispatch({ type: 'DELETE_CLIP', payload: { clipId: selectedClip.id } });
              }
            }}
            className="w-full h-9 bg-red-500/10 text-red-400 rounded text-xs hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="trash" size={12} />
            Clip löschen
          </button>
        </div>
      </div>
    </div>
  );
}
