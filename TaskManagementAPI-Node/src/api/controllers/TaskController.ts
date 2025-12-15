import { Request, Response } from 'express';
import { ITaskService } from '../../services/interfaces/ITaskService';
import { Priority } from '../../core/entities/Priority';
import { Status } from '../../core/entities/Status';
import { TaskNotFoundException } from '../../services/exceptions/TaskNotFoundException';
import { logger } from '../../shared/logger';

export class TaskController {
  constructor(private readonly taskService: ITaskService) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, priority } = req.query;
      const tasks = await this.taskService.listAsync(status as Status, priority as Priority);
      res.status(200).json(tasks);
    } catch (error) {
      logger.error('Get all tasks error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const task = await this.taskService.getAsync(id);
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      res.status(200).json(task);
    } catch (error) {
      logger.error('Get task by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const taskData = req.body;
      const created = await this.taskService.createAsync(taskData);
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }
      logger.error('Create task error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const taskData = req.body;
      await this.taskService.updateAsync(id, taskData);
      res.status(204).send();
    } catch (error) {
      if (error instanceof TaskNotFoundException) {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }
      logger.error('Update task error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.taskService.deleteAsync(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof TaskNotFoundException) {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }
      logger.error('Delete task error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
