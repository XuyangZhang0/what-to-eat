// Restaurant Search Service - searches external APIs for restaurant data
import { WeeklyOpeningHours } from '@/models/types.js';

export interface ExternalRestaurant {
  place_id: string;
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  rating?: number;
  price_level?: number;
  website?: string;
  opening_hours?: {
    weekday_text: string[];
    periods: Array<{
      open: { day: number; time: string };
      close?: { day: number; time: string };
    }>;
  };
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    photo_reference: string;
    width: number;
    height: number;
  }>;
  types: string[];
}

export interface RestaurantSearchResult {
  restaurants: ExternalRestaurant[];
  status: string;
  next_page_token?: string;
}

export class RestaurantSearchService {
  private static get GOOGLE_PLACES_API_KEY() {
    return process.env.GOOGLE_PLACES_API_KEY;
  }
  private static readonly PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';

  /**
   * Search restaurants using Google Places API
   */
  static async searchRestaurants(
    query: string,
    location?: { lat: number; lng: number },
    radius: number = 5000
  ): Promise<RestaurantSearchResult> {
    console.log('RestaurantSearchService: API Key present:', !!this.GOOGLE_PLACES_API_KEY);
    console.log('RestaurantSearchService: API Key length:', this.GOOGLE_PLACES_API_KEY?.length || 0);
    
    if (!this.GOOGLE_PLACES_API_KEY) {
      console.log('RestaurantSearchService: No API key - using mock data');
      // Fallback to mock data if no API key
      return this.getMockRestaurants(query);
    }

    try {
      const url = new URL(`${this.PLACES_BASE_URL}/textsearch/json`);
      url.searchParams.append('query', `${query} restaurant`);
      url.searchParams.append('key', this.GOOGLE_PLACES_API_KEY);
      url.searchParams.append('type', 'restaurant');
      
      if (location) {
        url.searchParams.append('location', `${location.lat},${location.lng}`);
        url.searchParams.append('radius', radius.toString());
      }

      console.log('RestaurantSearchService: Making Google Places API call to:', url.toString().replace(this.GOOGLE_PLACES_API_KEY, 'API_KEY_HIDDEN'));
      const response = await fetch(url.toString());
      const data = await response.json();
      console.log('RestaurantSearchService: Google API response status:', data.status, 'Results count:', data.results?.length || 0);

      return {
        restaurants: data.results || [],
        status: data.status,
        next_page_token: data.next_page_token
      };
    } catch (error) {
      console.error('Error searching restaurants:', error);
      return this.getMockRestaurants(query);
    }
  }

  /**
   * Get detailed restaurant information
   */
  static async getRestaurantDetails(placeId: string): Promise<ExternalRestaurant | null> {
    if (!this.GOOGLE_PLACES_API_KEY) {
      return this.getMockRestaurantDetails(placeId);
    }

    try {
      const url = new URL(`${this.PLACES_BASE_URL}/details/json`);
      url.searchParams.append('place_id', placeId);
      url.searchParams.append('key', this.GOOGLE_PLACES_API_KEY);
      url.searchParams.append('fields', 'place_id,name,formatted_address,formatted_phone_number,rating,price_level,website,opening_hours,geometry,photos,types');

      console.log('RestaurantSearchService: Getting details for place_id:', placeId);
      const response = await fetch(url.toString());
      const data = await response.json();
      console.log('RestaurantSearchService: Details response status:', data.status);
      console.log('RestaurantSearchService: Opening hours present:', !!data.result?.opening_hours);
      if (data.result?.opening_hours) {
        console.log('RestaurantSearchService: Opening hours data:', JSON.stringify(data.result.opening_hours, null, 2));
      }

      return data.result || null;
    } catch (error) {
      console.error('Error getting restaurant details:', error);
      return this.getMockRestaurantDetails(placeId);
    }
  }

