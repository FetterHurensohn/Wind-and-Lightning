import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ExportSettings {
  format: 'mp4' | 'mov' | 'avi' | 'mkv' | 'webm';
  codec: 'h264' | 'h265' | 'prores' | 'vp9';
  resolution: { width: number; height: number };
  frameRate: number;
  bitrate: number;
  audioCodec: 'aac' | 'mp3' | 'pcm';
  audioBitrate: number;
  outputPath: string;
}

interface ExportState {
  settings: ExportSettings;
  isExporting: boolean;
  progress: number;
  error: string | null;
}

const initialState: ExportState = {
  settings: {
    format: 'mp4',
    codec: 'h264',
    resolution: { width: 1920, height: 1080 },
    frameRate: 30,
    bitrate: 8000,
    audioCodec: 'aac',
    audioBitrate: 192,
    outputPath: '',
  },
  isExporting: false,
  progress: 0,
  error: null,
};

const exportSlice = createSlice({
  name: 'export',
  initialState,
  reducers: {
    setExportSettings: (state, action: PayloadAction<Partial<ExportSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    startExport: (state) => {
      state.isExporting = true;
      state.progress = 0;
      state.error = null;
    },
    updateExportProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },
    finishExport: (state) => {
      state.isExporting = false;
      state.progress = 100;
    },
    setExportError: (state, action: PayloadAction<string>) => {
      state.isExporting = false;
      state.error = action.payload;
    },
  },
});

export const {
  setExportSettings,
  startExport,
  updateExportProgress,
  finishExport,
  setExportError,
} = exportSlice.actions;

export default exportSlice.reducer;
