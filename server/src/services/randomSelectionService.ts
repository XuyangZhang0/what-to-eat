import { MealModel } from '@/models/Meal.js';
import { RestaurantModel } from '@/models/Restaurant.js';
import { SelectionHistoryModel } from '@/models/SelectionHistory.js';
import { UserModel } from '@/models/User.js';
import { 
  Meal, 
  Restaurant, 
  RandomSelectionOptions, 
  RandomSuggestion,
  SearchFilters 
} from '@/models/types.js';
import { isRestaurantOpenOnDay, getCurrentDay } from '@/utils/openingHours.js';

export class RandomSelectionService {
  // Get multiple random suggestions based on user preferences
  static async getMultipleRandomSuggestions(
    userId: number,
    options: RandomSelectionOptions = {}
  ): Promise<RandomSuggestion[]> {
    const userPreferences = UserModel.getPreferences(userId);
    
    // Meal suggestions are configurable 1-3, restaurant suggestions are always 1
    const mealSuggestionCount = userPreferences.meal_suggestion_count || userPreferences.suggestion_count || 1;
    const restaurantSuggestionCount = 1; // Fixed count for restaurants
    
    const validMealCount = Math.min(Math.max(mealSuggestionCount, 1), 3); // Ensure between 1-3
    
    const suggestions: RandomSuggestion[] = [];
    
    // Generate meal suggestions
    for (let i = 0; i < validMealCount; i++) {
      const meal = await this.getRandomMeal(userId, options.exclude_recent_days, options.weight_favorites, options.filters);
      if (meal) {
        suggestions.push({ meal, type: 'meal' });
      }
    }
    
    // Generate restaurant suggestion (always 1)
    for (let i = 0; i < restaurantSuggestionCount; i++) {
      const restaurant = await this.getRandomRestaurant(userId, options.exclude_recent_days, options.weight_favorites, options.filters);
      if (restaurant) {
        suggestions.push({ restaurant, type: 'restaurant' });
      }
    }
    
    return suggestions;
  }

  // Get a random suggestion (meal or restaurant)
  static async getRandomSuggestion(
    userId: number, 
    options: RandomSelectionOptions = {}
  ): Promise<RandomSuggestion | null> {
    const { 
      exclude_recent_days = 7, 
      weight_favorites = true,
      filters = {} 
    } = options;

    // Get user preferences
    const userPreferences = UserModel.getPreferences(userId);
    const preferredType = userPreferences.preferred_suggestion_type || 'random';

    let suggestionType: 'meal' | 'restaurant';

    // Determine suggestion type based on preferences
    if (preferredType === 'meal') {
      suggestionType = 'meal';
    } else if (preferredType === 'restaurant') {
      suggestionType = 'restaurant';
    } else {
      // Random selection between meal and restaurant
      suggestionType = Math.random() < 0.5 ? 'meal' : 'restaurant';
    }

    if (suggestionType === 'meal') {
      const meal = await this.getRandomMeal(userId, exclude_recent_days, weight_favorites, filters);
      return meal ? { meal, type: 'meal' } : null;
    } else {
      const restaurant = await this.getRandomRestaurant(userId, exclude_recent_days, weight_favorites, filters);
      return restaurant ? { restaurant, type: 'restaurant' } : null;
    }
  }

  // Get a random meal with smart algorithm
  static async getRandomMeal(
    userId: number, 
    excludeRecentDays: number = 7,
    weightFavorites: boolean = true,
    filters: SearchFilters = {}
  ): Promise<Meal | null> {
    // Get recent meal selections to exclude
    const recentMealIds = SelectionHistoryModel.getRecentMealSelections(userId, excludeRecentDays);
    
    // Get all eligible meals with filters
    const { meals } = MealModel.findByUserId(userId, filters, { limit: 1000 });
    
    // Filter out recently selected meals
    const eligibleMeals = meals.filter(meal => !recentMealIds.includes(meal.id));
    
    if (eligibleMeals.length === 0) {
      // If no eligible meals, fall back to all meals (ignore recent filter)
      return meals.length > 0 ? this.weightedRandomSelection(meals, weightFavorites) : null;
    }
    
    return this.weightedRandomSelection(eligibleMeals, weightFavorites);
  }

