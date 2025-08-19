import { BaseService } from '@/core/base/BaseService';
import { RouteCity } from '@/entities/RouteCity';
import { RouteCityRepository } from '@/repositories/RouteCityRepository';
import { RouteCityMapper } from '@/mappers/RouteCityMapper';

export class RouteCityService extends BaseService<RouteCity> {
  protected override repository: RouteCityRepository;

  constructor() {
    super(RouteCity);
    this.repository = new RouteCityRepository();
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
    
    return this.repository.create(entity);
  }

  async removeCityFromRoute(routeId: number, cityId: number): Promise<void> {
    const association = await this.repository.findByRouteAndCity(routeId, cityId);
    if (!association) {
      throw new Error('City is not associated with this route');
    }

    await this.delete(association.routeCityId);
  }

  async reorderCities(routeId: number, cityOrders: { cityId: number; order: number }[]): Promise<void> {
    for (const { cityId, order } of cityOrders) {
      const association = await this.repository.findByRouteAndCity(routeId, cityId);
      if (association) {
        await this.update(association.routeCityId, { order });
      }
    }
  }

  async getAvailableCitiesForRoute(routeId: number): Promise<any[]> {
    return this.repository.getAvailableCitiesForRoute(routeId);
  }
}
