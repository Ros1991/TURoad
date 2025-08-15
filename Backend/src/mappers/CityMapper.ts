import { City } from '@/entities/City';
import { CreateCityDto, UpdateCityDto, CityResponseDto } from '@/dtos/CityDto';
import { BaseMapper } from '@/core/base/BaseMapper';

export class CityMapper extends BaseMapper<City> {
  static toEntity(createDto: CreateCityDto): City {
    const city = new City();
    city.nameTextRefId = createDto.nameTextRefId;
    city.descriptionTextRefId = createDto.descriptionTextRefId;
    city.latitude = createDto.latitude;
    city.longitude = createDto.longitude;
    city.state = createDto.state;
    city.imageUrl = createDto.imageUrl;
    city.whatToObserveTextRefId = createDto.whatToObserveTextRefId;
    return city;
  }

  static toEntityFromUpdate(entity: City, dto: UpdateCityDto): void {
    if (dto.nameTextRefId !== undefined) entity.nameTextRefId = dto.nameTextRefId;
    if (dto.descriptionTextRefId !== undefined) entity.descriptionTextRefId = dto.descriptionTextRefId;
    if (dto.latitude !== undefined) entity.latitude = dto.latitude;
    if (dto.longitude !== undefined) entity.longitude = dto.longitude;
    if (dto.state !== undefined) entity.state = dto.state;
    if (dto.imageUrl !== undefined) entity.imageUrl = dto.imageUrl;
    if (dto.whatToObserveTextRefId !== undefined) entity.whatToObserveTextRefId = dto.whatToObserveTextRefId;
  }

  static toResponseDto(entity: City): CityResponseDto {
    return {
      id: entity.cityId,
      cityId: entity.cityId,
      nameTextRefId: entity.nameTextRefId,
      descriptionTextRefId: entity.descriptionTextRefId,
      latitude: entity.latitude,
      longitude: entity.longitude,
      state: entity.state,
      imageUrl: entity.imageUrl,
      whatToObserveTextRefId: entity.whatToObserveTextRefId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      isDeleted: entity.isDeleted
    };
  }
}
