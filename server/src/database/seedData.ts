// Comprehensive seed data for the What to Eat app
// This file contains detailed recipes, restaurants, and other sample data

export interface SeedMealData {
  name: string;
  description: string;
  cuisine_type: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  prep_time: number;
  cook_time?: number;
  servings?: number;
  is_favorite: boolean;
  tags: string[];
  ingredients?: string[];
  instructions?: string[];
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  notes?: string;
}

export interface SeedRestaurantData {
  name: string;
  cuisine_type: string;
  address: string;
  phone: string;
  price_range: '$' | '$$' | '$$$' | '$$$$';
  is_favorite: boolean;
  rating: number;
  tags: string[];
  hours?: string;
  website?: string;
  specialties?: string[];
  notes?: string;
}

export const DETAILED_MEAL_DATA: SeedMealData[] = [
  // Italian Cuisine
  {
    name: 'Spaghetti Carbonara',
    description: 'Classic Roman pasta with eggs, pecorino cheese, pancetta, and black pepper. Rich and creamy without cream!',
    cuisine_type: 'Italian',
    difficulty_level: 'medium',
    prep_time: 15,
    cook_time: 15,
    servings: 4,
    is_favorite: true,
    tags: ['Italian', 'Comfort Food', 'Dinner', 'Rich', 'Savory'],
    ingredients: [
      '400g spaghetti',
      '200g pancetta or guanciale, diced',
      '4 large eggs',
      '100g Pecorino Romano cheese, grated',
      '50g Parmesan cheese, grated',
      'Freshly ground black pepper',
      'Salt for pasta water',
      '2 cloves garlic (optional)'
    ],
    instructions: [
      'Bring a large pot of salted water to boil for the pasta',
      'In a large bowl, whisk together eggs, Pecorino, Parmesan, and plenty of black pepper',
      'Cook pancetta in a large skillet over medium heat until crispy, about 5-7 minutes',
      'Cook spaghetti according to package directions until al dente',
      'Reserve 1 cup pasta cooking water, then drain pasta',
      'Add hot pasta to the pan with pancetta, toss for 1 minute',
      'Remove from heat and quickly mix in egg mixture, adding pasta water gradually',
      'Toss continuously until sauce is creamy and coats the pasta',
      'Serve immediately with extra cheese and black pepper'
    ],
    nutrition: {
      calories: 580,
      protein: 28,
      carbs: 65,
      fat: 22
    },
    notes: 'The key is to work quickly when adding the egg mixture to prevent scrambling. The pasta water helps create the silky sauce.'
  },
  
  {
    name: 'Margherita Pizza',
    description: 'Simple Neapolitan pizza with tomato sauce, fresh mozzarella, basil, and olive oil',
    cuisine_type: 'Italian',
    difficulty_level: 'hard',
    prep_time: 30,
    cook_time: 12,
    servings: 2,
    is_favorite: true,
    tags: ['Italian', 'Vegetarian', 'Dinner', 'Comfort Food', 'Baked'],
    ingredients: [
      '500g 00 flour (or bread flour)',
      '325ml warm water',
      '10g salt',
      '3g active dry yeast',
      '30ml extra virgin olive oil',
      '400g can San Marzano tomatoes, crushed',
      '300g fresh mozzarella, torn',
      'Fresh basil leaves',
      'Sea salt and black pepper',
      'Extra olive oil for drizzling'
    ],
    instructions: [
      'Dissolve yeast in warm water, let sit 5 minutes until foamy',
      'Mix flour and salt in a large bowl, create a well in center',
      'Add yeast mixture and olive oil, mix until dough forms',
      'Knead on floured surface for 10 minutes until smooth and elastic',
      'Place in oiled bowl, cover, rise 1-2 hours until doubled',
      'Preheat oven to maximum temperature (500°F/260°C) with pizza stone',
      'Divide dough in half, roll out thin on floured surface',
      'Transfer to semolina-dusted peel or baking sheet',
      'Spread crushed tomatoes thinly, add torn mozzarella',
      'Slide onto hot pizza stone, bake 10-12 minutes until edges are charred',
      'Top with fresh basil, drizzle with olive oil, season with salt'
    ],
    nutrition: {
      calories: 650,
      protein: 28,
      carbs: 85,
      fat: 22
    },
    notes: 'Use the hottest oven possible and a pizza stone for best results. Less is more with toppings!'
  },

  // Asian Cuisine
  {
    name: 'Chicken Fried Rice',
    description: 'Classic Chinese-style fried rice with tender chicken, vegetables, and scrambled eggs',
    cuisine_type: 'Chinese',
    difficulty_level: 'easy',
    prep_time: 20,
    cook_time: 15,
    servings: 4,
    is_favorite: false,
    tags: ['Asian', 'Chinese', 'Quick', 'One-Pot', 'Dinner', 'Comfort Food'],
    ingredients: [
      '3 cups cooked jasmine rice (preferably day-old)',
      '300g boneless chicken thighs, diced',
      '3 eggs, beaten',
      '1 cup frozen mixed vegetables',
      '4 green onions, sliced',
      '3 cloves garlic, minced',
      '2 tbsp vegetable oil',
      '3 tbsp soy sauce',
      '1 tbsp oyster sauce',
      '1 tsp sesame oil',
      'Salt and white pepper to taste'
    ],
    instructions: [
      'Heat 1 tbsp oil in large wok or skillet over high heat',
      'Add beaten eggs, scramble quickly, remove and set aside',
      'Add remaining oil, cook chicken until golden, about 5-6 minutes',
      'Add garlic and frozen vegetables, stir-fry 2 minutes',
      'Add cold rice, breaking up any clumps with spatula',
      'Stir in soy sauce and oyster sauce, toss everything together',
      'Return scrambled eggs to pan, add green onions',
      'Toss for 2-3 minutes until heated through',
      'Finish with sesame oil, season with salt and pepper'
    ],
    nutrition: {
      calories: 420,
      protein: 25,
      carbs: 45,
      fat: 15
    },
    notes: 'Day-old rice works best as it\'s drier and won\'t get mushy. Keep the heat high for that "wok hei" flavor.'
  },

  {
    name: 'Beef Ramen Bowl',
    description: 'Rich tonkotsu-style broth with tender beef, soft-boiled egg, scallions, and fresh ramen noodles',
    cuisine_type: 'Japanese',
    difficulty_level: 'hard',
    prep_time: 45,
    cook_time: 180,
    servings: 2,
    is_favorite: true,
    tags: ['Japanese', 'Asian', 'Comfort Food', 'Dinner', 'Rich', 'Savory'],
    ingredients: [
      '2 portions fresh ramen noodles',
      '400g beef chuck roast, sliced thin',
      '2 soft-boiled eggs, halved',
      '4 cups chicken stock',
      '2 cups beef stock',
      '200ml whole milk',
      '2 tbsp white miso paste',
      '2 tbsp soy sauce',
      '1 tbsp sesame oil',
      '2 cloves garlic, minced',
      '1 inch ginger, minced',
      '2 green onions, sliced',
      'Nori sheets, sliced',
      'Bamboo shoots (optional)',
      'Corn kernels (optional)'
    ],
    instructions: [
      'Combine chicken and beef stocks in large pot, bring to simmer',
      'Add milk, miso paste, soy sauce, garlic, and ginger',
      'Simmer on low heat for 2-3 hours until rich and creamy',
      'Season beef slices with salt and pepper',
      'Cook ramen noodles according to package directions, drain',
      'Sear beef slices quickly in hot pan with sesame oil',
      'Divide noodles between two bowls',
      'Ladle hot broth over noodles',
      'Top with beef slices, soft-boiled egg halves',
      'Garnish with green onions, nori, and optional toppings'
    ],
    nutrition: {
      calories: 680,
      protein: 45,
      carbs: 55,
      fat: 28
    },
    notes: 'The key to good ramen is a rich, creamy broth. Don\'t rush the simmering process!'
  },

  // Mexican Cuisine
  {
    name: 'Fish Tacos with Mango Salsa',
    description: 'Grilled white fish with fresh mango salsa, cabbage slaw, and chipotle crema in corn tortillas',
    cuisine_type: 'Mexican',
    difficulty_level: 'medium',
    prep_time: 30,
    cook_time: 15,
    servings: 4,
    is_favorite: true,
    tags: ['Mexican', 'Healthy', 'Dinner', 'Grilled', 'Fresh', 'Tangy'],
    ingredients: [
      '600g white fish fillets (mahi-mahi or tilapia)',
      '8 corn tortillas',
      '1 ripe mango, diced',
      '1/2 red onion, finely diced',
      '1 jalapeño, minced',
      '2 cups shredded cabbage',
      '1/4 cup fresh cilantro, chopped',
      '2 limes, juiced',
      '1/2 cup sour cream',
      '2 chipotle peppers in adobo, minced',
      '2 tbsp olive oil',
      '1 tsp cumin',
      '1 tsp chili powder',
      'Salt and pepper to taste'
    ],
    instructions: [
      'Mix mango, half the onion, jalapeño, cilantro, and lime juice for salsa',
      'Combine sour cream with chipotle peppers for crema',
      'Season fish with cumin, chili powder, salt, and pepper',
      'Heat olive oil in grill pan over medium-high heat',
      'Cook fish 3-4 minutes per side until flaky',
      'Warm tortillas in dry skillet or over gas flame',
      'Break fish into chunks',
      'Assemble tacos: tortilla, cabbage, fish, mango salsa, chipotle crema',
      'Serve with lime wedges'
    ],
    nutrition: {
      calories: 380,
      protein: 32,
      carbs: 35,
      fat: 12
    },
    notes: 'Don\'t overcook the fish! It should flake easily when done. Make salsa ahead for better flavors.'
  },

  // American Comfort Food
  {
    name: 'Classic Mac and Cheese',
    description: 'Creamy, cheesy macaroni and cheese with a crispy breadcrumb topping',
    cuisine_type: 'American',
    difficulty_level: 'medium',
    prep_time: 20,
    cook_time: 30,
    servings: 6,
    is_favorite: true,
    tags: ['American', 'Comfort Food', 'Vegetarian', 'Baked', 'Rich', 'Family Friendly'],
    ingredients: [
      '400g elbow macaroni',
      '4 tbsp butter',
      '4 tbsp all-purpose flour',
      '3 cups whole milk',
      '300g sharp cheddar cheese, grated',
      '100g Gruyère cheese, grated',
      '1/2 tsp mustard powder',
      '1/4 tsp cayenne pepper',
      '1 cup fresh breadcrumbs',
      '2 tbsp melted butter',
      'Salt and black pepper to taste'
    ],
    instructions: [
      'Preheat oven to 375°F (190°C)',
      'Cook macaroni according to package directions until al dente, drain',
      'In large saucepan, melt butter over medium heat',
      'Whisk in flour, cook 1 minute to form roux',
      'Gradually whisk in milk, cook until thickened, about 5 minutes',
      'Remove from heat, stir in cheeses, mustard powder, and cayenne',
      'Season with salt and pepper',
      'Combine pasta with cheese sauce, transfer to baking dish',
      'Top with breadcrumbs mixed with melted butter',
      'Bake 25-30 minutes until golden and bubbly'
    ],
    nutrition: {
      calories: 520,
      protein: 22,
      carbs: 52,
      fat: 25
    },
    notes: 'Use freshly grated cheese for best melting. Don\'t skip the mustard powder - it enhances the cheese flavor!'
  },

  // Healthy Options
  {
    name: 'Quinoa Buddha Bowl',
    description: 'Nutritious bowl with quinoa, roasted vegetables, chickpeas, avocado, and tahini dressing',
    cuisine_type: 'Mediterranean',
    difficulty_level: 'easy',
    prep_time: 20,
    cook_time: 25,
    servings: 2,
    is_favorite: false,
    tags: ['Mediterranean', 'Healthy', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Lunch', 'Dinner'],
    ingredients: [
      '1 cup quinoa',
      '1 can chickpeas, drained and rinsed',
      '2 cups Brussels sprouts, halved',
      '1 sweet potato, cubed',
      '1 avocado, sliced',
      '2 cups baby spinach',
      '1/4 cup pumpkin seeds',
      '3 tbsp olive oil',
      '2 tbsp tahini',
      '1 lemon, juiced',
      '1 tbsp maple syrup',
      '1 clove garlic, minced',
      'Salt, pepper, and cumin to taste'
    ],
    instructions: [
      'Preheat oven to 425°F (220°C)',
      'Cook quinoa according to package directions',
      'Toss sweet potato and Brussels sprouts with 2 tbsp olive oil, salt, and pepper',
      'Roast vegetables 20-25 minutes until tender and caramelized',
      'Season chickpeas with cumin, salt, and pepper',
      'Whisk tahini, lemon juice, maple syrup, garlic, and 1 tbsp olive oil for dressing',
      'Divide quinoa between bowls',
      'Top with roasted vegetables, chickpeas, spinach, and avocado',
      'Drizzle with tahini dressing, sprinkle with pumpkin seeds'
    ],
    nutrition: {
      calories: 580,
      protein: 20,
      carbs: 75,
      fat: 22
    },
    notes: 'This bowl is completely customizable - use any roasted vegetables you prefer!'
  },

  // Quick & Easy
  {
    name: 'Avocado Toast Supreme',
    description: 'Elevated avocado toast with everything bagel seasoning, cherry tomatoes, and feta cheese',
    cuisine_type: 'American',
    difficulty_level: 'easy',
    prep_time: 10,
    cook_time: 5,
    servings: 2,
    is_favorite: true,
    tags: ['American', 'Quick', 'Healthy', 'Vegetarian', 'Breakfast', 'No-Cook'],
    ingredients: [
      '4 slices sourdough bread',
      '2 ripe avocados',
      '1 cup cherry tomatoes, halved',
      '100g feta cheese, crumbled',
      '2 tbsp everything bagel seasoning',
      '2 tbsp olive oil',
      '1 lemon, juiced',
      'Red pepper flakes',
      'Fresh microgreens (optional)',
      'Salt and pepper to taste'
    ],
    instructions: [
      'Toast sourdough bread until golden brown',
      'Mash avocados with lemon juice, salt, and pepper',
      'Spread avocado mixture generously on toast',
      'Top with cherry tomatoes and crumbled feta',
      'Sprinkle with everything bagel seasoning',
      'Drizzle with olive oil and add red pepper flakes',
      'Garnish with microgreens if using',
      'Serve immediately'
    ],
    nutrition: {
      calories: 420,
      protein: 12,
      carbs: 35,
      fat: 28
    },
    notes: 'Choose perfectly ripe avocados for best texture. Eat immediately to prevent browning!'
  }
];

export const DETAILED_RESTAURANT_DATA: SeedRestaurantData[] = [
  // Fine Dining
  {
    name: 'Bella Vista Ristorante',
    cuisine_type: 'Italian',
    address: '456 Vineyard Ave, Uptown',
    phone: '555-0456',
    price_range: '$$$',
    is_favorite: true,
    rating: 4.7,
    tags: ['Italian', 'Fine Dining', 'Date Night', 'Local', 'Wine Bar'],
    hours: 'Tue-Sun 5:30PM-10:30PM, Closed Mondays',
    website: 'www.bellavistaristorante.com',
    specialties: [
      'House-made pasta',
      'Osso Buco',
      'Extensive wine list',
      'Tiramisu'
    ],
    notes: 'Reservations recommended. Romantic atmosphere with excellent service. Their wine pairing dinners are exceptional.'
  },

  {
    name: 'Sakura Sushi & Omakase',
    cuisine_type: 'Japanese',
    address: '321 Bamboo Lane, Arts District',
    phone: '555-0321',
    price_range: '$$$',
    is_favorite: true,
    rating: 4.8,
    tags: ['Japanese', 'Asian', 'Fine Dining', 'Date Night', 'Local', 'Sushi'],
    hours: 'Mon-Sat 6:00PM-11:00PM, Closed Sundays',
    website: 'www.sakurasushi.com',
    specialties: [
      'Omakase tasting menu',
      'Fresh sashimi',
      'Premium sake selection',
      'Chef\'s special rolls'
    ],
    notes: 'Authentic Japanese experience. The omakase is worth the splurge. Sit at the sushi bar for the full experience.'
  },

  // Casual Favorites
  {
    name: 'Mario\'s Authentic Pizzeria',
    cuisine_type: 'Italian',
    address: '123 Little Italy St, Downtown',
    phone: '555-0123',
    price_range: '$$',
    is_favorite: true,
    rating: 4.5,
    tags: ['Italian', 'Casual', 'Takeout', 'Family Friendly', 'Local', 'Pizza'],
    hours: 'Daily 11:00AM-11:00PM',
    website: 'www.mariospizza.com',
    specialties: [
      'Wood-fired pizza',
      'Homemade meatballs',
      'Garlic knots',
      'Cannoli'
    ],
    notes: 'Family-owned for 30 years. Best pizza in the city! Try the Margherita or the Meat Lovers.'
  },

  {
    name: 'The Burger Shack',
    cuisine_type: 'American',
    address: '741 Main Street, Midtown',
    phone: '555-0741',
    price_range: '$$',
    is_favorite: true,
    rating: 4.2,
    tags: ['American', 'Casual', 'Family Friendly', 'Local', 'Burgers', 'Comfort Food'],
    hours: 'Daily 11:30AM-10:00PM',
    specialties: [
      'Double cheeseburger',
      'Sweet potato fries',
      'Craft beer selection',
      'Milkshakes'
    ],
    notes: 'Great casual spot for burgers and beers. Their truffle fries are amazing!'
  },

  // Ethnic Cuisine
  {
    name: 'Golden Dragon Chinese',
    cuisine_type: 'Chinese',
    address: '789 Chinatown Blvd',
    phone: '555-0789',
    price_range: '$',
    is_favorite: false,
    rating: 4.0,
    tags: ['Chinese', 'Asian', 'Cheap Eats', 'Takeout', 'Family Friendly', 'Authentic'],
    hours: 'Daily 11:00AM-10:00PM',
    specialties: [
      'Peking duck',
      'Hand-pulled noodles',
      'Dim sum (weekends)',
      'Mapo tofu'
    ],
    notes: 'Authentic Chinese food at great prices. The dim sum on weekends is particularly good.'
  },

  {
    name: 'Thai Spice Kitchen',
    cuisine_type: 'Thai',
    address: '654 Spice Market St',
    phone: '555-0654',
    price_range: '$$',
    is_favorite: false,
    rating: 4.3,
    tags: ['Thai', 'Asian', 'Spicy', 'Casual', 'Takeout', 'Authentic'],
    hours: 'Tue-Sun 11:30AM-9:30PM, Closed Mondays',
    specialties: [
      'Pad Thai',
      'Green curry',
      'Som tam (papaya salad)',
      'Mango sticky rice'
    ],
    notes: 'Authentic Thai flavors with adjustable spice levels. The green curry is exceptional.'
  },

  {
    name: 'El Sombrero Cantina',
    cuisine_type: 'Mexican',
    address: '258 Fiesta Avenue',
    phone: '555-0258',
    price_range: '$$',
    is_favorite: true,
    rating: 4.2,
    tags: ['Mexican', 'Spicy', 'Casual', 'Family Friendly', 'Local', 'Margaritas'],
    hours: 'Daily 11:00AM-12:00AM',
    specialties: [
      'Fish tacos',
      'Carnitas',
      'Margaritas',
      'Churros'
    ],
    notes: 'Great atmosphere with live mariachi on weekends. Their fish tacos are the best in town!'
  },

  {
    name: 'Taj Palace Indian Cuisine',
    cuisine_type: 'Indian',
    address: '486 Curry Lane',
    phone: '555-0486',
    price_range: '$$',
    is_favorite: true,
    rating: 4.4,
    tags: ['Indian', 'Spicy', 'Vegetarian', 'Casual', 'Local', 'Curry'],
    hours: 'Daily 11:30AM-2:30PM, 5:00PM-10:00PM',
    specialties: [
      'Chicken tikka masala',
      'Biryani',
      'Naan bread',
      'Mango lassi'
    ],
    notes: 'Excellent vegetarian options. Their lunch buffet is a great way to try different dishes.'
  },

  // Healthy & Mediterranean
  {
    name: 'Mediterranean Garden',
    cuisine_type: 'Mediterranean',
    address: '159 Olive Branch Way',
    phone: '555-0159',
    price_range: '$$',
    is_favorite: false,
    rating: 4.3,
    tags: ['Mediterranean', 'Healthy', 'Vegetarian', 'Casual', 'Local', 'Fresh'],
    hours: 'Daily 11:00AM-9:00PM',
    specialties: [
      'Hummus platter',
      'Greek salad',
      'Lamb gyros',
      'Baklava'
    ],
    notes: 'Fresh, healthy Mediterranean food. Great for lunch or light dinner.'
  },

  {
    name: 'Green Earth Cafe',
    cuisine_type: 'Vegetarian',
    address: '951 Eco Park Blvd',
    phone: '555-0951',
    price_range: '$$',
    is_favorite: false,
    rating: 4.2,
    tags: ['Vegetarian', 'Vegan', 'Healthy', 'Casual', 'Local', 'Organic'],
    hours: 'Daily 8:00AM-8:00PM',
    specialties: [
      'Quinoa bowls',
      'Smoothie bowls',
      'Vegan burgers',
      'Fresh juices'
    ],
    notes: 'Great for healthy eating. Everything is organic and locally sourced when possible.'
  },

  // Quick & Casual
  {
    name: 'Taco Libre Food Truck',
    cuisine_type: 'Mexican',
    address: 'Mobile - Downtown Food Court',
    phone: '555-0369',
    price_range: '$',
    is_favorite: false,
    rating: 4.1,
    tags: ['Mexican', 'Food Truck', 'Cheap Eats', 'Quick', 'Local', 'Street Food'],
    hours: 'Mon-Fri 11:00AM-3:00PM, Sat 12:00PM-4:00PM',
    specialties: [
      'Street tacos',
      'Quesadillas',
      'Fresh salsa',
      'Agua frescas'
    ],
    notes: 'Follow them on social media for daily locations. Authentic street-style tacos!'
  },

  {
    name: 'Downtown Diner',
    cuisine_type: 'American',
    address: '852 Retro Row',
    phone: '555-0852',
    price_range: '$',
    is_favorite: false,
    rating: 3.8,
    tags: ['American', 'Breakfast', 'Comfort Food', 'Casual', 'Cheap Eats', 'Diner'],
    hours: 'Daily 6:00AM-3:00PM',
    specialties: [
      'Pancakes',
      'Eggs Benedict',
      'Coffee',
      'Pie'
    ],
    notes: 'Classic American diner. Great for breakfast and comfort food. The pie is homemade!'
  },

  // Coffee & Light Meals
  {
    name: 'Artisan Coffee House',
    cuisine_type: 'American',
    address: '357 Bean Street',
    phone: '555-0357',
    price_range: '$',
    is_favorite: true,
    rating: 4.5,
    tags: ['American', 'Breakfast', 'Casual', 'Local', 'Quick', 'Coffee'],
    hours: 'Mon-Fri 6:30AM-6:00PM, Sat-Sun 7:00AM-5:00PM',
    specialties: [
      'Specialty coffee',
      'Avocado toast',
      'Pastries',
      'Breakfast sandwiches'
    ],
    notes: 'Best coffee in the neighborhood. Great place to work or meet friends. Try their lavender latte!'
  }
];

export const COMPREHENSIVE_TAGS = [
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
  { name: 'Fresh', color: '#10B981' },
  
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
  { name: 'Popular', color: '#F59E0B' },
  { name: 'Authentic', color: '#7C2D12' },
  { name: 'Wine Bar', color: '#7C3AED' },
  { name: 'Coffee', color: '#92400E' },
  { name: 'Pizza', color: '#EF4444' },
  { name: 'Sushi', color: '#0284C7' },
  { name: 'Burgers', color: '#F59E0B' },
  { name: 'Curry', color: '#D97706' },
  { name: 'Margaritas', color: '#10B981' },
  { name: 'Street Food', color: '#F97316' },
  { name: 'Diner', color: '#6B7280' },
  { name: 'Organic', color: '#16A34A' }
];