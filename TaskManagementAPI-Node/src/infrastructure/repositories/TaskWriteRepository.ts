import { ITaskWriteRepository } from '../../core/interfaces/ITaskWriteRepository';
import { TaskItem } from '../../core/entities/TaskItem';
import { TaskModel } from '../models/Task.model';

/**
 * Task write repository implementation using MongoDB
 */
export class TaskWriteRepository implements ITaskWriteRepository {
  async createAsync(item: TaskItem): Promise<TaskItem> {
    const newTask = new TaskModel({
      title: item.title,
      description: item.description,
      dueDate: item.dueDate,
      priority: item.priority,
      status: item.status
    });

    const saved = await newTask.save();

    return {
      id: saved._id.toString(),
      title: saved.title,
      description: saved.description,
      dueDate: saved.dueDate,
      priority: saved.priority,
      status: saved.status,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt
    };
  }

  async updateAsync(item: TaskItem): Promise<void> {
    if (!item.id) {
      throw new Error('Task ID is required for update');
    }

    await TaskModel.findByIdAndUpdate(
      item.id,
      {
        title: item.title,
        description: item.description,
        dueDate: item.dueDate,
        priority: item.priority,
        status: item.status
      },
      { new: true }
    );
  }

  async deleteAsync(id: string): Promise<void> {
    await TaskModel.findByIdAndDelete(id);
  }
}
