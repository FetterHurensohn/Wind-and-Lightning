/**
 * pxTime.js - Pixel ↔ Zeit Konvertierung
 * 
 * Zentrale Utilities für die Umrechnung zwischen Pixeln und Sekunden
 * basierend auf dem pxPerSec-Zoom-Faktor.
 */

/**
 * Konvertiert Sekunden zu Pixeln
 * @param {number} seconds - Zeit in Sekunden
 * @param {number} pxPerSec - Pixel pro Sekunde (Zoom)
 * @returns {number} Pixel
 */
export function secondsToPx(seconds, pxPerSec) {
  return seconds * pxPerSec;
}

/**
 * Konvertiert Pixel zu Sekunden
 * @param {number} px - Pixel
 * @param {number} pxPerSec - Pixel pro Sekunde (Zoom)
 * @returns {number} Zeit in Sekunden
 */
export function pxToSeconds(px, pxPerSec) {
  return px / pxPerSec;
}

/**
 * Berechnet sichtbaren Zeitbereich im Viewport
 * @param {number} scrollLeft - Scroll-Position in Pixeln
 * @param {number} viewportWidth - Breite des Viewports in Pixeln
 * @param {number} pxPerSec - Pixel pro Sekunde
 * @returns {Object} { startTime, endTime } in Sekunden
 */
export function getVisibleTimeRange(scrollLeft, viewportWidth, pxPerSec) {
  return {
    startTime: pxToSeconds(scrollLeft, pxPerSec),
    endTime: pxToSeconds(scrollLeft + viewportWidth, pxPerSec)
  };
}
