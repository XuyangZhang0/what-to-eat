import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Zap, Sun, Cloud, Sparkles, Coffee, Home, Star } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { favoritesApi } from '@/services/api'
import { favoriteMealsToSlotItems, favoriteRestaurantsToSlotItems } from '@/components/SlotMachine/utils'
import type { SlotItem } from '@/components/SlotMachine/types'

interface Mood {
  id: string
  name: string
  icon: React.ComponentType<any>
  color: string
  description: string
  keywords: string[]
  cuisinePreference?: string[]
  difficultyPreference?: string[]
  categoryPreference?: string[]
}

const moods: Mood[] = [
  {
    id: 'comfort',
    name: 'Comfort',
    icon: Home,
    color: 'bg-orange-500',
    description: 'Warm, cozy, and familiar',
    keywords: ['comfort', 'warm', 'hearty', 'familiar', 'nostalgic'],
    cuisinePreference: ['American', 'Italian'],
    difficultyPreference: ['easy'],
    categoryPreference: ['dinner', 'lunch']
  },
  {
    id: 'energetic',
    name: 'Energetic',
    icon: Zap,
    color: 'bg-yellow-500',
    description: 'Fresh, vibrant, and energizing',
    keywords: ['fresh', 'light', 'energizing', 'vibrant', 'healthy'],
    cuisinePreference: ['Mediterranean', 'Asian'],
    difficultyPreference: ['easy', 'medium'],
    categoryPreference: ['breakfast', 'lunch']
  },
  {
    id: 'adventurous',
    name: 'Adventurous',
    icon: Sparkles,
    color: 'bg-purple-500',
    description: 'Bold, exotic, and exciting',
    keywords: ['exotic', 'spicy', 'bold', 'new', 'exciting'],
    cuisinePreference: ['Thai', 'Indian', 'Mexican', 'Korean'],
    difficultyPreference: ['medium', 'hard'],
    categoryPreference: ['dinner']
  },
  {
    id: 'romantic',
    name: 'Romantic',
    icon: Heart,
    color: 'bg-pink-500',
    description: 'Elegant, sophisticated, and intimate',
    keywords: ['elegant', 'sophisticated', 'romantic', 'date', 'special'],
    cuisinePreference: ['French', 'Italian', 'Mediterranean'],
    difficultyPreference: ['medium', 'hard'],
    categoryPreference: ['dinner']
  },
  {
    id: 'lazy',
    name: 'Lazy',
    icon: Cloud,
    color: 'bg-gray-500',
    description: 'Simple, easy, and low-effort',
    keywords: ['simple', 'easy', 'quick', 'minimal', 'convenient'],
    cuisinePreference: ['American'],
    difficultyPreference: ['easy'],
    categoryPreference: ['snack', 'lunch']
  },
  {
    id: 'productive',
    name: 'Productive',
    icon: Coffee,
    color: 'bg-green-500',
    description: 'Nutritious, brain-boosting, and satisfying',
    keywords: ['nutritious', 'healthy', 'brain food', 'protein', 'satisfying'],
    cuisinePreference: ['Mediterranean', 'Asian'],
    difficultyPreference: ['easy', 'medium'],
    categoryPreference: ['breakfast', 'lunch']
  },
  {
    id: 'celebratory',
    name: 'Celebratory',
    icon: Star,
    color: 'bg-indigo-500',
    description: 'Special, festive, and indulgent',
    keywords: ['special', 'festive', 'celebration', 'indulgent', 'party'],
    cuisinePreference: ['Italian', 'French', 'American'],
    difficultyPreference: ['medium', 'hard'],
    categoryPreference: ['dinner', 'dessert']
  },
  {
    id: 'sunny',
    name: 'Sunny',
    icon: Sun,
    color: 'bg-yellow-400',
    description: 'Bright, fresh, and uplifting',
    keywords: ['fresh', 'bright', 'citrus', 'light', 'summery'],
    cuisinePreference: ['Mediterranean', 'Mexican'],
    difficultyPreference: ['easy', 'medium'],
    categoryPreference: ['breakfast', 'lunch']
  }
]

interface MoodSelectorProps {
  onMoodSelect: (suggestions: SlotItem[]) => void
  className?: string
}

