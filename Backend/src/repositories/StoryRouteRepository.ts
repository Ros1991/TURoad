import { BaseRepository } from '@/core/base/BaseRepository';
import { StoryRoute } from '@/entities/StoryRoute';
import { PaginationRequestVO } from '@/core/base/BaseVO';
import { ListResponseVO } from '@/core/base/BaseVO';

export class StoryRouteRepository extends BaseRepository<StoryRoute> {
  constructor() {
    super(StoryRoute);
  }

  async findByRouteId(routeId: number): Promise<StoryRoute[]> {
    return this.repository.find({
      where: { routeId },
      order: { createdAt: 'DESC' }
    });
  }

  async findByRouteIdWithPagination(
    routeId: number,
    page: number = 1,
    limit: number = 10,
    searchQuery?: string
  ): Promise<ListResponseVO<StoryRoute>> {
    const queryBuilder = this.repository.createQueryBuilder('story');
    
    queryBuilder.where('story.routeId = :routeId', { routeId });
    
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
    
    return new ListResponseVO<StoryRoute>(items, pagination, total);
  }
}
