# Docker Setup Guide

## Quick Start

### Option 1: Separate Containers (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 2: Single Container

```bash
# Build single container image
docker build -f Dockerfile.single -t taskboard:single .

# Run with external services (MongoDB, Redis, RabbitMQ)
docker run -p 3000:3000 -p 5173:80 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/taskboard \
  -e REDIS_HOST=host.docker.internal \
  -e RABBITMQ_URL=amqp://guest:guest@host.docker.internal:5672 \
  -e JWT_SECRET=your-secret-key \
  taskboard:single

# Or use docker-compose.single.yml
docker-compose -f docker-compose.single.yml up -d
```

## Environment Variables

Environment variables can be set in two ways:

1. **Via docker run -e flags:**
```bash
docker run -e MONGODB_URI=mongodb://... -e REDIS_HOST=... taskboard:single
```

2. **Via docker-compose environment section:**
```yaml
environment:
  MONGODB_URI: mongodb://mongodb:27017/taskboard
  REDIS_HOST: redis
```

3. **Via .env file (for docker-compose):**
Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://mongodb:27017/taskboard
REDIS_HOST=redis
REDIS_PORT=6379
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
JWT_SECRET=your-secret-key
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Required Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `REDIS_HOST` - Redis host (default: localhost)
- `REDIS_PORT` - Redis port (default: 6379)
- `RABBITMQ_URL` - RabbitMQ connection URL
- `JWT_SECRET` - JWT secret key (required for authentication)
- `JWT_REFRESH_SECRET` - JWT refresh token secret (optional)

## Optional Environment Variables

- `SMTP_HOST` - SMTP server host (default: smtp.gmail.com)
- `SMTP_PORT` - SMTP port (default: 587)
- `SMTP_USER` - SMTP username/email
- `SMTP_PASS` - SMTP password/app password
- `SMTP_FROM` - From email address
- `CORS_ORIGIN` - CORS allowed origins
- `APP_URL` - Application URL
- `LOG_LEVEL` - Logging level (default: info)
- `NODE_ENV` - Node environment (development/production)

## Troubleshooting

### Nginx Config Error
If you see "server directive is not allowed here", the nginx config was created incorrectly. Rebuild the image.

### .env File Not Found
The .env file is optional. Use environment variables instead:
```bash
docker run -e MONGODB_URI=... -e REDIS_HOST=... taskboard:single
```

### MongoDB Connection Error
Make sure MongoDB is running and accessible:
- For docker-compose: MongoDB service should be healthy
- For single container: Use `host.docker.internal` for local MongoDB

### Services Not Starting
Check logs:
```bash
docker-compose logs api
docker-compose logs worker
docker-compose logs web
```
