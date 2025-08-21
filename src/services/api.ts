import { Meal, Restaurant, SearchFilter, SearchMode } from '@/types'
import { CreateMealData, UpdateMealData, CreateRestaurantData, UpdateRestaurantData, Tag, CreateTagData, UpdateTagData, PaginatedResponse } from '@/types/api'
import { withNetworkRetry } from '@/hooks/useNetwork'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://10.0.6.165:3002/api'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return withNetworkRetry(async () => {
    const url = `${API_BASE_URL}${endpoint}`
    
    // Get auth token from localStorage
    const token = localStorage.getItem('auth_token')
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        // Clear invalid token
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        // Redirect to login page or show login modal
        window.location.href = '/login'
        throw new ApiError(response.status, 'Authentication expired')
      }
      
      // Try to get error details from response
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData?.error || errorData?.message || `HTTP ${response.status}: ${response.statusText}`
      
      console.error('API Error:', {
        url,
        status: response.status,
        statusText: response.statusText,
        errorData,
        errorMessage
      })
      
      throw new ApiError(response.status, errorMessage)
    }

    const result = await response.json()
    
    // Extract data property from backend response if it exists
    // Backend responses are wrapped in { success: boolean, data: T, message?: string }
    if (result && typeof result === 'object' && 'data' in result) {
      return result.data
    }
    
    return result
  }, 3, 1000)
}

