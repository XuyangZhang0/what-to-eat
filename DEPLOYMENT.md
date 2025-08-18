# What to Eat - Docker Deployment Guide

This guide covers the complete Docker containerization and deployment setup for the "What to Eat" application.

## Architecture Overview

The application consists of:
- **Frontend**: React + Vite app served by Nginx
- **Backend**: Node.js + Express API server
- **Database**: SQLite with volume persistence
- **Reverse Proxy**: Nginx for production routing
- **SSL**: HTTPS support for production

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git
- At least 2GB available RAM
- 5GB available disk space

## Quick Start

### Development Deployment

```bash
# Clone the repository
git clone <repository-url>
cd what-to-eat

# Start development environment
./scripts/deploy-dev.sh

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3001
# Health Check: http://localhost:3001/api/health
```

### Production Deployment

```bash
# Configure production environment
cp .env.production.example .env.production
# Edit .env.production with your settings

# Start production environment
./scripts/deploy-prod.sh

# Access the application
# Frontend: https://localhost (or your domain)
# Backend API: https://localhost/api
# Health Check: https://localhost/health
```

## Configuration

### Environment Variables

#### Development (.env.development)
```bash
NODE_ENV=development
PORT=3001
DATABASE_PATH=./data/database.db
JWT_SECRET=dev-jwt-secret-change-in-production
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_MAX_REQUESTS=1000
```

#### Production (.env.production)
```bash
NODE_ENV=production
PORT=3001
DATABASE_PATH=/app/data/database.db
JWT_SECRET=YOUR_STRONG_SECRET_HERE
FRONTEND_URL=https://your-domain.com
RATE_LIMIT_MAX_REQUESTS=100
```

**⚠️ Important**: Update the following in production:
- `JWT_SECRET`: Use a strong, unique secret
- `FRONTEND_URL`: Your actual domain
- SSL certificates in `nginx/ssl/`

## Services

### Backend (Node.js + Express)
- **Container**: `what-to-eat-backend`
- **Port**: 3001
- **Health Check**: `/api/health`
- **Database**: SQLite with WAL mode
- **Features**: Rate limiting, CORS, security headers

### Frontend (React + Vite)
- **Container**: `what-to-eat-frontend`
- **Port**: 5173 (dev), 8080 (prod)
- **Build**: Optimized production build
- **Server**: Nginx with compression and caching

### Reverse Proxy (Nginx)
- **Container**: `what-to-eat-nginx` (production only)
- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Features**: SSL termination, rate limiting, security headers
- **Routes**:
  - `/api/*` → Backend
  - `/*` → Frontend
  - `/health` → Health check

## Health Checks

### Endpoints
- **Basic Health**: `GET /api/health`
- **Liveness**: `GET /api/health/live`
- **Readiness**: `GET /api/health/ready`

### Docker Health Checks
All services include Docker health checks with:
- Interval: 30 seconds
- Timeout: 10 seconds
- Retries: 3
- Start period: 40 seconds (backend), 10 seconds (nginx)

## Deployment Scripts

### Development
```bash
./scripts/deploy-dev.sh
```
- Builds and starts development containers
- Enables hot reloading
- More permissive rate limiting
- Detailed logging

### Production
```bash
./scripts/deploy-prod.sh
```
- Builds optimized production images
- Enables SSL/HTTPS
- Strict rate limiting
- Creates self-signed certificates if none exist
- Validates configuration

### Backup
```bash
./scripts/backup.sh
```
- Backs up database, configuration, SSL certificates
- Creates timestamped compressed archives
- Stores in `backups/` directory
- Automatically cleans old backups (7+ days)

### Restore
```bash
./scripts/restore.sh <backup-file>
```
- Restores from backup archive
- Creates backup of current state before restore
- Restores database, configuration, and certificates

## SSL Configuration

### Development
Uses HTTP only for simplicity.

### Production
- Automatically creates self-signed certificates for testing
- Replace certificates in `nginx/ssl/` for production:
  ```bash
  # Copy your certificates
  cp your-cert.pem nginx/ssl/cert.pem
  cp your-key.pem nginx/ssl/key.pem
  
  # Restart services
  docker-compose -f docker-compose.prod.yml restart nginx
  ```

### Let's Encrypt (Recommended)
```bash
# Install certbot
sudo apt-get install certbot

# Generate certificates
sudo certbot certonly --standalone -d your-domain.com

# Copy to nginx directory
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem

# Set up auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Database Management

### Persistence
- SQLite database stored in Docker volume `backend_data`
- Automatic migrations on container start
- WAL mode enabled for better performance

### Backup Database
```bash
# Manual backup
docker exec what-to-eat-backend cp /app/data/database.db /tmp/
docker cp what-to-eat-backend:/tmp/database.db ./backup-$(date +%Y%m%d).db

# Or use backup script
./scripts/backup.sh
```

### Restore Database
```bash
# Copy database to container
docker cp ./backup-database.db what-to-eat-backend:/app/data/database.db

# Restart backend
docker-compose restart backend
```

## Monitoring and Logs

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# Production
docker-compose -f docker-compose.prod.yml logs -f
```

### Service Status
```bash
# Development
docker-compose ps

# Production
docker-compose -f docker-compose.prod.yml ps
```

### Resource Usage
```bash
# Container stats
docker stats

# Disk usage
docker system df
```

## Security

### Container Security
- Non-root users in all containers
- Read-only root filesystems where possible
- Resource limits (CPU/Memory)
- Security headers (Helmet.js, Nginx)

### Network Security
- Internal Docker network isolation
- Rate limiting (API and general)
- CORS configuration
- CSP headers

### Data Security
- Environment variable isolation
- Database file permissions
- SSL/TLS encryption
- JWT token security

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
sudo lsof -i :5173
sudo lsof -i :3001

# Stop the process or change ports in docker-compose.yml
```

#### Database Connection Issues
```bash
# Check database file permissions
ls -la data/

# Check container logs
docker logs what-to-eat-backend

# Restart with fresh database
docker-compose down -v
docker-compose up -d
```

#### SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in nginx/ssl/cert.pem -text -noout

# Generate new self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem
```

#### Memory Issues
```bash
# Check container memory usage
docker stats

# Increase memory limits in docker-compose files
# Or restart with more system memory
```

### Debug Mode
```bash
# Start with debug logging
DEBUG=* docker-compose up

# Access container shell
docker exec -it what-to-eat-backend /bin/sh
docker exec -it what-to-eat-frontend /bin/sh
```

## Performance Optimization

### Production Optimizations
- Multi-stage Docker builds
- Nginx compression and caching
- SQLite WAL mode and optimizations
- Resource limits and reservations
- Image layer optimization

### Scaling
For higher loads, consider:
- Load balancer (multiple backend replicas)
- PostgreSQL/MySQL instead of SQLite
- Redis for session storage
- CDN for static assets
- Kubernetes deployment

## Maintenance

### Regular Tasks
1. **Daily**: Check logs and health endpoints
2. **Weekly**: Review resource usage and performance
3. **Monthly**: Update Docker images and dependencies
4. **Quarterly**: Review and update SSL certificates

### Updates
```bash
# Update Docker images
docker-compose pull
docker-compose up -d

# Update application code
git pull
docker-compose build --no-cache
docker-compose up -d
```

### Cleanup
```bash
# Remove unused containers and images
docker system prune -a

# Remove old volumes (careful!)
docker volume prune
```

## Support

For issues and questions:
1. Check this documentation
2. Review container logs
3. Check health endpoints
4. Verify configuration files
5. Test with minimal reproduction case

Remember to update configuration files and secrets for your specific production environment!