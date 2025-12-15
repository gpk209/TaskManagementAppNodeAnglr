# Task Management API - Node.js

A RESTful API built with Node.js, TypeScript, Express, and MongoDB following Clean Architecture principles.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Features](#features)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Services](#services)
- [Configuration](#configuration)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Deployment](#deployment)

---

## Overview

This Node.js API provides backend services for a task management application. It implements Clean Architecture with clear separation of concerns, making it maintainable, testable, and scalable.

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | >= 18.0.0 | Runtime environment |
| TypeScript | 5.3.3 | Programming language |
| Express | 4.18.2 | Web framework |
| MongoDB | - | Database |
| Mongoose | 8.1.1 | MongoDB ODM |
| JWT | 9.0.2 | Authentication |
| bcryptjs | 2.4.3 | Password hashing |
| Winston | 3.11.0 | Logging |
| Jest | 29.7.0 | Testing framework |
| express-validator | 7.0.1 | Input validation |

---

## Architecture

This project follows **Clean Architecture** principles:

```
┌────────────────────────────────────────────────────────────┐
│                      API Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │  Controllers │  │    Routes    │  │    Middleware    │ │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘ │
├─────────┴─────────────────┴───────────────────┴────────────┤
│                    Services Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ AuthService  │  │ TaskService  │  │  TokenService    │ │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘ │
├─────────┴─────────────────┴───────────────────┴────────────┤
│                     Core Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │   Entities   │  │  Interfaces  │  │    Exceptions    │ │
│  └──────────────┘  └──────────────┘  └──────────────────┘ │
├────────────────────────────────────────────────────────────┤
│                 Infrastructure Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ Repositories │  │   Database   │  │     Models       │ │
│  └──────────────┘  └──────────────┘  └──────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Responsibility |
|-------|----------------|
| **API** | HTTP handling, request/response, validation |
| **Services** | Business logic, orchestration |
| **Core** | Entities, interfaces, domain rules |
| **Infrastructure** | Database, external services, repositories |

---

## Project Structure

```
TaskManagementAPI-Node/
├── src/
│   ├── api/
│   │   ├── controllers/
│   │   │   ├── AuthController.ts      # Auth endpoints handler
│   │   │   └── TaskController.ts      # Task endpoints handler
│   │   ├── middleware/                # Custom middleware
│   │   └── routes/
│   │       ├── auth.routes.ts         # /api/auth routes
│   │       └── task.routes.ts         # /api/tasks routes
│   │
│   ├── core/
│   │   ├── entities/
│   │   │   ├── AppUser.ts             # User entity
│   │   │   ├── TaskItem.ts            # Task entity
│   │   │   ├── Priority.ts            # Priority enum
│   │   │   └── Status.ts              # Status enum
│   │   └── interfaces/
│   │       ├── ITaskReadRepository.ts
│   │       ├── ITaskWriteRepository.ts
│   │       └── IUserRepository.ts
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   └── mongoose.config.ts     # MongoDB connection
│   │   ├── models/
│   │   │   ├── Task.model.ts          # Mongoose Task schema
│   │   │   └── User.model.ts          # Mongoose User schema
│   │   └── repositories/
│   │       ├── TaskReadRepository.ts
│   │       ├── TaskWriteRepository.ts
│   │       └── UserRepository.ts
│   │
│   ├── services/
│   │   ├── implementations/
│   │   │   ├── AuthService.ts         # Authentication logic
│   │   │   ├── JwtTokenService.ts     # JWT generation/verification
│   │   │   ├── PasswordHasher.ts      # Password hashing
│   │   │   └── TaskService.ts         # Task business logic
│   │   ├── interfaces/
│   │   │   ├── IAuthService.ts
│   │   │   ├── IPasswordHasher.ts
│   │   │   ├── ITaskService.ts
│   │   │   └── ITokenService.ts
│   │   └── exceptions/
│   │       ├── TaskNotFoundException.ts
│   │       └── UsernameTakenException.ts
│   │
│   ├── shared/
│   │   ├── config.ts                  # Configuration management
│   │   └── logger.ts                  # Winston logger setup
│   │
│   └── server.ts                      # Application entry point
│
├── tests/
│   └── unit/
│       └── services/                  # Unit tests
│
├── logs/                              # Application logs
├── Postman/                           # API collection
│   └── TaskManagementAPI.postman_collection.json
│
├── package.json
├── tsconfig.json
├── .env                               # Environment variables
└── README.md
```

---

## Features

### Authentication
- ✅ User Registration with password hashing
- ✅ User Login with JWT tokens
- ✅ Token-based authentication middleware
- ✅ Secure password storage (bcrypt)

### Task Management
- ✅ Create tasks with title, description, priority, status, due date
- ✅ Read all tasks (filtered by user)
- ✅ Read single task by ID
- ✅ Update task properties
- ✅ Delete tasks
- ✅ User-specific task isolation

### API Features
- ✅ RESTful API design
- ✅ Input validation (express-validator)
- ✅ Error handling middleware
- ✅ Request logging (Winston)
- ✅ CORS support
- ✅ Health check endpoint

---

## API Endpoints

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health status |

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| POST | `/api/auth/refresh` | Refresh access token | 🍪 (Cookie) |
| POST | `/api/auth/logout` | Logout user | 🍪 (Cookie) |

### Tasks
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/tasks` | Get all user tasks | ✅ |
| GET | `/api/tasks/:id` | Get task by ID | ✅ |
| POST | `/api/tasks` | Create new task | ✅ |
| PUT | `/api/tasks/:id` | Update task | ✅ |
| DELETE | `/api/tasks/:id` | Delete task | ✅ |

---

## Authentication Flow

This API implements a **Memory + Refresh Token** authentication pattern:

### Token Types
| Token | Storage | Lifetime | Purpose |
|-------|---------|----------|---------|
| **Access Token** | Memory (client) | 15 minutes | API authorization |
| **Refresh Token** | HTTP-only Cookie | 7 days | Session persistence |

### Flow Diagram
```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│  User   │                    │ Client  │                    │  API    │
└────┬────┘                    └────┬────┘                    └────┬────┘
     │   Login credentials          │                              │
     │ ────────────────────────────>│                              │
     │                              │  POST /auth/login            │
     │                              │ ────────────────────────────>│
     │                              │                              │
     │                              │  Access token + Cookie       │
     │                              │ <────────────────────────────│
     │                              │                              │
     │   [Token in memory]          │                              │
     │                              │                              │
     │   Make API request           │                              │
     │ ────────────────────────────>│                              │
     │                              │  GET /api/tasks              │
     │                              │  (Bearer token)              │
     │                              │ ────────────────────────────>│
     │                              │                              │
     │                              │  Task data                   │
     │                              │ <────────────────────────────│
     │   [Data displayed]           │                              │
     │ <────────────────────────────│                              │
     │                              │                              │
     │   [Access token expires]     │                              │
     │   Make API request           │                              │
     │ ────────────────────────────>│                              │
     │                              │  401 Unauthorized            │
     │                              │ <────────────────────────────│
     │                              │                              │
     │                              │  POST /auth/refresh          │
     │                              │  (Cookie auto-sent)          │
     │                              │ ────────────────────────────>│
     │                              │                              │
     │                              │  New access token + Cookie   │
     │                              │ <────────────────────────────│
     │                              │                              │
     │                              │  Retry original request      │
     │                              │ ────────────────────────────>│
     │                              │                              │
     │   [Request succeeds]         │                              │
     │ <────────────────────────────│                              │
└────┴────┘                    └────┴────┘                    └────┴────┘
```

### Security Benefits
1. **XSS Protection**: Access token in memory cannot be stolen by XSS attacks
2. **CSRF Protection**: HTTP-only cookie with SameSite=Lax prevents CSRF
3. **Short-lived tokens**: 15-minute access tokens limit exposure window
4. **Token rotation**: Refresh tokens are rotated on each use

---

## Request/Response Examples

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
    "username": "johndoe",
    "password": "securePassword123"
}
```

**Response (200):**
```json
{
    "message": "User registered successfully"
}
```

### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
    "username": "johndoe",
    "password": "securePassword123"
}
```

**Response (200):**
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "username": "johndoe"
}
```
*Note: Also sets `refreshToken` HTTP-only cookie*

### Refresh Token
```http
POST /api/auth/refresh
Cookie: refreshToken=<refresh_token>
```

**Response (200):**
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
*Note: Also sets new `refreshToken` HTTP-only cookie (token rotation)*

### Logout
```http
POST /api/auth/logout
Cookie: refreshToken=<refresh_token>
```

**Response (200):**
```json
{
    "message": "Logged out successfully"
}
```
*Note: Clears the `refreshToken` cookie*

### Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
    "title": "Complete project documentation",
    "description": "Write README and API docs",
    "priority": "High",
    "status": "Pending",
    "dueDate": "2025-12-25T00:00:00.000Z"
}
```

