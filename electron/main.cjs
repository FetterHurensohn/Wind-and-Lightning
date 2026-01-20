/**
 * Electron Main Process - Vollständige Desktop-App
 * 
 * Features:
 * - Native File System Access
 * - GPU Hardware Acceleration
 * - FFmpeg Video Processing
 * - Frame Cache System
 * - Native Menus
 * - IPC Communication
 * - Auto-Updates
 */

const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const ffmpegHandler = require('./ffmpeg-handler.cjs');
const { createProjectStructure } = require('./projectStructureHandler.cjs');

// UUID-based Project Management Modules
const projectManager = require('./projectManager.cjs');
const assetRegistry = require('./assetRegistry.cjs');
const timelineManager = require('./timelineManager.cjs');
const cacheManager = require('./cacheManager.cjs');
const proxyGenerator = require('./proxyGenerator.cjs');
const migrationService = require('./migrationService.cjs');
const exportManager = require('./exportManager.cjs');

// Globale Variablen
let mainWindow;
let cacheDir;
let currentProjectPath = null;

// Hardware Acceleration aktivieren
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('disable-gpu-sandbox');

// Cache-Verzeichnis initialisieren
async function initCacheDir() {
  const userDataPath = app.getPath('userData');
  cacheDir = path.join(userDataPath, 'cache', 'frames');

  try {
    await fs.mkdir(cacheDir, { recursive: true });
    console.log('Cache directory initialized:', cacheDir);
  } catch (error) {
    console.error('Failed to create cache directory:', error);
  }
}

// Hauptfenster erstellen
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 1366,
    minHeight: 768,
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      enableRemoteModule: false,
      // GPU Features
      webgl: true,
      acceleratedVideo: true,
      hardwareAcceleration: true
    },
    show: false, // Erst zeigen wenn ready
    title: 'CapCut Video Editor - Desktop',
    icon: path.join(__dirname, '../public/icon.png')
  });

  // Optimiertes Laden
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Content Security Policy Headers hinzufügen
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
          "style-src 'self' 'unsafe-inline'; " +
          "img-src 'self' data: blob: file:; " +
          "font-src 'self' data:; " +
          "connect-src 'self' ws: wss:;"
        ]
      }
    });
  });

  // Load URL basierend auf Umgebung
  // FIXED: Respektiere NODE_ENV, ignoriere app.isPackaged für Dev-Testing
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    // Versuche verschiedene Ports (3000, 3001, 3002)
    const tryLoadURL = async (port) => {
      try {
        await mainWindow.loadURL(`http://localhost:${port}`);
        console.log(`✅ Loaded from http://localhost:${port}`);
      } catch (err) {
        console.error(`Failed to load from port ${port}:`, err.message);
        if (port < 3005) {
          console.log(`Trying next port...`);
          setTimeout(() => tryLoadURL(port + 1), 1000);
        }
      }
    };

    tryLoadURL(3000);

    // DevTools öffnen zum Debuggen
    mainWindow.webContents.once('did-finish-load', () => {
      mainWindow.webContents.openDevTools();
    });
  } else {
    // Production Mode - load from dist
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));

    // DevTools auch im Production-Mode für Debugging
    mainWindow.webContents.once('did-finish-load', () => {
      mainWindow.webContents.openDevTools();
    });
  }

  // Window Event Handlers
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Native Menu erstellen
  createMenu();
}

