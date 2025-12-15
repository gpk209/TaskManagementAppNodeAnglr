# Complete Node.js Project - Source Code Generator

## This document contains all the source code for the Task Management API

Copy each section below into the corresponding file path shown.

---

## SERVICE INTERFACES

### src/services/interfaces/IAuthService.ts
```typescript
export interface IAuthService {
  loginAsync(username: string, password: string): Promise<string | null>;
  registerAsync(username: string, password: string): Promise<void>;
}
```

### src/services/interfaces/ITaskService.ts
```typescript
import { TaskItem } from '../../core/entities/TaskItem';
import { Priority } from '../../core/entities/Priority';
import { Status } from '../../core/entities/Status';

export interface ITaskService {
  listAsync(status?: Status, priority?: Priority): Promise<TaskItem[]>;
  getAsync(id: string): Promise<TaskItem | null>;
  createAsync(dto: TaskItem): Promise<TaskItem>;
  updateAsync(id: string, dto: TaskItem): Promise<void>;
  deleteAsync(id: string): Promise<void>;
}
```

### src/services/interfaces/IPasswordHasher.ts
```typescript
export interface IPasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}
```

### src/services/interfaces/ITokenService.ts
```typescript
import { AppUser } from '../../core/entities/AppUser';

export interface ITokenService {
  createToken(user: AppUser): string;
  verifyToken(token: string): any;
}
```

---

## SERVICE IMPLEMENTATIONS

### src/services/implementations/PasswordHasher.ts
```typescript
import bcrypt from 'bcryptjs';
import { IPasswordHasher } from '../interfaces/IPasswordHasher';

export class PasswordHasher implements IPasswordHasher {
  private readonly saltRounds = 10;

  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
```

### src/services/implementations/JwtTokenService.ts
```typescript
import jwt from 'jsonwebtoken';
import { AppUser } from '../../core/entities/AppUser';
import { ITokenService } from '../interfaces/ITokenService';

export class JwtTokenService implements ITokenService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }

  createToken(user: AppUser): string {
    const payload = {
      id: user.id,
      username: user.username
    };

    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      return null;
    }
  }
}
```

### src/services/implementations/AuthService.ts
```typescript
import { IAuthService } from '../interfaces/IAuthService';
import { IUserRepository } from '../../core/interfaces/IUserRepository';
import { IPasswordHasher } from '../interfaces/IPasswordHasher';
import { ITokenService } from '../interfaces/ITokenService';
import { UsernameTakenException } from '../exceptions/UsernameTakenException';
import { AppUser } from '../../core/entities/AppUser';
import { logger } from '../../shared/logger';

export class AuthService implements IAuthService {
  constructor(
    private readonly users: IUserRepository,
    private readonly hasher: IPasswordHasher,
    private readonly tokens: ITokenService
  ) {
    if (!users) throw new Error('UserRepository is required');
    if (!hasher) throw new Error('PasswordHasher is required');
    if (!tokens) throw new Error('TokenService is required');
  }

  async loginAsync(username: string, password: string): Promise<string | null> {
    if (!username || username.trim() === '') {
      logger.warn('Login attempt with empty username');
      return null;
    }

    if (!password || password.trim() === '') {
      logger.warn(\`Login attempt with empty password for username: \${username}\`);
      return null;
    }

    logger.info(\`Login attempt for user: \${username}\`);

    const user = await this.users.getByUsernameAsync(username);
    if (!user) {
      logger.warn(\`Login failed - user not found: \${username}\`);
      return null;
    }

    const isValid = await this.hasher.verify(password, user.passwordHash);
    if (!isValid) {
      logger.warn(\`Login failed - invalid password for user: \${username}\`);
      return null;
    }

    logger.info(\`Login successful for user: \${username}\`);
    return this.tokens.createToken(user);
  }

  async registerAsync(username: string, password: string): Promise<void> {
    if (!username || username.trim() === '') {
      throw new Error('Username cannot be empty');
    }

    if (!password || password.trim() === '') {
      throw new Error('Password cannot be empty');
    }

    logger.info(\`Registration attempt for username: \${username}\`);

    const existing = await this.users.getByUsernameAsync(username);
    if (existing) {
      logger.warn(\`Registration failed - username already exists: \${username}\`);
      throw new UsernameTakenException(username);
    }

    const hashed = await this.hasher.hash(password);
    const user: AppUser = {
      username,
      passwordHash: hashed
    };

    await this.users.createAsync(user);
    logger.info(\`User registered successfully: \${username}\`);
  }
}
```

