/**
 * YellowTooltipCard.jsx - Gelbe Hinweiskarte (PIXELGENAU)
 * 
 * Stil: Gelb, kompakt, kleiner Text (10px)
 */

import React from 'react';

export default function YellowTooltipCard({ onDismiss }) {
  return (
    <div className="mb-3 p-2.5 bg-[var(--accent-yellow)] text-black rounded">
      <p className="text-xs leading-relaxed mb-2" style={{ fontSize: '10px' }}>
        Ebenen können in jedem neuen Projekt standardmäßig angeordnet werden.
      </p>
      <div className="flex justify-end">
        <button
          onClick={onDismiss}
          className="px-2 py-0.5 bg-black/10 hover:bg-black/20 rounded text-xs font-medium transition-all"
          style={{ fontSize: '10px' }}
        >
          Verstanden
        </button>
      </div>
    </div>
  );
}
