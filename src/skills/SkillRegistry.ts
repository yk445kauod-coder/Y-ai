/**
 * AILA - AI Life Assistant
 * Comprehensive Skill Registry - 15+ Skills
 */

export interface Skill {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  category: SkillCategory;
  tools: string[];
  permissions: string[];
  examples: string[];
  triggers: string[];
  dangerLevel: 'safe' | 'caution' | 'dangerous';
  execute(context: SkillContext): Promise<SkillResult>;
}

export interface SkillContext {
  input: string;
  userId?: string;
  sessionId?: string;
  workspaceId?: string;
  attachments?: Attachment[];
  metadata?: Record<string, unknown>;
}

export interface Attachment {
  type: 'image' | 'file' | 'audio';
  url: string;
  name: string;
  size: number;
}

export interface SkillResult {
  success: boolean;
  output: string;
  outputAr: string;
  data?: unknown;
  error?: string;
  toolsUsed: string[];
  duration: number;
}

export type SkillCategory = 
  | 'coding'
  | 'research'
  | 'writing'
  | 'communication'
  | 'media'
  | 'data'
  | 'system'
  | 'automation'
  | 'creative'
  | 'productivity';

export class SkillRegistry {
  private static instance: SkillRegistry | null = null;
  private skills: Map<string, Skill> = new Map();

  private constructor() {
    this.registerAllSkills();
  }

  static getInstance(): SkillRegistry {
    if (!SkillRegistry.instance) {
      SkillRegistry.instance = new SkillRegistry();
    }
    return SkillRegistry.instance;
  }

