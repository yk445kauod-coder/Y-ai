/**
 * AILA - AI Life Assistant
 * Progress Indicator Component
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export interface ProgressTask {
  id: string;
  title: string;
  description?: string;
  progress: number; // 0-100
  status: 'pending' | 'running' | 'completed' | 'error';
  startTime?: number;
  endTime?: number;
  icon?: string;
}

@customElement('aila-progress')
export class ProgressIndicator extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: 'Press Start 2P', 'Pixelify Sans', 'Tajawal', system-ui, sans-serif;
    }

    .progress-container {
      background: var(--bg-secondary, #1a1a2e);
      border-radius: 12px;
      padding: 16px;
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    }

    .progress-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .progress-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary, #f8fafc);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .progress-icon {
      font-size: 16px;
    }

    .progress-count {
      font-size: 12px;
      color: var(--text-secondary, #94a3b8);
    }

    .task-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 300px;
      overflow-y: auto;
    }

    .task-item {
      background: var(--bg-tertiary, #252542);
      border-radius: 8px;
      padding: 12px;
      border: 1px solid transparent;
      transition: all 0.3s ease;
    }

    .task-item:hover {
      border-color: var(--primary-color, #6366f1);
    }

    .task-item.running {
      border-color: var(--primary-color, #6366f1);
      background: rgba(99, 102, 241, 0.1);
    }

    .task-item.completed {
      border-color: var(--success-color, #22c55e);
      background: rgba(34, 197, 94, 0.1);
    }

    .task-item.error {
      border-color: var(--error-color, #ef4444);
      background: rgba(239, 68, 68, 0.1);
    }

    .task-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .task-icon {
      font-size: 14px;
    }

    .task-title {
      flex: 1;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary, #f8fafc);
    }

    .task-status {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 10px;
      text-transform: uppercase;
    }

    .task-status.pending {
      background: var(--bg-tertiary, #252542);
      color: var(--text-secondary, #94a3b8);
    }

    .task-status.running {
      background: rgba(99, 102, 241, 0.2);
      color: var(--primary-color, #6366f1);
    }

    .task-status.completed {
      background: rgba(34, 197, 94, 0.2);
      color: var(--success-color, #22c55e);
    }

    .task-status.error {
      background: rgba(239, 68, 68, 0.2);
      color: var(--error-color, #ef4444);
    }

    .task-description {
      font-size: 12px;
      color: var(--text-secondary, #94a3b8);
      margin-bottom: 8px;
    }

    .progress-bar-container {
      height: 6px;
      background: var(--bg-primary, #0f0f1a);
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s ease;
      position: relative;
    }

    .progress-bar.running {
      background: linear-gradient(90deg, var(--primary-color, #6366f1), #8b5cf6);
    }

    .progress-bar.completed {
      background: var(--success-color, #22c55e);
    }

    .progress-bar.error {
      background: var(--error-color, #ef4444);
    }

    .progress-bar::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent
      );
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      margin-top: 6px;
      font-size: 11px;
      color: var(--text-secondary, #94a3b8);
    }

    .progress-percentage {
      font-weight: 600;
      color: var(--primary-color, #6366f1);
    }

    .empty-state {
      text-align: center;
      padding: 24px;
      color: var(--text-secondary, #94a3b8);
    }

    .empty-icon {
      font-size: 32px;
      margin-bottom: 8px;
      opacity: 0.5;
    }

    .overall-progress {
      margin-bottom: 16px;
      padding: 12px;
      background: var(--bg-tertiary, #252542);
      border-radius: 8px;
    }

    .overall-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 12px;
    }

    .overall-bar {
      height: 8px;
      background: var(--bg-primary, #0f0f1a);
      border-radius: 4px;
      overflow: hidden;
    }

    .overall-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--primary-color, #6366f1), #8b5cf6);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    /* RTL Support */
    :host([dir="rtl"]) .task-header,
    :host([dir="rtl"]) .progress-header {
      flex-direction: row-reverse;
    }

    :host([dir="rtl"]) .task-list {
      direction: rtl;
    }
  `;

  @property({ type: Array })
  tasks: ProgressTask[] = [];

  @property({ type: Boolean })
  showOverall = true;

  @property({ type: String })
  dir: 'rtl' | 'ltr' = 'rtl';

  private get overallProgress(): number {
    if (this.tasks.length === 0) return 0;
    const total = this.tasks.reduce((sum, task) => sum + task.progress, 0);
    return Math.round(total / this.tasks.length);
  }

  private get runningCount(): number {
    return this.tasks.filter(t => t.status === 'running').length;
  }

  private getStatusIcon(status: ProgressTask['status']): string {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '⚡';
      case 'completed': return '✅';
      case 'error': return '❌';
    }
  }

  private formatDuration(startTime?: number, endTime?: number): string {
    if (!startTime) return '';
    const end = endTime || Date.now();
    const duration = Math.round((end - startTime) / 1000);
    
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
  }

  render() {
    return html`
      <div class="progress-container" dir="${this.dir}">
        ${this.showOverall && this.tasks.length > 0 ? this.renderOverallProgress() : ''}
        
        <div class="progress-header">
          <div class="progress-title">
            <span class="progress-icon">📊</span>
            <span>التقدم</span>
          </div>
          <span class="progress-count">${this.tasks.length} مهمة</span>
        </div>

        <div class="task-list">
          ${this.tasks.length === 0 
            ? this.renderEmptyState()
            : this.tasks.map(task => this.renderTask(task))
          }
        </div>
      </div>
    `;
  }

  private renderOverallProgress() {
    return html`
      <div class="overall-progress">
        <div class="overall-info">
          <span>التقدم الإجمالي</span>
          <span class="progress-percentage">${this.overallProgress}%</span>
        </div>
        <div class="overall-bar">
          <div 
            class="overall-bar-fill" 
            style="width: ${this.overallProgress}%"
          ></div>
        </div>
      </div>
    `;
  }

  private renderTask(task: ProgressTask) {
    return html`
      <div class="task-item ${task.status}">
        <div class="task-header">
          <span class="task-icon">${task.icon || this.getStatusIcon(task.status)}</span>
          <span class="task-title">${task.title}</span>
          <span class="task-status ${task.status}">${this.getStatusText(task.status)}</span>
        </div>
        
        ${task.description ? html`
          <div class="task-description">${task.description}</div>
        ` : ''}

        <div class="progress-bar-container">
          <div 
            class="progress-bar ${task.status}"
            style="width: ${task.progress}%"
          ></div>
        </div>

        <div class="progress-info">
          <span>${task.progress}%</span>
          ${task.startTime ? html`
            <span>⏱️ ${this.formatDuration(task.startTime, task.endTime)}</span>
          ` : ''}
        </div>
      </div>
    `;
  }

  private renderEmptyState() {
    return html`
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <div>لا توجد مهام جارية</div>
      </div>
    `;
  }

  private getStatusText(status: ProgressTask['status']): string {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'running': return 'جاري التنفيذ';
      case 'completed': return 'مكتمل';
      case 'error': return 'خطأ';
    }
  }
}

// Activity Log Component
@customElement('aila-activity-log')
export class ActivityLog extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: 'Press Start 2P', 'Pixelify Sans', 'Tajawal', system-ui, sans-serif;
    }

    .activity-container {
      background: var(--bg-secondary, #1a1a2e);
      border-radius: 12px;
      padding: 16px;
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      max-height: 400px;
      overflow-y: auto;
    }

    .activity-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
    }

    .activity-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary, #f8fafc);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px;
      background: var(--bg-tertiary, #252542);
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .activity-item:hover {
      background: rgba(99, 102, 241, 0.1);
    }

    .activity-icon {
      font-size: 14px;
      flex-shrink: 0;
    }

    .activity-content {
      flex: 1;
      min-width: 0;
    }

    .activity-message {
      font-size: 12px;
      color: var(--text-primary, #f8fafc);
      margin-bottom: 4px;
      line-height: 1.4;
    }

    .activity-time {
      font-size: 10px;
      color: var(--text-secondary, #94a3b8);
    }

    .empty-state {
      text-align: center;
      padding: 24px;
      color: var(--text-secondary, #94a3b8);
    }

    /* RTL Support */
    :host([dir="rtl"]) .activity-header,
    :host([dir="rtl"]) .activity-item {
      flex-direction: row-reverse;
    }
  `;

  @property({ type: Array })
  activities: Array<{
    id: string;
    icon: string;
    message: string;
    timestamp: number;
    type: 'info' | 'success' | 'warning' | 'error';
  }> = [];

  @property({ type: String })
  dir: 'rtl' | 'ltr' = 'rtl';

  private formatTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'الآن';
    if (diff < 3600000) return `منذ ${Math.floor(diff / 60000)} دقيقة`;
    if (diff < 86400000) return `منذ ${Math.floor(diff / 3600000)} ساعة`;
    
    return new Date(timestamp).toLocaleDateString('ar-SA', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  render() {
    return html`
      <div class="activity-container" dir="${this.dir}">
        <div class="activity-header">
          <div class="activity-title">
            <span>📜</span>
            <span>سجل النشاطات</span>
          </div>
          <span style="font-size: 11px; color: var(--text-secondary)">
            ${this.activities.length} نشاط
          </span>
        </div>

        <div class="activity-list">
          ${this.activities.length === 0
            ? html`<div class="empty-state">لا توجد نشاطات</div>`
            : this.activities.map(activity => this.renderActivity(activity))
          }
        </div>
      </div>
    `;
  }

  private renderActivity(activity: typeof this.activities[0]) {
    const icon = this.getActivityIcon(activity.type);
    
    return html`
      <div class="activity-item">
        <span class="activity-icon">${icon}</span>
        <div class="activity-content">
          <div class="activity-message">${activity.message}</div>
          <div class="activity-time">${this.formatTime(activity.timestamp)}</div>
        </div>
      </div>
    `;
  }

  private getActivityIcon(type: string): string {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'aila-progress': ProgressIndicator;
    'aila-activity-log': ActivityLog;
  }
}
