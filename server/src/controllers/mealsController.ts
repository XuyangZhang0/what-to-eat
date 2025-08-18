import { Request, Response } from 'express';
import { MealModel } from '@/models/Meal.js';
import { RandomSelectionService } from '@/services/randomSelectionService.js';
import { asyncHandler } from '@/middleware/errorHandler.js';
import { SearchFilters, PaginationOptions } from '@/models/types.js';

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

    // Check if meal belongs to user
    if (meal.user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: meal
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

    const updatedMeal = MealModel.update(mealId, {
      is_favorite: !existingMeal.is_favorite
    });

    res.json({
      success: true,
      data: updatedMeal,
      message: `Meal ${updatedMeal?.is_favorite ? 'added to' : 'removed from'} favorites`
    });
  });

  // Demo endpoints for slot machine (no authentication required)
  static getDemoMeals = asyncHandler(async (req: Request, res: Response) => {
    const demoMeals = [
      {
        id: 'demo-1',
        name: 'Spaghetti Carbonara',
        category: 'dinner',
        cuisine: 'Italian',
        description: 'Classic Italian pasta dish with eggs, cheese, and pancetta',
        difficulty: 'medium',
        cookingTime: 30,
        ingredients: ['Spaghetti', 'Eggs', 'Parmesan', 'Pancetta', 'Black pepper'],
        instructions: ['Cook pasta', 'Prepare sauce', 'Combine'],
        isFavorite: false,
        rating: 4.5
      },
      {
        id: 'demo-2',
        name: 'Chicken Teriyaki',
        category: 'lunch',
        cuisine: 'Japanese',
        description: 'Tender chicken glazed with sweet teriyaki sauce',
        difficulty: 'easy',
        cookingTime: 25,
        ingredients: ['Chicken', 'Soy sauce', 'Mirin', 'Sugar', 'Ginger'],
        instructions: ['Marinate chicken', 'Cook', 'Glaze with sauce'],
        isFavorite: true,
        rating: 4.2
      },
      {
        id: 'demo-3',
        name: 'Beef Tacos',
        category: 'dinner',
        cuisine: 'Mexican',
        description: 'Spicy ground beef tacos with fresh toppings',
        difficulty: 'easy',
        cookingTime: 20,
        ingredients: ['Ground beef', 'Taco shells', 'Lettuce', 'Tomatoes', 'Cheese'],
        instructions: ['Cook beef', 'Warm shells', 'Assemble tacos'],
        isFavorite: false,
        rating: 4.0
      }
    ];

    res.json({
      success: true,
      data: demoMeals
    });
  });

  static getRandomDemoMeal = asyncHandler(async (req: Request, res: Response) => {
    const demoMeals = [
      {
        id: 'demo-1',
        name: 'Spaghetti Carbonara',
        category: 'dinner',
        cuisine: 'Italian',
        description: 'Classic Italian pasta dish with eggs, cheese, and pancetta',
        difficulty: 'medium',
        cookingTime: 30,
        ingredients: ['Spaghetti', 'Eggs', 'Parmesan', 'Pancetta', 'Black pepper'],
        instructions: ['Cook pasta', 'Prepare sauce', 'Combine'],
        isFavorite: false,
        rating: 4.5
      },
      {
        id: 'demo-2',
        name: 'Chicken Teriyaki',
        category: 'lunch',
        cuisine: 'Japanese',
        description: 'Tender chicken glazed with sweet teriyaki sauce',
        difficulty: 'easy',
        cookingTime: 25,
        ingredients: ['Chicken', 'Soy sauce', 'Mirin', 'Sugar', 'Ginger'],
        instructions: ['Marinate chicken', 'Cook', 'Glaze with sauce'],
        isFavorite: true,
        rating: 4.2
      },
      {
        id: 'demo-3',
        name: 'Beef Tacos',
        category: 'dinner',
        cuisine: 'Mexican',
        description: 'Spicy ground beef tacos with fresh toppings',
        difficulty: 'easy',
        cookingTime: 20,
        ingredients: ['Ground beef', 'Taco shells', 'Lettuce', 'Tomatoes', 'Cheese'],
        instructions: ['Cook beef', 'Warm shells', 'Assemble tacos'],
        isFavorite: false,
        rating: 4.0
      }
    ];

    const randomMeal = demoMeals[Math.floor(Math.random() * demoMeals.length)];

    res.json({
      success: true,
      data: randomMeal
    });
  });
}