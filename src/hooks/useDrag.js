/**
 * useDrag Hook
 * 
 * Generic Hook für Mouse-Drag-Operationen.
 * Unterstützt Mouse- und Touch-Events.
 * 
 * @param {Function} onDragStart - Callback beim Start (event, startPos)
 * @param {Function} onDragMove - Callback während Drag (event, delta, startPos, currentPos)
 * @param {Function} onDragEnd - Callback beim Ende (event, delta)
 * @returns {Object} { isDragging, startPos, delta, handlers }
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export function useDrag({
  onDragStart = null,
  onDragMove = null,
  onDragEnd = null,
  preventDefault = true
} = {}) {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [delta, setDelta] = useState({ x: 0, y: 0 });
  
  const dragDataRef = useRef(null);

  const getEventPosition = (event) => {
    if (event.type.startsWith('touch')) {
      const touch = event.touches[0] || event.changedTouches[0];
      return { x: touch.clientX, y: touch.clientY };
    }
    return { x: event.clientX, y: event.clientY };
  };

  const handleStart = useCallback((event) => {
    if (preventDefault) {
      event.preventDefault();
    }
    
    const pos = getEventPosition(event);
    setStartPos(pos);
    setCurrentPos(pos);
    setDelta({ x: 0, y: 0 });
    setIsDragging(true);
    
    if (onDragStart) {
      onDragStart(event, pos);
    }
  }, [onDragStart, preventDefault]);

  const handleMove = useCallback((event) => {
    if (!isDragging) return;
    
    if (preventDefault) {
      event.preventDefault();
    }
    
    const pos = getEventPosition(event);
    const newDelta = {
      x: pos.x - startPos.x,
      y: pos.y - startPos.y
    };
    
    setCurrentPos(pos);
    setDelta(newDelta);
    
    if (onDragMove) {
      onDragMove(event, newDelta, startPos, pos);
    }
  }, [isDragging, startPos, onDragMove, preventDefault]);

  const handleEnd = useCallback((event) => {
    if (!isDragging) return;
    
    if (preventDefault) {
      event.preventDefault();
    }
    
    setIsDragging(false);
    
    if (onDragEnd) {
      onDragEnd(event, delta);
    }
  }, [isDragging, delta, onDragEnd, preventDefault]);

  useEffect(() => {
    if (!isDragging) return;

    const moveHandler = (e) => handleMove(e);
    const endHandler = (e) => handleEnd(e);

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', endHandler);
    document.addEventListener('touchmove', moveHandler);
    document.addEventListener('touchend', endHandler);

    return () => {
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', endHandler);
      document.removeEventListener('touchmove', moveHandler);
      document.removeEventListener('touchend', endHandler);
    };
  }, [isDragging, handleMove, handleEnd]);

  const handlers = {
    onMouseDown: handleStart,
    onTouchStart: handleStart
  };

  return {
    isDragging,
    startPos,
    currentPos,
    delta,
    handlers,
    setData: (data) => { dragDataRef.current = data; },
    getData: () => dragDataRef.current
  };
}
