/**
 * AILA - AI Life Assistant
 * Live Preview Components (Computer Use & Browser)
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  isActive: boolean;
  screenshot?: string;
}

@customElement('aila-live-preview')
export class LivePreview extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: 'Press Start 2P', 'Pixelify Sans', 'Tajawal', system-ui, sans-serif;
    }

    .preview-container {
      background: var(--bg-secondary, #1a1a2e);
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    }

    .preview-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: var(--bg-tertiary, #252542);
      border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    }

    .preview-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary, #f8fafc);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .preview-controls {
      display: flex;
      gap: 8px;
    }

    .control-btn {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: none;
      background: var(--bg-secondary, #1a1a2e);
      color: var(--text-secondary, #94a3b8);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      font-size: 12px;
    }

    .control-btn:hover {
      background: var(--primary-color, #6366f1);
      color: white;
    }

    .control-btn.active {
      background: var(--primary-color, #6366f1);
      color: white;
    }

    .preview-body {
      position: relative;
      background: #000;
      aspect-ratio: 16/10;
    }

    .preview-iframe {
      width: 100%;
      height: 100%;
      border: none;
      background: #fff;
    }

    .preview-screenshot {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: #000;
    }

    .preview-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      border: 2px solid var(--primary-color, #6366f1);
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .preview-body:hover .preview-overlay {
      opacity: 1;
    }

    .cursor-indicator {
      position: absolute;
      width: 20px;
      height: 20px;
      background: var(--primary-color, #6366f1);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      opacity: 0.8;
      transition: all 0.1s ease;
      z-index: 10;
    }

    .cursor-indicator::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 6px;
      height: 6px;
      background: white;
      border-radius: 50%;
    }

    .preview-status {
      position: absolute;
      top: 8px;
      left: 8px;
      padding: 4px 10px;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 12px;
      font-size: 10px;
      color: white;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--success-color, #22c55e);
    }

    .status-dot.recording {
      background: var(--error-color, #ef4444);
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .recording-indicator {
      position: absolute;
      top: 8px;
      right: 8px;
      padding: 4px 10px;
      background: rgba(239, 68, 68, 0.9);
      border-radius: 12px;
      font-size: 10px;
      color: white;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .recording-dot {
      width: 8px;
      height: 8px;
      background: white;
      border-radius: 50%;
      animation: blink 1s infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }

    .preview-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--bg-secondary, #1a1a2e), var(--bg-tertiary, #252542));
      color: var(--text-secondary, #94a3b8);
    }

    .placeholder-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .placeholder-text {
      font-size: 12px;
      text-align: center;
      max-width: 200px;
    }

    /* Browser Tabs Component */
    .browser-tabs {
      display: flex;
      gap: 2px;
      padding: 8px;
      background: var(--bg-primary, #0f0f1a);
      overflow-x: auto;
    }

    .browser-tab {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--bg-secondary, #1a1a2e);
      border-radius: 8px 8px 0 0;
      cursor: pointer;
      min-width: 120px;
      max-width: 200px;
      transition: all 0.2s ease;
    }

    .browser-tab:hover {
      background: var(--bg-tertiary, #252542);
    }

    .browser-tab.active {
      background: var(--bg-tertiary, #252542);
    }

    .tab-favicon {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .tab-title {
      flex: 1;
      font-size: 11px;
      color: var(--text-primary, #f8fafc);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tab-close {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      border: none;
      background: transparent;
      color: var(--text-secondary, #94a3b8);
      cursor: pointer;
      font-size: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: all 0.2s ease;
    }

    .browser-tab:hover .tab-close {
      opacity: 1;
    }

    .tab-close:hover {
      background: var(--error-color, #ef4444);
      color: white;
    }

    .new-tab-btn {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: none;
      background: transparent;
      color: var(--text-secondary, #94a3b8);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .new-tab-btn:hover {
      background: var(--bg-secondary, #1a1a2e);
      color: var(--text-primary, #f8fafc);
    }

    /* Desktop Preview */
    .desktop-preview {
      width: 100%;
      height: 100%;
      background: var(--bg-secondary, #1a1a2e);
      position: relative;
      overflow: hidden;
    }

    .desktop-taskbar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 48px;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      padding: 0 8px;
      gap: 4px;
    }

    .taskbar-item {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 18px;
    }

    .taskbar-item:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .taskbar-item.active {
      background: var(--primary-color, #6366f1);
    }

    .screenshot-btn {
      position: absolute;
      bottom: 60px;
      right: 16px;
      padding: 8px 16px;
      background: var(--primary-color, #6366f1);
      border: none;
      border-radius: 8px;
      color: white;
      font-size: 11px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
      z-index: 5;
    }

    .screenshot-btn:hover {
      background: var(--primary-dark, #4f46e5);
      transform: scale(1.05);
    }

    /* RTL Support */
    :host([dir="rtl"]) .preview-controls {
      flex-direction: row-reverse;
    }

    :host([dir="rtl"]) .preview-status,
    :host([dir="rtl"]) .recording-indicator {
      left: auto;
      right: 8px;
    }
  `;

  @property({ type: String })
  type: 'browser' | 'desktop' = 'browser';

  @property({ type: String })
  url = '';

  @property({ type: Boolean })
  isRecording = false;

  @property({ type: Boolean })
  showControls = true;

  @property({ type: String })
  dir: 'rtl' | 'ltr' = 'rtl';

  @state()
  private cursorPosition = { x: 0, y: 0 };

  @state()
  private screenshot: string | null = null;

  @state()
  private tabs: BrowserTab[] = [
    { id: '1', title: 'New Tab', url: '', isActive: true }
  ];

  private handleMouseMove(e: MouseEvent) {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    this.cursorPosition = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  private async takeScreenshot() {
    // Use html2canvas or similar for screenshot
    // For now, we'll emit an event
    this.dispatchEvent(new CustomEvent('screenshot-request', {
      detail: { type: this.type },
      bubbles: true,
      composed: true,
    }));
  }

  setScreenshot(dataUrl: string) {
    this.screenshot = dataUrl;
  }

  render() {
    return html`
      <div class="preview-container" dir="${this.dir}">
        ${this.showControls ? this.renderHeader() : ''}
        
        <div 
          class="preview-body" 
          @mousemove=${this.handleMouseMove}
          @click=${() => this.dispatchEvent(new CustomEvent('preview-click', { bubbles: true, composed: true }))}
        >
          ${this.renderContent()}
          
          <div class="preview-overlay"></div>
          
          ${this.isRecording ? html`
            <div class="recording-indicator">
              <div class="recording-dot"></div>
              <span>REC</span>
            </div>
          ` : ''}
          
          <div class="preview-status">
            <div class="status-dot ${this.isRecording ? 'recording' : ''}"></div>
            <span>${this.isRecording ? 'تسجيل' : 'مباشر'}</span>
          </div>
        </div>
      </div>
    `;
  }

  private renderHeader() {
    return html`
      <div class="preview-header">
        <div class="preview-title">
          <span>${this.type === 'browser' ? '🌐' : '🖥️'}</span>
          <span>${this.type === 'browser' ? 'معاينة المتصفح' : 'معاينة الحاسوب'}</span>
        </div>
        
        <div class="preview-controls">
          <button class="control-btn" @click=${() => this.dispatchEvent(new CustomEvent('refresh', { bubbles: true, composed: true }))}>
            🔄
          </button>
          <button class="control-btn ${this.isRecording ? 'active' : ''}" @click=${() => this.isRecording = !this.isRecording}>
            ${this.isRecording ? '⏹️' : '⏺️'}
          </button>
          <button class="control-btn" @click=${this.takeScreenshot}>
            📷
          </button>
        </div>
      </div>
    `;
  }

  private renderContent() {
    if (this.screenshot) {
      return html`<img class="preview-screenshot" src="${this.screenshot}" alt="Screenshot" />`;
    }

    if (this.type === 'browser') {
      if (this.url) {
        return html`
          ${this.renderBrowserTabs()}
          <iframe 
            class="preview-iframe" 
            src="${this.url}" 
            sandbox="allow-scripts allow-same-origin"
          ></iframe>
        `;
      }
    }

    return this.renderPlaceholder();
  }

  private renderBrowserTabs() {
    return html`
      <div class="browser-tabs">
        ${this.tabs.map(tab => html`
          <div class="browser-tab ${tab.isActive ? 'active' : ''}">
            ${tab.favicon ? html`<img class="tab-favicon" src="${tab.favicon}" />` : '🌐'}
            <span class="tab-title">${tab.title}</span>
            <button class="tab-close" @click=${(e: Event) => { e.stopPropagation(); this.closeTab(tab.id); }}>
              ✕
            </button>
          </div>
        `)}
        <button class="new-tab-btn" @click=${this.addNewTab}>+</button>
      </div>
    `;
  }

  private renderDesktopPreview() {
    return html`
      <div class="desktop-preview">
        <div class="desktop-taskbar">
          <div class="taskbar-item">🖥️</div>
          <div class="taskbar-item">🌐</div>
          <div class="taskbar-item">📁</div>
          <div class="taskbar-item">⚙️</div>
        </div>
        
        <button class="screenshot-btn" @click=${this.takeScreenshot}>
          📷 التقاط شاشة
        </button>
      </div>
    `;
  }

  private renderPlaceholder() {
    return html`
      <div class="preview-placeholder">
        <div class="placeholder-icon">${this.type === 'browser' ? '🌐' : '🖥️'}</div>
        <div class="placeholder-text">
          ${this.type === 'browser' 
            ? 'معاينة المتصفح ستظهر هنا عند التفاعل مع مواقع الويب'
            : 'معاينة سطح المكتب ستظهر هنا عند التحكم بالحاسوب'
          }
        </div>
      </div>
    `;
  }

  private closeTab(id: string) {
    this.tabs = this.tabs.filter(t => t.id !== id);
    if (this.tabs.length === 0) {
      this.addNewTab();
    }
  }

  private addNewTab() {
    const newTab: BrowserTab = {
      id: Date.now().toString(),
      title: 'New Tab',
      url: '',
      isActive: true,
    };
    this.tabs = [...this.tabs.map(t => ({ ...t, isActive: false })), newTab];
  }
}

// Screenshot Capture Component
@customElement('aila-screenshot')
export class ScreenshotCapture extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .screenshot-container {
      position: relative;
    }

    .screenshot-preview {
      width: 100%;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    }

    .screenshot-image {
      width: 100%;
      display: block;
    }

    .screenshot-toolbar {
      display: flex;
      gap: 8px;
      padding: 12px;
      background: var(--bg-secondary, #1a1a2e);
      border-radius: 0 0 12px 12px;
      border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    }

    .toolbar-btn {
      flex: 1;
      padding: 8px 12px;
      border: none;
      border-radius: 8px;
      font-size: 11px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s ease;
    }

    .toolbar-btn.primary {
      background: var(--primary-color, #6366f1);
      color: white;
    }

    .toolbar-btn.primary:hover {
      background: var(--primary-dark, #4f46e5);
    }

    .toolbar-btn.secondary {
      background: var(--bg-tertiary, #252542);
      color: var(--text-primary, #f8fafc);
    }

    .toolbar-btn.secondary:hover {
      background: var(--bg-secondary, #1a1a2e);
    }

    .timestamp {
      font-size: 10px;
      color: var(--text-secondary, #94a3b8);
      text-align: center;
      padding: 8px;
    }
  `;

  @property({ type: String })
  imageUrl = '';

  @property({ type: String })
  timestamp = '';

  @property({ type: String })
  dir: 'rtl' | 'ltr' = 'rtl';

  private downloadScreenshot() {
    if (!this.imageUrl) return;
    
    const link = document.createElement('a');
    link.href = this.imageUrl;
    link.download = `screenshot-${Date.now()}.png`;
    link.click();
  }

  private copyToClipboard() {
    if (!this.imageUrl) return;
    
    fetch(this.imageUrl)
      .then(res => res.blob())
      .then(blob => {
        navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
      });
  }

  render() {
    if (!this.imageUrl) return html``;

    return html`
      <div class="screenshot-container" dir="${this.dir}">
        <div class="screenshot-preview">
          <img class="screenshot-image" src="${this.imageUrl}" alt="Screenshot" />
        </div>
        
        <div class="screenshot-toolbar">
          <button class="toolbar-btn secondary" @click=${this.copyToClipboard}>
            📋 نسخ
          </button>
          <button class="toolbar-btn primary" @click=${this.downloadScreenshot}>
            ⬇️ تحميل
          </button>
        </div>
        
        ${this.timestamp ? html`
          <div class="timestamp">${this.timestamp}</div>
        ` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'aila-live-preview': LivePreview;
    'aila-screenshot': ScreenshotCapture;
  }
}