  // Get a random restaurant with smart algorithm
  static async getRandomRestaurant(
    userId: number, 
    excludeRecentDays: number = 7,
    weightFavorites: boolean = true,
    filters: SearchFilters = {}
  ): Promise<Restaurant | null> {
    // Get recent restaurant selections to exclude
    const recentRestaurantIds = SelectionHistoryModel.getRecentRestaurantSelections(userId, excludeRecentDays);
    
    // Get all eligible restaurants with filters
    const { restaurants } = RestaurantModel.findByUserId(userId, filters, { limit: 1000 });
    
    // Filter out recently selected restaurants
    let eligibleRestaurants = restaurants.filter(restaurant => !recentRestaurantIds.includes(restaurant.id));
    
    // Filter out restaurants that are closed today
    const currentDay = getCurrentDay();
    const openRestaurants = eligibleRestaurants.filter(restaurant => 
      isRestaurantOpenOnDay(restaurant.opening_hours, currentDay)
    );
    
    // If we have open restaurants, use them; otherwise fall back to all eligible restaurants
    const finalEligibleRestaurants = openRestaurants.length > 0 ? openRestaurants : eligibleRestaurants;
    
    if (finalEligibleRestaurants.length === 0) {
      // If no eligible restaurants, fall back to all restaurants but still respect opening hours
      const allOpenRestaurants = restaurants.filter(restaurant => 
        isRestaurantOpenOnDay(restaurant.opening_hours, currentDay)
      );
      
      if (allOpenRestaurants.length > 0) {
        return this.weightedRandomSelection(allOpenRestaurants, weightFavorites);
      }
      
      // Last resort: ignore opening hours entirely
      return restaurants.length > 0 ? this.weightedRandomSelection(restaurants, weightFavorites) : null;
    }
    
    return this.weightedRandomSelection(finalEligibleRestaurants, weightFavorites);
  }

  // Weighted random selection algorithm
  private static weightedRandomSelection<T extends { is_favorite: boolean; rating?: number }>(
    items: T[],
    weightFavorites: boolean = true
  ): T | null {
    if (items.length === 0) return null;
    if (items.length === 1) return items[0];

    if (!weightFavorites) {
      // Simple random selection
      return items[Math.floor(Math.random() * items.length)];
    }

    // Calculate weights for each item
    const weights = items.map(item => {
      let weight = 1; // Base weight
      
      // Increase weight for favorites
      if (item.is_favorite) {
        weight *= 2.5;
      }
      
      // Increase weight based on rating (for restaurants)
      if (item.rating && item.rating > 0) {
        weight *= (item.rating / 5) + 0.5; // Scale rating impact
      }
      
      return weight;
    });

    // Calculate total weight
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    // Generate random number between 0 and totalWeight
    let random = Math.random() * totalWeight;
    
    // Find the selected item
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }
    
