import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Check } from 'lucide-react'
import { mealsApi } from '@/services/api'
import type { Meal } from '@/types'

interface ShoppingItem {
  id: string
  ingredient: string
  mealName: string
  checked: boolean
}

export default function SmartShoppingList() {
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadShoppingItems()
  }, [])

  const loadShoppingItems = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Get user's recent meals (last 10 meals) to generate shopping list
      const response = await mealsApi.getMeals({ 
        page: 1, 
        limit: 10, 
        sort_by: 'created_at', 
        sort_order: 'desc' 
      })
      
      const meals = response.data
      const items: ShoppingItem[] = []
      const seenIngredients = new Set<string>()
      
      // Extract ingredients from recent meals
      meals.forEach((meal: Meal) => {
        if (meal.ingredients && meal.ingredients.length > 0) {
          meal.ingredients.forEach((ingredient: string) => {
            // Clean ingredient string (remove quantities for uniqueness check)
            const cleanIngredient = ingredient.toLowerCase().replace(/^\d+\s*(g|ml|tbsp|tsp|cup|cups|oz|lb|kg|pack|packs|small|large|medium)\s*/gi, '').trim()
            
            if (!seenIngredients.has(cleanIngredient) && ingredient.length > 0) {
              seenIngredients.add(cleanIngredient)
              items.push({
                id: `${meal.id}-${ingredient}`,
                ingredient: ingredient,
                mealName: meal.name,
                checked: false
              })
            }
          })
        }
      })
      
      // Limit to 8 items for display
      setShoppingItems(items.slice(0, 8))
    } catch (err) {
      console.error('Failed to load shopping items:', err)
      setError('Failed to load shopping list')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleItem = (itemId: string) => {
    setShoppingItems(items => 
      items.map(item => 
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    )
  }

  if (isLoading) {
    return (
      <motion.div
        className="px-6 py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center space-x-2 mb-4">
          <ShoppingCart className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Smart Shopping List</h2>
        </div>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-muted rounded-lg"></div>
          ))}
        </div>
      </motion.div>
    )
  }

  if (error || shoppingItems.length === 0) {
    return (
      <motion.div
        className="px-6 py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center space-x-2 mb-4">
          <ShoppingCart className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Smart Shopping List</h2>
        </div>
        <div className="text-center py-4 text-muted-foreground">
          <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            {error ? error : "No ingredients found. Create some meals to see your shopping list!"}
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="px-6 py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Smart Shopping List</h2>
        </div>
        <span className="text-sm text-muted-foreground">
          {shoppingItems.filter(item => !item.checked).length} items
        </span>
      </div>
      
      <div className="space-y-2">
        {shoppingItems.map((item, index) => (
          <motion.button
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`w-full flex items-center space-x-3 p-3 bg-card rounded-lg border hover:bg-muted/50 transition-all text-left ${
              item.checked ? 'opacity-60' : ''
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * index }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {/* Checkbox */}
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              item.checked 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'border-muted-foreground/30 hover:border-primary'
            }`}>
              {item.checked && <Check className="w-3 h-3" />}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={`font-medium truncate ${item.checked ? 'line-through' : ''}`}>
                {item.ingredient}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                For {item.mealName}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
      
      {shoppingItems.length >= 8 && (
        <motion.div 
          className="text-center mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button className="text-sm text-primary hover:underline">
            View full shopping list
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}