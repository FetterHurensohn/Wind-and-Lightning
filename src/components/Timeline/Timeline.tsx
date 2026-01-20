import React, { useRef, useState, useEffect } from 'react';
import { Button, Space, Tooltip, Slider, Switch } from 'antd';
import {
  ScissorOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  PlusOutlined,
  UndoOutlined,
  RedoOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  DragOutlined,
  EditOutlined,
  LinkOutlined,
  BorderOutlined,
  CaretRightOutlined,
  ColumnWidthOutlined,
  EyeOutlined,
  LockOutlined,
  SoundOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { 
  setCurrentTime, 
  setZoom, 
  selectClips, 
  splitClip,
  updateClip,
  addTrack,
  addClip,
  removeClip,
  togglePlay,
  TimelineClip,
} from '../../store/timelineSlice';
import { snapToGrid, checkClipCollision, findNextAvailablePosition, formatTimecode } from '../../utils/timelineUtils';
import { undoRedoManager, createAction } from '../../utils/undoRedo';
import './Timeline.css';

const Timeline: React.FC = () => {
  const dispatch = useAppDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  const tracks = useAppSelector((state) => state.timeline.tracks);
  const clips = useAppSelector((state) => state.timeline.clips);
  const currentTime = useAppSelector((state) => state.timeline.currentTime);
  const zoom = useAppSelector((state) => state.timeline.zoom);
  const selectedClipIds = useAppSelector((state) => state.timeline.selectedClipIds);
  const mediaItems = useAppSelector((state) => state.media.items);
  const duration = useAppSelector((state) => state.timeline.duration);
  
  const [tool, setTool] = useState<'select' | 'razor'>('select');
  const [draggedClip, setDraggedClip] = useState<string | null>(null);
  const [resizingClip, setResizingClip] = useState<{
    clipId: string;
    edge: 'start' | 'end';
    initialX: number;
    initialValue: number;
  } | null>(null);
  const [snapEnabled, setSnapEnabled] = useState<boolean>(false);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);
  
  // Verwende Ref für flüssiges Dragging (kein Re-Render bei jedem Move!)
  const dragPreviewRef = useRef<{
    clipId: string;
    trackId: string;
    startTime: number;
    originalTrackId: string;
    originalStartTime: number;
    dragOffsetX: number;
  } | null>(null);
  const [dragPreviewTrigger, setDragPreviewTrigger] = useState(0); // Nur für finales Re-Render
  const animationFrameRef = useRef<number | null>(null);

  // Calculate pixels per second FIRST
  const pixelsPerSecond = 50 * zoom;
  const timelineWidth = Math.max(duration * pixelsPerSecond, 5000);
  
  // THEN use it for snap threshold (kleiner für feinere Kontrolle)
  const snapThreshold = 5 / pixelsPerSecond; // 5 pixels in seconds (feiner als vorher)

  // Update undo/redo button states
  useEffect(() => {
    const interval = setInterval(() => {
      setCanUndo(undoRedoManager.canUndo());
      setCanRedo(undoRedoManager.canRedo());
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
    const time = x / pixelsPerSecond;
    
    dispatch(setCurrentTime(Math.max(0, time)));
  };

  const handleClipClick = (e: React.MouseEvent, clipId: string) => {
    e.stopPropagation();
    
    if (tool === 'razor') {
      // Razor tool active - split at current time
      const time = currentTime;
      dispatch(splitClip({ clipId, time }));
    } else {
      // Selection tool
      if (e.ctrlKey || e.metaKey) {
        const newSelection = selectedClipIds.includes(clipId)
          ? selectedClipIds.filter((id) => id !== clipId)
          : [...selectedClipIds, clipId];
        dispatch(selectClips(newSelection));
      } else {
        dispatch(selectClips([clipId]));
      }
    }
  };

  const handleClipDragStart = (e: React.DragEvent, clipId: string) => {
    console.log('🎬 Drag start event fired for clip:', clipId);
    
    if (tool === 'razor') {
      console.log('⚠️ Razor tool active, preventing drag');
      e.preventDefault();
      return;
    }
    
    const clip = clips.find(c => c.id === clipId);
    if (!clip) {
      console.error('❌ Clip not found:', clipId);
      return;
    }
    
    // WICHTIG: Berechne Offset relativ zum CLIP selbst, nicht zur Timeline!
    const clipElement = e.currentTarget as HTMLElement;
    const clipRect = clipElement.getBoundingClientRect();
    const clickX = e.clientX;
    const clipStartX = clipRect.left;
    const dragOffsetX = clickX - clipStartX; // Offset innerhalb des Clips
    
    console.log('📊 Click Position:', clickX, 'Clip Start:', clipStartX, 'Offset:', dragOffsetX, 'px');
    
    setDraggedClip(clipId);
    dragPreviewRef.current = {
      clipId: clipId,
      trackId: clip.trackId,
      startTime: clip.startTime,
      originalTrackId: clip.trackId,
      originalStartTime: clip.startTime,
      dragOffsetX: dragOffsetX,
    };
    
    // KEIN Browser-Overlay: Setze ein unsichtbares Drag-Image
    const emptyImg = new Image();
    emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(emptyImg, 0, 0);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', clipId);
    
    console.log('✅ Drag start complete - NO overlay!');
  };

  const handleClipDragEnd = () => {
    console.log('🔚 Drag end - cleanup only');
    
    // Cleanup wird im Drop-Handler gemacht
    // Hier nur für den Fall, dass kein Drop stattfand
    if (draggedClip) {
      const clipElement = document.querySelector(`[data-clip-id="${draggedClip}"]`) as HTMLElement;
      if (clipElement) {
        clipElement.style.transform = '';
        clipElement.style.opacity = '';
        clipElement.style.transition = '';
      }
    }
    
    setDraggedClip(null);
    dragPreviewRef.current = null;
    
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const handleResizeStart = (e: React.MouseEvent, clipId: string, edge: 'start' | 'end') => {
    e.stopPropagation();
    
    const clip = clips.find(c => c.id === clipId);
    if (!clip) return;
    
    setResizingClip({
      clipId,
      edge,
      initialX: e.clientX,
      initialValue: edge === 'start' ? clip.startTime : clip.duration,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!resizingClip || !timelineRef.current) return;
    
    const deltaX = e.clientX - resizingClip.initialX;
    const deltaTime = deltaX / pixelsPerSecond;
    
    const clip = clips.find(c => c.id === resizingClip.clipId);
    if (!clip) return;
    
    if (resizingClip.edge === 'start') {
      const newStartTime = Math.max(0, resizingClip.initialValue + deltaTime);
      const delta = newStartTime - clip.startTime;
      const newDuration = clip.duration - delta;
      
      if (newDuration > 0.1) {
        dispatch(updateClip({
          id: resizingClip.clipId,
          updates: {
            startTime: newStartTime,
            duration: newDuration,
            trimStart: clip.trimStart + delta,
          },
        }));
      }
    } else {
      const newDuration = Math.max(0.1, resizingClip.initialValue + deltaTime);
      dispatch(updateClip({
        id: resizingClip.clipId,
        updates: {
          duration: newDuration,
        },
      }));
    }
  };

  const handleMouseUp = () => {
    setResizingClip(null);
  };

  useEffect(() => {
    if (resizingClip) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizingClip]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected clips
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedClipIds.length > 0) {
        e.preventDefault();
        selectedClipIds.forEach(clipId => {
          const clipToRemove = clips.find(c => c.id === clipId);
          if (clipToRemove) {
            dispatch(removeClip(clipId));
          }
        });
        dispatch(selectClips([]));
      }
      
      // Space for play/pause
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        dispatch(togglePlay());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedClipIds, clips, dispatch]);

  const handleTrackDragOver = (e: React.DragEvent, trackId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    e.dataTransfer.dropEffect = draggedClip ? 'move' : 'copy';
    
    // Nur für bestehende Clips (Move)
    if (draggedClip && timelineRef.current && dragPreviewRef.current) {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      animationFrameRef.current = requestAnimationFrame(() => {
        if (!timelineRef.current || !dragPreviewRef.current) return;
        
        const rect = timelineRef.current.getBoundingClientRect();
        const mouseX = e.clientX; // Absolute Mouse-Position
        const timelineLeft = rect.left;
        const scrollLeft = timelineRef.current.scrollLeft;
        
        // Berechne neue Position MIT Offset
        const relativeMouseX = mouseX - timelineLeft + scrollLeft; // Position in Timeline
        const newStartX = relativeMouseX - dragPreviewRef.current.dragOffsetX; // Abzüglich Offset!
        let newStartTime = newStartX / pixelsPerSecond;
        
        console.log('🎯 Mouse:', mouseX, 'Offset:', dragPreviewRef.current.dragOffsetX, 'New Start:', newStartTime.toFixed(2));
        
        const clip = clips.find(c => c.id === draggedClip);
        if (clip) {
          // Snapping
          if (snapEnabled) {
            newStartTime = snapToGrid(newStartTime, snapEnabled, snapThreshold, clips, tracks, draggedClip);
          }
          
          newStartTime = Math.max(0, newStartTime);
          
          // Aktualisiere Preview-Ref für Drop
          dragPreviewRef.current = {
            ...dragPreviewRef.current,
            trackId: trackId,
            startTime: newStartTime,
          };
          
          // Visuelles Feedback: Verschiebe Clip mit Transform
          const clipElement = document.querySelector(`[data-clip-id="${draggedClip}"]`) as HTMLElement;
          if (clipElement) {
            const offset = (newStartTime - clip.startTime) * pixelsPerSecond;
            clipElement.style.transform = `translateX(${offset}px)`;
            clipElement.style.opacity = '0.7';
            clipElement.style.transition = 'none';
          }
        }
        
        animationFrameRef.current = null;
      });
    }
  };

  const handleTrackDrop = (e: React.DragEvent, trackId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('📍 Drop on track:', trackId);
    
    // Try to get JSON data first (from Media Library)
    let jsonData = '';
    try {
      jsonData = e.dataTransfer.getData('application/json');
    } catch (error) {
      console.warn('No JSON data:', error);
    }
    
    if (jsonData && jsonData.length > 0) {
      // Dropping from Media Library
      try {
        const mediaItem = JSON.parse(jsonData);
        console.log('📦 Parsed media item:', mediaItem);
        
        if (!timelineRef.current) {
          console.error('Timeline ref not available');
          return;
        }
        
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
        let startTime = x / pixelsPerSecond;
        
        // Apply snapping
        startTime = snapToGrid(startTime, snapEnabled, snapThreshold, clips, tracks);
        
        const duration = mediaItem.duration || 5;
        
        // Check for collision
        if (checkClipCollision('', trackId, startTime, duration, clips)) {
          console.warn('⚠️ Collision detected, finding next available position');
          startTime = findNextAvailablePosition(trackId, startTime, duration, clips);
        }
        
        console.log('🎬 Creating new clip at time:', startTime);
        
        const newClip: TimelineClip = {
          id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          mediaId: mediaItem.id,
          trackId: trackId,
          startTime: Math.max(0, startTime),
          duration: duration,
          trimStart: 0,
          trimEnd: 0,
          effects: [],
          volume: 100,
          speed: 1,
        };
        
        dispatch(addClip(newClip));
        console.log('✅ Clip added to timeline:', newClip);
      } catch (error) {
        console.error('❌ Error parsing drop data:', error);
      }
    } else if (draggedClip && dragPreviewRef.current) {
      // Moving existing clip
      console.log('📦 Moving existing clip:', draggedClip);
      
      const clip = clips.find(c => c.id === draggedClip);
      if (clip) {
        const newStartTime = dragPreviewRef.current.startTime;
        const originalTrackId = dragPreviewRef.current.originalTrackId;
        const originalStartTime = dragPreviewRef.current.originalStartTime;
        
        // Reset visual transform
        const clipElement = document.querySelector(`[data-clip-id="${draggedClip}"]`) as HTMLElement;
        if (clipElement) {
          clipElement.style.transform = '';
          clipElement.style.opacity = '';
          clipElement.style.transition = '';
        }
        
        // Check for collision (excluding self)
        if (checkClipCollision(draggedClip, trackId, newStartTime, clip.duration, clips)) {
          console.warn('⚠️ Collision detected, reverting');
          setDraggedClip(null);
          dragPreviewRef.current = null;
          return;
        }
        
        // Apply position update mit Undo
        if (newStartTime !== originalStartTime || trackId !== originalTrackId) {
          undoRedoManager.execute(createAction(
            'Move Clip',
            () => {
              dispatch(updateClip({
                id: draggedClip,
                updates: {
                  trackId: trackId,
                  startTime: newStartTime,
                },
              }));
            },
            () => {
              dispatch(updateClip({
                id: draggedClip,
                updates: {
                  trackId: originalTrackId,
                  startTime: originalStartTime,
                },
              }));
            }
          ));
          
          console.log(`✅ Clip moved to track ${trackId} at ${newStartTime.toFixed(2)}s`);
        }
      }
    } else {
      console.warn('⚠️ No data to drop');
    }
    
    // Cleanup
    setDraggedClip(null);
    dragPreviewRef.current = null;
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const handleZoomIn = () => {
    dispatch(setZoom(Math.min(zoom * 1.5, 10)));
  };

  const handleZoomOut = () => {
    dispatch(setZoom(Math.max(zoom / 1.5, 0.1)));
  };

  const handleAddVideoTrack = () => {
    const videoTracks = tracks.filter((t) => t.type === 'video');
    dispatch(addTrack({
      id: `v${videoTracks.length + 1}`,
      name: `Video ${videoTracks.length + 1}`,
      type: 'video',
      muted: false,
      locked: false,
      height: 80,
    }));
  };

  const handleAddAudioTrack = () => {
    const audioTracks = tracks.filter((t) => t.type === 'audio');
    dispatch(addTrack({
      id: `a${audioTracks.length + 1}`,
      name: `Audio ${audioTracks.length + 1}`,
      type: 'audio',
      muted: false,
      locked: false,
      height: 60,
    }));
  };

  return (
    <div className="timeline-panel" ref={containerRef}>
      <div className="timeline-toolbar">
        <Space size="small">
          {/* Selection and Track Tools */}
          <Tooltip title="Selection Tool (V)">
            <Button
              icon={<BorderOutlined />}
              type={tool === 'select' ? 'primary' : 'default'}
              onClick={() => setTool('select')}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Track Select Forward Tool (A)">
            <Button
              icon={<ArrowRightOutlined />}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Track Select Backward Tool (Shift+A)">
            <Button
              icon={<ArrowLeftOutlined />}
              size="small"
            />
          </Tooltip>
          
          {/* Edit Tools */}
          <Tooltip title="Ripple Edit Tool (B)">
            <Button
              icon={<ColumnWidthOutlined />}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Rolling Edit Tool (N)">
            <Button
              icon={<ColumnWidthOutlined style={{ transform: 'rotate(90deg)' }} />}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Rate Stretch Tool (X)">
            <Button
              icon={<CaretRightOutlined />}
              size="small"
            />
          </Tooltip>
          
          {/* Razor Tool */}
          <Tooltip title="Razor Tool (C)">
            <Button
              icon={<ScissorOutlined />}
              type={tool === 'razor' ? 'primary' : 'default'}
              onClick={() => setTool('razor')}
              size="small"
            />
          </Tooltip>
          
          {/* Slip/Slide Tools */}
          <Tooltip title="Slip Tool (Y)">
            <Button
              icon={<DragOutlined />}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Slide Tool (U)">
            <Button
              icon={<DragOutlined style={{ transform: 'rotate(90deg)' }} />}
              size="small"
            />
          </Tooltip>
          
          {/* Pen Tool */}
          <Tooltip title="Pen Tool (P)">
            <Button
              icon={<EditOutlined />}
              size="small"
            />
          </Tooltip>
          
          {/* Hand Tool */}
          <Tooltip title="Hand Tool (H)">
            <Button
              icon={<DragOutlined />}
              size="small"
            />
          </Tooltip>
          
          {/* Zoom Tool */}
          <Tooltip title="Zoom Tool (Z)">
            <Button
              icon={<ZoomInOutlined />}
              size="small"
            />
          </Tooltip>
          
          {/* Separator */}
          <div style={{ width: 1, height: 24, background: 'var(--pp-border)', margin: '0 4px' }} />
          
          {/* Snap and Link */}
          <Tooltip title="Snap in Timeline (S)">
            <Button
              icon={<LinkOutlined />}
              type={snapEnabled ? 'primary' : 'default'}
              onClick={() => setSnapEnabled(!snapEnabled)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Linked Selection">
            <Button
              icon={<LinkOutlined style={{ transform: 'rotate(90deg)' }} />}
              size="small"
            />
          </Tooltip>
          
          {/* Undo/Redo */}
          <Tooltip title="Undo (Ctrl+Z)">
            <Button 
              icon={<UndoOutlined />} 
              onClick={() => undoRedoManager.undo()}
              disabled={!canUndo}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Redo (Ctrl+Shift+Z)">
            <Button 
              icon={<RedoOutlined />} 
              onClick={() => undoRedoManager.redo()}
              disabled={!canRedo}
              size="small"
            />
          </Tooltip>
          
          {/* Track Management */}
          <Tooltip title="Add Video Track">
            <Button 
              icon={<PlusOutlined />} 
              onClick={handleAddVideoTrack}
              size="small"
            >
              V
            </Button>
          </Tooltip>
          <Tooltip title="Add Audio Track">
            <Button 
              icon={<PlusOutlined />} 
              onClick={handleAddAudioTrack}
              size="small"
            >
              A
            </Button>
          </Tooltip>
        </Space>
        
        <div className="zoom-slider">
          <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} size="small" />
          <Slider
            min={0.1}
            max={10}
            step={0.1}
            value={zoom}
            onChange={(value) => dispatch(setZoom(value))}
            style={{ width: 100 }}
          />
          <span>{Math.round(zoom * 100)}%</span>
          <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} size="small" />
        </div>
      </div>

      <div className="timeline-content">
        <div className="track-headers">
          {tracks.map((track) => (
            <div key={track.id} className="track-header" style={{ height: track.height }}>
              <div className="track-controls">
                <Tooltip title="Toggle Track Output">
                  <Button 
                    icon={<EyeOutlined />} 
                    size="small" 
                    type="text"
                    className="track-control-btn"
                  />
                </Tooltip>
                <Tooltip title="Lock Track">
                  <Button 
                    icon={<LockOutlined />} 
                    size="small" 
                    type="text"
                    className="track-control-btn"
                  />
                </Tooltip>
                <Tooltip title="Mute Track">
                  <Button 
                    icon={<SoundOutlined />} 
                    size="small" 
                    type="text"
                    className="track-control-btn"
                  />
                </Tooltip>
              </div>
              <div className="track-name">{track.name}</div>
            </div>
          ))}
        </div>

        <div 
          className="timeline-canvas-container" 
          ref={timelineRef}
          onClick={handleTimelineClick}
        >
          {/* Time ruler */}
          <div className="timeline-ruler" style={{ width: timelineWidth }}>
            {Array.from({ length: Math.ceil(duration / 5) + 20 }).map((_, i) => {
              const time = i * 5;
              return (
                <div
                  key={i}
                  className="ruler-marker"
                  style={{ left: time * pixelsPerSecond }}
                >
                  <div className="ruler-tick" />
                  <div className="ruler-label">{formatTimecode(time)}</div>
                </div>
              );
            })}
          </div>

          {/* Tracks with clips */}
          <div className="timeline-tracks">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="timeline-track"
                style={{ height: track.height }}
                onDragOver={(e) => handleTrackDragOver(e, track.id)}
                onDrop={(e) => handleTrackDrop(e, track.id)}
              >
                {clips
                  .filter((c) => c.trackId === track.id)
                  .map((clip) => {
                    const media = mediaItems.find((m) => m.id === clip.mediaId);
                    const isSelected = selectedClipIds.includes(clip.id);
                    const isDragging = draggedClip === clip.id;
                    
                    // Verwende normale Position (Transform wird via DOM direkt gesetzt)
                    const displayStartTime = clip.startTime;
                    
                    // Don't render if dragging to different track
                    const dragPreview = dragPreviewRef.current;
                    if (isDragging && dragPreview && dragPreview.trackId !== track.id) {
                      return null;
                    }
                    
                    return (
                      <div
                        key={clip.id}
                        data-clip-id={clip.id}
                        className={`timeline-clip ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
                        style={{
                          left: displayStartTime * pixelsPerSecond,
                          width: clip.duration * pixelsPerSecond,
                          willChange: isDragging ? 'transform' : 'auto',
                        }}
                        draggable={true}
                        onMouseDown={(e) => {
                          console.log('🖱️ MOUSE DOWN on clip:', clip.id);
                        }}
                        onDragStart={(e) => {
                          console.log('🎬 DRAG START EVENT FIRED for clip:', clip.id);
                          handleClipDragStart(e, clip.id);
                        }}
                        onDrag={(e) => {
                          console.log('📦 DRAG EVENT (during drag)');
                        }}
                        onDragEnd={() => {
                          console.log('🔚 DRAG END EVENT FIRED');
                          handleClipDragEnd();
                        }}
                        onClick={(e) => handleClipClick(e, clip.id)}
                      >
                        {/* Trim handle left */}
                        <div
                          className="clip-trim-handle clip-trim-left"
                          onMouseDown={(e) => {
                            if (tool === 'select') {
                              e.stopPropagation();
                              handleResizeStart(e, clip.id, 'start');
                            }
                          }}
                          style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
                        />
                        
                        {media?.thumbnail && (
                          <div className="clip-thumbnail">
                            <img src={media.thumbnail} alt={media.name} />
                          </div>
                        )}
                        <div className="clip-name">{media?.name || 'Untitled'}</div>
                        
                        {/* Trim handle right */}
                        <div
                          className="clip-trim-handle clip-trim-right"
                          onMouseDown={(e) => {
                            if (tool === 'select') {
                              e.stopPropagation();
                              handleResizeStart(e, clip.id, 'end');
                            }
                          }}
                          style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
                        />
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>

          {/* Playhead */}
          <div
            className="timeline-playhead"
            style={{ left: currentTime * pixelsPerSecond }}
          >
            <div className="playhead-handle" />
            <div className="playhead-line" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
