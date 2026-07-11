/**
 * AILA - AI Life Assistant
 * Firebase Realtime Database Provider for Global Memory Sync
 */

import type { VectorMemoryEntry } from '../../core/memory/VectorMemorySystem.js';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface RealtimeSyncOptions {
  userId: string;
  workspaceId: string;
  onConflict?: (local: VectorMemoryEntry, remote: VectorMemoryEntry) => Promise<VectorMemoryEntry>;
  onRemoteUpdate?: (entry: VectorMemoryEntry) => void;
}

export interface SyncResult {
  uploaded: number;
  downloaded: number;
  conflicts: number;
  errors: string[];
}

interface FirebaseApp {
  options: FirebaseConfig;
  name: string;
}

interface FirebaseDatabase {
  ref(path: string): DatabaseReference;
}

interface DatabaseReference {
  child(path: string): DatabaseReference;
  set(value: unknown): Promise<void>;
  get(): Promise<unknown>;
  remove(): Promise<void>;
  update(values: Record<string, unknown>): Promise<void>;
  on(event: string, callback: (snapshot: DataSnapshot) => void): () => void;
  off(event?: string): void;
}

interface DataSnapshot {
  val(): unknown;
  exists(): boolean;
  key: string | null;
  child(path: string): DataSnapshot;
}

type RealtimeCallback = (data: Record<string, VectorMemoryEntry>) => void;

export class FirebaseRealtimeProvider {
  private static instance: FirebaseRealtimeProvider | null = null;
  private config: FirebaseConfig | null = null;
  private database: FirebaseDatabase | null = null;
  private app: FirebaseApp | null = null;
  private userId: string | null = null;
  private workspaceId: string | null = null;
  private listeners: Map<string, () => void> = new Map();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private callbacks: Set<RealtimeCallback> = new Set();

  private constructor() {}

  static getInstance(): FirebaseRealtimeProvider {
    if (!FirebaseRealtimeProvider.instance) {
      FirebaseRealtimeProvider.instance = new FirebaseRealtimeProvider();
    }
    return FirebaseRealtimeProvider.instance;
  }

  async initialize(config: FirebaseConfig): Promise<boolean> {
    try {
      this.config = config;
      
      // Initialize Firebase SDK dynamically
      const firebaseJs = await this.loadFirebaseSDK();
      if (!firebaseJs) {
        console.warn('Firebase SDK not available, using mock implementation');
        return this.initializeMock(config);
      }

      // Check if already initialized
      if (!this.app || (this.app as unknown as { _deleted?: boolean })._deleted) {
        this.app = firebaseJs.initializeApp(config, `aila-${Date.now()}`);
      }
      
      this.database = this.app.database();
      this.isConnected = true;
      
      return true;
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      return this.initializeMock(config);
    }
  }

  private async loadFirebaseSDK(): Promise<typeof import('firebase/app') | null> {
    try {
      // Try to load Firebase SDK
      const firebase = await import('firebase/app');
      await import('firebase/database');
      return firebase as typeof import('firebase/app');
    } catch {
      return null;
    }
  }

  private async initializeMock(config: FirebaseConfig): Promise<boolean> {
    // Mock implementation for development
    console.log('Using Firebase Realtime DB Mock');
    this.config = config;
    this.isConnected = true;
    return true;
  }

  setUser(userId: string, workspaceId: string): void {
    this.userId = userId;
    this.workspaceId = workspaceId;
  }

  isInitialized(): boolean {
    return this.isConnected && this.database !== null;
  }

  // Sync a single entry to cloud
  async syncEntry(entry: VectorMemoryEntry, operation: 'create' | 'update' | 'delete'): Promise<boolean> {
    if (!this.isInitialized() || !this.userId || !this.workspaceId) {
      console.warn('Firebase not initialized or user not set');
      return false;
    }

    try {
      const path = `users/${this.userId}/workspaces/${this.workspaceId}/memories/${entry.id}`;
      const ref = this.database!.ref(path);

      if (operation === 'delete') {
        await ref.remove();
      } else {
        const cloudData = {
          ...entry,
          syncedAt: Date.now(),
          cloudId: entry.id,
        };
        await ref.set(cloudData);
      }

      return true;
    } catch (error) {
      console.error('Failed to sync entry:', error);
      return false;
    }
  }

  // Fetch all entries from cloud
  async fetchAll(): Promise<VectorMemoryEntry[]> {
    if (!this.isInitialized() || !this.userId || !this.workspaceId) {
      return [];
    }

    try {
      const path = `users/${this.userId}/workspaces/${this.workspaceId}/memories`;
      const ref = this.database!.ref(path);
      const snapshot = await ref.get();

      if (!snapshot.exists()) {
        return [];
      }

      const data = snapshot.val() as Record<string, VectorMemoryEntry>;
      return Object.values(data).filter(Boolean);
    } catch (error) {
      console.error('Failed to fetch from cloud:', error);
      return [];
    }
  }

