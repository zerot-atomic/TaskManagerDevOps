import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task, TaskStatus, TaskPriority } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockTask: Task = {
  id: 'test-uuid-123',
  title: 'Test Task',
  description: 'Test Description',
  status: TaskStatus.PENDIENTE,
  priority: TaskPriority.MEDIA,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTasksService = {
  create: vi.fn().mockResolvedValue(mockTask),
  findAll: vi.fn().mockResolvedValue([mockTask]),
  findOne: vi.fn().mockResolvedValue(mockTask),
  update: vi.fn().mockResolvedValue(mockTask),
  updateStatus: vi.fn().mockResolvedValue(mockTask),
  remove: vi.fn().mockResolvedValue(undefined),
};

describe('TasksController', () => {
  let controller: TasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.PENDIENTE,
        priority: TaskPriority.MEDIA,
      };

      const result = await controller.create(createTaskDto);
      expect(mockTasksService.create).toHaveBeenCalledWith(createTaskDto);
      expect(result).toEqual(mockTask);
    });
  });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      const result = await controller.findAll();
      expect(mockTasksService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockTask]);
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      const result = await controller.findOne('test-uuid-123');
      expect(mockTasksService.findOne).toHaveBeenCalledWith('test-uuid-123');
      expect(result).toEqual(mockTask);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        status: TaskStatus.EN_PROCESO,
      };

      const result = await controller.update('test-uuid-123', updateTaskDto);
      expect(mockTasksService.update).toHaveBeenCalledWith('test-uuid-123', updateTaskDto);
      expect(result).toEqual(mockTask);
    });
  });

  describe('updateStatus', () => {
    it('should update task status', async () => {
      const result = await controller.updateStatus('test-uuid-123', TaskStatus.TERMINADA);
      expect(mockTasksService.updateStatus).toHaveBeenCalledWith('test-uuid-123', TaskStatus.TERMINADA);
      expect(result).toEqual(mockTask);
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      await controller.remove('test-uuid-123');
      expect(mockTasksService.remove).toHaveBeenCalledWith('test-uuid-123');
    });
  });
});