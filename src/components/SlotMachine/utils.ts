import type { Meal, Restaurant } from '@/types'
import type { SlotItem, MealSlotItem, RestaurantSlotItem } from './types'

/**
 * Convert a Meal to a SlotItem
 */
export function mealToSlotItem(meal: Meal): MealSlotItem {
  return {
    id: meal.id,
    name: meal.name,
    description: meal.description,
    category: meal.category,
    type: 'meal',
    cuisine: meal.cuisine,
    difficulty: meal.difficulty,
    cookingTime: meal.cookingTime,
    emoji: getCuisineEmoji(meal.cuisine) || getMealCategoryEmoji(meal.category),
    image: meal.image,
    isFavorite: meal.isFavorite,
    ingredients: meal.ingredients,
    instructions: meal.instructions,
  }
}

/**
 * Convert a Restaurant to a SlotItem
 */
export function restaurantToSlotItem(restaurant: Restaurant): RestaurantSlotItem {
  return {
    id: restaurant.id,
    name: restaurant.name,
    description: restaurant.description,
    category: restaurant.cuisine,
    type: 'restaurant',
    cuisine: restaurant.cuisine,
    rating: restaurant.rating,
    priceRange: restaurant.priceRange,
    emoji: getCuisineEmoji(restaurant.cuisine) || '🍽️',
    image: restaurant.image,
    isFavorite: restaurant.isFavorite,
    address: restaurant.address,
    phone: restaurant.phone,
    website: restaurant.website,
    isOpen: restaurant.isOpen,
    distance: restaurant.distance,
  }
}

/**
 * Convert array of meals to SlotItems
 */
export function mealsToSlotItems(meals: Meal[]): MealSlotItem[] {
  return meals.map(mealToSlotItem)
}

/**
 * Convert array of restaurants to SlotItems
 */
export function restaurantsToSlotItems(restaurants: Restaurant[]): RestaurantSlotItem[] {
  return restaurants.map(restaurantToSlotItem)
}

/**
 * Convert array of favorite meals to SlotItems
 * Note: Backend already returns only favorites, so no filtering needed
 */
export function favoriteMealsToSlotItems(meals: Meal[]): MealSlotItem[] {
  return meals.map(mealToSlotItem)
}

/**
 * Convert array of favorite restaurants to SlotItems
 * Note: Backend already returns only favorites, so no filtering needed
 */
export function favoriteRestaurantsToSlotItems(restaurants: Restaurant[]): RestaurantSlotItem[] {
  return restaurants.map(restaurantToSlotItem)
}

/**
 * Get emoji for cuisine type
 */
export function getCuisineEmoji(cuisine?: string): string {
  if (!cuisine) return ''
  
  const cuisineEmojis: Record<string, string> = {
    // Asian
    'chinese': '🥢',
    'japanese': '🍣',
    'korean': '🥘',
    'thai': '🌶️',
    'vietnamese': '🍜',
    'indian': '🍛',
    'asian': '🥡',
    
    // European
    'italian': '🍝',
    'french': '🥖',
    'greek': '🫒',
    'spanish': '🥘',
    'german': '🥨',
    'european': '🍽️',
    
    // American
    'american': '🍔',
    'mexican': '🌮',
    'brazilian': '🥩',
    'bbq': '🍖',
    'burger': '🍔',
    'pizza': '🍕',
    
    // Middle Eastern & African
    'mediterranean': '🫒',
    'turkish': '🥙',
    'lebanese': '🫓',
    'moroccan': '🍲',
    'ethiopian': '🌶️',
    'african': '🍲',
    
    // Others
    'seafood': '🦞',
    'vegetarian': '🥗',
    'vegan': '🥬',
    'healthy': '🥗',
    'fast food': '🍟',
    'dessert': '🍰',
    'bakery': '🥐',
    'coffee': '☕',
    'bar': '🍻',
  }
  
  return cuisineEmojis[cuisine.toLowerCase()] || '🍽️'
}

/**
 * Get emoji for meal category
 */
export function getMealCategoryEmoji(category: string): string {
  const categoryEmojis: Record<string, string> = {
    'breakfast': '🌅',
    'lunch': '☀️',
    'dinner': '🌙',
    'snack': '🍪',
    'dessert': '🍰',
    'drink': '🥤',
  }
  
  return categoryEmojis[category.toLowerCase()] || '🍽️'
}