  /**
   * Convert Google Places opening hours to our format
   */
  static convertToWeeklyOpeningHours(googleHours?: ExternalRestaurant['opening_hours']): WeeklyOpeningHours | undefined {
    console.log('RestaurantSearchService: Converting opening hours:', !!googleHours);
    console.log('RestaurantSearchService: Has periods:', !!googleHours?.periods);
    console.log('RestaurantSearchService: Periods data:', JSON.stringify(googleHours?.periods, null, 2));
    
    // Try weekday_text first if periods is not available
    if (!googleHours?.periods && googleHours?.weekday_text) {
      console.log('RestaurantSearchService: Using weekday_text fallback');
      return this.convertFromWeekdayText(googleHours.weekday_text);
    }
    
    if (!googleHours?.periods) {
      console.log('RestaurantSearchService: No periods found, returning undefined');
      return undefined;
    }

    const weeklyHours: WeeklyOpeningHours = {
      sunday: { open: '09:00', close: '22:00', is_closed: true },
      monday: { open: '09:00', close: '22:00', is_closed: true },
      tuesday: { open: '09:00', close: '22:00', is_closed: true },
      wednesday: { open: '09:00', close: '22:00', is_closed: true },
      thursday: { open: '09:00', close: '22:00', is_closed: true },
      friday: { open: '09:00', close: '22:00', is_closed: true },
      saturday: { open: '09:00', close: '22:00', is_closed: true }
    };

    const dayNames: (keyof WeeklyOpeningHours)[] = [
      'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
    ];

    // Process each period
    googleHours.periods.forEach(period => {
      if (period.open && period.open.day >= 0 && period.open.day <= 6) {
        const dayName = dayNames[period.open.day];
        const openTime = this.convertGoogleTime(period.open.time);
        const closeTime = period.close ? this.convertGoogleTime(period.close.time) : '23:59';

        weeklyHours[dayName] = {
          open: openTime,
          close: closeTime,
          is_closed: false
        };
      }
    });

    console.log('RestaurantSearchService: Converted weekly hours:', JSON.stringify(weeklyHours, null, 2));
    return weeklyHours;
  }

