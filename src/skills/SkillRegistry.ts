/**
 * AILA - AI Life Assistant
 * Skills System - Skill Registry
 */

import type {
  Skill,
  SkillCategory,
  SkillPriority,
  SkillStatus,
  SkillRegistryEntry,
  SkillManifest,
  SkillConfig,
  SkillExecutionContext,
  SkillExecutionResult,
  SkillStatistics,
} from './Skill.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Skill Registry - Manages all skills in the system
 */
export class SkillRegistry {
  private skills: Map<string, SkillRegistryEntry> = new Map();
  private categories: Map<SkillCategory, Set<string>> = new Map();
  private stats: Map<string, SkillStatistics> = new Map();
  
  /**
   * Register a new skill
   */
  async register(skill: Skill, config?: SkillConfig): Promise<void> {
    if (this.skills.has(skill.id)) {
      throw new Error(`Skill ${skill.id} is already registered`);
    }
    
    await skill.initialize();
    
    const entry: SkillRegistryEntry = {
      skill,
      enabled: config?.enabled ?? true,
      usageCount: 0,
      successRate: 100,
    };
    
    this.skills.set(skill.id, entry);
    
    // Add to category index
    if (!this.categories.has(skill.category)) {
      this.categories.set(skill.category, new Set());
    }
    this.categories.get(skill.category)!.add(skill.id);
    
    // Initialize stats
    this.stats.set(skill.id, {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      usageByDay: {},
    });
  }
  
  /**
   * Unregister a skill
   */
  async unregister(skillId: string): Promise<void> {
    const entry = this.skills.get(skillId);
    
    if (!entry) {
      throw new Error(`Skill ${skillId} is not registered`);
    }
    
    await entry.skill.dispose();
    this.skills.delete(skillId);
    
    // Remove from category index
    const category = entry.skill.category;
    this.categories.get(category)?.delete(skillId);
    
    // Remove stats
    this.stats.delete(skillId);
  }
  
  /**
   * Get a skill by ID
   */
  get(skillId: string): Skill | undefined {
    return this.skills.get(skillId)?.skill;
  }
  
  /**
   * Get all registered skills
   */
  getAll(): Skill[] {
    return Array.from(this.skills.values()).map((entry) => entry.skill);
  }
  
  /**
   * Get skills by category
   */
  getByCategory(category: SkillCategory): Skill[] {
    const skillIds = this.categories.get(category);
    if (!skillIds) return [];
    
    return Array.from(skillIds)
      .map((id) => this.skills.get(id)?.skill)
      .filter((skill): skill is Skill => skill !== undefined);
  }
  
  /**
   * Get enabled skills
   */
  getEnabled(): Skill[] {
    return this.getAll().filter((skill) => this.isEnabled(skill.id));
  }
  
  /**
   * Check if a skill is enabled
   */
  isEnabled(skillId: string): boolean {
    return this.skills.get(skillId)?.enabled ?? false;
  }
  
  /**
   * Enable a skill
   */
  enable(skillId: string): void {
    const entry = this.skills.get(skillId);
    if (!entry) {
      throw new Error(`Skill ${skillId} is not registered`);
    }
    entry.enabled = true;
  }
  
  /**
   * Disable a skill
   */
  disable(skillId: string): void {
    const entry = this.skills.get(skillId);
    if (!entry) {
      throw new Error(`Skill ${skillId} is not registered`);
    }
    entry.enabled = false;
  }
  
  /**
   * Set skill priority
   */
  setPriority(skillId: string, priority: SkillPriority): void {
    const entry = this.skills.get(skillId);
    if (!entry) {
      throw new Error(`Skill ${skillId} is not registered`);
    }
    entry.skill.priority = priority;
  }
  
  /**
   * Execute a skill
   */
  async execute(
    skillId: string,
    context: SkillExecutionContext
  ): Promise<SkillExecutionResult> {
    const entry = this.skills.get(skillId);
    
    if (!entry) {
      throw new Error(`Skill ${skillId} is not registered`);
    }
    
    if (!entry.enabled) {
      return {
        success: false,
        error: `Skill ${skillId} is disabled`,
        executionTime: 0,
        toolsUsed: [],
      };
    }
    
    const startTime = Date.now();
    
    try {
      // Validate input
      const validation = entry.skill.validateInput(context.input);
      if (!validation.valid) {
        return {
          success: false,
          error: `Invalid input: ${validation.errors?.join(', ')}`,
          executionTime: Date.now() - startTime,
          toolsUsed: [],
        };
      }
      
      // Execute skill
      const result = await entry.skill.execute(context);
      
      // Update stats
      this.updateStats(skillId, result);
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      this.updateStats(skillId, {
        success: false,
        error: errorMessage,
        executionTime: Date.now() - startTime,
        toolsUsed: [],
      });
      
      return {
        success: false,
        error: errorMessage,
        executionTime: Date.now() - startTime,
        toolsUsed: [],
      };
    }
  }
  
