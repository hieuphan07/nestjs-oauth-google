import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as helmet from 'helmet';
import * as compression from 'compression';
import { LoggerService } from './common/services/logger.service';

/**
 * Bootstrap the NestJS application
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  
  // Get application configuration
  const configService = app.get(ConfigService);
  const logger = app.get(LoggerService);
  app.useLogger(logger);
  
  // Enable security headers
  app.use(helmet());
  
  // Enable response compression
  app.use(compression());
  
  // Configure CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGINS', '*'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });
  
  // Add validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw error if unknown properties
      transform: true, // Transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: false, // Strict type conversion
      },
    }),
  );
  
  // Set global route prefix
  app.setGlobalPrefix('api');
  
  // Start server
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  
  logger.log(`Application is running on: http://localhost:${port}/api`);
}

bootstrap();