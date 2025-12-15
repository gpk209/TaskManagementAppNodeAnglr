import { Request, Response, NextFunction } from 'express';
import { BaseException } from '../../services/exceptions/BaseException';
import { logger } from '../../shared/logger';

/**
 * Global error handler middleware
 * Converts exceptions to consistent API responses
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log the error
  logger.error('Error caught by global handler:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Handle known application exceptions
  if (err instanceof BaseException) {
    res.status(err.statusCode).json(err.toJSON());
    return;
  }

  // Handle validation errors from express-validator
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: err.message,
      statusCode: 400
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: 'AuthenticationError',
      message: 'Invalid or expired token',
      statusCode: 401
    });
    return;
  }

  // Handle MongoDB duplicate key errors
  if ((err as any).code === 11000) {
    res.status(409).json({
      success: false,
      error: 'ConflictError',
      message: 'Resource already exists',
      statusCode: 409
    });
    return;
  }

  // Handle MongoDB CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: 'Invalid ID format',
      statusCode: 400
    });
    return;
  }

  // Handle unknown errors (don't expose details in production)
  const isProduction = process.env.NODE_ENV === 'production';
  res.status(500).json({
    success: false,
    error: 'InternalServerError',
    message: isProduction ? 'An unexpected error occurred' : err.message,
    statusCode: 500,
    ...(isProduction ? {} : { stack: err.stack })
  });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 * Eliminates need for try-catch in every controller method
 * 
 * @example
 * router.get('/', asyncHandler(async (req, res) => {
 *   const data = await service.getData();
 *   res.json(data);
 * }));
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not found handler for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: 'NotFoundError',
    message: `Route ${req.method} ${req.path} not found`,
    statusCode: 404
  });
};
