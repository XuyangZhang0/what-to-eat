import { test, expect } from '@playwright/test'

/**
 * Complete Authentication Flow and CRUD Testing
 * This test identifies the authentication issue and tests the complete flow
 */

test.describe('Complete Authentication and CRUD Flow', () => {
  let authToken: string
  
  test.beforeAll(async ({ request }) => {
    console.log('🔐 Setting up authentication...')
    
    // Test registration endpoint
    try {
      const registerResponse = await request.post('http://10.0.6.165:3001/api/auth/register', {
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'testpassword123',
          confirmPassword: 'testpassword123'
        }
      })
      
      console.log(`Registration response: ${registerResponse.status()}`)
      
      if (registerResponse.status() === 201 || registerResponse.status() === 409) {
        // User created or already exists, try to login
        const loginResponse = await request.post('http://10.0.6.165:3001/api/auth/login', {
          data: {
            email: 'test@example.com',
            password: 'testpassword123'
          }
        })
        
        console.log(`Login response: ${loginResponse.status()}`)
        
        if (loginResponse.ok()) {
          const loginData = await loginResponse.json()
          authToken = loginData.accessToken
          console.log(`✅ Authentication successful. Token: ${authToken?.substring(0, 20)}...`)
        } else {
          const errorBody = await loginResponse.text()
          console.log(`❌ Login failed: ${errorBody}`)
        }
      }
    } catch (error) {
      console.log(`❌ Authentication setup failed: ${error}`)
    }
  })

  test('should test backend authentication endpoints', async ({ request }) => {
    console.log('🧪 Testing authentication endpoints...')
    
    // Test health endpoint (should be public)
    const healthResponse = await request.get('http://10.0.6.165:3001/api/health')
    console.log(`Health endpoint: ${healthResponse.status()}`)
    expect(healthResponse.status()).toBe(200)
    
    // Test protected endpoint without auth
    const unauthedResponse = await request.get('http://10.0.6.165:3001/api/tags')
    console.log(`Tags without auth: ${unauthedResponse.status()}`)
    expect(unauthedResponse.status()).toBe(401)
    
    // Test protected endpoint with auth (if we have a token)
    if (authToken) {
      const authedResponse = await request.get('http://10.0.6.165:3001/api/tags', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      console.log(`Tags with auth: ${authedResponse.status()}`)
      
      if (authedResponse.ok()) {
        const tags = await authedResponse.json()
        console.log(`✅ Successfully fetched ${tags.length} tags`)
      } else {
        const errorText = await authedResponse.text()
        console.log(`❌ Auth failed: ${errorText}`)
      }
    }
  })

  test('should test CRUD operations with authentication', async ({ request }) => {
    if (!authToken) {
      console.log('⚠️  Skipping CRUD tests - no auth token available')
      return
    }
    
    console.log('🧪 Testing CRUD operations with authentication...')
    
    const authHeaders = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
    
    // Test Tag CRUD
    console.log('📝 Testing Tag CRUD...')
    
    // Create a tag
    const createTagResponse = await request.post('http://10.0.6.165:3001/api/tags', {
      headers: authHeaders,
      data: {
        name: 'Test Tag',
        color: '#ff5733'
      }
    })
    
    console.log(`Create tag response: ${createTagResponse.status()}`)
    
    if (createTagResponse.ok()) {
      const createdTag = await createTagResponse.json()
      console.log(`✅ Tag created: ${createdTag.name}`)
      
      // Update the tag
      const updateTagResponse = await request.put(`http://10.0.6.165:3001/api/tags/${createdTag.id}`, {
        headers: authHeaders,
        data: {
          name: 'Updated Test Tag',
          color: '#33ff57'
        }
      })
      
      console.log(`Update tag response: ${updateTagResponse.status()}`)
      
      // Delete the tag
      const deleteTagResponse = await request.delete(`http://10.0.6.165:3001/api/tags/${createdTag.id}`, {
        headers: authHeaders
      })
      
      console.log(`Delete tag response: ${deleteTagResponse.status()}`)
    } else {
      const error = await createTagResponse.text()
      console.log(`❌ Tag creation failed: ${error}`)
    }
    
    // Test Meal CRUD
    console.log('🍽️  Testing Meal CRUD...')
    
    const createMealResponse = await request.post('http://10.0.6.165:3001/api/meals', {
      headers: authHeaders,
      data: {
        name: 'Test Meal',
        description: 'A test meal for E2E testing',
        cuisine: 'Test Cuisine',
        difficulty: 'Easy',
        cookingTime: 30,
        category: 'Main Course'
      }
    })
    
    console.log(`Create meal response: ${createMealResponse.status()}`)
    
    if (createMealResponse.ok()) {
      const createdMeal = await createMealResponse.json()
      console.log(`✅ Meal created: ${createdMeal.name}`)
      
      // Clean up
      await request.delete(`http://10.0.6.165:3001/api/meals/${createdMeal.id}`, {
        headers: authHeaders
      })
    } else {
      const error = await createMealResponse.text()
      console.log(`❌ Meal creation failed: ${error}`)
    }
    
    // Test Restaurant CRUD
    console.log('🏪 Testing Restaurant CRUD...')
    
    const createRestaurantResponse = await request.post('http://10.0.6.165:3001/api/restaurants', {
      headers: authHeaders,
      data: {
        name: 'Test Restaurant',
        description: 'A test restaurant for E2E testing',
        cuisine: 'Test Cuisine',
        priceRange: '$',
        location: {
          address: 'Test Address',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345'
        }
      }
    })
    
    console.log(`Create restaurant response: ${createRestaurantResponse.status()}`)
    
    if (createRestaurantResponse.ok()) {
      const createdRestaurant = await createRestaurantResponse.json()
      console.log(`✅ Restaurant created: ${createdRestaurant.name}`)
      
      // Clean up
      await request.delete(`http://10.0.6.165:3001/api/restaurants/${createdRestaurant.id}`, {
        headers: authHeaders
      })
    } else {
      const error = await createRestaurantResponse.text()
      console.log(`❌ Restaurant creation failed: ${error}`)
    }
  })

  test('should identify frontend authentication issues', async ({ page }) => {
    console.log('🔍 Analyzing frontend authentication implementation...')
    
    // Monitor network requests to see authentication failures
    const apiRequests: any[] = []
    const authErrors: any[] = []
    
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers()
        })
      }
    })
    
    page.on('response', async response => {
      if (response.url().includes('/api/') && response.status() === 401) {
        try {
          const body = await response.text()
          authErrors.push({
            url: response.url(),
            status: response.status(),
            body: body
          })
          console.log(`❌ 401 Error: ${response.url()} - ${body}`)
        } catch (e) {
          // Ignore
        }
      }
    })
    
    // Navigate to management page
    await page.goto('/management')
    await page.waitForTimeout(2000)
    
    // Try to access tags management
    try {
      const tagsButton = page.locator('button:has-text("Manage Tags")')
      if (await tagsButton.isVisible({ timeout: 5000 })) {
        console.log('📝 Clicking on Manage Tags...')
        await tagsButton.click()
        await page.waitForTimeout(3000)
        
        // Look for any error messages or empty states
        const errorMessages = await page.locator('.error, .alert-error, [role="alert"]').all()
        for (const error of errorMessages) {
          if (await error.isVisible()) {
            const text = await error.textContent()
            console.log(`❌ Error message found: ${text}`)
          }
        }
        
        // Check if tag creation form is available
        const addTagButton = page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")')
        if (await addTagButton.first().isVisible({ timeout: 3000 })) {
          console.log('📝 Found add tag button, testing form...')
          await addTagButton.first().click()
          await page.waitForTimeout(1000)
          
          // Try to fill and submit the form
          const nameInput = page.locator('input[name="name"], input[placeholder*="name"]')
          if (await nameInput.first().isVisible({ timeout: 2000 })) {
            await nameInput.first().fill('Test Tag From Frontend')
            
            const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")')
            if (await submitButton.first().isVisible({ timeout: 2000 })) {
              await submitButton.first().click()
              await page.waitForTimeout(3000)
            }
          }
        } else {
          console.log('❌ No add tag button found')
        }
      } else {
        console.log('❌ Manage Tags button not found')
      }
    } catch (error) {
      console.log(`❌ Error testing tags: ${error}`)
    }
    
    // Try meals management
    try {
      await page.goto('/management')
      await page.waitForTimeout(1000)
      
      const mealsButton = page.locator('button:has-text("Manage Meals")')
      if (await mealsButton.isVisible({ timeout: 5000 })) {
        console.log('🍽️  Clicking on Manage Meals...')
        await mealsButton.click()
        await page.waitForTimeout(3000)
        
        const addMealButton = page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")')
        if (await addMealButton.first().isVisible({ timeout: 3000 })) {
          console.log('🍽️  Found add meal button, testing form...')
          await addMealButton.first().click()
          await page.waitForTimeout(1000)
          
          // Try to fill meal form
          const nameInput = page.locator('input[name="name"], input[placeholder*="name"]')
          if (await nameInput.first().isVisible({ timeout: 2000 })) {
            await nameInput.first().fill('Test Meal From Frontend')
            
            const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")')
            if (await submitButton.first().isVisible({ timeout: 2000 })) {
              await submitButton.first().click()
              await page.waitForTimeout(3000)
            }
          }
        }
      }
    } catch (error) {
      console.log(`❌ Error testing meals: ${error}`)
    }
    
    // Report findings
    console.log(`\n📊 SUMMARY OF FINDINGS:`)
    console.log(`- Total API requests made: ${apiRequests.length}`)
    console.log(`- Authentication errors (401): ${authErrors.length}`)
    
    if (authErrors.length > 0) {
      console.log(`\n❌ CRITICAL ISSUE IDENTIFIED:`)
      console.log(`The frontend is making API requests without authentication headers.`)
      console.log(`All API endpoints require authentication, but the frontend is not sending tokens.`)
      console.log(`\nFailed requests:`)
      authErrors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error.url} - ${error.body}`)
      })
    }
    
    // Check for Authorization headers in requests
    const requestsWithAuth = apiRequests.filter(req => 
      req.headers.authorization || req.headers.Authorization
    )
    
    console.log(`\n🔐 Authentication header analysis:`)
    console.log(`- Requests with auth headers: ${requestsWithAuth.length}`)
    console.log(`- Requests without auth headers: ${apiRequests.length - requestsWithAuth.length}`)
    
    if (requestsWithAuth.length === 0 && apiRequests.length > 0) {
      console.log(`\n❌ ROOT CAUSE CONFIRMED:`)
      console.log(`The frontend is not implementing authentication. All API requests are made without Authorization headers.`)
      console.log(`This is why users cannot add Tags or Recipes - the backend rejects unauthenticated requests.`)
    }
  })

  test('should provide fix recommendations', async () => {
    console.log(`\n🔧 RECOMMENDED FIXES:`)
    console.log(`\n1. IMMEDIATE FIX - Update frontend API client:`)
    console.log(`   File: src/services/api.ts`)
    console.log(`   Problem: fetchApi function doesn't include authentication headers`)
    console.log(`   Solution: Add Authorization header with Bearer token`)
    console.log(`\n2. AUTHENTICATION FLOW:`)
    console.log(`   - Add login/register UI components`)
    console.log(`   - Implement token storage (localStorage/sessionStorage)`)
    console.log(`   - Add authentication context/hooks`)
    console.log(`   - Update API calls to include stored token`)
    console.log(`\n3. USER EXPERIENCE:`)
    console.log(`   - Add authentication check on app startup`)
    console.log(`   - Redirect unauthenticated users to login`)
    console.log(`   - Show proper error messages for auth failures`)
    console.log(`\n4. TEMPORARY WORKAROUND:`)
    console.log(`   - Modify backend to make certain endpoints public for testing`)
    console.log(`   - Or implement guest user tokens`)
  })
})