  // Subscribe to real-time updates
  subscribe(callback: RealtimeCallback): () => void {
    if (!this.isInitialized() || !this.userId || !this.workspaceId) {
      return () => {};
    }

    this.callbacks.add(callback);

    const path = `users/${this.userId}/workspaces/${this.workspaceId}/memories`;
    const ref = this.database!.ref(path);
    
    const listener = ref.on('value', (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as Record<string, VectorMemoryEntry>;
        callback(data);
      }
    });

    const unsubscribe = () => {
      ref.off('value', listener);
      this.callbacks.delete(callback);
    };

    return unsubscribe;
  }

  // Listen for specific entry changes
  subscribeToEntry(entryId: string, callback: (entry: VectorMemoryEntry | null) => void): () => void {
    if (!this.isInitialized() || !this.userId || !this.workspaceId) {
      return () => {};
    }

    const path = `users/${this.userId}/workspaces/${this.workspaceId}/memories/${entryId}`;
    const ref = this.database!.ref(path);
    
    const listener = ref.on('value', (snapshot: DataSnapshot) => {
      callback(snapshot.exists() ? snapshot.val() as VectorMemoryEntry : null);
    });

    return () => {
      ref.off('value', listener);
    };
  }

  // Batch sync multiple entries
  async batchSync(entries: VectorMemoryEntry[], operation: 'create' | 'update' | 'delete'): Promise<SyncResult> {
    const result: SyncResult = {
      uploaded: 0,
      downloaded: 0,
      conflicts: 0,
      errors: [],
    };

    for (const entry of entries) {
      try {
        const success = await this.syncEntry(entry, operation);
        if (success) {
          result.uploaded++;
        } else {
          result.errors.push(`Failed to sync ${entry.id}`);
        }
      } catch (error) {
        result.errors.push(`Error syncing ${entry.id}: ${error}`);
      }
    }

    return result;
  }

  // Pull changes from cloud (fetch entries newer than timestamp)
  async pullChanges(since: number): Promise<VectorMemoryEntry[]> {
    const allEntries = await this.fetchAll();
    return allEntries.filter(entry => (entry.syncedAt || 0) > since);
  }

  // Push local changes to cloud
  async pushChanges(entries: VectorMemoryEntry[]): Promise<SyncResult> {
    return this.batchSync(entries, 'create');
  }

  // Full bidirectional sync
  async fullSync(localEntries: VectorMemoryEntry[]): Promise<SyncResult> {
    const result: SyncResult = {
      uploaded: 0,
      downloaded: 0,
      conflicts: 0,
      errors: [],
    };

    try {
      // Get remote entries
      const remoteEntries = await this.fetchAll();
      const remoteMap = new Map(remoteEntries.map(e => [e.id, e]));
      const localMap = new Map(localEntries.map(e => [e.id, e]));

      // Upload local entries that don't exist remotely or are newer
      for (const local of localEntries) {
        const remote = remoteMap.get(local.id);
        
        if (!remote) {
          // New entry - upload
          const success = await this.syncEntry(local, 'create');
          if (success) result.uploaded++;
        } else if (local.updatedAt > (remote.updatedAt || 0)) {
          // Local is newer - upload
          const success = await this.syncEntry(local, 'update');
          if (success) result.uploaded++;
        } else if (local.updatedAt < (remote.updatedAt || 0)) {
          // Remote is newer - mark for download
          result.downloaded++;
        } else if (JSON.stringify(local) !== JSON.stringify(remote)) {
          // Conflict
          result.conflicts++;
        }
      }

      // Download remote entries that don't exist locally
      for (const remote of remoteEntries) {
        if (!localMap.has(remote.id)) {
          result.downloaded++;
        }
      }
    } catch (error) {
      result.errors.push(`Sync error: ${error}`);
    }

    return result;
  }

  // Delete all user data from cloud
  async clearUserData(): Promise<boolean> {
    if (!this.isInitialized() || !this.userId || !this.workspaceId) {
      return false;
    }

    try {
      const path = `users/${this.userId}/workspaces/${this.workspaceId}/memories`;
      await this.database!.ref(path).remove();
      return true;
    } catch (error) {
      console.error('Failed to clear user data:', error);
      return false;
    }
  }

  // Get sync status
  async getSyncStatus(): Promise<{
    connected: boolean;
    lastSync: number;
    pendingChanges: number;
  }> {
    if (!this.isInitialized()) {
      return { connected: false, lastSync: 0, pendingChanges: 0 };
    }

    return {
      connected: this.isConnected,
      lastSync: Date.now(),
      pendingChanges: 0,
    };
  }

  // Cleanup
  disconnect(): void {
    if (this.database && this.userId && this.workspaceId) {
      const path = `users/${this.userId}/workspaces/${this.workspaceId}/memories`;
      this.database.ref(path).off();
    }
    
    this.callbacks.clear();
    this.listeners.forEach(unsub => unsub());
    this.listeners.clear();
    
    this.isConnected = false;
  }
}

// Export singleton
export const firebaseRealtime = FirebaseRealtimeProvider.getInstance();
