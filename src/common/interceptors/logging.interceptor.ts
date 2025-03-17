import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../services/logger.service';

/**
 * Global interceptor for logging request/response details
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  /**
   * Intercepts HTTP requests and logs timing information
   * @param context Execution context
   * @param next Call handler
   * @returns Observable of the response
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const method = request.method;
    const url = request.url;
    const startTime = Date.now();
    const userId = request.user?.id || 'anonymous';
    
    this.logger.log(
      `Request: ${method} ${url} - User: ${userId}`,
      'HttpRequest'
    );
    
    return next.handle().pipe(
      tap({
        next: () => {
          const endTime = Date.now();
          this.logger.log(
            `Response: ${method} ${url} - ${endTime - startTime}ms - User: ${userId}`,
            'HttpResponse'
          );
        },
        error: (error) => {
          const endTime = Date.now();
          this.logger.error(
            `Response Error: ${method} ${url} - ${endTime - startTime}ms - User: ${userId}`,
            error.stack,
            'HttpResponse'
          );
        },
      }),
    );
  }
}