**Response (201):**
```json
{
    "_id": "6570abc123def456",
    "id": "6570abc123def456",
    "title": "Complete project documentation",
    "description": "Write README and API docs",
    "priority": "High",
    "status": "Pending",
    "dueDate": "2025-12-25T00:00:00.000Z",
    "userId": "user123",
    "createdAt": "2025-12-13T00:00:00.000Z",
    "updatedAt": "2025-12-13T00:00:00.000Z"
}
```

### Get All Tasks
```http
GET /api/tasks
Authorization: Bearer <token>
```

**Response (200):**
```json
[
    {
        "_id": "6570abc123def456",
        "id": "6570abc123def456",
        "title": "Complete project documentation",
        "description": "Write README and API docs",
        "priority": "High",
        "status": "Pending",
        "dueDate": "2025-12-25T00:00:00.000Z",
        "userId": "user123",
        "createdAt": "2025-12-13T00:00:00.000Z",
        "updatedAt": "2025-12-13T00:00:00.000Z"
    }
]
```

---

## Data Models

### AppUser Entity
```typescript
interface AppUser {
    id?: string;
    username: string;
    passwordHash: string;
    createdAt?: Date;
    updatedAt?: Date;
}
```

### TaskItem Entity
```typescript
interface TaskItem {
    id?: string;
    title: string;
    description?: string;
    dueDate?: Date;
    priority: Priority;    // 'Low' | 'Medium' | 'High'
    status: Status;        // 'Pending' | 'Completed'
    userId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
```

