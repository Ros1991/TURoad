import { BaseRepository } from '@/core/base/BaseRepository';
import { StoryCity } from '@/entities/StoryCity';
import { PaginationRequestVO } from '@/core/base/BaseVO';
import { ListResponseVO } from '@/core/base/BaseVO';

export class StoryCityRepository extends BaseRepository<StoryCity> {
  constructor() {
    super(StoryCity);
  }

  async findByCityId(cityId: number): Promise<StoryCity[]> {
    return this.repository.find({
      where: { cityId },
      order: { createdAt: 'DESC' }
    });
  }

  async findByCityIdWithPagination(
    cityId: number,
    page: number = 1,
    limit: number = 10,
    searchQuery?: string
  ): Promise<ListResponseVO<StoryCity>> {
    const queryBuilder = this.repository.createQueryBuilder('story');
    
    queryBuilder.where('story.cityId = :cityId', { cityId });
    
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
    
    return new ListResponseVO<StoryCity>(items, pagination, total);
  }
}
