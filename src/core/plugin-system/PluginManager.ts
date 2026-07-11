/**
 * AILA - AI Life Assistant
 * Plugin System Implementation
 */

import { v4 as uuidv4 } from 'uuid';
import type { UUID } from '../../types/index.js';

/**
 * Plugin status
 */
export type PluginStatus = 'installed' | 'enabled' | 'disabled' | 'error';

/**
 * Plugin permission
 */
export interface Permission {
  type: PermissionType;
  description: string;
}

export type PermissionType = 
  | 'network'
  | 'storage'
  | 'camera'
  | 'microphone'
  | 'notifications'
  | 'background'
  | 'clipboard'
  | 'filesystem'
  | 'bluetooth'
  | 'usb';

/**
 * Plugin manifest - metadata about a plugin
 */
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  homepage?: string;
  repository?: string;
  main: string;
  icon?: string;
  permissions?: Permission[];
  dependencies?: Record<string, string>;
  category?: string;
  keywords?: string[];
  minAilaVersion?: string;
}

/**
 * Plugin context - what the plugin can access
 */
export interface PluginContext {
  pluginId: string;
  manifest: PluginManifest;
  eventBus: unknown;
  config: unknown;
  logger: unknown;
  storage: unknown;
  tools: unknown;
}

/**
 * IPlugin - Plugin interface
 */
export interface IPlugin {
  readonly manifest: PluginManifest;
  readonly status: PluginStatus;
  
  initialize(context: PluginContext): Promise<void>;
  enable(): Promise<void>;
  disable(): Promise<void>;
  dispose(): Promise<void>;
}

/**
 * Plugin class wrapper
 */
export class Plugin implements IPlugin {
  readonly manifest: PluginManifest;
  status: PluginStatus = 'installed';
  private context?: PluginContext;
  private instance?: IPlugin;
  
  constructor(manifest: PluginManifest, instance?: IPlugin) {
    this.manifest = manifest;
    this.instance = instance;
  }
  
  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    
    if (this.instance) {
      await this.instance.initialize(context);
    }
  }
  
  async enable(): Promise<void> {
    if (this.status !== 'disabled') {
      throw new Error(`Plugin ${this.manifest.id} cannot be enabled from status ${this.status}`);
    }
    
    if (this.instance) {
      await this.instance.enable();
    }
    
    this.status = 'enabled';
  }
  
  async disable(): Promise<void> {
    if (this.status !== 'enabled') {
      throw new Error(`Plugin ${this.manifest.id} cannot be disabled from status ${this.status}`);
    }
    
    if (this.instance) {
      await this.instance.disable();
    }
    
    this.status = 'disabled';
  }
  
  async dispose(): Promise<void> {
    if (this.instance) {
      await this.instance.dispose();
    }
    
    this.context = undefined;
    this.instance = undefined;
    this.status = 'installed';
  }
}

/**
 * Plugin manager - handles plugin lifecycle
 */
