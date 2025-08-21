import { useState, useEffect } from 'react'
import { mealsApi } from '@/services/api'
import { Meal } from '@/types'

interface UseMealResult {
  meal: Meal | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useMeal(id: string | undefined): UseMealResult {
  const [meal, setMeal] = useState<Meal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMeal = async () => {
    if (!id) {
      setError('No meal ID provided')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log('Fetching meal with ID:', id)
      
      const mealData = await mealsApi.getMeal(id)
      console.log('Successfully fetched meal:', mealData)
      setMeal(mealData)
    } catch (err) {
      console.error('Error fetching meal:', {
        mealId: id,
        error: err,
        status: (err as any)?.status,
        message: (err as any)?.message
      })
      
      let errorMessage = 'Failed to fetch meal'
      if (err instanceof Error) {
        errorMessage = err.message
      }
      
      // Provide more specific error messages based on status
      if ((err as any)?.status === 401) {
        errorMessage = 'Authentication required to view this meal'
      } else if ((err as any)?.status === 403) {
        errorMessage = 'Access denied to this meal'
      } else if ((err as any)?.status === 404) {
        errorMessage = 'Meal not found'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMeal()
  }, [id])

  return {
    meal,
    loading,
    error,
    refetch: fetchMeal
  }
}