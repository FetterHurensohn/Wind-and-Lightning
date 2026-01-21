/**
 * EditorLayout.jsx - Root Container für den Video-Editor
 * 
 * Zweck: Hauptlayout mit Grid-Struktur nach CapCut-Screenshot (PIXELGENAU)
 * - TopToolbar (44px hoch) - GEÄNDERT von 48px
 * - Content-Grid: LeftSidebar (200px) | Center (flex) | Inspector (280px) - GEÄNDERT
 * - TimelinePanel (280px hoch) - GEÄNDERT von 320px
 * 
 * Props:
 * @param {string} projectPath - Pfad zum aktuellen Projekt
 * @param {Function} onBackToDashboard - Callback für Zurück-Navigation
 * 
 * Context:
 * Stellt EditorContext bereit mit: state, dispatch, playhead, undo, redo, zoom
 * 
 * State-Management:
 * Wiederverwendet bestehenden reducer aus Editor.jsx mit:
 * - media, tracks, clips
 * - selectedClipId, selectedClipIds
 * - snapping, rippleMode, linkedPairs
 * - trackControls (mute/solo/lock)
 */

import React, { useReducer, createContext, useContext, useState, useEffect } from 'react';
import { usePlayhead } from '../../hooks/usePlayhead';
import { useUndoRedo } from '../../hooks/useUndoRedo';
import { useTimelineZoom } from '../../hooks/useTimelineZoom';
import { generateId } from '../../utils/helpers';

// Import neue Komponenten (werden noch erstellt)
import TopToolbar from './TopToolbar';
import LeftMediaSidebar from './LeftMediaSidebar';
import MediaInputPanel from './MediaInputPanel';
import PreviewPanel from '../PreviewPanel'; // Bestehende Komponente anpassen
import AIChat from './AIChat';
import TimelinePanel from './TimelinePanel';
import InspectorPanel from './InspectorPanel';
import KeyframeEditor from './KeyframeEditor';
import SpeedControl from './SpeedControl';
import TextEditor from './TextEditor';
import ExportDialog from './ExportDialog';
import TransitionPicker from './TransitionPicker';

// Editor Context
const EditorContext = createContext(null);

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within EditorLayout');
  }
  return context;
}

// Empty initial data for new projects
const DEMO_MEDIA = [];

const DEMO_TRACKS = [
  {
    id: 't2',
    name: 'Audio Track 1',
    type: 'audio',
    clips: []
  }
];

// Initial State
const initialState = {
  projectName: '0117',
  fps: 30,
  media: DEMO_MEDIA,
  tracks: DEMO_TRACKS,
  selectedClipId: null,
  selectedClipIds: [],
  snapping: true,
  rippleMode: false,
  linkedPairs: [],
  trackControls: {
    t2: { muted: false, solo: false, locked: false, height: 56 }
  },
  clipboard: null,
  projectDuration: 0
};

