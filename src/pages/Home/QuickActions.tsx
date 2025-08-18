import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Coffee, Sandwich, UtensilsCrossed, Cookie, Dices } from 'lucide-react'

const quickActions = [
  { id: 'breakfast', icon: Coffee, label: 'Breakfast', category: 'breakfast', type: 'search' },
  { id: 'lunch', icon: Sandwich, label: 'Lunch', category: 'lunch', type: 'search' },
  { id: 'dinner', icon: UtensilsCrossed, label: 'Dinner', category: 'dinner', type: 'search' },
  { id: 'slot-machine', icon: Dices, label: 'Slot Machine', category: '', type: 'route' },
]

export default function QuickActions() {
  const navigate = useNavigate()

  const handleQuickAction = (action: { id: string; category: string; type: string }) => {
    if (action.type === 'route') {
      navigate(`/${action.id}`)
    } else {
      navigate(`/search?category=${action.category}`)
    }
  }

  return (
    <motion.div
      className="px-6 py-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon
          return (
            <motion.button
              key={action.id}
              onClick={() => handleQuickAction(action)}
              className="flex flex-col items-center p-3 bg-card rounded-lg border hover:bg-muted/50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Icon className="w-6 h-6 text-primary mb-2" />
              <span className="text-xs font-medium text-center">{action.label}</span>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}