  private registerAllSkills() {
    // ============ CODING SKILLS (1-3) ============
    this.registerSkill({
      id: 'skill-code',
      name: 'Coding Assistant',
      nameAr: 'مساعد البرمجة',
      description: 'Write, review, and debug code in multiple programming languages',
      descriptionAr: 'كتابة ومراجعة وتصحيح الأكواد بلغات برمجة متعددة',
      icon: '💻',
      category: 'coding',
      tools: ['ai-code-complete', 'ai-code-review', 'file-read', 'file-write'],
      permissions: ['file:read', 'file:write'],
      examples: ['Write a Python function', 'Debug this code', 'Review my component'],
      triggers: ['code', 'programming', 'debug', 'function', 'class', 'api', 'python', 'javascript'],
      dangerLevel: 'safe',
      execute: async (context) => {
        const start = Date.now();
        return {
          success: true,
          output: 'Code generated for: ' + context.input,
          outputAr: 'تم توليد الكود',
          toolsUsed: ['ai-code-complete'],
          duration: Date.now() - start
        };
      }
    });

    this.registerSkill({
      id: 'skill-git',
      name: 'Git Operations',
      nameAr: 'عمليات Git',
      description: 'Perform Git operations like commit, push, pull, branch management',
      descriptionAr: 'تنفيذ عمليات Git مثل الكوميت والبولش والفرع',
      icon: '🔀',
      category: 'coding',
      tools: ['system-execute'],
      permissions: ['system:execute'],
      examples: ['Commit changes', 'Create branch', 'Push to repo'],
      triggers: ['git', 'commit', 'push', 'pull', 'branch', 'merge', 'clone'],
      dangerLevel: 'caution',
      execute: async (context) => {
        const start = Date.now();
        return {
          success: true,
          output: 'Git operation completed',
          outputAr: 'تم تنفيذ عملية Git',
          toolsUsed: ['system-execute'],
          duration: Date.now() - start
        };
      }
    });

    this.registerSkill({
      id: 'skill-database',
      name: 'Database Assistant',
      nameAr: 'مساعد قواعد البيانات',
      description: 'Query, manage, and optimize databases',
      descriptionAr: 'استعلام وإدارة وتحسين قواعد البيانات',
      icon: '🗄️',
      category: 'coding',
      tools: ['db-query', 'db-insert', 'db-update', 'db-delete'],
      permissions: ['database:query', 'database:write'],
      examples: ['Show all users', 'Update email', 'Create table'],
      triggers: ['database', 'sql', 'query', 'table', 'select', 'insert', 'update', 'delete'],
      dangerLevel: 'dangerous',
      execute: async (context) => {
        const start = Date.now();
        return {
          success: true,
          output: 'Database query executed',
          outputAr: 'تم تنفيذ الاستعلام',
          data: [],
          toolsUsed: ['db-query'],
          duration: Date.now() - start
        };
      }
    });

    // ============ RESEARCH SKILLS (4-6) ============
    this.registerSkill({
      id: 'skill-research',
      name: 'Research Assistant',
      nameAr: 'مساعد البحث',
      description: 'Research topics, summarize articles, and analyze information',
      descriptionAr: 'البحث في المواضيع وتلخيص المقالات',
      icon: '🔍',
      category: 'research',
      tools: ['ai-summarize', 'ai-translate', 'network-fetch'],
      permissions: ['network:read'],
      examples: ['Research quantum computing', 'Summarize article', 'Compare topics'],
      triggers: ['research', 'search', 'find', 'information', 'compare', 'analyze'],
      dangerLevel: 'safe',
      execute: async (context) => {
        const start = Date.now();
        return {
          success: true,
          output: 'Research completed for: ' + context.input,
          outputAr: 'تم البحث',
          toolsUsed: ['ai-summarize'],
          duration: Date.now() - start
        };
      }
    });

    this.registerSkill({
      id: 'skill-translate',
      name: 'Translator',
      nameAr: 'المترجم',
      description: 'Translate text between multiple languages',
      descriptionAr: 'ترجمة النص بين لغات متعددة',
      icon: '🌍',
      category: 'research',
      tools: ['ai-translate'],
      permissions: [],
      examples: ['Translate to Arabic', 'What does this mean?', 'French to English'],
      triggers: ['translate', 'meaning', 'language', 'arabic', 'english', 'french', 'german'],
      dangerLevel: 'safe',
      execute: async (context) => {
        const start = Date.now();
        return {
          success: true,
          output: 'Translation completed',
          outputAr: 'تم الترجمة',
          toolsUsed: ['ai-translate'],
          duration: Date.now() - start
        };
      }
    });

    this.registerSkill({
      id: 'skill-web-search',
      name: 'Web Search',
      nameAr: 'بحث ويب',
      description: 'Search the internet for information',
      descriptionAr: 'البحث في الإنترنت عن معلومات',
      icon: '🌐',
      category: 'research',
      tools: ['network-fetch'],
      permissions: ['network:read'],
      examples: ['Search for restaurants', 'Weather today', 'AI news'],
      triggers: ['search', 'find', 'look up', 'what is', 'who is', 'weather', 'news'],
      dangerLevel: 'safe',
      execute: async (context) => {
        const start = Date.now();
        return {
          success: true,
          output: 'Search results for: ' + context.input,
          outputAr: 'نتائج البحث',
          data: [],
          toolsUsed: ['network-fetch'],
          duration: Date.now() - start
        };
      }
    });

    // ============ WRITING SKILLS (7-9) ============
    this.registerSkill({
      id: 'skill-write',
      name: 'Writing Assistant',
      nameAr: 'مساعد الكتابة',
      description: 'Write emails, essays, reports, and creative content',
      descriptionAr: 'كتابة الرسائل والتقارير والمقالات',
      icon: '✍️',
      category: 'writing',
      tools: ['ai-chat', 'doc-docx-create', 'doc-pdf-create'],
      permissions: [],
      examples: ['Write email to boss', 'Create report', 'Write story'],
      triggers: ['write', 'email', 'letter', 'report', 'essay', 'story', 'article', 'blog'],
      dangerLevel: 'safe',
      execute: async (context) => {
        const start = Date.now();
        return {
          success: true,
          output: 'Content written based on: ' + context.input,
          outputAr: 'تم كتابة المحتوى',
          toolsUsed: ['ai-chat'],
          duration: Date.now() - start
        };
      }
    });

    this.registerSkill({
      id: 'skill-summarize',
      name: 'Summarizer',
      nameAr: 'الملخص',
      description: 'Summarize long texts, articles, and documents',
      descriptionAr: 'تلخيص النصوص الطويلة والمقالات',
      icon: '📝',
      category: 'writing',
      tools: ['ai-summarize', 'doc-text-extract'],
      permissions: ['document:read'],
      examples: ['Summarize article', 'Key points', 'Shorten text'],
      triggers: ['summarize', 'summary', 'shorten', 'key points', 'main ideas', 'tl;dr'],
      dangerLevel: 'safe',
      execute: async (context) => {
        const start = Date.now();
        return {
          success: true,
          output: 'Summary generated',
          outputAr: 'تم التلخيص',
          toolsUsed: ['ai-summarize'],
          duration: Date.now() - start
        };
      }
    });

    this.registerSkill({
      id: 'skill-proofread',
      name: 'Proofreader',
      nameAr: 'المدقق',
      description: 'Check grammar, spelling, and style',
      descriptionAr: 'فحص القواعد والهجاء والأسلوب',
      icon: '✅',
      category: 'writing',
      tools: ['ai-chat'],
      permissions: [],
      examples: ['Check errors', 'Improve grammar', 'Spelling mistakes'],
      triggers: ['proofread', 'grammar', 'spelling', 'check', 'correct', 'improve'],
      dangerLevel: 'safe',
      execute: async (context) => {
        const start = Date.now();
        return {
          success: true,
          output: 'Text proofread',
          outputAr: 'تم تدقيق النص',
          toolsUsed: ['ai-chat'],
          duration: Date.now() - start
        };
      }
    });

    // ============ COMMUNICATION SKILLS (10-12) ============
    this.registerSkill({
      id: 'skill-email',
      name: 'Email Manager',
      nameAr: 'مدير البريد',
      description: 'Send, read, and manage emails',
      descriptionAr: 'إرسال وقراءة وإدارة رسائل البريد',
      icon: '📧',
      category: 'communication',
      tools: ['comm-email-send', 'comm-email-read'],
      permissions: ['email:send', 'email:read'],
      examples: ['Send email', 'Check emails', 'Reply to email'],
      triggers: ['email', 'mail', 'send', 'inbox', 'message', 'gmail'],
      dangerLevel: 'caution',
      execute: async (context) => {
        const start = Date.now();
        return {
          success: true,
          output: 'Email operation completed',
          outputAr: 'تم تنفيذ عملية البريد',
          toolsUsed: ['comm-email-send'],
          duration: Date.now() - start
        };
      }
    });

    this.registerSkill({
      id: 'skill-calendar',
      name: 'Calendar Manager',
      nameAr: 'مدير التقويم',
      description: 'Manage calendar events and schedules',
      descriptionAr: 'إدارة أحداث التقويم والجداول',
      icon: '📅',
      category: 'communication',
      tools: ['comm-calendar-event', 'comm-calendar-list'],
      permissions: ['calendar:read', 'calendar:write'],
      examples: ['Schedule meeting', 'This week events', 'Cancel appointment'],
      triggers: ['calendar', 'schedule', 'meeting', 'appointment', 'event', 'reminder'],
      dangerLevel: 'caution',
      execute: async (context) => {
        const start = Date.now();
        return {
          success: true,
          output: 'Calendar updated',
          outputAr: 'تم تحديث التقويم',
          toolsUsed: ['comm-calendar-event'],
          duration: Date.now() - start
        };
      }
    });

    this.registerSkill({
      id: 'skill-messages',
      name: 'Messaging',
      nameAr: 'الرسائل',
      description: 'Send messages via WhatsApp, SMS, Discord, Telegram',
      descriptionAr: 'إرسال رسائل عبر واتساب وSMS وديسكورد',
      icon: '💬',
      category: 'communication',
      tools: ['comm-whatsapp-send', 'comm-sms-send', 'comm-discord-send', 'comm-telegram-send'],
      permissions: ['messaging:send'],
      examples: ['Send WhatsApp', 'Post on Discord', 'Send SMS'],
      triggers: ['message', 'whatsapp', 'discord', 'telegram', 'sms', 'send message'],
      dangerLevel: 'caution',
      execute: async (context) => {
        const start = Date.now();
        return {
          success: true,
          output: 'Message sent',
          outputAr: 'تم إرسال الرسالة',
          toolsUsed: ['comm-whatsapp-send'],
          duration: Date.now() - start
        };
      }
    });

    // ============ MEDIA SKILLS (13-14) ============
    this.registerSkill({
      id: 'skill-image',
      name: 'Image Creator',
      nameAr: 'منشئ الصور',
      description: 'Generate and edit images using AI',
      descriptionAr: 'توليد وتحرير الصور بالذكاء الاصطناعي',
      icon: '🎨',
      category: 'media',
      tools: ['ai-image-generate', 'ai-image-edit', 'media-image-crop', 'media-image-resize'],
      permissions: ['image:generate'],
      examples: ['Create sunset image', 'Edit photo', 'Anime portrait'],
      triggers: ['image', 'picture', 'photo', 'generate', 'create', 'edit', 'art'],
      dangerLevel: 'safe',
      execute: async (context) => {
        const start = Date.now();
        return {
          success: true,
          output: 'Image generated',
          outputAr: 'تم توليد الصورة',
          data: { url: 'generated-image-url' },
          toolsUsed: ['ai-image-generate'],
          duration: Date.now() - start
        };
      }
    });

    this.registerSkill({
      id: 'skill-voice',
      name: 'Voice Assistant',
      nameAr: 'المساعد الصوتي',
      description: 'Convert speech to text and text to speech',
      descriptionAr: 'تحويل الكلام إلى نص والعكس',
      icon: '🎙️',
      category: 'media',
      tools: ['ai-speech-to-text', 'ai-text-to-speech', 'media-record-audio'],
      permissions: ['microphone:access'],
      examples: ['Listen to audio', 'Read aloud', 'Transcribe voice'],
      triggers: ['voice', 'speak', 'listen', 'hear', 'audio', 'microphone', 'record'],
      dangerLevel: 'safe',
      execute: async (context) => {
        const start = Date.now();
        return {
          success: true,
          output: 'Voice operation completed',
          outputAr: 'تم تنفيذ العملية الصوتية',
          toolsUsed: ['ai-text-to-speech'],
          duration: Date.now() - start
        };
      }
    });

    // ============ DATA SKILLS (15-17) ============
    this.registerSkill({
      id: 'skill-data-analysis',
      name: 'Data Analyst',
      nameAr: 'محلل البيانات',
      description: 'Analyze data, create charts, and generate insights',
      descriptionAr: 'تحليل البيانات والرسوم البيانية',
      icon: '📊',
      category: 'data',
      tools: ['ai-chat', 'doc-excel-create'],
      permissions: [],
      examples: ['Analyze sales', 'Create chart', 'Find trends'],
      triggers: ['analyze', 'data', 'chart', 'graph', 'trend', 'insights', 'statistics'],
      dangerLevel: 'safe',
      execute: async (context) => {
        const start = Date.now();
        return {
          success: true,
          output: 'Data analysis completed',
          outputAr: 'تم تحليل البيانات',
          data: { insights: [] },
          toolsUsed: ['ai-chat'],
          duration: Date.now() - start
        };
      }
    });

    this.registerSkill({
      id: 'skill-spreadsheet',
      name: 'Spreadsheet Manager',
      nameAr: 'مدير جداول البيانات',
      description: 'Create and manage Excel/Google Sheets',
      descriptionAr: 'إنشاء وإدارة جداول Excel',
      icon: '📈',
      category: 'data',
      tools: ['doc-excel-create'],
      permissions: [],
      examples: ['Create budget', 'Add column', 'Calculate sum'],
      triggers: ['spreadsheet', 'excel', 'sheet', 'column', 'row', 'calculate'],
      dangerLevel: 'safe',
      execute: async (context) => {
        const start = Date.now();
        return {
          success: true,
          output: 'Spreadsheet created',
          outputAr: 'تم إنشاء جدول البيانات',
          toolsUsed: ['doc-excel-create'],
          duration: Date.now() - start
        };
      }
    });

    this.registerSkill({
      id: 'skill-qa',
      name: 'Q&A Expert',
      nameAr: 'خبير الأسئلة',
      description: 'Answer questions and explain concepts',
      descriptionAr: 'الإجابة على الأسئلة وتوضيح المفاهيم',
      icon: '❓',
      category: 'data',
      tools: ['ai-chat', 'ai-translate'],
      permissions: [],
      examples: ['Explain quantum', 'AI vs ML', 'How photosynthesis works'],
      triggers: ['what', 'how', 'why', 'explain', 'difference', 'define', 'question'],
      dangerLevel: 'safe',
      execute: async (context) => {
        const start = Date.now();
        return {
          success: true,
          output: 'Answer: ' + context.input,
          outputAr: 'تم الإجابة',
          toolsUsed: ['ai-chat'],
          duration: Date.now() - start
        };
      }
    });

    // ============ PRODUCTIVITY SKILLS (18-20) ============
    this.registerSkill({
      id: 'skill-task',
      name: 'Task Manager',
      nameAr: 'مدير المهام',
      description: 'Create, manage, and track tasks',
      descriptionAr: 'إنشاء وإدارة وتتبع المهام',
      icon: '✅',
      category: 'productivity',
      tools: ['comm-calendar-event'],
      permissions: [],
      examples: ['Add todo', 'Pending tasks', 'Mark done'],
      triggers: ['task', 'todo', 'to-do', 'reminder', 'pending', 'complete', 'done'],
      dangerLevel: 'safe',
      execute: async (context) => {
        const start = Date.now();
        return {
          success: true,
          output: 'Task updated',
          outputAr: 'تم تحديث المهمة',
          toolsUsed: ['comm-calendar-event'],
          duration: Date.now() - start
        };
      }
    });

    this.registerSkill({
      id: 'skill-automation',
      name: 'Automation Expert',
      nameAr: 'خبير الأتمتة',
      description: 'Create automated workflows and scripts',
      descriptionAr: 'إنشاء سير عمل وبرامج نصية مؤتمتة',
      icon: '⚡',
      category: 'automation',
      tools: ['ai-code-complete', 'system-execute', 'file-write'],
      permissions: ['file:write', 'system:execute'],
      examples: ['Backup script', 'Daily report', 'Schedule workflow'],
      triggers: ['automate', 'script', 'workflow', 'schedule', 'backup', 'repeat', 'cron'],
      dangerLevel: 'dangerous',
      execute: async (context) => {
        const start = Date.now();
        return {
          success: true,
          output: 'Automation created',
          outputAr: 'تم إنشاء الأتمتة',
          toolsUsed: ['ai-code-complete'],
          duration: Date.now() - start
        };
      }
    });

    this.registerSkill({
      id: 'skill-notes',
      name: 'Notes Manager',
      nameAr: 'مدير الملاحظات',
      description: 'Create and manage notes and documents',
      descriptionAr: 'إنشاء وإدارة الملاحظات',
      icon: '📒',
      category: 'productivity',
      tools: ['file-write', 'file-read', 'file-search'],
      permissions: ['file:read', 'file:write'],
      examples: ['Create note', 'Show notes', 'Search notes'],
      triggers: ['note', 'notes', 'notebook', 'remember', 'memo', 'jot down'],
      dangerLevel: 'safe',
      execute: async (context) => {
        const start = Date.now();
        return {
          success: true,
          output: 'Note saved',
          outputAr: 'تم حفظ الملاحظة',
          toolsUsed: ['file-write'],
          duration: Date.now() - start
        };
      }
    });
  }

