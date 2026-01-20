/**
 * ConfirmDeleteModal.jsx - Löschen-Bestätigung Modal
 * 
 * Warnung vor Löschung, Actions: Abbrechen, Löschen
 */

import React from 'react';
import { CloseIcon, TrashIcon } from '../../icons';

export default function ConfirmDeleteModal({ projectCount, onClose, onConfirm }) {
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
            Projekt{projectCount > 1 ? 'e' : ''} löschen
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
          {/* Warning Icon */}
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <TrashIcon className="w-6 h-6 text-red-500" />
          </div>

          <p className="text-center text-[var(--text)] font-medium mb-2">
            Möchtest du {projectCount === 1 ? 'dieses Projekt' : `${projectCount} Projekte`} wirklich löschen?
          </p>
          
          <p className="text-center text-sm text-[var(--muted)] mb-6">
            Diese Aktion kann nicht rückgängig gemacht werden.
          </p>

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
              onClick={onConfirm}
              className="px-6 h-10 rounded-lg bg-red-500 text-white hover:bg-red-600 transition font-semibold"
            >
              Löschen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
