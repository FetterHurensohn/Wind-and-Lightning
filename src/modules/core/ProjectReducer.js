/**
 * ProjectReducer.js - Vollständiger Reducer für alle Projekt-Aktionen
 */

import { createClip, createAsset, createMarker, createEffect, createTransition } from './ProjectState';

// Action Types
export const ActionTypes = {
  // Project
  SET_PROJECT: 'SET_PROJECT',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  RESET_PROJECT: 'RESET_PROJECT',
  
  // Timeline
  SET_PLAYHEAD: 'SET_PLAYHEAD',
  SET_IN_POINT: 'SET_IN_POINT',
  SET_OUT_POINT: 'SET_OUT_POINT',
  CLEAR_IN_OUT: 'CLEAR_IN_OUT',
  SET_ZOOM: 'SET_ZOOM',
  SET_SCROLL: 'SET_SCROLL',
  TOGGLE_SNAPPING: 'TOGGLE_SNAPPING',
  TOGGLE_RIPPLE: 'TOGGLE_RIPPLE',
  
  // Tracks
  ADD_TRACK: 'ADD_TRACK',
  REMOVE_TRACK: 'REMOVE_TRACK',
  UPDATE_TRACK: 'UPDATE_TRACK',
  REORDER_TRACKS: 'REORDER_TRACKS',
  TOGGLE_TRACK_LOCK: 'TOGGLE_TRACK_LOCK',
  TOGGLE_TRACK_VISIBLE: 'TOGGLE_TRACK_VISIBLE',
  TOGGLE_TRACK_MUTE: 'TOGGLE_TRACK_MUTE',
  TOGGLE_TRACK_SOLO: 'TOGGLE_TRACK_SOLO',
  
  // Clips
  ADD_CLIP: 'ADD_CLIP',
  REMOVE_CLIP: 'REMOVE_CLIP',
  UPDATE_CLIP: 'UPDATE_CLIP',
  MOVE_CLIP: 'MOVE_CLIP',
  RESIZE_CLIP: 'RESIZE_CLIP',
  SPLIT_CLIP: 'SPLIT_CLIP',
  MERGE_CLIPS: 'MERGE_CLIPS',
  DUPLICATE_CLIP: 'DUPLICATE_CLIP',
  
  // Trim Operations
  TRIM_CLIP_START: 'TRIM_CLIP_START',
  TRIM_CLIP_END: 'TRIM_CLIP_END',
  ROLL_EDIT: 'ROLL_EDIT',
  SLIP_EDIT: 'SLIP_EDIT',
  RIPPLE_DELETE: 'RIPPLE_DELETE',
  
  // Transform
  UPDATE_TRANSFORM: 'UPDATE_TRANSFORM',
  RESET_TRANSFORM: 'RESET_TRANSFORM',
  
  // Keyframes
  ADD_KEYFRAME: 'ADD_KEYFRAME',
  REMOVE_KEYFRAME: 'REMOVE_KEYFRAME',
  UPDATE_KEYFRAME: 'UPDATE_KEYFRAME',
  MOVE_KEYFRAME: 'MOVE_KEYFRAME',
  
  // Effects
  ADD_EFFECT: 'ADD_EFFECT',
  REMOVE_EFFECT: 'REMOVE_EFFECT',
  UPDATE_EFFECT: 'UPDATE_EFFECT',
  REORDER_EFFECTS: 'REORDER_EFFECTS',
  TOGGLE_EFFECT: 'TOGGLE_EFFECT',
  COPY_EFFECTS: 'COPY_EFFECTS',
  PASTE_EFFECTS: 'PASTE_EFFECTS',
  
  // Transitions
  ADD_TRANSITION: 'ADD_TRANSITION',
  REMOVE_TRANSITION: 'REMOVE_TRANSITION',
  UPDATE_TRANSITION: 'UPDATE_TRANSITION',
  
  // Assets
  ADD_ASSET: 'ADD_ASSET',
  REMOVE_ASSET: 'REMOVE_ASSET',
  UPDATE_ASSET: 'UPDATE_ASSET',
  SET_ASSET_PROXY: 'SET_ASSET_PROXY',
  
  // Markers
  ADD_MARKER: 'ADD_MARKER',
  REMOVE_MARKER: 'REMOVE_MARKER',
  UPDATE_MARKER: 'UPDATE_MARKER',
  
  // Selection
  SELECT_CLIPS: 'SELECT_CLIPS',
  DESELECT_ALL: 'DESELECT_ALL',
  SELECT_ALL: 'SELECT_ALL',
  SELECT_TRACK: 'SELECT_TRACK',
  
  // Clipboard
  COPY_CLIPS: 'COPY_CLIPS',
  CUT_CLIPS: 'CUT_CLIPS',
  PASTE_CLIPS: 'PASTE_CLIPS',
  
  // History
  UNDO: 'UNDO',
  REDO: 'REDO',
  SAVE_SNAPSHOT: 'SAVE_SNAPSHOT',
  CLEAR_HISTORY: 'CLEAR_HISTORY',
  
  // Playback
  PLAY: 'PLAY',
  PAUSE: 'PAUSE',
  STOP: 'STOP',
  SET_PLAYBACK_SPEED: 'SET_PLAYBACK_SPEED',
  TOGGLE_LOOP: 'TOGGLE_LOOP',
  SET_VOLUME: 'SET_VOLUME',
  TOGGLE_MUTE: 'TOGGLE_MUTE',
  
  // View
  TOGGLE_WAVEFORMS: 'TOGGLE_WAVEFORMS',
  TOGGLE_THUMBNAILS: 'TOGGLE_THUMBNAILS',
  TOGGLE_KEYFRAMES: 'TOGGLE_KEYFRAMES',
  SET_PREVIEW_QUALITY: 'SET_PREVIEW_QUALITY',
  
  // Audio
  UPDATE_CLIP_AUDIO: 'UPDATE_CLIP_AUDIO',
  SET_MASTER_VOLUME: 'SET_MASTER_VOLUME',
  
  // Speed
  SET_CLIP_SPEED: 'SET_CLIP_SPEED',
  
  // Multicam
  CREATE_MULTICAM: 'CREATE_MULTICAM',
  SWITCH_MULTICAM_ANGLE: 'SWITCH_MULTICAM_ANGLE'
};

