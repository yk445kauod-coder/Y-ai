/**
 * AILA - AI Life Assistant
 * Pollinations AI Provider - LLM, Image, TTS, STT
 * Free, High-Quality, Human-Level AI Services
 */

export interface PollinationsConfig {
  model?: string;
  voice?: string;
  language?: string;
  imageSize?: '1024x1024' | '1024x1792' | '1792x1024';
  imageModel?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ImageGeneration {
  url: string;
  revised_prompt?: string;
}

export interface TTSOptions {
  text: string;
  voice?: string;
  language?: string;
  speed?: number;
}

export interface STTOptions {
  audioBlob?: Blob;
  audioUrl?: string;
  language?: string;
}

export class PollinationsProvider {
  private static instance: PollinationsProvider | null = null;
  
  private readonly BASE_URL = 'https://text.pollinations.ai';
  private readonly IMAGE_URL = 'https://image.pollinations.ai/prompt';
  private readonly STT_URL = 'https://whisper.pollinations.ai';
  
  private config: PollinationsConfig = {
    model: 'openai',
    voice: 'af_heart',
    language: 'ar',
    imageSize: '1024x1024',
    imageModel: 'flux',
  };

  private constructor() {}

  static getInstance(): PollinationsProvider {
    if (!PollinationsProvider.instance) {
      PollinationsProvider.instance = new PollinationsProvider();
    }
    return PollinationsProvider.instance;
  }

  configure(config: Partial<PollinationsConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): PollinationsConfig {
    return { ...this.config };
  }

  // ==================== LLM (Chat Completion) ====================
  
  /**
   * Get available LLM models
   */
  getAvailableModels(): string[] {
    return [
      'openai',           // GPT-like model
      'anthropic',        // Claude-like model  
      'deepseek',         // DeepSeek model
      'llama',            // Llama model
      'mistral',          // Mistral model
      'qwen',             // Qwen model
      'phi',              // Phi model
      'gemma',            // Gemma model
    ];
  }

