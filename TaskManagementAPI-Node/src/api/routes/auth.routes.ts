import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: 'Validation failed', details: errors.array() });
    return;
  }
  next();
};

const authValidationRules = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 4 }).withMessage('Password must be at least 4 characters')
];

export const createAuthRoutes = (authController: AuthController): Router => {
  const router = Router();

  router.post('/login', authValidationRules, validate, authController.login);
  router.post('/register', authValidationRules, validate, authController.register);
  
  // Token refresh endpoint - no validation needed, uses cookie
  router.post('/refresh', authController.refresh);
  
  // Logout endpoint - clears refresh token cookie
  router.post('/logout', authController.logout);

  return router;
};
