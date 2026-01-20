/**
 * SmallButton.jsx - Kompakter Button (PIXELGENAU)
 * 
 * Zweck: Wiederverwendbarer Button mit Varianten
 * Größen: sm (h-7, text-sm = 11px), md (h-8, text-base = 12px)
 * Varianten: default (dunkel), primary (violett), turquoise (türkis)
 */

import React from 'react';

export default function SmallButton({ 
  icon, 
  label, 
  onClick, 
  variant = 'default', 
  size = 'sm',
  className = '',
  disabled = false,
  ...props 
}) {
  // Varianten-Styles (dunklere Farben, kompakter)
  const variantStyles = {
    default: 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-normal)]',
    primary: 'bg-[var(--accent-purple)] text-white hover:opacity-90',
    turquoise: 'bg-[var(--accent-turquoise)] text-white hover:opacity-90'
  };

  // Größen-Styles (kompakter)
  const sizeStyles = {
    sm: 'h-7 px-3 text-sm',  // 11px
    md: 'h-8 px-4 text-base'  // 12px
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
        flex items-center gap-1.5 rounded font-medium
        transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none
      `}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {label && <span>{label}</span>}
    </button>
  );
}
