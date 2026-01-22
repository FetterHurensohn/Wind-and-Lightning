/**
 * App.jsx - Root Application mit State-Based Routing
 * 
 * Views: Dashboard (Start) | Editor (Projekt-Bearbeitung)
 */

import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import EditorLayout from './components/editor/EditorLayout';

export default function App() {
  // Start directly in editor for web preview (no Electron)
  const [currentView, setCurrentView] = useState('editor'); // Changed to 'editor' for testing
  const [currentProjectPath, setCurrentProjectPath] = useState(null);

  const handleOpenEditor = (projectPath) => {
    setCurrentProjectPath(projectPath);
    setCurrentView('editor');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setCurrentProjectPath(null);
  };

  return (
    <>
      {currentView === 'dashboard' && (
        <Dashboard onOpenProject={handleOpenEditor} />
      )}
      {currentView === 'editor' && (
        <EditorLayout 
          projectPath={currentProjectPath}
          onBackToDashboard={handleBackToDashboard} 
        />
      )}
    </>
  );
}
