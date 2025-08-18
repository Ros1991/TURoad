import { BaseMapper } from '@/core/base/BaseMapper';
import { StoryRoute } from '@/entities/StoryRoute';

export class StoryRouteMapper extends BaseMapper<StoryRoute> {
  constructor() {
    super();
  }

  override toResponseDto(entity: StoryRoute): any {
    return {
      storyRouteId: entity.storyRouteId,
      name: (entity as any).name || '',
      nameTextRefId: entity.nameTextRefId,
      description: (entity as any).description || '',
      descriptionTextRefId: entity.descriptionTextRefId,
      audioUrl: (entity as any).audioUrl || '',
      audioUrlRefId: entity.audioUrlRefId,
      routeId: entity.routeId
    };
  }

  override toEntity(dto: any): StoryRoute {
    const entity = new StoryRoute();
    entity.storyRouteId = dto.storyRouteId;
    entity.nameTextRefId = dto.nameTextRefId;
    entity.descriptionTextRefId = dto.descriptionTextRefId;
    entity.audioUrlRefId = dto.audioUrlRefId;
    entity.routeId = dto.routeId;
    return entity;
  }
}
