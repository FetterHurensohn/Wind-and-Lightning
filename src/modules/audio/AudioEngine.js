/**
 * Audio Module - Vollständige Audio-Bearbeitung
 * Mixer, Effekte, Waveform, Voiceover
 */

import { v4 as uuidv4 } from 'uuid';

// === AUDIO EFFECTS ===
export const AUDIO_EFFECTS = {
  // EQ
  eq: [
    { id: 'parametric-eq', name: 'Parametrischer EQ', bands: 8, parameters: { frequency: [], gain: [], q: [] } },
    { id: 'graphic-eq', name: 'Grafischer EQ', bands: 10, parameters: { bands: new Array(10).fill(0) } },
    { id: 'low-pass', name: 'Tiefpass', parameters: { frequency: 20000, resonance: 0 } },
    { id: 'high-pass', name: 'Hochpass', parameters: { frequency: 20, resonance: 0 } },
    { id: 'band-pass', name: 'Bandpass', parameters: { frequency: 1000, bandwidth: 1 } },
    { id: 'notch', name: 'Notch Filter', parameters: { frequency: 1000, q: 1 } }
  ],
  
  // Dynamics
  dynamics: [
    { id: 'compressor', name: 'Kompressor', parameters: { threshold: -20, ratio: 4, attack: 10, release: 100, makeupGain: 0 } },
    { id: 'limiter', name: 'Limiter', parameters: { threshold: -1, release: 50 } },
    { id: 'gate', name: 'Noise Gate', parameters: { threshold: -40, attack: 1, hold: 50, release: 100 } },
    { id: 'expander', name: 'Expander', parameters: { threshold: -40, ratio: 2, attack: 10, release: 100 } },
    { id: 'de-esser', name: 'De-Esser', parameters: { frequency: 6000, threshold: -20, reduction: 6 } }
  ],
  
  // Time-based
  timeBased: [
    { id: 'reverb', name: 'Hall', parameters: { roomSize: 0.5, damping: 0.5, wetDry: 0.3, decay: 2 } },
    { id: 'delay', name: 'Delay', parameters: { time: 250, feedback: 0.3, wetDry: 0.3, sync: false } },
    { id: 'chorus', name: 'Chorus', parameters: { rate: 1.5, depth: 0.5, mix: 0.5 } },
    { id: 'flanger', name: 'Flanger', parameters: { rate: 0.5, depth: 0.5, feedback: 0.5, mix: 0.5 } },
    { id: 'phaser', name: 'Phaser', parameters: { rate: 0.5, depth: 0.5, stages: 4, feedback: 0.5 } }
  ],
  
  // Restoration
  restoration: [
    { id: 'noise-reduction', name: 'Rauschunterdrückung', parameters: { threshold: -30, reduction: 12, frequency: 'full' } },
    { id: 'de-clip', name: 'De-Clip', parameters: { threshold: -1, reduction: 6 } },
    { id: 'de-hum', name: 'De-Hum', parameters: { frequency: 50, harmonics: 4, reduction: 20 } },
    { id: 'de-reverb', name: 'De-Reverb', parameters: { reduction: 50, dryness: 80 } },
    { id: 'de-click', name: 'De-Click', parameters: { threshold: 30, reduction: 50 } }
  ],
  
  // Modulation
  modulation: [
    { id: 'pitch-shift', name: 'Tonhöhe', parameters: { semitones: 0, cents: 0, preserveFormant: true } },
    { id: 'time-stretch', name: 'Zeitdehnung', parameters: { ratio: 1, preservePitch: true } },
    { id: 'formant-shift', name: 'Formant', parameters: { shift: 0 } },
    { id: 'vocoder', name: 'Vocoder', parameters: { bands: 16, carrier: 'synth' } },
    { id: 'ring-mod', name: 'Ringmodulation', parameters: { frequency: 440, mix: 0.5 } }
  ],
  
  // Utility
  utility: [
    { id: 'gain', name: 'Verstärkung', parameters: { gain: 0 } },
    { id: 'pan', name: 'Panorama', parameters: { pan: 0 } },
    { id: 'stereo-width', name: 'Stereobreite', parameters: { width: 100 } },
    { id: 'mono', name: 'Mono', parameters: {} },
    { id: 'phase-invert', name: 'Phase invertieren', parameters: { left: false, right: false } },
    { id: 'dc-offset', name: 'DC Offset entfernen', parameters: {} }
  ]
};

