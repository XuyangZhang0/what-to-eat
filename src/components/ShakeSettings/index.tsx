import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Smartphone, 
  Vibrate, 
  Settings, 
  TestTube, 
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Sliders
} from 'lucide-react'
import { useShakeDetection } from '@/hooks/useShakeDetection'
import type { ShakeSettings } from '@/types'

interface ShakeSettingsProps {
  settings: ShakeSettings
  onSettingsChange: (settings: Partial<ShakeSettings>) => void
  className?: string
}

export default function ShakeSettingsComponent({ 
  settings, 
  onSettingsChange, 
  className 
}: ShakeSettingsProps) {
  const [isCalibrating, setIsCalibrating] = useState(false)
  const [calibrationData, setCalibrationData] = useState<number[]>([])
  const [testShakeCount, setTestShakeCount] = useState(0)

  const onShakeDetected = useCallback(() => {
    if (isCalibrating) {
      // currentIntensity will be available from the hook's context
      setTestShakeCount(prev => prev + 1)
    }
  }, [isCalibrating])

  // Use shake detection for testing with current settings
  const {
    isShaking,
    isSupported,
    permissionState,
    requiresPermission,
    requestPermission,
    currentIntensity,
    accelerationHistory
  } = useShakeDetection({
    threshold: settings.threshold,
    sensitivity: settings.sensitivity,
    cooldownPeriod: settings.cooldownPeriod,
    enabled: settings.isEnabled,
    hapticFeedback: settings.hapticFeedback,
    onShakeDetected
  })

  const handleToggle = (key: keyof ShakeSettings, value: boolean) => {
    onSettingsChange({ [key]: value })
  }

  const handleSliderChange = (key: keyof ShakeSettings, value: number) => {
    onSettingsChange({ [key]: value })
  }

  const startCalibration = async () => {
    if (!isSupported) return
    
    if (requiresPermission && permissionState.state !== 'granted') {
      const granted = await requestPermission()
      if (!granted) return
    }

    setIsCalibrating(true)
    setCalibrationData([])
    setTestShakeCount(0)
  }

  const stopCalibration = () => {
    setIsCalibrating(false)
    
    if (calibrationData.length > 0) {
      // Calculate optimal threshold based on recorded shake intensities
      const avgIntensity = calibrationData.reduce((sum, intensity) => sum + intensity, 0) / calibrationData.length
      const optimalThreshold = Math.max(avgIntensity * 0.7, 10) // 70% of average, minimum 10
      
      onSettingsChange({
        threshold: Math.round(optimalThreshold),
        sensitivity: avgIntensity > 20 ? 1.2 : 0.8 // Adjust sensitivity based on intensity
      })
    }
  }

  const resetToDefaults = () => {
    onSettingsChange({
      threshold: 15,
      sensitivity: 1,
      cooldownPeriod: 1000,
      isEnabled: true,
      hapticFeedback: true
    })
  }

  // Auto-stop calibration after 10 shakes or 30 seconds
  useEffect(() => {
    if (isCalibrating) {
      const timeout = setTimeout(stopCalibration, 30000)
      if (testShakeCount >= 10) {
        stopCalibration()
      }
      return () => clearTimeout(timeout)
    }
  }, [isCalibrating, testShakeCount])

  const getPermissionStatusIcon = () => {
    switch (permissionState.state) {
      case 'granted':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'denied':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'unsupported':
        return <XCircle className="w-4 h-4 text-gray-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
    }
  }

  const getPermissionStatusText = () => {
    switch (permissionState.state) {
      case 'granted':
        return 'Motion access granted'
      case 'denied':
        return 'Motion access denied'
      case 'unsupported':
        return 'Device motion not supported'
      default:
        return 'Motion access required'
    }
  }

  return (
    <motion.div 
      className={`space-y-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Device Status */}
      <div className="p-4 bg-card rounded-lg border">
        <h3 className="font-medium mb-3 flex items-center space-x-2">
          <Smartphone className="w-4 h-4" />
          <span>Device Status</span>
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Motion Support</span>
            <div className="flex items-center space-x-2">
              {isSupported ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">{isSupported ? 'Supported' : 'Not Supported'}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Permission Status</span>
            <div className="flex items-center space-x-2">
              {getPermissionStatusIcon()}
              <span className="text-sm">{getPermissionStatusText()}</span>
            </div>
          </div>

          {permissionState.state === 'denied' && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm">
              <p className="text-yellow-800 dark:text-yellow-200">
                Motion access is required for shake detection. Please enable it in your device settings:
                <br />
                <strong>Settings → Motion & Orientation → Allow</strong>
              </p>
            </div>
          )}

          {requiresPermission && permissionState.state === 'prompt' && (
            <button
              onClick={requestPermission}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Request Motion Access
            </button>
          )}
        </div>
      </div>

      {/* Settings Controls */}
      <div className="p-4 bg-card rounded-lg border">
        <h3 className="font-medium mb-4 flex items-center space-x-2">
          <Sliders className="w-4 h-4" />
          <span>Shake Settings</span>
        </h3>

        <div className="space-y-4">
          {/* Enable Shake Detection */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium">Enable Shake Detection</label>
              <p className="text-xs text-muted-foreground">Detect device shaking for random suggestions</p>
            </div>
            <div 
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                settings.isEnabled ? 'bg-primary' : 'bg-muted'
              }`}
              onClick={() => handleToggle('isEnabled', !settings.isEnabled)}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
          </div>

          {/* Haptic Feedback */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium flex items-center space-x-2">
                <Vibrate className="w-4 h-4" />
                <span>Haptic Feedback</span>
              </label>
              <p className="text-xs text-muted-foreground">Vibrate when shake is detected</p>
            </div>
            <div 
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                settings.hapticFeedback ? 'bg-primary' : 'bg-muted'
              }`}
              onClick={() => handleToggle('hapticFeedback', !settings.hapticFeedback)}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.hapticFeedback ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
          </div>

          {/* Sensitivity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Sensitivity</label>
              <span className="text-sm text-muted-foreground">{settings.sensitivity.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={settings.sensitivity}
              onChange={(e) => handleSliderChange('sensitivity', parseFloat(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Less Sensitive</span>
              <span>More Sensitive</span>
            </div>
          </div>

          {/* Threshold */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Detection Threshold</label>
              <span className="text-sm text-muted-foreground">{settings.threshold}</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={settings.threshold}
              onChange={(e) => handleSliderChange('threshold', parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Easy to Trigger</span>
              <span>Hard to Trigger</span>
            </div>
          </div>

          {/* Cooldown Period */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Cooldown Period</label>
              <span className="text-sm text-muted-foreground">{settings.cooldownPeriod}ms</span>
            </div>
            <input
              type="range"
              min="500"
              max="3000"
              step="100"
              value={settings.cooldownPeriod}
              onChange={(e) => handleSliderChange('cooldownPeriod', parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.5s</span>
              <span>3.0s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calibration & Testing */}
      {isSupported && permissionState.state === 'granted' && (
        <div className="p-4 bg-card rounded-lg border">
          <h3 className="font-medium mb-4 flex items-center space-x-2">
            <TestTube className="w-4 h-4" />
            <span>Calibration & Testing</span>
          </h3>

          <div className="space-y-4">
            {/* Current Status */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground">Current Intensity</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{currentIntensity.toFixed(1)}</span>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-3 rounded-full ${
                          i < Math.min(currentIntensity / 10, 5) 
                            ? 'bg-primary' 
                            : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <span className="text-muted-foreground">Shake State</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isShaking ? 'bg-green-500' : 'bg-muted'}`} />
                  <span className="font-medium">{isShaking ? 'Detecting' : 'Idle'}</span>
                </div>
              </div>
            </div>

            {/* Calibration */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Auto-Calibration</h4>
                  <p className="text-xs text-muted-foreground">
                    Shake your device 10 times to automatically optimize settings
                  </p>
                </div>
                <button
                  onClick={isCalibrating ? stopCalibration : startCalibration}
                  disabled={!settings.isEnabled}
                  className={`px-4 py-2 text-sm rounded transition-colors ${
                    isCalibrating
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isCalibrating ? (
                    <span className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Stop ({testShakeCount}/10)</span>
                    </span>
                  ) : (
                    'Start Calibration'
                  )}
                </button>
              </div>

              {isCalibrating && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    🤳 Shake your device normally {testShakeCount < 10 ? (10 - testShakeCount) : 0} more times...
                  </p>
                  <div className="mt-2 bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(testShakeCount / 10) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Reset Button */}
            <button
              onClick={resetToDefaults}
              className="w-full px-4 py-2 text-sm bg-muted text-muted-foreground rounded hover:bg-muted/80 transition-colors"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}

      {/* Advanced Debug Info (Development) */}
      {process.env.NODE_ENV === 'development' && accelerationHistory.length > 0 && (
        <div className="p-4 bg-card rounded-lg border">
          <h3 className="font-medium mb-3 text-sm">Debug Information</h3>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div>Recent Acceleration Data: {accelerationHistory.length} samples</div>
            {accelerationHistory.slice(-3).map((data, i) => (
              <div key={i} className="font-mono">
                X: {data.x.toFixed(2)}, Y: {data.y.toFixed(2)}, Z: {data.z.toFixed(2)}, 
                M: {data.magnitude.toFixed(2)}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}