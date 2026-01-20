// Timeline Utility Functions

export const snapToGrid = (
  time: number, 
  snapEnabled: boolean, 
  snapThreshold: number,
  clips: any[],
  tracks: any[],
  ignoreClipId?: string
): number => {
  if (!snapEnabled) return time;

  // Snap points to check
  const snapPoints: number[] = [0]; // Always snap to timeline start
  
  // Add all clip boundaries as snap points
  clips.forEach(clip => {
    if (clip.id !== ignoreClipId) {
      snapPoints.push(clip.startTime);
      snapPoints.push(clip.startTime + clip.duration);
    }
  });

  // Find closest snap point
  let closestSnap = time;
  let minDistance = Infinity;
  
  snapPoints.forEach(snapPoint => {
    const distance = Math.abs(time - snapPoint);
    if (distance < snapThreshold && distance < minDistance) {
      minDistance = distance;
      closestSnap = snapPoint;
    }
  });

  return closestSnap;
};

export const checkClipCollision = (
  clipId: string,
  trackId: string,
  startTime: number,
  duration: number,
  clips: any[]
): boolean => {
  const endTime = startTime + duration;
  
  return clips.some(clip => {
    if (clip.id === clipId || clip.trackId !== trackId) return false;
    
    const clipEnd = clip.startTime + clip.duration;
    
    // Check if intervals overlap
    return (startTime < clipEnd && endTime > clip.startTime);
  });
};

export const findNextAvailablePosition = (
  trackId: string,
  preferredTime: number,
  duration: number,
  clips: any[]
): number => {
  // Try preferred position first
  if (!checkClipCollision('', trackId, preferredTime, duration, clips)) {
    return preferredTime;
  }

  // Find all clips on this track
  const trackClips = clips
    .filter(c => c.trackId === trackId)
    .sort((a, b) => a.startTime - b.startTime);

  // Find first available gap
  let currentTime = 0;
  for (const clip of trackClips) {
    const gap = clip.startTime - currentTime;
    if (gap >= duration) {
      return currentTime;
    }
    currentTime = clip.startTime + clip.duration;
  }

  // Place at end
  return currentTime;
};

export const formatTimecode = (seconds: number, fps: number = 30): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const frames = Math.floor((seconds % 1) * fps);
  
  return `${hrs.toString().padStart(2, '0')}:${mins
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames
    .toString()
    .padStart(2, '0')}`;
};

export const parseTimecode = (timecode: string, fps: number = 30): number => {
  const parts = timecode.split(':');
  if (parts.length !== 4) return 0;
  
  const [hrs, mins, secs, frames] = parts.map(Number);
  return hrs * 3600 + mins * 60 + secs + frames / fps;
};

export const getClipAtPosition = (
  time: number,
  trackId: string,
  clips: any[]
): any | null => {
  return clips.find(clip => 
    clip.trackId === trackId &&
    time >= clip.startTime &&
    time < clip.startTime + clip.duration
  ) || null;
};
