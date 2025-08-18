// Database model types

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  preferences: string; // JSON string
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  password_hash: string;
  preferences?: Record<string, any>;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  password_hash?: string;
  preferences?: Record<string, any>;
}

export interface Meal {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  cuisine_type?: string;
  difficulty_level?: 'easy' | 'medium' | 'hard';
  prep_time?: number;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}

export interface CreateMealData {
  user_id: number;
  name: string;
  description?: string;
  cuisine_type?: string;
  difficulty_level?: 'easy' | 'medium' | 'hard';
  prep_time?: number;
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

export interface Restaurant {
  id: number;
  user_id: number;
  name: string;
  cuisine_type?: string;
  address?: string;
  phone?: string;
  price_range?: '$' | '$$' | '$$$' | '$$$$';
  is_favorite: boolean;
  rating?: number;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}

export interface CreateRestaurantData {
  user_id: number;
  name: string;
  cuisine_type?: string;
  address?: string;
  phone?: string;
  price_range?: '$' | '$$' | '$$$' | '$$$$';
  is_favorite?: boolean;
  rating?: number;
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
  tag_ids?: number[];
}

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

export interface SelectionHistory {
  id: number;
  user_id: number;
  item_type: 'meal' | 'restaurant';
  item_id: number;
  selected_at: string;
}

export interface CreateSelectionHistoryData {
  user_id: number;
  item_type: 'meal' | 'restaurant';
  item_id: number;
}

// Search and filter types
export interface SearchFilters {
  cuisine_type?: string;
  difficulty_level?: 'easy' | 'medium' | 'hard';
  prep_time_max?: number;
  price_range?: '$' | '$$' | '$$$' | '$$$$';
  is_favorite?: boolean;
  rating_min?: number;
  tag_ids?: number[];
  search?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
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
    total_pages: number;
  };
}

// Random selection types
export interface RandomSelectionOptions {
  exclude_recent_days?: number;
  weight_favorites?: boolean;
  filters?: SearchFilters;
}

export interface RandomSuggestion {
  meal?: Meal;
  restaurant?: Restaurant;
  type: 'meal' | 'restaurant';
}

// JWT payload
export interface JWTPayload {
  user_id: number;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}