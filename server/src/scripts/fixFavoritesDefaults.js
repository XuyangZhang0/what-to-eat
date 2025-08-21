import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Open database
const dbPath = path.resolve(__dirname, '../../data/database.db');
const db = new Database(dbPath);

try {
  console.log('🔧 Fixing favorites defaults...');
  
  // Update all meals to have is_favorite = false unless they are user-created content
  // For simplicity, we'll set all seeded content to is_favorite = false
  // Users can manually favorite what they want
  
  const mealUpdateStmt = db.prepare(`
    UPDATE meals 
    SET is_favorite = 0 
    WHERE is_favorite = 1
  `);
  
  const restaurantUpdateStmt = db.prepare(`
    UPDATE restaurants 
    SET is_favorite = 0 
    WHERE is_favorite = 1
  `);
  
  const mealResult = mealUpdateStmt.run();
  const restaurantResult = restaurantUpdateStmt.run();
  
  console.log(`✅ Updated ${mealResult.changes} meals to is_favorite = false`);
  console.log(`✅ Updated ${restaurantResult.changes} restaurants to is_favorite = false`);
  
  console.log('🎉 Favorites defaults fixed successfully!');
  
} catch (error) {
  console.error('❌ Error fixing favorites defaults:', error);
  process.exit(1);
} finally {
  db.close();
}