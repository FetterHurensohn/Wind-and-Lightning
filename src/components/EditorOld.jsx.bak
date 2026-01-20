/**
 * Editor.jsx - Video-Editor Component
 * 
 * Der eigentliche Video-Editor (ehemals App.jsx)
 * Props: { projectId, onBackToDashboard }
 */

import React, { useEffect, useCallback, useState, useReducer } from 'react';
import VideoBar from './VideoBar';
import SidebarLeft from './SidebarLeft';
import PreviewPanel from './PreviewPanel';
import Timeline from './Timeline';
import Inspector from './Inspector';
import { usePlayhead } from '../hooks/usePlayhead';
import { useTimelineZoom } from '../hooks/useTimelineZoom';
import { generateId, findClipById } from '../utils/helpers';
import { splitClipAt, findClipsToSplit } from '../utils/split';
import { rippleDeleteClips, shiftLaterClips } from '../utils/ripple';
import { detachAudio, isClipLinked, findLinkedClipId, unlinkClip } from '../utils/link';
import { useUndoRedo } from '../hooks/useUndoRedo';
import { useMultiSelect } from '../hooks/useMultiSelect';
import { useClipboard } from '../hooks/useClipboard';
import TimelineToolbar from './TimelineToolbar';
import ContextMenuTimeline from './ContextMenuTimeline';
import TrackControls from './TrackControls';
import electronAPI from '../electron';

// Initial Demo Data
const DEMO_MEDIA = [
  { id: 'm1', name: 'imatchan002.jpg', type: 'image', duration: 5, thumbnail: 'placeholder' },
  { id: 'm2', name: 'Video Clip 1.mp4', type: 'video', duration: 10, thumbnail: 'placeholder' },
  { id: 'm3', name: 'Audio Track.mp3', type: 'audio', duration: 15, thumbnail: 'placeholder' }
];

const DEMO_TRACKS = [
  {
    id: 't1',
    name: 'Video Track 1',
    clips: [
      {
        id: 'c1',
        mediaId: 'm1',
        title: 'imatchan002.jpg',
        start: 0,
        duration: 5,
        thumbnail: 'placeholder',
        props: { opacity: 100, scale: 100, rotation: 0, aspectRatio: '16:9', resolution: '1080p', fps: 30, layer: 0, useProxy: false }
      },
      {
        id: 'c2',
        mediaId: 'm2',
        title: 'Video Clip 1.mp4',
        start: 6,
        duration: 8,
        thumbnail: 'placeholder',
        props: { opacity: 100, scale: 100, rotation: 0, aspectRatio: '16:9', resolution: '1080p', fps: 30, layer: 0, useProxy: false }
      }
    ]
  },
  {
    id: 't2',
    name: 'Track 2',
    clips: [
      {
        id: 'c3',
        mediaId: 'm3',
        title: 'Audio Track.mp3',
        start: 3,
        duration: 12,
        thumbnail: 'placeholder',
        props: { opacity: 80, scale: 100, rotation: 0, aspectRatio: '16:9', resolution: '1080p', fps: 30, layer: 0, useProxy: false }
      }
    ]
  }
];

// State Reducer
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
    t1: { muted: false, solo: false, locked: false, height: 80 },
    t2: { muted: false, solo: false, locked: false, height: 80 }
  },
  clipboard: null,
  projectDuration: 120
};

