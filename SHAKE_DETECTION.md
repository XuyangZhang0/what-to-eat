# Shake Detection Feature Implementation

This document details the comprehensive shake detection implementation for the "What to Eat" mobile app.

## Overview

The shake detection feature allows users to shake their mobile device to trigger random food suggestions, providing an intuitive and fun way to discover new meals and restaurants.

## Architecture

### Core Components

1. **`useShakeDetection` Hook** (`src/hooks/useShakeDetection.ts`)
   - Primary hook for device motion detection
   - Handles DeviceMotion API integration
   - Manages iOS permission requests
   - Processes acceleration data with noise filtering
   - Implements configurable thresholds and sensitivity

2. **`useShakeSettings` Hook** (`src/hooks/useShakeSettings.ts`)
   - Manages user shake detection preferences
   - Handles localStorage persistence
   - Provides convenient getters/setters for settings

3. **Device Motion Utilities** (`src/utils/deviceMotion.ts`)
   - Device capability detection
   - Permission request handling
   - Acceleration calculation algorithms
   - Data smoothing and orientation normalization

4. **Haptic Feedback Utilities** (`src/utils/haptics.ts`)
   - Cross-platform vibration support
   - Intensity-based haptic patterns
   - Device-specific optimizations

5. **ShakeButton Component** (`src/components/ShakeButton/index.tsx`)
   - Visual shake interface element
   - Intensity-responsive animations
   - Loading and disabled states

6. **ShakeSettings Component** (`src/components/ShakeSettings/index.tsx`)
   - Comprehensive settings configuration UI
   - Auto-calibration functionality
   - Real-time testing and feedback

## Features

### ✅ Core Functionality

- **Device Motion Detection**: Uses accelerometer data to detect shake gestures
- **iOS Permission Handling**: Properly requests DeviceMotion permissions on iOS 13+
- **Cross-Platform Support**: Works on both iOS and Android devices
- **Configurable Sensitivity**: Adjustable detection thresholds and sensitivity
- **Haptic Feedback**: Vibration feedback when shake is detected
- **Cooldown Period**: Prevents multiple triggers in quick succession
- **Orientation Handling**: Normalizes acceleration data across device orientations

### ✅ Advanced Features

- **Data Smoothing**: Reduces noise in acceleration readings
- **Auto-Calibration**: Helps users optimize settings for their device
- **Real-time Intensity Display**: Shows current shake intensity
- **Settings Persistence**: Saves user preferences to localStorage
- **Permission State Management**: Tracks and handles various permission states
- **Error Handling**: Graceful fallbacks for unsupported devices

### ✅ User Experience

- **Visual Feedback**: Animated button with intensity-responsive effects
- **Progressive Enhancement**: Works with or without shake detection
- **Accessibility**: Tap-to-trigger alternative always available
- **Settings UI**: Comprehensive configuration interface
- **Testing Tools**: Built-in calibration and testing capabilities

## Technical Implementation

### Shake Detection Algorithm

```typescript
// 1. Capture device motion events
window.addEventListener('devicemotion', handleDeviceMotion)

// 2. Process acceleration data
const rawData = processDeviceMotionEvent(event)
const normalizedData = normalizeAccelerationForOrientation(rawData, orientation)

// 3. Apply smoothing to reduce noise
const smoothedData = smoothAccelerationData(accelerationBuffer, windowSize)

// 4. Calculate shake intensity
const intensity = calculateShakeIntensity(smoothedData, timeWindow)

// 5. Check against threshold
if (intensity > effectiveThreshold) {
  triggerShakeDetection()
}
```

### Sensitivity Calculation

```typescript
// Higher sensitivity = lower effective threshold
const effectiveThreshold = threshold * (2 - sensitivity)
```

### Haptic Feedback Integration

```typescript
if (hapticFeedback && isHapticSupported()) {
  const hapticIntensity = Math.min(intensity / effectiveThreshold, 2)
  triggerShakeHaptic(hapticIntensity, true)
}
```

## Configuration Options

### ShakeDetectionOptions

```typescript
interface ShakeDetectionOptions {
  threshold?: number          // Detection threshold (5-50)
  cooldownPeriod?: number    // Cooldown between detections (ms)
  sensitivity?: number       // Sensitivity multiplier (0.1-2.0)
  enabled?: boolean          // Enable/disable detection
  hapticFeedback?: boolean   // Enable vibration feedback
  onShakeDetected?: () => void
  onPermissionChange?: (state: DeviceMotionPermissionState) => void
}
```

### Default Settings

