/**
 * Production-safe logging utility
 * Handles different log levels and environment-specific behavior
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  extra?: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development' || __DEV__;

  private formatMessage(level: LogLevel, message: string, extra?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (extra) {
      return `${prefix} ${message} ${JSON.stringify(extra)}`;
    }
    return `${prefix} ${message}`;
  }

  debug(message: string, extra?: any): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, extra));
    }
  }

  info(message: string, extra?: any): void {
    if (this.isDevelopment) {
      console.info(this.formatMessage('info', message, extra));
    }
  }

  warn(message: string, extra?: any): void {
    console.warn(this.formatMessage('warn', message, extra));
  }

  error(message: string, error?: Error | any): void {
    const errorInfo = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : error;
    
    console.error(this.formatMessage('error', message, errorInfo));
  }

  // For network/API debugging
  api(method: string, url: string, status?: number, duration?: number): void {
    if (this.isDevelopment) {
      const message = `${method.toUpperCase()} ${url}`;
      const extra = status ? { status, duration: `${duration}ms` } : undefined;
      this.info(message, extra);
    }
  }
}

export const logger = new Logger();
export default logger;