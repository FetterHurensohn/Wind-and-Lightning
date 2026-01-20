/**
 * Helper-Utilities
 * 
 * Verschiedene Hilfsfunktionen für den Video-Editor
 */

/**
 * Snappt einen Wert zum nächsten Grid-Punkt
 * @param {number} value - Zu snappender Wert
 * @param {number} gridSize - Grid-Größe
 * @param {number} threshold - Snap-Schwelle (Toleranz)
 * @returns {number} Gesnappter Wert
 */
export function snapToGrid(value, gridSize = 1, threshold = 0.2) {
  const snapped = Math.round(value / gridSize) * gridSize;
  const distance = Math.abs(value - snapped);
  
  if (distance <= threshold) {
    return snapped;
  }
  
  return value;
}

/**
 * Snappt zu anderen Clip-Kanten (Magnetismus)
 * @param {number} value - Aktuelle Position
 * @param {Array} clips - Array von Clips mit start/duration
 * @param {number} threshold - Snap-Distanz in Sekunden
 * @returns {number} Gesnappter Wert
 */
export function snapToClips(value, clips, threshold = 0.5) {
  let closest = value;
  let minDistance = threshold;
  
  clips.forEach(clip => {
    // Snap zu Start
    const distanceToStart = Math.abs(value - clip.start);
    if (distanceToStart < minDistance) {
      minDistance = distanceToStart;
      closest = clip.start;
    }
    
    // Snap zu End
    const clipEnd = clip.start + clip.duration;
    const distanceToEnd = Math.abs(value - clipEnd);
    if (distanceToEnd < minDistance) {
      minDistance = distanceToEnd;
      closest = clipEnd;
    }
  });
  
  return closest;
}

/**
 * Clamp-Funktion: Begrenzt Wert zwischen min und max
 * @param {number} value - Wert
 * @param {number} min - Minimum
 * @param {number} max - Maximum
 * @returns {number} Begrenzter Wert
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generiert eindeutige ID
 * @param {string} prefix - ID-Präfix
 * @returns {string} Eindeutige ID
 */
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Findet Clip nach ID in allen Tracks
 * @param {Array} tracks - Array von Tracks
 * @param {string} clipId - Gesuchte Clip-ID
 * @returns {Object|null} {track, clip, clipIndex} oder null
 */
export function findClipById(tracks, clipId) {
  for (const track of tracks) {
    const clipIndex = track.clips.findIndex(c => c.id === clipId);
    if (clipIndex !== -1) {
      return {
        track,
        clip: track.clips[clipIndex],
        clipIndex
      };
    }
  }
  return null;
}

/**
 * Prüft ob zwei Clips sich überlappen
 * @param {Object} clip1 - Clip mit start/duration
 * @param {Object} clip2 - Clip mit start/duration
 * @returns {boolean} True wenn Überlappung
 */
export function clipsOverlap(clip1, clip2) {
  const end1 = clip1.start + clip1.duration;
  const end2 = clip2.start + clip2.duration;
  
  return !(end1 <= clip2.start || end2 <= clip1.start);
}

/**
 * Debounce-Funktion
 * @param {Function} func - Zu debouncende Funktion
 * @param {number} wait - Wartezeit in ms
 * @returns {Function} Debouncte Funktion
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
