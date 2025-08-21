import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Check } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Restaurant } from '@/types'
import { restaurantsApi } from '@/services/api'
import { useDebounce } from '@/hooks/useDebounce'

interface RestaurantAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect?: (restaurant: Restaurant) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export default function RestaurantAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Search existing restaurants...",
  className,
  disabled = false
}: RestaurantAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Debounce the search query to avoid too many API calls
  const debouncedQuery = useDebounce(value, 300)
  
  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery || debouncedQuery.trim().length < 2) {
        setSuggestions([])
        setIsOpen(false)
        return
      }
      
      setIsLoading(true)
      try {
        const results = await restaurantsApi.getRestaurantSuggestions(debouncedQuery.trim(), 8)
        setSuggestions(results)
        setIsOpen(results.length > 0)
        setSelectedIndex(-1)
      } catch (error) {
        console.error('Error fetching restaurant suggestions:', error)
        setSuggestions([])
        setIsOpen(false)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSuggestions()
  }, [debouncedQuery])
  
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
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }, [isOpen, suggestions, selectedIndex])
  
  const handleSelect = useCallback((restaurant: Restaurant) => {
    onChange(restaurant.name)
    onSelect?.(restaurant)
    setIsOpen(false)
    setSelectedIndex(-1)
    setSuggestions([])
  }, [onChange, onSelect])
  
  const handleClear = useCallback(() => {
    onChange('')
    setSuggestions([])
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }, [onChange])
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }, [onChange])
  
  const handleInputFocus = useCallback(() => {
    if (suggestions.length > 0) {
      setIsOpen(true)
    }
  }, [suggestions.length])
  
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
        {isOpen && suggestions.length > 0 && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-y-auto"
          >
            {suggestions.map((restaurant, index) => (
              <motion.button
                key={restaurant.id}
                type="button"
                onClick={() => handleSelect(restaurant)}
                className={cn(
                  'w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0',
                  selectedIndex === index && 'bg-primary-50 dark:bg-primary-900/20'
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.02 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {restaurant.name}
                    </div>
                    {restaurant.cuisine && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {restaurant.cuisine}
                      </div>
                    )}
                    {restaurant.address && (
                      <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                        {restaurant.address}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-2">
                    {restaurant.rating && (
                      <div className="text-xs text-yellow-600 dark:text-yellow-400">
                        ★ {restaurant.rating.toFixed(1)}
                      </div>
                    )}
                    {restaurant.priceRange && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {restaurant.priceRange}
                      </div>
                    )}
                    {selectedIndex === index && (
                      <Check className="w-4 h-4 text-primary-500" />
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}