// Native Application Menu
function createMenu() {
  const template = [
    {
      label: 'Datei',
      submenu: [
        {
          label: 'Neues Projekt',
          accelerator: 'CmdOrCtrl+N',
          click: async () => {
            mainWindow.webContents.send('menu:new-project');
          }
        },
        {
          label: 'Projekt öffnen...',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              title: 'Projekt öffnen',
              filters: [
                { name: 'Video Editor Projekt', extensions: ['veproj', 'json'] },
                { name: 'Alle Dateien', extensions: ['*'] }
              ],
              properties: ['openFile']
            });

            if (!result.canceled && result.filePaths.length > 0) {
              const projectPath = result.filePaths[0];
              await loadProject(projectPath);
            }
          }
        },
        {
          label: 'Projekt speichern',
          accelerator: 'CmdOrCtrl+S',
          click: async () => {
            if (currentProjectPath) {
              mainWindow.webContents.send('menu:save-project', currentProjectPath);
            } else {
              // Speichern unter...
              const result = await dialog.showSaveDialog(mainWindow, {
                title: 'Projekt speichern',
                defaultPath: 'projekt.veproj',
                filters: [
                  { name: 'Video Editor Projekt', extensions: ['veproj'] },
                  { name: 'JSON', extensions: ['json'] }
                ]
              });

              if (!result.canceled && result.filePath) {
                currentProjectPath = result.filePath;
                mainWindow.webContents.send('menu:save-project', currentProjectPath);
              }
            }
          }
        },
        {
          label: 'Speichern unter...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow, {
              title: 'Projekt speichern unter',
              defaultPath: currentProjectPath || 'projekt.veproj',
              filters: [
                { name: 'Video Editor Projekt', extensions: ['veproj'] },
                { name: 'JSON', extensions: ['json'] }
              ]
            });

            if (!result.canceled && result.filePath) {
              currentProjectPath = result.filePath;
              mainWindow.webContents.send('menu:save-project', currentProjectPath);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Medien importieren...',
          accelerator: 'CmdOrCtrl+I',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              title: 'Medien importieren',
              filters: [
                { name: 'Videodateien', extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv'] },
                { name: 'Audiodateien', extensions: ['mp3', 'wav', 'aac', 'ogg', 'flac', 'm4a'] },
                { name: 'Bilddateien', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'] },
                { name: 'Alle Dateien', extensions: ['*'] }
              ],
              properties: ['openFile', 'multiSelections']
            });

            if (!result.canceled && result.filePaths.length > 0) {
              mainWindow.webContents.send('media:import', result.filePaths);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Exportieren...',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow.webContents.send('menu:export');
          }
        },
        { type: 'separator' },
        {
          label: 'Beenden',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Bearbeiten',
      submenu: [
        {
          label: 'Rückgängig',
          accelerator: 'CmdOrCtrl+Z',
          click: () => {
            mainWindow.webContents.send('edit:undo');
          }
        },
        {
          label: 'Wiederholen',
          accelerator: 'CmdOrCtrl+Shift+Z',
          click: () => {
            mainWindow.webContents.send('edit:redo');
          }
        },
        { type: 'separator' },
        {
          label: 'Ausschneiden',
          accelerator: 'CmdOrCtrl+X',
          click: () => {
            mainWindow.webContents.send('edit:cut');
          }
        },
        {
          label: 'Kopieren',
          accelerator: 'CmdOrCtrl+C',
          click: () => {
            mainWindow.webContents.send('edit:copy');
          }
        },
        {
          label: 'Einfügen',
          accelerator: 'CmdOrCtrl+V',
          click: () => {
            mainWindow.webContents.send('edit:paste');
          }
        },
        { type: 'separator' },
        {
          label: 'An Playhead teilen',
          accelerator: 'CmdOrCtrl+K',
          click: () => {
            mainWindow.webContents.send('edit:split');
          }
        },
        {
          label: 'Löschen',
          accelerator: 'Delete',
          click: () => {
            mainWindow.webContents.send('edit:delete');
          }
        }
      ]
    },
    {
      label: 'Ansicht',
      submenu: [
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            mainWindow.webContents.send('view:zoom-in');
          }
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            mainWindow.webContents.send('view:zoom-out');
          }
        },
        {
          label: 'Zoom zurücksetzen',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            mainWindow.webContents.send('view:zoom-reset');
          }
        },
        { type: 'separator' },
        {
          label: 'Vollbild',
          accelerator: 'F11',
          click: () => {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        },
        { type: 'separator' },
        {
          label: 'Entwicklertools',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        }
      ]
    },
    {
      label: 'Hilfe',
      submenu: [
        {
          label: 'Dokumentation',
          click: async () => {
            await shell.openExternal('https://github.com/yourrepo/docs');
          }
        },
        {
          label: 'Shortcuts',
          click: () => {
            mainWindow.webContents.send('help:shortcuts');
          }
        },
        { type: 'separator' },
        {
          label: 'Über',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Über CapCut Video Editor',
              message: 'CapCut Video Editor Desktop',
              detail: `Version: ${app.getVersion()}\nElectron: ${process.versions.electron}\nChrome: ${process.versions.chrome}\nNode.js: ${process.versions.node}`
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Projekt laden
async function loadProject(projectPath) {
  try {
    const data = await fs.readFile(projectPath, 'utf-8');
    const project = JSON.parse(data);
    currentProjectPath = projectPath;
    mainWindow.webContents.send('project:loaded', { path: projectPath, data: project });
    return project;
  } catch (error) {
    dialog.showErrorBox('Fehler beim Laden', `Projekt konnte nicht geladen werden:\n${error.message}`);
    throw error;
  }
}

// IPC Handlers
function setupIPCHandlers() {
  // Legacy project:save (umbenannt zu project:saveLegacy)
  ipcMain.handle('project:saveLegacy', async (event, projectData) => {
    try {
      if (!currentProjectPath) {
        const result = await dialog.showSaveDialog(mainWindow, {
          title: 'Projekt speichern',
          defaultPath: 'projekt.veproj',
          filters: [
            { name: 'Video Editor Projekt', extensions: ['veproj'] },
            { name: 'JSON', extensions: ['json'] }
          ]
        });

        if (result.canceled) return { success: false, canceled: true };
        currentProjectPath = result.filePath;
      }

      await fs.writeFile(currentProjectPath, JSON.stringify(projectData, null, 2), 'utf-8');
      return { success: true, path: currentProjectPath };
    } catch (error) {
      console.error('Save error:', error);
      return { success: false, error: error.message };
    }
  });

  // Datei auswählen
  ipcMain.handle('dialog:openFile', async (event, options) => {
    const result = await dialog.showOpenDialog(mainWindow, options);
    return result.filePaths; // Return nur die filePaths, nicht das gesamte result Objekt
  });

  // Datei kopieren (effizient für große Binärdateien)
  ipcMain.handle('fs:copyFile', async (event, sourcePath, targetPath) => {
    try {
      // Stelle sicher, dass das Zielverzeichnis existiert
      const targetDir = path.dirname(targetPath);
      await fs.mkdir(targetDir, { recursive: true });

      // Kopiere die Datei
      await fs.copyFile(sourcePath, targetPath);

      // Hole Datei-Statistiken
      const stats = await fs.stat(targetPath);

      return {
        success: true,
        size: stats.size,
        path: targetPath
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Datei lesen (binär für Bilder/Videos/Audio)
  ipcMain.handle('fs:readFile', async (event, filePath) => {
    try {
      const data = await fs.readFile(filePath); // Kein encoding = Buffer
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Datei schreiben (binär oder Text)
  ipcMain.handle('fs:writeFile', async (event, filePath, data) => {
    try {
      // Stelle sicher, dass das Verzeichnis existiert
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });

      await fs.writeFile(filePath, data); // Automatische Erkennung von Buffer/String
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Cache Frame speichern
  ipcMain.handle('cache:saveFrame', async (event, clipId, frameNumber, dataURL) => {
    try {
      const framePath = path.join(cacheDir, `${clipId}_${frameNumber}.jpg`);
      const base64Data = dataURL.replace(/^data:image\/\w+;base64,/, '');
      await fs.writeFile(framePath, Buffer.from(base64Data, 'base64'));
      return { success: true, path: framePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Cache Frame laden
  ipcMain.handle('cache:loadFrame', async (event, clipId, frameNumber) => {
    try {
      const framePath = path.join(cacheDir, `${clipId}_${frameNumber}.jpg`);
      const data = await fs.readFile(framePath);
      return { success: true, data: data.toString('base64') };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Legacy cache handlers sind jetzt durch UUID-basierte ersetzt (siehe unten)

  // System Info
  ipcMain.handle('system:getInfo', async () => {
    return {
      platform: process.platform,
      arch: process.arch,
      version: app.getVersion(),
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node,
      cachePath: cacheDir,
      userDataPath: app.getPath('userData')
    };
  });

  // App Pfad abrufen
  ipcMain.handle('app:getPath', async (event, name) => {
    return app.getPath(name);
  });

  // ===== PROJECT STRUCTURE CREATION =====
  ipcMain.handle('project:createStructure', async (event, projectName) => {
    try {
      console.log(`[IPC] Creating project structure for: "${projectName}"`);
      const result = await createProjectStructure(projectName);
      console.log(`[IPC] Project structure result:`, {
        success: result.success,
        created: result.created.length,
        skipped: result.skipped.length,
        errors: result.errors.length
      });
      return result;
    } catch (err) {
      console.error('[IPC] Project structure creation error:', err);
      return {
        success: false,
        error: err.message,
        created: [],
        skipped: [],
        errors: [{ path: 'unknown', message: err.message }]
      };
    }
  });

  // List all projects in the draft directory
  ipcMain.handle('project:listProjects', async () => {
    const basePath = path.join('C:', 'Users', 'jacqu', 'OneDrive', 'Desktop', 'Wind and Lightning Projekts', 'com.lveditor.draft');

    try {
      // Check if base path exists
      if (!fsSync.existsSync(basePath)) {
        console.log('[IPC] Base path does not exist:', basePath);
        return {
          success: false,
          error: 'Projektordner existiert nicht',
          projects: []
        };
      }

      // Read all directories
      const entries = await fs.readdir(basePath, { withFileTypes: true });
      const projectFolders = entries.filter(entry => entry.isDirectory());

      console.log(`[IPC] Found ${projectFolders.length} project folders in ${basePath}`);

      const projects = [];

      for (const folder of projectFolders) {
        const projectPath = path.join(basePath, folder.name);

        try {
          // Get folder stats
          const stats = await fs.stat(projectPath);

          // Try to read project metadata (draft_meta_info)
          let metadata = {
            name: folder.name,
            resolution: '1920×1080',
            fps: 30,
            duration: 0
          };

          const metaInfoPath = path.join(projectPath, 'draft_meta_info');
          if (fsSync.existsSync(metaInfoPath)) {
            try {
              const metaContent = await fs.readFile(metaInfoPath, 'utf-8');
              // Try to parse as JSON (if it's JSON format)
              const parsedMeta = JSON.parse(metaContent);
              if (parsedMeta.name) metadata.name = parsedMeta.name;
              if (parsedMeta.resolution) metadata.resolution = parsedMeta.resolution;
              if (parsedMeta.fps) metadata.fps = parsedMeta.fps;
              if (parsedMeta.duration) metadata.duration = parsedMeta.duration;
            } catch (e) {
              // If not JSON or error, use defaults
              console.log(`[IPC] Could not parse metadata for ${folder.name}, using defaults`);
            }
          }

          // Calculate folder size (simplified - just count files)
          let fileCount = 0;
          try {
            const filesInProject = await fs.readdir(projectPath);
            fileCount = filesInProject.length;
          } catch (e) {
            // Ignore errors
          }

          projects.push({
            id: folder.name, // Use folder name as ID
            name: metadata.name,
            path: projectPath,
            resolution: metadata.resolution,
            fps: metadata.fps,
            duration: metadata.duration > 0 ? `${Math.floor(metadata.duration / 60)}:${String(Math.floor(metadata.duration % 60)).padStart(2, '0')}` : '00:00',
            size: `${fileCount} Dateien`,
            thumbnail: null, // TODO: Could read from draft_cover
            favorited: false,
            createdAt: stats.birthtime.getTime(),
            modifiedAt: stats.mtime.getTime()
          });
        } catch (error) {
          console.error(`[IPC] Error reading project ${folder.name}:`, error);
        }
      }

      // Sort by modified date (newest first)
      projects.sort((a, b) => b.modifiedAt - a.modifiedAt);

      console.log(`[IPC] Returning ${projects.length} projects`);

      return {
        success: true,
        projects,
        count: projects.length
      };

    } catch (error) {
      console.error('[IPC] Error listing projects:', error);
      return {
        success: false,
        error: error.message,
        projects: []
      };
    }
  });

  // ============================================
  // UUID-BASED PROJECT MANAGEMENT API
  // ============================================

  // Project APIs
  ipcMain.handle('project:create', async (event, name, options) => {
    console.log('[IPC] project:create', name, options);
    try {
      const result = await projectManager.createProject(name, options);

      // Setze currentProjectPath wenn Projekt erfolgreich erstellt wurde
      if (result.success && result.projectPath) {
        currentProjectPath = result.projectPath;
        console.log('[IPC] Set currentProjectPath after creation:', currentProjectPath);
      }

      return result;
    } catch (error) {
      console.error('[IPC] Error creating project:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('project:open', async (event, projectPath, options) => {
    console.log('[IPC] project:open', projectPath);
    try {
      const result = await projectManager.openProject(projectPath, options);
      if (result.success) {
        currentProjectPath = projectPath;
      }
      return result;
    } catch (error) {
      console.error('[IPC] Error opening project:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('project:close', async (event) => {
    console.log('[IPC] project:close');
    try {
      if (currentProjectPath) {
        const result = await projectManager.closeProject(currentProjectPath);
        currentProjectPath = null;
        return result;
      }
      return { success: true };
    } catch (error) {
      console.error('[IPC] Error closing project:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('project:save', async (event, state) => {
    console.log('[IPC] project:save');
    try {
      if (!currentProjectPath) {
        return { success: false, error: 'Kein Projekt geöffnet' };
      }
      return await timelineManager.saveTimeline(currentProjectPath, state, true);
    } catch (error) {
      console.error('[IPC] Error saving project:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('project:listAll', async (event) => {
    console.log('[IPC] project:listAll');
    try {
      return await projectManager.listAllProjects();
    } catch (error) {
      console.error('[IPC] Error listing projects:', error);
      return { success: false, error: error.message, projects: [] };
    }
  });

  ipcMain.handle('project:checkLock', async (event, projectPath) => {
    try {
      return await projectManager.checkLock(projectPath);
    } catch (error) {
      return { exists: false, error: error.message };
    }
  });

  ipcMain.handle('project:delete', async (event, projectPath, options) => {
    console.log('[IPC] project:delete', projectPath, options);
    console.log('[IPC] currentProjectPath before delete:', currentProjectPath);

    try {
      // IMMER currentProjectPath zurücksetzen wenn es den gelöschten Pfad enthält
      if (currentProjectPath && currentProjectPath === projectPath) {
        console.log('[IPC] Resetting currentProjectPath because project will be deleted');
        await projectManager.closeProject(currentProjectPath);
        currentProjectPath = null;
      }

      const result = await projectManager.deleteProject(projectPath, options);

      console.log('[IPC] Delete result:', result);

      // Zusätzliche Sicherheit: Setze currentProjectPath auf null wenn Löschen erfolgreich
      if (result.success && currentProjectPath === projectPath) {
        console.log('[IPC] Force resetting currentProjectPath after successful deletion');
        currentProjectPath = null;
      }

      return result;
    } catch (error) {
      console.error('[IPC] Error deleting project:', error);
      return { success: false, error: error.message };
    }
  });

  // Settings APIs
  ipcMain.handle('settings:getBasePath', async (event) => {
    console.log('[IPC] settings:getBasePath');
    try {
      return { success: true, path: projectManager.getBasePath() };
    } catch (error) {
      console.error('[IPC] Error getting base path:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('settings:setBasePath', async (event, newPath) => {
    console.log('[IPC] settings:setBasePath', newPath);
    try {
      const path = projectManager.setBasePath(newPath);
      return { success: true, path };
    } catch (error) {
      console.error('[IPC] Error setting base path:', error);
      return { success: false, error: error.message };
    }
  });

  // Asset APIs
  ipcMain.handle('asset:import', async (event, projectPath, filePath, copyMode, metadata) => {
    console.log('[IPC] asset:import', filePath, copyMode);
    try {
      return await assetRegistry.importAsset(projectPath, filePath, copyMode, metadata);
    } catch (error) {
      console.error('[IPC] Error importing asset:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('asset:update', async (event, projectPath, assetUuid, updates) => {
    console.log('[IPC] asset:update', assetUuid);
    try {
      return await assetRegistry.updateAsset(projectPath, assetUuid, updates);
    } catch (error) {
      console.error('[IPC] Error updating asset:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('asset:remove', async (event, projectPath, assetUuid, deleteFile) => {
    console.log('[IPC] asset:remove', assetUuid);
    try {
      return await assetRegistry.removeAsset(projectPath, assetUuid, deleteFile);
    } catch (error) {
      console.error('[IPC] Error removing asset:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('asset:resolve', async (event, projectPath, assetUuid, useProxy) => {
    try {
      return await assetRegistry.resolveAssetPath(projectPath, assetUuid, useProxy);
    } catch (error) {
      console.error('[IPC] Error resolving asset:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('asset:list', async (event, projectPath, filter) => {
    try {
      return await assetRegistry.listAssets(projectPath, filter);
    } catch (error) {
      console.error('[IPC] Error listing assets:', error);
      return { success: false, error: error.message, assets: [] };
    }
  });

  ipcMain.handle('asset:findOffline', async (event, projectPath) => {
    try {
      return await assetRegistry.findOfflineAssets(projectPath);
    } catch (error) {
      console.error('[IPC] Error finding offline assets:', error);
      return { success: false, error: error.message, offlineAssets: [] };
    }
  });

  // Timeline APIs
  ipcMain.handle('timeline:load', async (event, projectPath, version) => {
    try {
      return await timelineManager.loadTimeline(projectPath, version);
    } catch (error) {
      console.error('[IPC] Error loading timeline:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('timeline:save', async (event, projectPath, timelineState, createHistory) => {
    try {
      console.log('[IPC] timeline:save', projectPath, 'createHistory:', createHistory);
      return await timelineManager.saveTimeline(projectPath, timelineState, createHistory);
    } catch (error) {
      console.error('[IPC] Error saving timeline:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('timeline:createSnapshot', async (event, projectPath, timelineData, label) => {
    try {
      return await timelineManager.createSnapshot(projectPath, timelineData, label);
    } catch (error) {
      console.error('[IPC] Error creating snapshot:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('timeline:listHistory', async (event, projectPath) => {
    try {
      return await timelineManager.listHistory(projectPath);
    } catch (error) {
      console.error('[IPC] Error listing history:', error);
      return { success: false, error: error.message, history: [] };
    }
  });

  ipcMain.handle('timeline:rollback', async (event, projectPath, historyFilename) => {
    try {
      return await timelineManager.rollback(projectPath, historyFilename);
    } catch (error) {
      console.error('[IPC] Error rolling back:', error);
      return { success: false, error: error.message };
    }
  });

  // Cache APIs
  ipcMain.handle('cache:getThumbnail', async (event, projectPath, assetUuid, assetPath, time) => {
    try {
      // Versuche aus Cache
      const cached = await cacheManager.getCachedThumbnail(projectPath, assetUuid, time);
      if (cached.exists) {
        return cached;
      }

      // Generiere neu
      return await cacheManager.generateThumbnail(projectPath, assetUuid, assetPath, time);
    } catch (error) {
      console.error('[IPC] Error getting thumbnail:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('cache:getWaveform', async (event, projectPath, assetUuid, assetPath) => {
    try {
      // Versuche aus Cache
      const cached = await cacheManager.getCachedWaveform(projectPath, assetUuid);
      if (cached.exists) {
        return cached;
      }

      // Generiere neu
      return await cacheManager.generateWaveform(projectPath, assetUuid, assetPath);
    } catch (error) {
      console.error('[IPC] Error getting waveform:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('cache:calculateSize', async (event, projectPath) => {
    try {
      return await cacheManager.calculateCacheSize(projectPath);
    } catch (error) {
      console.error('[IPC] Error calculating cache size:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('cache:clear', async (event, projectPath, type) => {
    try {
      return await cacheManager.clearCache(projectPath, type);
    } catch (error) {
      console.error('[IPC] Error clearing cache:', error);
      return { success: false, error: error.message };
    }
  });

  // Proxy APIs
  ipcMain.handle('proxy:generate', async (event, projectPath, assetUuid, assetPath, profile) => {
    console.log('[IPC] proxy:generate', assetUuid, profile);
    try {
      return await proxyGenerator.generate(projectPath, assetUuid, assetPath, profile);
    } catch (error) {
      console.error('[IPC] Error generating proxy:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('proxy:checkStatus', async (event, projectPath, assetUuid) => {
    try {
      return await proxyGenerator.checkStatus(projectPath, assetUuid);
    } catch (error) {
      console.error('[IPC] Error checking proxy status:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('proxy:delete', async (event, projectPath, assetUuid) => {
    try {
      return await proxyGenerator.deleteProxy(projectPath, assetUuid);
    } catch (error) {
      console.error('[IPC] Error deleting proxy:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('proxy:getQueue', async (event) => {
    try {
      return { success: true, queue: proxyGenerator.getQueue() };
    } catch (error) {
      return { success: false, error: error.message, queue: [] };
    }
  });

  // Migration APIs
  ipcMain.handle('migration:scan', async (event) => {
    console.log('[IPC] migration:scan');
    try {
      return await migrationService.scanOldProjects();
    } catch (error) {
      console.error('[IPC] Error scanning projects:', error);
      return { success: false, error: error.message, projects: [] };
    }
  });

  ipcMain.handle('migration:migrate', async (event, projectPath) => {
    console.log('[IPC] migration:migrate', projectPath);
    try {
      return await migrationService.migrateProject(projectPath);
    } catch (error) {
      console.error('[IPC] Error migrating project:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('migration:batchMigrate', async (event, projectPaths) => {
    console.log('[IPC] migration:batchMigrate', projectPaths.length);
    try {
      return await migrationService.batchMigrate(projectPaths, (progress) => {
        // Send progress updates
        mainWindow.webContents.send('migration:progress', progress);
      });
    } catch (error) {
      console.error('[IPC] Error batch migrating:', error);
      return { success: false, error: error.message };
    }
  });

  // Proxy Progress Events
  proxyGenerator.onProgress((progress) => {
    if (mainWindow) {
      mainWindow.webContents.send('proxy:progress', progress);
    }
  });

  proxyGenerator.onJobCompleted((job) => {
    if (mainWindow) {
      mainWindow.webContents.send('proxy:completed', job);
    }
  });

  proxyGenerator.onJobFailed((job) => {
    if (mainWindow) {
      mainWindow.webContents.send('proxy:failed', job);
    }
  });

  // Export APIs
  ipcMain.handle('export:timeline', async (event, projectPath, outputPath, options) => {
    console.log('[IPC] export:timeline', outputPath);
    try {
      return await exportManager.exportTimeline(projectPath || currentProjectPath, outputPath, options);
    } catch (error) {
      console.error('[IPC] Error exporting timeline:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('export:audio', async (event, projectPath, outputPath, options) => {
    console.log('[IPC] export:audio', outputPath);
    try {
      return await exportManager.exportAudio(projectPath || currentProjectPath, outputPath, options);
    } catch (error) {
      console.error('[IPC] Error exporting audio:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('export:preview', async (event, projectPath, outputPath) => {
    console.log('[IPC] export:preview', outputPath);
    try {
      return await exportManager.exportPreview(projectPath || currentProjectPath, outputPath);
    } catch (error) {
      console.error('[IPC] Error exporting preview:', error);
      return { success: false, error: error.message };
    }
  });
}

// App Start
app.whenReady().then(async () => {
  await initCacheDir();
  await ffmpegHandler.initialize();
  setupIPCHandlers();
  createWindow();
});

// Alle Fenster geschlossen
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Aktivieren (macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Vor Beenden
app.on('before-quit', async (event) => {
  // Optional: Cache cleanup
  console.log('App is quitting...');
});

// Fehlerbehandlung
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  dialog.showErrorBox('Unerwarteter Fehler', error.message);
});
