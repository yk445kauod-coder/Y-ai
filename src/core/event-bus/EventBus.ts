/**
 * AILA - AI Life Assistant
 * Event Bus Implementation
 */

import { v4 as uuidv4 } from 'uuid';
import type { AILAEvent, EventHandler, Subscription, UUID } from '../../types/index.js';

export interface IEventBus {
  publish<T>(event: AILAEvent<T>): void;
  publish<T>(type: string, payload: T, metadata?: Record<string, unknown>): void;
  
  subscribe<T>(eventType: string, handler: EventHandler<T>): Subscription;
  
  once<T>(eventType: string, handler: EventHandler<T>): void;
  
  unsubscribe(subscription: Subscription): void;
  
  unsubscribeAll(eventType?: string): void;
  
  clear(): void;
  
  getHistory(eventType?: string): AILAEvent[];
}

/**
 * EventBus - Central event dispatching system
 * Handles publish/subscribe pattern with history support
 */
export class EventBus implements IEventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private eventHistory: AILAEvent[] = [];
  private maxHistorySize: number;
  private onceHandlers: Map<string, EventHandler[]> = new Map();
  
  constructor(maxHistorySize = 1000) {
    this.maxHistorySize = maxHistorySize;
  }
  
  /**
   * Publish an event to all subscribers
   */
  publish<T>(eventOrType: AILAEvent<T> | string, payload?: T, metadata?: Record<string, unknown>): void {
    const event: AILAEvent<T> = typeof eventOrType === 'string'
      ? this.createEvent(eventOrType, payload as T, metadata)
      : eventOrType;
    
    // Add to history
    this.addToHistory(event);
    
    // Get handlers for this event type
    const handlers = this.handlers.get(event.type);
    
    // Also get wildcard handlers
    const wildcardHandlers = this.handlers.get('*');
    
    // Execute handlers asynchronously to avoid blocking
    const allHandlers = [
      ...(handlers || []),
      ...(wildcardHandlers || []),
    ];
    
    // Execute all handlers
    for (const handler of allHandlers) {
      try {
        const result = handler(event);
        if (result instanceof Promise) {
          result.catch((error) => {
            console.error(`Error in event handler for ${event.type}:`, error);
          });
        }
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
      }
    }
    
    // Execute once handlers
    const onceHandlers = this.onceHandlers.get(event.type);
    if (onceHandlers) {
      this.onceHandlers.delete(event.type);
      for (const handler of onceHandlers) {
        try {
          const result = handler(event);
          if (result instanceof Promise) {
            result.catch((error) => {
              console.error(`Error in once handler for ${event.type}:`, error);
            });
          }
        } catch (error) {
          console.error(`Error in once handler for ${event.type}:`, error);
        }
      }
    }
  }
  
  /**
   * Subscribe to an event type
   */
  subscribe<T>(eventType: string, handler: EventHandler<T>): Subscription {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    
    this.handlers.get(eventType)!.add(handler as EventHandler);
    
    return {
      id: uuidv4(),
      eventType,
      unsubscribe: () => this.unsubscribeByType(eventType, handler),
    };
  }
  
  /**
   * Subscribe to an event only once
   */
  once<T>(eventType: string, handler: EventHandler<T>): void {
    if (!this.onceHandlers.has(eventType)) {
      this.onceHandlers.set(eventType, []);
    }
    
    this.onceHandlers.get(eventType)!.push(handler as EventHandler);
  }
  
  /**
   * Unsubscribe using a subscription object
   */
  unsubscribe(subscription: Subscription): void {
    this.unsubscribeByType(subscription.eventType, null, subscription.id);
  }
  
  /**
   * Unsubscribe all handlers for an event type, or all events if no type specified
   */
  unsubscribeAll(eventType?: string): void {
    if (eventType) {
      this.handlers.delete(eventType);
      this.onceHandlers.delete(eventType);
    } else {
      this.handlers.clear();
      this.onceHandlers.clear();
    }
  }
  
  /**
   * Clear all event history
   */
  clear(): void {
    this.eventHistory = [];
  }
  
  /**
   * Get event history, optionally filtered by type
   */
  getHistory(eventType?: string): AILAEvent[] {
    if (eventType) {
      return this.eventHistory.filter((event) => event.type === eventType);
    }
    return [...this.eventHistory];
  }
  
  /**
   * Create an event object
   */
  private createEvent<T>(
    type: string,
    payload: T,
    metadata?: Record<string, unknown>
  ): AILAEvent<T> {
    return {
      id: uuidv4(),
      type,
      timestamp: Date.now(),
      source: 'system',
      payload,
      metadata,
    };
  }
  
  /**
   * Add event to history with size limit
   */
  private addToHistory<T>(event: AILAEvent<T>): void {
    this.eventHistory.push(event);
    
    // Trim history if it exceeds max size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }
  
  /**
   * Unsubscribe a specific handler
   */
  private unsubscribeByType<T>(
    eventType: string,
    handler: EventHandler<T> | null,
    subscriptionId?: UUID
  ): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      if (handler) {
        handlers.delete(handler as EventHandler);
      } else if (subscriptionId) {
        // Remove all handlers for this subscription ID
        // Note: We don't track subscription IDs in the current implementation
        // This would need to be added if needed
      }
      
      // Clean up empty sets
      if (handlers.size === 0) {
        this.handlers.delete(eventType);
      }
    }
  }
}

// Singleton instance for global use
let globalEventBus: EventBus | null = null;

export function getEventBus(): EventBus {
  if (!globalEventBus) {
    globalEventBus = new EventBus();
  }
  return globalEventBus;
}

export function setEventBus(eventBus: EventBus): void {
  globalEventBus = eventBus;
}

export function createEventBus(maxHistorySize?: number): EventBus {
  return new EventBus(maxHistorySize);
}
