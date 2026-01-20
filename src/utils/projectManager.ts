// Project file handler - save and load .veproj files

import { RootState } from '../store/store';

export interface ProjectData {
  version: string;
  name: string;
  settings: {
    resolution: { width: number; height: number };
    frameRate: number;
    sampleRate: number;
  };
  media: any[];
  timeline: {
    tracks: any[];
    clips: any[];
    duration: number;
  };
  effects: any[];
  metadata: {
    created: string;
    modified: string;
  };
}

export class ProjectManager {
  static async saveProject(state: RootState, filePath: string): Promise<boolean> {
    try {
      const projectData: ProjectData = {
        version: '1.0.0',
        name: state.project.name,
        settings: state.project.settings,
        media: state.media.items,
        timeline: {
          tracks: state.timeline.tracks,
          clips: state.timeline.clips,
          duration: state.timeline.duration,
        },
        effects: Object.values(state.effects.availableEffects).flat(),
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
        },
      };

      const json = JSON.stringify(projectData, null, 2);
      const result = await window.electronAPI.writeFile(filePath, json);
      
      return result.success;
    } catch (error) {
      console.error('Failed to save project:', error);
      return false;
    }
  }

  static async loadProject(filePath: string): Promise<ProjectData | null> {
    try {
      const result = await window.electronAPI.readFile(filePath);
      
      if (!result.success || !result.data) {
        return null;
      }

      const projectData: ProjectData = JSON.parse(result.data);
      return projectData;
    } catch (error) {
      console.error('Failed to load project:', error);
      return null;
    }
  }

  static async autoSave(state: RootState, filePath: string | null): Promise<boolean> {
    if (!filePath) {
      // Create temp autosave file
      const tempPath = `autosave-${Date.now()}.veproj`;
      return this.saveProject(state, tempPath);
    }
    
    return this.saveProject(state, filePath);
  }

  static createNewProject(): Partial<ProjectData> {
    return {
      version: '1.0.0',
      name: 'Untitled Project',
      settings: {
        resolution: { width: 1920, height: 1080 },
        frameRate: 30,
        sampleRate: 48000,
      },
      media: [],
      timeline: {
        tracks: [
          { id: 'v1', name: 'Video 1', type: 'video', muted: false, locked: false, height: 80 },
          { id: 'a1', name: 'Audio 1', type: 'audio', muted: false, locked: false, height: 60 },
        ],
        clips: [],
        duration: 0,
      },
      effects: [],
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
      },
    };
  }
}

// Auto-save functionality
export class AutoSaveManager {
  private intervalId: NodeJS.Timeout | null = null;
  private saveInterval: number = 5 * 60 * 1000; // 5 minutes

  start(callback: () => void) {
    if (this.intervalId) {
      this.stop();
    }

    this.intervalId = setInterval(callback, this.saveInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  setSaveInterval(minutes: number) {
    this.saveInterval = minutes * 60 * 1000;
    
    if (this.intervalId) {
      // Restart with new interval
      this.stop();
      // Note: Need to re-call start with callback
    }
  }
}

export const autoSaveManager = new AutoSaveManager();
