import { Request, Response } from 'express';
import { RandomSelectionService } from '@/services/randomSelectionService.js';
import { SelectionHistoryModel } from '@/models/SelectionHistory.js';
import { asyncHandler } from '@/middleware/errorHandler.js';
import { SearchFilters } from '@/models/types.js';

export class RandomController {
  // Get a random suggestion (meal or restaurant)
  static getRandomSuggestion = asyncHandler(async (req: Request, res: Response) => {
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
      type,
      filters = {}
    } = req.body;

    let suggestion;

    if (type === 'meal') {
      const meal = await RandomSelectionService.getRandomMeal(
        userId,
        exclude_recent_days,
        weight_favorites,
        filters
      );
      suggestion = meal ? { meal, type: 'meal' } : null;
    } else if (type === 'restaurant') {
      const restaurant = await RandomSelectionService.getRandomRestaurant(
        userId,
        exclude_recent_days,
        weight_favorites,
        filters
      );
      suggestion = restaurant ? { restaurant, type: 'restaurant' } : null;
    } else {
      suggestion = await RandomSelectionService.getRandomSuggestion(userId, {
        exclude_recent_days,
        weight_favorites,
        filters
      });
    }

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        error: 'No items found matching criteria'
      });
    }

    res.json({
      success: true,
      data: suggestion
    });
  });

  // Pick a random item and record it in history
  static pickRandom = asyncHandler(async (req: Request, res: Response) => {
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
      type,
      filters = {}
    } = req.body;

    let suggestion;

    if (type === 'meal') {
      const meal = await RandomSelectionService.getRandomMeal(
        userId,
        exclude_recent_days,
        weight_favorites,
        filters
      );
      suggestion = meal ? { meal, type: 'meal' } : null;
    } else if (type === 'restaurant') {
      const restaurant = await RandomSelectionService.getRandomRestaurant(
        userId,
        exclude_recent_days,
        weight_favorites,
        filters
      );
      suggestion = restaurant ? { restaurant, type: 'restaurant' } : null;
    } else {
      suggestion = await RandomSelectionService.getRandomSuggestion(userId, {
        exclude_recent_days,
        weight_favorites,
        filters
      });
    }

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        error: 'No items found matching criteria'
      });
    }

    // Record the selection in history
    const itemId = suggestion.type === 'meal' 
      ? suggestion.meal!.id 
      : suggestion.restaurant!.id;

    await RandomSelectionService.recordSelection(userId, suggestion.type as 'meal' | 'restaurant', itemId);

    res.json({
      success: true,
      data: suggestion,
      message: 'Selection recorded successfully'
    });
  });

  // Get time-based suggestion
  static getTimeBasedSuggestion = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const userId = req.user.user_id;
    const suggestion = await RandomSelectionService.getTimeBasedSuggestion(userId);

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        error: 'No items found for current time'
      });
    }

    res.json({
      success: true,
      data: suggestion
    });
  });

  // Get diverse suggestions
  static getDiverseSuggestions = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const userId = req.user.user_id;
    const count = Number(req.query.count) || 3;
    
    const suggestions = await RandomSelectionService.getDiverseSuggestions(userId, count);

    res.json({
      success: true,
      data: suggestions
    });
  });

  // Get personalized suggestions based on history
  static getPersonalizedSuggestions = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const userId = req.user.user_id;
    const limit = Number(req.query.limit) || 5;
    
    const suggestions = await RandomSelectionService.getPersonalizedSuggestions(userId, limit);

    res.json({
      success: true,
      data: suggestions
    });
  });

  // Get selection history
  static getSelectionHistory = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const userId = req.user.user_id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;

    const { history, total } = SelectionHistoryModel.findByUserId(userId, page, limit);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: history,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages
      }
    });
  });

  // Get selection statistics
  static getSelectionStats = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const userId = req.user.user_id;
    const days = Number(req.query.days) || 30;

    const stats = SelectionHistoryModel.getSelectionStats(userId, days);
    const dailyTrends = SelectionHistoryModel.getDailyTrends(userId, days);
    const mostSelectedMeals = SelectionHistoryModel.getMostSelected(userId, 'meal' as const, 5);
    const mostSelectedRestaurants = SelectionHistoryModel.getMostSelected(userId, 'restaurant' as const, 5);

    res.json({
      success: true,
      data: {
        stats,
        daily_trends: dailyTrends,
        most_selected_meals: mostSelectedMeals,
        most_selected_restaurants: mostSelectedRestaurants
      }
    });
  });

  // Clear selection history
  static clearSelectionHistory = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const userId = req.user.user_id;
    const deletedCount = SelectionHistoryModel.deleteByUserId(userId);

    res.json({
      success: true,
      message: `Cleared ${deletedCount} selection history entries`,
      data: { deleted_count: deletedCount }
    });
  });

  // Get quick suggestions for different scenarios
  static getQuickSuggestions = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const userId = req.user.user_id;

    // Get different types of suggestions
    const [
      quickMeal,
      favoriteRestaurant,
      randomSuggestion,
      timeBasedSuggestion
    ] = await Promise.all([
      RandomSelectionService.getRandomMeal(userId, 7, true, { 
        prep_time_max: 30, 
        difficulty_level: 'easy' 
      }),
      RandomSelectionService.getRandomRestaurant(userId, 7, true, { 
        is_favorite: true 
      }),
      RandomSelectionService.getRandomSuggestion(userId),
      RandomSelectionService.getTimeBasedSuggestion(userId)
    ]);

    const suggestions = {
      quick_meal: quickMeal ? { meal: quickMeal, type: 'meal' } : null,
      favorite_restaurant: favoriteRestaurant ? { restaurant: favoriteRestaurant, type: 'restaurant' } : null,
      random_suggestion: randomSuggestion,
      time_based_suggestion: timeBasedSuggestion
    };

    res.json({
      success: true,
      data: suggestions
    });
  });
}