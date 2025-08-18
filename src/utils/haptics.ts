/**
 * Haptic Feedback Utility for Mobile Devices
 * Provides comprehensive haptic feedback patterns for different interactions
 */

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'shake' | 'success' | 'error' | 'warning';

export interface HapticOptions {
  pattern?: HapticPattern;
  intensity?: number;
  duration?: number;
  enabled?: boolean;
}

/**
 * Predefined vibration patterns for different haptic feedback types
 */
const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 50,
  medium: 100,
  heavy: 200,
  shake: [100, 50, 100, 50, 150],
  success: [50, 25, 50],
  error: [200, 100, 200],
  warning: [100, 50, 100],
};

/**
 * Check if haptic feedback is supported on the current device
 */
export function isHapticSupported(): boolean {
  return 'vibrate' in navigator && typeof navigator.vibrate === 'function';
}

/**
 * Check if the device is likely an iOS device
 */
export function isIOSDevice(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Check if the device is likely an Android device
 */
export function isAndroidDevice(): boolean {
  return /Android/.test(navigator.userAgent);
}

/**
 * Trigger haptic feedback with the specified pattern
 */
export function triggerHaptic(options: HapticOptions = {}): boolean {
  const {
    pattern = 'medium',
    intensity = 1,
    duration,
    enabled = true,
  } = options;

  if (!enabled || !isHapticSupported()) {
    return false;
  }

  try {
    let vibrationPattern = HAPTIC_PATTERNS[pattern];

    // Apply intensity scaling for Android devices
    if (isAndroidDevice() && intensity !== 1) {
      if (Array.isArray(vibrationPattern)) {
        vibrationPattern = vibrationPattern.map(duration => Math.round(duration * intensity));
      } else {
        vibrationPattern = Math.round(vibrationPattern * intensity);
      }
    }

    // Override with custom duration if provided
    if (duration && !Array.isArray(vibrationPattern)) {
      vibrationPattern = duration;
    }

    return navigator.vibrate(vibrationPattern);
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
    return false;
  }
}

/**
 * Trigger shake detection haptic feedback
 */
export function triggerShakeHaptic(intensity: number = 1, enabled: boolean = true): boolean {
  return triggerHaptic({
    pattern: 'shake',
    intensity: Math.min(Math.max(intensity, 0.1), 2), // Clamp between 0.1 and 2
    enabled,
  });
}

/**
 * Trigger success haptic feedback
 */
export function triggerSuccessHaptic(enabled: boolean = true): boolean {
  return triggerHaptic({
    pattern: 'success',
    enabled,
  });
}

/**
 * Trigger error haptic feedback
 */
export function triggerErrorHaptic(enabled: boolean = true): boolean {
  return triggerHaptic({
    pattern: 'error',
    enabled,
  });
}

/**
 * Stop any ongoing vibration
 */
export function stopHaptic(): void {
  if (isHapticSupported()) {
    navigator.vibrate(0);
  }
}

/**
 * Test haptic feedback capability and provide user feedback
 */
export async function testHapticCapability(): Promise<{
  supported: boolean;
  platform: string;
  patterns: HapticPattern[];
}> {
  const supported = isHapticSupported();
  const platform = isIOSDevice() ? 'ios' : isAndroidDevice() ? 'android' : 'unknown';
  const patterns = supported ? Object.keys(HAPTIC_PATTERNS) as HapticPattern[] : [];

  return {
    supported,
    platform,
    patterns,
  };
}