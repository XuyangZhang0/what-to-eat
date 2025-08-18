import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Clock, Star } from 'lucide-react'

// Mock data - replace with actual data from API/storage
const recentSuggestions = [
  {
    id: '1',
    name: 'Chicken Teriyaki',
    type: 'meal',
    image: '/images/chicken-teriyaki.jpg',
    category: 'dinner',
    cookingTime: 25,
    rating: 4.5,
  },
  {
    id: '2',
    name: 'Pizza Palace',
    type: 'restaurant',
    image: '/images/pizza-palace.jpg',
    cuisine: 'Italian',
    rating: 4.2,
  },
  {
    id: '3',
    name: 'Avocado Toast',
    type: 'meal',
    image: '/images/avocado-toast.jpg',
    category: 'breakfast',
    cookingTime: 10,
    rating: 4.7,
  },
]

export default function RecentSuggestions() {
  const navigate = useNavigate()

  if (recentSuggestions.length === 0) {
    return null
  }

  const handleSuggestionClick = (suggestion: typeof recentSuggestions[0]) => {
    if (suggestion.type === 'meal') {
      navigate(`/meal/${suggestion.id}`)
    } else {
      navigate(`/restaurant/${suggestion.id}`)
    }
  }

  return (
    <motion.div
      className="px-6 py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent Suggestions</h2>
        <button 
          onClick={() => navigate('/search?recent=true')}
          className="text-sm text-primary hover:underline"
        >
          View all
        </button>
      </div>
      
      <div className="space-y-3">
        {recentSuggestions.map((suggestion, index) => (
          <motion.button
            key={suggestion.id}
            onClick={() => handleSuggestionClick(suggestion)}
            className="w-full flex items-center space-x-3 p-3 bg-card rounded-lg border hover:bg-muted/50 transition-colors text-left"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Image placeholder */}
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-muted-foreground">
                {suggestion.name.charAt(0)}
              </span>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{suggestion.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                {suggestion.type === 'meal' ? (
                  <>
                    <Clock className="w-3 h-3" />
                    <span>{suggestion.cookingTime} min</span>
                    <span>•</span>
                    <span className="capitalize">{suggestion.category}</span>
                  </>
                ) : (
                  <span>{suggestion.cuisine}</span>
                )}
              </div>
            </div>
            
            {/* Rating */}
            <div className="flex items-center space-x-1 text-sm">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{suggestion.rating}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}