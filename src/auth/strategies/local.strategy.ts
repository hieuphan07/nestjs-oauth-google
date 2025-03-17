import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '../../common/services/logger.service';

/**
 * Passport strategy for username/password authentication
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {
    super({ 
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  /**
   * Validates user credentials
   * @param email User email
   * @param password User password
   * @returns User if valid, throws exception otherwise
   */
  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    
    if (!user) {
      this.logger.warn(`Failed login attempt for email: ${email}`);
      throw new UnauthorizedException('Invalid email or password');
    }
    
    return user;
  }
}