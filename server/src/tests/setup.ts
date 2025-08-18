import dotenv from 'dotenv';
import { join } from 'path';

// Load test environment variables
dotenv.config({ path: join(process.cwd(), '.env.test') });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_PATH = ':memory:'; // Use in-memory database for tests
process.env.JWT_SECRET = 'test-jwt-secret';

// Increase timeout for database operations
jest.setTimeout(10000);