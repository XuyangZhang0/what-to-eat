import { useState, useEffect } from 'react'
import { restaurantsApi } from '@/services/api'
import { Restaurant } from '@/types'

interface UseRestaurantResult {
  restaurant: Restaurant | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useRestaurant(id: string | undefined): UseRestaurantResult {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRestaurant = async () => {
    if (!id) {
      setError('No restaurant ID provided')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log('Fetching restaurant with ID:', id)
      
      let restaurantData: any
      try {
        // First try the authenticated endpoint
        restaurantData = await restaurantsApi.getRestaurant(id)
        console.log('Successfully fetched restaurant (authenticated):', restaurantData)
      } catch (authError: any) {
        console.log('Authenticated request failed:', authError.status, authError.message)
        
        // If access denied (403) or unauthorized (401), try the public endpoint
        if (authError.status === 403 || authError.status === 401) {
          console.log('Trying public view endpoint...')
          restaurantData = await restaurantsApi.viewRestaurant(id)
          console.log('Successfully fetched restaurant (public):', restaurantData)
        } else {
          // If it's not an auth issue, re-throw the original error
          throw authError
        }
      }
      
      setRestaurant(restaurantData)
    } catch (err) {
      console.error('Error fetching restaurant:', {
        restaurantId: id,
        error: err,
        status: (err as any)?.status,
        message: (err as any)?.message
      })
      
      let errorMessage = 'Failed to fetch restaurant'
      if (err instanceof Error) {
        errorMessage = err.message
      }
      
      // Provide more specific error messages based on status
      if ((err as any)?.status === 401) {
        errorMessage = 'Authentication required to view this restaurant'
      } else if ((err as any)?.status === 403) {
        errorMessage = 'Access denied to this restaurant'
      } else if ((err as any)?.status === 404) {
        errorMessage = 'Restaurant not found'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRestaurant()
  }, [id])

  return {
    restaurant,
    loading,
    error,
    refetch: fetchRestaurant
  }
}