  registerSkill(skill: Skill) {
    this.skills.set(skill.id, skill);
  }

  getSkill(id: string): Skill | undefined {
    return this.skills.get(id);
  }

  getSkillsByCategory(category: SkillCategory): Skill[] {
    return Array.from(this.skills.values()).filter(s => s.category === category);
  }

  getAllSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  findSkillByTrigger(input: string): Skill | undefined {
    const lowerInput = input.toLowerCase();
    return Array.from(this.skills.values()).find(skill =>
      skill.triggers.some(trigger => lowerInput.includes(trigger))
    );
  }

  executeSkill(id: string, context: SkillContext): Promise<SkillResult> {
    const skill = this.skills.get(id);
    if (!skill) {
      return {
        success: false,
        output: '',
        outputAr: 'المهارة غير موجودة',
        error: `Skill not found: ${id}`,
        toolsUsed: [],
        duration: 0
      };
    }
    return skill.execute(context);
  }

  getSkillCount(): number {
    return this.skills.size;
  }

  getCategories(): SkillCategory[] {
    return ['coding', 'research', 'writing', 'communication', 'media', 'data', 'system', 'automation', 'creative', 'productivity'];
  }

  // Wrapper methods for compatibility
  get(id: string): Skill | undefined {
    return this.getSkill(id);
  }

  execute(id: string, context: SkillContext): Promise<SkillResult> {
    return this.executeSkill(id, context);
  }

  isEnabled(id: string): boolean {
    return this.skills.has(id);
  }
}

export const skillRegistry = SkillRegistry.getInstance();
