-- Migration: Add opening_hours column to restaurants table
-- Date: 2025-08-19

-- Add opening_hours column to restaurants table
ALTER TABLE restaurants ADD COLUMN opening_hours TEXT DEFAULT '{}';

-- Update the column comment for clarity
-- Note: SQLite doesn't support column comments directly, but this serves as documentation
-- opening_hours: JSON string for weekly opening hours with format:
-- {
--   "monday": {"open": "09:00", "close": "22:00", "is_closed": false},
--   "tuesday": {"open": "09:00", "close": "22:00", "is_closed": false},
--   ...etc
-- }