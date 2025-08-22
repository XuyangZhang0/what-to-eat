-- Migration: Add user_favorites table for cross-user favoriting
-- Version: 003
-- Description: Creates user_favorites table to allow users to favorite meals/restaurants from other users

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  item_type TEXT NOT NULL CHECK(item_type IN ('meal', 'restaurant')),
  item_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, item_type, item_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_item_type ON user_favorites(item_type);
CREATE INDEX IF NOT EXISTS idx_user_favorites_composite ON user_favorites(user_id, item_type, item_id);