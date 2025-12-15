import {
  BaseException,
  ValidationException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerException
} from '../../../src/services/exceptions/BaseException';

describe('BaseException Hierarchy', () => {
  describe('ValidationException', () => {
    it('should have status code 400', () => {
      const exception = new ValidationException('Invalid input');
      expect(exception.statusCode).toBe(400);
    });

    it('should include errors array in JSON output', () => {
      const errors = ['Field1 is required', 'Field2 must be a number'];
      const exception = new ValidationException('Validation failed', errors);
      const json = exception.toJSON();

      expect(json.errors).toEqual(errors);
      expect(json.message).toBe('Validation failed');
      expect(json.success).toBe(false);
    });

    it('should have empty errors array by default', () => {
      const exception = new ValidationException('Invalid');
      expect(exception.errors).toEqual([]);
    });

    it('should be an instance of BaseException', () => {
      const exception = new ValidationException('Invalid');
      expect(exception).toBeInstanceOf(BaseException);
      expect(exception).toBeInstanceOf(Error);
    });
  });

  describe('UnauthorizedException', () => {
    it('should have status code 401', () => {
      const exception = new UnauthorizedException();
      expect(exception.statusCode).toBe(401);
    });

    it('should have default message "Unauthorized"', () => {
      const exception = new UnauthorizedException();
      expect(exception.message).toBe('Unauthorized');
    });

    it('should accept custom message', () => {
      const exception = new UnauthorizedException('Token expired');
      expect(exception.message).toBe('Token expired');
    });

    it('should produce correct JSON', () => {
      const exception = new UnauthorizedException('Invalid token');
      const json = exception.toJSON();

      expect(json.success).toBe(false);
      expect(json.statusCode).toBe(401);
      expect(json.error).toBe('UnauthorizedException');
      expect(json.message).toBe('Invalid token');
    });
  });

  describe('ForbiddenException', () => {
    it('should have status code 403', () => {
      const exception = new ForbiddenException();
      expect(exception.statusCode).toBe(403);
    });

    it('should have default message "Access denied"', () => {
      const exception = new ForbiddenException();
      expect(exception.message).toBe('Access denied');
    });

    it('should accept custom message', () => {
      const exception = new ForbiddenException('Not allowed');
      expect(exception.message).toBe('Not allowed');
    });
  });

  describe('NotFoundException', () => {
    it('should have status code 404', () => {
      const exception = new NotFoundException('User');
      expect(exception.statusCode).toBe(404);
    });

    it('should format message without id', () => {
      const exception = new NotFoundException('User');
      expect(exception.message).toBe('User not found');
    });

    it('should format message with id', () => {
      const exception = new NotFoundException('Task', '123');
      expect(exception.message).toBe("Task with id '123' not found");
    });

    it('should produce correct JSON', () => {
      const exception = new NotFoundException('Task', 'abc123');
      const json = exception.toJSON();

      expect(json.success).toBe(false);
      expect(json.statusCode).toBe(404);
      expect(json.error).toBe('NotFoundException');
    });
  });

  describe('ConflictException', () => {
    it('should have status code 409', () => {
      const exception = new ConflictException('Resource already exists');
      expect(exception.statusCode).toBe(409);
    });

    it('should use provided message', () => {
      const message = 'Username already taken';
      const exception = new ConflictException(message);
      expect(exception.message).toBe(message);
    });

    it('should be operational', () => {
      const exception = new ConflictException('Conflict');
      expect(exception.isOperational).toBe(true);
    });
  });

  describe('InternalServerException', () => {
    it('should have status code 500', () => {
      const exception = new InternalServerException();
      expect(exception.statusCode).toBe(500);
    });

    it('should have default message', () => {
      const exception = new InternalServerException();
      expect(exception.message).toBe('Internal server error');
    });

    it('should accept custom message', () => {
      const exception = new InternalServerException('Database connection failed');
      expect(exception.message).toBe('Database connection failed');
    });

    it('should NOT be operational (programming error)', () => {
      const exception = new InternalServerException();
      expect(exception.isOperational).toBe(false);
    });
  });

  describe('Exception inheritance', () => {
    it('all exceptions should be instances of Error', () => {
      const exceptions = [
        new ValidationException('test'),
        new UnauthorizedException(),
        new ForbiddenException(),
        new NotFoundException('Resource'),
        new ConflictException('test'),
        new InternalServerException()
      ];

      exceptions.forEach(ex => {
        expect(ex).toBeInstanceOf(Error);
        expect(ex).toBeInstanceOf(BaseException);
      });
    });

    it('all exceptions should have proper name', () => {
      expect(new ValidationException('test').name).toBe('ValidationException');
      expect(new UnauthorizedException().name).toBe('UnauthorizedException');
      expect(new ForbiddenException().name).toBe('ForbiddenException');
      expect(new NotFoundException('X').name).toBe('NotFoundException');
      expect(new ConflictException('test').name).toBe('ConflictException');
      expect(new InternalServerException().name).toBe('InternalServerException');
    });

    it('all exceptions should have stack trace', () => {
      const exceptions = [
        new ValidationException('test'),
        new UnauthorizedException(),
        new NotFoundException('Resource')
      ];

      exceptions.forEach(ex => {
        expect(ex.stack).toBeDefined();
        expect(ex.stack).toContain(ex.name);
      });
    });
  });
});
