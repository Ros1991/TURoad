import { Event } from '@/entities/Event';
import { CreateEventDto, UpdateEventDto, EventResponseDto } from '@/dtos/EventDto';
import { BaseMapper } from '@/core/base/BaseMapper';

export class EventMapper extends BaseMapper<Event> {
  static toEntity(createDto: CreateEventDto): Event {
    const event = new Event();
    event.cityId = createDto.cityId;
    event.nameTextRefId = createDto.nameTextRefId;
    event.descriptionTextRefId = createDto.descriptionTextRefId;
    event.locationTextRefId = createDto.locationTextRefId;
    event.eventDate = createDto.eventDate;
    event.eventTime = createDto.eventTime;
    event.imageUrl = createDto.imageUrl;
    return event;
  }

  static toEntityFromUpdate(entity: Event, dto: UpdateEventDto): void {
    if (dto.cityId !== undefined) entity.cityId = dto.cityId;
    if (dto.nameTextRefId !== undefined) entity.nameTextRefId = dto.nameTextRefId;
    if (dto.descriptionTextRefId !== undefined) entity.descriptionTextRefId = dto.descriptionTextRefId;
    if (dto.locationTextRefId !== undefined) entity.locationTextRefId = dto.locationTextRefId;
    if (dto.eventDate !== undefined) entity.eventDate = dto.eventDate;
    if (dto.eventTime !== undefined) entity.eventTime = dto.eventTime;
    if (dto.imageUrl !== undefined) entity.imageUrl = dto.imageUrl;
  }

  static toResponseDto(entity: Event): EventResponseDto {
    return {
      id: entity.eventId,
      eventId: entity.eventId,
      cityId: entity.cityId,
      nameTextRefId: entity.nameTextRefId,
      descriptionTextRefId: entity.descriptionTextRefId,
      locationTextRefId: entity.locationTextRefId,
      eventDate: entity.eventDate,
      eventTime: entity.eventTime,
      imageUrl: entity.imageUrl,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      isDeleted: entity.isDeleted
    };
  }
}
