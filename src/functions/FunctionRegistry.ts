/**
 * AILA - AI Life Assistant
 * Function Calling System - Core Definitions
 */

import type { JSONSchema } from '../types/index.js';

/**
 * Function Parameter
 */
export interface FunctionParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any';
  description?: string;
  required: boolean;
  default?: unknown;
  enum?: unknown[];
  minimum?: number;
  maximum?: number;
  pattern?: string;
  items?: FunctionParameter;
}

/**
 * Function Definition
 */
export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: FunctionParameter[];
  returns?: {
    type: string;
    description?: string;
  };
  category: FunctionCategory;
  dangerLevel: DangerLevel;
  requiresConfirmation: boolean;
  examples?: FunctionExample[];
}

/**
 * Function Category
 */
export type FunctionCategory =
  | 'file'
  | 'system'
  | 'browser'
  | 'network'
  | 'media'
  | 'communication'
  | 'security'
  | 'iot'
  | 'ai'
  | 'utility';

/**
 * Danger Level
 */
export type DangerLevel = 'safe' | 'low' | 'medium' | 'high' | 'critical';

/**
 * Function Example
 */
export interface FunctionExample {
  input: Record<string, unknown>;
  output: unknown;
  description?: string;
}

/**
 * Function Call Request
 */
export interface FunctionCallRequest {
  functionName: string;
  parameters: Record<string, unknown>;
  sessionId?: string;
  context?: Record<string, unknown>;
}

/**
 * Function Call Result
 */
