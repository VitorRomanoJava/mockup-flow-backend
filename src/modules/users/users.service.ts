// Garanta que estas importações estão no topo do arquivo src/modules/users/users.service.ts

import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
// A importação abaixo é crucial para a verificação de tipo!
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // ... outros métodos do serviço ...

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await this.prisma.user.create({
        data: {
          ...data,
          password: hashedPassword,
        },
      });
      return user;
    } catch (error) {
      // ESTA É A VERIFICAÇÃO COMPLETA E CORRETA
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        // Se for um erro conhecido do Prisma de violação de chave única...
        throw new ConflictException('Este e-mail já está em uso.');
      }
      // Para qualquer outro tipo de erro, simplesmente relance-o
      throw error;
    }
  }

  // ... resto do serviço ...
}