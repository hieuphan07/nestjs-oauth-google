import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Custom logger service implementing NestJS LoggerService interface
 * Provides structured logging with context and level information
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly isProduction: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isProduction = configService.get<string>('NODE_ENV') === 'production';
  }

  /**
   * Logs informational message
   * @param message Log message
   * @param context Optional logging context
   */
  log(message: string, context?: string): void {
    this.writeLog('INFO', message, undefined, context);
  }

  /**
   * Logs error message with optional stack trace
   * @param message Error message
   * @param trace Optional error stack trace
   * @param context Optional logging context
   */
  error(message: string, trace?: string, context?: string): void {
    this.writeLog('ERROR', message, trace, context);
  }

  /**
   * Logs warning message
   * @param message Warning message
   * @param context Optional logging context
   */
  warn(message: string, context?: string): void {
    this.writeLog('WARN', message, undefined, context);
  }

  /**
   * Logs debug message (only in non-production)
   * @param message Debug message
   * @param context Optional logging context
   */
  debug(message: string, context?: string): void {
    if (this.isProduction) {
      return;
    }
    this.writeLog('DEBUG', message, undefined, context);
  }

  /**
   * Logs verbose message (only in non-production)
   * @param message Verbose message
   * @param context Optional logging context
   */
  verbose(message: string, context?: string): void {
    if (this.isProduction) {
      return;
    }
    this.writeLog('VERBOSE', message, undefined, context);
  }

  /**
   * Formats and writes log to console
   * In production, structured JSON logs would be preferred
   * @param level Log level
   * @param message Log message
   * @param trace Optional stack trace
   * @param context Optional context
   */
  private writeLog(level: string, message: string, trace?: string, context?: string): void {
    const timestamp = new Date().toISOString();
    const contextString = context ? `[${context}]` : '';
    
    if (this.isProduction) {
      // JSON structured logging for production
      const logObject = {
        timestamp,
        level,
        message,
        context: context || undefined,
        trace: trace || undefined,
      };
      console.log(JSON.stringify(logObject));
    } else {
      // Human-readable format for development
      console.log(`${timestamp} [${level}] ${contextString} ${message}`);
      if (trace) {
        console.log(trace);
      }
    }
  }
}