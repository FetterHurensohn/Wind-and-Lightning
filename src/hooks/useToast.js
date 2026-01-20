/**
 * useToast.js - Toast Notifications Hook
 */

import { useState, useCallback } from 'react';
import { generateId } from '../utils/helpers';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  // Show regular toast
  const show = useCallback((message, type = 'info', duration = 5000) => {
    const id = generateId('toast');
    const toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }

    return id;
  }, []);

  // Show undo toast
  const showUndo = useCallback((message, onUndo, duration = 10000) => {
    const id = generateId('toast');
    const toast = { 
      id, 
      message, 
      type: 'undo', 
      duration,
      onUndo
    };
    
    setToasts(prev => [...prev, toast]);

    setTimeout(() => {
      dismiss(id);
    }, duration);

    return id;
  }, []);

  // Dismiss toast
  const dismiss = useCallback((toastId) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  }, []);

  return {
    toasts,
    show,
    showUndo,
    dismiss
  };
}
