# What to Eat Application - Complete Documentation

## Overview
A full-stack web application that helps users decide what to eat by managing meals, restaurants, and providing randomized suggestions. Built with React/TypeScript frontend and Node.js/Express backend with SQLite database.

## Architecture

### Frontend (`/src`)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React hooks (useState, useEffect)
- **Routing**: React Router DOM
- **HTTP Client**: Fetch API with custom error handling
- **UI Components**: Custom components with responsive design

### Backend (`/server`)
- **Framework**: Node.js with Express
- **Language**: TypeScript with ES modules
- **Database**: SQLite with better-sqlite3
- **Authentication**: JWT tokens with bcrypt password hashing
- **Testing**: Jest with supertest
- **Architecture**: MVC pattern with middleware

## Core Features

### 🍽️ Meal Management
- **Create/Edit/Delete meals** with name, description, tags, and preparation time
- **Tag system** for categorization (vegetarian, quick, etc.) with color coding
- **Search and filtering** by name, tags, and preparation time
- **Favorite system** to mark preferred meals
- **Preparation time tracking** (5-120 minutes)

### 🏪 Restaurant Management  
- **Add/Edit/Delete restaurants** with name, address, cuisine type, and contact info
- **Rating system** (1-5 stars) with notes
- **Tag categorization** similar to meals
- **Search and filtering** capabilities
- **Delivery/pickup preferences**

### 🎲 Random Selection System
- **Smart randomization** with weighted selection based on:
  - User preferences and favorites
  - Historical selection frequency
  - Time since last selection
  - Tag preferences
- **Filtering options** for random suggestions
- **Selection history tracking** to avoid repetition

### 🔐 User Authentication
- **User registration** with email verification
- **Secure login** with JWT tokens
- **Password requirements** with strength validation
- **Profile management** with preferences
- **Session management** with token refresh

### 🏷️ Tag System
- **Custom tags** with color coding
- **Usage statistics** showing most/least used tags
- **Cleanup utilities** to remove unused tags
- **Tag filtering** across all entities

### 🔍 Search & Discovery
- **Universal search** across meals and restaurants
- **Advanced filtering** by multiple criteria
- **Search suggestions** and autocomplete
- **Recent searches** tracking

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User authentication  
- `GET /me` - Get user profile
- `PUT /profile` - Update user profile

### Meals (`/api/meals`)
- `GET /` - List all meals with filtering
- `POST /` - Create new meal
- `GET /:id` - Get meal details
- `PUT /:id` - Update meal
- `DELETE /:id` - Delete meal
- `POST /:id/favorite` - Toggle favorite status

### Restaurants (`/api/restaurants`)
- `GET /` - List all restaurants with filtering
- `POST /` - Create new restaurant
- `GET /:id` - Get restaurant details
- `PUT /:id` - Update restaurant
- `DELETE /:id` - Delete restaurant

### Tags (`/api/tags`)
- `GET /` - List all tags
- `POST /` - Create new tag
- `GET /:id` - Get tag details
- `PUT /:id` - Update tag
- `DELETE /:id` - Delete tag
- `GET /unused` - Get unused tags
- `DELETE /unused` - Delete all unused tags
- `GET /most-used` - Get most used tags
- `GET /:id/usage` - Get tag usage statistics

### Random Selection (`/api/random`)
- `GET /suggestion` - Get random meal or restaurant suggestion
- `POST /record` - Record user's selection choice

### Search (`/api/search`)
- `GET /` - Universal search across meals and restaurants

## Database Schema

### Users Table
```sql
- id (INTEGER PRIMARY KEY)
- username (TEXT UNIQUE)
- email (TEXT UNIQUE) 
- password_hash (TEXT)
- preferences (JSON)
- created_at (DATETIME)
- updated_at (DATETIME)
```

### Meals Table
```sql
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER)
- name (TEXT)
- description (TEXT)
- preparation_time (INTEGER)
- is_favorite (BOOLEAN)
- created_at (DATETIME)
- updated_at (DATETIME)
```

### Restaurants Table  
```sql
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER)
- name (TEXT)
- address (TEXT)
- cuisine_type (TEXT)
- phone (TEXT)
- rating (INTEGER)
- notes (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)
```

### Tags Table
```sql
- id (INTEGER PRIMARY KEY)
- name (TEXT UNIQUE)
- color (TEXT)
- created_at (DATETIME)
```

### Selection History Table
```sql
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER)
- item_type (TEXT) -- 'meal' or 'restaurant'
- item_id (INTEGER)
- selected_at (DATETIME)
```

## Frontend Components

### Core Pages
- `HomePage` - Landing page with quick actions
- `MealsPage` - Meal management interface
- `RestaurantsPage` - Restaurant management interface  
- `SearchPage` - Universal search with results
- `RandomPage` - Random suggestion interface
- `ProfilePage` - User profile and settings

