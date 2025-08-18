import { Router } from 'express';
import authRoutes from './auth';
import mealRoutes from './meals';
import restaurantRoutes from './restaurants';
import tagRoutes from './tags';
import randomRoutes from './random';
import dbManager from '../database/connection';

const router = Router();

// Enhanced health check endpoint
router.get('/health', (req, res) => {
  const healthCheck = {
    success: true,
    message: 'What to Eat API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    database: 'connected',
    memory: process.memoryUsage()
  };

  try {
    // Test database connection
    const db = dbManager.getDatabase();
    const result = db.prepare('SELECT 1 as test').get() as { test: number } | undefined;
    
    if (result?.test === 1) {
      healthCheck.database = 'connected';
    } else {
      healthCheck.database = 'error';
      healthCheck.success = false;
    }
  } catch (error) {
    healthCheck.database = 'error';
    healthCheck.success = false;
    console.error('Health check database error:', error);
  }

  const statusCode = healthCheck.success ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

// Liveness probe (minimal check)
router.get('/health/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

// Readiness probe (full system check)
router.get('/health/ready', (req, res) => {
  try {
    // Test database connection
    const db = dbManager.getDatabase();
    const result = db.prepare('SELECT 1 as test').get() as { test: number } | undefined;
    
    if (result?.test === 1) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        database: 'connected'
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        database: 'error'
      });
    }
  } catch (error) {
    console.error('Readiness check error:', error);
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      database: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API version info
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'What to Eat API v1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      meals: '/api/meals',
      restaurants: '/api/restaurants',
      tags: '/api/tags',
      random: '/api/random'
    }
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/meals', mealRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/tags', tagRoutes);
router.use('/random', randomRoutes);

export default router;