import React, { useState } from 'react';
import { Layout, Button, message } from 'antd';
import {
  ExportOutlined,
} from '@ant-design/icons';
import './App.css';
import MediaLibrary from './components/MediaLibrary/MediaLibrary';
import Timeline from './components/Timeline/Timeline';
import Preview from './components/Preview/Preview';
import ExportDialog from './components/ExportDialog/ExportDialog';
import VerticalToolbar from './components/VerticalToolbar/VerticalToolbar';

const { Header, Content, Sider } = Layout;

const App: React.FC = () => {
  const [exportDialogVisible, setExportDialogVisible] = useState(false);

  const handleExport = () => {
    setExportDialogVisible(true);
  };

  return (
    <div className="app">
      <Layout style={{ height: '100vh' }}>
        {/* Header */}
        <Header className="pp-header">
          <div className="pp-menubar">
            <span className="pp-logo">Adobe Premiere Pro 2023 - D:\20230601 | Tutorial\07 PREMIERE\Light Up Art *</span>
            <div className="pp-menu-items">
              <span className="pp-menu-item">File</span>
              <span className="pp-menu-item">Edit</span>
              <span className="pp-menu-item">Clip</span>
              <span className="pp-menu-item">Sequence</span>
              <span className="pp-menu-item">Graphics and Titles</span>
              <span className="pp-menu-item">View</span>
              <span className="pp-menu-item">Window</span>
              <span className="pp-menu-item">Help</span>
            </div>
            <div className="pp-header-actions">
              <Button 
                icon={<ExportOutlined />} 
                onClick={handleExport}
                type="primary"
                size="small"
              >
                Export
              </Button>
            </div>
          </div>
        </Header>

        {/* Main Content */}
        <Layout>
          {/* Left Sidebar - Media Library */}
          <Sider 
            width={280} 
            className="pp-media-sidebar"
            theme="dark"
          >
            <MediaLibrary />
          </Sider>

          {/* Center - Dual Monitor Preview and Timeline */}
          <Content className="pp-main-content">
            <div className="pp-monitor-container">
              <div className="pp-source-monitor">
                <div className="pp-monitor-header">Source</div>
                <div className="pp-monitor-content">
                  <Preview monitorType="source" />
                </div>
              </div>
              <div className="pp-program-monitor">
                <div className="pp-monitor-header">Program</div>
                <div className="pp-monitor-content">
                  <Preview monitorType="program" />
                </div>
              </div>
            </div>
            <div className="pp-timeline-container">
              <Timeline />
            </div>
          </Content>

          {/* Right Sidebar - Vertical Toolbar */}
          <Sider 
            width={48} 
            className="pp-toolbar-sidebar"
            theme="dark"
          >
            <VerticalToolbar />
          </Sider>
        </Layout>
      </Layout>

      {/* Export Dialog */}
      <ExportDialog
        visible={exportDialogVisible}
        onClose={() => setExportDialogVisible(false)}
      />
    </div>
  );
};

export default App;
