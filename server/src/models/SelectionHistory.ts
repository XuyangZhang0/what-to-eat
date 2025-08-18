import { db } from '@/database/connection.js';
import { SelectionHistory, CreateSelectionHistoryData } from './types.js';

export class SelectionHistoryModel {
  // Create a new selection history entry
  static create(historyData: CreateSelectionHistoryData): SelectionHistory {
    const stmt = db.prepare(`
      INSERT INTO selection_history (user_id, item_type, item_id)
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(
      historyData.user_id,
      historyData.item_type,
      historyData.item_id
    );
    
    return this.findById(result.lastInsertRowid as number)!;
  }

  // Find selection history by ID
  static findById(id: number): SelectionHistory | null {
    const stmt = db.prepare('SELECT * FROM selection_history WHERE id = ?');
    return stmt.get(id) as SelectionHistory | null;
  }

  // Get user's selection history with pagination
  static findByUserId(
    userId: number, 
    page: number = 1, 
    limit: number = 50
  ): { history: SelectionHistory[], total: number } {
    const offset = (page - 1) * limit;
    
    // Count total results
    const countStmt = db.prepare(`
      SELECT COUNT(*) as total FROM selection_history WHERE user_id = ?
    `);
    const totalResult = countStmt.get(userId) as { total: number };
    const total = totalResult.total;
    
    // Get paginated results
    const stmt = db.prepare(`
      SELECT * FROM selection_history 
      WHERE user_id = ?
      ORDER BY selected_at DESC
      LIMIT ? OFFSET ?
    `);
    
    const history = stmt.all(userId, limit, offset) as SelectionHistory[];
    
    return { history, total };
  }

  // Get recent selections for a user
  static getRecentSelections(userId: number, days: number = 7): SelectionHistory[] {
    const stmt = db.prepare(`
      SELECT * FROM selection_history 
      WHERE user_id = ? 
      AND selected_at > datetime('now', '-${days} days')
      ORDER BY selected_at DESC
    `);
    
    return stmt.all(userId) as SelectionHistory[];
  }

  // Get recent meal selections
  static getRecentMealSelections(userId: number, days: number = 7): number[] {
    const stmt = db.prepare(`
      SELECT DISTINCT item_id FROM selection_history 
      WHERE user_id = ? 
      AND item_type = 'meal'
      AND selected_at > datetime('now', '-${days} days')
    `);
    
    const results = stmt.all(userId) as { item_id: number }[];
    return results.map(r => r.item_id);
  }

  // Get recent restaurant selections
  static getRecentRestaurantSelections(userId: number, days: number = 7): number[] {
    const stmt = db.prepare(`
      SELECT DISTINCT item_id FROM selection_history 
      WHERE user_id = ? 
      AND item_type = 'restaurant'
      AND selected_at > datetime('now', '-${days} days')
    `);
    
    const results = stmt.all(userId) as { item_id: number }[];
    return results.map(r => r.item_id);
  }

  // Get selection statistics for user
  static getSelectionStats(userId: number, days: number = 30) {
    const stmt = db.prepare(`
      SELECT 
        item_type,
        COUNT(*) as count,
        DATE(selected_at) as date
      FROM selection_history 
      WHERE user_id = ? 
      AND selected_at > datetime('now', '-${days} days')
      GROUP BY item_type, DATE(selected_at)
      ORDER BY date DESC
    `);
    
    return stmt.all(userId);
  }

  // Get most selected items
  static getMostSelected(userId: number, itemType: 'meal' | 'restaurant', limit: number = 5) {
    const stmt = db.prepare(`
      SELECT 
        item_id,
        COUNT(*) as selection_count,
        MAX(selected_at) as last_selected
      FROM selection_history 
      WHERE user_id = ? AND item_type = ?
      GROUP BY item_id
      ORDER BY selection_count DESC, last_selected DESC
      LIMIT ?
    `);
    
    return stmt.all(userId, itemType, limit);
  }

  // Delete old selection history
  static deleteOldHistory(days: number = 365): number {
    const stmt = db.prepare(`
      DELETE FROM selection_history 
      WHERE selected_at < datetime('now', '-${days} days')
    `);
    
    const result = stmt.run();
    return result.changes;
  }

  // Delete user's selection history
  static deleteByUserId(userId: number): number {
    const stmt = db.prepare('DELETE FROM selection_history WHERE user_id = ?');
    const result = stmt.run(userId);
    return result.changes;
  }

  // Check if item was recently selected
  static wasRecentlySelected(
    userId: number, 
    itemType: 'meal' | 'restaurant', 
    itemId: number, 
    days: number = 7
  ): boolean {
    const stmt = db.prepare(`
      SELECT 1 FROM selection_history 
      WHERE user_id = ? 
      AND item_type = ? 
      AND item_id = ?
      AND selected_at > datetime('now', '-${days} days')
      LIMIT 1
    `);
    
    return !!stmt.get(userId, itemType, itemId);
  }

  // Get selection frequency for an item
  static getSelectionFrequency(
    userId: number, 
    itemType: 'meal' | 'restaurant', 
    itemId: number
  ): { count: number, last_selected: string | null } {
    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as count,
        MAX(selected_at) as last_selected
      FROM selection_history 
      WHERE user_id = ? AND item_type = ? AND item_id = ?
    `);
    
    const result = stmt.get(userId, itemType, itemId) as { count: number, last_selected: string | null };
    return result;
  }

  // Get daily selection trends
  static getDailyTrends(userId: number, days: number = 30) {
    const stmt = db.prepare(`
      SELECT 
        DATE(selected_at) as date,
        item_type,
        COUNT(*) as count
      FROM selection_history 
      WHERE user_id = ? 
      AND selected_at > datetime('now', '-${days} days')
      GROUP BY DATE(selected_at), item_type
      ORDER BY date DESC
    `);
    
    return stmt.all(userId);
  }
}