### src/services/implementations/TaskService.ts
```typescript
import { ITaskService } from '../interfaces/ITaskService';
import { ITaskReadRepository } from '../../core/interfaces/ITaskReadRepository';
import { ITaskWriteRepository } from '../../core/interfaces/ITaskWriteRepository';
import { TaskItem } from '../../core/entities/TaskItem';
import { Priority } from '../../core/entities/Priority';
import { Status } from '../../core/entities/Status';
import { TaskNotFoundException } from '../exceptions/TaskNotFoundException';
import { logger } from '../../shared/logger';

export class TaskService implements ITaskService {
  constructor(
    private readonly read: ITaskReadRepository,
    private readonly write: ITaskWriteRepository
  ) {
    if (!read) throw new Error('TaskReadRepository is required');
    if (!write) throw new Error('TaskWriteRepository is required');
  }

  async listAsync(status?: Status, priority?: Priority): Promise<TaskItem[]> {
    logger.debug(\`Listing tasks with filters - Status: \${status}, Priority: \${priority}\`);
    
    const tasks = await this.read.getAllAsync(status, priority);
    
    logger.info(\`Retrieved \${tasks.length} tasks\`);
    return tasks;
  }

  async getAsync(id: string): Promise<TaskItem | null> {
    if (!id || id.trim() === '') {
      logger.warn(\`Invalid task ID requested: \${id}\`);
      return null;
    }

    logger.debug(\`Retrieving task with ID: \${id}\`);
    return await this.read.getByIdAsync(id);
  }

  async createAsync(dto: TaskItem): Promise<TaskItem> {
    if (!dto) {
      throw new Error('Task data is required');
    }

    if (!dto.title || dto.title.trim() === '') {
      throw new Error('Task title is required');
    }

    logger.info(\`Creating new task: \${dto.title}\`);
    
    const created = await this.write.createAsync(dto);
    
    logger.info(\`Task created successfully with ID: \${created.id}\`);
    return created;
  }

  async updateAsync(id: string, dto: TaskItem): Promise<void> {
    if (!id || id.trim() === '') {
      throw new Error('Invalid task ID');
    }

    if (!dto) {
      throw new Error('Task data is required');
    }

    if (!dto.title || dto.title.trim() === '') {
      throw new Error('Task title is required');
    }

    logger.info(\`Updating task with ID: \${id}\`);

    const existing = await this.read.getByIdAsync(id);
    if (!existing) {
      logger.warn(\`Update failed - task not found with ID: \${id}\`);
      throw new TaskNotFoundException(id);
    }

    existing.title = dto.title;
    existing.description = dto.description;
    existing.dueDate = dto.dueDate;
    existing.priority = dto.priority;
    existing.status = dto.status;

    await this.write.updateAsync(existing);
    logger.info(\`Task updated successfully: \${id}\`);
  }

  async deleteAsync(id: string): Promise<void> {
    if (!id || id.trim() === '') {
      throw new Error('Invalid task ID');
    }

    logger.info(\`Deleting task with ID: \${id}\`);

    const existing = await this.read.getByIdAsync(id);
    if (!existing) {
      logger.warn(\`Delete failed - task not found with ID: \${id}\`);
      throw new TaskNotFoundException(id);
    }

    await this.write.deleteAsync(id);
    logger.info(\`Task deleted successfully: \${id}\`);
  }
}
```

---

## INFRASTRUCTURE - MONGODB MODELS

### src/infrastructure/models/User.model.ts
```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [50, 'Username cannot exceed 50 characters'],
      trim: true
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required']
    }
  },
  { timestamps: true }
);

UserSchema.index({ username: 1 });

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
```

### src/infrastructure/models/Task.model.ts
```typescript
import mongoose, { Schema, Document } from 'mongoose';
import { Priority } from '../../core/entities/Priority';
import { Status } from '../../core/entities/Status';

export interface ITaskDocument extends Document {
  title: string;
  description?: string;
  dueDate?: Date;
  priority: Priority;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
      trim: true
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      trim: true
    },
    dueDate: { type: Date, default: null },
    priority: {
      type: String,
      enum: Object.values(Priority),
      default: Priority.Medium
    },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.Pending
    }
  },
  { timestamps: true }
);

TaskSchema.index({ status: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ dueDate: 1 });

export const TaskModel = mongoose.model<ITaskDocument>('Task', TaskSchema);
```

---

## Continue with SETUP.md for remaining files...

