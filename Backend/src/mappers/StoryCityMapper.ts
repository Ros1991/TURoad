import { BaseMapper } from '@/core/base/BaseMapper';
import { StoryCity } from '@/entities/StoryCity';

export class StoryCityMapper extends BaseMapper<StoryCity> {
  constructor() {
    super();
  }

  override toResponseDto(entity: StoryCity): any {
    return {
      storyCityId: entity.storyCityId,
      name: (entity as any).name || '',
      nameTextRefId: entity.nameTextRefId,
      description: (entity as any).description || '',
      descriptionTextRefId: entity.descriptionTextRefId,
      audioUrl: (entity as any).audioUrl || '',
      audioUrlRefId: entity.audioUrlRefId,
      cityId: entity.cityId
    };
  }

  override toEntity(dto: any): StoryCity {
    const entity = new StoryCity();
    entity.storyCityId = dto.storyCityId;
    entity.nameTextRefId = dto.nameTextRefId;
    entity.descriptionTextRefId = dto.descriptionTextRefId;
    entity.audioUrlRefId = dto.audioUrlRefId;
    entity.cityId = dto.cityId;
    return entity;
  }
}
