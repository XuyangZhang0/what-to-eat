import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Plus, Minus, Check, X, Download, Share2, Printer } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { favoritesApi } from '@/services/api'
import type { Meal } from '@/types'

interface ShoppingItem {
  id: string
  name: string
  category: string
  quantity: string
  unit: string
  checked: boolean
  fromMeals: string[]
}

interface SmartShoppingListProps {
  className?: string
}

export default function SmartShoppingList({ className = '' }: SmartShoppingListProps) {
  const [selectedMeals, setSelectedMeals] = useState<Meal[]>([])
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([])
  const [servingMultiplier, setServingMultiplier] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)

  // Fetch favorite meals
  const { data: meals = [], isLoading } = useQuery({
    queryKey: ['favorite-meals'],
    queryFn: () => favoritesApi.getFavoriteMeals(),
  })

  const categorizeIngredient = (ingredient: string): string => {
    const categories = {
      'Produce': ['onion', 'garlic', 'tomato', 'lettuce', 'carrot', 'celery', 'bell pepper', 'mushroom', 'potato', 'lemon', 'lime', 'parsley', 'basil', 'spinach', 'cucumber', 'avocado'],
      'Meat & Seafood': ['chicken', 'beef', 'pork', 'fish', 'salmon', 'shrimp', 'turkey', 'lamb', 'bacon', 'sausage'],
      'Dairy & Eggs': ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'egg', 'mozzarella', 'parmesan', 'cheddar'],
      'Pantry': ['flour', 'sugar', 'salt', 'pepper', 'oil', 'vinegar', 'pasta', 'rice', 'bread', 'oats'],
      'Spices & Seasonings': ['oregano', 'thyme', 'rosemary', 'cumin', 'paprika', 'chili', 'garlic powder', 'onion powder'],
      'Canned & Jarred': ['tomato sauce', 'broth', 'beans', 'corn', 'olive oil', 'coconut milk', 'tomato paste'],
      'Frozen': ['peas', 'corn', 'berries', 'ice cream'],
      'Beverages': ['wine', 'beer', 'juice', 'water'],
      'Other': []
    }

    const ingredientLower = ingredient.toLowerCase()
    
    for (const [category, items] of Object.entries(categories)) {
      if (items.some(item => ingredientLower.includes(item) || item.includes(ingredientLower))) {
        return category
      }
    }
    
    return 'Other'
  }

  const parseIngredient = (ingredient: string): { name: string; quantity: string; unit: string } => {
    // Simple ingredient parsing - in a real app, this would be more sophisticated
    const quantityMatch = ingredient.match(/^(\d+(?:\/\d+)?(?:\.\d+)?\s*(?:cups?|tbsp|tsp|oz|lbs?|g|kg|ml|l|cloves?|pieces?|slices?)?)\s+(.+)/i)
    
    if (quantityMatch) {
      const [, quantityPart, namePart] = quantityMatch
      const unitMatch = quantityPart.match(/(\d+(?:\/\d+)?(?:\.\d+)?)\s*(.*)/)
      
      if (unitMatch) {
        const [, quantity, unit] = unitMatch
        return {
          name: namePart.trim(),
          quantity: quantity.trim(),
          unit: unit.trim() || 'unit'
        }
      }
    }
    
    return {
      name: ingredient.trim(),
      quantity: '1',
      unit: 'unit'
    }
  }

  const generateShoppingList = useCallback(async () => {
    if (selectedMeals.length === 0) return

    setIsGenerating(true)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))

    const ingredientMap = new Map<string, ShoppingItem>()

    selectedMeals.forEach(meal => {
      if (meal.ingredients && Array.isArray(meal.ingredients)) {
        meal.ingredients.forEach(ingredient => {
          const parsed = parseIngredient(ingredient)
          const key = parsed.name.toLowerCase()
          
          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key)!
            // Simple quantity addition (in a real app, this would handle unit conversions)
            const existingQty = parseFloat(existing.quantity) || 1
            const newQty = parseFloat(parsed.quantity) || 1
            existing.quantity = (existingQty + (newQty * servingMultiplier)).toString()
            existing.fromMeals.push(meal.name)
          } else {
            const adjustedQuantity = (parseFloat(parsed.quantity) * servingMultiplier).toString()
            ingredientMap.set(key, {
              id: key,
              name: parsed.name,
              category: categorizeIngredient(parsed.name),
              quantity: adjustedQuantity,
              unit: parsed.unit,
              checked: false,
              fromMeals: [meal.name]
            })
          }
        })
      }
    })

    const newShoppingList = Array.from(ingredientMap.values())
      .sort((a, b) => {
        // Sort by category first, then by name
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category)
        }
        return a.name.localeCompare(b.name)
      })

    setShoppingList(newShoppingList)
    setIsGenerating(false)
  }, [selectedMeals, servingMultiplier])

  const toggleMealSelection = (meal: Meal) => {
    setSelectedMeals(prev => {
      const isSelected = prev.some(m => m.id === meal.id)
      if (isSelected) {
        return prev.filter(m => m.id !== meal.id)
      } else {
        return [...prev, meal]
      }
    })
  }

  const toggleItemCheck = (itemId: string) => {
    setShoppingList(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    )
  }

  const removeItem = (itemId: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== itemId))
  }

  const exportShoppingList = () => {
    const text = shoppingList
      .filter(item => !item.checked)
      .reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = []
        }
        acc[item.category].push(`• ${item.quantity} ${item.unit} ${item.name}`)
        return acc
      }, {} as Record<string, string[]>)

    const formatted = Object.entries(text)
      .map(([category, items]) => `${category}:\n${items.join('\n')}`)
      .join('\n\n')

    const element = document.createElement('a')
    const file = new Blob([`Shopping List\n\n${formatted}`], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = 'shopping-list.txt'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const shareShoppingList = async () => {
    const text = shoppingList
      .filter(item => !item.checked)
      .map(item => `${item.quantity} ${item.unit} ${item.name}`)
      .join('\n')

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Shopping List',
          text: `Shopping List:\n\n${text}`
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(`Shopping List:\n\n${text}`)
      alert('Shopping list copied to clipboard!')
    }
  }

  // Group shopping list by category
  const groupedList = shoppingList.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, ShoppingItem[]>)

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          🛒 Smart Shopping List
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select meals to automatically generate an organized shopping list
        </p>
      </div>

      {/* Meal Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Select Meals ({selectedMeals.length} selected)
          </h3>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Servings:</label>
            <button
              onClick={() => setServingMultiplier(Math.max(1, servingMultiplier - 1))}
              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-semibold">{servingMultiplier}</span>
            <button
              onClick={() => setServingMultiplier(servingMultiplier + 1)}
              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {meals.filter(meal => meal.ingredients && meal.ingredients.length > 0).map(meal => {
            const isSelected = selectedMeals.some(m => m.id === meal.id)
            return (
              <motion.button
                key={meal.id}
                onClick={() => toggleMealSelection(meal)}
                className={`p-3 rounded-lg text-left transition-all duration-200 ${
                  isSelected
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{meal.name}</h4>
                    <p className="text-sm opacity-75">
                      {meal.ingredients?.length || 0} ingredients
                    </p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-white bg-white' : 'border-gray-300'
                  }`}>
                    {isSelected && <Check className="w-4 h-4 text-purple-500" />}
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>

        {selectedMeals.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={generateShoppingList}
              disabled={isGenerating}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 font-medium flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              {isGenerating ? 'Generating...' : 'Generate Shopping List'}
            </button>
          </div>
        )}
      </div>

      {/* Shopping List */}
      <AnimatePresence>
        {shoppingList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Shopping List Header */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Shopping List
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {shoppingList.filter(item => !item.checked).length} items remaining
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={shareShoppingList}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={exportShoppingList}
                  className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Shopping List Items */}
            <div className="space-y-4">
              {Object.entries(groupedList).map(([category, items]) => (
                <div key={category} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{category}</h4>
                  </div>
                  <div className="p-2 space-y-1">
                    {items.map(item => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-2 rounded transition-all ${
                          item.checked ? 'opacity-50 bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <button
                          onClick={() => toggleItemCheck(item.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            item.checked 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-gray-300 hover:border-green-500'
                          }`}
                        >
                          {item.checked && <Check className="w-3 h-3" />}
                        </button>
                        
                        <div className="flex-1">
                          <span className={`font-medium ${item.checked ? 'line-through' : ''}`}>
                            {item.quantity} {item.unit} {item.name}
                          </span>
                          {item.fromMeals.length > 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              From: {item.fromMeals.join(', ')}
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* How it works */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
          🧠 Smart Shopping Features
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Automatically combines duplicate ingredients</li>
          <li>• Organizes items by grocery store sections</li>
          <li>• Adjusts quantities based on serving size</li>
          <li>• Tracks which meals need each ingredient</li>
          <li>• Export or share your list with others</li>
        </ul>
      </div>
    </div>
  )
}