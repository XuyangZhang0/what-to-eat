import { test, expect } from '@playwright/test'

test.describe('Slot Machine Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/')
  })

  test('should redirect to login when not authenticated', async ({ page }) => {
    // Should be redirected to login page
    await expect(page).toHaveURL('/login')
    
    // Should show login form
    await expect(page.locator('text=Login')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('should access slot machine after successful login', async ({ page }) => {
    // Should be on login page
    await expect(page).toHaveURL('/login')
    
    // Create a test user (in a real test, this would be seeded data)
    // For now, we'll mock the API response
    await page.route('**/api/auth/login', async (route) => {
      const json = {
        success: true,
        data: {
          user: {
            id: '1',
            username: 'testuser',
            email: 'test@example.com'
          },
          token: 'mock-jwt-token'
        },
        message: 'Login successful'
      }
      await route.fulfill({ json })
    })

    // Fill in login form
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'Test123!')
    await page.click('button[type="submit"]')
    
    // Should redirect to home page after login
    await expect(page).toHaveURL('/')
    
    // Navigate to slot machine
    await page.goto('/slot-machine')
    
    // Should show slot machine demo page
    await expect(page.locator('text=Slot Machine Demo')).toBeVisible()
    await expect(page.locator('text=Choose Content Type')).toBeVisible()
  })

  test('should show authentication error for invalid credentials', async ({ page }) => {
    // Should be on login page
    await expect(page).toHaveURL('/login')
    
    // Mock failed login response
    await page.route('**/api/auth/login', async (route) => {
      const json = {
        success: false,
        error: 'Invalid email or password'
      }
      await route.fulfill({ status: 401, json })
    })

    // Fill in login form with invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    // Should show error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible()
    
    // Should still be on login page
    await expect(page).toHaveURL('/login')
  })

  test('should handle meals API authentication requirement', async ({ page }) => {
    // Mock successful login
    await page.route('**/api/auth/login', async (route) => {
      const json = {
        success: true,
        data: {
          user: { id: '1', username: 'testuser', email: 'test@example.com' },
          token: 'mock-jwt-token'
        },
        message: 'Login successful'
      }
      await route.fulfill({ json })
    })

    // Mock meals API to require authentication
    await page.route('**/api/meals', async (route) => {
      const headers = route.request().headers()
      
      if (!headers.authorization || !headers.authorization.includes('Bearer')) {
        const json = { success: false, error: 'Access token is required' }
        await route.fulfill({ status: 401, json })
      } else {
        // Return mock meals data
        const json = {
          success: true,
          data: [
            {
              id: '1',
              name: 'Pizza Margherita',
              description: 'Classic Italian pizza',
              category: 'dinner',
              cuisine: 'italian',
              difficulty: 'easy',
              cookingTime: 30,
              ingredients: ['flour', 'tomato', 'mozzarella'],
              instructions: ['make dough', 'add toppings', 'bake'],
              image: '',
              isFavorite: false,
            }
          ]
        }
        await route.fulfill({ json })
      }
    })

    // Login first
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'Test123!')
    await page.click('button[type="submit"]')
    
    // Navigate to slot machine
    await page.goto('/slot-machine')
    
    // Click on Meals mode
    await page.click('text=Meals')
    
    // Should show loading state first
    await expect(page.locator('text=Loading items...')).toBeVisible()
    
    // Should then show the slot machine with meals loaded
    await expect(page.locator('text=What to Eat?')).toBeVisible()
    await expect(page.locator('text=Ready to spin!')).toBeVisible()
    
    // Should be able to spin the slot machine
    await page.click('text=Spin')
    
    // Should show spinning state
    await expect(page.locator('text=Deciding...')).toBeVisible()
  })

  test('should show empty state when meals API returns no data', async ({ page }) => {
    // Mock successful login
    await page.route('**/api/auth/login', async (route) => {
      const json = {
        success: true,
        data: {
          user: { id: '1', username: 'testuser', email: 'test@example.com' },
          token: 'mock-jwt-token'
        }
      }
      await route.fulfill({ json })
    })

    // Mock empty meals response
    await page.route('**/api/meals', async (route) => {
      const json = { success: true, data: [] }
      await route.fulfill({ json })
    })

    // Login
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'Test123!')
    await page.click('button[type="submit"]')
    
    // Navigate to slot machine
    await page.goto('/slot-machine')
    
    // Click on Meals mode
    await page.click('text=Meals')
    
    // Should show empty state
    await expect(page.locator('text=No items available')).toBeVisible()
    await expect(page.locator('text=Try switching to a different content type')).toBeVisible()
    await expect(page.locator('text=Use Sample Data')).toBeVisible()
    
    // Should be able to switch to sample data
    await page.click('text=Use Sample Data')
    
    // Should now show slot machine with sample data
    await expect(page.locator('text=What to Eat?')).toBeVisible()
    await expect(page.locator('text=Ready to spin!')).toBeVisible()
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock successful login
    await page.route('**/api/auth/login', async (route) => {
      const json = {
        success: true,
        data: {
          user: { id: '1', username: 'testuser', email: 'test@example.com' },
          token: 'mock-jwt-token'
        }
      }
      await route.fulfill({ json })
    })

    // Mock API error
    await page.route('**/api/meals', async (route) => {
      await route.fulfill({ status: 500, body: 'Internal Server Error' })
    })

    // Login
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'Test123!')
    await page.click('button[type="submit"]')
    
    // Navigate to slot machine
    await page.goto('/slot-machine')
    
    // Click on Meals mode
    await page.click('text=Meals')
    
    // Should show empty state when API fails
    await expect(page.locator('text=No items available')).toBeVisible()
    
    // Should offer fallback to sample data
    await expect(page.locator('text=Use Sample Data')).toBeVisible()
  })

  test('should maintain authentication state across page refreshes', async ({ page }) => {
    // Mock successful login
    await page.route('**/api/auth/login', async (route) => {
      const json = {
        success: true,
        data: {
          user: { id: '1', username: 'testuser', email: 'test@example.com' },
          token: 'mock-jwt-token'
        }
      }
      await route.fulfill({ json })
    })

    // Login
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'Test123!')
    await page.click('button[type="submit"]')
    
    // Should be redirected to home
    await expect(page).toHaveURL('/')
    
    // Refresh the page
    await page.reload()
    
    // Should still be authenticated and on home page
    await expect(page).toHaveURL('/')
    
    // Should be able to navigate to slot machine
    await page.goto('/slot-machine')
    await expect(page.locator('text=Slot Machine Demo')).toBeVisible()
  })

  test('should redirect to login when token expires', async ({ page }) => {
    // Mock successful login first
    await page.route('**/api/auth/login', async (route) => {
      const json = {
        success: true,
        data: {
          user: { id: '1', username: 'testuser', email: 'test@example.com' },
          token: 'mock-jwt-token'
        }
      }
      await route.fulfill({ json })
    })

    // Login
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'Test123!')
    await page.click('button[type="submit"]')
    
    // Navigate to slot machine
    await page.goto('/slot-machine')
    await expect(page.locator('text=Slot Machine Demo')).toBeVisible()
    
    // Mock expired token response
    await page.route('**/api/meals', async (route) => {
      const json = { success: false, error: 'Token expired' }
      await route.fulfill({ status: 401, json })
    })

    // Try to use meals mode (which will trigger API call)
    await page.click('text=Meals')
    
    // Should redirect to login page when token is invalid
    await expect(page).toHaveURL('/login')
  })
})