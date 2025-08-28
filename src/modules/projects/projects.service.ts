import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateCanvasStateDto } from './dto/update-canvas-state.dto';
import { createCanvas } from 'canvas'; // Usaremos apenas a 'canvas'

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  // ... (métodos create, findAllByUser, findOne, update, remove, updateCanvasState continuam iguais)
  async create(userId: string, createProjectDto: CreateProjectDto) {
    return this.prisma.project.create({
      data: { ...createProjectDto, userId: userId },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) { throw new NotFoundException('Projeto não encontrado'); }
    if (project.userId !== userId) { throw new ForbiddenException('Acesso negado'); }
    return project;
  }

  async update(userId: string, id: string, updateProjectDto: UpdateProjectDto) {
    await this.findOne(userId, id);
    return this.prisma.project.update({ where: { id }, data: updateProjectDto });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.project.delete({ where: { id } });
    return { message: 'Projeto deletado com sucesso' };
  }

  async updateCanvasState(userId: string, id: string, updateCanvasStateDto: UpdateCanvasStateDto) {
    await this.findOne(userId, id);
    return this.prisma.project.update({
      where: { id },
      data: { canvasState: updateCanvasStateDto.canvasState as any },
    });
  }
  
// MÉTODO DE EXPORTAÇÃO COM LOGS DE DEPURAÇÃO
async exportAsPng(userId: string, id: string): Promise<Buffer> {
  console.log(`\n--- [DEBUG] Iniciando exportação para o projeto: ${id} ---\n`);
  const project = await this.findOne(userId, id);

  if (!project.canvasState || typeof project.canvasState !== 'object') {
    throw new NotFoundException('Nenhum estado de canvas salvo para este projeto.');
  }

  console.log('[DEBUG] canvasState encontrado no banco:', JSON.stringify(project.canvasState, null, 2));

  const width = 800;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Desenhamos um fundo branco
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  console.log('[DEBUG] Fundo branco desenhado.');

  const state = project.canvasState as any;
  if (state.objects && Array.isArray(state.objects)) {
    console.log(`[DEBUG] Encontrados ${state.objects.length} objetos para desenhar.`);
    state.objects.forEach((obj: any, index: number) => {
      console.log(`[DEBUG] Processando objeto #${index + 1}:`, obj);
      if (obj.type === 'rect') {
        const fill = obj.fill || 'purple';
        const left = Number(obj.left) || 0;
        const top = Number(obj.top) || 0;
        const width = Number(obj.width) || 50;
        const height = Number(obj.height) || 50;
        
        console.log(`[DEBUG] Desenhando retângulo: fill=${fill}, x=${left}, y=${top}, w=${width}, h=${height}`);
        
        ctx.fillStyle = fill;
        ctx.fillRect(left, top, width, height);
      }
    });
  } else {
    console.log('[DEBUG] Nenhum objeto encontrado no array state.objects.');
  }

  console.log('[DEBUG] Gerando buffer da imagem...');
  return canvas.toBuffer('image/png');
}
}