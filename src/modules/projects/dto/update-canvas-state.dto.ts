// src/modules/projects/dto/update-canvas-state.dto.ts
import { IsNotEmpty, IsObject } from 'class-validator';

export class UpdateCanvasStateDto {
  @IsObject()
  @IsNotEmpty()
  canvasState: object;
}