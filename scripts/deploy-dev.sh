#!/bin/bash

# Development Deployment Script for What to Eat App

set -e

echo "🚀 Starting development deployment..."

# Load development environment variables
if [ -f .env.development ]; then
    export $(cat .env.development | grep -v '#' | awk '/=/ {print $1}')
fi

# Create necessary directories
mkdir -p data logs

# Stop and remove existing containers
echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans

# Remove old images (optional)
echo "🧹 Cleaning up old images..."
docker system prune -f

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
timeout 120 bash -c 'until docker-compose ps | grep -q "healthy"; do sleep 5; done'

# Check service status
echo "📊 Service status:"
docker-compose ps

# Display access information
echo ""
echo "✅ Development deployment completed!"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:3001"
echo "🏥 Health check: http://localhost:3001/api/health"
echo ""
echo "📊 To monitor logs:"
echo "  docker-compose logs -f"
echo ""
echo "🛑 To stop services:"
echo "  docker-compose down"