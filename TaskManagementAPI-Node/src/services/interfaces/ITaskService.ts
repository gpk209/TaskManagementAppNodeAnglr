import { TaskItem } from '../../core/entities/TaskItem';
import { Priority } from '../../core/entities/Priority';
import { Status } from '../../core/entities/Status';

/**
 * Interface for task service operations
 */
export interface ITaskService {
  listAsync(status?: Status, priority?: Priority): Promise<TaskItem[]>;
  getAsync(id: string): Promise<TaskItem | null>;
  createAsync(dto: TaskItem): Promise<TaskItem>;
  updateAsync(id: string, dto: TaskItem): Promise<void>;
  deleteAsync(id: string): Promise<void>;
}
