import { IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;
}