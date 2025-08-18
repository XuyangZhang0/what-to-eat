import { db } from '@/database/connection.js';
import { User, CreateUserData, UpdateUserData } from './types.js';

export class UserModel {
  // Create a new user
  static create(userData: CreateUserData): User {
    const stmt = db.prepare(`
      INSERT INTO users (username, email, password_hash, preferences)
      VALUES (?, ?, ?, ?)
    `);
    
    const preferences = JSON.stringify(userData.preferences || {});
    const result = stmt.run(
      userData.username,
      userData.email,
      userData.password_hash,
      preferences
    );
    
    return this.findById(result.lastInsertRowid as number)!;
  }

  // Find user by ID
  static findById(id: number): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(id) as User | undefined;
    
    if (user) {
      try {
        // Parse preferences JSON
        const parsedPreferences = JSON.parse(user.preferences);
        return { ...user, preferences: JSON.stringify(parsedPreferences) };
      } catch {
        return { ...user, preferences: '{}' };
      }
    }
    
    return null;
  }

  // Find user by email
  static findByEmail(email: string): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email) as User | undefined;
    
    if (user) {
      try {
        const parsedPreferences = JSON.parse(user.preferences);
        return { ...user, preferences: JSON.stringify(parsedPreferences) };
      } catch {
        return { ...user, preferences: '{}' };
      }
    }
    
    return null;
  }

  // Find user by username
  static findByUsername(username: string): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username) as User | undefined;
    
    if (user) {
      try {
        const parsedPreferences = JSON.parse(user.preferences);
        return { ...user, preferences: JSON.stringify(parsedPreferences) };
      } catch {
        return { ...user, preferences: '{}' };
      }
    }
    
    return null;
  }

  // Update user
  static update(id: number, userData: UpdateUserData): User | null {
    const updateFields: string[] = [];
    const values: any[] = [];
    
    if (userData.username !== undefined) {
      updateFields.push('username = ?');
      values.push(userData.username);
    }
    
    if (userData.email !== undefined) {
      updateFields.push('email = ?');
      values.push(userData.email);
    }
    
    if (userData.password_hash !== undefined) {
      updateFields.push('password_hash = ?');
      values.push(userData.password_hash);
    }
    
    if (userData.preferences !== undefined) {
      updateFields.push('preferences = ?');
      values.push(JSON.stringify(userData.preferences));
    }
    
    if (updateFields.length === 0) {
      return this.findById(id);
    }
    
    values.push(id);
    
    const stmt = db.prepare(`
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `);
    
    const result = stmt.run(...values);
    
    if (result.changes > 0) {
      return this.findById(id);
    }
    
    return null;
  }

  // Delete user
  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Get all users (admin function)
  static findAll(): User[] {
    const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
    const users = stmt.all() as User[];
    
    return users.map(user => {
      try {
        const parsedPreferences = JSON.parse(user.preferences);
        return { ...user, preferences: JSON.stringify(parsedPreferences) };
      } catch {
        return { ...user, preferences: '{}' };
      }
    });
  }

  // Check if email exists
  static emailExists(email: string): boolean {
    const stmt = db.prepare('SELECT 1 FROM users WHERE email = ?');
    return !!stmt.get(email);
  }

  // Check if username exists
  static usernameExists(username: string): boolean {
    const stmt = db.prepare('SELECT 1 FROM users WHERE username = ?');
    return !!stmt.get(username);
  }

  // Get user preferences
  static getPreferences(id: number): Record<string, any> {
    const user = this.findById(id);
    if (!user) return {};
    
    try {
      return JSON.parse(user.preferences);
    } catch {
      return {};
    }
  }

  // Update user preferences
  static updatePreferences(id: number, preferences: Record<string, any>): User | null {
    return this.update(id, { preferences });
  }
}