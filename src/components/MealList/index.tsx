import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  Star, 
  Clock, 
  ChefHat,
  CheckSquare,
  Square,
  Download,
  Upload
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { Meal, MealCategory, SearchFilter } from '@/types'
import { mealsApi, tagsApi } from '@/services/api'
import { Tag } from '@/types/api'
import SearchInput from '@/components/SearchInput'
import ConfirmDialog from '@/components/ConfirmDialog'

interface MealListProps {
  onEdit: (meal: Meal) => void;
  onAdd: () => void;
  showBulkActions?: boolean;
  enableSearch?: boolean;
  enableFilters?: boolean;
}

interface FilterState {
  category?: MealCategory;
  cuisine?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  maxCookingTime?: number;
  tags?: string[];
  isFavorite?: boolean;
}

export default function MealList({
  onEdit,
  onAdd,
  showBulkActions = true,
  enableSearch = true,
  enableFilters = true,
}: MealListProps) {
  const [meals, setMeals] = useState<Meal[]>([])
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [cuisineOptions, setCuisineOptions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>({})
  const [showFilters, setShowFilters] = useState(false)
  const [selectedMeals, setSelectedMeals] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState<'delete' | null>(null)
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null)

  // Confirmation dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingMeal, setDeletingMeal] = useState<Meal | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const MEAL_CATEGORIES: { value: MealCategory; label: string }[] = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'drink', label: 'Drink' },
  ]

  const DIFFICULTY_LEVELS = [
    { value: 'easy', label: 'Easy', color: 'text-green-600 dark:text-green-400' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600 dark:text-yellow-400' },
    { value: 'hard', label: 'Hard', color: 'text-red-600 dark:text-red-400' },
  ] as const

  // Load data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [mealsData, tagsData, cuisines] = await Promise.all([
        mealsApi.getMeals(),
        tagsApi.getTags(),
        mealsApi.getCuisineTypes(),
      ])
      setMeals(mealsData)
      setFilteredMeals(mealsData)
      setTags(tagsData)
      setCuisineOptions(cuisines)
    } catch (error) {
      console.error('Error loading meals:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and search meals
  useEffect(() => {
    let filtered = meals

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(meal =>
        meal.name.toLowerCase().includes(query) ||
        meal.description?.toLowerCase().includes(query) ||
        meal.cuisine?.toLowerCase().includes(query) ||
        meal.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Apply filters
    if (filters.category) {
      filtered = filtered.filter(meal => meal.category === filters.category)
    }
    if (filters.cuisine) {
      filtered = filtered.filter(meal => meal.cuisine === filters.cuisine)
    }
    if (filters.difficulty) {
      filtered = filtered.filter(meal => meal.difficulty === filters.difficulty)
    }
    if (filters.maxCookingTime) {
      filtered = filtered.filter(meal => 
        meal.cookingTime && meal.cookingTime <= filters.maxCookingTime!
      )
    }
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(meal =>
        meal.tags?.some(tag => filters.tags!.includes(tag))
      )
    }
    if (filters.isFavorite !== undefined) {
      filtered = filtered.filter(meal => meal.isFavorite === filters.isFavorite)
    }

    setFilteredMeals(filtered)
  }, [meals, searchQuery, filters])

  const handleDeleteMeal = async (meal: Meal) => {
    setDeletingMeal(meal)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!deletingMeal) return

    try {
      setIsDeleting(true)
      await mealsApi.deleteMeal(deletingMeal.id)
      setMeals(prev => prev.filter(m => m.id !== deletingMeal.id))
      setSelectedMeals(prev => {
        const next = new Set(prev)
        next.delete(deletingMeal.id)
        return next
      })
    } catch (error) {
      console.error('Error deleting meal:', error)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setDeletingMeal(null)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedMeals.size === 0) return

    try {
      const ids = Array.from(selectedMeals)
      await mealsApi.bulkDeleteMeals(ids)
      setMeals(prev => prev.filter(m => !selectedMeals.has(m.id)))
      setSelectedMeals(new Set())
    } catch (error) {
      console.error('Error bulk deleting meals:', error)
    }
  }

  const toggleMealSelection = (mealId: string) => {
    setSelectedMeals(prev => {
      const next = new Set(prev)
      if (next.has(mealId)) {
        next.delete(mealId)
      } else {
        next.add(mealId)
      }
      return next
    })
  }

  const selectAllMeals = () => {
    if (selectedMeals.size === filteredMeals.length) {
      setSelectedMeals(new Set())
    } else {
      setSelectedMeals(new Set(filteredMeals.map(m => m.id)))
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    return DIFFICULTY_LEVELS.find(d => d.value === difficulty)?.color || 'text-gray-600 dark:text-gray-400'
  }

  const formatCookingTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(v => v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0)).length
  }, [filters])

  const isAllSelected = selectedMeals.size > 0 && selectedMeals.size === filteredMeals.length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meals</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {filteredMeals.length} meal{filteredMeals.length !== 1 ? 's' : ''} 
            {meals.length !== filteredMeals.length && ` (filtered from ${meals.length})`}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {showBulkActions && selectedMeals.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedMeals.size} selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1 px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
          
          {enableFilters && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
                showFilters || activeFiltersCount > 0
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
              )}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-primary-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          )}
          
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            <Plus className="w-4 h-4" />
            Add Meal
          </button>
        </div>
      </div>

      {/* Search */}
      {enableSearch && (
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search meals, cuisine, tags..."
        />
      )}

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as MealCategory || undefined }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All Categories</option>
                  {MEAL_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Cuisine Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cuisine
                </label>
                <select
                  value={filters.cuisine || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, cuisine: e.target.value || undefined }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All Cuisines</option>
                  {cuisineOptions.map(cuisine => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty
                </label>
                <select
                  value={filters.difficulty || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value as any || undefined }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All Levels</option>
                  {DIFFICULTY_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              {/* Max Cooking Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Time (min)
                </label>
                <input
                  type="number"
                  value={filters.maxCookingTime || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxCookingTime: e.target.value ? parseInt(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="60"
                />
              </div>
            </div>

            {/* Tags Filter */}
            {tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          tags: prev.tags?.includes(tag.name)
                            ? prev.tags.filter(t => t !== tag.name)
                            : [...(prev.tags || []), tag.name]
                        }))
                      }}
                      className={cn(
                        'px-3 py-1 rounded-full text-sm font-medium border transition-colors',
                        filters.tags?.includes(tag.name)
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                          : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                      )}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filter Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setFilters({})}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Clear All
              </button>
              <div className="flex items-center gap-4 ml-auto">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.isFavorite === true}
                    onChange={(e) => setFilters(prev => ({ ...prev, isFavorite: e.target.checked || undefined }))}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Favorites only</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Selection Controls */}
      {showBulkActions && filteredMeals.length > 0 && (
        <div className="flex items-center gap-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={selectAllMeals}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            {isAllSelected ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      )}

      {/* Meals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredMeals.map((meal) => (
            <motion.div
              key={meal.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700',
                'hover:shadow-md transition-shadow duration-200',
                selectedMeals.has(meal.id) && 'ring-2 ring-primary-500'
              )}
            >
              {/* Card Header */}
              <div className="p-4 pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {showBulkActions && (
                        <button
                          onClick={() => toggleMealSelection(meal.id)}
                          className="text-gray-400 hover:text-primary-500"
                        >
                          {selectedMeals.has(meal.id) ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {meal.name}
                      </h3>
                      {meal.isFavorite && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <span className="capitalize bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-xs">
                        {meal.category}
                      </span>
                      {meal.difficulty && (
                        <span className={cn('flex items-center gap-1', getDifficultyColor(meal.difficulty))}>
                          <ChefHat className="w-3 h-3" />
                          {meal.difficulty}
                        </span>
                      )}
                      {meal.cookingTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatCookingTime(meal.cookingTime)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    
                    <AnimatePresence>
                      {expandedMeal === meal.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 top-8 mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10"
                        >
                          <button
                            onClick={() => {
                              onEdit(meal)
                              setExpandedMeal(null)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                          >
                            <Edit3 className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteMeal(meal)
                              setExpandedMeal(null)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Description */}
                {meal.description && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {meal.description}
                  </p>
                )}

                {/* Cuisine */}
                {meal.cuisine && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                    {meal.cuisine} cuisine
                  </p>
                )}

                {/* Tags */}
                {meal.tags && meal.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {meal.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                    {meal.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-md">
                        +{meal.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredMeals.length === 0 && !loading && (
        <div className="text-center py-12">
          <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchQuery || activeFiltersCount > 0 ? 'No meals found' : 'No meals yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery || activeFiltersCount > 0
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first meal'
            }
          </p>
          {(!searchQuery && activeFiltersCount === 0) && (
            <button
              onClick={onAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              <Plus className="w-4 h-4" />
              Add Your First Meal
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Meal"
        message={`Are you sure you want to delete "${deletingMeal?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false)
          setDeletingMeal(null)
        }}
        isLoading={isDeleting}
      />
    </div>
  )
}