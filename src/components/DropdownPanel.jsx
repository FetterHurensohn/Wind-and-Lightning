/**
 * DropdownPanel-Komponente
 * 
 * Generisches Dropdown-Panel mit Keyboard-Navigation und Focus-Management.
 * 
 * Props:
 * @param {RefObject} anchorRef - Referenz zum Anchor-Element
 * @param {boolean} open - Sichtbarkeits-State
 * @param {Array} items - Menu-Items: [{ label, onClick, shortcut?, divider?, disabled? }]
 * @param {Function} onClose - Callback beim Schließen
 * @param {Function} onSelect - Callback bei Item-Selection
 * @param {string} position - Position: 'below' | 'above'
 * @param {ReactNode} children - Optional: Custom Content statt items
 */

import React, { useEffect, useRef, useState } from 'react';

export default function DropdownPanel({
  anchorRef,
  open,
  items = [],
  onClose,
  onSelect,
  position = 'below',
  children,
  className = ''
}) {
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [focusedIndex, setFocusedIndex] = useState(0);
  const panelRef = useRef(null);
  const itemRefs = useRef([]);

  // Position berechnen
  useEffect(() => {
    if (!open || !anchorRef.current || !panelRef.current) return;

    const anchorRect = anchorRef.current.getBoundingClientRect();
    const panelRect = panelRef.current.getBoundingClientRect();
    const spacing = 4;

    let top = position === 'below' 
      ? anchorRect.bottom + spacing
      : anchorRect.top - panelRect.height - spacing;
    
    let left = anchorRect.left;

    // Viewport-Constraints
    const maxLeft = window.innerWidth - panelRect.width - 8;
    const maxTop = window.innerHeight - panelRect.height - 8;
    
    left = Math.max(8, Math.min(left, maxLeft));
    top = Math.max(8, Math.min(top, maxTop));

    setCoords({ top, left });
  }, [open, anchorRef, position]);

  // Focus Management
  useEffect(() => {
    if (open && items.length > 0) {
      setFocusedIndex(0);
      // Focus ersten nicht-disabled Item
      const firstEnabledIndex = items.findIndex(item => !item.disabled && !item.divider);
      if (firstEnabledIndex !== -1 && itemRefs.current[firstEnabledIndex]) {
        itemRefs.current[firstEnabledIndex].focus();
      }
    }
  }, [open, items]);

  // Keyboard Navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      const enabledItems = items.map((item, i) => ({ ...item, index: i }))
        .filter(item => !item.disabled && !item.divider);

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const currentEnabledIndex = enabledItems.findIndex(item => item.index === focusedIndex);
        const nextIndex = (currentEnabledIndex + 1) % enabledItems.length;
        const nextItemIndex = enabledItems[nextIndex].index;
        setFocusedIndex(nextItemIndex);
        itemRefs.current[nextItemIndex]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const currentEnabledIndex = enabledItems.findIndex(item => item.index === focusedIndex);
        const prevIndex = (currentEnabledIndex - 1 + enabledItems.length) % enabledItems.length;
        const prevItemIndex = enabledItems[prevIndex].index;
        setFocusedIndex(prevItemIndex);
        itemRefs.current[prevItemIndex]?.focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const item = items[focusedIndex];
        if (item && !item.disabled && !item.divider) {
          onSelect?.(item);
          item.onClick?.();
          onClose?.();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, focusedIndex, items, onClose, onSelect]);

  // Click outside to close
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) &&
          anchorRef.current && !anchorRef.current.contains(e.target)) {
        onClose?.();
      }
    };

    // Delay to avoid immediate close on anchor click
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, anchorRef, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop (invisible, nur für click detection) */}
      <div 
        className="fixed inset-0 z-[100]"
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`
          fixed z-[101]
          bg-[var(--panel)] border border-white/[0.06]
          rounded-lg shadow-xl
          py-1
          min-w-[180px]
          animate-slideDown
          ${className}
        `}
        style={{
          top: `${coords.top}px`,
          left: `${coords.left}px`
        }}
        role="menu"
        aria-orientation="vertical"
      >
        {children || items.map((item, index) => {
          if (item.divider) {
            return (
              <div 
                key={`divider-${index}`}
                className="h-px bg-white/[0.06] my-1"
                role="separator"
              />
            );
          }

          return (
            <button
              key={item.label || index}
              ref={el => itemRefs.current[index] = el}
              onClick={() => {
                if (!item.disabled) {
                  onSelect?.(item);
                  item.onClick?.();
                  onClose?.();
                }
              }}
              disabled={item.disabled}
              className={`
                w-full px-3 py-2
                flex items-center justify-between gap-4
                text-left text-sm
                transition-colors
                ${item.disabled 
                  ? 'text-muted/50 cursor-not-allowed'
                  : 'text-white hover:bg-white/[0.04]'
                }
                ${focusedIndex === index && !item.disabled
                  ? 'bg-white/[0.06]'
                  : ''
                }
                focus:outline-none focus:bg-white/[0.06]
              `}
              role="menuitem"
              aria-disabled={item.disabled}
            >
              <span>{item.label}</span>
              {item.shortcut && (
                <span className="text-xs text-muted/60 font-mono">
                  {item.shortcut}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