export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private enabledPlugins: Set<string> = new Set();
  private context?: PluginContext;
  
  /**
   * Set the plugin context
   */
  setContext(context: PluginContext): void {
    this.context = context;
  }
  
  /**
   * Register a plugin
   */
  register(manifest: PluginManifest, instance?: IPlugin): void {
    if (this.plugins.has(manifest.id)) {
      throw new Error(`Plugin ${manifest.id} is already registered`);
    }
    
    const plugin = new Plugin(manifest, instance);
    this.plugins.set(manifest.id, plugin);
  }
  
  /**
   * Unregister a plugin
   */
  async unregister(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not registered`);
    }
    
    if (plugin.status === 'enabled') {
      await this.disable(pluginId);
    }
    
    await plugin.dispose();
    this.plugins.delete(pluginId);
  }
  
  /**
   * Install a plugin
   */
  async install(manifest: PluginManifest): Promise<void> {
    if (!this.context) {
      throw new Error('Plugin context is not set');
    }
    
    if (this.plugins.has(manifest.id)) {
      throw new Error(`Plugin ${manifest.id} is already installed`);
    }
    
    // Create plugin instance from manifest
    const plugin = new Plugin(manifest);
    
    try {
      await plugin.initialize({
        ...this.context,
        manifest,
      });
      
      this.plugins.set(manifest.id, plugin);
    } catch (error) {
      plugin.status = 'error';
      throw error;
    }
  }
  
  /**
   * Uninstall a plugin
   */
  async uninstall(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not installed`);
    }
    
    if (plugin.status === 'enabled') {
      await this.disable(pluginId);
    }
    
    await plugin.dispose();
    this.plugins.delete(pluginId);
  }
  
  /**
   * Enable a plugin
   */
  async enable(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not installed`);
    }
    
    if (plugin.status === 'enabled') {
      return;
    }
    
    try {
      await plugin.enable();
      this.enabledPlugins.add(pluginId);
    } catch (error) {
      plugin.status = 'error';
      throw error;
    }
  }
  
  /**
   * Disable a plugin
   */
  async disable(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not installed`);
    }
    
    if (plugin.status === 'disabled') {
      return;
    }
    
    try {
      await plugin.disable();
      this.enabledPlugins.delete(pluginId);
    } catch (error) {
      plugin.status = 'error';
      throw error;
    }
  }
  
  /**
   * Get a plugin by ID
   */
  get(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }
  
  /**
   * Get all plugins
   */
  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }
  
  /**
   * Get plugins by category
   */
  getByCategory(category: string): Plugin[] {
    return this.getAll().filter(
      (plugin) => plugin.manifest.category === category
    );
  }
  
  /**
   * Get enabled plugins
   */
  getEnabled(): Plugin[] {
    return this.getAll().filter((plugin) => plugin.status === 'enabled');
  }
  
  /**
   * Get disabled plugins
   */
  getDisabled(): Plugin[] {
    return this.getAll().filter((plugin) => plugin.status === 'disabled');
  }
  
  /**
   * Check if a plugin is enabled
   */
  isEnabled(pluginId: string): boolean {
    return this.enabledPlugins.has(pluginId);
  }
  
  /**
   * Get plugin manifest
   */
  getManifest(pluginId: string): PluginManifest | undefined {
    return this.plugins.get(pluginId)?.manifest;
  }
  
  /**
   * Validate plugin dependencies
   */
  validateDependencies(manifest: PluginManifest): { valid: boolean; missing: string[] } {
    const missing: string[] = [];
    
    if (!manifest.dependencies) {
      return { valid: true, missing: [] };
    }
    
    for (const [depId, version] of Object.entries(manifest.dependencies)) {
      const dep = this.plugins.get(depId);
      
      if (!dep) {
        missing.push(depId);
        continue;
      }
      
      // Simple version check (should use semver library in production)
      if (dep.manifest.version !== version) {
        missing.push(`${depId}@${version} (found: ${dep.manifest.version})`);
      }
    }
    
    return { valid: missing.length === 0, missing };
  }
  
  /**
   * Check plugin permissions
   */
  hasPermission(pluginId: string, permission: PermissionType): boolean {
    const plugin = this.plugins.get(pluginId);
    
    if (!plugin) {
      return false;
    }
    
    const permissions = plugin.manifest.permissions;
    
    if (!permissions || permissions.length === 0) {
      return false;
    }
    
    return permissions.some((p) => p.type === permission);
  }
}

// Singleton instance
let globalPluginManager: PluginManager | null = null;

export function getPluginManager(): PluginManager {
  if (!globalPluginManager) {
    globalPluginManager = new PluginManager();
  }
  return globalPluginManager;
}

export function setPluginManager(manager: PluginManager): void {
  globalPluginManager = manager;
}

export function createPluginManager(): PluginManager {
  return new PluginManager();
}
