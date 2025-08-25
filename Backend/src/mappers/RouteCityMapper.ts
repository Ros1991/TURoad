import { BaseMapper } from '@/core/base/BaseMapper';
import { RouteCity } from '@/entities/RouteCity';
import { IDto } from '@/core/base/BaseDto';

export interface RouteCityDto extends IDto {
  routeCityId: number;
  routeId: number;
  cityId: number;
  order: number;
  distanceKm?: number;
  travelTimeMinutes?: number;
  city?: {
    cityId: number;
    name: string;
  };
  route?: {
    routeId: number;
    title: string;
  };
}

export class RouteCityMapper extends BaseMapper<RouteCity> {
  toDto(entity: RouteCity): RouteCityDto {
    return {
      routeCityId: entity.routeCityId,
      routeId: entity.routeId,
      cityId: entity.cityId,
      order: entity.order,
      distanceKm: entity.distanceKm,
      travelTimeMinutes: entity.travelTimeMinutes,
      city: entity.city ? {
        cityId: entity.city.cityId,
        name: (entity.city as any).name || `City ${entity.city.cityId}`
      } : undefined,
      route: entity.route ? {
        routeId: entity.route.routeId,
        title: (entity.route as any).title || `Route ${entity.route.routeId}`
      } : undefined
    };
  }

  override toEntity(dto: RouteCityDto): RouteCity {
    const entity = new RouteCity();
    entity.routeCityId = dto.routeCityId;
    entity.routeId = dto.routeId;
    entity.cityId = dto.cityId;
    entity.order = dto.order;
    entity.distanceKm = dto.distanceKm;
    entity.travelTimeMinutes = dto.travelTimeMinutes;
    return entity;
  }
}
