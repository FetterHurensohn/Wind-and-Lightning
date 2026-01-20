/**
 * projectStructureHandler.cjs
 * 
 * Erstellt vollständige CapCut-Projektstruktur im lokalen Dateisystem
 * Basis: C:\Users\jacqu\OneDrive\Desktop\Wind and Lightning Projekts\com.lveditor.draft
 */

const fs = require('fs').promises;
const path = require('path');

const BASE_PATH = 'C:\\Users\\jacqu\\OneDrive\\Desktop\\Wind and Lightning Projekts\\com.lveditor.draft';

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
 * Vollständige CapCut-Projektstruktur-Definition
 */
function getProjectStructure(projectPath) {
  return [
    // Root-Dateien (in Projektordner)
    { path: path.join(projectPath, '.locked'), type: 'file' },
    { path: path.join(projectPath, 'attachment_editing'), type: 'file' },
    { path: path.join(projectPath, 'attachment_pc_common'), type: 'file' },
    { path: path.join(projectPath, 'draft.extra'), type: 'file' },
    { path: path.join(projectPath, 'draft_agency_config'), type: 'file' },
    { path: path.join(projectPath, 'draft_biz_config'), type: 'file' },
    { path: path.join(projectPath, 'draft_content'), type: 'file' },
    { path: path.join(projectPath, 'draft_content.json.bak'), type: 'file' },
    { path: path.join(projectPath, 'draft_cover'), type: 'file' },
    { path: path.join(projectPath, 'draft_meta_info'), type: 'file' },
    { path: path.join(projectPath, 'draft_settings'), type: 'file' },
    { path: path.join(projectPath, 'draft_virtual_store'), type: 'file' },
    { path: path.join(projectPath, 'key_value'), type: 'file' },
    { path: path.join(projectPath, 'performance_opt_info'), type: 'file' },
    { path: path.join(projectPath, 'template.tmp'), type: 'file' },
    { path: path.join(projectPath, 'template-2.tmp'), type: 'file' },
    
    // adjust_mask Ordner
    { path: path.join(projectPath, 'adjust_mask'), type: 'dir' },
    
    // common_attachment
    { path: path.join(projectPath, 'common_attachment'), type: 'dir' },
    { path: path.join(projectPath, 'common_attachment', 'aigc_aigc_generate'), type: 'file' },
    { path: path.join(projectPath, 'common_attachment', 'attachment_action_scene'), type: 'file' },
    { path: path.join(projectPath, 'common_attachment', 'attachment_gen_ai_info'), type: 'file' },
    { path: path.join(projectPath, 'common_attachment', 'attachment_plugin_draft'), type: 'file' },
    { path: path.join(projectPath, 'common_attachment', 'attachment_script_video'), type: 'file' },
    
    // matting (komplexe verschachtelte Struktur mit Hex-ID)
    { path: path.join(projectPath, 'matting'), type: 'dir' },
    { path: path.join(projectPath, 'matting', '733057c2a38206104150f436cfb8ab09'), type: 'dir' },
    { path: path.join(projectPath, 'matting', '733057c2a38206104150f436cfb8ab09', '2'), type: 'dir' },
    { path: path.join(projectPath, 'matting', '733057c2a38206104150f436cfb8ab09', '2', 'matting_result'), type: 'file' },
    { path: path.join(projectPath, 'matting', '733057c2a38206104150f436cfb8ab09', '2', 'mocf'), type: 'file' },
    { path: path.join(projectPath, 'matting', '733057c2a38206104150f436cfb8ab09', '2', 'mask'), type: 'dir' },
    { path: path.join(projectPath, 'matting', '733057c2a38206104150f436cfb8ab09', '2', 'mask', '0'), type: 'file' },
    { path: path.join(projectPath, 'matting', '733057c2a38206104150f436cfb8ab09', '2', 'maskinfo'), type: 'dir' },
    { path: path.join(projectPath, 'matting', '733057c2a38206104150f436cfb8ab09', '2', 'maskinfo', '0'), type: 'file' },
    
    // qr_upload
    { path: path.join(projectPath, 'qr_upload'), type: 'dir' },
    
    // Resources (verschachtelt)
    { path: path.join(projectPath, 'Resources'), type: 'dir' },
    { path: path.join(projectPath, 'Resources', 'audioAlg'), type: 'dir' },
    { path: path.join(projectPath, 'Resources', 'digitalHuman'), type: 'dir' },
    { path: path.join(projectPath, 'Resources', 'digitalHuman', 'audio'), type: 'dir' },
    { path: path.join(projectPath, 'Resources', 'digitalHuman', 'bsinfo'), type: 'dir' },
    { path: path.join(projectPath, 'Resources', 'digitalHuman', 'video'), type: 'dir' },
    { path: path.join(projectPath, 'Resources', 'videoAlg'), type: 'dir' },
    
    // smart_crop & subdraft
    { path: path.join(projectPath, 'smart_crop'), type: 'dir' },
    { path: path.join(projectPath, 'subdraft'), type: 'dir' }
  ];
}

