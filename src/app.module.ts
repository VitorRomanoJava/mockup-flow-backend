// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

// Nossos módulos
import { ProjectsModule } from './modules/projects/projects.module';
import { AuthController } from './modules/auth/auth.controller';
import { AuthService } from './modules/auth/auth.service';
import { JwtStrategy } from './modules/auth/jwt.strategy';
import { PrismaService } from './infra/database/prisma.service';

// 1. Importe o novo UsersModule
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ProjectsModule,
    UsersModule, // 2. Adicione o UsersModule aqui
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
  // 3. Remova UsersService dos providers daqui, pois o UsersModule já cuida disso.
  // O AuthService precisa do UsersService, e como importamos o UsersModule, ele estará disponível.
  providers: [PrismaService, AuthService, JwtStrategy],
})
export class AppModule {}