import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task, TaskStatus, TaskPriority } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockTask = {
  id: 'test-uuid-123',
  title: 'Test Task',
  description: 'Test Description',
  status: TaskStatus.PENDIENTE,
  priority: TaskPriority.MEDIA,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRepository = {
  create: vi.fn().mockReturnValue(mockTask),
  save: vi.fn().mockResolvedValue(mockTask),
  find: vi.fn().mockResolvedValue([mockTask]),
  findOne: vi.fn().mockResolvedValue(mockTask),
  remove: vi.fn().mockResolvedValue(undefined),
};

describe('TasksService', () => {
  let service: TasksService;
  let repository: Repository<Task>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get<Repository<Task>>(getRepositoryToken(Task));
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.PENDIENTE,
        priority: TaskPriority.MEDIA,
      };

      const result = await service.create(createTaskDto);
      expect(repository.create).toHaveBeenCalledWith(createTaskDto);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(mockTask);
    });
  });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      const result = await service.findAll();
      expect(repository.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
      expect(result).toEqual([mockTask]);
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      const result = await service.findOne('test-uuid-123');
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'test-uuid-123' } });
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return a task', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        status: TaskStatus.EN_PROCESO,
      };

      const result = await service.update('test-uuid-123', updateTaskDto);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'test-uuid-123' } });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(mockTask);
    });
  });

  describe('updateStatus', () => {
    it('should update task status', async () => {
      const result = await service.updateStatus('test-uuid-123', TaskStatus.TERMINADA);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'test-uuid-123' } });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(mockTask);
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      await service.remove('test-uuid-123');
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'test-uuid-123' } });
      expect(repository.remove).toHaveBeenCalledWith(mockTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});