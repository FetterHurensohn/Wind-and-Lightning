/**
 * Editor.jsx - Video-Editor Wrapper
 * 
 * Rendert das neue pixelgenaue Editor-Layout
 * Props: { projectId, onBackToDashboard }
 */

import React from 'react';
import EditorLayout from './editor/EditorLayout';

export default function Editor({ projectId, onBackToDashboard }) {
    return <EditorLayout projectId={projectId} onBackToDashboard={onBackToDashboard} />;
}
