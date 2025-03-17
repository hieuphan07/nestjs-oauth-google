import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { GoogleUserDto } from '../dto/google-user.dto';
import { LoggerService } from '../../common/services/logger.service';
import * as bcrypt from 'bcrypt';

/**
 * Service handling all authentication operations
 * Supports both local authentication and OAuth
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Validates user credentials for local strategy
   * @param email User email
   * @param password Plain text password
   * @returns User without password if valid, null otherwise
   */
  async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      
      if (!user || !user.password) {
        return null;
      }
      
      const isPasswordValid = await this.comparePasswords(password, user.password);
      
      if (!isPasswordValid) {
        return null;
      }
      
      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      this.logger.error(`User validation failed: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Registers a new user with email/password
   * @param registerDto User registration data
   * @returns Access token and user without password
   */
  async register(registerDto: RegisterDto): Promise<{ accessToken: string; user: Omit<User, 'password'> }> {
    const { email, password, firstName, lastName } = registerDto;
    
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }
    
    // Hash password
    const hashedPassword = await this.hashPassword(password);
    
    // Create new user
    const user = this.userRepository.create({
      email,
      firstName,
      lastName,
      password: hashedPassword,
    });
    
    try {
      await this.userRepository.save(user);
      this.logger.log(`User registered successfully: ${email}`);
      
      const { password: _, ...result } = user;
      return {
        accessToken: this.generateToken(user),
        user: result,
      };
    } catch (error) {
      this.logger.error(`User registration failed: ${error.message}`, error.stack);
      throw new BadRequestException('Registration failed');
    }
  }

  /**
   * Authenticates user with email/password
   * @param loginDto User login credentials
   * @returns Access token and user without password
   */
  async login(loginDto: LoginDto): Promise<{ accessToken: string; user: Omit<User, 'password'> }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    this.logger.log(`User logged in successfully: ${loginDto.email}`);
    
    return {
      accessToken: this.generateToken(user as User),
      user,
    };
  }

  /**
   * Processes Google OAuth authentication
   * @param googleUserDto Google user profile data
   * @returns Access token and user without password
   */
  async googleLogin(googleUserDto: GoogleUserDto): Promise<{ accessToken: string; user: Omit<User, 'password'> }> {
    const { email, firstName, lastName, googleId } = googleUserDto;
    
    try {
      // Check if user exists
      let user = await this.userRepository.findOne({ where: { email } });
      
      if (user) {
        // Update Google ID if not set
        if (!user.googleId) {
          user.googleId = googleId;
          user.isEmailVerified = true;
          await this.userRepository.save(user);
        }
      } else {
        // Create new user from Google profile
        user = this.userRepository.create({
          email,
          firstName,
          lastName,
          googleId,
          isEmailVerified: true,
        });
        await this.userRepository.save(user);
      }
      
      this.logger.log(`User authenticated via Google: ${email}`);
      
      const { password: _, ...result } = user;
      return {
        accessToken: this.generateToken(user),
        user: result,
      };
    } catch (error) {
      this.logger.error(`Google authentication failed: ${error.message}`, error.stack);
      throw new BadRequestException('Google authentication failed');
    }
  }

  /**
   * Generates JWT token for authenticated user
   * @param user User entity
   * @returns Signed JWT token
   */
  private generateToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };
    
    return this.jwtService.sign(payload);
  }

  /**
   * Hashes a plain text password
   * @param password Plain text password
   * @returns Hashed password
   */
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compares plain text password with hashed password
   * @param plainPassword Plain text password
   * @param hashedPassword Hashed password
   * @returns True if passwords match
   */
  private async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}