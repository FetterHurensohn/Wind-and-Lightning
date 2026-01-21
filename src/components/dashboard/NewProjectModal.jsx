/**
 * NewProjectModal.jsx - Neues Projekt Modal
 * 
 * Form: Name, Resolution, FPS, CapCut-Struktur erstellen
 * Actions: Abbrechen, Erstellen
 */

import React, { useState } from 'react';
import { CloseIcon } from '../../icons';
import electronAPI from '../../electron';

export default function NewProjectModal({ onClose, onCreate }) {
    const [formData, setFormData] = useState({
        name: `Projekt ${new Date().toLocaleDateString('de-DE')}`,
        resolution: '1080p',
        fps: 30,
        createStructure: true  // Standard: aktiviert
    });

    const [creating, setCreating] = useState(false);
    const [structureReport, setStructureReport] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('[Modal] handleSubmit called');
        setCreating(true);
        setStructureReport(null);

        try {
            // Parse Resolution
            const resolutionMap = {
                '720p': { width: 1280, height: 720 },
                '1080p': { width: 1920, height: 1080 },
                '4K': { width: 3840, height: 2160 }
            };

            const resolution = resolutionMap[formData.resolution] || { width: 1920, height: 1080 };
            console.log('[Modal] isElectron:', electronAPI.env.isElectron);

            // NEU: Erstelle UUID-basiertes Projekt
            if (electronAPI.env.isElectron && window.electronAPI?.projectAPI) {
                console.log('[Modal] Creating UUID project for:', formData.name);
                
                const result = await window.electronAPI.projectAPI.create(formData.name, {
                    fps: parseInt(formData.fps),
                    resolution,
                    sampleRate: 48000
                });
                
                console.log('[Modal] Project creation result:', result);

                if (!result.success) {
                    alert(`Fehler beim Erstellen des Projekts:\n${result.error}`);
                    setCreating(false);
                    return;
                }

                // Zeige Report
                setStructureReport({
                    created: 'Projekt erfolgreich erstellt',
                    projectPath: result.projectPath
                });

                // Schließe Modal
                // Schließe Modal und erstelle Projekt über onCreate callback
                onCreate({
                    ...formData,
                    id: result.projectId,
                    path: result.projectPath,
                    projectPath: result.projectPath
                });

                onClose();
            } else {
                // Browser-Modus: Einfach Projekt erstellen und öffnen
                const projectData = {
                    ...formData,
                    resolution: formData.resolution,
                    id: `browser_${Date.now()}`,
                    path: `browser_${Date.now()}`  // Gib einen "path" für konsistentes Verhalten
                };

                console.log('[Modal] Browser mode - Calling onCreate with:', projectData);
                await onCreate(projectData);
                console.log('[Modal] onCreate completed successfully');
                // Modal wird vom onCreate-Handler geschlossen
            }
        } catch (error) {
            console.error('[Modal] Error in handleSubmit:', error);
            alert(`Fehler: ${error.message}`);
            setCreating(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // ESC to close
    React.useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && !creating) onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose, creating]);

    return (
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="bg-[var(--panel)] rounded-xl w-full max-w-md mx-4 shadow-2xl animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-labelledby="modal-title"
                aria-modal="true"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
                    <h2 id="modal-title" className="text-lg font-semibold text-[var(--text)]">
                        Neues Projekt erstellen
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--text)] transition"
                        aria-label="Schließen"
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Projektname */}
                    <div>
                        <label htmlFor="project-name" className="block text-sm font-medium text-[var(--text)] mb-2">
                            Projektname
                        </label>
                        <input
                            id="project-name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            maxLength={30}
                            required
                            className="w-full h-10 px-3 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                            placeholder="Mein Projekt"
                            autoFocus
                        />
                    </div>

                    {/* Resolution */}
                    <div>
                        <label htmlFor="resolution" className="block text-sm font-medium text-[var(--text)] mb-2">
                            Auflösung
                        </label>
                        <select
                            id="resolution"
                            value={formData.resolution}
                            onChange={(e) => handleChange('resolution', e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                        >
                            <option value="720p">HD 720p (1280x720)</option>
                            <option value="1080p">Full HD 1080p (1920x1080)</option>
                            <option value="4K">4K UHD (3840x2160)</option>
                        </select>
                    </div>

                    {/* FPS */}
                    <div>
                        <label htmlFor="fps" className="block text-sm font-medium text-[var(--text)] mb-2">
                            Bildfrequenz (FPS)
                        </label>
                        <select
                            id="fps"
                            value={formData.fps}
                            onChange={(e) => handleChange('fps', parseInt(e.target.value))}
                            className="w-full h-10 px-3 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                            disabled={creating}
                        >
                            <option value={24}>24 FPS (Film)</option>
                            <option value={25}>25 FPS (PAL)</option>
                            <option value={30}>30 FPS (Standard)</option>
                            <option value={60}>60 FPS (Smooth)</option>
                        </select>
                    </div>

                    {/* Info: UUID-Projektstruktur */}
                    {electronAPI.env.isElectron && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                            <div className="flex-shrink-0 w-4 h-4 mt-0.5 text-blue-400">
                                <svg fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <label className="text-sm font-medium text-[var(--text)]">
                                    UUID-basierte Projektstruktur
                                </label>
                                <p className="text-xs text-[var(--muted)] mt-1">
                                    Das Projekt wird automatisch mit vollständiger Ordnerstruktur erstellt:<br />
                                    <code className="text-[10px] bg-[var(--panel)] px-1 py-0.5 rounded">
                                        Wind and Lightning Projekts\com.lveditor.draft\{formData.name}
                                    </code>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Structure Report */}
                    {structureReport && (
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                            <div className="text-sm text-green-400 font-medium mb-1">
                                ✅ Projektstruktur erfolgreich erstellt
                            </div>
                            <div className="text-xs text-[var(--muted)]">
                                {structureReport.created} neu erstellt, {structureReport.skipped} übersprungen
                                {structureReport.errors > 0 && (
                                    <span className="text-yellow-400"> | ⚠️ {structureReport.errors} Fehler</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={creating}
                            className="px-4 h-10 rounded-lg bg-[var(--card)] text-[var(--text)] hover:bg-[var(--hover)] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Abbrechen
                        </button>
                        <button
                            type="submit"
                            disabled={creating}
                            className="px-6 h-10 rounded-lg bg-[var(--accent-primary)] text-white hover:opacity-90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {creating && (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {creating ? 'Erstelle...' : 'Erstellen'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
