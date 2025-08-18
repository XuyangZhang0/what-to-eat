import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Clock, ChefHat } from 'lucide-react'
import { SearchFilter, SearchMode, MealCategory } from '@/types'

interface SearchFiltersProps {
  mode: SearchMode
  filters: SearchFilter
  onChange: (filters: SearchFilter) => void
  onClose: () => void
}

const mealCategories: { value: MealCategory; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'drink', label: 'Drink' },
]

const cuisines = [
  'Italian', 'Chinese', 'Mexican', 'Japanese', 'Indian', 'Thai', 
  'Mediterranean', 'American', 'French', 'Korean'
]

const difficulties = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

const cookingTimes = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
]

export default function SearchFilters({ mode, filters, onChange, onClose }: SearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilter>(filters)

  const updateFilter = (key: keyof SearchFilter, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onChange(newFilters)
  }

  const clearFilters = () => {
    setLocalFilters({})
    onChange({})
  }

  const hasActiveFilters = Object.keys(localFilters).length > 0

  return (
    <motion.div
      className="p-4 bg-muted/30"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {mode === 'meals' ? (
          <>
            {/* Category Filter */}
            <div>
              <h4 className="text-sm font-medium mb-3">Category</h4>
              <div className="flex flex-wrap gap-2">
                {mealCategories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => updateFilter('category', 
                      localFilters.category === category.value ? undefined : category.value
                    )}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      localFilters.category === category.value
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-input hover:bg-muted'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center">
                <ChefHat className="w-4 h-4 mr-2" />
                Difficulty
              </h4>
              <div className="flex flex-wrap gap-2">
                {difficulties.map((difficulty) => (
                  <button
                    key={difficulty.value}
                    onClick={() => updateFilter('difficulty', 
                      localFilters.difficulty === difficulty.value ? undefined : difficulty.value
                    )}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      localFilters.difficulty === difficulty.value
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-input hover:bg-muted'
                    }`}
                  >
                    {difficulty.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cooking Time Filter */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Max Cooking Time
              </h4>
              <div className="flex flex-wrap gap-2">
                {cookingTimes.map((time) => (
                  <button
                    key={time.value}
                    onClick={() => updateFilter('maxCookingTime', 
                      localFilters.maxCookingTime === time.value ? undefined : time.value
                    )}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      localFilters.maxCookingTime === time.value
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-input hover:bg-muted'
                    }`}
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Cuisine Filter for Restaurants */}
            <div>
              <h4 className="text-sm font-medium mb-3">Cuisine</h4>
              <div className="flex flex-wrap gap-2">
                {cuisines.map((cuisine) => (
                  <button
                    key={cuisine}
                    onClick={() => updateFilter('cuisine', 
                      localFilters.cuisine === cuisine ? undefined : cuisine
                    )}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      localFilters.cuisine === cuisine
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-input hover:bg-muted'
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Cuisine Filter (also for meals) */}
        {mode === 'meals' && (
          <div>
            <h4 className="text-sm font-medium mb-3">Cuisine</h4>
            <div className="flex flex-wrap gap-2">
              {cuisines.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => updateFilter('cuisine', 
                    localFilters.cuisine === cuisine ? undefined : cuisine
                  )}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    localFilters.cuisine === cuisine
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-input hover:bg-muted'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}