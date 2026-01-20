/**
 * Tooltip-Komponente
 * 
 * Zeigt Tooltip mit optionalem Keyboard-Shortcut.
 * 
 * Props:
 * @param {string} text - Tooltip-Text
 * @param {string} shortcut - Optional: Keyboard-Shortcut (z.B. "M", "Ctrl+E")
 * @param {RefObject} anchorRef - Referenz zum Anchor-Element
 * @param {string} position - Position: 'top' | 'bottom' | 'left' | 'right'
 */

import React, { useEffect, useState, useRef } from 'react';

export default function Tooltip({
  text,
  shortcut,
  anchorRef,
  position = 'bottom'
}) {
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!anchorRef.current || !tooltipRef.current) return;

    const anchorRect = anchorRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const spacing = 8; // Abstand zum Anchor

    let top = 0;
    let left = 0;

    switch (position) {
      case 'bottom':
        top = anchorRect.bottom + spacing;
        left = anchorRect.left + (anchorRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'top':
        top = anchorRect.top - tooltipRect.height - spacing;
        left = anchorRect.left + (anchorRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = anchorRect.top + (anchorRect.height / 2) - (tooltipRect.height / 2);
        left = anchorRect.left - tooltipRect.width - spacing;
        break;
      case 'right':
        top = anchorRect.top + (anchorRect.height / 2) - (tooltipRect.height / 2);
        left = anchorRect.right + spacing;
        break;
      default:
        break;
    }

    // Viewport-Constraints
    const maxLeft = window.innerWidth - tooltipRect.width - 8;
    const maxTop = window.innerHeight - tooltipRect.height - 8;
    
    left = Math.max(8, Math.min(left, maxLeft));
    top = Math.max(8, Math.min(top, maxTop));

    setCoords({ top, left });
  }, [anchorRef, position]);

  return (
    <div
      ref={tooltipRef}
      className="fixed z-[9999] px-2 py-1 bg-[#0b1220] text-[var(--muted)] border border-white/[0.03] rounded text-12 whitespace-nowrap pointer-events-none animate-fadeIn"
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`
      }}
      role="tooltip"
    >
      <div className="flex items-center gap-2">
        <span>{text}</span>
        {shortcut && (
          <span className="text-[10px] text-white/40 font-mono">
            {shortcut}
          </span>
        )}
      </div>
      
      {/* Pfeil (optional, für bottom position) */}
      {position === 'bottom' && (
        <div 
          className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0b1220] border-l border-t border-white/[0.03] rotate-45"
        />
      )}
    </div>
  );
}
