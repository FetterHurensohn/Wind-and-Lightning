/**
 * snap.js - Snap-Berechnungen
 * 
 * Utilities für magnetisches Snapping zu Frames, Sekunden, Clip-Kanten.
 */

/**
 * Snappt Zeit zu Frame-Boundaries
 * @param {number} time - Zeit in Sekunden
 * @param {number} fps - Frames per Second
 * @returns {number} Gesnappte Zeit
 */
export function snapToFrames(time, fps) {
  const frameTime = 1 / fps;
  return Math.round(time / frameTime) * frameTime;
}

/**
 * Snappt Zeit zu ganzen Sekunden
 * @param {number} time - Zeit in Sekunden
 * @returns {number} Gesnappte Zeit
 */
export function snapToSeconds(time) {
  return Math.round(time);
}

/**
 * Snappt Zeit zu Clip-Kanten (Start/End)
 * @param {number} time - Zeit in Sekunden
 * @param {Array} clips - Alle Clips
 * @param {number} thresholdSeconds - Snap-Schwelle in Sekunden
 * @param {string} excludeClipId - Ignoriere diesen Clip (optional)
 * @returns {number} Gesnappte Zeit
 */
export function snapToClipEdges(time, clips, thresholdSeconds, excludeClipId = null) {
  let closestEdge = time;
  let minDistance = thresholdSeconds;
  
  clips.forEach(clip => {
    if (clip.id === excludeClipId) return;
    
    // Check Start
    const distanceToStart = Math.abs(time - clip.start);
    if (distanceToStart < minDistance) {
      minDistance = distanceToStart;
      closestEdge = clip.start;
    }
    
    // Check End
    const clipEnd = clip.start + clip.duration;
    const distanceToEnd = Math.abs(time - clipEnd);
    if (distanceToEnd < minDistance) {
      minDistance = distanceToEnd;
      closestEdge = clipEnd;
    }
  });
  
  return closestEdge;
}

/**
 * Universeller Snap mit allen Methoden
 * @param {number} time - Zeit in Sekunden
 * @param {Object} options - { fps, pxPerSec, clips, playheadTime, excludeClipId, snapThresholdPx }
 * @returns {Object} { snappedTime, snappedTo } 'snappedTo' kann sein: 'frame', 'second', 'clip', 'playhead', 'none'
 */
export function snapTime(time, options = {}) {
  const {
    fps = 30,
    pxPerSec = 100,
    clips = [],
    playheadTime = null,
    excludeClipId = null,
    snapThresholdPx = 6
  } = options;
  
  const snapThresholdSec = snapThresholdPx / pxPerSec;
  
  let snappedTime = time;
  let minDistance = Infinity;
  let snappedTo = 'none';
  
  // 1. Snap to Frames
  const frameSnapped = snapToFrames(time, fps);
  const frameDistance = Math.abs(time - frameSnapped);
  if (frameDistance < minDistance && frameDistance < snapThresholdSec) {
    minDistance = frameDistance;
    snappedTime = frameSnapped;
    snappedTo = 'frame';
  }
  
  // 2. Snap to Seconds (nur bei niedrigem Zoom)
  if (pxPerSec < 50) {
    const secondSnapped = snapToSeconds(time);
    const secondDistance = Math.abs(time - secondSnapped);
    if (secondDistance < minDistance && secondDistance < snapThresholdSec) {
      minDistance = secondDistance;
      snappedTime = secondSnapped;
      snappedTo = 'second';
    }
  }
  
  // 3. Snap to Clip Edges
  const clipSnapped = snapToClipEdges(time, clips, snapThresholdSec, excludeClipId);
  const clipDistance = Math.abs(time - clipSnapped);
  if (clipDistance < minDistance && clipDistance > 0) {
    minDistance = clipDistance;
    snappedTime = clipSnapped;
    snappedTo = 'clip';
  }
  
  // 4. Snap to Playhead
  if (playheadTime !== null) {
    const playheadDistance = Math.abs(time - playheadTime);
    if (playheadDistance < minDistance && playheadDistance < snapThresholdSec) {
      minDistance = playheadDistance;
      snappedTime = playheadTime;
      snappedTo = 'playhead';
    }
  }
  
  return { snappedTime, snappedTo };
}
