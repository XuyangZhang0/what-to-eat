import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  Star, 
  MapPin, 
  Phone,
  Globe,
  DollarSign,
  CheckSquare,
  Square,
  Utensils
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { Restaurant } from '@/types'
import { restaurantsApi } from '@/services/api'
import SearchInput from '@/components/SearchInput'
import ConfirmDialog from '@/components/ConfirmDialog'

interface RestaurantListProps {
  onEdit: (restaurant: Restaurant) => void;
  onAdd: () => void;
  showBulkActions?: boolean;
  enableSearch?: boolean;
  enableFilters?: boolean;
}

interface FilterState {
  cuisine?: string;
  priceRange?: '$' | '$$' | '$$$' | '$$$$';
  minRating?: number;
  isFavorite?: boolean;
}

export default function RestaurantList({
  onEdit,
  onAdd,
  showBulkActions = true,
  enableSearch = true,
  enableFilters = true,
}: RestaurantListProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([])
  const [cuisineOptions, setCuisineOptions] = useState<string[]>([])
  const [priceRanges, setPriceRanges] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>({})
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRestaurants, setSelectedRestaurants] = useState<Set<string>>(new Set())
  const [expandedRestaurant, setExpandedRestaurant] = useState<string | null>(null)

  // Confirmation dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingRestaurant, setDeletingRestaurant] = useState<Restaurant | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const PRICE_RANGES = [
    { value: '$', label: '$', description: 'Budget-friendly' },
    { value: '$$', label: '$$', description: 'Moderate' },
    { value: '$$$', label: '$$$', description: 'Expensive' },
    { value: '$$$$', label: '$$$$', description: 'Very Expensive' },
  ] as const

  // Load data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [restaurantsData, cuisines, prices] = await Promise.all([
        restaurantsApi.getRestaurants(),
        restaurantsApi.getCuisineTypes(),
        restaurantsApi.getPriceRanges(),
      ])
      setRestaurants(restaurantsData)
      setFilteredRestaurants(restaurantsData)
      setCuisineOptions(cuisines)
      setPriceRanges(prices)
    } catch (error) {
      console.error('Error loading restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and search restaurants
  useEffect(() => {
    let filtered = restaurants

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.description?.toLowerCase().includes(query) ||
        restaurant.cuisine.toLowerCase().includes(query) ||
        restaurant.address?.toLowerCase().includes(query)
      )
    }

    // Apply filters
    if (filters.cuisine) {
      filtered = filtered.filter(restaurant => restaurant.cuisine === filters.cuisine)
    }
    if (filters.priceRange) {
      filtered = filtered.filter(restaurant => restaurant.priceRange === filters.priceRange)
    }
    if (filters.minRating) {
      filtered = filtered.filter(restaurant => 
        restaurant.rating && restaurant.rating >= filters.minRating!
      )
    }
    if (filters.isFavorite !== undefined) {
      filtered = filtered.filter(restaurant => restaurant.isFavorite === filters.isFavorite)
    }

    setFilteredRestaurants(filtered)
  }, [restaurants, searchQuery, filters])

  const handleDeleteRestaurant = async (restaurant: Restaurant) => {
    setDeletingRestaurant(restaurant)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!deletingRestaurant) return

    try {
      setIsDeleting(true)
      await restaurantsApi.deleteRestaurant(deletingRestaurant.id)
      setRestaurants(prev => prev.filter(r => r.id !== deletingRestaurant.id))
      setSelectedRestaurants(prev => {
        const next = new Set(prev)
        next.delete(deletingRestaurant.id)
        return next
      })
    } catch (error) {
      console.error('Error deleting restaurant:', error)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setDeletingRestaurant(null)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedRestaurants.size === 0) return

    try {
      const ids = Array.from(selectedRestaurants)
      await restaurantsApi.bulkDeleteRestaurants(ids)
      setRestaurants(prev => prev.filter(r => !selectedRestaurants.has(r.id)))
      setSelectedRestaurants(new Set())
    } catch (error) {
      console.error('Error bulk deleting restaurants:', error)
    }
  }

  const toggleRestaurantSelection = (restaurantId: string) => {
    setSelectedRestaurants(prev => {
      const next = new Set(prev)
      if (next.has(restaurantId)) {
        next.delete(restaurantId)
      } else {
        next.add(restaurantId)
      }
      return next
    })
  }

  const selectAllRestaurants = () => {
    if (selectedRestaurants.size === filteredRestaurants.length) {
      setSelectedRestaurants(new Set())
    } else {
      setSelectedRestaurants(new Set(filteredRestaurants.map(r => r.id)))
    }
  }

  const formatRating = (rating: number) => {
    return rating.toFixed(1)
  }

  const renderPriceRange = (priceRange: string) => {
    return (
      <span className="flex items-center text-green-600 dark:text-green-400">
        {Array.from({ length: 4 }).map((_, i) => (
          <DollarSign 
            key={i} 
            className={cn(
              'w-3 h-3',
              i < priceRange.length ? 'opacity-100' : 'opacity-30'
            )} 
          />
        ))}
      </span>
    )
  }

  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(v => v !== undefined && v !== '').length
  }, [filters])

  const isAllSelected = selectedRestaurants.size > 0 && selectedRestaurants.size === filteredRestaurants.length

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Restaurants</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} 
            {restaurants.length !== filteredRestaurants.length && ` (filtered from ${restaurants.length})`}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {showBulkActions && selectedRestaurants.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedRestaurants.size} selected
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
            Add Restaurant
          </button>
        </div>
      </div>

      {/* Search */}
      {enableSearch && (
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search restaurants, cuisine, location..."
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

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price Range
                </label>
                <select
                  value={filters.priceRange || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value as any || undefined }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All Prices</option>
                  {PRICE_RANGES.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label} - {range.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Min Rating
                </label>
                <select
                  value={filters.minRating || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, minRating: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="1">1+ Stars</option>
                </select>
              </div>

              {/* Favorites Only */}
              <div className="flex items-center justify-center">
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

            {/* Filter Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setFilters({})}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Clear All
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Selection Controls */}
      {showBulkActions && filteredRestaurants.length > 0 && (
        <div className="flex items-center gap-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={selectAllRestaurants}
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

      {/* Restaurants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredRestaurants.map((restaurant) => (
            <motion.div
              key={restaurant.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700',
                'hover:shadow-md transition-shadow duration-200',
                selectedRestaurants.has(restaurant.id) && 'ring-2 ring-primary-500'
              )}
            >
              {/* Card Header */}
              <div className="p-4 pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {showBulkActions && (
                        <button
                          onClick={() => toggleRestaurantSelection(restaurant.id)}
                          className="text-gray-400 hover:text-primary-500"
                        >
                          {selectedRestaurants.has(restaurant.id) ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {restaurant.name}
                      </h3>
                      {restaurant.isFavorite && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-xs">
                        {restaurant.cuisine}
                      </span>
                      {restaurant.rating && (
                        <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                          <Star className="w-3 h-3 fill-current" />
                          {formatRating(restaurant.rating)}
                        </span>
                      )}
                      {restaurant.priceRange && renderPriceRange(restaurant.priceRange)}
                    </div>
                  </div>

                  {/* Actions Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setExpandedRestaurant(expandedRestaurant === restaurant.id ? null : restaurant.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    
                    <AnimatePresence>
                      {expandedRestaurant === restaurant.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 top-8 mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10"
                        >
                          <button
                            onClick={() => {
                              onEdit(restaurant)
                              setExpandedRestaurant(null)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                          >
                            <Edit3 className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteRestaurant(restaurant)
                              setExpandedRestaurant(null)
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
                {restaurant.description && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {restaurant.description}
                  </p>
                )}

                {/* Contact Information */}
                <div className="mt-3 space-y-1">
                  {restaurant.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{restaurant.address}</span>
                    </div>
                  )}
                  {restaurant.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span>{restaurant.phone}</span>
                    </div>
                  )}
                  {restaurant.website && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                      <Globe className="w-3 h-3 flex-shrink-0" />
                      <a 
                        href={restaurant.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 dark:text-primary-400 hover:underline truncate"
                      >
                        Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredRestaurants.length === 0 && !loading && (
        <div className="text-center py-12">
          <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchQuery || activeFiltersCount > 0 ? 'No restaurants found' : 'No restaurants yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery || activeFiltersCount > 0
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first restaurant'
            }
          </p>
          {(!searchQuery && activeFiltersCount === 0) && (
            <button
              onClick={onAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              <Plus className="w-4 h-4" />
              Add Your First Restaurant
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Restaurant"
        message={`Are you sure you want to delete "${deletingRestaurant?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false)
          setDeletingRestaurant(null)
        }}
        isLoading={isDeleting}
      />
    </div>
  )
}