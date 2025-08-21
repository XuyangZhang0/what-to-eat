import { Router } from 'express';
import { UserFavoritesController } from '@/controllers/userFavoritesController.js';
import { requireAuth } from '@/middleware/auth.js';
import { validateParams, parseIdParam } from '@/middleware/validation.js';
import { idParamSchema } from '@/validation/schemas.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// POST /api/user-favorites/meals/:id/toggle - Toggle meal favorite
router.post('/meals/:id/toggle', 
  parseIdParam,
  validateParams(idParamSchema), 
  UserFavoritesController.toggleMealFavorite
);

// POST /api/user-favorites/restaurants/:id/toggle - Toggle restaurant favorite
router.post('/restaurants/:id/toggle', 
  parseIdParam,
  validateParams(idParamSchema), 
  UserFavoritesController.toggleRestaurantFavorite
);

export default router;