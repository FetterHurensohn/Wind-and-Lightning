/**
 * Electron Preload Script
 * 
 * Sichere Bridge zwischen Main Process und Renderer Process.
 * Exponiert nur spezifische APIs an die Web-App.
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods
contextBridge.exposeInMainWorld('electronAPI', {
  // Projekt-Operationen (Legacy - keep for backwards compatibility)
  project: {
    save: (projectData) => ipcRenderer.invoke('project:save', projectData),
    onLoaded: (callback) => ipcRenderer.on('project:loaded', (event, data) => callback(data)),
    onSave: (callback) => ipcRenderer.on('menu:save-project', (event, path) => callback(path)),
    createStructure: (projectName) => ipcRenderer.invoke('project:createStructure', projectName),
    listProjects: () => ipcRenderer.invoke('project:listProjects')
  },

  // UUID-based Project Management API
  projectAPI: {
    create: (name, options) => ipcRenderer.invoke('project:create', name, options),
    open: (projectPath, options) => ipcRenderer.invoke('project:open', projectPath, options),
    close: () => ipcRenderer.invoke('project:close'),
    save: (state) => ipcRenderer.invoke('project:save', state),
    listAll: () => ipcRenderer.invoke('project:listAll'),
    checkLock: (projectPath) => ipcRenderer.invoke('project:checkLock', projectPath),
    delete: (projectPath, options) => ipcRenderer.invoke('project:delete', projectPath, options)
  },

  // Asset Management API
  assetAPI: {
    import: (projectPath, filePath, copyMode, metadata) =>
      ipcRenderer.invoke('asset:import', projectPath, filePath, copyMode, metadata),
    update: (projectPath, assetUuid, updates) =>
      ipcRenderer.invoke('asset:update', projectPath, assetUuid, updates),
    remove: (projectPath, assetUuid, deleteFile) =>
      ipcRenderer.invoke('asset:remove', projectPath, assetUuid, deleteFile),
    resolve: (projectPath, assetUuid, useProxy) =>
      ipcRenderer.invoke('asset:resolve', projectPath, assetUuid, useProxy),
    list: (projectPath, filter) =>
      ipcRenderer.invoke('asset:list', projectPath, filter),
    findOffline: (projectPath) =>
      ipcRenderer.invoke('asset:findOffline', projectPath)
  },

  // Timeline Management API
  timelineAPI: {
    load: (projectPath, version) =>
      ipcRenderer.invoke('timeline:load', projectPath, version),
    save: (projectPath, timelineState, createHistory) =>
      ipcRenderer.invoke('timeline:save', projectPath, timelineState, createHistory),
    createSnapshot: (projectPath, timelineData, label) =>
      ipcRenderer.invoke('timeline:createSnapshot', projectPath, timelineData, label),
    listHistory: (projectPath) =>
      ipcRenderer.invoke('timeline:listHistory', projectPath),
    rollback: (projectPath, historyFilename) =>
      ipcRenderer.invoke('timeline:rollback', projectPath, historyFilename)
  },

  // Cache Management API
  cacheAPI: {
    getThumbnail: (projectPath, assetUuid, assetPath, time) =>
      ipcRenderer.invoke('cache:getThumbnail', projectPath, assetUuid, assetPath, time),
    getWaveform: (projectPath, assetUuid, assetPath) =>
      ipcRenderer.invoke('cache:getWaveform', projectPath, assetUuid, assetPath),
    calculateSize: (projectPath) =>
      ipcRenderer.invoke('cache:calculateSize', projectPath),
    clear: (projectPath, type) =>
      ipcRenderer.invoke('cache:clear', projectPath, type)
  },

  // Proxy Generation API
  proxyAPI: {
    generate: (projectPath, assetUuid, assetPath, profile) =>
      ipcRenderer.invoke('proxy:generate', projectPath, assetUuid, assetPath, profile),
    checkStatus: (projectPath, assetUuid) =>
      ipcRenderer.invoke('proxy:checkStatus', projectPath, assetUuid),
    delete: (projectPath, assetUuid) =>
      ipcRenderer.invoke('proxy:delete', projectPath, assetUuid),
    getQueue: () =>
      ipcRenderer.invoke('proxy:getQueue'),
    onProgress: (callback) =>
      ipcRenderer.on('proxy:progress', (event, data) => callback(data)),
    onCompleted: (callback) =>
      ipcRenderer.on('proxy:completed', (event, data) => callback(data)),
    onFailed: (callback) =>
      ipcRenderer.on('proxy:failed', (event, data) => callback(data))
  },

  // Migration API
  migrationAPI: {
    scan: () =>
      ipcRenderer.invoke('migration:scan'),
    migrate: (projectPath) =>
      ipcRenderer.invoke('migration:migrate', projectPath),
    batchMigrate: (projectPaths) =>
      ipcRenderer.invoke('migration:batchMigrate', projectPaths),
    onProgress: (callback) =>
      ipcRenderer.on('migration:progress', (event, data) => callback(data))
  },

  // Export API
  exportAPI: {
    timeline: (projectPath, outputPath, options) =>
      ipcRenderer.invoke('export:timeline', projectPath, outputPath, options),
    audio: (projectPath, outputPath, options) =>
      ipcRenderer.invoke('export:audio', projectPath, outputPath, options),
    preview: (projectPath, outputPath) =>
      ipcRenderer.invoke('export:preview', projectPath, outputPath)
  },

  // Settings API
  settingsAPI: {
    getBasePath: () => ipcRenderer.invoke('settings:getBasePath'),
    setBasePath: (newPath) => ipcRenderer.invoke('settings:setBasePath', newPath)
  },

  // File System
  fs: {
    readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
    writeFile: (filePath, data) => ipcRenderer.invoke('fs:writeFile', filePath, data),
    copyFile: (sourcePath, targetPath) => ipcRenderer.invoke('fs:copyFile', sourcePath, targetPath)
  },

  // Dialog
  dialog: {
    openFile: (options) => ipcRenderer.invoke('dialog:openFile', options)
  },

  // Cache System (Legacy)
  cache: {
    saveFrame: (clipId, frameNumber, dataURL) =>
      ipcRenderer.invoke('cache:saveFrame', clipId, frameNumber, dataURL),
    loadFrame: (clipId, frameNumber) =>
      ipcRenderer.invoke('cache:loadFrame', clipId, frameNumber),
    clear: () => ipcRenderer.invoke('cache:clear')
  },

  // System Info
  system: {
    getInfo: () => ipcRenderer.invoke('system:getInfo'),
    getPath: (name) => ipcRenderer.invoke('app:getPath', name)
  },

  // Menu Events (von Main zu Renderer)
  menu: {
    onNewProject: (callback) => ipcRenderer.on('menu:new-project', callback),
    onSaveProject: (callback) => ipcRenderer.on('menu:save-project', (event, path) => callback(path)),
    onExport: (callback) => ipcRenderer.on('menu:export', callback),
    onMediaImport: (callback) => ipcRenderer.on('media:import', (event, filePaths) => callback(filePaths))
  },

  // Edit Menu Events
  edit: {
    onUndo: (callback) => ipcRenderer.on('edit:undo', callback),
    onRedo: (callback) => ipcRenderer.on('edit:redo', callback),
    onCut: (callback) => ipcRenderer.on('edit:cut', callback),
    onCopy: (callback) => ipcRenderer.on('edit:copy', callback),
    onPaste: (callback) => ipcRenderer.on('edit:paste', callback),
    onSplit: (callback) => ipcRenderer.on('edit:split', callback),
    onDelete: (callback) => ipcRenderer.on('edit:delete', callback)
  },

  // View Menu Events
  view: {
    onZoomIn: (callback) => ipcRenderer.on('view:zoom-in', callback),
    onZoomOut: (callback) => ipcRenderer.on('view:zoom-out', callback),
    onZoomReset: (callback) => ipcRenderer.on('view:zoom-reset', callback)
  },

  // Help Menu Events
  help: {
    onShortcuts: (callback) => ipcRenderer.on('help:shortcuts', callback)
  },

  // Platform info
  platform: process.platform,
  isElectron: true
});

// Remove event listeners on cleanup
window.addEventListener('beforeunload', () => {
  ipcRenderer.removeAllListeners('project:loaded');
  ipcRenderer.removeAllListeners('menu:save-project');
  ipcRenderer.removeAllListeners('menu:new-project');
  ipcRenderer.removeAllListeners('menu:export');
  ipcRenderer.removeAllListeners('media:import');
  ipcRenderer.removeAllListeners('edit:undo');
  ipcRenderer.removeAllListeners('edit:redo');
  ipcRenderer.removeAllListeners('edit:cut');
  ipcRenderer.removeAllListeners('edit:copy');
  ipcRenderer.removeAllListeners('edit:paste');
  ipcRenderer.removeAllListeners('edit:split');
  ipcRenderer.removeAllListeners('edit:delete');
  ipcRenderer.removeAllListeners('view:zoom-in');
  ipcRenderer.removeAllListeners('view:zoom-out');
  ipcRenderer.removeAllListeners('view:zoom-reset');
  ipcRenderer.removeAllListeners('help:shortcuts');
});

console.log('Electron preload script loaded successfully');
