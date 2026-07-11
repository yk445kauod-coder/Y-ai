/**
 * AILA - AI Life Assistant
 * Chat View Component
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { getEventBus } from '../../core/event-bus/EventBus.js';
import { AILA_EVENTS } from '../../types/index.js';
import type { Locale } from './AILAApp.js';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  typing?: boolean;
}

/**
 * Chat Message Component
 */
@customElement('chat-message')
class ChatMessage extends LitElement {
  static styles = css`
    :host {
      display: block;
      margin-bottom: 1rem;
    }
    
    .message-container {
      display: flex;
      gap: 0.75rem;
      max-width: 80%;
    }
    
    :host([role="user"]) .message-container {
      margin-left: auto;
      flex-direction: row-reverse;
    }
    
    .avatar {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }
    
    :host([role="user"]) .avatar {
      background: var(--color-primary, #6366f1);
    }
    
    :host([role="assistant"]) .avatar {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
    }
    
    .message-content {
      background: var(--color-surface, #1a1a2e);
      padding: 0.75rem 1rem;
      border-radius: 1rem;
      border-top-left-radius: 0.25rem;
    }
    
    :host([role="user"]) .message-content {
      background: var(--color-primary, #6366f1);
      color: white;
      border-top-left-radius: 1rem;
      border-top-right-radius: 0.25rem;
    }
    
    .message-text {
      font-size: 0.9375rem;
      line-height: 1.5;
      white-space: pre-wrap;
    }
    
    .message-time {
      font-size: 0.75rem;
      color: var(--color-text-secondary, #94a3b8);
      margin-top: 0.25rem;
    }
    
    :host([role="user"]) .message-time {
      color: rgba(255, 255, 255, 0.7);
    }
    
    .typing-indicator {
      display: flex;
      gap: 0.25rem;
      padding: 0.5rem;
    }
    
    .typing-dot {
      width: 0.5rem;
      height: 0.5rem;
      background: var(--color-text-secondary, #94a3b8);
      border-radius: 50%;
      animation: typing 1.4s infinite ease-in-out;
    }
    
    .typing-dot:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    .typing-dot:nth-child(3) {
      animation-delay: 0.4s;
    }
    
    @keyframes typing {
      0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.4;
      }
      30% {
        transform: translateY(-0.25rem);
        opacity: 1;
      }
    }
  `;
  
  @property({ type: String, reflect: true })
  role: 'user' | 'assistant' | 'system' = 'assistant';
  
  @property({ type: String })
  content = '';
  
  @property({ type: Number })
  timestamp = 0;
  
  @property({ type: Boolean })
  typing = false;
  
  render() {
    return html`
      <div class="message-container">
        <div class="avatar">
          ${this.role === 'user' ? '👤' : '🤖'}
        </div>
        <div class="message-content">
          ${this.typing ? this.renderTyping() : html`<div class="message-text">${this.content}</div>`}
          <div class="message-time">${this.formatTime()}</div>
        </div>
      </div>
    `;
  }
  
