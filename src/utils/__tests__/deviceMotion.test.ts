import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  isDeviceMotionSupported,
  requiresDeviceMotionPermission,
  requestDeviceMotionPermission,
  calculateAccelerationMagnitude,
  calculateAccelerationDelta,
  calculateShakeIntensity,
  processDeviceMotionEvent,
  smoothAccelerationData,
  getDeviceOrientationInfo,
  normalizeAccelerationForOrientation,
} from '../deviceMotion'
import { createMockAccelerationData, createMockDeviceMotionEvent } from '../../test/utils/test-utils'

describe('deviceMotion utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('isDeviceMotionSupported', () => {
    it('should return true when DeviceMotionEvent is available', () => {
      expect(isDeviceMotionSupported()).toBe(true)
    })

    it('should return false when DeviceMotionEvent is not available', () => {
      const originalDeviceMotionEvent = global.DeviceMotionEvent
      // @ts-ignore
      global.DeviceMotionEvent = undefined
      
      expect(isDeviceMotionSupported()).toBe(false)
      
      global.DeviceMotionEvent = originalDeviceMotionEvent
    })
  })

  describe('requiresDeviceMotionPermission', () => {
    it('should return true when requestPermission method exists', () => {
      expect(requiresDeviceMotionPermission()).toBe(true)
    })

    it('should return false when requestPermission method does not exist', () => {
      const originalRequestPermission = (global.DeviceMotionEvent as any).requestPermission
      delete (global.DeviceMotionEvent as any).requestPermission
      
      expect(requiresDeviceMotionPermission()).toBe(false)
      
      ;(global.DeviceMotionEvent as any).requestPermission = originalRequestPermission
    })
  })

  describe('requestDeviceMotionPermission', () => {
    it('should return granted state when permission is granted', async () => {
      const result = await requestDeviceMotionPermission()
      
      expect(result).toEqual({
        state: 'granted',
        requested: true,
      })
    })

    it('should return unsupported state when device motion is not supported', async () => {
      const originalDeviceMotionEvent = global.DeviceMotionEvent
      // @ts-ignore
      global.DeviceMotionEvent = undefined
      
      const result = await requestDeviceMotionPermission()
      
      expect(result).toEqual({
        state: 'unsupported',
        requested: false,
      })
      
      global.DeviceMotionEvent = originalDeviceMotionEvent
    })

    it('should handle permission denial', async () => {
      ;(global.DeviceMotionEvent as any).requestPermission = vi.fn().mockResolvedValue('denied')
      
      const result = await requestDeviceMotionPermission()
      
      expect(result).toEqual({
        state: 'denied',
        requested: true,
      })
    })

    it('should handle permission request errors', async () => {
      ;(global.DeviceMotionEvent as any).requestPermission = vi.fn().mockRejectedValue(new Error('Permission error'))
      
      const result = await requestDeviceMotionPermission()
      
      expect(result).toEqual({
        state: 'denied',
        requested: true,
      })
    })
  })

  describe('calculateAccelerationMagnitude', () => {
    it('should calculate magnitude correctly', () => {
      const magnitude = calculateAccelerationMagnitude(3, 4, 0)
      expect(magnitude).toBe(5)
    })

    it('should handle undefined values', () => {
      const magnitude = calculateAccelerationMagnitude()
      expect(magnitude).toBe(0)
    })

    it('should handle negative values', () => {
      const magnitude = calculateAccelerationMagnitude(-3, -4, 0)
      expect(magnitude).toBe(5)
    })
  })

  describe('calculateAccelerationDelta', () => {
    it('should calculate delta between two acceleration readings', () => {
      const current = createMockAccelerationData({ x: 5, y: 6, z: 7 })
      const previous = createMockAccelerationData({ x: 1, y: 2, z: 3 })
      
      const delta = calculateAccelerationDelta(current, previous)
      expect(delta).toBe(12) // |5-1| + |6-2| + |7-3| = 4 + 4 + 4 = 12
    })

    it('should handle zero delta', () => {
      const data = createMockAccelerationData()
      const delta = calculateAccelerationDelta(data, data)
      expect(delta).toBe(0)
    })
  })

  describe('calculateShakeIntensity', () => {
    it('should return 0 for insufficient data', () => {
      expect(calculateShakeIntensity([])).toBe(0)
      expect(calculateShakeIntensity([createMockAccelerationData()])).toBe(0)
    })

    it('should calculate intensity from acceleration data', () => {
      const now = Date.now()
      const data = [
        createMockAccelerationData({ x: 1, y: 1, z: 1, timestamp: now - 100 }),
        createMockAccelerationData({ x: 5, y: 5, z: 5, timestamp: now }),
      ]
      
      const intensity = calculateShakeIntensity(data)
      expect(intensity).toBeGreaterThan(0)
    })

    it('should filter data outside time window', () => {
      const now = Date.now()
      const data = [
        createMockAccelerationData({ timestamp: now - 2000 }), // Too old
        createMockAccelerationData({ x: 1, y: 1, z: 1, timestamp: now - 100 }),
        createMockAccelerationData({ x: 5, y: 5, z: 5, timestamp: now }),
      ]
      
      const intensity = calculateShakeIntensity(data, 1000)
      expect(intensity).toBeGreaterThan(0)
    })
  })

  describe('processDeviceMotionEvent', () => {
    it('should process valid device motion event', () => {
      const event = createMockDeviceMotionEvent()
      const result = processDeviceMotionEvent(event as DeviceMotionEvent)
      
      expect(result).toEqual(expect.objectContaining({
        x: 1.0,
        y: 2.0,
        z: 3.0,
        magnitude: expect.any(Number),
        timestamp: expect.any(Number),
      }))
    })

    it('should return null for invalid event', () => {
      const event = createMockDeviceMotionEvent({
        accelerationIncludingGravity: { x: null, y: null, z: null }
      })
      
      const result = processDeviceMotionEvent(event as DeviceMotionEvent)
      expect(result).toBeNull()
    })

    it('should return null when acceleration data is missing', () => {
      const event = createMockDeviceMotionEvent({
        accelerationIncludingGravity: null
      })
      
      const result = processDeviceMotionEvent(event as DeviceMotionEvent)
      expect(result).toBeNull()
    })
  })

  describe('smoothAccelerationData', () => {
    it('should return original data when insufficient data points', () => {
      const data = [createMockAccelerationData()]
      const smoothed = smoothAccelerationData(data, 3)
      expect(smoothed).toEqual(data)
    })

    it('should smooth acceleration data using moving average', () => {
      const data = [
        createMockAccelerationData({ x: 1, y: 1, z: 1 }),
        createMockAccelerationData({ x: 3, y: 3, z: 3 }),
        createMockAccelerationData({ x: 5, y: 5, z: 5 }),
      ]
      
      const smoothed = smoothAccelerationData(data, 3)
      expect(smoothed).toHaveLength(1)
      expect(smoothed[0].x).toBe(3) // (1 + 3 + 5) / 3
      expect(smoothed[0].y).toBe(3)
      expect(smoothed[0].z).toBe(3)
    })
  })

  describe('getDeviceOrientationInfo', () => {
    it('should get device orientation info', () => {
      const info = getDeviceOrientationInfo()
      
      expect(info).toEqual({
        angle: 0,
        portrait: true,
        landscape: false,
      })
    })

    it('should handle landscape orientation', () => {
      Object.defineProperty(window.screen, 'orientation', {
        value: { angle: 90 },
        configurable: true,
      })
      
      const info = getDeviceOrientationInfo()
      
      expect(info).toEqual({
        angle: 90,
        portrait: false,
        landscape: true,
      })
    })
  })

  describe('normalizeAccelerationForOrientation', () => {
    it('should not transform for portrait orientation', () => {
      const data = createMockAccelerationData({ x: 1, y: 2, z: 3 })
      const normalized = normalizeAccelerationForOrientation(data, 0)
      
      expect(normalized.x).toBe(1)
      expect(normalized.y).toBe(2)
      expect(normalized.z).toBe(3)
    })

    it('should transform for landscape left orientation', () => {
      const data = createMockAccelerationData({ x: 1, y: 2, z: 3 })
      const normalized = normalizeAccelerationForOrientation(data, 90)
      
      expect(normalized.x).toBe(-2) // -y
      expect(normalized.y).toBe(1)  // x
      expect(normalized.z).toBe(3)  // z unchanged
    })

    it('should transform for landscape right orientation', () => {
      const data = createMockAccelerationData({ x: 1, y: 2, z: 3 })
      const normalized = normalizeAccelerationForOrientation(data, 270)
      
      expect(normalized.x).toBe(2)  // y
      expect(normalized.y).toBe(-1) // -x
      expect(normalized.z).toBe(3)  // z unchanged
    })

    it('should transform for upside down orientation', () => {
      const data = createMockAccelerationData({ x: 1, y: 2, z: 3 })
      const normalized = normalizeAccelerationForOrientation(data, 180)
      
      expect(normalized.x).toBe(-1) // -x
      expect(normalized.y).toBe(-2) // -y
      expect(normalized.z).toBe(3)  // z unchanged
    })
  })
})