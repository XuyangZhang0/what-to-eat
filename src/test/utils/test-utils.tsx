import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock data factories
export const createMockMeal = (overrides = {}) => ({
  id: '1',
  name: 'Test Meal',
  description: 'A delicious test meal',
  category: 'lunch' as const,
  cuisine: 'Italian',
  difficulty: 'medium' as const,
  cookingTime: 30,
  tags: ['vegetarian', 'quick'],
  image: 'test-image.jpg',
  ingredients: ['ingredient1', 'ingredient2'],
  instructions: ['step1', 'step2'],
  isFavorite: false,
  ...overrides,
})

export const createMockRestaurant = (overrides = {}) => ({
  id: '1',
  name: 'Test Restaurant',
  description: 'A great test restaurant',
  cuisine: 'Italian',
  address: '123 Test St',
  phone: '555-0123',
  website: 'https://test.com',
  rating: 4.5,
  priceRange: '$$' as const,
  image: 'test-restaurant.jpg',
  isOpen: true,
  distance: 500,
  isFavorite: false,
  ...overrides,
})

export const createMockAccelerationData = (overrides = {}) => ({
  x: 1.0,
  y: 2.0,
  z: 3.0,
  magnitude: Math.sqrt(1 + 4 + 9),
  timestamp: Date.now(),
  ...overrides,
})

// Mock DeviceMotionEvent
export const createMockDeviceMotionEvent = (overrides = {}) => ({
  accelerationIncludingGravity: {
    x: 1.0,
    y: 2.0,
    z: 3.0,
    ...overrides.accelerationIncludingGravity,
  },
  acceleration: {
    x: 0.5,
    y: 1.0,
    z: 1.5,
    ...overrides.acceleration,
  },
  rotationRate: {
    alpha: 0,
    beta: 0,
    gamma: 0,
    ...overrides.rotationRate,
  },
  interval: 16,
  ...overrides,
})

// Helper to simulate shake
export const simulateShake = () => {
  const event = new Event('devicemotion')
  Object.defineProperty(event, 'accelerationIncludingGravity', {
    value: { x: 20, y: 20, z: 20 },
  })
  window.dispatchEvent(event)
}

// Helper to wait for animations
export const waitForAnimation = (ms = 100) => 
  new Promise(resolve => setTimeout(resolve, ms))

// Mock timers helper
export const mockTimers = () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })
}

// Mock fetch responses
export const mockFetchResponse = (data: any, ok = true, status = 200) => {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  })
}