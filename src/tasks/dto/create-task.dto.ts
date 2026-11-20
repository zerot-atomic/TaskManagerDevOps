import { IsString, IsOptional, IsEnum, MaxLength, MinLength } from 'class-validator';
import { TaskStatus, TaskPriority } from '../entities/task.entity.js';

export class CreateTaskDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;
}