/**
 * Erstellt die vollständige Projektstruktur
 * @param {string} projectName - Name des Projekts (wird validiert)
 * @returns {Promise<Object>} Report mit created, skipped, errors
 */
async function createProjectStructure(projectName) {
  console.log(`[ProjectStructure] Erstelle Struktur für: "${projectName}"`);
  
  // 1. Validierung
  const validation = validateProjectName(projectName);
  if (!validation.valid) {
    console.error(`[ProjectStructure] Validierung fehlgeschlagen: ${validation.error}`);
    return { 
      success: false, 
      error: validation.error,
      created: [],
      skipped: [],
      errors: []
    };
  }
  
  // 2. Prüfe ob Basis-Ordner existiert
  try {
    await fs.access(BASE_PATH);
    console.log(`[ProjectStructure] Basis-Ordner existiert: ${BASE_PATH}`);
  } catch (err) {
    console.error(`[ProjectStructure] Basis-Ordner nicht gefunden: ${BASE_PATH}`);
    return { 
      success: false, 
      error: `Basis-Ordner existiert nicht: ${BASE_PATH}`,
      created: [],
      skipped: [],
      errors: []
    };
  }
  
  // 3. Erstelle Projektpfad
  const projectPath = path.join(BASE_PATH, projectName);
  console.log(`[ProjectStructure] Projekt-Pfad: ${projectPath}`);
  
  // 4. Hole Struktur-Definition
  const structure = getProjectStructure(projectPath);
  console.log(`[ProjectStructure] ${structure.length} Elemente zu erstellen`);
  
  const created = [];
  const skipped = [];
  const errors = [];
  
  // 5. Erstelle alle Elemente
  for (const item of structure) {
    try {
      if (item.type === 'dir') {
        // Ordner erstellen
        try {
          await fs.access(item.path);
          // Existiert bereits
          skipped.push(item.path);
        } catch {
          // Erstelle rekursiv
          await fs.mkdir(item.path, { recursive: true });
          created.push(item.path);
        }
      } else {
        // Datei erstellen
        const dir = path.dirname(item.path);
        
        // Stelle sicher dass Parent-Ordner existiert
        try {
          await fs.access(dir);
        } catch {
          await fs.mkdir(dir, { recursive: true });
        }
        
        // Erstelle Datei (nur wenn nicht existiert)
        try {
          await fs.access(item.path);
          skipped.push(item.path);
        } catch {
          // Leere Datei erstellen
          await fs.writeFile(item.path, '', { encoding: 'utf8' });
          created.push(item.path);
        }
      }
    } catch (err) {
      console.error(`[ProjectStructure] Fehler bei ${item.path}:`, err.message);
      errors.push({ 
        path: item.path, 
        message: err.message 
      });
    }
  }
  
  // 6. Report erstellen
  const success = errors.length === 0;
  console.log(`[ProjectStructure] Abgeschlossen: ${created.length} erstellt, ${skipped.length} übersprungen, ${errors.length} Fehler`);
  
  return {
    success,
    projectPath,
    created,
    skipped,
    errors
  };
}

module.exports = { 
  createProjectStructure,
  validateProjectName,
  BASE_PATH
};
