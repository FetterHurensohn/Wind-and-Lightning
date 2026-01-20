import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Keyframe {
  time: number;
  value: number | string | { x: number; y: number };
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface Effect {
  id: string;
  type: string;
  name: string;
  enabled: boolean;
  parameters: Record<string, any>;
  keyframes?: Record<string, Keyframe[]>;
}

export interface TimelineClip {
  id: string;
  mediaId: string;
  trackId: string;
  startTime: number; // in seconds
  duration: number; // in seconds
  trimStart: number; // offset from media start
  trimEnd: number; // offset from media end
  effects: Effect[];
  volume: number;
  speed: number;
  transitionIn?: {
    type: string;
    duration: number;
  };
  transitionOut?: {
    type: string;
    duration: number;
  };
}

export interface Track {
  id: string;
  name: string;
  type: 'video' | 'audio';
  muted: boolean;
  locked: boolean;
  height: number;
}

interface TimelineState {
  tracks: Track[];
  clips: TimelineClip[];
  currentTime: number;
  duration: number;
  zoom: number;
  selectedClipIds: string[];
  playbackRate: number;
  isPlaying: boolean;
  inPoint: number | null;
  outPoint: number | null;
}

const initialState: TimelineState = {
  tracks: [
    { id: 'v1', name: 'Video 1', type: 'video', muted: false, locked: false, height: 80 },
    { id: 'v2', name: 'Video 2', type: 'video', muted: false, locked: false, height: 80 },
    { id: 'a1', name: 'Audio 1', type: 'audio', muted: false, locked: false, height: 60 },
    { id: 'a2', name: 'Audio 2', type: 'audio', muted: false, locked: false, height: 60 },
  ],
  clips: [],
  currentTime: 0,
  duration: 0,
  zoom: 1,
  selectedClipIds: [],
  playbackRate: 1,
  isPlaying: false,
  inPoint: null,
  outPoint: null,
};

const timelineSlice = createSlice({
  name: 'timeline',
  initialState,
  reducers: {
    addTrack: (state, action: PayloadAction<Track>) => {
      state.tracks.push(action.payload);
    },
    removeTrack: (state, action: PayloadAction<string>) => {
      state.tracks = state.tracks.filter((track) => track.id !== action.payload);
      state.clips = state.clips.filter((clip) => clip.trackId !== action.payload);
    },
    addClip: (state, action: PayloadAction<TimelineClip>) => {
      state.clips.push(action.payload);
      state.duration = Math.max(state.duration, action.payload.startTime + action.payload.duration);
    },
    removeClip: (state, action: PayloadAction<string>) => {
      state.clips = state.clips.filter((clip) => clip.id !== action.payload);
    },
    updateClip: (state, action: PayloadAction<{ id: string; updates: Partial<TimelineClip> }>) => {
      const clip = state.clips.find((c) => c.id === action.payload.id);
      if (clip) {
        Object.assign(clip, action.payload.updates);
        state.duration = Math.max(
          ...state.clips.map((c) => c.startTime + c.duration),
          state.duration
        );
      }
    },
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = Math.max(0, Math.min(action.payload, state.duration));
    },
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = Math.max(0.1, Math.min(action.payload, 10));
    },
    selectClips: (state, action: PayloadAction<string[]>) => {
      state.selectedClipIds = action.payload;
    },
    togglePlay: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    setPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setInPoint: (state, action: PayloadAction<number | null>) => {
      state.inPoint = action.payload;
    },
    setOutPoint: (state, action: PayloadAction<number | null>) => {
      state.outPoint = action.payload;
    },
    splitClip: (state, action: PayloadAction<{ clipId: string; time: number }>) => {
      const clip = state.clips.find((c) => c.id === action.payload.clipId);
      if (clip && action.payload.time > clip.startTime && action.payload.time < clip.startTime + clip.duration) {
        const splitPoint = action.payload.time - clip.startTime;
        const newClip: TimelineClip = {
          ...clip,
          id: `${clip.id}-split-${Date.now()}`,
          startTime: action.payload.time,
          duration: clip.duration - splitPoint,
          trimStart: clip.trimStart + splitPoint,
        };
        clip.duration = splitPoint;
        state.clips.push(newClip);
      }
    },
  },
});

export const {
  addTrack,
  removeTrack,
  addClip,
  removeClip,
  updateClip,
  setCurrentTime,
  setZoom,
  selectClips,
  togglePlay,
  setPlaying,
  setInPoint,
  setOutPoint,
  splitClip,
} = timelineSlice.actions;

export default timelineSlice.reducer;
