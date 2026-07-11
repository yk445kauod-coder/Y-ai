/**
 * AILA - AI Life Assistant
 * Voice Indicator Component
 */

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('aila-voice-indicator')
export class VoiceIndicator extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: absolute;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 100;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    :host([visible]) {
      opacity: 1;
    }
    
    .indicator {
      display: flex;
      align-items: flex-end;
      gap: 4px;
      padding: 1rem 1.5rem;
      background: rgba(99, 102, 241, 0.9);
      backdrop-filter: blur(10px);
      border-radius: 2rem;
      box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
    }
    
    .bar {
      width: 4px;
      background: white;
      border-radius: 2px;
      animation: sound 0.5s ease-in-out infinite;
    }
    
    .bar:nth-child(1) {
      height: 20px;
      animation-delay: 0s;
    }
    
    .bar:nth-child(2) {
      height: 30px;
      animation-delay: 0.1s;
    }
    
    .bar:nth-child(3) {
      height: 40px;
      animation-delay: 0.2s;
    }
    
    .bar:nth-child(4) {
      height: 30px;
      animation-delay: 0.3s;
    }
    
    .bar:nth-child(5) {
      height: 20px;
      animation-delay: 0.4s;
    }
    
    @keyframes sound {
      0%, 100% {
        transform: scaleY(0.5);
      }
      50% {
        transform: scaleY(1);
      }
    }
    
    .label {
      margin-inline-start: 0.75rem;
      color: white;
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
    }
  `;
  
  @property({ type: Boolean, reflect: true })
  active = false;
  
  @property({ type: Boolean, reflect: true })
  hidden = true;
  
  render() {
    if (this.hidden) {
      return html``;
    }
    
    return html`
      <div class="indicator" style="opacity: ${this.active ? 1 : 0.6}">
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <span class="label">${this.active ? '...' : '🤖'}</span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'aila-voice-indicator': VoiceIndicator;
  }
}
