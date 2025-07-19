/**
 * LoggingService - A singleton service for managing application logs
 * Provides color-coded logging with debug, info, error, and default levels
 */

export type LogType = 'debug' | 'info' | 'error' | 'default';

export interface LogEntry {
  id: number;
  timestamp: string;
  type: LogType;
  message: string;
  data?: any;
}

type LogSubscriber = (logs: LogEntry[]) => void;

class LoggingService {
  private logs: LogEntry[] = [];
  private subscribers: LogSubscriber[] = [];
  private maxLogs = 1000; // Prevent memory issues

  /**
   * Subscribe to log updates
   * @param callback - Function to call when logs update
   * @returns Unsubscribe function
   */
  subscribe(callback: LogSubscriber): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Notify all subscribers of log updates
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.logs));
  }

  /**
   * Add a log entry
   * @param type - Log type: 'debug', 'info', 'error', 'default'
   * @param message - Log message
   * @param data - Optional data to include
   */
  addLog(type: LogType, message: string, data?: any): void {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry: LogEntry = {
      id: Date.now() + Math.random(),
      timestamp,
      type,
      message,
      data
    };

    this.logs.push(logEntry);

    // Keep only the latest logs to prevent memory issues
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    this.notifySubscribers();
  }

  /**
   * Log a debug message (blue)
   * @param message - Debug message
   * @param data - Optional data
   */
  debug(message: string, data?: any): void {
    this.addLog('debug', message, data);
  }

  /**
   * Log an info message (green)
   * @param message - Info message
   * @param data - Optional data
   */
  info(message: string, data?: any): void {
    this.addLog('info', message, data);
  }

  /**
   * Log an error message (red)
   * @param message - Error message
   * @param data - Optional data
   */
  error(message: string, data?: any): void {
    this.addLog('error', message, data);
  }

  /**
   * Log a default message (white)
   * @param message - Default message
   * @param data - Optional data
   */
  log(message: string, data?: any): void {
    this.addLog('default', message, data);
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = [];
    this.notifySubscribers();
  }

  /**
   * Get all logs
   * @returns Array of log entries
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs as formatted text for copying
   * @returns Formatted log text
   */
  getLogsAsText(): string {
    return this.logs
      .map(log => `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}`)
      .join('\n');
  }
}

// Create a singleton instance
const loggingService = new LoggingService();

export default loggingService;
