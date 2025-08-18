/**
 * Device Motion API Utility
 * Handles device motion detection, permissions, and acceleration calculations
 */

import type { AccelerationData, DeviceMotionPermissionState } from '@/types';

/**
 * Check if DeviceMotionEvent is supported
 */
export function isDeviceMotionSupported(): boolean {
  return typeof DeviceMotionEvent !== 'undefined';
}

/**
 * Check if the device requires permission for device motion (iOS 13+)
 */
export function requiresDeviceMotionPermission(): boolean {
  return isDeviceMotionSupported() && 'requestPermission' in DeviceMotionEvent;
}

/**
 * Request permission for device motion access (iOS 13+)
 */
export async function requestDeviceMotionPermission(): Promise<DeviceMotionPermissionState> {
  if (!isDeviceMotionSupported()) {
    return { state: 'unsupported', requested: false };
  }

  if (!requiresDeviceMotionPermission()) {
    return { state: 'granted', requested: false };
  }

  try {
    const permission = await (DeviceMotionEvent as any).requestPermission();
    return {
      state: permission as 'granted' | 'denied',
      requested: true,
    };
  } catch (error) {
    console.warn('Device motion permission request failed:', error);
    return { state: 'denied', requested: true };
  }
}

/**
 * Calculate the magnitude of acceleration vector
 */
export function calculateAccelerationMagnitude(
  x: number = 0,
  y: number = 0,
  z: number = 0
): number {
  return Math.sqrt(x * x + y * y + z * z);
}

/**
 * Calculate the change in acceleration between two readings
 */
export function calculateAccelerationDelta(
  current: AccelerationData,
  previous: AccelerationData
): number {
  const deltaX = Math.abs(current.x - previous.x);
  const deltaY = Math.abs(current.y - previous.y);
  const deltaZ = Math.abs(current.z - previous.z);
  
  return deltaX + deltaY + deltaZ;
}

/**
 * Calculate shake intensity based on acceleration data
 */
export function calculateShakeIntensity(
  accelerationData: AccelerationData[],
  timeWindow: number = 1000 // ms
): number {
  if (accelerationData.length < 2) return 0;

  const now = Date.now();
  const recentData = accelerationData.filter(
    data => now - data.timestamp <= timeWindow
  );

  if (recentData.length < 2) return 0;

  let totalDelta = 0;
  let totalTime = 0;

  for (let i = 1; i < recentData.length; i++) {
    const current = recentData[i];
    const previous = recentData[i - 1];
    const timeDelta = current.timestamp - previous.timestamp;
    
    if (timeDelta > 0) {
      const accelerationDelta = calculateAccelerationDelta(current, previous);
      totalDelta += accelerationDelta;
      totalTime += timeDelta;
    }
  }

  // Calculate intensity as acceleration change per unit time
  return totalTime > 0 ? (totalDelta / totalTime) * 1000 : 0;
}

/**
 * Process raw DeviceMotionEvent data into AccelerationData
 */
export function processDeviceMotionEvent(event: DeviceMotionEvent): AccelerationData | null {
  const acceleration = event.accelerationIncludingGravity;
  
  if (!acceleration || 
      acceleration.x === null || 
      acceleration.y === null || 
      acceleration.z === null) {
    return null;
  }

  const x = acceleration.x;
  const y = acceleration.y;
  const z = acceleration.z;
  const magnitude = calculateAccelerationMagnitude(x, y, z);
  const timestamp = Date.now();

  return { x, y, z, magnitude, timestamp };
}

/**
 * Smooth acceleration data using a simple moving average
 */
export function smoothAccelerationData(
  data: AccelerationData[],
  windowSize: number = 3
): AccelerationData[] {
  if (data.length < windowSize) return data;

  const smoothed: AccelerationData[] = [];

  for (let i = windowSize - 1; i < data.length; i++) {
    let sumX = 0, sumY = 0, sumZ = 0;
    
    for (let j = 0; j < windowSize; j++) {
      const sample = data[i - j];
      sumX += sample.x;
      sumY += sample.y;
      sumZ += sample.z;
    }

    const avgX = sumX / windowSize;
    const avgY = sumY / windowSize;
    const avgZ = sumZ / windowSize;
    const magnitude = calculateAccelerationMagnitude(avgX, avgY, avgZ);

    smoothed.push({
      x: avgX,
      y: avgY,
      z: avgZ,
      magnitude,
      timestamp: data[i].timestamp,
    });
  }

  return smoothed;
}

/**
 * Detect if current device orientation affects shake detection
 */
export function getDeviceOrientationInfo(): {
  angle: number;
  portrait: boolean;
  landscape: boolean;
} {
  const angle = window.screen?.orientation?.angle ?? 0;
  const portrait = Math.abs(angle) === 0 || Math.abs(angle) === 180;
  const landscape = Math.abs(angle) === 90 || Math.abs(angle) === 270;

  return { angle, portrait, landscape };
}

/**
 * Normalize acceleration data based on device orientation
 */
export function normalizeAccelerationForOrientation(
  data: AccelerationData,
  orientationAngle: number = 0
): AccelerationData {
  // For simplicity, we'll apply basic rotation matrix for common orientations
  let { x, y, z } = data;

  switch (orientationAngle) {
    case 90: // Landscape left
      [x, y] = [-y, x];
      break;
    case -90:
    case 270: // Landscape right
      [x, y] = [y, -x];
      break;
    case 180: // Portrait upside down
      [x, y] = [-x, -y];
      break;
    default: // Portrait (0 degrees)
      // No transformation needed
      break;
  }

  return {
    x,
    y,
    z,
    magnitude: calculateAccelerationMagnitude(x, y, z),
    timestamp: data.timestamp,
  };
}