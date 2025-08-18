import { test, expect } from '@playwright/test'

test.describe('What to Eat App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the home page', async ({ page }) => {
    await expect(page).toHaveTitle(/What to Eat/i)
    await expect(page.locator('h1, h2').first()).toContainText(/what to eat/i)
  })

  test('should display the slot machine', async ({ page }) => {
    await expect(page.locator('[data-testid="slot-machine"]')).toBeVisible()
    await expect(page.locator('button:has-text("Spin")')).toBeVisible()
  })

  test('should have navigation menu', async ({ page }) => {
    // Check for navigation elements
    await expect(page.locator('nav, [role="navigation"]')).toBeVisible()
    
    // Check for common navigation links
    const navLinks = ['Home', 'Search', 'Favorites', 'Settings']
    for (const link of navLinks) {
      await expect(page.locator(`a:has-text("${link}"), button:has-text("${link}")`)).toBeVisible()
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone size
    
    await expect(page.locator('h1, h2').first()).toBeVisible()
    await expect(page.locator('button:has-text("Spin")')).toBeVisible()
  })
})