import { BaseService } from '@/core/base/BaseService';
import { StoryEvent } from '@/entities/StoryEvent';
import { StoryEventRepository } from '@/repositories/StoryEventRepository';
import { StoryEventMapper } from '@/mappers/StoryEventMapper';

export class StoryEventService extends BaseService<StoryEvent> {
  constructor() {
    super(StoryEvent);
    this.repository = new StoryEventRepository();
    this.baseMapper = new StoryEventMapper();
  }
}
