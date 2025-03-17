import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoggerService } from '../../common/services/logger.service';

/**
 * Guard for JWT authentication
 * Protects routes that require authentication
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly logger: LoggerService) {
    super();
  }

  /**
   * Custom handling for JWT authentication
   * @param context Execution context
   * @returns Promise resolving to boolean indicating auth success
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // Standard JWT authentication check
      return (await super.canActivate(context)) as boolean;
    } catch (error) {
      this.logger.warn(`JWT authentication failed: ${error.message}`);
      return false;
    }
  }
}