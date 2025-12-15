import { NotFoundException } from './BaseException';

/**
 * Exception thrown when a task is not found
 */
export class TaskNotFoundException extends NotFoundException {
  constructor(taskId: string) {
    super('Task', taskId);
  }
}
