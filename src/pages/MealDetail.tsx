import { useState } from 'react'
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
  Play
} from 'lucide-react'
import { Meal } from '@/types'

// Mock meal data - replace with actual API call
const mockMeal: Meal = {
  id: '1',
  name: 'Chicken Teriyaki Bowl',
  description: 'Tender chicken glazed with homemade teriyaki sauce over steamed rice with fresh vegetables',
  category: 'dinner',
  cuisine: 'Japanese',
  difficulty: 'easy',
  cookingTime: 25,
  tags: ['healthy', 'gluten-free', 'protein-rich'],
  image: '/images/chicken-teriyaki.jpg',
  isFavorite: false,
  ingredients: [
    '2 chicken breasts, sliced',
    '2 cups jasmine rice',
    '1/4 cup soy sauce',
    '2 tbsp mirin',
    '2 tbsp honey',
    '1 tbsp sesame oil',
    '2 cloves garlic, minced',
    '1 tsp ginger, grated',
    '1 broccoli crown',
    '1 carrot, julienned',
    'Green onions for garnish',
    'Sesame seeds'
  ],
  instructions: [
    'Cook jasmine rice according to package instructions',
    'In a bowl, mix soy sauce, mirin, honey, sesame oil, garlic, and ginger to make teriyaki sauce',
    'Heat a large pan over medium-high heat and cook chicken until golden brown',
    'Add teriyaki sauce to the chicken and simmer until glazed',
    'Steam broccoli and carrots until tender-crisp',
    'Serve chicken over rice with vegetables',
    'Garnish with green onions and sesame seeds'
  ]
}

export default function MealDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isFavorite, setIsFavorite] = useState(mockMeal.isFavorite)
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients')

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite)
    // TODO: Update favorite status in backend/storage
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: mockMeal.name,
        text: mockMeal.description,
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
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
            {mockMeal.name.charAt(0)}
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
          <h1 className="text-2xl font-bold mb-2">{mockMeal.name}</h1>
          <p className="text-muted-foreground mb-4">{mockMeal.description}</p>
          
          {/* Meta info */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-primary" />
              <span>{mockMeal.cookingTime} min</span>
            </div>
            <div className="flex items-center space-x-1">
              <ChefHat className="w-4 h-4 text-primary" />
              <span className="capitalize">{mockMeal.difficulty}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-primary" />
              <span>2-3 servings</span>
            </div>
          </div>

          {/* Tags */}
          {mockMeal.tags && mockMeal.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {mockMeal.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                >
                  {tag}
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
              {mockMeal.ingredients?.map((ingredient, index) => (
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
              {mockMeal.instructions?.map((instruction, index) => (
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