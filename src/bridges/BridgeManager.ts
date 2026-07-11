/**
 * AILA - AI Life Assistant
 * Bridge System - External Integrations
 */

/**
 * Bridge Types
 */
export type BridgeType =
  | 'browser'
  | 'desktop'
  | 'mobile'
  | 'iot'
  | 'communication'
  | 'cloud'
  | 'database'
  | 'api'
  | 'hardware';

/**
 * Bridge Status
 */
export type BridgeStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'disabled';

/**
 * Bridge Configuration
 */
export interface BridgeConfig {
  id: string;
  name: string;
  type: BridgeType;
  enabled: boolean;
  settings?: Record<string, unknown>;
  autoReconnect?: boolean;
  timeout?: number;
}

/**
 * Bridge Connection State
 */
export interface BridgeState {
  status: BridgeStatus;
  connectedAt?: number;
  lastError?: string;
  reconnectAttempts: number;
}

/**
 * Bridge Message
 */
export interface BridgeMessage {
  id: string;
  bridgeId: string;
  type: 'request' | 'response' | 'event' | 'error';
  action: string;
  payload?: unknown;
  timestamp: number;
}

/**
 * Bridge Interface
 */
export interface IBridge {
  readonly config: BridgeConfig;
  readonly status: BridgeStatus;
  
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(message: BridgeMessage): Promise<unknown>;
  onMessage(handler: (message: BridgeMessage) => void): void;
  onStatusChange(handler: (status: BridgeStatus) => void): void;
}

/**
 * Base Bridge Class
 */
export abstract class BaseBridge implements IBridge {
  abstract readonly config: BridgeConfig;
  abstract status: BridgeStatus;
  
  private messageHandlers: Set<(message: BridgeMessage) => void> = new Set();
  private statusHandlers: Set<(status: BridgeStatus) => void> = new Set();
  protected state: BridgeState = {
    status: 'disconnected',
    reconnectAttempts: 0,
  };
  
  async connect(): Promise<void> {
    this.updateStatus('connecting');
    try {
      await this.doConnect();
      this.updateStatus('connected');
      this.state.connectedAt = Date.now();
      this.state.reconnectAttempts = 0;
    } catch (error) {
      this.updateStatus('error');
      this.state.lastError = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }
  
  async disconnect(): Promise<void> {
    await this.doDisconnect();
    this.updateStatus('disconnected');
    this.state.connectedAt = undefined;
  }
  
  async send(message: BridgeMessage): Promise<unknown> {
    if (this.status !== 'connected') {
      throw new Error(`Bridge ${this.config.id} is not connected`);
    }
    return this.doSend(message);
  }
  
  onMessage(handler: (message: BridgeMessage) => void): void {
    this.messageHandlers.add(handler);
  }
  
  offMessage(handler: (message: BridgeMessage) => void): void {
    this.messageHandlers.delete(handler);
  }
  
  onStatusChange(handler: (status: BridgeStatus) => void): void {
    this.statusHandlers.add(handler);
  }
  
  offStatusChange(handler: (status: BridgeStatus) => void): void {
    this.statusHandlers.delete(handler);
  }
  
  protected emitMessage(message: BridgeMessage): void {
    for (const handler of this.messageHandlers) {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in bridge message handler:', error);
      }
    }
  }
  
  protected updateStatus(status: BridgeStatus): void {
    this.state.status = status;
    this.status = status;
    for (const handler of this.statusHandlers) {
      try {
        handler(status);
      } catch (error) {
        console.error('Error in bridge status handler:', error);
      }
    }
  }
  
  protected abstract doConnect(): Promise<void>;
  protected abstract doDisconnect(): Promise<void>;
  protected abstract doSend(message: BridgeMessage): Promise<unknown>;
}

/**
 * Browser Bridge - Web Extension Communication
 */
export class BrowserBridge extends BaseBridge {
  readonly config: BridgeConfig;
  status: BridgeStatus = 'disconnected';
  
  constructor(config: BridgeConfig) {
    super();
    this.config = config;
  }
  
  protected async doConnect(): Promise<void> {
    // Connect to browser extension
    console.log(`Connecting to browser bridge: ${this.config.name}`);
  }
  
  protected async doDisconnect(): Promise<void> {
    console.log(`Disconnecting browser bridge: ${this.config.name}`);
  }
  
  protected async doSend(message: BridgeMessage): Promise<unknown> {
    // Send message to browser extension
    return { success: true, message: 'Sent via browser bridge' };
  }
}

/**
 * GitHub Bridge
 */
export class GitHubBridge extends BaseBridge {
  readonly config: BridgeConfig;
  status: BridgeStatus = 'disconnected';
  private token?: string;
  
