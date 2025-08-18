-- Database schema for What to Eat app

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  preferences TEXT DEFAULT '{}', -- JSON string for user preferences
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Meals table
CREATE TABLE IF NOT EXISTS meals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cuisine_type TEXT,
  difficulty_level TEXT CHECK(difficulty_level IN ('easy', 'medium', 'hard')),
  prep_time INTEGER, -- in minutes
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  cuisine_type TEXT,
  address TEXT,
  phone TEXT,
  price_range TEXT CHECK(price_range IN ('$', '$$', '$$$', '$$$$')),
  is_favorite BOOLEAN DEFAULT FALSE,
  rating REAL CHECK(rating >= 0 AND rating <= 5),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#3B82F6', -- hex color code
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Meal tags junction table
CREATE TABLE IF NOT EXISTS meal_tags (
  meal_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (meal_id, tag_id),
  FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Restaurant tags junction table
CREATE TABLE IF NOT EXISTS restaurant_tags (
  restaurant_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (restaurant_id, tag_id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Selection history table
CREATE TABLE IF NOT EXISTS selection_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  item_type TEXT NOT NULL CHECK(item_type IN ('meal', 'restaurant')),
  item_id INTEGER NOT NULL,
  selected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_user_id ON restaurants(user_id);
CREATE INDEX IF NOT EXISTS idx_selection_history_user_id ON selection_history(user_id);
CREATE INDEX IF NOT EXISTS idx_selection_history_selected_at ON selection_history(selected_at);
CREATE INDEX IF NOT EXISTS idx_meals_cuisine_type ON meals(cuisine_type);
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine_type ON restaurants(cuisine_type);
CREATE INDEX IF NOT EXISTS idx_meals_is_favorite ON meals(is_favorite);
CREATE INDEX IF NOT EXISTS idx_restaurants_is_favorite ON restaurants(is_favorite);

-- Triggers to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_users_updated_at
  AFTER UPDATE ON users
  FOR EACH ROW
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_meals_updated_at
  AFTER UPDATE ON meals
  FOR EACH ROW
BEGIN
  UPDATE meals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_restaurants_updated_at
  AFTER UPDATE ON restaurants
  FOR EACH ROW
BEGIN
  UPDATE restaurants SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;