  private renderTyping() {
    return html`
      <div class="typing-indicator">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
  }
  
  private formatTime(): string {
    if (!this.timestamp) return '';
    return new Date(this.timestamp).toLocaleTimeString(
      this.role === 'user' ? 'ar-EG' : 'en-US',
      { hour: '2-digit', minute: '2-digit' }
    );
  }
}

/**
 * Chat Input Component
 */
@customElement('chat-input')
class ChatInput extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    
    .input-container {
      display: flex;
      gap: 0.75rem;
      padding: 1rem;
      background: var(--color-surface, #1a1a2e);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .input-wrapper {
      flex: 1;
      display: flex;
      gap: 0.5rem;
      background: var(--color-surface-light, #252542);
      border-radius: 1.5rem;
      padding: 0.25rem;
      border: 2px solid transparent;
      transition: border-color 0.2s ease;
    }
    
    .input-wrapper:focus-within {
      border-color: var(--color-primary, #6366f1);
    }
    
    .message-input {
      flex: 1;
      background: transparent;
      border: none;
      padding: 0.75rem 1rem;
      font-size: 0.9375rem;
      color: var(--color-text, #f8fafc);
      outline: none;
      resize: none;
      min-height: 3rem;
      max-height: 10rem;
      font-family: inherit;
    }
    
    .message-input::placeholder {
      color: var(--color-text-secondary, #94a3b8);
    }
    
    .send-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 3rem;
      height: 3rem;
      background: var(--color-primary, #6366f1);
      border: none;
      border-radius: 50%;
      color: white;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    
    .send-btn:hover {
      background: var(--color-primary-dark, #4f46e5);
      transform: scale(1.05);
    }
    
    .send-btn:disabled {
      background: var(--color-surface-light, #252542);
      cursor: not-allowed;
      transform: none;
    }
    
    .send-btn svg {
      width: 1.25rem;
      height: 1.25rem;
    }
    
    .voice-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 3rem;
      height: 3rem;
      background: var(--color-surface-light, #252542);
      border: none;
      border-radius: 50%;
      color: var(--color-text, #f8fafc);
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    
    .voice-btn:hover {
      background: var(--color-secondary, #ec4899);
    }
    
    .voice-btn svg {
      width: 1.25rem;
      height: 1.25rem;
    }
    
    .char-count {
      font-size: 0.75rem;
      color: var(--color-text-secondary, #94a3b8);
      padding: 0 0.75rem;
      align-self: flex-end;
      padding-bottom: 0.75rem;
    }
  `;
  
  @property({ type: String })
  placeholder = 'اكتب رسالتك...';
  
  @property({ type: Number })
  maxLength = 4000;
  
  @state()
  private message = '';
  
  @query('.message-input')
  private inputElement!: HTMLTextAreaElement;
  
  render() {
    const charCount = this.message.length;
    const isOverLimit = charCount > this.maxLength;
    
    return html`
      <div class="input-container">
        <div class="input-wrapper">
          <textarea
            class="message-input"
            .value=${this.message}
            placeholder=${this.placeholder}
            rows="1"
            @input=${this.handleInput}
            @keydown=${this.handleKeyDown}
          ></textarea>
          ${charCount > 0 ? html`<span class="char-count ${isOverLimit ? 'error' : ''}">${charCount}/${this.maxLength}</span>` : ''}
        </div>
        
        <button
          class="voice-btn"
          @click=${this.handleVoiceClick}
          title="Voice input"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </button>
        
        <button
          class="send-btn"
          ?disabled=${!this.message.trim() || isOverLimit}
          @click=${this.handleSend}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    `;
  }
  
  private handleInput(e: InputEvent) {
    const target = e.target as HTMLTextAreaElement;
    this.message = target.value;
    
    // Auto-resize
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 160)}px`;
  }
  
  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.handleSend();
    }
  }
  
  private handleSend() {
    if (!this.message.trim()) return;
    
    this.dispatchEvent(new CustomEvent('send-message', {
      detail: { message: this.message.trim() },
      bubbles: true,
      composed: true,
    }));
    
    this.message = '';
    
    // Reset textarea height
    if (this.inputElement) {
      this.inputElement.style.height = 'auto';
    }
  }
  
  private handleVoiceClick() {
    this.dispatchEvent(new CustomEvent('voice-mode', {
      bubbles: true,
      composed: true,
    }));
  }
  
  setMessage(message: string) {
    this.message = message;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'chat-message': ChatMessage;
    'chat-input': ChatInput;
  }
}

/**
 * Main Chat View Component
 */
@customElement('aila-chat-view')
export class ChatView extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }
    
    .chat-container {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      scroll-behavior: smooth;
    }
    
    .welcome-message {
      text-align: center;
      padding: 2rem;
      color: var(--color-text-secondary, #94a3b8);
    }
    
    .welcome-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    
    .welcome-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--color-text, #f8fafc);
    }
    
    .welcome-subtitle {
      font-size: 0.9375rem;
      max-width: 400px;
      margin: 0 auto;
    }
    
    .quick-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: center;
      margin-top: 1.5rem;
    }
    
    .quick-action {
      padding: 0.5rem 1rem;
      background: var(--color-surface-light, #252542);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1.5rem;
      color: var(--color-text, #f8fafc);
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .quick-action:hover {
      background: var(--color-primary, #6366f1);
      border-color: var(--color-primary, #6366f1);
    }
  `;
  
  @property({ type: String })
  locale: Locale = 'ar';
  
  @state()
  private messages: Message[] = [];
  
  @state()
  private isTyping = false;
  
  @query('chat-input')
  private chatInput!: ChatInput;
  
  private eventBus = getEventBus();
  private messagesContainer!: HTMLElement;
  
