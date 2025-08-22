import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Heart, Clock, Star, MapPin, RefreshCw } from 'lucide-react'
import { Meal, Restaurant } from '@/types'
import { favoritesApi } from '@/services/api'

export default function Favorites() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'meals' | 'restaurants'>('meals')

  // Fetch favorite meals
  const {
    data: favoriteMeals = [],
    isLoading: mealsLoading,
    error: mealsError,
    refetch: refetchMeals,
  } = useQuery({
    queryKey: ['favorites', 'meals'],
    queryFn: favoritesApi.getFavoriteMeals,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Fetch favorite restaurants
  const {
    data: favoriteRestaurants = [],
    isLoading: restaurantsLoading,
    error: restaurantsError,
    refetch: refetchRestaurants,
  } = useQuery({
    queryKey: ['favorites', 'restaurants'],
    queryFn: favoritesApi.getFavoriteRestaurants,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Listen for favorite updates from other components
  useEffect(() => {
    const handleFavoriteUpdate = (event: CustomEvent) => {
      const { itemType, itemId, isFavorite } = event.detail
      
      console.log('Favorites page: Received favorite update', { itemType, itemId, isFavorite })
      
      // Invalidate and refetch the appropriate favorites
      if (itemType === 'meal') {
        queryClient.invalidateQueries({ queryKey: ['favorites', 'meals'] })
      } else if (itemType === 'restaurant') {
        queryClient.invalidateQueries({ queryKey: ['favorites', 'restaurants'] })
      }
      
      // Also invalidate the general favorites query
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    }

    // Listen for the favoritesUpdated event from all components
    window.addEventListener('favoritesUpdated', handleFavoriteUpdate as EventListener)

    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoriteUpdate as EventListener)
    }
  }, [queryClient])

  const handleItemClick = (item: Meal | Restaurant, type: 'meal' | 'restaurant') => {
    navigate(`/${type}/${item.id}`)
  }

  const handleRefresh = () => {
    if (activeTab === 'meals') {
      refetchMeals()
    } else {
      refetchRestaurants()
    }
  }

  const isLoading = activeTab === 'meals' ? mealsLoading : restaurantsLoading
  const error = activeTab === 'meals' ? mealsError : restaurantsError
  const hasFavorites = favoriteMeals.length > 0 || favoriteRestaurants.length > 0
  const currentItems = activeTab === 'meals' ? favoriteMeals : favoriteRestaurants

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold">My Favorites</h1>
          <button
            onClick={handleRefresh}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex items-center bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveTab('meals')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'meals' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Meals ({isLoading ? '...' : favoriteMeals.length})
          </button>
          <button
            onClick={() => setActiveTab('restaurants')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'restaurants' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Restaurants ({isLoading ? '...' : favoriteRestaurants.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {error ? (
          <motion.div
            className="flex flex-col items-center justify-center h-full px-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Error Loading Favorites</h3>
            <p className="text-muted-foreground text-balance mb-4">
              {error.message || 'Failed to load your favorites. Please try again.'}
            </p>
            <button
              onClick={handleRefresh}
              className="btn btn-primary btn-md"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Retry'}
            </button>
          </motion.div>
        ) : isLoading ? (
          <motion.div
            className="flex flex-col items-center justify-center h-full px-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <RefreshCw className="w-8 h-8 text-muted-foreground animate-spin" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Loading Favorites</h3>
            <p className="text-muted-foreground">
              Getting your favorite {activeTab}...
            </p>
          </motion.div>
        ) : !hasFavorites ? (
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