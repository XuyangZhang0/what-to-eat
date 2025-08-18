import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, X, Plus, Minus, Clock, ChefHat, MapPin, Star, XCircle } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useFormValidation } from '@/hooks/useFormValidation'
import { useAutoSave } from '@/hooks/useAutoSave'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { CreateMealData, UpdateMealData, Tag } from '@/types/api'
import { Meal, MealCategory } from '@/types'
import { mealsApi, tagsApi } from '@/services/api'
import { EnhancedInput } from '@/components/ui/EnhancedInput'
import { EnhancedButton } from '@/components/ui/EnhancedButton'
import { FormSkeleton } from '@/components/ui/LoadingSkeleton'

interface MealFormProps {
  meal?: Meal;
  onSave: (data: CreateMealData | UpdateMealData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  autoSave?: boolean;
}

const MEAL_CATEGORIES: { value: MealCategory; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'drink', label: 'Drink' },
]

const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy', icon: '🟢' },
  { value: 'medium', label: 'Medium', icon: '🟡' },
  { value: 'hard', label: 'Hard', icon: '🔴' },
] as const

const validationSchema = {
  name: { required: true, minLength: 1, maxLength: 100 },
  description: { maxLength: 500 },
  category: { required: true },
  cuisine: { maxLength: 50 },
  cookingTime: {
    custom: (value: number) => {
      if (value && (value < 1 || value > 1440)) {
        return 'Cooking time must be between 1 and 1440 minutes'
      }
      return null
    }
  },
}

