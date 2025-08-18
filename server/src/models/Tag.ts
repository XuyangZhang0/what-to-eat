import { db } from '@/database/connection.js';
import { Tag, CreateTagData, UpdateTagData } from './types.js';

export class TagModel {
  // Create a new tag
  static create(tagData: CreateTagData): Tag {
    const stmt = db.prepare(`
      INSERT INTO tags (name, color)
      VALUES (?, ?)
    `);
    
    const result = stmt.run(
      tagData.name,
      tagData.color || '#3B82F6'
    );
    
    return this.findById(result.lastInsertRowid as number)!;
  }

  // Find tag by ID
  static findById(id: number): Tag | null {
    const stmt = db.prepare('SELECT * FROM tags WHERE id = ?');
    return stmt.get(id) as Tag | null;
  }

  // Find tag by name
  static findByName(name: string): Tag | null {
    const stmt = db.prepare('SELECT * FROM tags WHERE name = ? COLLATE NOCASE');
    return stmt.get(name) as Tag | null;
  }

  // Get all tags
  static findAll(): Tag[] {
    const stmt = db.prepare('SELECT * FROM tags ORDER BY name');
    return stmt.all() as Tag[];
  }

  // Update tag
  static update(id: number, tagData: UpdateTagData): Tag | null {
    const updateFields: string[] = [];
    const values: any[] = [];
    
    if (tagData.name !== undefined) {
      updateFields.push('name = ?');
      values.push(tagData.name);
    }
    
    if (tagData.color !== undefined) {
      updateFields.push('color = ?');
      values.push(tagData.color);
    }
    
    if (updateFields.length === 0) {
      return this.findById(id);
    }
    
    values.push(id);
    
    const stmt = db.prepare(`
      UPDATE tags 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `);
    
    const result = stmt.run(...values);
    
    if (result.changes > 0) {
      return this.findById(id);
    }
    
    return null;
  }

  // Delete tag
  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM tags WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Check if tag name exists
  static nameExists(name: string, excludeId?: number): boolean {
    let stmt;
    let params;
    
    if (excludeId) {
      stmt = db.prepare('SELECT 1 FROM tags WHERE name = ? COLLATE NOCASE AND id != ?');
      params = [name, excludeId];
    } else {
      stmt = db.prepare('SELECT 1 FROM tags WHERE name = ? COLLATE NOCASE');
      params = [name];
    }
    
    return !!stmt.get(...params);
  }

  // Get tags used by meals
  static getMealTags(): Tag[] {
    const stmt = db.prepare(`
      SELECT DISTINCT t.* FROM tags t
      JOIN meal_tags mt ON t.id = mt.tag_id
      ORDER BY t.name
    `);
    
    return stmt.all() as Tag[];
  }

  // Get tags used by restaurants
  static getRestaurantTags(): Tag[] {
    const stmt = db.prepare(`
      SELECT DISTINCT t.* FROM tags t
      JOIN restaurant_tags rt ON t.id = rt.tag_id
      ORDER BY t.name
    `);
    
    return stmt.all() as Tag[];
  }

  // Get tag usage statistics
  static getUsageStats(id: number) {
    const mealCountStmt = db.prepare(`
      SELECT COUNT(*) as meal_count FROM meal_tags WHERE tag_id = ?
    `);
    
    const restaurantCountStmt = db.prepare(`
      SELECT COUNT(*) as restaurant_count FROM restaurant_tags WHERE tag_id = ?
    `);
    
    const mealResult = mealCountStmt.get(id) as { meal_count: number };
    const restaurantResult = restaurantCountStmt.get(id) as { restaurant_count: number };
    
    return {
      meal_count: mealResult.meal_count,
      restaurant_count: restaurantResult.restaurant_count,
      total_usage: mealResult.meal_count + restaurantResult.restaurant_count
    };
  }

  // Get unused tags
  static getUnusedTags(): Tag[] {
    const stmt = db.prepare(`
      SELECT t.* FROM tags t
      WHERE t.id NOT IN (
        SELECT DISTINCT tag_id FROM meal_tags
        UNION
        SELECT DISTINCT tag_id FROM restaurant_tags
      )
      ORDER BY t.name
    `);
    
    return stmt.all() as Tag[];
  }

  // Get most used tags
  static getMostUsedTags(limit: number = 10): Array<Tag & { usage_count: number }> {
    const stmt = db.prepare(`
      SELECT t.*, 
        (COALESCE(meal_usage.count, 0) + COALESCE(restaurant_usage.count, 0)) as usage_count
      FROM tags t
      LEFT JOIN (
        SELECT tag_id, COUNT(*) as count FROM meal_tags GROUP BY tag_id
      ) meal_usage ON t.id = meal_usage.tag_id
      LEFT JOIN (
        SELECT tag_id, COUNT(*) as count FROM restaurant_tags GROUP BY tag_id
      ) restaurant_usage ON t.id = restaurant_usage.tag_id
      WHERE usage_count > 0
      ORDER BY usage_count DESC, t.name
      LIMIT ?
    `);
    
    return stmt.all(limit) as Array<Tag & { usage_count: number }>;
  }
}