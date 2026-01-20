/**
 * projectManager.cjs
 * 
 * Core Project Manager - UUID-based project structure
 * Handles project lifecycle: create, open, close, validate
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const { app } = require('electron');

// Konfigurationsdatei-Pfad
const getConfigPath = () => {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'config.json');
};

// Lade Konfiguration
const loadConfig = () => {
  try {
    const configPath = getConfigPath();
    if (fsSync.existsSync(configPath)) {
      const data = fsSync.readFileSync(configPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('[ProjectManager] Could not load config:', err.message);
  }
  return {};
};

// Speichere Konfiguration
const saveConfig = (config) => {
  try {
    const configPath = getConfigPath();
    fsSync.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[ProjectManager] Could not save config:', err.message);
    return false;
  }
};

// Konfigurierbare Basis-Pfade
const getBasePath = () => {
  const config = loadConfig();
  const customPath = config.projectsBasePath;
  
  if (customPath && fsSync.existsSync(customPath)) {
    return customPath;
  }
  
  // Default: Aktueller Pfad oder Documents
  const defaultPath = 'C:\\Users\\jacqu\\OneDrive\\Desktop\\Wind and Lightning Projekts\\com.lveditor.draft';
  
  if (fsSync.existsSync(defaultPath)) {
    return defaultPath;
  }
  
  // Fallback: Documents/Wind and Lightning Projekts/com.lveditor.draft
  return path.join(
    app.getPath('documents'),
    'Wind and Lightning Projekts',
    'com.lveditor.draft'
  );
};

const setBasePath = (newPath) => {
  const config = loadConfig();
  config.projectsBasePath = newPath;
  saveConfig(config);
  return getBasePath();
};

const BASE_PATH = getBasePath();

/**
 * Validiert Projektnamen auf Windows-ungültige Zeichen
 */
