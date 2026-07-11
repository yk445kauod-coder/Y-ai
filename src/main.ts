/**
 * AILA - AI Life Assistant
 * Main Entry Point
 */

import { createEventBus, getEventBus } from './core/event-bus/EventBus.js';
import { createConfigManager, getConfigManager } from './core/config/ConfigManager.js';
import { createLogger, getLogger } from './core/logger/Logger.js';
import { createPluginManager, getPluginManager } from './core/plugin-system/PluginManager.js';
import { AILA_EVENTS } from './types/index.js';

// Initialize core services
const logger = getLogger('AILA');
const eventBus = getEventBus();
const configManager = getConfigManager();
const pluginManager = getPluginManager();

/**
 * AILA Main Class
 */
export class AILA {
  private static instance: AILA | null = null;
  private initialized = false;
  
  private constructor() {
    // Private constructor for singleton
  }
  
  /**
   * Get AILA singleton instance
   */
  static getInstance(): AILA {
    if (!AILA.instance) {
      AILA.instance = new AILA();
    }
    return AILA.instance;
  }
  
  /**
   * Initialize AILA
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.warn('AILA is already initialized');
      return;
    }
    
    logger.info('Initializing AILA...');
    
    try {
      // Setup plugin context
      pluginManager.setContext({
        pluginId: 'aila-core',
        manifest: {
          id: 'aila-core',
          name: 'AILA Core',
          version: '1.0.0',
          description: 'Core module for AILA',
          author: 'AILA Team',
          main: '',
        },
        eventBus,
        config: configManager,
        logger,
        storage: null,
        tools: null,
      });
      
      // Publish ready event
      eventBus.publish(AILA_EVENTS.INITIALIZED, {
        timestamp: Date.now(),
        version: '1.0.0',
      });
      
      this.initialized = true;
      logger.info('AILA initialized successfully');
      
      // Emit ready event to window
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aila:ready'));
      }
      
      eventBus.publish(AILA_EVENTS.READY, {
        timestamp: Date.now(),
        version: '1.0.0',
      });
    } catch (error) {
      logger.error('Failed to initialize AILA', error as Error);
      throw error;
    }
  }
  
  /**
   * Dispose AILA
   */
  async dispose(): Promise<void> {
    if (!this.initialized) {
      return;
    }
    
    logger.info('Disposing AILA...');
    
    try {
      // Disable all plugins
      const plugins = pluginManager.getEnabled();
      for (const plugin of plugins) {
        await pluginManager.disable(plugin.manifest.id);
      }
      
      // Clear event handlers
      eventBus.clear();
      
      this.initialized = false;
      logger.info('AILA disposed successfully');
      
      eventBus.publish(AILA_EVENTS.DISPOSED, {
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Failed to dispose AILA', error as Error);
      throw error;
    }
  }
  
  /**
   * Check if AILA is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
  
  /**
   * Get event bus
   */
  getEventBus() {
    return eventBus;
  }
  
  /**
   * Get config manager
   */
  getConfig() {
    return configManager;
  }
  
  /**
   * Get logger
   */
  getLogger(context?: string) {
    return context ? logger.child(context) : logger;
  }
  
  /**
   * Get plugin manager
   */
  getPlugins() {
    return pluginManager;
  }
}

// Export everything
export { AILA_EVENTS } from './types/index.js';
export { EventBus, getEventBus, createEventBus } from './core/event-bus/EventBus.js';
export { ConfigManager, createConfigManager, getConfigManager } from './core/config/ConfigManager.js';
export { Logger, createLogger, getLogger, LogLevel } from './core/logger/Logger.js';
export { PluginManager, createPluginManager, getPluginManager } from './core/plugin-system/PluginManager.js';

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      // Import the AILA App component (which will register the custom element)
      await import('./ui/components/AILAApp.js');
      
      // Dispatch ready event to hide loading screen
      window.dispatchEvent(new CustomEvent('aila:ready'));
    } catch (error) {
      console.error('Failed to initialize AILA:', error);
      // Still dispatch ready event to hide loading screen
      window.dispatchEvent(new CustomEvent('aila:ready'));
    }
  });
}

// Default export
export default AILA;
