# Task Management API - Node.js/TypeScript

A production-ready Task Management API built with Node.js, TypeScript, Express, and MongoDB following Clean Architecture principles - mirroring the .NET 8 solution structure.

## ??? Architecture

```
TaskManagementAPI-Node/
??? src/
?   ??? core/                    # Domain Layer
?   ??? infrastructure/          # Data Access Layer
?   ??? services/                # Business Logic Layer
?   ??? api/                     # Presentation Layer
?   ??? server.ts               # Entry Point
??? tests/                       # Tests
```

## ?? Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 7+ (local or Atlas)
- npm or yarn

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env
# Edit .env with your configuration

# 3. Start MongoDB (if local)
mongod

# 4. Start development server
npm run dev
```

The API will be available at `http://localhost:5000`

## ?? API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Tasks (Protected)
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks?status=Pending&priority=High` - Filter tasks
- `GET /api/tasks/:id` - Get task by ID  
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Health
- `GET /health` - Health check

## ?? Available Scripts

```bash
npm run dev              # Development with hot reload
npm start                # Production server
npm run build            # Build TypeScript
npm test                 # Run tests
npm run lint             # Lint code
npm run format           # Format code
```

## ?? Docker

```bash
# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop
docker-compose down
```

## ?? Documentation

- **QUICK_START.md** - Detailed setup guide
- **DOTNET_VS_NODEJS.md** - Comparison with .NET version
- **PROJECT_SUMMARY.md** - Complete project overview

## ?? Features

? Clean Architecture  
? CQRS Pattern (Read/Write separation)  
? Repository Pattern  
? JWT Authentication  
? BCrypt Password Hashing  
? Winston Logging  
? Input Validation  
? Custom Exceptions  
? Docker Support  
? TypeScript Type Safety  

## ?? Security

- JWT token authentication
- BCrypt password hashing
- Input validation
- CORS configuration
- Environment-based secrets

## ?? Architecture Comparison

| .NET 8 | Node.js/TypeScript |
|--------|-------------------|
| TaskManagementApp.Core | src/core/ |
| TaskManagementApp.Infrastructure | src/infrastructure/ |
| TaskManagementApp.Services | src/services/ |
| TaskManagementApp.Api | src/api/ |

## ?? Contributing

Contributions welcome! Please follow the existing code structure and conventions.

## ?? License

MIT License

---

**Built with ?? following Clean Architecture principles**
