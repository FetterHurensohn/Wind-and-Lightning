/**
 * Dashboard.jsx - Haupt-Dashboard (Startansicht)
 * 
 * Zweck: Dashboard-View mit Projektübersicht, Hero-CTA, Feature-Tiles
 * Props: { onOpenProject: (projectId) => void }
 * 
 * Annahmen:
 * - Thumbnails sind Placeholders (keine echten Video-Previews)
 * - KI-Features sind simuliert (nur UI)
 * - Projektsynchronisierung ist Mock (keine Cloud-Sync)
 */

import React, { useState, useEffect } from 'react';
import DashboardLeftSidebar from './dashboard/LeftSidebar';
import HeroBar from './dashboard/HeroBar';
import FeatureTiles from './dashboard/FeatureTiles';
import ProjectsHeader from './dashboard/ProjectsHeader';
import ProjectGrid from './dashboard/ProjectGrid';
import RightTooltip from './dashboard/RightTooltip';
import NewProjectModal from './dashboard/NewProjectModal';
import EditProjectModal from './dashboard/EditProjectModal';
import ConfirmDeleteModal from './dashboard/ConfirmDeleteModal';
import Toast from './dashboard/Toast';
import { useProjects } from '../hooks/useProjects';
import { useModal } from '../hooks/useModal';
import { useToast } from '../hooks/useToast';