export default function MoodSelector({ onMoodSelect, className = '' }: MoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Fetch favorite meals and restaurants
  const { data: meals = [] } = useQuery({
    queryKey: ['favorite-meals'],
    queryFn: () => favoritesApi.getFavoriteMeals(),
  })

  const { data: restaurants = [] } = useQuery({
    queryKey: ['favorite-restaurants'],
    queryFn: () => favoritesApi.getFavoriteRestaurants(),
  })

  const analyzeAndSuggest = useCallback(async (mood: Mood) => {
    setSelectedMood(mood)
    setIsAnalyzing(true)

    // Convert to slot items
    const mealItems = favoriteMealsToSlotItems(meals)
    const restaurantItems = favoriteRestaurantsToSlotItems(restaurants)
    const allItems = [...mealItems, ...restaurantItems]

    // Filter based on mood preferences
    let filteredItems = allItems.filter(item => {
      // Check cuisine preference
      if (mood.cuisinePreference && item.cuisine) {
        const moodCuisines = mood.cuisinePreference.map(c => c.toLowerCase())
        if (!moodCuisines.some(mc => item.cuisine!.toLowerCase().includes(mc))) {
          return false
        }
      }

      // Check difficulty preference (for meals)
      if (item.type === 'meal' && mood.difficultyPreference && item.difficulty) {
        if (!mood.difficultyPreference.includes(item.difficulty)) {
          return false
        }
      }

      // Check category preference
      if (mood.categoryPreference && item.category) {
        if (!mood.categoryPreference.includes(item.category)) {
          return false
        }
      }

      // Check if name or description contains mood keywords
      const searchText = `${item.name} ${item.description || ''}`.toLowerCase()
      const hasKeyword = mood.keywords.some(keyword => 
        searchText.includes(keyword.toLowerCase())
      )

      return hasKeyword
    })

    // If no perfect matches, be more lenient with cuisine preference only
    if (filteredItems.length === 0 && mood.cuisinePreference) {
      filteredItems = allItems.filter(item => {
        if (item.cuisine) {
          const moodCuisines = mood.cuisinePreference!.map(c => c.toLowerCase())
          return moodCuisines.some(mc => item.cuisine!.toLowerCase().includes(mc))
        }
        return false
      })
    }

    // If still no matches, show random favorites
    if (filteredItems.length === 0) {
      filteredItems = allItems.slice(0, 5)
    }

    // Simulate AI analysis time
    await new Promise(resolve => setTimeout(resolve, 1500))

    setIsAnalyzing(false)
    onMoodSelect(filteredItems)
  }, [meals, restaurants, onMoodSelect])

  const resetMood = useCallback(() => {
    setSelectedMood(null)
    setIsAnalyzing(false)
  }, [])

  return (
    <div className={`p-6 ${className}`}>
      <AnimatePresence mode="wait">
        {!selectedMood ? (
          <motion.div
            key="mood-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                How are you feeling?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Let your mood guide your food choices
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {moods.map((mood, index) => {
                const Icon = mood.icon
                return (
                  <motion.button
                    key={mood.id}
                    onClick={() => analyzeAndSuggest(mood)}
                    className={`p-4 rounded-2xl ${mood.color} text-white shadow-lg hover:shadow-xl transition-all duration-200 text-center group`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Icon className="w-8 h-8 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-lg mb-1">{mood.name}</h3>
                    <p className="text-sm opacity-90">{mood.description}</p>
                  </motion.button>
                )
              })}
            </div>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                🧠 AI-Powered Food Psychology
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Our mood-based suggestions use psychology and food science to match your emotional state with foods that can enhance your mood and satisfaction.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="mood-analysis"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center"
          >
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${selectedMood.color} text-white mb-4`}>
              {React.createElement(selectedMood.icon, { className: "w-10 h-10" })}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Feeling {selectedMood.name}
            </h2>
            
            {isAnalyzing ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Analyzing your mood and finding perfect matches...
                </p>
                <div className="max-w-md mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-purple-500 h-2 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <p className="text-green-600 dark:text-green-400 font-medium">
                  ✨ Perfect matches found! Check out your personalized suggestions below.
                </p>
                <button
                  onClick={resetMood}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Try Different Mood
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}