/**
 * Cloud & Collaboration Module
 * Cloud Storage, Sync, Team Features, Versioning
 */

import { v4 as uuidv4 } from 'uuid';

// === CLOUD STORAGE PROVIDERS ===
export const CLOUD_PROVIDERS = [
  { id: 'native', name: 'CapCut Cloud', icon: 'cloud', integrated: true },
  { id: 'dropbox', name: 'Dropbox', icon: 'dropbox', integrated: true },
  { id: 'google-drive', name: 'Google Drive', icon: 'google', integrated: true },
  { id: 'onedrive', name: 'OneDrive', icon: 'microsoft', integrated: true },
  { id: 'icloud', name: 'iCloud', icon: 'apple', integrated: false }
];

// === SYNC STATUS ===
export const SYNC_STATUS = {
  SYNCED: 'synced',
  SYNCING: 'syncing',
  PENDING: 'pending',
  CONFLICT: 'conflict',
  ERROR: 'error',
  OFFLINE: 'offline'
};

// === PERMISSION LEVELS ===
export const PERMISSION_LEVELS = [
  { id: 'owner', name: 'Eigentümer', canEdit: true, canShare: true, canDelete: true, canManageTeam: true },
  { id: 'admin', name: 'Administrator', canEdit: true, canShare: true, canDelete: true, canManageTeam: true },
  { id: 'editor', name: 'Bearbeiter', canEdit: true, canShare: false, canDelete: false, canManageTeam: false },
  { id: 'commenter', name: 'Kommentator', canEdit: false, canShare: false, canDelete: false, canManageTeam: false, canComment: true },
  { id: 'viewer', name: 'Betrachter', canEdit: false, canShare: false, canDelete: false, canManageTeam: false }
];

// === PROJECT VERSION ===
export function createProjectVersion(project, comment = '') {
  return {
    id: uuidv4(),
    projectId: project.id,
    versionNumber: (project.versions?.length || 0) + 1,
    name: `Version ${(project.versions?.length || 0) + 1}`,
    comment,
    snapshot: JSON.stringify(project),
    createdBy: project.currentUser || 'anonymous',
    createdAt: Date.now(),
    size: new Blob([JSON.stringify(project)]).size
  };
}

// === COLLABORATION SESSION ===
export function createCollaborationSession(projectId, userId) {
  return {
    id: uuidv4(),
    projectId,
    userId,
    status: 'active', // 'active', 'idle', 'disconnected'
    cursor: { time: 0, trackId: null },
    selection: [],
    color: generateUserColor(userId),
    joinedAt: Date.now(),
    lastActivity: Date.now()
  };
}

function generateUserColor(seed) {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DFE6E9', '#A29BFE', '#FD79A8',
    '#00B894', '#E17055', '#74B9FF', '#55A3FF'
  ];
  const hash = seed.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
  return colors[Math.abs(hash) % colors.length];
}

// === TEAM ===
export function createTeam(name, ownerId) {
  return {
    id: uuidv4(),
    name,
    ownerId,
    members: [
      { userId: ownerId, role: 'owner', joinedAt: Date.now() }
    ],
    sharedAssets: [],
    sharedProjects: [],
    storage: {
      used: 0,
      limit: 10 * 1024 * 1024 * 1024 // 10GB default
    },
    settings: {
      allowExternalSharing: false,
      requireApproval: true,
      watermarkEnabled: false
    },
    createdAt: Date.now()
  };
}

// === CLOUD SYNC MANAGER ===
export class CloudSyncManager {
  constructor() {
    this.syncQueue = [];
    this.isSyncing = false;
    this.lastSyncTime = null;
    this.listeners = new Set();
    this.conflicts = [];
    this.offlineChanges = [];
  }
  
  async sync(project) {
    if (this.isSyncing) {
      this.syncQueue.push(project);
      return { queued: true };
    }
    
    this.isSyncing = true;
    this.emit('syncStart', project.id);
    
    try {
      // Simulate cloud sync
      await this.delay(1000);
      
      this.lastSyncTime = Date.now();
      this.emit('syncComplete', { projectId: project.id, time: this.lastSyncTime });
      
      return { success: true, syncedAt: this.lastSyncTime };
    } catch (error) {
      this.emit('syncError', { projectId: project.id, error });
      return { success: false, error };
    } finally {
      this.isSyncing = false;
      
      // Process queue
      if (this.syncQueue.length > 0) {
        const next = this.syncQueue.shift();
        this.sync(next);
      }
    }
  }
  
  async resolveConflict(conflictId, resolution) {
    const conflict = this.conflicts.find(c => c.id === conflictId);
    if (!conflict) return { success: false, error: 'Conflict not found' };
    
    switch (resolution) {
      case 'local':
        // Use local version
        break;
      case 'remote':
        // Use remote version
        break;
      case 'merge':
        // Attempt merge
        break;
    }
    
    this.conflicts = this.conflicts.filter(c => c.id !== conflictId);
    return { success: true };
  }
  
  queueOfflineChange(change) {
    this.offlineChanges.push({
      id: uuidv4(),
      ...change,
      timestamp: Date.now()
    });
  }
  
