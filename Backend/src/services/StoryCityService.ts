import { BaseService } from '@/core/base/BaseService';
import { StoryCity } from '@/entities/StoryCity';
import { StoryCityRepository } from '@/repositories/StoryCityRepository';
import { StoryCityMapper } from '@/mappers/StoryCityMapper';

export class StoryCityService extends BaseService<StoryCity> {
  constructor() {
    super(StoryCity);
    this.repository = new StoryCityRepository();
    this.baseMapper = new StoryCityMapper();
  }
}