### Enums
```typescript
// Priority
enum Priority {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High'
}

// Status
enum Status {
    Pending = 'Pending',
    Completed = 'Completed'
}
```

---

## Services

### AuthService
Handles user authentication operations.

```typescript
interface IAuthService {
    register(username: string, password: string): Promise<AuthResult>;
    login(username: string, password: string): Promise<AuthResult>;
}
```

### TaskService
Handles task business logic.

```typescript
interface ITaskService {
    getAllByUser(userId: string): Promise<TaskItem[]>;
    getById(id: string, userId: string): Promise<TaskItem | null>;
    create(task: TaskItem, userId: string): Promise<TaskItem>;
    update(id: string, task: Partial<TaskItem>, userId: string): Promise<TaskItem | null>;
    delete(id: string, userId: string): Promise<boolean>;
}
```

### TokenService
Handles JWT token operations.

```typescript
interface ITokenService {
    generateToken(userId: string, username: string): string;
    verifyToken(token: string): TokenPayload | null;
}
```

### PasswordHasher
Handles password hashing and verification.

```typescript
interface IPasswordHasher {
    hash(password: string): Promise<string>;
    compare(password: string, hash: string): Promise<boolean>;
}
```

---

## Configuration

### Environment Variables (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/taskmanagement

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Logging
LOG_LEVEL=debug

# CORS
CORS_ORIGIN=http://localhost:4200
```

### Configuration Object (config.ts)
```typescript
export const config = {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanagement',
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    logLevel: process.env.LOG_LEVEL || 'debug',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4200'
};
```

---

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (local or cloud)

### Installation

```powershell
# Navigate to API directory
cd TaskManagementAPI-Node

# Install dependencies
npm install

# Create .env file (copy from .env.example)
copy .env.example .env

# Edit .env with your configuration
notepad .env
```

### Running the Server

```powershell
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

### Server URLs
```
API:     http://localhost:5000/api
Health:  http://localhost:5000/health
```

---

## Validation Rules

### Auth Validation
| Field | Rules |
|-------|-------|
| username | Required, 3-50 characters |
| password | Required, minimum 6 characters |

### Task Validation
| Field | Rules |
|-------|-------|
| title | Required, max 150 characters |
| description | Optional, max 1000 characters |
| priority | Optional, must be: Low, Medium, High |
| status | Optional, must be: Pending, Completed |
| dueDate | Optional, valid ISO8601 date |

---

## Testing

