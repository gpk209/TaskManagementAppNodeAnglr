import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDatabase } from './infrastructure/database/mongoose.config';
import { config, validateConfig } from './shared/config';
import { logger } from './shared/logger';

// Repositories
import { UserRepository } from './infrastructure/repositories/UserRepository';
import { TaskReadRepository } from './infrastructure/repositories/TaskReadRepository';
import { TaskWriteRepository } from './infrastructure/repositories/TaskWriteRepository';

// Services
import { PasswordHasher } from './services/implementations/PasswordHasher';
import { JwtTokenService } from './services/implementations/JwtTokenService';
import { AuthService } from './services/implementations/AuthService';
import { TaskService } from './services/implementations/TaskService';

// Controllers
import { AuthController } from './api/controllers/AuthController';
import { TaskController } from './api/controllers/TaskController';

// Routes
import { createAuthRoutes } from './api/routes/auth.routes';
import { createTaskRoutes } from './api/routes/task.routes';

// Middleware
import { errorHandler, notFoundHandler } from './api/middleware';

dotenv.config();

const bootstrap = async (): Promise<void> => {
  try {
    validateConfig();

    const app: Application = express();

    // Middleware
    app.use(cors({ 
      origin: config.corsOrigin,
      credentials: true  // Allow cookies to be sent cross-origin
    }));
    app.use(cookieParser());  // Parse cookies
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Request logging
    app.use((req, _res, next) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    });

    // Connect to database
    await connectDatabase();

    // Initialize repositories
    const userRepository = new UserRepository();
    const taskReadRepository = new TaskReadRepository();
    const taskWriteRepository = new TaskWriteRepository();

    // Initialize services
    const passwordHasher = new PasswordHasher();
    const tokenService = new JwtTokenService();
    const authService = new AuthService(userRepository, passwordHasher, tokenService);
    const taskService = new TaskService(taskReadRepository, taskWriteRepository);

    // Initialize controllers
    const authController = new AuthController(authService);
    const taskController = new TaskController(taskService);

    // Health check endpoint
    app.get('/health', (_req, res) => {
      res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv
      });
    });

    // API routes
    app.use('/api/auth', createAuthRoutes(authController));
    app.use('/api/tasks', createTaskRoutes(taskController, tokenService));

    // 404 handler - must be after all routes
    app.use(notFoundHandler);

    // Global error handler - must be last middleware
    app.use(errorHandler);

    // Start server
    app.listen(config.port, () => {
      logger.info(`?? Server started on port ${config.port}`);
      logger.info(`?? Environment: ${config.nodeEnv}`);
      logger.info(`?? API: http://localhost:${config.port}/api`);
      logger.info(`??  Health: http://localhost:${config.port}/health`);
    });

  } catch (error) {
    logger.error('? Failed to start server:', error);
    process.exit(1);
  }
};

bootstrap();

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
