import { db } from '@/database/connection.js';
import { Meal, CreateMealData, UpdateMealData, SearchFilters, PaginationOptions, Tag } from './types.js';

export class MealModel {
  // Create a new meal
  static create(mealData: CreateMealData): Meal {
    const transaction = db.transaction(() => {
      // Insert meal
      const stmt = db.prepare(`
        INSERT INTO meals (user_id, name, description, cuisine_type, difficulty_level, prep_time, ingredients, instructions, is_favorite)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        mealData.user_id,
        mealData.name,
        mealData.description || null,
        mealData.cuisine_type || null,
        mealData.difficulty_level || null,
        mealData.prep_time || null,
        mealData.ingredients ? JSON.stringify(mealData.ingredients) : '[]',
        mealData.instructions ? JSON.stringify(mealData.instructions) : '[]',
        mealData.is_favorite ?? false ? 1 : 0
      );
      
      const mealId = result.lastInsertRowid as number;
      
      // Add tags if provided
      if (mealData.tag_ids && mealData.tag_ids.length > 0) {
        const tagStmt = db.prepare('INSERT INTO meal_tags (meal_id, tag_id) VALUES (?, ?)');
        for (const tagId of mealData.tag_ids) {
          tagStmt.run(mealId, tagId);
        }
      }
      
      return mealId;
    });
    
    const mealId = transaction();
    return this.findById(mealId)!;
  }

  // Find meal by ID
  static findById(id: number): Meal | null {
    const stmt = db.prepare(`
      SELECT * FROM meals WHERE id = ?
    `);
    
    const meal = stmt.get(id) as any;
    if (!meal) return null;
    
    // Parse JSON fields
    const parsedMeal: Meal = {
      ...meal,
      ingredients: meal.ingredients ? JSON.parse(meal.ingredients) : [],
      instructions: meal.instructions ? JSON.parse(meal.instructions) : [],
    };
    
    // Get tags
    const tags = this.getMealTags(id);
    return { ...parsedMeal, tags };
  }

  // Find meals by user ID with filters and pagination
  static findByUserId(
    userId: number, 
    filters: SearchFilters = {},
    pagination: PaginationOptions = {}
  ): { meals: Meal[], total: number } {
    const { page = 1, limit = 20, sort_by = 'created_at', sort_order = 'desc' } = pagination;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE m.user_id = ?';
    const queryParams: any[] = [userId];
    
    // Apply filters
    if (filters.cuisine_type) {
      whereClause += ' AND m.cuisine_type = ?';
      queryParams.push(filters.cuisine_type);
    }
    
    if (filters.difficulty_level) {
      whereClause += ' AND m.difficulty_level = ?';
      queryParams.push(filters.difficulty_level);
    }
    
    if (filters.prep_time_max) {
      whereClause += ' AND m.prep_time <= ?';
      queryParams.push(filters.prep_time_max);
    }
    
    if (filters.is_favorite !== undefined) {
      whereClause += ' AND m.is_favorite = ?';
      queryParams.push(filters.is_favorite ? 1 : 0);
    }
    
    if (filters.search) {
      whereClause += ' AND (m.name LIKE ? OR m.description LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      queryParams.push(searchTerm, searchTerm);
    }
    
    // Handle tag filtering
    if (filters.tag_ids && filters.tag_ids.length > 0) {
      const tagPlaceholders = filters.tag_ids.map(() => '?').join(',');
      whereClause += ` AND m.id IN (
        SELECT mt.meal_id FROM meal_tags mt 
        WHERE mt.tag_id IN (${tagPlaceholders})
        GROUP BY mt.meal_id
        HAVING COUNT(DISTINCT mt.tag_id) = ?
      )`;
      queryParams.push(...filters.tag_ids, filters.tag_ids.length);
    }
    
    // Count total results
    const countStmt = db.prepare(`
      SELECT COUNT(*) as total FROM meals m ${whereClause}
    `);
    const totalResult = countStmt.get(...queryParams) as { total: number };
    const total = totalResult.total;
    
    // Get paginated results
    const stmt = db.prepare(`
      SELECT m.* FROM meals m 
      ${whereClause}
      ORDER BY m.${sort_by} ${sort_order}
      LIMIT ? OFFSET ?
    `);
    
    const meals = stmt.all(...queryParams, limit, offset) as any[];
    
    // Add tags and parse JSON fields for each meal
    const mealsWithTags: Meal[] = meals.map(meal => ({
      ...meal,
      ingredients: meal.ingredients ? JSON.parse(meal.ingredients) : [],
      instructions: meal.instructions ? JSON.parse(meal.instructions) : [],
      tags: this.getMealTags(meal.id)
    }));
    
    return { meals: mealsWithTags, total };
  }

  // Update meal
  static update(id: number, mealData: UpdateMealData): Meal | null {
    const transaction = db.transaction(() => {
      const updateFields: string[] = [];
      const values: any[] = [];
      
      if (mealData.name !== undefined) {
        updateFields.push('name = ?');
        values.push(mealData.name);
      }
      
      if (mealData.description !== undefined) {
        updateFields.push('description = ?');
        values.push(mealData.description);
      }
      
      if (mealData.cuisine_type !== undefined) {
        updateFields.push('cuisine_type = ?');
        values.push(mealData.cuisine_type);
      }
      
      if (mealData.difficulty_level !== undefined) {
        updateFields.push('difficulty_level = ?');
        values.push(mealData.difficulty_level);
      }
      
      if (mealData.prep_time !== undefined) {
        updateFields.push('prep_time = ?');
        values.push(mealData.prep_time);
      }
      
      if (mealData.is_favorite !== undefined) {
        updateFields.push('is_favorite = ?');
        values.push(mealData.is_favorite ? 1 : 0);
      }
      
      if (mealData.ingredients !== undefined) {
        updateFields.push('ingredients = ?');
        values.push(JSON.stringify(mealData.ingredients));
      }
      
      if (mealData.instructions !== undefined) {
        updateFields.push('instructions = ?');
        values.push(JSON.stringify(mealData.instructions));
      }
      
      if (updateFields.length > 0) {
        values.push(id);
        const stmt = db.prepare(`
          UPDATE meals 
          SET ${updateFields.join(', ')}
          WHERE id = ?
        `);
        stmt.run(...values);
      }
      
      // Update tags if provided
      if (mealData.tag_ids !== undefined) {
        // Remove existing tags
        const deleteTagsStmt = db.prepare('DELETE FROM meal_tags WHERE meal_id = ?');
        deleteTagsStmt.run(id);
        
        // Add new tags
        if (mealData.tag_ids.length > 0) {
          const tagStmt = db.prepare('INSERT INTO meal_tags (meal_id, tag_id) VALUES (?, ?)');
          for (const tagId of mealData.tag_ids) {
            tagStmt.run(id, tagId);
          }
        }
      }
    });
    
    transaction();
    return this.findById(id);
  }

  // Delete meal
  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM meals WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Get random meal for user
  static getRandomMeal(userId: number, excludeRecentDays: number = 7): Meal | null {
    const stmt = db.prepare(`
      SELECT m.* FROM meals m
      WHERE m.user_id = ?
      AND m.id NOT IN (
        SELECT sh.item_id FROM selection_history sh
        WHERE sh.user_id = ? 
        AND sh.item_type = 'meal'
        AND sh.selected_at > datetime('now', '-${excludeRecentDays} days')
      )
      ORDER BY 
        CASE WHEN m.is_favorite = 1 THEN 0 ELSE 1 END,
        RANDOM()
      LIMIT 1
    `);
    
    const meal = stmt.get(userId, userId) as any;
    if (!meal) return null;
    
    // Parse JSON fields
    const parsedMeal: Meal = {
      ...meal,
      ingredients: meal.ingredients ? JSON.parse(meal.ingredients) : [],
      instructions: meal.instructions ? JSON.parse(meal.instructions) : [],
    };
    
    return { ...parsedMeal, tags: this.getMealTags(meal.id) };
  }

  // Get meal tags
  private static getMealTags(mealId: number): Tag[] {
    const stmt = db.prepare(`
      SELECT t.* FROM tags t
      JOIN meal_tags mt ON t.id = mt.tag_id
      WHERE mt.meal_id = ?
      ORDER BY t.name
    `);
    
    return stmt.all(mealId) as Tag[];
  }

  // Get cuisine types for user
  static getCuisineTypes(userId: number): string[] {
    const stmt = db.prepare(`
      SELECT DISTINCT cuisine_type 
      FROM meals 
      WHERE user_id = ? AND cuisine_type IS NOT NULL
      ORDER BY cuisine_type
    `);
    
    const results = stmt.all(userId) as { cuisine_type: string }[];
    return results.map(r => r.cuisine_type);
  }

  // Get meal statistics
  static getStats(userId: number) {
    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_favorite = 1 THEN 1 END) as favorites,
        AVG(prep_time) as avg_prep_time,
        COUNT(DISTINCT cuisine_type) as cuisine_types
      FROM meals 
      WHERE user_id = ?
    `);
    
    return stmt.get(userId);
  }

  // Find all public meals (cross-user discovery)
  static findAllPublic(
    filters: SearchFilters = {},
    pagination: PaginationOptions = {}
  ): { meals: Meal[], total: number } {
    const { page = 1, limit = 20, sort_by = 'created_at', sort_order = 'desc' } = pagination;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const queryParams: any[] = [];
    
    // Apply filters (same as regular search but without user_id filter)
    if (filters.cuisine_type) {
      whereClause += ' AND m.cuisine_type = ?';
      queryParams.push(filters.cuisine_type);
    }
    
    if (filters.difficulty_level) {
      whereClause += ' AND m.difficulty_level = ?';
      queryParams.push(filters.difficulty_level);
    }
    
    if (filters.prep_time_max) {
      whereClause += ' AND m.prep_time <= ?';
      queryParams.push(filters.prep_time_max);
    }
    
    if (filters.search) {
      whereClause += ' AND (m.name LIKE ? OR m.description LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      queryParams.push(searchTerm, searchTerm);
    }
    
    // Handle tag filtering
    if (filters.tag_ids && filters.tag_ids.length > 0) {
      const tagPlaceholders = filters.tag_ids.map(() => '?').join(',');
      whereClause += ` AND m.id IN (
        SELECT mt.meal_id FROM meal_tags mt 
        WHERE mt.tag_id IN (${tagPlaceholders})
        GROUP BY mt.meal_id
        HAVING COUNT(DISTINCT mt.tag_id) = ?
      )`;
      queryParams.push(...filters.tag_ids, filters.tag_ids.length);
    }
    
    // Count total results
    const countStmt = db.prepare(`
      SELECT COUNT(*) as total FROM meals m ${whereClause}
    `);
    const totalResult = countStmt.get(...queryParams) as { total: number };
    const total = totalResult.total;
    
    // Get paginated results with user info
    const stmt = db.prepare(`
      SELECT m.*, u.username as creator_username
      FROM meals m 
      JOIN users u ON m.user_id = u.id
      ${whereClause}
      ORDER BY m.${sort_by} ${sort_order}
      LIMIT ? OFFSET ?
    `);
    
    const meals = stmt.all(...queryParams, limit, offset) as any[];
    
    // Add tags and parse JSON fields for each meal
    const mealsWithTags: Meal[] = meals.map(meal => ({
      ...meal,
      ingredients: meal.ingredients ? JSON.parse(meal.ingredients) : [],
      instructions: meal.instructions ? JSON.parse(meal.instructions) : [],
      tags: this.getMealTags(meal.id)
    }));
    
    return { meals: mealsWithTags, total };
  }
}