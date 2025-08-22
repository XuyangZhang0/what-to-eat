import { Meal, Restaurant } from '@/types'

/**
 * Get the favorite status from an item, handling both legacy and backend formats
 * Backend returns 0/1, frontend uses boolean
 */
export function getFavoriteStatus(item: Meal | Restaurant | any): boolean {
  // Check both possible formats for favorite status
  // Backend returns is_favorite as 0/1, convert to boolean
  const backendFavorite = item?.is_favorite
  const frontendFavorite = item?.isFavorite
  
  // Convert backend format (0/1) to boolean if present
  if (backendFavorite !== undefined && backendFavorite !== null) {
    return Boolean(backendFavorite)
  }
  
  // Use frontend format if available
  if (frontendFavorite !== undefined && frontendFavorite !== null) {
    return Boolean(frontendFavorite)
  }
  
  return false
}

/**
 * Update an item with favorite status in both formats for compatibility
 */
export function updateFavoriteStatus<T extends Meal | Restaurant>(item: T, isFavorite: boolean): T {
  return {
    ...item,
    isFavorite,
    is_favorite: isFavorite
  }
}

/**
 * Normalize restaurant data from backend format to frontend format
 */
export function normalizeRestaurant(restaurant: any): Restaurant {
  const favoriteStatus = getFavoriteStatus(restaurant)
  
  return {
    ...restaurant,
    // Ensure both formats are present
    cuisine: restaurant.cuisine ?? restaurant.cuisine_type,
    cuisine_type: restaurant.cuisine_type ?? restaurant.cuisine,
    priceRange: restaurant.priceRange ?? restaurant.price_range,
    price_range: restaurant.price_range ?? restaurant.priceRange,
    isFavorite: favoriteStatus,
    is_favorite: favoriteStatus
  }
}

/**
 * Normalize meal data from backend format to frontend format
 */
export function normalizeMeal(meal: any): Meal {
  const favoriteStatus = getFavoriteStatus(meal)
  
  return {
    ...meal,
    // Ensure both formats are present
    cuisine: meal.cuisine ?? meal.cuisine_type,
    cuisine_type: meal.cuisine_type ?? meal.cuisine,
    difficulty: meal.difficulty ?? meal.difficulty_level,
    difficulty_level: meal.difficulty_level ?? meal.difficulty,
    cookingTime: meal.cookingTime ?? meal.prep_time,
    prep_time: meal.prep_time ?? meal.cookingTime,
    isFavorite: favoriteStatus,
    is_favorite: favoriteStatus
  }
}