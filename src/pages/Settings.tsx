import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Moon, 
  Sun, 
  Monitor, 
  Smartphone, 
  Bell, 
  MapPin, 
  Shield, 
  Info,
  ChevronRight,
  Vibrate,
  ArrowLeft,
  Shuffle,
  Sparkles
} from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useShakeSettings } from '@/hooks/useShakeSettings'
import ShakeSettings from '@/components/ShakeSettings'
import { authApi } from '@/services/api'

export default function Settings() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const { settings: shakeSettings, updateSettings: updateShakeSettings } = useShakeSettings()
  const [showShakeSettings, setShowShakeSettings] = useState(false)
  const [mealSuggestionCount, setMealSuggestionCount] = useState(() => {
    const saved = localStorage.getItem('meal_suggestion_count')
    return saved ? parseInt(saved) : 1
  })
  
  const [animationStyle, setAnimationStyle] = useState(() => {
    const saved = localStorage.getItem('animation_style')
    return saved || 'slot-machine'
  })

  // Load user preferences from backend on component mount
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const profile = await authApi.getProfile()
        const preferences = JSON.parse(profile.preferences || '{}')
        
        if (preferences.meal_suggestion_count) {
          setMealSuggestionCount(preferences.meal_suggestion_count)
          localStorage.setItem('meal_suggestion_count', preferences.meal_suggestion_count.toString())
        }
        
        if (preferences.animation_style) {
          setAnimationStyle(preferences.animation_style)
          localStorage.setItem('animation_style', preferences.animation_style)
        }
      } catch (error) {
        console.error('Failed to load user preferences:', error)
      }
    }

    loadUserPreferences()
  }, [])

  const settingsSections = [
    {
      title: 'Appearance',
      items: [
        {
          id: 'theme',
          icon: theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor,
          label: 'Theme',
          description: 'Choose your preferred theme',
          value: theme === 'system' ? 'System' : theme === 'light' ? 'Light' : 'Dark',
          action: 'select',
        },
      ],
    },
    {
      title: 'Shake Detection',
      items: [
        {
          id: 'shake-settings',
          icon: Smartphone,
          label: 'Shake Detection Settings',
          description: 'Configure sensitivity, haptics, and calibration',
          action: 'navigate',
          value: shakeSettings.isEnabled ? 'Enabled' : 'Disabled',
        },
      ],
    },
    {
      title: 'Random Selection',
      items: [
        {
          id: 'meal-suggestion-count',
          icon: Shuffle,
          label: 'Meal Suggestions',
          description: 'How many meal suggestions to show (restaurants always show 1)',
          value: `${mealSuggestionCount} meal ${mealSuggestionCount === 1 ? 'suggestion' : 'suggestions'}`,
          action: 'select',
        },
        {
          id: 'animation-style',
          icon: Vibrate,
          label: 'Animation Style',
          description: 'Choose between slot machine or powerball picker animations',
          value: animationStyle === 'slot-machine' ? 'Slot Machine 🎰' : 'Powerball Picker 🎱',
          action: 'select',
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'notifications',
          icon: Bell,
          label: 'Push Notifications',
          description: 'Get meal suggestions and reminders',
          value: false,
          action: 'toggle',
        },
      ],
    },
    {
      title: 'Location',
      items: [
        {
          id: 'location',
          icon: MapPin,
          label: 'Location Services',
          description: 'Find nearby restaurants',
          value: false,
          action: 'toggle',
        },
      ],
    },
    {
      title: 'Innovative Features',
      items: [
        {
          id: 'features',
          icon: Sparkles,
          label: 'Explore Features',
          description: 'Discover all the innovative features available',
          action: 'navigate',
        },
      ],
    },
    {
      title: 'Privacy & Support',
      items: [
        {
          id: 'privacy',
          icon: Shield,
          label: 'Privacy Policy',
          description: 'How we handle your data',
          action: 'navigate',
        },
        {
          id: 'about',
          icon: Info,
          label: 'About',
          description: 'App version and information',
          action: 'navigate',
        },
      ],
    },
  ]

  const handleThemeChange = () => {
    const themes = ['light', 'dark', 'system'] as const
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const handleToggle = (id: string, currentValue: boolean) => {
    // TODO: Implement actual settings storage
    console.log(`Toggle ${id}:`, !currentValue)
  }

  const handleMealSuggestionCountChange = async () => {
    const newCount = mealSuggestionCount >= 3 ? 1 : mealSuggestionCount + 1
    setMealSuggestionCount(newCount)
    localStorage.setItem('meal_suggestion_count', newCount.toString())
    
    // Update user preferences in the backend
    try {
      await authApi.updateProfile({
        preferences: {
          meal_suggestion_count: newCount
        }
      })
    } catch (error) {
      console.error('Error updating meal suggestion count:', error)
    }
  }

  const handleAnimationStyleChange = async () => {
    const newStyle = animationStyle === 'slot-machine' ? 'powerball' : 'slot-machine'
    setAnimationStyle(newStyle)
    localStorage.setItem('animation_style', newStyle)
    
    // Update user preferences in the backend
    try {
      await authApi.updateProfile({
        preferences: {
          animation_style: newStyle
        }
      })
    } catch (error) {
      console.error('Error updating animation style:', error)
    }
  }

  const handleNavigate = (id: string) => {
    if (id === 'shake-settings') {
      setShowShakeSettings(true)
    } else if (id === 'features') {
      navigate('/features')
    } else {
      // TODO: Implement navigation to privacy policy, about page, etc.
      console.log(`Navigate to ${id}`)
    }
  }

  if (showShakeSettings) {
    return (
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="flex items-center p-4 border-b bg-card">
          <button
            onClick={() => setShowShakeSettings(false)}
            className="mr-3 p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-semibold">Shake Detection Settings</h1>
        </div>

        {/* Shake Settings Content */}
        <div className="flex-1 overflow-auto p-4">
          <ShakeSettings
            settings={shakeSettings}
            onSettingsChange={updateShakeSettings}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-8">
          {settingsSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              <h2 className="text-lg font-semibold mb-4">{section.title}</h2>
              <div className="space-y-2">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon
                  
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => {
                        if (item.action === 'select' && item.id === 'theme') {
                          handleThemeChange()
                        } else if (item.action === 'select' && item.id === 'meal-suggestion-count') {
                          handleMealSuggestionCountChange()
                        } else if (item.action === 'select' && item.id === 'animation-style') {
                          handleAnimationStyleChange()
                        } else if (item.action === 'toggle') {
                          handleToggle(item.id, item.value as boolean)
                        } else if (item.action === 'navigate') {
                          handleNavigate(item.id)
                        }
                      }}
                      className="w-full p-4 bg-card rounded-lg border hover:bg-muted/50 transition-colors text-left"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (sectionIndex * 0.1) + (itemIndex * 0.05) }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium">{item.label}</h3>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {item.action === 'select' && (
                            <span className="text-sm text-muted-foreground">{item.value}</span>
                          )}
                          {item.action === 'toggle' && (
                            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              item.value ? 'bg-primary' : 'bg-muted'
                            }`}>
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                item.value ? 'translate-x-6' : 'translate-x-1'
                              }`} />
                            </div>
                          )}
                          {item.action === 'navigate' && (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* App Info */}
        <motion.div
          className="p-4 mt-8 text-center text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm">What to Eat v1.0.0</p>
          <p className="text-xs mt-1">Built with React & TypeScript</p>
        </motion.div>
      </div>
    </div>
  )
}