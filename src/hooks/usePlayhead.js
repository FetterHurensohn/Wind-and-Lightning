/**
 * usePlayhead Hook
 * 
 * Verwaltet Playhead-Position und Playback-State mit requestAnimationFrame.
 * Bietet Play/Pause/Stop/Seek-Funktionen für Timeline-Wiedergabe.
 * 
 * @param {number} fps - Frames per Second (default: 30)
 * @param {number} maxDuration - Maximale Dauer in Sekunden (optional)
 * @returns {Object} { currentTime, playing, play, pause, stop, seek, setFPS }
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export function usePlayhead(fps = 30, maxDuration = null) {
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentFPS, setCurrentFPS] = useState(fps);
  
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const startCurrentTimeRef = useRef(0);

  useEffect(() => {
    if (!playing) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    startTimeRef.current = performance.now();
    startCurrentTimeRef.current = currentTime;

    function tick(now) {
      const elapsed = (now - startTimeRef.current) / 1000;
      let newTime = startCurrentTimeRef.current + elapsed;
      
      // Stop bei maxDuration
      if (maxDuration && newTime >= maxDuration) {
        newTime = maxDuration;
        setCurrentTime(newTime);
        setPlaying(false);
        return;
      }
      
      setCurrentTime(newTime);
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [playing, maxDuration]);

  const play = useCallback(() => {
    setPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setPlaying(false);
  }, []);

  const stop = useCallback(() => {
    setPlaying(false);
    setCurrentTime(0);
  }, []);

  const seek = useCallback((time) => {
    setCurrentTime(Math.max(0, time));
  }, []);

  const setFPS = useCallback((newFPS) => {
    setCurrentFPS(newFPS);
  }, []);

  const stepForward = useCallback(() => {
    const frameTime = 1 / currentFPS;
    setCurrentTime(prev => {
      const newTime = prev + frameTime;
      return maxDuration ? Math.min(newTime, maxDuration) : newTime;
    });
  }, [currentFPS, maxDuration]);

  const stepBackward = useCallback(() => {
    const frameTime = 1 / currentFPS;
    setCurrentTime(prev => Math.max(0, prev - frameTime));
  }, [currentFPS]);

  return {
    currentTime,
    playing,
    play,
    pause,
    stop,
    seek,
    setFPS,
    stepForward,
    stepBackward,
    fps: currentFPS
  };
}
