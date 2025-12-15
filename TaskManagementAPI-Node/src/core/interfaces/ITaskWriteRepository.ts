import { TaskItem } from '../entities/TaskItem';

/**
 * Interface for task write operations (Command side of CQRS)
 */
export interface ITaskWriteRepository {
  createAsync(item: TaskItem): Promise<TaskItem>;
  updateAsync(item: TaskItem): Promise<void>;
  deleteAsync(id: string): Promise<void>;
}
