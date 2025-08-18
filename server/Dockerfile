# Multi-stage build for Node.js backend
FROM node:18-alpine AS base

# Install system dependencies for better-sqlite3 and other native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

FROM base AS development
# Install all dependencies including devDependencies
RUN npm ci
# Copy source code
COPY . .
# Run database migrations and seed
RUN npm run migrate
# Expose port
EXPOSE 3001
# Start development server
CMD ["npm", "run", "dev"]

FROM base AS build
# Install all dependencies including devDependencies for build
RUN npm ci
# Copy source code
COPY . .
# Build the application
RUN npm run build

FROM base AS production
# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built application from build stage
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist
COPY --from=build --chown=nodejs:nodejs /app/src/database ./src/database
COPY --chown=nodejs:nodejs package*.json ./

# Create data directory for SQLite database
RUN mkdir -p /app/data && chown -R nodejs:nodejs /app/data

# Switch to non-root user
USER nodejs

# Create a healthcheck script
RUN echo '#!/bin/sh\nwget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1' > healthcheck.sh && \
    chmod +x healthcheck.sh

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ./healthcheck.sh

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/database.db

# Start the application
CMD ["npm", "start"]