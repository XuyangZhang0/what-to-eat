import { motion } from 'framer-motion'
import { 
  Plus, 
  Shuffle, 
  Search, 
  History,
  Heart,
  MapPin,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/utils/cn'

interface QuickAction {
  id: string
  label: string
  description: string
  icon: React.ElementType
  color: string
  onClick: () => void
}

interface QuickActionsProps {
  onAddMeal: () => void
  onAddRestaurant: () => void
  onRandomSuggestion: () => void
  onViewFavorites: () => void
  onViewHistory: () => void
  onSearch: () => void
  className?: string
}

export default function QuickActions({
  onAddMeal,
  onAddRestaurant,
  onRandomSuggestion,
  onViewFavorites,
  onViewHistory,
  onSearch,
  className
}: QuickActionsProps) {
  const quickActions: QuickAction[] = [
    {
      id: 'add-meal',
      label: 'Add Meal',
      description: 'Create a new meal recipe',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: onAddMeal
    },
    {
      id: 'add-restaurant',
      label: 'Add Restaurant',
      description: 'Save a new restaurant',
      icon: MapPin,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: onAddRestaurant
    },
    {
      id: 'random-suggestion',
      label: 'Random Pick',
      description: 'Get a random suggestion',
      icon: Shuffle,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: onRandomSuggestion
    },
    {
      id: 'view-favorites',
      label: 'Favorites',
      description: 'View your favorite items',
      icon: Heart,
      color: 'bg-red-500 hover:bg-red-600',
      onClick: onViewFavorites
    },
    {
      id: 'search',
      label: 'Search',
      description: 'Search meals & restaurants',
      icon: Search,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      onClick: onSearch
    },
    {
      id: 'view-history',
      label: 'History',
      description: 'View recent selections',
      icon: History,
      color: 'bg-gray-500 hover:bg-gray-600',
      onClick: onViewHistory
    }
  ]

  return (
    <div className={cn('', className)}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Quick Actions
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Common tasks at your fingertips
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon
          
          return (
            <motion.button
              key={action.id}
              onClick={action.onClick}
              className={cn(
                'p-4 rounded-xl text-white transition-all duration-200 group',
                'hover:scale-105 hover:shadow-lg active:scale-95',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900',
                action.color
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium text-sm">
                    {action.label}
                  </div>
                  <div className="text-xs opacity-90 hidden sm:block">
                    {action.description}
                  </div>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Additional Quick Stats */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <TrendingUp className="w-4 h-4" />
            <span>This Week</span>
          </div>
          <div className="flex items-center gap-4 text-gray-900 dark:text-white">
            <div className="text-center">
              <div className="font-semibold">5</div>
              <div className="text-xs text-gray-500">New Meals</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">3</div>
              <div className="text-xs text-gray-500">Restaurants</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">12</div>
              <div className="text-xs text-gray-500">Selections</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}