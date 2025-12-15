# Task Management Client App - Documentation

A modern Angular 17 single-page application for task management with user authentication.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Components](#components)
- [Services](#services)
- [Models](#models)
- [Configuration](#configuration)
- [Getting Started](#getting-started)
- [API Integration](#api-integration)
- [Build & Deployment](#build--deployment)

---

## Overview

This Angular application provides a user-friendly interface for managing tasks. It connects to a Node.js REST API backend and offers features like user registration, authentication, task CRUD operations, filtering, and sorting.

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 17.0.0 | Frontend framework |
| TypeScript | 5.2.2 | Programming language |
| RxJS | 7.8.0 | Reactive programming |
| Bootstrap | 5.3.2 | UI styling |
| ng-bootstrap | 16.0.0 | Angular Bootstrap components |
| Zone.js | 0.14.2 | Change detection |

---

## Project Structure

```
ClientApp/
├── src/
│   ├── app/
│   │   ├── components/           # UI Components
│   │   │   ├── home/             # Landing page
│   │   │   ├── list/             # Task list & management
│   │   │   ├── nav/              # Navigation bar
│   │   │   └── register/         # User registration
│   │   ├── interceptors/         # HTTP interceptors
│   │   │   └── error.interceptor.ts
│   │   ├── models/               # Data models
│   │   │   ├── todoitem.ts       # Task model
│   │   │   └── user.ts           # User model
│   │   ├── services/             # Business logic & API calls
│   │   │   ├── accountService.ts # Authentication service
│   │   │   └── taskservice.ts    # Task CRUD service
│   │   ├── app.component.ts      # Root component
│   │   ├── app.config.ts         # App configuration
│   │   └── app.routes.ts         # Route definitions
│   ├── environments/             # Environment configs
│   │   ├── environment.ts        # Production
│   │   └── environment.development.ts
│   ├── assets/                   # Static files
│   ├── index.html                # Entry HTML
│   ├── main.ts                   # Bootstrap file
│   └── styles.css                # Global styles
├── angular.json                  # Angular CLI config
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── README.md                     # This file
```

---

## Features

### Authentication
- ✅ User Registration
- ✅ User Login
- ✅ JWT Token Management
- ✅ Auto-logout on session expiry
- ✅ Persistent login (localStorage)

### Task Management
- ✅ Create new tasks
- ✅ Edit existing tasks (inline editing)
- ✅ Delete tasks
- ✅ Mark tasks as complete/pending
- ✅ Set task priority (Low, Medium, High)
- ✅ Set due dates

### User Experience
- ✅ Filter tasks by status
- ✅ Filter tasks by priority
- ✅ Sort by newest/oldest
- ✅ Form validation with feedback
- ✅ Error handling & user notifications
- ✅ Responsive design (Bootstrap)

---

## Components

### `HomeComponent`
- Landing page with login form
- Toggle between login and registration
- Welcome message for new users

### `NavComponent`
- Navigation bar
- Displays logged-in username
- Logout functionality

### `ListComponent`
- Main task management interface
- Task creation form
- Task list with inline editing
- Filter and sort controls
- Task status toggle (checkbox)

### `RegisterComponent`
- User registration form
- Username/password validation
- Error handling for duplicate usernames

### `AppComponent`
- Root component
- Conditional rendering based on auth state
- Initializes user session from localStorage

---

## Services

### `TokenService`
Manages access tokens in memory for security.

```typescript
// Properties
token$: Observable<string | null>        // Observable for token changes
isAuthenticated: boolean                 // Check if user is logged in

// Methods
getAccessToken(): string | null          // Get current access token
getUsername(): string | null             // Get current username
setToken(token: string, username?: string): void  // Store token in memory
clearToken(): void                       // Clear tokens on logout
```

**Security Notes:**
- Access token stored only in memory (not localStorage/sessionStorage)
- Token cleared on page refresh
- Prevents XSS attacks from accessing tokens

### `AccountService`
Handles user authentication and session management.

```typescript
// Properties
currentUser$: Observable<User | null>    // Observable for auth state
isAuthenticated: boolean                 // Check if user is logged in

// Methods
login(model: any): Observable<void>      // Authenticate user
register(model: any): Observable<void>   // Register new user
refreshToken(): Observable<boolean>      // Refresh access token using cookie
logout(): Observable<void>               // Clear session (calls server)
getAccessToken(): string | null          // Get current access token
```

**Authentication Flow:**
1. **Login**: POST to `/auth/login`, receives access token (stored in memory) + refresh token (HTTP-only cookie)
2. **API Requests**: Access token attached via `authInterceptor`
3. **Token Expired**: 401 response triggers automatic token refresh
4. **Refresh**: POST to `/auth/refresh` with cookie, receives new access token
5. **Logout**: POST to `/auth/logout`, clears memory token and server cookie

### `TaskService`
Handles all task-related API operations.

```typescript
// Methods
GetTasks(): Observable<Task[]>           // Get all user tasks
CreateNew(task: Task): Observable<Task>  // Create new task
Edit(task: Task): Observable<any>        // Update existing task
Remove(task: Task): Observable<any>      // Delete task
```

**Note:** TaskService no longer manages tokens - authentication is handled automatically by `authInterceptor`.

---

## Interceptors

### `authInterceptor`
Handles automatic token attachment and refresh.

**Features:**
- Attaches access token to outgoing requests
- Automatically refreshes token on 401 errors
- Queues concurrent requests during refresh
- Prevents multiple simultaneous refresh calls

### `errorInterceptor`
Handles HTTP errors and displays appropriate messages.

---

## Models

### Task Model
```typescript
export class Task {
    id: string = "";
    title: string = "";
    description: string = "";
    status: string = "Pending";      // Pending | Completed
    priority: string = "Medium";     // Low | Medium | High
    dueDate: Date = new Date();
    isEditMode: boolean = false;     // UI state

    // Helper methods
    toApiRequest(): object           // Convert to API format
    static fromApiResponse(data: any): Task  // Parse API response
}
```

### User Model
```typescript
export interface User {
    username: string;
    token: string;    // JWT access token
}
```

---

## Configuration

### Environment Variables

**Development** (`environment.development.ts`):
```typescript
export const environment = {
    production: false,
    apiUrl: 'http://localhost:5000/api/'
};
```

**Production** (`environment.ts`):
```typescript
export const environment = {
    production: true,
    apiUrl: 'https://your-api-domain.com/api/'
};
```

### App Configuration (`app.config.ts`)
```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([errorInterceptor]))
  ]
};
```

---

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Angular CLI (`npm install -g @angular/cli`)

### Installation

```powershell
# Navigate to ClientApp
cd ClientApp

# Install dependencies
npm install

# Start development server
npm start
# or
ng serve
```

### Development Server
```
http://localhost:4200
```

---

## API Integration

### Base URL
```
Development: http://localhost:5000/api/
Production:  Configure in environment.ts
```

### Endpoints Used

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/register` | User registration |
| GET | `/tasks` | Get all tasks |
| POST | `/tasks` | Create task |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |

### HTTP Interceptor
The `errorInterceptor` handles:
- **401 Unauthorized**: Auto-logout and redirect
- **404 Not Found**: Console logging
- **409 Conflict**: Username exists (registration)
- **500 Server Error**: Console logging

---

## Build & Deployment

### Development Build
```powershell
ng build
```

### Production Build
```powershell
ng build --configuration production
```

### Output
Build artifacts are stored in `dist/client-app/`

### Running Tests
```powershell
# Unit tests
npm test
# or
ng test
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start dev server |
| `npm run build` | Production build |
| `npm run watch` | Build with watch mode |
| `npm test` | Run unit tests |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Angular Application                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Home      │  │    Nav      │  │       List          │ │
│  │  Component  │  │  Component  │  │     Component       │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         │                │                     │            │
│         └────────────────┼─────────────────────┘            │
│                          │                                   │
│                  ┌───────▼───────┐                          │
│                  │   Services    │                          │
│                  │ Account/Task  │                          │
│                  └───────┬───────┘                          │
│                          │                                   │
│                  ┌───────▼───────┐                          │
│                  │ HTTP Client   │                          │
│                  │ + Interceptor │                          │
│                  └───────┬───────┘                          │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           ▼
                   Node.js REST API
                   (localhost:5000)
```

---

## License

MIT License

---

## Author

PraveenKumar
