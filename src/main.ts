// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita validações globais baseadas em DTOs (Data Transfer Objects)
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();