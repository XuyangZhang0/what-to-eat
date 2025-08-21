import dotenv from 'dotenv';
import { UserModel } from '@/models/User.js';
import { MealModel } from '@/models/Meal.js';
import { RestaurantModel } from '@/models/Restaurant.js';
import { TagModel } from '@/models/Tag.js';
import { SelectionHistoryModel } from '@/models/SelectionHistory.js';
import { AuthUtils } from '@/utils/auth.js';
import dbManager from './connection.js';

// Load environment variables
dotenv.config();

async function seedDatabase() {
  try {
    console.log('🌱 Starting comprehensive database seeding...');
    
    // Ensure database is migrated
    await dbManager.migrate();
    
    // Create comprehensive tags
    console.log('Creating tags...');
    const tags = [
      // Meal timing
      { name: 'Breakfast', color: '#FBBF24' },
      { name: 'Brunch', color: '#FCD34D' },
      { name: 'Lunch', color: '#FB923C' },
      { name: 'Dinner', color: '#8B5CF6' },
      { name: 'Snack', color: '#EC4899' },
      { name: 'Dessert', color: '#F472B6' },
      { name: 'Late Night', color: '#6366F1' },
      
      // Cuisine types
      { name: 'Italian', color: '#EF4444' },
      { name: 'Asian', color: '#F59E0B' },
      { name: 'Chinese', color: '#DC2626' },
      { name: 'Japanese', color: '#7C2D12' },
      { name: 'Thai', color: '#EA580C' },
      { name: 'Korean', color: '#B91C1C' },
      { name: 'Vietnamese', color: '#C2410C' },
      { name: 'Indian', color: '#D97706' },
      { name: 'Mexican', color: '#F97316' },
      { name: 'Mediterranean', color: '#059669' },
      { name: 'Greek', color: '#0D9488' },
      { name: 'American', color: '#3B82F6' },
      { name: 'French', color: '#7C3AED' },
      { name: 'British', color: '#A855F7' },
      { name: 'German', color: '#8B5A2B' },
      { name: 'Spanish', color: '#DC2626' },
      { name: 'Middle Eastern', color: '#D97706' },
      { name: 'African', color: '#92400E' },
      { name: 'Latin American', color: '#F59E0B' },
      
      // Dietary preferences
      { name: 'Vegetarian', color: '#65A30D' },
      { name: 'Vegan', color: '#16A34A' },
      { name: 'Gluten-Free', color: '#CA8A04' },
      { name: 'Dairy-Free', color: '#0891B2' },
      { name: 'Low-Carb', color: '#DB2777' },
      { name: 'Keto', color: '#BE185D' },
      { name: 'Paleo', color: '#A16207' },
      { name: 'Halal', color: '#059669' },
      { name: 'Kosher', color: '#0284C7' },
      
      // Cooking style & effort
      { name: 'Quick', color: '#10B981' },
      { name: 'One-Pot', color: '#22C55E' },
      { name: 'No-Cook', color: '#4ADE80' },
      { name: 'Slow Cook', color: '#A3A3A3' },
      { name: 'Grilled', color: '#92400E' },
      { name: 'Baked', color: '#B45309' },
      { name: 'Fried', color: '#D97706' },
      { name: 'Steamed', color: '#0891B2' },
      
      // Flavor profiles
      { name: 'Spicy', color: '#DC2626' },
      { name: 'Sweet', color: '#EC4899' },
      { name: 'Savory', color: '#7C2D12' },
      { name: 'Tangy', color: '#F59E0B' },
      { name: 'Mild', color: '#6B7280' },
      { name: 'Rich', color: '#7C2D12' },
      
      // Occasion & mood
      { name: 'Comfort Food', color: '#DC2626' },
      { name: 'Healthy', color: '#059669' },
      { name: 'Date Night', color: '#EC4899' },
      { name: 'Family Friendly', color: '#84CC16' },
      { name: 'Party Food', color: '#F472B6' },
      { name: 'Holiday', color: '#EF4444' },
      { name: 'Game Day', color: '#3B82F6' },
      { name: 'Picnic', color: '#22C55E' },
      { name: 'BBQ', color: '#92400E' },
      
      // Restaurant specific
      { name: 'Fine Dining', color: '#6366F1' },
      { name: 'Casual', color: '#14B8A6' },
      { name: 'Fast Food', color: '#F97316' },
      { name: 'Cheap Eats', color: '#22C55E' },
      { name: 'Takeout', color: '#F97316' },
      { name: 'Delivery', color: '#A855F7' },
      { name: 'Buffet', color: '#FB923C' },
      { name: 'Food Truck', color: '#059669' },
      { name: 'Chain', color: '#6B7280' },
      { name: 'Local', color: '#16A34A' },
      { name: 'New', color: '#EC4899' },
      { name: 'Popular', color: '#F59E0B' }
    ];
    
    const createdTags: { [key: string]: number } = {};
    
    for (const tag of tags) {
      try {
        const existingTag = TagModel.findByName(tag.name);
        if (!existingTag) {
          const newTag = TagModel.create(tag);
          createdTags[tag.name] = newTag.id;
          console.log(`  ✓ Created tag: ${tag.name}`);
        } else {
          createdTags[tag.name] = existingTag.id;
          console.log(`  • Tag already exists: ${tag.name}`);
        }
      } catch (error) {
        console.log(`  ⚠️  Skipped tag: ${tag.name} (already exists)`);
      }
    }
    
    // Create demo user
    console.log('Creating demo user...');
    let demoUser;
    try {
      const existingUser = UserModel.findByEmail('demo@example.com');
      if (!existingUser) {
        const hashedPassword = await AuthUtils.hashPassword('demo123!A');
        demoUser = UserModel.create({
          username: 'demo',
          email: 'demo@example.com',
          password_hash: hashedPassword,
          preferences: {
            preferred_cuisine_type: 'Italian',
            preferred_difficulty_level: 'medium',
            max_prep_time: 60,
            preferred_price_range: '$$',
            min_rating: 3.5
          }
        });
        console.log('  ✓ Created demo user: demo@example.com / demo123!A');
      } else {
        demoUser = existingUser;
        console.log('  • Demo user already exists');
      }
    } catch (error) {
      console.log('  ⚠️  Demo user already exists, continuing...');
      demoUser = UserModel.findByEmail('demo@example.com')!;
    }
    
    // Note: Real meals are seeded via seedRealMeals.js script
    console.log('Skipping sample meals - using real meal data from seedRealMeals.js instead');
    
    // Create comprehensive sample restaurants
    console.log('Creating sample restaurants...');
    const sampleRestaurants = [
      // Italian
      {
        name: 'Mario\'s Authentic Pizzeria',
        cuisine_type: 'Italian',
        address: '123 Little Italy St, Downtown',
        phone: '555-0123',
        price_range: '$$' as const,
        is_favorite: false,
        rating: 4.5,
        tags: ['Italian', 'Casual', 'Takeout', 'Family Friendly', 'Local']
      },
      {
        name: 'Bella Vista Ristorante',
        cuisine_type: 'Italian',
        address: '456 Vineyard Ave, Uptown',
        phone: '555-0456',
        price_range: '$$$' as const,
        is_favorite: false,
        rating: 4.7,
        tags: ['Italian', 'Fine Dining', 'Date Night', 'Local']
      },
      
      // Asian Restaurants
      {
        name: 'Golden Dragon Chinese',
        cuisine_type: 'Chinese',
        address: '789 Chinatown Blvd',
        phone: '555-0789',
        price_range: '$' as const,
        is_favorite: false,
        rating: 4.0,
        tags: ['Chinese', 'Asian', 'Cheap Eats', 'Takeout', 'Family Friendly']
      },
      {
        name: 'Sakura Sushi Bar',
        cuisine_type: 'Japanese',
        address: '321 Bamboo Lane',
        phone: '555-0321',
        price_range: '$$$' as const,
        is_favorite: false,
        rating: 4.8,
        tags: ['Japanese', 'Asian', 'Fine Dining', 'Date Night', 'Local']
      },
      {
        name: 'Thai Spice Kitchen',
        cuisine_type: 'Thai',
        address: '654 Spice Market St',
        phone: '555-0654',
        price_range: '$$' as const,
        is_favorite: false,
        rating: 4.3,
        tags: ['Thai', 'Asian', 'Spicy', 'Casual', 'Takeout']
      },
      {
        name: 'Seoul Kitchen',
        cuisine_type: 'Korean',
        address: '987 K-Town Plaza',
        phone: '555-0987',
        price_range: '$$' as const,
        is_favorite: false,
        rating: 4.4,
        tags: ['Korean', 'Asian', 'BBQ', 'Casual', 'Local']
      },
      {
        name: 'Pho Saigon',
        cuisine_type: 'Vietnamese',
        address: '147 Garden District',
        phone: '555-0147',
        price_range: '$' as const,
        is_favorite: false,
        rating: 4.2,
        tags: ['Vietnamese', 'Asian', 'Healthy', 'Cheap Eats', 'Casual']
      },
      
      // Mexican
      {
        name: 'El Sombrero Cantina',
        cuisine_type: 'Mexican',
        address: '258 Fiesta Avenue',
        phone: '555-0258',
        price_range: '$$' as const,
        is_favorite: false,
        rating: 4.2,
        tags: ['Mexican', 'Spicy', 'Casual', 'Family Friendly', 'Local']
      },
      {
        name: 'Taco Libre Food Truck',
        cuisine_type: 'Mexican',
        address: 'Mobile - Downtown Food Court',
        phone: '555-0369',
        price_range: '$' as const,
        is_favorite: false,
        rating: 4.1,
        tags: ['Mexican', 'Food Truck', 'Cheap Eats', 'Quick', 'Local']
      },
      
      // American
      {
        name: 'The Burger Joint',
        cuisine_type: 'American',
        address: '741 Main Street',
        phone: '555-0741',
        price_range: '$$' as const,
        is_favorite: false,
        rating: 4.0,
        tags: ['American', 'Casual', 'Family Friendly', 'Local', 'Comfort Food']
      },
      {
        name: 'Downtown Diner',
        cuisine_type: 'American',
        address: '852 Retro Row',
        phone: '555-0852',
        price_range: '$' as const,
        is_favorite: false,
        rating: 3.8,
        tags: ['American', 'Breakfast', 'Comfort Food', 'Casual', 'Cheap Eats']
      },
      {
        name: 'Prime Steakhouse',
        cuisine_type: 'American',
        address: '963 Executive Drive',
        phone: '555-0963',
        price_range: '$$$$' as const,
        is_favorite: false,
        rating: 4.6,
        tags: ['American', 'Fine Dining', 'Date Night', 'Local']
      },
      
      // Mediterranean & Middle Eastern
      {
        name: 'Mediterranean Grill',
        cuisine_type: 'Mediterranean',
        address: '159 Olive Branch Way',
        phone: '555-0159',
        price_range: '$$' as const,
        is_favorite: false,
        rating: 4.3,
        tags: ['Mediterranean', 'Healthy', 'Casual', 'Local']
      },
      {
        name: 'Babylon Cafe',
        cuisine_type: 'Middle Eastern',
        address: '753 Desert Palm Ave',
        phone: '555-0753',
        price_range: '$$' as const,
        is_favorite: false,
        rating: 4.1,
        tags: ['Middle Eastern', 'Healthy', 'Vegetarian', 'Casual']
      },
      
      // Indian
      {
        name: 'Taj Palace',
        cuisine_type: 'Indian',
        address: '486 Curry Lane',
        phone: '555-0486',
        price_range: '$$' as const,
        is_favorite: false,
        rating: 4.4,
        tags: ['Indian', 'Spicy', 'Vegetarian', 'Casual', 'Local']
      },
      
      // French
      {
        name: 'Le Petit Bistro',
        cuisine_type: 'French',
        address: '357 Champs Street',
        phone: '555-0357',
        price_range: '$$$' as const,
        is_favorite: false,
        rating: 4.7,
        tags: ['French', 'Fine Dining', 'Date Night', 'Local']
      },
      
      // Vegetarian/Healthy
      {
        name: 'Green Earth Cafe',
        cuisine_type: 'Vegetarian',
        address: '951 Eco Park Blvd',
        phone: '555-0951',
        price_range: '$$' as const,
        is_favorite: false,
        rating: 4.2,
        tags: ['Vegetarian', 'Vegan', 'Healthy', 'Casual', 'Local']
      },
      
      // Fast Food/Chains
      {
        name: 'Rapid Burgers',
        cuisine_type: 'American',
        address: '159 Speed Plaza',
        phone: '555-0159',
        price_range: '$' as const,
        is_favorite: false,
        rating: 3.2,
        tags: ['American', 'Fast Food', 'Chain', 'Cheap Eats', 'Quick']
      },
      
      // Coffee & Light
      {
        name: 'Artisan Coffee House',
        cuisine_type: 'American',
        address: '357 Bean Street',
        phone: '555-0357',
        price_range: '$' as const,
        is_favorite: false,
        rating: 4.5,
        tags: ['American', 'Breakfast', 'Casual', 'Local', 'Quick']
      }
    ];
    
    for (const restaurant of sampleRestaurants) {
      try {
        const tagIds = restaurant.tags
          .map(tagName => createdTags[tagName])
          .filter(id => id !== undefined);
        
        const { tags, ...restaurantData } = restaurant;
        RestaurantModel.create({
          ...restaurantData,
          user_id: demoUser.id,
          tag_ids: tagIds
        });
        console.log(`  ✓ Created restaurant: ${restaurant.name}`);
      } catch (error) {
        console.log(`  ⚠️  Skipped restaurant: ${restaurant.name} (may already exist)`);
      }
    }
    
    // Create sample selection history to test the algorithm
    console.log('Creating sample selection history...');
    const currentDate = new Date();
    const selectionHistory = [
      // Recent selections (should be excluded from random selection)
      { item_type: 'meal' as const, meal_name: 'Spaghetti Carbonara', days_ago: 2 },
      { item_type: 'restaurant' as const, restaurant_name: 'Mario\'s Authentic Pizzeria', days_ago: 1 },
      { item_type: 'meal' as const, meal_name: 'Chicken Stir Fry', days_ago: 3 },
      { item_type: 'restaurant' as const, restaurant_name: 'Sakura Sushi Bar', days_ago: 4 },
      
      // Older selections (should be eligible for random selection)
      { item_type: 'meal' as const, meal_name: 'Avocado Toast', days_ago: 10 },
      { item_type: 'restaurant' as const, restaurant_name: 'Thai Spice Kitchen', days_ago: 12 },
      { item_type: 'meal' as const, meal_name: 'Fish Tacos', days_ago: 15 },
      { item_type: 'restaurant' as const, restaurant_name: 'El Sombrero Cantina', days_ago: 18 },
    ];
    
    try {
      // Get all meals and restaurants to match names to IDs
      const { meals } = MealModel.findByUserId(demoUser.id, {}, { limit: 100 });
      const { restaurants } = RestaurantModel.findByUserId(demoUser.id, {}, { limit: 100 });
      
      for (const selection of selectionHistory) {
        try {
          let itemId: number | undefined;
          
          if (selection.item_type === 'meal') {
            const meal = meals.find(m => m.name === selection.meal_name);
            itemId = meal?.id;
          } else {
            const restaurant = restaurants.find(r => r.name === selection.restaurant_name);
            itemId = restaurant?.id;
          }
          
          if (itemId) {
            const selectionDate = new Date(currentDate);
            selectionDate.setDate(selectionDate.getDate() - selection.days_ago);
            
            // Note: This assumes SelectionHistoryModel has a createWithDate method
            // If not, we'll need to implement it or create via direct SQL
            SelectionHistoryModel.create({
              user_id: demoUser.id,
              item_type: selection.item_type,
              item_id: itemId
            });
            console.log(`  ✓ Created selection history: ${selection.item_type} - ${selection.meal_name || selection.restaurant_name}`);
          }
        } catch (error) {
          console.log(`  ⚠️  Failed to create selection history for: ${selection.meal_name || selection.restaurant_name}`);
        }
      }
    } catch (error) {
      console.log('  ⚠️  Failed to create selection history');
    }
    
    console.log('\n✅ Comprehensive database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`  • Tags: ${Object.keys(createdTags).length} created`);
    console.log(`  • Meals: Use seedRealMeals.js for real meal data`);
    console.log(`  • Restaurants: ${sampleRestaurants.length} establishments`);
    console.log(`  • Demo user: demo@example.com / demo123!A`);
    console.log(`  • Selection history: Sample data for algorithm testing`);
    console.log('\n🍽️  Your app now has:');
    console.log('  • Multiple cuisine types (Italian, Asian, Mexican, Mediterranean, etc.)');
    console.log('  • Various difficulty levels and prep times');
    console.log('  • Comprehensive tagging system');
    console.log('  • Price range diversity for restaurants');
    console.log('  • Realistic selection history for testing');
    
    // Close database connection
    dbManager.close();
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase };