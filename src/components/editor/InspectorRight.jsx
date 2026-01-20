/**
 * InspectorRight.jsx - Rechte Properties-Spalte (PIXELGENAU)
 * Breite: 280px (geändert von 320px)
 * Stil: Sehr kompakt, kleine Schrift, gelbe Tooltip-Karte
 */

import React, { useState, useEffect } from 'react';
import { useEditor } from './EditorLayout';
import YellowTooltipCard from './YellowTooltipCard';

function PropertyRow({ label, value, editable, onChange }) {
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className="text-xs text-[var(--text-tertiary)]">{label}</span>
      {editable ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="px-2 py-0.5 bg-[var(--bg-surface)] border border-[var(--border-normal)] rounded text-[var(--text-secondary)] text-sm w-32 focus:outline-none focus:border-[var(--accent-blue)]"
          style={{ fontSize: '11px' }}
        />
      ) : (
        <span className="text-sm text-[var(--text-secondary)]" style={{ fontSize: '11px' }}>{value}</span>
      )}
    </div>
  );
}

export default function InspectorRight() {
  const { state, dispatch } = useEditor();
  const [tooltipDismissed, setTooltipDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('editor_tooltip_dismissed');
    if (dismissed) setTooltipDismissed(true);
  }, []);

  const handleDismissTooltip = () => {
    setTooltipDismissed(true);
    localStorage.setItem('editor_tooltip_dismissed', 'true');
  };

  const selectedClip = state.selectedClipId
    ? state.tracks.flatMap(t => t.clips).find(c => c.id === state.selectedClipId)
    : null;

  return (
    <aside className="w-[280px] bg-[var(--bg-panel)] border-l border-[var(--border-subtle)] overflow-y-auto">
      {/* Header - Kompakt */}
      <div className="h-10 px-3 border-b border-[var(--border-subtle)] flex items-center">
        <h2 className="text-sm font-medium text-[var(--text-primary)]" style={{ fontSize: '11px' }}>Einzelheiten</h2>
      </div>

      <div className="p-3">
        {/* Yellow Tooltip Card */}
        {!tooltipDismissed && <YellowTooltipCard onDismiss={handleDismissTooltip} />}

        {/* Properties - Sehr kompakt */}
        <div className="space-y-1">
          <PropertyRow 
            label="Name" 
            value={selectedClip?.title || state.projectName} 
            editable 
            onChange={(val) => {
              if (selectedClip) {
                dispatch({ type: 'UPDATE_CLIP_PROPS', payload: { clipId: selectedClip.id, property: 'title', value: val }});
              } else {
                dispatch({ type: 'SET_PROJECT_NAME', payload: val });
              }
            }}
          />
          <PropertyRow label="Pfad" value="C:/Users/..." editable={false} />
          <PropertyRow label="Seitenverhältnis" value="16:9" editable={false} />
          <PropertyRow label="Auflösung" value="1920×1080" editable={false} />
          <PropertyRow label="Bildfrequenz" value="30.00fps" editable={false} />
          <PropertyRow label="Importierte Medien" value={String(state.media.length)} editable={false} />
          <PropertyRow label="Proxy" value="Aus" editable={false} />
        </div>

        {/* Ändern Button - Kompakt */}
        <button className="mt-3 w-full h-7 px-3 bg-[var(--accent-turquoise)] text-white rounded text-sm font-medium hover:opacity-90 transition-all">
          Ändern
        </button>
      </div>
    </aside>
  );
}
