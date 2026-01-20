/**
 * link.js - Link/Unlink Audio+Video Clips
 * 
 * Utilities zum Verknüpfen und Trennen von Video- und Audio-Clips.
 */

import { generateId } from './helpers';

/**
 * Erstellt ein Link-Pair zwischen zwei Clips
 * @param {Object} clip1 - Erster Clip
 * @param {Object} clip2 - Zweiter Clip
 * @returns {Object} { videoClipId, audioClipId }
 */
export function linkClips(clip1, clip2) {
  const videoClip = clip1.type === 'video' ? clip1 : clip2;
  const audioClip = clip1.type === 'audio' ? clip1 : clip2;
  
  return {
    videoClipId: videoClip.id,
    audioClipId: audioClip.id,
    offset: audioClip.start - videoClip.start // Zeitlicher Offset
  };
}

/**
 * Findet den verlinkten Partner-Clip
 * @param {string} clipId - Clip-ID
 * @param {Array} linkedPairs - Array von Link-Pairs
 * @returns {string|null} Partner-Clip-ID oder null
 */
export function findLinkedClipId(clipId, linkedPairs) {
  const pair = linkedPairs.find(p => 
    p.videoClipId === clipId || p.audioClipId === clipId
  );
  
  if (!pair) return null;
  
  return pair.videoClipId === clipId ? pair.audioClipId : pair.videoClipId;
}

/**
 * Prüft ob ein Clip verlinkt ist
 * @param {string} clipId - Clip-ID
 * @param {Array} linkedPairs - Array von Link-Pairs
 * @returns {boolean}
 */
export function isClipLinked(clipId, linkedPairs) {
  return linkedPairs.some(p => 
    p.videoClipId === clipId || p.audioClipId === clipId
  );
}

/**
 * Trennt Audio von Video und erstellt separaten Audio-Clip
 * @param {Object} videoClip - Video-Clip mit embedded Audio
 * @param {Object} audioTrack - Audio-Track wohin Audio verschoben wird
 * @param {Array} linkedPairs - Aktuelle Link-Pairs
 * @returns {Object} { audioClip, newAudioTrack, newLinkedPairs, linkPair }
 */
export function detachAudio(videoClip, audioTrack, linkedPairs) {
  // Erstelle neuen Audio-Clip mit gleichen Timestamps
  const audioClip = {
    id: generateId('c'),
    mediaId: videoClip.mediaId,
    type: 'audio',
    start: videoClip.start,
    duration: videoClip.duration,
    title: `${videoClip.title} (Audio)`,
    thumbnail: 'placeholder',
    props: {
      ...videoClip.props,
      volume: 100
    }
  };
  
  // Füge zu Audio-Track hinzu
  const newAudioTrack = {
    ...audioTrack,
    clips: [...audioTrack.clips, audioClip].sort((a, b) => a.start - b.start)
  };
  
  // Erstelle Link zwischen Video und Audio
  const linkPair = {
    videoClipId: videoClip.id,
    audioClipId: audioClip.id,
    offset: 0
  };
  
  const newLinkedPairs = [...linkedPairs, linkPair];
  
  return {
    audioClip,
    newAudioTrack,
    newLinkedPairs,
    linkPair
  };
}

/**
 * Entfernt Link-Pair
 * @param {string} clipId - Clip-ID (video oder audio)
 * @param {Array} linkedPairs - Aktuelle Link-Pairs
 * @returns {Array} Neue Link-Pairs ohne das betroffene Pair
 */
export function unlinkClip(clipId, linkedPairs) {
  return linkedPairs.filter(p => 
    p.videoClipId !== clipId && p.audioClipId !== clipId
  );
}

/**
 * Aktualisiert Link-Offset wenn ein Clip verschoben wird
 * @param {string} clipId - Bewegter Clip
 * @param {number} newStart - Neue Start-Position
 * @param {Array} linkedPairs - Link-Pairs
 * @param {Array} tracks - Alle Tracks (um Partner zu finden)
 * @returns {Array} Aktualisierte Link-Pairs
 */
export function updateLinkOffset(clipId, newStart, linkedPairs, tracks) {
  return linkedPairs.map(pair => {
    if (pair.videoClipId !== clipId && pair.audioClipId !== clipId) {
      return pair;
    }
    
    // Finde beide Clips
    let videoClip, audioClip;
    tracks.forEach(track => {
      track.clips.forEach(clip => {
        if (clip.id === pair.videoClipId) videoClip = clip;
        if (clip.id === pair.audioClipId) audioClip = clip;
      });
    });
    
    if (!videoClip || !audioClip) return pair;
    
    // Berechne neuen Offset
    const offset = audioClip.start - videoClip.start;
    
    return { ...pair, offset };
  });
}
