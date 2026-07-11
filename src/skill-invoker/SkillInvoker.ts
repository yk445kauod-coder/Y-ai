/**
 * AILA - AI Life Assistant
 * Skill Invocation System
 */

import { getSkillRegistry, type SkillRegistry } from '../skills/SkillRegistry.js';
import type { Skill, SkillExecutionContext, SkillExecutionResult } from '../skills/Skill.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Intent - Extracted user intent
 */
export interface Intent {
  primary: string;
  secondary: string[];
  entities: Record<string, unknown>;
  confidence: number;
  language: 'ar' | 'en' | 'ar-EG';
}

/**
 * Intent Analysis Result
 */
export interface IntentAnalysis {
  intents: Intent[];
  context: Record<string, unknown>;
  suggestedSkills: string[];
  requiresMultipleSkills: boolean;
}

/**
 * Skill Chain - Multiple skills to execute in sequence
 */
export interface SkillChain {
  id: string;
  skills: SkillExecution[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  results: SkillExecutionResult[];
  startTime?: number;
  endTime?: number;
}

/**
 * Single skill execution in a chain
 */
export interface SkillExecution {
  skillId: string;
  input: Record<string, unknown>;
  order: number;
  dependsOn?: string[];
}

/**
 * Invocation Result
 */
export interface InvocationResult {
  success: boolean;
  results: SkillExecutionResult[];
  totalExecutionTime: number;
  skillsUsed: string[];
  errors: string[];
  output: unknown;
}

/**
 * Skill Invoker - Analyzes requests and invokes appropriate skills
 */
export class SkillInvoker {
  private registry: SkillRegistry;
  private activeChains: Map<string, SkillChain> = new Map();
  
  constructor(registry?: SkillRegistry) {
    this.registry = registry || getSkillRegistry();
  }
  
  /**
   * Analyze user request and determine which skills to use
   */
  async analyzeIntent(
    request: string,
    context?: Record<string, unknown>
  ): Promise<IntentAnalysis> {
    // Detect language
    const language = this.detectLanguage(request);
    
    // Extract primary intent
    const primaryIntent = this.extractPrimaryIntent(request, language);
    
    // Extract secondary intents
    const secondaryIntents = this.extractSecondaryIntents(request, primaryIntent);
    
    // Extract entities
    const entities = this.extractEntities(request, primaryIntent);
    
    // Find suggested skills
    const suggestedSkills = this.findSuggestedSkills(primaryIntent, secondaryIntents);
    
    // Determine if multiple skills are needed
    const requiresMultipleSkills = this.detectMultipleSkillRequirement(
      request,
      primaryIntent,
      secondaryIntents
    );
    
    return {
      intents: [
        {
          primary: primaryIntent,
          secondary: secondaryIntents,
          entities,
          confidence: 0.85,
          language,
        },
      ],
      context: context || {},
      suggestedSkills,
      requiresMultipleSkills,
    };
  }
  
  /**
   * Invoke skills based on intent analysis
   */
  async invoke(
    request: string,
    context?: Record<string, unknown>,
    options?: InvocationOptions
  ): Promise<InvocationResult> {
    const startTime = Date.now();
    const sessionId = uuidv4();
    
    // Analyze intent
    const analysis = await this.analyzeIntent(request, context);
    
    // Get required skills
    const skills = this.getSkillsForIntents(analysis.suggestedSkills);
    
    if (skills.length === 0) {
      return {
        success: false,
        results: [],
        totalExecutionTime: Date.now() - startTime,
        skillsUsed: [],
        errors: ['No suitable skills found for this request'],
        output: null,
      };
    }
    
    // Execute skills
    const results: SkillExecutionResult[] = [];
    const errors: string[] = [];
    const skillsUsed: string[] = [];
    
    for (const skill of skills) {
      // Check if skill should run in parallel
      const shouldRunInParallel = options?.parallel && this.canRunInParallel(skill, results);
      
      if (shouldRunInParallel) {
        // Run in parallel (would use Promise.all in production)
        const result = await this.executeSkill(skill, request, sessionId, context);
        results.push(result);
        if (result.success) {
          skillsUsed.push(skill.id);
        } else {
          errors.push(result.error || 'Unknown error');
        }
      } else {
        // Sequential execution
        const result = await this.executeSkill(skill, request, sessionId, context);
        results.push(result);
        
        if (result.success) {
          skillsUsed.push(skill.id);
          // Update context with results for next skill
          context = { ...context, ...(result.output as Record<string, unknown>) };
        } else {
          errors.push(result.error || 'Unknown error');
          
          // Check if we should continue
          if (!this.shouldContinueOnError(skill, errors)) {
            break;
          }
        }
      }
    }
    
    return {
      success: errors.length === 0,
      results,
      totalExecutionTime: Date.now() - startTime,
      skillsUsed,
      errors,
      output: this.aggregateResults(results),
    };
  }
  
