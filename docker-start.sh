#!/bin/bash

# TaskBoard Docker Startup Script
# This script starts the entire TaskBoard application stack with a single command

set -e

echo "🐳 Starting TaskBoard Docker Environment..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose and try again."
    exit 1
fi

# Use docker compose (newer) or docker-compose (older)
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

echo "📦 Building and starting all services..."
echo ""

# Build and start all services
$COMPOSE_CMD up -d --build

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Check service status
echo ""
echo "📊 Service Status:"
$COMPOSE_CMD ps

echo ""
echo "✅ TaskBoard is starting up!"
echo ""
echo "🌐 Services will be available at:"
echo "   - Web UI:      http://localhost:5173"
echo "   - API:         http://localhost:3000"
echo "   - RabbitMQ UI: http://localhost:15672 (guest/guest)"
echo ""
echo "📝 To view logs:    pnpm docker:logs"
echo "🛑 To stop:         pnpm docker:down"
echo "🔄 To restart:      pnpm docker:restart"
echo ""
echo "Waiting for services to be ready..."
sleep 10

# Check if services are running
if $COMPOSE_CMD ps | grep -q "Up"; then
    echo "✅ All services are running!"
else
    echo "⚠️  Some services may still be starting. Check logs with: pnpm docker:logs"
fi
