/**
 * migrationService.cjs
 * 
 * Migration Service - CapCut → UUID Structure Migration
 * Converts old project structure to new UUID-based system
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const projectManager = require('./projectManager.cjs');
const assetRegistry = require('./assetRegistry.cjs');
const timelineManager = require('./timelineManager.cjs');

const OLD_BASE_PATH = 'C:\\Users\\jacqu\\OneDrive\\Desktop\\Wind and Lightning Projekts\\com.lveditor.draft';

/**
 * Scannt nach alten Projekten (CapCut-Struktur)
 */
async function scanOldProjects() {
  console.log('[MigrationService] Scanning for old projects...');
  
  try {
    const entries = await fs.readdir(OLD_BASE_PATH, { withFileTypes: true });
    const oldProjects = [];
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const projectPath = path.join(OLD_BASE_PATH, entry.name);
        
        // Prüfe ob UUID-Projekt (neues Format)
        const hasNewFormat = fsSync.existsSync(path.join(projectPath, 'project.json'));
        
        if (hasNewFormat) {
          // Skip neue Projekte
          continue;
        }
        
        // Prüfe ob CapCut-Projekt (altes Format)
        const hasOldFormat = fsSync.existsSync(path.join(projectPath, 'draft_content')) ||
                            fsSync.existsSync(path.join(projectPath, 'draft_meta_info'));
        
        if (hasOldFormat) {
          const stats = await fs.stat(projectPath);
          
          oldProjects.push({
            name: entry.name,
            path: projectPath,
            modifiedAt: stats.mtime.toISOString(),
            needsMigration: true
          });
        }
      }
    }
    
    console.log(`[MigrationService] Found ${oldProjects.length} old projects`);
    
    return {
      success: true,
      projects: oldProjects
    };
  } catch (err) {
    console.error('[MigrationService] Error scanning projects:', err);
    return {
      success: false,
      error: err.message,
      projects: []
    };
  }
}

/**
 * Migriert ein einzelnes Projekt
 */