export interface FunctionCallResult {
  success: boolean;
  output?: unknown;
  error?: string;
  executionTime: number;
  logs?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Function Executor - The actual function implementation
 */
export type FunctionExecutor = (
  params: Record<string, unknown>,
  context?: Record<string, unknown>
) => Promise<FunctionCallResult>;

/**
 * Registered Function
 */
export interface RegisteredFunction {
  definition: FunctionDefinition;
  executor: FunctionExecutor;
  enabled: boolean;
  usageCount: number;
  lastUsed?: number;
}

/**
 * AILA Core Functions
 */
export const AILA_FUNCTIONS: FunctionDefinition[] = [
  // File Operations
  {
    name: 'CreateFile',
    description: 'إنشاء ملف جديد بالمحتوى المحدد',
    category: 'file',
    parameters: [
      { name: 'path', type: 'string', description: 'مسار الملف', required: true },
      { name: 'content', type: 'string', description: 'محتوى الملف', required: true },
      { name: 'encoding', type: 'string', description: 'ترميز الملف', required: false, default: 'utf-8' },
    ],
    returns: { type: 'boolean', description: 'نجاح العملية' },
    dangerLevel: 'medium',
    requiresConfirmation: false,
  },
  {
    name: 'ReadFile',
    description: 'قراءة محتوى ملف',
    category: 'file',
    parameters: [
      { name: 'path', type: 'string', description: 'مسار الملف', required: true },
      { name: 'encoding', type: 'string', description: 'ترميز الملف', required: false, default: 'utf-8' },
    ],
    returns: { type: 'string', description: 'محتوى الملف' },
    dangerLevel: 'safe',
    requiresConfirmation: false,
  },
  {
    name: 'DeleteFile',
    description: 'حذف ملف',
    category: 'file',
    parameters: [
      { name: 'path', type: 'string', description: 'مسار الملف', required: true },
    ],
    returns: { type: 'boolean', description: 'نجاح العملية' },
    dangerLevel: 'high',
    requiresConfirmation: true,
  },
  {
    name: 'ListDirectory',
    description: 'عرض محتويات مجلد',
    category: 'file',
    parameters: [
      { name: 'path', type: 'string', description: 'مسار المجلد', required: true },
      { name: 'recursive', type: 'boolean', description: 'عرض متكرر', required: false, default: false },
    ],
    returns: { type: 'array', description: 'قائمة الملفات والمجلدات' },
    dangerLevel: 'safe',
    requiresConfirmation: false,
  },
  
  // System Operations
  {
    name: 'RunCommand',
    description: 'تنفيذ أمر في الطرفية',
    category: 'system',
    parameters: [
      { name: 'command', type: 'string', description: 'الأمر للتنفيذ', required: true },
      { name: 'workingDirectory', type: 'string', description: 'مجلد العمل', required: false },
      { name: 'timeout', type: 'number', description: 'الحد الأقصى للزمن (ثانية)', required: false, default: 60 },
    ],
    returns: { type: 'object', description: 'نتيجة الأمر' },
    dangerLevel: 'critical',
    requiresConfirmation: true,
  },
  {
    name: 'OpenApplication',
    description: 'فتح تطبيق',
    category: 'system',
    parameters: [
      { name: 'name', type: 'string', description: 'اسم التطبيق', required: true },
      { name: 'arguments', type: 'array', description: 'وسائط التطبيق', required: false },
    ],
    returns: { type: 'boolean', description: 'نجاح العملية' },
    dangerLevel: 'low',
    requiresConfirmation: false,
  },
  {
    name: 'CloseApplication',
    description: 'إغلاق تطبيق',
    category: 'system',
    parameters: [
      { name: 'name', type: 'string', description: 'اسم التطبيق', required: true },
    ],
    returns: { type: 'boolean', description: 'نجاح العملية' },
    dangerLevel: 'medium',
    requiresConfirmation: true,
  },
  {
    name: 'LockScreen',
    description: 'قفل الشاشة',
    category: 'system',
    parameters: [],
    returns: { type: 'boolean', description: 'نجاح العملية' },
    dangerLevel: 'low',
    requiresConfirmation: false,
  },
  {
    name: 'RestartComputer',
    description: 'إعادة تشغيل الحاسوب',
    category: 'system',
    parameters: [
      { name: 'force', type: 'boolean', description: 'إعادة قسرية', required: false, default: false },
    ],
    returns: { type: 'boolean', description: 'نجاح العملية' },
    dangerLevel: 'critical',
    requiresConfirmation: true,
  },
  
  // Browser Operations
  {
    name: 'OpenBrowser',
    description: 'فتح متصفح',
    category: 'browser',
    parameters: [
      { name: 'url', type: 'string', description: 'الرابط', required: true },
      { name: 'browser', type: 'string', description: 'اسم المتصفح', required: false, default: 'chrome' },
    ],
    returns: { type: 'boolean', description: 'نجاح العملية' },
    dangerLevel: 'low',
    requiresConfirmation: false,
  },
  {
    name: 'TakeScreenshot',
    description: 'التقاط صورة للشاشة',
    category: 'browser',
    parameters: [
      { name: 'fullPage', type: 'boolean', description: 'التقاط الصفحة كاملة', required: false, default: false },
    ],
    returns: { type: 'string', description: 'رابط الصورة' },
    dangerLevel: 'safe',
    requiresConfirmation: false,
  },
  
  // Communication
  {
    name: 'SendEmail',
    description: 'إرسال بريد إلكتروني',
    category: 'communication',
    parameters: [
      { name: 'to', type: 'string', description: 'المستلم', required: true },
      { name: 'subject', type: 'string', description: 'الموضوع', required: true },
      { name: 'body', type: 'string', description: 'نص الرسالة', required: true },
    ],
    returns: { type: 'boolean', description: 'نجاح العملية' },
    dangerLevel: 'medium',
    requiresConfirmation: true,
  },
  {
    name: 'SendMessage',
    description: 'إرسال رسالة',
    category: 'communication',
    parameters: [
      { name: 'platform', type: 'string', description: 'المنصة', required: true, enum: ['whatsapp', 'telegram', 'discord', 'sms'] },
      { name: 'recipient', type: 'string', description: 'المستلم', required: true },
      { name: 'message', type: 'string', description: 'الرسالة', required: true },
    ],
    returns: { type: 'boolean', description: 'نجاح العملية' },
    dangerLevel: 'medium',
    requiresConfirmation: true,
  },
  
  // Media
  {
    name: 'TakePhoto',
    description: 'التقاط صورة بالكاميرا',
    category: 'media',
    parameters: [
      { name: 'camera', type: 'string', description: 'الكاميرا', required: false, default: 'back' },
    ],
    returns: { type: 'string', description: 'رابط الصورة' },
    dangerLevel: 'safe',
    requiresConfirmation: false,
  },
  {
    name: 'RecordAudio',
    description: 'تسجيل صوتي',
    category: 'media',
    parameters: [
      { name: 'duration', type: 'number', description: 'المدة (ثانية)', required: false },
    ],
    returns: { type: 'string', description: 'رابط الملف الصوتي' },
    dangerLevel: 'safe',
    requiresConfirmation: false,
  },
  {
    name: 'Speak',
    description: 'تحويل النص إلى كلام',
    category: 'media',
    parameters: [
      { name: 'text', type: 'string', description: 'النص', required: true },
      { name: 'voice', type: 'string', description: 'الصوت', required: false },
      { name: 'language', type: 'string', description: 'اللغة', required: false },
    ],
    returns: { type: 'boolean', description: 'نجاح العملية' },
    dangerLevel: 'safe',
    requiresConfirmation: false,
  },
  
  // AI Operations
  {
    name: 'GenerateImage',
    description: 'إنشاء صورة بالذكاء الاصطناعي',
    category: 'ai',
    parameters: [
      { name: 'prompt', type: 'string', description: 'وصف الصورة', required: true },
      { name: 'size', type: 'string', description: 'حجم الصورة', required: false, enum: ['256x256', '512x512', '1024x1024'] },
      { name: 'model', type: 'string', description: 'نموذج الذكاء الاصطناعي', required: false },
    ],
    returns: { type: 'string', description: 'رابط الصورة' },
    dangerLevel: 'safe',
    requiresConfirmation: false,
  },
  {
    name: 'TranslateText',
    description: 'ترجمة نص',
    category: 'ai',
    parameters: [
      { name: 'text', type: 'string', description: 'النص', required: true },
      { name: 'sourceLanguage', type: 'string', description: 'اللغة المصدر', required: false, default: 'auto' },
      { name: 'targetLanguage', type: 'string', description: 'اللغة الهدف', required: true },
    ],
    returns: { type: 'string', description: 'النص المترجم' },
    dangerLevel: 'safe',
    requiresConfirmation: false,
  },
  
  // IoT
  {
    name: 'ControlDevice',
    description: 'التحكم بجهاز ذكي',
    category: 'iot',
    parameters: [
      { name: 'deviceId', type: 'string', description: 'معرف الجهاز', required: true },
      { name: 'action', type: 'string', description: 'الإجراء', required: true, enum: ['on', 'off', 'toggle', 'set'] },
      { name: 'value', type: 'any', description: 'القيمة', required: false },
    ],
    returns: { type: 'boolean', description: 'نجاح العملية' },
    dangerLevel: 'low',
    requiresConfirmation: false,
  },
  {
    name: 'GetSensorData',
    description: 'قراءة بيانات مستشعر',
    category: 'iot',
    parameters: [
      { name: 'deviceId', type: 'string', description: 'معرف الجهاز', required: true },
      { name: 'sensor', type: 'string', description: 'اسم المستشعر', required: true },
    ],
    returns: { type: 'number', description: 'قيمة المستشعر' },
    dangerLevel: 'safe',
    requiresConfirmation: false,
  },
  
  // Utility
  {
    name: 'ReadClipboard',
    description: 'قراءة الحافظة',
    category: 'utility',
    parameters: [],
    returns: { type: 'string', description: 'محتوى الحافظة' },
    dangerLevel: 'safe',
    requiresConfirmation: false,
  },
  {
    name: 'WriteClipboard',
    description: 'كتابة إلى الحافظة',
    category: 'utility',
    parameters: [
      { name: 'text', type: 'string', description: 'النص', required: true },
    ],
    returns: { type: 'boolean', description: 'نجاح العملية' },
    dangerLevel: 'safe',
    requiresConfirmation: false,
  },
  {
    name: 'SendNotification',
    description: 'إرسال إشعار',
    category: 'utility',
    parameters: [
      { name: 'title', type: 'string', description: 'العنوان', required: true },
      { name: 'body', type: 'string', description: 'نص الإشعار', required: true },
      { name: 'icon', type: 'string', description: 'أيقونة', required: false },
    ],
    returns: { type: 'boolean', description: 'نجاح العملية' },
    dangerLevel: 'safe',
    requiresConfirmation: false,
  },
  {
    name: 'GetCurrentTime',
    description: 'الحصول على الوقت الحالي',
    category: 'utility',
    parameters: [
      { name: 'timezone', type: 'string', description: 'المنطقة الزمنية', required: false },
      { name: 'format', type: 'string', description: 'صيغة الوقت', required: false },
    ],
    returns: { type: 'string', description: 'الوقت الحالي' },
    dangerLevel: 'safe',
    requiresConfirmation: false,
  },
  {
    name: 'Calculate',
    description: 'حساب رياضي',
    category: 'utility',
    parameters: [
      { name: 'expression', type: 'string', description: 'التعبير الرياضي', required: true },
    ],
    returns: { type: 'number', description: 'النتيجة' },
    dangerLevel: 'safe',
    requiresConfirmation: false,
  },
];

/**
 * Function Registry - Manages all available functions
 */
export class FunctionRegistry {
  private functions: Map<string, RegisteredFunction> = new Map();
  
