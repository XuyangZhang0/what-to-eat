import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Settings, Volume2, VolumeX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import SlotMachine from '@/components/SlotMachine'
import PowerballPicker from '@/components/PowerballPicker'
import { useShakeDetection } from '@/hooks/useShakeDetection'
import { favoritesApi, authApi } from '@/services/api'
import { favoriteMealsToSlotItems, favoriteRestaurantsToSlotItems } from '@/components/SlotMachine/utils'
import type { SlotItem } from '@/components/SlotMachine/types'
import { cn } from '@/utils/cn'

type AnimationStyle = 'slot-machine' | 'powerball'
type DemoMode = 'meals' | 'restaurants' | 'mixed'

export default function AnimationDemo() {
  const navigate = useNavigate()
  const [animationStyle, setAnimationStyle] = useState<AnimationStyle>(() => {
    const saved = localStorage.getItem('animation_style')
    return (saved === 'powerball' ? 'powerball' : 'slot-machine') as AnimationStyle
  })
  const [mode, setMode] = useState<DemoMode>('mixed')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [selectedItem, setSelectedItem] = useState<SlotItem | null>(null)
  const [isShakeTriggered, setIsShakeTriggered] = useState(false)

  // Load user's preferred animation style
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const profile = await authApi.getProfile()
        const preferences = JSON.parse(profile.preferences || '{}')
        
        if (preferences.animation_style) {
          setAnimationStyle(preferences.animation_style as AnimationStyle)
          localStorage.setItem('animation_style', preferences.animation_style)
        }
      } catch (error) {
        console.error('Failed to load user animation preference:', error)
      }
    }

    loadUserPreferences()
  }, [])

  // Shake detection
  const { isShaking } = useShakeDetection({
    enabled: true,
    threshold: 12,
    onShakeDetected: useCallback(() => {
      setIsShakeTriggered(true)
    }, [])
  })

  // Fetch favorite meals
  const { data: meals = [], isLoading: isLoadingMeals } = useQuery({
    queryKey: ['favorite-meals'],
    queryFn: () => favoritesApi.getFavoriteMeals(),
    enabled: mode === 'meals' || mode === 'mixed'
  })

  // Fetch favorite restaurants
  const { data: restaurants = [], isLoading: isLoadingRestaurants } = useQuery({
    queryKey: ['favorite-restaurants'],
    queryFn: () => favoritesApi.getFavoriteRestaurants(),
    enabled: mode === 'restaurants' || mode === 'mixed'
  })

  // Prepare items based on mode
  const items: SlotItem[] = (() => {
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

  const handleSelection = useCallback((item: SlotItem) => {
    setSelectedItem(item)
    console.log('Selected item:', item)
  }, [])

  const handleShakeReset = useCallback(() => {
    setIsShakeTriggered(false)
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
            Animation Styles
          </h1>
          
          <div className="flex items-center gap-2">
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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Animation Style Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Choose Animation Style
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={async () => {
                setAnimationStyle('slot-machine')
                localStorage.setItem('animation_style', 'slot-machine')
                try {
                  await authApi.updateProfile({
                    preferences: { animation_style: 'slot-machine' }
                  })
                } catch (error) {
                  console.error('Error saving animation style preference:', error)
                }
              }}
              className={cn(
                "p-4 rounded-lg text-left transition-all duration-200",
                animationStyle === 'slot-machine'
                  ? "bg-purple-500 text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600"
              )}
            >
              <div className="text-2xl mb-2">🎰</div>
              <h3 className="font-medium mb-1">Slot Machine</h3>
              <p className="text-sm opacity-90">Classic spinning reels with mechanical sounds</p>
            </button>
            
            <button
              onClick={async () => {
                setAnimationStyle('powerball')
                localStorage.setItem('animation_style', 'powerball')
                try {
                  await authApi.updateProfile({
                    preferences: { animation_style: 'powerball' }
                  })
                } catch (error) {
                  console.error('Error saving animation style preference:', error)
                }
              }}
              className={cn(
                "p-4 rounded-lg text-left transition-all duration-200",
                animationStyle === 'powerball'
                  ? "bg-purple-500 text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600"
              )}
            >
              <div className="text-2xl mb-2">🎱</div>
              <h3 className="font-medium mb-1">Powerball Picker</h3>
              <p className="text-sm opacity-90">Physics-based balls in a swirling chamber</p>
            </button>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Choose Content Type
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
            <p className="text-gray-600 dark:text-gray-400">Loading items...</p>
          </div>
        )}

        {/* Animation Component */}
        {!isLoading && items.length > 0 && (
          <motion.div
            key={animationStyle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            {animationStyle === 'slot-machine' ? (
              <SlotMachine
                items={items}
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
                items={items}
                onSelection={handleSelection}
                isShakeTriggered={isShakeTriggered}
                onShakeReset={handleShakeReset}
                soundEnabled={soundEnabled}
                drawDuration={4000}
                ballCount={Math.min(12, items.length)}
              />
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && items.length === 0 && (
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
                onClick={() => navigate('/meals')}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Browse Meals
              </button>
              <button
                onClick={() => navigate('/restaurants')} 
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Browse Restaurants
              </button>
            </div>
          </div>
        )}

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
            <li>• Choose your preferred animation style above</li>
            <li>• Select content type (meals, restaurants, or both)</li>
            <li>• Click the action button to start the animation</li>
            <li>• Shake your device to trigger automatically</li>
            <li>• Only items marked as favorites will appear</li>
            <li>• Toggle sound effects using the volume button in the header</li>
          </ul>
        </motion.div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
            <h4 className="font-semibold mb-2">Debug Info:</h4>
            <div className="space-y-1 text-gray-600 dark:text-gray-400">
              <div>Animation Style: {animationStyle}</div>
              <div>Mode: {mode}</div>
              <div>Items: {items.length}</div>
              <div>Is Shaking: {isShaking ? 'Yes' : 'No'}</div>
              <div>Sound Enabled: {soundEnabled ? 'Yes' : 'No'}</div>
              <div>Selected: {selectedItem?.name || 'None'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}