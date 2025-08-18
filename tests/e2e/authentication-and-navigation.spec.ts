import { test, expect } from '@playwright/test'

/**
 * Authentication and Navigation E2E Tests
 * Focused test to identify authentication and navigation issues
 */

test.describe('Authentication and Navigation Issues', () => {
  test.beforeEach(async ({ page }) => {
    // Enable detailed console logging
    page.on('console', msg => {
      console.log(`[${msg.type()}] ${msg.text()}`)
    })
    
    page.on('requestfailed', request => {
      console.log(`❌ FAILED REQUEST: ${request.method()} ${request.url()}`)
      console.log(`   Error: ${request.failure()?.errorText}`)
    })
    
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`❌ HTTP ERROR: ${response.status()} ${response.url()}`)
      }
    })
    
    await page.goto('/')
  })

  test('should analyze the main application structure', async ({ page }) => {
    console.log('🔍 Analyzing application structure...')
    
    // Take a screenshot to see the current state
    await page.screenshot({ path: 'test-results/app-homepage.png', fullPage: true })
    
    // Check page title
    const title = await page.title()
    console.log(`📄 Page title: ${title}`)
    
    // Look for main navigation elements
    const navigationElements = await page.locator('nav, [role="navigation"], .navigation, .nav').all()
    console.log(`🧭 Found ${navigationElements.length} navigation elements`)
    
    // Check for authentication elements
    const authElements = [
      'button:has-text("Login")',
      'button:has-text("Sign In")', 
      'button:has-text("Sign Up")',
      'a:has-text("Login")',
      'input[type="email"]',
      'input[type="password"]',
      '.auth-form',
      '.login-form'
    ]
    
    for (const selector of authElements) {
      try {
        const element = await page.locator(selector).first()
        if (await element.isVisible({ timeout: 1000 })) {
          console.log(`🔐 Found auth element: ${selector}`)
        }
      } catch (e) {
        // Element not found
      }
    }
    
    // Check for main app features
    const mainFeatures = [
      'button:has-text("Spin")',
      '[data-testid="slot-machine"]',
      'button:has-text("Add")',
      'button:has-text("Manage")',
      'button:has-text("Tags")',
      'button:has-text("Meals")',
      'button:has-text("Restaurants")'
    ]
    
    for (const selector of mainFeatures) {
      try {
        const element = await page.locator(selector).first()
        if (await element.isVisible({ timeout: 1000 })) {
          console.log(`✅ Found feature: ${selector}`)
        }
      } catch (e) {
        // Element not found
      }
    }
    
    // Check if there are any visible forms
    const forms = await page.locator('form').all()
    console.log(`📝 Found ${forms.length} forms`)
    
    for (let i = 0; i < forms.length; i++) {
      try {
        const form = forms[i]
        if (await form.isVisible()) {
          const inputs = await form.locator('input, textarea, select').all()
          console.log(`📝 Form ${i + 1} has ${inputs.length} input fields`)
          
          // Get input details
          for (let j = 0; j < Math.min(inputs.length, 5); j++) {
            const input = inputs[j]
            const name = await input.getAttribute('name')
            const placeholder = await input.getAttribute('placeholder')
            const type = await input.getAttribute('type')
            console.log(`   Input ${j + 1}: name="${name}", placeholder="${placeholder}", type="${type}"`)
          }
        }
      } catch (e) {
        console.log(`   Error analyzing form ${i + 1}: ${e.message}`)
      }
    }
  })

  test('should check network requests and authentication', async ({ page }) => {
    console.log('🌐 Monitoring network requests...')
    
    const requests: any[] = []
    
    page.on('request', request => {
      requests.push({
        method: request.method(),
        url: request.url(),
        headers: request.headers()
      })
    })
    
    page.on('response', async response => {
      if (response.url().includes('/api/')) {
        console.log(`🌐 API Response: ${response.status()} ${response.url()}`)
        
        if (response.status() >= 400) {
          try {
            const body = await response.text()
            console.log(`   Response body: ${body}`)
          } catch (e) {
            console.log('   Could not read response body')
          }
        }
      }
    })
    
    // Wait for the app to fully load
    await page.waitForTimeout(3000)
    
    // Try to trigger some API calls by interacting with the UI
    console.log('🔄 Attempting to trigger API calls...')
    
    // Look for any buttons that might trigger API calls
    const buttons = await page.locator('button').all()
    console.log(`🔘 Found ${buttons.length} buttons`)
    
    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      try {
        const button = buttons[i]
        if (await button.isVisible({ timeout: 500 })) {
          const text = await button.textContent()
          console.log(`🔘 Button ${i + 1}: "${text}"`)
          
          // Try clicking buttons that might load data
          if (text && (text.includes('Load') || text.includes('Get') || text.includes('Fetch') || text.includes('Refresh'))) {
            console.log(`   Clicking button: ${text}`)
            await button.click()
            await page.waitForTimeout(1000)
          }
        }
      } catch (e) {
        console.log(`   Error with button ${i + 1}: ${e.message}`)
      }
    }
    
    // Check for any API requests made
    const apiRequests = requests.filter(r => r.url.includes('/api/'))
    console.log(`🌐 Total API requests made: ${apiRequests.length}`)
    
    apiRequests.forEach((req, i) => {
      console.log(`   ${i + 1}. ${req.method} ${req.url}`)
      const authHeader = req.headers.authorization || req.headers.Authorization
      if (authHeader) {
        console.log(`      Auth header: ${authHeader.substring(0, 20)}...`)
      } else {
        console.log(`      ⚠️  No authorization header`)
      }
    })
  })

  test('should explore available routes and pages', async ({ page }) => {
    console.log('🗺️  Exploring available routes...')
    
    // Check current URL
    console.log(`📍 Current URL: ${page.url()}`)
    
    // Try common routes
    const commonRoutes = [
      '/',
      '/tags',
      '/meals', 
      '/restaurants',
      '/login',
      '/settings',
      '/manage',
      '/admin'
    ]
    
    for (const route of commonRoutes) {
      try {
        console.log(`🔗 Trying route: ${route}`)
        await page.goto(`http://10.0.6.165:5177${route}`)
        await page.waitForTimeout(1000)
        
        const title = await page.title()
        const h1 = await page.locator('h1, h2').first().textContent().catch(() => 'No heading')
        console.log(`   Title: "${title}", Heading: "${h1}"`)
        
        // Check if we got a 404 or error
        const errorIndicators = [
          'text="404"',
          'text="Not Found"',
          'text="Error"',
          '.error',
          '.not-found'
        ]
        
        let hasError = false
        for (const selector of errorIndicators) {
          try {
            const element = await page.locator(selector).first()
            if (await element.isVisible({ timeout: 500 })) {
              console.log(`   ❌ Error detected: ${selector}`)
              hasError = true
              break
            }
          } catch (e) {
            // Continue
          }
        }
        
        if (!hasError) {
          console.log(`   ✅ Route accessible`)
          
          // Take a screenshot of successful routes
          await page.screenshot({ 
            path: `test-results/route-${route.replace('/', 'home').replace(/\//g, '-')}.png` 
          })
        }
        
      } catch (e) {
        console.log(`   ❌ Error accessing route: ${e.message}`)
      }
    }
  })

  test('should test authentication flow', async ({ page }) => {
    console.log('🔐 Testing authentication flow...')
    
    // Check if we need to authenticate
    await page.goto('/')
    
    // Look for authentication forms or requirements
    const authSelectors = [
      'form[action*="login"]',
      'form[action*="auth"]',
      'input[name="email"]',
      'input[name="username"]',
      'input[name="password"]',
      'button:has-text("Login")',
      'button:has-text("Sign In")'
    ]
    
    let authFormFound = false
    for (const selector of authSelectors) {
      try {
        const element = await page.locator(selector).first()
        if (await element.isVisible({ timeout: 1000 })) {
          console.log(`🔐 Found auth element: ${selector}`)
          authFormFound = true
        }
      } catch (e) {
        // Continue
      }
    }
    
    if (!authFormFound) {
      console.log('🔐 No obvious authentication form found on homepage')
      
      // Check if there's some form of session/token management
      const storage = await page.evaluate(() => {
        return {
          localStorage: Object.keys(localStorage).reduce((acc, key) => {
            acc[key] = localStorage.getItem(key)
            return acc
          }, {} as any),
          sessionStorage: Object.keys(sessionStorage).reduce((acc, key) => {
            acc[key] = sessionStorage.getItem(key)
            return acc
          }, {} as any),
          cookies: document.cookie
        }
      })
      
      console.log('💾 Storage analysis:')
      console.log(`   LocalStorage keys: ${Object.keys(storage.localStorage)}`)
      console.log(`   SessionStorage keys: ${Object.keys(storage.sessionStorage)}`)
      console.log(`   Cookies: ${storage.cookies || 'None'}`)
      
      // Look for tokens
      const allStorageValues = {
        ...storage.localStorage,
        ...storage.sessionStorage
      }
      
      for (const [key, value] of Object.entries(allStorageValues)) {
        if (key.toLowerCase().includes('token') || key.toLowerCase().includes('auth')) {
          console.log(`   🔑 Found potential auth data: ${key} = ${String(value).substring(0, 50)}...`)
        }
      }
    }
    
    // Try to make an authenticated request
    console.log('🌐 Testing direct API call with current session...')
    
    try {
      const response = await page.request.get('http://10.0.6.165:3001/api/tags')
      console.log(`   Tags API response: ${response.status()}`)
      
      if (response.status() === 401 || response.status() === 403) {
        console.log('   ❌ Authentication required for API access')
        const body = await response.text()
        console.log(`   Response: ${body}`)
      } else if (response.status() === 200) {
        console.log('   ✅ API accessible without authentication')
      }
    } catch (e) {
      console.log(`   ❌ Error calling API: ${e.message}`)
    }
  })
})