  /**
   * Create and execute a skill chain
   */
  async executeChain(
    executions: SkillExecution[],
    context?: Record<string, unknown>
  ): Promise<SkillChain> {
    const chain: SkillChain = {
      id: uuidv4(),
      skills: executions,
      status: 'pending',
      results: [],
    };
    
    this.activeChains.set(chain.id, chain);
    chain.status = 'running';
    chain.startTime = Date.now();
    
    let sessionId = uuidv4();
    
    for (const execution of executions) {
      const skill = this.registry.get(execution.skillId);
      
      if (!skill) {
        chain.results.push({
          success: false,
          error: `Skill ${execution.skillId} not found`,
          executionTime: 0,
          toolsUsed: [],
        });
        continue;
      }
      
      // Wait for dependencies
      if (execution.dependsOn) {
        await this.waitForDependencies(execution.dependsOn, chain.results);
      }
      
      // Prepare input
      const input = { ...execution.input };
      
      // Merge context from previous results
      const previousResults = chain.results.filter((r) => r.success && r.output);
      for (const prevResult of previousResults) {
        if (prevResult.output && typeof prevResult.output === 'object') {
          Object.assign(input, prevResult.output);
        }
      }
      
      // Execute
      const ctx: SkillExecutionContext = {
        skillId: skill.id,
        input,
        sessionId,
        timestamp: Date.now(),
      };
      
      const result = await this.registry.execute(skill.id, ctx);
      chain.results.push(result);
    }
    
    chain.status = chain.results.every((r) => r.success) ? 'completed' : 'failed';
    chain.endTime = Date.now();
    
    return chain;
  }
  
  /**
   * Detect language of request
   */
  private detectLanguage(request: string): 'ar' | 'en' | 'ar-EG' {
    // Arabic character detection
    const arabicPattern = /[\u0600-\u06FF\u0750-\u077F]/;
    const hasArabic = arabicPattern.test(request);
    
    // Egyptian dialect detection
    const egyptianPattern = /['اويه',' ELA ','مش','كان','ليه','اللي','الي','ده','كده','منين','فين','إيه','طب','لما','كل لما']/i;
    const hasEgyptian = egyptianPattern.test(request);
    
    if (hasArabic) {
      return hasEgyptian ? 'ar-EG' : 'ar';
    }
    
    return 'en';
  }
  
