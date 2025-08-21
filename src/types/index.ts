// Opening hours for a day
export interface DayOpeningHours {
  open: string; // Time in HH:MM format (24-hour)
  close: string; // Time in HH:MM format (24-hour)
  is_closed: boolean; // Whether the restaurant is closed this day
}

// Weekly opening hours
export interface WeeklyOpeningHours {
  monday: DayOpeningHours;
  tuesday: DayOpeningHours;
  wednesday: DayOpeningHours;
  thursday: DayOpeningHours;
  friday: DayOpeningHours;
  saturday: DayOpeningHours;
  sunday: DayOpeningHours;
}

export interface Meal {
  id: string;
  name: string;
  description?: string;
  cuisine?: string; // Legacy support
  cuisine_type?: string; // Backend format
  difficulty?: 'easy' | 'medium' | 'hard'; // Legacy support
  difficulty_level?: 'easy' | 'medium' | 'hard'; // Backend format
  cookingTime?: number; // Legacy support (in minutes)
  prep_time?: number; // Backend format (in minutes)
  tags?: string[] | Array<{ id: number; name: string; color: string }>; // Support both formats
  image?: string;
  ingredients?: string[];
  instructions?: string[];
  isFavorite?: boolean; // Legacy support
  is_favorite?: boolean; // Backend format
  created_at?: string;
  updated_at?: string;
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
  openingHours?: WeeklyOpeningHours;
}

export interface UserPreferences {
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

export type SearchFilter = {
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