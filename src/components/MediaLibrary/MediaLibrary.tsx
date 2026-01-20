import React from 'react';
import { Button, message } from 'antd';
import { 
  PlusOutlined, 
  PlayCircleOutlined,
  FileImageOutlined, 
  SoundOutlined
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { addMediaItems, selectMediaItems } from '../../store/mediaSlice';
import { addClip } from '../../store/timelineSlice';
import './MediaLibrary.css';

const MediaLibrary: React.FC = () => {
  const dispatch = useAppDispatch();
  const mediaItems = useAppSelector((state) => state.media.items);
  const selectedIds = useAppSelector((state) => state.media.selectedIds);
  const clips = useAppSelector((state) => state.timeline.clips);
  const tracks = useAppSelector((state) => state.timeline.tracks);

  const handleImport = async () => {
    try {
      // Create file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'video/*,image/*,audio/*';
      input.multiple = true;
      
      input.onchange = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (!target.files || target.files.length === 0) return;
        
        const files = Array.from(target.files);
        const newMediaItems: any[] = [];
        
        message.loading(`Importing ${files.length} file(s)...`, 0);
        
        for (const file of files) {
          try {
            console.log('Processing file:', file.name, file.type);
            
            const url = URL.createObjectURL(file);
            const type = file.type.startsWith('video') ? 'video' : 
                        file.type.startsWith('audio') ? 'audio' : 'image';
            
            let thumbnail = '';
            let duration = 0;
            let width = 0;
            let height = 0;
            
            if (type === 'video') {
              console.log('Processing video:', file.name);
              // Get video metadata and thumbnail
              const video = document.createElement('video');
              video.preload = 'metadata';
              video.src = url;
              video.muted = true;
              
              await new Promise((resolve, reject) => {
                video.onloadedmetadata = resolve;
                video.onerror = () => reject(new Error('Failed to load video'));
                setTimeout(() => reject(new Error('Timeout loading video')), 10000);
              });
              
              duration = video.duration;
              width = video.videoWidth;
              height = video.videoHeight;
              
              console.log('Video metadata:', { duration, width, height });
              
              // Create thumbnail
              const seekTime = Math.min(1, duration * 0.1);
              video.currentTime = seekTime;
              
              await new Promise((resolve, reject) => {
                video.onseeked = resolve;
                video.onerror = () => reject(new Error('Failed to seek video'));
                setTimeout(() => reject(new Error('Timeout seeking video')), 5000);
              });
              
              const canvas = document.createElement('canvas');
              canvas.width = 320;
              canvas.height = 180;
              const ctx = canvas.getContext('2d');
              
              if (ctx) {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                const videoAspect = width / height;
                const canvasAspect = canvas.width / canvas.height;
                
                let drawWidth, drawHeight, offsetX, offsetY;
                
                if (videoAspect > canvasAspect) {
                  drawHeight = canvas.height;
                  drawWidth = drawHeight * videoAspect;
                  offsetX = (canvas.width - drawWidth) / 2;
                  offsetY = 0;
                } else {
                  drawWidth = canvas.width;
                  drawHeight = drawWidth / videoAspect;
                  offsetX = 0;
                  offsetY = (canvas.height - drawHeight) / 2;
                }
                
                ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
                thumbnail = canvas.toDataURL('image/jpeg', 0.7);
              }
            } else if (type === 'image') {
              console.log('Processing image:', file.name);
              // Create image thumbnail
              const img = new Image();
              img.src = url;
              
              await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = () => reject(new Error('Failed to load image'));
                setTimeout(() => reject(new Error('Timeout loading image')), 5000);
              });
              
              width = img.width;
              height = img.height;
              
              const canvas = document.createElement('canvas');
              canvas.width = 320;
              canvas.height = 180;
              const ctx = canvas.getContext('2d');
              
              if (ctx) {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                const imgAspect = width / height;
                const canvasAspect = canvas.width / canvas.height;
                
                let drawWidth, drawHeight, offsetX, offsetY;
                
                if (imgAspect > canvasAspect) {
                  drawHeight = canvas.height;
                  drawWidth = drawHeight * imgAspect;
                  offsetX = (canvas.width - drawWidth) / 2;
                  offsetY = 0;
                } else {
                  drawWidth = canvas.width;
                  drawHeight = drawWidth / imgAspect;
                  offsetX = 0;
                  offsetY = (canvas.height - drawHeight) / 2;
                }
                
                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
                thumbnail = canvas.toDataURL('image/jpeg', 0.7);
              }
            } else if (type === 'audio') {
              console.log('Processing audio:', file.name);
              // For audio, we'll just use duration
              const audio = new Audio(url);
              await new Promise((resolve, reject) => {
                audio.onloadedmetadata = resolve;
                audio.onerror = () => reject(new Error('Failed to load audio'));
                setTimeout(() => reject(new Error('Timeout loading audio')), 5000);
              });
              duration = audio.duration;
            }
            
            const mediaItem = {
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: file.name,
              filePath: file.name,
              url: url,
              file: file,
              type: type,
              duration: duration,
              resolution: width && height ? { width, height } : undefined,
              thumbnail: thumbnail,
              size: file.size,
              format: file.type,
            };
            
            console.log('Media item created:', mediaItem);
            newMediaItems.push(mediaItem);
          } catch (error) {
            console.error('Error processing file:', file.name, error);
            message.error(`Failed to import ${file.name}: ${error.message}`);
          }
        }
        
        message.destroy();
        
        if (newMediaItems.length > 0) {
          console.log('Adding media items to store:', newMediaItems);
          dispatch(addMediaItems(newMediaItems));
          message.success(`Successfully imported ${newMediaItems.length} file(s)`);
        } else {
          message.warning('No files were imported');
        }
      };
      
      input.click();
    } catch (error) {
      console.error('Import error:', error);
      message.error('Failed to start import');
    }
  };

  const handleDelete = (id: string) => {
    // Removed - can be added back later if needed
  };

  const handleItemClick = (id: string) => {
    dispatch(selectMediaItems([id]));
  };

  const handleItemDoubleClick = (item: any) => {
    console.log('🎬 Double-click: Adding to timeline:', item.name);
    
    // Add to timeline - simplified version
    const trackType = item.type === 'audio' ? 'audio' : 'video';
    
    // Find the end of the last clip on this track
    const trackId = trackType === 'audio' ? 'a1' : 'v1';
    const trackClips = clips.filter(c => c.trackId === trackId);
    const lastClipEnd = trackClips.length > 0
      ? Math.max(...trackClips.map(c => c.startTime + c.duration))
      : 0;
    
    const newClip = {
      id: `clip-${Date.now()}`,
      mediaId: item.id,
      trackId: trackId,
      startTime: lastClipEnd,
      duration: item.duration || 5,
      trimStart: 0,
      trimEnd: 0,
      effects: [],
      volume: 100,
      speed: 1,
    };
    
    dispatch(addClip(newClip));
    console.log('✅ Clip added to timeline:', newClip);
    message.success(`Added "${item.name}" to timeline`);
  };

  const handleItemDragStart = (e: React.DragEvent, item: any) => {
    console.log('🎯 Drag start:', item.name);
    e.dataTransfer.effectAllowed = 'copy';
    
    const dragData = {
      id: item.id,
      name: item.name,
      type: item.type,
      duration: item.duration,
      url: item.url,
      thumbnail: item.thumbnail,
    };
    
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.setData('text/plain', item.id);
  };

  return (
    <div className="pp-media-library">
      <div className="pp-media-header">
        <span className="pp-media-title">Media Browser</span>
        <Button 
          size="small"
          icon={<PlusOutlined />}
          onClick={handleImport}
        >
          Import
        </Button>
      </div>
      
      {mediaItems.length === 0 ? (
        <div className="pp-media-empty">
          <FileImageOutlined style={{ fontSize: 48, color: 'var(--pp-text-tertiary)' }} />
          <p style={{ color: 'var(--pp-text-secondary)', margin: '12px 0' }}>No media files</p>
          <Button size="small" onClick={handleImport}>Import Files</Button>
        </div>
      ) : (
        <div className="pp-media-grid">
          {mediaItems.map((item) => (
            <div
              key={item.id}
              className={`pp-media-item ${selectedIds.includes(item.id) ? 'selected' : ''}`}
              draggable
              onDragStart={(e) => handleItemDragStart(e, item)}
              onClick={() => handleItemClick(item.id)}
              onDoubleClick={() => handleItemDoubleClick(item)}
            >
              <div className="pp-media-thumb">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt={item.name} draggable={false} />
                ) : (
                  <div className="pp-media-placeholder">
                    {item.type === 'video' ? <PlayCircleOutlined /> : 
                     item.type === 'audio' ? <SoundOutlined /> : 
                     <FileImageOutlined />}
                  </div>
                )}
                {item.duration && (
                  <span className="pp-duration">
                    {Math.floor(item.duration)}s
                  </span>
                )}
              </div>
              <div className="pp-media-name">{item.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
