/**
 * AILA - AI Life Assistant
 * Session Management System
 */

import { openDB, type IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  metadata?: Record<string, unknown>;
}

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'audio';
  name: string;
  size: number;
  url: string;
  thumbnail?: string;
  mimeType: string;
}

export interface Session {
  id: string;
  title: string;
  workspaceId: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  accessedAt: number;
  messageCount: number;
  isArchived: boolean;
  isPinned: boolean;
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface SessionTemplate {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  systemPrompt?: string;
  icon: string;
}

const DB_NAME = 'aila-sessions';
const DB_VERSION = 1;

export class SessionManager {
  private db: IDBPDatabase | null = null;
  private static instance: SessionManager | null = null;
  private activeSession: Session | null = null;
  private templates: SessionTemplate[] = [
    {
      id: 'blank',
      name: 'جلسة جديدة',
      nameEn: 'New Session',
      description: 'بداية محادثة جديدة',
      icon: '💬',
    },
    {
      id: 'coding',
      name: 'مساعد البرمجة',
      nameEn: 'Coding Assistant',
      description: 'مساعدة في كتابة ومراجعة الأكواد',
      icon: '💻',
      systemPrompt: 'أنت مبرمج محترف. ساعد في كتابة كود نظيف وفعال.',
    },
    {
      id: 'research',
      name: 'البحث',
      nameEn: 'Research',
      description: 'البحث وتحليل المعلومات',
      icon: '🔍',
    },
    {
      id: 'writing',
      name: 'الكتابة',
      nameEn: 'Writing',
      description: 'المساعدة في كتابة المحتوى',
      icon: '✍️',
    },
    {
      id: 'analysis',
      name: 'التحليل',
      nameEn: 'Analysis',
      description: 'تحليل البيانات والمعلومات',
      icon: '📊',
    },
  ];

  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.db) return;

    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const sessionsStore = db.createObjectStore('sessions', { keyPath: 'id' });
        sessionsStore.createIndex('workspaceId', 'workspaceId');
        sessionsStore.createIndex('createdAt', 'createdAt');
        sessionsStore.createIndex('accessedAt', 'accessedAt');
        sessionsStore.createIndex('isArchived', 'isArchived');
        sessionsStore.createIndex('isPinned', 'isPinned');
        