### Run Tests
```powershell
# Run all tests
npm test

# Run tests with watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
```
tests/
└── unit/
    └── services/
        ├── AuthService.test.ts
        └── TaskService.test.ts
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run production server |
| `npm test` | Run tests with coverage |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | TypeScript type checking |

---

## Error Handling

### Error Response Format
```json
{
    "error": "Error type",
    "message": "Detailed error message",
    "details": []  // Validation errors
}
```

### HTTP Status Codes
| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 500 | Internal Server Error |

---

## Logging

Logs are managed by Winston and stored in the `logs/` directory.

### Log Levels
- `error` - Error messages
- `warn` - Warning messages
- `info` - Informational messages
- `debug` - Debug messages

### Log Files
```
logs/
├── error.log    # Error-level logs only
└── combined.log # All logs
```

---

## Deployment

### Build for Production
```powershell
npm run build
```

### Production Environment Variables
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-very-secure-production-secret
CORS_ORIGIN=https://your-frontend-domain.com
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

---

## Postman Collection

Import the Postman collection from:
```
Postman/TaskManagementAPI.postman_collection.json
```

Features:
- Pre-configured environment variables
- Auto-save JWT token after login
- All endpoints with sample requests
- Test scripts for validation

---

## Design Principles

This project implements several software design principles and patterns to ensure maintainability, testability, and scalability.

---

### 1. Clean Architecture

The project follows **Clean Architecture** (Robert C. Martin) with clear layer separation:

```
┌─────────────────────────────────────────────────────┐
│                   API Layer                         │
│         (Controllers, Routes, Middleware)           │
├─────────────────────────────────────────────────────┤
│                 Services Layer                      │
│    (AuthService, TaskService, TokenService)         │
├─────────────────────────────────────────────────────┤
│                   Core Layer                        │
│        (Entities, Interfaces, Exceptions)           │
├─────────────────────────────────────────────────────┤
│              Infrastructure Layer                   │
│      (Repositories, Database, Mongoose Models)      │
└─────────────────────────────────────────────────────┘
```

**Key Principle:** Dependencies point inward - outer layers depend on inner layers, not vice versa.

| Layer | Responsibility | Dependencies |
|-------|----------------|--------------|
| API | HTTP handling, validation | Services |
| Services | Business logic | Core |
| Core | Entities, interfaces | None |
| Infrastructure | Database, external services | Core |

---

### 2. SOLID Principles

#### **S - Single Responsibility Principle (SRP)**
Each class has one reason to change:

| Class | Single Responsibility |
|-------|----------------------|
| `AuthController` | Handle HTTP auth requests only |
| `AuthService` | Authentication business logic only |
| `PasswordHasher` | Password hashing operations only |
| `JwtTokenService` | JWT token operations only |
| `TaskReadRepository` | Read task data only |
| `TaskWriteRepository` | Write task data only |
| `UserRepository` | User data persistence only |

#### **O - Open/Closed Principle (OCP)**
Classes are open for extension, closed for modification:

```typescript
// New authentication methods can be added by implementing IAuthService
// without modifying existing code
interface IAuthService {
    register(username: string, password: string): Promise<AuthResult>;
    login(username: string, password: string): Promise<AuthResult>;
}

// Example: Could add OAuth, LDAP implementations without changing AuthController
class OAuthService implements IAuthService { ... }
class LdapAuthService implements IAuthService { ... }
```

#### **L - Liskov Substitution Principle (LSP)**
Subtypes are substitutable for their base types:

```typescript
// Any ITaskService implementation can replace TaskService
const taskService: ITaskService = new TaskService(...);
const taskService: ITaskService = new MockTaskService(...); // For testing
```

#### **I - Interface Segregation Principle (ISP)**
Clients shouldn't depend on interfaces they don't use:

```typescript
// Separate interfaces for reading vs writing tasks
interface ITaskReadRepository {
    findAll(userId: string): Promise<TaskItem[]>;
    findById(id: string): Promise<TaskItem | null>;
}

interface ITaskWriteRepository {
    create(task: TaskItem): Promise<TaskItem>;
    update(id: string, task: Partial<TaskItem>): Promise<TaskItem | null>;
    delete(id: string): Promise<boolean>;
}

// A read-only service only needs ITaskReadRepository
// A full CRUD service can use both interfaces
```

