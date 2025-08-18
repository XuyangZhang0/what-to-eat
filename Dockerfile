# Multi-stage build for React frontend
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

FROM base AS development
# Install dependencies
RUN npm ci
# Copy source code
COPY . .
# Expose port
EXPOSE 5173
# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

FROM base AS build
# Install dependencies
RUN npm ci
# Copy source code
COPY . .
# Build the application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine AS production

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Create non-root user for Nginx
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001

# Create necessary directories and set permissions
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R nginx-user:nginx-user /var/cache/nginx /var/log/nginx /var/run /usr/share/nginx/html

# Switch to non-root user
USER nginx-user

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Expose port
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]