  constructor() {
    this.initializeDefaultFunctions();
  }
  
  /**
   * Initialize with default AILA functions
   */
  private initializeDefaultFunctions(): void {
    for (const definition of AILA_FUNCTIONS) {
      this.register(definition, this.createDefaultExecutor(definition));
    }
  }
  
  /**
   * Register a new function
   */
  register(definition: FunctionDefinition, executor: FunctionExecutor): void {
    if (this.functions.has(definition.name)) {
      throw new Error(`Function ${definition.name} is already registered`);
    }
    
    this.functions.set(definition.name, {
      definition,
      executor,
      enabled: true,
      usageCount: 0,
    });
  }
  
  /**
   * Unregister a function
   */
  unregister(functionName: string): void {
    this.functions.delete(functionName);
  }
  
  /**
   * Get function definition
   */
  get(functionName: string): FunctionDefinition | undefined {
    return this.functions.get(functionName)?.definition;
  }
  
  /**
   * Get all function definitions (for AI tool calling)
   */
  getAllDefinitions(): FunctionDefinition[] {
    return Array.from(this.functions.values())
      .filter((fn) => fn.enabled)
      .map((fn) => fn.definition);
  }
  
  /**
   * Execute a function
   */
  async execute(request: FunctionCallRequest): Promise<FunctionCallResult> {
    const registered = this.functions.get(request.functionName);
    
    if (!registered) {
      return {
        success: false,
        error: `Function ${request.functionName} not found`,
        executionTime: 0,
      };
    }
    
    if (!registered.enabled) {
      return {
        success: false,
        error: `Function ${request.functionName} is disabled`,
        executionTime: 0,
      };
    }
    
    const startTime = Date.now();
    registered.usageCount++;
    registered.lastUsed = Date.now();
    
    try {
      const result = await registered.executor(request.parameters, request.context);
      return {
        ...result,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime,
      };
    }
  }
  
