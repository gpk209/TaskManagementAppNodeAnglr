# Task Management Application - Architecture & Flow Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Overview](#architecture-overview)
4. [Project Structure](#project-structure)
5. [Authentication Flow](#authentication-flow)
6. [Request Flow Example](#request-flow-example)
7. [Data Flow Diagrams](#data-flow-diagrams)
8. [Security Architecture](#security-architecture)
9. [API Endpoints](#api-endpoints)

---

## Project Overview

The Task Management Application is a full-stack web application that allows users to:
- Register and authenticate securely
- Create, read, update, and delete tasks
- Filter and sort tasks by priority, status, and due date
- Maintain session persistence across browser refreshes

---

## Technology Stack

### Frontend (ClientApp)
| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 17.x | Frontend framework |
| TypeScript | 5.2.x | Type-safe JavaScript |
| Bootstrap | 5.3.x | UI styling |
| ng-bootstrap | 16.x | Angular Bootstrap components |
| RxJS | 7.8.x | Reactive programming |
| ng-particles | 3.12.x | Background animations |

### Backend (TaskManagementAPI-Node)
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18.x+ | Runtime environment |
| Express.js | 4.x | Web framework |
| TypeScript | 5.x | Type-safe JavaScript |
| MongoDB | 6.x | Database |
| Mongoose | 8.x | MongoDB ODM |
| JWT | - | Authentication tokens |
| bcrypt | - | Password hashing |
| express-validator | - | Input validation |
| cookie-parser | - | Cookie handling |
| Winston | - | Logging |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              TASK MANAGEMENT APPLICATION                             │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                           FRONTEND (Angular 17)                               │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   │
│  │  │ Components  │  │  Services   │  │Interceptors │  │      Models         │  │   │
│  │  │             │  │             │  │             │  │                     │  │   │
│  │  │ • NavComp   │  │ • Account   │  │ • Auth      │  │ • User              │  │   │
│  │  │ • HomeComp  │  │ • Task      │  │ • Error     │  │ • TodoItem          │  │   │
│  │  │ • ListComp  │  │ • Token     │  │             │  │                     │  │   │
│  │  │ • Register  │  │ • Session   │  │             │  │                     │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                         │                                            │
│                                         │ HTTP (REST API)                            │
│                                         │ + Cookies (Refresh Token)                  │
│                                         ▼                                            │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                        BACKEND (Node.js + Express)                            │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   │
│  │  │    API      │  │  Services   │  │   Core      │  │   Infrastructure    │  │   │
│  │  │  (Routes)   │  │             │  │ (Entities)  │  │   (Repositories)    │  │   │
│  │  │             │  │             │  │             │  │                     │  │   │
│  │  │ • Auth      │  │ • Auth      │  │ • AppUser   │  │ • UserRepository    │  │   │
│  │  │ • Tasks     │  │ • Task      │  │ • TaskItem  │  │ • TaskReadRepo      │  │   │
│  │  │             │  │ • JWT       │  │ • Priority  │  │ • TaskWriteRepo     │  │   │
│  │  │             │  │ • Password  │  │ • Status    │  │                     │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                         │                                            │
│                                         │ Mongoose ODM                               │
│                                         ▼                                            │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                              DATABASE (MongoDB)                               │   │
│  │                                                                               │   │
│  │                    ┌─────────────┐    ┌─────────────┐                        │   │
│  │                    │   Users     │    │    Tasks    │                        │   │
│  │                    │ Collection  │    │ Collection  │                        │   │
│  │                    └─────────────┘    └─────────────┘                        │   │
│  │                                                                               │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

### Frontend Structure (ClientApp)

```
ClientApp/
├── src/
│   ├── app/
│   │   ├── components/                 # UI Components
│   │   │   ├── home/                   # Landing page (login prompt)
│   │   │   │   ├── home.component.ts
│   │   │   │   ├── home.component.html
│   │   │   │   └── home.component.css
│   │   │   ├── nav/                    # Navigation bar with login form
│   │   │   │   ├── nav.component.ts
│   │   │   │   ├── nav.component.html
│   │   │   │   └── nav.component.css
│   │   │   ├── list/                   # Task list (CRUD operations)
│   │   │   │   ├── list.component.ts
│   │   │   │   ├── list.component.html
│   │   │   │   └── list.component.css
│   │   │   ├── register/               # User registration form
│   │   │   │   ├── register.component.ts
│   │   │   │   ├── register.component.html
│   │   │   │   └── register.component.css
│   │   │   └── session-expired-modal/  # Session expiry notification
│   │   │       └── session-expired-modal.component.ts
│   │   │
│   │   ├── services/                   # Business Logic Services
│   │   │   ├── accountService.ts       # Authentication & user management
│   │   │   ├── taskservice.ts          # Task CRUD operations
│   │   │   ├── token.service.ts        # Token storage (memory)
│   │   │   └── session.service.ts      # Session event management
│   │   │
│   │   ├── interceptors/               # HTTP Interceptors
│   │   │   ├── auth.interceptor.ts     # Attach token & handle 401
│   │   │   └── error.interceptor.ts    # Global error handling
│   │   │
│   │   ├── models/                     # TypeScript Interfaces
│   │   │   ├── user.ts                 # User model
│   │   │   └── todoitem.ts             # Task model
│   │   │
│   │   ├── app.component.ts            # Root component
│   │   ├── app.component.html
│   │   ├── app.config.ts               # App configuration
│   │   └── app.routes.ts               # Routing configuration
│   │
│   ├── environments/                   # Environment configs
│   │   ├── environment.ts              # Production
│   │   └── environment.development.ts  # Development
│   │
│   ├── index.html                      # Entry HTML
│   ├── main.ts                         # Bootstrap
│   └── styles.css                      # Global styles
│
├── angular.json                        # Angular CLI config
├── package.json                        # Dependencies
└── tsconfig.json                       # TypeScript config
```

### Backend Structure (TaskManagementAPI-Node)

```
TaskManagementAPI-Node/
├── src/
│   ├── api/                            # API Layer (Presentation)
│   │   ├── controllers/
│   │   │   ├── AuthController.ts       # Login, Register, Refresh, Logout
│   │   │   └── TaskController.ts       # Task CRUD operations
│   │   ├── dtos/                       # Data Transfer Objects
│   │   │   ├── auth.dto.ts             # Login/Register request/response DTOs
│   │   │   ├── task.dto.ts             # Task request/response DTOs
│   │   │   ├── common.dto.ts           # Error/Pagination DTOs
│   │   │   └── index.ts                # Central export
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts      # JWT verification
│   │   │   ├── errorHandler.ts         # Global error handler + asyncHandler
│   │   │   └── index.ts                # Central export
│   │   └── routes/
│   │       ├── auth.routes.ts          # /api/auth/* routes
│   │       └── task.routes.ts          # /api/tasks/* routes
│   │
│   ├── services/                       # Business Logic Layer
│   │   ├── interfaces/                 # Service contracts
│   │   │   ├── IAuthService.ts
│   │   │   ├── ITaskService.ts
│   │   │   ├── ITokenService.ts
│   │   │   └── IPasswordHasher.ts
│   │   ├── implementations/            # Service implementations
│   │   │   ├── AuthService.ts          # Authentication logic
│   │   │   ├── TaskService.ts          # Task business logic
│   │   │   ├── JwtTokenService.ts      # JWT token generation
│   │   │   └── PasswordHasher.ts       # bcrypt hashing
│   │   └── exceptions/                 # Exception hierarchy
│   │       ├── BaseException.ts        # Base class with status codes
│   │       ├── TaskNotFoundException.ts  # Extends NotFoundException
│   │       ├── UsernameTakenException.ts # Extends ConflictException
│   │       └── index.ts                # Central export
│   │
│   ├── core/                           # Domain Layer
│   │   ├── entities/                   # Domain models
│   │   │   ├── AppUser.ts              # User entity
│   │   │   ├── TaskItem.ts             # Task entity
│   │   │   ├── Priority.ts             # Priority enum
│   │   │   └── Status.ts               # Status enum
│   │   └── interfaces/                 # Repository contracts
│   │       ├── IUserRepository.ts
│   │       ├── ITaskReadRepository.ts
│   │       └── ITaskWriteRepository.ts
│   │
│   ├── infrastructure/                 # Data Access Layer
│   │   ├── database/
│   │   │   └── mongoose.config.ts      # MongoDB connection
│   │   ├── models/                     # Mongoose schemas
│   │   │   ├── User.model.ts
│   │   │   └── Task.model.ts
│   │   └── repositories/               # Repository implementations
│   │       ├── UserRepository.ts
│   │       ├── TaskReadRepository.ts
│   │       └── TaskWriteRepository.ts
│   │
│   ├── shared/                         # Shared utilities
│   │   ├── config.ts                   # App configuration
│   │   ├── logger.ts                   # Winston logger
│   │   └── validateEnv.ts              # Environment validation
│   │
│   └── server.ts                       # Application entry point
│
├── tests/                              # Test files
│   └── unit/
│       └── services/                   # Service unit tests
│           ├── AuthService.test.ts
│           ├── TaskService.test.ts
│           ├── JwtTokenService.test.ts
│           ├── PasswordHasher.test.ts
│           └── BaseException.test.ts
│
├── dist/                               # Compiled JavaScript
├── logs/                               # Application logs
├── coverage/                           # Test coverage reports
├── Postman/                            # API collection
│   └── TaskManagementAPI.postman_collection.json
├── jest.config.js                      # Jest configuration
├── package.json                        # Dependencies
└── tsconfig.json                       # TypeScript config
```

---

## Authentication Flow

### Token-Based Authentication (Memory + HTTP-only Cookie)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION ARCHITECTURE                                  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                              TWO TOKEN SYSTEM                                  │  │
│  ├───────────────────────────────────────────────────────────────────────────────┤  │
│  │                                                                                │  │
│  │   ACCESS TOKEN                        REFRESH TOKEN                           │  │
│  │   ════════════                        ═════════════                           │  │
│  │                                                                                │  │
│  │   • Short-lived (3-15 min)            • Long-lived (7-30 days)                │  │
│  │   • Stored in: Browser Memory         • Stored in: HTTP-only Cookie           │  │
│  │   • Sent via: Authorization Header    • Sent via: Cookie (automatic)          │  │
│  │   • Contains: userId, username        • Contains: userId only                 │  │
│  │   • If stolen: Limited damage         • If stolen: Can be revoked             │  │
│  │   • Lost on page refresh: YES         • Lost on page refresh: NO              │  │
│  │                                                                                │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                              LOGIN FLOW                                        │  │
│  ├───────────────────────────────────────────────────────────────────────────────┤  │
│  │                                                                                │  │
│  │   Browser                        Angular                         Node.js API  │  │
│  │      │                              │                                │        │  │
│  │      │  1. Enter credentials        │                                │        │  │
│  │      │─────────────────────────────►│                                │        │  │
│  │      │                              │                                │        │  │
│  │      │                              │  2. POST /api/auth/login       │        │  │
│  │      │                              │  {username, password}          │        │  │
│  │      │                              │───────────────────────────────►│        │  │
│  │      │                              │                                │        │  │
│  │      │                              │                    3. Validate credentials│
│  │      │                              │                    4. Generate tokens     │
│  │      │                              │                                │        │  │
│  │      │                              │  5. Response:                  │        │  │
│  │      │                              │  Body: {token, username}       │        │  │
│  │      │                              │  Cookie: refreshToken=xyz      │        │  │
│  │      │                              │◄───────────────────────────────│        │  │
│  │      │                              │                                │        │  │
│  │      │                              │  6. Store access token in      │        │  │
│  │      │                              │     memory (TokenService)      │        │  │
│  │      │                              │  7. Store username in          │        │  │
│  │      │                              │     localStorage               │        │  │
│  │      │                              │                                │        │  │
│  │      │  8. Show task list           │                                │        │  │
│  │      │◄─────────────────────────────│                                │        │  │
│  │      │                              │                                │        │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                           TOKEN REFRESH FLOW                                   │  │
│  ├───────────────────────────────────────────────────────────────────────────────┤  │
│  │                                                                                │  │
│  │   Angular                        Auth Interceptor                 Node.js API │  │
│  │      │                              │                                │        │  │
│  │      │  1. API request fails        │                                │        │  │
│  │      │     with 401                 │                                │        │  │
│  │      │─────────────────────────────►│                                │        │  │
│  │      │                              │                                │        │  │
│  │      │                              │  2. POST /api/auth/refresh     │        │  │
│  │      │                              │  Cookie: refreshToken=xyz      │        │  │
│  │      │                              │───────────────────────────────►│        │  │
│  │      │                              │                                │        │  │
│  │      │                              │                    3. Verify refresh token│
│  │      │                              │                    4. Generate new tokens │
│  │      │                              │                                │        │  │
│  │      │                              │  5. Response:                  │        │  │
│  │      │                              │  Body: {token}                 │        │  │
│  │      │                              │  Cookie: new refreshToken      │        │  │
│  │      │                              │◄───────────────────────────────│        │  │
│  │      │                              │                                │        │  │
│  │      │                              │  6. Store new access token     │        │  │
│  │      │                              │  7. Retry original request     │        │  │
│  │      │                              │───────────────────────────────►│        │  │
│  │      │                              │                                │        │  │
│  │      │  8. Request succeeds         │                                │        │  │
│  │      │◄─────────────────────────────│                                │        │  │
│  │      │                              │                                │        │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Session Persistence on Page Refresh

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        PAGE REFRESH - SESSION RESTORATION                            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   User refreshes page (F5)                                                          │
│          │                                                                           │
│          ▼                                                                           │
│   ┌──────────────────────────────────────────────────────────────────────────────┐  │
│   │  AppComponent.ngOnInit()                                                      │  │
│   │       │                                                                       │  │
│   │       ▼                                                                       │  │
│   │  AccountService.initializeAuth()                                              │  │
│   │       │                                                                       │  │
│   │       ▼                                                                       │  │
│   │  Check localStorage for username                                              │  │
│   │       │                                                                       │  │
│   │       ├── No username found ──────────► User was not logged in                │  │
│   │       │                                 Show login page                        │  │
│   │       │                                                                       │  │
│   │       └── Username found ─────────────► User was logged in                    │  │
│   │               │                         Try to restore session                │  │
│   │               ▼                                                               │  │
│   │         POST /api/auth/refresh                                                │  │
│   │         (Cookie: refreshToken=xyz)                                            │  │
│   │               │                                                               │  │
│   │               ├── Success ────────────► New access token received             │  │
│   │               │                         Session restored!                      │  │
│   │               │                         Show task list                         │  │
│   │               │                                                               │  │
│   │               └── Failure ────────────► Refresh token expired                 │  │
│   │                                         Clear stored username                  │  │
│   │                                         Show "Session Expired" modal           │  │
│   │                                         Redirect to login                      │  │
│   └──────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Request Flow Example

### Complete Flow: User Creates a New Task

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                    COMPLETE REQUEST FLOW: CREATE TASK                                │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  STEP 1: USER ACTION                                                                │
│  ════════════════════                                                               │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  ListComponent (UI)                                                          │   │
│  │                                                                              │   │
│  │  User fills form:                                                            │   │
│  │  • Title: "Complete documentation"                                           │   │
│  │  • Description: "Write architecture docs"                                    │   │
│  │  • Priority: "High"                                                          │   │
│  │  • Status: "InProgress"                                                      │   │
│  │  • Due Date: "2025-12-15"                                                    │   │
│  │                                                                              │   │
│  │  Clicks "Add Task" button                                                    │   │
│  │       │                                                                      │   │
│  │       ▼                                                                      │   │
│  │  addTask() method called                                                     │   │
│  │                                                                              │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                         │                                            │
│                                         ▼                                            │
│  STEP 2: SERVICE LAYER                                                              │
│  ═════════════════════                                                              │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  TaskService.addTask(task)                                                   │   │
│  │                                                                              │   │
│  │  // Create HTTP request                                                      │   │
│  │  return this.http.post<ToDoItem>(                                            │   │
│  │    'http://localhost:5000/api/tasks',                                        │   │
│  │    {                                                                         │   │
│  │      title: "Complete documentation",                                        │   │
│  │      description: "Write architecture docs",                                 │   │
│  │      priority: 2,        // High                                             │   │
│  │      status: 1,          // InProgress                                       │   │
│  │      dueDate: "2025-12-15T00:00:00.000Z"                                     │   │
│  │    },                                                                        │   │
│  │    { withCredentials: true }                                                 │   │
│  │  );                                                                          │   │
│  │                                                                              │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                         │                                            │
│                                         ▼                                            │
│  STEP 3: AUTH INTERCEPTOR                                                           │
│  ════════════════════════                                                           │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  authInterceptor                                                             │   │
│  │                                                                              │   │
│  │  // Get access token from memory                                             │   │
│  │  const token = tokenService.getAccessToken();                                │   │
│  │  // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."                                │   │
│  │                                                                              │   │
│  │  // Clone request and add Authorization header                               │   │
│  │  const authReq = req.clone({                                                 │   │
│  │    setHeaders: {                                                             │   │
│  │      Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'         │   │
│  │    }                                                                         │   │
│  │  });                                                                         │   │
│  │                                                                              │   │
│  │  // Forward modified request                                                 │   │
│  │  return next(authReq);                                                       │   │
│  │                                                                              │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                         │                                            │
│                                         │  HTTP Request                              │
│                                         │  ════════════                              │
│                                         │  POST /api/tasks                           │
│                                         │  Headers:                                  │
│                                         │    Authorization: Bearer eyJ...            │
│                                         │    Content-Type: application/json          │
│                                         │  Cookies:                                  │
│                                         │    refreshToken=xyz (auto-sent)            │
│                                         │  Body:                                     │
│                                         │    {title, description, ...}               │
│                                         │                                            │
│                                         ▼                                            │
│  ════════════════════════════════════════════════════════════════════════════════   │
│                                   NETWORK                                            │
│  ════════════════════════════════════════════════════════════════════════════════   │
│                                         │                                            │
│                                         ▼                                            │
│  STEP 4: EXPRESS MIDDLEWARE                                                         │
│  ══════════════════════════                                                         │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  server.ts - Middleware Pipeline                                             │   │
│  │                                                                              │   │
│  │  Request enters Express server                                               │   │
│  │       │                                                                      │   │
│  │       ▼                                                                      │   │
│  │  1. cors() - Check origin (http://localhost:4200) ✓                          │   │
│  │       │                                                                      │   │
│  │       ▼                                                                      │   │
│  │  2. cookieParser() - Parse cookies                                           │   │
│  │       │                                                                      │   │
│  │       ▼                                                                      │   │
│  │  3. express.json() - Parse JSON body                                         │   │
│  │       │                                                                      │   │
│  │       ▼                                                                      │   │
│  │  4. Router matches: /api/tasks → taskRoutes                                  │   │
│  │                                                                              │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                         │                                            │
│                                         ▼                                            │
│  STEP 5: ROUTE HANDLER                                                              │
│  ═════════════════════                                                              │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  task.routes.ts                                                              │   │
│  │                                                                              │   │
│  │  router.post('/',                                                            │   │
│  │    authMiddleware,        // Step 5a: Verify JWT                             │   │
│  │    taskValidationRules,   // Step 5b: Validate input                         │   │
│  │    validate,              // Step 5c: Check validation result                │   │
│  │    taskController.create  // Step 5d: Handle request                         │   │
│  │  );                                                                          │   │
│  │                                                                              │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                         │                                            │
│                                         ▼                                            │
│  STEP 5a: AUTH MIDDLEWARE                                                           │
│  ════════════════════════                                                           │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  auth.middleware.ts                                                          │   │
│  │                                                                              │   │
│  │  // Extract token from header                                                │   │
│  │  const authHeader = req.headers.authorization;                               │   │
│  │  // "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."                         │   │
│  │                                                                              │   │
│  │  const token = authHeader.split(' ')[1];                                     │   │
│  │                                                                              │   │
│  │  // Verify JWT signature and expiration                                      │   │
│  │  const payload = jwt.verify(token, config.jwt.secret);                       │   │
│  │  // { id: "507f1f77bcf86cd799439011", username: "john", iat: ..., exp: ... } │   │
│  │                                                                              │   │
│  │  // Attach user info to request                                              │   │
│  │  req.user = { id: payload.id, username: payload.username };                  │   │
│  │                                                                              │   │
│  │  next(); // Continue to next middleware                                      │   │
│  │                                                                              │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                         │                                            │
│                                         ▼                                            │
│  STEP 5b: VALIDATION MIDDLEWARE                                                     │
│  ══════════════════════════════                                                     │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  express-validator                                                           │   │
│  │                                                                              │   │
│  │  Validation rules:                                                           │   │
│  │  • title: required, 1-200 chars ✓                                            │   │
│  │  • description: optional, max 1000 chars ✓                                   │   │
│  │  • priority: must be 0, 1, or 2 ✓                                            │   │
│  │  • status: must be 0, 1, or 2 ✓                                              │   │
│  │  • dueDate: valid ISO date ✓                                                 │   │
│  │                                                                              │   │
│  │  All validations passed → next()                                             │   │
│  │                                                                              │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                         │                                            │
│                                         ▼                                            │
│  STEP 6: CONTROLLER                                                                 │
│  ══════════════════                                                                 │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  TaskController.create(req, res)                                             │   │
│  │                                                                              │   │
│  │  // Extract validated data from request                                      │   │
│  │  const { title, description, priority, status, dueDate } = req.body;         │   │
│  │  const userId = req.user.id;  // From auth middleware                        │   │
│  │                                                                              │   │
│  │  // Create task entity                                                       │   │
│  │  const task: TaskItem = {                                                    │   │
│  │    title: "Complete documentation",                                          │   │
│  │    description: "Write architecture docs",                                   │   │
│  │    priority: Priority.High,                                                  │   │
│  │    status: Status.InProgress,                                                │   │
│  │    dueDate: new Date("2025-12-15"),                                          │   │
│  │    userId: "507f1f77bcf86cd799439011"                                        │   │
│  │  };                                                                          │   │
│  │                                                                              │   │
│  │  // Call service layer                                                       │   │
│  │  const createdTask = await this.taskService.createTaskAsync(task);           │   │
│  │                                                                              │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                         │                                            │
│                                         ▼                                            │
│  STEP 7: SERVICE LAYER                                                              │
│  ═════════════════════                                                              │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  TaskService.createTaskAsync(task)                                           │   │
│  │                                                                              │   │
│  │  // Business logic validation                                                │   │
│  │  // (e.g., check for duplicate titles, etc.)                                 │   │
│  │                                                                              │   │
│  │  // Delegate to repository                                                   │   │
│  │  return await this.taskWriteRepository.createAsync(task);                    │   │
│  │                                                                              │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                         │                                            │
│                                         ▼                                            │
│  STEP 8: REPOSITORY LAYER                                                           │
│  ════════════════════════                                                           │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  TaskWriteRepository.createAsync(task)                                       │   │
│  │                                                                              │   │
│  │  // Create Mongoose document                                                 │   │
│  │  const taskDocument = new TaskModel({                                        │   │
│  │    title: "Complete documentation",                                          │   │
│  │    description: "Write architecture docs",                                   │   │
│  │    priority: 2,                                                              │   │
│  │    status: 1,                                                                │   │
│  │    dueDate: ISODate("2025-12-15T00:00:00.000Z"),                              │   │
│  │    userId: ObjectId("507f1f77bcf86cd799439011"),                              │   │
│  │    createdAt: ISODate("2025-12-13T21:30:00.000Z"),                            │   │
│  │    updatedAt: ISODate("2025-12-13T21:30:00.000Z")                             │   │
│  │  });                                                                         │   │
│  │                                                                              │   │
│  │  // Save to MongoDB                                                          │   │
│  │  await taskDocument.save();                                                  │   │
│  │                                                                              │   │
│  │  return taskDocument;                                                        │   │
│  │                                                                              │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                         │                                            │
│                                         ▼                                            │
│  STEP 9: DATABASE                                                                   │
│  ════════════════                                                                   │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  MongoDB - tasks collection                                                  │   │
│  │                                                                              │   │
│  │  db.tasks.insertOne({                                                        │   │
│  │    _id: ObjectId("693d5be2ce0ef4f8be0656e3"),                                │   │
│  │    title: "Complete documentation",                                          │   │
│  │    description: "Write architecture docs",                                   │   │
│  │    priority: 2,                                                              │   │
│  │    status: 1,                                                                │   │
│  │    dueDate: ISODate("2025-12-15T00:00:00.000Z"),                              │   │
│  │    userId: ObjectId("507f1f77bcf86cd799439011"),                              │   │
│  │    createdAt: ISODate("2025-12-13T21:30:00.000Z"),                            │   │
│  │    updatedAt: ISODate("2025-12-13T21:30:00.000Z")                             │   │
│  │  });                                                                         │   │
│  │                                                                              │   │
│  │  // Document saved successfully ✓                                            │   │
│  │                                                                              │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                         │                                            │
│                                         │  Response bubbles back up                  │
│                                         │                                            │
│                                         ▼                                            │
│  STEP 10: RESPONSE                                                                  │
│  ═════════════════                                                                  │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  TaskController                                                              │   │
│  │                                                                              │   │
│  │  // Send response                                                            │   │
│  │  res.status(201).json({                                                      │   │
│  │    id: "693d5be2ce0ef4f8be0656e3",                                           │   │
│  │    title: "Complete documentation",                                          │   │
│  │    description: "Write architecture docs",                                   │   │
│  │    priority: 2,                                                              │   │
│  │    status: 1,                                                                │   │
│  │    dueDate: "2025-12-15T00:00:00.000Z",                                       │   │
│  │    createdAt: "2025-12-13T21:30:00.000Z",                                     │   │
│  │    updatedAt: "2025-12-13T21:30:00.000Z"                                      │   │
│  │  });                                                                         │   │
│  │                                                                              │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                         │                                            │
│                                         │  HTTP Response                             │
│                                         │  ═════════════                             │
│                                         │  Status: 201 Created                       │
│                                         │  Body: { id, title, ... }                  │
│                                         │                                            │
│                                         ▼                                            │
│  ════════════════════════════════════════════════════════════════════════════════   │
│                                   NETWORK                                            │
│  ════════════════════════════════════════════════════════════════════════════════   │
│                                         │                                            │
│                                         ▼                                            │
│  STEP 11: FRONTEND RECEIVES RESPONSE                                                │
│  ═══════════════════════════════════                                                │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  TaskService → ListComponent                                                 │   │
│  │                                                                              │   │
│  │  // Observable receives response                                             │   │
│  │  this.taskService.addTask(task).subscribe({                                  │   │
│  │    next: (createdTask) => {                                                  │   │
│  │      // Add new task to local array                                          │   │
│  │      this.tasks.push(createdTask);                                           │   │
│  │                                                                              │   │
│  │      // Clear form                                                           │   │
│  │      this.clearForm();                                                       │   │
│  │                                                                              │   │
│  │      // UI updates automatically (Angular change detection)                  │   │
│  │    },                                                                        │   │
│  │    error: (error) => {                                                       │   │
│  │      // Show error message                                                   │   │
│  │      this.errorMessage = this.extractErrorMessage(error);                    │   │
│  │    }                                                                         │   │
│  │  });                                                                         │   │
│  │                                                                              │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                         │                                            │
│                                         ▼                                            │
│  STEP 12: UI UPDATE                                                                 │
│  ══════════════════                                                                 │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  ListComponent (UI)                                                          │   │
│  │                                                                              │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐    │   │
│  │  │  Task List                                                           │    │   │
│  │  │  ─────────                                                           │    │   │
│  │  │                                                                      │    │   │
│  │  │  ┌─────────────────────────────────────────────────────────────┐    │    │   │
│  │  │  │ ✓ Complete documentation                    High | InProgress│    │    │   │
│  │  │  │   Write architecture docs                   Due: Dec 15, 2025│    │    │   │
│  │  │  │                                              [Edit] [Delete] │    │    │   │
│  │  │  └─────────────────────────────────────────────────────────────┘    │    │   │
│  │  │                                                                      │    │   │
│  │  │  Task created successfully! ✓                                        │    │   │
│  │  │                                                                      │    │   │
│  │  └─────────────────────────────────────────────────────────────────────┘    │   │
│  │                                                                              │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Layer Interaction Pattern

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              CLEAN ARCHITECTURE LAYERS                               │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   ┌───────────────────────────────────────────────────────────────────────────┐    │
│   │                        PRESENTATION LAYER                                  │    │
│   │                     (Controllers, Routes, Middleware)                      │    │
│   │                                                                            │    │
│   │  • Receives HTTP requests                                                  │    │
│   │  • Validates input (express-validator)                                     │    │
│   │  • Authenticates requests (JWT middleware)                                 │    │
│   │  • Delegates to service layer                                              │    │
│   │  • Returns HTTP responses                                                  │    │
│   │                                                                            │    │
│   │  Dependencies: Express, express-validator, JWT                             │    │
│   └───────────────────────────────────────────────────────────────────────────┘    │
│                                         │                                           │
│                                         │ Calls                                     │
│                                         ▼                                           │
│   ┌───────────────────────────────────────────────────────────────────────────┐    │
│   │                          SERVICE LAYER                                     │    │
│   │               (AuthService, TaskService, JwtTokenService)                  │    │
│   │                                                                            │    │
│   │  • Contains business logic                                                 │    │
│   │  • Orchestrates operations                                                 │    │
│   │  • Throws domain exceptions                                                │    │
│   │  • Uses repository interfaces (not implementations)                        │    │
│   │                                                                            │    │
│   │  Dependencies: Repository interfaces, Domain entities                      │    │
│   └───────────────────────────────────────────────────────────────────────────┘    │
│                                         │                                           │
│                                         │ Uses interfaces                           │
│                                         ▼                                           │
│   ┌───────────────────────────────────────────────────────────────────────────┐    │
│   │                           DOMAIN LAYER                                     │    │
│   │                    (Entities, Interfaces, Enums)                           │    │
│   │                                                                            │    │
│   │  • Pure business objects (AppUser, TaskItem)                               │    │
│   │  • Repository interfaces (contracts)                                       │    │
│   │  • Domain enums (Priority, Status)                                         │    │
│   │  • No external dependencies                                                │    │
│   │                                                                            │    │
│   │  Dependencies: None (pure domain)                                          │    │
│   └───────────────────────────────────────────────────────────────────────────┘    │
│                                         ▲                                           │
│                                         │ Implements interfaces                     │
│                                         │                                           │
│   ┌───────────────────────────────────────────────────────────────────────────┐    │
│   │                      INFRASTRUCTURE LAYER                                  │    │
│   │               (Repositories, Database, External Services)                  │    │
│   │                                                                            │    │
│   │  • Implements repository interfaces                                        │    │
│   │  • Database operations (MongoDB/Mongoose)                                  │    │
│   │  • External service integrations                                           │    │
│   │  • Data mapping (Document ↔ Entity)                                        │    │
│   │                                                                            │    │
│   │  Dependencies: Mongoose, MongoDB driver                                    │    │
│   └───────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Security Architecture

### Protection Mechanisms

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              SECURITY MEASURES                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  XSS (Cross-Site Scripting) Protection                                        │  │
│  │  ═══════════════════════════════════════                                      │  │
│  │                                                                                │  │
│  │  • Access token stored in memory (not localStorage)                           │  │
│  │  • Refresh token in HTTP-only cookie (JS can't access)                        │  │
│  │  • Angular's built-in sanitization                                            │  │
│  │                                                                                │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  CSRF (Cross-Site Request Forgery) Protection                                 │  │
│  │  ════════════════════════════════════════════                                 │  │
│  │                                                                                │  │
│  │  • SameSite cookie attribute ('lax' or 'strict')                              │  │
│  │  • CORS configuration (specific origin)                                       │  │
│  │  • Access token in Authorization header (not cookie)                          │  │
│  │                                                                                │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  Token Security                                                               │  │
│  │  ══════════════                                                               │  │
│  │                                                                                │  │
│  │  • Short-lived access tokens (3-15 minutes)                                   │  │
│  │  • Token rotation on refresh                                                  │  │
│  │  • Separate secrets for access/refresh tokens                                 │  │
│  │  • Secure flag on cookies (HTTPS in production)                               │  │
│  │                                                                                │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  Password Security                                                            │  │
│  │  ═════════════════                                                            │  │
│  │                                                                                │  │
│  │  • bcrypt hashing with salt rounds                                            │  │
│  │  • Minimum password length validation                                         │  │
│  │  • Passwords never stored in plain text                                       │  │
│  │                                                                                │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  Input Validation                                                             │  │
│  │  ════════════════                                                             │  │
│  │                                                                                │  │
│  │  • express-validator on all endpoints                                         │  │
│  │  • Client-side validation (Angular forms)                                     │  │
│  │  • Mongoose schema validation                                                 │  │
│  │  • SQL injection not applicable (NoSQL)                                       │  │
│  │                                                                                │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/refresh` | Refresh access token | Cookie |
| POST | `/api/auth/logout` | Logout user | Cookie |

### Task Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks` | Get all user's tasks | Yes |
| GET | `/api/tasks/:id` | Get task by ID | Yes |
| POST | `/api/tasks` | Create new task | Yes |
| PUT | `/api/tasks/:id` | Update task | Yes |
| DELETE | `/api/tasks/:id` | Delete task | Yes |

### Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Server health check | No |

---

## Configuration

### Token Expiry Configuration (config.ts)

```typescript
jwt: {
  accessTokenExpiry: '3m',     // Access token lifetime (short for security)
  refreshTokenExpiry: '5m',    // Refresh token lifetime (5m for testing, use 7d in prod)
},
cookie: {
  maxAge: 300000,              // Cookie lifetime (5 min in ms for testing)
  httpOnly: true,              // Block JavaScript access
  secure: true,                // HTTPS only (production)
  sameSite: 'lax',             // CSRF protection
}
```

**Note:** Token expiry times are set low (3m/5m) for development and testing. In production, increase to `15m`/`7d` respectively.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | Database connection | localhost |
| `JWT_SECRET` | Access token secret | - |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `JWT_ACCESS_TOKEN_EXPIRY` | Access token lifetime | 3m |
| `JWT_REFRESH_TOKEN_EXPIRY` | Refresh token lifetime | 5m |
| `COOKIE_MAX_AGE` | Cookie max age (ms) | 300000 |
| `CORS_ORIGIN` | Allowed origin | http://localhost:4200 |

---

## Exception Hierarchy

The application uses a structured exception hierarchy for consistent error handling:

```
BaseException (abstract)
├── ValidationException (400 Bad Request)
│   └── Includes validation errors array
├── UnauthorizedException (401 Unauthorized)
├── ForbiddenException (403 Forbidden)
├── NotFoundException (404 Not Found)
│   └── TaskNotFoundException extends this
├── ConflictException (409 Conflict)
│   └── UsernameTakenException extends this
└── InternalServerException (500 Server Error)
```

### Features:
- **Status Codes**: Each exception maps to an HTTP status code
- **Operational Flag**: Distinguishes expected vs unexpected errors
- **JSON Serialization**: `toJSON()` method for consistent API responses
- **Stack Traces**: Preserved for debugging

---

## Summary

This Task Management Application demonstrates:

1. **Clean Architecture** - Separation of concerns with distinct layers
2. **Secure Authentication** - Dual token system with HTTP-only cookies
3. **RESTful API Design** - Standard HTTP methods and status codes
4. **Type Safety** - Full TypeScript implementation
5. **Modern Frontend** - Angular 17 with standalone components
6. **Scalable Backend** - Node.js with Express and MongoDB
7. **Production Ready** - Environment configuration, logging, error handling
8. **Exception Hierarchy** - Structured error handling with BaseException
9. **Global Error Handler** - Centralized async error handling with asyncHandler
10. **Unit Testing** - Jest with 115+ tests and 100% service coverage

---

*Document Version: 1.1 (Updated December 2025)*
