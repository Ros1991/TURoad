import { BaseService } from '@/core/base/BaseService';
import { StoryLocation } from '@/entities/StoryLocation';
import { StoryLocationRepository } from '@/repositories/StoryLocationRepository';
import { StoryLocationMapper } from '@/mappers/StoryLocationMapper';

export class StoryLocationService extends BaseService<StoryLocation> {
  constructor() {
    super(StoryLocation);
    this.repository = new StoryLocationRepository();
    this.baseMapper = new StoryLocationMapper();
  }
}
