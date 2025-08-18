import { BaseMapper } from '@/core/base/BaseMapper';
import { StoryLocation } from '@/entities/StoryLocation';

export class StoryLocationMapper extends BaseMapper<StoryLocation> {
  constructor() {
    super();
  }

  override toResponseDto(entity: StoryLocation): any {
    return {
      storyLocationId: entity.storyLocationId,
      name: (entity as any).name || '',
      nameTextRefId: entity.nameTextRefId,
      description: (entity as any).description || '',
      descriptionTextRefId: entity.descriptionTextRefId,
      audioUrl: (entity as any).audioUrl || '',
      audioUrlRefId: entity.audioUrlRefId,
      locationId: entity.locationId
    };
  }

  override toEntity(dto: any): StoryLocation {
    const entity = new StoryLocation();
    entity.storyLocationId = dto.storyLocationId;
    entity.nameTextRefId = dto.nameTextRefId;
    entity.descriptionTextRefId = dto.descriptionTextRefId;
    entity.audioUrlRefId = dto.audioUrlRefId;
    entity.locationId = dto.locationId;
    return entity;
  }
}
