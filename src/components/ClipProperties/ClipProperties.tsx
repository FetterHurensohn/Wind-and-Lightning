import React, { useState } from 'react';
import { Card, Form, InputNumber, Slider, Divider, Space, Button } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { updateClip } from '../../store/timelineSlice';
import TransitionPicker from '../TransitionPicker/TransitionPicker';
import './ClipProperties.css';

const ClipProperties: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedClipIds = useAppSelector((state) => state.timeline.selectedClipIds);
  const clips = useAppSelector((state) => state.timeline.clips);
  const mediaItems = useAppSelector((state) => state.media.items);
  const [transitionPickerVisible, setTransitionPickerVisible] = useState(false);
  const [transitionType, setTransitionType] = useState<'in' | 'out'>('in');

  const selectedClip = clips.find((c) => c.id === selectedClipIds[0]);
  const media = selectedClip ? mediaItems.find((m) => m.id === selectedClip.mediaId) : null;

  if (!selectedClip) {
    return (
      <div className="clip-properties">
        <Card title="Clip Properties" size="small">
          <div className="no-selection">
            Select a clip to view properties
          </div>
        </Card>
      </div>
    );
  }

  const handleUpdate = (field: string, value: any) => {
    dispatch(updateClip({
      id: selectedClip.id,
      updates: { [field]: value },
    }));
  };

  const handleAddTransition = (type: 'in' | 'out') => {
    setTransitionType(type);
    setTransitionPickerVisible(true);
  };

  const handleSelectTransition = (transition: any) => {
    const field = transitionType === 'in' ? 'transitionIn' : 'transitionOut';
    handleUpdate(field, {
      type: transition.id,
      duration: 0.5, // default 0.5 seconds
    });
  };

  const handleRemoveTransition = (type: 'in' | 'out') => {
    const field = type === 'in' ? 'transitionIn' : 'transitionOut';
    handleUpdate(field, undefined);
  };

  return (
    <div className="clip-properties">
      <Card title="Clip Properties" size="small">
        <Form layout="vertical" size="small">
          {/* Clip Info */}
          <div className="property-section">
            <h4>Media</h4>
            <div className="property-item">
              <span className="property-label">Name:</span>
              <span className="property-value">{media?.name || 'Unknown'}</span>
            </div>
            <div className="property-item">
              <span className="property-label">Type:</span>
              <span className="property-value">{media?.type || 'Unknown'}</span>
            </div>
          </div>

          <Divider />

          {/* Position & Duration */}
          <div className="property-section">
            <h4>Position & Duration</h4>
            
            <Form.Item label="Start Time (s)">
              <InputNumber
                value={parseFloat(selectedClip.startTime.toFixed(3))}
                onChange={(value) => handleUpdate('startTime', value || 0)}
                min={0}
                step={0.1}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item label="Duration (s)">
              <InputNumber
                value={parseFloat(selectedClip.duration.toFixed(3))}
                onChange={(value) => handleUpdate('duration', value || 0.1)}
                min={0.1}
                step={0.1}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item label="Trim Start (s)">
              <InputNumber
                value={parseFloat(selectedClip.trimStart.toFixed(3))}
                onChange={(value) => handleUpdate('trimStart', value || 0)}
                min={0}
                step={0.1}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item label="Trim End (s)">
              <InputNumber
                value={parseFloat(selectedClip.trimEnd.toFixed(3))}
                onChange={(value) => handleUpdate('trimEnd', value || 0)}
                min={0}
                step={0.1}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>

          <Divider />

          {/* Audio */}
          <div className="property-section">
            <h4>Audio</h4>
            
            <Form.Item label={`Volume: ${selectedClip.volume}%`}>
              <Slider
                value={selectedClip.volume}
                onChange={(value) => handleUpdate('volume', value)}
                min={0}
                max={200}
                step={1}
              />
            </Form.Item>
          </div>

          <Divider />

          {/* Speed */}
          <div className="property-section">
            <h4>Speed</h4>
            
            <Form.Item label={`Speed: ${selectedClip.speed}x`}>
              <Slider
                value={selectedClip.speed}
                onChange={(value) => handleUpdate('speed', value)}
                min={0.25}
                max={4}
                step={0.25}
                marks={{
                  0.25: '0.25x',
                  1: '1x',
                  2: '2x',
                  4: '4x',
                }}
              />
            </Form.Item>
          </div>

          <Divider />

          {/* Transitions */}
          <div className="property-section">
            <h4>Transitions</h4>
            
            {/* Transition In */}
            <Form.Item label="Transition In">
              {selectedClip.transitionIn ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div className="property-item">
                    <span className="property-label">Type:</span>
                    <span className="property-value">{selectedClip.transitionIn.type}</span>
                  </div>
                  <InputNumber
                    value={parseFloat(selectedClip.transitionIn.duration.toFixed(2))}
                    onChange={(value) => handleUpdate('transitionIn', { ...selectedClip.transitionIn, duration: value || 0.5 })}
                    min={0.1}
                    max={2}
                    step={0.1}
                    addonAfter="s"
                    style={{ width: '100%' }}
                  />
                  <Button 
                    size="small" 
                    danger 
                    onClick={() => handleRemoveTransition('in')}
                    style={{ width: '100%' }}
                  >
                    Remove
                  </Button>
                </Space>
              ) : (
                <Button 
                  icon={<ThunderboltOutlined />}
                  onClick={() => handleAddTransition('in')}
                  style={{ width: '100%' }}
                >
                  Add Transition
                </Button>
              )}
            </Form.Item>

            {/* Transition Out */}
            <Form.Item label="Transition Out">
              {selectedClip.transitionOut ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div className="property-item">
                    <span className="property-label">Type:</span>
                    <span className="property-value">{selectedClip.transitionOut.type}</span>
                  </div>
                  <InputNumber
                    value={parseFloat(selectedClip.transitionOut.duration.toFixed(2))}
                    onChange={(value) => handleUpdate('transitionOut', { ...selectedClip.transitionOut, duration: value || 0.5 })}
                    min={0.1}
                    max={2}
                    step={0.1}
                    addonAfter="s"
                    style={{ width: '100%' }}
                  />
                  <Button 
                    size="small" 
                    danger 
                    onClick={() => handleRemoveTransition('out')}
                    style={{ width: '100%' }}
                  >
                    Remove
                  </Button>
                </Space>
              ) : (
                <Button 
                  icon={<ThunderboltOutlined />}
                  onClick={() => handleAddTransition('out')}
                  style={{ width: '100%' }}
                >
                  Add Transition
                </Button>
              )}
            </Form.Item>
          </div>

          <Divider />

          {/* Effects Count */}
          <div className="property-section">
            <h4>Effects</h4>
            <div className="property-item">
              <span className="property-label">Applied:</span>
              <span className="property-value">{selectedClip.effects.length}</span>
            </div>
          </div>
        </Form>
      </Card>

      {/* Transition Picker Dialog */}
      <TransitionPicker
        visible={transitionPickerVisible}
        onClose={() => setTransitionPickerVisible(false)}
        onSelect={handleSelectTransition}
      />
    </div>
  );
};

export default ClipProperties;