export default function MealForm({
  meal,
  onSave,
  onCancel,
  isLoading = false,
  autoSave = true,
}: MealFormProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>(meal?.tags || [])
  const [ingredients, setIngredients] = useState<string[]>(meal?.ingredients || [''])
  const [instructions, setInstructions] = useState<string[]>(meal?.instructions || [''])
  const [cuisineOptions, setCuisineOptions] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [showNewTagInput, setShowNewTagInput] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const initialData = {
    name: meal?.name || '',
    description: meal?.description || '',
    category: meal?.category || 'lunch' as MealCategory,
    cuisine: meal?.cuisine || '',
    difficulty: meal?.difficulty || 'easy' as const,
    cookingTime: meal?.cookingTime || undefined,
    isFavorite: meal?.isFavorite || false,
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

  const [isLoadingData, setIsLoadingData] = useState(true)

  // Load tags and cuisine options
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true)
        const [tags, cuisines] = await Promise.all([
          tagsApi.getTags(),
          mealsApi.getCuisineTypes(),
        ])
        setAvailableTags(tags)
        setCuisineOptions(cuisines)
      } catch (error) {
        console.error('Error loading form data:', error)
        toast({
          type: 'warning',
          message: 'Unable to load tags and cuisine suggestions. You can still create the meal.',
          duration: 4000
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [toast])

  const handleAutoSave = async (formData: typeof data) => {
    if (!user) return
    
    // Only auto-save when editing existing meals, not creating new ones
    if (!meal) return
    
    try {
      // Get tag IDs from selected tag names
      const tagIds = selectedTags
        .map(tagName => availableTags.find(tag => tag.name === tagName)?.id)
        .filter((id): id is number => id !== undefined)
      
      // Transform form data to match API expectations
      const apiData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        cuisine_type: formData.cuisine?.trim() || undefined,
        difficulty_level: formData.difficulty,
        prep_time: formData.cookingTime,
        is_favorite: formData.isFavorite,
        tag_ids: tagIds,
      }

      await onSave(apiData as UpdateMealData)
    } catch (error) {
      console.error('Auto-save failed:', error)
      toast({
        type: 'warning',
        message: 'Auto-save failed. Your changes may not be saved.',
        duration: 3000
      })
      throw error // Let useAutoSave handle the error state
    }
  }

  const { autoSaveState, saveImmediately } = useAutoSave({
    data: { ...data, selectedTags, ingredients, instructions },
    onSave: handleAutoSave,
    isDirty: isDirty || JSON.stringify(selectedTags) !== JSON.stringify(meal?.tags || []),
    isValid,
    enabled: autoSave,
  })

  const handleSubmit = async (e: React.FormEvent) => {
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
        message: 'You must be logged in to save meals.',
        duration: 4000
      })
      return
    }

    try {
      // Get tag IDs from selected tag names
      const tagIds = selectedTags
        .map(tagName => availableTags.find(tag => tag.name === tagName)?.id)
        .filter((id): id is number => id !== undefined)

      // Transform form data to match API expectations
      const apiData = {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        cuisine_type: data.cuisine?.trim() || undefined,
        difficulty_level: data.difficulty,
        prep_time: data.cookingTime,
        is_favorite: data.isFavorite,
        tag_ids: tagIds,
      }

      if (meal) {
        await onSave(apiData as UpdateMealData)
        toast({
          type: 'success',
          message: `Meal "${data.name}" updated successfully!`,
          duration: 3000
        })
      } else {
        // Add user_id for creation
        const createData = {
          ...apiData,
          user_id: parseInt(user.id), // Convert string to number
        }
        await onSave(createData as CreateMealData)
        toast({
          type: 'success',
          message: `Meal "${data.name}" saved successfully!`,
          duration: 3000
        })
        
        // Reset form after successful creation
        reset()
        setSelectedTags([])
        setIngredients([''])
        setInstructions([''])
        setNewTag('')
        setShowNewTagInput(false)
      }
    } catch (error) {
      console.error('Error saving meal:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred while saving the meal.'
      
      setSubmitError(errorMessage)
      toast({
        type: 'error',
        message: errorMessage,
        duration: 6000
      })
    }
  }

  const addIngredient = () => {
    setIngredients([...ingredients, ''])
  }

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients]
    newIngredients[index] = value
    setIngredients(newIngredients)
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const addInstruction = () => {
    setInstructions([...instructions, ''])
  }

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions]
    newInstructions[index] = value
    setInstructions(newInstructions)
  }

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index))
  }

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    )
  }

  const addNewTag = async () => {
    if (!newTag.trim()) return

    try {
      const tag = await tagsApi.createTag({ 
        name: newTag.trim(),
        color: '#3B82F6' // Default color for tags created in meal form
      })
      setAvailableTags(prev => [...prev, tag])
      setSelectedTags(prev => [...prev, tag.name])
      setNewTag('')
      setShowNewTagInput(false)
    } catch (error) {
      console.error('Error creating tag:', error)
      // Could add toast notification here too if desired
    }
  }

  // Show loading skeleton while data is loading
  if (isLoadingData) {
    return (
      <motion.div
        className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-6">
          <FormSkeleton />
        </div>
      </motion.div>
    )
  }

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
              {meal ? 'Edit Meal' : 'Add New Meal'}
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
          {/* Name */}
          <div className="md:col-span-2">
            <EnhancedInput
              label="Meal Name *"
              value={data.name}
              onChange={(e) => updateField('name', e.target.value)}
              error={touched.name ? errors.name : undefined}
              placeholder="Enter meal name"
              size="lg"
              leftIcon={<ChefHat className="w-5 h-5" />}
              debounceMs={300}
              onDebouncedChange={(value) => updateField('name', value)}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <select
              value={data.category}
              onChange={(e) => updateField('category', e.target.value as MealCategory)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {MEAL_CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Cuisine */}
          <div>
            <EnhancedInput
              label="Cuisine"
              value={data.cuisine}
              onChange={(e) => updateField('cuisine', e.target.value)}
              placeholder="e.g., Italian, Chinese, Mexican"
              leftIcon={<MapPin className="w-5 h-5" />}
              list="cuisine-options"
            />
            <datalist id="cuisine-options">
              {cuisineOptions.map(cuisine => (
                <option key={cuisine} value={cuisine} />
              ))}
            </datalist>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTY_LEVELS.map(level => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => updateField('difficulty', level.value)}
                  className={cn(
                    'flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
                    'border-2 transition-colors',
                    data.difficulty === level.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                  )}
                >
                  <span>{level.icon}</span>
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cooking Time */}
          <div>
            <EnhancedInput
              label="Cooking Time (minutes)"
              type="number"
              value={data.cookingTime || ''}
              onChange={(e) => updateField('cookingTime', e.target.value ? parseInt(e.target.value) : undefined)}
              error={touched.cookingTime ? errors.cookingTime : undefined}
              placeholder="30"
              leftIcon={<Clock className="w-5 h-5" />}
              min={1}
              max={1440}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={data.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={3}
            className={cn(
              'w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none',
              errors.description && touched.description
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600'
            )}
            placeholder="Describe the meal..."
          />
          {errors.description && touched.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {availableTags.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.name)}
                className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium border-2 transition-colors',
                  selectedTags.includes(tag.name)
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                )}
                style={{ borderColor: selectedTags.includes(tag.name) ? tag.color : undefined }}
              >
                {tag.name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {showNewTagInput ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="New tag name"
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  onKeyPress={(e) => e.key === 'Enter' && addNewTag()}
                />
                <button
                  type="button"
                  onClick={addNewTag}
                  className="px-3 py-1 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewTagInput(false)
                    setNewTag('')
                  }}
                  className="px-3 py-1 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowNewTagInput(true)}
                className="flex items-center gap-1 px-3 py-1 text-sm text-primary-600 dark:text-primary-400 border border-primary-500 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
              >
                <Plus className="w-4 h-4" />
                Add Tag
              </button>
            )}
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ingredients
          </label>
          <div className="space-y-2">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => updateIngredient(index, e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={`Ingredient ${index + 1}`}
                />
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addIngredient}
              className="flex items-center gap-1 px-3 py-2 text-sm text-primary-600 dark:text-primary-400 border border-dashed border-primary-300 dark:border-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
            >
              <Plus className="w-4 h-4" />
              Add Ingredient
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Instructions
          </label>
          <div className="space-y-2">
            {instructions.map((instruction, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium flex items-center justify-center mt-2">
                  {index + 1}
                </span>
                <textarea
                  value={instruction}
                  onChange={(e) => updateInstruction(index, e.target.value)}
                  rows={2}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder={`Step ${index + 1}`}
                />
                {instructions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInstruction(index)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg mt-1"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addInstruction}
              className="flex items-center gap-1 px-3 py-2 text-sm text-primary-600 dark:text-primary-400 border border-dashed border-primary-300 dark:border-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
            >
              <Plus className="w-4 h-4" />
              Add Step
            </button>
          </div>
        </div>

        {/* Favorite Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Star className={cn(
              'w-5 h-5',
              data.isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-400'
            )} />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Add to Favorites</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mark this meal as a favorite for quick access
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => updateField('isFavorite', !data.isFavorite)}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              data.isFavorite ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-600'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                data.isFavorite ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <EnhancedButton
            type="button"
            onClick={onCancel}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            Cancel
          </EnhancedButton>
          <EnhancedButton
            type="submit"
            disabled={isLoading || !isValid}
            isLoading={isLoading}
            loadingText="Saving..."
            icon={<Save className="w-4 h-4" />}
            variant="primary"
            size="lg"
            className="flex-1"
          >
            {meal ? 'Update Meal' : 'Save Meal'}
          </EnhancedButton>
        </div>
      </form>
    </motion.div>
  )
}