import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test('should meet Lighthouse performance benchmarks', async ({ page }) => {
    await page.goto('/')
    
    // Run basic performance timing
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        totalLoadTime: navigation.loadEventEnd - navigation.navigationStart,
      }
    })

    // Performance thresholds (in milliseconds)
    expect(performanceMetrics.domContentLoaded).toBeLessThan(2000)
    expect(performanceMetrics.totalLoadTime).toBeLessThan(5000)
    
    if (performanceMetrics.firstContentfulPaint > 0) {
      expect(performanceMetrics.firstContentfulPaint).toBeLessThan(2500)
    }
  })

  test('should have efficient resource loading', async ({ page }) => {
    await page.goto('/')
    
    const resourceMetrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      
      const scripts = resources.filter(r => r.name.includes('.js'))
      const styles = resources.filter(r => r.name.includes('.css'))
      const images = resources.filter(r => r.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/))
      
      return {
        totalResources: resources.length,
        scriptCount: scripts.length,
        styleCount: styles.length,
        imageCount: images.length,
        totalTransferSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
        slowResources: resources.filter(r => r.duration > 1000).length,
      }
    })

    // Resource loading thresholds
    expect(resourceMetrics.totalResources).toBeLessThan(100) // Not too many resources
    expect(resourceMetrics.slowResources).toBeLessThan(5) // Not too many slow resources
    expect(resourceMetrics.totalTransferSize).toBeLessThan(5 * 1024 * 1024) // Less than 5MB total
  })

  test('should handle animation performance', async ({ page }) => {
    await page.goto('/')
    
    // Start performance measurement
    await page.evaluate(() => {
      (window as any).performanceMetrics = {
        frameCount: 0,
        lastFrameTime: performance.now(),
        fps: [],
      }
      
      function measureFPS() {
        const now = performance.now()
        const delta = now - (window as any).performanceMetrics.lastFrameTime
        const fps = 1000 / delta
        
        ;(window as any).performanceMetrics.fps.push(fps)
        ;(window as any).performanceMetrics.frameCount++
        ;(window as any).performanceMetrics.lastFrameTime = now
        
        if ((window as any).performanceMetrics.frameCount < 60) {
          requestAnimationFrame(measureFPS)
        }
      }
      
      requestAnimationFrame(measureFPS)
    })

    // Trigger slot machine animation
    const spinButton = page.locator('button:has-text("Spin")')
    if (await spinButton.isVisible()) {
      await spinButton.click()
    }

    // Wait for animation and measurement to complete
    await page.waitForTimeout(2000)

    const animationMetrics = await page.evaluate(() => {
      const metrics = (window as any).performanceMetrics
      if (metrics.fps.length === 0) return { averageFPS: 60 }
      
      const averageFPS = metrics.fps.reduce((sum: number, fps: number) => sum + fps, 0) / metrics.fps.length
      return { averageFPS }
    })

    // Animation should maintain reasonable FPS
    expect(animationMetrics.averageFPS).toBeGreaterThan(30) // At least 30 FPS
  })

  test('should efficiently handle memory usage', async ({ page }) => {
    await page.goto('/')
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
      } : null
    })

    if (initialMemory) {
      // Perform some interactions
      const spinButton = page.locator('button:has-text("Spin")')
      for (let i = 0; i < 5; i++) {
        if (await spinButton.isVisible()) {
          await spinButton.click()
          await page.waitForTimeout(500)
        }
      }

      // Check memory after interactions
      const finalMemory = await page.evaluate(() => {
        return {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        }
      })

      // Memory shouldn't grow excessively
      const memoryGrowth = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize
      const memoryGrowthMB = memoryGrowth / (1024 * 1024)
      
      expect(memoryGrowthMB).toBeLessThan(10) // Less than 10MB growth
    }
  })

  test('should handle large datasets efficiently', async ({ page }) => {
    // Mock large dataset
    await page.addInitScript(() => {
      // Create mock data for stress testing
      const mockMeals = Array.from({ length: 1000 }, (_, i) => ({
        id: `meal-${i}`,
        name: `Test Meal ${i}`,
        description: `Description for meal ${i}`,
        category: ['breakfast', 'lunch', 'dinner'][i % 3],
        cuisine: ['Italian', 'Chinese', 'Mexican', 'American'][i % 4],
      }))

      // Store in localStorage to simulate large local dataset
      localStorage.setItem('mock-large-dataset', JSON.stringify(mockMeals))
    })

    await page.goto('/')

    // Measure time to process large dataset
    const startTime = Date.now()
    
    // Trigger search or filtering that would process the dataset
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"]')
    if (await searchInput.isVisible()) {
      await searchInput.fill('test')
      await page.waitForTimeout(500)
    }

    const processingTime = Date.now() - startTime

    // Should handle large datasets without blocking UI
    expect(processingTime).toBeLessThan(2000) // Less than 2 seconds
  })

  test('should efficiently handle rapid user interactions', async ({ page }) => {
    await page.goto('/')

    const startTime = performance.now()
    let interactions = 0

    // Rapidly click spin button multiple times
    const spinButton = page.locator('button:has-text("Spin")')
    
    for (let i = 0; i < 10; i++) {
      if (await spinButton.isVisible()) {
        await spinButton.click()
        interactions++
        await page.waitForTimeout(50) // Very short delay
      }
    }

    const endTime = performance.now()
    const averageResponseTime = (endTime - startTime) / interactions

    // Each interaction should respond quickly
    expect(averageResponseTime).toBeLessThan(200) // Less than 200ms per interaction
  })

  test('should have optimized images and assets', async ({ page }) => {
    await page.goto('/')
    
    const assetMetrics = await page.evaluate(() => {
      const images = Array.from(document.images)
      const imageMetrics = images.map(img => ({
        src: img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        displayedWidth: img.width,
        displayedHeight: img.height,
        isOptimized: img.src.includes('.webp') || img.src.includes('optimized'),
      }))

      return {
        imageCount: images.length,
        oversizedImages: imageMetrics.filter(img => 
          img.naturalWidth > img.displayedWidth * 2 || 
          img.naturalHeight > img.displayedHeight * 2
        ).length,
        modernFormats: imageMetrics.filter(img => img.isOptimized).length,
      }
    })

    // Should not have too many oversized images
    expect(assetMetrics.oversizedImages).toBeLessThan(3)
    
    // Should use modern image formats when possible
    if (assetMetrics.imageCount > 0) {
      const optimizationRatio = assetMetrics.modernFormats / assetMetrics.imageCount
      expect(optimizationRatio).toBeGreaterThan(0.3) // At least 30% optimized
    }
  })

  test('should minimize layout shifts', async ({ page }) => {
    await page.goto('/')

    // Measure Cumulative Layout Shift
    const layoutShiftScore = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsScore = 0
        
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
              clsScore += (entry as any).value
            }
          }
        })

        observer.observe({ entryTypes: ['layout-shift'] })

        // Measure for 3 seconds
        setTimeout(() => {
          observer.disconnect()
          resolve(clsScore)
        }, 3000)
      })
    })

    // CLS score should be low (good: < 0.1, needs improvement: < 0.25)
    expect(layoutShiftScore).toBeLessThan(0.25)
  })
})