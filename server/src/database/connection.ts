import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Handle __dirname in both ES modules and tests
let currentDir: string;
try {
  // Use eval to bypass TypeScript checking for tests
  const __filename = fileURLToPath(eval('import.meta.url'));
  currentDir = dirname(__filename);
} catch {
  // Fallback for test environment
  currentDir = process.cwd() + '/src/database';
}

interface DatabaseConfig {
  path: string;
  verbose?: boolean;
}

class DatabaseManager {
  private static instance: DatabaseManager;
  private db: Database.Database;

  private constructor(config: DatabaseConfig) {
    this.db = new Database(config.path, {
      verbose: config.verbose ? console.log : undefined,
    });
    
    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');
    
    // Optimize SQLite settings
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('cache_size = 1000');
    this.db.pragma('temp_store = MEMORY');
  }

  public static getInstance(config?: DatabaseConfig): DatabaseManager {
    if (!DatabaseManager.instance) {
      if (!config) {
        throw new Error('Database configuration required for first initialization');
      }
      DatabaseManager.instance = new DatabaseManager(config);
    }
    return DatabaseManager.instance;
  }

  public getDatabase(): Database.Database {
    return this.db;
  }

  public async migrate(): Promise<void> {
    const schemaPath = join(currentDir, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    try {
      // Execute the entire schema as one transaction
      this.db.exec(schema);
      console.log('Database migration completed successfully');
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  }

  public close(): void {
    this.db.close();
  }

  // Transaction wrapper
  public transaction<T>(fn: (db: Database.Database) => T): T {
    const transaction = this.db.transaction(fn);
    return transaction(this.db);
  }

  // Prepared statement cache
  private stmtCache = new Map<string, Database.Statement>();

  public prepare(sql: string): Database.Statement {
    if (!this.stmtCache.has(sql)) {
      this.stmtCache.set(sql, this.db.prepare(sql));
    }
    return this.stmtCache.get(sql)!;
  }
}

// Default database instance
const databasePath = process.env.DATABASE_PATH || './data/database.db';
const dbManager = DatabaseManager.getInstance({
  path: databasePath,
  verbose: process.env.NODE_ENV === 'development'
});

export const db = dbManager.getDatabase();
export default dbManager;
export { DatabaseManager };