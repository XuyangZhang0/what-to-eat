import { Request, Response } from 'express';
import { RestaurantSearchService } from '@/services/restaurantSearchService.js';
import { asyncHandler } from '@/middleware/errorHandler.js';

export class RestaurantSearchController {
  // Search restaurants from external APIs
  static searchExternalRestaurants = asyncHandler(async (req: Request, res: Response) => {
    const { q: query, lat, lng, radius = 5000 } = req.query;

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Query must be at least 2 characters long'
      });
    }

    let location: { lat: number; lng: number } | undefined;
    if (lat && lng) {
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      
      if (!isNaN(latitude) && !isNaN(longitude)) {
        location = { lat: latitude, lng: longitude };
      }
    }

    try {
      const result = await RestaurantSearchService.searchRestaurants(
        query.trim(),
        location,
        parseInt(radius as string) || 5000
      );

      // Transform results to match our frontend expectations
      const restaurants = result.restaurants.map(restaurant => ({
        place_id: restaurant.place_id,
        name: restaurant.name,
        address: restaurant.formatted_address,
        phone: restaurant.formatted_phone_number,
        rating: restaurant.rating,
        price_range: RestaurantSearchService.convertPriceLevel(restaurant.price_level),
        website: restaurant.website,
        location: restaurant.geometry?.location,
        opening_hours: RestaurantSearchService.convertToWeeklyOpeningHours(restaurant.opening_hours),
        types: restaurant.types,
        photos: restaurant.photos
      }));

      res.json({
        success: true,
        data: restaurants,
        status: result.status,
        next_page_token: result.next_page_token,
        count: restaurants.length
      });
    } catch (error) {
      console.error('Restaurant search error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search restaurants'
      });
    }
  });

  // Get detailed restaurant information
  static getRestaurantDetails = asyncHandler(async (req: Request, res: Response) => {
    const { place_id } = req.params;

    if (!place_id) {
      return res.status(400).json({
        success: false,
        error: 'Place ID is required'
      });
    }

    try {
      const restaurant = await RestaurantSearchService.getRestaurantDetails(place_id);

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          error: 'Restaurant not found'
        });
      }

      // Transform result to match our frontend expectations
      const convertedOpeningHours = RestaurantSearchService.convertToWeeklyOpeningHours(restaurant.opening_hours);
      console.log('Controller: Converting opening hours for place_id:', place_id);
      console.log('Controller: Raw Google opening hours:', JSON.stringify(restaurant.opening_hours, null, 2));
      console.log('Controller: Converted opening hours:', JSON.stringify(convertedOpeningHours, null, 2));
      
      const transformedRestaurant = {
        place_id: restaurant.place_id,
        name: restaurant.name,
        address: restaurant.formatted_address,
        phone: restaurant.formatted_phone_number,
        rating: restaurant.rating,
        price_range: RestaurantSearchService.convertPriceLevel(restaurant.price_level),
        website: restaurant.website,
        location: restaurant.geometry?.location,
        opening_hours: convertedOpeningHours,
        types: restaurant.types,
        photos: restaurant.photos,
        raw_opening_hours: restaurant.opening_hours?.weekday_text
      };
      
      console.log('Controller: Final transformed restaurant opening_hours:', transformedRestaurant.opening_hours);

      res.json({
        success: true,
        data: transformedRestaurant
      });
    } catch (error) {
      console.error('Restaurant details error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get restaurant details'
      });
    }
  });
}