import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should navigate to search page', async ({ page }) => {
    await page.click('a:has-text("Search"), button:has-text("Search")')
    
    await expect(page).toHaveURL(/.*\/search/)
    await expect(page.locator('input[type="search"], input[placeholder*="search" i]')).toBeVisible()
  })

  test('should navigate to favorites page', async ({ page }) => {
    await page.click('a:has-text("Favorites"), button:has-text("Favorites")')
    
    await expect(page).toHaveURL(/.*\/favorites/)
    await expect(page.locator('h1, h2').filter({ hasText: /favorites/i })).toBeVisible()
  })

  test('should navigate to settings page', async ({ page }) => {
    await page.click('a:has-text("Settings"), button:has-text("Settings")')
    
    await expect(page).toHaveURL(/.*\/settings/)
    await expect(page.locator('h1, h2').filter({ hasText: /settings/i })).toBeVisible()
  })

  test('should navigate back to home', async ({ page }) => {
    // Go to another page first
    await page.click('a:has-text("Search"), button:has-text("Search")')
    await expect(page).toHaveURL(/.*\/search/)
    
    // Navigate back to home
    await page.click('a:has-text("Home"), button:has-text("Home")')
    
    await expect(page).toHaveURL(/^\/$|.*\/home$/)
    await expect(page.locator('button:has-text("Spin")')).toBeVisible()
  })

  test('should handle browser back/forward navigation', async ({ page }) => {
    // Navigate to search
    await page.click('a:has-text("Search"), button:has-text("Search")')
    await expect(page).toHaveURL(/.*\/search/)
    
    // Use browser back
    await page.goBack()
    await expect(page).toHaveURL(/^\/$|.*\/home$/)
    
    // Use browser forward
    await page.goForward()
    await expect(page).toHaveURL(/.*\/search/)
  })

  test('should have active navigation indicators', async ({ page }) => {
    // Check if home is active initially
    const homeNav = page.locator('nav a[href="/"], nav a[href=""], nav button').first()
    await expect(homeNav).toHaveClass(/active|current/)
    
    // Navigate to search and check active state
    await page.click('a:has-text("Search"), button:has-text("Search")')
    const searchNav = page.locator('nav a[href*="search"], nav button:has-text("Search")')
    await expect(searchNav).toHaveClass(/active|current/)
  })

  test('should work on mobile navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Mobile navigation might be in a hamburger menu or bottom navigation
    const mobileNav = page.locator('nav, [role="navigation"], .bottom-nav, .mobile-nav')
    await expect(mobileNav).toBeVisible()
    
    // Try to navigate (might need to open menu first)
    const menuButton = page.locator('button[aria-label*="menu"], button:has([data-testid*="menu"])')
    if (await menuButton.isVisible()) {
      await menuButton.click()
    }
    
    await page.click('a:has-text("Search"), button:has-text("Search")')
    await expect(page).toHaveURL(/.*\/search/)
  })

  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/non-existent-page')
    
    // Should either redirect to home or show 404 page
    const currentUrl = page.url()
    if (currentUrl.includes('non-existent-page')) {
      // If on 404 page, should show error message and way to get back
      await expect(page.locator('text*="404", text*="not found", text*="error"')).toBeVisible()
      await expect(page.locator('a:has-text("Home"), button:has-text("Home")')).toBeVisible()
    } else {
      // If redirected to home, should be on home page
      await expect(page).toHaveURL(/^\/$|.*\/home$/)
    }
  })
})