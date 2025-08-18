import { BaseService } from '@/core/base/BaseService';
import { StoryRoute } from '@/entities/StoryRoute';
import { StoryRouteRepository } from '@/repositories/StoryRouteRepository';
import { StoryRouteMapper } from '@/mappers/StoryRouteMapper';

export class StoryRouteService extends BaseService<StoryRoute> {
  constructor() {
    super(StoryRoute);
    this.repository = new StoryRouteRepository();
    this.baseMapper = new StoryRouteMapper();
  }
}