  constructor(config: BridgeConfig) {
    super();
    this.config = config;
    this.token = config.settings?.token as string;
  }
  
  protected async doConnect(): Promise<void> {
    if (!this.token) {
      throw new Error('GitHub token is required');
    }
    // Test connection
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to connect to GitHub');
    }
  }
  
  protected async doDisconnect(): Promise<void> {
    this.token = undefined;
  }
  
  protected async doSend(message: BridgeMessage): Promise<unknown> {
    const { action, payload } = message;
    
    switch (action) {
      case 'createIssue':
        return this.createIssue(payload as { owner: string; repo: string; title: string; body?: string });
      case 'createPR':
        return this.createPullRequest(payload as { owner: string; repo: string; title: string; body?: string; head: string; base: string });
      case 'search':
        return this.searchRepositories(payload as { query: string });
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
  
  private async createIssue(data: { owner: string; repo: string; title: string; body?: string }): Promise<unknown> {
    const response = await fetch(`https://api.github.com/repos/${data.owner}/${data.repo}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: data.title, body: data.body }),
    });
    return response.json();
  }
  
  private async createPullRequest(data: { owner: string; repo: string; title: string; body?: string; head: string; base: string }): Promise<unknown> {
    const response = await fetch(`https://api.github.com/repos/${data.owner}/${data.repo}/pulls`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: data.title,
        body: data.body,
        head: data.head,
        base: data.base,
      }),
    });
    return response.json();
  }
  
  private async searchRepositories(data: { query: string }): Promise<unknown> {
    const response = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(data.query)}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      }
    );
    return response.json();
  }
}

/**
 * Discord Bridge
 */
export class DiscordBridge extends BaseBridge {
  readonly config: BridgeConfig;
  status: BridgeStatus = 'disconnected';
  private webhookUrl?: string;
  private botToken?: string;
  
  constructor(config: BridgeConfig) {
    super();
    this.config = config;
    this.webhookUrl = config.settings?.webhookUrl as string;
    this.botToken = config.settings?.botToken as string;
  }
  
  protected async doConnect(): Promise<void> {
    if (!this.webhookUrl && !this.botToken) {
      throw new Error('Discord webhook URL or bot token is required');
    }
  }
  
  protected async doDisconnect(): Promise<void> {
    this.webhookUrl = undefined;
    this.botToken = undefined;
  }
  
  protected async doSend(message: BridgeMessage): Promise<unknown> {
    const { action, payload } = message;
    
    if (action === 'sendMessage' && this.webhookUrl) {
      return this.sendWebhook(payload as { content: string; embeds?: unknown[] });
    }
    
    throw new Error(`Unknown action: ${action}`);
  }
  
  private async sendWebhook(data: { content: string; embeds?: unknown[] }): Promise<unknown> {
    const response = await fetch(this.webhookUrl!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: data.content,
        embeds: data.embeds,
      }),
    });
    return { success: response.ok };
  }
}

/**
 * MQTT Bridge - IoT Communication
 */
export class MQTTBridge extends BaseBridge {
  readonly config: BridgeConfig;
  status: BridgeStatus = 'disconnected';
  private brokerUrl?: string;
  private clientId?: string;
  private subscriptions: Map<string, Set<(message: unknown) => void>> = new Map();
  
  constructor(config: BridgeConfig) {
    super();
    this.config = config;
    this.brokerUrl = config.settings?.brokerUrl as string;
    this.clientId = config.settings?.clientId as string || `aila-${Date.now()}`;
  }
  
  protected async doConnect(): Promise<void> {
    if (!this.brokerUrl) {
      throw new Error('MQTT broker URL is required');
    }
    // In production, use mqtt.js library
    console.log(`Connecting to MQTT broker: ${this.brokerUrl}`);
  }
  
  protected async doDisconnect(): Promise<void> {
    this.subscriptions.clear();
  }
  
