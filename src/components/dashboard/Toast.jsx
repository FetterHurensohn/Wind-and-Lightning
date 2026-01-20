/**
 * Toast.jsx - Toast Notifications
 * 
 * Types: success, info, warning, error, undo
 * Auto-dismiss, Undo-Button für Undo-Type
 */

import React from 'react';
import { CheckIcon, CloseIcon } from '../../icons';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckIcon className="w-5 h-5 text-green-400" />;
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'undo':
        return (
          <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getToastBg = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20';
      case 'error':
        return 'bg-red-500/10 border-red-500/20';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'undo':
        return 'bg-[var(--panel)] border-[var(--border)]';
      default:
        return 'bg-[var(--panel)] border-[var(--border)]';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg
            ${getToastBg(toast.type)}
            animate-slideDown pointer-events-auto
          `}
          role="alert"
        >
          {/* Icon */}
          <div className="flex-shrink-0">
            {getToastIcon(toast.type)}
          </div>

          {/* Message */}
          <div className="flex-1 text-sm font-medium text-[var(--text)]">
            {toast.message}
          </div>

          {/* Undo Button (for undo type) */}
          {toast.type === 'undo' && toast.onUndo && (
            <button
              onClick={() => {
                toast.onUndo();
                onDismiss(toast.id);
              }}
              className="px-3 py-1 rounded bg-[var(--accent-primary)] text-white text-sm font-semibold hover:opacity-90 transition"
            >
              Rückgängig
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={() => onDismiss(toast.id)}
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] transition"
            aria-label="Schließen"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
