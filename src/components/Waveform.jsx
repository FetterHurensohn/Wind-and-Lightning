/**
 * Waveform.jsx - Audio Waveform Visualisierung
 * 
 * Zeigt simulierte Audio-Waveform für Audio-Clips.
 * HINWEIS: Dies ist eine simulierte Waveform basierend auf Clip-Duration.
 * Für echte Waveforms müsste Web Audio API mit echtem Audio-Decoding verwendet werden.
 * 
 * Props:
 * @param {Object} clip - Audio-Clip
 * @param {number} width - Canvas-Breite in Pixeln
 * @param {number} height - Canvas-Höhe in Pixeln
 * @param {number} pxPerSec - Pixel pro Sekunde (für Skalierung)
 */

import React, { useRef, useEffect } from 'react';

export default function Waveform({ clip, width, height, pxPerSec }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    // Scale all drawing operations
    ctx.scale(dpr, dpr);
    
    // Clear
    ctx.clearRect(0, 0, width, height);

    // Generiere simulierte Peaks basierend auf clip.duration
    const numBars = Math.floor(width / 2); // Ein Bar alle 2px
    const peaks = generateSimulatedPeaks(clip.id, clip.duration, numBars);

    // Zeichne Bars (Waveform)
    ctx.fillStyle = '#7c3aed'; // Accent color
    peaks.forEach((peak, i) => {
      const x = (i / numBars) * width;
      const barHeight = peak * height * 0.8; // Max 80% Höhe
      const y = (height - barHeight) / 2;
      ctx.fillRect(x, y, 1.5, barHeight);
    });
  }, [clip, width, height, pxPerSec]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${width}px`, height: `${height}px` }}
      className="absolute inset-0 opacity-40 pointer-events-none"
    />
  );
}

/**
 * Generiert simulierte Waveform-Peaks
 * HINWEIS: Simuliert! Echte Implementierung würde AudioBuffer peaks extrahieren.
 */
function generateSimulatedPeaks(clipId, duration, numBars) {
  // Verwende clipId als Seed für konsistente Waveform
  const seed = clipId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return Array.from({ length: numBars }, (_, i) => {
    // Pseudo-random mit Math.sin für konsistente Wiedergabe
    const val = Math.abs(Math.sin((seed + i) * 0.05 + duration)) * 0.6 + 0.3;
    // Füge etwas Variation hinzu
    const variation = Math.sin(i * 0.1) * 0.2;
    return Math.max(0.1, Math.min(1, val + variation));
  });
}
