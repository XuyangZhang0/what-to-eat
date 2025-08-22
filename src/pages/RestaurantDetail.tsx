import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Star, 
  MapPin, 
  Phone, 
  Globe, 
  Share, 
  Navigation,
  Clock,
  DollarSign,
  Menu,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { restaurantsApi, userFavoritesApi } from '@/services/api'
import { useRestaurant } from '@/hooks/useRestaurant'
import { useAuth } from '@/hooks/useAuth'
import { Restaurant } from '@/types'
import { getFavoriteStatus } from '@/utils/favorites'
import { formatOpeningHoursForDisplay } from '@/utils/openingHours'

// Parse opening hours if available
const parseOpeningHours = (openingHours: any) => {
  if (!openingHours) return null
  
  try {
    if (typeof openingHours === 'string') {
      return JSON.parse(openingHours)
    }
    return openingHours
  } catch {
    return null
  }
}


// Default menu highlights for display
const defaultMenuHighlights = [
  { name: 'Popular Item 1', price: 'Market Price', description: 'Ask your server for details' },
  { name: 'Popular Item 2', price: 'Market Price', description: 'Ask your server for details' },
  { name: 'Popular Item 3', price: 'Market Price', description: 'Ask your server for details' },
]

export default function RestaurantDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { restaurant, loading, error, refetch } = useRestaurant(id)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'hours'>('overview')

  // Update favorite status when restaurant data changes
  useEffect(() => {
    if (restaurant) {
      // Check both formats for favorite status using utility function
      const favoriteStatus = getFavoriteStatus(restaurant)
      setIsFavorite(favoriteStatus)
      console.log('Restaurant favorite status:', { 
        name: restaurant.name,
        isFavorite: restaurant.isFavorite,
        is_favorite: restaurant.is_favorite,
        resolved: favoriteStatus
      })
    }
  }, [restaurant])

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading restaurant details...</p>
      </div>
    )
  }

  // Show error state
  if (error || !restaurant) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Restaurant Not Found</h2>
        <p className="text-muted-foreground text-center mb-4">
          {error || 'The restaurant you\'re looking for could not be found.'}
        </p>
        <button 
          onClick={() => refetch()}
          className="btn btn-outline btn-md"
        >
          Try Again
        </button>
      </div>
    )
  }

  const openingHours = parseOpeningHours(restaurant.opening_hours)
  const formattedHours = formatOpeningHoursForDisplay(openingHours)

  const handleFavoriteToggle = async () => {
    if (!id || isTogglingFavorite || !restaurant) return
    
    const currentStatus = isFavorite
    console.log('Toggling favorite for restaurant:', restaurant.name, 'from:', currentStatus)
    
    setIsTogglingFavorite(true)
    try {
      let result: { isFavorite?: boolean; is_favorite?: boolean }
      
      // Check if this restaurant belongs to the current user
      const isOwnRestaurant = user && restaurant.user_id && String(restaurant.user_id) === String(user.id)
      
      console.log('Restaurant ownership check:', {
        isOwnRestaurant,
        currentUserId: user?.id,
        restaurantUserId: restaurant.user_id,
        restaurantName: restaurant.name
      })
      
      if (isOwnRestaurant) {
        // Use the regular restaurant API for own restaurants
        console.log('Using own restaurant API')
        result = await restaurantsApi.toggleFavorite(id)
        setIsFavorite(result.isFavorite || false)
      } else {
        // Use the cross-user favorites API for discovered restaurants
        console.log('Using cross-user favorites API')
        result = await userFavoritesApi.toggleRestaurantFavorite(id)
        setIsFavorite(result.is_favorite || false)
      }
      
      console.log('Favorite toggle result:', result)
      
      // Dispatch custom event to notify other components of favorite update
      const newFavoriteStatus = result.isFavorite ?? result.is_favorite ?? false
      window.dispatchEvent(new CustomEvent('favoritesUpdated', {
        detail: {
          itemId: id,
          itemType: 'restaurant',
          itemName: restaurant.name,
          isFavorite: newFavoriteStatus
        }
      }))
      
      console.log('Successfully toggled favorite to:', newFavoriteStatus)
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      console.error('Error details:', {
        restaurantId: id,
        restaurantName: restaurant.name,
        userId: user?.id,
        isOwnRestaurant: user && restaurant.user_id && String(restaurant.user_id) === String(user.id),
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error
      })
      // Revert the UI state on error - no need to revert since we only update on success
    } finally {
      setIsTogglingFavorite(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: restaurant.name,
        text: restaurant.description,
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleDirections = () => {
    // Open maps app with directions
    const address = encodeURIComponent(restaurant.address || '')
    window.open(`https://maps.google.com/maps?daddr=${address}`, '_blank')
  }

  const handleCall = () => {
    if (restaurant.phone) {
      window.open(`tel:${restaurant.phone}`)
    }
  }

  const handleWebsite = () => {
    if (restaurant.website) {
      window.open(restaurant.website, '_blank')
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Hero Image */}
      <motion.div
        className="relative h-64 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Image placeholder */}
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <span className="text-6xl font-bold text-muted-foreground opacity-50">
            {restaurant.name.charAt(0)}
          </span>
        </div>
        
        {/* Status indicator */}
        <div className="absolute top-4 left-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            restaurant.isOpen 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {restaurant.isOpen ? 'Open' : 'Closed'}
          </span>
        </div>
        
        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={handleShare}
            className="w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
          >
            <Share className="w-5 h-5" />
          </button>
          <button
            onClick={handleFavoriteToggle}
            className="w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* Header Info */}
        <motion.div
          className="p-6 border-b border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-2xl font-bold flex-1">{restaurant.name}</h1>
            <div className="flex items-center space-x-1 ml-4">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{restaurant.rating || 'N/A'}</span>
            </div>
          </div>
          
          <p className="text-muted-foreground mb-4">{restaurant.description || 'No description available.'}</p>
          
          {/* Meta info */}
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>{restaurant.cuisine || restaurant.cuisine_type || 'Cuisine not specified'}</span>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <DollarSign className="w-3 h-3" />
              <span>{restaurant.priceRange || restaurant.price_range || 'N/A'}</span>
            </div>
            {restaurant.distance && (
              <>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{Math.round(restaurant.distance / 1000 * 10) / 10} km away</span>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="p-4 flex space-x-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button 
            onClick={handleDirections}
            className="flex-1 btn btn-primary btn-md"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Directions
          </button>
          <button 
            onClick={handleCall}
            className="btn btn-outline btn-md"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button 
            onClick={handleWebsite}
            className="btn btn-outline btn-md"
          >
            <Globe className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          className="px-4 py-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center bg-muted rounded-lg p-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'overview' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'menu' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Menu
            </button>
            <button
              onClick={() => setActiveTab('hours')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'hours' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Hours
            </button>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          className="p-4"
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Address */}
              <div className="p-4 bg-card rounded-lg border">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium mb-1">Address</h3>
                    <p className="text-sm text-muted-foreground">{restaurant.address || 'Address not available'}</p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              {restaurant.phone && (
                <div className="p-4 bg-card rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-medium mb-1">Phone</h3>
                      <p className="text-sm text-muted-foreground">{restaurant.phone}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Popular Items</h3>
                <button className="text-sm text-primary hover:underline">
                  View full menu
                </button>
              </div>
              <div className="space-y-3">
                {defaultMenuHighlights.map((item, index) => (
                  <motion.div
                    key={index}
                    className="p-4 bg-card rounded-lg border"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      </div>
                      <span className="font-semibold text-primary ml-3">{item.price}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'hours' && (
            <div className="space-y-3">
              {openingHours && Object.keys(formattedHours).length > 0 ? (
                Object.entries(formattedHours).map(([day, hours], index) => (
                  <motion.div
                    key={day}
                    className="flex items-center justify-between p-3 bg-card rounded-lg border"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <span className="font-medium capitalize">{day}</span>
                    <span className={`text-sm ${hours === 'Closed' ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {hours}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Opening hours not available</p>
                  <p className="text-sm">Please contact the restaurant for current hours</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}