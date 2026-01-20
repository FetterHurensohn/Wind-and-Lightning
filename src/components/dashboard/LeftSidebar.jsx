/**
 * LeftSidebar.jsx - Dashboard Left Sidebar
 * 
 * Navigation: Startseite, Vorlagen, Speicher, KI-Design, etc.
 * User Widget + Pro Button
 */

import React, { useState } from 'react';
import { UserIcon, StarIcon, FolderIcon, TemplateIcon, CloudIcon, SparklesIcon, WandIcon, MegaphoneIcon } from '../../icons';

export default function DashboardLeftSidebar() {
  const [activeItem, setActiveItem] = useState('startseite');

  const navItems = [
    { id: 'startseite', label: 'Startseite', icon: FolderIcon },
    { id: 'vorlagen', label: 'Vorlagen', icon: TemplateIcon },
    { id: 'speicher', label: 'Speicher', icon: CloudIcon, hasDropdown: true },
    { id: 'ki-design', label: 'KI-Design', icon: SparklesIcon },
    { id: 'ki-erstellen', label: 'Mit KI erstellen', icon: WandIcon },
    { id: 'marketing', label: 'Marketing-Tools', icon: MegaphoneIcon }
  ];

  return (
    <aside className="w-[220px] bg-[var(--panel)] border-r border-[var(--border)] flex flex-col">
      {/* User Widget */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white font-semibold">
            <UserIcon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-[var(--text)]">editor_665090</div>
            <div className="text-xs text-[var(--muted)]">5682452286</div>
          </div>
          <button className="text-[var(--muted)] hover:text-[var(--text)]" aria-label="Einstellungen">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Pro Button */}
      <div className="p-4">
        <button 
          className="w-full h-10 rounded-lg bg-gradient-to-r from-[var(--accent-pro)] to-[var(--accent-primary)] text-white font-semibold text-sm hover:opacity-90 transition flex items-center justify-center gap-2"
          aria-label="Pro beitreten"
        >
          <StarIcon className="w-4 h-4" />
          Pro beitreten
        </button>
      </div>

      {/* Videobearbeitung Section */}
      <div className="px-4 py-2">
        <div className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
          Videobearbeitung
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-2 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition
                ${isActive 
                  ? 'bg-[var(--hover)] text-[var(--text)] border-l-2 border-[var(--accent-primary)]' 
                  : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)]'
                }
              `}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.hasDropdown && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
