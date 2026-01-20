/**
 * timelineManager.cjs
 * 
 * Timeline Manager - Versionierte Timeline-Persistierung
 * Handles save, load, history, snapshots, rollback
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

/**
 * Lädt Timeline
 */
async function loadTimeline(projectPath, version = null) {
  try {
    let timelinePath;
    
    if (version) {
      // Lade spezifische Version
      timelinePath = path.join(projectPath, 'timeline/history', `${version}.json`);
    } else {
      // Lade aktive Timeline
      const manifestPath = path.join(projectPath, 'project.json');
      const manifestContent = await fs.readFile(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);
      timelinePath = path.join(projectPath, manifest.active_timeline);
    }
    
    const timelineContent = await fs.readFile(timelinePath, 'utf8');
    const timeline = JSON.parse(timelineContent);
    
    return {
      success: true,
      timeline
    };
  } catch (err) {
    console.error('[TimelineManager] Error loading timeline:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Speichert Timeline (atomic)
 */
async function saveTimeline(projectPath, timelineState, createHistory = true) {
  console.log('[TimelineManager] Saving timeline...');
  
  try {
    // 1. Lade Manifest
    const manifestPath = path.join(projectPath, 'project.json');
    const manifestContent = await fs.readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    // 2. Timeline-Daten vorbereiten
    const timelineData = {
      version: '1.0.0',
      saved_at: new Date().toISOString(),
      duration: timelineState.projectDuration || 0,
      tracks: timelineState.tracks || [],
      
      // Zusätzliche State-Felder für vollständiges Wiederherstellen
      selectedClipId: timelineState.selectedClipId || null,
      selectedClipIds: timelineState.selectedClipIds || [],
      snapping: timelineState.snapping !== undefined ? timelineState.snapping : true,
      rippleMode: timelineState.rippleMode || false,
      linkedPairs: timelineState.linkedPairs || [],
      trackControls: timelineState.trackControls || {},
      
      // Timeline-View-State
      zoom: timelineState.zoom || 1,
      scrollPosition: timelineState.scrollPosition || 0,
      
      // Playhead-Position
      playheadPosition: timelineState.playheadPosition || 0
    };
    
    const timelineJson = JSON.stringify(timelineData, null, 2);
    
    // 3. Atomic Save: Schreibe zu .tmp, dann rename
    const timelinePath = path.join(projectPath, manifest.active_timeline);
    const tmpPath = `${timelinePath}.tmp`;
    
    await fs.writeFile(tmpPath, timelineJson, 'utf8');
    await fs.rename(tmpPath, timelinePath);
    
    console.log('[TimelineManager] Timeline saved (atomic)');
    
    // 4. History-Snapshot erstellen (wenn gewünscht)
    if (createHistory) {
      await createSnapshot(projectPath, timelineData);
    }
    
    // 5. Aktualisiere last_saved_at in Manifest
    manifest.last_saved_at = timelineData.saved_at;
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    
    return {
      success: true,
      savedAt: timelineData.saved_at
    };
  } catch (err) {
    console.error('[TimelineManager] Error saving timeline:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Erstellt manuellen Snapshot
 */
async function createSnapshot(projectPath, timelineData = null, label = null) {
  try {
    // Lade Timeline wenn nicht übergeben
    if (!timelineData) {
      const loadResult = await loadTimeline(projectPath);
      if (!loadResult.success) {
        return loadResult;
      }
      timelineData = loadResult.timeline;
    }
    
    // Timestamp für Dateinamen
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = label ? 
      `timeline_${timestamp}_${label}.json` : 
      `timeline_${timestamp}.json`;
    
    const historyPath = path.join(projectPath, 'timeline/history', filename);
    
    // Speichere Snapshot
    await fs.writeFile(historyPath, JSON.stringify(timelineData, null, 2), 'utf8');
    
    console.log(`[TimelineManager] Snapshot created: ${filename}`);
    
    // Cleanup: Behalte nur die letzten 50 Versionen
    await cleanupHistory(projectPath, 50);
    
    return {
      success: true,
      filename
    };
  } catch (err) {
    console.error('[TimelineManager] Error creating snapshot:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Listet alle verfügbaren History-Versionen
 */
async function listHistory(projectPath) {
  try {
    const historyDir = path.join(projectPath, 'timeline/history');
    
    // Prüfe ob History-Ordner existiert
    try {
      await fs.access(historyDir);
    } catch (err) {
      return {
        success: true,
        history: []
      };
    }
    
    const files = await fs.readdir(historyDir);
    const historyFiles = files
      .filter(f => f.startsWith('timeline_') && f.endsWith('.json'))
      .sort()
      .reverse(); // Neueste zuerst
    
    const history = [];
    
    for (const file of historyFiles) {
      const filePath = path.join(historyDir, file);
      const stats = await fs.stat(filePath);
      
      // Parse Timestamp aus Dateinamen
      const match = file.match(/timeline_(.+)\.json/);
      const timestamp = match ? match[1] : null;
      
      history.push({
        filename: file,
        timestamp,
        size: stats.size,
        modifiedAt: stats.mtime.toISOString()
      });
    }
    
    return {
      success: true,
      history
    };
  } catch (err) {
    console.error('[TimelineManager] Error listing history:', err);
    return {
      success: false,
      error: err.message,
      history: []
    };
  }
}

/**
 * Rollback zu bestimmter Version
 */
async function rollback(projectPath, historyFilename) {
  console.log(`[TimelineManager] Rolling back to: ${historyFilename}`);
  
  try {
    // 1. Lade History-Version
    const historyPath = path.join(projectPath, 'timeline/history', historyFilename);
    const historyContent = await fs.readFile(historyPath, 'utf8');
    const historyTimeline = JSON.parse(historyContent);
    
    // 2. Erstelle Backup der aktuellen Timeline
    const currentResult = await loadTimeline(projectPath);
    if (currentResult.success) {
      await createSnapshot(projectPath, currentResult.timeline, 'pre-rollback-backup');
    }
    
    // 3. Schreibe History-Version als aktive Timeline
    const manifestPath = path.join(projectPath, 'project.json');
    const manifestContent = await fs.readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    const timelinePath = path.join(projectPath, manifest.active_timeline);
    const tmpPath = `${timelinePath}.tmp`;
    
    await fs.writeFile(tmpPath, JSON.stringify(historyTimeline, null, 2), 'utf8');
    await fs.rename(tmpPath, timelinePath);
    
    console.log('[TimelineManager] Rollback successful');
    
    return {
      success: true,
      timeline: historyTimeline
    };
  } catch (err) {
    console.error('[TimelineManager] Error during rollback:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Bereinigt alte History-Einträge
 */
async function cleanupHistory(projectPath, maxVersions = 50) {
  try {
    const historyDir = path.join(projectPath, 'timeline/history');
    const files = await fs.readdir(historyDir);
    
    const historyFiles = files
      .filter(f => f.startsWith('timeline_') && f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: path.join(historyDir, f)
      }));
    
    // Sortiere nach Datum (Dateinamen)
    historyFiles.sort((a, b) => b.name.localeCompare(a.name));
    
    // Lösche alte Versionen
    if (historyFiles.length > maxVersions) {
      const toDelete = historyFiles.slice(maxVersions);
      
      for (const file of toDelete) {
        await fs.unlink(file.path);
        console.log(`[TimelineManager] Deleted old history: ${file.name}`);
      }
    }
    
    return {
      success: true,
      deleted: Math.max(0, historyFiles.length - maxVersions)
    };
  } catch (err) {
    console.error('[TimelineManager] Error cleaning history:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Auto-Save Funktion
 */
async function autoSave(projectPath, timelineState) {
  console.log('[TimelineManager] Auto-saving...');
  
  try {
    // Speichere Timeline mit History
    const result = await saveTimeline(projectPath, timelineState, true);
    
    if (result.success) {
      // Log Auto-Save
      const logPath = path.join(projectPath, 'logs/autosave.log');
      const logEntry = `${new Date().toISOString()} - Auto-save successful\n`;
      await fs.appendFile(logPath, logEntry, 'utf8');
    }
    
    return result;
  } catch (err) {
    console.error('[TimelineManager] Error during auto-save:', err);
    
    // Log Error
    const logPath = path.join(projectPath, 'logs/errors.log');
    const logEntry = `${new Date().toISOString()} - Auto-save failed: ${err.message}\n`;
    await fs.appendFile(logPath, logEntry, 'utf8');
    
    return {
      success: false,
      error: err.message
    };
  }
}

module.exports = {
  loadTimeline,
  saveTimeline,
  createSnapshot,
  listHistory,
  rollback,
  cleanupHistory,
  autoSave
};
