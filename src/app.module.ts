import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { User } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LoggerService } from './common/services/logger.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ThrottlerGuard } from '@nestjs/throttler';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

/**
 * Root application module
 * Configures global services, database, and imports feature modules
 */
@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    
    // Database configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_DATABASE', 'auth_app'),
        entities: [User],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    
    // Rate limiting protection
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get<number>('THROTTLE_TTL', 60),
        limit: configService.get<number>('THROTTLE_LIMIT', 10),
      }),
    }),
    
    // Feature modules
    AuthModule,
    UsersModule,
  ],
  providers: [
    LoggerService,
    // Global HTTP exception filter
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // Global rate limiting
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global logging interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}