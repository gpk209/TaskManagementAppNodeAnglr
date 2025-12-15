import { ITaskReadRepository } from '../../core/interfaces/ITaskReadRepository';
import { TaskItem } from '../../core/entities/TaskItem';
import { Priority } from '../../core/entities/Priority';
import { Status } from '../../core/entities/Status';
import { TaskModel } from '../models/Task.model';

/**
 * Task read repository implementation using MongoDB
 */
export class TaskReadRepository implements ITaskReadRepository {
  async getAllAsync(status?: Status, priority?: Priority): Promise<TaskItem[]> {
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    const tasks = await TaskModel
      .find(filter)
      .sort({ dueDate: 1 })
      .exec();

    return tasks.map(task => this.mapToEntity(task));
  }

  async getByIdAsync(id: string): Promise<TaskItem | null> {
    const task = await TaskModel.findById(id).exec();

    if (!task) {
      return null;
    }

    return this.mapToEntity(task);
  }

  private mapToEntity(doc: any): TaskItem {
    return {
      id: doc._id.toString(),
      title: doc.title,
      description: doc.description,
      dueDate: doc.dueDate,
      priority: doc.priority,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }
}
