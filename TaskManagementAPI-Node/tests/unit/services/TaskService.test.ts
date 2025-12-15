import { TaskService } from '../../../src/services/implementations/TaskService';
import { ITaskReadRepository } from '../../../src/core/interfaces/ITaskReadRepository';
import { ITaskWriteRepository } from '../../../src/core/interfaces/ITaskWriteRepository';
import { TaskItem } from '../../../src/core/entities/TaskItem';
import { Priority } from '../../../src/core/entities/Priority';
import { Status } from '../../../src/core/entities/Status';
import { TaskNotFoundException } from '../../../src/services/exceptions/TaskNotFoundException';

// Mock the logger to avoid console output during tests
jest.mock('../../../src/shared/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }
}));

describe('TaskService', () => {
  let taskService: TaskService;
  let mockReadRepository: jest.Mocked<ITaskReadRepository>;
  let mockWriteRepository: jest.Mocked<ITaskWriteRepository>;

  const mockTask: TaskItem = {
    id: 'task123',
    title: 'Test Task',
    description: 'Test Description',
    priority: Priority.Medium,
    status: Status.Pending,
    dueDate: new Date('2025-12-31'),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockTasks: TaskItem[] = [
    mockTask,
    {
      id: 'task456',
      title: 'Another Task',
      description: 'Another Description',
      priority: Priority.High,
      status: Status.Completed,
      dueDate: new Date('2025-12-25'),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  beforeEach(() => {
    // Create mock implementations
    mockReadRepository = {
      getAllAsync: jest.fn(),
      getByIdAsync: jest.fn()
    };

    mockWriteRepository = {
      createAsync: jest.fn(),
      updateAsync: jest.fn(),
      deleteAsync: jest.fn()
    };

    taskService = new TaskService(mockReadRepository, mockWriteRepository);
  });

  describe('constructor', () => {
    it('should throw error when TaskReadRepository is not provided', () => {
      expect(() => {
        new TaskService(null as any, mockWriteRepository);
      }).toThrow('TaskReadRepository is required');
    });

    it('should throw error when TaskWriteRepository is not provided', () => {
      expect(() => {
        new TaskService(mockReadRepository, null as any);
      }).toThrow('TaskWriteRepository is required');
    });

    it('should create instance successfully with all dependencies', () => {
      const service = new TaskService(mockReadRepository, mockWriteRepository);
      expect(service).toBeDefined();
    });
  });

  describe('listAsync', () => {
    it('should return all tasks when no filters provided', async () => {
      mockReadRepository.getAllAsync.mockResolvedValue(mockTasks);

      const result = await taskService.listAsync();

      expect(result).toEqual(mockTasks);
      expect(result).toHaveLength(2);
      expect(mockReadRepository.getAllAsync).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should return tasks filtered by status', async () => {
      const pendingTasks = [mockTask];
      mockReadRepository.getAllAsync.mockResolvedValue(pendingTasks);

      const result = await taskService.listAsync(Status.Pending);

      expect(result).toEqual(pendingTasks);
      expect(mockReadRepository.getAllAsync).toHaveBeenCalledWith(Status.Pending, undefined);
    });

    it('should return tasks filtered by priority', async () => {
      const highPriorityTasks = [mockTasks[1]];
      mockReadRepository.getAllAsync.mockResolvedValue(highPriorityTasks);

      const result = await taskService.listAsync(undefined, Priority.High);

      expect(result).toEqual(highPriorityTasks);
      expect(mockReadRepository.getAllAsync).toHaveBeenCalledWith(undefined, Priority.High);
    });

    it('should return tasks filtered by both status and priority', async () => {
      mockReadRepository.getAllAsync.mockResolvedValue([]);

      const result = await taskService.listAsync(Status.Completed, Priority.High);

      expect(result).toEqual([]);
      expect(mockReadRepository.getAllAsync).toHaveBeenCalledWith(Status.Completed, Priority.High);
    });

    it('should return empty array when no tasks exist', async () => {
      mockReadRepository.getAllAsync.mockResolvedValue([]);

      const result = await taskService.listAsync();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('getAsync', () => {
    it('should return null when id is empty', async () => {
      const result = await taskService.getAsync('');
      expect(result).toBeNull();
      expect(mockReadRepository.getByIdAsync).not.toHaveBeenCalled();
    });

    it('should return null when id is whitespace only', async () => {
      const result = await taskService.getAsync('   ');
      expect(result).toBeNull();
      expect(mockReadRepository.getByIdAsync).not.toHaveBeenCalled();
    });

    it('should return task when found', async () => {
      mockReadRepository.getByIdAsync.mockResolvedValue(mockTask);

      const result = await taskService.getAsync('task123');

      expect(result).toEqual(mockTask);
      expect(mockReadRepository.getByIdAsync).toHaveBeenCalledWith('task123');
    });

    it('should return null when task not found', async () => {
      mockReadRepository.getByIdAsync.mockResolvedValue(null);

      const result = await taskService.getAsync('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('createAsync', () => {
    const newTask: TaskItem = {
      title: 'New Task',
      description: 'New Description',
      priority: Priority.Low,
      status: Status.Pending
    };

    it('should throw error when task data is null', async () => {
      await expect(taskService.createAsync(null as any))
        .rejects
        .toThrow('Task data is required');
    });

    it('should throw error when task title is empty', async () => {
      const taskWithEmptyTitle = { ...newTask, title: '' };

      await expect(taskService.createAsync(taskWithEmptyTitle))
        .rejects
        .toThrow('Task title is required');
    });

    it('should throw error when task title is whitespace only', async () => {
      const taskWithWhitespaceTitle = { ...newTask, title: '   ' };

      await expect(taskService.createAsync(taskWithWhitespaceTitle))
        .rejects
        .toThrow('Task title is required');
    });

    it('should create task successfully', async () => {
      const createdTask = { ...newTask, id: 'newTask123' };
      mockWriteRepository.createAsync.mockResolvedValue(createdTask);

      const result = await taskService.createAsync(newTask);

      expect(result).toEqual(createdTask);
      expect(result.id).toBe('newTask123');
      expect(mockWriteRepository.createAsync).toHaveBeenCalledWith(newTask);
    });

    it('should create task with all fields', async () => {
      const fullTask: TaskItem = {
        title: 'Full Task',
        description: 'Full Description',
        priority: Priority.High,
        status: Status.Pending,
        dueDate: new Date('2025-12-31')
      };
      const createdTask = { ...fullTask, id: 'fullTask123' };
      mockWriteRepository.createAsync.mockResolvedValue(createdTask);

      const result = await taskService.createAsync(fullTask);

      expect(result).toEqual(createdTask);
      expect(mockWriteRepository.createAsync).toHaveBeenCalledWith(fullTask);
    });
  });

  describe('updateAsync', () => {
    const updateData: TaskItem = {
      title: 'Updated Task',
      description: 'Updated Description',
      priority: Priority.High,
      status: Status.Completed
    };

    it('should throw error when id is empty', async () => {
      await expect(taskService.updateAsync('', updateData))
        .rejects
        .toThrow('Invalid task ID');
    });

    it('should throw error when id is whitespace only', async () => {
      await expect(taskService.updateAsync('   ', updateData))
        .rejects
        .toThrow('Invalid task ID');
    });

    it('should throw error when task data is null', async () => {
      await expect(taskService.updateAsync('task123', null as any))
        .rejects
        .toThrow('Task data is required');
    });

    it('should throw error when task title is empty', async () => {
      const taskWithEmptyTitle = { ...updateData, title: '' };

      await expect(taskService.updateAsync('task123', taskWithEmptyTitle))
        .rejects
        .toThrow('Task title is required');
    });

    it('should throw TaskNotFoundException when task does not exist', async () => {
      mockReadRepository.getByIdAsync.mockResolvedValue(null);

      await expect(taskService.updateAsync('nonexistent', updateData))
        .rejects
        .toThrow(TaskNotFoundException);
    });

    it('should update task successfully', async () => {
      mockReadRepository.getByIdAsync.mockResolvedValue({ ...mockTask });
      mockWriteRepository.updateAsync.mockResolvedValue(undefined);

      await taskService.updateAsync('task123', updateData);

      expect(mockReadRepository.getByIdAsync).toHaveBeenCalledWith('task123');
      expect(mockWriteRepository.updateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'task123',
          title: 'Updated Task',
          description: 'Updated Description',
          priority: Priority.High,
          status: Status.Completed
        })
      );
    });

    it('should update task with new due date', async () => {
      const updateWithDueDate = { ...updateData, dueDate: new Date('2026-01-15') };
      mockReadRepository.getByIdAsync.mockResolvedValue({ ...mockTask });
      mockWriteRepository.updateAsync.mockResolvedValue(undefined);

      await taskService.updateAsync('task123', updateWithDueDate);

      expect(mockWriteRepository.updateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          dueDate: new Date('2026-01-15')
        })
      );
    });
  });

  describe('deleteAsync', () => {
    it('should throw error when id is empty', async () => {
      await expect(taskService.deleteAsync(''))
        .rejects
        .toThrow('Invalid task ID');
    });

    it('should throw error when id is whitespace only', async () => {
      await expect(taskService.deleteAsync('   '))
        .rejects
        .toThrow('Invalid task ID');
    });

    it('should throw TaskNotFoundException when task does not exist', async () => {
      mockReadRepository.getByIdAsync.mockResolvedValue(null);

      await expect(taskService.deleteAsync('nonexistent'))
        .rejects
        .toThrow(TaskNotFoundException);
    });

    it('should delete task successfully', async () => {
      mockReadRepository.getByIdAsync.mockResolvedValue(mockTask);
      mockWriteRepository.deleteAsync.mockResolvedValue(undefined);

      await taskService.deleteAsync('task123');

      expect(mockReadRepository.getByIdAsync).toHaveBeenCalledWith('task123');
      expect(mockWriteRepository.deleteAsync).toHaveBeenCalledWith('task123');
    });
  });
});
