// Debug script to investigate favorite issues with restaurants starting with "Yogi" and "MLBB"
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Connect to database
const dbPath = join(__dirname, 'data', 'database.db');
const db = new Database(dbPath);

console.log('🔍 Investigating favorite issues with restaurants starting with "Yogi" and "MLBB"');
console.log('Database path:', dbPath);
console.log('================================================================================');

try {
  // 1. Find all restaurants starting with "Yogi" and "MLBB"
  console.log('\n1. Finding restaurants starting with "Yogi" and "MLBB":');
  const problematicRestaurants = db.prepare(`
    SELECT id, user_id, name, cuisine_type, address, is_favorite, created_at
    FROM restaurants 
    WHERE name LIKE 'Yogi%' OR name LIKE 'MLBB%'
    ORDER BY name
  `).all();

  if (problematicRestaurants.length === 0) {
    console.log('   No restaurants found starting with "Yogi" or "MLBB"');
  } else {
    console.log('   Found restaurants:');
    problematicRestaurants.forEach(r => {
      console.log(`   - ID: ${r.id}, User: ${r.user_id}, Name: "${r.name}", Favorite: ${r.is_favorite}, Created: ${r.created_at}`);
    });
  }

  // 2. Check all restaurants to see the pattern
  console.log('\n2. All restaurants in database:');
  const allRestaurants = db.prepare(`
    SELECT id, user_id, name, cuisine_type, is_favorite
    FROM restaurants 
    ORDER BY id
  `).all();
  
  console.log(`   Total restaurants: ${allRestaurants.length}`);
  allRestaurants.forEach(r => {
    console.log(`   - ID: ${r.id}, User: ${r.user_id}, Name: "${r.name}", Favorite: ${r.is_favorite}`);
  });

  // 3. Check user_favorites table for these specific restaurants
  console.log('\n3. Checking user_favorites table for problematic restaurants:');
  if (problematicRestaurants.length > 0) {
    const restaurantIds = problematicRestaurants.map(r => r.id);
    const placeholders = restaurantIds.map(() => '?').join(',');
    
    const userFavorites = db.prepare(`
      SELECT uf.*, r.name as restaurant_name
      FROM user_favorites uf
      JOIN restaurants r ON uf.item_id = r.id
      WHERE uf.item_type = 'restaurant' AND uf.item_id IN (${placeholders})
      ORDER BY uf.item_id
    `).all(...restaurantIds);

    if (userFavorites.length === 0) {
      console.log('   No entries found in user_favorites table for these restaurants');
    } else {
      console.log('   Found user_favorites entries:');
      userFavorites.forEach(uf => {
        console.log(`   - User: ${uf.user_id}, Restaurant: ${uf.item_id} ("${uf.restaurant_name}"), Created: ${uf.created_at}`);
      });
    }
  }

  // 4. Check database schema for both tables
  console.log('\n4. Database schema check:');
  
  const restaurantsSchema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='restaurants'").get();
  console.log('   Restaurants table schema:');
  console.log('   ', restaurantsSchema?.sql || 'Table not found');

  const userFavoritesSchema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='user_favorites'").get();
  console.log('   User_favorites table schema:');
  console.log('   ', userFavoritesSchema?.sql || 'Table not found');

  // 5. Check for any constraints or triggers
  console.log('\n5. Database constraints and triggers:');
  const constraints = db.prepare(`
    SELECT name, type, sql 
    FROM sqlite_master 
    WHERE type IN ('trigger', 'index') 
    AND (sql LIKE '%restaurants%' OR sql LIKE '%user_favorites%')
  `).all();
  
  if (constraints.length === 0) {
    console.log('   No triggers or relevant indexes found');
  } else {
    constraints.forEach(c => {
      console.log(`   - ${c.type}: ${c.name}`);
      console.log(`     SQL: ${c.sql}`);
    });
  }

  // 6. Check successful favorites for comparison
  console.log('\n6. Checking successful favorites (IDs 11, 12, 13) for comparison:');
  const successfulRestaurants = db.prepare(`
    SELECT id, user_id, name, is_favorite
    FROM restaurants 
    WHERE id IN (11, 12, 13)
    ORDER BY id
  `).all();

  if (successfulRestaurants.length > 0) {
    console.log('   Successful restaurants:');
    successfulRestaurants.forEach(r => {
      console.log(`   - ID: ${r.id}, User: ${r.user_id}, Name: "${r.name}", Favorite: ${r.is_favorite}`);
    });

    // Check their user_favorites entries
    const successfulFavorites = db.prepare(`
      SELECT uf.*, r.name as restaurant_name
      FROM user_favorites uf
      JOIN restaurants r ON uf.item_id = r.id
      WHERE uf.item_type = 'restaurant' AND uf.item_id IN (11, 12, 13)
      ORDER BY uf.item_id
    `).all();

    if (successfulFavorites.length > 0) {
      console.log('   Their user_favorites entries:');
      successfulFavorites.forEach(uf => {
        console.log(`   - User: ${uf.user_id}, Restaurant: ${uf.item_id} ("${uf.restaurant_name}"), Created: ${uf.created_at}`);
      });
    }
  }

  // 7. Test inserting into user_favorites for problematic restaurants
  console.log('\n7. Testing insert into user_favorites for problematic restaurants:');
  if (problematicRestaurants.length > 0) {
    const testUserId = 1; // Assuming user ID 1 exists
    
    for (const restaurant of problematicRestaurants) {
      try {
        // First check if user exists
        const userExists = db.prepare('SELECT id FROM users WHERE id = ?').get(testUserId);
        if (!userExists) {
          console.log(`   - Cannot test - User ${testUserId} does not exist`);
          continue;
        }

        // Check if already exists
        const exists = db.prepare(`
          SELECT id FROM user_favorites 
          WHERE user_id = ? AND item_type = 'restaurant' AND item_id = ?
        `).get(testUserId, restaurant.id);

        if (exists) {
          console.log(`   - Restaurant ${restaurant.id} ("${restaurant.name}") already favorited by user ${testUserId}`);
          continue;
        }

        // Try to insert
        const result = db.prepare(`
          INSERT INTO user_favorites (user_id, item_type, item_id, created_at)
          VALUES (?, 'restaurant', ?, datetime('now'))
        `).run(testUserId, restaurant.id);

        console.log(`   - ✅ Successfully inserted favorite for restaurant ${restaurant.id} ("${restaurant.name}") - Changes: ${result.changes}`);
        
        // Clean up the test data
        db.prepare(`
          DELETE FROM user_favorites 
          WHERE user_id = ? AND item_type = 'restaurant' AND item_id = ?
        `).run(testUserId, restaurant.id);
        
      } catch (error) {
        console.log(`   - ❌ Failed to insert favorite for restaurant ${restaurant.id} ("${restaurant.name}"): ${error.message}`);
      }
    }
  }

  // 8. Check if there are any users in the database
  console.log('\n8. Checking users in database:');
  const users = db.prepare('SELECT id, username, email, created_at FROM users ORDER BY id').all();
  if (users.length === 0) {
    console.log('   No users found in database');
  } else {
    console.log(`   Found ${users.length} users:`);
    users.forEach(u => {
      console.log(`   - ID: ${u.id}, Username: "${u.username}", Email: "${u.email}", Created: ${u.created_at}`);
    });
  }

} catch (error) {
  console.error('Error during investigation:', error);
} finally {
  db.close();
}

console.log('\n================================================================================');
console.log('Investigation complete!');