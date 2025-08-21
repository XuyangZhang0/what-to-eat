import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Clock, 
  ChefHat, 
  Users, 
  Share, 
  BookOpen,
  ShoppingCart,
  Play,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'
import { Meal } from '@/types'
import { useMeal } from '@/hooks/useMeal'
import { mealsApi } from '@/services/api'


export default function MealDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { meal, loading, error, refetch } = useMeal(id)
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients')
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)

  // Update favorite status when meal data is loaded
  useEffect(() => {
    if (meal) {
      setIsFavorite(meal.isFavorite || false)
    }
  }, [meal])

  const handleFavoriteToggle = async () => {
    if (!meal || isTogglingFavorite) return
    
    setIsTogglingFavorite(true)
    try {
      const result = await mealsApi.toggleFavorite(meal.id)
      setIsFavorite(result.isFavorite)
      
      // Dispatch custom event to notify other components of favorite update
      window.dispatchEvent(new CustomEvent('favoritesUpdated', {
        detail: {
          itemId: meal.id,
          itemType: 'meal',
          itemName: meal.name,
          isFavorite: result.isFavorite
        }
      }))
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      // Revert the UI state on error
    } finally {
      setIsTogglingFavorite(false)
    }
  }

  const handleShare = () => {
    if (!meal) return
    
    if (navigator.share) {
      navigator.share({
        title: meal.name,
        text: meal.description,
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading meal details...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !meal) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="p-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Unable to Load Meal</h2>
            <p className="text-muted-foreground mb-4">
              {error || 'The meal you requested could not be found.'}
            </p>
            <div className="space-x-3">
              <button
                onClick={() => refetch()}
                className="btn btn-primary"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate(-1)}
                className="btn btn-outline"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    )
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
            {meal.name.charAt(0)}
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
            disabled={isTogglingFavorite}
            className="w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors disabled:opacity-50"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''} ${isTogglingFavorite ? 'animate-pulse' : ''}`} />
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
          <h1 className="text-2xl font-bold mb-2">{meal.name}</h1>
          <p className="text-muted-foreground mb-4">{meal.description}</p>
          
          {/* Meta info */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-primary" />
              <span>{meal.cookingTime || meal.prep_time || 'N/A'} min</span>
            </div>
            <div className="flex items-center space-x-1">
              <ChefHat className="w-4 h-4 text-primary" />
              <span className="capitalize">{meal.difficulty || meal.difficulty_level || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-primary" />
              <span>2-3 servings</span>
            </div>
          </div>

          {/* Tags */}
          {meal.tags && meal.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {meal.tags.map((tag) => (
                <span
                  key={typeof tag === 'string' ? tag : tag.name}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                >
                  {typeof tag === 'string' ? tag : tag.name}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="p-4 flex space-x-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button className="flex-1 btn btn-primary btn-md">
            <Play className="w-4 h-4 mr-2" />
            Start Cooking
          </button>
          <button className="btn btn-outline btn-md">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to List
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
              onClick={() => setActiveTab('ingredients')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'ingredients' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Ingredients
            </button>
            <button
              onClick={() => setActiveTab('instructions')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'instructions' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Instructions
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
          {activeTab === 'ingredients' ? (
            <div className="space-y-3">
              {meal.ingredients?.map((ingredient, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-card rounded-lg border"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  <span className="text-sm">{ingredient}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {meal.instructions?.map((instruction, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-4 p-4 bg-card rounded-lg border"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-relaxed">{instruction}</p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}