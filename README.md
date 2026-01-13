# TaskBoard - Fullstack Real-time Task Management

A fullstack JavaScript application for managing projects and tasks with real-time updates, OTP authentication, and role-based access control.

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Socket.io, RabbitMQ, Redis
- **Worker**: RabbitMQ consumers for async processing
- **Frontend**: React, Vite, Shadcn UI, TanStack Query, TanStack Table, Zustand
- **Monorepo**: pnpm workspaces

## Project Structure

```
/
├── apps/
│   ├── api/          # Backend API (Express + Socket.io)
│   ├── worker/       # RabbitMQ consumers & cron jobs
│   └── web/          # Frontend (React + Vite)
├── packages/
│   ├── common/       # Shared utilities & constants
│   └── ui/           # Shared UI components
└── docker-compose.yml
```

## Features

- ✅ OTP-based authentication (email/phone)
- ✅ JWT access & refresh tokens
- ✅ Role-based access control (Admin/Member)
- ✅ Real-time updates via Socket.io
- ✅ RabbitMQ for async event processing
- ✅ Redis for caching & rate limiting
- ✅ MongoDB for data persistence
- ✅ Task & Project management
- ✅ Comments on tasks
- ✅ Real-time notifications
- ✅ Dark/Light theme support
- ✅ Responsive UI with Shadcn components

## Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose

## Setup

1. **Clone and install dependencies:**
   ```bash
   pnpm install
   ```

2. **Copy environment file:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start services with Docker:**
   ```bash
   docker-compose up -d
   ```

4. **Start development servers:**
   ```bash
   # Start all services
   pnpm dev

   # Or start individually
   pnpm dev:api      # Backend API (port 3000)
   pnpm dev:web      # Frontend (port 5173)
   pnpm dev:worker   # Worker service
   ```

## Services

- **API**: http://localhost:3000
- **Web**: http://localhost:5173
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **MongoDB**: mongodb://localhost:27017

## API Endpoints

### Authentication
- `POST /api/auth/otp/request` - Request OTP
- `POST /api/auth/otp/verify` - Verify OTP
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Projects
- `GET /api/projects` - List projects
- `GET /api/projects/:id` - Get project
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - List tasks
- `GET /api/tasks/:id` - Get task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Comments
- `GET /api/comments/task/:taskId` - Get comments
- `POST /api/comments` - Create comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

## Socket.io Events

### Client → Server
- `room:join` - Join project room
- `room:leave` - Leave project room
- `task:subscribe` - Subscribe to task updates
- `notification:subscribe` - Subscribe to notifications

### Server → Client
- `task.created` - Task created
- `task.updated` - Task updated
- `task.assigned` - Task assigned
- `comment.added` - Comment added

## RabbitMQ Topics

- `otp.requested` - OTP requested event
- `task.created` - Task created event
- `task.assigned` - Task assigned event
- `task.updated` - Task updated event
- `comment.added` - Comment added event

## Development

### Running Tests
```bash
pnpm test
```

### Linting
```bash
pnpm lint
```

### Formatting
```bash
pnpm format
```

## Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild services
docker-compose up -d --build
```

## License

This project is for evaluation purposes only.
