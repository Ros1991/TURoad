import { BaseMapper } from '@/core/base/BaseMapper';
import { StoryEvent } from '@/entities/StoryEvent';

export class StoryEventMapper extends BaseMapper<StoryEvent> {
  constructor() {
    super();
  }

  override toResponseDto(entity: StoryEvent): any {
    return {
      storyEventId: entity.storyEventId,
      name: (entity as any).name || '',
      nameTextRefId: entity.nameTextRefId,
      description: (entity as any).description || '',
      descriptionTextRefId: entity.descriptionTextRefId,
      audioUrl: (entity as any).audioUrl || '',
      audioUrlRefId: entity.audioUrlRefId,
      eventId: entity.eventId
    };
  }

  override toEntity(dto: any): StoryEvent {
    const entity = new StoryEvent();
    entity.storyEventId = dto.storyEventId;
    entity.nameTextRefId = dto.nameTextRefId;
    entity.descriptionTextRefId = dto.descriptionTextRefId;
    entity.audioUrlRefId = dto.audioUrlRefId;
    entity.eventId = dto.eventId;
    return entity;
  }
}
