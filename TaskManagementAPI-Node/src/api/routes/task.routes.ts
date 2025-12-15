import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';
import { ITokenService } from '../../services/interfaces/ITokenService';
import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

const authMiddleware = (tokenService: ITokenService) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No token provided' });
        return;
      }

      const token = authHeader.substring(7);
      const decoded = tokenService.verifyToken(token);

      if (!decoded) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
      }

      (req as any).user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };
};

const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: 'Validation failed', details: errors.array() });
    return;
  }
  next();
};

const taskValidationRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 150 }).withMessage('Title cannot exceed 150 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High']).withMessage('Priority must be Low, Medium, or High'),
  body('status')
    .optional()
    .isIn(['Pending', 'Completed']).withMessage('Status must be Pending or Completed'),
  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid date')
];

export const createTaskRoutes = (
  taskController: TaskController,
  tokenService: ITokenService
): Router => {
  const router = Router();

  router.use(authMiddleware(tokenService));

  router.get('/', taskController.getAll);
  router.get('/:id', taskController.getById);
  router.post('/', taskValidationRules, validate, taskController.create);
  router.put('/:id', taskValidationRules, validate, taskController.update);
  router.delete('/:id', taskController.delete);

  return router;
};
