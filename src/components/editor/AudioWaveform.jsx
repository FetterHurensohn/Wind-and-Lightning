/**
 * AudioWaveform.jsx - Audio Wellenform Visualisierung
 * 
 * Generiert und zeigt Audio-Wellenformen für Clips in der Timeline
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';

// Wellenform aus Audio-Datei generieren
export async function generateWaveform(audioUrl, samples = 200) {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Lade Audio-Datei
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Extrahiere Samples
    const channelData = audioBuffer.getChannelData(0); // Mono oder linker Kanal
    const blockSize = Math.floor(channelData.length / samples);
    const waveformData = [];
    
    for (let i = 0; i < samples; i++) {
      const start = i * blockSize;
      let sum = 0;
      
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(channelData[start + j] || 0);
      }
      
      waveformData.push(sum / blockSize);
    }
    
    // Normalisiere auf 0-1
    const max = Math.max(...waveformData);
    const normalized = waveformData.map(v => v / (max || 1));
    
    audioContext.close();
    
    return {
      data: normalized,
      duration: audioBuffer.duration,
      sampleRate: audioBuffer.sampleRate
    };
  } catch (error) {
    console.warn('Waveform generation failed:', error);
    return null;
  }
}

// Wellenform-Komponente
export default function AudioWaveform({ 
  audioUrl, 
  width = 200, 
  height = 40, 
  color = '#22d3ee',
  backgroundColor = 'transparent',
  className = ''
}) {
  const [waveform, setWaveform] = useState(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);
  
  // Generiere Wellenform bei URL-Änderung
  useEffect(() => {
    if (!audioUrl) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const samples = Math.min(Math.max(width / 2, 50), 500);
    
    generateWaveform(audioUrl, samples)
      .then(data => {
        setWaveform(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [audioUrl, width]);
  
  // Zeichne Wellenform auf Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waveform?.data) return;
    
    const ctx = canvas.getContext('2d');
    const { data } = waveform;
    
    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    // Draw waveform
    ctx.fillStyle = color;
    
    const barWidth = width / data.length;
    const centerY = height / 2;
    
    data.forEach((value, index) => {
      const barHeight = value * height * 0.8;
      const x = index * barWidth;
      const y = centerY - barHeight / 2;
      
      ctx.fillRect(x, y, Math.max(barWidth - 1, 1), barHeight);
    });
  }, [waveform, width, height, color, backgroundColor]);
  
  // Platzhalter-Wellenform für Demo
  const placeholderWaveform = useMemo(() => {
    const bars = Math.floor(width / 3);
    return Array.from({ length: bars }, () => 0.2 + Math.random() * 0.6);
  }, [width]);
  
  if (loading) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ width, height, backgroundColor }}
      >
        <div className="flex items-end gap-0.5 h-full py-1">
          {placeholderWaveform.slice(0, 20).map((h, i) => (
            <div 
              key={i}
              className="w-1 bg-current opacity-30 animate-pulse"
              style={{ 
                height: `${h * 100}%`,
                animationDelay: `${i * 50}ms`
              }}
            />
          ))}
        </div>
      </div>
    );
  }
  
  if (!waveform?.data) {
    // Zeige statische Demo-Wellenform
    return (
      <div 
        className={`flex items-end gap-px ${className}`}
        style={{ width, height, backgroundColor }}
      >
        {placeholderWaveform.map((h, i) => (
          <div 
            key={i}
            style={{ 
              width: '2px',
              height: `${h * 100}%`,
              backgroundColor: color,
              opacity: 0.6
            }}
          />
        ))}
      </div>
    );
  }
  
  return (
    <canvas 
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{ width, height }}
    />
  );
}

// Inline Wellenform für Timeline-Clips
export function InlineWaveform({ 
  clip, 
  mediaItem,
  width,
  height = 32,
  pxPerSec = 50
}) {
  const clipWidth = clip.duration * pxPerSec;
  
  return (
    <div 
      className="absolute inset-0 overflow-hidden opacity-60"
      style={{ width: clipWidth }}
    >
      <AudioWaveform
        audioUrl={mediaItem?.url}
        width={clipWidth}
        height={height}
        color="currentColor"
        backgroundColor="transparent"
      />
    </div>
  );
}

// Audio-Analyse für Peaks (für Beat-Detection)
export async function analyzeAudioPeaks(audioUrl, threshold = 0.8) {
  const waveform = await generateWaveform(audioUrl, 1000);
  if (!waveform) return [];
  
  const peaks = [];
  const { data, duration } = waveform;
  
  for (let i = 1; i < data.length - 1; i++) {
    if (data[i] > threshold && data[i] > data[i - 1] && data[i] > data[i + 1]) {
      peaks.push({
        time: (i / data.length) * duration,
        amplitude: data[i]
      });
    }
  }
  
  return peaks;
}
