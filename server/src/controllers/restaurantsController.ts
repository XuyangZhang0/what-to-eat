import { Request, Response } from 'express';
import { RestaurantModel } from '@/models/Restaurant.js';
import { RandomSelectionService } from '@/services/randomSelectionService.js';
import { asyncHandler } from '@/middleware/errorHandler.js';
import { SearchFilters, PaginationOptions } from '@/models/types.js';
import { db } from '@/database/connection.js';

export class RestaurantsController {
  // Get all restaurants for user with filtering and pagination
  static getRestaurants = asyncHandler(async (req: Request, res: Response) => {
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
      price_range,
      rating_min,
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
    if (price_range) filters.price_range = price_range as any;
    if (rating_min) filters.rating_min = Number(rating_min);
    if (is_favorite !== undefined) filters.is_favorite = is_favorite === 'true';
    if (tag_ids && Array.isArray(tag_ids)) filters.tag_ids = tag_ids as unknown as number[];

    const pagination: PaginationOptions = {
      page: Number(page),
      limit: Number(limit),
      sort_by: sort_by as string,
      sort_order: sort_order as 'asc' | 'desc'
    };

    const { restaurants, total } = RestaurantModel.findByUserId(userId, filters, pagination);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: restaurants,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        total_pages: totalPages
      }
    });
  });

  // Discover public restaurants from all users
  static discoverRestaurants = asyncHandler(async (req: Request, res: Response) => {
    const {
      search,
      cuisine_type,
      price_range,
      rating_min,
      tag_ids,
      page = 1,
      limit = 20,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const filters: SearchFilters = {};
    if (search) filters.search = search as string;
    if (cuisine_type) filters.cuisine_type = cuisine_type as string;
    if (price_range) filters.price_range = price_range as any;
    if (rating_min) filters.rating_min = Number(rating_min);
    if (tag_ids && Array.isArray(tag_ids)) filters.tag_ids = tag_ids as unknown as number[];

    const pagination: PaginationOptions = {
      page: Number(page),
      limit: Number(limit),
      sort_by: sort_by as string,
      sort_order: sort_order as 'asc' | 'desc'
    };

    const { restaurants, total } = RestaurantModel.findAllPublic(filters, pagination);
    
    // If user is authenticated, check their favorite status for each restaurant
    let restaurantsWithFavoriteStatus = restaurants;
    if (req.user) {
      const userId = req.user.user_id;
      
      // Get user's favorites for the current set of restaurants from user_favorites table (cross-user favorites)
      const restaurantIds = restaurants.map(restaurant => restaurant.id);
      let favoriteRestaurantIds: number[] = [];
      
      if (restaurantIds.length > 0) {
        const placeholders = restaurantIds.map(() => '?').join(',');
        const favoritesStmt = db.prepare(`
          SELECT item_id 
          FROM user_favorites 
          WHERE user_id = ? AND item_type = 'restaurant' AND item_id IN (${placeholders})
        `);
        favoriteRestaurantIds = favoritesStmt.all(userId, ...restaurantIds).map((row: any) => row.item_id);
      }
      
      // Add isFavorite property to each restaurant
      // For own restaurants: use is_favorite field, for other user's restaurants: use user_favorites table
      restaurantsWithFavoriteStatus = restaurants.map(restaurant => ({
        ...restaurant,
        isFavorite: restaurant.user_id === userId ? Boolean(restaurant.is_favorite) : favoriteRestaurantIds.includes(restaurant.id)
      }));
    } else {
      // For unauthenticated users, set all favorites to false
      restaurantsWithFavoriteStatus = restaurants.map(restaurant => ({
        ...restaurant,
        isFavorite: false
      }));
    }

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: restaurantsWithFavoriteStatus,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        total_pages: totalPages
      }
    });
  });

  // Get single restaurant by ID
  static getRestaurant = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const restaurantId = Number(req.params.id);
    const restaurant = RestaurantModel.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found'
      });
    }

    // Check if restaurant belongs to user
    if (restaurant.user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: restaurant
    });
  });

  // Public restaurant viewing endpoint - allows viewing any restaurant with optional authentication
  static viewRestaurant = asyncHandler(async (req: Request, res: Response) => {
    const restaurantId = Number(req.params.id);
    const restaurant = RestaurantModel.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found'
      });
    }

    // Add favorite status based on authentication
    let restaurantWithFavoriteStatus = { ...restaurant };

    if (req.user) {
      // User is authenticated, check favorite status
      const userId = req.user.user_id;
      
      if (restaurant.user_id === userId) {
        // User's own restaurant, use the restaurant's is_favorite field
        (restaurantWithFavoriteStatus as any).isFavorite = Boolean(restaurant.is_favorite);
      } else {
        // Other user's restaurant, check user_favorites table
        const favoriteStmt = db.prepare(`
          SELECT 1 FROM user_favorites 
          WHERE user_id = ? AND item_type = 'restaurant' AND item_id = ?
        `);
        const isFavorite = favoriteStmt.get(userId, restaurantId);
        (restaurantWithFavoriteStatus as any).isFavorite = !!isFavorite;
      }
    } else {
      // Not authenticated, set favorite as false
      (restaurantWithFavoriteStatus as any).isFavorite = false;
    }

    res.json({
      success: true,
      data: restaurantWithFavoriteStatus
    });
  });

  // Create new restaurant
  static createRestaurant = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const restaurantData = {
      ...req.body,
      user_id: req.user.user_id
    };

    const restaurant = RestaurantModel.create(restaurantData);

    res.status(201).json({
      success: true,
      data: restaurant,
      message: 'Restaurant created successfully'
    });
  });

  // Update restaurant
  static updateRestaurant = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const restaurantId = Number(req.params.id);
    const existingRestaurant = RestaurantModel.findById(restaurantId);

    if (!existingRestaurant) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found'
      });
    }

    // Check if restaurant belongs to user
    if (existingRestaurant.user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const updatedRestaurant = RestaurantModel.update(restaurantId, req.body);

    if (!updatedRestaurant) {
      return res.status(404).json({
        success: false,
        error: 'Failed to update restaurant'
      });
    }

    res.json({
      success: true,
      data: updatedRestaurant,
      message: 'Restaurant updated successfully'
    });
  });

  // Delete restaurant
  static deleteRestaurant = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const restaurantId = Number(req.params.id);
    const existingRestaurant = RestaurantModel.findById(restaurantId);

    if (!existingRestaurant) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found'
      });
    }

    // Check if restaurant belongs to user
    if (existingRestaurant.user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const deleted = RestaurantModel.delete(restaurantId);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete restaurant'
      });
    }

    res.json({
      success: true,
      message: 'Restaurant deleted successfully'
    });
  });

  // Get random restaurant
  static getRandomRestaurant = asyncHandler(async (req: Request, res: Response) => {
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
      price_range,
      rating_min,
      is_favorite,
      tag_ids
    } = req.query;

    const filters: SearchFilters = {};
    if (cuisine_type) filters.cuisine_type = cuisine_type as string;
    if (price_range) filters.price_range = price_range as any;
    if (rating_min) filters.rating_min = Number(rating_min);
    if (is_favorite !== undefined) filters.is_favorite = is_favorite === 'true';
    if (tag_ids && Array.isArray(tag_ids)) filters.tag_ids = tag_ids as unknown as number[];

    const restaurant = await RandomSelectionService.getRandomRestaurant(
      userId,
      Number(exclude_recent_days),
      weight_favorites === 'true',
      filters
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: 'No restaurants found matching criteria'
      });
    }

    res.json({
      success: true,
      data: restaurant
    });
  });

  // Search restaurants
  static searchRestaurants = asyncHandler(async (req: Request, res: Response) => {
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
    if (otherFilters.price_range) filters.price_range = otherFilters.price_range as any;
    if (otherFilters.rating_min) filters.rating_min = Number(otherFilters.rating_min);
    if (otherFilters.is_favorite !== undefined) filters.is_favorite = otherFilters.is_favorite === 'true';
    if (otherFilters.tag_ids && Array.isArray(otherFilters.tag_ids)) filters.tag_ids = otherFilters.tag_ids as unknown as number[];

    const pagination: PaginationOptions = {
      page: Number(otherFilters.page) || 1,
      limit: Number(otherFilters.limit) || 20,
      sort_by: otherFilters.sort_by as string || 'created_at',
      sort_order: otherFilters.sort_order as 'asc' | 'desc' || 'desc'
    };

    const { restaurants, total } = RestaurantModel.findByUserId(userId, filters, pagination);

    const totalPages = Math.ceil(total / pagination.limit!);

    res.json({
      success: true,
      data: restaurants,
      pagination: {
        page: pagination.page!,
        limit: pagination.limit!,
        total,
        total_pages: totalPages
      }
    });
  });

  // Get cuisine types for user's restaurants
  static getCuisineTypes = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const userId = req.user.user_id;
    const cuisineTypes = RestaurantModel.getCuisineTypes(userId);

    res.json({
      success: true,
      data: cuisineTypes
    });
  });

  // Get price ranges for user's restaurants
  static getPriceRanges = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const userId = req.user.user_id;
    const priceRanges = RestaurantModel.getPriceRanges(userId);

    res.json({
      success: true,
      data: priceRanges
    });
  });

  // Get restaurant statistics
  static getStats = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const userId = req.user.user_id;
    const stats = RestaurantModel.getStats(userId);

    res.json({
      success: true,
      data: stats
    });
  });

  // Get top rated restaurants
  static getTopRated = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const userId = req.user.user_id;
    const limit = Number(req.query.limit) || 5;
    const topRated = RestaurantModel.getTopRated(userId, limit);

    res.json({
      success: true,
      data: topRated
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

    const restaurantId = Number(req.params.id);
    const existingRestaurant = RestaurantModel.findById(restaurantId);

    if (!existingRestaurant) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found'
      });
    }

    // Check if restaurant belongs to user
    if (existingRestaurant.user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const updatedRestaurant = RestaurantModel.update(restaurantId, {
      is_favorite: !existingRestaurant.is_favorite
    });

    res.json({
      success: true,
      data: updatedRestaurant,
      message: `Restaurant ${updatedRestaurant?.is_favorite ? 'added to' : 'removed from'} favorites`
    });
  });

  // Get restaurant name suggestions for autocomplete
  static getRestaurantSuggestions = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const userId = req.user.user_id;
    const { q: query } = req.query;
    const limit = Number(req.query.limit) || 10;

    if (!query || typeof query !== 'string' || query.trim().length < 1) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Search for restaurants by name (partial match)
    const filters: SearchFilters = { 
      search: query.trim()
    };

    const { restaurants } = RestaurantModel.findByUserId(userId, filters, { 
      limit,
      sort_by: 'name',
      sort_order: 'asc'
    });

    // Return simplified data for autocomplete suggestions
    const suggestions = restaurants.map(restaurant => ({
      id: restaurant.id,
      name: restaurant.name,
      cuisine_type: restaurant.cuisine_type,
      address: restaurant.address,
      phone: restaurant.phone,
      price_range: restaurant.price_range,
      rating: restaurant.rating,
      opening_hours: restaurant.opening_hours
    }));

    res.json({
      success: true,
      data: suggestions
    });
  });
}