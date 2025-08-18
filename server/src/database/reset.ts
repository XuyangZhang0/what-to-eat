import dotenv from 'dotenv';
import { unlink, existsSync } from 'fs';
import { promisify } from 'util';
import dbManager from './connection.js';
import { seedDatabase } from './seed.js';

// Load environment variables
dotenv.config();

const unlinkAsync = promisify(unlink);

async function resetDatabase() {
  try {
    console.log('🔄 Starting database reset...');
    
    // Close any existing database connection
    try {
      dbManager.close();
    } catch (error) {
      // Connection might already be closed or not exist
      console.log('  • Database connection already closed');
    }
    
    // Get database path
    const databasePath = process.env.DATABASE_PATH || './data/database.db';
    
    // Remove existing database file if it exists
    if (existsSync(databasePath)) {
      await unlinkAsync(databasePath);
      console.log('  ✓ Removed existing database file');
    } else {
      console.log('  • No existing database file found');
    }
    
    console.log('  ✓ Database reset completed');
    console.log('');
    
    // Run migration and seeding
    console.log('🔧 Running migration and seeding...');
    await seedDatabase();
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  }
}

// Run reset if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  resetDatabase();
}

export { resetDatabase };