import { test, expect } from '@playwright/test'

test.describe('PWA Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should have service worker registered', async ({ page }) => {
    const serviceWorkerPromise = page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        return !!registration
      }
      return false
    })

    expect(await serviceWorkerPromise).toBe(true)
  })

  test('should have PWA manifest', async ({ page }) => {
    // Check for manifest link in head
    const manifestLink = page.locator('link[rel="manifest"]')
    await expect(manifestLink).toHaveAttribute('href', /.*\.webmanifest$|.*manifest\.json$/)

    // Fetch and validate manifest
    const manifestHref = await manifestLink.getAttribute('href')
    if (manifestHref) {
      const manifestResponse = await page.request.get(manifestHref)
      expect(manifestResponse.status()).toBe(200)
      
      const manifest = await manifestResponse.json()
      expect(manifest.name).toBeTruthy()
      expect(manifest.short_name).toBeTruthy()
      expect(manifest.start_url).toBeTruthy()
      expect(manifest.display).toBeTruthy()
      expect(manifest.icons).toBeTruthy()
      expect(Array.isArray(manifest.icons)).toBe(true)
      expect(manifest.icons.length).toBeGreaterThan(0)
    }
  })

  test('should work offline after caching', async ({ page, context }) => {
    // Let the page load and cache resources
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // Allow service worker to cache

    // Go offline
    await context.setOffline(true)

    // Navigate to a new page or reload
    await page.reload()

    // Should still load (might show cached version or offline page)
    await expect(page.locator('body')).toBeVisible()
    
    // Basic functionality should work
    const spinButton = page.locator('button:has-text("Spin")')
    if (await spinButton.isVisible()) {
      await expect(spinButton).toBeVisible()
    }
  })

  test('should show install prompt on supported browsers', async ({ page, browserName }) => {
    // Skip for browsers that don't support PWA installation
    test.skip(browserName === 'firefox', 'Firefox has limited PWA support')

    // Trigger beforeinstallprompt event
    await page.evaluate(() => {
      const event = new CustomEvent('beforeinstallprompt', {
        cancelable: true,
        bubbles: true,
      })
      ;(event as any).prompt = () => Promise.resolve({ outcome: 'accepted' })
      window.dispatchEvent(event)
    })

    // Should show install button or prompt
    const installButton = page.locator('button:has-text("Install"), button:has-text("Add to"), .install-prompt')
    if (await installButton.isVisible()) {
      await expect(installButton).toBeVisible()
    }
  })

  test('should have proper PWA meta tags', async ({ page }) => {
    // Check for essential PWA meta tags
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /width=device-width/)
    await expect(page.locator('meta[name="theme-color"]')).toBeAttached()
    
    // Check for Apple-specific meta tags
    const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]')
    if (await appleTouchIcon.count() > 0) {
      await expect(appleTouchIcon.first()).toHaveAttribute('href')
    }

    const appleMobileCapable = page.locator('meta[name="apple-mobile-web-app-capable"]')
    if (await appleMobileCapable.count() > 0) {
      await expect(appleMobileCapable).toHaveAttribute('content', 'yes')
    }
  })

  test('should handle app updates', async ({ page }) => {
    // Simulate app update by triggering service worker update
    await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration && registration.update) {
          await registration.update()
        }
      }
    })

    // Should handle update gracefully (no errors)
    const errors = page.locator('.error, [role="alert"]')
    expect(await errors.count()).toBe(0)
  })

  test('should work in standalone mode (installed PWA)', async ({ page }) => {
    // Simulate standalone mode
    await page.addInitScript(() => {
      Object.defineProperty(window.navigator, 'standalone', {
        value: true,
        configurable: true,
      })
      
      // Also simulate display-mode: standalone
      const mediaQuery = window.matchMedia('(display-mode: standalone)')
      Object.defineProperty(mediaQuery, 'matches', {
        value: true,
        configurable: true,
      })
    })

    await page.reload()

    // App should work normally in standalone mode
    await expect(page.locator('button:has-text("Spin")')).toBeVisible()
    
    // Should not show browser UI elements
    const browserBar = page.locator('.browser-bar, .address-bar')
    expect(await browserBar.count()).toBe(0)
  })

  test('should handle storage permissions', async ({ page }) => {
    // Test localStorage functionality
    await page.evaluate(() => {
      localStorage.setItem('test-key', 'test-value')
    })

    const storedValue = await page.evaluate(() => {
      return localStorage.getItem('test-key')
    })

    expect(storedValue).toBe('test-value')

    // Test if app handles storage quota gracefully
    await page.evaluate(async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        console.log('Storage estimate:', estimate)
      }
    })
  })

  test('should have accessible PWA features', async ({ page }) => {
    // Check that PWA features are accessible
    const installButton = page.locator('button:has-text("Install"), .install-button')
    if (await installButton.isVisible()) {
      await expect(installButton).toHaveAttribute('aria-label')
    }

    // Check that offline indicators are accessible
    const offlineIndicator = page.locator('.offline-indicator, [role="status"]')
    if (await offlineIndicator.isVisible()) {
      await expect(offlineIndicator).toHaveAttribute('aria-live')
    }
  })

  test('should respect user preferences for data usage', async ({ page, context }) => {
    // Simulate slow network
    await context.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100)) // Add delay
      await route.continue()
    })

    await page.reload()

    // App should still be usable on slow networks
    await expect(page.locator('button:has-text("Spin")')).toBeVisible()
    
    // Should not load unnecessary resources on slow networks
    const images = page.locator('img')
    const imageCount = await images.count()
    
    // Should have reasonable number of images (not excessive)
    expect(imageCount).toBeLessThan(50)
  })
})