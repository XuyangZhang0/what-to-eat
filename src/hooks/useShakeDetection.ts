import { useState, useEffect, useCallback, useRef } from 'react'
import type { 
  ShakeDetectionOptions, 
  DeviceMotionPermissionState, 
  AccelerationData,
  ShakeEvent 
} from '@/types'
import { 
  triggerShakeHaptic, 
  isHapticSupported 
} from '@/utils/haptics'
import {
  isDeviceMotionSupported,
  requiresDeviceMotionPermission,
  requestDeviceMotionPermission,
  processDeviceMotionEvent,
  calculateShakeIntensity,
  smoothAccelerationData,
  getDeviceOrientationInfo,
  normalizeAccelerationForOrientation
} from '@/utils/deviceMotion'

/**
 * Enhanced shake detection hook with comprehensive DeviceMotion API integration
 */
export function useShakeDetection(options: ShakeDetectionOptions = {}) {
  const {
    threshold = 15,
    cooldownPeriod = 1000,
    sensitivity = 1,
    enabled = true,
    hapticFeedback = true,
    onShakeDetected,
    onPermissionChange
  } = options

  // State management
  const [isShaking, setIsShaking] = useState(false)
  const [lastShakeTime, setLastShakeTime] = useState(0)
  const [permissionState, setPermissionState] = useState<DeviceMotionPermissionState>({
    state: 'prompt',
    requested: false
  })
  const [isSupported, setIsSupported] = useState(false)
  const [currentIntensity, setCurrentIntensity] = useState(0)

  // Data storage refs
  const accelerationDataRef = useRef<AccelerationData[]>([])
  const lastProcessedTimeRef = useRef(0)
  const shakeTimeoutRef = useRef<NodeJS.Timeout>()
  const orientationRef = useRef(getDeviceOrientationInfo())

  // Calibrated threshold based on sensitivity
  const effectiveThreshold = threshold * (2 - sensitivity) // Higher sensitivity = lower threshold

  /**
   * Handle shake detection with proper cooldown and haptic feedback
   */
  const handleShakeDetected = useCallback((intensity: number, accelerationData: AccelerationData[]) => {
    if (!enabled) return

    const now = Date.now()
    if (now - lastShakeTime < cooldownPeriod) return

    setLastShakeTime(now)
    setIsShaking(true)
    setCurrentIntensity(intensity)

    // Trigger haptic feedback
    if (hapticFeedback && isHapticSupported()) {
      const hapticIntensity = Math.min(intensity / effectiveThreshold, 2)
      triggerShakeHaptic(hapticIntensity, true)
    }

    // Create shake event
    const shakeEvent: ShakeEvent = {
      intensity,
      duration: 0, // Will be calculated when shake ends
      timestamp: now,
      accelerationData: [...accelerationData]
    }

    // Call external handler
    onShakeDetected?.()

    // Reset shake state after animation
    if (shakeTimeoutRef.current) {
      clearTimeout(shakeTimeoutRef.current)
    }

    shakeTimeoutRef.current = setTimeout(() => {
      setIsShaking(false)
      setCurrentIntensity(0)
    }, 500)

    // Log for debugging
    console.log('Shake detected:', {
      intensity,
      threshold: effectiveThreshold,
      sensitivity,
      dataPoints: accelerationData.length
    })
  }, [enabled, lastShakeTime, cooldownPeriod, effectiveThreshold, hapticFeedback, onShakeDetected])

  /**
   * Process device motion events with improved accuracy
   */
  const handleDeviceMotion = useCallback((event: DeviceMotionEvent) => {
    const now = Date.now()
    
    // Throttle processing to ~20 FPS for better performance
    if (now - lastProcessedTimeRef.current < 50) return
    lastProcessedTimeRef.current = now

    // Process acceleration data
    const rawData = processDeviceMotionEvent(event)
    if (!rawData) return

    // Normalize for device orientation
    const normalizedData = normalizeAccelerationForOrientation(
      rawData,
      orientationRef.current.angle
    )

    // Add to data buffer
    accelerationDataRef.current.push(normalizedData)

    // Keep only recent data (last 2 seconds)
    const cutoffTime = now - 2000
    accelerationDataRef.current = accelerationDataRef.current.filter(
      data => data.timestamp > cutoffTime
    )

    // Smooth the data to reduce noise
    const smoothedData = smoothAccelerationData(accelerationDataRef.current, 3)
    
    // Calculate shake intensity
    const intensity = calculateShakeIntensity(smoothedData, 500) // Use 500ms window

    // Check for shake detection
    if (intensity > effectiveThreshold) {
      handleShakeDetected(intensity, smoothedData.slice(-5)) // Keep last 5 readings
    }
  }, [effectiveThreshold, handleShakeDetected])

  /**
   * Request device motion permission with proper state management
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isDeviceMotionSupported()) {
      const newState: DeviceMotionPermissionState = { state: 'unsupported', requested: false }
      setPermissionState(newState)
      onPermissionChange?.(newState)
      return false
    }

    if (!requiresDeviceMotionPermission()) {
      const newState: DeviceMotionPermissionState = { state: 'granted', requested: false }
      setPermissionState(newState)
      onPermissionChange?.(newState)
      return true
    }

    try {
      const newState = await requestDeviceMotionPermission()
      setPermissionState(newState)
      onPermissionChange?.(newState)
      return newState.state === 'granted'
    } catch (error) {
      console.error('Failed to request device motion permission:', error)
      const newState: DeviceMotionPermissionState = { state: 'denied', requested: true }
      setPermissionState(newState)
      onPermissionChange?.(newState)
      return false
    }
  }, [onPermissionChange])

  /**
   * Initialize shake detection with proper permission handling
   */
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    setIsSupported(isDeviceMotionSupported())

    if (!isDeviceMotionSupported()) {
      console.warn('DeviceMotionEvent is not supported on this device')
      return
    }

    const initializeShakeDetection = async () => {
      // Update orientation info
      orientationRef.current = getDeviceOrientationInfo()

      // Request permission if needed
      const hasPermission = await requestPermission()
      
      if (hasPermission) {
        window.addEventListener('devicemotion', handleDeviceMotion, { passive: true })
      }
    }

    initializeShakeDetection()

    // Handle orientation changes
    const handleOrientationChange = () => {
      orientationRef.current = getDeviceOrientationInfo()
    }

    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion)
      window.removeEventListener('orientationchange', handleOrientationChange)
      
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current)
      }
    }
  }, [enabled, handleDeviceMotion, requestPermission])

  /**
   * Clean up data when component unmounts
   */
  useEffect(() => {
    return () => {
      accelerationDataRef.current = []
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current)
      }
    }
  }, [])

  return {
    // Shake state
    isShaking,
    currentIntensity,
    lastShakeTime,
    
    // Device capabilities
    isSupported,
    permissionState,
    requiresPermission: requiresDeviceMotionPermission(),
    
    // Configuration
    effectiveThreshold,
    sensitivity,
    
    // Actions
    requestPermission,
    
    // Debug information (useful for settings/calibration)
    accelerationHistory: accelerationDataRef.current.slice(-10), // Last 10 readings
  }
}