  /**
   * Extract primary intent from request
   */
  private extractPrimaryIntent(
    request: string,
    language: 'ar' | 'en' | 'ar-EG'
  ): string {
    const lowerRequest = request.toLowerCase();
    
    // Intent patterns
    const intentPatterns: Record<string, RegExp[]> = {
      coding: [
        /اكتب|write|code|برمج|develop|create function|create class/i,
        /fix|اصلح|debug|إصلاح/i,
        /review|راجع|review code/i,
      ],
      search: [
        /ابحث|search|find|اعثر/i,
        /look up|google|google it/i,
      ],
      communication: [
        /ابعت|send|email|ايميل/i,
        /رسالة|message|text/i,
      ],
      analysis: [
        /حلل|analyze|analysis/i,
        /compare|قارن/i,
        /evaluate|قيّم/i,
      ],
      creative: [
        /صمم|design|create/i,
        /اكتب|write|compose/i,
        /ارسم|drew|draw/i,
      ],
      automation: [
        /اتهم|automate/i,
        /جدول|schedule/i,
        /كرر|repeat/i,
      ],
      iot: [
        /اشغل|turn on|تفعّل/i,
        /اطفي|turn off|اقفل/i,
        /تحكم|control/i,
      ],
    };
    
    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(request)) {
          return intent;
        }
      }
    }
    
    return 'general';
  }
  
  /**
   * Extract secondary intents
   */
  private extractSecondaryIntents(request: string, primaryIntent: string): string[] {
    const secondary: string[] = [];
    const lowerRequest = request.toLowerCase();
    
    // Check for additional intents
    if (lowerRequest.includes('then') || lowerRequest.includes('بعدين') || lowerRequest.includes('ثم')) {
      secondary.push('sequential');
    }
    
    if (lowerRequest.includes('and') || lowerRequest.includes('و') || lowerRequest.includes('مع')) {
      secondary.push('parallel');
    }
    
    if (lowerRequest.includes('if') || lowerRequest.includes('لو') || lowerRequest.includes('إذا')) {
      secondary.push('conditional');
    }
    
    return secondary;
  }
  
  /**
   * Extract entities from request
   */
  private extractEntities(
    request: string,
    intent: string
  ): Record<string, unknown> {
    const entities: Record<string, unknown> = {};
    
    // Extract language mentions
    const languageMatch = request.match(/(?:in|بـ?|بلغة?)\s*(\w+)/i);
    if (languageMatch) {
      entities.language = languageMatch[1].toLowerCase();
    }
    
    // Extract file names
    const fileMatch = request.match(/[`'"]?([\w.-]+\.\w+)[`'"]?/);
    if (fileMatch) {
      entities.filename = fileMatch[1];
    }
    
    // Extract numbers
    const numberMatch = request.match(/\d+/);
    if (numberMatch) {
      entities.number = parseInt(numberMatch[0], 10);
    }
    
    return entities;
  }
  
  /**
   * Find suggested skills for intents
   */
  private findSuggestedSkills(primary: string, secondary: string[]): string[] {
    const skills: string[] = [];
    
    // Map intents to skill IDs
    const intentToSkill: Record<string, string> = {
      coding: 'coding',
      search: 'web-search',
      communication: 'email',
      analysis: 'data-analysis',
      creative: 'creative-writing',
      automation: 'automation',
      iot: 'iot-control',
    };
    
    if (intentToSkill[primary]) {
      skills.push(intentToSkill[primary]);
    }
    
    // Add secondary skill intents
    for (const s of secondary) {
      if (intentToSkill[s]) {
        skills.push(intentToSkill[s]);
      }
    }
    
    return skills;
  }
  
  /**
   * Detect if multiple skills are needed
   */
  private detectMultipleSkillRequirement(
    request: string,
    primary: string,
    secondary: string[]
  ): boolean {
    // Check for conjunctions
    const hasAnd = /\b(and|و|مع)\b/i.test(request);
    const hasThen = /\b(then|بعدين|ثم)\b/i.test(request);
    const hasMultipleActions = /\b(also|كمان|أيضاً)\b/i.test(request);
    
    return hasAnd || hasThen || hasMultipleActions || secondary.length > 0;
  }
  
  /**
   * Get skill instances for intent IDs
   */
  private getSkillsForIntents(skillIds: string[]): Skill[] {
    const skills: Skill[] = [];
    
    for (const id of skillIds) {
      const skill = this.registry.get(id);
      if (skill && this.registry.isEnabled(id)) {
        skills.push(skill);
      }
    }
    
    return skills;
  }
  
  /**
   * Execute a single skill
   */
  private async executeSkill(
    skill: Skill,
    input: string,
    sessionId: string,
    context?: Record<string, unknown>
  ): Promise<SkillExecutionResult> {
    const ctx: SkillExecutionContext = {
      skillId: skill.id,
      input: { task: input, ...context },
      sessionId,
      timestamp: Date.now(),
    };
    
    return this.registry.execute(skill.id, ctx);
  }
  
  /**
   * Check if skill can run in parallel
   */
  private canRunInParallel(skill: Skill, previousResults: SkillExecutionResult[]): boolean {
    const capabilities = skill.getCapabilities();
    return capabilities.parallel && previousResults.every((r) => r.success);
  }
  
  /**
   * Check if execution should continue after error
   */
  private shouldContinueOnError(skill: Skill, errors: string[]): boolean {
    // Critical skills should stop on error
    if (skill.priority === 'critical') {
      return false;
    }
    
    // Allow some errors before stopping
    return errors.length < 3;
  }
  
  /**
   * Wait for dependencies to complete
   */
  private async waitForDependencies(
    dependsOn: string[],
    results: SkillExecutionResult[]
  ): Promise<void> {
    // In a real implementation, this would wait for specific results
    // For now, we just ensure order
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  
  /**
   * Aggregate results from multiple skill executions
   */
  private aggregateResults(results: SkillExecutionResult[]): unknown {
    const successfulResults = results.filter((r) => r.success && r.output);
    
    if (successfulResults.length === 0) {
      return null;
    }
    
    if (successfulResults.length === 1) {
      return successfulResults[0].output;
    }
    
    // Merge multiple results
    return {
      combined: successfulResults.map((r) => r.output),
      summary: `${successfulResults.length} tasks completed successfully`,
    };
  }
  
  /**
   * Get active chains
   */
  getActiveChains(): SkillChain[] {
    return Array.from(this.activeChains.values()).filter(
      (chain) => chain.status === 'running'
    );
  }
  
  /**
   * Get chain by ID
   */
  getChain(chainId: string): SkillChain | undefined {
    return this.activeChains.get(chainId);
  }
}

/**
 * Invocation Options
 */
export interface InvocationOptions {
  parallel?: boolean;
  timeout?: number;
  retryOnError?: boolean;
}

// Singleton
let globalSkillInvoker: SkillInvoker | null = null;

export function getSkillInvoker(): SkillInvoker {
  if (!globalSkillInvoker) {
    globalSkillInvoker = new SkillInvoker();
  }
  return globalSkillInvoker;
}

export function createSkillInvoker(registry?: SkillRegistry): SkillInvoker {
  return new SkillInvoker(registry);
}
