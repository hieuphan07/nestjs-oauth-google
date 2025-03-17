import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { LoggerService } from '../../common/services/logger.service';

/**
 * Passport strategy for JWT token validation
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logger: LoggerService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * Validates JWT payload and returns user
   * @param payload JWT payload containing user ID and email
   * @returns User without password if valid, throws exception otherwise
   */
  async validate(payload: JwtPayload): Promise<Omit<User, 'password'>> {
    try {
      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      
      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      this.logger.error(`JWT validation failed: ${error.message}`, error.stack);
      throw new UnauthorizedException('Invalid token');
    }
  }
}