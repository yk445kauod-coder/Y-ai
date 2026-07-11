/**
 * AILA - AI Life Assistant
 * Groq AI Provider
 */

import { BaseAIProvider, type AIProviderConfig, type AIPrompt, type AIResponse, type AIStreamChunk } from '../base/BaseAIProvider.js';

/**
 * Groq Provider capabilities
 */
const GROQ_CAPABILITIES = {
  streaming: true,
  functionCalling: true,
  vision: false,
  embeddings: true,
  jsonMode: true,
  maxContextLength: 128000,
};

/**
 * Groq API endpoints
 */
const GROQ_ENDPOINTS = {
  chat: '/chat/completions',
  embeddings: '/embeddings',
};

/**
 * Default model
 */
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

/**
 * Groq API Response types
 */
interface GroqChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: GroqChoice[];
  usage: GroqUsage;
}

interface GroqChoice {
  index: number;
  message: {
    role: string;
    content: string | null;
    tool_calls?: Array<{
      id: string;
      type: string;
      function: {
        name: string;
        arguments: string;
      };
    }>;
  };
  finish_reason: string;
}

interface GroqUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface GroqEmbeddingResponse {
  object: string;
  data: Array<{
    object: string;
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

/**
 * Groq AI Provider
 */
export class GroqProvider extends BaseAIProvider {
  readonly id = 'groq';
  readonly name = 'Groq';
  readonly capabilities = GROQ_CAPABILITIES;
  
  private baseUrl = 'https://api.groq.com/openai/v1';
  private model = DEFAULT_MODEL;
  
  /**
   * Initialize the Groq provider
   */
  async initialize(config: AIProviderConfig): Promise<void> {
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl.replace(/\/$/, '');
    }
    
    if (config.apiKey) {
      this.config.apiKey = config.apiKey;
    }
    
    if (config.model) {
      this.model = config.model;
    }
    
    this.config = {
      ...this.config,
      ...config,
    };
    
    this.validateConfig();
    this.initialized = true;
  }
  
  /**
   * Get default model
   */
  protected getDefaultModel(): string {
    return DEFAULT_MODEL;
  }
  
  /**
   * Get base URL
   */
  protected getBaseUrl(): string {
    return this.baseUrl;
  }
  
  /**
   * Complete a prompt
   */
  async complete(prompt: AIPrompt): Promise<AIResponse> {
    const mergedPrompt = this.mergePromptSettings(prompt);
    const body = this.createRequestBody(mergedPrompt);
    
    const response = await fetch(`${this.baseUrl}${GROQ_ENDPOINTS.chat}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(`Groq API error: ${error.error?.message || response.statusText}`);
    }
    
    const data = await response.json() as GroqChatResponse;
    return this.parseResponse(data);
  }
  
  /**
   * Stream a completion
   */
  async *stream(prompt: AIPrompt): AsyncGenerator<AIStreamChunk> {
    const mergedPrompt = this.mergePromptSettings(prompt);
    const body = this.createRequestBody(mergedPrompt);
    
    const response = await fetch(`${this.baseUrl}${GROQ_ENDPOINTS.chat}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...body,
        stream: true,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(`Groq API error: ${error.error?.message || response.statusText}`);
    }
    
    if (!response.body) {
      throw new Error('Response body is null');
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonData = line.slice(6).trim();
            if (jsonData === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(jsonData);
              yield this.parseStreamChunk(parsed);
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
  
  /**
   * Generate embeddings
   */
  async embeddings(text: string | string[]): Promise<number[][]> {
    const texts = Array.isArray(text) ? text : [text];
    
    const response = await fetch(`${this.baseUrl}${GROQ_ENDPOINTS.embeddings}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: texts,
        model: 'llama-3.3-70b-versatile',
      }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(`Groq API error: ${error.error?.message || response.statusText}`);
    }
    
    const data = await response.json() as GroqEmbeddingResponse;
    return data.data.map((d) => d.embedding);
  }
  
  /**
   * Create request body for chat completion
   */
  protected createRequestBody(prompt: AIPrompt): Record<string, unknown> {
    const messages = [...prompt.messages];
    
    // Add system message if provided
    if (prompt.system) {
      messages.unshift({
        role: 'system',
        content: prompt.system,
      });
    }
    
    return {
      model: this.model,
      messages,
      temperature: prompt.temperature,
      max_tokens: prompt.maxTokens,
      top_p: prompt.topP,
      stop: prompt.stop,
      tools: prompt.tools?.map((tool) => ({
        type: tool.type,
        function: {
          name: tool.function.name,
          description: tool.function.description,
          parameters: tool.function.parameters,
        },
      })),
      stream: false,
    };
  }
  
  /**
   * Parse response from Groq API
   */
  protected parseResponse(data: GroqChatResponse): AIResponse {
    return {
      id: data.id,
      model: data.model,
      choices: data.choices.map((choice) => ({
        index: choice.index,
        message: {
          role: choice.message.role as 'system' | 'user' | 'assistant' | 'tool',
          content: choice.message.content || '',
          toolCalls: choice.message.tool_calls?.map((tc) => ({
            id: tc.id,
            type: tc.type as 'function',
            function: {
              name: tc.function.name,
              arguments: tc.function.arguments,
            },
          })),
        },
        finishReason: choice.finish_reason as 'stop' | 'length' | 'tool_calls' | 'content_filter' | null,
      })),
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
      created: data.created,
      provider: this.id,
    };
  }
  
  /**
   * Parse streaming chunk from Groq API
   */
  protected parseStreamChunk(data: Record<string, unknown>): AIStreamChunk {
    const choices = (data.choices as Array<Record<string, unknown>> || []).map((choice) => {
      const delta = choice.delta as Record<string, unknown> || {};
      return {
        index: choice.index as number,
        delta: {
          role: delta.role as 'system' | 'user' | 'assistant' | 'tool' | undefined,
          content: delta.content as string | undefined,
        },
        finishReason: choice.finish_reason as 'stop' | 'length' | 'tool_calls' | 'content_filter' | null,
      };
    });
    
    return {
      id: data.id as string,
      model: data.model as string,
      choices,
      provider: this.id,
    };
  }
  
  /**
   * Validate configuration
   */
  protected validateConfig(): void {
    if (!this.config.apiKey) {
      throw new Error('Groq API key is required');
    }
  }
}

// Register the provider
import { AIProviderFactory } from '../ProviderFactory.js';
AIProviderFactory.register('groq', GroqProvider);
