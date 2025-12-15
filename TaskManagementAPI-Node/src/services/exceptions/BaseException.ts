/**
 * Base exception class for application errors
 * Provides consistent error handling across the application
 */
export abstract class BaseException extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert exception to JSON response
   */
  toJSON() {
    return {
      success: false,
      error: this.name,
      message: this.message,
      statusCode: this.statusCode
    };
  }
}

/**
 * 400 Bad Request - Invalid input
 */
export class ValidationException extends BaseException {
  public readonly errors: string[];

  constructor(message: string, errors: string[] = []) {
    super(message, 400);
    this.errors = errors;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      errors: this.errors
    };
  }
}

/**
 * 401 Unauthorized - Authentication failed
 */
export class UnauthorizedException extends BaseException {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * 403 Forbidden - Access denied
 */
export class ForbiddenException extends BaseException {
  constructor(message: string = 'Access denied') {
    super(message, 403);
  }
}

/**
 * 404 Not Found - Resource not found
 */
export class NotFoundException extends BaseException {
  constructor(resource: string, id?: string) {
    super(id ? `${resource} with id '${id}' not found` : `${resource} not found`, 404);
  }
}

/**
 * 409 Conflict - Resource already exists
 */
export class ConflictException extends BaseException {
  constructor(message: string) {
    super(message, 409);
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerException extends BaseException {
  constructor(message: string = 'Internal server error') {
    super(message, 500, false);
  }
}
