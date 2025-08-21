import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    h2: 'h2',
    p: 'p',
    span: 'span',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock navigator.vibrate
Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  value: vi.fn().mockReturnValue(true),
})

// Mock navigator.share
Object.defineProperty(navigator, 'share', {
  writable: true,
  value: vi.fn().mockResolvedValue(undefined),
})

// Mock navigator.geolocation
Object.defineProperty(navigator, 'geolocation', {
  writable: true,
  value: {
    getCurrentPosition: vi.fn().mockImplementation((success) => {
      success({
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 100,
        },
      })
    }),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  },
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock DeviceMotionEvent
const mockDeviceMotionEvent = vi.fn().mockImplementation(() => ({
  requestPermission: vi.fn().mockResolvedValue('granted'),
}))

Object.defineProperty(mockDeviceMotionEvent, 'requestPermission', {
  value: vi.fn().mockResolvedValue('granted'),
})

global.DeviceMotionEvent = mockDeviceMotionEvent

// Mock screen orientation
Object.defineProperty(window.screen, 'orientation', {
  writable: true,
  value: {
    angle: 0,
    type: 'portrait-primary',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
global.sessionStorage = localStorageMock

// Mock fetch
global.fetch = vi.fn()

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url')
global.URL.revokeObjectURL = vi.fn()

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock performance.now
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
  },
})

// Setup console mocks for tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

// Setup API base URL for tests
import.meta.env = {
  ...import.meta.env,
  VITE_API_BASE_URL: 'http://localhost:3001/api'
}