  /**
   * Update skill statistics
   */
  private updateStats(
    skillId: string,
    result: SkillExecutionResult
  ): void {
    const stats = this.stats.get(skillId);
    const entry = this.skills.get(skillId);
    
    if (!stats || !entry) return;
    
    stats.totalExecutions++;
    entry.usageCount++;
    entry.lastUsed = Date.now();
    
    if (result.success) {
      stats.successfulExecutions++;
    } else {
      stats.failedExecutions++;
    }
    
    // Update average execution time
    const totalTime = stats.averageExecutionTime * (stats.totalExecutions - 1);
    stats.averageExecutionTime = (totalTime + result.executionTime) / stats.totalExecutions;
    
    // Update daily usage
    const today = new Date().toISOString().split('T')[0];
    stats.usageByDay[today] = (stats.usageByDay[today] || 0) + 1;
    
    // Update success rate
    entry.successRate = (stats.successfulExecutions / stats.totalExecutions) * 100;
  }
  
  /**
   * Get skill statistics
   */
  getStatistics(skillId: string): SkillStatistics | undefined {
    return this.stats.get(skillId);
  }
  
  /**
   * Get all statistics
   */
  getAllStatistics(): Map<string, SkillStatistics> {
    return new Map(this.stats);
  }
  
  /**
   * Search skills by query
   */
  search(query: string): Skill[] {
    const lowerQuery = query.toLowerCase();
    
    return this.getEnabled().filter((skill) => {
      return (
        skill.name.toLowerCase().includes(lowerQuery) ||
        skill.description.toLowerCase().includes(lowerQuery) ||
        skill.metadata?.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        skill.metadata?.useCases?.some((uc) => uc.toLowerCase().includes(lowerQuery))
      );
    });
  }
  
  /**
   * Get skills by status
   */
  getByStatus(status: SkillStatus): Skill[] {
    return this.getAll().filter((skill) => skill.status === status);
  }
  
  /**
   * Get top used skills
   */
  getTopUsed(limit = 10): Skill[] {
    return Array.from(this.skills.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit)
      .map((entry) => entry.skill);
  }
  
  /**
   * Get recommended skills for a task
   */
  getRecommended(task: string): Skill[] {
    const taskLower = task.toLowerCase();
    
    // Keywords mapping to categories
    const keywords: Record<string, SkillCategory[]> = {
      code: ['coding'],
      programming: ['coding'],
      develop: ['coding'],
      debug: ['coding'],
      review: ['coding', 'analysis'],
      search: ['research'],
      research: ['research'],
      analyze: ['analysis'],
      data: ['analysis'],
      write: ['creative', 'communication'],
      design: ['creative'],
      create: ['creative'],
      email: ['communication'],
      message: ['communication'],
      automate: ['automation'],
      schedule: ['automation', 'productivity'],
      iot: ['iot'],
      device: ['iot'],
      security: ['security'],
      protect: ['security'],
      task: ['productivity'],
      project: ['productivity'],
    };
    
    // Find matching categories
    const matchingCategories = new Set<SkillCategory>();
    for (const [keyword, categories] of Object.entries(keywords)) {
      if (taskLower.includes(keyword)) {
        categories.forEach((cat) => matchingCategories.add(cat));
      }
    }
    
    // Get skills from matching categories
    const recommended: Skill[] = [];
    for (const category of matchingCategories) {
      recommended.push(...this.getByCategory(category));
    }
    
    // Sort by priority and usage
    return recommended.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      const entryA = this.skills.get(a.id);
      const entryB = this.skills.get(b.id);
      return (entryB?.usageCount ?? 0) - (entryA?.usageCount ?? 0);
    });
  }
  
  /**
   * Import skills from manifest
   */
  async importFromManifest(manifest: SkillManifest): Promise<void> {
    // Dynamic import would be used here in production
    // For now, this is a placeholder
    console.log(`Would import skill from manifest: ${manifest.id}`);
  }
  
  /**
   * Export skills to manifest
   */
  exportToManifest(skillId: string): SkillManifest | undefined {
    const skill = this.get(skillId);
    if (!skill) return undefined;
    
    return {
      id: skill.id,
      name: skill.name,
      version: skill.version,
      description: skill.description,
      category: skill.category,
      main: '',
      permissions: skill.metadata?.tags,
    };
  }
  
  /**
   * Clear all skills
   */
  async clear(): Promise<void> {
    const skillIds = Array.from(this.skills.keys());
    for (const id of skillIds) {
      await this.unregister(id);
    }
  }
  
  /**
   * Get registry size
   */
  get size(): number {
    return this.skills.size;
  }
}

// Singleton instance
let globalSkillRegistry: SkillRegistry | null = null;

export function getSkillRegistry(): SkillRegistry {
  if (!globalSkillRegistry) {
    globalSkillRegistry = new SkillRegistry();
  }
  return globalSkillRegistry;
}

export function setSkillRegistry(registry: SkillRegistry): void {
  globalSkillRegistry = registry;
}

export function createSkillRegistry(): SkillRegistry {
  return new SkillRegistry();
}