// Reducer (wiederverwendet Logic aus Editor.jsx)
function reducer(state, action) {
  switch (action.type) {
    case 'SET_PROJECT_NAME':
      return { ...state, projectName: action.payload };

    case 'ADD_MEDIA':
      return { ...state, media: [...state.media, action.payload] };

    case 'REMOVE_MEDIA':
      return { ...state, media: state.media.filter(m => m.id !== action.payload) };

    case 'ADD_CLIP': {
      const { trackId, clip } = action.payload;
      return {
        ...state,
        tracks: state.tracks.map(track =>
          track.id === trackId
            ? { ...track, clips: [...track.clips, clip] }
            : track
        )
      };
    }

    case 'ADD_CLIP_TO_TRACK': {
      const { trackId, clip } = action.payload;
      return {
        ...state,
        tracks: state.tracks.map(track =>
          track.id === trackId
            ? { ...track, clips: [...(track.clips || []), clip] }
            : track
        ),
        projectDuration: Math.max(
          state.projectDuration,
          clip.start + clip.duration
        )
      };
    }

    case 'ADD_TRACK': {
      const { track, position } = action.payload;
      const newTracks = [...state.tracks];
      // Füge Track an der angegebenen Position ein (über dem bestehenden Track)
      newTracks.splice(position, 0, track);
      return {
        ...state,
        tracks: newTracks,
        trackControls: {
          ...state.trackControls,
          [track.id]: { muted: false, solo: false, locked: false, height: 80 }
        }
      };
    }

    case 'UPDATE_TRACK': {
      const { trackId, updates } = action.payload;
      return {
        ...state,
        tracks: state.tracks.map(track =>
          track.id === trackId
            ? { ...track, ...updates }
            : track
        )
      };
    }

    case 'DELETE_TRACK': {
      const { trackId } = action.payload;
      return {
        ...state,
        tracks: state.tracks.filter(track => track.id !== trackId),
        // Deselektiere Clips auf diesem Track
        selectedClipId: state.tracks.find(t => t.id === trackId)?.clips?.some(c => c.id === state.selectedClipId)
          ? null
          : state.selectedClipId
      };
    }

    case 'MOVE_CLIP': {
      const { clipId, trackId, newStart } = action.payload;
      
      return {
        ...state,
        tracks: state.tracks.map(track => {
          // Nur den spezifischen Track updaten
          if (trackId && track.id !== trackId) {
            return track;
          }
          
          // Finde den bewegten Clip
          const movingClip = track.clips.find(c => c.id === clipId);
          if (!movingClip) return track;
          
          const movingClipEnd = newStart + movingClip.duration;
          
          // Finde Clips, die mit der neuen Position kollidieren
          const collidingClips = track.clips.filter(c => {
            if (c.id === clipId) return false;
            const clipEnd = c.start + c.duration;
            // Prüfe auf Überlappung
            return (newStart < clipEnd && movingClipEnd > c.start);
          });
          
          // Wenn Kollision, tausche Positionen
          if (collidingClips.length > 0) {
            // Finde den Clip, mit dem wir am meisten überlappen
            const targetClip = collidingClips.reduce((max, c) => {
              const overlap = Math.min(movingClipEnd, c.start + c.duration) - Math.max(newStart, c.start);
              const maxOverlap = max ? Math.min(movingClipEnd, max.start + max.duration) - Math.max(newStart, max.start) : 0;
              return overlap > maxOverlap ? c : max;
            }, null);
            
            if (targetClip) {
              // Tausche Positionen
              const targetOldStart = targetClip.start;
              const movingOldStart = movingClip.start;
              
              return {
                ...track,
                clips: track.clips.map(clip => {
                  if (clip.id === clipId) {
                    // Der bewegte Clip geht zur Position des Ziel-Clips
                    return { ...clip, start: targetOldStart };
                  }
                  if (clip.id === targetClip.id) {
                    // Der Ziel-Clip geht zur alten Position des bewegten Clips
                    return { ...clip, start: movingOldStart };
                  }
                  return clip;
                })
              };
            }
          }
          
          // Keine Kollision - normale Bewegung
          return {
            ...track,
            clips: track.clips.map(clip =>
              clip.id === clipId ? { ...clip, start: newStart } : clip
            )
          };
        })
      };
    }

    case 'MOVE_CLIP_BETWEEN_TRACKS': {
      const { clipId, sourceTrackId, targetTrackId, newStart } = action.payload;

      // Finde den Clip im Source Track
      const sourceTrack = state.tracks.find(t => t.id === sourceTrackId);
      if (!sourceTrack) return state;

      const clip = sourceTrack.clips.find(c => c.id === clipId);
      if (!clip) return state;

      // Erstelle aktualisierten Clip mit neuer Position
      const updatedClip = { ...clip, start: newStart };

      return {
        ...state,
        tracks: state.tracks.map(track => {
          if (track.id === sourceTrackId) {
            // Entferne Clip aus Source Track
            return {
              ...track,
              clips: track.clips.filter(c => c.id !== clipId)
            };
          } else if (track.id === targetTrackId) {
            // Füge Clip zu Target Track hinzu
            return {
              ...track,
              clips: [...track.clips, updatedClip]
            };
          }
          return track;
        }),
        projectDuration: Math.max(
          state.projectDuration,
          newStart + clip.duration
        )
      };
    }

    case 'REORDER_CLIPS_IN_MAIN_TRACK': {
      const { trackId, clipId, targetPosition } = action.payload;

      return {
        ...state,
        tracks: state.tracks.map(track => {
          if (track.id !== trackId) return track;

          // Finde den Clip
          const clipIndex = track.clips.findIndex(c => c.id === clipId);
          if (clipIndex === -1) return track;

          // Entferne Clip aus aktueller Position
          const clips = [...track.clips];
          const [movedClip] = clips.splice(clipIndex, 1);

          // Füge Clip an neuer Position ein
          clips.splice(targetPosition, 0, movedClip);

          // Berechne neue Start-Zeiten (lückenlos)
          let currentTime = 0;
          const reorderedClips = clips.map(clip => {
            const updatedClip = { ...clip, start: currentTime };
            currentTime += clip.duration;
            return updatedClip;
          });

          return {
            ...track,
            clips: reorderedClips
          };
        }),
        projectDuration: state.tracks
          .find(t => t.id === trackId)
          ?.clips.reduce((sum, c) => sum + c.duration, 0) || state.projectDuration
      };
    }

    case 'TRIM_CLIP': {
      const { clipId, newStart, newDuration } = action.payload;
      return {
        ...state,
        tracks: state.tracks.map(track => ({
          ...track,
          clips: track.clips.map(clip =>
            clip.id === clipId
              ? { ...clip, start: newStart, duration: newDuration }
              : clip
          )
        }))
      };
    }

    case 'UPDATE_CLIP_PROPS': {
      const { clipId, property, value } = action.payload;
      return {
        ...state,
        tracks: state.tracks.map(track => ({
          ...track,
          clips: track.clips.map(clip => {
            if (clip.id === clipId) {
              if (property === 'title') {
                return { ...clip, title: value };
              }
              return {
                ...clip,
                props: { ...clip.props, [property]: value }
              };
            }
            return clip;
          })
        }))
      };
    }

    case 'DELETE_CLIP': {
      const { clipId } = action.payload;
      return {
        ...state,
        tracks: state.tracks.map(track => ({
          ...track,
          clips: track.clips.filter(clip => clip.id !== clipId)
        })),
        selectedClipId: state.selectedClipId === clipId ? null : state.selectedClipId
      };
    }

    case 'SELECT_CLIP':
      return { ...state, selectedClipId: action.payload, selectedClipIds: action.payload ? [action.payload] : [] };

    case 'SELECT_CLIPS':
      return { ...state, selectedClipIds: action.payload, selectedClipId: action.payload[0] || null };

    case 'TOGGLE_SNAP':
      return { ...state, snapping: !state.snapping };

    case 'TOGGLE_RIPPLE':
      return { ...state, rippleMode: !state.rippleMode };

    case 'TOGGLE_MUTE': {
      const trackId = action.payload;
      return {
        ...state,
        trackControls: {
          ...state.trackControls,
          [trackId]: {
            ...state.trackControls[trackId],
            muted: !state.trackControls[trackId].muted
          }
        }
      };
    }

    case 'TOGGLE_SOLO': {
      const trackId = action.payload;
      return {
        ...state,
        trackControls: {
          ...state.trackControls,
          [trackId]: {
            ...state.trackControls[trackId],
            solo: !state.trackControls[trackId].solo
          }
        }
      };
    }

    case 'TOGGLE_LOCK': {
      const trackId = action.payload;
      return {
        ...state,
        trackControls: {
          ...state.trackControls,
          [trackId]: {
            ...state.trackControls[trackId],
            locked: !state.trackControls[trackId].locked
          }
        }
      };
    }

    case 'LOAD_PROJECT': {
      // Lade ALLE Timeline-Felder für vollständiges Wiederherstellen
      return {
        ...state,
        tracks: action.payload.tracks || [],
        projectDuration: action.payload.duration || action.payload.projectDuration || 0,
        selectedClipId: action.payload.selectedClipId || null,
        snapping: action.payload.snapping !== undefined ? action.payload.snapping : true,
        rippleMode: action.payload.rippleMode || false,
        trackControls: action.payload.trackControls || state.trackControls,
        zoom: action.payload.zoom || 1,
        scrollPosition: action.payload.scrollPosition || 0,
        playheadPosition: action.payload.playheadPosition || 0
      };
    }

    case 'LOAD_MEDIA':
      return {
        ...state,
        media: action.payload
      };

    case 'LOAD_ASSETS': {
      const assets = action.payload.map(asset => ({
        id: asset.uuid,
        uuid: asset.uuid,
        name: asset.filename,
        type: asset.type,
        duration: asset.duration,
        thumbnail: null,
        ...asset
      }));

      return {
        ...state,
        media: assets
      };
    }

    // SPLIT_CLIP - Teilt einen Clip an einer bestimmten Zeit
    case 'SPLIT_CLIP': {
      const { clipId, splitTime } = action.payload;
      
      return {
        ...state,
        tracks: state.tracks.map(track => {
          const clipIndex = track.clips?.findIndex(c => c.id === clipId);
          if (clipIndex === -1 || clipIndex === undefined) return track;
          
          const clip = track.clips[clipIndex];
          const relativeTime = splitTime - clip.start;
          
          // Prüfe ob Split-Zeit innerhalb des Clips liegt
          if (relativeTime <= 0 || relativeTime >= clip.duration) return track;
          
          // Erstelle zwei neue Clips
          const clipA = {
            ...clip,
            id: clip.id + '_a',
            duration: relativeTime,
          };
          
          const clipB = {
            ...clip,
            id: clip.id + '_b',
            start: splitTime,
            duration: clip.duration - relativeTime,
          };
          
          // Ersetze den Original-Clip durch die zwei neuen
          const newClips = [...track.clips];
          newClips.splice(clipIndex, 1, clipA, clipB);
          
          return { ...track, clips: newClips };
        })
      };
    }

    // UPDATE_CLIP_KEYFRAMES - Aktualisiert Keyframes eines Clips
    case 'UPDATE_CLIP_KEYFRAMES': {
      const { clipId, keyframes } = action.payload;
      return {
        ...state,
        tracks: state.tracks.map(track => ({
          ...track,
          clips: track.clips?.map(clip =>
            clip.id === clipId
              ? { ...clip, keyframes }
              : clip
          ) || []
        }))
      };
    }

    // ADD_EFFECT_TO_CLIP - Fügt einen Effekt zu einem Clip hinzu
    case 'ADD_EFFECT_TO_CLIP': {
      const { clipId, effect } = action.payload;
      return {
        ...state,
        tracks: state.tracks.map(track => ({
          ...track,
          clips: track.clips?.map(clip => {
            if (clip.id !== clipId) return clip;
            const existingEffects = clip.effects || [];
            // Prüfe ob Effekt bereits existiert
            const effectExists = existingEffects.some(e => e.id === effect.id);
            if (effectExists) {
              // Ersetze existierenden Effekt
              return {
                ...clip,
                effects: existingEffects.map(e => e.id === effect.id ? effect : e)
              };
            }
            // Füge neuen Effekt hinzu
            return {
              ...clip,
              effects: [...existingEffects, effect]
            };
          }) || []
        }))
      };
    }

    // REMOVE_EFFECT_FROM_CLIP - Entfernt einen Effekt von einem Clip
    case 'REMOVE_EFFECT_FROM_CLIP': {
      const { clipId, effectId } = action.payload;
      return {
        ...state,
        tracks: state.tracks.map(track => ({
          ...track,
          clips: track.clips?.map(clip => {
            if (clip.id !== clipId) return clip;
            return {
              ...clip,
              effects: (clip.effects || []).filter(e => e.id !== effectId)
            };
          }) || []
        }))
      };
    }

    // ADD_TRANSITION_TO_CLIP - Fügt einen Übergang zu einem Clip hinzu
    case 'ADD_TRANSITION_TO_CLIP': {
      const { clipId, transition } = action.payload;
      return {
        ...state,
        tracks: state.tracks.map(track => ({
          ...track,
          clips: track.clips?.map(clip => {
            if (clip.id !== clipId) return clip;
            return {
              ...clip,
              transition: transition // Übergang am Ende des Clips
            };
          }) || []
        }))
      };
    }

    // REMOVE_TRANSITION_FROM_CLIP - Entfernt einen Übergang von einem Clip
    case 'REMOVE_TRANSITION_FROM_CLIP': {
      const { clipId } = action.payload;
      return {
        ...state,
        tracks: state.tracks.map(track => ({
          ...track,
          clips: track.clips?.map(clip => {
            if (clip.id !== clipId) return clip;
            const { transition, ...rest } = clip;
            return rest;
          }) || []
        }))
      };
    }

    // UPDATE_CLIP_SPEED - Aktualisiert Geschwindigkeitseinstellungen
    case 'UPDATE_CLIP_SPEED': {
      const { clipId, speedData } = action.payload;
      return {
        ...state,
        tracks: state.tracks.map(track => ({
          ...track,
          clips: track.clips?.map(clip => {
            if (clip.id !== clipId) return clip;
            
            const originalDuration = clip.originalDuration || clip.duration;
            const newDuration = originalDuration / speedData.speed;
            
            return {
              ...clip,
              duration: newDuration,
              originalDuration: originalDuration,
              props: {
                ...clip.props,
                speed: speedData.speed,
                reverse: speedData.reverse,
                smoothSlowMo: speedData.smoothSlowMo,
                speedCurve: speedData.speedCurve,
              }
            };
          }) || []
        }))
      };
    }

    // ADD_TEXT_CLIP - Fügt einen Text-Clip hinzu
    case 'ADD_TEXT_CLIP': {
      const { trackId, textData, start } = action.payload;
      
      const textClip = {
        id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'text',
        title: textData.text.substring(0, 20) + '...',
        text: textData.text,
        style: textData.style,
        start: start || 0,
        duration: textData.duration || 5,
        props: {
          opacity: 100,
          scale: 100,
          rotation: 0,
          posX: 0,
          posY: 0,
        }
      };
      
      // Finde oder erstelle einen Video-Track für Text
      let targetTrackId = trackId;
      if (!targetTrackId) {
        const videoTrack = state.tracks.find(t => t.type === 'video');
        if (videoTrack) {
          targetTrackId = videoTrack.id;
        } else {
          // Erstelle neuen Track für Text
          const newTrackId = `vt${Date.now()}`;
          return {
            ...state,
            tracks: [
              {
                id: newTrackId,
                name: 'Text Track',
                type: 'video',
                clips: [textClip]
              },
              ...state.tracks
            ],
            trackControls: {
              ...state.trackControls,
              [newTrackId]: { muted: false, solo: false, locked: false, height: 80 }
            }
          };
        }
      }
      
      return {
        ...state,
        tracks: state.tracks.map(track =>
          track.id === targetTrackId
            ? { ...track, clips: [...(track.clips || []), textClip] }
            : track
        )
      };
    }

    // ADD_TRANSITION - Fügt einen Übergang zwischen Clips hinzu
    case 'ADD_TRANSITION': {
      const { clipAId, clipBId, transition } = action.payload;
      return {
        ...state,
        tracks: state.tracks.map(track => ({
          ...track,
          clips: track.clips?.map(clip => {
            if (clip.id === clipAId) {
              return { ...clip, transitionOut: transition };
            }
            if (clip.id === clipBId) {
              return { ...clip, transitionIn: transition };
            }
            return clip;
          }) || []
        }))
      };
    }

    // COPY_CLIPS - Kopiert ausgewählte Clips in Clipboard
    case 'COPY_CLIPS': {
      const clipsToCopy = [];
      state.tracks.forEach(track => {
        track.clips?.forEach(clip => {
          if (state.selectedClipIds.includes(clip.id)) {
            clipsToCopy.push({ ...clip, trackId: track.id });
          }
        });
      });
      return { ...state, clipboard: clipsToCopy };
    }

    // PASTE_CLIPS - Fügt Clips aus Clipboard ein
    case 'PASTE_CLIPS': {
      const { pasteTime } = action.payload;
      if (!state.clipboard || state.clipboard.length === 0) return state;
      
      const minStart = Math.min(...state.clipboard.map(c => c.start));
      const newClips = state.clipboard.map(clip => ({
        ...clip,
        id: `${clip.id}_paste_${Date.now()}`,
        start: pasteTime + (clip.start - minStart)
      }));
      
      return {
        ...state,
        tracks: state.tracks.map(track => {
          const clipsForTrack = newClips.filter(c => c.trackId === track.id);
          if (clipsForTrack.length === 0) return track;
          
          return {
            ...track,
            clips: [...(track.clips || []), ...clipsForTrack.map(({ trackId, ...clip }) => clip)]
          };
        })
      };
    }

    default:
      return state;
  }
}

