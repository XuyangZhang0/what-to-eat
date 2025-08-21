import { Router } from 'express';
import { MealsController } from '@/controllers/mealsController.js';
import { requireAuth, optionalAuth } from '@/middleware/auth.js';
import { 
  validateBody, 
  validateQuery, 
  validateParams,
  parseIdParam,
  parseTagIds,
  parsePagination,
  sanitizeSearch
} from '@/middleware/validation.js';
import { 
  mealCreateSchema, 
  mealUpdateSchema, 
  searchQuerySchema,
  idParamSchema 
} from '@/validation/schemas.js';

const router = Router();

// Discovery endpoint for cross-user meal browsing (auth optional)
router.get('/discover', 
  optionalAuth,
  parseTagIds,
  parsePagination,
  sanitizeSearch,
  validateQuery(searchQuerySchema), 
  MealsController.discoverMeals
);

// All other routes require authentication
router.use(requireAuth);

// Middleware for parsing query parameters
router.use(parseTagIds);
router.use(parsePagination);
router.use(sanitizeSearch);

// GET /api/meals - Get all meals with filtering and pagination
router.get('/', 
  validateQuery(searchQuerySchema), 
  MealsController.getMeals
);

// GET /api/meals/random - Get random meal
router.get('/random', MealsController.getRandomMeal);

// GET /api/meals/search - Search meals
router.get('/search', 
  validateQuery(searchQuerySchema), 
  MealsController.searchMeals
);

// GET /api/meals/cuisine-types - Get cuisine types
router.get('/cuisine-types', MealsController.getCuisineTypes);

// GET /api/meals/stats - Get meal statistics
router.get('/stats', MealsController.getStats);

// POST /api/meals - Create new meal
router.post('/', 
  validateBody(mealCreateSchema), 
  MealsController.createMeal
);

// GET /api/meals/:id - Get single meal
router.get('/:id', 
  parseIdParam,
  validateParams(idParamSchema), 
  MealsController.getMeal
);

// PUT /api/meals/:id - Update meal
router.put('/:id', 
  parseIdParam,
  validateParams(idParamSchema),
  validateBody(mealUpdateSchema), 
  MealsController.updateMeal
);

// DELETE /api/meals/:id - Delete meal
router.delete('/:id', 
  parseIdParam,
  validateParams(idParamSchema), 
  MealsController.deleteMeal
);

// POST /api/meals/:id/favorite - Toggle favorite status
router.post('/:id/favorite', 
  parseIdParam,
  validateParams(idParamSchema), 
  MealsController.toggleFavorite
);

export default router;