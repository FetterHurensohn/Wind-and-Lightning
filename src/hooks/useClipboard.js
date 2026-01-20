/**
 * useClipboard.js - Copy/Paste Clipboard State
 * 
 * Hook für Clipboard-Verwaltung (Copy/Cut/Paste von Clips).
 */

import { useState, useCallback } from 'react';
import { generateId } from '../utils/helpers';

/**
 * Clipboard Hook
 * @returns {Object} { clipboard, copyClips, cutClips, pasteClips, hasClipboard }
 */
export function useClipboard() {
  const [clipboard, setClipboard] = useState(null);

  const copyClips = useCallback((clips) => {
    setClipboard({
      clips: clips.map(clip => ({ ...clip })),
      action: 'copy'
    });
  }, []);

  const cutClips = useCallback((clips) => {
    setClipboard({
      clips: clips.map(clip => ({ ...clip })),
      action: 'cut'
    });
  }, []);

  const pasteClips = useCallback((pasteTime, trackId) => {
    if (!clipboard || !clipboard.clips.length) return null;

    // Finde frühesten Start der kopierten Clips
    const minStart = Math.min(...clipboard.clips.map(c => c.start));

    // Erstelle neue Clips mit relativen Offsets
    const newClips = clipboard.clips.map(clip => {
      const offset = clip.start - minStart;
      return {
        ...clip,
        id: generateId('c'),
        start: pasteTime + offset
      };
    });

    // Clear clipboard wenn es ein Cut war
    if (clipboard.action === 'cut') {
      setClipboard(null);
    }

    return {
      clips: newClips,
      trackId
    };
  }, [clipboard]);

  const clearClipboard = useCallback(() => {
    setClipboard(null);
  }, []);

  return {
    clipboard,
    copyClips,
    cutClips,
    pasteClips,
    clearClipboard,
    hasClipboard: clipboard !== null && clipboard.clips.length > 0
  };
}
