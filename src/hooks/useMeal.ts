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
      const mealData = await mealsApi.getMeal(id)
      setMeal(mealData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch meal'
      setError(errorMessage)
      console.error('Failed to fetch meal:', err)
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