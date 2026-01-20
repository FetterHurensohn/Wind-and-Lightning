import React, { useState } from 'react';
import { Modal, Button, List, Card } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import './TransitionPicker.css';

interface Transition {
  id: string;
  name: string;
  type: string;
  thumbnail?: string;
  description: string;
}

interface TransitionPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (transition: Transition) => void;
}

const TransitionPicker: React.FC<TransitionPickerProps> = ({ visible, onClose, onSelect }) => {
  const transitions: Transition[] = [
    {
      id: 'crossfade',
      name: 'Cross Dissolve',
      type: 'dissolve',
      description: 'Smooth fade between clips',
    },
    {
      id: 'dip-to-black',
      name: 'Dip to Black',
      type: 'dip',
      description: 'Fade to black, then fade in',
    },
    {
      id: 'dip-to-white',
      name: 'Dip to White',
      type: 'dip',
      description: 'Fade to white, then fade in',
    },
    {
      id: 'wipe-left',
      name: 'Wipe Left',
      type: 'wipe',
      description: 'Wipe from right to left',
    },
    {
      id: 'wipe-right',
      name: 'Wipe Right',
      type: 'wipe',
      description: 'Wipe from left to right',
    },
    {
      id: 'wipe-up',
      name: 'Wipe Up',
      type: 'wipe',
      description: 'Wipe from bottom to top',
    },
    {
      id: 'wipe-down',
      name: 'Wipe Down',
      type: 'wipe',
      description: 'Wipe from top to bottom',
    },
    {
      id: 'zoom-in',
      name: 'Zoom In',
      type: 'zoom',
      description: 'Next clip zooms in',
    },
    {
      id: 'zoom-out',
      name: 'Zoom Out',
      type: 'zoom',
      description: 'Current clip zooms out',
    },
    {
      id: 'slide-left',
      name: 'Slide Left',
      type: 'slide',
      description: 'Next clip slides in from right',
    },
    {
      id: 'slide-right',
      name: 'Slide Right',
      type: 'slide',
      description: 'Next clip slides in from left',
    },
    {
      id: 'push-left',
      name: 'Push Left',
      type: 'push',
      description: 'Push current clip to the left',
    },
    {
      id: 'push-right',
      name: 'Push Right',
      type: 'push',
      description: 'Push current clip to the right',
    },
  ];

  const handleSelect = (transition: Transition) => {
    onSelect(transition);
    onClose();
  };

  return (
    <Modal
      title={<><ThunderboltOutlined /> Choose Transition</>}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={transitions}
        renderItem={(transition) => (
          <List.Item>
            <Card
              hoverable
              onClick={() => handleSelect(transition)}
              className="transition-card"
            >
              <div className="transition-preview">
                <ThunderboltOutlined style={{ fontSize: 32, color: '#1890ff' }} />
              </div>
              <Card.Meta
                title={transition.name}
                description={transition.description}
              />
            </Card>
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default TransitionPicker;
