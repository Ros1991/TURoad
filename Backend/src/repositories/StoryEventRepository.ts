import { BaseRepository } from '@/core/base/BaseRepository';
import { StoryEvent } from '@/entities/StoryEvent';
import { PaginationRequestVO } from '@/core/base/BaseVO';
import { ListResponseVO } from '@/core/base/BaseVO';

export class StoryEventRepository extends BaseRepository<StoryEvent> {
  constructor() {
    super(StoryEvent);
  }

  async findByEventId(eventId: number): Promise<StoryEvent[]> {
    return this.repository.find({
      where: { eventId },
      order: { createdAt: 'DESC' }
    });
  }

  async findByEventIdWithPagination(
    eventId: number,
    page: number = 1,
    limit: number = 10,
    searchQuery?: string
  ): Promise<ListResponseVO<StoryEvent>> {
    const queryBuilder = this.repository.createQueryBuilder('story');
    
    queryBuilder.where('story.eventId = :eventId', { eventId });
    
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
    
    return new ListResponseVO<StoryEvent>(items, pagination, total);
  }
}
