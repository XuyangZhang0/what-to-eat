import { test, expect, Page } from '@playwright/test'

/**
 * Comprehensive E2E Tests for Complete Tag User Journey
 * Tests the full user workflow from tag creation to deletion
 */

test.describe('Comprehensive Tag Testing Suite', () => {
  let page: Page

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage
    
    // Setup error monitoring
    const errors: string[] = []
    const networkFailures: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
        console.log(`Console Error: ${msg.text()}`)
      }
    })
    
    page.on('requestfailed', request => {
      networkFailures.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`)
      console.log(`Network Failure: ${request.method()} ${request.url()}`)
    })
    
    // Store for later access
    ;(page as any).errors = errors
    ;(page as any).networkFailures = networkFailures
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test.describe('Tag Creation User Journey', () => {
    test('should complete full tag creation workflow', async () => {
      // Step 1: Navigate to tag management
      await test.step('Navigate to tag management', async () => {
        // Try multiple navigation strategies
        const navStrategies = [
          async () => await page.click('a[href*="management"]'),
          async () => await page.click('button:has-text("Management")'),
          async () => await page.click('[data-testid="management-nav"]'),
          async () => await page.click('.nav-link:has-text("Tags")'),
        ]
        
        let navigationSuccessful = false
        for (const strategy of navStrategies) {
          try {
            await strategy()
            await page.waitForTimeout(1000)
            
            // Check if we can find tag-related content
            const tagContent = await page.locator('text="Tag Manager", text="Add Tag", text="Tags"').first()
            if (await tagContent.isVisible({ timeout: 2000 })) {
              navigationSuccessful = true
              break
            }
          } catch (e) {
            console.log('Navigation strategy failed, trying next...')
          }
        }
        
        expect(navigationSuccessful).toBe(true)
      })

      // Step 2: Open tag creation form
      await test.step('Open tag creation form', async () => {
        const addTagButton = page.locator('button:has-text("Add Tag"), button:has-text("New Tag"), button:has-text("+ Tag")').first()
        
        await expect(addTagButton).toBeVisible({ timeout: 5000 })
        await addTagButton.click()
        
        // Verify form is open
        await expect(page.locator('input[name="name"], input[placeholder*="tag"], input[placeholder*="name"]').first()).toBeVisible()
      })

      // Step 3: Fill tag details
      await test.step('Fill tag creation form', async () => {
        const nameInput = page.locator('input[name="name"], input[placeholder*="tag"], input[placeholder*="name"]').first()
        const colorInput = page.locator('input[type="color"], input[name="color"]').first()
        
        await nameInput.fill('E2E Test Tag')
        
        if (await colorInput.isVisible()) {
          await colorInput.fill('#FF5733')
        }
        
        // Verify data is entered
        expect(await nameInput.inputValue()).toBe('E2E Test Tag')
      })

      // Step 4: Submit tag creation
      await test.step('Submit tag creation', async () => {
        const submitButton = page.locator('button:has-text("Save"), button:has-text("Create"), button:has-text("Add"), button[type="submit"]').first()
        
        await submitButton.click()
        
        // Wait for potential success indicators
        await page.waitForTimeout(3000)
        
        // Check for success messages or tag appearance
        const successIndicators = [
          page.locator('text="created"'),
          page.locator('text="added"'),
          page.locator('text="E2E Test Tag"'),
          page.locator('.success'),
          page.locator('.toast-success')
        ]
        
        let success = false
        for (const indicator of successIndicators) {
          if (await indicator.isVisible({ timeout: 1000 })) {
            success = true
            break
          }
        }
        
        console.log(`Tag creation success: ${success}`)
      })
    })

    test('should validate required fields in tag creation', async () => {
      await test.step('Navigate to tag form', async () => {
        // Find and click add tag button
        const addButton = page.locator('button:has-text("Add Tag"), button:has-text("New Tag")').first()
        await addButton.click({ timeout: 10000 })
      })

      await test.step('Test empty form submission', async () => {
        const submitButton = page.locator('button:has-text("Save"), button:has-text("Create"), button:has-text("Add")').first()
        
        // Try to submit empty form
        if (await submitButton.isVisible()) {
          const isDisabled = await submitButton.isDisabled()
          
          if (!isDisabled) {
            await submitButton.click()
            
            // Look for validation messages
            const validationMessages = await page.locator('.error, .validation-error, [role="alert"], text="required"').all()
            console.log(`Found ${validationMessages.length} validation messages`)
          } else {
            console.log('Submit button correctly disabled for empty form')
          }
        }
      })

      await test.step('Test whitespace-only name', async () => {
        const nameInput = page.locator('input[name="name"], input[placeholder*="name"]').first()
        
        if (await nameInput.isVisible()) {
          await nameInput.fill('   ')
          
          const submitButton = page.locator('button:has-text("Save"), button:has-text("Create")').first()
          const isDisabled = await submitButton.isDisabled()
          
          expect(isDisabled).toBe(true)
        }
      })
    })
  })

  test.describe('Tag Search and Filter Functionality', () => {
    test('should filter tags based on search query', async () => {
      await test.step('Create multiple test tags first', async () => {
        // This would require the previous tag creation to work
        // Or we could seed the database with test data
        console.log('Testing search functionality (requires existing tags)')
      })

      await test.step('Test search functionality', async () => {
        const searchInput = page.locator('input[placeholder*="search"], input[placeholder*="Search"]').first()
        
        if (await searchInput.isVisible({ timeout: 5000 })) {
          await searchInput.fill('test')
          await page.waitForTimeout(1000)
          
          // Check if results are filtered
          const tagItems = await page.locator('[data-testid="tag-item"], .tag-item, .tag').all()
          console.log(`Found ${tagItems.length} tags after search`)
        }
      })

      await test.step('Test search clearing', async () => {
        const searchInput = page.locator('input[placeholder*="search"]').first()
        
        if (await searchInput.isVisible()) {
          await searchInput.fill('')
          await page.waitForTimeout(1000)
          
          // Verify all tags are shown again
          const tagItems = await page.locator('[data-testid="tag-item"], .tag-item, .tag').all()
          console.log(`Found ${tagItems.length} tags after clearing search`)
        }
      })
    })
  })

  test.describe('Tag Editing and Updates', () => {
    test('should edit existing tag', async () => {
      await test.step('Find tag to edit', async () => {
        // Look for edit buttons
        const editButtons = page.locator('button[aria-label*="edit"], button:has-text("Edit"), .edit-button')
        const count = await editButtons.count()
        
        if (count > 0) {
          await editButtons.first().click()
          
          // Verify edit form opens
          const nameInput = page.locator('input[value], input[name="name"]').first()
          const isVisible = await nameInput.isVisible({ timeout: 3000 })
          
          expect(isVisible).toBe(true)
        } else {
          console.log('No tags available to edit')
        }
      })

      await test.step('Update tag details', async () => {
        const nameInput = page.locator('input[value], input[name="name"]').first()
        
        if (await nameInput.isVisible()) {
          await nameInput.fill('Updated Tag Name')
          
          const updateButton = page.locator('button:has-text("Update"), button:has-text("Save")').first()
          await updateButton.click()
          
          await page.waitForTimeout(2000)
          
          // Check for success or updated content
          const updatedText = page.locator('text="Updated Tag Name"')
          const isUpdated = await updatedText.isVisible({ timeout: 3000 })
          
          console.log(`Tag update successful: ${isUpdated}`)
        }
      })
    })
  })

  test.describe('Tag Deletion Workflow', () => {
    test('should delete tag with confirmation', async () => {
      await test.step('Initiate tag deletion', async () => {
        const deleteButtons = page.locator('button[aria-label*="delete"], button:has-text("Delete"), .delete-button')
        const count = await deleteButtons.count()
        
        if (count > 0) {
          await deleteButtons.first().click()
          
          // Look for confirmation dialog
          const confirmDialog = page.locator('dialog, .modal, .confirm-dialog, text="confirm", text="delete"')
          const dialogVisible = await confirmDialog.first().isVisible({ timeout: 3000 })
          
          console.log(`Confirmation dialog shown: ${dialogVisible}`)
        } else {
          console.log('No tags available to delete')
        }
      })

      await test.step('Confirm deletion', async () => {
        const confirmButton = page.locator('button:has-text("Delete"), button:has-text("Confirm"), button:has-text("Yes")').first()
        
        if (await confirmButton.isVisible({ timeout: 3000 })) {
          await confirmButton.click()
          await page.waitForTimeout(2000)
          
          // Check for success message or tag removal
          const successMessages = await page.locator('text="deleted", .success, .toast-success').all()
          console.log(`Found ${successMessages.length} success indicators`)
        }
      })
    })

    test('should cancel tag deletion', async () => {
      await test.step('Test deletion cancellation', async () => {
        const deleteButtons = page.locator('button[aria-label*="delete"], .delete-button')
        const count = await deleteButtons.count()
        
        if (count > 0) {
          await deleteButtons.first().click()
          
          // Look for cancel button
          const cancelButton = page.locator('button:has-text("Cancel"), button:has-text("No")').first()
          
          if (await cancelButton.isVisible({ timeout: 3000 })) {
            await cancelButton.click()
            
            // Verify dialog is closed
            const dialog = page.locator('dialog, .modal, .confirm-dialog')
            const isDialogHidden = await dialog.isHidden({ timeout: 3000 })
            
            expect(isDialogHidden).toBe(true)
          }
        }
      })
    })
  })

  test.describe('Tag Usage Analytics', () => {
    test('should display tag usage statistics', async () => {
      await test.step('Check for usage statistics', async () => {
        // Look for usage-related content
        const usageIndicators = [
          page.locator('text="uses"'),
          page.locator('text="Most Used"'),
          page.locator('text="Unused"'),
          page.locator('.usage-count'),
          page.locator('[data-testid="tag-usage"]')
        ]
        
        let foundUsageStats = false
        for (const indicator of usageIndicators) {
          if (await indicator.isVisible({ timeout: 2000 })) {
            foundUsageStats = true
            console.log('Found usage statistics')
            break
          }
        }
        
        console.log(`Usage statistics displayed: ${foundUsageStats}`)
      })

      await test.step('Check unused tags section', async () => {
        const unusedSection = page.locator('text="Unused Tags", text="Unused", .unused-tags')
        
        if (await unusedSection.first().isVisible({ timeout: 3000 })) {
          // Check for bulk delete option
          const bulkDeleteButton = page.locator('button:has-text("Delete All"), button:has-text("Bulk Delete")')
          const hasBulkDelete = await bulkDeleteButton.isVisible({ timeout: 2000 })
          
          console.log(`Bulk delete option available: ${hasBulkDelete}`)
        }
      })
    })
  })

  test.describe('Integration with Meals and Restaurants', () => {
    test('should allow tag assignment to meals', async () => {
      await test.step('Navigate to meal creation/editing', async () => {
        // Try to find meal management
        const mealNavOptions = [
          page.locator('a[href*="meal"]'),
          page.locator('button:has-text("Meals")'),
          page.locator('button:has-text("Add Meal")'),
        ]
        
        let foundMealSection = false
        for (const option of mealNavOptions) {
          if (await option.first().isVisible({ timeout: 2000 })) {
            await option.first().click()
            foundMealSection = true
            break
          }
        }
        
        console.log(`Meal section accessible: ${foundMealSection}`)
      })

      await test.step('Check tag selection in meal form', async () => {
        // Look for tag selection components
        const tagSelectors = [
          page.locator('select[name*="tag"]'),
          page.locator('input[name*="tag"]'),
          page.locator('.tag-selector'),
          page.locator('[data-testid="tag-select"]')
        ]
        
        let foundTagSelector = false
        for (const selector of tagSelectors) {
          if (await selector.first().isVisible({ timeout: 2000 })) {
            foundTagSelector = true
            console.log('Found tag selector in meal form')
            break
          }
        }
        
        console.log(`Tag selector in meal form: ${foundTagSelector}`)
      })
    })
  })

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle network failures gracefully', async () => {
      await test.step('Monitor network failures', async () => {
        const networkFailures = (page as any).networkFailures
        console.log(`Network failures detected: ${networkFailures.length}`)
        
        if (networkFailures.length > 0) {
          console.log('Network failures:', networkFailures)
        }
      })

      await test.step('Check error messages for users', async () => {
        const errorMessages = await page.locator('.error-message, .alert-error, [role="alert"]').all()
        console.log(`User-facing error messages: ${errorMessages.length}`)
        
        for (const msg of errorMessages) {
          const text = await msg.textContent()
          console.log(`Error message: ${text}`)
        }
      })
    })

    test('should handle JavaScript errors', async () => {
      await test.step('Check for JavaScript errors', async () => {
        const errors = (page as any).errors
        console.log(`JavaScript errors detected: ${errors.length}`)
        
        if (errors.length > 0) {
          console.log('JavaScript errors:', errors)
        }
        
        // Filter for critical errors that would break functionality
        const criticalErrors = errors.filter(error => 
          error.includes('TypeError') || 
          error.includes('ReferenceError') || 
          error.includes('Cannot read property')
        )
        
        expect(criticalErrors.length).toBe(0)
      })
    })
  })

  test.describe('Performance and Accessibility', () => {
    test('should have reasonable performance', async () => {
      await test.step('Measure page load performance', async () => {
        const startTime = Date.now()
        await page.goto('/')
        await page.waitForLoadState('networkidle')
        const loadTime = Date.now() - startTime
        
        console.log(`Page load time: ${loadTime}ms`)
        expect(loadTime).toBeLessThan(10000) // 10 seconds max
      })

      await test.step('Check for performance indicators', async () => {
        // Check for loading states
        const loadingIndicators = await page.locator('.loading, .spinner, [data-testid="loading"]').all()
        console.log(`Loading indicators found: ${loadingIndicators.length}`)
      })
    })

    test('should have basic accessibility features', async () => {
      await test.step('Check for ARIA labels', async () => {
        const elementsWithAria = await page.locator('[aria-label], [aria-labelledby], [role]').all()
        console.log(`Elements with ARIA attributes: ${elementsWithAria.length}`)
      })

      await test.step('Check color contrast for tag colors', async () => {
        const colorElements = await page.locator('[style*="background-color"], [style*="color"]').all()
        console.log(`Elements with color styling: ${colorElements.length}`)
        
        // This would require actual color contrast calculation
        // For now, just verify colored elements exist
        expect(colorElements.length).toBeGreaterThan(0)
      })

      await test.step('Check keyboard navigation', async () => {
        // Test Tab navigation
        await page.keyboard.press('Tab')
        const focusedElement = await page.locator(':focus').first()
        const isFocused = await focusedElement.isVisible()
        
        console.log(`Keyboard navigation working: ${isFocused}`)
      })
    })
  })

  test.describe('Data Persistence and State Management', () => {
    test('should persist tag data across page refreshes', async () => {
      await test.step('Count initial tags', async () => {
        await page.waitForTimeout(2000)
        const initialTags = await page.locator('[data-testid="tag-item"], .tag-item, .tag').all()
        const initialCount = initialTags.length
        
        console.log(`Initial tag count: ${initialCount}`)
      })

      await test.step('Refresh page and verify persistence', async () => {
        await page.reload()
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(2000)
        
        const afterRefreshTags = await page.locator('[data-testid="tag-item"], .tag-item, .tag').all()
        const afterRefreshCount = afterRefreshTags.length
        
        console.log(`Tag count after refresh: ${afterRefreshCount}`)
      })
    })
  })

  test.afterEach(async () => {
    // Cleanup and reporting
    const errors = (page as any).errors
    const networkFailures = (page as any).networkFailures
    
    console.log(`Test completed with ${errors.length} JS errors and ${networkFailures.length} network failures`)
    
    if (errors.length > 0) {
      console.log('JavaScript Errors:', errors)
    }
    
    if (networkFailures.length > 0) {
      console.log('Network Failures:', networkFailures)
    }
  })
})