import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';
import dotenv from 'dotenv';
import dbManager from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

async function runMigration() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Ensure data directory exists
    const dataDir = dirname(process.env.DATABASE_PATH || './data/database.db');
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
      console.log(`📁 Created data directory: ${dataDir}`);
    }
    
    // Run migration
    await dbManager.migrate();
    
    console.log('✅ Database migration completed successfully!');
    
    // Close database connection
    dbManager.close();
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export { runMigration };