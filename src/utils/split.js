/**
 * split.js - Clip Split Logic
 * 
 * Utilities zum Teilen von Clips an einer bestimmten Zeit.
 */

import { generateId } from './helpers';

/**
 * Teilt einen Clip an einer bestimmten Zeit in zwei Clips
 * @param {Object} clip - Zu teilender Clip
 * @param {number} time - Zeit an der geteilt werden soll (in Sekunden)
 * @param {number} fps - Frames per Second (für Snap)
 * @returns {Object|null} { leftClip, rightClip } oder null wenn Split nicht möglich
 */
export function splitClipAt(clip, time, fps) {
  // Prüfe ob time innerhalb des Clips liegt
  if (time <= clip.start || time >= clip.start + clip.duration) {
    return null; // Kein Split nötig/möglich
  }
  
  // Snap zu Frame wenn sehr nah
  const frameTime = 1 / fps;
  const snappedTime = Math.round(time / frameTime) * frameTime;
  
  const leftDuration = snappedTime - clip.start;
  const rightDuration = clip.start + clip.duration - snappedTime;
  
  // Minimum Duration Check (0.033s = 1 Frame bei 30fps)
  if (leftDuration < frameTime || rightDuration < frameTime) {
    return null;
  }
  
  const leftClip = {
    ...clip,
    id: generateId('c'),
    duration: leftDuration
  };
  
  const rightClip = {
    ...clip,
    id: generateId('c'),
    start: snappedTime,
    duration: rightDuration
  };
  
  return { leftClip, rightClip };
}

/**
 * Findet alle Clips die an einer bestimmten Zeit geteilt werden können
 * @param {Array} tracks - Alle Tracks
 * @param {number} time - Zeit für Split
 * @param {Array} selectedClipIds - Nur diese Clips teilen (optional)
 * @returns {Array} Array von { trackId, clipId, clip }
 */
export function findClipsToSplit(tracks, time, selectedClipIds = null) {
  const result = [];
  
  tracks.forEach(track => {
    track.clips.forEach(clip => {
      const isInTimeRange = time > clip.start && time < clip.start + clip.duration;
      const isSelected = !selectedClipIds || selectedClipIds.includes(clip.id);
      
      if (isInTimeRange && isSelected) {
        result.push({
          trackId: track.id,
          clipId: clip.id,
          clip
        });
      }
    });
  });
  
  return result;
}
