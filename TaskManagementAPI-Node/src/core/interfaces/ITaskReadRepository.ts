import { TaskItem } from '../entities/TaskItem';
import { Priority } from '../entities/Priority';
import { Status } from '../entities/Status';

/**
 * Interface for task read operations (Query side of CQRS)
 */
export interface ITaskReadRepository {
  /**
   * Get all tasks with optional filtering
   */
  getAllAsync(status?: Status, priority?: Priority): Promise<TaskItem[]>;

  /**
   * Get a task by its ID
   */
  getByIdAsync(id: string): Promise<TaskItem | null>;
}
