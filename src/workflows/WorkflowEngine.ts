/**
 * AILA - AI Life Assistant
 * Workflow System - Automation Engine
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Workflow Step Types
 */
export type WorkflowStepType =
  | 'action'
  | 'condition'
  | 'loop'
  | 'delay'
  | 'http'
  | 'transform'
  | 'filter';

/**
 * Workflow Step
 */
export interface WorkflowStep {
  id: string;
  name: string;
  type: WorkflowStepType;
  config: WorkflowStepConfig;
  next?: string[];
  onError?: string;
}

/**
 * Workflow Step Configuration
 */
export interface WorkflowStepConfig {
  // Action step
  action?: {
    function: string;
    parameters: Record<string, unknown>;
  };
  
  // Condition step
  condition?: {
    expression: string;
    trueStep?: string;
    falseStep?: string;
  };
  
  // Loop step
  loop?: {
    items: unknown[];
    iteratorVariable: string;
    bodyStep: string;
  };
  
  // Delay step
  delay?: {
    duration: number; // milliseconds
  };
  
  // HTTP step
  http?: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    headers?: Record<string, string>;
    body?: unknown;
  };
  
  // Transform step
  transform?: {
    input: unknown;
    operations: TransformOperation[];
  };
  
  // Filter step
  filter?: {
    items: unknown[];
    condition: string;
  };
}

/**
 * Transform Operation
 */
export interface TransformOperation {
  type: 'map' | 'reduce' | 'filter' | 'sort' | 'group' | 'pick' | 'omit';
  config?: Record<string, unknown>;
}

/**
 * Workflow Definition
 */
export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  version: string;
  steps: WorkflowStep[];
  entryPoint: string;
  variables?: Record<string, unknown>;
  timeout?: number;
  retryPolicy?: RetryPolicy;
  triggers?: WorkflowTrigger[];
  schedule?: WorkflowSchedule;
}

/**
 * Workflow Trigger Types
 */
export type WorkflowTriggerType = 'manual' | 'scheduled' | 'event' | 'webhook' | 'voice';

/**
 * Workflow Trigger
 */
export interface WorkflowTrigger {
  type: WorkflowTriggerType;
  config: Record<string, unknown>;
  enabled: boolean;
}

/**
 * Workflow Schedule
 */
export interface WorkflowSchedule {
  cron?: string;
  interval?: number; // milliseconds
  timezone?: string;
}

/**
 * Retry Policy
 */
export interface RetryPolicy {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

/**
 * Workflow Execution Status
 */
export type WorkflowStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

/**
 * Workflow Execution
 */
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: WorkflowStatus;
  currentStep?: string;
  variables: Record<string, unknown>;
  results: StepResult[];
  startTime: number;
  endTime?: number;
  error?: string;
  logs: WorkflowLog[];
}

/**
 * Step Result
 */
export interface StepResult {
  stepId: string;
  stepName: string;
  success: boolean;
  output?: unknown;
  error?: string;
  duration: number;
  timestamp: number;
}

/**
 * Workflow Log
 */
export interface WorkflowLog {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  stepId?: string;
  timestamp: number;
  data?: unknown;
}

/**
 * Workflow Engine
 */
export class WorkflowEngine {
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private scheduledWorkflows: Map<string, ReturnType<typeof setInterval>> = new Map();
  
  /**
   * Register a workflow
   */
  register(workflow: WorkflowDefinition): void {
    if (this.workflows.has(workflow.id)) {
      throw new Error(`Workflow ${workflow.id} is already registered`);
    }
    
    // Validate workflow
    this.validateWorkflow(workflow);
    
    this.workflows.set(workflow.id, workflow);
    
    // Setup schedule if defined
    if (workflow.schedule) {
      this.setupSchedule(workflow);
    }
  }
  