export const mealsApi = {
  // Get all meals with optional filters
  async getMeals(filters?: SearchFilter): Promise<Meal[]> {
    const params = new URLSearchParams()
    
    if (filters?.cuisine) params.append('cuisine', filters.cuisine)
    if (filters?.difficulty) params.append('difficulty', filters.difficulty)
    if (filters?.maxCookingTime) params.append('maxCookingTime', filters.maxCookingTime.toString())
    
    const query = params.toString() ? `?${params.toString()}` : ''
    return fetchApi<Meal[]>(`/meals${query}`)
  },

  // Get a specific meal by ID
  async getMeal(id: string): Promise<Meal> {
    return fetchApi<Meal>(`/meals/${id}`)
  },

  // Search meals by query
  async searchMeals(query: string, filters?: SearchFilter): Promise<Meal[]> {
    const params = new URLSearchParams({ q: query })
    
    if (filters?.cuisine) params.append('cuisine', filters.cuisine)
    if (filters?.difficulty) params.append('difficulty', filters.difficulty)
    if (filters?.maxCookingTime) params.append('maxCookingTime', filters.maxCookingTime.toString())
    
    return fetchApi<Meal[]>(`/meals/search?${params.toString()}`)
  },

  // Get random meal
  async getRandomMeal(filters?: SearchFilter): Promise<Meal> {
    const params = new URLSearchParams()
    
    if (filters?.cuisine) params.append('cuisine', filters.cuisine)
    if (filters?.difficulty) params.append('difficulty', filters.difficulty)
    if (filters?.maxCookingTime) params.append('maxCookingTime', filters.maxCookingTime.toString())
    
    const query = params.toString() ? `?${params.toString()}` : ''
    return fetchApi<Meal>(`/meals/random${query}`)
  },

  // Create new meal
  async createMeal(data: CreateMealData): Promise<Meal> {
    return fetchApi<Meal>('/meals', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Update meal
  async updateMeal(id: string, data: UpdateMealData): Promise<Meal> {
    return fetchApi<Meal>(`/meals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Delete meal
  async deleteMeal(id: string): Promise<{ success: boolean }> {
    return fetchApi<{ success: boolean }>(`/meals/${id}`, {
      method: 'DELETE',
    })
  },

  // Bulk delete meals
  async bulkDeleteMeals(ids: string[]): Promise<{ success: boolean; deletedCount: number }> {
    return fetchApi<{ success: boolean; deletedCount: number }>('/meals/bulk-delete', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    })
  },

  // Get cuisine types
  async getCuisineTypes(): Promise<string[]> {
    return fetchApi<string[]>('/meals/cuisine-types')
  },

  // Toggle favorite status
  async toggleFavorite(id: string): Promise<{ isFavorite: boolean }> {
    return fetchApi<{ isFavorite: boolean }>(`/meals/${id}/favorite`, {
      method: 'POST',
    })
  },

  // Discovery methods for cross-user browsing (no auth required)
  async discoverMeals(filters?: SearchFilter): Promise<Meal[]> {
    const params = new URLSearchParams()
    
    if (filters?.cuisine) params.append('cuisine_type', filters.cuisine)
    if (filters?.difficulty) params.append('difficulty_level', filters.difficulty)
    if (filters?.maxCookingTime) params.append('prep_time_max', filters.maxCookingTime.toString())
    
    const query = params.toString() ? `?${params.toString()}` : ''
    return fetchApi<Meal[]>(`/meals/discover${query}`)
  },
}

export const restaurantsApi = {
  // Get restaurants with optional filters and location
  async getRestaurants(
    filters?: SearchFilter, 
    location?: { lat: number; lng: number }
  ): Promise<Restaurant[]> {
    const params = new URLSearchParams()
    
    if (filters?.cuisine) params.append('cuisine', filters.cuisine)
    if (location) {
      params.append('lat', location.lat.toString())
      params.append('lng', location.lng.toString())
    }
    
    const query = params.toString() ? `?${params.toString()}` : ''
    return fetchApi<Restaurant[]>(`/restaurants${query}`)
  },

  // Get a specific restaurant by ID
  async getRestaurant(id: string): Promise<Restaurant> {
    return fetchApi<Restaurant>(`/restaurants/${id}`)
  },

  // Search restaurants by query
  async searchRestaurants(
    query: string, 
    filters?: SearchFilter,
    location?: { lat: number; lng: number }
  ): Promise<Restaurant[]> {
    const params = new URLSearchParams({ q: query })
    
    if (filters?.cuisine) params.append('cuisine', filters.cuisine)
    if (location) {
      params.append('lat', location.lat.toString())
      params.append('lng', location.lng.toString())
    }
    
    return fetchApi<Restaurant[]>(`/restaurants/search?${params.toString()}`)
  },

  // Get random restaurant
  async getRandomRestaurant(
    filters?: SearchFilter,
    location?: { lat: number; lng: number }
  ): Promise<Restaurant> {
    const params = new URLSearchParams()
    
    if (filters?.cuisine) params.append('cuisine', filters.cuisine)
    if (location) {
      params.append('lat', location.lat.toString())
      params.append('lng', location.lng.toString())
    }
    
    const query = params.toString() ? `?${params.toString()}` : ''
    return fetchApi<Restaurant>(`/restaurants/random${query}`)
  },

  // Create new restaurant
  async createRestaurant(data: CreateRestaurantData): Promise<Restaurant> {
    return fetchApi<Restaurant>('/restaurants', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Update restaurant
  async updateRestaurant(id: string, data: UpdateRestaurantData): Promise<Restaurant> {
    return fetchApi<Restaurant>(`/restaurants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Delete restaurant
  async deleteRestaurant(id: string): Promise<{ success: boolean }> {
    return fetchApi<{ success: boolean }>(`/restaurants/${id}`, {
      method: 'DELETE',
    })
  },

  // Bulk delete restaurants
  async bulkDeleteRestaurants(ids: string[]): Promise<{ success: boolean; deletedCount: number }> {
    return fetchApi<{ success: boolean; deletedCount: number }>('/restaurants/bulk-delete', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    })
  },

  // Get cuisine types
  async getCuisineTypes(): Promise<string[]> {
    return fetchApi<string[]>('/restaurants/cuisine-types')
  },

  // Get price ranges
  async getPriceRanges(): Promise<string[]> {
    return fetchApi<string[]>('/restaurants/price-ranges')
  },

  // Toggle favorite status
  async toggleFavorite(id: string): Promise<{ isFavorite: boolean }> {
    return fetchApi<{ isFavorite: boolean }>(`/restaurants/${id}/favorite`, {
      method: 'POST',
    })
  },
  // Get restaurant suggestions for autocomplete (from saved restaurants)
  async getRestaurantSuggestions(query: string, limit?: number): Promise<Restaurant[]> {
    const params = new URLSearchParams({ q: query })
    if (limit) params.append('limit', limit.toString())
    
    const queryString = params.toString() ? `?${params.toString()}` : ''
    return fetchApi<Restaurant[]>(`/restaurants/suggestions${queryString}`)
  },
  // Search external restaurants from the internet
  async searchExternalRestaurants(query: string, location?: { lat: number; lng: number }, radius?: number): Promise<any[]> {
    const params = new URLSearchParams({ q: query })
    if (location) {
      params.append('lat', location.lat.toString())
      params.append('lng', location.lng.toString())
    }
    if (radius) params.append('radius', radius.toString())
    
    const response = await fetchApi<any[]>(`/restaurant-search?${params.toString()}`)
    return response || []
  },
  // Get detailed restaurant information from external API
  async getExternalRestaurantDetails(placeId: string): Promise<any> {
    console.log('API: Getting details for place_id:', placeId)
    const response = await fetchApi<any>(`/restaurant-search/details/${placeId}`)
    console.log('API: Raw response from details API:', response)
    console.log('API: Response opening_hours:', response?.opening_hours)
    console.log('API: Response has opening_hours?', !!response?.opening_hours)
    if (response?.opening_hours) {
      console.log('API: Opening hours structure:', JSON.stringify(response.opening_hours, null, 2))
    }
    return response
  },
  
  // Discovery methods for cross-user browsing (no auth required)
  async discoverRestaurants(
    filters?: SearchFilter,
    location?: { lat: number; lng: number }
  ): Promise<Restaurant[]> {
    const params = new URLSearchParams()
    
    if (filters?.cuisine) params.append('cuisine_type', filters.cuisine)
    if (location) {
      params.append('lat', location.lat.toString())
      params.append('lng', location.lng.toString())
    }
    
    const query = params.toString() ? `?${params.toString()}` : ''
    return fetchApi<Restaurant[]>(`/restaurants/discover${query}`)
  },
}

export const favoritesApi = {
  // Get all favorites
  async getFavorites(): Promise<{ meals: Meal[]; restaurants: Restaurant[] }> {
    return fetchApi<{ meals: Meal[]; restaurants: Restaurant[] }>('/favorites')
  },

  // Get favorite meals
  async getFavoriteMeals(): Promise<Meal[]> {
    return fetchApi<Meal[]>('/favorites/meals')
  },

  // Get favorite restaurants
  async getFavoriteRestaurants(): Promise<Restaurant[]> {
    return fetchApi<Restaurant[]>('/favorites/restaurants')
  },
}

// User favorites API for cross-user favoriting (discovered items)
export const userFavoritesApi = {
  // Toggle meal favorite status (for discovered meals from other users)
  async toggleMealFavorite(id: string): Promise<{ is_favorite: boolean }> {
    return fetchApi<{ is_favorite: boolean }>(`/user-favorites/meals/${id}/toggle`, {
      method: 'POST',
    })
  },

  // Toggle restaurant favorite status (for discovered restaurants from other users)  
  async toggleRestaurantFavorite(id: string): Promise<{ is_favorite: boolean }> {
    return fetchApi<{ is_favorite: boolean }>(`/user-favorites/restaurants/${id}/toggle`, {
      method: 'POST',
    })
  },
}

export const randomApi = {
  // Get selection history
  async getSelectionHistory(params?: { page?: number; limit?: number }): Promise<{
    data: Array<{
      id: number
      user_id: number
      item_type: 'meal' | 'restaurant'
      item_id: number
      selected_at: string
    }>
    pagination: {
      page: number
      limit: number
      total: number
      total_pages: number
    }
  }> {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', params.page.toString())
    if (params?.limit) query.append('limit', params.limit.toString())
    
    return fetchApi<{
      data: Array<{
        id: number
        user_id: number
        item_type: 'meal' | 'restaurant'
        item_id: number
        selected_at: string
      }>
      pagination: {
        page: number
        limit: number
        total: number
        total_pages: number
      }
    }>(`/random/history?${query.toString()}`)
  }
}

export const authApi = {
  // Register new user
  async register(data: { username: string; email: string; password: string }): Promise<{ user: any; token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new ApiError(response.status, error.message || 'Registration failed')
    }

    const result = await response.json()
    return result.data
  },

  // Login user
  async login(data: { email: string; password: string }): Promise<{ user: any; token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new ApiError(response.status, error.message || 'Login failed')
    }

    const result = await response.json()
    return result.data
  },

  // Get current user profile
  async getProfile(): Promise<any> {
    return fetchApi<any>('/auth/me')
  },

  // Update user profile
  async updateProfile(data: any): Promise<any> {
    return fetchApi<any>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Change password
  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ success: boolean }> {
    return fetchApi<{ success: boolean }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

export const tagsApi = {
  // Get all tags
  async getTags(): Promise<Tag[]> {
    return fetchApi<Tag[]>('/tags')
  },

  // Get single tag
  async getTag(id: string): Promise<Tag> {
    return fetchApi<Tag>(`/tags/${id}`)
  },

  // Create new tag
  async createTag(data: CreateTagData): Promise<Tag> {
    return fetchApi<Tag>('/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Update tag
  async updateTag(id: string, data: UpdateTagData): Promise<Tag> {
    return fetchApi<Tag>(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Delete tag
  async deleteTag(id: string): Promise<{ success: boolean }> {
    return fetchApi<{ success: boolean }>(`/tags/${id}`, {
      method: 'DELETE',
    })
  },

  // Get tags used by meals
  async getMealTags(): Promise<Tag[]> {
    return fetchApi<Tag[]>('/tags/meals')
  },

  // Get tags used by restaurants
  async getRestaurantTags(): Promise<Tag[]> {
    return fetchApi<Tag[]>('/tags/restaurants')
  },

  // Get unused tags
  async getUnusedTags(): Promise<Tag[]> {
    return fetchApi<Tag[]>('/tags/unused')
  },

  // Get most used tags
  async getMostUsedTags(): Promise<Tag[]> {
    return fetchApi<Tag[]>('/tags/most-used')
  },

  // Delete unused tags
  async deleteUnusedTags(): Promise<{ success: boolean; deletedCount: number }> {
    return fetchApi<{ success: boolean; deletedCount: number }>('/tags/unused', {
      method: 'DELETE',
    })
  },

  // Get tag usage statistics
  async getTagUsage(id: string): Promise<{ mealCount: number; restaurantCount: number; totalCount: number }> {
    return fetchApi<{ mealCount: number; restaurantCount: number; totalCount: number }>(`/tags/${id}/usage`)
  },
}

// Generic search function
export async function search(
  query: string,
  mode: SearchMode,
  filters?: SearchFilter,
  location?: { lat: number; lng: number }
) {
  if (mode === 'meals') {
    return mealsApi.searchMeals(query, filters)
  } else {
    return restaurantsApi.searchRestaurants(query, filters, location)
  }
}

// Get random suggestion based on mode
export async function getRandomSuggestion(
  mode: SearchMode,
  filters?: SearchFilter,
  location?: { lat: number; lng: number }
) {
  if (mode === 'meals') {
    return mealsApi.getRandomMeal(filters)
  } else {
    return restaurantsApi.getRandomRestaurant(filters, location)
  }
}

// Get multiple random suggestions based on user preferences
export async function getMultipleRandomSuggestions(
  filters?: SearchFilter
): Promise<Array<{ meal?: Meal; restaurant?: Restaurant; type: 'meal' | 'restaurant' }>> {
  const response = await fetchApi<{ 
    data: Array<{ meal?: Meal; restaurant?: Restaurant; type: 'meal' | 'restaurant' }>; 
    count: number 
  }>('/random/multiple', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ filters }),
  })
  return response.data
}