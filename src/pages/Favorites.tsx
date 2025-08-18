import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Heart, Clock, Star, MapPin } from 'lucide-react'
import { Meal, Restaurant } from '@/types'

// Mock favorite data
const favoriteMeals: Meal[] = [
  {
    id: '2',
    name: 'Avocado Toast',
    description: 'Creamy avocado on toasted sourdough with a sprinkle of everything seasoning',
    category: 'breakfast',
    cuisine: 'American',
    difficulty: 'easy',
    cookingTime: 10,
    tags: ['vegetarian', 'healthy'],
    isFavorite: true,
  },
]

const favoriteRestaurants: Restaurant[] = [
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

export default function Favorites() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'meals' | 'restaurants'>('meals')

  const handleItemClick = (item: Meal | Restaurant, type: 'meal' | 'restaurant') => {
    navigate(`/${type}/${item.id}`)
  }

  const hasFavorites = favoriteMeals.length > 0 || favoriteRestaurants.length > 0
  const currentItems = activeTab === 'meals' ? favoriteMeals : favoriteRestaurants

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveTab('meals')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'meals' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Meals ({favoriteMeals.length})
          </button>
          <button
            onClick={() => setActiveTab('restaurants')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'restaurants' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Restaurants ({favoriteRestaurants.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {!hasFavorites ? (
          <motion.div
            className="flex flex-col items-center justify-center h-full px-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <Heart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Favorites Yet</h3>
            <p className="text-muted-foreground text-balance mb-6">
              Start exploring and save your favorite meals and restaurants
            </p>
            <button
              onClick={() => navigate('/search')}
              className="btn btn-primary btn-md"
            >
              Discover Now
            </button>
          </motion.div>
        ) : currentItems.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center h-full px-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              No Favorite {activeTab === 'meals' ? 'Meals' : 'Restaurants'}
            </h3>
            <p className="text-muted-foreground text-balance">
              Explore and add some {activeTab} to your favorites
            </p>
          </motion.div>
        ) : (
          <div className="p-4 space-y-4">
            {currentItems.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => handleItemClick(item, activeTab === 'meals' ? 'meal' : 'restaurant')}
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
                          {activeTab === 'meals' ? (
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
                        {activeTab === 'restaurants' && (item as Restaurant).rating && (
                          <div className="flex items-center space-x-1 text-sm">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{(item as Restaurant).rating}</span>
                          </div>
                        )}
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}