  /**
   * Unregister a workflow
   */
  unregister(workflowId: string): void {
    this.stopSchedule(workflowId);
    this.workflows.delete(workflowId);
  }
  
  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId: string): WorkflowDefinition | undefined {
    return this.workflows.get(workflowId);
  }
  
  /**
   * Get all workflows
   */
  getAllWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }
  
  /**
   * Execute a workflow
   */
  async execute(
    workflowId: string,
    input?: Record<string, unknown>
  ): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId);
    
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }
    
    const execution: WorkflowExecution = {
      id: uuidv4(),
      workflowId,
      status: 'running',
      variables: { ...workflow.variables, ...input },
      results: [],
      startTime: Date.now(),
      logs: [],
    };
    
    this.executions.set(execution.id, execution);
    
    // Run workflow in background
    this.runWorkflow(execution, workflow).catch((error) => {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : String(error);
      execution.endTime = Date.now();
    });
    
    return execution;
  }
  
  /**
   * Get execution by ID
   */
  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }
  
  /**
   * Get executions for a workflow
   */
  getWorkflowExecutions(workflowId: string): WorkflowExecution[] {
    return Array.from(this.executions.values())
      .filter((e) => e.workflowId === workflowId);
  }
  
  /**
   * Cancel execution
   */
  cancelExecution(executionId: string): boolean {
    const execution = this.executions.get(executionId);
    if (!execution || execution.status !== 'running') {
      return false;
    }
    
    execution.status = 'cancelled';
    execution.endTime = Date.now();
    execution.logs.push({
      level: 'info',
      message: 'Workflow cancelled by user',
      timestamp: Date.now(),
    });
    
    return true;
  }
  
  /**
   * Pause execution
   */
  pauseExecution(executionId: string): boolean {
    const execution = this.executions.get(executionId);
    if (!execution || execution.status !== 'running') {
      return false;
    }
    
    execution.status = 'paused';
    return true;
  }
  
  /**
   * Resume execution
   */
  async resumeExecution(executionId: string): Promise<boolean> {
    const execution = this.executions.get(executionId);
    if (!execution || execution.status !== 'paused') {
      return false;
    }
    
    execution.status = 'running';
    const workflow = this.workflows.get(execution.workflowId);
    if (!workflow) return false;
    
    this.runWorkflow(execution, workflow).catch((error) => {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : String(error);
      execution.endTime = Date.now();
    });
    
    return true;
  }
  
  /**
   * Run workflow execution
   */
  private async runWorkflow(
    execution: WorkflowExecution,
    workflow: WorkflowDefinition
  ): Promise<void> {
    let currentStepId = workflow.entryPoint;
    const startTime = Date.now();
    
    // Setup timeout
    const timeout = workflow.timeout || 300000; // 5 minutes default
    
    while (currentStepId && execution.status === 'running') {
      // Check timeout
      if (Date.now() - startTime > timeout) {
        execution.status = 'failed';
        execution.error = 'Workflow timeout';
        execution.endTime = Date.now();
        return;
      }
      
      const step = workflow.steps.find((s) => s.id === currentStepId);
      if (!step) {
        execution.status = 'failed';
        execution.error = `Step ${currentStepId} not found`;
        execution.endTime = Date.now();
        return;
      }
      
      execution.currentStep = step.id;
      
      try {
        const result = await this.executeStep(step, execution);
        execution.results.push(result);
        
        // Determine next step
        if (result.success) {
          currentStepId = step.next?.[0] || undefined;
          
          // Handle conditional branching
          if (step.type === 'condition' && step.config.condition) {
            const conditionMet = this.evaluateCondition(
              step.config.condition.expression,
              execution.variables
            );
            currentStepId = conditionMet
              ? step.config.condition.trueStep
              : step.config.condition.falseStep;
          }
        } else {
          // Handle error
          if (step.onError) {
            currentStepId = step.onError;
          } else {
            execution.status = 'failed';
            execution.error = `Step ${step.id} failed: ${result.error}`;
            execution.endTime = Date.now();
            return;
          }
        }
        
        // Handle delay
        if (step.type === 'delay' && step.config.delay) {
          await new Promise((resolve) =>
            setTimeout(resolve, step.config.delay!.duration)
          );
        }
        
      } catch (error) {
        execution.status = 'failed';
        execution.error = error instanceof Error ? error.message : String(error);
        execution.endTime = Date.now();
        return;
      }
    }
    
    execution.status = 'completed';
    execution.endTime = Date.now();
  }
  
  /**
   * Execute a single step
   */
  private async executeStep(
    step: WorkflowStep,
    execution: WorkflowExecution
  ): Promise<StepResult> {
    const stepStart = Date.now();
    
    execution.logs.push({
      level: 'info',
      message: `Executing step: ${step.name}`,
      stepId: step.id,
      timestamp: stepStart,
    });
    
    try {
      let output: unknown;
      
      switch (step.type) {
        case 'action':
          output = await this.executeAction(step.config.action!, execution.variables);
          break;
        
        case 'http':
          output = await this.executeHttp(step.config.http!);
          break;
        
        case 'transform':
          output = this.executeTransform(step.config.transform!);
          break;
        
        case 'filter':
          output = this.executeFilter(step.config.filter!);
          break;
        
        case 'condition':
          // Condition evaluation happens at workflow level
          output = true;
          break;
        
        case 'loop':
          output = await this.executeLoop(step.config.loop!, execution);
          break;
        
        case 'delay':
          // Delays are handled at workflow level
          output = null;
          break;
        
        default:
          output = null;
      }
      
      return {
        stepId: step.id,
        stepName: step.name,
        success: true,
        output,
        duration: Date.now() - stepStart,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        stepId: step.id,
        stepName: step.name,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - stepStart,
        timestamp: Date.now(),
      };
    }
  }
  
  /**
   * Execute action step
   */
  private async executeAction(
    action: NonNullable<WorkflowStepConfig['action']>,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    // In production, this would call FunctionRegistry
    console.log(`Executing action: ${action.function}`, action.parameters);
    return { action: action.function, result: 'executed' };
  }
  
  /**
   * Execute HTTP request
   */
  private async executeHttp(
    http: NonNullable<WorkflowStepConfig['http']>
  ): Promise<unknown> {
    const response = await fetch(http.url, {
      method: http.method,
      headers: http.headers,
      body: http.body ? JSON.stringify(http.body) : undefined,
    });
    
    return {
      status: response.status,
      statusText: response.statusText,
      body: await response.json().catch(() => response.text()),
    };
  }
  
  /**
   * Execute transform operations
   */
  private executeTransform(
    transform: NonNullable<WorkflowStepConfig['transform']>
  ): unknown {
    let result = transform.input;
    
    for (const op of transform.operations) {
      switch (op.type) {
        case 'map':
          result = (result as unknown[]).map((item) =>
            this.applyMapOperation(item, op.config)
          );
          break;
        case 'filter':
          result = (result as unknown[]).filter((item) =>
            this.evaluateCondition(op.config?.condition as string, { item })
          );
          break;
        case 'pick':
          if (Array.isArray(result)) {
            result = result.map((item) => this.pickProperties(item, op.config?.keys as string[]));
          } else {
            result = this.pickProperties(result, op.config?.keys as string[]);
          }
          break;
        case 'omit':
          if (Array.isArray(result)) {
            result = result.map((item) => this.omitProperties(item, op.config?.keys as string[]));
          } else {
            result = this.omitProperties(result, op.config?.keys as string[]);
          }
          break;
      }
    }
    
    return result;
  }
  
  /**
   * Execute filter
   */
  private executeFilter(
    filter: NonNullable<WorkflowStepConfig['filter']>
  ): unknown[] {
    return (filter.items as unknown[]).filter((item) =>
      this.evaluateCondition(filter.condition, { item })
    );
  }
  
  /**
   * Execute loop
   */
  private async executeLoop(
    loop: NonNullable<WorkflowStepConfig['loop']>,
    execution: WorkflowExecution
  ): Promise<unknown[]> {
    const results: unknown[] = [];
    
    for (const item of loop.items as unknown[]) {
      execution.variables[loop.iteratorVariable] = item;
      results.push(item);
    }
    
    return results;
  }
  
  /**
   * Evaluate condition expression
   */
  private evaluateCondition(expression: string, variables: Record<string, unknown>): boolean {
    // Simple expression evaluation
    // In production, use a safe expression parser
    try {
      // Replace variables in expression
      let evalExpression = expression;
      for (const [key, value] of Object.entries(variables)) {
        evalExpression = evalExpression.replace(
          new RegExp(`\\{${key}\\}`, 'g'),
          JSON.stringify(value)
        );
      }
      // eslint-disable-next-line no-eval
      return !!eval(evalExpression);
    } catch {
      return false;
    }
  }
  
  /**
   * Apply map operation
   */
  private applyMapOperation(item: unknown, config?: Record<string, unknown>): unknown {
    if (config?.expression) {
      return this.evaluateCondition(config.expression as string, { item });
    }
    return item;
  }
  
  /**
   * Pick properties from object
   */
  private pickProperties(obj: unknown, keys: string[]): unknown {
    if (typeof obj !== 'object' || obj === null) return obj;
    const result: Record<string, unknown> = {};
    for (const key of keys) {
      (result as Record<string, unknown>)[key] = (obj as Record<string, unknown>)[key];
    }
    return result;
  }
  
  /**
   * Omit properties from object
   */
  private omitProperties(obj: unknown, keys: string[]): unknown {
    if (typeof obj !== 'object' || obj === null) return obj;
    const result = { ...(obj as Record<string, unknown>) };
    for (const key of keys) {
      delete result[key];
    }
    return result;
  }
  
  /**
   * Validate workflow
   */
  private validateWorkflow(workflow: WorkflowDefinition): void {
    if (!workflow.steps.length) {
      throw new Error('Workflow must have at least one step');
    }
    
    if (!workflow.entryPoint) {
      throw new Error('Workflow must have an entry point');
    }
    
    const stepIds = new Set(workflow.steps.map((s) => s.id));
    if (!stepIds.has(workflow.entryPoint)) {
      throw new Error('Entry point step not found');
    }
  }
  
  /**
   * Setup schedule for workflow
   */
  private setupSchedule(workflow: WorkflowDefinition): void {
    if (!workflow.schedule) return;
    
    let interval: number;
    
    if (workflow.schedule.interval) {
      interval = workflow.schedule.interval;
    } else if (workflow.schedule.cron) {
      // Simple cron parsing (use cron library in production)
      interval = 60000; // Default to 1 minute
    } else {
      return;
    }
    
    const timer = setInterval(() => {
      this.execute(workflow.id);
    }, interval);
    
    this.scheduledWorkflows.set(workflow.id, timer);
  }
  
  /**
   * Stop workflow schedule
   */
  private stopSchedule(workflowId: string): void {
    const timer = this.scheduledWorkflows.get(workflowId);
    if (timer) {
      clearInterval(timer);
      this.scheduledWorkflows.delete(workflowId);
    }
  }
  
  /**
   * Create workflow from template
   */
  createFromTemplate(template: WorkflowTemplate): WorkflowDefinition {
    return {
      id: uuidv4(),
      name: template.name,
      description: template.description,
      version: '1.0.0',
      steps: template.steps.map((step) => ({
        ...step,
        id: uuidv4(),
      })),
      entryPoint: template.entryPoint,
      variables: template.variables,
    };
  }
  
  /**
   * Get workflow statistics
   */
  getStatistics(workflowId: string): WorkflowStatistics {
    const executions = this.getWorkflowExecutions(workflowId);
    
    const completed = executions.filter((e) => e.status === 'completed').length;
    const failed = executions.filter((e) => e.status === 'failed').length;
    
    const durations = executions
      .filter((e) => e.endTime)
      .map((e) => (e.endTime || 0) - e.startTime);
    
    const avgDuration = durations.length
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;
    
    return {
      totalExecutions: executions.length,
      completed,
      failed,
      successRate: executions.length ? (completed / executions.length) * 100 : 0,
      averageDuration: avgDuration,
    };
  }
}

/**
 * Workflow Template
 */
export interface WorkflowTemplate {
  name: string;
  description?: string;
  steps: Omit<WorkflowStep, 'id'>[];
  entryPoint: string;
  variables?: Record<string, unknown>;
}

/**
 * Workflow Statistics
 */
export interface WorkflowStatistics {
  totalExecutions: number;
  completed: number;
  failed: number;
  successRate: number;
  averageDuration: number;
}

// Singleton
let globalWorkflowEngine: WorkflowEngine | null = null;

export function getWorkflowEngine(): WorkflowEngine {
  if (!globalWorkflowEngine) {
    globalWorkflowEngine = new WorkflowEngine();
  }
  return globalWorkflowEngine;
}

export function createWorkflowEngine(): WorkflowEngine {
  return new WorkflowEngine();
}