    // Fallback to last item (shouldn't happen)
    return items[items.length - 1];
  }

  // Record a selection in history
  static async recordSelection(
    userId: number,
    itemType: 'meal' | 'restaurant',
    itemId: number
  ): Promise<void> {
    SelectionHistoryModel.create({
      user_id: userId,
      item_type: itemType,
      item_id: itemId
    });
  }

  // Get suggestions based on user's selection patterns
  static async getPersonalizedSuggestions(
    userId: number,
    limit: number = 5
  ): Promise<{ meals: Meal[], restaurants: Restaurant[] }> {
    // Get user's most selected items for pattern analysis
    const mostSelectedMeals = SelectionHistoryModel.getMostSelected(userId, 'meal', 10);
    const mostSelectedRestaurants = SelectionHistoryModel.getMostSelected(userId, 'restaurant', 10);
    
    // Analyze patterns (favorite cuisine types, difficulty levels, etc.)
    const userPreferences = this.analyzeUserPreferences(userId);
    
    // Get suggestions based on patterns
    const { meals } = MealModel.findByUserId(userId, userPreferences.mealFilters, { 
      limit, 
      sort_by: 'created_at', 
      sort_order: 'desc' 
    });
    
    const { restaurants } = RestaurantModel.findByUserId(userId, userPreferences.restaurantFilters, { 
      limit, 
      sort_by: 'created_at', 
      sort_order: 'desc' 
    });
    
    return { meals, restaurants };
  }

  // Analyze user preferences based on selection history
  private static analyzeUserPreferences(userId: number): {
    mealFilters: SearchFilters;
    restaurantFilters: SearchFilters;
  } {
    // Get user's selection history for analysis
    const recentSelections = SelectionHistoryModel.getRecentSelections(userId, 30);
    
    // Get user preferences from profile
    const userPreferences = UserModel.getPreferences(userId);
    
    // Analyze meal patterns
    const mealFilters: SearchFilters = {};
    if (userPreferences.preferred_cuisine_type) {
      mealFilters.cuisine_type = userPreferences.preferred_cuisine_type;
    }
    if (userPreferences.preferred_difficulty_level) {
      mealFilters.difficulty_level = userPreferences.preferred_difficulty_level;
    }
    if (userPreferences.max_prep_time) {
      mealFilters.prep_time_max = userPreferences.max_prep_time;
    }
    
    // Analyze restaurant patterns
    const restaurantFilters: SearchFilters = {};
    if (userPreferences.preferred_cuisine_type) {
      restaurantFilters.cuisine_type = userPreferences.preferred_cuisine_type;
    }
    if (userPreferences.preferred_price_range) {
      restaurantFilters.price_range = userPreferences.preferred_price_range;
    }
    if (userPreferences.min_rating) {
      restaurantFilters.rating_min = userPreferences.min_rating;
    }
    
    return { mealFilters, restaurantFilters };
  }

  // Get smart suggestion based on time of day
  static async getTimeBasedSuggestion(userId: number): Promise<RandomSuggestion | null> {
    const currentHour = new Date().getHours();
    
    // Breakfast time (6-10 AM) - prefer easy/quick meals
    if (currentHour >= 6 && currentHour < 10) {
      const meal = await this.getRandomMeal(userId, 7, true, {
        difficulty_level: 'easy',
        prep_time_max: 30
      });
      return meal ? { meal, type: 'meal' } : null;
    }
    
    // Lunch time (11 AM - 2 PM) - prefer restaurants or quick meals
    if (currentHour >= 11 && currentHour < 14) {
      const isRestaurant = Math.random() < 0.7; // 70% chance for restaurant
      
      if (isRestaurant) {
        const restaurant = await this.getRandomRestaurant(userId, 7, true);
        return restaurant ? { restaurant, type: 'restaurant' } : null;
      } else {
        const meal = await this.getRandomMeal(userId, 7, true, {
          prep_time_max: 45
        });
        return meal ? { meal, type: 'meal' } : null;
      }
    }
    
    // Dinner time (5-9 PM) - any option, slightly prefer cooking
    if (currentHour >= 17 && currentHour < 21) {
      const isRestaurant = Math.random() < 0.4; // 40% chance for restaurant
      
      if (isRestaurant) {
        const restaurant = await this.getRandomRestaurant(userId, 7, true);
        return restaurant ? { restaurant, type: 'restaurant' } : null;
      } else {
        const meal = await this.getRandomMeal(userId, 7, true);
        return meal ? { meal, type: 'meal' } : null;
      }
    }
    
    // Other times - random selection
    return this.getRandomSuggestion(userId);
  }

  // Get diverse suggestions (avoid same cuisine type)
  static async getDiverseSuggestions(
    userId: number, 
    count: number = 3
  ): Promise<RandomSuggestion[]> {
    const suggestions: RandomSuggestion[] = [];
    const usedCuisineTypes = new Set<string>();
    
    for (let i = 0; i < count; i++) {
      const suggestion = await this.getRandomSuggestion(userId, {
        exclude_recent_days: 7,
        weight_favorites: true
      });
      
      if (suggestion) {
        const cuisineType = suggestion.type === 'meal' 
          ? suggestion.meal?.cuisine_type 
          : suggestion.restaurant?.cuisine_type;
        
        // If we already have this cuisine type, try to get a different one
        if (cuisineType && usedCuisineTypes.has(cuisineType) && i < count - 1) {
          // Try a few more times to get a different cuisine
          let attempts = 0;
          let altSuggestion = suggestion;
          
          while (attempts < 3) {
            const newSuggestion = await this.getRandomSuggestion(userId, {
              exclude_recent_days: 7,
              weight_favorites: true
            });
            
            if (newSuggestion) {
              const newCuisineType = newSuggestion.type === 'meal' 
                ? newSuggestion.meal?.cuisine_type 
                : newSuggestion.restaurant?.cuisine_type;
              
              if (!newCuisineType || !usedCuisineTypes.has(newCuisineType)) {
                altSuggestion = newSuggestion;
                break;
              }
            }
            attempts++;
          }
          
          suggestions.push(altSuggestion);
          if (cuisineType) usedCuisineTypes.add(cuisineType);
        } else {
          suggestions.push(suggestion);
          if (cuisineType) usedCuisineTypes.add(cuisineType);
        }
      }
    }
    
    return suggestions;
  }
}