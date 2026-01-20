/**
 * Electron API Integration
 * 
 * Wrapper für Electron APIs mit Fallbacks für Browser-Modus.
 * Ermöglicht nahtlose Entwicklung in Browser und Electron.
 */

// Check if running in Electron
const isElectron = window.electronAPI?.isElectron || false;

// Project Operations
export const projectAPI = {
  async save(projectData) {
    if (isElectron) {
      return await window.electronAPI.project.save(projectData);
    } else {
      // Browser fallback: Download as JSON
      const dataStr = JSON.stringify(projectData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-${projectData.projectName || 'untitled'}.veproj`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return { success: true, browser: true };
    }
  },

  onLoaded(callback) {
    if (isElectron) {
      window.electronAPI.project.onLoaded(callback);
    }
  },

  onSave(callback) {
    if (isElectron) {
      window.electronAPI.project.onSave(callback);
    }
  },

  async createStructure(projectName) {
    if (isElectron) {
      return await window.electronAPI.project.createStructure(projectName);
    } else {
      console.warn('[Browser] Project structure creation not available');
      return { 
        success: true, 
        projectPath: null, 
        created: [], 
        skipped: [], 
        errors: [] 
      };
    }
  },

  async listProjects() {
    if (isElectron) {
      return await window.electronAPI.project.listProjects();
    } else {
      console.warn('[Browser] Project listing not available');
      return {
        success: false,
        error: 'Not in Electron environment',
        projects: []
      };
    }
  }
};

// File System Operations
export const fsAPI = {
  async readFile(filePath) {
    if (isElectron) {
      return await window.electronAPI.fs.readFile(filePath);
    } else {
      throw new Error('File System access only available in Desktop App');
    }
  },

  async writeFile(filePath, data) {
    if (isElectron) {
      return await window.electronAPI.fs.writeFile(filePath, data);
    } else {
      throw new Error('File System access only available in Desktop App');
    }
  },

  async copyFile(sourcePath, targetPath) {
    if (isElectron) {
      return await window.electronAPI.fs.copyFile(sourcePath, targetPath);
    } else {
      throw new Error('File System access only available in Desktop App');
    }
  }
};

// Dialog Operations
export const dialogAPI = {
  async openFile(options = {}) {
    if (isElectron) {
      return await window.electronAPI.dialog.openFile(options);
    } else {
      // Browser fallback: File input
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = options.filters?.map(f => '.' + f.extensions.join(',.')).join(',') || '*';
        input.multiple = options.properties?.includes('multiSelections') || false;
        
        input.onchange = (e) => {
          const files = Array.from(e.target.files || []);
          resolve({
            canceled: files.length === 0,
            filePaths: files.map(f => f.path || f.name)
          });
        };
        
        input.click();
      });
    }
  }
};

// Cache System
export const cacheAPI = {
  async saveFrame(clipId, frameNumber, dataURL) {
    if (isElectron) {
      return await window.electronAPI.cache.saveFrame(clipId, frameNumber, dataURL);
    } else {
      // Browser fallback: localStorage (limited)
      try {
        const key = `frame_${clipId}_${frameNumber}`;
        localStorage.setItem(key, dataURL);
        return { success: true, browser: true };
      } catch (error) {
        return { success: false, error: 'LocalStorage quota exceeded' };
      }
    }
  },

  async loadFrame(clipId, frameNumber) {
    if (isElectron) {
      return await window.electronAPI.cache.loadFrame(clipId, frameNumber);
    } else {
      const key = `frame_${clipId}_${frameNumber}`;
      const data = localStorage.getItem(key);
      if (data) {
        return { success: true, data: data.replace(/^data:image\/\w+;base64,/, '') };
      } else {
        return { success: false, error: 'Frame not found' };
      }
    }
  },

  async clear() {
    if (isElectron) {
      return await window.electronAPI.cache.clear();
    } else {
      // Clear all frame cache from localStorage
      Object.keys(localStorage)
        .filter(key => key.startsWith('frame_'))
        .forEach(key => localStorage.removeItem(key));
      return { success: true };
    }
  }
};

// System Info
export const systemAPI = {
  async getInfo() {
    if (isElectron) {
      return await window.electronAPI.system.getInfo();
    } else {
      return {
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        browser: true
      };
    }
  },

  async getPath(name) {
    if (isElectron) {
      return await window.electronAPI.system.getPath(name);
    } else {
      return null;
    }
  }
};

// Menu Events
export const menuAPI = {
  onNewProject(callback) {
    if (isElectron) {
      window.electronAPI.menu.onNewProject(callback);
    }
  },

  onSaveProject(callback) {
    if (isElectron) {
      window.electronAPI.menu.onSaveProject(callback);
    }
  },

  onExport(callback) {
    if (isElectron) {
      window.electronAPI.menu.onExport(callback);
    }
  },

  onMediaImport(callback) {
    if (isElectron) {
      window.electronAPI.menu.onMediaImport(callback);
    }
  }
};

// Edit Events
export const editAPI = {
  onUndo(callback) {
    if (isElectron) {
      window.electronAPI.edit.onUndo(callback);
    }
  },

  onRedo(callback) {
    if (isElectron) {
      window.electronAPI.edit.onRedo(callback);
    }
  },

  onCut(callback) {
    if (isElectron) {
      window.electronAPI.edit.onCut(callback);
    }
  },

  onCopy(callback) {
    if (isElectron) {
      window.electronAPI.edit.onCopy(callback);
    }
  },

  onPaste(callback) {
    if (isElectron) {
      window.electronAPI.edit.onPaste(callback);
    }
  },

  onSplit(callback) {
    if (isElectron) {
      window.electronAPI.edit.onSplit(callback);
    }
  },

  onDelete(callback) {
    if (isElectron) {
      window.electronAPI.edit.onDelete(callback);
    }
  }
};

// View Events
export const viewAPI = {
  onZoomIn(callback) {
    if (isElectron) {
      window.electronAPI.view.onZoomIn(callback);
    }
  },

  onZoomOut(callback) {
    if (isElectron) {
      window.electronAPI.view.onZoomOut(callback);
    }
  },

  onZoomReset(callback) {
    if (isElectron) {
      window.electronAPI.view.onZoomReset(callback);
    }
  }
};

// Help Events
export const helpAPI = {
  onShortcuts(callback) {
    if (isElectron) {
      window.electronAPI.help.onShortcuts(callback);
    }
  }
};

// Environment Info
export const envAPI = {
  isElectron,
  platform: isElectron ? window.electronAPI.platform : navigator.platform
};

export default {
  project: projectAPI,
  fs: fsAPI,
  dialog: dialogAPI,
  cache: cacheAPI,
  system: systemAPI,
  menu: menuAPI,
  edit: editAPI,
  view: viewAPI,
  help: helpAPI,
  env: envAPI
};
