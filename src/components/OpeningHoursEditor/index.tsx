import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, ToggleLeft, ToggleRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { WeeklyOpeningHours, DayOpeningHours } from '@/types'

interface OpeningHoursEditorProps {
  openingHours?: WeeklyOpeningHours
  onChange: (openingHours: WeeklyOpeningHours) => void
  className?: string
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const

const DEFAULT_HOURS: DayOpeningHours = {
  open: '09:00',
  close: '22:00',
  is_closed: false
}

export default function OpeningHoursEditor({
  openingHours,
  onChange,
  className
}: OpeningHoursEditorProps) {
  const [hours, setHours] = useState<WeeklyOpeningHours>(() => {
    if (openingHours) return openingHours
    
    // Create default opening hours
    const defaultHours: WeeklyOpeningHours = {
      monday: { ...DEFAULT_HOURS },
      tuesday: { ...DEFAULT_HOURS },
      wednesday: { ...DEFAULT_HOURS },
      thursday: { ...DEFAULT_HOURS },
      friday: { ...DEFAULT_HOURS },
      saturday: { ...DEFAULT_HOURS },
      sunday: { ...DEFAULT_HOURS }
    }
    return defaultHours
  })

  const updateDayHours = (day: keyof WeeklyOpeningHours, updates: Partial<DayOpeningHours>) => {
    const newHours = {
      ...hours,
      [day]: {
        ...hours[day],
        ...updates
      }
    }
    setHours(newHours)
    onChange(newHours)
  }

  const toggleDayClosed = (day: keyof WeeklyOpeningHours) => {
    updateDayHours(day, { is_closed: !hours[day].is_closed })
  }

  const copyToAllDays = (day: keyof WeeklyOpeningHours) => {
    const dayHours = hours[day]
    const newHours = { ...hours }
    
    DAYS_OF_WEEK.forEach(({ key }) => {
      newHours[key] = { ...dayHours }
    })
    
    setHours(newHours)
    onChange(newHours)
  }

  const setCommonHours = (preset: 'business' | 'restaurant' | 'retail') => {
    let commonHours: DayOpeningHours
    
    switch (preset) {
      case 'business':
        commonHours = { open: '09:00', close: '17:00', is_closed: false }
        break
      case 'restaurant':
        commonHours = { open: '11:00', close: '22:00', is_closed: false }
        break
      case 'retail':
        commonHours = { open: '10:00', close: '20:00', is_closed: false }
        break
      default:
        commonHours = DEFAULT_HOURS
    }

    const newHours = { ...hours }
    DAYS_OF_WEEK.forEach(({ key }) => {
      if (key === 'sunday' && preset === 'business') {
        newHours[key] = { ...commonHours, is_closed: true }
      } else {
        newHours[key] = { ...commonHours }
      }
    })
    
    setHours(newHours)
    onChange(newHours)
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Opening Hours
          </h3>
        </div>
        
        {/* Quick Presets */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCommonHours('business')}
            className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/40"
          >
            Business Hours
          </button>
          <button
            type="button"
            onClick={() => setCommonHours('restaurant')}
            className="px-3 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/40"
          >
            Restaurant
          </button>
          <button
            type="button"
            onClick={() => setCommonHours('retail')}
            className="px-3 py-1 text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/40"
          >
            Retail
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {DAYS_OF_WEEK.map(({ key, label }, index) => {
          const dayHours = hours[key]
          
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              {/* Day Label */}
              <div className="w-20 text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
              </div>
              
              {/* Open/Closed Toggle */}
              <button
                type="button"
                onClick={() => toggleDayClosed(key)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  dayHours.is_closed
                    ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                    : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                )}
              >
                {dayHours.is_closed ? (
                  <>
                    <ToggleLeft className="w-4 h-4" />
                    Closed
                  </>
                ) : (
                  <>
                    <ToggleRight className="w-4 h-4" />
                    Open
                  </>
                )}
              </button>
              
              {/* Time Inputs */}
              {!dayHours.is_closed && (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={dayHours.open}
                    onChange={(e) => updateDayHours(key, { open: e.target.value })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <span className="text-gray-500 dark:text-gray-400">to</span>
                  <input
                    type="time"
                    value={dayHours.close}
                    onChange={(e) => updateDayHours(key, { close: e.target.value })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
              )}
              
              {/* Copy to All Days */}
              {!dayHours.is_closed && (
                <button
                  type="button"
                  onClick={() => copyToAllDays(key)}
                  className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                  title="Copy these hours to all days"
                >
                  Copy to All
                </button>
              )}
            </motion.div>
          )
        })}
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Times are in 24-hour format. Use the presets above for common business types.
      </div>
    </div>
  )
}