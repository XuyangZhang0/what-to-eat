import { test, expect } from '@playwright/test'

test.describe('Slot Machine Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should spin the slot machine when clicking spin button', async ({ page }) => {
    const spinButton = page.locator('button:has-text("Spin")')
    await expect(spinButton).toBeVisible()
    
    await spinButton.click()
    
    // Should show spinning state
    await expect(page.locator('text="Deciding..."')).toBeVisible()
    await expect(page.locator('button:has-text("Stop")')).toBeVisible()
  })

  test('should complete spin and show result', async ({ page }) => {
    const spinButton = page.locator('button:has-text("Spin")')
    await spinButton.click()
    
    // Wait for spin to complete (assuming 3 second default duration)
    await page.waitForTimeout(3500)
    
    // Should show celebration state
    await expect(page.locator('text="Perfect choice!"')).toBeVisible()
    await expect(page.locator('text="🎉 Your Choice 🎉"')).toBeVisible()
    
    // Should show a selected meal/restaurant
    await expect(page.locator('[data-testid="selected-result"], .result-display')).toBeVisible()
  })

  test('should stop spinning when stop button is clicked', async ({ page }) => {
    const spinButton = page.locator('button:has-text("Spin")')
    await spinButton.click()
    
    const stopButton = page.locator('button:has-text("Stop")')
    await expect(stopButton).toBeVisible()
    
    await stopButton.click()
    
    // Should immediately show result
    await expect(page.locator('text="Perfect choice!"')).toBeVisible()
  })

  test('should reset after celebration period', async ({ page }) => {
    const spinButton = page.locator('button:has-text("Spin")')
    await spinButton.click()
    
    // Wait for spin and celebration to complete
    await page.waitForTimeout(5500) // 3s spin + 2s celebration
    
    // Should return to ready state
    await expect(page.locator('text="Ready to spin!"')).toBeVisible()
    await expect(page.locator('button:has-text("Spin")')).toBeVisible()
  })

  test('should handle reset button', async ({ page }) => {
    const spinButton = page.locator('button:has-text("Spin")')
    await spinButton.click()
    
    // Look for reset button (could be during spinning or celebration)
    const resetButton = page.locator('button[aria-label*="reset"], button:has([data-testid="reset-icon"])')
    if (await resetButton.isVisible()) {
      await resetButton.click()
      
      // Should return to ready state
      await expect(page.locator('text="Ready to spin!"')).toBeVisible()
      await expect(page.locator('button:has-text("Spin")')).toBeVisible()
    }
  })

  test('should display slot machine reels', async ({ page }) => {
    // Should show multiple reels
    const reels = page.locator('[data-testid*="reel"], .slot-reel')
    await expect(reels.first()).toBeVisible()
    
    // Should have at least 3 reels (default)
    expect(await reels.count()).toBeGreaterThanOrEqual(3)
  })

  test('should handle empty or loading states gracefully', async ({ page }) => {
    // Test with no data or loading state
    await page.evaluate(() => {
      // Mock empty data state
      window.localStorage.setItem('test-empty-data', 'true')
    })
    
    await page.reload()
    
    // Should either show loading state or handle empty data gracefully
    const spinButton = page.locator('button:has-text("Spin")')
    
    if (await spinButton.isVisible()) {
      // If button is visible, it should be disabled when no data
      await expect(spinButton).toBeDisabled()
    } else {
      // Should show some kind of empty state message
      await expect(page.locator('text*="No items", text*="Loading", text*="Add some"')).toBeVisible()
    }
  })
})