import { db } from '@/database/connection.js';
import { Restaurant, CreateRestaurantData, UpdateRestaurantData, SearchFilters, PaginationOptions, Tag } from './types.js';

export class RestaurantModel {
  // Create a new restaurant
  static create(restaurantData: CreateRestaurantData): Restaurant {
    const transaction = db.transaction(() => {
      // Insert restaurant
      const stmt = db.prepare(`
        INSERT INTO restaurants (user_id, name, cuisine_type, address, phone, price_range, is_favorite, rating)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        restaurantData.user_id,
        restaurantData.name,
        restaurantData.cuisine_type || null,
        restaurantData.address || null,
        restaurantData.phone || null,
        restaurantData.price_range || null,
        restaurantData.is_favorite ? 1 : 0,
        restaurantData.rating || null
      );
      
      const restaurantId = result.lastInsertRowid as number;
      
      // Add tags if provided
      if (restaurantData.tag_ids && restaurantData.tag_ids.length > 0) {
        const tagStmt = db.prepare('INSERT INTO restaurant_tags (restaurant_id, tag_id) VALUES (?, ?)');
        for (const tagId of restaurantData.tag_ids) {
          tagStmt.run(restaurantId, tagId);
        }
      }
      
      return restaurantId;
    });
    
    const restaurantId = transaction();
    return this.findById(restaurantId)!;
  }

  // Find restaurant by ID
  static findById(id: number): Restaurant | null {
    const stmt = db.prepare(`
      SELECT * FROM restaurants WHERE id = ?
    `);
    
    const restaurant = stmt.get(id) as Restaurant | undefined;
    if (!restaurant) return null;
    
    // Get tags
    const tags = this.getRestaurantTags(id);
    return { ...restaurant, tags };
  }

  // Find restaurants by user ID with filters and pagination
  static findByUserId(
    userId: number, 
    filters: SearchFilters = {},
    pagination: PaginationOptions = {}
  ): { restaurants: Restaurant[], total: number } {
    const { page = 1, limit = 20, sort_by = 'created_at', sort_order = 'desc' } = pagination;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE r.user_id = ?';
    const queryParams: any[] = [userId];
    
    // Apply filters
    if (filters.cuisine_type) {
      whereClause += ' AND r.cuisine_type = ?';
      queryParams.push(filters.cuisine_type);
    }
    
    if (filters.price_range) {
      whereClause += ' AND r.price_range = ?';
      queryParams.push(filters.price_range);
    }
    
    if (filters.rating_min) {
      whereClause += ' AND r.rating >= ?';
      queryParams.push(filters.rating_min);
    }
    
    if (filters.is_favorite !== undefined) {
      whereClause += ' AND r.is_favorite = ?';
      queryParams.push(filters.is_favorite);
    }
    
    if (filters.search) {
      whereClause += ' AND (r.name LIKE ? OR r.address LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      queryParams.push(searchTerm, searchTerm);
    }
    
    // Handle tag filtering
    if (filters.tag_ids && filters.tag_ids.length > 0) {
      const tagPlaceholders = filters.tag_ids.map(() => '?').join(',');
      whereClause += ` AND r.id IN (
        SELECT rt.restaurant_id FROM restaurant_tags rt 
        WHERE rt.tag_id IN (${tagPlaceholders})
        GROUP BY rt.restaurant_id
        HAVING COUNT(DISTINCT rt.tag_id) = ?
      )`;
      queryParams.push(...filters.tag_ids, filters.tag_ids.length);
    }
    
    // Count total results
    const countStmt = db.prepare(`
      SELECT COUNT(*) as total FROM restaurants r ${whereClause}
    `);
    const totalResult = countStmt.get(...queryParams) as { total: number };
    const total = totalResult.total;
    
    // Get paginated results
    const stmt = db.prepare(`
      SELECT r.* FROM restaurants r 
      ${whereClause}
      ORDER BY r.${sort_by} ${sort_order}
      LIMIT ? OFFSET ?
    `);
    
    const restaurants = stmt.all(...queryParams, limit, offset) as Restaurant[];
    
    // Add tags to each restaurant
    const restaurantsWithTags = restaurants.map(restaurant => ({
      ...restaurant,
      tags: this.getRestaurantTags(restaurant.id)
    }));
    
    return { restaurants: restaurantsWithTags, total };
  }

  // Update restaurant
  static update(id: number, restaurantData: UpdateRestaurantData): Restaurant | null {
    const transaction = db.transaction(() => {
      const updateFields: string[] = [];
      const values: any[] = [];
      
      if (restaurantData.name !== undefined) {
        updateFields.push('name = ?');
        values.push(restaurantData.name);
      }
      
      if (restaurantData.cuisine_type !== undefined) {
        updateFields.push('cuisine_type = ?');
        values.push(restaurantData.cuisine_type);
      }
      
      if (restaurantData.address !== undefined) {
        updateFields.push('address = ?');
        values.push(restaurantData.address);
      }
      
      if (restaurantData.phone !== undefined) {
        updateFields.push('phone = ?');
        values.push(restaurantData.phone);
      }
      
      if (restaurantData.price_range !== undefined) {
        updateFields.push('price_range = ?');
        values.push(restaurantData.price_range);
      }
      
      if (restaurantData.is_favorite !== undefined) {
        updateFields.push('is_favorite = ?');
        values.push(restaurantData.is_favorite ? 1 : 0);
      }
      
      if (restaurantData.rating !== undefined) {
        updateFields.push('rating = ?');
        values.push(restaurantData.rating);
      }
      
      if (updateFields.length > 0) {
        values.push(id);
        const stmt = db.prepare(`
          UPDATE restaurants 
          SET ${updateFields.join(', ')}
          WHERE id = ?
        `);
        stmt.run(...values);
      }
      
      // Update tags if provided
      if (restaurantData.tag_ids !== undefined) {
        // Remove existing tags
        const deleteTagsStmt = db.prepare('DELETE FROM restaurant_tags WHERE restaurant_id = ?');
        deleteTagsStmt.run(id);
        
        // Add new tags
        if (restaurantData.tag_ids.length > 0) {
          const tagStmt = db.prepare('INSERT INTO restaurant_tags (restaurant_id, tag_id) VALUES (?, ?)');
          for (const tagId of restaurantData.tag_ids) {
            tagStmt.run(id, tagId);
          }
        }
      }
    });
    
    transaction();
    return this.findById(id);
  }

  // Delete restaurant
  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM restaurants WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Get random restaurant for user
  static getRandomRestaurant(userId: number, excludeRecentDays: number = 7): Restaurant | null {
    const stmt = db.prepare(`
      SELECT r.* FROM restaurants r
      WHERE r.user_id = ?
      AND r.id NOT IN (
        SELECT sh.item_id FROM selection_history sh
        WHERE sh.user_id = ? 
        AND sh.item_type = 'restaurant'
        AND sh.selected_at > datetime('now', '-${excludeRecentDays} days')
      )
      ORDER BY 
        CASE WHEN r.is_favorite = 1 THEN 0 ELSE 1 END,
        CASE WHEN r.rating IS NOT NULL THEN r.rating ELSE 0 END DESC,
        RANDOM()
      LIMIT 1
    `);
    
    const restaurant = stmt.get(userId, userId) as Restaurant | undefined;
    if (!restaurant) return null;
    
    return { ...restaurant, tags: this.getRestaurantTags(restaurant.id) };
  }

  // Get restaurant tags
  private static getRestaurantTags(restaurantId: number): Tag[] {
    const stmt = db.prepare(`
      SELECT t.* FROM tags t
      JOIN restaurant_tags rt ON t.id = rt.tag_id
      WHERE rt.restaurant_id = ?
      ORDER BY t.name
    `);
    
    return stmt.all(restaurantId) as Tag[];
  }

  // Get cuisine types for user
  static getCuisineTypes(userId: number): string[] {
    const stmt = db.prepare(`
      SELECT DISTINCT cuisine_type 
      FROM restaurants 
      WHERE user_id = ? AND cuisine_type IS NOT NULL
      ORDER BY cuisine_type
    `);
    
    const results = stmt.all(userId) as { cuisine_type: string }[];
    return results.map(r => r.cuisine_type);
  }

  // Get price ranges for user
  static getPriceRanges(userId: number): string[] {
    const stmt = db.prepare(`
      SELECT DISTINCT price_range 
      FROM restaurants 
      WHERE user_id = ? AND price_range IS NOT NULL
      ORDER BY 
        CASE price_range
          WHEN '$' THEN 1
          WHEN '$$' THEN 2
          WHEN '$$$' THEN 3
          WHEN '$$$$' THEN 4
        END
    `);
    
    const results = stmt.all(userId) as { price_range: string }[];
    return results.map(r => r.price_range);
  }

  // Get restaurant statistics
  static getStats(userId: number) {
    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_favorite = 1 THEN 1 END) as favorites,
        AVG(rating) as avg_rating,
        COUNT(DISTINCT cuisine_type) as cuisine_types,
        COUNT(DISTINCT price_range) as price_ranges
      FROM restaurants 
      WHERE user_id = ?
    `);
    
    return stmt.get(userId);
  }

  // Get restaurants by rating
  static getTopRated(userId: number, limit: number = 5): Restaurant[] {
    const stmt = db.prepare(`
      SELECT r.* FROM restaurants r
      WHERE r.user_id = ? AND r.rating IS NOT NULL
      ORDER BY r.rating DESC, r.name
      LIMIT ?
    `);
    
    const restaurants = stmt.all(userId, limit) as Restaurant[];
    
    return restaurants.map(restaurant => ({
      ...restaurant,
      tags: this.getRestaurantTags(restaurant.id)
    }));
  }
}