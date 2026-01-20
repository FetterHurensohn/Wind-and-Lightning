// Keyboard shortcut manager

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: string;
  description: string;
}

export const defaultShortcuts: KeyboardShortcut[] = [
  // Playback
  { key: ' ', action: 'playPause', description: 'Play/Pause' },
  { key: 'j', action: 'playBackward', description: 'Play Backward' },
  { key: 'k', action: 'stop', description: 'Stop' },
  { key: 'l', action: 'playForward', description: 'Play Forward' },
  { key: 'ArrowLeft', action: 'previousFrame', description: 'Previous Frame' },
  { key: 'ArrowRight', action: 'nextFrame', description: 'Next Frame' },
  { key: 'Home', action: 'goToStart', description: 'Go to Start' },
  { key: 'End', action: 'goToEnd', description: 'Go to End' },

  // File
  { key: 'n', ctrl: true, action: 'newProject', description: 'New Project' },
  { key: 'o', ctrl: true, action: 'openProject', description: 'Open Project' },
  { key: 's', ctrl: true, action: 'saveProject', description: 'Save Project' },
  { key: 's', ctrl: true, shift: true, action: 'saveProjectAs', description: 'Save Project As' },
  { key: 'i', ctrl: true, action: 'import', description: 'Import Media' },
  { key: 'm', ctrl: true, action: 'export', description: 'Export' },

  // Edit
  { key: 'z', ctrl: true, action: 'undo', description: 'Undo' },
  { key: 'y', ctrl: true, action: 'redo', description: 'Redo' },
  { key: 'z', ctrl: true, shift: true, action: 'redo', description: 'Redo (Alt)' },
  { key: 'x', ctrl: true, action: 'cut', description: 'Cut' },
  { key: 'c', ctrl: true, action: 'copy', description: 'Copy' },
  { key: 'v', ctrl: true, action: 'paste', description: 'Paste' },
  { key: 'Delete', action: 'delete', description: 'Delete' },
  { key: 'Backspace', action: 'delete', description: 'Delete (Alt)' },
  { key: 'a', ctrl: true, action: 'selectAll', description: 'Select All' },
  { key: 'd', ctrl: true, action: 'deselectAll', description: 'Deselect All' },

  // Timeline
  { key: 'c', action: 'cutTool', description: 'Cut Tool (Razor)' },
  { key: 'v', action: 'selectTool', description: 'Selection Tool' },
  { key: '+', action: 'zoomIn', description: 'Zoom In Timeline' },
  { key: '-', action: 'zoomOut', description: 'Zoom Out Timeline' },
  { key: 'i', action: 'markIn', description: 'Mark In Point' },
  { key: 'o', action: 'markOut', description: 'Mark Out Point' },
  { key: 'x', action: 'clearInOut', description: 'Clear In/Out' },

  // View
  { key: 'F11', action: 'toggleFullscreen', description: 'Toggle Fullscreen' },
  { key: '`', action: 'toggleMaximize', description: 'Maximize Panel' },
];

export class KeyboardShortcutManager {
  private shortcuts: Map<string, KeyboardShortcut>;
  private handlers: Map<string, () => void>;

  constructor() {
    this.shortcuts = new Map();
    this.handlers = new Map();
    
    defaultShortcuts.forEach((shortcut) => {
      const key = this.getShortcutKey(shortcut);
      this.shortcuts.set(key, shortcut);
    });
  }

  private getShortcutKey(shortcut: KeyboardShortcut): string {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('ctrl');
    if (shortcut.shift) parts.push('shift');
    if (shortcut.alt) parts.push('alt');
    parts.push(shortcut.key.toLowerCase());
    return parts.join('+');
  }

  private getKeyFromEvent(event: KeyboardEvent): string {
    const parts: string[] = [];
    if (event.ctrlKey || event.metaKey) parts.push('ctrl');
    if (event.shiftKey) parts.push('shift');
    if (event.altKey) parts.push('alt');
    parts.push(event.key.toLowerCase());
    return parts.join('+');
  }

  registerHandler(action: string, handler: () => void) {
    this.handlers.set(action, handler);
  }

  handleKeyDown(event: KeyboardEvent): boolean {
    const key = this.getKeyFromEvent(event);
    const shortcut = this.shortcuts.get(key);

    if (shortcut) {
      const handler = this.handlers.get(shortcut.action);
      if (handler) {
        event.preventDefault();
        handler();
        return true;
      }
    }

    return false;
  }

  getShortcutForAction(action: string): KeyboardShortcut | undefined {
    return Array.from(this.shortcuts.values()).find((s) => s.action === action);
  }

  getAllShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  updateShortcut(action: string, newShortcut: Partial<KeyboardShortcut>) {
    const existing = this.getShortcutForAction(action);
    if (existing) {
      const oldKey = this.getShortcutKey(existing);
      this.shortcuts.delete(oldKey);
      
      const updated = { ...existing, ...newShortcut };
      const newKey = this.getShortcutKey(updated);
      this.shortcuts.set(newKey, updated);
    }
  }
}

export const keyboardManager = new KeyboardShortcutManager();
