import { Request, Response } from 'express';
import { MealModel } from '@/models/Meal.js';
import { RestaurantModel } from '@/models/Restaurant.js';
import { asyncHandler } from '@/middleware/errorHandler.js';
import { db } from '@/database/connection.js';

export class FavoritesController {
  // Get all favorites (meals and restaurants)
  static getAllFavorites = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const userId = req.user.user_id;

    // Get user's own meals marked as favorite
    const { meals: ownFavoriteMeals } = MealModel.findByUserId(userId, { is_favorite: true }, { page: 1, limit: 1000 });
    
    // Get meals from other users that user has favorited
    const userFavoriteMealsStmt = db.prepare(`
      SELECT m.*, u.username as creator_username
      FROM meals m 
      JOIN users u ON m.user_id = u.id
      JOIN user_favorites uf ON uf.item_id = m.id AND uf.item_type = 'meal'
      WHERE uf.user_id = ? AND m.user_id != ?
      ORDER BY uf.created_at DESC
    `);
    
    const userFavoriteMealsRaw = userFavoriteMealsStmt.all(userId, userId) as any[];
    const userFavoriteMeals = userFavoriteMealsRaw.map(meal => ({
      ...meal,
      ingredients: meal.ingredients ? JSON.parse(meal.ingredients) : [],
      instructions: meal.instructions ? JSON.parse(meal.instructions) : [],
      isFavorite: true,
      tags: []
    }));
    
    // Get user's own restaurants marked as favorite
    const { restaurants: ownFavoriteRestaurants } = RestaurantModel.findByUserId(userId, { is_favorite: true }, { page: 1, limit: 1000 });
    
    // Get restaurants from other users that user has favorited
    const userFavoriteRestaurantsStmt = db.prepare(`
      SELECT r.*, u.username as creator_username
      FROM restaurants r 
      JOIN users u ON r.user_id = u.id
      JOIN user_favorites uf ON uf.item_id = r.id AND uf.item_type = 'restaurant'
      WHERE uf.user_id = ? AND r.user_id != ?
      ORDER BY uf.created_at DESC
    `);
    
    const userFavoriteRestaurantsRaw = userFavoriteRestaurantsStmt.all(userId, userId) as any[];
    const userFavoriteRestaurants = userFavoriteRestaurantsRaw.map(restaurant => ({
      ...restaurant,
      opening_hours: restaurant.opening_hours ? JSON.parse(restaurant.opening_hours) : {},
      isFavorite: true,
      tags: []
    }));
    
    // Combine both arrays
    const allFavoriteMeals = [
      ...ownFavoriteMeals.map(meal => ({ ...meal, isFavorite: true })),
      ...userFavoriteMeals
    ];
    
    const allFavoriteRestaurants = [
      ...ownFavoriteRestaurants.map(restaurant => ({ ...restaurant, isFavorite: true })),
      ...userFavoriteRestaurants
    ];

    res.json({
      success: true,
      data: {
        meals: allFavoriteMeals,
        restaurants: allFavoriteRestaurants
      }
    });
  });

  // Get favorite meals only
  static getFavoriteMeals = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const userId = req.user.user_id;
    
    // Get user's own meals marked as favorite
    const { meals: ownFavoriteMeals } = MealModel.findByUserId(userId, { is_favorite: true }, { page: 1, limit: 1000 });
    
    // Get meals from other users that user has favorited
    const userFavoriteMealsStmt = db.prepare(`
      SELECT m.*, u.username as creator_username
      FROM meals m 
      JOIN users u ON m.user_id = u.id
      JOIN user_favorites uf ON uf.item_id = m.id AND uf.item_type = 'meal'
      WHERE uf.user_id = ? AND m.user_id != ?
      ORDER BY uf.created_at DESC
    `);
    
    const userFavoriteMealsRaw = userFavoriteMealsStmt.all(userId, userId) as any[];
    
    // Parse JSON fields and add tags for user favorite meals
    const userFavoriteMeals = userFavoriteMealsRaw.map(meal => ({
      ...meal,
      ingredients: meal.ingredients ? JSON.parse(meal.ingredients) : [],
      instructions: meal.instructions ? JSON.parse(meal.instructions) : [],
      isFavorite: true, // These are definitely favorited by the user
      tags: [] // TODO: Add tags if needed
    }));
    
    // Combine both arrays
    const allFavoriteMeals = [
      ...ownFavoriteMeals.map(meal => ({ ...meal, isFavorite: true })),
      ...userFavoriteMeals
    ];

    res.json({
      success: true,
      data: allFavoriteMeals
    });
  });

  // Get favorite restaurants only
  static getFavoriteRestaurants = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const userId = req.user.user_id;
    
    // Get user's own restaurants marked as favorite
    const { restaurants: ownFavoriteRestaurants } = RestaurantModel.findByUserId(userId, { is_favorite: true }, { page: 1, limit: 1000 });
    
    // Get restaurants from other users that user has favorited
    const userFavoriteRestaurantsStmt = db.prepare(`
      SELECT r.*, u.username as creator_username
      FROM restaurants r 
      JOIN users u ON r.user_id = u.id
      JOIN user_favorites uf ON uf.item_id = r.id AND uf.item_type = 'restaurant'
      WHERE uf.user_id = ? AND r.user_id != ?
      ORDER BY uf.created_at DESC
    `);
    
    const userFavoriteRestaurantsRaw = userFavoriteRestaurantsStmt.all(userId, userId) as any[];
    
    // Parse JSON fields for user favorite restaurants
    const userFavoriteRestaurants = userFavoriteRestaurantsRaw.map(restaurant => ({
      ...restaurant,
      opening_hours: restaurant.opening_hours ? JSON.parse(restaurant.opening_hours) : {},
      isFavorite: true, // These are definitely favorited by the user
      tags: [] // TODO: Add tags if needed
    }));
    
    // Combine both arrays
    const allFavoriteRestaurants = [
      ...ownFavoriteRestaurants.map(restaurant => ({ ...restaurant, isFavorite: true })),
      ...userFavoriteRestaurants
    ];

    res.json({
      success: true,
      data: allFavoriteRestaurants
    });
  });
}