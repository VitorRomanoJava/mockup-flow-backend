// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

// Nossos módulos
import { ProjectsModule } from './modules/projects/projects.module';
import { AuthController } from './modules/auth/auth.controller';
import { AuthService } from './modules/auth/auth.service';
import { JwtStrategy } from './modules/auth/jwt.strategy';
import { UsersService } from './modules/users/users.service';
import { PrismaService } from './infra/database/prisma.service';

@Module({
  imports: [
    ProjectsModule, // <<< ADICIONE ESTA LINHA
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET')!,
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [PrismaService, UsersService, AuthService, JwtStrategy],
})
export class AppModule {}