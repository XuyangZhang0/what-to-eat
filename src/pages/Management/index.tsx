import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  ChefHat, 
  Utensils, 
  Tag, 
  ArrowLeft, 
  Settings,
  Download,
  Upload,
  FileText,
  Home
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { Meal, Restaurant } from '@/types'
import { CreateMealData, UpdateMealData, CreateRestaurantData, UpdateRestaurantData } from '@/types/api'
import { mealsApi, restaurantsApi } from '@/services/api'
import { exportData, importData, downloadReport } from '@/utils/dataManagement'
import MealForm from '@/components/MealForm'
import RestaurantForm from '@/components/RestaurantForm'
import MealList from '@/components/MealList'
import RestaurantList from '@/components/RestaurantList'
import TagManager from '@/components/TagManager'

type ManagementView = 'overview' | 'meals' | 'restaurants' | 'tags' | 'meal-form' | 'restaurant-form'

interface FormState {
  view: ManagementView;
  editingItem?: Meal | Restaurant;
}

export default function Management() {
  const navigate = useNavigate()
  const [currentView, setCurrentView] = useState<ManagementView>('overview')
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [dataOperation, setDataOperation] = useState<'export' | 'import' | 'report' | null>(null)

  const handleSaveMeal = async (data: CreateMealData | UpdateMealData) => {
    try {
      setIsLoading(true)
      if (editingMeal) {
        await mealsApi.updateMeal(editingMeal.id, data as UpdateMealData)
      } else {
        await mealsApi.createMeal(data as CreateMealData)
      }
      setCurrentView('meals')
      setEditingMeal(null)
    } catch (error) {
      console.error('Error saving meal:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveRestaurant = async (data: CreateRestaurantData | UpdateRestaurantData) => {
    try {
      setIsLoading(true)
      if (editingRestaurant) {
        await restaurantsApi.updateRestaurant(editingRestaurant.id, data as UpdateRestaurantData)
      } else {
        await restaurantsApi.createRestaurant(data as CreateRestaurantData)
      }
      setCurrentView('restaurants')
      setEditingRestaurant(null)
    } catch (error) {
      console.error('Error saving restaurant:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal)
    setCurrentView('meal-form')
  }

  const handleEditRestaurant = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant)
    setCurrentView('restaurant-form')
  }

  const handleBack = () => {
    if (currentView === 'meal-form' || currentView === 'restaurant-form') {
      setEditingMeal(null)
      setEditingRestaurant(null)
    }
    setCurrentView('overview')
  }

  const handleExportData = async () => {
    try {
      setDataOperation('export')
      await exportData()
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export data. Please try again.')
    } finally {
      setDataOperation(null)
    }
  }

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setDataOperation('import')
      const result = await importData(file)
      alert(`Import completed!\nMeals: ${result.importedMeals}\nRestaurants: ${result.importedRestaurants}\nTags: ${result.importedTags}\nErrors: ${result.errors.length}`)
    } catch (error) {
      console.error('Import failed:', error)
      alert('Failed to import data. Please check the file format.')
    } finally {
      setDataOperation(null)
      // Clear the file input
      event.target.value = ''
    }
  }

  const handleGenerateReport = async () => {
    try {
      setDataOperation('report')
      await downloadReport()
    } catch (error) {
      console.error('Report generation failed:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setDataOperation(null)
    }
  }

  const navigationItems = [
    {
      id: 'meals' as const,
      title: 'Manage Meals',
      description: 'Add, edit, and organize your meal collection',
      icon: ChefHat,
      color: 'bg-blue-500 hover:bg-blue-600',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 'restaurants' as const,
      title: 'Manage Restaurants',
      description: 'Add, edit, and organize your restaurant collection',
      icon: Utensils,
      color: 'bg-green-500 hover:bg-green-600',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      id: 'tags' as const,
      title: 'Manage Tags',
      description: 'Create and organize tags for better categorization',
      icon: Tag,
      color: 'bg-purple-500 hover:bg-purple-600',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
  ]

  const renderCurrentView = () => {
    switch (currentView) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center relative">
              {/* Home Button - Responsive positioning */}
              <button
                onClick={() => navigate('/')}
                className="absolute left-0 top-0 flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-all text-sm sm:text-base"
              >
                <Home className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Home</span>
              </button>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Management Center
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Manage your meals, restaurants, and tags. Keep your collection organized 
                and up-to-date with powerful management tools.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {navigationItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className="group p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn('p-3 rounded-lg', item.iconBg)}>
                      <item.icon className={cn('w-6 h-6', item.iconColor)} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Additional Actions */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Data Management
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button className="flex items-center gap-3 p-4 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">Export Data</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Backup your collection</div>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 p-4 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    <Upload className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">Import Data</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Restore or import</div>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 p-4 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">Generate Report</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Usage statistics</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'meals':
        return (
          <MealList
            onEdit={handleEditMeal}
            onAdd={() => {
              setEditingMeal(null)
              setCurrentView('meal-form')
            }}
          />
        )

      case 'restaurants':
        return (
          <RestaurantList
            onEdit={handleEditRestaurant}
            onAdd={() => {
              setEditingRestaurant(null)
              setCurrentView('restaurant-form')
            }}
          />
        )

      case 'tags':
        return (
          <TagManager onClose={() => setCurrentView('overview')} />
        )

      case 'meal-form':
        return (
          <MealForm
            meal={editingMeal || undefined}
            onSave={handleSaveMeal}
            onCancel={() => {
              setEditingMeal(null)
              setCurrentView('meals')
            }}
            isLoading={isLoading}
          />
        )

      case 'restaurant-form':
        return (
          <RestaurantForm
            restaurant={editingRestaurant || undefined}
            onSave={handleSaveRestaurant}
            onCancel={() => {
              setEditingRestaurant(null)
              setCurrentView('restaurants')
            }}
            isLoading={isLoading}
          />
        )

      default:
        return null
    }
  }

  const getPageTitle = () => {
    switch (currentView) {
      case 'overview':
        return 'Management Center'
      case 'meals':
        return 'Meal Management'
      case 'restaurants':
        return 'Restaurant Management'
      case 'tags':
        return 'Tag Management'
      case 'meal-form':
        return editingMeal ? 'Edit Meal' : 'Add New Meal'
      case 'restaurant-form':
        return editingRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'
      default:
        return 'Management'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Header */}
        <AnimatePresence mode="wait">
          {currentView !== 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center gap-4 mb-8"
            >
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {getPageTitle()}
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}