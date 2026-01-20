import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Effect } from './timelineSlice';

interface EffectsState {
  availableEffects: {
    video: Effect[];
    audio: Effect[];
    transitions: Effect[];
  };
  selectedClipId: string | null;
}

const initialState: EffectsState = {
  availableEffects: {
    video: [
      {
        id: 'brightness',
        type: 'video',
        name: 'Brightness & Contrast',
        enabled: true,
        parameters: { brightness: 0, contrast: 0 },
      },
      {
        id: 'saturation',
        type: 'video',
        name: 'Saturation',
        enabled: true,
        parameters: { saturation: 100 },
      },
      {
        id: 'blur',
        type: 'video',
        name: 'Blur',
        enabled: true,
        parameters: { amount: 0 },
      },
      {
        id: 'transform',
        type: 'video',
        name: 'Transform',
        enabled: true,
        parameters: { 
          position: { x: 0, y: 0 }, 
          scale: { x: 100, y: 100 }, 
          rotation: 0,
          opacity: 100,
        },
      },
      {
        id: 'chromakey',
        type: 'video',
        name: 'Chroma Key',
        enabled: true,
        parameters: { color: '#00ff00', tolerance: 50, softness: 10 },
      },
    ],
    audio: [
      {
        id: 'volume',
        type: 'audio',
        name: 'Volume',
        enabled: true,
        parameters: { volume: 100 },
      },
      {
        id: 'eq',
        type: 'audio',
        name: 'Equalizer',
        enabled: true,
        parameters: { low: 0, mid: 0, high: 0 },
      },
    ],
    transitions: [
      {
        id: 'crossfade',
        type: 'transition',
        name: 'Cross Dissolve',
        enabled: true,
        parameters: { duration: 1 },
      },
      {
        id: 'dip-to-black',
        type: 'transition',
        name: 'Dip to Black',
        enabled: true,
        parameters: { duration: 1 },
      },
    ],
  },
  selectedClipId: null,
};

const effectsSlice = createSlice({
  name: 'effects',
  initialState,
  reducers: {
    selectClipForEffects: (state, action: PayloadAction<string | null>) => {
      state.selectedClipId = action.payload;
    },
  },
});

export const { selectClipForEffects } = effectsSlice.actions;

export default effectsSlice.reducer;
