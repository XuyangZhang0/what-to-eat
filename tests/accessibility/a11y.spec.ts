import { test, expect } from '@playwright/test'

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should have proper page structure and landmarks', async ({ page }) => {
    // Check for main landmark
    await expect(page.locator('main, [role="main"]')).toBeVisible()
    
    // Check for navigation landmark
    await expect(page.locator('nav, [role="navigation"]')).toBeVisible()
    
    // Check for proper heading hierarchy
    const headings = page.locator('h1, h2, h3, h4, h5, h6')
    const headingCount = await headings.count()
    expect(headingCount).toBeGreaterThan(0)
    
    // Should have at least one h1
    await expect(page.locator('h1')).toHaveCount(1)
  })

  test('should have keyboard navigation support', async ({ page }) => {
    // Test Tab navigation
    await page.keyboard.press('Tab')
    
    let activeElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(['BUTTON', 'A', 'INPUT', 'SELECT']).toContain(activeElement)
    
    // Continue tabbing through interactive elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      activeElement = await page.evaluate(() => document.activeElement?.tagName)
      
      if (activeElement) {
        expect(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA']).toContain(activeElement)
      }
    }
    
    // Test Shift+Tab for reverse navigation
    await page.keyboard.press('Shift+Tab')
    const reversedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA']).toContain(reversedElement)
  })

  test('should have proper ARIA labels and roles', async ({ page }) => {
    // Check that buttons have accessible names
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const hasAccessibleName = await button.evaluate((btn) => {
        return !!(
          btn.getAttribute('aria-label') ||
          btn.getAttribute('aria-labelledby') ||
          btn.textContent?.trim() ||
          btn.querySelector('img')?.getAttribute('alt')
        )
      })
      
      expect(hasAccessibleName).toBe(true)
    }
    
    // Check for proper ARIA roles where needed
    const customElements = page.locator('[role]')
    if (await customElements.count() > 0) {
      const roles = await customElements.evaluateAll((elements) => 
        elements.map(el => el.getAttribute('role'))
      )
      
      // Ensure roles are valid
      const validRoles = [
        'button', 'link', 'navigation', 'main', 'banner', 'contentinfo',
        'search', 'form', 'dialog', 'alert', 'status', 'region',
        'tablist', 'tab', 'tabpanel', 'menu', 'menuitem', 'listbox'
      ]
      
      roles.forEach(role => {
        if (role) {
          expect(validRoles).toContain(role)
        }
      })
    }
  })

  test('should support screen reader users', async ({ page }) => {
    // Check for skip links
    const skipLink = page.locator('a[href="#main"], a[href="#content"], .skip-link')
    if (await skipLink.isVisible()) {
      await expect(skipLink).toHaveText(/skip/i)
    }
    
    // Check that images have alt text
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const hasAlt = await img.getAttribute('alt')
      const isDecorative = await img.evaluate((image) => 
        image.getAttribute('role') === 'presentation' || 
        image.getAttribute('aria-hidden') === 'true'
      )
      
      // Images should either have alt text or be marked as decorative
      expect(hasAlt !== null || isDecorative).toBe(true)
    }
    
    // Check for live regions for dynamic content
    const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]')
    if (await liveRegions.count() > 0) {
      const liveValues = await liveRegions.evaluateAll((elements) =>
        elements.map(el => el.getAttribute('aria-live') || el.getAttribute('role'))
      )
      
      liveValues.forEach(value => {
        expect(['polite', 'assertive', 'off', 'status', 'alert']).toContain(value)
      })
    }
  })

  test('should have sufficient color contrast', async ({ page }) => {
    // Check text contrast (basic check)
    const textElements = page.locator('p, span, div, h1, h2, h3, h4, h5, h6, button, a')
    const sampleSize = Math.min(await textElements.count(), 10) // Check first 10 elements
    
    for (let i = 0; i < sampleSize; i++) {
      const element = textElements.nth(i)
      const styles = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el)
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: computed.fontSize,
        }
      })
      
      // Ensure text is not invisible (same color as background)
      expect(styles.color).not.toBe(styles.backgroundColor)
      
      // Basic check that text has some contrast
      const rgbRegex = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/
      const textMatch = styles.color.match(rgbRegex)
      const bgMatch = styles.backgroundColor.match(rgbRegex)
      
      if (textMatch && bgMatch) {
        const textGray = parseInt(textMatch[1]) + parseInt(textMatch[2]) + parseInt(textMatch[3])
        const bgGray = parseInt(bgMatch[1]) + parseInt(bgMatch[2]) + parseInt(bgMatch[3])
        const contrast = Math.abs(textGray - bgGray)
        
        // Basic contrast check (not full WCAG calculation)
        expect(contrast).toBeGreaterThan(100)
      }
    }
  })

  test('should be navigable with keyboard only', async ({ page }) => {
    // Test that all interactive elements can be reached and activated
    const spinButton = page.locator('button:has-text("Spin")')
    
    if (await spinButton.isVisible()) {
      // Navigate to spin button with keyboard
      await page.keyboard.press('Tab')
      
      let attempts = 0
      while (attempts < 20) {
        const focused = await page.evaluate(() => document.activeElement)
        const isSpinButton = await page.evaluate((button) => 
          document.activeElement === button, await spinButton.elementHandle())
        
        if (isSpinButton) {
          break
        }
        
        await page.keyboard.press('Tab')
        attempts++
      }
      
      // Activate button with keyboard
      await page.keyboard.press('Enter')
      await expect(page.locator('text="Deciding...", button:has-text("Stop")')).toBeVisible()
    }
  })

  test('should have focus indicators', async ({ page }) => {
    const interactiveElements = page.locator('button, a, input, select, textarea, [tabindex]')
    const elementCount = Math.min(await interactiveElements.count(), 5)
    
    for (let i = 0; i < elementCount; i++) {
      const element = interactiveElements.nth(i)
      
      // Focus the element
      await element.focus()
      
      // Check if element has focus styles
      const hasFocusStyle = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el)
        return !!(
          computed.outline !== 'none' ||
          computed.outlineWidth !== '0px' ||
          computed.boxShadow !== 'none' ||
          el.matches(':focus-visible')
        )
      })
      
      // Element should have some kind of focus indicator
      expect(hasFocusStyle).toBe(true)
    }
  })

  test('should support high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.addInitScript(() => {
      // Mock high contrast media query
      const mediaQuery = window.matchMedia('(prefers-contrast: high)')
      Object.defineProperty(mediaQuery, 'matches', {
        value: true,
        configurable: true,
      })
    })

    await page.reload()

    // Check that app still functions in high contrast mode
    await expect(page.locator('button:has-text("Spin")')).toBeVisible()
    
    // Text should still be readable
    const textElements = page.locator('h1, h2, p, button')
    const textElement = textElements.first()
    
    if (await textElement.isVisible()) {
      const textColor = await textElement.evaluate((el) => 
        window.getComputedStyle(el).color
      )
      
      // Text should not be transparent
      expect(textColor).not.toBe('rgba(0, 0, 0, 0)')
      expect(textColor).not.toBe('transparent')
    }
  })

  test('should support reduced motion preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.addInitScript(() => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      Object.defineProperty(mediaQuery, 'matches', {
        value: true,
        configurable: true,
      })
    })

    await page.reload()

    // Check that animations are reduced or disabled
    const spinButton = page.locator('button:has-text("Spin")')
    if (await spinButton.isVisible()) {
      await spinButton.click()
      
      // Even with reduced motion, basic functionality should work
      await expect(page.locator('text="Deciding...", button:has-text("Stop")')).toBeVisible()
    }
  })

  test('should have proper form accessibility', async ({ page }) => {
    // Navigate to a page with forms (like search)
    const searchLink = page.locator('a:has-text("Search"), button:has-text("Search")')
    if (await searchLink.isVisible()) {
      await searchLink.click()
    }

    // Check form inputs have labels
    const inputs = page.locator('input, select, textarea')
    const inputCount = await inputs.count()
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)
      const hasLabel = await input.evaluate((inp) => {
        const id = inp.getAttribute('id')
        const ariaLabel = inp.getAttribute('aria-label')
        const ariaLabelledBy = inp.getAttribute('aria-labelledby')
        const label = id ? document.querySelector(`label[for="${id}"]`) : null
        
        return !!(ariaLabel || ariaLabelledBy || label)
      })
      
      expect(hasLabel).toBe(true)
    }
  })

  test('should have accessible error messages', async ({ page }) => {
    // Try to trigger form validation errors
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"]')
    
    if (await searchInput.isVisible()) {
      // Submit empty form or invalid data to trigger validation
      await searchInput.fill('')
      await page.keyboard.press('Enter')
      
      // Check for error messages
      const errorMessages = page.locator('[role="alert"], .error, [aria-invalid="true"]')
      
      if (await errorMessages.count() > 0) {
        // Error messages should be associated with form fields
        const hasAriaDescribedBy = await searchInput.evaluate((input) => 
          !!input.getAttribute('aria-describedby')
        )
        
        const hasAriaInvalid = await searchInput.evaluate((input) => 
          input.getAttribute('aria-invalid') === 'true'
        )
        
        expect(hasAriaDescribedBy || hasAriaInvalid).toBe(true)
      }
    }
  })
})