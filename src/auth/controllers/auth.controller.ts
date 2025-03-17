import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Get, 
  Req, 
  Res, 
  HttpStatus,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { LoggerService } from '../../common/services/logger.service';
import { User } from '../../users/entities/user.entity';

/**
 * Controller handling all authentication routes
 * Supports both local and OAuth authentication flows
 */
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Registers a new user with email and password
   * @param registerDto User registration data
   * @returns JWT token and user data
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log(`Registration attempt for email: ${registerDto.email}`);
    return this.authService.register(registerDto);
  }

  /**
   * Authenticates user with email and password
   * @param req Request with user attached by guard
   * @returns JWT token and user data
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request, @Body() loginDto: LoginDto) {
    this.logger.log(`Login attempt for email: ${loginDto.email}`);
    return this.authService.login(loginDto);
  }

  /**
   * Initiates Google OAuth authentication flow
   */
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Google authentication flow is handled by guard
    // This route just initiates the process
  }

  /**
   * Handles Google OAuth callback
   * @param req Request with Google profile data
   * @param res Response for redirect
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this.authService.googleLogin(req.user);
      
      // Redirect to frontend with token
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const redirectUrl = new URL('/auth/callback', frontendUrl);
      redirectUrl.searchParams.append('token', result.accessToken);
      
      return res.redirect(redirectUrl.toString());
    } catch (error) {
      this.logger.error(`Google callback error: ${error.message}`, error.stack);
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      return res.redirect(`${frontendUrl}/auth/error`);
    }
  }

  /**
   * Gets current authenticated user profile
   * @param user Current user from JWT token
   * @returns User profile
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: Omit<User, 'password'>) {
    return user;
  }
}