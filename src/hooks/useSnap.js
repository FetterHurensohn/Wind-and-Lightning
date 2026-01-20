/**
 * useSnap.js - Snap Logic Hook
 * 
 * Hook für magnetisches Snapping mit konfigurierbaren Optionen.
 */

import { useCallback } from 'react';
import { snapTime } from '../utils/snap';

/**
 * Snap Hook
 * @param {Object} options - { enabled, pxPerSec, fps, clips, playheadTime }
 * @returns {Object} { snapTime: function, snapThreshold }
 */
export function useSnap({ enabled, pxPerSec, fps, clips, playheadTime }) {
  const snapThresholdPx = Math.max(6, (pxPerSec / fps) * 2); // 6px oder 2 Frames
  const snapThresholdSec = snapThresholdPx / pxPerSec;

  const performSnap = useCallback((time, excludeClipId = null) => {
    if (!enabled) {
      return { snappedTime: time, snappedTo: 'none' };
    }

    return snapTime(time, {
      fps,
      pxPerSec,
      clips,
      playheadTime,
      excludeClipId,
      snapThresholdPx
    });
  }, [enabled, fps, pxPerSec, clips, playheadTime, snapThresholdPx]);

  return {
    snapTime: performSnap,
    snapThreshold: snapThresholdSec,
    snapThresholdPx
  };
}