export default function Dashboard({ onOpenProject }) {
    console.log('[Dashboard] Component rendering');
    console.log('[Dashboard] React type:', typeof React);
    
    const {
        projects: allProjects,
        loading,
        create,
        update,
        delete: deleteProjects,
        duplicate,
        getById
    } = useProjects();
    
    console.log('[Dashboard] useProjects returned:', { projectsCount: allProjects?.length, loading });
    
    const modal = useModal();
    const toast = useToast();

    const [selectedProjectIds, setSelectedProjectIds] = useState([]);
    const [selectionMode, setSelectionMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');

    // Filtered projects based on search
    const filteredProjects = searchQuery
        ? allProjects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : allProjects;

    // Handler: Neues Projekt erstellen
    const handleNewProject = () => {
        modal.open('newProject');
    };

    // Handler: Bestehendes Projekt bearbeiten (Selection Mode)
    const handleEditProject = () => {
        setSelectionMode(true);
        toast.show('Wähle ein Projekt zum Bearbeiten', 'info', 3000);
    };

    // Handler: Projekt öffnen
    const handleOpenProject = (projectId) => {
        // Finde Projekt
        const project = getById(projectId);
        
        if (!project) {
            toast.show('Projekt nicht gefunden', 'error', 3000);
            return;
        }
        
        // Öffne Editor mit projectPath (falls UUID-Projekt)
        if (project.path) {
            onOpenProject(project.path);
        } else {
            // Fallback: öffne Editor mit projectId
            onOpenProject(projectId);
        }
    };

    // Handler: Projekt erstellen (aus Modal)
    const handleCreateProject = async (projectData) => {
        const newId = await create(projectData);
        modal.close();

        // Toast mit Pfad-Info wenn Struktur erstellt wurde
        if (projectData.structurePath) {
            toast.show(
                `Projekt "${projectData.name}" erstellt: ${projectData.structurePath}`,
                'success',
                7000
            );
        } else {
            toast.show(`Projekt "${projectData.name}" erstellt`, 'success', 3000);
        }

        // Direkt zum Editor wechseln mit dem neuen Projekt
        // Verwende projectData.path direkt (vom Modal), nicht getById (da noch nicht geladen)
        if (projectData.path || projectData.projectPath) {
            onOpenProject(projectData.path || projectData.projectPath);
        } else {
            onOpenProject(newId);
        }
    };

    // Handler: Projekt duplizieren
    const handleDuplicateProject = async (projectId) => {
        const newId = await duplicate(projectId);
        toast.show('Projekt dupliziert', 'success', 3000);
    };

    // Handler: Projekt umbenennen
    const handleRenameProject = async (projectId, newName) => {
        await update(projectId, { name: newName });
        toast.show('Projekt umbenannt', 'success', 2000);
    };

    // Handler: Projekt löschen
    const handleDeleteProject = (projectIds) => {
        modal.open('confirmDelete', { projectIds });
    };

    // Handler: Löschen bestätigen
    const handleConfirmDelete = async (projectIds) => {
        const deletedProjects = projectIds.map(id => getById(id));
        await deleteProjects(projectIds);
        modal.close();
        setSelectedProjectIds([]);

        // Undo-Toast anzeigen
        toast.showUndo(
            `${projectIds.length} Projekt(e) gelöscht`,
            async () => {
                // Undo: Projekte wiederherstellen
                for (const project of deletedProjects) {
                    await create(project);
                }
                toast.show('Wiederhergestellt', 'success', 2000);
            },
            10000
        );
    };

    // Handler: Projekt-Selektion
    const handleSelectProject = (projectId, multiSelect) => {
        if (multiSelect) {
            setSelectedProjectIds(prev =>
                prev.includes(projectId)
                    ? prev.filter(id => id !== projectId)
                    : [...prev, projectId]
            );
        } else {
            setSelectedProjectIds([projectId]);
        }
    };

    // Handler: Alle selektieren
    const handleSelectAll = () => {
        setSelectedProjectIds(filteredProjects.map(p => p.id));
    };

    // Handler: Selektion aufheben
    const handleDeselectAll = () => {
        setSelectedProjectIds([]);
        setSelectionMode(false);
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl/Cmd+N: Neues Projekt
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                handleNewProject();
            }

            // Ctrl/Cmd+O: Bestehendes Projekt (wenn selektiert)
            if ((e.ctrlKey || e.metaKey) && e.key === 'o' && selectedProjectIds.length > 0) {
                e.preventDefault();
                onOpenProject(selectedProjectIds[0]);
            }

            // Delete: Löschen
            if (e.key === 'Delete' && selectedProjectIds.length > 0) {
                e.preventDefault();
                handleDeleteProject(selectedProjectIds);
            }

            // Enter: Öffnen
            if (e.key === 'Enter' && selectedProjectIds.length === 1) {
                e.preventDefault();
                onOpenProject(selectedProjectIds[0]);
            }

            // Ctrl/Cmd+A: Alle selektieren
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault();
                handleSelectAll();
            }

            // Escape: Deselect + Close Modal
            if (e.key === 'Escape') {
                handleDeselectAll();
                modal.close();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedProjectIds, modal]);

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex">
            {/* Left Sidebar */}
            <DashboardLeftSidebar />

            {/* Main Content */}
            <main className="flex-1 flex flex-col px-6 py-4 gap-4 overflow-auto">
                {/* Hero Bar mit CTA-Buttons */}
                <HeroBar
                    onNewProject={handleNewProject}
                    onEditProject={handleEditProject}
                />

                {/* Feature Tiles */}
                <FeatureTiles />

                {/* Projects Area */}
                <div className="flex gap-4 flex-1 relative">
                    <div className="flex-1">
                        <ProjectsHeader
                            projectCount={filteredProjects.length}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                            selectedCount={selectedProjectIds.length}
                            onDeleteSelected={() => handleDeleteProject(selectedProjectIds)}
                        />

                        <ProjectGrid
                            projects={filteredProjects}
                            selectedProjectIds={selectedProjectIds}
                            viewMode={viewMode}
                            onSelectProject={handleSelectProject}
                            onOpenProject={handleOpenProject}
                            onDuplicateProject={handleDuplicateProject}
                            onRenameProject={handleRenameProject}
                            onDeleteProject={(id) => handleDeleteProject([id])}
                        />
                    </div>

                    {/* Right Tooltip (Gelb) */}
                    <RightTooltip />
                </div>
            </main>

            {/* Modals */}
            {modal.isOpen && modal.modalType === 'newProject' && (
                <NewProjectModal
                    onClose={modal.close}
                    onCreate={handleCreateProject}
                />
            )}

            {modal.isOpen && modal.modalType === 'editProject' && (
                <EditProjectModal
                    selectedProjects={selectedProjectIds.map(id => projects.getById(id))}
                    onClose={modal.close}
                    onOpen={onOpenProject}
                />
            )}

            {modal.isOpen && modal.modalType === 'confirmDelete' && (
                <ConfirmDeleteModal
                    projectCount={modal.modalData?.projectIds?.length || 0}
                    onClose={modal.close}
                    onConfirm={() => handleConfirmDelete(modal.modalData.projectIds)}
                />
            )}

            {/* Toast Notifications */}
            <Toast toasts={toast.toasts} onDismiss={toast.dismiss} />
        </div>
    );
}
