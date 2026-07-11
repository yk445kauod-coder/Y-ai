/**
 * AILA - AI Life Assistant
 * AI Provider Factory
 */

import type { AIProviderType } from '../../core/config/ConfigManager.js';
import type { AIProvider, AIProviderConfig } from './base/BaseAIProvider.js';

/**
 * Provider class mapping
 */
type ProviderClass = new () => AIProvider;

/**
 * AI Provider Factory
 * Creates and manages AI provider instances
 */
export class AIProviderFactory {
  private static providers: Map<AIProviderType, ProviderClass> = new Map();
  private static instances: Map<AIProviderType, AIProvider> = new Map();
  
  /**
   * Register a provider type
   */
  static register(type: AIProviderType, providerClass: ProviderClass): void {
    if (this.providers.has(type)) {
      console.warn(`Provider ${type} is already registered. Overwriting.`);
    }
    this.providers.set(type, providerClass);
  }
  
  /**
   * Create a provider instance
   */
  static create(type: AIProviderType): AIProvider {
    // Return cached instance if available
    if (this.instances.has(type)) {
      return this.instances.get(type)!;
    }
    
    const ProviderClass = this.providers.get(type);
    
    if (!ProviderClass) {
      throw new Error(`AI provider '${type}' is not registered. Available providers: ${this.getRegisteredTypes().join(', ')}`);
    }
    
    const instance = new ProviderClass();
    this.instances.set(type, instance);
    
    return instance;
  }
  
  /**
   * Get or create a provider with configuration
   */
  static async getProvider(type: AIProviderType, config?: AIProviderConfig): Promise<AIProvider> {
    let provider = this.instances.get(type);
    
    if (!provider) {
      provider = this.create(type);
    }
    
    if (config) {
      await provider.initialize(config);
    }
    
    return provider;
  }
  
  /**
   * Get a cached provider instance
   */
  static get(type: AIProviderType): AIProvider | undefined {
    return this.instances.get(type);
  }
  
  /**
   * Check if a provider is registered
   */
  static has(type: AIProviderType): boolean {
    return this.providers.has(type);
  }
  
  /**
   * Get all registered provider types
   */
  static getRegisteredTypes(): AIProviderType[] {
    return Array.from(this.providers.keys());
  }
  
  /**
   * Get all available providers (registered types)
   */
  static getAvailableProviders(): Array<{ type: AIProviderType; name: string }> {
    return Array.from(this.providers.entries()).map(([type]) => ({
      type,
      name: this.getProviderName(type),
    }));
  }
  
  /**
   * Get provider display name
   */
  static getProviderName(type: AIProviderType): string {
    const names: Record<AIProviderType, string> = {
      groq: 'Groq',
      openai: 'OpenAI',
      gemini: 'Google Gemini',
      anthropic: 'Anthropic',
      openrouter: 'OpenRouter',
      ollama: 'Ollama',
      lmstudio: 'LM Studio',
      kimi: 'Kimi',
      minimax: 'MiniMax',
      siliconflow: 'SiliconFlow',
      togetherai: 'Together AI',
    };
    
    return names[type] || type;
  }
  
  /**
   * Get provider capabilities
   */
  static getProviderCapabilities(type: AIProviderType): AIProvider['capabilities'] | null {
    try {
      const provider = this.create(type);
      return provider.capabilities;
    } catch {
      return null;
    }
  }
  
  /**
   * Remove a provider instance
   */
  static remove(type: AIProviderType): void {
    const provider = this.instances.get(type);
    
    if (provider) {
      provider.dispose();
      this.instances.delete(type);
    }
  }
  
  /**
   * Clear all provider instances
   */
  static clear(): void {
    for (const provider of this.instances.values()) {
      provider.dispose();
    }
    this.instances.clear();
  }
}

// Provider metadata
export interface ProviderMetadata {
  type: AIProviderType;
  name: string;
  description: string;
  website: string;
  apiKeyUrl: string;
  defaultModels: string[];
  capabilities: {
    streaming: boolean;
    functionCalling: boolean;
    vision: boolean;
    embeddings: boolean;
    jsonMode: boolean;
  };
}

