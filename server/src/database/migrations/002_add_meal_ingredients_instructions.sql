-- Migration: Add ingredients and instructions to meals table
-- Version: 002
-- Description: Adds ingredients and instructions columns to support comprehensive meal data

-- Add ingredients column (JSON array)
ALTER TABLE meals ADD COLUMN ingredients TEXT;

-- Add instructions column (JSON array)  
ALTER TABLE meals ADD COLUMN instructions TEXT;

-- Update existing meals to have empty arrays for ingredients and instructions
UPDATE meals SET 
  ingredients = '[]',
  instructions = '[]'
WHERE ingredients IS NULL OR instructions IS NULL;