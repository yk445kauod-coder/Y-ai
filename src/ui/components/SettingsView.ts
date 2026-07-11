/**
 * AILA - AI Life Assistant
 * Settings View Component
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getConfigManager } from '../../core/config/ConfigManager.js';
import type { Theme, Locale, Direction } from './AILAApp.js';

type SettingsTab = 'general' | 'appearance' | 'voice' | 'security' | 'about';

@customElement('aila-settings-view')
export class SettingsView extends LitElement {
  static styles = css`
    :host {
      display: flex;
      height: 100%;
      background: var(--color-background, #0f0f1a);
    }
    
    .settings-sidebar {
      width: 250px;
      background: var(--color-surface, #1a1a2e);
      border-inline-end: 1px solid rgba(255, 255, 255, 0.1);
      padding: 1rem;
    }
    
    .sidebar-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-secondary, #94a3b8);
      margin-bottom: 1rem;
      padding: 0 0.5rem;
    }
    
    .settings-nav {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: transparent;
      border: none;
      border-radius: 0.5rem;
      color: var(--color-text-secondary, #94a3b8);
      font-size: 0.9375rem;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: start;
      width: 100%;
    }
    
    .nav-item:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--color-text, #f8fafc);
    }
    
    .nav-item.active {
      background: var(--color-primary, #6366f1);
      color: white;
    }
    
    .nav-item svg {
      width: 1.25rem;
      height: 1.25rem;
      flex-shrink: 0;
    }
    
    .settings-content {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
    }
    
    .settings-section {
      max-width: 600px;
    }
    
    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      color: var(--color-text, #f8fafc);
    }
    
    .setting-group {
      margin-bottom: 2rem;
    }
    
    .setting-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-secondary, #94a3b8);
      margin-bottom: 0.5rem;
    }
    
    .setting-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      background: var(--color-surface, #1a1a2e);
      border-radius: 0.75rem;
      margin-bottom: 0.75rem;
    }
    
    .setting-info {
      flex: 1;
    }
    
    .setting-name {
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--color-text, #f8fafc);
      margin-bottom: 0.25rem;
    }
    
    .setting-description {
      font-size: 0.8125rem;
      color: var(--color-text-secondary, #94a3b8);
    }
    
    /* Toggle Switch */
    .toggle {
      position: relative;
      width: 48px;
      height: 28px;
      flex-shrink: 0;
    }
    
    .toggle input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--color-surface-light, #252542);
      border-radius: 28px;
      transition: all 0.2s ease;
    }
    
    .toggle-slider::before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 4px;
      bottom: 4px;
      background: white;
      border-radius: 50%;
      transition: all 0.2s ease;
    }
    
    .toggle input:checked + .toggle-slider {
      background: var(--color-primary, #6366f1);
    }
    
    .toggle input:checked + .toggle-slider::before {
      transform: translateX(20px);
    }
    
    /* Select */
    .select {
      padding: 0.5rem 1rem;
      background: var(--color-surface-light, #252542);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.5rem;
      color: var(--color-text, #f8fafc);
      font-size: 0.875rem;
      cursor: pointer;
      min-width: 150px;
    }
    
    .select:focus {
      outline: none;
      border-color: var(--color-primary, #6366f1);
    }
    
    /* Button */
    .btn {
      padding: 0.75rem 1.5rem;
      background: var(--color-primary, #6366f1);
      border: none;
      border-radius: 0.5rem;
      color: white;
      font-size: 0.9375rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .btn:hover {
      background: var(--color-primary-dark, #4f46e5);
    }
    
    .btn-secondary {
      background: var(--color-surface-light, #252542);
    }
    
    .btn-secondary:hover {
      background: var(--color-surface, #3a3a5c);
    }
    
    /* Close button */
    .close-btn {
      position: absolute;
      top: 1rem;
      inset-inline-end: 1rem;
      width: 2.5rem;
      height: 2.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-surface, #1a1a2e);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.5rem;
      color: var(--color-text-secondary, #94a3b8);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .close-btn:hover {
      color: var(--color-text, #f8fafc);
      background: var(--color-surface-light, #252542);
    }
    
    .close-btn svg {
      width: 1.25rem;
      height: 1.25rem;
    }
  `;
  
  @property({ type: String })
  theme: Theme = 'dark';
  
  @property({ type: String })
  locale: Locale = 'ar';
  
  @property({ type: String })
  direction: Direction = 'rtl';
  
  @state()
  private activeTab: SettingsTab = 'general';
  
  private configManager = getConfigManager();
  
  private setTab(tab: SettingsTab) {
    this.activeTab = tab;
  }
  
  private updateSetting(key: string, value: unknown) {
    this.configManager.set(key as any, value);
    
    this.dispatchEvent(new CustomEvent('settings-change', {
      detail: { [key]: value },
      bubbles: true,
      composed: true,
    }));
  }
  
  private handleClose() {
    this.dispatchEvent(new CustomEvent('close', {
      bubbles: true,
      composed: true,
    }));
  }
  
  render() {
    return html`
      <button class="close-btn" @click=${this.handleClose}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      
      <aside class="settings-sidebar">
        <div class="sidebar-title">${this.getLabel('settings')}</div>
        <nav class="settings-nav">
          <button 
            class="nav-item ${this.activeTab === 'general' ? 'active' : ''}"
            @click=${() => this.setTab('general')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
            ${this.getLabel('general')}
          </button>
          
          <button 
            class="nav-item ${this.activeTab === 'appearance' ? 'active' : ''}"
            @click=${() => this.setTab('appearance')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            ${this.getLabel('appearance')}
          </button>
          
          <button 
            class="nav-item ${this.activeTab === 'voice' ? 'active' : ''}"
            @click=${() => this.setTab('voice')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
            ${this.getLabel('voice')}
          </button>
          
          <button 
            class="nav-item ${this.activeTab === 'security' ? 'active' : ''}"
            @click=${() => this.setTab('security')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            ${this.getLabel('security')}
          </button>
          
          <button 
            class="nav-item ${this.activeTab === 'about' ? 'active' : ''}"
            @click=${() => this.setTab('about')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            ${this.getLabel('about')}
          </button>
        </nav>
      </aside>
      
      <main class="settings-content">
        ${this.renderContent()}
      </main>
    `;
  }
  
  private renderContent() {
    switch (this.activeTab) {
      case 'general':
        return this.renderGeneralSettings();
      case 'appearance':
        return this.renderAppearanceSettings();
      case 'voice':
        return this.renderVoiceSettings();
      case 'security':
        return this.renderSecuritySettings();
      case 'about':
        return this.renderAboutSettings();
      default:
        return this.renderGeneralSettings();
    }
  }
  
  private renderGeneralSettings() {
    return html`
      <div class="settings-section">
        <h2 class="section-title">${this.getLabel('generalSettings')}</h2>
        
        <div class="setting-group">
          <label class="setting-label">${this.getLabel('language')}</label>
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-name">${this.getLabel('language')}</div>
              <div class="setting-description">${this.getLabel('languageDesc')}</div>
            </div>
            <select 
              class="select"
              .value=${this.locale}
              @change=${(e: Event) => this.updateSetting('ui.locale', (e.target as HTMLSelectElement).value)}
            >
              <option value="ar">العربية</option>
              <option value="ar-EG">مصر (العربية)</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
        
        <div class="setting-group">
          <label class="setting-label">${this.getLabel('notifications')}</label>
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-name">${this.getLabel('enableNotifications')}</div>
              <div class="setting-description">${this.getLabel('notificationsDesc')}</div>
            </div>
            <label class="toggle">
              <input type="checkbox" checked>
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    `;
  }
  
  private renderAppearanceSettings() {
    return html`
      <div class="settings-section">
        <h2 class="section-title">${this.getLabel('appearanceSettings')}</h2>
        
        <div class="setting-group">
          <label class="setting-label">${this.getLabel('theme')}</label>
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-name">${this.getLabel('darkMode')}</div>
              <div class="setting-description">${this.getLabel('darkModeDesc')}</div>
            </div>
            <label class="toggle">
              <input 
                type="checkbox" 
                ?checked=${this.theme === 'dark'}
                @change=${(e: Event) => this.updateSetting('ui.theme', (e.target as HTMLInputElement).checked ? 'dark' : 'light')}
              >
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
        
        <div class="setting-group">
          <label class="setting-label">${this.getLabel('direction')}</label>
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-name">${this.getLabel('textDirection')}</div>
              <div class="setting-description">${this.getLabel('directionDesc')}</div>
            </div>
            <select 
              class="select"
              .value=${this.direction}
              @change=${(e: Event) => this.updateSetting('ui.direction', (e.target as HTMLSelectElement).value)}
            >
              <option value="rtl">RTL</option>
              <option value="ltr">LTR</option>
              <option value="auto">Auto</option>
            </select>
          </div>
        </div>
      </div>
    `;
  }
  
  private renderVoiceSettings() {
    return html`
      <div class="settings-section">
        <h2 class="section-title">${this.getLabel('voiceSettings')}</h2>
        
        <div class="setting-group">
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-name">${this.getLabel('wakeWord')}</div>
              <div class="setting-description">${this.getLabel('wakeWordDesc')}</div>
            </div>
            <label class="toggle">
              <input type="checkbox" checked>
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
        
        <div class="setting-group">
          <label class="setting-label">${this.getLabel('wakeWords')}</label>
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-name">${this.getLabel('customWakeWords')}</div>
              <div class="setting-description">Hey AILA, AILA, AILA Wake</div>
            </div>
            <button class="btn btn-secondary">${this.getLabel('edit')}</button>
          </div>
        </div>
      </div>
    `;
  }
  
  private renderSecuritySettings() {
    return html`
      <div class="settings-section">
        <h2 class="section-title">${this.getLabel('securitySettings')}</h2>
        
        <div class="setting-group">
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-name">${this.getLabel('voiceVerification')}</div>
              <div class="setting-description">${this.getLabel('voiceVerificationDesc')}</div>
            </div>
            <label class="toggle">
              <input type="checkbox">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
        
        <div class="setting-group">
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-name">${this.getLabel('faceRecognition')}</div>
              <div class="setting-description">${this.getLabel('faceRecognitionDesc')}</div>
            </div>
            <label class="toggle">
              <input type="checkbox">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    `;
  }
  
  private renderAboutSettings() {
    return html`
      <div class="settings-section">
        <h2 class="section-title">${this.getLabel('about')}</h2>
        
        <div class="setting-group">
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-name">AILA</div>
              <div class="setting-description">AI Life Assistant</div>
            </div>
            <span style="color: var(--color-text-secondary)">v1.0.0</span>
          </div>
        </div>
        
        <div class="setting-group">
          <p style="color: var(--color-text-secondary); line-height: 1.6;">
            ${this.getLabel('aboutDesc')}
          </p>
        </div>
      </div>
    `;
  }
  
  private getLabel(key: string): string {
    const isArabic = this.locale === 'ar' || this.locale === 'ar-EG';
    
    const labels: Record<string, Record<string, string>> = {
      settings: { ar: 'الإعدادات', en: 'Settings' },
      general: { ar: 'عام', en: 'General' },
      appearance: { ar: 'المظهر', en: 'Appearance' },
      voice: { ar: 'الصوت', en: 'Voice' },
      security: { ar: 'الأمان', en: 'Security' },
      about: { ar: 'حول', en: 'About' },
      generalSettings: { ar: 'الإعدادات العامة', en: 'General Settings' },
      language: { ar: 'اللغة', en: 'Language' },
      languageDesc: { ar: 'اختر لغة الواجهة', en: 'Choose interface language' },
      notifications: { ar: 'الإشعارات', en: 'Notifications' },
      enableNotifications: { ar: 'تفعيل الإشعارات', en: 'Enable notifications' },
      notificationsDesc: { ar: 'استلام إشعارات من AILA', en: 'Receive notifications from AILA' },
      appearanceSettings: { ar: 'إعدادات المظهر', en: 'Appearance Settings' },
      theme: { ar: 'السمة', en: 'Theme' },
      darkMode: { ar: 'الوضع الداكن', en: 'Dark Mode' },
      darkModeDesc: { ar: 'تفعيل الوضع الداكن', en: 'Enable dark mode' },
      direction: { ar: 'الاتجاه', en: 'Direction' },
      textDirection: { ar: 'اتجاه النص', en: 'Text Direction' },
      directionDesc: { ar: 'RTL أو LTR', en: 'RTL or LTR' },
      voiceSettings: { ar: 'إعدادات الصوت', en: 'Voice Settings' },
      wakeWord: { ar: 'كلمة التنبيه', en: 'Wake Word' },
      wakeWordDesc: { ar: 'استخدام كلمة تنبيه لتنشيط AILA', en: 'Use wake word to activate AILA' },
      wakeWords: { ar: 'كلمات التنبيه', en: 'Wake Words' },
      customWakeWords: { ar: 'كلمات تنبيه مخصصة', en: 'Custom wake words' },
      edit: { ar: 'تعديل', en: 'Edit' },
      securitySettings: { ar: 'إعدادات الأمان', en: 'Security Settings' },
      voiceVerification: { ar: 'التحقق من الصوت', en: 'Voice Verification' },
      voiceVerificationDesc: { ar: 'التحقق من هوية المستخدم بالصوت', en: 'Verify user identity by voice' },
      faceRecognition: { ar: 'التعرف على الوجه', en: 'Face Recognition' },
      faceRecognitionDesc: { ar: 'التحقق من هوية المستخدم بالوجه', en: 'Verify user identity by face' },
      aboutDesc: { 
        ar: 'AILA هو مساعد حياة ذكي يستخدم الذكاء الاصطناعي لمساعدتك في حياتك اليومية. يمكنه مساعدتك في البرمجة، البحث، الكتابة، إدارة المهام، والمزيد.',
        en: 'AILA is an intelligent life assistant that uses AI to help you in your daily life. It can help you with programming, research, writing, task management, and more.'
      },
    };
    
    return labels[key]?.[isArabic ? 'ar' : 'en'] || key;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'aila-settings-view': SettingsView;
  }
}