export const PROVIDER_METADATA: Record<AIProviderType, ProviderMetadata> = {
  groq: {
    type: 'groq',
    name: 'Groq',
    description: 'Fast AI inference with Llama models',
    website: 'https://console.groq.com',
    apiKeyUrl: 'https://console.groq.com/keys',
    defaultModels: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'],
    capabilities: {
      streaming: true,
      functionCalling: true,
      vision: false,
      embeddings: true,
      jsonMode: true,
    },
  },
  
  openai: {
    type: 'openai',
    name: 'OpenAI',
    description: 'GPT-4 and GPT-3.5 models',
    website: 'https://platform.openai.com',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    defaultModels: ['gpt-4-turbo', 'gpt-3.5-turbo'],
    capabilities: {
      streaming: true,
      functionCalling: true,
      vision: true,
      embeddings: true,
      jsonMode: true,
    },
  },
  
  gemini: {
    type: 'gemini',
    name: 'Google Gemini',
    description: 'Google\'s Gemini models',
    website: 'https://ai.google.dev',
    apiKeyUrl: 'https://makersuite.google.com/app/apikey',
    defaultModels: ['gemini-pro', 'gemini-pro-vision'],
    capabilities: {
      streaming: true,
      functionCalling: true,
      vision: true,
      embeddings: true,
      jsonMode: true,
    },
  },
  
  anthropic: {
    type: 'anthropic',
    name: 'Anthropic',
    description: 'Claude 3 models with safety focus',
    website: 'https://www.anthropic.com',
    apiKeyUrl: 'https://console.anthropic.com/settings/keys',
    defaultModels: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    capabilities: {
      streaming: true,
      functionCalling: true,
      vision: true,
      embeddings: false,
      jsonMode: false,
    },
  },
  
  openrouter: {
    type: 'openrouter',
    name: 'OpenRouter',
    description: 'Unified access to multiple AI models',
    website: 'https://openrouter.ai',
    apiKeyUrl: 'https://openrouter.ai/keys',
    defaultModels: ['anthropic/claude-3-opus', 'openai/gpt-4-turbo'],
    capabilities: {
      streaming: true,
      functionCalling: true,
      vision: true,
      embeddings: true,
      jsonMode: true,
    },
  },
  
  ollama: {
    type: 'ollama',
    name: 'Ollama',
    description: 'Local AI models',
    website: 'https://ollama.ai',
    apiKeyUrl: '',
    defaultModels: ['llama2', 'mistral', 'codellama'],
    capabilities: {
      streaming: true,
      functionCalling: false,
      vision: false,
      embeddings: true,
      jsonMode: false,
    },
  },
  
  lmstudio: {
    type: 'lmstudio',
    name: 'LM Studio',
    description: 'Local AI models via LM Studio',
    website: 'https://lmstudio.ai',
    apiKeyUrl: '',
    defaultModels: ['local-model'],
    capabilities: {
      streaming: true,
      functionCalling: false,
      vision: false,
      embeddings: true,
      jsonMode: false,
    },
  },
  
  kimi: {
    type: 'kimi',
    name: 'Kimi',
    description: 'Moonshot AI\'s Kimi models',
    website: 'https://platform.moonshot.cn',
    apiKeyUrl: 'https://platform.moonshot.cn/console/api-keys',
    defaultModels: ['kimi-chat'],
    capabilities: {
      streaming: true,
      functionCalling: true,
      vision: true,
      embeddings: true,
      jsonMode: true,
    },
  },
  
  minimax: {
    type: 'minimax',
    name: 'MiniMax',
    description: 'MiniMax AI models',
    website: 'https://www.minimax.io',
    apiKeyUrl: '',
    defaultModels: ['abab5.5-chat'],
    capabilities: {
      streaming: true,
      functionCalling: true,
      vision: true,
      embeddings: true,
      jsonMode: true,
    },
  },
  
  siliconflow: {
    type: 'siliconflow',
    name: 'SiliconFlow',
    description: 'Unified AI API',
    website: 'https://siliconflow.cn',
    apiKeyUrl: 'https://platform.siliconflow.cn',
    defaultModels: ['Qwen/Qwen2-72B-Instruct'],
    capabilities: {
      streaming: true,
      functionCalling: true,
      vision: true,
      embeddings: true,
      jsonMode: true,
    },
  },
  
  togetherai: {
    type: 'togetherai',
    name: 'Together AI',
    description: 'Open source models in the cloud',
    website: 'https://together.ai',
    apiKeyUrl: 'https://together.ai/api-keys',
    defaultModels: ['meta-llama/Llama-3-70b-chat-hf'],
    capabilities: {
      streaming: true,
      functionCalling: true,
      vision: true,
      embeddings: true,
      jsonMode: true,
    },
  },
};
