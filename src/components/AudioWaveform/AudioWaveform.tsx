import React from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useEffect, useRef } from 'react';
import './AudioWaveform.css';

interface AudioWaveformProps {
  audioUrl: string;
  height?: number;
  waveColor?: string;
  progressColor?: string;
  onReady?: () => void;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({
  audioUrl,
  height = 60,
  waveColor = '#4a9eff',
  progressColor = '#1890ff',
  onReady,
}) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!waveformRef.current) return;

    // Create WaveSurfer instance
    wavesurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor,
      progressColor,
      height,
      normalize: true,
      backend: 'WebAudio',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      cursorWidth: 0,
      interact: false,
    });

    // Load audio
    wavesurferRef.current.load(audioUrl);

    wavesurferRef.current.on('ready', () => {
      onReady?.();
    });

    return () => {
      wavesurferRef.current?.destroy();
    };
  }, [audioUrl, height, waveColor, progressColor, onReady]);

  return <div ref={waveformRef} className="audio-waveform" />;
};

export default AudioWaveform;