  /**
   * Convert Google weekday_text to our format as fallback
   */
  private static convertFromWeekdayText(weekdayText: string[]): WeeklyOpeningHours | undefined {
    const weeklyHours: WeeklyOpeningHours = {
      sunday: { open: '09:00', close: '22:00', is_closed: true },
      monday: { open: '09:00', close: '22:00', is_closed: true },
      tuesday: { open: '09:00', close: '22:00', is_closed: true },
      wednesday: { open: '09:00', close: '22:00', is_closed: true },
      thursday: { open: '09:00', close: '22:00', is_closed: true },
      friday: { open: '09:00', close: '22:00', is_closed: true },
      saturday: { open: '09:00', close: '22:00', is_closed: true }
    };

    const dayNameMap: { [key: string]: keyof WeeklyOpeningHours } = {
      'monday': 'monday',
      'tuesday': 'tuesday', 
      'wednesday': 'wednesday',
      'thursday': 'thursday',
      'friday': 'friday',
      'saturday': 'saturday',
      'sunday': 'sunday'
    };

    weekdayText.forEach(dayText => {
      // Parse format like "Monday: 11:00 AM – 10:00 PM" or "Monday: Closed"
      const match = dayText.match(/^(\w+):\s*(.+)$/i);
      if (!match) return;

      const dayName = match[1].toLowerCase() as keyof typeof dayNameMap;
      const hoursText = match[2].trim();
      
      if (dayNameMap[dayName]) {
        const mappedDay = dayNameMap[dayName];
        
        if (hoursText.toLowerCase().includes('closed')) {
          weeklyHours[mappedDay] = {
            open: '00:00',
            close: '00:00',
            is_closed: true
          };
        } else {
          // Try to parse time ranges like "11:00 AM – 10:00 PM"
          const timeMatch = hoursText.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*[–-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
          if (timeMatch) {
            const openHour = parseInt(timeMatch[1]);
            const openMin = timeMatch[2];
            const openPeriod = timeMatch[3].toUpperCase();
            const closeHour = parseInt(timeMatch[4]);
            const closeMin = timeMatch[5];
            const closePeriod = timeMatch[6].toUpperCase();

            // Convert to 24-hour format
            let openHour24 = openHour;
            if (openPeriod === 'PM' && openHour !== 12) openHour24 += 12;
            else if (openPeriod === 'AM' && openHour === 12) openHour24 = 0;

            let closeHour24 = closeHour;
            if (closePeriod === 'PM' && closeHour !== 12) closeHour24 += 12;
            else if (closePeriod === 'AM' && closeHour === 12) closeHour24 = 0;

            weeklyHours[mappedDay] = {
              open: `${openHour24.toString().padStart(2, '0')}:${openMin}`,
              close: `${closeHour24.toString().padStart(2, '0')}:${closeMin}`,
              is_closed: false
            };
          }
        }
      }
    });

    console.log('RestaurantSearchService: Converted from weekday_text:', JSON.stringify(weeklyHours, null, 2));
    return weeklyHours;
  }

  /**
   * Convert Google time format (e.g., "0900") to HH:MM format
   */
  private static convertGoogleTime(time: string): string {
    if (!time || time.length !== 4) return '09:00';
    const hours = time.substring(0, 2);
    const minutes = time.substring(2, 4);
    return `${hours}:${minutes}`;
  }

  /**
   * Mock restaurant data for development/testing
   */
  private static getMockRestaurants(query: string): RestaurantSearchResult {
    const mockRestaurants: ExternalRestaurant[] = [
      {
        place_id: 'mock_1',
        name: `${query} Pizza Palace`,
        formatted_address: '123 Main St, Downtown',
        formatted_phone_number: '(555) 123-4567',
        rating: 4.2,
        price_level: 2,
        types: ['restaurant', 'food', 'establishment'],
        geometry: {
          location: { lat: 40.7128, lng: -74.0060 }
        }
      },
      {
        place_id: 'mock_2',
        name: `${query} Burger Joint`,
        formatted_address: '456 Oak Ave, Midtown',
        formatted_phone_number: '(555) 987-6543',
        rating: 4.5,
        price_level: 1,
        types: ['restaurant', 'food', 'establishment'],
        geometry: {
          location: { lat: 40.7589, lng: -73.9851 }
        }
      },
      {
        place_id: 'mock_3',
        name: `${query} Fine Dining`,
        formatted_address: '789 Park Blvd, Uptown',
        formatted_phone_number: '(555) 456-7890',
        rating: 4.8,
        price_level: 4,
        types: ['restaurant', 'food', 'establishment'],
        geometry: {
          location: { lat: 40.7831, lng: -73.9712 }
        }
      }
    ];

    return {
      restaurants: mockRestaurants,
      status: 'OK'
    };
  }

  private static getMockRestaurantDetails(placeId: string): ExternalRestaurant | null {
    const mockDetails: ExternalRestaurant = {
      place_id: placeId,
      name: 'Sample Restaurant',
      formatted_address: '123 Sample St, Sample City, ST 12345',
      formatted_phone_number: '(555) 123-4567',
      rating: 4.3,
      price_level: 2,
      website: 'https://example.com',
      opening_hours: {
        weekday_text: [
          'Monday: 11:00 AM – 10:00 PM',
          'Tuesday: 11:00 AM – 10:00 PM',
          'Wednesday: 11:00 AM – 10:00 PM',
          'Thursday: 11:00 AM – 10:00 PM',
          'Friday: 11:00 AM – 11:00 PM',
          'Saturday: 10:00 AM – 11:00 PM',
          'Sunday: 10:00 AM – 9:00 PM'
        ],
        periods: [
          { open: { day: 1, time: '1100' }, close: { day: 1, time: '2200' } },
          { open: { day: 2, time: '1100' }, close: { day: 2, time: '2200' } },
          { open: { day: 3, time: '1100' }, close: { day: 3, time: '2200' } },
          { open: { day: 4, time: '1100' }, close: { day: 4, time: '2200' } },
          { open: { day: 5, time: '1100' }, close: { day: 5, time: '2300' } },
          { open: { day: 6, time: '1000' }, close: { day: 6, time: '2300' } },
          { open: { day: 0, time: '1000' }, close: { day: 0, time: '2100' } }
        ]
      },
      geometry: {
        location: { lat: 40.7128, lng: -74.0060 }
      },
      types: ['restaurant', 'food', 'establishment']
    };

    return mockDetails;
  }

  /**
   * Convert price level to our price range format
   */
  static convertPriceLevel(priceLevel?: number): '$' | '$$' | '$$$' | '$$$$' | undefined {
    if (priceLevel === undefined || priceLevel === null) return undefined;
    
    switch (priceLevel) {
      case 1: return '$';
      case 2: return '$$';
      case 3: return '$$$';
      case 4: return '$$$$';
      default: return '$$';
    }
  }
}