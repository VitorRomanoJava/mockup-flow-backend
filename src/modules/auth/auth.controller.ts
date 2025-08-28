// src/modules/auth/auth.controller.ts
import { Controller, Post, Body, UnauthorizedException, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('login')
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() body: any) {
    // Adicionar validação de DTO aqui em uma etapa futura
    return this.usersService.create({
        email: body.email,
        name: body.name,
        password: body.password
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req: any) {
    // req.user é populado pela estratégia JWT após validar o token
    return req.user;
  }
}