async function migrateProject(oldProjectPath) {
  console.log(`[MigrationService] Migrating project: ${oldProjectPath}`);
  
  try {
    const projectName = path.basename(oldProjectPath);
    
    // 1. Erstelle Backup
    const backupPath = `${oldProjectPath}_migrated_backup`;
    console.log(`[MigrationService] Creating backup: ${backupPath}`);
    
    try {
      await fs.access(backupPath);
      // Backup existiert bereits
      console.warn('[MigrationService] Backup already exists, skipping backup creation');
    } catch (err) {
      // Erstelle Backup
      await fs.cp(oldProjectPath, backupPath, { recursive: true });
    }
    
    // 2. Lese alte Projekt-Metadaten
    const oldMetadata = await readOldProjectMetadata(oldProjectPath);
    
    // 3. Erstelle neues Projekt mit UUID-Struktur
    const newProjectName = `${projectName}_migrated`;
    const createResult = await projectManager.createProject(newProjectName, {
      fps: oldMetadata.fps || 30,
      resolution: oldMetadata.resolution || { width: 1920, height: 1080 }
    });
    
    if (!createResult.success) {
      throw new Error(`Failed to create new project: ${createResult.error}`);
    }
    
    const newProjectPath = createResult.projectPath;
    
    // 4. Migriere Media-Dateien
    console.log('[MigrationService] Migrating media files...');
    const mediaMapping = await migrateMediaFiles(oldProjectPath, newProjectPath);
    
    // 5. Migriere Timeline
    console.log('[MigrationService] Migrating timeline...');
    await migrateTimeline(oldProjectPath, newProjectPath, mediaMapping);
    
    // 6. Erstelle Migration-Report
    const report = {
      oldProjectPath,
      newProjectPath,
      backupPath,
      migratedAt: new Date().toISOString(),
      mediaFiles: Object.keys(mediaMapping).length,
      success: true
    };
    
    const reportPath = path.join(newProjectPath, 'migration_report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
    
    console.log(`[MigrationService] Migration completed: ${newProjectPath}`);
    
    return {
      success: true,
      newProjectPath,
      report
    };
  } catch (err) {
    console.error('[MigrationService] Migration failed:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Liest alte Projekt-Metadaten
 */
async function readOldProjectMetadata(oldProjectPath) {
  try {
    // Versuche draft_meta_info zu lesen
    const metaInfoPath = path.join(oldProjectPath, 'draft_meta_info');
    
    try {
      const metaContent = await fs.readFile(metaInfoPath, 'utf8');
      // Parse als JSON (falls vorhanden)
      try {
        return JSON.parse(metaContent);
      } catch (err) {
        // Nicht JSON, return defaults
      }
    } catch (err) {
      // Datei nicht vorhanden
    }
    
    // Defaults
    return {
      fps: 30,
      resolution: { width: 1920, height: 1080 }
    };
  } catch (err) {
    console.warn('[MigrationService] Could not read old metadata:', err);
    return {
      fps: 30,
      resolution: { width: 1920, height: 1080 }
    };
  }
}

/**
 * Migriert Media-Dateien
 */
async function migrateMediaFiles(oldProjectPath, newProjectPath) {
  const mediaMapping = {}; // oldPath → newUUID
  
  // Suche nach Media-Dateien im alten Projekt
  const possibleMediaDirs = [
    'Resources/digitalHuman/video',
    'Resources/digitalHuman/audio',
    'media',
    'assets'
  ];
  
  for (const dir of possibleMediaDirs) {
    const dirPath = path.join(oldProjectPath, dir);
    
    try {
      await fs.access(dirPath);
      
      // Scanne Ordner
      const files = await fs.readdir(dirPath, { recursive: true });
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isFile()) {
          const ext = path.extname(file).toLowerCase();
          const isMedia = ['.mp4', '.mov', '.avi', '.mp3', '.wav', '.jpg', '.png'].includes(ext);
          
          if (isMedia) {
            // Importiere in neues Projekt
            const importResult = await assetRegistry.importAsset(
              newProjectPath,
              filePath,
              'copy'
            );
            
            if (importResult.success) {
              mediaMapping[filePath] = importResult.uuid;
              console.log(`[MigrationService] Migrated: ${file} → ${importResult.uuid}`);
            }
          }
        }
      }
    } catch (err) {
      // Ordner nicht vorhanden
    }
  }
  
  return mediaMapping;
}

/**
 * Migriert Timeline
 */
async function migrateTimeline(oldProjectPath, newProjectPath, mediaMapping) {
  try {
    // Versuche draft_content zu lesen
    const draftContentPath = path.join(oldProjectPath, 'draft_content');
    
    try {
      const draftContent = await fs.readFile(draftContentPath, 'utf8');
      const oldTimeline = JSON.parse(draftContent);
      
      // Konvertiere zu neuer Struktur
      const newTimeline = {
        tracks: []
      };
      
      // Migriere Tracks (simplified)
      if (oldTimeline.tracks) {
        for (const oldTrack of oldTimeline.tracks) {
          const newTrack = {
            id: oldTrack.id || `track_${Date.now()}`,
            name: oldTrack.name || 'Track',
            type: oldTrack.type || 'video',
            clips: [],
            muted: oldTrack.muted || false,
            locked: oldTrack.locked || false,
            height: oldTrack.height || 80
          };
          
          // Migriere Clips
          if (oldTrack.clips) {
            for (const oldClip of oldTrack.clips) {
              // Finde UUID für Media
              const assetUuid = findAssetUuid(oldClip.mediaId, mediaMapping);
              
              if (assetUuid) {
                const newClip = {
                  clip_id: oldClip.id || `clip_${Date.now()}`,
                  asset_uuid: assetUuid,
                  start: oldClip.start || 0,
                  duration: oldClip.duration || 5,
                  in_point: oldClip.in || 0,
                  out_point: oldClip.out || oldClip.duration || 5,
                  transform: oldClip.transform || { x: 0, y: 0, scale: 1, rotation: 0 },
                  opacity: oldClip.opacity || 100,
                  effects: oldClip.effects || [],
                  transitions: oldClip.transitions || {}
                };
                
                newTrack.clips.push(newClip);
              }
            }
          }
          
          newTimeline.tracks.push(newTrack);
        }
      }
      
      // Falls keine Tracks gefunden, erstelle Default
      if (newTimeline.tracks.length === 0) {
        newTimeline.tracks.push({
          id: 't2',
          name: 'Main Track',
          type: 'audio',
          clips: [],
          muted: false,
          locked: false,
          height: 80
        });
      }
      
      // Speichere neue Timeline
      await timelineManager.saveTimeline(newProjectPath, newTimeline, false);
      
      return { success: true };
    } catch (err) {
      console.warn('[MigrationService] Could not read old timeline:', err);
      
      // Erstelle leere Timeline
      await timelineManager.saveTimeline(newProjectPath, { tracks: [] }, false);
      
      return { success: true, warning: 'Timeline konnte nicht migriert werden' };
    }
  } catch (err) {
    console.error('[MigrationService] Error migrating timeline:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Findet UUID für altes Media-Item
 */
function findAssetUuid(oldMediaId, mediaMapping) {
  // Suche in Mapping
  for (const [oldPath, uuid] of Object.entries(mediaMapping)) {
    if (oldPath.includes(oldMediaId)) {
      return uuid;
    }
  }
  
  return null;
}

/**
 * Batch-Migration mehrerer Projekte
 */
async function batchMigrate(projectPaths, progressCallback) {
  console.log(`[MigrationService] Batch migrating ${projectPaths.length} projects`);
  
  const results = [];
  
  for (let i = 0; i < projectPaths.length; i++) {
    const projectPath = projectPaths[i];
    
    console.log(`[MigrationService] Migrating ${i + 1}/${projectPaths.length}: ${projectPath}`);
    
    const result = await migrateProject(projectPath);
    results.push(result);
    
    if (progressCallback) {
      progressCallback({
        current: i + 1,
        total: projectPaths.length,
        currentProject: projectPath,
        result
      });
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  
  return {
    success: true,
    total: projectPaths.length,
    successful: successCount,
    failed: projectPaths.length - successCount,
    results
  };
}

module.exports = {
  scanOldProjects,
  migrateProject,
  batchMigrate
};
