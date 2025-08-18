import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Smartphone, Utensils, MapPin, Sparkles, AlertCircle, Settings } from 'lucide-react'
import { useShakeDetection } from '@/hooks/useShakeDetection'
import { useShakeSettings } from '@/hooks/useShakeSettings'
import ShakeButton from '@/components/ShakeButton'
import QuickActions from './QuickActions'
import RecentSuggestions from './RecentSuggestions'
import { getRandomSuggestion } from '@/services/api'
import { Meal } from '@/types'

export default function Home() {
  const navigate = useNavigate()
  const { settings: shakeSettings, isLoaded: settingsLoaded } = useShakeSettings()
  const [hasShaken, setHasShaken] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false)

  // Enhanced shake detection with user settings
  const {
    isShaking,
    isSupported,
    permissionState,
    requiresPermission,
    requestPermission,
    currentIntensity
  } = useShakeDetection({
    threshold: shakeSettings.threshold,
    sensitivity: shakeSettings.sensitivity,
    cooldownPeriod: shakeSettings.cooldownPeriod,
    enabled: shakeSettings.isEnabled && settingsLoaded,
    hapticFeedback: shakeSettings.hapticFeedback,
    onShakeDetected: useCallback(() => {
      handleShakeAction()
    }, []),
    onPermissionChange: useCallback((state) => {
      console.log('Permission state changed:', state)
      if (state.state === 'denied') {
        setShowPermissionPrompt(true)
      }
    }, [])
  })

  const handleShakeAction = useCallback(async () => {
    if (isLoading) return

    setIsLoading(true)
    setHasShaken(true)
    
    try {
      // Get random meal suggestion
      const meal = await getRandomSuggestion('meals') as Meal;
      
      // Navigate to the meal detail page
      navigate(`/meals/${meal.id}?source=random&intensity=${Math.round(currentIntensity)}`);
    } catch (error) {
      console.error('Failed to get random suggestion:', error)
      // TODO: Show a user-friendly error message
    } finally {
      setIsLoading(false)
      // Reset shake state after a delay
      setTimeout(() => setHasShaken(false), 1000)
    }
  }, [isLoading, currentIntensity, navigate])

  const handleRequestPermission = async () => {
    const granted = await requestPermission()
    if (granted) {
      setShowPermissionPrompt(false)
    }
  }

  // Check permission state on mount
  useEffect(() => {
    if (requiresPermission && permissionState.state === 'prompt') {
      setShowPermissionPrompt(true)
    }
  }, [requiresPermission, permissionState])

  return (
    <div className="flex flex-col min-h-full bg-gradient-to-b from-primary/5 to-background">
      {/* Hero Section */}
      <motion.div
        className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* App Icon */}
        <motion.div
          className="w-24 h-24 mb-6 bg-primary/10 rounded-full flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Utensils className="w-12 h-12 text-primary" />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-3xl font-bold mb-4 text-balance"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          What to Eat?
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-muted-foreground mb-8 text-balance max-w-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Shake your phone or tap the button to discover your next delicious meal
        </motion.p>

        {/* Shake Button */}
        <ShakeButton 
          onShake={handleShakeAction}
          isShaking={isShaking || hasShaken}
          isLoading={isLoading}
          disabled={!isSupported || permissionState.state === 'denied'}
          intensity={currentIntensity}
          className="mb-8"
        />

        {/* Permission Prompt */}
        {showPermissionPrompt && permissionState.state !== 'granted' && (
          <motion.div
            className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg max-w-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  {permissionState.state === 'denied' ? 'Motion Access Denied' : 'Motion Access Required'}
                </h4>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
                  {permissionState.state === 'denied' 
                    ? 'Shake detection is disabled. Enable in Settings > Motion & Orientation.'
                    : 'Allow motion access to detect phone shaking for random suggestions.'
                  }
                </p>
                <div className="flex space-x-2">
                  {permissionState.state !== 'denied' && (
                    <button
                      onClick={handleRequestPermission}
                      className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
                    >
                      Allow Access
                    </button>
                  )}
                  <button
                    onClick={() => setShowPermissionPrompt(false)}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    {permissionState.state === 'denied' ? 'Dismiss' : 'Later'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          className="flex flex-col items-center space-y-2 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4" />
            <span>
              {!isSupported 
                ? 'Shake detection not supported on this device'
                : permissionState.state === 'denied'
                ? 'Shake detection disabled - check settings'
                : permissionState.state === 'granted'
                ? 'Shake your device to get started'
                : 'Tap "Allow Access" above to enable shake detection'
              }
            </span>
          </div>
          {isSupported && permissionState.state === 'granted' && currentIntensity > 0 && (
            <div className="flex items-center space-x-1 text-xs">
              <span>Shake intensity:</span>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-3 rounded-full ${
                      i < Math.min(currentIntensity / 5, 5) 
                        ? 'bg-primary' 
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Suggestions */}
      <RecentSuggestions />

      {/* Features Grid */}
      <motion.div
        className="px-6 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-xl font-semibold mb-4">Features</h2>
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            className="p-4 bg-card rounded-lg border text-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Utensils className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium mb-1">Recipes</h3>
            <p className="text-sm text-muted-foreground">Discover new recipes to cook</p>
          </motion.div>

          <motion.div
            className="p-4 bg-card rounded-lg border text-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium mb-1">Restaurants</h3>
            <p className="text-sm text-muted-foreground">Find nearby restaurants</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
