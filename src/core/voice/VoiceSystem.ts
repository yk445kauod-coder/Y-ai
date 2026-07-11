/**
 * AILA - AI Life Assistant
 * Advanced Voice System (TTS/STT) with Pollinations API Fallback
 */

export interface VoiceConfig {
  ttsProvider: 'pollinations' | 'elevenlabs' | 'web_speech';
  sttProvider: 'pollinations' | 'web_speech';
  polliTionsVoice?: string;
  elevenlabsVoiceId?: string;
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export interface VoiceCapabilities {
  tts: boolean;
  stt: boolean;
  wakeWord: boolean;
  continuousStt: boolean;
}

export interface AudioLevelCallback {
  (level: number): void;
}

export class VoiceSystem {
  private static instance: VoiceSystem | null = null;
  private config: VoiceConfig = {
    ttsProvider: 'pollinations',
    sttProvider: 'pollinations',
    language: 'ar',
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
  };
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private isListening = false;
  private isSpeaking = false;
  private wakeWordCallback: (() => void) | null = null;
  private onAudioLevel: AudioLevelCallback | null = null;
  private recognition: SpeechRecognition | null = null;
  private animationFrameId: number | null = null;

  private constructor() {}

  static getInstance(): VoiceSystem {
    if (!VoiceSystem.instance) {
      VoiceSystem.instance = new VoiceSystem();
    }
    return VoiceSystem.instance;
  }

  async initialize(): Promise<VoiceCapabilities> {
    const capabilities: VoiceCapabilities = {
      tts: false,
      stt: false,
      wakeWord: false,
      continuousStt: false,
    };

    // Check TTS capabilities
    capabilities.tts = await this.checkTTSCapabilities();

    // Check STT capabilities
    capabilities.stt = await this.checkSTTCapabilities();

    // Initialize audio context
    try {
      this.audioContext = new AudioContext();
    } catch {
      console.warn('Web Audio API not available');
    }

    return capabilities;
  }

  private async checkTTSCapabilities(): Promise<boolean> {
    // Check for Web Speech API
    if ('speechSynthesis' in window) {
      return true;
    }
    // Pollinations TTS always available via fetch
    return true;
  }

  private async checkSTTCapabilities(): Promise<boolean> {
    // Check for Web Speech API
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    return !!SpeechRecognitionAPI;
  }

  configure(config: Partial<VoiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): VoiceConfig {
    return { ...this.config };
  }

  // ============ TTS (Text-to-Speech) ============

  async speak(text: string, options?: { interrupt?: boolean }): Promise<void> {
    if (options?.interrupt) {
      this.stop();
    }

    if (this.isSpeaking) {
      await this.waitForSpeakingEnd();
    }

    this.isSpeaking = true;

    try {
      switch (this.config.ttsProvider) {
        case 'pollinations':
          await this.pollinationsTTS(text);
          break;
        case 'elevenlabs':
          await this.elevenlabsTTS(text);
          break;
        case 'web_speech':
        default:
          await this.webSpeechTTS(text);
      }
    } finally {
      this.isSpeaking = false;
    }
  }

  private async polliTionsTTS(text: string): Promise<void> {
    // Using Pollinations TTS API - free and high quality
    const encodedText = encodeURIComponent(text);
    const voice = this.config.polliTionsVoice || 'af_heart'; // Female Arabic voice
    const url = `https://text.pollinations.ai/${encodedText}?voice=${voice}&language=${this.config.language || 'ar'}`;
    
    const audio = new Audio(url);
    
    return new Promise((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = (e) => reject(e);
      audio.play().catch(reject);
    });
  }

