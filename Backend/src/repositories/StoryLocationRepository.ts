import { BaseRepository } from '@/core/base/BaseRepository';
import { StoryLocation } from '@/entities/StoryLocation';
import { PaginationRequestVO } from '@/core/base/BaseVO';
import { ListResponseVO } from '@/core/base/BaseVO';

export class StoryLocationRepository extends BaseRepository<StoryLocation> {
  constructor() {
    super(StoryLocation);
  }

  async findByLocationId(locationId: number): Promise<StoryLocation[]> {
    return this.repository.find({
      where: { locationId },
      order: { createdAt: 'DESC' }
    });
  }

  async findByLocationIdWithPagination(
    locationId: number,
    page: number = 1,
    limit: number = 10,
    searchQuery?: string
  ): Promise<ListResponseVO<StoryLocation>> {
    const queryBuilder = this.repository.createQueryBuilder('story');
    
    queryBuilder.where('story.locationId = :locationId', { locationId });
    
    if (searchQuery) {
      queryBuilder.andWhere(
        '(story.nameTextRefId IN (SELECT referenceId FROM localized_texts WHERE textContent ILIKE :search))',
        { search: `%${searchQuery}%` }
      );
    }
    
    queryBuilder.orderBy('story.createdAt', 'DESC');
    queryBuilder.skip((page - 1) * limit).take(limit);
    
    const [items, total] = await queryBuilder.getManyAndCount();
    const pagination = new PaginationRequestVO({ page, limit });
    
    return new ListResponseVO<StoryLocation>(items, pagination, total);
  }
}
