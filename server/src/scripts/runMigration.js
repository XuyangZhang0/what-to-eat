import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Open database
const dbPath = path.resolve(__dirname, '../../data/database.db');
const db = new Database(dbPath);

try {
  console.log('Running migration: Add ingredients and instructions to meals...');
  
  // Check if columns already exist
  const tableInfo = db.prepare("PRAGMA table_info(meals)").all();
  const hasIngredients = tableInfo.some(col => col.name === 'ingredients');
  const hasInstructions = tableInfo.some(col => col.name === 'instructions');
  
  if (!hasIngredients) {
    console.log('Adding ingredients column...');
    db.exec('ALTER TABLE meals ADD COLUMN ingredients TEXT');
  } else {
    console.log('Ingredients column already exists');
  }
  
  if (!hasInstructions) {
    console.log('Adding instructions column...');
    db.exec('ALTER TABLE meals ADD COLUMN instructions TEXT');
  } else {
    console.log('Instructions column already exists');
  }
  
  // Update existing meals to have empty arrays
  console.log('Updating existing meals with empty arrays...');
  db.exec(`
    UPDATE meals SET 
      ingredients = '[]',
      instructions = '[]'
    WHERE ingredients IS NULL OR instructions IS NULL
  `);
  
  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Migration failed:', error);
} finally {
  db.close();
}