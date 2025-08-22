import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Settings, Volume2, VolumeX, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import SlotMachine from '@/components/SlotMachine'
import PowerballPicker from '@/components/PowerballPicker'
import { useShakeDetection } from '@/hooks/useShakeDetection'
import { useAuth } from '@/hooks/useAuth'
import { favoritesApi } from '@/services/api'
import { favoriteMealsToSlotItems, favoriteRestaurantsToSlotItems } from '@/components/SlotMachine/utils'
import type { SlotItem } from '@/components/SlotMachine/types'
import { cn } from '@/utils/cn'

type DemoMode = 'meals' | 'restaurants' | 'mixed'

export default function SlotMachineDemo() {
  console.log('SlotMachineDemo component rendering...')
  
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  // Wrap auth hook in try-catch for safety
  let authState: { isAuthenticated: boolean; user: any; token: string | null }
  try {
    authState = useAuth()
  } catch (error) {
    console.error('Auth hook error:', error)
    authState = { isAuthenticated: false, user: null, token: null }
  }
  
  const { isAuthenticated, user, token } = authState
  const [mode, setMode] = useState<DemoMode>('mixed')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [selectedItem, setSelectedItem] = useState<SlotItem | null>(null)
  const [isShakeTriggered, setIsShakeTriggered] = useState(false)
  const [animationStyle, setAnimationStyle] = useState(() => {
    const saved = localStorage.getItem('animation_style')
    return saved === 'powerball' ? 'powerball' : 'slot-machine'
  })

  // Shake detection
  const { isShaking } = useShakeDetection({
    enabled: true,
    threshold: 12,
    onShakeDetected: useCallback(() => {
      setIsShakeTriggered(true)
    }, [])
  })

  // Fetch favorite meals only
  const { 
    data: meals = [], 
    isLoading: isLoadingMeals, 
    error: mealsError,
    isError: isMealsError 
  } = useQuery({
    queryKey: ['favorite-meals'],
    queryFn: () => favoritesApi.getFavoriteMeals(),
    enabled: isAuthenticated && (mode === 'meals' || mode === 'mixed'),
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: 'always', // Always refetch when component mounts
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.status === 401) return false
      return failureCount < 2
    },
    onError: (error: any) => {
      console.error('Error fetching favorite meals:', error)
      if (error?.status === 401) {
        console.warn('Authentication required for favorites')
      }
    }
  })

  // Fetch favorite restaurants only
  const { 
    data: restaurants = [], 
    isLoading: isLoadingRestaurants, 
    error: restaurantsError,
    isError: isRestaurantsError 
  } = useQuery({
    queryKey: ['favorite-restaurants'],
    queryFn: () => favoritesApi.getFavoriteRestaurants(),
    enabled: isAuthenticated && (mode === 'restaurants' || mode === 'mixed'),
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: 'always', // Always refetch when component mounts
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.status === 401) return false
      return failureCount < 2
    },
    onError: (error: any) => {
      console.error('Error fetching favorite restaurants:', error)
      if (error?.status === 401) {
        console.warn('Authentication required for favorites')
      }
    }
  })

  // Prepare slot items based on mode (favorites only)
  const slotItems: SlotItem[] = (() => {
    switch (mode) {
      case 'meals':
        return favoriteMealsToSlotItems(meals)
      case 'restaurants':
        return favoriteRestaurantsToSlotItems(restaurants)
      case 'mixed':
      default:
        return [
          ...favoriteMealsToSlotItems(meals),
          ...favoriteRestaurantsToSlotItems(restaurants)
        ]
    }
  })()

  const isLoading = isLoadingMeals || isLoadingRestaurants
  const hasError = isMealsError || isRestaurantsError
  const isAuthError = !isAuthenticated || (mealsError as any)?.status === 401 || (restaurantsError as any)?.status === 401

  const handleSelection = useCallback((item: SlotItem) => {
    setSelectedItem(item)
    console.log('Selected item:', item)
  }, [])

  const handleShakeReset = useCallback(() => {
    setIsShakeTriggered(false)
  }, [])

  // Effect to listen for favorites updates from other pages
  useEffect(() => {
    const handleFavoriteUpdate = (event: CustomEvent) => {
      console.log('Favorite update event received:', event.detail)
      // Invalidate both favorites queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['favorite-meals'] })
      queryClient.invalidateQueries({ queryKey: ['favorite-restaurants'] })
    }

    // Listen for custom events indicating favorites were updated
    window.addEventListener('favoritesUpdated' as any, handleFavoriteUpdate)
    
    // Also invalidate queries when the component becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        queryClient.invalidateQueries({ queryKey: ['favorite-meals'] })
        queryClient.invalidateQueries({ queryKey: ['favorite-restaurants'] })
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('favoritesUpdated' as any, handleFavoriteUpdate)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [queryClient])

  // Listen for animation style changes from localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'animation_style') {
        const newStyle = e.newValue === 'powerball' ? 'powerball' : 'slot-machine'
        setAnimationStyle(newStyle)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleItemAction = () => {
    if (selectedItem) {
      if (selectedItem.type === 'meal') {
        navigate(`/meal/${selectedItem.id}`)
      } else {
        navigate(`/restaurant/${selectedItem.id}`)
      }
    }
  }

  const handleRefresh = useCallback(() => {
    console.log('Manually refreshing favorites data...')
    console.log('Auth status:', { isAuthenticated, user: !!user, token: !!token })
    queryClient.invalidateQueries({ queryKey: ['favorite-meals'] })
    queryClient.invalidateQueries({ queryKey: ['favorite-restaurants'] })
  }, [queryClient, isAuthenticated, user, token])

  // Early authentication check and debug logging
  useEffect(() => {
    console.log('SlotMachineDemo mounted:', {
      isAuthenticated,
      hasUser: !!user,
      hasToken: !!token,
      mode,
      mealsLength: meals.length,
      restaurantsLength: restaurants.length,
      isLoading,
      hasError,
      isAuthError
    })
  }, [isAuthenticated, user, token, mode, meals.length, restaurants.length, isLoading, hasError, isAuthError])

  return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {animationStyle === 'slot-machine' ? 'Favorites Slot Machine' : 'Favorites Powerball Picker'}
          </h1>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Refresh favorites"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={soundEnabled ? 'Disable sound' : 'Enable sound'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Mode Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Choose Favorite Content Type
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { key: 'meals', label: 'Favorite Meals', emoji: '⭐🍽️' },
              { key: 'restaurants', label: 'Favorite Restaurants', emoji: '⭐🏪' },
              { key: 'mixed', label: 'All Favorites', emoji: '⭐🎲' },
            ].map(({ key, label, emoji }) => (
              <button
                key={key}
                onClick={() => setMode(key as DemoMode)}
                className={cn(
                  "p-3 rounded-lg text-sm font-medium transition-all duration-200",
                  mode === key
                    ? "bg-purple-500 text-white shadow-lg"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600"
                )}
              >
                <div className="text-lg mb-1">{emoji}</div>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading favorites...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && hasError && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {isAuthError ? 'Authentication Required' : 'Something went wrong'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {isAuthError 
                ? 'Please log in to access your favorites.' 
                : 'Unable to load your favorites. Please try again.'}
            </p>
            <div className="flex gap-3 justify-center">
              {isAuthError ? (
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Go to Login
                </button>
              ) : (
                <button
                  onClick={handleRefresh}
                  className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Try Again
                </button>
              )}
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        )}

        {/* Animation Component */}
        {!isLoading && !hasError && slotItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {animationStyle === 'slot-machine' ? (
              <SlotMachine
                items={slotItems}
                onSelection={handleSelection}
                isShakeTriggered={isShakeTriggered}
                onShakeReset={handleShakeReset}
                soundEnabled={soundEnabled}
                spinDuration={3000}
                celebrationDuration={2500}
                reelCount={3}
              />
            ) : (
              <PowerballPicker
                items={slotItems}
                onSelection={handleSelection}
                isShakeTriggered={isShakeTriggered}
                onShakeReset={handleShakeReset}
                soundEnabled={soundEnabled}
                spinDuration={3000}
                celebrationDuration={2500}
              />
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !hasError && slotItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No favorite items found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You haven't marked any items as favorites yet. Add some favorites and come back!
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/search')}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Discover Items
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        )}

        {/* Selected Item Detail */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="text-center">
                <div className="text-4xl mb-3">{selectedItem.emoji || '🎯'}</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedItem.name}
                </h3>
                {selectedItem.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedItem.description}
                  </p>
                )}
                
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {selectedItem.category && (
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                      {selectedItem.category}
                    </span>
                  )}
                  {selectedItem.cuisine && (
                    <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm">
                      {selectedItem.cuisine}
                    </span>
                  )}
                  {selectedItem.difficulty && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                      {selectedItem.difficulty}
                    </span>
                  )}
                  {selectedItem.cookingTime && (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
                      {selectedItem.cookingTime}m
                    </span>
                  )}
                  {selectedItem.rating && (
                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm">
                      ⭐ {selectedItem.rating}
                    </span>
                  )}
                  {selectedItem.priceRange && (
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                      {selectedItem.priceRange}
                    </span>
                  )}
                </div>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleItemAction}
                    className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
            How to use:
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <li>• Click the "Spin" button to randomly select from your favorites</li>
            <li>• Shake your device to trigger the slot machine automatically</li>
            <li>• Click "Stop" while spinning to force an early selection</li>
            <li>• Only items marked as favorites will appear in the slot machine</li>
            <li>• Switch between favorite meals, restaurants, or both</li>
            <li>• Toggle sound effects using the volume button in the header</li>
          </ul>
        </motion.div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
            <h4 className="font-semibold mb-2">Debug Info:</h4>
            <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-400">
              <div>Mode: {mode}</div>
              <div>Items: {slotItems.length}</div>
              <div>Is Shaking: {isShaking ? 'Yes' : 'No'}</div>
              <div>Sound Enabled: {soundEnabled ? 'Yes' : 'No'}</div>
              <div>Selected: {selectedItem?.name || 'None'}</div>
              <div>Auth: {isAuthenticated ? 'Yes' : 'No'}</div>
              <div>User: {user?.username || 'None'}</div>
              <div>Token: {token ? 'Present' : 'Missing'}</div>
              <div>Loading Meals: {isLoadingMeals ? 'Yes' : 'No'}</div>
              <div>Loading Restaurants: {isLoadingRestaurants ? 'Yes' : 'No'}</div>
              <div>Meals Error: {isMealsError ? 'Yes' : 'No'}</div>
              <div>Restaurants Error: {isRestaurantsError ? 'Yes' : 'No'}</div>
              <div>Meals Count: {meals.length}</div>
              <div>Restaurants Count: {restaurants.length}</div>
              <div>Has Error: {hasError ? 'Yes' : 'No'}</div>
              <div>Auth Error: {isAuthError ? 'Yes' : 'No'}</div>
            </div>
            {(mealsError || restaurantsError) && (
              <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-red-700 dark:text-red-300">
                <div className="font-semibold">Errors:</div>
                {mealsError && <div>Meals: {(mealsError as any)?.message || 'Unknown error'}</div>}
                {restaurantsError && <div>Restaurants: {(restaurantsError as any)?.message || 'Unknown error'}</div>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    )
}