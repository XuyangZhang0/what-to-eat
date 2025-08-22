import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search as SearchIcon, Filter, X } from 'lucide-react'
import SearchFilters from './SearchFilters'
import SearchResults from './SearchResults'
import { SearchFilter, SearchMode, Meal, Restaurant } from '@/types'
import { search, getRandomSuggestion, mealsApi, restaurantsApi } from '@/services/api'
import { useToast } from '@/hooks/useToast'

export default function Search() {
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<SearchMode>('meals')
  const [filters, setFilters] = useState<SearchFilter>({})
  const [showFilters, setShowFilters] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<(Meal | Restaurant)[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  // Load discovered items automatically on page load
  const loadDiscoveredItems = useCallback(async () => {
    setIsSearching(true)
    setHasSearched(true)
    
    try {
      let discoveredResults: (Meal | Restaurant)[]
      
      if (mode === 'meals') {
        discoveredResults = await mealsApi.discoverMeals(filters)
      } else {
        discoveredResults = await restaurantsApi.discoverRestaurants(filters)
      }
      
      setResults(discoveredResults)
      
      if (discoveredResults.length === 0) {
        toast({
          type: 'warning',
          message: `No ${mode} found. Try adjusting your filters.`,
          duration: 3000
        })
      }
    } catch (error) {
      console.error('Failed to load discovered items:', error)
      toast({
        type: 'error',
        message: 'Failed to load items. Please try again.',
        duration: 4000
      })
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [mode, filters, toast])

  const handleRandomSearch = useCallback(async () => {
    setIsSearching(true)
    setHasSearched(true)
    
    try {
      const randomResult = await getRandomSuggestion(mode, filters)
      setResults([randomResult])
      
      toast({
        type: 'success',
        message: `Found a random ${mode.slice(0, -1)} for you!`,
        duration: 3000
      })
    } catch (error) {
      console.error('Random search failed:', error)
      toast({
        type: 'error',
        message: 'Could not find a random suggestion. Please try again.',
        duration: 4000
      })
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [mode, filters, toast])

  useEffect(() => {
    // Handle URL parameters
    const category = searchParams.get('category')
    const random = searchParams.get('random')
    
    if (category) {
      setFilters(prev => ({ ...prev, category: category as any }))
      return
    }
    
    if (random) {
      handleRandomSearch()
      return
    }
    
    // Auto-load discovered items when page loads
    loadDiscoveredItems()
  }, [searchParams, mode, loadDiscoveredItems, handleRandomSearch])

  // Reload discovered items when filters change  
  useEffect(() => {
    if (hasSearched && !query.trim()) {
      loadDiscoveredItems()
    }
  }, [filters, hasSearched, query, loadDiscoveredItems])

  const handleSearch = async () => {
    if (!query.trim() && Object.keys(filters).length === 0) return
    
    setIsSearching(true)
    setHasSearched(true)
    
    try {
      let searchResults: (Meal | Restaurant)[]
      
      if (query.trim()) {
        // Text search
        searchResults = await search(query.trim(), mode, filters)
      } else {
        // Filter-only search - get all with filters
        if (mode === 'meals') {
          const { getMeals } = await import('@/services/api')
          searchResults = await getMeals(filters)
        } else {
          const { restaurantsApi } = await import('@/services/api')
          searchResults = await restaurantsApi.getRestaurants(filters)
        }
      }
      
      setResults(searchResults)
      
      if (searchResults.length === 0) {
        toast({
          type: 'warning',
          message: 'No results found. Try adjusting your search or filters.',
          duration: 3000
        })
      }
    } catch (error) {
      console.error('Search failed:', error)
      toast({
        type: 'error',
        message: 'Search failed. Please try again.',
        duration: 4000
      })
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }


  const handleFilterChange = (newFilters: SearchFilter) => {
    setFilters(newFilters)
    if (Object.keys(newFilters).length > 0) {
      handleSearch()
    }
  }

  const handleItemUpdate = (updatedItem: Meal | Restaurant) => {
    setResults(prevResults => 
      prevResults.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      )
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search Header */}
      <div className="px-4 py-4 space-y-4 border-b border-border">
        {/* Search Input */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for meals or restaurants..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-muted"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Mode Toggle and Filter Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center bg-muted rounded-lg p-1">
            <button
              onClick={() => setMode('meals')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'meals' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Meals
            </button>
            <button
              onClick={() => setMode('restaurants')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'restaurants' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Restaurants
            </button>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters || Object.keys(filters).length > 0
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background border-input hover:bg-muted'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
            {Object.keys(filters).length > 0 && (
              <span className="w-2 h-2 bg-accent-500 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="border-b border-border overflow-hidden"
        >
          <SearchFilters
            mode={mode}
            filters={filters}
            onChange={handleFilterChange}
            onClose={() => setShowFilters(false)}
          />
        </motion.div>
      )}

      {/* Search Results */}
      <div className="flex-1 overflow-hidden">
        <SearchResults
          query={query}
          mode={mode}
          filters={filters}
          isSearching={isSearching}
          items={results}
          hasSearched={hasSearched}
          onRandomSearch={handleRandomSearch}
          onItemUpdate={handleItemUpdate}
        />
      </div>
    </div>
  )
}