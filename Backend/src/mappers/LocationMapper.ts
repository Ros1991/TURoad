import { Location } from '@/entities/Location';
import { CreateLocationDto, UpdateLocationDto, LocationResponseDto, CityNestedDto } from '@/dtos/LocationDto';
import { BaseMapper } from '@/core/base/BaseMapper';

export class LocationMapper extends BaseMapper<Location> {
  static toEntity(createDto: CreateLocationDto): Location {
    const location = new Location();
    location.cityId = createDto.cityId;
    location.nameTextRefId = createDto.nameTextRefId;
    location.descriptionTextRefId = createDto.descriptionTextRefId;
    location.latitude = createDto.latitude;
    location.longitude = createDto.longitude;
    location.typeId = createDto.typeId;
    return location;
  }

  static toEntityFromUpdate(entity: Location, dto: UpdateLocationDto): void {
    if (dto.cityId !== undefined) entity.cityId = dto.cityId;
    if (dto.nameTextRefId !== undefined) entity.nameTextRefId = dto.nameTextRefId;
    if (dto.descriptionTextRefId !== undefined) entity.descriptionTextRefId = dto.descriptionTextRefId;
    if (dto.latitude !== undefined) entity.latitude = dto.latitude;
    if (dto.longitude !== undefined) entity.longitude = dto.longitude;
    if (dto.typeId !== undefined) entity.typeId = dto.typeId;
  }

  static toResponseDto(entity: Location): LocationResponseDto {
    const cityDto: CityNestedDto | undefined = entity.city ? {
      cityId: entity.city.cityId,
      nameTextRefId: entity.city.nameTextRefId,
      state: entity.city.state,
      name: (entity.city as any).name // Localized name from BaseService
    } : undefined;

    return {
      id: entity.locationId,
      locationId: entity.locationId,
      cityId: entity.cityId,
      nameTextRefId: entity.nameTextRefId,
      descriptionTextRefId: entity.descriptionTextRefId,
      latitude: entity.latitude,
      longitude: entity.longitude,
      typeId: entity.typeId,
      imageUrl: entity.imageUrl,
      city: cityDto,
      name: (entity as any).name, // Localized name from BaseService
      description: (entity as any).description, // Localized description from BaseService
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      isDeleted: entity.isDeleted
    };
  }
}
