export interface Meal {
  id: string;
  name: string;
  description?: string;
  category: MealCategory;
  cuisine?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  cookingTime?: number; // in minutes
  tags?: string[];
  image?: string;
  ingredients?: string[];
  instructions?: string[];
  isFavorite?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  cuisine: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  priceRange?: '$' | '$$' | '$$$' | '$$$$';
  image?: string;
  isOpen?: boolean;
  distance?: number; // in meters
  isFavorite?: boolean;
}

export interface UserPreferences {
  favoriteCategories: MealCategory[];
  favoriteCuisines: string[];
  dietaryRestrictions: string[];
  allergies: string[];
  preferredDifficulty: 'easy' | 'medium' | 'hard' | 'any';
  maxCookingTime?: number;
  location?: GeolocationCoordinates;
}

export interface ShakeSettings {
  sensitivity: number;
  isEnabled: boolean;
  hapticFeedback: boolean;
  cooldownPeriod: number;
  threshold: number;
  requiresPermission: boolean;
}

export interface DeviceMotionPermissionState {
  state: 'prompt' | 'granted' | 'denied' | 'unsupported';
  requested: boolean;
}

export interface ShakeDetectionOptions {
  threshold?: number;
  cooldownPeriod?: number;
  sensitivity?: number;
  enabled?: boolean;
  hapticFeedback?: boolean;
  onShakeDetected?: () => void;
  onPermissionChange?: (state: DeviceMotionPermissionState) => void;
}

export interface AccelerationData {
  x: number;
  y: number;
  z: number;
  magnitude: number;
  timestamp: number;
}

export interface ShakeEvent {
  intensity: number;
  duration: number;
  timestamp: number;
  accelerationData: AccelerationData[];
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  shake: ShakeSettings;
  notifications: boolean;
}

export type MealCategory = 
  | 'breakfast' 
  | 'lunch' 
  | 'dinner' 
  | 'snack' 
  | 'dessert' 
  | 'drink';

export type SearchFilter = {
  category?: MealCategory;
  cuisine?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  maxCookingTime?: number;
  tags?: string[];
};

export type SearchMode = 'meals' | 'restaurants';

export interface SearchResult {
  meals: Meal[];
  restaurants: Restaurant[];
  query: string;
  filters: SearchFilter;
  timestamp: number;
}

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}