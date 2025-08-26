import { BaseService } from '@/core/base/BaseService';
import { RouteCity } from '@/entities/RouteCity';
import { RouteCityRepository } from '@/repositories/RouteCityRepository';
import { RouteCityMapper } from '@/mappers/RouteCityMapper';
import { GoogleMapsService, Coordinates } from './GoogleMapsService';
import { AppDataSource } from '@/config/database';

export class RouteCityService extends BaseService<RouteCity> {
  protected override repository: RouteCityRepository;
  private googleMapsService: GoogleMapsService;

  constructor() {
    super(RouteCity);
    this.repository = new RouteCityRepository();
    this.googleMapsService = new GoogleMapsService();
  }

  async findByRouteId(routeId: number): Promise<RouteCity[]> {
    return this.repository.findByRouteId(routeId);
  }

  async findByCityId(cityId: number): Promise<RouteCity[]> {
    return this.repository.findByCityId(cityId);
  }

  async addCityToRoute(routeId: number, cityId: number, order?: number): Promise<RouteCity> {
    // Check if association already exists
    const existing = await this.repository.findByRouteAndCity(routeId, cityId);
    if (existing) {
      throw new Error('City is already associated with this route');
    }

    // Get next order if not provided
    if (!order) {
      const maxOrder = await this.repository.getMaxOrderForRoute(routeId);
      order = maxOrder + 1;
    }

    const entity = new RouteCity();
    entity.routeId = routeId;
    entity.cityId = cityId;
    entity.order = order;
    
    const result = await this.repository.create(entity);
    
    // Refresh distances for the route
    try {
      await this.refreshDistanceAndTravelTime(routeId);
    } catch (error) {
      // Log error but don't fail the operation
      console.error(`Failed to refresh distances for route ${routeId}:`, error);
    }
    
    return result;
  }

  async removeCityFromRoute(routeId: number, cityId: number): Promise<void> {
    const association = await this.repository.findByRouteAndCity(routeId, cityId);
    if (!association) {
      throw new Error('City is not associated with this route');
    }

    await this.delete(association.routeCityId);
    
    // Refresh distances for the route
    try {
      await this.refreshDistanceAndTravelTime(routeId);
    } catch (error) {
      // Log error but don't fail the operation
      console.error(`Failed to refresh distances for route ${routeId}:`, error);
    }
  }

  async reorderCities(routeId: number, cityOrders: { cityId: number; order: number }[]): Promise<void> {
    for (const { cityId, order } of cityOrders) {
      const association = await this.repository.findByRouteAndCity(routeId, cityId);
      if (association) {
        await this.update(association.routeCityId, { order });
      }
    }
    
    // Refresh distances for the route after reordering
    try {
      await this.refreshDistanceAndTravelTime(routeId);
    } catch (error) {
      // Log error but don't fail the operation
      console.error(`Failed to refresh distances for route ${routeId}:`, error);
    }
  }

  async getAvailableCitiesForRoute(routeId: number): Promise<any[]> {
    return this.repository.getAvailableCitiesForRoute(routeId);
  }

  async getCityIdsByRouteId(routeId: number): Promise<number[]> {
    const routeCities = await this.repository.findByRouteId(routeId);
    return routeCities.map(rc => rc.cityId);
  }

  /**
   * Refresh distance and travel time fields for route cities
   * @param routeId Optional route ID. If not provided, processes all routes
   * @returns "OK" if successful
   */
  async refreshDistanceAndTravelTime(routeId?: number): Promise<string> {
    if (!this.googleMapsService.isAvailable()) {
      throw new Error('Google Maps API is not configured. Please set GOOGLE_MAPS_API_KEY environment variable.');
    }

    // Get all route cities with coordinates in one query
    const allRouteCities = await this.repository.getAllRouteCitiesWithCoordinates(routeId);

    // Group by route_id in memory
    const routesMap = new Map<number, any[]>();
    
    for (const routeCity of allRouteCities) {
      const currentRouteId = routeCity.route_id;
      if (!routesMap.has(currentRouteId)) {
        routesMap.set(currentRouteId, []);
      }
      routesMap.get(currentRouteId)!.push(routeCity);
    }

    // Process each route
    for (const [currentRouteId, routeCities] of routesMap) {
      await this.processRouteDistances(routeCities);
    }

    return "OK";
  }

  /**
   * Process distance calculations for a single route
   */
  private async processRouteDistances(routeCities: any[]): Promise<void> {
    if (routeCities.length < 2) {
      return; // Skip routes with less than 2 cities
    }

    // Sort by order to ensure correct sequence
    routeCities.sort((a, b) => a.order - b.order);

    // First city always gets 0 distance and time
    const firstCity = routeCities[0];
    await this.repository.updateDistanceAndTime(firstCity.route_city_id, 0, 0);

    // Calculate distances for remaining cities
    for (let i = 1; i < routeCities.length; i++) {
      const previousCity = routeCities[i - 1];
      const currentCity = routeCities[i];

      // Validate coordinates
      if (!previousCity.latitude || !previousCity.longitude || 
          !currentCity.latitude || !currentCity.longitude) {
        continue; // Skip if missing coordinates
      }

      const origin: Coordinates = {
        lat: parseFloat(previousCity.latitude),
        lng: parseFloat(previousCity.longitude)
      };

      const destination: Coordinates = {
        lat: parseFloat(currentCity.latitude),
        lng: parseFloat(currentCity.longitude)
      };

      // Get distance and time from Google Maps
      const result = await this.googleMapsService.getDistanceAndTime(origin, destination);

      // Convert distance from meters to kilometers with 3 decimal precision
      const distanceKm = Number((result.distance / 1000).toFixed(3));
      
      // Convert duration from seconds to minutes
      const travelTimeMinutes = Math.round(result.duration / 60);

      // Update database via repository
      await this.repository.updateDistanceAndTime(currentCity.route_city_id, distanceKm, travelTimeMinutes);

      // Small delay to avoid hitting API rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}
