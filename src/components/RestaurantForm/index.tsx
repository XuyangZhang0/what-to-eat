import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Save, X, MapPin, Phone, Globe, Star, DollarSign, XCircle } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useFormValidation } from '@/hooks/useFormValidation'
import { useAutoSave } from '@/hooks/useAutoSave'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { CreateRestaurantData, UpdateRestaurantData } from '@/types/api'
import { Restaurant } from '@/types'
import { restaurantsApi } from '@/services/api'
import RestaurantAutocomplete from '@/components/RestaurantAutocomplete'
import InternetRestaurantSearch from '@/components/InternetRestaurantSearch'
import OpeningHoursEditor from '@/components/OpeningHoursEditor'

interface RestaurantFormProps {
  restaurant?: Restaurant;
  onSave: (data: CreateRestaurantData | UpdateRestaurantData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  autoSave?: boolean;
}

const PRICE_RANGES = [
  { value: '$', label: '$ - Budget-friendly', description: 'Under $15 per person' },
  { value: '$$', label: '$$ - Moderate', description: '$15-30 per person' },
  { value: '$$$', label: '$$$ - Expensive', description: '$30-60 per person' },
  { value: '$$$$', label: '$$$$ - Very Expensive', description: 'Over $60 per person' },
] as const

const validationSchema = {
  name: { required: true, minLength: 1, maxLength: 100 },
  cuisine_type: { maxLength: 50 },
  address: { maxLength: 200 },
  phone: {
    pattern: /^[\d\s\-\+\(\)\.]+$/,
    maxLength: 20,
    custom: (value: string) => {
      if (value && !/^[\d\s\-\+\(\)\.]+$/.test(value)) {
        return 'Phone number format is invalid'
      }
      return null
    }
  },
  rating: {
    custom: (value: number) => {
      if (value && (value < 0 || value > 5)) {
        return 'Rating must be between 0 and 5'
      }
      return null
    }
  },
}

export default function RestaurantForm({
  restaurant,
  onSave,
  onCancel,
  isLoading = false,
  autoSave = false,
}: RestaurantFormProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [cuisineOptions, setCuisineOptions] = useState<string[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [openingHours, setOpeningHours] = useState(restaurant?.openingHours)

  const initialData = {
    name: restaurant?.name || '',
    cuisine_type: restaurant?.cuisine || '',
    address: restaurant?.address || '',
    phone: restaurant?.phone || '',
    rating: restaurant?.rating || undefined,
    price_range: restaurant?.priceRange || undefined,
    is_favorite: restaurant?.isFavorite ?? true,
  }

  const {
    data,
    errors,
    touched,
    isValid,
    isDirty,
    updateField,
    validate,
    reset,
  } = useFormValidation(initialData, validationSchema)

  // Debug logging to help identify validation issues
  useEffect(() => {
    console.log('Debug - Restaurant Form State:', {
      data,
      errors,
      touched,
      isValid,
      isDirty,
      user: user ? { id: user.id, username: user.username } : null,
      validationSchema: Object.keys(validationSchema),
      requiredFields: Object.entries(validationSchema)
        .filter(([key, rule]) => rule.required)
        .map(([key]) => key)
    })
  }, [data, errors, touched, isValid, user])

  // Load cuisine options
  useEffect(() => {
    const loadCuisineOptions = async () => {
      try {
        const cuisines = await restaurantsApi.getCuisineTypes()
        setCuisineOptions(cuisines)
      } catch (error) {
        console.error('Error loading cuisine options:', error)
        toast({
          type: 'warning',
          message: 'Unable to load cuisine suggestions. You can still type your own.',
          duration: 3000
        })
      }
    }

    loadCuisineOptions()
  }, [toast])

  const handleAutoSave = async (formData: typeof data) => {
    if (!user) return
    
    // Transform form data to match API expectations
    const apiData = {
      name: formData.name,
      cuisine_type: formData.cuisine_type,
      address: formData.address,
      phone: formData.phone,
      rating: formData.rating,
      price_range: formData.price_range,
      is_favorite: formData.is_favorite,
      opening_hours: openingHours,
    }

    if (restaurant) {
      await onSave(apiData as UpdateRestaurantData)
    } else {
      // Add user_id for creation
      const createData = {
        ...apiData,
        user_id: parseInt(user.id), // Convert string to number
      }
      await onSave(createData as CreateRestaurantData)
    }
  }

  const { autoSaveState, saveImmediately } = useAutoSave({
    data,
    onSave: handleAutoSave,
    isDirty,
    isValid,
    enabled: autoSave,
  })

  // Handle restaurant selection from local autocomplete
  const handleRestaurantSelect = useCallback((selectedRestaurant: Restaurant) => {
    // Auto-populate form fields based on selected restaurant
    updateField('name', selectedRestaurant.name)
    if (selectedRestaurant.cuisine) updateField('cuisine_type', selectedRestaurant.cuisine)
    if (selectedRestaurant.address) updateField('address', selectedRestaurant.address)
    if (selectedRestaurant.phone) updateField('phone', selectedRestaurant.phone)
    if (selectedRestaurant.rating) updateField('rating', selectedRestaurant.rating)
    if (selectedRestaurant.priceRange) updateField('price_range', selectedRestaurant.priceRange)
    if (selectedRestaurant.isFavorite !== undefined) updateField('is_favorite', selectedRestaurant.isFavorite)
    if (selectedRestaurant.openingHours) setOpeningHours(selectedRestaurant.openingHours)
    
    toast({
      type: 'success',
      message: 'Restaurant details auto-filled from your saved restaurants!',
      duration: 2000
    })
  }, [updateField, toast])

  // Handle restaurant selection from internet search
  const handleInternetRestaurantSelect = useCallback((selectedRestaurant: any) => {
    console.log('RestaurantForm: Selected restaurant data:', selectedRestaurant)
    console.log('RestaurantForm: Opening hours from selection:', selectedRestaurant.opening_hours)
    
    // Auto-populate form fields based on internet search result
    updateField('name', selectedRestaurant.name)
    if (selectedRestaurant.address) updateField('address', selectedRestaurant.address)
    if (selectedRestaurant.phone) updateField('phone', selectedRestaurant.phone)
    if (selectedRestaurant.rating) updateField('rating', selectedRestaurant.rating)
    if (selectedRestaurant.price_range) updateField('price_range', selectedRestaurant.price_range)
    if (selectedRestaurant.opening_hours) {
      console.log('RestaurantForm: Setting opening hours:', selectedRestaurant.opening_hours)
      setOpeningHours(selectedRestaurant.opening_hours)
    } else {
      console.log('RestaurantForm: No opening hours in selected restaurant data')
      // Clear opening hours since this restaurant doesn't have them available
      setOpeningHours(undefined)
    }
    
    // Try to determine cuisine from restaurant types
    if (selectedRestaurant.types && Array.isArray(selectedRestaurant.types)) {
      const cuisineTypes = ['italian', 'chinese', 'mexican', 'indian', 'thai', 'japanese', 'french', 'american']
      const detectedCuisine = selectedRestaurant.types.find((type: string) => 
        cuisineTypes.some(cuisine => type.toLowerCase().includes(cuisine))
      )
      if (detectedCuisine) {
        updateField('cuisine_type', detectedCuisine.charAt(0).toUpperCase() + detectedCuisine.slice(1))
      }
    }
    
    // Show appropriate toast message based on what data was found
    const hasOpeningHours = !!selectedRestaurant.opening_hours
    toast({
      type: 'success',
      message: hasOpeningHours 
        ? 'Restaurant details auto-filled from internet search!' 
        : 'Restaurant details auto-filled! Opening hours not available - please add manually.',
      duration: hasOpeningHours ? 3000 : 4000
    })
  }, [updateField, toast])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    
    if (!validate()) {
      toast({
        type: 'error',
        message: 'Please fix the validation errors before saving.',
        duration: 4000
      })
      return
    }

    if (!user) {
      toast({
        type: 'error',
        message: 'You must be logged in to save restaurants.',
        duration: 4000
      })
      return
    }

    try {
      // Transform form data to match API expectations
      const apiData = {
        name: data.name.trim(),
        cuisine_type: data.cuisine_type?.trim() || undefined,
        address: data.address?.trim() || undefined,
        phone: data.phone?.trim() || undefined,
        rating: data.rating,
        price_range: data.price_range,
        is_favorite: data.is_favorite,
        opening_hours: openingHours,
      }

      if (restaurant) {
        await onSave(apiData as UpdateRestaurantData)
        toast({
          type: 'success',
          message: 'Restaurant updated successfully!',
          duration: 3000
        })
      } else {
        // Add user_id for creation
        const createData = {
          ...apiData,
          user_id: parseInt(user.id), // Convert string to number
        }
        await onSave(createData as CreateRestaurantData)
        toast({
          type: 'success',
          message: 'Restaurant saved successfully!',
          duration: 3000
        })
        
        // Reset form after successful creation
        reset()
      }
    } catch (error) {
      console.error('Error saving restaurant:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred while saving the restaurant.'
      
      setSubmitError(errorMessage)
      toast({
        type: 'error',
        message: errorMessage,
        duration: 6000
      })
    }
  }, [data, validate, user, restaurant, onSave, toast, reset])

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {restaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
            </h2>
            {autoSave && (
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                {autoSaveState.isAutoSaving && (
                  <>
                    <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    Auto-saving...
                  </>
                )}
                {autoSaveState.lastSaved && !autoSaveState.isAutoSaving && (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Saved {autoSaveState.lastSaved.toLocaleTimeString()}
                  </>
                )}
                {autoSaveState.hasErrors && (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    Auto-save failed
                  </>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name with Internet Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Restaurant Name *
            </label>
            <InternetRestaurantSearch
              value={data.name}
              onChange={(value) => updateField('name', value)}
              onSelect={handleInternetRestaurantSelect}
              placeholder="Search restaurants worldwide..."
              className={cn(
                errors.name && touched.name && 'ring-2 ring-red-500'
              )}
              disabled={isLoading}
              showSavedResults={true}
            />
            {errors.name && touched.name && (
              <p id="name-error" className="mt-1 text-sm text-red-500" role="alert">{errors.name}</p>
            )}
            <div className="mt-1 space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                🌍 Search restaurants worldwide or from your saved restaurants
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Select a result to auto-fill address, hours, rating, and more
              </p>
            </div>
          </div>

          {/* Cuisine */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cuisine Type
            </label>
            <input
              type="text"
              value={data.cuisine_type}
              onChange={(e) => updateField('cuisine_type', e.target.value)}
              list="cuisine-options"
              className={cn(
                'w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                'bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
                errors.cuisine_type && touched.cuisine_type
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              )}
              placeholder="e.g., Italian, Chinese, Mexican"
            />
            <datalist id="cuisine-options">
              {cuisineOptions.map(cuisine => (
                <option key={cuisine} value={cuisine} />
              ))}
            </datalist>
            {errors.cuisine_type && touched.cuisine_type && (
              <p className="mt-1 text-sm text-red-500">{errors.cuisine_type}</p>
            )}
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rating (0-5)
            </label>
            <div className="relative">
              <Star className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={data.rating ?? ''}
                onChange={(e) => updateField('rating', e.target.value ? parseFloat(e.target.value) : undefined)}
                className={cn(
                  'w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  'bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
                  errors.rating && touched.rating
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                )}
                placeholder="4.5"
                min="0"
                max="5"
                step="0.1"
              />
            </div>
            {errors.rating && touched.rating && (
              <p className="mt-1 text-sm text-red-500">{errors.rating}</p>
            )}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Price Range
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PRICE_RANGES.map(range => (
              <button
                key={range.value}
                type="button"
                onClick={() => updateField('price_range', range.value)}
                className={cn(
                  'p-4 rounded-lg border-2 text-left transition-colors',
                  data.price_range === range.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-medium">{range.label}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {range.description}
                </p>
              </button>
            ))}
          </div>
        </div>


        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Contact Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={data.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className={cn(
                    'w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                    'bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
                    errors.address && touched.address
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                  placeholder="123 Main St, City, State, ZIP"
                />
              </div>
              {errors.address && touched.address && (
                <p className="mt-1 text-sm text-red-500">{errors.address}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className={cn(
                    'w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                    'bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
                    errors.phone && touched.phone
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                  placeholder="(555) 123-4567"
                />
              </div>
              {errors.phone && touched.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Favorite Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Star className={cn(
              'w-5 h-5',
              data.is_favorite ? 'text-yellow-500 fill-current' : 'text-gray-400'
            )} />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Add to Favorites</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mark this restaurant as a favorite for quick access
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => updateField('is_favorite', !data.is_favorite)}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              data.is_favorite ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-600'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                data.is_favorite ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        {/* Opening Hours */}
        <OpeningHoursEditor
          openingHours={openingHours}
          onChange={setOpeningHours}
        />

        {/* Error Display */}
        {submitError && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-700 dark:text-red-300">{submitError}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !isValid}
            className={cn(
              'flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg font-medium flex items-center justify-center gap-2',
              'hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {restaurant ? 'Update Restaurant' : 'Save Restaurant'}
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  )
}