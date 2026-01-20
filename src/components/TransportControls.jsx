/**
 * TransportControls-Komponente
 * 
 * Play/Pause/Stop/Step-Controls für Timeline-Wiedergabe.
 * 
 * Props:
 * @param {boolean} playing - Ist Wiedergabe aktiv
 * @param {Function} onPlayPause - Toggle Play/Pause
 * @param {Function} onStop - Stop und zurück zu 0
 * @param {Function} onStepForward - Ein Frame vorwärts
 * @param {Function} onStepBackward - Ein Frame rückwärts
 * @param {number} fps - Frames per Second
 */

import React from 'react';

export default function TransportControls({
  playing = false,
  onPlayPause,
  onStop,
  onStepForward,
  onStepBackward,
  fps = 30
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-panel border-t border-muted/20">
      {/* Step Backward */}
      <button
        onClick={onStepBackward}
        className="p-2 rounded hover:bg-surface transition-colors text-muted hover:text-white"
        title="Ein Frame zurück (←)"
        aria-label="Ein Frame zurück"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.5 12L20 6v12l-8.5-6zM4 18h3V6H4v12z" />
        </svg>
      </button>

      {/* Play/Pause */}
      <button
        onClick={onPlayPause}
        className="p-3 rounded-full bg-accent hover:bg-accent/80 transition-colors text-white"
        title={playing ? 'Pause (Space)' : 'Wiedergabe (Space)'}
        aria-label={playing ? 'Pause' : 'Wiedergabe'}
      >
        {playing ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Stop */}
      <button
        onClick={onStop}
        className="p-2 rounded hover:bg-surface transition-colors text-muted hover:text-white"
        title="Stop"
        aria-label="Stop"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 6h12v12H6z" />
        </svg>
      </button>

      {/* Step Forward */}
      <button
        onClick={onStepForward}
        className="p-2 rounded hover:bg-surface transition-colors text-muted hover:text-white"
        title="Ein Frame vor (→)"
        aria-label="Ein Frame vor"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 18l8.5-6L4 6v12zm13-12v12h3V6h-3z" />
        </svg>
      </button>

      {/* FPS Display */}
      <div className="ml-4 text-12 text-muted border-l border-muted/20 pl-4">
        {fps} fps
      </div>
    </div>
  );
}
