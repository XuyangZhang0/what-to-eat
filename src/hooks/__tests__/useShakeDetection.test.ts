import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useShakeDetection } from '../useShakeDetection'

// Mock DeviceMotionEvent
const mockDeviceMotionEvent = (x: number, y: number, z: number) => {
  return new CustomEvent('devicemotion', {
    detail: {
      accelerationIncludingGravity: { x, y, z }
    }
  }) as any
}

// Mock navigator.vibrate
Object.defineProperty(navigator, 'vibrate', {
  value: vi.fn(),
  writable: true,
})

// Mock DeviceMotionEvent
global.DeviceMotionEvent = class DeviceMotionEvent extends Event {
  static requestPermission = vi.fn().mockResolvedValue('granted')
  accelerationIncludingGravity: any

  constructor(type: string, options?: any) {
    super(type, options)
    this.accelerationIncludingGravity = options?.accelerationIncludingGravity || { x: 0, y: 0, z: 0 }
  }
} as any

describe('useShakeDetection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useShakeDetection())

    expect(result.current.isShaking).toBe(false)
    expect(result.current.currentIntensity).toBe(0)
    expect(result.current.isSupported).toBe(true)
  })

  it('should detect shake when enabled', async () => {
    const onShakeDetected = vi.fn()
    const { result } = renderHook(() => 
      useShakeDetection({
        threshold: 10,
        enabled: true,
        onShakeDetected
      })
    )

    // Simulate rapid acceleration changes
    act(() => {
      window.dispatchEvent(mockDeviceMotionEvent(20, 20, 20))
    })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    act(() => {
      window.dispatchEvent(mockDeviceMotionEvent(-20, -20, -20))
    })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    act(() => {
      window.dispatchEvent(mockDeviceMotionEvent(25, 25, 25))
    })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    // Should detect shake due to rapid changes
    expect(onShakeDetected).toHaveBeenCalled()
  })

  it('should not detect shake when disabled', () => {
    const onShakeDetected = vi.fn()
    renderHook(() => 
      useShakeDetection({
        threshold: 10,
        enabled: false,
        onShakeDetected
      })
    )

    act(() => {
      window.dispatchEvent(mockDeviceMotionEvent(30, 30, 30))
    })

    expect(onShakeDetected).not.toHaveBeenCalled()
  })

  it('should respect cooldown period', async () => {
    const onShakeDetected = vi.fn()
    const { result } = renderHook(() => 
      useShakeDetection({
        threshold: 5,
        cooldownPeriod: 1000,
        enabled: true,
        onShakeDetected
      })
    )

    // First shake
    act(() => {
      window.dispatchEvent(mockDeviceMotionEvent(20, 20, 20))
      vi.advanceTimersByTime(100)
      window.dispatchEvent(mockDeviceMotionEvent(-20, -20, -20))
      vi.advanceTimersByTime(100)
    })

    expect(onShakeDetected).toHaveBeenCalledTimes(1)

    // Second shake within cooldown period
    act(() => {
      window.dispatchEvent(mockDeviceMotionEvent(25, 25, 25))
      vi.advanceTimersByTime(100)
      window.dispatchEvent(mockDeviceMotionEvent(-25, -25, -25))
      vi.advanceTimersByTime(100)
    })

    expect(onShakeDetected).toHaveBeenCalledTimes(1) // Should still be 1

    // Wait for cooldown to expire
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Third shake after cooldown
    act(() => {
      window.dispatchEvent(mockDeviceMotionEvent(30, 30, 30))
      vi.advanceTimersByTime(100)
      window.dispatchEvent(mockDeviceMotionEvent(-30, -30, -30))
      vi.advanceTimersByTime(100)
    })

    expect(onShakeDetected).toHaveBeenCalledTimes(2)
  })

  it('should adjust threshold based on sensitivity', () => {
    const { result: lowSensitivity } = renderHook(() => 
      useShakeDetection({
        threshold: 20,
        sensitivity: 0.5 // Less sensitive
      })
    )

    const { result: highSensitivity } = renderHook(() => 
      useShakeDetection({
        threshold: 20,
        sensitivity: 2 // More sensitive
      })
    )

    // Low sensitivity should have higher effective threshold
    expect(lowSensitivity.current.effectiveThreshold).toBeGreaterThan(
      highSensitivity.current.effectiveThreshold
    )
  })

  it('should request permission when required', async () => {
    const onPermissionChange = vi.fn()
    
    renderHook(() => 
      useShakeDetection({
        onPermissionChange
      })
    )

    await act(async () => {
      vi.advanceTimersByTime(100)
    })

    expect(DeviceMotionEvent.requestPermission).toHaveBeenCalled()
    expect(onPermissionChange).toHaveBeenCalledWith({
      state: 'granted',
      requested: true
    })
  })

  it('should trigger haptic feedback when enabled', () => {
    const onShakeDetected = vi.fn()
    renderHook(() => 
      useShakeDetection({
        threshold: 5,
        hapticFeedback: true,
        enabled: true,
        onShakeDetected
      })
    )

    act(() => {
      window.dispatchEvent(mockDeviceMotionEvent(20, 20, 20))
      vi.advanceTimersByTime(100)
      window.dispatchEvent(mockDeviceMotionEvent(-20, -20, -20))
      vi.advanceTimersByTime(100)
    })

    expect(navigator.vibrate).toHaveBeenCalled()
  })

  it('should not trigger haptic feedback when disabled', () => {
    const onShakeDetected = vi.fn()
    renderHook(() => 
      useShakeDetection({
        threshold: 5,
        hapticFeedback: false,
        enabled: true,
        onShakeDetected
      })
    )

    act(() => {
      window.dispatchEvent(mockDeviceMotionEvent(20, 20, 20))
      vi.advanceTimersByTime(100)
      window.dispatchEvent(mockDeviceMotionEvent(-20, -20, -20))
      vi.advanceTimersByTime(100)
    })

    expect(navigator.vibrate).not.toHaveBeenCalled()
  })
})