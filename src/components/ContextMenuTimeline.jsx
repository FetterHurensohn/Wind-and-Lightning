/**
 * ContextMenuTimeline.jsx - Context Menu für Timeline/Clips
 * 
 * Right-Click Kontext-Menü mit Clip-Operationen.
 * 
 * Props:
 * @param {number} x - X-Position
 * @param {number} y - Y-Position
 * @param {string} clipId - Ausgewählter Clip
 * @param {Function} onClose - Schließen Callback
 * @param {Function} onSplit - Split Callback
 * @param {Function} onCut - Cut Callback
 * @param {Function} onCopy - Copy Callback
 * @param {Function} onPaste - Paste Callback
 * @param {Function} onDelete - Delete Callback
 * @param {Function} onDetachAudio - Detach Audio Callback
 * @param {Function} onProperties - Properties Callback
 * @param {boolean} hasClipboard - Ist Clipboard voll
 * @param {boolean} canDetachAudio - Kann Audio trennen (nur Video-Clips)
 */

import React, { useEffect, useRef } from 'react';

export default function ContextMenuTimeline({
  x,
  y,
  clipId,
  onClose,
  onSplit,
  onCut,
  onCopy,
  onPaste,
  onDelete,
  onDetachAudio,
  onProperties,
  hasClipboard = false,
  canDetachAudio = false
}) {
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const menuItems = [
    { 
      label: 'An Playhead teilen', 
      action: onSplit, 
      shortcut: 'Strg+K',
      enabled: !!clipId
    },
    { divider: true },
    { 
      label: 'Ausschneiden', 
      action: onCut, 
      shortcut: 'Strg+X',
      enabled: !!clipId
    },
    { 
      label: 'Kopieren', 
      action: onCopy, 
      shortcut: 'Strg+C',
      enabled: !!clipId
    },
    { 
      label: 'Einfügen', 
      action: onPaste, 
      shortcut: 'Strg+V',
      enabled: hasClipboard
    },
    { divider: true },
    { 
      label: 'Löschen', 
      action: onDelete, 
      shortcut: 'Entf',
      enabled: !!clipId
    },
    { 
      label: 'Audio trennen', 
      action: onDetachAudio,
      enabled: canDetachAudio
    },
    { divider: true },
    { 
      label: 'Geschwindigkeit/Dauer...', 
      action: () => {},
      enabled: !!clipId
    },
    { 
      label: 'Eigenschaften', 
      action: onProperties,
      enabled: !!clipId
    }
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-panel border border-muted/20 rounded shadow-lg min-w-[220px] py-1"
      style={{ left: `${x}px`, top: `${y}px` }}
      role="menu"
    >
      {menuItems.map((item, i) => 
        item.divider ? (
          <div key={i} className="h-px bg-muted/20 my-1" />
        ) : (
          <button
            key={i}
            onClick={() => {
              if (item.enabled && item.action) {
                item.action();
                onClose();
              }
            }}
            disabled={!item.enabled}
            className={`
              w-full px-4 py-2 text-left text-sm flex justify-between items-center
              ${item.enabled 
                ? 'text-white hover:bg-surface' 
                : 'text-muted/30 cursor-not-allowed'
              }
            `}
            role="menuitem"
          >
            <span>{item.label}</span>
            {item.shortcut && (
              <span className="text-xs text-muted ml-4">{item.shortcut}</span>
            )}
          </button>
        )
      )}
    </div>
  );
}
