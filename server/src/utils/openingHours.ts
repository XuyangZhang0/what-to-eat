import { WeeklyOpeningHours, DayOpeningHours } from '@/models/types.js';

// Days of the week mapping
export const DAYS_OF_WEEK = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[number];

/**
 * Get current day of the week as a string
 */
export function getCurrentDay(): DayOfWeek {
  const dayIndex = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  return DAYS_OF_WEEK[dayIndex];
}

/**
 * Check if a restaurant is open on a specific day
 */
export function isRestaurantOpenOnDay(
  openingHours: WeeklyOpeningHours | null | undefined,
  day: DayOfWeek
): boolean {
  if (!openingHours || !openingHours[day]) {
    return true; // Default to open if no opening hours specified
  }
  
  const dayHours = openingHours[day];
  return !dayHours.is_closed;
}

/**
 * Check if a restaurant is currently open
 */
export function isRestaurantCurrentlyOpen(
  openingHours: WeeklyOpeningHours | null | undefined
): boolean {
  if (!openingHours) {
    return true; // Default to open if no opening hours specified
  }
  
  const now = new Date();
  const currentDay = getCurrentDay();
  const dayHours = openingHours[currentDay];
  
  if (!dayHours || dayHours.is_closed) {
    return false;
  }
  
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  return currentTime >= dayHours.open && currentTime <= dayHours.close;
}

/**
 * Get default opening hours (open every day 9:00-22:00)
 */
export function getDefaultOpeningHours(): WeeklyOpeningHours {
  const defaultDay: DayOpeningHours = {
    open: '09:00',
    close: '22:00',
    is_closed: false
  };
  
  return {
    monday: defaultDay,
    tuesday: defaultDay,
    wednesday: defaultDay,
    thursday: defaultDay,
    friday: defaultDay,
    saturday: defaultDay,
    sunday: defaultDay
  };
}

/**
 * Validate opening hours format
 */
export function validateOpeningHours(openingHours: any): boolean {
  if (!openingHours || typeof openingHours !== 'object') {
    return false;
  }
  
  for (const day of DAYS_OF_WEEK) {
    const dayHours = openingHours[day];
    if (!dayHours || typeof dayHours !== 'object') {
      return false;
    }
    
    if (typeof dayHours.is_closed !== 'boolean') {
      return false;
    }
    
    if (!dayHours.is_closed) {
      if (!isValidTimeFormat(dayHours.open) || !isValidTimeFormat(dayHours.close)) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Check if time string is in valid HH:MM format
 */
function isValidTimeFormat(time: string): boolean {
  if (typeof time !== 'string') return false;
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Convert time string to minutes since midnight for comparison
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Check if current time is within opening hours for a specific day
 */
export function isTimeWithinOpeningHours(
  dayHours: DayOpeningHours,
  currentTime?: string
): boolean {
  if (dayHours.is_closed) {
    return false;
  }
  
  const timeToCheck = currentTime || new Date().toTimeString().slice(0, 5);
  const currentMinutes = timeToMinutes(timeToCheck);
  const openMinutes = timeToMinutes(dayHours.open);
  const closeMinutes = timeToMinutes(dayHours.close);
  
  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}