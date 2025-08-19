import { BaseRepository } from '@/core/base/BaseRepository';
import { Event } from '@/entities/Event';
import { SelectQueryBuilder, FindManyOptions } from 'typeorm';
import { PaginationRequestVO, ListResponseVO } from '@/core/base/BaseVO';

export class EventRepository extends BaseRepository<Event> {
  constructor() {
    super(Event, 'eventId');
  }

  // Override findWithPagination to always include city relations
  override async findWithPagination(
    pagination: PaginationRequestVO & { search?: any }, 
    options?: FindManyOptions<Event>,
  ): Promise<ListResponseVO<Event>> {
    // Ensure city relation is always included
    const optionsWithCity = {
      ...options,
      relations: {
        ...options?.relations,
        city: true
      }
    };
    
    return super.findWithPagination(pagination, optionsWithCity);
  }

  protected override applySearch(qb: SelectQueryBuilder<Event>, search: any): void {
    if(search && search.search && search.search.length > 0) {
      qb.distinct(true)
        .leftJoin('localized_texts', 'lt', 'lt.reference_id = entity.name_text_ref_id OR lt.reference_id = entity.description_text_ref_id')
        .andWhere('(lt.text_content ILIKE :search AND lt.language_code = :language)', { 
          search: `%${search.search}%`,
          language: 'pt'
        });
    }
  }
}

// Export singleton instance
export const eventRepository = new EventRepository();
