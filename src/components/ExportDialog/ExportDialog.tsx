import React, { useState } from 'react';
import { Modal, Select, InputNumber, Button, Progress, message } from 'antd';
import { useAppSelector } from '../../store/hooks';
import './ExportDialog.css';

interface ExportDialogProps {
  visible: boolean;
  onClose: () => void;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ visible, onClose }) => {
  const clips = useAppSelector((state) => state.timeline.clips);
  const mediaItems = useAppSelector((state) => state.media.items);
  const duration = useAppSelector((state) => state.timeline.duration);
  
  const [resolution, setResolution] = useState<'1920x1080' | '1280x720' | '3840x2160'>('1920x1080');
  const [frameRate, setFrameRate] = useState<number>(30);
  const [bitrate, setBitrate] = useState<number>(8);
  const [format, setFormat] = useState<'webm' | 'mp4'>('webm');
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = async () => {
    if (clips.length === 0) {
      message.error('No clips to export');
      return;
    }

    setExporting(true);
    setProgress(0);

    try {
      const [width, height] = resolution.split('x').map(Number);
      
      // Create canvas for rendering
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Setup MediaRecorder
      const stream = canvas.captureStream(frameRate);
      const mimeType = format === 'webm' ? 'video/webm;codecs=vp9' : 'video/webm';
      
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        throw new Error(`Format ${format} is not supported in this browser`);
      }

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: bitrate * 1000000,
      });

      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: format === 'webm' ? 'video/webm' : 'video/mp4' });
        const url = URL.createObjectURL(blob);
        
        // Download file
        const a = document.createElement('a');
        a.href = url;
        a.download = `export-${Date.now()}.${format}`;
        a.click();
        
        URL.revokeObjectURL(url);
        setExporting(false);
        setProgress(100);
        message.success('Export completed successfully!');
        onClose();
      };

      recorder.onerror = (e) => {
        console.error('MediaRecorder error:', e);
        message.error('Export failed');
        setExporting(false);
      };

      recorder.start();

      // Render frames
      const frameDuration = 1 / frameRate;
      const totalFrames = Math.ceil(duration * frameRate);
      let currentFrame = 0;

      const renderFrame = async (time: number) => {
        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        // Find active clip at this time
        const activeClips = clips.filter(clip => 
          time >= clip.startTime && 
          time < clip.startTime + clip.duration
        ).sort((a, b) => {
          // Sort by track order (assuming track IDs have ordering)
          return a.trackId.localeCompare(b.trackId);
        });

        // Render each active clip
        for (const clip of activeClips) {
          const media = mediaItems.find(m => m.id === clip.mediaId);
          if (!media) continue;

          const clipTime = time - clip.startTime + clip.trimStart;

          if (media.type === 'video') {
            const video = document.createElement('video');
            video.src = media.url;
            video.muted = true;
            
            try {
              await new Promise((resolve, reject) => {
                video.onloadedmetadata = resolve;
                video.onerror = reject;
              });
              
              video.currentTime = clipTime;
              
              await new Promise((resolve) => {
                video.onseeked = resolve;
              });

              // Draw video frame
              ctx.drawImage(video, 0, 0, width, height);
            } catch (error) {
              console.error('Error rendering video frame:', error);
            }
          } else if (media.type === 'image') {
            const img = new Image();
            img.src = media.url;
            
            try {
              await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
              });
              
              ctx.drawImage(img, 0, 0, width, height);
            } catch (error) {
              console.error('Error rendering image:', error);
            }
          }
        }
      };

      // Render all frames
      const renderLoop = async () => {
        for (let time = 0; time <= duration; time += frameDuration) {
          await renderFrame(time);
          await new Promise(resolve => setTimeout(resolve, frameDuration * 1000));
          
          currentFrame++;
          setProgress(Math.floor((currentFrame / totalFrames) * 100));
        }
        
        recorder.stop();
      };

      renderLoop();

    } catch (error: any) {
      console.error('Export error:', error);
      message.error(`Export failed: ${error.message}`);
      setExporting(false);
    }
  };

  return (
    <Modal
      title="Export Video"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={exporting}>
          Cancel
        </Button>,
        <Button
          key="export"
          type="primary"
          onClick={handleExport}
          loading={exporting}
          disabled={clips.length === 0}
        >
          {exporting ? 'Exporting...' : 'Export'}
        </Button>,
      ]}
      width={600}
    >
      <div className="export-settings">
        <div className="export-setting-row">
          <label>Resolution:</label>
          <Select
            value={resolution}
            onChange={setResolution}
            style={{ width: 200 }}
            disabled={exporting}
          >
            <Select.Option value="1280x720">HD 720p</Select.Option>
            <Select.Option value="1920x1080">Full HD 1080p</Select.Option>
            <Select.Option value="3840x2160">4K 2160p</Select.Option>
          </Select>
        </div>

        <div className="export-setting-row">
          <label>Frame Rate:</label>
          <InputNumber
            value={frameRate}
            onChange={(value) => setFrameRate(value || 30)}
            min={24}
            max={60}
            step={1}
            disabled={exporting}
            addonAfter="fps"
          />
        </div>

        <div className="export-setting-row">
          <label>Bitrate:</label>
          <InputNumber
            value={bitrate}
            onChange={(value) => setBitrate(value || 8)}
            min={1}
            max={50}
            step={1}
            disabled={exporting}
            addonAfter="Mbps"
          />
        </div>

        <div className="export-setting-row">
          <label>Format:</label>
          <Select
            value={format}
            onChange={setFormat}
            style={{ width: 200 }}
            disabled={exporting}
          >
            <Select.Option value="webm">WebM (VP9)</Select.Option>
            <Select.Option value="mp4">MP4 (Experimental)</Select.Option>
          </Select>
        </div>

        {exporting && (
          <div className="export-progress">
            <Progress percent={progress} status="active" />
            <p className="export-progress-text">
              Rendering video... This may take a while.
            </p>
          </div>
        )}

        {clips.length === 0 && (
          <div className="export-warning">
            No clips in timeline. Add some clips to export.
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ExportDialog;
