import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Dialog APIs
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  openProjectDialog: () => ipcRenderer.invoke('dialog:openProject'),
  saveProjectDialog: () => ipcRenderer.invoke('dialog:saveProject'),

  // File System APIs
  readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
  writeFile: (filePath: string, data: string) => ipcRenderer.invoke('fs:writeFile', filePath, data),
  getFileStats: (filePath: string) => ipcRenderer.invoke('fs:getFileStats', filePath),

  // Menu events
  onNewProject: (callback: () => void) => ipcRenderer.on('menu:new-project', callback),
  onOpenProject: (callback: () => void) => ipcRenderer.on('menu:open-project', callback),
  onSaveProject: (callback: () => void) => ipcRenderer.on('menu:save-project', callback),
  onSaveProjectAs: (callback: () => void) => ipcRenderer.on('menu:save-project-as', callback),
  onImportMedia: (callback: () => void) => ipcRenderer.on('menu:import-media', callback),
  onExport: (callback: () => void) => ipcRenderer.on('menu:export', callback),

  // FFmpeg APIs
  extractThumbnail: (filePath: string, timestamp: number) => 
    ipcRenderer.invoke('ffmpeg:extract-thumbnail', filePath, timestamp),
  getVideoMetadata: (filePath: string) => 
    ipcRenderer.invoke('ffmpeg:get-metadata', filePath),
  exportVideo: (options: any) => 
    ipcRenderer.invoke('ffmpeg:export', options),
  onExportProgress: (callback: (progress: number) => void) => 
    ipcRenderer.on('ffmpeg:export-progress', (_, progress) => callback(progress)),
});

// Type definitions for TypeScript
export interface ElectronAPI {
  openFileDialog: () => Promise<string[]>;
  openProjectDialog: () => Promise<string>;
  saveProjectDialog: () => Promise<string>;
  readFile: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
  writeFile: (filePath: string, data: string) => Promise<{ success: boolean; error?: string }>;
  getFileStats: (filePath: string) => Promise<{ success: boolean; stats?: any; error?: string }>;
  onNewProject: (callback: () => void) => void;
  onOpenProject: (callback: () => void) => void;
  onSaveProject: (callback: () => void) => void;
  onSaveProjectAs: (callback: () => void) => void;
  onImportMedia: (callback: () => void) => void;
  onExport: (callback: () => void) => void;
  extractThumbnail: (filePath: string, timestamp: number) => Promise<string>;
  getVideoMetadata: (filePath: string) => Promise<any>;
  exportVideo: (options: any) => Promise<void>;
  onExportProgress: (callback: (progress: number) => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
