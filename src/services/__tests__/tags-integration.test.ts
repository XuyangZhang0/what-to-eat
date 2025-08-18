import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { tagsApi } from '../api'
import { CreateTagData, UpdateTagData } from '@/types/api'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Tags API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock localStorage for auth token
    const localStorageMock = {
      getItem: vi.fn(() => 'mock-auth-token'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const mockResponse = (data: any, ok = true, status = 200) => {
    return Promise.resolve({
      ok,
      status,
      json: () => Promise.resolve(data),
    }) as Promise<Response>
  }

  describe('getTags', () => {
    it('should fetch all tags successfully', async () => {
      const mockTags = [
        { id: '1', name: 'Vegetarian', color: '#22C55E' },
        { id: '2', name: 'Quick', color: '#3B82F6' },
      ]
      
      mockFetch.mockResolvedValue(mockResponse(mockTags))

      const result = await tagsApi.getTags()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://10.0.6.165:3001/api/tags',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-auth-token',
          }),
        })
      )
      expect(result).toEqual(mockTags)
    })

    it('should handle authentication error', async () => {
      mockFetch.mockResolvedValue(mockResponse({ error: 'Unauthorized' }, false, 401))

      await expect(tagsApi.getTags()).rejects.toThrow()
      
      // Should remove invalid token
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token')
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_user')
    })

    it('should handle network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network failed'))

      await expect(tagsApi.getTags()).rejects.toThrow('Network error')
    })
  })

  describe('createTag', () => {
    it('should create tag with valid data', async () => {
      const createData: CreateTagData = {
        name: 'New Tag',
        color: '#FF5733',
      }
      
      const mockCreatedTag = {
        id: '3',
        ...createData,
      }
      
      mockFetch.mockResolvedValue(mockResponse(mockCreatedTag, true, 201))

      const result = await tagsApi.createTag(createData)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://10.0.6.165:3001/api/tags',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-auth-token',
          }),
          body: JSON.stringify(createData),
        })
      )
      expect(result).toEqual(mockCreatedTag)
    })

    it('should handle validation errors', async () => {
      const createData: CreateTagData = {
        name: '',
        color: '#FF5733',
      }
      
      mockFetch.mockResolvedValue(mockResponse(
        { 
          success: false, 
          error: 'Validation failed',
          details: ['Name is required']
        }, 
        false, 
        400
      ))

      await expect(tagsApi.createTag(createData)).rejects.toThrow()
    })

    it('should handle duplicate name error', async () => {
      const createData: CreateTagData = {
        name: 'Existing Tag',
        color: '#FF5733',
      }
      
      mockFetch.mockResolvedValue(mockResponse(
        { 
          success: false, 
          error: 'Tag name already exists'
        }, 
        false, 
        409
      ))

      await expect(tagsApi.createTag(createData)).rejects.toThrow()
    })
  })

  describe('updateTag', () => {
    it('should update tag successfully', async () => {
      const tagId = '1'
      const updateData: UpdateTagData = {
        name: 'Updated Tag',
        color: '#16A34A',
      }
      
      const mockUpdatedTag = {
        id: tagId,
        ...updateData,
      }
      
      mockFetch.mockResolvedValue(mockResponse(mockUpdatedTag))

      const result = await tagsApi.updateTag(tagId, updateData)

      expect(mockFetch).toHaveBeenCalledWith(
        `http://10.0.6.165:3001/api/tags/${tagId}`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-auth-token',
          }),
          body: JSON.stringify(updateData),
        })
      )
      expect(result).toEqual(mockUpdatedTag)
    })

    it('should handle tag not found error', async () => {
      const tagId = '999'
      const updateData: UpdateTagData = {
        name: 'Updated Tag',
      }
      
      mockFetch.mockResolvedValue(mockResponse(
        { 
          success: false, 
          error: 'Tag not found'
        }, 
        false, 
        404
      ))

      await expect(tagsApi.updateTag(tagId, updateData)).rejects.toThrow()
    })

    it('should update only specified fields', async () => {
      const tagId = '1'
      const updateData: UpdateTagData = {
        name: 'Updated Name Only',
      }
      
      const mockUpdatedTag = {
        id: tagId,
        name: 'Updated Name Only',
        color: '#22C55E', // Original color unchanged
      }
      
      mockFetch.mockResolvedValue(mockResponse(mockUpdatedTag))

      const result = await tagsApi.updateTag(tagId, updateData)

      expect(mockFetch).toHaveBeenCalledWith(
        `http://10.0.6.165:3001/api/tags/${tagId}`,
        expect.objectContaining({
          body: JSON.stringify(updateData),
        })
      )
      expect(result).toEqual(mockUpdatedTag)
    })
  })

  describe('deleteTag', () => {
    it('should delete tag successfully', async () => {
      const tagId = '1'
      
      mockFetch.mockResolvedValue(mockResponse({ success: true }))

      const result = await tagsApi.deleteTag(tagId)

      expect(mockFetch).toHaveBeenCalledWith(
        `http://10.0.6.165:3001/api/tags/${tagId}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-auth-token',
          }),
        })
      )
      expect(result).toEqual({ success: true })
    })

    it('should handle tag in use error', async () => {
      const tagId = '1'
      
      mockFetch.mockResolvedValue(mockResponse(
        { 
          success: false, 
          error: 'Cannot delete tag that is currently in use',
          details: {
            meal_count: 2,
            restaurant_count: 1,
            total_usage: 3
          }
        }, 
        false, 
        400
      ))

      await expect(tagsApi.deleteTag(tagId)).rejects.toThrow()
    })
  })

  describe('getTagUsage', () => {
    it('should fetch tag usage statistics', async () => {
      const tagId = '1'
      const mockUsage = {
        mealCount: 5,
        restaurantCount: 2,
        totalCount: 7,
      }
      
      mockFetch.mockResolvedValue(mockResponse(mockUsage))

      const result = await tagsApi.getTagUsage(tagId)

      expect(mockFetch).toHaveBeenCalledWith(
        `http://10.0.6.165:3001/api/tags/${tagId}/usage`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-auth-token',
          }),
        })
      )
      expect(result).toEqual(mockUsage)
    })

    it('should handle tag not found for usage', async () => {
      const tagId = '999'
      
      mockFetch.mockResolvedValue(mockResponse(
        { 
          success: false, 
          error: 'Tag not found'
        }, 
        false, 
        404
      ))

      await expect(tagsApi.getTagUsage(tagId)).rejects.toThrow()
    })
  })

  describe('getUnusedTags', () => {
    it('should fetch unused tags', async () => {
      const mockUnusedTags = [
        { id: '3', name: 'Unused Tag', color: '#64748B' },
      ]
      
      mockFetch.mockResolvedValue(mockResponse(mockUnusedTags))

      const result = await tagsApi.getUnusedTags()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://10.0.6.165:3001/api/tags/unused',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-auth-token',
          }),
        })
      )
      expect(result).toEqual(mockUnusedTags)
    })

    it('should handle empty unused tags list', async () => {
      mockFetch.mockResolvedValue(mockResponse([]))

      const result = await tagsApi.getUnusedTags()

      expect(result).toEqual([])
    })
  })

  describe('getMostUsedTags', () => {
    it('should fetch most used tags', async () => {
      const mockMostUsedTags = [
        { id: '1', name: 'Popular Tag', color: '#22C55E', usage_count: 10 },
        { id: '2', name: 'Another Popular', color: '#3B82F6', usage_count: 7 },
      ]
      
      mockFetch.mockResolvedValue(mockResponse(mockMostUsedTags))

      const result = await tagsApi.getMostUsedTags()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://10.0.6.165:3001/api/tags/most-used',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-auth-token',
          }),
        })
      )
      expect(result).toEqual(mockMostUsedTags)
    })
  })

  describe('deleteUnusedTags', () => {
    it('should bulk delete unused tags', async () => {
      const mockResult = {
        success: true,
        deletedCount: 3,
      }
      
      mockFetch.mockResolvedValue(mockResponse(mockResult))

      const result = await tagsApi.deleteUnusedTags()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://10.0.6.165:3001/api/tags/unused',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-auth-token',
          }),
        })
      )
      expect(result).toEqual(mockResult)
    })

    it('should handle no unused tags to delete', async () => {
      const mockResult = {
        success: true,
        deletedCount: 0,
      }
      
      mockFetch.mockResolvedValue(mockResponse(mockResult))

      const result = await tagsApi.deleteUnusedTags()

      expect(result).toEqual(mockResult)
    })
  })

  describe('getMealTags', () => {
    it('should fetch tags used by meals', async () => {
      const mockMealTags = [
        { id: '1', name: 'Dinner', color: '#EF4444' },
        { id: '2', name: 'Vegetarian', color: '#22C55E' },
      ]
      
      mockFetch.mockResolvedValue(mockResponse(mockMealTags))

      const result = await tagsApi.getMealTags()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://10.0.6.165:3001/api/tags/meals',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-auth-token',
          }),
        })
      )
      expect(result).toEqual(mockMealTags)
    })
  })

  describe('getRestaurantTags', () => {
    it('should fetch tags used by restaurants', async () => {
      const mockRestaurantTags = [
        { id: '1', name: 'Fine Dining', color: '#8B5CF6' },
        { id: '2', name: 'Casual', color: '#06B6D4' },
      ]
      
      mockFetch.mockResolvedValue(mockResponse(mockRestaurantTags))

      const result = await tagsApi.getRestaurantTags()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://10.0.6.165:3001/api/tags/restaurants',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-auth-token',
          }),
        })
      )
      expect(result).toEqual(mockRestaurantTags)
    })
  })

  describe('Authentication Integration', () => {
    it('should include auth token in all requests', async () => {
      mockFetch.mockResolvedValue(mockResponse([]))

      await tagsApi.getTags()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-auth-token',
          }),
        })
      )
    })

    it('should handle missing auth token', async () => {
      // Mock localStorage without token
      const localStorageMock = {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      }
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      })

      mockFetch.mockResolvedValue(mockResponse([]))

      await tagsApi.getTags()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.any(String),
          }),
        })
      )
    })

    it('should redirect on 401 error', async () => {
      const mockLocationAssign = vi.fn()
      Object.defineProperty(window, 'location', {
        value: { href: '', assign: mockLocationAssign },
        writable: true,
      })

      mockFetch.mockResolvedValue(mockResponse({ error: 'Unauthorized' }, false, 401))

      await expect(tagsApi.getTags()).rejects.toThrow()

      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token')
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_user')
    })
  })

  describe('Error Response Handling', () => {
    it('should handle server errors gracefully', async () => {
      mockFetch.mockResolvedValue(mockResponse(
        { error: 'Internal server error' }, 
        false, 
        500
      ))

      await expect(tagsApi.getTags()).rejects.toThrow('HTTP error! status: 500')
    })

    it('should handle malformed JSON responses', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response)

      await expect(tagsApi.getTags()).rejects.toThrow()
    })

    it('should handle timeout errors', async () => {
      mockFetch.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      )

      await expect(tagsApi.getTags()).rejects.toThrow('Network error')
    })
  })

  describe('Request Parameter Validation', () => {
    it('should handle invalid tag IDs', async () => {
      mockFetch.mockResolvedValue(mockResponse(
        { error: 'Invalid ID format' }, 
        false, 
        400
      ))

      await expect(tagsApi.getTag('invalid-id')).rejects.toThrow()
    })

    it('should handle empty update data', async () => {
      const tagId = '1'
      const updateData: UpdateTagData = {}
      
      mockFetch.mockResolvedValue(mockResponse({
        id: tagId,
        name: 'Unchanged',
        color: '#22C55E',
      }))

      const result = await tagsApi.updateTag(tagId, updateData)

      expect(mockFetch).toHaveBeenCalledWith(
        `http://10.0.6.165:3001/api/tags/${tagId}`,
        expect.objectContaining({
          body: JSON.stringify(updateData),
        })
      )
    })
  })

  describe('Concurrent Request Handling', () => {
    it('should handle multiple simultaneous requests', async () => {
      const mockTags = [
        { id: '1', name: 'Tag 1', color: '#22C55E' },
        { id: '2', name: 'Tag 2', color: '#3B82F6' },
      ]
      
      mockFetch.mockResolvedValue(mockResponse(mockTags))

      const promises = [
        tagsApi.getTags(),
        tagsApi.getTags(),
        tagsApi.getTags(),
      ]

      const results = await Promise.all(promises)

      expect(results).toHaveLength(3)
      expect(results[0]).toEqual(mockTags)
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    it('should handle mixed success and failure responses', async () => {
      mockFetch
        .mockResolvedValueOnce(mockResponse([{ id: '1', name: 'Success', color: '#22C55E' }]))
        .mockResolvedValueOnce(mockResponse({ error: 'Failed' }, false, 500))

      const [successResult, failureResult] = await Promise.allSettled([
        tagsApi.getTags(),
        tagsApi.getTags(),
      ])

      expect(successResult.status).toBe('fulfilled')
      expect(failureResult.status).toBe('rejected')
    })
  })
})