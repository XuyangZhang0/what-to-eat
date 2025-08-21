import { Router } from 'express';
import { RestaurantsController } from '@/controllers/restaurantsController.js';
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
  restaurantCreateSchema, 
  restaurantUpdateSchema, 
  searchQuerySchema,
  idParamSchema 
} from '@/validation/schemas.js';

const router = Router();

// Discovery endpoint for cross-user restaurant browsing (auth optional)
router.get('/discover', 
  optionalAuth,
  parseTagIds,
  parsePagination,
  sanitizeSearch,
  validateQuery(searchQuerySchema), 
  RestaurantsController.discoverRestaurants
);

// Public restaurant viewing endpoint - allows viewing any restaurant with optional authentication
router.get('/view/:id', 
  optionalAuth,
  parseIdParam,
  validateParams(idParamSchema),
  RestaurantsController.viewRestaurant
);

// All other routes require authentication
router.use(requireAuth);

// Middleware for parsing query parameters
router.use(parseTagIds);
router.use(parsePagination);
router.use(sanitizeSearch);

// GET /api/restaurants - Get all restaurants with filtering and pagination
router.get('/', 
  validateQuery(searchQuerySchema), 
  RestaurantsController.getRestaurants
);

// GET /api/restaurants/random - Get random restaurant
router.get('/random', RestaurantsController.getRandomRestaurant);

// GET /api/restaurants/search - Search restaurants
router.get('/search', 
  validateQuery(searchQuerySchema), 
  RestaurantsController.searchRestaurants
);

// GET /api/restaurants/suggestions - Get restaurant name suggestions for autocomplete
router.get('/suggestions', 
  RestaurantsController.getRestaurantSuggestions
);

// GET /api/restaurants/cuisine-types - Get cuisine types
router.get('/cuisine-types', RestaurantsController.getCuisineTypes);

// GET /api/restaurants/price-ranges - Get price ranges
router.get('/price-ranges', RestaurantsController.getPriceRanges);

// GET /api/restaurants/stats - Get restaurant statistics
router.get('/stats', RestaurantsController.getStats);

// GET /api/restaurants/top-rated - Get top rated restaurants
router.get('/top-rated', RestaurantsController.getTopRated);

// POST /api/restaurants - Create new restaurant
router.post('/', 
  validateBody(restaurantCreateSchema), 
  RestaurantsController.createRestaurant
);

// GET /api/restaurants/:id - Get single restaurant
router.get('/:id', 
  parseIdParam,
  validateParams(idParamSchema), 
  RestaurantsController.getRestaurant
);

// PUT /api/restaurants/:id - Update restaurant
router.put('/:id', 
  parseIdParam,
  validateParams(idParamSchema),
  validateBody(restaurantUpdateSchema), 
  RestaurantsController.updateRestaurant
);

// DELETE /api/restaurants/:id - Delete restaurant
router.delete('/:id', 
  parseIdParam,
  validateParams(idParamSchema), 
  RestaurantsController.deleteRestaurant
);

// POST /api/restaurants/:id/favorite - Toggle favorite status
router.post('/:id/favorite', 
  parseIdParam,
  validateParams(idParamSchema), 
  RestaurantsController.toggleFavorite
);

export default router;