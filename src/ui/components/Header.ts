/**
 * AILA - AI Life Assistant
 * Header Component
 */

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { AppMode, Locale } from './AILAApp.js';

@customElement('aila-header')
export class Header extends LitElement {
  static styles = css`
    :host {
      display: block;
      background: var(--color-surface, #1a1a2e);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding: 0.75rem 1rem;
    }
    
    .header-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .logo-icon {
      font-size: 1.5rem;
    }
    
    .logo-text {
      font-size: 1.25rem;
      font-weight: 600;
      background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .header-center {
      display: flex;
      gap: 0.25rem;
      background: var(--color-surface-light, #252542);
      padding: 0.25rem;
      border-radius: 0.5rem;
    }
    
    .mode-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: transparent;
      border: none;
      border-radius: 0.375rem;
      color: var(--color-text-secondary, #94a3b8);
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .mode-btn:hover {
      color: var(--color-text, #f8fafc);
      background: rgba(255, 255, 255, 0.05);
    }
    
    .mode-btn.active {
      background: var(--color-primary, #6366f1);
      color: white;
    }
    
    .mode-btn svg {
      width: 1rem;
      height: 1rem;
    }
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.5rem;
      color: var(--color-text-secondary, #94a3b8);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .icon-btn:hover {
      color: var(--color-text, #f8fafc);
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.2);
    }
    
    .icon-btn svg {
      width: 1.25rem;
      height: 1.25rem;
    }
    
    /* RTL */
    :host([dir="rtl"]) .header-container {
      flex-direction: row-reverse;
    }
  `;
  
  @property({ type: String })
  mode: AppMode = 'chat';
  
  @property({ type: String })
  locale: Locale = 'ar';
  
  render() {
    return html`
      <div class="header-container">
        <div class="header-right">
          <div class="logo">
            <span class="logo-icon">🤖</span>
            <span class="logo-text">AILA</span>
          </div>
        </div>
        
        <div class="header-center">
          <button
            class="mode-btn ${this.mode === 'chat' ? 'active' : ''}"
            @click=${() => this.setMode('chat')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            ${this.getModeLabel('chat')}
          </button>
          
          <button
            class="mode-btn ${this.mode === 'voice' ? 'active' : ''}"
            @click=${() => this.setMode('voice')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
            ${this.getModeLabel('voice')}
          </button>
          
          <button
            class="mode-btn ${this.mode === 'identity' ? 'active' : ''}"
            @click=${() => this.setMode('identity')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            ${this.getModeLabel('identity')}
          </button>
        </div>
        
        <div class="header-left">
          <button class="icon-btn" @click=${this.handleSettingsClick} title="Settings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }
  
  private setMode(mode: AppMode) {
    this.dispatchEvent(new CustomEvent('mode-change', {
      detail: { mode },
      bubbles: true,
      composed: true,
    }));
  }
  
  private handleSettingsClick() {
    this.dispatchEvent(new CustomEvent('settings-click', {
      bubbles: true,
      composed: true,
    }));
  }
  
  private getModeLabel(mode: AppMode): string {
    const isArabic = this.locale === 'ar' || this.locale === 'ar-EG';
    
    switch (mode) {
      case 'chat':
        return isArabic ? 'محادثة' : 'Chat';
      case 'voice':
        return isArabic ? 'صوت' : 'Voice';
      case 'identity':
        return isArabic ? 'هوية' : 'Identity';
      default:
        return '';
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'aila-header': Header;
  }
}
