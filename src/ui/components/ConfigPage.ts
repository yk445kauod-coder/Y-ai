/**
 * AILA - AI Life Assistant
 * Comprehensive Configuration Page
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export interface APIKeyConfig {
  key: string;
  name: string;
  value: string;
  masked: boolean;
  description?: string;
  required?: boolean;
  docsUrl?: string;
}

export interface ConfigSection {
  id: string;
  title: string;
  titleEn: string;
  icon: string;
  items: ConfigItem[];
}

export interface ConfigItem {
  key: string;
  label: string;
  labelEn: string;
  type: 'text' | 'password' | 'select' | 'toggle' | 'number' | 'color';
  value?: unknown;
  options?: { value: string; label: string }[];
  placeholder?: string;
  description?: string;
  descriptionEn?: string;
  required?: boolean;
  sensitive?: boolean;
  category?: string;
}

@customElement('aila-config-page')
export class ConfigPage extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: 'Press Start 2P', 'Pixelify Sans', 'Tajawal', system-ui, sans-serif;
      --primary: #6366f1;
      --success: #22c55e;
      --error: #ef4444;
      --warning: #f59e0b;
    }

    .config-page {
      display: flex;
      min-height: 100vh;
      background: var(--bg-primary, #0f0f1a);
    }

    .config-sidebar {
      width: 280px;
      background: var(--bg-secondary, #1a1a2e);
      border-inline-end: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      padding: 24px 16px;
      overflow-y: auto;
    }

    .config-header {
      padding: 0 12px 24px;
      border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      margin-bottom: 24px;
    }

    .config-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .config-logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--primary), #8b5cf6);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }

    .config-logo-text {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary, #f8fafc);
    }

    .config-version {
      font-size: 11px;
      color: var(--text-secondary, #94a3b8);
    }

    .config-nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 10px;
      border: none;
      background: transparent;
      color: var(--text-secondary, #94a3b8);
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      width: 100%;
      text-align: start;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-primary, #f8fafc);
    }

    .nav-item.active {
      background: var(--primary);
      color: white;
    }

    .nav-item-icon {
      font-size: 18px;
      width: 24px;
      text-align: center;
    }

    .nav-item-badge {
      margin-inline-start: auto;
      padding: 2px 8px;
      background: var(--success);
      border-radius: 10px;
      font-size: 9px;
      color: white;
    }

    /* Main Content */
    .config-content {
      flex: 1;
      padding: 32px;
      overflow-y: auto;
    }

    .content-header {
      margin-bottom: 32px;
    }

    .content-title {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary, #f8fafc);
      margin-bottom: 8px;
    }

    .content-description {
      font-size: 13px;
      color: var(--text-secondary, #94a3b8);
      line-height: 1.6;
    }

    .config-section {
      background: var(--bg-secondary, #1a1a2e);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    }

    .section-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--primary), #8b5cf6);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary, #f8fafc);
    }

    /* Config Items */
    .config-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 16px;
      background: var(--bg-tertiary, #252542);
      border-radius: 12px;
      margin-bottom: 12px;
    }

    .config-item:last-child {
      margin-bottom: 0;
    }

    .item-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .item-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary, #f8fafc);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .item-required {
      color: var(--error);
      font-size: 10px;
    }

    .item-description {
      font-size: 11px;
      color: var(--text-secondary, #94a3b8);
      margin-top: 4px;
    }

    .item-input-wrapper {
      position: relative;
    }

    .item-input {
      width: 100%;
      padding: 12px 16px;
      background: var(--bg-secondary, #1a1a2e);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      border-radius: 8px;
      color: var(--text-primary, #f8fafc);
      font-size: 13px;
      font-family: inherit;
      transition: all 0.2s ease;
    }

    .item-input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }

    .item-input::placeholder {
      color: var(--text-secondary, #94a3b8);
    }

    .item-input.password {
      padding-inline-end: 48px;
    }

    .input-toggle {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 40px;
      background: transparent;
      border: none;
      color: var(--text-secondary, #94a3b8);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      transition: color 0.2s ease;
    }

    .input-toggle:hover {
      color: var(--text-primary, #f8fafc);
    }

    .input-save-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      padding: 6px 12px;
      background: var(--primary);
      border: none;
      border-radius: 6px;
      color: white;
      font-size: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .input-save-btn:hover {
      background: #4f46e5;
    }

    .input-status {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 8px;
      font-size: 11px;
    }

    .input-status.saved {
      color: var(--success);
    }

    .input-status.error {
      color: var(--error);
    }

    /* Toggle Switch */
    .toggle-switch {
      position: relative;
      width: 48px;
      height: 28px;
      background: var(--bg-secondary, #1a1a2e);
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .toggle-switch.active {
      background: var(--primary);
    }

    .toggle-switch::after {
      content: '';
      position: absolute;
      top: 4px;
      inset-inline-start: 4px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .toggle-switch.active::after {
      transform: translateX(20px);
    }

    /* Select */
    .item-select {
      width: 100%;
      padding: 12px 16px;
      background: var(--bg-secondary, #1a1a2e);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      border-radius: 8px;
      color: var(--text-primary, #f8fafc);
      font-size: 13px;
      font-family: inherit;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: inline-end 16px center;
      padding-inline-end: 40px;
    }

    .item-select:focus {
      outline: none;
      border-color: var(--primary);
    }

    /* Save Button */
    .save-section {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }

    .save-btn {
      padding: 14px 28px;
      border: none;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .save-btn.primary {
      background: var(--primary);
      color: white;
    }

    .save-btn.primary:hover {
      background: #4f46e5;
      transform: translateY(-2px);
    }

    .save-btn.secondary {
      background: var(--bg-tertiary, #252542);
      color: var(--text-primary, #f8fafc);
    }

    .save-btn.secondary:hover {
      background: var(--bg-secondary, #1a1a2e);
    }

    /* Status Badge */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 500;
    }

    .status-badge.connected {
      background: rgba(34, 197, 94, 0.2);
      color: var(--success);
    }

    .status-badge.disconnected {
      background: rgba(239, 68, 68, 0.2);
      color: var(--error);
    }

    .status-badge.warning {
      background: rgba(245, 158, 11, 0.2);
      color: var(--warning);
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    /* Test Connection */
    .test-connection {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: var(--bg-secondary, #1a1a2e);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      border-radius: 8px;
      color: var(--text-secondary, #94a3b8);
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .test-connection:hover {
      border-color: var(--primary);
      color: var(--primary);
    }

    /* RTL Support */
    :host([dir="rtl"]) .config-page {
      direction: rtl;
    }
  `;

  @property({ type: String })
  activeSection = 'api-keys';

  @property({ type: String })
  dir: 'rtl' | 'ltr' = 'rtl';

  @state()
  private configValues: Record<string, Record<string, string | boolean>> = {
    'api-keys': {
      openai_key: '',
      anthropic_key: '',
      groq_key: '',
      gemini_key: '',
    },
    'firebase': {
      firebase_api_key: '',
      firebase_auth_domain: '',
      firebase_database_url: '',
      firebase_project_id: '',
      firebase_storage_bucket: '',
      firebase_messaging_sender_id: '',
      firebase_app_id: '',
    },
    'supabase': {
      supabase_url: '',
      supabase_anon_key: '',
      supabase_service_key: '',
    },
    'voice': {
      elevenlabs_key: '',
      polliations_voice: 'af_heart',
      tts_provider: 'pollinations',
      stt_provider: 'web_speech',
    },
    'storage': {
      imagekit_public_key: '',
      imagekit_private_key: '',
      cloudflare_r2_account_id: '',
      cloudflare_r2_access_key: '',
      aws_access_key: '',
      aws_secret_key: '',
    },
  };

  private sections = [
    { id: 'api-keys', icon: '🔑', title: 'مفاتيح API', titleEn: 'API Keys' },
    { id: 'firebase', icon: '🔥', title: 'Firebase', titleEn: 'Firebase' },
    { id: 'supabase', icon: '⚡', title: 'Supabase', titleEn: 'Supabase' },
    { id: 'voice', icon: '🎙️', title: 'الصوت', titleEn: 'Voice' },
    { id: 'storage', icon: '💾', title: 'التخزين', titleEn: 'Storage' },
    { id: 'appearance', icon: '🎨', title: 'المظهر', titleEn: 'Appearance' },
    { id: 'advanced', icon: '⚙️', title: 'متقدم', titleEn: 'Advanced' },
  ];

  private apiKeyConfigs: Record<string, ConfigItem[]> = {
    'api-keys': [
      { key: 'openai_key', label: 'OpenAI API Key', labelEn: 'OpenAI API Key', type: 'password', placeholder: 'sk-...', description: 'مفتاح API الخاص بـ OpenAI للنماذج GPT', sensitive: true, required: true },
      { key: 'anthropic_key', label: 'Anthropic API Key', labelEn: 'Anthropic API Key', type: 'password', placeholder: 'sk-ant-...', description: 'مفتاح API الخاص بـ Claude', sensitive: true },
      { key: 'groq_key', label: 'Groq API Key', labelEn: 'Groq API Key', type: 'password', placeholder: 'gsk_...', description: 'مفتاح API الخاص بـ Groq للنماذج السريعة', sensitive: true },
      { key: 'gemini_key', label: 'Google Gemini API Key', labelEn: 'Google Gemini API Key', type: 'password', placeholder: 'AIza...', description: 'مفتاح API الخاص بـ Google Gemini', sensitive: true },
    ],
    'firebase': [
      { key: 'firebase_api_key', label: 'API Key', labelEn: 'API Key', type: 'password', placeholder: 'AIza...', sensitive: true },
      { key: 'firebase_auth_domain', label: 'Auth Domain', labelEn: 'Auth Domain', type: 'text', placeholder: 'project.firebaseapp.com' },
      { key: 'firebase_database_url', label: 'Database URL', labelEn: 'Database URL', type: 'text', placeholder: 'https://project.firebaseio.com' },
      { key: 'firebase_project_id', label: 'Project ID', labelEn: 'Project ID', type: 'text', placeholder: 'project-id' },
      { key: 'firebase_storage_bucket', label: 'Storage Bucket', labelEn: 'Storage Bucket', type: 'text', placeholder: 'project.appspot.com' },
      { key: 'firebase_app_id', label: 'App ID', labelEn: 'App ID', type: 'text', placeholder: '1:123456789:web:abc123' },
    ],
    'supabase': [
      { key: 'supabase_url', label: 'Project URL', labelEn: 'Project URL', type: 'text', placeholder: 'https://project.supabase.co', required: true },
      { key: 'supabase_anon_key', label: 'Anon Key', labelEn: 'Anon Key', type: 'password', placeholder: 'eyJ...', sensitive: true },
      { key: 'supabase_service_key', label: 'Service Role Key', labelEn: 'Service Role Key', type: 'password', placeholder: 'eyJ...', sensitive: true, description: 'يُستخدم للعمليات الإدارية فقط', required: true },
    ],
    'voice': [
      { key: 'elevenlabs_key', label: 'ElevenLabs API Key', labelEn: 'ElevenLabs API Key', type: 'password', placeholder: '...', sensitive: true, description: 'صوت عالي الجودة من ElevenLabs (اختياري)' },
      { key: 'polliations_voice', label: 'Pollinations Voice', labelEn: 'Pollinations Voice', type: 'select', options: [
        { value: 'af_heart', label: 'AF Heart - أنثوي' },
        { value: 'af_bella', label: 'AF Bella - أنثوي' },
        { value: 'af_nicole', label: 'AF Nicole - أنثوي' },
        { value: 'am_adam', label: 'AM Adam - ذكوري' },
        { value: 'am_michael', label: 'AM Michael - ذكوري' },
      ], description: 'صوت Pollinations المجاني عالي الجودة' },
      { key: 'tts_provider', label: 'مزود TTS', labelEn: 'TTS Provider', type: 'select', options: [
        { value: 'pollinations', label: 'Pollinations (مجاني)' },
        { value: 'elevenlabs', label: 'ElevenLabs (مدفوع)' },
        { value: 'web_speech', label: 'Web Speech API' },
      ]},
      { key: 'stt_provider', label: 'مزود STT', labelEn: 'STT Provider', type: 'select', options: [
        { value: 'web_speech', label: 'Web Speech API' },
        { value: 'pollinations', label: 'Pollinations Whisper' },
      ]},
    ],
    'storage': [
      { key: 'imagekit_public_key', label: 'ImageKit Public Key', labelEn: 'ImageKit Public Key', type: 'text', placeholder: '...' },
      { key: 'imagekit_private_key', label: 'ImageKit Private Key', labelEn: 'ImageKit Private Key', type: 'password', placeholder: '...', sensitive: true },
      { key: 'cloudflare_r2_account_id', label: 'Cloudflare R2 Account ID', labelEn: 'Cloudflare R2 Account ID', type: 'text', placeholder: '...' },
      { key: 'cloudflare_r2_access_key', label: 'Cloudflare R2 Access Key', labelEn: 'Cloudflare R2 Access Key', type: 'password', placeholder: '...' },
    ],
    'appearance': [
      { key: 'theme', label: 'السمة', labelEn: 'Theme', type: 'select', options: [
        { value: 'dark', label: 'داكن' },
        { value: 'light', label: 'فاتح' },
        { value: 'auto', label: 'تلقائي' },
      ]},
      { key: 'font_size', label: 'حجم الخط', labelEn: 'Font Size', type: 'select', options: [
        { value: 'small', label: 'صغير' },
        { value: 'medium', label: 'متوسط' },
        { value: 'large', label: 'كبير' },
      ]},
      { key: 'font', label: 'الخط', labelEn: 'Font', type: 'select', options: [
        { value: 'pixel', label: 'Pixel Art (Press Start 2P)' },
        { value: 'arabic', label: 'Tajawal (عربي)' },
        { value: 'default', label: 'Default' },
      ]},
    ],
    'advanced': [
      { key: 'max_tokens', label: 'الحد الأقصى للتوكنز', labelEn: 'Max Tokens', type: 'number', placeholder: '4096' },
      { key: 'temperature', label: 'درجة الحرارة', labelEn: 'Temperature', type: 'number', placeholder: '0.7' },
      { key: 'debug_mode', label: 'وضع التصحيح', labelEn: 'Debug Mode', type: 'toggle' },
      { key: 'auto_save', label: 'حفظ تلقائي', labelEn: 'Auto Save', type: 'toggle' },
    ],
  };

  private handleNavClick(sectionId: string) {
    this.activeSection = sectionId;
  }

  private handleConfigChange(sectionId: string, key: string, value: string | boolean) {
    this.configValues[sectionId] = {
      ...this.configValues[sectionId],
      [key]: value,
    };
  }

  private getValue(sectionId: string, key: string): string {
    return (this.configValues[sectionId]?.[key] as string) || '';
  }

  private getToggleValue(sectionId: string, key: string): boolean {
    return (this.configValues[sectionId]?.[key] as boolean) || false;
  }

  private saveConfig(sectionId: string) {
    // Save to localStorage
    localStorage.setItem(`aila_config_${sectionId}`, JSON.stringify(this.configValues[sectionId]));
    
    // Dispatch event
    this.dispatchEvent(new CustomEvent('config-saved', {
      detail: { sectionId, values: this.configValues[sectionId] },
      bubbles: true,
      composed: true,
    }));
  }

  private loadConfig(sectionId: string) {
    const saved = localStorage.getItem(`aila_config_${sectionId}`);
    if (saved) {
      try {
        this.configValues[sectionId] = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load config:', e);
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();
    // Load all configs
    Object.keys(this.configValues).forEach(sectionId => this.loadConfig(sectionId));
  }

  render() {
    const isArabic = this.dir === 'rtl';
    
    return html`
      <div class="config-page" dir="${this.dir}">
        <aside class="config-sidebar">
          <div class="config-header">
            <div class="config-logo">
              <div class="config-logo-icon">🤖</div>
              <div class="config-logo-text">AILA</div>
            </div>
            <div class="config-version">v2.0.0 • Production</div>
          </div>
          
          <nav class="config-nav">
            ${this.sections.map(section => html`
              <button 
                class="nav-item ${this.activeSection === section.id ? 'active' : ''}"
                @click=${() => this.handleNavClick(section.id)}
              >
                <span class="nav-item-icon">${section.icon}</span>
                <span>${isArabic ? section.title : section.titleEn}</span>
                ${section.id === 'api-keys' ? html`<span class="nav-item-badge">${isArabic ? 'ضروري' : 'Required'}</span>` : ''}
              </button>
            `)}
          </nav>
        </aside>
        
        <main class="config-content">
          <div class="content-header">
            <h1 class="content-title">${isArabic ? 'الإعدادات' : 'Settings'}</h1>
            <p class="content-description">
              ${isArabic 
                ? 'إدارة مفاتيح API والتكوينات المختلفة لـ AILA'
                : 'Manage API keys and configurations for AILA'
              }
            </p>
          </div>
          
          ${this.renderSection()}
          
          <div class="save-section">
            <button class="save-btn primary" @click=${() => this.saveConfig(this.activeSection)}>
              💾 ${isArabic ? 'حفظ التغييرات' : 'Save Changes'}
            </button>
            <button class="save-btn secondary">
              🔄 ${isArabic ? 'إعادة تعيين' : 'Reset'}
            </button>
          </div>
        </main>
      </div>
    `;
  }

  private renderSection() {
    const isArabic = this.dir === 'rtl';
    const items = this.apiKeyConfigs[this.activeSection] || [];
    const section = this.sections.find(s => s.id === this.activeSection);
    
    return html`
      <div class="config-section">
        <div class="section-header">
          <div class="section-icon">${section?.icon}</div>
          <div class="section-title">${isArabic ? section?.title : section?.titleEn}</div>
        </div>
        
        ${items.map(item => this.renderConfigItem(item))}
      </div>
    `;
  }

  private renderConfigItem(item: ConfigItem) {
    const sectionId = this.activeSection;
    const isArabic = this.dir === 'rtl';
    
    return html`
      <div class="config-item">
        <div class="item-header">
          <label class="item-label">
            ${isArabic ? item.label : item.labelEn}
            ${item.required ? html`<span class="item-required">*</span>` : ''}
          </label>
        </div>
        
        ${item.type === 'toggle' ? html`
          <div 
            class="toggle-switch ${this.getToggleValue(sectionId, item.key) ? 'active' : ''}"
            @click=${() => this.handleConfigChange(sectionId, item.key, !this.getToggleValue(sectionId, item.key))}
          ></div>
        ` : item.type === 'select' ? html`
          <select 
            class="item-select"
            .value=${this.getValue(sectionId, item.key)}
            @change=${(e: Event) => this.handleConfigChange(sectionId, item.key, (e.target as HTMLSelectElement).value)}
          >
            ${item.options?.map(opt => html`
              <option value=${opt.value}>${opt.label}</option>
            `)}
          </select>
        ` : html`
          <div class="item-input-wrapper">
            <input 
              type="${item.type === 'password' ? 'password' : 'text'}"
              class="item-input ${item.type === 'password' ? 'password' : ''}"
              .value=${this.getValue(sectionId, item.key)}
              placeholder=${item.placeholder || ''}
              @input=${(e: Event) => this.handleConfigChange(sectionId, item.key, (e.target as HTMLInputElement).value)}
            />
            ${item.type === 'password' ? html`
              <button class="input-toggle" @click=${() => {}}>
                👁️
              </button>
            ` : ''}
          </div>
        `}
        
        ${item.description ? html`
          <div class="item-description">${isArabic ? item.description : item.descriptionEn}</div>
        ` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'aila-config-page': ConfigPage;
  }
}
