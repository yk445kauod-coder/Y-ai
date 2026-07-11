/**
 * AILA - AI Life Assistant
 * Advanced Memory System using IndexedDB
 */

import { openDB, type IDBPDatabase } from 'idb';

export interface MemoryEntry {
  id: string;
  type: 'conversation' | 'fact' | 'preference' | 'knowledge' | 'skill' | 'context';
  content: string;
  metadata: Record<string, unknown>;
  importance: number; // 0-100
  tags: string[];
  createdAt: number;
  updatedAt: number;
  accessedAt: number;
  accessCount: number;
  expiresAt?: number;
}

export interface MemorySearchOptions {
  query?: string;
  type?: MemoryEntry['type'];
  tags?: string[];
  minImportance?: number;
  limit?: number;
  offset?: number;
  since?: number;
  until?: number;
}

export interface MemoryStats {
  totalEntries: number;
  byType: Record<string, number>;
  totalSize: number;
  lastActivity: number;
}

const DB_NAME = 'aila-memory';
const DB_VERSION = 1;

export class MemorySystem {
  private db: IDBPDatabase | null = null;
  private static instance: MemorySystem | null = null;

  private constructor() {}

  static getInstance(): MemorySystem {
    if (!MemorySystem.instance) {
      MemorySystem.instance = new MemorySystem();
    }
    return MemorySystem.instance;
  }

  async initialize(): Promise<void> {
    if (this.db) return;

    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Main memories store
        if (!db.objectStoreNames.contains('memories')) {
          const memoriesStore = db.createObjectStore('memories', { keyPath: 'id' });
          memoriesStore.createIndex('type', 'type');
          memoriesStore.createIndex('createdAt', 'createdAt');
          memoriesStore.createIndex('importance', 'importance');
          memoriesStore.createIndex('tags', 'tags', { multiEntry: true });
          memoriesStore.createIndex('accessedAt', 'accessedAt');
        }

        // Sessions store
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionsStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionsStore.createIndex('createdAt', 'createdAt');
          sessionsStore.createIndex('workspaceId', 'workspaceId');
          sessionsStore.createIndex('updatedAt', 'updatedAt');
        }

        // Workspaces store
        if (!db.objectStoreNames.contains('workspaces')) {
          const workspacesStore = db.createObjectStore('workspaces', { keyPath: 'id' });
          workspacesStore.createIndex('createdAt', 'createdAt');
          workspacesStore.createIndex('name', 'name');
        }

        // Files store
        if (!db.objectStoreNames.contains('files')) {
          const filesStore = db.createObjectStore('files', { keyPath: 'id' });
          filesStore.createIndex('type', 'type');
          filesStore.createIndex('workspaceId', 'workspaceId');
          filesStore.createIndex('createdAt', 'createdAt');
        }

        // Activity log store
        if (!db.objectStoreNames.contains('activities')) {
          const activitiesStore = db.createObjectStore('activities', { keyPath: 'id' });
          activitiesStore.createIndex('timestamp', 'timestamp');
          activitiesStore.createIndex('type', 'type');
          activitiesStore.createIndex('sessionId', 'sessionId');
        }

