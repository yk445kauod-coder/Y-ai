/**
 * AILA - AI Life Assistant
 * Advanced Vector Memory System with Semantic Search
 */

import { openDB, type IDBPDatabase } from 'idb';

// Simple vector embedding using TF-IDF approach for browser
function simpleEmbed(text: string): number[] {
  const words = text.toLowerCase().split(/\s+/);
  const wordFreq: Record<string, number> = {};
  
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  
  // Create vector from word frequencies (simplified embedding)
  const vocab = Object.keys(wordFreq);
  const vector = new Array(100).fill(0);
  
  vocab.forEach((word, i) => {
    vector[i % 100] += wordFreq[word] * Math.sin(i + word.length);
  });
  
  // Normalize
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  return vector.map(v => magnitude > 0 ? v / magnitude : 0);
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator > 0 ? dotProduct / denominator : 0;
}

export interface VectorMemoryEntry {
  id: string;
  type: 'conversation' | 'fact' | 'preference' | 'knowledge' | 'skill' | 'context' | 'document';
  content: string;
  embedding: number[];
  metadata: Record<string, unknown>;
  importance: number;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  accessedAt: number;
  accessCount: number;
  expiresAt?: number;
  syncedAt?: number;
  cloudId?: string;
}

export interface VectorSearchResult {
  entry: VectorMemoryEntry;
  similarity: number;
}

export interface MemorySyncStatus {
  lastSync: number;
  pendingUploads: number;
  pendingDownloads: number;
  syncEnabled: boolean;
  conflictCount: number;
}

const DB_NAME = 'aila-vector-memory';
const DB_VERSION = 2;

export class VectorMemorySystem {
  private db: IDBPDatabase | null = null;
  private static instance: VectorMemorySystem | null = null;
  private embeddingCache: Map<string, number[]> = new Map();

  private constructor() {}

  static getInstance(): VectorMemorySystem {
    if (!VectorMemorySystem.instance) {
      VectorMemorySystem.instance = new VectorMemorySystem();
    }
    return VectorMemorySystem.instance;
  }

  async initialize(): Promise<void> {
    if (this.db) return;

    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const memoriesStore = db.createObjectStore('vectors', { keyPath: 'id' });
          memoriesStore.createIndex('type', 'type');
          memoriesStore.createIndex('createdAt', 'createdAt');
          memoriesStore.createIndex('importance', 'importance');
          memoriesStore.createIndex('tags', 'tags', { multiEntry: true });
          memoriesStore.createIndex('cloudId', 'cloudId');
          memoriesStore.createIndex('syncedAt', 'syncedAt');
        }
        
