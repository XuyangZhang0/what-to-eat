import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  mealsApi, 
  restaurantsApi, 
  favoritesApi, 
  tagsApi, 
  search, 
  getRandomSuggestion 
} from '../api'
import { createMockMeal, createMockRestaurant, mockFetchResponse } from '../../test/utils/test-utils'

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  describe('mealsApi', () => {
    describe('getMeals', () => {
      it('should fetch meals without filters', async () => {
        const mockMeals = [createMockMeal(), createMockMeal({ id: '2', name: 'Test Meal 2' })]
        global.fetch = mockFetchResponse(mockMeals)

        const result = await mealsApi.getMeals()

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/meals',
          expect.objectContaining({
            headers: { 'Content-Type': 'application/json' },
          })
        )
        expect(result).toEqual(mockMeals)
      })

      it('should fetch meals with filters', async () => {
        const mockMeals = [createMockMeal()]
        global.fetch = mockFetchResponse(mockMeals)

        const filters = {
          category: 'lunch' as const,
          cuisine: 'Italian',
          difficulty: 'medium' as const,
          maxCookingTime: 30,
        }

        await mealsApi.getMeals(filters)

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/meals?category=lunch&cuisine=Italian&difficulty=medium&maxCookingTime=30',
          expect.any(Object)
        )
      })
    })

    describe('getMeal', () => {
      it('should fetch single meal by id', async () => {
        const mockMeal = createMockMeal()
        global.fetch = mockFetchResponse(mockMeal)

        const result = await mealsApi.getMeal('1')

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/meals/1',
          expect.any(Object)
        )
        expect(result).toEqual(mockMeal)
      })
    })

    describe('searchMeals', () => {
      it('should search meals with query and filters', async () => {
        const mockMeals = [createMockMeal()]
        global.fetch = mockFetchResponse(mockMeals)

        const result = await mealsApi.searchMeals('pasta', { cuisine: 'Italian' })

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/meals/search?q=pasta&cuisine=Italian',
          expect.any(Object)
        )
        expect(result).toEqual(mockMeals)
      })
    })

    describe('getRandomMeal', () => {
      it('should fetch random meal', async () => {
        const mockMeal = createMockMeal()
        global.fetch = mockFetchResponse(mockMeal)

        const result = await mealsApi.getRandomMeal()

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/meals/random',
          expect.any(Object)
        )
        expect(result).toEqual(mockMeal)
      })

      it('should fetch random meal with filters', async () => {
        const mockMeal = createMockMeal()
        global.fetch = mockFetchResponse(mockMeal)

        await mealsApi.getRandomMeal({ category: 'dinner' })

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/meals/random?category=dinner',
          expect.any(Object)
        )
      })
    })

    describe('createMeal', () => {
      it('should create new meal', async () => {
        const mockMeal = createMockMeal()
        const createData = {
          name: 'New Meal',
          description: 'A new meal',
          category: 'lunch' as const,
        }
        
        global.fetch = mockFetchResponse(mockMeal)

        const result = await mealsApi.createMeal(createData)

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/meals',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(createData),
          })
        )
        expect(result).toEqual(mockMeal)
      })
    })

    describe('updateMeal', () => {
      it('should update existing meal', async () => {
        const mockMeal = createMockMeal()
        const updateData = { name: 'Updated Meal' }
        
        global.fetch = mockFetchResponse(mockMeal)

        const result = await mealsApi.updateMeal('1', updateData)

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/meals/1',
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify(updateData),
          })
        )
        expect(result).toEqual(mockMeal)
      })
    })

    describe('deleteMeal', () => {
      it('should delete meal', async () => {
        global.fetch = mockFetchResponse({ success: true })

        const result = await mealsApi.deleteMeal('1')

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/meals/1',
          expect.objectContaining({
            method: 'DELETE',
          })
        )
        expect(result).toEqual({ success: true })
      })
    })

    describe('bulkDeleteMeals', () => {
      it('should bulk delete meals', async () => {
        global.fetch = mockFetchResponse({ success: true, deletedCount: 2 })

        const result = await mealsApi.bulkDeleteMeals(['1', '2'])

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/meals/bulk-delete',
          expect.objectContaining({
            method: 'DELETE',
            body: JSON.stringify({ ids: ['1', '2'] }),
          })
        )
        expect(result).toEqual({ success: true, deletedCount: 2 })
      })
    })

    describe('toggleFavorite', () => {
      it('should toggle meal favorite status', async () => {
        global.fetch = mockFetchResponse({ isFavorite: true })

        const result = await mealsApi.toggleFavorite('1')

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/meals/1/favorite',
          expect.objectContaining({
            method: 'POST',
          })
        )
        expect(result).toEqual({ isFavorite: true })
      })
    })
  })

  describe('restaurantsApi', () => {
    describe('getRestaurants', () => {
      it('should fetch restaurants without filters', async () => {
        const mockRestaurants = [createMockRestaurant()]
        global.fetch = mockFetchResponse(mockRestaurants)

        const result = await restaurantsApi.getRestaurants()

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/restaurants',
          expect.any(Object)
        )
        expect(result).toEqual(mockRestaurants)
      })

      it('should fetch restaurants with location', async () => {
        const mockRestaurants = [createMockRestaurant()]
        global.fetch = mockFetchResponse(mockRestaurants)

        const location = { lat: 40.7128, lng: -74.0060 }
        await restaurantsApi.getRestaurants(undefined, location)

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/restaurants?lat=40.7128&lng=-74.006',
          expect.any(Object)
        )
      })
    })

    describe('searchRestaurants', () => {
      it('should search restaurants with query, filters, and location', async () => {
        const mockRestaurants = [createMockRestaurant()]
        global.fetch = mockFetchResponse(mockRestaurants)

        const location = { lat: 40.7128, lng: -74.0060 }
        const filters = { cuisine: 'Italian' }

        await restaurantsApi.searchRestaurants('pizza', filters, location)

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/restaurants/search?q=pizza&cuisine=Italian&lat=40.7128&lng=-74.006',
          expect.any(Object)
        )
      })
    })

    describe('getRandomRestaurant', () => {
      it('should fetch random restaurant', async () => {
        const mockRestaurant = createMockRestaurant()
        global.fetch = mockFetchResponse(mockRestaurant)

        const result = await restaurantsApi.getRandomRestaurant()

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/restaurants/random',
          expect.any(Object)
        )
        expect(result).toEqual(mockRestaurant)
      })
    })
  })

  describe('favoritesApi', () => {
    describe('getFavorites', () => {
      it('should fetch all favorites', async () => {
        const mockFavorites = {
          meals: [createMockMeal({ isFavorite: true })],
          restaurants: [createMockRestaurant({ isFavorite: true })],
        }
        global.fetch = mockFetchResponse(mockFavorites)

        const result = await favoritesApi.getFavorites()

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/favorites',
          expect.any(Object)
        )
        expect(result).toEqual(mockFavorites)
      })
    })

    describe('getFavoriteMeals', () => {
      it('should fetch favorite meals', async () => {
        const mockMeals = [createMockMeal({ isFavorite: true })]
        global.fetch = mockFetchResponse(mockMeals)

        const result = await favoritesApi.getFavoriteMeals()

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/favorites/meals',
          expect.any(Object)
        )
        expect(result).toEqual(mockMeals)
      })
    })
  })

  describe('tagsApi', () => {
    describe('getTags', () => {
      it('should fetch all tags', async () => {
        const mockTags = [
          { id: '1', name: 'vegetarian', color: '#green' },
          { id: '2', name: 'quick', color: '#blue' },
        ]
        global.fetch = mockFetchResponse(mockTags)

        const result = await tagsApi.getTags()

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/tags',
          expect.any(Object)
        )
        expect(result).toEqual(mockTags)
      })
    })

    describe('createTag', () => {
      it('should create new tag', async () => {
        const mockTag = { id: '1', name: 'new-tag', color: '#red' }
        const createData = { name: 'new-tag', color: '#red' }
        
        global.fetch = mockFetchResponse(mockTag)

        const result = await tagsApi.createTag(createData)

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/tags',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(createData),
          })
        )
        expect(result).toEqual(mockTag)
      })
    })
  })

  describe('generic search and random functions', () => {
    it('should search meals when mode is meals', async () => {
      const mockMeals = [createMockMeal()]
      global.fetch = mockFetchResponse(mockMeals)

      const result = await search('pasta', 'meals', { cuisine: 'Italian' })

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/meals/search?q=pasta&cuisine=Italian',
        expect.any(Object)
      )
      expect(result).toEqual(mockMeals)
    })

    it('should search restaurants when mode is restaurants', async () => {
      const mockRestaurants = [createMockRestaurant()]
      global.fetch = mockFetchResponse(mockRestaurants)

      const location = { lat: 40.7128, lng: -74.0060 }
      const result = await search('pizza', 'restaurants', { cuisine: 'Italian' }, location)

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/restaurants/search?q=pizza&cuisine=Italian&lat=40.7128&lng=-74.006',
        expect.any(Object)
      )
      expect(result).toEqual(mockRestaurants)
    })

    it('should get random meal when mode is meals', async () => {
      const mockMeal = createMockMeal()
      global.fetch = mockFetchResponse(mockMeal)

      const result = await getRandomSuggestion('meals', { category: 'lunch' })

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/meals/random?category=lunch',
        expect.any(Object)
      )
      expect(result).toEqual(mockMeal)
    })

    it('should get random restaurant when mode is restaurants', async () => {
      const mockRestaurant = createMockRestaurant()
      global.fetch = mockFetchResponse(mockRestaurant)

      const location = { lat: 40.7128, lng: -74.0060 }
      const result = await getRandomSuggestion('restaurants', { cuisine: 'Italian' }, location)

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/restaurants/random?cuisine=Italian&lat=40.7128&lng=-74.006',
        expect.any(Object)
      )
      expect(result).toEqual(mockRestaurant)
    })
  })

  describe('error handling', () => {
    it('should throw ApiError for HTTP errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Not found' }),
      })

      await expect(mealsApi.getMeal('999')).rejects.toThrow('HTTP error! status: 404')
    })

    it('should throw generic error for network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      await expect(mealsApi.getMeal('1')).rejects.toThrow('Network error: Error: Network error')
    })

    it('should handle fetch timeout', async () => {
      global.fetch = vi.fn().mockImplementation(
        () => new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      )

      await expect(mealsApi.getMeal('1')).rejects.toThrow('Network error: Error: Timeout')
    })
  })

  describe('API base URL configuration', () => {
    it('should use default API base URL', async () => {
      global.fetch = mockFetchResponse([])

      await mealsApi.getMeals()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/meals',
        expect.any(Object)
      )
    })

    it('should use custom API base URL from environment', async () => {
      const originalEnv = import.meta.env.VITE_API_BASE_URL
      import.meta.env.VITE_API_BASE_URL = 'https://api.example.com'

      // Re-import the module to pick up the new environment variable
      const { mealsApi: newMealsApi } = await import('../api')
      global.fetch = mockFetchResponse([])

      await newMealsApi.getMeals()

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/meals',
        expect.any(Object)
      )

      // Restore original environment
      import.meta.env.VITE_API_BASE_URL = originalEnv
    })
  })
})