import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Clock, Star } from 'lucide-react'
import { randomApi, mealsApi, restaurantsApi } from '@/services/api'
import type { Meal, Restaurant } from '@/types'

interface RecentSuggestion {
  id: string
  name: string
  type: 'meal' | 'restaurant'
  image?: string
  category?: string
  cuisine?: string
  cookingTime?: number
  rating?: number
}

export default function RecentSuggestions() {
  const navigate = useNavigate()
  const [recentSuggestions, setRecentSuggestions] = useState<RecentSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRecentSuggestions()
  }, [])

  const loadRecentSuggestions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Get recent selection history
      const historyResponse = await randomApi.getSelectionHistory({ page: 1, limit: 10 })
      const history = historyResponse.data
      
      if (history.length === 0) {
        setRecentSuggestions([])
        return
      }
      
      // Fetch full details for each item
      const suggestions: RecentSuggestion[] = []
      
      for (const selection of history.slice(0, 5)) { // Limit to 5 recent items
        try {
          if (selection.item_type === 'meal') {
            const meal = await mealsApi.getMealById(selection.item_id)
            suggestions.push({
              id: meal.id.toString(),
              name: meal.name,
              type: 'meal',
              category: meal.difficulty_level || 'meal',
              cookingTime: meal.prep_time,
              rating: 4.5 // Default rating for meals
            })
          } else {
            const restaurant = await restaurantsApi.getRestaurantById(selection.item_id)
            suggestions.push({
              id: restaurant.id.toString(),
              name: restaurant.name,
              type: 'restaurant',
              cuisine: restaurant.cuisine_type,
              rating: restaurant.rating || 4.0
            })
          }
        } catch (itemError) {
          console.warn(`Failed to fetch details for ${selection.item_type} ${selection.item_id}:`, itemError)
          // Skip this item if we can't fetch its details
        }
      }
      
      setRecentSuggestions(suggestions)
    } catch (err) {
      console.error('Failed to load recent suggestions:', err)
      setError('Failed to load recent suggestions')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <motion.div
        className="px-6 py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Suggestions</h2>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted rounded-lg"></div>
          ))}
        </div>
      </motion.div>
    )
  }

  if (error || recentSuggestions.length === 0) {
    return (
      <motion.div
        className="px-6 py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Suggestions</h2>
        </div>
        <div className="text-center py-6 text-muted-foreground">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            {error ? error : "No recent suggestions. Try using the random selection feature!"}
          </p>
        </div>
      </motion.div>
    )
  }

  const handleSuggestionClick = (suggestion: typeof recentSuggestions[0]) => {
    if (suggestion.type === 'meal') {
      navigate(`/meal/${suggestion.id}`)
    } else {
      navigate(`/restaurant/${suggestion.id}`)
    }
  }

  return (
    <motion.div
      className="px-6 py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent Suggestions</h2>
        <button 
          onClick={() => navigate('/search?recent=true')}
          className="text-sm text-primary hover:underline"
        >
          View all
        </button>
      </div>
      
      <div className="space-y-3">
        {recentSuggestions.map((suggestion, index) => (
          <motion.button
            key={suggestion.id}
            onClick={() => handleSuggestionClick(suggestion)}
            className="w-full flex items-center space-x-3 p-3 bg-card rounded-lg border hover:bg-muted/50 transition-colors text-left"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Image placeholder */}
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-muted-foreground">
                {suggestion.name.charAt(0)}
              </span>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{suggestion.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                {suggestion.type === 'meal' ? (
                  <>
                    <Clock className="w-3 h-3" />
                    <span>{suggestion.cookingTime} min</span>
                    <span>•</span>
                    <span className="capitalize">{suggestion.category}</span>
                  </>
                ) : (
                  <span>{suggestion.cuisine}</span>
                )}
              </div>
            </div>
            
            {/* Rating */}
            <div className="flex items-center space-x-1 text-sm">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{suggestion.rating}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}