- **Threshold**: 15 (moderate sensitivity)
- **Sensitivity**: 1.0 (normal)
- **Cooldown**: 1000ms (1 second)
- **Haptic Feedback**: Enabled
- **Detection**: Enabled

## Platform Support

### iOS
- ✅ DeviceMotion API support
- ✅ Permission request handling (iOS 13+)
- ✅ Haptic feedback via Vibration API
- ✅ Orientation change detection

### Android
- ✅ DeviceMotion API support
- ✅ No permission required
- ✅ Haptic feedback via Vibration API
- ✅ Orientation change detection

### Desktop/Web
- ❌ Limited device motion support
- ✅ Graceful fallback to tap-only mode

## Usage Examples

### Basic Integration

```typescript
const { isShaking, currentIntensity } = useShakeDetection({
  onShakeDetected: () => {
    // Handle shake event
    getTandomSuggestion()
  }
})
```

### With Settings Persistence

```typescript
const { settings, updateSettings } = useShakeSettings()
const { isShaking } = useShakeDetection({
  ...settings,
  onShakeDetected: handleShake
})
```

### Custom Sensitivity

```typescript
const { isShaking } = useShakeDetection({
  threshold: 20,      // Higher threshold = less sensitive
  sensitivity: 0.8,   // Lower sensitivity multiplier
  cooldownPeriod: 1500 // 1.5 second cooldown
})
```

## Testing

### Unit Tests
- Hook behavior testing with Vitest
- Mock DeviceMotion events
- Permission flow testing
- Cooldown period validation
- Sensitivity calculation verification

### Manual Testing
1. Enable shake detection in settings
2. Calibrate using the auto-calibration tool
3. Test different intensities and orientations
4. Verify haptic feedback functionality
5. Test permission flows on iOS devices

## Performance Considerations

- **Event Throttling**: Processes motion events at ~20 FPS for optimal performance
- **Data Buffer Management**: Keeps only recent acceleration data (last 2 seconds)
- **Memory Cleanup**: Proper cleanup of event listeners and timers
- **Efficient Calculations**: Optimized acceleration magnitude calculations

## Browser Compatibility

| Feature | Chrome | Safari | Firefox | Edge |
|---------|--------|--------|---------|------|
| DeviceMotion | ✅ | ✅ | ✅ | ✅ |
| iOS Permissions | N/A | ✅ | N/A | N/A |
| Vibration API | ✅ | ❌ | ✅ | ✅ |

## Security & Privacy

- **No Data Collection**: Acceleration data is processed locally only
- **Permission Transparency**: Clear permission request messaging
- **Optional Feature**: Can be completely disabled by users
- **Secure Defaults**: Requires explicit user consent on iOS

## Troubleshooting

### Common Issues

1. **Shake not detected on iOS**
   - Ensure permission is granted
   - Check Settings > Privacy > Motion & Fitness

2. **Too sensitive/not sensitive enough**
   - Use auto-calibration feature
   - Manually adjust sensitivity in settings

3. **No haptic feedback**
   - Check device vibration settings
   - Ensure haptic feedback is enabled in app settings

### Debug Information

Enable development mode to see:
- Real-time acceleration data
- Current intensity values
- Permission state details
- Event processing statistics

## Future Enhancements

### Planned Features
- [ ] Machine learning-based gesture recognition
- [ ] Custom shake patterns
- [ ] Voice command integration
- [ ] Accessibility improvements

### Performance Optimizations
- [ ] WebAssembly acceleration calculations
- [ ] Advanced noise filtering algorithms
- [ ] Predictive shake detection

## File Structure

```
src/
├── hooks/
│   ├── useShakeDetection.ts       # Main shake detection hook
│   ├── useShakeSettings.ts        # Settings management hook
│   └── __tests__/
│       └── useShakeDetection.test.ts
├── utils/
│   ├── deviceMotion.ts            # DeviceMotion utilities
│   └── haptics.ts                 # Haptic feedback utilities
├── components/
│   ├── ShakeButton/
│   │   └── index.tsx              # Shake button component
│   └── ShakeSettings/
│       └── index.tsx              # Settings configuration UI
├── types/
│   └── index.ts                   # TypeScript interfaces
└── pages/
    ├── Home/
    │   └── index.tsx              # Home page with shake integration
    └── Settings.tsx               # Settings page
```

## Contributing

When contributing to the shake detection feature:

1. Maintain backward compatibility
2. Add comprehensive tests for new functionality
3. Update this documentation
4. Test on multiple devices and orientations
5. Consider performance implications
6. Follow accessibility guidelines

## License

This shake detection implementation is part of the "What to Eat" application and follows the same licensing terms.