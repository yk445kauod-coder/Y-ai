/**
 * AILA - AI Life Assistant
 * Logger Implementation
 */

import { LogLevel, type LogEntry, type LogTransport } from '../../types/index.js';

const LEVEL_NAMES: Record<LogLevel, string> = {
  [LogLevel.TRACE]: 'TRACE',
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.FATAL]: 'FATAL',
};

const DEFAULT_CONTEXT = 'AILA';

/**
 * Console transport - writes logs to console
 */
export class ConsoleTransport implements LogTransport {
  readonly name = 'console';
  private useColors: boolean;
  
  constructor(useColors = true) {
    this.useColors = useColors && typeof window === 'undefined';
  }
  
  write(entry: LogEntry): void {
    const { timestamp, level, levelName, message, context, data, stack } = entry;
    
    const time = timestamp.toISOString();
    const prefix = context ? `[${context}]` : '';
    
    const args: unknown[] = [`${time} ${levelName}${prefix} ${message}`];
    
    if (data !== undefined) {
      args.push(data);
    }
    
    if (stack) {
      args.push(stack);
    }
    
    switch (level) {
      case LogLevel.TRACE:
      case LogLevel.DEBUG:
        console.debug(...args);
        break;
      case LogLevel.INFO:
        console.info(...args);
        break;
      case LogLevel.WARN:
        console.warn(...args);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(...args);
        break;
    }
  }
}

/**
 * Remote transport - sends logs to remote server
 */
export class RemoteTransport implements LogTransport {
  readonly name = 'remote';
  private url: string;
  private batchSize: number;
  private batch: LogEntry[] = [];
  private flushInterval: number;
  private intervalId?: ReturnType<typeof setInterval>;
  
  constructor(url: string, batchSize = 100, flushInterval = 5000) {
    this.url = url;
    this.batchSize = batchSize;
    this.flushInterval = flushInterval;
  }
  
  start(): void {
    if (!this.intervalId) {
      this.intervalId = setInterval(() => this.flush(), this.flushInterval);
    }
  }
  
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.flush();
  }
  
  write(entry: LogEntry): void {
    this.batch.push(entry);
    
    if (this.batch.length >= this.batchSize) {
      this.flush();
    }
  }
  
  async flush(): Promise<void> {
    if (this.batch.length === 0) return;
    
    const entries = this.batch.splice(0, this.batch.length);
    
    try {
      await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: entries }),
      });
    } catch (error) {
      console.error('Failed to send logs to remote:', error);
      // Put entries back in batch for retry
      this.batch.unshift(...entries);
    }
  }
}

/**
 * Logger - Main logging class
 */
export class Logger {
  private minLevel: LogLevel;
  private context: string;
  private transports: LogTransport[];
  
  constructor(context = DEFAULT_CONTEXT, minLevel = LogLevel.INFO) {
    this.context = context;
    this.minLevel = minLevel;
    this.transports = [new ConsoleTransport()];
  }
  
  /**
   * Set log level
   */
  setLevel(level: LogLevel | 'trace' | 'debug' | 'info' | 'warn' | 'error'): void {
    if (typeof level === 'string') {
      const key = level.toUpperCase() as keyof typeof LEVEL_NAMES;
      this.minLevel = LogLevel[key] ?? LogLevel.INFO;
    } else {
      this.minLevel = level;
    }
  }
  
  /**
   * Add a transport
   */
  addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }
  
  /**
   * Remove a transport
   */
  removeTransport(transport: LogTransport): void {
    const index = this.transports.indexOf(transport);
    if (index !== -1) {
      this.transports.splice(index, 1);
    }
  }
  
  /**
   * Create a child logger with a different context
   */
  child(context: string): Logger {
    const childLogger = new Logger(`${this.context}:${context}`, this.minLevel);
    for (const transport of this.transports) {
      childLogger.addTransport(transport);
    }
    return childLogger;
  }
  
  /**
   * Log trace level
   */
  trace(message: string, data?: unknown): void {
    this.log(LogLevel.TRACE, message, data);
  }
  
  /**
   * Log debug level
   */
  debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data);
  }
  
  /**
   * Log info level
   */
  info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data);
  }
  
  /**
   * Log warn level
   */
  warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data);
  }
  
  /**
   * Log error level
   */
  error(message: string, error?: Error | unknown): void {
    const data = error instanceof Error
      ? { message: error.message, name: error.name, stack: error.stack }
      : error;
    this.log(LogLevel.ERROR, message, data);
  }
  
  /**
   * Log fatal level
   */
  fatal(message: string, error?: Error | unknown): void {
    const data = error instanceof Error
      ? { message: error.message, name: error.name, stack: error.stack }
      : error;
    this.log(LogLevel.FATAL, message, data);
  }
  
  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, data?: unknown): void {
    if (level < this.minLevel) {
      return;
    }
    
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      levelName: LEVEL_NAMES[level],
      message,
      context: this.context,
      data,
    };
    
    if (data instanceof Error) {
      entry.stack = data.stack;
    }
    
    for (const transport of this.transports) {
      try {
        transport.write(entry);
      } catch (error) {
        console.error(`Error in log transport ${transport.name}:`, error);
      }
    }
  }
}

// Singleton logger instance
let globalLogger: Logger | null = null;

export function getLogger(context?: string): Logger {
  if (!globalLogger) {
    globalLogger = new Logger(context);
  } else if (context) {
    return globalLogger.child(context);
  }
  return globalLogger;
}

export function setLogger(logger: Logger): void {
  globalLogger = logger;
}

export function createLogger(context?: string, minLevel?: LogLevel): Logger {
  return new Logger(context, minLevel);
}

// Export log level utilities
export { LogLevel, LEVEL_NAMES };