        // Config store
        if (!db.objectStoreNames.contains('config')) {
          db.createObjectStore('config', { keyPath: 'key' });
        }
      },
    });

    // Clean expired entries
    await this.cleanExpiredEntries();
  }

  private async cleanExpiredEntries(): Promise<void> {
    if (!this.db) return;
    
    const now = Date.now();
    const tx = this.db.transaction('memories', 'readwrite');
    const store = tx.objectStore('memories');
    const index = store.index('accessedAt');
    
    let cursor = await index.openCursor();
    while (cursor) {
      if (cursor.value.expiresAt && cursor.value.expiresAt < now) {
        await cursor.delete();
      }
      cursor = await cursor.continue();
    }
  }

  // Memory operations
  async store(entry: Omit<MemoryEntry, 'id' | 'createdAt' | 'updatedAt' | 'accessedAt' | 'accessCount'>): Promise<MemoryEntry> {
    if (!this.db) await this.initialize();
    
    const now = Date.now();
    const fullEntry: MemoryEntry = {
      ...entry,
      id: `mem-${crypto.randomUUID()}`,
      createdAt: now,
      updatedAt: now,
      accessedAt: now,
      accessCount: 0,
    };

    await this.db!.add('memories', fullEntry);
    return fullEntry;
  }

  async retrieve(id: string): Promise<MemoryEntry | undefined> {
    if (!this.db) await this.initialize();
    
    const entry = await this.db!.get('memories', id);
    if (entry) {
      // Update access stats
      entry.accessedAt = Date.now();
      entry.accessCount++;
      await this.db!.put('memories', entry);
    }
    return entry;
  }

  async update(id: string, updates: Partial<MemoryEntry>): Promise<MemoryEntry | undefined> {
    if (!this.db) await this.initialize();
    
    const entry = await this.db!.get('memories', id);
    if (!entry) return undefined;

    const updated = {
      ...entry,
      ...updates,
      id: entry.id, // Prevent id change
      createdAt: entry.createdAt, // Prevent createdAt change
      updatedAt: Date.now(),
    };

    await this.db!.put('memories', updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    if (!this.db) await this.initialize();
    
    try {
      await this.db!.delete('memories', id);
      return true;
    } catch {
      return false;
    }
  }

  async search(options: MemorySearchOptions): Promise<MemoryEntry[]> {
    if (!this.db) await this.initialize();
    
    const results: MemoryEntry[] = [];
    const tx = this.db!.transaction('memories', 'readonly');
    const store = tx.objectStore('memories');
    
    let cursor = await store.openCursor();
    
    while (cursor) {
      const entry = cursor.value;
      
      // Apply filters
      if (options.type && entry.type !== options.type) {
        cursor = await cursor.continue();
        continue;
      }
      
      if (options.query) {
        const query = options.query.toLowerCase();
        const matches = entry.content.toLowerCase().includes(query) ||
                       entry.tags.some(tag => tag.toLowerCase().includes(query));
        if (!matches) {
          cursor = await cursor.continue();
          continue;
        }
      }
      
      if (options.tags && options.tags.length > 0) {
        const hasTags = options.tags.some(tag => entry.tags.includes(tag));
        if (!hasTags) {
          cursor = await cursor.continue();
          continue;
        }
      }
      
      if (options.minImportance !== undefined && entry.importance < options.minImportance) {
        cursor = await cursor.continue();
        continue;
      }
      
      if (options.since && entry.createdAt < options.since) {
        cursor = await cursor.continue();
        continue;
      }
      
      if (options.until && entry.createdAt > options.until) {
        cursor = await cursor.continue();
        continue;
      }

      results.push(entry);
      cursor = await cursor.continue();
    }

    // Sort by importance and recency
    results.sort((a, b) => {
      const scoreA = a.importance * 0.6 + (a.accessCount * 10) * 0.4;
      const scoreB = b.importance * 0.6 + (b.accessCount * 10) * 0.4;
      return scoreB - scoreA;
    });

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || 50;
    return results.slice(offset, offset + limit);
  }

  async getStats(): Promise<MemoryStats> {
    if (!this.db) await this.initialize();
    
    const tx = this.db!.transaction('memories', 'readonly');
    const store = tx.objectStore('memories');
    
    const stats: MemoryStats = {
      totalEntries: 0,
      byType: {},
      totalSize: 0,
      lastActivity: 0,
    };

    let cursor = await store.openCursor();
    while (cursor) {
      const entry = cursor.value;
      stats.totalEntries++;
      stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;
      stats.totalSize += new Blob([JSON.stringify(entry)]).size;
      if (entry.accessedAt > stats.lastActivity) {
        stats.lastActivity = entry.accessedAt;
      }
      cursor = await cursor.continue();
    }

    return stats;
  }

  async clear(type?: MemoryEntry['type']): Promise<void> {
    if (!this.db) await this.initialize();
    
    const tx = this.db!.transaction('memories', 'readwrite');
    const store = tx.objectStore('memories');
    
    if (type) {
      const index = store.index('type');
      let cursor = await index.openCursor(type);
      while (cursor) {
        await cursor.delete();
        cursor = await cursor.continue();
      }
    } else {
      await store.clear();
    }
  }

  // Conversation memory helpers
  async storeConversation(messages: Array<{ role: string; content: string }>, metadata: Record<string, unknown> = {}): Promise<MemoryEntry> {
    return this.store({
      type: 'conversation',
      content: JSON.stringify(messages),
      metadata,
      importance: metadata.importance as number || 50,
      tags: metadata.tags as string[] || [],
    });
  }

  async getRecentConversations(limit = 10): Promise<MemoryEntry[]> {
    return this.search({ type: 'conversation', limit, until: Date.now() });
  }

  // Knowledge memory helpers
  async storeKnowledge(fact: string, importance = 70, tags: string[] = []): Promise<MemoryEntry> {
    return this.store({
      type: 'knowledge',
      content: fact,
      metadata: {},
      importance,
      tags: ['fact', ...tags],
    });
  }

  async storePreference(key: string, value: unknown): Promise<MemoryEntry> {
    return this.store({
      type: 'preference',
      content: JSON.stringify({ key, value }),
      metadata: { key },
      importance: 80,
      tags: ['preference', key],
    });
  }

  async getPreference<T = unknown>(key: string): Promise<T | undefined> {
    const results = await this.search({ type: 'preference', tags: ['preference', key], limit: 1 });
    if (results.length > 0) {
      try {
        const data = JSON.parse(results[0].content);
        return data.value as T;
      } catch {
        return undefined;
      }
    }
    return undefined;
  }
}

// Export singleton instance
export const memorySystem = MemorySystem.getInstance();
