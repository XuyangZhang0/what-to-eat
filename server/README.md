# What to Eat - Backend API

A robust REST API backend for the "What to Eat" application built with Express.js, TypeScript, and SQLite.

## Features

- **Express.js with TypeScript** - Type-safe, scalable backend
- **SQLite Database** - Lightweight, file-based database
- **JWT Authentication** - Secure user authentication
- **Smart Random Selection** - Advanced algorithm for meal/restaurant suggestions
- **Input Validation** - Comprehensive validation with Joi
- **Error Handling** - Centralized error handling and logging
- **Security Middleware** - CORS, Helmet, Rate limiting
- **RESTful API Design** - Clean, consistent API endpoints
- **Database Migrations** - Automated schema management
- **Seed Data** - Sample data for testing and development

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile
- `PUT /api/auth/me` - Update user profile
- `POST /api/auth/logout` - User logout

### Meals
- `GET /api/meals` - Get user's meals (with filtering/pagination)
- `POST /api/meals` - Create new meal
- `GET /api/meals/:id` - Get single meal
- `PUT /api/meals/:id` - Update meal
- `DELETE /api/meals/:id` - Delete meal
- `GET /api/meals/random` - Get random meal
- `GET /api/meals/search` - Search meals

### Restaurants
- `GET /api/restaurants` - Get user's restaurants (with filtering/pagination)
- `POST /api/restaurants` - Create new restaurant
- `GET /api/restaurants/:id` - Get single restaurant
- `PUT /api/restaurants/:id` - Update restaurant
- `DELETE /api/restaurants/:id` - Delete restaurant
- `GET /api/restaurants/random` - Get random restaurant
- `GET /api/restaurants/search` - Search restaurants

### Tags
- `GET /api/tags` - Get all tags
- `POST /api/tags` - Create new tag
- `PUT /api/tags/:id` - Update tag
- `DELETE /api/tags/:id` - Delete tag

### Random Selection
- `GET /api/random/suggestion` - Get random suggestion
- `POST /api/random/pick` - Pick random item and record in history
- `GET /api/random/time-based` - Get time-based suggestion
- `GET /api/random/diverse` - Get diverse suggestions
- `GET /api/random/history` - Get selection history

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run database migration:**
   ```bash
   npm run migrate
   ```

4. **Seed the database (optional):**
   ```bash
   npm run seed
   ```

### Development

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **The API will be available at:**
   - Main API: `http://localhost:3001/api`
   - Health check: `http://localhost:3001/api/health`

### Production

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

### Testing

1. **Run tests:**
   ```bash
   npm test
   ```

2. **Run tests in watch mode:**
   ```bash
   npm run test:watch
   ```

## Database Schema

### Users
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email address
- `password_hash` - Hashed password
- `preferences` - JSON preferences object
- `created_at`, `updated_at` - Timestamps

### Meals
- `id` - Primary key
- `user_id` - Foreign key to users
- `name` - Meal name
- `description` - Optional description
- `cuisine_type` - Cuisine category
- `difficulty_level` - easy/medium/hard
- `prep_time` - Preparation time in minutes
- `is_favorite` - Favorite flag
- `created_at`, `updated_at` - Timestamps

### Restaurants
- `id` - Primary key
- `user_id` - Foreign key to users
- `name` - Restaurant name
- `cuisine_type` - Cuisine category
- `address` - Restaurant address
- `phone` - Contact number
- `price_range` - $/$$/$$$/$$$$ 
- `is_favorite` - Favorite flag
- `rating` - User rating (0-5)
- `created_at`, `updated_at` - Timestamps

### Tags
- `id` - Primary key
- `name` - Tag name (unique)
- `color` - Hex color code
- `created_at` - Timestamp

### Junction Tables
- `meal_tags` - Links meals to tags
- `restaurant_tags` - Links restaurants to tags

### Selection History
- `id` - Primary key
- `user_id` - Foreign key to users
- `item_type` - 'meal' or 'restaurant'
- `item_id` - ID of selected item
- `selected_at` - Selection timestamp

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |
| `DATABASE_PATH` | SQLite database file path | ./data/database.db |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "details": { ... } // Optional additional details
}
```

## Smart Random Selection Algorithm

The random selection system includes:

- **Recent avoidance** - Excludes recently selected items
- **Favorite weighting** - Increases probability for favorites
- **Rating consideration** - Factors in restaurant ratings
- **Time-based suggestions** - Different suggestions for meal times
- **Diverse recommendations** - Avoids same cuisine types
- **Personalized suggestions** - Based on selection history

## Demo Data

Run `npm run seed` to create:
- Demo user: `demo@example.com` / `demo123!A`
- 20 sample tags with colors
- 8 sample meals with various cuisines and difficulties
- 8 sample restaurants with ratings and price ranges

## Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode

## Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Request throttling
- **Input Validation** - Joi schema validation
- **Password Hashing** - bcrypt with salt rounds
- **JWT Security** - Secure token-based authentication

## API Documentation

Once the server is running, API documentation is available at:
- Interactive docs: `http://localhost:3001/docs`
- Health check: `http://localhost:3001/api/health`

## Contributing

1. Follow TypeScript best practices
2. Write tests for new features
3. Use consistent error handling
4. Validate all inputs
5. Document API changes

## License

MIT License - see LICENSE file for details.