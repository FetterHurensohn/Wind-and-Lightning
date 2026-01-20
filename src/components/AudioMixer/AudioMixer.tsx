import React, { useEffect, useRef, useState } from 'react';
import { Slider } from 'antd';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { updateClip } from '../../store/timelineSlice';
import './AudioMixer.css';

const AudioMixer: React.FC = () => {
  const dispatch = useAppDispatch();
  const clips = useAppSelector((state) => state.timeline.clips);
  const mediaItems = useAppSelector((state) => state.media.items);
  const tracks = useAppSelector((state) => state.timeline.tracks);
  const currentTime = useAppSelector((state) => state.timeline.currentTime);
  const isPlaying = useAppSelector((state) => state.timeline.isPlaying);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<Map<string, { source: MediaElementAudioSourceNode, gain: GainNode }>>(new Map());

  useEffect(() => {
    // Initialize Web Audio API
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      // Cleanup
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleVolumeChange = (clipId: string, volume: number) => {
    dispatch(updateClip({
      id: clipId,
      updates: { volume },
    }));

    // Update gain node if exists
    const node = audioNodesRef.current.get(clipId);
    if (node) {
      node.gain.gain.value = volume / 100;
    }
  };

  const audioClips = clips.filter(clip => {
    const media = mediaItems.find(m => m.id === clip.mediaId);
    return media && (media.type === 'video' || media.type === 'audio');
  });

  return (
    <div className="audio-mixer">
      <div className="audio-mixer-header">
        <h3>Audio Mixer</h3>
      </div>

      <div className="audio-tracks">
        {tracks.map(track => {
          const trackClips = audioClips.filter(c => c.trackId === track.id);
          
          if (trackClips.length === 0) return null;

          return (
            <div key={track.id} className="audio-track">
              <div className="audio-track-header">
                <span className="track-name">{track.name}</span>
              </div>

              <div className="audio-track-clips">
                {trackClips.map(clip => {
                  const media = mediaItems.find(m => m.id === clip.mediaId);
                  
                  return (
                    <div key={clip.id} className="audio-clip-control">
                      <div className="audio-clip-info">
                        <span className="audio-clip-name">{media?.name}</span>
                        <span className="audio-clip-volume">{clip.volume}%</span>
                      </div>
                      
                      <Slider
                        min={0}
                        max={200}
                        value={clip.volume}
                        onChange={(value) => handleVolumeChange(clip.id, value)}
                        tooltip={{ formatter: (value) => `${value}%` }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {audioClips.length === 0 && (
          <div className="audio-empty">
            <p>No audio clips in timeline</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioMixer;
