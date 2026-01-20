/// <reference types="vite/client" />

interface Window {
  electronAPI: {
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
  };
}
