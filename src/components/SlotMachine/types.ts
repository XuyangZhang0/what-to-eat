export interface SlotItem {
  id: string
  name: string
  description?: string
  category?: string
  emoji?: string
  image?: string
  type?: 'meal' | 'restaurant'
  // Additional properties from Meal or Restaurant types
  cuisine?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  cookingTime?: number
  rating?: number
  priceRange?: '$' | '$$' | '$$$' | '$$$$'
  isFavorite?: boolean
}

export type SlotMachineState = 'idle' | 'spinning' | 'celebrating'

export interface SlotMachineProps {
  /**
   * Array of items to choose from in the slot machine
   */
  items: SlotItem[]
  
  /**
   * Callback function called when an item is selected
   */
  onSelection?: (item: SlotItem) => void
  
  /**
   * External shake trigger from parent component
   */
  isShakeTriggered?: boolean
  
  /**
   * Callback to reset shake trigger state
   */
  onShakeReset?: () => void
  
  /**
   * Whether the slot machine is disabled
   */
  disabled?: boolean
  
  /**
   * Whether to automatically start spinning
   */
  autoplay?: boolean
  
  /**
   * Duration of the spinning animation in milliseconds
   */
  spinDuration?: number
  
  /**
   * Number of reels to display (1-5)
   */
  reelCount?: number
  
  /**
   * Additional CSS classes
   */
  className?: string
  
  /**
   * Duration of celebration animation in milliseconds
   */
  celebrationDuration?: number
  
  /**
   * Whether sound effects are enabled
   */
  soundEnabled?: boolean
}

export interface SlotMachineReelProps {
  items: SlotItem[]
  isSpinning: boolean
  selectedItem: SlotItem | null
  delay?: number
  className?: string
}

export interface SoundEffectsOptions {
  enabled?: boolean
  volume?: number
}

export interface ConfettiOptions {
  particleCount?: number
  spread?: number
  origin?: { x: number; y: number }
  colors?: string[]
  duration?: number
}

// Utility type to convert Meal to SlotItem
export interface MealSlotItem extends SlotItem {
  type: 'meal'
  difficulty?: 'easy' | 'medium' | 'hard'
  cookingTime?: number
  ingredients?: string[]
  instructions?: string[]
}

// Utility type to convert Restaurant to SlotItem
export interface RestaurantSlotItem extends SlotItem {
  type: 'restaurant'
  rating?: number
  priceRange?: '$' | '$$' | '$$$' | '$$$$'
  address?: string
  phone?: string
  website?: string
  isOpen?: boolean
  distance?: number
}