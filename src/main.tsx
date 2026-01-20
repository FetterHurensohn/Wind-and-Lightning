import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { ConfigProvider, theme } from 'antd';
import App from './App';
import { store } from './store/store';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            // Colors
            colorBgContainer: '#343541',
            colorBgElevated: '#444654',
            colorBgLayout: '#202123',
            colorBorder: 'rgba(255, 255, 255, 0.1)',
            colorBorderSecondary: 'rgba(255, 255, 255, 0.15)',
            
            // Text
            colorText: '#ECECF1',
            colorTextSecondary: '#8E8EA0',
            colorTextTertiary: '#6E6E80',
            colorTextQuaternary: '#565869',
            
            // Primary/Accent - ChatGPT Green
            colorPrimary: '#19C37D',
            colorPrimaryHover: '#1A7F5A',
            colorPrimaryActive: '#15523C',
            colorPrimaryBorder: '#19C37D',
            
            // Success/Error/Warning
            colorSuccess: '#19C37D',
            colorError: '#EF4444',
            colorWarning: '#F59E0B',
            colorInfo: '#3B82F6',
            
            // Border Radius
            borderRadius: 8,
            borderRadiusLG: 12,
            borderRadiusSM: 6,
            
            // Font
            fontSize: 14,
            fontSizeHeading1: 32,
            fontSizeHeading2: 24,
            fontSizeHeading3: 18,
            fontSizeHeading4: 16,
            fontSizeHeading5: 14,
            fontWeightStrong: 600,
            
            // Spacing
            padding: 16,
            paddingLG: 24,
            paddingMD: 16,
            paddingSM: 12,
            paddingXS: 8,
            paddingXXS: 4,
            
            // Motion
            motionDurationFast: '0.15s',
            motionDurationMid: '0.2s',
            motionDurationSlow: '0.3s',
            
            // Box Shadow
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
            boxShadowSecondary: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
          },
          components: {
            Button: {
              primaryColor: '#000000',
              colorPrimary: '#19C37D',
              colorPrimaryHover: '#1A7F5A',
              colorPrimaryActive: '#15523C',
              algorithm: true,
            },
            Input: {
              colorBgContainer: '#343541',
              colorBorder: 'rgba(255, 255, 255, 0.1)',
              activeBorderColor: '#19C37D',
              hoverBorderColor: 'rgba(255, 255, 255, 0.15)',
            },
            Slider: {
              trackBg: '#19C37D',
              trackHoverBg: '#1A7F5A',
              handleColor: '#19C37D',
              handleActiveColor: '#1A7F5A',
              railBg: 'rgba(255, 255, 255, 0.1)',
              railHoverBg: 'rgba(255, 255, 255, 0.15)',
            },
          },
        }}
      >
        <App />
      </ConfigProvider>
    </Provider>
  </React.StrictMode>
);
