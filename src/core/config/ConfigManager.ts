/**
 * AILA - AI Life Assistant
 * Configuration Manager Implementation
 */

import { deepMerge, isObject } from '../../utils/index.js';
import type { JSONSchema, JSONValue, JSONObject } from '../../types/index.js';

// Default configuration
export interface AILAConfig {
  // AI Configuration
  ai: AIConfig;
  
  // Memory Configuration
  memory: MemoryConfig;
  
  // Voice Configuration
  voice: VoiceConfig;
  
  // Security Configuration
  security: SecurityConfig;
  
  // UI Configuration
  ui: UIConfig;
  
  // Storage Configuration
  storage: StorageConfig;
  
  // IoT Configuration
  iot: IoTConfig;
  
  // General Configuration
  general: GeneralConfig;
}

export interface AIConfig {
  provider: AIProviderType;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
  streaming?: boolean;
  fallbackProviders?: AIProviderType[];
}

export type AIProviderType = 
  | 'groq'
  | 'openai'
  | 'gemini'
  | 'anthropic'
  | 'openrouter'
  | 'ollama'
  | 'lmstudio'
  | 'kimi'
  | 'minimax'
  | 'siliconflow'
  | 'togetherai';

export interface MemoryConfig {
  shortTermLimit: number;
  shortTermTTL: number;
  longTermEnabled: boolean;
  vectorEnabled: boolean;
  compressionEnabled: boolean;
  autoSummarize: boolean;
  summarizeThreshold: number;
}

export interface VoiceConfig {
  enabled: boolean;
  wakeWord: WakeWordConfig;
  stt: STTConfig;
  tts: TTSConfig;
}

export interface WakeWordConfig {
  enabled: boolean;
  words: string[];
  sensitivity: number;
  language: string;
  audioThreshold: number;
  cooldown: number;
}

export interface STTConfig {
  provider: STTProviderType;
  language: string;
  interimResults: boolean;
  continuous: boolean;
  noiseSuppression: boolean;
}

export type STTProviderType = 'browser' | 'whisper' | 'google' | 'assemblyai';

export interface TTSConfig {
  provider: TTSProviderType;
  voice: string;
  language: string;
  rate: number;
  pitch: number;
  volume: number;
}

export type TTSProviderType = 'edge' | 'piper' | 'kokoro' | 'browser';

export interface SecurityConfig {
  mode: SecurityMode;
  voiceVerification: boolean;
  faceRecognition: boolean;
  biometrics: boolean;
  requireWakeWord: boolean;
  autoLock: boolean;
  autoLockTimeout: number;
}

export type SecurityMode = 'open' | 'wake-word' | 'voice' | 'face' | 'secure' | 'custom';

export interface UIConfig {
  theme: 'light' | 'dark' | 'auto';
  locale: 'ar' | 'en' | 'ar-EG';
  direction: 'rtl' | 'ltr' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
}

export interface StorageConfig {
  provider: StorageProviderType;
  encrypted: boolean;
  syncEnabled: boolean;
  maxCacheSize: number;
}

export type StorageProviderType = 'indexeddb' | 'firebase' | 'supabase' | 'localstorage';

export interface IoTConfig {
  enabled: boolean;
  autoDiscovery: boolean;
  protocols: string[];
  defaultTimeout: number;
}

export interface GeneralConfig {
  debug: boolean;
  logLevel: 'trace' | 'debug' | 'info' | 'warn' | 'error';
  telemetry: boolean;
  maxRetries: number;
}

// Default configuration values
const DEFAULT_CONFIG: AILAConfig = {
  ai: {
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    maxTokens: 4096,
    streaming: true,
  },
  
  memory: {
    shortTermLimit: 100,
    shortTermTTL: 3600000, // 1 hour
    longTermEnabled: true,
    vectorEnabled: true,
    compressionEnabled: true,
    autoSummarize: true,
    summarizeThreshold: 10,
  },
  
  voice: {
    enabled: true,
    wakeWord: {
      enabled: true,
      words: ['hey aila', 'aila', 'aila wake'],
      sensitivity: 0.6,
      language: 'ar',
      audioThreshold: 0.5,
      cooldown: 2000,
    },
    stt: {
      provider: 'browser',
      language: 'ar-SA',
      interimResults: true,
      continuous: false,
      noiseSuppression: true,
    },
    tts: {
      provider: 'browser',
      voice: '',
      language: 'ar-SA',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
    },
  },
  
  security: {
    mode: 'open',
    voiceVerification: false,
    faceRecognition: false,
    biometrics: false,
    requireWakeWord: true,
    autoLock: false,
    autoLockTimeout: 300000, // 5 minutes
  },
  
  ui: {
    theme: 'dark',
    locale: 'ar',
    direction: 'rtl',
    fontSize: 'medium',
    animations: true,
  },
  
  storage: {
    provider: 'indexeddb',
    encrypted: true,
    syncEnabled: false,
    maxCacheSize: 100 * 1024 * 1024, // 100MB
  },
  
  iot: {
    enabled: false,
    autoDiscovery: true,
    protocols: ['mqtt', 'ble', 'serial'],
    defaultTimeout: 5000,
  },
  
  general: {
    debug: false,
    logLevel: 'info',
    telemetry: false,
    maxRetries: 3,
  },
};

