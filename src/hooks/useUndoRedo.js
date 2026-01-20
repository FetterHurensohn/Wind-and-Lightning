/**
 * useUndoRedo.js - Undo/Redo Stack Management
 * 
 * Hook für Undo/Redo-Funktionalität mit State-Snapshots.
 * Jede Action erstellt automatisch einen Undo-Snapshot.
 */

import { useState, useCallback, useRef } from 'react';

const MAX_HISTORY = 50; // Maximale Anzahl Undo-Steps

/**
 * Undo/Redo Hook
 * @param {Object} initialState - Initial State
 * @param {Function} reducer - Reducer-Funktion
 * @returns {Object} { state, dispatch, undo, redo, canUndo, canRedo }
 */
export function useUndoRedo(initialState, reducer) {
  const [state, setState] = useState(initialState);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const isUndoRedoRef = useRef(false);

  const dispatch = useCallback((action) => {
    // Skip Undo/Redo selbst
    if (action.type === 'UNDO' || action.type === 'REDO') {
      return;
    }
    
    // Skip bestimmte Actions die kein Undo brauchen
    const noUndoActions = ['SELECT_CLIP', 'DESELECT_ALL', 'SET_PLAYHEAD'];
    if (noUndoActions.includes(action.type)) {
      const newState = reducer(state, action);
      setState(newState);
      return;
    }
    
    // Push current state to undo stack (nur wenn nicht Undo/Redo Operation)
    if (!isUndoRedoRef.current) {
      setUndoStack(prev => {
        const newStack = [...prev, state];
        // Limit Stack-Größe
        if (newStack.length > MAX_HISTORY) {
          return newStack.slice(-MAX_HISTORY);
        }
        return newStack;
      });
      setRedoStack([]); // Clear redo on new action
    }
    
    // Apply action
    const newState = reducer(state, action);
    setState(newState);
  }, [state, reducer]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    
    isUndoRedoRef.current = true;
    
    const prevState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [state, ...prev].slice(0, MAX_HISTORY));
    setUndoStack(prev => prev.slice(0, -1));
    setState(prevState);
    
    // Reset flag nach kurzer Verzögerung
    setTimeout(() => {
      isUndoRedoRef.current = false;
    }, 0);
  }, [state, undoStack]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    isUndoRedoRef.current = true;
    
    const nextState = redoStack[0];
    setUndoStack(prev => [...prev, state].slice(-MAX_HISTORY));
    setRedoStack(prev => prev.slice(1));
    setState(nextState);
    
    // Reset flag nach kurzer Verzögerung
    setTimeout(() => {
      isUndoRedoRef.current = false;
    }, 0);
  }, [state, redoStack]);

  const clearHistory = useCallback(() => {
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  return {
    state,
    dispatch,
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    clearHistory
  };
}
