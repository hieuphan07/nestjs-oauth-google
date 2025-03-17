import { 
  ExceptionFilter, 
  Catch, 
  ArgumentsHost, 
  HttpException, 
  HttpStatus 
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../services/logger.service';

/**
 * Interface for standardized error response
 */
interface HttpExceptionResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

/**
 * Global HTTP exception filter
 * Provides consistent error response format across the application
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  /**
   * Catches and formats HTTP exceptions
   * @param exception The caught exception
   * @param host Arguments host
   */
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // Get exception details
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    
    // Determine message format
    let message: string | string[];
    if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
      message = exceptionResponse['message'];
    } else {
      message = exception.message;
    }
    
    // Create standardized error response
    const errorResponse: HttpExceptionResponse = {
      statusCode: status,
      message,
      error: HttpStatus[status] || 'Error',
      timestamp: new Date().toISOString(),
      path: request.url,
    };
    
    // Log the error
    this.logger.error(
      `[${request.method}] ${request.url} - ${status}: ${
        Array.isArray(message) ? message.join(', ') : message
      }`,
      exception.stack,
      'HttpException'
    );
    
    // Send standardized response
    response.status(status).json(errorResponse);
  }
}