  protected async doSend(message: BridgeMessage): Promise<unknown> {
    const { action, payload } = message;
    
    switch (action) {
      case 'publish':
        return this.publish(payload as { topic: string; message: unknown; qos?: number });
      case 'subscribe':
        return this.subscribe(payload as { topic: string });
      case 'unsubscribe':
        return this.unsubscribe(payload as { topic: string });
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
  
  private async publish(data: { topic: string; message: unknown; qos?: number }): Promise<unknown> {
    console.log(`Publishing to ${data.topic}:`, data.message);
    return { success: true, topic: data.topic };
  }
  
  private async subscribe(data: { topic: string }): Promise<unknown> {
    if (!this.subscriptions.has(data.topic)) {
      this.subscriptions.set(data.topic, new Set());
    }
    return { success: true, topic: data.topic };
  }
  
  private async unsubscribe(data: { topic: string }): Promise<unknown> {
    this.subscriptions.delete(data.topic);
    return { success: true, topic: data.topic };
  }
  
  onMessage(handler: (message: BridgeMessage) => void): void {
    super.onMessage(handler);
  }
}

/**
 * Bluetooth Bridge
 */
export class BluetoothBridge extends BaseBridge {
  readonly config: BridgeConfig;
  status: BridgeStatus = 'disconnected';
  private device?: BluetoothDevice;
  
  constructor(config: BridgeConfig) {
    super();
    this.config = config;
  }
  
  protected async doConnect(): Promise<void> {
    if (!('bluetooth' in navigator)) {
      throw new Error('Web Bluetooth is not supported');
    }
    
    try {
      this.device = await navigator.bluetooth.requestDevice({
        filters: this.config.settings?.filters as BluetoothRequestDeviceFilter[],
        optionalServices: this.config.settings?.services as string[],
      });
      
      if (this.device.gatt) {
        await this.device.gatt.connect();
      }
    } catch (error) {
      throw new Error(`Failed to connect to Bluetooth device: ${error}`);
    }
  }
  
  protected async doDisconnect(): Promise<void> {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.device = undefined;
  }
  
  protected async doSend(message: BridgeMessage): Promise<unknown> {
    // Implement Bluetooth communication
    return { success: true };
  }
}

/**
 * Bridge Manager - Central bridge management
 */
export class BridgeManager {
  private bridges: Map<string, IBridge> = new Map();
  
  /**
   * Register a bridge
   */
  register(bridge: IBridge): void {
    if (this.bridges.has(bridge.config.id)) {
      throw new Error(`Bridge ${bridge.config.id} is already registered`);
    }
    this.bridges.set(bridge.config.id, bridge);
  }
  
  /**
   * Unregister a bridge
   */
  async unregister(bridgeId: string): Promise<void> {
    const bridge = this.bridges.get(bridgeId);
    if (bridge) {
      await bridge.disconnect();
      this.bridges.delete(bridgeId);
    }
  }
  
  /**
   * Get a bridge
   */
  get(bridgeId: string): IBridge | undefined {
    return this.bridges.get(bridgeId);
  }
  
  /**
   * Get all bridges
   */
  getAll(): IBridge[] {
    return Array.from(this.bridges.values());
  }
  
  /**
   * Get bridges by type
   */
  getByType(type: BridgeType): IBridge[] {
    return this.getAll().filter((bridge) => bridge.config.type === type);
  }
  
  /**
   * Connect all bridges
   */
  async connectAll(): Promise<void> {
    const promises = this.getAll()
      .filter((bridge) => bridge.config.enabled)
      .map((bridge) => bridge.connect().catch((error) => {
        console.error(`Failed to connect bridge ${bridge.config.id}:`, error);
      }));
    
    await Promise.allSettled(promises);
  }
  
  /**
   * Disconnect all bridges
   */
  async disconnectAll(): Promise<void> {
    const promises = this.getAll().map((bridge) => bridge.disconnect());
    await Promise.allSettled(promises);
  }
  
  /**
   * Send message via a specific bridge
   */
  async send(bridgeId: string, message: BridgeMessage): Promise<unknown> {
    const bridge = this.bridges.get(bridgeId);
    if (!bridge) {
      throw new Error(`Bridge ${bridgeId} not found`);
    }
    return bridge.send(message);
  }
  
  /**
   * Create a bridge from config
   */
  createBridge(config: BridgeConfig): IBridge {
    switch (config.type) {
      case 'browser':
        return new BrowserBridge(config);
      case 'cloud':
        if (config.settings?.service === 'github') {
          return new GitHubBridge(config);
        }
        throw new Error(`Unknown cloud service: ${config.settings?.service}`);
      case 'communication':
        if (config.settings?.platform === 'discord') {
          return new DiscordBridge(config);
        }
        throw new Error(`Unknown communication platform: ${config.settings?.platform}`);
      case 'iot':
        if (config.settings?.protocol === 'mqtt') {
          return new MQTTBridge(config);
        }
        if (config.settings?.protocol === 'bluetooth') {
          return new BluetoothBridge(config);
        }
        throw new Error(`Unknown IoT protocol: ${config.settings?.protocol}`);
      default:
        throw new Error(`Unknown bridge type: ${config.type}`);
    }
  }
}

// Singleton
let globalBridgeManager: BridgeManager | null = null;

export function getBridgeManager(): BridgeManager {
  if (!globalBridgeManager) {
    globalBridgeManager = new BridgeManager();
  }
  return globalBridgeManager;
}

export function createBridgeManager(): BridgeManager {
  return new BridgeManager();
}

export * from './BridgeManager.js';
