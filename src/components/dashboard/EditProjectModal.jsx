/**
 * EditProjectModal.jsx - Bestehendes Projekt bearbeiten Modal
 * 
 * Zeigt selektierte Projekte, öffnet erstes im Editor
 */

import React from 'react';
import { CloseIcon } from '../../icons';

export default function EditProjectModal({ selectedProjects, onClose, onOpen }) {
  const handleOpen = () => {
    if (selectedProjects && selectedProjects.length > 0) {
      onOpen(selectedProjects[0].id);
    }
  };

  // ESC to close
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

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
            Projekt bearbeiten
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--text)] transition"
            aria-label="Schließen"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {selectedProjects && selectedProjects.length > 0 ? (
            <>
              <p className="text-sm text-[var(--muted)] mb-4">
                {selectedProjects.length === 1 
                  ? `Projekt "${selectedProjects[0].name}" wird geöffnet.` 
                  : `${selectedProjects.length} Projekte ausgewählt. Das erste Projekt wird geöffnet.`
                }
              </p>
              
              {/* Project List */}
              <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
                {selectedProjects.map(project => (
                  <div 
                    key={project.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[var(--card)]"
                  >
                    <div className="w-12 h-8 rounded bg-gradient-to-br from-[var(--accent-pro)] to-[var(--accent-primary)] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[var(--text)] truncate">{project.name}</div>
                      <div className="text-xs text-[var(--muted)]">{project.size} • {project.duration}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 h-10 rounded-lg bg-[var(--card)] text-[var(--text)] hover:bg-[var(--hover)] transition font-medium"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleOpen}
                  className="px-6 h-10 rounded-lg bg-[var(--accent-primary)] text-white hover:opacity-90 transition font-semibold"
                >
                  Bearbeiten
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-[var(--muted)] mb-6">
                Kein Projekt ausgewählt. Bitte wähle ein Projekt aus der Liste.
              </p>
              <button
                onClick={onClose}
                className="w-full h-10 rounded-lg bg-[var(--card)] text-[var(--text)] hover:bg-[var(--hover)] transition font-medium"
              >
                Schließen
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
