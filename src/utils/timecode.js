/**
 * Timecode-Utilities
 * 
 * Konvertiert zwischen Sekunden und Timecode-Formaten (HH:MM:SS:FF oder HH:MM:SS.ms)
 */

/**
 * Konvertiert Sekunden zu Timecode-String
 * @param {number} seconds - Sekunden (Float)
 * @param {number} fps - Frames per Second (optional, für Frame-Display)
 * @returns {string} Timecode im Format HH:MM:SS:FF oder HH:MM:SS.ms
 */
export function secondsToTimecode(seconds, fps = null) {
  const negative = seconds < 0;
  const absSeconds = Math.abs(seconds);
  
  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const secs = Math.floor(absSeconds % 60);
  
  if (fps) {
    // Frame-basiert
    const frames = Math.floor((absSeconds % 1) * fps);
    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    const s = String(secs).padStart(2, '0');
    const f = String(frames).padStart(2, '0');
    return `${negative ? '-' : ''}${h}:${m}:${s}:${f}`;
  } else {
    // Millisekunden-basiert
    const ms = Math.floor((absSeconds % 1) * 100);
    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    const s = String(secs).padStart(2, '0');
    const mil = String(ms).padStart(2, '0');
    return `${negative ? '-' : ''}${h}:${m}:${s}.${mil}`;
  }
}

/**
 * Konvertiert Timecode-String zu Sekunden
 * @param {string} timecode - Format: "HH:MM:SS:FF" oder "HH:MM:SS.ms"
 * @param {number} fps - Frames per Second (falls Frame-Format verwendet wird)
 * @returns {number} Sekunden als Float
 */
export function timecodeToSeconds(timecode, fps = 30) {
  if (!timecode || typeof timecode !== 'string') return 0;
  
  // Entferne negatives Vorzeichen falls vorhanden
  const negative = timecode.startsWith('-');
  const cleaned = timecode.replace('-', '');
  
  // Parse verschiedene Formate
  let hours = 0, minutes = 0, seconds = 0, subseconds = 0;
  
  if (cleaned.includes('.')) {
    // Format: HH:MM:SS.ms
    const [time, ms] = cleaned.split('.');
    const parts = time.split(':');
    
    if (parts.length === 3) {
      hours = parseInt(parts[0]) || 0;
      minutes = parseInt(parts[1]) || 0;
      seconds = parseInt(parts[2]) || 0;
    }
    
    subseconds = (parseInt(ms) || 0) / 100;
  } else {
    // Format: HH:MM:SS:FF
    const parts = cleaned.split(':');
    
    if (parts.length === 4) {
      hours = parseInt(parts[0]) || 0;
      minutes = parseInt(parts[1]) || 0;
      seconds = parseInt(parts[2]) || 0;
      const frames = parseInt(parts[3]) || 0;
      subseconds = frames / fps;
    } else if (parts.length === 3) {
      hours = parseInt(parts[0]) || 0;
      minutes = parseInt(parts[1]) || 0;
      seconds = parseInt(parts[2]) || 0;
    }
  }
  
  const total = hours * 3600 + minutes * 60 + seconds + subseconds;
  return negative ? -total : total;
}

/**
 * Formatiert Dauer in lesbarem Format (z.B. "2.5s", "1m 30s")
 * @param {number} seconds - Dauer in Sekunden
 * @returns {string} Formatierte Dauer
 */
export function formatDuration(seconds) {
  if (seconds < 1) {
    return `${Math.round(seconds * 100) / 100}s`;
  }
  
  if (seconds < 60) {
    return `${Math.round(seconds * 10) / 10}s`;
  }
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  
  if (secs === 0) {
    return `${mins}m`;
  }
  
  return `${mins}m ${secs}s`;
}
