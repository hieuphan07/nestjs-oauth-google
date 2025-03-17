import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../common/services/logger.service';
import { GoogleUserDto } from '../dto/google-user.dto';

/**
 * Passport strategy for Google OAuth2 authentication
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  /**
   * Validates the Google OAuth2 profile and returns user data
   * @param accessToken Google access token
   * @param refreshToken Google refresh token
   * @param profile Google profile
   * @param done Passport callback
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<void> {
    try {
      const { id, name, emails, photos } = profile;
      
      // Ensure email exists
      if (!emails || !emails.length) {
        return done(new Error('Google profile missing email'), null);
      }
      
      const userDto: GoogleUserDto = {
        googleId: id,
        email: emails[0].value,
        firstName: name?.givenName || '',
        lastName: name?.familyName || '',
        picture: photos?.length ? photos[0].value : null,
      };
      
      this.logger.log(`Google authentication successful for: ${userDto.email}`);
      
      done(null, userDto);
    } catch (error) {
      this.logger.error(`Google authentication error: ${error.message}`, error.stack);
      done(error, null);
    }
  }
}