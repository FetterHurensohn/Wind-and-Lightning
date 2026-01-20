/**
 * IconButton-Komponente
 * 
 * Wiederverwendbarer Icon-Button für die VideoBar mit Tooltip-Support.
 * 
 * Props:
 * @param {ReactNode} icon - SVG Icon-Komponente
 * @param {string} label - Button-Label (für Accessibility)
 * @param {string} tooltip - Tooltip-Text
 * @param {Function} onClick - Click-Handler
 * @param {boolean} active - Active-State (z.B. für ausgewählte Kategorie)
 * @param {string} ariaLabel - ARIA-Label (falls abweichend von label)
 * @param {string} size - Größe: 'sm' | 'md' | 'lg'
 * @param {string} variant - Variante: 'ghost' | 'solid'
 * @param {string} shortcut - Keyboard-Shortcut für Tooltip
 * @param {string} className - Zusätzliche CSS-Klassen
 */

import React, { useState, useRef } from 'react';
import Tooltip from './Tooltip';

export default function IconButton({
  icon,
  label,
  tooltip,
  onClick,
  active = false,
  ariaLabel,
  size = 'md',
  variant = 'ghost',
  shortcut,
  className = '',
  disabled = false
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const buttonRef = useRef(null);
  const timeoutRef = useRef(null);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-10 h-10'
  };

  const variantClasses = {
    ghost: active 
      ? 'bg-[rgba(124,58,237,0.14)] text-[var(--accent-2)]'
      : 'hover:bg-[var(--hover)] text-muted hover:text-white',
    solid: 'bg-surface hover:bg-surface/80 text-white'
  };

  const handleMouseEnter = () => {
    if (tooltip) {
      timeoutRef.current = setTimeout(() => {
        setShowTooltip(true);
      }, 300);
    }
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowTooltip(false);
  };

  const handleFocus = () => {
    if (tooltip) {
      setShowTooltip(true);
    }
  };

  const handleBlur = () => {
    setShowTooltip(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label={ariaLabel || label}
        aria-pressed={active}
        className={`
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          flex items-center justify-center rounded-md
          transition-colors duration-150
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--panel)]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        {icon}
      </button>
      
      {showTooltip && tooltip && (
        <Tooltip
          text={tooltip}
          shortcut={shortcut}
          anchorRef={buttonRef}
        />
      )}
    </div>
  );
}
