/**
 * EditorLayout.jsx - Root Container für den Video-Editor
 * 
 * Zweck: Hauptlayout mit Grid-Struktur nach CapCut-Screenshot (PIXELGENAU)
 * - TopToolbar (44px hoch) - GEÄNDERT von 48px
 * - Content-Grid: LeftSidebar (200px) | Center (flex) | Inspector (280px) - GEÄNDERT
 * - TimelinePanel (280px hoch) - GEÄNDERT von 320px
 * 
 * Props:
 * @param {string} projectId - ID des aktuellen Projekts
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

import React, { useReducer, createContext, useContext } from 'react';
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

    case 'MOVE_CLIP': {
      const { clipId, trackId, newStart } = action.payload;
      return {
        ...state,
        tracks: state.tracks.map(track => {
          // Nur den spezifischen Track updaten
          if (trackId && track.id !== trackId) {
            return track;
          }
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

    default:
      return state;
  }
}

export default function EditorLayout({ projectId, onBackToDashboard }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const playhead = usePlayhead(state.fps);
  const { undo, redo, canUndo, canRedo, saveState } = useUndoRedo();
  const zoom = useTimelineZoom();

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
    zoom
  };

  return (
    <EditorContext.Provider value={contextValue}>
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans overflow-hidden">
        {/* Grid Layout: Top Toolbar + Content Area */}
        <div className="h-screen flex flex-col">

          {/* Top Toolbar - 44px hoch */}
          <TopToolbar onBackToDashboard={onBackToDashboard} />

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* Left + Center Column - Media Panel + Preview + Timeline */}
            <div className="flex-1 flex flex-col">
              {/* Upper Row: Media Panel (left) + Preview (right) - GENAU 50% */}
              <div className="flex-1 flex overflow-hidden">
                {/* Media Panel - linke Hälfte */}
                <div className="flex-1 bg-[var(--bg-panel)] border-r border-[var(--border-subtle)] p-4 overflow-y-auto">
                  <MediaInputPanel />
                </div>
                
                {/* Preview - rechte Hälfte */}
                <div className="flex-1 flex items-center justify-center bg-[var(--bg-main)] p-4">
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

              {/* Lower Row: Timeline - GENAU 50% (gleich wie Upper Row mit flex-1) */}
              <div className="flex-1 bg-[var(--bg-main)] overflow-hidden">
                <TimelinePanel />
              </div>
            </div>

            {/* Right Column - AI Chat - volle Höhe */}
            <div className="w-[280px] border-l border-[var(--border-subtle)]">
              <AIChat />
            </div>
          </div>
        </div>
      </div>
    </EditorContext.Provider>
  );
}

// Export Context Hook für Kind-Komponenten
export { EditorContext };
