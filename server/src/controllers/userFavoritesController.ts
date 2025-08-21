import { Request, Response } from 'express';
import { db } from '@/database/connection.js';
import { asyncHandler } from '@/middleware/errorHandler.js';

export class UserFavoritesController {
  // Toggle favorite status for discovered items (different from editing own items)
  static toggleMealFavorite = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const mealId = Number(req.params.id);
    const userId = req.user.user_id;

    // Check if meal exists
    const checkMealStmt = db.prepare('SELECT id FROM meals WHERE id = ?');
    const meal = checkMealStmt.get(mealId);

    if (!meal) {
      return res.status(404).json({
        success: false,
        error: 'Meal not found'
      });
    }

    // Check if user already has this meal favorited
    const checkFavoriteStmt = db.prepare(`
      SELECT id FROM user_favorites 
      WHERE user_id = ? AND item_type = 'meal' AND item_id = ?
    `);
    const existingFavorite = checkFavoriteStmt.get(userId, mealId);

    if (existingFavorite) {
      // Remove from favorites
      const deleteStmt = db.prepare(`
        DELETE FROM user_favorites 
        WHERE user_id = ? AND item_type = 'meal' AND item_id = ?
      `);
      deleteStmt.run(userId, mealId);

      res.json({
        success: true,
        data: { is_favorite: false },
        message: 'Removed from favorites'
      });
    } else {
      // Add to favorites
      const insertStmt = db.prepare(`
        INSERT INTO user_favorites (user_id, item_type, item_id, created_at)
        VALUES (?, 'meal', ?, datetime('now'))
      `);
      insertStmt.run(userId, mealId);

      res.json({
        success: true,
        data: { is_favorite: true },
        message: 'Added to favorites'
      });
    }
  });

  static toggleRestaurantFavorite = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const restaurantId = Number(req.params.id);
    const userId = req.user.user_id;

    // Check if restaurant exists
    const checkRestaurantStmt = db.prepare('SELECT id FROM restaurants WHERE id = ?');
    const restaurant = checkRestaurantStmt.get(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found'
      });
    }

    // Check if user already has this restaurant favorited
    const checkFavoriteStmt = db.prepare(`
      SELECT id FROM user_favorites 
      WHERE user_id = ? AND item_type = 'restaurant' AND item_id = ?
    `);
    const existingFavorite = checkFavoriteStmt.get(userId, restaurantId);

    if (existingFavorite) {
      // Remove from favorites
      const deleteStmt = db.prepare(`
        DELETE FROM user_favorites 
        WHERE user_id = ? AND item_type = 'restaurant' AND item_id = ?
      `);
      deleteStmt.run(userId, restaurantId);

      res.json({
        success: true,
        data: { is_favorite: false },
        message: 'Removed from favorites'
      });
    } else {
      // Add to favorites
      const insertStmt = db.prepare(`
        INSERT INTO user_favorites (user_id, item_type, item_id, created_at)
        VALUES (?, 'restaurant', ?, datetime('now'))
      `);
      insertStmt.run(userId, restaurantId);

      res.json({
        success: true,
        data: { is_favorite: true },
        message: 'Added to favorites'
      });
    }
  });
}