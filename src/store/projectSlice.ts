import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Project {
  name: string;
  filePath: string | null;
  lastSaved: Date | null;
  isDirty: boolean;
  settings: {
    resolution: { width: number; height: number };
    frameRate: number;
    sampleRate: number;
  };
}

const initialState: Project = {
  name: 'Untitled Project',
  filePath: null,
  lastSaved: null,
  isDirty: false,
  settings: {
    resolution: { width: 1920, height: 1080 },
    frameRate: 30,
    sampleRate: 48000,
  },
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    newProject: (state) => {
      Object.assign(state, initialState);
    },
    openProject: (state, action: PayloadAction<string>) => {
      // Load project from file
      state.filePath = action.payload;
      state.isDirty = false;
    },
    saveProject: (state) => {
      state.lastSaved = new Date();
      state.isDirty = false;
    },
    saveProjectAs: (state, action: PayloadAction<string>) => {
      state.filePath = action.payload;
      state.lastSaved = new Date();
      state.isDirty = false;
    },
    setProjectName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
      state.isDirty = true;
    },
    setProjectSettings: (state, action: PayloadAction<Partial<Project['settings']>>) => {
      state.settings = { ...state.settings, ...action.payload };
      state.isDirty = true;
    },
    markDirty: (state) => {
      state.isDirty = true;
    },
  },
});

export const {
  newProject,
  openProject,
  saveProject,
  saveProjectAs,
  setProjectName,
  setProjectSettings,
  markDirty,
} = projectSlice.actions;

export default projectSlice.reducer;
