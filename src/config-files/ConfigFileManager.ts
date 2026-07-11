/**
 * AILA - AI Life Assistant
 * Config Files System - Markdown-based Configuration
 */

import { getStorage } from '../storage/index.js';

/**
 * Config File Types
 */
export type ConfigFileType =
  | 'persona'
  | 'owner'
  | 'memory'
  | 'voice'
  | 'skills'
  | 'agents'
  | 'tools'
  | 'functions'
  | 'permissions'
  | 'security'
  | 'automation'
  | 'projects'
  | 'devices'
  | 'workspace'
  | 'browser'
  | 'computer'
  | 'phone'
  | 'robotics'
  | 'plugins'
  | 'extensions'
  | 'rules'
  | 'coding'
  | 'style'
  | 'prompts'
  | 'wakewords'
  | 'logs';

/**
 * Config File Entry
 */
export interface ConfigFile {
  type: ConfigFileType;
  name: string;
  nameAr: string;
  content: string;
  lastModified: number;
  version: string;
}

/**
 * Default Config File Templates
 */
export const DEFAULT_CONFIG_FILES: Record<ConfigFileType, Partial<ConfigFile>> = {
  persona: {
    name: 'Persona',
    nameAr: 'الشخصية',
    content: `# شخصية AILA

## الهوية
- الاسم: AILA
- اللقب: مساعد الحياة الذكي
- العمر: غير محدد (ذكاء اصطناعي)
- اللغة: العربية والإنجليزية

## الشخصية
- ودود ومهذب
- ذكي وسريع الاستجابة
- صبور ومتفهم
- احترافي ومهني
- مبتكر ومبدع

## السلوكيات
- يفضل العربية الفصحى في التواصل الرسمي
- يستخدم اللهجة المصرية في المحادثات اليومية
- يقدم إجابات واضحة ومختصرة
- يسأل أسئلة توضيحية عند الحاجة
- يعترف بأخطائه ويتعلم منها

## القيود
- لا يكذب أبداً
- لا يشارك معلومات حساسة
- يحترم خصوصية المستخدم
- يطلب تأكيد قبل تنفيذ إجراءات مهمة
`,
  },

  owner: {
    name: 'Owner',
    nameAr: 'المالك',
    content: `# معلومات المالك

## البيانات الأساسية
- الاسم: [أدخل اسمك]
- البريد الإلكتروني: [أدخل بريدك]
- رقم الهاتف: [أدخل رقمك]

## التفضيلات
- اللغة المفضلة: العربية
- الوضع المفضل: الوضع الداكن
- ساعات العمل: [أدخل ساعات العمل]

## الأمان
- مستوى الأمان: [اختر مستوى الأمان]
- طريقة التحقق: [اختر طريقة التحقق]
- كلمات التنبيه المسموحة: Hey AILA, AILA, AILA Wake
`,
  },

  memory: {
    name: 'Memory',
    nameAr: 'الذاكرة',
    content: `# إعدادات الذاكرة

## الذاكرة قصيرة المدى
- الحد الأقصى: 100 عنصر
- مدة الحفظ: الجلسة الحالية

## الذاكرة طويلة المدى
- مفعل: true
- ضغط تلقائي: true
- ملخصات تلقائية: true

## الذاكرة الدلالية
- مفعل: true
- نموذج التضمين: default
- الحد الأقصى للأdocuments: 10000

## الأرشفة
- أرشفة تلقائية للذكريات القديمة: true
- مدة الحفظ قبل الأرشفة: 30 يوم
`,
  },

  voice: {
    name: 'Voice',
    nameAr: 'الصوت',
    content: `# إعدادات الصوت

## Wake Word
- مفعل: true
- الكلمات: Hey AILA, AILA, AILA Wake
- الحساسية: 0.6
- اللغة: ar

## TTS (تحويل النص إلى كلام)
- المزود: edge
- الصوت: ar-SA-SalmaNeural
- السرعة: 1.0
- النبرة: 1.0

## STT (تحويل الكلام إلى نص)
- المزود: browser
- اللغة: ar-SA
- نتائج مؤقتة: true
`,
  },

  skills: {
    name: 'Skills',
    nameAr: 'القدرات',
    content: `# إعدادات القدرات

## القدرات المفعلة
- البرمجة: enabled
- البحث: enabled
- التواصل: enabled
- الأتمتة: enabled
- التحليل: enabled
- الإبداع: enabled

## أولوية القدرات
1. البرمجة (critical)
2. البحث (high)
3. التواصل (medium)
`,
  },

  agents: {
    name: 'Agents',
    nameAr: 'الوكلاء',
    content: `# إعدادات الوكلاء

## الوكلاء المفعلون
- وكيل التخطيط: enabled
- وكيل البرمجة: enabled
- وكيل البحث: enabled
- وكيل الذاكرة: enabled
- وكيل الأمان: enabled

## عدد الوكلاء المتوازيين
- الحد الأقصى: 3
`,
  },

  tools: {
    name: 'Tools',
    nameAr: 'الأدوات',
    content: `# إعدادات الأدوات

## الأدوات المفعلة
- المتصفح: enabled
- البحث في الويب: enabled
- الملفات: enabled
- البريد: enabled
- الإشعارات: enabled

## حدود الاستخدام
- البحث: 100 طلب/ساعة
- الملفات: 50 عملية/ساعة
`,
  },

  functions: {
    name: 'Functions',
    nameAr: 'الوظائف',
    content: `# إعدادات الوظائف

## الوظائف الآمنة (بدون تأكيد)
- ReadClipboard
- WriteClipboard
- GetCurrentTime
- Calculate
- SendNotification

## الوظائف التي تتطلب تأكيد
- CreateFile
- DeleteFile
- SendEmail
- RunCommand
- ControlDevice
`,
  },

  permissions: {
    name: 'Permissions',
    nameAr: 'الصلاحيات',
    content: `# الصلاحيات

## صلاحيات المتصفح
- التقاط صور الشاشة: allow
- الوصول إلى الكاميرا: allow
- الوصول إلى الميكروفون: allow
- إدارة الملفات: prompt

## صلاحيات الجهاز
- التحكم بالأجهزة الذكية: allow
- إرسال الإشعارات: allow
- الوصول للموقع: prompt
`,
  },

  security: {
    name: 'Security',
    nameAr: 'الأمان',
    content: `# إعدادات الأمان

## وضع الأمان
- الوضع الحالي: open
- متاح: open, wake-word, voice, face, secure, custom

## التحقق من الهوية
- التحقق الصوتي: false
- التعرف على الوجه: false
- المصادقة الحيوية: false

## كلمات التنبيه
- Hey AILA (الافتراضي)
- AILA
- AILA Wake
`,
  },

  automation: {
    name: 'Automation',
    nameAr: 'الأتمتة',
    content: `# إعدادات الأتمتة

## سير العمل المحفوظ
- [قائمة سير العمل]

## المحفزات
- البحث عن تحديثات: كل ساعة
- النسخ الاحتياطي: يومياً
- تنظيف الملفات المؤقتة: أسبوعياً
`,
  },

  projects: {
    name: 'Projects',
    nameAr: 'المشاريع',
    content: `# المشاريع

## المشروع الحالي
- [اسم المشروع]
- [الوصف]
- [الرابط]

## المشاريع السابقة
- [قائمة المشاريع]
`,
  },

  devices: {
    name: 'Devices',
    nameAr: 'الأجهزة',
    content: `# الأجهزة

## الأجهزة المتصلة
- [قائمة الأجهزة]

## إعدادات IoT
- MQTT Broker: [العنوان]
- Discovery التلقائي: true
`,
  },

  workspace: {
    name: 'Workspace',
    nameAr: 'مساحة العمل',
    content: `# مساحة العمل

## المجلدات
- الجذر: ~/AILA
- المشاريع: ~/AILA/Projects
- الذاكرة: ~/AILA/Memory
- الإعدادات: ~/AILA/Config
`,
  },

  browser: {
    name: 'Browser',
    nameAr: 'المتصفح',
    content: `# إعدادات المتصفح

## المتصفح الافتراضي
- Chrome

## الإضافات المفعلة
- [قائمة الإضافات]
`,
  },

  computer: {
    name: 'Computer',
    nameAr: 'الحاسوب',
    content: `# إعدادات الحاسوب

## التطبيقات المفضلة
- محرر الكود: VS Code
- الطرفية: Terminal
- الملفات: Finder
`,
  },

  phone: {
    name: 'Phone',
    nameAr: 'الهاتف',
    content: `# إعدادات الهاتف

## التطبيقات المتصلة
- [قائمة التطبيقات]

## الصلاحيات
- الإشعارات: allow
- الرسائل: prompt
`,
  },

  robotics: {
    name: 'Robotics',
    nameAr: 'الروبوتات',
    content: `# إعدادات الروبوتات

## الأجهزة المدعومة
- ESP32: enabled
- Arduino: enabled
- Raspberry Pi: enabled
`,
  },

  plugins: {
    name: 'Plugins',
    nameAr: 'الإضافات',
    content: `# الإضافات

## الإضافات المثبتة
- [قائمة الإضافات]

## الإضافات المتاحة
- [قائمة متجر الإضافات]
`,
  },

  extensions: {
    name: 'Extensions',
    nameAr: 'الامتدادات',
    content: `# الامتدادات

## امتدادات المتصفح
- [قائمة الامتدادات]
`,
  },

  rules: {
    name: 'Rules',
    nameAr: 'القواعد',
    content: `# القواعد

## قواعد الأتمتة
- [قائمة القواعد]

## الشروط
- [قائمة الشروط]
`,
  },

  coding: {
    name: 'Coding',
    nameAr: 'البرمجة',
    content: `# إعدادات البرمجة

## لغات البرمجة المفضلة
- TypeScript
- Python
- JavaScript

## إعدادات المشاريع
- منسق الكود: Prettier
- linter: ESLint
- مدير الحزم: npm
`,
  },

  style: {
    name: 'Style',
    nameAr: 'الأسلوب',
    content: `# أسلوب الكتابة

## النبرة
- رسمية:研究报告، emails
- غير رسمية: محادثات يومية

## التنسيق
- اللغة: العربية
- الاتجاه: RTL
`,
  },

  prompts: {
    name: 'Prompts',
    nameAr: 'الأنماط',
    content: `# قوالب الأوامر

## أوامر سريعة
- /help: مساعدة
- /search: بحث
- /code: كتابة كود
`,
  },

  wakewords: {
    name: 'Wake Words',
    nameAr: 'كلمات التنبيه',
    content: `# كلمات التنبيه

## الكلمات المفعلة
- Hey AILA: enabled, ar, 0.6
- AILA: enabled, ar, 0.7
- AILA Wake: enabled, ar, 0.5

## إعدادات الحساسية
- الحد الأدنى: 0.3
- الحد الأقصى: 0.9
`,
  },

  logs: {
    name: 'Logs',
    nameAr: 'السجلات',
    content: `# إعدادات السجلات

## مستوى التسجيل
- current: info
- available: trace, debug, info, warn, error, fatal

## تخزين السجلات
- الحد الأقصى: 1000 إدخال
- مدة الحفظ: 7 أيام
`,
};

/**
 * Config File Manager
 */
export class ConfigFileManager {
  private files: Map<ConfigFileType, ConfigFile> = new Map();
  private listeners: Set<(type: ConfigFileType, file: ConfigFile) => void> = new Set();
  
  constructor() {
    this.initializeDefaults();
  }
  
  /**
   * Initialize with default config files
   */
  private initializeDefaults(): void {
    for (const [type, defaults] of Object.entries(DEFAULT_CONFIG_FILES)) {
      const file: ConfigFile = {
        type: type as ConfigFileType,
        name: defaults.name || type,
        nameAr: defaults.nameAr || type,
        content: defaults.content || `# ${type}\n\nConfiguration for ${type}`,
        lastModified: Date.now(),
        version: '1.0.0',
      };
      this.files.set(type as ConfigFileType, file);
    }
  }
  
  /**
   * Get a config file
   */
  get(type: ConfigFileType): ConfigFile | undefined {
    return this.files.get(type);
  }
  
  /**
   * Get all config files
   */
  getAll(): ConfigFile[] {
    return Array.from(this.files.values());
  }
  
  /**
   * Update a config file
   */
  async update(type: ConfigFileType, content: string): Promise<ConfigFile> {
    const file = this.files.get(type);
    if (!file) {
      throw new Error(`Config file ${type} not found`);
    }
    
    file.content = content;
    file.lastModified = Date.now();
    file.version = this.incrementVersion(file.version);
    
    this.notifyListeners(type, file);
    await this.persistToStorage(type, file);
    
    return file;
  }
  
  /**
   * Create a new config file
   */
  async create(type: ConfigFileType, name: string, nameAr: string, content = ''): Promise<ConfigFile> {
    if (this.files.has(type)) {
      throw new Error(`Config file ${type} already exists`);
    }
    
    const file: ConfigFile = {
      type,
      name,
      nameAr,
      content: content || `# ${name}\n\nConfiguration for ${name}`,
      lastModified: Date.now(),
      version: '1.0.0',
    };
    
    this.files.set(type, file);
    await this.persistToStorage(type, file);
    
    return file;
  }
  
  /**
   * Delete a config file
   */
  async delete(type: ConfigFileType): Promise<void> {
    if (!this.files.has(type)) {
      throw new Error(`Config file ${type} not found`);
    }
    
    this.files.delete(type);
    await this.removeFromStorage(type);
  }
  
  /**
   * Parse config file content
   */
  parse(type: ConfigFileType): Record<string, unknown> {
    const file = this.files.get(type);
    if (!file) {
      throw new Error(`Config file ${type} not found`);
    }
    
    return this.parseMarkdown(file.content);
  }
  
  /**
   * Parse markdown content to object
   */
  private parseMarkdown(content: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const lines = content.split('\n');
    
    let currentSection = 'root';
    let currentSubsection = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Section headers
      if (trimmed.startsWith('# ')) {
        currentSection = trimmed.slice(2).trim();
        result[currentSection] = {};
        continue;
      }
      
      // Subsection headers
      if (trimmed.startsWith('## ')) {
        currentSubsection = trimmed.slice(3).trim();
        if (!result[currentSection]) result[currentSection] = {};
        (result[currentSection] as Record<string, unknown>)[currentSubsection] = {};
        continue;
      }
      
      // Key-value pairs
      const kvMatch = trimmed.match(/^-\s+(.+?):\s*(.*)$/);
      if (kvMatch) {
        const [, key, value] = kvMatch;
        const parsedValue = this.parseValue(value.trim());
        
        if (currentSubsection && typeof result[currentSection] === 'object') {
          (result[currentSection] as Record<string, unknown>)[currentSubsection] = {
            ...((result[currentSection] as Record<string, unknown>)[currentSubsection] as Record<string, unknown>),
            [key.trim()]: parsedValue,
          };
        } else {
          (result[currentSection] as Record<string, unknown>)[key.trim()] = parsedValue;
        }
      }
    }
    
    return result;
  }
  
  /**
   * Parse value from string
   */
  private parseValue(value: string): unknown {
    // Boolean
    if (value === 'true') return true;
    if (value === 'false') return false;
    
    // Number
    if (/^\d+$/.test(value)) return parseInt(value, 10);
    if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
    
    // Array (comma separated)
    if (value.startsWith('[') && value.endsWith(']')) {
      return value.slice(1, -1).split(',').map((v) => this.parseValue(v.trim()));
    }
    
    // String (remove quotes)
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }
    
    // Placeholder
    if (value.startsWith('[') && value.endsWith(']')) {
      return value;
    }
    
    return value;
  }
  
  /**
   * Export to markdown format
   */
  toMarkdown(data: Record<string, unknown>): string {
    const lines: string[] = [];
    
    for (const [section, value] of Object.entries(data)) {
      lines.push(`# ${section}\n`);
      
      if (typeof value === 'object' && value !== null) {
        for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
          if (typeof val === 'object' && val !== null) {
            lines.push(`## ${key}\n`);
            for (const [subKey, subVal] of Object.entries(val as Record<string, unknown>)) {
              lines.push(`- ${subKey}: ${this.formatValue(subVal)}`);
            }
          } else {
            lines.push(`- ${key}: ${this.formatValue(val)}`);
          }
        }
      } else {
        lines.push(`- ${this.formatValue(value)}`);
      }
      
      lines.push('');
    }
    
    return lines.join('\n');
  }
  
  /**
   * Format value for markdown
   */
  private formatValue(value: unknown): string {
    if (typeof value === 'string') {
      if (value.includes(':') || value.includes(',')) {
        return `"${value}"`;
      }
      return value;
    }
    if (Array.isArray(value)) {
      return `[${value.map((v) => this.formatValue(v)).join(', ')}]`;
    }
    return String(value);
  }
  
  /**
   * Increment version string
   */
  private incrementVersion(version: string): string {
    const parts = version.split('.');
    parts[2] = String(parseInt(parts[2], 10) + 1);
    return parts.join('.');
  }
  
  /**
   * Subscribe to config file changes
   */
  subscribe(listener: (type: ConfigFileType, file: ConfigFile) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  /**
   * Notify listeners of changes
   */
  private notifyListeners(type: ConfigFileType, file: ConfigFile): void {
    for (const listener of this.listeners) {
      try {
        listener(type, file);
      } catch (error) {
        console.error('Error in config file listener:', error);
      }
    }
  }
  
  /**
   * Persist to storage
   */
  private async persistToStorage(type: ConfigFileType, file: ConfigFile): Promise<void> {
    // In production, save to IndexedDB or cloud storage
    console.log(`Persisting config file: ${type}`);
  }
  
  /**
   * Remove from storage
   */
  private async removeFromStorage(type: ConfigFileType): Promise<void> {
    console.log(`Removing config file from storage: ${type}`);
  }
  
  /**
   * Export all config files as JSON
   */
  exportAll(): Record<ConfigFileType, string> {
    const result = {} as Record<ConfigFileType, string>;
    for (const [type, file] of this.files) {
      result[type] = file.content;
    }
    return result;
  }
  
  /**
   * Import config files from JSON
   */
  async importAll(data: Record<ConfigFileType, string>): Promise<void> {
    for (const [type, content] of Object.entries(data)) {
      await this.update(type as ConfigFileType, content);
    }
  }
  
  /**
   * Get git-compatible diff
   */
  getDiff(type: ConfigFileType, oldContent: string, newContent: string): string {
    // In production, use diff library
    return `--- a/${type}\n+++ b/${type}\n${newContent}`;
  }
}

// Singleton
let globalConfigFileManager: ConfigFileManager | null = null;

export function getConfigFileManager(): ConfigFileManager {
  if (!globalConfigFileManager) {
    globalConfigFileManager = new ConfigFileManager();
  }
  return globalConfigFileManager;
}

export function createConfigFileManager(): ConfigFileManager {
  return new ConfigFileManager();
}

export * from './ConfigFileManager.js';
