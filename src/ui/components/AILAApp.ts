/**
 * AILA - AI Life Assistant
 * Main Application Component
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getConfigManager } from '../../core/config/ConfigManager.js';
import { getEventBus } from '../../core/event-bus/EventBus.js';
import { AILA_EVENTS } from '../../types/index.js';

// Import sub-components
import './Header.js';
import './ChatView.js';
import './VoiceView.js';
import './SettingsView.js';
import './VoiceIndicator.js';

/**
 * AILA Application Mode
 */
export type AppMode = 'chat' | 'voice' | 'settings' | 'identity';

/**
 * AILA Theme
 */
export type Theme = 'light' | 'dark' | 'auto';

/**
 * AILA Locale
 */
export type Locale = 'ar' | 'en' | 'ar-EG';

/**
 * AILA Direction
 */
export type Direction = 'rtl' | 'ltr' | 'auto';

/**
 * AILA App Main Component
 */
@customElement('aila-app')
export class AILAApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
      overflow: hidden;
      background: var(--color-background, #0f0f1a);
      color: var(--color-text, #f8fafc);
      font-family: 'IBM Plex Sans Arabic', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .app-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
    }
    
    .app-header {
      flex-shrink: 0;
    }
    
    .app-main {
      flex: 1;
      overflow: hidden;
      position: relative;
    }
    
    .app-footer {
      flex-shrink: 0;
      padding: 0.5rem 1rem;
      background: var(--color-surface, #1a1a2e);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 0.75rem;
      color: var(--color-text-secondary, #94a3b8);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .status-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-success, #22c55e);
    }
    
    .status-dot.error {
      background: var(--color-error, #ef4444);
    }
    
    .status-dot.warning {
      background: var(--color-warning, #f59e0b);
    }
    
    .version {
      opacity: 0.7;
    }
    
    /* RTL/LTR Support */
    :host([direction="rtl"]) {
      direction: rtl;
    }
    
    :host([direction="ltr"]) {
      direction: ltr;
    }
    
    /* Theme styles */
    :host([theme="light"]) {
      --color-background: #f8fafc;
      --color-surface: #ffffff;
      --color-surface-light: #f1f5f9;
      --color-text: #0f172a;
      --color-text-secondary: #64748b;
    }
    
    :host([theme="dark"]) {
      --color-background: #0f0f1a;
      --color-surface: #1a1a2e;
      --color-surface-light: #252542;
      --color-text: #f8fafc;
      --color-text-secondary: #94a3b8;
    }
  `;
  
  @property({ type: String, reflect: true })
  mode: AppMode = 'chat';
  
  @property({ type: String, reflect: true })
  theme: Theme = 'dark';
  
  @property({ type: String, reflect: true })
  locale: Locale = 'ar';
  
  @property({ type: String, reflect: true })
  direction: Direction = 'rtl';
  
  @state()
  private isListening = false;
  
  @state()
  private connectionStatus: 'connected' | 'disconnected' | 'error' = 'connected';
  
  private configManager = getConfigManager();
  private eventBus = getEventBus();
  
  connectedCallback() {
    super.connectedCallback();
    this.loadSettings();
    this.setupEventListeners();
  }
  
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListeners();
  }
  
  /**
   * Load settings from config
   */
  private loadSettings() {
    const config = this.configManager.getAll();
    
    if (config.ui) {
      this.theme = config.ui.theme as Theme;
      this.locale = config.ui.locale as Locale;
      this.direction = config.ui.direction as Direction;
    }
  }
  
  /**
   * Setup event listeners
   */
  private setupEventListeners() {
    // Theme change
    this.configManager.subscribe((config) => {
      if (config.ui) {
        this.theme = config.ui.theme as Theme;
        this.locale = config.ui.locale as Locale;
        this.direction = config.ui.direction as Direction;
        
        // Update document attributes
        document.documentElement.lang = this.locale;
        document.documentElement.dir = this.direction === 'auto' 
          ? (this.locale === 'ar' || this.locale === 'ar-EG' ? 'rtl' : 'ltr')
          : this.direction;
      }
    });
    
    // Voice events
    this.eventBus.subscribe(AILA_EVENTS.WAKE_WORD_DETECTED, () => {
      this.isListening = true;
    });
    
    this.eventBus.subscribe(AILA_EVENTS.SPEECH_END, () => {
      this.isListening = false;
    });
    
    // Connection status
    this.eventBus.subscribe(AILA_EVENTS.ERROR, () => {
      this.connectionStatus = 'error';
    });
  }
  
  /**
   * Remove event listeners
   */
  private removeEventListeners() {
    // Cleanup is handled by the managers
  }
  
  /**
   * Handle mode change
   */
  private handleModeChange(e: CustomEvent<{ mode: AppMode }>) {
    this.mode = e.detail.mode;
  }
  
  /**
   * Handle settings change
   */
  private handleSettingsChange(e: CustomEvent) {
    const { theme, locale, direction } = e.detail;
    
    if (theme !== undefined) {
      this.configManager.set('ui.theme', theme);
    }
    
    if (locale !== undefined) {
      this.configManager.set('ui.locale', locale);
    }
    
    if (direction !== undefined) {
      this.configManager.set('ui.direction', direction);
    }
  }
  
  /**
   * Render the app
   */
  render() {
    return html`
      <div class="app-container">
        <header class="app-header">
          <aila-header
            .mode=${this.mode}
            .locale=${this.locale}
            @mode-change=${this.handleModeChange}
            @settings-click=${() => this.mode = 'settings'}
          ></aila-header>
        </header>
        
        <main class="app-main">
          ${this.renderMainContent()}
          
          <aila-voice-indicator
            ?active=${this.isListening}
            ?hidden=${this.mode !== 'voice'}
          ></aila-voice-indicator>
        </main>
        
        <footer class="app-footer">
          <div class="status-indicator">
            <span class="status-dot ${this.connectionStatus}"></span>
            <span>${this.getStatusText()}</span>
          </div>
          <span class="version">AILA v1.0.0</span>
        </footer>
      </div>
    `;
  }
  
  /**
   * Render main content based on mode
   */
  private renderMainContent() {
    switch (this.mode) {
      case 'chat':
        return html`
          <aila-chat-view
            .locale=${this.locale}
            @voice-mode=${() => this.mode = 'voice'}
          ></aila-chat-view>
        `;
      
      case 'voice':
        return html`
          <aila-voice-view
            .locale=${this.locale}
            @chat-mode=${() => this.mode = 'chat'}
          ></aila-voice-view>
        `;
      
      case 'settings':
        return html`
          <aila-settings-view
            .theme=${this.theme}
            .locale=${this.locale}
            .direction=${this.direction}
            @settings-change=${this.handleSettingsChange}
            @close=${() => this.mode = 'chat'}
          ></aila-settings-view>
        `;
      
      case 'identity':
        return html`
          <div>Identity Management - Coming Soon</div>
        `;
      
      default:
        return html`<aila-chat-view .locale=${this.locale}></aila-chat-view>`;
    }
  }
  
  /**
   * Get status text
   */
  private getStatusText(): string {
    switch (this.connectionStatus) {
      case 'connected':
        return this.locale === 'ar' || this.locale === 'ar-EG' ? 'متصل' : 'Connected';
      case 'disconnected':
        return this.locale === 'ar' || this.locale === 'ar-EG' ? 'غير متصل' : 'Disconnected';
      case 'error':
        return this.locale === 'ar' || this.locale === 'ar-EG' ? 'خطأ' : 'Error';
      default:
        return '';
    }
  }
}

// Declare for TypeScript
declare global {
  interface HTMLElementTagNameMap {
    'aila-app': AILAApp;
  }
}
