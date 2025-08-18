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

/**
 * Create sample slot items for testing
 */
export function createSampleSlotItems(): SlotItem[] {
  return [
    {
      id: '1',
      name: 'Pizza Margherita',
      description: 'Classic Italian pizza with tomato, mozzarella, and basil',
      category: 'dinner',
      type: 'meal',
      cuisine: 'italian',
      difficulty: 'easy',
      cookingTime: 30,
      emoji: '🍕',
    },
    {
      id: '2',
      name: 'Chicken Tikka Masala',
      description: 'Creamy curry with tender chicken pieces',
      category: 'dinner',
      type: 'meal',
      cuisine: 'indian',
      difficulty: 'medium',
      cookingTime: 45,
      emoji: '🍛',
    },
    {
      id: '3',
      name: 'Sushi Rolls',
      description: 'Fresh salmon and avocado rolls',
      category: 'lunch',
      type: 'meal',
      cuisine: 'japanese',
      difficulty: 'hard',
      cookingTime: 60,
      emoji: '🍣',
    },
    {
      id: '4',
      name: 'Caesar Salad',
      description: 'Crisp romaine lettuce with parmesan and croutons',
      category: 'lunch',
      type: 'meal',
      cuisine: 'american',
      difficulty: 'easy',
      cookingTime: 15,
      emoji: '🥗',
    },
    {
      id: '5',
      name: 'Beef Tacos',
      description: 'Seasoned ground beef with fresh toppings',
      category: 'dinner',
      type: 'meal',
      cuisine: 'mexican',
      difficulty: 'easy',
      cookingTime: 25,
      emoji: '🌮',
    },
    {
      id: '6',
      name: "Joe's Diner",
      description: 'Classic American comfort food',
      category: 'american',
      type: 'restaurant',
      cuisine: 'american',
      rating: 4.2,
      priceRange: '$$',
      emoji: '🍔',
    },
    {
      id: '7',
      name: 'Sakura Sushi',
      description: 'Fresh sushi and sashimi',
      category: 'japanese',
      type: 'restaurant',
      cuisine: 'japanese',
      rating: 4.7,
      priceRange: '$$$',
      emoji: '🍣',
    },
    {
      id: '8',
      name: 'Pasta Palace',
      description: 'Authentic Italian pasta dishes',
      category: 'italian',
      type: 'restaurant',
      cuisine: 'italian',
      rating: 4.5,
      priceRange: '$$',
      emoji: '🍝',
    },
  ]
}