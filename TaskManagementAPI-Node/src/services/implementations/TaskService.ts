import { ITaskService } from '../interfaces/ITaskService';
import { ITaskReadRepository } from '../../core/interfaces/ITaskReadRepository';
import { ITaskWriteRepository } from '../../core/interfaces/ITaskWriteRepository';
import { TaskItem } from '../../core/entities/TaskItem';
import { Priority } from '../../core/entities/Priority';
import { Status } from '../../core/entities/Status';
import { TaskNotFoundException } from '../exceptions/TaskNotFoundException';
import { logger } from '../../shared/logger';

/**
 * Task service implementation
 */
export class TaskService implements ITaskService {
  constructor(
    private readonly read: ITaskReadRepository,
    private readonly write: ITaskWriteRepository
  ) {
    if (!read) throw new Error('TaskReadRepository is required');
    if (!write) throw new Error('TaskWriteRepository is required');
  }

  async listAsync(status?: Status, priority?: Priority): Promise<TaskItem[]> {
    logger.debug(`Listing tasks with filters - Status: ${status}, Priority: ${priority}`);
    
    const tasks = await this.read.getAllAsync(status, priority);
    
    logger.info(`Retrieved ${tasks.length} tasks`);
    return tasks;
  }

  async getAsync(id: string): Promise<TaskItem | null> {
    if (!id || id.trim() === '') {
      logger.warn(`Invalid task ID requested: ${id}`);
      return null;
    }

    logger.debug(`Retrieving task with ID: ${id}`);
    return await this.read.getByIdAsync(id);
  }

  async createAsync(dto: TaskItem): Promise<TaskItem> {
    if (!dto) {
      throw new Error('Task data is required');
    }

    if (!dto.title || dto.title.trim() === '') {
      throw new Error('Task title is required');
    }

    logger.info(`Creating new task: ${dto.title}`);
    
    const created = await this.write.createAsync(dto);
    
    logger.info(`Task created successfully with ID: ${created.id}`);
    return created;
  }

  async updateAsync(id: string, dto: TaskItem): Promise<void> {
    if (!id || id.trim() === '') {
      throw new Error('Invalid task ID');
    }

    if (!dto) {
      throw new Error('Task data is required');
    }

    if (!dto.title || dto.title.trim() === '') {
      throw new Error('Task title is required');
    }

    logger.info(`Updating task with ID: ${id}`);

    const existing = await this.read.getByIdAsync(id);
    if (!existing) {
      logger.warn(`Update failed - task not found with ID: ${id}`);
      throw new TaskNotFoundException(id);
    }

    existing.title = dto.title;
    existing.description = dto.description;
    existing.dueDate = dto.dueDate;
    existing.priority = dto.priority;
    existing.status = dto.status;

    await this.write.updateAsync(existing);
    logger.info(`Task updated successfully: ${id}`);
  }

  async deleteAsync(id: string): Promise<void> {
    if (!id || id.trim() === '') {
      throw new Error('Invalid task ID');
    }

    logger.info(`Deleting task with ID: ${id}`);

    const existing = await this.read.getByIdAsync(id);
    if (!existing) {
      logger.warn(`Delete failed - task not found with ID: ${id}`);
      throw new TaskNotFoundException(id);
    }

    await this.write.deleteAsync(id);
    logger.info(`Task deleted successfully: ${id}`);
  }
}
