import { Router } from 'express';
import { FavoritesController } from '@/controllers/favoritesController.js';
import { requireAuth } from '@/middleware/auth.js';

const router = Router();

// All favorites routes require authentication
router.use(requireAuth);

// GET /api/favorites - Get all favorites (meals and restaurants)
router.get('/', FavoritesController.getAllFavorites);

// GET /api/favorites/meals - Get favorite meals
router.get('/meals', FavoritesController.getFavoriteMeals);

// GET /api/favorites/restaurants - Get favorite restaurants
router.get('/restaurants', FavoritesController.getFavoriteRestaurants);

export default router;