export default function EditorLayout({ projectPath, onBackToDashboard }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Project State
  const [currentProjectPath, setCurrentProjectPath] = useState(null);
  const [projectManifest, setProjectManifest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState('media'); // 'media', 'audio', 'text', etc.

  // Dialog States für neue Komponenten
  const [showKeyframeEditor, setShowKeyframeEditor] = useState(false);
  const [keyframeClip, setKeyframeClip] = useState(null);
  const [showSpeedControl, setShowSpeedControl] = useState(false);
  const [speedClip, setSpeedClip] = useState(null);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [textClip, setTextClip] = useState(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showTransitionPicker, setShowTransitionPicker] = useState(false);
  const [transitionClips, setTransitionClips] = useState({ clipA: null, clipB: null });
  const [showInspector, setShowInspector] = useState(true);

  const playhead = usePlayhead(state.fps);
  const { undo, redo, canUndo, canRedo, saveState } = useUndoRedo();
  const zoom = useTimelineZoom();

  // Handler für Dialoge
  const handleOpenKeyframes = (clip) => {
    setKeyframeClip(clip);
    setShowKeyframeEditor(true);
  };

  const handleOpenSpeed = (clip) => {
    setSpeedClip(clip);
    setShowSpeedControl(true);
  };

  const handleOpenText = (clip) => {
    setTextClip(clip);
    setShowTextEditor(true);
  };

  const handleUpdateKeyframes = (keyframes) => {
    if (keyframeClip) {
      dispatch({
        type: 'UPDATE_CLIP_KEYFRAMES',
        payload: { clipId: keyframeClip.id, keyframes }
      });
    }
  };

  const handleSpeedChange = (speedData) => {
    if (speedClip) {
      dispatch({
        type: 'UPDATE_CLIP_SPEED',
        payload: { clipId: speedClip.id, speedData }
      });
    }
  };

  const handleAddText = (textData) => {
    dispatch({
      type: 'ADD_TEXT_CLIP',
      payload: { textData, start: playhead.currentTime }
    });
    setShowTextEditor(false);
  };

  const handleExport = (exportSettings) => {
    console.log('Export with settings:', exportSettings);
    // Hier würde der tatsächliche Export stattfinden
    setShowExportDialog(false);
  };

  const handleApplyTransition = (transition) => {
    if (transitionClips.clipA && transitionClips.clipB) {
      dispatch({
        type: 'ADD_TRANSITION',
        payload: {
          clipAId: transitionClips.clipA.id,
          clipBId: transitionClips.clipB.id,
          transition
        }
      });
    }
    setShowTransitionPicker(false);
  };

  // Load Project Function
  const loadProject = async (projectPath) => {
    console.log('[EditorLayout] Loading project:', projectPath);
    setLoading(true);

    try {
      // 1. Öffne Projekt mit Lock
      const openResult = await window.electronAPI.projectAPI.open(projectPath);

      if (!openResult.success) {
        if (openResult.locked) {
          const lockMsg = `Projekt ist bereits geöffnet von ${openResult.lockInfo.user} auf ${openResult.lockInfo.hostname}`;
          console.error('[EditorLayout] Project locked:', lockMsg);
          alert(lockMsg);
          onBackToDashboard();
          return;
        }
        console.error('[EditorLayout] Failed to open project:', openResult.error);
        alert('Projekt konnte nicht geöffnet werden: ' + openResult.error);
        onBackToDashboard();
        return;
      }

      setCurrentProjectPath(projectPath);
      setProjectManifest(openResult.manifest);

      // 2. Lade Timeline mit allen Feldern
      const timelineResult = await window.electronAPI.timelineAPI.load(projectPath);

      if (timelineResult.success) {
        const timeline = timelineResult.timeline;

        // Dispatch vollständigen Timeline-State
        dispatch({
          type: 'LOAD_PROJECT',
          payload: {
            tracks: timeline.tracks || [],
            duration: timeline.duration || 0,
            projectDuration: timeline.duration || 0,
            selectedClipId: timeline.selectedClipId || null,
            snapping: timeline.snapping !== undefined ? timeline.snapping : true,
            rippleMode: timeline.rippleMode || false,
            trackControls: timeline.trackControls || {},
            zoom: timeline.zoom || 1,
            scrollPosition: timeline.scrollPosition || 0,
            playheadPosition: timeline.playheadPosition || 0
          }
        });

        // 3. Lade Assets und konvertiere zu Media-Format
        const assetsResult = await window.electronAPI.assetAPI.list(projectPath);
        if (assetsResult.success && assetsResult.assets) {
          const assetsIndex = assetsResult.assets;

          // Konvertiere Assets zu Media-Format
          const mediaItems = Object.entries(assetsIndex).map(([uuid, asset]) => ({
            id: uuid,
            name: asset.filename,
            type: asset.type, // 'video', 'audio', 'image'
            duration: asset.metadata?.duration || 0,
            thumbnail: asset.thumbnail || null,
            path: asset.original_path,
            assetUUID: uuid
          }));

          dispatch({ type: 'LOAD_MEDIA', payload: mediaItems });
          console.log('[EditorLayout] Loaded', mediaItems.length, 'media items');
        }
      } else {
        console.warn('[EditorLayout] Failed to load timeline:', timelineResult.error);
        // Continue with empty timeline
      }

      // 3. Lade Assets
      const assetsResult = await window.electronAPI.assetAPI.list(projectPath);

      if (assetsResult.success) {
        dispatch({ type: 'LOAD_ASSETS', payload: assetsResult.assets });
      } else {
        console.warn('[EditorLayout] Failed to load assets:', assetsResult.error);
        // Continue with no assets
      }

      console.log('[EditorLayout] Project loaded successfully');
    } catch (error) {
      console.error('[EditorLayout] Error loading project:', error);
      alert('Fehler beim Laden des Projekts: ' + error.message);
      onBackToDashboard();
    } finally {
      setLoading(false);
    }
  };

  // Save Project Function
  const saveProject = async (createSnapshot = true) => {
    if (!currentProjectPath) {
      console.warn('[EditorLayout] No project path, cannot save');
      return false;
    }

    try {
      // Vollständiger Timeline-State für Persistierung
      const timelineState = {
        tracks: state.tracks,
        projectDuration: state.projectDuration,
        selectedClipId: state.selectedClipId,
        snapping: state.snapping,
        rippleMode: state.rippleMode,
        trackControls: state.trackControls,
        zoom: state.zoom || 1,
        scrollPosition: state.scrollPosition || 0,
        playheadPosition: state.playheadPosition || 0
      };

      const result = await window.electronAPI.timelineAPI.save(
        currentProjectPath,
        timelineState,
        createSnapshot
      );

      if (result.success) {
        console.log('[EditorLayout] Project saved successfully at', result.savedAt);
        return true;
      } else {
        console.error('[EditorLayout] Save failed:', result.error);
        alert('Speichern fehlgeschlagen: ' + result.error);
        return false;
      }
    } catch (error) {
      console.error('[EditorLayout] Error saving project:', error);
      alert('Fehler beim Speichern: ' + error.message);
      return false;
    }
  };

  // Save and Exit Function
  // Save and Exit Function
  const handleSaveAndExit = async () => {
    console.log('[EditorLayout] Save and exit initiated');

    // 1. Speichere Projekt
    const success = await saveProject(true);

    if (!success) {
      console.error('[EditorLayout] Save failed, not closing project');
      return;
    }

    // 2. Schließe Projekt in Electron (wichtig: Lock freigeben!)
    if (currentProjectPath && window.electronAPI?.projectAPI) {
      console.log('[EditorLayout] Closing project in Electron...');
      try {
        const closeResult = await window.electronAPI.projectAPI.close();
        if (closeResult.success) {
          console.log('[EditorLayout] Project closed successfully');
        } else {
          console.warn('[EditorLayout] Failed to close project:', closeResult.error);
        }
      } catch (error) {
        console.error('[EditorLayout] Error closing project:', error);
      }
    }

    // 3. Navigiere zurück zum Dashboard
    console.log('[EditorLayout] Navigating to dashboard');
    onBackToDashboard();
  };

  // Load project on mount
  useEffect(() => {
    if (projectPath && window.electronAPI?.projectAPI) {
      loadProject(projectPath);
    } else {
      setLoading(false);
    }
  }, [projectPath]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentProjectPath && window.electronAPI?.projectAPI) {
        window.electronAPI.projectAPI.close();
      }
    };
  }, [currentProjectPath]);

  // Auto-Save alle 5 Minuten
  useEffect(() => {
    if (!currentProjectPath) return;

    console.log('[EditorLayout] Auto-save enabled (5 minutes interval)');

    const autoSaveInterval = setInterval(() => {
      console.log('[EditorLayout] Auto-saving...');
      saveProject(false); // false = keine History-Snapshot erstellen
    }, 5 * 60 * 1000); // 5 Minuten

    return () => {
      console.log('[EditorLayout] Auto-save disabled');
      clearInterval(autoSaveInterval);
    };
  }, [currentProjectPath, state]);

  // Auto-Save every 5 minutes
  useEffect(() => {
    if (!currentProjectPath) return;

    const interval = setInterval(() => {
      console.log('[EditorLayout] Auto-saving...');
      saveProject(false);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [currentProjectPath, state]);

  // Context Value
  const contextValue = {
    state,
    dispatch,
    playhead,
    undo,
    redo,
    canUndo,
    canRedo,
    saveState,
    zoom,
    currentProjectPath,
    saveProject,
    handleSaveAndExit,
    activeMainTab,
    setActiveMainTab,
    // Neue Dialog-Handler
    handleOpenKeyframes,
    handleOpenSpeed,
    handleOpenText,
    setShowExportDialog,
    setShowTransitionPicker,
    setTransitionClips,
    showInspector,
    setShowInspector,
  };

  // Berechne Projektdauer
  const projectDuration = React.useMemo(() => {
    return state.tracks.reduce((max, track) => {
      const trackEnd = track.clips?.reduce((m, clip) => 
        Math.max(m, clip.start + clip.duration), 0) || 0;
      return Math.max(max, trackEnd);
    }, 180);
  }, [state.tracks]);

  return (
    <EditorContext.Provider value={contextValue}>
      {loading ? (
        <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-[var(--text)] text-lg">Projekt wird geladen...</div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans overflow-hidden">
          {/* Grid Layout: Top Toolbar + Content Area */}
          <div className="h-screen flex flex-col">

            {/* Top Toolbar - 44px hoch */}
            <TopToolbar 
              onBackToDashboard={onBackToDashboard}
              onExport={() => setShowExportDialog(true)}
            />

            {/* Main Content Area - Horizontal Layout */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Section: Media Panel + Preview + Timeline */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Upper Row: Media Panel + Preview (50% height) */}
                <div className="h-1/2 flex overflow-hidden border-b border-[var(--border-subtle)]">
                  {/* Media Panel - CapCut Style (schmaler) */}
                  <div className="w-[360px] bg-[var(--bg-panel)] border-r border-[var(--border-subtle)] overflow-hidden flex-shrink-0">
                    <MediaInputPanel />
                  </div>

                  {/* Preview - Center */}
                  <div className="flex-1 flex items-center justify-center bg-[var(--bg-main)] p-2 min-w-0">
                    <PreviewPanel
                      currentTime={playhead.currentTime}
                      playing={playhead.playing}
                      tracks={state.tracks}
                      media={state.media}
                      onSeek={playhead.seek}
                      fps={state.fps}
                    />
                  </div>
                </div>

                {/* Lower Row: Timeline (50% height) */}
                <div className="h-1/2 bg-[var(--bg-main)] overflow-hidden">
                  <TimelinePanel />
                </div>
              </div>

              {/* Right Panel - Inspector / AI Chat - VOLLE HÖHE */}
              <div className="w-[280px] border-l border-[var(--border-subtle)] flex flex-col flex-shrink-0">
                {/* Tab-Switcher */}
                <div className="h-9 flex border-b border-[var(--border-subtle)]">
                  <button
                    onClick={() => setShowInspector(true)}
                    className={`flex-1 text-xs font-medium transition-colors ${
                      showInspector 
                        ? 'text-[var(--accent-turquoise)] border-b-2 border-[var(--accent-turquoise)]' 
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Eigenschaften
                  </button>
                  <button
                    onClick={() => setShowInspector(false)}
                    className={`flex-1 text-xs font-medium transition-colors ${
                      !showInspector 
                        ? 'text-[var(--accent-turquoise)] border-b-2 border-[var(--accent-turquoise)]' 
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    KI-Assistent
                  </button>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-hidden">
                  {showInspector ? (
                    <InspectorPanel
                      onOpenKeyframes={handleOpenKeyframes}
                      onOpenSpeed={handleOpenSpeed}
                      onOpenText={handleOpenText}
                    />
                  ) : (
                    <AIChat />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modals & Dialogs */}
          
          {/* Keyframe Editor */}
          {showKeyframeEditor && keyframeClip && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
              <div className="animate-scaleIn">
                <KeyframeEditor
                  clip={keyframeClip}
                  currentTime={playhead.currentTime}
                  onUpdateKeyframes={handleUpdateKeyframes}
                  onClose={() => {
                    setShowKeyframeEditor(false);
                    setKeyframeClip(null);
                  }}
                />
              </div>
            </div>
          )}

          {/* Speed Control */}
          {showSpeedControl && speedClip && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
              <div className="animate-scaleIn">
                <SpeedControl
                  clip={speedClip}
                  onSpeedChange={handleSpeedChange}
                  onClose={() => {
                    setShowSpeedControl(false);
                    setSpeedClip(null);
                  }}
                />
              </div>
            </div>
          )}

          {/* Text Editor */}
          {showTextEditor && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
              <div className="animate-scaleIn w-[400px]">
                <TextEditor
                  clip={textClip}
                  onTextChange={(data) => {
                    if (textClip) {
                      dispatch({
                        type: 'UPDATE_CLIP',
                        payload: { clipId: textClip.id, ...data }
                      });
                    }
                  }}
                  onAddText={handleAddText}
                  onClose={() => {
                    setShowTextEditor(false);
                    setTextClip(null);
                  }}
                />
              </div>
            </div>
          )}

          {/* Export Dialog */}
          {showExportDialog && (
            <ExportDialog
              project={{ name: state.projectName, isPro: false }}
              duration={projectDuration}
              onExport={handleExport}
              onClose={() => setShowExportDialog(false)}
            />
          )}

          {/* Transition Picker */}
          {showTransitionPicker && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
              <div className="animate-scaleIn">
                <TransitionPicker
                  clipA={transitionClips.clipA}
                  clipB={transitionClips.clipB}
                  onApply={handleApplyTransition}
                  onClose={() => {
                    setShowTransitionPicker(false);
                    setTransitionClips({ clipA: null, clipB: null });
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </EditorContext.Provider>
  );
}

// Export Context Hook für Kind-Komponenten
export { EditorContext };
