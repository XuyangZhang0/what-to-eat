import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Open database
const dbPath = path.resolve(__dirname, '../../data/database.db');
const db = new Database(dbPath);

// Real meal data with ingredients and instructions
const realMeals = [
  // Italian Cuisine (5 meals)
  {
    name: "Classic Spaghetti Carbonara",
    description: "Authentic Roman pasta dish with eggs, cheese, pancetta, and black pepper",
    cuisine_type: "Italian",
    difficulty_level: "medium",
    prep_time: 25,
    ingredients: [
      "400g spaghetti",
      "200g guanciale or pancetta, diced",
      "4 large egg yolks",
      "1 whole egg",
      "100g Pecorino Romano cheese, finely grated",
      "Freshly ground black pepper",
      "Salt for pasta water"
    ],
    instructions: [
      "Bring a large pot of salted water to boil and cook spaghetti according to package directions until al dente",
      "While pasta cooks, heat a large skillet over medium heat and cook diced guanciale until crispy, about 5-7 minutes",
      "In a bowl, whisk together egg yolks, whole egg, grated Pecorino Romano, and generous black pepper",
      "Reserve 1 cup pasta cooking water before draining spaghetti",
      "Add hot drained spaghetti to the skillet with guanciale",
      "Remove from heat and immediately add egg mixture, tossing quickly with tongs",
      "Add pasta water gradually while tossing to create a silky sauce that coats the pasta",
      "Serve immediately with extra Pecorino Romano and black pepper"
    ],
    is_favorite: false
  },
  {
    name: "Margherita Pizza",
    description: "Traditional Neapolitan pizza with tomato sauce, mozzarella, and fresh basil",
    cuisine_type: "Italian", 
    difficulty_level: "medium",
    prep_time: 45,
    ingredients: [
      "500g 00 flour",
      "325ml warm water",
      "10g salt",
      "3g active dry yeast",
      "2 tbsp olive oil",
      "400g canned San Marzano tomatoes, crushed",
      "300g fresh mozzarella di bufala, torn",
      "Fresh basil leaves",
      "Extra virgin olive oil for drizzling"
    ],
    instructions: [
      "Dissolve yeast in warm water and let stand for 5 minutes until foamy",
      "Mix flour and salt in a large bowl, create a well and add yeast mixture and olive oil",
      "Mix until a shaggy dough forms, then knead on floured surface for 10 minutes until smooth",
      "Place in oiled bowl, cover, and rise for 1-2 hours until doubled",
      "Preheat oven to highest temperature (250°C/480°F) with pizza stone if available",
      "Divide dough into 4 portions and roll each into thin circles",
      "Spread crushed tomatoes leaving 1-inch border, add torn mozzarella",
      "Bake for 10-12 minutes until crust is golden and cheese is bubbly",
      "Top with fresh basil and drizzle with olive oil before serving"
    ],
    is_favorite: false
  },
  {
    name: "Chicken Parmigiana",
    description: "Breaded chicken cutlets topped with marinara sauce and melted cheese",
    cuisine_type: "Italian",
    difficulty_level: "medium",
    prep_time: 40,
    ingredients: [
      "4 boneless chicken breasts, pounded thin",
      "1 cup all-purpose flour",
      "3 eggs, beaten",
      "2 cups panko breadcrumbs",
      "1 cup grated Parmesan cheese",
      "2 cups marinara sauce",
      "200g mozzarella cheese, sliced",
      "Vegetable oil for frying",
      "Salt and pepper"
    ],
    instructions: [
      "Set up breading station: flour in one dish, beaten eggs in another, mix panko with half the Parmesan in third",
      "Season chicken with salt and pepper, then dredge in flour, dip in egg, coat with breadcrumb mixture",
      "Heat oil in large skillet over medium-high heat",
      "Fry chicken cutlets 3-4 minutes per side until golden brown and cooked through",
      "Preheat oven to 200°C (400°F)",
      "Spread thin layer of marinara in baking dish, place chicken on top",
      "Top each cutlet with remaining sauce, mozzarella slices, and remaining Parmesan",
      "Bake 15-20 minutes until cheese is melted and bubbly",
      "Let rest 5 minutes before serving"
    ],
    is_favorite: false
  },
  {
    name: "Risotto alla Milanese",
    description: "Creamy saffron risotto from Milan, rich and luxurious",
    cuisine_type: "Italian",
    difficulty_level: "hard",
    prep_time: 35,
    ingredients: [
      "320g Arborio rice",
      "1.2L warm chicken or vegetable stock",
      "Pinch of saffron threads",
      "1 small onion, finely diced",
      "120ml dry white wine",
      "80g butter",
      "80g Parmesan cheese, grated",
      "2 tbsp olive oil",
      "Salt and white pepper"
    ],
    instructions: [
      "Steep saffron in 2 tbsp warm stock for 10 minutes",
      "Heat olive oil and half the butter in heavy-bottomed pan over medium heat",
      "Sauté onion until translucent, about 3-4 minutes",
      "Add rice and stir for 2 minutes until grains are coated and lightly toasted",
      "Pour in wine and stir until absorbed",
      "Add saffron mixture and begin adding warm stock one ladle at a time",
      "Stir constantly and wait for each addition to be absorbed before adding more",
      "Continue for 18-20 minutes until rice is creamy but still has slight bite",
      "Remove from heat, stir in remaining butter and Parmesan, season with salt and pepper",
      "Serve immediately"
    ],
    is_favorite: false
  },
  {
    name: "Tiramisu", 
    description: "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone",
    cuisine_type: "Italian",
    difficulty_level: "easy",
    prep_time: 30,
    ingredients: [
      "6 egg yolks",
      "75g caster sugar", 
      "500g mascarpone cheese",
      "300ml strong espresso, cooled",
      "3 tbsp coffee liqueur (optional)",
      "2 packs ladyfinger cookies",
      "Unsweetened cocoa powder for dusting",
      "Dark chocolate shavings (optional)"
    ],
    instructions: [
      "Whisk egg yolks and sugar in large bowl until thick and pale",
      "Gently fold in mascarpone until smooth and combined",
      "Combine cooled espresso and coffee liqueur in shallow dish",
      "Quickly dip each ladyfinger in coffee mixture and arrange in single layer in dish",
      "Spread half the mascarpone mixture over ladyfingers",
      "Repeat with another layer of dipped ladyfingers and remaining mascarpone",
      "Cover and refrigerate for at least 4 hours or overnight",
      "Before serving, dust with cocoa powder and garnish with chocolate shavings",
      "Cut into squares and serve chilled"
    ],
    is_favorite: false
  },

  // Chinese Cuisine (5 meals)
  {
    name: "Kung Pao Chicken",
    description: "Spicy Sichuan stir-fry with chicken, peanuts, and dried chilies",
    cuisine_type: "Chinese",
    difficulty_level: "medium",
    prep_time: 25,
    ingredients: [
      "500g boneless chicken thighs, cubed",
      "100g roasted peanuts",
      "6-8 dried red chilies",
      "3 green onions, chopped",
      "3 cloves garlic, minced",
      "1 tbsp fresh ginger, minced",
      "2 tbsp Sichuan peppercorns",
      "For marinade: 1 tbsp soy sauce, 1 tbsp rice wine, 1 tsp cornstarch",
      "For sauce: 2 tbsp soy sauce, 1 tbsp dark soy sauce, 1 tsp sugar, 1 tbsp black vinegar, 1 tsp cornstarch, 2 tbsp chicken stock"
    ],
    instructions: [
      "Marinate cubed chicken in soy sauce, rice wine, and cornstarch for 15 minutes",
      "Mix all sauce ingredients in a small bowl and set aside",
      "Heat wok or large skillet over high heat with oil",
      "Add Sichuan peppercorns and dried chilies, stir-fry for 30 seconds until fragrant",
      "Add marinated chicken and stir-fry for 3-4 minutes until just cooked",
      "Add garlic and ginger, stir-fry for another 30 seconds",
      "Pour in sauce mixture and toss to coat chicken evenly",
      "Add peanuts and green onions, stir-fry for final minute",
      "Serve immediately with steamed rice"
    ],
    is_favorite: false
  },
  {
    name: "Peking Duck",
    description: "Traditional roasted duck with crispy skin, served with pancakes and hoisin sauce",
    cuisine_type: "Chinese",
    difficulty_level: "hard",
    prep_time: 180,
    ingredients: [
      "1 whole duck (2-3kg)",
      "2 tbsp five-spice powder",
      "2 tbsp salt",
      "2 tbsp honey",
      "1 tbsp soy sauce",
      "Chinese pancakes",
      "Hoisin sauce",
      "Cucumber, julienned",
      "Green onions, julienned"
    ],
    instructions: [
      "Clean duck thoroughly and pat dry, score skin in crosshatch pattern",
      "Rub five-spice powder and salt all over duck, inside and out",
      "Hang duck in cool, airy place for 4-6 hours to dry skin",
      "Preheat oven to 200°C (400°F)",
      "Mix honey and soy sauce, brush all over duck skin",
      "Roast duck breast-side up for 20 minutes, then reduce to 180°C (350°F)",
      "Continue roasting for 90-120 minutes until skin is crispy and internal temp reaches 75°C",
      "Let rest 15 minutes before carving",
      "Serve sliced duck with warm pancakes, hoisin sauce, cucumber, and green onions",
      "Guests wrap duck in pancakes with accompaniments"
    ],
    is_favorite: false
  },
  {
    name: "Mapo Tofu",
    description: "Spicy Sichuan tofu dish with ground pork in chili bean sauce",
    cuisine_type: "Chinese",
    difficulty_level: "medium",
    prep_time: 20,
    ingredients: [
      "400g silken tofu, cubed",
      "200g ground pork",
      "2 tbsp Sichuan doubanjiang (chili bean paste)",
      "3 cloves garlic, minced",
      "1 tbsp fresh ginger, minced",
      "2 green onions, chopped",
      "1 tsp Sichuan peppercorns, ground",
      "1 tbsp soy sauce",
      "1 tsp sugar",
      "200ml chicken stock",
      "1 tbsp cornstarch mixed with 2 tbsp water"
    ],
    instructions: [
      "Cut tofu into 2cm cubes and set aside",
      "Heat oil in wok over medium-high heat",
      "Add ground pork and cook until no longer pink, breaking up with spoon",
      "Add garlic, ginger, and doubanjiang, stir-fry for 1 minute until fragrant",
      "Add soy sauce, sugar, and chicken stock, bring to simmer",
      "Gently add tofu cubes, simmer for 3-4 minutes",
      "Stir in cornstarch slurry to thicken sauce",
      "Sprinkle with ground Sichuan peppercorns and green onions",
      "Serve hot with steamed rice"
    ],
    is_favorite: false
  },
  {
    name: "Sweet and Sour Pork",
    description: "Crispy battered pork with tangy sweet and sour sauce",
    cuisine_type: "Chinese",
    difficulty_level: "medium",
    prep_time: 35,
    ingredients: [
      "500g pork shoulder, cubed",
      "1 cup cornstarch",
      "2 eggs, beaten",
      "1 bell pepper, chunked",
      "1 onion, chunked",
      "1 cup pineapple chunks",
      "Oil for deep frying",
      "For sauce: 3 tbsp ketchup, 2 tbsp rice vinegar, 2 tbsp sugar, 1 tbsp soy sauce, 1 tsp cornstarch"
    ],
    instructions: [
      "Cut pork into 3cm pieces and season with salt and pepper",
      "Dredge pork in cornstarch, dip in beaten egg, then coat again in cornstarch",
      "Heat oil to 180°C (350°F) and deep fry pork pieces until golden and crispy",
      "Remove and drain on paper towels",
      "Mix all sauce ingredients with 3 tbsp water",
      "Heat 2 tbsp oil in wok, stir-fry bell pepper and onion for 2 minutes",
      "Add pineapple chunks and sauce mixture, bring to boil",
      "Add fried pork and toss to coat with sauce",
      "Serve immediately with steamed rice"
    ],
    is_favorite: false
  },
  {
    name: "Xiaolongbao (Soup Dumplings)",
    description: "Delicate steamed dumplings filled with pork and savory broth",
    cuisine_type: "Chinese",
    difficulty_level: "hard",
    prep_time: 120,
    ingredients: [
      "300g all-purpose flour",
      "180ml boiling water",
      "300g ground pork",
      "2 tbsp soy sauce",
      "1 tbsp Shaoxing wine",
      "1 tsp sugar",
      "1 tsp sesame oil",
      "2 green onions, minced",
      "1 tbsp fresh ginger, minced",
      "200ml rich pork stock, chilled until gelatinous"
    ],
    instructions: [
      "Make dough by gradually adding boiling water to flour while stirring, knead until smooth",
      "Cover dough and rest for 30 minutes",
      "Mix ground pork with soy sauce, wine, sugar, sesame oil, green onions, and ginger",
      "Dice the gelatinous stock and fold into pork mixture",
      "Roll dough into long cylinder and cut into 24 pieces",
      "Roll each piece into thin circle, keeping center slightly thicker",
      "Place 1 tbsp filling in center of each wrapper",
      "Pleat edges to create 18-20 folds, twist top to seal",
      "Steam dumplings in steamer lined with cabbage leaves for 12-15 minutes",
      "Serve immediately with black vinegar and ginger"
    ],
    is_favorite: false
  },

  // Mexican Cuisine (5 meals)
  {
    name: "Tacos al Pastor",
    description: "Marinated pork tacos with pineapple, onion, and cilantro",
    cuisine_type: "Mexican",
    difficulty_level: "medium",
    prep_time: 45,
    ingredients: [
      "1kg pork shoulder, thinly sliced",
      "3 dried guajillo chilies",
      "2 dried ancho chilies",
      "1 dried chipotle chili",
      "4 cloves garlic",
      "1 onion, quartered",
      "1 cup pineapple juice",
      "2 tbsp achiote paste",
      "Corn tortillas",
      "Fresh pineapple, diced",
      "White onion, finely diced",
      "Fresh cilantro, chopped"
    ],
    instructions: [
      "Toast dried chilies in dry pan for 1-2 minutes until fragrant",
      "Soak toasted chilies in hot water for 15 minutes until soft",
      "Blend chilies with garlic, onion, pineapple juice, and achiote paste until smooth",
      "Marinate sliced pork in chili mixture for at least 2 hours or overnight",
      "Heat large skillet or grill pan over high heat",
      "Cook marinated pork in batches until charred and cooked through",
      "Warm corn tortillas on comal or dry skillet",
      "Fill tortillas with pork, diced pineapple, onion, and cilantro",
      "Serve with lime wedges and salsa verde"
    ],
    is_favorite: false
  },
  {
    name: "Chiles Rellenos",
    description: "Roasted poblano peppers stuffed with cheese, battered and fried",
    cuisine_type: "Mexican",
    difficulty_level: "hard",
    prep_time: 60,
    ingredients: [
      "6 large poblano chilies",
      "300g Oaxaca or Monterey Jack cheese, cut into thick strips",
      "6 eggs, separated",
      "1/4 cup all-purpose flour",
      "Vegetable oil for frying",
      "For sauce: 4 tomatoes, 1/4 onion, 2 cloves garlic, salt, pepper"
    ],
    instructions: [
      "Roast poblanos over open flame or under broiler until charred all over",
      "Place in plastic bag for 10 minutes to steam, then peel off charred skin",
      "Make small slit and carefully remove seeds, keeping chilies intact",
      "Stuff each chili with cheese strips",
      "Beat egg whites until stiff peaks form, then gently fold in egg yolks",
      "Heat oil to 180°C (350°F) in deep pan",
      "Dust stuffed chilies with flour, then dip in egg batter",
      "Fry until golden brown on all sides",
      "For sauce: blend tomatoes, onion, garlic with salt and pepper, simmer 10 minutes",
      "Serve chilies with warm tomato sauce"
    ],
    is_favorite: false
  },
  {
    name: "Mole Poblano",
    description: "Complex sauce with chocolate and chilies served over chicken",
    cuisine_type: "Mexican",
    difficulty_level: "hard",
    prep_time: 120,
    ingredients: [
      "4 chicken breasts",
      "6 dried ancho chilies",
      "4 dried mulato chilies",
      "2 dried chipotle chilies",
      "3 tomatoes",
      "1 onion",
      "4 cloves garlic",
      "2 tbsp sesame seeds",
      "1/4 cup pumpkin seeds",
      "2 tbsp raisins",
      "30g dark chocolate",
      "1 slice bread, toasted",
      "Various spices: cinnamon, cloves, black peppercorns"
    ],
    instructions: [
      "Toast all dried chilies in dry pan, then soak in hot water for 20 minutes",
      "Char tomatoes, onion, and garlic on comal until blackened in spots",
      "Toast sesame seeds, pumpkin seeds separately until golden",
      "Soak bread and raisins in chili soaking liquid",
      "Blend chilies with some soaking liquid until smooth, strain",
      "Blend tomatoes, onion, garlic until smooth",
      "Blend seeds, bread, raisins, and spices with liquid until smooth",
      "Fry each mixture separately in oil for 10 minutes each",
      "Combine all mixtures, add chocolate, simmer 45 minutes stirring frequently",
      "Season with salt, serve over poached chicken"
    ],
    is_favorite: false
  },
  {
    name: "Carne Asada",
    description: "Grilled marinated skirt steak served with tortillas and guacamole",
    cuisine_type: "Mexican",
    difficulty_level: "easy",
    prep_time: 30,
    ingredients: [
      "1kg skirt or flank steak",
      "1/4 cup lime juice",
      "1/4 cup orange juice",
      "3 cloves garlic, minced",
      "2 tbsp olive oil",
      "1 tsp cumin",
      "1 tsp chili powder",
      "Salt and pepper",
      "Corn tortillas",
      "Guacamole",
      "Pico de gallo",
      "Lime wedges"
    ],
    instructions: [
      "Mix lime juice, orange juice, garlic, olive oil, cumin, chili powder in bowl",
      "Season steak with salt and pepper, marinate in citrus mixture for 2-4 hours",
      "Preheat grill or grill pan to high heat",
      "Remove steak from marinade and grill 3-4 minutes per side for medium-rare",
      "Let steak rest 5 minutes, then slice against the grain",
      "Warm tortillas on grill for 30 seconds per side",
      "Serve sliced steak with warm tortillas, guacamole, and pico de gallo",
      "Garnish with lime wedges and additional cilantro"
    ],
    is_favorite: false
  },
  {
    name: "Pozole Rojo",
    description: "Traditional hominy soup with pork in red chili broth",
    cuisine_type: "Mexican",
    difficulty_level: "medium",
    prep_time: 90,
    ingredients: [
      "1kg pork shoulder, cubed",
      "500g pork ribs",
      "2 cans white hominy, drained",
      "6 dried guajillo chilies",
      "3 dried ancho chilies",
      "4 cloves garlic",
      "1 onion, quartered",
      "Salt and pepper",
      "Garnishes: sliced radishes, lettuce, oregano, lime, chili powder"
    ],
    instructions: [
      "Simmer pork shoulder and ribs in salted water for 1.5 hours until tender",
      "Remove meat, shred when cool, strain and reserve broth",
      "Toast chilies in dry pan, then soak in hot water for 15 minutes",
      "Blend softened chilies with garlic, onion, and soaking liquid",
      "Strain chili mixture to remove skins and seeds",
      "Add chili mixture to reserved pork broth, bring to simmer",
      "Add shredded pork and hominy, simmer 20 minutes",
      "Season with salt and pepper to taste",
      "Serve hot with garnishes on the side for customization"
    ],
    is_favorite: false
  },

  // Indian Cuisine (5 meals)
  {
    name: "Butter Chicken",
    description: "Creamy tomato-based curry with tender chicken in aromatic sauce",
    cuisine_type: "Indian",
    difficulty_level: "medium",
    prep_time: 45,
    ingredients: [
      "800g boneless chicken, cubed",
      "200ml Greek yogurt",
      "2 tbsp lemon juice",
      "2 tsp garam masala",
      "1 tsp cumin",
      "1 can crushed tomatoes",
      "200ml heavy cream",
      "4 tbsp butter",
      "1 onion, diced",
      "4 cloves garlic, minced",
      "1 tbsp fresh ginger, minced",
      "1 tsp paprika",
      "Fresh cilantro for garnish"
    ],
    instructions: [
      "Marinate chicken in yogurt, lemon juice, half the garam masala, and cumin for 30 minutes",
      "Heat 2 tbsp butter in large pan, cook marinated chicken until browned, set aside",
      "In same pan, sauté onion until golden, add garlic and ginger for 1 minute",
      "Add crushed tomatoes, remaining garam masala, and paprika, simmer 10 minutes",
      "Blend sauce until smooth, return to pan",
      "Add cooked chicken back to sauce with cream and remaining butter",
      "Simmer 10-15 minutes until chicken is cooked through and sauce thickens",
      "Garnish with fresh cilantro and serve with basmati rice and naan"
    ],
    is_favorite: false
  },
  {
    name: "Biryani",
    description: "Fragrant layered rice dish with spiced meat and aromatic herbs",
    cuisine_type: "Indian",
    difficulty_level: "hard",
    prep_time: 90,
    ingredients: [
      "500g basmati rice",
      "800g mutton or chicken, cubed",
      "200ml yogurt",
      "2 large onions, sliced and fried",
      "1/4 cup ghee",
      "Whole spices: bay leaves, cardamom, cinnamon, cloves",
      "2 tsp ginger-garlic paste",
      "1 tsp red chili powder",
      "1/2 tsp turmeric",
      "Saffron soaked in warm milk",
      "Fresh mint and cilantro leaves"
    ],
    instructions: [
      "Marinate meat in yogurt, ginger-garlic paste, chili powder, turmeric for 1 hour",
      "Soak basmati rice for 30 minutes, then boil with whole spices until 70% cooked",
      "In heavy-bottomed pot, heat ghee and cook marinated meat until tender",
      "Layer half the rice over cooked meat",
      "Sprinkle half the fried onions, mint, cilantro, and saffron milk",
      "Add remaining rice, top with remaining garnishes",
      "Cover with foil then tight-fitting lid, cook on high for 3 minutes",
      "Reduce heat to low and cook for 45 minutes",
      "Turn off heat, let rest 10 minutes before opening",
      "Gently mix and serve with raita and pickle"
    ],
    is_favorite: false
  },
  {
    name: "Dal Tadka",
    description: "Tempered yellow lentils with aromatic spices",
    cuisine_type: "Indian",
    difficulty_level: "easy",
    prep_time: 30,
    ingredients: [
      "1 cup yellow lentils (toor dal)",
      "1/2 tsp turmeric",
      "2 tbsp ghee",
      "1 tsp cumin seeds",
      "1 tsp mustard seeds",
      "2 dried red chilies",
      "1 onion, diced",
      "2 tomatoes, chopped",
      "2 cloves garlic, minced",
      "1 tbsp fresh ginger, minced",
      "1 tsp coriander powder",
      "Fresh cilantro for garnish"
    ],
    instructions: [
      "Rinse lentils and pressure cook with turmeric and water until soft",
      "Mash lentils lightly and adjust consistency with water",
      "Heat ghee in pan, add cumin seeds, mustard seeds, and red chilies",
      "When seeds splutter, add onion and sauté until golden",
      "Add garlic, ginger, and tomatoes, cook until tomatoes break down",
      "Add coriander powder and cooked lentils",
      "Simmer for 10 minutes, adjust seasoning with salt",
      "Garnish with fresh cilantro and serve with rice or roti"
    ],
    is_favorite: false
  },
  {
    name: "Tandoori Chicken",
    description: "Yogurt-marinated chicken roasted in traditional clay oven style",
    cuisine_type: "Indian",
    difficulty_level: "medium",
    prep_time: 60,
    ingredients: [
      "1 whole chicken, cut into pieces",
      "200ml Greek yogurt",
      "2 tbsp lemon juice",
      "2 tbsp tandoori masala",
      "1 tbsp ginger-garlic paste",
      "1 tsp red chili powder",
      "1/2 tsp turmeric",
      "2 tbsp vegetable oil",
      "Salt to taste",
      "Onion rings and lemon wedges for serving"
    ],
    instructions: [
      "Make deep cuts in chicken pieces to allow marinade to penetrate",
      "Mix yogurt, lemon juice, tandoori masala, ginger-garlic paste, chili powder, turmeric, oil, and salt",
      "Marinate chicken in spice mixture for at least 4 hours or overnight",
      "Preheat oven to 220°C (425°F) or prepare grill",
      "Place marinated chicken on wire rack over baking sheet",
      "Roast for 25-30 minutes, turning once, until cooked through and charred",
      "Baste with melted butter halfway through cooking",
      "Serve hot with sliced onions, lemon wedges, and mint chutney"
    ],
    is_favorite: false
  },
  {
    name: "Palak Paneer",
    description: "Creamy spinach curry with cubes of fresh Indian cottage cheese",
    cuisine_type: "Indian",
    difficulty_level: "medium",
    prep_time: 35,
    ingredients: [
      "500g fresh spinach",
      "300g paneer, cubed",
      "2 tbsp ghee",
      "1 large onion, diced",
      "3 cloves garlic, minced",
      "1 tbsp fresh ginger, minced",
      "2 tomatoes, chopped",
      "1 tsp cumin powder",
      "1 tsp garam masala",
      "1/2 tsp turmeric",
      "100ml heavy cream",
      "Salt to taste"
    ],
    instructions: [
      "Blanch spinach in boiling water for 2 minutes, then plunge in ice water",
      "Drain spinach and blend to smooth paste with minimal water",
      "Heat ghee in pan, lightly fry paneer cubes until golden, set aside",
      "In same pan, sauté onion until golden, add garlic and ginger",
      "Add tomatoes and cook until soft and mushy",
      "Add cumin, garam masala, turmeric, cook for 1 minute",
      "Add spinach puree and simmer for 10 minutes",
      "Stir in cream and fried paneer, simmer 5 minutes more",
      "Season with salt and serve with naan or rice"
    ],
    is_favorite: false
  },

  // American Cuisine (5 meals)
  {
    name: "Classic Beef Burger",
    description: "Juicy beef patty with lettuce, tomato, and special sauce on brioche bun",
    cuisine_type: "American",
    difficulty_level: "easy",
    prep_time: 20,
    ingredients: [
      "800g ground beef (80/20 mix)",
      "4 brioche burger buns",
      "4 slices cheddar cheese",
      "Lettuce leaves",
      "2 tomatoes, sliced",
      "1 red onion, sliced",
      "Pickles",
      "For sauce: 1/2 cup mayo, 2 tbsp ketchup, 1 tbsp mustard, 1 tsp pickle juice",
      "Salt and pepper"
    ],
    instructions: [
      "Mix ground beef with salt and pepper, form into 4 patties slightly larger than buns",
      "Make slight indentation in center of each patty to prevent puffing",
      "Mix all sauce ingredients in small bowl",
      "Heat grill or skillet over medium-high heat",
      "Cook patties 3-4 minutes per side for medium, adding cheese in last minute",
      "Toast bun halves cut-side down for 1 minute",
      "Spread sauce on both bun halves",
      "Layer lettuce, tomato, burger patty with cheese, onion, and pickles",
      "Serve immediately with fries"
    ],
    is_favorite: false
  },
  {
    name: "BBQ Pulled Pork",
    description: "Slow-cooked pork shoulder in tangy barbecue sauce",
    cuisine_type: "American",
    difficulty_level: "easy",
    prep_time: 240,
    ingredients: [
      "2kg pork shoulder",
      "2 tbsp brown sugar",
      "2 tbsp paprika",
      "1 tbsp garlic powder",
      "1 tbsp onion powder",
      "1 tsp cayenne pepper",
      "Salt and black pepper",
      "1 cup BBQ sauce",
      "Brioche buns",
      "Coleslaw for serving"
    ],
    instructions: [
      "Mix brown sugar, paprika, garlic powder, onion powder, cayenne, salt, and pepper",
      "Rub spice mixture all over pork shoulder, let sit 1 hour",
      "Preheat oven to 160°C (325°F)",
      "Place pork in roasting pan, cover tightly with foil",
      "Cook for 3-4 hours until internal temperature reaches 90°C and meat shreds easily",
      "Remove from oven, let rest 20 minutes",
      "Shred meat with two forks, discarding fat",
      "Mix shredded pork with BBQ sauce to taste",
      "Serve on toasted buns with coleslaw"
    ],
    is_favorite: false
  },
  {
    name: "Buffalo Chicken Wings",
    description: "Crispy chicken wings tossed in spicy buffalo sauce",
    cuisine_type: "American",
    difficulty_level: "easy",
    prep_time: 45,
    ingredients: [
      "2kg chicken wings, split",
      "1/2 cup hot sauce (Frank's RedHot)",
      "4 tbsp butter",
      "1 tbsp white vinegar",
      "1/2 tsp garlic powder",
      "Vegetable oil for frying",
      "Blue cheese dressing",
      "Celery sticks",
      "Salt and pepper"
    ],
    instructions: [
      "Pat wings dry and season with salt and pepper",
      "Heat oil to 190°C (375°F) in deep fryer or large pot",
      "Fry wings in batches for 10-12 minutes until golden and crispy",
      "Meanwhile, melt butter in saucepan, whisk in hot sauce, vinegar, and garlic powder",
      "Drain fried wings on paper towels briefly",
      "Toss hot wings in buffalo sauce until well coated",
      "Serve immediately with blue cheese dressing and celery sticks"
    ],
    is_favorite: false
  },
  {
    name: "Mac and Cheese",
    description: "Creamy baked macaroni and cheese with crispy breadcrumb topping",
    cuisine_type: "American",
    difficulty_level: "easy",
    prep_time: 45,
    ingredients: [
      "500g elbow macaroni",
      "4 tbsp butter",
      "4 tbsp all-purpose flour",
      "3 cups whole milk",
      "300g sharp cheddar cheese, grated",
      "100g Gruyère cheese, grated",
      "1/2 tsp mustard powder",
      "1/4 tsp cayenne pepper",
      "1 cup panko breadcrumbs",
      "2 tbsp melted butter",
      "Salt and pepper"
    ],
    instructions: [
      "Cook macaroni according to package directions until just al dente, drain",
      "Preheat oven to 200°C (400°F)",
      "In large saucepan, melt butter and whisk in flour, cook 1 minute",
      "Gradually whisk in milk, cook until thickened, about 5 minutes",
      "Remove from heat, stir in cheeses, mustard powder, cayenne until melted",
      "Season with salt and pepper, fold in cooked macaroni",
      "Transfer to buttered baking dish",
      "Mix panko with melted butter, sprinkle over top",
      "Bake 25-30 minutes until bubbly and golden on top"
    ],
    is_favorite: false
  },
  {
    name: "Chocolate Chip Cookies",
    description: "Classic American cookies with gooey chocolate chips",
    cuisine_type: "American",
    difficulty_level: "easy",
    prep_time: 25,
    ingredients: [
      "2 1/4 cups all-purpose flour",
      "1 tsp baking soda",
      "1 tsp salt",
      "1 cup butter, softened",
      "3/4 cup granulated sugar",
      "3/4 cup brown sugar",
      "2 large eggs",
      "2 tsp vanilla extract",
      "2 cups chocolate chips"
    ],
    instructions: [
      "Preheat oven to 190°C (375°F)",
      "Whisk together flour, baking soda, and salt in bowl",
      "Cream softened butter with both sugars until light and fluffy",
      "Beat in eggs one at a time, then vanilla",
      "Gradually mix in flour mixture until just combined",
      "Fold in chocolate chips",
      "Drop rounded tablespoons of dough onto ungreased baking sheets",
      "Bake 9-11 minutes until golden brown around edges",
      "Cool on baking sheet 2 minutes before transferring to wire rack"
    ],
    is_favorite: false
  }
];

