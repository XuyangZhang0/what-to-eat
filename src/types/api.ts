// API-specific types for CRUD operations
import { Meal, Restaurant, WeeklyOpeningHours } from './index'

// Meal CRUD types
export interface CreateMealData {
  user_id: number;
  name: string;
  description?: string;
  cuisine_type?: string;
  difficulty_level?: 'easy' | 'medium' | 'hard';
  prep_time?: number; // in minutes
  is_favorite?: boolean;
  tag_ids?: number[];
}

export interface UpdateMealData {
  name?: string;
  description?: string;
  cuisine_type?: string;
  difficulty_level?: 'easy' | 'medium' | 'hard';
  prep_time?: number;
  is_favorite?: boolean;
  tag_ids?: number[];
}

// Restaurant CRUD types
export interface CreateRestaurantData {
  user_id: number;
  name: string;
  cuisine_type?: string;
  address?: string;
  phone?: string;
  price_range?: '$' | '$$' | '$$$' | '$$$$';
  is_favorite?: boolean;
  rating?: number;
  opening_hours?: WeeklyOpeningHours;
  tag_ids?: number[];
}

export interface UpdateRestaurantData {
  name?: string;
  cuisine_type?: string;
  address?: string;
  phone?: string;
  price_range?: '$' | '$$' | '$$$' | '$$$$';
  is_favorite?: boolean;
  rating?: number;
  opening_hours?: WeeklyOpeningHours;
  tag_ids?: number[];
}

// Tag types
export interface Tag {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface CreateTagData {
  name: string;
  color?: string;
}

export interface UpdateTagData {
  name?: string;
  color?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

// Bulk operation types
export interface BulkOperationResult {
  success: boolean;
  processedCount: number;
  successCount: number;
  errorCount: number;
  errors?: Array<{ id: string; error: string }>;
}

// Auto-save types
export interface AutoSaveState {
  isDirty: boolean;
  isAutoSaving: boolean;
  lastSaved?: Date;
  hasErrors: boolean;
}

// Export/import types
export interface ExportData {
  meals: Meal[];
  restaurants: Restaurant[];
  tags: Tag[];
  exportDate: string;
  version: string;
}

export interface ImportResult {
  success: boolean;
  importedMeals: number;
  importedRestaurants: number;
  importedTags: number;
  errors: string[];
}