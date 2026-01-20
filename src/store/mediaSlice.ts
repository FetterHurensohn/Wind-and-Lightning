import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MediaItem {
  id: string;
  name: string;
  filePath: string;
  url: string; // Object URL for File
  file?: File; // Original File object
  type: 'video' | 'audio' | 'image';
  duration?: number;
  frameRate?: number;
  resolution?: { width: number; height: number };
  thumbnail?: string;
  waveform?: string;
  size: number;
  format: string;
}

interface MediaState {
  items: MediaItem[];
  selectedIds: string[];
  importing: boolean;
}

const initialState: MediaState = {
  items: [],
  selectedIds: [],
  importing: false,
};

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    importMedia: (state, action: PayloadAction<string[]>) => {
      state.importing = true;
      // This will be handled by middleware/thunk
    },
    addMediaItems: (state, action: PayloadAction<MediaItem[]>) => {
      state.items.push(...action.payload);
      state.importing = false;
    },
    removeMediaItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.selectedIds = state.selectedIds.filter((id) => id !== action.payload);
    },
    selectMediaItems: (state, action: PayloadAction<string[]>) => {
      state.selectedIds = action.payload;
    },
    clearSelection: (state) => {
      state.selectedIds = [];
    },
  },
});

export const {
  importMedia,
  addMediaItems,
  removeMediaItem,
  selectMediaItems,
  clearSelection,
} = mediaSlice.actions;

export default mediaSlice.reducer;