        if (oldVersion < 2) {
          db.createObjectStore('syncQueue', { keyPath: 'id' });
          db.createObjectStore('conflicts', { keyPath: 'id' });
        }
      },
    });
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // Check cache first
    const cacheKey = text.substring(0, 100);
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey)!;
    }
    
    const embedding = simpleEmbed(text);
    this.embeddingCache.set(cacheKey, embedding);
    
    // Limit cache size
    if (this.embeddingCache.size > 1000) {
      const firstKey = this.embeddingCache.keys().next().value;
      if (firstKey) this.embeddingCache.delete(firstKey);
    }
    
    return embedding;
  }

  async store(entry: Omit<VectorMemoryEntry, 'id' | 'createdAt' | 'updatedAt' | 'accessedAt' | 'accessCount' | 'embedding'>): Promise<VectorMemoryEntry> {
    if (!this.db) await this.initialize();
    
    const now = Date.now();
    const embedding = await this.generateEmbedding(entry.content);
    
    const fullEntry: VectorMemoryEntry = {
      ...entry,
      id: `vec-${crypto.randomUUID()}`,
      embedding,
      createdAt: now,
      updatedAt: now,
      accessedAt: now,
      accessCount: 0,
    };

    await this.db!.add('vectors', fullEntry);
    
    // Queue for cloud sync
    await this.queueForSync(fullEntry, 'create');
    
    return fullEntry;
  }

  async retrieve(id: string): Promise<VectorMemoryEntry | undefined> {
    if (!this.db) await this.initialize();
    
    const entry = await this.db!.get('vectors', id);
    if (entry) {
      entry.accessedAt = Date.now();
      entry.accessCount++;
      await this.db!.put('vectors', entry);
    }
    return entry;
  }

  async update(id: string, updates: Partial<VectorMemoryEntry>): Promise<VectorMemoryEntry | undefined> {
    if (!this.db) await this.initialize();
    
    const entry = await this.db!.get('vectors', id);
    if (!entry) return undefined;

    let embedding = entry.embedding;
    if (updates.content) {
      embedding = await this.generateEmbedding(updates.content);
    }

    const updated: VectorMemoryEntry = {
      ...entry,
      ...updates,
      embedding,
      id: entry.id,
      createdAt: entry.createdAt,
      updatedAt: Date.now(),
    };

    await this.db!.put('vectors', updated);
    await this.queueForSync(updated, 'update');
    
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    if (!this.db) await this.initialize();
    
    const entry = await this.db!.get('vectors', id);
    if (entry) {
      await this.queueForSync(entry, 'delete');
    }
    
    try {
      await this.db!.delete('vectors', id);
      return true;
    } catch {
      return false;
    }
  }

  async search(
    query: string,
    options: {
      type?: VectorMemoryEntry['type'];
      tags?: string[];
      minSimilarity?: number;
      minImportance?: number;
      limit?: number;
    } = {}
  ): Promise<VectorSearchResult[]> {
    if (!this.db) await this.initialize();
    
    const queryEmbedding = await this.generateEmbedding(query);
    const results: VectorSearchResult[] = [];
    
    const tx = this.db!.transaction('vectors', 'readonly');
    const store = tx.objectStore('vectors');
    
    let cursor = await store.openCursor();
    
    while (cursor) {
      const entry = cursor.value;
      
      // Apply filters
      if (options.type && entry.type !== options.type) {
        cursor = await cursor.continue();
        continue;
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

      // Calculate similarity
      const similarity = cosineSimilarity(queryEmbedding, entry.embedding);
      
      if (options.minSimilarity === undefined || similarity >= options.minSimilarity) {
        results.push({ entry, similarity });
      }
      
      cursor = await cursor.continue();
    }

    // Sort by similarity
    results.sort((a, b) => b.similarity - a.similarity);

    const limit = options.limit || 20;
    return results.slice(0, limit);
  }

  async findSimilar(content: string, minSimilarity = 0.7, limit = 5): Promise<VectorSearchResult[]> {
    return this.search(content, { minSimilarity, limit });
  }

  async getRecent(limit = 50): Promise<VectorMemoryEntry[]> {
    if (!this.db) await this.initialize();
    
    const entries: VectorMemoryEntry[] = [];
    const tx = this.db!.transaction('vectors', 'readonly');
    const store = tx.objectStore('vectors');
    const index = store.index('createdAt');
    
    let cursor = await index.openCursor(null, 'prev');
    let count = 0;
    
    while (cursor && count < limit) {
      entries.push(cursor.value);
      count++;
      cursor = await cursor.continue();
    }
    
    return entries;
  }

  async getStats(): Promise<{
    totalEntries: number;
    byType: Record<string, number>;
    avgImportance: number;
    storageSize: number;
  }> {
    if (!this.db) await this.initialize();
    
    const stats = {
      totalEntries: 0,
      byType: {} as Record<string, number>,
      avgImportance: 0,
      storageSize: 0,
    };
    
    const tx = this.db!.transaction('vectors', 'readonly');
    const store = tx.objectStore('vectors');
    
    let cursor = await store.openCursor();
    let totalImportance = 0;
    
    while (cursor) {
      const entry = cursor.value;
      stats.totalEntries++;
      stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;
      totalImportance += entry.importance;
      stats.storageSize += new Blob([JSON.stringify(entry)]).size;
      cursor = await cursor.continue();
    }
    
    stats.avgImportance = stats.totalEntries > 0 ? totalImportance / stats.totalEntries : 0;
    
    return stats;
  }

  // Sync queue management
  private async queueForSync(entry: VectorMemoryEntry, operation: 'create' | 'update' | 'delete'): Promise<void> {
    if (!this.db) return;
    
    const queueItem = {
      id: `sync-${entry.id}`,
      entryId: entry.id,
      operation,
      data: entry,
      timestamp: Date.now(),
      retries: 0,
    };
    
    await this.db!.put('syncQueue', queueItem);
  }

  async getPendingSyncCount(): Promise<number> {
    if (!this.db) await this.initialize();
    
    const tx = this.db!.transaction('syncQueue', 'readonly');
    const store = tx.objectStore('syncQueue');
    return await store.count();
  }

  async clearSyncQueue(): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db!.clear('syncQueue');
  }

  async getAll(): Promise<VectorMemoryEntry[]> {
    if (!this.db) await this.initialize();
    
    const entries: VectorMemoryEntry[] = [];
    const tx = this.db!.transaction('vectors', 'readonly');
    const store = tx.objectStore('vectors');
    
    let cursor = await store.openCursor();
    while (cursor) {
      entries.push(cursor.value);
      cursor = await cursor.continue();
    }
    
    return entries;
  }

  async clear(type?: VectorMemoryEntry['type']): Promise<void> {
    if (!this.db) await this.initialize();
    
    const tx = this.db!.transaction('vectors', 'readwrite');
    const store = tx.objectStore('vectors');
    
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

  // Export for backup
  async exportAll(): Promise<string> {
    const entries = await this.getAll();
    return JSON.stringify(entries, null, 2);
  }

  // Import from backup
  async importAll(jsonData: string): Promise<number> {
    const entries: VectorMemoryEntry[] = JSON.parse(jsonData);
    let imported = 0;
    
    for (const entry of entries) {
      try {
        const embedding = await this.generateEmbedding(entry.content);
        await this.db!.put('vectors', { ...entry, embedding });
        imported++;
      } catch (e) {
        console.error('Failed to import entry:', e);
      }
    }
    
    return imported;
  }
}

// Export singleton
export const vectorMemory = VectorMemorySystem.getInstance();