  /**
   * Chat completion with Pollinations AI
   * Free OpenAI-compatible API
   */
  async chat(
    messages: ChatMessage[],
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      seed?: number;
      jsonMode?: boolean;
    }
  ): Promise<string> {
    const model = options?.model || this.config.model || 'openai';
    const temperature = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens ?? 4096;

    const formattedMessages = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    const params = new URLSearchParams({
      model,
      messages: JSON.stringify(formattedMessages),
      temperature: temperature.toString(),
      max_tokens: maxTokens.toString(),
      jsonMode: options?.jsonMode ? 'true' : 'false',
    });

    if (options?.seed) {
      params.set('seed', options.seed.toString());
    }

    try {
      const response = await fetch(`${this.BASE_URL}/?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream',
        },
      });

      if (!response.ok) {
        throw new Error(`Pollinations API error: ${response.status}`);
      }

      const text = await response.text();
      return text.trim();
    } catch (error) {
      console.error('Pollinations chat error:', error);
      throw error;
    }
  }

  /**
   * Simple text generation
   */
  async generate(prompt: string, options?: { model?: string; temperature?: number }): Promise<string> {
    return this.chat([
      { role: 'user', content: prompt }
    ], options);
  }

  // ==================== Image Generation ====================

  /**
   * Generate image using Pollinations
   * Supports multiple models: flux, turbo, any
   */
  async generateImage(
    prompt: string,
    options?: {
      model?: string;
      width?: number;
      height?: number;
      seed?: number;
      nologo?: boolean;
      enhance?: boolean;
    }
  ): Promise<string> {
    const model = options?.model || this.config.imageModel || 'flux';
    const width = options?.width || 1024;
    const height = options?.height || 1024;

    const params = new URLSearchParams({
      prompt,
      model,
      width: width.toString(),
      height: height.toString(),
    });

    if (options?.seed) {
      params.set('seed', options.seed.toString());
    }

    if (options?.nologo) {
      params.set('nologo', 'true');
    }

    if (options?.enhance) {
      params.set('enhance', 'true');
    }

    return `${this.IMAGE_URL}/${encodeURIComponent(prompt)}?${params}`;
  }

  /**
   * Generate image with specific style
   */
  async generateStyledImage(
    prompt: string,
    style: 'realistic' | 'anime' | 'artistic' | '3d' | 'abstract',
    options?: { width?: number; height?: number }
  ): Promise<string> {
    const styledPrompt = this.applyStyle(prompt, style);
    return this.generateImage(styledPrompt, {
      width: options?.width,
      height: options?.height,
      enhance: true,
    });
  }

  private applyStyle(prompt: string, style: string): string {
    const stylePrompts: Record<string, string> = {
      realistic: 'photorealistic, hyperrealistic, 8k, ultra detailed',
      anime: 'anime style, manga, vibrant colors, detailed',
      artistic: 'artistic painting, masterpiece, fine art',
      '3d': '3D render, Pixar style, volumetric lighting',
      abstract: 'abstract art, geometric, colorful composition',
    };
    
    return `${prompt}, ${stylePrompts[style] || ''}`;
  }

  // ==================== TTS (Text-to-Speech) ====================

  /**
   * Available TTS voices
   * High quality, human-level voices
   */
  getAvailableVoices(): Array<{ id: string; name: string; gender: string; language: string }> {
    return [
      // Arabic / Egyptian voices
      { id: 'af_heart', name: 'Heart', gender: 'female', language: 'ar-EG' },
      { id: 'af_bella', name: 'Bella', gender: 'female', language: 'ar-SA' },
      { id: 'af_nicole', name: 'Nicole', gender: 'female', language: 'ar' },
      { id: 'af_sarah', name: 'Sarah', gender: 'female', language: 'ar-EG' },
      
      // Male Arabic voices
      { id: 'am_adam', name: 'Adam', gender: 'male', language: 'ar' },
      { id: 'am_michael', name: 'Michael', gender: 'male', language: 'ar-EG' },
      { id: 'am_saleh', name: 'Saleh', gender: 'male', language: 'ar-SA' },
      
      // English voices
      { id: 'af_sky', name: 'Sky', gender: 'female', language: 'en-US' },
      { id: 'af_nova', name: 'Nova', gender: 'female', language: 'en-US' },
      { id: 'af_alloy', name: 'Alloy', gender: 'female', language: 'en-US' },
      { id: 'am_eric', name: 'Eric', gender: 'male', language: 'en-US' },
      { id: 'am_onyx', name: 'Onyx', gender: 'male', language: 'en-US' },
      { id: 'am_alex', name: 'Alex', gender: 'male', language: 'en-US' },
      
      // Multilingual
      { id: 'af_samantha', name: 'Samantha', gender: 'female', language: 'multilingual' },
      { id: 'af_ava', name: 'Ava', gender: 'female', language: 'multilingual' },
    ];
  }

  /**
   * Convert text to speech
   * Returns audio URL
   */
  async textToSpeech(
    text: string,
    options?: {
      voice?: string;
      language?: string;
      speed?: number;
    }
  ): Promise<string> {
    const voice = options?.voice || this.config.voice || 'af_heart';
    const speed = options?.speed ?? 1.0;
    const language = options?.language || this.config.language || 'ar';

    const encodedText = encodeURIComponent(text);
    return `${this.BASE_URL}/${encodedText}?voice=${voice}&language=${language}&speed=${speed}`;
  }

  /**
   * Play TTS audio
   */
  async speak(text: string, options?: { voice?: string; language?: string; speed?: number }): Promise<void> {
    const url = await this.textToSpeech(text, options);
    const audio = new Audio(url);
    await audio.play();
  }

  // ==================== STT (Speech-to-Text) ====================

  /**
   * Convert speech to text
   * Uses Whisper model via Pollinations
   */
  async speechToText(options: {
    audioBlob?: Blob;
    audioUrl?: string;
    language?: string;
    model?: string;
  }): Promise<string> {
    const language = options?.language || this.config.language || 'ar';
    const model = options?.model || 'small';

    try {
      let audioData: ArrayBuffer;

      if (options.audioBlob) {
        audioData = await options.audioBlob.arrayBuffer();
      } else if (options.audioUrl) {
        const response = await fetch(options.audioUrl);
        audioData = await response.arrayBuffer();
      } else {
        throw new Error('No audio source provided');
      }

      const formData = new FormData();
      formData.append('audio', new Blob([audioData], { type: 'audio/webm' }));
      formData.append('model', model);
      if (language) {
        formData.append('language', language);
      }

      const response = await fetch(this.STT_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`STT API error: ${response.status}`);
      }

      const result = await response.json();
      return result.text || result.transcription || '';
    } catch (error) {
      console.error('Speech to text error:', error);
      throw error;
    }
  }

  /**
   * Real-time speech recognition
   */
  createSTTStream(options?: {
    language?: string;
    onTranscript?: (text: string, isFinal: boolean) => void;
    onError?: (error: Error) => void;
  }): { start: () => void; stop: () => void } {
    let mediaRecorder: MediaRecorder | null = null;
    let stream: MediaStream | null = null;
    let isRecording = false;

    return {
      start: async () => {
        if (isRecording) return;

        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaRecorder = new MediaRecorder(stream, {
            mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
          });

          const audioChunks: Blob[] = [];

          mediaRecorder.ondataavailable = async (event) => {
            if (event.data.size > 0) {
              audioChunks.push(event.data);
              
              if (audioChunks.length >= 2) {
                const audioBlob = new Blob(audioChunks.slice(-2), { type: audioChunks[0].type });
                try {
                  const text = await this.speechToText({ 
                    audioBlob,
                    language: options?.language 
                  });
                  options?.onTranscript?.(text, false);
                } catch (e) {
                  // Ignore errors during streaming
                }
              }
            }
          };

          mediaRecorder.onerror = () => {
            options?.onError?.(new Error('MediaRecorder error'));
          };

          mediaRecorder.start(5000);
          isRecording = true;
        } catch (error) {
          options?.onError?.(error as Error);
        }
      },

      stop: () => {
        if (mediaRecorder && isRecording) {
          mediaRecorder.stop();
          isRecording = false;
        }
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          stream = null;
        }
      },
    };
  }

  // ==================== Vision (Image Analysis) ====================

  /**
   * Analyze image using vision model
   */
  async analyzeImage(
    imageUrl: string,
    prompt: string,
    options?: {
      model?: string;
      detail?: 'low' | 'high' | 'auto';
    }
  ): Promise<string> {
    const model = options?.model || 'llama';

    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: `Analyze this image and answer: ${prompt}\n\n[Image: ${imageUrl}]`,
      },
    ];

    return this.chat(messages, { model });
  }

  // ==================== Embeddings ====================

  /**
   * Generate text embeddings
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const words = text.toLowerCase().split(/\s+/);
    const wordFreq: Record<string, number> = {};
    
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    const embedding = new Array(384).fill(0);
    const vocab = Object.keys(wordFreq);
    
    vocab.forEach((word, i) => {
      const index = Math.abs(this.hashString(word)) % 384;
      embedding[index] += wordFreq[word] * Math.sin(i + word.length);
    });

    const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
    return embedding.map(v => magnitude > 0 ? v / magnitude : 0);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }

  // ==================== Utilities ====================

  /**
   * Check API health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export singleton
export const pollinations = PollinationsProvider.getInstance();
