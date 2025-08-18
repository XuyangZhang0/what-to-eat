# Testing Strategy & Documentation

## Overview

This document outlines the comprehensive testing strategy for the "What to Eat" PWA application. Our testing approach follows the testing pyramid methodology with a focus on unit tests (70%), integration tests (20%), and E2E tests (10%).

## Testing Framework Stack

### Core Testing Tools
- **Vitest**: Fast unit testing framework with ESM support
- **React Testing Library**: Component testing utilities
- **Playwright**: End-to-end testing across multiple browsers
- **Testing Library Jest DOM**: Custom Jest matchers for DOM testing

### Coverage & Reporting
- **Vitest Coverage (v8)**: Code coverage reporting
- **Playwright HTML Reporter**: E2E test results and videos
- **GitHub Actions**: CI/CD pipeline integration

## Test Structure

```
src/
├── **/__tests__/           # Unit tests co-located with source
├── test/
│   ├── setup.ts           # Test configuration
│   └── utils/
│       └── test-utils.tsx # Testing utilities
tests/
├── e2e/                   # End-to-end tests
├── performance/           # Performance benchmarks
└── accessibility/         # A11y compliance tests
```

## Testing Categories

### 1. Unit Tests (70% of test suite)

**Coverage Areas:**
- Component rendering and props
- Hook behavior and state management
- Utility functions
- Device motion calculations
- Haptic feedback logic
- API service functions

**Key Test Files:**
- `src/utils/__tests__/deviceMotion.test.ts`
- `src/utils/__tests__/haptics.test.ts`
- `src/hooks/__tests__/useShakeDetection.test.ts`
- `src/components/SlotMachine/__tests__/SlotMachine.test.tsx`
- `src/services/__tests__/api.test.ts`

**Example Test:**
```typescript
test('should detect shake from device motion event', async () => {
  const onShakeDetected = vi.fn()
  const { result } = renderHook(() => 
    useShakeDetection({ onShakeDetected })
  )

  const event = createMockDeviceMotionEvent({
    accelerationIncludingGravity: { x: 20, y: 20, z: 20 }
  })

  act(() => {
    window.dispatchEvent(Object.assign(new Event('devicemotion'), event))
  })

  await waitFor(() => {
    expect(result.current.isShaking).toBe(true)
    expect(onShakeDetected).toHaveBeenCalled()
  })
})
```

### 2. Integration Tests (20% of test suite)

**Coverage Areas:**
- API integration with React Query
- Component interaction flows
- Route navigation
- Local storage integration
- Service worker functionality

**Key Features Tested:**
- CRUD operations for meals/restaurants
- Search functionality with filters
- Favorites management
- PWA installation flow

### 3. End-to-End Tests (10% of test suite)

**Coverage Areas:**
- Critical user journeys
- Cross-browser compatibility
- Mobile responsiveness
- PWA functionality
- Shake detection simulation

**Key Test Files:**
- `tests/e2e/app.spec.ts` - Basic app functionality
- `tests/e2e/slot-machine.spec.ts` - Core feature testing
- `tests/e2e/navigation.spec.ts` - Navigation flows
- `tests/e2e/shake-detection.spec.ts` - Device motion testing
- `tests/e2e/pwa.spec.ts` - PWA compliance

**Example E2E Test:**
```typescript
test('should complete spin and show result', async ({ page }) => {
  const spinButton = page.locator('button:has-text("Spin")')
  await spinButton.click()
  
  await page.waitForTimeout(3500)
  
  await expect(page.locator('text="Perfect choice!"')).toBeVisible()
  await expect(page.locator('text="🎉 Your Choice 🎉"')).toBeVisible()
})
```

## Performance Testing

### Metrics Tracked
- **Load Performance**: FCP, LCP, TTI
- **Runtime Performance**: FPS during animations
- **Memory Usage**: Heap size monitoring
- **Network Performance**: Resource loading efficiency

### Thresholds
- First Contentful Paint: < 2.5s
- Largest Contentful Paint: < 4s
- Animation FPS: > 30 FPS
- Memory growth: < 10MB per interaction cycle

