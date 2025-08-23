import { Event } from '@/entities/Event';
import { CreateEventDto, UpdateEventDto, EventResponseDto, CityNestedDto } from '@/dtos/EventDto';
import { BaseMapper } from '@/core/base/BaseMapper';

export class EventMapper extends BaseMapper<Event> {
  static toEntity(createDto: CreateEventDto): Event {
    const event = new Event();
    event.cityId = createDto.cityId;
    event.nameTextRefId = createDto.nameTextRefId;
    event.descriptionTextRefId = createDto.descriptionTextRefId;
    event.locationTextRefId = createDto.locationTextRefId;
    event.eventDate = createDto.eventDate;
    event.timeTextRefId = createDto.timeTextRefId;
    event.imageUrl = createDto.imageUrl;
    return event;
  }

  static toEntityFromUpdate(entity: Event, dto: UpdateEventDto): void {
    if (dto.cityId !== undefined) entity.cityId = dto.cityId;
    if (dto.nameTextRefId !== undefined) entity.nameTextRefId = dto.nameTextRefId;
    if (dto.descriptionTextRefId !== undefined) entity.descriptionTextRefId = dto.descriptionTextRefId;
    if (dto.locationTextRefId !== undefined) entity.locationTextRefId = dto.locationTextRefId;
    if (dto.eventDate !== undefined) entity.eventDate = dto.eventDate;
    if (dto.timeTextRefId !== undefined) entity.timeTextRefId = dto.timeTextRefId;
    if (dto.imageUrl !== undefined) entity.imageUrl = dto.imageUrl;
  }

  static toResponseDto(entity: Event): EventResponseDto {
    const cityDto: CityNestedDto | undefined = entity.city ? {
      cityId: entity.city.cityId,
      nameTextRefId: entity.city.nameTextRefId,
      state: entity.city.state,
      name: (entity.city as any).name // Localized name from BaseService
    } : undefined;

    return {
      id: entity.eventId,
      eventId: entity.eventId,
      cityId: entity.cityId,
      nameTextRefId: entity.nameTextRefId,
      descriptionTextRefId: entity.descriptionTextRefId,
      locationTextRefId: entity.locationTextRefId,
      eventDate: entity.eventDate,
      timeTextRefId: entity.timeTextRefId,
      imageUrl: entity.imageUrl,
      city: cityDto,
      name: (entity as any).name, // Localized name from BaseService
      description: (entity as any).description, // Localized description from BaseService
      location: (entity as any).location, // Localized location from BaseService
      time: (entity as any).time, // Localized time from BaseService
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      isDeleted: entity.isDeleted
    };
  }
}
