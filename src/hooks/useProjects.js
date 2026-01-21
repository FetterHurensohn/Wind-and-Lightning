/**
 * useProjects.js - Projects Management Hook (FILESYSTEM SYNC)
 * 
 * API: create, update, delete, duplicate, search, loadFromFileSystem
 * Persistence: Liest aus tatsächlichem Dateisystem unter C:\Users\jacqu\OneDrive\Desktop\Wind and Lightning Projekts\com.lveditor.draft
 */

import { useState, useEffect } from 'react';
import { generateId } from '../utils/helpers';
import { projectAPI } from '../electron';

const STORAGE_KEY = 'capcut_dashboard_projects_v1';

export function useProjects() {
  console.log('[useProjects] Hook called, React useState type:', typeof useState);
  
  if (typeof useState !== 'function') {
    console.error('[useProjects] ERROR: useState is not a function!', useState);
  }
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  console.log('[useProjects] State initialized successfully');

  // Load projects from file system (Electron) or localStorage (browser fallback)
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    
    // Try to load from Electron UUID-API first
    if (window.electronAPI?.projectAPI) {
      try {
        const fsResult = await window.electronAPI.projectAPI.listAll();
        
        if (fsResult.success && fsResult.projects && fsResult.projects.length > 0) {
          console.log(`[useProjects] Loaded ${fsResult.projects.length} UUID projects from file system`);
          setProjects(fsResult.projects);
          // Also save to localStorage for offline access
          localStorage.setItem(STORAGE_KEY, JSON.stringify(fsResult.projects));
          setLoading(false);
          return;
        }
        
        if (fsResult.success && fsResult.projects.length === 0) {
          console.log('[useProjects] No UUID projects found, checking localStorage');
          // Fall through to localStorage check
        } else {
          console.warn('[useProjects] Failed to load UUID projects:', fsResult.error);
        }
      } catch (error) {
        console.error('[useProjects] Error loading UUID projects:', error);
      }
    }
    
    // Fallback: Try old projectAPI
    try {
      const fsResult = await projectAPI.listProjects();
      
      if (fsResult.success && fsResult.projects && fsResult.projects.length > 0) {
        console.log(`[useProjects] Loaded ${fsResult.projects.length} projects from file system`);
        setProjects(fsResult.projects);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fsResult.projects));
        setLoading(false);
        return;
      }
    } catch (error) {
      console.log('[useProjects] File system API not available:', error.message);
    }
    
    // Always try localStorage as final fallback
    console.log('[useProjects] Using localStorage');
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setProjects(parsed);
          console.log(`[useProjects] Loaded ${parsed.length} projects from localStorage`);
        } else {
          setProjects([]);
        }
      } catch (e) {
        console.error('Failed to load projects from localStorage:', e);
        setProjects([]);
      }
    } else {
      setProjects([]);
    }
    
    setLoading(false);
  };

  // Reload projects from file system
  const reload = async () => {
    await loadProjects();
  };

  // Save projects to localStorage (for browser fallback or caching)
  const saveProjects = (updatedProjects) => {
    setProjects(updatedProjects);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
  };

  // Create new project (only updates localStorage, actual folder created separately)
  const create = async (projectData) => {
    const newProject = {
      id: projectData.id || generateId('proj'),
      name: projectData.name || `Projekt ${Date.now()}`,
      resolution: projectData.resolution || '1080p',
      fps: projectData.fps || 30,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      thumbnail: 'placeholder',
      duration: '00:00',
      size: '0K',
      tracks: projectData.tracks || [],
      media: projectData.media || [],
      favorited: false,
      path: projectData.path || null,
      ...projectData
    };
    
    const updated = [newProject, ...projects];
    saveProjects(updated);
    
    console.log('[useProjects] Created new project:', newProject.id, newProject.name);
    
    return newProject.id;
  };

  // Update project
  const update = async (projectId, updates) => {
    const updated = projects.map(p => 
      p.id === projectId 
        ? { ...p, ...updates, modifiedAt: Date.now() }
        : p
    );
    saveProjects(updated);
  };

  // Delete projects (löscht tatsächlich aus dem Dateisystem)
  const deleteProjects = async (projectIds) => {
    // Wenn Electron verfügbar, lösche aus Dateisystem
    if (window.electronAPI?.projectAPI?.delete) {
      for (const projectId of projectIds) {
        const project = projects.find(p => p.id === projectId);
        
        if (project && project.path) {
          console.log('[useProjects] Deleting project from filesystem:', project.path);
          
          const result = await window.electronAPI.projectAPI.delete(project.path);
          
          if (!result.success) {
            console.error('[useProjects] Failed to delete project:', result.error);
            alert(`Fehler beim Löschen: ${result.error}`);
            return;
          }
        }
      }
      
      // Reload von Dateisystem nach Löschen
      await loadProjects();
    } else {
      // Fallback: nur aus localStorage löschen
      const updated = projects.filter(p => !projectIds.includes(p.id));
      saveProjects(updated);
    }
  };

  // Duplicate project
  const duplicate = async (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;

    const newId = await create({
      ...project,
      name: `${project.name} (Kopie)`,
      id: undefined
    });
    return newId;
  };

  // Reorder projects
  const reorder = (fromIdx, toIdx) => {
    const updated = [...projects];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    saveProjects(updated);
  };

  // Search projects
  const search = (query) => {
    if (!query) return projects;
    const lowerQuery = query.toLowerCase();
    return projects.filter(p => 
      p.name.toLowerCase().includes(lowerQuery)
    );
  };

  // Get project by ID
  const getById = (projectId) => {
    return projects.find(p => p.id === projectId) || null;
  };

  return {
    projects,
    loading,
    create,
    update,
    delete: deleteProjects,
    duplicate,
    reorder,
    search,
    getById,
    reload // Exposes reload function
  };
}