// === AUDIO MIXER STATE ===
export function createMixerState(trackCount = 8) {
  return {
    master: {
      volume: 1,
      pan: 0,
      muted: false,
      solo: false,
      effects: [],
      meter: { left: 0, right: 0, peak: 0 }
    },
    tracks: Array.from({ length: trackCount }, (_, i) => ({
      id: `audio_track_${i}`,
      name: `Audio ${i + 1}`,
      volume: 1,
      pan: 0,
      muted: false,
      solo: false,
      armed: false,
      effects: [],
      sends: [],
      meter: { left: 0, right: 0, peak: 0 },
      input: null,
      output: 'master'
    })),
    buses: [
      { id: 'bus_1', name: 'Bus 1', volume: 1, pan: 0, muted: false, effects: [] },
      { id: 'bus_2', name: 'Bus 2', volume: 1, pan: 0, muted: false, effects: [] }
    ],
    sends: [
      { id: 'send_reverb', name: 'Reverb Send', volume: 0, effect: 'reverb' },
      { id: 'send_delay', name: 'Delay Send', volume: 0, effect: 'delay' }
    ]
  };
}

// === WAVEFORM GENERATION ===
export function generateWaveformData(audioBuffer, samplesPerPixel = 256) {
  const channelData = audioBuffer.getChannelData(0);
  const length = Math.ceil(channelData.length / samplesPerPixel);
  const waveform = new Float32Array(length * 2); // min/max pairs
  
  for (let i = 0; i < length; i++) {
    const start = i * samplesPerPixel;
    const end = Math.min(start + samplesPerPixel, channelData.length);
    
    let min = 1;
    let max = -1;
    
    for (let j = start; j < end; j++) {
      const sample = channelData[j];
      if (sample < min) min = sample;
      if (sample > max) max = sample;
    }
    
    waveform[i * 2] = min;
    waveform[i * 2 + 1] = max;
  }
  
  return waveform;
}

// === BEAT DETECTION ===
export function detectBeats(audioBuffer, sensitivity = 0.5) {
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const windowSize = Math.floor(sampleRate * 0.02); // 20ms windows
  
  const energyValues = [];
  for (let i = 0; i < channelData.length; i += windowSize) {
    let energy = 0;
    for (let j = i; j < Math.min(i + windowSize, channelData.length); j++) {
      energy += channelData[j] * channelData[j];
    }
    energyValues.push(energy / windowSize);
  }
  
  // Find peaks
  const beats = [];
  const threshold = Math.max(...energyValues) * sensitivity;
  
  for (let i = 1; i < energyValues.length - 1; i++) {
    if (energyValues[i] > threshold &&
        energyValues[i] > energyValues[i - 1] &&
        energyValues[i] > energyValues[i + 1]) {
      beats.push({
        time: (i * windowSize) / sampleRate,
        strength: energyValues[i]
      });
    }
  }
  
  return beats;
}

// === AUTO DUCKING ===
export function calculateDucking(dialogTrack, musicTrack, options = {}) {
  const threshold = options.threshold || -20; // dB
  const ratio = options.ratio || 0.3; // Duck to 30%
  const attack = options.attack || 50; // ms
  const release = options.release || 500; // ms
  
  // Returns automation points for music volume
  const duckingPoints = [];
  
  // Analyze dialog track for speech segments
  // This would involve voice activity detection
  // Simplified: return empty array for now
  
  return duckingPoints;
}

