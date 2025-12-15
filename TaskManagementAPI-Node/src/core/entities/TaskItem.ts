import { Priority } from './Priority';
import { Status } from './Status';

/**
 * TaskItem entity representing a task in the system
 */
export interface TaskItem {
  id?: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: Priority;
  status: Status;
  createdAt?: Date;
  updatedAt?: Date;
}