function reducer(state, action) {
  switch (action.type) {
    case 'RESET_PROJECT':
      return {
        ...initialState,
        projectName: 'Neues Projekt',
        media: [],
        tracks: [
          { id: generateId('t'), name: 'Video Track 1', clips: [], type: 'video' },
          { id: generateId('t'), name: 'Audio Track 1', clips: [], type: 'audio' }
        ]
      };

    case 'SET_PROJECT_NAME':
      return { ...state, projectName: action.payload };

    case 'ADD_MEDIA':
      return { ...state, media: [...state.media, action.payload] };

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

    case 'MOVE_CLIP': {
      const { clipId, newStart } = action.payload;
      return {
        ...state,
        tracks: state.tracks.map(track => ({
          ...track,
          clips: track.clips.map(clip =>
            clip.id === clipId ? { ...clip, start: newStart } : clip
          )
        }))
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

    case 'ADD_TRACK': {
      const { type } = action.payload;
      const newTrack = {
        id: generateId('t'),
        name: `${type === 'video' ? 'Video' : 'Audio'} Track ${state.tracks.length + 1}`,
        clips: [],
        type: type || 'video'
      };
      return {
        ...state,
        tracks: [...state.tracks, newTrack],
        trackControls: {
          ...state.trackControls,
          [newTrack.id]: { muted: false, solo: false, locked: false, height: 80 }
        }
      };
    }

    case 'UPDATE_TRACK_CONTROLS': {
      const { trackId, property, value } = action.payload;
      return {
        ...state,
        trackControls: {
          ...state.trackControls,
          [trackId]: {
            ...state.trackControls[trackId],
            [property]: value
          }
        }
      };
    }

    case 'SET_CLIPBOARD':
      return { ...state, clipboard: action.payload };

    case 'LINK_CLIPS': {
      const { clipId1, clipId2 } = action.payload;
      return {
        ...state,
        linkedPairs: [...state.linkedPairs, { clipId1, clipId2 }]
      };
    }

    case 'UNLINK_CLIP': {
      const { clipId } = action.payload;
      return {
        ...state,
        linkedPairs: state.linkedPairs.filter(
          pair => pair.clipId1 !== clipId && pair.clipId2 !== clipId
        )
      };
    }

    case 'SPLIT_CLIP': {
      const { clipId, splitTime, newClipId1, newClipId2 } = action.payload;
      return {
        ...state,
        tracks: state.tracks.map(track => {
          const clipIndex = track.clips.findIndex(c => c.id === clipId);
          if (clipIndex === -1) return track;
          
          const originalClip = track.clips[clipIndex];
          const clip1 = {
            ...originalClip,
            id: newClipId1,
            duration: splitTime - originalClip.start
          };
          const clip2 = {
            ...originalClip,
            id: newClipId2,
            start: splitTime,
            duration: originalClip.duration - (splitTime - originalClip.start)
          };
          
          const newClips = [...track.clips];
          newClips.splice(clipIndex, 1, clip1, clip2);
          
          return { ...track, clips: newClips };
        })
      };
    }

    case 'RIPPLE_DELETE': {
      const { clipIds } = action.payload;
      let newTracks = state.tracks;
      
      clipIds.forEach(clipId => {
        newTracks = rippleDeleteClips(newTracks, [clipId], state.rippleMode);
      });
      
      return {
        ...state,
        tracks: newTracks,
        selectedClipId: null,
        selectedClipIds: []
      };
    }

    case 'PASTE_CLIPS': {
      const { trackId, clips, startTime } = action.payload;
      return {
        ...state,
        tracks: state.tracks.map(track => {
          if (track.id === trackId) {
            const newClips = clips.map(clip => ({
              ...clip,
              id: generateId('c'),
              start: startTime + (clip.start - clips[0].start)
            }));
            return { ...track, clips: [...track.clips, ...newClips] };
          }
          return track;
        })
      };
    }

    default:
      return state;
  }
}

export default function Editor({ projectId, onBackToDashboard }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const playhead = usePlayhead(state.fps, state.projectDuration);
  const zoom = useTimelineZoom();
  const { undo, redo, pushState, canUndo, canRedo } = useUndoRedo(state, dispatch);
  const multiSelect = useMultiSelect();
  const clipboard = useClipboard();
  
  const [contextMenu, setContextMenu] = useState(null);
  const [openPanel, setOpenPanel] = useState('media');

  // Load project from localStorage based on projectId
  useEffect(() => {
    if (projectId) {
      const projects = JSON.parse(localStorage.getItem('capcut_dashboard_projects_v1') || '[]');
      const project = projects.find(p => p.id === projectId);
      if (project) {
        dispatch({ type: 'SET_PROJECT_NAME', payload: project.name });
        // Load project data if available
        if (project.tracks) {
          // TODO: Load full project state
        }
      }
    }
  }, [projectId]);

  // Handler functions (defined before useEffect hooks)
  const handleRename = useCallback((newName) => {
    dispatch({ type: 'SET_PROJECT_NAME', payload: newName });
    pushState(state);
  }, [state, pushState]);

  const handleImport = useCallback(async (files) => {
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const mediaItem = {
        id: generateId('m'),
        name: file.name || file,
        type: file.type?.startsWith('video') ? 'video' : file.type?.startsWith('audio') ? 'audio' : 'image',
        duration: 10,
        thumbnail: 'placeholder',
        path: file.path || file
      };
      dispatch({ type: 'ADD_MEDIA', payload: mediaItem });
    }
    pushState(state);
  }, [state, pushState]);

  const handleExport = useCallback(async () => {
    const projectData = {
      projectName: state.projectName,
      fps: state.fps,
      duration: state.projectDuration,
      tracks: state.tracks,
      media: state.media
    };

    if (electronAPI.env.isElectron) {
      try {
        await electronAPI.project.save(projectData);
        console.log('Project saved via Electron');
      } catch (err) {
        console.error('Export error:', err);
      }
    } else {
      const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${state.projectName}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [state]);

  const handleSplit = useCallback(() => {
    if (!state.selectedClipId) return;

    const clips = findClipsToSplit(state.tracks, playhead.currentTime);
    if (clips.length === 0) return;

    clips.forEach(({ clip }) => {
      const newClipId1 = generateId('c');
      const newClipId2 = generateId('c');
      dispatch({
        type: 'SPLIT_CLIP',
        payload: {
          clipId: clip.id,
          splitTime: playhead.currentTime,
          newClipId1,
          newClipId2
        }
      });
    });

    pushState(state);
  }, [state, playhead.currentTime, pushState]);

  const handleDelete = useCallback(() => {
    const idsToDelete = state.selectedClipIds.length > 0 
      ? state.selectedClipIds 
      : state.selectedClipId 
        ? [state.selectedClipId] 
        : [];

    if (idsToDelete.length === 0) return;

    dispatch({ type: 'RIPPLE_DELETE', payload: { clipIds: idsToDelete } });
    pushState(state);
  }, [state, pushState]);

  const handleOpenPanel = useCallback((panelName) => {
    setOpenPanel(panelName);
  }, []);

  // Electron menu event listeners
  useEffect(() => {
    if (electronAPI.env.isElectron) {
      electronAPI.menu.onNewProject(() => {
        dispatch({ type: 'RESET_PROJECT' });
      });

      electronAPI.menu.onSaveProject(async (path) => {
        const projectData = {
          projectName: state.projectName,
          fps: state.fps,
          duration: state.projectDuration,
          tracks: state.tracks,
          media: state.media
        };
        await electronAPI.fs.writeFile(path, JSON.stringify(projectData, null, 2));
      });

      electronAPI.menu.onExport(() => {
        handleExport();
      });

      electronAPI.menu.onMediaImport(async (filePaths) => {
        await handleImport(filePaths);
      });

      electronAPI.edit.onUndo(() => undo());
      electronAPI.edit.onRedo(() => redo());
      electronAPI.edit.onCut(() => {
        if (state.selectedClipIds.length > 0) {
          clipboard.cut(state.selectedClipIds, state.tracks);
        }
      });
      electronAPI.edit.onCopy(() => {
        if (state.selectedClipIds.length > 0) {
          clipboard.copy(state.selectedClipIds, state.tracks);
        }
      });
      electronAPI.edit.onPaste(() => {
        if (clipboard.hasClips()) {
          const firstTrack = state.tracks[0];
          dispatch({
            type: 'PASTE_CLIPS',
            payload: {
              trackId: firstTrack.id,
              clips: clipboard.getClips(),
              startTime: playhead.currentTime
            }
          });
        }
      });
      electronAPI.edit.onSplit(() => handleSplit());
      electronAPI.edit.onDelete(() => handleDelete());

      electronAPI.view.onZoomIn(() => zoom.zoomIn());
      electronAPI.view.onZoomOut(() => zoom.zoomOut());
      electronAPI.view.onZoomReset(() => zoom.setZoom(100));
    }
  }, [state, playhead, undo, redo, zoom, handleImport, handleExport, handleSplit, handleDelete, clipboard, dispatch]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--text)] flex flex-col">
      {/* Top Bar */}
      <VideoBar
        projectName={state.projectName}
        onRename={handleRename}
        onImport={handleImport}
        onExport={handleExport}
        onOpenPanel={handleOpenPanel}
        onBackToDashboard={onBackToDashboard}
      />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <SidebarLeft
          mediaList={state.media}
          onAddMedia={handleImport}
          activePanel={openPanel}
          onOpenPanel={handleOpenPanel}
        />

        {/* Center: Preview + Timeline */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <PreviewPanel
            currentTime={playhead.currentTime}
            playing={playhead.playing}
            selectedClip={state.selectedClipId ? findClipById(state.tracks, state.selectedClipId) : null}
            onSeek={playhead.seek}
          />

          <TimelineToolbar
            snapping={state.snapping}
            rippleMode={state.rippleMode}
            onToggleSnap={() => dispatch({ type: 'TOGGLE_SNAP' })}
            onToggleRipple={() => dispatch({ type: 'TOGGLE_RIPPLE' })}
            onAddTrack={(type) => dispatch({ type: 'ADD_TRACK', payload: { type } })}
            onSplit={handleSplit}
            onDelete={handleDelete}
            zoom={zoom.zoom}
            onZoomIn={zoom.zoomIn}
            onZoomOut={zoom.zoomOut}
          />

          <Timeline
            tracks={state.tracks}
            pxPerSec={zoom.pxPerSec}
            currentTime={playhead.currentTime}
            selectedClipId={state.selectedClipId}
            selectedClipIds={state.selectedClipIds}
            snapping={state.snapping}
            trackControls={state.trackControls}
            onMoveClip={(clipId, newStart) => {
              dispatch({ type: 'MOVE_CLIP', payload: { clipId, newStart } });
              pushState(state);
            }}
            onTrimClip={(clipId, newStart, newDuration) => {
              dispatch({ type: 'TRIM_CLIP', payload: { clipId, newStart, newDuration } });
              pushState(state);
            }}
            onSelectClip={(clipId, multi) => {
              if (multi) {
                const newSelection = state.selectedClipIds.includes(clipId)
                  ? state.selectedClipIds.filter(id => id !== clipId)
                  : [...state.selectedClipIds, clipId];
                dispatch({ type: 'SELECT_CLIPS', payload: newSelection });
              } else {
                dispatch({ type: 'SELECT_CLIP', payload: clipId });
              }
            }}
            onDropMedia={(mediaId, trackId, time) => {
              const media = state.media.find(m => m.id === mediaId);
              if (!media) return;

              const newClip = {
                id: generateId('c'),
                mediaId: media.id,
                title: media.name,
                start: time,
                duration: media.duration,
                thumbnail: media.thumbnail,
                props: {
                  opacity: 100,
                  scale: 100,
                  rotation: 0,
                  aspectRatio: '16:9',
                  resolution: '1080p',
                  fps: state.fps,
                  layer: 0,
                  useProxy: false
                }
              };

              dispatch({ type: 'ADD_CLIP', payload: { trackId, clip: newClip } });
              pushState(state);
            }}
            onContextMenu={(e, clipId) => {
              e.preventDefault();
              setContextMenu({
                x: e.clientX,
                y: e.clientY,
                clipId
              });
            }}
            onUpdateTrackControl={(trackId, property, value) => {
              dispatch({ type: 'UPDATE_TRACK_CONTROLS', payload: { trackId, property, value } });
            }}
          />
        </div>

        {/* Right Inspector */}
        <Inspector
          selectedClip={state.selectedClipId ? findClipById(state.tracks, state.selectedClipId) : null}
          onChangeClip={(property, value) => {
            if (state.selectedClipId) {
              dispatch({ type: 'UPDATE_CLIP_PROPS', payload: { clipId: state.selectedClipId, property, value } });
              pushState(state);
            }
          }}
          onDeleteClip={() => handleDelete()}
        />
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenuTimeline
          x={contextMenu.x}
          y={contextMenu.y}
          clipId={contextMenu.clipId}
          onClose={() => setContextMenu(null)}
          onCut={() => {
            clipboard.cut([contextMenu.clipId], state.tracks);
            dispatch({ type: 'DELETE_CLIP', payload: { clipId: contextMenu.clipId } });
            setContextMenu(null);
          }}
          onCopy={() => {
            clipboard.copy([contextMenu.clipId], state.tracks);
            setContextMenu(null);
          }}
          onDelete={() => {
            dispatch({ type: 'DELETE_CLIP', payload: { clipId: contextMenu.clipId } });
            setContextMenu(null);
          }}
          onDuplicate={() => {
            const clip = findClipById(state.tracks, contextMenu.clipId);
            if (clip) {
              const newClip = {
                ...clip,
                id: generateId('c'),
                start: clip.start + clip.duration + 1
              };
              const trackWithClip = state.tracks.find(t => t.clips.some(c => c.id === contextMenu.clipId));
              if (trackWithClip) {
                dispatch({ type: 'ADD_CLIP', payload: { trackId: trackWithClip.id, clip: newClip } });
              }
            }
            setContextMenu(null);
          }}
        />
      )}
    </div>
  );
}
