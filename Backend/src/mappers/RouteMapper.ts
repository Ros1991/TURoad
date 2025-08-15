import { Route } from '@/entities/Route';
import { CreateRouteDto, UpdateRouteDto, RouteResponseDto } from '@/dtos/RouteDto';
import { BaseMapper } from '@/core/base/BaseMapper';

export class RouteMapper extends BaseMapper<Route> {
  static toEntity(createDto: CreateRouteDto): Route {
    const route = new Route();
    route.titleTextRefId = createDto.titleTextRefId;
    route.descriptionTextRefId = createDto.descriptionTextRefId;
    route.whatToObserveTextRefId = createDto.whatToObserveTextRefId;
    return route;
  }

  static toEntityFromUpdate(entity: Route, dto: UpdateRouteDto): void {
    if (dto.titleTextRefId !== undefined) entity.titleTextRefId = dto.titleTextRefId;
    if (dto.descriptionTextRefId !== undefined) entity.descriptionTextRefId = dto.descriptionTextRefId;
    if (dto.whatToObserveTextRefId !== undefined) entity.whatToObserveTextRefId = dto.whatToObserveTextRefId;
  }

  static toResponseDto(entity: Route): RouteResponseDto {
    return {
      id: entity.routeId,
      routeId: entity.routeId,
      titleTextRefId: entity.titleTextRefId,
      descriptionTextRefId: entity.descriptionTextRefId,
      whatToObserveTextRefId: entity.whatToObserveTextRefId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      isDeleted: entity.isDeleted
    };
  }
}
