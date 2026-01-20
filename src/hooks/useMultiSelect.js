/**
 * useMultiSelect.js - Multi-Selection Logic
 * 
 * Hook für Multi-Selection von Clips (Ctrl+Click, Shift+Click, Rect-Select).
 */

import { useState, useCallback } from 'react';

/**
 * Multi-Select Hook
 * @returns {Object} { selectedIds, selectClip, deselectAll, toggleClip, selectMultiple, isSelected }
 */
export function useMultiSelect(initialSelected = []) {
  const [selectedIds, setSelectedIds] = useState(initialSelected);

  const selectClip = useCallback((clipId, additive = false) => {
    if (additive) {
      setSelectedIds(prev => {
        if (prev.includes(clipId)) {
          // Toggle: wenn bereits selected, deselect
          return prev.filter(id => id !== clipId);
        } else {
          // Add to selection
          return [...prev, clipId];
        }
      });
    } else {
      // Single select (replace)
      setSelectedIds([clipId]);
    }
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const toggleClip = useCallback((clipId) => {
    setSelectedIds(prev => {
      if (prev.includes(clipId)) {
        return prev.filter(id => id !== clipId);
      } else {
        return [...prev, clipId];
      }
    });
  }, []);

  const selectMultiple = useCallback((clipIds) => {
    setSelectedIds(clipIds);
  }, []);

  const isSelected = useCallback((clipId) => {
    return selectedIds.includes(clipId);
  }, [selectedIds]);

  const selectAll = useCallback((clipIds) => {
    setSelectedIds(clipIds);
  }, []);

  return {
    selectedIds,
    selectClip,
    deselectAll,
    toggleClip,
    selectMultiple,
    selectAll,
    isSelected
  };
}