// === VOICEOVER RECORDING ===
export async function startVoiceoverRecording(options = {}) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: options.echoCancellation !== false,
      noiseSuppression: options.noiseSuppression !== false,
      autoGainControl: options.autoGainControl !== false,
      sampleRate: options.sampleRate || 48000
    }
  });
  
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'audio/webm;codecs=opus'
  });
  
  const chunks = [];
  
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };
  
  return {
    recorder: mediaRecorder,
    stream,
    chunks,
    start: () => mediaRecorder.start(100),
    stop: () => new Promise((resolve) => {
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        resolve(blob);
      };
      mediaRecorder.stop();
    }),
    pause: () => mediaRecorder.pause(),
    resume: () => mediaRecorder.resume()
  };
}

// === AUDIO CROSSFADE ===
export function calculateCrossfade(clipA, clipB, duration, curve = 'equal-power') {
  // Generate crossfade automation
  const points = [];
  const steps = Math.ceil(duration * 30); // 30 points per second
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    let fadeOut, fadeIn;
    
    switch (curve) {
      case 'linear':
        fadeOut = 1 - t;
        fadeIn = t;
        break;
      case 'equal-power':
        fadeOut = Math.cos(t * Math.PI / 2);
        fadeIn = Math.sin(t * Math.PI / 2);
        break;
      case 's-curve':
        const s = t * t * (3 - 2 * t);
        fadeOut = 1 - s;
        fadeIn = s;
        break;
      default:
        fadeOut = 1 - t;
        fadeIn = t;
    }
    
    points.push({
      time: t * duration,
      clipAVolume: fadeOut,
      clipBVolume: fadeIn
    });
  }
  
  return points;
}

// === LOUDNESS ANALYSIS ===
export function analyzeLoudness(audioBuffer) {
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  
  // Calculate RMS
  let sumSquares = 0;
  for (let i = 0; i < channelData.length; i++) {
    sumSquares += channelData[i] * channelData[i];
  }
  const rms = Math.sqrt(sumSquares / channelData.length);
  
  // Calculate peak
  let peak = 0;
  for (let i = 0; i < channelData.length; i++) {
    const abs = Math.abs(channelData[i]);
    if (abs > peak) peak = abs;
  }
  
  // Convert to dB
  const rmsDb = 20 * Math.log10(rms);
  const peakDb = 20 * Math.log10(peak);
  
  // Simplified LUFS (would need proper K-weighting)
  const lufs = rmsDb - 0.691; // Approximation
  
  return {
    rms: rmsDb,
    peak: peakDb,
    lufs: lufs,
    dynamicRange: peakDb - rmsDb,
    duration: audioBuffer.duration,
    sampleRate,
    channels: audioBuffer.numberOfChannels
  };
}

// === AUDIO NORMALIZATION ===
export function calculateNormalization(audioBuffer, targetLufs = -14) {
  const analysis = analyzeLoudness(audioBuffer);
  const gainDb = targetLufs - analysis.lufs;
  const gainLinear = Math.pow(10, gainDb / 20);
  
  return {
    currentLufs: analysis.lufs,
    targetLufs,
    gainDb,
    gainLinear,
    wouldClip: analysis.peak + gainDb > 0
  };
}

// === SPECTRUM ANALYZER ===
export function createSpectrumAnalyzer(audioContext, fftSize = 2048) {
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = fftSize;
  analyser.smoothingTimeConstant = 0.8;
  
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  return {
    analyser,
    getFrequencyData: () => {
      analyser.getByteFrequencyData(dataArray);
      return dataArray;
    },
    getTimeDomainData: () => {
      analyser.getByteTimeDomainData(dataArray);
      return dataArray;
    },
    bufferLength,
    frequencyBinCount: analyser.frequencyBinCount,
    nyquist: audioContext.sampleRate / 2
  };
}

export default {
  AUDIO_EFFECTS,
  createMixerState,
  generateWaveformData,
  detectBeats,
  calculateDucking,
  startVoiceoverRecording,
  calculateCrossfade,
  analyzeLoudness,
  calculateNormalization,
  createSpectrumAnalyzer
};
