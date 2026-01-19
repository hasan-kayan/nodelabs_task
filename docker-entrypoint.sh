#!/bin/sh
set -e

echo "=========================================="
echo "Starting TaskBoard services..."
echo "=========================================="

# Create .env file from environment variables
echo "Creating .env file from environment variables..."
cat > /app/.env << EOF
# Environment variables - Generated at container startup
NODE_ENV=${NODE_ENV:-production}
MONGODB_URI=${MONGODB_URI:-mongodb://mongodb:27017/taskboard}
REDIS_HOST=${REDIS_HOST:-redis}
REDIS_PORT=${REDIS_PORT:-6379}
RABBITMQ_URL=${RABBITMQ_URL:-amqp://guest:guest@rabbitmq:5672}
JWT_SECRET=${JWT_SECRET:-your-super-secret-jwt-key-change-in-production}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET:-your-super-secret-refresh-key-change-in-production}
SMTP_USER=${SMTP_USER:-}
SMTP_PASS=${SMTP_PASS:-}
SMTP_HOST=${SMTP_HOST:-smtp.gmail.com}
SMTP_PORT=${SMTP_PORT:-587}
SMTP_SECURE=${SMTP_SECURE:-false}
SMTP_FROM=${SMTP_FROM:-}
CORS_ORIGIN=${CORS_ORIGIN:-http://localhost:5173}
APP_URL=${APP_URL:-http://localhost:5173}
LOG_LEVEL=${LOG_LEVEL:-info}
API_PORT=${API_PORT:-3000}
OTP_EXPIRY=${OTP_EXPIRY:-300}
RATE_LIMIT_WINDOW_MS=${RATE_LIMIT_WINDOW_MS:-900000}
RATE_LIMIT_MAX_REQUESTS=${RATE_LIMIT_MAX_REQUESTS:-100}
EOF

echo "✅ .env file created"
echo "Environment variables:"
echo "  MONGODB_URI=${MONGODB_URI:-mongodb://mongodb:27017/taskboard}"
echo "  REDIS_HOST=${REDIS_HOST:-redis}"
echo "  RABBITMQ_URL=${RABBITMQ_URL:-amqp://guest:guest@rabbitmq:5672}"
echo ""

# Test nginx config
echo "Testing nginx configuration..."
nginx -t || {
  echo "❌ Nginx configuration test failed!"
  exit 1
}
echo "✅ Nginx configuration is valid"

# Start nginx in background (daemon mode)
echo "Starting nginx..."
nginx
NGINX_PID=$(cat /var/run/nginx.pid 2>/dev/null || echo "")
if [ -n "$NGINX_PID" ]; then
  echo "✅ Nginx started (PID: $NGINX_PID)"
else
  echo "⚠️  Warning: Could not get nginx PID"
fi

# Wait for dependencies to be ready (if using docker-compose)
if [ -n "$MONGODB_URI" ]; then
  echo "Waiting for MongoDB to be ready..."
  # Extract host from MONGODB_URI
  MONGO_HOST=$(echo "$MONGODB_URI" | sed -n 's|.*://\([^:/]*\).*|\1|p')
  MONGO_PORT=$(echo "$MONGODB_URI" | sed -n 's|.*:\([0-9]*\)/.*|\1|p' || echo "27017")
  
  if [ -n "$MONGO_HOST" ] && [ "$MONGO_HOST" != "localhost" ] && [ "$MONGO_HOST" != "127.0.0.1" ]; then
    echo "  Checking MongoDB at $MONGO_HOST:${MONGO_PORT:-27017}..."
    for i in $(seq 1 30); do
      if nc -z -w 1 "$MONGO_HOST" "${MONGO_PORT:-27017}" 2>/dev/null; then
        echo "  ✅ MongoDB is ready"
        break
      fi
      if [ $i -eq 30 ]; then
        echo "  ⚠️  Warning: MongoDB connection check failed after 30 attempts, continuing anyway..."
        echo "  Services will attempt to connect and retry automatically"
      else
        echo "  Waiting for MongoDB... ($i/30)"
        sleep 1
      fi
    done
  else
    echo "  MongoDB host is localhost, skipping connection check"
  fi
fi

# Start API in background
echo "Starting API service..."
cd /app/apps/api
pnpm start > /tmp/api.log 2>&1 &
API_PID=$!
echo "✅ API started (PID: $API_PID)"
echo "  API logs: tail -f /tmp/api.log"

# Start Worker in background
echo "Starting Worker service..."
cd /app/apps/worker
pnpm start > /tmp/worker.log 2>&1 &
WORKER_PID=$!
echo "✅ Worker started (PID: $WORKER_PID)"
echo "  Worker logs: tail -f /tmp/worker.log"

# Wait a bit for services to initialize
echo ""
echo "Waiting for services to initialize..."
sleep 3

# Check if processes are still running
if ! kill -0 $API_PID 2>/dev/null; then
  echo "❌ API process died! Check logs:"
  cat /tmp/api.log
  exit 1
fi

if ! kill -0 $WORKER_PID 2>/dev/null; then
  echo "❌ Worker process died! Check logs:"
  cat /tmp/worker.log
  exit 1
fi

echo ""
echo "=========================================="
echo "✅ All services started successfully!"
echo "=========================================="
echo "  Nginx: PID $NGINX_PID"
echo "  API: PID $API_PID"
echo "  Worker: PID $WORKER_PID"
echo ""
echo "To view logs:"
echo "  API: docker exec -it <container> tail -f /tmp/api.log"
echo "  Worker: docker exec -it <container> tail -f /tmp/worker.log"
echo ""

# Function to cleanup on exit
cleanup() {
  echo ""
  echo "=========================================="
  echo "Shutting down services..."
  echo "=========================================="
  nginx -s quit 2>/dev/null || true
  kill $API_PID $WORKER_PID 2>/dev/null || true
  wait $API_PID $WORKER_PID 2>/dev/null || true
  echo "✅ Services stopped"
  exit
}

trap cleanup SIGTERM SIGINT

# Wait for all background processes and monitor them
while true; do
  # Check if processes are still running
  if ! kill -0 $API_PID 2>/dev/null; then
    echo "❌ API process died! Exit code: $?"
    cat /tmp/api.log
    cleanup
    exit 1
  fi
  
  if ! kill -0 $WORKER_PID 2>/dev/null; then
    echo "❌ Worker process died! Exit code: $?"
    cat /tmp/worker.log
    cleanup
    exit 1
  fi
  
  sleep 5
done