  connectedCallback() {
    super.connectedCallback();
    this.setupEventListeners();
  }
  
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  
  private setupEventListeners() {
    this.eventBus.subscribe(AILA_EVENTS.MESSAGE_RECEIVED, (event) => {
      const message = event.payload as Message;
      this.addMessage({
        ...message,
        typing: true,
      });
      
      // Simulate typing delay
      setTimeout(() => {
        this.updateMessage(message.id, { typing: false });
      }, 1000);
    });
  }
  
  private addMessage(message: Message) {
    this.messages = [...this.messages, message];
    this.scrollToBottom();
  }
  
  private updateMessage(id: string, updates: Partial<Message>) {
    this.messages = this.messages.map((msg) =>
      msg.id === id ? { ...msg, ...updates } : msg
    );
  }
  
  private scrollToBottom() {
    requestAnimationFrame(() => {
      if (this.messagesContainer) {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      }
    });
  }
  
  private handleSendMessage(e: CustomEvent<{ message: string }>) {
    const { message } = e.detail;
    
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };
    
    this.addMessage(userMessage);
    
    // Emit event for AI processing
    this.eventBus.publish(AILA_EVENTS.MESSAGE_SENT, {
      message,
      messageId: userMessage.id,
    });
    
    // Simulate AI response
    this.simulateAIResponse(message);
  }
  
  private simulateAIResponse(userMessage: string) {
    this.isTyping = true;
    
    setTimeout(() => {
      const responses = [
        'أنا هنا لمساعدتك! كيف يمكنني مساعدتك اليوم؟',
        'تم استلام رسالتك. دعني أفكر في أفضل إجابة...',
        'مرحباً! أنا AILA، مساعدك الذكي. كيف يمكنني مساعدتك؟',
        'شكراً لتواصلك! أنا جاهز لمساعدتك في أي شيء تحتاجه.',
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const aiMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: randomResponse,
        timestamp: Date.now(),
      };
      
      this.addMessage(aiMessage);
      this.isTyping = false;
      
      this.eventBus.publish(AILA_EVENTS.MESSAGE_RECEIVED, aiMessage);
    }, 1500);
  }
  
  render() {
    const isArabic = this.locale === 'ar' || this.locale === 'ar-EG';
    
    return html`
      <div class="chat-container" ${(ref: HTMLElement) => this.messagesContainer = ref}>
        ${this.messages.length === 0
          ? this.renderWelcome(isArabic)
          : this.renderMessages()
        }
      </div>
      
      <chat-input
        placeholder=${isArabic ? 'اكتب رسالتك...' : 'Type your message...'}
        @send-message=${this.handleSendMessage}
      ></chat-input>
    `;
  }
  
  private renderWelcome(isArabic: boolean) {
    return html`
      <div class="welcome-message">
        <div class="welcome-icon">🤖</div>
        <h2 class="welcome-title">${isArabic ? 'مرحباً بك في AILA' : 'Welcome to AILA'}</h2>
        <p class="welcome-subtitle">
          ${isArabic 
            ? 'أنا مساعدك الذكي. يمكنني مساعدتك في البرمجة، البحث، الكتابة، والمزيد.'
            : 'I\'m your AI assistant. I can help you with programming, research, writing, and more.'}
        </p>
        <div class="quick-actions">
          <button class="quick-action" @click=${() => this.chatInput?.setMessage(isArabic ? 'ساعدني في كتابة كود' : 'Help me write code')}>
            💻 ${isArabic ? 'كتابة كود' : 'Write code'}
          </button>
          <button class="quick-action" @click=${() => this.chatInput?.setMessage(isArabic ? 'ابحث عن...' : 'Search for...')}>
            🔍 ${isArabic ? 'بحث' : 'Search'}
          </button>
          <button class="quick-action" @click=${() => this.chatInput?.setMessage(isArabic ? 'لخّص هذا النص...' : 'Summarize this text...')}>
            📝 ${isArabic ? 'تلخيص' : 'Summarize'}
          </button>
        </div>
      </div>
    `;
  }
  
  private renderMessages() {
    return this.messages.map((msg) => html`
      <chat-message
        role=${msg.role}
        content=${msg.content}
        timestamp=${msg.timestamp}
        ?typing=${msg.typing}
      ></chat-message>
    `);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'aila-chat-view': ChatView;
  }
}
