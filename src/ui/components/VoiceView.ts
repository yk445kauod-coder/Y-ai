/**
 * AILA - AI Life Assistant
 * Voice View Component
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getEventBus } from '../../core/event-bus/EventBus.js';
import { AILA_EVENTS } from '../../types/index.js';
import type { Locale } from './AILAApp.js';

@customElement('aila-voice-view')
export class VoiceView extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 2rem;
      text-align: center;
    }
    
    .voice-orb {
      position: relative;
      width: 200px;
      height: 200px;
      margin-bottom: 3rem;
    }
    
    .orb-core {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 120px;
      height: 120px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 0 60px rgba(99, 102, 241, 0.5);
    }
    
    .orb-core:hover {
      transform: translate(-50%, -50%) scale(1.05);
    }
    
    .orb-core.listening {
      animation: pulse 1.5s ease-in-out infinite;
    }
    
    .orb-ring {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border: 2px solid rgba(99, 102, 241, 0.3);
      border-radius: 50%;
      animation: expand 2s ease-out infinite;
    }
    
    .orb-ring:nth-child(2) {
      width: 160px;
      height: 160px;
      animation-delay: 0s;
    }
    
    .orb-ring:nth-child(3) {
      width: 200px;
      height: 200px;
      animation-delay: 0.5s;
    }
    
    .orb-ring:nth-child(4) {
      width: 240px;
      height: 240px;
      animation-delay: 1s;
    }
    
    @keyframes pulse {
      0%, 100% {
        transform: translate(-50%, -50%) scale(1);
        box-shadow: 0 0 60px rgba(99, 102, 241, 0.5);
      }
      50% {
        transform: translate(-50%, -50%) scale(1.1);
        box-shadow: 0 0 80px rgba(99, 102, 241, 0.7);
      }
    }
    
    @keyframes expand {
      0% {
        transform: translate(-50%, -50%) scale(0.8);
        opacity: 1;
      }
      100% {
        transform: translate(-50%, -50%) scale(1.5);
        opacity: 0;
      }
    }
    
    .status-text {
      font-size: 1.25rem;
      font-weight: 500;
      margin-bottom: 1rem;
      color: var(--color-text, #f8fafc);
    }
    
    .transcript {
      font-size: 1rem;
      color: var(--color-text-secondary, #94a3b8);
      max-width: 500px;
      min-height: 3rem;
      padding: 1rem;
      background: var(--color-surface, #1a1a2e);
      border-radius: 1rem;
      margin-bottom: 2rem;
    }
    
    .transcript.listening {
      border: 2px solid var(--color-primary, #6366f1);
    }
    
    .controls {
      display: flex;
      gap: 1rem;
    }
    
    .control-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 3rem;
      height: 3rem;
      background: var(--color-surface, #1a1a2e);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      color: var(--color-text, #f8fafc);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .control-btn:hover {
      background: var(--color-surface-light, #252542);
      transform: scale(1.05);
    }
    
    .control-btn.active {
      background: var(--color-primary, #6366f1);
      border-color: var(--color-primary, #6366f1);
    }
    
    .control-btn svg {
      width: 1.25rem;
      height: 1.25rem;
    }
    
    .mode-switch {
      margin-top: 2rem;
    }
    
    .mode-btn {
      padding: 0.5rem 1rem;
      background: var(--color-surface, #1a1a2e);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1.5rem;
      color: var(--color-text-secondary, #94a3b8);
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .mode-btn:hover {
      color: var(--color-text, #f8fafc);
      border-color: var(--color-primary, #6366f1);
    }
  `;
  
  @property({ type: String })
  locale: Locale = 'ar';
  
  @state()
  private isListening = false;
  
  @state()
  private transcript = '';
  
  @state()
  private wakeWordEnabled = true;
  
  private eventBus = getEventBus();
  
  connectedCallback() {
    super.connectedCallback();
    this.setupEventListeners();
  }
  
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  
  private setupEventListeners() {
    this.eventBus.subscribe(AILA_EVENTS.WAKE_WORD_DETECTED, () => {
      this.isListening = true;
      this.transcript = '';
    });
    
    this.eventBus.subscribe(AILA_EVENTS.TRANSCRIPTION, (event) => {
      this.transcript = event.payload as string;
    });
    
    this.eventBus.subscribe(AILA_EVENTS.SPEECH_END, () => {
      this.isListening = false;
    });
  }
  
  private toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }
  
  private startListening() {
    this.isListening = true;
    this.transcript = '';
    
    this.eventBus.publish(AILA_EVENTS.SPEECH_START, {
      timestamp: Date.now(),
    });
  }
  
  private stopListening() {
    this.isListening = false;
    
    this.eventBus.publish(AILA_EVENTS.SPEECH_END, {
      transcript: this.transcript,
      timestamp: Date.now(),
    });
  }
  
  private toggleWakeWord() {
    this.wakeWordEnabled = !this.wakeWordEnabled;
  }
  
  private switchToChat() {
    this.dispatchEvent(new CustomEvent('chat-mode', {
      bubbles: true,
      composed: true,
    }));
  }
  
  render() {
    const isArabic = this.locale === 'ar' || this.locale === 'ar-EG';
    
    return html`
      <div class="voice-orb">
        <div class="orb-ring"></div>
        <div class="orb-ring"></div>
        <div class="orb-ring"></div>
        
        <div 
          class="orb-core ${this.isListening ? 'listening' : ''}"
          @click=${this.toggleListening}
        >
          ${this.isListening ? '🎤' : '🤖'}
        </div>
      </div>
      
      <div class="status-text">
        ${this.getStatusText(isArabic)}
      </div>
      
      <div class="transcript ${this.isListening ? 'listening' : ''}">
        ${this.transcript || (isArabic ? '...' : 'Listening...')}
      </div>
      
      <div class="controls">
        <button 
          class="control-btn ${this.wakeWordEnabled ? 'active' : ''}"
          @click=${this.toggleWakeWord}
          title=${isArabic ? 'تفعيل Wake Word' : 'Enable Wake Word'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </button>
        
        <button 
          class="control-btn ${this.isListening ? 'active' : ''}"
          @click=${this.toggleListening}
          title=${this.isListening 
            ? (isArabic ? 'إيقاف' : 'Stop') 
            : (isArabic ? 'بدء' : 'Start')}
        >
          ${this.isListening 
            ? html`<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>`
            : html`<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`
          }
        </button>
        
        <button 
          class="control-btn"
          @click=${this.switchToChat}
          title=${isArabic ? 'الوضع النصي' : 'Text Mode'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>
      
      <div class="mode-switch">
        <button class="mode-btn" @click=${this.switchToChat}>
          ${isArabic ? '↩ التبديل للوضع النصي' : '↩ Switch to Text Mode'}
        </button>
      </div>
    `;
  }
  
  private getStatusText(isArabic: boolean): string {
    if (this.isListening) {
      return isArabic ? 'أستمع إليك...' : 'Listening...';
    }
    return isArabic ? 'اضغط للتحدث' : 'Tap to speak';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'aila-voice-view': VoiceView;
  }
}