        db.createObjectStore('activeTab', { keyPath: 'id' });
      },
    });
  }

  async createSession(workspaceId: string, title?: string, templateId?: string): Promise<Session> {
    if (!this.db) await this.initialize();

    const now = Date.now();
    const template = this.templates.find(t => t.id === templateId);
    
    const session: Session = {
      id: uuidv4(),
      title: title || (template ? `${template.icon} ${template.name}` : '💬 محادثة جديدة'),
      workspaceId,
      messages: [],
      createdAt: now,
      updatedAt: now,
      accessedAt: now,
      messageCount: 0,
      isArchived: false,
      isPinned: false,
      tags: [],
      metadata: template ? { templateId: template.id, systemPrompt: template.systemPrompt } : {},
    };

    await this.db!.add('sessions', session);
    this.activeSession = session;
    
    return session;
  }

  async getSession(id: string): Promise<Session | undefined> {
    if (!this.db) await this.initialize();
    
    const session = await this.db!.get('sessions', id);
    if (session) {
      session.accessedAt = Date.now();
      await this.db!.put('sessions', session);
      this.activeSession = session;
    }
    
    return session;
  }

  async getActiveSession(): Promise<Session | null> {
    if (!this.activeSession) {
      const sessions = await this.getRecentSessions(1);
      if (sessions.length > 0) {
        this.activeSession = sessions[0];
      }
    }
    return this.activeSession;
  }

  async setActiveSession(id: string): Promise<Session | undefined> {
    return this.getSession(id);
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<Session | undefined> {
    if (!this.db) await this.initialize();
    
    const session = await this.db!.get('sessions', id);
    if (!session) return undefined;

    const updated: Session = {
      ...session,
      ...updates,
      id: session.id,
      createdAt: session.createdAt,
      updatedAt: Date.now(),
    };

    await this.db!.put('sessions', updated);
    
    if (this.activeSession?.id === id) {
      this.activeSession = updated;
    }
    
    return updated;
  }

  async deleteSession(id: string): Promise<boolean> {
    if (!this.db) await this.initialize();
    
    try {
      await this.db!.delete('sessions', id);
      
      if (this.activeSession?.id === id) {
        this.activeSession = null;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  async archiveSession(id: string): Promise<Session | undefined> {
    return this.updateSession(id, { isArchived: true });
  }

  async pinSession(id: string): Promise< Session | undefined> {
    return this.updateSession(id, { isPinned: true });
  }

  async unpinSession(id: string): Promise<Session | undefined> {
    return this.updateSession(id, { isPinned: false });
  }

  async addMessage(sessionId: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    if (!this.db) await this.initialize();
    
    const session = await this.db!.get('sessions', sessionId);
    if (!session) throw new Error('Session not found');

    const newMessage: Message = {
      ...message,
      id: uuidv4(),
      timestamp: Date.now(),
    };

    session.messages.push(newMessage);
    session.messageCount++;
    session.updatedAt = Date.now();
    session.accessedAt = Date.now();

    await this.db!.put('sessions', session);
    
    if (this.activeSession?.id === sessionId) {
      this.activeSession = session;
    }

    return newMessage;
  }

  async updateMessage(sessionId: string, messageId: string, content: string): Promise<Message | undefined> {
    if (!this.db) await this.initialize();
    
    const session = await this.db!.get('sessions', sessionId);
    if (!session) return undefined;

    const messageIndex = session.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return undefined;

    session.messages[messageIndex] = {
      ...session.messages[messageIndex],
      content,
    };
    session.updatedAt = Date.now();

    await this.db!.put('sessions', session);
    
    return session.messages[messageIndex];
  }

  async deleteMessage(sessionId: string, messageId: string): Promise<boolean> {
    if (!this.db) await this.initialize();
    
    const session = await this.db!.get('sessions', sessionId);
    if (!session) return false;

    const messageIndex = session.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return false;

    session.messages.splice(messageIndex, 1);
    session.messageCount = Math.max(0, session.messageCount - 1);
    session.updatedAt = Date.now();

    await this.db!.put('sessions', session);
    
    return true;
  }

  async getRecentSessions(limit = 20, workspaceId?: string): Promise<Session[]> {
    if (!this.db) await this.initialize();
    
    const sessions: Session[] = [];
    const tx = this.db!.transaction('sessions', 'readonly');
    const store = tx.objectStore('sessions');
    const index = store.index('accessedAt');
    
    let cursor = await index.openCursor(null, 'prev');
    let count = 0;
    
    while (cursor && count < limit) {
      const session = cursor.value;
      if (!session.isArchived && (!workspaceId || session.workspaceId === workspaceId)) {
        sessions.push(session);
        count++;
      }
      cursor = await cursor.continue();
    }
    
    return sessions;
  }

  async getArchivedSessions(limit = 50): Promise<Session[]> {
    if (!this.db) await this.initialize();
    
    const sessions: Session[] = [];
    const tx = this.db!.transaction('sessions', 'readonly');
    const store = tx.objectStore('sessions');
    const index = store.index('isArchived');
    
    let cursor = await index.openCursor(true);
    
    while (cursor && sessions.length < limit) {
      sessions.push(cursor.value);
      cursor = await cursor.continue();
    }
    
    return sessions;
  }

  async getPinnedSessions(): Promise<Session[]> {
    if (!this.db) await this.initialize();
    
    const sessions: Session[] = [];
    const tx = this.db!.transaction('sessions', 'readonly');
    const store = tx.objectStore('sessions');
    const index = store.index('isPinned');
    
    let cursor = await index.openCursor(true);
    
    while (cursor) {
      sessions.push(cursor.value);
      cursor = await cursor.continue();
    }
    
    return sessions;
  }

  async searchSessions(query: string, limit = 20): Promise<Session[]> {
    if (!this.db) await this.initialize();
    
    const sessions: Session[] = [];
    const lowerQuery = query.toLowerCase();
    const tx = this.db!.transaction('sessions', 'readonly');
    const store = tx.objectStore('sessions');
    
    let cursor = await store.openCursor();
    
    while (cursor && sessions.length < limit) {
      const session = cursor.value;
      if (!session.isArchived) {
        const matches = session.title.toLowerCase().includes(lowerQuery) ||
                      session.messages.some(m => m.content.toLowerCase().includes(lowerQuery)) ||
                      session.tags.some(t => t.toLowerCase().includes(lowerQuery));
        
        if (matches) {
          sessions.push(session);
        }
      }
      cursor = await cursor.continue();
    }
    
    return sessions;
  }

  async exportSession(id: string): Promise<string | null> {
    const session = await this.getSession(id);
    if (!session) return null;
    
    return JSON.stringify(session, null, 2);
  }

  async importSession(jsonData: string): Promise<Session | null> {
    if (!this.db) await this.initialize();
    
    try {
      const imported: Session = JSON.parse(jsonData);
      
      const newSession: Session = {
        ...imported,
        id: uuidv4(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        accessedAt: Date.now(),
      };
      
      await this.db!.add('sessions', newSession);
      return newSession;
    } catch {
      return null;
    }
  }

  getTemplates(): SessionTemplate[] {
    return this.templates;
  }

  async getSessionCount(workspaceId?: string): Promise<number> {
    if (!this.db) await this.initialize();
    
    let count = 0;
    const tx = this.db!.transaction('sessions', 'readonly');
    const store = tx.objectStore('sessions');
    
    let cursor = await store.openCursor();
    
    while (cursor) {
      if (!cursor.value.isArchived && (!workspaceId || cursor.value.workspaceId === workspaceId)) {
        count++;
      }
      cursor = await cursor.continue();
    }
    
    return count;
  }
}

export const sessionManager = SessionManager.getInstance();