#### **D - Dependency Inversion Principle (DIP)**
High-level modules don't depend on low-level modules; both depend on abstractions:

```typescript
// AuthService depends on abstractions (interfaces), not concrete implementations
class AuthService implements IAuthService {
    constructor(
        private userRepository: IUserRepository,      // Interface, not UserRepository
        private passwordHasher: IPasswordHasher,      // Interface, not PasswordHasher
        private tokenService: ITokenService           // Interface, not JwtTokenService
    ) {}
}

// Benefits:
// - Easy to swap implementations
// - Easy to mock for testing
// - Loose coupling between components
```

---

### 3. Dependency Injection (DI)

Dependencies are injected via constructor, not created internally:

```typescript
// server.ts - Composition Root (where all dependencies are wired)

// 1. Create concrete implementations
const userRepository = new UserRepository();
const taskReadRepository = new TaskReadRepository();
const taskWriteRepository = new TaskWriteRepository();
const passwordHasher = new PasswordHasher();
const tokenService = new JwtTokenService();

// 2. Inject dependencies into services
const authService = new AuthService(userRepository, passwordHasher, tokenService);
const taskService = new TaskService(taskReadRepository, taskWriteRepository);

// 3. Inject services into controllers
const authController = new AuthController(authService);
const taskController = new TaskController(taskService);
```

**Benefits:**
- **Testability**: Easy to inject mock dependencies for unit testing
- **Loose Coupling**: Components don't create their dependencies
- **Single Composition Root**: All wiring happens in one place (`server.ts`)
- **Flexibility**: Can swap implementations without changing consuming code

---

### 4. Repository Pattern

Data access is abstracted through repositories, separating business logic from data persistence:

```typescript
// Interface defines the contract (what operations are available)
interface IUserRepository {
    findByUsername(username: string): Promise<AppUser | null>;
    create(user: AppUser): Promise<AppUser>;
}

// Implementation handles MongoDB-specific details
class UserRepository implements IUserRepository {
    async findByUsername(username: string): Promise<AppUser | null> {
        const user = await UserModel.findOne({ username });
        return user ? this.mapToEntity(user) : null;
    }

    async create(user: AppUser): Promise<AppUser> {
        const newUser = await UserModel.create(user);
        return this.mapToEntity(newUser);
    }

    private mapToEntity(doc: any): AppUser {
        return {
            id: doc._id.toString(),
            username: doc.username,
            passwordHash: doc.passwordHash,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        };
    }
}
```

**Benefits:**
- Database can be swapped (MongoDB → PostgreSQL) without changing business logic
- Easier unit testing with mock repositories
- Centralized data access logic
- Consistent data mapping

---

### 5. CQRS-Lite (Command Query Responsibility Segregation)

Separate read and write operations into different repositories:

```
┌─────────────────────────────────────────────────────────┐
│                    TaskService                          │
├────────────────────────┬────────────────────────────────┤
│   TaskReadRepository   │    TaskWriteRepository         │
│   (Queries)            │    (Commands)                  │
├────────────────────────┼────────────────────────────────┤
│   findAll()            │    create()                    │
│   findById()           │    update()                    │
│                        │    delete()                    │
└────────────────────────┴────────────────────────────────┘
```

**Benefits:**
- Can optimize reads and writes separately
- Clearer intent in code (reading vs. modifying)
- Can scale read and write operations independently
- Easier to add caching for read operations

---

### 6. Separation of Concerns

Each layer/module has a distinct responsibility:

| Component | Concern |
|-----------|---------|
| **Routes** | URL mapping, HTTP methods, validation rules |
| **Middleware** | Cross-cutting concerns (auth, logging, errors) |
| **Controllers** | HTTP request/response handling, status codes |
| **Services** | Business logic, orchestration, rules |
| **Repositories** | Data persistence, database queries |
| **Models** | Database schema definition (Mongoose) |
| **Entities** | Domain objects, business data structures |
| **Interfaces** | Contracts, abstractions |

---

### 7. Domain-Driven Design (DDD) Elements

#### Entities
Rich domain objects with identity:

```typescript
interface TaskItem {
    id?: string;           // Identity
    title: string;
    description?: string;
    priority: Priority;
    status: Status;
    dueDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
```

#### Value Objects (Enums)
Objects defined by their attributes, not identity:

