/**
 * AILA - AI Life Assistant
 * Comprehensive Tool Registry - 100+ Tools
 */

export interface Tool {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: ToolCategory;
  parameters: ToolParameter[];
  returns: string;
  permissions?: string[];
  dangerous?: boolean;
  execute(params: Record<string, unknown>): Promise<unknown>;
}

export interface ToolParameter {
  name: string;
  nameAr: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'file';
  description: string;
  descriptionAr: string;
  required?: boolean;
  default?: unknown;
  options?: string[];
}

export type ToolCategory = 
  | 'file'
  | 'system'
  | 'network'
  | 'media'
  | 'document'
  | 'data'
  | 'security'
  | 'communication'
  | 'automation'
  | 'development'
  | 'ai'
  | 'device'
  | 'browser'
  | 'office'
  | 'database';

export class ToolRegistry {
  private static instance: ToolRegistry | null = null;
  private tools: Map<string, Tool> = new Map();

  private constructor() {
    this.registerAllTools();
  }

  static getInstance(): ToolRegistry {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry();
    }
    return ToolRegistry.instance;
  }

  private registerAllTools() {
    // ============ FILE OPERATIONS (1-20) ============
    this.registerTool({
      id: 'file-read',
      name: 'Read File',
      nameAr: 'قراءة ملف',
      description: 'Read the contents of a file',
      descriptionAr: 'قراءة محتوى ملف',
      category: 'file',
      parameters: [
        { name: 'path', nameAr: 'المسار', type: 'string', description: 'File path', descriptionAr: 'مسار الملف', required: true }
      ],
      returns: 'string',
      execute: async (params) => {
        const response = await fetch(`/api/files/read?path=${encodeURIComponent(params.path as string)}`);
        return response.text();
      }
    });

    this.registerTool({
      id: 'file-write',
      name: 'Write File',
      nameAr: 'كتابة ملف',
      description: 'Write content to a file',
      descriptionAr: 'كتابة محتوى إلى ملف',
      category: 'file',
      parameters: [
        { name: 'path', nameAr: 'المسار', type: 'string', description: 'File path', descriptionAr: 'مسار الملف', required: true },
        { name: 'content', nameAr: 'المحتوى', type: 'string', description: 'File content', descriptionAr: 'محتوى الملف', required: true }
      ],
      returns: 'boolean',
      dangerous: true,
      execute: async (params) => {
        const response = await fetch('/api/files/write', {
          method: 'POST',
          body: JSON.stringify(params),
          headers: { 'Content-Type': 'application/json' }
        });
        return response.ok;
      }
    });

    this.registerTool({
      id: 'file-delete',
      name: 'Delete File',
      nameAr: 'حذف ملف',
      description: 'Delete a file',
      descriptionAr: 'حذف ملف',
      category: 'file',
      parameters: [
        { name: 'path', nameAr: 'المسار', type: 'string', description: 'File path', descriptionAr: 'مسار الملف', required: true }
      ],
      returns: 'boolean',
      dangerous: true,
      execute: async (params) => {
        const response = await fetch(`/api/files/delete?path=${encodeURIComponent(params.path as string)}`, { method: 'DELETE' });
        return response.ok;
      }
    });

    this.registerTool({
      id: 'file-copy',
      name: 'Copy File',
      nameAr: 'نسخ ملف',
      description: 'Copy a file to destination',
      descriptionAr: 'نسخ ملف إلى وجهة',
      category: 'file',
      parameters: [
        { name: 'source', nameAr: 'المصدر', type: 'string', description: 'Source path', descriptionAr: 'مسار المصدر', required: true },
        { name: 'destination', nameAr: 'الوجهة', type: 'string', description: 'Destination path', descriptionAr: 'مسار الوجهة', required: true }
      ],
      returns: 'boolean',
      dangerous: true,
      execute: async () => true
    });

    this.registerTool({
      id: 'file-move',
      name: 'Move File',
      nameAr: 'نقل ملف',
      description: 'Move a file to destination',
      descriptionAr: 'نقل ملف إلى وجهة',
      category: 'file',
      parameters: [
        { name: 'source', nameAr: 'المصدر', type: 'string', description: 'Source path', descriptionAr: 'مسار المصدر', required: true },
        { name: 'destination', nameAr: 'الوجهة', type: 'string', description: 'Destination path', descriptionAr: 'مسار الوجهة', required: true }
      ],
      returns: 'boolean',
      dangerous: true,
      execute: async () => true
    });

    this.registerTool({
      id: 'file-list',
      name: 'List Files',
      nameAr: 'قائمة الملفات',
      description: 'List files in a directory',
      descriptionAr: 'عرض قائمة الملفات في مجلد',
      category: 'file',
      parameters: [
        { name: 'path', nameAr: 'المسار', type: 'string', description: 'Directory path', descriptionAr: 'مسار المجلد', required: true },
        { name: 'recursive', nameAr: 'متكرر', type: 'boolean', description: 'List recursively', descriptionAr: 'عرض متكرر' }
      ],
      returns: 'array',
      execute: async () => []
    });

    this.registerTool({
      id: 'file-create-dir',
      name: 'Create Directory',
      nameAr: 'إنشاء مجلد',
      description: 'Create a new directory',
      descriptionAr: 'إنشاء مجلد جديد',
      category: 'file',
      parameters: [
        { name: 'path', nameAr: 'المسار', type: 'string', description: 'Directory path', descriptionAr: 'مسار المجلد', required: true }
      ],
      returns: 'boolean',
      execute: async () => true
    });

    this.registerTool({
      id: 'file-search',
      name: 'Search Files',
      nameAr: 'بحث في الملفات',
      description: 'Search for files by pattern',
      descriptionAr: 'البحث عن الملفات بواسطة نمط',
      category: 'file',
      parameters: [
        { name: 'pattern', nameAr: 'النمط', type: 'string', description: 'Search pattern', descriptionAr: 'نمط البحث', required: true },
        { name: 'path', nameAr: 'المسار', type: 'string', description: 'Start path', descriptionAr: 'مسار البداية' }
      ],
      returns: 'array',
      execute: async () => []
    });

    this.registerTool({
      id: 'file-compress',
      name: 'Compress File',
      nameAr: 'ضغط ملف',
      description: 'Compress a file or directory',
      descriptionAr: 'ضغط ملف أو مجلد',
      category: 'file',
      parameters: [
        { name: 'path', nameAr: 'المسار', type: 'string', description: 'Path to compress', descriptionAr: 'المسار للضغط', required: true },
        { name: 'format', nameAr: 'الصيغة', type: 'string', description: 'Compression format', descriptionAr: 'صيغة الضغط', options: ['zip', 'tar', 'gz'] }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'file-extract',
      name: 'Extract Archive',
      nameAr: 'استخراج أرشيف',
      description: 'Extract compressed archive',
      descriptionAr: 'استخراج أرشيف مضغوط',
      category: 'file',
      parameters: [
        { name: 'path', nameAr: 'المسار', type: 'string', description: 'Archive path', descriptionAr: 'مسار الأرشيف', required: true },
        { name: 'destination', nameAr: 'الوجهة', type: 'string', description: 'Extract destination', descriptionAr: 'وجهة الاستخراج' }
      ],
      returns: 'boolean',
      execute: async () => true
    });

    this.registerTool({
      id: 'file-info',
      name: 'Get File Info',
      nameAr: 'معلومات الملف',
      description: 'Get file metadata and info',
      descriptionAr: 'الحصول على معلومات الملف',
      category: 'file',
      parameters: [
        { name: 'path', nameAr: 'المسار', type: 'string', description: 'File path', descriptionAr: 'مسار الملف', required: true }
      ],
      returns: 'object',
      execute: async () => ({ size: 0, created: Date.now(), modified: Date.now() })
    });

    this.registerTool({
      id: 'file-hash',
      name: 'Calculate Hash',
      nameAr: 'حساب الهاش',
      description: 'Calculate file hash',
      descriptionAr: 'حساب هاش الملف',
      category: 'file',
      parameters: [
        { name: 'path', nameAr: 'المسار', type: 'string', description: 'File path', descriptionAr: 'مسار الملف', required: true },
        { name: 'algorithm', nameAr: 'الخوارزمية', type: 'string', description: 'Hash algorithm', descriptionAr: 'خوارزمية الهاش', options: ['md5', 'sha1', 'sha256'] }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'file-permissions',
      name: 'Change Permissions',
      nameAr: 'تغيير الصلاحيات',
      description: 'Change file permissions',
      descriptionAr: 'تغيير صلاحيات الملف',
      category: 'file',
      parameters: [
        { name: 'path', nameAr: 'المسار', type: 'string', description: 'File path', descriptionAr: 'مسار الملف', required: true },
        { name: 'mode', nameAr: 'الوضع', type: 'string', description: 'Permission mode', descriptionAr: 'وضع الصلاحيات', required: true }
      ],
      returns: 'boolean',
      dangerous: true,
      execute: async () => true
    });

    this.registerTool({
      id: 'file-download',
      name: 'Download File',
      nameAr: 'تحميل ملف',
      description: 'Download file from URL',
      descriptionAr: 'تحميل ملف من رابط',
      category: 'file',
      parameters: [
        { name: 'url', nameAr: 'الرابط', type: 'string', description: 'File URL', descriptionAr: 'رابط الملف', required: true },
        { name: 'path', nameAr: 'المسار', type: 'string', description: 'Save path', descriptionAr: 'مسار الحفظ' }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'file-upload',
      name: 'Upload File',
      nameAr: 'رفع ملف',
      description: 'Upload file to server',
      descriptionAr: 'رفع ملف للخادم',
      category: 'file',
      parameters: [
        { name: 'path', nameAr: 'المسار', type: 'string', description: 'File path', descriptionAr: 'مسار الملف', required: true }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'file-diff',
      name: 'Compare Files',
      nameAr: 'مقارنة الملفات',
      description: 'Compare two files',
      descriptionAr: 'مقارنة ملفين',
      category: 'file',
      parameters: [
        { name: 'file1', nameAr: 'الملف1', type: 'string', description: 'First file', descriptionAr: 'الملف الأول', required: true },
        { name: 'file2', nameAr: 'الملف2', type: 'string', description: 'Second file', descriptionAr: 'الملف الثاني', required: true }
      ],
      returns: 'object',
      execute: async () => ({ identical: true })
    });

    this.registerTool({
      id: 'file-watch',
      name: 'Watch File',
      nameAr: 'مراقبة ملف',
      description: 'Watch file for changes',
      descriptionAr: 'مراقبة ملف للتغييرات',
      category: 'file',
      parameters: [
        { name: 'path', nameAr: 'المسار', type: 'string', description: 'File path', descriptionAr: 'مسار الملف', required: true }
      ],
      returns: 'object',
      execute: async () => ({ watching: true })
    });

    this.registerTool({
      id: 'file-temp',
      name: 'Create Temp File',
      nameAr: 'إنشاء ملف مؤقت',
      description: 'Create a temporary file',
      descriptionAr: 'إنشاء ملف مؤقت',
      category: 'file',
      parameters: [
        { name: 'content', nameAr: 'المحتوى', type: 'string', description: 'File content', descriptionAr: 'محتوى الملف' },
        { name: 'extension', nameAr: 'الامتداد', type: 'string', description: 'File extension', descriptionAr: 'امتداد الملف' }
      ],
      returns: 'string',
      execute: async () => '/tmp/tempfile'
    });

    this.registerTool({
      id: 'file-backup',
      name: 'Backup File',
      nameAr: 'نسخ احتياطي',
      description: 'Create a backup of file',
      descriptionAr: 'إنشاء نسخة احتياطية من ملف',
      category: 'file',
      parameters: [
        { name: 'path', nameAr: 'المسار', type: 'string', description: 'File path', descriptionAr: 'مسار الملف', required: true }
      ],
      returns: 'string',
      execute: async () => ''
    });

    // ============ SYSTEM OPERATIONS (21-35) ============
    this.registerTool({
      id: 'system-info',
      name: 'System Info',
      nameAr: 'معلومات النظام',
      description: 'Get system information',
      descriptionAr: 'الحصول على معلومات النظام',
      category: 'system',
      parameters: [],
      returns: 'object',
      execute: async () => ({
        platform: navigator.platform,
        language: navigator.language,
        cores: navigator.hardwareConcurrency,
        memory: (navigator as any).deviceMemory,
      })
    });

    this.registerTool({
      id: 'system-execute',
      name: 'Execute Command',
      nameAr: 'تنفيذ أمر',
      description: 'Execute a system command',
      descriptionAr: 'تنفيذ أمر نظام',
      category: 'system',
      parameters: [
        { name: 'command', nameAr: 'الأمر', type: 'string', description: 'Command to execute', descriptionAr: 'الأمر للتنفيذ', required: true }
      ],
      returns: 'object',
      dangerous: true,
      execute: async (params) => ({ output: '', exitCode: 0 })
    });

    this.registerTool({
      id: 'system-processes',
      name: 'List Processes',
      nameAr: 'قائمة العمليات',
      description: 'List running processes',
      descriptionAr: 'عرض قائمة العمليات الجارية',
      category: 'system',
      parameters: [],
      returns: 'array',
      execute: async () => []
    });

    this.registerTool({
      id: 'system-kill',
      name: 'Kill Process',
      nameAr: 'إنهاء عملية',
      description: 'Kill a running process',
      descriptionAr: 'إنهاء عملية جارية',
      category: 'system',
      parameters: [
        { name: 'pid', nameAr: 'معرف العملية', type: 'number', description: 'Process ID', descriptionAr: 'معرف العملية', required: true }
      ],
      returns: 'boolean',
      dangerous: true,
      execute: async () => true
    });

    this.registerTool({
      id: 'system-restart',
      name: 'Restart System',
      nameAr: 'إعادة تشغيل',
      description: 'Restart the computer',
      descriptionAr: 'إعادة تشغيل الحاسوب',
      category: 'system',
      parameters: [
        { name: 'delay', nameAr: 'التأخير', type: 'number', description: 'Delay in seconds', descriptionAr: 'التأخير بالثواني' }
      ],
      returns: 'boolean',
      dangerous: true,
      execute: async () => true
    });

    this.registerTool({
      id: 'system-shutdown',
      name: 'Shutdown System',
      nameAr: 'إيقاف النظام',
      description: 'Shutdown the computer',
      descriptionAr: 'إيقاف تشغيل الحاسوب',
      category: 'system',
      parameters: [
        { name: 'delay', nameAr: 'التأخير', type: 'number', description: 'Delay in seconds', descriptionAr: 'التأخير بالثواني' }
      ],
      returns: 'boolean',
      dangerous: true,
      execute: async () => true
    });

    this.registerTool({
      id: 'system-clipboard-read',
      name: 'Read Clipboard',
      nameAr: 'قراءة الحافظة',
      description: 'Read from clipboard',
      descriptionAr: 'قراءة من الحافظة',
      category: 'system',
      parameters: [],
      returns: 'string',
      execute: async () => await navigator.clipboard.readText()
    });

    this.registerTool({
      id: 'system-clipboard-write',
      name: 'Write Clipboard',
      nameAr: 'كتابة الحافظة',
      description: 'Write to clipboard',
      descriptionAr: 'كتابة إلى الحافظة',
      category: 'system',
      parameters: [
        { name: 'text', nameAr: 'النص', type: 'string', description: 'Text to copy', descriptionAr: 'النص للنسخ', required: true }
      ],
      returns: 'boolean',
      execute: async (params) => {
        await navigator.clipboard.writeText(params.text as string);
        return true;
      }
    });

    this.registerTool({
      id: 'system-screenshot',
      name: 'Take Screenshot',
      nameAr: 'لقطة شاشة',
      description: 'Take a screenshot',
      descriptionAr: 'التقاط صورة للشاشة',
      category: 'system',
      parameters: [
        { name: 'fullPage', nameAr: 'الصفحة كاملة', type: 'boolean', description: 'Capture full page', descriptionAr: 'التقاط الصفحة كاملة' }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'system-notification',
      name: 'Show Notification',
      nameAr: 'إظهار إشعار',
      description: 'Show system notification',
      descriptionAr: 'إظهار إشعار نظام',
      category: 'system',
      parameters: [
        { name: 'title', nameAr: 'العنوان', type: 'string', description: 'Notification title', descriptionAr: 'عنوان الإشعار', required: true },
        { name: 'body', nameAr: 'المحتوى', type: 'string', description: 'Notification body', descriptionAr: 'محتوى الإشعار' },
        { name: 'icon', nameAr: 'الأيقونة', type: 'string', description: 'Notification icon', descriptionAr: 'أيقونة الإشعار' }
      ],
      returns: 'boolean',
      execute: async (params) => {
        if ('Notification' in window) {
          Notification.requestPermission();
          new Notification(params.title as string, { body: params.body as string });
          return true;
        }
        return false;
      }
    });

    this.registerTool({
      id: 'system-os-info',
      name: 'OS Information',
      nameAr: 'معلومات نظام التشغيل',
      description: 'Get OS information',
      descriptionAr: 'الحصول على معلومات نظام التشغيل',
      category: 'system',
      parameters: [],
      returns: 'object',
      execute: async () => ({ name: 'Unknown', version: '' })
    });

    this.registerTool({
      id: 'system-uptime',
      name: 'System Uptime',
      nameAr: 'وقت التشغيل',
      description: 'Get system uptime',
      descriptionAr: 'الحصول على وقت تشغيل النظام',
      category: 'system',
      parameters: [],
      returns: 'number',
      execute: async () => performance.now()
    });

    this.registerTool({
      id: 'system-battery',
      name: 'Battery Status',
      nameAr: 'حالة البطارية',
      description: 'Get battery status',
      descriptionAr: 'الحصول على حالة البطارية',
      category: 'system',
      parameters: [],
      returns: 'object',
      execute: async () => {
        if ('getBattery' in navigator) {
          const battery = await (navigator as any).getBattery();
          return {
            level: battery.level,
            charging: battery.charging,
            timeRemaining: battery.dischargingTime
          };
        }
        return { level: 1, charging: true };
      }
    });

    this.registerTool({
      id: 'system-network',
      name: 'Network Status',
      nameAr: 'حالة الشبكة',
      description: 'Get network status',
      descriptionAr: 'الحصول على حالة الشبكة',
      category: 'system',
      parameters: [],
      returns: 'object',
      execute: async () => ({
        online: navigator.onLine,
        type: (navigator as any).connection?.effectiveType,
        downlink: (navigator as any).connection?.downlink
      })
    });

    // ============ NETWORK OPERATIONS (36-50) ============
    this.registerTool({
      id: 'network-fetch',
      name: 'HTTP Fetch',
      nameAr: 'طلب HTTP',
      description: 'Make HTTP request',
      descriptionAr: 'إجراء طلب HTTP',
      category: 'network',
      parameters: [
        { name: 'url', nameAr: 'الرابط', type: 'string', description: 'Request URL', descriptionAr: 'رابط الطلب', required: true },
        { name: 'method', nameAr: 'الطريقة', type: 'string', description: 'HTTP method', descriptionAr: 'طريقة HTTP', options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
        { name: 'headers', nameAr: 'الترويسات', type: 'object', description: 'Request headers', descriptionAr: 'ترويسات الطلب' },
        { name: 'body', nameAr: 'المحتوى', type: 'string', description: 'Request body', descriptionAr: 'محتوى الطلب' }
      ],
      returns: 'object',
      execute: async (params) => {
        const response = await fetch(params.url as string, {
          method: params.method as string || 'GET',
          headers: params.headers as Record<string, string>,
          body: params.body as string
        });
        return { status: response.status, data: await response.json() };
      }
    });

    this.registerTool({
      id: 'network-ping',
      name: 'Ping Host',
      nameAr: 'اختبار الاتصال',
      description: 'Ping a host',
      descriptionAr: 'اختبار الاتصال بخادم',
      category: 'network',
      parameters: [
        { name: 'host', nameAr: 'المضيف', type: 'string', description: 'Host to ping', descriptionAr: 'المضيف للاختبار', required: true }
      ],
      returns: 'number',
      execute: async (params) => {
        const start = performance.now();
        await fetch(`https://${params.host}`);
        return performance.now() - start;
      }
    });

    this.registerTool({
      id: 'network-dns',
      name: 'DNS Lookup',
      nameAr: 'بحث DNS',
      description: 'Perform DNS lookup',
      descriptionAr: 'إجراء بحث DNS',
      category: 'network',
      parameters: [
        { name: 'domain', nameAr: 'النطاق', type: 'string', description: 'Domain name', descriptionAr: 'اسم النطاق', required: true }
      ],
      returns: 'array',
      execute: async () => []
    });

    this.registerTool({
      id: 'network-proxy',
      name: 'Set Proxy',
      nameAr: 'تعيين بروكسي',
      description: 'Configure proxy settings',
      descriptionAr: 'تكوين إعدادات البروكسي',
      category: 'network',
      parameters: [
        { name: 'host', nameAr: 'المضيف', type: 'string', description: 'Proxy host', descriptionAr: 'مضيف البروكسي', required: true },
        { name: 'port', nameAr: 'المنفذ', type: 'number', description: 'Proxy port', descriptionAr: 'منفذ البروكسي', required: true }
      ],
      returns: 'boolean',
      dangerous: true,
      execute: async () => true
    });

    this.registerTool({
      id: 'network-download',
      name: 'Download URL',
      nameAr: 'تحميل من رابط',
      description: 'Download content from URL',
      descriptionAr: 'تحميل محتوى من رابط',
      category: 'network',
      parameters: [
        { name: 'url', nameAr: 'الرابط', type: 'string', description: 'URL to download', descriptionAr: 'الرابط للتحميل', required: true }
      ],
      returns: 'string',
      execute: async (params) => {
        const response = await fetch(params.url as string);
        return response.text();
      }
    });

    this.registerTool({
      id: 'network-upload',
      name: 'Upload to URL',
      nameAr: 'رفع لرابط',
      description: 'Upload data to URL',
      descriptionAr: 'رفع بيانات لرابط',
      category: 'network',
      parameters: [
        { name: 'url', nameAr: 'الرابط', type: 'string', description: 'Upload URL', descriptionAr: 'رابط الرفع', required: true },
        { name: 'data', nameAr: 'البيانات', type: 'string', description: 'Data to upload', descriptionAr: 'البيانات للرفع', required: true }
      ],
      returns: 'object',
      execute: async () => ({ success: true })
    });

    this.registerTool({
      id: 'network-websocket',
      name: 'WebSocket',
      nameAr: 'ويب سوكيت',
      description: 'Open WebSocket connection',
      descriptionAr: 'فتح اتصال ويب سوكيت',
      category: 'network',
      parameters: [
        { name: 'url', nameAr: 'الرابط', type: 'string', description: 'WebSocket URL', descriptionAr: 'رابط الويب سوكيت', required: true }
      ],
      returns: 'object',
      execute: async () => ({ connected: true })
    });

    this.registerTool({
      id: 'network-ssl-info',
      name: 'SSL Info',
      nameAr: 'معلومات SSL',
      description: 'Get SSL certificate info',
      descriptionAr: 'الحصول على معلومات شهادة SSL',
      category: 'network',
      parameters: [
        { name: 'domain', nameAr: 'النطاق', type: 'string', description: 'Domain', descriptionAr: 'النطاق', required: true }
      ],
      returns: 'object',
      execute: async () => ({ valid: true, issuer: '', expires: Date.now() })
    });

    this.registerTool({
      id: 'network-speed-test',
      name: 'Speed Test',
      nameAr: 'اختبار السرعة',
      description: 'Run network speed test',
      descriptionAr: 'تشغيل اختبار سرعة الشبكة',
      category: 'network',
      parameters: [],
      returns: 'object',
      execute: async () => ({ download: 100, upload: 50, ping: 20 })
    });

    this.registerTool({
      id: 'network-ip',
      name: 'Get IP Address',
      nameAr: 'الحصول على IP',
      description: 'Get public IP address',
      descriptionAr: 'الحصول على عنوان IP العام',
      category: 'network',
      parameters: [],
      returns: 'string',
      execute: async () => {
        const response = await fetch('https://api.ipify.org');
        return response.text();
      }
    });

    this.registerTool({
      id: 'network-geoip',
      name: 'GeoIP Lookup',
      nameAr: 'بحث GeoIP',
      description: 'Get geolocation from IP',
      descriptionAr: 'الحصول على الموقع من IP',
      category: 'network',
      parameters: [
        { name: 'ip', nameAr: 'IP', type: 'string', description: 'IP address', descriptionAr: 'عنوان IP', required: true }
      ],
      returns: 'object',
      execute: async () => ({ country: '', city: '', lat: 0, lon: 0 })
    });

    this.registerTool({
      id: 'network-headers',
      name: 'Get Headers',
      nameAr: 'الحصول على الترويسات',
      description: 'Get HTTP headers from URL',
      descriptionAr: 'الحصول على ترويسات HTTP من رابط',
      category: 'network',
      parameters: [
        { name: 'url', nameAr: 'الرابط', type: 'string', description: 'URL', descriptionAr: 'الرابط', required: true }
      ],
      returns: 'object',
      execute: async (params) => {
        const response = await fetch(params.url as string, { method: 'HEAD' });
        return Object.fromEntries(response.headers.entries());
      }
    });

    this.registerTool({
      id: 'network-traceroute',
      name: 'Traceroute',
      nameAr: 'تتبع المسار',
      description: 'Trace network route',
      descriptionAr: 'تتبع مسار الشبكة',
      category: 'network',
      parameters: [
        { name: 'host', nameAr: 'المضيف', type: 'string', description: 'Host', descriptionAr: 'المضيف', required: true }
      ],
      returns: 'array',
      execute: async () => []
    });

    this.registerTool({
      id: 'network-port-scan',
      name: 'Port Scan',
      nameAr: 'فحص المنافذ',
      description: 'Scan ports on host',
      descriptionAr: 'فحص المنافذ على المضيف',
      category: 'network',
      parameters: [
        { name: 'host', nameAr: 'المضيف', type: 'string', description: 'Host', descriptionAr: 'المضيف', required: true },
        { name: 'ports', nameAr: 'المنافذ', type: 'array', description: 'Ports to scan', descriptionAr: 'المنافذ للفحص' }
      ],
      returns: 'array',
      execute: async () => []
    });

    // ============ MEDIA OPERATIONS (51-65) ============
    this.registerTool({
      id: 'media-camera',
      name: 'Access Camera',
      nameAr: 'الوصول للكاميرا',
      description: 'Access device camera',
      descriptionAr: 'الوصول إلى كاميرا الجهاز',
      category: 'media',
      parameters: [
        { name: 'facingMode', nameAr: 'الكاميرا', type: 'string', description: 'Facing mode', descriptionAr: 'الكاميرا', options: ['user', 'environment'] }
      ],
      returns: 'object',
      execute: async () => ({ stream: 'active' })
    });

    this.registerTool({
      id: 'media-microphone',
      name: 'Access Microphone',
      nameAr: 'الوصول للميكروفون',
      description: 'Access device microphone',
      descriptionAr: 'الوصول إلى ميكروفون الجهاز',
      category: 'media',
      parameters: [],
      returns: 'object',
      execute: async () => ({ stream: 'active' })
    });

    this.registerTool({
      id: 'media-record-audio',
      name: 'Record Audio',
      nameAr: 'تسجيل صوت',
      description: 'Record audio from microphone',
      descriptionAr: 'تسجيل صوت من الميكروفون',
      category: 'media',
      parameters: [
        { name: 'duration', nameAr: 'المدة', type: 'number', description: 'Recording duration', descriptionAr: 'مدة التسجيل' }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'media-record-video',
      name: 'Record Video',
      nameAr: 'تسجيل فيديو',
      description: 'Record video from camera',
      descriptionAr: 'تسجيل فيديو من الكاميرا',
      category: 'media',
      parameters: [
        { name: 'duration', nameAr: 'المدة', type: 'number', description: 'Recording duration', descriptionAr: 'مدة التسجيل' }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'media-play-audio',
      name: 'Play Audio',
      nameAr: 'تشغيل صوت',
      description: 'Play audio file',
      descriptionAr: 'تشغيل ملف صوتي',
      category: 'media',
      parameters: [
        { name: 'url', nameAr: 'الرابط', type: 'string', description: 'Audio URL', descriptionAr: 'رابط الصوت', required: true }
      ],
      returns: 'boolean',
      execute: async () => true
    });

    this.registerTool({
      id: 'media-play-video',
      name: 'Play Video',
      nameAr: 'تشغيل فيديو',
      description: 'Play video file',
      descriptionAr: 'تشغيل ملف فيديو',
      category: 'media',
      parameters: [
        { name: 'url', nameAr: 'الرابط', type: 'string', description: 'Video URL', descriptionAr: 'رابط الفيديو', required: true }
      ],
      returns: 'boolean',
      execute: async () => true
    });

    this.registerTool({
      id: 'media-audio-level',
      name: 'Audio Level',
      nameAr: 'مستوى الصوت',
      description: 'Get audio input level',
      descriptionAr: 'الحصول على مستوى إدخال الصوت',
      category: 'media',
      parameters: [],
      returns: 'number',
      execute: async () => 0
    });

    this.registerTool({
      id: 'media-barcode',
      name: 'Scan Barcode',
      nameAr: 'مسح باركود',
      description: 'Scan barcode from camera',
      descriptionAr: 'مسح باركود من الكاميرا',
      category: 'media',
      parameters: [],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'media-qrcode',
      name: 'Scan QR Code',
      nameAr: 'مسح QR',
      description: 'Scan QR code from camera',
      descriptionAr: 'مسح رمز QR من الكاميرا',
      category: 'media',
      parameters: [],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'media-image-capture',
      name: 'Capture Image',
      nameAr: 'التقاط صورة',
      description: 'Capture image from camera',
      descriptionAr: 'التقاط صورة من الكاميرا',
      category: 'media',
      parameters: [
        { name: 'camera', nameAr: 'الكاميرا', type: 'string', description: 'Camera to use', descriptionAr: 'الكاميرا للاستخدام', options: ['front', 'back'] }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'media-image-crop',
      name: 'Crop Image',
      nameAr: 'قص صورة',
      description: 'Crop an image',
      descriptionAr: 'قص صورة',
      category: 'media',
      parameters: [
        { name: 'image', nameAr: 'الصورة', type: 'string', description: 'Image data', descriptionAr: 'بيانات الصورة', required: true },
        { name: 'x', nameAr: 'س', type: 'number', description: 'X position', descriptionAr: 'موقع س' },
        { name: 'y', nameAr: 'ص', type: 'number', description: 'Y position', descriptionAr: 'موقع ص' },
        { name: 'width', nameAr: 'العرض', type: 'number', description: 'Crop width', descriptionAr: 'عرض القص' },
        { name: 'height', nameAr: 'الارتفاع', type: 'number', description: 'Crop height', descriptionAr: 'ارتفاع القص' }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'media-image-resize',
      name: 'Resize Image',
      nameAr: 'تغيير حجم صورة',
      description: 'Resize an image',
      descriptionAr: 'تغيير حجم صورة',
      category: 'media',
      parameters: [
        { name: 'image', nameAr: 'الصورة', type: 'string', description: 'Image data', descriptionAr: 'بيانات الصورة', required: true },
        { name: 'width', nameAr: 'العرض', type: 'number', description: 'New width', descriptionAr: 'العرض الجديد' },
        { name: 'height', nameAr: 'الارتفاع', type: 'number', description: 'New height', descriptionAr: 'الارتفاع الجديد' }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'media-image-rotate',
      name: 'Rotate Image',
      nameAr: 'تدوير صورة',
      description: 'Rotate an image',
      descriptionAr: 'تدوير صورة',
      category: 'media',
      parameters: [
        { name: 'image', nameAr: 'الصورة', type: 'string', description: 'Image data', descriptionAr: 'بيانات الصورة', required: true },
        { name: 'degrees', nameAr: 'الدرجات', type: 'number', description: 'Rotation degrees', descriptionAr: 'زاوية التدوير' }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'media-image-filter',
      name: 'Apply Filter',
      nameAr: 'تطبيق فلتر',
      description: 'Apply filter to image',
      descriptionAr: 'تطبيق فلتر على صورة',
      category: 'media',
      parameters: [
        { name: 'image', nameAr: 'الصورة', type: 'string', description: 'Image data', descriptionAr: 'بيانات الصورة', required: true },
        { name: 'filter', nameAr: 'الفلتر', type: 'string', description: 'Filter type', descriptionAr: 'نوع الفلتر', options: ['blur', 'brightness', 'contrast', 'grayscale', 'sepia'] }
      ],
      returns: 'string',
      execute: async () => ''
    });

    // ============ DOCUMENT OPERATIONS (66-80) ============
    this.registerTool({
      id: 'doc-pdf-create',
      name: 'Create PDF',
      nameAr: 'إنشاء PDF',
      description: 'Create PDF document',
      descriptionAr: 'إنشاء مستند PDF',
      category: 'document',
      parameters: [
        { name: 'content', nameAr: 'المحتوى', type: 'string', description: 'PDF content', descriptionAr: 'محتوى PDF', required: true },
        { name: 'filename', nameAr: 'اسم الملف', type: 'string', description: 'Filename', descriptionAr: 'اسم الملف' }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'doc-pdf-read',
      name: 'Read PDF',
      nameAr: 'قراءة PDF',
      description: 'Read PDF document',
      descriptionAr: 'قراءة مستند PDF',
      category: 'document',
      parameters: [
        { name: 'path', nameAr: 'المسار', type: 'string', description: 'PDF path', descriptionAr: 'مسار PDF', required: true }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'doc-docx-create',
      name: 'Create Word Doc',
      nameAr: 'إنشاء وورد',
      description: 'Create Word document',
      descriptionAr: 'إنشاء مستند Word',
      category: 'document',
      parameters: [
        { name: 'content', nameAr: 'المحتوى', type: 'string', description: 'Document content', descriptionAr: 'محتوى المستند', required: true },
        { name: 'filename', nameAr: 'اسم الملف', type: 'string', description: 'Filename', descriptionAr: 'اسم الملف' }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'doc-excel-create',
      name: 'Create Excel',
      nameAr: 'إنشاء Excel',
      description: 'Create Excel spreadsheet',
      descriptionAr: 'إنشاء جدول Excel',
      category: 'document',
      parameters: [
        { name: 'data', nameAr: 'البيانات', type: 'array', description: 'Spreadsheet data', descriptionAr: 'بيانات الجدول', required: true },
        { name: 'filename', nameAr: 'اسم الملف', type: 'string', description: 'Filename', descriptionAr: 'اسم الملف' }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'doc-markdown-render',
      name: 'Render Markdown',
      nameAr: 'عرض Markdown',
      description: 'Render markdown to HTML',
      descriptionAr: 'تحويل Markdown إلى HTML',
      category: 'document',
      parameters: [
        { name: 'markdown', nameAr: 'Markdown', type: 'string', description: 'Markdown text', descriptionAr: 'نص Markdown', required: true }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'doc-html-render',
      name: 'Render HTML',
      nameAr: 'عرض HTML',
      description: 'Render HTML to preview',
      descriptionAr: 'عرض HTML للمعاينة',
      category: 'document',
      parameters: [
        { name: 'html', nameAr: 'HTML', type: 'string', description: 'HTML content', descriptionAr: 'محتوى HTML', required: true }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'doc-text-extract',
      name: 'Extract Text',
      nameAr: 'استخراج نص',
      description: 'Extract text from document',
      descriptionAr: 'استخراج نص من مستند',
      category: 'document',
      parameters: [
        { name: 'file', nameAr: 'الملف', type: 'string', description: 'File path or URL', descriptionAr: 'مسار أو رابط الملف', required: true }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'doc-sign',
      name: 'Sign Document',
      nameAr: 'توقيع مستند',
      description: 'Sign a document',
      descriptionAr: 'توقيع مستند',
      category: 'document',
      parameters: [
        { name: 'document', nameAr: 'المستند', type: 'string', description: 'Document to sign', descriptionAr: 'المستند للتوقيع', required: true },
        { name: 'signature', nameAr: 'التوقيع', type: 'string', description: 'Signature data', descriptionAr: 'بيانات التوقيع' }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'doc-encrypt',
      name: 'Encrypt Document',
      nameAr: 'تشفير مستند',
      description: 'Encrypt a document',
      descriptionAr: 'تشفير مستند',
      category: 'document',
      parameters: [
        { name: 'document', nameAr: 'المستند', type: 'string', description: 'Document to encrypt', descriptionAr: 'المستند للتشفير', required: true },
        { name: 'password', nameAr: 'كلمة المرور', type: 'string', description: 'Encryption password', descriptionAr: 'كلمة مرور التشفير', required: true }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'doc-decrypt',
      name: 'Decrypt Document',
      nameAr: 'فك تشفير مستند',
      description: 'Decrypt a document',
      descriptionAr: 'فك تشفير مستند',
      category: 'document',
      parameters: [
        { name: 'document', nameAr: 'المستند', type: 'string', description: 'Encrypted document', descriptionAr: 'المستند المشفر', required: true },
        { name: 'password', nameAr: 'كلمة المرور', type: 'string', description: 'Decryption password', descriptionAr: 'كلمة مرور فك التشفير', required: true }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'doc-watermark',
      name: 'Add Watermark',
      nameAr: 'إضافة علامة مائية',
      description: 'Add watermark to document',
      descriptionAr: 'إضافة علامة مائية لمستند',
      category: 'document',
      parameters: [
        { name: 'document', nameAr: 'المستند', type: 'string', description: 'Document', descriptionAr: 'المستند', required: true },
        { name: 'text', nameAr: 'النص', type: 'string', description: 'Watermark text', descriptionAr: 'نص العلامة المائية' }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'doc-merge',
      name: 'Merge Documents',
      nameAr: 'دمج مستندات',
      description: 'Merge multiple documents',
      descriptionAr: 'دمج عدة مستندات',
      category: 'document',
      parameters: [
        { name: 'documents', nameAr: 'المستندات', type: 'array', description: 'Documents to merge', descriptionAr: 'المستندات للدمج', required: true }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'doc-split',
      name: 'Split Document',
      nameAr: 'تقسيم مستند',
      description: 'Split document into parts',
      descriptionAr: 'تقسيم مستند إلى أجزاء',
      category: 'document',
      parameters: [
        { name: 'document', nameAr: 'المستند', type: 'string', description: 'Document to split', descriptionAr: 'المستند للتقسيم', required: true },
        { name: 'pages', nameAr: 'الصفحات', type: 'array', description: 'Page numbers', descriptionAr: 'أرقام الصفحات' }
      ],
      returns: 'array',
      execute: async () => []
    });

    this.registerTool({
      id: 'doc-compress',
      name: 'Compress Document',
      nameAr: 'ضغط مستند',
      description: 'Compress document size',
      descriptionAr: 'ضغط حجم مستند',
      category: 'document',
      parameters: [
        { name: 'document', nameAr: 'المستند', type: 'string', description: 'Document to compress', descriptionAr: 'المستند للضغط', required: true },
        { name: 'quality', nameAr: 'الجودة', type: 'number', description: 'Compression quality', descriptionAr: 'جودة الضغط' }
      ],
      returns: 'string',
      execute: async () => ''
    });

    // ============ AI OPERATIONS (81-95) ============
    this.registerTool({
      id: 'ai-chat',
      name: 'AI Chat',
      nameAr: 'محادثة ذكاء اصطناعي',
      description: 'Chat with AI model',
      descriptionAr: 'محادثة مع نموذج ذكاء اصطناعي',
      category: 'ai',
      parameters: [
        { name: 'message', nameAr: 'الرسالة', type: 'string', description: 'User message', descriptionAr: 'رسالة المستخدم', required: true },
        { name: 'model', nameAr: 'النموذج', type: 'string', description: 'AI model', descriptionAr: 'نموذج الذكاء الاصطناعي' },
        { name: 'system', nameAr: 'النظام', type: 'string', description: 'System prompt', descriptionAr: 'توجيه النظام' }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'ai-image-generate',
      name: 'Generate Image',
      nameAr: 'توليد صورة',
      description: 'Generate image with AI',
      descriptionAr: 'توليد صورة بالذكاء الاصطناعي',
      category: 'ai',
      parameters: [
        { name: 'prompt', nameAr: 'الوصف', type: 'string', description: 'Image prompt', descriptionAr: 'وصف الصورة', required: true },
        { name: 'model', nameAr: 'النموذج', type: 'string', description: 'Image model', descriptionAr: 'نموذج الصورة' },
        { name: 'size', nameAr: 'الحجم', type: 'string', description: 'Image size', descriptionAr: 'حجم الصورة', options: ['1024x1024', '1024x1792', '1792x1024'] }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'ai-image-edit',
      name: 'Edit Image',
      nameAr: 'تحرير صورة',
      description: 'Edit image with AI',
      descriptionAr: 'تحرير صورة بالذكاء الاصطناعي',
      category: 'ai',
      parameters: [
        { name: 'image', nameAr: 'الصورة', type: 'string', description: 'Base image', descriptionAr: 'الصورة الأساسية', required: true },
        { name: 'prompt', nameAr: 'الوصف', type: 'string', description: 'Edit prompt', descriptionAr: 'وصف التحرير', required: true }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'ai-translate',
      name: 'Translate',
      nameAr: 'ترجمة',
      description: 'Translate text',
      descriptionAr: 'ترجمة نص',
      category: 'ai',
      parameters: [
        { name: 'text', nameAr: 'النص', type: 'string', description: 'Text to translate', descriptionAr: 'النص للترجمة', required: true },
        { name: 'from', nameAr: 'من', type: 'string', description: 'Source language', descriptionAr: 'اللغة المصدرية' },
        { name: 'to', nameAr: 'إلى', type: 'string', description: 'Target language', descriptionAr: 'اللغة المستهدفة', required: true }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'ai-summarize',
      name: 'Summarize',
      nameAr: 'تلخيص',
      description: 'Summarize text',
      descriptionAr: 'تلخيص نص',
      category: 'ai',
      parameters: [
        { name: 'text', nameAr: 'النص', type: 'string', description: 'Text to summarize', descriptionAr: 'النص للتلخيص', required: true },
        { name: 'length', nameAr: 'الطول', type: 'string', description: 'Summary length', descriptionAr: 'طول الملخص' }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'ai-analyze-image',
      name: 'Analyze Image',
      nameAr: 'تحليل صورة',
      description: 'Analyze image with AI',
      descriptionAr: 'تحليل صورة بالذكاء الاصطناعي',
      category: 'ai',
      parameters: [
        { name: 'image', nameAr: 'الصورة', type: 'string', description: 'Image URL or data', descriptionAr: 'رابط أو بيانات الصورة', required: true },
        { name: 'question', nameAr: 'السؤال', type: 'string', description: 'Question about image', descriptionAr: 'سؤال عن الصورة' }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'ai-speech-to-text',
      name: 'Speech to Text',
      nameAr: 'تحويل صوت لنص',
      description: 'Convert speech to text',
      descriptionAr: 'تحويل كلام إلى نص',
      category: 'ai',
      parameters: [
        { name: 'audio', nameAr: 'الصوت', type: 'string', description: 'Audio file or URL', descriptionAr: 'ملف أو رابط الصوت', required: true },
        { name: 'language', nameAr: 'اللغة', type: 'string', description: 'Audio language', descriptionAr: 'لغة الصوت' }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'ai-text-to-speech',
      name: 'Text to Speech',
      nameAr: 'تحويل نص لصوت',
      description: 'Convert text to speech',
      descriptionAr: 'تحويل نص إلى كلام',
      category: 'ai',
      parameters: [
        { name: 'text', nameAr: 'النص', type: 'string', description: 'Text to speak', descriptionAr: 'النص للتحدث', required: true },
        { name: 'voice', nameAr: 'الصوت', type: 'string', description: 'Voice to use', descriptionAr: 'الصوت للاستخدام' },
        { name: 'language', nameAr: 'اللغة', type: 'string', description: 'Language', descriptionAr: 'اللغة' }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'ai-embeddings',
      name: 'Generate Embeddings',
      nameAr: 'توليد تمثيلات',
      description: 'Generate text embeddings',
      descriptionAr: 'توليد تمثيلات نصية',
      category: 'ai',
      parameters: [
        { name: 'text', nameAr: 'النص', type: 'string', description: 'Text to embed', descriptionAr: 'النص للتمثيل', required: true }
      ],
      returns: 'array',
      execute: async () => []
    });

    this.registerTool({
      id: 'ai-sentiment',
      name: 'Sentiment Analysis',
      nameAr: 'تحليل المشاعر',
      description: 'Analyze text sentiment',
      descriptionAr: 'تحليل مشاعر النص',
      category: 'ai',
      parameters: [
        { name: 'text', nameAr: 'النص', type: 'string', description: 'Text to analyze', descriptionAr: 'النص للتحليل', required: true }
      ],
      returns: 'object',
      execute: async () => ({ sentiment: 'neutral', score: 0 })
    });

    this.registerTool({
      id: 'ai-ner',
      name: 'Named Entity Recognition',
      nameAr: 'التعرف على الكيانات',
      description: 'Extract named entities',
      descriptionAr: 'استخراج الكيانات المسماة',
      category: 'ai',
      parameters: [
        { name: 'text', nameAr: 'النص', type: 'string', description: 'Text to analyze', descriptionAr: 'النص للتحليل', required: true }
      ],
      returns: 'array',
      execute: async () => []
    });

    this.registerTool({
      id: 'ai-code-complete',
      name: 'Code Completion',
      nameAr: 'إكمال كود',
      description: 'Complete code snippet',
      descriptionAr: 'إكمال مقطع كود',
      category: 'ai',
      parameters: [
        { name: 'code', nameAr: 'الكود', type: 'string', description: 'Code to complete', descriptionAr: 'الكود للإكمال', required: true },
        { name: 'language', nameAr: 'اللغة', type: 'string', description: 'Programming language', descriptionAr: 'لغة البرمجة' }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'ai-code-review',
      name: 'Code Review',
      nameAr: 'مراجعة كود',
      description: 'Review code for issues',
      descriptionAr: 'مراجعة كود للمشاكل',
      category: 'ai',
      parameters: [
        { name: 'code', nameAr: 'الكود', type: 'string', description: 'Code to review', descriptionAr: 'الكود للمراجعة', required: true }
      ],
      returns: 'object',
      execute: async () => ({ issues: [], suggestions: [] })
    });

    this.registerTool({
      id: 'ai-sql-generate',
      name: 'Generate SQL',
      nameAr: 'توليد SQL',
      description: 'Generate SQL from description',
      descriptionAr: 'توليد SQL من وصف',
      category: 'ai',
      parameters: [
        { name: 'description', nameAr: 'الوصف', type: 'string', description: 'Query description', descriptionAr: 'وصف الاستعلام', required: true },
        { name: 'dialect', nameAr: ' اللهجة', type: 'string', description: 'SQL dialect', descriptionAr: 'لهجة SQL' }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'ai-email-classify',
      name: 'Classify Email',
      nameAr: 'تصنيف بريد',
      description: 'Classify email content',
      descriptionAr: 'تصنيف محتوى بريد إلكتروني',
      category: 'ai',
      parameters: [
        { name: 'subject', nameAr: 'الموضوع', type: 'string', description: 'Email subject', descriptionAr: 'موضوع البريد' },
        { name: 'body', nameAr: 'المحتوى', type: 'string', description: 'Email body', descriptionAr: 'محتوى البريد', required: true }
      ],
      returns: 'object',
      execute: async () => ({ category: 'inbox', priority: 'normal' })
    });

    // ============ COMMUNICATION (96-105) ============
    this.registerTool({
      id: 'comm-email-send',
      name: 'Send Email',
      nameAr: 'إرسال بريد',
      description: 'Send an email',
      descriptionAr: 'إرسال بريد إلكتروني',
      category: 'communication',
      parameters: [
        { name: 'to', nameAr: 'إلى', type: 'string', description: 'Recipient email', descriptionAr: 'بريد المستلم', required: true },
        { name: 'subject', nameAr: 'الموضوع', type: 'string', description: 'Email subject', descriptionAr: 'موضوع البريد', required: true },
        { name: 'body', nameAr: 'المحتوى', type: 'string', description: 'Email body', descriptionAr: 'محتوى البريد', required: true }
      ],
      returns: 'boolean',
      execute: async () => true
    });

    this.registerTool({
      id: 'comm-email-read',
      name: 'Read Emails',
      nameAr: 'قراءة البريد',
      description: 'Read emails from inbox',
      descriptionAr: 'قراءة رسائل البريد من الوارد',
      category: 'communication',
      parameters: [
        { name: 'count', nameAr: 'العدد', type: 'number', description: 'Number of emails', descriptionAr: 'عدد الرسائل' }
      ],
      returns: 'array',
      execute: async () => []
    });

    this.registerTool({
      id: 'comm-sms-send',
      name: 'Send SMS',
      nameAr: 'إرسال SMS',
      description: 'Send SMS message',
      descriptionAr: 'إرسال رسالة SMS',
      category: 'communication',
      parameters: [
        { name: 'to', nameAr: 'إلى', type: 'string', description: 'Phone number', descriptionAr: 'رقم الهاتف', required: true },
        { name: 'message', nameAr: 'الرسالة', type: 'string', description: 'SMS message', descriptionAr: 'رسالة SMS', required: true }
      ],
      returns: 'boolean',
      execute: async () => true
    });

    this.registerTool({
      id: 'comm-whatsapp-send',
      name: 'Send WhatsApp',
      nameAr: 'إرسال واتساب',
      description: 'Send WhatsApp message',
      descriptionAr: 'إرسال رسالة واتساب',
      category: 'communication',
      parameters: [
        { name: 'to', nameAr: 'إلى', type: 'string', description: 'Phone number', descriptionAr: 'رقم الهاتف', required: true },
        { name: 'message', nameAr: 'الرسالة', type: 'string', description: 'Message', descriptionAr: 'الرسالة', required: true }
      ],
      returns: 'boolean',
      execute: async () => true
    });

    this.registerTool({
      id: 'comm-discord-send',
      name: 'Send Discord',
      nameAr: 'إرسال ديسكورد',
      description: 'Send Discord message',
      descriptionAr: 'إرسال رسالة ديسكورد',
      category: 'communication',
      parameters: [
        { name: 'channel', nameAr: 'القناة', type: 'string', description: 'Channel ID', descriptionAr: 'معرف القناة', required: true },
        { name: 'message', nameAr: 'الرسالة', type: 'string', description: 'Message', descriptionAr: 'الرسالة', required: true }
      ],
      returns: 'boolean',
      execute: async () => true
    });

    this.registerTool({
      id: 'comm-telegram-send',
      name: 'Send Telegram',
      nameAr: 'إرسال تيليجرام',
      description: 'Send Telegram message',
      descriptionAr: 'إرسال رسالة تيليجرام',
      category: 'communication',
      parameters: [
        { name: 'chat_id', nameAr: 'معرف المحادثة', type: 'string', description: 'Chat ID', descriptionAr: 'معرف المحادثة', required: true },
        { name: 'message', nameAr: 'الرسالة', type: 'string', description: 'Message', descriptionAr: 'الرسالة', required: true }
      ],
      returns: 'boolean',
      execute: async () => true
    });

    this.registerTool({
      id: 'comm-slack-send',
      name: 'Send Slack',
      nameAr: 'إرسال سلاك',
      description: 'Send Slack message',
      descriptionAr: 'إرسال رسالة سلاك',
      category: 'communication',
      parameters: [
        { name: 'channel', nameAr: 'القناة', type: 'string', description: 'Channel', descriptionAr: 'القناة', required: true },
        { name: 'message', nameAr: 'الرسالة', type: 'string', description: 'Message', descriptionAr: 'الرسالة', required: true }
      ],
      returns: 'boolean',
      execute: async () => true
    });

    this.registerTool({
      id: 'comm-webhook',
      name: 'Send Webhook',
      nameAr: 'إرسال ويبهوك',
      description: 'Send webhook request',
      descriptionAr: 'إرسال طلب ويبهوك',
      category: 'communication',
      parameters: [
        { name: 'url', nameAr: 'الرابط', type: 'string', description: 'Webhook URL', descriptionAr: 'رابط الوبهوك', required: true },
        { name: 'data', nameAr: 'البيانات', type: 'object', description: 'Webhook data', descriptionAr: 'بيانات الوبهوك', required: true }
      ],
      returns: 'boolean',
      execute: async () => true
    });

    this.registerTool({
      id: 'comm-calendar-event',
      name: 'Create Calendar Event',
      nameAr: 'إنشاء حدث تقويم',
      description: 'Create calendar event',
      descriptionAr: 'إنشاء حدث في التقويم',
      category: 'communication',
      parameters: [
        { name: 'title', nameAr: 'العنوان', type: 'string', description: 'Event title', descriptionAr: 'عنوان الحدث', required: true },
        { name: 'start', nameAr: 'البداية', type: 'string', description: 'Start time', descriptionAr: 'وقت البداية', required: true },
        { name: 'end', nameAr: 'النهاية', type: 'string', description: 'End time', descriptionAr: 'وقت النهاية' }
      ],
      returns: 'string',
      execute: async () => ''
    });

    this.registerTool({
      id: 'comm-calendar-list',
      name: 'List Calendar Events',
      nameAr: 'قائمة أحداث التقويم',
      description: 'List calendar events',
      descriptionAr: 'عرض قائمة أحداث التقويم',
      category: 'communication',
      parameters: [
        { name: 'from', nameAr: 'من', type: 'string', description: 'Start date', descriptionAr: 'من تاريخ' },
        { name: 'to', nameAr: 'إلى', type: 'string', description: 'End date', descriptionAr: 'إلى تاريخ' }
      ],
      returns: 'array',
      execute: async () => []
    });

    // ============ DATABASE (106-115) ============
    this.registerTool({
      id: 'db-query',
      name: 'Run Query',
      nameAr: 'تشغيل استعلام',
      description: 'Execute database query',
      descriptionAr: 'تنفيذ استعلام قاعدة بيانات',
      category: 'database',
      parameters: [
        { name: 'query', nameAr: 'الاستعلام', type: 'string', description: 'SQL query', descriptionAr: 'استعلام SQL', required: true }
      ],
      returns: 'array',
      dangerous: true,
      execute: async () => []
    });

    this.registerTool({
      id: 'db-insert',
      name: 'Insert Record',
      nameAr: 'إدراج سجل',
      description: 'Insert record into table',
      descriptionAr: 'إدراج سجل في جدول',
      category: 'database',
      parameters: [
        { name: 'table', nameAr: 'الجدول', type: 'string', description: 'Table name', descriptionAr: 'اسم الجدول', required: true },
        { name: 'data', nameAr: 'البيانات', type: 'object', description: 'Record data', descriptionAr: 'بيانات السجل', required: true }
      ],
      returns: 'boolean',
      dangerous: true,
      execute: async () => true
    });

    this.registerTool({
      id: 'db-update',
      name: 'Update Record',
      nameAr: 'تحديث سجل',
      description: 'Update database record',
      descriptionAr: 'تحديث سجل في قاعدة البيانات',
      category: 'database',
      parameters: [
        { name: 'table', nameAr: 'الجدول', type: 'string', description: 'Table name', descriptionAr: 'اسم الجدول', required: true },
        { name: 'id', nameAr: 'المعرف', type: 'string', description: 'Record ID', descriptionAr: 'معرف السجل', required: true },
        { name: 'data', nameAr: 'البيانات', type: 'object', description: 'Update data', descriptionAr: 'بيانات التحديث', required: true }
      ],
      returns: 'boolean',
      dangerous: true,
      execute: async () => true
    });

    this.registerTool({
      id: 'db-delete',
      name: 'Delete Record',
      nameAr: 'حذف سجل',
      description: 'Delete database record',
      descriptionAr: 'حذف سجل من قاعدة البيانات',
      category: 'database',
      parameters: [
        { name: 'table', nameAr: 'الجدول', type: 'string', description: 'Table name', descriptionAr: 'اسم الجدول', required: true },
        { name: 'id', nameAr: 'المعرف', type: 'string', description: 'Record ID', descriptionAr: 'معرف السجل', required: true }
      ],
      returns: 'boolean',
      dangerous: true,
      execute: async () => true
    });

    this.registerTool({
      id: 'db-backup',
      name: 'Backup Database',
      nameAr: 'نسخ احتياطي',
      description: 'Create database backup',
      descriptionAr: 'إنشاء نسخة احتياطية من قاعدة البيانات',
      category: 'database',
      parameters: [
        { name: 'name', nameAr: 'الاسم', type: 'string', description: 'Backup name', descriptionAr: 'اسم النسخة' }
      ],
      returns: 'string',
      dangerous: true,
      execute: async () => ''
    });

    this.registerTool({
      id: 'db-restore',
      name: 'Restore Database',
      nameAr: 'استعادة قاعدة بيانات',
      description: 'Restore database from backup',
      descriptionAr: 'استعادة قاعدة بيانات من نسخة احتياطية',
      category: 'database',
      parameters: [
        { name: 'backup', nameAr: 'النسخة', type: 'string', description: 'Backup file', descriptionAr: 'ملف النسخة الاحتياطية', required: true }
      ],
      returns: 'boolean',
      dangerous: true,
      execute: async () => true
    });

    this.registerTool({
      id: 'db-tables',
      name: 'List Tables',
      nameAr: 'قائمة الجداول',
      description: 'List database tables',
      descriptionAr: 'عرض قائمة جداول قاعدة البيانات',
      category: 'database',
      parameters: [],
      returns: 'array',
      execute: async () => []
    });

    this.registerTool({
      id: 'db-schema',
      name: 'Get Schema',
      nameAr: 'الحصول على المخطط',
      description: 'Get database table schema',
      descriptionAr: 'الحصول على مخطط جدول قاعدة البيانات',
      category: 'database',
      parameters: [
        { name: 'table', nameAr: 'الجدول', type: 'string', description: 'Table name', descriptionAr: 'اسم الجدول', required: true }
      ],
      returns: 'array',
      execute: async () => []
    });

    this.registerTool({
      id: 'db-migrate',
      name: 'Run Migration',
      nameAr: 'تشغيل هجرة',
      description: 'Run database migration',
      descriptionAr: 'تشغيل هجرة قاعدة البيانات',
      category: 'database',
      parameters: [
        { name: 'direction', nameAr: 'الاتجاه', type: 'string', description: 'Migration direction', descriptionAr: 'اتجاه الهجرة', options: ['up', 'down'] }
      ],
      returns: 'boolean',
      dangerous: true,
      execute: async () => true
    });

    this.registerTool({
      id: 'db-stats',
      name: 'Database Stats',
      nameAr: 'إحصائيات قاعدة البيانات',
      description: 'Get database statistics',
      descriptionAr: 'الحصول على إحصائيات قاعدة البيانات',
      category: 'database',
      parameters: [],
      returns: 'object',
      execute: async () => ({ size: 0, tables: 0, records: 0 })
    });
  }

  registerTool(tool: Tool) {
    this.tools.set(tool.id, tool);
  }

  getTool(id: string): Tool | undefined {
    return this.tools.get(id);
  }

  getToolsByCategory(category: ToolCategory): Tool[] {
    return Array.from(this.tools.values()).filter(t => t.category === category);
  }

  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  getToolsByPermission(permission: string): Tool[] {
    return Array.from(this.tools.values()).filter(t => t.permissions?.includes(permission));
  }

  executeTool(id: string, params: Record<string, unknown>): Promise<unknown> {
    const tool = this.tools.get(id);
    if (!tool) {
      throw new Error(`Tool not found: ${id}`);
    }
    return tool.execute(params);
  }

  getToolCount(): number {
    return this.tools.size;
  }

  getCategories(): ToolCategory[] {
    return ['file', 'system', 'network', 'media', 'document', 'data', 'security', 'communication', 'automation', 'development', 'ai', 'device', 'browser', 'office', 'database'];
  }
}

export const toolRegistry = ToolRegistry.getInstance();