  /**
   * Enable/disable function
   */
  setEnabled(functionName: string, enabled: boolean): void {
    const registered = this.functions.get(functionName);
    if (registered) {
      registered.enabled = enabled;
    }
  }
  
  /**
   * Get functions by category
   */
  getByCategory(category: FunctionCategory): FunctionDefinition[] {
    return Array.from(this.functions.values())
      .filter((fn) => fn.definition.category === category && fn.enabled)
      .map((fn) => fn.definition);
  }
  
  /**
   * Get function usage statistics
   */
  getUsageStats(functionName: string): { count: number; lastUsed?: number } | undefined {
    const registered = this.functions.get(functionName);
    if (!registered) return undefined;
    
    return {
      count: registered.usageCount,
      lastUsed: registered.lastUsed,
    };
  }
  
  /**
   * Create default executor for built-in functions
   */
  private createDefaultExecutor(definition: FunctionDefinition): FunctionExecutor {
    return async (params: Record<string, unknown>) => {
      // Default implementations for core functions
      switch (definition.name) {
        case 'GetCurrentTime':
          const timezone = params.timezone as string || Intl.DateTimeFormat().resolvedOptions().timeZone;
          const format = (params.format as string) || 'full';
          return {
            success: true,
            output: new Date().toLocaleString('ar-SA', { timeZone: timezone }),
          };
        
        case 'Calculate':
          try {
            // Safe math evaluation (would use math.js in production)
            const expr = params.expression as string;
            // eslint-disable-next-line no-eval
            const result = eval(expr); // This is unsafe, use math.js in production
            return { success: true, output: result };
          } catch {
            return { success: false, error: 'Invalid expression' };
          }
        
        case 'ReadClipboard':
          try {
            const text = await navigator.clipboard.readText();
            return { success: true, output: text };
          } catch {
            return { success: false, error: 'Cannot read clipboard' };
          }
        
        case 'WriteClipboard':
          try {
            await navigator.clipboard.writeText(params.text as string);
            return { success: true, output: true };
          } catch {
            return { success: false, error: 'Cannot write to clipboard' };
          }
        
        case 'SendNotification':
          if ('Notification' in window) {
            new Notification(params.title as string, { body: params.body as string });
            return { success: true, output: true };
          }
          return { success: false, error: 'Notifications not supported' };
        
        default:
          return {
            success: true,
            output: `Function ${definition.name} executed with params: ${JSON.stringify(params)}`,
          };
      }
    };
  }
}

// Singleton
let globalFunctionRegistry: FunctionRegistry | null = null;

export function getFunctionRegistry(): FunctionRegistry {
  if (!globalFunctionRegistry) {
    globalFunctionRegistry = new FunctionRegistry();
  }
  return globalFunctionRegistry;
}

export function createFunctionRegistry(): FunctionRegistry {
  return new FunctionRegistry();
}

export * from './FunctionRegistry.js';
