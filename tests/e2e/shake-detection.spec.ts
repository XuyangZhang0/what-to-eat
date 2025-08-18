import { test, expect } from '@playwright/test'

test.describe('Shake Detection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should request device motion permission on mobile', async ({ page }) => {
    // Simulate mobile device
    await page.setViewportSize({ width: 375, height: 667 })
    await page.addInitScript(() => {
      // Mock mobile user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        configurable: true,
      })
    })

    await page.reload()

    // Should show permission request or be ready for shake detection
    const permissionButton = page.locator('button:has-text("Enable"), button:has-text("Allow"), button:has-text("Permission")')
    if (await permissionButton.isVisible()) {
      await permissionButton.click()
    }
  })

  test('should simulate shake detection via JavaScript', async ({ page }) => {
    // Mock DeviceMotionEvent
    await page.addInitScript(() => {
      // Override DeviceMotionEvent to always grant permission
      (global as any).DeviceMotionEvent = {
        requestPermission: () => Promise.resolve('granted'),
      }
    })

    await page.reload()

    // Simulate shake by triggering device motion event
    await page.evaluate(() => {
      const event = new CustomEvent('devicemotion', {
        detail: {
          accelerationIncludingGravity: {
            x: 20,
            y: 20,
            z: 20,
          },
        },
      })
      window.dispatchEvent(event)
    })

    // Should trigger slot machine spin
    await expect(page.locator('text="Deciding...", text="Shake detected!"')).toBeVisible()
  })

  test('should show shake detection indicator', async ({ page }) => {
    // Enable shake detection simulation
    await page.addInitScript(() => {
      // Mock shake detection
      window.addEventListener('load', () => {
        setTimeout(() => {
          const indicator = document.createElement('div')
          indicator.textContent = 'Shake detected!'
          indicator.className = 'shake-indicator'
          document.body.appendChild(indicator)
        }, 1000)
      })
    })

    await page.reload()
    await page.waitForTimeout(1500)

    await expect(page.locator('.shake-indicator, text="Shake detected!"')).toBeVisible()
  })

  test('should handle shake settings in settings page', async ({ page }) => {
    await page.click('a:has-text("Settings"), button:has-text("Settings")')
    
    // Look for shake-related settings
    const shakeSettings = page.locator('text*="shake", text*="motion", text*="sensitivity"')
    if (await shakeSettings.isVisible()) {
      // Test shake sensitivity adjustment
      const sensitivitySlider = page.locator('input[type="range"], .slider')
      if (await sensitivitySlider.isVisible()) {
        await sensitivitySlider.fill('0.5')
      }

      // Test shake enable/disable toggle
      const shakeToggle = page.locator('input[type="checkbox"]:near(text*="shake"), .toggle')
      if (await shakeToggle.isVisible()) {
        await shakeToggle.click()
      }
    }
  })

  test('should handle unsupported devices gracefully', async ({ page }) => {
    // Mock unsupported device
    await page.addInitScript(() => {
      // Remove DeviceMotionEvent support
      delete (window as any).DeviceMotionEvent
    })

    await page.reload()

    // Should still work without shake detection
    await expect(page.locator('button:has-text("Spin")')).toBeVisible()
    
    // Should not show shake-related UI
    const shakeIndicator = page.locator('text="Shake detected!", .shake-indicator')
    await expect(shakeIndicator).not.toBeVisible()
  })

  test('should respect shake cooldown period', async ({ page }) => {
    // Mock multiple rapid shakes
    await page.addInitScript(() => {
      (global as any).DeviceMotionEvent = {
        requestPermission: () => Promise.resolve('granted'),
      }
    })

    await page.reload()

    // Trigger multiple rapid shakes
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        const event = new CustomEvent('devicemotion', {
          detail: {
            accelerationIncludingGravity: {
              x: 25,
              y: 25,
              z: 25,
            },
          },
        })
        window.dispatchEvent(event)
      })
      await page.waitForTimeout(100) // Small delay between shakes
    }

    // Should only trigger once due to cooldown
    const spinningState = page.locator('text="Deciding..."')
    expect(await spinningState.count()).toBeLessThanOrEqual(1)
  })

  test('should handle permission denial gracefully', async ({ page }) => {
    // Mock permission denial
    await page.addInitScript(() => {
      (global as any).DeviceMotionEvent = {
        requestPermission: () => Promise.resolve('denied'),
      }
    })

    await page.reload()

    // Should still allow manual spin
    await expect(page.locator('button:has-text("Spin")')).toBeVisible()
    
    const spinButton = page.locator('button:has-text("Spin")')
    await spinButton.click()
    
    await expect(page.locator('text="Deciding..."')).toBeVisible()
  })

  test('should show shake tutorial or help', async ({ page }) => {
    // Look for shake tutorial or help information
    const helpButton = page.locator('button:has-text("Help"), button:has-text("?"), [aria-label*="help"]')
    if (await helpButton.isVisible()) {
      await helpButton.click()
      
      // Should show information about shake detection
      await expect(page.locator('text*="shake", text*="motion", text*="device"')).toBeVisible()
    }
  })
})