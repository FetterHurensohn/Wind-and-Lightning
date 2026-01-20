// Undo/Redo System für Video Editor

export interface UndoableAction {
  type: string;
  do: () => void;
  undo: () => void;
  timestamp: number;
}

class UndoRedoManager {
  private undoStack: UndoableAction[] = [];
  private redoStack: UndoableAction[] = [];
  private maxStackSize: number = 100;

  execute(action: UndoableAction): void {
    action.do();
    this.undoStack.push(action);
    this.redoStack = []; // Clear redo stack on new action
    
    // Limit stack size
    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift();
    }
    
    console.log('✅ Action executed:', action.type);
    console.log('📚 Undo stack size:', this.undoStack.length);
  }

  undo(): boolean {
    if (this.undoStack.length === 0) {
      console.warn('⚠️ Nothing to undo');
      return false;
    }

    const action = this.undoStack.pop()!;
    action.undo();
    this.redoStack.push(action);
    
    console.log('↶ Undone:', action.type);
    console.log('📚 Undo stack size:', this.undoStack.length);
    return true;
  }

  redo(): boolean {
    if (this.redoStack.length === 0) {
      console.warn('⚠️ Nothing to redo');
      return false;
    }

    const action = this.redoStack.pop()!;
    action.do();
    this.undoStack.push(action);
    
    console.log('↷ Redone:', action.type);
    console.log('📚 Redo stack size:', this.redoStack.length);
    return true;
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    console.log('🗑️ Undo/Redo stacks cleared');
  }

  getUndoStackSize(): number {
    return this.undoStack.length;
  }

  getRedoStackSize(): number {
    return this.redoStack.length;
  }
}

// Singleton instance
export const undoRedoManager = new UndoRedoManager();

// Helper function to create undo-able actions
export const createAction = (
  type: string,
  doFn: () => void,
  undoFn: () => void
): UndoableAction => ({
  type,
  do: doFn,
  undo: undoFn,
  timestamp: Date.now(),
});
