/**
 * ProjectGrid.jsx - Projects Grid/List Display
 * 
 * Grid: 6 Spalten (wie Screenshot)
 * List: Volle Breite mit Details
 */

import React from 'react';
import ProjectCard from './ProjectCard';

export default function ProjectGrid({ 
  projects, 
  selectedProjectIds,
  viewMode,
  onSelectProject,
  onOpenProject,
  onDuplicateProject,
  onRenameProject,
  onDeleteProject
}) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--panel)] flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-[var(--muted)] text-sm">Keine Projekte gefunden</p>
      </div>
    );
  }

  if (viewMode === 'list') {
    // List View (Simplified - can be enhanced)
    return (
      <div className="flex flex-col gap-2">
        {projects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            selected={selectedProjectIds.includes(project.id)}
            viewMode="list"
            onSelect={onSelectProject}
            onOpen={onOpenProject}
            onDuplicate={onDuplicateProject}
            onRename={onRenameProject}
            onDelete={onDeleteProject}
          />
        ))}
      </div>
    );
  }

  // Grid View (6 columns like screenshot)
  return (
    <div className="grid grid-cols-6 gap-3">
      {projects.map(project => (
        <ProjectCard
          key={project.id}
          project={project}
          selected={selectedProjectIds.includes(project.id)}
          viewMode="grid"
          onSelect={onSelectProject}
          onOpen={onOpenProject}
          onDuplicate={onDuplicateProject}
          onRename={onRenameProject}
          onDelete={onDeleteProject}
        />
      ))}
    </div>
  );
}
