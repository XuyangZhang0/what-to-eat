import { WeeklyOpeningHours, DayOpeningHours } from '@/types'

/**
 * Utility functions for handling opening hours
 */

/**
 * Check if a restaurant is currently open based on opening hours
 */
export const isRestaurantOpen = (openingHours?: WeeklyOpeningHours | null, currentTime?: Date): boolean => {
  if (!openingHours) {
    return false // Assume closed if no opening hours
  }

  const now = currentTime || new Date()
  const dayNames: (keyof WeeklyOpeningHours)[] = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
  ]
  
  const currentDay = dayNames[now.getDay()]
  const dayHours = openingHours[currentDay]
  
  if (!dayHours || dayHours.is_closed) {
    return false
  }

  const currentTimeString = formatTimeToHHMM(now)
  return isTimeInRange(currentTimeString, dayHours.open, dayHours.close)
}

/**
 * Get the status text for a restaurant (Open, Closed, Closes at X, Opens at X)
 */
export const getRestaurantStatus = (openingHours?: WeeklyOpeningHours | null, currentTime?: Date): string => {
  if (!openingHours) {
    return 'Hours unavailable'
  }

  const now = currentTime || new Date()
  const dayNames: (keyof WeeklyOpeningHours)[] = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
  ]
  
  const currentDay = dayNames[now.getDay()]
  const dayHours = openingHours[currentDay]
  
  if (!dayHours || dayHours.is_closed) {
    // Check if opens later today or tomorrow
    const nextOpenTime = getNextOpenTime(openingHours, now)
    if (nextOpenTime) {
      return `Closed • Opens ${nextOpenTime}`
    }
    return 'Closed'
  }

  const currentTimeString = formatTimeToHHMM(now)
  const isOpen = isTimeInRange(currentTimeString, dayHours.open, dayHours.close)
  
  if (isOpen) {
    const closeTime = formatTime12Hour(dayHours.close)
    return `Open • Closes ${closeTime}`
  } else {
    // Check if it opens later today
    if (isTimeBefore(currentTimeString, dayHours.open)) {
      const openTime = formatTime12Hour(dayHours.open)
      return `Closed • Opens ${openTime}`
    } else {
      // Check next day
      const nextOpenTime = getNextOpenTime(openingHours, now)
      if (nextOpenTime) {
        return `Closed • Opens ${nextOpenTime}`
      }
      return 'Closed'
    }
  }
}

/**
 * Get next opening time for the restaurant
 */
const getNextOpenTime = (openingHours: WeeklyOpeningHours, currentTime: Date): string | null => {
  const dayNames: (keyof WeeklyOpeningHours)[] = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
  ]
  
  const currentDay = currentTime.getDay()
  const currentTimeString = formatTimeToHHMM(currentTime)
  
  // Check if opens later today
  const todayHours = openingHours[dayNames[currentDay]]
  if (todayHours && !todayHours.is_closed && isTimeBefore(currentTimeString, todayHours.open)) {
    return formatTime12Hour(todayHours.open)
  }
  
  // Check next 7 days
  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (currentDay + i) % 7
    const nextDayHours = openingHours[dayNames[nextDayIndex]]
    
    if (nextDayHours && !nextDayHours.is_closed) {
      const dayName = getDayName(nextDayIndex)
      const openTime = formatTime12Hour(nextDayHours.open)
      
      if (i === 1) {
        return `tomorrow ${openTime}`
      } else {
        return `${dayName} ${openTime}`
      }
    }
  }
  
  return null
}

/**
 * Check if time is in range
 */
const isTimeInRange = (current: string, open: string, close: string): boolean => {
  // Handle case where closing time is next day (e.g., 23:00 to 02:00)
  if (close < open) {
    return current >= open || current <= close
  }
  return current >= open && current <= close
}

/**
 * Check if time1 is before time2
 */
const isTimeBefore = (time1: string, time2: string): boolean => {
  return time1 < time2
}

/**
 * Format time to HH:MM
 */
const formatTimeToHHMM = (date: Date): string => {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

/**
 * Format 24-hour time to 12-hour format
 */
const formatTime12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
}

/**
 * Get day name from day index
 */
const getDayName = (dayIndex: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[dayIndex]
}

/**
 * Format opening hours for display
 */
export const formatOpeningHoursForDisplay = (openingHours?: WeeklyOpeningHours | null): { [key: string]: string } => {
  if (!openingHours) {
    return {}
  }

  const formatted: { [key: string]: string } = {}
  const dayOrder: (keyof WeeklyOpeningHours)[] = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ]

  dayOrder.forEach(day => {
    const hours = openingHours[day]
    if (hours.is_closed) {
      formatted[day] = 'Closed'
    } else {
      const openTime = formatTime12Hour(hours.open)
      const closeTime = formatTime12Hour(hours.close)
      formatted[day] = `${openTime} - ${closeTime}`
    }
  })

  return formatted
}

/**
 * Convert external API opening hours data to our format
 */
export const convertExternalOpeningHours = (externalHours: any): WeeklyOpeningHours | null => {
  if (!externalHours) return null
  
  // If it's already in our format, return it
  if (externalHours.monday && typeof externalHours.monday === 'object') {
    return externalHours as WeeklyOpeningHours
  }
  
  // Handle different external API formats here
  // This is a placeholder for future external API integrations
  return null
}