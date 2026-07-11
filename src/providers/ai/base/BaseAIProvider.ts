/**
 * AILA - AI Life Assistant
 * Base AI Provider
 */

import type { JSONSchema } from '../../../types/index.js';

/**
 * AI Provider configuration
 */
export interface AIProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  stop?: string[];
  timeout?: number;
}

/**
 * AI Message role
 */
export type AIMessageRole = 'system' | 'user' | 'assistant' | 'tool';

/**
 * AI Message content
 */
export interface AIMessageContent {
  type: 'text' | 'image' | 'audio';
  text?: string;
  image?: string;
  audio?: string;
}

/**
 * AI Tool call
 */
export interface AIToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

/**
 * AI Message
 */
export interface AIMessage {
  role: AIMessageRole;
  content: string | AIMessageContent[];
  name?: string;
  toolCalls?: AIToolCall[];
  toolCallId?: string;
}

/**
 * AI Tool definition
 */
export interface AITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: JSONSchema;
  };
}

/**
 * AI Prompt
 */
export interface AIPrompt {
  messages: AIMessage[];
  system?: string;
  tools?: AITool[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stop?: string[];
}

/**
 * AI Response
 */
export interface AIResponse {
  id: string;
  model: string;
  choices: AIChoice[];
  usage?: AIUsage;
  created: number;
  provider: string;
}

export interface AIChoice {
  index: number;
  message: AIMessage;
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
}

/**
 * AI Usage statistics
 */
export interface AIUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * AI Stream chunk
 */
export interface AIStreamChunk {
  id: string;
  model: string;
  choices: AIStreamChoice[];
  provider: string;
}

export interface AIStreamChoice {
  index: number;
  delta: Partial<AIMessage>;
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
}

/**
 * AI Provider capabilities
 */
export interface AICapabilities {
  streaming: boolean;
  functionCalling: boolean;
  vision: boolean;
  embeddings: boolean;
  jsonMode: boolean;
  maxContextLength: number;
}

/**
 * AI Provider interface
 */
export interface AIProvider {
  /** Provider ID */
  readonly id: string;
  
  /** Provider display name */
  readonly name: string;
  
  /** Provider capabilities */
  readonly capabilities: AICapabilities;
  
  /** Whether the provider is initialized */
  readonly isInitialized: boolean;
  
  /** Initialize the provider with configuration */
  initialize(config: AIProviderConfig): Promise<void>;
  
  /** Complete a prompt */
  complete(prompt: AIPrompt): Promise<AIResponse>;
  
  /** Stream a completion */
  stream(prompt: AIPrompt): AsyncGenerator<AIStreamChunk>;
  
  /** Generate embeddings */
  embeddings(text: string | string[]): Promise<number[][]>;
  
  /** Dispose of the provider */
  dispose(): Promise<void>;
}

/**
 * Base AI Provider abstract class
 */
export abstract class BaseAIProvider implements AIProvider {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly capabilities: AICapabilities;
  
  protected config: AIProviderConfig = {};
  protected initialized = false;
  
  get isInitialized(): boolean {
    return this.initialized;
  }
  
  abstract initialize(config: AIProviderConfig): Promise<void>;
  
  abstract complete(prompt: AIPrompt): Promise<AIResponse>;
  
  abstract stream(prompt: AIPrompt): AsyncGenerator<AIStreamChunk>;
  
  abstract embeddings(text: string | string[]): Promise<number[][]>;
  
  dispose(): Promise<void> {
    this.initialized = false;
    this.config = {};
    return Promise.resolve();
  }
  
  /**
   * Get default model for this provider
   */
  protected abstract getDefaultModel(): string;
  
  /**
   * Get base URL for API calls
   */
  protected abstract getBaseUrl(): string;
  
  /**
   * Validate configuration
   */
  protected validateConfig(): void {
    if (!this.config.apiKey && !this.config.baseUrl) {
      throw new Error(`Provider ${this.id} requires an API key or base URL`);
    }
  }
  
  /**
   * Merge prompt with default settings
   */
  protected mergePromptSettings(prompt: AIPrompt): AIPrompt {
    return {
      ...prompt,
      temperature: prompt.temperature ?? this.config.temperature ?? 0.7,
      maxTokens: prompt.maxTokens ?? this.config.maxTokens ?? 4096,
      topP: prompt.topP ?? this.config.topP,
      stop: prompt.stop ?? this.config.stop,
    };
  }
  
  /**
   * Create a completion request body
   */
  protected abstract createRequestBody(prompt: AIPrompt): Record<string, unknown>;
  
  /**
   * Parse a completion response
   */
  protected abstract parseResponse(response: unknown): AIResponse;
  
  /**
   * Parse a streaming chunk
   */
  protected abstract parseStreamChunk(chunk: unknown): AIStreamChunk;
}

/**
 * Default capabilities for providers
 */
export const DEFAULT_CAPABILITIES: AICapabilities = {
  streaming: true,
  functionCalling: true,
  vision: false,
  embeddings: true,
  jsonMode: true,
  maxContextLength: 128000,
};