// Helper: Calculate timeline duration
function calculateDuration(tracks) {
  let maxEnd = 0;
  tracks.forEach(track => {
    track.clips?.forEach(clip => {
      const clipEnd = clip.start + clip.duration;
      if (clipEnd > maxEnd) maxEnd = clipEnd;
    });
  });
  return maxEnd;
}

// Helper: Save state to history
function saveToHistory(state) {
  const { history, ...stateWithoutHistory } = state;
  const snapshot = JSON.parse(JSON.stringify(stateWithoutHistory));
  
  return {
    ...history,
    past: [...history.past.slice(-(history.maxStates - 1)), snapshot],
    future: []
  };
}

// Main Reducer
export function projectReducer(state, action) {
  switch (action.type) {
    // === PROJECT ===
    case ActionTypes.SET_PROJECT:
      return { ...state, ...action.payload, modifiedAt: Date.now() };
      
    case ActionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
        modifiedAt: Date.now()
      };
      
    case ActionTypes.RESET_PROJECT:
      return action.payload; // New initial state
      
    // === TIMELINE ===
    case ActionTypes.SET_PLAYHEAD:
      return {
        ...state,
        timeline: { ...state.timeline, playhead: Math.max(0, action.payload) }
      };
      
    case ActionTypes.SET_IN_POINT:
      return {
        ...state,
        timeline: { ...state.timeline, inPoint: action.payload }
      };
      
    case ActionTypes.SET_OUT_POINT:
      return {
        ...state,
        timeline: { ...state.timeline, outPoint: action.payload }
      };
      
    case ActionTypes.CLEAR_IN_OUT:
      return {
        ...state,
        timeline: { ...state.timeline, inPoint: null, outPoint: null }
      };
      
    case ActionTypes.SET_ZOOM:
      return {
        ...state,
        timeline: { ...state.timeline, zoom: Math.max(0.1, Math.min(10, action.payload)) }
      };
      
    case ActionTypes.TOGGLE_SNAPPING:
      return {
        ...state,
        timeline: { ...state.timeline, snapping: !state.timeline.snapping }
      };
      
    case ActionTypes.TOGGLE_RIPPLE:
      return {
        ...state,
        timeline: { ...state.timeline, rippleMode: !state.timeline.rippleMode }
      };
      
    // === TRACKS ===
    case ActionTypes.ADD_TRACK: {
      const newTrack = {
        id: `track_${Date.now()}`,
        name: action.payload.name || `Track ${state.tracks.length + 1}`,
        type: action.payload.type,
        locked: false,
        visible: true,
        muted: false,
        solo: false,
        height: action.payload.type === 'audio' ? 60 : 80,
        clips: []
      };
      
      const insertIndex = action.payload.index ?? state.tracks.length;
      const newTracks = [...state.tracks];
      newTracks.splice(insertIndex, 0, newTrack);
      
      return {
        ...state,
        tracks: newTracks,
        history: saveToHistory(state),
        modifiedAt: Date.now()
      };
    }
    
    case ActionTypes.REMOVE_TRACK:
      return {
        ...state,
        tracks: state.tracks.filter(t => t.id !== action.payload),
        history: saveToHistory(state),
        modifiedAt: Date.now()
      };
      
    case ActionTypes.UPDATE_TRACK:
      return {
        ...state,
        tracks: state.tracks.map(t =>
          t.id === action.payload.trackId
            ? { ...t, ...action.payload.updates }
            : t
        ),
        modifiedAt: Date.now()
      };
      
    case ActionTypes.TOGGLE_TRACK_LOCK:
      return {
        ...state,
        tracks: state.tracks.map(t =>
          t.id === action.payload ? { ...t, locked: !t.locked } : t
        )
      };
      
    case ActionTypes.TOGGLE_TRACK_MUTE:
      return {
        ...state,
        tracks: state.tracks.map(t =>
          t.id === action.payload ? { ...t, muted: !t.muted } : t
        )
      };
      
    case ActionTypes.TOGGLE_TRACK_SOLO:
      return {
        ...state,
        tracks: state.tracks.map(t =>
          t.id === action.payload ? { ...t, solo: !t.solo } : t
        )
      };
      
    // === CLIPS ===
    case ActionTypes.ADD_CLIP: {
      const { trackId, clip } = action.payload;
      const newClip = createClip(clip.type, clip);
      
      return {
        ...state,
        tracks: state.tracks.map(t =>
          t.id === trackId
            ? { ...t, clips: [...(t.clips || []), newClip] }
            : t
        ),
        timeline: {
          ...state.timeline,
          duration: calculateDuration(state.tracks)
        },
        history: saveToHistory(state),
        modifiedAt: Date.now()
      };
    }
    
    case ActionTypes.REMOVE_CLIP: {
      const { clipId } = action.payload;
      return {
        ...state,
        tracks: state.tracks.map(t => ({
          ...t,
          clips: t.clips?.filter(c => c.id !== clipId) || []
        })),
        selection: {
          ...state.selection,
          clips: state.selection.clips.filter(id => id !== clipId)
        },
        history: saveToHistory(state),
        modifiedAt: Date.now()
      };
    }
    
    case ActionTypes.UPDATE_CLIP: {
      const { clipId, updates } = action.payload;
      return {
        ...state,
        tracks: state.tracks.map(t => ({
          ...t,
          clips: t.clips?.map(c =>
            c.id === clipId ? { ...c, ...updates, modifiedAt: Date.now() } : c
          ) || []
        })),
        modifiedAt: Date.now()
      };
    }
    
    case ActionTypes.MOVE_CLIP: {
      const { clipId, targetTrackId, newStart } = action.payload;
      let clipToMove = null;
      let sourceTrackId = null;
      
      // Find and remove clip from source track
      state.tracks.forEach(t => {
        const clip = t.clips?.find(c => c.id === clipId);
        if (clip) {
          clipToMove = { ...clip, start: newStart };
          sourceTrackId = t.id;
        }
      });
      
      if (!clipToMove) return state;
      
      return {
        ...state,
        tracks: state.tracks.map(t => {
          if (t.id === sourceTrackId && sourceTrackId !== targetTrackId) {
            return { ...t, clips: t.clips.filter(c => c.id !== clipId) };
          }
          if (t.id === targetTrackId) {
            if (sourceTrackId === targetTrackId) {
              return {
                ...t,
                clips: t.clips.map(c => c.id === clipId ? clipToMove : c)
              };
            }
            return { ...t, clips: [...(t.clips || []), clipToMove] };
          }
          return t;
        }),
        history: saveToHistory(state),
        modifiedAt: Date.now()
      };
    }
    
    case ActionTypes.SPLIT_CLIP: {
      const { clipId, splitTime } = action.payload;
      
      return {
        ...state,
        tracks: state.tracks.map(t => {
          const clipIndex = t.clips?.findIndex(c => c.id === clipId);
          if (clipIndex === -1 || clipIndex === undefined) return t;
          
          const clip = t.clips[clipIndex];
          const relativeTime = splitTime - clip.start;
          
          if (relativeTime <= 0 || relativeTime >= clip.duration) return t;
          
          const clipA = {
            ...clip,
            id: `${clip.id}_a`,
            duration: relativeTime,
            sourceOut: clip.sourceIn + relativeTime
          };
          
          const clipB = {
            ...clip,
            id: `${clip.id}_b`,
            start: splitTime,
            duration: clip.duration - relativeTime,
            sourceIn: clip.sourceIn + relativeTime
          };
          
          const newClips = [...t.clips];
          newClips.splice(clipIndex, 1, clipA, clipB);
          
          return { ...t, clips: newClips };
        }),
        history: saveToHistory(state),
        modifiedAt: Date.now()
      };
    }
    
    case ActionTypes.RIPPLE_DELETE: {
      const { clipId } = action.payload;
      let deletedClip = null;
      let deletedTrackId = null;
      
      // Find clip
      state.tracks.forEach(t => {
        const clip = t.clips?.find(c => c.id === clipId);
        if (clip) {
          deletedClip = clip;
          deletedTrackId = t.id;
        }
      });
      
      if (!deletedClip) return state;
      
      const rippleAmount = deletedClip.duration;
      
      return {
        ...state,
        tracks: state.tracks.map(t => {
          if (t.id !== deletedTrackId) return t;
          
          return {
            ...t,
            clips: t.clips
              .filter(c => c.id !== clipId)
              .map(c => {
                if (c.start > deletedClip.start) {
                  return { ...c, start: c.start - rippleAmount };
                }
                return c;
              })
          };
        }),
        history: saveToHistory(state),
        modifiedAt: Date.now()
      };
    }
    
    // === KEYFRAMES ===
    case ActionTypes.ADD_KEYFRAME: {
      const { clipId, property, time, value, easing } = action.payload;
      
      return {
        ...state,
        tracks: state.tracks.map(t => ({
          ...t,
          clips: t.clips?.map(c => {
            if (c.id !== clipId) return c;
            
            const keyframes = { ...c.keyframes };
            if (!keyframes[property]) keyframes[property] = [];
            
            keyframes[property] = [
              ...keyframes[property].filter(k => k.time !== time),
              { time, value, easing: easing || 'easeInOut' }
            ].sort((a, b) => a.time - b.time);
            
            return { ...c, keyframes };
          }) || []
        })),
        modifiedAt: Date.now()
      };
    }
    
    case ActionTypes.REMOVE_KEYFRAME: {
      const { clipId, property, time } = action.payload;
      
      return {
        ...state,
        tracks: state.tracks.map(t => ({
          ...t,
          clips: t.clips?.map(c => {
            if (c.id !== clipId) return c;
            
            const keyframes = { ...c.keyframes };
            if (keyframes[property]) {
              keyframes[property] = keyframes[property].filter(k => k.time !== time);
            }
            
            return { ...c, keyframes };
          }) || []
        })),
        modifiedAt: Date.now()
      };
    }
    
    // === EFFECTS ===
    case ActionTypes.ADD_EFFECT: {
      const { clipId, effect } = action.payload;
      const newEffect = createEffect(effect.type, effect);
      
      return {
        ...state,
        tracks: state.tracks.map(t => ({
          ...t,
          clips: t.clips?.map(c =>
            c.id === clipId
              ? { ...c, effects: [...(c.effects || []), newEffect] }
              : c
          ) || []
        })),
        history: saveToHistory(state),
        modifiedAt: Date.now()
      };
    }
    
    case ActionTypes.REMOVE_EFFECT: {
      const { clipId, effectId } = action.payload;
      
      return {
        ...state,
        tracks: state.tracks.map(t => ({
          ...t,
          clips: t.clips?.map(c =>
            c.id === clipId
              ? { ...c, effects: c.effects?.filter(e => e.id !== effectId) || [] }
              : c
          ) || []
        })),
        history: saveToHistory(state),
        modifiedAt: Date.now()
      };
    }
    
    // === TRANSITIONS ===
    case ActionTypes.ADD_TRANSITION: {
      const { clipId, position, transition } = action.payload;
      const newTransition = createTransition(transition.type, transition);
      
      return {
        ...state,
        tracks: state.tracks.map(t => ({
          ...t,
          clips: t.clips?.map(c =>
            c.id === clipId
              ? {
                  ...c,
                  [position === 'in' ? 'transitionIn' : 'transitionOut']: newTransition
                }
              : c
          ) || []
        })),
        history: saveToHistory(state),
        modifiedAt: Date.now()
      };
    }
    
    // === ASSETS ===
    case ActionTypes.ADD_ASSET: {
      const newAsset = createAsset(action.payload.type, action.payload);
      return {
        ...state,
        assets: [...state.assets, newAsset],
        modifiedAt: Date.now()
      };
    }
    
    case ActionTypes.REMOVE_ASSET:
      return {
        ...state,
        assets: state.assets.filter(a => a.id !== action.payload),
        modifiedAt: Date.now()
      };
      
    case ActionTypes.UPDATE_ASSET:
      return {
        ...state,
        assets: state.assets.map(a =>
          a.id === action.payload.assetId
            ? { ...a, ...action.payload.updates, modifiedAt: Date.now() }
            : a
        ),
        modifiedAt: Date.now()
      };
    
    // === MARKERS ===
    case ActionTypes.ADD_MARKER: {
      const newMarker = createMarker(action.payload);
      return {
        ...state,
        markers: [...state.markers, newMarker].sort((a, b) => a.time - b.time),
        modifiedAt: Date.now()
      };
    }
    
    case ActionTypes.REMOVE_MARKER:
      return {
        ...state,
        markers: state.markers.filter(m => m.id !== action.payload),
        modifiedAt: Date.now()
      };
    
    // === SELECTION ===
    case ActionTypes.SELECT_CLIPS:
      return {
        ...state,
        selection: {
          ...state.selection,
          clips: action.payload.add
            ? [...new Set([...state.selection.clips, ...action.payload.clipIds])]
            : action.payload.clipIds
        }
      };
      
    case ActionTypes.DESELECT_ALL:
      return {
        ...state,
        selection: { clips: [], tracks: [], markers: [] }
      };
    
    // === CLIPBOARD ===
    case ActionTypes.COPY_CLIPS: {
      const clipsToCopy = [];
      state.tracks.forEach(t => {
        t.clips?.forEach(c => {
          if (state.selection.clips.includes(c.id)) {
            clipsToCopy.push({ ...c, trackId: t.id });
          }
        });
      });
      return {
        ...state,
        clipboard: { ...state.clipboard, clips: clipsToCopy }
      };
    }
    
    case ActionTypes.PASTE_CLIPS: {
      const { pasteTime } = action.payload;
      if (!state.clipboard.clips.length) return state;
      
      const minStart = Math.min(...state.clipboard.clips.map(c => c.start));
      
      return {
        ...state,
        tracks: state.tracks.map(t => {
          const clipsForTrack = state.clipboard.clips
            .filter(c => c.trackId === t.id)
            .map(c => ({
              ...c,
              id: `${c.id}_paste_${Date.now()}`,
              start: pasteTime + (c.start - minStart)
            }));
          
          if (clipsForTrack.length === 0) return t;
          
          return {
            ...t,
            clips: [...(t.clips || []), ...clipsForTrack]
          };
        }),
        history: saveToHistory(state),
        modifiedAt: Date.now()
      };
    }
    
    // === HISTORY ===
    case ActionTypes.UNDO: {
      if (state.history.past.length === 0) return state;
      
      const previous = state.history.past[state.history.past.length - 1];
      const { history, ...currentState } = state;
      
      return {
        ...previous,
        history: {
          ...history,
          past: history.past.slice(0, -1),
          future: [currentState, ...history.future]
        }
      };
    }
    
    case ActionTypes.REDO: {
      if (state.history.future.length === 0) return state;
      
      const next = state.history.future[0];
      const { history, ...currentState } = state;
      
      return {
        ...next,
        history: {
          ...history,
          past: [...history.past, currentState],
          future: history.future.slice(1)
        }
      };
    }
    
    // === PLAYBACK ===
    case ActionTypes.PLAY:
      return { ...state, playback: { ...state.playback, playing: true } };
      
    case ActionTypes.PAUSE:
      return { ...state, playback: { ...state.playback, playing: false } };
      
    case ActionTypes.STOP:
      return {
        ...state,
        playback: { ...state.playback, playing: false },
        timeline: { ...state.timeline, playhead: 0 }
      };
      
    case ActionTypes.SET_PLAYBACK_SPEED:
      return {
        ...state,
        playback: { ...state.playback, speed: action.payload }
      };
    
    default:
      return state;
  }
}

export default projectReducer;