### Shared Components
- `Navbar` - Main navigation with authentication state
- `MealForm` - Create/edit meal form with validation
- `RestaurantForm` - Create/edit restaurant form
- `TagManager` - Tag creation and management
- `SearchFilters` - Advanced filtering controls
- `LoadingSpinner` - Loading state indicator
- `ErrorBoundary` - Error handling wrapper

### Form Components
- `LoginForm` - User authentication form
- `RegisterForm` - User registration form
- `TagInput` - Multi-select tag input component
- `RatingInput` - 5-star rating selector

## Security Features

### Authentication & Authorization
- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Token expiration and refresh
- ✅ Protected route middleware
- ✅ CORS configuration
- ✅ Environment variable configuration

### Input Validation
- ✅ Schema validation with Zod
- ✅ SQL injection prevention with prepared statements
- ✅ XSS protection with input sanitization
- ✅ Password strength requirements
- ✅ Email format validation

### Error Handling
- ✅ Global error handler middleware
- ✅ Structured error responses
- ✅ Client-side error boundaries
- ✅ Database error handling
- ✅ Network failure retry logic

## Performance Optimizations

### Frontend
- ✅ React.memo for component optimization
- ✅ useCallback for expensive operations
- ✅ Lazy loading for routes
- ✅ Image optimization
- ✅ Bundle size optimization with Vite

### Backend  
- ✅ Database indexing on key fields
- ✅ Prepared statement caching
- ✅ Connection pooling
- ✅ Response compression
- ✅ Request rate limiting

### Network
- ✅ API response caching
- ✅ Network retry logic with exponential backoff
- ✅ Offline detection and handling
- ✅ Request deduplication

## Testing Coverage

### Backend Testing (Jest + Supertest)
- ✅ Authentication endpoints (registration, login, profile)
- ✅ Tag management (CRUD, usage stats, cleanup)
- ✅ Database integration tests
- ✅ Error handling scenarios
- ✅ Rate limiting tests
- ✅ Validation tests

### Test Configuration
- ✅ ES module support with ts-jest
- ✅ In-memory SQLite for tests
- ✅ Test environment isolation
- ✅ Mock database setup/teardown
- ✅ Comprehensive API endpoint coverage

## Recent Bug Fixes & Improvements

### Critical Issues Resolved
1. **Backend Test Suite** - Fixed ES module configuration, TypeScript compilation, and Jest setup
2. **Security Vulnerabilities** - Removed hardcoded credentials, moved to environment variables
3. **Search Functionality** - Implemented complete search with error handling and filtering
4. **Network Reliability** - Added retry logic and connection monitoring
5. **Accessibility** - Added ARIA labels and screen reader support
6. **Performance** - Optimized React components and database queries

### Database & Infrastructure
- ✅ Database migration system working
- ✅ Connection handling with proper cleanup
- ✅ Environment-specific configurations
- ✅ Error logging and monitoring
- ✅ Health check endpoints

## Known Limitations & Future Enhancements

### Current Limitations
1. **No Image Support** - Meals and restaurants don't support photo uploads
2. **Basic Recommendation Algorithm** - Could be enhanced with machine learning
3. **No Social Features** - No sharing or collaborative meal planning
4. **Limited Analytics** - Basic usage tracking only
5. **No Mobile App** - Web-only interface
6. **No Integration APIs** - No third-party service integrations

### Potential Enhancements
1. **Image Management** - Photo upload for meals/restaurants with image processing
2. **Advanced Recommendations** - ML-based suggestions using eating patterns
3. **Social Features** - Share meals, collaborative planning, family accounts
4. **Nutrition Tracking** - Calorie counting and nutritional information
5. **Location Services** - GPS-based restaurant suggestions and delivery tracking
6. **Third-party Integrations** - Recipe APIs, delivery services, calendar integration
7. **Mobile Applications** - Native iOS/Android apps
8. **Analytics Dashboard** - Detailed usage statistics and insights
9. **Import/Export** - Data portability and backup features
10. **Multi-language Support** - Internationalization

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- SQLite3

### Environment Variables
```env
# Backend (.env)
DATABASE_PATH=./data/database.db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
PORT=3001

# Frontend (.env)
VITE_API_URL=http://localhost:3001/api
VITE_DEMO_PASSWORD=demo-password
```

### Running the Application
```bash
# Backend
cd server
npm install
npm run migrate
npm run seed
npm run dev

# Frontend  
npm install
npm run dev
```

### Running Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests (if implemented)
npm test
```

## Deployment Considerations

### Production Requirements
- Environment variable management
- Database backups and migrations
- SSL/TLS certificates
- Process monitoring
- Log aggregation
- Error tracking
- Performance monitoring

### Recommended Stack
- **Hosting**: Vercel/Netlify (frontend) + Railway/Heroku (backend)
- **Database**: PostgreSQL for production (SQLite for development)
- **File Storage**: AWS S3 or Cloudinary for future image uploads
- **Monitoring**: Sentry for error tracking, DataDog for performance
- **Analytics**: Google Analytics or Mixpanel for usage tracking

---

This documentation provides a comprehensive overview for AI agents to understand the current state, architecture, and areas for improvement in the What to Eat application.