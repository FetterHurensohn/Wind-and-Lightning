import React, { useRef, useEffect, useState } from 'react';
import { Button, Space, Tooltip, Select } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
  FastBackwardOutlined,
  FastForwardOutlined,
  CaretLeftOutlined,
  CaretRightOutlined,
} from '@ant-design/icons';

const { Option } = Select;
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setCurrentTime, togglePlay, setPlaying } from '../../store/timelineSlice';
import './Preview.css';

interface PreviewProps {
  monitorType?: 'source' | 'program';
}

const Preview: React.FC<PreviewProps> = ({ monitorType = 'program' }) => {
  const dispatch = useAppDispatch();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<Map<string, { element: HTMLAudioElement, source: MediaElementAudioSourceNode, gain: GainNode }>>(new Map());
  
  const currentTime = useAppSelector((state) => state.timeline.currentTime);
  const isPlaying = useAppSelector((state) => state.timeline.isPlaying);
  const duration = useAppSelector((state) => state.timeline.duration);
  const clips = useAppSelector((state) => state.timeline.clips);
  const mediaItems = useAppSelector((state) => state.media.items);
  
  const [resolution, setResolution] = useState<'full' | 'half' | 'quarter'>('half');
  const [activeClipId, setActiveClipId] = useState<string | null>(null);

  // Initialize Web Audio API
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      // Cleanup audio nodes
      audioNodesRef.current.forEach((node) => {
        node.element.pause();
        node.source.disconnect();
        node.gain.disconnect();
      });
      audioNodesRef.current.clear();
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Find active clip at current time
  const getActiveClip = () => {
    return clips.find(clip => 
      currentTime >= clip.startTime && 
      currentTime < clip.startTime + clip.duration
    );
  };

  // Update video source when active clip changes
  useEffect(() => {
    const activeClip = getActiveClip();
    
    if (activeClip && videoRef.current) {
      const media = mediaItems.find(m => m.id === activeClip.mediaId);
      
      if (media && media.type === 'video' && activeClipId !== activeClip.id) {
        console.log('Loading new video clip:', media.name);
        setActiveClipId(activeClip.id);
        videoRef.current.src = media.url;
        
        // Calculate the correct time within the clip
        const clipTime = currentTime - activeClip.startTime + activeClip.trimStart;
        videoRef.current.currentTime = Math.max(0, clipTime);
        
        // Set volume
        videoRef.current.volume = Math.max(0, Math.min(1, (activeClip.volume || 100) / 100));
        
        if (isPlaying) {
          videoRef.current.play().catch(err => console.error('Play error:', err));
        }
      } else if (media && media.type === 'video') {
        // Same clip, just update time
        const clipTime = currentTime - activeClip.startTime + activeClip.trimStart;
        const targetTime = Math.max(0, clipTime);
        if (Math.abs(videoRef.current.currentTime - targetTime) > 0.1) {
          videoRef.current.currentTime = targetTime;
        }
        // Update volume
        videoRef.current.volume = Math.max(0, Math.min(1, (activeClip.volume || 100) / 100));
      }
    } else if (!activeClip && videoRef.current && videoRef.current.src) {
      console.log('No active clip, clearing video');
      videoRef.current.pause();
      videoRef.current.src = '';
      setActiveClipId(null);
    }

    // Handle audio-only clips
    if (audioContextRef.current) {
      const audioClips = clips.filter(clip => {
        if (currentTime < clip.startTime || currentTime >= clip.startTime + clip.duration) {
          return false;
        }
        const media = mediaItems.find(m => m.id === clip.mediaId);
        return media && media.type === 'audio';
      });

      // Remove audio nodes for clips that are no longer active
      audioNodesRef.current.forEach((node, clipId) => {
        const stillActive = audioClips.some(c => c.id === clipId);
        if (!stillActive) {
          node.element.pause();
          node.source.disconnect();
          node.gain.disconnect();
          audioNodesRef.current.delete(clipId);
        }
      });

      // Add/update audio nodes for active clips
      audioClips.forEach(clip => {
        const media = mediaItems.find(m => m.id === clip.mediaId);
        if (!media) return;

        if (!audioNodesRef.current.has(clip.id)) {
          // Create new audio node
          const audio = new Audio(media.url);
          const source = audioContextRef.current!.createMediaElementSource(audio);
          const gain = audioContextRef.current!.createGain();
          
          source.connect(gain);
          gain.connect(audioContextRef.current!.destination);
          
          audioNodesRef.current.set(clip.id, { element: audio, source, gain });
        }

        // Update audio element
        const node = audioNodesRef.current.get(clip.id)!;
        const clipTime = currentTime - clip.startTime + clip.trimStart;
        node.element.currentTime = clipTime;
        node.gain.gain.value = (clip.volume || 100) / 100;
        
        if (isPlaying && node.element.paused) {
          node.element.play().catch(err => console.error('Audio play error:', err));
        } else if (!isPlaying && !node.element.paused) {
          node.element.pause();
        }
      });
    }
  }, [currentTime, clips, mediaItems, activeClipId, isPlaying]);

  // Handle playback
  useEffect(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      const activeClip = getActiveClip();
      if (activeClip) {
        videoRef.current.play().catch(err => console.error('Play error:', err));
        
        const playbackInterval = setInterval(() => {
          const activeClip = getActiveClip();
          if (activeClip) {
            const newTime = currentTime + 0.033; // ~30fps
            if (newTime >= activeClip.startTime + activeClip.duration) {
              // End of clip reached
              const nextClip = clips.find(c => c.startTime === newTime);
              if (!nextClip) {
                dispatch(setPlaying(false));
              } else {
                dispatch(setCurrentTime(newTime));
              }
            } else if (newTime >= duration) {
              dispatch(setPlaying(false));
            } else {
              dispatch(setCurrentTime(newTime));
            }
          } else {
            dispatch(setPlaying(false));
          }
        }, 33);
        
        return () => clearInterval(playbackInterval);
      }
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, currentTime, duration, clips, dispatch]);

  const handlePlayPause = () => {
    dispatch(togglePlay());
  };

  const handleSeek = (time: number) => {
    dispatch(setCurrentTime(time));
  };

  const handleStepBackward = () => {
    dispatch(setCurrentTime(Math.max(0, currentTime - 1 / 30)));
  };

  const handleStepForward = () => {
    dispatch(setCurrentTime(Math.min(duration, currentTime + 1 / 30)));
  };

  const handleSkipBackward = () => {
    dispatch(setCurrentTime(Math.max(0, currentTime - 5)));
  };

  const handleSkipForward = () => {
    dispatch(setCurrentTime(Math.min(duration, currentTime + 5)));
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames
      .toString()
      .padStart(2, '0')}`;
  };

  const activeClip = getActiveClip();
  const activeMedia = activeClip ? mediaItems.find(m => m.id === activeClip.mediaId) : null;

  // Apply CSS filters from effects
  const getFilterStyle = () => {
    if (!activeClip || !activeClip.effects) return '';
    
    const filters: string[] = [];
    
    activeClip.effects.forEach((effect: any) => {
      const value = effect.parameters?.value || 0;
      
      switch (effect.type) {
        case 'brightness':
          filters.push(`brightness(${1 + value / 100})`);
          break;
        case 'contrast':
          filters.push(`contrast(${1 + value / 100})`);
          break;
        case 'saturation':
          filters.push(`saturate(${1 + value / 100})`);
          break;
        case 'blur':
          filters.push(`blur(${value}px)`);
          break;
        case 'hue':
          filters.push(`hue-rotate(${value}deg)`);
          break;
        case 'grayscale':
          filters.push(`grayscale(${value}%)`);
          break;
        case 'sepia':
          filters.push(`sepia(${value}%)`);
          break;
      }
    });
    
    return filters.join(' ');
  };

  return (
    <div className="preview-panel">
      <div className="preview-viewport">
        {activeMedia && activeMedia.type === 'video' ? (
          <video 
            ref={videoRef}
            className="preview-video"
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%',
              objectFit: 'contain',
              filter: getFilterStyle()
            }}
          />
        ) : activeMedia && activeMedia.type === 'image' ? (
          <img 
            src={activeMedia.url}
            alt={activeMedia.name}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%',
              objectFit: 'contain',
              filter: getFilterStyle()
            }}
          />
        ) : (
          <div className="preview-empty">
            <div className="preview-placeholder">
              {clips.length === 0 ? 'No clips in timeline' : 'Add clips to timeline to preview'}
            </div>
          </div>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      <div className="preview-controls">
        <div className="preview-playback">
          <Tooltip title="Go to In">
            <Button icon={<FastBackwardOutlined />} onClick={handleSkipBackward} size="small" />
          </Tooltip>
          <Tooltip title="Previous Frame">
            <Button icon={<CaretLeftOutlined />} onClick={handleStepBackward} size="small" />
          </Tooltip>
          <Tooltip title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}>
            <Button
              type="primary"
              icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={handlePlayPause}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Next Frame">
            <Button icon={<CaretRightOutlined />} onClick={handleStepForward} size="small" />
          </Tooltip>
          <Tooltip title="Go to Out">
            <Button icon={<FastForwardOutlined />} onClick={handleSkipForward} size="small" />
          </Tooltip>
        </div>

        <div className="timecode-display">{formatTime(currentTime)}</div>

        {monitorType === 'source' && (
          <div className="insert-buttons">
            <Tooltip title="Insert (,)">
              <Button size="small">Insert</Button>
            </Tooltip>
            <Tooltip title="Overwrite (.)">
              <Button size="small">Overwrite</Button>
            </Tooltip>
          </div>
        )}

        <Select 
          value={resolution} 
          onChange={setResolution} 
          size="small" 
          style={{ width: 70 }}
        >
          <Option value="full">Full</Option>
          <Option value="half">1/2</Option>
          <Option value="quarter">1/4</Option>
        </Select>
      </div>

      <div className="preview-scrubber">
        <Slider
          min={0}
          max={duration || 100}
          step={0.001}
          value={currentTime}
          onChange={handleSeek}
          tooltip={{ formatter: formatTime }}
        />
      </div>
    </div>
  );
};

export default Preview;
