import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  isHapticSupported,
  isIOSDevice,
  isAndroidDevice,
  triggerHaptic,
  triggerShakeHaptic,
  triggerSuccessHaptic,
  triggerErrorHaptic,
  stopHaptic,
  testHapticCapability,
} from '../haptics'

describe('haptics utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('isHapticSupported', () => {
    it('should return true when vibrate is supported', () => {
      expect(isHapticSupported()).toBe(true)
    })

    it('should return false when vibrate is not supported', () => {
      const originalVibrate = navigator.vibrate
      // @ts-ignore
      delete navigator.vibrate
      
      expect(isHapticSupported()).toBe(false)
      
      navigator.vibrate = originalVibrate
    })
  })

  describe('isIOSDevice', () => {
    it('should detect iOS devices', () => {
      const originalUserAgent = navigator.userAgent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        configurable: true,
      })
      
      expect(isIOSDevice()).toBe(true)
      
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true,
      })
    })

    it('should not detect non-iOS devices', () => {
      const originalUserAgent = navigator.userAgent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Android 10; Mobile; rv:81.0)',
        configurable: true,
      })
      
      expect(isIOSDevice()).toBe(false)
      
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true,
      })
    })
  })

  describe('isAndroidDevice', () => {
    it('should detect Android devices', () => {
      const originalUserAgent = navigator.userAgent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10; SM-G975F)',
        configurable: true,
      })
      
      expect(isAndroidDevice()).toBe(true)
      
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true,
      })
    })

    it('should not detect non-Android devices', () => {
      const originalUserAgent = navigator.userAgent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        configurable: true,
      })
      
      expect(isAndroidDevice()).toBe(false)
      
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true,
      })
    })
  })

  describe('triggerHaptic', () => {
    it('should trigger haptic feedback with default options', () => {
      const vibrateSpy = vi.spyOn(navigator, 'vibrate')
      
      const result = triggerHaptic()
      
      expect(result).toBe(true)
      expect(vibrateSpy).toHaveBeenCalledWith(100) // medium pattern
    })

    it('should not trigger when disabled', () => {
      const vibrateSpy = vi.spyOn(navigator, 'vibrate')
      
      const result = triggerHaptic({ enabled: false })
      
      expect(result).toBe(false)
      expect(vibrateSpy).not.toHaveBeenCalled()
    })

    it('should trigger with custom pattern', () => {
      const vibrateSpy = vi.spyOn(navigator, 'vibrate')
      
      triggerHaptic({ pattern: 'heavy' })
      
      expect(vibrateSpy).toHaveBeenCalledWith(200)
    })

    it('should trigger with array pattern', () => {
      const vibrateSpy = vi.spyOn(navigator, 'vibrate')
      
      triggerHaptic({ pattern: 'shake' })
      
      expect(vibrateSpy).toHaveBeenCalledWith([100, 50, 100, 50, 150])
    })

    it('should apply intensity scaling on Android', () => {
      const originalUserAgent = navigator.userAgent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10; SM-G975F)',
        configurable: true,
      })
      
      const vibrateSpy = vi.spyOn(navigator, 'vibrate')
      
      triggerHaptic({ pattern: 'medium', intensity: 2 })
      
      expect(vibrateSpy).toHaveBeenCalledWith(200) // 100 * 2
      
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true,
      })
    })

    it('should override with custom duration', () => {
      const vibrateSpy = vi.spyOn(navigator, 'vibrate')
      
      triggerHaptic({ pattern: 'medium', duration: 300 })
      
      expect(vibrateSpy).toHaveBeenCalledWith(300)
    })

    it('should handle vibrate errors gracefully', () => {
      const vibrateSpy = vi.spyOn(navigator, 'vibrate').mockImplementation(() => {
        throw new Error('Vibrate error')
      })
      const consoleSpy = vi.spyOn(console, 'warn')
      
      const result = triggerHaptic()
      
      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Haptic feedback failed:', expect.any(Error))
      
      vibrateSpy.mockRestore()
      consoleSpy.mockRestore()
    })
  })

  describe('triggerShakeHaptic', () => {
    it('should trigger shake haptic with default intensity', () => {
      const vibrateSpy = vi.spyOn(navigator, 'vibrate')
      
      const result = triggerShakeHaptic()
      
      expect(result).toBe(true)
      expect(vibrateSpy).toHaveBeenCalledWith([100, 50, 100, 50, 150])
    })

    it('should clamp intensity between 0.1 and 2', () => {
      const vibrateSpy = vi.spyOn(navigator, 'vibrate')
      
      triggerShakeHaptic(5) // Should be clamped to 2
      triggerShakeHaptic(0.05) // Should be clamped to 0.1
      
      expect(vibrateSpy).toHaveBeenCalledTimes(2)
    })

    it('should respect enabled flag', () => {
      const vibrateSpy = vi.spyOn(navigator, 'vibrate')
      
      const result = triggerShakeHaptic(1, false)
      
      expect(result).toBe(false)
      expect(vibrateSpy).not.toHaveBeenCalled()
    })
  })

  describe('triggerSuccessHaptic', () => {
    it('should trigger success haptic pattern', () => {
      const vibrateSpy = vi.spyOn(navigator, 'vibrate')
      
      const result = triggerSuccessHaptic()
      
      expect(result).toBe(true)
      expect(vibrateSpy).toHaveBeenCalledWith([50, 25, 50])
    })
  })

  describe('triggerErrorHaptic', () => {
    it('should trigger error haptic pattern', () => {
      const vibrateSpy = vi.spyOn(navigator, 'vibrate')
      
      const result = triggerErrorHaptic()
      
      expect(result).toBe(true)
      expect(vibrateSpy).toHaveBeenCalledWith([200, 100, 200])
    })
  })

  describe('stopHaptic', () => {
    it('should stop vibration', () => {
      const vibrateSpy = vi.spyOn(navigator, 'vibrate')
      
      stopHaptic()
      
      expect(vibrateSpy).toHaveBeenCalledWith(0)
    })

    it('should handle when vibrate is not supported', () => {
      const originalVibrate = navigator.vibrate
      // @ts-ignore
      delete navigator.vibrate
      
      expect(() => stopHaptic()).not.toThrow()
      
      navigator.vibrate = originalVibrate
    })
  })

  describe('testHapticCapability', () => {
    it('should return capability info when supported', async () => {
      const result = await testHapticCapability()
      
      expect(result).toEqual({
        supported: true,
        platform: 'unknown',
        patterns: ['light', 'medium', 'heavy', 'shake', 'success', 'error', 'warning'],
      })
    })

    it('should detect iOS platform', async () => {
      const originalUserAgent = navigator.userAgent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        configurable: true,
      })
      
      const result = await testHapticCapability()
      
      expect(result.platform).toBe('ios')
      
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true,
      })
    })

    it('should detect Android platform', async () => {
      const originalUserAgent = navigator.userAgent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10; SM-G975F)',
        configurable: true,
      })
      
      const result = await testHapticCapability()
      
      expect(result.platform).toBe('android')
      
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true,
      })
    })

    it('should return empty patterns when not supported', async () => {
      const originalVibrate = navigator.vibrate
      // @ts-ignore
      delete navigator.vibrate
      
      const result = await testHapticCapability()
      
      expect(result).toEqual({
        supported: false,
        platform: 'unknown',
        patterns: [],
      })
      
      navigator.vibrate = originalVibrate
    })
  })
})