  private async elevenlabsTTS(text: string): Promise<void> {
    const voiceId = this.config.elevenlabsVoiceId;
    if (!voiceId) {
      console.warn('ElevenLabs voice ID not configured, falling back to Pollinations');
      return this.pollinationsTTS(text);
    }

    const apiKey = localStorage.getItem('elevenlabs_api_key');
    if (!apiKey) {
      console.warn('ElevenLabs API key not configured, falling back to Pollinations');
      return this.pollinationsTTS(text);
    }

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) throw new Error('ElevenLabs API error');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(url);
          resolve();
        };
        audio.onerror = (e) => reject(e);
        audio.play().catch(reject);
      });
    } catch (error) {
      console.error('ElevenLabs TTS failed, falling back to Pollinations:', error);
      return this.pollinationsTTS(text);
    }
  }

  private async webSpeechTTS(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Web Speech API not available'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.config.language || 'ar-SA';
      utterance.rate = this.config.rate || 1.0;
      utterance.pitch = this.config.pitch || 1.0;
      utterance.volume = this.config.volume || 1.0;

      // Try to find Arabic voice
      const voices = speechSynthesis.getVoices();
      const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(e);

      speechSynthesis.speak(utterance);
    });
  }

  stop(): void {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    this.isSpeaking = false;
  }

  isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  private async waitForSpeakingEnd(): Promise<void> {
    return new Promise(resolve => {
      const check = () => {
        if (!this.isSpeaking) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }

  // ============ STT (Speech-to-Text) ============

  async startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    if (this.isListening) return;

    switch (this.config.sttProvider) {
      case 'pollinations':
        await this.pollinationsSTT(onResult, onError);
        break;
      case 'web_speech':
      default:
        await this.webSpeechSTT(onResult, onError);
    }
  }

  private async polliTionsSTT(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    // Using Web Speech API as fallback for STT (Polinations doesn't have STT API)
    // This is a limitation - we use Web Speech API for STT
    await this.webSpeechSTT(onResult, onError);
  }

  private async webSpeechSTT(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      onError?.(new Error('Speech Recognition not available'));
      return;
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio analysis for level monitoring
      if (this.audioContext) {
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        source.connect(this.analyser);
        this.startAudioLevelMonitoring();
      }

      this.recognition = new SpeechRecognitionAPI();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = this.config.language === 'en' ? 'en-US' : 'ar-SA';

      this.recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (interimTranscript) {
          onResult(interimTranscript, false);
        }
        if (finalTranscript) {
          onResult(finalTranscript, true);
        }
      };

      this.recognition.onerror = (event) => {
        if (event.error !== 'no-speech') {
          onError?.(new Error(event.error));
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.stopAudioLevelMonitoring();
      };

      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      onError?.(error as Error);
    }
  }

  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    this.isListening = false;
    this.stopAudioLevelMonitoring();
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  // ============ Audio Level Monitoring ============

  private startAudioLevelMonitoring(): void {
    if (!this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const updateLevel = () => {
      if (!this.analyser || !this.isListening) return;

      this.analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const normalizedLevel = Math.min(average / 128, 1);
      
      this.onAudioLevel?.(normalizedLevel);

      this.animationFrameId = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  }

  private stopAudioLevelMonitoring(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.onAudioLevel?.(0);
  }

  setAudioLevelCallback(callback: AudioLevelCallback): void {
    this.onAudioLevel = callback;
  }

  // ============ Wake Word ============

  setWakeWordCallback(callback: () => void): void {
    this.wakeWordCallback = callback;
  }

  async enableWakeWord(): Promise<void> {
    // Simplified wake word detection using continuous listening
    // In production, you'd use a proper wake word model like Picovoice
    
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const wakeWords = ['aila', 'إيلا', 'أيلا', 'hey aila'];
    
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      if (wakeWords.some(w => transcript.includes(w))) {
        this.wakeWordCallback?.();
      }
    };

    recognition.start();
  }

  // ============ Live Call (Real-time Voice) ============

  async startLiveCall(
    onAudioData: (blob: Blob) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          onAudioData(event.data);
        }
      };

      mediaRecorder.start(100); // Capture every 100ms

      this.isListening = true;
    } catch (error) {
      onError?.(error as Error);
    }
  }

  stopLiveCall(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    this.isListening = false;
  }

  // ============ Cleanup ============

  dispose(): void {
    this.stop();
    this.stopListening();
    this.stopLiveCall();
    this.stopAudioLevelMonitoring();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Export singleton
export const voiceSystem = VoiceSystem.getInstance();

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
