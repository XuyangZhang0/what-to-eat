import { Router } from 'express';
import { RandomController } from '@/controllers/randomController.js';
import { requireAuth } from '@/middleware/auth.js';
import { validateBody } from '@/middleware/validation.js';
import { randomSelectionSchema } from '@/validation/schemas.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// GET /api/random/suggestion - Get a random suggestion
router.get('/suggestion', RandomController.getRandomSuggestion);

// POST /api/random/pick - Pick a random item and record in history
router.post('/pick', 
  validateBody(randomSelectionSchema), 
  RandomController.pickRandom
);

// GET /api/random/time-based - Get time-based suggestion
router.get('/time-based', RandomController.getTimeBasedSuggestion);

// GET /api/random/diverse - Get diverse suggestions
router.get('/diverse', RandomController.getDiverseSuggestions);

// GET /api/random/personalized - Get personalized suggestions
router.get('/personalized', RandomController.getPersonalizedSuggestions);

// GET /api/random/quick - Get quick suggestions for different scenarios
router.get('/quick', RandomController.getQuickSuggestions);

// GET /api/random/history - Get selection history
router.get('/history', RandomController.getSelectionHistory);

// GET /api/random/stats - Get selection statistics
router.get('/stats', RandomController.getSelectionStats);

// DELETE /api/random/history - Clear selection history
router.delete('/history', RandomController.clearSelectionHistory);

export default router;