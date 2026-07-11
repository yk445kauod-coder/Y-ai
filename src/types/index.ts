/**
 * AILA - AI Life Assistant
 * Common Types and Interfaces
 */

// UUID type
export type UUID = string;

// Date string in ISO 8601 format
export type DateString = string;

// JSON types
export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONValue[] | { [key: string]: JSONValue };
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];

// JSON Schema type
export interface JSONSchema {
  type?: string;
  properties?: Record<string, JSONSchema>;
  items?: JSONSchema | JSONSchema[];
  required?: string[];
  enum?: JSONValue[];
  const?: JSONValue;
  default?: JSONValue;
  description?: string;
  format?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

// Result type for error handling
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Maybe type
export type Maybe<T> = T | null | undefined;

// Promise that resolves to Result
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

// Event Types
export interface AILAEvent<T = unknown> {
  readonly id: UUID;
  readonly type: string;
  readonly timestamp: number;
  readonly source: string;
  readonly payload: T;
  readonly metadata?: Record<string, unknown>;
}

export type EventHandler<T = unknown> = (event: AILAEvent<T>) => void | Promise<void>;
export type AsyncEventHandler<T = unknown> = (event: AILAEvent<T>) => Promise<void>;

export interface Subscription {
  readonly id: UUID;
  readonly eventType: string;
  unsubscribe(): void;
}

// Module interface
export interface IModule {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  
  initialize(): Promise<void>;
  dispose(): Promise<void>;
}

// Service interface
export interface IService extends IModule {
  readonly status: ServiceStatus;
  start(): Promise<void>;
  stop(): Promise<void>;
  restart(): Promise<void>;
}

export type ServiceStatus = 
  | 'uninitialized'
  | 'initializing'
  | 'running'
  | 'stopping'
  | 'stopped'
  | 'error';

// Config types
export interface ConfigSchema {
  [key: string]: JSONSchema;
}

// Logger types
export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  levelName: string;
  message: string;
  context?: string;
  data?: unknown;
  stack?: string;
}

export interface LogTransport {
  name: string;
  write(entry: LogEntry): void | Promise<void>;
  flush?(): void | Promise<void>;
}

// Storage types
export interface StorageOptions {
  encrypted?: boolean;
  compressed?: boolean;
  ttl?: number;
}

export interface StorageItem<T = unknown> {
  key: string;
  value: T;
  metadata?: {
    created?: number;
    updated?: number;
    expires?: number;
    size?: number;
    encrypted?: boolean;
  };
}

// Error types
export class AILAError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AILAError';
  }
}

export const ERROR_CODES = {
  // Core Errors (1000-1999)
  INITIALIZATION_FAILED: 'AILA_1000',
  CONFIG_INVALID: 'AILA_1001',
  MODULE_NOT_FOUND: 'AILA_1002',
  SERVICE_NOT_STARTED: 'AILA_1003',
  
  // AI Errors (2000-2999)
  AI_PROVIDER_ERROR: 'AILA_2000',
  AI_RATE_LIMIT: 'AILA_2001',
  AI_INVALID_RESPONSE: 'AILA_2002',
  AI_TIMEOUT: 'AILA_2003',
  
  // Memory Errors (3000-3999)
  MEMORY_STORAGE_ERROR: 'AILA_3000',
  MEMORY_RETRIEVAL_ERROR: 'AILA_3001',
  MEMORY_NOT_FOUND: 'AILA_3002',
  
  // Voice Errors (4000-4999)
  VOICE_NOT_AVAILABLE: 'AILA_4000',
  MICROPHONE_ERROR: 'AILA_4001',
  WAKE_WORD_ERROR: 'AILA_4002',
  TTS_ERROR: 'AILA_4003',
  STT_ERROR: 'AILA_4004',
  
  // Security Errors (5000-5999)
  SECURITY_VERIFICATION_FAILED: 'AILA_5000',
  AUTHENTICATION_REQUIRED: 'AILA_5001',
  AUTHORIZATION_DENIED: 'AILA_5002',
  IDENTITY_NOT_FOUND: 'AILA_5003',
  
  // Tool Errors (6000-6999)
  TOOL_NOT_FOUND: 'AILA_6000',
  TOOL_EXECUTION_ERROR: 'AILA_6001',
  TOOL_TIMEOUT: 'AILA_6002',
  TOOL_INVALID_INPUT: 'AILA_6003',
  
  // IoT Errors (7000-7999)
  DEVICE_NOT_FOUND: 'AILA_7000',
  DEVICE_CONNECTION_ERROR: 'AILA_7001',
  DEVICE_TIMEOUT: 'AILA_7002',
  PROTOCOL_ERROR: 'AILA_7003',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// Events
export const AILA_EVENTS = {
  // Core Events
  READY: 'aila:ready',
  ERROR: 'aila:error',
  INITIALIZED: 'aila:initialized',
  DISPOSED: 'aila:disposed',
  
  // Chat Events
  MESSAGE_SENT: 'chat:message-sent',
  MESSAGE_RECEIVED: 'chat:message-received',
  STREAM_START: 'chat:stream-start',
  STREAM_CHUNK: 'chat:stream-chunk',
  STREAM_END: 'chat:stream-end',
  
  // Voice Events
  WAKE_WORD_DETECTED: 'voice:wake-word',
  SPEECH_START: 'voice:speech-start',
  SPEECH_END: 'voice:speech-end',
  TRANSCRIPTION: 'voice:transcription',
  TTS_START: 'voice:tts-start',
  TTS_END: 'voice:tts-end',
  
  // Security Events
  SECURITY_VERIFIED: 'security:verified',
  SECURITY_FAILED: 'security:failed',
  IDENTITY_ENROLLED: 'security:identity-enrolled',
  IDENTITY_REMOVED: 'security:identity-removed',
  
  // Memory Events
  MEMORY_STORED: 'memory:stored',
  MEMORY_RETRIEVED: 'memory:retrieved',
  MEMORY_UPDATED: 'memory:updated',
  MEMORY_DELETED: 'memory:deleted',
  MEMORY_ARCHIVED: 'memory:archived',
  
  // Tool Events
  TOOL_EXECUTING: 'tool:executing',
  TOOL_EXECUTED: 'tool:executed',
  TOOL_ERROR: 'tool:error',
  
  // IoT Events
  DEVICE_DISCOVERED: 'iot:device-discovered',
  DEVICE_CONNECTED: 'iot:device-connected',
  DEVICE_DISCONNECTED: 'iot:device-disconnected',
  DEVICE_DATA: 'iot:device-data',
  DEVICE_ERROR: 'iot:device-error',
  
  // UI Events
  THEME_CHANGED: 'ui:theme-changed',
  LOCALE_CHANGED: 'ui:locale-changed',
  DIRECTION_CHANGED: 'ui:direction-changed',
  
  // Plugin Events
  PLUGIN_INSTALLED: 'plugin:installed',
  PLUGIN_UNINSTALLED: 'plugin:uninstalled',
  PLUGIN_ENABLED: 'plugin:enabled',
  PLUGIN_DISABLED: 'plugin:disabled',
  PLUGIN_ERROR: 'plugin:error',
} as const;

export type AILAEventType = typeof AILA_EVENTS[keyof typeof AILA_EVENTS];