try {
  console.log('Seeding database with real meal data...');
  
  // Check if we already have seeded data
  const existingMeals = db.prepare('SELECT COUNT(*) as count FROM meals WHERE user_id = 1').get();
  
  if (existingMeals.count > 0) {
    console.log('Meals already exist for user 1. Skipping seed...');
    process.exit(0);
  }
  
  // Create a demo user if it doesn't exist (user_id = 1)
  const existingUser = db.prepare('SELECT id FROM users WHERE id = 1').get();
  if (!existingUser) {
    const createUser = db.prepare(`
      INSERT INTO users (id, username, email, password_hash, preferences)
      VALUES (1, 'demo', 'demo@example.com', 'demo_hash', '{}')
    `);
    createUser.run();
    console.log('Created demo user');
  }
  
  const insertMeal = db.prepare(`
    INSERT INTO meals (user_id, name, description, cuisine_type, difficulty_level, prep_time, ingredients, instructions, is_favorite)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  // Insert each meal
  for (const meal of realMeals) {
    insertMeal.run(
      1, // user_id = 1 (demo user)
      meal.name,
      meal.description,
      meal.cuisine_type,
      meal.difficulty_level,
      meal.prep_time,
      JSON.stringify(meal.ingredients),
      JSON.stringify(meal.instructions),
      meal.is_favorite ? 1 : 0
    );
  }
  
  console.log(`Successfully seeded ${realMeals.length} real meals!`);
  console.log('Cuisines included: Italian (5), Chinese (5), Mexican (5), Indian (5), American (5)');
  
} catch (error) {
  console.error('Seeding failed:', error);
} finally {
  db.close();
}