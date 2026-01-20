/**
 * RightTooltip.jsx - Gelbe Tooltip-Karte (rechts)
 * 
 * Info-Text + "Verstanden" Button
 * Annahme: Position absolute, kann dismissed werden (localStorage)
 */

import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'capcut_tooltip_dismissed';

export default function RightTooltip({ onDismiss }) {
  const [visible, setVisible] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
    if (onDismiss) onDismiss();
  };

  if (!visible) return null;

  return (
    <div className="absolute right-0 top-0 w-[280px] animate-slideDown">
      <div className="bg-[var(--warning)] rounded-xl p-4 shadow-lg">
        {/* Content */}
        <p className="text-sm text-black mb-3 leading-relaxed">
          Du kannst mehrere Projekte auswählen, um sie effizienter zu verwalten.
        </p>

        {/* Button */}
        <button
          onClick={handleDismiss}
          className="text-sm text-black font-semibold underline hover:no-underline transition"
        >
          Verstanden
        </button>
      </div>
    </div>
  );
}
