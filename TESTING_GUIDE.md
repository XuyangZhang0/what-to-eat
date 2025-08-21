# What to Eat - Testing Guide

## 🚀 Quick Start
1. Frontend: http://localhost:5174
2. Backend: http://localhost:3001
3. Login or create account to test features

## ✅ Feature Testing Checklist

### 1. Restaurant Autocomplete & Form Auto-Population
**Location**: Add Restaurant page

**Steps**:
- [ ] Click "Add Restaurant" 
- [ ] Start typing in restaurant name field (try "McD", "Pizza", etc.)
- [ ] Verify dropdown appears with suggestions
- [ ] Select a suggestion from dropdown
- [ ] Verify form fields auto-populate (address, phone, etc.)
- [ ] Verify success toast appears
- [ ] Try typing a completely new restaurant name
- [ ] Verify you can still create new restaurants

### 2. Opening Hours Editor
**Location**: Add/Edit Restaurant page

**Steps**:
- [ ] Scroll to "Opening Hours" section
- [ ] Click "Business Hours" preset - verify Mon-Fri 9-5, Sun closed
- [ ] Click "Restaurant" preset - verify 11-22 daily
- [ ] Click "Retail" preset - verify 10-20 daily
- [ ] Toggle a day closed/open
- [ ] Set custom hours for a specific day
- [ ] Click "Copy to All" and verify it copies to all days
- [ ] Save restaurant and re-edit to verify persistence

### 3. Multiple Suggestions Setting
**Location**: Settings page → Slot Machine section

**Steps**:
- [ ] Find "Number of Suggestions" setting
- [ ] Click to cycle: 1 → 2 → 3 → 1 suggestions
- [ ] Go to Home page slot machine
- [ ] Click "Spin" and verify correct number of results show
- [ ] Change setting to different value and test again

### 4. Slot Machine with Opening Hours Logic
**Location**: Home page

**Prerequisites**: Create restaurants with different opening hours

**Steps**:
- [ ] Create Restaurant A: Open today
- [ ] Create Restaurant B: Closed today (toggle current day closed)
- [ ] Run slot machine multiple times
- [ ] Verify Restaurant A can be selected
- [ ] Verify Restaurant B is avoided (doesn't appear in results)
- [ ] Test with multiple restaurants with mixed schedules

### 5. Meal Form (Category Removal)
**Location**: Add Meal page

**Steps**:
- [ ] Verify NO "Category" dropdown exists
- [ ] Fill out meal form with: name, cuisine, difficulty
- [ ] Save meal successfully
- [ ] View meals list - verify no category badges shown
- [ ] Search/filter meals - verify no category filter option

### 6. UI Components & Navigation
**Steps**:
- [ ] Test dark/light theme toggle
- [ ] Navigate between all pages (Home, Meals, Restaurants, Settings)
- [ ] Test mobile responsive design (resize browser)
- [ ] Verify all buttons and links work
- [ ] Test search functionality

## 🐛 Common Issues & Solutions

### Backend Connection Issues
- Verify backend running on http://localhost:3001
- Check API health: http://localhost:3001/api/health
- Look for CORS errors in browser console

### Database Issues
- Backend should auto-create SQLite database
- Check server logs for migration messages
- Database file location: `server/database.sqlite`

### Frontend Issues
- Clear browser cache and localStorage
- Check browser console for errors
- Verify frontend running on http://localhost:5174

## 📊 Testing Data Suggestions

### Sample Restaurants
1. **McDonald's** - Fast food, open daily 6-23
2. **Local Pizza** - Italian, closed Mondays
3. **Coffee Shop** - Business hours M-F 7-17
4. **Fine Dining** - Open Wed-Sun 17-23

### Sample Meals  
1. **Spaghetti Carbonara** - Italian, Medium difficulty
2. **Chicken Stir Fry** - Asian, Easy difficulty
3. **Beef Wellington** - British, Hard difficulty

## 🔧 Developer Testing Commands

```bash
# Run frontend tests (some may fail due to mocking issues)
npm test

# Run E2E tests
npm run test:e2e

# Build for production (checks TypeScript errors)
npm run build

# Check linting
npm run lint
```

## 📱 Mobile Testing
- Test on mobile device or browser dev tools
- Verify slot machine works on mobile
- Test shake detection (if available)
- Check responsive layouts

## 🎯 Key Success Criteria

✅ **Restaurant Autocomplete**: Search works, fields populate
✅ **Opening Hours**: Can set schedules, slot machine respects them  
✅ **Multiple Suggestions**: Settings work, slot machine shows 1-3 items
✅ **No Categories**: Meal forms don't have category fields
✅ **General Functionality**: CRUD operations work for meals & restaurants