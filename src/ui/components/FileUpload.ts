/**
 * AILA - AI Life Assistant
 * File Upload & Image Processing Components
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnail?: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress: number;
  error?: string;
}

@customElement('aila-file-upload')
export class FileUpload extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: 'Press Start 2P', 'Pixelify Sans', 'Tajawal', system-ui, sans-serif;
    }

    .upload-container {
      background: var(--bg-secondary, #1a1a2e);
      border-radius: 12px;
      padding: 16px;
      border: 2px dashed var(--border-color, rgba(255, 255, 255, 0.2));
      transition: all 0.3s ease;
    }

    .upload-container:hover,
    .upload-container.dragover {
      border-color: var(--primary-color, #6366f1);
      background: rgba(99, 102, 241, 0.05);
    }

    .upload-zone {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      cursor: pointer;
    }

    .upload-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.7;
    }

    .upload-text {
      font-size: 13px;
      color: var(--text-primary, #f8fafc);
      margin-bottom: 8px;
      text-align: center;
    }

    .upload-hint {
      font-size: 11px;
      color: var(--text-secondary, #94a3b8);
      text-align: center;
    }

    .upload-input {
      display: none;
    }

    .upload-buttons {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }

    .upload-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .upload-btn.primary {
      background: var(--primary-color, #6366f1);
      color: white;
    }

    .upload-btn.primary:hover {
      background: var(--primary-dark, #4f46e5);
    }

    .upload-btn.secondary {
      background: var(--bg-tertiary, #252542);
      color: var(--text-primary, #f8fafc);
    }

    .upload-btn.secondary:hover {
      background: var(--bg-secondary, #1a1a2e);
    }

    /* File List */
    .file-list {
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .file-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: var(--bg-tertiary, #252542);
      border-radius: 10px;
      transition: all 0.2s ease;
    }

    .file-item:hover {
      background: rgba(99, 102, 241, 0.1);
    }

    .file-thumbnail {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      object-fit: cover;
      background: var(--bg-secondary, #1a1a2e);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }

    .file-info {
      flex: 1;
      min-width: 0;
    }

    .file-name {
      font-size: 12px;
      color: var(--text-primary, #f8fafc);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 4px;
    }

    .file-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 10px;
      color: var(--text-secondary, #94a3b8);
    }

    .file-size {
      padding: 2px 6px;
      background: var(--bg-secondary, #1a1a2e);
      border-radius: 4px;
    }

    .file-progress {
      width: 100%;
      height: 4px;
      background: var(--bg-secondary, #1a1a2e);
      border-radius: 2px;
      margin-top: 8px;
      overflow: hidden;
    }

    .file-progress-bar {
      height: 100%;
      background: var(--primary-color, #6366f1);
      border-radius: 2px;
      transition: width 0.3s ease;
    }

    .file-actions {
      display: flex;
      gap: 8px;
    }

    .file-action {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: none;
      background: var(--bg-secondary, #1a1a2e);
      color: var(--text-secondary, #94a3b8);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      transition: all 0.2s ease;
    }

    .file-action:hover {
      background: var(--primary-color, #6366f1);
      color: white;
    }

    .file-action.delete:hover {
      background: var(--error-color, #ef4444);
    }

    .file-status {
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 10px;
      text-transform: uppercase;
    }

    .file-status.uploading {
      background: rgba(99, 102, 241, 0.2);
      color: var(--primary-color, #6366f1);
    }

    .file-status.processing {
      background: rgba(245, 158, 11, 0.2);
      color: var(--warning-color, #f59e0b);
    }

    .file-status.ready {
      background: rgba(34, 197, 94, 0.2);
      color: var(--success-color, #22c55e);
    }

    .file-status.error {
      background: rgba(239, 68, 68, 0.2);
      color: var(--error-color, #ef4444);
    }

    /* Image Preview Modal */
    .image-preview-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .image-preview-content {
      max-width: 90vw;
      max-height: 90vh;
      position: relative;
    }

    .image-preview {
      max-width: 100%;
      max-height: 85vh;
      border-radius: 12px;
      object-fit: contain;
    }

    .image-preview-close {
      position: absolute;
      top: -40px;
      right: 0;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .image-preview-close:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .image-preview-info {
      text-align: center;
      margin-top: 16px;
      color: white;
      font-size: 12px;
    }

    /* RTL Support */
    :host([dir="rtl"]) .upload-container {
      text-align: right;
    }

    :host([dir="rtl"]) .file-item {
      flex-direction: row-reverse;
    }
  `;

  @property({ type: Array })
  files: UploadedFile[] = [];

  @property({ type: Array })
  acceptedTypes: string[] = ['image/*', 'application/pdf', 'text/*'];

  @property({ type: Number })
  maxSize = 10 * 1024 * 1024; // 10MB

  @property({ type: Number })
  maxFiles = 10;

  @property({ type: Boolean })
  showPreview = true;

  @property({ type: Boolean })
  autoUpload = true;

  @property({ type: String })
  dir: 'rtl' | 'ltr' = 'rtl';

  @state()
  private isDragover = false;

  @state()
  private previewImage: string | null = null;

  @state()
  private isProcessing = false;

  private handleDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragover = true;
  }

  private handleDragLeave() {
    this.isDragover = false;
  }

  private handleDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragover = false;
    
    const files = Array.from(e.dataTransfer?.files || []);
    this.processFiles(files);
  }

  private handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.processFiles(files);
    input.value = '';
  }

  private async processFiles(files: File[]) {
    const validFiles = files.filter(file => {
      // Check size
      if (file.size > this.maxSize) {
        console.warn(`File ${file.name} exceeds max size`);
        return false;
      }
      return true;
    });

    for (const file of validFiles.slice(0, this.maxFiles - this.files.length)) {
      await this.addFile(file);
    }
  }

  private async addFile(file: File): Promise<void> {
    const id = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    
    const uploadedFile: UploadedFile = {
      id,
      name: file.name,
      type: file.type,
      size: file.size,
      url,
      thumbnail: file.type.startsWith('image/') ? url : undefined,
      status: 'uploading',
      progress: 0,
    };

    this.files = [...this.files, uploadedFile];
    
    if (this.autoUpload) {
      await this.uploadFile(uploadedFile);
    }
  }

  private async uploadFile(file: UploadedFile): Promise<void> {
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      this.updateFileProgress(file.id, i);
    }
    
    // Process image if needed
    if (file.type.startsWith('image/')) {
      this.updateFileStatus(file.id, 'processing');
      await this.processImage(file.id);
    }
    
    this.updateFileStatus(file.id, 'ready');
    
    this.dispatchEvent(new CustomEvent('file-uploaded', {
      detail: { file },
      bubbles: true,
      composed: true,
    }));
  }

  private async processImage(fileId: string): Promise<void> {
    const file = this.files.find(f => f.id === fileId);
    if (!file || !file.url) return;

    try {
      // Create optimized image using canvas
      const optimizedUrl = await this.optimizeImage(file.url, file.type);
      
      this.files = this.files.map(f => 
        f.id === fileId 
          ? { ...f, url: optimizedUrl }
          : f
      );
    } catch (error) {
      console.error('Image processing failed:', error);
      this.updateFileStatus(fileId, 'error', 'فشل في معالجة الصورة');
    }
  }

  private async optimizeImage(url: string, mimeType: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        
        // Calculate new dimensions (max 1920px)
        let { width, height } = img;
        const maxDim = 1920;
        
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = (height / width) * maxDim;
            width = maxDim;
          } else {
            width = (width / height) * maxDim;
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to WebP if supported, otherwise use original format
        const outputType = this.supportsWebP() ? 'image/webp' : mimeType;
        const quality = 0.85;
        
        resolve(canvas.toDataURL(outputType, quality));
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
    });
  }

  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').startsWith('data:image/webp');
  }

  private updateFileProgress(fileId: string, progress: number) {
    this.files = this.files.map(f => 
      f.id === fileId ? { ...f, progress } : f
    );
  }

  private updateFileStatus(fileId: string, status: UploadedFile['status'], error?: string) {
    this.files = this.files.map(f => 
      f.id === fileId ? { ...f, status, error } : f
    );
  }

  private removeFile(fileId: string) {
    const file = this.files.find(f => f.id === fileId);
    if (file?.url) {
      URL.revokeObjectURL(file.url);
    }
    this.files = this.files.filter(f => f.id !== fileId);
    
    this.dispatchEvent(new CustomEvent('file-removed', {
      detail: { fileId },
      bubbles: true,
      composed: true,
    }));
  }

  private openPreview(url: string) {
    this.previewImage = url;
  }

  private closePreview() {
    this.previewImage = null;
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private getFileIcon(type: string): string {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎬';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('sheet') || type.includes('excel')) return '📊';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    return '📁';
  }

  render() {
    return html`
      <div 
        class="upload-container ${this.isDragover ? 'dragover' : ''}"
        dir="${this.dir}"
        @dragover=${this.handleDragOver}
        @dragleave=${this.handleDragLeave}
        @drop=${this.handleDrop}
      >
        <div class="upload-zone" @click=${() => this.shadowRoot?.querySelector<HTMLInputElement>('.upload-input')?.click()}>
          <div class="upload-icon">📤</div>
          <div class="upload-text">اسحب الملفات هنا أو انقر للاختيار</div>
          <div class="upload-hint">
            ${this.acceptedTypes.join(' • ')} • الحد الأقصى ${this.formatFileSize(this.maxSize)}
          </div>
          
          <input 
            type="file" 
            class="upload-input" 
            .accept=${this.acceptedTypes.join(',')}
            multiple
            @change=${this.handleFileSelect}
          />
        </div>

        ${this.files.length > 0 ? html`
          <div class="file-list">
            ${this.files.map(file => this.renderFile(file))}
          </div>
        ` : ''}
      </div>

      ${this.previewImage ? html`
        <div class="image-preview-modal" @click=${this.closePreview}>
          <div class="image-preview-content" @click=${(e: Event) => e.stopPropagation()}>
            <button class="image-preview-close" @click=${this.closePreview}>✕</button>
            <img class="image-preview" src="${this.previewImage}" alt="Preview" />
            <div class="image-preview-info">${this.formatFileSize(this.files.find(f => f.url === this.previewImage)?.size || 0)}</div>
          </div>
        </div>
      ` : ''}
    `;
  }

  private renderFile(file: UploadedFile) {
    return html`
      <div class="file-item">
        <div class="file-thumbnail">
          ${file.thumbnail 
            ? html`<img src="${file.thumbnail}" alt="${file.name}" />`
            : this.getFileIcon(file.type)
          }
        </div>
        
        <div class="file-info">
          <div class="file-name">${file.name}</div>
          <div class="file-meta">
            <span class="file-status ${file.status}">
              ${file.status === 'uploading' ? 'رفع...' : 
                file.status === 'processing' ? 'معالجة...' :
                file.status === 'ready' ? 'جاهز' : 'خطأ'}
            </span>
            <span class="file-size">${this.formatFileSize(file.size)}</span>
          </div>
          
          ${file.status === 'uploading' || file.status === 'processing' ? html`
            <div class="file-progress">
              <div class="file-progress-bar" style="width: ${file.progress}%"></div>
            </div>
          ` : ''}
        </div>

        <div class="file-actions">
          ${file.status === 'ready' && file.type.startsWith('image/') ? html`
            <button class="file-action" @click=${() => this.openPreview(file.url)} title="معاينة">
              👁️
            </button>
          ` : ''}
          <button class="file-action delete" @click=${() => this.removeFile(file.id)} title="حذف">
            🗑️
          </button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'aila-file-upload': FileUpload;
  }
}