```typescript
enum Priority {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High'
}

enum Status {
    Pending = 'Pending',
    Completed = 'Completed'
}
```

#### Domain Exceptions
Business-specific error types:

```typescript
class TaskNotFoundException extends Error {
    constructor(taskId: string) {
        super(`Task with ID ${taskId} not found`);
        this.name = 'TaskNotFoundException';
    }
}

class UsernameTakenException extends Error {
    constructor(username: string) {
        super(`Username '${username}' is already taken`);
        this.name = 'UsernameTakenException';
    }
}
```

---

### 8. Middleware Pattern

Cross-cutting concerns handled via Express middleware chain:

```typescript
// Authentication Middleware
const authMiddleware = (tokenService: ITokenService) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = tokenService.verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        (req as any).user = decoded;
        next();  // Pass to next middleware/controller
    };
};

// Validation Middleware
const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    next();
};

// Usage in routes (middleware chain)
router.post('/', 
    authMiddleware(tokenService),   // 1. Check auth
    taskValidationRules,            // 2. Define validation
    validate,                       // 3. Execute validation
    taskController.create           // 4. Handle request
);
```

---

### 9. Factory Pattern

Route factories create configured routers with injected dependencies:

```typescript
// Factory function creates and configures router
export const createAuthRoutes = (authController: AuthController): Router => {
    const router = Router();
    
    router.post('/login', authValidationRules, validate, authController.login);
    router.post('/register', authValidationRules, validate, authController.register);
    
    return router;
};

export const createTaskRoutes = (
    taskController: TaskController,
    tokenService: ITokenService
): Router => {
    const router = Router();
    
    // Apply auth middleware to all routes
    router.use(authMiddleware(tokenService));
    
    router.get('/', taskController.getAll);
    router.get('/:id', taskController.getById);
    router.post('/', taskValidationRules, validate, taskController.create);
    router.put('/:id', taskValidationRules, validate, taskController.update);
    router.delete('/:id', taskController.delete);
    
    return router;
};

// Usage in server.ts
app.use('/api/auth', createAuthRoutes(authController));
app.use('/api/tasks', createTaskRoutes(taskController, tokenService));
```

**Benefits:**
- Routes receive their dependencies explicitly
- Easy to test route configuration
- Clear separation between route definition and dependency wiring

---

### 10. Configuration Management

Centralized configuration with validation:

```typescript
// shared/config.ts
export const config = {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanagement',
    jwtSecret: process.env.JWT_SECRET || 'default-dev-secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    logLevel: process.env.LOG_LEVEL || 'debug',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4200'
};

// Fail-fast validation
export const validateConfig = (): void => {
    const errors: string[] = [];
    
    if (config.nodeEnv === 'production') {
        if (config.jwtSecret === 'default-dev-secret') {
            errors.push('JWT_SECRET must be set in production');
        }
        if (!config.mongoUri.includes('mongodb+srv')) {
            errors.push('Use MongoDB Atlas in production');
        }
    }
    
    if (errors.length > 0) {
        throw new Error(`Configuration errors:\n${errors.join('\n')}`);
    }
};
```

---

### Design Principles Summary

| Principle | Where Applied | Benefit |
|-----------|---------------|---------|
| Clean Architecture | Layer structure | Maintainability, testability |
| SRP | One class = one job | Easy to understand and modify |
| OCP | Interfaces for extension | Add features without breaking code |
| LSP | Interface implementations | Swappable implementations |
| ISP | Read/Write repositories | Focused, minimal interfaces |
| DIP | Constructor injection | Loose coupling, testability |
| Dependency Injection | server.ts composition | Single wiring point |
| Repository Pattern | Data access abstraction | Database independence |
| CQRS-Lite | Read/Write separation | Optimizable operations |
| Middleware Pattern | Cross-cutting concerns | Reusable request processing |
| Factory Pattern | Route creation | Configurable routing |
| DDD Elements | Entities, Value Objects | Rich domain model |

---

These principles make the codebase:
- ✅ **Testable** - Easy to mock dependencies for unit tests
- ✅ **Maintainable** - Changes isolated to specific layers/modules
- ✅ **Scalable** - New features don't affect existing code
- ✅ **Readable** - Clear separation of concerns
- ✅ **Flexible** - Easy to swap implementations

---

## License

MIT License

---

## Author

PraveenKumar