  async syncOfflineChanges() {
    const changes = [...this.offlineChanges];
    this.offlineChanges = [];
    
    for (const change of changes) {
      try {
        await this.applyChange(change);
      } catch (error) {
        // Re-queue failed changes
        this.offlineChanges.push(change);
      }
    }
  }
  
  async applyChange(change) {
    // Apply change to cloud
    await this.delay(100);
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  on(event, callback) {
    this.listeners.add({ event, callback });
  }
  
  off(event, callback) {
    this.listeners.forEach(l => {
      if (l.event === event && l.callback === callback) {
        this.listeners.delete(l);
      }
    });
  }
  
  emit(event, data) {
    this.listeners.forEach(l => {
      if (l.event === event) {
        l.callback(data);
      }
    });
  }
}

// === REAL-TIME COLLABORATION ===
export class CollaborationManager {
  constructor() {
    this.sessions = new Map();
    this.projectLocks = new Map();
    this.listeners = new Set();
  }
  
  joinProject(projectId, userId, userName) {
    const session = createCollaborationSession(projectId, userId);
    session.userName = userName;
    
    if (!this.sessions.has(projectId)) {
      this.sessions.set(projectId, new Map());
    }
    
    this.sessions.get(projectId).set(userId, session);
    this.emit('userJoined', { projectId, session });
    
    return session;
  }
  
  leaveProject(projectId, userId) {
    const projectSessions = this.sessions.get(projectId);
    if (projectSessions) {
      const session = projectSessions.get(userId);
      projectSessions.delete(userId);
      this.emit('userLeft', { projectId, userId, session });
      
      // Release any locks held by this user
      this.releaseAllLocks(projectId, userId);
    }
  }
  
  getActiveUsers(projectId) {
    const projectSessions = this.sessions.get(projectId);
    if (!projectSessions) return [];
    return Array.from(projectSessions.values());
  }
  
  updateCursor(projectId, userId, cursor) {
    const projectSessions = this.sessions.get(projectId);
    if (projectSessions) {
      const session = projectSessions.get(userId);
      if (session) {
        session.cursor = cursor;
        session.lastActivity = Date.now();
        this.emit('cursorUpdate', { projectId, userId, cursor });
      }
    }
  }
  
  updateSelection(projectId, userId, selection) {
    const projectSessions = this.sessions.get(projectId);
    if (projectSessions) {
      const session = projectSessions.get(userId);
      if (session) {
        session.selection = selection;
        session.lastActivity = Date.now();
        this.emit('selectionUpdate', { projectId, userId, selection });
      }
    }
  }
  
  // Locking mechanism for clips
  lockClip(projectId, clipId, userId) {
    const key = `${projectId}:${clipId}`;
    const existing = this.projectLocks.get(key);
    
    if (existing && existing.userId !== userId) {
      return { success: false, lockedBy: existing.userId };
    }
    
    this.projectLocks.set(key, {
      clipId,
      userId,
      lockedAt: Date.now()
    });
    
    this.emit('clipLocked', { projectId, clipId, userId });
    return { success: true };
  }
  
  unlockClip(projectId, clipId, userId) {
    const key = `${projectId}:${clipId}`;
    const existing = this.projectLocks.get(key);
    
    if (!existing || existing.userId !== userId) {
      return { success: false };
    }
    
    this.projectLocks.delete(key);
    this.emit('clipUnlocked', { projectId, clipId, userId });
    return { success: true };
  }
  
  releaseAllLocks(projectId, userId) {
    this.projectLocks.forEach((lock, key) => {
      if (key.startsWith(projectId) && lock.userId === userId) {
        this.projectLocks.delete(key);
      }
    });
  }
  
  getClipLock(projectId, clipId) {
    return this.projectLocks.get(`${projectId}:${clipId}`);
  }
  
  broadcastChange(projectId, change) {
    this.emit('projectChange', { projectId, change });
  }
  
  on(event, callback) {
    this.listeners.add({ event, callback });
  }
  
  emit(event, data) {
    this.listeners.forEach(l => {
      if (l.event === event) {
        l.callback(data);
      }
    });
  }
}

// === SHARE LINK ===
export function createShareLink(projectId, options = {}) {
  return {
    id: uuidv4(),
    projectId,
    token: generateShareToken(),
    permission: options.permission || 'viewer',
    expiresAt: options.expiresAt || null,
    password: options.password || null,
    maxViews: options.maxViews || null,
    views: 0,
    allowDownload: options.allowDownload || false,
    allowComment: options.allowComment || false,
    createdAt: Date.now()
  };
}

function generateShareToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// === COMMENT ===
export function createComment(projectId, userId, content, options = {}) {
  return {
    id: uuidv4(),
    projectId,
    userId,
    content,
    timestamp: options.timestamp || null, // Time in project timeline
    clipId: options.clipId || null,
    replyTo: options.replyTo || null,
    resolved: false,
    reactions: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

// Singletons
export const cloudSyncManager = new CloudSyncManager();
export const collaborationManager = new CollaborationManager();

export default {
  CLOUD_PROVIDERS,
  SYNC_STATUS,
  PERMISSION_LEVELS,
  createProjectVersion,
  createCollaborationSession,
  createTeam,
  createShareLink,
  createComment,
  CloudSyncManager,
  CollaborationManager,
  cloudSyncManager,
  collaborationManager
};
