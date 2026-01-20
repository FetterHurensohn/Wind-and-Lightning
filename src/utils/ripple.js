/**
 * ripple.js - Ripple Edit Helpers
 * 
 * Utilities für Ripple-Editing-Operationen (automatisches Verschieben
 * nachfolgender Clips beim Löschen/Einfügen).
 */

/**
 * Ripple Delete: Löscht Clips und schiebt nachfolgende nach links
 * @param {Array} clips - Alle Clips auf einem Track
 * @param {Array} clipsToDelete - Zu löschende Clips
 * @returns {Array} Neue Clip-Liste
 */
export function rippleDeleteClips(clips, clipsToDelete) {
  // Sortiere zu löschende Clips nach start
  const sorted = [...clipsToDelete].sort((a, b) => a.start - b.start);
  
  if (sorted.length === 0) return clips;
  
  // Iteriere und berechne kumulative Shift-Distanz
  let cumulativeShift = 0;
  const result = [];
  const deleteIds = new Set(sorted.map(c => c.id));
  
  // Sortiere alle Clips nach Start für korrekte Verarbeitung
  const allSorted = [...clips].sort((a, b) => a.start - b.start);
  
  allSorted.forEach(clip => {
    if (deleteIds.has(clip.id)) {
      // Clip wird gelöscht, addiere seine Dauer zum Shift
      cumulativeShift += clip.duration;
    } else {
      // Clip behalten, ggf. verschieben
      result.push({
        ...clip,
        start: clip.start - cumulativeShift
      });
    }
  });
  
  return result;
}

/**
 * Schiebt alle Clips die nach einem Referenz-Clip kommen
 * @param {Array} clips - Alle Clips
 * @param {Object} referenceClip - Referenz-Clip
 * @param {number} deltaSeconds - Shift-Distanz in Sekunden (positiv = rechts, negativ = links)
 * @returns {Array} Neue Clip-Liste
 */
export function shiftLaterClips(clips, referenceClip, deltaSeconds) {
  return clips.map(clip => {
    // Shifte nur Clips die nach dem Referenz-Clip enden
    if (clip.id !== referenceClip.id && clip.start >= referenceClip.start + referenceClip.duration) {
      return {
        ...clip,
        start: Math.max(0, clip.start + deltaSeconds)
      };
    }
    return clip;
  });
}

/**
 * Erstellt eine Lücke an einer Position (schiebt Clips nach rechts)
 * @param {Array} clips - Alle Clips
 * @param {number} time - Position der Lücke
 * @param {number} duration - Lücken-Dauer
 * @returns {Array} Neue Clip-Liste
 */
export function insertGap(clips, time, duration) {
  return clips.map(clip => {
    if (clip.start >= time) {
      return {
        ...clip,
        start: clip.start + duration
      };
    }
    return clip;
  });
}

/**
 * Ripple beim Move: Berechnet wie andere Clips verschoben werden müssen
 * @param {Array} clips - Alle Clips auf Track
 * @param {Object} movedClip - Bewegter Clip
 * @param {number} oldStart - Alte Start-Position
 * @param {number} newStart - Neue Start-Position
 * @returns {Array} Clips mit angepassten Positionen
 */
export function rippleMove(clips, movedClip, oldStart, newStart) {
  const delta = newStart - oldStart;
  
  if (delta === 0) return clips;
  
  return clips.map(clip => {
    if (clip.id === movedClip.id) {
      return { ...clip, start: newStart };
    }
    
    // Wenn Clip nach rechts bewegt wird, schiebe nachfolgende mit
    if (delta > 0 && clip.start >= oldStart + movedClip.duration) {
      return { ...clip, start: clip.start + delta };
    }
    
    // Wenn nach links, schiebe Clips zwischen alter und neuer Position
    if (delta < 0 && clip.start >= newStart && clip.start < oldStart) {
      return { ...clip, start: clip.start + delta };
    }
    
    return clip;
  });
}