export interface IConfigManager {
  get<K extends keyof AILAConfig>(key: K): AILAConfig[K];
  get<K extends keyof AILAConfig>(key: string): JSONValue | undefined;
  
  set<K extends keyof AILAConfig>(key: K, value: AILAConfig[K]): void;
  set(key: string, value: JSONValue): void;
  
  setPartial(partial: Partial<AILAConfig>): void;
  
  reset(): void;
  
  export(): string;
  import(configJson: string): void;
  
  getAll(): Readonly<AILAConfig>;
}

/**
 * ConfigManager - Manages application configuration
 */
export class ConfigManager implements IConfigManager {
  private config: AILAConfig;
  private defaults: Readonly<AILAConfig>;
  private listeners: Set<(config: AILAConfig) => void> = new Set();
  
  constructor(initialConfig?: Partial<AILAConfig>) {
    this.defaults = Object.freeze(DEFAULT_CONFIG);
    this.config = deepMerge(DEFAULT_CONFIG, initialConfig || {}) as AILAConfig;
  }
  
  /**
   * Get a configuration value
   */
  get<K extends keyof AILAConfig>(key: K): AILAConfig[K];
  get(key: string): JSONValue | undefined;
  get(key: string): JSONValue | undefined {
    const keys = key.split('.');
    let value: unknown = this.config;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as JSONObject)[k];
      } else {
        return undefined;
      }
    }
    
    return value as JSONValue;
  }
  
  /**
   * Set a configuration value
   */
  set<K extends keyof AILAConfig>(key: K, value: AILAConfig[K]): void;
  set(key: string, value: JSONValue): void;
  set(key: string, value: JSONValue): void {
    const keys = key.split('.');
    const lastKey = keys.pop()!;
    
    let target: JSONObject = this.config as unknown as JSONObject;
    for (const k of keys) {
      if (!(k in target) || !isObject(target[k])) {
        target[k] = {};
      }
      target = target[k] as JSONObject;
    }
    
    target[lastKey] = value;
    this.notifyListeners();
  }
  
  /**
   * Set multiple configuration values
   */
  setPartial(partial: Partial<AILAConfig>): void {
    this.config = deepMerge(this.config, partial) as AILAConfig;
    this.notifyListeners();
  }
  
  /**
   * Reset configuration to defaults
   */
  reset(): void {
    this.config = deepMerge(DEFAULT_CONFIG, {}) as AILAConfig;
    this.notifyListeners();
  }
  
  /**
   * Export configuration as JSON string
   */
  export(): string {
    return JSON.stringify(this.config, null, 2);
  }
  
  /**
   * Import configuration from JSON string
   */
  import(configJson: string): void {
    try {
      const parsed = JSON.parse(configJson);
      this.config = deepMerge(DEFAULT_CONFIG, parsed) as AILAConfig;
      this.notifyListeners();
    } catch (error) {
      throw new Error(`Invalid configuration JSON: ${error}`);
    }
  }
  
  /**
   * Get all configuration
   */
  getAll(): Readonly<AILAConfig> {
    return this.config;
  }
  
  /**
   * Subscribe to configuration changes
   */
  subscribe(listener: (config: AILAConfig) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  /**
   * Notify all listeners of configuration change
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try {
        listener(this.config);
      } catch (error) {
        console.error('Error in config listener:', error);
      }
    }
  }
}

// Utility functions for deep merge
function deepMerge(target: unknown, source: unknown): unknown {
  if (!isObject(target) || !isObject(source)) {
    return source;
  }
  
  const result = { ...target };
  
  for (const key in source) {
    const sourceValue = (source as JSONObject)[key];
    const targetValue = (target as JSONObject)[key];
    
    if (isObject(sourceValue)) {
      (result as JSONObject)[key] = deepMerge(targetValue || {}, sourceValue);
    } else {
      (result as JSONObject)[key] = sourceValue;
    }
  }
  
  return result;
}

// Singleton instance
let globalConfigManager: ConfigManager | null = null;

export function getConfigManager(): ConfigManager {
  if (!globalConfigManager) {
    globalConfigManager = new ConfigManager();
  }
  return globalConfigManager;
}

export function setConfigManager(manager: ConfigManager): void {
  globalConfigManager = manager;
}

export function createConfigManager(initialConfig?: Partial<AILAConfig>): ConfigManager {
  return new ConfigManager(initialConfig);
}
