import { Router } from 'express';
import { RestaurantSearchController } from '@/controllers/restaurantSearchController.js';
import { requireAuth } from '@/middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// GET /api/restaurant-search?q=pizza&lat=40.7128&lng=-74.0060&radius=5000
router.get('/', RestaurantSearchController.searchExternalRestaurants);

// GET /api/restaurant-search/details/:place_id
router.get('/details/:place_id', RestaurantSearchController.getRestaurantDetails);

export default router;