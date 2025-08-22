import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, MapPin, Star, Globe, Clock } from 'lucide-react'
import { cn } from '@/utils/cn'
import { WeeklyOpeningHours } from '@/types'
import { restaurantsApi } from '@/services/api'
import { useDebounce } from '@/hooks/useDebounce'

interface ExternalRestaurant {
  place_id: string
  name: string
  address?: string
  phone?: string
  rating?: number
  price_range?: '$' | '$$' | '$$$' | '$$$$'
  website?: string
  location?: { lat: number; lng: number }
  opening_hours?: WeeklyOpeningHours
  types?: string[]
  photos?: Array<{ photo_reference: string; width: number; height: number }>
  raw_opening_hours?: string[]
}

interface InternetRestaurantSearchProps {
  value: string
  onChange: (value: string) => void
  onSelect?: (restaurant: ExternalRestaurant) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  showSavedResults?: boolean // Show saved restaurants too
}

export default function InternetRestaurantSearch({
  value,
  onChange,
  onSelect,
  placeholder = "Search restaurants worldwide...",
  className,
  disabled = false,
  showSavedResults = true
}: InternetRestaurantSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [internetResults, setInternetResults] = useState<ExternalRestaurant[]>([])
  const [savedResults, setSavedResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Debounce the search query to avoid too many API calls
  const debouncedQuery = useDebounce(value, 500) // Longer debounce for internet search
  
  // Get user's location for better search results
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Location access denied or unavailable:', error)
        }
      )
    }
  }, [])
  
  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery || debouncedQuery.trim().length < 2) {
        console.log('InternetRestaurantSearch: Query too short or empty')
        setInternetResults([])
        setSavedResults([])
        setIsOpen(false)
        return
      }
      
      console.log('InternetRestaurantSearch: Fetching suggestions for:', debouncedQuery)
      setIsLoading(true)
      try {
        const promises = []
        
        // Search internet restaurants
        console.log('InternetRestaurantSearch: Searching internet restaurants with location:', userLocation)
        promises.push(
          restaurantsApi.searchExternalRestaurants(
            debouncedQuery.trim(), 
            userLocation || undefined,
            5000 // 5km radius
          )
        )
        
        // Also search saved restaurants if enabled
        if (showSavedResults) {
          console.log('InternetRestaurantSearch: Also searching saved restaurants')
          promises.push(
            restaurantsApi.getRestaurantSuggestions(debouncedQuery.trim(), 5)
          )
        }
        
        const results = await Promise.all(promises)
        console.log('InternetRestaurantSearch: Got results:', results)
        
        setInternetResults(results[0] || [])
        if (showSavedResults && results[1]) {
          setSavedResults(results[1])
        }
        
        const hasResults = (results[0]?.length > 0) || (showSavedResults && results[1]?.length > 0)
        console.log('InternetRestaurantSearch: Has results:', hasResults, 'Internet:', results[0]?.length, 'Saved:', results[1]?.length)
        setIsOpen(hasResults)
        setSelectedIndex(-1)
        
      } catch (error) {
        console.error('InternetRestaurantSearch: Error fetching restaurant suggestions:', error)
        setInternetResults([])
        setSavedResults([])
        setIsOpen(false)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSuggestions()
  }, [debouncedQuery, userLocation, showSavedResults])
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const allResults = [...internetResults, ...savedResults]
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < allResults.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < allResults.length) {
          handleSelect(allResults[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }, [isOpen, allResults, selectedIndex])
  
  const handleSelect = useCallback(async (restaurant: ExternalRestaurant | any) => {
    onChange(restaurant.name)
    
    // If it's an internet result, get more details
    if (restaurant.place_id && !restaurant.id) {
      try {
        console.log('InternetRestaurantSearch: Getting details for place_id:', restaurant.place_id)
        const details = await restaurantsApi.getExternalRestaurantDetails(restaurant.place_id)
        console.log('InternetRestaurantSearch: Got details:', details)
        console.log('InternetRestaurantSearch: Details opening hours:', details?.opening_hours)
        onSelect?.(details)
      } catch (error) {
        console.error('InternetRestaurantSearch: Error fetching restaurant details:', error)
        onSelect?.(restaurant)
      }
    } else {
      // It's a saved restaurant
      console.log('InternetRestaurantSearch: Using saved restaurant data')
      onSelect?.(restaurant)
    }
    
    setIsOpen(false)
    setSelectedIndex(-1)
    setInternetResults([])
    setSavedResults([])
  }, [onChange, onSelect])
  
  const handleClear = useCallback(() => {
    onChange('')
    setInternetResults([])
    setSavedResults([])
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }, [onChange])
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }, [onChange])
  
  const handleInputFocus = useCallback(() => {
    if (allResults.length > 0) {
      setIsOpen(true)
    }
  }, [allResults.length])
  
  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          disabled={disabled}
          className={cn(
            'w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg',
            'bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
            'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'placeholder-gray-500 dark:placeholder-gray-400'
          )}
          placeholder={placeholder}
          autoComplete="off"
        />
        
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        
        {isLoading && (
          <div className="absolute inset-y-0 right-8 flex items-center">
            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      
      <AnimatePresence>
        {isOpen && allResults.length > 0 && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-y-auto"
          >
            {/* Internet Results */}
            {internetResults.length > 0 && (
              <>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    Internet Results
                  </div>
                </div>
                {internetResults.map((restaurant, index) => (
                  <RestaurantResult
                    key={restaurant.place_id}
                    restaurant={restaurant}
                    isSelected={selectedIndex === index}
                    onSelect={() => handleSelect(restaurant)}
                    isInternet={true}
                  />
                ))}
              </>
            )}
            
            {/* Saved Results */}
            {savedResults.length > 0 && (
              <>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-1">
                    <Search className="w-3 h-3" />
                    Your Saved Restaurants
                  </div>
                </div>
                {savedResults.map((restaurant, index) => (
                  <RestaurantResult
                    key={restaurant.id}
                    restaurant={restaurant}
                    isSelected={selectedIndex === (internetResults.length + index)}
                    onSelect={() => handleSelect(restaurant)}
                    isInternet={false}
                  />
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Individual restaurant result component
function RestaurantResult({ 
  restaurant, 
  isSelected, 
  onSelect, 
  isInternet 
}: { 
  restaurant: any
  isSelected: boolean
  onSelect: () => void
  isInternet: boolean
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0',
        isSelected && 'bg-primary-50 dark:bg-primary-900/20'
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 dark:text-white truncate flex items-center gap-2">
            {restaurant.name}
            {isInternet && <Globe className="w-3 h-3 text-blue-500" />}
          </div>
          
          {restaurant.address && (
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {restaurant.address}
            </div>
          )}
          
          {restaurant.raw_opening_hours && restaurant.raw_opening_hours[0] && (
            <div className="text-xs text-gray-400 dark:text-gray-500 truncate flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {restaurant.raw_opening_hours[0]}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 ml-2">
          {restaurant.rating && (
            <div className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
              <Star className="w-3 h-3" />
              {restaurant.rating.toFixed(1)}
            </div>
          )}
          {restaurant.price_range && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {restaurant.price_range}
            </div>
          )}
        </div>
      </div>
    </motion.button>
  )
}