import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Loader2, Clock, Star, MapPin, Heart } from 'lucide-react'
import { SearchFilter, SearchMode, Meal, Restaurant } from '@/types'

interface SearchResultsProps {
  query: string
  mode: SearchMode
  filters: SearchFilter
  isSearching: boolean
}

// Mock data - replace with actual API calls
const mockMeals: Meal[] = [
  {
    id: '1',
    name: 'Chicken Teriyaki Bowl',
    description: 'Tender chicken glazed with homemade teriyaki sauce over steamed rice',
    category: 'dinner',
    cuisine: 'Japanese',
    difficulty: 'easy',
    cookingTime: 25,
    tags: ['healthy', 'gluten-free'],
    image: '/images/chicken-teriyaki.jpg',
    isFavorite: false,
  },
  {
    id: '2',
    name: 'Avocado Toast',
    description: 'Creamy avocado on toasted sourdough with a sprinkle of everything seasoning',
    category: 'breakfast',
    cuisine: 'American',
    difficulty: 'easy',
    cookingTime: 10,
    tags: ['vegetarian', 'healthy'],
    image: '/images/avocado-toast.jpg',
    isFavorite: true,
  },
]

const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Pizza Palace',
    description: 'Authentic Italian pizza with fresh ingredients',
    cuisine: 'Italian',
    address: '123 Main St, City',
    rating: 4.5,
    priceRange: '$$',
    distance: 500,
    isOpen: true,
    isFavorite: false,
  },
  {
    id: '2',
    name: 'Sushi Garden',
    description: 'Fresh sushi and Japanese cuisine',
    cuisine: 'Japanese',
    address: '456 Oak Ave, City',
    rating: 4.8,
    priceRange: '$$$',
    distance: 800,
    isOpen: true,
    isFavorite: true,
  },
]

export default function SearchResults({ query, mode, filters, isSearching }: SearchResultsProps) {
  const navigate = useNavigate()

  const handleItemClick = (item: Meal | Restaurant) => {
    if (mode === 'meals') {
      navigate(`/meal/${item.id}`)
    } else {
      navigate(`/restaurant/${item.id}`)
    }
  }

  // Filter results based on filters
  const filteredMeals = mockMeals.filter(meal => {
    if (filters.category && meal.category !== filters.category) return false
    if (filters.cuisine && meal.cuisine !== filters.cuisine) return false
    if (filters.difficulty && meal.difficulty !== filters.difficulty) return false
    if (filters.maxCookingTime && meal.cookingTime && meal.cookingTime > filters.maxCookingTime) return false
    if (query && !meal.name.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })

  const filteredRestaurants = mockRestaurants.filter(restaurant => {
    if (filters.cuisine && restaurant.cuisine !== filters.cuisine) return false
    if (query && !restaurant.name.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })

  const results = mode === 'meals' ? filteredMeals : filteredRestaurants
  const hasFilters = Object.keys(filters).length > 0 || query.length > 0

  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Searching for delicious options...</p>
      </div>
    )
  }

  if (!hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">🍽️</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">Start Your Search</h3>
        <p className="text-muted-foreground text-balance">
          Search for {mode} or use filters to discover your next meal
        </p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">😕</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
        <p className="text-muted-foreground text-balance">
          Try adjusting your search or filters to find more options
        </p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {results.length} {results.length === 1 ? 'result' : 'results'} found
        </p>
      </div>

      <div className="space-y-4">
        {results.map((item, index) => (
          <motion.button
            key={item.id}
            onClick={() => handleItemClick(item)}
            className="w-full p-4 bg-card rounded-lg border hover:bg-muted/50 transition-colors text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start space-x-4">
              {/* Image placeholder */}
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-medium text-muted-foreground">
                  {item.name.charAt(0)}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-1 truncate">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                      {mode === 'meals' ? (
                        <>
                          {(item as Meal).cookingTime && (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{(item as Meal).cookingTime} min</span>
                            </div>
                          )}
                          <span className="capitalize">{(item as Meal).category}</span>
                          <span>•</span>
                          <span>{(item as Meal).cuisine}</span>
                        </>
                      ) : (
                        <>
                          <span>{(item as Restaurant).cuisine}</span>
                          {(item as Restaurant).distance && (
                            <>
                              <span>•</span>
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span>{Math.round((item as Restaurant).distance! / 1000 * 10) / 10} km</span>
                              </div>
                            </>
                          )}
                          <span>•</span>
                          <span>{(item as Restaurant).priceRange}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Rating and Favorite */}
                  <div className="flex flex-col items-end space-y-2 ml-2">
                    {mode === 'restaurants' && (item as Restaurant).rating && (
                      <div className="flex items-center space-x-1 text-sm">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{(item as Restaurant).rating}</span>
                      </div>
                    )}
                    <Heart 
                      className={`w-4 h-4 ${
                        item.isFavorite 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-muted-foreground'
                      }`} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}