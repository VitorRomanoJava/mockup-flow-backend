import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseUUIDPipe, Put, Res, Header } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateCanvasStateDto } from './dto/update-canvas-state.dto';
import { Response } from 'express'; // Importe o Response

@UseGuards(AuthGuard('jwt'))
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Request() req: any, @Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(req.user.userId, createProjectDto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.projectsService.findAllByUser(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id', ParseUUIDPipe) id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(req.user.userId, id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.remove(req.user.userId, id);
  }

  @Put(':id/canvas')
  updateCanvas(@Request() req: any, @Param('id', ParseUUIDPipe) id: string, @Body() updateCanvasStateDto: UpdateCanvasStateDto) {
    return this.projectsService.updateCanvasState(req.user.userId, id, updateCanvasStateDto);
  }

  // NOVO ENDPOINT DA ETAPA 4
  @Get(':id/export/png')
  @Header('Content-Type', 'image/png')
  async export(@Request() req: any, @Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const imageBuffer = await this.projectsService.exportAsPng(req.user.userId, id);

    res.set('Content-Disposition', `attachment; filename="mockup-${id}.png"`);
    res.send(imageBuffer);
  }
}