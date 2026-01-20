import React from 'react';
import { 
  SelectOutlined, 
  ScissorOutlined,
  DragOutlined,
  ZoomInOutlined,
  FontSizeOutlined,
  EditOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  ColumnWidthOutlined,
  CaretRightOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import './VerticalToolbar.css';

const VerticalToolbar: React.FC = () => {
  const [activeTool, setActiveTool] = React.useState('select');
  
  const tools = [
    { id: 'select', icon: <SelectOutlined />, label: 'Selection Tool (V)' },
    { id: 'track-forward', icon: <ArrowRightOutlined />, label: 'Track Select Forward Tool (A)' },
    { id: 'track-backward', icon: <ArrowLeftOutlined />, label: 'Track Select Backward Tool' },
    { id: 'ripple', icon: <ColumnWidthOutlined />, label: 'Ripple Edit Tool (B)' },
    { id: 'rolling', icon: <ColumnWidthOutlined style={{ transform: 'rotate(90deg)' }} />, label: 'Rolling Edit Tool (N)' },
    { id: 'rate', icon: <CaretRightOutlined />, label: 'Rate Stretch Tool (X)' },
    { id: 'razor', icon: <ScissorOutlined />, label: 'Razor Tool (C)' },
    { id: 'slip', icon: <DragOutlined />, label: 'Slip Tool (Y)' },
    { id: 'slide', icon: <DragOutlined style={{ transform: 'rotate(90deg)' }} />, label: 'Slide Tool (U)' },
    { id: 'pen', icon: <EditOutlined />, label: 'Pen Tool (P)' },
    { id: 'hand', icon: <DragOutlined />, label: 'Hand Tool (H)' },
    { id: 'zoom', icon: <ZoomInOutlined />, label: 'Zoom Tool (Z)' },
    { id: 'camera', icon: <VideoCameraOutlined />, label: 'Camera Tool' },
    { id: 'text', icon: <FontSizeOutlined />, label: 'Type Tool (T)' },
  ];
  
  return (
    <div className="pp-vertical-toolbar">
      {tools.map(tool => (
        <button
          key={tool.id}
          className={`pp-tool-button ${activeTool === tool.id ? 'active' : ''}`}
          onClick={() => setActiveTool(tool.id)}
          title={tool.label}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
};

export default VerticalToolbar;
