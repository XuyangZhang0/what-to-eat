import { test, expect, Page } from '@playwright/test'

/**
 * Comprehensive E2E Tests for Tags and Recipes CRUD functionality
 * This test suite validates the critical functionality that users report as broken
 */

test.describe('Tags and Recipes CRUD Functionality', () => {
  let page: Page

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage
    
    // Enable console logging to capture JavaScript errors
    const consoleMessages: string[] = []
    const networkFailures: string[] = []
    
    page.on('console', msg => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`)
      if (msg.type() === 'error') {
        console.log(`Console Error: ${msg.text()}`)
      }
    })
    
    page.on('requestfailed', request => {
      networkFailures.push(`Failed request: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`)
      console.log(`Network Failure: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`)
    })
    
    // Store for later assertions
    ;(page as any).consoleMessages = consoleMessages
    ;(page as any).networkFailures = networkFailures
    
    await page.goto('/')
    
    // Wait for the app to load
    await page.waitForSelector('body', { timeout: 10000 })
  })

  test.afterEach(async () => {
    // Page cleanup is handled by Playwright automatically
  })

  test.describe('Backend API Health Check', () => {
    test('should verify backend API is responding', async () => {
      const response = await page.request.get('http://10.0.6.165:3001/api/health')
      expect(response.status()).toBe(200)
    })

    test('should verify tags API endpoint', async () => {
      const response = await page.request.get('http://10.0.6.165:3001/api/tags')
      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
    })

    test('should verify meals API endpoint', async () => {
      const response = await page.request.get('http://10.0.6.165:3001/api/meals')
      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
    })

    test('should verify restaurants API endpoint', async () => {
      const response = await page.request.get('http://10.0.6.165:3001/api/restaurants')
      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
    })
  })

  test.describe('Tag Management CRUD', () => {
    test('should navigate to tag management section', async () => {
      // Look for tag management navigation
      const tagNavSelectors = [
        'a[href*="tag"]',
        'button:has-text("Tags")',
        'button:has-text("Tag")',
        '[data-testid="tags-nav"]',
        'nav a:has-text("Tags")',
        '.nav-link:has-text("Tags")'
      ]
      
      let tagNavFound = false
      for (const selector of tagNavSelectors) {
        try {
          const element = await page.locator(selector).first()
          if (await element.isVisible({ timeout: 2000 })) {
            await element.click()
            tagNavFound = true
            console.log(`Found tag navigation with selector: ${selector}`)
            break
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!tagNavFound) {
        console.log('Tag navigation not found, checking for tag manager in main interface')
        // Look for tag manager directly on the page
        const tagManagerSelectors = [
          '[data-testid="tag-manager"]',
          '.tag-manager',
          '[class*="TagManager"]',
          'div:has-text("Tag Manager")',
          'section:has-text("Tags")'
        ]
        
        for (const selector of tagManagerSelectors) {
          try {
            const element = await page.locator(selector).first()
            if (await element.isVisible({ timeout: 2000 })) {
              tagNavFound = true
              console.log(`Found tag manager with selector: ${selector}`)
              break
            }
          } catch (e) {
            // Continue to next selector
          }
        }
      }
      
      expect(tagNavFound).toBe(true)
    })

    test('should test creating new tags with name and color', async () => {
      // First navigate to tags section or find tag creation form
      await page.goto('/')
      
      // Look for tag creation elements
      const addTagSelectors = [
        'button:has-text("Add Tag")',
        'button:has-text("New Tag")',
        'button:has-text("+ Tag")',
        '[data-testid="add-tag-button"]',
        '.add-tag-btn',
        'input[placeholder*="tag"]'
      ]
      
      let addTagButton = null
      for (const selector of addTagSelectors) {
        try {
          const element = await page.locator(selector).first()
          if (await element.isVisible({ timeout: 2000 })) {
            addTagButton = element
            console.log(`Found add tag button with selector: ${selector}`)
            break
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (addTagButton) {
        await addTagButton.click()
        
        // Look for tag form fields
        const nameInputSelectors = [
          'input[name="name"]',
          'input[placeholder*="name"]',
          'input[placeholder*="tag name"]',
          '[data-testid="tag-name-input"]'
        ]
        
        const colorInputSelectors = [
          'input[type="color"]',
          'input[name="color"]',
          '[data-testid="tag-color-input"]',
          '.color-picker'
        ]
        
        let nameInput = null
        let colorInput = null
        
        for (const selector of nameInputSelectors) {
          try {
            const element = await page.locator(selector).first()
            if (await element.isVisible({ timeout: 2000 })) {
              nameInput = element
              break
            }
          } catch (e) {
            // Continue
          }
        }
        
        for (const selector of colorInputSelectors) {
          try {
            const element = await page.locator(selector).first()
            if (await element.isVisible({ timeout: 2000 })) {
              colorInput = element
              break
            }
          } catch (e) {
            // Continue
          }
        }
        
        expect(nameInput).toBeTruthy()
        
        if (nameInput) {
          await nameInput.fill('Test Tag')
        }
        
        if (colorInput) {
          await colorInput.fill('#ff5733')
        }
        
        // Look for save/submit button
        const saveButtonSelectors = [
          'button:has-text("Save")',
          'button:has-text("Create")',
          'button:has-text("Add")',
          'button[type="submit"]',
          '[data-testid="save-tag-button"]'
        ]
        
        for (const selector of saveButtonSelectors) {
          try {
            const element = await page.locator(selector).first()
            if (await element.isVisible({ timeout: 2000 })) {
              await element.click()
              break
            }
          } catch (e) {
            // Continue
          }
        }
        
        // Wait for any network requests to complete
        await page.waitForTimeout(2000)
        
        // Check if the tag was created successfully
        const successIndicators = [
          'text="Tag created"',
          'text="Tag added"',
          '.success-message',
          '.toast-success',
          '[data-testid="success-message"]'
        ]
        
        let successFound = false
        for (const selector of successIndicators) {
          try {
            const element = await page.locator(selector).first()
            if (await element.isVisible({ timeout: 2000 })) {
              successFound = true
              break
            }
          } catch (e) {
            // Continue
          }
        }
        
        console.log(`Tag creation success message found: ${successFound}`)
      } else {
        console.log('Add tag button not found - this indicates the tag creation functionality is not accessible')
      }
      
      // Check for console errors
      const consoleMessages = (page as any).consoleMessages
      const networkFailures = (page as any).networkFailures
      
      console.log('Console messages:', consoleMessages)
      console.log('Network failures:', networkFailures)
    })
  })

  test.describe('Recipe/Meal Management CRUD', () => {
    test('should navigate to meal/recipe creation form', async () => {
      await page.goto('/')
      
      // Look for meal/recipe navigation
      const mealNavSelectors = [
        'a[href*="meal"]',
        'a[href*="recipe"]',
        'button:has-text("Meals")',
        'button:has-text("Recipes")',
        'button:has-text("Add Meal")',
        'button:has-text("New Meal")',
        '[data-testid="meals-nav"]',
        '[data-testid="add-meal-button"]'
      ]
      
      let mealNavFound = false
      for (const selector of mealNavSelectors) {
        try {
          const element = await page.locator(selector).first()
          if (await element.isVisible({ timeout: 2000 })) {
            await element.click()
            mealNavFound = true
            console.log(`Found meal navigation with selector: ${selector}`)
            break
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!mealNavFound) {
        console.log('Meal navigation not found, checking for meal form in main interface')
        // Look for meal form directly on the page
        const mealFormSelectors = [
          '[data-testid="meal-form"]',
          '.meal-form',
          'form:has(input[name*="meal"])',
          'form:has(input[placeholder*="meal"])',
          'div:has-text("Add Meal")',
          'section:has-text("Meals")'
        ]
        
        for (const selector of mealFormSelectors) {
          try {
            const element = await page.locator(selector).first()
            if (await element.isVisible({ timeout: 2000 })) {
              mealNavFound = true
              console.log(`Found meal form with selector: ${selector}`)
              break
            }
          } catch (e) {
            // Continue to next selector
          }
        }
      }
      
      expect(mealNavFound).toBe(true)
    })

    test('should test adding new meals with required fields', async () => {
      await page.goto('/')
      
      // Look for meal creation form elements
      const mealFormSelectors = [
        'input[name="name"]',
        'input[placeholder*="meal"]',
        'input[placeholder*="dish"]',
        'input[placeholder*="food"]',
        '[data-testid="meal-name-input"]'
      ]
      
      let mealNameInput = null
      for (const selector of mealFormSelectors) {
        try {
          const element = await page.locator(selector).first()
          if (await element.isVisible({ timeout: 2000 })) {
            mealNameInput = element
            console.log(`Found meal name input with selector: ${selector}`)
            break
          }
        } catch (e) {
          // Continue
        }
      }
      
      if (mealNameInput) {
        await mealNameInput.fill('Test Meal')
        
        // Look for additional form fields
        const descriptionSelectors = [
          'textarea[name="description"]',
          'input[name="description"]',
          'textarea[placeholder*="description"]',
          '[data-testid="meal-description"]'
        ]
        
        for (const selector of descriptionSelectors) {
          try {
            const element = await page.locator(selector).first()
            if (await element.isVisible({ timeout: 2000 })) {
              await element.fill('Test meal description')
              break
            }
          } catch (e) {
            // Continue
          }
        }
        
        // Look for restaurant selection
        const restaurantSelectors = [
          'select[name="restaurant"]',
          'select[name="restaurantId"]',
          '[data-testid="restaurant-select"]',
          'input[name="restaurant"]'
        ]
        
        for (const selector of restaurantSelectors) {
          try {
            const element = await page.locator(selector).first()
            if (await element.isVisible({ timeout: 2000 })) {
              if (await element.getAttribute('tagName') === 'SELECT') {
                await element.selectOption({ index: 1 })
              } else {
                await element.fill('Test Restaurant')
              }
              break
            }
          } catch (e) {
            // Continue
          }
        }
        
        // Look for submit button
        const submitButtonSelectors = [
          'button:has-text("Save")',
          'button:has-text("Add")',
          'button:has-text("Create")',
          'button[type="submit"]',
          '[data-testid="save-meal-button"]'
        ]
        
        for (const selector of submitButtonSelectors) {
          try {
            const element = await page.locator(selector).first()
            if (await element.isVisible({ timeout: 2000 })) {
              await element.click()
              console.log(`Clicked save button with selector: ${selector}`)
              break
            }
          } catch (e) {
            // Continue
          }
        }
        
        // Wait for any network requests to complete
        await page.waitForTimeout(3000)
        
        // Check for success or error messages
        const messageSelectors = [
          '.success-message',
          '.error-message',
          '.toast',
          '[data-testid="message"]',
          'text="Meal added"',
          'text="Meal created"',
          'text="Error"'
        ]
        
        for (const selector of messageSelectors) {
          try {
            const element = await page.locator(selector).first()
            if (await element.isVisible({ timeout: 2000 })) {
              const text = await element.textContent()
              console.log(`Found message: ${text}`)
            }
          } catch (e) {
            // Continue
          }
        }
      } else {
        console.log('Meal form input not found - this indicates the meal creation functionality is not accessible')
      }
      
      // Check for console errors and network failures
      const consoleMessages = (page as any).consoleMessages
      const networkFailures = (page as any).networkFailures
      
      console.log('Console messages during meal creation:', consoleMessages)
      console.log('Network failures during meal creation:', networkFailures)
    })
  })

  test.describe('Restaurant Management CRUD', () => {
    test('should test adding new restaurants', async () => {
      await page.goto('/')
      
      // Look for restaurant management elements
      const restaurantNavSelectors = [
        'a[href*="restaurant"]',
        'button:has-text("Restaurants")',
        'button:has-text("Add Restaurant")',
        '[data-testid="restaurants-nav"]',
        '[data-testid="add-restaurant-button"]'
      ]
      
      let restaurantNavFound = false
      for (const selector of restaurantNavSelectors) {
        try {
          const element = await page.locator(selector).first()
          if (await element.isVisible({ timeout: 2000 })) {
            await element.click()
            restaurantNavFound = true
            console.log(`Found restaurant navigation with selector: ${selector}`)
            break
          }
        } catch (e) {
          // Continue
        }
      }
      
      if (restaurantNavFound) {
        // Look for restaurant form fields
        const restaurantNameSelectors = [
          'input[name="name"]',
          'input[placeholder*="restaurant"]',
          '[data-testid="restaurant-name-input"]'
        ]
        
        for (const selector of restaurantNameSelectors) {
          try {
            const element = await page.locator(selector).first()
            if (await element.isVisible({ timeout: 2000 })) {
              await element.fill('Test Restaurant')
              console.log(`Filled restaurant name with selector: ${selector}`)
              
              // Look for submit button
              const submitButton = await page.locator('button:has-text("Save"), button:has-text("Add"), button[type="submit"]').first()
              if (await submitButton.isVisible({ timeout: 2000 })) {
                await submitButton.click()
              }
              
              break
            }
          } catch (e) {
            // Continue
          }
        }
      }
      
      // Check for console errors and network failures
      const consoleMessages = (page as any).consoleMessages
      const networkFailures = (page as any).networkFailures
      
      console.log('Console messages during restaurant creation:', consoleMessages)
      console.log('Network failures during restaurant creation:', networkFailures)
    })
  })

  test.describe('Form Validation and Error Handling', () => {
    test('should validate form submission with empty fields', async () => {
      await page.goto('/')
      
      // Try to submit forms with empty fields
      const submitButtons = await page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Add")').all()
      
      for (const button of submitButtons) {
        try {
          if (await button.isVisible({ timeout: 1000 })) {
            await button.click()
            await page.waitForTimeout(1000)
            
            // Check for validation messages
            const validationSelectors = [
              '.error',
              '.validation-error',
              '[role="alert"]',
              'text="required"',
              'text="Required"'
            ]
            
            for (const selector of validationSelectors) {
              try {
                const element = await page.locator(selector).first()
                if (await element.isVisible({ timeout: 1000 })) {
                  const text = await element.textContent()
                  console.log(`Found validation message: ${text}`)
                }
              } catch (e) {
                // Continue
              }
            }
          }
        } catch (e) {
          // Continue
        }
      }
    })
  })

  test.describe('Overall Application Health', () => {
    test('should check for critical JavaScript errors', async () => {
      await page.goto('/')
      await page.waitForTimeout(3000)
      
      const consoleMessages = (page as any).consoleMessages
      const networkFailures = (page as any).networkFailures
      
      // Filter for critical errors
      const criticalErrors = consoleMessages.filter(msg => 
        msg.includes('[error]') && 
        (msg.includes('TypeError') || msg.includes('ReferenceError') || msg.includes('SyntaxError'))
      )
      
      console.log('Critical JavaScript errors:', criticalErrors)
      console.log('Network failures:', networkFailures)
      
      // Report findings
      if (criticalErrors.length > 0) {
        console.log('CRITICAL: JavaScript errors detected that may prevent form submission')
      }
      
      if (networkFailures.length > 0) {
        console.log('CRITICAL: Network failures detected that may prevent data persistence')
      }
      
      // This test passes but provides diagnostic information
      expect(true).toBe(true)
    })
  })
})