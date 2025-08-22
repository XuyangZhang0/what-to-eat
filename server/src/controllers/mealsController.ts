import { Request, Response } from 'express';
import { MealModel } from '@/models/Meal.js';
import { RandomSelectionService } from '@/services/randomSelectionService.js';
import { asyncHandler } from '@/middleware/errorHandler.js';
import { SearchFilters, PaginationOptions } from '@/models/types.js';
import { db } from '@/database/connection.js';

export class MealsController {
  // Get all meals for user with filtering and pagination
  static getMeals = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const userId = req.user.user_id;
    const {
      search,
      cuisine_type,
      difficulty_level,
      prep_time_max,
      is_favorite,
      tag_ids,
      page = 1,
      limit = 20,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const filters: SearchFilters = {};
    if (search) filters.search = search as string;
    if (cuisine_type) filters.cuisine_type = cuisine_type as string;
    if (difficulty_level) filters.difficulty_level = difficulty_level as any;
    if (prep_time_max) filters.prep_time_max = Number(prep_time_max);
    if (is_favorite !== undefined) filters.is_favorite = is_favorite === 'true';
    if (tag_ids && Array.isArray(tag_ids)) filters.tag_ids = tag_ids as unknown as number[];

    const pagination: PaginationOptions = {
      page: Number(page),
      limit: Number(limit),
      sort_by: sort_by as string,
      sort_order: sort_order as 'asc' | 'desc'
    };

    const { meals, total } = MealModel.findByUserId(userId, filters, pagination);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: meals,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        total_pages: totalPages
      }
    });
  });

  // Discover public meals from all users
  static discoverMeals = asyncHandler(async (req: Request, res: Response) => {
    const {
      search,
      cuisine_type,
      difficulty_level,
      prep_time_max,
      tag_ids,
      page = 1,
      limit = 20,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const filters: SearchFilters = {};
    if (search) filters.search = search as string;
    if (cuisine_type) filters.cuisine_type = cuisine_type as string;
    if (difficulty_level) filters.difficulty_level = difficulty_level as any;
    if (prep_time_max) filters.prep_time_max = Number(prep_time_max);
    if (tag_ids && Array.isArray(tag_ids)) filters.tag_ids = tag_ids as unknown as number[];

    const pagination: PaginationOptions = {
      page: Number(page),
      limit: Number(limit),
      sort_by: sort_by as string,
      sort_order: sort_order as 'asc' | 'desc'
    };

    const { meals, total } = MealModel.findAllPublic(filters, pagination);
    
    // If user is authenticated, check their favorite status for each meal
    let mealsWithFavoriteStatus = meals;
    if (req.user) {
      const userId = req.user.user_id;
      
      // Get user's favorites for the current set of meals from user_favorites table (cross-user favorites)
      const mealIds = meals.map(meal => meal.id);
      let favoriteMealIds: number[] = [];
      
      if (mealIds.length > 0) {
        const placeholders = mealIds.map(() => '?').join(',');
        const favoritesStmt = db.prepare(`
          SELECT item_id 
          FROM user_favorites 
          WHERE user_id = ? AND item_type = 'meal' AND item_id IN (${placeholders})
        `);
        favoriteMealIds = favoritesStmt.all(userId, ...mealIds).map((row: any) => row.item_id);
      }
      
      // Add isFavorite property to each meal
      // For own meals: use is_favorite field, for other user's meals: use user_favorites table
      mealsWithFavoriteStatus = meals.map(meal => ({
        ...meal,
        isFavorite: meal.user_id === userId ? meal.is_favorite : favoriteMealIds.includes(meal.id)
      }));
    } else {
      // For unauthenticated users, set all favorites to false
      mealsWithFavoriteStatus = meals.map(meal => ({
        ...meal,
        isFavorite: false
      }));
    }

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: mealsWithFavoriteStatus,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        total_pages: totalPages
      }
    });
  });

  // Get single meal by ID
  static getMeal = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const mealId = Number(req.params.id);
    const meal = MealModel.findById(mealId);

    if (!meal) {
      return res.status(404).json({
        success: false,
        error: 'Meal not found'
      });
    }

    // Allow viewing any meal - users can view details of discovered meals from other users
    // Access control is only needed for modification endpoints (update, delete, toggle favorite)
    
    // Add favorite status for the requesting user
    let mealWithFavoriteStatus: any = { ...meal };
    
    // If it's the user's own meal, use the meal's is_favorite field
    if (meal.user_id === req.user.user_id) {
      mealWithFavoriteStatus.isFavorite = meal.is_favorite;
    } else {
      // If it's another user's meal, check user_favorites table for cross-user favorites
      const favoriteStmt = db.prepare(`
        SELECT 1 FROM user_favorites 
        WHERE user_id = ? AND item_type = 'meal' AND item_id = ?
      `);
      const isFavorite = favoriteStmt.get(req.user.user_id, mealId);
      mealWithFavoriteStatus.isFavorite = !!isFavorite;
    }

    res.json({
      success: true,
      data: mealWithFavoriteStatus
    });
  });

  // Public meal viewing endpoint - allows viewing any meal with optional authentication
  static viewMeal = asyncHandler(async (req: Request, res: Response) => {
    const mealId = Number(req.params.id);
    const meal = MealModel.findById(mealId);

    if (!meal) {
      return res.status(404).json({
        success: false,
        error: 'Meal not found'
      });
    }

    // Add favorite status based on authentication
    let mealWithFavoriteStatus = { ...meal };

    if (req.user) {
      // User is authenticated, check favorite status
      const userId = req.user.user_id;
      
      if (meal.user_id === userId) {
        // User's own meal, use the meal's is_favorite field
        (mealWithFavoriteStatus as any).isFavorite = Boolean(meal.is_favorite);
      } else {
        // Other user's meal, check user_favorites table
        const favoriteStmt = db.prepare(`
          SELECT 1 FROM user_favorites 
          WHERE user_id = ? AND item_type = 'meal' AND item_id = ?
        `);
        const isFavorite = favoriteStmt.get(userId, mealId);
        (mealWithFavoriteStatus as any).isFavorite = !!isFavorite;
      }
    } else {
      // Not authenticated, set favorite as false
      (mealWithFavoriteStatus as any).isFavorite = false;
    }

    res.json({
      success: true,
      data: mealWithFavoriteStatus
    });
  });

  // Create new meal
  static createMeal = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const mealData = {
      ...req.body,
      user_id: req.user.user_id
    };

    const meal = MealModel.create(mealData);

    res.status(201).json({
      success: true,
      data: meal,
      message: 'Meal created successfully'
    });
  });

  // Update meal
  static updateMeal = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const mealId = Number(req.params.id);
    const existingMeal = MealModel.findById(mealId);

    if (!existingMeal) {
      return res.status(404).json({
        success: false,
        error: 'Meal not found'
      });
    }

    // Check if meal belongs to user
    if (existingMeal.user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const updatedMeal = MealModel.update(mealId, req.body);

    if (!updatedMeal) {
      return res.status(404).json({
        success: false,
        error: 'Failed to update meal'
      });
    }

    res.json({
      success: true,
      data: updatedMeal,
      message: 'Meal updated successfully'
    });
  });

  // Delete meal
  static deleteMeal = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const mealId = Number(req.params.id);
    const existingMeal = MealModel.findById(mealId);

    if (!existingMeal) {
      return res.status(404).json({
        success: false,
        error: 'Meal not found'
      });
    }

    // Check if meal belongs to user
    if (existingMeal.user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const deleted = MealModel.delete(mealId);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete meal'
      });
    }

    res.json({
      success: true,
      message: 'Meal deleted successfully'
    });
  });

  // Get random meal
  static getRandomMeal = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const userId = req.user.user_id;
    const {
      exclude_recent_days = 7,
      weight_favorites = true,
      cuisine_type,
      difficulty_level,
      prep_time_max,
      is_favorite,
      tag_ids
    } = req.query;

    const filters: SearchFilters = {};
    if (cuisine_type) filters.cuisine_type = cuisine_type as string;
    if (difficulty_level) filters.difficulty_level = difficulty_level as any;
    if (prep_time_max) filters.prep_time_max = Number(prep_time_max);
    if (is_favorite !== undefined) filters.is_favorite = is_favorite === 'true';
    if (tag_ids && Array.isArray(tag_ids)) filters.tag_ids = tag_ids as unknown as number[];

    const meal = await RandomSelectionService.getRandomMeal(
      userId,
      Number(exclude_recent_days),
      weight_favorites === 'true',
      filters
    );

    if (!meal) {
      return res.status(404).json({
        success: false,
        error: 'No meals found matching criteria'
      });
    }

    res.json({
      success: true,
      data: meal
    });
  });

  // Search meals
  static searchMeals = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const userId = req.user.user_id;
    const { q: search, ...otherFilters } = req.query;

    const filters: SearchFilters = { search: search as string };
    
    // Apply other filters from query
    if (otherFilters.cuisine_type) filters.cuisine_type = otherFilters.cuisine_type as string;
    if (otherFilters.difficulty_level) filters.difficulty_level = otherFilters.difficulty_level as any;
    if (otherFilters.prep_time_max) filters.prep_time_max = Number(otherFilters.prep_time_max);
    if (otherFilters.is_favorite !== undefined) filters.is_favorite = otherFilters.is_favorite === 'true';
    if (otherFilters.tag_ids && Array.isArray(otherFilters.tag_ids)) filters.tag_ids = otherFilters.tag_ids as unknown as number[];

    const pagination: PaginationOptions = {
      page: Number(otherFilters.page) || 1,
      limit: Number(otherFilters.limit) || 20,
      sort_by: otherFilters.sort_by as string || 'created_at',
      sort_order: otherFilters.sort_order as 'asc' | 'desc' || 'desc'
    };

    const { meals, total } = MealModel.findByUserId(userId, filters, pagination);

    const totalPages = Math.ceil(total / pagination.limit!);

    res.json({
      success: true,
      data: meals,
      pagination: {
        page: pagination.page!,
        limit: pagination.limit!,
        total,
        total_pages: totalPages
      }
    });
  });

  // Get cuisine types for user's meals
  static getCuisineTypes = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const userId = req.user.user_id;
    const cuisineTypes = MealModel.getCuisineTypes(userId);

    res.json({
      success: true,
      data: cuisineTypes
    });
  });

  // Get meal statistics
  static getStats = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const userId = req.user.user_id;
    const stats = MealModel.getStats(userId);

    res.json({
      success: true,
      data: stats
    });
  });

  // Toggle favorite status
  static toggleFavorite = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const mealId = Number(req.params.id);
    const userId = req.user.user_id;
    const existingMeal = MealModel.findById(mealId);

    if (!existingMeal) {
      return res.status(404).json({
        success: false,
        error: 'Meal not found'
      });
    }

    let isFavorite: boolean;

    // Handle favorites based on meal ownership
    if (existingMeal.user_id === userId) {
      // For own meals, update the meal's is_favorite field
      const newFavoriteStatus = !existingMeal.is_favorite;
      MealModel.update(mealId, {
        is_favorite: newFavoriteStatus
      });
      isFavorite = newFavoriteStatus;
    } else {
      // For other users' meals, use the user_favorites table
      const favoriteCheckStmt = db.prepare(`
        SELECT 1 FROM user_favorites 
        WHERE user_id = ? AND item_type = 'meal' AND item_id = ?
      `);
      const currentlyFavorite = favoriteCheckStmt.get(userId, mealId);

      if (currentlyFavorite) {
        // Remove from favorites
        const deleteStmt = db.prepare(`
          DELETE FROM user_favorites 
          WHERE user_id = ? AND item_type = 'meal' AND item_id = ?
        `);
        deleteStmt.run(userId, mealId);
        isFavorite = false;
      } else {
        // Add to favorites
        const insertStmt = db.prepare(`
          INSERT INTO user_favorites (user_id, item_type, item_id, created_at)
          VALUES (?, 'meal', ?, datetime('now'))
        `);
        insertStmt.run(userId, mealId);
        isFavorite = true;
      }
    }

    res.json({
      success: true,
      data: { isFavorite },
      message: `Meal ${isFavorite ? 'added to' : 'removed from'} favorites`
    });
  });
}