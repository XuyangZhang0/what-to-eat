import { useState, useEffect, useCallback } from 'react'
import type { ShakeSettings } from '@/types'

const SHAKE_SETTINGS_KEY = 'what-to-eat-shake-settings'

const DEFAULT_SHAKE_SETTINGS: ShakeSettings = {
  threshold: 15,
  sensitivity: 1,
  cooldownPeriod: 1000,
  isEnabled: true,
  hapticFeedback: true,
  requiresPermission: false
}

/**
 * Custom hook for managing shake detection settings
 * Handles localStorage persistence and provides convenient getters/setters
 */
export function useShakeSettings() {
  const [settings, setSettings] = useState<ShakeSettings>(DEFAULT_SHAKE_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SHAKE_SETTINGS_KEY)
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings) as Partial<ShakeSettings>
        setSettings(prev => ({ ...prev, ...parsed }))
      }
    } catch (error) {
      console.warn('Failed to load shake settings from localStorage:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isLoaded) return
    
    try {
      localStorage.setItem(SHAKE_SETTINGS_KEY, JSON.stringify(settings))
    } catch (error) {
      console.warn('Failed to save shake settings to localStorage:', error)
    }
  }, [settings, isLoaded])

  const updateSettings = useCallback((newSettings: Partial<ShakeSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SHAKE_SETTINGS)
  }, [])

  const toggleEnabled = useCallback(() => {
    setSettings(prev => ({ ...prev, isEnabled: !prev.isEnabled }))
  }, [])

  const toggleHapticFeedback = useCallback(() => {
    setSettings(prev => ({ ...prev, hapticFeedback: !prev.hapticFeedback }))
  }, [])

  return {
    settings,
    isLoaded,
    updateSettings,
    resetToDefaults,
    toggleEnabled,
    toggleHapticFeedback,
    
    // Convenience getters
    isEnabled: settings.isEnabled,
    hasHapticFeedback: settings.hapticFeedback,
    threshold: settings.threshold,
    sensitivity: settings.sensitivity,
    cooldownPeriod: settings.cooldownPeriod
  }
}