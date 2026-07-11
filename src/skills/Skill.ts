/**
 * AILA - AI Life Assistant
 * Skills System - Core Definitions
 */

import type { JSONSchema } from '../types/index.js';

/**
 * Skill Category
 */
export type SkillCategory =
  | 'coding'
  | 'research'
  | 'communication'
  | 'automation'
  | 'analysis'
  | 'creative'
  | 'iot'
  | 'security'
  | 'productivity'
  | 'custom';

/**
 * Skill Priority
 */
export type SkillPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Skill Status
 */
export type SkillStatus = 'active' | 'inactive' | 'beta' | 'deprecated';

/**
 * Skill Input Schema
 */
export interface SkillInput {
  name: string;
  type: string;
  description?: string;
  required: boolean;
  default?: unknown;
  schema?: JSONSchema;
}

/**
 * Skill Output Schema
 */
export interface SkillOutput {
  name: string;
  type: string;
  description?: string;
}

/**
 * Skill Tool Requirement
 */
export interface SkillToolRequirement {
  toolId: string;
  required: boolean;
  optional?: boolean;
}

/**
 * Skill Execution Context
 */
export interface SkillExecutionContext {
  skillId: string;
  input: Record<string, unknown>;
  userId?: string;
  sessionId: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

/**
 * Skill Execution Result
 */
export interface SkillExecutionResult {
  success: boolean;
  output?: unknown;
  error?: string;
  executionTime: number;
  toolsUsed: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Skill Example
 */
export interface SkillExample {
  input: Record<string, unknown>;
  output: unknown;
  description?: string;
}

/**
 * Skill Version
 */
export interface SkillVersion {
  version: string;
  changelog: string;
  releaseDate: number;
  breaking?: boolean;
}

/**
 * Skill Metadata
 */
export interface SkillMetadata {
  author?: string;
  homepage?: string;
  repository?: string;
  license?: string;
  tags?: string[];
  languages?: string[];
  useCases?: string[];
  limitations?: string[];
  troubleshooting?: string[];
}

/**
 * Skill - Main Interface
 */
export interface Skill {
  /** Unique identifier */
  readonly id: string;
  
  /** Display name */
  readonly name: string;
  
  /** Detailed description */
  readonly description: string;
  
  /** Category */
  readonly category: SkillCategory;
  
  /** Version */
  readonly version: string;
  
  /** Status */
  readonly status: SkillStatus;
  
  /** Priority */
  priority: SkillPriority;
  
  /** Input schema */
  readonly inputSchema: SkillInput[];
  
  /** Output schema */
  readonly outputSchema: SkillOutput[];
  
  /** Required tools */
  readonly requiredTools: SkillToolRequirement[];
  
  /** Examples */
  readonly examples: SkillExample[];
  
  /** Version history */
  readonly versions: SkillVersion[];
  
  /** Metadata */
  readonly metadata?: SkillMetadata;
  
  /** Initialize the skill */
  initialize(): Promise<void>;
  
  /** Execute the skill */
  execute(context: SkillExecutionContext): Promise<SkillExecutionResult>;
  
  /** Validate input */
  validateInput(input: Record<string, unknown>): { valid: boolean; errors?: string[] };
  
  /** Get skill capabilities */
  getCapabilities(): SkillCapabilities;
  
  /** Cleanup resources */
  dispose(): Promise<void>;
}

/**
 * Skill Capabilities
 */
export interface SkillCapabilities {
  streaming: boolean;
  batch: boolean;
  parallel: boolean;
  offline: boolean;
  realtime: boolean;
}

/**
 * Skill Registry Entry
 */
export interface SkillRegistryEntry {
  skill: Skill;
  enabled: boolean;
  usageCount: number;
  lastUsed?: number;
  successRate: number;
}

/**
 * Skill Manifest - for plugin-based skills
 */
export interface SkillManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  category: SkillCategory;
  main: string;
  icon?: string;
  permissions?: string[];
  dependencies?: Record<string, string>;
  minAilaVersion?: string;
}

/**
 * Skill Configuration
 */
export interface SkillConfig {
  enabled: boolean;
  priority: SkillPriority;
  rateLimit?: {
    maxCalls: number;
    windowMs: number;
  };
  timeout?: number;
  retryPolicy?: RetryPolicy;
}

/**
 * Retry Policy
 */
export interface RetryPolicy {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

/**
 * Skill Statistics
 */
export interface SkillStatistics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  lastExecution?: number;
  usageByDay: Record<string, number>;
}
