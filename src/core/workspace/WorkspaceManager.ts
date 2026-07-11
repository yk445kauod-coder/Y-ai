/**
 * AILA - AI Life Assistant
 * Workspace Management System
 */

import { openDB, type IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from 'uuid';

export interface WorkspaceFile {
  id: string;
  workspaceId: string;
  name: string;
  type: 'folder' | 'image' | 'document' | 'code' | 'data' | 'other';
  mimeType?: string;
  size: number;
  path: string;
  url?: string;
  thumbnail?: string;
  content?: string;
  metadata: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
  accessedAt: number;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isDefault: boolean;
  isActive: boolean;
  settings: WorkspaceSettings;
  stats: WorkspaceStats;
  createdAt: number;
  updatedAt: number;
}

export interface WorkspaceSettings {
  theme?: string;
  language?: string;
  aiProvider?: string;
  autoSave?: boolean;
  notifications?: boolean;
  [key: string]: unknown;
}

export interface WorkspaceStats {
  totalFiles: number;
  totalSize: number;
  sessionCount: number;
  memoryCount: number;
  lastActivity: number;
}

export interface WorkspaceTemplate {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  icon: string;
  color: string;
  settings: WorkspaceSettings;
}

const DB_NAME = 'aila-workspaces';
const DB_VERSION = 1;

export class WorkspaceManager {
  private db: IDBPDatabase | null = null;
  private static instance: WorkspaceManager | null = null;
  private activeWorkspace: Workspace | null = null;
  
  private templates: WorkspaceTemplate[] = [
    {
      id: 'personal',
      name: 'مساحة شخصية',
      nameEn: 'Personal',
      description: 'مساحة العمل الشخصية',
      icon: '🏠',
      color: '#6366f1',
      settings: { autoSave: true, notifications: true },
    },
    {
      id: 'work',
      name: 'العمل',
      nameEn: 'Work',
      description: 'مساحة العمل المهنية',
      icon: '💼',
      color: '#22c55e',
      settings: { autoSave: true, notifications: true },
    },
    {
      id: 'development',
      name: 'التطوير',
      nameEn: 'Development',
      description: 'مساحة لتطوير البرمجيات',
      icon: '💻',
      color: '#f59e0b',
      settings: { autoSave: true, notifications: false },
    },
    {
      id: 'research',
      name: 'البحث',
      nameEn: 'Research',
      description: 'مساحة للبحث والدراسة',
      icon: '🔬',
      color: '#8b5cf6',
      settings: { autoSave: true, notifications: true },
    },
  ];

  private constructor() {}

  static getInstance(): WorkspaceManager {
    if (!WorkspaceManager.instance) {
      WorkspaceManager.instance = new WorkspaceManager();
    }
    return WorkspaceManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.db) return;

    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const workspaceStore = db.createObjectStore('workspaces', { keyPath: 'id' });
        workspaceStore.createIndex('isActive', 'isActive');
        workspaceStore.createIndex('isDefault', 'isDefault');
        workspaceStore.createIndex('createdAt', 'createdAt');
        
        const filesStore = db.createObjectStore('files', { keyPath: 'id' });
        filesStore.createIndex('workspaceId', 'workspaceId');
        filesStore.createIndex('type', 'type');
        filesStore.createIndex('path', 'path');
      },
    });

    // Ensure default workspace exists
    await this.ensureDefaultWorkspace();
  }

  private async ensureDefaultWorkspace(): Promise<void> {
    const workspaces = await this.getAllWorkspaces();
    if (workspaces.length === 0) {
      await this.createWorkspace(this.templates[0]);
    }
    
    const active = workspaces.find(w => w.isActive);
    if (active) {
      this.activeWorkspace = active;
    } else if (workspaces.length > 0) {
      this.activeWorkspace = workspaces[0];
      await this.updateWorkspace(workspaces[0].id, { isActive: true });
    }
  }

  async createWorkspace(template?: WorkspaceTemplate): Promise<Workspace> {
    if (!this.db) await this.initialize();

    const now = Date.now();
    const workspace: Workspace = {
      id: uuidv4(),
      name: template?.name || 'مساحة جديدة',
      description: template?.description || '',
      icon: template?.icon || '📁',
      color: template?.color || '#6366f1',
      isDefault: false,
      isActive: false,
      settings: template?.settings || {},
      stats: {
        totalFiles: 0,
        totalSize: 0,
        sessionCount: 0,
        memoryCount: 0,
        lastActivity: now,
      },
      createdAt: now,
      updatedAt: now,
    };

    await this.db!.add('workspaces', workspace);
    
    if (!this.activeWorkspace) {
      this.activeWorkspace = workspace;
      workspace.isActive = true;
      await this.db!.put('workspaces', workspace);
    }
    
    return workspace;
  }

  async getWorkspace(id: string): Promise<Workspace | undefined> {
    if (!this.db) await this.initialize();
    return this.db!.get('workspaces', id);
  }

  async getActiveWorkspace(): Promise<Workspace | null> {
    if (!this.activeWorkspace) {
      await this.initialize();
    }
    return this.activeWorkspace;
  }

  async setActiveWorkspace(id: string): Promise<Workspace | undefined> {
    if (!this.db) await this.initialize();
    
    // Deactivate all workspaces
    const allWorkspaces = await this.getAllWorkspaces();
    for (const ws of allWorkspaces) {
      if (ws.isActive && ws.id !== id) {
        ws.isActive = false;
        await this.db!.put('workspaces', ws);
      }
    }
    
    // Activate the new workspace
    const workspace = await this.db!.get('workspaces', id);
    if (workspace) {
      workspace.isActive = true;
      await this.db!.put('workspaces', workspace);
      this.activeWorkspace = workspace;
      return workspace;
    }
    
    return undefined;
  }

  async getAllWorkspaces(): Promise<Workspace[]> {
    if (!this.db) await this.initialize();
    
    const workspaces: Workspace[] = [];
    const tx = this.db!.transaction('workspaces', 'readonly');
    const store = tx.objectStore('workspaces');
    
    let cursor = await store.openCursor();
    while (cursor) {
      workspaces.push(cursor.value);
      cursor = await cursor.continue();
    }
    
    return workspaces.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async updateWorkspace(id: string, updates: Partial<Workspace>): Promise<Workspace | undefined> {
    if (!this.db) await this.initialize();
    
    const workspace = await this.db!.get('workspaces', id);
    if (!workspace) return undefined;

    const updated: Workspace = {
      ...workspace,
      ...updates,
      id: workspace.id,
      createdAt: workspace.createdAt,
      updatedAt: Date.now(),
    };

    await this.db!.put('workspaces', updated);
    
    if (this.activeWorkspace?.id === id) {
      this.activeWorkspace = updated;
    }
    
    return updated;
  }

  async deleteWorkspace(id: string): Promise<boolean> {
    if (!this.db) await this.initialize();
    
    const workspace = await this.db!.get('workspaces', id);
    if (!workspace || workspace.isDefault) return false;

    // Delete all files in workspace
    await this.deleteAllWorkspaceFiles(id);

    try {
      await this.db!.delete('workspaces', id);
      
      if (this.activeWorkspace?.id === id) {
        const remaining = await this.getAllWorkspaces();
        if (remaining.length > 0) {
          await this.setActiveWorkspace(remaining[0].id);
        }
      }
      
      return true;
    } catch {
      return false;
    }
  }

  // File management within workspace
  async createFile(workspaceId: string, file: Omit<WorkspaceFile, 'id' | 'createdAt' | 'updatedAt' | 'accessedAt'>): Promise<WorkspaceFile> {
    if (!this.db) await this.initialize();
    
    const now = Date.now();
    const newFile: WorkspaceFile = {
      ...file,
      id: uuidv4(),
      workspaceId,
      createdAt: now,
      updatedAt: now,
      accessedAt: now,
    };

    await this.db!.add('files', newFile);
    await this.updateWorkspaceStats(workspaceId);
    
    return newFile;
  }

  async getFile(id: string): Promise<WorkspaceFile | undefined> {
    if (!this.db) await this.initialize();
    
    const file = await this.db!.get('files', id);
    if (file) {
      file.accessedAt = Date.now();
      await this.db!.put('files', file);
    }
    return file;
  }

  async updateFile(id: string, updates: Partial<WorkspaceFile>): Promise<WorkspaceFile | undefined> {
    if (!this.db) await this.initialize();
    
    const file = await this.db!.get('files', id);
    if (!file) return undefined;

    const updated: WorkspaceFile = {
      ...file,
      ...updates,
      id: file.id,
      workspaceId: file.workspaceId,
      createdAt: file.createdAt,
      updatedAt: Date.now(),
    };

    await this.db!.put('files', updated);
    return updated;
  }

  async deleteFile(id: string): Promise<boolean> {
    if (!this.db) await this.initialize();
    
    const file = await this.db!.get('files', id);
    if (!file) return false;

    try {
      await this.db!.delete('files', id);
      await this.updateWorkspaceStats(file.workspaceId);
      return true;
    } catch {
      return false;
    }
  }

  async getWorkspaceFiles(workspaceId: string, path?: string): Promise<WorkspaceFile[]> {
    if (!this.db) await this.initialize();
    
    const files: WorkspaceFile[] = [];
    const tx = this.db!.transaction('files', 'readonly');
    const store = tx.objectStore('files');
    const index = store.index('workspaceId');
    
    let cursor = await index.openCursor(workspaceId);
    
    while (cursor) {
      const file = cursor.value;
      if (!path || file.path === path) {
        files.push(file);
      }
      cursor = await cursor.continue();
    }
    
    return files.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });
  }

  async searchFiles(workspaceId: string, query: string): Promise<WorkspaceFile[]> {
    if (!this.db) await this.initialize();
    
    const files: WorkspaceFile[] = [];
    const lowerQuery = query.toLowerCase();
    const tx = this.db!.transaction('files', 'readonly');
    const store = tx.objectStore('files');
    const index = store.index('workspaceId');
    
    let cursor = await index.openCursor(workspaceId);
    
    while (cursor) {
      const file = cursor.value;
      if (file.name.toLowerCase().includes(lowerQuery)) {
        files.push(file);
      }
      cursor = await cursor.continue();
    }
    
    return files;
  }

  private async deleteAllWorkspaceFiles(workspaceId: string): Promise<void> {
    if (!this.db) await this.initialize();
    
    const tx = this.db!.transaction('files', 'readwrite');
    const store = tx.objectStore('files');
    const index = store.index('workspaceId');
    
    let cursor = await index.openCursor(workspaceId);
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
  }

  private async updateWorkspaceStats(workspaceId: string): Promise<void> {
    if (!this.db) return;
    
    const workspace = await this.db!.get('workspaces', workspaceId);
    if (!workspace) return;

    const tx = this.db!.transaction('files', 'readonly');
    const store = tx.objectStore('files');
    const index = store.index('workspaceId');
    
    let totalFiles = 0;
    let totalSize = 0;
    
    let cursor = await index.openCursor(workspaceId);
    while (cursor) {
      totalFiles++;
      totalSize += cursor.value.size || 0;
      cursor = await cursor.continue();
    }

    workspace.stats = {
      ...workspace.stats,
      totalFiles,
      totalSize,
      lastActivity: Date.now(),
    };

    await this.db!.put('workspaces', workspace);
  }

  getTemplates(): WorkspaceTemplate[] {
    return this.templates;
  }

  async exportWorkspace(id: string): Promise<string | null> {
    if (!this.db) await this.initialize();
    
    const workspace = await this.getWorkspace(id);
    if (!workspace) return null;
    
    const files = await this.getWorkspaceFiles(id);
    
    return JSON.stringify({ workspace, files }, null, 2);
  }

  async importWorkspace(jsonData: string): Promise<Workspace | null> {
    if (!this.db) await this.initialize();
    
    try {
      const data = JSON.parse(jsonData);
      const importedWorkspace = data.workspace as Workspace;
      const importedFiles = data.files as WorkspaceFile[];
      
      // Create new workspace
      const newWorkspace = await this.createWorkspace();
      await this.updateWorkspace(newWorkspace.id, {
        name: importedWorkspace.name,
        description: importedWorkspace.description,
        icon: importedWorkspace.icon,
        color: importedWorkspace.color,
        settings: importedWorkspace.settings,
      });
      
      // Import files
      for (const file of importedFiles) {
        await this.createFile(newWorkspace.id, {
          ...file,
          id: '', // Will be regenerated
        });
      }
      
      return newWorkspace;
    } catch {
      return null;
    }
  }
}

export const workspaceManager = WorkspaceManager.getInstance();
