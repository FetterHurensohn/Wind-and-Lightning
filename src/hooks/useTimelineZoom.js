/**
 * useTimelineZoom Hook
 * 
 * Verwaltet Timeline-Zoom (Pixel pro Sekunde) mit Min/Max-Limits.
 * 
 * @param {number} initialPxPerSec - Initiale Pixel pro Sekunde (default: 50)
 * @param {number} min - Minimum Zoom (default: 10)
 * @param {number} max - Maximum Zoom (default: 200)
 * @returns {Object} { pxPerSec, zoomIn, zoomOut, setPxPerSec, secondsToPixels, pixelsToSeconds }
 */

import { useState, useCallback } from 'react';
import { clamp } from '../utils/helpers';

export function useTimelineZoom(initialPxPerSec = 50, min = 10, max = 200) {
  const [pxPerSec, setPxPerSecInternal] = useState(initialPxPerSec);

  const setPxPerSec = useCallback((value) => {
    setPxPerSecInternal(clamp(value, min, max));
  }, [min, max]);

  const zoomIn = useCallback((factor = 1.2) => {
    setPxPerSecInternal(prev => clamp(prev * factor, min, max));
  }, [min, max]);

  const zoomOut = useCallback((factor = 1.2) => {
    setPxPerSecInternal(prev => clamp(prev / factor, min, max));
  }, [min, max]);

  const secondsToPixels = useCallback((seconds) => {
    return seconds * pxPerSec;
  }, [pxPerSec]);

  const pixelsToSeconds = useCallback((pixels) => {
    return pixels / pxPerSec;
  }, [pxPerSec]);

  const zoomToFit = useCallback((duration, containerWidth) => {
    const newPxPerSec = (containerWidth * 0.9) / duration;
    setPxPerSecInternal(clamp(newPxPerSec, min, max));
  }, [min, max]);

  return {
    pxPerSec,
    setPxPerSec,
    zoomIn,
    zoomOut,
    secondsToPixels,
    pixelsToSeconds,
    zoomToFit
  };
}
