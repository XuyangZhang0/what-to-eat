#!/bin/bash

# Production Deployment Script for What to Eat App

set -e

echo "🚀 Starting production deployment..."

# Check if production environment file exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found!"
    echo "Please create .env.production with your production configuration."
    exit 1
fi

# Load production environment variables
export $(cat .env.production | grep -v '#' | awk '/=/ {print $1}')

# Validate required environment variables
required_vars=("JWT_SECRET" "FRONTEND_URL")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Required environment variable $var is not set!"
        exit 1
    fi
done

# Check if JWT_SECRET is still the default
if [ "$JWT_SECRET" = "CHANGE_THIS_TO_A_STRONG_SECRET_IN_PRODUCTION" ]; then
    echo "❌ Error: Please change JWT_SECRET in .env.production!"
    exit 1
fi

# Create necessary directories
mkdir -p data logs nginx/ssl

# Check for SSL certificates
if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
    echo "⚠️  Warning: SSL certificates not found in nginx/ssl/"
    echo "Creating self-signed certificates for testing..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    echo "✅ Self-signed certificates created"
    echo "📝 For production, replace with valid SSL certificates"
fi

# Backup existing data
if [ -d "data" ]; then
    echo "💾 Creating backup..."
    tar -czf "backup-$(date +%Y%m%d_%H%M%S).tar.gz" data/
fi

# Stop and remove existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans

# Pull latest images and build
echo "🔨 Building production images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Start services
echo "🚀 Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
timeout 180 bash -c '
    while true; do
        if docker-compose -f docker-compose.prod.yml ps | grep -q "Up.*healthy"; then
            healthy_count=$(docker-compose -f docker-compose.prod.yml ps | grep "Up.*healthy" | wc -l)
            if [ "$healthy_count" -ge 2 ]; then
                break
            fi
        fi
        sleep 10
    done
'

# Check service status
echo "📊 Service status:"
docker-compose -f docker-compose.prod.yml ps

# Run health checks
echo "🏥 Running health checks..."
curl -f http://localhost/health || echo "⚠️  Health check failed"

# Display access information
echo ""
echo "✅ Production deployment completed!"
echo ""
echo "🌐 Frontend: https://localhost (or your domain)"
echo "🔧 Backend API: https://localhost/api (or your domain)"
echo "🏥 Health check: https://localhost/health"
echo ""
echo "📊 To monitor logs:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🛑 To stop services:"
echo "  docker-compose -f docker-compose.prod.yml down"
echo ""
echo "⚠️  Important reminders:"
echo "  - Update SSL certificates for production use"
echo "  - Update domain names in configuration"
echo "  - Monitor logs and performance"
echo "  - Set up monitoring and alerting"