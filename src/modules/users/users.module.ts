// src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../../infra/database/prisma.service';

@Module({
  providers: [UsersService, PrismaService],
  // Adicionamos a linha 'exports' para que outros módulos possam usar o UsersService
  exports: [UsersService],
})
export class UsersModule {}