**Example Performance Test:**
```typescript
test('should maintain good animation performance', async ({ page }) => {
  const animationMetrics = await page.evaluate(() => {
    // FPS measurement logic
  })

  expect(animationMetrics.averageFPS).toBeGreaterThan(30)
})
```

## Accessibility Testing

### WCAG 2.1 Compliance
- **Level AA** compliance target
- Keyboard navigation support
- Screen reader compatibility
- Color contrast validation
- Focus management

### Key Accessibility Features
- Proper heading hierarchy
- ARIA labels and roles
- Focus indicators
- High contrast mode support
- Reduced motion preferences

**Example A11y Test:**
```typescript
test('should have keyboard navigation support', async ({ page }) => {
  await page.keyboard.press('Tab')
  
  let activeElement = await page.evaluate(() => document.activeElement?.tagName)
  expect(['BUTTON', 'A', 'INPUT', 'SELECT']).toContain(activeElement)
})
```

## Mobile & Device Testing

### Device Coverage
- **iOS**: iPhone 12, iPad
- **Android**: Pixel 5, Galaxy S21
- **Responsive**: Various viewport sizes

### Shake Detection Testing
- DeviceMotionEvent simulation
- Permission handling
- Orientation changes
- Fallback mechanisms

## PWA Testing

### Service Worker
- Caching strategies
- Update mechanisms
- Offline functionality

### Installation
- Manifest validation
- Install prompt handling
- Standalone mode testing

### Offline Capabilities
- Resource caching
- API request handling
- User experience degradation

## Running Tests

### Local Development

```bash
# Unit tests
npm run test                 # Run tests in watch mode
npm run test:coverage        # Generate coverage report
npm run test:ui             # Open Vitest UI

# E2E tests
npm run test:e2e            # Run all E2E tests
npm run test:e2e:ui         # Run with Playwright UI
npm run test:e2e:headed     # Run in headed mode

# All tests
npm run test:all            # Run unit + E2E tests
```

### CI/CD Pipeline

Our GitHub Actions workflow runs:
1. **Lint & Type Check**: Code quality validation
2. **Unit Tests**: With coverage reporting
3. **E2E Tests**: Cross-browser testing
4. **Performance Tests**: Lighthouse audits
5. **Accessibility Tests**: A11y compliance
6. **Mobile Tests**: Device-specific testing
7. **Security Scan**: Vulnerability assessment

### Coverage Requirements

- **Overall Coverage**: > 80%
- **Functions**: > 80%
- **Lines**: > 80%
- **Branches**: > 80%

Critical components require 90%+ coverage:
- useShakeDetection hook
- SlotMachine component
- API service layer
- Device motion utilities

## Test Data Management

### Mock Data
- Consistent mock factories
- Realistic test data
- Edge case scenarios

### Environment Setup
- Test database seeding
- API mocking strategies
- Service worker mocking

## Debugging Tests

### Useful Commands
```bash
# Debug specific test
npm run test -- --t "shake detection"

# Debug E2E test with browser
npm run test:e2e:headed -- --debug

# Generate test report
npm run test:coverage -- --reporter=html
```

### Common Issues
1. **Timer-related tests**: Use fake timers
2. **Async operations**: Proper await/waitFor usage
3. **DOM queries**: Use accessible queries
4. **Device APIs**: Mock appropriately

## Best Practices

### Unit Tests
- Test behavior, not implementation
- Use descriptive test names
- Arrange, Act, Assert pattern
- Mock external dependencies

### E2E Tests
- Focus on user journeys
- Use page object patterns
- Minimize test interdependence
- Handle flaky tests with retries

### Performance Tests
- Establish baseline metrics
- Test under realistic conditions
- Monitor regression trends
- Use performance budgets

### Accessibility Tests
- Test with real assistive technologies
- Include diverse user scenarios
- Validate against WCAG guidelines
- Consider cognitive accessibility

## Continuous Improvement

### Metrics Tracking
- Test execution time
- Coverage trends
- Flaky test identification
- Performance regression detection

### Regular Reviews
- Monthly test suite health checks
- Quarterly strategy reviews
- Annual framework evaluations
- Team retrospectives on testing practices

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Testing](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Performance Metrics](https://web.dev/metrics/)

---

For questions about testing strategies or adding new tests, please refer to this document or reach out to the QA team.