function validateProjectName(name) {
  const invalidChars = /[<>:"\/\\|?*]/;
  
  if (!name || name.length === 0) {
    return { valid: false, error: 'Projektname darf nicht leer sein' };
  }
  
  if (invalidChars.test(name)) {
    return { valid: false, error: 'Ungültige Zeichen im Projektnamen (<>:"/\\|?*)' };
  }
  
  if (name.trim() !== name) {
    return { valid: false, error: 'Projektname darf keine führenden/folgenden Leerzeichen haben' };
  }
  
  if (name.length > 255) {
    return { valid: false, error: 'Projektname zu lang (max. 255 Zeichen)' };
  }
  
  return { valid: true };
}

/**
 * Prüft ob Pfad in OneDrive liegt
 */
function isOneDrivePath(projectPath) {
  const normalizedPath = projectPath.toLowerCase();
  return normalizedPath.includes('onedrive');
}

/**
 * Erstellt die vollständige Ordnerstruktur für ein neues Projekt
 */
async function createProjectStructure(projectPath) {
  const dirs = [
    'assets/media/video',
    'assets/media/audio',
    'assets/media/images',
    'assets/proxies',
    'timeline/history',
    'cache/thumbnails',
    'cache/waveforms',
    'cache/render_cache',
    'metadata/color_grading',
    'logs'
  ];

  for (const dir of dirs) {
    await fs.mkdir(path.join(projectPath, dir), { recursive: true });
  }
}

/**
 * Erstellt initiale Manifest-Dateien
 */
async function initializeManifests(projectPath, projectName, options = {}) {
  const projectId = crypto.randomUUID();
  const now = new Date().toISOString();
  
  // project.json
  const projectManifest = {
    project_id: projectId,
    name: projectName,
    created_at: now,
    last_saved_at: now,
    version: '1.0.0',
    fps: options.fps || 30,
    resolution: options.resolution || { width: 1920, height: 1080 },
    sample_rate: options.sampleRate || 48000,
    active_timeline: 'timeline/timeline_v1.json',
    assets_index: 'assets/index.json',
    settings_file: 'settings.json'
  };
  
  // assets/index.json
  const assetsIndex = {
    version: '1.0.0',
    assets: {}
  };
  
  // timeline/timeline_v1.json
  const timeline = {
    version: '1.0.0',
    saved_at: now,
    duration: 0,
    tracks: [
      {
        id: 't2',
        name: 'Main Track',
        type: 'audio',
        clips: [],
        muted: false,
        locked: false,
        height: 80
      }
    ]
  };
  
  // settings.json
  const settings = {
    autosave_interval: 300,
    proxy_quality: '720p',
    cache_limit_gb: 1,
    use_proxy: true
  };
  
  // metadata/markers.json
  const markers = {
    markers: [],
    chapters: [],
    comments: []
  };
  
  // Schreibe alle Dateien
  await fs.writeFile(
    path.join(projectPath, 'project.json'),
    JSON.stringify(projectManifest, null, 2),
    'utf8'
  );
  
  await fs.writeFile(
    path.join(projectPath, 'assets/index.json'),
    JSON.stringify(assetsIndex, null, 2),
    'utf8'
  );
  
  await fs.writeFile(
    path.join(projectPath, 'timeline/timeline_v1.json'),
    JSON.stringify(timeline, null, 2),
    'utf8'
  );
  
  await fs.writeFile(
    path.join(projectPath, 'settings.json'),
    JSON.stringify(settings, null, 2),
    'utf8'
  );
  
  await fs.writeFile(
    path.join(projectPath, 'metadata/markers.json'),
    JSON.stringify(markers, null, 2),
    'utf8'
  );
  
  // Leere Log-Dateien
  await fs.writeFile(path.join(projectPath, 'logs/autosave.log'), '', 'utf8');
  await fs.writeFile(path.join(projectPath, 'logs/errors.log'), '', 'utf8');
  
  return projectManifest;
}

/**
 * Lock-System: Erstellt .lock Datei
 */
async function acquireLock(projectPath, options = {}) {
  const lockPath = path.join(projectPath, '.lock');
  
  // Prüfe ob Lock existiert
  try {
    const existingLock = await fs.readFile(lockPath, 'utf8');
    const lockData = JSON.parse(existingLock);
    
    // Wenn es der gleiche Prozess ist, überschreibe einfach das Lock
    if (lockData.pid === process.pid) {
      console.log('[ProjectManager] Overwriting own lock');
      // Fahre fort mit Erstellen eines neuen Locks
    } else {
      // Prüfe ob Lock abgelaufen ist (> 1 Stunde) ODER ob Prozess nicht mehr läuft
      const lockAge = Date.now() - new Date(lockData.openedAt).getTime();
      const processStillRunning = isProcessRunning(lockData.pid);
      
      if (lockAge < 3600000 && processStillRunning && !options.force) {
        return {
          success: false,
          locked: true,
          lockInfo: lockData
        };
      }
      
      // Lock ist stale oder Prozess läuft nicht mehr
      if (!processStillRunning || lockAge >= 3600000) {
        console.log('[ProjectManager] Removing stale lock before acquiring new one');
        try {
          await fs.unlink(lockPath);
        } catch (err) {
          // Ignoriere Fehler
        }
      }
    }
  } catch (err) {
    // Kein Lock vorhanden oder Fehler beim Lesen - das ist OK
  }
  
  // Erstelle neuen Lock
  const lockData = {
    user: os.userInfo().username,
    hostname: os.hostname(),
    pid: process.pid,
    openedAt: new Date().toISOString()
  };
  
  await fs.writeFile(lockPath, JSON.stringify(lockData, null, 2), 'utf8');
  
  return { success: true, locked: false };
}

/**
 * Lock-System: Entfernt .lock Datei
 */
async function releaseLock(projectPath) {
  const lockPath = path.join(projectPath, '.lock');
  
  try {
    await fs.unlink(lockPath);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Prüft ob ein Prozess noch läuft
 */
function isProcessRunning(pid) {
  try {
    // process.kill(pid, 0) wirft einen Error wenn Prozess nicht existiert
    // Signal 0 prüft nur Existenz, tötet den Prozess nicht
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Prüft Lock-Status (mit intelligenter Validierung)
 */
async function checkLock(projectPath) {
  const lockPath = path.join(projectPath, '.lock');
  
  try {
    const lockContent = await fs.readFile(lockPath, 'utf8');
    const lockData = JSON.parse(lockContent);
    
    // Prüfe ob der Prozess noch existiert
    if (lockData.pid && !isProcessRunning(lockData.pid)) {
      // Prozess existiert nicht mehr -> Lock ist stale/ungültig
      console.log(`[ProjectManager] Stale lock detected (PID ${lockData.pid} not running), removing...`);
      
      // Lösche stale Lock
      try {
        await fs.unlink(lockPath);
      } catch (unlinkErr) {
        console.warn('[ProjectManager] Could not remove stale lock:', unlinkErr.message);
      }
      
      return { exists: false, stale: true };
    }
    
    // Zusätzlich: Prüfe Lock-Alter (> 1 Stunde = stale)
    if (lockData.openedAt) {
      const lockAge = Date.now() - new Date(lockData.openedAt).getTime();
      if (lockAge > 3600000) { // 1 Stunde
        console.log(`[ProjectManager] Stale lock detected (age: ${Math.floor(lockAge / 60000)} minutes), removing...`);
        
        try {
          await fs.unlink(lockPath);
        } catch (unlinkErr) {
          console.warn('[ProjectManager] Could not remove stale lock:', unlinkErr.message);
        }
        
        return { exists: false, stale: true };
      }
    }
    
    // Lock ist valide
    return {
      exists: true,
      ...lockData
    };
  } catch (err) {
    return { exists: false };
  }
}

/**
 * Erstellt ein neues Projekt
 */
async function createProject(projectName, options = {}) {
  console.log(`[ProjectManager] Creating project: "${projectName}"`);
  
  // Validierung
  const validation = validateProjectName(projectName);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error
    };
  }
  
  // Projektpfad
  const projectPath = path.join(BASE_PATH, projectName);
  
  // Prüfe ob Projekt bereits existiert
  try {
    await fs.access(projectPath);
    
    // Ordner existiert - prüfe ob es ein valides Projekt ist
    console.log('[ProjectManager] Project folder already exists, checking validity...');
    
    // Prüfe Lock - wenn stale, entferne es
    const lockStatus = await checkLock(projectPath);
    if (lockStatus.stale) {
      console.log('[ProjectManager] Stale lock was removed during check');
    }
    
    // Prüfe ob project.json existiert
    try {
      await fs.access(path.join(projectPath, 'project.json'));
      // Valides Projekt existiert
      return {
        success: false,
        error: 'Projekt existiert bereits'
      };
    } catch (err) {
      // project.json existiert nicht - Ordner ist ungültig/Rest vom Löschen
      console.log('[ProjectManager] Invalid project folder found (no project.json), cleaning up...');
      
      // Lösche ungültigen Ordner
      try {
        await fs.rm(projectPath, { recursive: true, force: true });
        console.log('[ProjectManager] Cleaned up invalid project folder');
        
        // Kurze Verzögerung damit Dateisystem aufräumen kann
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (cleanupErr) {
        console.error('[ProjectManager] Could not cleanup invalid folder:', cleanupErr);
        return {
          success: false,
          error: 'Ordner existiert bereits und konnte nicht bereinigt werden'
        };
      }
    }
  } catch (err) {
    // Gut, Projekt existiert nicht
  }
  
  try {
    // 1. Ordnerstruktur erstellen
    await createProjectStructure(projectPath);
    console.log('[ProjectManager] Folder structure created');
    
    // 2. Manifests erstellen
    const manifest = await initializeManifests(projectPath, projectName, options);
    console.log('[ProjectManager] Manifests initialized');
    
    // 3. Lock erwerben
    await acquireLock(projectPath);
    console.log('[ProjectManager] Lock acquired');
    
    // 4. OneDrive-Warnung
    const oneDriveWarning = isOneDrivePath(projectPath) ? 
      'WARNUNG: Projekt liegt in OneDrive. Cache-Ordner sollten von Sync ausgeschlossen werden.' : null;
    
    if (oneDriveWarning) {
      console.warn(`[ProjectManager] ${oneDriveWarning}`);
    }
    
    return {
      success: true,
      projectPath,
      projectId: manifest.project_id,
      manifest,
      oneDriveWarning
    };
  } catch (err) {
    console.error('[ProjectManager] Error creating project:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Öffnet ein bestehendes Projekt
 */
async function openProject(projectPath, options = {}) {
  console.log(`[ProjectManager] Opening project: "${projectPath}"`);
  
  try {
    // 1. Prüfe ob Projektordner existiert
    await fs.access(projectPath);
    
    // 2. Prüfe Lock
    const lockStatus = await checkLock(projectPath);
    
    // ✅ Wenn Lock existiert, prüfe ob es UNSER eigenes Lock ist
    if (lockStatus.exists && !options.readOnly && !options.force) {
      // Wenn es unser eigener Prozess ist, erlaube Öffnen (überschreibe Lock)
      const isOwnLock = lockStatus.pid === process.pid;
      
      if (!isOwnLock) {
        // Fremdes Lock → Blockieren
        console.log('[ProjectManager] Project locked by another process');
        return {
          success: false,
          locked: true,
          lockInfo: lockStatus
        };
      }
      
      // Eigenes Lock → Erlauben und Log ausgeben
      console.log('[ProjectManager] Project has own lock, allowing re-open');
    }
    
    // 3. Lade project.json
    const manifestPath = path.join(projectPath, 'project.json');
    const manifestContent = await fs.readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    // 4. Validiere Struktur
    const validation = await validateProjectIntegrity(projectPath, manifest);
    
    if (!validation.valid) {
      console.warn('[ProjectManager] Project integrity issues:', validation.issues);
    }
    
    // 5. Lock erwerben (wenn nicht read-only)
    // acquireLock überschreibt automatisch eigene Locks
    if (!options.readOnly) {
      const lockResult = await acquireLock(projectPath, { force: options.force });
      if (!lockResult.success) {
        return lockResult;
      }
    }
    
    console.log('[ProjectManager] Project opened successfully');
    
    return {
      success: true,
      projectPath,
      manifest,
      readOnly: options.readOnly || false,
      integrityIssues: validation.issues
    };
  } catch (err) {
    console.error('[ProjectManager] Error opening project:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Schließt das aktuelle Projekt
 */
async function closeProject(projectPath) {
  console.log(`[ProjectManager] Closing project: "${projectPath}"`);
  
  try {
    // Lock freigeben
    await releaseLock(projectPath);
    
    return { success: true };
  } catch (err) {
    console.error('[ProjectManager] Error closing project:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Validiert Projektstruktur-Integrität
 */
async function validateProjectIntegrity(projectPath, manifest) {
  const issues = [];
  
  // Prüfe erforderliche Dateien
  const requiredFiles = [
    'project.json',
    'assets/index.json',
    'timeline/timeline_v1.json',
    'settings.json'
  ];
  
  for (const file of requiredFiles) {
    const filePath = path.join(projectPath, file);
    try {
      await fs.access(filePath);
    } catch (err) {
      issues.push(`Fehlende Datei: ${file}`);
    }
  }
  
  // Prüfe erforderliche Ordner
  const requiredDirs = [
    'assets',
    'timeline',
    'cache',
    'metadata',
    'logs'
  ];
  
  for (const dir of requiredDirs) {
    const dirPath = path.join(projectPath, dir);
    try {
      const stat = await fs.stat(dirPath);
      if (!stat.isDirectory()) {
        issues.push(`${dir} ist kein Ordner`);
      }
    } catch (err) {
      issues.push(`Fehlender Ordner: ${dir}`);
    }
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Listet alle Projekte im Basis-Ordner
 */
async function listAllProjects() {
  console.log('[ProjectManager] Listing all projects...');
  
  try {
    // Stelle sicher, dass BASE_PATH existiert
    await fs.mkdir(BASE_PATH, { recursive: true });
    
    const entries = await fs.readdir(BASE_PATH, { withFileTypes: true });
    const projects = [];
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      
      const projectPath = path.join(BASE_PATH, entry.name);
      const manifestPath = path.join(projectPath, 'project.json');
      
      try {
        const manifestContent = await fs.readFile(manifestPath, 'utf8');
        const manifest = JSON.parse(manifestContent);
        
        projects.push({
          id: manifest.project_id,
          project_id: manifest.project_id,
          name: manifest.name,
          path: projectPath,
          created: manifest.created_at,
          lastSaved: manifest.last_saved_at,
          fps: manifest.fps,
          resolution: `${manifest.resolution.width}x${manifest.resolution.height}`,
          size: '0 MB', // TODO: Calculate actual size
          duration: '0:00' // TODO: Calculate from timeline
        });
      } catch (err) {
        console.warn(`[ProjectManager] Skipping invalid project: ${entry.name}`, err.message);
      }
    }
    
    console.log(`[ProjectManager] Found ${projects.length} projects`);
    return {
      success: true,
      projects
    };
  } catch (err) {
    console.error('[ProjectManager] Error listing projects:', err);
    return {
      success: false,
      error: err.message,
      projects: []
    };
  }
}

/**
 * Löscht ein Projekt (Ordner und alle Inhalte)
 */
async function deleteProject(projectPath, options = {}) {
  console.log(`[ProjectManager] Deleting project: "${projectPath}"`);
  
  try {
    // 1. Prüfe ob Projekt existiert
    try {
      await fs.access(projectPath);
    } catch (err) {
      return {
        success: false,
        error: 'Projekt existiert nicht'
      };
    }
    
    // 2. Prüfe Lock - Projekt darf nicht geöffnet sein
    // (checkLock entfernt automatisch stale Locks)
    const lockStatus = await checkLock(projectPath);
    
    // Wenn Lock existiert und es der aktuelle Prozess ist, ist das OK
    // (wird von main.cjs durch Schließen vor Löschen gehandhabt)
    const isOwnLock = lockStatus.exists && lockStatus.pid === process.pid;
    
    if (lockStatus.exists && !isOwnLock && !options.force) {
      return {
        success: false,
        error: 'Projekt ist noch geöffnet. Bitte schließen Sie es zuerst.',
        locked: true,
        lockInfo: lockStatus
      };
    }
    
    // 3. Entferne Lock wenn vorhanden (eigenes Lock oder force)
    if (lockStatus.exists) {
      console.log('[ProjectManager] Removing lock before deletion...');
      await releaseLock(projectPath);
    }
    
    // 4. Lösche Projekt-Ordner rekursiv
    console.log('[ProjectManager] Deleting project folder...');
    await fs.rm(projectPath, { recursive: true, force: true });
    
    // Warte kurz damit Dateisystem aufräumen kann (Windows braucht manchmal etwas länger)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verifiziere dass Ordner wirklich gelöscht wurde
    try {
      await fs.access(projectPath);
      // Ordner existiert noch!
      console.warn('[ProjectManager] Project folder still exists after deletion, retrying...');
      await new Promise(resolve => setTimeout(resolve, 200));
      await fs.rm(projectPath, { recursive: true, force: true });
    } catch (err) {
      // Gut, Ordner existiert nicht mehr
      console.log('[ProjectManager] Project folder successfully deleted');
    }
    
    console.log('[ProjectManager] Project deleted successfully');
    
    return {
      success: true
    };
  } catch (err) {
    console.error('[ProjectManager] Error deleting project:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

module.exports = {
  createProject,
  openProject,
  closeProject,
  deleteProject,
  validateProjectIntegrity,
  acquireLock,
  releaseLock,
  checkLock,
  listAllProjects,
  validateProjectName,
  getBasePath,
  setBasePath,
  BASE_PATH
};
